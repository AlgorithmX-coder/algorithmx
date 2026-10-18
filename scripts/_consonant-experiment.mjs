/* WHICH generation strategy actually keeps the last consonant?
 *
 * Owner: "it stops at MAS, instead of MASK. So you can definitely tell the
 * difference." So a short tail on a stop-final word is a real truncation, not
 * a naturally unreleased stop, and weeks 3-5 hold on the order of 1,400 of
 * them. Re-recording 58 clips barely moved the count, so before spending
 * anything at that scale this measures what actually works.
 *
 * Each test sentence ends in a word known to come out truncated. Each
 * strategy generates it, and the tail after the final word is measured the
 * same way the sweep measures it. Benchmarks from ground truth: a present
 * consonant runs 80-320ms, a truncated one 20-40ms.
 *
 *   node --env-file=.env.local scripts/_consonant-experiment.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = "oClOrzqamOXmtcB8iqTj";          // Emma
const OUT = ".consonant-exp";
const SR = 16000;

/* Real lines from week 3 whose final consonant the sweep says is gone. */
const CASES = [
  { id: "mask", text: "On your first challenge, you learn to peek behind the mask!" },
  { id: "talk", text: "A brand-new account with no friends you know. How does it talk?" },
  { id: "drop", text: "One tap and the whole thing is a drop." },
  { id: "best", text: "Checking first is what a hero does best." },
];

const BASE = { stability: 0.6, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 };

/* A trailing filler makes the target word stop being phrase-final, which is
 * where the model swallows it. The filler is cut off afterwards. */
const FILLER = " Okay.";

const STRATEGIES = [
  { id: "baseline", model: "eleven_v3", settings: BASE, suffix: "" },
  { id: "speed-1.0", model: "eleven_v3", settings: { ...BASE, speed: 1.0 }, suffix: "" },
  { id: "stability-.75", model: "eleven_v3", settings: { ...BASE, stability: 0.75 }, suffix: "" },
  { id: "filler-trim", model: "eleven_v3", settings: BASE, suffix: FILLER },
  { id: "multilingual", model: "eleven_multilingual_v2", settings: BASE, suffix: "" },
  { id: "filler+speed1", model: "eleven_v3", settings: { ...BASE, speed: 1.0 }, suffix: FILLER },
];

function pcm(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout) return null;
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}

/** Tail after the last loud speech, as the sweep measures it. For the filler
 *  strategy the target word is the SECOND-last span, so take that one. */
function tails(a) {
  const win = Math.round(SR * 0.02);
  const lvl = (i0) => { let s = 0, c = 0; for (let i = i0; i < Math.min(a.length, i0 + win); i++) { s += a[i] * a[i]; c++; } return c ? Math.sqrt(s / c) : 0; };
  let peak = 0;
  for (let i = 0; i + win < a.length; i += win) peak = Math.max(peak, lvl(i));
  const loud = peak * 0.06, floor = peak * 0.008;
  const out = [];
  let i = 0;
  while (i + win < a.length) {
    while (i + win < a.length && lvl(i) <= loud) i += win;
    if (i + win >= a.length) break;
    while (i + win < a.length && lvl(i) > loud) i += win;
    const loudEnd = i;
    let t = loudEnd;
    while (t + win < a.length && lvl(t) > floor) t += win;
    out.push(Math.round(((t - loudEnd) / SR) * 1000));
    i = Math.max(t, loudEnd + win);
  }
  return out;
}

await mkdir(OUT, { recursive: true });
const results = {};

for (const s of STRATEGIES) {
  results[s.id] = [];
  for (const c of CASES) {
    const file = `${OUT}/${c.id}-${s.id}.mp3`;
    const body = {
      text: c.text + s.suffix,
      model_id: s.model,
      voice_settings: s.settings,
    };
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) { console.log(`  ${s.id}/${c.id}: HTTP ${r.status}`); results[s.id].push(null); continue; }
    await writeFile(file, Buffer.from(await r.arrayBuffer()));
    const a = pcm(file);
    if (!a) { results[s.id].push(null); continue; }
    const t = tails(a);
    /* With a filler appended, the word under test ends the second-last span. */
    const target = s.suffix ? (t.length >= 2 ? t[t.length - 2] : t[t.length - 1]) : t[t.length - 1];
    results[s.id].push(target ?? null);
  }
  console.log(`${s.id.padEnd(15)} ${results[s.id].map((v) => String(v ?? "-").padStart(5)).join("")}`);
}

console.log(`\n${"strategy".padEnd(15)} ${CASES.map((c) => c.id.padStart(5)).join("")}   mean`);
for (const s of STRATEGIES) {
  const v = results[s.id].filter((x) => x != null);
  const mean = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
  console.log(`${s.id.padEnd(15)} ${results[s.id].map((x) => String(x ?? "-").padStart(5)).join("")}  ${String(mean).padStart(5)}ms`);
}
console.log(`\nBenchmarks from ground truth: truncated 20-40ms, present 80-320ms.`);
console.log(`Audio kept in ${OUT}/ so the winner can be listened to before rollout.`);

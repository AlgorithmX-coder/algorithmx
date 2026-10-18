/* Measure ONE named word's ending, in the raw delivery and in the shipped clip.
 *
 * Every instrument so far has been indirect - tail lengths, abrupt endings,
 * span counts - and each gave a different answer. Word timings are direct:
 * ask the transcript where "mask" ends, then look at the audio there. The
 * transcript is cached from generation (.stt-cache, keyed by file hash), so
 * this usually costs nothing; a cache miss is one STT call.
 *
 *   node scripts/_word-probe.mjs <key> mask
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const [KEY, WORD] = process.argv.slice(2);
const SR = 16000;
const STT_CACHE = ".stt-cache";
const API = process.env.ELEVENLABS_API_KEY;

async function words(file) {
  const buf = await readFile(file);
  const k = createHash("sha1").update(buf).digest("hex").slice(0, 20);
  const cached = join(STT_CACHE, `${k}.json`);
  try { return JSON.parse(await readFile(cached, "utf8")); } catch {}
  if (!API) { console.log(`  (no transcript cached for ${file} and no API key set)`); return null; }
  const fd = new FormData();
  fd.append("model_id", "scribe_v1");
  fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": API }, body: fd });
  if (!r.ok) { console.log(`  STT failed ${r.status}`); return null; }
  const j = await r.json();
  const w = (j.words || []).filter((x) => x.type === "word" && Number.isFinite(x.start)).map((x) => ({ text: x.text, start: x.start, end: x.end }));
  await mkdir(STT_CACHE, { recursive: true });
  await writeFile(cached, JSON.stringify(w));
  return w;
}

function pcm(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout) return null;
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}

/** Level profile around a moment, as a share of the clip's peak. */
function profile(a, at) {
  const win = Math.round(SR * 0.02);
  const lvl = (i0) => { let s = 0, c = 0; for (let i = Math.max(0, i0); i < Math.min(a.length, i0 + win); i++) { s += a[i] * a[i]; c++; } return c ? Math.sqrt(s / c) : 0; };
  let peak = 0;
  for (let i = 0; i + win < a.length; i += win) peak = Math.max(peak, lvl(i));
  const centre = Math.round(at * SR);
  const out = [];
  for (let d = -4; d <= 8; d++) out.push({ ms: d * 20, pct: peak ? (lvl(centre + d * win) / peak) * 100 : 0 });
  return out;
}

for (const [label, file] of [["raw (ElevenLabs)", `public/audio/voice/${KEY}.mp3.preshape.mp3`], ["shaped (shipped)", `public/audio/voice/${KEY}.mp3`]]) {
  console.log(`\n=== ${label} ===`);
  const w = await words(file);
  const a = pcm(file);
  if (!w || !a) continue;
  const hits = w.filter((x) => x.text.toLowerCase().replace(/[^a-z]/g, "") === WORD.toLowerCase());
  if (!hits.length) { console.log(`  "${WORD}" not in transcript (${w.length} words)`); continue; }
  for (const h of hits) {
    console.log(`  "${h.text}" ends at ${h.end.toFixed(3)}s`);
    const p = profile(a, h.end);
    console.log("   offset from word end:  " + p.map((x) => String(x.ms).padStart(5)).join(""));
    console.log("   level (% of peak)   :  " + p.map((x) => String(Math.round(x.pct)).padStart(5)).join(""));
    const after = p.filter((x) => x.ms > 0 && x.ms <= 120).map((x) => x.pct);
    const sustained = after.filter((x) => x > 0.8).length;
    console.log(`   ${sustained >= 2 ? "consonant present after the vowel" : "NOTHING after the vowel - the ending is gone"}`);
  }
}

/**
 * EVERY word in EVERY clip, not one word per clip.
 *
 * Owner, 2026-10-18, on week 3's Mask Peek: "it didn't pronounce the K" - on
 * "mask", in the FIRST line of a clip with eight lines in it. And: "There are
 * so many words where the last letter is not being pronounced. And it's not
 * only S, so I want you to do a massive sweep and find every single one and
 * address why we're having this issue."
 *
 * WHY THE OLD GATE KEPT CALLING THE WEEK CLEAN. audit-consonant-integrity.mjs
 * measures ONE word per clip:
 *
 *     const word = w[w.length - 1];
 *
 * A clip is a whole narration block, so that is about one word in forty, and
 * a consonant missing anywhere else could never be reported. Every "weeks 3-5
 * are clean" I gave was true only of the words it actually looked at.
 *
 * WHAT THE CAUSE TURNED OUT TO BE, measured rather than argued. Two earlier
 * instruments disagreed, so this was settled with word timings on the exact
 * word the owner reported, in the raw ElevenLabs delivery AND the shipped
 * clip (--keep-raw leaves the raw behind):
 *
 *   level after the vowel, as a share of the clip's peak
 *   raw    "peek behind the mask!"   1%  1%  0  0  0     <- no /k/ AT ALL
 *   shaped "peek behind the mask!"   2%  1%  0  0  0     <- same
 *   raw    "TAP PEEK BEHIND THE MASK" 8% 16% 49% 41%     <- a real /k/
 *
 * The consonant is missing in what ElevenLabs DELIVERED. The shaping did not
 * take it; the model never said it. That is why re-recording fixes some of
 * them (8 of 11, in the earlier round) and why no amount of work on the
 * trimming thresholds ever closed this out. It is also why the three clips
 * that survived two retakes at exactly 60ms were NOT proof of a natural
 * ending, and the floor must not be tuned to them.
 *
 * HOW THIS IS FREE. Word timings are cached from generation (.stt-cache,
 * keyed by file hash) - 7,829 transcripts for 5,166 clips. So every word can
 * be checked without paying for transcription. A clip whose transcript is not
 * cached is reported as UNCHECKED, never as clean.
 *
 *   node scripts/audit-consonant-sweep.mjs --weeks=3
 *   node scripts/audit-consonant-sweep.mjs                  whole course
 *   node scripts/audit-consonant-sweep.mjs --weeks=3 --list  every measurement
 */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const WEEKS_ARG = (process.argv.find((a) => a.startsWith("--weeks=")) || "").split("=")[1];
const WEEKS = WEEKS_ARG ? WEEKS_ARG.split(",").map(Number) : null;
const LIST = process.argv.includes("--list");
const MANIFEST = "public/audio/voice/manifest.json";
const STT_CACHE = ".stt-cache";
const SR = 16000;

/* A consonant that is THERE reaches a few percent of the clip's peak in the
 * 140ms around the end of the word. Measured: a present /k/ runs 16-72%, an
 * absent one never leaves 0-4%. 6% is the speech floor used elsewhere in the
 * pipeline and sits clear of both. */
const PRESENT = 0.06;
const WINDOW_BEFORE = 0.02;
const WINDOW_AFTER = 0.14;

const VOICELESS_FINAL_S = new Set(["this", "yes", "gas", "bias", "atlas", "canvas", "chaos"]);

/** Does the spelling promise an unvoiced consonant a listener would miss? */
function expectsConsonant(word) {
  let w = String(word || "").toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return false;
  w = w.replace(/'s$/, "s").replace(/'/g, "");
  const whole = w;
  if (VOICELESS_FINAL_S.has(whole)) return true;
  if (/(ous|us)$/.test(whole)) return true;
  w = w.replace(/e$/, "");
  if (!w) return false;
  if (/ng$/.test(w)) return false;
  if (/(s|z|ch|sh|x|g)es$/.test(w)) return false;
  w = w.replace(/es$/, "s");
  if (/([pkfxs]|ss|ch|sh)ed$/.test(w)) return true;
  if (/(ough|augh)$/.test(w)) return /^(enough|tough|rough|laugh|cough|trough|slough)$/.test(w);
  if (/(igh|eigh)$/.test(w)) return false;
  if (/(ch|sh|th|ck|ph|gh)$/.test(w)) return true;
  if (/s$/.test(w)) return /(ss|[ptkfx]s)$/.test(w);
  return /[tkpfx]$/.test(w);
}

function pcm(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 4) return null;
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}

function analyser(a) {
  const win = Math.round(SR * 0.02);
  const lvl = (i0) => {
    let s = 0, c = 0;
    for (let i = Math.max(0, i0); i < Math.min(a.length, i0 + win); i++) { s += a[i] * a[i]; c++; }
    return c ? Math.sqrt(s / c) : 0;
  };
  let peak = 0;
  for (let i = 0; i + win < a.length; i += win) peak = Math.max(peak, lvl(i));
  return { peak, win, lvl };
}

/* The cache holds transcripts of the RAW deliveries, because the generator
 * transcribes before it shapes. The shipped files hash differently, so for
 * them it is a miss. --transcribe fills it in for the clips in scope; it is
 * a one-off per clip and a different meter from the voice tokens. */
const TRANSCRIBE = process.argv.includes("--transcribe");
const API = process.env.ELEVENLABS_API_KEY;
let spent = 0;

async function cachedWords(file) {
  let buf, k;
  try {
    buf = await readFile(file);
    k = createHash("sha1").update(buf).digest("hex").slice(0, 20);
    return JSON.parse(await readFile(join(STT_CACHE, `${k}.json`), "utf8"));
  } catch {}
  if (!TRANSCRIBE || !API || !buf) return null;
  try {
    const fd = new FormData();
    fd.append("model_id", "scribe_v1");
    fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": API }, body: fd });
    if (!r.ok) return null;
    const j = await r.json();
    const out = (j.words || []).filter((x) => x.type === "word" && Number.isFinite(x.start) && Number.isFinite(x.end)).map((x) => ({ text: x.text, start: x.start, end: x.end }));
    if (!out.length) return null;
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(STT_CACHE, { recursive: true });
    await writeFile(join(STT_CACHE, `${k}.json`), JSON.stringify(out));
    spent++;
    if (spent % 50 === 0) console.log(`  ... transcribed ${spent}`);
    return out;
  } catch { return null; }
}

const entries = JSON.parse(await readFile(MANIFEST, "utf8")).entries || [];

let inScope = null;
if (WEEKS) {
  inScope = new Set();
  for (const w of WEEKS) {
    let src;
    try { src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8"); } catch { continue; }
    for (const e of entries) {
      const probe = (e.lines && e.lines[0] ? e.lines[0] : e.text || "").replace(/\[[a-z ]*\]/gi, "").trim().slice(0, 30);
      if (probe && src.includes(probe)) inScope.add(e.filename || `${e.key}.mp3`);
    }
  }
}

const missing = [];
let clips = 0, checked = 0, words = 0, unchecked = 0;

for (const e of entries) {
  const name = e.filename || `${e.key}.mp3`;
  if (inScope && !inScope.has(name)) continue;
  clips++;
  const file = join("public", "audio", "voice", name);
  const w = await cachedWords(file);
  if (!w || !w.length) { unchecked++; continue; }
  const a = pcm(file);
  if (!a) { unchecked++; continue; }
  checked++;
  const { peak, win, lvl } = analyser(a);
  if (peak <= 0) continue;

  for (const word of w) {
    const bare = String(word.text || "").toLowerCase().replace(/[^a-z']/g, "");
    if (!expectsConsonant(bare)) continue;
    words++;
    let best = 0;
    for (let t = word.end - WINDOW_BEFORE; t <= word.end + WINDOW_AFTER; t += 0.02) {
      best = Math.max(best, lvl(Math.round(t * SR)) / peak);
    }
    if (LIST) console.log(`  ${(best * 100).toFixed(0).padStart(3)}%  ${word.text}  ${name} @${word.end.toFixed(2)}s`);
    if (best < PRESENT) missing.push({ name, word: word.text, at: word.end, pct: best * 100 });
  }
}

console.log(`\n${clips} clip(s) in scope; ${checked} checked, ${unchecked} UNCHECKED (no cached transcript).`);
console.log(`${words} word(s) that should end in an unvoiced consonant were measured.`);
if (unchecked) {
  console.log(`\nThe ${unchecked} unchecked clip(s) are a GAP, not a pass. Re-record them with`);
  console.log(`--keep-raw, or transcribe them, before trusting a clean result for that week.`);
}
if (!missing.length) {
  console.log("\nEvery one of those words has its consonant.");
  process.exit(unchecked ? 1 : 0);
}
missing.sort((x, y) => x.pct - y.pct);
console.log(`\n${missing.length} word(s) ARE MISSING their last sound:\n`);
for (const m of missing.slice(0, 80)) {
  console.log(`  ${m.pct.toFixed(0).padStart(3)}%  "${m.word}"  ${m.name} @${m.at.toFixed(2)}s`);
}
if (missing.length > 80) console.log(`  ... and ${missing.length - 80} more`);
process.exit(1);

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

/* MEASURE THE TAIL'S LENGTH, NOT ITS LOUDNESS.
 *
 * The first version of this took the peak level in the 140ms around the end
 * of the word and called anything under 6% missing. That flagged 847 words in
 * weeks 3-5, which would have meant 17.5% of every consonant in the course
 * was gone - and the giveaway was the histogram: a smooth spread from 0 to
 * 6%, not two populations with a gap. A real detector separates; mine was
 * cutting through the middle of one distribution.
 *
 * Ground truth settled it. Three flagged clips were regenerated with
 * --keep-raw and the words measured in both the raw delivery and the shipped
 * clip:
 *
 *   "talks." PRESENT   4  4  4  5  4  2  1  1  0     a plateau, then decay
 *   "mask."  ABSENT    1  1  0  0  0  0              straight to zero
 *
 * A real /s/ here lives at 4-5% of peak, UNDER the old line. Loudness scales
 * with how loud the clip is; what separates present from absent is whether
 * the low-level tail EXISTS and sustains. That is what the original
 * audit-consonant-integrity.mjs measured, and its measurement was right - its
 * coverage was the broken part (one word per clip). So: that measurement,
 * this coverage.
 *
 * FLOOR is the level a tail has to stay above to count as sound at all, as a
 * share of peak - well under the 4% a quiet /s/ sits at, well over the 0% of
 * true silence. MIN_TAIL is how long it must sustain. */
const FLOOR = 0.008;
/* 30ms, CALIBRATED BY THE OWNER'S EAR, not by my inference.
 *
 * Three points he confirmed by listening:
 *
 *   0ms   "...behind the mask!"  BROKEN  (a fresh generation)
 *   20ms  "...behind the mask!"  BROKEN  (the live clip he reported as "MAS")
 *   40ms  "...behind the mask!"  FINE    (filler appended, then trimmed)
 *
 * and 40ms read FINE on all three test words, not just one. So the boundary
 * is between 20 and 40, and 30 sits in it.
 *
 * My own guesses before this were 60ms here and 80/50ms in the older gate,
 * every one of them set from my inference rather than from anyone listening.
 * At 60ms this reported 490 words in week 3 alone and would have condemned
 * audio the owner says is fine. If this number ever moves again it moves
 * because someone listened, not because a distribution looked tidy. */
const MIN_TAIL = 0.03;
const WINDOW_BEFORE = 0.02;
const WINDOW_AFTER = 0.30;

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
    /* How long sound continues after the vowel stops. Walk forward from just
     * before the transcript's word end while the level stays above the noise
     * floor; the distance covered is the consonant. */
    let tail = 0;
    for (let t = word.end - WINDOW_BEFORE; t <= word.end + WINDOW_AFTER; t += 0.02) {
      if (lvl(Math.round(t * SR)) / peak > FLOOR) tail = t - (word.end - WINDOW_BEFORE);
      else if (tail > 0) break;   // sound started and then stopped: that is the end of it
    }
    if (LIST) console.log(`  ${(tail * 1000).toFixed(0).padStart(4)}ms  ${word.text}  ${name} @${word.end.toFixed(2)}s`);
    if (tail < MIN_TAIL) missing.push({ name, word: word.text, at: word.end, pct: tail * 1000 });
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

/* A HISTOGRAM, because the list below is capped and a capped list has been
 * misread as a count once already: the printed 80 were taken for the total
 * when the real figure was 846. The shape also says whether the threshold is
 * doing real work - a pile at 0-1% is audio that is genuinely absent, a pile
 * just under the line means the line is in the wrong place. */
const buckets = new Array(7).fill(0);
for (const m of missing) buckets[Math.min(6, Math.floor(m.pct/20))]++;
console.log(`\nTail length of the flagged words (ms):`);
for (let i = 0; i < 6; i++) {
  const bar = "#".repeat(Math.round((buckets[i] / Math.max(1, missing.length)) * 50));
  console.log(`  ${i*20}-${(i+1)*20}ms  ${String(buckets[i]).padStart(5)}  ${bar}`);
}

console.log(`\n${missing.length} word(s) ARE MISSING their last sound (showing the worst 80):\n`);
for (const m of missing.slice(0, 80)) {
  console.log(`  ${m.pct.toFixed(0).padStart(3)}%  "${m.word}"  ${m.name} @${m.at.toFixed(2)}s`);
}
if (missing.length > 80) console.log(`  ... and ${missing.length - 80} more`);
process.exit(1);

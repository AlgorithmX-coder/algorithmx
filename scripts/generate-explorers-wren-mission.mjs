// Generate WREN's narration for one Cyber Explorers mission from its saved,
// tagged script (scripts/wren-voice-scripts/missionNN.mjs) — the SAME
// pipeline built for the ATLAS block intros: eleven_v3 for an emotional arc
// instead of one flat tone, word-timestamp-anchored trim + a short fade so
// clips end naturally instead of either a trailing breath or an abrupt cut.
//
// Owner, 2026-10-18 (WREN): "she sounds far too monotone... she needs a lot
// more enthusiasm... the script needs the correct punctuation... and
// ElevenLabs needs to be reading directly from that script."
//
// Usage:
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01 --only /audio/wren/m01-c1-b1.mp3
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01 --dry
//   ... 01 --takes 3 --log receipt.json   (3 clean takes per clip, closest to her
//   typical pitch and pace kept; per-clip receipt of voice, settings, transcript)
// Git Bash rewrites "/audio/..." arguments into Windows paths: prefix MSYS_NO_PATHCONV=1.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
// --log <file>: per-clip receipt (tag, voice, settings, take, transcript match, fade point, LUFS)
const logIdx = process.argv.indexOf("--log");
const logPath = logIdx >= 0 ? process.argv[logIdx + 1] : null;
// --takes N: record N clean takes per clip and keep the one closest to her
// typical pitch and pace, so neighbouring lines sound like one delivery.
const takesIdx = process.argv.indexOf("--takes");
const TAKES = takesIdx >= 0 ? Math.max(1, Number(process.argv[takesIdx + 1])) : 1;
const missionArg = process.argv.slice(2).find((a, i, all) => /^\d+$/.test(a) && all[i - 1] !== "--log" && all[i - 1] !== "--takes");
if (!missionArg) {
  console.error("usage: node scripts/generate-explorers-wren-mission.mjs <NN> [--only <path>] [--dry]");
  process.exit(2);
}
const missionNo = missionArg.padStart(2, "0");

const { [`mission${missionNo}VoiceScripts`]: scripts } = await import(`./wren-voice-scripts/mission${missionNo}.mjs`);
if (!scripts) {
  console.error(`scripts/wren-voice-scripts/mission${missionNo}.mjs must export mission${missionNo}VoiceScripts`);
  process.exit(2);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !DRY) {
  console.error("ELEVENLABS_API_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}

const VOICE_ID = "trTZq8BsN25LRj9YD7fR"; // WREN — ARC Handler (Cyber Explorers)
const MODEL_ID = "eleven_v3";
// UAT 2026-11 (Missions 2 and 4: "tone changes"): 0.4 is below v3's "Natural"
// preset and let her delivery swing take to take. 0.5 = Natural.
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.78, style: 0.5, use_speaker_boost: true };
const OUT_DIR = join("public", "audio", "wren");
// The STT word end lands on the vowel, before the release of a final
// consonant: fading 0.05s after it clipped "mask" mid-k (UAT Case 007). The
// fade now starts after the audio itself has gone quiet, never before
// word end + MIN_TAIL.
const MIN_TAIL = 0.12;
const FADE_DUR = 0.3;
const QUIET_DB = -45;
// Every clip is normalised to the same loudness, so no line jumps out
// louder or quieter than the one before it (m02-c7-play sat at -20.3 LUFS).
const TARGET_LUFS = -16;
// A take whose transcript doesn't match the script is regenerated.
// The letter match passes a dropped "-ed" or a swapped pronoun ("her" said as
// "your"), so takes are also checked word by word and retaken on a slip.
const MIN_MATCH = 0.9;
const MAX_TAKES = 4;
// v3 reads a mid-clip [tag] as a tone change, so clips carry one tag at the start.
const ONE_TAG = /^\[[a-z ]+\][^[]*$/;

async function generate(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) throw new Error(`generate: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function wordTimestamps(buf) {
  const fd = new FormData();
  fd.append("model_id", "scribe_v1");
  fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: fd });
  if (!r.ok) throw new Error(`stt: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return { words: (j.words || []).filter((w) => w.type === "word" && Number.isFinite(w.end)), text: j.text || "" };
}

/** "50,000" -> "fifty thousand", so a transcript's digits match a script's words. */
function numberWords(n) {
  const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
  const TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
  const under1000 = (x) => {
    const h = Math.floor(x / 100), r = x % 100;
    const rest = r < 20 ? (r || h ? (r ? ONES[r] : "") : "zero") : TENS[Math.floor(r / 10)] + (r % 10 ? ONES[r % 10] : "");
    return (h ? ONES[h] + "hundred" : "") + rest;
  };
  if (n >= 1e6) return String(n);
  const th = Math.floor(n / 1000);
  return (th ? under1000(th) + "thousand" : "") + (n % 1000 || !th ? under1000(n % 1000) : "");
}

/** Share of the script's letters heard in order (LCS), 0..1. Letters only, so
 *  "SKINSTORM" transcribed as "Skin Storm" still counts as a match, and
 *  numbers count the same whether written as digits or words. */
function matchScore(script, heard) {
  const norm = (s) => s.replace(/\[[a-z ]+\]/g, "").toLowerCase()
    .replace(/\d[\d,]*/g, (d) => numberWords(Number(d.replace(/,/g, ""))))
    .replace(/\band\b/g, "").replace(/[^a-z0-9]+/g, "").split("");
  const a = norm(script), b = norm(heard);
  if (!a.length) return 1;
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = [0];
    for (let j = 1; j <= b.length; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    prev = cur;
  }
  return prev[b.length] / a.length;
}

/** Script words missing from the transcript, ignoring what is only spelling:
 *  US/UK spellings, digits vs words, compounds heard split ("pack rat"),
 *  and "'s" heard as "is"/plural. */
const SPELLING = { color: "colour", colors: "colours", favorite: "favourite", favorites: "favourites", mom: "mum", "mom's": "mum's", organization: "organisation", apologize: "apologise" };
function missedWords(script, heard) {
  const words = (s) => s.replace(/\[[a-z ]+\]/g, " ").toLowerCase().replace(/[‘’]/g, "'")
    .replace(/\d[\d,]*/g, (d) => numberWords(Number(d.replace(/,/g, ""))))
    .split(/[^a-z0-9']+/).map((w) => w.replace(/^'+|'+$/g, "")).filter(Boolean).map((w) => SPELLING[w] ?? w);
  const a = words(script), b = words(heard);
  const D = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) D[i][j] = a[i - 1] === b[j - 1] ? D[i - 1][j - 1] + 1 : Math.max(D[i - 1][j], D[i][j - 1]);
  const miss = [], extra = [];
  for (let i = a.length, j = b.length; i > 0 || j > 0;) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { i--; j--; }
    else if (j > 0 && (i === 0 || D[i][j - 1] >= D[i - 1][j])) extra.unshift(b[--j]);
    else miss.unshift(a[--i]);
  }
  // sound-alike fold, so a name heard as "Pakrad's" still matches PACKRAT
  const fold = (s) => s.replace(/'/g, "").replace(/c/g, "k").replace(/d/g, "t").replace(/z/g, "s").replace(/[aeiouy]/g, "").replace(/(.)\1+/g, "$1");
  const heardOnly = extra.join("");
  return miss.filter((w) => { const bare = w.replace(/'s$/, ""); return !fold(heardOnly).includes(fold(bare)); });
}

/** First moment at/after `from` where the clip stays below QUIET_DB for 80ms. */
function quietAfter(file, from) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const pcm = r.stdout, n = pcm.length / 2, FR = 160; // 10ms frames
  const db = [];
  for (let s = 0; s + FR <= n; s += FR) {
    let e = 0;
    for (let i = 0; i < FR; i++) { const v = pcm.readInt16LE((s + i) * 2) / 32768; e += v * v; }
    db.push(20 * Math.log10(Math.sqrt(e / FR) + 1e-9));
  }
  for (let f = Math.floor(from * 100); f + 8 <= db.length; f++) {
    if (db.slice(f, f + 8).every((d) => d < QUIET_DB)) return f / 100;
  }
  return db.length / 100;
}

/** Delivery fingerprint: median pitch (Hz) and letters per voiced second. */
function voiceProfile(file, text) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const n = r.stdout.length / 2, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r.stdout.readInt16LE(i * 2) / 32768;
  const SR = 16000, W = 640, H = 320, lo = Math.floor(SR / 400), hi = Math.floor(SR / 80), f0s = [];
  const energy = [];
  for (let s = 0; s + W + hi < n; s += H) { let e = 0; for (let i = 0; i < W; i++) e += x[s + i] * x[s + i]; energy.push(e / W); }
  // "voiced" = within 35 dB of the clip's loudest frame, so a raw take and a
  // loudness-normalised clip are measured the same way
  const floor = Math.max(...energy, 1e-9) / 3162;
  let voiced = 0;
  for (let k = 0, s = 0; k < energy.length; k++, s += H) {
    const e = energy[k] * W;
    if (energy[k] < floor) continue;
    voiced += H / SR;
    let best = 0, bl = 0;
    for (let lag = lo; lag <= hi; lag++) { let c = 0; for (let i = 0; i < W; i++) c += x[s + i] * x[s + i + lag]; if (c > best) { best = c; bl = lag; } }
    if (best / e > 0.5) f0s.push(SR / bl);
  }
  f0s.sort((a, b) => a - b);
  const letters = text.replace(/\[[a-z ]+\]/g, "").replace(/[^a-z]/gi, "").length;
  return { f0: f0s[f0s.length >> 1] ?? 0, rate: voiced ? letters / voiced : 0 };
}

function loudness(file) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-i", file, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], { encoding: "utf8" });
  return Number((r.stderr.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
}

/** Trim after the last word has gone quiet, normalise loudness, fade, pad. */
function finish(rawPath, outPath, lastWordEnd) {
  const quiet = quietAfter(rawPath, lastWordEnd);
  const fadeStart = Math.min(Math.max(quiet, lastWordEnd + MIN_TAIL), lastWordEnd + 0.8);
  const total = fadeStart + FADE_DUR;
  const ln = `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11`;
  const m = spawnSync(ffmpegPath, ["-hide_banner", "-i", rawPath, "-af", `atrim=0:${total},${ln}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf("{"), m.stderr.lastIndexOf("}") + 1));
  const second = `${ln}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  const af = `atrim=0:${total},${second},afade=t=out:st=${fadeStart}:d=${FADE_DUR},apad=pad_dur=0.25`;
  const out = spawnSync(ffmpegPath, ["-y", "-hide_banner", "-loglevel", "error", "-i", rawPath, "-af", af, "-ar", "44100", "-ac", "1", "-b:a", "128k", outPath], { encoding: "utf8" });
  if (out.status !== 0) throw new Error(`ffmpeg finish failed: ${out.stderr}`);
  return { fadeStart, quiet };
}

const entries = Object.entries(scripts).filter(([path]) => !only || path === only);
console.log(`Mission ${missionNo}: ${entries.length} clip(s) to generate${DRY ? " (dry run)" : ""}`);
const multiTag = entries.filter(([, text]) => !ONE_TAG.test(text.trim()));
if (multiTag.length) {
  console.error(`One [tag] per clip, at the start. These switch tone mid-clip:\n  ${multiTag.map(([p]) => p).join("\n  ")}`);
  process.exit(2);
}

await mkdir(OUT_DIR, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), "wren-"));
const log = [];
let ok = 0, failed = [];

// Pass 1: record. Each clip gets up to TAKES clean takes (transcript matches,
// no word slipped), with up to MAX_TAKES - 1 extra attempts for slips.
const recorded = [];
for (const [path, text] of entries) {
  const filename = path.split("/").pop();
  console.log(`\n${filename}: "${text.slice(0, 70)}..."`);
  if (DRY) continue;
  try {
    const clean = [];
    let best = null;
    for (let take = 1; clean.length < TAKES && take < TAKES + MAX_TAKES; take++) {
      const buf = await generate(text);
      const { words, text: heard } = await wordTimestamps(buf);
      const score = matchScore(text, heard);
      const missed = missedWords(text, heard);
      console.log(`  take ${take}: match ${(score * 100).toFixed(0)}%${missed.length ? `, words not heard: ${missed.join(" ")}` : ""}`);
      if (!words.length) continue;
      const rawPath = join(tmp, `${filename}.${take}.raw.mp3`);
      await writeFile(rawPath, buf);
      const t = { rawPath, words, heard, score, take, missed, ...voiceProfile(rawPath, text) };
      if (score >= MIN_MATCH && !missed.length) clean.push(t);
      const better = !best || (score >= MIN_MATCH) > (best.score >= MIN_MATCH) || missed.length < best.missed.length || (missed.length === best.missed.length && score > best.score);
      if (better) best = t;
    }
    if (!best) throw new Error("no words returned from STT");
    if (best.score < MIN_MATCH) throw new Error(`best take only matched ${(best.score * 100).toFixed(0)}%: "${best.heard}"`);
    // Usually the transcriber's spelling ("you won" -> "U1"), but it may be a
    // real slip: kept for a human to check rather than failing the run.
    if (!clean.length) console.log(`  CHECK BY EAR: "${best.missed.join(" ")}" not in transcript "${best.heard}"`);
    recorded.push({ path, text, filename, takes: clean.length ? clean : [best] });
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
    failed.push(filename);
  }
}

// Pass 2: choose. UAT (Mission 4, Skill 1): one beat came out brighter or
// faster than its neighbours, which reads as a tone change even with one
// tag. Each clip keeps the take closest to WREN's typical pitch and pace
// (the median over this run, or over the mission's current clips when only
// a few are being redone).
if (recorded.length) {
  const median = (v) => { const s = [...v].sort((a, b) => a - b); return s[s.length >> 1]; };
  let ref = recorded.flatMap((r) => r.takes);
  if (recorded.length < 8) {
    const redo = new Set(recorded.map((r) => r.path));
    ref = Object.entries(scripts).filter(([p]) => !redo.has(p) && existsSync(join("public", p))).map(([p, t]) => voiceProfile(join("public", p), t));
  }
  const target = { f0: median(ref.map((t) => t.f0)), rate: median(ref.map((t) => t.rate)) };
  console.log(`\nTarget delivery: ${target.f0.toFixed(0)} Hz, ${target.rate.toFixed(1)} letters per voiced second`);
  const distance = (t) => Math.abs(t.f0 - target.f0) / target.f0 + Math.abs(t.rate - target.rate) / target.rate;
  for (const r of recorded) {
    try {
      const pick = [...r.takes].sort((a, b) => distance(a) - distance(b))[0];
      const outPath = join(OUT_DIR, r.filename);
      const lastWordEnd = pick.words[pick.words.length - 1].end;
      const { fadeStart, quiet } = finish(pick.rawPath, outPath, lastWordEnd);
      const lufs = loudness(outPath);
      console.log(`${r.filename}: take ${pick.take} of ${r.takes.length} (${pick.f0.toFixed(0)} Hz, ${pick.rate.toFixed(1)} l/s), fade ${fadeStart.toFixed(2)}s (quiet ${quiet.toFixed(2)}s), ${lufs} LUFS`);
      log.push({ clip: r.path, tag: r.text.match(/^\[([a-z ]+)\]/)[1], voice: VOICE_ID, model: MODEL_ID, settings: VOICE_SETTINGS, take: pick.take, cleanTakes: r.takes.length, match: +pick.score.toFixed(3), missed: pick.missed, heard: pick.heard, f0: +pick.f0.toFixed(1), rate: +pick.rate.toFixed(2), target, lastWordEnd, fadeStart, lufs });
      ok++;
    } catch (e) {
      console.error(`${r.filename}: FAILED: ${e.message}`);
      failed.push(r.filename);
    }
  }
}
await rm(tmp, { recursive: true, force: true });
if (logPath && log.length) await writeFile(logPath, JSON.stringify(log, null, 2));

console.log(`\n${DRY ? "DRY RUN" : `DONE — ${ok}/${entries.length} generated`}`);
if (failed.length) { console.log(`FAILED: ${failed.join(", ")}`); process.exit(1); }

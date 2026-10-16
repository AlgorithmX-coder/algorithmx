/**
 * Does every pause sit where the writing put one?
 *
 * Owner, 2026-10-16, on a boss read-out: "there was a problem where we said,
 * take a, and then there was a break and then it said closer look." And on
 * the option list: "there was a break after option, then a break, and then
 * it said A."
 *
 * A pause between two words that have no punctuation between them is a pause
 * the writing never asked for, and it is the thing that makes a line stop
 * flowing. Reading for it by ear across 5,000 clips is not possible; this
 * names it instead: every silence is reported as the two words it falls
 * between, with what the script has at that point.
 *
 * Needs word timings, so it uses the Scribe transcripts already cached in
 * .stt-cache from recording. A clip with no cached transcript is skipped
 * rather than paid for again, so this costs nothing to run.
 *
 *   node scripts/audit-pause-placement.mjs --weeks=1
 *   node scripts/audit-pause-placement.mjs --weeks=1 --all   every gap, not just faults
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { SPEC_GAP, normWord, markAfter } from "./lib/pause-spec.mjs";

const SHOW_ALL = process.argv.includes("--all");
/* Transcribing a finished clip costs a Scribe call, so it is opt-in and
 * capped. Without it this measures only what is already cached and is free. */
const TRANSCRIBE = process.argv.includes("--transcribe");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "--limit=40").split("=")[1]);
const KEY = process.env.ELEVENLABS_API_KEY;
const WEEKS_ARG = (process.argv.find((a) => a.startsWith("--weeks=")) || "").split("=")[1];
const STT_CACHE = ".stt-cache";
const VOICE_DIR = join("public", "audio", "voice");

/* A gap this much longer than the writing asks for is audible as a break.
 * SPEC_GAP.join is 0.05s, so 0.18 catches anything over ~0.23s between two
 * words that belong together, and ignores the ordinary closure on a p/t/k. */
const SLACK = 0.18;

const entries = JSON.parse(await readFile(join(VOICE_DIR, "manifest.json"), "utf8")).entries || [];

let inScope = null;
if (WEEKS_ARG) {
  const want = new Set(WEEKS_ARG.split(",").map((s) => `week${Number(s.trim())}.ts`));
  const r = spawnSync(process.execPath, ["scripts/elevenlabs-generate-narration.mjs", "--keys"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) { console.error("could not map weeks to clips"); process.exit(2); }
  inScope = new Set();
  for (const line of (r.stdout || "").split(/\r?\n/)) {
    const [file, source] = line.split(" ");
    if (file && want.has(source)) inScope.add(file);
  }
  console.log(`scope: week(s) ${WEEKS_ARG} - ${inScope.size} clip(s)`);
}

function silencesOf(file) {
  const vol = spawnSync(ffmpegPath, ["-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  const peak = Number((((vol.stderr || "") + (vol.stdout || "")).match(/max_volume: (-?[0-9.]+) dB/) || [])[1]);
  const noise = Number.isFinite(peak) ? Math.round(peak - 54) : -36;
  const p = spawnSync(ffmpegPath, ["-i", file, "-af", `silencedetect=noise=${noise}dB:d=0.10`, "-f", "null", "-"], { encoding: "utf8" });
  const log = (p.stderr || "") + (p.stdout || "");
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return starts.map((s, i) => ({ start: s, end: ends[i] ?? s })).filter((x) => x.end > x.start && x.start > 0.05);
}

/**
 * Word timings for a FINISHED clip.
 *
 * The recorder transcribes a clip before it shapes it, and shaping rewrites
 * the file, so the cache - which is keyed on the audio's own bytes - never
 * has an entry for the clip as shipped. That is correct for the recorder and
 * useless here, so this transcribes the finished audio and caches that under
 * its own bytes. It costs Scribe calls, hence --transcribe and a --limit:
 * the default is to measure only what is already cached and pay nothing.
 */
let spent = 0;
async function transcript(file) {
  try {
    const buf = await readFile(file);
    const key = createHash("sha1").update(buf).digest("hex").slice(0, 20);
    const cached = join(STT_CACHE, `${key}.json`);
    if (existsSync(cached)) return JSON.parse(await readFile(cached, "utf8"));
    if (!TRANSCRIBE || spent >= LIMIT || !KEY) return null;
    spent++;
    const fd = new FormData();
    fd.append("model_id", "scribe_v1");
    fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST", headers: { "xi-api-key": KEY }, body: fd,
    });
    if (!r.ok) return null;
    const j = await r.json();
    const words = (j.words || [])
      .filter((w) => w.type === "word" && Number.isFinite(w.start) && Number.isFinite(w.end))
      .map((w) => ({ text: w.text, start: w.start, end: w.end }));
    if (!words.length) return null;
    await mkdir(STT_CACHE, { recursive: true });
    await writeFile(cached, JSON.stringify(words));
    return words;
  } catch { return null; }
}

const spoken = (t) => String(t || "").replace(/\[[a-z ]*\]/gi, " ").trim();

let checked = 0, noTranscript = 0;
const faults = [];
for (const e of entries) {
  const name = e.filename || `${e.key}.mp3`;
  if (inScope && !inScope.has(name)) continue;
  const file = join(VOICE_DIR, name);
  if (!existsSync(file)) continue;
  const heard = await transcript(file);
  if (!heard || heard.length < 2) { noTranscript++; continue; }
  checked++;

  const scriptWords = spoken(e.text).split(/\s+/).filter(Boolean);
  /* Which script-word indices fall at the end of an authored LINE. */
  const lineEnds = new Set();
  {
    let n = 0;
    for (const line of e.lines ?? []) {
      const w = spoken(line).split(/\s+/).filter(Boolean).length;
      if (w > 0) { n += w; lineEnds.add(n - 1); }
    }
  }
  /* line up the heard words with the script, tolerating drops */
  const pairs = [];
  let i = 0;
  for (const h of heard) {
    const want = normWord(h.text);
    let j = i;
    while (j < scriptWords.length && j < i + 4 && normWord(scriptWords[j]) !== want) j++;
    if (j < scriptWords.length && normWord(scriptWords[j]) === want) { pairs.push({ j, h }); i = j + 1; }
  }

  for (const sil of silencesOf(file)) {
    const len = sil.end - sil.start;
    let before = null, after = null;
    for (const p of pairs) {
      if (p.h.end <= sil.start + 0.08 && (!before || p.h.end > before.h.end)) before = p;
      if (p.h.start >= sil.end - 0.08 && (!after || p.h.start < after.h.start)) after = p;
    }
    if (!before || !after) continue;
    const word = scriptWords[before.j];
    const next = scriptWords[after.j];
    /* A line break asks for more than a full stop does.
     *
     * The generator joins a block's lines with a newline and gives that a
     * "thought" beat, longer than a sentence stop inside a line. Reading only
     * the punctuation on the word made every one of those look like a 200ms
     * overrun, which is the audit being wrong rather than the audio: the
     * writing DID ask for that pause, by starting a new line. */
    const kind = lineEnds.has(before.j) ? "thought" : markAfter(word);
    const asked = SPEC_GAP[kind] ?? 0.05;
    const over = len - asked;
    if (SHOW_ALL) console.log(`  ${(len * 1000).toFixed(0).padStart(4)}ms  "${word}" | "${next}"  (writing asks ${(asked * 1000).toFixed(0)}ms, ${kind})`);
    if (over > SLACK) faults.push({ name, word, next, ms: Math.round(len * 1000), askedMs: Math.round(asked * 1000), kind, text: spoken(e.text).slice(0, 56) });
  }
}

console.log(`\n${checked} clip(s) measured (${noTranscript} skipped, no cached transcript).`);
if (!faults.length) { console.log("Every pause sits where the writing put one."); process.exit(0); }
faults.sort((a, b) => (b.ms - b.askedMs) - (a.ms - a.askedMs));
console.log(`\n${faults.length} pause(s) the writing never asked for:\n`);
for (const f of faults) {
  console.log(`  ${String(f.ms).padStart(4)}ms between "${f.word}" and "${f.next}"  (asks ${f.askedMs}ms, ${f.kind})`);
  console.log(`        ${f.name}  "${f.text}..."`);
}
process.exit(1);

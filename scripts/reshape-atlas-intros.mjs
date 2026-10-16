/**
 * Give the ATLAS briefings the same pause discipline as the lessons.
 *
 * The lesson narration is re-cut after recording so a pause lands where the
 * writing asks for one and nowhere else. The ATLAS week-intro briefings were
 * never put through that: they are whatever the model happened to deliver.
 * Measured on week 1, the opening "Hello there, Cyber Hero." had a 621ms
 * break BETWEEN "Cyber" and "Hero", where the writing asks for nothing at
 * all, and 168ms after the full stop - a mid-phrase break nearly four times
 * the length of the sentence break. Owner, 2026-10-16: "that voice needs to
 * flow. There's a short break between Cyber and then a little break and then
 * it's Hero."
 *
 * This re-cuts the recordings we already have, so it costs NOTHING: no
 * re-record, no credits, and the delivery, emphasis and warmth are exactly as
 * recorded. The only thing that changes is how long the silences are.
 *
 * How it works:
 *   1. find the silences, against a threshold taken from the clip's OWN peak
 *      (an absolute one mis-reads a quiet take - see shapeToSpec),
 *   2. ask Scribe where each word starts and ends,
 *   3. line those up with the script, so every silence can be named as the
 *      two words it sits between,
 *   4. rebuild the clip with each gap set to what the punctuation between
 *      those two words asks for, from the shared SPEC_GAP table.
 *
 *   node --env-file=.env.local scripts/reshape-atlas-intros.mjs 1
 *   node --env-file=.env.local scripts/reshape-atlas-intros.mjs 1 --dry
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { renameSync, existsSync } from "node:fs";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { SPEC_GAP, SPEC_TAIL, normWord, markAfter } from "./lib/pause-spec.mjs";

const DRY = process.argv.includes("--dry");
const weeks = process.argv.slice(2).filter((a) => !a.startsWith("--")).map(Number);
if (!weeks.length) {
  console.error("usage: node scripts/reshape-atlas-intros.mjs <week> [...] [--dry]");
  process.exit(2);
}

const KEY = process.env.ELEVENLABS_API_KEY;
const STT_CACHE = ".stt-cache";
const AUDIO_DIR = join("public", "audio", "atlas");

/** The briefing scripts, read out of the generator so there is only one copy. */
const genSrc = await readFile("scripts/generate-atlas-weekintros.mjs", "utf8");
function scriptFor(week) {
  const re = new RegExp("^\\s*" + week + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', "m");
  const m = genSrc.match(re);
  return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\") : null;
}

/** Word-level timings, cached against the AUDIO's bytes so a re-run is free. */
async function transcribe(file) {
  const buf = await readFile(file);
  const key = createHash("sha1").update(buf).digest("hex").slice(0, 20);
  const cached = join(STT_CACHE, key + ".json");
  if (existsSync(cached)) return JSON.parse(await readFile(cached, "utf8"));
  if (!KEY) return null;
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
  await mkdir(STT_CACHE, { recursive: true });
  await writeFile(cached, JSON.stringify(words));
  return words;
}

function mediaDuration(file) {
  const r = spawnSync(ffmpegPath, ["-i", file, "-f", "null", "-"], { encoding: "utf8" });
  const all = [...((r.stderr || "") + (r.stdout || "")).matchAll(/time=(\d+):(\d+):([\d.]+)/g)];
  if (!all.length) return 0;
  const m = all[all.length - 1];
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function silencesOf(file, total) {
  const vol = spawnSync(ffmpegPath, ["-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  const peak = Number((((vol.stderr || "") + (vol.stdout || "")).match(/max_volume: (-?[0-9.]+) dB/) || [])[1]);
  const noise = Number.isFinite(peak) ? Math.round(peak - 48) : -36;
  const p = spawnSync(ffmpegPath, ["-i", file, "-af", "silencedetect=noise=" + noise + "dB:d=0.06", "-f", "null", "-"], { encoding: "utf8" });
  const log = (p.stderr || "") + (p.stdout || "");
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const list = starts
    .map((s, i) => ({ start: s, end: ends[i] ?? total }))
    .filter((s) => s.end > s.start && s.start > 0.02);
  return { noise, list };
}

/** Greedy two-pointer alignment, tolerant of words Scribe drops or invents. */
function align(scriptWords, heard) {
  const pairs = [];
  let i = 0;
  for (let h = 0; h < heard.length && i < scriptWords.length; h++) {
    const want = normWord(heard[h].text);
    let j = i;
    while (j < scriptWords.length && j < i + 4 && normWord(scriptWords[j]) !== want) j++;
    if (j < scriptWords.length && normWord(scriptWords[j]) === want) {
      pairs.push({ scriptIdx: j, heard: heard[h] });
      i = j + 1;
    }
  }
  return pairs;
}

for (const week of weeks) {
  const file = join(AUDIO_DIR, "heroes-week-" + String(week).padStart(2, "0") + ".mp3");
  if (!existsSync(file)) { console.log("week " + week + ": no clip at " + file); continue; }
  const text = scriptFor(week);
  if (!text) { console.log("week " + week + ": no script found"); continue; }

  const heard = await transcribe(file);
  if (!heard) { console.log("week " + week + ": no transcript (needs ELEVENLABS_API_KEY), skipped"); continue; }

  const total = mediaDuration(file);
  const scriptWords = text.split(/\s+/).filter(Boolean);
  const pairs = align(scriptWords, heard);
  const { list: sil, noise } = silencesOf(file, total);
  if (!sil.length) { console.log("week " + week + ": no silences found"); continue; }

  /* the speech between the silences */
  const spans = [];
  let cursor = 0;
  for (const s of sil) {
    if (s.start - cursor > 0.04) spans.push({ from: cursor, to: s.start });
    cursor = s.end;
  }
  if (total - cursor > 0.04) spans.push({ from: cursor, to: total });
  if (spans.length < 2) { console.log("week " + week + ": one span, nothing to re-cut"); continue; }

  /** The script word that finishes just before this moment. */
  const wordBefore = (t) => {
    let best = null;
    for (const p of pairs) if (p.heard.end <= t + 0.12 && (!best || p.heard.end > best.heard.end)) best = p;
    return best;
  };

  const kinds = [];
  for (let i = 0; i + 1 < spans.length; i++) {
    const b = wordBefore(spans[i].to);
    /* No word identified means no evidence the writing wants it closed, so
     * leave that gap as a sentence break rather than guessing it shut. */
    kinds.push(b ? markAfter(scriptWords[b.scriptIdx]) : "stop");
  }

  const before = [];
  for (let i = 0; i + 1 < spans.length; i++) before.push(spans[i + 1].from - spans[i].to);
  const after = kinds.map((k) => SPEC_GAP[k]);

  let changed = 0;
  const rows = [];
  for (let i = 0; i < kinds.length; i++) {
    if (Math.abs(before[i] - after[i]) <= 0.08) continue;
    changed++;
    const b = wordBefore(spans[i].to);
    rows.push(
      '   "' + (b ? scriptWords[b.scriptIdx] : "?") + '" | "' +
      (b ? scriptWords[b.scriptIdx + 1] ?? "" : "") + '"  ' +
      (before[i] * 1000).toFixed(0) + "ms -> " + (after[i] * 1000).toFixed(0) + "ms  (" + kinds[i] + ")",
    );
  }
  console.log("week " + week + ": " + spans.length + " spans, " + kinds.length + " gaps, " + changed + " re-cut (noise " + noise + "dB)");
  for (const r of rows) console.log(r);
  if (DRY || !changed) continue;

  const filters = [];
  const parts = [];
  spans.forEach((sp, i) => {
    filters.push("[0:a]atrim=" + sp.from.toFixed(3) + ":" + sp.to.toFixed(3) + ",asetpts=PTS-STARTPTS[s" + i + "]");
    parts.push("[s" + i + "]");
    if (i < spans.length - 1) {
      filters.push("anullsrc=r=44100:cl=mono,atrim=0:" + after[i].toFixed(3) + "[g" + i + "]");
      parts.push("[g" + i + "]");
    }
  });
  filters.push("anullsrc=r=44100:cl=mono,atrim=0:" + SPEC_TAIL.toFixed(3) + "[tail]");
  parts.push("[tail]");
  filters.push(parts.join("") + "concat=n=" + parts.length + ":v=0:a=1[out]");

  const tmp = file + ".spec.mp3";
  const r = spawnSync(ffmpegPath, [
    "-hide_banner", "-y", "-i", file,
    "-filter_complex", filters.join(";"),
    "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", tmp,
  ], { encoding: "utf8" });
  if (r.status !== 0) { console.log("   ffmpeg failed, the clip is left exactly as it was"); continue; }
  renameSync(tmp, file);
  console.log("   rewritten");
}

/**
 * Name the words a pause falls between.
 *
 * The gap audit can say "there is a 0.3s silence at 4.2s", which is not
 * something anyone can act on. This transcribes the clip with word-level
 * timings, so every silence can be reported as the two words it sits between,
 * and checked against whether the AUTHORED text puts any punctuation there.
 *
 * A silence between two words with no comma, full stop or line break between
 * them in the script is a pause the writing never asked for.
 *
 * Transcripts are cached in .pause-cache/ so a re-run costs nothing.
 *
 *   node --env-file=.env.local scripts/audit-pause-words.mjs 1 [howManyClips]
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import FF from "ffmpeg-static";

const week = process.argv[2] || "1";
const LIMIT = Number(process.argv[3] || 14);
const CACHE = ".pause-cache";
await mkdir(CACHE, { recursive: true });

const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const content = await readFile(`app/lesson/weekContent/week${week}.ts`, "utf8");
const LEADS = new Set(["That's right!", "Not quite."]);

const resolved = new Map();
for (const e of manifest.entries) {
  const k = `${e.speaker}\u0000${e.text}`;
  if (!resolved.has(k)) resolved.set(k, e);
}

function gapsOf(file) {
  const r = spawnSync(FF, ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-36dB:d=0.08", "-f", "null", "-"], { encoding: "utf8" });
  const log = (r.stderr || "") + (r.stdout || "");
  const d = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const total = d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
  const starts = [...log.matchAll(/silence_start: ([\d.-]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return starts
    .map((s, i) => ({ start: s, end: ends[i] ?? total, dur: (ends[i] ?? total) - s }))
    .filter((g) => g.start > 0.02 && g.end < total - 0.05 && g.dur >= 0.15);
}

async function transcribe(file) {
  // keyed by the AUDIO's content, not its path: a re-recorded clip keeps its
  // filename, so a path-keyed cache would hand back the old reading
  const key = createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 16);
  const cached = `${CACHE}/${key}.json`;
  if (existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));
  const fd = new FormData();
  fd.append("model_id", "scribe_v1");
  fd.append("file", new Blob([readFileSync(file)], { type: "audio/mpeg" }), "clip.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }, body: fd,
  });
  if (!r.ok) throw new Error(`STT ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  await writeFile(cached, JSON.stringify(j));
  return j;
}

/** does the script put a break between these two words? */
function scriptBreaksBetween(script, before, after) {
  const clean = (s) => s.replace(/[^a-z0-9']/gi, "").toLowerCase();
  const b = clean(before), a = clean(after);
  if (!b || !a) return true;
  // find "before" followed by "after", and look at what sits between them
  const re = new RegExp(`${b.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}([^a-z0-9']*)${a.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`, "i");
  const m = script.replace(/\[[a-z ]*\]/gi, "").match(re);
  if (!m) return null;             // could not locate the pair; do not judge it
  // every mark the shaper treats as a pause, dashes and ellipses included
  return /[,.!?;:\n]|\.\.\.|…|[-–—]/.test(m[1]);
}

const candidates = [];
for (const e of resolved.values()) {
  let lines = e.lines && e.lines.length ? e.lines : [e.text];
  const probe = lines.length > 1 && LEADS.has(lines[0].trim()) ? lines.slice(1) : lines;
  if (!probe.every((l) => l && content.includes(l.trim()))) continue;
  const file = "public" + e.file;
  if (!existsSync(file)) continue;
  const gaps = gapsOf(file);
  const script = lines.join("\n");
  const marks = (script.replace(/\[[a-z ]*\]/gi, "").match(/[,.!?]|\n/g) || []).length;
  candidates.push({ e, file, gaps, script, excess: gaps.length - marks });
}
candidates.sort((a, b) => b.excess - a.excess);

console.log(`week ${week}: ${candidates.length} clips; transcribing the ${LIMIT} with the most unexplained silences\n`);

let unasked = 0, asked = 0, unknown = 0;
for (const c of candidates.slice(0, LIMIT)) {
  let tr;
  try { tr = await transcribe(c.file); }
  catch (err) { console.log(`  (skipped ${c.e.file}: ${err.message})`); continue; }
  const words = (tr.words || []).filter((w) => w.type === "word");
  const bad = [];
  for (const g of c.gaps) {
    const before = [...words].reverse().find((w) => w.end <= g.start + 0.06);
    const after = words.find((w) => w.start >= g.end - 0.06);
    if (!before || !after) continue;
    const wanted = scriptBreaksBetween(c.script, before.text, after.text);
    if (wanted === null) { unknown++; continue; }
    if (wanted) { asked++; continue; }
    unasked++;
    bad.push(`${g.dur.toFixed(2)}s  "${before.text} ... ${after.text}"`);
  }
  if (bad.length) {
    console.log(`"${(c.e.text || "").slice(0, 62)}..."`);
    for (const b of bad) console.log(`     ${b}`);
    console.log();
  }
}

console.log(`pauses the script asks for   : ${asked}`);
console.log(`pauses the script never asks : ${unasked}`);
console.log(`could not place              : ${unknown}`);

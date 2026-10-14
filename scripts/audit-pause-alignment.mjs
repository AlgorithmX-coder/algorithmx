/**
 * Do the pauses in the audio land where the text asks for them?
 *
 * The shaper re-cuts every silence to a spec length, but it has to decide WHICH
 * punctuation mark each detected gap belongs to. It does that by estimating
 * each mark's time as (character position / total characters) x speech length,
 * then matching gaps to marks. That estimate assumes every character takes the
 * same time to say, which is not true: "Dragon. Taco. Comet." and "the easiest
 * way to make a long one" occupy very different time per character. On a long
 * block the estimate drifts, and a gap can be matched to the wrong mark - which
 * puts a pause between two words that belong together and collapses the real
 * sentence boundary nearby.
 *
 * This reports, per clip: the pauses the text asks for, the pauses in the
 * audio, and how far each one sits from where its mark was predicted. A large
 * drift is where "she stops in weird places" comes from.
 *
 *   node scripts/audit-pause-alignment.mjs 1
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import FF from "ffmpeg-static";

const week = process.argv[2] || "1";
const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const content = await readFile(`app/lesson/weekContent/week${week}.ts`, "utf8");

const LEADS = new Set(["That's right!", "Not quite."]);
const resolved = new Map();
for (const e of manifest.entries) {
  const k = `${e.speaker}\u0000${e.text}`;
  if (!resolved.has(k)) resolved.set(k, e);
}

/** marks, deduplicated exactly as shapeToSpec does */
function marksOf(text) {
  const marks = [];
  // keep identical to markRe in elevenlabs-generate-narration.mjs
  const re = /(\.\.\.|…)|(,)|([.!?]+)(?=\s|$)|(\n+)|(\s[-–—]\s)|(;)|(:)/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const kind = m[1] ? "trail"
      : m[2] ? "comma"
      : m[3] ? "stop"
      : m[4] ? (m[4].length > 1 ? "thought" : "stop")
      : m[5] ? "dash"
      : m[6] ? "dash"
      : "colon";
    const prev = marks[marks.length - 1];
    if (prev && m.index - prev.at <= 2) { if (kind === "thought") prev.kind = "thought"; continue; }
    marks.push({ at: m.index, kind });
  }
  while (marks.length && marks[marks.length - 1].at >= text.trimEnd().length - 1) marks.pop();
  return marks;
}

function gapsOf(file) {
  const r = spawnSync(FF, ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-36dB:d=0.08", "-f", "null", "-"], { encoding: "utf8" });
  const log = (r.stderr || "") + (r.stdout || "");
  const d = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const total = d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
  const starts = [...log.matchAll(/silence_start: ([\d.-]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const gaps = starts
    .map((s, i) => ({ start: s, end: ends[i] ?? total, dur: (ends[i] ?? total) - s }))
    .filter((g) => g.start > 0.02 && g.end < total - 0.02);
  return { total, gaps, speech: total - gaps.reduce((a, g) => a + g.dur, 0) };
}

let clips = 0, drifted = 0, extra = 0, lost = 0;
const worst = [];

for (const e of resolved.values()) {
  let lines = e.lines && e.lines.length ? e.lines : [e.text];
  const probe = lines.length > 1 && LEADS.has(lines[0].trim()) ? lines.slice(1) : lines;
  if (!probe.every((l) => l && content.includes(l.trim()))) continue;
  const file = "public" + e.file;
  if (!existsSync(file)) continue;

  const text = lines.join("\n").replace(/\[[a-z ]*\]/gi, "");
  const marks = marksOf(text);
  const { gaps, speech } = gapsOf(file);
  const real = gaps.filter((g) => g.dur >= 0.15);
  clips++;

  if (real.length > marks.length) extra += real.length - marks.length;
  if (marks.length > real.length) lost += marks.length - real.length;

  // where the shaper predicted each mark, in seconds of speech
  const textLen = text.trimEnd().length || 1;
  const predicted = marks.map((m) => (m.at / textLen) * speech);

  // walk both in order and measure the drift of each pairing
  const n = Math.min(predicted.length, real.length);
  let spoken = 0;
  for (let i = 0; i < n; i++) {
    // position of this gap measured in SPEECH time (silence removed)
    spoken = real[i].start - real.slice(0, i).reduce((a, g) => a + g.dur, 0);
    const drift = Math.abs(spoken - predicted[i]);
    if (drift > 0.7) {
      drifted++;
      if (worst.length < 12) {
        worst.push({
          drift,
          kind: marks[i].kind,
          at: real[i].start,
          dur: real[i].dur,
          around: text.slice(Math.max(0, marks[i].at - 34), marks[i].at + 26).replace(/\n/g, " / "),
        });
      }
    }
  }
}

console.log(`week ${week}: ${clips} clips measured\n`);
console.log(`  pauses in the audio with no mark to belong to : ${extra}`);
console.log(`  marks in the text that got no pause           : ${lost}`);
console.log(`  pairings more than 0.7s from the prediction   : ${drifted}`);
if (worst.length) {
  console.log(`\nwhere the estimate drifts furthest (a pause here lands off the mark):`);
  worst.sort((a, b) => b.drift - a.drift);
  for (const w of worst) {
    console.log(`  drift ${w.drift.toFixed(2)}s  ${w.kind.padEnd(7)} pause ${w.dur.toFixed(2)}s at ${w.at.toFixed(2)}s`);
    console.log(`     ...${w.around}...`);
  }
}

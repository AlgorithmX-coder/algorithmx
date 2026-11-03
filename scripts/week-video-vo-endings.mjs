/* Check that no recorded line ends on a sharp cut.
 *
 *   node scripts/week-video-vo-endings.mjs --week=11
 *   node scripts/week-video-vo-endings.mjs --all
 *
 * Owner, 2026-10-29: "make sure that the narration voice doesn't cut off
 * sharply." A line that is still loud at its final sample has been clipped
 * mid-breath, and in a bookend that lands hard because the film cuts to the
 * next shot right after it.
 *
 * Two measurements, both from ffmpeg's own volumedetect/astats rather than by
 * ear, so every week is judged the same way:
 *
 *   TAIL   the peak level over the last 120ms. A line that has been allowed
 *          to finish decays into near-silence; one that was cut is still at
 *          speaking level when it stops.
 *   PAD    how much near-silence sits at the very end. Below ~0.15s there is
 *          no room for the voice to settle before the next thing starts.
 *
 * A line is FLAGGED when its tail is loud AND its pad is short: either alone
 * is survivable, both together is the sharp cut the owner heard.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const args = process.argv.slice(2);
const weekArg = args.find((a) => a.startsWith("--week="));
const ALL = args.includes("--all");
if (!weekArg && !ALL) {
  console.error("usage: node scripts/week-video-vo-endings.mjs --week=N | --all");
  process.exit(1);
}

/** dBFS above which the last 120ms counts as "still talking". */
const LOUD_TAIL = -34;
/** Seconds of trailing quiet below which there is no room to settle. */
const MIN_PAD = 0.15;
/** What counts as quiet when measuring the pad. */
const QUIET = -45;

function run(a) {
  return spawnSync(ffmpegPath, a, { encoding: "utf8" }).stderr || "";
}

function seconds(file) {
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(run(["-i", file]));
  return d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
}

/** Peak dBFS over a window at the end of the file. */
function tailPeak(file, dur, window) {
  const from = Math.max(0, dur - window);
  const e = run(["-v", "info", "-ss", from.toFixed(3), "-i", file, "-af", "volumedetect", "-f", "null", "-"]);
  const m = /max_volume:\s*(-?[0-9.]+) dB/.exec(e);
  return m ? Number(m[1]) : 0;
}

/* How long the file stays below QUIET at the end: ffmpeg reversed, then the
 * first non-quiet moment is how much trailing quiet there was. */
function trailingPad(file) {
  const e = run([
    "-v", "info", "-i", file,
    "-af", `areverse,silencedetect=n=${QUIET}dB:d=0.05`,
    "-f", "null", "-",
  ]);
  const starts = [...e.matchAll(/silence_start:\s*(-?[0-9.]+)/g)].map((m) => Number(m[1]));
  const ends = [...e.matchAll(/silence_end:\s*([0-9.]+)/g)].map((m) => Number(m[1]));
  /* Reversed, a silence starting at ~0 is the file's own trailing quiet. */
  if (starts.length && starts[0] <= 0.02 && ends.length) return ends[0];
  return 0;
}

const weeks = ALL
  ? readdirSync(".art-check")
      .filter((d) => /^w\d\d-video$/.test(d))
      .map((d) => d.slice(1, 3))
      .sort()
  : [String(Number(weekArg.split("=")[1])).padStart(2, "0")];

let flagged = 0;
let checked = 0;
for (const WW of weeks) {
  const dir = `.art-check/w${WW}-video/vo`;
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith(".mp3")).sort();
  if (!files.length) continue;
  console.log(`\n=== week ${WW} ===`);
  for (const f of files) {
    const p = `${dir}/${f}`;
    const dur = seconds(p);
    const tail = tailPeak(p, dur, 0.12);
    const pad = trailingPad(p);
    checked++;
    const bad = tail > LOUD_TAIL && pad < MIN_PAD;
    if (bad) flagged++;
    console.log(
      `  ${f.replace(".mp3", "").padEnd(10)} ${dur.toFixed(2)}s  tail ${tail.toFixed(1).padStart(6)} dB  pad ${pad.toFixed(2)}s${bad ? "   <-- SHARP CUT" : ""}`
    );
  }
}
console.log(`\n${checked} line(s) checked, ${flagged} ending sharply.`);
process.exit(flagged ? 1 : 0);

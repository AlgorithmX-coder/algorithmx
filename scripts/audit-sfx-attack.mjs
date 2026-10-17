/**
 * No sound effect may crack in at full volume.
 *
 * Owner, 2026-10-17, on the Prove-it verdict screen: "I hear a very weird
 * sound. Before Emma starts speaking, what is that and how did it turn up?"
 *
 * It is the success sting. Measured, `correct.mp3` was at 100% of its own
 * peak on its very FIRST 20ms frame - no attack at all, just an instant
 * full-level onset. A waveform that starts from nothing at maximum amplitude
 * is a click: the speaker cone is asked to jump in one sample, and the ear
 * hears a crack in front of the sound rather than the sound itself. It is
 * most noticeable exactly where the owner noticed it, immediately before a
 * quiet spoken line.
 *
 * This measures the ONSET of every sfx: how far into the file it first
 * reaches most of its peak. A few milliseconds of rise removes the click
 * while being far too short to soften the sound itself.
 *
 *   node scripts/audit-sfx-attack.mjs            report
 *   node scripts/audit-sfx-attack.mjs --fix      add a short fade-in
 */
import { spawnSync } from "node:child_process";
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const DIR = "public/audio/sfx";
const FIX = process.argv.includes("--fix");
const SR = 22050;

/* How long the fade is. 8ms is below the ear's ability to hear it as a fade
 * and comfortably long enough to stop the click - a cone has ~176 samples at
 * this rate to get where it is going instead of one. */
const FADE_MS = 8;

/* An onset this fast is a click. Anything that reaches 90% of its peak inside
 * the first frame had no attack at all. */
const FRAME_MS = 20;

function onsetFrames(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 4) return null;
  const b = r.stdout, n = b.length >> 1;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  const win = Math.round((SR * FRAME_MS) / 1000);
  let peak = 0;
  const frames = [];
  for (let i = 0; i + win < n; i += win) {
    let s = 0;
    for (let k = i; k < i + win; k++) s += a[k] * a[k];
    const rms = Math.sqrt(s / win);
    frames.push(rms);
    peak = Math.max(peak, rms);
  }
  if (!peak) return null;
  /* The very first sample matters as much as the first frame: a file can
   * start mid-waveform, which is a step discontinuity however the frame
   * averages out. */
  return {
    firstFramePct: Math.round((frames[0] / peak) * 100),
    firstSample: Math.abs(a[0]),
  };
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".mp3"));
const harsh = [];

for (const f of files) {
  const o = onsetFrames(join(DIR, f));
  if (!o) continue;
  const clicky = o.firstFramePct >= 90 || o.firstSample > 0.05;
  if (clicky) harsh.push({ f, ...o });
}

console.log(`${files.length} sound effect(s) measured.\n`);
if (!harsh.length) {
  console.log("Every one rises into its peak. None crack in.");
  process.exit(0);
}

console.log("These reach full level immediately, which the ear hears as a click:");
for (const h of harsh) {
  console.log(`  ${h.f.padEnd(24)} first 20ms at ${String(h.firstFramePct).padStart(3)}% of peak, opening sample ${h.firstSample.toFixed(3)}`);
}

if (!FIX) {
  console.log(`\nRun with --fix to give each a ${FADE_MS}ms fade-in.`);
  process.exit(1);
}

for (const h of harsh) {
  const src = join(DIR, h.f);
  const tmp = src + ".faded.mp3";
  const r = spawnSync(ffmpegPath, [
    "-v", "error", "-y", "-i", src,
    "-af", `afade=t=in:st=0:d=${FADE_MS / 1000}`,
    "-codec:a", "libmp3lame", "-q:a", "2",
    tmp,
  ]);
  if (r.status !== 0) {
    console.log(`\nFAILED on ${h.f}: ${r.stderr}`);
    process.exit(1);
  }
  renameSync(tmp, src);
}
console.log(`\n${harsh.length} sound(s) given a ${FADE_MS}ms fade-in. Nothing else about them changed.`);

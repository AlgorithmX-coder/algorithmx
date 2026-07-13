/* Build the hero explosion flipbook atlas from source footage.
 *
 * The landing-v2 hero composites REAL pre-rendered explosion footage over
 * the live WebGL laptop (LaptopScene.tsx "EXPLOSION FOOTAGE" block). The
 * footage is delivered as an 8x8 sprite-sheet atlas scrubbed by scroll in
 * a shader — black background + additive blending means no alpha channel
 * is needed (black == transparent).
 *
 * Source: AI-generated supernova/nebula documentary footage (OpenArt /
 * Seedance 2.0, text2video, 10s 1080p, locked-off camera, black plate,
 * point-of-light -> detonate -> expand -> cooling-remnant arc, JWST
 * astrophotography look). Generated 2026-07-13. The raw clip starts
 * mid-flash, so pre-process with a short fade-in from black before
 * building (atlas frame 0 MUST be black — the shader relies on it):
 *   ffmpeg -i raw.mp4 -vf "fade=t=in:st=0:d=0.45" -an input.mp4
 *
 * Usage:
 *   node scripts/build-explosion-atlas.mjs <input.mp4> [output.webp]
 *
 * Uses the repo's ffmpeg-static binary; override with FFMPEG=/path/to/ffmpeg.
 * Defaults: 64 frames (8x8), 960x540/frame -> 7680x4320 atlas, webp q90
 * (stays under the 8192px GPU texture ceiling of the live-scene tier).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const COLS = 8;
const ROWS = 8;
const FRAME_W = 960;
const FRAME_H = 540;
const QUALITY = 90;

const input = process.argv[2];
const output =
  process.argv[3] ?? path.join("public", "hero-fx", "explosion-atlas.webp");
if (!input || !existsSync(input)) {
  console.error(
    "Usage: node scripts/build-explosion-atlas.mjs <input.mp4> [output.webp]",
  );
  process.exit(1);
}

const require = createRequire(import.meta.url);
const ffmpeg =
  process.env.FFMPEG ??
  (() => {
    try {
      return require("ffmpeg-static");
    } catch {
      return "ffmpeg";
    }
  })();

/* Probe duration (ffmpeg -i exits non-zero with no output; duration is on
 * stderr) so the fps filter samples exactly COLS*ROWS frames evenly across
 * the whole clip — first frame ~t=0, last ~t=end. */
const probe = spawnSync(ffmpeg, ["-i", input], { encoding: "utf8" });
const durMatch = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(probe.stderr ?? "");
if (!durMatch) {
  console.error("Could not read clip duration from ffmpeg output.");
  process.exit(1);
}
const duration =
  Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]);

const frames = COLS * ROWS;
const vf = [
  `fps=${frames}/${duration.toFixed(3)}`,
  `scale=${FRAME_W}:${FRAME_H}:flags=lanczos`,
  `tile=${COLS}x${ROWS}`,
].join(",");

console.log(
  `Building ${COLS}x${ROWS} atlas (${frames} frames @ ${FRAME_W}x${FRAME_H}) from ${input} (${duration.toFixed(2)}s)`,
);
execFileSync(
  ffmpeg,
  [
    "-y",
    "-i", input,
    "-vf", vf,
    "-frames:v", "1",
    "-c:v", "libwebp",
    "-quality", String(QUALITY),
    output,
  ],
  { stdio: "inherit" },
);
console.log(`Wrote ${output}`);

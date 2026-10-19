/* Assemble the week 1 bookend videos: join the shots, lay the voice over them.
 *
 * The clips come out of the video model SILENT on purpose. Every spoken word
 * is ours, recorded by scripts/_w01-video-vo.mjs, placed here at a chosen
 * second. That is what makes the result controllable: a line that lands wrong
 * is a re-record of one mp3 and a re-run of this, not a new render.
 *
 *   node scripts/_w01-video-build.mjs
 */
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { existsSync, mkdirSync } from "node:fs";

const DIR = ".art-check/w01-video";
const VO = `${DIR}/vo`;
mkdirSync(`${DIR}/out`, { recursive: true });

function ff(args, label) {
  const r = spawnSync(ffmpegPath, args, { maxBuffer: 1 << 28 });
  if (r.status !== 0) {
    console.log(`  ${label} FAILED (exit ${r.status})`);
    console.log(String(r.stderr || "").split("\n").slice(-12).join("\n"));
    process.exit(1);
  }
}

/* Each cue is a voice line and the second it starts, measured from the top of
 * the finished video. The shots are 8s each, so anything from 8.0 plays over
 * the second shot.
 *
 * `tail` holds the last frame for that many extra seconds, fading to black.
 * The intro needs it: its closing line is the mission statement and runs 5.5
 * seconds, so starting it late enough to follow the Raccoon's taunt runs past
 * the end of the footage. Measured, not guessed - the first cut cut the line
 * off mid-sentence and the transcript of the finished file is what caught it.
 * Held on the villain grinning at the camera, it also ends on the cliffhanger
 * rather than on a cut.
 */
const BUILDS = [
  {
    name: "module-01-intro",
    shots: [`${DIR}/intro-shot1.mp4`, `${DIR}/intro-shot2.mp4`],
    tail: 4.4,
    cues: [
      { file: "intro-1", at: 0.5 },  // 3.63s -> 4.13
      { file: "intro-2", at: 4.3 },  // 3.32s -> 7.62
      { file: "intro-3", at: 8.4 },  // 2.69s -> 11.09  (whisper, over the night cut)
      { file: "intro-4", at: 11.2 }, // 2.51s -> 13.71
      { file: "intro-5", at: 13.9 }, // 2.85s -> 16.75  (Callum, as he grabs it)
      { file: "intro-6", at: 14.9 }, // 5.49s -> 20.39  (over the held last frame)
    ],
  },
  {
    name: "module-01-outro",
    shots: [`${DIR}/outro-shot1.mp4`, `${DIR}/outro-shot2.mp4`],
    tail: 1.6,
    cues: [
      { file: "outro-1", at: 0.5 },  // 4.44s -> 4.94
      { file: "outro-2", at: 5.1 },  // 2.93s -> 8.03   (Callum, as the lock holds)
      { file: "outro-3", at: 8.4 },  // 3.08s -> 11.48
      { file: "outro-4", at: 11.6 }, // 4.52s -> 16.12
      { file: "outro-5", at: 16.2 }, // 1.49s -> 17.69  (over the held last frame)
    ],
  },
];

for (const b of BUILDS) {
  const missing = b.shots.filter((s) => !existsSync(s));
  if (missing.length) {
    console.log(`${b.name}: waiting on ${missing.join(", ")}`);
    continue;
  }

  /* 1. Join the shots. Re-encode rather than stream-copy: the clips come back
   * at slightly different sizes, and concat refuses mismatched streams. */
  const joined = `${DIR}/out/${b.name}.silent.mp4`;
  const inputs = b.shots.flatMap((s) => ["-i", s]);
  const scale = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24";
  const chain = b.shots.map((_, i) => `[${i}:v]${scale}[v${i}]`).join(";");
  const cat = `${b.shots.map((_, i) => `[v${i}]`).join("")}concat=n=${b.shots.length}:v=1:a=0[cat]`;
  /* tpad clones the final frame; the fade starts a beat before the end so the
   * picture goes out on black rather than cutting. */
  const shotsLen = 8.04 * b.shots.length;
  const total = shotsLen + (b.tail || 0);
  const held = b.tail
    ? `[cat]tpad=stop_mode=clone:stop_duration=${b.tail},fade=t=out:st=${(total - 1.2).toFixed(2)}:d=1.2[outv]`
    : `[cat]null[outv]`;
  ff(["-y", "-v", "error", ...inputs, "-filter_complex", `${chain};${cat};${held}`, "-map", "[outv]",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", joined], `${b.name} join`);

  /* 2. Lay the voice on. Every cue is delayed to its cue point and the lot is
   * mixed into one track; `normalize=0` keeps a line from going quiet just
   * because another one overlaps it. */
  const voInputs = b.cues.flatMap((c) => ["-i", `${VO}/${c.file}.mp3`]);
  const delays = b.cues
    .map((c, i) => `[${i + 1}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)},volume=1.6[a${i}]`)
    .join(";");
  const mix = `${b.cues.map((_, i) => `[a${i}]`).join("")}amix=inputs=${b.cues.length}:normalize=0:dropout_transition=0[vo]`;
  const out = `${DIR}/out/${b.name}.mp4`;
  ff(["-y", "-v", "error", "-i", joined, ...voInputs,
      "-filter_complex", `${delays};${mix};[vo]apad[voa]`,
      "-map", "0:v", "-map", "[voa]", "-shortest",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", out], `${b.name} voice`);

  const probe = spawnSync(ffmpegPath, ["-i", out], { encoding: "utf8" });
  const d = /Duration: ([0-9:.]+)/.exec(probe.stderr || "");
  console.log(`${b.name}  ${d ? d[1] : "?"}  ${b.shots.length} shot(s), ${b.cues.length} voice cue(s)  -> ${out}`);
}

// Stitch Seedance shot clips into a Cyber Heroes bookend video.
//
// Takes a directory of per-shot mp4s (+ optional VO mp3s), normalises every
// shot to the Week-1 delivery format (640x478 @ 30fps, H.264 + AAC), mixes
// each shot's VO over its baked soundtrack with ducking, appends an end card
// held from the final shot's last frame, concatenates, and loudness-normalises
// the whole soundtrack so intro/outro land at the same level.
//
//   node scripts/_video-stitch.mjs <assetsDir> <week2-intro|week2-outro>
//
// assetsDir layout:  clips/<shot>.mp4   vo/<shot>.mp3 (optional per shot)
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const W = 640, H = 478, FPS = 30;

// Per-shot vo.at = seconds into the shot the line starts; duck = clip-audio
// volume under the VO. endCard.hold = seconds the card stays up.
const BUILDS = {
  "week2-intro": {
    out: "public/videos/module-02-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2" },
      { clip: "intro-s3", vo: { file: "intro-s3", at: 1.0, duck: 0.35 } },
      { clip: "intro-s4", vo: { file: "intro-s4", at: 1.5, duck: 0.35 } },
      { clip: "intro-s5a" },
      { clip: "intro-s5b" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 1.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
    ],
    endCard: { lines: ["WEEK 2", "GUARD YOUR SECRETS"], hold: 2.5 },
  },
  "week2-outro": {
    out: "public/videos/module-02-outro.mp4",
    shots: [
      { clip: "outro-s1", vo: { file: "outro-s1", at: 1.0, duck: 0.35 } },
      { clip: "outro-s2" },
      { clip: "outro-s3", vo: { file: "outro-s3", at: 2.0, duck: 0.35 } },
      { clip: "outro-s4" },
    ],
    endCard: { lines: ["SECRETS GUARDED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week3-intro": {
    out: "public/videos/module-03-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 1.2, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6" },
      { clip: "intro-s7", vo: { file: "intro-s7", at: 1.0, duck: 0.35 } },
      { clip: "intro-s8" },
      // 4.44s line in a 5.06s clip - must start immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.3, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 3", "SPOT THE PRETEND FRIENDS"], hold: 2.5 },
  },
  "week3-outro": {
    out: "public/videos/module-03-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.8, duck: 0.35 } },
      { clip: "outro-s5", vo: { file: "outro-s5", at: 1.8, duck: 0.35 } },
    ],
    endCard: { lines: ["STRANGER SPOTTED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week4-intro": {
    out: "public/videos/module-04-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 1.5, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 1.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.5, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 4", "SMELL THE TRICK"], hold: 2.5 },
  },
  "week4-outro": {
    out: "public/videos/module-04-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.6, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["SCAM SQUASHED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week5-intro": {
    out: "public/videos/module-05-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 1.5, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 1.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.4, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 5", "DON'T FEED THE STORM"], hold: 2.5 },
  },
  "week5-outro": {
    out: "public/videos/module-05-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.7, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["STORM STOPPED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week6-intro": {
    out: "public/videos/module-06-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 1.5, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 1.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.3, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 6", "GUARD YOUR GAME"], hold: 2.5 },
  },
  "week6-outro": {
    out: "public/videos/module-06-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.4, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["IMPOSTOR EJECTED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week7-intro": {
    out: "public/videos/module-07-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 1.5, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 1.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.52s line in a 5.06s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 7", "COINS ARE REAL MONEY"], hold: 2.5 },
  },
  "week7-outro": {
    out: "public/videos/module-07-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3", vo: { file: "outro-s3", at: 2.0, duck: 0.35 } },
      { clip: "outro-s4" },
      { clip: "outro-s5", vo: { file: "outro-s5", at: 1.5, duck: 0.35 } },
    ],
    endCard: { lines: ["WALLET GUARDED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week8-intro": {
    out: "public/videos/module-08-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2" },
      { clip: "intro-s3", vo: { file: "intro-s3", at: 2.0, duck: 0.35 } },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6" },
      { clip: "intro-s7" },
      { clip: "intro-s8", vo: { file: "intro-s8", at: 2.0, duck: 0.35 } },
      { clip: "intro-s9" },
    ],
    endCard: { lines: ["WEEK 8", "PHOTOS TALK"], hold: 2.5 },
  },
  "week8-outro": {
    out: "public/videos/module-08-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      // 3.97s line in a 5s clip - starts immediately.
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.2, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["CLUES SCRUBBED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week9-intro": {
    out: "public/videos/module-09-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.75s line (atempo 1.05) in a 5.09s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 9", "OFFICIAL STORE ONLY"], hold: 2.5 },
  },
  "week9-outro": {
    out: "public/videos/module-09-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.3, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["COPYCAT CAUGHT!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week10-intro": {
    out: "public/videos/module-10-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.81s line (atempo 1.06) in a 5.09s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 10", "NOTICE THE PULL"], hold: 2.5 },
  },
  "week10-outro": {
    out: "public/videos/module-10-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.3, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["RABBIT HOLE ESCAPED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week11-intro": {
    out: "public/videos/module-11-intro.mp4",
    shots: [
      { clip: "intro-s1", vo: { file: "intro-s1", at: 2.0, duck: 0.35 } },
      { clip: "intro-s2" },
      { clip: "intro-s3", vo: { file: "intro-s3", at: 2.5, duck: 0.35 } },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6" },
      { clip: "intro-s7" },
      { clip: "intro-s8", vo: { file: "intro-s8", at: 3.0, duck: 0.35 } },
      { clip: "intro-s9" },
    ],
    endCard: { lines: ["WEEK 11", "NEVER YOUR FAULT"], hold: 2.5 },
  },
  "week11-outro": {
    out: "public/videos/module-11-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 1.0, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["TEAM ASSEMBLED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week12-intro": {
    out: "public/videos/module-12-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 1.5, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 12", "TRACKS LAST"], hold: 2.5 },
  },
  "week12-outro": {
    out: "public/videos/module-12-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      // 4.68s line in a 5.09s clip - starts immediately.
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.2, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["GOOD TRACKS MADE!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week13-intro": {
    out: "public/videos/module-13-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.5, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 13", "NOTICE THE SIGNS"], hold: 2.5 },
  },
  "week13-outro": {
    out: "public/videos/module-13-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3", vo: { file: "outro-s3", at: 6.0, duck: 0.35 } },
      { clip: "outro-s4" },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["BATTERY GUARDED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week14-intro": {
    out: "public/videos/module-14-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 1.0, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 14", "THE HOUSE LISTENS"], hold: 2.5 },
  },
  "week14-outro": {
    out: "public/videos/module-14-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3", vo: { file: "outro-s3", at: 5.0, duck: 0.35 } },
      { clip: "outro-s4" },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["SETTINGS CHECKED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week15-intro": {
    out: "public/videos/module-15-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.28s line in a 5.09s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 15", "A TOOL, NOT A FRIEND"], hold: 2.5 },
  },
  "week15-outro": {
    out: "public/videos/module-15-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      // 4.60s line in a 5.09s clip - starts immediately.
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.2, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["FAKE SPOTTED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week16-intro": {
    out: "public/videos/module-16-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.0, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.60s line in a 5.09s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 16", "LOOK BEFORE YOU CLICK"], hold: 2.5 },
  },
  "week16-outro": {
    out: "public/videos/module-16-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 0.5, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["DOORWAY CHECKED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week17-intro": {
    out: "public/videos/module-17-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      // 4.81s line (atempo 1.06) in a 5.09s clip - starts immediately.
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.2, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 17", "FEEDS AREN'T REAL LIFE"], hold: 2.5 },
  },
  "week17-outro": {
    out: "public/videos/module-17-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 1.5, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["NOT YET — AND THAT'S OK!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
  "week18-intro": {
    out: "public/videos/module-18-intro.mp4",
    shots: [
      { clip: "intro-s1" },
      { clip: "intro-s2", vo: { file: "intro-s2", at: 2.0, duck: 0.35 } },
      { clip: "intro-s3" },
      { clip: "intro-s4" },
      { clip: "intro-s5" },
      { clip: "intro-s6", vo: { file: "intro-s6", at: 2.5, duck: 0.35 } },
      { clip: "intro-s7" },
      { clip: "intro-s8" },
      { clip: "intro-s9", vo: { file: "intro-s9", at: 0.8, duck: 0.35 } },
    ],
    endCard: { lines: ["WEEK 18", "LOG OUT, LOCK IT"], hold: 2.5 },
  },
  "week18-outro": {
    out: "public/videos/module-18-outro.mp4",
    shots: [
      { clip: "outro-s1" },
      { clip: "outro-s2" },
      { clip: "outro-s3" },
      { clip: "outro-s4", vo: { file: "outro-s4", at: 1.5, duck: 0.35 } },
      { clip: "outro-s5" },
    ],
    endCard: { lines: ["TABLET GUARDED!", "YOU DID IT, CYBER HERO!"], hold: 2.5 },
  },
};

const [assetsDir, buildName] = process.argv.slice(2);
const build = BUILDS[buildName];
if (!assetsDir || !build) {
  console.error(`usage: node scripts/_video-stitch.mjs <assetsDir> <${Object.keys(BUILDS).join("|")}>`);
  process.exit(1);
}

const work = path.join(assetsDir, `_stitch-${buildName}`);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const run = (args) => execFileSync(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });

// ffprobe isn't bundled; parse "Duration: HH:MM:SS.cc" from `ffmpeg -i` stderr.
function durationOf(file) {
  try {
    execFileSync(ffmpeg, ["-i", file], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  throw new Error(`no duration for ${file}`);
}

const segs = [];
for (const shot of build.shots) {
  const src = path.join(assetsDir, "clips", `${shot.clip}.mp4`);
  const seg = path.join(work, `${shot.clip}.mp4`);
  const clipDur = durationOf(src);
  const vf = `scale=${W}:${H},fps=${FPS},format=yuv420p`;
  if (shot.vo) {
    const voFile = path.join(assetsDir, "vo", `${shot.vo.file}.mp3`);
    const voDur = durationOf(voFile);
    const voEnd = Math.min(shot.vo.at + voDur, clipDur);
    // Duck the baked soundtrack while the Raccoon speaks, ride VO on top.
    const af =
      `[0:a]afade=t=in:d=0.15,afade=t=out:st=${(clipDur - 0.15).toFixed(2)}:d=0.15,` +
      `volume=enable='between(t,${shot.vo.at},${voEnd.toFixed(2)})':volume=${shot.vo.duck}[bed];` +
      `[1:a]adelay=${Math.round(shot.vo.at * 1000)}|${Math.round(shot.vo.at * 1000)}[vo];` +
      `[bed][vo]amix=inputs=2:duration=first:normalize=0[a]`;
    run(["-y", "-i", src, "-i", voFile, "-filter_complex", af, "-map", "0:v", "-map", "[a]",
      "-vf", vf, "-r", String(FPS), "-c:v", "libx264", "-crf", "22", "-preset", "medium",
      "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "128k", seg]);
  } else {
    run(["-y", "-i", src, "-vf", vf, "-r", String(FPS),
      "-af", `afade=t=in:d=0.15,afade=t=out:st=${(clipDur - 0.15).toFixed(2)}:d=0.15`,
      "-c:v", "libx264", "-crf", "22", "-preset", "medium",
      "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "128k", seg]);
  }
  segs.push(seg);
  console.log(`seg ${shot.clip} (${clipDur.toFixed(1)}s${shot.vo ? " +VO" : ""})`);
}

// End card: hold the final shot's last frame with the title composited on.
if (build.endCard) {
  const lastSrc = segs[segs.length - 1];
  const framePng = path.join(work, "last-frame.png");
  run(["-y", "-sseof", "-0.1", "-i", lastSrc, "-update", "1", "-frames:v", "1", framePng]);

  const [l1, l2] = build.endCard.lines;
  // Bold sans runs ~0.75em per glyph; keep both lines inside a 60px margin.
  const fit = (text, max) => Math.min(max, Math.floor((W - 60) / (text.length * 0.75)));
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="black" opacity="0.45"/>
    <text x="50%" y="44%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900"
      font-size="${fit(l1, 64)}" fill="#ffffff" stroke="#0a1a3a" stroke-width="3" paint-order="stroke">${l1}</text>
    <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900"
      font-size="${fit(l2, 52)}" fill="#7de3ff" stroke="#0a1a3a" stroke-width="3" paint-order="stroke">${l2}</text>
  </svg>`;
  const cardPng = path.join(work, "card.png");
  await sharp(framePng).composite([{ input: Buffer.from(svg) }]).png().toFile(cardPng);

  const cardSeg = path.join(work, "zz-card.mp4");
  run(["-y", "-loop", "1", "-t", String(build.endCard.hold), "-i", cardPng,
    "-f", "lavfi", "-t", String(build.endCard.hold), "-i", "anullsrc=r=44100:cl=stereo",
    "-vf", `scale=${W}:${H},fps=${FPS},format=yuv420p`, "-r", String(FPS),
    "-c:v", "libx264", "-crf", "22", "-preset", "medium",
    "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "128k", "-shortest", cardSeg]);
  segs.push(cardSeg);
  console.log(`seg end-card (${build.endCard.hold}s)`);
}

const list = path.join(work, "list.txt");
writeFileSync(list, segs.map((s) => `file '${s.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));

const outFile = build.out;
mkdirSync(path.dirname(outFile), { recursive: true });
run(["-y", "-f", "concat", "-safe", "0", "-i", list,
  "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-ar", "44100", "-b:a", "128k",
  outFile]);

const finalDur = durationOf(outFile);
console.log(`\n${outFile}: ${finalDur.toFixed(1)}s, ${(await import("node:fs")).statSync(outFile).size / 1e6 | 0}MB${existsSync(outFile) ? "" : " MISSING"}`);

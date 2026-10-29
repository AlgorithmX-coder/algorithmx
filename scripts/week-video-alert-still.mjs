/* Cut each week's ALERT photo out of that week's own intro film.
 *
 *   node scripts/week-video-alert-still.mjs --week=3
 *   node scripts/week-video-alert-still.mjs --all
 *
 * The screen straight after the intro video is the incident report: a
 * polaroid, and Sarah saying "Oh no, look what happened!" Until now that
 * polaroid was separately drawn art, and it had drifted badly from the films.
 * Week 3's showed a phone reading "Enter Password" - week ONE's subject - in a
 * flat 2D style, with children who look nothing like the ones in the film the
 * child has just watched, and with rendered text on screen.
 *
 * Owner, 2026-10-29: "it takes a screenshot of the video and then it says, oh
 * no". So the photo is now literally a frame of the film.
 *
 * WHICH frame: the last moment of shot one, where the Raccoon's gloat has
 * landed - the mask lowered, the gems scooped, the lure swung at the camera.
 * That is the picture the words "oh no, look what happened" belong to. Taken a
 * little before the cut so it is never the dissolve into shot two.
 *
 * SHAPE: the polaroid is 4:3 and covers, so a 16:9 frame would lose a quarter
 * of its width to a crop nobody chose. The crop is done here instead, centred,
 * at the size the existing art used, so what is checked is what is shown. The
 * red "Hacked" tag sits top-left over the background, which the den shots
 * leave clear.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const args = process.argv.slice(2);
const weekArg = args.find((a) => a.startsWith("--week="));
const ALL = args.includes("--all");
if (!weekArg && !ALL) {
  console.error("usage: node scripts/week-video-alert-still.mjs --week=N | --all");
  process.exit(1);
}

/** Matches the art the alert photos already used. */
const OUT_W = 1100;
const OUT_H = 825;
/** How far before the cut to grab, so it is never the dissolve. */
const BEFORE_CUT = 0.45;

const OUT_DIR = "public/cyberheroes/alerts";
mkdirSync(OUT_DIR, { recursive: true });

function seconds(file) {
  const e = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" }).stderr || "";
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(e);
  return d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
}

const weeks = ALL
  ? Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, "0"))
  : [String(Number(weekArg.split("=")[1])).padStart(2, "0")];

let done = 0;
for (const WW of weeks) {
  const shot = `.art-check/w${WW}-video/shots/intro-shot1.mp4`;
  if (!existsSync(shot)) {
    console.log(`  w${WW}  no intro-shot1 footage, skipped`);
    continue;
  }
  const at = Math.max(0, seconds(shot) - BEFORE_CUT);
  const tmp = `.art-check/_tmp/alert-${WW}.png`;
  mkdirSync(".art-check/_tmp", { recursive: true });

  const r = spawnSync(ffmpegPath, ["-y", "-v", "error", "-ss", at.toFixed(2), "-i", shot, "-frames:v", "1", tmp]);
  if (r.status !== 0) {
    console.log(`  w${WW}  FAILED to grab frame`);
    continue;
  }

  /* cover, centred: the same crop the polaroid would do, done once and
   * checked, rather than left to the browser. */
  await sharp(tmp).resize(OUT_W, OUT_H, { fit: "cover", position: "centre" }).png().toFile(`${OUT_DIR}/week-${WW}.png`);
  console.log(`  w${WW}  frame at ${at.toFixed(2)}s -> ${OUT_DIR}/week-${WW}.png  ${OUT_W}x${OUT_H}`);
  done++;
}
console.log(`${done} alert still(s) cut from the films.`);

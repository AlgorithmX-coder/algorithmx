/* Strip baked-in letterbox bars from generated frames, in matched pairs.
 *
 *   node scripts/week-video-trim-frames.mjs --week=4
 *   node scripts/week-video-trim-frames.mjs --all
 *
 * The image model sometimes returns a 16:9 picture with a band of pure black
 * along one edge, as if it had letterboxed a taller composition. It matters
 * because the band is part of the PICTURE, not the file's shape: pin a shot
 * with it and the video model animates the band too, and it survives into the
 * finished film as a stripe across the top.
 *
 * Two things this gets right that the first version did not.
 *
 * A bar is measured by the row's MEAN, not its brightest pixel. Week 4 came
 * back with 157 black rows that a brightest-pixel test waved through, because
 * a few stray bright pixels sat inside the band; the row still read as black
 * to the eye and to the video model.
 *
 * And a shot's two frames are trimmed TOGETHER, to one shared rectangle, then
 * cropped to 16:9 and resized to one size. Trimming them apart would crop the
 * start and the end differently and the picture would jump between them; the
 * first version also resized with fit:"fill", which un-letterboxed the frame
 * by stretching everything in it.
 */
import { readdirSync, existsSync } from "node:fs";
import sharp from "sharp";

const args = process.argv.slice(2);
const weekArg = args.find((a) => a.startsWith("--week="));
const ALL = args.includes("--all");
if (!weekArg && !ALL) {
  console.error("usage: node scripts/week-video-trim-frames.mjs --week=N | --all");
  process.exit(1);
}

/** A row or column is a bar if its average brightness is under this.
 *  Kept very tight on purpose. A letterbox bar averages 1-2; week 3's
 *  spotlight scene has genuine picture averaging 8-18 at its dark edges,
 *  and a looser threshold ate 231 real columns of it. */
const DARK = 4;
/** More than this proportion trimmed off one edge is suspicious, not a bar. */
const SANE = 0.15;
/** Everything leaves here at one size, so a pair always matches. */
const OUT_W = 1920;
const OUT_H = 1080;

const SHOTS = ["intro-shot1", "intro-shot2", "outro-shot1", "outro-shot2"];

async function bars(file) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const rowMean = (y) => {
    let s = 0;
    for (let x = 0; x < W; x++) s += data[y * W + x];
    return s / W;
  };
  const colMean = (x) => {
    let s = 0;
    for (let y = 0; y < H; y++) s += data[y * W + x];
    return s / H;
  };
  let top = 0;
  while (top < H && rowMean(top) < DARK) top++;
  let bottom = 0;
  while (bottom < H - top && rowMean(H - 1 - bottom) < DARK) bottom++;
  let left = 0;
  while (left < W && colMean(left) < DARK) left++;
  let right = 0;
  while (right < W - left && colMean(W - 1 - right) < DARK) right++;
  return { W, H, top, bottom, left, right };
}

async function doShot(dir, shot) {
  const files = ["start", "end"].map((e) => `${dir}/${shot}-${e}.png`).filter(existsSync);
  if (!files.length) return null;

  const measured = [];
  for (const f of files) measured.push(await bars(f));

  /* One rectangle for both frames: the tightest box that is inside every
   * frame's content, so the pair stays registered to each other. */
  const W = Math.min(...measured.map((m) => m.W));
  const H = Math.min(...measured.map((m) => m.H));
  const top = Math.max(...measured.map((m) => m.top));
  const bottom = Math.max(...measured.map((m) => m.bottom));
  const left = Math.max(...measured.map((m) => m.left));
  const right = Math.max(...measured.map((m) => m.right));

  const already = measured.every((m) => m.W === OUT_W && m.H === OUT_H) && !top && !bottom && !left && !right;
  if (already) return null;

  if (top / H > SANE || bottom / H > SANE || left / W > SANE || right / W > SANE) {
    return { shot, suspicious: true, top, bottom, left, right };
  }

  for (const f of files) {
    const buf = await sharp(f)
      .extract({ left, top, width: W - left - right, height: H - top - bottom })
      /* cover, never fill: a bar is removed by cropping, not by stretching
       * what is left of the picture back over the hole it came out of. */
      .resize(OUT_W, OUT_H, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    await sharp(buf).toFile(f);
  }
  return { shot, top, bottom, left, right, n: files.length };
}

const weeks = ALL
  ? readdirSync(".art-check")
      .filter((d) => /^w\d\d-video$/.test(d))
      .map((d) => d.slice(1, 3))
      .sort()
  : [String(Number(weekArg.split("=")[1])).padStart(2, "0")];

let changed = 0;
let flagged = 0;
for (const ww of weeks) {
  const dir = `.art-check/w${ww}-video/frames`;
  if (!existsSync(dir)) continue;
  for (const shot of SHOTS) {
    const r = await doShot(dir, shot);
    if (!r) continue;
    if (r.suspicious) {
      console.log(`  w${ww}/${shot}  SUSPICIOUS, left alone: top=${r.top} bottom=${r.bottom} left=${r.left} right=${r.right}`);
      flagged++;
    } else {
      console.log(`  w${ww}/${shot}  ${r.n} frame(s) -> ${OUT_W}x${OUT_H}, bars cut top=${r.top} bottom=${r.bottom} left=${r.left} right=${r.right}`);
      changed++;
    }
  }
}
console.log(`${changed} shot(s) normalised, ${flagged} flagged for a look.`);

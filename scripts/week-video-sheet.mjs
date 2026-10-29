/* Contact sheet for one week's eight pinned frames.
 *
 *   node scripts/week-video-sheet.mjs --week=4
 *
 * Laid out as four rows, one per shot, start on the left and end on the
 * right, so the pair that the video model has to interpolate between is read
 * side by side. That is where the defects live: a prop the end frame lost, a
 * wall that is bare in one and decorated in the other, a character who has
 * changed costume between the two. On its own each picture looks fine.
 */
import { existsSync } from "node:fs";
import sharp from "sharp";

const weekArg = process.argv.find((a) => a.startsWith("--week="));
const WW = String(Number(weekArg.split("=")[1])).padStart(2, "0");
const dir = `.art-check/w${WW}-video/frames`;

const SHOTS = ["intro-shot1", "intro-shot2", "outro-shot1", "outro-shot2"];
const CW = 760;              // one cell's width
const CH = Math.round((CW * 9) / 16);
const PAD = 8;

const rows = [];
for (const shot of SHOTS) {
  for (const end of ["start", "end"]) {
    const f = `${dir}/${shot}-${end}.png`;
    rows.push(existsSync(f) ? await sharp(f).resize(CW, CH, { fit: "fill" }).toBuffer() : null);
  }
}

const W = CW * 2 + PAD * 3;
const H = CH * SHOTS.length + PAD * (SHOTS.length + 1);
const composite = rows
  .map((buf, i) =>
    buf && {
      input: buf,
      left: PAD + (i % 2) * (CW + PAD),
      top: PAD + Math.floor(i / 2) * (CH + PAD),
    }
  )
  .filter(Boolean);

await sharp({ create: { width: W, height: H, channels: 3, background: "#ff00ff" } })
  .composite(composite)
  .png()
  .toFile(`${dir}/_pairs.png`);

console.log(`${composite.length}/8 frames -> ${dir}/_pairs.png  (${W}x${H})`);
console.log("rows, top to bottom:", SHOTS.join(", "), "| left=start right=end");

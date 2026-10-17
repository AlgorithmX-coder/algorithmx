/**
 * Give every lesson icon a transparent margin so nothing can slice it.
 *
 * Owner, 2026-10-17, on week 2: "All emojis need to look full and complete.
 * As you can see, this eye is cut off. We need to go through all of the weeks
 * and make sure that the emojis are being generated correctly and full with
 * no issues. This is extremely important for all of the weeks."
 *
 * The ASSETS were sound - eye.png renders as a whole round eye on a magenta
 * plate. What makes them so easy to damage is that they are TRIMMED hard to
 * their ink: 86 of the 92 touch the canvas edge by design. A trimmed circle
 * meets its top edge at a tangent with nothing to spare, so any container
 * that is a pixel short, or sets overflow:hidden with a fixed height, shaves
 * a flat slice off the artwork - and the result still looks deliberate, which
 * is why it survived review for so long.
 *
 * This fixes the class rather than the one icon: each PNG keeps its exact
 * canvas size, and the artwork inside is inset by a small margin. Keeping the
 * dimensions identical matters - every layout that sizes an icon keeps
 * working untouched, and the only visible change is that the art no longer
 * runs to the very edge.
 *
 *   node scripts/pad-lesson-icons.mjs --check    report, change nothing
 *   node scripts/pad-lesson-icons.mjs            pad them
 */
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/cyberheroes/icons";
const CHECK = process.argv.includes("--check");

/* 6% a side. Enough that a container being a few pixels short, or rounding
 * during a zoom, cannot reach the ink; small enough that the icon does not
 * visibly shrink next to the ones already shipped. */
const MARGIN = 0.06;

/* How much edge contact counts as "touching". A trimmed shape meets its edge
 * at a tangent of a few pixels; anything more is a flat run, which is either
 * deliberate framing or a crop. */
const CONTACT = 0.01;

async function edgeContact(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const A = (x, y) => data[(y * W + x) * C + 3];
  let top = 0, bottom = 0, left = 0, right = 0;
  for (let x = 0; x < W; x++) {
    if (A(x, 0) > 24) top++;
    if (A(x, H - 1) > 24) bottom++;
  }
  for (let y = 0; y < H; y++) {
    if (A(0, y) > 24) left++;
    if (A(W - 1, y) > 24) right++;
  }
  return { W, H, worst: Math.max(top / W, bottom / W, left / H, right / H) };
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".png"));
let touching = 0;
let padded = 0;

for (const f of files) {
  const path = join(DIR, f);
  const { W, H, worst } = await edgeContact(path);
  if (worst <= CONTACT) continue;
  touching++;
  if (CHECK) continue;

  const inset = Math.max(2, Math.round(Math.min(W, H) * MARGIN));
  const inner = await sharp(path)
    .resize(W - inset * 2, H - inset * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: inner, top: inset, left: inset }])
    .png()
    .toFile(path + ".tmp");
  const { renameSync } = await import("node:fs");
  renameSync(path + ".tmp", path);
  padded++;
}

if (CHECK) {
  console.log(`${files.length} icon(s); ${touching} run their artwork to the canvas edge.`);
  if (touching) {
    console.log("Each of those can be sliced by any container that clips.");
    console.log("Run without --check to inset them.");
  }
  process.exit(touching ? 1 : 0);
}

console.log(`${files.length} icon(s) scanned, ${padded} given a ${Math.round(MARGIN * 100)}% transparent margin.`);
console.log("Canvas sizes are unchanged, so no layout moves.");

/**
 * Put back the pixels the white-key punched out of a character.
 *
 * The art is generated on white and the background is removed by keying out
 * white. Anything WHITE in the character itself is the same colour as the
 * background, so the key eats it too: on week 1's raccoon it bit 536 pixels
 * out of the white brow fur and the muzzle, which show as speckled holes.
 * Against a white preview they are invisible. Against the dark arena they are
 * punctures in his face.
 *
 * Owner, 2026-10-16: "you can see that he's got some defect on his face...
 * The pictures, they need to come out correct, not with issues."
 *
 * A hole is found structurally, not by colour: flood the TRANSPARENT pixels
 * inwards from the border, and any transparent pixel the flood never reaches
 * is enclosed by the character, so it is a hole rather than background. The
 * key only zeroed the alpha, so 501 of those 536 still carried their original
 * colour and are restored exactly; the rest take the median of their opaque
 * neighbours.
 *
 *   node scripts/fill-sprite-key-holes.mjs <file.png> [...]
 *   node scripts/fill-sprite-key-holes.mjs --dry <file.png>
 */
import sharp from "sharp";
import { renameSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!files.length) {
  console.error("usage: node scripts/fill-sprite-key-holes.mjs <file.png> [...]");
  process.exit(2);
}

const ALPHA = 24;

for (const file of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const transparent = (i) => data[i * 4 + 3] <= ALPHA;

  /* background = transparent pixels reachable from the border */
  const outside = new Uint8Array(w * h);
  const stack = [];
  const seed = (i) => { if (!outside[i] && transparent(i)) { outside[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    const py = (p / w) | 0, pxx = p % w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = pxx + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      seed(ny * w + nx);
    }
  }

  const holes = [];
  for (let i = 0; i < w * h; i++) if (transparent(i) && !outside[i]) holes.push(i);

  /* Half-eaten pixels, which is most of what the eye actually sees.
   *
   * The key does not only punch pixels out, it FEATHERS them, so white fur
   * inside the character comes back at alpha 60 to 200 and the background
   * shows through as a speckle. Those are not holes by the test above - they
   * are not transparent - so the first pass walked straight past them, and
   * the raccoon's brow stayed speckled after it ran.
   *
   * Feathering is correct on the silhouette EDGE, where it is the anti-alias.
   * It is wrong anywhere else. The difference is distance: an edge pixel has
   * background within a pixel or two of it, an interior one does not. So
   * anything part-transparent that is not within 2px of the background gets
   * made solid, and the silhouette keeps its soft edge.
   * Measured on week 1's raccoon: 547 interior against 6,013 on the edge. */
  const soft = [];
  const nearOutside = (x, y) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (outside[ny * w + nx]) return true;
    }
    return false;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a <= ALPHA || a >= 250) continue;
      if (!nearOutside(x, y)) soft.push(y * w + x);
    }
  }

  if (!holes.length && !soft.length) { console.log(`${file}: no holes`); continue; }

  let kept = 0, painted = 0;
  if (!DRY) {
    for (const i of holes) {
      const o = i * 4;
      if (data[o] + data[o + 1] + data[o + 2] > 30) {
        data[o + 3] = 255;                        // the colour survived the key
        kept++;
        continue;
      }
      /* no colour left: take the median of the opaque neighbourhood */
      const px = i % w, py = (i / w) | 0;
      const rs = [], gs = [], bs = [];
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const no = (ny * w + nx) * 4;
        if (data[no + 3] <= ALPHA) continue;
        rs.push(data[no]); gs.push(data[no + 1]); bs.push(data[no + 2]);
      }
      if (!rs.length) continue;
      const mid = (a) => a.sort((x, y) => x - y)[a.length >> 1];
      data[o] = mid(rs); data[o + 1] = mid(gs); data[o + 2] = mid(bs); data[o + 3] = 255;
      painted++;
    }
    for (const i of soft) data[i * 4 + 3] = 255;
    await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(file + ".tmp");
    renameSync(file + ".tmp", file);
  }
  console.log(`${file}: ${holes.length} hole px, ${soft.length} feathered${DRY ? " (dry run)" : ` - ${kept} restored, ${painted} repainted, ${soft.length} solidified`}`);
}

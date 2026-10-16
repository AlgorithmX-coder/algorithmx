/**
 * Lift a generated character off its white background.
 *
 * The art is generated on PURE WHITE, which has to come off before the
 * character can sit on a dark card. A global "every white pixel goes" key is
 * the obvious way to do it and the wrong one: it punches holes through
 * anything white in the character itself - teeth, eye highlights, a white
 * costume piece - and those holes are invisible against the white preview
 * and glaring on a dark ground. That is the defect the owner found on the
 * raccoon's face.
 *
 * So the background is found by a flood fill from the image border instead.
 * Only white that is CONNECTED to the edge is background; white enclosed by
 * the character is the character's own. The 1px rim left behind is feathered
 * so the silhouette is not a hard jaggy edge.
 *
 * Run fill-sprite-key-holes.mjs afterwards to repair anything the fill still
 * bit into, and strip-sprite-ground-shadow.mjs to take off a contact shadow.
 *
 *   node scripts/key-character-art.mjs in.png out.png [--height=512]
 */
import sharp from "sharp";

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith("--"));
if (files.length !== 2) {
  console.error("usage: node scripts/key-character-art.mjs <in.png> <out.png> [--height=512]");
  process.exit(2);
}
const [input, output] = files;
const HEIGHT = Number((args.find((a) => a.startsWith("--height=")) || "--height=512").split("=")[1]);
/**
 * --dehalo strips a pale fringe left hugging the silhouette.
 *
 * Asked for a "sticker", the model likes to draw a white die-cut outline
 * around the character whether or not the prompt forbids it - two of week
 * 1's three did it after being told NO border twice. The flood fill eats
 * most of that outline but leaves a soft white fringe, which looks like a
 * glow on a dark card and, worse, looks like a glow on only SOME of the set.
 *
 * The fringe is pale, colourless, and touching transparency. Peel it off a
 * ring at a time. Off by default: a character who really is white at the
 * edge (a lab coat, a white hat) would lose it.
 */
const DEHALO = args.includes("--dehalo");

/* Background is near-white AND nearly colourless. Generous, because it only
 * applies to pixels the flood can actually reach from the edge. */
const BG_MIN = 220;
const BG_SAT = 20;
/* The feathered rim: bright, but not bright enough to be background. */
const RIM_MIN = 205;

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const at = (x, y) => (y * w + x) * 4;
const isBg = (x, y) => {
  const o = at(x, y);
  const r = data[o], g = data[o + 1], b = data[o + 2];
  return Math.min(r, g, b) >= BG_MIN && Math.max(r, g, b) - Math.min(r, g, b) <= BG_SAT;
};

const outside = new Uint8Array(w * h);
const stack = [];
const seed = (x, y) => {
  const i = y * w + x;
  if (!outside[i] && isBg(x, y)) { outside[i] = 1; stack.push(i); }
};
for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
while (stack.length) {
  const p = stack.pop();
  const py = (p / w) | 0, px = p % w;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = px + dx, ny = py + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
    seed(nx, ny);
  }
}

/* Cut the background, then soften the pixels that touch it so the edge is
 * not a staircase. */
let cut = 0, feathered = 0;
for (let i = 0; i < w * h; i++) if (outside[i]) { data[i * 4 + 3] = 0; cut++; }
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (outside[i] || data[i * 4 + 3] === 0) continue;
    let touches = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (outside[ny * w + nx]) { touches = true; break; }
    }
    if (touches && Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) >= RIM_MIN) {
      data[i * 4 + 3] = 128;
      feathered++;
    }
  }
}

let peeled = 0;
if (DEHALO) {
  /* Six passes takes a fringe up to six pixels thick, which covers every
   * die-cut outline seen so far. Each pass only removes pixels that are
   * ALREADY touching transparency, so it cannot eat inwards past the fringe
   * unless the character itself is pale right there. */
  for (let pass = 0; pass < 6; pass++) {
    const doomed = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = at(x, y);
        if (data[o + 3] === 0) continue;
        const r = data[o], g = data[o + 1], b = data[o + 2];
        if (Math.min(r, g, b) < 200 || Math.max(r, g, b) - Math.min(r, g, b) > 26) continue;
        let edge = false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) { edge = true; break; }
          if (data[at(nx, ny) + 3] === 0) { edge = true; break; }
        }
        if (edge) doomed.push(o);
      }
    }
    if (!doomed.length) break;
    for (const o of doomed) data[o + 3] = 0;
    peeled += doomed.length;
  }
}

const keyed = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
await sharp(keyed).trim({ threshold: 8 }).resize({ height: HEIGHT, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(output);
const out = await sharp(output).metadata();
console.log(`${input} -> ${output}  ${out.width}x${out.height}  (${cut} bg cut, ${feathered} rim feathered${peeled ? `, ${peeled} halo peeled` : ""})`);

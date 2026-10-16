/**
 * Remove the pale ground-shadow smears left under a keyed character sprite.
 *
 * The art is generated on white, then the white background is keyed out by a
 * border-connected flood fill. A soft grey contact shadow under the feet is
 * NOT white enough for that fill to reach through, so it survives as a pale
 * low-saturation smudge - invisible against the white preview, and a pair of
 * light grey streaks under the character on a dark arena.
 *
 * Owner, 2026-10-16, on the wrong-answer screen: "you can see the bottom of
 * the raccoon. That should not be there." Measured on week 1's attack pose:
 * 83.1% of the pixels in the bottom band were pale and low-saturation.
 *
 * The smear is always DETACHED from the character - there is clear space
 * between the feet and it - so it can be found structurally rather than by
 * guessing a threshold: take the connected components of the opaque mask,
 * keep the biggest one (the character), and erase any other component that is
 * pale and desaturated. A detached prop that is actually part of the art (a
 * dropped key, a coloured spark) has colour, so it survives.
 *
 *   node scripts/strip-sprite-ground-shadow.mjs <file.png> [...]
 *   node scripts/strip-sprite-ground-shadow.mjs --dry <file.png>
 */
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
/* --attached also removes a shadow that TOUCHES the character.
 *
 * The detached pass below cannot reach those: on week 1's idle pose the
 * contact shadow runs under and around the feet, so it is one component with
 * the raccoon. What separates it from the character is not colour - the
 * raccoon's tail is pale grey too - but TEXTURE. Fur has strands; a rendered
 * contact shadow is flat. Measured on that sprite, pale desaturated pixels in
 * the bottom band split cleanly: local std-dev p25 = 5.1 (shadow) against
 * p90 = 42.2 (tail fur). Anything under FLAT_SD is shadow.
 *
 * Opt-in, because a character with large flat pale areas low down - white
 * boots, a plain apron - would lose them. Render the result on magenta and
 * look at it before keeping it. */
const ATTACHED = process.argv.includes("--attached");
const FLAT_SD = 12;      // below this the region has no texture: a shadow
const BAND = 0.16;       // of the subject's height, measured from the feet
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!files.length) {
  console.error("usage: node scripts/strip-sprite-ground-shadow.mjs <file.png> [...]");
  process.exit(2);
}

const ALPHA = 24;        // anything fainter is already background
const PALE_MIN = 140;    // a shadow smear is bright...
const SAT_MAX = 38;      // ...and has almost no colour

for (const file of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x, y) => (y * w + x) * 4;

  /* components of the opaque mask, 8-connected */
  const label = new Int32Array(w * h).fill(-1);
  const stack = [];
  const comps = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (label[idx] !== -1 || data[px(x, y) + 3] <= ALPHA) continue;
      const id = comps.length;
      const c = { id, n: 0, sumMn: 0, sumSat: 0, minY: h, maxY: 0 };
      label[idx] = id;
      stack.push(idx);
      while (stack.length) {
        const p = stack.pop();
        const py = (p / w) | 0, pxx = p % w;
        const o = px(pxx, py);
        const r = data[o], g = data[o + 1], b = data[o + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        c.n++; c.sumMn += mn; c.sumSat += mx - mn;
        if (py < c.minY) c.minY = py;
        if (py > c.maxY) c.maxY = py;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = pxx + dx, ny = py + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (label[ni] !== -1 || data[px(nx, ny) + 3] <= ALPHA) continue;
          label[ni] = id;
          stack.push(ni);
        }
      }
      comps.push(c);
    }
  }
  if (!comps.length) { console.log(`${file}: nothing opaque, skipped`); continue; }

  comps.sort((a, b) => b.n - a.n);
  const body = comps[0];
  const doomed = new Set();
  let erased = 0;
  for (const c of comps) {
    if (c.id === body.id) continue;
    const mn = c.sumMn / c.n, sat = c.sumSat / c.n;
    /* pale, colourless and sitting at or below the character's feet */
    if (mn >= PALE_MIN && sat <= SAT_MAX && c.maxY >= body.maxY - (body.maxY - body.minY) * 0.12) {
      doomed.add(c.id);
      erased += c.n;
    }
  }

  /* second pass: flat, pale, textureless pixels low down that are part of
   * the character's own component */
  let attachedErased = 0;
  if (ATTACHED) {
    const lum = (x, y) => { const i = px(x, y); return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; };
    const y0 = Math.round(body.maxY - (body.maxY - body.minY) * BAND);
    const doomedPx = [];
    for (let y = y0; y <= body.maxY; y++) {
      for (let x = 0; x < w; x++) {
        const o = px(x, y);
        if (data[o + 3] <= ALPHA) continue;
        const r = data[o], g = data[o + 1], b = data[o + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mn < PALE_MIN || mx - mn > SAT_MAX) continue;
        let n = 0, sum = 0, sum2 = 0;
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (data[px(nx, ny) + 3] <= ALPHA) continue;
          const v = lum(nx, ny); n++; sum += v; sum2 += v * v;
        }
        const sd = n ? Math.sqrt(Math.max(0, sum2 / n - (sum / n) ** 2)) : 0;
        if (sd < FLAT_SD) doomedPx.push(o);
      }
    }
    attachedErased = doomedPx.length;
    if (!DRY) for (const o of doomedPx) data[o + 3] = 0;
  }
  erased += attachedErased;

  const pct = ((erased / (w * h)) * 100).toFixed(3);
  if (!erased) { console.log(`${file}: clean, nothing to strip`); continue; }
  const extra = attachedErased ? `, ${attachedErased} attached` : "";
  if (DRY) { console.log(`${file}: would erase ${doomed.size} smear(s)${extra}, ${erased} px (${pct}% of canvas)`); continue; }

  for (let i = 0; i < w * h; i++) if (doomed.has(label[i])) data[i * 4 + 3] = 0;
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(file + ".tmp");
  const { renameSync } = await import("node:fs");
  renameSync(file + ".tmp", file);
  console.log(`${file}: erased ${doomed.size} smear(s)${extra}, ${erased} px (${pct}% of canvas)`);
}

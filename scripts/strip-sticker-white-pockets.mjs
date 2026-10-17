/**
 * Remove unkeyed WHITE POCKETS left inside a cut-out sticker.
 *
 * Owner, 2026-10-17, on the week 2 sticker row: "you can see the white
 * spaces between Layla".
 *
 * `master-of-disguise.png` carries 7,199 near-white opaque pixels - 4.8% of
 * the artwork - against 6 and 15 in the other two stickers of the same set.
 * Rendered on a dark card it reads as a pale blob sitting behind the mask and
 * beside her hair.
 *
 * It is background that was never keyed. The keying step floods inward from
 * the image border, so it only reaches white that TOUCHES an edge. A pocket
 * enclosed by hair, mask and body never touches one, survives the key, and
 * then shows up the moment the sticker is placed on anything that is not
 * white. The art pipeline documents exactly this failure.
 *
 * WHAT THIS MUST NOT EAT, which is the whole difficulty: the mask Layla holds
 * is cream and gold, and her eyes carry white highlights. So a pixel is only
 * removed when it is near-white AND nearly colourless AND part of a large
 * connected region - a highlight is small, and cream is saturated.
 *
 *   node scripts/strip-sticker-white-pockets.mjs --check
 *   node scripts/strip-sticker-white-pockets.mjs <file.png>
 */
import sharp from "sharp";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes("--check");
const FILES = ARGS.filter((a) => !a.startsWith("--"));

/* Near-white: bright on every channel and almost colourless. The mask's cream
 * sits well outside this because it is noticeably warmer. */
const MIN_BRIGHT = 232;
const MAX_SAT = 14;

/* A pocket is BIG. An eye highlight or a rim of anti-aliasing is not, and
 * removing those would punch holes in the artwork. */
const MIN_POCKET = 400;

async function pockets(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const isWhite = (i) => {
    const p = i * C;
    if (data[p + 3] < 200) return false;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const mn = Math.min(r, g, b);
    return mn >= MIN_BRIGHT && Math.max(r, g, b) - mn <= MAX_SAT;
  };

  const seen = new Uint8Array(W * H);
  const regions = [];
  for (let s = 0; s < W * H; s++) {
    if (seen[s] || !isWhite(s)) continue;
    const stack = [s];
    const cells = [];
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop();
      cells.push(i);
      const x = i % W, y = (i / W) | 0;
      if (x > 0 && !seen[i - 1] && isWhite(i - 1)) { seen[i - 1] = 1; stack.push(i - 1); }
      if (x < W - 1 && !seen[i + 1] && isWhite(i + 1)) { seen[i + 1] = 1; stack.push(i + 1); }
      if (y > 0 && !seen[i - W] && isWhite(i - W)) { seen[i - W] = 1; stack.push(i - W); }
      if (y < H - 1 && !seen[i + W] && isWhite(i + W)) { seen[i + W] = 1; stack.push(i + W); }
    }
    if (cells.length >= MIN_POCKET) regions.push(cells);
  }
  return { data, W, H, C, regions };
}

const targets = FILES.length
  ? FILES
  : readdirSync("public/cyberheroes/stickers", { recursive: true })
      .filter((f) => String(f).endsWith(".png"))
      .map((f) => join("public/cyberheroes/stickers", String(f)));

let found = 0;
for (const file of targets) {
  if (!existsSync(file)) continue;
  const { data, W, H, C, regions } = await pockets(file);
  const total = regions.reduce((n, r) => n + r.length, 0);
  if (!regions.length) continue;
  found++;
  console.log(`${file}\n  ${regions.length} white pocket(s), ${total} pixels`);
  if (CHECK) continue;

  const out = Buffer.from(data);
  for (const cells of regions) for (const i of cells) out[i * C + 3] = 0;
  await sharp(out, { raw: { width: W, height: H, channels: C } }).png().toFile(file + ".tmp");
  const { renameSync } = await import("node:fs");
  renameSync(file + ".tmp", file);
  console.log("  -> removed");
}

if (!found) {
  console.log("No unkeyed white pockets in any sticker.");
  process.exit(0);
}
if (CHECK) {
  console.log(`\n${found} sticker(s) carry an unkeyed white pocket. Run without --check to strip them.`);
  process.exit(1);
}

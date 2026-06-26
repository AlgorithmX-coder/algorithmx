// Key a flat-white background out of a generated PNG -> transparent.
// White = bright AND desaturated, so coloured/light subject parts (e.g. the
// Raccoon's cyan glow) survive. A small feather band softens the edge halo.
// Usage: node scripts/_bg-remove.mjs <in.png> [out.png]
import sharp from "sharp";

const input = process.argv[2];
const output = process.argv[3] || input;
if (!input) { console.error("usage: _bg-remove.mjs <in.png> [out.png]"); process.exit(1); }

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info; // 4 (RGBA)

let cleared = 0;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mn = Math.min(r, g, b);
  const sat = Math.max(r, g, b) - mn;
  let a = 255;
  if (mn >= 238 && sat <= 14) { a = 0; cleared++; }          // solid white bg
  else if (mn >= 220 && sat <= 22) a = Math.round((238 - mn) / 18 * 255); // feather edge
  data[i + 3] = a;
}

await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9 }).toFile(output);
const pct = ((cleared / (width * height)) * 100).toFixed(0);
console.log(`${output}: ${width}x${height}, cleared ${pct}% to transparent`);

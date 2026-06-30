// Cut the solid dark studio background out of an OpenArt character render
// and write a trimmed transparent PNG, matching the game's character sprite
// format. Flood-fills from the edges so only the connected background is
// removed — interior dark areas (hair, clothes) are preserved.
//
// Usage: node scripts/_character-cut.mjs <in.png> <out.png> [threshold=52]
import sharp from "sharp";

const [inPath, outPath, threshArg] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("usage: node scripts/_character-cut.mjs <in.png> <out.png> [threshold]");
  process.exit(1);
}
const THRESH = Number(threshArg ?? 52);
const T2 = THRESH * THRESH;

const { data, info } = await sharp(inPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const at = (x, y) => (y * W + x) * C;

// Background colour = average of the four corners (the studio bg is near-uniform).
const corners = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]];
const bg = [0, 0, 0];
for (const [x, y] of corners) {
  const i = at(x, y);
  bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2];
}
bg[0] = Math.round(bg[0] / 4); bg[1] = Math.round(bg[1] / 4); bg[2] = Math.round(bg[2] / 4);

const isBg = (x, y) => {
  const i = at(x, y);
  const dr = data[i] - bg[0], dg = data[i + 1] - bg[1], db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db < T2;
};

// Iterative flood fill from every edge pixel.
const seen = new Uint8Array(W * H);
const stack = new Int32Array(W * H * 2); // generous; holds encoded y*W+x
let sp = 0;
const push = (x, y) => { stack[sp++] = y * W + x; };
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

let cleared = 0;
while (sp > 0) {
  const p = stack[--sp];
  const x = p % W, y = (p / W) | 0;
  if (seen[p]) continue;
  if (!isBg(x, y)) continue;
  seen[p] = 1;
  data[at(x, y) + 3] = 0;
  cleared++;
  if (x + 1 < W && sp < stack.length) stack[sp++] = p + 1;
  if (x - 1 >= 0 && sp < stack.length) stack[sp++] = p - 1;
  if (y + 1 < H && sp < stack.length) stack[sp++] = p + W;
  if (y - 1 >= 0 && sp < stack.length) stack[sp++] = p - W;
}

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .png()
  .trim()
  .toFile(outPath);

const pct = ((cleared / (W * H)) * 100).toFixed(1);
console.log(JSON.stringify({ bg, threshold: THRESH, clearedPct: pct, out: outPath }));

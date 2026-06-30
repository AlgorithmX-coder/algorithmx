// Key the white background out of a square head portrait (NO trim, so the
// face stays centred) and resize to the game's head-avatar size. Used for
// adam-head / layla-head / raccoon-head.
// Usage: node scripts/_head-cut.mjs <in.png> <out.png> [size=512]
import sharp from "sharp";

const [inP, outP, sizeArg] = process.argv.slice(2);
const SIZE = Number(sizeArg ?? 512);
const THRESH = 70, T2 = THRESH * THRESH;

const { data, info } = await sharp(inP).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const at = (x, y) => (y * W + x) * C;

const corners = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]];
const bg = [0, 0, 0];
for (const [x, y] of corners) { const i = at(x, y); bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2]; }
bg[0] = Math.round(bg[0] / 4); bg[1] = Math.round(bg[1] / 4); bg[2] = Math.round(bg[2] / 4);

const isBg = (x, y) => {
  const i = at(x, y);
  const dr = data[i] - bg[0], dg = data[i + 1] - bg[1], db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db < T2;
};

const seen = new Uint8Array(W * H);
const stack = new Int32Array(W * H * 2);
let sp = 0;
for (let x = 0; x < W; x++) { stack[sp++] = x; stack[sp++] = (H - 1) * W + x; }
for (let y = 0; y < H; y++) { stack[sp++] = y * W; stack[sp++] = y * W + (W - 1); }
while (sp > 0) {
  const p = stack[--sp];
  const x = p % W, y = (p / W) | 0;
  if (seen[p]) continue;
  if (!isBg(x, y)) continue;
  seen[p] = 1;
  data[at(x, y) + 3] = 0;
  if (x + 1 < W && sp < stack.length) stack[sp++] = p + 1;
  if (x - 1 >= 0 && sp < stack.length) stack[sp++] = p - 1;
  if (y + 1 < H && sp < stack.length) stack[sp++] = p + W;
  if (y - 1 >= 0 && sp < stack.length) stack[sp++] = p - W;
}

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .resize(SIZE, SIZE, { fit: "cover" })
  .png()
  .toFile(outP);
console.log("head ->", outP, "bg", bg);

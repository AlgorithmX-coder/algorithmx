// White-background keyer that ALSO removes enclosed background pockets
// (e.g. the bright gap between a character's raised arms) which an
// edge-flood-fill can't reach. Marks near-white pixels, finds connected
// components, and clears only the LARGE ones (background + enclosed pockets),
// leaving small white features (teeth, eye glints) intact.
// Usage: node scripts/_white-key-cc.mjs <in> <out> [thresh=85] [minPct=0.25]
import sharp from "sharp";

const [inP, outP, threshArg, minPctArg] = process.argv.slice(2);
const T = Number(threshArg ?? 85), T2 = T * T;
const MINPCT = Number(minPctArg ?? 0.25);

const { data, info } = await sharp(inP).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const N = W * H;

const isWhite = new Uint8Array(N);
for (let p = 0; p < N; p++) {
  const i = p * C;
  const dr = 255 - data[i], dg = 255 - data[i + 1], db = 255 - data[i + 2];
  if (dr * dr + dg * dg + db * db < T2) isWhite[p] = 1;
}

const minSize = Math.round((N * MINPCT) / 100);
const seen = new Uint8Array(N);
const stack = new Int32Array(N);
let cleared = 0, comps = 0;

for (let s = 0; s < N; s++) {
  if (seen[s] || !isWhite[s]) continue;
  let sp = 0;
  stack[sp++] = s; seen[s] = 1;
  const comp = [];
  while (sp > 0) {
    const p = stack[--sp];
    comp.push(p);
    const x = p % W, y = (p / W) | 0;
    if (x + 1 < W) { const np = p + 1; if (!seen[np] && isWhite[np]) { seen[np] = 1; stack[sp++] = np; } }
    if (x - 1 >= 0) { const np = p - 1; if (!seen[np] && isWhite[np]) { seen[np] = 1; stack[sp++] = np; } }
    if (y + 1 < H) { const np = p + W; if (!seen[np] && isWhite[np]) { seen[np] = 1; stack[sp++] = np; } }
    if (y - 1 >= 0) { const np = p - W; if (!seen[np] && isWhite[np]) { seen[np] = 1; stack[sp++] = np; } }
  }
  comps++;
  if (comp.length >= minSize) { for (const p of comp) data[p * C + 3] = 0; cleared++; }
}

// Trim to opaque bbox
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (data[(y * W + x) * C + 3] > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
}
const cw = maxX - minX + 1, ch = maxY - minY + 1;

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .extract({ left: minX, top: minY, width: cw, height: ch })
  .png()
  .toFile(outP);
console.log(`-> ${outP}  ${cw}x${ch}  cleared ${cleared}/${comps} components (minSize ${minSize})`);

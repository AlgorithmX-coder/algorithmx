/* Key the 20 generated badges from white to transparent, then trim + resize.
 *
 * NOT a global white key: the art-pipeline skill records what that costs us -
 * any white costume piece (knight armour highlights, week 13's pyjamas,
 * week 20's shirt) gets holes punched through it. So: flood fill inward from
 * the borders, and only background actually connected to the edge goes.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";

const IN = "C:/Users/ASADJA~1/AppData/Local/Temp/badgeout";
const OUT = "C:/Users/ASADJA~1/AppData/Local/Temp/badgekeyed";
await (await import("node:fs/promises")).mkdir(OUT, { recursive: true });

function key(data, W, H, mnFloor, satCeil) {
  /* 0 = unvisited, 1 = background reached from the border */
  const bg = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  let sp = 0;
  const isWhiteish = (i) => {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn >= mnFloor && mx - mn <= satCeil;
  };
  for (let x = 0; x < W; x++) {
    for (const y of [0, H - 1]) { const i = y * W + x; if (!bg[i] && isWhiteish(i)) { bg[i] = 1; stack[sp++] = i; } }
  }
  for (let y = 0; y < H; y++) {
    for (const x of [0, W - 1]) { const i = y * W + x; if (!bg[i] && isWhiteish(i)) { bg[i] = 1; stack[sp++] = i; } }
  }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % W, y = (i - x) / W;
    if (x > 0) { const j = i - 1; if (!bg[j] && isWhiteish(j)) { bg[j] = 1; stack[sp++] = j; } }
    if (x < W - 1) { const j = i + 1; if (!bg[j] && isWhiteish(j)) { bg[j] = 1; stack[sp++] = j; } }
    if (y > 0) { const j = i - W; if (!bg[j] && isWhiteish(j)) { bg[j] = 1; stack[sp++] = j; } }
    if (y < H - 1) { const j = i + W; if (!bg[j] && isWhiteish(j)) { bg[j] = 1; stack[sp++] = j; } }
  }
  return bg;
}

/* Does the fill reach the middle of the picture? A badge medal sits dead
 * centre, so if the background got there it crossed the silhouette. */
function leaked(bg, W, H) {
  const r = Math.round(Math.min(W, H) * 0.08);
  let hit = 0, tot = 0;
  for (let y = (H >> 1) - r; y <= (H >> 1) + r; y++) {
    for (let x = (W >> 1) - r; x <= (W >> 1) + r; x++) { tot++; if (bg[y * W + x]) hit++; }
  }
  return hit / tot > 0.2;
}

const files = (await readdir(IN)).filter((f) => f.endsWith("-raw.png")).sort();
for (const f of files) {
  const src = `${IN}/${f}`;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  let mnFloor = 220, satCeil = 20, tight = false;
  let bg = key(data, W, H, mnFloor, satCeil);
  if (leaked(bg, W, H)) {
    tight = true; mnFloor = 244; satCeil = 10;
    bg = key(data, W, H, mnFloor, satCeil);
  }

  let cleared = 0, feathered = 0;
  for (let i = 0; i < W * H; i++) if (bg[i]) { data[i * 4 + 3] = 0; cleared++; }

  /* Feather the 1px rim so a tight fill does not leave a hard white halo. */
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (bg[i] || data[i * 4 + 3] === 0) continue;
      const nb = (x > 0 && bg[i - 1]) || (x < W - 1 && bg[i + 1]) || (y > 0 && bg[i - W]) || (y < H - 1 && bg[i + W]);
      if (!nb) continue;
      const mn = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      if (mn >= 230) { data[i * 4 + 3] = 128; feathered++; }
    }
  }

  const pct = ((cleared / (W * H)) * 100).toFixed(1);
  const out = `${OUT}/${f.replace("-raw", "")}`;
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .trim({ threshold: 8 })
    .resize({ height: 512 })
    .toFile(out);
  const m = await sharp(out).metadata();
  console.log(`${f.slice(0, 3)}  ${tight ? "TIGHT" : "wide "}  cleared ${pct}%  feather ${String(feathered).padStart(5)}  -> ${m.width}x${m.height}`);
}

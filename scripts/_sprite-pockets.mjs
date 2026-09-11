// Sprite "pocket" audit + heal for the keyed character art (Cyber Heroes art pipeline).
//
// The white-background keyer also punches ENCLOSED pure-white pockets so the gap
// between a raised arm and the head goes transparent. Side effect discovered on the
// themed Raccoon set (2026-09-11): the raccoon's white FACE MARKINGS (brow streaks,
// muzzle patches) and flat specular highlights on silver armour are pure white too,
// so they get punched out and read as dark holes on the arena.
//
// A defective pocket has a NEAR-WHITE rim (it sits inside white fur / silver); a
// genuine background gap has the darker body outline as its rim. This script lists
// enclosed transparent pockets per sprite, flags the near-white-rim ones, and with
// --heal fills them with the mean rim colour and solidifies the feathered ring.
//
//   node scripts/_sprite-pockets.mjs <glob-dir> [--heal] [--out <dir>]
//   node scripts/_sprite-pockets.mjs public/game/characters --out .pockets
//   node scripts/_sprite-pockets.mjs public/game/characters --heal --out .pockets
//
// Rules (tuned on 100 raccoon sprites, verified by eye): face marking = rim min-channel
// >= 238, rim saturation <= 15, area <= 600 px, in the upper 62% of the canvas.
// Extra per-file rules can be added in EXTRA below. Always LOOK at the crops.
import sharp from "sharp";
import { readdirSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith("--")) || "public/game/characters";
const heal = args.includes("--heal");
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : ".pockets";
mkdirSync(join(OUT, "crops"), { recursive: true });

const EXTRA = [
  // Week 15 reporter taunt: silver chest-plate highlights (rim 225-233).
  { match: /w15[\\/]raccoon-reporter-taunt/, test: (d) => d.rimMn >= 215 && d.rimSat <= 14 && d.area <= 2500 && d.box[1] >= 300 && d.box[1] <= 520 },
];
const isDefect = (file, d) => (d.rimMn >= 238 && d.rimSat <= 15 && d.area <= 600 && d.box[1] < 560) || EXTRA.some((e) => e.match.test(file) && e.test(d));

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.png$/i.test(f)) out.push(p);
  }
  return out;
}

const files = walk(root);
const report = [];
let healedPockets = 0, healedSprites = 0;
for (const file of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const idx = (x, y) => (y * W + x) * 4;
  const transparent = (x, y) => data[idx(x, y) + 3] < 8;
  const outer = new Uint8Array(W * H);
  const st = [];
  for (let x = 0; x < W; x++) st.push(x, 0, x, H - 1);
  for (let y = 0; y < H; y++) st.push(0, y, W - 1, y);
  while (st.length) {
    const y = st.pop(), x = st.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const p = y * W + x;
    if (outer[p] || !transparent(x, y)) continue;
    outer[p] = 1;
    st.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  const seen = new Uint8Array(W * H);
  const pockets = [];
  for (let y0 = 0; y0 < H; y0++) for (let x0 = 0; x0 < W; x0++) {
    const p0 = y0 * W + x0;
    if (seen[p0] || outer[p0] || !transparent(x0, y0)) continue;
    const comp = []; const q = [p0]; seen[p0] = 1;
    let minX = x0, maxX = x0, minY = y0, maxY = y0;
    const rim = []; let rimMn = 0, rimSat = 0;
    while (q.length) {
      const p = q.pop(); comp.push(p);
      const x = p % W, y = (p / W) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const np = ny * W + nx;
        if (transparent(nx, ny)) { if (!seen[np]) { seen[np] = 1; q.push(np); } }
        else { const i = idx(nx, ny); const m = Math.min(data[i], data[i + 1], data[i + 2]); rim.push(i); rimMn += m; rimSat += Math.max(data[i], data[i + 1], data[i + 2]) - m; }
      }
    }
    if (comp.length < 120) continue;
    const d = { area: comp.length, box: [minX, minY, maxX - minX + 1, maxY - minY + 1], rimMn: Math.round(rimMn / (rim.length || 1)), rimSat: Math.round(rimSat / (rim.length || 1)) };
    d.defect = isDefect(file, d);
    pockets.push({ d, comp, rim });
  }
  const defects = pockets.filter((p) => p.d.defect);
  report.push({ file, pockets: pockets.length, defects: defects.map((p) => p.d) });
  if (!defects.length) continue;
  const before = Buffer.from(data);
  if (heal) {
    for (const p of defects) {
      let rr = 0, gg = 0, bb = 0;
      for (const i of p.rim) { rr += data[i]; gg += data[i + 1]; bb += data[i + 2]; }
      const n = p.rim.length; rr = Math.round(rr / n); gg = Math.round(gg / n); bb = Math.round(bb / n);
      for (const px of p.comp) { const i = px * 4; data[i] = rr; data[i + 1] = gg; data[i + 2] = bb; data[i + 3] = 255; }
      // solidify the feathered ring the keyer left around the marking
      const [bx, by, bw, bh] = p.d.box;
      for (let y = Math.max(0, by - 3); y < Math.min(H, by + bh + 3); y++) for (let x = Math.max(0, bx - 3); x < Math.min(W, bx + bw + 3); x++) {
        const i = idx(x, y); const a = data[i + 3];
        if (a >= 8 && a < 250 && Math.min(data[i], data[i + 1], data[i + 2]) >= 170) data[i + 3] = 255;
      }
      healedPockets++;
    }
    await sharp(Buffer.from(data.buffer), { raw: { width: W, height: H, channels: 4 } }).png().toFile(file);
    healedSprites++;
  }
  // crop: before | after (or just before in audit mode), 3x on magenta
  const minX = Math.min(...defects.map((p) => p.d.box[0])), minY = Math.min(...defects.map((p) => p.d.box[1]));
  const maxX = Math.max(...defects.map((p) => p.d.box[0] + p.d.box[2])), maxY = Math.max(...defects.map((p) => p.d.box[1] + p.d.box[3]));
  const pad = 30, left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
  const cw = Math.min(W - left, maxX - minX + pad * 2), ch = Math.min(H - top, maxY - minY + pad * 2);
  const name = file.replace(/[\\/]/g, "_").replace(/\.png$/i, "");
  const b = await sharp(before, { raw: { width: W, height: H, channels: 4 } }).extract({ left, top, width: cw, height: ch }).resize({ width: 300, kernel: "nearest" }).flatten({ background: "#ff00ff" }).png().toBuffer();
  const a = await sharp(Buffer.from(data.buffer), { raw: { width: W, height: H, channels: 4 } }).extract({ left, top, width: cw, height: ch }).resize({ width: 300, kernel: "nearest" }).flatten({ background: "#ff00ff" }).png().toBuffer();
  const bm = await sharp(b).metadata();
  await sharp({ create: { width: 620, height: bm.height, channels: 4, background: "#222" } }).composite([{ input: b, left: 0, top: 0 }, { input: a, left: 320, top: 0 }]).png().toFile(join(OUT, "crops", name + ".png"));
}
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 1));
const flagged = report.filter((r) => r.defects.length);
console.log(`sprites ${report.length} | enclosed pockets ${report.reduce((a, r) => a + r.pockets, 0)} | defect pockets ${flagged.reduce((a, r) => a + r.defects.length, 0)} in ${flagged.length} sprites${heal ? ` | HEALED ${healedPockets} in ${healedSprites}` : " (audit only; add --heal to fix)"}`);
for (const r of flagged) console.log("  " + r.file + ": " + r.defects.map((d) => `${d.area}px@${d.box[0]},${d.box[1]} rim${d.rimMn}/${d.rimSat}`).join(" | "));

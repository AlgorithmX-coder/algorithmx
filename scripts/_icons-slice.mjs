// Slice the OpenArt icon grids into individual transparent PNGs.
//
// For each grid: cut into cells (cols x rows, defaults 3x2), flood-fill the
// white background to transparent FROM THE EDGES (so interior whites — a
// checkmark, the no-entry centre — survive), trim, and normalise onto a
// 256x256 canvas.
//
// node scripts/_icons-slice.mjs [file-substring]
//   With an argument, only grids whose file path contains it are sliced
//   (e.g. `w2-grid1` to re-slice one grid without touching the rest).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const GRIDS = [
  { file: ".openart-tmp/pilot-icons.png", names: ["key", "shield", "padlock", "raccoon", "brain", "magnifier"] },
  { file: ".openart-tmp/grid1-strength.png", names: ["ruler", "dice", "number-blocks", "letter-blocks", "symbol-keys", "palette"] },
  { file: ".openart-tmp/grid2-secrecy.png", names: ["shush", "zipper-mouth", "no-entry", "name-tag", "cake", "keyboard"] },
  { file: ".openart-tmp/grid3-people.png", names: ["family", "detective", "swirl", "id-card", "skeleton-key", "padlock-open"] },
  { file: ".openart-tmp/grid4-rewards.png", names: ["party", "check-badge", "target", "star", "sparkles", "trophy"] },
  { file: ".openart-tmp/grid5-energy.png", names: ["lightning", "diamond", "medal", "mouse-trap", "hospital", "door"] },
  { file: ".openart-tmp/grid6-misc.png", names: ["muscle", "rocket", "gift", "hammer", "padlock-key", "sparkle-star"] },
  { file: ".openart-tmp/grid7-tools.png", names: ["lowercase-blocks", "trash", "shuffle", "clipboard", "link", "gear"] },
  { file: ".openart-tmp/grid8-feedback.png", names: ["skull", "home", "thumbs-up", "lightbulb", "bell", "eye"] },
  // Week 2 · Private Info (4x3 grid)
  { file: ".openart-tmp/w2-grid1-privacy.png", cols: 4, rows: 3, smartCuts: true, names: [
    "map-pin", "school", "smartphone", "mask",
    "globe", "question-mark", "gamepad", "envelope",
    "hero-cape", "pause-button", "stop-hand", "speech-bubble",
  ] },
];

const OUT = "public/cyberheroes/icons";
await mkdir(OUT, { recursive: true });

// Light AND low-saturation = white background or its soft grey drop-shadow.
// Threshold lowered to 202 so the shadow gradient under each icon clears
// too (it was leaving a grey ghost on light cards). Saturated/coloured icon
// pixels and darker detail are kept; the only cost is a little erosion on
// the couple of pale-grey icons (keyboard / name-tag), which is acceptable.
function isBg(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r > 202 && g > 202 && b > 202 && max - min < 28;
}

// Generated grids don't always land on an exact lattice — icons can cross the
// uniform W/cols boundaries. smartCuts scans the grid for blank gullies
// (rows/columns containing only background) and places each cut inside the
// gully nearest its ideal lattice position, so a tall or shifted icon is
// never split. Falls back to the lattice position when no gully exists.
async function findCuts(file, cols, rows) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const colHas = new Uint8Array(W);
  const rowHas = new Uint8Array(H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      if (!isBg(data[o], data[o + 1], data[o + 2])) { colHas[x] = 1; rowHas[y] = 1; }
    }
  }
  const cutsIn = (has, size, parts) => {
    const cuts = [0];
    for (let i = 1; i < parts; i++) {
      const ideal = Math.round((size * i) / parts);
      let best = ideal, bestDist = Infinity;
      for (let p = 0; p < size; p++) {
        if (has[p]) continue;
        const d = Math.abs(p - ideal);
        if (d < bestDist) { bestDist = d; best = p; }
      }
      cuts.push(best);
    }
    cuts.push(size);
    return cuts;
  };
  return { xCuts: cutsIn(colHas, W, cols), yCuts: cutsIn(rowHas, H, rows) };
}

async function sliceGrid({ file, names, cols = 3, rows = 2, smartCuts = false }) {
  const meta = await sharp(file).metadata();
  const W = meta.width ?? 1360;
  const H = meta.height ?? 1360;
  const cw = Math.floor(W / cols);
  const ch = Math.floor(H / rows);
  const cuts = smartCuts ? await findCuts(file, cols, rows) : null;

  for (let idx = 0; idx < cols * rows; idx++) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const box = cuts
      ? { left: cuts.xCuts[col], top: cuts.yCuts[row], width: cuts.xCuts[col + 1] - cuts.xCuts[col], height: cuts.yCuts[row + 1] - cuts.yCuts[row] }
      : { left: col * cw, top: row * ch, width: cw, height: ch };
    const { data, info } = await sharp(file)
      .extract(box)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height;
    const visited = new Uint8Array(w * h);
    const stackX = [];
    const stackY = [];
    const visit = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (visited[p]) return;
      visited[p] = 1;
      const o = p * 4;
      if (isBg(data[o], data[o + 1], data[o + 2])) {
        data[o + 3] = 0;
        stackX.push(x);
        stackY.push(y);
      }
    };
    for (let x = 0; x < w; x++) { visit(x, 0); visit(x, h - 1); }
    for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
    while (stackX.length) {
      const x = stackX.pop();
      const y = stackY.pop();
      visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
    }
    const trimmed = await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } })
      .png()
      .trim()
      .toBuffer();
    await sharp(trimmed)
      .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}/${names[idx]}.png`);
    process.stdout.write(`${names[idx]} `);
  }
}

const filter = process.argv[2];
for (const g of GRIDS) {
  if (filter && !g.file.includes(filter)) continue;
  await sliceGrid(g);
}
console.log("\ndone -> " + OUT);

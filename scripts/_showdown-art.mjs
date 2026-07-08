// Showdown boss art processing: white-key -> alpha, trim, resize, install.
// Turns a week's raw OpenArt downloads into game-ready sprites following
// the locked naming convention (see boss-battles-design.md §5).
//
//   node scripts/_showdown-art.mjs --dir=<raw dir> --week=3 --machine=disguiseomatic --outfit=detective --arena=playground
//
// Expects in <raw dir>: adam-idle/attack/celebrate.png, layla-idle/attack/
// celebrate.png (or *-v2.png retakes, preferred when present),
// machine-intact/damaged/defeated.png, arena.png — all on PURE WHITE.
// Installs:
//   public/game/characters/w{NN}/{adam,layla}-{outfit}-{pose}.png  (h=900)
//   public/game/bosses/w{NN}-{machine}-{state}.png                 (h=700)
//   public/game/backgrounds/w{NN}-arena-{arena}.png                (1920x1080)
import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const SRC = arg("dir");
const week = Number(arg("week"));
const machine = arg("machine");
const outfit = arg("outfit");
const arena = arg("arena");
if (!SRC || !week || !machine || !outfit || !arena) {
  console.error("usage: _showdown-art.mjs --dir=<raw dir> --week=N --machine=<slug> --outfit=<slug> --arena=<slug>");
  process.exit(1);
}
const NN = String(week).padStart(2, "0");
const ROOT = process.cwd();

async function pick(base) {
  const v2 = join(SRC, `${base}-v2.png`);
  try {
    await access(v2);
    return v2;
  } catch {
    return join(SRC, `${base}.png`);
  }
}

/** White = bright AND desaturated (same policy as scripts/_bg-remove.mjs). */
async function whiteKey(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - mn;
    let a = 255;
    if (mn >= 238 && sat <= 14) a = 0;
    else if (mn >= 220 && sat <= 22) a = Math.round(((238 - mn) / 18) * 255);
    data[i + 3] = Math.min(a, data[i + 3]);
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function sprite(src, out, targetH) {
  const keyed = await whiteKey(src);
  const abs = join(ROOT, out);
  await mkdir(dirname(abs), { recursive: true });
  await sharp(keyed).trim({ threshold: 8 }).resize({ height: targetH, fit: "inside" }).png({ compressionLevel: 9 }).toFile(abs);
  const m = await sharp(abs).metadata();
  console.log(`${out}: ${m.width}x${m.height}`);
}

async function background(src, out) {
  const abs = join(ROOT, out);
  await mkdir(dirname(abs), { recursive: true });
  await sharp(src).resize(1920, 1080, { fit: "cover" }).png({ compressionLevel: 9 }).toFile(abs);
  const m = await sharp(abs).metadata();
  console.log(`${out}: ${m.width}x${m.height}`);
}

for (const hero of ["adam", "layla"]) {
  for (const pose of ["idle", "attack", "celebrate"]) {
    await sprite(await pick(`${hero}-${pose}`), `public/game/characters/w${NN}/${hero}-${outfit}-${pose}.png`, 900);
  }
}
for (const state of ["intact", "damaged", "defeated"]) {
  await sprite(await pick(`machine-${state}`), `public/game/bosses/w${NN}-${machine}-${state}.png`, 700);
}
await background(await pick("arena"), `public/game/backgrounds/w${NN}-arena-${arena}.png`);
console.log("\nDone.");

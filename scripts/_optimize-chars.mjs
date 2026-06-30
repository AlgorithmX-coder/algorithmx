// One-off: optimise the recreated character textures. They shipped at
// 3.5–5 MB each (2256px), so the boss fight had to load ~21 MB of PNGs into
// WebGL before setReady() fired — it looked frozen on the backdrop. Cap at
// 900px tall + palette-quantise; Pixi sprites scale relative to texture
// height so in-game sizing is unchanged.
import sharp from "sharp";
import fs from "fs";

const dir = "public/game/characters";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
let before = 0, after = 0;

for (const f of files) {
  const p = `${dir}/${f}`;
  const buf = fs.readFileSync(p);
  before += buf.length;
  const meta = await sharp(buf).metadata();
  await sharp(buf)
    .resize({ height: 900, withoutEnlargement: true })
    .png({ palette: true, quality: 90, effort: 9 })
    .toFile(p + ".tmp");
  const sz = fs.statSync(p + ".tmp").size;
  fs.renameSync(p + ".tmp", p);
  after += sz;
  console.log(`${f}: ${meta.width}x${meta.height} ${Math.round(buf.length / 1024)}KB -> ${Math.round(sz / 1024)}KB`);
}
console.log(`\nTOTAL: ${Math.round(before / 1024 / 1024)}MB -> ${Math.round(after / 1024 / 1024)}MB`);

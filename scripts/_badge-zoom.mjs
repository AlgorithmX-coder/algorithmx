/* Four badges per sheet at ~700px so faces, hands and any rendered text are
 * legible. Reads the INSTALLED files by each week's badgeArt path, so the
 * sheet shows what the product shows.
 *
 * The art-pipeline skill is explicit: inspect full size before install, because
 * a sixth finger or a garbled word is invisible in a thumbnail and permanent
 * once it ships.
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const OUT = process.env.SHEET_DIR;
const CELL = 700, LABEL = 30;

const paths = [];
for (let w = 1; w <= 20; w++) {
  const src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  const m = /badgeArt:\s*"([^"]+)"/.exec(src);
  if (!m) throw new Error(`week ${w} has no badgeArt`);
  paths.push(`public${m[1]}`);
}

for (let s = 0; s < 5; s++) {
  const cells = [];
  for (let k = 0; k < 4; k++) {
    const w = s * 4 + k + 1;
    const buf = await sharp(paths[w - 1]).resize({ width: CELL - 20, height: CELL - LABEL - 20, fit: "inside" }).toBuffer();
    const m = await sharp(buf).metadata();
    const col = k % 2, row = Math.floor(k / 2);
    cells.push({ input: buf, left: col * CELL + Math.round((CELL - m.width) / 2), top: row * CELL + LABEL + Math.round((CELL - LABEL - m.height) / 2) });
    const name = paths[w - 1].split("/").pop().replace(/\.png$/, "");
    cells.push({ input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><text x="10" y="22" font-family="monospace" font-size="19" fill="#ffffff">${name}</text></svg>`), left: col * CELL, top: row * CELL });
  }
  const file = `${OUT}/badges-closeup-${s + 1}.png`;
  await sharp({ create: { width: CELL * 2, height: CELL * 2, channels: 3, background: "#101826" } }).composite(cells).png().toFile(file);
  console.log(file);
}

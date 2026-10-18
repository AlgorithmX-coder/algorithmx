/* Contact sheet of the badges AS INSTALLED, read from public/ by the exact
 * path each week's badgeArt points at - not from the staging folder. Rule 12:
 * the check has to read what the product reads, or it is checking something
 * else.
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const OUT = process.env.SHEET_DIR;
const CELL = 300, COLS = 5, ROWS = 4, LABEL = 26;

const paths = [];
for (let w = 1; w <= 20; w++) {
  const src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  const m = /badgeArt:\s*"([^"]+)"/.exec(src);
  if (!m) throw new Error(`week ${w} has no badgeArt`);
  paths.push(`public${m[1]}`);
}

const cells = [];
for (let w = 1; w <= 20; w++) {
  const buf = await sharp(paths[w - 1])
    .resize({ width: CELL - 16, height: CELL - LABEL - 16, fit: "inside" })
    .toBuffer();
  const m = await sharp(buf).metadata();
  const col = (w - 1) % COLS, row = Math.floor((w - 1) / COLS);
  cells.push({ input: buf, left: col * CELL + Math.round((CELL - m.width) / 2), top: row * CELL + LABEL + Math.round((CELL - LABEL - m.height) / 2) });
  const name = paths[w - 1].split("/").pop().replace(/^week-\d\d-/, "").replace(/\.png$/, "");
  cells.push({ input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><text x="8" y="19" font-family="monospace" font-size="15" fill="#ffffff">${w}. ${name}</text></svg>`), left: col * CELL, top: row * CELL });
}
const file = `${OUT}/badges-installed.png`;
await sharp({ create: { width: CELL * COLS, height: CELL * ROWS, channels: 3, background: "#0a1024" } }).composite(cells).png().toFile(file);
console.log(file);

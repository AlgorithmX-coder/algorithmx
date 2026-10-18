/* Four badges per sheet at ~700px so faces, hands and any rendered text are
 * actually legible. The art-pipeline skill is explicit: inspect full size
 * before install, because a sixth finger or a garbled word is invisible in a
 * thumbnail and permanent once it ships.
 */
import sharp from "sharp";
const IN = "C:/Users/ASADJA~1/AppData/Local/Temp/badgekeyed";
const OUT = process.env.SHEET_DIR;
const CELL = 700, LABEL = 30;
for (let s = 0; s < 5; s++) {
  const weeks = [1, 2, 3, 4].map((n) => s * 4 + n);
  const cells = [];
  for (let k = 0; k < 4; k++) {
    const ww = String(weeks[k]).padStart(2, "0");
    const buf = await sharp(`${IN}/w${ww}.png`).resize({ width: CELL - 20, height: CELL - LABEL - 20, fit: "inside" }).toBuffer();
    const m = await sharp(buf).metadata();
    const col = k % 2, row = Math.floor(k / 2);
    cells.push({ input: buf, left: col * CELL + Math.round((CELL - m.width) / 2), top: row * CELL + LABEL + Math.round((CELL - LABEL - m.height) / 2) });
    cells.push({ input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><text x="10" y="22" font-family="monospace" font-size="20" fill="#ffffff">week ${ww}</text></svg>`), left: col * CELL, top: row * CELL });
  }
  const file = `${OUT}/zoom-${s + 1}.png`;
  await sharp({ create: { width: CELL * 2, height: CELL * 2, channels: 3, background: "#101826" } }).composite(cells).png().toFile(file);
  console.log(file);
}

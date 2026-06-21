// One-off: right-size + compress the OpenArt-generated PNGs for web.
import sharp from "sharp";
import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const JOBS = [
  { dir: "public/cyberheroes/alerts", width: 1100, opts: { compressionLevel: 9, palette: true, quality: 88 } },
  { dir: "public/cyberheroes/scenes", width: 1600, opts: { compressionLevel: 9 } },
  { dir: "public/cyberheroes/characters", width: 900, opts: { compressionLevel: 9, palette: true, quality: 90 } },
  { dir: "public/game/characters", width: 512, only: ["adam-head.png", "layla-head.png", "raccoon-head.png"], opts: { compressionLevel: 9, palette: true, quality: 90 } },
];

let before = 0, after = 0, n = 0;
for (const job of JOBS) {
  let files;
  try { files = await readdir(job.dir); } catch { continue; }
  for (const f of files) {
    if (!f.endsWith(".png")) continue;
    if (job.only && !job.only.includes(f)) continue;
    const p = join(job.dir, f);
    const b0 = (await stat(p)).size;
    const buf = await sharp(p).resize({ width: job.width, withoutEnlargement: true }).png(job.opts).toBuffer();
    await writeFile(p, buf);
    before += b0; after += buf.length; n++;
    console.log(`${f.padEnd(26)} ${(b0 / 1024).toFixed(0).padStart(5)}KB -> ${(buf.length / 1024).toFixed(0).padStart(4)}KB`);
  }
}
console.log(`\n${n} files | ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);

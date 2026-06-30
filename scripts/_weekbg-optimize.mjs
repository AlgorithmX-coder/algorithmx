// Optimize generated week-backdrop strips for the dashboard.
// Source: art-review/week-bg/week-<n>.png  (raw OpenArt render, on pure black,
//         gitignored like all art-review scratch renders)
// Output: public/dashboard/week-bg/week-<n>.png  (~1500px wide, palette PNG)
//
// These are screen-blended at low opacity behind each week card, so they only
// need to be light + crisp — a wide resize + palette keeps them tiny.
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC = "art-review/week-bg";
const OUT = "public/dashboard/week-bg";
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2); // optional: specific week numbers
const files = fs
  .readdirSync(SRC)
  .filter((f) => /^week-\d+\.png$/.test(f))
  .filter((f) => only.length === 0 || only.includes(f.match(/\d+/)[0]));

for (const f of files.sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0])) {
  const out = path.join(OUT, f);
  await sharp(path.join(SRC, f))
    .resize(1500, null, { fit: "inside" })
    .png({ palette: true, quality: 82, effort: 9 })
    .toFile(out);
  console.log(`${f}  ${Math.round(fs.statSync(out).size / 1024)}KB`);
}

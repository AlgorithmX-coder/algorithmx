import sharp from "sharp";
import fs from "fs";
fs.mkdirSync("public/hub", { recursive: true });
const map = {
  "track-cyber-heroes": "shield",
  "track-cyberexplorers": "telescope",
  "track-cyberstart": "rocket",
  "track-cyberstart-pro": "building",
  "icon-mission": "lock",
  "icon-progress": "galaxy",
  "icon-family": "family",
};
for (const [out, src] of Object.entries(map)) {
  await sharp(`art-review/hub-${src}.png`)
    .resize(440, 440, { fit: "inside" })
    .png({ palette: true, quality: 90, effort: 9 })
    .toFile(`public/hub/${out}.png`);
  console.log(`${out}.png ${Math.round(fs.statSync(`public/hub/${out}.png`).size / 1024)}KB`);
}

import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
const src = join(D, "hex-1440x900-b-open.png"); // 2880x1800
const crops = [
  { name: "q-ground",   left: 760, top: 1180, width: 1400, height: 600 }, // explosion/platform
  { name: "q-dark",     left: 40,  top: 1180, width: 600,  height: 560 }, // dark-region (banding)
  { name: "q-edge",     left: 1180,top: 560,  width: 700,  height: 520 }, // laptop silhouette edge
];
for (const c of crops) { await sharp(src).extract({left:c.left,top:c.top,width:c.width,height:c.height}).toFile(join(D, `${c.name}.png`)); console.log("wrote",c.name); }

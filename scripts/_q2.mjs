import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
const src = join(D,"hex-1440x900-b-open.png"); // 2880x1800
const crops = [
  { name:"q2-laptop", left: 980, top: 380, width: 1000, height: 620 },
  { name:"q2-reactor", left: 300, top: 980, width: 1500, height: 760 },
];
for (const c of crops) await sharp(src).extract({left:c.left,top:c.top,width:c.width,height:c.height}).toFile(join(D,`${c.name}.png`));
console.log("done");

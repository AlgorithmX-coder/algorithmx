import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
const src = join(D, "hex-1440x900-a-reveal.png");
const crops = [
  { name: "frag-farleft", left: 0, top: 380, width: 760, height: 760 },
  { name: "frag-farright", left: 2300, top: 360, width: 580, height: 820 },
];
for (const c of crops) {
  await sharp(src).extract(c.left!==undefined?{left:c.left,top:c.top,width:c.width,height:c.height}:c)
    .toFile(join(D, `${c.name}.png`));
  console.log("wrote", c.name);
}

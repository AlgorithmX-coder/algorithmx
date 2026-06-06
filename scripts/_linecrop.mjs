import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
for (const [tag,src] of [["after","hex-1440x900-b-open.png"],["before","linebaseline/hex-1440x900-b-open.png"]]) {
  await sharp(join(D,src)).extract({ left: 430, top: 820, width: 760, height: 420 })
    .resize(1520, 840, { kernel: "nearest" }).toFile(join(D, `line-macro-${tag}.png`));
}
console.log("done");

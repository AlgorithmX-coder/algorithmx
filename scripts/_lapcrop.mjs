import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
// laptop close crop from the 1440 open frame (2880x1800)
await sharp(join(D,"hex-1440x900-b-open.png"))
  .extract({ left: 880, top: 150, width: 1500, height: 1300 })
  .toFile(join(D,"laptop-crop.png"));
console.log("wrote laptop-crop");

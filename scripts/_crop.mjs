import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
// Use the reveal frame (laptop opening — least floor occlusion) for the
// floor-shape crops; full image is 2880x1800 (1440x900 @ DSR2).
const src = join(D, "hex-1440x900-a-reveal.png");
const meta = await sharp(src).metadata();
console.log("src size", meta.width, meta.height);
const crops = [
  // under/front of laptop — crispness + contact-zone hero cluster
  { name: "crop-center", left: 1000, top: 1040, width: 900, height: 580 },
  // left perimeter — irregular boundary, bites, cutouts, dark void
  { name: "crop-perimeter-left", left: 40, top: 800, width: 860, height: 780 },
  // right perimeter — fragment cluster + boundary
  { name: "crop-perimeter-right", left: 2040, top: 880, width: 820, height: 740 },
  // far field — distant fragment + top boundary dissolve
  { name: "crop-far", left: 720, top: 540, width: 1440, height: 340 },
  // extreme foreground — near-camera dissolve into black
  { name: "crop-bottom", left: 700, top: 1470, width: 1480, height: 330 },
];
for (const c of crops) {
  await sharp(src)
    .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
    .toFile(join(D, `${c.name}.png`));
  console.log("wrote", c.name);
}

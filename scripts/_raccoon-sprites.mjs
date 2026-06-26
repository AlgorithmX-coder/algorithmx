// Turn the white-bg raccoon renders into boss sprites: white-key out the
// background (sat-guarded + feathered) then fit onto the original 2256x1648
// frame so they drop into BossBattle without shifting the layout.
import sharp from "sharp";

const POSES = {
  idle: ".openart-tmp/raccoon-white.png",
  attack: ".openart-tmp/raccoon-attack.png",
  hurt: ".openart-tmp/raccoon-hurt.png",
  taunt: ".openart-tmp/raccoon-taunt.png",
  defeated: ".openart-tmp/raccoon-defeated.png",
};
const FRAME = { w: 2256, h: 1648 };

for (const [pose, input] of Object.entries(POSES)) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - mn;
    let a = 255;
    if (mn >= 238 && sat <= 14) a = 0;                                  // solid white
    else if (mn >= 220 && sat <= 22) a = Math.round((238 - mn) / 18 * 255); // feather
    data[i + 3] = a;
  }
  const keyed = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();
  const out = `public/game/characters/raccoon-${pose}.png`;
  await sharp(keyed)
    .resize(FRAME.w, FRAME.h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const sz = (await sharp(out).metadata());
  console.log(`${out}: ${sz.width}x${sz.height}`);
}
console.log("done");

// Flatten a transparent PNG onto a solid colour so keying can be eyeballed.
// Usage: node scripts/_preview-bg.mjs <in.png> <out.png> [#hex=ff00ff]
import sharp from "sharp";
const [inP, outP, color] = process.argv.slice(2);
const bg = color || "#ff00ff";
const meta = await sharp(inP).metadata();
await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: bg } })
  .composite([{ input: inP }])
  .png()
  .toFile(outP);
console.log("wrote", outP, meta.width + "x" + meta.height);

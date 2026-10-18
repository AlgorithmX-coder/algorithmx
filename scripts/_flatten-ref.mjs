import sharp from "sharp";
const [src, out, w] = process.argv.slice(2);
await sharp(src).resize({ width: Number(w || 700), withoutEnlargement: true })
  .flatten({ background: "#ffffff" }).png().toFile(out);
const m = await sharp(out).metadata();
console.log(`  ${out}  ${m.width}x${m.height}`);

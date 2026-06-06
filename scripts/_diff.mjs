import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
const a = join(D, "baseline", "laptop-crop.png");
const b = join(D, "laptop-crop.png");
const meta = await sharp(a).metadata();
// difference blend -> bright where changed, black where identical
const diff = await sharp(a)
  .composite([{ input: b, blend: "difference" }])
  .toBuffer();
await sharp(diff).toFile(join(D, "laptop-diff.png"));
// quantify mean difference
const stats = await sharp(diff).stats();
const meanByCh = stats.channels.map((c) => c.mean.toFixed(3));
const overall = (stats.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3).toFixed(3);
console.log("diff size", meta.width+"x"+meta.height);
console.log("per-channel mean diff (0-255):", meanByCh.join(", "));
console.log("overall mean RGB diff:", overall, "(0 = identical)");
console.log("max per-channel:", stats.channels.map(c=>c.max).join(", "));

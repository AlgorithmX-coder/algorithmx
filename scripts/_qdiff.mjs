import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts","verify-out");
const a = join(D,"qbaseline","laptop-crop.png"), b = join(D,"laptop-crop.png");
const diff = await sharp(a).composite([{input:b,blend:"difference"}]).linear(4,0).toBuffer();
await sharp(diff).toFile(join(D,"q-laptop-diff-x4.png"));
const st = await sharp(await sharp(a).composite([{input:b,blend:"difference"}]).toBuffer()).stats();
console.log("laptop crop (v9 pre-pass vs after) mean RGB diff:", (st.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3).toFixed(3));

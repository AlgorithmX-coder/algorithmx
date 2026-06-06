import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
const region = { left: 430, top: 980, width: 620, height: 170 };
async function reg(p){ return sharp(p).extract(region).toBuffer(); }
async function md(p1,p2){
  const d = await sharp(await reg(p1)).composite([{input: await reg(p2), blend:"difference"}]).toBuffer();
  const st = await sharp(d).stats();
  return (st.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3);
}
// brighten the diff for visibility and save
const d = await sharp(await reg(join(D,"baseline","laptop-crop.png")))
  .composite([{input: await reg(join(D,"laptop-crop.png")), blend:"difference"}])
  .linear(4,0).toBuffer();
await sharp(d).toFile(join(D,"chassis-diff-x4.png"));
console.log("after(laptop-crop) vs after(ctrl-a):", (await md(join(D,"laptop-crop.png"), join(D,"ctrl-a.png"))).toFixed(3));
console.log("baseline vs after(ctrl-a):         ", (await md(join(D,"baseline","laptop-crop.png"), join(D,"ctrl-a.png"))).toFixed(3));
console.log("baseline vs after(ctrl-b):         ", (await md(join(D,"baseline","laptop-crop.png"), join(D,"ctrl-b.png"))).toFixed(3));

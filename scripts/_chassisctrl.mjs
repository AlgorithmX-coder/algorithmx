import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
const region = { left: 430, top: 980, width: 620, height: 170 };
async function reg(p){ return sharp(p).extract(region).toBuffer(); }
async function meanDiff(p1,p2){
  const d = await sharp(await reg(p1)).composite([{input: await reg(p2), blend:"difference"}]).toBuffer();
  const st = await sharp(d).stats();
  return (st.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3);
}
const ctrl = await meanDiff(join(D,"ctrl-a.png"), join(D,"ctrl-b.png"));
const beforeAfter = await meanDiff(join(D,"baseline","laptop-crop.png"), join(D,"laptop-crop.png"));
console.log("CHASSIS region — control (same build):", ctrl.toFixed(3));
console.log("CHASSIS region — baseline vs after:   ", beforeAfter.toFixed(3));

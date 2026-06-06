import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
// pure-chassis region inside the 1500x1300 laptop crop (palm rest + trackpad:
// no screen, no surrounding floor)
const region = { left: 430, top: 980, width: 620, height: 170 };
async function reg(p) { return sharp(p).extract(region).toBuffer(); }
const aBuf = await reg(join(D, "baseline", "laptop-crop.png"));
const bBuf = await reg(join(D, "laptop-crop.png"));
const diff = await sharp(aBuf).composite([{ input: bBuf, blend: "difference" }]).toBuffer();
await sharp(diff).toFile(join(D, "chassis-diff.png"));
await sharp(aBuf).toFile(join(D, "chassis-region.png"));
const st = await sharp(diff).stats();
const overall = (st.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3).toFixed(3);
console.log("PURE-CHASSIS baseline-vs-after mean RGB diff:", overall, "(control noise floor was 1.121)");
console.log("per-channel:", st.channels.slice(0,3).map(c=>c.mean.toFixed(3)).join(", "), "max:", st.channels.slice(0,3).map(c=>c.max).join(","));

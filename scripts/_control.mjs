import { chromium } from "playwright";
import sharp from "sharp";
import { join } from "node:path";
const D = join("scripts", "verify-out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
async function shot(tag) {
  const b = await chromium.launch({ executablePath: EDGE });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/", httpOnly: false, secure: false, sameSite: "Lax" }]);
  const pg = await ctx.newPage();
  await pg.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  await pg.waitForTimeout(1800);
  const span = (2.8 - 1) * 900;
  await pg.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), 0.68 * span);
  await pg.waitForTimeout(1700);
  const buf = await pg.screenshot();
  await sharp(buf).extract({ left: 880, top: 150, width: 1500, height: 1300 }).toFile(join(D, tag));
  await b.close();
}
await shot("ctrl-a.png");
await shot("ctrl-b.png");
const diff = await sharp(join(D, "ctrl-a.png")).composite([{ input: join(D, "ctrl-b.png"), blend: "difference" }]).toBuffer();
const st = await sharp(diff).stats();
const overall = (st.channels.slice(0,3).reduce((s,c)=>s+c.mean,0)/3).toFixed(3);
console.log("CONTROL (same build, two captures) overall mean RGB diff:", overall);
console.log("per-channel:", st.channels.slice(0,3).map(c=>c.mean.toFixed(3)).join(", "), "max:", st.channels.slice(0,3).map(c=>c.max).join(","));

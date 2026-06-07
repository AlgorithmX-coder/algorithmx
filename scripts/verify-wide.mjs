// Wide-viewport capture of the hero horizon at mid-scroll (matches a
// wide monitor where the floor/back seam is most visible).
import { chromium } from "playwright";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await chromium.launch({ executablePath: EDGE });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 880 },
  deviceScaleFactor: 1.5,
});
await ctx.addCookies([
  { name: "site_auth", value: "true", domain: "localhost", path: "/", sameSite: "Lax" },
]);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1500);
const railVh = 2.8;
const span = (railVh - 1) * 880;
for (const p of [0.5, 0.78]) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), p * span);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: join(OUT_DIR, `wide-${Math.round(p * 100)}.png`) });
}
await browser.close();
console.log("wide captured");

/**
 * The globe's school machines are 36x26 CSS pixels and they come and go as
 * the globe turns, so this waits on the globe's column and takes a burst of
 * close crops at 4x, which is the only way to judge them.
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const [origin, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 }, deviceScaleFactor: 4 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
await page.goto(origin + "/schools", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4000);
const ok = await page.evaluate(() => !!document.querySelector(".sch-h1"));
console.log("guard:", ok);
if (!ok) throw new Error("not our page");

/* the globe occupies the right column; crop its upper half where the
   machines land, and take a burst so at least one catches a live one */
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: `${outDir}/g${String(i).padStart(2, "0")}.png`,
    clip: { x: 1010, y: 130, width: 400, height: 330 },
  });
  console.log("  burst", i);
}
await browser.close();
console.log("done ->", outDir);

/**
 * The sand pages at phone width. 390px is the repo's reference phone.
 *
 *   node scripts/_phoneshot.mjs "<entry url>" <outdir>
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const [entry, outDir] = process.argv.slice(2);
const origin = new URL(entry).origin;
mkdirSync(outDir, { recursive: true });
const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
await page.goto(entry, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2500);

for (const [name, path, guard] of [
  ["home", "/", ".lv2-hero-eyebrow"],
  ["schools", "/schools", ".sch-h1"],
]) {
  await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3500);
  const ok = page.url().startsWith(origin) && (await page.evaluate((g) => !!document.querySelector(g), guard));
  console.log(`${path}: ${ok ? "ok" : "NOT OUR PAGE"}`);
  if (!ok) continue;
  for (let i = 0; i < 6; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 900);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${outDir}/${name}-${i}.png` });
  }
  /* the one thing that actually breaks at this width */
  const overflow = await page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    offenders: [...document.querySelectorAll("*")]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 2)
      .slice(0, 6)
      .map((e) => `${e.tagName.toLowerCase()}.${(e.className || "").toString().split(" ")[0]} right=${Math.round(e.getBoundingClientRect().right)}`),
  }));
  console.log(`  horizontal: doc=${overflow.docWidth} viewport=${overflow.viewport}`, overflow.offenders.length ? overflow.offenders : "(nothing past the edge)");
}
await browser.close();
console.log("done ->", outDir);

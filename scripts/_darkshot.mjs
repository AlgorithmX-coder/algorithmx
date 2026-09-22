/**
 * Shoot the pages that are NOT part of the sand work but share components
 * with it, so a light-theme change cannot quietly break them.
 *
 *   node scripts/_darkshot.mjs <origin> <outdir> [label]
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

/* first arg may carry a ?_vercel_share token; the origin is taken from it
   and the token hop happens once before anything is shot */
const [entry, outDir, label = ""] = process.argv.slice(2);
const origin = new URL(entry).origin;
mkdirSync(outDir, { recursive: true });
const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 }, deviceScaleFactor: 2 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
await page.goto(entry, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2500);

/* pages that must stay dark, and a selector each that proves we got there */
const PAGES = [
  ["cybersecurity", "/cybersecurity", "footer"],
  ["pro", "/pro", "footer"],
  ["ops", "/ops", "body"],
  ["cyberheroes", "/cyberheroes", "body"],
];

for (const [name, path, guard] of PAGES) {
  try {
    await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(3500);
    /* The URL check matters more than the selector: an expired share token
       serves vercel.com/login, which has a <body> like anything else. */
    const landed = page.url();
    const onOurs = landed.startsWith(origin);
    const ok = onOurs && (await page.evaluate((g) => !!document.querySelector(g), guard));
    console.log(`${path}: ${ok ? "ok" : "NOT OUR PAGE"}  url=${landed.replace(origin, "")}`);
    if (!ok) continue;
    /* the nav, at the top */
    await page.screenshot({ path: `${outDir}/${label}${name}-nav.png`, clip: { x: 0, y: 0, width: 1414, height: 200 } });
    /* the footer, at the very bottom */
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${outDir}/${label}${name}-foot.png` });
    console.log("  shot:", name);
  } catch (e) {
    console.log(`${path}: FAILED ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
console.log("done ->", outDir);

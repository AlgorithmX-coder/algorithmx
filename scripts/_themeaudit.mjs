/**
 * Which pages are still dark now the homepage and /schools are light?
 *
 * Shoots every public page at the owner's window, then measures how much
 * of the frame is dark rather than eyeballing it. "Dark area" is the
 * share of sampled pixels whose relative luminance is below 0.2, which is
 * roughly "this reads as a dark surface rather than paper".
 *
 *   node scripts/_themeaudit.mjs <origin> <outdir>
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const [origin, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["schools", "/schools"],
  ["cybersecurity", "/cybersecurity"],
  ["cyberheroes", "/cyberheroes"],
  ["cyberexplorers", "/cyberexplorers"],
  ["explorers", "/explorers"],
  ["ops", "/ops"],
  ["pro", "/pro"],
  ["operators", "/operators"],
  ["login", "/login"],
  ["signup", "/signup"],
  ["privacy", "/privacy"],
  ["terms", "/terms"],
  ["welcome", "/welcome"],
  ["schools-login", "/schools/login"],
];

const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

console.log("page             dark%  at-rest    dark%  full-page   verdict");
for (const [name, path] of PAGES) {
  try {
    await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(4500);
    if (!page.url().startsWith(origin)) { console.log(name.padEnd(16), "redirected to", page.url().replace(origin, "")); continue; }

    const shots = [];
    shots.push(await page.screenshot());                                   // at rest
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45));
    await page.waitForTimeout(1600);
    shots.push(await page.screenshot());                                   // middle
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1600);
    shots.push(await page.screenshot());                                   // end
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/${name}.png` });

    const pct = [];
    for (const buf of shots) {
      const { data, info } = await sharp(buf).resize(200, null, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
      let dark = 0, n = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (L(data[i], data[i + 1], data[i + 2]) < 0.2) dark++;
        n++;
      }
      pct.push(Math.round((dark / n) * 100));
    }
    const rest = pct[0];
    const avg = Math.round((pct[0] + pct[1] + pct[2]) / 3);
    const verdict = avg < 15 ? "light" : avg > 60 ? "DARK, needs work" : "mixed";
    console.log(name.padEnd(16), String(rest).padStart(4) + "%", "     ", String(avg).padStart(4) + "%", "      ", verdict);
  } catch (e) {
    console.log(name.padEnd(16), "FAILED", e.message.split("\n")[0].slice(0, 60));
  }
}
await browser.close();
console.log("\nshots ->", outDir);

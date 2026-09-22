/**
 * Screenshot the two sand pages on the preview build.
 *
 *   node verify.mjs "<share url>" <outdir> [home|schools]
 *
 * The share token sets a cookie on first hit, so the first navigation is to
 * the tokened URL and everything after is to the plain one. Every page
 * asserts a selector only our page has before anything is captured: a
 * expired token serves a Vercel login screen, which is what I mistook for
 * our site once already.
 */
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";

const [shareUrl, outDir, which = "both"] = process.argv.slice(2);
if (!shareUrl || !outDir) throw new Error("usage: verify.mjs <share url> <outdir> [home|schools|both]");
const origin = new URL(shareUrl).origin;
mkdirSync(outDir, { recursive: true });

const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
/* the owner's window, and 2x so small type is legible in the shots */
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 }, deviceScaleFactor: 2 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  PAGE ERROR:", e.message.split("\n")[0]));

/* the token hop, once */
await page.goto(shareUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2500);

const shot = async (name, y) => {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log("  shot:", name, "@", y);
};

const visit = async (path, guard) => {
  await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3200);
  const ok = await page.evaluate((g) => !!document.querySelector(g), guard);
  const title = await page.title();
  console.log(`${path}: guard ${guard} -> ${ok}   title="${title}"`);
  if (!ok) throw new Error(`NOT OUR PAGE at ${path} (title "${title}") - the share token has probably expired`);
};

if (which === "home" || which === "both") {
  await visit("/", ".lv2-hero-eyebrow");
  for (const [n, y] of [["home-00", 0], ["home-01", 700], ["home-02", 1500], ["home-03", 2400], ["home-04", 3300], ["home-05", 4300], ["home-06", 5400], ["home-07", 6600], ["home-08", 7800], ["home-09", 9000]]) {
    await shot(n, y);
  }
}

if (which === "schools" || which === "both") {
  await visit("/schools", ".sch-h1");
  for (const [n, y] of [["sch-00", 0], ["sch-01", 700], ["sch-02", 1500], ["sch-03", 2300], ["sch-04", 3100], ["sch-05", 3900], ["sch-06", 4700], ["sch-07", 5600], ["sch-08", 6600]]) {
    await shot(n, y);
  }
  /* the two drawn mocks, which are behind tabs */
  await page.evaluate(() => document.querySelector("#product")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(900);
  for (const [name, label] of [["mock-teacher", "Teacher class review"], ["mock-curriculum", "The curriculum map"]]) {
    try {
      await page.getByRole("tab", { name: label, exact: false }).first().click({ timeout: 6000 });
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `${outDir}/${name}.png` });
      console.log("  shot:", name);
    } catch (e) {
      console.log("  tab failed:", label, e.message.split("\n")[0]);
    }
  }
}

await browser.close();
console.log("done ->", outDir);

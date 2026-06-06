// Capture the landing-v2 top nav across a range of desktop widths to
// confirm no text wrapping / overflow and comfortable spacing after the
// spacing fix. Clips to the header strip for each width.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.NAV_BASE || "http://localhost:3000/landing-v2";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const WIDTHS = [1239, 1241, 1280, 1366, 1440, 1680, 1920];

const browser = await chromium.launch({ executablePath: EDGE });
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 800 },
    deviceScaleFactor: 1.5,
  });
  await ctx.addCookies([
    { name: "site_auth", value: "true", domain: "localhost", path: "/", sameSite: "Lax" },
  ]);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);

  // Sanity: does the nav overflow horizontally, and are any links wrapped
  // to >1 line (height taller than a single line)?
  const diag = await page.evaluate(() => {
    const inner = document.querySelector(".lv2-nav-inner");
    const links = [...document.querySelectorAll(".lv2-nav-secondary")];
    const tel = document.querySelector(".lv2-telemetry");
    const doc = document.documentElement;
    const overflow = doc.scrollWidth > doc.clientWidth;
    const wrapped = links
      .filter((l) => l.getClientRects().length > 1 || l.offsetHeight > 24)
      .map((l) => l.textContent);
    return {
      overflowX: overflow,
      innerW: inner ? Math.round(inner.getBoundingClientRect().width) : null,
      telemetryVisible: tel ? getComputedStyle(tel).display !== "none" : false,
      wrappedLinks: wrapped,
    };
  });
  console.log(`w=${w}: telemetry=${diag.telemetryVisible} innerW=${diag.innerW} overflowX=${diag.overflowX} wrapped=${JSON.stringify(diag.wrappedLinks)}`);

  await page.screenshot({ path: join(OUT_DIR, `navw-${w}.png`), clip: { x: 0, y: 0, width: w, height: 76 } });
  await ctx.close();
}
await browser.close();
console.log("Done. See scripts/verify-out/navw-*.png");

// Screenshot sweep of the V3 CSS-3D hero at key scroll beats.
//   node scripts/_v3sweep.mjs        (server on :3005)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.PAGE_BASE || "http://localhost:3005";
const OUT_DIR = process.env.V3_OUT || ".v3sweep";
await mkdir(OUT_DIR, { recursive: true });

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ executablePath: EDGE });
const ctx = await browser.newContext({
  viewport: {
    width: Number(process.env.V3_W || 1600),
    height: Number(process.env.V3_H || 1000),
  },
  deviceScaleFactor: 1,
});
const url = new URL(BASE);
await ctx.addCookies([
  { name: "site_auth", value: "true", domain: url.hostname, path: "/" },
]);
const page = await ctx.newPage();
page.on("pageerror", (err) => console.error("[pageerror]", err.message));
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(3000);

// Measure the actual pinned-scrub range from the DOM (rail height varies
// by breakpoint: 220vh desktop / 170vh compact).
const railPx = await page.evaluate(() => {
  const sec = document.querySelector("main section");
  return sec.getBoundingClientRect().height - window.innerHeight;
});
for (const s of [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.9, 1.0]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(railPx * s));
  await page.waitForTimeout(1300);
  await page.screenshot({
    path: join(OUT_DIR, `v3-s${String(Math.round(s * 100)).padStart(3, "0")}.png`),
  });
  console.log(`shot s=${s}`);
}
await browser.close();
console.log(`done -> ${OUT_DIR}`);

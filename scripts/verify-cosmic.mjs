// Capture the cosmic background at desktop / tablet / mobile, at the top
// of the hero (bg shows around the laptop) and at the subjects section
// (bg shows behind content cards).
import { chromium } from "playwright";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT = join("scripts", "verify-out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const sizes = [
  { name: "cosmic-desktop", w: 1440, h: 900 },
  { name: "cosmic-tablet", w: 834, h: 1112 },
  { name: "cosmic-mobile", w: 390, h: 844 },
];

const browser = await chromium.launch({ executablePath: EDGE });
for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
    isMobile: s.w < 700,
  });
  await ctx.addCookies([
    { name: "site_auth", value: "true", domain: "localhost", path: "/", sameSite: "Lax" },
  ]);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(OUT, `${s.name}-top.png`) });
  await page.evaluate(() =>
    document.getElementById("subjects")?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForTimeout(1400);
  await page.screenshot({ path: join(OUT, `${s.name}-subjects.png`) });
  await ctx.close();
}
await browser.close();
console.log("cosmic captured");

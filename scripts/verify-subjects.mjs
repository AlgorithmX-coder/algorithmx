// One-shot capture of the "Pick your stream" (#subjects) section.
import { chromium } from "playwright";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await chromium.launch({ executablePath: EDGE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
await ctx.addCookies([
  { name: "site_auth", value: "true", domain: "localhost", path: "/", sameSite: "Lax" },
]);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1500);
await page.evaluate(() => document.getElementById("subjects")?.scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT_DIR, "subjects.png"), fullPage: false });
await browser.close();
console.log("subjects captured");

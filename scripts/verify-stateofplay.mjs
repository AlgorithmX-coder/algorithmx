// One-shot Playwright runner that captures the redesigned
// "The State of Play" section (#the-state-of-play) on the landing page.
// Captures desktop (1440) and tablet (1024) widths.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function shoot(label, width, height) {
  const browser = await chromium.launch({ executablePath: EDGE });
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  await ctx.addCookies([
    {
      name: "site_auth",
      value: "true",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const page = await ctx.newPage();
  page.on("pageerror", (err) => console.error(`[${label} pageerror]`, err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error(`[${label} console.error]`, msg.text());
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  // Scroll the target section into view and let FadeUp animations settle.
  await page.evaluate(() => {
    const el = document.getElementById("the-state-of-play");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1800);

  // Full-section screenshot via element handle (captures whole panel,
  // even taller than viewport).
  const el = await page.$("#the-state-of-play");
  if (el) {
    await el.screenshot({ path: join(OUT_DIR, `sop-${label}-full.png`) });
  } else {
    console.error(`[${label}] #the-state-of-play not found`);
  }

  // Also a viewport frame for context.
  await page.screenshot({ path: join(OUT_DIR, `sop-${label}-viewport.png`), fullPage: false });

  await browser.close();
  console.log(`${label}: captured`);
}

await shoot("desktop", 1440, 900);
await shoot("tablet", 1024, 768);
console.log("Done. See scripts/verify-out/");

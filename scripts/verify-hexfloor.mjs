// Visual-QA runner for the holographic hex well under the laptop.
// Captures the floor at the progress where it is fully revealed (and the
// laptop is open) across the requested viewport matrix, plus a reduced-
// motion pass. Adapted from scripts/verify-hero.mjs.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// width, height, reducedMotion
const MATRIX = [
  { label: "1440x900", w: 1440, h: 900, rm: false },
  { label: "1366x768", w: 1366, h: 768, rm: false },
  { label: "1024x768", w: 1024, h: 768, rm: false },
  { label: "430x932", w: 430, h: 932, rm: false },
  { label: "reduced-1440x900", w: 1440, h: 900, rm: true },
];

async function shoot({ label, w, h, rm }) {
  const browser = await chromium.launch({ executablePath: EDGE });
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    reducedMotion: rm ? "reduce" : "no-preference",
  });
  await ctx.addCookies([
    { name: "site_auth", value: "true", domain: "localhost", path: "/", httpOnly: false, secure: false, sameSite: "Lax" },
  ]);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error(`[${label} pageerror]`, e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error(`[${label} console.error]`, m.text()); });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1800); // let the WebGL scene mount + env cubemap render

  const railVh = w <= 768 ? 1.8 : 2.8;
  const span = (railVh - 1) * h; // px range mapping progress 0->1

  async function toProgress(p, settle = 1700) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), p * span);
    await page.waitForTimeout(settle);
  }

  if (rm) {
    // Reduced motion clamps progress to 1 (final state) regardless of
    // scroll, so the floor is fully revealed at scroll 0.
    await page.screenshot({ path: join(OUT_DIR, `hex-${label}.png`) });
  } else {
    // Floor fully revealed at p>=0.42; capture lid-opening reveal and the
    // open/ignited state so we can judge the floor under both.
    await toProgress(0.45);
    await page.screenshot({ path: join(OUT_DIR, `hex-${label}-a-reveal.png`) });
    await toProgress(0.68);
    await page.screenshot({ path: join(OUT_DIR, `hex-${label}-b-open.png`) });
  }

  await browser.close();
  console.log(`${label}: captured`);
}

for (const cfg of MATRIX) {
  await shoot(cfg);
}
console.log("Done. See scripts/verify-out/");

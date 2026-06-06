// One-shot Playwright runner that captures the landing-v2 hero at
// the moment the holographic cards have fully emerged. Captures both
// desktop (1440x900) and tablet (1024x768) for visual review.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });

// System Edge fallback — Playwright's chromium download was hanging
// on extraction. Edge is a Chromium-based browser and Playwright
// drives it identically when `executablePath` points at msedge.exe.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function shootViewport(label, width, height) {
  const browser = await chromium.launch({ executablePath: EDGE });
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2, // crisp screenshots
  });

  // Bypass the dev site_auth gate.
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

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Wait a beat for Three.js scene to mount.
  await page.waitForTimeout(1200);

  // Snapshot 1: untouched first paint (top of hero, scroll 0).
  await page.screenshot({ path: join(OUT_DIR, `${label}-1-initial.png`), fullPage: false });

  // The hero is a scroll-pinned cinematic. The rail is 280vh on
  // desktop / 180vh on phone+tablet. useScroll with
  // offset ["start start", "end end"] maps:
  //   progress 0 → scrollY = 0
  //   progress 1 → scrollY = (railHeight − viewportHeight)
  // Cards emerge at progress 0.70-0.82. We want roughly p=0.76
  // for "cards fully out", p=0.62 for "mid-emergence", p=0.92 for
  // the final READY state.
  //
  // Spring-smoothed scroll means we need to wait after each scroll
  // for the cinematic to settle to that progress.
  const railVh = width <= 768 ? 1.8 : 2.8;
  const viewportSpan = (railVh - 1) * height; // px range that maps to progress 0→1

  async function scrollToProgress(p, settleMs = 1500) {
    await page.evaluate((scrollPx) => {
      window.scrollTo({ top: scrollPx, behavior: "instant" });
    }, p * viewportSpan);
    await page.waitForTimeout(settleMs);
  }

  await scrollToProgress(0.55);
  await page.screenshot({ path: join(OUT_DIR, `${label}-2-mid-emerge.png`), fullPage: false });

  await scrollToProgress(0.78);
  await page.screenshot({ path: join(OUT_DIR, `${label}-3-cards-emerged.png`), fullPage: false });

  await scrollToProgress(0.92);
  await page.screenshot({ path: join(OUT_DIR, `${label}-4-ready.png`), fullPage: false });

  await browser.close();
  console.log(`${label}: 4 frames captured`);
}

await shootViewport("desktop", 1440, 900);
await shootViewport("tablet", 1024, 768);
console.log("Done. See scripts/verify-out/");

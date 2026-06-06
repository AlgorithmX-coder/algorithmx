// One-shot Playwright runner that captures the landing-v2 top nav in its
// key states for visual review of the header micro-animations:
//   1. top (transparent/glassy)   2. scrolled (tinted + shadow)
//   3. CTA hover   4. nav-link hover   5. reduced-motion resting state
// Clips to the header strip so the animation states are easy to compare.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.NAV_BASE || "http://localhost:3000/landing-v2";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const NAV_CLIP = { x: 0, y: 0, width: 1440, height: 80 };

async function run(label, reducedMotion) {
  const browser = await chromium.launch({ executablePath: EDGE });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  await ctx.addCookies([
    { name: "site_auth", value: "true", domain: "localhost", path: "/", sameSite: "Lax" },
  ]);
  const page = await ctx.newPage();
  page.on("pageerror", (err) => console.error(`[${label} pageerror]`, err.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error(`[${label} console.error]`, m.text());
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);

  // 1. top
  await page.screenshot({ path: join(OUT_DIR, `nav-${label}-1-top.png`), clip: NAV_CLIP });

  if (!reducedMotion) {
    // 2. scrolled — crosses the scrollY>24 threshold (tint + border + shadow)
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT_DIR, `nav-${label}-2-scrolled.png`), clip: NAV_CLIP });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);

    // 3. CTA hover (lift + arrow nudge + brighter glow/sweep)
    const cta = page.locator(".lv2-nav-cta");
    await cta.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT_DIR, `nav-${label}-3-cta-hover.png`), clip: NAV_CLIP });

    // 4. nav-link hover (underline scan + text glow) — move to "How It Works"
    const link = page.locator(".lv2-nav-secondary", { hasText: "How It Works" });
    await link.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT_DIR, `nav-${label}-4-link-hover.png`), clip: NAV_CLIP });
  }

  // Report the computed state of the key animated nodes for a sanity log.
  const diag = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return `${sel}: MISSING`;
      const cs = getComputedStyle(el);
      return `${sel}: anim=${cs.animationName} fill=${cs.webkitTextFillColor || cs.color}`;
    };
    return [
      pick(".lv2-wordmark"),
      pick(".lv2-cube-wrap"),
      pick(".lv2-tel-dot"),
      pick(".lv2-nav-cta"),
    ].join("\n");
  });
  console.log(`--- ${label} computed ---\n${diag}`);

  await browser.close();
  console.log(`${label}: frames captured`);
}

await run("motion", false);
await run("reduced", true);
console.log("Done. See scripts/verify-out/");

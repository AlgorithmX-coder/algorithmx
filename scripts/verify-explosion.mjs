// One-shot Playwright runner that captures the hero EXPLOSION FOOTAGE
// beat (activationT window, scroll p 0.30 -> 0.55) via the /dev/herocap
// harness, which exposes window.__setProgress for deterministic,
// spring-free scrubbing. Verifies the pre-rendered volumetric burst
// composites over the live laptop at each phase of its arc.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("scripts", "verify-out");
await mkdir(OUT_DIR, { recursive: true });

// System Edge fallback — same rationale as verify-hero.mjs.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// The beat: activationT = smoothstep(0.30, 0.55, p). Sample rest,
// early detonation, peak, dissipation, and after-clear.
const POINTS = [0.2, 0.34, 0.38, 0.425, 0.47, 0.52, 0.6];

const browser = await chromium.launch({ executablePath: EDGE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
page.on("pageerror", (err) => console.error("[pageerror]", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("[console.error]", msg.text());
});

await page.goto(`${BASE}/dev/herocap`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForFunction(() => window.__capReady === true, null, {
  timeout: 60000,
});
// Let the scene + atlas texture finish loading/compiling.
await page.waitForTimeout(3000);

for (const p of POINTS) {
  await page.evaluate((v) => window.__setProgress(v), p);
  await page.waitForTimeout(400); // lid damping settle
  const label = `explosion-p${String(p).replace(".", "")}`;
  await page.screenshot({
    path: join(OUT_DIR, `${label}.png`),
    fullPage: false,
  });
  console.log(`captured p=${p}`);
}

await browser.close();
console.log(`done -> ${OUT_DIR}`);

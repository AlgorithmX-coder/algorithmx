// Bakes the hero cinematic into the /public/hero-seq frame sequence
// played back by HeroScrubSequence on integrated GPUs (and as the
// reduced-motion final frame). Drives the /dev/herocap harness, which
// renders LaptopScene in capture mode (dpr=3, preserveDrawingBuffer,
// deterministic — micro-drift/idle sway disabled) and exposes
// window.__setProgress(p).
//
//   node scripts/_herocapture.mjs            (server on :3000)
//   HERO_BASE=http://localhost:3001 node scripts/_herocapture.mjs
//
// 60 frames, 720x450 viewport at deviceScaleFactor 3 = 2160x1350 webp,
// matching the existing sequence's naming + dimensions exactly.
//
// Readback is PNG (lossless), then encoded to webp here with sharp
// (lossless alpha channel) — NOT canvas.toDataURL("image/webp"), whose
// lossy alpha quantisation printed artifacts along the chassis edges.
// (LaptopScene also skips the Noise grain pass under `capture` — the
// grain dithers TRANSPARENT pixels too, which reads as speckle once the
// alpha frames are composited over the page backdrop.)

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BASE = process.env.HERO_BASE || "http://localhost:3000";
const OUT_DIR = join("public", "hero-seq");
const FRAMES = 60;
const QUALITY = 0.85;
await mkdir(OUT_DIR, { recursive: true });

// System Edge fallback — same rationale as verify-hero.mjs.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await chromium.launch({ executablePath: EDGE });
const ctx = await browser.newContext({
  viewport: { width: 720, height: 450 },
  deviceScaleFactor: 3,
});
const page = await ctx.newPage();
page.on("pageerror", (err) => console.error("[pageerror]", err.message));

await page.goto(`${BASE}/dev/herocap`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForFunction(() => window.__capReady === true, null, {
  timeout: 60000,
});
// Let the scene, env map and fx atlas finish loading + shaders compile.
await page.waitForTimeout(4000);

for (let i = 0; i < FRAMES; i++) {
  const p = i / (FRAMES - 1);
  await page.evaluate((v) => window.__setProgress(v), p);
  // Lid angle + screen stages use damped follows — give them a beat to
  // settle so each baked frame is the converged pose for its progress.
  await page.waitForTimeout(500);
  // Read back on a rAF boundary (double rAF = the previous frame has
  // fully presented). toDataURL on a preserveDrawingBuffer canvas can
  // otherwise race a mid-redraw buffer and bake partial frames — seen
  // as bands of uninitialized-VRAM garbage in the empty backdrop region
  // of some frames (present in the pre-branch prod bake too).
  const dataUrl = await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            resolve(document.querySelector("canvas").toDataURL("image/png")),
          ),
        ),
      ),
  );
  const png = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  const webp = await sharp(png)
    .webp({
      quality: Math.round(QUALITY * 100),
      alphaQuality: 100,
      smartSubsample: true, // preserve chroma on thin edges/highlights
      effort: 5,
    })
    .toBuffer();
  const name = `frame-${String(i).padStart(3, "0")}.webp`;
  await writeFile(join(OUT_DIR, name), webp);
  if (i % 10 === 0 || i === FRAMES - 1)
    console.log(`baked ${name} (p=${p.toFixed(3)})`);
}

await browser.close();
console.log(`done -> ${OUT_DIR}`);

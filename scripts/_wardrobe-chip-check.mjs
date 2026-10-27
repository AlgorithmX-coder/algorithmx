/* Is the HUD chip actually wearing the chosen kit, or silently falling back?
 *
 * At 36px, cropped to the head, every one of the twenty costumes shows the same
 * face - so the eye cannot tell a working outfit swap from a fallback. This
 * reads the DOM instead: what src is on each chip image, and did it load.
 *
 *   node scripts/_wardrobe-chip-check.mjs
 */
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { signIn } from "./_qa-signin.mjs";

const BASE = process.env.AUDIT_BASE || "http://localhost:3007";

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 } });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
await signIn(page, BASE);
spawnSync(process.execPath, ["--env-file=.env", "scripts/_wardrobe-trial-seed.mjs"], { encoding: "utf8" });

/* Wear week 7 straight through storage - the same thing the panel's click does. */
await page.goto(`${BASE}/cyberhq`, { waitUntil: "domcontentloaded", timeout: 30000 });
/* Passed as an ARGUMENT: page.evaluate runs in the browser, which has no
 * process.env, so reading it inside the callback silently yields undefined. */
const WEAR = String(process.env.WEAR || 7);
await page.evaluate((w) => window.localStorage.setItem("cyberheroes.wardrobe.week.v1", w), WEAR);

await page.goto(`${BASE}/lesson/1?screen=8`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForSelector("[data-lesson-stage]", { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3500);

const chips = await page.evaluate(() =>
  [...document.querySelectorAll("img")]
    .filter((i) => /adam|layla/.test(i.src))
    .slice(0, 4)
    .map((i) => ({
      src: i.src.replace(location.origin, ""),
      loaded: i.complete && i.naturalWidth > 0,
      natural: `${i.naturalWidth}x${i.naturalHeight}`,
      box: (() => { const b = i.getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)}`; })(),
    })),
);

console.log(`stored week: ${await page.evaluate(() => window.localStorage.getItem("cyberheroes.wardrobe.week.v1"))}`);
for (const c of chips) {
  console.log(`  ${c.loaded ? "LOADED " : "FAILED "} ${c.box.padEnd(9)} natural ${c.natural.padEnd(11)} ${c.src}`);
}

await page.screenshot({ path: `.wardrobe-shots/chip-w${WEAR}.png`, clip: { x: 0, y: 0, width: 200, height: 64 } });
await browser.close();

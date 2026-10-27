/* Photograph the Agent Wardrobe trial so a person can look at it.
 *
 * Shoots /cyberhq (the "Your Kit" panel), then picks a week's kit and shoots a
 * lesson screen to prove the HUD chip follows the choice.
 *
 *   node scripts/_wardrobe-shot.mjs
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { signIn } from "./_qa-signin.mjs";

const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const OUT = process.env.OUT || ".wardrobe-shots";
const VIEWPORT = { width: 1414, height: 771 };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
await signIn(page, BASE);

/* SEED PROGRESS AFTER SIGNING IN, NEVER BEFORE.
 *
 * /api/test/seed does childProfile.deleteMany({ userId }) then create() -
 * delete-then-create - so every sign-in destroys the child profile and
 * cascades away all its progress. Seeding first and signing in second wipes
 * exactly the rows you just wrote, and the panel then correctly reports an
 * empty wardrobe, which looks like a bug in the panel. It is not. */
const seeded = spawnSync(process.execPath, ["--env-file=.env", "scripts/_wardrobe-trial-seed.mjs"], { encoding: "utf8" });
console.log((seeded.stdout || seeded.stderr || "").trim().split(/\r?\n/).pop());

async function settle() {
  let last = -1, stable = 0;
  for (let i = 0; i < 40 && stable < 4; i++) {
    await page.waitForTimeout(150);
    const h = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => -1);
    stable = h === last ? stable + 1 : 0;
    last = h;
  }
  await page.waitForTimeout(1200);
}

/* 1 - Cyber HQ, the kit panel. */
await page.goto(`${BASE}/cyberhq`, { waitUntil: "domcontentloaded", timeout: 30000 });
await settle();
await page.screenshot({ path: `${OUT}/hq-full.png`, fullPage: true });

const panel = await page.$('section[aria-labelledby="wardrobe-heading"]');
if (panel) {
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await panel.screenshot({ path: `${OUT}/kit-panel.png` });
  console.log("kit panel shot");
} else {
  console.log("NO KIT PANEL FOUND - that is the finding");
}

/* 2 - wear week 7's kit (Wallet Guard), then check the lesson HUD chip. */
const wore = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('section[aria-labelledby="wardrobe-heading"] button')];
  const target = btns.find((b) => (b.textContent || "").includes("Wallet Guard"));
  if (!target) return null;
  target.click();
  return (target.textContent || "").trim().slice(0, 40);
});
console.log(`wore: ${wore ?? "(Wallet Guard button not found)"}`);
await page.waitForTimeout(600);
if (panel) await panel.screenshot({ path: `${OUT}/kit-panel-worn.png` });

/* 3 - a lesson screen, to see the chip carrying the choice. */
await page.goto(`${BASE}/lesson/1?screen=8`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForSelector("[data-lesson-stage]", { timeout: 15000 }).catch(() => {});
await settle();
await page.screenshot({ path: `${OUT}/lesson-hud.png` });

/* And a tight crop of just the chip. */
const chip = await page.$(".hud-duo-label");
if (chip) {
  const box = await chip.boundingBox();
  if (box) {
    await page.screenshot({
      path: `${OUT}/hud-chip.png`,
      clip: { x: 0, y: 0, width: Math.min(420, box.x + box.width + 30), height: 70 },
    });
  }
}

console.log(`shots in ${OUT}/`);
await browser.close();

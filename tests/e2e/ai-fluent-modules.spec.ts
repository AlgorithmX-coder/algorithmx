import { test, expect, type Page } from "@playwright/test";

/**
 * AI Fluent play-throughs.
 *
 * Every shipped Fluent module is played from its first screen to its
 * result stamp in the offline preview (/dev/ai-fluent, no database, no
 * model: the rubric's rules layer grades and replies are scripted). The
 * walker takes the first available action on each screen; where a screen
 * waits for the learner to write a prompt, it writes a plain one, so a
 * screen with no way forward, a crash, or a console error fails the
 * build. Nothing here checks pedagogy; it checks that nobody can strand a
 * learner.
 */

const MODULES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MAX_SCREENS = 90;
const PROMPT = "You are writing for the finance director, who has to tell the board what to decide. From the attached export give me a one-paragraph position and the two items that need a decision as bullets with the amount, under 120 words, plain English, and flag anything disputed.";

async function playThrough(page: Page, query: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    const path = new URL(r.url()).pathname;
    if (/^\/_vercel\//.test(path) || /\/envelope\/?$/.test(path)) return;
    if (r.status() >= 400) errors.push(`${r.status()} ${path}`);
  });
  await page.goto(`/dev/ai-fluent?${query}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await expect(page.locator(".cl-eyebrow").first()).toBeVisible({ timeout: 60_000 });

  const settle = () => page.waitForFunction(() => !document.querySelector("[aria-label=writing]"), null, { timeout: 30_000 });
  let screens = 0;
  let stuckAt: string | null = null;
  for (let guard = 0; guard < MAX_SCREENS; guard++) {
    await page.waitForTimeout(200);
    const eyebrow = (await page.locator(".cl-eyebrow").first().textContent().catch(() => "")) || "screen";
    screens++;

    for (let k = 0; k < 12 && (await page.locator(".cl-cardbtn:not(.static):not(.open)").count()); k++) {
      await page.locator(".cl-cardbtn:not(.static):not(.open)").first().click();
      await page.waitForTimeout(100);
    }
    for (let k = 0; k < 12 && (await page.locator(".cl-switch:not(.on)").count()); k++) {
      await page.locator(".cl-switch:not(.on)").first().click();
      await page.waitForTimeout(60);
    }
    while (await page.locator(".cl-nav button.cl-btn:not(.cl-btn-pri):not(:disabled)").filter({ hasText: /^Show / }).count()) {
      await page.locator(".cl-nav button.cl-btn").filter({ hasText: /^Show / }).first().click();
      await page.waitForTimeout(120);
    }
    if (await page.locator(".cl-opt:not(:disabled)").count()) {
      await page.locator(".cl-opt:not(:disabled)").first().click();
      await page.waitForTimeout(120);
    }
    if (await page.locator(".cl-three-btn:not(:disabled)").count()) {
      await page.locator(".cl-three-btn:not(:disabled)").nth(1).click();
      await page.waitForTimeout(120);
    }
    /* A composer waiting for a prompt: write one, then send. */
    const composer = page.locator("textarea:not([readonly])").first();
    if ((await composer.count()) && !(await page.locator("button[aria-label=Send]:not(:disabled)").count()) && !(await page.locator(".cl-nav .cl-btn-pri:not(:disabled)").count())) {
      await composer.fill(PROMPT);
      await page.waitForTimeout(80);
    }
    if (await page.locator("button[aria-label=Send]:not(:disabled)").count()) {
      await page.locator("button[aria-label=Send]:not(:disabled)").first().click();
      await settle();
      await page.waitForTimeout(250);
    }
    /* A pickable paragraph: the second one first (a deliberate miss where
     * two tries are allowed), then the first still enabled. */
    for (let k = 0; k < 2 && (await page.locator(".cl-para.pickable:not(:disabled)").count()); k++) {
      const picks = page.locator(".cl-para.pickable:not(:disabled)");
      await picks.nth(k === 0 && (await picks.count()) > 1 ? 1 : 0).click();
      await page.waitForTimeout(120);
    }
    for (let k = 0; k < 6 && (await page.locator(".cl-src:not(:disabled)").count()); k++) {
      await page.locator(".cl-src:not(:disabled)").first().click();
      await page.waitForTimeout(100);
    }
    if ((await page.locator(".cl-grader").count()) || (await page.locator("[aria-label=writing]").count())) {
      await settle();
      await page.waitForTimeout(250);
    }
    if (await page.locator(".cl-stamp").count()) break;
    let pri = page.locator(".cl-nav .cl-btn-pri:not(:disabled)").first();
    if (!(await pri.count())) {
      /* A reveal button that does not start with "Show": press any enabled
       * nav button other than Back once, then look again. */
      const other = page.locator(".cl-nav button.cl-btn:not(.cl-btn-pri):not(:disabled)").filter({ hasNotText: /^Back$/ }).first();
      if (await other.count()) {
        await other.click();
        await page.waitForTimeout(200);
        pri = page.locator(".cl-nav .cl-btn-pri:not(:disabled)").first();
      }
    }
    if (!(await pri.count())) {
      stuckAt = eyebrow;
      break;
    }
    await pri.click();
  }
  return { screens, stuckAt, errors, stamped: (await page.locator(".cl-stamp").count()) > 0 };
}

test.describe("AI Fluent modules play through to the result", () => {
  test.setTimeout(150_000);

  for (const m of MODULES) {
    test(`module ${m} on Copilot, desktop`, async ({ page }) => {
      const r = await playThrough(page, `m=${m}`);
      expect(r.stuckAt, `no way forward at "${r.stuckAt}" after ${r.screens} screens`).toBeNull();
      expect(r.stamped, "reached the result stamp").toBe(true);
      expect(r.errors, "no page or console errors").toEqual([]);
    });
  }

  test("module 1 on ChatGPT", async ({ page }) => {
    const r = await playThrough(page, "m=1&tool=chatgpt");
    expect(r.stuckAt).toBeNull();
    expect(r.stamped).toBe(true);
    expect(r.errors).toEqual([]);
  });

  test("module 1 on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const r = await playThrough(page, "m=1");
    expect(r.stuckAt).toBeNull();
    expect(r.stamped).toBe(true);
    expect(r.errors).toEqual([]);
  });
});

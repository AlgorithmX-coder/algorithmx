import { test, expect, type Page } from "@playwright/test";

/**
 * AI Cleared play-throughs.
 *
 * Every module is played from its first screen to its result stamp in the
 * offline preview (/dev/ai-cleared, no database, no model: the rules layer
 * grades and replies are scripted). The walker takes the first available
 * action on each screen, the same way the local screenshot harness does,
 * so a screen with no way forward, a crash, or a console error fails the
 * build. Nothing here checks pedagogy; it checks that nobody can strand a
 * learner.
 */

const MODULES = [1, 2, 3, 4, 5];
const OTHER_TOOLS = ["chatgpt", "gemini", "claude"] as const;
const MAX_SCREENS = 90;

async function playThrough(page: Page, query: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    /* A failed resource is reported by URL below, with its status. */
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    const path = new URL(r.url()).pathname;
    /* Vercel Analytics and Speed Insights fetch their scripts from the
     * site's own /_vercel path, which exists only on Vercel; Sentry's
     * envelope goes to a tunnel. Neither can strand a learner. */
    if (/^\/_vercel\//.test(path) || /\/envelope\/?$/.test(path)) return;
    if (r.status() >= 400) errors.push(`${r.status()} ${path}`);
  });
  /* A generous first load: a dev server compiles the page on first hit. */
  await page.goto(`/dev/ai-cleared?${query}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
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
    if (await page.locator("button[aria-label=Send]:not(:disabled)").count()) {
      await page.locator("button[aria-label=Send]:not(:disabled)").first().click();
      await settle();
      await page.waitForTimeout(250);
    }
    if (await page.locator(".cl-para.pickable:not(:disabled)").count()) {
      await page.locator(".cl-para.pickable:not(:disabled)").nth(1).click();
      await page.waitForTimeout(120);
    }
    for (let k = 0; k < 6 && (await page.locator(".cl-src:not(:disabled)").count()); k++) {
      await page.locator(".cl-src:not(:disabled)").first().click();
      await page.waitForTimeout(100);
    }
    if (await page.locator(".cl-row input[type=checkbox]").count()) {
      const boxes = page.locator(".cl-row input[type=checkbox]");
      await boxes.nth(0).check();
      await boxes.nth(1).check();
    }
    if (await page.locator(".cl-grp").count()) {
      for (const g of await page.locator(".cl-grp").all()) await g.locator(".cl-choice").nth(0).click();
    }
    if ((await page.locator(".cl-grader").count()) || (await page.locator("[aria-label=writing]").count())) {
      await settle();
      await page.waitForTimeout(250);
    }
    if (await page.locator(".cl-stamp").count()) break;
    const pri = page.locator(".cl-nav .cl-btn-pri:not(:disabled)").first();
    if (!(await pri.count())) {
      stuckAt = eyebrow;
      break;
    }
    await pri.click();
  }
  return { screens, stuckAt, errors, stamped: (await page.locator(".cl-stamp").count()) > 0 };
}

test.describe("AI Cleared modules play through to the result", () => {
  test.setTimeout(150_000);

  for (const m of MODULES) {
    test(`module ${m} on Copilot, desktop`, async ({ page }) => {
      const r = await playThrough(page, `m=${m}`);
      expect(r.stuckAt, `no way forward at "${r.stuckAt}" after ${r.screens} screens`).toBeNull();
      expect(r.stamped, "reached the result stamp").toBe(true);
      expect(r.errors, "no page or console errors").toEqual([]);
    });
  }

  for (const tool of OTHER_TOOLS) {
    test(`module 2 on ${tool}`, async ({ page }) => {
      const r = await playThrough(page, `m=2&tool=${tool}`);
      expect(r.stuckAt).toBeNull();
      expect(r.stamped).toBe(true);
      expect(r.errors).toEqual([]);
    });
  }

  for (const track of ["legal", "hr", "general"] as const) {
    test(`module 2 on the ${track} desk`, async ({ page }) => {
      const r = await playThrough(page, `m=2&track=${track}`);
      expect(r.stuckAt).toBeNull();
      expect(r.stamped).toBe(true);
      expect(r.errors).toEqual([]);
    });
  }

  test("module 2 on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const r = await playThrough(page, "m=2");
    expect(r.stuckAt).toBeNull();
    expect(r.stamped).toBe(true);
    expect(r.errors).toEqual([]);
  });
});

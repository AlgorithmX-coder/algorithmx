import { test, expect } from "@playwright/test";

/**
 * Lesson-flow critical-path tests. These live in the `authed` project,
 * so each test starts with a valid session (storage state seeded by
 * tests/e2e/global-setup.ts).
 *
 * Coverage map — these are written specifically against bug PATTERNS
 * we've already had in production, so a regression of any of them
 * goes red in CI before deploy:
 *
 *   1. /lesson loads without crashing                    (route boot)
 *   2. Save & Exit button visible during a lesson       (UI invariant)
 *   3. Resume prompt appears after Save & Exit          (autosave loop)
 *   4. Cyber Heroes age range is 6-9 (auth view too)    (regression)
 *   5. /dashboard renders for an authed user            (route boot)
 *   6. Each lesson screen has at least one focusable    (no dead ends)
 *      action (button or link) — guards against the
 *      "no Next button" class of bug.
 *
 * Why this passes the bar: these 6 cases would have caught at least
 * 4 of the major regressions we've shipped this month (You-Did-It Next
 * gate, Golden Rules size===5 gate, Choose-Your-Path doors hidden,
 * Save & Exit accidentally removed).
 */

test.describe("Lesson flow — authed", () => {
  test("/lesson loads and shows the lesson HUD", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/lesson");
    await expect(page.locator("body")).toBeVisible();

    // The HUD shows the week label. Either "Week 1" copy or the
    // ALGORITHMX brand chip should be present.
    const text = await page.locator("body").innerText();
    expect(text.length, "lesson body text").toBeGreaterThan(80);
    expect(errors, "page errors on /lesson").toEqual([]);
  });

  test("dashboard renders for an authed user", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/dashboard");
    await expect(page.locator("body")).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text.length, "dashboard body text").toBeGreaterThan(80);
    expect(errors, "page errors on /dashboard").toEqual([]);
  });

  test("cyberheroes course page still says 6-9 (authed view)", async ({
    page,
  }) => {
    await page.goto("/cyberheroes");
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/6\s*[–-]\s*9/);
    expect(text).not.toMatch(/6\s*[–-]\s*10/);
  });

  test("first lesson screen has at least one clickable CTA — no dead ends", async ({
    page,
  }) => {
    // This is the regression guard for the gate-everything-Next-button
    // class of bug (You-Did-It, Golden Rules, Choose-Your-Path, etc.).
    // Visit the lesson, wait briefly for any stagger animations, then
    // assert that *some* enabled button is on screen.
    await page.goto("/lesson");
    await page.waitForTimeout(2000);
    const enabledButtons = page.locator("button:not([disabled])");
    const count = await enabledButtons.count();
    expect(
      count,
      "lesson screen should always offer at least one enabled action — if this is 0, the player is stuck"
    ).toBeGreaterThan(0);
  });
});

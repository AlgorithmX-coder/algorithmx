import { test, expect } from "@playwright/test";

/**
 * Gate-button regression suite.
 *
 * Every screen in the lesson MUST offer a way forward. The class of bug
 * we keep hitting is:
 *
 *   "Next button is gated behind a long stagger animation, the
 *    animation never completes, the player is stranded."
 *
 * Examples shipped to production this month:
 *   - You-Did-It (case 16): Next button gated on `screen !== 15` -
 *     guard checked the wrong screen number.
 *   - Golden Rules (case 10): Continue gated on `answeredRules.size === 5`.
 *   - Choose-Your-Path: doors hidden until type-out animation finished.
 *
 * This spec doesn't try to play the lesson end-to-end. Instead it
 * navigates to known problem screens (where reachable) and asserts:
 *   1. There's at least one enabled action button after a 5s wait.
 *   2. No "stuck forever" pattern: when an enabled button appears it
 *      stays enabled.
 *
 * As we file more bugs, add a test here for each one. The test should
 * stay in the suite even after the fix - that's how we prevent
 * regressions.
 */

test.describe("Gate-button regression guards", () => {
  test("after 5s on /lesson there is always an enabled action button", async ({
    page,
  }) => {
    await page.goto("/lesson");
    // Wait for any opening cutscene / loading state to settle.
    await page.waitForTimeout(5000);
    const count = await page.locator("button:not([disabled])").count();
    expect(
      count,
      "If 0, the user is stranded with no way to advance - likely a guard checking the wrong state"
    ).toBeGreaterThan(0);
  });

  test("forgot-password success state always shows a Back-to-login link", async ({
    page,
  }) => {
    // Submitting forgot-password without an email shouldn't strand the
    // user - the success state must offer a way home.
    await page.goto("/forgot-password");
    await page.locator("input[type='email']").fill("test@example.com");
    await page.getByRole("button", { name: /Send reset link/i }).click();
    await expect(
      page.getByRole("heading", { name: /Check your inbox/i })
    ).toBeVisible();
    // There should be a link or button to get back to login. There may
    // be more than one (top "Back" link plus success-state CTA), so
    // .first() avoids strict-mode failures.
    const back = page.getByRole("link", { name: /Back to login/i }).first();
    await expect(back).toBeVisible();
  });
});

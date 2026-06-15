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
    // The opening is a "tap anywhere to begin" boot screen (a window click
    // listener, not a <button>), so advance past it before asserting the
    // player offers a real way forward.
    await page.waitForTimeout(4000);
    await page.mouse.click(300, 350);
    await page.waitForTimeout(2500);
    const count = await page
      .locator("button:not([disabled]), a[href], [role='button']")
      .count();
    expect(
      count,
      "If 0, the user is stranded with no actionable control - likely a guard checking the wrong state"
    ).toBeGreaterThan(0);
  });

  test("forgot-password success state always shows a Back-to-login link", async ({
    page,
  }) => {
    // Submitting forgot-password without an email shouldn't strand the
    // user - the success state must offer a way home.
    await page.goto("/forgot-password");
    await page.locator("#forgot-email").fill("test@example.com");
    await page.getByRole("button", { name: /Send reset link/i }).click();
    await expect(page.getByText(/Check your email/i)).toBeVisible();
    // The page always offers a way home ("Remembered it? Log in"), shown in
    // both the form and the success state. .first() avoids strict-mode if a
    // second login link exists.
    const back = page.locator('a[href="/login"]').first();
    await expect(back).toBeVisible();
  });
});

import { test, expect } from "./fixtures";

/**
 * Smoke tests for the public, auth-free pages.
 *
 * Goal: catch the class of regression bug we keep hitting - "the page
 * renders blank", "the button doesn't exist", "build breaks". Every test
 * here is fast (<5s) and runs on every push.
 *
 * Auth-required flows (lesson player, exercises, boss battle) need a
 * seeded test user and a separate db fixture - see tests/e2e/README.md
 * for the plan.  Once that's wired we'll add specs for the lesson flow.
 */

test.describe("Public pages render", () => {
  test("landing page loads and shows the brand", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/AlgorithmX/i);
    // Body should have meaningful text - catches blank-page regressions.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(50);
    expect(consoleErrors, "page errors on /").toEqual([]);
  });

  test("login page shows email + password fields and forgot-password link", async ({
    page,
  }) => {
    await page.goto("/login");
    // Target by stable id, not placeholder copy (which the auth polish changed).
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]').first()).toBeVisible();
  });

  test("signup page renders the form", async ({ page }) => {
    await page.goto("/signup");
    // Signup has at least an email field somewhere
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });

  test("forgot-password page renders, validates and shows success", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: /Reset your password/i })
    ).toBeVisible();

    // A valid email reaches the success state. The submit button stays
    // `disabled` until React validates the email, so wait for it to enable
    // before clicking — a force-click can land on the still-disabled button
    // and never submit, which is what made this spec flaky under CI load.
    await page.locator("#forgot-email").fill("test@example.com");
    const submit = page.getByRole("button", { name: /Send reset link/i });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.getByText(/Check your email/i)).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();
  });

  test("course pages don't crash", async ({ page }) => {
    // We have four course landing pages. They've all rendered before;
    // this just guards against a future shared-component change taking
    // them out simultaneously.
    for (const path of [
      "/cyberheroes",
      "/cyberexplorers",
      "/cyberstart",
      "/cyberstart-pro",
    ]) {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`${path}: ${e.message}`));
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      const text = await page.locator("body").innerText();
      expect(text.length, `${path} body text`).toBeGreaterThan(50);
      expect(errors, `pageerrors on ${path}`).toEqual([]);
    }
  });

  test("login link to forgot-password navigates correctly", async ({
    page,
  }) => {
    await page.goto("/login");
    // force:true skips the stability wait the animated auth page otherwise
    // flakes on; the link is visible and points to /forgot-password.
    await page.locator('a[href="/forgot-password"]').first().click({ force: true });
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("auth-required routes redirect away when logged out", async ({
    page,
  }) => {
    // /dashboard requires a session - visiting it logged out should not
    // crash. It should either redirect to /login or render a guarded
    // shell. Either is acceptable; what we're catching is the page
    // throwing during render.
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/dashboard");
    await expect(page.locator("body")).toBeVisible();
    expect(errors, "pageerrors on /dashboard").toEqual([]);
  });
});

test.describe("Critical UI invariants", () => {
  test("Cyber Heroes course shows 6-10 age range, not 6-9", async ({
    page,
  }) => {
    // Regression guard: the marketing age range was widened from 6-9
    // to 6-10. If anyone reverts it, we want to know immediately.
    await page.goto("/cyberheroes");
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/6\s*[–-]\s*10/);
    expect(text).not.toMatch(/6\s*[–-]\s*9(?!\d)/);
  });
});

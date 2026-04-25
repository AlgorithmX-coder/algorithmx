import { test, expect } from "./fixtures";

/**
 * Smoke tests for the public, auth-free pages.
 *
 * Goal: catch the class of regression bug we keep hitting — "the page
 * renders blank", "the button doesn't exist", "build breaks". Every test
 * here is fast (<5s) and runs on every push.
 *
 * Auth-required flows (lesson player, exercises, boss battle) need a
 * seeded test user and a separate db fixture — see tests/e2e/README.md
 * for the plan.  Once that's wired we'll add specs for the lesson flow.
 */

test.describe("Public pages render", () => {
  test("landing page loads and shows the brand", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/AlgorithmX/i);
    // Body should have meaningful text — catches blank-page regressions.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(50);
    expect(consoleErrors, "page errors on /").toEqual([]);
  });

  test("login page shows email + password fields and forgot-password link", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder(/Enter your email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Enter your password/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Forgot password\?/i })
    ).toBeVisible();
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

    // Submit empty form → validation error
    await page.getByRole("button", { name: /Send reset link/i }).click();
    await expect(page.getByText(/valid email address/i)).toBeVisible();

    // Submit a valid email → success state
    await page.locator("input[type='email']").fill("test@example.com");
    await page.getByRole("button", { name: /Send reset link/i }).click();
    await expect(
      page.getByRole("heading", { name: /Check your inbox/i })
    ).toBeVisible();
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
    await page.getByRole("link", { name: /Forgot password\?/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("auth-required routes redirect away when logged out", async ({
    page,
  }) => {
    // /dashboard requires a session — visiting it logged out should not
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
  test("Cyber Heroes course shows 6-9 age range, not 6-10", async ({
    page,
  }) => {
    // Regression guard: we corrected the marketing age range in phase 7.
    // If anyone reverts it, we want to know immediately.
    await page.goto("/cyberheroes");
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/6\s*[–-]\s*9/);
    expect(text).not.toMatch(/6\s*[–-]\s*10/);
  });
});

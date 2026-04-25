import { test as base, expect } from "@playwright/test";

/**
 * Shared fixtures for E2E tests.
 *
 * `siteAuth` extends the default test by pre-setting the `site_auth`
 * cookie that the production site password gate checks for. Without it,
 * every page redirects to /password and our specs never see the real
 * UI. The cookie value (`true`) and name match what
 * `app/api/password/route.ts` writes after a successful unlock.
 *
 * Use this fixture for any test that needs to render content behind
 * the gate. Tests that explicitly want to see the gate (e.g. testing
 * the password page itself) should use the bare `test` from
 * @playwright/test instead.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const url = new URL(baseURL ?? "http://localhost:3100");
    await page.context().addCookies([
      {
        name: "site_auth",
        value: "true",
        domain: url.hostname,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await use(page);
  },
});

export { expect };

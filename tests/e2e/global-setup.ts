import { chromium, request, type FullConfig } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

/**
 * Playwright globalSetup. Runs once before any test:
 *   1. Hits /api/test/seed (only enabled when E2E_TESTS=1) which
 *      creates the test user, child profile, course + week-1 module
 *      and clears progress.
 *   2. Drives the login form to sign in as that user, then saves the
 *      session cookie + site_auth gate cookie to storageState.json.
 *
 * Tests that need to be authenticated load this storageState via the
 * `authed` Playwright project (see playwright.config.ts).
 */

export const STORAGE_STATE = path.join(__dirname, ".auth", "user.json");
export const TEST_EMAIL = "e2e@algorithmx.test";
export const TEST_PASSWORD = "e2e-test-pw";

export default async function globalSetup(config: FullConfig) {
  // Ensure the .auth directory exists.
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3100";

  // 1. Seed the database via the test endpoint.
  const api = await request.newContext({ baseURL });
  const seedRes = await api.post("/api/test/seed");
  if (!seedRes.ok()) {
    const body = await seedRes.text();
    throw new Error(
      `globalSetup: /api/test/seed failed (${seedRes.status()}). ` +
      `Did you forget to set E2E_TESTS=1 in the webServer env? Body: ${body}`
    );
  }
  await api.dispose();

  // 2. Sign in via the login form so the session cookie is real.
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  // Pre-set the site password gate cookie so the login page renders.
  await context.addCookies([
    {
      name: "site_auth",
      value: "true",
      domain: new URL(baseURL).hostname,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/login");
  // Target the inputs by their stable ids (not placeholder copy, which the
  // auth-surface polish has changed before and broke this setup silently).
  await page.locator("#login-email").fill(TEST_EMAIL);
  await page.locator("#login-password").fill(TEST_PASSWORD);
  // Submit via Enter — robust to the submit button's label (it's a
  // type="submit" AuthButton now reading "Resume", no longer "Log In").
  await page.locator("#login-password").press("Enter");

  // globalSetup only needs a real session for storageState. Login sets the
  // auth session cookie on success; the app then runs a client-side redirect
  // to /hub, but we deliberately do NOT depend on that navigation (it has
  // proven brittle to wait on by URL). Poll for the session cookie instead.
  let authed = false;
  for (let i = 0; i < 60 && !authed; i++) {
    authed = (await context.cookies()).some((c) => c.name.includes("authjs.session-token"));
    if (!authed) await page.waitForTimeout(250);
  }
  if (!authed) {
    const text = (await page.locator("body").innerText().catch(() => ""))
      .replace(/\s+/g, " ")
      .slice(0, 300);
    throw new Error(
      `globalSetup: login did not establish a session. url=${page.url()} page="${text}"`,
    );
  }

  // 3. Persist storageState for reuse by all authed specs.
  await context.storageState({ path: STORAGE_STATE });
  await browser.close();
}

/**
 * Sign a Playwright page in, the way the browser gates need.
 *
 * WHY THIS EXISTS. On 26 October 2026, running stage 4 of the pre-test
 * checklist for weeks 1 and 2, `audit-stage-overflow.mjs` printed:
 *
 *     0 screen(s) measured at 1414x771.
 *     MEASURED NOTHING - the lesson never rendered.
 *
 * Its own comment had predicted it: "the lesson route redirected to the login
 * gate and [data-lesson-stage] was never on the page". The gates set the
 * `site_auth` cookie, which opens the LAUNCH gate, and then stop. But
 * /lesson/[week] redirects anyone without a SESSION, which is a different
 * gate, so the page they measured was always /login.
 *
 * Checking the class, as the owner's rule says: all five browser gates had
 * it - stage-overflow, card-fill, frame-fit, result-card-fill and
 * pinned-overlays. Stage 4 of the checklist could not run at all, and L2's
 * honest exit-2 was the only reason it said so out loud rather than printing
 * "no screen scrolls" over an empty measurement.
 *
 * `shoot-week.mjs` already did this correctly, so this is its sign-in lifted
 * out and shared, rather than a sixth copy.
 *
 * LOCAL ONLY. /api/test/seed is live only when the server runs with
 * E2E_TESTS=1, and this refuses any base that is not localhost. The seed
 * endpoint CREATES rows: never point it at a hosted database.
 *
 * The lesson also needs BYPASS_ENTITLEMENT_FOR_TESTING in
 * app/lesson/[week]/page.tsx, which is LOCAL ONLY and must never be
 * committed - check `git status` on that file before every commit.
 */

/** Same credentials the e2e suite seeds and signs in with. */
const EMAIL = process.env.SHOOT_EMAIL || "e2e@algorithmx.test";
const PASSWORD = process.env.SHOOT_PASSWORD || "e2e-test-pw";

/**
 * Seed the test user and sign in through the real form, so the session cookie
 * is genuine. Throws with a diagnosis rather than letting the caller measure
 * thirty copies of the login page.
 */
export async function signIn(page, BASE) {
  if (!/^http:\/\/localhost[:/]/.test(BASE)) {
    throw new Error(`refusing to sign in against ${BASE} - local only`);
  }

  /* A 500 here usually just means the user exists from an earlier run, so the
   * login below is what actually decides. */
  const seeded = await fetch(`${BASE}/api/test/seed`, {
    method: "POST",
    headers: { cookie: "site_auth=true" },
  })
    .then((r) => r.status)
    .catch(() => "unreachable");

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);

  if (page.url().includes("/login")) {
    throw new Error(
      `still on /login after signing in (seed: ${seeded}).\n` +
        `Start the server with AUTH_TRUST_HOST=true E2E_TESTS=1 and try again.`,
    );
  }
  console.log(`signed in (seed: ${seeded}), landed on ${new URL(page.url()).pathname}`);
}

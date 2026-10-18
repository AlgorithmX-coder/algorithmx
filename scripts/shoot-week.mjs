/**
 * Photograph every screen of a week, settled, so a person can LOOK at them.
 *
 * Owner, 2026-10-18, after weeks 3-5 passed every gate and were called ready:
 * "can I confirm that you took screenshots and you checked to make sure that
 * everything was looking correct?"
 *
 * The answer was no. Ten instant gates and four browser stages had passed,
 * and week 4's final drill before the boss - the Hall of Mirrors - was
 * rendering with its card shoved to one side and its bottom edge, border and
 * start button cut off. It shipped. A child would have met it.
 *
 * WHY EVERY GATE MISSED IT. Each one measures the thing it was written for:
 * does the stage overflow, does the card leave a band empty, is the sprite
 * clipped, is a phrase said twice. None of them asks "is this screen right",
 * because that question has no assertion. The only instrument for it is a
 * person's eye, and the only way to use that instrument at this scale is to
 * put all thirty frames in front of it.
 *
 * WHAT MAKES THIS DIFFERENT FROM THE BROWSER GATES. Two things they got
 * wrong, both of which produced false readings for a whole evening:
 *
 *   - THEY SHOT TOO EARLY. A fixed delay catches progressive reveals
 *     half-drawn: the debrief with two of five skill cards and a dead band
 *     beside them, the stickers panel with one card and empty space, the
 *     mission briefing with a card still being dealt. Every one of those
 *     looks exactly like the "empty card" defect the owner has reported
 *     before, and none of them was real. So this waits for the layout to stop
 *     moving AND gives the reveals time to finish.
 *   - THEY SKIPPED IN SILENCE. One --shots run came back with 85 of 90 frames
 *     and reported "85 screen(s) measured" without mentioning the five it
 *     never reached. A gallery with holes in it reads as a complete gallery.
 *     This names every missing frame and exits non-zero.
 *
 *   node scripts/shoot-week.mjs 3 4 5
 *   SETTLE=12000 node scripts/shoot-week.mjs 4        slower reveals
 *   OUT=.look node scripts/shoot-week.mjs 4
 *
 * Needs a BUILT server with the QA deep-links on:
 *   npx next build
 *   AUTH_TRUST_HOST=true E2E_TESTS=1 npx next start -p 3007
 *
 * `next start` serves a FIXED bundle, so rebuild after any source change or
 * the frames will show the old code and a fix will look like it did nothing.
 *
 * It signs in for you. /lesson/[week] redirects anyone without a session, so
 * this does what tests/e2e/global-setup.ts does: seed the test user through
 * /api/test/seed (only live when E2E_TESTS=1) and sign in through the real
 * login form. LOCAL ONLY - it refuses to run against anything but localhost.
 *
 * The test user also needs to get past the entitlement check, which is what
 * BYPASS_ENTITLEMENT_FOR_TESTING in app/lesson/[week]/page.tsx is for. That
 * flag is LOCAL ONLY and must never be committed - check `git status` on that
 * file before every commit.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const WEEKS = process.argv.slice(2).filter((a) => !a.startsWith("--")).map(Number).filter(Number.isFinite);
if (!WEEKS.length) {
  console.log("usage: node scripts/shoot-week.mjs <week> [week...]");
  process.exit(2);
}

const SCREENS = Number(process.env.SCREENS || 30);
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const OUT = process.env.OUT || ".week-shots";
/* The owner's own window. A screen that only works on a tall monitor is
 * broken for the person reviewing it. */
const VIEWPORT = { width: 1414, height: 771 };
/* Long enough for the slowest progressive reveal measured: the debrief fills
 * its five skill cards one at a time and settles around 8s. */
const SETTLE = Number(process.env.SETTLE || 9000);

/* Same credentials the e2e suite seeds and signs in with. */
const EMAIL = process.env.SHOOT_EMAIL || "e2e@algorithmx.test";
const PASSWORD = process.env.SHOOT_PASSWORD || "e2e-test-pw";

if (!/^http:\/\/localhost[:/]/.test(BASE)) {
  console.error(`refusing to sign in against ${BASE} - this script is local only`);
  process.exit(2);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();

/* Seed the test user, then sign in through the real form so the session
 * cookie is genuine. A 500 here usually just means the user already exists
 * from an earlier run, so the login below is what actually decides. */
const seeded = await fetch(`${BASE}/api/test/seed`, { method: "POST", headers: { cookie: "site_auth=true" } })
  .then((r) => r.status)
  .catch(() => "unreachable");
console.log(`seed: ${seeded}`);

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.fill('input[type="email"], input[name="email"]', EMAIL);
await page.fill('input[type="password"], input[name="password"]', PASSWORD);
await Promise.all([
  page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
if (page.url().includes("/login")) {
  console.error(`\nSTILL ON /login - no session, so every frame would be the login page.`);
  console.error(`Is the server running with E2E_TESTS=1 and AUTH_TRUST_HOST=true?`);
  await browser.close();
  process.exit(2);
}
console.log(`signed in, landed on ${new URL(page.url()).pathname}`);

/** Wait until the page stops changing height, then let reveals finish. */
async function settle() {
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 40 && stable < 4; i++) {
    await page.waitForTimeout(150);
    const h = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => -1);
    stable = h === last ? stable + 1 : 0;
    last = h;
  }
  await page.waitForTimeout(SETTLE);
}

const missing = [];
let shot = 0;

for (const w of WEEKS) {
  console.log(`\nweek ${w}`);
  for (let s = 0; s < SCREENS; s++) {
    const name = `w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png`;
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector("[data-lesson-stage]", { timeout: 15000 });
      await settle();
      const title = await page.evaluate(() => (document.querySelector("h1,h2,h3")?.textContent || "").trim().slice(0, 42));
      await page.screenshot({ path: `${OUT}/${name}` });
      shot++;
      console.log(`  ${name}  ${title}`);
    } catch (e) {
      missing.push({ name, why: String(e).split("\n")[0].slice(0, 80) });
      console.log(`  ${name}  COULD NOT REACH - ${String(e).split("\n")[0].slice(0, 60)}`);
    }
  }
}

await browser.close();

console.log(`\n${shot} frame(s) in ${OUT}/, ${missing.length} missing.`);
if (missing.length) {
  /* A gallery with holes reads as a complete gallery, which is how five
   * screens went unlooked-at while the run still reported a tidy number. */
  console.log("\nMISSING FRAMES - the week has NOT been seen until these are shot:");
  for (const m of missing) console.log(`  ${m.name}  ${m.why}`);
  console.log("\nRetry them before reviewing. A flaky navigation is common; a screen that");
  console.log("never loads twice is itself the finding.");
  process.exit(1);
}
console.log("\nEvery frame captured. Now LOOK at them, one by one. The gates cannot do this part.");

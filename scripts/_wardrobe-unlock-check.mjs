/* Do kits unlock EXACTLY as weeks are completed? The owner's one condition.
 *
 * Seeds N completed weeks, loads Cyber HQ, and counts the kits the panel
 * actually renders. The contract:
 *
 *   - N completed weeks  ->  N + 1 kits (the base kit is always owned)
 *   - a week that is STARTED but not completed unlocks nothing
 *   - the invitation names the first week not yet finished
 *
 * Counted from the DOM, not from a screenshot: at 61px a costume is not
 * legible, so the eye cannot verify this and the markup has to.
 *
 *   node scripts/_wardrobe-unlock-check.mjs
 */
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { signIn } from "./_qa-signin.mjs";

const BASE = process.env.AUDIT_BASE || "http://localhost:3007";

/** Seed exactly these weeks as COMPLETE, plus one started-but-open week. */
function seed(weeks, openWeek) {
  const r = spawnSync(
    process.execPath,
    ["--env-file=.env", "scripts/_wardrobe-trial-seed.mjs"],
    { encoding: "utf8", env: { ...process.env, TRIAL_WEEKS: weeks.join(","), TRIAL_OPEN_WEEK: openWeek ?? "" } },
  );
  return (r.stdout || r.stderr || "").trim().split(/\r?\n/).pop();
}

async function readPanel(page) {
  await page.goto(`${BASE}/cyberhq`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const sec = document.querySelector('section[aria-labelledby="wardrobe-heading"]');
    if (!sec) return null;
    const kits = [...sec.querySelectorAll("button")].map((b) =>
      (b.textContent || "").replace(/\s+/g, " ").trim(),
    );
    const invite = [...sec.querySelectorAll("p")]
      .map((p) => (p.textContent || "").replace(/\s+/g, " ").trim())
      .find((t) => /Finish Week|Every kit earned/.test(t));
    return { kits, invite };
  });
}

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1414, height: 900 } });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();

const CASES = [
  { done: [], open: 1, expectKits: 1, expectInvite: "Week 1" },
  { done: [1, 2, 3], open: 4, expectKits: 4, expectInvite: "Week 4" },
  { done: [1, 2, 3, 4, 5, 6, 7], open: 8, expectKits: 8, expectInvite: "Week 8" },
];

let failures = 0;
for (const c of CASES) {
  /* Sign in FIRST: /api/test/seed delete-then-creates the child profile, so
   * seeding before sign-in wipes exactly the rows we just wrote. */
  await signIn(page, BASE);
  const seedLine = seed(c.done, c.open);

  const panel = await readPanel(page);
  if (!panel) { console.log(`FAIL  done=[${c.done}] - no wardrobe panel on the page`); failures++; continue; }

  const kitOk = panel.kits.length === c.expectKits;
  const inviteOk = (panel.invite || "").includes(c.expectInvite);
  /* The open week must NOT appear as a kit. */
  const leaked = c.open && panel.kits.some((k) => k.includes(`Week ${c.open} `));

  const verdict = kitOk && inviteOk && !leaked ? "PASS" : "FAIL";
  if (verdict === "FAIL") failures++;
  console.log(
    `${verdict}  completed=[${c.done.join(",") || "none"}] + week ${c.open} started-not-finished\n` +
      `      kits: ${panel.kits.length} (expected ${c.expectKits})${kitOk ? "" : "  <-- WRONG"}\n` +
      `      invite: "${panel.invite ?? "(none)"}"${inviteOk ? "" : "  <-- expected " + c.expectInvite}\n` +
      `      open week leaked into the wardrobe: ${leaked ? "YES <-- WRONG" : "no"}\n` +
      `      seed said: ${seedLine}`,
  );
}

console.log(failures ? `\n${failures} case(s) FAILED.` : "\nUnlocking tracks week completion exactly.");
await browser.close();
process.exit(failures ? 1 : 0);

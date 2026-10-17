/**
 * A screen whose content fits must not offer a scroll bar.
 *
 * Owner, 2026-10-17, on week 2's Power 3 of 5: "when the card fits into the
 * actual screen, there's no reason to have a scroll bar. Do you agree? If so,
 * this is something that we can push across all of the weeks."
 *
 * Agreed, and it is a rule: a bar on a screen that fits tells a child there is
 * something below worth reaching, and there is nothing there.
 *
 * WHY THIS IS A NEW CHECK AND NOT A TWEAK TO audit-card-fill.mjs: that one
 * asks whether the CARD fills the STAGE, which is a question about empty
 * space. This asks whether the stage overflows ITSELF, which is a question
 * about a few pixels. A card can fill its stage perfectly and the stage still
 * be three pixels taller than the window it sits in, and only the second one
 * puts a bar on the screen.
 *
 * It reports the measurement either way, because the interesting failures are
 * small: an overflow of 2px and an overflow of 200px look identical to a
 * tester and have completely different causes.
 *
 *   node scripts/audit-stage-overflow.mjs 2
 *   node scripts/audit-stage-overflow.mjs 1 2 --shots
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SHOTS = process.argv.includes("--shots");
const WEEKS = ARG.length ? ARG.map(Number) : [2];
const SCREENS = 30;
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
/* The owner's own window. Short, which is the point: a screen that only fits
 * on a tall monitor is broken for the person reviewing it. */
const VIEWPORT = { width: 1414, height: 771 };
const OUT = ".stage-overflow";

/* A pixel or two is rounding, not a scroll bar. Three is where a browser
 * starts drawing one. */
const SLACK = 2;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();

const rows = [];
for (const w of WEEKS) {
  for (let s = 0; s < SCREENS; s++) {
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(1500);

    const m = await page.evaluate(() => {
      const stage = document.querySelector("[data-lesson-stage]");
      const content = document.querySelector("[data-lesson-content]");
      if (!stage) return null;
      const de = document.documentElement;
      return {
        stageOver: stage.scrollHeight - stage.clientHeight,
        pageOver: de.scrollHeight - de.clientHeight,
        stageH: stage.clientHeight,
        contentH: content ? Math.round(content.getBoundingClientRect().height) : -1,
        title: (document.querySelector("h1,h2,h3")?.textContent || "").trim().slice(0, 30),
      };
    });
    if (!m) continue;

    const worst = Math.max(m.stageOver, m.pageOver);
    rows.push({ w, s, ...m, worst });
    if (SHOTS || worst > SLACK) {
      await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
    }
  }
}

await browser.close();

const bad = rows.filter((r) => r.worst > SLACK).sort((a, b) => b.worst - a.worst);

console.log(`\n${rows.length} screen(s) measured at ${VIEWPORT.width}x${VIEWPORT.height}.\n`);
console.log("  week screen   stage over   page over   content   title");
for (const r of rows.sort((a, b) => b.worst - a.worst)) {
  const flag = r.worst > SLACK ? "  <- scrolls" : "";
  console.log(
    `  ${String(r.w).padStart(4)} ${String(r.s).padStart(6)}   ${String(r.stageOver).padStart(10)}px ${String(r.pageOver).padStart(10)}px   ${String(r.contentH).padStart(6)}px   ${r.title}${flag}`,
  );
}

/* Measuring nothing is not a pass. The first run of this reported "No screen
 * scrolls" having measured ZERO screens, because the lesson route redirected
 * to the login gate and [data-lesson-stage] was never on the page. A check
 * that cannot reach its subject has to say so, or it is worse than no check. */
if (!rows.length) {
  console.log("MEASURED NOTHING - the lesson never rendered.");
  console.log("Check the server is up and the gate is open, then run again.");
  process.exit(2);
}

if (bad.length) {
  console.log(`\n${bad.length} screen(s) offer a scroll bar. Shots in ${OUT}/`);
  process.exit(1);
}
console.log("\nNo screen scrolls. Every card fits its stage.");

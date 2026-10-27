/**
 * How much of each card is actually used?
 *
 * Owner, 2026-10-16, on a results card: "there's a lot of empty space. Maybe
 * we can fill it up a little bit. So maybe do some analysis around all the
 * weeks. And which ones have a lot of empty space, like this one."
 *
 * "Looks empty" is not something to eyeball across 560 screens, and it is not
 * the same as "has few words" - a short card that fills its box reads fine,
 * and a long one can still leave a dead band under the last line. So measure
 * the thing that actually makes it look empty: the gap between the lowest
 * content on the card and the bottom of the card itself, as a fraction of
 * the card.
 *
 * Reported per screen, worst first, so the sparse ones can be filled and the
 * rest left alone.
 *
 *   node scripts/audit-card-fill.mjs 1            one week
 *   node scripts/audit-card-fill.mjs 1 --shots    keep a screenshot of each
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { signIn } from "./_qa-signin.mjs";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SHOTS = process.argv.includes("--shots");
/* DEFAULTS TO ALL TWENTY.
 *
 * It used to default to a SINGLE week - [1] here, [2] in stage-overflow - so
 * running it the way the checklist documents it (no arguments) measured one
 * week of twenty and printed a confident verdict over the other 570 screens.
 * On 27 October 2026 that produced a clean "all 20" layout report that had
 * covered 30 screens. Every other audit in this repo defaults to the whole
 * course; these three were the exception, and the exception read as a pass. */
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
const SCREENS = 30;
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const VIEWPORT = { width: 1414, height: 771 };   // the owner's window
const OUT = ".card-fill";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
/* The launch-gate cookie above is not a session: /lesson/[week] redirects
 * without one, and every gate here used to measure the login page. */
await signIn(page, BASE);

const rows = [];
/* Screens this gate could not read. Counted and NAMED, never silently dropped. */
const unread = [];
for (const w of WEEKS) {
  for (let s = 0; s < SCREENS; s++) {
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch { unread.push(`w${w} s${s} (never loaded)`); continue; }
    await page.waitForTimeout(1600);

    const r = await page.evaluate(() => {
      /* The card is the lesson stage's own panel: the biggest bordered or
       * filled box inside the stage. Falling back to the stage itself means
       * a screen with no card still reports something sane. */
      const stage = document.querySelector("[data-lesson-stage]");
      if (!stage) return null;
      const boxes = [...stage.querySelectorAll("div")].filter((el) => {
        const cs = getComputedStyle(el);
        const b = el.getBoundingClientRect();
        if (b.width < 320 || b.height < 160) return false;
        return cs.borderTopWidth !== "0px" || cs.backgroundImage !== "none" ||
          (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent");
      });
      if (!boxes.length) return null;
      boxes.sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return rb.width * rb.height - ra.width * ra.height;
      });
      const card = boxes[0];
      const cb = card.getBoundingClientRect();

      /* The lowest thing a child can actually see inside the card. */
      let lowest = cb.top;
      for (const el of card.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
        const b = el.getBoundingClientRect();
        if (b.width < 4 || b.height < 4) continue;
        const hasInk = (el.textContent || "").trim().length > 0 ||
          el.tagName === "IMG" || el.tagName === "CANVAS" || el.tagName === "SVG" ||
          cs.backgroundImage !== "none";
        if (!hasInk) continue;
        if (b.bottom > lowest && b.bottom <= cb.bottom + 1) lowest = b.bottom;
      }
      const title = (document.querySelector("h1,h2")?.textContent || "").trim().slice(0, 34);
      /* What actually reads as "a lot of empty space" is not slack INSIDE
       * the card - cards are sized by their content, so that is always near
       * zero - but a small card adrift in a big dark stage. So measure how
       * much of the stage the card occupies, and how much ink is in it. */
      const sb = stage.getBoundingClientRect();
      return {
        title,
        cardH: Math.round(cb.height),
        stageH: Math.round(sb.height),
        fillPct: sb.height > 0 ? Math.round((cb.height / sb.height) * 100) : 0,
        inkPct: cb.height > 0 ? Math.round(((lowest - cb.top) / cb.height) * 100) : 0,
      };
    });

    if (!r) { unread.push(`w${w} s${s} (no lesson stage on the page)`); continue; }
    rows.push({ w, s, ...r });
    if (SHOTS) await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
  }
}

rows.sort((a, b) => a.fillPct - b.fillPct);
console.log("\nHow much of the stage each card fills, emptiest first:\n");
console.log("  week  screen  card/stage    fills   title");
for (const r of rows) {
  const flag = r.fillPct < 55 ? "  <- looks empty" : "";
  console.log(
    `  ${String(r.w).padStart(4)}  ${String(r.s).padStart(6)}  ${String(r.cardH).padStart(4)}/${String(r.stageH).padStart(4)}px  ` +
    `${String(r.fillPct).padStart(5)}%   ${r.title}${flag}`,
  );
}
const sparse = rows.filter((r) => r.fillPct < 55);
console.log(`\n${rows.length} screen(s) measured, ${sparse.length} with a quarter of the card empty below the content.`);

/* A SCREEN IT COULD NOT READ IS NOT A SCREEN THAT PASSED.
 *
 * 26 October 2026, stage 7b on weeks 1 and 2: this printed "59 screen(s)
 * measured" for 60 screens and never said which one it dropped. Same shape as
 * the --shots run that returned 85 of 90 and called it 85 measured, and the
 * same shape as the login redirect that made this gate measure nothing at all.
 * A tidy number over an incomplete measurement reads as a complete one.
 *
 * So name them. Most will be legitimate - the boss overlay replaces the lesson
 * stage, so there is no card to measure - but legitimate is a judgement for a
 * person to make, not a row to delete. */
if (unread.length) {
  console.log(`\n${unread.length} screen(s) this gate could NOT read, so they are unmeasured, not clean:`);
  for (const u of unread) console.log(`  ${u}`);
  console.log("A boss overlay has no card and is expected here; anything else wants a look.");
}
await browser.close();

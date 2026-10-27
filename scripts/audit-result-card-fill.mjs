/**
 * Does the card still fit its content once the exercise is FINISHED?
 *
 * Owner, 2026-10-16, on the Memory Match result: "look at the bottom of that
 * card, it's not being filled in. check this for all of the pages in all of
 * the weeks."
 *
 * Most engines show their result as an overlay pinned across the finished
 * board (position: absolute, inset: 0) with the content centred inside it.
 * That is fine while the board is the content - the board fills the card. It
 * is not fine afterwards: the result is a title, two lines and two buttons,
 * and it inherits the whole height of a board that is no longer the point. So
 * the card stays as tall as a game and holds a paragraph, with a dead band at
 * the bottom.
 *
 * audit-card-fill.mjs cannot see this, because it reads a screen AT REST and
 * a board at rest genuinely does fill its card. This one plays the exercise
 * first.
 *
 * How it drives: every click is dispatched on the DOM node, because
 * NarrationClickGuard swallows real pointer events while a clip is playing.
 * It clicks plausible targets at random until a result appears or it runs out
 * of patience, so it is not guaranteed to finish every engine - what it
 * cannot reach, it says so rather than reporting a pass.
 *
 *   node scripts/audit-result-card-fill.mjs 1
 *   node scripts/audit-result-card-fill.mjs 1 --shots
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
const VIEWPORT = { width: 1414, height: 771 };
const OUT = ".result-fill";
/* A quarter of the card empty below the last thing in it is the point at
 * which it reads as unfinished rather than as breathing room. */
const DEAD_LIMIT = 25;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
/* The launch-gate cookie above is not a session: /lesson/[week] redirects
 * without one, and every gate here used to measure the login page. */
await signIn(page, BASE);

/** Is a result showing? Every engine ends with a way onward. */
const RESULT = /continue|try again|next|claim|well done|brilliant|all pairs|complete/i;

const rows = [];
for (const w of WEEKS) {
  for (let s = 0; s < SCREENS; s++) {
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch { continue; }
    await page.waitForTimeout(1600);

    /* Only exercises are worth playing: a card with something clickable in it
     * that is not already showing a result. */
    const playable = await page.evaluate((re) => {
      const stage = document.querySelector("[data-lesson-content]");
      if (!stage) return false;
      if (new RegExp(re, "i").test(stage.textContent || "")) return false;
      return stage.querySelectorAll("button,[role='button'],li").length >= 3;
    }, RESULT.source);
    if (!playable) continue;

    let finished = false;
    for (let round = 0; round < 260 && !finished; round++) {
      const did = await page.evaluate(() => {
        const stage = document.querySelector("[data-lesson-content]");
        if (!stage) return false;
        const cands = [...stage.querySelectorAll("button,[role='button'],[data-option],li")].filter((el) => {
          const b = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return b.width > 30 && b.height > 20 && cs.visibility !== "hidden" &&
            cs.pointerEvents !== "none" && !el.hasAttribute("disabled") &&
            !/listening|continue|try again/i.test(el.textContent || "");
        });
        if (!cands.length) return false;
        cands[Math.floor(Math.random() * cands.length)].click();
        return true;
      });
      await page.waitForTimeout(380);
      finished = await page.evaluate((re) => {
        const stage = document.querySelector("[data-lesson-content]");
        return !!stage && new RegExp(re, "i").test(stage.textContent || "");
      }, RESULT.source);
      if (!did && !finished) break;
    }

    if (!finished) { rows.push({ w, s, reached: false }); continue; }
    await page.waitForTimeout(1200);

    const m = await page.evaluate(() => {
      const content = document.querySelector("[data-lesson-content]");
      /* the card: the largest bordered or filled box inside the content */
      const boxes = [...content.querySelectorAll("div")].filter((el) => {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (b.width < 300 || b.height < 200) return false;
        return cs.borderTopWidth !== "0px" ||
          (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent");
      }).sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return rb.width * rb.height - ra.width * ra.height;
      });
      const card = boxes[0];
      if (!card) return null;
      const cb = card.getBoundingClientRect();

      /* the ink a child can actually see, ignoring the finished board the
       * result is laid over - it is blurred and dimmed, not content */
      let top = Infinity, bottom = -Infinity;
      for (const el of card.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (parseFloat(cs.opacity) < 0.5) continue;
        if (cs.filter && /blur\((?!0)/.test(cs.filter)) continue;
        if (el.closest("[aria-hidden='true']")) continue;
        const b = el.getBoundingClientRect();
        if (b.width < 6 || b.height < 6) continue;
        const ink = (el.textContent || "").trim().length > 0 || ["IMG", "CANVAS", "SVG", "BUTTON"].includes(el.tagName);
        if (!ink) continue;
        if (b.top < top) top = b.top;
        if (b.bottom > bottom) bottom = b.bottom;
      }
      if (!Number.isFinite(top)) return null;
      const above = Math.max(0, Math.round(top - cb.top));
      const below = Math.max(0, Math.round(cb.bottom - bottom));
      return {
        cardH: Math.round(cb.height),
        above, below,
        belowPct: Math.round((below / cb.height) * 100),
        title: (content.querySelector("h1,h2,h3")?.textContent || "").trim().slice(0, 28),
      };
    });

    if (!m) { rows.push({ w, s, reached: true, unmeasured: true }); continue; }
    rows.push({ w, s, reached: true, ...m });
    if (SHOTS || m.belowPct >= DEAD_LIMIT) {
      await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
    }
  }
}

await browser.close();

const played = rows.filter((r) => r.reached && !r.unmeasured);
const stuck = rows.filter((r) => !r.reached);
const bad = played.filter((r) => r.belowPct >= DEAD_LIMIT).sort((a, b) => b.belowPct - a.belowPct);

console.log(`\n${played.length} result card(s) measured, ${stuck.length} exercise(s) the driver could not finish.\n`);
if (played.length) {
  console.log("  week screen  card    empty above  empty below   title");
  for (const r of played.sort((a, b) => b.belowPct - a.belowPct)) {
    const flag = r.belowPct >= DEAD_LIMIT ? "  <- dead band" : "";
    console.log(
      `  ${String(r.w).padStart(4)} ${String(r.s).padStart(6)}  ${String(r.cardH).padStart(4)}px  ` +
      `${String(r.above).padStart(10)}px  ${String(r.below).padStart(7)}px ${String(r.belowPct).padStart(3)}%  ${r.title}${flag}`,
    );
  }
}
if (stuck.length) console.log(`\nCould not finish: ${stuck.map((r) => `w${r.w}s${r.s}`).join(" ")}`);
if (bad.length) {
  console.log(`\n${bad.length} result card(s) leave a quarter or more of the card empty below the content.`);
  console.log(`Shots in ${OUT}/`);
  process.exit(1);
}
console.log("\nEvery result card measured fills its card.");

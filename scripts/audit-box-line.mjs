/**
 * NOTHING TOUCHES THE BOX LINE.
 *
 * Owner, 2026-10-18, on week 3, after four screenshots of the same thing:
 *
 *   "I don't want any of the cards within the box of the activity, which is
 *   the thin lining around, to be on the line of the box. So everything needs
 *   to be within it, spaced out well. I don't want anything touching the
 *   line."
 *
 * The register has carried that as rule 4b with the note "There is no gate for
 * this yet", checked by eye at stage 7b. Checking it by eye is how it keeps
 * coming back: on 27 October 2026 I read the "Listening..." pill as sitting on
 * week 2 screen 21's bottom border, having already misjudged two other things
 * by pixel-counting a screenshot the same afternoon. A rule nobody can measure
 * is a rule that gets re-reported.
 *
 * So measure it. For every screen, find the activity card (the lesson stage's
 * own bordered panel) and every floating element that could sit on its edge -
 * the shared narration pill is the one the owner reported - and report any
 * whose box CROSSES a border rather than sitting clear of it.
 *
 * Straddling is the fault. Sitting fully outside is not: the "Listening..."
 * pill is deliberately placed outside the card, in the first clear of four
 * slots (#263). Overlap by a pixel or two is rounding, not a defect.
 *
 *   node scripts/audit-box-line.mjs 1 2
 *   node scripts/audit-box-line.mjs            all twenty
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { signIn } from "./_qa-signin.mjs";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
const SCREENS = Number(process.env.SCREENS || 30);
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const OUT = process.env.OUT || ".box-line";
const VIEWPORT = { width: 1414, height: 771 };
/* A pixel or two is rounding. Three is a child seeing a card on the line. */
const SLACK = 3;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
await signIn(page, BASE);

const bad = [];
const unread = [];
let measured = 0;

for (const w of WEEKS) {
  for (let s = 0; s < SCREENS; s++) {
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForSelector("[data-lesson-stage]", { timeout: 12000 });
    } catch {
      unread.push(`w${w} s${s} (never rendered)`);
      continue;
    }
    await page.waitForTimeout(2200);

    const r = await page.evaluate((SLACK) => {
      const stage = document.querySelector("[data-lesson-stage]");
      if (!stage) return null;

      /* The activity card: the largest bordered box inside the stage. */
      let card = null;
      let area = 0;
      for (const el of stage.querySelectorAll("div")) {
        const cs = getComputedStyle(el);
        const bw = parseFloat(cs.borderTopWidth) || 0;
        if (bw < 1) continue;
        const b = el.getBoundingClientRect();
        if (b.width < 200 || b.height < 120) continue;
        if (b.width * b.height > area) { area = b.width * b.height; card = { el, b }; }
      }
      if (!card) return { noCard: true };

      /* Anything pinned or floating that could land on an edge.
       *
       * The first run of this reported eight crossings on week 2 of which two
       * were real. The other six were a <style> block ("@keyframes wmFloat
       * {...}", picked up as the text of the div wrapping it) and a
       * full-screen wrapper whose textContent was every label on the screen
       * concatenated. Both "crossed" both borders, because they were taller
       * than the card.
       *
       * A chip is SMALL and nearly a leaf. Requiring that is what separates a
       * pill sitting on the line from the page it is sitting on. */
      const floats = [];
      for (const el of document.querySelectorAll("div,button,span")) {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "absolute") continue;
        if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
        const b = el.getBoundingClientRect();
        if (b.width < 24 || b.height < 14) continue;
        /* A chip, not a panel or a backdrop. */
        if (b.height > 90 || b.width > 460) continue;
        if (el.querySelector("style,script")) continue;
        if (el.children.length > 3) continue;
        const text = (el.textContent || "").trim().slice(0, 28);
        if (!text || /[{}]|@keyframes/.test(text)) continue;
        /* IS THE CHILD ACTUALLY LOOKING AT IT?
         *
         * Week 9 screen 24 reported "Tap a crate to check it." on the card's
         * top border. Nothing was there: that strip belongs to the game board
         * UNDERNEATH the Spot-the-Danger overlay, still in the DOM, still
         * laid out, and completely covered. visibility/display/opacity all
         * said visible, because being behind something else is none of those.
         *
         * So ask the page what is actually on top at this element's own
         * centre. A covered element is not on a line the child can see, and a
         * gate that reports one is the kind that gets switched off. */
        const mid = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        if (!mid || (mid !== el && !el.contains(mid) && !mid.contains(el))) continue;
        floats.push({ b, text });
      }

      const c = card.b;
      const crossings = [];
      for (const f of floats) {
        /* Straddling the bottom edge: top above it, bottom below it. */
        const strad = (edge) => f.b.top < edge - SLACK && f.b.bottom > edge + SLACK;
        const within = f.b.left < c.right && f.b.right > c.left;
        if (within && strad(c.bottom)) crossings.push({ edge: "bottom", ...f, by: Math.round(Math.min(f.b.bottom - c.bottom, c.bottom - f.b.top)) });
        if (within && strad(c.top)) crossings.push({ edge: "top", ...f, by: Math.round(Math.min(f.b.bottom - c.top, c.top - f.b.top)) });
      }
      return {
        card: { top: Math.round(c.top), bottom: Math.round(c.bottom) },
        crossings: crossings.map((x) => ({ edge: x.edge, text: x.text, by: x.by, top: Math.round(x.b.top), bottom: Math.round(x.b.bottom) })),
      };
    }, SLACK);

    if (!r) { unread.push(`w${w} s${s} (no lesson stage)`); continue; }
    if (r.noCard) { measured++; continue; } // a full-bleed screen has no card to sit on
    measured++;
    for (const x of r.crossings) {
      bad.push({ w, s, ...x, card: r.card });
      await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
    }
  }
}

console.log(`\n${measured} screen(s) measured at ${VIEWPORT.width}x${VIEWPORT.height}.`);
if (bad.length) {
  console.log(`\n${bad.length} element(s) sitting ON the card's line, not inside or clear of it:\n`);
  for (const b of bad) {
    console.log(`  week ${String(b.w).padStart(2)} screen ${String(b.s).padStart(2)}  crosses the ${b.edge} border by ${b.by}px`);
    console.log(`     "${b.text}"  at ${b.top}-${b.bottom}, card ${b.edge} is ${b.card[b.edge]}`);
  }
  console.log(`\nShots in ${OUT}/. Owner: "I don't want anything touching the line."`);
} else {
  console.log("Nothing sits on a card's border.");
}
if (unread.length) {
  console.log(`\n${unread.length} screen(s) could NOT be read, so they are unmeasured, not clean:`);
  for (const u of unread) console.log(`  ${u}`);
}

await browser.close();
if (!measured) { console.log("MEASURED NOTHING - the lesson never rendered."); process.exit(2); }
process.exit(bad.length ? 1 : 0);

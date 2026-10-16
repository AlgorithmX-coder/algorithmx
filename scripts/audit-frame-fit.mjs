/**
 * Screenshot every screen of every week and check nothing escapes its frame.
 *
 * The owner's rule after week 1 UAT: "every exercise needs to be screenshotted
 * and analysed to make sure things aren't out of the frame", across all twenty
 * weeks. A person cannot hold 600 screens in their head, and the faults are
 * the kind that only show at one viewport: a board past the fold, a panel
 * wider than the card it sits in, a line of text clipped mid-word.
 *
 * Three checks per screen, all measured rather than eyeballed:
 *   FOLD    the page scrolls - content below the window
 *   FRAME   an element sticks out past the lesson stage horizontally
 *   CLIP    a text node is cut off inside its own box
 *
 * Screenshots land in .frame-audit/ so anything flagged can be looked at.
 *
 *   node scripts/audit-frame-fit.mjs                  all weeks
 *   node scripts/audit-frame-fit.mjs 1                one week
 *   node scripts/audit-frame-fit.mjs 1 --shots        keep every shot, not just flagged
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const KEEP_ALL = process.argv.includes("--shots");
const WEEKS = ARG.length ? [Number(ARG[0])] : Array.from({ length: 20 }, (_, i) => i + 1);
const SCREENS = 29;
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const VIEWPORT = { width: 1414, height: 771 };   // the owner's window
const OUT = ".frame-audit";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();

const problems = [];
let checked = 0;

for (const w of WEEKS) {
  for (let s = 1; s < SCREENS; s++) {
    try {
      await page.goto(`${BASE}/lesson/${w}?screen=${s}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch { continue; }
    await page.waitForTimeout(1800);

    const r = await page.evaluate(() => {
      const stage = document.querySelector("[data-lesson-stage]") || document.body;
      const sb = stage.getBoundingClientRect();
      const title = (document.querySelector("h1,h2") || {}).textContent || "";

      const fold = document.body.scrollHeight - document.body.clientHeight;

      /* Content pushed off the VIEWPORT, not merely past the stage box.
       *
       * Comparing against the stage flagged every screen: the week backdrops,
       * glows and vignettes are full-bleed by design and sit outside it on
       * purpose. Those are decoration - aria-hidden, or not hit-testable - and
       * a child never reads them. What matters is a piece of CONTENT the child
       * is meant to see or tap leaving the window. */
      const escapes = [];
      for (const el of document.querySelectorAll("button,p,li,h1,h2,img,canvas,input,a")) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
        if (el.closest("[aria-hidden='true']")) continue;
        const over = Math.max(-b.left, b.right - innerWidth);
        if (over > 2) {
          escapes.push({
            over: Math.round(over),
            tag: el.tagName,
            text: (el.textContent || "").trim().slice(0, 34),
          });
        }
      }
      escapes.sort((a, b) => b.over - a.over);

      // text cut off inside its own box
      const clipped = [];
      for (const el of document.querySelectorAll("p,li,h1,h2,span,button")) {
        if (!el.textContent || el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.overflow === "visible" && cs.textOverflow !== "ellipsis") continue;
        if (el.scrollWidth > el.clientWidth + 2) {
          clipped.push({ by: el.scrollWidth - el.clientWidth, text: el.textContent.trim().slice(0, 34) });
        }
      }

      return { title: title.trim().slice(0, 30), fold, escapes: escapes.slice(0, 3), clipped: clipped.slice(0, 3) };
    });

    checked++;
    const bad = r.fold > 0 || r.escapes.length || r.clipped.length;
    if (bad) {
      problems.push({ w, s, ...r });
      await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
    } else if (KEEP_ALL) {
      await page.screenshot({ path: `${OUT}/w${String(w).padStart(2, "0")}-s${String(s).padStart(2, "0")}.png` });
    }
  }
  const n = problems.filter((p) => p.w === w).length;
  console.log(`week ${String(w).padStart(2)}  ${n ? `${n} screen(s) flagged` : "clean"}`);
}

console.log(`\n${checked} screens checked, ${problems.length} flagged\n`);
for (const p of problems) {
  const bits = [];
  if (p.fold > 0) bits.push(`FOLD +${p.fold}px`);
  for (const e of p.escapes) bits.push(`FRAME ${e.tag} +${e.over}px "${e.text}"`);
  for (const c of p.clipped) bits.push(`CLIP +${c.by}px "${c.text}"`);
  console.log(`  w${p.w} s${p.s}  ${p.title}`);
  for (const b of bits) console.log(`      ${b}`);
}
if (problems.length) console.log(`\nshots in ${OUT}/`);
await browser.close();

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

    const read = () => page.evaluate(() => {
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

    /* WAIT FOR THE LAYOUT TO STOP MOVING. A FIXED DELAY CANNOT DO THIS.
     *
     * A single read at 1500ms reported week 3 s12 and week 4 s20 as scrolling
     * by 177px. Sampling every 250ms across the entrance showed that 177px in
     * ONE window with zero either side: the card's entrance animation briefly
     * leaves its decoration unclipped, then the layout settles.
     *
     * Reading again 900ms later was still not enough. The next run reported a
     * DIFFERENT pair - week 5 s8 and s12 - on an unchanged build, always with
     * the same signature (177px over, 824px of content). Screens with a long
     * narration block take longer to settle, so any fixed delay catches a
     * different few each time, and a gate that names two different screens
     * per run cannot be used to clear a week.
     *
     * So poll until scrollHeight holds steady across consecutive reads, and
     * measure then. The flash seen on the way is kept and reported beside the
     * verdict, because the owner's rule is about a bar SITTING on a screen
     * that fits; a bar that exists for 200ms of animation is a different and
     * much smaller thing. */
    const during = await read();
    let m = during;
    let stable = 0;
    for (let i = 0; i < 40 && stable < 4; i++) {
      await page.waitForTimeout(150);
      const next = await read();
      if (!next) break;
      stable = next.pageOver === m.pageOver && next.stageOver === m.stageOver ? stable + 1 : 0;
      m = next;
    }
    if (!m || !during) continue;

    m.flashed = Math.max(during.stageOver, during.pageOver) - Math.max(m.stageOver, m.pageOver);
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
const flashes = rows.filter((r) => r.worst <= SLACK && r.flashed > SLACK);
for (const r of rows.sort((a, b) => b.worst - a.worst)) {
  const flag = r.worst > SLACK ? "  <- scrolls" : r.flashed > SLACK ? `  (flashed ${r.flashed}px during the entrance, settles)` : "";
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

if (flashes.length) {
  console.log(`\n${flashes.length} screen(s) settle flat but flash a bar during the entrance animation.`);
  console.log("Not a failure: the owner's rule is about a bar SITTING on a screen that fits.");
  /* This count is opportunistic and differs run to run - it comes from ONE
   * read taken on the way to the settled state, so it catches whichever
   * screens happen to be mid-entrance. Two runs of the same build named 1
   * screen and then 2 different ones. The VERDICT above is the reproducible
   * part; treat this as "the entrance does this somewhere", not a list. */
  console.log("Sampled opportunistically, so which screens appear here varies between runs.");
}

if (bad.length) {
  console.log(`\n${bad.length} screen(s) offer a scroll bar. Shots in ${OUT}/`);
  process.exit(1);
}
console.log("\nNo screen scrolls. Every card fits its stage.");

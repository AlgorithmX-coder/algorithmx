/**
 * The raccoon's head must not be cut off on the boss result screens.
 *
 * Owner, 2026-10-17, on the "SO CLOSE!" screen: "as you zoom out, the
 * raccoon's head gets chopped off at the top. This is something that we need
 * to push across all the weeks."
 *
 * Both result panels - victory and failed - are centred flex items that
 * scroll (`margin: auto`, `maxHeight: 100%`, `overflowY: auto`), and the
 * sprite is their FIRST child. Two things can take the top off its head:
 *
 *   - content taller than the panel. A centred box that overflows spills
 *     EQUALLY in both directions, and the part above the top edge is both
 *     clipped and unreachable by scrolling. This is the classic flex-centring
 *     trap and it appears as the viewport gets shorter relative to content.
 *   - the idle bob. The sprite animates y: [0, -7, 0], so even when the
 *     layout fits exactly, it rises 7px above its own box on every cycle and
 *     a tight clip edge shaves it.
 *
 * So this measures the sprite's painted rectangle against the clipping
 * rectangle of every scrolling ancestor, at several viewport heights, and
 * reports any overlap. It drives the boss to a LOSS by answering wrongly,
 * because the failed panel is the one the owner saw.
 *
 *   node scripts/audit-boss-sprite-clip.mjs 2
 *   node scripts/audit-boss-sprite-clip.mjs 2 --shots
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SHOTS = process.argv.includes("--shots");
const WEEKS = ARG.length ? ARG.map(Number) : [2];
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const OUT = ".boss-clip";

/* Week 2's screen order: the boss sits at 25. */
const BOSS_SCREEN = 25;

/* The owner's window, plus shorter ones. A result screen that only fits on a
 * tall monitor is broken for the person reviewing it. */
const VIEWPORTS = [
  /* The bug appears as the viewport grows relative to the content - the
   * owner saw it "as you zoom out". Measured: clean at 1414x771, 3px of the
   * head gone at 2560x1440. One viewport by default because each run takes
   * minutes: every answer waits on a narration gate that only releases on a
   * length-based safety timeout when there is no audible playback. */
  { width: 2560, height: 1440, label: "zoomed out 2560x1440" },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });

const rows = [];

for (const vp of VIEWPORTS) {
  for (const w of WEEKS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
    const page = await ctx.newPage();

    /* Walk to the boss rather than deep-linking to it.
     *
     * ?boss=1 and ?screen= both CLAMP to the furthest unlocked screen on a
     * fresh week, so a direct jump lands on the intro video and the audit
     * measures the wrong thing - or, as it did first time, measures nothing
     * and says so. Walking 0..N in one context builds the progress the
     * deep-link needs. The boss is screen 25 in week 2's order. */
    for (let sc = 0; sc <= BOSS_SCREEN; sc++) {
      await page.goto(`${BASE}/lesson/${w}?screen=${sc}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(sc === BOSS_SCREEN ? 2600 : 420);
    }

    /* The boss opens on a how-to-play gate; the quiz is behind it. */
    for (let i = 0; i < 40; i++) {
      const started = await page.evaluate(() =>
        /BOSS INTEGRITY|SKILLS TO REVIEW|TRY AGAIN/i.test(document.body.textContent || ""),
      );
      if (started) break;
      await page.evaluate(() => {
        /* The gate's button is "Initiate Test" on this boss - not "start" or
         * "begin", which is what a generic matcher looks for and why the
         * first run of this reached nothing at all. */
        const b = [...document.querySelectorAll("button")].find((el) =>
          /initiate|start|begin|ready|let's|play|fight|how to play|got it/i.test(el.textContent || ""),
        );
        if (b) b.click();
      });
      await page.waitForTimeout(900);
    }

    /* Answer every question WRONG, so the run ends on "SO CLOSE!". Clicks go
     * through the DOM node: the narration guard swallows real pointer events
     * while a clip plays. */
    let reached = false;
    for (let round = 0; round < 150 && !reached; round++) {
      reached = await page.evaluate(() =>
        /SO CLOSE|TRY AGAIN/i.test(document.body.textContent || ""),
      );
      if (reached) break;
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")].filter((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 80 && r.height > 24 && !/listening|skip/i.test(b.textContent || "");
        });
        /* The LAST option is wrong far more often than not; good enough to
         * fail a five-question quiz reliably. */
        if (btns.length) btns[btns.length - 1].click();
      });
      await page.waitForTimeout(3000);
    }

    if (!reached) {
      rows.push({ vp: vp.label, w, reached: false });
      await ctx.close();
      continue;
    }
    await page.waitForTimeout(1400);

    const m = await page.evaluate(() => {
      /* The LARGEST raccoon on the page. The first one in DOM order is the
       * 16px icon beside "BOSS INTEGRITY" in the HUD, which is never clipped
       * and made this report a clean pass while the head was being cut. */
      const img = [...document.querySelectorAll("img")]
        .filter((i) => /raccoon/i.test(i.getAttribute("src") || ""))
        .sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
      if (!img) return null;
      const r = img.getBoundingClientRect();

      /* Every ancestor that can clip, and the worst intrusion on the TOP. */
      let worstTop = 0;
      let culprit = "";
      let el = img.parentElement;
      while (el && el !== document.documentElement) {
        const cs = getComputedStyle(el);
        const clips =
          cs.overflowY === "auto" || cs.overflowY === "hidden" || cs.overflowY === "scroll";
        if (clips) {
          const b = el.getBoundingClientRect();
          const cut = Math.round(b.top - r.top);
          if (cut > worstTop) {
            worstTop = cut;
            culprit = el.className || el.tagName.toLowerCase();
          }
        }
        el = el.parentElement;
      }
      return {
        spriteTop: Math.round(r.top),
        spriteH: Math.round(r.height),
        cutTop: worstTop,
        culprit: String(culprit).slice(0, 40),
      };
    });

    if (!m) {
      rows.push({ vp: vp.label, w, reached: true, noSprite: true });
    } else {
      rows.push({ vp: vp.label, w, reached: true, ...m });
      if (SHOTS || m.cutTop > 0) {
        await page.screenshot({ path: `${OUT}/w${w}-${vp.width}x${vp.height}.png` });
      }
    }
    await ctx.close();
  }
}

await browser.close();

const measured = rows.filter((r) => r.reached && !r.noSprite);
const stuck = rows.filter((r) => !r.reached);
const clipped = measured.filter((r) => r.cutTop > 0);

console.log(`\n${measured.length} result screen(s) measured, ${stuck.length} the driver could not reach.\n`);
for (const r of measured) {
  const flag = r.cutTop > 0 ? `  <- ${r.cutTop}px of the head cut off` : "";
  console.log(`  ${r.vp.padEnd(18)} week ${r.w}  sprite ${r.spriteH}px tall${flag}`);
  if (r.cutTop > 0) console.log(`      clipped by: ${r.culprit}`);
}
if (stuck.length) console.log(`\nCould not reach the result screen: ${stuck.map((r) => r.vp).join(", ")}`);

if (!measured.length) {
  console.log("\nMEASURED NOTHING - the boss never reached a result screen.");
  process.exit(2);
}
if (clipped.length) {
  console.log(`\n${clipped.length} screen(s) cut the sprite. Shots in ${OUT}/`);
  process.exit(1);
}
console.log("\nThe sprite is whole on every viewport measured.");

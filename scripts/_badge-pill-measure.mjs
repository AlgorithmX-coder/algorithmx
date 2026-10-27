/* Why is "WEEK N COMPLETE" unreadable on the week-complete screen?
 *
 * Seen at stage 7b, 27 October 2026: weeks 2, 3 and 7 render that pill with
 * most of its letters covered, while week 1 reads cleanly. Two explanations
 * died against the CSS - the medal is objectFit:contain inside a fixed 168px
 * box, the pill is its sibling in normal flow, and every badge PNG is taller
 * than wide so it fits by height - so this measures the real boxes instead of
 * inferring them from screenshot pixels.
 *
 *   node scripts/_badge-pill-measure.mjs 1 2 3 7
 */
import { chromium } from "playwright";
import { signIn } from "./_qa-signin.mjs";

const WEEKS = process.argv.slice(2).map(Number).filter(Number.isFinite);
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";
const VIEWPORT = { width: 1414, height: 771 };

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: VIEWPORT });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
await signIn(page, BASE);

for (const w of WEEKS) {
  await page.goto(`${BASE}/lesson/${w}?screen=29`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("[data-lesson-stage]", { timeout: 15000 });
  await page.waitForTimeout(4000);

  const r = await page.evaluate(() => {
    const pill = [...document.querySelectorAll("div")].find((d) =>
      /^week\s+\d+\s+complete$/i.test((d.textContent || "").trim()),
    );
    const img = document.querySelector('img[src*="/cyberheroes/badges/"]');
    if (!pill || !img) return { pill: !!pill, img: !!img };
    const pb = pill.getBoundingClientRect();
    const ib = img.getBoundingClientRect();
    const cs = getComputedStyle(pill);
    /* Where the ART actually sits inside the img box: contain letterboxes it. */
    const nat = { w: img.naturalWidth, h: img.naturalHeight };
    const scale = Math.min(ib.width / nat.w, ib.height / nat.h);
    const drawnH = nat.h * scale;
    const artBottom = ib.top + (ib.height - drawnH) / 2 + drawnH;
    /* What is actually painted on top at the pill's centre? */
    const hit = document.elementFromPoint(pb.left + pb.width / 2, pb.top + pb.height / 2);
    return {
      pillTop: Math.round(pb.top), pillBottom: Math.round(pb.bottom),
      imgTop: Math.round(ib.top), imgBottom: Math.round(ib.bottom),
      artBottom: Math.round(artBottom),
      overlap: Math.round(artBottom - pb.top),
      colorOnTop: hit ? hit.tagName + (hit.getAttribute("src") ? " (the medal)" : "") : "?",
      pillColor: cs.color, pillBg: cs.backgroundColor, pillZ: cs.zIndex,
    };
  });

  console.log(`week ${String(w).padStart(2)}  ${JSON.stringify(r)}`);
}

await browser.close();

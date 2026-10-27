/* Which badge image is painted over the "WEEK N COMPLETE" pill?
 *
 * The first measurement proved the pill is covered by an IMG on weeks 2, 3 and
 * 7, but reported an image box 197-227px tall where the week-complete screen's
 * own markup fixes it at 168px. So more than one badge image is in the DOM.
 * This lists every one of them with its box, its stacking and its ancestors.
 *
 *   node scripts/_badge-pill-measure2.mjs 3
 */
import { chromium } from "playwright";
import { signIn } from "./_qa-signin.mjs";

const WEEKS = process.argv.slice(2).map(Number).filter(Number.isFinite);
const BASE = process.env.AUDIT_BASE || "http://localhost:3007";

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 } });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
await signIn(page, BASE);

for (const w of WEEKS) {
  await page.goto(`${BASE}/lesson/${w}?screen=29`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("[data-lesson-stage]", { timeout: 15000 });
  await page.waitForTimeout(4000);

  const r = await page.evaluate(() => {
    const out = { imgs: [] };
    const pill = [...document.querySelectorAll("div")].find((d) =>
      /^week\s+\d+\s+complete$/i.test((d.textContent || "").trim()),
    );
    if (pill) {
      const b = pill.getBoundingClientRect();
      out.pill = { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) };
    }
    for (const img of document.querySelectorAll('img[src*="/cyberheroes/badges/"]')) {
      const b = img.getBoundingClientRect();
      const parent = img.parentElement;
      const pcs = parent ? getComputedStyle(parent) : null;
      const chain = [];
      let n = img.parentElement;
      for (let i = 0; i < 4 && n; i++, n = n.parentElement) {
        const cs = getComputedStyle(n);
        chain.push(`${n.tagName}.${(n.className || "").toString().slice(0, 14)}{pos:${cs.position},z:${cs.zIndex},h:${cs.height},of:${cs.overflow}}`);
      }
      out.imgs.push({
        box: { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height), w: Math.round(b.width) },
        objectFit: getComputedStyle(img).objectFit,
        parentH: pcs ? pcs.height : "?",
        chain,
      });
    }
    return out;
  });

  console.log(`\n===== week ${w} =====`);
  console.log("pill:", JSON.stringify(r.pill));
  r.imgs.forEach((i, n) => {
    console.log(`  img[${n}] box=${JSON.stringify(i.box)} fit=${i.objectFit} parentH=${i.parentH}`);
    i.chain.forEach((c) => console.log(`        ${c}`));
  });
}

await browser.close();

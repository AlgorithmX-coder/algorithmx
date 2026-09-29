/* The quarterly vendor check: every terms page the course cites must still
 * be reachable and still carry the sentence the course tells learners to
 * look for. Run by .github/workflows/vendor-check.yml on the first of
 * January, April, July and October, and by hand:
 *
 *   npm run check:vendors
 *
 * Two readings per page: a plain fetch first, then a real browser when the
 * sentence is not in the raw HTML (the Claude privacy centre renders its
 * articles by script). The match ignores punctuation and markup, so a
 * curly apostrophe or a <strong> tag cannot fake a change.
 *
 * Outcomes: OK (page up, sentence present), FAIL (page up, sentence gone,
 * or page gone), BLOCKED (a bot wall answered both readings: cannot be
 * verified from a machine, check by hand). Only FAIL fails the run. A
 * FAIL means the vendor changed its page: re-verify the fact in
 * app/ai-cleared/content/vendors.ts and update the checked date. */

import { chromium } from "@playwright/test";
import { VENDORS } from "../app/ai-cleared/content/vendors";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const fold = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const blocked = (status: number) => status === 403 || status === 429 || status === 503;

async function plain(url: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "en-GB,en;q=0.9" }, redirect: "follow" });
  const html = await res.text();
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  return { status: res.status, text };
}

async function main() {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined });
  const ctx = await browser.newContext({ userAgent: UA, locale: "en-GB", viewport: { width: 1280, height: 900 } });
  const seen = new Set<string>();
  let ok = 0;
  let failed = 0;
  let unverifiable = 0;
  for (const v of VENDORS) {
    const { url, find, title } = v.terms;
    const key = `${url}::${find}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const want = fold(find);

    let status = 0;
    let present = false;
    let how = "plain fetch";
    try {
      const p = await plain(url);
      status = p.status;
      present = fold(p.text).includes(want);
    } catch {
      status = 0;
    }
    if (!present) {
      how = "browser";
      const page = await ctx.newPage();
      try {
        const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
        await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
        await page.evaluate(() => document.querySelectorAll("details").forEach((d) => d.setAttribute("open", "")));
        const text = await page.evaluate(() => document.body.innerText);
        const s = res?.status() ?? 0;
        if (s) status = s;
        present = fold(text).includes(want);
      } catch (err) {
        console.log(`      browser reading failed: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}`);
      } finally {
        await page.close();
      }
    }

    let verdict: "OK  " | "FAIL" | "BLKD";
    if (present) {
      verdict = "OK  ";
      ok++;
    } else if (blocked(status) || status === 0) {
      verdict = "BLKD";
      unverifiable++;
    } else {
      verdict = "FAIL";
      failed++;
    }
    console.log(`${verdict} ${String(status).padStart(3)} ${title}\n      ${url}\n      ${present ? `sentence present (${how})` : verdict === "BLKD" ? "bot wall, check by hand" : `sentence NOT found: "${find}"`}`);
  }
  await browser.close();
  console.log(`\n${ok} ok, ${failed} changed, ${unverifiable} blocked, of ${seen.size} vendor pages.`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("vendor check failed to run:", e instanceof Error ? e.message : e);
  process.exit(1);
});

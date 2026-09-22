/** Dump what the live page actually rendered, with a screenshot to prove
 *  the probe and the shot are looking at the same frame. */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const [shareUrl, path = "/", stopAtArg = "3300"] = process.argv.slice(2);
const stopAt = Number(stopAtArg);
const origin = new URL(shareUrl).origin;
const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 } });
/* Without this the whole site is the "gate is sealed" password page, and
   every selector comes back zero for reasons that have nothing to do with
   the code under test. */
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
await page.goto(shareUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2000);
await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(3000);
/* Lenis drives the scroll, so a scripted window.scrollTo can be reverted
   before it settles. Real wheel events go through it the way a hand does. */
for (let y = 0; y < stopAt; y += 400) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(110);
}
await page.waitForTimeout(2500);
await page.screenshot({ path: "scripts/_probe.png" });

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const classes = new Set();
      for (const e of document.querySelectorAll("*")) {
        for (const c of e.classList) if (c.startsWith("lv2-course") || c.startsWith("sch-mark")) classes.add(c);
      }
      const a = document.querySelector("a.lv2-course-mark, a.sch-mark");
      const cs = a ? getComputedStyle(a) : null;
      return {
        scrollY: Math.round(window.scrollY),
        seen: [...classes],
        anchors: document.querySelectorAll('a[href="/cyberheroes"]').length,
        sample: a
          ? {
              cls: a.className,
              display: cs.display,
              flexDirection: cs.flexDirection,
              bg: cs.backgroundImage !== "none" ? cs.backgroundImage.slice(0, 70) : cs.backgroundColor,
              border: cs.borderTopWidth + "/" + cs.borderLeftWidth,
              padding: cs.padding,
              html: a.parentElement?.outerHTML.slice(0, 380),
            }
          : null,
      };
    }),
    null,
    2,
  ),
);
await browser.close();

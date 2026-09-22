/**
 * The sand pages set `html { background }` and a couple of other document
 * level rules from inside a page component. Those are global while the
 * page is mounted, so the thing to prove is that a soft navigation away
 * takes them with it: a user clicking "Cybersecurity" in the homepage
 * footer must not land on a dark page with a sand html behind it.
 *
 *   node scripts/_leaktest.mjs "<entry url, may carry _vercel_share>"
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const [entry] = process.argv.slice(2);
const origin = new URL(entry).origin;
const CHROME = "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const browser = await chromium.launch(
  existsSync(CHROME) ? { headless: true, executablePath: CHROME } : { headless: true, channel: "msedge" },
);
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 } });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: new URL(origin).hostname, path: "/" }]);
const page = await ctx.newPage();
await page.goto(entry, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2500);

const probe = () =>
  page.evaluate(() => ({
    url: location.pathname,
    html: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor,
    cnbBlend: getComputedStyle(document.documentElement).getPropertyValue("--cnb-blend").trim() || "(unset)",
    sandRoots: document.querySelectorAll(".lv2-sand, .sch-page").length,
  }));

const show = (label, r) =>
  console.log(
    `${label.padEnd(30)} path=${r.url.padEnd(16)} html=${r.html.padEnd(22)} body=${r.body.padEnd(22)} --cnb-blend=${r.cnbBlend} sandRoots=${r.sandRoots}`,
  );

/* a cold load of the dark page, as a reference for what it should be */
await page.goto(origin + "/cybersecurity", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(3000);
const cold = await probe();
show("cold /cybersecurity", cold);

/* now the route that could leak: sand page first, then soft-navigate */
await page.goto(origin + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(3000);
show("cold / (sand)", await probe());

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1500);
await page.getByRole("link", { name: "Cybersecurity", exact: true }).first().click({ timeout: 10000 });
await page.waitForTimeout(3500);
const soft = await probe();
show("soft / -> /cybersecurity", soft);

const leaked = soft.html !== cold.html || soft.sandRoots !== 0 || soft.cnbBlend !== cold.cnbBlend;
console.log(leaked ? "LEAK: the sand document rules survived the navigation" : "clean: the dark page matches its cold load");

/* and back the other way, in case the dark page strands the sand one */
await page.goBack({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
show("back -> / (sand)", await probe());

await browser.close();

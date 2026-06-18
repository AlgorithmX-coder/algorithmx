// Screenshot helper for the Cyber Heroes refine loop. Flag-based so it can
// capture interaction frames, not just idle ones. Uses local chromium if
// present, else system Edge (no headless-shell download needed).
//
//   node scripts/_shot.mjs --url=<url> --out=<path> [--wait=ms]
//        [--w=1280 --h=900] [--click="text"] [--clickwait=ms]
//
// --click drives one click (by visible text, force) before the shot, so you
// can capture correct/wrong/feedback frames. Dialogs (alerts) auto-dismiss.
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=([\s\S]*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);
const url = args.url || "http://localhost:3000/dev/preview?case=3";
const out = args.out || "scripts/shot-out/shot.png";
const wait = Number(args.wait || 4000);
const width = Number(args.w || 1280);
const height = Number(args.h || 900);
const click = typeof args.click === "string" ? args.click : null;
const clickWait = Number(args.clickwait || 700);

const CHROME =
  "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const launchOpts = existsSync(CHROME)
  ? { headless: true, executablePath: CHROME }
  : { headless: true, channel: "msedge" };
console.log("launch:", existsSync(CHROME) ? "local chromium" : "system edge");

mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width, height } });
page.on("dialog", (d) => d.dismiss().catch(() => {}));
try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
} catch {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
}
await page.waitForTimeout(wait);
if (click) {
  try {
    const byRole = page.getByRole("button", { name: click, exact: false });
    if (await byRole.count()) {
      await byRole.first().click({ timeout: 5000 });
    } else {
      await page
        .getByText(click, { exact: false })
        .first()
        .click({ timeout: 5000, force: true });
    }
    await page.waitForTimeout(clickWait);
  } catch (e) {
    console.log("click failed:", e.message.split("\n")[0]);
  }
}
await page.screenshot({ path: out });
console.log("shot ->", out);
await browser.close();

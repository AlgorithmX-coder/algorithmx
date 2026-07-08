// Full-week screenshot sweep for the Cyber Heroes QA loop.
//
// Logs in as the seeded e2e user, then walks every ?screen=N deep link of
// a week and saves one PNG per screen. Run against a dev server started
// with E2E_TESTS=1 (so the seed endpoint + deep link work):
//
//   node scripts/_week-sweep.mjs --week=3 --screens=29 [--base=http://localhost:3100]
//        [--only=4,8,12] [--wait=5000] [--out=scripts/shot-out/w3]
import { chromium, request } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=([\s\S]*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);
const week = Number(args.week || 3);
const screens = Number(args.screens || 29);
const base = args.base || "http://localhost:3100";
const wait = Number(args.wait || 5000);
const out = args.out || `scripts/shot-out/w${week}`;
const only = typeof args.only === "string" ? args.only.split(",").map(Number) : null;
// Optional interaction before the shot: click a button by visible text
// (e.g. --click="I'm ready") once per screen, then wait --clickwait ms.
const click = typeof args.click === "string" ? args.click : null;
const clickWait = Number(args.clickwait || 1500);
const suffix = typeof args.suffix === "string" ? args.suffix : click ? "-after" : "";

const TEST_EMAIL = "e2e@algorithmx.test";
const TEST_PASSWORD = "e2e-test-pw";

const CHROME =
  "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const launchOpts = existsSync(CHROME)
  ? { headless: true, executablePath: CHROME }
  : { headless: true, channel: "msedge" };

mkdirSync(out, { recursive: true });

// 1. Seed (idempotent; also clears progress so no resume banner).
const api = await request.newContext({ baseURL: base });
const seedRes = await api.post("/api/test/seed");
if (!seedRes.ok()) {
  console.error(`seed failed (${seedRes.status()}): ${await seedRes.text()}`);
  process.exit(1);
}
await api.dispose();

// 2. Login once.
const browser = await chromium.launch(launchOpts);
const context = await browser.newContext({ baseURL: base, viewport: { width: 1280, height: 900 } });
await context.addCookies([
  {
    name: "site_auth",
    value: "true",
    domain: new URL(base).hostname,
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
page.on("dialog", (d) => d.dismiss().catch(() => {}));
await page.goto(`${base}/login`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForSelector("#login-email", { timeout: 20000 });
await page.waitForTimeout(1200); // let hydration finish so the submit handler is live
let authed = false;
for (let attempt = 0; attempt < 3 && !authed; attempt++) {
  await page.locator("#login-email").fill(TEST_EMAIL);
  await page.locator("#login-password").fill(TEST_PASSWORD);
  await page.locator("#login-password").press("Enter");
  for (let i = 0; i < 40 && !authed; i++) {
    authed = (await context.cookies()).some((c) => c.name.includes("authjs.session-token"));
    if (!authed) await page.waitForTimeout(250);
  }
  if (!authed) {
    console.log(`login attempt ${attempt + 1} failed, retrying...`);
    await page.reload({ waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1200);
  }
}
if (!authed) {
  const text = (await page.locator("body").innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 200);
  console.error(`login failed - no session cookie. page="${text}"`);
  process.exit(1);
}
console.log("logged in");

// 3. Sweep.
const list = only ?? Array.from({ length: screens }, (_, i) => i);
for (const n of list) {
  const url = `${base}/lesson/${week}?screen=${n}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    console.log(`s${n}: goto issue - ${e.message.split("\n")[0]}`);
  }
  await page.waitForTimeout(wait);
  if (click) {
    try {
      const byRole = page.getByRole("button", { name: click, exact: false });
      if (await byRole.count()) {
        await byRole.first().click({ timeout: 5000 });
      } else {
        await page.getByText(click, { exact: false }).first().click({ timeout: 5000, force: true });
      }
      await page.waitForTimeout(clickWait);
    } catch (e) {
      console.log(`s${n}: click failed - ${e.message.split("\n")[0]}`);
    }
  }
  const file = `${out}/s${String(n).padStart(2, "0")}${suffix}.png`;
  await page.screenshot({ path: file });
  console.log(`s${n} -> ${file}`);
}

await browser.close();
console.log("sweep done");

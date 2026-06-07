import { chromium } from "playwright";

const b = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await b.newContext({ viewport: { width: 1456, height: 920 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const pg = await ctx.newPage();
const errors = [];
pg.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
pg.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await pg.goto("http://localhost:3000/onboarding", { waitUntil: "domcontentloaded", timeout: 60000 });
await pg.waitForTimeout(2000);
await pg.fill("#child-name", "Oliver");
await pg.waitForTimeout(500);
await pg.getByRole("button", { name: /create hero profile/i }).click();
await pg.waitForTimeout(900);
await pg.screenshot({ path: "scripts/verify-out/onboarding-step1.png", animations: "disabled" });
console.log("step1 shot done");
// pick an age
await pg.getByRole("button", { name: "8" }).click();
await pg.waitForTimeout(700);
await pg.getByRole("button", { name: /choose academy access/i }).click();
await pg.waitForTimeout(900);
await pg.screenshot({ path: "scripts/verify-out/onboarding-step2.png", animations: "disabled" });
console.log("step2 shot done");
console.log("CONSOLE ERRORS:", JSON.stringify(errors, null, 2));
await b.close();
console.log("DONE");

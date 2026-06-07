import { chromium } from "playwright";

const b = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await b.newContext({ viewport: { width: 1456, height: 1040 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const pg = await ctx.newPage();
await pg.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });
await pg.waitForTimeout(5500);
await pg.screenshot({ path: "scripts/verify-out/reactor-login.png", timeout: 90000, animations: "disabled" });
console.log("login shot done");
await b.close();
console.log("DONE");

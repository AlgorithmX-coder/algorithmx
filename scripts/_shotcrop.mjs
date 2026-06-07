import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge", args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1456, height: 1040 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const pg = await ctx.newPage();
await pg.goto("http://localhost:3000/signup", { waitUntil: "domcontentloaded", timeout: 60000 });
await pg.waitForTimeout(4000);
await pg.mouse.move(10, 500); // ensure nothing hovered/focused near nav
await pg.screenshot({ path: "scripts/verify-out/nav-pill.png", timeout: 90000, animations: "disabled", clip: { x: 1322, y: 10, width: 134, height: 70 } });
console.log("crop done");
await b.close();

import { chromium } from "playwright";

const b = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const w of [2560]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 700 }, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
  const pg = await ctx.newPage();
  await pg.goto("http://localhost:3000/landing-v2", { waitUntil: "domcontentloaded", timeout: 60000 });
  await pg.waitForTimeout(3500);
  await pg.screenshot({ path: `scripts/verify-out/nav-${w}.png`, timeout: 60000, animations: "disabled" });
  console.log("shot", w);
  await ctx.close();
}
await b.close();
console.log("DONE");

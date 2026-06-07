import { chromium } from "playwright";

const b = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function shot(viewport, name, fill) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
  const pg = await ctx.newPage();
  await pg.goto("http://localhost:3000/onboarding", { waitUntil: "domcontentloaded", timeout: 60000 });
  await pg.waitForTimeout(2500);
  if (fill) {
    await pg.fill("#child-name", "Oliver");
    await pg.waitForTimeout(900);
  }
  await pg.screenshot({ path: `scripts/verify-out/onboarding-${name}.png`, timeout: 90000, animations: "disabled" });
  console.log(`shot ${name} done`);
  await ctx.close();
}

await shot({ width: 1456, height: 920 }, "desktop-idle", false);
await shot({ width: 1456, height: 920 }, "desktop-filled", true);
await shot({ width: 390, height: 844 }, "mobile-filled", true);
await b.close();
console.log("DONE");

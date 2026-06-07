import { chromium } from "playwright";

const b = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const ctx = await b.newContext({ viewport: { width: 1456, height: 1040 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
const pg = await ctx.newPage();
pg.on("console", (m) => {
  if (m.type() === "error") console.log("PAGE-ERR:", m.text().slice(0, 200));
});
pg.on("pageerror", (e) => console.log("PAGE-THROW:", String(e).slice(0, 200)));

await pg.goto("http://localhost:3000/signup", { waitUntil: "domcontentloaded", timeout: 60000 });
await pg.waitForTimeout(5000);
await pg.screenshot({ path: "scripts/verify-out/reactor-signup-idle.png", timeout: 90000, animations: "disabled" });
console.log("idle shot done");

try {
  await pg.fill("#signup-name", "Asad Jalal");
  await pg.fill("#signup-email", "you@example.com");
  await pg.fill("#signup-password", "Password!23");
  await pg.fill("#signup-confirm", "Password!23");
  await pg.waitForTimeout(3000);
  await pg.screenshot({ path: "scripts/verify-out/reactor-signup-filled.png", timeout: 90000, animations: "disabled" });
  console.log("filled shot done");
} catch (e) {
  console.log("fill failed:", String(e).slice(0, 160));
}

await b.close();
console.log("DONE");

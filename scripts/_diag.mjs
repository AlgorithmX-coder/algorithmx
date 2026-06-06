import { chromium } from "playwright";
import { join } from "node:path";
const D = join("scripts", "verify-out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const b = await chromium.launch({ executablePath: EDGE });

async function cap(tag, reduced) {
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/", httpOnly: false, secure: false, sameSite: "Lax" }]);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push("PAGEERR: " + e.message));
  pg.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await pg.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 45000 });
  await pg.waitForTimeout(2500);
  // count canvases + report webgl
  const info = await pg.evaluate(() => {
    const cs = Array.from(document.querySelectorAll("canvas"));
    const gl = cs.map((c) => {
      const g = c.getContext("webgl2") || c.getContext("webgl");
      return { w: c.width, h: c.height, hasGL: !!g, lost: g ? g.isContextLost() : null };
    });
    return { count: cs.length, gl };
  });
  await pg.screenshot({ path: join(D, `diag-${tag}.png`) });
  console.log(`[${tag}] reduced=${reduced} canvases=${info.count} gl=${JSON.stringify(info.gl)}`);
  console.log(`[${tag}] errors:`, errs.slice(0, 6));
  await ctx.close();
}

await cap("reduced", true);
await cap("normal", false);
await b.close();

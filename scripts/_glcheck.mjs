import { chromium } from "playwright";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const b = await chromium.launch({ executablePath: EDGE });
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const pg = await ctx.newPage();
await pg.goto("about:blank");
const info = await pg.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return { ok: false };
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    ok: true,
    vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "?",
    renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "?",
    version: gl.getParameter(gl.VERSION),
  };
});
console.log(JSON.stringify(info));
await b.close();

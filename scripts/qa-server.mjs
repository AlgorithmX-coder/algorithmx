/**
 * Start the local QA server, and PROVE it is serving this checkout.
 *
 * Two traps cost real time during the week 1 UAT work, and both of them look
 * identical from the outside: the screenshot comes back showing the wrong
 * thing, and you go hunting in your own diff for a bug that is not there.
 *
 *   1. A server from an earlier session was still holding port 3007. The new
 *      one failed with EADDRINUSE, the failure scrolled past in a background
 *      log, curl said 200 because the OLD one answered, and every screenshot
 *      after that was of a build from hours ago.
 *
 *   2. A backgrounded `cd <worktree> && next start` ran from the PRIMARY
 *      checkout instead, which is hundreds of commits behind. The shell's
 *      working directory does not survive backgrounding the way it looks
 *      like it should.
 *
 * Noticing either one depends on recognising a screen you did not expect,
 * which is not a check. These are:
 *
 *   - the server is started from the directory THIS FILE lives in, resolved
 *     from import.meta.url, so it cannot be a different checkout,
 *   - anything already holding the port is killed first, rather than
 *     silently winning,
 *   - and once it answers, .next/BUILD_ID is probed over HTTP. Next serves
 *     /_next/static/<BUILD_ID>/_ssgManifest.js for its own build and 404s
 *     for any other, so a 200 is proof the process answering is running the
 *     build sitting in this working tree.
 *
 *   node scripts/qa-server.mjs                 start on 3007 and verify
 *   node scripts/qa-server.mjs --build         build first
 *   node scripts/qa-server.mjs --port=3010
 *   node scripts/qa-server.mjs --verify-only   check what is already there
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = Number((process.argv.find((a) => a.startsWith("--port=")) || "--port=3007").split("=")[1]);
const DO_BUILD = process.argv.includes("--build");
const VERIFY_ONLY = process.argv.includes("--verify-only");
const BASE = `http://localhost:${PORT}`;

const say = (m) => console.log(`[qa-server] ${m}`);

function killPort(port) {
  if (process.platform === "win32") {
    const r = spawnSync("powershell", ["-NoProfile", "-Command",
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
      "Select-Object -ExpandProperty OwningProcess -Unique | " +
      "ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; $_ }",
    ], { encoding: "utf8" });
    const pids = (r.stdout || "").trim().split(/\s+/).filter(Boolean);
    if (pids.length) say(`killed ${pids.length} process(es) holding :${port} (${pids.join(", ")})`);
    return pids.length;
  }
  const r = spawnSync("sh", ["-c", `lsof -ti tcp:${port} || true`], { encoding: "utf8" });
  const pids = (r.stdout || "").trim().split(/\s+/).filter(Boolean);
  for (const pid of pids) spawnSync("kill", ["-9", pid]);
  if (pids.length) say(`killed ${pids.length} process(es) holding :${port}`);
  return pids.length;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function status(path) {
  try {
    const r = await fetch(BASE + path, { redirect: "manual" });
    return r.status;
  } catch {
    return 0;
  }
}

/** Is the thing answering on this port running the build in THIS tree? */
async function servesThisTree() {
  const idPath = join(ROOT, ".next", "BUILD_ID");
  if (!existsSync(idPath)) return { ok: false, why: "no .next/BUILD_ID here - run with --build" };
  const id = readFileSync(idPath, "utf8").trim();
  const code = await status(`/_next/static/${id}/_ssgManifest.js`);
  if (code === 200) return { ok: true, id };
  return { ok: false, id, why: `the server on :${PORT} does not know build ${id} (HTTP ${code}). It is serving a DIFFERENT checkout or an older build.` };
}

if (VERIFY_ONLY) {
  const v = await servesThisTree();
  if (v.ok) { say(`OK - :${PORT} is serving ${ROOT} build ${v.id}`); process.exit(0); }
  say(`MISMATCH - ${v.why}`);
  process.exit(1);
}

if (DO_BUILD) {
  say(`building in ${ROOT}`);
  const b = spawnSync("npx", ["next", "build"], {
    cwd: ROOT, stdio: "inherit", shell: process.platform === "win32",
    env: { ...process.env, AX_LOCAL_QA: "1", E2E_TESTS: "1" },
  });
  if (b.status !== 0) { say("build failed"); process.exit(1); }
}

killPort(PORT);
await sleep(1500);

say(`starting next start in ${ROOT}`);
const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  detached: process.platform !== "win32",
  stdio: ["ignore", "inherit", "inherit"],
  shell: process.platform === "win32",
  env: { ...process.env, AX_LOCAL_QA: "1", E2E_TESTS: "1" },
});
child.unref?.();

for (let i = 0; i < 40; i++) {
  if (await status("/") === 200) break;
  await sleep(1500);
}

const v = await servesThisTree();
if (!v.ok) {
  say(`FAILED: ${v.why}`);
  say("Nothing downstream of this is trustworthy - screenshots would be of the wrong build.");
  process.exit(1);
}
say(`ready - :${PORT} is serving ${ROOT} build ${v.id}`);

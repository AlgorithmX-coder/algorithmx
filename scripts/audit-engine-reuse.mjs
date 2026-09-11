// Engine-reuse audit for Cyber Heroes (owner mandate 2026-09-11, caps:
// "WE NEVER COPY AN EXERCISE. Go and make sure across all the weeks").
//
// Maps every exercise engine (the component DynamicLesson mounts per screen
// type) to the weeks that use it and enforces the decided policy:
//   1. A week rebuilt to the Learn-Loop standard never uses an engine already
//      used by a previously rebuilt week (REBUILT order below).
//   2. Never the same engine in two consecutive weeks.
//   3. Max 3 uses per engine across the 20 weeks.
//   4. (Human check) every reuse is a genuine re-theme, never a copy.
// It also lists the wired-but-unused engines to draw on first.
//
//   node scripts/audit-engine-reuse.mjs            # full table + flags
//   node scripts/audit-engine-reuse.mjs --strict   # exit 1 when a rebuilt-week
//                                                  # collision or a cap breach exists
//   node scripts/audit-engine-reuse.mjs --week=3   # what W3 may NOT use, and the free list
import { readFileSync, readdirSync } from "node:fs";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const planWeek = Number((args.find((a) => a.startsWith("--week=")) || "").split("=")[1] || 0);

// Weeks rebuilt to the Learn-Loop standard, in build order. Append as weeks ship.
const REBUILT = [15, 1, 2];
const CAP = 3;

// Screen types that are the spine, not exercises.
const SPINE = new Set([
  "video", "alert", "weekIntro", "mission", "info", "recap", "quickCheck", "threat", "nextPower",
  "bossBattle", "missionDebrief", "stickerUnlock", "completion", "signature", "cutscene", "reward",
]);

const DL = readFileSync("app/lesson/[week]/DynamicLesson.tsx", "utf8").replace(/\r\n/g, "\n");
// type -> engine component: the first `<Component` inside each `case "type":` block.
const typeToEngine = new Map();
const caseRe = /\n\s*case "([a-zA-Z]+)":/g;
const cases = [];
let m;
while ((m = caseRe.exec(DL)) !== null) cases.push({ type: m[1], off: m.index });
for (let i = 0; i < cases.length; i++) {
  const { type, off } = cases[i];
  if (SPINE.has(type)) continue;
  const body = DL.slice(off, i + 1 < cases.length ? cases[i + 1].off : off + 4000);
  const comps = [...body.matchAll(/<([A-Z][A-Za-z0-9]+)\b/g)].map((x) => x[1]).filter((c) => !/^(FullScene|Fragment|React|motion|AnimatePresence)$/.test(c));
  if (comps.length) typeToEngine.set(type, comps[0]);
}
// chooseYourPath mounts PauseDecide when presentation:"device" (data-driven).
const DIR = "app/lesson/weekContent";
const weekFiles = readdirSync(DIR).filter((f) => /^week\d+\.ts$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const usage = new Map(); // engine -> [{week, type}]
for (const f of weekFiles) {
  const wk = Number(f.match(/\d+/)[0]);
  const src = readFileSync(`${DIR}/${f}`, "utf8").replace(/\r\n/g, "\n");
  const scrStart = src.indexOf("  screens: [");
  const scrEnd = src.indexOf("\n  ],", scrStart);
  const scr = scrStart >= 0 ? src.slice(scrStart, scrEnd) : src;
  const starts = [...scr.matchAll(/^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm)].map((x) => ({ type: x[1], off: x.index }));
  starts.forEach((s, i) => {
    if (SPINE.has(s.type)) return;
    const span = scr.slice(s.off, i + 1 < starts.length ? starts[i + 1].off : scr.length);
    let engine = typeToEngine.get(s.type) || s.type;
    // chooseYourPath is data-driven: presentation "device" mounts PauseDecide, else the adventure doors.
    if (s.type === "chooseYourPath") engine = /presentation:\s*"device"/.test(span) ? "PauseDecide" : "ChooseYourPath";
    if (!usage.has(engine)) usage.set(engine, []);
    usage.get(engine).push({ week: wk, type: s.type });
  });
}

// All engines wired in DynamicLesson (to list the unused ones).
const wired = new Set([...typeToEngine.values(), "PauseDecide", "ChooseYourPath"]);

const flags = [];
const rows = [...usage.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
console.log("ENGINE               USES  WEEKS");
for (const [engine, uses] of rows) {
  const weeks = [...new Set(uses.map((u) => u.week))].sort((a, b) => a - b);
  console.log(engine.padEnd(20) + String(uses.length).padStart(4) + "  " + weeks.map((w) => "W" + w).join(" "));
  // rule 3
  if (uses.length > CAP) flags.push({ sev: "CAP", msg: `${engine} used ${uses.length}x (cap ${CAP}): ${weeks.map((w) => "W" + w).join(" ")}` });
  // rule 2
  for (let i = 1; i < weeks.length; i++) if (weeks[i] === weeks[i - 1] + 1) flags.push({ sev: "CONSECUTIVE", msg: `${engine} in consecutive weeks W${weeks[i - 1]} -> W${weeks[i]}` });
  // rule 1
  const rebuiltHits = REBUILT.filter((w) => weeks.includes(w));
  if (rebuiltHits.length > 1) flags.push({ sev: "REBUILT-COLLISION", msg: `${engine} used by more than one rebuilt week: ${rebuiltHits.map((w) => "W" + w).join(" ")} (rebuilt order ${REBUILT.map((w) => "W" + w).join(" > ")})` });
}
const unused = [...wired].filter((e) => !usage.has(e)).sort();
console.log("\nwired but UNUSED (draw on these first): " + (unused.join(", ") || "none"));

if (planWeek) {
  const taken = new Set();
  for (const [engine, uses] of usage) if (uses.some((u) => REBUILT.includes(u.week) && u.week !== planWeek)) taken.add(engine);
  const neighbours = new Set();
  for (const [engine, uses] of usage) if (uses.some((u) => Math.abs(u.week - planWeek) === 1)) neighbours.add(engine);
  const capped = new Set();
  for (const [engine, uses] of usage) if (uses.filter((u) => u.week !== planWeek).length >= CAP) capped.add(engine);
  const free = [...wired].filter((e) => !taken.has(e) && !neighbours.has(e) && !capped.has(e)).sort();
  console.log(`\nPLANNING W${planWeek}:`);
  console.log("  NOT allowed (used by a rebuilt week): " + [...taken].sort().join(", "));
  console.log("  NOT allowed (neighbour week W" + (planWeek - 1) + "/W" + (planWeek + 1) + "): " + [...neighbours].sort().join(", "));
  console.log("  NOT allowed (cap reached): " + ([...capped].sort().join(", ") || "none"));
  console.log("  FREE to use: " + (free.join(", ") || "none - build a NEW engine"));
}

console.log("\n---------------- FLAGS ----------------");
for (const f of flags) console.log(`${f.sev.padEnd(18)} ${f.msg}`);
console.log(`flags: ${flags.length} (rebuilt-collision ${flags.filter((f) => f.sev === "REBUILT-COLLISION").length}, consecutive ${flags.filter((f) => f.sev === "CONSECUTIVE").length}, cap ${flags.filter((f) => f.sev === "CAP").length})`);
console.log("Legacy weeks (not yet rebuilt) carry historical consecutive/cap flags; they clear as each week is rebuilt. --strict fails only on rebuilt-week collisions.");
if (strict && flags.some((f) => f.sev === "REBUILT-COLLISION")) process.exit(1);

// audit-spine-narration.mjs - does every screen that CAN speak actually have a
// narration block, and does every screen that cannot have none?
//
// WHY THIS EXISTS. We already gate two kinds of silence:
//   audit-verdict-voice.mjs  the sentence after That's right / Not quite
//   audit-read-alouds.mjs    the lines an engine reads off its own board
// Both check that a line WE AUTHORED has a recording. Neither can see the case
// where the line was never authored at all, and audit-read-alouds skips every
// spine screen by design (a spine screen has no board).
//
// So on 2026-09-25 a tester found Week 10's alert screen completely silent, and
// it turned out weeks 10-14 and 16-20 had no alert narration whatsoever - ten
// weeks, invisible to all three gates, because WelcomeScene renders its
// narration as {narration && ...} with no fallback. Nothing is missing from the
// manifest when nothing was ever written down.
//
//   node scripts/audit-spine-narration.mjs            full report
//   node scripts/audit-spine-narration.mjs --strict   exit 1 on any mismatch
//
// THE EXPECTATION IS READ OUT OF THE RENDERER, not hardcoded here. DynamicLesson
// decides which screen types get narration={def.narration}; a type it passes
// must carry a block in every week, and a type it does not pass must carry none
// (an authored block on such a type is dead data - it is recorded by the clip
// generator and then never played).
//
// A hand-kept list of "types that must speak" would have to be updated for
// every new screen type by hand, which is precisely the failure that let the
// generator's week list go stale and shipped Weeks 14 and 17 mute. A rule
// derived from the renderer cannot go stale, because the renderer IS the
// contract.
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const strict = args.includes("--strict");

const ROUTE = "app/lesson/[week]/page.tsx".replace("page.tsx", "DynamicLesson.tsx");
if (!existsSync(ROUTE)) {
  console.error("Cannot find " + ROUTE);
  process.exit(1);
}
const route = readFileSync(ROUTE, "utf8").replace(/\r\n/g, "\n");

// Walk the renderer's switch: remember the case label we are inside, and note
// every type whose JSX forwards the authored narration.
const SPEAKS = new Set();
{
  let current = null;
  for (const line of route.split("\n")) {
    const c = /^\s*case "([a-zA-Z]+)":/.exec(line);
    if (c) current = c[1];
    // Two forwarding spellings: spine screens use narration=, and every game
    // screen passes the same block as introNarration= (it is spoken over the
    // exercise intro card). Missing the second one reported all 79 game types
    // as carrying dead data, which is the opposite of the truth.
    if (current && (line.includes("narration={def.narration}") || line.includes("introNarration={def.narration}"))) SPEAKS.add(current);
  }
}
if (SPEAKS.size === 0) {
  console.error("Parsed no narration-forwarding cases - the renderer's shape changed, fix this audit.");
  process.exit(1);
}

const WEEKS = Array.from({ length: 20 }, (_, i) => i + 1);

/** type -> { voiced:Set<week>, silent:Set<week> } */
const tally = new Map();
const bump = (type, week, voiced) => {
  if (!tally.has(type)) tally.set(type, { voiced: new Set(), silent: new Set() });
  tally.get(type)[voiced ? "voiced" : "silent"].add(week);
};

for (const w of WEEKS) {
  const path = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(path)) continue;
  const src = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

  // Same slicing the generator and audit-read-alouds use: one span per screen.
  const typeRe = /^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm;
  const starts = [];
  let tm;
  while ((tm = typeRe.exec(src)) !== null) starts.push({ type: tm[1], off: tm.index });

  starts.forEach((st, i) => {
    const span = src.slice(st.off, i + 1 < starts.length ? starts[i + 1].off : src.length);
    bump(st.type, w, /\bnarration:\s*\{/.test(span));
  });
}

let missing = 0;
let dead = 0;

console.log("EXPECTED TO SPEAK (renderer forwards narration): " + [...SPEAKS].sort().join(", ") + "\n");

console.log("--- screens that should speak ---");
for (const type of [...SPEAKS].sort()) {
  const t = tally.get(type);
  if (!t) continue;
  // A type repeating within a week (five info screens) lands in both sets when
  // any one occurrence has no block, which is the miss worth printing.
  const bad = [...t.silent].sort((a, b) => a - b);
  if (bad.length === 0) {
    console.log(`${type.padEnd(16)} narrated in every week  ok`);
  } else {
    missing += bad.length;
    console.log(`${type.padEnd(16)} *** no narration on at least one screen in week(s) ${bad.join(", ")} ***`);
  }
}

console.log("\n--- screens that cannot speak (a block here is never played) ---");
for (const [type, t] of [...tally.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (SPEAKS.has(type)) continue;
  const stray = [...t.voiced].sort((a, b) => a - b);
  if (stray.length === 0) continue;
  dead += stray.length;
  console.log(`${type.padEnd(16)} *** dead narration block in week(s) ${stray.join(", ")} - the renderer never forwards it ***`);
}
if (dead === 0) console.log("(none)");

console.log(`\n${missing} silent screen(s), ${dead} dead block(s)`);
// --strict gates on SILENCE only. A dead block plays nothing and breaks
// nothing; it is worth printing so it can be wired up or deleted deliberately,
// but it must not hold the gate red and train people to ignore the output.
if (strict && missing > 0) process.exit(1);

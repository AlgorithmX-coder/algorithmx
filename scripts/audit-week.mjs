/**
 * Run the whole pre-test checklist for one week, as one command.
 *
 * Owner, 2026-10-17: "All of the issues that we found in week one, week two,
 * every single one I want to make sure that you have covered it with three,
 * four, and five... go through that strict criteria that you've created and
 * if you need to add to it, add to it."
 *
 * The checklist lived in prose in the register, which meant running it was a
 * matter of remembering nine commands and what each one's clean output looks
 * like. Remembering is how a step gets skipped. This runs them and prints one
 * table.
 *
 * What it does NOT do, deliberately: the browser stages (stage overflow, card
 * fill, frame fit, boss sprite) need a built server and take minutes, so they
 * stay separate and are listed at the end as a reminder. A gate that is slow
 * and a gate that is instant should not be in the same command, or the slow
 * one stops being run.
 *
 *   node scripts/audit-week.mjs 3
 *   node scripts/audit-week.mjs 3 4 5
 */
import { spawnSync } from "node:child_process";

const WEEKS = process.argv.slice(2).filter((a) => !a.startsWith("--")).map(Number);
if (!WEEKS.length) {
  console.log("usage: node scripts/audit-week.mjs <week> [week...]");
  process.exit(2);
}

/** Each gate, with the week-2 finding it exists because of. */
const GATES = [
  { id: "C2", from: "W1 capitals/numbers/symbols", script: "audit-echoed-lines.mjs", perWeek: true,
    asks: "villain line vs the verdict beside it" },
  { id: "C3", from: "W2-11 'not sure' twice in a boss question", script: "audit-framing-echoes.mjs", perWeek: true,
    asks: "a stock phrase setting up a question AND closing it" },
  { id: "C4", from: "owner rule, no em-dashes", script: "audit-no-em-dashes.mjs", perWeek: false,
    asks: "an em-dash in copy a child reads" },
  { id: "P1", from: "W2-3 / the Prove-it repeat", script: "audit-screen-echoes.mjs", perWeek: true,
    asks: "a stock phrase PRINTED and SPOKEN on one screen" },
  { id: "A2", from: "#539, nineteen weeks on a robot voice", script: "elevenlabs-generate-narration.mjs", args: ["--check"], perWeek: false,
    asks: "does every block have a clip" },
  { id: "A5", from: "the man's voice on week 2", script: "audit-manifest-lookup.mjs", perWeek: true,
    asks: "will the APP find every clip" },
  { id: "A3", from: "cut consonants, reported three times", script: "audit-consonant-integrity.mjs", weeksFlag: true, perWeek: true,
    asks: "does every clip keep its last letter" },
  { id: "S1", from: "W2 doubled success sting", script: "audit-double-sound.mjs", perWeek: false,
    asks: "does one handler start the same sound twice" },
  { id: "R1", from: "W2-2 the sliced eye", script: "pad-lesson-icons.mjs", args: ["--check"], perWeek: false,
    asks: "can any icon be sliced by its container" },
  { id: "R4", from: "the white spaces behind Layla", script: "strip-sticker-white-pockets.mjs", args: ["--check"], perWeek: false,
    asks: "an unkeyed white pocket in a sticker" },
];

const BROWSER = [
  ["L2", "audit-stage-overflow.mjs N", "W2-4, the glow that scrolled every screen"],
  ["L3", "audit-card-fill.mjs N", "a card leaving a band of empty stage"],
  ["L4", "audit-frame-fit.mjs N", "anything past the fold or clipped"],
  ["5b", "audit-boss-sprite-clip.mjs N", "W2 raccoon's head on the result screens"],
  ["7b", "shoot-week.mjs N", "EVERY frame, shot and LOOKED AT - see below"],
];

let failed = 0;
const rows = [];

for (const g of GATES) {
  const args = [`scripts/${g.script}`];
  if (g.args) args.push(...g.args);
  if (g.perWeek) {
    if (g.weeksFlag) args.push(`--weeks=${WEEKS.join(",")}`);
    else args.push(...WEEKS.map(String));
  }
  const r = spawnSync("node", args, { encoding: "utf8", maxBuffer: 1 << 28 });
  const ok = r.status === 0;
  if (!ok) failed++;
  /* The last non-empty line is each script's verdict. */
  const out = (r.stdout || "").trimEnd().split("\n").filter((l) => l.trim());
  rows.push({ id: g.id, ok, asks: g.asks, verdict: (out[out.length - 1] || "(no output)").trim().slice(0, 78) });
}

console.log(`\nPRE-TEST CHECKLIST - week(s) ${WEEKS.join(", ")}\n`);
for (const r of rows) {
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.id.padEnd(4)} ${r.asks}`);
  console.log(`              ${r.verdict}`);
}

console.log("\n  Still to run by hand (needs a built server, minutes each):");
for (const [id, cmd, why] of BROWSER) {
  console.log(`    ${id.padEnd(4)} node scripts/${cmd.replace("N", WEEKS.join(" "))}`);
  console.log(`         ${why}`);
}

/* These two read the source and report CANDIDATES, not faults, so they cannot
 * pass or fail: a pinned hint is correct when play is held, and a pinned
 * result is correct when the board is hidden. They run here anyway, because
 * what they replace is remembering to look through all 82 engines by hand. */
const READS = [
  ["D8", "audit-result-overlay.mjs", "a result overlay inheriting a game's height (W1 D8)"],
  ["W2-6", "audit-pinned-overlays.mjs", "a hint pinned over live gameplay (W2-6)"],
];
console.log("\n  Candidates to read, from the source:");
for (const [id, script, why] of READS) {
  const r = spawnSync("node", [`scripts/${script}`], { encoding: "utf8", maxBuffer: 1 << 28 });
  const out = (r.stdout || "").trimEnd().split("\n").filter((l) => l.trim());
  const verdict = (out.find((l) => /to look at\.?$/.test(l.trim())) || out[out.length - 1] || "(no output)").trim();
  console.log(`    ${id.padEnd(5)} ${why}`);
  console.log(`          ${verdict.slice(0, 76)}`);
  console.log(`          node scripts/${script}`);
}

console.log("\n  And by eye, because no script does these yet:");
console.log("    - a grid's last row (W2-1): five items in three columns leaves a hole");
console.log("    - can the child READ what they are deciding about (W2-9)");
console.log("    - is the same number on screen twice (W2-8)");

/* Printed last and loudest, because everything above can pass while a screen
 * is plainly broken. Weeks 3-5 did exactly that: fourteen checks green, and
 * week 4's Hall of Mirrors shipped with its card cut off. */
console.log("\n  ** STAGE 7b IS NOT OPTIONAL **");
console.log("     A green run above means the known faults are absent. It does NOT mean");
console.log("     the week looks right - no check here asks that, because the question");
console.log("     has no assertion, only an eye.");
console.log(`     node scripts/shoot-week.mjs ${WEEKS.join(" ")}   then open all ${WEEKS.length * 30} frames and look.`);
console.log("     EVERY screen, not just the ones you changed: the Hall of Mirrors was");
console.log("     broken before the sweep began, which is how a 'changed screens only'");
console.log("     rule let it reach production.");

console.log(`\n${rows.length} gate(s) run, ${failed} failing.\n`);
process.exit(failed ? 1 : 0);

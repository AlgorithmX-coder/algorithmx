/**
 * Every clip a week can play, and whose voice is on it.
 *
 * The course migrates one narrator at a time, so a half-migrated week is the
 * real risk: the manifest is keyed on (speaker, text) with no week in it, and
 * a line recorded from a shared table or a flat pass lands on the DEFAULT
 * voice even inside a week that has its own narrator. That is silent in every
 * check except listening - the clip exists, the manifest is valid, the lookup
 * succeeds, and a different woman answers on one screen.
 *
 *   node scripts/audit-week-voice.mjs 1
 *   node scripts/audit-week-voice.mjs 1 --expect "Emma (Kids Educator)"
 *
 * Reachability is taken from the week's own content file: a manifest entry
 * belongs to the week when every one of its lines appears verbatim there.
 * That covers narration, coach lines, verdict reasons and the one-take
 * verdicts that wrap them. Lines that live in a COMPONENT and are shared
 * across weeks cannot be attributed this way, so they are listed separately
 * and have to be judged by hand.
 *
 * Exits non-zero when a reachable clip is not in the expected voice.
 */
import { readFile } from "node:fs/promises";

const week = process.argv[2];
if (!week || !/^\d+$/.test(week)) {
  console.error("usage: node scripts/audit-week-voice.mjs <week number> [--expect \"<voice>\"]");
  process.exit(2);
}
const expectIdx = process.argv.indexOf("--expect");
const expected = expectIdx > 0 ? process.argv[expectIdx + 1] : null;

const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const content = await readFile(`app/lesson/weekContent/week${week}.ts`, "utf8");

// Resolve exactly as findBlockEntry in InfoNarration.tsx does: the FIRST entry
// matching (speaker, text) wins. A line used by several weeks is written to the
// manifest once per week, so the later rows are shadowed and never play. Taking
// them at face value reports a voice the child can never hear.
const resolved = new Map();
for (const e of manifest.entries) {
  const k = `${e.speaker}\u0000${e.text}`;
  if (!resolved.has(k)) resolved.set(k, e);
}

// A one-take verdict is the shared lead plus a reason from the week file, so
// the lead itself is never in the content. Drop it before testing, or every
// verdict the child actually hears is treated as unattributable - which is
// exactly where the wrong-voice clips were hiding.
const LEADS = new Set(["That's right!", "Not quite."]);

const reachable = [];
for (const e of resolved.values()) {
  let lines = e.lines && e.lines.length ? e.lines : [e.text];
  if (lines.length > 1 && LEADS.has(lines[0].trim())) lines = lines.slice(1);
  if (!lines.length) continue;
  if (!lines.every((l) => l && content.includes(l.trim()))) continue;
  reachable.push(e);
}

const byVoice = new Map();
for (const e of reachable) byVoice.set(e.voice, (byVoice.get(e.voice) || 0) + 1);

console.log(`week ${week}: ${reachable.length} clips reachable from the week file\n`);
for (const [voice, n] of [...byVoice].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${voice}`);
}

if (!expected) process.exit(0);

const wrong = reachable.filter((e) => e.voice !== expected);
console.log(`\nexpected: ${expected}`);
if (!wrong.length) {
  console.log("every reachable clip is in that voice.");
  process.exit(0);
}

console.log(`\n${wrong.length} clip(s) in another voice:\n`);
for (const e of wrong.slice(0, 40)) {
  console.log(`  [${e.voice}] "${(e.text || "").slice(0, 90)}"`);
}
if (wrong.length > 40) console.log(`  ... and ${wrong.length - 40} more`);
process.exit(1);

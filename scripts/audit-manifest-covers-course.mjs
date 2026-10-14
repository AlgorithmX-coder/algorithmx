/**
 * Every week still has its voice. Runs in CI; fails the build if not.
 *
 * This exists because of a specific regression. Recording one week with
 * --week=N rebuilt the manifest from that week's blocks alone and dropped the
 * other 4,916 entries. Nineteen weeks then found no clip for any line and fell
 * back to InfoNarration's SpeechSynthesis path - a robot voice - and it
 * shipped, because every check that ran was about the week being worked on:
 * the deploy was green, the manifest was valid JSON with no dangling
 * reference, and week 2 was perfect.
 *
 * The missing check was never "is my change correct". It was "is everything I
 * did NOT touch still correct". So that is what this asserts, mechanically, on
 * every pull request:
 *
 *   1. every week has clips in the manifest at all
 *   2. no week lost a large share of the clips it had on main
 *   3. no week is split between two narrators by accident
 *
 * Rule 2 is the one that matters most: a wholesale drop is invisible to any
 * check that only inspects what is present.
 *
 *   node scripts/audit-manifest-covers-course.mjs
 *   node scripts/audit-manifest-covers-course.mjs --base=origin/main
 */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const BASE = (process.argv.find((a) => a.startsWith("--base=")) || "").split("=")[1];
const WEEKS = 20;
const LEADS = new Set(["That's right!", "Not quite."]);

function resolveFirst(manifest) {
  const r = new Map();
  for (const e of manifest.entries) {
    const k = `${e.speaker}\u0000${e.text}`;
    if (!r.has(k)) r.set(k, e);
  }
  return r;
}

async function coverage(manifest, sources) {
  const resolved = resolveFirst(manifest);
  const out = {};
  for (let w = 1; w <= WEEKS; w++) {
    const src = sources[w];
    const voices = {};
    let n = 0;
    for (const e of resolved.values()) {
      let lines = e.lines && e.lines.length ? e.lines : [e.text];
      if (lines.length > 1 && LEADS.has(lines[0].trim())) lines = lines.slice(1);
      if (!lines.length || !lines.every((l) => l && src.includes(l.trim()))) continue;
      n++;
      voices[e.voice] = (voices[e.voice] || 0) + 1;
    }
    out[w] = { clips: n, voices };
  }
  return out;
}

const sources = {};
for (let w = 1; w <= WEEKS; w++) sources[w] = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");

/* A migrated week must be ENTIRELY the new narrator.
 *
 * The course is moving to one voice a few weeks at a time, and "this week is
 * done" has to mean something a machine can check. A week is done when the
 * generator lists it in NARRATOR_BY_WEEK; from that moment every clip it can
 * reach must be the new voice, or a line was edited without being re-recorded,
 * or a clip was inherited from the old voice and nobody heard it.
 *
 * When the last week lands, the table goes away and the new narrator becomes
 * the default - and then this reads the default and holds the whole course to
 * it, with nothing left pointing at the old voice.
 */
const generator = await readFile("scripts/elevenlabs-generate-narration.mjs", "utf8");
const expectedVoice =
  (generator.match(/const KIDS_EDUCATOR = \{[^}]*name:\s*"([^"]+)"/) || [])[1] || null;
const migrated = new Set(
  [...generator.matchAll(/"week(\d+)\.ts":\s*KIDS_EDUCATOR/g)].map((m) => Number(m[1])),
);
// no table left means the narrator is the default: every week is migrated
const tableGone = !/const NARRATOR_BY_WEEK/.test(generator);
if (tableGone) for (let w = 1; w <= WEEKS; w++) migrated.add(w);

const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const now = await coverage(manifest, sources);

let before = null;
if (BASE) {
  try {
    const raw = execFileSync("git", ["show", `${BASE}:public/audio/voice/manifest.json`], {
      encoding: "utf8", maxBuffer: 256 * 1024 * 1024,
    });
    before = await coverage(JSON.parse(raw), sources);
  } catch {
    console.log(`(no manifest at ${BASE}; comparing nothing)`);
  }
}

const problems = [];
console.log(`manifest: ${manifest.entries.length} entries\n`);
console.log("  week   clips   voices");
for (let w = 1; w <= WEEKS; w++) {
  const c = now[w];
  const names = Object.keys(c.voices);
  const label = names.map((v) => `${v} ${c.voices[v]}`).join(", ") || "NONE";
  let note = "";

  // No week is anywhere near this small - the smallest real week carries about
  // 180 clips. A handful means the week's own entries are gone and only a few
  // shared lines are matching, which is what the broken manifest looked like:
  // weeks sitting at 1 to 3 clips rather than 0, slipping past an is-it-empty
  // test. This does not depend on having a base to compare against.
  const FLOOR = 20;
  if (c.clips < FLOOR) {
    problems.push(`week ${w} has only ${c.clips} clip(s) in the manifest`);
    note = "   <-- SILENT";
  } else if (before && before[w].clips > 0) {
    const lost = before[w].clips - c.clips;
    if (lost > Math.max(5, before[w].clips * 0.2)) {
      problems.push(`week ${w} lost ${lost} of ${before[w].clips} clips against ${BASE}`);
      note = `   <-- LOST ${lost}`;
    }
  }
  // a week carrying two narrators is either mid-migration or a leak; a couple
  // of shared lines are expected, a real split is not
  if (names.length > 1) {
    const minor = Math.min(...names.map((v) => c.voices[v]));
    if (minor > 3) {
      problems.push(`week ${w} is split between ${names.join(" and ")}`);
      note += "   <-- SPLIT";
    }
  }

  // a week the generator calls migrated must be wholly the new narrator
  if (expectedVoice && migrated.has(w) && c.clips > 0) {
    const wrong = names.filter((v) => v !== expectedVoice);
    if (wrong.length) {
      const n = wrong.reduce((a, v) => a + c.voices[v], 0);
      problems.push(`week ${w} is migrated but ${n} clip(s) are ${wrong.join("/")}, not ${expectedVoice}`);
      note += "   <-- NOT MIGRATED";
    }
  }
  console.log(`  ${String(w).padStart(4)}   ${String(c.clips).padStart(5)}   ${label}${note}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nevery week has its audio.");

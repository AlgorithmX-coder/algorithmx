/**
 * Phrases the child hears over and over inside one week.
 *
 * Reported from prod on week 4: "there are multiple words that are repeated...
 * here is what you do, it said it twice". It is said six times in that week -
 * once on every game screen - and it is not alone. These are scaffolds from
 * the Learn-Loop template: each line reads fine on its own, and nobody notices
 * until they sit through a whole week and hear the same formula open every
 * screen.
 *
 * So: any opening phrase of four or more words that starts more than two
 * spoken lines in the same week.
 *
 *   node scripts/audit-stock-phrases.mjs
 *   node scripts/audit-stock-phrases.mjs 4
 */
import { readFile } from "node:fs/promises";

/* Every week passed, not just the first: `... 3 4 5` used to check week 3 and
 * report a clean run, saying nothing about the two it dropped. Same fault
 * found in audit-frame-fit during the weeks 3-5 sweep. */
const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number).filter((n) => Number.isFinite(n)) : Array.from({ length: 20 }, (_, i) => i + 1);
const MIN_WORDS = 4;
const FLAG_AT = 3;   // three or more uses in one week is a formula, not an echo

const norm = (s) =>
  s.replace(/\[[a-z ]*\]/gi, "").toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();

const perWeek = {};
const courseTotals = new Map();

for (const w of WEEKS) {
  const src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  const lines = [];
  // the array ends at a ] on its OWN line - a non-greedy \] stops at the one
  // inside a delivery tag like "[excited]" and swallows the whole array
  for (const m of src.matchAll(/\blines\s*:\s*\[([\s\S]*?)\n\s*\]/g)) {
    for (const s of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)) lines.push(s[1].replace(/\\"/g, '"'));
  }
  for (const m of src.matchAll(/\b(readAloud|consequence|explanation|why|praise|caption)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    lines.push(m[2].replace(/\\"/g, '"'));
  }

  const counts = new Map();
  for (const raw of lines) {
    const t = norm(raw);
    const words = t.split(" ").filter(Boolean);
    if (words.length < MIN_WORDS + 1) continue;
    // the opening 4, 5 and 6 word phrases
    for (const n of [4, 5, 6]) {
      if (words.length <= n) continue;
      const phrase = words.slice(0, n).join(" ");
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
      courseTotals.set(phrase, (courseTotals.get(phrase) || 0) + 1);
    }
  }

  // keep the longest phrase for each repeated family, so "here is what you"
  // and "here is what you do" are not both reported
  const hits = [...counts.entries()].filter(([, n]) => n >= FLAG_AT).sort((a, b) => b[1] - a[1]);
  const kept = [];
  for (const [p, n] of hits) {
    if (kept.some((k) => k.p.startsWith(p) && k.n === n)) continue;
    kept.push({ p, n });
  }
  if (kept.length) perWeek[w] = kept;
}

let worst = 0;
console.log("openers used three or more times in the same week\n");
for (const w of WEEKS) {
  const hits = perWeek[w];
  if (!hits) { console.log(`  week ${String(w).padStart(2)}  -`); continue; }
  worst += hits.length;
  console.log(`  week ${String(w).padStart(2)}  ${hits.map((h) => `"${h.p}" x${h.n}`).join("   ")}`);
}

console.log(`\nacross the whole course:`);
for (const [p, n] of [...courseTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  if (n < 10) break;
  console.log(`  ${String(n).padStart(4)}  "${p}"`);
}
console.log(`\n${worst} repeated opener(s) across the weeks checked.`);

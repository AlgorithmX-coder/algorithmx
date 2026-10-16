/**
 * Two things on screen at once must not say the same thing.
 *
 * Owner, 2026-10-16, on the Mix It Up question: "In the quiz it says mix a
 * capital twice." It did. The Raccoon's reaction said "Capitals, numbers AND
 * symbols all at once poked my decoder", and the verdict printed directly
 * beneath it said "Mix a capital, a number AND a symbol all the way through".
 * Both are on screen together, and a child hears the same list twice.
 *
 * That is easy to write and hard to see, because the two lines live in
 * different fields a long way apart in the file. This finds them: for every
 * boss question, it compares the villain's line with the verdict shown beside
 * it and reports any run of words they share.
 *
 * Stop words are ignored, so "one of the" is not an echo; what counts is a
 * run of CONTENT words, which is what a listener notices.
 *
 *   node scripts/audit-echoed-lines.mjs 2
 *   node scripts/audit-echoed-lines.mjs            all twenty weeks
 */
import { readFile } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
/* Three content words in common is a phrase; two is a coincidence. */
const RUN = 3;
/* How close two lines must sit in the file to belong to the same question.
 * Measured on week 1: the real echo was 300 characters apart, the false
 * positive 3,900. */
const NEAR = 1200;

const STOP = new Set(("a an and the is it its of to in on at for with that this these those them they " +
  "you your he she his her him i we us our as so but or if then than when what which who how why " +
  "do does did done be been being have has had was were are am will would can could not no yes " +
  "one two all any some more most just only even still right now here there up down out off over").split(" "));

const words = (t) => String(t || "")
  .toLowerCase()
  .replace(/\[[a-z ]*\]/gi, " ")
  .replace(/[^a-z0-9' ]/g, " ")
  .split(/\s+/)
  .filter((w) => w && !STOP.has(w));

/** The longest run of content words the two lines share, if it reaches RUN. */
function sharedRun(a, b) {
  const A = words(a), B = words(b);
  let best = [];
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      let k = 0;
      while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++;
      if (k > best.length) best = A.slice(i, i + k);
    }
  }
  return best.length >= RUN ? best.join(" ") : null;
}

let found = 0, checked = 0;
for (const w of WEEKS) {
  let src;
  try { src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8"); } catch { continue; }

  /* Each boss question is a block ending at the next "ask:" or the quiz end.
   * Within a block, the villain's reaction and the verdict/teach text are the
   * two things a child sees together. */
  const blocks = src.split(/\n\s*\{\s*\n\s*id:/).slice(1);
  for (const b of blocks) {
    /* Keep each line's position, so two can be required to sit NEAR each
     * other. Splitting on "{ id:" over-groups: week 1's Mix It Up villain
     * line and a quiz-bank explanation a hundred lines further down came out
     * as an echo although they are different questions that never appear
     * together. */
    const villain = [...b.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ t: m[1], at: m.index }));
    const teach = [...b.matchAll(/(?:explanation|rightWhy|why):\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ t: m[1], at: m.index }));
    if (!villain.length || !teach.length) continue;
    for (const v of villain) {
      for (const t of teach) {
        if (Math.abs(v.at - t.at) > NEAR) continue;   // same question, not just same region
        checked++;
        const run = sharedRun(v.t, t.t);
        if (!run) continue;
        found++;
        console.log(`\nweek ${w}: "${run}" is said twice, on screen together`);
        console.log(`   villain : ${v.t.slice(0, 92)}`);
        console.log(`   verdict : ${t.t.slice(0, 92)}`);
      }
    }
  }
}

console.log(`\n${checked} villain/verdict pair(s) compared, ${found} echo(es).`);
process.exit(found ? 1 : 0);

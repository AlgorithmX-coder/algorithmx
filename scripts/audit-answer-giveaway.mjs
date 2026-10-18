/**
 * A multiple choice must not give itself away.
 *
 * Owner, 2026-10-18: "we need to disguise the correct answer better, every
 * single optional choice or multiple choice question... whether it's in the
 * activities during the week or whether it's in the final exam. So push this
 * across every single week."
 *
 * A child who cannot read the content must not be able to pick the right
 * answer on SHAPE alone. Three ways a shape leaks, all found in the product:
 *
 *   LONGEST   week 3's meet-up trap: "No thanks. I never meet online friends,
 *             and I'm telling my grown-up about this." at 79 characters
 *             against 34 and 30.
 *   EXPLAINS  week 4's copycat card: "gift@petpa1s.win, a 1 where the l
 *             should be" - the only option that says why it is the answer.
 *   ODD ONE   the only option phrased unlike the rest (the only full
 *             sentence, the only one with a comma, the only one that is not a
 *             fragment).
 *
 * Reported three times by eye before anything measured it: once in Cyber Pro
 * (#525), once in week 4, once in week 3. Hence rule 13 and this gate.
 *
 *   node scripts/audit-answer-giveaway.mjs 3
 *   node scripts/audit-answer-giveaway.mjs           all twenty weeks
 */
import { readFile } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);

/* How much longer the right answer may be than the average wrong one before
 * its length alone identifies it. 1.4 is forgiving: week 3's was 2.5x. */
const LONGEST_RATIO = 1.4;

/** Balanced-bracket reader, so a choices array is read whole. */
function balanced(src, from, open, close) {
  let depth = 0, inStr = null;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === "\\") i++; else if (c === inStr) inStr = null; continue; }
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i); if (i < 0) break; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(from, i + 1); }
  }
  return null;
}

let flagged = 0, checked = 0;

for (const w of WEEKS) {
  let src;
  try { src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8"); } catch { continue; }

  const groups = [];

  /* answers: [...] with correctIndex */
  for (const m of src.matchAll(/\banswers\s*:\s*\[/g)) {
    const arr = balanced(src, m.index + m[0].length - 1, "[", "]");
    if (!arr) continue;
    const opts = [...arr.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    const after = src.slice(m.index, m.index + arr.length + 240);
    const ci = Number((/\bcorrectIndex\s*:\s*(\d+)/.exec(after) || [])[1] ?? 0);
    if (opts.length >= 2) groups.push({ kind: "answers", opts, ci, at: m.index });
  }

  /* choices: [ { text, isCorrect } ] */
  for (const m of src.matchAll(/\bchoices\s*:\s*\[/g)) {
    const arr = balanced(src, m.index + m[0].length - 1, "[", "]");
    if (!arr) continue;
    const items = [...arr.matchAll(/\{[^{}]*\}/g)].map((x) => x[0]);
    const opts = items.map((it) => (/\btext\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(it) || [])[1]).filter(Boolean);
    const ci = items.findIndex((it) => /isCorrect\s*:\s*true/.test(it));
    if (opts.length >= 2 && ci >= 0) groups.push({ kind: "choices", opts, ci, at: m.index });
  }

  /* options: [ { text } ] with correctIndex (boss gears) */
  for (const m of src.matchAll(/\boptions\s*:\s*\[/g)) {
    const arr = balanced(src, m.index + m[0].length - 1, "[", "]");
    if (!arr) continue;
    const opts = [...arr.matchAll(/\btext\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    const after = src.slice(m.index, m.index + arr.length + 240);
    const ci = Number((/\bcorrectIndex\s*:\s*(\d+)/.exec(after) || [])[1] ?? -1);
    if (opts.length >= 2 && ci >= 0) groups.push({ kind: "options", opts, ci, at: m.index });
  }

  for (const g of groups) {
    const right = g.opts[g.ci];
    if (!right) continue;
    const wrong = g.opts.filter((_, i) => i !== g.ci);
    if (!wrong.length) continue;
    checked++;
    const why = [];

    const avgWrong = wrong.reduce((a, b) => a + b.length, 0) / wrong.length;
    if (right.length > avgWrong * LONGEST_RATIO && right.length === Math.max(...g.opts.map((o) => o.length))) {
      why.push(`longest by ${(right.length / avgWrong).toFixed(1)}x (${right.length} vs ${Math.round(avgWrong)} avg)`);
    }

    /* The only option that argues its own case. */
    const reasons = /\b(because|so that|, so\b|which means|that means|and that is why|proves)\b/i;
    if (reasons.test(right) && !wrong.some((o) => reasons.test(o))) why.push("the only one that gives its reason");

    /* The only full sentence among fragments, or the only fragment among
     * sentences - either way it is the odd one out by shape. */
    const isSentence = (s) => /[.!?]$/.test(s.trim()) && s.trim().split(/\s+/).length >= 5;
    const rs = isSentence(right);
    if (wrong.every((o) => isSentence(o) !== rs)) why.push(rs ? "the only full sentence" : "the only fragment");

    if (!why.length) continue;
    flagged++;
    const line = src.slice(0, g.at).split("\n").length;
    console.log(`\nweek ${w}, week${w}.ts:${line} (${g.kind})  ${why.join("; ")}`);
    g.opts.forEach((o, i) => console.log(`   ${i === g.ci ? "->" : "  "} ${String(o.length).padStart(3)}  ${o.slice(0, 84)}`));
  }
}

console.log(`\n${checked} question(s) checked, ${flagged} where the shape gives the answer away.`);
if (flagged) console.log(`Rewrite so the right answer is not the longest, not the only one with a reason,\nand not the only one phrased differently. A child who cannot read it must not\nbe able to pick it.`);
process.exit(flagged ? 1 : 0);

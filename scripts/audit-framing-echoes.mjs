/**
 * The same STOCK PHRASE must not be said twice on one boss screen.
 *
 * Owner, 2026-10-17, on week 2's final boss question: "In the last screen, or
 * the last question, of the quiz, it said, if you are not sure twice, again,
 * all of these duplications need to be addressed."
 *
 * It did:
 *
 *   ask   : "...and he's NOT SURE if it's safe to answer. What's the hero move?"
 *   teach : "...When you are NOT SURE, hit pause. Then call your backup..."
 *
 * audit-echoed-lines.mjs could not hear that. It needs THREE shared CONTENT
 * words and strips stop words first, so "not sure" collapses to "sure" - one
 * content word, nowhere near the bar. That threshold was tuned on week 1's
 * real echo ("capitals, numbers and symbols"), and a long repeated list is
 * the only shape it can hear. A child does not get stop words for free.
 *
 * WHY THIS IS NOT JUST "LOWER THE THRESHOLD TO TWO": measured on the real
 * course, a blunt two-word rule flags 40 of the 100 boss questions, and most
 * of those are CORRECT. When week 19's teach line repeats "card number", or
 * week 20's repeats "name your school", it is naming what was at stake, which
 * is the entire job of a teach line. Week 2's own "too nosy" is the signal
 * word the week exists to teach: the ask poses it, the teach answers it.
 *
 * What grates is the FRAMING repeated, not the subject. So this checks a
 * curated list of stock phrases - the words used to SET UP a question rather
 * than to answer it - and leaves every subject noun free to repeat.
 *
 * Add to FRAMING only a phrase that could introduce any question in any week.
 * If it names something specific to its week, it belongs in the teach line
 * and does not belong here.
 *
 *   node scripts/audit-framing-echoes.mjs
 *   node scripts/audit-framing-echoes.mjs 2
 */
import { readFile } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);

/** Stock set-up phrases. Generic by construction: none names a week's topic. */
const FRAMING = [
  "not sure",
  "isn't sure",
  "is not sure",
  "can't tell",
  "cannot tell",
  "after all",
  "extra care",
  "speak up",
  "keep it secret",
  "what's the hero move",
  "what should",
  "what do you do",
  "just guessing",
  "never seen before",
  "straight away",
  "right away",
  "find out",
  "make sure",
  "one of these",
  "which one",
];

const norm = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/\[[a-z ]*\]/gi, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

let found = 0;
let checked = 0;

for (const w of WEEKS) {
  let src;
  try {
    src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  } catch {
    continue;
  }

  /* One block per boss question: everything from a phaseId to the next. */
  for (const block of src.split(/phaseId:/).slice(1)) {
    const ask = block.match(/ask:\s*\{[^}]*?text:\s*"((?:[^"\\]|\\.)*)"/s);
    const teach = block.match(/teachOnWrong:\s*\{[\s\S]*?explanation:\s*"((?:[^"\\]|\\.)*)"/);
    if (!ask || !teach) continue;
    checked++;

    const a = norm(ask[1]);
    const t = norm(teach[1]);
    const hits = FRAMING.filter((p) => a.includes(p) && t.includes(p));
    if (!hits.length) continue;

    found++;
    console.log(`\nweek ${w}: "${hits.join('", "')}" set up the question AND closed it`);
    console.log(`   ask   : ${ask[1].slice(0, 94)}`);
    console.log(`   teach : ${teach[1].slice(0, 94)}`);
  }
}

console.log(`\n${checked} boss question(s) checked, ${found} repeating a stock phrase.`);
process.exit(found ? 1 : 0);

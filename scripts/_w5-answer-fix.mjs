/* Week 5: rewrite the boss answer sets the shape audit flagged.
 *
 * Rule 13 (owner, 2026-10-18): a child who cannot READ the options must not be
 * able to pick the right one. The six below were all "longest by far", and one
 * also argued its own case ("More people joining in, so don't").
 *
 * These sit in `bossQuestions`, the LEGACY pool. Week 5 ships `bossQuiz`,
 * which DynamicLesson prefers over every other boss, so a child never sees
 * these - verified in app/lesson/[week]/DynamicLesson.tsx, not assumed from
 * the comment in the data file. They are fixed anyway so the gate can guard
 * the week and so the data is not a trap if that branch is ever reverted.
 *
 *   node scripts/_w5-answer-fix.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "app/lesson/weekContent/week5.ts";
let src = readFileSync(PATH, "utf8");

/** Each pair is [exact current answers array, replacement]. */
const SUBS = [
  [
    `["Theirs, never yours", "Yours for posting", "Both of yours", "Nobody's"]`,
    `["Theirs, never yours", "Yours, for posting at all", "Both of yours, equally", "Nobody's, it just happens"]`,
  ],
  [
    `["So a grown-up can see it and help properly", "To read it again", "To forward it later", "To reply when you're calmer"]`,
    `["A grown-up can see it", "To read it again later", "To forward it to friends", "To reply when you're calmer"]`,
  ],
  [
    `["No, telling is how the hurting stops", "Yes, always", "Only if you could fix it yourself", "Only if it's about you"]`,
    `["No, telling stops it", "Yes, always and everywhere", "Only if you could fix it yourself", "Only if it is about you"]`,
  ],
  [
    `["More people joining in, so don't", "Nothing at all", "One really mean kid", "A faster phone"]`,
    `["More people joining in", "Nothing at all, it just grows", "One really mean kid, alone", "A faster phone or tablet"]`,
  ],
];

let done = 0;
for (const [from, to] of SUBS) {
  if (!src.includes(from)) {
    console.log(`NOT FOUND: ${from.slice(0, 55)}...`);
    continue;
  }
  src = src.replace(from, to);
  done++;
}
writeFileSync(PATH, src);
console.log(`replaced ${done} of ${SUBS.length}`);

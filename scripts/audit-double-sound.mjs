/**
 * The same sound must not be started twice on one handler.
 *
 * Owner, 2026-10-17, on the Prove-it verdict screen: "I hear a very weird
 * sound. Before Emma starts speaking, what is that and how did it turn up?"
 *
 * QuickCheck called `audio.correct()` and then `correctAnswerBurst()` on the
 * very next line - and the burst plays correct.mp3 itself. Two copies of a
 * one-second sample starting milliseconds apart comb-filter against each
 * other: the result is a metallic ring rather than a chime, and it sat right
 * in front of a quiet spoken verdict, which is where it is most audible.
 *
 * Nothing caught it because both calls are individually correct. It is only
 * their PROXIMITY that is wrong, and no type checker or test has an opinion
 * about two valid calls being two lines apart.
 *
 * So this reads the source and flags a helper that plays a sound sitting
 * within a few lines of a direct call to the same sound. Proximity is the
 * signal, because the two have to be on one handler to overlap - calls in
 * different handlers fire on different events and are fine.
 *
 *   node scripts/audit-double-sound.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

/** Helpers that play a sound of their own, and which sound that is. */
const HELPERS = [
  { call: "correctAnswerBurst", plays: "correct" },
  { call: "badgeEarnedCelebration", plays: "badge-earned" },
  { call: "bossDefeatedExplosion", plays: "boss-defeated" },
];

/* Within this many lines, two calls are almost certainly the same handler. */
const NEAR = 4;

const DIRS = ["app/components/exercises", "app/components/lesson", "app/components/game"];

let found = 0;
let checked = 0;

for (const dir of DIRS) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }
  for (const f of files.filter((x) => x.endsWith(".tsx"))) {
    const path = join(dir, f);
    const lines = (await readFile(path, "utf8")).split(/\r?\n/);
    checked++;

    for (const h of HELPERS) {
      const helperLines = [];
      const directLines = [];
      lines.forEach((ln, i) => {
        /* Ignore comments - this file and the fixed engines describe the bug
         * in prose, and matching that would report itself. */
        const code = ln.replace(/^\s*(\/\/|\*|\/\*).*$/, "");
        if (code.includes(h.call + "(")) helperLines.push(i + 1);
        const direct = new RegExp(`audio\\.${h.plays.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}\\(\\)|playSound\\(\\s*["']${h.plays}["']`);
        if (direct.test(code)) directLines.push(i + 1);
      });

      for (const a of helperLines) {
        for (const b of directLines) {
          if (Math.abs(a - b) > NEAR) continue;
          /* An `else` branch is MUTUALLY EXCLUSIVE with the helper above it,
           * so only one ever runs. That is the correct shape when the helper
           * is gated on motion intensity, and flagging it would report the
           * FIX as the bug - which this audit did on its first run, and then
           * again when the else was a `} else {` on its own line above the
           * call. So look back a couple of lines, not just at this one. */
          let inElse = false;
          for (let k = b - 1; k >= Math.max(0, b - 3); k--) {
            if (/^\s*(\}\s*)?else\b/.test(lines[k])) { inElse = true; break; }
            /* Stop at the opening of the gated block - anything above that
             * belongs to the if-branch, not an else. */
            if (/^\s*if\s*\(/.test(lines[k])) break;
          }
          if (inElse) continue;
          found++;
          console.log(`\n${path}`);
          console.log(`  line ${b}: plays "${h.plays}" directly`);
          console.log(`  line ${a}: ${h.call}() plays "${h.plays}" as well`);
          console.log(`  -> the same sample starts twice, milliseconds apart`);
        }
      }
    }
  }
}

console.log(`\n${checked} component(s) checked, ${found} double-play(s).`);
if (found) {
  console.log("\nKeep ONE. If the helper is gated (reduced motion), use an else so");
  console.log("the sound still plays in both modes rather than deleting the direct call.");
}
process.exit(found ? 1 : 0);

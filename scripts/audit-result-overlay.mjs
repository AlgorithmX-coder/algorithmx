/**
 * A finished exercise must not keep a whole game's worth of height.
 *
 * Owner, 2026-10-16, on the Memory Match result: "look at the bottom of that
 * card, it's not being filled in. check this for all of the pages in all of
 * the weeks."
 *
 * The pattern that causes it: the engine's root fills the stage so the BOARD
 * has room, and the result is then drawn as an overlay pinned across that
 * root (`position: absolute`, `inset: 0`) with its content centred. While the
 * board is the content that is correct - the board fills the card. It stops
 * being correct the moment the game ends: the result is a title, two lines
 * and two buttons, and it inherits the height of a board that is no longer
 * the point. The card stays as tall as a game and holds a paragraph, with a
 * dead band underneath.
 *
 * WHY THIS IS STATIC AND NOT A BROWSER RUN. audit-result-card-fill.mjs plays
 * each exercise and measures the finished card, which is the better evidence
 * - but it can only measure what it can finish, and it cannot finish an
 * engine needing correct answers, matched pairs or a drag. On week 1 it
 * completed none of five. A check that silently skips most of its subjects is
 * worse than one that reads the source, because it reports a pass either way.
 *
 * So this reads the shape instead: a finish/result overlay pinned with
 * inset: 0, inside an engine whose root fills the stage. It reports
 * CANDIDATES - the fix MemoryMatch got was to hide the board and let the
 * result sit in normal flow, and an engine that already does that is fine.
 *
 *   node scripts/audit-result-overlay.mjs
 *   node scripts/audit-result-overlay.mjs MemoryMatch
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DIR = "app/components/exercises";

/* The names these overlays go by. */
const RESULT = /finish|complete|result|victory|wrapUp|summary|PixarFinish/i;

const files = (await readdir(DIR)).filter((f) => f.endsWith(".tsx"));
let flagged = 0;
let checked = 0;

for (const f of files) {
  if (ONLY.length && !ONLY.some((o) => f.toLowerCase().startsWith(o.toLowerCase()))) continue;
  const src = await readFile(join(DIR, f), "utf8");
  checked++;

  /* Strip comments: several engines describe this very bug in prose, and
   * matching that would report the explanation as the fault. */
  const code = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

  /* Does a result-ish block pin itself across the whole root? */
  const lines = code.split(/\r?\n/);
  let hit = null;
  lines.forEach((ln, i) => {
    if (!/inset:\s*0/.test(ln)) return;
    const block = lines.slice(Math.max(0, i - 14), i + 6).join(" ");
    if (!RESULT.test(block)) return;
    if (!/position:\s*"absolute"/.test(block)) return;
    hit = i + 1;
  });
  if (hit === null) continue;

  /* The MemoryMatch fix: the board is hidden and the root stops filling the
   * stage once the game is over. An engine doing that is already correct. */
  const hidesBoard = /display:\s*finished\s*\?\s*"none"/.test(code)
    || /height:\s*finished\s*\?\s*"auto"/.test(code)
    || /\{!finished\s*&&/.test(code);

  if (hidesBoard) continue;

  flagged++;
  console.log(`\n${f}:${hit}`);
  console.log("   a result overlay pinned across the root with inset: 0");
  console.log("   and no sign the board is hidden or the root released when it ends");
}

console.log(`\n${checked} engine(s) scanned, ${flagged} to look at.`);
if (flagged) {
  console.log("\nNot a fault by itself. It is a fault when the root fills the STAGE, so the");
  console.log("result inherits a game's height. Play one to the end and look under it.");
}

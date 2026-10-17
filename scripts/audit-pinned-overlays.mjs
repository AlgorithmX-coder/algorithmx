/**
 * A hint, banner or overlay must never cover live gameplay.
 *
 * Owner, 2026-10-17, on the Grab-Bag Blaster: "The bigger hint is blocking
 * the screen."
 *
 * SpamBlaster pinned its hint panel `position: absolute; bottom: 12; zIndex:
 * 10`, which is exactly where the Hero Vault sat. Worse than the overlap was
 * the timing: the hint arrives BECAUSE the child is struggling, lands on the
 * thing they are being asked to watch, and the grabs keep flying while it is
 * up. The help cost them the round.
 *
 * That was fixed in SpamBlaster by holding the game while the hint shows. But
 * SpamBlaster is week 2 only, and the same shape - a panel pinned to an edge
 * with a z-index, rendered while play continues - is a bug waiting for the
 * right board in any engine. This finds that shape.
 *
 * It reports CANDIDATES, not faults. A pinned overlay is fine when the board
 * makes room for it, when play is held, or when it only appears once the
 * exercise has finished. Each one needs a look; what it buys is knowing
 * WHICH to look at instead of all of them.
 *
 *   node scripts/audit-pinned-overlays.mjs                  every engine
 *   node scripts/audit-pinned-overlays.mjs SpamBlaster      one engine
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DIR = "app/components/exercises";

/* The words an overlay of this kind is usually called. A result or finish
 * overlay is deliberately NOT here: it appears after play has ended, which is
 * the one time covering the board is correct. */
const KIND = /hint|nudge|banner|coach|tip|caption|prompt|reminder/i;

const files = (await readdir(DIR)).filter((f) => f.endsWith(".tsx"));
let candidates = 0;
let checked = 0;

for (const f of files) {
  if (ONLY.length && !ONLY.some((o) => f.toLowerCase().startsWith(o.toLowerCase()))) continue;
  const src = await readFile(join(DIR, f), "utf8");
  checked++;
  const lines = src.split(/\r?\n/);

  lines.forEach((ln, i) => {
    if (!/position:\s*"absolute"/.test(ln)) return;
    /* The surrounding few lines carry the edge, the z-index and usually the
     * component's name, so judge on the block rather than the one line. */
    const block = lines.slice(Math.max(0, i - 3), i + 9).join(" ");
    const pinned = /(bottom|top):\s*\d/.test(block);
    const layered = /zIndex:\s*(\d+)/.exec(block);
    if (!pinned || !layered || Number(layered[1]) < 2) return;
    if (!KIND.test(block)) return;
    /* Already guarded: the component holds play while it is up. */
    const holdsPlay = /pausedRef|holding|freeze|hintHolding/.test(src);
    candidates++;
    console.log(`\n${f}:${i + 1}`);
    console.log(`   a ${/hint/i.test(block) ? "hint" : "banner"} pinned to an edge at zIndex ${layered[1]}`);
    console.log(`   ${holdsPlay ? "the engine DOES hold play somewhere - check it covers this overlay" : "no pause/hold in this engine - does the board keep moving under it?"}`);
  });
}

console.log(`\n${checked} engine(s) scanned, ${candidates} pinned overlay(s) to look at.`);
if (candidates) {
  console.log("\nNone of these is a fault by itself. Each is fine if the board makes room,");
  console.log("if play is held while it shows, or if it only appears once the exercise ends.");
}

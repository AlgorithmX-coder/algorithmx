/* Capitalise the Raccoon quotes that open in lower case.
 *
 * QuickCheck renders a lie-mode `raccoonLine` inside curly quotes as the
 * child's first read on the card, so a lower-case opening reads as a typo. It
 * is PRINTED only - the string is nowhere in the narration manifest - so this
 * costs no recording.
 *
 * Found at stage 7b, week 1 screen 14, then swept across the course: 12 of 126.
 *
 *   node scripts/_raccoon-line-case-fix.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

let fixed = 0;

for (let w = 1; w <= 20; w++) {
  const p = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(p)) continue;
  let s = await readFile(p, "utf8");
  let touched = false;

  s = s.replace(/raccoonLine:\s*"((?:[^"\\]|\\.)*)"/g, (whole, body) => {
    const lead = /^["'“‘\s]*/.exec(body)[0];
    const rest = body.slice(lead.length);
    const first = rest[0] || "";
    if (!first || first !== first.toLowerCase() || first === first.toUpperCase()) return whole;
    touched = true;
    fixed++;
    const next = `${lead}${first.toUpperCase()}${rest.slice(1)}`;
    console.log(`  w${String(w).padStart(2)}  ${next.slice(0, 76)}`);
    return `raccoonLine: "${next}"`;
  });

  if (touched) await writeFile(p, s);
}

console.log(`\n${fixed} Raccoon quote(s) capitalised.`);

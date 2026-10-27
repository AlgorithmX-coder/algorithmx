/* Does any Raccoon quote open in lower case?
 *
 * Seen at stage 7b on week 1's true-or-false screen: the speech bubble read
 *   "a password made of small letters only is just as strong as a mixed-up one!"
 * while every other bubble in the course opens on a capital. On screen it
 * reads as a typo, and it is the first thing a child sees on that card.
 *
 *   node scripts/_raccoon-line-case.mjs
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

let lower = 0;
let total = 0;

for (let w = 1; w <= 20; w++) {
  const p = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(p)) continue;
  const s = await readFile(p, "utf8");
  for (const m of s.matchAll(/raccoonLine:\s*"((?:[^"\\]|\\.)*)"/g)) {
    total++;
    const t = m[1];
    const first = t.replace(/^["'“‘\s]+/, "")[0] || "";
    if (first && first === first.toLowerCase() && first !== first.toUpperCase()) {
      lower++;
      console.log(`  w${String(w).padStart(2)}  ${t.slice(0, 84)}`);
    }
  }
}

console.log(`\n${total} Raccoon quote(s) checked, ${lower} opening in lower case.`);

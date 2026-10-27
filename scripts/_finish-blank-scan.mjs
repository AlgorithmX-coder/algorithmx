/* Which "finish the rule" prompts put punctuation straight after the blank?
 *
 * Those are the ones that rendered as "it's ____ ." - the full stop 6px clear
 * of the blank, reading as a floating dot. Found at stage 7b on weeks 1 and 2.
 *
 *   node scripts/_finish-blank-scan.mjs
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

let total = 0;
const tight = [];
const spaced = [];

for (let w = 1; w <= 20; w++) {
  const p = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(p)) continue;
  const s = await readFile(p, "utf8");
  for (const m of s.matchAll(/mode:\s*"finish"[\s\S]{0,400}?prompt:\s*"((?:[^"\\]|\\.)*)"/g)) {
    const prompt = m[1];
    if (!prompt.includes("___")) continue;
    total++;
    const after = prompt.split("___")[1] || "";
    (/^[.,!?;:)]/.test(after) ? tight : spaced).push(`w${String(w).padStart(2)}  ${prompt}`);
  }
}

console.log(`finish-mode prompts carrying a blank : ${total}`);
console.log(`  punctuation straight after it      : ${tight.length}  <- the floating dot`);
console.log(`  a word after it                    : ${spaced.length}`);
console.log("\nTIGHT (fixed by this change):");
tight.forEach((r) => console.log("  " + r));
console.log("\nSPACED (unchanged):");
spaced.forEach((r) => console.log("  " + r));

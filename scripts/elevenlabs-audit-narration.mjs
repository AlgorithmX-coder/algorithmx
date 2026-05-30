// Walks week1.ts narration arrays + MissionDebrief screen and counts
// how many lines and characters per speaker need TTS generation.
// Pure read - no API calls.

import { readFile } from "node:fs/promises";

const path = "app/lesson/weekContent/week1.ts";
const src = await readFile(path, "utf8");

// Each `narration: { speaker: "...", lines: [...] }` block. The
// week1.ts file uses double quotes consistently, so a non-greedy
// match over a single narration object is enough.
const blockRe = /narration:\s*\{\s*speaker:\s*"(adam|layla)",\s*lines:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;

let totalLines = 0;
let totalChars = 0;
const byAdam = [];
const byLayla = [];

let m;
while ((m = blockRe.exec(src)) !== null) {
  const speaker = m[1];
  const linesBlock = m[2];
  // pull each "..." string out of the array body
  const stringRe = /"((?:[^"\\]|\\.)*)"/g;
  let s;
  while ((s = stringRe.exec(linesBlock)) !== null) {
    const text = s[1].replace(/\\"/g, '"');
    if (!text.trim()) continue;
    totalLines++;
    totalChars += text.length;
    (speaker === "adam" ? byAdam : byLayla).push(text);
  }
}

console.log(`Week 1 narration audit\n`);
console.log(`Adam:  ${byAdam.length} lines, ${byAdam.reduce((a, b) => a + b.length, 0)} chars`);
console.log(`Layla: ${byLayla.length} lines, ${byLayla.reduce((a, b) => a + b.length, 0)} chars`);
console.log(`TOTAL: ${totalLines} lines, ${totalChars} chars\n`);
// ElevenLabs Creator/Pro pricing approx ~$0.30 per 1000 chars on
// Creator plan, ~$0.165 per 1000 chars on Pro. Use Creator as worst-
// case estimate for the user.
const usdCreator = (totalChars / 1000) * 0.3;
console.log(`Estimated cost (Creator plan): $${usdCreator.toFixed(2)}`);
console.log(`Estimated cost (Pro plan):     $${((totalChars / 1000) * 0.165).toFixed(2)}\n`);

console.log(`--- Adam lines preview ---`);
byAdam.slice(0, 4).forEach((l, i) => console.log(`  ${i + 1}. "${l}"`));
console.log(`\n--- Layla lines preview ---`);
byLayla.slice(0, 4).forEach((l, i) => console.log(`  ${i + 1}. "${l}"`));

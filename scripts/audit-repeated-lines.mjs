/**
 * Does the child hear the same thing twice?
 *
 * Reported from prod on week 4: "Here is what you do" heard twice on one
 * screen. Three ways that happens, and this looks for all of them:
 *
 *   1. the same sentence twice inside ONE clip - she repeats herself mid-breath
 *   2. the same sentence in two clips on the SAME screen - typically the
 *      narration and the coach line both explaining the game
 *   3. two clips that OPEN with the same phrase back to back
 *
 * Case 2 is the easy one to miss, because each clip reads perfectly on its own
 * and only the child hears them in sequence.
 *
 *   node scripts/audit-repeated-lines.mjs        all weeks
 *   node scripts/audit-repeated-lines.mjs 4      one week
 */
import { readFile } from "node:fs/promises";

const only = process.argv[2];
const WEEKS = only ? [Number(only)] : Array.from({ length: 20 }, (_, i) => i + 1);

const norm = (s) =>
  s.replace(/\[[a-z ]*\]/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sentencesOf = (text) =>
  text.split(/(?<=[.!?])\s+/).map((s) => norm(s)).filter((s) => s.split(" ").length >= 3);

let totalScreens = 0;
const findings = [];

for (const w of WEEKS) {
  const src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");

  /* Walk the file screen by screen. A screen starts at a `type:` key and runs
   * to the next one, so every spoken field inside belongs to the same moment
   * and the child hears them one after another. */
  const starts = [...src.matchAll(/^\s{4,6}\{\s*$|^\s*type:\s*"[a-zA-Z]+"/gm)].map((m) => m.index);
  const bounds = [...new Set(starts)].sort((a, b) => a - b);

  for (let i = 0; i < bounds.length; i++) {
    const chunk = src.slice(bounds[i], bounds[i + 1] ?? src.length);
    if (!/\blines:\s*\[|readAloud:|consequence:/.test(chunk)) continue;
    totalScreens++;

    // every spoken block in this screen, each as its own list of sentences
    const blocks = [];
    for (const m of chunk.matchAll(/\b(lines)\s*:\s*\[([\s\S]*?)\]/g)) {
      const lines = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
      if (lines.length) blocks.push({ kind: "lines", text: lines.join(" ") });
    }
    for (const m of chunk.matchAll(/\b(readAloud|consequence|explanation|why)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
      blocks.push({ kind: m[1], text: m[2].replace(/\\"/g, '"') });
    }
    if (!blocks.length) continue;

    // 1. a sentence repeated inside one block
    for (const b of blocks) {
      const seen = new Map();
      for (const s of sentencesOf(b.text)) seen.set(s, (seen.get(s) || 0) + 1);
      for (const [s, n] of seen) {
        if (n > 1) findings.push({ w, kind: "twice in one clip", s, where: b.kind });
      }
    }

    // 2. a sentence shared by two blocks on the same screen
    for (let a = 0; a < blocks.length; a++) {
      for (let c = a + 1; c < blocks.length; c++) {
        const A = new Set(sentencesOf(blocks[a].text));
        for (const s of sentencesOf(blocks[c].text)) {
          if (A.has(s)) findings.push({ w, kind: "same sentence in two clips", s, where: `${blocks[a].kind} + ${blocks[c].kind}` });
        }
      }
    }

    // 3. two blocks that open with the same phrase
    const openers = blocks.map((b) => sentencesOf(b.text)[0]).filter(Boolean);
    for (let a = 0; a < openers.length; a++) {
      for (let c = a + 1; c < openers.length; c++) {
        if (openers[a] === openers[c]) continue; // already caught above
        const wa = openers[a].split(" ").slice(0, 5).join(" ");
        const wc = openers[c].split(" ").slice(0, 5).join(" ");
        if (wa === wc && wa.split(" ").length >= 4) {
          findings.push({ w, kind: "two clips open the same way", s: wa, where: "openers" });
        }
      }
    }
  }
}

const seen = new Set();
const unique = findings.filter((f) => {
  const k = `${f.w}|${f.kind}|${f.s}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

console.log(`screens checked: ${totalScreens}`);
console.log(`repeats found  : ${unique.length}\n`);

const byKind = {};
for (const f of unique) (byKind[f.kind] ??= []).push(f);
for (const kind of Object.keys(byKind)) {
  console.log(`${kind} (${byKind[kind].length})`);
  for (const f of byKind[kind]) console.log(`   week ${String(f.w).padStart(2)}  [${f.where}]  "${f.s.slice(0, 80)}"`);
  console.log();
}
if (unique.length) process.exit(1);
console.log("nothing is said twice.");

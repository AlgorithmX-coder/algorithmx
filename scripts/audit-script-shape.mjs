/**
 * Is every week's script written to the shape week 1 was rewritten into?
 *
 * Week 1's narration was restructured after the owner said it "sounds so
 * rushed... it needs to be like a well-written classroom structure". That was
 * a WRITING change, and the audio pipeline cannot reproduce it: a long
 * compound sentence read at the right pace is still a long compound sentence.
 * So before claiming the other weeks match week 1's standard, the shape of
 * their sentences has to be measured against it.
 *
 * Lines come from the manifest, which holds exactly what was authored and
 * recorded, rather than from a regex over the content files - the arrays there
 * nest and quote in ways that under-count badly.
 *
 *   node scripts/audit-script-shape.mjs
 */
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const LEADS = new Set(["That's right!", "Not quite."]);

const resolved = new Map();
for (const e of manifest.entries) {
  const k = `${e.speaker}\u0000${e.text}`;
  if (!resolved.has(k)) resolved.set(k, e);
}

const sources = {};
for (let w = 1; w <= 20; w++) sources[w] = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");

const perWeek = {};
for (const e of resolved.values()) {
  let lines = e.lines && e.lines.length ? e.lines : [e.text];
  const probe = lines.length > 1 && LEADS.has(lines[0].trim()) ? lines.slice(1) : lines;
  for (let w = 1; w <= 20; w++) {
    if (!probe.every((l) => l && sources[w].includes(l.trim()))) continue;
    (perWeek[w] ??= []).push(...probe.map((l) => l.replace(/\[[a-z ]*\]/gi, "").trim()));
    break;   // attribute to the first week that owns it
  }
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const pct = (a, f) => Math.round((a.filter(f).length / (a.length || 1)) * 100);

const stats = [];
for (let w = 1; w <= 20; w++) {
  const lines = (perWeek[w] || []).filter((l) => l.length > 3);
  if (!lines.length) continue;
  const words = lines.map((l) => l.split(/\s+/).filter(Boolean).length);
  const sentences = lines.map((l) => (l.match(/[.!?]+(?=\s|$)/g) || []).length || 1);
  stats.push({
    week: w,
    lines: lines.length,
    words: +mean(words).toFixed(1),
    long: pct(words, (n) => n > 20),
    multi: pct(sentences, (n) => n > 2),
  });
}

const w1 = stats.find((s) => s.week === 1);
console.log("           lines   words/line   >20 words   3+ sentences");
for (const s of stats) {
  const heavy = s.week > 1 && (s.words > w1.words + 2 || s.long > w1.long + 8);
  console.log(
    `  week ${String(s.week).padStart(2)}  ${String(s.lines).padStart(5)}` +
    `   ${String(s.words).padStart(9)}` +
    `   ${String(s.long + "%").padStart(8)}` +
    `   ${String(s.multi + "%").padStart(12)}` +
    (heavy ? "   <-- heavier than week 1" : ""),
  );
}

const rest = stats.filter((s) => s.week > 1);
const avg = (k) => +(rest.reduce((a, s) => a + s[k], 0) / rest.length).toFixed(1);
console.log(`\n  week 1, after the rewrite : ${w1.words} words/line, ${w1.long}% over 20 words, ${w1.multi}% with 3+ sentences`);
console.log(`  weeks 2-20, average       : ${avg("words")} words/line, ${avg("long")}% over 20 words, ${avg("multi")}% with 3+ sentences`);
console.log(`  lines measured            : ${w1.lines} in week 1, ${rest.reduce((a, s) => a + s.lines, 0)} across the rest`);

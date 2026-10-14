/**
 * The lines in a week that are written heavier than week 1's standard.
 *
 * Week 1's narration was rewritten after the owner said it "sounds so
 * rushed... it needs to be like a well-written classroom structure", and the
 * audio pipeline cannot reproduce that: a long compound sentence read at the
 * right pace is still a long compound sentence.
 *
 * Lines come from the MANIFEST, so this covers everything the child actually
 * hears - narration, coach lines, verdict reasons, teach panels - not just the
 * narration arrays. Most of the heavy writing turned out to be in the verdict
 * and explanation fields, which a scan of the content file alone misses.
 *
 * Long is the defect; many sentences is not. "Your name. Your address. Your
 * school." is nine words in four sentences and is exactly the shape week 1 was
 * rewritten into - staccato is how a teacher lands a list.
 *
 *   node scripts/list-heavy-lines.mjs 2
 */
import { readFile } from "node:fs/promises";

const week = process.argv[2];
const file = `app/lesson/weekContent/week${week}.ts`;
const src = await readFile(file, "utf8");
const rows = src.split("\n");
const manifest = JSON.parse(await readFile("public/audio/voice/manifest.json", "utf8"));
const LEADS = new Set(["That's right!", "Not quite."]);

const resolved = new Map();
for (const e of manifest.entries) {
  const k = `${e.speaker}\u0000${e.text}`;
  if (!resolved.has(k)) resolved.set(k, e);
}

const seen = new Set();
const heavy = [];
for (const e of resolved.values()) {
  let lines = e.lines && e.lines.length ? e.lines : [e.text];
  const probe = lines.length > 1 && LEADS.has(lines[0].trim()) ? lines.slice(1) : lines;
  if (!probe.every((l) => l && src.includes(l.trim()))) continue;
  for (const raw of probe) {
    const text = raw.replace(/\[[a-z ]*\]/gi, "").trim();
    if (text.length < 8 || seen.has(text)) continue;
    seen.add(text);
    const words = text.split(/\s+/).filter(Boolean).length;
    const commas = (text.match(/,/g) || []).length;
    if (!(words > 20 || (words > 15 && commas >= 3))) continue;
    const at = rows.findIndex((r) => r.includes(raw.trim().slice(0, 60)));
    heavy.push({ line: at >= 0 ? at + 1 : 0, words, commas, text });
  }
}

heavy.sort((a, b) => b.words - a.words);
console.log(`week ${week}: ${heavy.length} spoken line(s) heavier than week 1's shape\n`);
for (const h of heavy) {
  console.log(`  L${String(h.line || "?").padStart(4)}  ${String(h.words).padStart(2)}w ${h.commas}c`);
  console.log(`        ${h.text}`);
}

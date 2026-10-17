/**
 * Can the APP actually find every clip it will ask for?
 *
 * Owner, 2026-10-17, on week 2 Power 4: "Why is this a mans voice? this issue
 * is a new one because when I tested it the first time, it didn't happen."
 * Then: "just found many more places where it's been replaced by males voice."
 *
 * It was a man because the app found NO clip and fell back to the browser's
 * speech synthesis - "Microsoft David" on Windows. Nothing was wrong with the
 * recordings: those Emma clips measured 184-219 Hz, squarely her range.
 *
 * The cause was two keys that must be identical drifting apart:
 *
 *   the app        InfoNarration.buildBlockKey(lines) - the RAW lines,
 *                  trimmed, joined with a space, whitespace collapsed - then
 *                  `manifest.entries.find(e => e.text === key)`, an EXACT
 *                  string match.
 *
 *   the generator  wrote `text` into the manifest with the year pronunciation
 *                  already applied, so "emma2017" was stored as "emma twenty
 *                  seventeen" and the exact match failed.
 *
 * WHY NOTHING CAUGHT IT. The generator's `--check` asks "does every block
 * have a FILE", keyed by hash, and it was perfectly happy - the file existed
 * and the hash matched. Nothing asked "will the APP find it", which is a
 * different question with a different key. That is the same gap that put
 * nineteen weeks on a robot voice in #539.
 *
 * So this does exactly what the runtime does and nothing else.
 *
 *   node scripts/audit-manifest-lookup.mjs
 *   node scripts/audit-manifest-lookup.mjs 2
 */
import { readFile } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
const MANIFEST = "public/audio/voice/manifest.json";

/** EXACTLY InfoNarration.buildBlockKey. Keep these in step. */
function buildBlockKey(lines) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Read a `lines: [ ... ]` array by SCANNING, not by regex.
 *
 * A regex for the closing bracket stops at the first "]" it sees, which in
 * practice is one inside a line of dialogue ("[whispers] Every hero..."), so
 * it returns a single truncated line and every comparison after it is
 * meaningless. That mistake produced a false "15 of 16 unfindable" report
 * while this was being written.
 */
function readLinesArray(src, openIdx) {
  let i = src.indexOf("[", openIdx);
  if (i < 0) return null;
  const out = [];
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "[") {
      depth++;
      continue;
    }
    if (c === "]") {
      depth--;
      if (depth === 0) return out;
      continue;
    }
    if (c === '"') {
      let s = "";
      i++;
      for (; i < src.length; i++) {
        if (src[i] === "\\") {
          s += src[i + 1] === "n" ? "\n" : src[i + 1];
          i++;
          continue;
        }
        if (src[i] === '"') break;
        s += src[i];
      }
      out.push(s);
    }
  }
  return null;
}

/** Every `narration: { speaker?, lines: [...] }` block in a week file. */
function blocksIn(src) {
  const out = [];
  const re = /narration:\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const head = src.slice(m.index, m.index + 400);
    const sp = head.match(/speaker:\s*"(adam|layla|narrator)"/);
    const linesAt = src.indexOf("lines:", m.index);
    if (linesAt < 0) continue;
    const lines = readLinesArray(src, linesAt);
    if (!lines || !lines.length) continue;
    out.push({ speaker: sp ? sp[1] : "layla", lines });
  }
  return out;
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byText = new Set(manifest.entries.map((e) => `${e.speaker}\u0000${e.text}`));

let checked = 0;
let missing = 0;
const perWeek = {};

for (const w of WEEKS) {
  let src;
  try {
    src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  } catch {
    continue;
  }
  for (const b of blocksIn(src)) {
    const key = buildBlockKey(b.lines);
    if (!key) continue;
    checked++;
    if (byText.has(`${b.speaker}\u0000${key}`)) continue;
    missing++;
    (perWeek[w] ||= []).push({ speaker: b.speaker, key });
  }
}

for (const [w, rows] of Object.entries(perWeek)) {
  console.log(`\nweek ${w}: ${rows.length} block(s) the app cannot find, so it would speak them in a robot voice`);
  for (const r of rows.slice(0, 4)) console.log(`   ${r.speaker.padEnd(8)} ${r.key.slice(0, 96)}`);
  if (rows.length > 4) console.log(`   ... and ${rows.length - 4} more`);
}

console.log(`\n${checked} narration block(s) checked the way the APP looks them up, ${missing} unfindable.`);
if (missing) {
  console.log("\nThe manifest's `text` must be the lines EXACTLY as written.");
  console.log("Pronunciation belongs in speakBlock and in the file's hash, never in `text`.");
}
process.exit(missing ? 1 : 0);

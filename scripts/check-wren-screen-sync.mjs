// WREN must say what the child reads. For every line in
// scripts/wren-voice-scripts/missionNN.mjs, finds the on-screen string in
// app/explorers/ with the same words (tags, punctuation and quote marks
// ignored) and lists every line that has no exact match, with the closest one.
//
// Usage: node scripts/check-wren-screen-sync.mjs 01 [02 ...]   (no args = all 20)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
});
// "Phase 1" on screen is "Phase one" spoken
const NUM = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");
const words = (s) => s.replace(/\[[a-z ]+\]/g, " ").toLowerCase().replace(/[‘’]/g, "'").split(/[^a-z0-9']+/)
  .map((w) => w.replace(/^'+|'+$/g, "")).filter(Boolean).map((w) => (/^\d+$/.test(w) && +w <= 20 ? NUM[+w] : w));
const key = (s) => words(s).join(" ");

const literals = new Map();
for (const file of walk("app/explorers")) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const s = (m[1] ?? m[2]).replace(/\\(["'`\\])/g, "$1");
    if (s.split(/\s+/).length >= 4) literals.set(key(s), { s, file });
  }
  // a transmission is shown as a `lines: [...]` array but spoken as one clip
  for (const m of src.matchAll(/lines:\s*\[([^\]]*)\]/g)) {
    const s = [...m[1].matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map((x) => x[1]).join(" ");
    if (s) literals.set(key(s), { s, file });
  }
}
// Spoken only, with no bubble on screen: the shared test pass/fail lines
// (the result screen shows its own score text).
// test verdicts are spoken only (Missions 1-5 call them catch-pass/fail)
const VOICE_ONLY = /-(catch|test)-(pass|fail)\.mp3$/;

function closest(line) {
  const a = new Set(words(line));
  let best = null, score = 0;
  for (const { s, file } of literals.values()) {
    const b = words(s), hit = b.filter((w) => a.has(w)).length / Math.max(a.size, b.length);
    if (hit > score) { score = hit; best = { s, file }; }
  }
  return score > 0.4 ? best : null;
}

const missions = process.argv.slice(2).length ? process.argv.slice(2) : Array.from({ length: 20 }, (_, i) => String(i + 1));
let lines = 0, off = 0;
for (const m of missions) {
  const nn = m.padStart(2, "0");
  const { [`mission${nn}VoiceScripts`]: scripts } = await import(`./wren-voice-scripts/mission${nn}.mjs`);
  for (const [path, raw] of Object.entries(scripts)) {
    lines++;
    if (literals.has(key(raw)) || VOICE_ONLY.test(path)) continue;
    off++;
    const c = closest(raw);
    console.log(`${path}\n  voice:  ${raw.replace(/\[[a-z ]+\]\s*/g, "")}\n  screen: ${c ? `${c.s}\n          (${c.file})` : "no matching text found"}`);
  }
}
console.log(`\n${lines} lines, ${off} differ from the screen`);
process.exit(off ? 1 : 0);

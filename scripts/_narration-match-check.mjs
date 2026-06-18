import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync("public/audio/voice/manifest.json", "utf8"),
);
const src = fs.readFileSync("app/lesson/weekContent/week1.ts", "utf8");

const blockRe =
  /narration:\s*\{\s*speaker:\s*"(adam|layla)",\s*lines:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
const stringRe = /"((?:[^"\\]|\\.)*)"/g;

const buildKey = (lines) =>
  lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

let m;
let n = 0;
let matched = 0;
let missed = 0;
while ((m = blockRe.exec(src)) !== null) {
  n++;
  const speaker = m[1];
  const lines = [];
  let s;
  while ((s = stringRe.exec(m[2])) !== null) {
    const t = s[1].replace(/\\"/g, '"').trim();
    if (t) lines.push(t);
  }
  const key = buildKey(lines);
  const hit = manifest.entries.find(
    (e) => e.speaker === speaker && e.text === key,
  );
  if (hit) {
    matched++;
    console.log(`#${n} ${speaker} RECORDED ok  "${key.slice(0, 50)}..."`);
  } else {
    missed++;
    console.log(
      `#${n} ${speaker} >>> TTS FALLBACK (no match)  "${key.slice(0, 50)}..."`,
    );
  }
}
console.log(
  `\nTOTAL blocks=${n}  recorded=${matched}  TTS-fallback=${missed}`,
);
console.log(
  "manifest entries:",
  manifest.entries.length,
  "| voices:",
  JSON.stringify(manifest.voices || manifest.voice || "?"),
);

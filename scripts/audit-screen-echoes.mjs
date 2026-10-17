/**
 * A screen must not say the same stock phrase twice.
 *
 * Owner, 2026-10-17, after the boss question was fixed: "It said when you are
 * not sure twice again????????? I though you said you fixed this. Is there
 * anywhere else this issue is occuring?"
 *
 * Yes, and this is the audit that should have existed the first time.
 *
 * audit-framing-echoes.mjs only ever compared a BOSS question against its own
 * teach line. That fixed the boss and nothing else. The same fault was
 * sitting on an ordinary screen all along: week 2's Prove-it prompt reads
 * "If you're not sure, ___." and the narration under it says "That's the
 * golden rule. When you're not sure, you ask a grown-up." Twice, on one
 * screen, in the same glance.
 *
 * This checks EVERY screen: the strings a child reads as chrome - prompt,
 * title, subtitle, headline, learned, label - against the narration lines
 * printed and spoken on that same screen.
 *
 * As with the boss version, only generic SET-UP phrases count. A screen is
 * allowed, and usually required, to repeat its own SUBJECT: week 2's "too
 * nosy" is the signal word the week teaches, and a Prove-it that asks about
 * passwords will say "password" in both places. What grates is the framing.
 *
 *   node scripts/audit-screen-echoes.mjs
 *   node scripts/audit-screen-echoes.mjs 2
 */
import { readFile } from "node:fs/promises";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);

/** Stock set-up phrases. Generic by construction: none names a week's topic. */
const FRAMING = [
  "not sure",
  "isn't sure",
  "is not sure",
  "can't tell",
  "cannot tell",
  "after all",
  "extra care",
  "speak up",
  "keep it secret",
  "the golden rule",
  "the hero move",
  "what's the hero move",
  "hit pause",
  "ask a grown-up",
  "ask first",
  "stop and ask",
  "just guess",
  "find out",
  "make sure",
];

/** The fields a child reads as chrome, beside the narration. */
const CHROME = ["prompt", "title", "subtitle", "headline", "learned", "label", "next", "praise", "verdictNote", "clearLabel"];

const norm = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/\[[a-z ]*\]/gi, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Read a bracketed array by scanning, so a "]" inside dialogue cannot end it. */
function readArray(src, from) {
  let i = src.indexOf("[", from);
  if (i < 0) return [];
  const out = [];
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "[") { depth++; continue; }
    if (c === "]") { depth--; if (depth === 0) return out; continue; }
    if (c === '"') {
      let s = "";
      i++;
      for (; i < src.length; i++) {
        if (src[i] === "\\") { s += src[i + 1]; i++; continue; }
        if (src[i] === '"') break;
        s += src[i];
      }
      out.push(s);
    }
  }
  return out;
}

let checked = 0;
let found = 0;

for (const w of WEEKS) {
  let src;
  try {
    src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8");
  } catch {
    continue;
  }

  /* A screen runs from one `narration:` back to the nearest screen opener.
   * Anchoring on the narration is what keeps chrome and speech paired. */
  const re = /narration:\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const linesAt = src.indexOf("lines:", m.index);
    if (linesAt < 0) continue;
    const lines = readArray(src, linesAt);
    if (!lines.length) continue;

    /* The chrome belonging to this screen: the fields between the previous
     * narration block and this one. */
    const prevEnd = (() => {
      const pre = src.slice(0, Math.max(0, m.index - 1));
      const hits = [...pre.matchAll(/[a-zA-Z]*[Nn]arration:s*{/g)];
      return hits.length ? hits[hits.length - 1].index : -1;
    })();
    const scope = src.slice(prevEnd < 0 ? Math.max(0, m.index - 2600) : prevEnd, m.index);

    const chrome = [];
    for (const field of CHROME) {
      const fre = new RegExp(field + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', "g");
      let f;
      while ((f = fre.exec(scope))) chrome.push({ field, text: f[1] });
    }
    if (!chrome.length) continue;
    checked++;

    const spoken = norm(lines.join(" "));
    for (const c of chrome) {
      const printed = norm(c.text);
      const hits = FRAMING.filter((p) => printed.includes(p) && spoken.includes(p));
      if (!hits.length) continue;
      found++;
      console.log(`\nweek ${w}: "${hits.join('", "')}" is both PRINTED and SPOKEN on one screen`);
      console.log(`   ${c.field.padEnd(9)}: ${c.text.slice(0, 92)}`);
      const echo = lines.find((l) => hits.some((h) => norm(l).includes(h)));
      console.log(`   narration: ${String(echo).slice(0, 92)}`);
    }
  }
}

console.log(`\n${checked} screen(s) checked, ${found} saying a stock phrase twice.`);
process.exit(found ? 1 : 0);

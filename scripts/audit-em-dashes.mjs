/**
 * Where does an em-dash reach a READER?
 *
 * Owner rule (2026-07-24): never an em-dash in user-visible site copy. They
 * read as AI-written, which is the whole objection.
 *
 * A plain grep cannot answer this. Most of the dashes in this repo sit in
 * CODE COMMENTS, which are exempt and which nobody but us reads: grep said
 * 156 for Cyber Explorers when the real number was 113. So strip comments
 * properly - tracking string state, so a dash inside a quoted sentence is
 * never mistaken for one inside a comment, and treating a CSS comment inside
 * a styled-jsx template literal as the comment it is - then report only what
 * survives inside a literal.
 *
 * IF YOU ARE FIXING WHAT THIS FINDS, change punctuation and NOTHING else.
 * Much of the course copy is spoken over recorded ElevenLabs clips: a changed
 * WORD leaves the audio saying one thing and the screen another (the defect
 * fixed in PR #854), while a changed MARK cannot, because the clip is already
 * cut. Prove that rather than assert it - reduce each touched file to its
 * letters and digits alone, lower-cased, and diff that against HEAD. It is
 * blind to punctuation, spacing and the capitals a new full stop forces, and
 * it catches a single dropped letter anywhere in the file.
 *
 * The mark depends on the dash job: a list takes a colon, a complete
 * sentence takes a full stop, a dependent tail takes a comma, and a PAIR
 * around an aside takes brackets - the only mark that stays readable when
 * the aside has commas of its own. A separator inside a label takes the
 * middot this UI already uses everywhere else.
 *
 *   node scripts/audit-em-dashes.mjs                 the whole app
 *   node scripts/audit-em-dashes.mjs app/explorers   one course
 *   node scripts/audit-em-dashes.mjs --strict        exit 1 if any are found
 */
import { readdirSync, readFileSync, statSync } from "node:fs";

const ARGS = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const STRICT = process.argv.includes("--strict");
const ROOTS = ARGS.length ? ARGS : ["app"];
const files = [];
const walk = (d) => {
  for (const e of readdirSync(d)) {
    const p = `${d}/${e}`;
    if (statSync(p).isDirectory()) walk(p);
    else if (/[.]tsx?$/.test(p)) files.push(p);
  }
};
for (const r of ROOTS) walk(r);

/** Mark every character that sits inside a comment, scanning with string state. */
function commentMask(src) {
  const mask = new Uint8Array(src.length);
  let i = 0, str = null, line = false, blockc = false;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (line) { if (c === "\n") line = false; else mask[i] = 1; i++; continue; }
    if (blockc) { mask[i] = 1; if (c === "*" && d === "/") { mask[i + 1] = 1; i += 2; blockc = false; continue; } i++; continue; }
    if (str) {
      if (c === "\\") { i += 2; continue; }
      /* A template literal holds this repo styled-jsx CSS, and CSS comments
       * are comments: primitives.tsx reported 12 dashes that no child can
       * ever read because they sit in a CSS comment inside a backtick block. */
      if (str === "`" && c === "/" && d === "*") {
        let j = i;
        while (j < src.length && !(src[j] === "*" && src[j + 1] === "/")) { mask[j] = 1; j++; }
        mask[j] = 1; mask[j + 1] = 1;
        i = j + 2; continue;
      }
      if (c === str) str = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === "`") { str = c; i++; continue; }
    if (c === "/" && d === "/") { line = true; i += 2; continue; }
    if (c === "/" && d === "*") { blockc = true; i += 2; continue; }
    i++;
  }
  return mask;
}

let total = 0;
const perFile = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!src.includes("\u2014")) continue;
  const mask = commentMask(src);
  const hits = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== "\u2014" || mask[i]) continue;
    const lineNo = src.slice(0, i).split("\n").length;
    const lineTxt = src.split("\n")[lineNo - 1].trim();
    hits.push({ lineNo, lineTxt });
  }
  if (hits.length) { perFile.push([f, hits]); total += hits.length; }
}

perFile.sort((a, b) => b[1].length - a[1].length);
for (const [f, hits] of perFile) {
  console.log(`\n### ${f}  (${hits.length})`);
  for (const h of hits) console.log(`  ${h.lineNo}: ${h.lineTxt.slice(0, 400)}`);
}
console.log(`\n=== ${total} em-dash(es) in copy across ${perFile.length} file(s) ===`);

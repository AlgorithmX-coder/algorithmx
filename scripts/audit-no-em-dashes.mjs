/**
 * No em-dashes in anything a child or a customer reads.
 *
 * A standing owner rule, and one that is easy to break by accident because
 * an em-dash is a perfectly normal thing to type. It was broken in five
 * places in the six exercise engines week 1 uses, and the only reason it was
 * found is that one of them happened to be in a screenshot:
 *
 *   "Each password came in weak - work out why!"      (WeakSorter)
 *   "they flip over and we'll test you - tap the..."  (MemoryMatch)
 *   "...numbers, and symbols - the longer and..."     (PasswordHospital)
 *   "This one's tricky - skip to the next patient"    (PasswordHospital)
 *   "Glue silly random words together - long, mem..." (ThreeRandomWords)
 *
 * Spotting these by eye across hundreds of components does not work, so this
 * does it instead.
 *
 * COMMENTS ARE FINE. An em-dash in a comment is for whoever is reading the
 * code, not for a six-year-old, and there are over a thousand of them. This
 * only reads what is rendered: JSX text and string literals, with comments
 * (line, block and JSX) stripped first.
 *
 *   node scripts/audit-no-em-dashes.mjs           the child-facing surfaces
 *   node scripts/audit-no-em-dashes.mjs --all     every file under app/
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ALL = process.argv.includes("--all");

/* The surfaces a child actually reads. Marketing and admin pages have their
 * own copy rules and their own reviewers; widening this without widening the
 * fixes would just make the check noisy and then ignored. */
const SCOPE = ALL ? ["app"] : [
  join("app", "components", "exercises"),
  join("app", "components", "lesson"),
  join("app", "components", "game"),
  join("app", "lesson"),
  join("app", "cyberhq"),
];

const EM = "—";

function files(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (/node_modules|\.next|\.git/.test(p)) continue;
      files(p, acc);
    } else if (/\.(tsx|ts)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

/**
 * Blank out comments, keeping the line and column count intact so a hit
 * still reports the right line. Handles // line comments, block comments
 * and {/* ... *\/} JSX comments.
 */
function stripComments(src) {
  const out = src.split("");
  let i = 0;
  const n = src.length;
  let inStr = null;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (inStr) {
      if (c === "\\") { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; i++; continue; }
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") { out[i] = " "; i++; }
      continue;
    }
    if (c === "/" && d === "*") {
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] !== "\n") out[i] = " "; i++; }
      if (i < n) { out[i] = " "; out[i + 1] = " "; i += 2; }
      continue;
    }
    i++;
  }
  return out.join("");
}

const hits = [];
for (const root of SCOPE) {
  for (const f of files(root)) {
    const src = readFileSync(f, "utf8");
    if (!src.includes(EM)) continue;
    const cleaned = stripComments(src);
    cleaned.split(/\r?\n/).forEach((line, i) => {
      if (!line.includes(EM)) return;
      hits.push({ file: f, line: i + 1, text: line.trim().slice(0, 92) });
    });
  }
}

if (!hits.length) {
  console.log(`No em-dashes in child-facing copy${ALL ? " (whole app)" : ""}.`);
  process.exit(0);
}
console.log(`\n${hits.length} em-dash(es) in copy a child reads:\n`);
for (const h of hits) console.log(`  ${h.file}:${h.line}\n     ${h.text}`);
console.log("\nUse a comma, a full stop or a colon. Owner rule: no em-dashes in user-visible copy.");
process.exit(1);

/**
 * Authored text must not repeat what the ENGINE already printed.
 *
 * Owner, 2026-10-18: "There were words that Emma said that have been
 * repeated... I am finding Emma repeat things twice. I don't think you ran
 * the document."
 *
 * I had run it. Three echo gates all reported zero, and all three were right
 * about what they looked at and blind to this:
 *
 *   audit-echoed-lines.mjs:159   reads app/lesson/weekContent/week{N}.ts
 *   audit-screen-echoes.mjs:96   reads app/lesson/weekContent/week{N}.ts
 *   audit-framing-echoes.mjs:80  reads app/lesson/weekContent/week{N}.ts
 *
 * But half of every repetition he heard is generated in a .tsx ENGINE:
 *
 *   ClueStamper.tsx:838  `${n}/${n} cases closed`, `${n} fakes unmasked`
 *   CyberMaze.tsx:1761   `${n}/${n} gates opened with a hero reply`
 *
 * and the other half is the week's own completeTitle / completeLine /
 * completeNarration, printed and spoken on the same screen. A gate that reads
 * only the content files can never see the pair. That is rule 12.
 *
 * So this reads BOTH sides: the literal strings an engine builds into its
 * stat lines, and the authored text that lands beside them.
 *
 *   node scripts/audit-engine-echoes.mjs 3
 *   node scripts/audit-engine-echoes.mjs            all twenty weeks
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
const ENGINES = "app/components/exercises";
const RUN = 2;   // two content words shared is enough here: "cases closed"

const STOP = new Set(("a an and the is it its of to in on at for with that this these those them they you your " +
  "he she his her him i we us our as so but or if then than when what which who how why do does did be been " +
  "being have has had was were are am will would can could not no yes all any some more most just only even " +
  "still right now here there up down out off over one two three four five").split(" "));

const words = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

function sharedRun(a, b) {
  const A = words(a), B = words(b);
  let best = [];
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      let k = 0;
      while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++;
      if (k > best.length) best = A.slice(i, i + k);
    }
  }
  return best.length >= RUN ? best.join(" ") : null;
}

/* The literal words an engine bakes into a stat line or a fixed caption.
 * Template holes (${...}) are dropped: the NUMBER varies, the words do not. */
async function engineStrings() {
  const out = [];
  for (const f of (await readdir(ENGINES)).filter((n) => n.endsWith(".tsx"))) {
    const src = await readFile(join(ENGINES, f), "utf8");
    for (const m of src.matchAll(/statLines\s*=\s*\{?\[([\s\S]{0,400}?)\]/g)) {
      for (const lit of m[1].matchAll(/[`"']([^`"']{4,80})[`"']/g)) {
        const text = lit[1].replace(/\$\{[^}]*\}/g, " ").trim();
        if (words(text).length >= RUN) out.push({ file: f, text });
      }
    }
    /* Defaults like DEFAULT_CAUGHT = { one: "fake unmasked", many: "fakes unmasked" } */
    for (const m of src.matchAll(/\b(?:one|many)\s*:\s*["'`]([^"'`]{4,60})["'`]/g)) {
      if (words(m[1]).length >= RUN) out.push({ file: f, text: m[1] });
    }
    for (const m of src.matchAll(/\?\?\s*["'`]([^"'`]{8,80})["'`]/g)) {
      if (words(m[1]).length >= RUN) out.push({ file: f, text: m[1] });
    }
  }
  return out;
}

/* A week's own CONCEPT NAME is supposed to appear in both places.
 *
 * Week 3 teaches "Red-Flag Radar" and "The Uh-Oh Power", so the engine's
 * "RED FLAG SPOTTED!" and the debrief's "your red-flag radar is switched on"
 * are the teaching landing twice on purpose - the same call as "trusted
 * grown-up". Keyed to the week and the phrase, so a NEW echo still reports. */
const KEEP = [
  { week: 3, run: "red flag", why: "the week's concept is literally called Red-Flag Radar" },
  { week: 3, run: "uh oh", why: "the week's concept is The Uh-Oh Power" },
  { week: 3, run: "trusted grown", why: "the locked safety term, named every time on purpose" },
];

const engine = await engineStrings();

/* WHICH ENGINES DOES THIS WEEK ACTUALLY USE?
 *
 * The first run compared every engine string against every authored line and
 * reported 21 echoes for week 3, including RadioRoll.tsx - an engine week 3
 * never loads. That is the same fault the first echo audit had: pairing
 * things that never appear together (rule 8). A week's `type:` fields say
 * which engines it uses, so only those can echo it. */
const ENGINE_OF_TYPE = (type) => type.charAt(0).toUpperCase() + type.slice(1);

let found = 0, checked = 0, kept = 0;

for (const w of WEEKS) {
  let src;
  try { src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8"); } catch { continue; }

  const used = new Set();
  for (const m of src.matchAll(/\btype:\s*"([a-zA-Z]+)"/g)) used.add(ENGINE_OF_TYPE(m[1]).toLowerCase());
  const inWeek = engine.filter((e) => used.has(e.file.replace(/\.tsx$/, "").toLowerCase()));
  if (!inWeek.length) continue;

  /* The authored text that lands on a completion screen. */
  const authored = [];
  for (const key of ["completeTitle", "completeLine", "completeNarration"]) {
    for (const m of src.matchAll(new RegExp(`${key}\\s*:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|\\{([\\s\\S]{0,400}?)\\})`, "g"))) {
      if (m[1]) authored.push({ key, text: m[1] });
      else if (m[2]) for (const l of m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)) authored.push({ key, text: l[1] });
    }
  }

  for (const a of authored) {
    for (const e of inWeek) {
      checked++;
      const run = sharedRun(a.text, e.text);
      if (!run) continue;
      if (KEEP.some((k) => k.week === w && run.includes(k.run))) { kept++; continue; }
      found++;
      console.log(`\nweek ${w}: "${run}" is printed by the engine AND written into ${a.key}`);
      console.log(`   engine (${e.file}): ${e.text}`);
      console.log(`   ${a.key.padEnd(18)}: ${a.text}`);
    }
  }
}

console.log(`\n${engine.length} engine string(s) x authored lines = ${checked} pair(s) compared, ${found} echo(es).`);
console.log(`Engines read: ${ENGINES}. Content read: app/lesson/weekContent/week*.ts.`);
process.exit(found ? 1 : 0);

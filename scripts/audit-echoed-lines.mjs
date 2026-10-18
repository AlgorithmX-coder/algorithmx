/**
 * Two things on screen at once must not say the same thing.
 *
 * Owner, 2026-10-16, on the Mix It Up question: "In the quiz it says mix a
 * capital twice." It did. The Raccoon's reaction said "Capitals, numbers AND
 * symbols all at once poked my decoder", and the verdict printed directly
 * beneath it said "Mix a capital, a number AND a symbol all the way through".
 * Both are on screen together, and a child hears the same list twice.
 *
 * WHAT CAN ACTUALLY BE HEARD TOGETHER. The first version of this check paired
 * lines by how close they sat in the FILE (within 1,200 characters). That was
 * wrong twice over, and on weeks 3-5 it reported eight echoes of which most
 * were not real:
 *
 *   - A boss gear is about 800 characters, so the window reached into the NEXT
 *     gear and paired week 3's concept-4 teach with its concept-5 answer card.
 *     Those are different questions on different screens.
 *   - Inside a quiz question it paired one card's text with ANOTHER card's
 *     explanation. A child sees the explanation of the card they picked, never
 *     of the card they didn't, so those two can never be heard together.
 *
 * An audit that cries wolf eight times is worse than no audit, because the one
 * real echo hides in the noise. So this version pairs on the real structure,
 * and only pairs lines the runtime actually plays together. QuizBoss.tsx is
 * the authority, and the one surprise there is worth writing down:
 * `teachOnWrong.explanation` is NOT wrong-only. Line ~602 speaks it on EVERY
 * answer:
 *
 *     lines: [wasCorrect ? "That's right!" : "Not quite.", question.teachOnWrong.explanation]
 *
 * and the villain's reaction is set moments earlier in the same handler. That
 * is why the teach must be compared against villainRight as well as
 * villainWrong, and it is exactly the pair the owner caught on week 1.
 *
 * DELIBERATE REPEATS. A locked safety term, a drilled mantra and a week's
 * teaching metaphor are all SUPPOSED to come round twice. Those are listed in
 * KEEP with a reason. They are keyed to the week and the shared phrase, so a
 * new echo in the same week still reports.
 *
 * Stop words are ignored, so "one of the" is not an echo; what counts is a run
 * of CONTENT words, which is what a listener notices.
 *
 *   node scripts/audit-echoed-lines.mjs 2
 *   node scripts/audit-echoed-lines.mjs            all twenty weeks
 *   node scripts/audit-echoed-lines.mjs --all      including deliberate ones
 */
import { readFile } from "node:fs/promises";

const FLAGS = process.argv.slice(2).filter((a) => a.startsWith("--"));
const ARG = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const WEEKS = ARG.length ? ARG.map(Number) : Array.from({ length: 20 }, (_, i) => i + 1);
const SHOW_KEPT = FLAGS.includes("--all");
/* Three content words in common is a phrase; two is a coincidence. */
const RUN = 3;

/** Repeats that are the teaching, not a slip. Week, phrase, and why. */
const KEEP = [
  { week: 3, run: "tell trusted grown", why: "'tell a trusted grown-up' is the locked safety term; the action is named every time on purpose" },
  { week: 4, run: "stop check show", why: "the week's three-step mantra, drilled by repetition" },
  { week: 5, run: "mean messages fire", why: "the fire metaphor is week 5's whole teaching device (Don't Feed The Fire)" },
];

const STOP = new Set(("a an and the is it its of to in on at for with that this these those them they " +
  "you your he she his her him i we us our as so but or if then than when what which who how why " +
  "do does did done be been being have has had was were are am will would can could not no yes " +
  "one two all any some more most just only even still right now here there up down out off over").split(" "));

const words = (t) => String(t || "")
  .toLowerCase()
  .replace(/\[[a-z ]*\]/gi, " ")
  .replace(/[^a-z0-9' ]/g, " ")
  .split(/\s+/)
  .filter((w) => w && !STOP.has(w));

/** The longest run of content words the two lines share, if it reaches RUN. */
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

/** Walk forward from the bracket at `from` to its match, skipping strings.
 *
 * COMMENTS MUST BE SKIPPED, not just strings. A line comment in a week file
 * says things like "gear B's teach" or "Layla's tablet", and a bare apostrophe
 * read as the start of a string literal swallows every brace until the next
 * one. Measured on the fixture: one apostrophe in a comment lost a whole boss
 * gear, and the audit went quiet about a real echo inside it. */
function balanced(src, from, open = "{", close = "}") {
  let depth = 0, inStr = null;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i); if (i < 0) break; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(from, i + 1); }
  }
  return null;
}

/** Every balanced object in the source. */
function objects(src) {
  const out = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== "{") continue;
    const t = balanced(src, i);
    if (t) out.push(t);
  }
  return out;
}

/** How many times a field name appears in the object.
 *
 * The guard against reporting everything twice. objects() returns the nested
 * ones AND the ones wrapping them, and a wrapper holding two boss gears still
 * matches "has an ask, options and a teachOnWrong" - its regexes just pick the
 * first of each, producing a duplicate of the first gear. An object is the
 * gear ITSELF only when it holds exactly one teachOnWrong. */
const times = (obj, name) => (obj.match(new RegExp(`\\b${name}\\s*:`, "g")) || []).length;

/** A named sub-object, e.g. sub(gear, "teachOnWrong"). */
function sub(obj, name) {
  const m = new RegExp(`\\b${name}\\s*:\\s*\\{`).exec(obj);
  return m ? balanced(obj, m.index + m[0].length - 1) : null;
}

/** A named string field anywhere in the given text. */
function field(obj, name) {
  const m = new RegExp(`\\b${name}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(obj || "");
  return m ? m[1] : null;
}

/** The `text:` of each member of a named array, in order. */
function arrayTexts(obj, name) {
  const m = new RegExp(`\\b${name}\\s*:\\s*\\[`).exec(obj);
  if (!m) return [];
  const arr = balanced(obj, m.index + m[0].length - 1, "[", "]");
  if (!arr) return [];
  return [...arr.matchAll(/\btext\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
}

let found = 0, kept = 0, checked = 0;

for (const w of WEEKS) {
  let src;
  try { src = await readFile(`app/lesson/weekContent/week${w}.ts`, "utf8"); } catch { continue; }

  /** Every pair the runtime shows together: [whatA, a, whatB, b]. */
  const pairs = [];

  for (const obj of objects(src)) {
    /* A BOSS GEAR: ask + options + teachOnWrong. On a correct answer QuizBoss
     * sets the villain's line and then shows the teach; on a wrong one it
     * shows villainWrong and the same teach. The chosen card stays on screen
     * through both. */
    const teachBlock = sub(obj, "teachOnWrong");
    if (teachBlock && times(obj, "teachOnWrong") === 1 && /\bask\s*:/.test(obj) && /\boptions\s*:/.test(obj)) {
      const teach = field(teachBlock, "explanation");
      const title = field(teachBlock, "title");
      const ask = field(sub(obj, "ask"), "text");
      const right = field(sub(obj, "villainRight"), "text");
      const wrong = field(sub(obj, "villainWrong"), "text");
      const opts = arrayTexts(obj, "options");
      const ci = Number((/\bcorrectIndex\s*:\s*(\d+)/.exec(obj) || [])[1] ?? -1);
      const answer = ci >= 0 ? opts[ci] : null;
      if (teach && right) pairs.push(["raccoon (right)", right, "the teach beside it", teach]);
      if (teach && wrong) pairs.push(["raccoon (wrong)", wrong, "the teach beside it", teach]);
      if (teach && answer) pairs.push(["the answer card", answer, "the teach beside it", teach]);
      if (teach && title) pairs.push(["the teach's title", title, "the teach itself", teach]);
      if (ask && answer) pairs.push(["the question", ask, "its own answer card", answer]);
      continue;
    }

    /* A QUIZ QUESTION: a prompt must not hand over its own answer. This is
     * tested BEFORE the card below, because a question object contains its
     * cards' text and isCorrect fields and would otherwise be read as a card
     * (and the prompt never checked at all). */
    if (times(obj, "prompt") === 1 && /\bchoices\s*:/.test(obj)) {
      const prompt = field(obj, "prompt");
      const correct = /\{[^{}]*isCorrect:\s*true[^{}]*\}/.exec(obj);
      const answer = correct ? field(correct[0], "text") : null;
      if (prompt && answer) pairs.push(["the prompt", prompt, "its own answer card", answer]);
      continue;
    }

    /* A QUIZ CARD: its text, its short explanation and Sarah's spoken why all
     * belong to the one card and are shown when that card is picked. One
     * `text:` only, so the card itself is read and not a list of them. */
    if (times(obj, "text") === 1 && /\bis(?:Correct|Wrong)\s*:/.test(obj) && !/\bchoices\s*:/.test(obj)) {
      const text = field(obj, "text");
      const expl = field(obj, "explanation");
      const why = field(obj, "why");
      if (text && expl) pairs.push(["the card", text, "its explanation", expl]);
      if (text && why) pairs.push(["the card", text, "Sarah's why", why]);
      if (expl && why) pairs.push(["its explanation", expl, "Sarah's why", why]);
    }
  }

  for (const [whatA, a, whatB, b] of pairs) {
    checked++;
    const run = sharedRun(a, b);
    if (!run) continue;
    const keep = KEEP.find((k) => k.week === w && run.includes(k.run));
    if (keep) {
      kept++;
      if (!SHOW_KEPT) continue;
      console.log(`\nweek ${w}: "${run}" twice, DELIBERATE`);
      console.log(`   ${keep.why}`);
      continue;
    }
    found++;
    console.log(`\nweek ${w}: "${run}" is said twice, on screen together`);
    console.log(`   ${whatA.padEnd(18)}: ${a}`);
    console.log(`   ${whatB.padEnd(18)}: ${b}`);
  }
}

const note = kept ? ` (${kept} deliberate repeat(s) allowed; --all to see them)` : "";
console.log(`\n${checked} pair(s) that play together compared, ${found} echo(es).${note}`);
process.exit(found ? 1 : 0);

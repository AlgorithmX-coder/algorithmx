#!/usr/bin/env node
/**
 * audit-verdict-voice.mjs — OWNER MANDATE (2026-09-12, all 20 weeks):
 * "When they answer correctly, Sarah narrates that they answered correctly and
 *  why; when they answer incorrectly, Sarah tells them why."
 *
 * For every exercise item in a week this prints what Sarah will SAY on a right
 * and on a wrong answer (the shared lead + the reason field each engine speaks,
 * with the same fallback chain the component uses) and flags:
 *   - MISSING   the item has no reason for that outcome (lead only)
 *   - UNRECORDED the reason text has no clip in public/audio/voice/manifest.json
 *
 * Usage: node scripts/audit-verdict-voice.mjs --week=3 [--week=15] [--all] [--strict] [--quiet]
 * --strict exits 1 on any MISSING (UNRECORDED is a warning until the clips are
 * generated with scripts/elevenlabs-generate-narration.mjs).
 * --pairs-json prints ONLY a JSON array of { verdict, why } for every real
 * reason, which the narration recorder uses to record each verdict as one take.
 */
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const weeks = args.filter((a) => a.startsWith("--week=")).map((a) => Number(a.slice(7)));
const all = args.includes("--all");
const strict = args.includes("--strict");
const quiet = args.includes("--quiet");
const pairsJson = args.includes("--pairs-json");
const printLine = console.log;
if (pairsJson) console.log = () => {};
const pairs = new Map();
const WEEKS = all ? Array.from({ length: 20 }, (_, i) => i + 1) : weeks.length ? weeks : [3];

const STR = '"((?:[^"\\\\]|\\\\.)*)"';
const un = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
const fld = (span, k) => { const m = span.match(new RegExp("\\b" + k + ":\\s*" + STR)); return m ? un(m[1]) : null; };
const flag = (span, k) => { const m = span.match(new RegExp("\\b" + k + ":\\s*(true|false)")); return m ? m[1] === "true" : null; };
/** Split `<listKey>: [ {..}, {..} ]` into object source strings (depth-aware). */
const objs = (span, listKey) => {
  const i = span.search(new RegExp("\\b" + listKey + ":\\s*\\[")); if (i < 0) return [];
  const a = span.indexOf("[", i); let depth = 0, start = -1; const out = [];
  for (let j = a; j < span.length; j++) {
    const ch = span[j];
    if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) break; }
    else if (ch === "{") { if (depth === 1) start = j; depth++; }
    else if (ch === "}") { depth--; if (depth === 1 && start >= 0) { out.push(span.slice(start, j + 1)); start = -1; } }
  }
  return out;
};
const first = (o, keys) => { for (const k of keys) { const v = fld(o, k); if (v) return v; } return null; };

/**
 * Per engine: how items are listed and which fields Sarah speaks.
 *   items: (span) => [{ label, right: text|null, wrong: text|null, note }]
 * "right"/"wrong" follow the component's fallback chain exactly. `null` = lead only.
 * Engines with no answers (reveal) or whose verdicts are spoken elsewhere
 * (quizBoss) are listed as "n/a".
 */
const ENGINES = {
  quickCheck: (span) => {
    const teach = /teachNarration:\s*\{/.test(span);
    const nudge = fld(span, "nudge");
    const mode = fld(span, "mode");
    return objs(span, "choices").map((o) => {
      const ok = flag(o, "isCorrect"); const why = fld(o, "why");
      return ok
        ? { label: "OK " + fld(o, "text"), right: teach ? "(teachNarration)" : why, wrong: null, only: "right" }
        : { label: "X  " + fld(o, "text"), right: null, wrong: mode === "order" ? nudge : (why ?? nudge), only: "wrong" };
    });
  },
  conveyorSort: (span) => objs(span, "items").map((o) => ({ label: fld(o, "text"), right: first(o, ["why", "explanation"]), wrong: fld(o, "explanation") })),
  clueBoard: (span) => objs(span, "options").map((o) => { const ok = flag(o, "isCorrect"); return ok ? { label: "OK " + fld(o, "text"), right: first(o, ["why", "explanation"]), wrong: null, only: "right" } : { label: "X  " + fld(o, "text"), right: null, wrong: fld(o, "explanation"), only: "wrong" }; }),
  senderLineup: (span) => objs(span, "rounds").flatMap((r) => objs(r, "senders").map((o) => { const fake = flag(o, "isFake"); return fake ? { label: "FAKE " + fld(o, "name"), right: first(o, ["why", "note"]), wrong: null, only: "right" } : { label: "real " + fld(o, "name"), right: null, wrong: fld(o, "note"), only: "wrong" }; })),
  trailStamper: (span) => objs(span, "spots").flatMap((sp) => objs(sp, "options").map((o) => { const proud = flag(o, "isProud"); return proud ? { label: "PROUD " + fld(o, "label"), right: first(o, ["why", "note"]), wrong: null, only: "right" } : { label: "regret " + fld(o, "label"), right: null, wrong: fld(o, "note"), only: "wrong" }; })),
  cyberScanner: (span) => objs(span, "items").map((o) => ({ label: fld(o, "text"), right: first(o, ["why", "explanation"]), wrong: fld(o, "explanation") })),
  chooseYourPath: (span) => objs(span, "scenarios").flatMap((sc) => objs(sc, "choices").map((o) => { const safe = flag(o, "isSafe"); return safe ? { label: "SAFE " + fld(o, "text"), right: fld(o, "consequence"), wrong: null, only: "right" } : { label: "risky " + fld(o, "text"), right: null, wrong: fld(o, "consequence"), only: "wrong" }; })),
  // Mismatches are SILENT by owner decision 2026-09-14: turning over two cards
  // that don't pair is information gathering in a memory game, not a wrong
  // answer. Only the match side speaks.
  memoryMatch: (span) => objs(span, "pairs").map((o) => ({ label: fld(o, "term") + " = " + fld(o, "match"), right: fld(o, "why"), wrong: "n/a" })),
  threeRandomWords: (span) => [{ label: "the build", right: fld(span, "whyRight"), wrong: null, only: "right" }],
  passwordHospital: (span) => objs(span, "patients").map((o) => ({ label: fld(o, "password"), right: first(o, ["why", "diagnosisExplanation"]), wrong: fld(o, "diagnosisExplanation") })),
  weakSorter: (span) => objs(span, "items").map((o) => ({ label: fld(o, "text"), right: first(o, ["why", "explanation"]), wrong: fld(o, "explanation") })),
  signBingo: (span) => objs(span, "rounds").map((o) => ({ label: (fld(o, "scene") ?? "").slice(0, 50), right: fld(o, "why"), wrong: fld(o, "note") })),
  reveal: () => [{ label: "(no answers by design)", right: "n/a", wrong: "n/a" }],
  vaultDrop: (span) => objs(span, "items").map((o) => ({ label: fld(o, "text"), right: first(o, ["why", "explanation"]), wrong: fld(o, "explanation") })),
  requestInspector: (span) => objs(span, "requests").map((o) => ({ label: fld(o, "appName"), right: first(o, ["why", "verdictNote"]), wrong: fld(o, "verdictNote") })),
  usernameBuilder: (span) => objs(span, "parts").map((o) => { const trap = fld(o, "trap"); return trap ? { label: "trap " + fld(o, "text"), right: null, wrong: trap, only: "wrong" } : { label: "safe " + fld(o, "text"), right: fld(o, "why"), wrong: null, only: "right" }; }),
  stepOrder: (span) => { const ww = fld(span, "whyWrong") ?? (span.match(/tier1:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] ?? null; return objs(span, "steps").map((o) => ({ label: fld(o, "text"), right: fld(o, "affirmation"), wrong: ww })); },
  spamBlaster: (span) => objs(span, "emails").map((o) => { const ph = flag(o, "isPhishing"); return ph ? { label: "PHISH " + fld(o, "subject"), right: first(o, ["why", "clue"]), wrong: "(panel: filled missExplanation)" } : { label: "real  " + fld(o, "subject"), right: fld(o, "why") ?? "(silent: not an answer)", wrong: "(panel: filled safeWrongExplanation)" }; }),
  plaquePeek: (span) => objs(span, "doors").map((o) => ({ label: fld(o, "name") ?? fld(o, "claim"), right: first(o, ["why", "note"]), wrong: fld(o, "note") })),
  profileInspector: (span) => objs(span, "profiles").map((o) => ({ label: fld(o, "handle"), right: first(o, ["why", "verdictNote"]), wrong: fld(o, "verdictNote") })),
  clueStamper: (span) => objs(span, "cases").flatMap((o) => {
    const handle = fld(o, "handle");
    const rows = [{ label: "case " + handle, right: fld(o, "rightWhy"), wrong: null, only: "right" }];
    for (const c of objs(o, "clues")) rows.push({ label: "  clue " + fld(c, "id") + (flag(c, "isRedFlag") ? " (sneaky)" : " (fine)"), right: null, wrong: fld(c, "teach"), only: "wrong" });
    return rows;
  }),
  popupPanic: (span) => objs(span, "popups").map((o) => ({ label: fld(o, "title") ?? fld(o, "from"), right: fld(o, "whyTrick"), wrong: fld(o, "whyTrick") })),
  cyberMaze: (span) => objs(span, "questions").map((o) => ({ label: (fld(o, "question") ?? "").slice(0, 50), right: fld(o, "why"), wrong: fld(o, "explanation") })),
  chatSimulator: (span) => objs(span, "choices").flatMap((g) => objs(g, "options").map((o) => { const safe = flag(o, "isSafe"); return safe ? { label: "SAFE " + fld(o, "text"), right: fld(o, "feedback"), wrong: null, only: "right" } : { label: "risky " + fld(o, "text"), right: null, wrong: fld(o, "feedback"), only: "wrong" }; })),
  teamPoster: (span) => objs(span, "tiles").map((o) => { const team = flag(o, "isTeam"); return team ? { label: "TEAM " + fld(o, "label"), right: fld(o, "note"), wrong: null, only: "right" } : { label: "decoy " + fld(o, "label"), right: null, wrong: fld(o, "note"), only: "wrong" }; }),
  // Week 4 engines (2026-09-16).
  stringsAttached: (span) => objs(span, "offers").map((o) => ({ label: (fld(o, "text") ?? "").slice(0, 50), right: fld(o, "why"), wrong: fld(o, "nudge") })),
  believeOMeter: (span) => objs(span, "offers").map((o) => ({ label: (fld(o, "text") ?? "").slice(0, 50), right: fld(o, "why"), wrong: fld(o, "whyWrong") })),
  nameTagCheck: (span) => objs(span, "cases").flatMap((o) => {
    const rows = [{ label: "tag " + fld(o, "id"), right: fld(o, "rightWhy"), wrong: null, only: "right" }];
    for (const c of objs(o, "chunks")) rows.push({ label: "  piece " + fld(c, "text") + (flag(c, "isWrong") ? " (swapped)" : " (same)"), right: null, wrong: fld(c, "teach"), only: "wrong" });
    return rows;
  }),
  firewallBuilder: (span) => objs(span, "bricks").map((o) => ({ label: (flag(o, "good") ? "GOOD " : "bad  ") + fld(o, "text"), right: fld(o, "why"), wrong: fld(o, "whyWrong") })),
  passwordVault: (span) => objs(span, "locks").flatMap((l) => objs(l, "choices").map((o) => { const ok = flag(o, "isCorrect"); return ok ? { label: fld(l, "ruleLabel") + " OK " + fld(o, "text"), right: fld(o, "why"), wrong: null, only: "right" } : { label: fld(l, "ruleLabel") + " X  " + fld(o, "text"), right: null, wrong: fld(o, "explanation"), only: "wrong" }; })),
  phishInspector: (span) => objs(span, "emails").map((o) => ({ label: (flag(o, "isPhishing") ? "TRICK " : "real  ") + fld(o, "subject"), right: fld(o, "why"), wrong: fld(o, "whyWrong") })),
  // Week 5 engines (2026-09-16).
  dayBalancer: (span) => objs(span, "swaps").flatMap((s) => objs(s, "options").map((o) => { const ok = flag(o, "isBalancing"); return ok ? { label: "OK " + fld(o, "label"), right: fld(o, "why"), wrong: null, only: "right" } : { label: "X  " + fld(o, "label"), right: null, wrong: fld(o, "note"), only: "wrong" }; })),
  growthRings: () => [{ label: "(no answers by design: the read-aloud is the payoff)", right: "n/a", wrong: "n/a" }],
  passcodeForge: (span) => objs(span, "rounds").flatMap((r) => objs(r, "options").map((o) => { const ok = flag(o, "isStrong"); return ok ? { label: "OK " + fld(o, "digits"), right: fld(o, "why"), wrong: null, only: "right" } : { label: "X  " + fld(o, "digits"), right: null, wrong: fld(o, "explanation"), only: "wrong" }; })),
  accountRescue: (span) => objs(span, "accounts").map((o) => ({ label: fld(o, "label"), right: fld(o, "why"), wrong: fld(o, "whyWrong") })),
  dontFeedTheFire: (span) => {
    const rows = objs(span, "sparks").map((o) => ({ label: "spark " + fld(o, "from"), right: fld(o, "why"), wrong: null, only: "right" }));
    const fr = span.match(/friendRound:\s*\{[\s\S]*?\}/);
    if (fr) rows.push({ label: "friend " + fld(fr[0], "from"), right: fld(fr[0], "why"), wrong: null, only: "right" });
    for (const k of ["teachSpark", "teachFriend", "teachStoneOnFriend"]) {
      const t = span.match(new RegExp(k + ":\\s*\\{[\\s\\S]*?\\}"));
      if (t) rows.push({ label: "  " + k, right: null, wrong: fld(t[0], "body"), only: "wrong" });
    }
    return rows;
  },
  snowballChase: () => [{ label: "(no answers by design: a demonstration)", right: "n/a", wrong: "n/a" }],
  signature: (span) => [{ label: "mechanic " + fld(span, "mechanic"), right: "(component: claim.fact)", wrong: "(component: nudge)" }],
  bossBattle: () => [{ label: "QuizBoss", right: "(teachOnWrong.explanation)", wrong: "(teachOnWrong.explanation)" }],
};

let manifest = null;
try { manifest = JSON.parse(readFileSync("public/audio/voice/manifest.json", "utf8")); } catch { /* none yet */ }
const recorded = new Set((manifest?.entries ?? []).map((e) => e.text));
const isRecorded = (t) => recorded.has(t.replace(/\s+/g, " ").trim());

let missing = 0, unrecorded = 0, items = 0;
for (const w of WEEKS) {
  const p = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(p)) continue;
  const src = readFileSync(p, "utf8");
  const start = src.indexOf("  screens: [");
  const starts = [...src.slice(start).matchAll(/^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm)].map((m) => ({ t: m[1], o: start + m.index }));
  console.log(`\n=== WEEK ${w} · spoken verdicts`);
  starts.forEach((st, i) => {
    const fn = ENGINES[st.t]; if (!fn) return;
    const span = src.slice(st.o, i + 1 < starts.length ? starts[i + 1].o : src.length);
    const rows = fn(span);
    console.log(`\n[${i}] ${st.t}`);
    for (const r of rows) {
      items++;
      const cell = (txt, kind) => {
        if (txt === "n/a") return "n/a";
        if (r.only && r.only !== kind) return "·";
        if (txt == null) { missing++; return "MISSING (lead only)"; }
        if (txt.startsWith("(")) return txt;
        pairs.set(`${kind}::${txt}`, { verdict: kind, why: txt });
        const rec = isRecorded(txt) ? "" : (unrecorded++, " [UNRECORDED]");
        return (quiet ? txt.slice(0, 60) : txt) + rec;
      };
      const right = cell(r.right, "right"), wrong = cell(r.wrong, "wrong");
      console.log(`  - ${r.label}`);
      if (right !== "·") console.log(right === "n/a" ? "      right: (silent by design)" : `      right: "That's right!" + ${right}`);
      if (wrong !== "·") console.log(wrong === "n/a" ? "      wrong: (silent by design)" : `      wrong: "Not quite." + ${wrong}`);
    }
  });
}
console.log(`\n${items} items · ${missing} MISSING reason(s) · ${unrecorded} unrecorded text(s)`);
if (pairsJson) printLine(JSON.stringify([...pairs.values()]));
if (strict && missing) process.exit(1);

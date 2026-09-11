// Dialogue-continuity audit for a Cyber Heroes week (owner mandate 2026-09-11).
//
// Prints the week's FULL spoken transcript in play order (so it can be read as one
// script) and lints every screen seam. Run it before generating audio; the bar is
// 0 flags — then READ the transcript: the machine catches patterns, a human catches
// meaning (a prove-it whose topic differs from its concept, a dropped promise).
//
//   node scripts/audit-narration-flow.mjs --week=2            # one week
//   node scripts/audit-narration-flow.mjs --week=1 --week=15  # several
//   node scripts/audit-narration-flow.mjs --all --quiet       # lints only, all weeks
//   add --strict to exit 1 when any flag is raised (CI / pre-ship gate)
//
// THE MODEL (Week 15, 0 breaks): recap = praise -> restate -> cliffhanger AND the
// lesson bridge in the same breath ("...has a secret... Next, we'll learn how X.
// Come and see!") -> the next Learn opens by NAMING X -> every Learn closes with an
// invite naming its game -> every game ends with a spoken payoff -> the final recap
// promises the REVIEW (which comes before the boss), never the boss itself.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const weeks = args.filter((a) => a.startsWith("--week=")).map((a) => a.split("=")[1]);
const all = args.includes("--all");
const quiet = args.includes("--quiet");
const strict = args.includes("--strict");
const DIR = "app/lesson/weekContent";
const files = all
  ? readdirSync(DIR).filter((f) => /^week\d+\.ts$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0])).map((f) => DIR + "/" + f)
  : weeks.map((w) => DIR + "/week" + w + ".ts");
if (!files.length) { console.error("usage: node scripts/audit-narration-flow.mjs --week=N [--week=M] | --all [--quiet] [--strict]"); process.exit(2); }

const PASSIVE = new Set(["video", "alert", "weekIntro", "mission", "info", "recap", "missionDebrief", "stickerUnlock", "completion", "threat", "bossBattle"]);
const BLOCK_ORDER = { narration: 1, coachLines: 2, promptNarration: 3, teachNarration: 4, winNarration: 5, completeNarration: 6 };
const blockRe = /(narration|coachLines|teachNarration|completeNarration|promptNarration|winNarration):\s*\{\s*speaker:\s*"(adam|layla|narrator)",\s*lines:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
// Screen starts: a `type: "x"` at the start of a line, optionally preceded by `{ ` for one-line screens.
const typeRe = /^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm;
const strRe = /"([^"]*)"/g;

const clean = (s) => s.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
const norm = (s) => clean(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter(Boolean);
const grams = (ws, n) => { const out = new Set(); for (let i = 0; i + n <= ws.length; i++) out.add(ws.slice(i, i + n).join(" ")); return out; };
function field(span, key) { const m = span.match(new RegExp("\\b" + key + ":\\s*\"([^\"]*)\"")); return m ? m[1] : null; }

let totalFlags = 0;
for (const file of files) {
  if (!existsSync(file)) { console.error("missing " + file); continue; }
  const src = readFileSync(file, "utf8");
  const wk = file.match(/week(\d+)/)[1];
  const starts = []; let m;
  while ((m = typeRe.exec(src)) !== null) starts.push({ type: m[1], off: m.index });
  const screens = starts.map((s, i) => ({ i, type: s.type, span: src.slice(s.off, i + 1 < starts.length ? starts[i + 1].off : src.length), blocks: [] }));
  blockRe.lastIndex = 0;
  while ((m = blockRe.exec(src)) !== null) {
    const lines = []; let s; strRe.lastIndex = 0;
    while ((s = strRe.exec(m[3])) !== null) if (s[1].trim()) lines.push(s[1].trim());
    let owner = -1; for (let i = 0; i < starts.length; i++) if (starts[i].off < m.index) owner = i;
    if (owner >= 0 && lines.length) screens[owner].blocks.push({ kind: m[1], lines, order: BLOCK_ORDER[m[1]] || 9 });
  }

  const out = []; const spoken = []; const flags = [];
  out.push("################ WEEK " + wk + " SPOKEN TRANSCRIPT (" + screens.length + " screens) ################");
  for (const sc of screens) {
    const title = field(sc.span, "title") || field(sc.span, "introTitle") || "";
    out.push(""); out.push("=== [" + sc.i + "] " + sc.type + (title ? "  --  " + title : "") + " ===");
    const rac = field(sc.span, "raccoonLine"); if (rac) out.push("  (Raccoon, on-screen text)  " + rac);
    const learned = field(sc.span, "learned"); if (learned) out.push("  (card)  YOU JUST LEARNED: " + learned);
    const next = sc.type === "recap" ? field(sc.span, "next") : null; if (next) out.push("  (pill)  Up next: " + next);
    if (sc.type === "quickCheck") { const p = field(sc.span, "prompt"); if (p) out.push("  (Sarah) prove-it question: " + p); }
    sc.blocks.sort((a, b) => a.order - b.order);
    const flat = [];
    for (const b of sc.blocks) { out.push("  [" + b.kind + "]"); for (const l of b.lines) { out.push("      " + clean(l)); flat.push(clean(l)); } }
    const isExercise = !PASSIVE.has(sc.type) && sc.type !== "quickCheck";
    const hasPayoff = sc.blocks.some((b) => b.kind === "completeNarration" || b.kind === "winNarration");
    if (isExercise && sc.blocks.length && !hasPayoff) flags.push({ where: "[" + sc.i + " " + sc.type + "]", rule: "NO SPOKEN PAYOFF - exercise has no completeNarration/winNarration (every game should end with the you-are-protected line)" });
    if (flat.length) spoken.push({ i: sc.i, type: sc.type, first: flat[0], last: flat[flat.length - 1], all: flat, blocks: sc.blocks });
    else out.push("  (no spoken lines)");
  }

  // Seam lints: closer of N vs opener of N+1 (over spoken screens only).
  let prev = null;
  for (const sp of spoken) {
    if (prev) {
      const aRaw = clean(prev.last), bRaw = clean(sp.first);
      const A = words(aRaw), B = words(bRaw); const r = [];
      if (A.length >= 2 && B.length >= 2 && A[0] === B[0] && A[1] === B[1]) r.push("ECHO - same opening words");
      if (A.includes("next") && B.slice(0, 3).includes("next")) r.push("ECHO - next / next");
      const shared = [...grams(A, 4)].filter((g) => grams(B, 4).has(g)); if (shared.length) r.push("ECHO - repeated phrase: " + shared[0]);
      if (A.length && B.length && A[A.length - 1] === B[0] && A[A.length - 1].length > 3) r.push("ECHO - closer ends on the word the opener starts with");
      if (prev.type === "recap") {
        const hasBridge = prev.all.some((l) => /\bnext,|we.ll learn|we will learn|let.s learn|learn how|learn to/i.test(l));
        const cliff = /(\.\.\.|…)\s*$/.test(aRaw) || /\b(of all|secret|trick|watch this|guess what)\W*$/i.test(aRaw);
        if (cliff && !hasBridge) r.push("CLIFFHANGER WITHOUT A LESSON BRIDGE - the recap sets something up but never says what we learn next; the next opener must pay it off");
        if (/let.?s (get |go|start|play|sort|build|try|forge)|time to (play|sort)|ready to (play|sort)/i.test(aRaw) && sp.type === "info") r.push("FALSE ACTION PROMISE - recap promises an activity but a Learn screen is next");
        if (/^next up/i.test(aRaw)) r.push("recap says Next up - use a lesson bridge (Next, we'll learn...)");
        if (/\b(boss|showdown|who.?s boss|big test)\b/i.test(aRaw) && !/^(bossBattle|quizBoss)$/.test(sp.type) && !PASSIVE.has(sp.type)) r.push("ORDER PROMISE - recap promises the boss but the next screen is " + sp.type);
      }
      if (prev.type === "info" && sp.type !== "quickCheck" && !PASSIVE.has(sp.type)) {
        // An invite is either an imperative closer ("...check every line!") or one that
        // names the hand-off ("Let's inspect some forms, detective."). Only a flat,
        // full-stop statement with neither gets flagged.
        const invites = /\b(let.s|ready|come on|time to|go|your turn|grab|tap|here we go|we learn|practise|practice)\b/i.test(aRaw);
        if (!/!$/.test(aRaw) && !invites) r.push("LEARN ENDS FLAT - no invite into the game (W15 style: Let's go and practise...!)");
        const bw = words(sp.first);
        if (/^ready/i.test(aRaw) && bw.includes("ready")) r.push("ECHO - Ready? on the Learn and Ready? on the game intro");
      }
      if (r.length) { flags.push({ where: "[" + prev.i + " " + prev.type + "] -> [" + sp.i + " " + sp.type + "]", rule: r.join("; "), closes: aRaw, opens: bRaw }); }
    }
    prev = sp;
  }

  out.push(""); out.push("---------------- CONTINUITY FLAGS ----------------");
  for (const f of flags) { out.push("FLAG " + f.where + "  " + f.rule); if (f.closes) { out.push("     closes: " + f.closes); out.push("     opens:  " + f.opens); } }
  out.push("flags: " + flags.length);
  totalFlags += flags.length;
  if (!quiet) console.log(out.join("\n") + "\n"); else console.log("week" + wk + ": " + flags.length + " flags" + (flags.length ? "\n  " + flags.map((f) => f.where + " " + f.rule.split(";")[0]).join("\n  ") : ""));
}
if (strict && totalFlags > 0) process.exit(1);

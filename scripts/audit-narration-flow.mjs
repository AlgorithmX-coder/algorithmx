// Dialogue-continuity audit for a Cyber Heroes week (owner mandate 2026-09-11).
//
// TWO LAYERS, both must flow (owner: "differentiate between the dialogues on all the
// other main pages and the dialogues within the exercises. They both need to continue
// and flow"):
//
//   1. SCREEN SEAMS  - the closing line of screen N vs the opening line of screen N+1
//                      (recap -> Learn -> game intro -> ...). The model is Week 15.
//   2. BEAT CHAINS   - the ordered beats INSIDE one exercise: a reveal vignette card by
//                      card, a decide scenario's setup -> consequence, an inspection's
//                      notes -> nudge -> verdict, step affirmations, a bingo scene -> why,
//                      the boss's ask -> reaction -> teach. When the child taps "next", the
//                      next card must CONTINUE the last one, never start a new topic.
//
// Prints the full spoken transcript (screens) and every beat chain so both can be read
// as one script, then lints. Run it before generating audio; the bar is 0 flags on both
// layers. Then READ it: the machine catches patterns, a human catches meaning.
//
//   node scripts/audit-narration-flow.mjs --week=2            # one week
//   node scripts/audit-narration-flow.mjs --week=1 --week=15  # several
//   node scripts/audit-narration-flow.mjs --all --quiet       # lints only, all weeks
//   add --strict to exit 1 when any flag is raised (CI / pre-ship gate)
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
const STR = '"((?:[^"\\\\]|\\\\.)*)"';

const un = (s) => s.replace(/\\"/g, '"');
const clean = (s) => s.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
const norm = (s) => clean(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter(Boolean);
const grams = (ws, n) => { const out = new Set(); for (let i = 0; i + n <= ws.length; i++) out.add(ws.slice(i, i + n).join(" ")); return out; };
function field(span, key) { const m = span.match(new RegExp("\\b" + key + ":\\s*\"([^\"]*)\"")); return m ? m[1] : null; }
const STOP = new Set(["the", "that", "this", "your", "you", "with", "from", "they", "them", "their", "have", "will", "what", "when", "into", "just", "like", "then", "than", "about", "every", "some", "more", "ever", "even", "only", "also", "very", "here", "there", "would", "could", "does", "dont", "never", "right", "really", "thats", "youre", "were", "where", "which", "while", "still", "been", "being", "gets", "make", "makes", "need", "needs", "know", "knows", "and", "for", "are", "but", "not", "all", "can", "has", "was", "one", "two", "its", "his", "her", "out", "now", "get", "got", "did", "too", "any", "our", "who", "how", "why", "say", "see", "use", "way", "day", "off", "own", "yet", "let", "lets", "him", "she", "its", "had", "may", "new", "old", "big", "put", "each", "than", "over", "back", "down", "come", "goes", "went", "take", "give", "keep", "kept", "tell", "told", "want", "wants", "thing", "things", "stuff", "hero", "heroes", "sure", "little", "whole", "much", "many", "most", "away", "again", "always", "someone", "anyone", "nobody", "something", "anything", "nothing", "everything", "real", "really"]);
const CONNECT = /^(\.\.\.|…|and\b|then\b|so\b|but\b|now\b|next\b|he\b|he'd\b|he'll\b|he's\b|she\b|it\b|it's\b|they\b|they'd\b|his\b|her\b|that\b|that's\b|this\b|or\b|until\b|before\b|after\b|when\b|which\b|who\b|because\b|first\b|last\b|finally\b|in between\b|out\b|there\b|yes\b|exactly\b|spot on\b|busted\b|nope\b|not\b|think\b|real\b|caught\b|right\b|wrong\b|no\b|oops\b|ouch\b|ow\b|aww+\b|hmm+\b|perfect\b|great\b|brilliant\b|correct\b|good\b|well done\b|nice\b|too easy\b|zipped\b|plop\b|together\b)/i;
const content = (s) => new Set(words(s).filter((w) => w.length >= 3 && !STOP.has(w)));

/** Lint one hand-off A -> B (spoken A closes, spoken B opens).
 *  `mode` = "seam" | "chain" | "branch" | "checklist" (echo only: a fixed Q&A checklist
 *  like the four inspection questions is allowed to change topic per question).
 *  `ctx` = extra text B is allowed to link to (the option the child tapped, the photo's
 *  detail line...) - a reaction answers the CHOICE, not just the question. */
function lintPair(aRaw, bRaw, mode, ctx = "") {
  const A = words(aRaw), B = words(bRaw); const r = [];
  const bStartsContinuation = /^(\.\.\.|…)/.test(bRaw.trim()) || /^[a-z]/.test(bRaw.trim()) || CONNECT.test(bRaw.trim());
  if (A.length >= 2 && B.length >= 2 && A[0] === B[0] && A[1] === B[1]) r.push("ECHO - same opening words");
  const shared = [...grams(A, 4)].filter((g) => grams(B, 4).has(g)); if (shared.length && !bStartsContinuation) r.push("ECHO - repeated phrase: " + shared[0]);
  if (A.length && B.length && A[A.length - 1] === B[0] && A[A.length - 1].length > 3 && !bStartsContinuation) r.push("ECHO - closer ends on the word the opener starts with");
  if (mode === "chain" || mode === "branch") {
    const dangling = /(\.\.\.|…)\s*$/.test(aRaw.trim());
    if (dangling && !bStartsContinuation) r.push("ELLIPSIS LEFT HANGING - the beat trails off but the next card starts a fresh sentence");
    const ca = content(aRaw + " " + ctx), cb = content(bRaw);
    const link = [...cb].some((w) => ca.has(w) || [...ca].some((x) => x.length >= 5 && w.length >= 5 && (x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5)))));
    // a password-like option ("S3a$hell9Wave!") has no words to link to: skip the check
    const ctxIsCode = ctx.trim() && content(ctx).size === 0;
    if (!link && !bStartsContinuation && !ctxIsCode) r.push("NO LINK - the next card shares no word or connective with the last one (reads as a new topic)");
  }
  return r;
}

/** Extract the ordered beat chains inside one exercise screen span. */
function chainsFor(type, span) {
  const chains = [];
  const all = (re, src) => [...src.matchAll(re)].map((m) => un(m[1]));
  if (type === "reveal") {
    const re = new RegExp("label:\\s*" + STR + "[\\s\\S]*?steps:\\s*\\[([\\s\\S]*?)\\]\\s*,\\s*counter:\\s*" + STR, "g");
    let m; while ((m = re.exec(span)) !== null) {
      const beats = all(new RegExp("text:\\s*" + STR, "g"), m[2]);
      chains.push({ name: "reveal card: " + un(m[1]), mode: "chain", beats: [...beats, un(m[3])] });
    }
  }
  if (type === "chooseYourPath") {
    const parts = span.split(/\bsetup:\s*/).slice(1);
    for (const p of parts) {
      const s = p.match(new RegExp("^" + STR)); if (!s) continue;
      // each consequence answers the CHOICE the child tapped: link against choice text too
      const cons = [...p.matchAll(new RegExp("text:\\s*" + STR + "[^}]*?consequence:\\s*" + STR, "g"))].map((m) => ({ beat: un(m[2]), ctx: un(m[1]) }));
      chains.push({ name: "decide moment: " + un(s[1]).slice(0, 48) + "...", mode: "branch", beats: [un(s[1])], branches: cons });
    }
  }
  if (type === "requestInspector") {
    const parts = span.split(/\bappName:\s*/).slice(1);
    for (const p of parts) {
      const nm = p.match(new RegExp("^" + STR)); if (!nm) continue;
      const pairs = [...p.matchAll(new RegExp("label:\\s*" + STR + ",\\s*note:\\s*" + STR, "g"))].map((m) => un(m[1]) + " " + un(m[2]));
      const nudge = field(p, "nudge"), verdict = field(p, "verdictNote");
      // the four inspection questions are a fixed checklist (topic changes per question by
      // design); the nudge -> verdict hand-off is a real chain.
      chains.push({ name: "inspection: " + un(nm[1]), mode: "checklist", beats: pairs });
      if (nudge && verdict) chains.push({ name: "inspection verdict: " + un(nm[1]), mode: "chain", beats: [pairs[pairs.length - 1] || "", nudge, verdict].filter(Boolean) });
    }
  }
  if (type === "stepOrder") {
    const beats = all(new RegExp("affirmation:\\s*" + STR, "g"), span);
    if (beats.length) chains.push({ name: "steps land", mode: "chain", beats });
  }
  if (type === "signBingo") {
    const parts = span.split(/\bscene:\s*/).slice(1);
    for (const p of parts) {
      const sc = p.match(new RegExp("^" + STR)); if (!sc) continue;
      const why = field(p, "why"), note = field(p, "note");
      if (why) chains.push({ name: "bingo round: " + un(sc[1]).slice(0, 40) + "...", mode: "chain", beats: [un(sc[1]), why] });
      if (note) chains.push({ name: "bingo round (wrong tap): " + un(sc[1]).slice(0, 40) + "...", mode: "branch", beats: [un(sc[1])], branches: [note] });
    }
  }
  if (type === "senderLineup") {
    const parts = span.split(/\bprompt:\s*/).slice(1);
    for (const p of parts) {
      const pr = p.match(new RegExp("^" + STR)); if (!pr) continue;
      // each note answers the photo the child tapped: link against its name + detail line
      const notes = [...p.matchAll(new RegExp("name:\\s*" + STR + "[^}]*?detail:\\s*" + STR + "[^}]*?note:\\s*" + STR, "g"))].map((m) => ({ beat: un(m[3]), ctx: un(m[1]) + " " + un(m[2]) }));
      chains.push({ name: "line-up: " + un(pr[1]).slice(0, 40) + "...", mode: "branch", beats: [un(pr[1])], branches: notes });
    }
  }
  if (type === "signature") {
    const claim = field(span, "claim"), evidence = field(span, "evidence");
    if (claim && evidence) chains.push({ name: "guided round", mode: "chain", beats: [claim, evidence] });
  }
  return chains;
}

/** Boss chains: intro -> each ask -> villain right / wrong -> teach -> victory. */
function bossChains(src) {
  const start = src.indexOf("bossQuiz:"); if (start < 0) return [];
  const boss = src.slice(start);
  const chains = [];
  const intro = boss.match(new RegExp("intro:\\s*\\{[^}]*?text:\\s*" + STR));
  const victory = boss.match(new RegExp("victory:\\s*\\{[^}]*?text:\\s*" + STR));
  const qs = boss.split(/\bphaseId:\s*/).slice(1);
  for (const q of qs) {
    const ask = q.match(new RegExp("ask:\\s*\\{[^}]*?text:\\s*" + STR)); if (!ask) continue;
    const right = q.match(new RegExp("villainRight:\\s*\\{[^}]*?text:\\s*" + STR));
    const wrong = q.match(new RegExp("villainWrong:\\s*\\{[^}]*?text:\\s*" + STR));
    const teach = q.match(new RegExp("explanation:\\s*" + STR));
    const label = field(q, "label") || "question";
    // Callum reacts to the OPTION the child tapped (authored correct option first):
    // link reactions against the options, not only the question.
    const optBlock = q.match(/options:\s*\[([\s\S]*?)\]/);
    const options = optBlock ? [...optBlock[1].matchAll(new RegExp("text:\\s*" + STR, "g"))].map((m) => un(m[1])) : [];
    const ci = Number((q.match(/correctIndex:\s*(\d+)/) || [])[1] || 0);
    const rightOpt = options[ci] || "", wrongOpts = options.filter((_, i) => i !== ci).join(" ");
    chains.push({ name: "boss " + label + " (right)", mode: "branch", beats: [un(ask[1])], branches: right ? [{ beat: un(right[1]), ctx: rightOpt }] : [] });
    // the villain's wrong-answer bark may gloat about the answer the child MISSED, so
    // both hand-offs may link to any option
    chains.push({ name: "boss " + label + " (wrong -> teach)", mode: "chain", beats: [un(ask[1]), ...(wrong ? [un(wrong[1])] : []), ...(teach ? [un(teach[1])] : [])], ctx: [options.join(" ") + " " + wrongOpts, options.join(" ")] });
  }
  if (intro) chains.unshift({ name: "boss intro", mode: "chain", beats: [un(intro[1])] });
  if (victory) chains.push({ name: "boss victory", mode: "chain", beats: [un(victory[1])] });
  return chains;
}

let totalSeam = 0, totalChain = 0;
for (const file of files) {
  if (!existsSync(file)) { console.error("missing " + file); continue; }
  const src = readFileSync(file, "utf8");
  const wk = file.match(/week(\d+)/)[1];
  const scrStart = src.indexOf("  screens: [");
  const scrEnd = src.indexOf("\n  ],", scrStart);
  const scrSrc = scrStart >= 0 ? src.slice(scrStart, scrEnd) : src;
  const starts = []; let m;
  typeRe.lastIndex = 0;
  while ((m = typeRe.exec(scrSrc)) !== null) starts.push({ type: m[1], off: m.index });
  const screens = starts.map((s, i) => ({ i, type: s.type, span: scrSrc.slice(s.off, i + 1 < starts.length ? starts[i + 1].off : scrSrc.length), blocks: [] }));
  blockRe.lastIndex = 0;
  while ((m = blockRe.exec(scrSrc)) !== null) {
    const lines = []; let s; strRe.lastIndex = 0;
    while ((s = strRe.exec(m[3])) !== null) if (s[1].trim()) lines.push(s[1].trim());
    let owner = -1; for (let i = 0; i < starts.length; i++) if (starts[i].off < m.index) owner = i;
    if (owner >= 0 && lines.length) screens[owner].blocks.push({ kind: m[1], lines, order: BLOCK_ORDER[m[1]] || 9 });
  }

  const out = []; const spoken = []; const flags = []; const chainFlags = [];
  out.push("################ WEEK " + wk + " · LAYER 1: SCREEN TRANSCRIPT (" + screens.length + " screens) ################");
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

  // Layer 1 seam lints: closer of N vs opener of N+1 (over spoken screens only).
  let prev = null;
  for (const sp of spoken) {
    if (prev) {
      const aRaw = clean(prev.last), bRaw = clean(sp.first);
      const r = lintPair(aRaw, bRaw, "seam");
      const A = words(aRaw), B = words(bRaw);
      if (A.includes("next") && B.slice(0, 3).includes("next")) r.push("ECHO - next / next");
      if (prev.type === "recap") {
        const hasBridge = prev.all.some((l) => /\bnext,|we.ll learn|we will learn|let.s learn|learn how|learn to/i.test(l));
        const cliff = /(\.\.\.|…)\s*$/.test(aRaw) || /\b(of all|secret|trick|watch this|guess what)\W*$/i.test(aRaw);
        if (cliff && !hasBridge) r.push("CLIFFHANGER WITHOUT A LESSON BRIDGE - the recap sets something up but never says what we learn next; the next opener must pay it off");
        if (/let.?s (get |go|start|play|sort|build|try|forge)|time to (play|sort)|ready to (play|sort)/i.test(aRaw) && sp.type === "info") r.push("FALSE ACTION PROMISE - recap promises an activity but a Learn screen is next");
        if (/^next up/i.test(aRaw)) r.push("recap says Next up - use a lesson bridge (Next, we'll learn...)");
        if (/\b(boss|showdown|who.?s boss|big test)\b/i.test(aRaw) && !/^(bossBattle|quizBoss)$/.test(sp.type) && !PASSIVE.has(sp.type)) r.push("ORDER PROMISE - recap promises the boss but the next screen is " + sp.type);
      }
      if (prev.type === "info" && sp.type !== "quickCheck" && !PASSIVE.has(sp.type)) {
        const invites = /\b(let.s|ready|come on|time to|go|your turn|grab|tap|here we go|we learn|practise|practice)\b/i.test(aRaw);
        if (!/!$/.test(aRaw) && !invites) r.push("LEARN ENDS FLAT - no invite into the game (W15 style: Let's go and practise...!)");
        const bw = words(sp.first);
        if (/^ready/i.test(aRaw) && bw.includes("ready")) r.push("ECHO - Ready? on the Learn and Ready? on the game intro");
      }
      if (r.length) flags.push({ where: "[" + prev.i + " " + prev.type + "] -> [" + sp.i + " " + sp.type + "]", rule: r.join("; "), closes: aRaw, opens: bRaw });
    }
    prev = sp;
  }

  // Layer 2: beat chains inside each exercise + the boss.
  out.push(""); out.push("################ WEEK " + wk + " · LAYER 2: IN-EXERCISE BEAT CHAINS ################");
  const allChains = [];
  for (const sc of screens) for (const ch of chainsFor(sc.type, sc.span)) allChains.push({ ...ch, where: "[" + sc.i + " " + sc.type + "]" });
  for (const ch of bossChains(src)) allChains.push({ ...ch, where: "[boss]" });
  for (const ch of allChains) {
    out.push(""); out.push("--- " + ch.where + " " + ch.name + " ---");
    const brBeat = (b) => (typeof b === "string" ? b : b.beat);
    const brCtx = (b) => (typeof b === "string" ? "" : b.ctx || "");
    ch.beats.forEach((b, i) => out.push("   " + (i + 1) + ". " + clean(b)));
    if (ch.branches) ch.branches.forEach((b) => out.push("   -> " + (brCtx(b) ? "[" + clean(brCtx(b)) + "] " : "") + clean(brBeat(b))));
    if (ch.mode === "chain" || ch.mode === "checklist") {
      for (let i = 1; i < ch.beats.length; i++) {
        const ctx = Array.isArray(ch.ctx) ? ch.ctx[i - 1] || "" : "";
        const r = lintPair(clean(ch.beats[i - 1]), clean(ch.beats[i]), ch.mode, ctx);
        if (r.length) chainFlags.push({ where: ch.where + " " + ch.name + " beat " + i + " -> " + (i + 1), rule: r.join("; "), closes: clean(ch.beats[i - 1]), opens: clean(ch.beats[i]) });
      }
    } else if (ch.branches) {
      for (const br of ch.branches) {
        const r = lintPair(clean(ch.beats[0]), clean(brBeat(br)), "branch", brCtx(br));
        if (r.length) chainFlags.push({ where: ch.where + " " + ch.name, rule: r.join("; "), closes: clean(ch.beats[0]), opens: clean(brBeat(br)) });
      }
    }
  }

  out.push(""); out.push("---------------- LAYER 1 FLAGS: SCREEN SEAMS ----------------");
  for (const f of flags) { out.push("FLAG " + f.where + "  " + f.rule); if (f.closes) { out.push("     closes: " + f.closes); out.push("     opens:  " + f.opens); } }
  out.push("seam flags: " + flags.length);
  out.push(""); out.push("---------------- LAYER 2 FLAGS: BEAT CHAINS ----------------");
  for (const f of chainFlags) { out.push("FLAG " + f.where + "  " + f.rule); out.push("     last card: " + f.closes); out.push("     next card: " + f.opens); }
  out.push("chain flags: " + chainFlags.length);
  totalSeam += flags.length; totalChain += chainFlags.length;
  if (!quiet) console.log(out.join("\n") + "\n");
  else {
    console.log("week" + wk + ": " + flags.length + " seam flags, " + chainFlags.length + " chain flags");
    for (const f of flags) console.log("  SEAM  " + f.where + " " + f.rule.split(";")[0]);
    for (const f of chainFlags) console.log("  CHAIN " + f.where + " " + f.rule.split(";")[0]);
  }
}
if (strict && (totalSeam + totalChain) > 0) process.exit(1);

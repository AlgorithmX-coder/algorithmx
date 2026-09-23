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
  // Week 3 engines (rebuilt 2026-09-11).
  if (type === "plaquePeek") {
    // each card: the claim as it arrives -> the reveal as it lifts; the wrong-tap note answers the claim
    const parts = span.split(/\bclaim:\s*/).slice(1);
    for (const p of parts) {
      const c = p.match(new RegExp("^" + STR)); if (!c) continue;
      const address = field(p, "address"), note = field(p, "note");
      if (address) chains.push({ name: "peek card: " + un(c[1]).slice(0, 40) + "...", mode: "chain", beats: [un(c[1]), address] });
      if (note) chains.push({ name: "peek card (wrong call): " + un(c[1]).slice(0, 40) + "...", mode: "branch", beats: [un(c[1])], branches: [note] });
    }
  }
  if (type === "profileInspector") {
    const parts = span.split(/\bhandle:\s*/).slice(1);
    for (const p of parts) {
      const nm = p.match(new RegExp("^" + STR)); if (!nm) continue;
      const pairs = [...p.matchAll(new RegExp("label:\\s*" + STR + ",\\s*note:\\s*" + STR, "g"))].map((m) => un(m[1]) + " " + un(m[2]));
      const nudge = field(p, "nudge"), verdict = field(p, "verdictNote");
      chains.push({ name: "profile check: " + un(nm[1]), mode: "checklist", beats: pairs });
      if (nudge && verdict) chains.push({ name: "profile verdict: " + un(nm[1]), mode: "chain", beats: [pairs[pairs.length - 1] || "", nudge, verdict].filter(Boolean) });
    }
  }
  if (type === "clueStamper") {
    // each case: the read-aloud -> Sarah's why on the lock; each clue's teach answers the read-aloud
    const parts = span.split(/\bhandle:\s*/).slice(1);
    for (const p of parts) {
      const nm = p.match(new RegExp("^" + STR)); if (!nm) continue;
      const read = field(p, "readAloud"), right = field(p, "rightWhy");
      const teaches = all(new RegExp("teach:\\s*" + STR, "g"), p);
      if (read && right) chains.push({ name: "case closed: " + un(nm[1]), mode: "chain", beats: [read, right] });
      if (read && teaches.length) chains.push({ name: "case (wrong stamp): " + un(nm[1]), mode: "branch", beats: [read], branches: teaches });
    }
  }
  if (type === "popupPanic") {
    // each request: the message as it pops -> Sarah's why after the call
    const parts = span.split(/\bbody:\s*/).slice(1);
    for (const p of parts) {
      const b = p.match(new RegExp("^" + STR)); if (!b) continue;
      const why = field(p, "whyTrick");
      if (why) chains.push({ name: "request: " + un(b[1]).slice(0, 40) + "...", mode: "chain", beats: [un(b[1]), why] });
    }
  }
  if (type === "cyberMaze") {
    // each gate: the proposal -> the why after the hero reply; the teach answers the proposal
    const parts = span.split(/\bquestion:\s*/).slice(1);
    for (const p of parts) {
      const q = p.match(new RegExp("^" + STR)); if (!q) continue;
      const why = field(p, "why"), expl = field(p, "explanation");
      const optBlock = p.match(/answers:\s*\[([\s\S]*?)\]/);
      const options = optBlock ? [...optBlock[1].matchAll(new RegExp(STR, "g"))].map((m) => un(m[1])) : [];
      if (why) chains.push({ name: "gate: " + un(q[1]).slice(0, 40) + "...", mode: "chain", beats: [un(q[1]), why], ctx: [options.join(" ")] });
      if (expl) chains.push({ name: "gate (wrong reply): " + un(q[1]).slice(0, 40) + "...", mode: "branch", beats: [un(q[1])], branches: [{ beat: expl, ctx: options.join(" ") }] });
    }
  }
  if (type === "chatSimulator") {
    // the transcript in order (the order IS the lesson) + each choice's feedback answering the reply tapped
    const msgBlock = span.match(/messages:\s*\[([\s\S]*?)\]\s*,\s*choices:/);
    const msgs = msgBlock ? [...msgBlock[1].matchAll(new RegExp("text:\\s*" + STR, "g"))].map((m) => un(m[1])) : [];
    if (msgs.length) chains.push({ name: "chat transcript", mode: "chain", beats: msgs });
    const groups = span.split(/\btriggerAfterMessage:\s*/).slice(1);
    for (const g of groups) {
      const idx = Number((g.match(/^(\d+)/) || [])[1]);
      const setup = msgs[idx] || "";
      const fbs = [...g.matchAll(new RegExp("text:\\s*" + STR + "[^}]*?feedback:\\s*" + STR, "g"))].map((m) => ({ beat: un(m[2]), ctx: un(m[1]) }));
      if (setup && fbs.length) chains.push({ name: "chat choice after: " + setup.slice(0, 40) + "...", mode: "branch", beats: [setup], branches: fbs });
    }
  }
  if (type === "teamPoster") {
    // the tray prompt -> each pinned clue's why (spoken as it lands); decoys' notes answer the prompt too
    const prompt = field(span, "trayPrompt") || "";
    const tiles = [...span.matchAll(new RegExp("label:\\s*" + STR + "[\\s\\S]*?isTeam:\\s*(true|false)[\\s\\S]*?note:\\s*" + STR, "g"))].map((m) => ({ beat: un(m[3]), ctx: un(m[1]), team: m[2] === "true" }));
    if (prompt && tiles.length) chains.push({ name: "case board pins", mode: "branch", beats: [prompt], branches: tiles });
  }
  // Week 4 engines (rebuilt 2026-09-16). Every item: the read-aloud as it arrives ->
  // Sarah's why on the right move (chain); the wrong-move teach answers the read-aloud (branch).
  if (type === "stringsAttached" || type === "believeOMeter" || type === "firewallBuilder") {
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    const noun = type === "stringsAttached" ? "prize" : type === "believeOMeter" ? "poster" : "brick";
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why"), wrong = field(p, "nudge") || field(p, "whyWrong");
      if (why) chains.push({ name: noun + ": " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (wrong) chains.push({ name: noun + " (wrong move): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: [wrong] });
    }
  }
  if (type === "nameTagCheck") {
    // each case: the read-aloud -> Sarah's why on the lock; each piece's teach answers the read-aloud
    const parts = span.split(/\brealChunks:\s*/).slice(1);
    for (const p of parts) {
      const read = field(p, "readAloud"), right = field(p, "rightWhy");
      const teaches = all(new RegExp("teach:\\s*" + STR, "g"), p);
      if (read && right) chains.push({ name: "name tag: " + read.slice(0, 40) + "...", mode: "chain", beats: [read, right] });
      if (read && teaches.length) chains.push({ name: "name tag (wrong mark): " + read.slice(0, 40) + "...", mode: "branch", beats: [read], branches: teaches });
    }
  }
  if (type === "vaultDrop") {
    // Week 9 dock skin: each parcel's label read aloud -> Sarah's why on the right shelf; the explanation answers a wrong one.
    // (Week 2's treasures carry no readAloud, so this adds nothing there.)
    for (const p of span.split(/\{\s*\n?\s*id:\s*(?=")/).slice(1)) {
      const read = field(p, "readAloud"); if (!read) continue;
      const why = field(p, "why"), wrong = field(p, "explanation"), label = field(p, "text") || "";
      if (why) chains.push({ name: "parcel: " + read.slice(0, 40) + "...", mode: "chain", beats: [read, why], ctx: [label] });
      if (wrong) chains.push({ name: "parcel (wrong shelf): " + read.slice(0, 40) + "...", mode: "branch", beats: [read], branches: [{ beat: wrong, ctx: label }] });
    }
  }
  if (type === "passwordVault") {
    // each hotspot: the question read aloud -> the right choice's why; each wrong choice's explanation answers it
    const parts = span.split(/\bruleLabel:\s*/).slice(1);
    for (const p of parts) {
      const nm = p.match(new RegExp("^" + STR)); if (!nm) continue;
      const read = field(p, "readAloud") || field(p, "prompt");
      const choices = [...p.matchAll(new RegExp("text:\\s*" + STR + "[^}]*?isCorrect:\\s*(true|false)[^}]*?explanation:\\s*" + STR + "(?:[^}]*?why:\\s*" + STR + ")?", "g"))];
      const right = choices.find((m) => m[2] === "true");
      const wrongs = choices.filter((m) => m[2] === "false").map((m) => ({ beat: un(m[3]), ctx: un(m[1]) }));
      if (read && right && right[4]) chains.push({ name: "mirror: " + un(nm[1]), mode: "chain", beats: [read, un(right[4])], ctx: [un(right[1])] });
      if (read && wrongs.length) chains.push({ name: "mirror (wrong pick): " + un(nm[1]), mode: "branch", beats: [read], branches: wrongs });
    }
  }
  if (type === "phishInspector") {
    // each message: read aloud -> the four notes (a fixed checklist) -> Sarah's why; whyWrong answers the read
    const parts = span.split(/\bsender:\s*/).slice(1);
    for (const p of parts) {
      const nm = p.match(new RegExp("^" + STR)); if (!nm) continue;
      const read = field(p, "readAloud"), why = field(p, "why"), wrong = field(p, "whyWrong");
      const notes = ["senderNote", "linkNote", "urgencyNote", "claimNote"].map((k) => field(p, k)).filter(Boolean);
      if (read && notes.length) chains.push({ name: "booth notes: " + un(nm[1]), mode: "checklist", beats: [read, ...notes] });
      if (notes.length && why) chains.push({ name: "booth verdict: " + un(nm[1]), mode: "chain", beats: [notes[notes.length - 1], why] });
      if (read && wrong) chains.push({ name: "booth (wrong call): " + un(nm[1]), mode: "branch", beats: [read], branches: [wrong] });
    }
  }
  // Week 5 engines (rebuilt 2026-09-16). Every item: the read-aloud as it arrives ->
  // Sarah's why on the right move (chain); each wrong move's teach answers the read-aloud.
  if (type === "dayBalancer" || type === "passcodeForge") {
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    const noun = type === "dayBalancer" ? "moment" : "stone";
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why");
      const wrongs = all(new RegExp("(?:note|explanation):\\s*" + STR, "g"), p).filter(Boolean);
      if (why) chains.push({ name: noun + ": " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (wrongs.length) chains.push({ name: noun + " (wrong pick): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: wrongs });
    }
  }
  if (type === "growthRings") {
    // the stones light in a fixed order: their read-alouds are one chain
    const beats = all(new RegExp("readAloud:\\s*" + STR, "g"), span);
    if (beats.length) chains.push({ name: "ring stones", mode: "chain", beats });
  }
  if (type === "accountRescue") {
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why"), wrong = field(p, "whyWrong");
      if (why) chains.push({ name: "moment: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (wrong) chains.push({ name: "moment (wrong move): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: [wrong] });
    }
  }
  if (type === "dontFeedTheFire") {
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    const teach = all(new RegExp("body:\\s*" + STR, "g"), span);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why");
      if (why) chains.push({ name: "spark: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (teach.length) chains.push({ name: "spark (reply tapped): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: teach });
    }
  }
  // snowballChase: a demonstration with one spoken start card and no answers;
  // its captions are HUD text, not speech, so there is no in-game chain.
  // Week 6 engines (rebuilt 2026-09-16).
  if (type === "chatFixer" || type === "lobbyDoors") {
    // each item: the read-aloud -> Sarah's why on the right move; whyWrong answers the read-aloud
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    const noun = type === "chatFixer" ? "message" : "player";
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why"), wrong = field(p, "whyWrong");
      if (why) chains.push({ name: noun + ": " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (wrong) chains.push({ name: noun + " (wrong move): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: [wrong] });
    }
  }
  if (type === "guardCount") {
    // each round: the invite read aloud -> the slots (a checklist) -> Sarah's why; whyWrong answers the invite
    const parts = span.split(/\bprompt:\s*/).slice(1);
    for (const p of parts) {
      const read = field(p, "readAloud"), why = field(p, "why"), wrong = field(p, "whyWrong");
      const slots = all(new RegExp("present:\\s*(?:true|false),\\s*readAloud:\\s*" + STR, "g"), p);
      if (read && slots.length) chains.push({ name: "guards: " + read.slice(0, 40) + "...", mode: "checklist", beats: [read, ...slots] });
      if (slots.length && why) chains.push({ name: "guards verdict: " + read.slice(0, 40) + "...", mode: "chain", beats: [slots[slots.length - 1], why] });
      if (read && wrong) chains.push({ name: "guards (wrong room): " + read.slice(0, 40) + "...", mode: "branch", beats: [read], branches: [wrong] });
    }
  }
  if (type === "powerPanel") {
    // each round: the message read aloud -> Sarah's why after the third button; teach lines answer it
    const parts = span.split(/\bprompt:\s*/).slice(1);
    for (const p of parts) {
      const read = field(p, "readAloud"), why = field(p, "why");
      const notes = all(new RegExp("note:\\s*" + STR, "g"), p);
      const st = p.match(new RegExp("stepTeach:\\s*\\[\\s*" + STR + "\\s*,\\s*" + STR));
      const teach = [...notes, ...(st ? [un(st[1]), un(st[2])] : [])];
      if (read && why) chains.push({ name: "panel: " + read.slice(0, 40) + "...", mode: "chain", beats: [read, why] });
      if (read && teach.length) chains.push({ name: "panel (wrong tap): " + read.slice(0, 40) + "...", mode: "branch", beats: [read], branches: teach });
    }
  }
  // Week 7 engines (rebuilt 2026-09-16).
  if (type === "coinCounter") {
    // each pack: the read-aloud -> Sarah's why when the till is paid or the bank runs dry (no wrong path)
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why");
      if (why) chains.push({ name: "pack: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
    }
  }
  if (type === "oddsJar") {
    // each round: the read-aloud -> Sarah's why on the true card; each fib's whyWrong answers the read-aloud
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why");
      const fibs = all(new RegExp("isTrue:\\s*false,\\s*whyWrong:\\s*" + STR, "g"), p);
      if (why) chains.push({ name: "jar: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (fibs.length) chains.push({ name: "jar (fib tapped): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: fibs });
    }
  }
  if (type === "truePriceLever") {
    // each deal: the read-aloud -> Sarah's why on the right move; the teach body answers the read-aloud
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why"), body = field(p, "body");
      if (why) chains.push({ name: "deal: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (body) chains.push({ name: "deal (wrong move): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: [body] });
    }
  }
  // Week 8 engines (rebuilt 2026-09-17).
  if (type === "undoTest") {
    // each round: the photo read-aloud -> Sarah's why on the true rule card; each fib's whyWrong answers the read-aloud
    const parts = span.split(/\breadAloud:\s*/).slice(1);
    for (const p of parts) {
      const r = p.match(new RegExp("^" + STR)); if (!r) continue;
      const why = field(p, "why");
      const fibs = all(new RegExp("isTrue:\\s*false,\\s*whyWrong:\\s*" + STR, "g"), p);
      if (why) chains.push({ name: "undo: " + un(r[1]).slice(0, 40) + "...", mode: "chain", beats: [un(r[1]), why] });
      if (fibs.length) chains.push({ name: "undo (fib tapped): " + un(r[1]).slice(0, 40) + "...", mode: "branch", beats: [un(r[1])], branches: fibs });
    }
  }
  if (type === "askRing") {
    // each friend: their spoken answer -> Sarah's why on the right hero move; whyWrong answers the answer.
    // each round: the photo read-aloud -> Sarah's why when POST is tapped (the round's LAST why).
    for (const round of span.split(/\bcaption:\s*/).slice(1)) {
      const read = field(round, "readAloud");
      const whys = all(new RegExp("\\bwhy:\\s*" + STR, "g"), round);
      if (read && whys.length) chains.push({ name: "ask ring: " + read.slice(0, 40) + "...", mode: "chain", beats: [read, whys[whys.length - 1]] });
      // split on the `says: "` property only; the read-alouds themselves contain "Maya says: Yes..."
      for (const part of round.split(/\bsays:\s*(?=")/).slice(1)) {
        // only this friend's own fields: stop at the next friend object or the end of the friends array
        const f = part.split(/\{\s*id:|\]\s*,/)[0];
        const fread = field(f, "readAloud"), fwhy = field(f, "why"), fwrong = field(f, "whyWrong");
        if (fread && fwhy) chains.push({ name: "friend: " + fread.slice(0, 40) + "...", mode: "chain", beats: [fread, fwhy] });
        if (fread && fwrong) chains.push({ name: "friend (wrong move): " + fread.slice(0, 40) + "...", mode: "branch", beats: [fread], branches: [fwrong] });
      }
    }
  }
  if (type === "developingTray") {
    // develop -> spot -> each leak -> decide -> why; the SHARE teach answers the decide line
    const dev = field(span, "developReadAloud"), spot = field(span, "spotReadAloud"), decide = field(span, "decideReadAloud");
    const leaks = all(new RegExp("\\breadAloud:\\s*" + STR, "g"), span);
    const why = field(span, "why"), body = field(span, "body");
    const beats = [dev, spot, ...leaks, decide, why].filter(Boolean);
    if (beats.length > 1) chains.push({ name: "developing tray", mode: "chain", beats });
    if (decide && body) chains.push({ name: "developing tray (shared it)", mode: "branch", beats: [decide], branches: [body] });
  }
  // Week 9 engines (rebuilt 2026-09-17).
  if (type === "flipTheBox") {
    // each box: the front read-aloud -> maker -> reviews -> asks (turning right) -> Sarah's why on the right call;
    // whyWrong answers the asks side, the last one read before the call.
    for (const p of span.split(/\bname:\s*(?=")/).slice(1)) {
      const name = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      const reads = all(new RegExp("\\breadAloud:\\s*" + STR, "g"), p);
      const why = field(p, "why"), wrong = field(p, "whyWrong");
      if (reads.length && why) chains.push({ name: "flip the box: " + un(name), mode: "chain", beats: [...reads, why] });
      if (reads.length && wrong) chains.push({ name: "flip the box: " + un(name) + " (wrong call)", mode: "branch", beats: [reads[reads.length - 1]], branches: [wrong] });
    }
  }
  if (type === "testDrive" || type === "fourEyes") {
    // testDrive: the app's read-aloud -> each minute as it is played -> Sarah's why on the right sticker.
    // fourEyes:  the app's read-aloud -> each spot the grown-up finds -> Sarah's why on the right decision.
    // In both, whyWrong answers the last thing Sarah read before the choice.
    const listKey = type === "testDrive" ? "minutes" : "spots";
    const endKey = type === "testDrive" ? "answer" : "rightMove";
    for (const p of span.split(/\bappName:\s*/).slice(1)) {
      const name = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      const read = field(p, "readAloud");
      const a = p.indexOf(listKey + ":"), b = p.indexOf(endKey + ":", a);
      const items = a >= 0 && b > a ? all(new RegExp("\\breadAloud:\\s*" + STR, "g"), p.slice(a, b)) : [];
      const why = field(p, "why"), wrong = field(p, "whyWrong");
      const label = (type === "testDrive" ? "test drive: " : "four eyes: ") + un(name);
      if (read && why) chains.push({ name: label, mode: "chain", beats: [read, ...items, why] });
      if (wrong) chains.push({ name: label + " (wrong choice)", mode: "branch", beats: [items.length ? items[items.length - 1] : read], branches: [wrong] });
    }
  }
  // Week 11 engines (rebuilt 2026-09-19).
  if (type === "calmConsole") {
    // each stone: the heavy thought Sarah reads as it is lifted -> her reason why
    // it was never the child's to carry. There is no wrong path in this beat.
    for (const t of span.split(/\{\s*id:\s*(?=")/).slice(1)) {
      const label = field(t, "label"), why = field(t, "why");
      if (label && why) chains.push({ name: "calm console: " + un(label), mode: "chain", beats: [label, why] });
    }
  }
  if (type === "radioRoll") {
    // each channel: the label Sarah reads as the dial lands -> her why when they
    // join the team; a channel that cannot help explains itself against the same line.
    for (const c of span.split(/\{\s*id:\s*(?=")/).slice(1)) {
      const label = field(c, "label"), why = field(c, "why"), expl = field(c, "explanation");
      if (!label) continue;
      if (/isTeam:\s*true/.test(c)) {
        if (why) chains.push({ name: "radio roll: " + un(label), mode: "chain", beats: [label, why] });
      } else if (expl) {
        chains.push({ name: "radio roll: " + un(label) + " (no help)", mode: "branch", beats: [label], branches: [expl] });
      }
    }
  }
  if (type === "drillRun") {
    // each step: the situation Sarah reads as it opens -> the why on the move that
    // advances the drill; a wrong move answers the same situation.
    for (const p of span.split(/\bsituation:\s*(?=")/).slice(1)) {
      const situation = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!situation) continue;
      for (const o of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(o, "label"), why = field(o, "why"), expl = field(o, "explanation");
        if (!label) continue;
        if (/isRight:\s*true/.test(o)) {
          if (why) chains.push({ name: "drill run: " + un(label), mode: "chain", beats: [situation, why] });
        } else if (expl) {
          chains.push({ name: "drill run: " + un(label) + " (wrong move)", mode: "branch", beats: [situation], branches: [expl] });
        }
      }
    }
  }
  // Week 16 engines (rebuilt 2026-09-23).
  if (type === "stickerPeel" || type === "glassCheck" || type === "keyholeCheck") {
    // each poster / door: the read-aloud as it arrives -> the why on the right
    // call; the teach answers that same read-aloud.
    const noun = type === "stickerPeel" ? "sticker peel" : type === "glassCheck" ? "glass check" : "keyhole check";
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      const why = field(p, "why"), expl = field(p, "explanation");
      if (why) chains.push({ name: noun + ": " + un(readAloud).slice(0, 40), mode: "chain", beats: [readAloud, why] });
      if (expl) chains.push({ name: noun + ": " + un(readAloud).slice(0, 40) + " (teach)", mode: "branch", beats: [readAloud], branches: [expl] });
    }
  }
  // Week 14 engines (rebuilt 2026-09-22).
  if (type === "speakerDiary" || type === "lensCheck") {
    // each entry / corner: the read-aloud as it opens -> the right item's why; a
    // wrong tap answers that same read-aloud.
    const noun = type === "speakerDiary" ? "speaker diary" : "lens check";
    const rightFlag = type === "speakerDiary" ? "isRight" : "woke";
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      for (const o of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(o, "label"), why = field(o, "why"), expl = field(o, "explanation");
        if (!label) continue;
        if (new RegExp(rightFlag + ":\\s*true").test(o)) {
          if (why) chains.push({ name: noun + ": " + un(label), mode: "chain", beats: [readAloud, why] });
        } else if (expl) {
          chains.push({ name: noun + ": " + un(label) + " (wrong)", mode: "branch", beats: [readAloud], branches: [expl] });
        }
      }
    }
  }
  // Week 13 engines (rebuilt 2026-09-21).
  if (type === "dayJug") {
    // each day: the read-aloud as the jug fills -> the right pour's why; a
    // wrong pour answers that same day.
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      for (const o of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(o, "label"), why = field(o, "why"), expl = field(o, "explanation");
        if (!label) continue;
        if (/isRight:\s*true/.test(o)) {
          if (why) chains.push({ name: "day jug: " + un(label), mode: "chain", beats: [readAloud, why] });
        } else if (expl) {
          chains.push({ name: "day jug: " + un(label) + " (wrong pour)", mode: "branch", beats: [readAloud], branches: [expl] });
        }
      }
    }
  }
  if (type === "setTheDial" || type === "nightFall") {
    // the plan desk and the room both answer their own read-aloud: a good plan /
    // a right move speaks why, and the teach answers the same line.
    const noun = type === "setTheDial" ? "plan desk" : "night fall";
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      const why = field(p, "why"), expl = field(p, "explanation");
      if (why) chains.push({ name: noun + ": " + un(readAloud).slice(0, 40), mode: "chain", beats: [readAloud, why] });
      if (expl) chains.push({ name: noun + ": " + un(readAloud).slice(0, 40) + " (teach)", mode: "branch", beats: [readAloud], branches: [expl] });
    }
  }
  // Week 12 engines (rebuilt 2026-09-19).
  if (type === "trackBack" || type === "trailPlanner") {
    // each print / stretch: the read-aloud Sarah speaks as it thaws or lights up
    // -> the right card's why; a wrong card answers that same read-aloud.
    const noun = type === "trackBack" ? "track back" : "trail planner";
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      for (const o of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(o, "label"), why = field(o, "why"), expl = field(o, "explanation");
        if (!label) continue;
        if (/isRight:\s*true/.test(o)) {
          if (why) chains.push({ name: noun + ": " + un(label), mode: "chain", beats: [readAloud, why] });
        } else if (expl) {
          chains.push({ name: noun + ": " + un(label) + " (wrong)", mode: "branch", beats: [readAloud], branches: [expl] });
        }
      }
    }
  }
  if (type === "futureMirror") {
    // each post: the read-aloud as it rises to the mirror -> the why on the right
    // call; the explanation answers that same post when the call goes the other way.
    for (const p of span.split(/\breadAloud:\s*(?=")/).slice(1)) {
      const readAloud = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!readAloud) continue;
      const why = field(p, "why"), expl = field(p, "explanation");
      if (why) chains.push({ name: "future mirror: " + un(readAloud).slice(0, 40), mode: "chain", beats: [readAloud, why] });
      if (expl) chains.push({ name: "future mirror: " + un(readAloud).slice(0, 40) + " (wrong call)", mode: "branch", beats: [readAloud], branches: [expl] });
    }
  }
  // Week 10 engines (rebuilt 2026-09-17).
  if (type === "climbOut") {
    // each rung: the moment Sarah reads as it slides in -> the grip's why on the
    // climb; a bait's explanation answers that same moment when the belt pulls.
    for (const p of span.split(/\bprompt:\s*(?=")/).slice(1)) {
      const prompt = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!prompt) continue;
      for (const t of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(t, "label"), why = field(t, "why"), expl = field(t, "explanation");
        if (!label) continue;
        if (/isGrip:\s*true/.test(t)) {
          if (why) chains.push({ name: "climb out: " + un(label), mode: "chain", beats: [prompt, why] });
        } else if (expl) {
          chains.push({ name: "climb out: " + un(label) + " (bait)", mode: "branch", beats: [prompt], branches: [expl] });
        }
      }
    }
  }
  if (type === "whoKnows") {
    // each round: the claim the video shouts -> the right source's why; a wrong
    // source's explanation answers the same claim.
    for (const p of span.split(/\bclaim:\s*(?=")/).slice(1)) {
      const claim = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!claim) continue;
      for (const o of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(o, "label"), why = field(o, "why"), expl = field(o, "explanation");
        if (!label) continue;
        if (/isRight:\s*true/.test(o)) {
          if (why) chains.push({ name: "who knows: " + un(label), mode: "chain", beats: [claim, why] });
        } else if (expl) {
          chains.push({ name: "who knows: " + un(label) + " (wrong source)", mode: "branch", beats: [claim], branches: [expl] });
        }
      }
    }
  }
  if (type === "commentPond") {
    // each comment: the comment Sarah reads as it surfaces -> her why when the
    // child names what it wants; the explanation answers a wrong name.
    for (const p of span.split(/\bauthor:\s*(?=")/).slice(1)) {
      const author = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      const text = field(p, "text"), why = field(p, "why"), expl = field(p, "explanation");
      if (!text) continue;
      if (why) chains.push({ name: "comment pond: " + un(author), mode: "chain", beats: [text, why] });
      if (expl) chains.push({ name: "comment pond: " + un(author) + " (wrong want)", mode: "branch", beats: [text], branches: [expl] });
    }
  }
  if (type === "pausePower") {
    // each round: the watching moment -> the why on a card the child picked for
    // themselves; the belt's card explains itself against the same moment.
    for (const p of span.split(/\bsetup:\s*(?=")/).slice(1)) {
      const setup = (p.match(new RegExp("^" + STR)) || [])[1] || "";
      if (!setup) continue;
      for (const c of p.split(/\{\s*id:\s*(?=")/).slice(1)) {
        const label = field(c, "label"), why = field(c, "why"), expl = field(c, "explanation");
        if (!label) continue;
        if (/isMine:\s*true/.test(c)) {
          if (why) chains.push({ name: "pause power: " + un(label), mode: "chain", beats: [setup, why] });
        } else if (expl) {
          chains.push({ name: "pause power: " + un(label) + " (the belt's pick)", mode: "branch", beats: [setup], branches: [expl] });
        }
      }
    }
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

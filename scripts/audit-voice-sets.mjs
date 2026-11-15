/**
 * Word-for-word + cut-off audit for EVERY voice set outside the Heroes
 * narration manifest (Explorers WREN, ATLAS, Raccoon, interjections, Pro and
 * Ops briefings).
 *
 * Owner, 2026-11-15: "We need to ensure every grain of rice is covered." The
 * faults found in Cyber Heroes (cut-off words, dropped small words, repeated
 * phrases, stray sounds) can exist in any recording, so every live clip is
 * transcribed and compared with the text it was supposed to say.
 *
 * Input: .audio-sets.json ([{ set, file, text, scriptText?, referenced }]).
 * Transcripts are cached in .stt-cache by audio hash, so a rerun is free.
 *
 *   node --env-file=.env.local scripts/audit-voice-sets.mjs [--sets=wren,atlas] [--limit=N] [--jobs=6]
 *
 * Writes .audio-sets-report.json and prints a summary per set.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { transcribeFull } from "./lib/line-take.mjs";

const KEY = process.env.ELEVENLABS_API_KEY;
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1];
const SETS = arg("sets") ? new Set(arg("sets").split(",")) : null;
const LIMIT = Number(arg("limit")) || Infinity;
const JOBS = Number(arg("jobs")) || 6;

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const numWords = (n) => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? ONES[n % 10] : "") : String(n));
function canon(tok) {
  let w = tok.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, "");
  if (/^\d+$/.test(w) && w.length < 3) w = numWords(Number(w));
  return w.replace(/'/g, "").replace(/our(s?)$/, "or$1").replace(/is(e|ed|es|ing)$/, "iz$1").replace(/tre$/, "ter").replace(/^grey/, "gray").replace(/^ok$/, "okay").replace(/ll(ed|ing)$/, "l$1");
}
/* IPA respellings ("/ˈdeɪtə/") are a pronunciation hint, not a word we can
 * compare: they become a wildcard that matches any one heard word. */
function scriptWords(text) {
  return String(text).replace(/\[[a-z ]+\]/gi, " ").replace(/\/[^/\s]+\//g, " \u0000 ").replace(/(\d),(\d)/g, "$1$2")
    .split(/[\s\-–—/]+/).map((t) => (t === "\u0000" ? "*" : canon(t))).filter(Boolean);
}
const heardWords = (ws) => ws.filter((w) => w.type === "word").flatMap((w) => String(w.text).split(/[\s\-–—/]+/).map((t) => ({ w: canon(t), start: w.start, end: w.end }))).filter((x) => x.w);

/* ── When a mismatch is the TRANSCRIBER, not the voice ─────────────────────
 * The first run flagged 30 of 40 Ops briefings, and reading them, nearly all
 * were the transcriber spelling the same sounds differently: "defence" as
 * "defense", "2005" as "two thousand and five", "web page" as "webpage",
 * "Wren" as "ren". A hunk (the run of mismatches between two matched words)
 * is forgiven only when both sides SPELL OUT the same sounds - never because
 * it is short. A dropped "a" or "'ve" still fails. */
const HOMOPHONES = [["wren", "ren"], ["arc", "ark"], ["fish", "phish"], ["fishing", "phishing"], ["nooo", "no"], ["noo", "no"], ["him", "em"], ["okay", "ok"], ["tic", "tick"]];
function yearWords(n) {
  if (n >= 2000 && n < 2010) return [`twothousandand${n % 10 ? ONES[n % 10] : ""}`, `twothousand${n % 10 ? ONES[n % 10] : ""}`];
  const hi = Math.floor(n / 100), lo = n % 100;
  const loW = lo === 0 ? "hundred" : lo < 10 ? "oh" + ONES[lo] : numWords(lo);
  const out = [numWords(hi) + loW];
  if (n >= 2010 && n < 2100) out.push(`twothousandand${numWords(n - 2000)}`, `twothousand${numWords(n - 2000)}`);
  return out;
}
function spellings(joined) {
  const s = joined
    .replace(/ence/g, "ense").replace(/isation/g, "ization").replace(/yse/g, "yze").replace(/ogue/g, "og")
    .replace(/our/g, "or").replace(/tre\b/g, "ter").replace(/ll/g, "l");
  const out = new Set([s]);
  const m = s.match(/\d{4}/);
  if (m) for (const y of yearWords(Number(m[0]))) out.add(s.replace(m[0], y));
  for (const [a, b] of HOMOPHONES) { if (s.includes(a)) out.add(s.replace(a, b)); if (s.includes(b)) out.add(s.replace(b, a)); }
  return out;
}
const sameSounds = (a, b) => { const A = spellings(a), B = spellings(b); for (const x of A) if (B.has(x)) return true; return false; };

/** Alignment in HUNKS: each run of mismatches between two matched words. */
function diff(script, heard) {
  const n = script.length, m = heard.length;
  const eq = (a, b) => a === "*" || a === b;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = eq(script[i - 1], heard[j - 1].w) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && eq(script[i - 1], heard[j - 1].w)) { ops.push({ t: "=" }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.push({ t: "+", word: heard[j - 1].w, at: heard[j - 1].start }); j--; }
    else { ops.push({ t: "-", word: script[i - 1], ctx: script.slice(Math.max(0, i - 4), i + 3).join(" ") }); i--; }
  }
  ops.reverse();
  const missing = [], extra = [];
  let hunk = [];
  const flush = () => {
    if (!hunk.length) return;
    const miss = hunk.filter((o) => o.t === "-"), ext = hunk.filter((o) => o.t === "+");
    const a = miss.map((o) => o.word).join(""), b = ext.map((o) => o.word).join("");
    if (!(miss.length && ext.length && sameSounds(a, b))) { missing.push(...miss); extra.push(...ext); }
    hunk = [];
  };
  for (const o of ops) { if (o.t === "=") flush(); else hunk.push(o); }
  flush();
  return { missing, extra };
}

function levels(file) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const x = r.stdout, n = Math.floor(x.length / 2), W = 80, L = [];
  for (let i = 0; i + W <= n; i += W) { let s = 0; for (let k = 0; k < W; k++) { const v = x.readInt16LE((i + k) * 2); s += v * v; } L.push(10 * Math.log10(s / W / 2 ** 30 + 1e-12)); }
  return L;
}

async function transcript(file) {
  const buf = await readFile(file);
  const k = createHash("sha1").update(buf).digest("hex").slice(0, 20);
  const p = join(".stt-cache", `full-${k}.json`);
  try { await access(p); return JSON.parse(await readFile(p, "utf8")); } catch { /* not cached */ }
  const ws = await transcribeFull(KEY, file);
  await mkdir(".stt-cache", { recursive: true });
  await writeFile(p, JSON.stringify(ws));
  return ws;
}

const all = JSON.parse(await readFile(".audio-sets.json", "utf8"));
const todo = all.filter((e) => e.referenced !== false && (!SETS || SETS.has(e.set))).slice(0, LIMIT);
const report = [];
let done = 0;
const q = [...todo];
await Promise.all(Array.from({ length: JOBS }, async () => {
  while (q.length) {
    const e = q.shift();
    const r = { set: e.set, file: e.file, problems: [] };
    try {
      const L = levels(e.file);
      let cuts = 0;
      for (let i = 1; i < L.length; i++) if (L[i] < -90 && L[i - 1] > -35) cuts++;
      if (cuts) r.problems.push(`hard cut x${cuts} (speech straight into silence)`);
      const ws = await transcript(e.file);
      const events = ws.filter((w) => w.type === "audio_event").map((w) => w.text);
      if (events.length) r.problems.push(`sounds: ${events.join(", ")}`);
      const hw = heardWords(ws);
      const text = e.scriptText || e.text;
      if (L.length && L.at(-1) > -35 && hw.length) {
        const tail = (L.length * 0.01) - hw.at(-1).end;
        r.problems.push(`ends while loud: last word "${hw.at(-1).w}" ${tail.toFixed(2)}s before the end`);
      }
      if (text) {
        const d = diff(scriptWords(text), hw);
        if (d.missing.length) r.problems.push(`missing: ${d.missing.map((x) => `"${x.word}" (…${x.ctx}…)`).join("; ")}`);
        if (d.extra.length) r.problems.push(`extra: ${d.extra.map((x) => `"${x.word}"@${x.at.toFixed(1)}s`).join("; ")}`);
        r.heard = hw.map((x) => x.w).join(" ");
      } else {
        r.problems.push("no script text to compare");
        r.heard = hw.map((x) => x.w).join(" ");
      }
    } catch (err) {
      r.problems.push(`ERROR ${String(err.message || err).slice(0, 160)}`);
    }
    report.push(r);
    if (++done % 100 === 0) console.error(`  ${done}/${todo.length}`);
  }
}));
report.sort((a, b) => a.file.localeCompare(b.file));
await writeFile(".audio-sets-report.json", JSON.stringify(report, null, 1));
const bySet = {};
for (const r of report) {
  const s = (bySet[r.set] ??= { clips: 0, flagged: 0, kinds: {} });
  s.clips++;
  if (r.problems.length) s.flagged++;
  for (const p of r.problems) { const k = p.split(":")[0].replace(/ x\d+.*/, ""); s.kinds[k] = (s.kinds[k] || 0) + 1; }
}
for (const [s, v] of Object.entries(bySet)) console.log(`${s.padEnd(14)} ${v.clips} clips, ${v.flagged} flagged  ${JSON.stringify(v.kinds)}`);

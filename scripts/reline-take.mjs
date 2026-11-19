#!/usr/bin/env node
/**
 * RE-LINE: replace individual LINES inside a shipped narration clip and leave
 * every other line exactly as the tester already heard it.
 *
 * UAT 2026-11-18 (Talha, weeks 2-12). Lines read at "0.5x", stops in the
 * middle of a phrase ("Out... there"), phrases said twice, a word in a
 * different tone. Re-recording a whole card to fix one line swaps every
 * other line for a new take too, and each new take can bring its own fault:
 * that is how earlier "fixes" came back with new problems. This touches ONLY
 * the named lines.
 *
 * How: a line-take clip is lines joined by LINE_GAP of digital silence
 * (exact zeros after decoding), so every line's span is known to the sample.
 * The named line is either
 *   retake  - recorded again (recordLine: same voice, model and settings,
 *             neighbours as previous_text/next_text, word-for-word checked),
 *             paced to the card and loudness-matched to the line it replaces;
 *   retempo - the SAME take, only its tempo changed (0.88-1.12), when the
 *             words and delivery were right and only the pace was off;
 * then spliced into the silence. The clip is written only if EVERY gate
 * passes (see gate()); otherwise the old clip stays and the reason is
 * reported, and the rejected clip is kept in .reline-rejected/ to inspect.
 *
 *   node --env-file=.env.local scripts/reline-take.mjs jobs.json [--dry] [--jobs=4] [--report=file]
 *   jobs.json: [{ "file": "c2124e833ab704b6.mp3", "lines": [3], "mode": "retake",
 *                 "say": { "3": "text the voice is given, if not the line" },
 *                 "settings": { ...voice settings override }, "why": "pace" }]
 *   Line numbers are 0-based over the SPOKEN lines (cleanLine, empty dropped).
 *   --dry: everything except replacing the file.
 */
import { readFile, writeFile, mkdir, unlink, copyFile } from "node:fs/promises";
import { readFileSync, existsSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import ffmpegPath from "ffmpeg-static";
import {
  recordLine, shapeLine, cleanLine, compareTake, transcribeFull, wordsOf, lineSyllables,
  expectsQuietTail, TEMPO_MIN, TEMPO_MAX,
} from "./lib/line-take.mjs";

const SR = 44100;
const KEY = process.env.ELEVENLABS_API_KEY;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const DRY = argv.includes("--dry");
const JOBS = JSON.parse(readFileSync(argv.find((a) => !a.startsWith("--")), "utf8"));
const POOL = Number(flag("jobs", 4));
const REPORT = flag("report", ".reline-report.json");
const DIR = flag("dir", "public/audio/voice");
const STT_CACHE = process.env.STT_CACHE || ".stt-cache";
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const byFile = new Map(manifest.entries.map((e) => [e.file.split("/").pop(), e]));

/* The standard every replaced line must meet (UAT 2026-11-18; measured on
 * the live course: sentence median 3.75 syl/s, middle half 3.39-4.17). */
export const STD = {
  lineRate: [3.2, 4.4],       // syllables / line span, commas included
  sentRate: [2.9, 4.7],       // each sentence of 4+ words
  cardTarget: [3.5, 4.0],     // the pace a line is brought to: its card's own, kept in this band
  maxStop: 0.25,              // s of silence allowed after a word with no punctuation (transcript)
  maxQuiet: 0.2,              // s of near-silence (-40 dB) between two such words (sound), any context
  loudTol: 1.0,               // dB, active speech vs the line it replaces
  pitchTol: 1.5,              // semitones from the card's median, unless the old line was further
  peakMax: -1.0,              // dBFS
  untouchedSnr: 20,           // dB, every line not replaced vs the original (a plain re-encode measures ~26)
};

/* Silence allowed between two words with NO punctuation between them, and
 * what "tighten" leaves of a longer one. kids = the Heroes narration voice:
 * the tester heard 0.11s in "scam| always" as a stop; next to a p/t/k/b/d/g
 * closure ("got| booted") a short silence is part of the consonant.
 * narrator = ATLAS (Daniel), a slower storyteller who breathes at clause
 * breaks: only a real hole is flagged ("Ready| to become" 650ms, "share|
 * really makes" 390ms) and a short breath is left. */
const PROFILES = {
  kids: { closureGap: 0.12, openGap: 0.08, closureKeep: 0.07, openKeep: 0.04 },
  narrator: { closureGap: 0.3, openGap: 0.3, closureKeep: 0.12, openKeep: 0.15,
    // a storyteller holds a comma longer (Daniel: 0.4-0.8s); only the extreme ones are trimmed
    punct: { ",": [0.8, 0.6], ":": [0.9, 0.65], "—": [0.9, 0.65], ".": [1.2, 0.95], "…": [1.3, 1.0] } },
};
/* At punctuation, the owner's flow standard (voice-flow spec 2026-11-16):
 * [longest allowed, what a longer one is shortened to]. Never lengthened. */
const PUNCT = { ",": [0.4, 0.3], ":": [0.6, 0.45], "—": [0.6, 0.45], ".": [0.95, 0.75], "…": [1.1, 0.85] };

/* ---------- audio ---------- */
function ff(args) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${String(r.stderr).slice(0, 300)}`);
}
function decode(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 29 });
  const b = r.stdout; return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
}
async function writePcm(a, out, codec = "mp3") {
  const raw = `${out}.f32`;
  await writeFile(raw, Buffer.from(a.buffer, a.byteOffset, a.byteLength));
  ff(["-f", "f32le", "-ar", String(SR), "-ac", "1", "-i", raw, ...(codec === "mp3" ? ["-c:a", "libmp3lame", "-b:a", "128k"] : codec === "f32wav" ? ["-c:a", "pcm_f32le"] : ["-c:a", "pcm_s16le"]), out]);
  await unlink(raw).catch(() => {});
}
const db = (x) => 20 * Math.log10(Math.max(x, 1e-12));
const concat = (...xs) => { const o = new Float32Array(xs.reduce((s, x) => s + x.length, 0)); let p = 0; for (const x of xs) { o.set(x, p); p += x.length; } return o; };

/** Line spans [start, end) in samples, from the digital-silence breaks. */
export function lineSpans(a, n) {
  const Z = 1e-5, runs = []; let s = -1;
  for (let i = 0; i <= a.length; i++) {
    const z = i < a.length && Math.abs(a[i]) < Z;
    if (z && s < 0) s = i;
    if (!z && s >= 0) { runs.push([s, i]); s = -1; }
  }
  const gaps = runs.filter(([x, y]) => x > 0 && y < a.length && (y - x) / SR >= 0.7 && (y - x) / SR <= 0.82);
  if (gaps.length !== n - 1) return { err: `found ${gaps.length} line breaks, expected ${n - 1}` };
  let i0 = 0; while (i0 < a.length && Math.abs(a[i0]) < Z) i0++;
  let i1 = a.length; while (i1 > 0 && Math.abs(a[i1 - 1]) < Z) i1--;
  const spans = [];
  for (let k = 0; k < n; k++) spans.push([k ? gaps[k - 1][1] : i0, k < n - 1 ? gaps[k][0] : i1]);
  return { spans };
}
/** Active-speech level (dB) and peak (dBFS). */
function level(x) {
  const W = 882, fr = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; fr.push(s / W); }
  const pk = Math.max(...fr, 1e-20), act = fr.filter((p) => p > pk * 0.01);
  let peak = 0; for (const v of x) peak = Math.max(peak, Math.abs(v));
  return { active: 10 * Math.log10(act.reduce((s, p) => s + p, 0) / Math.max(1, act.length)), peak: db(peak) };
}
/** Median voice pitch (Hz), autocorrelation on voiced frames. */
function pitch(x) {
  const D = 4, sr = SR / D, y = new Float32Array(Math.floor(x.length / D));
  for (let i = 0; i < y.length; i++) { let s = 0; for (let k = 0; k < D; k++) s += x[i * D + k]; y[i] = s / D; }
  const N = Math.round(sr * 0.04), H = Math.round(sr * 0.01), lo = Math.floor(sr / 450), hi = Math.ceil(sr / 90);
  let pk = 0; const en = []; for (let i = 0; i + N + hi < y.length; i += H) { let e = 0; for (let k = 0; k < N; k++) e += y[i + k] * y[i + k]; en.push(e); pk = Math.max(pk, e); }
  const f0 = [];
  for (let f = 0, i = 0; i + N + hi < y.length; i += H, f++) {
    if (en[f] < pk * 0.05) continue;
    let best = 0, bl = 0;
    for (let L = lo; L <= hi; L++) { let s = 0, e2 = 0; for (let k = 0; k < N; k++) { s += y[i + k] * y[i + k + L]; e2 += y[i + k + L] * y[i + k + L]; } const r = s / Math.sqrt(en[f] * e2 + 1e-20); if (r > best) { best = r; bl = L; } }
    if (best > 0.75) f0.push(sr / bl);
  }
  f0.sort((p, q) => p - q);
  return f0.length > 10 ? f0[f0.length >> 1] : NaN;
}
const semis = (a, b) => 12 * Math.log2(a / b);
/** Final t/s/k length (ms), measured as CI's audit-consonant-integrity does. */
function tailMs(x) {
  const W = 441; let pk = 0; const fr = []; for (let s = 0; s + W <= x.length; s += W) { let q = 0; for (let k = s; k < s + W; k++) q += x[k] * x[k]; fr.push(Math.sqrt(q / W)); pk = Math.max(pk, fr.at(-1)); }
  let le = fr.length - 1; while (le > 0 && fr[le] < pk * 0.06) le--;
  let te = le; for (let f = le; f < fr.length; f++) if (fr[f] > pk * 0.004) te = f;
  return (te - le) * 10;
}
const edgeDb = (x) => db(Math.sqrt(x.reduce((s, v) => s + v * v, 0) / Math.max(1, x.length)));
const edges = (x) => [edgeDb(x.slice(0, 441)), edgeDb(x.slice(-441))];
const LINE_MAX = 4.2; // what retempo calms a fast sentence to
const COURSE_PITCH = { adam: 245, layla: 251 }; // Hz, median of every screened line (Emma)
const COURSE_ACTIVE = -16.5; // dB active speech, median of every screened line (middle half -17.1 to -15.8)

/* ---------- words ---------- */
const sha = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 20);
async function stt(file, model = "scribe_v1") {
  const h = sha(await readFile(file));
  const p = join(STT_CACHE, model === "scribe_v1" ? `${h}.json` : `${model}-${h}.json`);
  if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
  const w = (await transcribeFull(KEY, file, model)).filter((x) => x.type === "word").map((x) => ({ text: x.text, start: x.start, end: x.end }));
  await mkdir(STT_CACHE, { recursive: true }); await writeFile(p, JSON.stringify(w));
  return w;
}
const withType = (w) => w.map((x) => ({ ...x, type: "word" }));
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** Word errors of a transcript against the script (0 = exact). */
const wordErrors = (script, heard) => lev(wordsOf(script), heard.flatMap((w) => wordsOf(w.text)));
/** Map each script token of `line` to a heard word (exact canon match, in order). */
function mapTokens(line, heard) {
  /* A stand-alone dash ("at all — they're") is punctuation on the word before. */
  const toks = []; for (const t of line.split(/\s+/)) { if (wordsOf(t).length) toks.push(t); else if (toks.length && /[—–-]/.test(t)) toks[toks.length - 1] += "—"; }
  const hc = heard.map((w) => wordsOf(w.text).join(""));
  const out = []; let j = 0;
  for (const t of toks) { const c = wordsOf(t).join(""); let k = j; while (k < hc.length && hc[k] !== c && k < j + 3) k++; if (k < hc.length && hc[k] === c) { out.push({ tok: t, w: heard[k] }); j = k + 1; } else out.push({ tok: t, w: null }); }
  return out;
}
/** Pace, sentence paces and unwanted stops of one line, from its transcript. */
const QUOTE_OPEN = /^["'“‘]/;
function delivery(line, heard) {
  const m = mapTokens(line, heard), got = m.filter((x) => x.w);
  if (got.length < 2) return { rate: NaN, sents: [], maxStop: 0 };
  let maxStop = 0, stopAfter = "";
  for (let i = 1; i < m.length; i++) {
    if (!m[i].w || !m[i - 1].w || /[,.!?;:…—–-]["'”’)]*$/.test(m[i - 1].tok) || QUOTE_OPEN.test(m[i].tok)) continue;
    const g = m[i].w.start - m[i - 1].w.end; if (g > maxStop) { maxStop = g; stopAfter = m[i - 1].tok; }
  }
  const sents = []; let cur = [];
  for (const x of m) { cur.push(x); if (/[.!?]["'”’)]*$/.test(x.tok)) { sents.push(cur); cur = []; } }
  if (cur.length) sents.push(cur);
  /* Pace = speech pace inside sentences (commas included, the pause BETWEEN
   * sentences not), from the words the transcript actually matched. */
  let sy = 0, dur = 0; const sr = [], lists = [];
  for (const s of sents) {
    const g = s.filter((x) => x.w); if (g.length < 2) continue;
    const ss = g.reduce((q, x) => q + lineSyllables(x.tok), 0), d = g.at(-1).w.end - g[0].w.start; if (d <= 0) continue;
    sy += ss; dur += d;
    if (s.length >= 4 && g.length >= s.length - 1) { sr.push(+(ss / d).toFixed(2)); lists.push(s.filter((x) => /,["'”’)]*$/.test(x.tok)).length >= 2); }
  }
  return { rate: dur ? +(sy / dur).toFixed(2) : NaN, sents: sr, lists, maxStop: +maxStop.toFixed(2), stopAfter };
}
/** Transcribe one stretch of a clip on its own (both models when needed). */
async function lineCheck(a, span, line, tmp, profile) {
  const pad = Math.round(SR * 0.2);
  const f = `${tmp}.iso${span[0]}.mp3`;
  await writePcm(concat(new Float32Array(pad), a.slice(span[0], span[1]), new Float32Array(pad)), f);
  const v1 = await stt(f);
  let exact = !compareTake(line, withType(v1)).length, heard = v1, by = "v1";
  if (!exact) { const v2 = await stt(f, "scribe_v2"); if (!compareTake(line, withType(v2)).length) { exact = true; heard = v2; by = "v2"; } }
  await unlink(f).catch(() => {});
  return { exact, by, heard: heard.map((w) => w.text).join(" "), ...delivery(line, heard), ...silences(a.slice(span[0], span[1]), line, heard, 0.2, profile) };
}
/* Silences the TRANSCRIPT cannot show: a dead gap inside "Out| there" sits
 * within the word timestamps, so it is measured from the sound. Longest run
 * of 10ms frames 40 dB under the line's speech level between two words with
 * no punctuation between them. A stop consonant's closure is 30-120ms. */
function silences(seg, line, heard, offset, profile) {
  const P = PROFILES[profile || "kids"];
  const m = mapTokens(line, heard), W = 441, fr = [];
  for (let s = 0; s + W <= seg.length; s += W) { let q = 0; for (let k = s; k < s + W; k++) q += seg[k] * seg[k]; fr.push(q / W); }
  const act = level(seg).active, thr = 10 ** ((act - 40) / 10);
  let maxQuiet = 0, quietAfter = "";
  const pauses = [], runs = [];
  const bare = (t) => t.replace(/[^\w']/g, "");
  for (let i = 1; i < m.length; i++) {
    if (!m[i].w || !m[i - 1].w) continue;
    /* A quoted label ("straight to "No way."") gets the pause a comma would. */
    const pm = /([,.!?;:…—–-])["'”’)]*$/.exec(m[i - 1].tok) || (QUOTE_OPEN.test(m[i].tok) ? [",", ","] : null);
    const f0 = Math.max(0, Math.floor(((m[i - 1].w.start + m[i - 1].w.end) / 2 - offset) * 100)), f1 = Math.min(fr.length, Math.ceil(((m[i].w.start + m[i].w.end) / 2 - offset) * 100));
    let run = 0, best = 0, bestEnd = 0; for (let f = f0; f < f1; f++) { if (fr[f] < thr) { if (++run > best) { best = run; bestEnd = f + 1; } } else run = 0; }
    if (pm) {
      /* At punctuation: the owner's flow standard. Too long is shortened to
       * the standard; a pause is never lengthened. */
      const k = m[i - 1].tok.includes("...") || pm[1] === "…" ? "…" : /[!?]/.test(pm[1]) ? "." : /[—–-]/.test(pm[1]) ? "—" : pm[1] === ";" ? ":" : pm[1];
      const [max, keep] = (P.punct || PUNCT)[k];
      if (best / 100 > max) { pauses.push(`${bare(m[i - 1].tok)}${k}|${bare(m[i].tok)} ${best * 10}ms`); runs.push({ s0: (bestEnd - best) * W, s1: bestEnd * W, keep }); }
      continue;
    }
    if (best / 100 > maxQuiet) { maxQuiet = best / 100; quietAfter = m[i - 1].tok; }
    /* A closure consonant either side ("got| booted", "tap| lock") is
     * allowed a short silence; between vowels and soft sounds ("scam|
     * always", "are| already", "places| appear") any silence is a pause. */
    const cl = closure(m[i - 1].tok, m[i].tok);
    if (best / 100 > (cl ? P.closureGap : P.openGap)) {
      pauses.push(`${bare(m[i - 1].tok)}|${bare(m[i].tok)} ${best * 10}ms`);
      runs.push({ s0: (bestEnd - best) * W, s1: bestEnd * W, keep: cl ? P.closureKeep : P.openKeep });
    }
  }
  /* DEAD AIR: 5ms frames under -75 dBFS anywhere between the first and last
   * word that is not at punctuation. Speech never drops to digital silence
   * mid-phrase; a closure keeps room tone. Measured on W4 Believe-o-Meter
   * "Out| there": 140ms quiet with 65ms of it digital zero - the "Out...
   * there" the tester heard. */
  const D = 220, dz = []; for (let s = 0; s + D <= seg.length; s += D) { let q = 0; for (let k = s; k < s + D; k++) q += seg[k] * seg[k]; dz.push(q / D < 10 ** (-7.5)); }
  let deadAir = 0, deadAfter = "";
  for (let i = 1; i < m.length; i++) {
    if (!m[i].w || !m[i - 1].w || /[,.!?;:…—–-]["'”’)]*$/.test(m[i - 1].tok)) continue;
    const f0 = Math.max(0, Math.floor((m[i - 1].w.start - offset) * 200)), f1 = Math.min(dz.length, Math.ceil((m[i].w.end - offset) * 200));
    let run = 0, best = 0; for (let f = f0; f < f1; f++) { if (dz[f]) best = Math.max(best, ++run); else run = 0; }
    if (best * 5 > deadAir) { deadAir = best * 5; deadAfter = m[i - 1].tok; }
  }
  return { maxQuiet: +maxQuiet.toFixed(2), quietAfter, deadAirMs: deadAir, deadAfter, pauses, runs };
}
/** Shorten each measured mid-phrase silence by cutting out its MIDDLE (the
 *  voice-flow standard: only ever shorten, only inside measured silence),
 *  joined with a 5ms crossfade that also lies inside the silence. */
export function tighten(x, runs) {
  const XF = 220; let out = x;
  for (const r of [...runs].sort((p, q) => q.s0 - p.s0)) {
    const keep = Math.round(r.keep * SR), len = r.s1 - r.s0;
    if (len <= keep + 2 * XF) continue;
    const c0 = r.s0 + Math.floor(keep / 2), c1 = r.s1 - Math.ceil(keep / 2); // cut [c0, c1)
    const head = out.slice(0, c0), tail = out.slice(c1 - XF);
    for (let k = 0; k < XF; k++) { const g = k / XF; tail[k] = head[c0 - XF + k] * (1 - g) + tail[k] * g; }
    out = concat(head.slice(0, c0 - XF), tail);
  }
  return out;
}
function closure(prev, next) {
  const p = prev.toLowerCase().replace(/[^a-z]/g, ""), n = next.toLowerCase().replace(/[^a-z]/g, "");
  return /([ptkbdg]|ck|ed|te|de|ke|pe|be)$/.test(p) || /^([ptkbdgq]|c[^eiy]|ch)/.test(n);
}

/* A job names a manifest clip ("file") or ANY single-take file ("path" +
 * "text": ATLAS briefings, recaps), which is treated as one line. */
function resolve(job) {
  if (job.path) {
    const name = job.path.split(/[\/]/).pop();
    return { e: { speaker: null, lines: [job.text] }, path: job.path, name };
  }
  const e = byFile.get(job.file); if (!e) throw new Error("not in manifest");
  return { e, path: join(DIR, job.file), name: job.file };
}

/* ---------- one job ---------- */
async function runJob(job) {
  const res = { file: job.file, lines: job.lines, mode: job.mode, why: job.why };
  const { e, path, name } = resolve(job);
  job.file = job.file || name; res.file = job.file;
  const clean = e.lines.map(cleanLine).filter((l) => /[a-z0-9]/i.test(l));
  const tmp = join(".reline-tmp", name.replace(".mp3", ""));
  await mkdir(".reline-tmp", { recursive: true });
  let src = path;
  if (!existsSync(path) || statSync(path).size === 0) { src = `${tmp}.orig.mp3`; await writeFile(src, execFileSync("git", ["show", `HEAD:${path.replace(/\\/g, "/")}`], { maxBuffer: 1 << 28 })); }
  const a = decode(src);
  const sp = lineSpans(a, clean.length); if (sp.err) throw new Error(sp.err);
  const spans = sp.spans;
  /* The card's own pace, from the lines that stay. */
  const oldWhole = await stt(src);
  const keepRates = clean.map((l, i) => (job.lines.includes(i) ? NaN : delivery(l, oldWhole.filter((w) => w.start >= spans[i][0] / SR - 0.05 && w.end <= spans[i][1] / SR + 0.05)).rate)).filter((r) => r > 0);
  const med = keepRates.length ? [...keepRates].sort((p, q) => p - q)[keepRates.length >> 1] : 3.75;
  // job.target: a clip with its own deliberate pace (the Barker read-aloud messages, 2026-11-16)
  const target = job.target ?? Math.min(STD.cardTarget[1], Math.max(STD.cardTarget[0], med));
  const cardPitch = (() => { const ps = clean.map((_, i) => (job.lines.includes(i) ? NaN : pitch(a.slice(...spans[i])))).filter((p) => p > 0); return ps.length ? ps.sort((p, q) => p - q)[ps.length >> 1] : pitch(a); })();
  /* Tone reference: the card's other lines; a one-line clip is held to the
   * voice's own course-wide median (screened 2026-11-19: Emma 245-251 Hz). */
  const others = clean.length - job.lines.length;
  const refPitch = others >= 1 ? cardPitch : COURSE_PITCH[e.speaker] ?? cardPitch;
  res.card = { target: +target.toFixed(2), pitch: Math.round(cardPitch), refPitch: Math.round(refPitch) };

  const newParts = new Map();
  res.line = {};
  for (const i of job.lines) {
    const line = clean[i], old = a.slice(...spans[i]);
    const before = await lineCheck(a, spans[i], line, tmp, job.profile);
    const oldLv = level(old), oldF0 = pitch(old);
    let part, how;
    const ops = [].concat(job.ops?.[i] ?? job.mode);
    const measure = (x, tag) => lineCheck(concat(new Float32Array(SR), x, new Float32Array(SR)), [SR, SR + x.length], line, `${tmp}.L${i}${tag}`, job.profile);
    const atempo = async (x, f) => {
      const inF = `${tmp}.L${i}.in.wav`, outF = `${tmp}.L${i}.tempo.wav`;
      await writePcm(concat(x, new Float32Array(Math.round(SR * 0.3))), inF, "wav"); // atempo drops the tail: pad it
      ff(["-i", inF, "-af", `atempo=${f.toFixed(4)}`, "-ar", String(SR), "-ac", "1", outF]);
      const y = decode(outF).slice(0, Math.round(x.length / f));
      await unlink(inF).catch(() => {}); await unlink(outF).catch(() => {});
      return y;
    };
    /* Only ever CALMS, toward the card's pace, judged by the fastest
     * sentence; never below TEMPO_MIN. */
    const calmTo = (chk) => { const fastest = Math.max(chk.rate || 0, ...chk.sents); return Math.min(1, Math.max(TEMPO_MIN, Math.min(target, LINE_MAX) / fastest)); };
    if (!ops.includes("retake")) {
      part = old.slice(); how = {};
      if (ops.includes("tighten")) {
        // Measured again now: no pause left to shorten means this line needs nothing.
        if (!before.runs.length && !ops.includes("retempo")) { (res.unchanged ||= []).push(i); continue; }
        part = tighten(part, before.runs);
        how.tightenedMs = Math.round(((old.length - part.length) / SR) * 1000);
      }
      if (ops.includes("retempo")) { const f = calmTo(before); part = await atempo(part, f); how.tempo = +f.toFixed(3); }
      else if (how.tightenedMs) {
        /* Shorter pauses raise the pace: if that makes a sentence rush, calm it. */
        const chk = await measure(part, ".t");
        if (Math.max(chk.rate || 0, ...chk.sents) > STD.sentRate[1] - 0.2 || chk.rate > STD.lineRate[1]) { const f = calmTo(chk); part = await atempo(part, f); how.tempo = +f.toFixed(3); }
      }
      if (how.tightenedMs || how.tempo) {
        for (let pass = 0; pass < 3; pass++) {
          const chk = await measure(part, `.c${pass}`);
          if (!chk.runs.length) break;
          const n0 = part.length; part = tighten(part, chk.runs); how.tightenedMs = (how.tightenedMs || 0) + Math.round(((n0 - part.length) / SR) * 1000);
        }
      }
    } else {
      /* Up to job.takes generations; the take that best meets the standard
       * (words, pace, pauses, and a TONE that sits with the card) is kept. */
      const say = job.say?.[i] ?? line;
      const voiceId = manifest.voices[e.speaker].id;
      let best = null;
      let slowVoice = false; // a take far too fast for the 0.88 tempo floor: ask the voice itself to slow down
      for (let k = 0; k < (job.takes || 3); k++) {
        const notes = [];
        let t;
        try { t = await recordLine({ key: KEY, voiceId, model: manifest.model, settings: { ...(job.settings || manifest.voiceSettings), ...(slowVoice ? { speed: 0.8 } : {}) }, log: (s) => notes.push(s) }, say, clean[i - 1], clean[i + 1], `${tmp}.L${i}.k${k}`); }
        catch (err) { (res.takeErrors ||= []).push(String(err.message).slice(0, 300)); continue; }
        if (t.failed) { (res.takeErrors ||= []).push(notes.join("; ").slice(0, 300)); await unlink(t.wav).catch(() => {}); continue; }
        const dl = delivery(say, t.words);
        const rawRate = dl.rate > 0 ? dl.rate : lineSyllables(say) / Math.max(0.3, t.words.at(-1).end - t.words[0].start);
        const rawFast = Math.max(rawRate, ...dl.sents);
        if (rawFast * (job.tempoMin ?? TEMPO_MIN) > STD.sentRate[1] - 0.1) slowVoice = true;
        const tempo = Math.min(TEMPO_MAX, Math.max(job.tempoMin ?? TEMPO_MIN, Math.min(target / rawRate, LINE_MAX / rawFast)));
        const outF = `${tmp}.L${i}.k${k}.part.wav`;
        shapeLine(t, tempo, outF);
        let p = decode(outF);
        await unlink(outF).catch(() => {}); await unlink(t.wav).catch(() => {});
        const h = { tempo: +tempo.toFixed(3), rawRate: +rawRate.toFixed(2), take: k + 1, notes };
        let chk = await measure(p, `.k${k}`);
        // a fresh take is always measured and its mid-phrase pauses shortened
        for (let pass = 0; pass < 3 && chk.runs.length; pass++) { const n0 = p.length; p = tighten(p, chk.runs); h.tightenedMs = (h.tightenedMs || 0) + Math.round(((n0 - p.length) / SR) * 1000); chk = await measure(p, `.k${k}t${pass}`); }
        const dev = Math.abs(semis(pitch(p), refPitch));
        const score = (chk.exact ? 0 : 100) + 10 * chk.pauses.length + 10 * Math.max(0, STD.lineRate[0] - 0.2 - chk.rate, chk.rate - STD.lineRate[1])
          + 10 * Math.max(0, ...chk.sents.map((r) => r - STD.sentRate[1])) + 5 * Math.max(0, dev - STD.pitchTol);
        const [hd] = edges(p), lvp = level(p).active, lastTok = say.split(/s+/).at(-1);
        const extra = (hd > lvp - 15 ? 20 : 0) + (expectsQuietTail(lastTok) && tailMs(p) < 70 ? 20 : 0);
        h.score = +(score + extra).toFixed(2); h.pitchDev = +dev.toFixed(1);
        if (!best || h.score < best.score) best = { p, h, score: h.score };
        if (h.score === 0) break;
      }
      if (!best) { res.ok = false; res.reason = `L${i}: no clean take`; return res; }
      part = best.p; how = best.h;
    }
    /* Loudness: match the line it replaces. A peakier new take is held under
     * the ceiling by a gentle limiter, never by turning the whole line down. */
    /* "level": a line far off the course's speech level is brought to it. */
    const toActive = ops.includes("level") ? (job.level ?? COURSE_ACTIVE) : oldLv.active;
    let g = Math.max(-8, Math.min(8, toActive - level(part).active));
    const k = 10 ** (g / 20); for (let s = 0; s < part.length; s++) part[s] *= k;
    if (level(part).peak > STD.peakMax - 0.5) {
      const inF = `${tmp}.L${i}.lim.in.wav`, outF = `${tmp}.L${i}.lim.wav`;
      await writePcm(part, inF, "f32wav");
      ff(["-i", inF, "-af", `alimiter=limit=${(10 ** ((STD.peakMax - 1) / 20)).toFixed(4)}:attack=5:release=60:level=disabled`, "-ar", String(SR), "-ac", "1", "-c:a", "pcm_f32le", outF]);
      part = decode(outF).slice(0, part.length); how.limited = true;
      await unlink(inF).catch(() => {}); await unlink(outF).catch(() => {});
    }
    newParts.set(i, part);
    res.line[i] = { text: line, before: { ...before, active: +oldLv.active.toFixed(1), pitch: Math.round(oldF0), f0: oldF0, edges: edges(old) }, how };
  }

  let fails, outMp3;
  for (let attempt = 0; ; attempt++) {
  // Nothing left to change: never re-encode a clip for no reason.
  if (!newParts.size) { res.ok = false; res.reason = "nothing to change (measured again)"; if (src !== path) await unlink(src).catch(() => {}); return res; }
  /* Splice: every untouched line and every break kept sample for sample. */
  const pieces = [], where = [];
  let cursor = 0, pos = 0;
  for (let i = 0; i < clean.length; i++) {
    const gapBefore = a.slice(cursor, spans[i][0]); pieces.push(gapBefore); pos += gapBefore.length;
    const p = newParts.get(i) || a.slice(...spans[i]);
    where.push([pos, pos + p.length]); pieces.push(p); pos += p.length; cursor = spans[i][1];
  }
  pieces.push(a.slice(cursor));
  const out = concat(...pieces);
  outMp3 = `${tmp}.out.mp3`;
  await writePcm(out, outMp3);
  const b = decode(outMp3);

  /* ---------- the gate ---------- */
  fails = [];
  // 1. every line NOT replaced is unchanged (vs the original, after re-encoding)
  for (let i = 0; i < clean.length; i++) {
    if (newParts.has(i)) continue;
    const [s0, s1] = spans[i], [t0] = where[i];
    let e2 = 0, p2 = 0; for (let s = s0; s < s1; s++) { const d = a[s] - (b[t0 + s - s0] || 0); e2 += d * d; p2 += a[s] * a[s]; }
    const snr = 10 * Math.log10(p2 / Math.max(e2, 1e-20));
    if (snr < STD.untouchedSnr) fails.push(`L${i} changed (${snr.toFixed(1)} dB)`);
  }
  // 2-7. the replaced lines
  const nb = lineSpans(b, clean.length);
  if (nb.err) fails.push(`breaks: ${nb.err}`);
  for (const i of newParts.keys()) {
    const span = nb.spans ? nb.spans[i] : where[i];
    const after = await lineCheck(b, span, clean[i], tmp, job.profile);
    const seg = b.slice(...span), lv = level(seg), f0 = pitch(seg);
    const L = res.line[i]; L.after = { ...after, active: +lv.active.toFixed(1), pitch: Math.round(f0) };
    const tag = `L${i}`, B = L.before;
    const ops = [].concat(job.ops?.[i] ?? job.mode), retake = ops.includes("retake");
    /* Every measure: NO WORSE than the line it replaces. What the job set out
     * to fix: actually FIXED (a retake is held to the full standard). */
    const outBy = (v, [lo, hi]) => (v < lo ? lo - v : v > hi ? v - hi : 0);
    if (!after.exact && (B.exact || retake)) fails.push(`${tag} words: heard "${after.heard}"`);
    // a new take with commas reads a touch lower; a 1-5 syllable line is mostly its punctuation pause
    const calmedLine = after.rate < B.rate && Math.max(0, ...after.sents) <= 5.0 && Math.max(0, ...after.sents) <= 0.9 * Math.max(0, ...B.sents);
    const band = retake ? [lineSyllables(clean[i]) < 6 ? 0 : STD.lineRate[0] - 0.2, STD.lineRate[1]] : STD.lineRate;
    // a retake that clearly improved a stretched line and lands within 0.1 of the band counts as fixed
    if (retake || ops.includes("retempo") ? outBy(after.rate, band) > (retake && after.rate > B.rate + 0.2 ? 0.1 : 0) && !(retake && calmedLine) : outBy(after.rate, STD.lineRate) > outBy(B.rate, STD.lineRate) + 0.05) fails.push(`${tag} pace ${B.rate} -> ${after.rate}`);
    const fastOut = (s) => Math.max(0, ...s.map((r) => r - STD.sentRate[1])), slowOut = (s, li = []) => Math.max(0, ...s.map((r, k) => (li[k] ? 0 : STD.sentRate[0] - r))); // a list ("report, block, tell") is slow by its commas
    /* A retake of a FAST line counts as fixed when its fastest sentence came
     * down by 10% or more and sits at 5.0 or under (calming is capped at 0.88x). */
    const top = (x) => Math.max(0, ...x), calmed = top(after.sents) <= 5.0 && top(after.sents) <= 0.9 * top(B.sents);
    if ((retake ? fastOut(after.sents) > 0 && !calmed : fastOut(after.sents) > fastOut(B.sents) + 0.05) || slowOut(after.sents, after.lists) > slowOut(B.sents, B.lists) + 0.05) fails.push(`${tag} sentence pace [${B.sents}] -> [${after.sents}]`);
    const stretch = 1 / (L.how.tempo && !retake ? L.how.tempo : 1); // an even slow-down scales every pause by exactly this
    if (after.maxStop > (retake ? STD.maxStop + 0.05 : Math.max(STD.maxStop, B.maxStop * stretch + 0.02))) fails.push(`${tag} stop ${after.maxStop}s after "${after.stopAfter}"`);
    if (after.maxQuiet > (retake ? STD.maxQuiet : Math.max(STD.maxQuiet, B.maxQuiet))) fails.push(`${tag} dead gap ${after.maxQuiet}s after "${after.quietAfter}"`);
    if (retake || ops.includes("tighten") ? after.pauses.length : after.pauses.length > B.pauses.length) fails.push(`${tag} pauses mid-phrase: ${after.pauses.join(", ")}`);
    const wantActive = ops.includes("level") ? (job.level ?? COURSE_ACTIVE) : L.before.active;
    if (Math.abs(lv.active - wantActive) > STD.loudTol) fails.push(`${tag} loudness ${(lv.active - wantActive).toFixed(1)} dB off ${ops.includes("level") ? "the course level" : "the old line"}`);
    /* Tone: the new line sits where the old one did, or closer to the card. */
    const dev = Math.abs(semis(f0, refPitch)), oldDev = Math.abs(semis(B.f0, refPitch)), move = Math.abs(semis(f0, B.f0));
    /* Tone: where the old line was, or closer to the card, or inside the voice's normal spread. */
    if (!(move <= STD.pitchTol || dev <= oldDev + 0.2 || dev <= 1.2)) fails.push(`${tag} pitch moved ${move.toFixed(1)} st, ${dev.toFixed(1)} st off the card`);
    // edges faded: no hard cut into the break
    const edge = (x) => db(Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length));
    const head = edge(seg.slice(0, 441)), tail = edge(seg.slice(-441));
    if ((head > lv.active - 15 && head > B.edges[0] + 3) || (tail > lv.active - 15 && tail > B.edges[1] + 3)) fails.push(`${tag} hard edge (${head.toFixed(0)}/${tail.toFixed(0)} dB)`);
    // final consonant kept
    const lastTok = clean[i].split(/\s+/).at(-1);
    if (expectsQuietTail(lastTok)) {
      L.after.tailMs = tailMs(seg); B.tailMs = tailMs(a.slice(...spans[i]));
      if (L.after.tailMs < Math.min(70, B.tailMs)) fails.push(`${tag} final consonant ${B.tailMs} -> ${L.after.tailMs}ms`);
    }
  }
  // 8. whole clip: no worse than before, word for word, on both transcribers
  const errs = async (f) => { const v1 = await stt(f); let e1 = wordErrors(clean.join(" "), v1); if (e1) e1 = Math.min(e1, wordErrors(clean.join(" "), await stt(f, "scribe_v2"))); return e1; };
  res.wholeErrors = { before: await errs(src), after: await errs(outMp3) };
  if (res.wholeErrors.after > res.wholeErrors.before) fails.push(`whole clip word errors ${res.wholeErrors.before} -> ${res.wholeErrors.after}`);
  if (level(b).peak > STD.peakMax) fails.push(`peak ${level(b).peak.toFixed(1)} dBFS`);
  res.len = { before: +(a.length / SR).toFixed(2), after: +(b.length / SR).toFixed(2) };
    /* PER-LINE acceptance: a replaced line that failed goes back to its old
     * audio and the clip is assembled and gated AGAIN from scratch, so one bad
     * line never throws away the good fixes beside it, and nothing unchecked
     * ships. Clip-wide failures (an untouched line changed, word errors,
     * peak) are never split this way. */
    const mine = (f) => { const m = /^L(d+) /.exec(f); return m && newParts.has(+m[1]) ? +m[1] : null; };
    const bad = new Set(fails.map(mine).filter((x) => x !== null));
    if (!fails.length || attempt > 0 || fails.some((f) => mine(f) === null) || bad.size === newParts.size) break;
    for (const i of bad) { newParts.delete(i); res.line[i].keptOld = fails.filter((f) => f.startsWith(`L${i} `)); }
    res.keptOldLines = [...bad];
    await unlink(outMp3).catch(() => {});
  }

  res.ok = !fails.length; res.fails = fails;
  if (res.ok && !DRY) {
    await mkdir(".reline-before", { recursive: true });
    if (src === path) await copyFile(path, join(".reline-before", job.file)); else await copyFile(src, join(".reline-before", job.file));
    await mkdir(dirname(path), { recursive: true });
    await copyFile(outMp3, path);
    res.sha = { before: sha(readFileSync(src)), after: sha(readFileSync(path)) };
  } else {
    await mkdir(".reline-rejected", { recursive: true });
    await copyFile(outMp3, join(".reline-rejected", job.file));
  }
  await unlink(outMp3).catch(() => {});
  if (src !== path) await unlink(src).catch(() => {});
  return res;
}

/* ---------- --screen: measure every line of the named clips, change nothing ----------
 * The inventory a fix list is built from, and the baseline it is checked
 * against afterwards: each line transcribed ON ITS OWN (a whole-clip
 * transcript blurs line ends), with pace, sentence paces, stops, loudness and
 * pitch. jobs.json for --screen is just a list of file names. */
if (argv.includes("--screen")) {
  const { appendFile } = await import("node:fs/promises");
  const doneS = new Set(existsSync(REPORT) ? readFileSync(REPORT, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l).file) : []);
  const q = JOBS.map((j) => (typeof j === "string" ? { file: j } : j)).filter((j) => !doneS.has(j.file || j.path));
  let k = 0;
  const one = async (job) => {
    const { e, path: jpath, name } = resolve(job);
    const file = job.file || job.path;
    const clean = e.lines.map(cleanLine).filter((l) => /[a-z0-9]/i.test(l));
    const tmp = join(".reline-tmp", "scr-" + name.replace(".mp3", ""));
    await mkdir(".reline-tmp", { recursive: true });
    const path = jpath;
    let src = path;
    if (!existsSync(path) || statSync(path).size === 0) { src = `${tmp}.orig.mp3`; await writeFile(src, execFileSync("git", ["show", `HEAD:${path.replace(/\\/g, "/")}`], { maxBuffer: 1 << 28 })); }
    try {
      const a = decode(src), sp = lineSpans(a, clean.length);
      if (sp.err) return { file, sha: sha(readFileSync(src)), err: sp.err };
      const lines = [];
      for (let i = 0; i < clean.length; i++) {
        const seg = a.slice(...sp.spans[i]), lv = level(seg);
        lines.push({ i, text: clean[i], ...(await lineCheck(a, sp.spans[i], clean[i], tmp, job.profile)), active: +lv.active.toFixed(1), peak: +lv.peak.toFixed(1), pitch: Math.round(pitch(seg)), dur: +(seg.length / SR).toFixed(2) });
      }
      return { file, sha: sha(readFileSync(src)), speaker: e.speaker, n: clean.length, lines };
    } finally { if (src !== path) await unlink(src).catch(() => {}); }
  };
  await Promise.all(Array.from({ length: Math.min(POOL, q.length) }, async () => {
    while (q.length) {
      const f = q.shift(); let r;
      try { r = await one(f); } catch (err) { r = { file: f.file || f.path, err: String(err.message || err).slice(0, 200) }; }
      await appendFile(REPORT, JSON.stringify(r) + "\n");
      if (++k % 50 === 0) console.log(`screened ${k}`);
    }
  }));
  console.log(`screened ${k} clips -> ${REPORT}`);
  process.exit(0);
}

/* ---------- run ---------- */
const report = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : [];
const done = new Set(report.filter((r) => r.ok).map((r) => r.file + ":" + r.lines.join(",")));
const queue = JOBS.filter((j) => !done.has(j.file + ":" + j.lines.join(",")));
let n = 0;
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    let r;
    try { r = await runJob(job); } catch (err) { r = { file: job.file, lines: job.lines, ok: false, reason: String(err.message || err).slice(0, 300) }; }
    report.push(r); n++;
    await writeFile(REPORT, JSON.stringify(report, null, 1));
    const L = Object.entries(r.line || {}).map(([i, x]) => `L${i} ${x.before?.rate}->${x.after?.rate ?? "?"} syl/s`).join(" ");
    console.log(`${r.ok ? (DRY ? "PASS(dry)" : "DONE") : "KEPT"} ${job.file} ${L} ${r.ok ? "" : (r.reason || r.fails?.join("; "))}`.slice(0, 400));
  }
}
await Promise.all(Array.from({ length: Math.min(POOL, queue.length) }, worker));
console.log(`${n} jobs, ${report.filter((r) => r.ok).length} passed in total`);

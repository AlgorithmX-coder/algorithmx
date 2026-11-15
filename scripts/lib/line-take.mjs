/**
 * LINE-TAKE recording: one generation per narration line, verified word for
 * word, assembled with fixed breaks. Replaces per-sentence delivery +
 * shapeToSpec.
 *
 * Owner UAT, 2026-11-15 (weeks 2 and 3). The voice kept adding an "elk" sound,
 * cutting words off ("WHERE you ar.."), putting no break between bullet
 * points, pausing inside "You've ... got this", saying a phrase twice
 * ("When you are not sure, when you are not sure"), and racing or sounding
 * robotic. Measured, and almost none of it was the voice:
 *
 *   "elk"          The old path added " Okay." after EVERY sentence (so the
 *                  model would not swallow a final consonant) and then cut it
 *                  off by guessing from loudness. Scraps survived. A
 *                  transcriber hears them as "Ok." - 3 in one 4-line card.
 *   cut-offs       shapeToSpec spliced digital silence in at the transcript's
 *                  word end, which is early on soft or whispered endings. 1,630
 *                  of 5,017 clips dropped from speech straight to -120 dB.
 *   wrong pauses   the "Ok" scraps knocked the script/transcript alignment
 *                  off, so pauses landed after the wrong word.
 *   rushing        every fragment got its own atempo.
 *   repeats        the model itself. Nothing checked for EXTRA words.
 *
 * What this does instead, and the owner approved it by ear on five cards:
 *   - one generation per LINE (a line is a bullet on screen), with the
 *     neighbouring lines as previous_text / next_text for continuity;
 *   - the filler is kept (it does protect the final consonant), but it is cut
 *     at the moment the TRANSCRIPT says the "Okay" starts, with a 30ms fade -
 *     never by loudness;
 *   - the trimmed take is transcribed AGAIN and rejected unless it is exactly
 *     the line: nothing missing, nothing repeated, nothing extra, no audio
 *     events. Up to MAX_TAKES; if two takes mismatch IDENTICALLY, that is the
 *     transcriber's quirk (deliberate misspellings like "HAPYP BIRHTDAY"), so
 *     it is accepted and reported;
 *   - lines are joined by a fixed LINE_GAP, every edge faded, never a hard cut;
 *   - one tempo for the whole card toward TARGET_WPM, and a line that still
 *     reads faster than LINE_MAX_WPM is slowed to LINE_CAP_WPM;
 *   - no mood tags and no shouted CAPS: the owner found both made the tone and
 *     stress uneven ("unnecessary stressing", "inconsistent tone").
 */
import { readFile, writeFile, mkdir, unlink, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import ffmpegPath from "ffmpeg-static";

export const LINE_GAP = 0.75;
const MAX_INNER_GAP = 0.6;
const TARGET_WPM = 160;
const LINE_MAX_WPM = 180;
const LINE_CAP_WPM = 172;
const MAX_TAKES = Number(process.env.LINETAKE_MAX_TAKES) || 5;
const FILLER = " Okay.";
const TARGET_SPEECH_DB = -15.0;
const PEAK_CEILING_DB = -1.5;
const ACRONYMS = new Set(["AI", "OK", "QR", "TV", "PIN", "ID", "URL", "PC", "UK", "USB", "SMS", "DM", "VPN", "WIFI", "FAQ"]);

/* What the model is GIVEN for a line. The manifest text and the clip name are
 * untouched - the app looks clips up by the written lines. */
export function cleanLine(line) {
  return String(line)
    .replace(/\[[a-z ]+\]\s*/gi, "")
    /* A price is "seven ninety-nine", never "seven point nine nine". */
    .replace(/\b(\d{1,3})\.(\d\d)\b/g, (m, a, b) => `${a} ${Number(b) < 20 ? ONES[Number(b)] : TENS[Math.floor(b / 10)] + (b % 10 ? "-" + ONES[b % 10] : "")}`)
    .replace(/\b[A-Z][A-Z']+\b/g, (w) => (ACRONYMS.has(w) ? w : w.toLowerCase()))
    .replace(/(^|[.!?]\s+|\.\.\.\s*)([a-z])/g, (m, a, b) => a + b.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function numWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + "hundred" + (n % 100 ? numWords(n % 100) : "");
  if (n < 1e6) return numWords(Math.floor(n / 1000)) + "thousand" + (n % 1000 ? numWords(n % 1000) : "");
  return String(n);
}
/* Words that SOUND the same and only differ in how the transcriber chose to
 * spell them. The full run (2026-11-15) threw away 40-odd good takes over
 * these: "phishing" written "fishing", "ladder" as "latter", "mum" as "mom".
 * Whole words only, so a dropped "-ed" ("installed" -> "install") still fails. */
const SAME_SOUND = {
  phishing: "fishing", phish: "fish", mom: "mum", moms: "mums", pajamas: "pyjamas", byte: "bite", bytes: "bites",
  reel: "real", latter: "ladder", borough: "burrow", missus: "misses", tally: "telly", em: "him", their: "theyre",
  there: "theyre", adore: "adoor", britebox: "brightbox", pryzebot: "prizebot", petz: "pets",
};
/* One canonical spelling, so a transcriber's American spelling or digits are
 * not mistaken for a different word. Applied to BOTH sides. */
function canon(tok) {
  let w = tok.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, "");
  w = w.replace(/\d+/g, (d) => (d.length < 7 ? numWords(Number(d)) : d));
  w = w.replace(/'/g, "");
  w = SAME_SOUND[w] ?? w;
  w = w.replace(/our(s?)$/, "or$1").replace(/is(e|ed|es|ing)$/, "iz$1").replace(/tre$/, "ter").replace(/^grey/, "gray").replace(/^ok$/, "okay");
  return w;
}
function wordsOf(text) {
  return String(text)
    .replace(/\[[a-z ]+\]/gi, " ")
    .replace(/(\d)[,](\d)/g, "$1$2")
    // Clock times: "6:00" is said "six", "3:15" is said "three fifteen".
    .replace(/\b(\d{1,2}):00\b/g, "$1").replace(/\b(\d{1,2}):(\d\d)\b/g, "$1 $2")
    .split(/[\s\-–—/]+/).map(canon).filter(Boolean);
}

/** Problems with a take, [] = says exactly the line. */
export function compareTake(lineText, heard) {
  const want = wordsOf(lineText);
  const got = heard.filter((w) => w.type === "word").flatMap((w) => wordsOf(w.text));
  const probs = [];
  const events = heard.filter((w) => w.type === "audio_event").map((w) => w.text);
  if (events.length) probs.push(`sound: ${events.join(", ")}`);
  if (want.join("") !== got.join("")) probs.push(`heard "${got.join(" ")}"`);
  return probs;
}

function ff(args) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${String(r.stderr).slice(0, 300)}`);
  return r;
}
function duration(f) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-i", f], { encoding: "utf8" });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || "");
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
}
function volume(f) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-i", f, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  const s = r.stderr || "";
  return { mean: Number(/mean_volume: (-?[\d.]+)/.exec(s)?.[1]), max: Number(/max_volume: (-?[\d.]+)/.exec(s)?.[1]) };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tts(key, voiceId, model, settings, text, prev, next) {
  const body = { text, model_id: model, voice_settings: settings };
  if (prev) body.previous_text = prev;
  if (next) body.next_text = next;
  for (let a = 0; a < 8; a++) {
    let r;
    try {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST", headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" }, body: JSON.stringify(body),
      });
    } catch { await sleep(3000 * (a + 1)); continue; }
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    const t = await r.text();
    if (r.status === 400 && /previous_text|next_text/.test(t)) { delete body.previous_text; delete body.next_text; continue; }
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    throw new Error(`TTS ${r.status} ${t.slice(0, 300)}`);
  }
  throw new Error("TTS retries exhausted");
}

export async function transcribeFull(key, file) {
  const buf = await readFile(file);
  for (let a = 0; a < 8; a++) {
    const fd = new FormData();
    fd.append("model_id", "scribe_v1");
    fd.append("tag_audio_events", "true");
    fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
    let r;
    try { r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": key }, body: fd }); }
    catch { await sleep(3000 * (a + 1)); continue; }
    if (r.ok) return ((await r.json()).words || []).filter((w) => w.type !== "spacing" && Number.isFinite(w.start));
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    throw new Error(`STT ${r.status} ${(await r.text()).slice(0, 200)}`);
  }
  throw new Error("STT retries exhausted");
}

/* Same rule as audit-consonant-integrity's expectsQuietTail: does this word
 * end in an unvoiced sound that needs 100-250ms of quiet speech after the
 * vowel? Kept in step with the audit by hand; the audit is what CI runs. */
const VOICELESS_FINAL_S = new Set(["this", "yes", "gas", "bias", "atlas", "canvas", "chaos"]);
/* Spelled with an unvoiced ending, said without one: "OK" is "okay", and
 * "with" ends on the voiced th of "this". Same list as the audit. */
const VOICED_ENDING = new Set(["ok", "with"]);
export function expectsQuietTail(word) {
  let w = String(word || "").toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return false;
  w = w.replace(/'s$/, "s").replace(/'/g, "");
  const whole = w;
  if (VOICED_ENDING.has(whole)) return false;
  if (VOICELESS_FINAL_S.has(whole)) return true;
  if (/(ous|us)$/.test(whole)) return true;
  w = w.replace(/e$/, "");
  if (!w) return false;
  if (/ng$/.test(w)) return false;
  if (/(s|z|ch|sh|x|g)es$/.test(w)) return false;
  w = w.replace(/es$/, "s");
  if (/([pkfxs]|ss|ch|sh)ed$/.test(w)) return true;
  if (/(ough|augh)$/.test(w)) return /^(enough|tough|rough|laugh|cough|trough|slough)$/.test(w);
  if (/(igh|eigh)$/.test(w)) return false;
  if (/(ch|sh|th|ck|ph|gh)$/.test(w)) return true;
  if (/s$/.test(w)) return /(ss|[ptkfx]s)$/.test(w);
  return /[tkpfx]$/.test(w);
}

const PCM_SR = 16000;
function pcm(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(PCM_SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}
/**
 * Where to cut a raw take (line + " Okay.") so the line keeps all of its last
 * word and none of the filler. `before` = the line's last word, `last` = the
 * filler, both from the transcript. Returns { at } in seconds, or { err }.
 */
export function acousticCut(raw, before, last) {
  const a = pcm(raw), n = a.length, W = PCM_SR / 100; // 10ms frames
  const lv = (f) => { let s = 0; const i0 = f * W; for (let i = i0; i < Math.min(n, i0 + W); i++) s += a[i] * a[i]; return Math.sqrt(s / W); };
  const frames = Math.floor(n / W);
  /* Peak of the LINE only. The filler "Okay" is often the loudest thing in a
   * take; measured against it, the line's ending looked longer than it was
   * and takes passed here that CI then failed once the filler was gone. */
  const lineEnd = Math.max(1, Math.floor((last.start - 0.05) * 100));
  let peak = 0; for (let f = 0; f < Math.min(frames, lineEnd); f++) peak = Math.max(peak, lv(f));
  if (!peak) return { err: "silent-take" };
  const f0 = Math.floor(before.start * 100), fEnd = Math.min(frames, Math.ceil((last.start + 0.08) * 100));
  /* The filler's onset, from the sound: the first loud frame at or after the
   * transcript's estimate, searched back a little in case it started early. */
  let onset = -1;
  for (let f = Math.max(f0 + 1, Math.floor((last.start - 0.08) * 100)); f < Math.min(frames, fEnd + 15); f++) if (lv(f) > peak * 0.06) { onset = f; break; }
  if (onset < 0) return { err: "no-filler-onset" };
  /* The quiet run that leads into the filler: walk back from the onset. */
  const quiet = (f) => lv(f) < peak * 0.01;
  let q1 = onset - 1; while (q1 > f0 && !quiet(q1)) q1--;   // skip the filler's own soft attack
  if (q1 <= f0 || onset - q1 > 6) return { err: "filler-runs-on" };
  let q0 = q1; while (q0 > f0 && quiet(q0 - 1)) q0--;
  if (q1 - q0 + 1 < 4) return { err: "no-gap-before-filler" };      // under 40ms of quiet
  const at = (q0 + Math.min(3, Math.floor((q1 - q0 + 1) / 2))) / 100;
  /* Measure the kept ending the way CI does: loud end -> last trace of sound. */
  if (expectsQuietTail(before.text)) {
    const s0 = Math.floor(before.start * PCM_SR), s1 = Math.floor(at * PCM_SR), w = Math.round(PCM_SR * 0.02);
    const l2 = (i0) => { let s = 0, c = 0; for (let i = i0; i < Math.min(s1, i0 + w); i++) { s += a[i] * a[i]; c++; } return c ? Math.sqrt(s / c) : 0; };
    let loudEnd = -1; for (let i = s1 - w; i >= s0; i -= w) if (l2(i) > peak * 0.06) { loudEnd = i + w; break; }
    let tail = loudEnd; for (let i = loudEnd; i + w <= s1; i += w) if (l2(i) > peak * 0.004) tail = i + w;
    if (loudEnd < 0 || (tail - loudEnd) / PCM_SR < 0.08) return { err: `short-tail(${Math.round(((tail - loudEnd) / PCM_SR) * 1000)}ms)` };
  }
  return { at };
}

async function recordLine(ctx, line, prev, next, tmp) {
  let best = null;
  const seen = new Map();
  for (let take = 1; take <= MAX_TAKES; take++) {
    const raw = `${tmp}.t${take}.raw.mp3`;
    await writeFile(raw, await tts(ctx.key, ctx.voiceId, ctx.model, ctx.settings, line + FILLER, prev, next));
    const heard = (await transcribeFull(ctx.key, raw)).filter((w) => w.type === "word");
    const last = heard.at(-1), before = heard.at(-2);
    if (!last || !before || canon(last.text) !== "okay") { await unlink(raw).catch(() => {}); ctx.log(`filler-not-last t${take}`); continue; }
    /* The transcript's word end sits at the VOWEL; a final t/s/k runs 100-250ms
     * past it (audit-consonant-integrity). 0.12s clipped "it!" and "guess." in
     * the first run, so keep up to 0.28s, but never into the filler. A filler
     * that starts under 0.15s after the word leaves no clean cut: retake. */
    if (last.start - before.end < 0.15) { await unlink(raw).catch(() => {}); ctx.log(`filler-too-close t${take}`); continue; }
    /* ⚠️ The full run (2026-11-15) still clipped 75 clip endings ("minute" ->
     * "minut") with the timing rule alone: the transcript's word end and the
     * filler's start are both estimates, and a final t's release burst comes
     * AFTER a short closure silence, so a cut chosen from timestamps can land
     * in that closure. The cut is now chosen from the SOUND: the silence that
     * runs into the filler, which only exists once the burst is over. Then the
     * consonant is measured exactly as CI's audit-consonant-integrity does;
     * short means retake, never ship. */
    const cut = acousticCut(raw, before, last);
    if (cut.err) { await unlink(raw).catch(() => {}); ctx.log(`${cut.err} t${take}`); continue; }
    const wav = `${tmp}.t${take}.wav`;
    ff(["-i", raw, "-t", cut.at.toFixed(3), "-af", `afade=t=out:st=${Math.max(0, cut.at - 0.03).toFixed(3)}:d=0.03`, "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", wav]);
    await unlink(raw).catch(() => {});
    /* Verify the TRIMMED take, as mp3 (what ships), not the raw one. */
    const probeMp3 = `${tmp}.t${take}.chk.mp3`;
    ff(["-i", wav, "-c:a", "libmp3lame", "-b:a", "128k", probeMp3]);
    const check = await transcribeFull(ctx.key, probeMp3);
    await unlink(probeMp3).catch(() => {});
    const probs = compareTake(line, check);
    const words = check.filter((w) => w.type === "word");
    const info = { wav, words, probs, take };
    if (!probs.length && words.length) { if (best && best.wav !== wav) await unlink(best.wav).catch(() => {}); return info; }
    ctx.log(`t${take} ${probs.join("; ").slice(0, 160)}`);
    const sig = probs.join("|");
    if (words.length && seen.has(sig) && !/sound:/.test(sig)) {
      /* Same mismatch twice: the transcriber, not the take. */
      if (best && best.wav !== wav) await unlink(best.wav).catch(() => {});
      return { ...info, quirk: true };
    }
    seen.set(sig, true);
    if (!best && words.length) best = info; else await unlink(wav).catch(() => {});
  }
  if (!best) throw new Error(`no usable take for line: ${line.slice(0, 80)}`);
  return { ...best, failed: true };
}

/**
 * Record a block (card) with the line-take method into `outFile` (mp3).
 * Returns { ok, notes[], transcript } - ok=false means a line never came out
 * clean; the clip is still written (best take) and the caller reports it.
 */
export async function recordBlockLineTake({ key, voiceId, model, settings, lines, outFile, sttCacheDir = ".stt-cache" }) {
  const clean = lines.map(cleanLine).filter((l) => /[a-z0-9]/i.test(l));
  if (!clean.length) throw new Error("block has no speakable text");
  const tmp = `${outFile}.lt${process.pid}${Math.random().toString(36).slice(2, 7)}`;
  const notes = [];
  const takes = [];
  try {
    for (let i = 0; i < clean.length; i++) {
      const ctx = { key, voiceId, model, settings, log: (s) => notes.push(`L${i + 1}: ${s}`) };
      const t = await recordLine(ctx, clean[i], clean[i - 1], clean[i + 1], `${tmp}.L${i}`);
      if (t.quirk) notes.push(`L${i + 1}: accepted (transcriber quirk)`);
      if (t.failed) notes.push(`L${i + 1}: NO CLEAN TAKE`);
      takes.push(t);
    }
    const nWords = takes.reduce((s, t) => s + t.words.length, 0);
    const speech = takes.reduce((s, t) => s + Math.max(0.3, t.words.at(-1).end - t.words[0].start), 0);
    const rawWpm = (nWords / speech) * 60;
    const cardTempo = Math.min(1.1, Math.max(0.92, TARGET_WPM / rawWpm));
    const parts = [];
    for (const [i, t] of takes.entries()) {
      const lw = (t.words.length / Math.max(0.3, t.words.at(-1).end - t.words[0].start)) * 60 * cardTempo;
      const tempo = t.words.length >= 4 && lw > LINE_MAX_WPM ? (cardTempo * LINE_CAP_WPM) / lw : cardTempo;
      const total = duration(t.wav);
      const segs = [];
      let from = Math.max(0, t.words[0].start - 0.1);
      for (let k = 1; k < t.words.length; k++) {
        const gap = t.words[k].start - t.words[k - 1].end;
        if (gap > MAX_INNER_GAP + 0.1) { segs.push([from, t.words[k - 1].end + MAX_INNER_GAP / 2]); from = t.words[k].start - MAX_INNER_GAP / 2; }
      }
      segs.push([from, total]);
      const p = `${tmp}.part${i}.wav`;
      const filt = segs.map((s, k) => `[0:a]atrim=${s[0].toFixed(3)}:${s[1].toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${Math.max(0, s[1] - s[0] - 0.012).toFixed(3)}:d=0.012[s${k}]`).join(";")
        + ";" + segs.map((_, k) => `[s${k}]`).join("") + `concat=n=${segs.length}:v=0:a=1,atempo=${tempo.toFixed(4)}[o]`;
      ff(["-i", t.wav, "-filter_complex", filt, "-map", "[o]", "-ar", "44100", "-ac", "1", p]);
      parts.push(p);
    }
    /* Loudness from the SPEECH only (parts without the breaks), so the voice
     * sits where the old clips did against the music however many breaks. */
    const speechOnly = `${tmp}.speech.wav`;
    ff([...parts.flatMap((p) => ["-i", p]), "-filter_complex", parts.map((_, i) => `[${i}:a]`).join("") + `concat=n=${parts.length}:v=0:a=1[o]`, "-map", "[o]", speechOnly]);
    const v = volume(speechOnly);
    let gain = TARGET_SPEECH_DB - v.mean;
    if (v.max + gain > PEAK_CEILING_DB) gain = PEAK_CEILING_DB - v.max;
    const sil = (d) => ["-f", "lavfi", "-t", String(d), "-i", "anullsrc=r=44100:cl=mono"];
    const seq = [];
    const inputs = [];
    let n = 0;
    const add = (args) => { inputs.push(...args); seq.push(`[${n++}:a]`); };
    add(sil(0.12));
    parts.forEach((p, i) => { if (i) add(sil(LINE_GAP)); add(["-i", p]); });
    add(sil(0.45));
    const wavOut = `${tmp}.final.wav`;
    ff([...inputs, "-filter_complex", `${seq.join("")}concat=n=${seq.length}:v=0:a=1,volume=${gain.toFixed(2)}dB[o]`, "-map", "[o]", "-ar", "44100", "-ac", "1", wavOut]);
    await mkdir(dirname(outFile), { recursive: true });
    ff(["-i", wavOut, "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1", outFile]);
    /* Final whole-clip check; cached under the shipped file's hash so every
     * later audit is free. */
    const fin = await transcribeFull(key, outFile);
    const finProbs = compareTake(clean.join(" "), fin);
    if (finProbs.length) notes.push(`FINAL: ${finProbs.join("; ").slice(0, 200)}`);
    const h = createHash("sha1").update(await readFile(outFile)).digest("hex").slice(0, 20);
    await mkdir(sttCacheDir, { recursive: true });
    await writeFile(join(sttCacheDir, `${h}.json`), JSON.stringify(fin.filter((w) => w.type === "word").map((w) => ({ text: w.text, start: w.start, end: w.end }))));
    const ok = !takes.some((t) => t.failed) && (!finProbs.length || takes.some((t) => t.quirk));
    return { ok, notes, cardTempo, rawWpm };
  } finally {
    const { readdir } = await import("node:fs/promises");
    const dir = dirname(outFile);
    const stem = tmp.split(/[\\/]/).pop();
    for (const f of await readdir(dir)) if (f.startsWith(stem)) await unlink(join(dir, f)).catch(() => {});
  }
}

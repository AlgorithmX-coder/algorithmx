/**
 * Replace ONLY the clipped ending of a finished voice clip.
 *
 * Owner, 2026-11-16 ("every grain of rice", and "absolutely do not create any
 * new issues"): the audit of every voice set outside the Heroes manifest found
 * briefings and lines whose LAST word is cut off. Measured: in each one the
 * original eleven_v3 file stopped while the voice was still sounding (-17 to
 * -30 dB at the last sample); #891 then appended silence, which turned it into
 * a hard cut. The words before it are fine and were approved by ear, so
 * re-recording a whole 60-90s briefing would trade a fixed ending for a new,
 * unheard delivery. This keeps everything up to the pause before the final
 * sentence and records just that sentence again, in the clip's own voice,
 * model and settings, with the line-take filler trick so it ends cleanly.
 *
 *   node --env-file=.env.local scripts/fix-voice-ending.mjs jobs.json [--dry]
 *
 * jobs.json: [{ file, sentence, said?, voiceId, model, settings, whole? }]
 *   sentence = the final sentence as written (what must be heard)
 *   said     = what to send the model (IPA/respellings), default = sentence
 *   whole    = the clip IS one short line: replace all of it
 *   tempo    = atempo for the new take, for a clip whose original line was
 *              already tempo-shaped (Heroes line-take clips run at up to 1.1x,
 *              so a raw take of their last sentence reads ~15% slower than the
 *              line around it). Use the same factor the line-take applied,
 *              never more than its 0.92-1.1 range.
 *
 * Every result is checked before it replaces the original: the new ending is
 * transcribed and must say the sentence exactly (scribe_v1, or scribe_v2 as a
 * second opinion), its final consonant is measured like
 * audit-consonant-integrity, and the joined clip must have no hard cut and a
 * quiet end. Anything that fails leaves the original file untouched.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import ffmpegPath from "ffmpeg-static";
import { transcribeFull, compareTake, cleanLine, acousticCut, soundCut } from "./lib/line-take.mjs";

const KEY = process.env.ELEVENLABS_API_KEY;
const DRY = process.argv.includes("--dry");
const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const TAKES = Number(process.env.FIX_TAKES) || 6;
const WANT_CLEAN = Number(process.env.FIX_CLEAN) || 2; // clean takes to choose from (closest in length to the original)
const SR = 44100;
mkdirSync(".fix-ending-tmp", { recursive: true });
mkdirSync(".fix-ending-before", { recursive: true });

const ff = (a) => { const r = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...a], { maxBuffer: 1 << 28 }); if (r.status) throw new Error(`ffmpeg: ${String(r.stderr).slice(0, 300)}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function pcm(p) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", p, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 29 });
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}
const rms = (a, s, e) => { let q = 0, c = 0; for (let i = Math.max(0, s); i < Math.min(a.length, e); i++) { q += a[i] * a[i]; c++; } return c ? Math.sqrt(q / c) : 0; };
const db = (x) => 20 * Math.log10(x + 1e-12);
function writeWav(a, p) {
  const raw = `${p}.raw`; const b = Buffer.alloc(a.length * 2);
  for (let i = 0; i < a.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(a[i] * 32767))), i * 2);
  writeFileSync(raw, b);
  ff(["-f", "s16le", "-ar", String(SR), "-ac", "1", "-i", raw, p]);
  unlinkSync(raw);
}
function probe(p) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-i", p], { encoding: "utf8" });
  const s = r.stderr || "";
  return { kbps: Number(/(\d+) kb\/s/.exec(s)?.[1]) || 128, rate: Number(/(\d+) Hz/.exec(s)?.[1]) || 44100, stereo: /stereo/.test(s) };
}
async function stt(p) {
  const h = createHash("sha1").update(readFileSync(p)).digest("hex").slice(0, 20);
  const c = `.stt-cache/full-${h}.json`;
  if (existsSync(c)) return JSON.parse(readFileSync(c, "utf8"));
  const w = await transcribeFull(KEY, p);
  writeFileSync(c, JSON.stringify(w));
  return w;
}
async function tts(job, text) {
  for (let a = 0; a < 8; a++) {
    let r;
    try {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${job.voiceId}?output_format=mp3_44100_128`, {
        method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" },
        body: JSON.stringify({ text, model_id: job.model, voice_settings: job.settings }),
      });
    } catch { await sleep(3000 * (a + 1)); continue; }
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    throw new Error(`TTS ${r.status} ${(await r.text()).slice(0, 200)}`);
  }
  throw new Error("TTS retries exhausted");
}
/* Hard cut = a loud 10ms window straight into digital silence. */
function hardCuts(a) {
  const W = SR / 100, out = [];
  for (let f = 1; f * W + W <= a.length; f++) if (db(rms(a, f * W, f * W + W)) < -90 && db(rms(a, (f - 1) * W, f * W)) > -38) out.push(f / 100);
  return out;
}

/* One clean take of the sentence, trimmed: { wav, words, dur } or null. */
async function take(job, n, tag) {
  const said = job.said || job.sentence;
  const raw = `.fix-ending-tmp/${tag}.t${n}.mp3`;
  writeFileSync(raw, await tts(job, `${said} Okay.`));
  const heard = (await transcribeFull(KEY, raw)).filter((w) => w.type === "word");
  const last = heard.at(-1), before = heard.at(-2);
  if (!last || !before || !/^okay?\.?$/i.test(last.text.replace(/[^a-z.]/gi, ""))) return { err: "filler-not-last" };
  const cut = last.start - before.end < 0.15 ? soundCut(raw, before) : acousticCut(raw, before, last);
  if (cut.err) return { err: cut.err };
  const wav = `.fix-ending-tmp/${tag}.t${n}.wav`, chk = `.fix-ending-tmp/${tag}.t${n}.chk.mp3`;
  ff(["-i", raw, "-t", cut.at.toFixed(3), "-af", `afade=t=out:st=${Math.max(0, cut.at - 0.03).toFixed(3)}:d=0.03`, "-ar", String(SR), "-ac", "1", wav]);
  ff(["-i", wav, "-c:a", "libmp3lame", "-b:a", "128k", chk]);
  const want = cleanLine(job.sentence);
  const check = await transcribeFull(KEY, chk);
  let probs = compareTake(want, check);
  if (probs.length && !/sound:/.test(probs.join(""))) {
    const c2 = await transcribeFull(KEY, chk, "scribe_v2").catch(() => []);
    if (c2.length && !compareTake(want, c2).length) probs = [];
  }
  if (probs.length) return { err: probs.join(" ").slice(0, 120) };
  const words = check.filter((w) => w.type === "word");
  return { wav, words, speech: words.at(-1).end - words[0].start, lead: words[0].start };
}

const results = [];
for (const job of jobs) {
  const tag = job.file.replace(/[^a-z0-9]+/gi, "_");
  const res = { file: job.file, ok: false };
  try {
    const orig = pcm(job.file);
    const info = probe(job.file);
    const heard = (await stt(job.file)).filter((w) => w.type === "word");
    /* Where the final sentence starts in the original: the shortest run of
     * last words that the transcript says matches it. */
    let i0 = -1;
    if (job.whole) i0 = 0;
    else for (let k = 1; k <= Math.min(25, heard.length); k++) if (!compareTake(cleanLine(job.sentence), heard.slice(-k)).length) { i0 = heard.length - k; break; }
    if (i0 < 0) throw new Error(`final sentence not found in transcript: "${heard.slice(-8).map((w) => w.text).join(" ")}"`);
    const sStart = heard[i0].start;
    const origSpeech = heard.at(-1).end - sStart;
    // Join: the quietest 10ms in the pause before the sentence (whole: the clip start).
    let join = 0, keepLead = sStart;
    if (!job.whole) {
      const prevEnd = heard[i0 - 1].end;
      if (sStart - prevEnd < 0.12) throw new Error(`no pause before the final sentence (${(sStart - prevEnd).toFixed(2)}s)`);
      const W = SR / 100; let best = Infinity;
      for (let t = prevEnd + 0.03; t < sStart - 0.03; t += 0.01) { const v = rms(orig, Math.floor(t * SR), Math.floor(t * SR) + W); if (v < best) { best = v; join = t; } }
      const peak = Math.max(...Array.from({ length: Math.floor(orig.length / W) }, (_, f) => rms(orig, f * W, f * W + W)));
      if (best > peak * 0.03) throw new Error(`pause before the final sentence is not quiet (${db(best / peak).toFixed(0)} dB)`);
      keepLead = sStart - join;
    }
    // Loudness of the original sentence (speech frames only) to match.
    const segLevel = (a, s, e) => { const W = SR / 100, fr = []; for (let i = Math.floor(s * SR); i + W <= Math.min(a.length, e * SR); i += W) fr.push(rms(a, i, i + W)); const pk = Math.max(...fr); const sp = fr.filter((v) => v > pk * 0.1); return Math.sqrt(sp.reduce((q, v) => q + v * v, 0) / Math.max(1, sp.length)); };
    const origLevel = segLevel(orig, sStart, heard.at(-1).end);

    const clean = [], fails = [];
    for (let n = 1; n <= TAKES && clean.length < WANT_CLEAN; n++) {
      const t = DRY ? { err: "dry" } : await take(job, n, tag);
      if (t.err) fails.push(`t${n}: ${t.err}`); else clean.push(t);
    }
    if (!clean.length) throw new Error(`no clean take [${fails.join("; ")}]`);
    // Keep the take closest in length to the original sentence: same pace.
    const tempo = job.tempo ?? 1;
    if (tempo < 0.92 || tempo > 1.1) throw new Error(`tempo ${tempo} outside the line-take range 0.92-1.1`);
    clean.sort((a, b) => Math.abs(a.speech / tempo - origSpeech) - Math.abs(b.speech / tempo - origSpeech));
    let t = clean[0];
    if (tempo !== 1) {
      const wavT = t.wav.replace(/\.wav$/, ".tempo.wav");
      ff(["-i", t.wav, "-af", `atempo=${tempo.toFixed(4)}`, "-ar", String(SR), "-ac", "1", wavT]);
      const sc = (x) => x / tempo;
      t = { ...t, wav: wavT, lead: sc(t.lead), speech: sc(t.speech), words: t.words.map((w) => ({ ...w, start: sc(w.start), end: sc(w.end) })) };
    }
    let tk = pcm(t.wav);
    const gain = origLevel / segLevel(tk, t.words[0].start, t.words.at(-1).end);
    /* Level-matched, and if that pushes a peak over -1 dBFS (a hot original),
     * a fast limiter holds just those peaks rather than letting them clip. */
    let peakAfter = 0; for (const v of tk) peakAfter = Math.max(peakAfter, Math.abs(v * gain));
    if (peakAfter > 0.89) {
      const lim = `.fix-ending-tmp/${tag}.lim.wav`;
      ff(["-i", t.wav, "-af", `volume=${db(gain).toFixed(2)}dB,alimiter=limit=0.89:level=false:attack=2:release=40`, "-ar", String(SR), "-ac", "1", lim]);
      tk = pcm(lim);
    } else tk = tk.map((v) => v * gain);
    const from = Math.max(0, t.lead - Math.min(keepLead, t.lead));
    const head = orig.slice(0, Math.floor(join * SR));
    for (let i = 0; i < Math.min(head.length, SR * 0.01); i++) head[head.length - 1 - i] *= i / (SR * 0.01); // 10ms fade into the join
    const pad = new Float32Array(Math.max(0, Math.round((keepLead - (t.lead - from)) * SR)));
    const body = tk.slice(Math.floor(from * SR));
    const tail = new Float32Array(Math.round(SR * (job.tail ?? 0.45)));
    const out = new Float32Array(head.length + pad.length + body.length + tail.length);
    out.set(head, 0); out.set(pad, head.length); out.set(body, head.length + pad.length);
    let pk = 0; for (const v of out) pk = Math.max(pk, Math.abs(v));
    if (pk > 0.98) throw new Error(`clipping after gain (${pk.toFixed(2)})`);
    const cuts = hardCuts(out);
    if (cuts.length) throw new Error(`hard cut in result at ${cuts.join(",")}`);
    const wavOut = `.fix-ending-tmp/${tag}.out.wav`, mp3Out = `.fix-ending-tmp/${tag}.out.mp3`;
    writeWav(out, wavOut);
    ff(["-i", wavOut, "-c:a", "libmp3lame", "-b:a", `${info.kbps}k`, "-ar", String(info.rate), "-ac", info.stereo ? "2" : "1", mp3Out]);
    // Whole-result check: the new ending says the sentence, nothing after it.
    const fin = (await transcribeFull(KEY, mp3Out)).filter((w) => w.type === "word");
    const tailWords = fin.filter((w) => w.start >= join - 0.05);
    let probs = compareTake(cleanLine(job.sentence), tailWords);
    if (probs.length) {
      const f2 = (await transcribeFull(KEY, mp3Out, "scribe_v2").catch(() => [])).filter((w) => w.type === "word" && w.start >= join - 0.05);
      if (f2.length && !compareTake(cleanLine(job.sentence), f2).length) probs = [];
    }
    if (probs.length) throw new Error(`joined clip ending heard wrong: ${probs.join(" ").slice(0, 120)}`);
    Object.assign(res, { ok: true, join: +join.toFixed(2), gainDb: +db(gain).toFixed(1), origSpeech: +origSpeech.toFixed(2), newSpeech: +t.speech.toFixed(2), cleanTakes: clean.length, fails });
    if (!DRY) {
      const bak = `.fix-ending-before/${tag}.mp3`;
      if (!existsSync(bak)) copyFileSync(job.file, bak);
      copyFileSync(mp3Out, job.file);
    }
  } catch (e) { res.error = String(e.message || e).slice(0, 400); }
  results.push(res);
  console.log(res.ok ? "FIXED " : "KEPT  ", job.file, res.ok ? `join ${res.join}s gain ${res.gainDb}dB len ${res.origSpeech}->${res.newSpeech}s` : res.error);
}
writeFileSync(".fix-ending-report.json", JSON.stringify(results, null, 1));
console.log(`fixed ${results.filter((r) => r.ok).length} of ${results.length}`);

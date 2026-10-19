/* Does the per-sentence trim cut the stop burst off the end of a word?
 *
 * 36 clips still measure 0-20ms after being re-recorded per sentence, and
 * nearly all of them end in a STOP - keep, right, look, top, habit, Brilliant.
 * A stop is a silence followed by a burst. If the silence drops the level
 * below the span floor, the span ends BEFORE the burst, and a cut taken from
 * the end of that span takes the burst with it. The fricatives, which have no
 * such gap, were fixed by the per-sentence recording. That is the hypothesis.
 *
 * This buys two sentences and prints where each rule would cut, against where
 * the filler actually starts. No guessing, no re-recording 36 clips on a
 * theory.
 */
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { writeFileSync } from "node:fs";

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = "oClOrzqamOXmtcB8iqTj";
const OUT = process.env.PROBE_DIR;
const FILLER = " Okay.";
const KEEP_AFTER = 0.05;

const SENTENCES = ["Letter by letter, every time. Brilliant!", "Four calm clues means a real message you keep."];

function ffmpeg(args) {
  return spawnSync(ffmpegPath, args, { maxBuffer: 1 << 28 });
}

/* Same detector as the generator, plus the span START, which it does not
 * currently record - and the start of the filler span is exactly the number
 * this question needs. */
function spans(file) {
  const r = ffmpeg(["-v", "quiet", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]);
  const pcm = r.stdout;
  if (!pcm || pcm.length < 4) return [];
  const SR = 16000, n = Math.floor(pcm.length / 2), win = Math.floor(SR * 0.02);
  const lvl = (i0) => {
    let s = 0, c = 0;
    for (let i = i0; i < Math.min(n, i0 + win); i++) { const v = pcm.readInt16LE(i * 2) / 32768; s += v * v; c++; }
    return c ? Math.sqrt(s / c) : 0;
  };
  let peak = 0;
  for (let i = 0; i + win < n; i += win) peak = Math.max(peak, lvl(i));
  if (peak <= 0) return [];
  const loud = peak * 0.06, floor = peak * 0.008;
  const out = [];
  let i = 0;
  while (i + win < n) {
    while (i + win < n && lvl(i) <= loud) i += win;
    if (i + win >= n) break;
    const start = i;
    while (i + win < n && lvl(i) > loud) i += win;
    const loudEnd = i;
    let t = loudEnd;
    while (t + win < n && lvl(t) > floor) t += win;
    out.push({ start: start / SR, loudEnd: loudEnd / SR, end: t / SR });
    i = Math.max(t, loudEnd + win);
  }
  return out;
}

for (let k = 0; k < SENTENCES.length; k++) {
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: SENTENCES[k] + FILLER,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 },
    }),
  });
  if (!resp.ok) { console.log(`probe ${k}: HTTP ${resp.status}`); continue; }
  const file = `${OUT}/probe${k}.mp3`;
  writeFileSync(file, Buffer.from(await resp.arrayBuffer()));

  const sp = spans(file);
  console.log(`\n"${SENTENCES[k]}" + "${FILLER.trim()}"  -> ${sp.length} span(s)`);
  sp.forEach((s, i) => console.log(`   span ${i}  start ${s.start.toFixed(3)}  loudEnd ${s.loudEnd.toFixed(3)}  end ${s.end.toFixed(3)}`));
  if (sp.length >= 2) {
    const prev = sp[sp.length - 2], filler = sp[sp.length - 1];
    const nowCut = prev.end + KEEP_AFTER;
    const gap = filler.start - prev.end;
    console.log(`   CURRENT rule cuts at ${nowCut.toFixed(3)}`);
    console.log(`   filler starts at     ${filler.start.toFixed(3)}  (gap after the sentence: ${(gap * 1000).toFixed(0)}ms)`);
    console.log(`   ${nowCut < filler.start ? `=> ${((filler.start - nowCut) * 1000).toFixed(0)}ms of audio between the cut and the filler is being THROWN AWAY` : "=> the cut already reaches the filler, nothing is lost"}`);
    /* What is actually in that discarded stretch? If it holds a burst, that is
     * the missing consonant, caught in the act. */
    const seg = `${OUT}/probe${k}.gap.mp3`;
    ffmpeg(["-v", "quiet", "-y", "-i", file, "-ss", String(nowCut), "-to", String(filler.start), "-c:a", "libmp3lame", "-q:a", "2", seg]);
    const gsp = spans(seg);
    console.log(`   the discarded stretch holds ${gsp.length} span(s) of its own`);
  }
}

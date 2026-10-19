/* Analyse the probe clips already on disk. No API calls.
 *
 * Prints, for a sentence recorded with the trailing filler: where the current
 * trim cuts, where the filler actually starts, and what sits in between. If a
 * stop burst sits in that stretch, the trim is deleting the consonant the
 * audit is complaining about.
 */
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const DIR = process.env.PROBE_DIR;
const KEEP_AFTER = 0.05;

function ffmpeg(args) {
  return spawnSync(ffmpegPath, args, { maxBuffer: 1 << 28 });
}

function pcmOf(file) {
  const r = ffmpeg(["-v", "quiet", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]);
  return r.stdout && r.stdout.length > 4 ? r.stdout : null;
}

function levels(pcm) {
  const SR = 16000, n = Math.floor(pcm.length / 2), win = Math.floor(SR * 0.02);
  const out = [];
  for (let i = 0; i + win < n; i += win) {
    let s = 0, c = 0;
    for (let j = i; j < Math.min(n, i + win); j++) { const v = pcm.readInt16LE(j * 2) / 32768; s += v * v; c++; }
    out.push({ t: i / SR, rms: Math.sqrt(s / c) });
  }
  return out;
}

for (const name of ["probe0", "probe1"]) {
  const file = `${DIR}/${name}.mp3`;
  const pcm = pcmOf(file);
  if (!pcm) { console.log(`${name}: no audio`); continue; }
  const L = levels(pcm);
  const peak = Math.max(...L.map((x) => x.rms));
  const loud = peak * 0.06, floor = peak * 0.008;

  /* The same span walk the generator does, with the START recorded too. */
  const sp = [];
  let i = 0;
  while (i < L.length) {
    while (i < L.length && L[i].rms <= loud) i++;
    if (i >= L.length) break;
    const start = L[i].t;
    while (i < L.length && L[i].rms > loud) i++;
    const loudEnd = i < L.length ? L[i].t : L[L.length - 1].t;
    let t = i;
    while (t < L.length && L[t].rms > floor) t++;
    sp.push({ start, loudEnd, end: t < L.length ? L[t].t : L[L.length - 1].t });
    i = Math.max(t, i + 1);
  }

  console.log(`\n=== ${name} ===  peak ${peak.toFixed(4)}  loud ${loud.toFixed(4)}  floor ${floor.toFixed(4)}  ${sp.length} span(s)`);
  sp.forEach((s, k) => console.log(`   span ${k}  start ${s.start.toFixed(3)}  loudEnd ${s.loudEnd.toFixed(3)}  end ${s.end.toFixed(3)}`));
  if (sp.length < 2) { console.log("   fewer than two spans: the filler ran into the sentence, so the generator keeps the whole clip."); continue; }

  const prev = sp[sp.length - 2], filler = sp[sp.length - 1];
  const nowCut = prev.end + KEEP_AFTER;
  console.log(`   CURRENT cut   ${nowCut.toFixed(3)}`);
  console.log(`   filler starts ${filler.start.toFixed(3)}`);
  const lost = L.filter((x) => x.t >= nowCut && x.t < filler.start);
  const lostPeak = lost.length ? Math.max(...lost.map((x) => x.rms)) : 0;
  console.log(`   discarded ${((filler.start - nowCut) * 1000).toFixed(0)}ms, loudest moment in it ${(lostPeak / peak * 100).toFixed(1)}% of peak`);
  console.log(lostPeak > floor * 2
    ? "   => there IS audio in the discarded stretch. The trim is taking something real."
    : "   => the discarded stretch is silence. The trim is not the problem here.");

  /* The replacement rule: keep up to the last moment that still has sound in
   * it before the filler, rather than up to the end of the last LOUD span. A
   * stop is a closure then a burst; the closure ends the loud span, and the
   * burst is what the old rule threw away.
   *
   * The 80ms standoff from the filler is so the filler's own onset is never
   * mistaken for the sentence's consonant. */
  const STANDOFF = 0.08;
  let lastSound = prev.end;
  for (const x of L) if (x.t < filler.start - STANDOFF && x.rms > floor) lastSound = x.t;
  const newCut = Math.min(lastSound + KEEP_AFTER, filler.start - 0.03);
  console.log(`   NEW cut       ${newCut.toFixed(3)}  (keeps ${((newCut - nowCut) * 1000).toFixed(0)}ms more)`);
}

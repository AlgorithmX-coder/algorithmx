/* Did shapeToSpec cut the consonant, or did ElevenLabs deliver it short?
 *
 * Every "it didn't pronounce the last letter" diagnosis so far has argued
 * about the shaping without measuring the clip BEFORE it ran. --keep-raw
 * leaves the raw delivery beside the finished one, so this compares them.
 *
 *   node scripts/_raw-vs-shaped.mjs <key>
 */
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const KEY = process.argv[2];
const SR = 16000;

function pcm(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout) return null;
  const b = r.stdout, n = b.length >> 1, a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  return a;
}

/** Every span of speech and the gap after it, as the clip itself defines loud. */
function spans(a) {
  const win = Math.round(SR * 0.02);
  const lvl = (i0) => { let s = 0, c = 0; for (let i = i0; i < Math.min(a.length, i0 + win); i++) { s += a[i] * a[i]; c++; } return c ? Math.sqrt(s / c) : 0; };
  let peak = 0;
  for (let i = 0; i + win < a.length; i += win) peak = Math.max(peak, lvl(i));
  const loud = peak * 0.06;      // speech body
  const floor = peak * 0.004;    // anything at all
  const out = [];
  let i = 0;
  while (i + win < a.length) {
    while (i + win < a.length && lvl(i) <= loud) i += win;
    if (i + win >= a.length) break;
    const start = i;
    while (i + win < a.length && lvl(i) > loud) i += win;
    const loudEnd = i;
    /* The quiet tail after the body: this is where a consonant lives. */
    let tail = loudEnd;
    while (tail + win < a.length && lvl(tail) > floor) tail += win;
    out.push({ start: start / SR, loudEnd: loudEnd / SR, tailMs: Math.round(((tail - loudEnd) / SR) * 1000) });
    i = tail;
  }
  return { peak, spans: out };
}

const raw = pcm(`public/audio/voice/${KEY}.mp3.preshape.mp3`);
const shaped = pcm(`public/audio/voice/${KEY}.mp3`);
if (!raw || !shaped) { console.error("need both <key>.mp3 and <key>.mp3.preshape.mp3 (regenerate with --keep-raw)"); process.exit(2); }

const R = spans(raw), S = spans(shaped);
console.log(`raw    : ${(raw.length / SR).toFixed(2)}s, ${R.spans.length} speech span(s)`);
console.log(`shaped : ${(shaped.length / SR).toFixed(2)}s, ${S.spans.length} speech span(s)`);
console.log("\nquiet tail after each speech span (this is where a final consonant lives):");
console.log("  span   raw    shaped   verdict");
const n = Math.max(R.spans.length, S.spans.length);
let lost = 0;
for (let i = 0; i < n; i++) {
  const r = R.spans[i], s = S.spans[i];
  if (!r || !s) { console.log(`  ${String(i).padStart(4)}  ${r ? r.tailMs + "ms" : "   -"}  ${s ? s.tailMs + "ms" : "   -"}   SPAN COUNT DIFFERS`); continue; }
  const drop = r.tailMs - s.tailMs;
  if (drop >= 40) lost++;
  console.log(`  ${String(i).padStart(4)} ${String(r.tailMs).padStart(5)}ms ${String(s.tailMs).padStart(6)}ms   ${drop >= 40 ? `LOST ${drop}ms` : drop <= -40 ? `gained ${-drop}ms` : "kept"}`);
}
console.log(`\n${lost} span(s) lost 40ms or more of their tail in shaping.`);
console.log(lost ? "=> the SHAPING is cutting consonants." : "=> shaping preserved the tails; any short tail came from the voice itself.");

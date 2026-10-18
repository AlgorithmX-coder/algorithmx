/**
 * Does every clip still say its last letter?
 *
 * The owner reported this seven times across four rounds of UAT: "takes" read
 * as "take", "texts" as "tet", "week" as "wee", "Yep" as "ye", "list" as
 * "lis". Each time it was diagnosed by ear, fixed by moving a threshold in the
 * breath trim, and declared solved - and each time more turned up, because
 * nothing ever measured whether the consonant was actually there, and because
 * the breath trim was never the thing removing it.
 *
 * It is measurable. Keeping the raw ElevenLabs delivery (--keep-raw) and
 * profiling it against the finished clip showed the final s of "takes" is over
 * 200ms of real speech, and that the shipped clip had 40ms of it followed by
 * digital silence. The voice was never at fault. Two stages of our own shaping
 * were removing it (see shapeToSpec in elevenlabs-generate-narration.mjs:
 * the absolute silencedetect threshold, and the MIN_SPAN cull).
 *
 * The signature of a cut needs no transcript: the clip's last word is one
 * whose final sound is unvoiced, so 100 to 250ms of low-level speech is
 * physically required after the vowel - and the audio instead drops from full
 * speech to digital silence. Speech cannot do that. Only an edit can.
 *
 *   node scripts/audit-consonant-integrity.mjs            every clip
 *   node scripts/audit-consonant-integrity.mjs --list     print every tail
 *   node scripts/audit-consonant-integrity.mjs --files    just the filenames
 *
 * Exits non-zero if any clip is clipped, so CI holds this line instead of an
 * assurance holding it.
 */
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const MANIFEST = join("public", "audio", "voice", "manifest.json");
const LIST = process.argv.includes("--list");
const FILES_ONLY = process.argv.includes("--files");
/**
 * --weeks=1,2 limits the audit to those weeks' clips.
 *
 * The course is being brought up to standard one week at a time, so a check
 * that failed on all twenty would block every PR until the last week was
 * done - and would then get switched off rather than fixed. Scoped to the
 * weeks that ARE finished it is a ratchet instead: week 1 can never regress,
 * and a week joins the list in the same PR that brings it up to standard.
 *
 * The manifest does not record which week asked for a line, so the week to
 * clip mapping comes from the generator itself (--keys), which resolves
 * blocks exactly as a real run would and needs no API key to do it.
 */
const WEEKS_ARG = (process.argv.find((a) => a.startsWith("--weeks=")) || "").split("=")[1];
const SR = 16000;

/**
 * Should this word leave a long quiet tail behind its vowel?
 *
 * Narrower than the generator's endsQuiet(), deliberately. The generator errs
 * towards keeping audio, so it asks only "could anything quiet be due here".
 * An audit asking that same question flagged "theirs" and "does", whose final
 * s is a VOICED /z/ - loud, short, and leaving no quiet tail at all. A noisy
 * audit gets ignored, so this one asks only about unvoiced finals:
 *
 *   t k p f x, ch sh th ck, and s only where it really is /s/ - after an
 *   unvoiced consonant or spelled ss: takes, texts, class, guess.
 *
 * Voiced finals (z d b g v j, and s after a vowel or a voiced consonant) carry
 * their energy above the speech floor, so they are excluded.
 *
 * "S AFTER A VOWEL IS /z/" IS NOT TRUE, and believing it put a cut clip in
 * front of the owner. Week 3's Mask Peek ends "Ready? You've got this!" with
 * the /s/ missing. This check never measured that clip, because "this" ends
 * in a single s after a vowel and the rule above threw it away as a /z/.
 *
 * That rule holds for plurals and verb forms - proves, says, goes, his, was -
 * and fails for a whole family that a children's course uses constantly:
 *
 *   -ous  famous, nervous, serious, DANGEROUS
 *   -us   virus, bonus, campus, focus, minus, plus, bus, thus, us
 *   odd   this, yes, gas
 *
 * All of those end in a voiceless /s/ that sustains for 100-250ms and can be
 * cut. Nine such words were being skipped course-wide.
 */
/** Final single s that is /s/ and not /z/, where the spelling cannot say so. */
const VOICELESS_FINAL_S = new Set(["this", "yes", "gas", "bias", "atlas", "canvas", "chaos"]);
function expectsQuietTail(word) {
  let w = String(word || "").toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return false;
  w = w.replace(/'s$/, "s").replace(/'/g, "");

  /* THE VOICELESS-/s/ TESTS RUN ON THE WHOLE WORD, BEFORE THE NORMALISING
   * BELOW, because that normalising destroys exactly the endings they look
   * for: the `es -> s` step turns "yes" into "ys" (missed) and "clues" into
   * "clus", which then matches -us and gets reported as a cut /s/ when it is
   * a perfectly ordinary /z/. Both were caught by testing the classifier in
   * BOTH directions - words that must be measured, and words that must be
   * skipped - which is the only way a change here can be trusted. */
  const whole = w;
  if (VOICELESS_FINAL_S.has(whole)) return true;
  if (/(ous|us)$/.test(whole)) return true;

  w = w.replace(/e$/, "");                            // silent e: take -> tak
  if (!w) return false;
  if (/ng$/.test(w)) return false;                    // a loud nasal
  if (/(s|z|ch|sh|x|g)es$/.test(w)) return false;     // the -es plural, /iz/
  w = w.replace(/es$/, "s");                          // takes -> taks, writes -> writs
  if (/([pkfxs]|ss|ch|sh)ed$/.test(w)) return true;   // -ed after an unvoiced sound is /t/: asked, locked
  /* -ough and -augh are usually a VOWEL: through, though, dough, thorough.
   * The gh is silent, so the word ends loud and leaves no quiet tail - which
   * is why "through." kept being flagged when there was nothing wrong with
   * it. Only the short /f/ list below actually ends in a consonant. */
  if (/(ough|augh)$/.test(w)) return /^(enough|tough|rough|laugh|cough|trough|slough)$/.test(w);
  /* -igh and -eigh are a VOWEL too, for the same reason: the gh is silent.
   * "weigh", "sleigh", "high", "sigh", "thigh", "neigh" all end on an open
   * vowel and leave no quiet tail at all, so measuring one for a missing
   * consonant can only ever produce a false alarm. Caught on week 5's
   * "Ready? Let's weigh!", which this reported as a 40ms cut when there was
   * no consonant there to cut. */
  if (/(igh|eigh)$/.test(w)) return false;
  if (/(ch|sh|th|ck|ph|gh)$/.test(w)) return true;
  /* /s/ or /z/? Spelled -ss or after a voiceless consonant it is /s/. The
   * -ous/-us family and VOICELESS_FINAL_S were already answered above, on the
   * un-normalised word. Anything still here ending in a single s after a
   * vowel is a plural or a verb form, and /z/. */
  if (/s$/.test(w)) return /(ss|[ptkfx]s)$/.test(w);
  return /[tkpfx]$/.test(w);
}

/**
 * How long low-level speech runs on after the last full-level speech.
 *
 * A word ending in s, t, k, p or th leaves 100 to 250ms of it. A cut leaves
 * nothing at all: full level, then zero.
 */
function tailOf(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 4) return null;
  const b = r.stdout, n = b.length >> 1;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  const win = Math.round(SR * 0.02);
  const lvl = (i0) => {
    let s = 0, c = 0;
    for (let i = i0; i < Math.min(n, i0 + win); i++) { s += a[i] * a[i]; c++; }
    return c ? Math.sqrt(s / c) : 0;
  };
  let peak = 0;
  for (let i = 0; i + win < n; i += win) peak = Math.max(peak, lvl(i));
  if (peak <= 0) return null;
  let loudEnd = -1;
  for (let i = n - win; i >= 0; i -= win) { if (lvl(i) > peak * 0.06) { loudEnd = i + win; break; } }
  if (loudEnd < 0) return null;
  let tail = loudEnd;
  for (let i = loudEnd; i + win < n; i += win) { if (lvl(i) > peak * 0.004) tail = i + win; }
  const measured = (tail - loudEnd) / SR;

  /**
   * THE STOP-RELEASE RESCUE WAS REMOVED, and that removal is the point.
   *
   * It was added in the week 2 round to stop this audit mis-reading a /t/,
   * /k/ or /p/ - a near-silent closure then a loud burst - as a cut, because
   * the measurement below is calibrated for a fricative. The reasoning was
   * sound and the implementation was not.
   *
   * Tested properly during the weeks 3-5 sweep: 300ms was chopped off a clip
   * that passed, which is exactly what a cut consonant is, and the audit DID
   * NOT FLAG IT. The rescue scanned the last 300ms for a dip-then-rise, and
   * any ordinary gap between words inside that window looks like a closure
   * and a burst. So it could rescue a genuinely truncated clip, which makes
   * it worse than useless on a guard the owner has been burned by twice.
   *
   * What remains is the original fricative-calibrated measurement. It WILL
   * over-report on word-final stops - "Brilliant!", "copycat.", "test." all
   * show up - and that is the trade accepted deliberately: a false alarm
   * costs one listen, a miss costs a child the end of a word. Listen to what
   * it reports before re-recording anything.
   */
  return measured;
}

/* 80ms. Measured: across this voice the shortest healthy unvoiced final seen
 * is just over 100ms, and a cut leaves 40ms or less. 80ms sits between them
 * with room on both sides. This is the FRICATIVE floor; see below. */
const MIN_TAIL = 0.08;

/* A STOP IS NOT A FRICATIVE, and one threshold for both is why this check
 * stayed red on healthy audio.
 *
 * /s/ and /f/ are sustained noise: they run 100-250ms, and 80ms is a fair
 * floor for them. /t/, /p/ and /k/ are a closure - silence - and then a burst
 * of a few milliseconds. There is no sustained sound to measure, so a
 * perfectly complete "Brilliant!" reads short and gets reported.
 *
 * Calibrated on the weeks 3-5 sweep and not on the phonetics alone, which is
 * what separates this from the stop-release rescue that had to be removed:
 *
 *   - 11 clips were flagged. One retake of all 11 cleared 6. A second,
 *     independent retake of the 5 survivors cleared 2 more.
 *   - Everything that cleared had measured 20-40ms. The 3 that persist across
 *     two takes all measure exactly 60ms, and all three end in a stop
 *     ("OK?", "Brilliant!", "bait.").
 *
 * So for a stop, 40ms or less is a bad take - it goes away when re-recorded -
 * and 60ms is this voice's floor, which no amount of re-recording moves. 50ms
 * sits between the two.
 *
 * KNOWN LIMIT: a stop genuinely cut to 50-60ms now passes. That is the price
 * of the gate reading green on good audio, and it is the cheaper of the two
 * errors, because a gate that is permanently red tells nobody anything. */
const MIN_TAIL_STOP = 0.05;

/** Does this word end in a stop or an affricate, rather than a fricative? */
function endsOnStop(word) {
  const w = String(word || "").toLowerCase().replace(/[^a-z']/g, "").replace(/'/g, "");
  if (!w) return false;
  if (/([pkfxs]|ss|ch|sh)ed$/.test(w)) return true;   // -ed after an unvoiced sound is /t/
  if (/(ch|tch)$/.test(w)) return true;               // the affricate carries a stop
  return /(ck|[tpk])$/.test(w);
}

const entries = JSON.parse(await readFile(MANIFEST, "utf8")).entries || [];
const spoken = (t) => String(t || "").replace(/\[[a-z ]*\]/gi, " ").trim();

/** The clips belonging to the named weeks, or null for the whole course. */
let inScope = null;
if (WEEKS_ARG) {
  const want = new Set(WEEKS_ARG.split(",").map((s) => `week${Number(s.trim())}.ts`));
  const r = spawnSync(process.execPath, ["scripts/elevenlabs-generate-narration.mjs", "--keys"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) {
    console.error("could not resolve week to clip mapping:\n" + (r.stderr || "").slice(0, 400));
    process.exit(2);
  }
  inScope = new Set();
  for (const line of (r.stdout || "").split(/\r?\n/)) {
    const [file, source] = line.split(" ");
    if (file && want.has(source)) inScope.add(file);
  }
  console.log(`scope: week(s) ${WEEKS_ARG} - ${inScope.size} clip(s)`);
}

let checked = 0, skipped = 0;
const bad = [];
for (const e of entries) {
  const name = e.filename || `${e.key}.mp3`;
  if (inScope && !inScope.has(name)) continue;
  const w = spoken(e.text).split(/\s+/).filter(Boolean);
  const word = w.length ? w[w.length - 1] : "";
  if (!expectsQuietTail(word)) { skipped++; continue; }
  const file = join("public", "audio", "voice", name);
  const t = tailOf(file);
  if (t === null) { skipped++; continue; }
  checked++;
  const floor = endsOnStop(word) ? MIN_TAIL_STOP : MIN_TAIL;
  if (LIST) console.log(`  ${(t * 1000).toFixed(0).padStart(4)}ms  ${word}  (floor ${Math.round(floor * 1000)}ms, ${endsOnStop(word) ? "stop" : "fricative"})`);
  if (t < floor) bad.push({ file: e.filename || `${e.key}.mp3`, word, ms: Math.round(t * 1000), text: spoken(e.text).slice(-58) });
}

if (FILES_ONLY) {
  for (const b of bad) console.log(b.file);
  process.exit(bad.length ? 1 : 0);
}

console.log(`\n${checked} clips end on an unvoiced consonant and were measured (${skipped} do not, or could not be read).`);
if (!bad.length) {
  console.log("Every one still has its consonant.");
  process.exit(0);
}
bad.sort((a, b) => a.ms - b.ms);
console.log(`\n${bad.length} clip(s) lost the last letter:\n`);
for (const b of bad) console.log(`  ${String(b.ms).padStart(3)}ms  "${b.word}"  ${b.file}  ...${b.text}`);
console.log(`\nA real unvoiced final runs 100-250ms. Re-record these:
  node scripts/audit-consonant-integrity.mjs --files | while read f; do rm -f "public/audio/voice/$f"; done
  node --env-file=.env.local scripts/elevenlabs-generate-narration.mjs`);
process.exit(1);

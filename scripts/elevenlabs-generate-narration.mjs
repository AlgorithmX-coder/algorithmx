// Generate ElevenLabs narration MP3s for Week 1 - ONE MP3 PER BLOCK.
//
// History:
//   v1/v2/v3 generated one MP3 per line and the runtime stitched them
//   together with HTMLAudioElement. That introduced two unavoidable
//   gaps between bullets: ElevenLabs' silence padding on each clip,
//   and JS scheduling latency between `ended` -> next `play()`. The
//   user heard this as "Imagine one... <pause>... key opens..."
//
//   v4 fixes it by joining the block's lines into one prompt and
//   asking ElevenLabs to generate the entire block as a single audio
//   stream. The model handles inter-sentence pauses naturally from
//   the period/exclamation in the text, and there are no JS gaps.
//
// Usage:
//   node --env-file=.env.local scripts/elevenlabs-generate-narration.mjs
//   node scripts/elevenlabs-generate-narration.mjs --check    (no API, no writes)
//
// --check IS THE SILENCE GATE for spine narration. A clip's filename is the
// sha1 of its text, so editing one word of a narration block points it at a
// recording that does not exist, and the block plays SILENT. Nothing reports
// it: the manifest entry for the OLD text is still valid and still has its
// file, so no entry is missing a file and no file is missing an entry.
// audit-read-alouds only sees lines an engine reads off its own board,
// audit-verdict-voice only the sentence after That's right / Not quite, and
// audit-spine-narration only asks whether a block EXISTS, never whether it
// was recorded. On 2026-10-03 two Week 16 lines rewritten for emphasis shipped
// silent through all three. This script already knows every text the course
// needs, so it is the only honest gate; --check runs the same scan and reports
// what has no recording instead of buying one.
//
//   --check           list every unrecorded block, exit 1 if there are any
//   --check --quiet   just the count

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { renameSync } from "node:fs";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CHECK_ONLY = process.argv.includes("--check");
const QUIET = process.argv.includes("--quiet");

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !CHECK_ONLY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

// SINGLE-NARRATOR mode: Sarah is the hero-mentor and reads everything.
//   Chosen by ear 2026-06-18 from a 5-voice audition (see
//   scripts/elevenlabs-audition.mjs + cyberheroes-narrator-spec memory):
//   ElevenLabs "Sarah - Mature, Reassuring, Confident" (female, young,
//   American). Warm + reassuring fits the "empowering, never frightening"
//   rule for cyber-safety content; reads as a hero-mentor coach, not a
//   teacher. (Previously Jessica; before that Alice, which tested "too
//   teachery".) Both content speakers map to Sarah = one consistent mentor;
//   the speaker tag is preserved for any future second-voice move.
const VOICE = {
  adam:  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  layla: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  // Storyteller NARRATOR — a deliberately DIFFERENT voice (ElevenLabs "George",
  // warm mature male) that reads the "Choose Your Path" scenario setups aloud,
  // so Sarah (the coach) can then jump in and ask "which one do you think?".
  narrator: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
};

/* The narrator.
 *
 * Owner's pick after hearing the shortlist: a bright kids educator rather than
 * an audiobook narrator. Every earlier candidate - Sarah, Brittney, Emma Warm,
 * Carolyn, Heather, Liz, Talia, Cozy - was calm, measured and intimate, which
 * is the register for reading a novel to an adult. A teacher of six year olds
 * is brighter and carries more lift, because she is holding a room rather than
 * confiding in one listener.
 *
 * The switch ran week by week on purpose: week 1 moved first and was listened
 * to in context on the real site, and the rest followed in one batch once it
 * held up. That is finished, so there is no longer a per-week narrator table -
 * she is simply the voice, which is also what keeps the SHARED lines ("That's
 * right!", "Not quite.", the quick-check prompt) in step. While the table
 * existed those lines stayed on the default voice and leaked the old narrator
 * into migrated weeks. A course must never be left half migrated: two
 * narrators across twenty weeks is worse than either voice on its own.
 */

/* Until a week has actually been re-recorded, it must keep resolving to the
 * clips it HAS. Making the new narrator the global default changed every
 * block's hash at once, so nineteen unmigrated weeks suddenly pointed at Emma
 * recordings that did not exist, vanished from the manifest, and fell back to
 * the browser's robot voice. The table goes back until the last week lands,
 * and then the default changes once, with nothing left to point at the old
 * voice. */
const KIDS_EDUCATOR = { id: "oClOrzqamOXmtcB8iqTj", name: "Emma (Kids Educator)" };
const NARRATOR_BY_WEEK = {
  "week1.ts": KIDS_EDUCATOR,
  "week2.ts": KIDS_EDUCATOR,
  "week3.ts": KIDS_EDUCATOR,
  // Not a week: the one shared line QuickCheck speaks on every finish-mode
  // screen, pinned so it does not play the old voice inside a migrated week.
  "shared:quickcheck-finish": KIDS_EDUCATOR,
};

/** The voice for a block: the week's narrator if it has its own, else the
 *  speaker's usual one. */
function voiceFor(speaker, source) {
  const perWeek = source && NARRATOR_BY_WEEK[source];
  if (perWeek && VOICE[speaker] && VOICE[speaker].name === "Sarah") return perWeek;
  return VOICE[speaker];
}

// v9-expressive tune. The flat "reading-from-a-script" delivery came
// from high stability + ZERO style. For a children's STORYTELLER we want
// flow, natural pauses, and clear question/emphasis intonation - so we
// open her up (eleven_v3 responds strongly to these):
//   stability   0.35 - LOW = expressive, dynamic delivery with natural
//                       rises/falls and pauses (eleven_v3's Creative-
//                       leaning range). High stability = the monotone.
//   similarity  0.80 - a little looser so she isn't locked to a rigid
//                       timbre and can move with the line.
//   style       0.40 - performance/expressiveness ON. THIS carries the
//                       rhetorical-question tone, emphasis and warmth.
//   speaker boost true - presence/clarity.
//   speed       0.95 - natural conversational flow; the *pauses* come from
//                       punctuation + expression, not uniform slowness
//                       (0.90 read as careful/deliberate).
// Tuned for a child-presenter read: excited, clear, NOT dragged.
//   stability   0.35 - raised from 0.25. Ultra-low stability made eleven_v3
//                      stretch/drag words unevenly ("sounds dragged at times");
//                      0.35 steadies the prosody while staying expressive.
//   similarity  0.70 - looser so she isn't locked rigidly to the timbre.
//   style       0.70 - raised from 0.55 for MORE excitement/energy.
//   speed       0.85 - clearly slower: a 6-9 TEACHING pace so kids have time
//                      to absorb each idea. Stability 0.35 keeps it from
//                      dragging at this slower speed.
/* Owner, after hearing week 1: "some cards are really good, they flow really
 * well, and then other cards are not... what I'm looking for is consistency."
 *
 * STABILITY is that control, and 0.35 sits in ElevenLabs' Creative range,
 * which is deliberately variable from one generation to the next. It was set
 * low to avoid a monotone, but the cost is that every clip interprets the
 * same instruction differently, so a lesson made of 88 clips has 88 slightly
 * different Sarahs in it.
 *
 * STYLE at 0.70 is performance. She is teaching five and six year olds, not
 * performing at them, and the script no longer asks her to.
 *
 * The warmth those two were buying now comes from the authored [warmly] and
 * [proud] tags, which eleven_v3 consumes properly, and the pacing comes from
 * the delivery spec rather than from letting the model improvise.
 */
const VOICE_SETTINGS = {
  stability: 0.6,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
  speed: 0.9,
};

// Model priority: try eleven_v3 first (newest, most natural per
// ElevenLabs' own guidance for "doesn't sound AI"). If the plan
// rejects it, fall back to eleven_multilingual_v2 (the proven
// premium model that worked in v1-v6).
/* eleven_v4 first. The course was recorded on v3 throughout; v4 is a
 * generation newer and audibly less synthetic on the same voice and the same
 * script. Verified before adopting it: it CONSUMES the [warmly] and [proud]
 * tags rather than reading them aloud, which is what ruled out going
 * backwards to multilingual_v2. It honours `speed` no better than v3 (5.07s
 * against 5.15s for a 30% change), so the delivery spec still does the pacing.
 *
 * The model is NOT part of the clip hash, so adopting it does not invalidate
 * a single existing recording - the other nineteen weeks stay exactly as they
 * are until they are deliberately re-recorded. */
const MODELS_IN_PRIORITY_ORDER = ["eleven_v4", "eleven_v3", "eleven_multilingual_v2"];
const OUTPUT_FORMAT = "mp3_44100_128";

const GENERATION_VERSION = "v15-sarah-slower";

const OUT_DIR = join("public", "audio", "voice");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
await mkdir(OUT_DIR, { recursive: true });

// Scan EVERY week*.ts file under weekContent/ so the moment narration
// content is added to any week, the generator picks it up - no script
// edit required. Single source of truth: week*.ts is content, this
// script is plumbing.
const WEEK_CONTENT_DIR = "app/lesson/weekContent";
const weekFiles = (await readdir(WEEK_CONTENT_DIR))
  .filter((f) => /^week\d+\.ts$/.test(f))
  .sort();

// Scans both the intro `narration:` blocks and the in-exercise
// `coachLines:` blocks (teach-once first-action lines) so every spoken
// line in the content gets a recorded Sarah voice.
const blockRe = /(?:narration|coachLines|winNarration|teachNarration|completeNarration|promptNarration):\s*\{\s*speaker:\s*"(adam|layla|narrator)",\s*lines:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
// Choose-Your-Path scenario setups are read by the NARRATOR voice (one mp3 each).
const setupRe = /setup:\s*"((?:[^"\\]|\\.)*)"/g;
// Choose-Your-Path choice consequences → Sarah reads the outcome on the reveal.
const consequenceRe = /consequence:\s*"((?:[^"\\]|\\.)*)"/g;
// Prove-it (QuickCheck) question prompts → Sarah reads the question aloud when
// the beat appears. Scoped to quickCheck blocks (via the type anchor) so the
// game round prompts aren't swept up. A finish-mode blank (___) → "blank".
const quickCheckPromptRe = /type:\s*"quickCheck"[\s\S]{0,200}?\bprompt:\s*"((?:[^"\\]|\\.)*)"/g;
// QuizBoss questions → Sarah reads the WHOLE question aloud (scenario + every
// choice + "which do you think?") so a 6-9yo non-reader can do the final test.
// Captures the ask text (group 1) AND the options block (group 2). The villain
// intro/taunt/victory lines stay off (the quiz-boss villain voice is OFF).
const bossAskRe = /ask:\s*\{\s*slug:\s*"[^"]*",\s*text:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\},\s*options:\s*\[([\s\S]*?)\]/g;

// MUST stay identical to seededShuffle in app/components/game/QuizBoss.tsx so
// the recorded read matches the on-screen (shuffled) option order — Sarah never
// gives the answer away by always reading the correct choice first.
// A password, username or web address: no spaces, and a symbol, or letters mixed
// with digits. Sarah never reads these aloud (UAT batch 2, item 11): symbols read
// out sound unnatural, and a lookalike ("sch00l") cannot be spotted by ear.
// KEEP IDENTICAL to isCodeLikeOption in app/components/game/QuizBoss.tsx.
function isCodeLikeOption(text) {
  return !/\s/.test(text) && (/[$@#%&*^~+=<>|\\/_]/.test(text) || (/\d/.test(text) && /[A-Za-z]/.test(text)) || /[!?]./.test(text));
}
/** "...believing it" -> "...believing it." KEEP IDENTICAL to closeSentence in QuizBoss.tsx. */
function closeSentence(text) {
  const t = text.trim();
  return /[.!?…]$/.test(t) ? t : t + ".";
}
function optionLetterList(count) {
  const letters = ["A", "B", "C", "D", "E"].slice(0, count);
  return letters.length > 1 ? `${letters.slice(0, -1).join(", ")} and ${letters[letters.length - 1]}` : letters.join("");
}

function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
// SenderLineup round prompts (the "…tap the fake" set-up) → Sarah reads each
// round aloud. Scoped by the following `senders:` key so only these match.
const senderRoundPromptRe = /prompt:\s*"((?:[^"\\]|\\.)*)"\s*,\s*senders:/g;
const blocks = [];

// Shared, non-week-specific lines. Finish-mode quick-checks speak a fixed
// instruction (she must not read the gapped sentence, which came out as
// "...proves it's blank"); one recording, reused by every week's finish
// quick-check. speaker "adam" = the narrator, matching QuickCheck's promptLines.
//
// This string MUST stay byte-identical to promptLines in
// app/components/exercises/QuickCheck.tsx. The manifest is keyed on the exact
// text, so when the wording changed there (#385: "Can you fill in the missing
// word?" -> "Can you finish the rule?") and not here, the recording became an
// orphan and InfoNarration fell through to the browser's SpeechSynthesis
// voice - a MAN on Windows - on one screen in every one of the 20 weeks.
// scripts/audit-shared-narration.mjs now fails on exactly that drift.
//
// Pinned to the week-1 narrator rather than left on the default: the lookup
// key is (speaker, text) with no week in it, so one text can only ever carry
// one voice. Week 1 is the week being tuned, and an Emma line inside a Sarah
// week is a far smaller seam than the robotic male voice every week plays
// today. It stops being a seam at all when weeks 2-20 migrate.
blocks.push({ speaker: "adam", lines: ["Can you finish the rule?"], source: "shared:quickcheck-finish" });
// (The SignBingo vault per-move prompt used to be recorded here as a shared
// line, which forced it to the default voice inside whatever week authored it.
// It is now scanned from the week file itself, next to its one-take chain.)
// VerdictVoice leads (owner 2026-09-12: Sarah speaks EVERY verdict with its reason):
// the two shared leads play before the per-item reason on every exercise, all weeks.
// Keep identical to VERDICT_LEADS in app/components/lesson/VerdictVoice.tsx.
blocks.push({ speaker: "adam", lines: ["That's right!"], source: "shared" });
blocks.push({ speaker: "adam", lines: ["Not quite."], source: "shared" });
// ProofScale (W15 signature): its claims live in the component, not in a week
// file. Sarah speaks each claim's `fact` on a right call (leadless: the fact is
// already an affirmation) and "Not quite." + a per-claim nudge on a wrong one.
// The two nudge templates MUST stay identical to nudgeBook / nudgeBuzz in
// app/components/exercises/signatures/ProofScale.tsx.
{
  const ps = await readFile("app/components/exercises/signatures/ProofScale.tsx", "utf8");
  const claimsBlock = ps.slice(ps.indexOf("const CLAIMS: Claim[] = ["), ps.indexOf("];", ps.indexOf("const CLAIMS: Claim[] = [")));
  const psRe = /topic:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?fact:\s*"((?:[^"\\]|\\.)*)"/g;
  let pm;
  while ((pm = psRe.exec(claimsBlock)) !== null) {
    const topic = pm[1].replace(/\\"/g, '"'), fact = pm[2].replace(/\\"/g, '"');
    blocks.push({ speaker: "adam", lines: [fact], source: "ProofScale.tsx" });
    blocks.push({ speaker: "adam", lines: [`Hmm, does that book really talk about ${topic}? Look for one that does!`], source: "ProofScale.tsx" });
    blocks.push({ speaker: "adam", lines: [`Beep? Wait. I think one of those books DOES talk about ${topic}. Peek again!`], source: "ProofScale.tsx" });
    // One-take verdicts (owner 2026-09-15): lead + nudge in a single generation.
    blocks.push({ speaker: "adam", lines: ["Not quite.", `Hmm, does that book really talk about ${topic}? Look for one that does!`], source: "ProofScale.tsx" });
    blocks.push({ speaker: "adam", lines: ["Not quite.", `Beep? Wait. I think one of those books DOES talk about ${topic}. Peek again!`], source: "ProofScale.tsx" });
  }
}

for (const fname of weekFiles) {
  const src = await readFile(join(WEEK_CONTENT_DIR, fname), "utf8");
  let fileBlocks = 0;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const speaker = m[1];
    const lines = [];
    const stringRe = /"((?:[^"\\]|\\.)*)"/g;
    let s;
    while ((s = stringRe.exec(m[2])) !== null) {
      const text = s[1].replace(/\\"/g, '"').trim();
      if (text) lines.push(text);
    }
    if (lines.length > 0) {
      blocks.push({ speaker, lines, source: fname });
      fileBlocks++;
    }
  }
  // Scenario setups → SARAH voice. Sarah (the teacher) reads the situation
  // aloud, then asks "which do you think?" — one consistent classroom voice
  // (owner dropped the separate storyteller for the scenarios). Recorded as
  // "adam" (both content speakers = Sarah); the component narrates the setup
  // with speaker="adam" to match this key.
  let sm;
  while ((sm = setupRe.exec(src)) !== null) {
    const text = sm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    if (text) {
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
  }
  // Choose-Your-Path consequences → SARAH voice. On the reveal, Sarah reads the
  // chosen path's outcome aloud so the child hears WHY it was the right (or
  // wrong) choice. Recorded as "adam" (both content speakers = Sarah); the
  // component narrates the consequence with speaker="adam" to match this key.
  let cq;
  while ((cq = consequenceRe.exec(src)) !== null) {
    const text = cq[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    if (text) {
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
  }
  let qp;
  while ((qp = quickCheckPromptRe.exec(src)) !== null) {
    const text = qp[1]
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/_{2,}/g, "blank")
      .trim();
    if (text) {
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
  }
  // SignBingo: Sarah reads each `scene` aloud, then explains the `why` on a
  // correct tap. Week 1 only for now (like the boss scans) so shipped weeks
  // (e.g. W13) don't gain voice unexpectedly; `scene:`/`why:` are SignBingo
  // keys. Recorded as "adam" (both content speakers = Sarah).
  // W14 opted in 2026-09-22: its review is a SignBingo and the scene is the
  // moment Sarah reads to the child. W6 is deliberately NOT here: it is live and
  // its six scenes are currently silent, so opting it in would add voice to a
  // shipped week. That is the owner's call, not a side effect of this run.
  // W6 opted in 2026-09-22: its six review scenes were the only lines in the
  // week Sarah never read, so a child who cannot yet read fluently saw the moment
  // and heard nothing. Safe to record only now that SignBingo waits for
  // !showIntro: before that fix, recording them made the start button take 45s.
  if (fname === "week1.ts" || fname === "week6.ts" || fname === "week14.ts") {
    const sbSceneRe = /\bscene:\s*"((?:[^"\\]|\\.)*)"/g;
    const sbWhyRe = /\bwhy:\s*"((?:[^"\\]|\\.)*)"/g;
    let sbm;
    while ((sbm = sbSceneRe.exec(src)) !== null) {
      const text = sbm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
      if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
    }
    while ((sbm = sbWhyRe.exec(src)) !== null) {
      const text = sbm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
      if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
    }
  }
  // One-take chains (UAT batch 3, item 7c): Power Bingo's move + its prompt, and
  // Choose Your Path's setup + "which do you think?" line, each recorded as ONE
  // generation so Sarah keeps one tone. Players fall back to the two-step chain.
  {
    const sbStart = src.indexOf('type: "signBingo"');
    if (sbStart >= 0 && /skin:\s*"vault"/.test(src.slice(sbStart, sbStart + 800))) {
      const sbEnd = src.indexOf("completeNarration", sbStart);
      const span = src.slice(sbStart, sbEnd > 0 ? sbEnd : src.length);
      const pm = span.match(/roundPrompt:\s*"((?:[^"\\]|\\.)*)"/);
      const promptText = pm ? pm[1].replace(/\\"/g, '"') : "Which power did that move use? Tap its dial.";
      for (const sm of span.matchAll(/\bscene:\s*"((?:[^"\\]|\\.)*)"/g)) {
        const scene = sm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
        if (scene) { blocks.push({ speaker: "adam", lines: [scene, promptText], source: fname }); fileBlocks++; }
      }
      // The same prompt on its own: the fallback the board plays when the
      // one-take chain above is missing. Recorded from the week file rather
      // than the shared table so it carries the WEEK's narrator; as a shared
      // line it was Sarah, inside an otherwise-Emma week 1.
      blocks.push({ speaker: "adam", lines: [promptText], source: fname });
      fileBlocks++;
    }
    const pnm = src.match(/promptNarration:\s*\{\s*speaker:\s*"[a-z]+",\s*lines:\s*\[([\s\S]*?)\]/);
    if (pnm) {
      const promptLines = [...pnm[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"').trim()).filter(Boolean);
      for (const sm of src.matchAll(/setup:\s*"((?:[^"\\]|\\.)*)"/g)) {
        const setup = sm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
        if (setup && promptLines.length) { blocks.push({ speaker: "adam", lines: [setup, ...promptLines], source: fname }); fileBlocks++; }
      }
    }
  }
  // TEMP scope: only weeks 1 and 15 have trimmed, finalized bosses (7 Q /
  // pass 5). The other weeks still have 15 un-rewritten questions, so skip
  // recording their long read-outs until the learn-loop rollout trims them.
  // Add each week's filename here as it is finalized; drop the guard at the end.
  // Weeks rebuilt to the Learn-Loop standard (boss trimmed to 5 / pass 4, wrong
  // panels + in-game read-alouds authored for Sarah). Append as weeks ship.
  const LEARN_LOOP_WEEKS = new Set(["week1.ts", "week2.ts", "week3.ts", "week4.ts", "week5.ts", "week6.ts", "week7.ts", "week8.ts", "week9.ts", "week10.ts", "week11.ts", "week12.ts", "week13.ts", "week14.ts", "week15.ts", "week16.ts", "week17.ts", "week18.ts", "week19.ts", "week20.ts"]);
  const learnLoop = LEARN_LOOP_WEEKS.has(fname);
  let ba, bossQ = 0;
  while (learnLoop && (ba = bossAskRe.exec(src)) !== null) {
    const askText = ba[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    const optRe = /text:\s*"((?:[^"\\]|\\.)*)"/g;
    const opts = [];
    let om;
    while ((om = optRe.exec(ba[2])) !== null) {
      opts.push(om[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim());
    }
    if (askText && opts.length) {
      // Same seed as QuizBoss askLines (qIdx*47+5) so the read matches the
      // shown order; bossQ is the question's index within this week's quiz.
      // Lines MUST stay identical to QuizBoss askLines (see that comment):
      // "Is it option A… <ans>, Option B… <ans>, Or is it option C… <ans>".
      const ordered = seededShuffle(opts, bossQ * 47 + 5);
      const LETTERS = ["A", "B", "C", "D", "E"];
      const lines = [askText];
      if (opts.some(isCodeLikeOption)) {
        lines.push(`Take a close look at options ${optionLetterList(ordered.length)}.`, "So, what do you think?");
        blocks.push({ speaker: "adam", lines, source: fname });
        fileBlocks++;
        bossQ++;
        continue;
      }
      ordered.forEach((text, i) => {
        const last = i === ordered.length - 1;
        const lead = i === 0
          ? `Is it option ${LETTERS[i]}...`
          : last
            ? `Or is it option ${LETTERS[i]}...`
            : `Option ${LETTERS[i]}...`;
        // Closed as a sentence so the voice pauses before the next option
        // (UAT W10 6c); mirrors QuizBoss askLines exactly.
        lines.push(lead, closeSentence(text));
      });
      lines.push("So, what do you think?");
      blocks.push({ speaker: "adam", lines, source: fname });
      fileBlocks++;
    }
    bossQ++;
  }
  // Boss reveal teach → Sarah explains WHY the safe answer is right on every
  // pick, and the fight waits for her to finish. Records BOTH the correct lead
  // ("That's right!") and the wrong lead ("Not quite.") in front of the same
  // teachOnWrong.explanation, matching QuizBoss's `explain.lines` exactly. Same
  // week-15-only scope as the read-outs above.
  if (learnLoop) {
    const bossTeachRe = /teachOnWrong:\s*\{\s*title:\s*"(?:[^"\\]|\\.)*"\s*,\s*explanation:\s*"((?:[^"\\]|\\.)*)"/g;
    let bt;
    while ((bt = bossTeachRe.exec(src)) !== null) {
      const expl = bt[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
      if (!expl) continue;
      blocks.push({ speaker: "adam", lines: ["That's right!", expl], source: fname });
      blocks.push({ speaker: "adam", lines: ["Not quite.", expl], source: fname });
      fileBlocks += 2;
    }
  }
  // Spoken verdicts (owner 2026-09-12): VerdictVoice plays the shared lead, then
  // the per-item reason as a single-line block. Every reason field is named
  // why / whyRight / whyWrong (or the quick-check nudge that stands in for one),
  // so ONE generic scan records them for the Learn-Loop weeks; engines that use
  // explanation / note are covered by the wrong-answer scan below.
  if (learnLoop) {
    // diagnosisExplanation (PasswordHospital) and verdictNote (Request/Profile
    // Inspector) never matched the lower-case explanation|note scan below, so
    // those panels were silent; they are verdict reasons and belong here.
    const reasonRe = /\b(?:why|whyRight|whyWrong|nudge|diagnosisExplanation|verdictNote|trap):\s*"((?:[^"\\]|\\.)*)"/g;
    const seenReason = new Set();
    let rm;
    while ((rm = reasonRe.exec(src)) !== null) {
      const text = rm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
      if (!text || seenReason.has(text)) continue;
      seenReason.add(text);
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
  }
  // SpamBlaster (Learn-Loop weeks): the wrong-answer panel fills a copy template
  // per email ("{sender}" / "{subject}" / "{clue}"), so record each FILLED
  // string exactly as the component builds it (fill() in SpamBlaster.tsx), plus
  // the clue itself (spoken after "That's right!" on a zap).
  if (learnLoop && /type:\s*"spamBlaster"/.test(src)) {
    const comp = await readFile("app/components/exercises/SpamBlaster.tsx", "utf8");
    const dflt = (k) => { const m = comp.match(new RegExp(k + ":\\s*\\n?\\s*(['\"])((?:[^'\"\\\\]|\\\\.)*)\\1")); return m ? m[2].replace(/\\"/g, '"').replace(/\\'/g, "'") : ""; };
    const sbStart = src.search(/type:\s*"spamBlaster"/);
    const sbEnd = src.slice(sbStart + 1).search(/^\s*\{?\s*type:\s*"/m);
    const span = src.slice(sbStart, sbEnd < 0 ? src.length : sbStart + 1 + sbEnd);
    const over = (k) => { const m = span.match(new RegExp("\\b" + k + ":\\s*\"((?:[^\"\\\\]|\\\\.)*)\"")); return m ? m[1].replace(/\\"/g, '"') : null; };
    const safeTpl = over("safeWrongExplanation") ?? dflt("safeWrongExplanation");
    const missTpl = over("missExplanation") ?? dflt("missExplanation");
    const clueFallback = over("missClueFallback") ?? dflt("missClueFallback");
    const emailRe = /sender:\s*"((?:[^"\\]|\\.)*)"\s*,\s*subject:\s*"((?:[^"\\]|\\.)*)"\s*,\s*isPhishing:\s*(true|false)\s*,\s*clue:\s*"((?:[^"\\]|\\.)*)"/g;
    let em;
    while ((em = emailRe.exec(span)) !== null) {
      const e = { sender: em[1].replace(/\\"/g, '"'), subject: em[2].replace(/\\"/g, '"'), isPhishing: em[3] === "true", clue: em[4].replace(/\\"/g, '"') };
      const fill = (tpl) => tpl.replace(/\{sender\}/g, e.sender).replace(/\{subject\}/g, e.subject).replace(/\{clue\}/g, e.clue || clueFallback);
      const text = (e.isPhishing ? fill(missTpl) : fill(safeTpl)).trim();
      if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
      if (e.isPhishing && e.clue) { blocks.push({ speaker: "adam", lines: [e.clue.trim()], source: fname }); fileBlocks++; }
      // One-take verdicts (owner 2026-09-15).
      if (text) { blocks.push({ speaker: "adam", lines: ["Not quite.", text], source: fname }); fileBlocks++; }
      if (e.isPhishing && e.clue) { blocks.push({ speaker: "adam", lines: ["That's right!", e.clue.trim()], source: fname }); fileBlocks++; }
    }
  }
  // Wrong-answer teaching (owner 2026-09-09): Sarah reads the WrongAnswerPanel
  // explanation aloud on any wrong pick. The panel's `explanation` prop is a
  // verbatim content field — `explanation` (ClueBoard/ConveyorSort/quickCheck)
  // or `note` (SenderLineup/TrailStamper) — so record each non-empty one as a
  // single-line block, matching InfoNarration({ lines: [explanation] }). Same
  // week-15-only scope; dedupes, and over-recording a few strings that aren't
  // shown in the panel is harmless.
  if (learnLoop) {
    const wrongRe = /(?:explanation|note):\s*"((?:[^"\\]|\\.)*)"/g;
    const seenWrong = new Set();
    let wm;
    while ((wm = wrongRe.exec(src)) !== null) {
      const text = wm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
      if (!text || seenWrong.has(text)) continue;
      seenWrong.add(text);
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
    // Signature guided first-round walkthrough (ProofScale): the `guide` field's
    // `claim` + `evidence` lines, each read as a single-line block by
    // InfoNarration({ lines: [guide.claim] } / [guide.evidence]).
    const guideRe = /guide:\s*\{[^}]*?claim:\s*"((?:[^"\\]|\\.)*)"[^}]*?evidence:\s*"((?:[^"\\]|\\.)*)"/g;
    let gm;
    while ((gm = guideRe.exec(src)) !== null) {
      for (const raw of [gm[1], gm[2]]) {
        const text = raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
        if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
      }
    }
  }
  // Week 2 Learn-Loop read-alouds (owner 2026-09-11): RevealBoard vignette beats
  // (steps[].text + counter + finale, "Sarah narrates these"), RequestInspector
  // zone notes ("read out the inspections as you click") + think nudges, and
  // StepOrder step affirmations (Sarah reads each step as it lands). Scoped to
  // week2.ts so shipped legacy weeks that use these engines stay silent
  // (recordedOnly) until their lines are recorded. Both content voices = Sarah.
  // Week 3 (2026-09-11) adds: PlaquePeek claim -> reveal, ProfileInspector
  // "label note" + nudge, PopupPanic request body -> why, CyberMaze gate
  // proposal -> why, ChatSimulator bubbles + feedback, TeamPoster pin notes.
  // Week 4 (2026-09-16) adds: every engine's per-item `readAloud` (Strings
  // Attached offers, Believe-o-Meter posters, Name Tag cases, No-Bite bricks,
  // Hall of Mirrors questions, Barker's Booth messages), the Name Tag teach
  // lines and the Booth's four inspection notes. Their why / whyWrong / nudge /
  // rightWhy reasons come from the generic reason scan above.
  // Week 5 (2026-09-16) adds: readAloud on the Laughing Scales moments, the
  // Campfire Ring stones, the Stepping Stones rounds, the Kind Moves Board
  // moments, the Ember Chase start card and Don't Feed the Fire's sparks, plus
  // the fire's three teach bodies (spoken by WrongAnswerPanel).
  // Week 6 (2026-09-16) adds: the Chat Fixer messages, Lobby Doors players and
  // settings card, Guard Count rounds and slots, Power Panel rounds (readAloud),
  // plus the Power Panel's two wrong-order teach lines (stepTeach array).
  // Gated on LEARN_LOOP_WEEKS, never a hardcoded list: this block used to
  // carry its own list of week files and weeks 15, 17 and 18 were never added
  // to it, so every in-game read-aloud in those weeks was generated for
  // nobody and played as silence, with no error anywhere and nothing in any
  // audit to catch it. Keep this keyed off the shared set.
  if (learnLoop) {
    const w2TypeRe = /^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm;
    const w2Starts = [];
    let w2m;
    while ((w2m = w2TypeRe.exec(src)) !== null) w2Starts.push({ type: w2m[1], off: w2m.index });
    const pushAll = (span, re) => {
      let mm;
      while ((mm = re.exec(span)) !== null) {
        const text = mm[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
        if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
      }
    };
    w2Starts.forEach((st, i) => {
      const span = src.slice(st.off, i + 1 < w2Starts.length ? w2Starts[i + 1].off : src.length);
      if (st.type === "reveal") {
        pushAll(span, /\btext:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bcounter:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bfinale:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "requestInspector") {
        // Sarah reads each inspection as "label note" (question + answer), so record
        // the joined line the component speaks, not the bare note.
        let zm;
        const zoneRe = /label:\s*"((?:[^"\\]|\\.)*)",\s*note:\s*"((?:[^"\\]|\\.)*)"/g;
        while ((zm = zoneRe.exec(span)) !== null) {
          const text = (zm[1] + " " + zm[2]).replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
          if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
        }
        pushAll(span, /\bnudge:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "stepOrder") pushAll(span, /\baffirmation:\s*"((?:[^"\\]|\\.)*)"/g);
      // Sarah reads each thing as it arrives on both of these, and neither
      // had a scan, so Week 14's Ears Check shipped with all eight things
      // silent. Their why / explanation reasons come from the generic reason
      // scan above; only the read-aloud was missing.
      if (st.type === "hookSort" || st.type === "replyCards" || st.type === "settingsSwitch") {
        pushAll(span, new RegExp("\\breadAloud:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
      }
      if (st.type === "plaquePeek") {
        pushAll(span, /\bclaim:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\baddress:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "profileInspector") {
        let zm;
        const zoneRe = /label:\s*"((?:[^"\\]|\\.)*)",\s*note:\s*"((?:[^"\\]|\\.)*)"/g;
        while ((zm = zoneRe.exec(span)) !== null) {
          const text = (zm[1] + " " + zm[2]).replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
          if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; }
        }
        pushAll(span, /\bnudge:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "clueStamper") {
        // The Clue Stamper: Sarah reads each case as it arrives, says the
        // case's why on a correct lock, and each clue's teach on a wrong one.
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\brightWhy:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bteach:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "popupPanic") {
        pushAll(span, /\bbody:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bwhyTrick:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "cyberMaze") {
        pushAll(span, /\bquestion:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bwhy:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "chatSimulator") {
        // only the transcript bubbles are spoken, never the reply labels
        const msgBlock = span.match(/messages:\s*\[([\s\S]*?)\]\s*,\s*choices:/);
        if (msgBlock) pushAll(msgBlock[1], /\btext:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bfeedback:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 4 engines: Sarah reads every item as it arrives (`readAloud`).
      if (["stringsAttached", "believeOMeter", "nameTagCheck", "firewallBuilder", "passwordVault", "phishInspector"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "nameTagCheck") {
        // a correct lock's why, and each piece's teach on a wrong lock
        pushAll(span, /\brightWhy:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\bteach:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "phishInspector") {
        // each inspection note is read as its zone opens
        pushAll(span, /\b(?:senderNote|linkNote|urgencyNote|claimNote):\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 5 engines: Sarah reads every moment / stone / round / spark as it arrives.
      if (["dayBalancer", "growthRings", "passcodeForge", "accountRescue", "dontFeedTheFire", "snowballChase"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "dontFeedTheFire") {
        // the three teach panels speak their body ("Not quite." + body)
        pushAll(span, /\bbody:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 6 engines: Sarah reads every message / player / round / slot as it arrives.
      if (["chatFixer", "lobbyDoors", "guardCount", "powerPanel"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "powerPanel") {
        // stepTeach: ["skipped step 1", "skipped step 2"] spoken by WrongAnswerPanel
        let sm;
        const stRe = /stepTeach:\s*\[\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\]/g;
        while ((sm = stRe.exec(span)) !== null) {
          for (const t of [sm[1], sm[2]]) { const text = t.replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim(); if (text) { blocks.push({ speaker: "adam", lines: [text], source: fname }); fileBlocks++; } }
        }
      }
      // Week 7 engines: Sarah reads every pack / jar round / deal as it arrives.
      if (["coinCounter", "oddsJar", "truePriceLever"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "truePriceLever") {
        // each deal's teach panel speaks its body ("Not quite." + body)
        pushAll(span, /\bbody:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 8 engines: Sarah reads every photo round, every friend's answer and every leak.
      if (["undoTest", "askRing", "developingTray"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "developingTray") {
        // the tray's step read-alouds have their own keys, so the plain readAloud scan misses them
        pushAll(span, /\b(?:developReadAloud|spotReadAloud|decideReadAloud):\s*"((?:[^"\\]|\\.)*)"/g);
        // the SHARE teach panel speaks its body ("Not quite." + body)
        pushAll(span, /\bbody:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 9 engines: Sarah reads every parcel label (Delivery Dock), every box
      // face (Flip the Box), every test-drive minute and every spot the grown-up finds.
      if (["vaultDrop", "flipTheBox", "testDrive", "fourEyes"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 10 engines: Sarah reads the moment each round opens on (the rung
      // the climb is standing on, the shouted claim, the comment surfacing from
      // the pond, the watching moment), plus the Great Climb-Out's token labels
      // (the child picks a grip out of three, and the labels are the choice).
      if (st.type === "climbOut") {
        pushAll(span, /\bprompt:\s*"((?:[^"\\]|\\.)*)"/g);
        pushAll(span, /\blabel:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "whoKnows") pushAll(span, /\bclaim:\s*"((?:[^"\\]|\\.)*)"/g);
      if (st.type === "commentPond") pushAll(span, /\btext:\s*"((?:[^"\\]|\\.)*)"/g);
      if (st.type === "pausePower") pushAll(span, /\bsetup:\s*"((?:[^"\\]|\\.)*)"/g);
      // Week 11 engines: Sarah reads each stone as it is lifted, each radio
      // channel as the dial lands on it, and each drill situation as it opens.
      if (st.type === "calmConsole") pushAll(span, /\blabel:\s*"((?:[^"\\]|\\.)*)"/g);
      if (st.type === "radioRoll") pushAll(span, /\blabel:\s*"((?:[^"\\]|\\.)*)"/g);
      if (st.type === "drillRun") pushAll(span, /\bsituation:\s*"((?:[^"\\]|\\.)*)"/g);
      // Week 12 engines: Sarah reads each print as it thaws, each post as it
      // rises to the mirror, and each stretch of the trail as it lights up.
      // The Trail Planner also reads every option label out loud (the child
      // picks one of three, and the labels are the choice).
      if (["trackBack", "futureMirror", "trailPlanner"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      if (st.type === "trailPlanner") pushAll(span, /\blabel:\s*"((?:[^"\\]|\\.)*)"/g);
      if (st.type === "dayJug") pushAll(span, /\blabel:\s*"((?:[^"\\]|\\.)*)"/g);
      // Week 13 engines: Sarah reads each pour as the day opens, each plan
      // situation as it lands on the desk, and each thing in the room as it is
      // tapped. The See-Saw Day's swap stories are read too.
      // The Day Jug reads every option label aloud too (the child picks a pour
      // out of three, and the labels are the choice). The other two do not.
      if (["dayJug", "setTheDial", "nightFall"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 14 engines: Sarah reads each diary entry as its seal is lifted and
      // each corner of the house as the two pictures come up. LensCheck's `teach`
      // is display-only by design, so it is deliberately NOT scanned.
      if (["speakerDiary", "lensCheck"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 16 engines: Sarah reads each poster as it goes up, each door as it
      // slides in, and each maze door's claim. StickerPeel's `tell` and
      // GlassCheck's `pane` are read on screen only, never spoken.
      if (["stickerPeel", "glassCheck", "keyholeCheck"].includes(st.type)) {
        pushAll(span, /\breadAloud:\s*"((?:[^"\\]|\\.)*)"/g);
      }
      // Week 17 engines: Sarah reads each room over the rope, each pane as it
      // is lifted, each scoop as it lands in the pan, and each draft line as it
      // comes up. What stays on screen and is NEVER spoken: a room's `name` and
      // `inside`, a pane's `label` and `shows`, a pebble's `name` and `who`, and
      // a line's `text` and `swapTo`. The Friend Panner's readAloud sits on the
      // scoop rather than the pebble, which this span-wide scan still reaches.
      // Week 18: the shelf reads each thing as it comes up. The Log Out
      // sweep speaks per card through `logOut` rather than `readAloud`, and
      // its four committed lines (lockWhy, earlyLockExplanation, goblinLine,
      // lookBackWhy) are picked up by the global scans.
      // Week 19: the kitchen question, the frozen scene and the quilt square
      // are each read aloud as they arrive.
      if (["explainIt", "speakUp", "hearthLoom"].includes(st.type)) {
        pushAll(span, new RegExp("\\breadAloud:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
      }
      if (["whoseIsIt"].includes(st.type)) {
        pushAll(span, new RegExp("\\breadAloud:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
      }
      if (["logOutFlick"].includes(st.type)) {
        pushAll(span, new RegExp("\\blogOut:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
        for (const k of ["lockWhy", "earlyLockExplanation", "goblinLine", "lookBackWhy"]) {
          pushAll(span, new RegExp("\\b" + k + ":\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
        }
      }
      if (["ropeLine", "frostMirror", "draftScrub", "friendPanner"].includes(st.type)) {
        pushAll(span, new RegExp("\\breadAloud:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g"));
      }
      // teamPoster notes are already covered by the wrong-answer `note:` scan above
    });
  }
  let sr;
  while ((sr = senderRoundPromptRe.exec(src)) !== null) {
    const text = sr[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    if (text) {
      blocks.push({ speaker: "adam", lines: [text], source: fname });
      fileBlocks++;
    }
  }
  if (fileBlocks > 0) {
    console.log(`  ${fname}: ${fileBlocks} block(s)`);
  }
}

// One-take verdicts (owner 2026-09-15): "Not quite." and its reason recorded as
// two separate generations sound like two different people back to back, so
// record each verdict the child can hear as ONE take. VerdictVoice plays the
// one-take clip when it exists and falls back to lead-then-reason otherwise.
// The pairs come from audit-verdict-voice.mjs, whose per-engine map mirrors
// exactly which reason each component speaks after which lead. It runs over ALL
// weeks and records a one-take for every pair whose reason is recorded in this
// run: wherever Sarah would speak the reason, she speaks it in one take.
{
  const LEADS = { right: "That's right!", wrong: "Not quite." };
  const r = spawnSync(
    process.execPath,
    ["scripts/audit-verdict-voice.mjs", "--pairs-json", "--all"],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  const lastLine = (r.stdout || "").trim().split("\n").pop() || "[]";
  let verdictPairs = [];
  try {
    verdictPairs = JSON.parse(lastLine);
  } catch {
    console.error("  (warning: could not read verdict pairs from audit-verdict-voice.mjs)");
  }
  // Only where the reason itself is recorded; an un-recorded reason is silent
  // by design (recordedOnly), so there is no join to hear.
  //
  // The one-take INHERITS the source of the reason it wraps, so it is recorded
  // in that week's narrator. A flat "verdict-one-take" tag sent every one of
  // these to the default voice, which is how week 1 kept answering in Sarah on
  // every teach panel while the rest of the week was Emma: the leadless reason
  // was Emma, the "Not quite." + same reason one-take that actually plays was
  // Sarah, and the two clips are indistinguishable in the manifest.
  const reasonSource = new Map();
  for (const b of blocks) {
    if (b.lines.length === 1) reasonSource.set(joinBlock(b.lines), b.source);
  }
  let oneTakes = 0;
  for (const { verdict, why } of verdictPairs) {
    const key = joinBlock([why]);
    if (!reasonSource.has(key)) continue;
    blocks.push({ speaker: "adam", lines: [LEADS[verdict], why], source: reasonSource.get(key) });
    oneTakes++;
  }
  console.log(`  one-take verdicts: ${oneTakes} block(s) (of ${verdictPairs.length} audited pairs, all weeks)`);
}

/* --week=N records one week and leaves the rest alone.
 *
 * The move to one narrator re-hashes every block in the course, which is a
 * single run of several thousand recordings. That is the wrong unit of work
 * while the scripts are still being rewritten week by week: a week recorded
 * before its rewrite is a week paid for twice. So a week can be finished,
 * recorded and listened to on the real site on its own, and the rest follow
 * once the writing is settled.
 */
/* NEVER remove the other weeks' blocks here.
 *
 * The manifest is written from this list, so filtering it rebuilt the manifest
 * out of one week and dropped the other 4,900 entries. Every other week then
 * found no clip for any line and fell back to the browser's speech synthesis -
 * a robot voice across nineteen weeks - while the deploy was green, the
 * manifest was valid JSON and the week being worked on was perfect. It shipped
 * exactly that way once.
 *
 * So the flag marks the other weeks as "do not record" and leaves them in the
 * manifest, pointing at the clips they already have.
 */
const ONLY_WEEK = (process.argv.find((a) => a.startsWith("--week=")) || "").split("=")[1];
if (ONLY_WEEK) {
  const want = `week${ONLY_WEEK}.ts`;
  let selected = 0;
  for (const b of blocks) {
    b.skipRecord = b.source !== want;
    if (!b.skipRecord) selected++;
  }
  console.log(`--week=${ONLY_WEEK}: recording ${selected} of ${blocks.length} blocks; the rest keep the clips they have`);
}

console.log(`Found ${blocks.length} narration blocks (${blocks.reduce((n, b) => n + b.lines.length, 0)} lines)`);

// Existing manifest for caching on re-runs.
let manifest = { entries: [] };
try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
} catch {
  /* first run */
}
const existing = new Map(manifest.entries.map((e) => [e.key, e]));

function hashKey(speaker, voiceId, blockText) {
  return createHash("sha1")
    .update(`${GENERATION_VERSION}::${speaker}::${voiceId}::${blockText}`)
    .digest("hex")
    .slice(0, 16);
}

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

// ── Clean endings (UAT 2026-09-15) ────────────────────────────────────────
// A tester heard the last word "cut really fast". Measured across every clip:
// eleven_v3 ends nearly every file within ~0.1s of the last word, and some
// files stop while the voice is still sounding. So: retake a clip whose last
// 60ms is still loud, and always append a short silence so the final word has
// room to land before the host moves on.
// 2026-10-04: that guard never fired on the clips the testers complained about,
// for the same reason my audit cleared them. `-sseof -0.06` reads the last 60ms
// of the FILE, and ElevenLabs usually leaves a little silence there - so a clip
// whose voice stops at full level passes, because the silence after it is quiet.
// What matters is the moment the VOICE stops. Measured over all 5,173 clips, one
// that lands ends near -34 dB having fallen ~21 dB across its closing half
// second; 227 ended still at level, and those are the ones heard as "cut off
// sharply" or "out of breath". So the test is now the level at end of speech.
const CUT_OFF_DB = -24;   // RMS of the last 80ms OF SPEECH above this = cut off
const MAX_CUT_RETAKES = 4;
const END_PAD_SEC = 0.45;
const START_PAD_MS = 120;
// Transient API errors (rate limit, gateway) are retried with backoff so one
// flaky response cannot end a long recording run.
async function fetchWithRetry(url, init, attempts = 4) {
  let resp;
  for (let i = 0; i < attempts; i++) {
    resp = await fetch(url, init);
    if (resp.ok || !(resp.status === 429 || resp.status >= 500)) return resp;
    const waitMs = [5000, 15000, 30000, 60000][i] ?? 60000;
    process.stdout.write(`(HTTP ${resp.status}, retrying in ${waitMs / 1000}s) `);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  return resp;
}

function runFfmpeg(args) {
  return spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}
/** Same, but keeps stdout as bytes - for decoding a clip to raw PCM. */
function runFfmpegBinary(args) {
  return spawnSync(ffmpegPath, args, { maxBuffer: 1 << 28 });
}
/**
 * Where the voice actually stops, and how loud it still is there.
 *
 * Decodes to mono 16k PCM and walks back to the last 20ms above a speech
 * floor. Returns the end of speech in seconds and the RMS of the 80ms before
 * it. Reading the tail of the file instead is what let every one of these
 * through (see CUT_OFF_DB).
 */
const ENDING_SR = 16000;
function endingOfSpeech(file) {
  const r = spawnSync(ffmpegPath, ["-v", "quiet", "-i", file, "-ac", "1", "-ar", String(ENDING_SR), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || !r.stdout.length) return { endSec: -1, endDb: -99 };
  const b = r.stdout;
  const n = b.length >> 1;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i << 1) / 32768;
  const rms = (from, to) => {
    let s = 0, c = 0;
    for (let i = Math.max(0, from); i < Math.min(a.length, to); i++) { s += a[i] * a[i]; c++; }
    return c ? Math.sqrt(s / c) : 0;
  };
  const toDb = (x) => (x <= 1e-9 ? -120 : 20 * Math.log10(x));
  const win = Math.round(ENDING_SR * 0.02);
  const floor = Math.pow(10, -45 / 20);
  let end = -1;
  for (let i = a.length - win; i >= 0; i -= win) {
    if (rms(i, i + win) > floor) { end = i + win; break; }
  }
  if (end < 0) return { endSec: -1, endDb: -99 };
  const w80 = Math.round(ENDING_SR * 0.08);
  return { endSec: end / ENDING_SR, endDb: toDb(rms(end - w80, end)) };
}
function endingLoudnessDb(file) {
  return endingOfSpeech(file).endDb;
}

/**
 * Lead-in, a landing, and a cushion.
 *
 * A clip that still opens at full volume loses its first consonant when
 * playback starts (UAT round 2, W2 1a-1d), hence the 120ms lead-in. A clip
 * that STOPS at full level is heard as cut off or out of breath, so when the
 * take ends above CUT_OFF_DB the final moments are ramped down: the louder the
 * stop, the longer the ramp (120ms at -24 dB out to 220ms at -12 dB). A
 * syllable runs 150-250ms, so this shapes the tail of the last sound rather
 * than swallowing it. A take that already lands is padded and nothing else.
 */
function padEnding(inFile, outFile) {
  const { endSec, endDb } = endingOfSpeech(inFile);
  const lead = START_PAD_MS / 1000;
  let filter = `adelay=${START_PAD_MS}:all=1`;
  if (endSec > 0 && endDb > CUT_OFF_DB) {
    const k = Math.min(1, Math.max(0, (endDb - CUT_OFF_DB) / 12));
    const fade = 0.12 + k * 0.1;
    const stop = lead + endSec;
    filter += `,afade=t=out:st=${Math.max(0, stop - fade).toFixed(3)}:d=${fade.toFixed(3)},atrim=0:${(stop + 0.02).toFixed(3)}`;
  }
  filter += `,apad=pad_dur=${END_PAD_SEC}`;
  const r = runFfmpeg([
    "-hide_banner", "-y", "-i", inFile,
    "-af", filter,
    "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
    outFile,
  ]);
  return r.status === 0;
}

/**
 * Join the block's lines into a single TTS prompt. Lines already end
 * with punctuation (./!/?) so a space between them is enough - the
 * model will produce natural sentence-end pauses from the punctuation.
 */
function joinBlock(lines) {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * What we SEND to the model, as opposed to what we hash.
 *
 * The comment above turned out to be wrong: a space does not give the model
 * sentence structure, it gives it one run-on paragraph, and it then weights
 * every full stop like a comma. Real line breaks read as structure.
 *
 * The hash deliberately stays on the space-joined text, so adopting this does
 * not invalidate a single existing recording.
 */
function speakBlock(lines) {
  return lines.map((l) => l.trim()).filter(Boolean).join("\n");
}

/* ── Delivery spec ──────────────────────────────────────────────────────────
 * Measured on week 1: Sarah's full stops were landing at 0.24-0.33s, barely
 * longer than her commas, so a thought never settled before the next one
 * began. That is what reads as synthetic, and it is also why she felt rushed
 * at an ordinary speaking rate. The words were never the problem.
 *
 * So every silence is re-cut to one of four lengths, and the speech tempo
 * SOLVES for the target pace rather than being a fixed number, because the
 * model's own speed drifts about 10 wpm between generations of identical text.
 */
// JOIN is for a silence the punctuation never asked for: an artefact of
// articulation rather than a pause. Not zero, because butting two spans
// hard together clicks; just short enough to read as continuous speech.
/* Owner: "it only stops at the commas and the full stops, and there is a good
 * break between the next sentence, not too long, just enough for it not to
 * sound abnormal."
 *
 * So the vocabulary is small and short. The old set ran to 1.20s for a
 * dramatic beat, which is a stage pause rather than a teaching one. Half a
 * second is what a person actually leaves at a full stop, and a paragraph gets
 * a little more without becoming a silence. */
/* Owner: "there is no pause after the sentence has stopped, after a full stop,
 * so she needs to take a breath - and I do not want to hear the breath."
 *
 * That is a silence long enough to read AS a breath, with the inhale itself
 * trimmed out. 0.50s was not enough to feel like one; 0.65 is. The paragraph
 * break grows with it so the hierarchy still reads. The join is only used now
 * where the audio is genuinely cut, which is rare. */
const SPEC_GAP = {
  butt: 0, join: 0.05, comma: 0.22,
  dash: 0.30,    // " - " and ";" read as a dash: a beat longer than a comma
  colon: 0.35,   // ":" leans forward into what it introduces
  trail: 0.55,   // "..." is a trailing thought, just short of a full stop
  stop: 0.65, thought: 0.85, reveal: 0.85,
};
const SPEC_TAIL = 0.30;
/* Hold her ARTICULATION constant, not the overall words-per-minute.
 *
 * Targeting overall pace was the wrong quantity: it counts the silence, so
 * on a short clip the fixed pauses eat most of the budget and the solver
 * speeds her words up to compensate, while on a long one it slows them down.
 * Measured across week 1 that produced articulation from 124 to 318 wpm -
 * two and a half times faster on some cards than others, which is what
 * 'some cards flow and others do not' sounds like.
 *
 * Articulation is what a listener hears as her speaking rate, so that is what
 * stays fixed. The pauses then add on top from their own vocabulary, and a
 * clip with more sentence breaks simply has more silence in it, which is what
 * a person does anyway.
 */
// 180, not 190. Once the manufactured pauses went, total silence fell from
// 28% of a clip to 19%, which pushed the overall pace from 141 to 157 wpm -
// near the 162 the owner judged too fast. Less silence means the words have to
// come down to keep the same felt pace.
/* 165, not 180. Owner: "she is racing through it." 180 is a confident adult
 * reading rate; a teacher landing an idea on a six year old is slower. */
const TARGET_ARTICULATION = 165;
// The slowest a finished clip may read overall, once its silence is counted.
const MIN_OVERALL_WPM = 118;
/* Every clip is brought to the same loudness, whoever is reading.
 *
 * Voices differ by several dB at identical settings: Brittney records at
 * -18.9 dB where Sarah sits at -14.8. Four dB is plainly audible, and the
 * course mixes narration against music and effects at fixed levels, so a
 * quieter narrator does not merely sound quieter, she sounds weak under the
 * bed. This also keeps the handful of lines shared across all twenty weeks
 * level with the week's own narration.
 */
const TARGET_MEAN_DB = -15.0;
const PEAK_CEILING_DB = -1.0;

function mediaDuration(file) {
  const r = runFfmpeg(["-i", file, "-f", "null", "-"]);
  const m = ((r.stderr || "") + (r.stdout || "")).match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

/**
 * Rebuild a finished clip to the spec: her speech untouched, every silence
 * re-cut. Returns false and leaves the file exactly as it was if anything
 * about the clip makes reshaping unsafe.
 */
/* Where every word actually falls, from the recording itself.
 *
 * The shaper has to know when each punctuation mark happens so it can tell a
 * real pause from an artefact of articulation. It used to estimate that by
 * character position, assuming every letter takes the same time to say. It
 * does not: "Dragon. Taco. Comet." and "the easiest way to make a long one"
 * occupy wildly different time per character, so the estimate drifts and a
 * mark gets attached to the wrong silence. That is how "Not quite." came out
 * as "Not ... quite." with two thirds of a second in the middle, on every
 * wrong answer in the course.
 *
 * So ask the recording. Scribe returns a start and end for every word, which
 * pins each mark to the word it follows instead of guessing. Cached against
 * the AUDIO's own bytes, so a re-shape of an unchanged clip costs nothing and
 * a re-recorded clip is never read from a stale transcript.
 */
const STT_CACHE = ".stt-cache";
async function transcribeWords(file) {
  try {
    const buf = await readFile(file);
    const key = createHash("sha1").update(buf).digest("hex").slice(0, 20);
    const cached = join(STT_CACHE, `${key}.json`);
    if (await fileExists(cached)) return JSON.parse(await readFile(cached, "utf8"));
    const fd = new FormData();
    fd.append("model_id", "scribe_v1");
    fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST", headers: { "xi-api-key": KEY }, body: fd,
    });
    if (!r.ok) return null;
    const j = await r.json();
    const words = (j.words || [])
      .filter((w) => w.type === "word" && Number.isFinite(w.start) && Number.isFinite(w.end))
      .map((w) => ({ text: w.text, start: w.start, end: w.end }));
    if (!words.length) return null;
    await mkdir(STT_CACHE, { recursive: true });
    await writeFile(cached, JSON.stringify(words));
    return words;
  } catch {
    return null;   // never let a transcript failure cost a paid recording
  }
}

const normWord = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

/* Line the script's words up with the recording's words.
 *
 * Needleman-Wunsch rather than position-by-position: Scribe drops a word now
 * and then, splits "Comet$Turtle3" differently, or writes a number as digits,
 * and a straight zip would then be one word out for the rest of the clip -
 * which is the very error this exists to remove.
 */
function alignWords(script, heard) {
  const n = script.length, m = heard.length;
  if (!n || !m) return [];
  const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { S[i][0] = -i; P[i][0] = 1; }
  for (let j = 1; j <= m; j++) { S[0][j] = -j; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const a = normWord(script[i - 1].t), b = normWord(heard[j - 1].text);
      const same = a && b && (a === b || a.startsWith(b) || b.startsWith(a));
      const diag = S[i - 1][j - 1] + (same ? 2 : -1);
      const up = S[i - 1][j] - 1;
      const left = S[i][j - 1] - 1;
      if (diag >= up && diag >= left) { S[i][j] = diag; P[i][j] = 0; }
      else if (up >= left) { S[i][j] = up; P[i][j] = 1; }
      else { S[i][j] = left; P[i][j] = 2; }
    }
  }
  const map = new Array(n).fill(-1);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    const p = P[i][j];
    if (p === 0) { map[i - 1] = j - 1; i--; j--; }
    else if (p === 1) i--;
    else j--;
  }
  return map;
}

function shapeToSpec(file, lines, heard) {
  const words = lines.join(" ").replace(/\[[a-z ]*\]/gi, "").trim().split(/\s+/).filter(Boolean).length;
  if (!words) return false;
  const total = mediaDuration(file);
  if (total <= 0) return false;

  const probe = runFfmpeg(["-i", file, "-af", "silencedetect=noise=-36dB:d=0.08", "-f", "null", "-"]);
  const log = (probe.stderr || "") + (probe.stdout || "");
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const sil = starts
    .map((s, i) => ({ start: s, end: ends[i] ?? total }))
    .filter((s) => s.end > s.start && s.start > 0.02);

  const spans = [];
  let cursor = 0;
  for (const s of sil) {
    if (s.start - cursor > 0.04) spans.push({ from: cursor, to: s.start });
    cursor = s.end;
  }
  if (total - cursor > 0.04) spans.push({ from: cursor, to: total });
  if (!spans.length) return false;

  /* Trim the breath off the end of each span.
   *
   * eleven_v3 breathes, which is good, but the breath sits INSIDE the span:
   * measured on week 1, six of eight span-ends carried a tail 12 to 33dB below
   * her speech. A short natural gap used to mask it. Against the clean silence
   * this spec inserts it is suddenly audible at the end of every sentence,
   * which is exactly what the owner heard.
   *
   * So walk back from the end of each span while the level stays low and cut
   * that off. Capped, and skipped for anything shorter than 60ms, so a quiet
   * consonant ("s", "f", "th") is never eaten - only a real breath is long
   * enough and quiet enough to qualify.
   */
  const pcmProc = runFfmpegBinary(["-v", "quiet", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]);
  const pcm = pcmProc.stdout;
  if (pcm && pcm.length > 4) {
    const SR = 16000;
    const samples = Math.floor(pcm.length / 2);
    const win = Math.floor(SR * 0.02);                       // 20ms steps
    const levelAt = (i0) => {
      let sum = 0, n = 0;
      for (let i = i0; i < Math.min(samples, i0 + win); i++) {
        const v = pcm.readInt16LE(i * 2) / 32768;
        sum += v * v; n++;
      }
      return n ? Math.sqrt(sum / n) : 0;
    };
    // The clip's own speech level, so the threshold travels with the recording
    // instead of being an absolute number that drifts with the voice.
    let loud = 0;
    for (let i = 0; i + win < samples; i += win) loud = Math.max(loud, levelAt(i));
    const floor = loud * 0.06;                               // about 24dB down
    const MAX_TRIM = 0.45;
    /* A breath is long. A final consonant is short.
     *
     * Owner: "on the last word of a sentence it almost cuts out that last
     * letter." It did: the quiet tail this walks back through is a breath on
     * most sentences, but on one ending in s, t, k or p it is the consonant
     * itself, which carries barely more energy. Trimming at 0.06s took the
     * consonant with it and the word lost its ending.
     *
     * A breath runs 0.2s or more; no final consonant does. So nothing shorter
     * than MIN_TRIM is touched, and whatever is removed leaves KEEP_TAIL of
     * the decay behind so the consonant is never clipped at its edge either.
     */
    const MIN_TRIM = 0.20;
    const KEEP_TAIL = 0.05;
    /* Loudness alone cannot tell a breath from a final consonant.
     *
     * Measured on "...secret wish list!": the t release sits at 1 to 2.6% of
     * the clip's peak, and a breath occupies the same band. The speech floor
     * is 6%, so the walk-back read the consonant as silence and went straight
     * through it, and the child heard "lis". Dropping the floor far enough to
     * save the t would stop breaths being trimmed at all.
     *
     * What separates them is LENGTH. A breath runs 0.2s or more; a t, k, p or
     * s release is under 0.1s. So walk back through true silence first - which
     * is genuinely empty, 0.0000 against the t's 0.0109 - then look at the
     * quiet-but-not-empty stretch in front of it. Short means consonant: stop
     * there and keep it. Long means breath: carry on through it.
     */
    const silence = loud * 0.008;        // true room silence, well under the t
    const CONSONANT_MAX = 0.12;          // nothing longer than this is a consonant
    for (const sp of spans) {
      let end = Math.floor(sp.to * SR);
      const limit = Math.max(Math.floor(sp.from * SR), end - Math.floor(MAX_TRIM * SR));
      while (end - win > limit && levelAt(end - win) < silence) end -= win;
      // the quiet stretch immediately before: consonant, or breath?
      let quiet = end;
      while (quiet - win > limit && levelAt(quiet - win) < floor) quiet -= win;
      const quietLen = (end - quiet) / SR;
      if (quietLen > CONSONANT_MAX) end = quiet;   // a breath: take it as well
      const trimmed = sp.to - end / SR;
      if (trimmed >= MIN_TRIM) sp.to = Math.min(sp.to, end / SR + KEEP_TAIL);
    }

    /* Drop any span the trim has reduced to nothing.
     *
     * A span that was only ever a breath comes out of the trim near zero. Left
     * in, it separates two silences that then both get their own spec length,
     * and the pair reads as ONE long pause: measured on week 1's Learn clip,
     * two 1.45s silences where the longest the spec allows is 1.20s. Removing
     * the empty span merges those neighbouring silences into one, which is
     * what they always were.
     */
    const MIN_SPAN = 0.12;
    for (let i = spans.length - 1; i >= 0; i--) {
      if (spans[i].to - spans[i].from >= MIN_SPAN) continue;
      spans.splice(i, 1);
      // sil[i] follows spans[i]; removing the span merges the silence around it
      if (i < sil.length) sil.splice(i, 1);
      else if (sil.length) sil.pop();
    }
    if (spans.length < 1) return false;
  }

  const spanLen = spans.map((s) => s.to - s.from);
  const rawGaps = [];
  for (let i = 0; i + 1 < spans.length; i++) rawGaps.push(sil[i] ? sil[i].end - sil[i].start : 0);

  /* Pause where the TEXT says to, and nowhere else.
   *
   * This used to classify each gap purely by how long it happened to be, which
   * meant anything the detector found at 80ms or more became a pause. Ordinary
   * speech is full of those: the tiny closures on p, t and k, and the join
   * between words. They were being stretched to 0.20s each, so the shaper was
   * MANUFACTURING breaks. Measured on week 1's Learn clip, the text asked for
   * 12 pauses and the audio was given 14, five of them 0.20s in a passage
   * containing two commas. That is the "unnecessary breaks between words" the
   * owner heard, and it was mine, not the model's.
   *
   * So the plan now comes from the punctuation, and each detected gap is
   * matched to the nearest punctuation mark by position. A gap that matches
   * one gets that mark's length. A gap that matches nothing is collapsed to a
   * hairline, so the words run together as written.
   */
  const spokenText = lines.join("\n").replace(/\[[a-z ]*\]/gi, "");
  const marks = [];
  /* Every mark a READER pauses on, not just the four this used to know.
   *
   * It counted only , . ! ? and newlines. Week 1's script also contains 32
   * spaced hyphens, 26 semicolons, 4 colons and 2 ellipses - 64 places where
   * the voice takes a breath because the writing told it to, and the shaper
   * had no mark to explain the silence it then measured.
   *
   * That did two kinds of damage. The gap itself was treated as unexplained
   * and squeezed to a hairline, deleting a pause the writing asked for. Worse,
   * every mark AFTER it was now matched to the wrong gap, so the whole plan
   * slid along the clip: measured across week 1, 102 pairings sat more than
   * 0.7s from where the mark was predicted. A pause landing one gap late is
   * precisely "she stops between words that belong together".
   *
   * An ellipsis is a trailing thought and gets the longest of these; a colon
   * introduces what follows and gets a touch more than a semicolon, which is
   * a touch more than a comma. A spaced hyphen is read as a dash, so it takes
   * the same beat as a semicolon. A hyphen INSIDE a word (cyber-doctor) is not
   * a mark and is left alone, which is why the pattern requires the spaces.
   */
  // The ellipsis alternative comes FIRST: "[.!?]+" would otherwise swallow
  // "..." and bill it as a full stop.
  const markRe = /(\.\.\.|…)|(,)|([.!?]+)(?=\s|$)|(\n+)|(\s[-–—]\s)|(;)|(:)/g;
  for (let mm = markRe.exec(spokenText); mm; mm = markRe.exec(spokenText)) {
    // A single newline between authored lines is just a sentence break; only a
    // BLANK line is a change of thought.
    const kind = mm[1] ? "trail"
      : mm[2] ? "comma"
      : mm[3] ? "stop"
      : mm[4] ? (mm[4].length > 1 ? "thought" : "stop")
      : mm[5] ? "dash"
      : mm[6] ? "dash"
      : "colon";
    const prev = marks[marks.length - 1];
    // One boundary, one mark. An authored line ends "." and is followed by a
    // newline, so the same boundary was found TWICE, one character apart. The
    // matcher then spent two marks on one pause and pushed the second onto the
    // NEXT gap, landing a long break where a short one belonged and shifting
    // every pause after it. That is the "weird pause in the wrong place".
    if (prev && mm.index - prev.at <= 2) {
      if (kind === "thought") prev.kind = "thought";
      continue;
    }
    marks.push({ at: mm.index, kind });
  }
  // The final mark is the end of the clip, not a pause inside it.
  while (marks.length && marks[marks.length - 1].at >= spokenText.trimEnd().length - 1) marks.pop();

  const rawSpeech0 = spanLen.reduce((a, b) => a + b, 0);
  const textLen = Math.max(1, spokenText.length);

  /* Where each mark falls in time.
   *
   * Measured from the recording where a transcript is available: every mark is
   * pinned to the END of the word it follows, converted from clip time into
   * speech time so it can be compared with the gaps. Falls back to the old
   * steady-rate estimate per mark, so a clip whose transcript failed, or a
   * word the alignment could not place, still gets shaped rather than skipped.
   */
  const estimate = (m) => (m.at / textLen) * rawSpeech0;
  // clip time -> speech time: the same clock the gaps are measured on
  const toSpeechTime = (t) => {
    let acc = 0;
    for (const s of spans) {
      if (t <= s.from) break;
      acc += Math.min(t, s.to) - s.from;
    }
    return acc;
  };

  let markTime;
  if (heard && heard.length) {
    const scriptWords = [];
    const wre = /[A-Za-z0-9'’$]+/g;
    for (let w = wre.exec(spokenText); w; w = wre.exec(spokenText)) {
      scriptWords.push({ t: w[0], end: w.index + w[0].length });
    }
    const map = alignWords(scriptWords, heard);
    markTime = marks.map((m) => {
      // the last script word that ends at or before this mark
      let k = -1;
      for (let i = 0; i < scriptWords.length; i++) {
        if (scriptWords[i].end <= m.at + 1) k = i; else break;
      }
      const j = k >= 0 ? map[k] : -1;
      return j >= 0 ? toSpeechTime(heard[j].end) : estimate(m);
    });
  } else {
    markTime = marks.map(estimate);
  }

  /* Two marks on one boundary are still one breath.
   *
   * The character-distance dedup above catches "word." immediately followed by
   * a newline, but not a boundary written with more between the marks. A line
   * ending "your street..." followed by one opening "...that goes straight in
   * the vault" puts an ellipsis, a newline and another ellipsis within five
   * characters: too far apart to merge by position, and all three land on the
   * end of the same word.
   *
   * The extra mark then had to go somewhere, and the matcher gave it to the
   * next gap along - the one after "that" - so the child heard a break in the
   * middle of the sentence. Word timings make this easy to see: marks that
   * resolve to the same moment ARE the same boundary, so they collapse to the
   * longest pause among them.
   */
  if (heard && heard.length && marks.length > 1) {
    const rank = { butt: 0, join: 1, comma: 2, dash: 3, colon: 4, trail: 5, stop: 6, thought: 7, reveal: 7 };
    for (let i = marks.length - 1; i > 0; i--) {
      if (Math.abs(markTime[i] - markTime[i - 1]) > 0.05) continue;
      if ((rank[marks[i].kind] ?? 0) > (rank[marks[i - 1].kind] ?? 0)) marks[i - 1].kind = marks[i].kind;
      marks.splice(i, 1);
      markTime.splice(i, 1);
    }
  }

  // Where each detected gap falls, measured in speech time.
  const gapTime = [];
  let acc = 0;
  for (let i = 0; i + 1 < spans.length; i++) { acc += spanLen[i]; gapTime.push(acc); }

  // Marks and gaps are both in reading order, so the match has to be too: a
  // later gap must never claim an earlier mark. The old version picked the
  // nearest free mark for each gap with a 0.9s tolerance, which was loose
  // enough that almost any gap found something to claim. On Sarah that was
  // harmless because she only pauses about 11 times in this passage. On a
  // more deliberate reader it was not: Brittney pauses 22 times, 17 of those
  // claimed a mark, and a third of the clip became silence at 120 wpm.
  /* Align the gaps to the marks properly, rather than nearest-within-a-window.
   *
   * Both are in reading order, so this is a sequence alignment, and solving it
   * as one is far steadier than deciding each gap on its own. The greedy
   * version kept failing at the edges: too tight a window and a real sentence
   * break was collapsed, leaving no pause after a full stop; too loose and
   * ordinary articulation gaps claimed marks and she stopped between words.
   * Worst of all, "Dragon. Taco. Comet." - three one-word sentences whose gaps
   * sit nowhere near where a steady-rate estimate puts them - lost all three
   * and ran together into one word.
   *
   * The position estimate is only a hint here, not a gate. Cost is distance
   * when a gap takes a mark, a flat penalty when a gap is left as a join, and
   * a flat penalty when a mark goes unspoken because she simply did not pause
   * there. The cheapest arrangement over the WHOLE clip wins.
   */
  /* Leaving a gap alone has to be CHEAP, and a wild match impossible.
   *
   * Owner: "when it says 'and the easiest', there's a pause after 'the'."
   * There is no punctuation after "the", so that gap should have been left
   * alone - but skipping it cost 0.9 while matching it to a mark half a second
   * away cost only 0.5, so the solver bought the mark. Every ordinary breath
   * between words could be dragged onto a full stop that way.
   *
   * So: skipping is cheap, and a match further than MAX_MATCH from where the
   * mark is expected is not allowed at all, however tempting the arithmetic.
   */
  const SKIP_GAP = 0.35;   // leaving a detected gap unpaused, as most should be
  const SKIP_MARK = 0.7;   // a mark the reader ran straight through
  const MAX_MATCH = 1.1;   // seconds; beyond this a gap cannot be that mark
  const G = rawGaps.length, M = marks.length;
  const cost = Array.from({ length: G + 1 }, () => new Float64Array(M + 1).fill(Infinity));
  const back = Array.from({ length: G + 1 }, () => new Int8Array(M + 1));
  cost[0][0] = 0;
  for (let i = 0; i <= G; i++) {
    for (let j = 0; j <= M; j++) {
      const c = cost[i][j];
      if (!Number.isFinite(c)) continue;
      if (i < G && c + SKIP_GAP < cost[i + 1][j]) { cost[i + 1][j] = c + SKIP_GAP; back[i + 1][j] = 1; }
      if (j < M && c + SKIP_MARK < cost[i][j + 1]) { cost[i][j + 1] = c + SKIP_MARK; back[i][j + 1] = 2; }
      if (i < G && j < M) {
        const away = Math.abs(markTime[j] - gapTime[i]);
        /* A mark sits at the END of a word, so its pause can only be a silence
         * that starts there. A silence starting EARLIER is inside the word -
         * the closure on a p, t or k - and can never be that mark however near
         * it falls.
         *
         * Without this, a mark whose own pause the reader ran straight through
         * is handed to the next reachable gap instead. On week 2 the comma in
         * "Oh no, look what happened!" got no silence of its own, so it landed
         * on the double-p inside "happened" and the child heard "ha... ppened".
         * The wide window only became safe to tighten once mark times were
         * measured from the recording rather than estimated, so the two
         * clocks genuinely agree.
         */
        const inWord = heard && heard.length && gapTime[i] < markTime[j] - 0.10;
        if (away <= MAX_MATCH && !inWord) {
          const d = c + away;
          if (d < cost[i + 1][j + 1]) { cost[i + 1][j + 1] = d; back[i + 1][j + 1] = 3; }
        }
      }
    }
  }
  const kinds = new Array(G).fill(null);
  for (let i = G, j = M; i > 0 || j > 0; ) {
    const b = back[i][j];
    if (b === 3) { kinds[i - 1] = marks[j - 1].kind; i--; j--; }
    else if (b === 1) i--;
    else if (b === 2) j--;
    else break;
  }

  /* Only CUT the audio where a pause is actually going.
   *
   * Everywhere else, the two spans and the silence between them are left as
   * one continuous piece of the original recording.
   *
   * This used to split at every silence the detector found - dozens per clip,
   * since ordinary speech is full of 80ms closures on p, t and k - and splice
   * the pieces back together with 0.05s of DIGITAL silence. Natural speech has
   * room tone and sounds running into one another, not pure silence, so each
   * of those splices was a tiny hard edge. Dozens of them per clip is exactly
   * what "she is stopping in between words" describes, and no amount of
   * retuning the pause lengths could fix it, because the damage was in the
   * cutting rather than in the gaps.
   *
   * Merging here means an untouched clip passes through as one piece.
   */
  /* An unmatched gap is left alone only while it is SHORT.
   *
   * Owner, once the splicing was fixed: "'Long, strong, and easy to remember'
   * - after 'and' there was a break", and "there was a break after 'snap' as
   * well". There is no punctuation at either, so neither break was mine: they
   * are the model's own hesitations, which the old version collapsed to 0.05s
   * and which now survived at full length. One artificial fault traded for a
   * natural one.
   *
   * So a gap the punctuation never asked for is shortened rather than kept -
   * by trimming the MIDDLE out of it and butting the two halves together,
   * keeping a little of the real ambience on each side. The words still run on
   * through genuine room tone, which is what stopped the clicking, and the
   * hesitation goes.
   */
  const NATURAL_KEEP = 0.16;   // below this, inaudible as a pause: leave it
  const ROOM = 0.05;           // real ambience kept either side of a trim
  for (let i = kinds.length - 1; i >= 0; i--) {
    if (kinds[i] !== null) continue;
    const g = sil[i];
    if (g && g.end - g.start > NATURAL_KEEP) {
      spans[i] = { from: spans[i].from, to: Math.min(g.start + ROOM, g.end) };
      spans[i + 1] = { from: Math.max(g.end - ROOM, g.start), to: spans[i + 1].to };
      kinds[i] = "butt";       // no silence inserted; the two halves meet
      spanLen[i] = spans[i].to - spans[i].from;
      spanLen[i + 1] = spans[i + 1].to - spans[i + 1].from;
      continue;
    }
    spans[i] = { from: spans[i].from, to: spans[i + 1].to };
    spans.splice(i + 1, 1);
    kinds.splice(i, 1);
    spanLen.splice(i, 2, spans[i].to - spans[i].from);
  }
  if (!spans.length) return false;

  // The reveal: the one long beat, placed before the important word. Still
  // placed here because the model will not do it reliably, but only on a
  // passage with room for it, and only on a gap the text actually asked for.
  const roomForReveal = words >= 14 && kinds.filter(Boolean).length >= 3;
  if (roomForReveal) {
    const staccato = kinds.findIndex((k, i) => k === "stop" && spanLen[i] < 1.1 && spanLen[i + 1] < 1.1);
    const at = staccato > 0 && kinds[staccato - 1] ? staccato - 1 : kinds.findIndex((k) => k === "thought");
    if (at >= 0) kinds[at] = "reveal";
  }

  // rawSpeech0 is the speech measured BEFORE the spans were merged, so it
  // excludes the natural gaps that now sit inside them. Using the merged total
  // would stretch those gaps as well as the words, and the words themselves
  // would come out faster than asked for: targeting 165 wpm that way produced
  // 179, which is still the rate the owner called racing.
  const rawSpeech = rawSpeech0;
  const targetSpeech = (words / TARGET_ARTICULATION) * 60;
  let tempo = rawSpeech / Math.max(0.3, targetSpeech);
  if (!Number.isFinite(tempo)) return false;
  // A tight clamp on purpose. Stretching one clip hard to hit a number is
  // itself audible, and a clip that needs more than this is better left
  // slightly off than obviously processed.
  // The floor was 0.88 and it was binding: asking for 180 wpm produced a mean
  // of 188, because the model generates faster than that and the clamp would
  // not let the slower clips reach the target. Every clip that hits the clamp
  // lands wherever it lands, which is what widens the spread. 0.80 is still
  // well inside what atempo handles cleanly.
  tempo = Math.min(1.15, Math.max(0.80, tempo));

  /* A floor on the overall pace.
   *
   * Articulation is held constant, but a voice that pauses at many more
   * points accumulates far more silence, and the clip drags however fast the
   * words are. Brittney came out at 120 wpm overall, slower than the 127 the
   * owner had already called too slow, purely on pause count. So if the
   * planned silence would drop the clip below the floor, every gap is scaled
   * back together, which keeps their relative shape intact.
   */
  const plannedSpeech = rawSpeech / tempo;
  let gapScale = 1;
  {
    const gapTotal = kinds.reduce((t, k) => t + SPEC_GAP[k || "join"], 0) + SPEC_TAIL;
    const floorTotal = (words / MIN_OVERALL_WPM) * 60;
    if (plannedSpeech + gapTotal > floorTotal && gapTotal > 0.2) {
      gapScale = Math.max(0.45, (floorTotal - plannedSpeech) / gapTotal);
    }
  }

  const parts = [];
  const filters = [];
  spans.forEach((sp, i) => {
    filters.push(
      `[0:a]atrim=${sp.from.toFixed(3)}:${sp.to.toFixed(3)},asetpts=PTS-STARTPTS,atempo=${tempo.toFixed(4)}[s${i}]`,
    );
    parts.push(`[s${i}]`);
    if (i < spans.length - 1) {
      // No kind means the punctuation never asked for a pause here, so the two
      // spans are joined rather than separated.
      const secs = SPEC_GAP[kinds[i] || "join"] * gapScale;
      filters.push(`anullsrc=r=44100:cl=mono,atrim=0:${secs.toFixed(3)}[g${i}]`);
      parts.push(`[g${i}]`);
    }
  });
  filters.push(`anullsrc=r=44100:cl=mono,atrim=0:${SPEC_TAIL.toFixed(3)}[tail]`);
  parts.push("[tail]");
  filters.push(`${parts.join("")}concat=n=${parts.length}:v=0:a=1[out]`);

  const tmp = `${file}.spec.mp3`;
  const r = runFfmpeg([
    "-hide_banner", "-y", "-i", file,
    "-filter_complex", filters.join(";"),
    "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
    tmp,
  ]);
  if (r.status !== 0) return false;

  // Bring the clip to the shared loudness target.
  //
  // A plain gain change cannot do this: Brittney reads at -18.9 dB mean with
  // peaks already at -1.4, so lifting her to Sarah's -15.7 would clip. EBU
  // R128 normalisation manages the dynamics instead. Measured, I=-14 lands
  // this voice at -15.4 dB mean / -1.6 peak against Sarah's -15.7 / -1.0, so
  // any narrator arrives at the same place.
  const leveled = tmp + '.lvl.mp3';
  const g = runFfmpeg([
    '-hide_banner', '-y', '-i', tmp,
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', leveled,
  ]);
  if (g.status === 0) { try { renameSync(leveled, tmp); } catch { /* keep the unleveled clip */ } }
  try {
    renameSync(tmp, file);
  } catch {
    return false;
  }
  return true;
}

// Tracks which model the API actually accepted on the first call so
// we don't re-attempt v3 for every block once we know it's unavailable.
let acceptedModel = null;

async function generateBlock(speaker, lines, source, skipRecord) {
  const voice = voiceFor(speaker, source);
  const blockText = joinBlock(lines);
  const key = hashKey(speaker, voice.id, blockText);
  const filename = `${key}.mp3`;
  const filepath = join(OUT_DIR, filename);

  // A file named by this exact hash IS this block's recording, so it counts as
  // cached even when an interrupted run never wrote its manifest entry.
  if (await fileExists(filepath)) {
    return { key, filename, cached: true, speaker, blockText, lines };
  }

  // --check reports the gap rather than buying a recording for it.
  if (CHECK_ONLY) {
    return { key, filename, missing: true, speaker, blockText, lines };
  }

  // --week=N: another week's block, already handled above if its clip exists.
  // Reaching here means it has none, so report it rather than record it - the
  // point of the flag is to touch one week's audio and nothing else.
  if (skipRecord) {
    return { key, filename, missing: true, speaker, blockText, lines };
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=${OUTPUT_FORMAT}`;

  // Determine which models to try this call. If we've already pinned
  // an accepted model, only try that one. Otherwise walk the priority
  // list and stop at the first success.
  const modelsToTry = acceptedModel ? [acceptedModel] : MODELS_IN_PRIORITY_ORDER;

  let lastError = null;
  for (const modelId of modelsToTry) {
    const body = {
      text: speakBlock(lines),
      model_id: modelId,
      voice_settings: VOICE_SETTINGS,
    };
    const init = {
      method: "POST",
      headers: {
        "xi-api-key": KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    };
    const resp = await fetchWithRetry(url, init);

    if (resp.ok) {
      if (!acceptedModel) {
        acceptedModel = modelId;
        if (modelId !== MODELS_IN_PRIORITY_ORDER[0]) {
          console.log(
            `  (note: ${MODELS_IN_PRIORITY_ORDER[0]} unavailable on this plan; using ${modelId})`,
          );
        } else {
          console.log(`  (using ${modelId})`);
        }
      }
      const rawPath = `${filepath}.raw.mp3`;
      let bestBuf = Buffer.from(await resp.arrayBuffer());
      await writeFile(rawPath, bestBuf);
      let bestDb = endingLoudnessDb(rawPath);
      for (let retake = 1; bestDb > CUT_OFF_DB && retake <= MAX_CUT_RETAKES; retake++) {
        const again = await fetchWithRetry(url, init);
        if (!again.ok) break;
        const b2 = Buffer.from(await again.arrayBuffer());
        await writeFile(rawPath, b2);
        const d2 = endingLoudnessDb(rawPath);
        process.stdout.write(`(cut off at ${bestDb.toFixed(0)}dB, retake ${retake}: ${d2.toFixed(0)}dB) `);
        if (d2 < bestDb) {
          bestDb = d2;
          bestBuf = b2;
        }
      }
      if (bestDb > CUT_OFF_DB) {
        process.stdout.write(`(WARNING: still cut off after ${MAX_CUT_RETAKES} retakes) `);
      }
      await writeFile(rawPath, bestBuf);
      if (!padEnding(rawPath, filepath)) await writeFile(filepath, bestBuf);
      await unlink(rawPath).catch(() => {});
      // Re-cut the silences to the delivery spec. Leaves the clip exactly as
      // recorded if it cannot do that safely, so a failure here never costs a
      // recording we have already paid for.
      shapeToSpec(filepath, lines, await transcribeWords(filepath));
      const buf = await readFile(filepath);
      return {
        key,
        filename,
        cached: false,
        speaker,
        blockText,
        lines,
        bytes: buf.byteLength,
        modelUsed: modelId,
      };
    }

    // Non-ok response - capture and try next model if we haven't
    // pinned yet. Common reasons for v3 rejection on a given plan
    // include 422 (invalid model) or 403 (not entitled).
    const errText = await resp.text();
    lastError = `${resp.status} ${errText.slice(0, 200)}`;
    if (acceptedModel) {
      // We've pinned a model and it just failed - real error, bail.
      break;
    }
    // Else continue to next model in the priority list.
  }

  throw new Error(`TTS failed for all models. Last error: ${lastError}`);
}

const entries = [];
const unrecorded = [];
let generated = 0;
let cachedCount = 0;
let totalBytes = 0;

for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];
  const previewText = joinBlock(block.lines).slice(0, 80);
  if (!CHECK_ONLY) {
    process.stdout.write(
      `${(i + 1).toString().padStart(2)}/${blocks.length} ${block.speaker.padEnd(6)} (${block.lines.length} lines) "${previewText}${previewText.length === 80 ? "…" : ""}" … `,
    );
  }
  try {
    const r = await generateBlock(block.speaker, block.lines, block.source, block.skipRecord);
    if (r.missing) {
      unrecorded.push({ speaker: r.speaker, file: r.filename, text: r.blockText, source: block.source });
      continue;
    }
    entries.push({
      key: r.key,
      speaker: r.speaker,
      // The voice that actually read it, not the speaker default. Week 1 is
      // narrated by the kids educator while the rest of the course is still
      // Sarah; taking the name from the default map labelled every week 1
      // entry "Sarah" even though someone else had recorded them. The audio
      // was always right, because the voice id is part of the hash and the
      // filenames changed accordingly - but this file is what a migration
      // reads to decide which clips still need re-recording, so a wrong label
      // would have it skip a week or do one twice.
      voice: voiceFor(r.speaker, block.source).name,
      text: r.blockText,
      lines: r.lines,
      file: `/audio/voice/${r.filename}`,
    });
    if (r.cached) {
      cachedCount++;
      if (!CHECK_ONLY) console.log("cached");
    } else {
      generated++;
      totalBytes += r.bytes;
      console.log(`${r.bytes} bytes`);
    }
  } catch (e) {
    console.log("FAILED");
    console.error(`  ${e.message}`);
    // Keep everything recorded so far: merge finished entries into the old
    // manifest before exiting, so a re-run resumes rather than starting over.
    const merged = new Map(manifest.entries.map((x) => [x.key, x]));
    for (const x of entries) merged.set(x.key, x);
    await writeFile(MANIFEST_PATH, JSON.stringify({ ...manifest, entries: [...merged.values()] }, null, 2));
    console.error(`  Saved ${entries.length} finished block(s) to the manifest before exiting.`);
    process.exit(3);
  }
}

// --check never writes: `entries` is incomplete by design, because an
// unrecorded block has no entry to add.
if (CHECK_ONLY) {
  if (!QUIET) {
    for (const u of unrecorded) {
      console.log(`SILENT  ${u.speaker.padEnd(6)} ${u.source ?? "?"}`);
      console.log(`        wants ${u.file}`);
      console.log(`        "${u.text.slice(0, 150)}${u.text.length > 150 ? "…" : ""}"`);
    }
  }
  console.log(
    `\n${blocks.length} block(s) scanned, ${cachedCount} recorded, ${unrecorded.length} SILENT`,
  );
  if (unrecorded.length) {
    console.log("Run without --check to record them.");
    process.exit(1);
  }
  process.exit(0);
}

const newManifest = {
  generatedAt: new Date().toISOString(),
  model: acceptedModel ?? MODELS_IN_PRIORITY_ORDER[0],
  voiceSettings: VOICE_SETTINGS,
  voices: VOICE,
  chunkStrategy: "block",
  entries,
};
await writeFile(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));

console.log(
  `\nDone. ${generated} generated, ${cachedCount} cached, ${(totalBytes / 1024).toFixed(0)} KB written this run.`,
);
console.log(`Manifest: ${MANIFEST_PATH}`);

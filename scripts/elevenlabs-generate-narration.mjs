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

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
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
const VOICE_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.7,
  style: 0.7,
  use_speaker_boost: true,
  speed: 0.85,
};

// Model priority: try eleven_v3 first (newest, most natural per
// ElevenLabs' own guidance for "doesn't sound AI"). If the plan
// rejects it, fall back to eleven_multilingual_v2 (the proven
// premium model that worked in v1-v6).
const MODELS_IN_PRIORITY_ORDER = ["eleven_v3", "eleven_multilingual_v2"];
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
// instruction (Sarah must not read the gapped sentence, which came out as
// "...proves it's blank"); one recording, reused by every week's finish
// quick-check. speaker "adam" = Sarah, matching QuickCheck's promptLines.
blocks.push({ speaker: "adam", lines: ["Can you fill in the missing word?"], source: "shared" });
// SignBingo vault skin: the per-move prompt Sarah reads after each scene (W1 Vault Door bingo).
blocks.push({ speaker: "adam", lines: ["Which power did that move use? Tap its dial."], source: "shared" });
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
  if (fname === "week1.ts") {
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
  const LEARN_LOOP_WEEKS = new Set(["week1.ts", "week2.ts", "week3.ts", "week4.ts", "week5.ts", "week6.ts", "week7.ts", "week15.ts"]);
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
        lines.push(lead, text);
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
  if (["week2.ts", "week3.ts", "week4.ts", "week5.ts", "week6.ts", "week7.ts"].includes(fname)) {
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
  const recordedReasons = new Set(blocks.filter((b) => b.lines.length === 1).map((b) => joinBlock(b.lines)));
  let oneTakes = 0;
  for (const { verdict, why } of verdictPairs) {
    if (!recordedReasons.has(joinBlock([why]))) continue;
    blocks.push({ speaker: "adam", lines: [LEADS[verdict], why], source: "verdict-one-take" });
    oneTakes++;
  }
  console.log(`  one-take verdicts: ${oneTakes} block(s) (of ${verdictPairs.length} audited pairs, all weeks)`);
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
const CUT_OFF_DB = -45; // mean volume of the last 60ms above this = cut off
const MAX_CUT_RETAKES = 4;
const END_PAD_SEC = 0.3;
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
function endingLoudnessDb(file) {
  const r = runFfmpeg(["-hide_banner", "-sseof", "-0.06", "-i", file, "-af", "volumedetect", "-f", "null", "-"]);
  const m = (r.stderr || "").match(/mean_volume: (-?[0-9.]+) dB/);
  return m ? Number(m[1]) : -99;
}
function padEnding(inFile, outFile) {
  const r = runFfmpeg([
    "-hide_banner", "-y", "-i", inFile,
    // A 120ms silent lead-in as well as the 0.3s tail: a clip that opens at full
    // volume loses its first consonant when playback starts (UAT round 2, W2 1a-1d).
    "-af", `adelay=${START_PAD_MS}:all=1,apad=pad_dur=${END_PAD_SEC}`,
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

// Tracks which model the API actually accepted on the first call so
// we don't re-attempt v3 for every block once we know it's unavailable.
let acceptedModel = null;

async function generateBlock(speaker, lines) {
  const voice = VOICE[speaker];
  const blockText = joinBlock(lines);
  const key = hashKey(speaker, voice.id, blockText);
  const filename = `${key}.mp3`;
  const filepath = join(OUT_DIR, filename);

  // A file named by this exact hash IS this block's recording, so it counts as
  // cached even when an interrupted run never wrote its manifest entry.
  if (await fileExists(filepath)) {
    return { key, filename, cached: true, speaker, blockText, lines };
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=${OUTPUT_FORMAT}`;

  // Determine which models to try this call. If we've already pinned
  // an accepted model, only try that one. Otherwise walk the priority
  // list and stop at the first success.
  const modelsToTry = acceptedModel ? [acceptedModel] : MODELS_IN_PRIORITY_ORDER;

  let lastError = null;
  for (const modelId of modelsToTry) {
    const body = {
      text: blockText,
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
let generated = 0;
let cachedCount = 0;
let totalBytes = 0;

for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];
  const previewText = joinBlock(block.lines).slice(0, 80);
  process.stdout.write(
    `${(i + 1).toString().padStart(2)}/${blocks.length} ${block.speaker.padEnd(6)} (${block.lines.length} lines) "${previewText}${previewText.length === 80 ? "…" : ""}" … `,
  );
  try {
    const r = await generateBlock(block.speaker, block.lines);
    entries.push({
      key: r.key,
      speaker: r.speaker,
      voice: VOICE[r.speaker].name,
      text: r.blockText,
      lines: r.lines,
      file: `/audio/voice/${r.filename}`,
    });
    if (r.cached) {
      cachedCount++;
      console.log("cached");
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

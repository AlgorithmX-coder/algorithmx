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
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
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
blocks.push({ speaker: "adam", lines: ["Which power did that move use? Turn its dial."], source: "shared" });

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
  // TEMP scope: only weeks 1 and 15 have trimmed, finalized bosses (7 Q /
  // pass 5). The other weeks still have 15 un-rewritten questions, so skip
  // recording their long read-outs until the learn-loop rollout trims them.
  // Add each week's filename here as it is finalized; drop the guard at the end.
  let ba, bossQ = 0;
  while ((fname === "week1.ts" || fname === "week2.ts" || fname === "week15.ts") && (ba = bossAskRe.exec(src)) !== null) {
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
  if ((fname === "week1.ts" || fname === "week2.ts" || fname === "week15.ts")) {
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
  // Wrong-answer teaching (owner 2026-09-09): Sarah reads the WrongAnswerPanel
  // explanation aloud on any wrong pick. The panel's `explanation` prop is a
  // verbatim content field — `explanation` (ClueBoard/ConveyorSort/quickCheck)
  // or `note` (SenderLineup/TrailStamper) — so record each non-empty one as a
  // single-line block, matching InfoNarration({ lines: [explanation] }). Same
  // week-15-only scope; dedupes, and over-recording a few strings that aren't
  // shown in the panel is harmless.
  if ((fname === "week1.ts" || fname === "week2.ts" || fname === "week15.ts")) {
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
  if (fname === "week2.ts") {
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

  const cached = existing.get(key);
  if (cached && (await fileExists(filepath))) {
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
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });

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
      const buf = Buffer.from(await resp.arrayBuffer());
      await writeFile(filepath, buf);
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

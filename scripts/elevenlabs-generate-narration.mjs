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

const blockRe = /narration:\s*\{\s*speaker:\s*"(adam|layla)",\s*lines:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
const blocks = [];

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

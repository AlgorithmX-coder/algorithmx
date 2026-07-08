// Generate voiced micro-interjection MP3s (Will saying "Nice work!",
// "Try again!", etc.) that play on top of the existing SFX chimes.
//
// Read VOICE_INTERJECTIONS from app/lib/voice-interjections.ts as the
// single source of truth. Idempotent + caching: re-runs only generate
// lines that are new or changed.
//
//   node --env-file=.env.local scripts/elevenlabs-generate-interjections.mjs
//
// Writes files to public/audio/voice/interjections/{hash}.mp3 and a
// manifest at public/audio/voice/interjections/manifest.json that
// useGameAudio loads at runtime.

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

// The ONE product narrator — Sarah, the same voice as all lesson
// narration (narrator spec quality #1: one consistent character
// everywhere; the earlier Will set split the mentor into two voices).
// Settings = the LOCKED v13-sarah-child storyteller formula that won
// the A/B; the lines carry eleven_v3 emotion tags as delivery.
const VOICE = { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" };
const VOICE_SETTINGS = {
  stability: 0.25,
  similarity_boost: 0.7,
  style: 0.55,
  use_speaker_boost: true,
  speed: 1.0,
};
const MODELS_IN_PRIORITY_ORDER = ["eleven_v3", "eleven_multilingual_v2"];
const OUTPUT_FORMAT = "mp3_44100_128";
const GENERATION_VERSION = "v2-sarah-child";

const OUT_DIR = join("public", "audio", "voice", "interjections");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
await mkdir(OUT_DIR, { recursive: true });

// Parse VOICE_INTERJECTIONS out of the TS source. Same regex trick as
// the narration generator - no transpiler needed at run time.
const src = await readFile("app/lib/voice-interjections.ts", "utf8");
const objRe = /VOICE_INTERJECTIONS\s*:\s*Record<[^>]+>\s*=\s*\{([\s\S]*?)\n\};/;
const objMatch = objRe.exec(src);
if (!objMatch) {
  console.error("Could not parse VOICE_INTERJECTIONS from voice-interjections.ts");
  process.exit(2);
}
const body = objMatch[1];

// Each trigger is `triggerName: [ "...", "..." ]` — pull each block.
// The block ends at a `],` on its own line; lines themselves may
// contain `]` (eleven_v3 emotion tags like "[warmly] Nice work!").
const triggerRe = /(\w+)\s*:\s*\[([\s\S]*?)\n\s*\],/g;
const triggers = {};
let tm;
while ((tm = triggerRe.exec(body)) !== null) {
  const trigger = tm[1];
  const lines = [];
  const stringRe = /"((?:[^"\\]|\\.)*)"/g;
  let s;
  while ((s = stringRe.exec(tm[2])) !== null) {
    const text = s[1].replace(/\\"/g, '"').trim();
    if (text) lines.push(text);
  }
  if (lines.length > 0) triggers[trigger] = lines;
}

const totalLines = Object.values(triggers).reduce((n, arr) => n + arr.length, 0);
const totalChars = Object.values(triggers).flat().reduce((n, s) => n + s.length, 0);
console.log(`Parsed ${Object.keys(triggers).length} triggers, ${totalLines} lines, ${totalChars} chars`);

let manifest = { triggers: {} };
try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
} catch {
  /* first run */
}
const existing = new Map();
for (const arr of Object.values(manifest.triggers ?? {})) {
  for (const e of arr) existing.set(e.key, e);
}

function hashKey(text) {
  return createHash("sha1")
    .update(`${GENERATION_VERSION}::${VOICE.id}::${text}`)
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

let acceptedModel = null;

async function generateLine(text) {
  const key = hashKey(text);
  const filename = `${key}.mp3`;
  const filepath = join(OUT_DIR, filename);

  const cached = existing.get(key);
  if (cached && (await fileExists(filepath))) {
    return { key, filename, cached: true, text };
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE.id}?output_format=${OUTPUT_FORMAT}`;
  const modelsToTry = acceptedModel ? [acceptedModel] : MODELS_IN_PRIORITY_ORDER;

  let lastError = null;
  for (const modelId of modelsToTry) {
    const body = {
      text,
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
      if (!acceptedModel) acceptedModel = modelId;
      const buf = Buffer.from(await resp.arrayBuffer());
      await writeFile(filepath, buf);
      return { key, filename, cached: false, text, bytes: buf.byteLength };
    }
    lastError = `${resp.status} ${(await resp.text()).slice(0, 200)}`;
    if (acceptedModel) break;
  }
  throw new Error(`TTS failed: ${lastError}`);
}

const newTriggers = {};
let generated = 0;
let cachedCount = 0;
let totalBytes = 0;

for (const [trigger, lines] of Object.entries(triggers)) {
  newTriggers[trigger] = [];
  for (const line of lines) {
    process.stdout.write(`${trigger.padEnd(12)} "${line}" … `);
    try {
      const r = await generateLine(line);
      newTriggers[trigger].push({
        key: r.key,
        text: r.text,
        file: `/audio/voice/interjections/${r.filename}`,
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
}

const newManifest = {
  generatedAt: new Date().toISOString(),
  model: acceptedModel ?? MODELS_IN_PRIORITY_ORDER[0],
  voice: VOICE,
  voiceSettings: VOICE_SETTINGS,
  triggers: newTriggers,
};
await writeFile(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));

console.log(
  `\nDone. ${generated} generated, ${cachedCount} cached, ${(totalBytes / 1024).toFixed(0)} KB written.`,
);
console.log(`Manifest: ${MANIFEST_PATH}`);

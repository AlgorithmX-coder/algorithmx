// Generate signature SFX via ElevenLabs Sound Effects API.
//
// Source-of-truth: app/lib/sfx-signature.ts (SIGNATURE_SFX array).
// Idempotent + cached: hash key = (GENERATION_VERSION, id, prompt,
// duration). Tweak a prompt, re-run, only that one cue regenerates.
//
//   node --env-file=.env.local scripts/elevenlabs-generate-sfx.mjs
//
// Writes files to public/audio/sfx-signature/{id}.mp3 and a manifest
// at public/audio/sfx-signature/manifest.json. The runtime
// useGameAudio facade loads the manifest and exposes
// audio.signature("id") to play any cue.

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const OUTPUT_FORMAT = "mp3_44100_128";
const GENERATION_VERSION = "v1-signature-sfx";
const ENDPOINT = "https://api.elevenlabs.io/v1/sound-generation";

const OUT_DIR = join("public", "audio", "sfx-signature");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
await mkdir(OUT_DIR, { recursive: true });

// Parse SIGNATURE_SFX from the TS file (same regex strategy as the
// other generators - no transpiler needed).
const src = await readFile("app/lib/sfx-signature.ts", "utf8");
const arrRe = /SIGNATURE_SFX\s*:\s*readonly SignatureSfx\[\]\s*=\s*\[([\s\S]*?)\n\];/;
const arrMatch = arrRe.exec(src);
if (!arrMatch) {
  console.error("Could not parse SIGNATURE_SFX array from sfx-signature.ts");
  process.exit(2);
}

// Each entry block: { id: "...", prompt: "...", durationSeconds: x.x?,
//                     promptInfluence: x.x?, description: "..." }
const cues = [];
const entryRe = /\{\s*([\s\S]*?)\s*\}/g;
let em;
while ((em = entryRe.exec(arrMatch[1])) !== null) {
  const blob = em[1];
  const getStr = (k) => {
    const r = new RegExp(`${k}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(blob);
    return r ? r[1].replace(/\\"/g, '"') : null;
  };
  const getNum = (k) => {
    const r = new RegExp(`${k}\\s*:\\s*(\\d+(?:\\.\\d+)?)`).exec(blob);
    return r ? Number(r[1]) : null;
  };
  const id = getStr("id");
  const prompt = getStr("prompt");
  const description = getStr("description") ?? "";
  if (!id || !prompt) continue;
  cues.push({
    id,
    prompt,
    durationSeconds: getNum("durationSeconds"),
    promptInfluence: getNum("promptInfluence"),
    description,
  });
}

console.log(`Parsed ${cues.length} signature SFX cue(s)`);

let manifest = { entries: [] };
try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
} catch {
  /* first run */
}
const existing = new Map(manifest.entries.map((e) => [e.id, e]));

function hashKey(id, prompt, duration) {
  return createHash("sha1")
    .update(`${GENERATION_VERSION}::${id}::${prompt}::${duration ?? "auto"}`)
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

async function generateCue(cue) {
  const key = hashKey(cue.id, cue.prompt, cue.durationSeconds);
  // We name the file by the cue id (not the hash) so it's easy to
  // identify in the public folder. Cache invalidation is driven by
  // the manifest's stored hash, not the filename.
  const filename = `${cue.id}.mp3`;
  const filepath = join(OUT_DIR, filename);

  const cached = existing.get(cue.id);
  if (cached && cached.key === key && (await fileExists(filepath))) {
    return { ...cue, key, filename, cached: true };
  }

  const url = `${ENDPOINT}?output_format=${OUTPUT_FORMAT}`;
  const body = {
    text: cue.prompt,
    ...(cue.durationSeconds != null ? { duration_seconds: cue.durationSeconds } : {}),
    ...(cue.promptInfluence != null ? { prompt_influence: cue.promptInfluence } : {}),
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

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`${resp.status} ${errText.slice(0, 250)}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  await writeFile(filepath, buf);
  return { ...cue, key, filename, cached: false, bytes: buf.byteLength };
}

const entries = [];
let generated = 0;
let cachedCount = 0;
let totalBytes = 0;

for (const cue of cues) {
  process.stdout.write(`${cue.id.padEnd(18)} (${cue.durationSeconds ?? "auto"}s) … `);
  try {
    const r = await generateCue(cue);
    entries.push({
      id: r.id,
      key: r.key,
      file: `/audio/sfx-signature/${r.filename}`,
      prompt: r.prompt,
      durationSeconds: r.durationSeconds,
      description: r.description,
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
  endpoint: ENDPOINT,
  outputFormat: OUTPUT_FORMAT,
  entries,
};
await writeFile(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));

console.log(
  `\nDone. ${generated} generated, ${cachedCount} cached, ${(totalBytes / 1024).toFixed(0)} KB written.`,
);
console.log(`Manifest: ${MANIFEST_PATH}`);

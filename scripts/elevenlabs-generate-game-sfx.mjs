// Generate game-interaction SFX via ElevenLabs Sound Effects API into the
// Howler registry folder (public/audio/sfx/) so they're preloaded + low
// latency + polyphonic, like the other game SFX. Register the new keys in
// SFX_REGISTRY (app/lib/sounds.ts) and play via playSound(key) / audio.*.
//
//   node --env-file=.env.local scripts/elevenlabs-generate-game-sfx.mjs
//
// Idempotent via a sidecar hash file (.game-sfx-versions.json): tweak a
// prompt, re-run, only that cue regenerates.

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const ENDPOINT = "https://api.elevenlabs.io/v1/sound-generation";
const OUTPUT_FORMAT = "mp3_44100_128";
const VERSION = "v1-game-sfx";
const OUT_DIR = join("public", "audio", "sfx");
const HASH_PATH = join(OUT_DIR, ".game-sfx-versions.json");
await mkdir(OUT_DIR, { recursive: true });

// Short, clean, NO-music interaction sounds. Kept brief so they feel
// tactile and never get in the way of a 6-9 yr old's flow.
const CUES = [
  {
    file: "card-flip.mp3",
    prompt:
      "A single playing card flipping over: a short, soft, crisp paper whoosh with a light snap at the end. Clean and snappy, no music, no background.",
    duration_seconds: 0.7,
    prompt_influence: 0.7,
  },
  {
    file: "drop.mp3",
    prompt:
      "A small wooden tile being placed and settling onto a table: one soft, satisfying 'tock' thunk. Very short and clean, no music.",
    duration_seconds: 0.6,
    prompt_influence: 0.7,
  },
  {
    file: "heal.mp3",
    prompt:
      "A bright, magical fix-it sparkle: a quick cheerful ascending chime with a soft shimmer, like something broken being repaired and glowing. Short, playful, no music.",
    duration_seconds: 0.9,
    prompt_influence: 0.6,
  },
];

let hashes = {};
try {
  hashes = JSON.parse(await readFile(HASH_PATH, "utf8"));
} catch {
  /* first run */
}

function keyFor(cue) {
  return createHash("sha1")
    .update(`${VERSION}::${cue.file}::${cue.prompt}::${cue.duration_seconds}`)
    .digest("hex")
    .slice(0, 16);
}
async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

let generated = 0;
let cached = 0;
for (const cue of CUES) {
  const k = keyFor(cue);
  const fp = join(OUT_DIR, cue.file);
  process.stdout.write(`${cue.file.padEnd(16)} (${cue.duration_seconds}s) … `);
  if (hashes[cue.file] === k && (await exists(fp))) {
    cached++;
    console.log("cached");
    continue;
  }
  const resp = await fetch(`${ENDPOINT}?output_format=${OUTPUT_FORMAT}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: cue.prompt,
      duration_seconds: cue.duration_seconds,
      prompt_influence: cue.prompt_influence,
    }),
  });
  if (!resp.ok) {
    console.log("FAILED");
    console.error(`  ${resp.status} ${(await resp.text()).slice(0, 200)}`);
    process.exit(3);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  await writeFile(fp, buf);
  hashes[cue.file] = k;
  generated++;
  console.log(`${buf.byteLength} bytes`);
}

await writeFile(HASH_PATH, JSON.stringify(hashes, null, 2));
console.log(`\nDone. ${generated} generated, ${cached} cached. -> ${OUT_DIR}`);
console.log("Now register card-flip/drop/heal in SFX_REGISTRY (app/lib/sounds.ts).");

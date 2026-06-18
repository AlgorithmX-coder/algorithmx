// Generate the Hacker Raccoon's BOSS voice (Callum) via ElevenLabs TTS.
// Cheeky comedic-menace, never cruel - a villain a 6-9 yr old loves to beat.
// Files land at public/audio/villain/{slug}.mp3 with deterministic names so
// BossBattle can play them directly (no manifest needed):
//   intro, taunt-1..taunt-6 (order matches BOSS_TAUNTS), defeat.
//
//   node --env-file=.env.local scripts/elevenlabs-generate-villain.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const CALLUM = "N2lVS1w4EtoT3dr4eOWO"; // "Husky Trickster" - the Hacker Raccoon
const SETTINGS = {
  stability: 0.25, // expressive/performed
  similarity_boost: 0.75,
  style: 0.6, // characterful, theatrical
  use_speaker_boost: true,
  speed: 1.0,
};
const MODEL = "eleven_v3";

// slug order for taunt-N MUST match BOSS_TAUNTS in BossBattle.tsx.
const LINES = [
  { slug: "intro", tts: "[laughs] Well, well, well... you think YOU can beat me? I'm the Hacker Raccoon!" },
  { slug: "taunt-1", tts: "[laughs] Too easy!" },
  { slug: "taunt-2", tts: "You'll never crack me!" },
  { slug: "taunt-3", tts: "Nice try, kiddo!" },
  { slug: "taunt-4", tts: "Is that all you've got?" },
  { slug: "taunt-5", tts: "[laughs] I'm the sneakiest around!" },
  { slug: "taunt-6", tts: "Catch me if you can!" },
  { slug: "defeat", tts: "Nooo! You beat me?! You're too good... I'll be back!" },
];

const OUT_DIR = join("public", "audio", "villain");
await mkdir(OUT_DIR, { recursive: true });

let generated = 0;
let totalBytes = 0;
for (const line of LINES) {
  process.stdout.write(`${line.slug.padEnd(10)} "${line.tts.slice(0, 40)}" … `);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${CALLUM}?output_format=mp3_44100_128`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: line.tts, model_id: MODEL, voice_settings: SETTINGS }),
  });
  if (!resp.ok) {
    console.log("FAILED");
    console.error(`  ${resp.status} ${(await resp.text()).slice(0, 200)}`);
    process.exit(3);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  await writeFile(join(OUT_DIR, `${line.slug}.mp3`), buf);
  generated++;
  totalBytes += buf.byteLength;
  console.log(`${buf.byteLength} bytes`);
}

console.log(`\nDone. ${generated} villain lines, ${(totalBytes / 1024).toFixed(0)} KB -> ${OUT_DIR}`);

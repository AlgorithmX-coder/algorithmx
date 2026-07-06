// Generate the Week 1 Vault Boss (Cracking Machine) voice + music set.
//
//   node --env-file=.env.local scripts/elevenlabs-generate-vaultboss-audio.mjs
//
// Three groups, all idempotent (skips files that already exist; delete a
// file to regenerate it):
//   1. Coach how-to-play lines (Will - the same single product voice as
//      narration + interjections) -> public/audio/coach/{name}.mp3
//   2. Villain barks (Callum - same voice as the existing villain clips)
//      -> public/audio/villain/{name}.mp3
//   3. Boss battle music (Music API) -> public/audio/sfx/bgm-boss.mp3
//
// Volume/mute policy is enforced at PLAYBACK (bossArena playCoach /
// playVillain caps + isAudioMuted gate + the faint BGM tier in sounds.ts),
// not here.

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const OUTPUT_FORMAT = "mp3_44100_128";
const MODELS_IN_PRIORITY_ORDER = ["eleven_v3", "eleven_multilingual_v2"];

// Single product mentor voice - same id as narration + interjections.
const COACH_VOICE = { id: "bIHbv24MWmeRgasZH58o", name: "Will" };
const COACH_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.85,
  style: 0.0,
  use_speaker_boost: true,
  speed: 1.0,
};

// The Hacker Raccoon - "Callum - Husky Trickster" (premade), the same
// voice the existing villain/ clips were made with.
const VILLAIN_VOICE = { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" };
const VILLAIN_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.85,
  style: 0.35,
  use_speaker_boost: true,
  speed: 1.0,
};

/** Coach lines. One short, spoken instruction per phase — the child never
 *  has to read anything. Hero-mentor coach: empowering, never a lecture. */
const COACH_LINES = {
  "vault-go-wall":
    "Tap the big word blocks! Every word makes your password LONGER - and longer is stronger!",
  "vault-go-scrambler":
    "Tap all four mixers! Capitals, numbers and symbols mix your password up so his decoder can't read it!",
  "vault-go-cover":
    "When the spy eye pops up, press and HOLD the cover - just like covering the keypad with your hand in real life!",
  "vault-go-feed":
    "Tap the easy passwords and feed them to his machine! He only knows the OBVIOUS ones - he can never guess yours!",
  "vault-go-final":
    "Press and HOLD the golden forge button! Charge your password all the way to four hundred years!",
  "vault-victory":
    "You DID it! Four hundred years to crack - the machine gave up and went kaboom! That's the power of a super password!",
};

/** Villain barks. Comedic sore-loser, never frightening. */
const VILLAIN_LINES = {
  "foiled-wall": "My ram! You built it TOO LONG!",
  "foiled-scrambler": "Capitals AND symbols?! My decoder is crying!",
  "foiled-cover": "I saw NOTHING! Not one letter!",
  "foiled-feed": "My Guess-o-Tron is FULL! It only knows the obvious ones!",
  "foiled-final": "FOUR HUNDRED YEARS?! I don't HAVE that long!",
  sweettalk:
    "Beautiful password! Truly. Just whisper it to me once - I'll only use it for NICE things!",
  overload: "No no no! Crack FASTER, you useless bucket of bolts!",
};

const MUSIC = {
  file: join("public", "audio", "sfx", "bgm-boss.mp3"),
  lengthMs: 60000,
  prompt:
    "Playful industrial boss-battle loop for a kids' cyber-hero game: bouncy electro groove at 100 BPM with clanking metal percussion, hissing steam accents, chunky synth bass and a mischievous cartoon-villain melody. Energetic and fun, mildly menacing but never scary, no vocals, seamless loop.",
};

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function tts(voiceId, text, settings) {
  let lastErr = null;
  for (const model of MODELS_IN_PRIORITY_ORDER) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`,
      {
        method: "POST",
        headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_id: model, voice_settings: settings }),
      },
    );
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    lastErr = `${model}: ${res.status} ${await res.text()}`;
  }
  throw new Error(lastErr ?? "tts failed");
}

async function generateGroup(label, dir, lines, voiceId, settings) {
  await mkdir(dir, { recursive: true });
  for (const [name, text] of Object.entries(lines)) {
    const file = join(dir, `${name}.mp3`);
    if (await exists(file)) {
      console.log(`  = ${label}/${name} (exists, skipped)`);
      continue;
    }
    const buf = await tts(voiceId, text, settings);
    await writeFile(file, buf);
    console.log(`  + ${label}/${name} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

console.log("Coach lines (Will)...");
await generateGroup(
  "coach",
  join("public", "audio", "coach"),
  COACH_LINES,
  COACH_VOICE.id,
  COACH_SETTINGS,
);

console.log("Villain barks (Callum)...");
await generateGroup(
  "villain",
  join("public", "audio", "villain"),
  VILLAIN_LINES,
  VILLAIN_VOICE.id,
  VILLAIN_SETTINGS,
);

console.log("Boss music...");
if (await exists(MUSIC.file)) {
  console.log("  = bgm-boss.mp3 (exists, skipped)");
} else {
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: MUSIC.prompt, music_length_ms: MUSIC.lengthMs }),
  });
  if (!res.ok) {
    console.error(`  music failed: ${res.status} ${await res.text()}`);
    process.exit(3);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(MUSIC.file, buf);
  console.log(`  + bgm-boss.mp3 (${(buf.length / 1024).toFixed(0)} KB)`);
}

console.log("Done.");

// Generate voice-audition samples for the Cyber Heroes narrator pick.
// SAME mentor line across all mentor candidates; SAME villain line across
// villain candidates - so you compare VOICES, not scripts. Writes MP3s +
// a manifest to public/audio/voice-audition/.
//
//   node --env-file=.env.local scripts/elevenlabs-audition.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

// Test lines chosen to exercise the spec: direct address, rhetorical
// questions (rising intonation), warmth, a cyber concept, encouragement;
// and for the villain: sneaky comedic menace.
const MENTOR_LINE =
  "Hey there, Cyber Hero! Ready for your very first mission? Here's a secret: a password is like a key to your treasure. The longer and trickier you make it, the harder it is for any sneaky hacker to get in. Think you can build one that's super strong? I know you can. Let's go!";
const VILLAIN_LINE =
  "Heh heh heh... well, well, well. Look who left their password lying around! \"Password one-two-three\"? Oh, that is TOO easy. I'm the Hacker Raccoon, and I'm already... inside. Better luck next time, kiddo!";

// Mentor = the tuned storyteller settings. Villain = lower stability +
// higher style for a more dynamic, characterful, performed delivery.
const MENTOR_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.8,
  style: 0.4,
  use_speaker_boost: true,
  speed: 1.0,
};
const VILLAIN_SETTINGS = {
  stability: 0.25,
  similarity_boost: 0.75,
  style: 0.6,
  use_speaker_boost: true,
  speed: 1.0,
};

const CANDIDATES = [
  { slug: "mentor-f-jessica", name: "Jessica", role: "mentor", gender: "female", id: "cgSgspJ2msm6clMCkdW9", desc: "Playful, bright, warm (current)" },
  { slug: "mentor-f-sarah", name: "Sarah", role: "mentor", gender: "female", id: "EXAVITQu4vr4xnSDxMaL", desc: "Reassuring, confident, warm" },
  { slug: "mentor-f-laura", name: "Laura", role: "mentor", gender: "female", id: "FGY2WhTYpPnrIDTdsKH5", desc: "Sunny enthusiasm, quirky" },
  { slug: "mentor-m-will", name: "Will", role: "mentor", gender: "male", id: "bIHbv24MWmeRgasZH58o", desc: "Relaxed optimist (audience liked)" },
  { slug: "mentor-m-liam", name: "Liam", role: "mentor", gender: "male", id: "TX3LPaxmHKxFdv7VOQHJ", desc: "Energetic, warm" },
  { slug: "villain-callum", name: "Callum", role: "villain", gender: "male", id: "N2lVS1w4EtoT3dr4eOWO", desc: "Husky trickster, unsettling edge" },
  { slug: "villain-harry", name: "Harry", role: "villain", gender: "male", id: "SOYHLrjzK2X1ezoPC6cr", desc: "Animated, over-the-top" },
];

const MODELS = ["eleven_v3", "eleven_multilingual_v2"];
const OUT_DIR = join("public", "audio", "voice-audition");
await mkdir(OUT_DIR, { recursive: true });

let accepted = null;
async function gen(c) {
  const line = c.role === "villain" ? VILLAIN_LINE : MENTOR_LINE;
  const settings = c.role === "villain" ? VILLAIN_SETTINGS : MENTOR_SETTINGS;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${c.id}?output_format=mp3_44100_128`;
  const models = accepted ? [accepted] : MODELS;
  let lastErr = null;
  for (const model of models) {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: line, model_id: model, voice_settings: settings }),
    });
    if (resp.ok) {
      if (!accepted) {
        accepted = model;
        console.log(`(using model: ${model})`);
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      await writeFile(join(OUT_DIR, `${c.slug}.mp3`), buf);
      return buf.byteLength;
    }
    lastErr = `${resp.status} ${(await resp.text()).slice(0, 150)}`;
    if (accepted) break;
  }
  throw new Error(lastErr);
}

const entries = [];
for (const c of CANDIDATES) {
  process.stdout.write(`${c.role.padEnd(7)} ${c.name.padEnd(10)} ... `);
  try {
    const bytes = await gen(c);
    console.log(`${bytes} bytes`);
    entries.push({ ...c, file: `/audio/voice-audition/${c.slug}.mp3` });
  } catch (e) {
    console.log("FAILED:", e.message);
  }
}

await writeFile(
  join(OUT_DIR, "manifest.json"),
  JSON.stringify(
    {
      model: accepted,
      mentorLine: MENTOR_LINE,
      villainLine: VILLAIN_LINE,
      mentorSettings: MENTOR_SETTINGS,
      villainSettings: VILLAIN_SETTINGS,
      entries,
    },
    null,
    2,
  ),
);
console.log(`\nDone. ${entries.length}/${CANDIDATES.length} generated. Open /dev/voice-audition`);

/* Voice-over for the week 1 bookend videos.
 *
 * Owner, 2026-10-18, on the silent first cut: "there's no voice over on it.
 * He's moving his lips and nobody's talking. It doesn't really make a kid want
 * to carry on watching."
 *
 * The video models never generate speech here - they are told explicitly not
 * to, and the clip is checked for speech before it ships. Every spoken word in
 * these videos comes from this script instead, which means we choose the
 * voice, the words and the delivery, and a re-record costs a few pennies
 * rather than a whole render.
 *
 * Emma (Kids Educator) is the narrator across the whole product. Callum is the
 * Hacker Raccoon, and he is the only other voice allowed in a bookend video.
 *
 *   node --env-file=.env.local scripts/_w01-video-vo.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const OUT = ".art-check/w01-video/vo";
await mkdir(OUT, { recursive: true });

const EMMA = "oClOrzqamOXmtcB8iqTj";
const CALLUM = "N2lVS1w4EtoT3dr4eOWO";

/* Emma's settings are the product's locked delivery formula; Callum's are the
 * villain settings from the showdown generator. */
const EMMA_SETTINGS = { stability: 0.6, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 };
const VILLAIN_SETTINGS = { stability: 0.25, similarity_boost: 0.75, style: 0.6, use_speaker_boost: true, speed: 0.95 };

const LINES = [
  /* INTRO - over shot 1, the heroes and their lock.
   *
   * Owner, 2026-10-19, on the first cut: "the lock is good, but then it
   * doesn't really replicate anything that we've been teaching, like
   * passwords... with them trying to get inside the laptop." The lock now
   * stands on a tablet whose screen shows four typed dots, and these two
   * lines say so out loud, so the picture and the words make the same point:
   * the lock IS the password, and the password is what opens the device. */
  { file: "intro-1", voice: EMMA, settings: EMMA_SETTINGS, text: "See that lock on the tablet? That is Adam and Layla's password." },
  { file: "intro-2", voice: EMMA, settings: EMMA_SETTINGS, text: "Four little dots, and nobody gets into their games or their messages." },
  /* INTRO - over shot 2, the night and the Raccoon. */
  { file: "intro-3", voice: EMMA, settings: EMMA_SETTINGS, text: "[whispers] But somebody has been watching it." },
  { file: "intro-4", voice: EMMA, settings: EMMA_SETTINGS, text: "And tonight, he came back for it." },
  { file: "intro-5", voice: CALLUM, settings: VILLAIN_SETTINGS, text: "[laughs] This one is MINE." },
  { file: "intro-6", voice: EMMA, settings: EMMA_SETTINGS, text: "Cyber Hero, we have one week. Let's build him a lock he can NEVER open." },

  /* OUTRO - over shot 1, the Raccoon heaving and failing. */
  { file: "outro-1", voice: EMMA, settings: EMMA_SETTINGS, text: "He pulled. He yanked. He tried every trick he had to get that tablet open." },
  { file: "outro-2", voice: CALLUM, settings: VILLAIN_SETTINGS, text: "Open! Why won't you OPEN?" },
  /* OUTRO - over shot 2, the heroes cheering. */
  { file: "outro-3", voice: EMMA, settings: EMMA_SETTINGS, text: "[proud] And that lock did not move one tiny bit." },
  { file: "outro-4", voice: EMMA, settings: EMMA_SETTINGS, text: "Because YOU built it, Cyber Hero. Week one, done." },
  { file: "outro-5", voice: CALLUM, settings: VILLAIN_SETTINGS, text: "This isn't over!" },
];

for (const line of LINES) {
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${line.voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: line.text, model_id: "eleven_v3", voice_settings: line.settings }),
    }
  );
  if (!resp.ok) {
    console.log(`${line.file}  HTTP ${resp.status}  ${(await resp.text()).slice(0, 160)}`);
    continue;
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  await writeFile(`${OUT}/${line.file}.mp3`, buf);
  console.log(`${line.file.padEnd(9)} ${String(buf.length).padStart(7)} bytes  "${line.text.slice(0, 60)}"`);
}

/* Record the voice-over for one week's bookend videos.
 *
 *   node --env-file=../algorithmx/.env.local scripts/week-video-vo.mjs --week=2
 *
 * The video models never generate speech - they are told not to, the clip is
 * checked for an audio stream before it is used, and the build drops any
 * audio the model returns anyway. Every spoken word in these videos comes
 * from here, which means we choose the voice, the words and the delivery, and
 * a re-record costs a few pennies rather than a whole render.
 *
 * Emma narrates across the whole product. Callum is the Hacker Raccoon and is
 * the only other voice allowed in a bookend video.
 */
import { mkdir, writeFile } from "node:fs/promises";

const weekArg = process.argv.find((a) => a.startsWith("--week="));
const WEEK = weekArg ? Number(weekArg.split("=")[1]) : null;
if (!WEEK) {
  console.error("usage: node scripts/week-video-vo.mjs --week=N");
  process.exit(1);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=<path to .env.local>");
  process.exit(1);
}

const wk = await import(`./week-videos/w${String(WEEK).padStart(2, "0")}.mjs`);
const shared = await import("./week-videos/_voices.mjs");
const OUT = `.art-check/w${String(WEEK).padStart(2, "0")}-video/vo`;
await mkdir(OUT, { recursive: true });

/* A week may override a voice, but almost never should: see _voices.mjs. */
const VOICES = { EMMA: wk.EMMA ?? shared.EMMA, CALLUM: wk.CALLUM ?? shared.CALLUM };
const SETTINGS = {
  EMMA: wk.EMMA_SETTINGS ?? shared.EMMA_SETTINGS,
  CALLUM: wk.VILLAIN_SETTINGS ?? shared.VILLAIN_SETTINGS,
};

let ok = 0;
let failed = 0;

for (const video of wk.VIDEOS) {
  for (const line of video.lines) {
    const voiceId = VOICES[line.voice];
    if (!voiceId) {
      console.log(`${line.file}  UNKNOWN VOICE "${line.voice}"`);
      failed++;
      continue;
    }
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: line.text,
          model_id: "eleven_v3",
          voice_settings: SETTINGS[line.voice],
        }),
      }
    );
    if (!resp.ok) {
      console.log(`${line.file}  HTTP ${resp.status}  ${(await resp.text()).slice(0, 160)}`);
      failed++;
      continue;
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    await writeFile(`${OUT}/${line.file}.mp3`, buf);
    console.log(
      `${line.file.padEnd(12)} ${line.voice.padEnd(7)} ${String(buf.length).padStart(7)} bytes  "${line.text.slice(0, 64)}"`
    );
    ok++;
  }
}

console.log(`\n${ok} recorded, ${failed} failed -> ${OUT}`);
if (failed) process.exit(1);

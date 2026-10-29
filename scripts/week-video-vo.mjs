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
 *
 * ── EVERY LINE IS LANDED, NOT CHOPPED ────────────────────────────────────
 * Owner, 2026-10-29: "make sure that the narration voice doesn't cut off
 * sharply." Checking week 11 found SEVEN of its nine lines still at speaking
 * level on their final sample, one of them at -1.0 dB - the model simply
 * stops when the words run out, with no decay and no room after.
 *
 * In a bookend that lands especially hard, because the film cuts to the next
 * shot the moment the line ends. So every recording is settled here, at the
 * point it is made, rather than left for someone to notice per week:
 *
 *   a short fade over the final 90ms, so the line decays instead of stopping
 *   then 0.30s of silence, so it has somewhere to land before the next thing
 *
 * The fade is deliberately short. Anything longer eats the last word, which
 * is usually the one carrying the sentence ("Week eleven, DONE"). Verify with
 * scripts/week-video-vo-endings.mjs, which fails on a loud tail.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { renameSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

/** Seconds of fade at the end of a line, and of silence after it. */
const FADE = 0.09;
const PAD = 0.3;

function settle(file) {
  const probe = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" }).stderr || "";
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(probe);
  if (!d) return "unmeasured";
  const dur = +d[1] * 3600 + +d[2] * 60 + +d[3];
  const st = Math.max(0, dur - FADE);
  const tmp = `${file}.settled.mp3`;
  const r = spawnSync(ffmpegPath, [
    "-y", "-v", "error", "-i", file,
    "-af", `afade=t=out:st=${st.toFixed(3)}:d=${FADE},apad=pad_dur=${PAD}`,
    "-c:a", "libmp3lame", "-b:a", "128k", tmp,
  ]);
  if (r.status !== 0) return "SETTLE FAILED";
  renameSync(tmp, file);
  return "settled";
}

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
    const state = settle(`${OUT}/${line.file}.mp3`);
    console.log(
      `${line.file.padEnd(12)} ${line.voice.padEnd(7)} ${state.padEnd(14)} "${line.text.slice(0, 60)}"`
    );
    ok++;
  }
}

console.log(`\n${ok} recorded, ${failed} failed -> ${OUT}`);
if (failed) process.exit(1);

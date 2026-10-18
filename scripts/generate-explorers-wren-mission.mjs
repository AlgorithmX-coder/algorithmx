// Generate WREN's narration for one Cyber Explorers mission from its saved,
// tagged script (scripts/wren-voice-scripts/missionNN.mjs) — the SAME
// pipeline built for the ATLAS block intros: eleven_v3 for an emotional arc
// instead of one flat tone, word-timestamp-anchored trim + a short fade so
// clips end naturally instead of either a trailing breath or an abrupt cut.
//
// Owner, 2026-10-18 (WREN): "she sounds far too monotone... she needs a lot
// more enthusiasm... the script needs the correct punctuation... and
// ElevenLabs needs to be reading directly from that script."
//
// Usage:
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01 --only /audio/wren/m01-c1-b1.mp3
//   node --env-file=.env.local scripts/generate-explorers-wren-mission.mjs 01 --dry

import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
const missionArg = process.argv.slice(2).find((a) => /^\d+$/.test(a));
if (!missionArg) {
  console.error("usage: node scripts/generate-explorers-wren-mission.mjs <NN> [--only <path>] [--dry]");
  process.exit(2);
}
const missionNo = missionArg.padStart(2, "0");

const { [`mission${missionNo}VoiceScripts`]: scripts } = await import(`./wren-voice-scripts/mission${missionNo}.mjs`);
if (!scripts) {
  console.error(`scripts/wren-voice-scripts/mission${missionNo}.mjs must export mission${missionNo}VoiceScripts`);
  process.exit(2);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !DRY) {
  console.error("ELEVENLABS_API_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}

const VOICE_ID = "trTZq8BsN25LRj9YD7fR"; // WREN — ARC Handler (Cyber Explorers)
const MODEL_ID = "eleven_v3";
const VOICE_SETTINGS = { stability: 0.4, similarity_boost: 0.78, style: 0.5, use_speaker_boost: true };
const OUT_DIR = join("public", "audio", "wren");
const NATURAL_TAIL = 0.05;
const FADE_DUR = 0.3;

async function generate(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) throw new Error(`generate: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function wordTimestamps(buf) {
  const fd = new FormData();
  fd.append("model_id", "scribe_v1");
  fd.append("file", new Blob([buf], { type: "audio/mpeg" }), "clip.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: fd });
  if (!r.ok) throw new Error(`stt: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return { words: (j.words || []).filter((w) => w.type === "word" && Number.isFinite(w.end)), text: j.text || "" };
}

const entries = Object.entries(scripts).filter(([path]) => !only || path === only);
console.log(`Mission ${missionNo}: ${entries.length} clip(s) to generate${DRY ? " (dry run)" : ""}`);

await mkdir(OUT_DIR, { recursive: true });
let ok = 0, failed = [];
for (const [path, text] of entries) {
  const filename = path.split("/").pop();
  console.log(`\n${filename}: "${text.slice(0, 70)}..."`);
  if (DRY) continue;

  try {
    const buf = await generate(text);
    const rawPath = join(OUT_DIR, `.${filename}.raw.mp3`);
    await writeFile(rawPath, buf);

    const { words, text: heard } = await wordTimestamps(buf);
    if (!words.length) {
      console.log(`  WARNING: no words returned from STT, keeping untrimmed`);
      await writeFile(join(OUT_DIR, filename), buf);
      ok++;
      continue;
    }
    const lastWord = words[words.length - 1];
    const fadeStart = lastWord.end + NATURAL_TAIL;
    const total = fadeStart + FADE_DUR;
    const outPath = join(OUT_DIR, filename);
    const trim = spawnSync(ffmpegPath, ["-y", "-i", rawPath, "-t", String(total), "-af", `afade=t=out:st=${fadeStart}:d=${FADE_DUR}`, outPath], { encoding: "utf8" });
    if (trim.status !== 0) {
      console.log(`  ffmpeg fade failed, keeping untrimmed: ${trim.stderr}`);
      await writeFile(outPath, buf);
    } else {
      console.log(`  trimmed at ${fadeStart.toFixed(2)}s, heard: "${heard.slice(0, 70)}..."`);
    }
    ok++;
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
    failed.push(filename);
  }
}

console.log(`\n${DRY ? "DRY RUN" : `DONE — ${ok}/${entries.length} generated`}`);
if (failed.length) { console.log(`FAILED: ${failed.join(", ")}`); process.exit(1); }

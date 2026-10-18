// Generate the ATLAS block-intro briefings for Cyber Explorers.
// One MP3 per block -> public/audio/atlas/block1.mp3..block4.mp3.
//
// Voice: ATLAS = ElevenLabs "Daniel" (Steady Broadcaster), same voice as the
// Cyber Heroes week-intros. Model eleven_v3 for expressive delivery, with
// inline [warm]/[serious]/[determined]/[excited] delivery tags giving the
// read an emotional arc instead of one flat tone (owner, 2026-10-18: "it
// just needs more emotion and it needs to flow more").
//
// SOURCE OF TRUTH: reads `voiceScript` straight out of blockIntroData.ts, so
// there is only one copy of each script. Before 2026-10-18 these briefings
// had NO saved script anywhere in the repo — the only record of what ATLAS
// actually said was baked into the mp3 itself. Never let that happen again:
// always add new/changed lines to `voiceScript`, not just to a one-off call.
//
// TRAILING-BREATH FIX: ElevenLabs v3 sometimes appends an audible breath
// after the last word. A naive silence-detection trim is NOT safe here — it
// cut real words off block1 on the first attempt, because a normal
// mid-sentence pause can be longer than the gap before the breath. Instead:
// get word-level timestamps via scribe_v1, find exactly where the SCRIPT'S
// last word ends, keep a short natural tail (50ms), then fade to true
// silence over 350ms. A hard cut at that exact timestamp sounds abrupt
// (owner: "they cut off very sharply") — the fade is what makes it land as a
// natural ending instead of a chopped one.
//
// Usage:
//   node --env-file=.env.local scripts/generate-explorers-atlas-blocks.mjs [1 2 3 4]
//   node --env-file=.env.local scripts/generate-explorers-atlas-blocks.mjs --dry

import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { block1Intro, block2Intro, block3Intro, block4Intro } from "../app/explorers/phone/blockIntroData.ts";

const DRY = process.argv.includes("--dry");
const requested = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const blocks = requested.length ? requested : [1, 2, 3, 4];

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !DRY) {
  console.error("ELEVENLABS_API_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}

const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel - Steady Broadcaster
const MODEL_ID = "eleven_v3";
const VOICE_SETTINGS = { stability: 0.35, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true };
const OUT_DIR = join("public", "audio", "atlas");
const NATURAL_TAIL = 0.05; // let the last word's own decay breathe before fading
const FADE_DUR = 0.35;

const DATA = { 1: block1Intro, 2: block2Intro, 3: block3Intro, 4: block4Intro };

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
  return (j.words || []).filter((w) => w.type === "word" && Number.isFinite(w.end));
}

await mkdir(OUT_DIR, { recursive: true });
for (const n of blocks) {
  const data = DATA[n];
  if (!data) { console.error(`no block${n}Intro`); continue; }
  const text = data.voiceScript;
  console.log(`Block ${n}: ${text.slice(0, 60)}...`);
  if (DRY) continue;

  const buf = await generate(text);
  const rawPath = join(OUT_DIR, `.block${n}-raw.mp3`);
  await writeFile(rawPath, buf);

  const words = await wordTimestamps(buf);
  if (!words.length) { console.log(`  no words returned, keeping untrimmed`); await writeFile(join(OUT_DIR, `block${n}.mp3`), buf); continue; }
  const lastWord = words[words.length - 1];
  const fadeStart = lastWord.end + NATURAL_TAIL;
  const total = fadeStart + FADE_DUR;
  console.log(`  last word "${lastWord.text}" ends at ${lastWord.end.toFixed(2)}s -> fade from ${fadeStart.toFixed(2)}s, total ${total.toFixed(2)}s`);

  const outPath = join(OUT_DIR, `block${n}.mp3`);
  const trim = spawnSync(ffmpegPath, ["-y", "-i", rawPath, "-t", String(total), "-af", `afade=t=out:st=${fadeStart}:d=${FADE_DUR}`, outPath], { encoding: "utf8" });
  if (trim.status !== 0) { console.error(`  ffmpeg fade failed: ${trim.stderr}`); continue; }
  console.log(`Block ${n}: done -> ${outPath}`);
}
console.log(DRY ? "DRY RUN — no audio generated" : "ALL DONE");

// Generate the ATLAS per-mission briefings for Cyber Explorers (the new
// MissionIntro card — one per case, alongside the existing one-per-block
// briefing). Same voice, model and trailing-breath-fix trim pipeline as
// scripts/generate-explorers-atlas-blocks.mjs — see that file's header for
// the full reasoning; this is the same approach scoped to MISSION_INTROS in
// app/explorers/missionIntroData.ts instead of blockIntroData.ts.
//
// SOURCE OF TRUTH: reads `voiceScript` straight out of missionIntroData.ts.
//
// Usage:
//   node --env-file=.env.local scripts/generate-explorers-atlas-missions.mjs 11
//   node --env-file=.env.local scripts/generate-explorers-atlas-missions.mjs 11 12 13
//   node --env-file=.env.local scripts/generate-explorers-atlas-missions.mjs --dry 11

import { spawnSync } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { MISSION_INTROS } from "../app/explorers/missionIntroData.ts";

const DRY = process.argv.includes("--dry");
const requested = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
if (!requested.length) {
  console.error("usage: node scripts/generate-explorers-atlas-missions.mjs [--dry] <caseNN> [caseNN...]");
  process.exit(2);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !DRY) {
  console.error("ELEVENLABS_API_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}

const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel - Steady Broadcaster (same as block intros)
const MODEL_ID = "eleven_v3";
const VOICE_SETTINGS = { stability: 0.35, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true };
const OUT_DIR = join("public", "audio", "atlas");
const NATURAL_TAIL = 0.05;
const FADE_DUR = 0.35;

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
for (const n of requested) {
  const id = `explorers-m${String(n).padStart(2, "0")}`;
  const data = MISSION_INTROS[id];
  if (!data) { console.error(`no MISSION_INTROS["${id}"] — write the mission intro data first`); continue; }
  const text = data.voiceScript;
  console.log(`Case ${n}: ${text.slice(0, 60)}...`);
  if (DRY) continue;

  const buf = await generate(text);
  const rawPath = join(OUT_DIR, `.m${n}-brief-raw.mp3`);
  await writeFile(rawPath, buf);

  const words = await wordTimestamps(buf);
  const outPath = join(OUT_DIR, `m${n}-brief.mp3`);
  if (!words.length) { console.log(`  no words returned, keeping untrimmed`); await writeFile(outPath, buf); continue; }
  const lastWord = words[words.length - 1];
  const fadeStart = lastWord.end + NATURAL_TAIL;
  const total = fadeStart + FADE_DUR;
  console.log(`  last word "${lastWord.text}" ends at ${lastWord.end.toFixed(2)}s -> fade from ${fadeStart.toFixed(2)}s, total ${total.toFixed(2)}s`);

  const trim = spawnSync(ffmpegPath, ["-y", "-i", rawPath, "-t", String(total), "-af", `afade=t=out:st=${fadeStart}:d=${FADE_DUR}`, outPath], { encoding: "utf8" });
  if (trim.status !== 0) { console.error(`  ffmpeg fade failed: ${trim.stderr}`); continue; }
  console.log(`Case ${n}: done -> ${outPath}`);
}
console.log(DRY ? "DRY RUN — no audio generated" : "ALL DONE");

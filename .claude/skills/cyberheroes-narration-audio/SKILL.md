---
name: cyberheroes-narration-audio
description: Generate and manage all Cyber Heroes voice and audio — Sarah narrator lines, Callum villain barks, boss victory lines, music beds, SFX — via the ElevenLabs pipeline. Use whenever writing/regenerating narration, adding villain lines for a boss, adjusting audio levels, or debugging audio playback in lessons. Contains the locked voice IDs, settings, volume contract, and sequencing rules.
---

# Cyber Heroes Narration & Audio

## The two voices (LOCKED — the ONLY voices in the product)

- **Sarah** — the narrator/coach everywhere. ElevenLabs voice `EXAVITQu4vr4xnSDxMaL`, model `eleven_v3`, locked "v13-sarah-child" storyteller settings: stability 0.25 / similarity 0.7 / style 0.55 / speaker_boost / speed 1.0, with v3 emotion tags (`[excited]`, `[warmly]`, `[whispers]`, `[laughs]`). Hero-mentor coach, NOT a teacher; American accent; empowering, never frightening.
- **Callum** "Husky Trickster" — the Hacker Raccoon, all villain lines. Voice `N2lVS1w4EtoT3dr4eOWO`.

`ELEVENLABS_API_KEY` lives in `.env.local` (Pro tier). Music: POST `/v1/music` returns MP3 directly.

## Generators

- Boss villain + coach lines: `node --env-file=.env.local scripts/elevenlabs-generate-showdown-audio.mjs --week=N`. WEEKS table keyed by week; `villain: {}` is valid for coach-only regen; files land as `${slug}-${slot}.mp3`; existing files skip as "cached" — DELETE a file to regenerate it. The script runs the zero-repeated-villain-phrases duplicate check (user mandate: 5 unique lines per boss, never reused across weeks).
- Lesson narration: `scripts/elevenlabs-generate-narration.mjs` (manifest-keyed; prune orphan MP3s manifest-verified). Parser gotcha: `]` inside a line breaks the tag regex.
- Victory-line template per week: child-directed, varied rhythm, names the week's three wins ("[excited] YES! Case closed! … [warmly] you were amazing."). Long lines are KEPT by user decision — sequencing handles overlap, never shorten without asking.

## File + playback conventions

- Villain barks → `public/audio/villain/{file}.mp3`, played via bossArena `playVillain()` at volume **0.45**, mute-gated.
- Coach/narrator → `public/audio/coach/{file}.mp3`, via `playCoach()` at **0.55**, tracked so a new line cuts the previous one.
- ALL music VERY faint (user rule: atmosphere, never a listening subject): bgmBoss **0.03**, bgmHub 0.05, lesson beds 0.012. Boss music is a-cappella voices only.
- SFX via SoundManager registry (`app/lib/sounds.ts`) + signature cues (`app/lib/sfx-signature.ts`).
- TRAP: raw `new Audio()` / SpeechSynthesis bypass SoundManager volume caps and the master mute — any new raw-Audio path must implement `isAudioMuted()` gating + a capped volume itself.

## Sequencing rules (LOCKED)

- NO narrator voice mid-fight — coach banners are text-only. The ONE narrator moment is Sarah's victory line.
- Victory audio never overlaps: villain defeat/escape line finishes → "Cyber Heroes" victory sting (~2s) → Sarah at +2.2s. Implemented via `whenVillainQuiet()` in `bossArena.tsx` — use it for any new victory-adjacent audio.
- Audio-affecting changes MUST be verified against a fresh dev server (`rm -rf .next`, restart) — HMR silently serves stale audio code.

## Durations for planning

Villain barks ~3–6s; victory sting ~2s; Sarah victory lines ~30s (kept long deliberately). Check durations via PowerShell Shell.Application `GetDetailsOf(item, 27)`.

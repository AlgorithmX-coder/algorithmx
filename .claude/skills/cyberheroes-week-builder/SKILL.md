---
name: cyberheroes-week-builder
description: The proven end-to-end production cycle for building or modifying a Cyber Heroes week (lesson content, boss battle, art, audio, QA, ship). Use whenever authoring or editing weekN.ts content, adding/changing a boss (bossShowdown/bossVault/bossForge), building a new week or tier, or planning any batch content work for Cyber Heroes. Built from the cycle that shipped all 20 weeks.
---

# Cyber Heroes Week Builder

The per-week production cycle, proven across W1–W20 (all live in prod). Follow the order; the sequencing rules exist because violating them corrupted runs.

## The locked week template (29 screens)

intro video → 5 × (Learn → Play → Prove) concept cycles → consolidation → **Boss Battle (screen 24)** → outro video (25) → badge scene (overlay after video) → debrief → stickers (27) → completion. Ages 6–9, ~45 min, save/resume. Flow after a boss win is LOCKED: boss → straight to video (quiet dark handoff frame, no mission-complete flash) → badge scene once → debrief.

## The locked boss grammar (W3–W20, `ShowdownBoss`)

Every boss = a machine the Raccoon wheels in, themed to the week. Arrival taunt → 3 phases (each an authored `bossAttacks` entry: telegraph → counter primitive → gear pops) → weak-point question per gear → charge-release finisher → unique escape line (he escapes every week until W20's real defeat). Counter primitives: `tapTell`, `shieldHold`, `counterCard`, `orderStrike`, `deflectSort`, `rush` (W20 only) + `finisher.protocol` order-strike gate. Kid-first contract: exactly two verbs (TAP a big stationary thing, press-and-HOLD one button), nothing races the child, wrong answers teach and retry, no lose state. W1 (`bossVault`) and W2 (`bossForge`) are bespoke five-phase set-pieces — rewrap, never rebuild.

## The 12 global pilot rules (LOCKED — apply to any boss work)

1. Glassy hero-select cards blending into the arena.
2. NO narrator voice mid-fight — text-only coach banners.
3. ONE narrator moment: excited Sarah victory line naming what the kid did. Victory audio strictly sequenced: villain line ends → victory sting (~2s) → Sarah (+2.2s), via `whenVillainQuiet()` in bossArena.
4. Raccoon EXACTLY the hero's height, both at fixed sideline spots for the whole fight (no sliding between beats; entrance roar excepted).
5. Answers shuffled everywhere (authored data puts the right answer first — engines scramble with seeded, resume-safe order).
6. Six-year-old wording, short words.
7. Flow: boss → outro video → badge scene → debrief.
8. All boss music a-cappella, voices only, VERY faint (bgmBoss 0.03).
9. Bespoke badge medal art per week (`WeekContent.badgeArt`).
10. Every floating caption/instruction on a dark `CaptionChip` (white-on-arena vanishes on bright weeks).
11. Sarah + Callum are the ONLY voices in the product.
12. Cast never stands behind gameplay boards or the victory text column — QA at BOTH 1280×900 and 2560×1440.

## User mandates (non-negotiable)

- **Every week visibly DIFFERENT**: unique Adam/Layla outfits, machine, arena, badge. Re-skins must be genuine — if a parent could mistake two weeks side by side, it fails.
- **Zero repeated villain phrases** across all 20 bosses (5 unique Callum lines per week; `scripts/elevenlabs-generate-showdown-audio.mjs` runs the duplicate check).
- Screenshot every frame and personally review at both viewports before calling a week done.
- One commit per week. `git add -p` must NEVER be used.

## The per-week cycle (proven order)

1. Author `app/lesson/weekContent/weekN.ts` (content + `bossShowdown` config; villain lines unique).
2. `npx tsc --noEmit`.
3. Audio: `node --env-file=.env.local scripts/elevenlabs-generate-showdown-audio.mjs --week=N` (see the narration-audio skill).
4. Art set via OpenArt (see the art-pipeline skill): 6 hero sprites (pose-matched base refs), machine intact→damaged/defeated, arena, badge.
5. Install art, then INSPECT every image full-size (catch extra props, wrong items, anatomy).
6. Dev server fresh (`rm -rf .next` first — HMR silently serves stale code) with `E2E_TESTS=1`.
7. QA playthrough both viewports (see the boss-qa skill), read every frame.
8. Cold e2e, then commit the week.

**Sequencing rules:** author next week's `weekN.ts` during the current week's QA (safe), but hold shared-script entries (audio WEEKS table + QA STEPS) until the current week COMMITS. Never edit engine files while QA drives the dev server.

## Copy rules

Kid-first US English (Childhelp 1-800-422-4453, 911). Coach copy must never contain any click-label phrase (Playwright getByText is case-insensitive substring); all click labels unique on screen. "Trusted grown-up" is the locked term. No guilt, FOMO, or countdown pressure — see the cyber-heroes-gamification skill's child-safety checklist before shipping anything reward-flavored.

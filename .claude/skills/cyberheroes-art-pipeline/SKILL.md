---
name: cyberheroes-art-pipeline
description: Generate, key, and install Cyber Heroes character/machine/arena/badge art via the OpenArt MCP + sharp pipeline. Use whenever creating or fixing sprites (Adam/Layla outfits, the Hacker Raccoon, boss machines, arenas, badge medals), regenerating malformed art, or keying images to transparent PNGs. Contains the white-costume flood-fill keying lesson and all install conventions.
---

# Cyber Heroes Art Pipeline

## Generation (OpenArt MCP)

- Model: `nano-banana-2`, mode `image2image` (~20 credits/image). Character consistency comes from reference images: upload via `openart_upload_sign` → curl PUT the bytes → pass in `params.visualReferences`.
- Base sprite refs live in the account uploads (recover via `openart_upload_list`, or re-upload from `public/game/characters/`). Flatten transparent PNGs onto white before uploading as refs.
- Always generate on a **PURE WHITE background**, full body, nothing cropped.
- Retake discipline: fix ONE thing per retake via self-referencing image2image ("keep everything identical, change ONLY …"). Known model habits: hallucinated glow/energy props on ATTACK poses (say "NO props, NO energy effects, NO glow"), props multiplying (say "exactly ONE"), rendered text in scenes (retake changing only that element).
- Upstream `NO_IMAGE` / "[google] Content Policy Violation" failures are TRANSIENT — refire the IDENTICAL request first.
- INSPECT every generation full-size before install: count fingers/limbs/feet, check faces, garbled text, extra props. Composite onto magenta (`sharp .flatten({background:'#ff00ff'})`) to audit alpha damage — defects invisible on white previews show instantly.

## Keying (the hard-won lesson)

A **global** white-key (all pixels mn≥238 && sat≤14 → transparent, 220–238 feathered) punches holes in any WHITE costume piece — hard hats, silver armor highlights. Key with a **border-connected flood fill** instead:

1. BFS from image borders through white-ish pixels (mn≥220, sat≤20) → only background connected to the edge goes transparent.
2. If the costume itself is white (the fill crosses the anti-aliased silhouette into it): tighten the fill threshold to near-pure white (mn≥244, sat≤10) and feather the 1px rim (bg-adjacent pixels mn≥230 → alpha 128).
3. Enclosed background pockets (between raised arms and the head) never touch the border — key flat pure-white components (avg mn≥246, area>400) that do NOT touch already-keyed background.
4. Soft gray ground shadows survive tight fills and read as white smudges on dark arenas — fade low-sat near-white pixels (sat≤22, mn≥190) in the bottom 14% of the subject's bounding box. Skip this for silver/gray boots (they'd get eaten) — check in-game frames instead.

Then `trim({threshold: 8})` and resize. `scripts/_showdown-art.mjs` does key+trim+resize+install (global key — use flood-fill for white costumes); sharp snippets need forward-slash paths.

## Pocket defects (learned on the themed Raccoon set, 2026-09-11)

The enclosed-pocket rule (step 3 above) also punches out any flat PURE-WHITE detail INSIDE the character: the Raccoon's white brow/muzzle markings and flat specular highlights on silver armour came out as dark holes on the arena, on 48 of 100 sprites. After every key+install run: `node scripts/_sprite-pockets.mjs public/game/characters --out .pockets` lists enclosed transparent pockets whose rim is near-white (a genuine gap between arm and head has the darker body outline as its rim; a punched marking has white fur/silver around it), writes before/after crops, and `--heal` fills them with the mean rim colour and solidifies the feathered ring. LOOK at the crops; add a per-file rule in EXTRA for costume-specific cases (W15 reporter chest plate). Bar: 0 defect pockets.

## Costume + pose from two references (the boss mood recipe)

To re-pose a costumed character: reference 1 = the costumed sprite flattened on white (the ONLY clothing source), reference 2 = the shared pose sprite on white (POSE ONLY). The prompt must say so explicitly and add "NO hood, NO cloak, NO props other than the costume", otherwise nano-banana-2 copies the pose reference's hoodie (idle poses especially), the costume reference's pose, or a handheld prop from the taunt. Other retake triggers seen: two figures, purple/brown fur bleed from the pose ref, white sleeves eaten by the key (ask for "soft off-white sleeves with grey shading and a distinct edge"). One extra sentence naming the defect fixed every case in one retake. Pipeline record: scratchpad `raccoon-boss/BRIEF.md` + `install-mood.mjs` (per-week magenta sheets, `results-wNN.json`).

## Install conventions

| Asset | Size | Path |
|---|---|---|
| Hero outfit sprites (idle/attack/celebrate × adam/layla) | height 900 | `public/game/characters/wNN/{hero}-{outfit}-{pose}.png` |
| Raccoon moods (idle/taunt/attack/hurt/defeated) | 1232×900 canvas | `public/game/characters/raccoon-{mood}.png` (shared fallback; still what the BOSS uses) |
| Raccoon per-week themed TAUNT (2026-09-11) | 1232×900 canvas, bottom-centred | `public/game/characters/wNN/raccoon-{outfit}-taunt.png` — resolved by `app/lib/weekCharacters.ts` (`WEEK_OUTFITS` map + `weekCharacterSrc`, `onError` → `fallbackToShared`); week comes from `LessonWeekContext`. Generated image2image off the canon taunt ref with "change ONLY the costume … exactly ONE {prop}"; prop-doubling is the common defect — fix with a self-referencing retake "remove the {prop} from the paw on the viewer's LEFT/RIGHT". Other moods not themed yet (theming the boss would swap costume mid-fight). |
| Machines (intact/damaged/defeated) | height 700 | `public/game/bosses/` |
| Arenas | 1920×1080 | `public/game/backgrounds/` |
| Badge medals | height 512 | `public/cyberheroes/badges/week-NN-{name}.png` |

Installer auto-prefers `-v2.png` retakes. Character consistency is a user MANDATE — reward/lesson art must use the established Adam/Layla/Raccoon designs, never off-model generations.

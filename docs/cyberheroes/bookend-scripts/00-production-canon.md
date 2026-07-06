# Bookend Videos — Production Canon (Weeks 3–20)

Every script in this folder obeys these rules. They are distilled from the
shipped Week 1–2 footage and the locked week template: **open on weakness,
close on strength.**

## The two films per week

- **INTRO — "The Break-In" (~80s, 9 shots: 7×10s + 2×5s).** The Hacker
  Raccoon exploits THIS week's weakness and WINS. Comedy villain victory —
  never scary, never at a child's expense on screen. Ends on his gloat.
- **OUTRO — "The Bounce" (~40s, 5 shots: 4×10s + 1×5s).** After the boss is
  beaten, the Raccoon tries the SAME attack and it bounces off. Every outro
  ends with a **flop-out gag** (his prize is worthless — the Week 2
  "useless CometWizard77 card" pattern).

## World & cast (video canon — do not drift)

- **Set:** the cozy warm BEDROOM — posters, string lights, bunk bed, desk
  monitor. Not a hero HQ. New props may enter; the room stays the room.
  Where a week needs a second location (park, kitchen, school gate) it is
  called out explicitly in the shot.
- **Raccoon:** plush PURPLE fur, green eyes, dark purple zip-up jumpsuit
  (video-canon raccoon — NOT public/characters/raccoon.png).
- **Kids:** Adam + Layla per public/characters/adam.png + layla.png.
- **Voice:** Callum (ElevenLabs `N2lVS1w4EtoT3dr4eOWO`) speaks ONLY the
  lines written in the script — everything else is action + baked SFX. No
  child dialogue on camera (kids react physically; narration lives in the
  lesson, not the films).

## Technical (proven Week 2 pipeline)

- Keyframes: Nano Banana Pro i2i, **4:3**, from the uploaded character/set
  refs → Seedance 2.0 image2video, 4:3, per-shot audio ON.
- **Camera locked wide whenever screen TEXT must stay legible** — zooming
  onto generated text makes it morph (Week 2 outro-S2 re-roll lesson).
- Stitch: scripts/_video-stitch.mjs — normalise → Callum VO mix with
  ducking → adaptive end card held from final frame → concat → loudnorm.
- Deliverables: `/videos/module-XX-intro.mp4` (~80s) and
  `/videos/module-XX-outro.mp4` (~40s), H.264+AAC. The app currently plays
  640×478; master resolution is a per-cohort budget decision.

## Writing rules

- Ages 6–9: every beat readable with the sound off; one idea per shot.
- "Empowering, not frightening" (narrator spec) — the Raccoon is a comedy
  sore-loser, the kids are competent, the week's skills visibly work.
- The intro dramatises the week's five concepts as ONE story (it does not
  enumerate them); the outro shows the SAME attack failing beat-for-beat.
- Callum VO: max 3 lines per intro, 2 per outro, each ≤ 12 words.

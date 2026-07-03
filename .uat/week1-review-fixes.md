# Week 1 — review-round fix list

Logged live during your review. Fixing as a **batch at the end** (per your instruction).
Guiding principle (repeat-category): **empowering, not frightening** — no death/scary
imagery; **PixIcon 3D icons, no raw emoji**.

## Open
- [x] **R12 — Dashboard week-card themed icon strip is smothered behind the title
      text and only half-covers the bar.** On the `/dashboard` week list, each
      card's themed "holographic" icon strip (`/dashboard/week-bg/week-N.png`) is
      drawn as an absolutely-positioned background BEHIND the text —
      `app/dashboard/DashboardView.tsx` ~lines 423-447:
      `position:absolute; left:25%; right:0; zIndex:0; mixBlendMode:screen` with a
      horizontal edge mask (17%→73%). Two causes:
      - **(a) Placement** — the strip overlaps the title + description column, so
        the neon icons (locks, key, password chip, chat bubbles…) sit under/around
        the words and read as clutter ("smothered"); because it starts at 25% and
        the mask fades both edges it only covers a partial middle band. **DECIDED
        (right-anchored motif):** re-anchor the strip to the RIGHT ~40% of the card,
        clear of the title/description, fading its inner (left) edge into the card
        so it reads as a deliberate right-side flourish. The Continue/Start button
        (opaque, z-1) already sits far right so the strip tucks behind/beside it.
      - **(b) Art bug** — `week-3.png` (and possibly others) has a LIGHT/near-white
        background instead of pure black. With `mixBlendMode:screen` white does NOT
        drop out → it renders as a bright grey box over the title ("Stranger Danger:
        Friend or Foe?"). All 20 strips must be pure-black-bg to key cleanly —
        re-key offenders (cf. R5 white-key approach) or change blend handling. Audit
        all 20.
      Shared component → fixing the card fixes every week at once. SCOPE: only the
      backdrop strip's positioning/keying — do NOT touch the badge, title,
      description, button, or card colours.
- [x] **R13 — Memory Match word pairs need clearer wording, tied to the week.** The
      matching game (`app/lesson/weekContent/week1.ts` screen 4, `pairs` ~lines 89-94)
      uses `Key ↔ Opens a lock`, which is generic and off-topic. Reword ALL four
      pairs to be clearer and explicitly about Week-1 passwords. **APPROVED set:**
      - `Password ↔ Your secret code` (keep)
      - `Strong ↔ Long and mixed up`  (was `Key ↔ Opens a lock`)
      - `Hacker ↔ Guesses your password`  (was `Tries to break in`)
      - `Secret ↔ Never share it`  (was `Only you know it`)
      SCOPE: only the `pairs` text (+ colours stay). No component change needed.
- [x] **R14 — Choose Your Path: remove the door logo + redesign the two cards.**
      `app/components/exercises/ChooseYourPath.tsx`. (i) Remove the door emblem —
      the `<PixIcon emoji="🚪" size={32} />` in the glowing portal ring (~lines
      550-570); also the intro `icon="🚪"` passed to ExerciseIntroBeat (~line 728).
      (ii) Redesign the two choice cards so they read as a cohesive, better-looking
      PAIR (they're currently identical cyber-portal "door" buttons: emblem → option
      text → "Tap to choose →"). Keep them visually IDENTICAL pre-pick (deliberate —
      the safe door must not be a giveaway; see the shuffle + DOOR_PALETTE comments)
      and keep the open/reveal animation + consequence logic intact. SCOPE: card
      visuals only; do NOT change scenario logic, shuffle, or reveal behaviour.
- [x] **R15 — Boss battle first screen (CHOOSE YOUR HERO): the Adam/Layla art.**
      Confirmed via `/test/bossbattle`: the first boss screen is "CHOOSE YOUR HERO"
      with two LARGE, FUNCTIONAL hero figures (`ASSET_PATHS.adamSelect` /
      `laylaSelect`, `app/components/game/BossBattle.tsx` ~lines 2808-2833) you pick
      between — not "little pictures". Removing them outright would break hero
      selection. **DECIDED:** add a NEW cinematic boss-intro splash screen showing
      the R16 epic image BEFORE "Choose Your Hero" — hero-select stays fully intact
      (do NOT remove/alter the two picker figures). New screen only.
- [x] **R16 — OpenArt: epic "Adam & Layla vs Hacker Raccoon cyber war" image.**
      Generate a really cool hero image via the OpenArt MCP, using the canonical
      `public/characters/adam-layla-raccoon.png` as the character reference (Adam:
      curly hair + orange hoodie; Layla: two hair-buns + grey top; Raccoon: purple
      neon hooded villain; Pixar-style 3D). **DONE** — Nano Banana Pro (image2image);
      **Variant 1 (shield raised) chosen**, saved (optimised to 238KB webp) at `public/game/boss/week-1-showdown.webp`.
      Wire in as the boss-intro splash (R15) at fix time.
- [x] **R17 — 🔴 BLOCKER: boss battle can DEAD-END on victory** (stuck on the gold
      slow-mo sunburst — no VICTORY panel, no Continue). Kid cannot finish Week 1.
      Seen live on "BOSS · HACKER RACCOON": after the final blow the screen freezes
      on the amber victory-gold wash and never advances. Root cause: victory hinges
      on ONE fire-and-forget timer — `window.setTimeout(() => setResult("won"), 2200)`
      at `app/components/game/BossBattle.tsx:2310` (the ONLY place result→"won";
      grep-confirmed). Lose that timer (tab throttle/background during the 2.2s, a
      remount…) and the React victory overlay never mounts → permanent stall on the
      WebGL gold wash (screenshot shows no "VICTORY!" title, which renders
      unconditionally once result==="won"). SECOND dead-end mode: even when the panel
      shows, the `Continue →` button only renders at `statsStage >= 7` (~5.3s
      staggered reveal, lines 2618-2649 / 4085) with no fallback. This is exactly
      R6's flagged residual ("a setReady timeout fallback so it can never silently
      dead-end"). FIX: guarantee victory + Continue are always reachable — set a
      "bossDefeated" ref the instant bossHp<=0 + a watchdog useEffect that
      force-fires setResult("won") if it hasn't within N s; and a statsStage backstop
      (force→7 after a max delay) so Continue always appears. **RECOMMEND FIXING NOW,
      not batched — it blocks completion.** User unblock meanwhile: refresh → resume
      at the boss and replay (stall is intermittent).
- [x] **R18 — Remove the em dash (—) from Week-1 user-facing text.** It's used as a
      dramatic pause throughout the narration/copy and reads as an AI-writing tell.
      Swept from everything the child reads/hears: **26 strings in
      `app/lesson/weekContent/week1.ts`** (narration, `learned`, `content`) and **5
      in the shared `app/components/exercises/QuickCheck.tsx`** (Prove-step feedback
      — helps every week's Prove step). FIX: replace " — " with natural punctuation
      (comma, or ./! where it starts a new thought). Also swept the 29 dev-only
      `//` comments in week1.ts (— → -) so the symbol is gone from the whole file;
      week1.ts now has ZERO em dashes.
- [x] **R19 — Remove the redundant "BOSS BATTLE / FINAL SHOWDOWN" pre-fight frame.**
      The new BossBattle intro splash ("Enter the Battle") already does the boss
      reveal, so the old DynamicLesson pre-fight screen (raccoon + taunt + START
      BATTLE, `app/lesson/[week]/DynamicLesson.tsx` ~1569-1746) was redundant.
      Removed it; added an effect that auto-enters the boss on landing on the
      bossBattle screen (guarded by !bossDone so retry/finish never re-triggers).
- [x] **R20 — Regenerate the boss splash with the ORIGINAL (younger) Adam & Layla.**
      The first splash aged them up. Regenerated via OpenArt using the actual game
      sprites (adam-select / layla-select / raccoon-idle) as references + a
      "keep them young, match the sprites" prompt. **DONE** — Variant 3 (heroes-left
      action) chosen, optimised to 222KB webp, replaced `public/game/boss/week-1-showdown.webp`.
- [x] **R21 — Redesign the Choose Your Hero background (smooth + aesthetic).**
      Removed the R3F wireframe atmosphere, tesla arc, gold lightning bolts, grain,
      and warm haze/beam. Replaced `.bb-sel-screen` bg with a smooth cyan/violet
      cosmic gradient + soft mesh glows + a central aura; recoloured particles to
      the theme. `app/components/game/BossBattle.tsx`.

- [x] **R22 — Boss answers were ALWAYS option A.** Every `week1.ts` bossPhases
      question authors `correctIndex: 0`, and BossBattle rendered answers in data
      order with no shuffle, so a kid could just spam the first option and win.
      Fix: shuffle each question's answer order once in BossBattle's
      `customQuestions` useMemo (Fisher-Yates on the answers, remap correctIndex).
      Applies to the phases path AND the legacy questions list; shared component so
      every week benefits. BossBattle is client-only (ssr:false) so Math.random()
      is safe / no hydration mismatch. Also wired the `/test/bossbattle` QA harness
      to pass `WEEK_1.bossPhases` (was falling back to generic default questions).
- [x] **R23 — Password examples were repetitive (otter-rocket-mango everywhere).**
      Diversified 25 strong-password examples across `week1.ts` (boss phases +
      quickChecks + cyberScanner + the teaching example) into distinct, fun combos:
      dragon-taco-comet, Wizard-Penguin-Volcano, Robot-Comet7!, Cactus-Banjo8!,
      Comet$Dragon7Waffle!, etc. Added 6 creative words (dragon, penguin, robot,
      comet, taco, waffle) to the Three Random Words pick-bank so kids can build
      them too.

- [x] **R24 — More boss questions.** Boss went from 15 to 25 questions (5 per
      phase), all password-themed and creative: four-word combos
      (`Kangaroo-Waffle-Comet-Pickle`), "someone is watching you type", "share your
      password to win the game", pet-name traps, "I crack passwords all day", etc.
      `week1.ts` bossPhases (prod content).
- [x] **R25 — Redesign the badge/victory screen to the "MISSION COMPLETE" reference.**
      Gold shield on glowing orbital rings + rays, a MISSION COMPLETE! ribbon, the
      "Week N Badge Earned!" flourish, the badge name as a big silver-gradient title,
      a mission subtitle, three icon stat cards (XP / Accuracy / Best combo), gold
      corner brackets + confetti. Applied to the REAL lesson victory
      (`app/components/lesson/BossVictoryScene.tsx`, keeps its audio + Claim Badge /
      Visit Cyber HQ buttons; `missionTitle` now passed from DynamicLesson) AND the
      `/test/bossbattle` harness badge screen. Verified both via screenshot.

- [x] **R26 — Boss FIGHT arena background redesign (depth + declutter + soften).**
      Analysed first via a 4-agent workflow: the fight backdrop is an isolated z0
      layer = a 2897-line raw-Three.js `Arena3D` scene behind a transparent Pixi
      character canvas + DOM HUD, so it can be retextured with zero risk to combat.
      Changes (all in `app/components/game/Arena3D.tsx`, game layer untouched):
      (1) added a cosmic far-plane backdrop sphere — baked per-hero deep-space
      gradient + soft nebula + starfield (`makeCosmosTexture`), unlit/no-fog, drawn
      first, so the arena floats in space instead of a flat black void; (2) made the
      back wall + side walls translucent (opacity 0.34 / 0.20, depthWrite off) so the
      cosmos reads through them as faint holographic layers = real depth; (3) removed
      the near-black ceiling (opened the top to space + saved a lit surface);
      (4) trimmed the busiest decor — particles 50→30, code snippets 15→9. Net perf
      neutral-to-better. Verified in the fight state via screenshot. Note: Adam's
      wrapper hue-rotate tints the (blue) backdrop teal, which matches his teal arena.

- [x] **R27 — Completely redeveloped the boss FIGHT background from the battle
      splash.** (Supersedes R26's in-place Arena3D tweaks.) Generated a
      character-free neon-cyberspace battlefield matching the boss splash
      (firewalls with flame, matrix data streams, glowing circuit-grid floor with
      a central node, sparks) via OpenArt (splash as reference), optimised to
      155KB `public/game/boss/arena-bg.webp`. Replaced the entire 2897-line
      Three.js `Arena3D` scene with this image backdrop in the z0 wrapper
      (`BossBattle.tsx` ~3075): cover image + slow drift + phase-escalation tint
      (warms→red at phases 2-3) + impact flash (keyed on shake) + depth vignette;
      Layla hue-shifts the cyan environment to violet. Removed the now-unused
      `dynamic`/`Arena3D` imports (big perf win — drops a whole WebGL context that
      ran alongside PixiJS). The Pixi character layer + DOM HUD + countdown are
      untouched. `Arena3D.tsx` is now dead code (kept for now; revert-friendly).
      Cohesive with the intro splash → the reveal now flows straight into the fight.

- [x] **R28 — "Where is the raccoon sound?" — villain voice was far off / silent.**
      Analysed the whole boss-audio path (`sounds.ts` SoundManager/Howler,
      `audioMute.ts` master mute, `BossBattle.playVillain`). Three real defects, all
      in `BossBattle.tsx`: **(1) wrong timing** — the intro line fired 900ms after
      the component *mounts*, i.e. during the "Choose Your Hero" splash, seconds
      BEFORE the raccoon drops into the arena → it played to an empty screen, then
      silence when he actually landed. Moved it into the intro choreography's
      `impact` stage (~4450ms, a beat after the roar) so his voice matches his
      entrance. **(2) ignored the mute button** — the voice is raw `<audio>` (not
      Howler), so `Howler.mute()` couldn't touch it: it played straight through the
      HUD mute and never stopped. Now `playVillain` early-returns on `isAudioMuted()`
      and a `subscribeAudioMute` listener cuts any line the instant the child mutes
      (mirrors how the coach narration handles mute). **(3) too quiet** — raw 0.6
      read as "far off" next to the 0.9 coach voice; raised to 0.92 so he lands with
      weight. Taunts + defeat line flow through the same fixed path. Boss SFX
      (`bossRoar`/`bossDefeated`) already went through Howler and were fine.

### Fixed this round (R7–R11)
- [x] **R7 — Remove raccoon glyph on the alert/incident screen.** The floating
      Hacker-Raccoon avatar in the top-right corner of the "ALERT INCOMING /
      Incident Report" screen should go. Location: `app/components/game/WelcomeScene.tsx`
      lines ~101-122 (the `<motion.div>` rendering `/game/characters/raccoon-head.png`,
      `top:120 right:60`). Delete the whole motion.div block; the polaroid + caption
      already carry the villain, so the corner glyph is redundant.
- [x] **R8 — Three Random Words: remove Layla face from the coach toast (keep the
      voice).** At the start of play, the bottom coach caption pops with Layla's
      head portrait while the narrator line "Go on — tap any word you like to
      begin!" plays → face/voice mismatch. Fix in `app/components/lesson/CoachCaption.tsx`:
      remove the round avatar block (the 44px circle `<div>` wrapping
      `<img src={HEAD_SRC[speaker]}>`, ~lines 166-188); KEEP the audio playback +
      caption text + 🔊 icon. Note: CoachCaption is SHARED by every exercise, so
      removing the face fixes the same mismatch everywhere (consistent with
      "narrator isn't a character → no face", already applied to the intro emblem).
      The intro emblem itself is the A/B/C blocks logo — not Layla — so leave it.
- [x] **R9 — Password Hospital intro doesn't fit / clips on the screen.** The paced
      `ExerciseIntroBeat` dialog is vertically centred with NO scroll
      (`app/components/lesson/ExerciseBeats.tsx` ~lines 130-166: `align-items:center`,
      no `overflow-y`), so on a shorter window the top emblem AND the "I'm ready"
      button get cut off (Password Hospital's intro is the tallest — 4 narration
      lines). Fix like the boss-victory overflow fix: make the dialog scroll when
      tall — `overflow-y:auto` + top-align on short heights (align-items flex-start
      / auto margins), and/or cap the card height. Shared component → helps every
      long intro. NOTE: removing the emblem (R10) reduces height too but isn't the
      real fix on its own.
- [x] **R10 — Remove the intro emblem "character speaking" avatar (keep the voice).**
      Per "remove every single this character": the circular logo/portrait at the
      top of each exercise intro reads as if a character is narrating, but it's the
      single narrator voice. Remove the paced emblem block in
      `app/components/lesson/ExerciseBeats.tsx` (~lines 168-195, the 86px circle
      `<div>` wrapping `<img src={logo ?? HEAD_SRC[speaker]}>`); KEEP the welcome
      pill + title + narration (audio + text) + "I'm ready" button. Shared component
      → applies to ALL exercise intros (Password Hospital explicitly called out).
      SCOPE DECIDED: strip the emblem from EVERY exercise intro (not just
      character-like ones). Intro becomes: challenge pill → title → narration →
      "I'm ready".
- [x] **R11 — Redesign ALL exercises to the richer reference look, ZERO characters.**
      Reference = the polished Password Hospital mockup ("Fix the Sick Password"):
      gradient title + subtitle, patient card flanked by themed PROP illustrations
      (clipboard chart + healing chamber), STRENGTH meter, 3D-iconed answer cards
      with number badges, a persistent hint bar, lab-atmosphere background. REMOVE
      all mascots: robot doctor + speech bubble, raccoon coach toast, and the
      character HintBubble / WrongAnswerPanel / CoachCaption faces + intro emblems
      (subsumes R8, R9, R10). Keep themed PROPS (clipboard, chamber, icons) — those
      aren't characters. Plan: ANCHOR on Password Hospital diagnosis screen first,
      get sign-off, then roll the same system to the other 5 exercises
      (MemoryMatch, ThreeRandomWords, ChooseYourPath, WeakSorter, CyberScanner).
      Reuse existing /cyberheroes/icons where possible; generate missing ones
      (e.g. banana for "plain word - no mix"). Diagnosis icon map: too-short→ruler,
      common-word→banana, keyboard→keyboard, personal→id-card.

## Fixed
- [x] **R1 — Scary "WEAK" button.** CyberScanner WEAK button + how-to glyph 💀 → 🚫 (no-entry,
      a mapped 3D PixIcon; clear "don't use", not scary). STRONG stays 🛡. Only Week-1 skull.
- [x] **R3 — Arena answer-options fit.** Quiz panel is capped at 45dvh with overflow scroll, so
      the 4th option dropped below the fold on short laptops. Tightened the panel padding (clamp)
      + added `@media (max-height:760px)` shrinking `.bb-answer` padding/font + grid gap, so all
      4 fit without scrolling — boss stays visible (didn't grow the panel).
- [x] **R4 — "Choose Your Hero" note contradiction.** "Both heroes have the same powers" vs the
      differing stat bars → changed to "Pick the hero you like best - both are awesome!" (no
      claim about powers; keeps the encouragement). Stats/cards untouched; no redesign needed.
- [x] **R2 — Boss-intro redesigned + Adam/Layla removed.** Guides now gate on `showBoss`
      (fight only), so the intro is character-free. Rebuilt as a villain showdown: dark-lair
      radial bg, pulsing red/violet aura, floating villain, taunt bubble ("Ha! You'll never
      crack my codes!"), blinking "FINAL SHOWDOWN" tag, dramatic title. Used the CANONICAL
      caped Hacker-Raccoon (raccoon-idle.png) for consistency with the fight — discarded the
      off-brand grey raccoon I'd generated.
- [x] **R5 — White patch behind Layla (celebrate art).** Background trapped between her raised
      arms — an edge-flood-fill can't reach enclosed pockets. Wrote scripts/_white-key-cc.mjs
      (connected-component keyer: clears large near-white components = bg + pockets, keeps small
      ones = teeth/eyes). Patch gone; Adam's celebrate re-checked (already clean).
- [x] **R6 — Boss "stuck on sunburst, no continue".** The recreated character art was never
      optimised — 79 MB total, 4-5 MB/pose. BossBattle loads ~10 textures (~21 MB) into WebGL
      before setReady() fires, so it crawled/stalled on the 3D backdrop with no fallback.
      Optimised all 28 (scripts/_optimize-chars.mjs: cap 900px + palette q90): 79 MB -> 3 MB,
      ~100 KB/pose, identical at game size. Boss now loads ~1 MB. Optional follow-up: a
      setReady timeout fallback so it can never silently dead-end even if a texture fails.

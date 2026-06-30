# Week 1 — review-round fix list

Logged live during your review. Fixing as a **batch at the end** (per your instruction).
Guiding principle (repeat-category): **empowering, not frightening** — no death/scary
imagery; **PixIcon 3D icons, no raw emoji**.

## Open
_(all clear — nothing outstanding)_

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

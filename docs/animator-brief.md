# Animator brief — AlgorithmX (Cyber Heroes Academy)

Short version for posting on Toptal / Upwork / Working Not Working / contractor list.

## Project

**AlgorithmX — Cyber Heroes Academy** is a UK-based premium cybersecurity learning platform for kids aged 6–10. Parents pay £99 once for lifetime access to a 20-week course. Core characters: Adam (a curious 8-year-old), Layla (his cousin), and the Hacker Raccoon (the antagonist). Visual reference: Pixar / Disney climactic moments — warm, painterly, cinematic but never scary. The current build is at https://www.algorithmx.co.uk/cyberheroes (landing) and we have working PixiJS + R3F surfaces; what we need now is the interactive lesson layer.

## What I'm hiring for

A **senior Rive animator** to build the lesson-content visual system. You won't be writing code — I'll integrate your `.riv` files into the React app. I need someone who has shipped Rive interactive scenes for kids' education or kids' entertainment specifically (not landing-page animations).

## Scope — 6–8 reusable Rive scenes

Each scene must be a single `.riv` with a named state machine and a small set of named inputs (booleans, numbers, triggers). I'll list the inputs I'll wire from React; your job is to design the visuals and the state-machine flow that responds to them.

1. **`memory-card.riv` — flip card**
   State machine: `Card`. Inputs: `isFlipped` (bool), `isMatched` (bool), `wrongShake` (trigger). Should hover-idle, flip on `isFlipped=true`, glow + sparkle on `isMatched=true`, shake gently on `wrongShake`. Reusable for every "tap to reveal" moment in the course.

2. **`drag-drop-zone.riv` — strong/weak password sorter**
   State machine: `SortZone`. Inputs: `dragOver` (bool), `accepted` (bool), `rejected` (bool). Must visually communicate "drag something here" then react with confetti on accept and a shake on reject.

3. **`celebrate-correct.riv` — answer-correct celebration**
   State machine: `Celebrate`. Inputs: `comboLevel` (number 0–5), `play` (trigger). The bigger the combo, the more elaborate the celebration. Reused on every correct-answer beat across every lesson.

4. **`wrong-answer.riv` — answer-wrong reaction**
   State machine: `Wrong`. Inputs: `play` (trigger), `severity` (number 0–2). Soft/sympathetic at low severity, more pronounced at higher. Never punitive — kids audience.

5. **`character-idle-talk.riv` — Adam / Layla / Robo / Raccoon talking head**
   State machine: `Character`. Inputs: `who` (number 0–3 mapping to Adam, Layla, Robo, Raccoon), `talking` (bool), `mood` (number 0–4 mapping to idle, curious, excited, worried, thumbsup). One scene that handles all four characters via the `who` input. Used in every lesson briefing and reaction.

6. **`mission-brief-avatar.riv` — week-intro hero shot**
   State machine: `Brief`. Inputs: `weekNumber` (number 1–20), `appear` (trigger). Cinematic entrance per week — different palette accents per week to give "Week 3" a different mood from "Week 7" without redrawing characters.

7. **`badge-earned.riv` — milestone celebration**
   State machine: `Badge`. Inputs: `badgeKey` (number 0–4), `play` (trigger). Trophy-style animation, ~2 seconds, satisfying release of energy. Reused for every milestone certificate beat.

8. **`boss-react.riv` — Hacker Raccoon reactions during the boss battle**
   State machine: `Boss`. Inputs: `state` (number 0–4: idle, taunt, hit, defeated, victory), `hitTrigger` (trigger). Reused inside the existing PixiJS boss arena.

## Deliverables

- 8 `.riv` files (or 6 if you scope down — we can negotiate).
- Source `.rev` files (Rive's source format) so I can request follow-up edits.
- A **style-guide PDF** with: palette swatches, typography rules, easing references (which curves you used and why), character proportions.
- A **15-minute Loom walkthrough per scene** showing the state machine, input mapping, and how each transition was tuned.

## Visual direction

- **Palette**: cosmic violet (`#7c5cff`), cyan (`#00e5ff`), pink (`#ff5fb3`), gold (`#ffd158`), coral (`#ff7a59`), warm cream (`#fff7e6`). The world is "cosmic dusk lab" — never harsh primary colours, never neon-cyber-cold.
- **Tone**: Pixar/Disney — anticipation, squash-and-stretch, follow-through. Buttons squash on press. Wrong answers feel sympathetic, not punitive. Kids 6–10 audience.
- **Reference reels** (to study before quoting): Khan Academy Kids interactions, Lingokids, Duolingo's owl reactions, the Pixar SparkShorts.
- **NOT**: Lottie-style flat looping motion. Web-banner-style cute. Material Design ripples. Fortnite saturation.

## Technical constraints

- Rive runtime version: latest (`@rive-app/react-canvas` ^4.28). I'm pinned to that on the React side.
- Each `.riv` must be **<300 KB** to keep page-weight under control across 20 weeks of content.
- State machines must work at **60fps on a mid-range Android tablet** (test on Lenovo Tab M10 or equivalent).
- Use **Data Binding** where it simplifies the input mapping — I'll consume `view models` cleanly.
- All inputs MUST be named exactly as listed above. I write code against those names.

## Timeline + budget

- **2 weeks of design + state-machine wiring** for 6–8 scenes.
- Day rate target: £400–500 (senior Rive specialist with kids-ed reel).
- Total budget: **£4,000–6,000 fixed-fee** for the package above. I'll release in 3 milestones: kickoff (£1.5K), first 3 scenes accepted (£2K), all scenes accepted + style guide + Looms (£1.5K).
- Soft start: ASAP. Hard delivery: 14 calendar days from kickoff.

## What I need from your application

1. Two links to past Rive projects (or `.rev` source files I can open).
2. One short Loom (≤3 min) walking through the state machine of your strongest piece.
3. Day rate + earliest start date.
4. One question you'd ask me about the brief.

## Out of scope (do not quote for these)

- React integration (I do that).
- Audio / SFX (I source separately).
- Voiceover (separate hire).
- Character redesign — Adam, Layla, Robo, Raccoon already exist as PNG assets in `/public/characters/` and `/public/game/characters/`. You may stylise but not replace.
- Running animations on native iOS / Android. We're web-only at launch.

---

Reply with the four-item shortlist above and I'll select within 48 hours.

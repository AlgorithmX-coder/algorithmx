---
name: cyber-heroes-gamification
description: Design and implement the gamification layer of Cyber Heroes (AlgorithmX's children's cybersecurity course). Use this skill whenever the task touches XP, points, levels, badges, achievements, streaks, rewards, unlocks, celebrations, win moments, boss battles, progression, leaderboards, collections, engagement or retention mechanics, reward economy or balance, the Prisma models / API routes / Phaser-to-platform events behind any of these, or parent-facing progress reports — even if the user never says the word "gamification". Also use it when reviewing or critiquing any new mechanic, reward, or engagement feature for Cyber Heroes, and when writing copy for reward, streak, or progress screens.
---

# Cyber Heroes Gamification

This skill makes every session design *inside* the Cyber Heroes system instead of reinventing it. It encodes (a) the locked design canon from AlgorithmX's curriculum design sessions, (b) an evidence-based reward economy tuned for the two age tiers, (c) hard child-safety constraints derived from the ICO Age Appropriate Design Code, and (d) the implementation architecture for the Next.js 16 / React 19 / TypeScript / Prisma / Phaser stack.

## The one-paragraph philosophy

Cyber Heroes gamifies **mastery, not attention**. Every reward maps to something learned; nothing rewards raw time-on-app. The evidence base is clear on why: gamification produces reliable positive effects on learning — strongest in young children — when it delivers clear goals, immediate feedback, and frequent small rewards, and when competition is collaborative rather than purely head-to-head. It backfires when rewards feel controlling, when leaderboards shame lower performers, and when mechanics exploit loss aversion or fear of missing out. Under the UK's ICO Children's Code, several of those backfire patterns are not just bad design but compliance risks. So: white-hat drives only (accomplishment, meaning, empowerment, ownership); never scarcity-pressure, social shame, or loss.

## Marker convention (read this before changing anything)

Throughout this skill and its reference files:

- **LOCKED** — decided in AlgorithmX design sessions. Do not change without the user's explicit sign-off. If a task conflicts with a LOCKED item, surface the conflict rather than silently overriding it.
- **DEFAULT** — this skill's recommended value (numbers, copy, thresholds). Use it unless the user overrides. Change DEFAULTs in the reference file where they are defined, in one place only — never fork a value at a call site.
- **DECIDE** — an open decision the user has not made yet. Present 2–3 options with a recommendation; do not invent canon.

## The three-layer reward architecture

Keep these layers distinct. Mixing them (e.g., buying badges with XP) collapses the system.

1. **XP → Levels** (the *pace* layer). A single append-only currency earned from learning actions. Levels are a pure function of lifetime XP. XP is never spent, never lost, never decays. Its job is visible forward motion and an early competence win.
2. **Badges** (the *mastery* layer). Criteria-referenced, not XP-referenced: you earn a badge by *doing the thing*, never by accumulating points. The spine is the LOCKED four-phase ladder — Cyber Cadet → Cyber Guardian → Cyber Defender → Certified Cyber Hero — earned by completing every week in a phase including its Boss Battles. Weekly micro-badges ("Case Closed" stamps) sit underneath.
3. **Collections** (the *delight and revision* layer). Raccoon Capture Cards: defeating a week's Boss Battle awards a collectible card naming and explaining the trick the Raccoon used that week. The sticker book doubles as a spaced-revision artifact — browsing your collection *is* reviewing the curriculum. This is the layer where variety and surprise live.

Cross-cutting: **weekly Mission Streaks** (never daily for the 6–10 tier — the curriculum is weekly), **cosmetic unlocks** (agent gear), **narrative unlocks** (next-episode teasers), and **printable phase certificates** (parent- and Ofsted-facing evidence). Full mechanics, numbers, and tier differences: `references/economy.md`.

## The session template and where rewards attach (LOCKED)

Every week's session follows: **intro video → 5 × (Learn → Game → Prove) cycles → consolidation (low-stakes confidence lap) → Boss Battle (5 phases, 6–8 questions) → closing video → reward**.

Reward attachment points, in order of ceremony (small → big):

- Learn/Game/Prove beats: instant micro-feedback + small XP ticks. No modal celebrations mid-cycle; keep flow.
- Consolidation: a warm "you've got this" moment, modest XP.
- Boss Battle victory: the week's big ceremony — XP burst, Raccoon Capture Card reveal, Case Closed stamp, streak update.
- Phase completion (every 5 weeks): the *biggest* ceremony — phase badge, printable certificate, cosmetic unlock, narrative beat.
- Session end: a **full-stop screen**. "Mission complete, Agent — see you next time." No autoplay-next, no "just one more" nudge. This is a deliberate ICO-aligned natural break, not a retention leak to patch.

## Non-negotiable design rules

These come from the design canon (`references/design-canon.md`) and the child-safety constraints (`references/child-safety.md`). Read both files before designing any new mechanic; read `child-safety.md` in full before shipping anything reward-related.

1. **Nothing flat, anywhere, ever** (LOCKED quality bar). Every reward moment must have craft: motion, sound, character reaction. But vary the *form* of celebration, not the *value* of rewards — win moments rotate through a celebration pool server-side so they never become monotonous, while reward value stays deterministic. No randomised-value loot for children, ever.
2. **Predict-before-reveal** (LOCKED). Any REVEAL mechanic must force a prediction first and show a visible Raccoon reaction after.
3. **No mechanic repeats within a session** (LOCKED), with the sanity clause: don't contort a week that genuinely needs a repeat.
4. **Never subtract.** XP never goes down. Streaks pause (shielded) rather than break. Copy never guilts ("Adam missed you" is banned). Returning after a gap gets "Welcome back, Agent" plus a streak-repair quest, not a zeroed counter.
5. **No public leaderboards for the 6–10 tier.** The evidence: leaderboards convey negative feedback to lower performers and depress intrinsic motivation. Replace with personal bests and cooperative cohort goals ("Together, Cyber Cubs have stopped 1,240 Raccoon capers"). The 11–18 tier may have opt-in, pseudonymous, top-slice-only, weekly-reset leagues — collaborative-competitive framing preferred. Details in `economy.md`.
6. **Mastery earns; attendance doesn't.** No daily-login XP, no time-on-app XP, no engagement-farming. First completion pays full XP; replays pay 20% (DEFAULT) so revision is rewarded but grinding isn't.
7. **Server-authoritative everything.** The client claims events; the server computes awards. A tampered request gets the friendly on-theme response: "Nice try — the Raccoon tried that too. Real heroes earn it." (Yes, the anti-cheat is itself a cybersecurity lesson.)
8. **Age-tier the mechanics.** 6–10: simple mechanics, immediate feedback, frequent small rewards, zero social comparison. 11–18: more complexity, goals and stats, opt-in social features, dynamic difficulty. Never ship one design to both tiers unexamined.

## Workflow: how to use this skill

**When designing a new mechanic or reward** (e.g., "add a streak system", "design the phase-2 celebration"):
1. Read `references/design-canon.md` (the locked world: brand, characters, tiers, template, mechanic taxonomy, tone).
2. Read `references/economy.md` for the numbers and the layer the mechanic belongs to. Slot it into an existing layer before inventing a new one.
3. Run the mechanic through the checklist at the end of `references/child-safety.md`. If it fails any item, redesign — do not ship with a caveat.
4. Present the design with LOCKED/DEFAULT/DECIDE markers and, where research shaped a choice, one line of "why" (the user prefers decisive recommendations with rationale over option menus).

**When implementing** (Prisma models, API routes, award logic, Phaser→platform events, tests):
1. Read `references/implementation.md` first — it defines the ledger schema, the single-transaction award service, the RULES table pattern (no magic XP numbers at call sites), the idempotency contract, and the Phaser bridge.
2. All award logic changes go through the RULES table and the award service. If you find yourself writing `awardXp(userId, 10, ...)` inside a route handler, stop — that's the exact anti-pattern this architecture exists to prevent.
3. New event types require: a RULES entry, an idempotency source definition, and entries in the test checklist (duplicate event, level boundary, streak edge, rollback).

**When writing reward/progress copy**: voice is warm, capable, second-person "Agent" address; Adam and Layla celebrate *with* the child; the Raccoon is comically foiled, never scary; zero guilt, zero FOMO, zero countdown pressure. Reading age matches tier. Examples in `design-canon.md`.

**When reviewing someone else's mechanic**: run the child-safety checklist first, then the economy-coherence questions in `economy.md` ("which layer is this?", "what does it teach?", "what happens to the child who's behind?").

## Reference files

- `references/design-canon.md` — the LOCKED Cyber Heroes world: brand hierarchy, characters, age tiers, badge ladder, session template, mechanic taxonomy (workhorse/spice), quality bars, voice and copy rules. **Read first for any design task.**
- `references/economy.md` — the full reward economy: XP award table, level curve formula, badge taxonomy, Raccoon Capture Cards, weekly Mission Streaks with shields, cosmetic/narrative unlocks, parent digest loop, tier-by-tier differences, leaderboard policy, and the economy-coherence review questions.
- `references/child-safety.md` — ICO Children's Code obligations mapped to gamification (nudge techniques, breaks, time-limited offers, FOMO, data minimisation for event tracking), the banned-patterns list, and the pre-ship checklist. **Binding, not advisory.**
- `references/implementation.md` — Prisma schema, transactional award service, RULES table, event taxonomy, API contract, Phaser→React→server bridge, celebration payload, anti-tamper stance, and the test checklist.

## Known open items (surface these when relevant, don't resolve silently)

- **DECIDE — curriculum length**: design sessions locked a 20-week, four-phase structure for the 6–10 tier; platform marketing copy says "24 weeks of curriculum". The BUILT product is 20 weeks (all 20 live in prod since 2026-07-11, PR #61) — so the remaining decision is purely whether marketing copy moves to 20 or four bonus weeks get planned. This skill's economy math uses 20 weeks and parameterises the rest.
- **DECIDE — XP display name**: "XP" works for 11–18; the 6–10 tier may want a themed name (e.g., "Hero Points"). One recommendation is in `economy.md`; confirm with the user before it appears in UI copy.
- **DECIDE — cohort/classroom mode**: cooperative cohort goals assume a notion of cohort (school block bookings vs. individual family accounts). Confirm the account model before building cohort mechanics.

# Cyber Explorers — Mission Experience Spec v2 (kid-first rebuild plan)

**Status:** PLAN FOR SIGN-OFF. No code until Asad approves. This is the child-experience contract the runtime must be rebuilt to — the Explorers equivalent of the locked Heroes week template + pilot rules. Curriculum content (map v1) and canon (art doc) are unchanged; this respecifies HOW a mission plays.

**The failure it fixes:** v1 runtime grew engine-first. A 10-year-old meets three overlapping intro screens, a wall of invented words (transmission, intel, fieldwork, checkpoint, incident, debrief), long paragraphs, and screens with competing zones. Verdict: confusing. This spec rebuilds the experience around one question: *what does the child see, know, and do at every moment?*

---

## 1. The Kid Contract (non-negotiable design laws)

1. **One screen, one job, one action.** Every screen has exactly one thing to do. If a screen needs two zones, it's two screens.
2. **The 5-Second Rule.** A 10-year-old landing on any screen can say *what to do right now* within 5 seconds, without reading more than one line. Enforced by the INSTRUCTION STRIP (law 6).
3. **Always answerable, at a glance:** Where am I? What do I do now? How much is left? — answered by the Mission Map (law 5), the instruction strip, and the checklist.
4. **Reading budget.** Bubbles ≤ 15 words, one idea each. A LEARN beat ≤ 6 bubbles (≤ 80 words total). Instructions ≤ 10 words, starting with a verb. Reading age 10: short sentences, no nested clauses, concrete words.
5. **The Mission Map is the spine.** A literal checklist the child returns to after every step: ☐ Skill 1 ☐ Skill 2 ☐ Skill 3 ☐ BOSS ☐ Report. Boxes tick with a stamp as they finish. The map IS the navigation mental model; the thin HUD bar stays as ambient echo.
6. **The Instruction Strip.** One amber line, always the same position (top of the play area), always verb-first: "Tap the 3 clues hiding in this message." It is the only amber text on screen (amber = your move, canon).
7. **One fiction word per screen.** WREN, ARC, the actor codenames, CASE — those carry the fantasy. Everything procedural is plain English (see §3). Flavor terms may appear as small subtitles, never as the primary label.
8. **Kid controls the pace.** Tap-to-continue on all dialogue. Nothing auto-advances; nothing races them (platform canon).
9. **No dead reading screens.** Every screen either asks for a tap within ~10 seconds or is skippable by one.
10. **All existing safety canon holds** (no fail states, retry teaches, full stop, reduced-motion, no emoji).

## 2. The mission flow — screen by screen

**A · MISSION START (one screen — replaces training brief + briefing + transmission trio).**
Top: "MISSION 2 — Too Good To Be True". Center: the Mission Map checklist with today's 3 skills *named in kid words* + BOSS row ("SIREN's Prize Factory") + time chip. WREN's chip speaks ONE hook line (voice + text, ≤ 20 words): "Half your school is about to get scammed. Ready?" One button: **START SKILL 1**. (The old transmission's story beats move into Skill 1's opening dialogue; the old briefing objectives die — the map IS the objectives.)

**B · MAP MOMENT (10-second interstitial, after every completed step).**
Full-screen map: the finished box STAMPS with sound + XP pop lands on it. Next row glows. One button: "NEXT: SKILL 2 — Follow the trail". This is the Heroes-grade rhythm: do → see progress → launch next. Save happens here; leaving mid-mission returns here.

**C · LEARN (per skill).**
Skill header: "SKILL 1 · Read the bait" + plain promise line ("You'll learn why 'free' online usually isn't."). WREN dialogue, kid-budget: ≤ 6 short bubbles, tap-to-continue, then ONE prediction question with 3 tappable answers (bubbles, existing pattern). Right/wrong both get a ≤ 15-word WREN reaction. Then instruction-strip button: **PLAY IT →**.

**D · PLAY (per skill).**
Instruction strip pinned: "Find 3 clues. Tap anything that looks wrong." Focal object (the phone) at ≥ 60% width, single zone — found clues stick ONTO the evidence as flags + a huge 1/3 counter in the strip; the side "analyst log" dies (its 'why' text appears as a WREN toast under the evidence on each find). Misses get one dry hint line. Finish → auto-advance to a WREN "that's all three" beat → **QUICK QUIZ →**.

**E · PROVE (per skill).**
Labeled plainly: "QUICK QUIZ — 2 questions". Chat-style (existing), stamp + XP burst on pass, straight to MAP MOMENT.

**F · BOSS (was: incident).**
Boss card first: SIREN's portrait silhouette + "BOSS: The Prize Factory" + "Use your 3 skills:" (checklist echo) + villain taunt (voice line later). Phases shown as 3 big pips with names ("Find the hub → Cut it → Warn everyone"). Same 3-phase gameplay, each phase opens with its own instruction strip. Victory = phase pips shatter → MAP MOMENT (boss box stamps).

**G · MISSION REPORT (was: debrief).**
"YOU LEARNED:" — the 3 skills, ticked, each with its one-line idea (auto from manifest concepts). Then "YOUR MOVE THIS WEEK" (existing transfer beat, kept big). WREN sign-off (voice). Button: **COLLECT YOUR REWARDS**.

**H · REWARDS (was: case closed).**
Staged ceremony, one thing at a time: villain file opens → portrait DECLASSIFIED reveal → CASE CLOSED stamp slams → XP counts up in brass → clearance progress ticks (1/5 toward CONFIDENTIAL). Full stop: "That's the mission, Operative." No next-mission button (ICO canon); DONE returns to case files.

## 3. Vocabulary table (displayed term → flavor subtitle)

| Old (confusing) | Child sees | Small flavor subtitle |
|---|---|---|
| Transmission / Briefing | MISSION START | ARC SECURE NET |
| Intel | LEARN | with WREN |
| Fieldwork | PLAY | fieldwork |
| Checkpoint | QUICK QUIZ | prove it |
| Incident | BOSS | live case |
| Debrief | MISSION REPORT | — |
| Case closed | REWARDS | case closed |
| Dossier | VILLAIN FILE | dossier |
Kept as-is (fantasy carriers): WREN, ARC, Operative, CASE 00N, actor codenames, clearance names.

## 4. Copy rewrite rules (applies to M01 + M02 manifests)

- Split every long bubble: one idea, ≤ 15 words. The fishing metaphor survives as 4 short bubbles, not 2 paragraphs.
- Every instruction starts with a verb; ≤ 10 words.
- Questions ≤ 20 words; answers ≤ 8 words.
- WREN stays dry, but brevity IS the dryness: "Nobody gives away five hundred of anything." full stop.
- Manifest additions: per-skill `promise` (plain one-liner), per-fieldwork `instruction`, per-mission `hook` (the one Start-screen line), boss `phaseNames[3]`.

## 5. Visual hierarchy laws

Focal object ≥ 60% of content width; text column ≤ 560px; body ≥ 16px; the instruction strip is the ONLY amber text; one CTA per screen (amber, bottom-left of content); map/checklist boxes are BIG (44px+ touch); celebrations land where the child is looking (stamp on the box they just earned, not a corner).

## 6. Acceptance tests (run per screen before any commit)

1. 5-second rule passes (fresh eyes, one line read max).
2. Word budgets pass (§4 counts, enforced literally).
3. Exactly one action zone + one CTA.
4. Map reachable/visible answer to "how much is left."
5. One new fiction word max.
6. All prior canon checks (two-channel feedback, reduced-motion, no emoji, contrast).
7. **The kid test:** playtest with a real 10–13-year-old without helping; any stall > 10 seconds = a spec bug, not a kid problem.

## 7. Build order (after sign-off — each step screenshot-verified against §6)

1. Mission Map + MAP MOMENT interstitials + merged MISSION START (runtime).
2. Vocabulary swap across HUD/scenes (table §3).
3. Copy-budget rewrite of M01 + M02 manifests (+ new manifest fields).
4. PLAY single-zone refactor (log→toasts, instruction strip, big counter).
5. QUIZ/BOSS/REPORT/REWARDS reskins per §2 E–H.
6. Full M02 playthrough verify + before/after screenshots + the kid test.

**DECIDEs for Asad:** (1) displayed word "BOSS" (recommended — every 10-year-old instantly gets the stakes) vs "SHOWDOWN"; (2) "QUICK QUIZ" (recommended — familiar, unscary) vs "PROVE IT"; (3) keep XP name as XP (recommended, canon default).

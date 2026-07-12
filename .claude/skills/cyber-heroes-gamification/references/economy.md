# The Cyber Heroes Reward Economy

All numbers here are **DEFAULT** (recommended, changeable in this file only) unless marked LOCKED. Structure and layer boundaries are design commitments; treat changes to them as design decisions, not tuning.

Evidence anchors used throughout (cite these when the user asks "why"):
- Meta-analyses find small-to-medium positive effects of gamification on cognitive, motivational and behavioural learning outcomes, with the *largest effects in elementary-age children*, and stronger results in competitive-**collaborative** settings than purely competitive ones.
- Younger students respond best to straightforward mechanics, immediate feedback and frequent rewards; adolescents to complexity, goals, and carefully designed social visibility.
- Leaderboards give lower performers negative feedback and social pressure, depressing intrinsic motivation; rewards perceived as *controlling* undermine autonomy (Self-Determination Theory). Design every element to serve competence, autonomy, or relatedness — and check which one before adding it.

---

## Layer 1 — XP and Levels (pace)

**What it is:** one append-only currency. Earned from learning actions only. Never spent, never lost, never expires. Levels derive from lifetime XP via a pure function.

**Display name — DECIDE.** Recommendation: call it **XP** in code and for the 11–18 tier; display as **Hero Points** for the 6–10 tier (same underlying value, tier-conditional label). Confirm with the user before any UI copy ships.

### XP award table (per weekly session, DEFAULT)

| Event | XP | Notes |
|---|---|---|
| Learn beat completed (active interaction) | 5 × 5 beats = 25 | Awarded on interaction, not on video watch |
| Game beat completed | 10 × 5 = 50 | Completion-based, performance-independent |
| Game beat mastery bonus | up to 5 × 5 = 25 | First-try / no-hint; quiet bonus, no failure framing |
| Prove beat correct | 15 × 5 = 75 | Retry allowed; retried success pays 10 (mastery over one-shot) |
| Consolidation completed | 20 | The confidence lap — always achievable |
| Boss Battle phase cleared | 15 × 5 = 75 | Per phase, keeps momentum visible |
| Boss defeated bonus | 25 | The big tick of the week |
| **Weekly session total** | **≈ 250–295** | Design target: a full week ≈ **300 XP** |

Rules of the table:
- **First completion pays full; replays pay 20%** of listed values (revision rewarded, grinding not). Replays never re-trigger badges, cards, or streaks.
- **No XP for**: logging in, time-on-app, watching videos, opening screens, or anything a child could farm without learning.
- **Never subtract XP.** No penalties, no decay. Wrong answers cost nothing but the retry.
- All values live in the `RULES` table in code (`implementation.md`) — a single typed source. If a number appears inline in a route handler, it's a bug.

### Level curve (DEFAULT)

Cumulative XP required to *reach* level n (n ≥ 2): **`25 × (n − 1) × (n + 2)`**, implemented as the pure function in `implementation.md`. Concretely:

- Level 2 at 100 XP → **first level-up lands mid-Session-1** (an early, earned competence win — deliberately fast).
- Each subsequent level costs 50 XP more than the last (100, 150, 200, 250 …).
- A 20-week run at ~300 XP/week ≈ 6,000 XP → **Level 15** at graduation (L15 opens at 5,950; L16 at 6,750). Levels and the badge ladder therefore *feel* aligned without being coupled.

Level-ups are celebrated inline (medium ceremony) and unlock the next cosmetic tier (Layer 4). Levels never gate curriculum content — a child can always continue learning regardless of level.

---

## Layer 2 — Badges (mastery)

**Criteria-referenced only.** A badge certifies a demonstrated behaviour. Never XP-thresholded, never purchasable, never time-limited.

- **Phase badges (LOCKED spine):** Cyber Cadet → Cyber Guardian → Cyber Defender → Certified Cyber Hero. Earned by completing all five weeks of a phase including Boss Battles. Each comes with a **printable certificate** (parent/Ofsted-facing evidence — treat the certificate as a first-class deliverable, designed, not an afterthought).
- **Weekly micro-badge:** the **Case Closed stamp**, one per week, awarded with the boss victory.
- **Behaviour badges (DEFAULT, small set — resist sprawl):** e.g., *Sharp Eyes* (first perfect INSPECT beat), *Comeback Agent* (returned after a 2+ week gap and completed a session — note: this celebrates returning, the opposite of streak-shame), *Helper* (completed a co-op cohort goal contribution). Cap the live set at ~12; a badge wall of 60 grey placeholders is demotivating, and research shows trivial effort-free rewards read as meaningless even to children.
- Badge criteria must be **transparent and stated in advance** in kid language ("Close all 5 cases in Phase 1"), because opaque criteria read as controlling — the SDT failure mode.

---

## Layer 3 — Raccoon Capture Cards (delight + revision)

The collection layer, and quietly the most pedagogically valuable mechanic in the system.

- Defeating a week's Boss Battle awards that week's **Capture Card**: front = the foiled Raccoon in that week's caper costume; back = kid-language summary of **the trick and the defence** ("The Raccoon's trick: emails pretending to be your game. Your move: check with a trusted grown-up before clicking.").
- The **Case File** (sticker-book UI) displays the collection. Browsing it *is* spaced revision of the whole curriculum — design the card backs with the same care as lesson content.
- Card *contents are deterministic* (week N always yields card N). The **reveal presentation varies** — flip animation, character bit, sound sting rotate from the celebration pool. This satisfies the LOCKED "win moments must vary" bar without randomised-value rewards (banned; see child-safety).
- Optional 11–18 extension (DECIDE): foil/holo variants for mastery-condition boss clears — cosmetic prestige only, never gameplay advantage, never random.

---

## Layer 4 — Unlocks: cosmetic and narrative

- **Agent gear:** avatar cosmetics unlocked by level (Layer 1). Pure identity/ownership drive — kids curate, never compete. No purchasable cosmetics (LOCKED).
- **Narrative unlocks:** completing a week unlocks the next episode's teaser; completing a phase unlocks a phase-finale story beat with Adam and Layla. Story is a reward — use it.
- **Certificates:** phase badges generate the printable certificate (Layer 2). Also generate a **parent-shareable digital version** — parents showing it off is your best organic marketing, and it keeps the reward loop family-visible rather than device-private.

---

## Mission Streaks (cross-cutting)

- **Weekly, not daily, for 6–10 (LOCKED principle).** The curriculum is weekly; a daily streak would reward attention, not mastery, and imports loss-aversion pressure onto six-year-olds.
- A week counts toward the streak when its session is completed. Streak state shows as a **shield meter**, framed as protection the child has built — not a fragile chain they might break.
- **Streak Shields:** one automatic shield earned per 4 consecutive weeks (DEFAULT). A missed week consumes a shield silently; the streak holds. Copy: *"Your shield held! The Raccoon couldn't sneak past."*
- **No shield left + missed week:** the streak count pauses — it does **not** reset to zero on screen. Return flow: *"Welcome back, Agent"* + a short **streak-repair quest** (complete this week's session to reforge the shield). Never show broken-chain imagery, sad characters, or the word "lost" to the 6–10 tier.
- 11–18 tier: may **opt in** to a daily *practice* streak (for revision minigames) with the same shield/no-shame mechanics. Off by default.

---

## Leaderboards and social (policy)

- **6–10: no ranked leaderboards, full stop.** Substitute:
  - **Personal bests** ("Your fastest Sort yet!") — self-referenced competition only.
  - **Cooperative cohort goals** ("Together, Cyber Cubs have stopped 1,240 Raccoon capers this month") — collaborative framing is the configuration the meta-analytic evidence favours, and it gives relatedness without comparison.
- **11–18: opt-in only**, pseudonymous handles, **top-slice display** (show top 10 + "your position", never the full ranked tail — protects lower performers from public shame), weekly-reset leagues so no one is permanently buried, and prefer **team-vs-goal** over child-vs-child.
- Cohort mechanics depend on the account model (school block bookings vs family accounts) — **DECIDE** flagged in SKILL.md; confirm before building.

---

## The parent loop

A weekly parent digest (email) closes the motivational circuit outside the app:
- Badge/level progress + this week's Capture Card summary.
- One **"Ask them about…"** conversation starter tied to the week's concept ("Ask them how the Raccoon faked that website").
- Frames screen time as evidenced learning — this is also your Ofsted/parent-evening story.
- Data-minimal: progress summaries only, no behavioural analytics, no per-minute engagement data (see child-safety).

---

## Tier-by-tier summary

| Dimension | Cyber Heroes (6–9) | Cyber Explorers (10–13) |
|---|---|---|
| Reward cadence | Frequent, small, immediate | Chunkier, goal-oriented |
| Mechanics complexity | Simple, one idea per mechanic | Multi-step, stats, quests |
| Streaks | Weekly Mission Streak, shields, no daily | Weekly + opt-in daily practice streak |
| Social | None ranked; co-op cohort goals only | Opt-in pseudonymous leagues, team goals |
| Difficulty | Gentle ramp, consolidation lap | Dynamic difficulty, mastery conditions |
| Copy reading age | ~7 | ~12, drier wit allowed |
| Celebration style | Big, warm, character-led | Sharper, stat-led, still crafted |

---

## Economy-coherence review questions

Run these on any proposed mechanic (yours or anyone else's) *after* the child-safety checklist:

1. **Which layer is this?** If it doesn't fit Layers 1–4 or a cross-cutting system, why does it deserve a new one?
2. **What does it teach or certify?** If the honest answer is "it increases sessions", redesign it.
3. **What happens to the child who's behind?** Every mechanic must have a good answer for the struggling child, not just the thriving one.
4. **Which SDT need does it serve** — competence, autonomy, or relatedness? "None cleanly" is a rejection.
5. **Does it survive the tier table?** A mechanic fine for 11–18 may be banned for 6–10.
6. **Is any value randomised, scarce, time-limited, or purchasable?** Any yes → child-safety review, almost certainly a rejection.
7. **Where do its numbers live?** Must be the RULES table, one place.

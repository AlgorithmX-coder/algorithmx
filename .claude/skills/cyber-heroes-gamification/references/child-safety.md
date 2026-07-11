# Child Safety & ICO Children's Code Constraints

**Binding, not advisory.** Cyber Heroes is a UK service processing children's data, so the ICO's Age Appropriate Design Code ("Children's Code") applies as a statutory code under UK data protection law — and AlgorithmX puts COPPA/GDPR on its public trust strip, which makes these practices marketing claims too. A mechanic that fails this file is not shipped with a caveat; it is redesigned.

There is also a brand-integrity reason beyond compliance: **Cyber Heroes teaches children to recognise online manipulation.** A course about spotting the Raccoon's tricks cannot itself use the Raccoon's tricks. Every dark pattern avoided is curriculum credibility banked.

---

## The Children's Code obligations that touch gamification

1. **Best interests of the child (Standard 1)** is the umbrella test. "Does this mechanic serve the child's learning and wellbeing, or the platform's engagement metrics?" must resolve to the child.

2. **Nudge techniques (Standard 13).** The Code prohibits design features that lead children toward the service's preferred choices against their interests — explicitly including exploiting *unconscious psychological processes* (colour/imagery associations, human affirmation needs) and asymmetric choice presentation (big glowing YES, small grey no). Applied to gamification:
   - No reward-flavoured nudges toward sharing more personal data or lowering privacy settings, ever.
   - No affirmation-need exploitation: no character sadness/disappointment when the child chooses to stop, decline, or log off.
   - **Positive nudges are encouraged**: nudge toward high-privacy defaults, parental controls, and **taking breaks** — the ICO's games guidance specifically recommends checkpoints and natural break points in gameplay. Cyber Heroes' session-end **full-stop screen** is this standard implemented as design.

3. **Time-limited offers, FOMO, and competitions.** ICO guidance for game designers warns against marketing time-limited / one-time-only offers to children and against fear-of-missing-out framings around rewards and competitions, and strongly warns against nudges that encourage poor decision-making. Therefore: no countdown timers on rewards, no "today only" anything, no "last chance", no expiring content used as pressure.

4. **Profiling and defaults.** Profiling for marketing is off by default for children. Gamification telemetry must not become a behavioural-profiling backdoor: events exist to compute awards and show learning progress, not to model or segment children for engagement optimisation.

5. **Data minimisation applied to the events table.** Store what award computation and parent progress reporting require — event type, source id, timestamp, outcome — and nothing speculative. No keystroke/mouse telemetry, no session-length optimisation metrics, no per-child engagement scoring. Define retention: raw events can age out once ledger/badge state is settled (DEFAULT: 12 months), while earned state (XP ledger, badges, cards) persists with the account. Document this in the DPIA — a Children's Code DPIA should exist for the platform, and the gamification system is a section of it.

6. **Transparency, kid-legible.** Reward rules are explained in the same voice as the curriculum ("How do I earn cards? Beat the week's Boss Battle"). If a seven-year-old can't understand why they got a reward, the reward is noise.

---

## Banned patterns (hard list)

Never build, and reject in review:

- **Randomised-value rewards** of any kind for children — loot boxes, mystery values, gacha, prize wheels where outcomes differ in value. (Varying the *presentation* of a deterministic reward is fine and required by the "win moments vary" bar.)
- **Anything purchasable that touches the reward system** — XP, badges, cards, cosmetics, streak repairs, advantage. Stripe is for course access only.
- **Loss mechanics**: XP subtraction, decaying points, badges that can be revoked, streaks that visibly shatter to zero.
- **Guilt and social-pressure copy**: "Adam missed you", "your team is waiting", "everyone else finished".
- **Countdown/scarcity pressure**: timers on claiming rewards, expiring rewards, "only 2 left".
- **Ranked public leaderboards for under-11s**, or any full-tail ranking that shows a child their low position publicly at any age.
- **Appearance/identity comparison**: no mechanics that rank or compare avatars, names, or profiles.
- **Engagement-triggered interruptions**: no push/email to the *child* engineered around lapse moments ("come back!"). Parent digests are the sanctioned channel, and they report learning, not lapses.
- **Autoplay chains**: session end is a full stop. No auto-advance into the next session, no "next episode starts in 5…".
- **Reward-gated privacy or data choices**: never trade rewards for permissions, contact details, marketing consent, or profile completeness.
- **Dark-pattern choice asymmetry**: decline/stop/log-off options styled to be as findable and comfortable as accept/continue.

---

## Age-tier safety notes

- **6–10**: everything above at full strength, plus: no free-text social features inside reward surfaces; celebration audio/visuals exciting but not overstimulating (respect reduced-motion settings; cap flash rates well under photosensitivity thresholds); reading age ~7.
- **11–18**: opt-in social features must be pseudonymous by default with real names never required; leagues follow the top-slice + weekly-reset policy in `economy.md`; any daily practice streak carries the same shield/no-shame mechanics — adolescents are *more* susceptible to social-comparison stress, not less, so visible-failure surfaces stay banned.
- **Age assurance**: tier assignment comes from the account's age band (parent-entered at signup). Never nudge a child toward selecting an older age band, and never pre-select one (explicit Children's Code point).

---

## Accessibility as safety

- All celebration information must be available without sound (captions/visual equivalents) and without colour alone (lime success states need an icon/shape channel too).
- `prefers-reduced-motion` gets a calm celebration variant — same warmth, less kinetics. A child who needs reduced motion still deserves a non-flat win moment.
- Timed elements (ARCADE spice beats) need an untimed or extended-time mode; rewards must be reachable in it.

---

## Pre-ship checklist (run on every new mechanic, reward, or copy change)

1. Best-interests test passes: the honest primary beneficiary is the child's learning.
2. Nothing in it is randomised-value, purchasable, time-limited, scarce, or loss-framed.
3. No copy guilts, shames, compares, or pressures; decline/stop paths are symmetric.
4. The child who is behind, absent, or struggling has a warm path (shields, welcome-back, repair quests, retry-with-reduced-XP).
5. It nudges only toward: privacy, parental involvement, breaks, or learning.
6. Data footprint reviewed: what new events/fields does it store, why, retention set, DPIA section updated.
7. Tier check done (6–10 vs 11–18) — and it is explicitly assigned to tiers, not "both by default".
8. Accessibility pass: reduced motion, no colour-only meaning, no sound-only meaning, timing alternatives.
9. Transparency: a child in the target tier could explain how to earn it.
10. The Raccoon test: **"Is this a trick the Raccoon would use?"** If yes, it does not ship.

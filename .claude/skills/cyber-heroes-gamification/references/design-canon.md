# Cyber Heroes Design Canon

Everything in this file is **LOCKED** unless marked otherwise. It was decided in AlgorithmX design sessions. If a task conflicts with an item here, surface the conflict to the user — do not silently override, and do not silently comply with the conflicting request either. When the user changes a decision, update it *here* so the canon stays single-source.

## Brand hierarchy

- **AlgorithmX** is the parent brand: technology education for every stage of life, ages 6 to adult. Main site speaks as AlgorithmX.
- **Cyber Heroes** is one course/service within it — the flagship children's cybersecurity course, with its own product page at `/cyberheroes`.
- Positioning metrics used in marketing: 24 weeks of curriculum, 20+ interactive cases per week, ages 6 to adult, 100% game-based learning. (See the DECIDE note on curriculum length in SKILL.md — the 6–10 tier design sessions locked a 20-week structure.)
- Trust strip references: BCS, AQA, COPPA, GDPR, Microsoft, Cambridge. Gamification decisions must never undermine these claims — COPPA/GDPR on the trust strip means the reward system's data practices are marketing claims, not just legal fine print.

## Visual identity (for reward/celebration UI)

- Primary accent: cyan `#00e5ff`. Secondary: cosmic violet `#7c5cff`. Tertiary: lime `#7eff97` reserved for **active/success moments only** — which makes lime the natural celebration colour for XP ticks, correct answers, and badge pops.
- Typography direction: Inter (400, letter-spacing -0.03em) for body; Geist Mono SemiBold for eyebrows/labels.
- Aesthetic: futuristic kids' cyber command centre — holographic screens, soft neon cyan/violet, glowing world map. Celebration design should feel like the command centre lighting up, not like a casino.

## Characters

- **Adam and Layla** — the two hero agents. They are the child's teammates, not authority figures. In reward moments they celebrate *with* the child (high-fives, mission-control cheers), never evaluate from above.
- **The Raccoon** — the villain. Comically foiled, never scary. Every scheme is a real internet trick in kid-scale costume. The Raccoon's *visible reaction* to being beaten is a core reward in itself (LOCKED: REVEAL mechanics require a visible Raccoon reaction).
- Character visual consistency is maintained via saved character references (OpenArt / Kling pipeline) — reward-screen art must use the established character designs, never off-model generations.

## Age tiers

- **Cyber Cubs, ages 6–10** — the tier the current curriculum design targets. Simple mechanics, immediate feedback, frequent small rewards, no social comparison, reading age ~7.
- **Cyber Operatives, ages 11–18** — future/parallel tier. Tolerates and benefits from complexity: stats, goals, opt-in social features, progressive difficulty.
- Tier is a first-class property of every gamification decision. `economy.md` has the tier-by-tier table.

## The badge ladder (the progression spine)

Four phases of five weeks each:

| Phase | Weeks | Badge |
|---|---|---|
| 1 | 1–5 | **Cyber Cadet** |
| 2 | 6–10 | **Cyber Guardian** |
| 3 | 11–15 | **Cyber Defender** |
| 4 | 16–20 | **Certified Cyber Hero** |

A phase badge is earned by completing every week in the phase, including each week's Boss Battle. Criteria-referenced — never purchasable, never XP-thresholded.

## The session template

**intro video → 5 × (Learn → Game → Prove) cycles → consolidation → Boss Battle → closing video → reward**

- **Learn beats are active, not passive.** Watching is never a Learn beat; there is always an interaction.
- **Consolidation** is a low-stakes confidence lap before the boss — deliberately easy, warm in tone.
- **Boss Battle**: five phases, 6–8 questions total (trimmed from 10 in review — keep it tight).
- **Reward** closes the session, followed by a full stop. No autoplay into next content.

## Mechanic taxonomy

- **Workhorse patterns** (carry the teaching load): `DECIDE`, `SORT`, `INSPECT`, `REVEAL`, `SELECT`.
- **Spice patterns** (variety and energy): `ARCADE`, `MATCH`, `ORDER`, `SCENE`, `REPAIR`.
- **Hard rule: no mechanic repeats within a single session** — with the explicit sanity clause that the rule must not contort a week that genuinely needs a repeated pattern. If a repeat is genuinely right, say so and flag it.
- **REVEAL discipline**: REVEAL is load-bearing across the curriculum (11+ concept beats). Its effectiveness depends on a mandatory **predict-before-reveal** structure plus a visible Raccoon reaction. A REVEAL without a prediction step is a rendering, not a mechanic — reject it in review.
- **Re-skins must be genuine.** Test: place two weeks side by side; if a parent could mistake one for the other, it fails.

## Quality bars (apply to every reward moment)

- **"Nothing flat, anywhere, ever."** Every celebration has motion, sound, and character presence. A static "+10 XP" toast fails this bar.
- **Win moments must vary.** Celebrations rotate so week 14's boss victory doesn't feel like week 3's. Vary the *form* (animation, character bit, sound sting, card-reveal style) — never the *value* (see child-safety: no randomised-value rewards).
- **Sharpen toward application.** Prove beats (and by extension, the mastery the rewards certify) aim at *application* over *recognition* wherever possible.

## Voice and copy rules for reward surfaces

- Address the child as **"Agent"** (second person). Warm, capable, brisk. **US English** — superseded by user decision, shipped 2026-07-10: the whole course was localized to kid-first US English (~340 strings; Childhelp 1-800-422-4453, 911), and the locked narrator spec is an American-accent Sarah. Product copy follows the narrator.
- Locked phrasing: **"trusted grown-up"** is the consistent term for the password-sharing rule and any adult-involvement copy.
- Adam/Layla celebrate; the Raccoon grumbles. Never sarcasm at the child's expense.
- Banned copy patterns: guilt ("we missed you", "Adam is sad"), FOMO ("last chance!", "don't miss out"), countdown pressure on rewards, streak-shame ("you broke your streak"), comparisons to other named children.
- Return-after-gap copy pattern: *"Welcome back, Agent. The Raccoon's been busy — ready to catch up?"* → offer, don't pressure.

**Example — boss victory copy (6–10):**
> **Case closed, Agent!** You spotted every one of the Raccoon's fake links. Layla's adding the Phishing Caper card to your case file — that's 3 of 5 for the Cyber Cadet badge.

**Example — tamper response (all tiers):**
> Nice try — the Raccoon tried that too. Real heroes earn it. 🦝

## Tech context (so designs land in the real stack)

- Platform: Next.js 16, React 19, TypeScript, Tailwind, Prisma, NextAuth, Stripe; hosted on Vercel; domain algorithmx.co.uk.
- **Corrected against the shipped codebase (2026-07-11):** the Cyber Heroes weekly lessons and all 20 boss battles are **React components** (framer-motion, shared bossArena chrome), not Phaser. Phaser (v4) survives only in one legacy memory-match exercise (`app/components/exercises/Phaser*`). The bridge *principle* still holds — game surfaces emit events, the shell owns celebration UI and the single award path — just read "React exercise components" where this skill says "Phaser scenes".
- Payments exist (Stripe) for course access only. **Gamification and payment must never touch**: no purchasable XP, badges, cards, cosmetics, or advantage of any kind. This is LOCKED and also a child-safety requirement.

## Shipped state (verified against prod, 2026-07-11 — PR #61)

What already exists; design *around* it, don't re-invent it:

- **All 20 weeks live** with bespoke boss battles (W1/W2: five-phase set-pieces; W3–W20: three authored tricks + weak-point questions + charge-release finisher). The "Boss Battle: five phases, 6–8 questions" line in the session template above describes the pre-boss-workstream quiz placeholder — the shipped bosses supersede it.
- **Weekly badge medals** (bespoke art per week) + badge ceremony scene + per-week stickers (3/week) + client-side XP with level-ups already ship in the lesson flow. Flow is LOCKED as: boss → outro video → badge scene → debrief → stickers → completion, full stop.
- **Server-side reward persistence is BUILT but parked** on `feat/reward-server-persistence` (deliberately reverted off main; ship = `migrate:prod` first, then re-merge). The ledger/RULES/idempotency architecture in `implementation.md` is the review standard for that re-merge.
- **Not built yet** (design space this skill owns): phase-badge ladder, Raccoon Capture Cards, Mission Streaks, cosmetic unlocks, parent digest, leaderboard substitutes.

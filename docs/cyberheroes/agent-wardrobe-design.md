# The Agent Wardrobe

**Status: LOCAL TRIAL, 27 October 2026.** Built for the owner to look at and
discuss. Not pushed, not merged, not live.

This is the design that replaced a proposed coin shop. Read "Why not a shop"
first — the reasoning there is what constrains everything below.

---

## Why not a shop

The owner proposed: children earn coins, spend them in a shop on skins. Good
instinct, wrong shape **for this particular course**, for one reason that has
nothing to do with compliance:

**Week 7 is "In-Game Spending: The Gem Bucks Trap."** It teaches six-to-nine
year olds, in these words:

- *"Game coins are really ___"* → **"Real money bought them, so they're real money in a costume"**
- The Raccoon's lie, which the child has to catch: *"Open enough boxes and the rare prize is GUARANTEED, that's just maths!"*
- Week 20 drills it again: a deal says "1 coin each!" and only sells bundles of 40.

The week's badge is **Wallet Guard**. Its three stickers are **Coin Counter**,
**Odds Seer** and **Ask-First Buyer**.

So the course spends a week teaching children that coin shops and skins are how
games take money, and a coin shop would hand them one. The last item on the
child-safety pre-ship checklist is the Raccoon test: *"Is this a trick the
Raccoon would use?"* Week 7's villain **runs a coin shop**. That is not a
technicality; it is the credibility of the product.

Three smaller reasons, each sufficient on its own:

| | |
|---|---|
| **Already decided against** | `economy.md` Layer 4: "No purchasable cosmetics (LOCKED)". Note the ambiguity worth the owner's explicit call: `child-safety.md` qualifies "purchasable" with "Stripe is for course access only", which reads as *real money*; `economy.md` states it flatly. Earned coins are arguably neither. The owner has now ruled against a shop on the curriculum argument, so the ambiguity does not need resolving to proceed. |
| **Two currencies for a six-year-old** | XP is append-only by design (never spent, never lost). Coins would have to be a second currency. The tier table for 6-9 says "simple, one idea per mechanic". |
| **The child who is behind cannot afford it** | A price list creates have and have-not. Comparing avatars is on the banned-patterns list outright. |

**What survives from the idea:** the child choosing, owning and showing off how
their agent looks. That is the autonomy and ownership drive, and it is worth
having. It just does not need a till.

---

## The unlock: it is already drawn

The single fact that makes this cheap. `public/game/characters/wNN/` already
holds **220 sprites** - every week has bespoke Adam, Layla and Raccoon art in
that week's costume, generated, keyed and installed, from the themed-cast
mandate of 2026-09-11. `app/lib/weekCharacters.ts` already names them:

| Week | Outfit | Week | Outfit |
|---|---|---|---|
| 1 | locksmith | 11 | captain |
| 2 | forgeapron | 12 | ranger |
| 3 | detective | 13 | pj |
| 4 | fisher | 14 | scout |
| 5 | artist | 15 | reporter |
| 6 | esports | 16 | inspector |
| 7 | guard | 17 | knight |
| 8 | photographer | 18 | pajama |
| 9 | inspector | 19 | cardigan |
| 10 | rescue | 20 | gradsuit |

**Twenty outfits for Adam and twenty for Layla, at zero art cost.** They are
already in the lesson; they are simply not selectable. The wardrobe does not
commission anything - it surfaces what twenty weeks of production already paid
for.

Verified by hash, not by name: weeks 9 and 16 share the slug `inspector` and
weeks 13/18 are `pj`/`pajama`, but all four files differ, so there are twenty
genuinely distinct looks. The duplicate *names* are a labelling problem - see
DECIDE below.

---

## How it works

### The unlock rule (one sentence a seven-year-old can repeat)

> **Finish a week, and you keep that week's outfit forever.**

That is the whole rule. Completing week 7 unlocks the Wallet Guard kit; the
child wears it because they earned it on the week it belongs to.

**This deviates from a DEFAULT, deliberately.** `economy.md` Layer 4 unlocks
cosmetics *by level*. Week-completion is better here for three reasons, and the
owner should know it is a change:

1. It is **criteria-referenced** - you did the thing - which is the Layer 2
   philosophy and the one the canon says reads as least controlling (SDT).
2. It needs **no second currency and no new number**, so XP stays append-only
   and the 6-9 tier still has one thing going up.
3. It makes the wardrobe a **revision artifact**, the same quiet trick the
   Raccoon Capture Cards pull: the child scrolling their outfits is scrolling
   the curriculum. "That's the one from when I learned about money in games."

Level-based unlocks stay available as a second source later if the owner wants
more items than weeks; they are not needed for twenty.

### Where it lives

- **Choosing happens in `/cyberhq`** - the child's base. A "Your Kit" panel:
  the outfits earned so far, tap to wear. The one surface where a child
  curates rather than plays.
- **Wearing shows in the lesson HUD chip** (top-left, every screen, currently
  `adam-head.png` / `layla-head.png`). This is the ownership loop closing:
  choose in HQ, see it on every screen of every lesson afterwards.

### What the child sees

- **Earned outfits only, plus one quiet teaser.** Not twenty grey placeholders
  - `economy.md` is explicit that "a badge wall of 60 grey placeholders is
  demotivating", and a locked rail is the nearest thing to a price list we
  could accidentally build. One line - *"Finish Week 8 to earn the
  Photographer kit"* - is an invitation. Nineteen padlocks is a taunt.
- **The base look is always there**, from the first minute, before week 1 is
  finished. Nobody starts with nothing.
- **Naming the week on each item**, so the wardrobe reads as a record of work:
  *"Wallet Guard kit - earned Week 7"*.

### What it deliberately does NOT have

No prices. No currency. No timers. No "limited". No rarity tiers. No other
child's wardrobe visible anywhere. No random anything. No way to lose an
outfit once earned.

---

## Child-safety checklist (binding - run in full)

| # | Item | Verdict |
|---|---|---|
| 1 | Best-interests test | **Pass.** Primary beneficiary is the child's sense of ownership over earned work. |
| 2 | Nothing randomised, purchasable, time-limited, scarce, loss-framed | **Pass.** Deterministic, earned, permanent, no currency. |
| 3 | No guilt/shame/compare; symmetric decline paths | **Pass.** No prices, no peers visible, wearing is optional and reversible. |
| 4 | The child who is behind | **Pass.** Base look from minute one; locked items appear as one invitation, not a graveyard. |
| 5 | Nudges only toward privacy / parents / breaks / learning | **Pass.** The only nudge is "finish a week". |
| 6 | Data footprint | **One field** (chosen outfit). Unlocks are *derived* from existing `Progress.completedAt` - nothing new stored. Retention follows the account. DPIA section: one line. |
| 7 | Tier assigned explicitly | **Cyber Heroes 6-9 only.** Explorers has its own art direction; not assigned there. |
| 8 | Accessibility | Outfit identity carried by **name text**, not colour or art alone; selection state has a shape/icon channel; no motion required to use it. |
| 9 | Transparency | "Finish a week, keep that week's outfit." A seven-year-old can say it back. |
| 10 | **The Raccoon test** | **Pass.** The Raccoon's trick is a shop with prices. This has neither. |

---

## Economy coherence

1. **Which layer?** Layer 4 (cosmetic unlocks), which the canon lists as
   designed-but-unbuilt. No new layer invented.
2. **What does it certify?** Week completion - the same fact the Case Closed
   stamp certifies, in a form the child wears rather than files.
3. **The child who is behind?** Covered above - base look, no comparison, no
   cost.
4. **Which SDT need?** **Autonomy** cleanly (free choice among earned items),
   with ownership. Not competence (badges own that), not relatedness.
5. **Survives the tier table?** Yes - "simple, one idea per mechanic" is
   satisfied: one rule, no currency, no math.
6. **Randomised / scarce / time-limited / purchasable?** No to all four.
7. **Where do its numbers live?** It has none. No XP values, no prices, no
   thresholds - the unlock is a boolean derived from `completedAt`. Nothing to
   put in a RULES table, which is itself a sign the mechanic is the right size.

---

## Implementation

### Trial scope (what is built now, locally)

Deliberately **reversible and migration-free**, so the owner can look at it and
we can throw it away cheaply:

- Unlocks **derived** from progress already hydrated on the client - no API, no
  schema change, no migration.
- Selection in **`localStorage`** - per device, good enough to judge the feel.
- HUD chip reads the selection and falls back to the shared head art, using the
  existing `fallbackToShared` onError pattern in `weekCharacters.ts`, so a
  missing file renders exactly as today.

### Production scope (only after the owner says yes)

- `ChildProfile.outfitAdam` / `outfitLayla` (two nullable strings), so the
  choice follows the child across devices like the rest of their progress.
- Server validates the choice against earned weeks on write - the canon's
  server-authoritative rule. A request to wear an unearned kit gets the
  on-theme tamper line: *"Nice try - the Raccoon tried that too."*
- Per-week **head** sprites. The week dirs hold idle/attack/celebrate only; the
  HUD chip wants a head. The trial crops the idle sprite with CSS. Doing it
  properly is 40 images through the OpenArt pipeline - the only real cost in
  this whole design, and worth deciding separately once the owner has seen
  whether the mechanic earns it.

---

## What the trial actually showed (27 October, measured)

Built, built-server, screenshotted at 1414x771 with seven weeks marked complete
on the local database.

**The HQ panel works.** Eight kits render - base plus weeks 1-7 - each showing
Adam and Layla in that week's costume, named, labelled with its week and topic,
and closed by the single invitation (*"Finish Week 8 to earn the Photographer
Vest"*). Shot: `.wardrobe-shots/kit-panel.png`.

**The HUD chip does NOT work, and this is the finding that matters.** The
wiring is correct - read from the DOM, the chip loads
`/game/characters/w07/adam-guard-idle.png`, natural size 496x900 - but the chip
is a 61px circle cropped to the head, and **all twenty costumes share the same
face**. Wearing the Wallet Guard kit looks identical to wearing nothing.

Tested against the costumes most likely to survive the crop: week 4's Angler
(yellow hat) reads *faintly*; week 14's Scout does not read at all. So the
"choose in HQ, see it on every screen" promise - the thing that justifies a
wardrobe over a plain unlock list - does not currently land.

Three ways out, and the owner should pick before this goes further:

| | |
|---|---|
| **Commission 40 head sprites** | ~800 OpenArt credits. Collars, hats and hoods then read at chip size and the promise holds. The honest price of the feature. |
| **Accept HQ-only** | Free. Drop the "everywhere" claim; the wardrobe becomes a room you visit, closer to the Case File. Still worth having, but a weaker ownership loop. |
| **Find a bigger surface** | The briefing and alert screens show both heroes full-body, where a costume reads. But those screens wear *that week's* world, and overriding it with the child's pick would fight the per-week art direction (DECIDE 3). Not recommended. |

**DECIDED, 27 October: ship HQ-only; the HUD wiring is NOT shipped.**

Measuring the files settled it. The shared head sprites are 59 KB and 76 KB;
the full-body week sprites the chip would have to load are 519-630 KB. Wiring
the chip swaps ~135 KB for ~1.07 MB on EVERY lesson screen - an eightfold
increase to display something that is not legible at 61px. The code was
written, measured and reverted rather than shipped.

It comes back the day the 40 head sprites exist, and not before.
**Recommendation: commission the heads, or ship HQ-only and say so.** What
should not happen is shipping the current state and describing it as "wear your
kit everywhere", because measured at the real size, you cannot see it.

A harness note worth keeping: `/api/test/seed` does
`childProfile.deleteMany({ userId })` then `create()`, so **every sign-in
destroys the child profile and cascades away its progress**. Seed progress
*after* signing in, never before - doing it the other way round wipes the rows
and the panel then correctly reports an empty wardrobe, which reads as a bug in
the panel. Cost: one wrong screenshot and twenty minutes.

---

## DECIDE - open questions for the owner

1. **Two outfits called "Inspector"** (weeks 9 and 16) and **"PJ" vs "Pajama"**
   (13 and 18). Fine as internal file slugs, confusing as collectible names in
   a wardrobe. Recommendation: give each a display name tied to its week
   (*"App Inspector"* W9, *"Code Inspector"* W16; *"Sleep Guard"* W13,
   *"Lights Out"* W18) and leave the file slugs alone so no art moves.
2. **Does the Raccoon get a wardrobe too?** The art exists (per-week raccoon
   moods). Recommendation: no. He is the villain; dressing him is a reward for
   him, and the child's identity is the point.
3. **Does the outfit show in the boss battle?** The boss already uses themed
   sprites for *that week*. Letting the child override the week's costume
   during its own boss fight would fight the week's visual world. Recommendation:
   HQ and HUD only; the lesson keeps its own week's look.
4. **Head art**: crop idle (free, slightly off-centre) or commission 40 heads
   (~800 OpenArt credits). Recommendation: ship the trial on crops, decide
   after seeing it.

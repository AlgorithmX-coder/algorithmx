# Cyber Heroes: structural changes register

Raised by the owner during UAT on 15 and 16 October 2026. Everything here is a
change that must land across **all 20 weeks**, or across Cyber HQ, not just in
the week it was spotted in. Week 1 is built first and signed off; the rest
follow week by week against this list.

Nothing here is "done" because the code changed. It is done when it has been
**measured**, and the measurement is named.

---

## Week 1 status

### Done

| # | Change | Proof | PR |
|---|---|---|---|
| A1 | Final consonants no longer cut | **0 of 221** week 1 clips missing one (course-wide 1,020 -> 56) | #565 |
| A2 | Consonant audit in CI, ratcheted per week | build fails if week 1 regresses | #565 |
| A3 | Heavy prose rewritten | heavy lines 16 -> 7; flow audit 0 flags | #565 |
| A4 | Pauses land where the writing puts them | 850ms between "A," and "B" found and removed | #583 |
| A6 | ATLAS briefing on the lesson pause spec | 21 of 28 gaps re-cut, 0 credits | #563 |
| A7 | "Let's go" waits for ATLAS | net armed from playback, not from mount | #583 |
| B1 | Raccoon hosts the quiz from a desk | grounded, tracks his pose width | #580 |
| B2 | `raccoon-defeated` plate edge | bottom-band pale 47.8% -> clean | #562 |
| B3 | Ground shadow under the attack pose | 83.1% -> 1.6% | #562 |
| B4 | Face holes from the white key | 536 punched + 547 feathered, restored | #562 |
| B5/B6 | Win and lose raccoon are one set | lose screen was using the SHARED sprite | #562 |
| B7 | Badge is the week's own | gold/black, cast in costume | #569 |
| B8 | Custom stickers | three, cast in costume, upper body | #567 |
| B11 | Emoji swept where art exists | vault pill, sticker wall, badge case | #567, #571 |
| C1-C4 | Cyber HQ reads one list with the real art | catalogue derived from the weeks; 5 tests | #567 |
| D1 | Buttons are one colour | hue span closed | #559 |
| D2 | How-to-play chips centred | | #576 |
| D3 | Bigger type, still one screen | Learn + Prove-it at zoom 1.00 | #574 |
| D4 | Debrief fits | 876px -> 654px, zoom 0.72 -> 0.96 | #583 |
| D5 | Vault dial leaves when open | | #571 |
| D6 | Frame audit | week 1: 28 screens, 0 flagged | #576 |
| D7 | Hub decommissioned | nothing may route to /hub (test) | #561 |
| - | No em-dashes in child-facing copy | 11 fixed, CI enforces | #570 |
| - | Logout lands on Cyber Heroes | | #575 |

Week 1 at 1414x771: **0 screens overflow, 25 of 30 at full size, lowest zoom
0.82** (was 0.70).

### Left open, deliberately

| # | Item | Why |
|---|---|---|
| B9 | Debrief "You learned" icons | Already bespoke 3D art, not emoji. Owner: leave them. |
| D3 | Recap screens at 0.87-0.90 | Their bulk is a 320px art panel; trimming it is a design call, not a measurement. |
| D4 | Result cards after an exercise | Partly addressed, see below. |

### D8: a finished exercise must not keep a game's worth of height

Owner, 2026-10-16, on the Memory Match result: "look at the bottom of that
card, it's not being filled in. Check this for all of the pages in all of the
weeks."

The pattern: an engine's root fills the stage so the BOARD has room, which is
right while the board is the content. The result is then drawn as an overlay
pinned across that root (`position: absolute; inset: 0`) with its content
centred - so a title, two lines and two buttons inherit a game's height and
float in the middle, with a dead band beneath.

**37 of the 82 engines** contain an `inset: 0` overlay, so this needs checking
one engine at a time; not all of those are result cards.

Fixed so far: **MemoryMatch**. Finished, the board is hidden, the root stops
filling the stage, and the result sits in normal flow, so the card is exactly
as tall as the result.

`audit-result-card-fill.mjs` plays an exercise and measures the dead band under
its result. **Known limitation, stated rather than hidden:** it drives by
clicking plausible targets, which is not enough to finish engines that need
correct answers, pairs or drag-and-drop - on week 1 it finished none of the
five. What it cannot reach, it reports as "could not finish" rather than as a
pass. Until it can drive them, this one is caught by eye.

`resultCardFill.test.ts` holds the shape of the fix where it has been made.

---

## Week 2 status

Brought up to the same standard, prose FIRST this time so nothing was
recorded twice.

| Item | Proof |
|---|---|
| Consonants | **0 of 97** clips missing one |
| Prose | heavy lines **10 -> 2**; flow 0 flags |
| Echoes | **0** (2 found and fixed) |
| Boss read-out | flowing phrasing; drift test passes |
| ATLAS briefing | **21 of 28** gaps re-cut, 0 credits, voiced audio unchanged |
| Sprites | 11 repaired; attack pose was missing 9,232px, Layla's celebrate 8,573 |
| Stickers | 3 bespoke, cast in the forge apron |
| Badge | bronze medal with the cast |
| Layout | **0 of 30** screens overflow, 25 at full size, lowest zoom 0.83 |
| Frame audit | 28 screens, **0 flagged** |
| D8 result cards | does NOT apply: week 2's engines have no stage-filling root |

Week 2 is on the CI ratchet with week 1.

---

## What every other week still needs

Same list, same order, one week at a time. The tools are built; the work per
week is running them and fixing what they report.

**Audio** - A1 is in the generator, so any week re-recorded gets it; add the
week to the CI ratchet in the same PR. A3 prose, A4 pauses and A5 de-chanting
(weeks 7, 8, 9, 12-16) are per week. A6/A7 are per week.

**Art** - B2/B3/B4 run `strip-sprite-ground-shadow.mjs` and
`fill-sprite-key-holes.mjs` over `w{NN}`. B1 and B5/B6 are shared and already
cover all twenty. B7 badge and B8 stickers are per week, 4 images each.

**Cyber HQ** - inherits automatically now, as soon as a week's content carries
`art` paths.

**Layout** - D1, D2, D5, D7 are shared and done. D3 and D4 are per week; run
`audit-card-fill.mjs` and `audit-frame-fit.mjs` for the week first.

---

## The tools

| Script | Answers |
|---|---|
| `audit-consonant-integrity.mjs --weeks=N` | does every clip still say its last letter |
| `audit-pause-placement.mjs --weeks=N` | does every pause sit where the writing put one |
| `elevenlabs-generate-narration.mjs --check` | does every spoken line have a clip |
| `audit-no-em-dashes.mjs` | any em-dash in copy a child reads |
| `audit-card-fill.mjs N` | how much of the stage each card fills |
| `audit-frame-fit.mjs N` | anything past the fold, out of frame, or clipped |
| `audit-narration-flow.mjs --week=N` | do the screens and beats read as one script |
| `qa-server.mjs --build` | serve THIS checkout, and prove it |
| `key-character-art.mjs`, `fill-sprite-key-holes.mjs`, `strip-sprite-ground-shadow.mjs` | get generated art onto a dark ground without defects |

Generator flags worth knowing: `--week=N --force` re-records one week on the
current engine, `--keys` prints the week-to-clip mapping the manifest does not
store, `--keep-raw` leaves the untouched delivery beside the finished clip.

---

## Working rules the owner has set

- ElevenLabs spend is **week by week**, signed off before the next.
- Every fix is proven by measurement before it is called done.
- Images are screenshotted and inspected before install, not after the owner
  finds the defect.
- No em-dashes in user-visible copy.
- One concern, one branch, one PR. CI green means merge.

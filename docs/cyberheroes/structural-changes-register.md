# Cyber Heroes: structural changes register

Raised by the owner during UAT on 15 and 16 October 2026. Everything here is a
change that must land across **all 20 weeks**, or across Cyber HQ, not just in
the week it was spotted in. Week 1 is built first and signed off; the rest
follow week by week against this list.

Nothing on this list is "done" because the code changed. It is done when it has
been **measured**, and the measurement is named in the Proof column.

---

## 1. Audio

| # | Change | Scope | Proof |
|---|---|---|---|
| A1 | Final consonants no longer cut. Two bugs in `shapeToSpec`: `silencedetect` used an ABSOLUTE `-36dB` against takes ranging `-8.2` to `-16.4 dBFS`, and `MIN_SPAN` deleted stop releases as breaths. | Generator, so every clip recorded from now on | `audit-consonant-integrity.mjs` exits 0 |
| A2 | Consonant audit wired into CI | Whole course | CI job fails on a cut consonant |
| A3 | Exercise and boss prose rewritten for punctuation and flow. The Oct 2026 "rescript" changed **419 of 11,312 prose lines (3.7%)**, of which only 112 were exercise copy. The exercises were effectively never rewritten. | 20 weeks, one at a time | `audit-narration-flow.mjs --week=N` reads 0 flags |
| A4 | Pauses land where the writing puts them, inside exercises and boss too ("take a ... closer look", "option ... A") | 20 weeks | `audit-pause-words.mjs` names no unasked-for pause |
| A5 | Stop the chanted openers | Weeks 7, 8, 9, 12, 13, 14, 15, 16 | `audit-stock-phrases.mjs` |
| A6 | ATLAS week-intro briefings scripted and re-recorded. ATLAS has NO shaping stage, so its "Cyber ... Hero" break is punctuation or delivery, not the A1 bug. | 20 intros | listen + pause audit |
| A7 | "Let's go" stays locked until ATLAS stops speaking | 20 intros | timed in a harness |

## 2. Art, themed per week

The raccoon sprites are shared by all 20 weeks (`bossArena.tsx`), so one fix
covers the course. Badges, stickers and costumes are per week.

| # | Change | Scope |
|---|---|---|
| B1 | Raccoon redesigned to belong in the quiz rather than standing beside it | 1 shared set, all 20 weeks |
| B2 | `raccoon-defeated.png` plate edge removed. Measured: 920x920, subject fills the canvas, **47.8% pale pixels in the bottom band** | shared |
| B3 | Ground-shadow line under the attacking raccoon removed | shared |
| B4 | Face defect fixed | shared |
| B5 | Boss lose art ("SO CLOSE!") replaced; it does not suit the moment | shared |
| B6 | Boss win art ("YOU WIN!") redrawn as a matched set with the lose art | shared |
| B7 | Badge scene designed in that week's theme, with Adam, Layla and the raccoon in that week's costume. Week 1 = gold and black, matching the videos and existing art. | 20 badges |
| B8 | Custom stickers replacing the emoji, cast in that week's uniform | **82 stickers** |
| B9 | Debrief "You learned" cards use the new art | 5 per week |
| B10 | Every generated image inspected on magenta before install | every image |
| B11 | No emoji left anywhere once the art exists | course-wide sweep |

## 3. Cyber HQ

Cyber HQ reads `STICKER_CATALOGUE` (`app/lib/stickers-data.ts`) and each week's
`badgeIcon`, so it inherits B7 and B8 only if both data sources move from emoji
to art paths and the renderers switch from text to images.

| # | Change |
|---|---|
| C1 | Badge case: 20 week badges use the new badge art, not emoji |
| C2 | Sticker wall: the new custom stickers |
| C3 | Locked silhouettes restyled to match |
| C4 | `STICKER_CATALOGUE` and `badgeIcon` carry image paths, so lesson and HQ cannot drift apart |

## 4. Layout and shell

| # | Change | Scope |
|---|---|---|
| D1 | Buttons: one hue per gradient, no discolouration at the end | every button (#559) |
| D2 | How-to-play chips centred | every exercise (#560) |
| D3 | Bigger type with the card still on one screen, no scrolling | every card |
| D4 | Sparse cards filled so they do not read as empty | per week |
| D5 | The vault wheel leaves the screen once fully open | week 1, then any engine with the same pattern |
| D6 | Frame audit covers all 560 screens, and a screen that fails to load is reported, not skipped | 20 weeks |
| D7 | Hub decommissioned: no `/hub` page, no tab. Each course login lands straight inside that course's portal. | global |

---

## Working rules the owner has set

- ElevenLabs spend is **week by week**. Week 1 only, signed off, before any other week is recorded.
- Every fix is proven by measurement before it is called done. No assurances.
- Images are screenshotted and inspected before install, not after the owner finds the defect.

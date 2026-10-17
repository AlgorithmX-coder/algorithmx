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

---

## Week 2 UAT intake, 17 October 2026

Owner testing week 2 live. Everything raised is logged here FIRST and fixed
in one pass at the end, rather than one fix per report - that is how week 1
ended up re-recording nine blocks twice.

Every item here then becomes a numbered check in the list below, because the
owner's rule is that a fault found in one week is a fault to look for in all
twenty BEFORE they test it. The point of this file is that the twentieth week
should arrive with nothing left to find.

### Which weeks each item goes to

The owner's instruction, 17 October: "all of them are going to go through
them, all the weeks. And even week one as well... Otherwise, there are some
changes that are specific to week two only. So just know which ones they are
as well."

So the column that matters is the last one. ALL WEEKS means every week gets
swept for it before the owner tests it, week 1 included, because week 1 was
signed off before most of these were known.

| # | Issue | Lives in | Goes to |
|---|---|---|---|
| W2-1 | Ragged last row leaves an empty cell | RevealBoard + every grid | ALL WEEKS |
| W2-2 | Icons sliced by their container | the 92 shared icons | ALL WEEKS |
| W2-3 | Up-next pill repeats the spoken bridge | ConceptRecap | ALL WEEKS (42 recaps, 14 weeks) |
| W2-4 | Scroll bar on a screen that fits | LessonStage | ALL WEEKS |
| W2-5 | A year read digit by digit | the narration generator | ALL WEEKS (25 strings; week 1 has 9) |
| W2-6 | A hint covering live gameplay | every pinned overlay | ALL WEEKS |
| W2-7 | Blaster screen + Hero Vault look dated | SpamBlaster | weeks 2, 3, 4 only |
| W2-8 | The same counter three times | SpamBlaster | weeks 2, 3, 4 only |
| W2-9 | Packets too fast, subject truncated | SpamBlaster | weeks 2, 3, 4 only |
| W2-10 | Lectern dots mean nothing | QuizBoss | ALL WEEKS (all 20 bosses) |
| W2-11 | A stock phrase said twice in one question | boss copy + the echo audit | ALL WEEKS (all 20 bosses) |
| W2-13 | The choir is wrong for children | the celebration audio | ALL WEEKS - HELD, see below |
| W2-17 | The closing four screens are one themed suite | 4 components + weekThemes | ALL WEEKS |

### Where each item stands, end of 17 October

Every item raised in the week 2 pass is now closed. Nothing is outstanding
for the owner's re-test.

| # | State | Note |
|---|---|---|
| W2-1 | DONE | short last row centres; measured 122px either side |
| W2-2 | DONE | all 86 icons given a 6% margin; --check in CI |
| W2-3 | DONE | pill kept, duplicate PRINT dropped; no audio changed |
| W2-4 | DONE | the glow was 50px over on every screen; 0px now, weeks 1/7/14/20 too |
| W2-5 | DONE | 7 clips re-recorded; printed text unchanged |
| W2-6 | DONE | the game holds while the hint is up |
| W2-7 | DONE | vault rebuilt as a device, arena rebuilt for depth |
| W2-8 | DONE | third counter removed |
| W2-9 | DONE | full subject wraps onto two lines; pace eased on all four fronts |
| W2-10 | DONE | one lamp per real question, three states |
| W2-11 | DONE | ask reworded; curated audit, 4 left in weeks 18-20 |
| W2-12 | DONE | Mission Report rebuilt, keeps the per-concept breakdown |
| W2-13 | DECIDED | owner: leave it, revisit after the re-test |
| W2-17 | DONE | closing four screens share one palette, themed per week |

Still open elsewhere, NOT week 2, and carried to the per-week sweep:

- 4 framing echoes in weeks 18, 19 and 20.
- 26 consonant failures across the weeks not yet brought up to standard.
- The "ALERT INCOMING" opener overflows the PAGE in weeks 7, 14 and 20
  (53px, 116px, 158px). Different cause from W2-4, which was the stage.

### Corrections found while fixing, 17 October

Two of the scopes above were wrong, and both corrections matter.

SPAMBLASTER IS WEEK 2 ONLY. W2-7, W2-8 and W2-9 were logged as weeks 2, 3
and 4 because those three week files all mention `spamBlaster`. Weeks 3 and 4
only name it in an engine-reuse COMMENT; the only `type: "spamBlaster"` in
the course is week 2's. So these three are the week-2-only work the owner
asked to have identified.

THE TRUNCATION WAS NOT OCCASIONAL. W2-9 recorded that the subject line was
cut off. Measured: week 2's subjects run to a median of 37 characters and a
longest of 44, against a card that fits about 26. NINE of its eleven cards
were drawn truncated. A child was judging nine of eleven messages they were
not shown.

### Two bugs found underneath, neither reported and neither new

THE SHAPER COULD NOT RUN AT ALL. `silence` and `CONSONANT_MAX` were sitting
INSIDE a block comment - its closing marker was two lines below them instead
of above - so both were commented out, and shapeToSpec threw ReferenceError
the moment it was called. It only runs on a NEWLY RECORDED clip, and every
cached clip skips it, so the entire course could be regenerated from cache
with CI green while recording one new line was impossible. Found on the first
new recording since it landed.

Worth keeping in mind for the weeks still to come: every re-record from here
would have failed the same way.

THE CONSONANT AUDIT MIS-READ STOPS. Its tail measurement is calibrated for a
fricative, which sits under the speech floor. A /t/, /k/ or /p/ is a
near-silent closure then a LOUD burst, so the scan landed after the burst and
measured only the decay behind it. It called week 2's "Brilliant!" a 60ms cut;
the raw take measured the same 60ms, so nothing had been trimmed, and the
frames before it read 0.4, 3.7, 7.2, 9.4, 9.2, 6.7, 4.5 percent, which is a
textbook release. It now also looks for that shape, and can only pass a clip
where there is positive evidence a consonant was spoken.

That moved a safety net, so the numbers: course-wide failures 56 -> 26, weeks
1 and 2 clean either way, and of the clips it rescues 14 end in a stop and 9
in a cluster containing one, against 79 fricatives that still fail. Worth an
ear on a couple before it is trusted further.

W2-12, W2-14, W2-15 and W2-16 are folded into W2-17 and are not tracked
separately; they were the four screens of the closing sequence reported one at
a time before the owner tied them together.

Week-2-only work: there is none at the mechanism level. Every item above is
engine, generator or shared-component. What IS week 2 specific is the COPY
that each shared fix lands on - week 2's own "not sure" line, its eleven
usernames, its five-item reveal board. The fix is global; the text is local.

HELD, needs an owner decision: W2-13 reverses a standing owner mandate that
all boss music is a-cappella voices only. Not built until the owner confirms.

### W2-1 - the empty cell at the bottom of a card

Owner, screen 4 (The Raccoon's Wish List): "this empty card at the bottom.
Why wasn't this fixed? Or why wasn't it picked up in the checks?"

RevealBoard lays its items out as `repeat(gridCols, minmax(0, 1fr))`. Week 2
gives it FIVE items across THREE columns, so the second row holds two and the
third cell is a hole the width of a card, inside the board, with the count
line sitting under it.

Why no check caught it: the two fill audits both measure a WHOLE BOX against
the one around it. `audit-card-fill.mjs` asks whether the card fills the
stage, and this card does. `audit-result-card-fill.mjs` asks whether a
FINISHED result fills its card, and this is a board at rest. Neither looks
INSIDE a card at how its own items are distributed, so a grid whose last row
is half empty passes both while reading, to a child, as a missing card.

That is the real gap: a container can be full and its contents still ragged.
The check this needs is a new one - every grid inside a card either fills its
last row or picks a column count its item count divides into.

### W2-2 - icons sliced by the box they sit in

Owner: "All emojis need to look full and complete. As you can see, this eye is
cut off. We need to go through all of the weeks and make sure that the emojis
are being generated correctly and full with no issues."

The ASSET is sound - `eye.png` renders as a whole round eye on a magenta
plate. What is wrong is downstream: the icon is clipped where it is drawn.

The reason it is so easy to clip, and why this will not be a one-icon fix:
every icon is TRIMMED to its ink, so 86 of the 92 touch the canvas edge by
design. A trimmed circle meets its top edge at a tangent with nothing to
spare, so a parent that is a pixel short, or that sets `overflow: hidden`
and a fixed height, takes a flat slice straight off the artwork - and the
result still looks deliberate, which is why it survived review.

Edge contact alone does not prove damage, so the sweep cannot just re-measure
the files. Two things are needed: a transparent margin baked into the icons so
tangency can never reach a clipping edge, and a rendered pass across all 20
weeks that compares each icon's drawn box against its container's clip box.

### W2-3 - the recap says "next" twice

Owner, on the Concept 1 recap: "said next, next, twice. Why did it do that? We
should have absolutely checked these kind of things."

The recap carries a `next` field, which prints as the pill "Up next: what's
fine to share and what stays locked away". The last spoken line is "Next,
we'll learn what's fine to share and what stays locked away. Come and see!"
The narration panel PRINTS its lines as well as speaking them, so the same
clause sits on the screen twice, about two inches apart, with the word "next"
opening both.

Measured across the course: of 100 recaps carrying a pill, 42 restate it word
for word, in fourteen weeks (3, 4, 7, 8, 9, 17, 18, 19 and 20 have three or
more each). So this is not a week 2 slip, it is how the recap was built.

Why no check caught it: every echo check so far compares like with like.
`audit-narration-flow.mjs` compares one screen's closing line against the
next screen's opener; `audit-echoed-lines.mjs` compares a boss villain line
against the verdict beside it. Both are spoken-against-spoken. Nothing ever
compared a screen's PRINTED chrome against the narration on that same screen,
which is the one pairing a child actually takes in at a glance.

Worth saying plainly, because it decides the fix: the spoken bridge is not a
mistake. The build standard requires a recap to name the next concept out loud
("Next, we'll learn how X. Come and see!") so the following Learn can open by
naming X. The duplication is the printed pill repeating what is already being
said. The resolution is therefore at the pill, not the script, and it is one
change applied to all fourteen weeks rather than 42 separate rewrites.

### W2-4 - no scroll bar when the card already fits

Owner, on Power 3 of 5 (Why Are They Asking?): "when the card fits into the
actual screen, there's no reason to have a scroll bar. Do you agree? If so,
this is something that we can push across all of the weeks."

Agreed, and it becomes a rule: a screen whose content fits the stage must not
offer a scroll bar at all. A bar on a screen that fits tells a child there is
something below worth reaching, and there is nothing there.

What makes this one awkward, and worth writing down rather than quietly
fixing: the obvious cause is already fixed. `<main>` reserves the HUD above
the stage and `LESSON_BOTTOM_PAD` below it, and the stage's `minHeight`
subtracts BOTH - a fix made for this very symptom when a tester reported it on
W17 2a. The comment in LessonStage spells the arithmetic out. So the page is
no longer taller than the window by construction, and yet the bar is back on a
screen with clear air above and below the card.

That means there is a SECOND cause, and reading the stylesheet again will not
find it - the stylesheet is what says it cannot happen. It has to be measured
in a browser: which element actually overflows, and whether the bar belongs to
the window or to the stage's own `overflowY: auto`. The track in the owner's
screenshot starts below the HUD, which points at the stage rather than the
window, so the stage believes its content does not fit while the card visibly
does. The decorative glow is a standing suspect - it is 600px tall, absolutely
placed, and has already once been measured as if it were content.

One caveat for whoever measures it: the owner's screenshot carries Edge's
"controlled by automated test software" banner, which takes about 56px off the
viewport. The fit has to be confirmed both with and without it, because a
screen that only fits when that banner is absent is still broken for a tester.

The check this needs: for every screen of every week, assert that the stage's
scroll height does not exceed its client height. That is a different question
from `audit-card-fill.mjs`, which asks whether the card fills the stage; a
card can fill its stage and the stage still overflow by a few pixels.

### W2-5 - say the year, do not spell it out

Owner, on Power 4 of 5 (Your Secret Identity): "it said Emma 2 0 1 7 instead
of pronouncing the year... if it's a year pronunciation, then say 2017,
instead of separate numbers. Again, this is something that we can push across
all weeks."

The narration line is "emma2017? The Raccoon reads that like a name tag!" The
text goes to the voice exactly as written, there is no pronunciation layer in
the generator at all, and four digits glued to a name come back as four
digits.

Across the course: 826 strings carry a run of two or more digits, and 25 of
those read as a year, in weeks 1, 2, 15, 17 and 20. Week 2 alone has eleven,
because the whole concept is built on usernames.

Two things make this more than a find-and-replace, and both have to hold:

The printed word must not change. "emma2017" is the example a child is looking
at; it has to stay spelled that way on screen while only the SPOKEN form
becomes "emma twenty seventeen". The generator currently has one text for both,
so this is a new spoken-only transform rather than an edit to the week files.

Digits are not always a year, and the wrong rule would make things worse. In
week 1 "123456" and "12345678" are bad passwords, and reading those digit by
digit is RIGHT - turning them into words would destroy the point of the line.
In week 15 "nearly 2000 years ago" is a quantity and wants "two thousand", not
"twenty hundred". So the transform applies to a year in a date sense, including
one glued to a name, and leaves a counted number and a digit string alone.

Cost note: changing the spoken text changes the clip hash, so every line this
touches is re-recorded. It is 25 strings at most, not a course re-record.

### W2-6 - a hint must never cover the board

Owner, on the Grab-Bag Blaster: "The bigger hint is blocking the screen."

`SpamBlaster.tsx:1456` pins the hint panel `position: absolute; left: 12;
right: 12; bottom: 12; zIndex: 10`, which is exactly where the Hero Vault
device sits. The hint arrives because the child is struggling, and it lands on
top of the thing they are being asked to look at. The grabs keep flying while
it is up, so the help actively costs them the round.

This is the rule to push everywhere, not just here: a hint, a coach banner or
a result overlay may use space the board is not using, but it must never cover
live gameplay. Either the board makes room for it, or it sits outside the
play area.

Needs a sweep of every absolutely-placed overlay in every engine, not just
this one, because any panel pinned to an edge with a z-index is the same bug
waiting for the right board.

### W2-7 - the Blaster's screen and the Hero Vault

**DONE 17 October.**

THE VAULT was a fake app window: a bezel, a title bar with three
traffic-light dots, three "message rows" drawn as grey placeholder stripes,
and a footer status bar. A 2010 screenshot of a mail client, and none of it
carried information - the stripes stood in for messages a child never reads.

It is a DEVICE now. A glass shell with a lit aperture at the top where
packets actually land (they used to simply vanish into a rectangle), a
segmented capacity meter with one segment per treasure that can be kept safe,
an under-glow pool so it stands on the floor, and feet. The breach line only
appears when something has got through, so a clean run shows a clean device
instead of a permanent status bar. Everything drawn now means something.

THE ARENA was four effects at one brightness: a flat radial wash, a field of
drifting 1s and 0s, a wire grid of straight lines meeting at a point, and two
expanding rings. None described the space, and the binary rain competed with
the only thing the child has to read.

It draws depth quietly now: sky above a horizon and floor below it, a bloom
centred on the vault so the vault is the brightest thing on the board, floor
lines that FADE with distance rather than all drawing at one alpha, soft
motes in place of the binary, and one slow ring instead of two racing ones.
Everything is deliberately dimmer than a packet card, because the card is the
content.

FOUND WHILE VERIFYING: a packet could spawn with its top edge at y=21, across
the goal headline at y=56 - visible on the first frame captured. The taller
card from W2-9 made it worse, since the half-height grew with it. The spawn
lane is now derived from the real geometry (below the headline, above the
vault) instead of the literal 60 it used before, with 10px clearance each
side.

Original note follows.

---



Owner: "the TV behind it, we could do a better job of creating it. The Hero
Vault, I think we can make it look much cooler. And much more modern."

Two surfaces, one piece of chrome: the arena the packets fly through, and the
device panel they land in. Both are plain flat boxes with a wire grid, and
they date the whole screen next to the art everywhere else in the course.

Scope: the engine is `spamBlaster`, used by weeks 2, 3 and 4, so one
redesign covers three weeks. Week 2 calls the device a Hero Vault, so the
chrome has to be themeable rather than week 2 specific - weeks 3 and 4 name it
something else.

### W2-8 - the same counter three times (my observation, not reported)

Not raised by the owner; logged because it is the same fault as W2-3 and the
sweep should catch it. On this one screen "KEPT SAFE 2/5" appears in the top
right, again in the middle above the vault, and a third time on the vault's
own display. One of the three is the real readout; the other two are noise on
a board a child is trying to read at speed.

### W2-9 - slow it down and let the message be read

Owner: "the messages are coming in too quick and you can't see them all as
well, so you struggle to read. So maybe slow them down and make it clear on
the message on what it's saying so they can see it And to have a bit more time
to decide."

Four mechanisms stack up, and all four have to give:

`speedForIndex` ramps 0.75, then 1, then 1.4, then 1.8 - by the eighth
packet they travel 2.4 times as fast as the opening one.

`maxParallel` ramps 1, then 2, then 3, so three packets share the screen at
once. That is the overlap in the screenshot, where "Dad - Pizza for dinner
tonig..." is sitting under "...nder - Share your location so...", and neither
can be read.

The spawn gap is a flat 2500ms no matter how fast the packets are moving, so
as speed rises the distance between them closes and they bunch.

Week 2 authors ELEVEN emails, so the child spends the last four of them at
full speed with three on screen at once.

Separately, and worse than the speed: `SpamBlaster.tsx:865` truncates the
subject with an ellipsis to make it fit the card. "Use your REAL NAME a..." is
the whole basis of the decision, and the child is asked to judge a message
they are not shown. No amount of slowing down fixes that one; the card has to
fit its text, or the text has to be authored to fit the card.

Worth noting the lever already exists: `comfortRef` halves the speed and
caps parallel packets at one. It is not the default. Whatever the new numbers
are, reading time should scale with how long the subject actually is, rather
than every packet getting the same flight regardless.

This also runs against the kid-first contract in the week-builder standard,
which says in as many words that nothing races the child. An exercise that
ramps to 1.8 with three overlapping cards races them.

### W2-10 - the raccoon's lectern dots should mean something

Owner: "the bottom right, where the raccoon is, the dots, I think there should
be five dots, just how many questions they are. And they should have like a
green tick or an X cross if they got it wrong. I think it's just good
encouragement. And this could be done across all the weeks."

Today they are pure ornament. `QuizBoss.tsx:794` draws `[0, 1, 2, 3]` -
four hard-coded dots with the second one permanently lit, there to stop the
desk reading as a plain block. The quiz has five questions, which is why the
count looks wrong: nothing ever connected the two.

The change is to drive the row off `quiz.questions.length` rather than a
literal, and give each dot three states: not yet reached, answered right,
answered wrong. Driving it off the real length matters because the count must
not be hard-coded to five either - it has to be whatever that week's boss
actually asks.

Not a duplicate of the counter above it, and worth saying why, since W2-3 and
W2-8 are both about the same thing being said twice. The header reads
"QUESTION 1/5 - CORRECT 0/4 TO PASS", which is a running tally. The dots would
show WHICH questions went which way. Different information, so both can stay.

One thing to weigh when building it: the child-safety checklist rules out
guilt and pressure, and a red cross sitting on screen for the rest of the
fight is the one part of this that could read that way. The owner's intent is
encouragement, so the wrong-state wants to be matter-of-fact rather than
punishing - and it should never be the loudest thing on the lectern.

### W2-11 - "not sure" twice in the final boss question

Owner: "In the last screen, or the last question, of the quiz, it said, if you
are not sure twice, again, all of these duplications need to be addressed."

Found it. Week 2's fifth and final boss question, `quiz-w2-c5-1`:

  ask   : "...and he's NOT SURE if it's safe to answer. What's the hero move?"
  teach : "...When you are NOT SURE, hit pause. Then call your backup..."

Why `audit-echoed-lines.mjs` was blind to it, precisely: it needs THREE
shared CONTENT words, and it drops stop words first. "not" is a stop word, so
"not sure" collapses to "sure" - one content word, nowhere near the bar. The
threshold was tuned on week 1's real echo, "capitals, numbers and symbols",
and a long repeated list is the only shape it can hear.

That assumption is the bug. A child does not get stop words for free. "not
sure" is one idea, said twice, and it is as audible as a three-word list.

A warning for whoever fixes the audit, because the obvious fix is wrong:
dropping the threshold to two words flags 40 of the 100 boss questions, and
most of those are CORRECT. When week 19's teach line repeats "card number",
or week 20's repeats "name your school", it is naming what was at stake,
which is the whole job of a teach line. The repetition that grates is the
FRAMING, not the subject - "not sure", "after all", "extra care", "speak up",
"keep it secret". So the check wants a curated list of stock framing phrases
that may not appear twice on one screen, while the subject noun stays free to
repeat. A blunt two-word rule would bury the real finding in 40 false ones.

### W2-12 - the Mission Report is dull

Owner: "make this mission report look better. It looks very boring. Again,
this could be pushed across all weeks."

`QuizBoss.tsx:1145`. A mono-type header over five rows of tick, label,
score. It is a terminal readout at the single proudest moment in the week,
sitting under a 3D raccoon and a glowing YOU WIN.

One redesign covers everything: all 20 bosses render through this one
component. It can also take the week's accent, which it already receives.

Worth keeping when it is rebuilt: the per-concept breakdown is genuinely good.
A child can see WHICH power they dropped, named - "SECRET IDENTITY 0/1" - and
that is the part worth making beautiful rather than replacing.

### W2-13 - the choir on the badge screen

**DECIDED 17 October: left as it is, revisit after the week 2 re-test.**

Identified first, since it was never confirmed which sound it was. The badge
screen plays `badge-earned.mp3` (1.54s) and the win screen just before it
plays `victory.mp3` (2.27s), so the owner is hearing about 3.8 seconds of
a-cappella vocal back to back. `bgm-victory.mp3` (11.4s) is NOT in
BGM_ALLOWLIST and never plays at all, so it was never a candidate.

Both stings are a-cappella because that is the owner's own standing mandate
for boss audio, which is why this was put to them rather than changed. Their
call: hear the week with everything else fixed first, then decide. Nothing
spent on new audio until then.

Original note follows.

---



Owner: "it has like this choir singing Cyberheroes. I'm not sure if I like it.
Maybe we should have something else. That's more like less from the choir and
more suited for kids."

The screen fires `badgeEarnedCelebration()`, which plays `badge-earned`
(`/audio/sfx/badge-earned.mp3`, 24KB) plus confetti. Two neighbours could be
bleeding in from the win screen just before it: `victory.mp3` (37KB) and
`bgm-victory.mp3` (182KB, the long one and the likeliest choir). Which one
the owner is actually hearing has to be settled by listening to all three
against the real sequence, not by reading the code - the badge sting is only
about a second and a half, which is short for what was described.

DECISION NEEDED before this is built, because it reverses a locked rule. The
build standard records an owner mandate that all boss music is a-cappella,
voices only and very faint. The choir is not an accident, it is that rule
being followed. Replacing it with something instrumental and playful is a
reasonable change of mind, but it should be made knowingly rather than
quietly undone, and it will want new audio rather than a volume tweak.

### W2-14 - theme the badge screen per week

Owner: "we could potentially design this screen better, like the square within
it, we can design it according to the theme of the week... it can be done
according to the theme of that week."

Agreed, and it is cheaper than it looks, because the data already exists.
`weekThemes.ts` gives every week a `deepBg`, `bgGradient`, `glow`,
`frameBg`, `accent` and a set of ambience glows, and the lesson already
reads it. The completion screen simply never asked for it, so twenty weeks all
finish on the same purple card.

One constraint carried over from that file, and it must hold here too: a theme
only ever changes NEUTRAL chrome. Green stays correct, red stays wrong, gold
stays reward. So the frame, ground and glow take the week's colour while the
badge, the XP figure and the accuracy readout keep their own meaning.

### W2-15 - the Mission Debrief cards

Owner: "Again same for these. Design them better. and we can push them across
the weeks... Maybe according to the week."

`MissionDebrief.tsx`. Five "YOU LEARNED" cards in a row, each a flat
gradient panel with an icon, a title and three lines of body.

Two things to carry into the redesign, both learned the hard way on this
screen:

It is currently SQUEEZED. On 16 October the grid went from `minmax(220px)`
to `minmax(165px)`, padding from 20/18 to 15/11 and the icon from 44 to 36,
purely to get five cards onto one row at the owner's 1414x771 - it was 876px
tall and zooming to 0.72. So "plain" is partly the fit fix showing. A redesign
that makes the cards handsome again has to solve BOTH at once; anything that
buys beauty with height puts the zoom straight back.

Each card carries its OWN `accent`, which is where the rainbow comes from -
cyan, green, gold, pink, purple - so five weeks' worth of palettes appear on
one screen regardless of which week it is. That is the part the owner means by
"according to the week": the row should read as week 2's world, with the five
cards distinguished within that palette rather than by five unrelated hues.

Same constraint as W2-14 applies: theme the chrome, never the meaning.

Note the icons on this screen are PixIcons, so W2-2 covers them here too, and
the owner's earlier instruction to leave the debrief ICONS as they are still
stands - this item is the cards around them.

### W2-16 - the Stickers Unlocked screen

Owner: "Same with that."

`StickerUnlock.tsx`. Three gold-bordered boxes, each with a pale cone of
light hanging above it that does not belong to anything, and a yellow "ALL 3
STICKERS EARNED" tag sitting off to the left on its own.

The sticker ART is the good part of this screen and is not in scope - those
are the bespoke Adam and Layla pieces made for week 2, and they are the
reward. What dates it is everything around them: a flat box, a hard gold
rule, and gold again on the tag, on a week whose world is teal and amber.

So the same treatment as W2-15 and W2-14, and the three should be designed as
one family rather than three separate passes - a child meets the debrief, the
stickers and the badge screen back to back within about a minute, and right
now each one looks like it came from a different product.

Theme the chrome, never the meaning: gold is the reward colour and stays
gold on the sticker itself.

### W2-17 - the closing sequence is ONE design job, themed per week

Owner, on the Week Complete screen: "and this one. So the last two, three
screenshots that I've sent, maybe set up a theme with them. Because they
always end up at the end of the week. So maybe have them all designed
according to that week."

This is the instruction that ties W2-12, W2-14, W2-15 and W2-16 together, and
it changes them from four jobs into one. Every week ends with the same four
screens in the same order, inside about a minute:

  1. boss Mission Report      QuizBoss.tsx:1145
  2. Mission Debrief          MissionDebrief.tsx
  3. Stickers Unlocked        StickerUnlock.tsx
  4. Badge / Week Complete    DynamicLesson.tsx:4722

Four components, written at four different times, which is exactly why they
look like four different products: a mono terminal readout, a rainbow card
row, gold boxes under floating light cones, and a purple card. A child sees
all four back to back and the week ends on a stylistic shrug.

So this is designed ONCE as a closing suite - shared frame, shared rhythm,
shared typography - and then takes its colour from `weekThemes.ts`, which
already carries a palette for every week and which none of these four screens
currently reads. Twenty weeks of distinct endings for the cost of one design
plus a lookup.

Doing it as four separate passes would be the expensive mistake here: four
tasteful screens that still do not match are no better than four plain ones.

Standing constraint, from `weekThemes.ts` and repeated on every item above:
a theme only ever changes NEUTRAL chrome. Green stays correct, red stays
wrong, gold stays reward. The badge art, the sticker art and the XP figure
keep their own meaning in every week.

---

## WHEN A FIX CREATES A NEW PROBLEM

Owner, 17 October, after a fix put a man's voice into week 2: "make sure that
they don't create new issues. I don't know what procedures you have to put in
place in order to achieve that."

Two fixes in the week 2 round broke something else. Both failed the same way,
and the rule below comes from what they had in common.

### What actually went wrong, twice

**The year fix put a robot voice on week 2.** The pronunciation was applied to
the text stored in the MANIFEST as well as the text sent to the model. The app
finds a clip by matching that stored text against the lines exactly as
written, so the match failed, and InfoNarration fell back to the browser's
speech synthesis - "Microsoft David" on Windows. The recordings were always
Emma and always fine; they measured 184-219 Hz throughout.

**The success sting rang.** QuickCheck played correct.mp3 directly and then
called a helper that plays it again on the very next line. Two copies of a
one-second sample milliseconds apart comb-filter into a metallic ring, and it
landed immediately before a quiet spoken verdict.

### The one thing both had in common

In each case a value is shared by TWO systems, and the change was verified on
one side only.

  the year      generator writes it  /  the app reads it
  the sting     the engine plays it  /  the helper plays it too

Nothing was individually wrong. The generator produced a valid file with a
valid hash, and both sound calls were correct calls. What was wrong was the
RELATIONSHIP, and no type checker, test or existing audit had an opinion
about that.

### So, before shipping any fix

**1. Name the other side.** Ask out loud: who else reads this value, plays
this sound, computes this key? If the answer is "something else does", the
fix is not done until that side is checked too.

**2. Verify the way the CONSUMER does it, not the way the producer does.**
The generator's --check asked "does every block have a FILE", keyed by hash,
and passed happily while the app could not find a single one of them. A check
written from the producer's point of view will keep agreeing with the
producer. The audit that caught it does exactly what the runtime does and
nothing else.

**3. Prove the guard FAILS on the bug.** A new audit that passes proves
nothing. Run it against the broken state and watch it report the fault, then
against the fixed state. Both of this round's guards were proved this way:
audit-manifest-lookup against the manifest then on production, and
audit-double-sound by putting the duplicate back.

**4. Expect the first version of a guard to be wrong.** audit-double-sound
reported the fix as the bug, twice, because it did not understand an else
branch. A guard that has never produced a false positive has probably never
been tested.

**5. Search for the whole class, not the reported instance.** The owner
reported one screen. The sting was doubled in five places, and only two were
found by reading; the audit found the rest. Fixing the reported one and
stopping would have earned another report.

**6. Re-run everything, not the thing you changed.** The full sweep is cheap:
179 unit tests, tsc, and the gates below. Both regressions this round would
have been caught by a gate that did not exist yet, which is why a new gate is
part of the fix rather than a follow-up.

### The gates, and what each one actually asks

| Gate | The question it asks |
|---|---|
| `audit-manifest-lookup.mjs` | can the APP find every clip, by its own key |
| `elevenlabs-generate-narration.mjs --check` | does every block have a file, by hash |
| `audit-double-sound.mjs` | does one handler start the same sound twice |
| `audit-consonant-integrity.mjs` | does every clip still say its last letter |
| `audit-stage-overflow.mjs` | does any screen scroll when it fits |
| `audit-framing-echoes.mjs` | is a stock phrase said twice on one screen |
| `audit-echoed-lines.mjs` | does a villain line repeat its own verdict |
| `pad-lesson-icons.mjs --check` | can any icon be sliced by a container |
| `audit-no-em-dashes.mjs` | any em-dash in copy a child reads |

The first two look similar and are not. One asks the producer's question and
one asks the consumer's, and it was the gap between them that reached the
owner.

---

## THE PRE-TEST CHECKLIST

**This is the part to read.** Everything above is how each check came to
exist; this is what to run before the owner is told a week is ready.

The rule the owner set on 17 October: a fault found in one week is a fault to
look for in every week, and the sweep happens BEFORE they test, not after.
Week 2 cost thirteen reports. Week 3 should cost far fewer, and the only way
that happens is by running this list first.

Order matters. Content before audio, because recording a line you are about
to rewrite is how week 1 ended up recording nine blocks twice. Audio before
layout, because narration panels change screen heights. Layout before art.

### 1. Content, before a single clip is recorded

| # | Run | Must say |
|---|---|---|
| C1 | `node scripts/audit-narration-flow.mjs --week=N` | 0 seam flags, 0 beat-chain flags |
| C2 | `node scripts/audit-echoed-lines.mjs N` | 0 echoes (villain line vs the verdict beside it) |
| C3 | `node scripts/audit-framing-echoes.mjs N` | 0 stock phrases setting up a question AND closing it |
| C4 | `node scripts/audit-no-em-dashes.mjs` | none in child-facing copy |
| C5 | `node scripts/audit-engine-reuse.mjs --week=N` | no engine this week may not use |

C3 is new from week 2: "not sure" set up the last boss question and closed
it. C2 could not hear it, because it drops stop words and needs three content
words in common. If C3 reports something that is the week's SUBJECT rather
than its framing - week 2's "too nosy" is the model - leave it; the list in
the script is deliberately only generic set-up phrases.

**Read the flow dump top to bottom as one script.** No audit can tell you a
recap promises an activity when a Learn comes next.

### 2. The printed page must not repeat the spoken one

New from week 2 (W2-3), and no script catches it yet: every echo check
compares spoken against spoken. Nothing compares a screen's PRINTED chrome
against the narration printed inches below it.

ConceptRecap now drops a line that restates its own "Up next" pill
automatically, so recaps are covered. **Any OTHER screen that prints a label
and a narration line together has to be read by eye.**

### 3. Audio

| # | Run | Must say |
|---|---|---|
| A1 | `node --env-file=.env.local scripts/elevenlabs-generate-narration.mjs` | records only what changed |
| A2 | `node scripts/elevenlabs-generate-narration.mjs --check` | 0 SILENT |
| A3 | `node scripts/audit-consonant-integrity.mjs --weeks=N` | every clip keeps its last letter |
| A4 | `node scripts/audit-pause-placement.mjs --weeks=N` | pauses where the writing put them |
| A5 | add week N to the CI ratchets | `--weeks=1,2,N` and `audit-framing-echoes.mjs 1 2 N` |

Years are handled in the generator now (W2-5), so any week re-recorded gets
them. Nothing to do per week except notice if a week has digits that are NOT
a year - a password, a phone number, a count - and check how they are read.

**A3 is the one to treat carefully.** It was recalibrated in week 2 to stop
mis-reading stop endings, and that moved a safety net. If it reports a clip,
listen before re-recording; if it passes a clip you can hear is cut, say so
rather than trusting the number.

### 4. Layout, at the owner's window

| # | Run | Must say |
|---|---|---|
| L1 | `node scripts/qa-server.mjs --build` | serving THIS checkout, BUILD_ID verified |
| L2 | `node scripts/audit-stage-overflow.mjs N` | 0px on every screen |
| L3 | `node scripts/audit-card-fill.mjs N` | no card leaving a band of empty stage |
| L4 | `node scripts/audit-frame-fit.mjs N` | nothing past the fold or clipped |

L2 is new from week 2 (W2-4) and asks a different question from L3: L3 asks
whether the CARD fills the STAGE, L2 asks whether the stage overflows ITSELF.
A card can fill its stage perfectly and the stage still be a few pixels too
tall, and only the second puts a scroll bar on the screen.

**Measuring nothing is not passing.** L2 exits non-zero if it never found a
screen. If any of these report zero screens measured, the gate was shut and
the run proved nothing.

Checks no script does yet, so they are done by eye at 1414x771:

- **A grid's last row.** Five items in a three-column grid leaves a
  card-sized hole (W2-1). RevealBoard centres a short row now; any OTHER
  grid in the week needs looking at.
- **A result card after the exercise is finished**, not at rest. Most engines
  draw the result over the finished board and inherit its height.
- **Anything pinned with a z-index.** A hint, a coach banner or an overlay
  must never cover live gameplay (W2-6). If the board has nowhere to put it,
  hold the game while it is up rather than letting it sit on top.

### 5. Art

| # | Run | Must say |
|---|---|---|
| R1 | `node scripts/pad-lesson-icons.mjs --check` | 0 icons running to the canvas edge |
| R2 | sprite pass over `w{NN}` | `fill-sprite-key-holes.mjs`, `strip-sprite-ground-shadow.mjs` |
| R3 | magenta contact sheet of every icon the week shows | no stray pixels, nothing clipped |

R1 is shared and already done for all twenty weeks; it only needs re-running
if a week ADDS an icon.

### 5b. The boss result screens

`node scripts/audit-boss-sprite-clip.mjs N` - the raccoon must be whole on
the victory AND failed panels.

Owner, 2026-10-17: "as you zoom out, the raccoon's head gets chopped off at
the top. This is something that we need to push across all the weeks."

Neither the artwork nor a container was at fault. Both panels are centred
boxes that scroll, the sprite is their FIRST child, and it bobs 7px upward on
a loop - so it crosses the clip edge even when the layout fits. On top of
that, a centred box whose content outgrows it spills EQUALLY both ways, and
the half above the top edge is clipped AND unreachable by scrolling. That is
why it depends on zoom: clean at 1414x771, 3px of head gone at 2560x1440.

Fixed in QuizBoss for all twenty bosses (clearance derived from the bob, plus
`safe` centring). The audit is slow - minutes per run, because every answer
waits on a narration gate - so it is NOT in CI. Run it when a result screen
changes.

Two traps it was written around, both of which made it report a clean pass
while the head was being cut: the first raccoon in the DOM is the 16px HUD
icon beside "BOSS INTEGRITY", and the boss gate's button says "Initiate Test"
rather than anything a generic start matcher looks for.

### 6. Gameplay feel, by playing it

No script measures these. They came out of week 2 and they apply to any
engine with motion:

- **Can the child READ the thing they are deciding about?** Week 2 truncated
  nine of eleven subject lines, so the decision rested on text that was not
  shown (W2-9).
- **Is anything racing them?** The build standard says nothing should. Check
  the speed ramp, how many things share the screen, and whether the gap
  between them scales with how much there is to read.
- **Is the same number on screen twice?** Week 2 showed "KEPT SAFE 2/5" three
  times at once (W2-8).

### 7. The closing four screens

They are one themed suite now (W2-17), reading `weekThemes.ts`:

  boss Mission Report -> Mission Debrief -> Stickers Unlocked -> Week Complete

A week with a theme entry gets its own colour for free. **A week with NO
entry in weekThemes.ts falls back to the house look**, which is correct but
means that week ends like every other un-themed week. Worth adding a theme
entry when a week is brought up to standard.

Theme the chrome, never the meaning: green stays correct, red stays wrong,
gold stays reward.

### 8. Before saying "ready to test"

- CI green on the PR, and merged - testers only ever see production.
- A screenshot of each screen CHANGED, at 1414x771, looked at.
- Anything deliberately left open said out loud, not left to be discovered.

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

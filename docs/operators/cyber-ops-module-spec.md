# Cyber Ops - Module Build Spec (v1)

The standard every Cyber Ops module (M01–M16) is built to, proven on **Module 5
(Injection)** as the reference. Each component below has its own detailed spec:
**Purpose · Where · Data · Content · Design & behaviour · Done checklist.**

Rules that apply to everything: no em-dashes in user copy; keep the terminal look;
never change the actual learning content; content must be real + sourced + current;
vibrant "board / dashboard" feel, not endless vertical lists; `tsc` clean;
screenshot-verify every changed screen; merge on green; confirm prod READY.

The shell is `app/operators/range/Engagement.tsx`; per-module content is a
`ModuleDef` in `app/operators/range/moduleNN.tsx`. "Shell-level" = write once,
applies to all 16; "per-module" = author data per module.

---

## 1. Industry intro (editorial feature)

- **Purpose.** The flagship opener. Tell the learner what the topic is, why it
  matters in the real world and industry, what's happening now, and where it's
  heading - so they arrive motivated and oriented, not cold. We are an AI/future-
  forward platform; this page must look the part.
- **Where.** First beat (`intro`), before `brief`. Rendered by `IntroPage`. The
  module opens on it; it is the first segment in the progress bar.
- **Data.** `ModuleDef.industry` (optional): `tag`, `primer` (see §2), `learn[]`,
  `engines[]` (§1a), `headline` (§1b), `recent`, `now {stat, body}`, `ahead`,
  `role`, `roles[]`.
- **Content.**
  - `tag`: one punchy line, the hook ("One missed text box can hand an attacker a
    company's entire database.").
  - `learn[]`: 3–4 concrete "you will…" outcomes.
  - `now`: a single big stat + one paragraph grounding it in the present (e.g.
    OWASP Top 10 2025 rank). Must cite a real, current source.
  - `ahead`: the forward/AI angle - where the skill is going. Real, sourced.
  - `role` + `roles[]`: the careers it leads to.
- **Design & behaviour.** Deliberately OFF the uniform terminal card look: a big
  gradient hero with a live motif, a numbered "in this module you will" grid, the
  engine showcase, a left/right split (why-it-matters + newspaper), a big stat band
  beside a recent case, a vibrant "where it's heading" panel, careers chips. Themed
  to the module's world colour. Asymmetric and visual, not a single column.
- **Done checklist.** Opens the module · facts real + sourced + current · stat is
  this-year · reads vibrant/editorial, not a card stack · all copy em-dash-free.

### 1a. Engine / tool showcase

- **Purpose.** Show the real tools/engines the topic touches, as colourful cards,
  so the field feels concrete ("these are the things you'll be working on").
- **Data.** `industry.engines[]`: `{ name, color, blurb, here? }`.
- **Content.** 4–6 real tools/engines for the topic, brand-accurate colours, a
  one-line plain blurb each; mark the one this module uses with `here: true`.
- **Design.** Brand-coloured cards with a simple representative icon (generic, not a
  copied logo), name, blurb; the `here` card is flagged "YOU'RE HERE" and glows.
- **Checklist.** Real tools · the module's own tool flagged · plain blurbs · colours
  on-brand but icons generic (no trademarked logo art).

### 1b. Real-case newspaper clipping

- **Purpose.** Prove this bites in the real world with a real, documented breach,
  presented as a broadsheet clipping for contrast and memorability.
- **Data.** `industry.headline`: `{ masthead, dateline, title, body, stat,
  statLabel, why }`.
- **Content.** A REAL, documented incident for the topic. `dateline` cites the real
  source/record (e.g. "UK regulator (ICO) public record"). `body` names the real
  org and the key facts. `why` = one line on why it matters / that it's not a
  one-off. Masthead is a stylised/fictional paper (do NOT impersonate a real
  outlet). Facts must be accurate and sourced.
- **Design.** Cream/paper card, serif, a "★ This really happened" marker, headline,
  body, a big red stat, the italic "why it matters" footer.
- **Checklist.** Event is real + sourced · clearly flagged as real · masthead
  fictional · one "why it matters" line · no em-dashes.

---

## 2. Basics primer

- **Purpose.** Never throw a beginner in cold. Explain the ground-level concept in
  plain words and show a real example, before any hands-on.
- **Where.** Near the top of the intro, under the hero ("New to this? Start with the
  basics").
- **Data.** `industry.primer`: `{ term, what, example, returns }`.
- **Content.** `term` = the concept lead-in (e.g. "SQL"). `what` = 2–3 plain
  sentences a non-technical reader understands. `example` = one real, minimal
  snippet. `returns` = plain-English of what that example does/returns, ending by
  tying into what they'll do next.
- **Design.** A cyan-accented block: bold term lead-in + plain paragraph, then a
  boxed "A real example" with the snippet (mono) and a "→" explanation.
- **Checklist.** A total beginner could follow it · one real example · plain enough
  for a non-technical reader · no jargon left unexplained.

---

## 3. Dossier brief

- **Purpose.** The in-fiction engagement framing - who the client is and the job.
- **Where.** `brief` beat (`BriefCard`).
- **Data.** `ModuleDef.client`, `brief`, `scope.target`, `title`.
- **Content.** The existing brief narrative (unchanged). 
- **Design.** A themed "engagement dossier": world-accent top bar, client as a
  display title with an accent rule, `target / vector / plan` meta chips, brighter
  well-set brief copy, prominent CTA.
- **Checklist.** Reads as a designed dossier, not a plain panel · themed to world ·
  brief copy unchanged in meaning.

---

## 4. Collapsible lessons + glossary

- **Purpose.** Teach the ground without a wall of text; let the learner open
  sections at their pace; explain every term a 14–17 learner wouldn't just know.
- **Where.** `lesson` and `defend` beats (`LessonBlock`), glossary via `withGlossary`.
- **Data.** `lesson.blocks[] {h, body}`, `defend.blocks[]`, `glossary[] {term,
  definition, example}`.
- **Content.** Each block = a subheading + a tight paragraph. Every technical term
  gets a glossary entry with a plain definition AND a real-world example.
- **Design.** Each block is a collapsible section (first one open), with its
  distinct rail/framed/topline treatment as the header; brighter body text; glossary
  terms are hover/tap popovers (must NOT be clipped - overflow opens when expanded).
- **Checklist.** First block open, rest collapse · carets aligned · glossary popover
  shows fully (not clipped) · every hard term has a definition + example · body text
  bright enough to read over the backdrop.

---

## 5. Rules of Engagement (scope screen)

- **Purpose.** Make authorisation meaningful, not jargon: a signed scope is what
  makes the work legal.
- **Where.** `authorize` beat (`ScopeCard`).
- **Data.** `ModuleDef.scope {target, inScope, offLimits, timebox}`.
- **Content.** Keep the technical values; frame them. Plain opener that signing a
  scope is what keeps it legal. Each row: a human label + the value + a one-line
  "why" (what it means / why it's off limits).
- **Design.** "Rules of engagement" header, intro paragraph, one card per row
  (Where you're working / ✓ Cleared to touch / ✗ Hands off / Time you have), then
  sign-as + "you agree to stay inside this scope."
- **Checklist.** Reads as meaningful, not jargon · every row has a "why" · ties to
  the legal/ethics point · values still accurate.

---

## 6. Capture - how-to + payload pieces

- **Purpose.** Make the hands-on obvious: what to tap, where, what each piece does,
  what to press.
- **Where.** `act` beat (the bespoke `Act` surface per module) + the `Palette`.
- **Data.** Bespoke per module (the Act component); payload tokens live in the Act.
- **Content.** A "How to do it" line (tap the pieces into the box, in order, press
  RUN, hint if stuck). Every payload/command piece carries a plain "what it does".
- **Design.** Each payload piece is a chip: the token (mono) + a tiny plain gloss.
- **Checklist.** "How to do it" present and accurate to the surface · every piece
  self-explains · no raw symbol goes in unexplained.

---

## 7. Progressive hint ladder

- **Purpose.** Help that escalates, so nobody is stuck but nobody is spoon-fed:
  have a go → a hint → another hint → the structure → the full answer.
- **Where.** The capture surfaces (`HintLadder`).
- **Data.** `hints[]`, `skeleton`, `reveal` per stage.
- **Content.** 1–2 hints that nudge without giving it away; a fill-in-the-blanks
  skeleton; a last-resort full reveal.
- **Design.** Bright standout pill-buttons (not dull links), escalating labels, and
  the reveal shows a clear confirmation ("✓ answer dropped into the box"), so it
  never looks like nothing happened (even when the answer is short).
- **Checklist.** Escalation present · actions look clickable · reveal confirms it
  acted · hint text bright.

---

## 8. "Stuck? see it a different way" - mission map

- **Purpose.** A second way in for people who don't learn from a wall of text: the
  mission as a visual, numbered roadmap. Opened via a caring, warm nudge.
- **Where.** Under the handler on the `act` beat (`StuckHelp` + `PlanMap`).
- **Data.** `ModuleDef.plan[] {label, goal}` - the staged objectives.
- **Content.** Warm "Not clicking yet? We've got you" copy; `plan` = one line per
  stage.
- **Design.** A caring strip with a "Show me a simpler way →" button that reveals a
  numbered, connected roadmap of the stages, themed to world.
- **Checklist.** Caring tone · reveals the map on click · `plan` covers every stage.

---

## 9. Cheat sheet  ⭐ (detailed standard)

- **Purpose.** A module-applicable quick reference the learner can pull up at any
  time, read in plain words (easy enough for a non-technical reader), then minimise
  back into the module. It gives fuller, optional knowledge of the topic. The
  module itself stays as technical as ever; the cheat sheet is the gentle companion.
- **Where.** A fixed **"▦ CHEAT SHEET" side tab** on the right edge, visible on
  every beat. Opens a full-screen overlay (`CheatSheet`). Closes via **Minimise ✕**,
  the backdrop, or **Esc**.
- **Data.** `ModuleDef.cheatsheet`:
  ```
  cheatsheet: {
    title: string;          // e.g. "SQL quick reference"
    blurb: string;          // plain, welcoming, 1–2 sentences
    sample?: { caption: string; cols: string[]; rows: string[][] };
    groups: { heading: string; entries: { code: string; what: string; example?: string }[] }[];
  }
  ```
- **Content - the cheat-sheet standard (every module must cover all of this):**
  1. **Title** + a **plain, welcoming blurb** ("…in plain words. You do not need to
     memorise any of it.").
  2. **A SAMPLE visual data TABLE** (`sample`) the examples read from - show the
     data first, then point the code at it. 3–4 rows, realistic, chosen so examples
     can reference specific rows (e.g. a `users` table with an `id = 42` row).
  3. **Grouped entries** that cover, as a minimum, three bands:
     - the topic's **everyday/core** commands or ideas,
     - the **key operators / concepts**,
     - **"the bits the attack abuses"** (the offensive-relevant pieces for this
       module).
  4. **Each entry** = `code`/term + a plain one-line **what it does** + a real
     **example that references the sample table** (e.g. `WHERE id = 42 → the Priya
     Shah row`).
  5. **Readable by a non-technical person** throughout - no unexplained jargon.
- **Design.** Full-screen, themed to world. Sticky header (title + "Minimise ✕").
  Blurb, then the sample table (clean data table, accent header row), then the
  grouped reference cards (code in the accent, plain "what", a boxed example).
  Futuristic but calm and readable.
- **Done checklist.** Side tab visible on every beat · opens full-screen · closes 3
  ways (button/backdrop/Esc) · has a sample table · examples reference the table ·
  covers everyday + operators + attack-abused bits · non-technical readable · themed
  · no em-dashes.

---

## 10. Debrief takeaway

- **Purpose.** One line to hold onto after a dense module, for consolidation.
- **Where.** Top of the debrief (`defend` beat).
- **Data.** `ModuleDef.takeaway: string`.
- **Content.** One sentence: the single most important idea, defence-anchored.
- **Design.** A bold amber "✦ Take this away" strip at the very top of the debrief.
- **Checklist.** One line · the core idea · at the top of the debrief.

---

## 11. Module outcome

- **Purpose.** Show the learner what they can now do (portfolio-grade).
- **Where.** Report beat.
- **Data.** `ModuleDef.outcome: string[]` (3–4 "you can now…").
- **Checklist.** 3–4 concrete capabilities · phrased as what they can now do.

---

## 12. Ethics / "stay legal" note

- **Purpose.** These modules exploit before they defend; close every one with the
  reminder that it's training and illegal against real systems.
- **Where.** End of the report beat (`EthicsNote`, shared constant).
- **Content.** Shared, consistent wording (walled range vs real systems, Computer
  Misuse Act 1990, legal only with written permission).
- **Checklist.** Present on every module · consistent wording · no em-dashes.

---

## 13. Portfolio (platform page)

- **Purpose.** The operator's record: standing + the posting, cinematic, not a list.
- **Where.** `app/operators/portfolio/page.tsx`.
- **Design.** An **operator dashboard** hero: chevron **rank insignia** (one chevron
  per tier reached) + big standout stats (reputation, findings filed, modules
  cleared) + gradient progress bar. The posting is a **mission-board grid** of
  phase-coloured module tiles (cleared ✓ / next "START HERE" / soon), not a vertical
  list. Data/links/auth unchanged.
- **Checklist.** Stats stand out · rank insignia (not a lone letter) · modules are a
  board, not a list.

---

## 14. Pre-ship QA checks - run on EVERY module before "ready to test"

Screen these BEFORE shipping (sources: Abdullah UAT + owner reviews).

**Comprehension / flow**
- [ ] A total beginner can start cold (primer: what it is + a real example).
- [ ] No step needs outside knowledge the module hasn't given.
- [ ] ⭐ No step makes the learner MEMORISE a value they recovered earlier
      (password, hash, email, token, column count…). Show it / carry it forward /
      tap-to-fill at the point of reuse.
- [ ] Every instruction says plainly what to do (tap what, type where, press what).
- [ ] Payload/command pieces each explain what they do.
- [ ] Hint ladder present and the reveal visibly confirms it acted.

**Clarity / readability**
- [ ] No dull/greyed text that looks disabled; interactive controls look clickable.
- [ ] No clipped text (descenders, gradient-clip titles) - nothing cut off.
- [ ] Scope reads as plain-English Rules of Engagement with a "why" per row.
- [ ] Cheat sheet follows §9 (sample table + code references it; three coverage
      bands; non-technical readable).

**Content / correctness**
- [ ] Industry facts real + sourced + current; newspaper clearly real + why.
- [ ] No em-dashes in user copy. Terminal look kept. Learning content NOT changed.

**Engineering**
- [ ] `tsc` clean · every changed screen screenshot-verified · merged on green ·
      prod READY · one concern per PR.

---

## 15. Per-module data to author (rollout checklist)

For each of M01–M16, author in `moduleNN.tsx`:
- `industry { tag, primer, learn[], engines[], headline, recent, now, ahead, role,
  roles[] }` - real + sourced per topic.
- `cheatsheet { title, blurb, sample, groups[] }` - to the §9 standard.
- `takeaway`, `outcome[]`, `plan[]`.
Then remove the `moduleNo === 5` preview gates in the shell so the shell features
apply to all 16, and run §14 on each.

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
- **Data.** `ModuleDef.industry` (optional): `tag`, `motif`, `primer` (see §2),
  `learn[]`, `engines[]` (§1a), `headline` (§1b), `realWorld`, `recent`,
  `now {stat, body}`, `ahead`, `role`, `roles[]`.
- **Content.**
  - `tag`: one punchy line, the hook ("One missed text box can hand an attacker a
    company's entire database.").
  - `motif`: the hero's one-line **signature move** - `{ pre?, hit, post?, note }`.
    `hit` is the payload (highlighted in the world accent), `pre`/`post` the grey code
    around it, `note` the red consequence. PER MODULE (SQL for M5, an `<img onerror>`
    for M6). The shell shows it only if present, so every module must set its own.
  - `learn[]`: 3–4 concrete "you will…" outcomes.
  - `realWorld`: the "why it matters" paragraph shown left of the newspaper.
  - `now`: a single big stat + one paragraph grounding it in the present. The stat
    renders beside a fixed "on the OWASP Top 10, 2025" label, so `now.stat` is the
    OWASP rank (e.g. "#5"); the body cites the real, current source and may add a
    second stat (e.g. the HackerOne bug-bounty ranking).
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
- **Data.** `industry.engines[]`: `{ name, color, blurb, here?, icon? }`.
- **Content.** 4–6 real tools/engines for the topic, brand-accurate colours, a
  one-line plain blurb each; mark the one this module uses with `here: true`. The
  "engines" are whatever the topic actually touches: DB engines for injection,
  BROWSERS for XSS, scanners for recon, cipher suites for crypto, and so on.
- **Design.** Brand-coloured cards with a simple **generic glyph chosen to fit the
  topic** via `icon` (NOT a copied logo). The shell glyph set: `"db"` (default,
  cylinder), `"browser"` (window), and the rollout adds `"tool"`, `"scan"`, `"key"`,
  `"lock"`, `"server"`, `"shield"`, `"doc"`, `"mail"` as modules need them. A DB
  cylinder on a browser card (or similar mismatch) is a bug - pick the fitting glyph.
  The `here` card is flagged "YOU'RE HERE" and glows.
- **Checklist.** Real tools · the module's own tool flagged · plain blurbs · colours
  on-brand but icons generic (no trademarked logo art) · glyph fits the topic.

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
- **Design.** Each block is a collapsible section (first one open). Vary the blocks
  by SHAPE (rail / framed / topline), NOT by colour. ⭐ **Monochrome standard:** every
  block uses two shades of the ONE world accent (the accent + a lighter
  `color-mix(in srgb, <accent> 52%, #ffffff)`), never a rainbow of hues. Multiple bright
  colours read as childish for a 14-17 audience; two shades of one colour read as grown-up
  tradecraft. Brighter body text throughout; glossary terms are hover/tap popovers (must
  NOT be clipped - overflow opens when expanded).
- **Checklist.** First block open, rest collapse · carets aligned · blocks vary by shape
  not colour (two shades of one world accent, no rainbow) · glossary popover shows fully
  (not clipped) · every hard term has a definition + example · body text bright enough to
  read over the backdrop.

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
- ⭐ **Clean box per question (Abdullah UAT).** Input boxes clear AUTOMATICALLY when the
  learner advances to the next stage / question / phase - never carry the previous
  payload or answer into the next box. Applies to the Act stages, the capstone phases
  and any multi-step drill (reset email / password / search on advance; drills that
  remount per step are already clean).
- ⭐ **Rotate the activity format (banked standard, apply per-module).** Don't make all
  16 modules the same "type the payload into one box" drill end to end. Within a module,
  and across the 16, vary the micro-format so it doesn't feel repetitive: e.g.
  build-the-payload-from-chips, fill-in-the-blank skeleton, spot-the-vulnerable-line,
  order-the-steps, pick-the-right-tool, count/identify. Keep each module's ONE signature
  real hands-on move (for M5, the real typed injection against live SQLite); rotate the
  supporting beats around it. Decide the mix when authoring each module.
- **Checklist.** "How to do it" present and accurate to the surface · every piece
  self-explains · no raw symbol goes in unexplained · boxes clear on advance (nothing
  carries over) · activity format varied, not the same drill every beat.

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
  6. ⭐ **Pin-to-top (Abdullah UAT).** Every entry carries a ☆/★ pin toggle. Pinned
     entries surface in a **"★ Your pins" band above the sample table**, so the keywords
     a learner leans on are one glance away. Pins persist **per module** in
     `localStorage` (`ops-cheat-pins-<n>`), wrapped in try/catch so blocked storage never
     breaks the sheet. A **standout "★ TIP" callout** (accent badge + bright text in a
     tinted, softly glowing band, NOT a faint grey line) points it out. This is built
     into the shared `CheatSheet`, so it applies to all 16 for free.
- **Design.** Full-screen, themed to world. Sticky header (title + "Minimise ✕").
  Blurb + pin tip, then the "★ Your pins" band (when any), then the sample table (clean
  data table, accent header row), then the grouped reference cards (code in the accent,
  plain "what", a boxed example, ☆/★ pin top-right). Futuristic but calm and readable.
- **Done checklist.** Side tab visible on every beat · opens full-screen · closes 3
  ways (button/backdrop/Esc) · has a sample table · examples reference the table ·
  covers everyday + operators + attack-abused bits · entries pin to a top band and pins
  persist per module · non-technical readable · themed · no em-dashes.

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
- ⭐ **Design (bolder, Abdullah UAT).** This must NOT read as fine print. Give it real
  weight: amber border + left accent bar + soft glow, a prominent warning glyph, and body
  text at full ink colour, ~15.5px, weight 600 - a message the learner cannot skim past,
  not a footnote.
- **Checklist.** Present on every module · consistent wording · visually prominent (bold,
  bordered, glowing - not fine print) · no em-dashes.

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
- [ ] Input boxes clear automatically on advance - nothing carries into the next
      question / stage / phase.
- [ ] Activity format is varied across the module, not the same single drill every beat
      (one signature real move kept; supporting beats rotated).

**Clarity / readability**
- [ ] No dull/greyed text that looks disabled; interactive controls look clickable.
- [ ] No clipped text (descenders, gradient-clip titles) - nothing cut off.
- [ ] Scope reads as plain-English Rules of Engagement with a "why" per row.
- [ ] Lesson blocks vary by SHAPE in two shades of ONE world accent - no childish
      rainbow of colours.
- [ ] The ethics / stay-legal note is visually prominent (bold, bordered, glowing) -
      not skimmable fine print.
- [ ] Cheat sheet follows §9 (sample table + code references it; three coverage
      bands; entries pin to a top band, pins persist; non-technical readable).

**Content / correctness**
- [ ] Industry facts real + sourced + current; newspaper clearly real + why.
- [ ] No em-dashes in user copy. Terminal look kept. Learning content NOT changed.

**Engineering**
- [ ] `tsc` clean · every changed screen screenshot-verified · merged on green ·
      prod READY · one concern per PR.

---

## 15. Per-module data to author (rollout checklist)

**Status: ROLLOUT COMPLETE (2026-10-20). All 16 modules are built to this standard.**
M5 = reference; M6 (XSS) = pilot (#726); then M4/M7/M8/M9, M1/M2/M3/M10,
M11/M12/M13/M14, M15/M16 shipped one PR each (#729-#744). The `moduleNo === 5` preview
gate is removed (#725); the pin-tip is a standout callout (#724).

Shell generalisations added so the single shared `IntroPage` fits every topic (keep these
in mind when editing a module):
- `EngineGlyph` set + `EngineIcon` type (#728): db, browser, tool, scan, key, lock, server,
  shield, doc, mail. Pick the glyph that fits the field (§1a).
- `industry.now.statLabel` (#733): non-OWASP/phase topics (recon, forensics, IR, disclosure)
  label their headline stat correctly (MITRE ATT&CK, a Verizon DBIR %, CVE counts, etc.)
  instead of the default "on the OWASP Top 10, 2025".
- `industry.readLine` / `enginesTitle` / `whyPunch` (#738): defender and foundational
  modules reword the three attacker-framed intro strings (the eyebrow, the engine-section
  header, the "why it matters" punch line). All default to the red-team wording.
- Per-module `industry.motif` (hero signature-move line) and `engines[].icon`.

To ADD or EDIT a module, author in `moduleNN.tsx` (one surgical PR per module):
- `industry { tag, motif, primer, learn[], engines[] (+icon), headline, realWorld,
  recent, now, ahead, role, roles[] }` - real + sourced per topic. Pick engine glyphs
  (§1a) that fit the topic; set the hero `motif` (§1); stat beside the OWASP label.
- `cheatsheet { title, blurb, sample, groups[] }` - to the §9 standard (sample table
  the examples reference; three bands; pinnable).
- `plan[]` - the mission map, mirroring the module's real Act stages.
- `takeaway`, `outcome[]` - already present on every module; refine if needed.

Per-module CHECKS (don't assume, verify):
- Clear-inputs (§6): confirm the Act/capstone/drill surfaces reset between stages.
  Where they remount per stage (`key={si}`) this is already satisfied (e.g. M6); where
  they hold field state across stages, add the resets (e.g. M5).
- Activity variety (§6): confirm the beats aren't the same single drill throughout.
- Watch for hardcoded M5-isms in the shell as you go (the hero module number and motif
  were two; fixed in #726). If a new shell generalisation is needed, add a glyph/field
  rather than a special-case.
- Run §14 (pre-ship QA) on each; screenshot-verify the intro + cheat sheet at minimum.

---

## 16. UAT changelog (tester-facing notes)

Plain-English "what changed" lines to hand the tester each time something ships
(owner rule: end every fix with a one-line tester-facing note; testers test prod
only, so send once merged + deployed).

**2026-10-20 - Abdullah redevelopment batch (Module 5):**
- Cheat sheet: tap the ☆ on any card to pin it to a "Your pins" band at the top.
  Your pins are remembered next time you open the sheet.
- The payload box now clears itself when you move to the next stage, so you always
  start on a clean line.
- The "stay legal" note at the end is now bold and front-and-centre, not fine print.
- The "Learn the ground" cards now use one colour in two shades, instead of a mix
  of colours.

**2026-10-20 - all-16 design rollout (shell + M6):**
- Every module's opening brief and the "rules of engagement" scope are now the fuller
  designed cards, and the body text is brighter, across all 16.
- The cheat-sheet "pin" tip is now a clear highlighted callout, not a faint grey line.
- Module 6 (Cross-Site Scripting) now opens with the full feature intro (what XSS is,
  a real 2005 case, where it ranks today, the AI angle, careers) and has its own XSS
  cheat sheet. The rest of the modules follow, one at a time.

**2026-10-20 - all 16 modules complete:**
- Every module now opens with its own full feature intro: a plain-English primer, the
  real tools of its field, a true news story (a real breach or case), where it ranks or
  stands today, the AI angle, and the careers it leads to.
- Every module has its own topic cheat sheet (a worked sample plus three bands) on the
  side tab, and a visual "mission map" of its stages.
- The whole 16-module course is now one consistent, sourced, careers-forward experience.

**2026-10-21 - AI Frontier track (Modules 17-20) added:**
- A sixth phase, **AI Frontier**, extends the course from 16 to 20 modules, all built to
  the same standard (sourced feature intro, glossary, interactive lesson lab, cheat sheet,
  Learn -> Capture -> Defend -> Report, four drills, a capstone). World accent: violet (#B15BFF).
  - **M17 Prompt Injection** - the AI cousin of SQL injection. Scripted in-browser assistant
    (VaultBot); override its rules, leak its system prompt, indirect injection via a poisoned
    page, beat a filter. Sourced: Chevy $1-car chatbot, OWASP LLM01, EchoLeak CVE-2025-32711.
  - **M18 Cloud & API Security** - scripted fake REST API + cloud bucket. BOLA, public bucket
    + leaked .env key, key reuse, BFLA. Sourced: Optus 2022, OWASP API1:2023 BOLA, Dell 2024.
  - **M19 Agentic AI Under Attack** - scripted ReAct agent (ARIA) with tools. Indirect injection
    turns into real actions: forward via email, exfil via a URL side channel, poison a document,
    beat a domain allow-list. Sourced: Slack AI exfiltration (2024), OWASP LLM01+LLM06, ForcedLeak,
    the lethal trifecta.
  - **M20 Deepfakes & the AI Arms Race** - defence-led (you cannot hack a deepfake). Scripted
    detection/decision lab: a deepfake video call, a cloned-voice voicemail, an AI phishing email,
    and the verification protocol. The pass is the decision (verify out-of-band), not tell-spotting.
    Sourced: Arup HK fraud (2024), Sumsub 2024, WPP, C2PA, FBI guidance.
- THE SCRIPTED-AI PATTERN (M17-20, no real LLM/API/cost, nothing leaves the browser): deterministic
  pattern-matchers run the "AI". M17/M19 detect injection on the USER input (never system+user, or the
  system prompt's own "reveal instructions" trips the detector); replies branch so a plain override does
  not leak the secret (only a leak-style ask does). M20 renders described scenarios, not real media.
- Track wiring: `curriculum.ts` (AI Frontier phase + entries 17-20, violet), portfolio counts derive from
  `CURRICULUM.length`, `CourseIntro` 6th phase + "20 modules / six phases", `/ops` landing curriculum grid
  (6 columns) + counts. M16's capstone narrative ("sixteen engagements") is left unchanged by design; the
  AI Frontier is positioned as an advanced track beyond the core season.

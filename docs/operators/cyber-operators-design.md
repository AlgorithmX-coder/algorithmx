# AlgorithmX - Redoubt Design Spine
## The 14-17 tier (working brand: "Redoubt"; was placeholder "CyberStart")

**Status:** Working canon, opened in the design session of 2026-07-12. Single
source of truth for all product, narrative, safety, curriculum, and reward
decisions for the 14-17 tier. The parallel to the Cyber Heroes warm-Pixar
art-direction doc and the Cyber Explorers "Signal Room" doc. (File path stays
`docs/operators/...` until the name locks through confirming clearance; see
section 9.)

**Markers:** `LOCKED` = decided in session, do not change without explicit
sign-off. `DEFAULT` = recommended value, override freely. `DECIDE` = genuinely
open, recommendation attached.

**Rule carried from Heroes and Explorers:** design and art direction lock before
any implementation. No Claude Code prompt may cite a decision that is not in this
document.

---

## 1. What this session locked (fork record)

Resolved in the 2026-07-12 design session:

1. **Tier and age band - LOCKED.** Cyber Operators covers ages 14-17. It is the
   top rung of the ladder above Cyber Heroes (6-9) and Cyber Explorers (10-13),
   and it closes the gap left by Explorers locking at 13. A 14-year-old finishing
   Explorers now has somewhere to go.
2. **Product form - LOCKED.** Engagements. A fictional security firm hires the
   learner as a junior operator. Each week is a realistic client engagement that
   runs the professional lifecycle (authorize, recon, act, document, report).
   Writeups accumulate into a portfolio.
3. **Offensive-content line - LOCKED.** Simulated offense. The learner performs
   real offensive techniques (injection, XSS, broken auth, access control, recon,
   password and hash attacks) but only against fake targets built in-browser
   inside a walled range. No real tools, no real networks, nothing leaves the app.
   One carve-out holds even in this tier: human-targeted social engineering stays
   analysis-only (spot the con, never author it). See section 4.
4. **Employer fiction - LOCKED.** A fictional boutique security consultancy named
   **Redoubt** hires the operator. Threat-of-the-week structure: each engagement
   has a fresh client and a fresh, realistically modeled adversary. No single
   serial villain. Reputation with Redoubt is the season-long through-line.
5. **Safety ceremony - LOCKED.** The authorization/scope signing is the tier's
   signature recurring mechanic. Every engagement opens with the operator
   reviewing and signing a scope document, and going out-of-scope mid-engagement
   is a real fail state with consequences. This is the Operators equivalent of the
   Explorers "ARC Code" gate. Ethics and authenticity fused into one beat.
6. **Reward economy - LOCKED (shape).** The meta-game is a portfolio of findings
   writeups plus a reputation rank with Redoubt. This replaces Heroes XP/badges
   and the Explorers clearance ladder. Detail in section 7.
7. **Handler - LOCKED.** One recurring handler: a veteran operator who runs the
   learner's engagements like a real junior colleague. Dry, economical, trusting,
   goes by a callsign. Maximum contrast with Heroes' warm Sarah.
8. **Curriculum shape - LOCKED.** Sixteen weeks, domain rotation building to a
   multi-part capstone engagement. Modular and reorderable, but it still climaxes.
   Full map in section 8.
9. **Name - "Redoubt" (working brand, confirming clearance running).** Three "Cyber
   ___" candidates failed clearance in sequence (CyberStart, Cyber Operators, Cyber
   Vanguard - all crowded sector + prime domains gone). Decision on 2026-07-12: adopt
   the distinctive, already-cleared fiction name "Redoubt" as the tier's actual
   brand, unifying product and story. A confirming clearance for customer-facing use
   is in flight. Do not bake the name into art or VO until it locks. All design in
   this doc is name-independent by construction (Redoubt carries the chrome either
   way). See section 9.

---

## 2. North star and the three-tier ladder

**You are a junior operator at a real security firm, trusted with real work.**

The fantasy is competence made professional. Heroes gives a child a power
fantasy; Explorers gives a competence fantasy; Operators gives a professional
fantasy. The learner is not pretending to be a hacker. They are doing the actual
job, inside the actual guardrails the job has, and walking away with something a
real person could show a real employer.

The escalation across the three tiers, in one word each:

| Tier | Ages | Fantasy | Verb | Offensive line |
|---|---|---|---|---|
| Cyber Heroes | 6-9 | Power | Play | Never touches offense |
| Cyber Explorers | 10-13 | Competence | Notice | Anticipate, never author |
| Cyber Operators | 14-17 | Profession | Do | Perform, inside a walled range |

**play -> notice -> do** is the reason all three tiers coexist without
cannibalising each other, and it is the north-star test for any Operators
feature: does this let the learner *do the real work*, or does it just simulate
the feeling of it?

**The inverse parent test, carried up one rung - LOCKED.** In Heroes a re-skin
fails if a parent could mistake two weeks for each other. In Explorers the test
inverts: an Explorers screen fails if a parent could mistake it for a Heroes
screen. It inverts again here: **an Operators screen fails if a parent could
mistake it for an Explorers screen.** Explorers is a quiet analyst's room.
Operators is a working operator's environment: a terminal, a live target, a
report open in the next pane. No shared assets, no shared celebration grammar
across the tier boundary.

### Anti-goals

- **Not a hacking course.** The role flip in the back half (section 8) exists so
  this never reads as "we taught your kid to break in." You learn offense to
  understand defense, and you finish on disclosure and reporting.
- **Not neon-hacker cliche.** No Matrix rain, no skull ASCII, no hoodie, no
  "HACKING..." bars. Real tools look boring and precise; lean into that.
- **Not Explorers aged up.** No STATIC-style serial villain, no clearance-ladder
  reskin, no shared iconography. Redoubt is a workplace, not a mission-control
  fantasy.
- **Not a toy.** The one-line screen test: would a sixteen-year-old put this in a
  UCAS statement or show it to a teacher without embarrassment?

---

## 3. The engagement - the weekly unit (LOCKED)

Each week is one client engagement, and it runs the real professional lifecycle.
Five phases:

1. **Authorize.** Receive and sign the scope: what is in bounds, what is off
   limits, the rules of engagement. This is the safety gate and an authentic
   professional habit in one beat (section 4).
2. **Recon.** Map the target, find the attack surface. You map before you act.
3. **Act.** Perform the technique against the sandboxed target: exploit on an
   offensive week, detect and contain on a defensive week.
4. **Document.** Capture the finding: what it is, its impact, how to reproduce it,
   how to fix it.
5. **Report.** The writeup lands in the portfolio. Redoubt reputation adjusts on
   the quality of the work, not merely its completion.

The five phases are the fixed skeleton every week shares, the way Heroes weeks
share the Learn -> Play -> Prove cycle and Explorers missions share
briefing -> mission -> debrief. The engagement body varies by domain; the
skeleton does not.

**Session length - DEFAULT 1.5 hrs/week** (the placeholder value). Confirm against
real authored engagement lengths once the first is built.

---

## 4. Safety architecture - the load-bearing design (LOCKED)

Because the tier performs real offense, safety cannot be a disclaimer. It is
built into the fiction as a first-class mechanic. Three pillars:

### The range
Everything happens inside a licensed, walled cyber range: fake companies, fake
networks, fake targets, all built in-browser. Nothing is a real host, nothing
touches a real network, nothing leaves the app. The fiction *is* the sandbox, so
"you can only act inside the range" is simultaneously the story and the technical
truth. Every target the learner ever sees is a Redoubt range asset.

### Authorization before every engagement
Real operators never touch a system without written authorization. So every
engagement opens with the learner reviewing and signing a scope document (targets,
allowed actions, hard boundaries, timebox). Acting outside that scope is a real
fail state: the engagement flags it, the handler calls it out, reputation takes a
hit. This teaches the single most important professional and legal habit in
security (authorization is everything) by making the learner practise it sixteen
times. It is also the strongest line in the parent-facing story.

### The one ethical line held even here
Full technical offense against machines is in scope. Human-targeted social
engineering is not: the learner learns to *recognise* phishing and pretexting,
never to author it. Crafting deception aimed at a person is the one offensive
skill kept on the defense side even in the top tier. Parent-facing framing:
"we teach you to spot the con, not run it." See week 13.

### Framing discipline
Ethics and legality are woven into the engagement fiction, never bolted on as a
quiz. The legal reality (Computer Misuse Act in the UK, equivalent laws
elsewhere; you may only test systems you are authorized to test) is taught through
the authorization ceremony and the range's existence, reinforced by the handler,
and surfaced in parent-facing copy - not as a lecture screen.

### The range - technical model (PROPOSED, DEFAULT)

The core promise ("perform the real technique") needs the target to behave really,
not on-rails. If only the one scripted payload works, the learner feels the seams
and the tier collapses back toward Explorers. Proposed model: a hybrid, chosen per
week by what the learning actually requires.

- **Emulated targets - offensive weeks (auth, injection, XSS, access control,
  crypto, hashes).** Build small, genuinely vulnerable mock apps that run entirely
  client-side, so the learner's own payloads execute for real against a fake-but-
  real target:
  - a mock HTTP layer intercepts the "requests" the console sends and routes them
    to an in-browser target module - there is no network egress at all;
  - real engines where authenticity sells it: a wasm SQLite (e.g. sql.js) so a real
    SQL-injection payload actually runs against a real local database; an isolated
    sandboxed iframe so injected script actually fires for XSS; a real hashing/crypto
    lib so cracking and cipher-breaking are genuine, not faked.
  - Sweet spot: maximum authenticity, zero real infrastructure, nothing leaves the
    browser.
- **Authored data - analysis weeks (OSINT recon, forensics/log analysis, social-
  engineering recognition, disclosure).** Where the skill is reading and reasoning
  rather than executing, the target is curated datasets and authored artifacts.
  Cheaper, fully controllable, and no live execution needed.

**Architecture:** a "range kernel" abstraction - each week's target is a module
implementing one common interface (endpoints / state / intended vulns / expected
findings) that the operator's console mounts. This mirrors the existing Heroes
exercise-component contract (onComplete / onCorrect / onWrong), so it fits the
platform's client-heavy Next.js + React model rather than fighting it.

**This is also the safety architecture.** Because targets are in-browser and there
is no network-egress path at all, "nothing leaves the app" stops being a policy and
becomes a structural fact - the strongest version of the range guarantee, and the
cleanest thing to show a parent or a school.

**Dependency note.** The wasm engines (sql.js and similar) would be NEW
dependencies; the platform convention is to avoid new deps unless asked. This is a
deliberate, load-bearing exception to weigh - the authenticity they buy is the
tier's core differentiator. `DECIDE`: confirm the dependency trade, and decide how
far the "real terminal" metaphor goes (a real shell-like command parser the learner
free-types into, vs a guided command palette that assembles commands for them - the
latter is gentler for age 14 and easier to keep in-scope).

---

## 5. The fiction (LOCKED shape, casting open)

### Redoubt (the brand AND the in-fiction outfit)
"Redoubt" is now the tier's product brand and its in-story organisation, unified
(see section 9). A boutique security outfit that takes on a small number of junior
operators. The name reads protective and a little military (a redoubt is a
defensive stronghold) and it deliberately avoids the word "Agency," which would
echo the retired CyberStart in-game fiction. Redoubt runs the range, sends the
engagements, and holds the learner's reputation and portfolio. The customer enrols
in "Redoubt"; the learner, in-fiction, is recruited into Redoubt. One name, two
roles, the way the Explorers "Signal Room" is both aesthetic and place.

### The handler
One recurring senior operator who runs the learner's engagements. Character
contract:
- Treats the learner as a real junior colleague, not a student.
- Economical and dry; hands over real work and trusts the learner to figure
  things out; does not over-explain.
- Goes by a callsign (not a first name), reinforcing operator culture.
- Voice must be unmistakably distinct from Heroes' Sarah and the Explorers
  handler. `DECIDE`: gender, accent, and casting. `DEFAULT` recommendation:
  audition a small set and pick by ear, the way Heroes cast Sarah and Callum.

### Callsigns
The learner operates under a self-chosen callsign, not free text. Two-part
builder that must pass an "aspirational, not cute" review, carried forward from
the Explorers callsign builder (which itself echoed the Heroes username-builder
lesson). This is the product practising its own curriculum: a strong handle is a
security habit. `DECIDE`: exact word lists.

---

## 6. Tone and voice (DEFAULT)

- Adult-adjacent, respectful of a 14-17-year-old's intelligence. Never talks
  down. Never uses the excited-kid register of Heroes.
- The handler's voice is the tonal anchor: precise, dry, occasionally wry, never
  performatively cool. Real practitioners understate.
- Copy reads like internal tooling and professional writeups, not marketing.
- `DECIDE`: US-English vs UK-English. Recommendation: US-English, to match the
  calls already made on Heroes (US localization) and Explorers (US-English), even
  though AlgorithmX is a UK company. The legal framing still cites UK law where
  relevant because the audience and company are UK-based.

---

## 7. Reward economy - portfolio and reputation (LOCKED shape)

The meta-game trades in credibility, because 14-17s want things that look real.

### The portfolio
Each completed engagement produces a **findings writeup** that lands in a growing
case portfolio. Each entry is styled like a real pentest finding or CVE record:
title, severity/score, affected target, impact, reproduction steps, remediation.
The portfolio is the primary reward surface, the thing the learner accumulates
and can be proud of. It should be exportable/printable, echoing the Heroes
certificate but as a professional artifact.

### Redoubt reputation
Progression is a reputation rank with the firm, gated on the quality of the work,
not just completion. `DEFAULT` ladder: Junior -> Operator -> Lead -> Principal.
Quality signals feed the rank (clean scoping, findings found, report quality,
staying in scope). `DECIDE`: exact rank names, thresholds, and quality scoring.

### What is deliberately absent
No leagues, no social comparison, no public leaderboards. Personal bests and
firm-internal standing only, consistent with the platform-wide no-social-
comparison stance carried from Explorers. Celebration grammar is a "case closed"
stamp/brass register, not Heroes confetti.

---

## 8. The 16-week curriculum map (LOCKED)

Domain rotation, rising difficulty, a deliberate offense-to-defense role flip in
the back third, capstone at the end. Every week is one Redoubt engagement running
the five-phase skeleton from section 3.

**Foundations (1-3)**
1. **Rules of Engagement** - onboarding. Meet Redoubt, meet the handler, tour the
   range. Sign the first scope (the ethics/authorization gate). Ends with a tiny,
   fully-authorized first engagement so the learner acts on day one.
2. **Reconnaissance & OSINT** - footprint a fake company from public information.
   Passive recon, attack-surface mapping. Map before you act.
3. **The Web Surface** - how web apps work (HTTP, requests/responses), dev tools
   as an instrument, intercepting and modifying requests against the range.

**Web exploitation core (4-7)** - the offensive heart
4. **Broken Authentication** - credential attacks, weak sessions, MFA gaps against
   a fake login.
5. **Injection** - SQL injection against a sandboxed DB-backed app; extract the
   data the scope authorized.
6. **Cross-Site Scripting** - XSS against a fake app, simulated cookie theft, why
   client-side trust fails.
7. **Broken Access Control** - IDOR, forced browsing, privilege escalation.

**Data & systems (8-11)**
8. **Cryptography** - encoding vs hashing vs encryption; break weak and classical
   crypto; why it matters.
9. **Passwords & Hashes** - cracking concepts in-range, salting, rainbow tables,
   the case for strong hashing.
10. **Network Recon** - port scanning and service enumeration against a fake
    network.
11. **Digital Forensics** - log analysis, timeline reconstruction, finding the
    attacker's trail. The hinge: the learner starts reading the other side.

**Blue team & disclosure (12-14)** - the role flip
12. **Incident Response** - now you defend: detect, contain, eradicate a live
    simulated breach.
13. **Social Engineering - Defense** - recognise phishing and pretexting.
    Analysis-only by design (section 4).
14. **Responsible Disclosure & Reporting** - the craft of the writeup, severity
    scoring, how real researchers disclose. Portfolio polish.

**Capstone (15-16)**
15. **Full Engagement, Part 1** - a complete multi-stage engagement against a fake
    client, everything combined: recon -> exploit.
16. **Full Engagement, Part 2 + Debrief** - write the real report, present
    findings, receive a field-ready rating. Season close.

**Design notes on the arc:**
- The role flip (weeks 11-14) is intentional and load-bearing. You defend better
  having attacked, it is the honest arc of the profession, and it keeps the tier
  from reading as a pure hacking course.
- Web-heavy by weeks 3-7 because web exploitation is the most authentic thing
  actually performable in-browser without real infrastructure.
- No-overlap discipline vs Explorers: Explorers covers phishing/recognition and
  fundamentals at the "notice" altitude; Operators re-enters the same domains at
  the "do" altitude. Same topic, harder rung, learner actually performs it.

---

## 9. Naming decision (RESOLVED direction, final lock pending)

The route placeholder "CyberStart" is being retired. Research on 2026-07-12
returned a strong RENAME verdict: "CyberStart" is a SANS Institute platform that
powered the UK-government-funded Cyber Discovery programme (DCMS, 2017-2021, ages
13-18, ~100k UK teens), which is the exact country, subject, and age band as this
tier. The platform is now winding down, so it is a defunct-but-remembered brand
(the worst kind of collision). SANS holds a live US trademark in classes 9 and 41
(ours), and both cyberstart.com and cyberstart.co.uk are already registered by
the incumbent.

**"Cyber Operators" was chosen, then failed clearance (2026-07-12): AVOID.**
Reasons: "CyberOps" collides head-on with Cisco's "CyberOps Associate"
certification (exact category: cyber education/training; Cisco enforces its marks);
the short form is heavily diluted (many "CyberOps" firms globally); an active UK
education-sector company "Cyber Ops Global Limited" (SIC 85590) already trades
under the name in-jurisdiction; a "Cyber Ops" Steam game exists; and "Cyber
Operators" reads in search as an adult/military job title (armed-forces "Cyber
Operator" trade). cyberops.com/.co.uk and cyberoperators.com are taken. Unrankable
and carries real trademark-refusal/opposition risk.

**Naming principle learned:** the sibling names (Heroes, Explorers) are
*aspirational identities*, not literal job titles. Literal security job titles
(Operators, Analysts, Threat Hunters) are all descriptive, crowded, and weak as
marks. The 14-17 name must be an aspirational identity that reads more grown-up,
not a job title.

**"Cyber Vanguard" was then chosen and ALSO failed clearance (2026-07-12): AVOID.**
Both prime domains gone (cybervanguard.com parked-for-sale, .co.uk/.uk taken); term
crowded with cyber firms (active UK "CyberVanguard Dynamics Ltd" among others);
search smothered by Call of Duty: Vanguard, Riot Vanguard anti-cheat, and Vanguard
the asset manager (which runs a K-12 education programme, weakening the class
defense). Three "Cyber + aspirational word" names have now failed the identical
pattern: crowded sector, prime domains long gone, unrankable in search.

**DECISION (2026-07-12): the tier adopts "Redoubt" as its brand name.** Rationale:
after three failures the pattern is clear, so stop fighting the "Cyber ___" space.
"Redoubt" is the one distinctive name we touched that cleared (no prominent cyber
company owns it, no landmine mark in classes 9/41/42), and it UNIFIES the product
with its own fiction: the learner enrols in Redoubt, and in-story Redoubt is the
outfit that recruits them. Dropping the "Cyber ___" family pattern is a feature for
a 14-17 top tier, it reads more grown-up. `DEFAULT` full brand: "Redoubt" (possibly
"Redoubt by AlgorithmX" in catalog contexts).

**Confirming clearance result (2026-07-12): USABLE-WITH-CAVEATS. Redoubt holds.**
No blocking trademark: the only live US "REDOUBT" wordmark is Benchmade's in class 8
(knives); classes 9/41/42 (software/education/SaaS) appear open; no prominent
Redoubt education, games, or software brand exists. Confidence: US trademark
moderate-high, UK/EU register moderate (registers 403'd, inferred), company + domain
data high (fetched live).

Caveats and required actions before/at launch:
- **Domain:** every bare `redoubt.*` is taken (.com parked since 1998, .io/.co.uk/
  .uk/.app all held). `DEFAULT` primary domain: **playredoubt.com** (available, fits
  a play/learn teen product). Defensively grab `redoubt.games`, `redoubt.academy`,
  `tryredoubt.com`, `redoubthq.com`. Do not count on `.co.uk`/`.uk`.
- **Trademark:** file a UK + EU mark in classes 9/41/42 promptly to stake the name.
  Watch **Redoubt Labs Ltd** (UK company no. 17155698, inc. 2026-04-14, software-dev
  SIC) - a name-only registration confers no TM rights, but file first. Commission a
  paid attorney clearance of UKIPO/EUIPO/TMview before real spend.
- **Brand with a qualifier** ("Redoubt by AlgorithmX") - the bare word's search space
  is the Alaskan volcano + the dictionary, so plan to rank on "Redoubt cyber" etc.
- **Field is crowded but low-level:** micro cyber shops use "Redoubt" (redoubt.dk,
  North Redoubt Cyber, Redoubt Research/Group/Networks) and an FPS "Redoubt Alpha"
  uses the bare word in gaming. None is prominent; we won't own the term cleanly.
- **Connotation is an asset:** "defensive stronghold / last line of defence" is
  on-theme and empowering for 14-17 cyber-defence. Mild military adjacency is fine at
  this age band (would not be for the 6-9 tier). Market it as "fortress/defence,"
  never "combat."

**Separate flag (sibling brand, not this tier):** research indicates the LIVE
"Cyber Explorers" brand is the exact name of the UK Government's official cyber-
education platform for 11-14s (DSIT/NCSC, 50k+ registered since 2022). Same age
band and sector, currently shipping. Needs its own investigation.

---

## 10. Open decisions (the DECIDE backlog)

Ordered roughly by how soon they block work:

1. **Name - RESOLVED to "Redoubt" (clearance: usable-with-caveats).** Remaining
   actions before launch, not blocking design: buy playredoubt.com (+ defensives),
   file UK/EU trademark classes 9/41/42, attorney clearance, brand-with-qualifier.
   Section 9.
2. **Build/repo approach** - does Operators get its own worktree/repo on a
   dedicated dev port (the pattern Explorers used: algorithmx-explorers, port
   3001), or build inside the main app? Recommendation: dedicated worktree, to
   match Explorers and keep the tiers isolated.
3. **Visual and motion art direction** - the Redoubt equivalent of the Heroes
   warm-Pixar doc and the Explorers "Signal Room" doc. Must pass the inverse
   parent test vs Explorers. Still to be written as a full doc, but the flagship
   "operator's console" mockup has established these emerging signatures (validated
   in-browser 2026-07-12):
   - **Type system:** Chakra Petch (squared technical display face) on every header/
     label/wordmark so sections announce themselves; IBM Plex Mono for all terminal/
     data/code; IBM Plex Sans for prose. Distinct from the generic-system-font look.
   - **Zone color-coding:** the three primary panes carry semantic top-rules + chips -
     green = authorized/safe, indigo = live, red = threat - so the workflow reads at
     a glance and sections separate by meaning, not decoration.
   - **Signature background:** a faint procedurally-drawn star-fort (redoubt)
     blueprint - bastioned rampart, ditch rings, sight-lines, indigo inner keep -
     over a blueprint micro-grid, all at 3-8% opacity. Ties name + fiction + schematic
     aesthetic. Canvas-drawn, aria-hidden, no motion.
   - **Signature accent:** electric indigo #8B7BFF (ties to brand violet; a hue
     Explorers does not lead with). Red = threat only; green = structural/diff only.
4. **Handler casting** - gender, accent, voice; audition set.
5. **Callsign builder word lists.**
6. **Reputation ladder** - exact rank names, thresholds, quality scoring.
7. **The range's technical model** - PROPOSED in section 4 (hybrid: wasm-emulated
   targets for offensive weeks + authored data for analysis weeks; range-kernel
   module interface). Open sub-decisions: the new-dependency trade (sql.js etc.),
   and real-shell-parser vs guided-command-palette.
8. **US-English vs UK-English confirmation** (section 6).

---

End of spine. This document is canon for Cyber Operators. Update it here when a
DECIDE resolves; do not let decisions live only in chat.

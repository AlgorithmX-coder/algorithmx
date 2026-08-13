# AlgorithmX - Cyber Pro Design Spine (v2)

## The 18+ tier (public brand: "Cyber Pro"; DB slug still `cyberstart-pro`)

**Status:** Founding canon. v1 (2026-08-12) framed Pro as a career-transition
job-simulation course; **the owner rejected that on 2026-08-13 and repositioned
it** as a from-zero introduction for curious non-technical adults: theory taught
well, through real-world stories, with a hands-on play area. This v2 is the
live canon. Parallel to `docs/operators/cyber-operators-design.md` (Ops) and the
Explorers docs. Single source of truth for product, positioning, curriculum,
claims, and copy.

**Markers:** `LOCKED` = owner-decided, do not change without explicit sign-off.
`DEFAULT` = recommendation, override freely. `DECIDE` = open, recommendation
attached.

**Rule carried from the other tiers:** design locks before implementation. No
build prompt may cite a decision that is not in this document.

---

## 1. Fork record

1. **Audience - LOCKED (owner, 2026-08-13).** Adults, 18+, **absolutely new to
   cyber and curious about it.** Non-technical: a nurse, an accountant, a retail
   manager who reads about hacks in the news and wants to understand the field
   and maybe enter it. NOT people already in IT retraining for a SOC seat (that
   was the rejected v1 buyer).
2. **Teaching model - LOCKED (owner, 2026-08-13).** Theory-based and *taught*:
   concepts explained properly, with good examples, then a coding/interactive
   play area to test and experiment. "It needs to be explained to them and given
   good examples for them to understand."
3. **Real stories + real projects - LOCKED (owner, 2026-08-13).** Every measure
   we teach is anchored to a real incident where a real company skipped that
   measure and paid for it. Learners do real, measurable projects (starting with
   auditing their own security). "Mention real stories that have happened to
   companies due to them not enacting on certain measures."
4. **Price - LOCKED (owner, 2026-08-13).** £99, one-time. (Record aligned via
   PR #152.)
5. **Fiction - LOCKED (owner, 2026-08-13).** Fiction-free. No employer wrapper.
   (Detail in section 10.)
6. **Course shape - DEFAULT.** 20 weeks, four acts (section 6), ~2 hrs/week.
   Every concept runs the Learn -> See -> Try -> Check loop (section 4).
7. **Claims policy - binding.** Unchanged from v1 and now fits *better*: Security+
   is a beginner theory cert, so "aligned to Security+ objectives" is a natural
   backbone for a taught course. Full policy in section 9.
8. **The play area - DEFAULT.** A safe sandbox that grows from three buttons in
   week 1 to a real playground by week 20, including a gentle in-browser coding
   thread. Section 5.
9. **Career content - DEFAULT.** Survives from the v1 research, but demoted to
   Act 4 ("you, in this field"): the exit ramp for those who catch the bug, not
   the spine. The five-stream research artifact remains the source for salaries,
   certs, and the honest market picture.

---

## 2. North star and the four-tier ladder

**You are curious about cybersecurity and think you're "not technical enough."
By the end you understand how it all works, you have done it with your own
hands, and you can explain it to someone else.**

The defining emotion of this learner is *"I'm probably not technical enough for
this."* Every design decision answers that fear. The feeling we engineer, every
week: *"I understood that. And then I actually did it."* Being able to explain a
concept back is the real test of understanding, and it is also the first thing
"getting into the field" actually requires.

Where the v1 job-sim framing sat awkwardly below Ops (which already does
professional simulation for 14-17s), the intro framing completes the ladder:
every tier teaches understanding at its audience's level, and the adult on-ramp
is a space nobody else serves well.

| Tier | Ages | Fantasy | Verb | What they leave with |
|---|---|---|---|---|
| Cyber Heroes | 6-9 | Power | Play | Confidence |
| Cyber Explorers | 10-13 | Competence | Explore | Skills |
| Cyber Ops | 14-17 | Professional | Operate | Portfolio (simulated) |
| Cyber Pro | 18+ | Understanding | Understand + try | "I get it, I did it, I can explain it" |

---

## 3. The buyer, and why this lane is open

The learner is smart but non-technical and slightly intimidated. The market
evidence that this is the real opportunity: ISC2's free beginner cert drew
**1,000,000 sign-ups but only ~65,000 completions (6.5%)** - the funnel for
curiosity is enormous; the failure point is that nobody actually *teaches* the
curious. TryHackMe assumes you'll fight through a terminal. Coursera/Google
drown you in video. Bootcamps cost £9k and assume commitment before
understanding. A £99 course that *teaches a beginner properly, with stories and
a safe playground*, occupies empty ground.

This does not compete on lab depth or job guarantees. It competes on being the
clearest, warmest, best-told introduction to the field, with real stakes made
real through real events.

---

## 4. The teaching loop: Learn -> See -> Try -> Check

Every concept in the course runs this four-beat loop. This is the heart of the
product.

- **LEARN - the concept, taught properly.** Plain English first, then one
  everyday analogy, then the real term. A hash is a fingerprint (not a lock); a
  firewall is a bouncer with a guest list; encryption is a locked diary only two
  people have the key to. Short interactive segments with clear diagrams. Never
  hour-long videos. Adult voice: "explained like you're smart but new," never
  babied, never assuming prior knowledge.
- **SEE - a real story where this measure decided the outcome.** This is the
  spine (section 7). The concept is shown deciding a real company's fate. Theory
  taught through a true story is theory that sticks.
- **TRY - the play area.** Within minutes of learning a concept, the learner
  touches it (section 5). Understanding becomes experience.
- **CHECK - explain it back.** Not only a quiz. An "explain it to a friend"
  prompt ("how would you tell your mum why reusing one password is dangerous?").
  Explaining it is the real test, and it builds the confidence to talk about the
  field, which is where entering it begins.

---

## 5. The play area (the "coding play area" the owner asked for)

A safe lab that **grows with the learner.** Big framing rule printed on it:
*"You cannot break anything here."*

- **Progressive disclosure.** Week 1 it has three buttons; week 20 it is a real
  playground. Never a blank, intimidating terminal.
- **Concept toys, one per topic.** A password strength + time-to-crack simulator
  that shows the hash avalanche when you change one character; a visual packet
  journey (type a URL, watch DNS -> TCP -> HTTPS hop by hop); a phishing inbox to
  dissect; Caesar ciphers to break by hand then a demo of why real crypto
  differs; a toy shop website the learner SQL-injects. The Ops range already
  proves real `' OR 1=1--` injection runs in-browser via sql.js with zero
  network egress; reuse that architecture at a gentler pace.
- **The gentle coding thread - DEFAULT (scope is an open owner question).**
  In-browser Python (Pyodide, same zero-egress philosophy), woven in from ~week
  4 in tiny doses. Never "learn Python"; always "write 5 lines that DO
  something": a password checker, a Caesar cracker, a log-line counter, a toy
  port scanner against a fake network. Fully scaffolded: copy the command, then
  change one thing, then write your own line. By the end the learner has built
  ~5 tiny security tools - real "I wrote code that did something" moments.
- **The analyst console** (built then parked as PR #163, branch
  `feat/pro-console-skeleton`) is NOT the spine. It re-enters late (Act 3, ~week
  14) as the detection/logs play surface, *after* the learner has been taught
  what a log, an IP, and an event are. Deep end at the end.

---

## 6. The 20-week arc: four acts - DEFAULT

Story-driven throughout. Each concept names the measure, tells the company that
skipped it, states the cost, then hands the learner the play area. The recurring
device is the **Cyber Essentials five-controls scorecard** (firewalls, secure
configuration, access control, malware protection, patching): every story ends
with "which of the five would have stopped this?", so by week 20 the learner has
scored twenty real disasters against the same five measures.

**Act 1 - The digital world you already live in (wks 1-5).** How the internet
actually works; where your data really lives; passwords and hashing; encryption
all around you; who attackers really are (kill the hoodie myth, show the real
cybercrime economy). *Project: Personal Security Audit.*

**Act 2 - How attacks actually happen (wks 6-11).** Phishing and social
engineering; malware families through famous cases; web attacks in the toy
range; Wi-Fi and network tricks; the anatomy of a data breach; ransomware.
*Project: Phishing Field Guide + first Breach Post-Mortem.*

**Act 3 - How defenders fight back (wks 12-16).** Defence in depth; detection
and logs (the console enters); incident response as a story; backups and
segmentation; the tools of the trade. *Project: Small-Business Risk Assessment
against the five controls.*

**Act 4 - You, in this field (wks 17-20).** Day-in-the-life tasters (analyst,
pen tester, GRC); the honest UK career map (salaries, the cert roadmap, the next
90 days - all from the research artifact); then a capstone: investigate one full
toy breach end to end and write both a post-mortem and a plain-English board
briefing. Full circle - arrived non-technical, leaves able to explain it to the
non-technical.

Detailed week-by-week buildsheet is a follow-up doc (`docs/pro/buildsheet.md`),
authored act by act once the Week 1 loop prototype is signed off.

---

## 7. The story bank (the teaching spine)

Every measure is anchored to a real, publicly-documented incident. **Authoring
rule - LOCKED discipline:** every story is source-verified at authoring time
against primary documents (ICO enforcement notices, official company
post-mortems, court records, regulator findings). We state only the public
record. This mirrors the landing's sourced-stats rule and keeps us legally
clean. The bank below is the starting set; expand with the same discipline.

**Passwords / storage:** RockYou 2009 (32M plaintext, the origin of
`rockyou.txt`); LinkedIn 2012 (117M unsalted hashes cracked).

**MFA / access control:** Colonial Pipeline 2021 (one legacy VPN account, no
MFA, US East Coast fuel panic); British Library 2023 (no MFA on one server ->
ransomware; their own public post-mortem names it - quote their report);
Change Healthcare 2024 (no MFA on a Citrix portal, >$2bn, US healthcare chaos).

**Phishing / BEC:** Google + Facebook (~$100M to fake invoices); Twitter 2020
(a phone call -> Obama/Musk accounts).

**Helpdesk social engineering (current, UK):** M&S 2025 (helpdesk talked into a
reset, ~six weeks of dead online orders, ~£300M); MGM Resorts 2023 (a ten-minute
call, ~$100M). Measure: identity verification before resets.

**Patching:** Equifax 2017 (known fix delayed, 147M people, ~$700M); WannaCry vs
the NHS 2017 (patch existed two months, 19,000 appointments cancelled).

**Web attacks (SQLi):** TalkTalk 2015 UK (injection via a forgotten legacy page,
teenagers, £77M, CEO on national TV) - taught right after the learner performs
the same injection in the sandbox.

**Detection / monitoring:** Target 2013 (the alert fired, nobody acted, 40M
cards, CEO out); Marriott (intruders inside four years, £18.4M UK fine).

**Segmentation + backups:** Maersk / NotPetya 2017 (flat network, $300M, 45,000
PCs, saved by one offline office in Ghana).

**Posture / honesty (the positive case):** Norsk Hydro 2019 (refused to pay,
communicated honestly daily, reputation enhanced) vs Uber 2016 (hid the breach,
security chief criminally convicted).

**Regulator is real (UK layer, Act 4):** ICO fines mapped to the failure - BA
£20M (script skimming), Marriott £18.4M (detection), TalkTalk £400k, Advanced/NHS
£3M (an account without MFA - again).

---

## 8. Real-life projects (the learner's measurable work)

The reward economy of this tier is *understanding made visible through real
work*, not XP or badges. Five projects, each measurable:

1. **Personal Security Audit** (Act 1): run the measures on their own life -
   breach-exposure check, password manager migration, MFA on their top five
   accounts. Before/after scorecard. Immediately valuable.
2. **Phishing Field Guide** (Act 2): dissect defanged real samples, produce a
   one-page "tells" guide fit to hand a relative.
3. **Breach Post-Mortems** (recurring, one per act): pick an incident from the
   bank, write one page - what happened, which measure was missing, what it
   cost, what you would have done. Rubric-checked.
4. **Small-Business Risk Assessment** (Act 3): map a real small business they
   know against the five controls.
5. **Capstone** (Act 4): investigate one full simulated breach end to end, then
   write the post-mortem *and* a one-page plain-English board briefing.

---

## 9. Claims policy (binding for all Pro copy)

**Safe and encouraged:**
- "Aligned to CompTIA Security+ (SY0-701) exam objectives" - and it fits this
  taught beginner course better than it fit the v1 job-sim.
- "Mapped to CyBOK" with a published per-module knowledge-area table.
- "Built around the UK Cyber Security Council's Cyber Career Framework
  specialisms" (descriptive; no logo, no "endorsed/recognised/accredited").
- "Prepares you to apply for Associate Cyber Security Professional (ACSP)
  registration" (verify fees/windows on the Council site before each copy ship).
- The honest market stats (sourced) when Act 4 career content appears.

**Banned:**
- Any NCSC marketing presence (badges, "aligned with" rows). NCSC appears in
  course *content* only (Cyber Essentials, guidance). The current landing's NCSC
  badge was removed in the rebuild (PR #159) - keep it off.
- Job guarantees or placement-rate claims.
- "3.5M unfilled jobs", the 11,100 UK shortfall, "record vacancies".
- "Certification included", "certified by AlgorithmX".
- Any real incident detail beyond the sourced public record (see section 7
  authoring rule). No naming of individuals not already public; no unproven
  causal claims - state what the regulator/company/court stated.

**House rules:** no em-dashes in site copy; pricing appears on the course
landing page only (marketing-vs-info rule).

---

## 10. Fiction - LOCKED: fiction-free (owner, 2026-08-13)

Pro runs without an employer fiction. The learner is a curious adult being
taught, not a character in a story. HUD/aesthetic chrome is fine ("CYBER PRO //
INTRO TRACK") but there is no in-universe employer. Rationale: the differentiator
is clarity and honesty; a fictional wrapper fights the "explained plainly to a
real beginner" tone. ARC stays Explorers canon; Redoubt stays Ops canon; neither
appears in Pro.

Note: the drafted trailer's trust beat ("Cyber Pro - Trust Beat" artifact) and
its "real job market" framing were built for the v1 positioning and need
re-shooting for the intro course. Trailer deck source is still not in the repo -
owner builds it elsewhere.

---

## 11. Landing + data state

- **Landing** (`app/cyberstart-pro/`): rebuilt in PR #159 for the v1 job-sim
  positioning (Straight Answers, six analyst-skill cards, Finish With a
  Portfolio). **This now overshoots the intro audience** - it reads as a job
  course. Needs a copy pass to the intro promise: "understand it, then try it
  yourself," beginner-friendly, stories-and-play-area led. Alignment trio (CyBOK
  / Security+ / hands-on) still valid; NCSC badge stays off.
- **Product record**: aligned via PR #152 (Cyber Pro, 18+, £99, 2 hrs/week).
  **Prod DB row still shows the old values** until the owner runs `npm run seed`
  or the one-row SQL in #152 - hero/facts read £149 / CyberStart Pro until then.
- **Slug rename** `cyberstart-pro` -> `cyber-pro`: still a separate open decision
  (routing + Stripe).

---

## 12. What carried over from v1, what changed

- **Kept:** the £99 price, fiction-free, the claims policy, Security+/CyBOK/ACSP
  alignment, the honest-tone rule, the five Cyber Essentials controls as a
  teaching device, and all the market research (now Act 4 material).
- **Changed:** buyer (curious non-technical beginner, not IT retrainer); spine
  (teach theory through real stories + play area, not simulate a SOC job);
  reward economy (measurable real projects, not a job portfolio); the analyst
  console demoted from spine to a late-course play surface (PR #163 parked).
- **Superseded:** the v1 "curriculum spine" (SOC triage/SIEM/EDR/ATT&CK as the
  core) and the v1 20-week arc. Those skills now appear as *understanding*, not
  job drills, and mostly in Act 3.

---

## 13. Sources

Full sourced market findings: "Cyber Pro: Career-Entry Research Brief" artifact
(2026-08-12). Story-bank incidents to be re-verified against primaries at
authoring time (ICO notices, company post-mortems, court records) per section 7.

# AlgorithmX - Cyber Pro Design Spine
## The 18+ tier (public brand: "Cyber Pro"; DB slug still `cyberstart-pro`)

**Status:** Founding canon, opened 2026-08-13 from the five-stream career-entry
research of 2026-08-12 (full sourced brief: the "Cyber Pro: Career-Entry Research
Brief" artifact; condensed pointers in the session memory). The parallel to
`docs/operators/cyber-operators-design.md` (Ops) and the Explorers docs. Single
source of truth for product, positioning, curriculum, claims, and copy decisions
for the adult tier.

**Markers:** `LOCKED` = owner-decided, do not change without explicit sign-off.
`DEFAULT` = research-backed recommendation, override freely. `DECIDE` = genuinely
open, recommendation attached.

**Rule carried from the other tiers:** design locks before implementation. No
build prompt may cite a decision that is not in this document.

---

## 1. Fork record

1. **Audience and purpose - LOCKED (owner, 2026-08-12).** Adults, 18+, who want
   to enter the cybersecurity industry. The buyer is the learner. This is a
   career product, not an enrichment product; every design choice answers to
   "does this make the learner more hireable".
2. **Price - LOCKED (owner, 2026-08-13).** £99, one-time. Matches the sibling
   tiers and powers the core sales story: one payment vs the TryHackMe
   subscription treadmill (£14.99/mo) vs £9,500+ bootcamps.
3. **Positioning - DEFAULT.** The career-transition course, not a lab platform.
   The white space nobody under £400 fills: skills + portfolio artifacts + UK
   navigation + honest expectations, finite, with a real finish line.
4. **Target job - DEFAULT.** Blue-team first. The curriculum trains the SOC
   Tier 1 / junior analyst loop, with GRC awareness. Pen testing is 2% of UK
   postings and never a first job; offense appears only as attacker-empathy.
5. **Course shape - DEFAULT.** 20 weeks. Each week: ~2h guided core in-browser
   plus signposted free-tier homework (~2-3h), with the 150-300h path to
   job-ready stated honestly in-course.
6. **The product of the course - DEFAULT.** A portfolio, not a certificate.
   Five artifacts every learner exits with (section 7). No AlgorithmX
   certification claim, ever.
7. **Claims policy - DEFAULT (treat as binding until overridden).** Align to
   CyBOK and Security+ objectives; reference the UKCSC framework and ACSP
   descriptively; zero NCSC marketing presence; no job guarantees; no debunked
   market stats. Full policy in section 9.
8. **Fiction - LOCKED (owner, 2026-08-13).** Fiction-free. No employer wrapper;
   the learner is an analyst in training and the incidents are realistic but
   unbranded. ARC stays Explorers canon; Redoubt stays Ops. See section 10.
9. **Canonical product record - RESOLVED 2026-08-13.** Aligned via PR #152
   (name "Cyber Pro", 18+, £99, 2 hrs/week; slug unchanged). The slug rename
   `cyberstart-pro` -> `cyber-pro` remains a separate open decision.
10. **First build - LOCKED (owner, 2026-08-13).** The analyst console walking
   skeleton: alert queue, log viewer, enrichment, ticket editor, plus ONE
   complete playable alert end to end, before any week authoring. The
   portfolio system rides in the skeleton from day one, even in crude form.
   Ops precedent (engine-first, walking-skeleton-first) carried over.

---

## 2. North star and the four-tier ladder

**You are becoming employable in cyber, and everyone selling to you is lying
except us.**

Heroes gives a child a power fantasy; Explorers a competence fantasy; Ops a
professional fantasy. Pro is the rung where fantasy ends: the learner is an
adult spending their own £99 against a market full of subscription treadmills,
checkbox certificates, and collapsed £9,500 bootcamps. The tier's emotional core
is *being treated like an adult*: the real market, the real skills, the real
timeline, and evidence a hiring manager will actually read.

| Tier | Ages | Fantasy | Verb | Product of the course |
|---|---|---|---|---|
| Cyber Heroes | 6-9 | Power | Play | Confidence |
| Cyber Explorers | 10-13 | Competence | Explore | Skills |
| Cyber Ops | 14-17 | Professional | Operate | Portfolio (simulated) |
| Cyber Pro | 18+ | None: reality | Transition | Portfolio + a job hunt that works |

---

## 3. The buyer and the market truth

The learner is a career changer (finance, support, retail, forces, teaching) or
a graduate who missed the funnel. Research says career changing demonstrably
works: 46% of professionals came from outside the field, 28% of UK sector hires
are converters. But the entry market is oversubscribed and honesty about it is
the tier's trust engine.

**Stats we use (2025-2026 editions only, keep sourced):**
- UK core postings 32,370 in 2024, down 33%; entry-level share 17%; 63% of
  postings want 2-6 years (DSIT 2025).
- Analyst roles 28% of postings; pen tester 2% (DSIT 2025).
- First-role salary £27-40k outside London; London +13-25%; £55k median across
  core cyber (Glassdoor/Barclay Simpson 2026; DSIT 2025).
- 46% came from outside the field (ISACA 2025); 90% of hiring managers will
  consider IT-experience-only candidates (ISC2 2025).
- 84% of employers run skills-based assessments (ISC2 2025).

**Stats we never use:** "3.5M unfilled jobs" (debunked marketing projection),
the old 11,100 UK shortfall (now ~3,800), "record vacancies", any job-guarantee
framing, bootcamp salary hype.

---

## 4. Positioning and the lane

**The lane:** career transition. Task-training platforms (TryHackMe, HTB) train
tasks with no career layer, no finish line, no UK context. Credential products
(Google cert, ISC2 CC) issue checkboxes. Bootcamps coach at 100x the price with
publicly collapsed trust (2U bankrupt 2024, ThriveDX imploded, CAPSLOCK absorbed
into mthree 2026-06).

**We do not compete on:** lab infrastructure at THM/HTB scale, our own proctored
cert, catalog breadth, video theory (free already, see Professor Messer), job
guarantees. Instead we *prescribe* free-tier THM rooms and free tools
(Wireshark, home SIEM) as embedded homework: the biggest competitor becomes our
free lab appendix and infra cost stays near zero.

**Credibility floor next to a £14/mo sub:** real hands-on every week, one
flagship end-to-end incident, honest outcome language, and the UK layer nobody
else has (clearance, Cyber Essentials, apprenticeship routes, real salary
bands).

**Positioning line to test:** "The £99 course that treats you like an adult:
the real market, the real skills, and the evidence that gets interviews."

---

## 5. Curriculum spine

**Depth calibration (governs everything):** a Tier 1 hire *interprets rather
than engineers*. Reads a CIDR range, does not design subnets. Reads Kerberos
logs, does not administer AD. Triages malware in 30 minutes, does not
reverse-engineer it.

**Must-have (the finite core, teaching order):**
1. Alert triage as the spine: simulated queue; classify, enrich, decide,
   document, escalate. Real SOCs run 20-100 alerts/shift at ~50:1 noise.
2. Log reading: Windows events first (4624/4625 + logon types, 4688, Kerberos
   4768/4769), Linux auth logs, correlation by account/IP/time. The most
   interview-tested skill.
3. One SIEM deeply (Splunk SPL) + Sentinel/KQL taster. UK entry SOCs are
   Microsoft-stack (Security+ ads co-occur Microsoft 88%, Azure 83%).
4. Phishing end-to-end: headers, SPF/DKIM/DMARC, reputation, sandbox reading,
   ticket + user comms, and the modern M365 tail (inbox rules, OAuth grants).
5. Networking/OS foundations woven into investigations, interpretation depth
   only. Never front-loaded theory.
6. IR process (PICERL) + ATT&CK literacy: every sim alert maps to a technique
   ID; interviews now ask candidates to draft detections from ATT&CK behaviors.
7. EDR process trees: parent-child, command lines, unsigned binaries, host
   isolation as containment.
8. The AI-assisted analyst: copilot for enrich/summarize/draft, plus the
   verification discipline. The 2026 differentiator; fits the browser-sim
   engine natively; also future-proofs against AI flattening pure triage.
9. The job-hunt layer: career-changer CV translation, ATS keywords, the six
   canonical interview scenarios, a mock live log-read, the cert roadmap.

**Should-have:** vuln scanner literacy + one written VA report (CVSS read,
EPSS/KEV prioritization); threat-intel enrichment workflow (VT, AbuseIPDB,
URLScan, OTX); Entra/M365 identity-log module; one guided Python IOC-enrichment
script; GRC awareness in one module (NIST CSF, ISO 27001 shape, Cyber
Essentials' five controls, GDPR basics); a published skills matrix mapping
modules to the NICE Cyber Defense Analyst role + CyBOK KAs.

**Cut:** pen-testing tracks, full malware RE, AD administration, deep AWS,
cert-question drilling, CTF flags without write-up output, a GRC career track
(separate product if ever).

---

## 6. The 20-week arc - DEFAULT

| Weeks | Beat | Portfolio artifact |
|---|---|---|
| 01 | The real map: market truth, roles, salary bands, bridge strategy, route plan | - |
| 02-03 | Foundations in context: ports/protocols/CIDR reading, Linux CLI parsing, Windows event anatomy | - |
| 04-06 | The triage loop: alert queue sim, Splunk SPL deep, KQL taster | Detection-rules repo started |
| 07-08 | Phishing end-to-end | Investigation write-up #1 |
| 09-10 | Identity & cloud: Entra sign-in logs, MFA fatigue, inbox rules, OAuth | Write-up #2 (brute force/identity) |
| 11-12 | Malware triage + EDR process trees | Write-up #3 |
| 13 | Threat intel + automation | Python IOC script + README |
| 14 | Vulnerability management | VA report |
| 15 | IR formalized: PICERL, containment, ATT&CK mapping across all prior work | - |
| 16 | GRC & UK reality: CSF, ISO 27001, Cyber Essentials, GDPR, clearance literacy, ACSP | - |
| 17 | The AI-assisted analyst | - |
| 18-19 | Capstone: multi-stage intrusion investigated end-to-end | Capstone incident report |
| 20 | Job-hunt sprint: CV, ATS, six interview scenarios, mock log-read, cert roadmap, portfolio publication | Published portfolio |

---

## 7. Portfolio artifacts (the reward economy of this tier)

Heroes has XP/badges, Explorers a clearance ladder, Ops reputation with Redoubt.
Pro's meta-game is the portfolio itself: five artifacts, produced inside the
course, publishable to GitHub/blog, ATT&CK-mapped where relevant.

1. Three investigation write-ups (phishing; brute-force/identity; malware
   triage) in professional ticket format.
2. 3-5 detection rules (SPL and/or Sigma) with tuning notes, in a clean repo
   with a real README.
3. One vulnerability assessment report with prioritization + remediation.
4. One small automation script with documentation.
5. The capstone incident report: detection through PICERL to lessons learned.
   The interview centerpiece.

Rationale: 84% of employers skills-test; hiring managers state they hire
evidence over cert-stacks; no competitor under £400 produces artifacts
deliberately.

---

## 8. Certification strategy

Posture: **teach toward, prep for, complement.** Align the curriculum to
Security+ SY0-701 objectives and say so; include a cert-roadmap module; never
claim "certification included".

- **Anchor:** CompTIA Security+ (~£300; #1 cited cert in UK entry ads).
- **UK stack:** Microsoft SC-200 (£113; Sentinel/Defender) + optional SC-900.
- **Step 2:** BTL1 (£399, UK, practical) or CySA+ (~£330-390, ATS-shaped).
- **Anti-hype guidance we give learners:** CEH is a £950 HR keyword, buy only
  if a target employer names it; OSCP is a later specialization, usually
  employer-funded; CISSP is the year-5 milestone; SANS/GIAC is employer-budget
  territory; ISC2 CC's free route died 2026-05-20.
- **Honest total to first job:** ~£800-950 in exams over 9-15 months. The
  course walking this roadmap (including what NOT to buy) pays for itself.

---

## 9. Claims policy (binding for all Pro copy)

**Safe and encouraged:**
- "Mapped to CyBOK" with a published per-module knowledge-area table
  (self-evidencing; CyBOK has a mapping framework for professional training).
- "Built around the UK Cyber Security Council's Cyber Career Framework
  specialisms" (descriptive; no logo, no "endorsed/recognised/accredited").
- "Prepares you to apply for Associate Cyber Security Professional (ACSP)
  registration" (launched April 2026, route-agnostic; verify fees/windows on
  the Council site before each copy ship).
- "Aligned to CompTIA Security+ (SY0-701) exam objectives."
- The honest market stats in section 3, with sources.

**Banned:**
- Any NCSC marketing presence (badges, "aligned with" rows). Assured Training
  requires a paid APMG assessment we have not done; CyberFirst is 11-19 and
  dissolving into TechFirst; CCP is closed. NCSC appears in course *content*
  only (Cyber Essentials, guidance). **The current landing's NCSC badge comes
  off in the rebuild.**
- Job guarantees or placement-rate claims.
- "3.5M unfilled jobs", the 11,100 shortfall, "record vacancies".
- "Certification included", "certified by AlgorithmX".
- Parent-trust content (ICO Children's Code, loot-box lines): wrong buyer.

**House rules that apply:** no em-dashes in site copy; pricing appears on the
course landing page only (marketing-vs-info rule), so any asset that leaves the
landing page drops the £99 line.

---

## 10. Fiction - LOCKED: fiction-free (owner, 2026-08-13)

Pro runs without an employer fiction. The learner is an analyst in training;
alerts and incidents are realistic but unbranded. HUD chrome stays as
*aesthetic* ("CYBER PRO // CAREER TRACK") without an in-universe employer, and
trust beats read plain. Rationale: the tier's whole differentiator is honesty
and adulthood; a fictional employer wrapper undercuts the straight-talk tone.

History: the drafted trailer had borrowed "ARC SECURE NET // FIELD FEED" and
"CLASSIFIED // ARC-EYES-ONLY"; ARC is Explorers canon (the 10-13 tier) and
Redoubt is Ops canon. Neither appears in Pro. The rejected alternative (a
defensive Redoubt-equivalent with a new name) is on record in case the sim
engine ever needs a client frame; re-open only with owner sign-off.

Trailer trust-beat replacement (built 2026-08-13, "Cyber Pro - Trust Beat"
artifact): kicker "BUILT FOR THE REAL JOB MARKET"; ticks = CyBOK mapping,
Security+ alignment, portfolio; caption "£99 once. No subscription. No fine
print." (landing-hosted only; price-free alternative: "One payment. A real
finish line. Evidence employers ask for.").

---

## 11. Data consistency + build notes

- Seed (`prisma/seed.ts`): `cyberstart-pro` still carries name "CyberStart
  Pro", ages 16-18, £149 (14900), 75 min/week, 0 weeks. Align to: display name
  "Cyber Pro", 18+, **£99 (9900, LOCKED)**, 20 weeks, ~2 hrs/week guided.
  One surgical PR per the separate-PRs rule.
- Landing (`app/cyberstart-pro/`): placeholder waitlist page; copy says "older
  teens and adults" (change to adults); NCSC badge present (remove); feature
  cards are stubs (replace with the section 4/5 positioning when rebuilt).
- Homepage catalog + Heroes cross-sell strip: verify they match the canonical
  record after the seed PR.
- Slug/DB rename `cyberstart-pro` -> `cyber-pro` is a separate open decision
  (carried from the 2026-07 phone pass); routing + Stripe implications; do not
  bundle with the data PR.

---

## 12. Sources

Full sourced findings: "Cyber Pro: Career-Entry Research Brief" artifact
(2026-08-12; five research streams, UK-weighted, all claims dated). Key
primaries: DSIT Cyber security skills in the UK labour market 2025; ISC2
Workforce/Hiring 2024-25; ISACA State of Cybersecurity 2025; Barclay Simpson
2026; ITJobsWatch 2025-26; UKCSC (Career Framework, ACSP); cybok.org; NCSC;
vendor pricing pages 2025-26.

# AlgorithmX - Cyber Pro Design Spine (v3)

## The 18+ tier (public brand: "Cyber Pro"; DB slug still `cyberstart-pro`)

**Status:** Founding canon. Two prior framings were superseded on 2026-08-13:
v1 (career-transition job-simulation) and v2 (gentle taught intro). This **v3**
is the live canon: a **from-zero-to-hired course built entirely on real systems,
real data, and real organisations**, that starts as a taught non-technical
introduction and ramps to serious hands-on defensive and offensive work with a
real-artefact portfolio. Parallel to `docs/operators/cyber-operators-design.md`
(Ops) and the Explorers docs. Single source of truth for the adult tier.

**Markers:** `LOCKED` = owner-decided, do not change without explicit sign-off.
`DEFAULT` = recommendation, override freely. `DECIDE` = open, recommendation
attached.

**Rule carried from the other tiers:** design locks before implementation. No
build prompt may cite a decision that is not in this document.

---

## 1. Fork record (owner decisions, 2026-08-13)

1. **Audience - LOCKED.** Adults, 18+, **starting absolutely new and
   non-technical**, curious about cyber. The course ramps them to job-ready. Not
   assumed-technical retrainers (v1); not a stay-curious intro that never gets
   serious (v2). It is **0-to-hired**.
2. **Realism principle - LOCKED.** Everything runs on **real systems, real data,
   and real organisations. No invented companies, no made-up scenarios.** Play
   areas recreate real conditions and use real data (real breach CVEs, real
   malware captures, real attack traffic), never fictional toys.
3. **Teaching model - LOCKED.** Theory *taught* properly, then hands-on. Every
   concept runs **Learn -> See (a real case) -> Try (real lab) -> Check (explain
   it back)** (section 7).
4. **Core vs premium split - LOCKED.** The **£99 self-paced software** is the
   core: taught lessons + self-directed real labs + a real-artefact portfolio +
   the job-hunt machinery. The **human-services layer** (supervised real-client
   work, live mentored cohorts, practitioner office hours, an employer/MSP hiring
   pipeline) is a **separate premium tier / Phase 2**, because it needs staff,
   professional indemnity insurance, and partnerships that £99 self-paced cannot
   fund or safely deliver. Section 5.
5. **Price - LOCKED.** £99, one-time, for the core. Premium tier priced
   separately if/when built.
6. **Fiction - LOCKED.** Fiction-free. Real orgs and real data are the content;
   no employer wrapper. Section 17.
7. **Coding thread - LOCKED.** Real tools, including tiny in-browser Python
   (Pyodide) used as one real tool among many (honeypot, SIEM, sandbox). Not
   "learn to program"; "use code to do a real security task."
8. **Format - LOCKED.** Designed for **5-8 hours a week**, evenings and
   weekends, with proper save/resume. (Cohort deadlines + community = premium.)

---

## 2. North star and the four-tier ladder

**You start knowing nothing technical. You finish able to do the real defensive
job, with a portfolio of real work and the machinery to get hired.**

The learner's defining fear at the start is *"I'm not technical enough."* Early
weeks answer that with taught fundamentals and real stories; later weeks turn
them into someone who has deployed a honeypot, triaged real attack traffic in a
SIEM, and rebuilt a famous breach in a lab. The emotional arc: *"I understand
this"* -> *"I did this on a real system"* -> *"I can show an employer."*

| Tier | Ages | Verb | What they leave with |
|---|---|---|---|
| Cyber Heroes | 6-9 | Play | Confidence |
| Cyber Explorers | 10-13 | Explore | Skills |
| Cyber Ops | 14-17 | Operate | Portfolio (simulated) |
| Cyber Pro | 18+ | Do it for real | A real-artefact portfolio + a route to hired |

---

## 3. The buyer and the lane

Smart, non-technical, curious, slightly intimidated at the start; motivated by a
real career change. Evidence the funnel is real: ISC2's free beginner cert drew
~1,000,000 sign-ups but only ~65,000 completions (6.5%) - huge curiosity, and
the failure point is that nobody teaches the curious *and* carries them to
job-ready.

**The lane, explicitly positioned between two options:**
- **Free routes** (TryHackMe, PicoCTF, Professor Messer): rich content, no
  teaching scaffold, no portfolio machinery, no job layer, easy to stall in.
- **£4,000-8,000 bootcamps**: cohorts, mentors, outcomes - at a price and
  commitment most cannot make.

**Our wedge:** taught fundamentals + real-world hands-on projects on real data +
the job machinery, at £99 self-paced, with a documented premium layer for those
who want mentored real-client work. We beat free on structure and outcomes; we
beat bootcamps on price and access.

---

## 4. Job roles as the map - LOCKED framing

Modules map to **real job roles and their daily workflows**, balanced
**blue-team-heavy because most real entry jobs are defensive**:
- **SOC analyst** (primary target role): monitoring, alert triage, SIEM, log
  analysis, escalation.
- **Incident responder**: the response lifecycle, malware/traffic analysis,
  writing the incident report.
- **GRC / risk & audit**: Cyber Essentials, risk registers, frameworks, awareness.
- **Penetration tester** (minority, later, ethics-gated): OWASP Top 10, finding
  and exploiting a real CVE in a lab, responsible disclosure.

Honest framing throughout: the realistic first job is **IT support or SOC analyst
(~£25-32k UK)**, not pen testing. Roles are taught as "here is the job, here is a
day in it, here is you doing a slice of it."

---

## 5. Core (£99 software) vs Premium (Phase 2) - LOCKED split

**In the £99 self-paced core (I build this):**
- Taught lessons (Learn -> See -> Try -> Check).
- Self-directed real labs the learner runs themselves: honeypot on their own
  cheap VPS, SIEM (Wazuh/Elastic/Splunk) on their own data, real malware-traffic
  captures, a documented home lab, breach recreations of real CVEs.
- The case-study engine ("find the decision point", section 8).
- A real-artefact portfolio (section 11).
- The full job-hunt machinery (section 13).
- Bug bounty / vuln-disclosure and passive OSINT taught as **self-directed**
  legal work within published scope on the learner's own initiative - no
  AlgorithmX brokering, so no AlgorithmX liability.

**Premium tier / Phase 2 (NOT in the £99 core; documented, not built):**
- **Supervised real-client work**: Cyber Essentials readiness assessments,
  audits, staff awareness sessions, phishing simulations for consenting
  businesses - each with written authorisation, tight scoping, instructor
  supervision, and professional indemnity insurance.
- **Live cohorts** with deadlines and a community space; practitioner office
  hours; mentor access; guest practitioners reviewing learner reports.
- **Hiring pipeline**: relationships with MSPs and SOC teams willing to interview
  grads; success measured as "did they get hired."

Rationale: the premium items require staff, insurance, and partnerships - the
£4-8k bootcamp's cost base. Keeping them out of the £99 core keeps the price
honest and the liability contained; offering them as a premium tier captures the
learners who want the full outcome machinery.

---

## 6. Realism principle in practice - LOCKED

No invented companies, no made-up scenarios. Concretely:
- **Real data**: real breach password dumps for the hashing lesson (e.g. the
  public RockYou list as a teaching artefact), real PCAPs from
  malware-traffic-analysis.net, real attack traffic from the learner's own
  honeypot, real CVEs.
- **Real conditions recreated**: install the actual vulnerable software version
  behind a famous breach (e.g. the Apache Struts build behind Equifax) and work
  the real CVE.
- **Real frameworks** as the spine (section 14): MITRE ATT&CK, OWASP Top 10,
  Cyber Essentials, NCSC guidance.
- **Browser toys allowed** only when they compute on real primitives (a real
  SHA-256 via the browser crypto API, a real SQL engine via sql.js) - real
  mechanisms at a gentle pace, not invented fictions.

---

## 7. The teaching loop: Learn -> See -> Try -> Check

Every concept runs this loop.
- **LEARN** - taught properly: plain English, one everyday analogy, then the real
  term and why it matters. Short interactive segments and clear diagrams, never
  hour-long video. Adult voice: smart but new, never babied.
- **SEE** - a real case where this measure decided a real organisation's fate
  (sections 8-9).
- **TRY** - the real lab or play area (section 10): touch the real mechanism
  within minutes of learning it.
- **CHECK** - explain it back ("how would you tell a colleague why this
  happened?"), plus scenario/CTF assessment, not multiple choice (section 14).

---

## 8. Case-study method: "find the decision point" - LOCKED

Each breach is taught as a decision that was missed, in three moves:
1. **Recreate the real technical conditions** in the lab (the real vulnerable
   version, the real misconfiguration).
2. **Let the learner hunt** for the flaw themselves.
3. **Reveal what the company actually did** - and the full adult consequences:
   ICO fine, breach cost, board accountability, insurance fallout.

A recurring **"this month's breach"** slot keeps the material current.

---

## 9. The story bank (sourced spine)

**Authoring rule - LOCKED:** every case is source-verified at authoring time
against primary documents (ICO enforcement notices, official company
post-mortems, court records, regulator findings). State only the public record.

Anchor cases (each taught as a missed decision, tagged to the Cyber Essentials
five controls):
- **Equifax 2017** - a known Apache Struts patch (CVE-2017-5638) not applied;
  147M people; ~$700M; recreate the vulnerable Struts build and work the CVE.
- **NHS / WannaCry 2017** - unpatched legacy Windows; ~19,000 appointments lost.
- **TalkTalk 2015 (UK)** - SQL injection via a legacy page; ICO fine £400k;
  learners perform the injection in the lab first.
- **Colonial Pipeline 2021** - one account, no MFA; US East Coast fuel panic.
- **M&S and Co-op 2025 (UK)** - help-desk social engineering; weeks of outage.
- **British Library 2023** - ransomware; **they published their own
  lessons-learned report**, a real post-mortem written by the victim; use it
  directly.
- **British Airways 2018** - card-skimming script; ICO fine £20M.
- Growing bank: LinkedIn 2012 (unsalted hashes), Target 2013 (the alarm that
  rang), Maersk/NotPetya 2017 (flat network), Norsk Hydro 2019 (the positive
  case: refused to pay, communicated honestly, reputation enhanced).

---

## 10. The play area and real labs

Grows from taught browser toys in early weeks to real infrastructure the learner
runs themselves, with a framing rule on the early toys: *"You cannot break
anything here."*
- **Early (taught, in-browser, real primitives):** password strength +
  time-to-crack + real SHA-256 avalanche; a visual packet journey; a phishing
  inbox to dissect; SQL-inject a real in-browser SQL engine (sql.js, zero egress).
- **Coding thread:** tiny in-browser Python (Pyodide) doing real tasks (a
  password checker, a log-line parser).
- **Real infrastructure (self-directed, guided):** deploy a honeypot on a cheap
  VPS and analyse genuine attack traffic; stand up a SIEM (Wazuh/Elastic/Splunk)
  and triage the real alerts; work real PCAPs from malware-traffic-analysis.net;
  detonate real samples in an isolated sandbox; build and document a home lab.
- **The analyst console** (built then parked, PR #163, branch
  `feat/pro-console-skeleton`) re-enters as a **guided detection/triage surface**
  in the SOC/SIEM module, after the learner knows what a log and an alert are.

---

## 11. Real projects = the portfolio (the reward economy)

Not XP/badges. The learner accumulates **real artefacts** an employer respects:
- **Personal Security Audit** (early): run the measures on their own life;
  before/after scorecard.
- **Honeypot capture + analysis**: real attacker traffic, written up.
- **SIEM triage report**: real alerts triaged and documented.
- **Malware traffic / sandbox incident report**: from a real PCAP or detonation.
- **Breach recreation write-up**: found, exploited, and patched a real CVE.
- **Risk register / audit report / playbook**: the GRC artefacts.
- **Capstone**: a full incident investigated end to end, plus a plain-English
  board briefing. Full circle - arrived non-technical, leaves able to brief the
  non-technical. (Premium adds a *real* risk briefing to invited practitioners.)

Every deliverable is a real artefact forming an employability portfolio.

---

## 12. Legal and ethics - LOCKED, taught from lesson one

- **Computer Misuse Act 1990** introduced in the first lessons; responsible
  disclosure taught explicitly.
- Anything touching a real system requires **written authorisation and tight
  scoping**. Offensive work stays inside sandboxed labs or **published bug bounty
  scope** (HackerOne/Bugcrowd) only.
- Passive OSINT uses **public data only**, against a consenting organisation.
- The premium real-client layer additionally requires **professional indemnity
  insurance and instructor supervision** (section 5).

---

## 13. Career transition machinery (in the core)

- Success framed honestly as **getting hired**, with realistic expectations:
  first role is IT support or SOC analyst (~£25-32k UK), not pen testing.
- **Security+ objectives** as the alignment backbone; **ISC2 CC** as a cheap
  early win.
- A module on **positioning a prior career as an asset** (finance -> GRC,
  teaching -> awareness training, IT support -> SOC).
- **CV and LinkedIn tailoring**, ATS-friendly wording, **mock interviews** with
  scenario questions.
- Signpost **BSides and local meetups** for networking.
- (Premium builds the MSP/SOC interview pipeline; the core teaches the learner to
  work it themselves.)

---

## 14. Assessment and credibility

- **Assess by doing**: scenario performance, CTF-style challenges, portfolio
  review. **Not multiple choice** as the spine (short knowledge checks are fine
  inside the Learn loop).
- **Recognised frameworks as the credibility spine**: MITRE ATT&CK, OWASP Top 10,
  Cyber Essentials, NCSC guidance. Publish a per-module mapping.

---

## 15. The 0-to-hired arc (four acts) - DEFAULT

Fundamentals (networking, Linux, operating systems) are **interleaved with
hands-on work from week one**, never front-loaded as dry theory.

- **Act 1 - Foundations you can touch.** How the internet/OS/networks actually
  work, taught through immediate hands-on; passwords/hashing; encryption; who
  attackers really are; CMA 1990 and ethics. *Artefact: Personal Security Audit.*
- **Act 2 - How attacks happen (blue lens first).** Phishing/social engineering
  (M&S/Co-op, British Library); malware and traffic analysis (real PCAPs); web
  attacks (TalkTalk SQLi in the lab); the anatomy of a breach; ransomware.
  *Artefacts: phishing field guide, malware incident report.*
- **Act 3 - Defence for real.** SOC workflow + SIEM (honeypot -> SIEM ->
  triage); detection and logs (console enters); incident response; breach
  recreation (Equifax Struts CVE, found/exploited/patched); Cyber Essentials +
  risk. *Artefacts: SIEM triage report, breach recreation, risk register.*
- **Act 4 - Get hired.** Role tasters (SOC/IR/GRC/pentest); the honest UK career
  map; Security+/CC roadmap; prior-career positioning; CV/LinkedIn/ATS; mock
  interviews; the capstone + board briefing.

Week-by-week buildsheet is a follow-up doc, authored act by act once the Week 1
loop prototype is signed off.

---

## 16. Claims policy (binding for all Pro copy)

**Safe:** "Aligned to CompTIA Security+ (SY0-701) objectives"; "Mapped to CyBOK"
(published table); "Built around the UK Cyber Security Council Career Framework
specialisms" (descriptive); "Prepares you to apply for ACSP registration" (verify
before ship); mapping to ATT&CK/OWASP/Cyber Essentials/NCSC guidance; honest,
sourced market stats.

**Banned:** any NCSC marketing badge/"aligned with" row (NCSC only as course
*content*: Cyber Essentials, guidance); job guarantees or placement-rate claims;
"3.5M unfilled jobs", the 11,100 UK shortfall, "record vacancies";
"certification included"/"certified by AlgorithmX"; any real-incident detail
beyond the sourced public record (section 9 rule).

**House rules:** no em-dashes in site copy; pricing only on the course landing
page (marketing-vs-info rule).

---

## 17. Fiction - LOCKED: fiction-free

Real organisations and real data are the content; there is no fictional employer
wrapper. ARC stays Explorers canon; Redoubt stays Ops canon; neither appears in
Pro. The drafted trailer trust beat and its "real job market" framing predate v3
and need re-shooting for the 0-to-hired story. Trailer deck source is still not
in the repo.

---

## 18. Landing + data state

- **Landing** (`app/cyberstart-pro/`): rebuilt in PR #159 for the v1 job-sim
  framing. Under v3 it is closer to right (career outcomes are back in scope) but
  still needs a copy pass to the **0-to-hired, real-systems, taught** promise and
  the beginner on-ramp. Alignment trio (Security+/CyBOK/hands-on) valid; NCSC
  badge stays off.
- **Product record**: aligned via PR #152 (Cyber Pro, 18+, £99, 2 hrs/week -
  note the marketing "2 hrs/week" vs the design target "5-8 hrs/week"; reconcile
  the public figure in the landing copy pass). **Prod DB row still shows old
  £149 values** until the owner runs `npm run seed` or the #152 SQL.
- **Slug rename** `cyberstart-pro` -> `cyber-pro`: still a separate open decision.

---

## 19. Sources

Market findings: "Cyber Pro: Career-Entry Research Brief" artifact (2026-08-12).
Story-bank incidents to be re-verified against primaries at authoring time per
section 9. Frameworks: MITRE ATT&CK, OWASP Top 10, Cyber Essentials (NCSC/IASME),
NCSC guidance, CyBOK, CompTIA Security+ SY0-701 objectives.

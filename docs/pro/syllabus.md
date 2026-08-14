# Cyber Pro - Full Syllabus & Buildsheet (v4)

**Status:** The authoring reference for Cyber Pro (18+). v4 (2026-08-14) re-anchors
every module to what entry-level cyber security **certificates** actually teach, and
restructures each module into **five topics** (a week = 5 topics, ~1.5-2 hrs). Owner
approved the curriculum map on 2026-08-14. Supersedes the v3 module list.

Reviewable map: the "Cyber Pro - Curriculum Map" artifact.

## The anchor

The spine is **CompTIA Security+ (SY0-701)**, the entry-level industry standard. Its
five domains map onto the four acts:

- **D1 General Security Concepts** (12%) -> Act 1
- **D2 Threats, Vulnerabilities & Mitigations** (22%) -> Act 2
- **D3 Security Architecture** (18%) -> Acts 2-3
- **D4 Security Operations** (28%) -> Act 3
- **D5 Security Program Management & Oversight** (20%) -> Act 4

Cross-checked against **ISC² Certified in Cybersecurity (CC)** (the true beginner cert:
security principles, incident response/BC/DR, access control, network security, security
operations) and the UK **Cyber Essentials** five controls. Also mapped where relevant to
**MITRE ATT&CK**, the **OWASP Top 10**, **NIST CSF / 800-61**, **ISO 27001** and **CyBOK**.

## The method (what makes it unique)

Real certificate content, taught for a curious adult with no technical background. Every
topic runs **Learn -> See -> Try -> Check**: the idea in plain English with examples and
an analogy; a real company it happened to and what it cost; a hands-on **in-browser** lab
(nothing to install); then explain-it-back plus a short quiz. Every act ends in a real
**portfolio** artefact.

## Locked authoring rules

- **Real cases are source-verified** at authoring time against the public record
  (regulator notices, company post-mortems, court records). State only the documented.
- **No em-dashes** in learner-facing copy.
- **Recurring device:** cases end with "which of the Cyber Essentials five controls would
  have stopped this?" (firewalls, secure configuration, security update management, user
  access control, malware protection).
- **Honest-claim line (binding):** may say "aligned to Security+ objectives", "covers the
  ISC² CC domains", "mapped to MITRE ATT&CK / OWASP Top 10", "teaches the Cyber Essentials
  five controls". Never "certification included", "CompTIA-accredited", "NCSC-certified",
  or "certified by AlgorithmX".

---

## ACT 1 - Foundations you can touch (Modules 1-5)
*Security+ D1 · ISC² CC D1 · the language every cert starts with.*

### Module 1 - What security actually means  `[BUILDING]`
*Security+ 1.0; ISC² CC D1.* The core ideas every certificate opens with, before any tools.
1. The CIA triad: confidentiality, integrity, availability
2. Threat vs vulnerability vs risk
3. Types of control (preventive, detective, corrective)
4. Defence in depth and least privilege
5. Thinking like a defender, and an attacker
- **Cases:** Colonial Pipeline 2021 (availability); Equifax 2017 (risk realised); Target
  2013 (the alarm that rang); Maersk/NotPetya 2017 (flat network); SolarWinds 2020 (trust).

### Module 2 - How the internet actually works
*Security+ 3.0; Network+ foundations.* The plumbing attackers use, without jargon.
1. What a network is: the journey of a message
2. IP and DNS: how you reach a website
3. HTTP and HTTPS and the request lifecycle
4. Ports and protocols in plain English
5. Where each attack fits into the flow

### Module 3 - Passwords & authentication  `[BUILT]`
*Security+ 4.0 (IAM); ISC² CC D3; OWASP A07.* (Formerly built as "Week 1".)
1. How your password is really stored (hashing)
2. How attackers crack the stolen file
3. Building passwords worth trusting
4. The second lock: multi-factor authentication
5. Lock down your own accounts (audit)
- **Cases:** RockYou 2009; LinkedIn 2012; Adobe 2013; Dropbox 2012; Reddit 2018; Google 2017.
- **Project:** Personal Security Audit.

### Module 4 - Cryptography without the maths
*Security+ 1.4; CyBOK Cryptography.* Why the padlock means something.
1. Why we encrypt (and what encryption is not)
2. Symmetric vs asymmetric: shared locks vs key pairs
3. Hashing vs encryption, side by side
4. HTTPS, TLS and certificates explained
5. Digital signatures and PKI: proving who sent it

### Module 5 - Law, ethics & your first audit
*Security+ 5.0; CyBOK Law.* The rules you never cross, and the first portfolio piece.
1. The Computer Misuse Act 1990
2. UK GDPR and data protection, in plain English
3. Authorised testing, consent and scope
4. Responsible disclosure
5. Finish your Personal Security Audit (portfolio #1)

---

## ACT 2 - How attacks happen (Modules 6-11)
*Security+ D2 (the largest domain) · OWASP · MITRE ATT&CK.*

### Module 6 - Who the attackers are & how they operate
*Security+ 2.1; MITRE ATT&CK.*
1. Threat actors and their motives
2. The real cybercrime economy (killing the hoodie myth)
3. The attack lifecycle: kill chain and ATT&CK
4. Reconnaissance and OSINT
5. How defenders use the same map

### Module 7 - Social engineering & phishing
*Security+ 2.2; CyBOK Human Factors.*
1. Why humans are the target
2. The phishing family: spear, whaling, vishing, smishing
3. The psychology: authority, urgency, fear
4. Reading a suspicious email (headers, links, sender)
5. Spot, report, and run a phishing test
- **Project:** Phishing Field Guide.

### Module 8 - Malware: how it really works
*Security+ 2.4; CE Malware Protection; CyBOK Malware.*
1. The malware family tree
2. Ransomware: how it holds you hostage
3. How infection actually happens
4. What malware does once it is inside
5. A safe look at real malware behaviour
- **Case:** WannaCry 2017 (the NHS).

### Module 9 - Web attacks & the OWASP Top 10  `[PART-BUILT]`
*Security+ 2.3/3.0; OWASP Top 10; CyBOK Web.* (SQLi topic built as "Week 8".)
1. How websites talk to databases
2. SQL injection: empty a database (live lab)
3. Cross-site scripting (XSS)
4. Broken access control
5. The OWASP Top 10 tour and the fix mindset
- **Case:** TalkTalk 2015.

### Module 10 - Networks & Wi-Fi under attack
*Security+ 2.4/3.0; ISC² CC D4.*
1. Eavesdropping and man-in-the-middle
2. Wi-Fi attacks: evil twin and rogue access points
3. Spoofing and impersonation
4. Denial of service (DoS and DDoS)
5. Moving sideways, and how segmentation stops it

### Module 11 - Vulnerabilities & patching
*Security+ 2.5/4.0; OWASP A06; CE Update Management.*
1. What a vulnerability really is (CVE and CVSS)
2. The patch race: unpatched means an open door
3. Reading a vulnerability report
4. Prioritising what to fix first
5. End-of-life software and the human problem
- **Project:** vulnerability assessment note.

---

## ACT 3 - Defence for real (Modules 12-16)
*Security+ D4 (the largest domain) + D3 · NIST · the SOC job.*

### Module 12 - Hardening & secure configuration
*Security+ 4.1/3.0; Cyber Essentials (all five).*
1. The Cyber Essentials five controls
2. Secure baselines and removing attack surface
3. Least privilege in practice
4. Patch and update management (operational)
5. Build a hardening checklist

### Module 13 - The SOC & the analyst's day
*Security+ 4.0; NICE Cyber Defense Analyst.*
1. What a Security Operations Centre is
2. Tiers, roles and the escalation path
3. Alerts, events and incidents
4. The tools at a glance: SIEM and EDR
5. A day in the life, and what good triage looks like

### Module 14 - Logs & the SIEM  `[BUILT]`
*Security+ 4.0; CyBOK SOIM.* (Built as "Week 13".)
1. Logs as evidence
2. Triage a real honeypot capture (live lab)
3. Searching millions of logs at scale
4. Correlating events into a story
5. Writing up a finding
- **Project:** honeypot/SIEM triage report.

### Module 15 - Detection & threat intelligence
*Security+ 4.0; MITRE ATT&CK.*
1. Signatures vs behaviour
2. Indicators of compromise (IOCs)
3. Threat intelligence: knowing the adversary
4. Mapping activity to MITRE ATT&CK
5. Cutting through the noise (tuning)

### Module 16 - Incident response & digital forensics
*Security+ 4.0; ISC² CC D2; NIST 800-61; CyBOK Forensics.*
1. The incident-response lifecycle
2. Containment vs eradication
3. Evidence handling and chain of custody
4. Building an incident timeline
5. A tabletop exercise, and the incident report
- **Case:** Maersk/NotPetya 2017. **Project:** incident report.

---

## ACT 4 - Get hired (Modules 17-20)
*Security+ D5 (Governance, Risk & Compliance) + the career on-ramp.*

### Module 17 - Governance, risk & compliance (GRC)
*Security+ 5.0; ISC² CC D1; ISO 27001; NIST CSF.* The huge hiring lane beginners miss.
1. What risk management actually is
2. The frameworks: ISO 27001, NIST CSF, Cyber Essentials
3. Policies, standards and controls
4. Third-party and supply-chain risk
5. Audits and evidence
- **Project:** small-business risk assessment.

### Module 18 - Resilience: backups & continuity
*Security+ 3.0/4.0; ISC² CC D2.*
1. Business continuity and disaster recovery
2. Backups that survive ransomware (3-2-1)
3. RTO and RPO: how fast, how much
4. Redundancy and failover
5. Testing your recovery (the untested plan fails)

### Module 19 - The roles & the certification roadmap
*Career map; the cert ladder.*
1. The real entry roles (SOC, GRC, IT security, pen-test path)
2. What each job actually does day to day
3. The cert roadmap: ISC² CC -> Security+ -> specialise
4. The honest UK market and the funnel
5. Turning a non-technical background into an asset

### Module 20 - The job machinery + capstone
*Assess by doing; portfolio.*
1. Your portfolio: audit, phishing guide, breach write-up, IR timeline
2. CV and LinkedIn for cyber
3. Interview prep: scenarios and labs to show
4. Your home lab and staying current
5. Capstone: one full investigation, written up two ways

---

## Portfolio artefacts (the reward economy)

Personal Security Audit (M5); Phishing Field Guide (M7); vulnerability assessment (M11);
hardening checklist (M12); honeypot/SIEM triage report (M14); incident report (M16);
small-business risk assessment (M17); capstone incident report + board briefing (M20).

## Build status (2026-08-14)

- **Built:** Module 3 (Passwords, 5 topics); Module 14 (Logs & SIEM, single lesson).
- **Part-built:** Module 9 (Web/SQLi, single lesson).
- **Building:** Module 1 (What security actually means).
- **Renumber pending:** the built modules currently route as `/pro` (M3), `/pro/week08`
  (M9), `/pro/week13` (M14). A course hub at `/pro` listing all 20 modules, and the
  route renumber, land once a few more modules exist.

## Sources

Cert blueprints referenced at a domain level only (no exam objectives reproduced):
CompTIA Security+ SY0-701; ISC² Certified in Cybersecurity; Cyber Essentials (five
controls); MITRE ATT&CK; OWASP Top 10 (2021); NIST CSF 2.0 / SP 800-61; ISO/IEC 27001;
CyBOK v1.1. Full benchmark: "Cyber Pro: Full Syllabus & Course Benchmark" artifact
(2026-08-13).

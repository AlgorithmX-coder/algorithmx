# Cyber Pro - Full Syllabus & Buildsheet

**Status:** The authoring reference for Cyber Pro (18+). Derived from the v3 canon
(`cyber-pro-design.md`) and the 2026-08-13 syllabus research (9 course syllabi +
8 frameworks benchmarked; full sourced brief in the "Cyber Pro: Full Syllabus &
Course Benchmark" artifact). 20 modules, four acts, ~5-8 hrs/week, blue-team
first, real systems.

**How to build against this:** each module is authored as a data-only lesson
manifest (`app/pro/lessons/weekNN.ts`) consumed by the shared `LessonPlayer`
engine, running the Learn -> See -> Try -> Check loop. A module ships when its
lesson, its bespoke play-area/lab component, its real case (source-verified),
and its portfolio artifact are all in and QA'd in the browser.

**Recurring device:** every case ends with "which of the Cyber Essentials five
controls would have stopped this?" (firewalls, secure configuration, security
update management, user access control, malware protection).

**Authoring rule (LOCKED):** every real case is source-verified at authoring
time against primary documents (ICO notices, company post-mortems, court
records). State only the public record.

---

## Act 1 - Foundations you can touch (weeks 1-5)

The nervous-beginner act: how the digital world works, taught through immediate
hands-on and personal stakes. Ends with the first portfolio piece.

### Week 1 - How the internet actually works
- **Topics:** packets/frames, IP & MAC, DNS, HTTP/HTTPS, ports, the TCP
  handshake, the request lifecycle, OSI & TCP/IP models in plain terms.
- **Lab:** a visual packet journey, then a first Wireshark capture.
- **Frameworks:** Security+ 3.0; CyBOK Network Security; Apprenticeship K1.

### Week 2 - Passwords, hashing and encryption  `[PROTOTYPED]`
- **Topics:** hashing (one-way, salt, avalanche), symmetric/asymmetric
  encryption, TLS & PKI, why MFA beats a stolen password.
- **Case:** RockYou 2009 (32M plaintext, origin of rockyou.txt); LinkedIn 2012
  (117M unsalted hashes cracked).
- **Lab:** the Password Lab - real in-browser SHA-256, honest crack-time model,
  live avalanche. *Built.*
- **Project:** kicks off the Personal Security Audit.
- **Frameworks:** Security+ 1.0/3.0; CyBOK Cryptography; OWASP A02; CE Access
  Control.

### Week 3 - Operating systems and the command line
- **Topics:** Windows vs Linux, filesystems, permissions, users/groups; Linux
  CLI (grep, pipes, sudo); Windows/PowerShell basics; virtualization.
- **Lab:** build a home VM lab (VirtualBox + Ubuntu/Windows/Kali); CLI drills.
- **Frameworks:** Security+ 4.0; CyBOK OS & Virtualisation; Apprenticeship K2.

### Week 4 - Who attackers really are
- **Topics:** threat actors & motivations, the real cybercrime economy (kill the
  hoodie myth), CIA triad, defence in depth, zero trust, the cyber kill chain,
  first look at MITRE ATT&CK.
- **Lab:** walk a real intrusion across the ATT&CK tactics; classify the moves.
- **Frameworks:** Security+ 1.0/2.0; MITRE ATT&CK; CyBOK Adversarial Behaviours.

### Week 5 - Law, ethics and your first audit
- **Topics:** Computer Misuse Act 1990, UK GDPR / Data Protection Act,
  responsible disclosure, written authorisation & scoping.
- **Project:** finish the Personal Security Audit (breach-exposure check,
  password manager, MFA on five key accounts, before/after scorecard).
- **Frameworks:** Security+ 5.0; CyBOK Law & Regulation; Apprenticeship K8/K9.

---

## Act 2 - How attacks happen (weeks 6-11)

The attacker's playbook through the blue lens and the breaches it caused.
Recreate real conditions, hunt the flaw, then reveal what the company did.

### Week 6 - Phishing and social engineering
- **Topics:** email anatomy, headers, SPF/DKIM/DMARC, URL/attachment analysis,
  BEC, vishing/smishing, help-desk manipulation, human factors.
- **Case:** Twitter 2020; Google & Facebook ($100M to fake invoices); M&S and
  Co-op 2025 (help-desk social engineering).
- **Lab:** dissect real defanged phishing samples; header analysis.
- **Project:** Phishing Field Guide.
- **Frameworks:** Security+ 2.0; ATT&CK Initial Access; CyBOK Human Factors.

### Week 7 - Malware and how it works
- **Topics:** malware taxonomy, delivery & execution, static vs dynamic analysis
  basics, IOCs, living-off-the-land.
- **Case:** WannaCry 2017 (the NHS, unpatched worm).
- **Lab:** work a real malware traffic capture (malware-traffic-analysis.net);
  safe sandbox concepts (CyberChef, REMnux).
- **Frameworks:** ATT&CK Execution/Persistence; CyBOK Malware; CE Malware
  Protection.

### Week 8 - Web attacks and the OWASP Top 10
- **Topics:** how websites work (front/back-end, DB), the OWASP Top 10, deep on
  injection (SQLi), broken access control, XSS.
- **Case:** TalkTalk 2015 (SQL injection, ICO fine £400k).
- **Lab:** SQL-inject a real in-browser database (sql.js), recreate the flaw,
  see it patched.
- **Frameworks:** OWASP Top 10; Security+ 2.0/3.0; CyBOK Web & Software Security.

### Week 9 - Networks and Wi-Fi under attack
- **Topics:** MITM, ARP spoofing, DoS/DDoS, rogue AP/evil twin, secure vs
  insecure protocols, deeper packet analysis.
- **Lab:** Wireshark traffic analysis - find the attack in a real capture.
- **Frameworks:** Security+ 2.0/3.0; ATT&CK Lateral Movement/C2; CyBOK Network
  Security.

### Week 10 - The anatomy of a data breach
- **Topics:** how a breach unfolds end to end (initial access -> escalation ->
  lateral movement -> exfiltration -> impact), mapped across ATT&CK. The "find
  the decision point" method in full.
- **Case:** Equifax 2017 - install the real vulnerable Apache Struts build, find
  and exploit CVE-2017-5638, then patch it.
- **Project:** Breach Post-Mortem #1 + breach recreation write-up.
- **Frameworks:** MITRE ATT&CK (all); Security+ 2.0; CE Update Management.

### Week 11 - Vulnerability and patch management
- **Topics:** scanner literacy (Nessus/OpenVAS), reading CVSS, prioritising with
  EPSS/KEV, remediation SLAs, EOL software, patch-vs-risk.
- **Lab:** run and read a real vulnerability scan against the lab.
- **Project:** vulnerability assessment report.
- **Frameworks:** Security+ 2.0/4.0; OWASP A06; CE Update Management.

---

## Act 3 - Defence for real (weeks 12-16)

The core job. The learner becomes the person who reads the alert, runs the SIEM,
and writes the report, on real infrastructure they stand up themselves.

### Week 12 - The SOC and the analyst's day
- **Topics:** SOC roles/tiers, alert triage workflow, event vs incident,
  escalation, metrics, the 50:1 noise reality; Windows Event Logs
  (4624/4625/4688), Linux auth logs, correlation.
- **Lab:** work an alert queue in the guided analyst console (built), classify
  and escalate.
- **Frameworks:** Security+ 4.0; NICE Cyber Defense Analyst; CyBOK SOIM.

### Week 13 - Logs and the SIEM  `[HIGHEST-RISK LAB - prototype first]`
- **Topics:** log types & sources, SIEM concepts, Splunk SPL (deep) +
  Elastic/KQL (taster), building searches & dashboards; why UK SOCs run the
  Microsoft stack.
- **Lab (two-track, completion-safe design):**
  1. *In-browser, zero setup:* triage REAL honeypot attack data in a mini-SIEM
     in the browser (search, filter, investigate). Everyone finishes this.
  2. *Real-infra extension (scaffolded):* stand up a honeypot on a cheap VPS and
     see your own attackers. Optional-but-encouraged, the portfolio artifact.
- **Project:** Honeypot capture analysis + SIEM triage report.
- **Frameworks:** Security+ 4.0; NICE CDA; CyBOK SOIM.
- **Why prototype this week:** it is the make-or-break for the real-infra model.
  Setup friction is what kills completion; the two-track design (browser core +
  scaffolded real extension) is the hypothesis to validate before authoring the
  other 19 modules.

### Week 14 - Detection and threat intelligence
- **Topics:** IDS/IPS (Snort/Suricata/Zeek), detection engineering (Sigma/YARA),
  ATT&CK mapping, threat-intel feeds, IOCs, the Pyramid of Pain.
- **Lab:** write a detection rule; map a live alert to an ATT&CK technique.
- **Frameworks:** MITRE ATT&CK; CyBOK SOIM; Security+ 4.0.

### Week 15 - Incident response and digital forensics
- **Topics:** IR lifecycle (PICERL / NIST 800-61), containment/eradication/
  recovery, evidence handling & chain of custody, forensic acquisition (FTK
  Imager), key Windows artefacts.
- **Case:** Target 2013 (the alarm that rang); Maersk/NotPetya 2017 (flat
  network, $300M, saved by one offline office).
- **Lab:** investigate a simulated intrusion end to end; acquire & examine
  evidence.
- **Project:** incident report.
- **Frameworks:** Security+ 4.0; CyBOK Forensics; NIST CSF Respond/Recover.

### Week 16 - Defence in depth, GRC and the UK reality
- **Topics:** defence in depth, NIST CSF 2.0 (6 functions), ISO 27001 shape,
  Cyber Essentials 5 controls in full, risk registers, GDPR; the UK layer -
  clearance (BPSS/SC/DV), apprenticeship routes.
- **Case:** British Library 2023 (their own lessons-learned report); the ICO
  fine ledger (BA £20M, Marriott £18.4M, TalkTalk £400k).
- **Project:** Small-Business Risk Assessment against the five controls.
- **Frameworks:** Security+ 5.0; NIST CSF 2.0; Cyber Essentials; CyBOK Risk &
  Governance.

---

## Act 4 - Get hired (weeks 17-20)

Turn understanding and a portfolio into a job.

### Week 17 - Try the roles on
- **Topics:** day-in-the-life tasters (SOC analyst, incident responder, GRC,
  pen tester ethics-gated); the honest role map; the AI-assisted analyst (use AI
  to enrich/summarise/draft, plus the verification discipline). Note: AI security
  is now entering the cert blueprints (ISC2 CC Sept 2026, CySA+ V4, SC-200), so
  this module is ahead of the curve, not behind it.
- **Frameworks:** NICE work roles; Security+ 4.0.

### Week 18 - Scripting for defenders
- **Topics:** tiny real in-browser Python (Pyodide) + Bash/PowerShell for
  security tasks - a log parser, an IOC-enrichment script, a password checker.
- **Project:** automation script + README (a real GitHub artefact).
- **Frameworks:** Security+ 4.0; Apprenticeship K17.

### Week 19 - The job machinery
- **Topics:** the honest UK market (first role IT support or SOC analyst
  ~£25-32k, the funnel truth); the cert roadmap (Security+ anchor, ISC2 CC early
  win, SC-200, then BTL1/CySA+); positioning a prior career as an asset;
  CV/LinkedIn/ATS; mock interviews with scenario questions; BSides/meetups; bug
  bounty & passive OSINT as self-directed legal work.
- **Frameworks:** career transition; Security+ alignment.

### Week 20 - Capstone
- **Topics:** investigate one full simulated breach end to end (detection ->
  SIEM triage -> IR -> forensics), then write a technical post-mortem AND a
  plain-English board briefing.
- **Project:** capstone incident report + board briefing (the portfolio
  centrepiece).
- **Frameworks:** all; assess by doing.

---

## The hands-on lab spine (must-do set, from the 9-course benchmark)

1. Build a VM home lab. 2. Linux/Windows CLI. 3. Wireshark/tcpdump packet
analysis. 4. SIEM investigation (Splunk + Elastic). 5. IDS/IPS rules
(Snort/Suricata/Zeek). 6. Phishing/email header analysis. 7. Endpoint &
Windows event-log investigation (Sysmon/EDR). 8. Threat-intel mapping (ATT&CK,
YARA/Sigma). 9. Forensics acquisition (FTK Imager). 10. Python automation
mini-project. 11. A full IR capstone with a written report.

Only Cyber Pro adds, at the price: a real honeypot on the learner's own VPS
feeding the SIEM, and a breach recreation of a real CVE (Equifax Struts).
Offensive fundamentals (one Nmap enumeration, one Metasploit foothold, the SQLi)
are included so defenders understand what they detect.

## Framework alignment (claims backbone)

Teaching the syllabus honestly satisfies Security+ SY0-701 (all 5 domains:
1.0 12% / 2.0 22% / 3.0 18% / 4.0 28% / 5.0 20%), CyBOK KAs, MITRE ATT&CK
(14 tactics), OWASP Top 10, and Cyber Essentials (5 controls). Also maps to the
NCSC-certified-degree subject framework and the UK Level 4 Cyber Security
Technologist knowledge areas (ST1021, K1-K17). Target work role: NICE Cyber
Defense Analyst (PR-CDA-001).

**Honest-claim line (binding):** may say "aligned to Security+ objectives",
"mapped to CyBOK", "covers the ATT&CK tactics and OWASP Top 10", "teaches the
Cyber Essentials five controls". Never say "NCSC-certified", "CompTIA-accredited",
"certification included", or "certified by AlgorithmX".

## Portfolio artefacts (the reward economy)

Personal Security Audit; Phishing Field Guide; Breach Post-Mortem(s); breach
recreation write-up; vulnerability assessment report; honeypot capture analysis;
SIEM triage report; incident report; Small-Business Risk Assessment; automation
script + README; capstone incident report + board briefing.

## Sources

Full sourced benchmark: "Cyber Pro: Full Syllabus & Course Benchmark" artifact
(2026-08-13). Courses: Google, IBM, TryHackMe (Pre Security / CS101 / SOC L1),
HTB Academy, SANS SEC275/401, TCM, Simply Cyber, roadmap.sh, Professor Messer.
Frameworks: CyBOK v1.1, NCSC certified degrees, UK L4 apprenticeship ST1021,
MITRE ATT&CK, OWASP Top 10 (2021 + 2025), NIST CSF 2.0, Cyber Essentials
(Danzell, Apr 2026), NICE SP 800-181r1, CompTIA Security+ SY0-701 / CySA+
CS0-004, Microsoft SC-900 / SC-200.

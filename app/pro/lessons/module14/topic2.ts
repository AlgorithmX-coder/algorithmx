import type { TopicManifest } from "../../learn/types";
import SiemLab from "../../learn/SiemLab";

/* Module 14 - Topic 2: triage a real honeypot capture, with the real
 * in-browser SIEM lab (reused from the original "Week 13" build). Case:
 * Mirai botnet / Dyn, 2016 (default credentials on devices built the
 * botnet that disrupted major sites). Public record: US-CERT/CISA
 * advisories, 2016 reporting, the Dyn incident report. */
const topic2: TopicManifest = {
  id: "m14t2",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Triage a real capture",
  role: "Running an actual SIEM investigation is the single most representative thing you can do to experience the SOC analyst's job. You will search and filter a real honeypot capture to work out what happened, exactly the core skill employers want to see.",
  minutes: 22,
  promise: "Investigate a real captured attack in a SIEM yourself, searching the logs to work out what happened, the core skill of the SOC job.",
  brief: "This is the hands-on heart of the module. You will use an in-browser SIEM to investigate a real honeypot capture, the actual logs of an automated attack, searching and filtering them to work out what the attacker did. Nothing to install, nothing leaves the page. It is the closest this course comes to the real SOC analyst's day, and the kind of demonstrable skill that gets beginners hired.",

  learn: [
    {
      heading: "A SIEM turns a pile of logs into answers",
      body: [
        "You learned in Module 13 that a SIEM aggregates logs from everywhere and lets you search and correlate them. Now you will use one. The power of a SIEM is that it turns an overwhelming pile of raw log lines into something you can actually investigate: you search for what matters, filter to the relevant time, user or address, and build up a picture of what happened. Without a SIEM, you would be lost in the volume; with one, you can ask the logs questions and get answers.",
        "The investigation you are about to do is real in the ways that matter: real captured attack traffic, and a real SIEM-style interface with working search and filters. You will see genuine attack activity, login attempts with default credentials, probes, the signatures of known threats, and your job is to make sense of it. This is the actual work of a SOC analyst, made safe and hands-on.",
      ],
      examples: [
        "A SIEM lets you search, filter, and build a picture from a pile of raw logs.",
        "Without it you drown in volume; with it you ask the logs questions.",
        "Real captured attack traffic, a real search interface: the analyst's actual work.",
      ],
      analogy: {
        plain: "A SIEM is a powerful search engine over all your CCTV footage: instead of watching every tape, you jump straight to the moments and people that matter.",
        realTerm: "investigating in a SIEM",
      },
    },
    {
      heading: "How to approach the investigation",
      body: [
        "Approach it the way a real analyst would, using the skills from this course. Start by orienting: what kind of activity is in this capture? Then narrow: filter by time, by the source address doing something suspicious, by the kind of event (failed logins, for instance). Look for the story: reconnaissance, then login attempts, then a success, then action, the attack lifecycle you learned in Module 6. And keep asking the questions: who, what, when, and is this normal or an attack?",
        "You do not need to get a 'perfect' answer; you need to practise the process of investigating, searching, filtering, reading, reasoning. That process is the skill. Take your time, try different searches, and notice how filtering turns thousands of lines into the handful that matter. By the end, you will have done, for real, what the whole module is about: turned raw logs into an understanding of what happened.",
      ],
      examples: [
        "Orient (what kind of activity?), then narrow (filter by time, source, event type).",
        "Look for the story: recon → login attempts → success → action (the kill chain).",
        "The skill is the process, searching, filtering, reasoning, not a perfect answer.",
      ],
    },
    {
      heading: "What this capture shows: the Mirai pattern",
      body: [
        "The capture reflects the kind of activity that built the Mirai botnet, the threat behind the 2016 attack that disrupted major sites. Mirai spread by trying a list of common default usernames and passwords against exposed devices; where owners had never changed the factory credentials, it logged straight in and conscripted the device. In the logs, this looks like repeated login attempts using default credentials, exactly the signature you will see.",
        "So your investigation is not abstract: you are reading the fingerprints of a real, world-shaking attack pattern, and the defensive lesson is right there in the evidence. The attack worked because of unchanged default passwords (the access-control and secure-configuration basics from Act 3). Seeing that in the raw logs, the attempts, the defaults, the signatures, connects the hands-on investigation to the real-world impact, and to exactly the basic defences that would have stopped it. Now go and investigate it.",
      ],
      examples: [
        "Mirai tried lists of default credentials against exposed devices.",
        "In the logs: repeated login attempts using default usernames and passwords.",
        "The defensive lesson is in the evidence: changing defaults would have stopped it.",
      ],
      analogy: {
        plain: "You are reading the burglar's logbook: a long list of standard keys tried on every door, working wherever someone never changed the factory lock.",
        realTerm: "the Mirai signature",
      },
    },
  ],

  glossary: [
    { term: "SIEM investigation", definition: "Using a SIEM's search and filters to work out what happened from aggregated logs: the core hands-on SOC skill." },
    { term: "filter", definition: "Narrowing logs by time, source, user or event type to cut millions of lines down to the relevant few." },
    { term: "default credentials", definition: "Factory-set usernames and passwords; unchanged, they let threats like Mirai log straight in (recall Module 12)." },
    { term: "triage (in a SIEM)", definition: "Working through captured activity to decide what it is and what matters, the everyday work of a SOC analyst." },
  ],

  seeHeading: "The botnet built from default passwords",

  cases: [
    {
      org: "Mirai botnet / Dyn",
      year: "2016",
      headline: "Default passwords on devices built the botnet that disrupted major sites",
      whatHappened: "The Mirai botnet (which you met in Module 2) spread by scanning the internet for devices, such as cameras and recorders, still using common factory-default usernames and passwords, and logging straight in to conscript them. In October 2016 this botnet of hundreds of thousands of hijacked devices was used to flood the DNS provider Dyn, making major services like Twitter, Netflix and Reddit unreachable. The attack traffic Mirai generated, and the login attempts it made, are exactly the kind of activity captured in honeypots and investigated in this module's lab.",
      theMissedMeasure: "Changing default credentials (access control and secure configuration). Mirai only worked because countless devices still used factory passwords. In the logs you will investigate, the repeated default-credential login attempts are the visible signature of exactly this failure.",
      theCost: "Major sites unreachable across the US and Europe, from a botnet built on unchanged default passwords, and a perfect, real example to investigate: the evidence of the attack, and the basic defence that would have stopped it, both visible in the logs.",
      control: "access-control",
      impact: ["Mirai hijacked devices via default credentials", "the botnet disrupted major sites via Dyn (2016)", "the login attempts are the signature you investigate"],
      source: "Public record; US-CERT/CISA advisories, 2016 reporting, the Dyn incident report.",
      brandColor: "#f68b1f",
      news: { headline: "DDoS attack that disrupted internet was largest of its kind in history", outlet: "The Guardian", date: "October 2016" },
    },
  ],

  lab: {
    title: "Triage a real honeypot capture",
    intro: "This is a real SIEM investigation over genuine captured attack data, running in your browser. Nothing leaves this page. Search and filter to work out what happened.",
    prompts: [
      "Orient first: what kind of activity is in the capture?",
      "Narrow with filters: by time, by source address, by event type (like failed logins).",
      "Look for the story: probing, login attempts, a success, then action. Answer the questions.",
    ],
    component: SiemLab,
  },

  check: {
    explain: {
      prompt: "Having done the investigation, explain how a SIEM helps you investigate, how you approached the capture, and what the Mirai pattern in the logs teaches about defence.",
      modelAnswer: "A SIEM helps by turning an overwhelming pile of raw log lines into something you can actually investigate: it aggregates the logs and lets you search for what matters and filter to the relevant time, source address, user or event type, so instead of drowning in volume you can ask the logs questions and build a picture of what happened. I approached the capture the way a real analyst would: orienting first (what kind of activity is here?), then narrowing with filters (by time, by the suspicious source, by event type like failed logins), looking for the story across the attack lifecycle, reconnaissance, then login attempts, then any success, then action, and continually asking who, what, when, and whether it is normal or an attack, focusing on practising the process of searching, filtering and reasoning rather than chasing a perfect answer. The Mirai pattern in the logs teaches the defensive lesson directly: Mirai spread by trying lists of common default usernames and passwords against exposed devices and logging straight in where owners had never changed the factory credentials, so in the logs it shows as repeated default-credential login attempts, and the evidence itself points to the fix, changing default passwords (the access-control and secure-configuration basics), which would have stopped the attack that built the botnet behind the 2016 Dyn disruption.",
    },
    quiz: [
      {
        q: "How does a SIEM help you investigate a pile of logs?",
        options: [
          "It deletes the logs",
          "It lets you search and filter the logs to find what matters, instead of drowning in volume",
          "It writes the report for you",
          "It blocks all attacks automatically",
        ],
        answer: 1,
        why: "A SIEM turns raw log volume into answerable questions via search and filters, the core investigation skill.",
      },
      {
        q: "What is the best way to approach a SIEM investigation?",
        options: [
          "Scroll through every line by hand",
          "Orient, then narrow with filters (time, source, event type), and look for the attack story",
          "Guess the conclusion immediately",
          "Ignore the time of the event",
        ],
        answer: 1,
        why: "Orient and filter to isolate the relevant activity, then reconstruct the story. The process is the skill.",
      },
      {
        q: "What does the Mirai login pattern in the logs teach about defence?",
        options: [
          "That attacks are unstoppable",
          "That changing default passwords would have stopped it: the basic defence is visible in the evidence",
          "That logs are useless",
          "That defaults are safe",
        ],
        answer: 1,
        why: "Mirai worked on unchanged default credentials; the repeated default-login attempts in the logs point straight to the fix.",
      },
    ],
  },

  wrap: {
    headline: "You ran a real SIEM investigation, the single most representative experience of the SOC analyst's job.",
    takeaways: [
      "A SIEM turns a pile of raw logs into answers through search and filtering.",
      "Investigate by orienting, narrowing with filters, and reconstructing the attack story.",
      "The Mirai pattern (default-credential logins) shows the attack, and the basic defence, right in the evidence.",
    ],
    project: {
      name: "Note your investigation",
      blurb: "Write a few lines on what you found in the lab: what kind of activity, what the attacker was doing, and what would have stopped it. This short account is the beginning of the honeypot/SIEM triage report that is this module's portfolio project, a genuine demonstration of investigative skill.",
    },
    ethicsNote: "You investigated a safe, sandboxed capture that runs entirely in your browser. Real SIEM work is done on your own organisation's logs, lawfully and with care for the personal data logs contain, within the Module 5 principles.",
  },
};

export default topic2;

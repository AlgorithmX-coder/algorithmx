import type { TopicManifest } from "../../learn/types";
import { TimelineOrderLab } from "../../learn/conceptLabs";

/* Module 16 - Topic 4: building an incident timeline. Case: the
 * Bangladesh Bank / SWIFT heist, 2016 (investigators reconstructed a
 * detailed timeline of the ~81M USD theft across logs, malware and even
 * printer records). Public record: 2016-2018 reporting on the
 * Bangladesh Bank cyber heist. */
const topic4: TopicManifest = {
  id: "m16t4",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "Building an incident timeline",
  role: "Reconstructing what happened, in order, is the heart of investigation. A clear incident timeline tells you how the attacker got in, how far they went, what they did, and how to stop it recurring, and building one is a core, demonstrable analyst skill.",
  minutes: 15,
  promise: "Learn to reconstruct an attack from the evidence into a clear timeline, then see investigators piece together an 81-million-dollar heist.",
  brief: "In this lesson, we'll learn to build an incident timeline: the reconstruction, in chronological order, of what the attacker did, assembled from scattered evidence. A good timeline turns a confusing mess of log entries and artefacts into a clear story of the attack, which is what lets you understand its scope, eradicate it fully, and prevent a recurrence. Then we'll see how investigators reconstructed the audacious Bangladesh Bank heist.",

  learn: [
    {
      heading: "The timeline is the story of the attack",
      visual: { id: "timeline-builder" },
      body: [
        "An incident timeline is the attack reconstructed in order: when the attacker got in, what they did first, how they moved, what they took, and when. It is assembled from evidence scattered across many sources, logs from different systems, the artefacts malware left, network records, each a fragment that, placed in sequence, forms a coherent story. Building it is the detective work at the heart of an investigation.",
        "This matters because, without the timeline, you are guessing. You cannot eradicate a threat you do not understand, confirm the full scope of a breach, or prevent a recurrence if you do not know how it happened. The timeline answers the essential questions, how did they get in, how far did they get, what did they touch, when did it start and end, which is why reconstructing it is one of the most valuable things an investigator does.",
      ],
      examples: [
        "When they got in, what they did first, how they moved, what they took, and when.",
        "Assembled from scattered fragments: logs, malware artefacts, network records.",
        "Without it you are guessing; with it you understand scope, eradication and prevention.",
      ],
      analogy: {
        plain: "A detective reconstructs a crime from scattered clues into a clear sequence: entry, movements, actions, exit. The timeline is that reconstruction for a cyber incident.",
        realTerm: "incident timeline",
      },
    },
    {
      heading: "Correlating evidence across sources",
      body: [
        "Building a timeline is largely correlation: connecting evidence from different sources by time and relationship. A login here, a file created there, a connection out moments later, each is a fragment, but linked by their timestamps and logic, they reveal the attacker's path. This is exactly what a SIEM's correlation (Module 13) helps with, and it is why good logging and accurate timestamps across systems matter so much, you cannot reconstruct what was never recorded, or line up events whose clocks disagree.",
        "The skill is piecing fragments into a coherent sequence while staying evidence-led: every step in the timeline should be supported by something you can point to, not assumed. Gaps are noted as gaps, not filled with guesses. A good timeline is both a narrative and a chain of evidence, which is what makes it useful for eradication, for the report, and, if needed, for legal proceedings (the previous topic).",
      ],
      examples: [
        "Link fragments by timestamp and logic into the attacker's path.",
        "Good logging and synchronised clocks are what make reconstruction possible.",
        "Stay evidence-led: support each step, and mark gaps as gaps, not guesses.",
      ],
    },
    {
      heading: "What the timeline enables",
      body: [
        "A completed timeline is not just satisfying; it directly drives the response. Knowing how the attacker got in tells you the root cause to fix. Knowing how far they went tells you the true scope, so you can eradicate every foothold and know what data was affected (crucial for breach notification). Knowing what they did tells you the impact. And the whole timeline becomes the backbone of the incident report and the lessons learned.",
        "This is why even a complex, high-stakes incident is ultimately understood by patient reconstruction. The Bangladesh Bank heist you are about to see is a remarkable example: investigators pieced together, from logs, malware and even records of what a printer did, a detailed timeline of one of the most audacious cyber thefts ever, which was essential to understanding how it was done and how such attacks could be prevented.",
      ],
      examples: [
        "How they got in → the root cause to fix; how far → the true scope to eradicate.",
        "What they did → the impact; and the timeline backbones the report.",
        "Even the most complex incident is understood by patient reconstruction.",
      ],
      analogy: {
        plain: "Once you have the full sequence of a burglary, you know which lock failed, which rooms were entered, and what was taken, so you can secure the house and tell the insurer exactly what happened.",
        realTerm: "timeline-driven response",
      },
    },
  ],

  glossary: [
    { term: "incident timeline", definition: "The chronological reconstruction of an attack, assembled from evidence, showing what the attacker did and when." },
    { term: "correlation", definition: "Connecting evidence from different sources by time and relationship to reveal the attacker's path; central to timeline-building." },
    { term: "timestamp", definition: "The recorded time of an event; accurate, synchronised timestamps across systems are essential for reconstructing a timeline." },
    { term: "scope", definition: "How far an incident reached, what systems and data were affected, which the timeline establishes, and which drives eradication and notification." },
  ],

  seeHeading: "Reconstructing an 81-million-dollar heist",

  cases: [
    {
      org: "Bangladesh Bank / SWIFT heist",
      year: "2016",
      headline: "Investigators reconstructed one of the most audacious cyber thefts from scattered evidence",
      whatHappened: "In 2016, attackers stole around 81 million US dollars from Bangladesh Bank by compromising its systems and issuing fraudulent transfer instructions over the SWIFT international banking network, and they tried to steal far more. Investigators reconstructed a detailed timeline of the attack from scattered evidence: logs, the custom malware the attackers deployed (which, notably, tampered with records and even interfered with the printing of transaction confirmations to delay detection), and network traces. Piecing these fragments together in order revealed exactly how the heist was carried out and how the attackers tried to cover their tracks.",
      theMissedMeasure: "The prevention gaps were serious (weak controls around the critical SWIFT systems). For this topic, the lesson is the investigation: a detailed, evidence-based timeline, assembled from logs, malware behaviour and even printer records, was what let investigators understand the audacious attack, its methods and its scope.",
      theCost: "Around 81 million dollars stolen (much of it never recovered), but the reconstructed timeline was essential to understanding how such an attack was possible and how banks worldwide could better defend the critical systems involved.",
      control: "access-control",
      impact: ["~81M USD stolen via fraudulent SWIFT transfers", "timeline reconstructed from logs, malware and printer records", "revealed the method and the attackers' track-covering"],
      source: "Public record; 2016-2018 reporting on the Bangladesh Bank cyber heist.",
      brandColor: "#006a4e",
      news: { headline: "The Bangladesh Bank heist: how investigators pieced together an $81m cyber theft", outlet: "Mainstream and security reporting (2016-2018)", date: "2016" },
    },
  ],

  lab: {
    title: "Build the timeline",
    intro: "Nothing to install and nothing leaves this page. From these pieces of evidence, put the attack in the order it happened.",
    prompts: [
      "Think like an investigator: entry, foothold, movement, collection, theft, detection.",
      "Each step should follow logically from the one before.",
      "This reconstruction is the heart of an investigation.",
    ],
    component: TimelineOrderLab,
  },

  check: {
    explain: {
      prompt: "What is an incident timeline, how is it built, and why is it so essential, using the Bangladesh Bank heist to illustrate?",
      modelAnswer: "An incident timeline is the attack reconstructed in chronological order: when the attacker got in, what they did first, how they moved, what they took, and when, assembled from evidence scattered across many sources (logs from different systems, artefacts malware left, network records), each a fragment that in sequence forms a coherent story. It is built largely by correlation: connecting evidence by timestamp and logic into the attacker's path, which is why good logging and synchronised clocks matter so much, while staying evidence-led so every step is supported and gaps are marked as gaps, not guessed. It is essential because without it you are guessing: you cannot eradicate a threat you do not understand, confirm the true scope of a breach (crucial for notification), or prevent a recurrence if you do not know how it happened; and it becomes the backbone of the incident report and lessons learned. The Bangladesh Bank heist illustrates this powerfully: investigators reconstructed a detailed timeline of the roughly 81-million-dollar theft from logs, the attackers' custom malware (which even tampered with transaction-confirmation printing to delay detection), and network traces, and that reconstruction was what revealed exactly how the audacious heist was carried out and how the attackers tried to cover their tracks.",
    },
    quiz: [
      {
        q: "What is an incident timeline?",
        options: [
          "A schedule of future security tasks",
          "The chronological reconstruction of an attack, assembled from evidence, showing what the attacker did and when",
          "A list of staff shifts",
          "A type of firewall log",
        ],
        answer: 1,
        why: "It turns scattered fragments of evidence into a clear story of the attack, the heart of an investigation.",
      },
      {
        q: "How is a timeline primarily built?",
        options: [
          "By guessing what probably happened",
          "By correlating evidence from different sources by timestamp and logic, staying evidence-led",
          "By asking the attacker",
          "By ignoring the logs",
        ],
        answer: 1,
        why: "Connecting fragments by time and relationship reveals the attacker's path. Good logging and synchronised clocks make it possible.",
      },
      {
        q: "Why is the timeline so essential to a response?",
        options: [
          "It is not; it is just paperwork",
          "It reveals how they got in (root cause), how far they went (scope), and what they did (impact), driving eradication, notification and prevention",
          "It only matters for small incidents",
          "It replaces the need to contain the incident",
        ],
        answer: 1,
        why: "You cannot eradicate, scope or prevent what you do not understand. The timeline answers the essential questions and backbones the report.",
      },
    ],
  },

  wrap: {
    headline: "You can now reconstruct an attack into a clear timeline, the detective work at the heart of investigation.",
    takeaways: [
      "An incident timeline reconstructs the attack in order from scattered evidence: the story of what happened.",
      "It is built by correlating evidence by time and logic, evidence-led, which is why good logging and clocks matter.",
      "It reveals root cause, scope and impact, driving eradication, notification and prevention, and backbones the report.",
    ],
    project: {
      name: "Timeline a breach",
      blurb: "Take a breach from this course and write its timeline: a numbered, chronological list of what the attacker did, from entry to detection, noting what evidence would reveal each step. Reconstructing attacks into clear timelines is a core investigator skill and an excellent portfolio piece.",
    },
    ethicsNote: "Investigation and timeline-building are done on your own organisation's systems, with proper authority and careful evidence handling (previous topic). This is constructive, consequential work within the Module 5 principles.",
  },
};

export default topic4;

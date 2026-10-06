import type { TopicManifest } from "../../learn/types";
import { EvidenceLab } from "../../learn/conceptLabs";

/* Module 16 - Topic 3: evidence handling and chain of custody. Case:
 * the general principle, illustrated by how sound digital-evidence
 * handling and chain of custody underpin real cybercrime prosecutions
 * (and how mishandling can undermine them). Public record: established
 * digital-forensics practice and court requirements. */
const topic3: TopicManifest = {
  id: "m16t3",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "Evidence & chain of custody",
  role: "When an incident may lead to legal action, prosecution, dismissal, insurance, the evidence must be handled so it stands up to scrutiny. Understanding digital-evidence handling and chain of custody is essential whenever an investigation might have consequences beyond the technical.",
  minutes: 15,
  promise: "Learn how to handle digital evidence so it is credible and admissible, and why one careless click can destroy a case.",
  brief: "In this lesson, we'll look at handling digital evidence properly. When an incident might lead to legal or disciplinary action, how you collect and preserve evidence matters as much as the investigation itself. We'll learn the core principles: preserve the original, work on copies, capture volatile evidence first, and maintain a documented chain of custody. Mishandling can make solid evidence worthless, so this is a discipline every responder needs.",

  learn: [
    {
      heading: "Preserve the original; work on a copy",
      body: [
        "The first principle of digital evidence is: do not alter the original. Simply using a compromised system, logging in, opening files, 'having a look', changes it, overwriting timestamps and potentially the very evidence you need. Instead, you make a forensic copy (an exact image) of the evidence and investigate the copy, leaving the original untouched and intact. This keeps the original credible: you can show it has not been tampered with.",
        "This runs counter to instinct, the urge to dive in and investigate the live machine is strong, but it is essential when consequences may follow. There is also an order of priority: some evidence is volatile, lost the moment a machine is powered off or changed (like the contents of memory), so it must be captured first, before anything that would destroy it. Preserve first, investigate second, on copies.",
      ],
      examples: [
        "Make a forensic image and investigate the copy; leave the original untouched.",
        "Just using the live machine overwrites timestamps and evidence.",
        "Capture volatile evidence (like memory) first, before it is lost.",
      ],
      analogy: {
        plain: "A crime scene is photographed and preserved before anyone moves anything; investigators work from the records, not by trampling the scene. Digital evidence is the same.",
        realTerm: "evidence preservation",
      },
    },
    {
      heading: "Chain of custody: who touched what, when",
      body: [
        "Chain of custody is the documented, unbroken record of who handled a piece of evidence, when, and what they did with it, from the moment it was collected. It exists to prove the evidence is what it claims to be and has not been tampered with or substituted. A clear chain of custody makes evidence credible and admissible; a broken or missing one can make even genuine evidence worthless in a formal process.",
        "In practice this means recording every handover and action, storing evidence securely, and limiting and logging access. It sounds bureaucratic, but it is exactly what a court, a tribunal, or an insurer will scrutinise. An investigation can be technically brilliant and still fail if the evidence cannot be trusted because its handling was not documented. Chain of custody is the paperwork that makes the truth defensible.",
      ],
      examples: [
        "Record who handled the evidence, when, and what they did, unbroken from collection.",
        "Store it securely; limit and log who can access it.",
        "A broken chain of custody can make genuine evidence worthless in a formal process.",
      ],
    },
    {
      heading: "When it matters, and why responders must know it",
      body: [
        "Not every incident ends in court, but you rarely know at the start which will. An incident that looks minor might turn into a prosecution, a dismissal, an insurance claim or a regulatory investigation, and by then it is too late to handle the evidence properly if you have already trampled it. So the professional default, whenever consequences are possible, is to treat evidence carefully from the very first moment.",
        "This is why even a front-line analyst needs to understand evidence handling: the critical early actions, or mistakes, often happen before any forensic specialist is involved. Knowing not to log into the compromised machine 'just to check', not to reboot it before memory is captured, and to document what you do, can be the difference between a case that holds and one that collapses. Careful evidence handling is a discipline of restraint and documentation that pays off exactly when the stakes are highest.",
      ],
      examples: [
        "A minor-looking incident can become a prosecution, claim or investigation.",
        "Critical early actions (or mistakes) often happen before a specialist arrives.",
        "Restraint (do not trample) and documentation protect the case when it matters most.",
      ],
      analogy: {
        plain: "A first responder at an accident preserves the scene even when it looks minor, because it might become a legal matter. You cannot un-trample a scene later.",
        realTerm: "handle evidence from the start",
      },
    },
  ],

  glossary: [
    { term: "forensic image", definition: "An exact copy of digital evidence (such as a disk), made so investigators can work on the copy and leave the original untouched." },
    { term: "chain of custody", definition: "The documented, unbroken record of who handled evidence, when, and how, proving it has not been tampered with: essential for admissibility." },
    { term: "volatile evidence", definition: "Evidence lost when a system is powered off or changed (like the contents of memory); it must be captured first." },
    { term: "admissibility", definition: "Whether evidence can be used in a formal process; poor handling or a broken chain of custody can render it inadmissible." },
  ],

  seeHeading: "Why handling can make or break a case",

  cases: [
    {
      org: "Digital evidence & chain of custody",
      year: "established practice",
      headline: "Sound evidence handling underpins real cases; careless handling can destroy them",
      whatHappened: "Across countless real cybercrime prosecutions, disciplinary cases and insurance disputes, the integrity of digital evidence is decisive. Established forensic practice and court requirements demand that evidence be preserved properly (originals untouched, work done on copies, volatile evidence captured first) and accompanied by a documented, unbroken chain of custody. Where this is done well, evidence is credible and admissible; where it is mishandled, originals altered, handling undocumented, access uncontrolled, even genuine, damning evidence can be challenged or thrown out, undermining an otherwise solid case.",
      theMissedMeasure: "The measure is the discipline itself: preserve the original, work on copies, capture volatile evidence first, and maintain chain of custody. It is a required practice precisely because the consequences of getting it wrong, a collapsed case, an overturned result, are so severe.",
      theCost: "The cost of poor evidence handling is cases that fail despite the truth being on their side, which is exactly why responders are trained to treat evidence carefully from the very first action, whenever consequences might follow.",
      control: "access-control",
      impact: ["sound handling makes evidence credible and admissible", "mishandling can make genuine evidence worthless", "a required discipline because the stakes are so high"],
      source: "Public record; established digital-forensics practice and court requirements.",
      brandColor: "#34495e",
      news: { headline: "Chain of custody: why evidence handling can make or break a case", outlet: "Digital-forensics practice (established)", date: "established" },
    },
  ],

  lab: {
    title: "Preserve or destroy the evidence?",
    intro: "Nothing to install and nothing leaves this page. For each action, decide: does it preserve evidence properly, or risk destroying it?",
    prompts: [
      "Preserve the original, work on copies, capture volatile evidence first, document everything.",
      "Logging into the live machine, rebooting before capturing memory, and unrecorded access all risk destroying evidence.",
      "When consequences are possible, treat evidence carefully from the first action.",
    ],
    component: EvidenceLab,
  },

  check: {
    explain: {
      prompt: "Explain the core principles of handling digital evidence and what chain of custody is, and why even a front-line analyst needs to understand this.",
      modelAnswer: "The core principles of handling digital evidence are: do not alter the original (simply using a compromised system overwrites timestamps and evidence), so make a forensic image and investigate the copy, leaving the original intact and credible; capture volatile evidence, like the contents of memory, first, because it is lost the moment a machine is powered off or changed; and document everything you do. Chain of custody is the documented, unbroken record of who handled a piece of evidence, when, and what they did, from the moment it was collected; it proves the evidence has not been tampered with or substituted, and so makes it credible and admissible, whereas a broken or missing chain can make even genuine evidence worthless in a formal process. Even a front-line analyst needs to understand this because you rarely know at the start which incident will end in a prosecution, dismissal, claim or investigation, and the critical early actions, or mistakes, often happen before any forensic specialist arrives. Knowing not to log into the compromised machine 'just to check', not to reboot it before memory is captured, and to document what you do, can be the difference between a case that holds and one that collapses.",
    },
    quiz: [
      {
        q: "What is the first principle of handling digital evidence?",
        options: [
          "Investigate the live machine thoroughly",
          "Do not alter the original: make a forensic copy and work on that",
          "Reboot the machine to clear the malware",
          "Let everyone take a look",
        ],
        answer: 1,
        why: "Using the original alters it. Work on a forensic copy so the original stays intact and credible.",
      },
      {
        q: "What is chain of custody?",
        options: [
          "A type of encryption",
          "The documented, unbroken record of who handled evidence, when, and how, proving it was not tampered with",
          "A backup schedule",
          "A firewall rule",
        ],
        answer: 1,
        why: "It makes evidence credible and admissible. A broken chain can make even genuine evidence worthless.",
      },
      {
        q: "Why must even a front-line analyst understand evidence handling?",
        options: [
          "They never touch evidence",
          "Critical early actions (or mistakes) happen before a specialist arrives, and you rarely know which incident will have consequences",
          "It is only the manager's job",
          "Evidence never matters",
        ],
        answer: 1,
        why: "The crucial first moves often fall to the first responder. Careful handling from the start can make or break a later case.",
      },
    ],
  },

  wrap: {
    headline: "You now understand how to handle digital evidence so it holds up, and why careless handling can destroy a case.",
    takeaways: [
      "Preserve the original, work on forensic copies, and capture volatile evidence (like memory) first.",
      "Chain of custody, the documented record of who handled evidence and how, makes it credible and admissible.",
      "Treat evidence carefully from the first action, because you rarely know which incident will have consequences.",
    ],
    project: {
      name: "Write the evidence rules",
      blurb: "Write a short 'first responder' checklist for handling a possibly-evidential compromised device: what to do, and crucially what NOT to do (do not log in and poke around, do not reboot before memory is captured, document everything). This restraint-and-documentation discipline is exactly what protects a case, and shows real professional maturity.",
    },
    ethicsNote: "Evidence handling is done lawfully, within your organisation's authority and any legal requirements. Respect privacy and process; mishandling evidence can harm both the case and the people involved. This is careful, consequential defensive work.",
  },
};

export default topic3;

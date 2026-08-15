import type { TopicManifest } from "../../learn/types";
import { ControlLab } from "../../learn/conceptLabs";

/* Module 1 - Topic 3: types of security control. Case: Target 2013,
 * where detective controls fired but nobody acted, so the breach ran
 * anyway. Public record: US Senate report and press coverage 2014. */
const topic3: TopicManifest = {
  id: "m1t3",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "The kinds of defence: preventive, detective, corrective",
  role: "As a cyber security analyst, you'll work with these controls every day, and your value is spotting where one is missing. Knowing the difference is how you find the gap before an attacker does.",
  minutes: 18,
  promise: "The three jobs a security control can do, and the breach where the alarm was ignored.",
  brief: "In this lesson, we'll look at the three jobs a security control can do, and the three forms it can take. Then you'll see the breach where the alarm genuinely went off, and nobody acted on it, at one of the biggest retailers in the world.",

  learn: [
    {
      heading: "A control is anything that reduces risk. There are three jobs it can do",
      body: [
        "In security, a 'control' is just a safeguard: anything you put in place to reduce a risk. That includes technology, but also rules and even physical things. There are three jobs a control can do, and good security uses all three.",
        "Preventive controls stop a bad thing from happening. Detective controls spot it when it does. Corrective controls put things right afterwards. Prevention alone is never enough, because some attacks will get through, so you also need to detect them and recover.",
      ],
      examples: [
        "Preventive: a lock, a firewall, MFA, staff training.",
        "Detective: CCTV, an alarm, a SIEM alert, a log review.",
        "Corrective: a backup you restore from, an incident-response plan.",
      ],
      analogy: {
        plain: "A house uses all three: locks and a fence (prevent), a burglar alarm and cameras (detect), and insurance plus a locksmith on speed-dial (correct). Relying on locks alone is how you get robbed and never know until it is too late.",
        realTerm: "preventive, detective, corrective controls",
      },
    },
    {
      heading: "Controls also come in three flavours: technical, administrative, physical",
      body: [
        "As well as the job it does, a control has a type. Technical controls are enforced by technology (a firewall, encryption, a password policy the system checks). Administrative controls are rules and processes people follow (a policy, training, a joiners-and-leavers procedure). Physical controls are the tangible world (locks, doors, guards, a shredder).",
        "You will see these labels all over the certificates and the job. The point is coverage: a strong defence has all three jobs and all three types, so no single missing piece leaves the whole thing open.",
      ],
      examples: [
        "Technical: encryption, MFA, a firewall rule.",
        "Administrative: a security policy, awareness training, an access-review process.",
        "Physical: a locked server room, a visitor badge, CCTV.",
      ],
    },
    {
      heading: "A detective control is worthless if nobody acts on it",
      body: [
        "Here is the trap that catches real companies. Buying a detective control (an alarm, an alerting tool) is not the same as detecting. If the alert fires into an inbox nobody reads, or a queue nobody works, the attack succeeds anyway, and you will have paid for the tool that watched it happen.",
        "This is why the human process around a control matters as much as the control itself. A brilliant alarm plus no one to answer it equals no alarm. You are about to see exactly that, at one of the biggest retailers in the world.",
      ],
      examples: [
        "An alert that lands in an unmonitored inbox is a control on paper only.",
        "A camera nobody reviews records the crime but never stops it.",
        "The fix is a process: who watches, who responds, and how fast.",
      ],
    },
  ],

  glossary: [
    { term: "control", definition: "Any safeguard put in place to reduce a risk: technology, a rule, or a physical measure." },
    { term: "preventive control", definition: "A safeguard that stops a bad thing from happening, like a lock, a firewall, or MFA." },
    { term: "detective control", definition: "A safeguard that spots a bad thing happening, like an alarm, CCTV, or a SIEM alert. It only helps if someone acts on it." },
    { term: "corrective control", definition: "A safeguard that puts things right after an incident, like restoring from backup or an incident-response plan." },
  ],

  seeHeading: "When the alarm rang and no one answered",

  cases: [
    {
      org: "Target",
      year: "2013",
      headline: "The breach the security system actually detected",
      whatHappened: "Attackers got into the US retailer Target through a supplier's stolen login, then planted software on the checkout tills to skim payment cards. The striking part: Target's expensive threat-detection system did its job and raised alerts as the malware was installed. The warnings were not acted on in time, and the theft continued through the busiest shopping season of the year.",
      theMissedMeasure: "The detective control worked, but the response process behind it did not. Alerts were generated and effectively ignored, and the network was not segmented enough to keep a supplier's access away from the payment systems.",
      theCost: "Around 40 million payment cards and personal details on tens of millions more. The financial and reputational damage ran into hundreds of millions, and the CEO ultimately lost his job. The lesson stuck: detection without response is not defence.",
      control: "access-control",
      impact: ["40 million payment cards stolen", "70 million more records exposed", "$18.5M settlement; the CEO resigned"],
      source: "Public record; US Senate Commerce Committee report, 2014, and contemporary reporting.",
      brandColor: "#cc0000",
      news: { headline: "Target hackers stole 40 million credit cards", outlet: "BBC News", date: "December 2013", url: "https://www.bbc.co.uk/news/technology-25506020" },
    },
  ],

  lab: {
    title: "Sort the controls by their job",
    intro: "Read each control and decide whether it prevents, detects, or corrects. Then remember Target: detection only counts if someone acts.",
    prompts: [
      "For each control, pick Preventive, Detective, or Corrective.",
      "Every answer explains the reasoning.",
      "Notice a good defence needs all three, not just prevention.",
    ],
    component: ControlLab,
  },

  check: {
    explain: {
      prompt: "Using the Target breach, explain why buying a detective control is not the same as being protected. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "A detective control only tells you something is happening; it does not stop it. Target actually had a good detection system, and it did fire alerts when the card-skimming malware was installed. But the process behind the alert failed: nobody acted in time, so the theft ran on. A control is only as good as the human response wrapped around it. Real protection needs prevention to stop what it can, detection to catch the rest, and a fast, staffed process to respond, plus corrective controls to recover.",
    },
    quiz: [
      {
        q: "A firewall that blocks bad traffic before it arrives is which kind of control?",
        options: ["Preventive", "Detective", "Corrective", "Administrative only"],
        answer: 0,
        why: "It stops the bad thing before it happens, which makes it preventive. (It is also a technical control by type.)",
      },
      {
        q: "Restoring files from a clean backup after ransomware is which kind of control?",
        options: ["Preventive", "Detective", "Corrective", "Physical"],
        answer: 2,
        why: "It puts things right after the incident, so it is corrective. Backups are the classic corrective control.",
      },
      {
        q: "What was the core lesson of the Target 2013 breach?",
        options: [
          "Detection tools are a waste of money",
          "Detection without a response process is not protection",
          "Firewalls do not work",
          "Only physical controls matter",
        ],
        answer: 1,
        why: "Target's detective control worked and alerted, but nobody acted in time. A control needs a staffed, fast response process behind it, or the attack succeeds anyway.",
      },
    ],
  },

  wrap: {
    headline: "You can classify any defence by its job and its type, and spot where one is missing.",
    takeaways: [
      "Controls do one of three jobs: prevent, detect, or correct. Good security uses all three.",
      "Controls come in three types too: technical, administrative, physical.",
      "A detective control with no response process behind it is protection on paper only.",
    ],
    project: {
      name: "Map your own controls",
      blurb: "Pick something you protect (your laptop, your home). List one preventive, one detective, and one corrective control you already have, and one that is missing. Finding the gap is exactly what a security assessment does.",
    },
    ethicsNote: "These ideas are for protecting systems you own or are authorised to defend. Unauthorised access is an offence under the Computer Misuse Act 1990.",
  },
};

export default topic3;

import type { TopicManifest } from "../../learn/types";
import { ControlMatchLab } from "../../learn/conceptLabs";

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
  brief: "In this lesson, we'll look at the three jobs a security control can do, and the three forms it can take. Then you'll see the breach where one phone call to the help desk undid the controls, at one of the biggest names in Las Vegas.",

  learn: [
    {
      heading: "A control is anything that reduces risk. There are three jobs it can do",
      visual: { id: "control-timeline" },
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
      heading: "A control is only as strong as the people and process behind it",
      body: [
        "Here is the trap that catches real companies. Buying a control (an alarm, an MFA policy, a help desk that can reset access) is not the same as being protected. If the alert fires into an inbox nobody reads, or the help desk resets a login for anyone who calls and sounds convincing, the attack succeeds anyway.",
        "This is why the human process around a control matters as much as the control itself. A brilliant lock plus a guard who opens it for a smooth-talking stranger is no lock at all. You are about to see exactly that take down one of the biggest names in Las Vegas.",
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

  seeHeading: "When one phone call undid the controls",

  cases: [
    {
      org: "MGM Resorts",
      year: "2023",
      headline: "One phone call to the help desk took down a casino empire",
      whatHappened: "In September 2023, attackers phoned MGM Resorts' IT help desk, pretended to be an employee they had researched online, and talked staff into resetting that account's login and second factor. No malware, no clever exploit, just a convincing call. From there they spread ransomware across MGM's systems: slot machines went dark, hotel room keys and check-in failed, and operations were disrupted for around ten days.",
      theMissedMeasure: "The control that failed was a human process: the help desk reset access without properly checking who was really asking. The strongest technology means little if a phone call can undo it.",
      theCost: "Around $100M in impact and roughly ten days of disruption across hotels and casinos. It became the textbook proof that your controls are only as strong as the people and process behind them.",
      control: "access-control",
      impact: ["~$100M impact", "~10 days of disruption", "slot machines and room keys down"],
      source: "Public record; MGM disclosures and 2023 reporting.",
      brandColor: "#b8975a",
      news: { headline: "MGM Resorts hit by cyber-attack that disrupted casinos and hotels", outlet: "BBC News", date: "September 2023" },
    },
  ],

  lab: {
    title: "Match each control to its job",
    intro: "Tap a control, then tap the job it does: prevent, detect, or correct. A good defence needs all three.",
    prompts: [
      "Tap a control to select it, then tap Preventive, Detective, or Corrective.",
      "Match all six, then press Check.",
      "Then remember MGM: a control only counts if the people and process behind it hold.",
    ],
    component: ControlMatchLab,
  },

  check: {
    explain: {
      prompt: "Using the MGM breach, explain why simply having controls is not the same as being protected. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "MGM had controls, including MFA and a help desk that could reset access. But the process around one control failed: the help desk reset an account for an attacker who just phoned up and sounded convincing, so the strong technology was bypassed without any hacking at all. A control is only as good as the people and process wrapped around it. Real protection needs prevention to stop what it can, detection to catch the rest, a fast staffed process to respond, and corrective controls to recover.",
    },
    quiz: [
      {
        q: "A firewall that blocks bad traffic before it arrives is which kind of control?",
        options: [
          "Preventive, it stops the bad thing before it happens",
          "Detective, it spots the bad thing while it happens",
          "Corrective, it fixes the damage after it happens",
          "Deterrent, it discourages the attacker from trying",
          "Recovery, it restores normal service afterwards",
        ],
        answer: 0,
        reasons: [
          "Right. It blocks the traffic before it can do harm, which is what preventive means. By type it is also a technical control.",
          "A detective control notices activity, like an alarm or a log alert. A firewall that blocks goes one step further and stops it.",
          "Corrective controls put things right after the fact, like restoring a backup. Blocking traffic happens before any damage.",
          "A deterrent discourages an attacker, like a warning banner. A firewall does not merely discourage; it actually blocks.",
          "Recovery controls restore service after an incident. A firewall acts up front, not during the clean-up.",
        ],
      },
      {
        q: "Restoring files from a clean backup after ransomware is which kind of control?",
        options: [
          "Preventive, it stops the attack from happening at all",
          "Detective, it reveals that an attack has taken place",
          "Corrective, it puts things right after the attack",
          "Deterrent, it puts attackers off trying in the first place",
          "Physical, it protects the building and the hardware",
        ],
        answer: 2,
        reasons: [
          "Backups do not stop ransomware landing. They act after the damage is done, so this is not preventive.",
          "Restoring does not detect the attack; by the time you restore you already know. Detection is a separate, earlier step.",
          "Right. It repairs the damage after the incident, which is exactly corrective. Backups are the classic corrective control.",
          "A deterrent discourages the attacker beforehand. A backup does nothing to put an attacker off; it just helps you recover.",
          "Physical controls guard buildings and hardware. Restoring data is about the data itself, not the premises.",
        ],
      },
      {
        q: "What was the core lesson of the MGM 2023 breach?",
        options: [
          "Stronger technology on its own would have stopped the attackers",
          "A control is only as strong as the people and process behind it",
          "Help desks should never be allowed to reset any account at all",
          "Attackers always need custom malware to break into a large firm",
          "Multi-factor authentication is pointless once an attacker calls in",
        ],
        answer: 1,
        reasons: [
          "MGM's technology was already strong. The gap was in a process, so more technology on its own would not have closed it.",
          "Right. The help desk reset access after a convincing phone call. The control existed, but the human process behind it could be talked past, with no hacking at all.",
          "Too absolute. Help desks must be able to reset accounts; the fix is verifying identity properly, not banning resets.",
          "The attackers used a phone call and social engineering, not advanced malware. That is the whole point of the story.",
          "MFA is valuable. The issue was that the reset process could bypass it, not that MFA itself is useless.",
        ],
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

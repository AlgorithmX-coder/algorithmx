import type { TopicManifest } from "../../learn/types";
import { RtoRpoLab } from "../../learn/conceptLabs";

/* Module 19 - Topic 3: RTO and RPO. Case: the general business reality
 * that different systems have very different recovery needs, and that
 * setting RTO/RPO is how resilience is sized and prioritised. Public
 * record: established business-continuity practice. */
const topic3: TopicManifest = {
  id: "m19t3",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "RTO and RPO",
  role: "Resilience has to be sized: how fast must each system come back, and how much recent data can you afford to lose? RTO and RPO are the two targets that answer this, and they turn vague 'we need backups' into concrete, prioritised requirements.",
  minutes: 14,
  promise: "Learn the two numbers that define recovery, how fast and how much data loss, and how they size and prioritise your whole resilience plan.",
  brief: "In this lesson, we'll learn two essential terms that make resilience concrete: RTO (Recovery Time Objective, how fast a system must be restored) and RPO (Recovery Point Objective, how much recent data you can afford to lose). We'll see how these two targets, set per system based on business need, drive your backup frequency, your recovery design, and your priorities. They turn resilience from a vague wish into a measurable plan.",

  learn: [
    {
      heading: "RTO: how fast must it come back?",
      body: [
        "The Recovery Time Objective (RTO) answers: after a disruption, how quickly must this system be restored and working again? It is a target set by the business based on how much downtime the organisation can tolerate for that system. A customer-facing website might have an RTO of a couple of hours; an internal system used occasionally might have an RTO of a few days. The RTO drives how you design recovery: a tight RTO needs fast recovery (even automatic failover), while a loose one allows a slower, cheaper approach.",
        "RTO matters because downtime has a cost, lost revenue, lost productivity, reputational harm, and that cost differs hugely between systems. Setting RTOs forces the organisation to decide what truly cannot be down for long versus what can wait, so recovery effort and money go where they matter most. It turns 'get everything back fast' (impossible and wasteful) into a prioritised, affordable plan.",
      ],
      examples: [
        "RTO = how fast a system must be restored, set by tolerable downtime.",
        "Tight RTO (hours): needs fast recovery or failover. Loose RTO (days): slower, cheaper.",
        "RTOs force prioritisation: effort goes to what cannot be down for long.",
      ],
      analogy: {
        plain: "How quickly you need a replacement differs: a broken-down ambulance needs replacing in minutes; a spare office chair can wait a week. RTO is that 'how fast' for each system.",
        realTerm: "Recovery Time Objective",
      },
    },
    {
      heading: "RPO: how much data can you lose?",
      body: [
        "The Recovery Point Objective (RPO) answers a different question: how much recent data can you afford to lose? If you back up once a day and a disaster strikes just before the next backup, you could lose almost a day's data. If you can only tolerate losing 15 minutes of data, you must back up (or replicate) at least every 15 minutes. So the RPO directly drives how often you back up: the less data loss you can tolerate, the more frequent your backups must be.",
        "RPO, like RTO, is set per system by business need. For some data (a bank's transactions), losing even minutes is unacceptable, demanding near-continuous replication. For other data (a rarely-changing archive), losing a day is fine, so a daily backup suffices. Matching backup frequency to the RPO means you spend effort protecting the data that matters, at the frequency it needs, rather than over- or under-protecting everything equally.",
      ],
      examples: [
        "RPO = how much recent data you can afford to lose, set by business need.",
        "It drives backup frequency: a 15-minute RPO needs backups at least every 15 minutes.",
        "Critical data: near-continuous replication. Rarely-changing data: a daily backup.",
      ],
    },
    {
      heading: "Two targets that size the whole plan",
      body: [
        "Together, RTO and RPO size and prioritise an organisation's whole resilience plan. For each important system, the business sets an RTO (how fast back) and an RPO (how much data loss), based on how critical it is, and those targets then dictate the recovery design and backup frequency. A system with a two-hour RTO and a 15-minute RPO needs fast recovery and very frequent backups; one with a one-week RTO and a one-day RPO can be handled far more simply and cheaply.",
        "This is how resilience becomes a concrete, affordable engineering problem rather than a vague aspiration. It also forces the valuable business conversation: which systems and data are truly critical, and what can we actually afford? A security or continuity professional who can help an organisation set sensible RTOs and RPOs, and design to meet them, is doing exactly the practical, prioritising work that makes resilience real, and it is very hireable.",
      ],
      examples: [
        "Per system: set RTO (how fast) and RPO (how much data loss) by criticality.",
        "Those targets dictate the recovery design and backup frequency.",
        "It turns resilience into a concrete, affordable, prioritised plan.",
      ],
      analogy: {
        plain: "Insurance is sized to what you are protecting: more cover for the house than the garden shed. RTO and RPO size your resilience 'cover' per system to what it is worth.",
        realTerm: "sizing resilience",
      },
    },
  ],

  glossary: [
    { term: "RTO", definition: "Recovery Time Objective: how quickly a system must be restored after a disruption; it drives the recovery design." },
    { term: "RPO", definition: "Recovery Point Objective: how much recent data you can afford to lose; it drives how often you back up or replicate." },
    { term: "downtime", definition: "The period a system is unavailable; its cost (lost revenue, productivity, reputation) is what RTO is set against." },
    { term: "replication", definition: "Continuously copying data so very little is lost, used to meet a tight (near-zero) RPO." },
  ],

  seeHeading: "Different systems, different recovery needs",

  cases: [
    {
      org: "RTO & RPO in practice",
      year: "established",
      headline: "Setting how-fast and how-much-data-loss targets is how resilience is sized and prioritised",
      whatHappened: "Across business-continuity practice, organisations set RTO and RPO targets for their important systems to size and prioritise recovery. The reality driving this is that systems differ enormously: a bank's transaction system cannot lose even minutes of data (very tight RPO) and must recover fast (tight RTO), demanding continuous replication and rapid failover; a rarely-used internal archive can tolerate a day's data loss and days of downtime, so a simple daily backup suffices. By setting these two targets per system, based on business need, organisations direct their resilience effort and spend where it matters, rather than over-protecting everything or leaving the critical under-protected.",
      theMissedMeasure: "RTO and RPO are themselves the measures: they turn 'we need resilience' into concrete, prioritised requirements that dictate backup frequency and recovery design. Without them, organisations either over-spend protecting everything equally or discover too late that a critical system's recovery was never sized for its true needs.",
      theCost: "Here the value is proportionate resilience: effort and money go to the systems and data that truly matter, at the speed and frequency they need, which is how resilience becomes both effective and affordable.",
      control: "secure-configuration",
      impact: ["RTO sizes how fast; RPO sizes how much data loss", "set per system by business criticality", "turns resilience into a concrete, prioritised, affordable plan"],
      source: "Public record; established business-continuity practice.",
      brandColor: "#2d7d9a",
      news: { headline: "RTO and RPO: sizing recovery to what each system is worth", outlet: "Business-continuity practice (established)", date: "established" },
    },
  ],

  lab: {
    title: "RTO or RPO?",
    intro: "Nothing to install and nothing leaves this page. Tap each statement, then tap which target it sets: RTO (how fast) or RPO (how much data loss)?",
    prompts: [
      "RTO is about time: how fast must it be back?",
      "RPO is about data: how much recent data can you lose?",
      "Backup frequency is driven by the RPO.",
    ],
    component: RtoRpoLab,
  },

  check: {
    explain: {
      prompt: "Explain what RTO and RPO each mean, how each drives a decision, and how together they size an organisation's resilience plan.",
      modelAnswer: "RTO, the Recovery Time Objective, is how quickly a system must be restored and working again after a disruption, set by the business based on how much downtime it can tolerate for that system; it drives the recovery design, a tight RTO (hours) needs fast recovery or automatic failover, while a loose one (days) allows a slower, cheaper approach. RPO, the Recovery Point Objective, is how much recent data you can afford to lose, and it drives backup frequency, if you can only tolerate losing 15 minutes of data you must back up or replicate at least every 15 minutes, whereas data that can tolerate a day's loss needs only a daily backup. Together they size and prioritise the whole resilience plan: for each important system, the business sets an RTO and an RPO based on how critical it is, and those targets then dictate the recovery design and backup frequency, so a system with a two-hour RTO and 15-minute RPO gets fast recovery and very frequent backups, while one with a one-week RTO and one-day RPO can be handled simply and cheaply. This turns resilience from a vague aspiration into a concrete, affordable, prioritised plan, directing effort and spend to the systems and data that truly matter.",
    },
    quiz: [
      {
        q: "What does RTO (Recovery Time Objective) set?",
        options: [
          "How much data you can lose",
          "How quickly a system must be restored after a disruption",
          "How many backups to keep",
          "The cost of the system",
        ],
        answer: 1,
        why: "RTO is about time, how fast back, set by tolerable downtime, and it drives the recovery design.",
      },
      {
        q: "What drives how often you must back up?",
        options: [
          "The RTO",
          "The RPO (how much recent data you can afford to lose)",
          "The size of the office",
          "The number of staff",
        ],
        answer: 1,
        why: "A tight RPO (little data loss tolerated) demands frequent backups or continuous replication.",
      },
      {
        q: "Why set RTO and RPO per system?",
        options: [
          "To make things complicated",
          "Because systems differ in criticality, so the targets direct resilience effort and spend to what matters",
          "So every system is treated identically",
          "They are only for banks",
        ],
        answer: 1,
        why: "Per-system targets turn resilience into a prioritised, affordable plan, protecting the critical properly without over-protecting everything.",
      },
    ],
  },

  wrap: {
    headline: "You can now size resilience with the two targets that matter: how fast (RTO) and how much data loss (RPO).",
    takeaways: [
      "RTO is how fast a system must be restored; it drives the recovery design.",
      "RPO is how much recent data you can afford to lose; it drives backup frequency.",
      "Set per system by criticality, they turn resilience into a concrete, prioritised, affordable plan.",
    ],
    project: {
      name: "Set targets for your systems",
      blurb: "For two or three systems or data sets you rely on, set a rough RTO (how fast you would need them back) and RPO (how much recent data you could bear to lose). Notice how different they are, and how that would change how you protect each. Sizing resilience this way is exactly the practical thinking a continuity role needs.",
    },
    ethicsNote: "Sizing and planning resilience is constructive work for your own or authorised systems, balancing cost against protecting what matters. It is part of the honest, proportionate approach to risk the field values.",
  },
};

export default topic3;

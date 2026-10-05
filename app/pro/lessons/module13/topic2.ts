import type { TopicManifest } from "../../learn/types";
import { SocRoleLab } from "../../learn/conceptLabs";

/* Module 13 - Topic 2: tiers, roles and the escalation path. Case:
 * Target, 2013, seen from the SOC-process angle (security tooling
 * generated alerts about the intrusion, but they were not escalated and
 * acted on in time). Public record: US Senate committee report and 2014
 * reporting. */
const topic2: TopicManifest = {
  id: "m13t2",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "Tiers, roles & escalation",
  role: "A SOC is organised into tiers and roles with a clear escalation path, and that structure is the career ladder many analysts climb. Understanding it tells you where you would start, how you progress, and, vitally, why acting on and escalating alerts correctly is everything.",
  minutes: 15,
  promise: "Learn how a SOC is structured and where you would start, then see the breach where the alerts fired but were never acted on.",
  brief: "In this lesson, we'll look at how a SOC is organised: the tiers of analysts (where you would likely start), their roles, and the escalation path that moves a concern to the right people. We'll see that a SOC is only as good as its process, especially whether alerts are actually acted upon. Then we'll study the Target breach from this angle: the tooling did generate alerts, but the escalation and response failed.",

  learn: [
    {
      heading: "A SOC in tiers: where you would start",
      body: [
        "Most SOCs are organised in tiers. Tier 1 analysts are the front line: they are first to see incoming alerts, triage them (sort real from noise), handle the routine ones, and escalate anything that needs more attention. This is typically the entry-level role, the job this course is preparing you for. Tier 2 analysts investigate what Tier 1 escalates, with more depth and context. Tier 3, senior analysts, threat hunters and incident responders, handle the hardest cases, hunt proactively for threats, and build new detections. Overseeing it all is the SOC manager.",
        "This structure is also a career ladder. You start at Tier 1, build judgement and skill, and progress. Knowing the ladder helps you see not just the first job but the path beyond it, and it tells you exactly what a Tier 1 analyst is expected to do well: triage accurately, and escalate appropriately.",
      ],
      examples: [
        "Tier 1: front-line triage, handle routine, escalate the rest (the entry role).",
        "Tier 2: deeper investigation of escalated alerts.",
        "Tier 3: proactive threat hunting, serious incident response, building detections.",
      ],
      analogy: {
        plain: "Like a hospital: triage nurses see everyone first and sort by urgency (Tier 1), doctors investigate and treat (Tier 2), specialists handle the hardest cases (Tier 3), all coordinated by those running the department.",
        realTerm: "SOC tiers",
      },
    },
    {
      heading: "The escalation path: moving a concern to the right people",
      body: [
        "The escalation path is the defined route by which a concern moves to whoever needs to handle it. A Tier 1 analyst who spots something beyond routine escalates to Tier 2; a confirmed serious incident is escalated further, to incident response, to management, and sometimes beyond the SOC entirely (legal, executives, even law enforcement and regulators). The path exists so that the right people are involved fast, without an analyst either sitting on something serious or raising every tiny thing to the top.",
        "Getting escalation right is a core skill and a fine judgement. Escalate too much and you cause noise and alarm fatigue; escalate too little and a real incident festers. The art, which experience builds, is recognising what genuinely needs more attention and moving it promptly and clearly. The whole process depends on each person doing their part of the chain.",
      ],
      examples: [
        "Tier 1 escalates beyond-routine concerns to Tier 2.",
        "Confirmed serious incidents escalate to IR, management, and sometimes beyond.",
        "Escalate too much: noise; too little: incidents fester. Judgement matters.",
      ],
    },
    {
      heading: "A SOC is only as good as whether it acts",
      body: [
        "Here is the sobering truth that the case ahead illustrates: all the monitoring and alerting in the world is worthless if the alerts are not acted upon. A SOC can have excellent tools generating accurate alerts, and still fail catastrophically if those alerts are ignored, lost in the noise, or not escalated and investigated. The process, people actually looking, judging, and acting, is what turns detection into defence.",
        "This is why triage and escalation are not boring administrative steps; they are the point. A missed or ignored alert is indistinguishable, in its consequences, from having no alert at all. The Target breach is the definitive lesson: the security tooling did its job and raised alerts about the intrusion, but the human process of escalating and acting on them failed, and 40 million card records were stolen anyway.",
      ],
      examples: [
        "Accurate alerts are worthless if they are not acted upon.",
        "A missed alert has the same consequence as no alert at all.",
        "The human process, looking, judging, acting, turns detection into defence.",
      ],
      analogy: {
        plain: "A smoke alarm that sounds while everyone ignores it saves no one. The alarm working is not enough; someone has to act on it.",
        realTerm: "acting on alerts",
      },
    },
  ],

  glossary: [
    { term: "SOC tiers", definition: "The levels a SOC is organised into: Tier 1 (front-line triage), Tier 2 (investigation), Tier 3 (hunting and incident response), plus management." },
    { term: "Tier 1 analyst", definition: "The front-line role that first sees and triages alerts and escalates what matters; typically the entry-level SOC job." },
    { term: "escalation path", definition: "The defined route by which a concern is moved to whoever needs to handle it, from Tier 1 up to management and beyond." },
    { term: "alert fatigue", definition: "When too many alerts (especially false ones) dull attention, so real alerts get missed; a key reason to tune and escalate well." },
  ],

  seeHeading: "When the alerts fired and no one acted",

  cases: [
    {
      org: "Target (the SOC-process view)",
      year: "2013",
      headline: "Security tooling raised alerts about the intrusion, but the process failed to act on them",
      whatHappened: "In the 2013 Target breach (which you met as a kill-chain example), there is a crucial SOC-process dimension. Target had security monitoring in place, and it reportedly did generate alerts related to the attackers' activity as the intrusion unfolded. But those alerts were not escalated and acted upon effectively in time, lost amid the noise and process gaps, so the attack proceeded and around 40 million card records were stolen. The detection partly worked; the human process of responding to it did not.",
      theMissedMeasure: "Effective triage and escalation, acting on the alerts the tooling produced. Detection without a working process to act on it is detection wasted. Clear ownership, tuned alerts that stand out from the noise, and a reliable escalation path are what would have turned those alerts into a stopped attack.",
      theCost: "Around 40 million card records stolen, despite alerts having fired, a defining illustration that a SOC is only as good as whether it acts, and that triage and escalation are the point, not an afterthought.",
      control: "access-control",
      impact: ["alerts about the intrusion were reportedly generated", "they were not escalated and acted on in time", "~40M card records stolen despite detection"],
      source: "Public record; US Senate Commerce Committee report and 2014 reporting.",
      brandColor: "#cc0000",
      news: { headline: "Target breach: warnings were reportedly raised but not acted upon", outlet: "Mainstream and security reporting (2014)", date: "2014" },
    },
  ],

  lab: {
    title: "Match the SOC role",
    intro: "Nothing to install and nothing leaves this page. Tap each responsibility, then tap whose job it most is.",
    prompts: [
      "Tier 1 triages, Tier 2 investigates, Tier 3 hunts and leads IR, the manager runs it.",
      "Tier 1 is where you would most likely start.",
      "This is the career ladder many analysts climb.",
    ],
    component: SocRoleLab,
  },

  check: {
    explain: {
      prompt: "Target had monitoring that reportedly generated alerts about the intrusion, yet 40 million cards were stolen. Explain how a SOC is structured and escalates, and why this case shows that a SOC is only as good as whether it acts.",
      modelAnswer: "A SOC is organised in tiers: Tier 1 analysts (the entry role) are first to see alerts, triage them (sort real from noise), handle routine ones and escalate the rest; Tier 2 investigates what is escalated; Tier 3, senior analysts, threat hunters and incident responders, handle the hardest cases, hunt proactively and build detections; and a SOC manager oversees it. The escalation path is the defined route moving a concern to whoever needs it, up to management and sometimes beyond the SOC (legal, executives, regulators), so the right people act fast, judged carefully because escalating too much causes noise and too little lets incidents fester. Target shows that a SOC is only as good as whether it acts because its tooling did its job, generating alerts about the attack, but the human process of escalating and acting on them failed, so the attack proceeded and 40 million cards were stolen. A missed or ignored alert has the same consequence as no alert at all, which is exactly why triage and escalation are the point, not an afterthought.",
    },
    quiz: [
      {
        q: "Which tier is typically the entry-level SOC role?",
        options: [
          "Tier 3 (threat hunting / IR)",
          "Tier 1 (front-line triage and escalation)",
          "SOC manager",
          "There are no tiers",
        ],
        answer: 1,
        why: "Tier 1 analysts are first to see and triage alerts and escalate what matters: the common starting point and the job this course prepares you for.",
      },
      {
        q: "What is the escalation path for?",
        options: [
          "Making the SOC bigger",
          "Moving a concern to whoever needs to handle it, so the right people act fast",
          "Deleting alerts",
          "Slowing down response",
        ],
        answer: 1,
        why: "It routes concerns to the right level, balancing not sitting on serious things against not raising every trivial one.",
      },
      {
        q: "The deeper lesson of Target's SOC-process failure is that:",
        options: [
          "Monitoring tools are useless",
          "Accurate alerts are worthless if they are not acted upon; the process of triage and escalation is the point",
          "Alerts should always be ignored",
          "Only Tier 3 matters",
        ],
        answer: 1,
        why: "Detection without a working process to act on it is wasted. A missed alert has the same consequence as no alert at all.",
      },
    ],
  },

  wrap: {
    headline: "You now know how a SOC is structured, where you would start, and why acting on alerts is everything.",
    takeaways: [
      "A SOC runs in tiers: Tier 1 triage (the entry role), Tier 2 investigation, Tier 3 hunting/IR, plus the manager, a real career ladder.",
      "The escalation path moves concerns to the right people fast; good escalation is a judgement skill.",
      "A SOC is only as good as whether it acts: accurate alerts not acted upon are worthless (Target).",
    ],
    project: {
      name: "Map the ladder",
      blurb: "Sketch the SOC tiers and write one line on what each does, then mark where you would start and what skill would move you up. Seeing the career ladder clearly, and that Tier 1 triage is the realistic entry point, helps you target your learning and talk credibly about the role in interviews.",
    },
    ethicsNote: "Triage, escalation and response are performed within your own organisation's authority and process. This is the constructive machinery of defence; it operates within the law and the authorisation principles from Module 5.",
  },
};

export default topic2;

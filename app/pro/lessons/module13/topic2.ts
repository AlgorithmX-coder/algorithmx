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
          "Tier 3, the senior threat hunters and incident responders",
          "Tier 2, which investigates the alerts escalated to it in depth",
          "Tier 1, the front line that triages alerts and escalates them",
          "The SOC manager, who oversees and coordinates the whole team",
          "A specialist responder brought in only for the most serious breaches",
        ],
        answer: 2,
        reasons: [
          "Tier 3 is the most senior analyst level, reached with experience. It is where you progress to, not where a newcomer begins.",
          "Tier 2 investigates what Tier 1 escalates, so it sits a step above the entry point. You usually reach it after time on the front line.",
          "Right. Tier 1 analysts are first to see and triage alerts and escalate what matters: the common starting point, and the job this course prepares you for.",
          "The manager runs the whole team, a role built on years of experience. It is the top of the ladder, not the bottom rung.",
          "That is a senior incident-response role for the hardest cases, not an entry job. Beginners start on the front line triaging everyday alerts.",
        ],
      },
      {
        q: "What is the escalation path for?",
        options: [
          "Ranking analysts by how many alerts each of them closes per day",
          "Automatically closing the alerts that are most likely false positives",
          "Deciding which new security tools the SOC should go on to buy",
          "Keeping a tidy record of every alert for the end-of-year audit",
          "Moving a concern to whoever must handle it, so the right people act fast",
        ],
        answer: 4,
        reasons: [
          "The path is about routing concerns to the right people, not scoring analysts. Counting closed alerts is a performance metric, a different thing entirely.",
          "Closing false positives is part of triage, not what escalation is for. Escalation moves a real concern up to whoever needs it.",
          "Buying tools is a procurement decision made separately. The escalation path is about handling a live concern, not purchasing.",
          "Good records matter, but that is documentation, not escalation. The path exists to get the right people onto a concern quickly.",
          "Right. It routes a concern to the right level, balancing not sitting on something serious against not raising every trivial thing to the top.",
        ],
      },
      {
        q: "The deeper lesson of Target's SOC-process failure is that:",
        options: [
          "The monitoring tools must have failed to raise any alerts at all",
          "Buying more detection tools would have been enough to prevent the breach",
          "The attack was simply too sophisticated for any process to have caught",
          "Accurate alerts are worthless unless acted on; triage and escalation are the point",
          "The SOC should have escalated every single alert straight to management",
        ],
        answer: 3,
        reasons: [
          "The tooling did generate alerts about the intrusion; that is the whole point of the case. The failure was in acting on them, not in raising them.",
          "More tools would not have helped when the alerts already raised were ignored. The gap was the process of acting, not a shortage of detection.",
          "Sophistication was not the problem here; the attack was detected. What failed was the human process of escalating and responding to what the tools found.",
          "Right. Detection without a working process to act on it is wasted. A missed or ignored alert has the same consequence as having no alert at all.",
          "Escalating everything would only have worsened the noise that buried the real alerts. Good escalation is about judgement, not raising every alert to the top.",
        ],
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

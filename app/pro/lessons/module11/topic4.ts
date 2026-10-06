import type { TopicManifest } from "../../learn/types";
import { PriorityOrderLab } from "../../learn/conceptLabs";

/* Module 11 - Topic 4: prioritising what to fix first. Case: the CISA
 * Known Exploited Vulnerabilities (KEV) catalog (established 2021),
 * which prioritises the vulnerabilities actually being exploited in the
 * wild, a concrete, widely-adopted answer to "what do we fix first?".
 * Public record: CISA's KEV catalog and Binding Operational Directive. */
const topic4: TopicManifest = {
  id: "m11t4",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "Prioritising what to fix first",
  role: "No organisation can fix every vulnerability at once, so prioritisation is the real skill. An analyst who can say 'fix these three first, and here is why' turns an overwhelming list into a defensible plan, which is exactly what managers and auditors want to see.",
  minutes: 16,
  promise: "Learn how to decide what to patch first when you cannot do everything, then see the catalogue that tells defenders which flaws to fix now.",
  brief: "In this lesson, we'll tackle the question every real security team faces: with hundreds of vulnerabilities and limited time, what do you fix first? We'll see that raw severity is only part of the answer, and that exposure and real-world exploitation often matter more. Then we'll look at a powerful, practical tool, the catalogue of vulnerabilities known to be actively exploited, which gives defenders a clear 'fix these now' list.",

  learn: [
    {
      heading: "You cannot fix everything, so you prioritise",
      body: [
        "A real organisation's vulnerability scan can return hundreds or thousands of findings. You will never clear them all at once, and trying to treat every flaw as equally urgent guarantees you spend effort in the wrong places. The essential skill is prioritisation: deciding, with good reasons, what to fix first, what next, and what can wait.",
        "This mirrors the risk thinking from Module 1. A vulnerability is only part of a risk; what matters is the likelihood it is abused and the impact if it is. So prioritisation is really risk-ranking your vulnerabilities, and doing it well is what turns an impossible list into a focused, defensible plan.",
      ],
      examples: [
        "A scan of hundreds of findings cannot all be fixed at once.",
        "Treating everything as equally urgent wastes effort on the wrong flaws.",
        "Prioritisation is risk-ranking: likelihood and impact decide the order.",
      ],
      analogy: {
        plain: "A hospital's emergency department does not treat patients first-come-first-served; it triages by how serious and how urgent each case is. Vulnerability management triages the same way.",
        realTerm: "vulnerability triage",
      },
    },
    {
      heading: "Severity, exposure, and exploitation together",
      body: [
        "Three factors drive priority. Severity (the CVSS score) tells you how bad the flaw is in principle. Exposure tells you how reachable the affected system is, an internet-facing server is far more pressing than an isolated internal one. And exploitation tells you whether attackers are actually using the flaw in the real world right now, which is often the single strongest signal of all.",
        "Weighing these together beats chasing the highest scores blindly. A critical flaw on an internet-facing system that is being actively exploited is an obvious fix-first. A critical flaw on an isolated test box that nobody is exploiting can reasonably wait behind it. Learning to blend severity, exposure and exploitation into a priority order is the heart of practical vulnerability management.",
      ],
      examples: [
        "Severity (CVSS): how bad in principle.",
        "Exposure: internet-facing beats isolated-internal for urgency.",
        "Exploitation: 'being used right now' is often the strongest signal of all.",
      ],
    },
    {
      heading: "Let real-world exploitation lead",
      body: [
        "Of the three factors, real-world exploitation deserves special weight, because it turns a theoretical risk into a present danger. A flaw attackers are actively using is being turned into breaches today, so fixing it is the most direct way to prevent an actual attack. This insight has become so important that defenders now maintain shared catalogues of exactly which vulnerabilities are known to be exploited, so everyone can prioritise them.",
        "This is a wonderfully practical idea: rather than drowning in thousands of theoretical flaws, you start with the ones proven to be dangerous in the real world. It focuses limited effort where it most reduces actual risk. The CISA Known Exploited Vulnerabilities catalogue you are about to see is the leading example, and it has reshaped how organisations prioritise patching.",
      ],
      examples: [
        "Actively exploited flaws are being turned into breaches today, so they lead.",
        "Shared catalogues of known-exploited flaws let everyone prioritise the proven dangers.",
        "Start with what is demonstrably dangerous, not the full theoretical list.",
      ],
      analogy: {
        plain: "If you hear burglars are actively trying a specific type of window on your street this week, you fix that window first, ahead of theoretical weaknesses no one is exploiting.",
        realTerm: "known-exploited-first",
      },
    },
  ],

  glossary: [
    { term: "vulnerability triage", definition: "Deciding, with good reasons, the order in which to fix vulnerabilities when you cannot fix them all at once." },
    { term: "exposure", definition: "How reachable an affected system is; internet-facing systems are far more urgent than isolated internal ones." },
    { term: "risk-based prioritisation", definition: "Ordering fixes by the real risk, blending severity, exposure and actual exploitation, rather than by raw score alone." },
    { term: "Known Exploited Vulnerabilities (KEV)", definition: "A catalogue of vulnerabilities confirmed to be actively exploited in the wild, used to prioritise what to fix first." },
  ],

  seeHeading: "The 'fix these now' list",

  cases: [
    {
      org: "CISA KEV catalog",
      year: "2021",
      headline: "A shared catalogue of actively-exploited flaws gives defenders a clear fix-first list",
      whatHappened: "In 2021, the US cybersecurity agency CISA established the Known Exploited Vulnerabilities (KEV) catalogue: a continually updated, public list of vulnerabilities confirmed to be actively exploited in the wild. The idea is simple and powerful, rather than asking organisations to somehow fix everything, it focuses attention on the flaws proven to be dangerous right now, and (for US federal agencies) sets deadlines to remediate them. It has been widely adopted beyond government as a practical prioritisation aid.",
      theMissedMeasure: "The catalogue is itself the constructive measure: it turns the overwhelming question 'what do we fix first?' into a concrete, evidence-based answer, 'start with the ones actually being exploited'. It embodies the lesson that real-world exploitation should lead prioritisation.",
      theCost: "Here the 'cost' is avoided cost: by directing limited effort at proven-dangerous flaws first, the KEV approach helps organisations prevent real breaches rather than spreading themselves thin across thousands of theoretical ones. It is a model of making security prioritisation practical.",
      control: "patching",
      impact: ["a public catalogue of actively-exploited vulnerabilities", "turns 'fix everything' into 'fix the proven-dangerous first'", "widely adopted as a prioritisation aid"],
      source: "Public record; CISA's Known Exploited Vulnerabilities catalogue and its Binding Operational Directive (2021).",
      brandColor: "#005288",
      news: { headline: "CISA's Known Exploited Vulnerabilities catalog: prioritising what to patch", outlet: "CISA / security reporting (2021)", date: "2021" },
    },
  ],

  lab: {
    title: "Rank the fixes",
    intro: "Nothing to install and nothing leaves this page. You cannot patch everything at once. Rank these vulnerabilities from fix-first to fix-last.",
    prompts: [
      "Weigh three things: severity, exposure, and whether it is actually being exploited.",
      "Internet-facing and actively-exploited beats isolated and theoretical.",
      "This is exactly the triage a security team does every week.",
    ],
    component: PriorityOrderLab,
  },

  check: {
    explain: {
      prompt: "Your scan returns hundreds of vulnerabilities and you cannot fix them all at once. Explain how you decide what to fix first, and why the CISA KEV catalogue is such a practical tool.",
      modelAnswer: "You prioritise by risk, blending three factors: severity (the CVSS score, how bad in principle), exposure (how reachable the affected system is, internet-facing beats isolated-internal), and exploitation (whether attackers are actually using the flaw right now). Weighing these together beats chasing the highest scores blindly: a critical, internet-facing, actively-exploited flaw is an obvious fix-first, while a critical flaw on an isolated test box nobody is exploiting can wait behind it. The CISA KEV catalogue is so practical because it leads with the strongest signal, real-world exploitation: instead of drowning in thousands of theoretical flaws, you start with the ones proven to be dangerous now, focusing limited effort where it most reduces actual risk and most directly prevents real attacks.",
    },
    quiz: [
      {
        q: "Why is prioritisation essential in vulnerability management?",
        options: [
          "Because all vulnerabilities are equally dangerous",
          "Because you cannot fix everything at once, so you must decide, with good reasons, what to fix first",
          "Because scanners are always wrong",
          "Because vulnerabilities do not matter",
        ],
        answer: 1,
        why: "Real scans return far more than you can fix immediately, so risk-ranking the list is the core skill.",
      },
      {
        q: "Which three factors should drive patching priority?",
        options: [
          "Colour, size, and age of the system",
          "Severity (CVSS), exposure (how reachable), and exploitation (is it being used now)",
          "Only the CVSS score",
          "Who reported it, when, and why",
        ],
        answer: 1,
        why: "Blending severity, exposure and real-world exploitation gives a far better order than raw score alone.",
      },
      {
        q: "Why does the CISA KEV catalogue lead with actively-exploited flaws?",
        options: [
          "Because exploited flaws are the least dangerous",
          "Because real-world exploitation turns theoretical risk into present danger, so fixing those most directly prevents real attacks",
          "Because it is easier than reading CVSS",
          "Because exploited flaws cannot be patched",
        ],
        answer: 1,
        why: "Flaws being used today are causing breaches today. Starting there focuses limited effort where it most reduces actual risk.",
      },
    ],
  },

  wrap: {
    headline: "You can now turn an overwhelming vulnerability list into a focused, defensible fix-first plan.",
    takeaways: [
      "You cannot fix everything at once, so prioritisation, risk-ranking your vulnerabilities, is the real skill.",
      "Priority blends severity, exposure, and real-world exploitation, not raw score alone.",
      "Actively-exploited flaws should lead; shared catalogues like CISA KEV make that practical.",
    ],
    project: {
      name: "Prioritise a short list",
      blurb: "Invent (or take from a real scan) four or five vulnerabilities with different severities, exposures and exploitation status, and write them in your fix-first order with a one-line reason each. Being able to justify your order, 'this one first because it is critical, internet-facing and actively exploited', is exactly what a vulnerability-assessment note needs.",
    },
    ethicsNote: "Prioritising and patching vulnerabilities is defensive work on your own, or authorised, systems. Scanning or probing systems you do not own to find their vulnerabilities can itself be an offence (Module 5); keep assessment within your authorised scope.",
  },
};

export default topic4;

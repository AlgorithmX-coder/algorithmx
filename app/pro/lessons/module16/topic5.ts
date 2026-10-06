import type { TopicManifest } from "../../learn/types";
import { IncidentReportLab } from "../../learn/conceptLabs";

/* Module 16 - Topic 5: a tabletop exercise, and the incident report.
 * Case: the widely-adopted practice of tabletop exercises and blameless
 * post-incident reviews (as championed by NCSC guidance and the wider
 * resilience community) as the way organisations prepare for and learn
 * from incidents. Public record: established IR / resilience practice. */
const topic5: TopicManifest = {
  id: "m16t5",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "Tabletops & the incident report",
  role: "Two things turn incident response from theory into capability: rehearsing it through tabletop exercises, and learning from it through a clear, blameless incident report. Both are practical, high-value activities, and the report is your Act 3 portfolio piece.",
  minutes: 16,
  promise: "Learn how organisations rehearse for incidents and learn from them, then write the kind of incident report that actually makes an organisation stronger.",
  brief: "In this lesson, we'll close Act 3 by making response real and lasting. First, tabletop exercises: rehearsing an incident on paper, before a real one, so the plan and the team are tested in calm, not crisis. Second, the incident report and blameless review: how an organisation turns an incident into genuine improvement. We'll see why both are among the highest-value, and most neglected, defensive activities.",

  learn: [
    {
      heading: "Tabletop exercises: rehearse before the crisis",
      body: [
        "A tabletop exercise is a rehearsal of an incident: the team gathers and talks through a realistic scenario ('ransomware has encrypted the finance systems, what do we do?') step by step, testing the plan, the roles, and the decisions, without any real systems being affected. It is cheap, low-risk, and revealing: it surfaces gaps in the plan, confusion over who does what, and missing contacts or tools, all in calm conditions, before a real incident finds them.",
        "The value is enormous and the cost is small, which is why tabletops are so recommended and so under-used. A plan that has never been rehearsed often falls apart on first contact with a real crisis; a team that has practised, even just talked it through, responds far more calmly and effectively. Tabletops are preparation (the first IR stage) made concrete, and they routinely turn a theoretical plan into a real capability.",
      ],
      examples: [
        "Talk through a realistic scenario step by step, testing plan, roles and decisions.",
        "Cheap and low-risk, it surfaces gaps in calm, before a real incident does.",
        "A rehearsed team responds far more calmly and effectively than an unrehearsed one.",
      ],
      analogy: {
        plain: "A fire drill: you walk through the evacuation calmly so that, in a real fire, everyone knows exactly what to do. A tabletop is a fire drill for a cyber incident.",
        realTerm: "tabletop exercise",
      },
    },
    {
      heading: "The incident report: turning pain into improvement",
      body: [
        "After an incident, the incident report captures what happened and what to learn. A good report is clear, factual and structured: what happened, the impact, the timeline (from the last topic), the root cause, and the lessons and actions. Its purpose is not to assign blame but to help the organisation understand and improve, and often to meet obligations (to leadership, regulators, insurers, and sometimes affected people).",
        "Crucially, a good report is honest and readable. Downplaying what happened hides the truth and prevents improvement (and can breach legal duties); burying it in impenetrable detail means no one acts on it. Clarity, including for non-technical readers, is the point: the report should let others understand what occurred, act on the lessons, and stand up to later scrutiny. Writing clear incident reports is a genuinely valuable, portfolio-worthy skill.",
      ],
      examples: [
        "Clear, factual, structured: what happened, impact, timeline, root cause, lessons and actions.",
        "Honest, not downplayed; readable, not buried in jargon.",
        "Its purpose is understanding and improvement, not blame.",
      ],
    },
    {
      heading: "Blameless review: so people tell the truth",
      body: [
        "The review behind the report must be blameless to be useful. If people fear being punished, they hide information, omit mistakes, and the organisation learns nothing, so the same incident happens again. A blameless review focuses on what happened and how the system allowed it, and how to improve, not on who to punish. This mirrors the reporting-culture lesson from Module 7: blame drives the truth underground.",
        "The real payoff of the whole exercise, tabletop, response, report, review, is coming out stronger: concrete improvements that prevent or reduce the next incident. A report that leads to no change wastes the incident's hardest-won lessons; a blameless review that drives real fixes turns a bad day into a lasting upgrade. This is how mature organisations get steadily harder to hurt, and it closes the loop of the IR lifecycle back into better preparation.",
      ],
      examples: [
        "Blameless review: focus on what happened and how to improve, not who to punish.",
        "Blame makes people hide mistakes, so you learn nothing and repeat the incident.",
        "The payoff is concrete improvement: a bad day becomes a lasting upgrade.",
      ],
      analogy: {
        plain: "Aviation investigates crashes to learn and improve safety, not to punish, which is exactly why flying got so safe. Blameless review does the same for security incidents.",
        realTerm: "blameless post-incident review",
      },
    },
  ],

  glossary: [
    { term: "tabletop exercise", definition: "A discussion-based rehearsal of an incident scenario that tests the plan, roles and decisions without affecting real systems." },
    { term: "incident report", definition: "A clear, factual, structured account of an incident: what happened, impact, timeline, root cause, and lessons and actions." },
    { term: "blameless review", definition: "A post-incident review focused on what happened and how to improve rather than who to punish, so people share the truth." },
    { term: "lessons learned", definition: "The concrete improvements an incident produces, feeding back into preparation; the point of the whole exercise." },
  ],

  seeHeading: "How organisations rehearse and learn",

  cases: [
    {
      org: "Tabletops & blameless review",
      year: "established practice",
      headline: "Rehearsing incidents and reviewing them blamelessly is how organisations get stronger",
      whatHappened: "Across the resilience community, and in guidance from bodies like the NCSC, two practices are consistently championed as how organisations turn incident response from theory into capability: tabletop exercises (rehearsing realistic incident scenarios on paper, before a real one, to test the plan and the team) and blameless post-incident reviews feeding clear incident reports (learning honestly from what happened and driving concrete improvements). Organisations that rehearse and learn respond far better and get steadily harder to hurt; those that do neither repeat the same mistakes.",
      theMissedMeasure: "These practices ARE the measures: preparation made concrete (tabletops) and lessons learned made real (blameless review and reports). They are widely recommended precisely because they are so effective and so often neglected, a plan never rehearsed and an incident never truly learned from waste most of their value.",
      theCost: "Here the value is resilience: organisations that rehearse and review honestly turn incidents into lasting improvements and respond to the next one far better, the constructive culmination of everything Act 3 teaches.",
      control: "secure-configuration",
      impact: ["tabletops rehearse incidents before they happen", "blameless reviews and reports turn incidents into improvement", "widely championed, and widely neglected"],
      source: "Public record; established incident-response and resilience practice (incl. NCSC guidance).",
      brandColor: "#0b0c0c",
      news: { headline: "Why tabletop exercises and blameless reviews build real resilience", outlet: "NCSC / resilience practice", date: "established" },
    },
  ],

  lab: {
    title: "Run the review & report",
    intro: "Nothing to install and nothing leaves this page. The incident is over. Make the choices that turn it into genuine improvement.",
    prompts: [
      "Run the review blamelessly: focus on what happened and how to improve.",
      "Write a clear, factual, readable report, not a vague or jargon-filled one.",
      "The payoff is concrete improvement that reduces the next incident.",
    ],
    component: IncidentReportLab,
  },

  check: {
    explain: {
      prompt: "Explain what a tabletop exercise is and why it is valuable, what makes a good incident report, and why the review behind it must be blameless.",
      modelAnswer: "A tabletop exercise is a discussion-based rehearsal of an incident: the team talks through a realistic scenario step by step, testing the plan, the roles and the decisions, without affecting any real systems. It is valuable because it is cheap and low-risk yet revealing, surfacing gaps in the plan, confusion over who does what, and missing contacts or tools, in calm conditions before a real incident finds them; a rehearsed team responds far more calmly and effectively than one meeting the process for the first time in a crisis. A good incident report is clear, factual and structured, covering what happened, the impact, the timeline, the root cause, and the lessons and actions, and it is honest (not downplayed, which hides the truth and can breach legal duties) and readable (not buried in jargon, so people actually act on it). The review behind it must be blameless because if people fear punishment they hide information and omit mistakes, so the organisation learns nothing and repeats the incident; a blameless review focuses on what happened and how to improve, not who to punish, which lets people tell the truth. The payoff of the whole exercise is coming out stronger, concrete improvements that prevent or reduce the next incident, closing the IR lifecycle back into better preparation.",
    },
    quiz: [
      {
        q: "What is a tabletop exercise?",
        options: [
          "A real attack on your systems",
          "A discussion-based rehearsal of an incident scenario that tests the plan and team without affecting real systems",
          "A type of malware",
          "A hardware inventory",
        ],
        answer: 1,
        why: "It is a fire drill for cyber incidents: cheap, low-risk, and it surfaces gaps in calm before a real crisis does.",
      },
      {
        q: "What makes a good incident report?",
        options: [
          "Vague and reassuring, playing down what happened",
          "Clear, factual, structured and honest: what happened, impact, timeline, root cause, and lessons",
          "So technical no one reads it",
          "Focused on who to blame",
        ],
        answer: 1,
        why: "A clear, honest, readable report lets others understand, act on the lessons, and stands up to scrutiny.",
      },
      {
        q: "Why must the post-incident review be blameless?",
        options: [
          "To make everyone feel good",
          "Because blame makes people hide mistakes and information, so the organisation learns nothing and repeats the incident",
          "It should not be; blame is best",
          "Because it is faster",
        ],
        answer: 1,
        why: "Blameless review surfaces the real causes honestly, mirroring the reporting-culture lesson. Blame drives the truth underground.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 16 and all of Act 3: you can respond to incidents, investigate them, and turn them into lasting improvement.",
    takeaways: [
      "Tabletop exercises rehearse incidents cheaply, surfacing gaps in calm before a real crisis finds them.",
      "A good incident report is clear, factual, honest and readable: what happened, impact, timeline, root cause, lessons.",
      "The review must be blameless so people tell the truth, and the payoff is concrete improvement for next time.",
    ],
    project: {
      name: "Write your incident report",
      blurb: "Take a breach from this course (or your timeline from the last topic) and write a one-page incident report: what happened, the impact, the timeline, the root cause, and the lessons and actions. This is your Act 3 portfolio piece, a clear, professional write-up is exactly what employers want to see you can produce.",
    },
    ethicsNote: "Response, review and reporting are conducted within your organisation's authority and obligations (including breach notification, Module 5), honestly and blamelessly. Act 4 now turns to governance, resilience and getting hired, the career on-ramp.",
  },
};

export default topic5;

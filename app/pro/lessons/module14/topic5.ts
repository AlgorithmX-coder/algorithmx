import type { TopicManifest } from "../../learn/types";
import { FindingWriteupLab } from "../../learn/conceptLabs";

/* Module 14 - Topic 5: writing up a finding. The investigation only has
 * value once it is communicated clearly: what happened, the evidence,
 * the impact, and the recommendation. Produces the honeypot/SIEM triage
 * report (this module's portfolio project). Public record: established
 * SOC reporting practice. */
const topic5: TopicManifest = {
  id: "m14t5",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Writing up a finding",
  role: "An investigation that is never clearly written up helps no one. Turning what you found into a clear, factual, actionable finding is the step that makes your work useful to others, and a clear write-up is one of the most valued, and portfolio-worthy, analyst skills.",
  minutes: 15,
  promise: "Learn to turn your investigation into a clear, useful finding others can act on, and complete your honeypot/SIEM triage report.",
  brief: "In this final lesson of the module, we turn investigation into communication. You have read the logs, searched them, and correlated the story; now you write it up. A good finding is clear, factual and actionable: what happened, the evidence, the impact, and the recommendation. We'll see what makes a finding useful (and what to leave out), and you'll complete the honeypot/SIEM triage report that crowns this module.",

  learn: [
    {
      heading: "The investigation only matters if it is communicated",
      body: [
        "You can run a brilliant investigation, but if you cannot communicate what you found clearly, it helps no one. The write-up, the finding, is how your investigation becomes useful: it lets others understand what happened, act on it, and learn from it. This is why clear writing is one of the most valued analyst skills, and often an underrated one: the ability to turn a complex investigation into a clear, actionable account is what makes all the technical work count.",
        "A finding is written for a reader who was not in your head during the investigation, so it must stand on its own: clear enough that someone else can understand what happened and what to do, without having to redo your work. Think of it as the product of the investigation. The logs and searches were your process; the finding is the deliverable, and it is what your colleagues, your manager, and your future self will actually use.",
      ],
      examples: [
        "A brilliant investigation helps no one if it is not communicated clearly.",
        "The finding lets others understand, act, and learn.",
        "Write for a reader who was not there: it must stand on its own.",
      ],
      analogy: {
        plain: "A detective's investigation is only useful once written into a clear case file others can read and act on. The finding is your case file.",
        realTerm: "the finding",
      },
    },
    {
      heading: "What a good finding contains",
      body: [
        "A good finding has a clear, repeatable shape. What happened, stated plainly, in language the reader can follow. The evidence, the specific log entries and the timeline that support your conclusion, so it is grounded in fact, not assertion. The impact, what it means and how serious it is, so the reader knows why it matters and how urgent it is. And the recommendation, what to do about it, so the finding leads to action, not just a description. Each part answers a question the reader will have.",
        "Just as important is what to leave out: guesses stated as fact (state what you know, and clearly flag what is uncertain), and blame aimed at individuals (findings are factual and blameless, as in Module 16, focused on what happened and the fix). A good finding is honest about the limits of the evidence, precise about what is known, and constructive about what to do. That combination, clear, evidence-led, impactful, actionable, and honest, is what makes a finding genuinely useful.",
      ],
      examples: [
        "What happened (plainly), the evidence (logs, timeline), the impact, the recommendation.",
        "Leave out: unsupported guesses stated as fact, and blame aimed at individuals.",
        "Be honest about uncertainty; be precise about what is known.",
      ],
    },
    {
      heading: "Clarity for whoever reads it",
      body: [
        "Finally, write for your audience. A finding might be read by a fellow analyst who needs the technical detail, or by a manager who needs the impact and the recommendation in plain terms, or both (the two-audience idea from the capstone). Match the clarity and the detail to who will read it. Above all, avoid the two failures: so vague it is useless, or so buried in jargon that no one reads it. A finding that is clear, right-sized, and honest is one that actually gets acted on.",
        "This completes the module's arc: logs are the evidence, searching finds it, correlation builds the story, and the finding communicates it so it can be used. You have now done the full cycle of a SIEM investigation, which is, in miniature, the core of the SOC analyst's job. Writing it up well is the final, vital skill, and the honeypot/SIEM triage report you produce from it is a genuine, demonstrable portfolio piece.",
      ],
      examples: [
        "Match detail to the reader: technical depth for an analyst, impact and action for a manager.",
        "Avoid the two failures: too vague to use, or too jargon-filled to read.",
        "Clear, right-sized, honest findings are the ones that get acted on.",
      ],
      analogy: {
        plain: "A good doctor writes clinical notes for colleagues and explains plainly to the patient. A finding is written the same way: clear and fit for whoever will read it.",
        realTerm: "writing for your reader",
      },
    },
  ],

  glossary: [
    { term: "finding", definition: "The written output of an investigation: what happened, the evidence, the impact, and the recommendation, clear and actionable." },
    { term: "evidence-led", definition: "Grounding a finding in specific log entries and a timeline, not assertion, and flagging what is uncertain rather than guessing." },
    { term: "actionable", definition: "A finding that ends with a clear recommendation of what to do, so it leads to action, not just description." },
    { term: "writing for your audience", definition: "Matching a finding's detail and clarity to who will read it (an analyst, a manager, or both)." },
  ],

  seeHeading: "Why the write-up is the deliverable",

  cases: [
    {
      org: "The finding write-up",
      year: "current",
      headline: "An investigation only becomes useful once it is written up clearly and actionably",
      whatHappened: "In real security operations, the written finding is the deliverable that makes an investigation count. A clear, factual, actionable finding, stating what happened, the supporting evidence and timeline, the impact, and the recommendation, lets others understand, act on, and learn from the work, while a brilliant investigation that is never clearly communicated helps no one. The best analysts are valued not only for finding things but for writing them up well: clear enough to stand on its own, evidence-led rather than assertion, honest about uncertainty, blameless, and matched to its reader. The write-up is consistently one of the most important, and portfolio-worthy, skills a SOC analyst has.",
      theMissedMeasure: "Clear, structured, honest finding-writing. An investigation's value is realised only when it is communicated so others can act; a vague, jargon-filled or unwritten finding wastes the work, which is why clear reporting is emphasised so heavily.",
      theCost: "Here the value is impact: a clear finding turns investigative effort into understanding and action across the team, and the ability to produce one is exactly the demonstrable skill employers, and portfolios, prize.",
      control: "secure-configuration",
      impact: ["the written finding is the deliverable", "clear, evidence-led, actionable, blameless, audience-matched", "a top, portfolio-worthy analyst skill"],
      source: "Public record; established SOC reporting practice.",
      brandColor: "#0b6e4f",
      news: { headline: "Why the write-up is the real deliverable of an investigation", outlet: "SOC reporting practice (current)", date: "current" },
    },
  ],

  lab: {
    title: "What belongs in the finding?",
    intro: "Nothing to install and nothing leaves this page. For each element, decide: does it belong in a good finding, or should it be left out?",
    prompts: [
      "In: what happened, the evidence, the impact, the recommendation.",
      "Out: unsupported guesses stated as fact, and blame aimed at individuals.",
      "Clear, evidence-led, actionable and honest is the goal.",
    ],
    component: FindingWriteupLab,
  },

  check: {
    explain: {
      prompt: "Explain why an investigation must be written up, what a good finding contains, and what to leave out.",
      modelAnswer: "An investigation must be written up because you can run a brilliant investigation, but if you cannot communicate what you found clearly, it helps no one: the written finding is how the work becomes useful, letting others understand what happened, act on it, and learn from it, which is why clear writing is one of the most valued (and underrated) analyst skills. A finding is written for a reader who was not in your head, so it must stand on its own, and a good one has a clear, repeatable shape: what happened, stated plainly in language the reader can follow; the evidence, the specific log entries and timeline that support your conclusion, so it is grounded in fact; the impact, what it means and how serious it is, so the reader knows why it matters and how urgent it is; and the recommendation, what to do about it, so the finding leads to action rather than just description. What to leave out is just as important: guesses stated as fact (instead, state what you know and clearly flag what is uncertain), and blame aimed at individuals (findings are factual and blameless, focused on what happened and the fix). Finally, write for your audience, matching detail and clarity to whoever reads it (an analyst needing technical depth, a manager needing impact and recommendation, or both), and avoid being so vague it is useless or so jargon-filled no one reads it. Clear, evidence-led, impactful, actionable, honest and right-sized is what makes a finding genuinely useful and acted upon.",
    },
    quiz: [
      {
        q: "Why must an investigation be written up?",
        options: [
          "It does not need to be",
          "Because a brilliant investigation that is not clearly communicated helps no one; the finding is how it becomes useful",
          "To make it longer",
          "Only managers need findings",
        ],
        answer: 1,
        why: "The write-up is the deliverable: it lets others understand, act and learn. Clear writing is a top analyst skill.",
      },
      {
        q: "What does a good finding contain?",
        options: [
          "Just a list of raw logs",
          "What happened, the evidence (logs, timeline), the impact, and the recommendation",
          "Only the analyst's opinion",
          "Blame for whoever caused it",
        ],
        answer: 1,
        why: "Clear statement, supporting evidence, impact, and an actionable recommendation, so it leads to action, not just description.",
      },
      {
        q: "What should you leave OUT of a finding?",
        options: [
          "The evidence",
          "Unsupported guesses stated as fact, and blame aimed at individuals",
          "The recommendation",
          "The impact",
        ],
        answer: 1,
        why: "Be honest about uncertainty and keep it blameless (Module 16); state what you know, and focus on what happened and the fix.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 14: you can read logs, investigate in a SIEM, correlate the story, and write it up, the full SOC analyst cycle.",
    takeaways: [
      "An investigation only matters once written up clearly; the finding is the deliverable.",
      "A good finding has what happened, the evidence, the impact, and the recommendation, clear and actionable.",
      "Leave out unsupported guesses and blame; be honest about uncertainty and match the detail to your reader.",
    ],
    project: {
      name: "Write your honeypot/SIEM triage report",
      blurb: "Complete this module's portfolio piece: a short triage report on the honeypot capture you investigated. State what happened, cite the evidence (the login attempts, the pattern you saw), the impact, and your recommendation (the basic defence that would have stopped it). This clear, evidence-led report is a genuine demonstration that you can both investigate and communicate, exactly what the SOC job needs.",
    },
    ethicsNote: "Findings handle information about real incidents and often personal data, so they are written factually, honestly, blamelessly, and shared only with those authorised to see them, within the Module 5 principles.",
  },
};

export default topic5;

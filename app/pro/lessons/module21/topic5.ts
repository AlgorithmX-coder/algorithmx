import type { TopicManifest } from "../../learn/types";
import { CapstoneLab } from "../../learn/conceptLabs";

/* Module 21 - Topic 5: the capstone. One full investigation, written up
 * two ways (a technical write-up and an executive summary), demonstrating
 * both technical skill and the ability to communicate to non-technical
 * leaders. The culminating portfolio piece and the end of the course. */
const topic5: TopicManifest = {
  id: "m21t5",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "The capstone",
  role: "The capstone pulls everything together into one piece of work that proves you can both investigate and communicate, the two halves of being valuable in security. It is the culminating portfolio piece, and the fitting end of your journey from zero to job-ready.",
  minutes: 18,
  promise: "Bring the whole course together into one capstone piece that proves you can investigate and communicate, and complete your journey to job-ready.",
  brief: "This is the final lesson of the course. The capstone is a single, complete investigation, written up two ways: a detailed technical write-up for a technical reader, and a short executive summary for non-technical leaders. It demonstrates the two things that make a security professional valuable, real investigative skill and the ability to communicate it to any audience, and it is the crowning piece of your portfolio.",

  learn: [
    {
      heading: "One investigation, two audiences",
      body: [
        "The capstone is one complete piece of security work, an investigation of an incident or a security assessment, carried through from start to finish, and then communicated to two very different audiences. The first is a detailed technical write-up: the full story, evidence, timeline, technical findings, indicators, and recommendations, for a technical reader who needs the depth. The second is a short executive summary: a plain-English account of what happened, its business impact, and the key recommendation, for a leader who needs to understand and act, not wade through detail.",
        "This two-audiences structure is deliberate and important, because it exercises the two halves of being valuable in security: doing the technical work well, and communicating it to whoever needs it. A finding only matters if the right people can understand and act on it, which means a technical responder and a non-technical executive each need the same truth, told the way they can use it. Mastering this is a genuine professional skill, and demonstrating it is powerful.",
      ],
      examples: [
        "Technical write-up: full depth, evidence, timeline, findings, IOCs, recommendations.",
        "Executive summary: plain-English what-happened, business impact, key recommendation.",
        "Same truth, told the way each audience can use it.",
      ],
      analogy: {
        plain: "A doctor writes detailed clinical notes for colleagues and explains the diagnosis simply to the patient. Same facts, two tellings, each fit for its reader. The capstone does exactly this.",
        realTerm: "writing for two audiences",
      },
    },
    {
      heading: "What goes where",
      body: [
        "Knowing what belongs in each version is part of the skill. The technical write-up holds the precise detail: the exact steps and evidence, the full timeline, the specific indicators of compromise and affected systems, the technical recommendations. The executive summary holds the essentials a leader needs: a one-paragraph plain summary of what happened, the business impact and risk, and the key recommendation in language they can act on. And some things belong in both, framed appropriately: a clear, honest statement of what the incident was, why it matters, and the impact and risk, which both audiences need, told at the right level for each.",
        "The common mistakes are putting impenetrable technical detail in front of a leader (who will not read it or act), or giving a technical responder only a vague summary (which they cannot act on). Matching content to audience, depth for the technical reader, clarity and impact for the leader, while keeping both honest and accurate, is the craft. Get this right and you prove you can serve the whole organisation, not just the technical corner of it.",
      ],
      examples: [
        "Technical: exact steps, evidence, full timeline, specific IOCs, technical fixes.",
        "Executive: plain summary, business impact and risk, the key actionable recommendation.",
        "Both: a clear, honest account of what it was, why it matters, and the impact.",
      ],
    },
    {
      heading: "Your journey, complete",
      body: [
        "The capstone is the fitting end of your journey, because it draws on everything: the foundations and the law (Acts 1), how attacks happen (Act 2), how to defend, detect and respond (Act 3), and how to communicate and present yourself (Act 4). It asks you to do real security work and tell its story to anyone, which is, in miniature, exactly what a security professional does every day. Completing it is proof, to an employer and to yourself, that you have made the journey this course promised: from a curious beginner with no technical background to someone genuinely job-ready.",
        "And that is the real achievement. You started knowing little; you now understand the field, can do real security work, hold a portfolio of genuine artefacts, and know how to get hired. The capstone crowns that portfolio and completes the transformation. Whatever role you aim for, you now have the understanding, the demonstrable skill, the honest self-knowledge, and the discipline to pursue it. The course is done; your journey in cyber security is just beginning, and you are ready for it.",
      ],
      examples: [
        "The capstone draws on all four acts: foundations, attacks, defence, and getting hired.",
        "It mirrors the real job: do security work, and tell its story to anyone.",
        "Completing it proves the journey: from curious beginner to genuinely job-ready.",
      ],
      analogy: {
        plain: "A capstone is the final stone that completes an arch and locks the whole structure together. Yours completes the course and locks your new capability in place.",
        realTerm: "the capstone",
      },
    },
  ],

  glossary: [
    { term: "capstone", definition: "A single, complete piece of security work (an investigation or assessment) written up for two audiences; the culminating portfolio piece." },
    { term: "technical write-up", definition: "The detailed account for a technical reader: evidence, timeline, specific findings, IOCs and technical recommendations." },
    { term: "executive summary", definition: "A short, plain-English account for non-technical leaders: what happened, the business impact, and the key actionable recommendation." },
    { term: "writing for your audience", definition: "Telling the same honest truth at the right level of detail for each reader, the core professional communication skill." },
  ],

  seeHeading: "The two halves of being valuable",

  cases: [
    {
      org: "Investigate, and communicate",
      year: "current",
      headline: "The professionals who stand out can both do the technical work and explain it to anyone",
      whatHappened: "A consistent truth across security roles is that the most valuable professionals can do both halves of the job: the technical work (investigating, assessing, responding) and communicating it clearly to any audience, from technical colleagues who need depth to non-technical leaders who need to understand and act. A brilliant finding that no decision-maker can understand, or a clear summary with no real technical substance behind it, each falls short. The capstone, one investigation written up as both a technical write-up and an executive summary, deliberately demonstrates both halves, which is exactly why it is such a powerful, credible culminating portfolio piece.",
      theMissedMeasure: "Demonstrating both investigative skill and clear communication to different audiences. The capstone proves a candidate can serve the whole organisation, technical and non-technical, which is precisely what makes a security professional valuable and hireable.",
      theCost: "Here the value is completeness: the capstone proves you can both do the work and tell its story to anyone, the full package that stands out, and the fitting culmination of a journey from beginner to job-ready.",
      control: "access-control",
      impact: ["the valuable pro both investigates and communicates", "the capstone demonstrates both halves", "it serves technical and non-technical audiences alike"],
      source: "Public record; the consistent value of communication alongside technical skill in security.",
      brandColor: "#8b6dff",
      news: { headline: "Why the best security professionals can both investigate and explain", outlet: "Industry observations (current)", date: "current" },
    },
  ],

  lab: {
    title: "Technical, executive, or both?",
    intro: "Nothing to install and nothing leaves this page. For each element of your capstone, decide where it belongs: the technical write-up, the executive summary, or both.",
    prompts: [
      "Technical: precise detail, evidence, full timeline, specific IOCs.",
      "Executive: plain summary, business impact, the key actionable recommendation.",
      "Both: a clear, honest account of what it was, why it matters, and the impact.",
    ],
    component: CapstoneLab,
  },

  check: {
    explain: {
      prompt: "Explain what the capstone is, why it is written for two audiences, and why it is the fitting culmination of this whole course.",
      modelAnswer: "The capstone is one complete piece of security work, an investigation of an incident or a security assessment carried through from start to finish, written up two ways: a detailed technical write-up for a technical reader (the full story, evidence, timeline, technical findings, indicators of compromise, affected systems and technical recommendations) and a short executive summary for non-technical leaders (a plain-English account of what happened, its business impact and risk, and the key recommendation in language they can act on), with some things, a clear, honest statement of what the incident was, why it matters, and the impact, belonging in both, told at the right level for each. It is written for two audiences because this exercises the two halves of being valuable in security: doing the technical work well, and communicating it to whoever needs it, since a finding only matters if the right people can understand and act on it, and a technical responder and a non-technical executive each need the same truth told the way they can use it, avoiding the mistakes of burying a leader in detail or giving a responder only a vague summary. It is the fitting culmination of the course because it draws on everything, the foundations and law of Act 1, how attacks happen in Act 2, how to defend, detect and respond in Act 3, and how to communicate and present yourself in Act 4, and it mirrors, in miniature, exactly what a security professional does every day: do real security work and tell its story to anyone. Completing it proves, to an employer and to yourself, that you have made the journey from a curious beginner with no technical background to someone genuinely job-ready.",
    },
    quiz: [
      {
        q: "What is the capstone?",
        options: [
          "A final written exam that covers every module from across the course.",
          "A short slideshow summarising the parts of the course you most enjoyed.",
          "One complete investigation written up two ways: a technical write-up and an executive summary.",
          "A single deep technical report written only for security specialists to read.",
          "A reflective essay on what you learned and how you have grown.",
        ],
        answer: 2,
        reasons: [
          "The capstone is real security work, not a memory test. It asks you to investigate and communicate, not to recall module content.",
          "A slideshow of highlights shows nothing you can do. The capstone is a genuine piece of investigative work, written up properly.",
          "Right. It is one real piece of security work communicated to two audiences, which makes it the culminating portfolio piece.",
          "That is only half of it. The capstone deliberately adds an executive summary so you prove you can reach non-technical readers too.",
          "Reflection is not the task. The capstone is actual security work written for two audiences, not an account of how you grew.",
        ],
      },
      {
        q: "Why write the capstone for two audiences?",
        options: [
          "Because a longer, more detailed submission almost always impresses an employer more.",
          "Because technical readers and senior leaders both want exactly the same deep detail.",
          "Because producing two separate documents makes the capstone look more substantial.",
          "It exercises both halves of being valuable: doing the technical work, and communicating it clearly.",
          "Because the executive summary lets you leave out the real findings altogether.",
        ],
        answer: 3,
        reasons: [
          "Length does not impress; fitness for the reader does. The point is matching each version to its audience, not adding bulk.",
          "They do not: a leader needs plain impact and a recommendation, while a technical reader needs the depth. Same truth, told differently.",
          "It is not about looking bigger. Each version exists because a different reader genuinely needs the information told a different way.",
          "Right. A finding only matters if the right people can understand and act on it, so serving both audiences proves you serve the whole organisation.",
          "The executive summary still rests on the real findings and states their impact plainly; it does not drop them. Both versions stay honest and accurate.",
        ],
      },
      {
        q: "Why is the capstone a fitting end to the course?",
        options: [
          "It draws on all four acts and mirrors the job: do security work and explain it.",
          "It focuses narrowly on the content taught in the course's final module only.",
          "It tests your memory of the course rather than any real practical skill.",
          "It replaces the need for a portfolio or any other piece of work.",
          "It is simply the longest and hardest assignment left in the whole course.",
        ],
        answer: 0,
        reasons: [
          "Right. It proves the journey from curious beginner to job-ready, combining investigation and communication, exactly what the job needs every day.",
          "It is the opposite: the capstone pulls on all four acts, from foundations and law to defence and communication, not just the final module.",
          "It is hands-on, not a memory test. You do real security work and write it up, which is practical skill, not recall.",
          "It crowns your portfolio rather than replacing it. The capstone is the culminating piece that sits alongside the work you already built.",
          "Size is not why it fits. It belongs at the end because it mirrors the whole job: doing the work and communicating it to anyone.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Cyber Pro: you can investigate and communicate, you have a portfolio, and you are job-ready.",
    takeaways: [
      "The capstone is one investigation written two ways: a technical write-up and an executive summary.",
      "It proves both halves of being valuable: doing the technical work, and communicating it to any audience.",
      "It draws on the whole course and crowns your portfolio, completing your journey from beginner to job-ready.",
    ],
    project: {
      name: "Build your capstone",
      blurb: "Take one investigation, a breach from this course analysed in depth, or your own honeypot/SIEM triage, and write it up twice: a detailed technical write-up, and a one-page executive summary for a non-technical leader. This is the crowning piece of your portfolio, and the final proof that you can both do security work and communicate it. Finish it, and you are ready to apply.",
    },
    ethicsNote: "Your capstone, like all your work, is honest and based on real analysis, and any hands-on element stays within the authorisation line from Module 5. You finish the course as you should enter the field: skilled, honest, and disciplined. Congratulations, and good luck.",
  },
};

export default topic5;

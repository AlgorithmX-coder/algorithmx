import type { TopicManifest } from "../../learn/types";
import { DayToDayLab } from "../../learn/conceptLabs";

/* Module 20 - Topic 2: what each job actually does day to day. A
 * realistic, de-glamourised look at the daily work of the main roles,
 * to help the learner judge which would genuinely suit them. No invented
 * statistics. */
const topic2: TopicManifest = {
  id: "m20t2",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "What each job actually does",
  role: "Choosing a direction is much easier once you know what each role's day really looks like, not the Hollywood version. This honest picture helps you target a role that genuinely suits your temperament and strengths, which matters as much as the job title.",
  minutes: 14,
  promise: "See what the main cyber roles actually do day to day, so you can pick one that genuinely suits you, not just one that sounds exciting.",
  brief: "In this lesson, we'll de-glamourise the main roles and look at what they actually involve day to day: the SOC analyst's steady triage, the GRC professional's assessment and documentation, the IT security role's hands-on hardening, and the penetration tester's scoped, methodical testing. Seeing the real daily work, not the dramatic image, is what lets you choose a role that fits who you are.",

  learn: [
    {
      heading: "The analyst and the GRC professional",
      body: [
        "The SOC analyst's day, as you saw in Module 13, is steady and methodical: working through a queue of alerts, gathering context, deciding what is real, escalating what matters, and documenting as you go, punctuated by occasional real incidents. It suits people who are patient, detail-oriented, and calm under pressure, and who find satisfaction in watchfulness and investigation rather than constant drama.",
        "The GRC professional's day (Module 17) is quite different: assessing risks, writing and reviewing policies, checking suppliers, preparing for and running audits, and translating technical risk into business language. It is advisory and organisational rather than hands-on-technical, and it suits people who are strong communicators, methodical, and comfortable with process, people and documentation. Notably, it draws heavily on exactly the strengths many career-changers already have.",
      ],
      examples: [
        "SOC analyst: steady triage, investigation and documentation; calm watchfulness.",
        "GRC: risk assessment, policy, audits, translating risk to business language.",
        "GRC is advisory and organisational, suiting strong communicators.",
      ],
      analogy: {
        plain: "The SOC analyst is like a vigilant air-traffic controller; the GRC professional is more like a safety manager, planning, checking and advising rather than watching the radar.",
        realTerm: "role temperaments",
      },
    },
    {
      heading: "The IT security role and the pen tester",
      body: [
        "The security-focused IT role is hands-on and practical: hardening systems, applying patches, configuring firewalls and access, responding to day-to-day security needs. It suits people who like building, fixing and maintaining real systems, and it is a natural fit if you have or enjoy IT work. Much of Act 3's hardening and operational content is this role's daily bread.",
        "The penetration tester's day, when they reach it, is methodical and rule-bound, far from the frantic image. It is careful, scoped, authorised testing (Module 5), followed by a great deal of writing: clear reports explaining what was found and how to fix it. It suits deeply curious, persistent, technical people who also communicate well, because a finding nobody can understand or act on is worthless. Even this most 'glamorous' role is, in reality, disciplined, documented work.",
      ],
      examples: [
        "IT security: hands-on hardening, patching, configuring, fixing; building and maintaining.",
        "Pen tester: careful scoped testing, then lots of clear report-writing.",
        "Even the glamorous role is disciplined, documented work, not frantic hacking.",
      ],
    },
    {
      heading: "Choose the fit, not just the title",
      body: [
        "The practical point of all this is to choose a role that fits who you are, not just one with an exciting title. Someone who loves methodical investigation will thrive as a SOC analyst and be miserable chasing policy deadlines; someone who is a brilliant communicator and organiser may flourish in GRC and find staring at alert queues draining. The best role for you is the one whose actual daily work plays to your strengths and temperament.",
        "This honest self-matching is a real advantage in getting hired and in staying happy once you are. It also helps you talk convincingly in interviews: showing you understand what the role really involves, and why it suits you, is far more persuasive than chasing a title. As you finish the course and look at jobs, weigh the real day, not the image, and aim where you will genuinely do well.",
      ],
      examples: [
        "Match the role to your strengths and temperament, not just the title.",
        "The right role plays to how you actually like to work.",
        "Understanding the real day makes you convincing in interviews.",
      ],
      analogy: {
        plain: "Choosing a job by its title alone is like choosing a holiday by the brochure photo. What matters is whether the actual daily experience suits you.",
        realTerm: "role fit",
      },
    },
  ],

  glossary: [
    { term: "role fit", definition: "Choosing a role whose actual daily work suits your strengths and temperament, not just one with an appealing title." },
    { term: "advisory role", definition: "A role (like GRC) focused on assessing, advising and documenting rather than hands-on technical operation." },
    { term: "hands-on role", definition: "A role (like IT security) focused on building, configuring, fixing and maintaining real systems." },
    { term: "report-writing", definition: "A large, often-underestimated part of technical roles (including pen testing): clearly communicating findings so others can act." },
  ],

  seeHeading: "The real daily work behind the titles",

  cases: [
    {
      org: "Day-to-day reality of the roles",
      year: "current",
      headline: "The real daily work is more methodical, and more varied, than the glamorous image",
      whatHappened: "A consistent theme for newcomers is the gap between the exciting image of cyber work and its actual day-to-day reality: the SOC analyst's steady, methodical triage; the GRC professional's assessment, documentation and audits; the IT security role's hands-on hardening; and even the penetration tester's careful, scoped testing followed by extensive report-writing. Understanding this real daily work, rather than the Hollywood version, helps people choose a role that genuinely suits their strengths and temperament, which strongly influences both whether they get hired and whether they thrive once they do.",
      theMissedMeasure: "Honest role-matching: choosing based on the real daily work and your genuine strengths, not the title or image. It makes for better applications, better interviews, and a happier, more sustainable career.",
      theCost: "Here the value is fit: understanding what each role really involves helps a beginner aim at the one that suits them, avoiding the common disappointment of landing a dreamed-of title whose daily reality does not fit at all.",
      control: "access-control",
      impact: ["the real day is methodical and varied, not the glamorous image", "even pen testing is careful, documented work", "role fit shapes both hiring and happiness"],
      source: "Public record; consistent accounts of day-to-day work in cyber roles.",
      brandColor: "#2d7d9a",
      news: { headline: "What cyber security jobs really involve, day to day", outlet: "Industry accounts (current)", date: "current" },
    },
  ],

  lab: {
    title: "Whose day is this?",
    intro: "Nothing to install and nothing leaves this page. Tap each day-to-day activity, then tap whose job it most is.",
    prompts: [
      "SOC (triage alerts), GRC (risk/audit), IT security (harden/patch), pen tester (scoped testing + reports).",
      "Picture the real daily work, not the dramatic image.",
      "This helps you judge which role would actually suit you.",
    ],
    component: DayToDayLab,
  },

  check: {
    explain: {
      prompt: "Contrast the real day-to-day work of a SOC analyst, a GRC professional and a penetration tester, and explain why choosing a role by fit rather than title matters.",
      modelAnswer: "A SOC analyst's day is steady and methodical: working through a queue of alerts, gathering context, deciding what is real, escalating what matters, and documenting as they go, punctuated by occasional real incidents, suiting patient, detail-oriented people who are calm under pressure and enjoy watchfulness and investigation. A GRC professional's day is quite different and more advisory: assessing risks, writing and reviewing policies, checking suppliers, preparing for and running audits, and translating technical risk into business language, suiting strong communicators who are methodical and comfortable with process, people and documentation. A penetration tester's day, far from the frantic image, is careful, scoped, authorised testing followed by a great deal of clear report-writing, because a finding nobody can understand or act on is worthless; even this most 'glamorous' role is disciplined, documented work. Choosing a role by fit rather than title matters because the best role for you is the one whose actual daily work plays to your strengths and temperament: someone who loves methodical investigation will thrive as a SOC analyst but be miserable chasing policy deadlines, while a brilliant communicator may flourish in GRC and find alert queues draining. Honest self-matching makes for better applications and interviews (you can show you understand what the role really involves and why it suits you) and a happier, more sustainable career.",
    },
    quiz: [
      {
        q: "What does a SOC analyst's day mostly involve?",
        options: [
          "Constant dramatic hacking battles",
          "Steady, methodical triage, investigation and documentation, with occasional real incidents",
          "Writing marketing copy",
          "Only attending meetings",
        ],
        answer: 1,
        why: "The real day is calm watchfulness and judgement, suiting patient, detail-oriented people, not non-stop drama.",
      },
      {
        q: "What surprises many people about the penetration tester's day?",
        options: [
          "It is frantic and chaotic",
          "It is careful, scoped testing followed by a lot of clear report-writing",
          "It involves no computers",
          "It is illegal",
        ],
        answer: 1,
        why: "Even the most glamorous role is disciplined, documented work; a finding nobody can act on is worthless.",
      },
      {
        q: "Why choose a role by fit rather than title?",
        options: [
          "Titles are all that matter",
          "The right role plays to your strengths and temperament, which shapes both getting hired and thriving",
          "Fit is irrelevant to happiness",
          "To avoid ever being promoted",
        ],
        answer: 1,
        why: "Matching the real daily work to who you are makes for better applications and interviews, and a sustainable career.",
      },
    ],
  },

  wrap: {
    headline: "You now know what the main roles really involve day to day, so you can choose one that genuinely fits you.",
    takeaways: [
      "The SOC analyst's day is methodical triage; GRC is advisory assessment and audit; IT security is hands-on hardening.",
      "Even penetration testing is careful, scoped work plus extensive report-writing, not frantic hacking.",
      "Choose a role by fit to your strengths and temperament, not just the title, it shapes hiring and happiness.",
    ],
    project: {
      name: "Match yourself to a day",
      blurb: "Re-read the daily reality of each role and note which one's actual day most appeals to you, and why, honestly. Then note one strength of yours it would use. Matching your genuine temperament to a role's real day is how you choose a direction you will both get hired into and enjoy.",
    },
    ethicsNote: "All these roles are lawful, constructive work within the authorisation principles from Module 5. Choosing honestly, by genuine fit, is part of building a sustainable, ethical career.",
  },
};

export default topic2;

import type { TopicManifest } from "../../learn/types";
import { CyberRoleLab } from "../../learn/conceptLabs";

/* Module 20 - Topic 1: the real entry roles. Framed around the honest
 * reality of the cyber job landscape: several distinct entry paths
 * (SOC, GRC, IT security), with pen-testing usually a later-career
 * destination, not a first job. No invented statistics. */
const topic1: TopicManifest = {
  id: "m20t1",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "The real entry roles",
  role: "Cyber security is not one job but many, and knowing the realistic entry roles, and that the glamorous ones are usually later-career, is what lets you aim sensibly and get your foot in the door.",
  minutes: 15,
  promise: "Discover the realistic ways into cyber security, and why the job everyone pictures is usually not the first one you get.",
  brief: "In this lesson, we'll map the realistic entry points into cyber security. Many beginners picture 'hacking' (penetration testing), but that is usually a later-career role. The common, accessible first jobs are elsewhere: the SOC analyst, GRC and risk roles, and security-focused IT roles. We'll see what each is and why it is accessible, so you can aim where the real doors are, rather than only where the spotlight is.",

  learn: [
    {
      heading: "Cyber security is many jobs, not one",
      body: [
        "The single most useful thing to realise about getting hired is that 'cyber security' is not one job, it is a whole field of different roles, needing different skills and suiting different people. Defenders and attackers, technical and non-technical, hands-on and advisory, there is far more variety than the popular image of a hacker in a hoodie suggests. This matters because it means there are many doors in, and the right one for you may not be the one you first pictured.",
        "This whole course has, deliberately, introduced you to these roles: the SOC analyst (Module 13), the GRC professional (Module 17), the detection and incident-response specialists (Modules 15, 16), the penetration tester (bound by the rules of Module 5). Now we look at them specifically as career destinations, and, crucially, which are realistic first jobs.",
      ],
      examples: [
        "Cyber security is a field of many roles, not a single job.",
        "Defender and attacker, technical and non-technical, hands-on and advisory.",
        "Many doors in: the right one may not be the one you first pictured.",
      ],
      analogy: {
        plain: "'Medicine' is not one job, it is surgeons, nurses, pharmacists, administrators, researchers. Cyber security is just as varied, with just as many ways in.",
        realTerm: "the cyber field",
      },
    },
    {
      heading: "The realistic first jobs",
      body: [
        "A few roles are the common, realistic entry points. The SOC analyst (monitoring and triaging alerts) is often the most accessible technical first job, and the one this course has prepared you for most directly. GRC and risk roles (managing risk, compliance and audits) are a major entry lane, especially friendly to non-technical backgrounds. And security-focused IT roles (hardening, patching and administering systems securely) are a natural route, particularly if you have any IT experience.",
        "What these share is that they are entry-accessible: they need solid fundamentals (which you now have) and the right attitude, rather than years of prior experience or elite skills. They are also where the volume of jobs is. Aiming for one of these realistic first roles, and being able to show you understand it (through your portfolio), is a far better strategy than holding out only for the rare, glamorous positions.",
      ],
      examples: [
        "SOC analyst: often the most accessible technical first job.",
        "GRC / risk: a major entry lane, friendly to non-technical backgrounds.",
        "Security-focused IT: a natural route, especially with some IT experience.",
      ],
    },
    {
      heading: "Penetration testing is usually a destination, not a start",
      body: [
        "The role most beginners dream of, penetration testing (authorised, ethical hacking), is usually a later-career destination, not a first job. It typically requires deep technical skill and broad experience, often built up first in roles like the ones above. This is not discouraging; it is clarifying. Aiming straight for pen testing as a complete beginner is like aiming to be a surgeon without first being a doctor.",
        "The realistic path is to get in through an accessible role, build skills and experience, and then specialise toward wherever you want to go, including pen testing if that is your goal. Many successful testers started as SOC analysts or in IT. So picture the glamorous roles as destinations you can reach, while aiming your first applications at the doors that are actually open to a capable beginner. That strategic honesty is exactly what gets people hired, and it is the spirit of this whole act.",
      ],
      examples: [
        "Pen testing usually needs deep skill and experience: a destination, not a start.",
        "Many testers started as SOC analysts or in IT, then specialised.",
        "Aim first applications at open doors; reach the glamorous roles over time.",
      ],
      analogy: {
        plain: "You become an airline captain by first being a first officer and logging hours, not by walking in off the street. Pen testing is the captain's seat: reachable, but not the first one.",
        realTerm: "career progression",
      },
    },
  ],

  glossary: [
    { term: "SOC analyst", definition: "Monitors and triages security alerts; often the most accessible technical entry role (Module 13)." },
    { term: "GRC / risk analyst", definition: "Manages risk, compliance and audits; a major entry lane, especially open to non-technical backgrounds (Module 17)." },
    { term: "security-focused IT role", definition: "Hardening, patching and administering systems securely; a natural route in, especially with IT experience." },
    { term: "penetration tester", definition: "Authorised, ethical attacker who finds flaws; usually a later-career destination needing deep skill and experience, not a first job." },
  ],

  seeHeading: "Where the real doors are",

  cases: [
    {
      org: "The cyber entry landscape",
      year: "current",
      headline: "The realistic ways in are SOC, GRC and IT roles, not the glamorous destinations",
      whatHappened: "The reality of entering cyber security, as consistently reflected in job markets and hiring, is that the accessible first roles are the SOC analyst, GRC and risk positions, and security-focused IT roles, while the glamorous, high-skill roles like penetration testing are usually reached later, after building experience. Beginners who aim only at the dream role often struggle, while those who target a realistic entry point, and can demonstrate solid fundamentals and the right attitude, are far more likely to get hired and then progress. Knowing where the real doors are is a significant advantage.",
      theMissedMeasure: "Aiming realistically: targeting an accessible first role you can actually get and demonstrate readiness for, rather than only the rare dream job. Combined with a portfolio (Module 21), this strategic honesty is what gets a capable beginner through the door.",
      theCost: "Here the value is direction: understanding the realistic entry roles saves beginners from the frustration of aiming only at closed doors, and points their effort where it can actually land a first job and launch a career.",
      control: "access-control",
      impact: ["realistic first roles: SOC, GRC, security-focused IT", "pen testing is usually a later destination", "aiming realistically is a major advantage"],
      source: "Public record; consistent cyber hiring and job-market reality.",
      brandColor: "#5b8def",
      news: { headline: "The realistic ways into cyber security (and the roles that come later)", outlet: "Cyber hiring reality (current)", date: "current" },
    },
  ],

  lab: {
    title: "Match the entry role",
    intro: "Nothing to install and nothing leaves this page. Tap each description, then tap the role it fits.",
    prompts: [
      "SOC analyst (monitor/triage), GRC (risk/compliance), IT security (harden/patch), pen tester (authorised attack).",
      "Pen testing is usually a later-career destination, not a first job.",
      "Knowing where you would start is half the battle.",
    ],
    component: CyberRoleLab,
  },

  check: {
    explain: {
      prompt: "Explain why 'cyber security' is many jobs, which roles are the realistic entry points, and why penetration testing is usually a destination rather than a first job.",
      modelAnswer: "'Cyber security' is many jobs, not one: it is a whole field of different roles needing different skills and suiting different people, defenders and attackers, technical and non-technical, hands-on and advisory, far more varied than the popular hacker image, which means there are many doors in and the right one may not be the one you first pictured. The realistic entry points are the SOC analyst (monitoring and triaging alerts, often the most accessible technical first job and the one this course prepared you for most directly), GRC and risk roles (managing risk, compliance and audits, a major entry lane especially friendly to non-technical backgrounds), and security-focused IT roles (hardening, patching and administering systems securely, a natural route particularly with some IT experience); these are entry-accessible because they need solid fundamentals and the right attitude rather than years of experience, and they are where the volume of jobs is. Penetration testing is usually a destination rather than a first job because it typically requires deep technical skill and broad experience, often built first in roles like those above, so the realistic path is to get in through an accessible role, build skills and experience, and then specialise toward pen testing if that is your goal, as many successful testers did, aiming your first applications at the doors that are actually open to a capable beginner.",
    },
    quiz: [
      {
        q: "Why is it useful to realise cyber security is 'many jobs, not one'?",
        options: [
          "It is not useful",
          "Because there are many doors in, and the right entry role for you may not be the one you first pictured",
          "Because all the jobs are identical",
          "Because only hacking matters",
        ],
        answer: 1,
        why: "The variety means multiple accessible entry points; aiming at the right one for you is a big advantage.",
      },
      {
        q: "Which are the realistic entry roles into cyber security?",
        options: [
          "Only penetration testing",
          "SOC analyst, GRC/risk, and security-focused IT roles",
          "Only chief information security officer",
          "There are no entry roles",
        ],
        answer: 1,
        why: "These need solid fundamentals and the right attitude, and are where the volume of accessible first jobs is.",
      },
      {
        q: "Why is penetration testing usually not a first job?",
        options: [
          "It is illegal",
          "It typically requires deep skill and experience, usually built first in roles like SOC or IT",
          "Nobody does it",
          "It pays nothing",
        ],
        answer: 1,
        why: "Pen testing is a later-career destination. The realistic path is in through an accessible role, then specialise toward it.",
      },
    ],
  },

  wrap: {
    headline: "You now know the realistic ways into cyber security, and can aim where the doors are actually open.",
    takeaways: [
      "Cyber security is a field of many roles, so there are many accessible doors in.",
      "The realistic first jobs are SOC analyst, GRC/risk, and security-focused IT, where the volume and accessibility are.",
      "Penetration testing is usually a later-career destination; aim your first applications at open doors and specialise over time.",
    ],
    project: {
      name: "Pick your target role",
      blurb: "Based on your interests and background, pick the one or two realistic entry roles you would most target (SOC, GRC, or IT security). Write a sentence on why it suits you. Choosing a clear, realistic first target focuses your learning, your portfolio, and your applications, exactly what a successful job hunt needs.",
    },
    ethicsNote: "Every role here operates within the law and the authorisation principles from Module 5, penetration testing most of all. This is honest career guidance toward lawful, constructive work.",
  },
};

export default topic1;

import type { TopicManifest } from "../../learn/types";
import { DisclosureOrderLab } from "../../learn/conceptLabs";

/* Module 5 - Topic 4: responsible disclosure. Case: the 2021 Missouri
 * DESE incident (a journalist found teachers' Social Security numbers
 * exposed in a state website's HTML source, reported it responsibly and
 * waited for a fix before publishing; the governor publicly threatened
 * prosecution, and no charges followed). Public record: 2021-2022
 * reporting and the prosecutor's decision. */
const topic4: TopicManifest = {
  id: "m5t4",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "Responsible disclosure",
  role: "Sooner or later you will find a flaw in something you did not set out to attack. How you handle that moment defines your reputation and your legal safety. Responsible disclosure is the professional norm, and knowing it marks you out as someone an employer can trust.",
  minutes: 16,
  promise: "Learn the right way to report a flaw you have found, then see what happens when doing the right thing is met with a threat to prosecute.",
  brief: "In this lesson, we'll learn responsible disclosure: the agreed, professional way to report a security flaw so it gets fixed without putting anyone at risk. You'll learn the order of the steps and why each one matters. Then we'll look at a 2021 case where a journalist did everything right, reported quietly, waited for the fix, and was publicly branded a hacker anyway, and what that teaches about doing this carefully.",

  learn: [
    {
      heading: "Finding a flaw is a responsibility, not a trophy",
      body: [
        "Sometimes you stumble on a real security problem: a page leaking data, a login you could clearly bypass. The moment you realise, you hold something dangerous. Handled well, you help protect everyone affected. Handled badly, you can harm users, hand attackers a weapon, or put yourself on the wrong side of the law you learned about earlier in this module.",
        "Responsible disclosure, also called coordinated disclosure, is the profession's answer. The principle is simple: give the people who can fix it a fair, private chance to do so before anything becomes public, and never make the problem worse while you report it.",
      ],
      examples: [
        "You notice a site returning other people's order details: that is a finding to report, not to explore.",
        "The goal is to get it fixed quietly, not to prove how clever you are publicly.",
        "Making a splash first, fixing later, is how users get hurt.",
      ],
      analogy: {
        plain: "Finding a key left in a shared front door. The responsible thing is to quietly tell the landlord and let them change the lock, not to announce it to the street or let yourself in to look around.",
        realTerm: "responsible disclosure",
      },
    },
    {
      heading: "The steps, in order",
      body: [
        "Disclosure has a sequence, and the order matters. First, stop and document: confirm the flaw with the minimum proof and do not dig for more data than you need. Then report it privately to the organisation, using a security contact or a published disclosure channel if they have one. Give them reasonable time to fix it, often a window of around 90 days by common convention. Confirm the fix. Only then, if appropriate, publish, with enough detail to help others learn but never anything that endangers users.",
        "Many organisations now make this easier with a vulnerability disclosure policy or a bug bounty, and a 'security.txt' file telling you exactly where to send reports. When those exist, use them: they are an explicit invitation to report, and often a safe harbour that says you will not be pursued for good-faith reporting.",
      ],
      examples: [
        "Report privately first: a security email, a disclosure form, or a bug-bounty platform.",
        "Agree a timeline, and hold your public write-up until the fix is live.",
        "Look for a security.txt or disclosure policy: it tells you where to report and often that it is safe to.",
      ],
    },
    {
      heading: "Doing it right does not always feel safe, so be careful",
      body: [
        "Uncomfortable truth: even textbook-correct disclosure can be met with hostility, especially from organisations that confuse the messenger with the attacker. That is not a reason to stay silent, but it is a reason to be careful, factual and well-documented, and to lean on recognised channels and, for anything significant, your own legal awareness.",
        "The case you are about to see is exactly this. Someone found sensitive data exposed, reported it responsibly, waited for the fix, and was still publicly accused of hacking. The lesson is not 'do not report'. It is: report by the book, keep clean records, favour organisations' official disclosure channels, and understand the law well enough to know where you stand, which is precisely why this topic sits inside the law-and-ethics module.",
      ],
      examples: [
        "Keep a clear, factual record of what you found, when, and how you reported it.",
        "Prefer official disclosure channels and safe-harbour policies where they exist.",
        "Know the law well enough to recognise when to involve your own advisers.",
      ],
      analogy: {
        plain: "Reporting a fire hazard to a building's owner is the right thing, even if a defensive owner shoots the messenger. You still report, but you keep a record and go through the proper channel.",
        realTerm: "coordinated disclosure",
      },
    },
  ],

  glossary: [
    { term: "responsible disclosure", definition: "Reporting a security flaw privately to those who can fix it, giving fair time before any public mention, and never worsening the problem meanwhile." },
    { term: "coordinated disclosure", definition: "Another term for responsible disclosure, stressing that the timing of any public release is agreed with the organisation." },
    { term: "security.txt", definition: "A small standard file a site can publish telling researchers where and how to report security issues." },
    { term: "bug bounty", definition: "A programme that formally invites researchers to find and report flaws, often with rewards and a safe-harbour promise." },
  ],

  seeHeading: "When reporting a flaw was called 'hacking'",

  cases: [
    {
      org: "Missouri DESE",
      year: "2021",
      headline: "A journalist reported exposed teacher data responsibly, and was publicly branded a hacker",
      whatHappened: "In 2021 a journalist discovered that a Missouri state education website exposed teachers' Social Security numbers: the sensitive data was sitting in the HTML source of a public page, visible to anyone who looked. Following responsible-disclosure practice, the journalist and their paper reported it privately to the state and held off publishing until the flaw was fixed. Rather than simply thanking them, the state's governor publicly described viewing a web page's source as hacking and threatened prosecution. After scrutiny, no charges were brought.",
      theMissedMeasure: "On the state's side, sensitive personal data should never have been placed in a public page's source in the first place: a basic secure-configuration and data-protection failure. On the disclosure side, the reporter did it right, and the episode showed why documenting your good-faith process carefully matters.",
      theCost: "Teachers' Social Security numbers were left exposed by the state's own site, and someone who reported it responsibly faced a public accusation of hacking and the threat of prosecution before the matter was dropped.",
      control: "secure-configuration",
      impact: ["sensitive personal data exposed in a public page's source", "responsible, private disclosure was still met with a prosecution threat", "no charges were ultimately brought"],
      source: "Public record; 2021-2022 reporting on the Missouri DESE incident and the prosecutor's decision.",
      brandColor: "#c8102e",
      news: { headline: "Governor threatens to prosecute reporter who found flaw exposing teachers' data", outlet: "Mainstream reporting (2021)", date: "2021" },
    },
  ],

  lab: {
    title: "Order the disclosure",
    intro: "Nothing to install and nothing leaves this page. Put the steps of responsible disclosure into the right order.",
    prompts: [
      "Think: confirm, report privately, give time, verify the fix, then maybe publish.",
      "The order is what keeps users safe and keeps you professional.",
      "Notice how much happens before anything ever goes public.",
    ],
    component: DisclosureOrderLab,
  },

  check: {
    explain: {
      prompt: "In the Missouri case, someone followed responsible disclosure correctly and was still accused of hacking. What does this teach a new security professional about how to handle a flaw they find?",
      modelAnswer: "It teaches that doing the right thing, reporting privately, waiting for a fix before publishing, not taking more data than needed, is still the correct path, but that you should do it carefully and keep clean records, because not every organisation reacts well. The journalist's process was sound: the real failure was the state exposing sensitive data in a page's source. A new professional should report through official channels where they exist, document their good-faith steps, understand the law well enough to know where they stand, and not be deterred from responsible disclosure, while being realistic that a defensive organisation may still push back.",
    },
    quiz: [
      {
        q: "What is the first thing to do when you find a real security flaw you were not hunting for?",
        options: [
          "Post it on social media to warn people fast",
          "Stop, document it with minimal proof, and avoid accessing more than you need",
          "Exploit it fully to measure the impact",
          "Sell the details to the highest bidder",
        ],
        answer: 1,
        why: "You confirm it with the least intrusion possible, then report privately. Digging deeper or going public first risks users and your own legal standing.",
      },
      {
        q: "Why give an organisation a window (often around 90 days) before publishing details?",
        options: [
          "To make them pay you",
          "So they have a fair chance to fix it before attackers can use the public details",
          "Because the law requires exactly 90 days",
          "There is no reason; publish immediately",
        ],
        answer: 1,
        why: "Coordinated timing protects users: the fix lands before the recipe is public. The window is convention, balancing pressure to fix against safety.",
      },
      {
        q: "What is the right takeaway from the Missouri case?",
        options: [
          "Never report flaws; it is too risky",
          "Report responsibly and by the book, but keep careful records and use official channels, because not everyone reacts well",
          "Viewing a page's HTML source is hacking",
          "Always publish first to protect yourself",
        ],
        answer: 1,
        why: "The disclosure was handled correctly; the hostility was unjustified. Report responsibly, document everything, and favour recognised channels and safe-harbour policies.",
      },
    ],
  },

  wrap: {
    headline: "You now know how to handle the moment you find a flaw: the professional, lawful, user-protecting way.",
    takeaways: [
      "Responsible disclosure means reporting privately, giving a fair time to fix, and never making the problem worse meanwhile.",
      "The order matters: confirm with minimal proof, report, allow time, verify the fix, then publish responsibly if at all.",
      "Use official channels and safe-harbour policies where they exist, document your good-faith steps, and know the law well enough to protect yourself.",
    ],
    project: {
      name: "Find a real disclosure policy",
      blurb: "Pick a large organisation you use and search for its 'vulnerability disclosure policy', 'responsible disclosure', or a '/.well-known/security.txt' file. Read how they ask researchers to report issues. Note it in your security notebook: knowing these channels exist, and what they promise, is part of being someone who could one day use them properly.",
    },
    ethicsNote: "Responsible disclosure never authorises you to go hunting for flaws in systems you have no permission to test. It governs what to do when you find one legitimately, or by accident, without crossing the authorisation line from topic 1.",
  },
};

export default topic4;

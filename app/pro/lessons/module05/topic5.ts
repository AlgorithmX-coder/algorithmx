import type { TopicManifest } from "../../learn/types";
import AuditChecklistLab from "../../learn/AuditChecklistLab";

/* Module 5 - Topic 5: finish and write up your Personal Security Audit
 * (portfolio piece #1). Reuses the audit checklist started in Module 3.
 * Case: the 2019 Disney+ account-takeover wave driven by credential
 * stuffing against reused passwords, as the relatable "why a personal
 * audit matters" story. Public record: November 2019 reporting. */
const topic5: TopicManifest = {
  id: "m5t5",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "Finish your Personal Security Audit",
  role: "Employers hire on evidence, not claims. A clear, written security audit, even of your own accounts, is a real artefact that shows you can assess risk and communicate it. This is the first piece of the portfolio that will get you interviews.",
  minutes: 20,
  promise: "Turn everything you have learned into your first real portfolio piece, and see why a personal audit is not a trivial exercise.",
  brief: "In this lesson, we'll finish the Personal Security Audit you began in Module 3 and turn it into a proper write-up: findings, what you changed, and what is left. This is portfolio piece number one, the thing you can actually show an employer. And we'll see, through a wave of hijacked streaming accounts, why the basics this audit covers are exactly what attackers count on people skipping.",

  learn: [
    {
      heading: "An audit is just: what did I find, and what did I do about it",
      body: [
        "An audit sounds formal, but at heart it is simple and you have already done the hard part. It is a record of what you checked, what you found, what you changed, and what still needs doing. Over Module 3 you worked through your own accounts; now you turn that work into something written down and legible to someone else.",
        "The reason this matters for your career is blunt: 84 percent of employers skills-test, and a portfolio is how you pass before the interview. A tidy audit of your own security proves you can do the core analyst act, assess, prioritise, communicate, on something real, without needing anyone's systems but your own.",
      ],
      examples: [
        "Finding: 'I was reusing one password across email and shopping accounts.'",
        "Action: 'Moved to a password manager; every account now has a unique password.'",
        "Remaining: 'Two old accounts still need MFA; scheduled for this week.'",
      ],
      analogy: {
        plain: "It is a before-and-after photo of your own security. Anyone can say they are fit; a clear before-and-after shows it.",
        realTerm: "security audit",
      },
    },
    {
      heading: "How to write it up like a professional",
      body: [
        "Good security writing is plain and structured, and you can mirror the real thing. For each issue, note the finding (what was wrong), the risk (what it could have led to, in the threat-vulnerability-risk language from Module 1), the action (what you did), and the status (done, or planned). Lead with the most serious items, exactly as you would prioritise by risk on the job.",
        "Keep it honest and specific. 'Improved my security' says nothing. 'Replaced 14 reused passwords with unique ones in a password manager, and enabled MFA on email, banking and my main shopping account' shows an assessor precisely how you think and what you can do.",
      ],
      examples: [
        "Finding, risk, action, status: four short columns turn a list into an audit.",
        "Order by risk: the reused email password comes before the unused forum login.",
        "Specific beats vague every time: numbers, named measures, clear status.",
      ],
    },
    {
      heading: "Why these basics are exactly what attackers exploit",
      body: [
        "It is tempting to think a personal audit is beneath a 'real' security professional. The opposite is true: the failures it fixes, reused passwords, missing MFA, accounts you forgot you had, are precisely the ones attackers industrialise. Credential stuffing, where attackers take passwords leaked from one site and try them automatically across thousands of others, works only because people reuse passwords. Your audit closes that exact door.",
        "So this first portfolio piece is not a toy. It demonstrates mastery of the controls that stop the most common real-world attacks, and it proves you practise what you would preach to an employer's users. The case below is a vivid reminder of how fast the basics get exploited when they are skipped.",
      ],
      examples: [
        "Credential stuffing turns one old breach into thousands of account takeovers, via reuse.",
        "MFA is the single measure that most often stops a stuffed password from working.",
        "The accounts you forgot about are the ones with the stale, reused passwords attackers love.",
      ],
      analogy: {
        plain: "Burglars do not pick locks when so many doors are simply unlocked. Your audit is going round locking the doors, which is unglamorous and exactly why it works.",
        realTerm: "credential stuffing",
      },
    },
  ],

  glossary: [
    { term: "security audit", definition: "A structured record of what you checked, what you found, what you changed, and what remains: the first artefact in a security portfolio." },
    { term: "credential stuffing", definition: "Automatically trying username-and-password pairs leaked from one site against many others, exploiting password reuse." },
    { term: "portfolio", definition: "The collection of real artefacts, write-ups, reports, projects, that proves your skills to employers before an interview." },
    { term: "MFA", definition: "Multi-factor authentication: a second proof of identity beyond the password, which stops most stolen-password logins." },
  ],

  seeHeading: "When reused passwords became hijacked accounts overnight",

  cases: [
    {
      org: "Disney+ (credential stuffing)",
      year: "2019",
      headline: "A new streaming service's accounts were hijacked and sold within days, with no breach of the service itself",
      whatHappened: "When Disney+ launched in November 2019, reports quickly emerged of customers locked out of brand-new accounts that were being hijacked and offered for sale online. Investigations pointed not to any breach of Disney's systems but to credential stuffing: attackers took email-and-password pairs leaked from other, unrelated sites and tried them against Disney+. Where a customer had reused a password, the attackers walked straight in.",
      theMissedMeasure: "Unique passwords and, where offered, MFA. The service itself was not breached; the accounts fell because the credentials were reused from elsewhere, exactly the weakness a personal security audit is designed to remove.",
      theCost: "Customers lost access to accounts they had just paid for, found them for sale online, and had the unsettling experience of being hacked through no fault of the service, only through reuse of a password from somewhere else.",
      control: "access-control",
      impact: ["accounts hijacked within days of launch", "no breach of the service: pure credential stuffing", "reused passwords were the whole point of entry"],
      source: "Public record; November 2019 reporting on the Disney+ account-takeover wave.",
      brandColor: "#113ccf",
      news: { headline: "Disney+ accounts hacked and put up for sale just days after launch", outlet: "Mainstream reporting (2019)", date: "November 2019" },
    },
  ],

  lab: {
    title: "Finish your audit",
    intro: "This is the real thing: these are actions on your own accounts. Tick each as you complete it. Your progress is saved on this device, and carries over from Module 3.",
    prompts: [
      "Work through any items you have not finished yet.",
      "As you go, jot the finding and what you changed: that becomes your write-up.",
      "Completing all five is a genuine, finished security audit, your first portfolio piece.",
    ],
    component: AuditChecklistLab,
  },

  check: {
    explain: {
      prompt: "Disney+ itself was never breached, yet thousands of its accounts were taken over almost immediately. Explain how, and how your Personal Security Audit protects you from exactly this.",
      modelAnswer: "The accounts fell to credential stuffing: attackers took email-and-password pairs leaked from other sites and tried them automatically against Disney+. Anywhere a customer had reused a password, the attackers logged straight in, no breach of Disney needed. My Personal Security Audit removes that exposure directly: a password manager gives every account a unique password, so a leak from one site cannot unlock another, and MFA on my important accounts means a stolen or guessed password alone is not enough. The audit closes the precise door this attack relies on.",
    },
    quiz: [
      {
        q: "What makes a personal security audit worth putting in a portfolio?",
        options: [
          "It is long and full of jargon",
          "It is a real artefact showing you can assess, prioritise and communicate risk, on something genuine",
          "It requires access to a company's systems",
          "It proves you can break into things",
        ],
        answer: 1,
        why: "Employers hire on demonstrated skill. A clear audit of your own security shows the core analyst act on real stakes, with no one else's systems needed.",
      },
      {
        q: "How should you structure each item in a professional audit write-up?",
        options: [
          "Just a tick, with no explanation",
          "Finding, risk, action, and status, ordered with the most serious first",
          "Only the things that went well",
          "A single sentence saying you improved security",
        ],
        answer: 1,
        why: "Finding, risk, action, status, prioritised by risk, mirrors how real reports read and shows exactly how you think.",
      },
      {
        q: "The Disney+ takeovers show that the 'basic' measures in your audit are:",
        options: [
          "Beneath a real security professional",
          "Exactly the controls that stop the most common real attacks, like credential stuffing",
          "Only relevant to large companies",
          "Unnecessary if a service is well built",
        ],
        answer: 1,
        why: "Unique passwords and MFA are what defeat credential stuffing. The basics are basic because they work against the attacks criminals actually run at scale.",
      },
    ],
  },

  wrap: {
    headline: "You finished Act 1: you have the core ideas, the network foundation, the law, and your first portfolio piece in hand.",
    takeaways: [
      "An audit is a clear record of findings, risks, actions and status, led by the most serious items.",
      "Your Personal Security Audit is portfolio piece number one: real evidence you can assess and communicate risk.",
      "The 'basic' controls it applies, unique passwords and MFA, are exactly what stop the commonest real attacks like credential stuffing.",
    ],
    project: {
      name: "Write up portfolio piece #1",
      blurb: "Turn your finished audit into a one-page write-up: a short intro, then your findings as finding / risk / action / status, most serious first, and a closing line on what you learned. Keep it with the network notes from Module 2. This is the first document in the portfolio that will, by the end of the course, get you interviews, and you built it before touching anyone else's systems.",
    },
    ethicsNote: "Everything in Act 1 stayed on your own accounts and your own machine, by design. Act 2 begins the hands-on attack techniques, always in the course's sandboxed labs or on systems you own, under the authorisation line this module just made non-negotiable.",
  },
};

export default topic5;

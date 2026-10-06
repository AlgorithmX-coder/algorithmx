import type { TopicManifest } from "../../learn/types";
import { HumanTargetLab } from "../../learn/conceptLabs";

/* Module 7 - Topic 1: why humans are the target. Case: the July 2020
 * Twitter breach (attackers used phone-based social engineering of
 * employees to reach internal tools and hijack high-profile accounts
 * for a crypto scam). Public record: Twitter's own statements, the New
 * York State DFS report, and US DoJ charges. */
const topic1: TopicManifest = {
  id: "m7t1",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "Why humans are the target",
  role: "The majority of breaches involve a human being persuaded to do something, not a machine being hacked. Understanding why people are the softest target, and treating that with respect rather than blame, is one of the most valuable instincts a security professional can have.",
  minutes: 16,
  promise: "Understand why attackers go through people, not firewalls, then see a handful of staff tricked into handing over the keys to Twitter.",
  brief: "In this lesson, we'll face an uncomfortable truth: the easiest way into most organisations is not a technical flaw, it is a person. We'll look at why humans are the target, how social engineering bypasses even excellent technology, and why blaming people is both unfair and useless. Then we'll see how attackers talked their way into Twitter's internal tools and hijacked some of the most famous accounts in the world.",

  learn: [
    {
      heading: "You cannot patch a person",
      body: [
        "Organisations spend fortunes on firewalls, encryption and patching, and attackers know it. So rather than battle hardened technology, they go around it, through the people who operate it. Social engineering is the art of manipulating a person into doing something that helps the attacker: clicking a link, revealing a password, approving a request, opening a door.",
        "The reason this works is simple and permanent: people can be reasoned with, rushed, frightened and flattered in ways machines cannot. You can patch a server overnight; you cannot patch human trust, helpfulness or fear. That is why the human layer is, for most organisations, the single most attacked one.",
      ],
      examples: [
        "A firewall blocks bad traffic; it cannot stop an employee being persuaded to let someone in.",
        "MFA is strong, until a user is talked into approving a login they did not start.",
        "The best lock in the world fails if someone holds the door open.",
      ],
      analogy: {
        plain: "Why pick a reinforced lock when you can knock politely in a delivery uniform and be let in? Attackers take the human door because it is so often open.",
        realTerm: "social engineering",
      },
    },
    {
      heading: "It exploits good qualities, not stupidity",
      body: [
        "A crucial point, and one that separates good security people from bad: falling for social engineering is not about being stupid. These attacks exploit the very qualities we want in people, helpfulness, trust, respect for authority, willingness to act under pressure. The more conscientious someone is, the more an 'urgent request from the boss' can get to them.",
        "This matters because blame makes security worse. If people fear being mocked or punished for a mistake, they hide it, and a hidden click can become a disaster while a reported one can be contained in minutes. The professional stance is: assume good people will sometimes be fooled, design so one mistake is survivable, and make reporting safe and easy.",
      ],
      examples: [
        "Helpfulness is exploited: 'I'm locked out, can you just reset it for me?'",
        "Respect for authority is exploited: 'The director needs this now.'",
        "Punishing mistakes drives them underground; a safe-to-report culture surfaces them fast.",
      ],
    },
    {
      heading: "Even the most secure organisations are vulnerable through people",
      body: [
        "It is tempting to think only careless or small organisations fall to social engineering. The opposite is true: some of the most spectacular breaches in history hit technically sophisticated companies precisely because the attackers skipped the technology and targeted the staff. If a social-media giant with world-class engineers can be breached through its people, anyone can.",
        "The lesson is not despair but focus: because people are the most attacked layer, defending them, through awareness, verification habits, and systems that limit the damage of any one mistake, is among the highest-value security work there is. The Twitter breach you are about to see is the definitive modern example.",
      ],
      examples: [
        "Technical excellence does not protect you if staff can be talked into misusing their access.",
        "The bigger the access a role has, the more valuable that person is as a target.",
        "Defending people is high-value work precisely because they are so heavily targeted.",
      ],
      analogy: {
        plain: "A bank vault is only as safe as the teller who can be sweet-talked into opening it. The thicker the vault door, the more attackers focus on the person with the key.",
        realTerm: "the human attack surface",
      },
    },
  ],

  glossary: [
    { term: "social engineering", definition: "Manipulating a person into doing something that helps an attacker, rather than breaking the technology directly." },
    { term: "pretexting", definition: "Inventing a believable scenario or false identity (the 'pretext') to persuade a target to cooperate." },
    { term: "tailgating", definition: "Following an authorised person into a secure area by exploiting their politeness, a physical form of social engineering." },
    { term: "human attack surface", definition: "The people in an organisation, considered as targets: often the most attacked layer because they cannot be patched." },
  ],

  seeHeading: "When talking to staff unlocked Twitter",

  cases: [
    {
      org: "Twitter",
      year: "2020",
      headline: "Attackers talked their way into internal tools and hijacked the world's most famous accounts",
      whatHappened: "In July 2020, attackers used social engineering, including phone-based pretexting of Twitter employees, to gain access to internal account-management tools. With that access they took over a long list of high-profile verified accounts, including public figures and major companies, and posted a cryptocurrency scam. The breach was not a clever exploitation of Twitter's code; it was people being manipulated into granting access, which the attackers then abused.",
      theMissedMeasure: "Powerful internal tools were reachable once staff were deceived, and access to them was not tightly enough controlled or monitored. Stronger limits on who could use such tools, tighter verification, and better detection of their misuse were the measures that could have contained it.",
      theCost: "A global, highly visible compromise of a major platform, a running crypto scam on trusted accounts, regulatory scrutiny, and criminal charges against those responsible, all achieved mainly by talking to people.",
      control: "access-control",
      impact: ["high-profile verified accounts hijacked worldwide", "entry via phone-based social engineering of staff", "internal admin tools reached through people, not code"],
      source: "Public record; Twitter's statements, the New York State Department of Financial Services report, and US Department of Justice charges.",
      brandColor: "#1da1f2",
      news: { headline: "Twitter hack: staff tricked by phone spear-phishing scam", outlet: "BBC News", date: "2020" },
    },
  ],

  lab: {
    title: "Technology or the person?",
    intro: "Nothing to install and nothing leaves this page. For each scenario, decide: would a technical control stop it, or does it bypass the technology by targeting the person?",
    prompts: [
      "Ask: is a machine being attacked, or a human decision?",
      "If the trick works on emotion, habit or trust, it targets the person.",
      "Notice how often the strongest technology is simply walked around.",
    ],
    component: HumanTargetLab,
  },

  check: {
    explain: {
      prompt: "Twitter has world-class engineers, yet it was breached through its staff, not its code. Explain why attackers so often target people, and why blaming the employees would be the wrong response.",
      modelAnswer: "Attackers target people because people cannot be patched: you can fix a server overnight, but human trust, helpfulness, respect for authority and response to pressure are permanent and exploitable. Battling hardened technology is hard, so attackers go around it through the staff who operate it, as they did at Twitter by talking employees into granting access to internal tools. Blaming the employees would be wrong because social engineering exploits good qualities, not stupidity, and blame drives mistakes underground where they fester. The professional response is to defend people through awareness and verification habits, and to design systems so one person's mistake is survivable and safe to report.",
    },
    quiz: [
      {
        q: "Why do attackers so often target people rather than technology?",
        options: [
          "People are stupid",
          "Because people cannot be patched: trust, helpfulness and fear are permanent and exploitable, even when the technology is strong",
          "Because technology is always perfectly secure",
          "Because it is illegal to attack computers but not people",
        ],
        answer: 1,
        why: "Social engineering goes around strong technology by exploiting human qualities that cannot be patched away.",
      },
      {
        q: "What is the most professional attitude toward someone who fell for a social-engineering attack?",
        options: [
          "Mock them so they learn",
          "Recognise it exploits good qualities, design so one mistake is survivable, and make reporting safe and easy",
          "Punish them to deter others",
          "Ban them from using email",
        ],
        answer: 1,
        why: "Blame hides mistakes; a safe-to-report culture surfaces them fast, so they can be contained. Good design assumes people will sometimes be fooled.",
      },
      {
        q: "The Twitter 2020 breach is a landmark example because it shows that:",
        options: [
          "Only small companies fall for social engineering",
          "Even a technically sophisticated organisation can be breached through its people",
          "Social engineering never works on real companies",
          "Firewalls stop all attacks",
        ],
        answer: 1,
        why: "World-class engineering did not help, because the attackers targeted staff, not code. If it can happen to Twitter, the human layer matters everywhere.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the most attacked layer in security: people, and why defending them is high-value work.",
    takeaways: [
      "Most breaches involve a person being persuaded, not a machine being hacked: you cannot patch human trust.",
      "Social engineering exploits good qualities, not stupidity, so blame is both unfair and counterproductive.",
      "Even the most sophisticated organisations fall through their people, which makes defending the human layer essential.",
    ],
    project: {
      name: "Spot the human door",
      blurb: "Think about a place you know (a workplace, a shop, a club). Write down two ways someone could get in or get information by manipulating a person rather than defeating technology, for example talking their way past reception, or phoning to 'confirm' details. Seeing the human doors is the first step to defending them.",
    },
    ethicsNote: "Studying social engineering is to recognise and resist it. Actually deceiving people to gain access or information is an offence and a serious ethical breach; the only authorised exception is a sanctioned test, covered carefully in topic 5.",
  },
};

export default topic1;

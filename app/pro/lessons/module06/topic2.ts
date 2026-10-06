import type { TopicManifest } from "../../learn/types";
import { CrimeEconomyLab } from "../../learn/conceptLabs";

/* Module 6 - Topic 2: the real cybercrime economy (killing the hoodie
 * myth). Case: the 2022 Conti leaks (an insider leaked the ransomware
 * group's internal chats, revealing salaries, HR, management and an
 * office-like structure). Public record: February-March 2022 reporting
 * and researchers' analysis of the leaked Conti communications. */
const topic2: TopicManifest = {
  id: "m6t2",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "The real cybercrime economy",
  role: "Defenders who picture a lone genius make bad decisions. Understanding that cybercrime is an industry, with suppliers, specialists and customers, explains why attacks are so frequent and professional, and why the basics still beat most of them.",
  minutes: 16,
  promise: "Replace the hoodie myth with how cybercrime really runs, then read the leaked chats that exposed a ransomware company from the inside.",
  brief: "In this lesson, we'll kill the myth of the lone hacker in a hoodie. Modern cybercrime is a professional economy: specialists who each do one job, marketplaces where access and tools are bought and sold, and 'as-a-service' products anyone can rent. Then we'll look at the extraordinary 2022 leak of a ransomware group's internal messages, which read less like a crime drama and more like an ordinary company.",

  learn: [
    {
      heading: "It is an industry, not a lone genius",
      body: [
        "The popular image of a brilliant loner is almost always wrong. Serious cybercrime is run by organised groups that look remarkably like legitimate businesses: they have developers who build the tools, operators who run the attacks, negotiators who handle ransoms, and even people doing recruitment and support. The work is divided among specialists, exactly as in any company.",
        "This professionalisation is why attacks are so relentless and so polished. You are rarely facing one person's cleverness; you are facing an organisation's process. That is sobering, but also clarifying: processes have predictable steps, which means they can be anticipated and disrupted.",
      ],
      examples: [
        "Developers build and maintain the malware, like a software team shipping releases.",
        "Negotiators haggle over ransoms, sometimes with scripts and 'customer support' portals.",
        "Access brokers specialise purely in breaking in, then sell the foothold to others.",
      ],
      analogy: {
        plain: "It is a factory with a production line, not a lone artist. Each station does one job and hands the work on, which is why the output is steady and professional.",
        realTerm: "the cybercrime economy",
      },
    },
    {
      heading: "A marketplace: access, tools and crime-as-a-service",
      body: [
        "Because the work is specialised, there is a thriving market connecting the specialists. Access brokers sell footholds into already-compromised organisations. Others sell stolen data, or toolkits, or lists of leaked passwords. And whole criminal operations are now sold 'as a service': ransomware-as-a-service lets a low-skilled affiliate rent professional ransomware and infrastructure in exchange for a cut of the profits.",
        "This marketplace is the real force multiplier. It means an attacker no longer needs every skill themselves, they can simply buy the piece they lack. It is also why defence is a moving target: a weakness you leave open today might be found by a broker and sold to a ransomware crew next week.",
      ],
      examples: [
        "Access broker: 'I have a foothold in company X, selling for a price.'",
        "Ransomware-as-a-service: rent the tools, keep most of the ransom, hand the rest to the developers.",
        "Stolen-data and credential marketplaces turn one breach into fuel for the next.",
      ],
    },
    {
      heading: "Why this is good news for defenders",
      body: [
        "It sounds bleak, but the industrial nature of cybercrime is actually encouraging for defenders. Because these are businesses, they are ruthlessly efficient: they want the highest return for the least effort. That means they overwhelmingly go after the easy targets, the unpatched server, the reused password, the person who clicks. Making yourself even moderately harder often sends them looking elsewhere.",
        "You do not have to be unbreakable. You have to be more expensive to attack than the next organisation along, because a profit-driven industry follows the money. This is why the unglamorous basics, patching, MFA, backups, awareness, defeat the vast majority of real attacks: they raise the cost above the easy payoff.",
      ],
      examples: [
        "A profit-driven crew skips the hardened target for the soft one next door.",
        "MFA alone defeats the huge volume of attacks built on stolen passwords.",
        "'Not the easiest target' is a realistic and effective goal for most organisations.",
      ],
      analogy: {
        plain: "Thieves walk past the house with the alarm and the locked gate for the one with the open window. You rarely need the best security on the street, just not the worst.",
        realTerm: "raising the cost of attack",
      },
    },
  ],

  glossary: [
    { term: "ransomware-as-a-service", definition: "A business model where skilled developers rent ready-made ransomware and infrastructure to less-skilled affiliates for a share of the profits." },
    { term: "access broker", definition: "A criminal who specialises in breaking into organisations and then sells that access to others, such as ransomware groups." },
    { term: "affiliate", definition: "A criminal who rents another group's tools or services to carry out attacks, splitting the proceeds with the providers." },
    { term: "cybercrime economy", definition: "The connected marketplace of specialists, tools, stolen data and services that makes modern cybercrime efficient and scalable." },
  ],

  seeHeading: "A ransomware group, exposed from the inside",

  cases: [
    {
      org: "Conti ransomware group",
      year: "2022",
      headline: "Leaked internal chats revealed a ransomware crew that ran like an ordinary company",
      whatHappened: "In early 2022, after the group publicly backed one side of a geopolitical conflict, an insider leaked a vast archive of the Conti ransomware group's internal chat messages. Researchers found an organisation that looked startlingly corporate: paid salaries, working hours, HR and recruitment, team leads and performance management, even complaints about pay and management. It was not a den of lone geniuses; it was a business with staff, processes and problems like any other.",
      theMissedMeasure: "For victims, the lesson was less a single missed control and more the scale of the threat: a professional, well-staffed operation running continuous attacks. The defences that worked were still the fundamentals, raising the cost enough that this efficiency-seeking business looked elsewhere.",
      theCost: "Conti had already extracted enormous sums from victims worldwide before the leak. The leak's value was in what it taught defenders: the enemy is an industry, and should be planned for like one.",
      control: "access-control",
      impact: ["internal chats showed salaries, HR and office-like structure", "a professional, continuously operating criminal business", "confirmed cybercrime is an industry, not a lone-hacker myth"],
      source: "Public record; February-March 2022 reporting and researchers' analysis of the leaked Conti communications.",
      brandColor: "#6b7280",
      news: { headline: "Leaked ransomware chats reveal a group run like a tech company", outlet: "Security and mainstream reporting (2022)", date: "2022" },
    },
  ],

  lab: {
    title: "Myth or reality?",
    intro: "Nothing to install and nothing leaves this page. Sort each statement about cybercrime: outdated myth, or the professional reality?",
    prompts: [
      "If it sounds like a film, it is probably the myth.",
      "The reality is specialisation, marketplaces and services.",
      "Notice how the reality points straight at why the basics work.",
    ],
    component: CrimeEconomyLab,
  },

  check: {
    explain: {
      prompt: "The Conti leaks showed a ransomware group with salaries, HR and performance reviews. Explain what this reveals about modern cybercrime, and why, counter-intuitively, it is encouraging for a defender.",
      modelAnswer: "It reveals that serious cybercrime is an industry, not a lone genius: specialists divide the work, and whole operations run like companies with staff and processes. That is why attacks are so frequent and professional. The encouraging part is that businesses are efficiency-driven: they chase the easiest money. So they overwhelmingly target the soft option, the unpatched system, the reused password, the person who clicks. A defender does not have to be unbreakable, just more expensive to attack than the next target, which is exactly why the basics, patching, MFA, backups, defeat most real attacks.",
    },
    quiz: [
      {
        q: "What is 'ransomware-as-a-service'?",
        options: [
          "A security product that protects against ransomware",
          "Renting ready-made ransomware and infrastructure in exchange for a share of the profits",
          "A government programme to recover ransoms",
          "Insurance against ransomware",
        ],
        answer: 1,
        why: "It lets low-skilled affiliates use professional criminal tools for a cut, which is why so many groups can run attacks at scale.",
      },
      {
        q: "An 'access broker' in the cybercrime economy:",
        options: [
          "Negotiates ransoms on victims' behalf",
          "Specialises in breaking in, then sells that foothold to other criminals",
          "Brokers cyber-insurance policies",
          "Reports vulnerabilities responsibly",
        ],
        answer: 1,
        why: "Access brokers do the breaking-in, then sell the access, often to ransomware groups. It is specialisation in a criminal marketplace.",
      },
      {
        q: "Why do the 'boring basics' defeat most real attacks?",
        options: [
          "Because attackers are not very good",
          "Because a profit-driven industry chases the easiest targets, so being harder sends them elsewhere",
          "Because the basics stop every possible attack",
          "Because most attacks are not real",
        ],
        answer: 1,
        why: "Efficiency-seeking crime follows the easy money. Patching, MFA and backups raise your cost above the easy payoff, so the industry moves on.",
      },
    ],
  },

  wrap: {
    headline: "You now see cybercrime as it really is: a professional industry, which is exactly why it can be planned for.",
    takeaways: [
      "Serious cybercrime is run by organised, specialised groups that operate like businesses, not lone geniuses.",
      "A marketplace connects them: access brokers, stolen-data sellers, and crime-as-a-service rentals multiply their reach.",
      "Because they are efficiency-driven, the basics work: being a harder target than the next one sends profit-seekers elsewhere.",
    ],
    project: {
      name: "Cost the attack",
      blurb: "For one account or system you care about, list the things that make it harder (or easier) to attack: unique password, MFA, up-to-date software, backups. Then ask the attacker's question: is this worth more effort than an easier target? Thinking like a cost-conscious criminal is a surprisingly good way to prioritise your own defences.",
    },
    ethicsNote: "Studying the cybercrime economy is about recognising and resisting it. Buying from, selling to, or participating in these marketplaces is serious crime; this knowledge exists so you can defend against it.",
  },
};

export default topic2;

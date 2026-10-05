import type { TopicManifest } from "../../learn/types";
import { TrustInputLab } from "../../learn/conceptLabs";

/* Module 9 - Topic 1: how websites talk to databases. Case: Exactis,
 * 2018 (a marketing firm left a database of around 340 million records
 * exposed on the open internet, requiring no attack at all). Public
 * record: 2018 reporting on the Exactis exposure. */
const topic1: TopicManifest = {
  id: "m9t1",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "How websites talk to databases",
  role: "Almost every web application is a front end to a database full of valuable data. Understanding how they talk, and the one golden rule of never trusting user input, is the foundation of all web security, which is the largest attack surface most organisations have.",
  minutes: 15,
  promise: "See how a website and its database really work together, then meet the 340-million-record database left open to the whole internet.",
  brief: "In this lesson, we'll open up the web application. Behind almost every login, search and form is a database, and the website is constantly asking it questions on your behalf. We'll see how that works, and learn the single most important rule in web security: never trust input that came from the user. Then we'll see a case where the data was not even attacked, it was simply left exposed for anyone to find.",

  learn: [
    {
      heading: "The website is a waiter; the database is the kitchen",
      body: [
        "Most web applications follow the same shape. The part you see, the pages, forms and buttons, is the front end. Behind it sits a database, a highly organised store of all the valuable data: the customer records, orders, messages, passwords. When you log in or search, the website takes what you did and asks the database a question, then shows you the answer.",
        "A useful picture: the website is a waiter and the database is the kitchen. You never go into the kitchen yourself; you tell the waiter what you want, and the waiter relays it. Almost everything interesting, and everything worth protecting, lives in that kitchen, which is exactly why attackers try so hard to reach it.",
      ],
      examples: [
        "Logging in: the site asks the database 'is there a user with these credentials?'.",
        "Searching: the site asks 'show me products matching this word'.",
        "The valuable data lives in the database, not in the pages you see.",
      ],
      analogy: {
        plain: "You order from a waiter who fetches from the kitchen. You never enter the kitchen, but everything you actually want is in there.",
        realTerm: "front end and database",
      },
    },
    {
      heading: "The golden rule: never trust user input",
      body: [
        "Here is the single most important principle in web security, and it underlies this whole module: never trust input that came from the user. Anything a person can type, edit or send, a form field, a search box, a value in the URL, a hidden field, an uploaded file, could be anything, including a deliberate attack. You must treat all of it as potentially hostile until you have checked and handled it safely.",
        "This sounds paranoid, but it is simply realistic. The attacker's whole game on the web is to send input the developer did not expect, to make the application do something it should not. Almost every web vulnerability you will meet, injection, cross-site scripting, broken access control, is ultimately a failure to respect this one rule. Internalise it now and the rest of the module clicks into place.",
      ],
      examples: [
        "Form fields, search boxes, URL values, hidden fields, uploads: all untrusted.",
        "The attacker's game is sending input you did not expect.",
        "Most web flaws trace back to trusting input you should not have.",
      ],
      analogy: {
        plain: "A good doorkeeper checks everyone, not just people who look suspicious. On the web, every input gets checked, because any of it could be the attack.",
        realTerm: "never trust user input",
      },
    },
    {
      heading: "And protect the database itself",
      body: [
        "Respecting user input protects against attacks that come through the application. But the database also has to be protected in its own right, because if it is left reachable or exposed, no clever attack is even needed. A database that is accessible from the internet without proper authentication, or a backup left in a public location, can simply be found and copied.",
        "This is a surprisingly common failure, and a sobering one, because it is pure carelessness rather than any sophistication. The defence is basic hygiene: databases should never be directly exposed to the internet, must require strong authentication, and their backups must be protected too. The case you are about to see is the starkest kind: a vast database that required no hacking at all, just finding it.",
      ],
      examples: [
        "A database reachable from the internet without authentication can just be copied.",
        "Backups left in public locations are breaches waiting to be found.",
        "Basic hygiene, no direct exposure, strong auth, protected backups, prevents this.",
      ],
    },
  ],

  glossary: [
    { term: "front end", definition: "The part of a web application you see and interact with: the pages, forms and buttons." },
    { term: "database", definition: "The organised store behind an application holding its valuable data: customers, orders, credentials and more." },
    { term: "user input", definition: "Any data that came from a user, form fields, URLs, uploads, hidden fields, which must always be treated as untrusted." },
    { term: "data exposure", definition: "Sensitive data left reachable (e.g. an internet-facing database or public backup) so it can be found and copied with no attack." },
  ],

  seeHeading: "When the database was simply left open",

  cases: [
    {
      org: "Exactis",
      year: "2018",
      headline: "A database of around 340 million records was left exposed to the open internet",
      whatHappened: "In 2018, a marketing and data-aggregation firm, Exactis, was found to have left a database containing around 340 million records, covering a huge number of individuals and businesses, accessible on the public internet. No sophisticated attack was required: the data was simply reachable by anyone who looked. The records reportedly included detailed personal information. It was a breach by exposure, the data was not stolen through a clever exploit, it was left where anyone could find and take it.",
      theMissedMeasure: "Basic data-protection hygiene: a database holding hundreds of millions of personal records should never be directly reachable from the internet, and must require strong authentication. This is the most preventable kind of breach, and among the most common.",
      theCost: "The exposure of detailed personal data on a vast scale, reputational and legal consequences, and a textbook reminder that protecting data is not only about defeating attacks, it is also about not leaving the door open in the first place.",
      control: "secure-configuration",
      impact: ["~340 million records exposed on the open internet", "no attack needed: the data was simply reachable", "a breach of basic data-protection hygiene"],
      source: "Public record; 2018 reporting on the Exactis data exposure.",
      brandColor: "#6b7280",
      news: { headline: "Marketing firm Exactis said to have exposed 340 million records", outlet: "Mainstream and security reporting (2018)", date: "2018" },
    },
  ],

  lab: {
    title: "Trusted or untrusted?",
    intro: "Nothing to install and nothing leaves this page. For each source of data, decide: is it untrusted user input, or something you control?",
    prompts: [
      "The rule: anything the user can type, edit or send is untrusted.",
      "URL values and hidden fields are user-editable too, so they are untrusted.",
      "Getting this instinct right is the foundation of all web security.",
    ],
    component: TrustInputLab,
  },

  check: {
    explain: {
      prompt: "State the golden rule of web security in your own words, and explain why the Exactis case is a different kind of failure from an attack that exploits user input.",
      modelAnswer: "The golden rule is: never trust input that came from the user. Anything a person can type, edit or send, form fields, URL values, hidden fields, uploads, could be a deliberate attack, so all of it must be treated as hostile until checked and handled safely. Most web vulnerabilities are failures to respect this. The Exactis case is a different kind of failure: it was not an attack through user input at all, but a breach by exposure, a database of around 340 million records left directly reachable on the internet, so it could simply be found and copied with no exploit needed. It shows that protecting data has two halves: respecting untrusted input to defend against attacks through the application, and basic hygiene, no internet-facing databases, strong authentication, protected backups, so the data is not just left open in the first place.",
    },
    quiz: [
      {
        q: "What is the single most important rule in web security?",
        options: [
          "Use a fast server",
          "Never trust input that came from the user",
          "Always show a professional-looking page",
          "Keep the database small",
        ],
        answer: 1,
        why: "Nearly every web vulnerability traces back to trusting input you should not have. Treat all user-supplied data as potentially hostile.",
      },
      {
        q: "Which of these is untrusted user input?",
        options: [
          "A setting hard-coded in your own server config",
          "A value in the URL (like ?id=42) that a user can edit",
          "A fixed list of options your code defines",
          "None of these",
        ],
        answer: 1,
        why: "Users can freely change URL parameters and hidden fields, so they are untrusted, just like form fields and uploads.",
      },
      {
        q: "Why was the Exactis exposure preventable without defeating any attack?",
        options: [
          "It used unbreakable encryption",
          "The database was simply left reachable on the internet; basic hygiene (no direct exposure, strong auth) would have prevented it",
          "The attackers were very unskilled",
          "It was not actually a breach",
        ],
        answer: 1,
        why: "It was a breach by exposure, not a clever exploit. A database of personal records should never be directly reachable from the internet.",
      },
    ],
  },

  wrap: {
    headline: "You now understand how web apps and databases work, and the one rule that underlies all web security.",
    takeaways: [
      "A web application is a front end to a database; the valuable data lives in the database the attacker wants to reach.",
      "The golden rule: never trust user input, anything a user can type, edit or send could be an attack.",
      "Also protect the database itself: no direct internet exposure, strong authentication, and protected backups.",
    ],
    project: {
      name: "Spot the inputs",
      blurb: "On a website you use, note every place you can send input: search boxes, forms, the URL, file uploads. Each one is an untrusted entry point a developer must handle safely. Seeing an application as a set of input points is exactly how both defenders and testers think about web security.",
    },
    ethicsNote: "Looking at how sites work and noticing input points is fine. Actually sending attack input to a site you do not own or have permission to test is unauthorised and an offence (Module 5). The only place you will attack a real database in this course is the sandboxed lab in the next topic.",
  },
};

export default topic1;

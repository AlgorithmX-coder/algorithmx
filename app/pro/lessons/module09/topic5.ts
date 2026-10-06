import type { TopicManifest } from "../../learn/types";
import { WebFixLab } from "../../learn/conceptLabs";

/* Module 9 - Topic 5: the OWASP Top 10 tour and the fix mindset. Case:
 * the OWASP Top 10 itself (a community-maintained, periodically updated
 * list of the most critical web-application security risks; the 2021
 * edition is widely referenced). Public record: the OWASP Top 10
 * project. */
const topic5: TopicManifest = {
  id: "m9t5",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "The OWASP Top 10 & the fix mindset",
  role: "The OWASP Top 10 is the industry's shared checklist of the worst web risks, referenced constantly in jobs, interviews and standards. Knowing what it is, and the handful of recurring fix mindsets behind it, turns web security from a scary unknown into a navigable map.",
  minutes: 15,
  promise: "Get the map of the web's worst risks and the small set of principles that fix most of them, then see the community resource every web professional uses.",
  brief: "In this lesson, we'll pull the module together with the OWASP Top 10, the web-security community's shared list of the most critical risks. We'll see that the many flaws boil down to a few recurring mindsets, respect untrusted input, enforce access on the server, protect data, and so on, so you are not memorising ten unrelated things. Then we'll look at the OWASP project itself, the resource that underpins how the whole industry talks about web security.",

  learn: [
    {
      heading: "A shared map of the worst web risks",
      body: [
        "You have now met several web vulnerabilities, and it is natural to wonder how to keep track of them all. The web-security community has a brilliant answer: the OWASP Top 10, a periodically updated list of the ten most critical web-application security risks, compiled from real-world data. It gives everyone, developers, defenders, testers, auditors, a shared vocabulary and a prioritised checklist of what matters most.",
        "You have already studied its headline entries. Broken access control (the current number one), injection like SQL injection, and issues around cross-site scripting all feature. Others cover things like weak authentication, insecure design, security misconfiguration, and using components with known vulnerabilities, which connects straight to Module 11's patching. The Top 10 is not exhaustive, but it is where to focus first.",
      ],
      examples: [
        "Broken access control: OWASP's current number-one risk (topic 4).",
        "Injection, including SQL injection (topic 2), and XSS-related risks (topic 3).",
        "Also: weak authentication, misconfiguration, and known-vulnerable components (Module 11).",
      ],
      analogy: {
        plain: "It is the web's 'most wanted' list: not every criminal, but the ones causing the most harm, so you know where to point your attention first.",
        realTerm: "the OWASP Top 10",
      },
    },
    {
      heading: "Ten risks, a handful of mindsets",
      body: [
        "Here is the liberating insight: the Top 10 is not ten unrelated things to memorise. Most of it comes down to a small set of recurring principles you have already met. Never trust user input (fixes injection and XSS: keep data separate from commands and code). Enforce access on the server, default-deny (fixes broken access control). Protect data properly (encryption, no needless exposure). Use strong authentication, with MFA. Keep software patched (known-vulnerable components). Configure securely, removing defaults and unnecessary features.",
        "Seen this way, web security is coherent, not overwhelming. When you meet a new web flaw, you can usually place it against one of these mindsets and know roughly how it is fixed. This is exactly the understanding that lets a beginner reason about problems they have never seen before, which is far more valuable than memorising a list.",
      ],
      examples: [
        "Never trust input → fixes injection and XSS (data vs command/code).",
        "Enforce access on the server, default-deny → fixes broken access control.",
        "Patch, use MFA, configure securely, protect data → covers most of the rest.",
      ],
    },
    {
      heading: "The fix mindset: build it in, test for it",
      body: [
        "The final shift is from reacting to flaws to preventing them. Secure web development means building these principles in from the start, treating input as untrusted, enforcing access server-side, protecting data, by default, rather than bolting security on afterwards. 'Secure by design' is far cheaper and more effective than finding and fixing flaws in production.",
        "Alongside that, you test for these risks deliberately: reviewing code, running security scanners, and (with authorisation) probing for the Top 10 flaws before attackers do. This is where the blue team (defenders building securely) and the authorised offensive work (testers hunting flaws) meet, both guided by the same shared map. The OWASP project you are about to see is the living resource that makes this shared approach possible.",
      ],
      examples: [
        "Secure by design: build in the principles from the start, cheaper than fixing later.",
        "Test deliberately: code review, scanners, and authorised probing for Top 10 flaws.",
        "Defenders and authorised testers share the same OWASP map.",
      ],
      analogy: {
        plain: "It is the difference between designing a building to code from the start and inspecting it regularly, versus discovering the faults only when something collapses.",
        realTerm: "secure by design",
      },
    },
  ],

  glossary: [
    { term: "OWASP", definition: "The Open Worldwide Application Security Project: a community that produces free web-security resources, including the Top 10." },
    { term: "OWASP Top 10", definition: "A periodically updated, data-driven list of the ten most critical web-application security risks, used as a shared checklist." },
    { term: "secure by design", definition: "Building security principles in from the start of development, rather than bolting them on after flaws appear." },
    { term: "insecure design", definition: "A category in the Top 10 covering flaws that come from missing or poor security thinking in the design itself, not just coding mistakes." },
  ],

  seeHeading: "The resource that unites web security",

  cases: [
    {
      org: "The OWASP Top 10",
      year: "2021",
      headline: "A community-built list that shapes how the whole industry approaches web security",
      whatHappened: "The OWASP Top 10, maintained by the Open Worldwide Application Security Project, is a free, community-driven, periodically updated list of the most critical web-application security risks (the 2021 edition is widely referenced, with broken access control at number one). It is compiled from real-world data and expert consensus, and it has become a shared standard: developers build against it, security teams test against it, auditors and regulations reference it, and job descriptions and interviews assume familiarity with it. OWASP also publishes much more, from testing guides to cheat sheets, all free.",
      theMissedMeasure: "The Top 10 is itself the constructive measure, a shared, prioritised answer to 'what should we worry about, and in what order?'. Its existence means no team has to guess the biggest web risks, and no beginner has to invent the map from scratch.",
      theCost: "Here the value is what the shared map enables: a common language and checklist that make web security teachable, testable and comparable across the whole industry, a model of how an open community resource can raise everyone's defences.",
      control: "secure-configuration",
      impact: ["the industry's shared list of the worst web risks", "data-driven, free, and widely referenced", "underpins secure development, testing and standards"],
      source: "Public record; the OWASP Top 10 project (2021 edition and ongoing).",
      brandColor: "#000000",
      news: { headline: "The OWASP Top 10: the shared checklist behind modern web security", outlet: "OWASP / security reporting", date: "2021" },
    },
  ],

  lab: {
    title: "Match the fix",
    intro: "Nothing to install and nothing leaves this page. Tap each fix, then tap the web risk it addresses. The fix mindset is what matters most.",
    prompts: [
      "A few mindsets cover most of the Top 10: respect input, enforce access, protect data, strong auth.",
      "Parameterise (injection), escape output (XSS), server-side default-deny (access), MFA (auth).",
      "Knowing the fix mindset is more useful than memorising the list.",
    ],
    component: WebFixLab,
  },

  check: {
    explain: {
      prompt: "What is the OWASP Top 10, and why is it more useful to understand the handful of recurring fix mindsets than to memorise ten separate risks?",
      modelAnswer: "The OWASP Top 10 is the web-security community's free, periodically updated, data-driven list of the ten most critical web-application risks, used across the industry as a shared vocabulary and prioritised checklist, by developers, testers, auditors and in interviews. It is more useful to understand the recurring fix mindsets than to memorise ten separate risks because most of the list comes down to a few principles I already know: never trust user input (which fixes injection and XSS by keeping data separate from commands and code), enforce access on the server with default-deny (which fixes broken access control), protect data, use strong authentication with MFA, patch known-vulnerable components, and configure securely. Seeing it this way makes web security coherent rather than overwhelming, and, crucially, it lets me reason about brand-new flaws I have never seen by placing them against a mindset and knowing roughly how they are fixed, which is far more valuable than rote memorisation.",
    },
    quiz: [
      {
        q: "What is the OWASP Top 10?",
        options: [
          "A list of the ten best hacking tools",
          "A community-maintained, data-driven list of the most critical web-application security risks, used as a shared checklist",
          "A ranking of the ten biggest companies",
          "A type of firewall",
        ],
        answer: 1,
        why: "It is the industry's shared, prioritised map of the worst web risks, referenced everywhere from development to interviews.",
      },
      {
        q: "Why understand the fix mindsets rather than just memorise the ten risks?",
        options: [
          "Memorising is impossible",
          "Because most risks reduce to a few principles (respect input, enforce access server-side, protect data, strong auth, patch), which lets you reason about new flaws too",
          "The mindsets are unrelated to the risks",
          "You should memorise them instead",
        ],
        answer: 1,
        why: "A handful of recurring principles cover most of the Top 10 and generalise to flaws you have never seen, which rote memorisation cannot do.",
      },
      {
        q: "'Secure by design' means:",
        options: [
          "Adding security only after a breach",
          "Building security principles in from the start, rather than bolting them on after flaws appear",
          "Designing a pretty interface",
          "Hiring more testers only",
        ],
        answer: 1,
        why: "Building security in from the beginning is cheaper and more effective than finding and fixing flaws in production.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 9: you can navigate the web's worst risks with a shared map and a handful of fix mindsets.",
    takeaways: [
      "The OWASP Top 10 is the industry's shared, prioritised checklist of the most critical web risks.",
      "The ten risks reduce to a few recurring mindsets: respect untrusted input, enforce access server-side, protect data, strong auth, patch, configure securely.",
      "Secure by design, build the principles in and test deliberately, beats bolting security on after flaws appear.",
    ],
    project: {
      name: "Map what you learned to the Top 10",
      blurb: "Look up the current OWASP Top 10 and match the flaws from this module (SQL injection, XSS, broken access control) to their entries, then pick one entry you have not studied and write a one-line fix mindset for it. Being able to place real flaws on the OWASP map, and reason about the rest, is exactly the web-security fluency employers look for.",
    },
    ethicsNote: "OWASP's resources are for building and testing securely. Use them to defend your own, or authorised, applications and to practise on deliberately vulnerable training apps, never to attack systems you are not permitted to test (Module 5).",
  },
};

export default topic5;

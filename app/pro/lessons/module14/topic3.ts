import type { TopicManifest } from "../../learn/types";
import { LogSearchLab } from "../../learn/conceptLabs";

/* Module 14 - Topic 3: searching millions of logs at scale. Case: the
 * sheer scale of logs modern organisations generate (billions of events
 * a day for large ones), which makes searching, not scrolling, the only
 * viable approach. Public record: established SOC/SIEM practice. */
const topic3: TopicManifest = {
  id: "m14t3",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Searching at scale",
  role: "Real organisations generate staggering volumes of logs, so finding the needle is a skill in itself. Learning to search and filter effectively, rather than scroll, is what makes an analyst productive against millions or billions of log lines.",
  minutes: 14,
  promise: "Learn how analysts find the needle in millions of log lines, by searching and filtering smartly rather than scrolling.",
  brief: "In this lesson, we'll tackle scale. A real organisation can generate millions, even billions, of log events a day, so you can never read them all. The skill is narrowing: using search and filters, by time, by entity, by event type, to cut that mountain down to the handful of lines that matter. We'll see the strategies that work, and why 'scroll through everything' is never one of them.",

  learn: [
    {
      heading: "You can never read them all",
      body: [
        "The first thing to internalise about real logs is their sheer volume. A single busy server generates a steady stream; a whole organisation generates millions of log events a day, and a large one can generate billions. Reading them all is simply impossible, and scrolling through them in order is hopeless, you would never find the few lines that matter among the overwhelming many that do not. The challenge of log analysis is not reading, it is finding.",
        "This reframes the whole task. Your job is not to review every line but to narrow, fast, to the relevant ones. That is exactly what a SIEM's search and filtering exist for, and why you used them in the last topic. The skilled analyst treats millions of logs not as a wall to read but as a database to query, asking precise questions and getting back just the relevant results.",
      ],
      examples: [
        "A large organisation can generate billions of log events a day.",
        "Reading them all, or scrolling in order, is impossible: the challenge is finding.",
        "Treat logs as a database to query, not a wall to read.",
      ],
      analogy: {
        plain: "You do not read the whole library to find one fact; you search the catalogue. Millions of logs are the same: you query, you do not read cover to cover.",
        realTerm: "searching at scale",
      },
    },
    {
      heading: "The filters that cut the mountain down",
      body: [
        "A few powerful filters do most of the work. Time is often the strongest: narrowing to the window around a suspected event cuts millions of lines to a manageable slice instantly. Entity filters, pinning to a specific user, IP address, or system, isolate just that actor's activity. Event-type filters (only failed logins, only blocked connections) focus on the kind of activity you care about. And searching for a specific indicator (a known-bad IP or file hash) jumps straight to relevant hits across the whole volume.",
        "The real skill is combining these: 'failed logins, for this account, in this two-hour window' turns billions of lines into a handful. Stacking filters to zero in is the core SIEM-search technique, and it is how an analyst moves from an overwhelming haystack to the exact needle in seconds. Learning to think 'what filters would isolate what I need?' is the habit that makes log analysis fast rather than hopeless.",
      ],
      examples: [
        "Time window: often the single strongest filter.",
        "Entity (user, IP, system) and event type isolate the relevant activity.",
        "Combine filters to zero in: 'failed logins, this account, this window'.",
      ],
    },
    {
      heading: "Matching the search to the question",
      body: [
        "Effective searching starts with a clear question, because the search is only as good as what you ask. 'Did this account have unusual logins last Tuesday?' tells you exactly what to filter (that account, login events, that day). A vague 'is anything wrong?' gives you nothing to narrow on. So the analyst's loop is: form a precise question, translate it into filters, read the results, and let what you find shape the next question. Investigation is iterative searching.",
        "A common beginner mistake is searching the wrong scope, looking at today when the incident was two weeks ago, or across everything when you know the affected system. Matching the search to the question, especially the right time window and the right entity, is what makes the difference between finding the evidence and missing it. Precise questions, translated into precise filters, are the whole game at scale, and the next topic shows how the results connect into a story.",
      ],
      examples: [
        "Start with a precise question; it tells you exactly what to filter.",
        "A vague 'is anything wrong?' gives you nothing to narrow on.",
        "Match the scope (time window, entity) to the question, or you miss the evidence.",
      ],
      analogy: {
        plain: "A good detective asks a specific question ('who entered between 9 and 10?') and checks the right footage. A vague 'find something suspicious' over every camera finds nothing.",
        realTerm: "question-driven search",
      },
    },
  ],

  glossary: [
    { term: "log volume", definition: "The sheer scale of logs (millions or billions of events a day), which makes searching, not reading, the only viable approach." },
    { term: "filter", definition: "A condition that narrows logs (by time, entity, or event type) to the relevant subset; the core tool for searching at scale." },
    { term: "pivoting", definition: "Narrowing to a specific entity (a user, IP or system) to isolate just its activity across the logs." },
    { term: "question-driven search", definition: "Forming a precise question first, then translating it into filters, the loop that makes investigation efficient." },
  ],

  seeHeading: "Finding the needle in billions",

  cases: [
    {
      org: "Log scale in practice",
      year: "current",
      headline: "Organisations generate so many logs that searching, not reading, is the only option",
      whatHappened: "In real Security Operations Centres, the volume of logs is staggering: a large organisation can generate millions or even billions of log events every day, far beyond anything a human could read. This reality shapes the entire practice of log analysis: analysts never scroll through logs, they search and filter, using time windows, entity filters (a specific user, IP or system) and event-type filters to cut the overwhelming volume down to the handful of relevant lines. The skill that defines a productive analyst is not reading endurance but the ability to ask precise questions and translate them into effective filters.",
      theMissedMeasure: "Effective search skills (and good logging and a capable SIEM to search). At scale, the ability to narrow fast is what makes investigation possible at all; without it, the evidence is there but unfindable, as good as absent.",
      theCost: "Here the value is capability: mastering search and filtering is what lets an analyst find the needle in billions of lines quickly, turning an impossible volume into answerable questions, and it is a core, demonstrable SOC skill.",
      control: "secure-configuration",
      impact: ["large organisations generate billions of log events a day", "searching and filtering, never scrolling, is the only viable approach", "precise questions plus filters find the needle"],
      source: "Public record; established SOC/SIEM practice.",
      brandColor: "#2d7d9a",
      news: { headline: "Why SOC analysts search, never scroll, through logs at scale", outlet: "SOC/SIEM practice (current)", date: "current" },
    },
  ],

  lab: {
    title: "Good search strategy?",
    intro: "Nothing to install and nothing leaves this page. For each approach to searching millions of logs, decide: does it narrow effectively, or is it a poor strategy?",
    prompts: [
      "Filter by time window, by entity (user/IP/system), by event type, by a known indicator.",
      "Scrolling everything, or searching the wrong time window, is hopeless.",
      "Combine filters to zero in fast.",
    ],
    component: LogSearchLab,
  },

  check: {
    explain: {
      prompt: "Explain why you can never read all the logs, the filters that let you search at scale, and why starting with a precise question matters.",
      modelAnswer: "You can never read all the logs because the volume is staggering: a large organisation can generate millions or even billions of log events a day, so reading them all, or scrolling through them in order, is impossible, you would never find the few lines that matter among the overwhelming many that do not. This reframes the task from reading to finding, treating logs as a database to query rather than a wall to read. The filters that let you search at scale are: time (often the strongest, narrowing to the window around a suspected event cuts millions of lines to a slice instantly), entity filters (pinning to a specific user, IP or system to isolate that actor's activity), event-type filters (only failed logins, only blocked connections), and searching for a specific indicator (a known-bad IP or file hash), and the real skill is combining these to zero in, 'failed logins, for this account, in this two-hour window' turns billions of lines into a handful. Starting with a precise question matters because the search is only as good as what you ask: a precise question ('did this account have unusual logins last Tuesday?') tells you exactly what to filter, while a vague 'is anything wrong?' gives you nothing to narrow on, and matching the scope, especially the right time window and entity, is what makes the difference between finding the evidence and missing it.",
    },
    quiz: [
      {
        q: "Why can't you just read through all the logs?",
        options: [
          "Logs are secret",
          "The volume is enormous (millions or billions a day), so you search and filter instead of reading",
          "Logs are always empty",
          "Reading logs is illegal",
        ],
        answer: 1,
        why: "At real scale, finding, not reading, is the challenge. You query logs like a database.",
      },
      {
        q: "Which is the single strongest filter in most investigations?",
        options: [
          "The colour of the log",
          "The time window around the suspected event",
          "The length of the log file",
          "The font of the entries",
        ],
        answer: 1,
        why: "Narrowing by time instantly cuts millions of lines to a manageable slice; it is usually the most powerful filter.",
      },
      {
        q: "Why start a search with a precise question?",
        options: [
          "It is not necessary",
          "A precise question tells you exactly what to filter; a vague one gives you nothing to narrow on",
          "Questions slow you down",
          "Searches work better with no goal",
        ],
        answer: 1,
        why: "The search is only as good as the question. Precise questions translate directly into effective filters.",
      },
    ],
  },

  wrap: {
    headline: "You can now find the needle in millions of logs, by searching and filtering smartly, not scrolling.",
    takeaways: [
      "Log volume is enormous, so you search and filter, never read everything.",
      "Time, entity and event-type filters, combined, cut the mountain to the relevant few.",
      "Start with a precise question; it tells you exactly what to filter, and matching the scope is crucial.",
    ],
    project: {
      name: "Write three precise questions",
      blurb: "For an imagined incident ('an account may have been compromised'), write three precise, filterable questions you would ask the logs, and note which filters each implies (time, entity, event type). Turning a vague worry into precise, searchable questions is exactly the skill that makes log analysis fast.",
    },
    ethicsNote: "Searching logs is done on your own organisation's systems, lawfully and with care for the personal data logs contain. It is targeted, purposeful investigation, within the Module 5 principles.",
  },
};

export default topic3;

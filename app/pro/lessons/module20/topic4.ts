import type { TopicManifest } from "../../learn/types";
import { MarketRealityLab } from "../../learn/conceptLabs";

/* Module 20 - Topic 4: the honest UK market and the funnel. Hype-free
 * framing: real demand exists but entry is competitive; the "millions of
 * unfilled jobs" claim is widely debunked; portfolios and persistence
 * matter. No invented specific statistics; qualitative honesty only. */
const topic4: TopicManifest = {
  id: "m20t4",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "The honest market",
  role: "Realistic expectations are a genuine advantage. Understanding the honest state of the cyber job market, demand is real but entry is competitive, protects you from both the hype and the despair, and lets you plan a persistent, effective job hunt.",
  minutes: 15,
  promise: "Get the honest truth about the cyber job market, beyond both the hype and the gloom, so you can plan a realistic, persistent route in.",
  brief: "In this lesson, we'll give you the honest picture of the cyber job market, free of both overblown hype and unhelpful gloom. We'll debunk the 'millions of unfilled jobs, walk straight in' myth, acknowledge that entry-level is genuinely competitive, and see what actually helps: a portfolio, the right certifications, networking, and persistence. Realistic expectations are not discouraging; they are what let you plan and succeed.",

  learn: [
    {
      heading: "Beyond the hype and the gloom",
      body: [
        "The cyber job market is talked about in two misleading extremes. The hype says there are millions of unfilled jobs and anyone can walk straight into a high salary. The gloom says it is impossible to break in. The honest truth is in between: there is real, ongoing demand for cyber skills, but entry-level roles are genuinely competitive, and getting your first job takes effort, a good approach, and persistence. Neither the fantasy nor the despair serves you.",
        "Knowing this matters because expectations shape strategy. If you believe the hype, you will be blindsided and discouraged by the competition for junior roles. If you believe the gloom, you may not try. The realistic view, demand is real, entry is competitive, and a smart, persistent approach works, is both accurate and empowering: it tells you the door is open but you have to work to get through it, which is exactly what this act prepares you for.",
      ],
      examples: [
        "Hype: 'millions of unfilled jobs, walk straight in.' Gloom: 'impossible to break in.'",
        "Reality: real demand, but entry-level is genuinely competitive.",
        "Realistic expectations shape a smart, persistent strategy.",
      ],
      analogy: {
        plain: "Like any attractive field, the door is open but there is a queue. Pretending there is no queue, or that the door is locked, both leave you unprepared. Knowing the truth lets you plan.",
        realTerm: "the honest market",
      },
    },
    {
      heading: "Why 'millions of unfilled jobs' is misleading",
      body: [
        "You will hear enormous figures for the global cyber 'skills gap', millions of unfilled positions. Treat these with healthy scepticism: such headline numbers are widely debated and often debunked, and they do not match the lived experience of beginners, who frequently find entry-level roles scarce and competitive, with even 'junior' positions asking for experience. The demand is real, but it is not the effortless gold rush the biggest numbers suggest, and much of it is for experienced people, not beginners.",
        "This gap between hype and reality is important to understand so you are not disillusioned. The honest framing is: yes, cyber security needs people and offers good careers; and also, getting your first role is competitive and takes a real effort, especially to stand out among other beginners. Planning for that reality, with a portfolio and persistence, is far more effective than expecting to be swept in on a tide of unfilled vacancies.",
      ],
      examples: [
        "Headline 'skills gap' figures are widely debated and often debunked.",
        "Beginners frequently find entry-level roles scarce and competitive.",
        "Much demand is for experienced people; standing out as a beginner takes effort.",
      ],
    },
    {
      heading: "What actually helps you get in",
      body: [
        "The encouraging part is that what helps is largely within your control. A portfolio of demonstrable work (Module 21) sets you apart because employers skills-test and want proof of ability. The right certifications, in order, open doors. Networking, genuinely connecting with people in the field, through communities, events and online, surfaces opportunities that are never advertised and builds the relationships that lead to jobs. And persistence matters enormously: getting a first role often takes many applications and some rejection, and those who keep going, learning and improving, are the ones who get in.",
        "None of this requires luck or connections you do not have; it requires effort applied in the right places. This course has deliberately built the foundation, understanding and a start on a portfolio. Combine that with the right certs, active networking, and dogged persistence, and the competitive-but-real market becomes navigable. The honest truth is not 'it's easy' or 'it's impossible', but 'it's achievable with the right, persistent effort', which is the most useful truth of all.",
      ],
      examples: [
        "A portfolio sets you apart (employers skills-test); the right certs open doors.",
        "Networking surfaces unadvertised opportunities and builds job-leading relationships.",
        "Persistence through many applications and some rejection is often what gets you in.",
      ],
      analogy: {
        plain: "Getting fit is neither effortless nor impossible: it is achievable with consistent, well-directed effort. Breaking into cyber is the same, and this course is your training plan.",
        realTerm: "the achievable path",
      },
    },
  ],

  glossary: [
    { term: "the skills gap", definition: "The claimed shortage of cyber professionals; headline 'millions unfilled' figures are widely debated and do not match beginners' experience." },
    { term: "the hiring funnel", definition: "The reality that getting a first role often takes many applications, with real competition, so persistence matters." },
    { term: "networking", definition: "Building genuine connections in the field (communities, events, online) that surface opportunities and lead to jobs." },
    { term: "demonstrable ability", definition: "Proof of what you can actually do (a portfolio), which sets you apart because employers skills-test." },
  ],

  seeHeading: "The market, honestly",

  cases: [
    {
      org: "The cyber job market",
      year: "current",
      headline: "Real demand, but genuinely competitive entry, not the effortless gold rush of the hype",
      whatHappened: "The honest state of the cyber job market, beyond the marketing, is that there is real, ongoing demand for cyber skills, but entry-level roles are genuinely competitive, and the giant 'millions of unfilled jobs' headlines are widely debated and often debunked, not matching beginners' lived experience of scarce, competitive junior roles that frequently ask for experience. Much of the real demand is for experienced professionals. What consistently helps beginners get in is demonstrable ability (a portfolio), the right certifications in order, active networking, and persistence through many applications, rather than being swept in on a tide of vacancies.",
      theMissedMeasure: "Realistic expectations and a smart, persistent strategy: a portfolio, the right certs, networking and persistence. Believing the hype leaves beginners blindsided; believing the gloom stops them trying. The accurate, empowering view is that entry is competitive but achievable with the right effort.",
      theCost: "Here the value is realism: understanding the honest market protects beginners from disillusionment and points their effort at what actually works, turning a competitive market into a navigable one.",
      control: "access-control",
      impact: ["real demand, but genuinely competitive entry", "'millions unfilled' is widely debunked", "portfolio, certs, networking and persistence are what help"],
      source: "Public record; honest accounts of the cyber hiring market (current).",
      brandColor: "#0b0c0c",
      news: { headline: "The honest truth about getting a first cyber security job", outlet: "Honest hiring accounts (current)", date: "current" },
    },
  ],

  lab: {
    title: "Hype or honest reality?",
    intro: "Nothing to install and nothing leaves this page. Sort each statement about the cyber job market: overblown hype, or honest reality?",
    prompts: [
      "Be sceptical of 'walk straight in' and 'six figures immediately'.",
      "Real demand, competitive entry, and what helps: portfolio, certs, networking, persistence.",
      "Realistic expectations are an advantage, not a discouragement.",
    ],
    component: MarketRealityLab,
  },

  check: {
    explain: {
      prompt: "Give the honest picture of the cyber job market, explain why 'millions of unfilled jobs' is misleading, and say what actually helps a beginner get in.",
      modelAnswer: "The honest picture of the cyber job market sits between two misleading extremes: the hype that there are millions of unfilled jobs and anyone can walk straight into a high salary, and the gloom that it is impossible to break in. The truth is that there is real, ongoing demand for cyber skills, but entry-level roles are genuinely competitive, and getting a first job takes effort, a good approach and persistence. 'Millions of unfilled jobs' is misleading because those headline 'skills gap' figures are widely debated and often debunked, and they do not match beginners' lived experience of scarce, competitive junior roles that frequently ask for experience, much of the real demand is for experienced people, not beginners, so it is not the effortless gold rush the biggest numbers suggest. What actually helps a beginner get in is largely within their control: a portfolio of demonstrable work that sets them apart because employers skills-test; the right certifications in order that open doors; networking that surfaces unadvertised opportunities and builds job-leading relationships; and persistence through many applications and some rejection. The honest, useful truth is not 'it's easy' or 'it's impossible' but 'it's achievable with the right, persistent effort', which is exactly what this course prepares you for.",
    },
    quiz: [
      {
        q: "What is the honest state of the cyber job market?",
        options: [
          "Millions of unfilled jobs; you'll walk straight in",
          "Real demand, but entry-level is genuinely competitive and takes effort and persistence",
          "Impossible to break into",
          "No jobs exist at all",
        ],
        answer: 1,
        why: "The truth is between hype and gloom: the door is open, but there is a queue, and a smart, persistent approach works.",
      },
      {
        q: "Why treat 'millions of unfilled cyber jobs' with scepticism?",
        options: [
          "Because there is no demand at all",
          "Because those headline figures are widely debated/debunked and don't match beginners' competitive reality",
          "Because all the jobs are fake",
          "Because cyber is not a real field",
        ],
        answer: 1,
        why: "Demand is real but much of it is for experienced people; beginners face genuine competition, not an effortless gold rush.",
      },
      {
        q: "What actually helps a beginner get hired?",
        options: [
          "Waiting to be discovered",
          "A portfolio, the right certs in order, networking, and persistence",
          "Only luck and connections",
          "Believing the hype",
        ],
        answer: 1,
        why: "These are largely within your control: demonstrable ability, sensible certs, genuine networking, and dogged persistence.",
      },
    ],
  },

  wrap: {
    headline: "You now know the honest market, beyond hype and gloom, and what actually works to get in.",
    takeaways: [
      "Demand is real but entry-level is genuinely competitive; neither the hype nor the gloom is accurate.",
      "'Millions of unfilled jobs' is widely debunked; much demand is for experienced people, so beginners must stand out.",
      "A portfolio, the right certs, networking and persistence, all within your control, are what help you get in.",
    ],
    project: {
      name: "Plan your job hunt",
      blurb: "Write a short, realistic job-hunt plan: your target entry role, how you'll build/finish your portfolio, which certs and when, and how you'll network (one community or event to start). A concrete, persistent plan, grounded in the honest market, is far more effective than hoping to be swept in.",
    },
    ethicsNote: "An honest understanding of the market is part of honest career planning. Represent yourself accurately to employers, and approach the job hunt with integrity and persistence; the field rewards both.",
  },
};

export default topic4;

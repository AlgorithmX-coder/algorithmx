import type { TopicManifest } from "../../learn/types";
import { ScopeConsentLab } from "../../learn/conceptLabs";

/* Module 5 - Topic 3: authorised testing, consent and scope. Case: the
 * 2019 Coalfire / Dallas County, Iowa courthouse arrests (two
 * contracted physical penetration testers were arrested mid-engagement
 * because the authorisation chain did not reach the local sheriff; the
 * criminal charges were later dropped). Public record: 2019-2020
 * reporting and the parties' own statements. */
const topic3: TopicManifest = {
  id: "m5t3",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "Authorised testing, consent and scope",
  role: "Legitimate security testing is a huge part of the industry, and it is built entirely on written permission and a clear scope. Knowing how to define and respect scope is a day-one professional skill, and getting it wrong ends careers even when you were hired to be there.",
  minutes: 17,
  promise: "Learn what turns hacking into a lawful profession, then see testers arrested mid-job because the paperwork did not reach far enough.",
  brief: "In this lesson, we'll learn the machinery that makes security testing lawful: authorisation, consent, and a written scope that says exactly what you may touch, when, and how far. Then we'll see a startling case where two professional testers, hired and contracted, were arrested in the middle of the job, because the permission did not reach everyone who needed to know.",

  learn: [
    {
      heading: "Permission is a document, not a vibe",
      body: [
        "The last two topics showed that authorisation is the line. This topic is about how professionals get it, properly. Real security testing runs on an engagement: a written agreement, signed by someone with the authority to grant it, that gives explicit permission to test specified systems. Verbal 'yeah, go ahead' is not enough; the permission has to be documented and come from the right person.",
        "This document is sometimes called the rules of engagement or authorisation to test. It is your legal cover and your professional discipline at once. Before any real test, the question is always: do I have written permission, from someone entitled to give it, for exactly what I am about to do?",
      ],
      examples: [
        "A signed contract plus a written scope: lawful permission to test what it lists.",
        "A manager's casual 'sure, have a look' with nothing in writing: not a safe basis to test.",
        "Permission from someone who does not actually own or control the system: not valid permission at all.",
      ],
      analogy: {
        plain: "A tradesperson does not start knocking down walls because a neighbour said it was probably fine. They work to a signed job sheet from the actual owner, listing exactly which walls.",
        realTerm: "rules of engagement",
      },
    },
    {
      heading: "Scope: what, where, when, and how far",
      body: [
        "Scope is the heart of it. A good scope says precisely which systems are in bounds (and, just as importantly, which are out), during what time window, and how deep you may go. Everything outside the scope is simply off-limits, no matter how tempting or how easy it looks, because your authorisation does not extend to it.",
        "Respecting scope also means limiting how far you take a finding. If you prove a flaw, you demonstrate it is real, you do not exploit it to its fullest or hoard the data behind it. Scope governs depth as much as targets. A professional who finds an open door documents it; they do not walk through and ransack the building to 'prove' it was open.",
      ],
      examples: [
        "In scope: the two web apps and test servers named in the document.",
        "Out of scope: the email server you noticed on the way, however open it looks.",
        "Scope of depth: prove the flaw exists; never exfiltrate the real customer data it exposes.",
      ],
    },
    {
      heading: "The authorisation has to reach everyone who matters",
      body: [
        "Here is the subtle failure that catches even experienced teams. It is not enough that someone authorised the test. The authorisation has to come from a party with the actual authority over the target, and the right people need to know it is happening. A permission slip from the wrong office, or one that nobody told the people on the ground about, can leave you doing something that looks exactly like a real attack.",
        "This is why professionals confirm who owns the system, get sign-off from someone genuinely entitled to give it, and make sure the defenders or local authorities who might respond are informed where appropriate. The case you are about to see is the cautionary tale: real testers, a real contract, and still arrested, because the chain of authorisation did not reach the local sheriff.",
      ],
      examples: [
        "Confirm the signer actually controls the target, not just a related department.",
        "Make sure the right people know the test is authorised, so a response is not triggered against you.",
        "When in doubt, pause and re-confirm. 'Probably authorised' is not authorised.",
      ],
      analogy: {
        plain: "Head office telling you to inspect a branch is no help if the branch manager and the local police were never told, and find a stranger prowling the building at night.",
        realTerm: "authorisation chain",
      },
    },
  ],

  glossary: [
    { term: "engagement", definition: "A formal, agreed piece of authorised security testing, governed by a contract and a written scope." },
    { term: "rules of engagement", definition: "The written agreement setting out what a tester may do: which systems, during what window, and how far they may go." },
    { term: "scope", definition: "The precise boundary of a test: which systems are in and out of bounds, the time window, and the permitted depth." },
    { term: "authorisation chain", definition: "The line of permission from someone genuinely entitled to grant it down to the test itself; a gap anywhere can make authorised-looking work unlawful." },
  ],

  seeHeading: "Hired to break in, and arrested for it",

  cases: [
    {
      org: "Coalfire (Dallas County, Iowa)",
      year: "2019",
      headline: "Professional testers were arrested mid-engagement over a gap in the authorisation chain",
      whatHappened: "Two penetration testers from the security firm Coalfire were hired by the state court administration to test the physical security of Iowa courthouses, including by attempting to get inside after hours. Doing exactly that at the Dallas County courthouse, they were caught by local law enforcement, who had not been informed and treated it as a genuine break-in. Despite carrying a contract, the two were arrested and charged. The criminal charges were eventually dropped, but only after a long, costly ordeal.",
      theMissedMeasure: "The authorisation did not reach everyone who mattered. The state court administration had engaged the testers, but the county, which had its own authority over the building, and local law enforcement were not aligned. A clear, complete authorisation chain, and a 'get out of jail' letter the on-site officers would recognise, is standard practice precisely to prevent this.",
      theCost: "Two professionals arrested and charged for doing the job they were hired to do, a damaged relationship between the parties, and a case the whole industry now cites when teaching scope and authorisation.",
      control: "access-control",
      impact: ["two contracted testers arrested mid-engagement", "a signed contract was not enough on its own", "charges later dropped, after real personal and professional cost"],
      source: "Public record; 2019-2020 reporting on the Coalfire / Dallas County incident and the parties' statements.",
      brandColor: "#e8622c",
      news: { headline: "Hired to test security, penetration testers arrested at Iowa courthouse", outlet: "Industry and mainstream reporting (2019)", date: "2019-2020" },
    },
  ],

  lab: {
    title: "Run the engagement",
    intro: "Nothing to install and nothing leaves this page. You are an authorised tester with a signed scope. Make the calls a professional makes.",
    prompts: [
      "Every choice comes back to one question: am I authorised for this, here, now?",
      "Watch for the traps: out-of-scope targets, over-proving a finding, and expired time windows.",
      "A contract is permission for what it says, and nothing more.",
    ],
    component: ScopeConsentLab,
  },

  check: {
    explain: {
      prompt: "The Coalfire testers had a signed contract and were doing exactly what they were hired to do, yet they were arrested. In your own words, explain what went wrong and how a professional prevents it.",
      modelAnswer: "The problem was the authorisation chain, not the testers' actions. They were engaged by the state court administration, but the county and the local law enforcement who actually responded were not aligned or informed, so to the officers on the ground it looked exactly like a real break-in. A professional prevents this by confirming that permission comes from a party with genuine authority over the target, making sure everyone who might respond knows the test is authorised, and carrying documentation the people on the ground will recognise. A contract alone is not enough if the authorisation does not reach everyone who matters.",
    },
    quiz: [
      {
        q: "What makes security testing lawful, as opposed to an offence?",
        options: [
          "Being highly skilled",
          "Explicit written permission, from someone entitled to give it, for a defined scope",
          "Only testing at night",
          "Reporting what you find afterwards",
        ],
        answer: 1,
        why: "Authorisation and scope are what separate a profession from a crime. Skill, timing and later reporting do not substitute for permission.",
      },
      {
        q: "Mid-test, you spot an easy flaw on a system that is not in your written scope. What do you do?",
        options: [
          "Test it; you are already authorised for the engagement",
          "Leave it, note it, and raise it with the client to consider adding to scope in writing",
          "Test it quietly and only mention it if it matters",
          "Delete the flaw to be safe",
        ],
        answer: 1,
        why: "Out of scope is out of bounds. You flag it and let the client extend the scope in writing if they choose; touching it yourself could be unauthorised access.",
      },
      {
        q: "The deeper lesson of the Coalfire case is that:",
        options: [
          "Physical testing is always illegal",
          "A contract is worthless",
          "Authorisation must come from the right authority and reach everyone who might respond, not just exist on paper",
          "Testers should never be arrested",
        ],
        answer: 2,
        why: "The gap was in the authorisation chain. Permission has to come from someone with real authority over the target and be known to those who could respond.",
      },
    ],
  },

  wrap: {
    headline: "You now know what turns the techniques in this course into a lawful profession: permission and scope, done properly.",
    takeaways: [
      "Real testing runs on an engagement: written permission, from someone entitled to give it, for a defined scope.",
      "Scope sets what, where, when and how far. Everything outside it is off-limits, and you prove findings without over-exploiting them.",
      "The authorisation chain must reach the right authority and everyone who might respond; a contract alone is not enough.",
    ],
    project: {
      name: "Write your own rules of engagement",
      blurb: "For the systems you will practise on in this course (your own machines and the in-browser labs), write a two or three line 'rules of engagement' for yourself: what you will test, that it is yours or explicitly permitted, and the limit you will not cross. It is a small habit that mirrors exactly how every professional engagement begins.",
    },
    ethicsNote: "From Act 2, you will run real attack techniques. Every one is confined to systems you own or the course's own sandboxed labs. Never point them at anything else: that is the authorisation line this whole module exists to protect.",
  },
};

export default topic3;

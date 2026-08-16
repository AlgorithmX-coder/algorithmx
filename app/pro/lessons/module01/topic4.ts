import type { TopicManifest } from "../../learn/types";
import { DefenceOrderLab } from "../../learn/conceptLabs";

/* Module 1 - Topic 4: defence in depth and least privilege. Case:
 * Maersk / NotPetya 2017 (a flat, over-trusting network let one wiper
 * spread worldwide in minutes). Public record: Maersk's own talks and
 * wide reporting, 2017-2019. */
const topic4: TopicManifest = {
  id: "m1t4",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "Defence in depth and least privilege",
  role: "As a cyber security analyst, you'll always assume something will eventually get through. These two ideas are what turn that inevitable breach into a small, contained incident instead of a company-ending one.",
  minutes: 18,
  promise: "The two ideas that limit the damage once an attacker is in, and the attack that ignored them.",
  brief: "In this lesson, we'll cover the two ideas that decide how far an attack spreads once someone is in: defence in depth and least privilege. Then you'll see the attack that seized up much of US healthcare for weeks, because neither was in place behind one weak login.",

  learn: [
    {
      heading: "No single wall holds, so you build in layers",
      body: [
        "Beginners imagine security as one strong wall around the company. Professionals assume that wall will be breached somewhere, because it always eventually is, and plan for it. That is defence in depth: multiple independent layers, so that getting past one does not hand the attacker everything.",
        "Layers span people (training), the network (segmentation, firewalls), devices (antivirus, hardening), and the data itself (encryption, access limits). If one layer fails, the next one still stands. The goal is not to be unbreachable, it is to make sure one failure is not fatal.",
      ],
      examples: [
        "A castle uses a moat, then walls, then a locked keep, not one fence.",
        "An email slips past the filter, but training means the user does not click.",
        "The user clicks, but segmentation stops the infection reaching the servers.",
      ],
      analogy: {
        plain: "Think of an onion, or a castle: moat, wall, gate, guards, locked vault. An attacker who gets over the moat still faces the wall. Depth buys you time and containment.",
        realTerm: "defence in depth",
      },
    },
    {
      heading: "Least privilege: give the minimum, and shrink the blast radius",
      body: [
        "The second idea is least privilege: every person, and every system, gets only the access it genuinely needs to do its job, and no more. A cashier does not need the keys to the safe. A web server does not need to reach the payroll database.",
        "Least privilege is powerful because it shrinks the blast radius. When an account or a machine is inevitably compromised, the attacker only inherits what that account could reach. Give everyone access to everything 'to be convenient', and one stolen login owns the company.",
      ],
      examples: [
        "A stolen cashier login can open a till, not the vault.",
        "A hacked web server can serve pages, not read staff salaries.",
        "An intern's account cannot delete the production database, because it never could.",
      ],
      analogy: {
        plain: "A hotel key card opens your room and the gym, not every other guest's room or the manager's office. If you lose it, the damage is limited to what it was ever allowed to open.",
        realTerm: "least privilege",
      },
    },
    {
      heading: "The opposite of depth: a flat, over-trusting network",
      body: [
        "The failure mode is a 'flat' network, where once you are inside, everything trusts everything else and one machine can reach all the others. It is convenient, and it is how a single infected laptop can become a company-wide disaster in minutes.",
        "The modern name for the fix is zero trust: stop trusting something just because it is 'inside', and check every access as if it came from outside. You are about to see what missing these layers cost a company that much of US healthcare relies on.",
      ],
      examples: [
        "Flat network: one infected PC can talk to every server, so malware spreads everywhere.",
        "Segmented network: the infection hits a zone and stops at the boundary.",
        "Zero trust: even 'internal' requests must prove who they are every time.",
      ],
    },
  ],

  glossary: [
    { term: "defence in depth", definition: "Using multiple independent layers of security, so getting past one does not give an attacker everything." },
    { term: "least privilege", definition: "Giving every person and system only the access it needs to do its job, so a compromise reaches as little as possible." },
    { term: "blast radius", definition: "How far the damage spreads when something is compromised. Least privilege and segmentation shrink it." },
    { term: "segmentation", definition: "Splitting a network into separate zones so a problem in one cannot freely spread to the others." },
    { term: "zero trust", definition: "The principle of never trusting a user or device just because it is 'inside' the network; every access is verified." },
  ],

  seeHeading: "When one missing lock let an attack spread",

  cases: [
    {
      org: "Change Healthcare",
      year: "2024",
      headline: "One login with no second factor, and US healthcare seized up",
      whatHappened: "In February 2024, attackers logged into a Change Healthcare remote-access portal with a stolen password. That portal had no multi-factor authentication, so the password alone was enough. Once inside, they moved across the network for days, stole data and set off ransomware. Change Healthcare handles a huge share of US medical claims and prescriptions, so the outage rippled out for weeks: pharmacies, doctors and hospitals could not bill or get paid.",
      theMissedMeasure: "No second factor on an internet-facing entry point, and too little internal segmentation or least privilege to stop one foothold from reaching everything. Depth was missing at every layer.",
      theCost: "A $22M ransom was paid, the parent company reported costs of roughly $2.9 billion, and the disruption to US healthcare payments ran for weeks. One of the most damaging attacks the sector has ever seen.",
      control: "access-control",
      impact: ["$22M ransom paid", "~$2.9B in reported costs", "weeks of US healthcare payment chaos"],
      source: "Public record; UnitedHealth Congressional testimony and 2024 reporting.",
      brandColor: "#e4002b",
      news: { headline: "Change Healthcare hack disrupts US pharmacies for weeks", outlet: "BBC News", date: "2024" },
    },
  ],

  lab: {
    title: "Build the layers",
    intro: "Defence in depth means layer after layer, so no single failure lets an attacker win. Put the defences in the order an attacker would have to beat them.",
    prompts: [
      "Use the arrows to order the defences from the outside in.",
      "Then press 'Check the order'.",
      "Aim to get all five in the right place.",
    ],
    component: DefenceOrderLab,
  },

  check: {
    explain: {
      prompt: "Using Change Healthcare, explain how defence in depth and least privilege would have changed the outcome. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "The attackers got in through one internet-facing login with no second factor, a missing preventive layer, and then moved freely across the network because there was too little segmentation and least privilege to stop them. Defence in depth would have added more layers behind that login (MFA, then internal boundaries so a foothold hits a wall), and least privilege would have meant the stolen account could reach very little. Neither would have made Change Healthcare unbreachable, but either would have turned a weeks-long, industry-wide outage into a contained incident.",
    },
    quiz: [
      {
        q: "What does 'defence in depth' mean?",
        options: [
          "Building one very strong wall",
          "Using multiple independent layers so one failure is not fatal",
          "Hiring more security staff",
          "Encrypting everything twice",
        ],
        answer: 1,
        why: "Depth assumes a layer will fail and puts more behind it, so a single breach does not hand the attacker everything.",
      },
      {
        q: "What is 'least privilege'?",
        options: [
          "Giving everyone admin access to be efficient",
          "Giving each person and system only the access it needs",
          "Removing all access from everyone",
          "Changing passwords often",
        ],
        answer: 1,
        why: "Least privilege limits what each account or system can reach, so a compromise inherits as little as possible and the blast radius stays small.",
      },
      {
        q: "Why did the Change Healthcare attack spread so far?",
        options: [
          "The attack was unstoppable by design",
          "One login with no second factor, and too little segmentation to stop the spread",
          "They had no antivirus at all",
          "It targeted their customers, not them",
        ],
        answer: 1,
        why: "A missing second factor let attackers in with just a password, and a lack of segmentation and least privilege let that one foothold reach everything. Depth at each layer would have contained it.",
      },
    ],
  },

  wrap: {
    headline: "You know the two ideas that decide whether a breach is a bad day or a catastrophe.",
    takeaways: [
      "Defence in depth: layers, because any single wall will eventually be breached.",
      "Least privilege: minimum access, so a compromise reaches as little as possible.",
      "Flat, over-trusting networks turn one infection into a company-wide disaster.",
    ],
    project: {
      name: "Find your own flat spots",
      blurb: "Think about your own accounts and devices. Where does one login or one device give access to far more than it needs? Note one place you could tighten (a separate email for banking, a guest network for smart devices). Shrinking your own blast radius is defence in depth at home.",
    },
    ethicsNote: "These design ideas are for defending systems you own or run. Testing someone else's network without permission is an offence under the Computer Misuse Act 1990.",
  },
};

export default topic4;

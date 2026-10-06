import type { TopicManifest } from "../../learn/types";
import { SocJobLab } from "../../learn/conceptLabs";

/* Module 13 - Topic 1: what a Security Operations Centre is. Case:
 * Marriott / Starwood, disclosed 2018 (attackers had access to the
 * Starwood guest reservation system for around four years before
 * discovery, exposing data on hundreds of millions of guests). Public
 * record: Marriott disclosures, UK ICO action, and 2018-2020 reporting. */
const topic1: TopicManifest = {
  id: "m13t1",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "What a SOC actually is",
  role: "The Security Operations Centre is where the most common first job in cyber security lives. Understanding what a SOC is, and why continuous monitoring matters so much, is the foundation for the career on-ramp this course is building toward.",
  minutes: 15,
  promise: "Learn what a SOC is and why 'being able to see' is half of defence, then meet the breach that went unnoticed for four years.",
  brief: "In this lesson, we'll look at the Security Operations Centre, the SOC: the team (and the most common entry role) responsible for watching for and responding to threats. We'll see why continuous monitoring is so vital, that you cannot respond to what you cannot see, and why the time an attacker spends undetected is where the real damage happens. Then we'll see the Marriott breach, which went unnoticed for around four years.",

  learn: [
    {
      heading: "The team that watches and responds",
      body: [
        "A Security Operations Centre, or SOC, is the team responsible for continuously monitoring an organisation for signs of attack and responding when something is found. Hardening (Module 12) builds strong defences; the SOC is the eyes and hands that watch those defences and act when, inevitably, something gets through or looks wrong. It is defence in motion, not just in design.",
        "Crucially for you, the SOC is where the most common entry-level job in cyber security sits: the SOC analyst. It is the role this course has quietly been preparing you for, triaging alerts, investigating, and escalating. Understanding the SOC is understanding the job most beginners actually get, which is why this whole module is so career-relevant.",
      ],
      examples: [
        "The SOC continuously monitors for signs of attack and responds.",
        "Hardening builds the defences; the SOC watches them and acts.",
        "The SOC analyst is the most common entry-level cyber role.",
      ],
      analogy: {
        plain: "If hardening is building strong doors and locks, the SOC is the security team watching the cameras and responding when an alarm goes off.",
        realTerm: "Security Operations Centre",
      },
    },
    {
      heading: "You cannot respond to what you cannot see",
      body: [
        "The core reason a SOC exists is simple: you cannot respond to an attack you cannot see. Prevention will sometimes fail (assume breach), so you need the ability to detect that something is wrong, ideally early. Monitoring, through logs, alerts and tools, is what gives an organisation eyes. Without it, an attacker can operate freely and invisibly, and you only learn of the breach when the damage is already done, or when someone else tells you.",
        "This is why 'visibility' is such a prized word in defence. The faster you can see an attack, the faster you can stop it, and the less damage it does. A SOC's whole purpose is to shrink the time between an attacker getting in and a defender noticing, which, as you will see, is often shockingly long when no one is watching.",
      ],
      examples: [
        "Prevention sometimes fails, so you need to detect what gets through.",
        "Monitoring (logs, alerts, tools) is what gives an organisation eyes.",
        "Faster detection means faster response and less damage.",
      ],
    },
    {
      heading: "Dwell time: where the damage lives",
      body: [
        "The time an attacker spends inside undetected is called dwell time, and it is where much of a breach's harm accumulates. A few minutes of access is a minor incident; months or years of undetected access is a catastrophe, because the attacker has all the time they need to spread, steal and entrench. Reducing dwell time, through monitoring and fast detection, is one of the most valuable things a SOC does.",
        "When there is no effective monitoring, dwell times can be astonishing, sometimes years, because nobody is looking. The breach you are about to see is a stark example: attackers inside a major company's systems for around four years before anyone noticed. It is the clearest possible argument for why a SOC, and the visibility it provides, is essential, and why the analyst's watching role matters so much.",
      ],
      examples: [
        "Dwell time = how long an attacker operates undetected inside.",
        "Minutes is minor; months or years is catastrophic.",
        "A SOC's monitoring exists to shrink dwell time dramatically.",
      ],
      analogy: {
        plain: "A burglar in and out in two minutes grabs little; one who lives undetected in your attic for a year takes everything and makes themselves at home. Dwell time is everything.",
        realTerm: "dwell time",
      },
    },
  ],

  glossary: [
    { term: "Security Operations Centre (SOC)", definition: "The team responsible for continuously monitoring an organisation for threats and responding to them." },
    { term: "SOC analyst", definition: "The person who monitors, triages and investigates security alerts; the most common entry-level role in cyber security." },
    { term: "visibility", definition: "The ability to see what is happening across systems (through logs, alerts and tools), without which you cannot detect or respond to attacks." },
    { term: "dwell time", definition: "How long an attacker operates inside undetected; the longer it is, the greater the damage. Reducing it is a core SOC goal." },
  ],

  seeHeading: "The breach no one saw for four years",

  cases: [
    {
      org: "Marriott / Starwood",
      year: "2018",
      headline: "Attackers were inside for around four years before anyone noticed",
      whatHappened: "In 2018, Marriott disclosed a massive breach of the Starwood guest reservation system (Starwood had been acquired by Marriott). Investigation indicated that attackers had had access since around 2014, roughly four years of undetected presence, during which the personal data of hundreds of millions of guests, including, for many, passport and other sensitive details, was exposed. The defining feature was not just the scale but the dwell time: the intrusion went unnoticed for years.",
      theMissedMeasure: "Effective monitoring and detection, exactly what a SOC provides. An attacker able to operate for around four years without being seen points to a profound lack of visibility. Had the activity been detected early, the dwell time, and the damage, would have been a tiny fraction.",
      theCost: "The exposure of data on hundreds of millions of guests, major regulatory penalties (including a significant UK ICO fine), and a defining lesson in why visibility and fast detection, the SOC's purpose, matter as much as prevention.",
      control: "access-control",
      impact: ["~4 years of undetected attacker access", "hundreds of millions of guests' data exposed", "a textbook case of catastrophic dwell time"],
      source: "Public record; Marriott disclosures, UK ICO action, and 2018-2020 reporting.",
      brandColor: "#a1272e",
      news: { headline: "Marriott hack: data of up to 500 million guests exposed over four years", outlet: "BBC News", date: "2018" },
    },
  ],

  lab: {
    title: "Is it a SOC's job?",
    intro: "Nothing to install and nothing leaves this page. For each activity, decide: is it part of what a SOC does, or not?",
    prompts: [
      "A SOC watches for and responds to threats.",
      "Monitoring, triage, investigation, escalation: all SOC work.",
      "If it is not about detecting or responding to threats, it is not the SOC's job.",
    ],
    component: SocJobLab,
  },

  check: {
    explain: {
      prompt: "The Marriott breach went undetected for around four years. Explain what a SOC is, why 'you cannot respond to what you cannot see', and how the concept of dwell time makes this case so instructive.",
      modelAnswer: "A SOC, a Security Operations Centre, is the team responsible for continuously monitoring an organisation for signs of attack and responding when something is found; the SOC analyst who does the front-line monitoring and triage is the most common entry-level role in the field. Its core reason to exist is that you cannot respond to an attack you cannot see: prevention sometimes fails, so you need visibility, through logs, alerts and tools, to detect what gets through, ideally early. Dwell time, the length of time an attacker operates undetected, is where much of a breach's damage accumulates: minutes is minor, but months or years is catastrophic because the attacker has all the time they need to spread, steal and entrench. Marriott is so instructive because the attackers were inside for around four years, exposing data on hundreds of millions of guests, which points to a profound lack of monitoring. Had a SOC detected the activity early, the dwell time, and the damage, would have been a tiny fraction. It is the clearest argument for why visibility and fast detection matter as much as prevention.",
    },
    quiz: [
      {
        q: "What is a SOC?",
        options: [
          "A type of firewall",
          "The team that continuously monitors an organisation for threats and responds to them",
          "A kind of malware",
          "A compliance certificate",
        ],
        answer: 1,
        why: "The Security Operations Centre is defence in motion: the eyes and hands that watch and respond. The SOC analyst is the common entry role.",
      },
      {
        q: "Why is monitoring (visibility) so essential?",
        options: [
          "It makes systems faster",
          "Because you cannot respond to an attack you cannot see; prevention sometimes fails, so you must be able to detect",
          "It is legally required to look pretty",
          "It replaces the need for any prevention",
        ],
        answer: 1,
        why: "Assume breach: you need eyes to detect what gets through, so you can respond before the damage mounts.",
      },
      {
        q: "What made the Marriott breach so severe, beyond its scale?",
        options: [
          "It was a denial-of-service attack",
          "The dwell time: attackers were inside undetected for around four years",
          "It only lasted a few minutes",
          "No data was exposed",
        ],
        answer: 1,
        why: "Years of undetected access let the attackers operate freely. Catastrophic dwell time is exactly what a SOC's monitoring exists to prevent.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the SOC, the home of the most common cyber job, and why visibility is half of defence.",
    takeaways: [
      "A SOC continuously monitors for threats and responds; the SOC analyst is the common entry-level role.",
      "You cannot respond to what you cannot see, so visibility (logs, alerts, tools) is essential.",
      "Dwell time, how long an attacker goes undetected, is where damage accumulates; shrinking it is a core SOC goal.",
    ],
    project: {
      name: "Picture the watchtower",
      blurb: "Write a few lines describing, in your own words, why an organisation with excellent locks (hardening) still needs a SOC (monitoring and response). Use the Marriott dwell-time example. Being able to articulate why visibility matters, not just prevention, is exactly the understanding a SOC interview looks for.",
    },
    ethicsNote: "Monitoring is done on your own organisation's systems, with proper authority and respect for privacy and law. This is defensive work; the next topics explore the people and tools that make it happen.",
  },
};

export default topic1;

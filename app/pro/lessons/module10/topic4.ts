import type { TopicManifest } from "../../learn/types";
import { DdosDefenceLab } from "../../learn/conceptLabs";

/* Module 10 - Topic 4: denial of service (DoS and DDoS). Case: the
 * February 2018 GitHub DDoS (a ~1.35 Tbps memcached-amplification
 * attack, among the largest recorded at the time, mitigated within
 * minutes via a DDoS-protection service). Public record: GitHub's own
 * engineering write-up and 2018 reporting. */
const topic4: TopicManifest = {
  id: "m10t4",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Denial of service",
  role: "Denial-of-service attacks target availability, the 'A' in the CIA triad, and can take an organisation offline without stealing a thing. Knowing how they work, and that specialised defences exist, lets an analyst respond calmly instead of panicking when the traffic surges.",
  minutes: 15,
  promise: "Understand how attackers drown a service in traffic, then see one of the largest floods ever recorded shrugged off in minutes.",
  brief: "In this lesson, we'll look at denial-of-service attacks: not stealing or altering data, but simply making a service unavailable by overwhelming it. We'll see how a distributed attack (DDoS) marshals huge volumes of traffic, often amplified, and why it attacks availability specifically. Then we'll study the record-breaking 2018 GitHub attack, and the reassuring lesson that even enormous floods can be defended against.",

  learn: [
    {
      heading: "Drowning a service: attacking availability",
      visual: { id: "packet-path", mode: "flood" },
      body: [
        "A denial-of-service attack does not try to break in or steal; it tries to make a service unavailable to its real users. The simplest way is to overwhelm it: send so many requests or so much traffic that the target cannot keep up, and legitimate visitors are crowded out. The data is safe, nothing is stolen, but the service is effectively down, which for many businesses is damage enough.",
        "This maps directly onto the CIA triad from Module 1. Confidentiality and integrity attacks go after your secrets and your data's correctness; a denial-of-service attack goes purely after availability. Recognising which pillar is under attack tells you immediately what kind of incident you have, and that a DDoS calls for very different defences than, say, a data breach.",
      ],
      examples: [
        "The goal is unavailability, not theft: crowd out real users with junk traffic.",
        "It targets the 'A' of CIA, availability, specifically.",
        "Nothing is stolen, but a down service can still be hugely costly.",
      ],
      analogy: {
        plain: "Jamming a shop's doorway with a crowd of fake customers so real ones cannot get in. Nothing is stolen; the shop just cannot trade.",
        realTerm: "denial of service",
      },
    },
    {
      heading: "Distributed and amplified: scaling the flood",
      body: [
        "A single source is easy to block, so serious attacks are distributed: a DDoS (distributed denial of service) uses many sources at once, often a botnet of compromised machines (recall Mirai from Module 2), so the flood comes from everywhere and cannot be shut off by blocking one address. This is what makes DDoS hard: the traffic is vast and spread across countless origins.",
        "Attackers also amplify. Certain internet services can be tricked into sending a large response to a small, spoofed request, so an attacker with modest resources can generate an enormous flood by bouncing traffic off these services toward the victim. Amplification is how record-breaking volumes are reached, and it is why the 2018 GitHub attack was so large despite the attacker's limited own capacity.",
      ],
      examples: [
        "Distributed: many sources (often a botnet) so you cannot just block one.",
        "Amplification: a small spoofed request triggers a huge response aimed at the victim.",
        "Together they produce the record-breaking floods that make headlines.",
      ],
    },
    {
      heading: "The reassuring part: it can be defended",
      body: [
        "DDoS sounds unstoppable, but there are strong, specialised defences, and knowing they exist changes DDoS from a nightmare into a managed risk. Dedicated DDoS-protection or 'scrubbing' services sit in front of a target, absorbing and filtering out flood traffic before it arrives. Content delivery networks spread load across vast global capacity, so a target is far harder to overwhelm. Rate limiting and filtering drop obviously bad traffic. And having spare capacity plus a rehearsed plan means a surge is absorbed, not fatal.",
        "The key insight is that the defence must match the attack: none of these would stop a data theft, and encryption or phishing training does nothing against a flood. A DDoS is an availability problem, so you defend availability, with capacity, distribution, and filtering. The GitHub case is the perfect, almost anticlimactic, illustration: a record flood, met by the right defence, and over in minutes.",
      ],
      examples: [
        "Scrubbing services absorb and filter the flood before it reaches you.",
        "CDNs distribute load across huge global capacity, so you are hard to swamp.",
        "The defence must fit the attack: encryption and phishing training do not stop floods.",
      ],
      analogy: {
        plain: "A floodplain, levees and overflow channels do not stop the rain, but they absorb and divert the water so the town stays dry. DDoS defence absorbs and diverts the traffic flood.",
        realTerm: "DDoS mitigation",
      },
    },
  ],

  glossary: [
    { term: "denial of service (DoS)", definition: "An attack that makes a service unavailable to real users, typically by overwhelming it, without stealing or altering data." },
    { term: "DDoS", definition: "Distributed denial of service: a flood from many sources at once (often a botnet), so it cannot be stopped by blocking one address." },
    { term: "amplification", definition: "Tricking internet services into sending large responses to small spoofed requests, so a modest attacker generates an enormous flood." },
    { term: "scrubbing service", definition: "A defence that sits in front of a target, absorbing and filtering out flood traffic before it reaches the real systems." },
  ],

  seeHeading: "A record flood, over in minutes",

  cases: [
    {
      org: "GitHub",
      year: "2018",
      headline: "One of the largest floods ever recorded was absorbed and mitigated within minutes",
      whatHappened: "In February 2018, GitHub was hit by a distributed denial-of-service attack that peaked at around 1.35 terabits per second, among the largest ever recorded at the time. The attack used amplification: attackers bounced traffic off misconfigured internet services (a technique called memcached amplification) to turn modest requests into a colossal flood aimed at GitHub. Because GitHub used a DDoS-protection service, the flood was rerouted through scrubbing infrastructure that filtered it out, and the disruption lasted only a matter of minutes.",
      theMissedMeasure: "On the internet's side, the amplification relied on services that were exposed and misconfigured; closing those reduces the ammunition available to attackers. On the defender's side, the case shows the right measure working: a DDoS-protection service with the capacity to absorb and scrub even a record flood.",
      theCost: "Remarkably little, which is the point. Despite being one of the biggest attacks ever seen, the right defences limited the impact to minutes of disruption, proving that even extreme DDoS is a manageable risk with the proper mitigation in place.",
      control: "firewalls",
      impact: ["~1.35 Tbps, among the largest DDoS recorded at the time", "used memcached amplification", "mitigated in minutes by a DDoS-protection service"],
      source: "Public record; GitHub's own engineering write-up and 2018 reporting.",
      brandColor: "#24292e",
      news: { headline: "GitHub survived the biggest DDoS attack ever recorded", outlet: "Security and mainstream reporting (2018)", date: "February 2018" },
    },
  ],

  lab: {
    title: "What helps against a flood?",
    intro: "Nothing to install and nothing leaves this page. A DDoS attacks availability. For each measure, decide: does it help against DDoS, or address a different problem entirely?",
    prompts: [
      "DDoS is about volume and availability, not secrecy.",
      "Capacity, distribution and filtering help; encryption and phishing training address other problems.",
      "Matching the defence to the attack is the whole skill here.",
    ],
    component: DdosDefenceLab,
  },

  check: {
    explain: {
      prompt: "GitHub was hit by one of the largest DDoS attacks ever recorded, yet it was over in minutes. Explain what a DDoS attacks, how amplification makes such floods possible, and why the right defence is specific to availability.",
      modelAnswer: "A DDoS attacks availability (the 'A' of the CIA triad): it overwhelms a service with traffic so real users cannot get through, without stealing or altering anything. 'Distributed' means the flood comes from many sources at once, often a botnet, so you cannot stop it by blocking one address. Amplification makes record floods possible by bouncing small, spoofed requests off misconfigured internet services that send back huge responses aimed at the victim, so a modest attacker produces a colossal flood, as in the memcached attack on GitHub. The defence must match the attack: because it is an availability problem, you defend availability, with DDoS-protection/scrubbing services that absorb and filter the flood, CDNs that distribute load, and rate limiting. GitHub shrugged it off in minutes precisely because it had that availability-specific mitigation in place; encryption or phishing training would have done nothing.",
    },
    quiz: [
      {
        q: "What does a denial-of-service attack target?",
        options: [
          "Confidentiality: it steals secrets",
          "Availability: it makes a service unavailable to real users, without stealing data",
          "Integrity: it alters data",
          "Physical hardware only",
        ],
        answer: 1,
        why: "A DoS/DDoS goes purely after availability, the 'A' of CIA. Nothing is stolen; the service is simply overwhelmed.",
      },
      {
        q: "Why is a DDoS harder to stop than a simple DoS from one machine?",
        options: [
          "It is not harder",
          "It is distributed across many sources (often a botnet), so you cannot just block one address",
          "It uses encryption",
          "It only happens at night",
        ],
        answer: 1,
        why: "The flood comes from everywhere at once, and amplification scales it further, which is why dedicated mitigation is needed.",
      },
      {
        q: "The GitHub case shows that against DDoS, the right defence is:",
        options: [
          "Encrypting the database",
          "Availability-specific mitigation: scrubbing services, CDNs and filtering that absorb and divert the flood",
          "Phishing-awareness training",
          "Nothing works; you just wait",
        ],
        answer: 1,
        why: "Defence must match the attack. Record floods are survivable in minutes with proper DDoS mitigation; unrelated controls do nothing.",
      },
    ],
  },

  wrap: {
    headline: "You now understand denial-of-service attacks, and that even record floods are a manageable risk with the right defence.",
    takeaways: [
      "DoS/DDoS attacks availability: overwhelming a service so real users are crowded out, without stealing anything.",
      "Distributed sources and amplification produce the vast, record-breaking floods that make DDoS hard.",
      "The defence must fit the attack: scrubbing services, CDNs and filtering defend availability, as GitHub's minutes-long recovery showed.",
    ],
    project: {
      name: "Match attack to defence",
      blurb: "Write a short note contrasting a DDoS with a data breach: what each attacks (which CIA pillar), and what defends each. Being able to say 'this is an availability attack, so we need scrubbing and capacity, not encryption' is exactly the clear thinking an incident needs under pressure.",
    },
    ethicsNote: "Launching or paying for a denial-of-service attack is a serious offence under the Computer Misuse Act (impairing a computer's operation, Module 5). DoS/DDoS is studied here only to recognise and defend against it.",
  },
};

export default topic4;

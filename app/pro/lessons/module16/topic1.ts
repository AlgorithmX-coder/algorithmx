import type { TopicManifest } from "../../learn/types";
import { IrLifecycleLab } from "../../learn/conceptLabs";

/* Module 16 - Topic 1: the incident-response lifecycle. Case:
 * Maersk / NotPetya, 2017, seen from the response-and-recovery angle
 * (the shipping giant rebuilt a vast IT estate in around ten days after
 * NotPetya devastated it). Public record: Maersk's own accounts and
 * 2017-2018 reporting. */
const topic1: TopicManifest = {
  id: "m16t1",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "The incident-response lifecycle",
  role: "When prevention and detection have done their part, incident response is what limits the damage and gets the organisation back on its feet. Knowing the response lifecycle, and that it begins long before any incident, is essential for any defensive role, and a frequent interview topic.",
  minutes: 16,
  promise: "Learn the stages of responding to an incident, and why preparation comes first, then see a shipping giant rebuild its entire IT in ten days.",
  brief: "In this lesson, we'll learn the incident-response lifecycle: the recognised stages of handling an incident, from preparation (before anything happens) through identification, containment, eradication and recovery, to lessons learned. We'll see that response is a process you prepare for, not improvise, and that it is a cycle. Then we'll see Maersk's extraordinary recovery from NotPetya, one of the most dramatic incident responses on record.",

  learn: [
    {
      heading: "Response is a lifecycle, and it starts before the incident",
      body: [
        "Incident response follows a recognised lifecycle, commonly described as: preparation, identification, containment, eradication, recovery, and lessons learned. The single most important thing to grasp is that it begins with preparation, before any incident. The plans, tools, contacts and training must be ready in advance, because the middle of a crisis is the worst time to be working out who to call or what to do.",
        "The stages then flow: identify (confirm an incident is really happening and its scope), contain (limit the damage and stop the spread), eradicate (remove the threat fully), recover (restore to normal, safely), and lessons learned (review and improve). And it is a cycle: lessons learned feed back into preparation, so each incident makes you better prepared for the next. Response is a practised process, not a panicked scramble.",
      ],
      examples: [
        "Prepare (before anything), identify, contain, eradicate, recover, learn.",
        "Preparation first: plans, tools, contacts and training ready in advance.",
        "It is a cycle: lessons learned feed back into better preparation.",
      ],
      analogy: {
        plain: "Like a fire drill and fire plan: you prepare and practise before any fire, so that when one happens, you contain it, put it out, recover, and review, calmly, not in panic.",
        realTerm: "the IR lifecycle",
      },
    },
    {
      heading: "Preparation is what makes the rest possible",
      body: [
        "It is worth dwelling on preparation, because it is both the most important stage and the most neglected. Preparation means having an incident-response plan, knowing who does what and who to contact (internally and externally), having the tools and access ready, keeping good logs (so you can investigate), having tested backups (so you can recover), and practising, so the team is not meeting the process for the first time during a real crisis.",
        "An organisation that has prepared can respond in hours; one that has not can flounder for days or weeks, making costly mistakes under pressure. Preparation is unglamorous and easy to defer, which is exactly why it separates organisations that weather an incident from those it overwhelms. Everything you learned in Act 3, hardening, monitoring, detection, plus tested backups, is really preparation for the day something gets through.",
      ],
      examples: [
        "A plan, clear roles and contacts, ready tools and access.",
        "Good logs to investigate, tested backups to recover, and practice.",
        "Prepared organisations respond in hours; unprepared ones flounder for weeks.",
      ],
    },
    {
      heading: "Recovery, and coming back stronger",
      body: [
        "The later stages, recovery and lessons learned, decide how well an organisation comes out the other side. Recovery is restoring systems to normal safely, and crucially confirming the threat is truly gone before reconnecting, not rushing back only to be re-compromised. It leans heavily on tested backups and a clear understanding of what was affected. Done well, even a severe incident becomes survivable.",
        "Then lessons learned turns pain into improvement: a blameless review of what happened and how to do better, feeding concrete fixes back into preparation. The case you are about to see is a staggering example of recovery: Maersk, devastated by NotPetya, rebuilt an enormous IT estate in around ten days through a heroic, well-organised response, a vivid demonstration that how you respond and recover can determine whether an incident is a catastrophe or merely a very bad week.",
      ],
      examples: [
        "Recovery: restore safely, and confirm the threat is gone before reconnecting.",
        "It leans on tested backups and knowing exactly what was affected.",
        "Lessons learned turns the incident into concrete improvements.",
      ],
      analogy: {
        plain: "After a flood, you do not just pump the water out; you make sure the leak is fixed before you refurnish, then you review how to flood-proof for next time.",
        realTerm: "recovery and lessons learned",
      },
    },
  ],

  glossary: [
    { term: "incident response (IR)", definition: "The organised process of handling a security incident to limit damage and recover, following a recognised lifecycle." },
    { term: "IR lifecycle", definition: "The stages of response: preparation, identification, containment, eradication, recovery, and lessons learned, a repeating cycle." },
    { term: "preparation", definition: "The first and most important IR stage: having plans, roles, tools, logs, tested backups and practice ready before any incident." },
    { term: "lessons learned", definition: "The final IR stage: a blameless review that turns the incident into concrete improvements, feeding back into preparation." },
  ],

  seeHeading: "Rebuilding an entire IT estate in ten days",

  cases: [
    {
      org: "Maersk (NotPetya response)",
      year: "2017",
      headline: "A shipping giant rebuilt a vast IT estate in around ten days after a devastating attack",
      whatHappened: "When NotPetya struck in 2017 (the destructive wiper you met in Module 8), it devastated the shipping giant Maersk, reportedly knocking out thousands of servers and tens of thousands of computers and halting operations at ports worldwide. What became legendary was the response and recovery: through an enormous, well-organised effort, Maersk rebuilt much of its IT estate, reportedly thousands of servers and tens of thousands of PCs, in around ten days, aided in part by a chance offline copy of a critical system that survived. It is one of the most dramatic incident recoveries on record.",
      theMissedMeasure: "NotPetya exploited preventable gaps (patching, segmentation, as covered earlier). But this topic's lesson is the response: the scale and speed of Maersk's recovery showed what organised incident response and recovery can achieve, and also how much easier it would have been with fuller preparation (the chance survival of one offline copy was pivotal).",
      theCost: "Enormous disruption and cost (NotPetya caused billions globally), but Maersk's response turned a potentially terminal catastrophe into a survivable, if brutal, recovery, a defining example of why how you respond and recover matters as much as prevention.",
      control: "patching",
      impact: ["thousands of servers and tens of thousands of PCs rebuilt", "recovery in around ten days through organised response", "a chance offline backup proved pivotal"],
      source: "Public record; Maersk's own accounts and 2017-2018 reporting.",
      brandColor: "#42b0d5",
      news: { headline: "How Maersk recovered its IT from the NotPetya cyberattack", outlet: "Mainstream and security reporting (2017-2018)", date: "2017-2018" },
    },
  ],

  lab: {
    title: "Order the lifecycle",
    intro: "Nothing to install and nothing leaves this page. Put the stages of incident response into the order they happen.",
    prompts: [
      "Remember: preparation comes first, before any incident.",
      "Identify, contain, eradicate, recover, then learn.",
      "It is a cycle: lessons learned feed back into preparation.",
    ],
    component: IrLifecycleLab,
  },

  check: {
    explain: {
      prompt: "Describe the incident-response lifecycle, explain why preparation is the most important stage, and how Maersk's NotPetya recovery illustrates the value of good response.",
      modelAnswer: "The incident-response lifecycle is a recognised set of stages: preparation (before anything happens), identification (confirm an incident and its scope), containment (limit the damage and stop the spread), eradication (remove the threat fully), recovery (restore to normal safely, confirming the threat is gone), and lessons learned (a blameless review that improves things), and it is a cycle because lessons learned feed back into preparation. Preparation is the most important stage because the middle of a crisis is the worst time to work out who to call or what to do: having a plan, clear roles and contacts, ready tools and access, good logs, tested backups, and practice is what lets an organisation respond in hours rather than flounder for weeks. Maersk's NotPetya recovery illustrates the value of good response: devastated by the wiper, it rebuilt thousands of servers and tens of thousands of PCs in around ten days through an enormous, well-organised effort, turning a potentially terminal catastrophe into a survivable recovery, though the pivotal role of one chance offline backup also shows how much fuller preparation would have helped. It demonstrates that how you respond and recover can determine whether an incident is a catastrophe or merely a very bad week.",
    },
    quiz: [
      {
        q: "What is the FIRST stage of the incident-response lifecycle?",
        options: [
          "Containment",
          "Preparation, done before any incident happens",
          "Recovery",
          "Eradication",
        ],
        answer: 1,
        why: "Preparation comes first: plans, roles, tools, logs, backups and practice must be ready before a crisis, not improvised during one.",
      },
      {
        q: "Why is the IR lifecycle described as a cycle?",
        options: [
          "Because incidents repeat on a schedule",
          "Because lessons learned feed back into preparation, making you better prepared for the next incident",
          "Because you do the stages in a random order",
          "It is not a cycle",
        ],
        answer: 1,
        why: "Each incident's lessons improve preparation, so the organisation gets stronger over time.",
      },
      {
        q: "What does Maersk's NotPetya recovery best illustrate?",
        options: [
          "That recovery is impossible after a serious attack",
          "That organised incident response and recovery can turn a catastrophe into a survivable event",
          "That preparation does not matter",
          "That backups are useless",
        ],
        answer: 1,
        why: "Rebuilding a vast IT estate in around ten days shows how much good response and recovery can achieve, and how pivotal preparation (a surviving backup) is.",
      },
    ],
  },

  wrap: {
    headline: "You now know the incident-response lifecycle, and that good response begins long before any incident.",
    takeaways: [
      "IR follows a lifecycle: prepare, identify, contain, eradicate, recover, learn, and it is a cycle.",
      "Preparation is the most important and most neglected stage: plans, roles, logs, tested backups and practice.",
      "Recovery and lessons learned decide how well you come out, Maersk's ten-day rebuild shows what good response achieves.",
    ],
    project: {
      name: "Draft a mini IR plan",
      blurb: "For yourself or a small group, write a one-page incident-response plan: who to contact, what to do first if a device is compromised, where backups are, and how you would recover. Having even a simple plan ready, before you need it, is exactly the preparation this topic is about, and a great portfolio artefact.",
    },
    ethicsNote: "Incident response is performed within your organisation's authority and, where relevant, with legal and regulatory obligations (like breach notification, Module 5). It is the constructive work of limiting harm and recovering.",
  },
};

export default topic1;

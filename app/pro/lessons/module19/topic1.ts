import type { TopicManifest } from "../../learn/types";
import { BcDrLab } from "../../learn/conceptLabs";

/* Module 19 - Topic 1: business continuity and disaster recovery. Case:
 * the OVHcloud Strasbourg data-centre fire, March 2021 (a fire destroyed
 * a data centre; customers who had no offsite backups or DR lost data).
 * Public record: OVHcloud statements and 2021 reporting. */
const topic1: TopicManifest = {
  id: "m19t1",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "Continuity & disaster recovery",
  role: "Resilience, the ability to survive and recover from the bad day, is a core part of security and a growing specialism. Understanding business continuity and disaster recovery, and the difference between them, is essential for any role that cares about keeping an organisation running.",
  minutes: 15,
  promise: "Learn how organisations survive disasters, and the difference between keeping running and recovering, then see a data-centre fire destroy data that had nowhere else to live.",
  brief: "In this lesson, we'll look at resilience: planning to survive and recover from disruptions, whether a cyber attack, a fire, or a flood. We'll distinguish business continuity (keeping the business running, or running in a reduced way, through a disruption) from disaster recovery (restoring the IT systems afterwards), and see why both matter. Then we'll see a data-centre fire that destroyed customers' data, because they had assumed it was safe.",

  learn: [
    {
      heading: "Resilience: planning to survive the bad day",
      body: [
        "However good your prevention, detection and response, some disruptions will happen: a successful attack, hardware failure, a fire, a flood, a supplier outage. Resilience is planning, in advance, to survive and recover from these, so a disruption is a setback rather than an extinction event. It is the security equivalent of 'hope for the best, prepare for the worst', and it is why backups, continuity plans and recovery testing matter so much.",
        "Resilience also broadens your view beyond cyber attacks. Many of the worst disruptions are not attacks at all, a data centre catches fire, a key supplier fails, a region loses power. A resilient organisation plans for the impact (we lost our systems / our site / our data) regardless of the cause. This all-hazards thinking is a hallmark of mature security and continuity planning.",
      ],
      examples: [
        "Some disruptions will happen: attacks, hardware failure, fire, flood, outages.",
        "Resilience plans in advance to survive and recover, so it is a setback, not extinction.",
        "Plan for the impact (lost systems/site/data) regardless of the cause.",
      ],
      analogy: {
        plain: "You cannot prevent every storm, but you can build a house that withstands them and have a plan if the roof goes. Resilience is that preparation for the inevitable bad day.",
        realTerm: "resilience",
      },
    },
    {
      heading: "Continuity vs recovery: two different jobs",
      body: [
        "Two related disciplines handle resilience, and the difference matters. Business continuity is about keeping the business running, or running in a reduced way, through a disruption: if the systems are down, how do staff keep serving customers, which functions must keep going no matter what, what are the manual or alternative workarounds? It is about the business operating despite the problem. Disaster recovery is the more technical job of restoring the IT systems afterwards: rebuilding servers, restoring data, bringing services back online.",
        "You need both. Disaster recovery brings the technology back, but that can take time, and in the meantime business continuity keeps the organisation alive. A business that can keep taking orders on paper while its systems are rebuilt survives; one that simply stops, waiting for IT, may not. Continuity is 'keep operating'; recovery is 'restore the systems'. Together they are how an organisation weathers a disruption.",
      ],
      examples: [
        "Business continuity: keep the business operating through the disruption.",
        "Disaster recovery: restore the IT systems afterwards.",
        "You need both: recovery takes time, continuity keeps you alive meanwhile.",
      ],
    },
    {
      heading: "Assuming 'it's safe' is how data is lost",
      body: [
        "A dangerous and common failure is assuming your data and systems are safe without actually ensuring they can survive a disaster. People assume a provider, a server, or a single location will always be there, and so keep no independent copy or recovery plan. Then the disaster, often a mundane physical one rather than a hacker, destroys both the systems and the only copy of the data, and there is no way back.",
        "This is why resilience must be deliberate, not assumed. You confirm that your critical data exists somewhere a single disaster cannot reach (the backup rules in the next topic), and that you have a plan to recover and keep running. The case you are about to see is a sobering example: a data-centre fire destroyed systems and data, and customers who had assumed their data was safe, with no offsite backup, simply lost it. Resilience is what you wish you had set up before the bad day, not after.",
      ],
      examples: [
        "People assume a provider, server or location will always be there, and keep no independent copy.",
        "A mundane disaster (often not a hacker) then destroys both systems and the only data copy.",
        "Resilience must be deliberate: ensure data survives a single disaster, and plan to recover.",
      ],
      analogy: {
        plain: "Keeping your only copy of priceless photos on one phone, assuming it is fine, until the phone is lost. Resilience is the second copy, somewhere safe, you set up beforehand.",
        realTerm: "don't assume, ensure",
      },
    },
  ],

  glossary: [
    { term: "resilience", definition: "Planning in advance to survive and recover from disruptions (attacks, failures, disasters), so they are setbacks, not extinction events." },
    { term: "business continuity (BC)", definition: "Keeping the business running, or running in a reduced way, through a disruption, including manual or alternative workarounds." },
    { term: "disaster recovery (DR)", definition: "The technical restoration of IT systems and data after a disruption: rebuilding, restoring and bringing services back online." },
    { term: "all-hazards planning", definition: "Planning for the impact of a disruption (lost systems, site or data) regardless of its cause, cyber or physical." },
  ],

  seeHeading: "When a fire destroyed data with nowhere else to live",

  cases: [
    {
      org: "OVHcloud (Strasbourg fire)",
      year: "2021",
      headline: "A data-centre fire destroyed systems and data that customers assumed were safe",
      whatHappened: "In March 2021, a serious fire destroyed a data centre operated by the cloud provider OVHcloud in Strasbourg, and damaged others nearby. Many customers' servers, and their data, were physically destroyed. Critically, some customers had assumed their data was safe simply by being in the cloud, and had no independent offsite backup or disaster-recovery arrangement, so when the data centre burned, they lost their data outright, with no way to recover it. It was not a cyber attack at all, but a mundane physical disaster that nonetheless caused permanent data loss for the unprepared.",
      theMissedMeasure: "Independent, offsite backups and a disaster-recovery plan. The customers who lost data had assumed resilience rather than ensuring it; those with offsite backups elsewhere could recover. It is a stark reminder that resilience is about where your data can survive a single disaster, and that cloud is not automatically a backup.",
      theCost: "Permanent data loss for customers who had no offsite copy or recovery plan, and major disruption, from a physical fire, not a hacker, a powerful demonstration that resilience must be deliberate and that assuming 'it's safe' is exactly how data is lost.",
      control: "secure-configuration",
      impact: ["a data-centre fire destroyed servers and data", "customers with no offsite backup lost data permanently", "a physical disaster, not a cyber attack"],
      source: "Public record; OVHcloud statements and 2021 reporting.",
      brandColor: "#123f6d",
      news: { headline: "OVHcloud fire: data destroyed as customers lacked backups", outlet: "Mainstream and security reporting (2021)", date: "March 2021" },
    },
  ],

  lab: {
    title: "Continuity or recovery?",
    intro: "Nothing to install and nothing leaves this page. For each activity, decide: is it business continuity (keep running) or disaster recovery (restore the systems)?",
    prompts: [
      "Continuity keeps the business operating through the disruption.",
      "Disaster recovery restores the IT systems afterwards.",
      "You need both: recovery takes time; continuity keeps you alive meanwhile.",
    ],
    component: BcDrLab,
  },

  check: {
    explain: {
      prompt: "Explain what resilience is, the difference between business continuity and disaster recovery, and what the OVHcloud fire teaches about assuming data is safe.",
      modelAnswer: "Resilience is planning in advance to survive and recover from disruptions, whether a cyber attack, hardware failure, fire or flood, so that a disruption is a setback rather than an extinction event; it broadens your view to all hazards, planning for the impact (lost systems, site or data) regardless of cause. Business continuity and disaster recovery are two related but different jobs: business continuity is about keeping the business running, or running in a reduced way, through a disruption (which functions must keep going, what manual or alternative workarounds exist), while disaster recovery is the technical restoration of the IT systems afterwards, rebuilding servers, restoring data, bringing services back online. You need both, because recovery takes time and continuity keeps the organisation alive meanwhile. The OVHcloud fire teaches that assuming your data is safe is how data is lost: a data-centre fire physically destroyed servers and data, and customers who had assumed being in the cloud made their data safe, with no independent offsite backup or recovery plan, lost it permanently, while those with offsite copies could recover. Resilience must be deliberate, not assumed: you ensure your critical data can survive a single disaster, and have a plan to recover and keep running, because the bad day, often a mundane physical one rather than a hacker, will come.",
    },
    quiz: [
      {
        q: "What is the difference between business continuity and disaster recovery?",
        options: [
          "Disaster recovery keeps the business trading, while continuity rebuilds the IT systems afterwards",
          "Continuity and disaster recovery are two names for the same single recovery plan",
          "Continuity keeps the business running through a disruption; disaster recovery restores the systems afterwards",
          "Continuity handles only cyber attacks, while disaster recovery handles only fires and floods",
          "Continuity means taking backups, while disaster recovery means buying insurance cover",
        ],
        answer: 2,
        reasons: [
          "This is the two jobs swapped round. Continuity keeps the business operating; it is disaster recovery that rebuilds the systems.",
          "They are closely related but genuinely different jobs: one keeps the business running, the other restores the technology, and you need both.",
          "Right. Continuity is 'keep operating' through the disruption; recovery is 'restore the systems'. You need both, because recovery takes time and continuity keeps you alive meanwhile.",
          "Both plan for the impact whatever the cause. Neither is tied to a particular type of disaster; the split is operating versus restoring.",
          "Backups and insurance may feature, but that is far too narrow. Continuity is keeping the business running; recovery is restoring the IT systems.",
        ],
      },
      {
        q: "What does 'all-hazards' resilience thinking mean?",
        options: [
          "Planning for the impact, lost systems, site or data, whatever the cause, cyber or physical",
          "Writing a separate, detailed recovery plan for every individual cause you can imagine",
          "Concentrating only on the single most likely hazard and setting the rest aside",
          "Preventing every possible disaster in advance so that none of them can ever occur",
          "Treating only cyber attacks as real hazards, since physical events are rare",
        ],
        answer: 0,
        reasons: [
          "Right. Many of the worst disruptions are not attacks at all, so a resilient organisation plans for the impact, whatever causes it.",
          "That quickly becomes unmanageable. All-hazards deliberately works from the impact instead, so one plan covers many different causes.",
          "That leaves you exposed to everything else. All-hazards is the opposite: plan for the impact so any cause is covered.",
          "Prevention can never be perfect, which is the whole reason resilience exists. All-hazards plans for the impact when something does get through.",
          "Physical events like fire, flood and power loss are common and devastating. All-hazards covers them alongside cyber, by planning for the impact.",
        ],
      },
      {
        q: "What is the key lesson of the OVHcloud fire?",
        options: [
          "Keeping data with a large cloud provider removes any need for your own backups",
          "A second copy in the same data centre is enough to survive almost any disaster",
          "Physical disasters like fire can no longer destroy data once it is stored digitally",
          "Resilience must be deliberate: assuming data is safe, with no offsite backup, is how it is lost",
          "Fire is so rare in modern data centres that offsite backups are not worth the cost",
        ],
        answer: 3,
        reasons: [
          "This is exactly the assumption that cost customers their data. A cloud provider is not automatically a backup; you still need your own.",
          "A copy in the same building burns with the original. The surviving copy has to be offsite, somewhere one disaster cannot reach.",
          "The fire shows the opposite: digital data is destroyed when the hardware holding it is, unless a copy lives somewhere else.",
          "Right. A physical fire destroyed data customers assumed was safe simply by being in the cloud. Resilience must be ensured with an offsite copy, not assumed.",
          "The fire happened, and the unprepared lost everything. Offsite backups are exactly what let some customers recover, so they are well worth it.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now understand resilience, and the difference between keeping the business running and restoring its systems.",
    takeaways: [
      "Resilience means planning in advance to survive and recover from disruptions, cyber or physical.",
      "Business continuity keeps the business operating through a disruption; disaster recovery restores the IT systems afterwards.",
      "Resilience must be deliberate: assuming data is safe (OVHcloud) is how it is lost; ensure it can survive a single disaster.",
    ],
    project: {
      name: "Find your single disaster",
      blurb: "For your own important data or a system you rely on, ask: what single disaster (fire, loss, ransomware, provider failure) would destroy it, and is there a copy a that disaster could not reach? Identifying your 'single disaster' exposure is the first step of resilience, and often a sobering, motivating one.",
    },
    ethicsNote: "Resilience planning is constructive, protective work on your own or authorised systems. It is about ensuring survival and recovery, within the Module 5 principles, and it protects the people who depend on the organisation.",
  },
};

export default topic1;

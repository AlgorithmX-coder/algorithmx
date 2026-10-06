import type { TopicManifest } from "../../learn/types";
import { RedundancyLab } from "../../learn/conceptLabs";

/* Module 19 - Topic 4: redundancy and failover. Case: a major cloud-
 * region outage (such as the widely-felt AWS us-east-1 outages), where
 * services without multi-region redundancy went down while those with
 * failover stayed up. Public record: 2021 major-cloud-outage reporting. */
const topic4: TopicManifest = {
  id: "m19t4",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "Redundancy & failover",
  role: "Redundancy, having no single point of failure, is how systems stay up through a failure, and failover is how they switch to a backup automatically. Understanding these is core to building and assessing resilient systems, and to spotting the dangerous single points of failure that take organisations down.",
  minutes: 14,
  promise: "Learn how systems survive a failure by having a spare ready, then see a single cloud region take much of the internet down with it.",
  brief: "In this lesson, we'll look at redundancy and failover: how systems stay running through a failure. Redundancy means no single component's failure can take you down, because there is a spare; failover is switching to that spare, ideally automatically. We'll see why single points of failure are so dangerous, and that they can be people and processes, not just hardware. Then we'll see how one cloud region's outage cascaded across the internet.",

  learn: [
    {
      heading: "Redundancy: no single point of failure",
      body: [
        "Redundancy means having no single point of failure: no one component whose loss stops everything. You achieve it by duplication, two servers instead of one, two internet connections from different providers, two data centres, so that if one fails, the other carries on. The goal is that any single failure is survivable, because something else can take over. A system with redundancy keeps running through a failure; one without stops the moment its single critical component dies.",
        "A single point of failure (SPOF) is the opposite: something whose failure brings everything down. The classic example is one server that the whole business depends on, with no backup, but SPOFs hide everywhere: one internet connection, one power supply, one data centre. Finding and eliminating single points of failure, by adding redundancy where it matters, is a core part of designing and assessing resilient systems.",
      ],
      examples: [
        "Redundancy: duplication so any single failure is survivable.",
        "Two servers, two connections, two data centres: one fails, the other carries on.",
        "A single point of failure stops everything when it dies; redundancy removes it.",
      ],
      analogy: {
        plain: "A plane with two engines can fly on one; a plane with one engine cannot. Redundancy is the second engine, so a single failure is not the end.",
        realTerm: "redundancy / single point of failure",
      },
    },
    {
      heading: "Failover: switching to the spare",
      body: [
        "Redundancy provides a spare; failover is the act of switching to it when the primary fails. The best failover is automatic: the moment the main system goes down, traffic or operations switch to the standby so quickly that users barely notice, which is how services meet a tight RTO. Manual failover (a person switching over) is slower but still far better than having no spare at all. Failover is what turns redundancy from a dormant backup into actual continuity.",
        "Designing good failover is subtle: the standby must be ready and current (an out-of-date spare is little use), the switch must actually work when triggered (which is why you test it, the next topic), and failover should not itself introduce a single point of failure. Done well, failover means a component can fail and the service stays up, which is exactly the resilience a tight RTO demands, and a visible mark of a well-engineered system.",
      ],
      examples: [
        "Failover switches to the redundant spare when the primary fails.",
        "Automatic failover is fast enough that users barely notice (meeting a tight RTO).",
        "The spare must be ready, current, and the switch must actually work when triggered.",
      ],
    },
    {
      heading: "The hidden single points of failure",
      body: [
        "A crucial, often-missed lesson: single points of failure are not only hardware. A key person who is the only one who understands a critical system is a SPOF, if they are unavailable, nobody can fix it. A single supplier everything depends on is a SPOF (the supply-chain risk from Module 17). A single shared credential, a single process nobody else knows, each can bring an organisation down. Resilience thinking means hunting for all of these, people, process and supplier, not just servers.",
        "And at large scale, concentration creates SPOFs too: when a huge number of services all depend on the same cloud provider or region, that provider becomes a shared single point of failure, and its outage cascades across the internet. The case you are about to see is exactly this: a single cloud region's outage took down a vast range of apparently-unrelated services at once, because so many of them depended on it. Spotting these concentrated and hidden SPOFs is sophisticated, valuable resilience thinking.",
      ],
      examples: [
        "A key person, a single supplier, a shared credential: all single points of failure.",
        "Concentration is a SPOF: many services on one provider/region fail together.",
        "Hunt for SPOFs in people, process and suppliers, not just hardware.",
      ],
      analogy: {
        plain: "A town with one bridge, one doctor, or one water main has single points of failure beyond any single building. Resilience looks for the one-of-anything whose loss stops everything.",
        realTerm: "hidden single points of failure",
      },
    },
  ],

  glossary: [
    { term: "redundancy", definition: "Having no single point of failure: duplication so that any single component's failure is survivable." },
    { term: "single point of failure (SPOF)", definition: "Something whose failure stops everything; can be hardware, a key person, a supplier, a credential or a process." },
    { term: "failover", definition: "Switching to a redundant spare when the primary fails, ideally automatically and fast enough that users barely notice." },
    { term: "concentration risk", definition: "When many services depend on the same provider or region, making it a shared single point of failure whose outage cascades." },
  ],

  seeHeading: "When one region took much of the internet down",

  cases: [
    {
      org: "Major cloud-region outage",
      year: "2021",
      headline: "A single cloud region's outage cascaded across a vast range of services",
      whatHappened: "Major cloud providers have suffered significant regional outages (such as the widely-felt AWS US-East-1 disruptions) in which problems in a single region took down a huge and surprising range of apparently-unrelated services at once, websites, apps, smart devices, even unrelated businesses, because so many of them depended, directly or indirectly, on that one region. Services designed with multi-region redundancy and failover largely stayed up or recovered quickly; those concentrated in the single affected region went down with it. It was a vivid demonstration of concentration as a single point of failure at internet scale.",
      theMissedMeasure: "Redundancy and failover, specifically, not depending on a single region or provider for critical systems. The services that weathered it had designed to survive the loss of one region; those that had not discovered their hidden, concentrated single point of failure the hard way.",
      theCost: "Widespread, cascading disruption across countless services from a single regional fault, a powerful illustration that concentration is a single point of failure, and that redundancy and failover are what keep critical systems up when one component, even a huge one, fails.",
      control: "secure-configuration",
      impact: ["one cloud region's outage cascaded to many services", "multi-region-redundant services largely stayed up", "concentration as a single point of failure at scale"],
      source: "Public record; 2021 major-cloud-outage reporting.",
      brandColor: "#ff9900",
      news: { headline: "Major cloud outage takes down swathes of the internet", outlet: "Mainstream and tech reporting (2021)", date: "2021" },
    },
  ],

  lab: {
    title: "Redundancy or single point of failure?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: does it provide redundancy, or is it a single point of failure?",
    prompts: [
      "Redundancy means a spare can take over; a SPOF stops everything when it dies.",
      "SPOFs are not only hardware, a key person or single supplier counts too.",
      "Resilience hunts for the 'one-of-anything' whose loss is fatal.",
    ],
    component: RedundancyLab,
  },

  check: {
    explain: {
      prompt: "Explain redundancy and failover, why single points of failure are not only hardware, and how a major cloud-region outage illustrates concentration as a SPOF.",
      modelAnswer: "Redundancy means having no single point of failure, no one component whose loss stops everything, achieved by duplication (two servers, two internet connections, two data centres) so that if one fails, another carries on and any single failure is survivable. Failover is the act of switching to that redundant spare when the primary fails, ideally automatically and fast enough that users barely notice, which is how a system meets a tight RTO; the spare must be ready and current and the switch must actually work when triggered. Single points of failure are not only hardware: a key person who alone understands a critical system, a single supplier everything depends on, a single shared credential or a process nobody else knows are all SPOFs whose loss can bring an organisation down, so resilience thinking hunts for them across people, process and suppliers, not just servers. A major cloud-region outage illustrates concentration as a SPOF because when a huge number of services all depend on the same cloud region, that region becomes a shared single point of failure: a problem in one region took down a vast, surprising range of apparently-unrelated services at once, while those designed with multi-region redundancy and failover largely stayed up, showing that concentration is a single point of failure even at internet scale, and that redundancy and failover are what keep critical systems running when one component, even a huge one, fails.",
    },
    quiz: [
      {
        q: "What is redundancy?",
        options: [
          "Having extra unnecessary features",
          "Having no single point of failure: duplication so any single component's failure is survivable",
          "Deleting old data",
          "A type of backup software",
        ],
        answer: 1,
        why: "Redundancy means a spare can take over, so one failure does not stop everything.",
      },
      {
        q: "Which of these can be a single point of failure?",
        options: [
          "Only a server",
          "A key person, a single supplier or a shared credential, not just hardware",
          "Nothing; SPOFs do not exist",
          "Only the internet connection",
        ],
        answer: 1,
        why: "SPOFs hide in people, process and suppliers too. Resilience hunts for the 'one-of-anything' whose loss is fatal.",
      },
      {
        q: "What does a major cloud-region outage show about resilience?",
        options: [
          "That the cloud is always reliable",
          "That concentration is a single point of failure: many services on one region fail together, so redundancy and failover matter",
          "That redundancy is pointless",
          "That outages never cascade",
        ],
        answer: 1,
        why: "Services concentrated in one region went down together; multi-region-redundant ones stayed up. Concentration is a SPOF at scale.",
      },
    ],
  },

  wrap: {
    headline: "You can now spot single points of failure and understand how redundancy and failover keep systems up.",
    takeaways: [
      "Redundancy means no single point of failure: duplication so any single failure is survivable.",
      "Failover switches to the spare, ideally automatically and fast; the spare must be ready and the switch must work.",
      "Single points of failure include people, suppliers and concentration, not just hardware (a cloud region can be one).",
    ],
    project: {
      name: "Hunt your SPOFs",
      blurb: "For something you depend on (a system, a service, even a process at work), list its single points of failure, including any key person, sole supplier, or single location. For the most important one, note how you would add redundancy. SPOF-hunting is a genuinely valuable resilience skill.",
    },
    ethicsNote: "Designing for redundancy and spotting single points of failure is constructive engineering for your own or authorised systems, aimed at keeping services and the people who rely on them safe through failures.",
  },
};

export default topic4;

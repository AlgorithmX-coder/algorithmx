import type { TopicManifest } from "../../learn/types";
import { DefenceStageLab } from "../../learn/conceptLabs";

/* Module 6 - Topic 5: how defenders use the same map. Case: FireEye's
 * December 2020 discovery and public disclosure of the SolarWinds supply-
 * chain campaign, including sharing attacker techniques and detection
 * countermeasures so others could defend. Public record: FireEye/Mandiant
 * disclosures and December 2020 reporting. */
const topic5: TopicManifest = {
  id: "m6t5",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "How defenders use the same map",
  role: "The attacker's map is the defender's map. Threat intelligence, mapping real attacker behaviour and sharing it, is how modern defence scales: one team's detection becomes everyone's. Understanding this turns the earlier topics from scary trivia into a working method.",
  minutes: 15,
  promise: "See how defenders flip the attackers' own playbook against them, then watch one company's breach become everyone's defence.",
  brief: "In this lesson, we'll close the module by turning everything around. The kill chain, ATT&CK, the understanding of actors and recon, these are not just ways to understand attacks; they are the defender's toolkit. We'll see how threat intelligence and shared detections let defenders anticipate attacker moves, and how one security firm, on discovering its own breach, chose to hand the whole industry the means to defend.",

  learn: [
    {
      heading: "Turning the attacker's playbook into your defence",
      body: [
        "Everything you learned this module, who attacks and why, the stages they move through, how they research, becomes powerful the moment you use it defensively. If you know the stages of an attack, you can place detections and defences at each one. If you know the common techniques, you can watch for them. The attacker's playbook, understood, becomes your defensive plan.",
        "This is the heart of modern security operations. Defenders do not just wait and react; they study how attackers behave and prepare specifically for it. 'Assume breach, and know what the breach will look like' is far stronger than hoping nothing gets in.",
      ],
      examples: [
        "Know the stages: place a detection or control at each link of the chain.",
        "Know the techniques: build alerts for the specific behaviours attackers use.",
        "Know the actors: prioritise defending against the ones likely to target you.",
      ],
      analogy: {
        plain: "A goalkeeper who has studied a striker's favourite moves is not guessing. They have watched the playbook and positioned themselves for what is likely to come.",
        realTerm: "threat-informed defence",
      },
    },
    {
      heading: "Threat intelligence: defence that scales by sharing",
      body: [
        "No single organisation sees every attack, but together they see almost all of them. Threat intelligence is the practice of gathering, analysing and sharing information about real attacker behaviour, their techniques, their infrastructure, their telltale signs, so that one organisation's hard-won discovery protects many others. When an attack is seen somewhere, its signatures can be shared everywhere.",
        "This is why defenders use shared frameworks like ATT&CK: they provide a common language so a detection described by one team can be understood and used by another. Government agencies like the NCSC and CISA publish threat advisories in exactly this spirit. Defence scales through sharing in a way that attackers, who guard their methods, cannot easily match.",
      ],
      examples: [
        "An attack seen at one company yields signatures others can block before they are hit.",
        "Shared frameworks mean a detection written once can be used by many.",
        "National agencies publish advisories so defenders everywhere can prepare together.",
      ],
    },
    {
      heading: "A choice: hoard the knowledge, or share it",
      body: [
        "When an organisation discovers a sophisticated attack, it faces a choice: quietly clean up, or share what it learned so others can defend. The defensive community works because, again and again, organisations choose to share, publishing the attacker's techniques and the means to detect them, even at some cost to themselves.",
        "That generosity is what makes the map a shared asset rather than a private one. The case you are about to see is a landmark example: a security firm discovered it had been breached by a highly capable adversary, and rather than stay quiet, it published the attacker's methods and detection tools so the rest of the world could find and stop the same campaign. That is the defender's map in action.",
      ],
      examples: [
        "Sharing attacker techniques lets others detect the same campaign before it hits them.",
        "Publishing detections turns one victim's pain into many organisations' protection.",
        "The community defends better together than any one organisation can alone.",
      ],
      analogy: {
        plain: "A neighbourhood is safer when the household that spots the burglar's trick tells everyone else, rather than just fixing its own lock and staying silent.",
        realTerm: "threat intelligence sharing",
      },
    },
  ],

  glossary: [
    { term: "threat intelligence", definition: "Gathered, analysed and shared information about real attacker behaviour, used to anticipate and detect attacks." },
    { term: "threat-informed defence", definition: "Designing defences specifically around how real attackers behave, rather than in the abstract." },
    { term: "indicator of compromise (IOC)", definition: "A telltale sign that an attack has occurred, such as a malicious file, address or behaviour, shareable so others can detect the same attack." },
    { term: "supply-chain attack", definition: "Compromising a trusted supplier or software update to reach that supplier's many customers at once." },
  ],

  seeHeading: "When a breached firm armed everyone else",

  cases: [
    {
      org: "FireEye / SolarWinds",
      year: "2020",
      headline: "A security firm discovered a vast campaign, then handed the world the means to fight it",
      whatHappened: "In December 2020, the security firm FireEye discovered it had been breached by a highly capable, likely nation-state adversary. Investigating, it uncovered a far larger supply-chain campaign: attackers had compromised the software updates of SolarWinds, a widely used IT management tool, to reach many of its customers, including government agencies and major companies. Crucially, rather than quietly cleaning up, FireEye publicly disclosed the campaign and released detection tools and the attacker's techniques so that organisations everywhere could search for and defend against the same intrusion.",
      theMissedMeasure: "The attack exploited deep trust in software updates, the hardest kind to defend against, which is why detection and shared intelligence mattered so much. FireEye's choice to share turned its own breach into a defensive asset for thousands of other potential victims.",
      theCost: "The campaign compromised numerous high-value targets and shook confidence in the software supply chain. But the shared detections and techniques let countless other organisations check themselves and respond, a powerful demonstration of defence through disclosure.",
      control: "secure-configuration",
      impact: ["a nation-state supply-chain campaign via SolarWinds updates", "many government and corporate victims", "FireEye published detections and techniques for all defenders to use"],
      source: "Public record; FireEye/Mandiant disclosures and extensive December 2020 reporting.",
      brandColor: "#e01e5a",
      news: { headline: "SolarWinds: how a security firm's discovery exposed a global espionage campaign", outlet: "Mainstream and security reporting (2020)", date: "December 2020" },
    },
  ],

  lab: {
    title: "Match the defence to the stage",
    intro: "Nothing to install and nothing leaves this page. Using the kill-chain map, match each defence to the stage it most disrupts.",
    prompts: [
      "Think back to the stages: reconnaissance, delivery and exploitation, and actions on objectives.",
      "Several defences are valid at more than one stage: layering is the goal.",
      "This is literally how a defender decides where to break the chain.",
    ],
    component: DefenceStageLab,
  },

  check: {
    explain: {
      prompt: "When FireEye discovered it had been breached, it chose to publish the attacker's techniques and detection tools. Using the idea of the defender's shared map, explain why that choice made the whole community stronger.",
      modelAnswer: "Defence scales through sharing in a way attacking does not. FireEye's breach gave it detailed knowledge of a sophisticated campaign: the attacker's techniques, infrastructure and telltale signs. By publishing that, along with detection tools, it let thousands of other potential victims search their own systems and defend against the exact same intrusion, often before they were hit. One organisation's painful discovery became everyone's protection. That is the defender's map working as a shared asset: no single organisation sees every attack, but when the one that does shares what it learned, the whole community can prepare for it.",
    },
    quiz: [
      {
        q: "What is 'threat-informed defence'?",
        options: [
          "Hoping attackers do not target you",
          "Designing defences specifically around how real attackers behave, using the same maps they do",
          "Only using antivirus",
          "Attacking back when breached",
        ],
        answer: 1,
        why: "It means studying real attacker behaviour, stages and techniques, and placing your defences and detections accordingly.",
      },
      {
        q: "Why does sharing threat intelligence make defenders collectively stronger?",
        options: [
          "It does not; sharing only helps attackers",
          "No one organisation sees every attack, so sharing lets one team's discovery protect many others",
          "Because it is legally required",
          "Because attackers also share, so it evens out",
        ],
        answer: 1,
        why: "Shared signatures and techniques mean an attack seen once can be blocked everywhere. Defence scales by sharing; attackers guard their methods and cannot match it.",
      },
      {
        q: "The deeper lesson of FireEye's response to its own breach is that:",
        options: [
          "Breached companies should always stay silent",
          "Publishing attacker techniques and detections turns one victim's loss into many organisations' protection",
          "Supply-chain attacks are impossible to defend against",
          "Only governments can respond to attacks",
        ],
        answer: 1,
        why: "By sharing rather than hoarding, FireEye let the whole community detect and defend against the same campaign. That is the defender's map as a shared asset.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 6: you can see attacks as attackers do, and use that same map to defend.",
    takeaways: [
      "The attacker's playbook, actors, stages, techniques, recon, is also the defender's toolkit for placing defences and detections.",
      "Threat intelligence lets defence scale through sharing: one organisation's discovery protects many others.",
      "The community is strongest when those who discover attacks share the techniques and detections, as FireEye did.",
    ],
    project: {
      name: "Design a threat-informed defence",
      blurb: "Pick one attack type from this module. Using the kill chain, write down one defence you would place at each of three stages (recon, delivery/exploit, and actions on objectives). You have just done, in miniature, what a security team does to turn knowledge of attackers into a layered plan.",
    },
    ethicsNote: "Threat intelligence is a defensive discipline built on sharing to protect. It is the constructive opposite of the attacker's secrecy, and everything in the rest of Act 2 is studied in that same defensive spirit, within the law.",
  },
};

export default topic5;

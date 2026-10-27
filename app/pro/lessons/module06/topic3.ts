import type { TopicManifest } from "../../learn/types";
import { KillChainOrderLab } from "../../learn/conceptLabs";

/* Module 6 - Topic 3: the attack lifecycle (kill chain and ATT&CK).
 * Case: Target, 2013 (attackers phished an HVAC vendor, pivoted into
 * Target's network, planted malware on point-of-sale systems, and
 * exfiltrated ~40M card records; a textbook kill-chain walk-through).
 * Public record: the US Senate committee report and 2014 reporting. */
const topic3: TopicManifest = {
  id: "m6t3",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "The attack lifecycle: the kill chain",
  role: "Almost every intrusion follows a recognisable sequence of stages. This map, the kill chain, and its more detailed cousin MITRE ATT&CK, is the single most useful mental model in security operations: it is how analysts understand where an attack is, and where to break it.",
  minutes: 18,
  promise: "Learn the stages every intrusion moves through, then trace one real breach from a vendor email to 40 million stolen cards.",
  brief: "In this lesson, we'll learn the attack lifecycle: the ordered stages most intrusions pass through, from quiet research to the final goal. This map is powerful because it turns a scary, formless 'hack' into a sequence you can anticipate and interrupt. Then we'll walk the famous Target breach through those stages, step by step, and see how many chances there were to break the chain.",

  learn: [
    {
      heading: "Attacks have a lifecycle, and that is a gift to defenders",
      visual: { id: "attack-steps" },
      body: [
        "A breach is not one magic moment; it is a journey through stages. A common way to describe it is the kill chain: reconnaissance (research the target), delivery (get the attack to them), exploitation (trigger the weakness and gain a foothold), installation (set up a way to stay), command and control (steer the compromised machine remotely), and finally actions on objectives (the real goal, such as stealing data or deploying ransomware).",
        "Why this matters: the attacker has to succeed at every stage, but the defender only has to break the chain at one. That single idea reframes defence entirely. You are not trying to be perfect everywhere; you are looking for the easiest place to snap the sequence before it reaches the goal.",
      ],
      examples: [
        "Reconnaissance: finding staff names and exposed systems.",
        "Delivery and exploitation: a phishing email that someone clicks, giving a foothold.",
        "Actions on objectives: the data theft or ransomware the whole effort was building towards.",
      ],
      analogy: {
        plain: "A burglary has stages too: case the house, get in, move around, find the safe, leave with the goods. Stop them at any stage, locked gate, alarm, bolted safe, and the whole plan fails.",
        realTerm: "the kill chain",
      },
    },
    {
      heading: "ATT&CK: the detailed field guide to attacker behaviour",
      body: [
        "The kill chain gives you the broad stages. MITRE ATT&CK goes deeper: it is a huge, public, constantly updated catalogue of the specific techniques attackers actually use at each stage, observed in real incidents. Think of the kill chain as the chapter headings and ATT&CK as the detailed contents under each one.",
        "You do not need to memorise ATT&CK. What matters now is knowing it exists and what it is for: it gives defenders a shared, precise language for attacker behaviour. When an analyst says a technique by its ATT&CK name, everyone knows exactly what they mean, and can look up how to detect and defend against it. You will meet ATT&CK again properly in the detection module.",
      ],
      examples: [
        "Kill chain = the stages; ATT&CK = the specific techniques seen within each stage.",
        "ATT&CK is built from real, observed attacks, not theory.",
        "Its value is a shared language: name the technique, and everyone knows the detection and defence.",
      ],
      analogy: {
        plain: "The kill chain is the skeleton; ATT&CK is the detailed anatomy. One tells you the shape of an attack, the other names every specific move within it.",
        realTerm: "MITRE ATT&CK",
      },
    },
    {
      heading: "Walking a real breach through the stages",
      body: [
        "The power of the map shows when you lay a real breach across it. Almost every major incident you will study can be told as a walk through these stages, and doing so instantly reveals the moments defence could have won. It also stops you fixating on the final, dramatic step and ignoring the quiet earlier ones where the attack was far easier to stop.",
        "The Target breach you are about to see is the classic teaching example precisely because it maps so cleanly: research, a way in through a third party, movement to the valuable systems, malware planted, data siphoned out. As you read it, notice how each stage was a separate chance to break the chain, and how the earliest chances were the cheapest.",
      ],
      examples: [
        "Laying a breach on the stages shows exactly where it could have been stopped.",
        "The earliest stages are usually the cheapest places to defend.",
        "It cures 'only the final step matters' thinking: the quiet early steps matter most.",
      ],
    },
  ],

  glossary: [
    { term: "kill chain", definition: "A model describing the ordered stages of an intrusion, from reconnaissance through to the attacker's final actions on their objective." },
    { term: "MITRE ATT&CK", definition: "A large, public knowledge base of the specific techniques attackers use at each stage, built from observed real-world attacks." },
    { term: "command and control (C2)", definition: "The channel a compromised machine uses to 'phone home', letting the attacker direct it remotely." },
    { term: "lateral movement", definition: "An attacker moving from their first foothold to other, more valuable systems inside the same network." },
  ],

  seeHeading: "One breach, stage by stage",

  cases: [
    {
      org: "Target",
      year: "2013",
      headline: "A vendor phishing email became 40 million stolen card numbers",
      whatHappened: "In the 2013 Target breach, attackers first compromised a heating and air-conditioning (HVAC) contractor that had network access to Target, reportedly via phishing (reconnaissance and delivery). Using that access they moved into Target's network (exploitation and lateral movement), installed malware on the point-of-sale systems that read customers' cards (installation), and quietly siphoned the data out (command and control, and actions on objectives). Around 40 million card records and tens of millions of other customer details were taken over the busy holiday shopping period.",
      theMissedMeasure: "Several: a third party had far more network access than it needed, internal segmentation did not stop movement from a vendor's foothold to the payment systems, and early warning signs were reportedly not acted on. Each is a separate place the chain could have been broken, and the earliest, limiting the vendor's access, was the cheapest.",
      theCost: "Around 40 million payment cards and tens of millions more customer records exposed, huge remediation and settlement costs, and lasting reputational damage. A textbook case of a chain with many unbroken links.",
      control: "access-control",
      impact: ["~40 million card records stolen", "entry via a third-party HVAC contractor", "flat access let attackers reach the payment systems"],
      source: "Public record; the US Senate Commerce Committee report and extensive 2014 reporting.",
      brandColor: "#cc0000",
      news: { headline: "Target breach: how a third-party vendor led to 40 million stolen cards", outlet: "Mainstream and security reporting (2014)", date: "2014" },
    },
  ],

  lab: {
    title: "Order the kill chain",
    intro: "Nothing to install and nothing leaves this page. Put the stages of an intrusion into the order they happen.",
    prompts: [
      "Start from the attacker's quiet first move and end at their goal.",
      "Think: research, get in, gain a foothold, stay, steer, and finally act.",
      "Remember the defender's edge: break the chain at any one stage and the whole attack fails.",
    ],
    component: KillChainOrderLab,
  },

  check: {
    explain: {
      prompt: "Walk the Target breach through the kill-chain stages in your own words, and name two different stages where breaking the chain would have stopped it.",
      modelAnswer: "Reconnaissance and delivery: attackers targeted and phished a third-party HVAC contractor that had network access to Target. Exploitation and lateral movement: they used that foothold to move into Target's own network. Installation: they planted malware on the point-of-sale systems reading customers' cards. Command and control and actions on objectives: they steered the malware and siphoned out around 40 million card records. Two places to break the chain: limiting the vendor's access so a contractor foothold could not reach payment systems (early and cheap), and network segmentation plus acting on early alerts to stop the lateral movement and exfiltration (later, but still decisive).",
    },
    quiz: [
      {
        q: "What is the defender's key advantage in the kill-chain model?",
        options: [
          "The defender must place a working control at every single stage",
          "Defences only ever work at the final actions-on-objectives stage",
          "Breaking the chain means catching the attacker during reconnaissance",
          "The attacker must win every stage, but the defender need break only one link",
          "The defender always gets to act before the attacker even begins",
        ],
        answer: 3,
        reasons: [
          "This is the opposite of the advantage. You do not need a control everywhere, only one link you can reliably break.",
          "Defences work at every stage, and the earliest are often the cheapest. Waiting for the final stage throws away your best chances.",
          "You can break the chain at many stages, not only reconnaissance. Catching recon is hard, so later links are often easier to snap.",
          "Right. That asymmetry is the whole point: the attacker must get every stage right, while you only need to break one link before they reach their objective.",
          "Defenders rarely act first, since the attacker often opens with quiet reconnaissance. Your edge is the chain's links, not getting there earlier.",
        ],
      },
      {
        q: "How do the kill chain and MITRE ATT&CK relate?",
        options: [
          "The kill chain gives the broad stages, ATT&CK catalogues the techniques within them",
          "The kill chain lists the techniques, and ATT&CK gives the broad stages",
          "ATT&CK is a paid tool that has quietly replaced the free kill chain",
          "Both describe defensive controls rather than real attacker behaviour",
          "They are rival models, so a team must choose one or the other",
        ],
        answer: 0,
        reasons: [
          "Right. The kill chain is the chapter headings (the stages) and ATT&CK is the detailed contents (the real techniques), giving defenders a shared, precise language.",
          "This has them the wrong way round. The kill chain gives the stages, ATT&CK supplies the detailed techniques within them.",
          "ATT&CK is free and public, and it complements the kill chain rather than replacing it. The two work together at different levels of detail.",
          "Both describe attacker behaviour, not defensive controls. You use that behaviour to decide where your own controls should go.",
          "They are not rivals to choose between. The kill chain is the overview and ATT&CK is the detail, so teams use them together.",
        ],
      },
      {
        q: "In the Target breach, how did the attackers first get in?",
        options: [
          "Through a zero-day flaw in Target's public-facing website",
          "Through a malicious insider working on Target's own payment team",
          "Through login details phished directly from a senior Target executive",
          "Through malware hidden in a software update Target installed itself",
          "Through a compromised heating and air-conditioning contractor with access",
        ],
        answer: 4,
        reasons: [
          "There was no website zero-day. The way in was a trusted third party, not a flaw in Target's own public site.",
          "This was not an insider attack. The foothold came from outside, through a supplier with too much network access.",
          "The phishing hit a contractor, not a Target executive. The entry point was the third party's access, not an executive's login.",
          "That describes a supply-chain update attack like SolarWinds, not Target. Target's attackers came in through a contractor's access.",
          "Right. The entry point was a third-party HVAC contractor with network access. It shows why the earliest stage, limiting who can reach what, is often the cheapest place to defend.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now hold the most useful map in security: the stages of an attack, and where to break them.",
    takeaways: [
      "Intrusions move through stages, the kill chain, from reconnaissance to the final actions on objectives.",
      "The attacker must win every stage; the defender only has to break the chain once, usually cheapest at the earliest stages.",
      "MITRE ATT&CK details the specific techniques within each stage, giving defenders a shared, precise language.",
    ],
    project: {
      name: "Map a breach to the chain",
      blurb: "Take any breach from this course so far, or one in the news, and write it as a walk through the kill-chain stages, even if you have to guess a step. Then mark the one stage where you would most want to have broken the chain, and why. This is exactly how analysts debrief a real incident.",
    },
    ethicsNote: "The kill chain is a defensive planning tool. You are learning the stages of an attack to recognise and interrupt them, never to carry them out, and only ever on systems within the authorisation line from Module 5.",
  },
};

export default topic3;

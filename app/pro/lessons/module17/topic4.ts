import type { TopicManifest } from "../../learn/types";
import { ThirdPartyLab } from "../../learn/conceptLabs";

/* Module 17 - Topic 4: third-party and supply-chain risk. Case: the
 * 2023 MOVEit mass-exploitation (the Cl0p group exploited a flaw in the
 * MOVEit file-transfer tool to breach hundreds of organisations and
 * their customers at once). Public record: 2023 reporting and CISA
 * guidance. */
const topic4: TopicManifest = {
  id: "m17t4",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "Third-party & supply-chain risk",
  role: "Your security is only as strong as the suppliers you trust with access and data. Managing third-party and supply-chain risk is a major, growing part of GRC, because so many breaches now arrive through a trusted supplier rather than a direct attack.",
  minutes: 15,
  promise: "Learn why your suppliers' security is your risk, then see one flaw in one file-transfer tool breach hundreds of organisations at once.",
  brief: "In this lesson, we'll look at a risk that has become one of the biggest in security: third-party and supply-chain risk. Your suppliers, the software, services and partners you rely on, have access to your systems and data, so their weaknesses become yours. We'll see how to manage this risk, due diligence, contracts, least privilege, monitoring, and then see the MOVEit attack, where one supplier flaw cascaded to hundreds of organisations.",

  learn: [
    {
      heading: "Your suppliers' risk is your risk",
      body: [
        "Modern organisations depend on a web of third parties: software vendors, cloud services, contractors, partners, many of whom have access to the organisation's systems or data. The uncomfortable truth is that their security weaknesses become your risk. If a supplier you trust is compromised, or their software has a flaw, the attacker can reach you through that trusted relationship, often bypassing your own defences entirely (the supply-chain attacks you met in Modules 8 and 12).",
        "This is why third-party risk management has become a major part of GRC. You cannot just secure your own perimeter and ignore everyone you connect to; you have to extend your risk thinking to the suppliers you depend on. 'How secure are the people and systems we trust?' is now as important a question as 'how secure are we?', because an attacker will happily come through the weakest supplier.",
      ],
      examples: [
        "Suppliers, software, services and partners often have access to your systems or data.",
        "Their weaknesses become your risk; an attacker reaches you through the trusted relationship.",
        "You must extend risk thinking beyond your own perimeter to your suppliers.",
      ],
      analogy: {
        plain: "A bank can have an impregnable vault, but if the cleaning company it trusts has a dishonest employee with a key, the trusted relationship is the way in. Your suppliers hold keys too.",
        realTerm: "third-party risk",
      },
    },
    {
      heading: "Managing the risk: diligence, contracts, least privilege",
      body: [
        "Managing third-party risk is practical GRC work. Before trusting a supplier, you assess their security (due diligence): do they meet a standard, how do they protect your data? You set expectations in contracts: required security standards, breach-notification duties, the right to audit. You apply least privilege to suppliers just as to staff: give them only the access they genuinely need, for only as long as needed. And you monitor and re-review key suppliers over time, because their security (and your relationship) changes.",
        "The opposite, and a common failure, is blind trust: assuming a big-name or long-standing supplier must be secure, giving them broad standing access, and never checking. That is exactly how trusted relationships become breach routes. The Target breach (through an over-trusted HVAC vendor) and countless others followed this pattern. Good third-party risk management replaces blind trust with verified, limited, monitored trust.",
      ],
      examples: [
        "Due diligence before trusting; security requirements in contracts.",
        "Least privilege for suppliers: only the access they need, for as long as needed.",
        "Monitor and re-review; never rely on blind trust in a big name.",
      ],
    },
    {
      heading: "When one supplier flaw cascades to many",
      visual: { id: "network-spread", mode: "lateral" },
      body: [
        "The most alarming feature of supply-chain risk is its scale: a single flaw in a widely-used supplier can cascade to all of that supplier's customers at once. Attackers have learned this and deliberately target popular software and service providers, because compromising one reaches hundreds. This is a force multiplier that makes supply-chain attacks uniquely efficient and damaging, and it is why third-party risk has risen to the top of the GRC agenda.",
        "It also has a cascading dimension: your supplier's suppliers are, indirectly, your risk too, and a breach at one organisation can expose the data of its many customers, and their customers. The MOVEit case you are about to see is the definitive modern example: attackers exploited one flaw in one widely-used file-transfer tool and, through it, breached hundreds of organisations and the personal data of many millions of people, a single supplier flaw rippling across the world.",
      ],
      examples: [
        "One flaw in a widely-used supplier can reach all its customers at once.",
        "Attackers target popular providers precisely for this force-multiplier effect.",
        "The ripple extends: your suppliers' suppliers are indirectly your risk too.",
      ],
      analogy: {
        plain: "Contaminate one ingredient used by many food producers, and the recall spans the whole industry. A flaw in one widely-used supplier contaminates everyone who relies on it.",
        realTerm: "supply-chain cascade",
      },
    },
  ],

  glossary: [
    { term: "third-party risk", definition: "The risk that a supplier, vendor or partner you trust, and who has access to your systems or data, becomes a route of attack or exposure." },
    { term: "due diligence", definition: "Assessing a supplier's security before trusting them, e.g. checking certifications and how they protect your data." },
    { term: "supply-chain attack", definition: "Compromising a trusted supplier or their software to reach that supplier's many customers at once." },
    { term: "fourth-party risk", definition: "Risk from your suppliers' suppliers: the cascade means risk extends beyond your direct relationships." },
  ],

  seeHeading: "When one tool's flaw breached hundreds of organisations",

  cases: [
    {
      org: "MOVEit (Cl0p)",
      year: "2023",
      headline: "A single flaw in one file-transfer tool cascaded to hundreds of organisations",
      whatHappened: "In 2023, the Cl0p ransomware/extortion group exploited a vulnerability in MOVEit Transfer, a widely-used file-transfer tool, to steal data from the many organisations that used it. Because MOVEit was embedded in the operations of numerous companies and government bodies, one flaw cascaded massively: hundreds of organisations were breached, and the personal data of many millions of individuals, their customers and the customers of their customers, was exposed, in one of the largest supply-chain data-theft events on record. Most victims had done nothing wrong themselves; they were exposed through a tool they, or their suppliers, relied on.",
      theMissedMeasure: "Third-party and supply-chain risk management, plus rapid patching of the supplier's flaw. The cascade shows why organisations must understand which third-party tools and suppliers can reach their data, limit that exposure, and respond fast when a supplier flaw emerges, exactly the GRC discipline this topic teaches.",
      theCost: "Hundreds of breached organisations and the exposed personal data of many millions of people, from a single flaw in a single widely-used tool, a defining demonstration of how supply-chain risk cascades and why it tops the GRC agenda.",
      control: "patching",
      impact: ["one MOVEit flaw breached hundreds of organisations", "personal data of many millions exposed", "a landmark supply-chain cascade"],
      source: "Public record; 2023 reporting and CISA guidance on the MOVEit exploitation.",
      brandColor: "#e4002b",
      news: { headline: "MOVEit hack: how one flaw exposed hundreds of organisations and millions of people", outlet: "Mainstream and security reporting (2023)", date: "2023" },
    },
  ],

  lab: {
    title: "Manage or ignore third-party risk?",
    intro: "Nothing to install and nothing leaves this page. For each practice, decide: does it manage third-party risk, or ignore it?",
    prompts: [
      "Due diligence, contractual requirements, least privilege and monitoring manage it.",
      "Blind trust, over-broad access and not knowing who can reach you ignore it.",
      "Your suppliers' security is your risk too.",
    ],
    component: ThirdPartyLab,
  },

  check: {
    explain: {
      prompt: "Explain why third-party risk is your risk, how to manage it, and why the MOVEit attack shows how a single supplier flaw can cascade so widely.",
      modelAnswer: "Third-party risk is your risk because modern organisations depend on a web of suppliers, software vendors, cloud services, contractors, partners, many of whom have access to your systems or data, so their security weaknesses become yours: if a supplier you trust is compromised or their software has a flaw, an attacker can reach you through that trusted relationship, often bypassing your own defences. You manage it with practical GRC work: due diligence (assessing a supplier's security before trusting them), contractual security requirements (standards, breach-notification duties, the right to audit), least privilege for suppliers (only the access they genuinely need, for as long as needed), and ongoing monitoring and re-review, replacing blind trust with verified, limited, monitored trust. The MOVEit attack shows how a single supplier flaw cascades so widely because a flaw in one widely-used tool reaches all of that tool's customers at once: Cl0p exploited one MOVEit vulnerability and, because MOVEit was embedded across many organisations, breached hundreds of them and exposed the personal data of many millions of people, their customers and their customers' customers, most of whom had done nothing wrong but relied on a trusted tool. That force-multiplier cascade is exactly why third-party risk has risen to the top of the GRC agenda.",
    },
    quiz: [
      {
        q: "Why is a supplier's security weakness your risk?",
        options: [
          "It is not; only your own systems matter",
          "Because trusted suppliers have access to your systems or data, so an attacker can reach you through them",
          "Because suppliers are always malicious",
          "Only if the supplier is small",
        ],
        answer: 1,
        why: "Trusted relationships are a route in. An attacker will happily come through your weakest supplier, bypassing your own defences.",
      },
      {
        q: "Which is a way to MANAGE third-party risk?",
        options: [
          "Assume big-name vendors must be secure",
          "Do due diligence, set security requirements in contracts, apply least privilege, and monitor suppliers",
          "Give suppliers broad standing access forever",
          "Never track who can reach your data",
        ],
        answer: 1,
        why: "Verified, limited, monitored trust, not blind trust, is how third-party risk is managed.",
      },
      {
        q: "What does the MOVEit attack show about supply-chain risk?",
        options: [
          "That it only affects one company at a time",
          "That one flaw in one widely-used supplier can cascade to hundreds of organisations and millions of people at once",
          "That suppliers are never a risk",
          "That patching does not matter",
        ],
        answer: 1,
        why: "A flaw in a widely-used tool reaches all its customers, a force multiplier that makes supply-chain risk uniquely damaging.",
      },
    ],
  },

  wrap: {
    headline: "You now understand one of the biggest risks in modern security: the suppliers you trust, and how to manage them.",
    takeaways: [
      "Your suppliers' weaknesses are your risk, because they have access and a compromise reaches you through trust.",
      "Manage it with due diligence, contractual requirements, least privilege for suppliers, and ongoing monitoring.",
      "A single supplier flaw can cascade to hundreds (MOVEit), which is why third-party risk tops the GRC agenda.",
    ],
    project: {
      name: "Map your supply chain",
      blurb: "For yourself or an organisation you know, list the key third parties that hold your data or can reach your systems (cloud accounts, apps, services). For each, ask: how much do I trust them, and have I any way to verify their security? Seeing your own supply chain is the first step of third-party risk management.",
    },
    ethicsNote: "Third-party risk management is about verifying and limiting trust responsibly, respecting suppliers' and data subjects' rights and the law (Module 5). It is constructive, defensive governance work.",
  },
};

export default topic4;

import type { TopicManifest } from "../../learn/types";
import { FrameworkLab } from "../../learn/conceptLabs";

/* Module 17 - Topic 2: the frameworks (ISO 27001, NIST CSF, Cyber
 * Essentials). Case: ISO 27001, the international, certifiable
 * information-security management standard widely required in business.
 * Public record: the ISO 27001 standard and its adoption. */
const topic2: TopicManifest = {
  id: "m17t2",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "The frameworks",
  role: "GRC runs on a handful of well-known frameworks and standards. Knowing what each is for, ISO 27001, the NIST CSF, Cyber Essentials, and where data-protection law fits, is day-one GRC literacy and appears constantly in job descriptions.",
  minutes: 15,
  promise: "Get a clear map of the key security frameworks and what each is actually for, then see the standard enterprises demand before they will trust you.",
  brief: "In this lesson, we'll demystify the frameworks GRC professionals work with. We'll distinguish ISO 27001 (a certifiable management-system standard), the NIST Cybersecurity Framework (a flexible, function-based framework), and Cyber Essentials (the UK's basic-controls baseline), and see where data-protection law like UK GDPR fits. Then we'll look at ISO 27001 specifically, the standard enterprises often require before trusting a supplier.",

  learn: [
    {
      heading: "Frameworks give structure to security",
      body: [
        "A security framework is a structured, recognised way to organise and demonstrate a security programme. Rather than every organisation inventing its own approach, frameworks provide a shared structure: what to consider, how to organise it, and often a way to be measured or certified against it. They turn 'are we secure?' into a structured, answerable question, and give customers, regulators and partners a common yardstick.",
        "For a GRC professional, frameworks are the everyday toolkit. You will map an organisation's controls to a framework, work toward certification, or use a framework to structure improvements. You do not need to memorise them in depth now; you need to know what the main ones are and what each is for, so the names in job descriptions and meetings make sense.",
      ],
      examples: [
        "Frameworks provide shared structure: what to consider and how to organise it.",
        "They give a common yardstick for customers, regulators and partners.",
        "GRC work maps controls to frameworks and works toward certification.",
      ],
      analogy: {
        plain: "Building codes give everyone a shared, recognised standard for a safe building, instead of each builder guessing. Security frameworks do that for security.",
        realTerm: "security framework",
      },
    },
    {
      heading: "The big three, and where law fits",
      body: [
        "Three names come up constantly. ISO 27001 is an international standard for an information-security management system (ISMS): a whole, certifiable management approach to security, widely required in enterprise contracts. The NIST Cybersecurity Framework (CSF) is a flexible, widely-used framework organised around five functions, identify, protect, detect, respond, recover, that helps structure a security programme. Cyber Essentials is the UK's basic-five-controls baseline (Module 12), achievable and often required for UK government work.",
        "Distinct from these voluntary frameworks is the law, such as UK GDPR, which is not a framework you choose to adopt but a legal requirement you must meet (Module 5). A common confusion is to lump law in with frameworks; keep them separate. Frameworks are structured approaches (some certifiable) you adopt to manage and demonstrate security; law is mandatory. GRC work involves both: following frameworks and ensuring legal compliance.",
      ],
      examples: [
        "ISO 27001: certifiable management-system standard, often required in enterprise deals.",
        "NIST CSF: flexible framework of five functions (identify, protect, detect, respond, recover).",
        "Cyber Essentials: UK basic-five-controls baseline. UK GDPR: law, not a framework.",
      ],
    },
    {
      heading: "Why certification matters commercially",
      body: [
        "Frameworks are not just internal tidiness; they have real commercial weight. Certification against a recognised standard, especially ISO 27001, is often a precondition for doing business: enterprise customers and government buyers frequently require their suppliers to be certified before trusting them with data or contracts. So security certification directly enables sales and partnerships, which is why organisations invest in it, and why GRC professionals who can help achieve and maintain it are valuable.",
        "This commercial reality is worth understanding as you enter the field. Security is not only a cost centre; demonstrable security (through certification and compliance) is a business enabler that wins trust and contracts. A GRC professional sits exactly at this intersection of security and business value, which is part of what makes the lane both important and well-paid. The case ahead is ISO 27001, the certification that most often opens, or closes, enterprise doors.",
      ],
      examples: [
        "Certification (especially ISO 27001) is often required to win enterprise/government contracts.",
        "Demonstrable security enables sales and partnerships: a business enabler, not just a cost.",
        "GRC professionals who achieve and maintain certification are valuable.",
      ],
      analogy: {
        plain: "A food-hygiene certificate is not just paperwork; without it, many customers will not buy. Security certification works the same way in business-to-business deals.",
        realTerm: "security certification",
      },
    },
  ],

  glossary: [
    { term: "ISO 27001", definition: "An international, certifiable standard for an information-security management system (ISMS), widely required in enterprise contracts." },
    { term: "NIST CSF", definition: "The NIST Cybersecurity Framework: a flexible framework organised around five functions, identify, protect, detect, respond, recover." },
    { term: "ISMS", definition: "Information-security management system: the whole, structured management approach to security that ISO 27001 certifies." },
    { term: "framework vs law", definition: "A framework is a structured approach you adopt (some certifiable); law (like UK GDPR) is a mandatory legal requirement." },
  ],

  seeHeading: "The standard enterprises demand",

  cases: [
    {
      org: "ISO 27001",
      year: "established",
      headline: "The certifiable standard that enterprises often require before trusting a supplier",
      whatHappened: "ISO 27001 is the leading international standard for an information-security management system: a structured, certifiable approach covering how an organisation manages security risk, controls, policies and continual improvement. Organisations get independently audited and certified against it, and that certification has become a common requirement in business: enterprise customers and government buyers frequently insist their suppliers hold ISO 27001 (or equivalent) before entrusting them with data or contracts. It has made demonstrable, standardised security a precondition for doing business at scale.",
      theMissedMeasure: "ISO 27001 is itself the constructive standard: it turns 'manage security well, and prove it' into a recognised, auditable certification. For organisations, achieving it both improves security and unlocks commercial opportunities; for GRC professionals, helping achieve and maintain it is core, valuable work.",
      theCost: "Here the value is commercial and defensive: certification enables trust, sales and partnerships while driving genuine security improvement, which is exactly why it is so widely required and why understanding it is essential GRC literacy.",
      control: "secure-configuration",
      impact: ["international, certifiable information-security management standard", "often required to win enterprise and government contracts", "makes demonstrable security a business enabler"],
      source: "Public record; the ISO 27001 standard and its widespread adoption.",
      brandColor: "#1b5e9c",
      news: { headline: "ISO 27001: the security certification that unlocks enterprise deals", outlet: "ISO / industry practice", date: "established" },
    },
  ],

  lab: {
    title: "Match the framework",
    intro: "Nothing to install and nothing leaves this page. Tap each description, then tap which framework or standard it is.",
    prompts: [
      "ISO 27001: certifiable management-system standard. NIST CSF: five-function framework.",
      "Cyber Essentials: UK basic-five-controls baseline. UK GDPR: law, not a framework.",
      "Knowing what each is for is day-one GRC literacy.",
    ],
    component: FrameworkLab,
  },

  check: {
    explain: {
      prompt: "Distinguish ISO 27001, the NIST CSF and Cyber Essentials, explain where UK GDPR fits, and say why security certification matters commercially.",
      modelAnswer: "ISO 27001 is an international, certifiable standard for an information-security management system (ISMS): a whole, audited management approach to security, widely required in enterprise contracts. The NIST Cybersecurity Framework is a flexible, widely-used framework organised around five functions, identify, protect, detect, respond and recover, that helps structure a security programme (it is not a certification). Cyber Essentials is the UK's basic-five-controls baseline (firewalls, secure configuration, access control, update management, malware protection), achievable and often required for UK government work. UK GDPR is different from all of these: it is law, a mandatory legal requirement for handling personal data, not a voluntary framework you adopt, so it should be kept separate from frameworks. Security certification matters commercially because certification against a recognised standard, especially ISO 27001, is often a precondition for doing business: enterprise customers and government buyers frequently require their suppliers to be certified before trusting them with data or contracts, so demonstrable security enables sales and partnerships. That makes security a business enabler, not just a cost, and GRC professionals who can help achieve and maintain certification genuinely valuable.",
    },
    quiz: [
      {
        q: "What is ISO 27001?",
        options: [
          "A UK law on data protection",
          "An international, certifiable standard for an information-security management system",
          "A type of malware",
          "A free basic-controls checklist",
        ],
        answer: 1,
        why: "ISO 27001 is the certifiable ISMS standard, often required in enterprise contracts. Cyber Essentials is the basic-controls baseline; GDPR is law.",
      },
      {
        q: "How does UK GDPR differ from a framework like the NIST CSF?",
        options: [
          "It does not differ",
          "GDPR is mandatory law; a framework is a structured approach you choose to adopt",
          "The CSF is a law too",
          "GDPR is a certification you buy",
        ],
        answer: 1,
        why: "Law is compulsory; frameworks are adopted (some certifiable). Keeping the two separate is important GRC literacy.",
      },
      {
        q: "Why does security certification matter commercially?",
        options: [
          "It is just paperwork with no value",
          "Certification (especially ISO 27001) is often required to win enterprise and government contracts, so it enables business",
          "It makes systems slower",
          "Only regulators care about it",
        ],
        answer: 1,
        why: "Demonstrable, certified security is frequently a precondition for deals, turning security into a business enabler.",
      },
    ],
  },

  wrap: {
    headline: "You now have a clear map of the key frameworks, and know why certification carries real commercial weight.",
    takeaways: [
      "Frameworks give structure: ISO 27001 (certifiable ISMS), NIST CSF (five functions), Cyber Essentials (UK baseline).",
      "Law (UK GDPR) is mandatory and separate from voluntary frameworks; GRC covers both.",
      "Certification, especially ISO 27001, is often required to do business, making security a commercial enabler.",
    ],
    project: {
      name: "Decode the job ad",
      blurb: "Find a real GRC or security job advert and note every framework, standard or law it mentions (ISO 27001, NIST, Cyber Essentials, GDPR, and others). Look up any you do not know in one line. Being able to read these names fluently in job ads is a concrete step toward being hireable in GRC.",
    },
    ethicsNote: "Frameworks and certification are about managing and demonstrating security honestly. Pursue them with genuine implementation, not box-ticking, and meet legal obligations alongside them (Module 5).",
  },
};

export default topic2;

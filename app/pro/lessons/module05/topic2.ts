import type { TopicManifest } from "../../learn/types";
import { GdprDataLab } from "../../learn/conceptLabs";

/* Module 5 - Topic 2: UK GDPR and data protection in plain English.
 * Case: British Airways, fined GBP 20m by the ICO in October 2020 over
 * a 2018 breach affecting the personal and card data of hundreds of
 * thousands of customers. Public record: the ICO's published penalty
 * notice and 2020 reporting. */
const topic2: TopicManifest = {
  id: "m5t2",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "UK GDPR and data protection",
  role: "Most of what you will protect in this field is personal data, and the law that governs it shapes how every organisation handles security. Analysts and GRC professionals are expected to speak this language fluently; it is Security+ Domain 5 and the heart of most real jobs.",
  minutes: 17,
  promise: "Learn what data protection law actually requires, then see the fine that put a number on getting security wrong.",
  brief: "In this lesson, we'll make sense of UK GDPR and the Data Protection Act, without the legalese. You'll learn what counts as personal data, the handful of principles every organisation must follow, and the duty to report breaches fast. Then we'll see the ICO's 20 million pound fine against British Airways, and why 'we take security seriously' means nothing without the measures to back it.",

  learn: [
    {
      heading: "What the law protects, and who enforces it",
      body: [
        "UK GDPR, alongside the Data Protection Act 2018, governs how organisations handle personal data: any information relating to an identifiable living person. A name, an email, an IP address tied to someone, all of it counts. A smaller set, called special-category data, covers extra-sensitive things like health, religion or sexuality, and gets stronger protection.",
        "The regulator is the ICO, the Information Commissioner's Office. It can investigate, order changes, and issue fines large enough to matter to even the biggest companies. For a security professional, the ICO is the body whose expectations you are helping your employer meet.",
      ],
      examples: [
        "Personal data: a customer's name, address, email, or an IP address logged against them.",
        "Special-category: medical records, religious beliefs, trade-union membership, biometric data.",
        "Not personal data: genuinely anonymised statistics that cannot be traced to anyone.",
      ],
      analogy: {
        plain: "Think of personal data as belongings a company is holding in trust for its customers. The law says: look after them, only use them for what you agreed, and tell people quickly if they are lost.",
        realTerm: "personal data",
      },
    },
    {
      heading: "The principles, in plain English",
      body: [
        "You do not need the law memorised, but you should know its spirit. Organisations must have a valid reason to use personal data and be upfront about it. They should collect only what they need, keep it accurate, and not hoard it forever. And, the principle security lives inside, they must keep it secure, protected against loss, theft and unauthorised access.",
        "That security principle is where your work connects directly to the law. Weak passwords, unpatched servers, no encryption, no access control: these are not just technical failings, they are potential breaches of a legal duty. When you harden a system, you are helping your employer meet an obligation, not just following best practice.",
      ],
      examples: [
        "Collect only what you need: a newsletter sign-up does not need a date of birth.",
        "Keep it secure: encryption, access control and patching are the law's 'appropriate measures' in practice.",
        "Do not keep it forever: old data you no longer need is risk with no benefit.",
      ],
    },
    {
      heading: "Breaches, and the 72-hour clock",
      body: [
        "When personal data is breached in a way that risks people's rights, the organisation generally must report it to the ICO within 72 hours of becoming aware, and tell affected individuals if the risk to them is high. That tight clock is why incident response, which you will meet properly in Act 3, is a legal matter as much as a technical one.",
        "The consequences of getting security wrong are real and public. The ICO publishes its penalty notices, and the fines have reached the tens of millions. Crucially, fines often turn on a failure to take appropriate security measures, exactly the measures this course teaches you to put in place.",
      ],
      examples: [
        "Report to the ICO within 72 hours of becoming aware of a risky breach.",
        "Tell affected people directly when the risk to them is high, so they can protect themselves.",
        "The size of a fine often reflects how avoidable the failure was.",
      ],
      analogy: {
        plain: "If a bank lost a vault full of customers' valuables, you would expect it to raise the alarm immediately and explain itself, not quietly hope nobody noticed. The 72-hour rule makes that duty the law.",
        realTerm: "breach notification",
      },
    },
  ],

  glossary: [
    { term: "UK GDPR", definition: "The UK's data protection regulation, working with the Data Protection Act 2018, governing how organisations handle personal data." },
    { term: "personal data", definition: "Any information relating to an identifiable living person: names, emails, addresses, and often IP addresses." },
    { term: "special-category data", definition: "Extra-sensitive personal data such as health, religion, ethnicity, sexuality or biometrics, given stronger legal protection." },
    { term: "ICO", definition: "The Information Commissioner's Office: the UK regulator that enforces data protection law and can issue large fines." },
    { term: "breach notification", definition: "The duty to report a risky personal-data breach to the ICO, usually within 72 hours, and to tell affected people when the risk is high." },
  ],

  seeHeading: "The fine that put a number on weak security",

  cases: [
    {
      org: "British Airways",
      year: "2020",
      headline: "A 20 million pound fine for a breach that good security measures would have stopped",
      whatHappened: "In 2018, attackers compromised British Airways' systems and skimmed the personal and payment-card details of a large number of customers by diverting them to a fraudulent page. Investigating under GDPR, the ICO found BA had not had appropriate security measures in place: the kind of access controls, monitoring and testing that could have detected and prevented the intrusion. In October 2020 it issued a 20 million pound penalty, reduced from a much higher initial figure partly in light of the pandemic's impact on the airline.",
      theMissedMeasure: "Appropriate technical security. The ICO pointed to measures that were available and not applied, such as tighter access control, better monitoring, and rigorous testing, which could have stopped or caught the attack.",
      theCost: "A 20 million pound fine, the personal and card data of hundreds of thousands of customers exposed, and lasting reputational damage, all under the security principle of data protection law.",
      control: "access-control",
      impact: ["GBP 20m ICO penalty (reduced from an initial GBP 183m intention)", "hundreds of thousands of customers' data exposed", "the finding turned on a failure of appropriate security measures"],
      source: "Public record; the ICO's published penalty notice (October 2020) and contemporaneous reporting.",
      brandColor: "#2e5c99",
      news: { headline: "British Airways fined £20m over data breach", outlet: "BBC News", date: "October 2020" },
    },
  ],

  lab: {
    title: "What counts as personal data?",
    intro: "Nothing to install and nothing leaves this page. Sort each item: ordinary personal data, extra-sensitive special-category data, or not personal data at all.",
    prompts: [
      "Ask: can this identify a living person?",
      "The special-category bucket is for the extra-sensitive kinds the law guards most tightly.",
      "The 'not personal data' line is thinner than people think: context can make almost anything identifying.",
    ],
    component: GdprDataLab,
  },

  check: {
    explain: {
      prompt: "A colleague says 'data protection is just paperwork for the legal team, nothing to do with security.' Using the British Airways fine, explain why they are wrong.",
      modelAnswer: "Data protection law contains a security principle: organisations must protect personal data with appropriate measures. British Airways was fined 20 million pounds precisely because the ICO found its security measures were not good enough to prevent or detect the 2018 breach. So the access control, monitoring, patching and testing a security professional does are the law in action, not separate from it. Weak security is not only a technical problem; it can be a breach of a legal duty with public, costly consequences.",
    },
    quiz: [
      {
        q: "Which of these is special-category (extra-sensitive) personal data under UK GDPR?",
        options: [
          "A customer's postal address",
          "A person's health records",
          "A company's quarterly sales total",
          "A work email address",
        ],
        answer: 1,
        why: "Health data is explicitly special-category and protected more strictly. An address and a work email are ordinary personal data; a sales total with no individual attached is not personal data at all.",
      },
      {
        q: "An organisation discovers a breach that puts customers' data at real risk. What does UK GDPR generally require?",
        options: [
          "Nothing, unless a customer complains",
          "Report it to the ICO, usually within 72 hours of becoming aware, and tell affected people if the risk is high",
          "Wait until the end of the financial year to disclose it",
          "Only tell the police",
        ],
        answer: 1,
        why: "The 72-hour notification duty to the ICO, plus telling high-risk individuals, is core to the law, which is why fast incident response is a legal matter too.",
      },
      {
        q: "What did the British Airways fine mainly turn on?",
        options: [
          "That a breach happened at all, no matter what BA did",
          "A failure to have appropriate security measures that could have prevented or detected the attack",
          "BA refusing to pay customers compensation",
          "An employee leaking data on purpose",
        ],
        answer: 1,
        why: "The ICO's finding was about inadequate security measures. The lesson: 'taking security seriously' means having the measures in place, which is exactly the work this course teaches.",
      },
    ],
  },

  wrap: {
    headline: "You can now connect the security work you are learning to the legal duty it satisfies.",
    takeaways: [
      "UK GDPR protects personal data, guards special-category data most tightly, and is enforced by the ICO.",
      "Its security principle means your technical work, access control, encryption, patching, testing, is the law in practice.",
      "Risky breaches must usually be reported to the ICO within 72 hours, so incident response is a legal duty as well as a technical one.",
    ],
    project: {
      name: "Map your audit to the law",
      blurb: "Look back at the Personal Security Audit you began in Module 3. For two of the actions you took, write a line on which data-protection idea they serve, for example 'turning on MFA protects personal data against unauthorised access'. Connecting a concrete action to the principle behind it is exactly how GRC professionals think, and it strengthens your first portfolio piece.",
    },
    ethicsNote: "Handling other people's personal data, even data you can see, carries legal duties. Never collect, copy or expose personal data you are not authorised to, a rule that applies with full force to every lab from Act 2 onwards.",
  },
};

export default topic2;

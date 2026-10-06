import type { TopicManifest } from "../../learn/types";
import { PolicyControlLab } from "../../learn/conceptLabs";

/* Module 17 - Topic 3: policies, standards and controls. Case: the
 * common, documented failure of "policy on paper", where organisations
 * have written security policies that are not actually enforced or
 * followed, so the control exists only on paper. Public record:
 * repeated audit and breach findings on policy-practice gaps. */
const topic3: TopicManifest = {
  id: "m17t3",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "Policies, standards & controls",
  role: "GRC turns intentions into reality through a hierarchy of documents and safeguards: policies, standards, procedures and controls. Understanding how they fit together, and why a policy nobody follows is worthless, is essential for building or auditing a real security programme.",
  minutes: 15,
  promise: "Learn how security intentions become real safeguards, and why a policy that only exists on paper protects no one.",
  brief: "In this lesson, we'll learn how organisations turn security intentions into reality: policies (high-level intent), standards (specific rules), procedures (step-by-step how-to), and controls (the actual safeguards). We'll see how these fit together, and the crucial lesson that documents mean nothing unless the controls behind them actually work. Then we'll look at the common, costly failure of 'policy on paper'.",

  learn: [
    {
      heading: "From intent to safeguard: the hierarchy",
      body: [
        "Security in an organisation flows through a hierarchy. A policy states high-level intent: what the organisation will do and why ('we will protect customer data'). A standard is a specific, measurable rule that supports the policy ('all passwords must be at least 12 characters with MFA'). A procedure is the step-by-step how-to that implements standards ('to onboard a user: 1, 2, 3...'). And a control is the actual safeguard that does the protecting (the MFA system itself, enforcing the second factor).",
        "Understanding this hierarchy matters because each layer has a different job, and GRC work moves between them: writing clear policies, defining workable standards, documenting procedures, and ensuring the controls genuinely exist and work. A common beginner confusion is to treat these as interchangeable; keeping them distinct is part of GRC literacy, and it is how a programme stays coherent from intention down to action.",
      ],
      examples: [
        "Policy: high-level intent ('we will protect customer data').",
        "Standard: specific rule ('12-character passwords, MFA'). Procedure: the steps to do it.",
        "Control: the actual safeguard (the MFA system enforcing the second factor).",
      ],
      analogy: {
        plain: "A policy is 'we value road safety'; a standard is 'speed limit 30 here'; a procedure is how you enforce it; the control is the speed camera actually catching speeders. Intent, rule, method, safeguard.",
        realTerm: "policy / standard / procedure / control",
      },
    },
    {
      heading: "Controls are where security actually happens",
      body: [
        "Of the four, controls are where protection actually occurs. A policy can be beautifully written and a standard perfectly clear, but if the control, the real safeguard, is not in place and working, nothing is protected. This is the crucial insight GRC must never lose: documents describe and require security, but controls deliver it. The whole point of the policies and standards is to drive the implementation and operation of effective controls.",
        "Controls come in the types you met in Module 1: preventive (stop it happening), detective (spot it happening), corrective (put it right afterwards), spanning technical measures (firewalls, MFA), processes (access reviews), and people (training). A good programme has the right mix, driven by its policies and standards. GRC's job is to ensure the chain holds all the way down: that intentions become real, working safeguards, not just paperwork.",
      ],
      examples: [
        "Documents describe and require security; controls deliver it.",
        "Controls are preventive, detective or corrective; technical, process or people.",
        "GRC ensures the chain holds: intentions become real, working safeguards.",
      ],
    },
    {
      heading: "The 'policy on paper' trap",
      body: [
        "The most common and dangerous failure in this area is the 'policy on paper': an organisation has all the right documents, impressive policies, detailed standards, but the controls behind them are not actually in place or followed. On paper it looks secure and compliant; in reality it is exposed. A password policy nobody enforces, a backup standard no one tests, an access procedure routinely bypassed, each is a control that exists only in writing.",
        "This matters enormously because it creates false assurance: leaders believe they are protected because the documents say so, while the real risk is unaddressed. Audits (the next topic) exist precisely to catch this gap between documented and actual, between 'we have a policy' and 'the control genuinely works'. A good GRC professional is always asking not just 'is there a policy?' but 'does the control actually exist and work?'. That scepticism is exactly what separates real security from paperwork.",
      ],
      examples: [
        "Impressive documents, but the controls behind them are not in place or followed.",
        "It creates false assurance: looks secure on paper, exposed in reality.",
        "Always ask: not just 'is there a policy?' but 'does the control actually work?'.",
      ],
      analogy: {
        plain: "A fire-safety policy on the wall means nothing if the extinguishers are empty and the exits are locked. The document is not the safety; the working safeguard is.",
        realTerm: "policy-practice gap",
      },
    },
  ],

  glossary: [
    { term: "policy", definition: "A high-level statement of what an organisation will do and why ('we will protect customer data')." },
    { term: "standard", definition: "A specific, measurable rule that supports a policy ('passwords must be 12+ characters with MFA')." },
    { term: "procedure", definition: "A step-by-step how-to that implements standards (e.g. the exact steps to onboard a user securely)." },
    { term: "control", definition: "The actual safeguard that delivers protection (the MFA system, the firewall, the access review); where security really happens." },
  ],

  seeHeading: "When the policy existed but the control did not",

  cases: [
    {
      org: "The 'policy on paper' gap",
      year: "recurring",
      headline: "Organisations with the right documents, but controls that were never real, are breached anyway",
      whatHappened: "A recurring finding across audits and breach investigations is the gap between policy and practice: organisations that have all the right security documents, policies, standards, procedures, but where the controls behind them are not actually in place, enforced or tested. The password policy nobody enforces, the backup standard never tested by an actual restore, the access procedure routinely bypassed for convenience. On paper the organisation looks secure and compliant; in reality, the controls that would protect it do not genuinely work, and breaches follow.",
      theMissedMeasure: "Effective, verified controls, not just documented ones. The lesson is that documents describe and require security but controls deliver it, so a programme must ensure the real safeguards exist and work, which is exactly what audits check and what a good GRC professional continually verifies.",
      theCost: "The cost is false assurance leading to real breaches: leaders believe the paperwork means they are protected, while the actual risk is unaddressed, a gap that audits and sceptical GRC professionals exist to close.",
      control: "secure-configuration",
      impact: ["right documents, but controls not actually in place", "false assurance: secure on paper, exposed in reality", "the gap audits exist to catch"],
      source: "Public record; repeated audit and breach findings on policy-practice gaps.",
      brandColor: "#8e7cc3",
      news: { headline: "Policy on paper: why documented security is not the same as real security", outlet: "Audit and breach findings (recurring)", date: "recurring" },
    },
  ],

  lab: {
    title: "Policy, standard, procedure, or control?",
    intro: "Nothing to install and nothing leaves this page. Tap each example, then tap which it is.",
    prompts: [
      "Policy: high-level intent. Standard: specific rule. Procedure: the steps. Control: the actual safeguard.",
      "The control is the thing actually doing the protecting.",
      "Keeping these distinct is real GRC literacy.",
    ],
    component: PolicyControlLab,
  },

  check: {
    explain: {
      prompt: "Explain the hierarchy of policy, standard, procedure and control, why controls are where security actually happens, and what the 'policy on paper' trap is.",
      modelAnswer: "The hierarchy flows from intent to safeguard: a policy states high-level intent (what the organisation will do and why, e.g. 'we will protect customer data'); a standard is a specific, measurable rule that supports it (e.g. '12-character passwords with MFA'); a procedure is the step-by-step how-to that implements standards; and a control is the actual safeguard that does the protecting (the MFA system enforcing the second factor). Controls are where security actually happens because, however well-written the policy and standard, if the control is not in place and working, nothing is protected, documents describe and require security, but controls deliver it. The 'policy on paper' trap is the common, dangerous failure where an organisation has all the right documents but the controls behind them are not actually in place, enforced or tested, so it looks secure and compliant on paper while being exposed in reality. This creates false assurance, leaders believe they are protected because the documents say so, while the real risk is unaddressed, which is exactly why audits exist to catch the gap and why a good GRC professional always asks not just 'is there a policy?' but 'does the control actually work?'.",
    },
    quiz: [
      {
        q: "In the GRC hierarchy, what is a 'control'?",
        options: [
          "A high-level statement of intent",
          "The actual safeguard that delivers protection (e.g. the MFA system enforcing a second factor)",
          "A step-by-step how-to",
          "A specific measurable rule",
        ],
        answer: 1,
        why: "Policy is intent, standard is the rule, procedure is the steps, and the control is the real safeguard doing the protecting.",
      },
      {
        q: "Why are controls 'where security actually happens'?",
        options: [
          "Because documents protect you",
          "Because however good the policy, nothing is protected unless the real safeguard is in place and working",
          "Because policies are more important",
          "They are not; paperwork is enough",
        ],
        answer: 1,
        why: "Documents describe and require security; controls deliver it. The whole point of policies and standards is to drive working controls.",
      },
      {
        q: "What is the 'policy on paper' trap?",
        options: [
          "Having too few policies",
          "Having the right documents but controls that are not actually in place, enforced or tested, creating false assurance",
          "Writing policies on actual paper",
          "A type of phishing",
        ],
        answer: 1,
        why: "It looks secure and compliant on paper while being exposed in reality, which is exactly what audits and sceptical GRC professionals exist to catch.",
      },
    ],
  },

  wrap: {
    headline: "You can now turn security intent into real safeguards, and spot the fatal gap between paper and practice.",
    takeaways: [
      "The hierarchy: policy (intent), standard (rule), procedure (steps), control (the actual safeguard).",
      "Controls are where security actually happens; documents describe and require it, controls deliver it.",
      "Beware 'policy on paper': always ask whether the control genuinely exists and works, not just whether a policy exists.",
    ],
    project: {
      name: "Trace one control",
      blurb: "Pick one security measure (say, MFA) and write its full chain: the policy it serves, the standard that requires it, the procedure to implement it, and the control itself. Then ask the GRC question: how would you verify the control actually works? Tracing intent to working safeguard is exactly what GRC does.",
    },
    ethicsNote: "GRC's job is to make security real, not just documented. Pursue genuine, working controls and honest verification, never box-ticking that creates false assurance, within the integrity the field demands.",
  },
};

export default topic3;

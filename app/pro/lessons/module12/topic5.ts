import type { TopicManifest } from "../../learn/types";
import { HardeningChecklistLab } from "../../learn/conceptLabs";

/* Module 12 - Topic 5: build a hardening checklist. Case: the CIS
 * Benchmarks (Center for Internet Security), free, consensus-built,
 * widely-used secure-configuration baselines for common systems.
 * Public record: the CIS Benchmarks project. */
const topic5: TopicManifest = {
  id: "m12t5",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "Build a hardening checklist",
  role: "The practical output of this module is a hardening checklist, a concrete, repeatable list that turns secure-configuration principles into action. Being able to produce and apply one is exactly the kind of tangible defensive deliverable employers value.",
  minutes: 15,
  promise: "Turn everything in this module into a reusable hardening checklist, and meet the free, ready-made baselines the whole industry uses.",
  brief: "In this lesson, we'll make the module practical by building a hardening checklist: a clear, repeatable list of the steps that make a system safe by default. We'll see what belongs on it, how to use it, and that you do not have to invent it from scratch, because trusted, free, consensus-built baselines already exist. We'll look at the CIS Benchmarks, the hardening checklists much of the industry relies on.",

  learn: [
    {
      heading: "A checklist turns principles into action",
      body: [
        "Everything in this module, removing defaults, reducing attack surface, least privilege, patching, becomes real when it is written as a checklist: a concrete, repeatable list of the hardening steps for a type of system. A checklist converts good intentions into consistent action, makes nothing easy to forget, and lets anyone (not just an expert) apply the same hardened baseline every time.",
        "The power of a checklist is consistency and completeness. Humans forget steps, especially under pressure or when building many systems; a checklist does not. This is exactly why safety-critical fields, from aviation to surgery, rely on them. In security, a hardening checklist is how you make 'secure by default' something you actually achieve on every system, not just intend.",
      ],
      examples: [
        "A checklist is a concrete, repeatable list of hardening steps for a system type.",
        "It makes nothing easy to forget, and lets anyone apply the same baseline.",
        "Consistency and completeness are its superpowers, as in aviation and surgery.",
      ],
      analogy: {
        plain: "A pilot's pre-flight checklist ensures every critical step is done every time, no matter how experienced the pilot or how routine the flight.",
        realTerm: "hardening checklist",
      },
    },
    {
      heading: "What belongs on it",
      body: [
        "A good hardening checklist draws directly on this module. Typical items: change or remove all default passwords and accounts; disable or uninstall services and features you do not use; close unnecessary ports; apply least privilege and remove unneeded admin rights; enable automatic security updates; turn on logging and monitoring so activity is recorded; and ensure malware protection is active. Each item reduces risk in a specific, checkable way.",
        "Notice that these map neatly onto the Cyber Essentials controls and the principles you have learned, the checklist is simply those principles made concrete and actionable for a particular system. Different system types (a laptop, a server, a cloud account) will have tailored checklists, but the shape is always the same: a list of specific, verifiable steps that together produce a hardened baseline.",
      ],
      examples: [
        "Remove defaults, disable unused features, close spare ports.",
        "Apply least privilege, enable auto-updates, turn on logging, ensure malware protection.",
        "Each item is specific and checkable, and maps to the controls you have learned.",
      ],
    },
    {
      heading: "You do not have to start from scratch",
      body: [
        "The reassuring news is that you rarely need to invent a hardening checklist yourself. Trusted organisations publish detailed, consensus-built secure-configuration baselines for common systems, operating systems, cloud platforms, databases, browsers, free to use. These give you a thorough, expert-reviewed checklist to adopt and adapt, rather than guessing what matters.",
        "The best-known are the CIS Benchmarks, which you are about to see. Using such a baseline means you benefit from the collective expertise of the whole community, and you can even check systems against the benchmark automatically. The professional approach is: adopt a trusted baseline, tailor it to your needs, apply it consistently, and review against it, which is hardening done properly, at scale.",
      ],
      examples: [
        "Free, expert, consensus-built baselines exist for common systems.",
        "Adopt and adapt one rather than guessing what matters.",
        "You can often check systems against the baseline automatically.",
      ],
      analogy: {
        plain: "You do not design your own electrical safety standards; you follow established codes written by experts, and inspect against them. Hardening baselines are those codes for systems.",
        realTerm: "CIS Benchmarks",
      },
    },
  ],

  glossary: [
    { term: "hardening checklist", definition: "A concrete, repeatable list of the steps that make a type of system safe by default." },
    { term: "CIS Benchmarks", definition: "Free, consensus-built secure-configuration baselines for common systems, from the Center for Internet Security, widely used industry-wide." },
    { term: "secure baseline", definition: "A known-good, safe configuration applied consistently; a hardening checklist is how you achieve and verify it." },
    { term: "configuration review", definition: "Checking a system against its hardening baseline (often automatically) to find and fix any drift or gaps." },
  ],

  seeHeading: "The hardening checklists the industry shares",

  cases: [
    {
      org: "CIS Benchmarks",
      year: "2000",
      headline: "Free, consensus-built hardening baselines that much of the industry relies on",
      whatHappened: "The Center for Internet Security publishes the CIS Benchmarks: detailed, consensus-developed secure-configuration guides for a huge range of common systems, operating systems, cloud platforms, databases, browsers and more. They are free, created by a broad community of experts, and kept up to date. Organisations worldwide use them as ready-made hardening checklists, adopting and tailoring the recommended settings, and often checking their systems against the benchmark automatically to find misconfigurations.",
      theMissedMeasure: "The Benchmarks are the constructive answer to the misconfiguration risk this module has stressed: rather than every organisation guessing how to harden each system, they provide an expert, shared, verifiable baseline. Adopting one turns secure configuration from an art into a repeatable, checkable process.",
      theCost: "Here the value is empowerment: free access to collective expertise means even a small organisation can harden its systems to a professional standard, and verify it, which is exactly the proportionate, achievable defence Act 3 champions.",
      control: "secure-configuration",
      impact: ["free, consensus-built hardening baselines for common systems", "used industry-wide, often with automated checking", "turns secure configuration into a repeatable process"],
      source: "Public record; the CIS Benchmarks project (Center for Internet Security).",
      brandColor: "#1b5e9c",
      news: { headline: "CIS Benchmarks: the free hardening baselines used across the industry", outlet: "Center for Internet Security", date: "2000 onwards" },
    },
  ],

  lab: {
    title: "What belongs on a hardening checklist?",
    intro: "Nothing to install and nothing leaves this page. For each item, decide: does it belong on a hardening checklist, or is it something else?",
    prompts: [
      "Hardening is about reducing risk: defaults, unused features, privilege, updates, logging.",
      "If it does not reduce risk, it is not a hardening step.",
      "This is the practical output of the whole module.",
    ],
    component: HardeningChecklistLab,
  },

  check: {
    explain: {
      prompt: "Why is a hardening checklist such an effective tool, what sort of items belong on it, and why is it wise to start from a trusted baseline like the CIS Benchmarks rather than inventing your own?",
      modelAnswer: "A hardening checklist is effective because it turns the principles of secure configuration into concrete, repeatable action: it makes nothing easy to forget, and lets anyone apply the same hardened baseline consistently, exactly why safety-critical fields like aviation and surgery rely on checklists. Typical items draw straight from the module: change or remove default passwords and accounts, disable unused services and features, close unnecessary ports, apply least privilege and remove needless admin rights, enable automatic security updates, turn on logging and monitoring, and ensure malware protection, each a specific, checkable step that reduces risk. It is wise to start from a trusted baseline like the CIS Benchmarks because you do not have to guess what matters: these free, consensus-built, expert-reviewed baselines give you a thorough checklist to adopt and adapt, you benefit from the whole community's expertise, and you can often check systems against them automatically. Adopting a trusted baseline, tailoring it, applying it consistently and reviewing against it is hardening done properly and at scale.",
    },
    quiz: [
      {
        q: "Why is a hardening checklist so effective?",
        options: [
          "It looks professional",
          "It turns principles into consistent, repeatable action so nothing is forgotten, and anyone can apply the same baseline",
          "It replaces the need for any other control",
          "It is required by law",
        ],
        answer: 1,
        why: "Consistency and completeness are the point, as in aviation and surgery: a checklist does not forget steps the way humans do.",
      },
      {
        q: "Which of these belongs on a hardening checklist?",
        options: [
          "Pick a nicer desktop wallpaper",
          "Change or remove all default passwords and accounts",
          "Increase the screen brightness",
          "Add more browser bookmarks",
        ],
        answer: 1,
        why: "Removing defaults is a core hardening step. Cosmetic choices are not about reducing risk.",
      },
      {
        q: "Why start from a baseline like the CIS Benchmarks?",
        options: [
          "They are expensive and exclusive",
          "They are free, expert, consensus-built hardening baselines you can adopt, tailor and check against, rather than guessing",
          "They only work for large companies",
          "They replace the need to patch",
        ],
        answer: 1,
        why: "You benefit from the whole community's expertise and can verify systems against the benchmark, turning hardening into a repeatable, checkable process.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 12: you can harden systems in practice and produce a real, reusable hardening checklist.",
    takeaways: [
      "A hardening checklist turns secure-configuration principles into consistent, repeatable, un-forgettable action.",
      "It contains specific, checkable steps: remove defaults, disable unused features, least privilege, auto-update, log, protect.",
      "Start from a trusted baseline like the CIS Benchmarks, then tailor, apply consistently, and review against it.",
    ],
    project: {
      name: "Write your hardening checklist",
      blurb: "Produce a short hardening checklist for one system type you know (a laptop, say): six to ten specific, checkable steps drawn from this module. If you like, compare it against the relevant CIS Benchmark to see what you missed. This checklist is a genuine portfolio artefact, concrete proof you can turn secure-configuration principles into action.",
    },
    ethicsNote: "Building and applying hardening checklists is defensive work on your own or authorised systems. Act 3 continues into detection and response, all constructive, all within the authorisation line from Module 5.",
  },
};

export default topic5;

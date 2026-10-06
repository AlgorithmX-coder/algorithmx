import type { TopicManifest } from "../../learn/types";
import { PatchOpsLab } from "../../learn/conceptLabs";

/* Module 12 - Topic 4: patch and update management (operational). Case:
 * Kaseya VSA, July 2021 (the REvil group exploited a flaw in the Kaseya
 * VSA remote-management tool to push ransomware to managed service
 * providers and their ~1,500 downstream customers). Public record: CISA
 * guidance and 2021 reporting. */
const topic4: TopicManifest = {
  id: "m12t4",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "Patch & update management",
  role: "Module 11 covered the why of patching; this is the operational how, running patching as a reliable process rather than a scramble. It is unglamorous, continuous work that prevents a huge share of breaches, and doing it well is a mark of a mature team.",
  minutes: 15,
  promise: "Turn patching from panic into process, then see a flaw in a trusted management tool push ransomware to 1,500 businesses at once.",
  brief: "In this lesson, we'll make patching operational. You know from Module 11 that winning the patch race prevents most breaches; here we build the process that wins it reliably: inventory, prioritisation, testing, automation and a regular cadence. We'll also see why the tools and suppliers you trust to manage your systems are themselves a risk, through the Kaseya attack, where one flaw in a management tool hit 1,500 businesses.",

  learn: [
    {
      heading: "Patching is a process, not an event",
      body: [
        "Module 11 showed why patching matters; operationally, the goal is to make it a dependable, repeatable process rather than a last-minute scramble each time. That process starts with an inventory: you cannot patch what you do not know you run, so knowing your assets is the foundation. From there you prioritise (by severity and exposure, as you learned), test where sensible to avoid breaking things, apply, and verify.",
        "The key shift is from reactive to routine. A team that only patches when a crisis forces it will always be behind; a team with a regular cadence and good inventory treats most patching as background routine, freeing human attention for the genuinely urgent cases. Reliability here is quiet but hugely valuable: it is the difference between consistently closed doors and a few always left open.",
      ],
      examples: [
        "Inventory first: you cannot patch what you do not know you run.",
        "Prioritise, test sensibly, apply, verify, as a repeatable cycle.",
        "A regular cadence beats crisis-driven scrambling every time.",
      ],
      analogy: {
        plain: "Servicing a fleet of vehicles on a schedule, with a list of every vehicle, beats fixing each one only when it breaks down on the motorway.",
        realTerm: "patch management",
      },
    },
    {
      heading: "Automate the routine, focus humans on the hard cases",
      body: [
        "Most patching can and should be automated. Automatic updates for endpoints and common software handle the steady stream of routine fixes without anyone remembering to act, which is exactly where manual processes fail. Automation is not a luxury; for the volume of updates modern systems need, it is the only way to stay consistently current.",
        "This frees human judgement for where it is actually needed: the critical, exposed, exploited flaws that demand fast decisions, and the systems where a patch must be tested carefully before rollout. The mature pattern is 'automate the routine, deliberate on the exceptions'. It keeps you broadly current by default, and sharp where it counts, instead of exhausting people on tasks a machine should do.",
      ],
      examples: [
        "Auto-update endpoints and common software to handle the routine stream.",
        "Reserve human judgement for critical, exposed flaws and sensitive systems.",
        "'Automate the routine, deliberate on the exceptions' is the mature pattern.",
      ],
    },
    {
      heading: "Your management tools and suppliers are a risk too",
      body: [
        "A sobering operational reality: the very tools and suppliers you use to manage and patch your systems have deep access to them, which makes them a high-value target. If an attacker compromises your remote-management tool, or a supplier who pushes updates to you, they can reach everything that tool or supplier can, which is often everything. This is the supply-chain risk from Module 8, seen from the operations side.",
        "So patch management includes watching the things that do the patching: keeping management tools themselves updated and tightly controlled, limiting their access, and being alert to supplier compromise. It is a reminder that trust must be managed, not assumed. The Kaseya case you are about to see is the definitive example: one flaw in a trusted management tool became ransomware across 1,500 businesses at once.",
      ],
      examples: [
        "Management tools and suppliers have deep access, so they are prime targets.",
        "Keep the tools that do the patching patched and tightly controlled.",
        "Supplier compromise can reach everything the supplier can: manage that trust.",
      ],
      analogy: {
        plain: "The locksmith who can open every door in the building is the person you most need to trust, and most need to be sure has not been compromised.",
        realTerm: "supply-chain / tooling risk",
      },
    },
  ],

  glossary: [
    { term: "patch management", definition: "The operational process of keeping systems updated reliably: inventory, prioritise, test, apply, verify, on a regular cadence." },
    { term: "asset inventory", definition: "A maintained list of the systems and software you run; the foundation of patching, since you cannot patch what you do not know about." },
    { term: "automated updates", definition: "Applying routine updates automatically, the only practical way to stay current at the volume modern systems require." },
    { term: "managed service provider (MSP)", definition: "A supplier that manages IT for other organisations; its deep access makes it a high-value target whose compromise can reach many customers." },
  ],

  seeHeading: "When a management tool pushed ransomware to 1,500 businesses",

  cases: [
    {
      org: "Kaseya VSA",
      year: "2021",
      headline: "One flaw in a trusted management tool became ransomware across 1,500 businesses",
      whatHappened: "In July 2021, the REvil ransomware group exploited a vulnerability in Kaseya VSA, a widely-used remote IT-management tool. Because the tool is used by managed service providers to manage many client businesses, the attackers were able to push ransomware downstream through it, reaching an estimated 1,500 businesses in one coordinated attack. The victims had done nothing obviously wrong themselves; they were compromised through a trusted tool used to manage their systems, a supply-chain attack via the management layer.",
      theMissedMeasure: "The flaw in the management tool needed urgent patching (the patch race), but the deeper lesson is operational: the tools and suppliers with deep access to your systems are high-value targets whose compromise reaches everything. Tightly controlling and monitoring that privileged tooling, and limiting its blast radius, is essential.",
      theCost: "An estimated 1,500 businesses hit with ransomware in a single coordinated attack, widespread disruption, and a defining demonstration that the management and supply layer is itself a critical part of your attack surface.",
      control: "patching",
      impact: ["~1,500 businesses hit via one management-tool flaw", "ransomware pushed downstream through trusted MSP tooling", "the management layer is itself critical attack surface"],
      source: "Public record; CISA guidance and 2021 reporting.",
      brandColor: "#e4002b",
      news: { headline: "Kaseya ransomware attack: up to 1,500 businesses affected", outlet: "BBC News", date: "July 2021" },
    },
  ],

  lab: {
    title: "Build the patch process",
    intro: "Nothing to install and nothing leaves this page. Set up patch management for a small organisation: make the routine, reliable choices.",
    prompts: [
      "Start with an inventory, you cannot patch what you do not know you run.",
      "Prioritise critical, exposed flaws; automate the routine stream.",
      "Turn each cycle from a panic into a dependable process.",
    ],
    component: PatchOpsLab,
  },

  check: {
    explain: {
      prompt: "Explain what turns patching from a scramble into a reliable process, and why the Kaseya attack shows that the tools and suppliers you use to manage systems are themselves a serious risk.",
      modelAnswer: "Patching becomes reliable when it is a repeatable process rather than a crisis response: it starts with an asset inventory (you cannot patch what you do not know you run), then prioritises by severity and exposure, tests sensibly to avoid breakage, applies and verifies, on a regular cadence. The routine stream is automated (auto-updates for endpoints and common software), which frees human judgement for the critical, exposed flaws and the sensitive systems that need care, 'automate the routine, deliberate on the exceptions'. The Kaseya attack shows that the tools and suppliers you use to manage and patch systems have deep access to them, which makes them high-value targets: when REvil exploited a flaw in the Kaseya VSA management tool, they pushed ransomware downstream through it to an estimated 1,500 businesses at once. So patch management must include keeping the management tools themselves patched and tightly controlled, limiting their access, and being alert to supplier compromise, because a trusted tool or supplier that is breached can reach everything it can reach.",
    },
    quiz: [
      {
        q: "What is the foundation of a reliable patch-management process?",
        options: [
          "Buying the newest hardware",
          "An asset inventory: you cannot patch what you do not know you run",
          "Patching only when forced to by a crisis",
          "Turning off updates",
        ],
        answer: 1,
        why: "Knowing what you run is the starting point. Unknown systems are unpatched systems waiting to be breached.",
      },
      {
        q: "What is the mature pattern for patching at scale?",
        options: [
          "Patch everything manually, all at once",
          "Automate the routine updates, and reserve human judgement for critical, exposed or sensitive cases",
          "Never automate anything",
          "Only patch once a year",
        ],
        answer: 1,
        why: "Automation handles the volume reliably; humans focus where decisions and testing genuinely matter.",
      },
      {
        q: "Why does the Kaseya attack make management tools a special concern?",
        options: [
          "They are cheap",
          "They have deep access to many systems, so compromising one can reach everything (and everyone) it manages",
          "They are never targeted",
          "They do not need patching",
        ],
        answer: 1,
        why: "A trusted tool or supplier with broad access is a high-value target; its compromise is a supply-chain attack reaching all it can touch.",
      },
    ],
  },

  wrap: {
    headline: "You can now run patching as a dependable process, and you watch the trusted tools that do the patching too.",
    takeaways: [
      "Patching is a process: inventory, prioritise, test, apply, verify, on a regular cadence, not a scramble.",
      "Automate the routine stream and reserve human judgement for critical, exposed or sensitive cases.",
      "Management tools and suppliers have deep access, so keep them patched and controlled; they are prime targets (Kaseya).",
    ],
    project: {
      name: "Check your cadence",
      blurb: "For your own devices, confirm automatic updates are on where possible, and note anything that updates only manually. Then think of one tool or service with deep access to your digital life (a password manager, a cloud account) and check it is well protected. Seeing patching as an ongoing process, including for the tools you trust most, is the operational mindset this topic builds.",
    },
    ethicsNote: "Patch management is defensive operations on your own or authorised systems. Studying supply-chain and tooling risk is to defend against it, within the authorisation line from Module 5.",
  },
};

export default topic4;

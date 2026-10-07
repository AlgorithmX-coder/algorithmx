import type { TopicManifest } from "../../learn/types";
import { AttackMappingLab } from "../../learn/conceptLabs";

/* Module 15 - Topic 4: mapping activity to MITRE ATT&CK. Case: MITRE
 * ATT&CK itself, as the shared framework defenders use to describe,
 * detect and measure coverage of attacker behaviour. Public record: the
 * MITRE ATT&CK knowledge base. */
const topic4: TopicManifest = {
  id: "m15t4",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Mapping to MITRE ATT&CK",
  role: "MITRE ATT&CK is the shared language defenders use to describe attacker behaviour precisely, and mapping activity to it is how a SOC understands what it is seeing, builds detections, and measures its coverage. Fluency here is expected in detection roles.",
  minutes: 15,
  promise: "Learn to map what an attacker does onto the industry's shared framework, and use it to see your own blind spots.",
  brief: "In this lesson, we'll put MITRE ATT&CK to work. You met it in Module 6 as the detailed catalogue of attacker techniques; here we use it as a defender's tool: mapping observed activity onto ATT&CK's tactics (the attacker's goals) and techniques (how they achieve them), so you can describe attacks precisely, build detections against specific behaviours, and measure where your coverage is strong or weak.",

  learn: [
    {
      heading: "Tactics and techniques: a shared map of behaviour",
      visual: { id: "attack-steps" },
      body: [
        "MITRE ATT&CK organises attacker behaviour into tactics and techniques. A tactic is the attacker's goal at a stage, for example initial access (get in), persistence (stay), lateral movement (spread), exfiltration (steal data out). A technique is a specific way of achieving a tactic, for example phishing as a way to get initial access. Together they form a detailed, shared map of how attacks actually unfold, built from real-world observation.",
        "The power is a common, precise language. When an analyst says an activity maps to a specific ATT&CK technique, every defender knows exactly what is meant, can look up how to detect and mitigate it, and can compare notes without ambiguity. It turns vague descriptions ('they did something sneaky to stay hidden') into precise, shareable, actionable statements ('they used this persistence technique').",
      ],
      examples: [
        "Tactic = the goal (initial access, persistence, lateral movement, exfiltration).",
        "Technique = a specific way to achieve it (e.g. phishing for initial access).",
        "A shared, precise language: name the technique, and everyone knows what you mean.",
      ],
      analogy: {
        plain: "It is like a shared playbook of an opponent's moves, with an agreed name for each. 'They ran the screen pass' tells every coach exactly what happened, and how to defend it.",
        realTerm: "ATT&CK tactics and techniques",
      },
    },
    {
      heading: "Mapping activity: understanding what you see",
      body: [
        "Mapping observed activity onto ATT&CK is a core detection skill. When you see something in the logs, phishing, then a scheduled task that re-launches malware, then connections to internal servers, then data leaving, you map each to its tactic (initial access, persistence, lateral movement, exfiltration). Suddenly a jumble of events becomes a clear story of an attack's progress, told in a language everyone shares.",
        "This does more than describe; it guides. Knowing which tactic you are seeing tells you what the attacker is trying to do and often what they will do next, so you can look for it. It connects directly to the kill chain from Module 6: ATT&CK is the detailed, named version of those stages, and mapping to it turns raw observation into informed understanding and anticipation.",
      ],
      examples: [
        "Map each observed action to its tactic to turn a jumble into a clear attack story.",
        "Knowing the tactic hints at what the attacker will do next, so you can watch for it.",
        "It is the detailed, named version of the kill chain from Module 6.",
      ],
    },
    {
      heading: "Measuring coverage: finding your blind spots",
      body: [
        "ATT&CK has a second, powerful defensive use: measuring your detection coverage. Because it lays out the techniques attackers actually use, you can ask, for each one, 'would we detect this?'. Mapping your existing detections onto the ATT&CK framework reveals, visually, where you are strong and, crucially, where you have blind spots, techniques you currently could not catch. Those gaps become your priority list for new detections.",
        "This turns detection from guesswork into a measurable, improvable programme. Instead of hoping you would catch an attack, you can show, against a shared standard, what you would and would not catch, and systematically close the gaps. It is exactly the kind of structured, evidence-based thinking that marks a mature security team, and a strong analyst. The ATT&CK framework itself is the free, shared resource that makes all of this possible.",
      ],
      examples: [
        "For each technique, ask: would we detect this?",
        "Mapping detections onto ATT&CK reveals strengths and blind spots visually.",
        "Gaps become your prioritised list for building new detections.",
      ],
      analogy: {
        plain: "It is like checking a building's security camera coverage against a map: you can see exactly which corridors are watched and which are blind, and where to add cameras first.",
        realTerm: "ATT&CK coverage mapping",
      },
    },
  ],

  glossary: [
    { term: "MITRE ATT&CK", definition: "A free, shared knowledge base organising real attacker behaviour into tactics (goals) and techniques (how), used to describe, detect and measure coverage." },
    { term: "tactic", definition: "An attacker's goal at a stage of an attack, such as initial access, persistence, lateral movement or exfiltration." },
    { term: "technique", definition: "A specific way of achieving a tactic, such as phishing for initial access; the detailed, named behaviours in ATT&CK." },
    { term: "coverage mapping", definition: "Mapping your detections onto ATT&CK to see which techniques you can catch and where your blind spots are." },
  ],

  seeHeading: "The shared language of attacker behaviour",

  cases: [
    {
      org: "MITRE ATT&CK",
      year: "2015",
      headline: "A free, shared framework that lets defenders describe, detect and measure attacker behaviour",
      whatHappened: "MITRE ATT&CK is a free, continuously-updated knowledge base that organises real-world attacker behaviour into tactics and techniques, built from observed attacks. Since its public release it has become the shared standard defenders use to describe attacker behaviour precisely, build detections against specific techniques, and measure their detection coverage by mapping what they can and cannot catch onto the framework. It gives the whole community a common language, so a technique described by one team is understood and defended by all.",
      theMissedMeasure: "ATT&CK is itself the constructive measure: it turns 'defend against attackers' into a structured, measurable discipline. Mapping activity to it brings clarity; mapping detections to it reveals and prioritises blind spots, the heart of modern detection engineering.",
      theCost: "Here the value is empowerment: free access to a shared, detailed map of attacker behaviour lets any team, from a beginner analyst to a large SOC, describe attacks precisely and systematically improve their detection, a model of open, collective defence.",
      control: "secure-configuration",
      impact: ["free, shared knowledge base of attacker tactics and techniques", "a common language to describe, detect and measure", "turns detection into a measurable, improvable programme"],
      source: "Public record; the MITRE ATT&CK knowledge base.",
      brandColor: "#c0392b",
      news: { headline: "MITRE ATT&CK: the shared framework behind modern detection", outlet: "MITRE / security reporting", date: "2015 onwards" },
    },
  ],

  lab: {
    title: "Map to the tactic",
    intro: "Nothing to install and nothing leaves this page. Tap each observed activity, then tap the ATT&CK tactic (the attacker's goal) it fits.",
    prompts: [
      "Tactics are goals: initial access (get in), persistence (stay), lateral movement (spread), exfiltration (steal out).",
      "Ask: what is the attacker trying to achieve with this action?",
      "This mapping is how defenders describe and detect attacks precisely.",
    ],
    component: AttackMappingLab,
  },

  check: {
    explain: {
      prompt: "Explain how MITRE ATT&CK organises attacker behaviour, how mapping activity to it helps an analyst, and how it lets a team find its detection blind spots.",
      modelAnswer: "MITRE ATT&CK organises real attacker behaviour into tactics and techniques: a tactic is the attacker's goal at a stage (initial access, persistence, lateral movement, exfiltration), and a technique is a specific way of achieving it (such as phishing for initial access), forming a detailed, shared map built from observed attacks. Mapping observed activity to it helps an analyst because a jumble of events, phishing, then a persistence mechanism, then lateral movement, then data leaving, becomes a clear story of the attack's progress, told in a precise language everyone shares; and knowing which tactic you are seeing hints at what the attacker will do next, so you can watch for it. It lets a team find its detection blind spots because, since ATT&CK lays out the techniques attackers actually use, you can ask for each 'would we detect this?' and map your existing detections onto the framework, which visually reveals where you are strong and where you have gaps, techniques you currently could not catch. Those gaps become your prioritised list for new detections, turning detection from guesswork into a measurable, improvable programme against a shared standard.",
    },
    quiz: [
      {
        q: "In MITRE ATT&CK, what is a 'tactic'?",
        options: [
          "A specific piece of malware",
          "The attacker's goal at a stage of an attack, such as initial access or exfiltration",
          "A type of firewall rule",
          "A password policy",
        ],
        answer: 1,
        why: "Tactics are the goals; techniques are the specific ways of achieving them. Together they map how attacks unfold.",
      },
      {
        q: "How does mapping activity to ATT&CK help an analyst?",
        options: [
          "It slows down investigation",
          "It turns a jumble of events into a clear attack story in a shared language, and hints at what comes next",
          "It replaces the need to investigate",
          "It only helps managers",
        ],
        answer: 1,
        why: "Mapping each action to its tactic reveals the attack's progress precisely and helps anticipate the attacker's next move.",
      },
      {
        q: "How does ATT&CK help a team find detection blind spots?",
        options: [
          "It does not",
          "By mapping your detections onto its techniques, you can see which attacker behaviours you could not catch, and prioritise those",
          "By deleting old alerts",
          "By buying more tools automatically",
        ],
        answer: 1,
        why: "Coverage mapping reveals, against a shared standard, exactly where you are blind, turning detection into a measurable, improvable programme.",
      },
    ],
  },

  wrap: {
    headline: "You can now use ATT&CK as a defender: to describe attacks precisely, detect specific behaviours, and find your blind spots.",
    takeaways: [
      "ATT&CK organises attacker behaviour into tactics (goals) and techniques (how), a shared, precise language.",
      "Mapping observed activity to it turns a jumble of events into a clear attack story and hints at what comes next.",
      "Mapping your detections to it reveals blind spots, turning detection into a measurable, improvable programme.",
    ],
    project: {
      name: "Map a breach to ATT&CK",
      blurb: "Take a breach from this course and map its steps to ATT&CK tactics (initial access, persistence, lateral movement, exfiltration, and more). Then pick one technique and note how you might detect it. Mapping real attacks to the framework is a core detection-analyst exercise and a great portfolio demonstration.",
    },
    ethicsNote: "ATT&CK is a defensive framework for describing and detecting attacks. Use it to improve defences on your own or authorised systems, within the authorisation principles from Module 5.",
  },
};

export default topic4;

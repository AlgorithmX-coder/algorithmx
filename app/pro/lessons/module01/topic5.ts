import type { TopicManifest } from "../../learn/types";
import { MindsetLab } from "../../learn/conceptLabs";

/* Module 1 - Topic 5: thinking like a defender and an attacker. Case:
 * SolarWinds 2020 (a trusted, signed software update was the way in,
 * the case that pushed "assume breach / zero trust" mainstream). Public
 * record: US government findings and wide reporting, 2020-2021. */
const topic5: TopicManifest = {
  id: "m1t5",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "Thinking like a defender, and an attacker",
  role: "As a cyber security analyst, your real edge is thinking like an attacker to find the weak spot first, then switching to the defender's view to close it. This double vision runs through every module that follows.",
  minutes: 18,
  promise: "The two mindsets security runs on, and the attack that broke the deepest assumption of all.",
  brief: "In this lesson, we'll meet the two mindsets security runs on, the attacker's and the defender's. You'll learn to switch between them on demand, then see the attack that broke the deepest assumption of all: that software you already trust is safe.",

  learn: [
    {
      heading: "The attacker asks a different question than you do",
      body: [
        "To defend well, you have to understand how the other side thinks. An attacker does not care about your org chart or your budget. They ask one question: what is the easiest, cheapest way to get what I want? Then they look for the weakest point, which is very often a person, an unpatched system, or a forgotten account.",
        "This is not about becoming a criminal. It is about seeing your own systems the way an attacker would, so you find the weak spot before they do. Certificates and real jobs both reward people who can switch into this view on demand.",
      ],
      examples: [
        "'Who here will click a link if I make the email urgent enough?'",
        "'What did they forget to patch, or leave exposed to the internet?'",
        "'Whose account, if I steal it, reaches the most?'",
      ],
      analogy: {
        plain: "A good locksmith and a good burglar know the same locks. The difference is what they do with the knowledge. You are learning to case your own house so you can secure it.",
        realTerm: "the attacker mindset",
      },
    },
    {
      heading: "The defender assumes they are already in",
      body: [
        "The old defender mindset was to build a strong perimeter and trust everything inside it. The modern one, hard-won from breach after breach, is assume breach: work as if an attacker is already inside somewhere, and design so that this is survivable.",
        "That changes everything. Instead of only asking 'how do I keep them out?', you also ask 'when they get in, how do I detect it fast, and how do I limit what they can reach?'. It is the mindset behind least privilege, segmentation, monitoring, and zero trust, all of which you have started to meet.",
      ],
      examples: [
        "'Assume this account will be stolen one day; what can it touch?'",
        "'If they are already inside, where would my first alert come from?'",
        "'How do I make one compromise a small problem, not a total one?'",
      ],
      analogy: {
        plain: "A good shopkeeper locks the front door, but also keeps the safe locked, watches the cameras, and limits who has the till key, because they assume a thief might already be inside. Locks on the door are not the whole plan.",
        realTerm: "assume breach",
      },
    },
    {
      heading: "The two mindsets are the same map, read two ways",
      body: [
        "Attacker and defender are not opposites so much as two readings of the same map. Every path an attacker would take is a path a defender should watch and block. This is why later modules teach frameworks like MITRE ATT&CK: they lay out the attacker's moves precisely so defenders can cover each one.",
        "Holding both views at once is the real skill of the field. You will practise switching between them throughout the course: recreate an attack to understand it, then put on the defender's hat to stop it. It starts with the simple habit of asking both questions about everything you protect.",
      ],
      examples: [
        "Recreate a phishing attack (attacker), then design the training and filters that beat it (defender).",
        "Run a SQL injection in a safe lab (attacker), then apply the one-line fix (defender).",
        "Read the attacker's playbook so you know exactly what to detect (both).",
      ],
    },
  ],

  glossary: [
    { term: "attacker mindset", definition: "Looking at your own systems the way an attacker would, to find the weakest point before they do. Used for defence, not harm." },
    { term: "assume breach", definition: "The modern defender's stance: work as if an attacker is already inside, and design so that a compromise is detectable and survivable." },
    { term: "zero trust", definition: "Never trusting a user or device just because it is 'inside' the network; verify every access as if it came from outside." },
    { term: "supply chain attack", definition: "Attacking a trusted supplier or piece of software to reach its many customers at once, as in the SolarWinds case." },
  ],

  seeHeading: "When the trusted thing was the attack",

  cases: [
    {
      org: "SolarWinds",
      year: "2020",
      headline: "The attack came through a software update you were told to trust",
      whatHappened: "SolarWinds made network-management software used by thousands of organisations, including large companies and government agencies. Attackers quietly slipped malicious code into a legitimate, digitally signed SolarWinds update. Customers installed it as normal, trusting it because it came from their vendor and was correctly signed. Through that one trusted channel, the attackers reached into a huge number of high-value networks at once.",
      theMissedMeasure: "The deepest assumption, that signed software from a trusted vendor is safe, was the very thing exploited. It is the case most often cited for why 'assume breach' and zero trust (verify, do not simply trust) became mainstream.",
      theCost: "Thousands of organisations were exposed, including multiple US government agencies, and the clean-up and investigation ran for years. It reset how the industry thinks about trusting suppliers and updates.",
      control: "secure-configuration",
      impact: ["~18,000 organisations installed the tainted update", "multiple US government agencies breached", "a years-long clean-up"],
      source: "Public record; US government findings and wide reporting, 2020-2021.",
      brandColor: "#f47b20",
      news: { headline: "SolarWinds: Why the Sunburst hack is so serious", outlet: "BBC News", date: "December 2020", url: "https://www.bbc.co.uk/news/technology-55368917" },
    },
  ],

  lab: {
    title: "Attacker thought, or defender thought?",
    intro: "Security needs both heads. Read each thought and decide which mindset it comes from. Fluency in switching between them is the skill this whole course builds.",
    prompts: [
      "For each thought, pick Attacker thinking or Defender thinking.",
      "Every answer explains the reasoning.",
      "Notice how each attacker question has a matching defender question.",
    ],
    component: MindsetLab,
  },

  check: {
    explain: {
      prompt: "Using SolarWinds, explain what 'assume breach' means and why it matters. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "SolarWinds worked because everyone trusted a signed update from a known vendor, so the attack arrived through the one channel nobody was watching. 'Assume breach' means you stop relying on that kind of blanket trust and instead work as if an attacker is already inside: you verify things that used to be taken on faith, you watch for unusual behaviour even from trusted software, and you limit what any one component can reach. It would not have made SolarWinds impossible, but organisations practising assume breach and zero trust were better placed to detect the strange activity and contain how far it spread.",
    },
    quiz: [
      {
        q: "What is the core of the 'attacker mindset' for a defender?",
        options: [
          "Breaking into other companies to learn",
          "Looking at your own systems the way an attacker would, to find weak spots first",
          "Ignoring attackers and focusing on tools",
          "Trusting that strong walls are enough",
        ],
        answer: 1,
        why: "It means seeing your own environment through an attacker's eyes to find and fix the weakest point before they exploit it, used strictly for defence.",
      },
      {
        q: "What does 'assume breach' change about how you defend?",
        options: [
          "You give up on prevention",
          "You also plan for detection and limiting damage, not just keeping attackers out",
          "You trust internal systems completely",
          "You stop using passwords",
        ],
        answer: 1,
        why: "Assume breach adds the questions 'how will I detect them?' and 'how do I limit what they reach?' on top of prevention, because some attacks will get in.",
      },
      {
        q: "Why was SolarWinds such a wake-up call?",
        options: [
          "The software was badly written",
          "A trusted, signed vendor update was the attack, breaking the assumption that trusted software is safe",
          "The attackers used a weak password",
          "It only affected one company",
        ],
        answer: 1,
        why: "The attack rode in through a legitimate, signed update everyone trusted. It pushed 'verify, do not simply trust' (zero trust and assume breach) into the mainstream.",
      },
    ],
  },

  wrap: {
    headline: "You can switch between the attacker's view and the defender's, the core habit of the whole field.",
    takeaways: [
      "Attackers hunt the easiest way in, often a person or a forgotten weakness.",
      "Modern defenders assume breach: detect fast and limit the damage, not just build walls.",
      "The two mindsets read the same map; holding both is the real skill.",
    ],
    project: {
      name: "Two questions about one thing you own",
      blurb: "Pick one account or device. Ask the attacker's question ('what is the easiest way in?') and the defender's ('if they get in, how would I know, and what could they reach?'). Write one line for each. That double view is how professionals assess anything.",
    },
    ethicsNote: "The attacker mindset here is a tool for defence only. Actually attacking systems you do not own or have permission to test is a criminal offence under the Computer Misuse Act 1990, which Module 5 covers in full.",
  },
};

export default topic5;

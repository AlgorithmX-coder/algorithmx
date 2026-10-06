import type { TopicManifest } from "../../learn/types";
import { InfectionVectorLab } from "../../learn/conceptLabs";

/* Module 8 - Topic 3: how infection actually happens. Case: NotPetya,
 * June 2017 (a destructive wiper disguised as ransomware, spread via a
 * compromised update of Ukrainian accounting software M.E.Doc and then
 * wormed using EternalBlue; Maersk and others suffered huge damage).
 * Public record: Maersk's own accounts and 2017-2018 reporting. */
const topic3: TopicManifest = {
  id: "m8t3",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "How infection really happens",
  role: "You cannot prevent what you do not understand the entry of. Knowing the handful of ways malware actually gets in lets a defender close those doors deliberately, and it turns 'protect against malware' from a vague worry into a concrete checklist.",
  minutes: 17,
  promise: "Learn the real ways malware gets in, then see one poisoned software update cause billions in damage worldwide.",
  brief: "In this lesson, we'll look at how malware actually gets onto systems. The routes are surprisingly few and well understood: phishing, malicious downloads, removable media, unpatched vulnerabilities, and the supply chain. Knowing them is how defenders close them. Then we'll study NotPetya, where a single trusted software update, poisoned at the source, unleashed one of the most destructive attacks in history.",

  learn: [
    {
      heading: "The front doors: phishing, downloads, and media",
      body: [
        "Most malware arrives through a small set of well-worn routes. The most common is phishing: a malicious attachment or link in an email, exactly the attacks you studied in Module 7, which is why those skills matter so much here. Next are malicious downloads: 'free' software, pirated apps, or files from untrustworthy sites that carry hidden malware. And removable media, the classic 'found USB stick', can carry or auto-run malicious code when plugged in.",
        "What these share is that they usually need a human action, opening, downloading, plugging in, which is both the vulnerability and the opportunity. Aware, cautious people are a real defence against this whole category, which is why security awareness is not a tick-box but a frontline control.",
      ],
      examples: [
        "Phishing: a booby-trapped attachment or link, the most common route of all.",
        "Malicious download: bundled or fake software from a dodgy source.",
        "Removable media: a USB stick that runs or carries malware when connected.",
      ],
      analogy: {
        plain: "These are the front doors and windows a burglar tries: the ones a careful householder can keep shut. Most malware, like most burglars, comes in the obvious ways.",
        realTerm: "infection vectors",
      },
    },
    {
      heading: "The quiet doors: unpatched flaws and the supply chain",
      body: [
        "Two routes need no human to click, which makes them especially dangerous. The first is unpatched vulnerabilities: if a system exposes a known, unfixed flaw, malware (especially a worm) can exploit it directly, as WannaCry did. The second is the supply chain: rather than attack you, criminals compromise something you already trust, a software vendor, an update, a supplier, so the malware arrives inside something you willingly install.",
        "Supply-chain attacks are uniquely insidious because they defeat your instinct to be careful. You are right to install updates and trust your established software; that is exactly the trust the attacker abuses. There is no simple 'just be careful' answer, which is why defence relies on layers: limiting what any one component can do, monitoring for odd behaviour, and segmentation to contain the blast.",
      ],
      examples: [
        "Unpatched flaw: a worm exploits a known hole directly, no click needed.",
        "Supply chain: a trusted software update is tampered with before it reaches you.",
        "You install it willingly, because trusting your own software is normally correct.",
      ],
    },
    {
      heading: "Why knowing the routes is the whole defence",
      body: [
        "The good news in all this is that the list of entry routes is short and known. 'Defend against malware' sounds impossibly broad, but it decomposes into closing a handful of specific doors: train people against phishing, control what software can be installed and from where, manage removable media, patch quickly, and harden the supply chain. Each is a concrete, achievable task.",
        "This is the constructive heart of malware defence: you are not fighting an infinite enemy, you are shutting known doors and watching the few that must stay open. The NotPetya case shows the stakes when one door, the supply chain, is left vulnerable, and why no organisation can treat any single route as someone else's problem.",
      ],
      examples: [
        "Phishing door: awareness, filtering, caution with attachments.",
        "Download and media doors: control what can be installed, and from where.",
        "Patch and supply-chain doors: update fast, and limit and monitor trusted components.",
      ],
      analogy: {
        plain: "Securing a house is not infinite: it is locking the doors, the windows, and the garage, and watching the one entrance that must stay open. Malware defence is the same finite checklist.",
        realTerm: "closing the entry routes",
      },
    },
  ],

  glossary: [
    { term: "infection vector", definition: "The route by which malware gets onto a system: phishing, malicious download, removable media, an unpatched flaw, or the supply chain." },
    { term: "drive-by download", definition: "Malware that installs simply by visiting a compromised or malicious web page, often via an unpatched browser flaw." },
    { term: "supply-chain attack", definition: "Compromising a trusted supplier, update or component so malware arrives inside something the victim willingly installs." },
    { term: "removable media", definition: "USB sticks and similar devices, which can carry or auto-run malware when connected: a classic infection route." },
  ],

  seeHeading: "When a trusted update became a global weapon",

  cases: [
    {
      org: "NotPetya (Maersk and others)",
      year: "2017",
      headline: "A poisoned software update caused billions in damage across the world",
      whatHappened: "In June 2017, NotPetya spread through a compromised update of a widely used Ukrainian accounting software, meaning victims were infected through a trusted update they installed themselves (a supply-chain attack). It then wormed across networks using the same kind of unpatched Windows flaw as WannaCry. Though it looked like ransomware, it was really a destructive wiper: it irreversibly scrambled systems with no genuine way to recover via payment. Global companies were hit hard; the shipping giant Maersk famously had to rebuild much of its IT from scratch.",
      theMissedMeasure: "Several layers failed together: a compromised supplier update (supply chain), rapid internal spread through an unpatched flaw and flat networks (patching and segmentation), and no quick way to recover. No single 'be careful' would have stopped it, which is exactly why layered defence, limiting trust, patching, segmentation, tested recovery, matters.",
      theCost: "NotPetya is estimated to have caused billions of dollars in damage worldwide, crippling major multinational companies for weeks, one of the most costly and destructive cyber-attacks ever recorded, all seeded through one trusted update.",
      control: "patching",
      impact: ["spread via a compromised trusted software update", "wormed through unpatched systems, then wiped them", "estimated billions in global damage; Maersk rebuilt much of its IT"],
      source: "Public record; Maersk's own accounts and extensive 2017-2018 reporting.",
      brandColor: "#1a5276",
      news: { headline: "NotPetya: the cyberattack that cost billions and crippled Maersk", outlet: "Mainstream and security reporting (2017-2018)", date: "2017" },
    },
  ],

  lab: {
    title: "Match the way in",
    intro: "Nothing to install and nothing leaves this page. Tap each way malware gets in, then tap which infection vector it is.",
    prompts: [
      "The routes are few: phishing, downloads, removable media, supply chain (and unpatched flaws).",
      "Ask: did a human have to act, or did it arrive inside something trusted?",
      "Each route maps to a concrete defence you can actually put in place.",
    ],
    component: InfectionVectorLab,
  },

  check: {
    explain: {
      prompt: "NotPetya infected victims through a software update they trusted and installed themselves. Explain why supply-chain attacks are so hard to defend against, and what layered defence offers when 'just be careful' is not enough.",
      modelAnswer: "Supply-chain attacks are hard because they defeat the instinct to be careful: you are right to install updates and trust established software, and that very trust is what the attacker abuses by poisoning the update at its source. There is no 'just be careful' answer, because the user did nothing wrong. Layered defence is the response: limit what any one component can do and reach, monitor for odd behaviour, patch quickly to deny the worming spread (NotPetya also used an unpatched flaw), segment networks to contain the blast, and keep tested, offline backups so you can recover. No single layer would have stopped NotPetya, but together they turn a fatal single point of failure into a survivable, contained one.",
    },
    quiz: [
      {
        q: "Which infection route generally needs NO human to click?",
        options: [
          "A phishing attachment",
          "An exploited unpatched vulnerability (or a poisoned update you already trust)",
          "A malicious download from a dodgy site",
          "A found USB stick",
        ],
        answer: 1,
        why: "Unpatched flaws (and supply-chain-poisoned updates) can infect without a user action, which is what makes them so dangerous.",
      },
      {
        q: "Why are supply-chain attacks especially insidious?",
        options: [
          "They are extremely rare",
          "They defeat the instinct to be careful: the malware arrives inside software you are right to trust and install",
          "They only affect suppliers, not customers",
          "Antivirus always catches them",
        ],
        answer: 1,
        why: "You did nothing wrong by installing a trusted update, which is exactly the trust the attacker abuses. Defence relies on layers, not just caution.",
      },
      {
        q: "Why is it reassuring that malware's entry routes are few and known?",
        options: [
          "It means malware is harmless",
          "Because 'defend against malware' decomposes into closing a handful of specific, achievable doors",
          "Because you can ignore the ones you have not seen",
          "It is not reassuring; there are infinite routes",
        ],
        answer: 1,
        why: "A short, known list of vectors turns a vague worry into a concrete checklist: phishing awareness, download control, media control, patching, supply-chain hardening.",
      },
    ],
  },

  wrap: {
    headline: "You now know the finite list of ways malware gets in, which turns malware defence into a concrete checklist.",
    takeaways: [
      "The common routes are phishing, malicious downloads, removable media, unpatched flaws, and the supply chain.",
      "The quiet routes, unpatched flaws and the supply chain, need no click, so they demand layered defence, not just caution.",
      "Because the routes are few and known, 'defend against malware' becomes a short list of specific doors to close.",
    ],
    project: {
      name: "Audit the doors",
      blurb: "For a device or organisation you know, go through the five entry routes and note, for each, what (if anything) guards it: phishing awareness, controlled installs, removable-media rules, patching speed, supply-chain care. The gaps you find are your priorities. This is exactly how a security team plans malware defence.",
    },
    ethicsNote: "Studying infection routes is to close them. Never deliberately introduce malware by any route, even to 'test', except on isolated systems you own, under the authorisation principles from Module 5.",
  },
};

export default topic3;

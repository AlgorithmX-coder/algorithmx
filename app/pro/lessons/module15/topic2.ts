import type { TopicManifest } from "../../learn/types";
import { IocLab } from "../../learn/conceptLabs";

/* Module 15 - Topic 2: indicators of compromise (IOCs). Case: the
 * WannaCry response (2017), where shared IOCs, including the kill-switch
 * domain and file hashes, let defenders worldwide detect and blunt the
 * outbreak fast. Public record: 2017 WannaCry response reporting. */
const topic2: TopicManifest = {
  id: "m15t2",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Indicators of compromise",
  role: "Indicators of compromise are the shareable, concrete signs of an attack, the common currency of detection and threat sharing. Knowing what they are, how they are used, and their limits is fundamental to detecting known threats and to the collaborative defence of the whole community.",
  minutes: 15,
  promise: "Learn the concrete signs that reveal an attack and how sharing them protects everyone, then see shared indicators help blunt a global outbreak.",
  brief: "In this lesson, we'll look at indicators of compromise, or IOCs: observable, concrete signs that an attack has occurred, a malware file's hash, a malicious address, a suspicious filename. We'll see how they power detection and, crucially, how sharing them lets one organisation's discovery protect many others. Then we'll see how shared IOCs helped defenders worldwide respond to the WannaCry outbreak.",

  learn: [
    {
      heading: "The concrete signs of an attack",
      body: [
        "An indicator of compromise is a specific, observable piece of evidence that an attack has happened or is happening. Common IOCs include the fingerprint (hash) of a malware file, the IP addresses or domains an attacker's malware contacts, suspicious filenames or registry changes malware creates, and distinctive patterns in logs. The defining qualities are that they are concrete (you can look for them) and shareable (others can look too).",
        "IOCs are the raw material of signature-based detection: you feed known-bad IOCs into your tools, which then flag or block anything matching. They are also how an attack discovered in one place becomes detectable everywhere, because an IOC found during one investigation can be shared and searched for by everyone else. This makes IOCs both a detection tool and the currency of collaborative defence.",
      ],
      examples: [
        "A malware file hash; a malicious IP or domain; a suspicious filename or registry key.",
        "Concrete (you can search for them) and shareable (so can others).",
        "Fed into tools to detect known threats; shared so one discovery protects many.",
      ],
      analogy: {
        plain: "IOCs are like a burglar's specific calling cards, a particular tool mark, a getaway car's number plate: concrete clues you can circulate so everyone can watch for the same offender.",
        realTerm: "indicator of compromise",
      },
    },
    {
      heading: "Sharing IOCs: one discovery protects many",
      body: [
        "The real power of IOCs is in sharing them. When one organisation (or a researcher) investigates an attack and extracts its IOCs, those indicators can be shared, through threat-intelligence feeds, communities, and government advisories, so that everyone else can immediately detect and block the same threat, often before it reaches them. This is the collaborative defence you met in Module 6, made concrete and operational.",
        "This is why defenders can, collectively, keep pace with attackers despite being spread across countless separate organisations. An attack seen once can be blocked everywhere. National bodies like the NCSC and CISA publish IOCs with their advisories for exactly this reason. For a SOC, consuming shared IOCs (loading them into your tools) and, where appropriate, contributing your own, is everyday collaborative defence.",
      ],
      examples: [
        "Extract IOCs from one investigation; share them so others can detect the same threat.",
        "Feeds, communities and national advisories (NCSC, CISA) distribute IOCs.",
        "An attack seen once can be blocked everywhere: collaborative defence in action.",
      ],
    },
    {
      heading: "Their limit: IOCs are about the known",
      body: [
        "IOCs are powerful but have the same fundamental limit as signatures: they describe the known. An IOC exists only after an attack has been observed and analysed, so IOCs are excellent for detecting known, previously-seen threats but, by themselves, cannot catch something genuinely new. And attackers change their IOCs easily, a new file, a new address, to evade indicator-based detection.",
        "This is why defenders distinguish simple, changeable indicators (hashes, addresses) from higher-level, harder-to-change ones: an attacker's reliable patterns of behaviour, their tactics, techniques and procedures (TTPs). Behaviour is far harder for an attacker to change than a file hash, so detecting on TTPs (which leads into the ATT&CK topic) is more durable. IOCs are essential, but they are one layer, best combined with behaviour detection for the new and the disguised.",
      ],
      examples: [
        "An IOC exists only after an attack is observed: good for the known, not the new.",
        "Attackers swap IOCs (new file, new address) easily to evade them.",
        "Behavioural patterns (TTPs) are harder to change, so more durable to detect on.",
      ],
      analogy: {
        plain: "A number plate (an IOC) is easy for a criminal to swap; their distinctive method of breaking in (behaviour) is much harder to change. Both help, but the method is the more durable clue.",
        realTerm: "IOCs vs TTPs",
      },
    },
  ],

  glossary: [
    { term: "indicator of compromise (IOC)", definition: "A concrete, observable, shareable sign of an attack: a malware hash, a malicious address, a suspicious artefact." },
    { term: "threat feed", definition: "A stream of shared threat data (often IOCs) that organisations consume to detect and block known threats." },
    { term: "TTPs", definition: "Tactics, techniques and procedures: an attacker's higher-level patterns of behaviour, harder to change than simple IOCs and so more durable to detect on." },
    { term: "kill-switch domain", definition: "A domain WannaCry checked before spreading; registering it halted the malware, and it became a key shared indicator." },
  ],

  seeHeading: "When shared indicators helped stop a global outbreak",

  cases: [
    {
      org: "WannaCry response",
      year: "2017",
      headline: "Shared indicators helped defenders worldwide detect and blunt the outbreak fast",
      whatHappened: "During the 2017 WannaCry outbreak (the ransomware you met in Module 8), the collaborative defence response relied heavily on shared indicators of compromise. Researchers analysing the malware extracted and shared IOCs, file hashes, the addresses it used, and famously the 'kill-switch' domain that, once discovered and registered by a researcher, halted much of the malware's spread. These shared indicators let organisations and security tools worldwide detect WannaCry, block its indicators, and understand what to look for, dramatically faster than any one organisation could alone.",
      theMissedMeasure: "The constructive lesson is the power of shared IOCs: one researcher's analysis, shared, protected countless others. (The breach itself was preventable by patching, as Module 8 covered.) It shows IOCs as the operational currency of collaborative defence at global scale.",
      theCost: "WannaCry caused enormous damage, but the rapid, IOC-driven collaborative response, including the kill-switch discovery, significantly limited it, demonstrating how sharing concrete indicators turns one discovery into worldwide protection.",
      control: "malware-protection",
      impact: ["IOCs (hashes, addresses, the kill-switch domain) shared globally", "let defenders worldwide detect and blunt WannaCry fast", "one analysis protected countless organisations"],
      source: "Public record; 2017 WannaCry response reporting.",
      brandColor: "#d32f2f",
      news: { headline: "How shared indicators helped defenders respond to WannaCry", outlet: "Security reporting (2017)", date: "May 2017" },
    },
  ],

  lab: {
    title: "IOC, or not?",
    intro: "Nothing to install and nothing leaves this page. For each item, decide: is it an indicator of compromise, or not?",
    prompts: [
      "An IOC is concrete, observable evidence of an attack, and shareable.",
      "Hashes, addresses, filenames, registry changes: IOCs. Hunches and feelings: not.",
      "Behavioural patterns (TTPs) count too, as higher-level indicators.",
    ],
    component: IocLab,
  },

  check: {
    explain: {
      prompt: "What is an indicator of compromise, why is sharing IOCs so powerful (use WannaCry), and what is the fundamental limit of IOCs that makes behaviour detection still necessary?",
      modelAnswer: "An indicator of compromise is a concrete, observable, shareable sign that an attack has occurred, such as a malware file's hash, a malicious address, or a suspicious artefact it leaves behind. Sharing IOCs is powerful because one organisation's or researcher's discovery becomes everyone's protection: extracted IOCs can be distributed through feeds, communities and national advisories so others immediately detect and block the same threat, often before it reaches them. WannaCry shows this at global scale: researchers analysing the malware shared its hashes, addresses and the kill-switch domain, letting defenders worldwide detect and blunt the outbreak far faster than any one organisation could alone. The fundamental limit of IOCs is that they describe the known: an IOC only exists after an attack has been observed, and attackers can swap a file or address easily to evade indicator-based detection. That is why behaviour detection (and detecting on harder-to-change behavioural patterns, TTPs) remains necessary to catch the genuinely new and the disguised. IOCs are essential, but they are one layer, best combined with behaviour.",
    },
    quiz: [
      {
        q: "What is an indicator of compromise (IOC)?",
        options: [
          "A feeling that something is wrong",
          "A concrete, observable, shareable sign of an attack, like a malware hash or malicious address",
          "A type of firewall",
          "A security certificate",
        ],
        answer: 1,
        why: "IOCs are concrete evidence you can search for and share, the raw material of signature detection and collaborative defence.",
      },
      {
        q: "Why is sharing IOCs so valuable?",
        options: [
          "It helps attackers",
          "One organisation's discovery becomes everyone's protection: an attack seen once can be blocked everywhere",
          "It is legally required",
          "It slows down defence",
        ],
        answer: 1,
        why: "Shared IOCs let defenders detect and block the same threat, often before it reaches them, as the WannaCry response showed.",
      },
      {
        q: "What is the fundamental limit of IOCs?",
        options: [
          "They are too expensive",
          "They describe the known, so they cannot catch genuinely new threats, and attackers can change them easily",
          "They never work",
          "They only exist for large companies",
        ],
        answer: 1,
        why: "An IOC exists only after an attack is observed, and a hash or address is easily swapped, which is why behaviour and TTP detection are also needed.",
      },
    ],
  },

  wrap: {
    headline: "You now know the shareable currency of detection, IOCs, and both their power and their limits.",
    takeaways: [
      "IOCs are concrete, observable, shareable signs of an attack: hashes, addresses, artefacts.",
      "Sharing them turns one discovery into worldwide protection, the operational heart of collaborative defence.",
      "They describe the known and are easily changed, so combine them with behaviour/TTP detection for the new.",
    ],
    project: {
      name: "Read a real advisory's IOCs",
      blurb: "Find a security advisory (from a vendor, the NCSC or CISA) that lists IOCs for a threat, and note the kinds included (hashes, domains, IPs, filenames). Seeing how real IOCs are published and could be loaded into tools makes the concept concrete, and shows you the collaborative defence you could one day take part in.",
    },
    ethicsNote: "Consuming and sharing IOCs is collaborative defensive work. Share responsibly and through proper channels, and use indicators to defend your own or authorised systems, within the Module 5 principles.",
  },
};

export default topic2;

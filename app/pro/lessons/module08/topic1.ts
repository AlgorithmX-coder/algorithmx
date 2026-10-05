import type { TopicManifest } from "../../learn/types";
import { MalwareTypeLab } from "../../learn/conceptLabs";

/* Module 8 - Topic 1: the malware family tree. Case: Emotet (a long-
 * running modular malware that evolved from a banking trojan into a
 * delivery platform / botnet, disrupted by an international law-
 * enforcement takedown in January 2021). Public record: Europol and
 * national agency announcements and reporting. */
const topic1: TopicManifest = {
  id: "m8t1",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "The malware family tree",
  role: "'Malware' is a huge word covering very different threats. Being able to name the type, virus, worm, trojan, ransomware, spyware, tells you how it spreads, what it wants, and how to respond. It is the shared vocabulary of every incident conversation.",
  minutes: 16,
  promise: "Sort out the malware family so the words finally make sense, then meet a single threat that became a whole criminal platform.",
  brief: "In this lesson, we'll untangle the malware family tree. The words, virus, worm, trojan, ransomware, spyware, rootkit, botnet, get used loosely, but each describes something specific about how a threat spreads or what it does. We'll make each one clear and concrete. Then we'll look at Emotet, a piece of malware that evolved over years from a simple banking trojan into a platform for delivering other criminals' attacks.",

  learn: [
    {
      heading: "How it spreads vs what it wants",
      body: [
        "The malware family is easier to understand if you split the names into two questions: how does it spread, and what does it do? Some terms describe spreading. A virus attaches to a legitimate file and runs when that file is opened. A worm spreads by itself across networks with no user action at all, which is what makes worms so explosive. A trojan does not self-spread; it tricks a user into installing it by pretending to be something useful.",
        "Other terms describe the goal, the payload. Ransomware encrypts your data for a ransom. Spyware secretly watches and steals information. A rootkit hides deep in a system to avoid detection. A botnet enlists your machine into a remote-controlled army. A single real threat often combines several: it might arrive as a trojan, then act as ransomware.",
      ],
      examples: [
        "Spreading: virus (needs a host file), worm (self-spreads), trojan (tricks the user).",
        "Goal: ransomware (extort), spyware (steal), rootkit (hide), botnet (remote control).",
        "Real threats mix these: a trojan that drops ransomware, for instance.",
      ],
      analogy: {
        plain: "Think of a disease: how it is caught (airborne, touch, a Trojan-horse gift) is separate from what it does to you (fever, theft of strength). Malware names split the same way.",
        realTerm: "malware taxonomy",
      },
    },
    {
      heading: "Worms and the danger of self-spread",
      body: [
        "The worm deserves special attention because self-spreading is what turns one infection into thousands in hours. A worm needs no one to click: it finds other vulnerable machines on its own and copies itself to them, then those copies do the same. This exponential spread is why the most explosive outbreaks in history, which you will meet later in this module, were wormable.",
        "This also explains why patching matters so urgently. Worms spread by exploiting known vulnerabilities, so an unpatched flaw is not just a risk to one machine, it is a doorway a worm can pour through across an entire network. The defensive lesson lands hard here: the time between a fix being available and you applying it is exactly the window a worm needs.",
      ],
      examples: [
        "A worm finds vulnerable machines itself, with no user action.",
        "One infection becomes thousands as copies spread copies.",
        "Worms exploit known, unpatched flaws, which is why fast patching is vital.",
      ],
    },
    {
      heading: "Malware as a platform",
      body: [
        "Modern malware is often not a single fixed thing but a flexible platform. The most successful criminal malware is modular: it gets a foothold, then downloads whatever additional capability the operators want, credential theft today, ransomware tomorrow. This is the cybercrime-economy idea from Module 6 made concrete: one malware family becomes a delivery service that other criminals pay to use.",
        "This matters for defence because it means an apparently 'minor' infection is rarely minor. A foothold established by one family is often sold or used to deliver something far worse. Treating any infection as a potential beachhead for more, rather than a one-off nuisance, is the professional mindset. The Emotet case you are about to see is the definitive example of malware-as-a-platform.",
      ],
      examples: [
        "Modular malware downloads new capabilities on demand after the first foothold.",
        "A foothold from one family is often used to deliver ransomware next.",
        "Treat any infection as a possible beachhead, never a harmless one-off.",
      ],
      analogy: {
        plain: "It is less a single burglar and more a thief who, once inside, unlocks the back door for a whole crew to follow. The first intruder is rarely the real problem.",
        realTerm: "modular malware / loaders",
      },
    },
  ],

  glossary: [
    { term: "virus", definition: "Malware that attaches to a legitimate file and runs, and spreads, when that file is opened." },
    { term: "worm", definition: "Malware that spreads by itself across networks with no user action, often by exploiting unpatched flaws." },
    { term: "trojan", definition: "Malware disguised as something useful or desirable, so the user installs it willingly." },
    { term: "rootkit", definition: "Malware designed to hide itself deep in a system to avoid detection and maintain access." },
    { term: "botnet", definition: "A network of infected machines under an attacker's remote control, used for spam, attacks or further crime." },
  ],

  seeHeading: "When one trojan became a criminal platform",

  cases: [
    {
      org: "Emotet",
      year: "2021",
      headline: "A banking trojan evolved into one of the world's most dangerous delivery platforms",
      whatHappened: "Emotet began around 2014 as a banking trojan, but it evolved into something more dangerous: a modular platform that spread mainly through phishing emails, established a foothold, and then delivered other criminals' malware, including ransomware, for a fee. It became, in effect, a criminal delivery service, infecting vast numbers of machines worldwide. In January 2021, an international law-enforcement operation disrupted Emotet's infrastructure, a rare and significant takedown of malware-as-a-platform.",
      theMissedMeasure: "Emotet spread overwhelmingly through phishing with malicious attachments, so the defences are the ones from Module 7 (recognising and reporting phishing, caution with attachments and macros) plus the fundamentals: patching, and treating any foothold as a gateway to worse. The platform model is exactly why a 'small' Emotet infection was never small.",
      theCost: "Enormous: Emotet facilitated countless ransomware and theft attacks across businesses and governments for years before the takedown, a vivid demonstration of how one malware family becomes an engine for many attacks.",
      control: "malware-protection",
      impact: ["evolved from banking trojan to malware-as-a-platform", "delivered ransomware and theft for other criminals", "disrupted by an international takedown in January 2021"],
      source: "Public record; Europol and national-agency announcements and 2021 reporting.",
      brandColor: "#8e44ad",
      news: { headline: "Emotet: one of the world's most dangerous malwares taken down", outlet: "Mainstream and security reporting (2021)", date: "January 2021" },
    },
  ],

  lab: {
    title: "Name the malware",
    intro: "Nothing to install and nothing leaves this page. Tap each description, then tap which kind of malware it is.",
    prompts: [
      "Split the question: how does it spread, and what does it do?",
      "Self-spreading is a worm; needing a host file is a virus; tricking the user is a trojan.",
      "Encrypt-for-money is ransomware; secret theft is spyware.",
    ],
    component: MalwareTypeLab,
  },

  check: {
    explain: {
      prompt: "Emotet started as a banking trojan but became famous as a 'platform'. Explain what that means, and why it shows that no malware infection should be treated as minor.",
      modelAnswer: "A platform means Emotet was modular: it got a foothold through phishing, then downloaded and delivered whatever further malware its operators, or their paying customers, wanted, including ransomware. It became a criminal delivery service rather than a single fixed threat. This is why no infection is minor: a foothold established by one family is routinely used, or sold, to deliver something far worse. An apparently small Emotet infection was really a beachhead that could become a full ransomware attack, so the professional mindset is to treat any infection as a potential gateway, contain it fast, and assume more may follow.",
    },
    quiz: [
      {
        q: "What distinguishes a worm from a virus?",
        options: [
          "A worm is harmless; a virus is not",
          "A worm spreads by itself across networks with no user action; a virus needs a host file and an opening",
          "They are the same thing",
          "A virus spreads faster than a worm",
        ],
        answer: 1,
        why: "Self-spread with no user needed is the worm's defining, and dangerous, trait. A virus rides along in a file that must be opened.",
      },
      {
        q: "A trojan infects a machine by:",
        options: [
          "Spreading automatically across the network",
          "Tricking the user into installing it by pretending to be something useful",
          "Exploiting a hardware flaw",
          "Encrypting files on contact",
        ],
        answer: 1,
        why: "A trojan relies on disguise and the user's choice to run it, not on self-spreading or a specific payload.",
      },
      {
        q: "Why should no malware infection be treated as 'minor'?",
        options: [
          "All malware is equally harmless",
          "Modern malware is often a platform: one foothold is used or sold to deliver far worse, like ransomware",
          "Because antivirus always removes it",
          "Minor infections fix themselves",
        ],
        answer: 1,
        why: "Modular malware turns a small foothold into a gateway. Treating any infection as a potential beachhead is the professional stance.",
      },
    ],
  },

  wrap: {
    headline: "You can now read the malware family tree, and know that one word tells you how a threat spreads and what it wants.",
    takeaways: [
      "Split the names: some describe spreading (virus, worm, trojan), others the goal (ransomware, spyware, rootkit, botnet).",
      "Worms self-spread by exploiting unpatched flaws, which is why fast patching is so urgent.",
      "Modern malware is often a modular platform, so treat any infection as a potential gateway to something worse.",
    ],
    project: {
      name: "Build a malware glossary",
      blurb: "In your security notebook, write a one-line, plain-English definition of each malware type from this topic, in your own words. Add a real example for any you have heard of in the news. A clear personal glossary is something you will actually reuse, and writing the definitions yourself is how they stick.",
    },
    ethicsNote: "This module studies malware only to recognise, prevent and respond to it. Creating, obtaining or spreading malware is a serious offence (recall the Computer Misuse Act's section on tools from Module 5). All study is defensive and, where hands-on, isolated and authorised.",
  },
};

export default topic1;

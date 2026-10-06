import type { TopicManifest } from "../../learn/types";
import { EncryptProtectLab } from "../../learn/conceptLabs";

/* Module 4 - Topic 1: why we encrypt, and what encryption is not. Case:
 * the recurring category of lost/stolen UNENCRYPTED devices (laptops,
 * drives) exposing data that encryption would have rendered useless.
 * Public record: repeated regulator findings and reporting on
 * unencrypted-device data losses. */
const topic1: TopicManifest = {
  id: "m4t1",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "Why we encrypt",
  role: "Encryption underpins almost all of modern security, but it is widely misunderstood. Knowing exactly what encryption does, protects secrets, and what it does not, is foundational, and it stops the common, costly mistake of trusting it for the wrong things.",
  minutes: 15,
  promise: "Understand what encryption really protects, and what it cannot, then see how a lost laptop becomes a breach, or a non-event.",
  brief: "In this lesson, we'll demystify encryption. At heart it is simple: scrambling data so only someone with the right key can read it, keeping it secret from everyone else. We'll see what that protects (data someone might steal or intercept) and, just as importantly, what it does not (someone tricking you, or already holding the key). Then we'll see how encryption decides whether a lost device is a disaster or a shrug.",

  learn: [
    {
      heading: "Encryption: secrets in the open",
      body: [
        "Encryption scrambles data using a key, so that anyone who intercepts or steals it sees only meaningless noise, while whoever holds the right key can turn it back into the original. It is how secrets travel and rest safely in a world where data is constantly exposed, crossing networks, sitting on devices, stored in the cloud. Without encryption, anything intercepted or stolen is simply readable; with it, it is useless to the thief.",
        "This is the 'confidentiality' pillar from Module 1 made real. Encryption is the primary tool for keeping data secret from those who should not see it, in transit (the HTTPS padlock) and at rest (an encrypted disk or database). It is genuinely powerful, and genuinely everywhere, which is exactly why understanding its limits matters as much as its strengths.",
      ],
      examples: [
        "Intercepted encrypted traffic is unreadable noise without the key.",
        "A stolen encrypted disk is useless to the thief.",
        "Encryption protects confidentiality, in transit and at rest.",
      ],
      analogy: {
        plain: "Encryption is a locked, opaque box you can send through the open post. Anyone can carry or steal the box, but only the key-holder can see what is inside.",
        realTerm: "encryption",
      },
    },
    {
      heading: "What encryption is not",
      body: [
        "Encryption is powerful but not magic, and misunderstanding its limits causes real failures. It protects data from those without the key, so it does nothing against someone who has the key, or who can get you to hand over the secret. It will not stop a phishing attack (you type your password into the fake site willingly), it does not verify who you are talking to by itself (that is what certificates add), and it does not protect availability (ransomware actually weaponises encryption against you).",
        "The practical lesson: encryption is one tool, for one job, keeping data confidential from those without the key. It is not a substitute for the other controls in this course. 'We encrypt everything' is good, but it does not make you secure if your people can be phished, your keys are badly protected, or your systems can be taken offline. Respecting what encryption does and does not do is what lets you use it correctly.",
      ],
      examples: [
        "It does nothing against someone who has the key, or who you hand the secret to.",
        "It does not stop phishing, verify identity alone, or protect availability.",
        "It is one tool for one job (confidentiality), not a cure-all.",
      ],
      analogy: {
        plain: "The best lock in the world does not help if you give the burglar the key, or if they trick you into opening the door. The lock only stops people without the key.",
        realTerm: "encryption's limits",
      },
    },
    {
      heading: "The same data, encrypted or not",
      body: [
        "The clearest way to feel encryption's value is the lost-device scenario. A laptop or drive holding personal data is lost or stolen, a mundane, extremely common event. If the device was encrypted, the data is unreadable without the key, and it is a minor incident. If it was not encrypted, the finder can read everything, and it is a serious, reportable breach. The exact same physical loss is a disaster or a shrug, depending entirely on one thing: was it encrypted?",
        "This is why encryption at rest, on laptops, phones, drives and databases, is such a basic, high-value control, and why its absence is a recurring cause of breaches. The case you are about to see is this exact pattern, repeated across countless organisations: data exposed not by clever attackers but by ordinary device loss, made catastrophic only because the data was not encrypted. Encryption would have turned the breach into a non-event.",
      ],
      examples: [
        "Lost encrypted device: unreadable, a minor incident.",
        "Lost unencrypted device: fully readable, a serious breach.",
        "Same loss, opposite outcome, decided by whether it was encrypted.",
      ],
      analogy: {
        plain: "Losing a locked diary written in a code only you can read is a shrug; losing an open one anyone can read is a disaster. Encryption is writing in that unbreakable code.",
        realTerm: "encryption at rest",
      },
    },
  ],

  glossary: [
    { term: "encryption", definition: "Scrambling data with a key so only the key-holder can read it; the primary tool for keeping data confidential." },
    { term: "key", definition: "The secret that locks and unlocks encrypted data; whoever holds it can read the data, whoever does not cannot." },
    { term: "encryption in transit", definition: "Protecting data as it crosses a network (e.g. HTTPS), so interceptors see only unreadable noise." },
    { term: "encryption at rest", definition: "Protecting stored data (on disks, devices, databases) so a stolen copy is unreadable without the key." },
  ],

  seeHeading: "When a lost laptop is, or isn't, a breach",

  cases: [
    {
      org: "Lost/stolen unencrypted devices",
      year: "recurring",
      headline: "Ordinary device loss becomes a serious breach, only because the data was not encrypted",
      whatHappened: "A recurring category of data breach, across businesses, hospitals, councils and government, is the loss or theft of unencrypted devices: laptops, USB drives and phones holding personal data that was not encrypted. There is no clever attacker, just a mundane loss, but because the data was readable, it becomes a serious, reportable breach exposing real people's information, and regulators have repeatedly penalised organisations for it. The striking, consistent lesson is that where the device was encrypted, the same loss was a minor, non-reportable non-event, because the data was unreadable.",
      theMissedMeasure: "Encryption at rest on devices. It is a basic, cheap, high-value control, and its absence turns an everyday device loss into a breach. Its presence turns the same loss into a shrug. Few controls show their value so starkly.",
      theCost: "Countless exposures of personal data, and regulatory penalties, caused not by sophisticated attacks but by unencrypted devices being lost, entirely preventable by encrypting them.",
      control: "secure-configuration",
      impact: ["ordinary device loss, made a breach by missing encryption", "encrypted-device loss was a non-event", "a basic, high-value control repeatedly neglected"],
      source: "Public record; repeated regulator findings and reporting on unencrypted-device data losses.",
      brandColor: "#6b7280",
      news: { headline: "Why losing an unencrypted laptop is a data breach, and an encrypted one isn't", outlet: "Regulator findings (recurring)", date: "recurring" },
    },
  ],

  lab: {
    title: "Does encryption protect against it?",
    intro: "Nothing to install and nothing leaves this page. For each situation, decide: does encryption protect against it, or not?",
    prompts: [
      "Encryption protects secrecy against those WITHOUT the key.",
      "It does not stop phishing, someone with the key, or ransomware (availability).",
      "Knowing the limits is as important as knowing the strengths.",
    ],
    component: EncryptProtectLab,
  },

  check: {
    explain: {
      prompt: "Explain what encryption does and does not protect, and why a lost device is a breach or a non-event depending on encryption.",
      modelAnswer: "Encryption scrambles data with a key so that anyone who intercepts or steals it sees only meaningless noise, while whoever holds the right key can read it; it is the primary tool for confidentiality, protecting data in transit (HTTPS) and at rest (encrypted disks and databases) from those without the key. What it does not do is just as important: it does nothing against someone who has the key or who can get you to hand over the secret, so it will not stop a phishing attack (you type your password into the fake site willingly), it does not by itself verify who you are talking to (certificates add that), and it does not protect availability (ransomware actually weaponises encryption against you). It is one tool for one job, not a cure-all. A lost device shows this starkly: if the device holding personal data was encrypted, the data is unreadable without the key, so the loss is a minor incident; if it was not encrypted, the finder can read everything, so the same loss is a serious, reportable breach. The exact same physical event is a disaster or a shrug depending entirely on whether the data was encrypted, which is why encryption at rest is such a basic, high-value control and its absence a recurring cause of breaches.",
    },
    quiz: [
      {
        q: "What does encryption primarily protect?",
        options: [
          "Availability: keeping systems online",
          "Confidentiality: keeping data secret from those without the key",
          "Your identity in an interview",
          "Against phishing emails",
        ],
        answer: 1,
        why: "Encryption makes data unreadable to anyone without the key, protecting confidentiality in transit and at rest.",
      },
      {
        q: "Which of these does encryption NOT protect against?",
        options: [
          "An interceptor reading your network traffic",
          "A phishing attack where you hand over your password willingly",
          "A thief reading a stolen encrypted disk",
          "A stolen encrypted database copy",
        ],
        answer: 1,
        why: "Encryption does nothing when you give away the secret yourself. It only stops those without the key.",
      },
      {
        q: "Why is a lost encrypted laptop a non-event, but an unencrypted one a breach?",
        options: [
          "Encrypted laptops are never lost",
          "Encryption makes the data unreadable without the key, so a stolen encrypted device exposes nothing",
          "Unencrypted laptops are more valuable",
          "There is no difference",
        ],
        answer: 1,
        why: "Same loss, opposite outcome: encryption at rest turns a readable disaster into an unreadable non-event.",
      },
    ],
  },

  wrap: {
    headline: "You now understand what encryption really does, and does not, which is the foundation of all of cryptography.",
    takeaways: [
      "Encryption scrambles data with a key, protecting confidentiality in transit and at rest.",
      "It does nothing against someone with the key, phishing, or availability attacks like ransomware: it is one tool, not a cure-all.",
      "Encryption at rest turns a lost device from a serious breach into a non-event: a basic, high-value control.",
    ],
    project: {
      name: "Check your own encryption",
      blurb: "Check whether your own laptop and phone are encrypted (most modern ones can be, often with one setting). Turning on device encryption is a five-minute, high-value action that would turn a lost device from a disaster into a shrug, exactly the lesson of this topic.",
    },
    ethicsNote: "Encryption is a protective tool. Using it to safeguard your own or your organisation's data is purely constructive; this module explains it so you can use it correctly, within the Module 5 principles.",
  },
};

export default topic1;

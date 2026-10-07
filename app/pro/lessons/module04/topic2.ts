import type { TopicManifest } from "../../learn/types";
import { KeyTypeLab } from "../../learn/conceptLabs";

/* Module 4 - Topic 2: symmetric vs asymmetric (shared locks vs key
 * pairs). Case: the invention of public-key cryptography (1970s,
 * Diffie-Hellman and RSA), which solved the key-distribution problem and
 * made secure communication with strangers possible. Public record: the
 * published history of public-key cryptography. */
const topic2: TopicManifest = {
  id: "m4t2",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "Symmetric vs asymmetric",
  role: "The two kinds of encryption, one shared key versus a public/private key pair, underpin how all secure communication works. Understanding the difference, and the key-distribution problem that asymmetric crypto solves, demystifies HTTPS and much of modern security.",
  minutes: 15,
  promise: "Learn the two kinds of encryption and the clever idea that lets total strangers share secrets, the breakthrough HTTPS is built on.",
  brief: "In this lesson, we'll learn the two families of encryption. Symmetric uses one shared secret key to both lock and unlock, fast, but you must get the key to the other person safely. Asymmetric uses a public/private key pair, solving exactly that problem: anyone can encrypt to you with your public key, but only your private key decrypts. We'll see why this combination powers HTTPS, and the breakthrough that made it possible.",

  learn: [
    {
      heading: "Symmetric: one shared key",
      body: [
        "Symmetric encryption uses a single secret key for both locking and unlocking: the same key that encrypts a message decrypts it. It is fast and efficient, which makes it ideal for encrypting large amounts of data. If two people share the key, they can exchange secrets freely. This is the oldest and most intuitive form of encryption, and it does most of the actual work of keeping data secret.",
        "But symmetric encryption has one awkward problem: how do you get the shared key to the other person in the first place, securely? If you send the key over the same insecure channel you are trying to protect, an eavesdropper can grab it and read everything. For two people who have never met and share no prior secret, the key-distribution problem seems impossible, and for a long time, it was.",
      ],
      examples: [
        "One shared key both encrypts and decrypts: fast and efficient.",
        "Great for bulk data, once both sides have the key.",
        "The hard part: getting the shared key to the other person securely.",
      ],
      analogy: {
        plain: "A single key that locks and unlocks a box. Easy to use, but how do you post the key to someone safely, when a thief might intercept it on the way?",
        realTerm: "symmetric encryption",
      },
    },
    {
      heading: "Asymmetric: a public/private key pair",
      visual: { id: "public-key", mode: "exchange" },
      body: [
        "Asymmetric encryption solves the key-distribution problem with a beautiful idea: each person has a pair of keys, a public key they share with everyone, and a private key they keep secret. Anything encrypted with your public key can only be decrypted with your private key. So anyone can send you a secret by encrypting it with your freely-shared public key, and only you, with your private key, can read it. No prior shared secret is needed.",
        "This is revolutionary because it lets total strangers communicate securely. You can publish your public key to the world; people use it to send you secrets that only you can open. The trade-off is that asymmetric encryption is slower than symmetric, so it is not used for bulk data. Instead, it is used cleverly: to safely exchange a shared symmetric key, after which the fast symmetric encryption takes over.",
      ],
      examples: [
        "A public key (shared with all) and a private key (kept secret).",
        "Anyone encrypts with your public key; only your private key decrypts.",
        "Lets strangers share secrets with no prior shared key, but it is slower.",
      ],
      analogy: {
        plain: "An open padlock you hand out freely: anyone can snap it shut on a box and send it to you, but only your private key opens it. You never had to share the key.",
        realTerm: "asymmetric encryption",
      },
    },
    {
      heading: "Together: how HTTPS really works",
      body: [
        "The elegant reality is that modern secure communication uses both, each for what it does best. When your browser connects to a website over HTTPS, it uses asymmetric encryption to safely agree on a shared symmetric key with the server (solving the key-distribution problem), and then switches to fast symmetric encryption for the actual conversation. You get the stranger-friendly key exchange of asymmetric crypto and the speed of symmetric, combined.",
        "This is the breakthrough that made the secure internet possible. Before public-key cryptography, two parties who had never met could not establish a secure channel over an open network, which would have made e-commerce and private browsing impossible. The invention of asymmetric encryption, which you are about to see, quietly underpins almost every secure interaction you have online. Understanding this combination is the key to understanding HTTPS and much of modern security.",
      ],
      examples: [
        "HTTPS uses asymmetric to agree a shared symmetric key, then symmetric for speed.",
        "Stranger-friendly key exchange plus fast bulk encryption, combined.",
        "This combination is what makes the secure internet possible.",
      ],
      analogy: {
        plain: "You use the hand-out padlock (asymmetric) just to send someone a shared key safely, then both use that fast shared key (symmetric) for the rest of the conversation. Best of both.",
        realTerm: "hybrid encryption (HTTPS)",
      },
    },
  ],

  glossary: [
    { term: "symmetric encryption", definition: "Encryption using one shared secret key for both locking and unlocking; fast, but the key must be shared securely." },
    { term: "asymmetric encryption", definition: "Encryption using a public/private key pair: anyone can encrypt with the public key, only the private key decrypts." },
    { term: "key-distribution problem", definition: "The difficulty of securely sharing a symmetric key with someone over an insecure channel; solved by asymmetric crypto." },
    { term: "public-key cryptography", definition: "The breakthrough (1970s) of public/private key pairs, enabling secure communication between strangers and underpinning HTTPS." },
  ],

  seeHeading: "The idea that made the secure internet possible",

  cases: [
    {
      org: "Public-key cryptography (invention)",
      year: "1970s",
      headline: "A breakthrough idea let strangers share secrets, underpinning all secure communication",
      whatHappened: "In the 1970s, cryptographers publicly developed public-key (asymmetric) cryptography, including the Diffie-Hellman key-exchange idea and the RSA algorithm, solving a problem long thought intractable: how two parties who have never met and share no prior secret can establish secure communication over an open channel. The idea of a public/private key pair, where a freely-shared public key encrypts and only a secret private key decrypts, meant strangers could exchange secrets safely for the first time. This breakthrough quietly underpins the entire secure internet, including the HTTPS that protects everyday browsing and e-commerce.",
      theMissedMeasure: "This is a case of a measure invented rather than missed: public-key cryptography is the foundational idea that made secure communication with strangers, and therefore the secure internet, possible. Everything from HTTPS to secure messaging rests on it.",
      theCost: "Here the value is immense and positive: without public-key cryptography, there would be no practical way to browse, bank or shop securely online, because strangers could never safely agree on a key. It is one of the most important ideas in the history of computing.",
      control: "secure-configuration",
      impact: ["solved the key-distribution problem for strangers", "public/private key pairs: public encrypts, private decrypts", "underpins HTTPS and the entire secure internet"],
      source: "Public record; the published history of public-key cryptography (Diffie-Hellman, RSA).",
      brandColor: "#2db94d",
      news: { headline: "Public-key cryptography: the breakthrough behind the secure internet", outlet: "History of cryptography", date: "1970s" },
    },
  ],

  lab: {
    title: "Symmetric or asymmetric?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: is it symmetric (one shared key) or asymmetric (a key pair)?",
    prompts: [
      "Symmetric: one shared key, fast, but hard to share safely.",
      "Asymmetric: public/private pair, solves key sharing, but slower.",
      "HTTPS uses asymmetric to exchange a key, then symmetric for speed.",
    ],
    component: KeyTypeLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between symmetric and asymmetric encryption, the key-distribution problem, and how HTTPS uses both.",
      modelAnswer: "Symmetric encryption uses a single shared secret key for both locking and unlocking; it is fast and efficient, ideal for bulk data, but it has the key-distribution problem: how do you get the shared key to the other person securely, especially a stranger, without an eavesdropper on the insecure channel grabbing it? Asymmetric encryption solves this with a public/private key pair, each person has a public key they share freely and a private key they keep secret, and anything encrypted with your public key can only be decrypted with your private key, so anyone can send you a secret using your freely-shared public key and only you can read it, with no prior shared secret needed, though it is slower than symmetric. HTTPS uses both, each for what it does best: when your browser connects to a website, it uses asymmetric encryption to safely agree a shared symmetric key with the server (solving key distribution), then switches to fast symmetric encryption for the actual conversation, giving the stranger-friendly key exchange of asymmetric crypto with the speed of symmetric. This combination, enabled by the invention of public-key cryptography, is what makes the secure internet possible.",
    },
    quiz: [
      {
        q: "What is the main challenge with symmetric encryption?",
        options: [
          "It is too slow for any use",
          "Getting the shared secret key to the other person securely (the key-distribution problem)",
          "It cannot encrypt text",
          "It needs no key at all",
        ],
        answer: 1,
        why: "Symmetric is fast, but sharing the single key safely, especially with a stranger, is the hard part asymmetric solves.",
      },
      {
        q: "How does asymmetric encryption solve key distribution?",
        options: [
          "By using no keys",
          "A public key anyone can use to encrypt, and a private key only you hold to decrypt, so no prior shared secret is needed",
          "By sending the key in plain text",
          "By making the key shorter",
        ],
        answer: 1,
        why: "You publish your public key; anyone encrypts with it, only your private key decrypts. Strangers can share secrets safely.",
      },
      {
        q: "How does HTTPS use the two together?",
        options: [
          "Only symmetric, always",
          "Asymmetric to safely agree a shared symmetric key, then fast symmetric for the conversation",
          "Only asymmetric, for everything",
          "Neither; HTTPS uses no encryption",
        ],
        answer: 1,
        why: "It combines the stranger-friendly key exchange of asymmetric with the speed of symmetric: the hybrid that powers secure browsing.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the two kinds of encryption, and the breakthrough that lets strangers share secrets online.",
    takeaways: [
      "Symmetric uses one shared key (fast, but hard to share safely); asymmetric uses a public/private pair (solves sharing, but slower).",
      "Asymmetric crypto solved the key-distribution problem, letting strangers communicate securely.",
      "HTTPS uses asymmetric to exchange a symmetric key, then symmetric for speed: the hybrid behind the secure internet.",
    ],
    project: {
      name: "Explain public keys simply",
      blurb: "Write a two-line, plain-English explanation of how a public/private key pair lets someone send you a secret without ever sharing a key, using an analogy of your own. Being able to explain public-key crypto simply is a great sign you truly understand the idea that underpins HTTPS.",
    },
    ethicsNote: "Cryptography is a protective, enabling technology. Understanding it is foundational defensive knowledge, used to secure communication and data within the Module 5 principles.",
  },
};

export default topic2;

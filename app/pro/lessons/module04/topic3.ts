import type { TopicManifest } from "../../learn/types";
import { HashEncryptLab } from "../../learn/conceptLabs";

/* Module 4 - Topic 3: hashing vs encryption, side by side. Case: Adobe,
 * 2013 (around 153 million accounts; Adobe used reversible encryption,
 * not proper hashing, for passwords, and weak password hints made it
 * worse, a textbook "should have hashed" case). Public record: 2013
 * reporting and analysis of the Adobe breach. */
const topic3: TopicManifest = {
  id: "m4t3",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "Hashing vs encryption",
  role: "Hashing and encryption are constantly confused, yet they do opposite things, one is reversible, one is not, and using the wrong one is a classic, costly mistake. Telling them apart is essential cryptographic literacy.",
  minutes: 15,
  promise: "Learn the crucial difference between one-way hashing and reversible encryption, then see the breach where using the wrong one exposed 153 million passwords.",
  brief: "In this lesson, we'll clear up one of security's most common confusions: hashing versus encryption. Encryption is reversible (with the key, you get the original back); hashing is one-way (you cannot reverse it). Each is right for different jobs, passwords should be hashed, messages should be encrypted, and using the wrong one is a serious error. We'll see exactly when to use each, then see the breach where getting it wrong exposed 153 million passwords.",

  learn: [
    {
      heading: "The core difference: reversible vs one-way",
      visual: { id: "hash-oneway" },
      body: [
        "Encryption and hashing look similar, both turn readable data into scrambled data, but they differ in the most important way possible: encryption is reversible, hashing is not. With encryption, whoever has the key can turn the scrambled data back into the original; that is the whole point, the recipient must be able to read the message. With hashing, there is no key and no way back: a hash is a one-way fingerprint of the input, and you cannot reconstruct the original from it.",
        "This difference decides which you should use. If the data must be recoverable, a message to be read, a file to be opened, you encrypt it. If the data must never be recoverable, only checked, you hash it. Confusing the two, using reversible encryption where you needed irreversible hashing, is a classic and dangerous mistake, as the case ahead shows.",
      ],
      examples: [
        "Encryption is reversible (with the key): the recipient gets the original back.",
        "Hashing is one-way: a fingerprint you cannot reverse to the original.",
        "Recoverable data: encrypt. Check-only data: hash.",
      ],
      analogy: {
        plain: "Encryption is a locked box you can reopen with the key. A hash is like blending fruit into a smoothie: you can tell two smoothies came from the same fruit, but you can never get the whole fruit back.",
        realTerm: "reversible vs one-way",
      },
    },
    {
      heading: "Why passwords must be hashed, not encrypted",
      body: [
        "The most important application of this distinction is password storage, which you met in Module 3. Passwords should be hashed, never encrypted (nor, worse, stored in plain text). The reason is precisely that hashing is one-way: a website never needs to recover your actual password, it only needs to check whether what you typed matches. So it stores the hash of your password, and when you log in, it hashes what you typed and compares. The original password is never stored and cannot be recovered, even by the site.",
        "If a site instead encrypts passwords, there is a key somewhere that can turn them all back into the originals, and if attackers steal both the encrypted passwords and that key (which often live together), every password is instantly exposed. Hashing has no such key, so even a full breach of the stored hashes does not directly hand over the passwords. This is why 'hash passwords, never encrypt them' is an iron rule, and why breaking it, as Adobe did, is so damaging.",
      ],
      examples: [
        "A site never needs your actual password, only to check a match: so it hashes.",
        "Encrypted passwords have a key that can reverse them all: a disaster if stolen.",
        "Hashed passwords have no key back, so a breach does not directly reveal them.",
      ],
    },
    {
      heading: "Hashing also proves integrity",
      body: [
        "Hashing has a second vital use beyond passwords: proving that data has not changed. Because a hash is a fingerprint that changes completely if even one character of the input changes, you can detect tampering by comparing hashes. Download a file, hash it, and compare to the hash the publisher provided: if they match, the file is intact; if not, it was altered or corrupted. This integrity check, from the 'I' in the CIA triad, is everywhere in security.",
        "So the two tools divide cleanly. Encryption provides confidentiality (keeping data secret, reversibly, for those with the key). Hashing provides one-way verification: storing passwords safely, and proving integrity. They are complementary, not interchangeable. Using a hash where you need to recover the data fails (you never can), and using encryption where you need irreversibility fails (the key can undo it). Matching the tool to the job is the skill, and the Adobe case shows the cost of mismatching.",
      ],
      examples: [
        "A hash is a fingerprint: it changes completely if the input changes.",
        "Compare hashes to detect tampering: the integrity check (the 'I' of CIA).",
        "Encryption = reversible confidentiality; hashing = one-way verification. Complementary.",
      ],
      analogy: {
        plain: "A wax seal (hash) proves a letter was not opened or altered; a locked box (encryption) keeps the letter secret but lets the right person read it. Different jobs, different tools.",
        realTerm: "hashing for integrity",
      },
    },
  ],

  glossary: [
    { term: "hashing", definition: "A one-way function producing a fixed-length fingerprint of input; it cannot be reversed, used for password storage and integrity." },
    { term: "encryption", definition: "A reversible scrambling of data with a key; the key-holder can recover the original, used for confidentiality." },
    { term: "integrity check", definition: "Comparing hashes to detect whether data has been changed or tampered with, since a hash changes completely if the input does." },
    { term: "password hashing", definition: "Storing the hash of a password (never the password or a reversible encryption of it), so it can be checked but never recovered." },
  ],

  seeHeading: "When the wrong choice exposed 153 million passwords",

  cases: [
    {
      org: "Adobe",
      year: "2013",
      headline: "Using reversible encryption instead of hashing helped expose 153 million passwords",
      whatHappened: "In 2013, Adobe suffered a breach affecting around 153 million accounts. A central failure was cryptographic: rather than properly hashing passwords (one-way), Adobe stored them using reversible encryption, and in a way that let patterns be analysed. Worse, password hints were stored alongside in plain text. The result was that huge numbers of passwords could be worked out, because the storage method was reversible and the hints gave them away. It became a textbook example of using the wrong cryptographic tool: encryption where irreversible hashing was required.",
      theMissedMeasure: "Proper password hashing (one-way, and salted, per Module 3). Because hashing cannot be reversed, a breach of hashed passwords does not directly reveal them; Adobe's reversible encryption, plus plaintext hints, did exactly the opposite. It is the definitive 'hash passwords, never encrypt them' lesson.",
      theCost: "Around 153 million accounts exposed, with passwords recoverable because of the reversible storage and plaintext hints, a massive breach made far worse by confusing encryption with hashing.",
      control: "access-control",
      impact: ["~153 million accounts affected", "reversible encryption used where hashing was needed", "plaintext password hints made it worse"],
      source: "Public record; 2013 reporting and analysis of the Adobe breach.",
      brandColor: "#ed2224",
      news: { headline: "Adobe breach: 153 million passwords exposed by poor crypto choices", outlet: "Mainstream and security reporting (2013)", date: "2013" },
    },
  ],

  lab: {
    title: "Hash it, or encrypt it?",
    intro: "Nothing to install and nothing leaves this page. For each use, decide: do you want one-way hashing, or reversible encryption?",
    prompts: [
      "Must the data be recoverable? Encrypt. Check-only / never recoverable? Hash.",
      "Passwords: hash. Messages and stored data to read back: encrypt.",
      "Integrity checks (detecting tampering): hash.",
    ],
    component: HashEncryptLab,
  },

  check: {
    explain: {
      prompt: "Explain the core difference between hashing and encryption, why passwords must be hashed not encrypted, and what went wrong at Adobe.",
      modelAnswer: "The core difference is that encryption is reversible while hashing is one-way: with encryption, whoever has the key can turn the scrambled data back into the original (the recipient must be able to read it), whereas a hash is a one-way fingerprint with no key and no way back, so you cannot reconstruct the original from it. This decides which to use: data that must be recoverable (a message, a file) is encrypted, while data that must only be checked and never recovered is hashed. Passwords must be hashed, not encrypted, precisely because a site never needs to recover your actual password, only to check whether what you typed matches, so it stores the hash and compares hashes at login, meaning the original is never stored and cannot be recovered even by the site; if a site encrypts passwords instead, there is a key that can reverse them all, and if attackers steal both the encrypted passwords and the key, every password is instantly exposed, whereas hashing has no such key. Adobe went wrong by storing around 153 million users' passwords with reversible encryption instead of proper hashing, and in a way that let patterns be analysed, with plaintext password hints alongside, so huge numbers of passwords could be worked out, the textbook mistake of using encryption where irreversible hashing was required.",
    },
    quiz: [
      {
        q: "What is the fundamental difference between hashing and encryption?",
        options: [
          "They are the same",
          "Encryption is reversible (with the key); hashing is one-way (cannot be reversed)",
          "Hashing is reversible; encryption is not",
          "Only encryption uses computers",
        ],
        answer: 1,
        why: "Encryption you can undo with the key; a hash is a one-way fingerprint you cannot reverse. That decides which to use.",
      },
      {
        q: "Why must passwords be hashed, not encrypted?",
        options: [
          "Hashing is faster",
          "A site only needs to check a match, not recover the password; hashing has no key to reverse it, so a breach doesn't directly reveal passwords",
          "Encryption is illegal for passwords",
          "There is no reason",
        ],
        answer: 1,
        why: "Encryption has a key that can reverse all passwords if stolen; hashing is one-way, so even stolen hashes don't directly give up the passwords.",
      },
      {
        q: "What was Adobe's core cryptographic mistake in 2013?",
        options: [
          "Using hashing instead of encryption for messages",
          "Using reversible encryption (plus plaintext hints) for passwords, where irreversible hashing was needed",
          "Encrypting too strongly",
          "Not using computers",
        ],
        answer: 1,
        why: "Reversible storage plus plaintext hints meant passwords could be worked out, the classic 'encrypted where it should have hashed' error.",
      },
    ],
  },

  wrap: {
    headline: "You can now tell hashing from encryption, and know the costly mistake of confusing them.",
    takeaways: [
      "Encryption is reversible (with the key); hashing is one-way (no way back). This decides which to use.",
      "Passwords must be hashed, never encrypted: a site only checks a match, and hashing has no key to reverse.",
      "Hashing also proves integrity (detecting tampering); Adobe's reversible-encryption mistake exposed 153 million passwords.",
    ],
    project: {
      name: "Match tool to job",
      blurb: "List four kinds of data (e.g. a password, a private message, a downloaded file to verify, a stored document to read back later) and, for each, write whether you would hash or encrypt it and why. Matching the right cryptographic tool to the job is exactly the literacy this topic builds.",
    },
    ethicsNote: "Choosing the right cryptographic tool protects people's data correctly. This is defensive, constructive knowledge; the Adobe case shows the real human cost of getting it wrong.",
  },
};

export default topic3;

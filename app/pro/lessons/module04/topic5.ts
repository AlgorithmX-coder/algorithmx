import type { TopicManifest } from "../../learn/types";
import { SignatureLab } from "../../learn/conceptLabs";

/* Module 4 - Topic 5: digital signatures and PKI (proving who sent it).
 * Case: Stuxnet, 2010 (the sophisticated worm used stolen, legitimate
 * code-signing certificates to make its malicious drivers appear
 * trusted, abusing the signature trust model). Public record: 2010-2011
 * Stuxnet analysis and reporting. */
const topic5: TopicManifest = {
  id: "m4t5",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "Digital signatures & PKI",
  role: "Encryption keeps things secret, but a huge amount of security is about proving who sent something and that it was not changed. Digital signatures and the public-key infrastructure behind them provide exactly that, and they are everywhere, from software updates to secure email.",
  minutes: 16,
  promise: "Learn how cryptography proves who sent a message and that it is unaltered, then see malware abuse that very trust to look legitimate.",
  brief: "In this lesson, we'll complete the module with digital signatures: how cryptography proves authenticity (who sent something) and integrity (that it was not changed), rather than secrecy. We'll see how signatures work using key pairs in reverse, and the public-key infrastructure (PKI) that makes them trustworthy at scale. Then we'll see Stuxnet, where attackers abused the signature trust model, using stolen signing certificates to make malware look trusted.",

  learn: [
    {
      heading: "Signatures prove authenticity and integrity",
      body: [
        "Not everything in security is about secrecy. Often you need to prove who sent something and that it was not tampered with, without necessarily hiding it. That is what a digital signature does: it provides authenticity (confidence the message really came from the claimed sender) and integrity (confidence it was not altered since). A signed software update, for example, is not secret, you can read it, but the signature proves it genuinely came from the vendor and was not modified.",
        "This matters enormously. When your device installs an update, it checks the signature to be sure the update is really from the vendor and has not been tampered with en route, otherwise an attacker could slip in malicious code. Signatures are how we trust software, secure emails, documents, and much more. They answer 'is this really from who it claims, and is it unchanged?', a different and equally vital question from 'is this secret?'.",
      ],
      examples: [
        "A signature proves authenticity (who sent it) and integrity (it was not changed).",
        "A signed update is not secret, but the signature proves it is genuine and unaltered.",
        "Signatures answer 'is this really from them, and unchanged?', not 'is it secret?'.",
      ],
      analogy: {
        plain: "A wax seal with a unique crest proves a letter came from a particular person and was not opened or altered, even though anyone can read the letter. A signature is that seal, done with maths.",
        realTerm: "digital signature",
      },
    },
    {
      heading: "How signatures use key pairs in reverse",
      body: [
        "Digital signatures cleverly reuse the public/private key pair from earlier, the other way around. To sign, you use your private key (which only you have) to create a signature over the message; anyone can then use your public key (which everyone has) to verify that signature. Because only your private key could have produced a signature that your public key verifies, a valid signature proves it came from you, and because the signature covers the message content, any change to the message breaks it, proving integrity.",
        "Notice the elegant symmetry with encryption. For secrecy, others encrypt with your public key and you decrypt with your private key. For signing, you sign with your private key and others verify with your public key. The same key pair provides both confidentiality and authenticity, in opposite directions. You do not need the maths; you need the shape: private key signs, public key verifies, and that proves who sent it and that it is unchanged.",
      ],
      examples: [
        "Sign with your private key (only you have it); anyone verifies with your public key.",
        "Only your private key could produce a signature your public key verifies: proof it is you.",
        "Any change to the message breaks the signature: that proves integrity.",
      ],
    },
    {
      heading: "PKI, and what happens when signing is abused",
      body: [
        "For signatures to be trustworthy at scale, you need to know whose public key is whose, which is the job of public-key infrastructure (PKI): the system of certificates and authorities (the same chain of trust as HTTPS) that binds keys to identities. PKI is what lets your device trust that a software update's signature really belongs to the genuine vendor. It is the trust backbone behind signatures, certificates and HTTPS alike.",
        "But this trust can be abused. If an attacker steals a legitimate signing key or certificate, they can sign malicious software so it appears to come from a trusted vendor, and systems that check signatures will accept it. This is exactly what the Stuxnet case shows: attackers used stolen, legitimate signing certificates to make their malware's components look trusted, bypassing defences that rely on signatures. It is a powerful reminder that the whole system rests on signing keys being kept secure, and that a stolen key can turn the trust model against you.",
      ],
      examples: [
        "PKI (certificates and authorities) binds public keys to identities, so signatures can be trusted at scale.",
        "It is the same chain of trust behind HTTPS, applied to signing.",
        "A stolen signing key lets attackers sign malware to look trusted (as Stuxnet did).",
      ],
      analogy: {
        plain: "A stolen official seal lets a forger stamp fake documents that pass as genuine. Protecting the seal (the signing key) is everything; once stolen, the trust it carries works for the thief.",
        realTerm: "public-key infrastructure (PKI)",
      },
    },
  ],

  glossary: [
    { term: "digital signature", definition: "A cryptographic proof that a message came from the claimed sender (authenticity) and was not altered (integrity)." },
    { term: "signing vs verifying", definition: "You sign with your private key; others verify with your public key. The key pair used in reverse of encryption." },
    { term: "PKI", definition: "Public-key infrastructure: the system of certificates and authorities that binds public keys to identities, making signatures and certificates trustworthy at scale." },
    { term: "code signing", definition: "Digitally signing software so systems can verify it genuinely comes from the vendor and was not tampered with." },
  ],

  seeHeading: "When malware wore a stolen signature",

  cases: [
    {
      org: "Stuxnet",
      year: "2010",
      headline: "Sophisticated malware used stolen signing certificates to appear trusted",
      whatHappened: "Stuxnet, the highly sophisticated worm discovered in 2010 and widely analysed as a landmark cyber-weapon, did something striking with cryptography: to make its malicious components appear legitimate, it used stolen, genuine code-signing certificates belonging to real companies to digitally sign its drivers. Because systems trust software signed with valid certificates, this helped Stuxnet's components pass as trusted and evade defences that rely on signatures. It was a vivid demonstration of abusing the signature trust model, not by breaking the cryptography, but by stealing the keys that the trust depends on.",
      theMissedMeasure: "Protection of signing keys and certificates. Digital signatures are only as trustworthy as the secrecy of the signing keys; Stuxnet showed that stealing legitimate signing certificates lets attackers turn the trust model to their advantage. It drove stronger protection of signing keys and scrutiny of signed code.",
      theCost: "A landmark, highly capable attack whose use of stolen signing certificates showed, dramatically, that the trust behind digital signatures rests entirely on keeping signing keys secure, and that a stolen key makes malware look genuine.",
      control: "secure-configuration",
      impact: ["malware signed with stolen, legitimate certificates", "signed components passed as trusted, evading defences", "abused the signature trust model via stolen keys"],
      source: "Public record; 2010-2011 Stuxnet analysis and reporting.",
      brandColor: "#34495e",
      news: { headline: "Stuxnet: the malware that used stolen certificates to look legitimate", outlet: "Security reporting (2010-2011)", date: "2010" },
    },
  ],

  lab: {
    title: "Secret, or proof of sender?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: is it providing secrecy (encryption), or proof of who sent it and integrity (a signature)?",
    prompts: [
      "Encryption keeps it secret; a signature proves who sent it and that it is unaltered.",
      "Proving an update is genuine and unchanged is a signature's job, not encryption's.",
      "Certificates (PKI) bind keys to identities so both can be trusted.",
    ],
    component: SignatureLab,
  },

  check: {
    explain: {
      prompt: "Explain what digital signatures provide and how they use key pairs, what PKI is for, and how Stuxnet abused the signature trust model.",
      modelAnswer: "Digital signatures provide authenticity (confidence a message really came from the claimed sender) and integrity (confidence it was not altered since), rather than secrecy, so a signed software update is not hidden but is proven to come genuinely from the vendor and to be unchanged. They use the public/private key pair in reverse of encryption: you sign with your private key (which only you have), and anyone verifies with your public key (which everyone has), and because only your private key could produce a signature that your public key verifies, a valid signature proves it came from you, while because the signature covers the message content, any change breaks it, proving integrity. PKI (public-key infrastructure) is the system of certificates and authorities, the same chain of trust as HTTPS, that binds public keys to identities, so signatures can be trusted at scale (your device can trust that an update's signature really belongs to the genuine vendor). Stuxnet abused this trust model not by breaking the cryptography but by stealing it: it used stolen, legitimate code-signing certificates belonging to real companies to sign its malicious drivers, so that systems which trust validly-signed software accepted its components as genuine and defences relying on signatures were evaded. It showed that digital signatures are only as trustworthy as the secrecy of the signing keys, and that a stolen key turns the trust model to the attacker's advantage.",
    },
    quiz: [
      {
        q: "What does a digital signature provide?",
        options: [
          "Secrecy (hiding the contents)",
          "Authenticity (who sent it) and integrity (that it was not changed)",
          "Faster downloads",
          "A password reset",
        ],
        answer: 1,
        why: "Signatures prove origin and that the content is unaltered, a different job from encryption's secrecy.",
      },
      {
        q: "How does signing use a key pair?",
        options: [
          "Sign with the public key, verify with the private key",
          "Sign with your private key; anyone verifies with your public key",
          "There are no keys in signing",
          "The same single shared key",
        ],
        answer: 1,
        why: "Only your private key could produce a signature your public key verifies, so a valid signature proves it came from you.",
      },
      {
        q: "How did Stuxnet abuse the signature trust model?",
        options: [
          "It broke the encryption mathematically",
          "It used stolen, legitimate signing certificates to make its malware appear trusted",
          "It did not use cryptography",
          "It guessed the private keys",
        ],
        answer: 1,
        why: "By stealing real signing certificates, Stuxnet's components passed as genuine. Signatures are only as safe as the signing keys.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 4: you understand encryption, hashing, HTTPS, and signatures, the cryptography behind modern security.",
    takeaways: [
      "Digital signatures prove authenticity (who sent it) and integrity (unaltered), not secrecy.",
      "They use the key pair in reverse: private key signs, public key verifies, and PKI binds keys to identities at scale.",
      "The trust rests on signing keys being secure; Stuxnet abused stolen signing certificates to make malware look genuine.",
    ],
    project: {
      name: "Spot signatures in your life",
      blurb: "Note two places digital signatures protect you: for example, your device verifying a software update's signature before installing, or a signed app from an official store. Recognising where signatures (and the PKI behind them) quietly keep you safe is a sign you truly understand this foundational technology.",
    },
    ethicsNote: "Signatures and PKI are protective, trust-enabling technologies. Understanding them, including how their trust can be abused, is defensive knowledge used to secure and verify software and communication, within the Module 5 principles.",
  },
};

export default topic5;

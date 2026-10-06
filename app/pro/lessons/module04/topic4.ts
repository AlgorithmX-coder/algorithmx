import type { TopicManifest } from "../../learn/types";
import EncryptionLab from "../../learn/EncryptionLab";

/* Module 4 - Topic 4: HTTPS, TLS and certificates, with the real
 * in-browser AES EncryptionLab (reused from the original "Week 2"
 * build). Case: DigiNotar, 2011 (a certificate authority was breached
 * and issued fraudulent certificates, breaking the trust HTTPS relies
 * on; the CA collapsed). Public record: 2011 reporting on the DigiNotar
 * compromise. */
const topic4: TopicManifest = {
  id: "m4t4",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "HTTPS, TLS & certificates",
  role: "HTTPS protects almost everything you do online, and it combines everything in this module. Understanding how it uses encryption and certificates, and how it proves you are talking to the real site, is essential, and you will encrypt a real message yourself to feel it work.",
  minutes: 18,
  promise: "See how HTTPS actually secures the web, encrypt a real message in your browser, then see what happens when the trust behind certificates breaks.",
  brief: "In this lesson, we'll put the module together into HTTPS: the protocol (TLS) that secures the web. It combines the encryption you have learned with certificates that prove identity, so you know your connection is both private and genuinely with the right site. You will encrypt and break a real message yourself to feel encryption work. Then we'll see the DigiNotar case, where the trust that certificates rely on was broken, with dramatic consequences.",

  learn: [
    {
      heading: "TLS: encryption plus proof of identity",
      body: [
        "HTTPS is HTTP secured by TLS (Transport Layer Security). You met its two guarantees in Module 2: it encrypts the conversation (so no one on the network can read it), and it checks the server's identity (so you know you are really talking to the genuine site, not an impostor). This module explains how: TLS uses the hybrid encryption from earlier, asymmetric to agree a shared key, then symmetric for speed, and it uses certificates to prove identity.",
        "The privacy half is the encryption you now understand. The identity half is new and crucial: encryption alone would let you have a perfectly private conversation with an attacker impersonating your bank. Certificates solve that, by vouching that a particular public key really belongs to a particular website. Together, encryption and certificates give you a connection that is both private and genuine, which is exactly what the padlock means.",
      ],
      examples: [
        "HTTPS = HTTP + TLS: it encrypts the conversation and checks the server's identity.",
        "It uses hybrid encryption (asymmetric to agree a key, symmetric for speed).",
        "Encryption gives privacy; certificates give proof of identity. You need both.",
      ],
      analogy: {
        plain: "TLS is a sealed, tamper-proof envelope (encryption) delivered to an address a trusted directory has confirmed is really your bank's (the certificate). Private, and to the right place.",
        realTerm: "TLS / HTTPS",
      },
    },
    {
      heading: "Certificates and the chain of trust",
      body: [
        "A certificate is a digital document that binds a public key to an identity (a website), vouched for by a trusted third party called a Certificate Authority (CA). Your browser trusts a set of CAs; when a site presents a certificate signed by one of them, your browser believes the site is who it claims to be. This is the chain of trust: you trust the CA, the CA vouches for the site, so you trust the site's key.",
        "This system is what lets you trust a site you have never visited, but it has a critical dependency: the CAs must themselves be trustworthy and secure. If a CA is compromised and issues a fraudulent certificate for, say, your bank, an attacker holding that certificate could impersonate your bank convincingly, and your browser would show the reassuring padlock. The whole edifice of HTTPS trust rests on the integrity of the certificate authorities, which is exactly what the case ahead puts to the test.",
      ],
      examples: [
        "A certificate binds a public key to a website's identity, signed by a Certificate Authority.",
        "Your browser trusts the CAs; the CA vouches for the site: the chain of trust.",
        "If a CA is compromised, fraudulent certificates can impersonate real sites convincingly.",
      ],
    },
    {
      heading: "Feel it work, and trust the public standard",
      body: [
        "You are about to encrypt a real message in your browser, using the same kind of strong, standard encryption (AES) that TLS relies on, and try to open it with the wrong key and the right one. This makes the abstract concrete: you will see data become unreadable noise, and watch the key be the whole secret. Nothing leaves your browser; it is a safe, hands-on feel for what HTTPS does billions of times a day.",
        "One deep principle to carry away: strong encryption's security comes from the key, not from hiding the method. The standard algorithms (like AES) are completely public and have been attacked by experts for years without being broken, which is exactly why they are trusted. A homemade secret cipher is the opposite: untested, and likely weak. 'We invented our own secret encryption' is a warning sign, not a reassurance. Trust the public, battle-tested standards, and keep the key secret, that is how real cryptography works.",
      ],
      examples: [
        "You will encrypt a real message and feel the key be the whole secret.",
        "Security comes from the key, not from hiding the method (public standards like AES).",
        "'We made our own secret cipher' is a warning sign, not a reassurance.",
      ],
      analogy: {
        plain: "A bank-vault lock design can be public and still secure, because safety is in the key and the engineering, not in hiding the blueprint. Good crypto is the same.",
        realTerm: "public standards, secret keys",
      },
    },
  ],

  glossary: [
    { term: "TLS", definition: "Transport Layer Security: the protocol that secures HTTPS, encrypting the conversation and checking the server's identity." },
    { term: "certificate", definition: "A digital document binding a public key to an identity (a website), vouched for by a Certificate Authority." },
    { term: "Certificate Authority (CA)", definition: "A trusted party that issues and signs certificates; browsers trust a set of CAs, forming the chain of trust." },
    { term: "chain of trust", definition: "You trust the CA, the CA vouches for the site, so you trust the site; it depends entirely on CAs being secure." },
  ],

  seeHeading: "When the trust behind certificates broke",

  cases: [
    {
      org: "DigiNotar",
      year: "2011",
      headline: "A compromised certificate authority issued fraudulent certificates, and collapsed",
      whatHappened: "In 2011, the Dutch certificate authority DigiNotar was compromised, and attackers used that access to issue fraudulent certificates for high-profile domains, including, reportedly, major services. Because browsers trusted DigiNotar as a CA, these fraudulent certificates could be used to impersonate real sites convincingly, complete with the trusted padlock, enabling interception of users' supposedly-secure connections. When the breach came to light, trust in DigiNotar was withdrawn, browsers removed it, and the company collapsed. It was a stark demonstration that the entire HTTPS trust model depends on certificate authorities being secure.",
      theMissedMeasure: "The security of the certificate authority itself. HTTPS trust rests on CAs; a compromised CA can undermine the padlock for everyone who trusts it. The episode drove stronger CA security, monitoring (like certificate transparency), and faster distrust mechanisms, but it showed how much rests on this foundation.",
      theCost: "Fraudulent certificates for major domains, the potential interception of secure connections, the removal and collapse of a certificate authority, and a lasting lesson about the fragility and importance of the chain of trust behind HTTPS.",
      control: "secure-configuration",
      impact: ["a CA compromised and issuing fraudulent certificates", "fraudulent certs could impersonate real sites with a valid padlock", "DigiNotar was distrusted and collapsed"],
      source: "Public record; 2011 reporting on the DigiNotar compromise.",
      brandColor: "#d35400",
      news: { headline: "DigiNotar: the certificate authority breach that broke HTTPS trust", outlet: "Security reporting (2011)", date: "2011" },
    },
  ],

  lab: {
    title: "The Encryption Lab",
    intro: "This is real AES-256 running in your own browser, the same kind of strong encryption TLS uses. Your message and key never leave the page.",
    prompts: [
      "Lock a short message with a key like 'bluewhale', and watch it turn to noise.",
      "Change one letter of the message, or the key, and see the whole box change.",
      "Try to open it with the WRONG key first, then the right one. Feel that the key is the whole secret.",
    ],
    component: EncryptionLab,
  },

  check: {
    explain: {
      prompt: "Explain the two things HTTPS (TLS) guarantees, how certificates provide the second, and why the DigiNotar case was so serious.",
      modelAnswer: "HTTPS, which is HTTP secured by TLS, guarantees two things: it encrypts the conversation so no one on the network can read it (privacy), and it checks the server's identity so you know you are really talking to the genuine site, not an impostor. It uses the hybrid encryption from earlier (asymmetric to agree a shared key, then symmetric for speed) for the privacy half, and certificates for the identity half, which is crucial because encryption alone would let you have a perfectly private conversation with an attacker impersonating your bank. Certificates provide identity by binding a public key to a website's identity, vouched for by a trusted Certificate Authority (CA): your browser trusts a set of CAs, so when a site presents a certificate signed by one, your browser believes the site is who it claims, the chain of trust (you trust the CA, the CA vouches for the site). The DigiNotar case was so serious because it attacked exactly this foundation: the CA was compromised and issued fraudulent certificates for high-profile domains, and because browsers trusted DigiNotar, those fraudulent certificates could impersonate real sites convincingly, complete with the reassuring padlock, enabling interception of supposedly-secure connections. It showed that the entire HTTPS trust model depends on certificate authorities being secure, and when one is not, the padlock itself can be made to lie.",
    },
    quiz: [
      {
        q: "What TWO things does HTTPS (TLS) guarantee?",
        options: [
          "Speed and storage",
          "Encryption of the conversation, and proof of the server's identity",
          "Only encryption",
          "Only identity",
        ],
        answer: 1,
        why: "Privacy (encryption) and identity (certificates) together are what the padlock means. Encryption alone could be with an impostor.",
      },
      {
        q: "What does a certificate do?",
        options: [
          "Encrypts the whole internet",
          "Binds a public key to a website's identity, vouched for by a trusted Certificate Authority",
          "Stores your password",
          "Speeds up the connection",
        ],
        answer: 1,
        why: "Certificates provide the identity half of HTTPS via the chain of trust: you trust the CA, the CA vouches for the site.",
      },
      {
        q: "Why was the DigiNotar compromise so damaging?",
        options: [
          "It slowed the internet down",
          "A compromised CA issued fraudulent certificates that could impersonate real sites with a valid padlock",
          "It only affected one website",
          "Certificates are unimportant",
        ],
        answer: 1,
        why: "HTTPS trust rests on CAs being secure. A compromised CA can make the padlock lie for everyone who trusts it.",
      },
    ],
  },

  wrap: {
    headline: "You now understand HTTPS fully, encryption and certificates together, and you have felt encryption work with your own hands.",
    takeaways: [
      "HTTPS (TLS) both encrypts the conversation and proves the server's identity via certificates.",
      "Certificates bind a key to an identity through a chain of trust that depends on Certificate Authorities being secure.",
      "Strong encryption's security is in the key, not in hiding the method; a compromised CA (DigiNotar) can break the whole trust model.",
    ],
    project: {
      name: "Inspect a real certificate",
      blurb: "On any HTTPS site, click the padlock and open the certificate details. Note who issued it (the CA), who it is for, and when it expires. Connecting what you just learned to a real certificate in your browser makes HTTPS concrete, and it is exactly what a web-security analyst reads.",
    },
    ethicsNote: "Understanding HTTPS and certificates is defensive knowledge for securing and verifying connections. The hands-on lab runs entirely in your browser; nothing leaves the page, and all of this is studied within the Module 5 principles.",
  },
};

export default topic4;

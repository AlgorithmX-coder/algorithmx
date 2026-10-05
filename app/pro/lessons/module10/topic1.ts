import type { TopicManifest } from "../../learn/types";
import { EavesdropLab } from "../../learn/conceptLabs";

/* Module 10 - Topic 1: eavesdropping and man-in-the-middle. Case:
 * Lenovo "Superfish", 2015 (preinstalled adware shipped a MITM root
 * certificate that broke HTTPS protection on affected laptops, exposing
 * users to interception). Public record: 2015 reporting and US FTC
 * action. */
const topic1: TopicManifest = {
  id: "m10t1",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Eavesdropping and the middleman",
  role: "Network attacks target the journey you learned in Module 2. Understanding eavesdropping and the man-in-the-middle, and the encryption that defeats them, is bread-and-butter for any analyst, and it explains why HTTPS and VPNs matter in practice, not just in theory.",
  minutes: 16,
  promise: "Learn how attackers listen in and insert themselves into your traffic, then see the laptops that shipped with the eavesdropper pre-installed.",
  brief: "In this lesson, we'll attack the journey. We'll look at eavesdropping, quietly listening to traffic as it crosses a network, and the man-in-the-middle, where an attacker secretly sits between you and who you think you are talking to, able to read and even alter what passes. We'll see why encryption is the defence, and then study the case where millions of laptops shipped with software that deliberately broke that very protection.",

  learn: [
    {
      heading: "Listening in: eavesdropping on the journey",
      body: [
        "Recall from Module 2 that your data travels as packets across shared networks. Eavesdropping is simply listening to those packets as they pass. On an unencrypted network, especially open Wi-Fi, anyone suitably positioned can capture the traffic and read whatever is sent in the clear: the websites you visit, and on plain HTTP, the very contents, passwords included.",
        "This is exactly why encryption in transit matters so much. HTTPS scrambles the content of your web conversations, and a VPN wraps all your traffic in encryption across an untrusted network. With these, an eavesdropper captures only unreadable noise. Without them, they capture your secrets. The defence is not mysterious; it is encrypting the journey.",
      ],
      examples: [
        "On open Wi-Fi, plain HTTP traffic can be read by anyone listening nearby.",
        "HTTPS scrambles the content, so an eavesdropper sees only gibberish.",
        "A VPN encrypts everything across the untrusted network, not just web browsing.",
      ],
      analogy: {
        plain: "Sending a postcard versus a sealed letter. On an open network, plain traffic is a postcard every handler can read; encryption is the sealed, tamper-proof envelope.",
        realTerm: "eavesdropping",
      },
    },
    {
      heading: "The man in the middle: not just listening, interfering",
      body: [
        "A man-in-the-middle attack goes further than listening. Here the attacker secretly positions themselves between you and the service you are using, so that everything you send goes through them first. They can read it, and crucially they can alter it, or impersonate the other side entirely, while you believe you are talking directly to the real service.",
        "This is dangerous precisely because it is invisible: the page can look completely normal while an attacker relays and tampers with your conversation. Defences work by making impersonation hard: HTTPS does not only encrypt, it checks the server's identity with a certificate, so a middleman cannot convincingly pretend to be your bank, your browser will warn you instead.",
      ],
      examples: [
        "The attacker relays your traffic, able to read and change it in transit.",
        "They can impersonate the real service while you see a normal-looking page.",
        "HTTPS certificates make impersonation hard: a fake triggers a browser warning.",
      ],
      analogy: {
        plain: "A dishonest interpreter standing between two people who do not share a language: they can twist every message, and neither speaker realises the words are being changed.",
        realTerm: "man-in-the-middle",
      },
    },
    {
      heading: "When the protection itself is subverted",
      body: [
        "The defence against the middleman rests on trust: your device trusts certain authorities to vouch for who a server really is. But that trust can be abused. If something installs its own trusted certificate authority on your machine, it can impersonate any website without triggering a warning, becoming an undetectable man-in-the-middle, because your device has been told to trust it.",
        "This is not hypothetical. It is exactly what the case ahead involves: software, pre-installed on laptops, that inserted its own trusted certificate to intercept users' encrypted traffic, silently breaking the protection HTTPS is supposed to provide. It is a sharp reminder that your security depends on what your device trusts, and that trust must be guarded.",
      ],
      examples: [
        "A rogue trusted certificate lets something impersonate any site, warning-free.",
        "Your device's security depends on what certificate authorities it trusts.",
        "Subverting that trust turns the HTTPS protection into an open door.",
      ],
      analogy: {
        plain: "If a forger convinces you their seal is genuine, every forged letter they send now passes your check. Corrupt the trust, and every forgery sails through.",
        realTerm: "certificate trust",
      },
    },
  ],

  glossary: [
    { term: "eavesdropping", definition: "Quietly capturing and reading network traffic as it passes, especially easy on unencrypted or open networks." },
    { term: "man-in-the-middle (MITM)", definition: "An attacker secretly positioned between two parties, able to read and alter what passes while both believe they talk directly." },
    { term: "encryption in transit", definition: "Scrambling data as it travels (via HTTPS or a VPN) so eavesdroppers capture only unreadable noise." },
    { term: "certificate authority", definition: "A trusted party that vouches for a server's identity; your device's security depends on which authorities it trusts." },
  ],

  seeHeading: "When laptops shipped with the eavesdropper built in",

  cases: [
    {
      org: "Lenovo 'Superfish'",
      year: "2015",
      headline: "Pre-installed software broke HTTPS protection on millions of laptops",
      whatHappened: "In 2015 it emerged that some Lenovo consumer laptops shipped with pre-installed adware known as Superfish. To inject adverts into encrypted web pages, it installed its own trusted root certificate on the machine, which let it act as a man-in-the-middle on users' HTTPS traffic without triggering warnings. Worse, weaknesses in how it did this meant other attackers could potentially abuse the same mechanism to intercept affected users' secure connections. The very protection HTTPS provides had been silently subverted on the users' own devices.",
      theMissedMeasure: "The integrity of the device's trust store. Nothing should insert a trusted certificate that enables interception of encrypted traffic. The episode showed why what your device trusts must be tightly controlled, and why security-conscious users and organisations check for exactly this kind of tampering.",
      theCost: "Millions of affected laptops, users' supposedly-secure connections exposed to interception, a major loss of trust, and regulatory action (a settlement with the US FTC). A stark lesson that encryption only protects you if the trust it relies on is intact.",
      control: "secure-configuration",
      impact: ["a MITM-enabling root certificate pre-installed on consumer laptops", "HTTPS protection silently broken on affected machines", "US FTC settlement followed"],
      source: "Public record; 2015 reporting and US Federal Trade Commission action.",
      brandColor: "#e2231a",
      news: { headline: "Lenovo Superfish: the adware that broke HTTPS security", outlet: "Mainstream and security reporting (2015)", date: "2015" },
    },
  ],

  lab: {
    title: "What protects the journey?",
    intro: "Nothing to install and nothing leaves this page. On an untrusted network, for each measure, decide: does it actually protect your traffic from eavesdropping, or not?",
    prompts: [
      "Encryption in transit (HTTPS, a trustworthy VPN, encrypted Wi-Fi) is the real protection.",
      "Beware false comfort: a busy network or a professional-looking site proves nothing.",
      "This is Module 2's HTTPS lesson, now in the context of a live network attacker.",
    ],
    component: EavesdropLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between eavesdropping and a man-in-the-middle attack, and why the Lenovo Superfish case was so serious even though HTTPS existed.",
      modelAnswer: "Eavesdropping is passively listening to traffic as it crosses a network, reading whatever is sent in the clear. A man-in-the-middle attack goes further: the attacker secretly sits between you and the service, able not just to read but to alter your traffic or impersonate the other side, while you see a normal-looking page. HTTPS defends against both by encrypting the content and checking the server's identity with a certificate, so a middleman cannot convincingly impersonate your bank. Superfish was so serious because it subverted that very defence from inside the device: by installing its own trusted root certificate, it could act as an undetectable man-in-the-middle on HTTPS traffic without any warning, and its weaknesses risked letting others do the same. It shows that encryption only protects you if the trust it depends on, what your device trusts, is intact.",
    },
    quiz: [
      {
        q: "What can a man-in-the-middle attacker do that a pure eavesdropper cannot?",
        options: [
          "Nothing; they are the same",
          "Alter the traffic and impersonate the other side, not just read it",
          "Only slow the connection down",
          "Only attack wired networks",
        ],
        answer: 1,
        why: "A middleman relays the conversation and can change it or impersonate a party, while an eavesdropper only listens.",
      },
      {
        q: "What is the real defence against eavesdropping on an untrusted network?",
        options: [
          "Choosing a professional-looking website",
          "Encryption in transit: HTTPS and a trustworthy VPN, so captured traffic is unreadable",
          "Connecting to the busiest Wi-Fi",
          "Typing quickly",
        ],
        answer: 1,
        why: "Only encryption makes captured traffic useless to a listener. Appearance and popularity are irrelevant.",
      },
      {
        q: "Why was Superfish able to intercept HTTPS traffic without warnings?",
        options: [
          "HTTPS is fundamentally broken",
          "It installed its own trusted root certificate, so the device trusted its impersonation of sites",
          "It only affected plain HTTP",
          "Users turned off all security",
        ],
        answer: 1,
        why: "By subverting the device's trust store, it could impersonate any site warning-free: your security depends on what your device trusts.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the two classic journey attacks, and that encryption defends them only while its trust is intact.",
    takeaways: [
      "Eavesdropping passively reads traffic; a man-in-the-middle also alters it and impersonates the other side.",
      "Encryption in transit (HTTPS, VPN) is the defence: it hides content and, via certificates, checks identity.",
      "That protection depends on what your device trusts, so a subverted trust store (like Superfish) silently breaks it.",
    ],
    project: {
      name: "Check your protections",
      blurb: "On a device you use, confirm two things: that you rely on HTTPS (look for the padlock) and have a plan for public Wi-Fi (a VPN, or using mobile data for sensitive tasks). If you administer a device, learn where its trusted certificates live. Knowing what protects, and trusts, your traffic is the practical core of this topic.",
    },
    ethicsNote: "Capturing or altering traffic on networks you do not own or have permission to test is interception, a serious offence under the Computer Misuse Act (Module 5). These attacks are studied here only to recognise and defend against them.",
  },
};

export default topic1;

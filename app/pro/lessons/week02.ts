import type { LessonManifest } from "../learn/types";
import EncryptionLab from "../learn/EncryptionLab";

/* Week 2 - Encryption. The natural partner to Week 1: hashing is a
 * one-way fingerprint that PROVES; encryption is a two-way lockbox that
 * HIDES. Real primitive in the lab (browser AES-256-GCM). Both cases are
 * real and public-record.
 *
 * Sources checked at authoring (headline/outlet exact wording + urls to
 * be re-verified before this ships to paying learners, per canon s.9):
 *  - Adobe 2013: ~153M accounts; passwords 3DES-ECB encrypted (reversible,
 *    no salt) with plaintext hints stored alongside. Initial public figure
 *    38M (BBC, Oct 2013), full ~153M from the leaked credential file.
 *  - Firesheep, Oct 2010 (Eric Butler, ToorCon): browser add-on that
 *    hijacked plain-http session cookies on open Wi-Fi; credited with
 *    pushing major sites to full-session https. */
const week02: LessonManifest = {
  id: "week-02",
  weekLabel: "Week 2",
  act: "Act 1 - Foundations you can touch",
  title: "Encryption: how secrets travel in the open",
  role: "The ground every role stands on. SOC analysts, pen testers and GRC all reason daily about what is encrypted, how, and where the keys live.",
  minutes: 35,
  promise: "See a message become unreadable to everyone but the right key, meet two companies that got encryption wrong, then lock and break real messages yourself.",

  learn: [
    {
      heading: "Hashing proves who you are. Encryption hides what you say",
      body: [
        "Last week you met hashing: a one-way fingerprint with no reverse gear, used to check a password without ever storing it. Encryption is the opposite job. It is a two-way lockbox: you scramble a message with a key, and the same key unscrambles it back to the exact original.",
        "People mix these up constantly, so hold the difference clearly. A hash can never be undone, that is the point of it. Encryption is meant to be undone, but only by whoever holds the key. Fingerprint versus lockbox: same maths family, opposite purposes.",
      ],
      analogy: {
        plain: "A hash is a fingerprint you can never turn back into the person. Encryption is a locked box you can open again, if you have the key.",
        realTerm: "encryption",
      },
    },
    {
      heading: "The method is public. The key is the whole secret",
      body: [
        "Here is the part that surprises beginners: the encryption method is not a secret. AES, the cipher you are about to use, is published in full. Every attacker on Earth knows exactly how it works. That is on purpose, a method only trusted because it is kept hidden has never been properly tested.",
        "So where does the safety come from? The key, and only the key. Change the key and the box will not open. And a wrong key does not give you a partial or a 'close enough' answer, it gives you nothing at all. You will feel that for yourself in a moment.",
      ],
      analogy: {
        plain: "Everyone knows how a padlock is built; that is no help without your particular key. Secrecy lives in the key, not the design.",
        realTerm: "Kerckhoffs's principle",
      },
    },
    {
      heading: "This is what the padlock in your browser is doing",
      body: [
        "When a web address starts with https, your device and the website quietly agree on a shared key and encrypt everything that passes between them. On café or airport Wi-Fi, someone snooping the network sees only scrambled noise, not your messages, not your passwords.",
        "Drop the 's' and it is plain http: the same traffic travels as readable text that anyone on the network can lift. That exact gap is what the Firesheep demo exploited in 2010, and it is why 'https everywhere' became non-negotiable. The padlock is not decoration; it is this lesson, running for real on every page you load.",
      ],
      analogy: {
        plain: "Plain http is a postcard: every hand it passes through can read it. https is a sealed, locked box only the recipient can open.",
        realTerm: "HTTPS / TLS",
      },
    },
  ],

  seeHeading: "Two ways to get encryption wrong",

  cases: [
    {
      org: "Adobe",
      year: "2013",
      headline: "153 million accounts 'encrypted' with a method that could be reversed",
      whatHappened: "Adobe was breached and its account database stolen. The passwords were not hashed, they were encrypted with an old method (3DES) run in a weak mode called ECB, with no random salt. Worse, the password hints people had written were stored in plain readable text right next to them.",
      theMissedMeasure: "Reversible encryption used where a one-way hash was needed, in a mode where identical passwords produce identical ciphertext. The repeating patterns plus the plaintext hints handed attackers the passwords without them ever having to break the cipher.",
      theCost: "Around 153 million accounts were exposed. Enormous numbers of passwords were recovered purely from the leaked patterns and hints. It is still taught as the textbook example of encryption applied to the wrong job, the wrong way.",
      control: "secure-configuration",
      source: "Public breach record, 2013; the 3DES-ECB and plaintext-hint failures were widely analysed (e.g. Sophos Naked Security). Full ~153M scale from the leaked credential file.",
      brandColor: "#fa0f00",
      news: { headline: "Adobe hack: at least 38 million accounts breached", outlet: "BBC News", date: "October 2013" },
    },
    {
      org: "Firesheep",
      year: "2010",
      headline: "One click on café Wi-Fi, and you were logged in as a stranger",
      whatHappened: "A researcher released Firesheep, a simple browser add-on. On open Wi-Fi it listed everyone nearby who was signed in to big sites like Facebook and Twitter, because those sites still sent the session over plain, unencrypted http. Double-click a name and you were inside their account.",
      theMissedMeasure: "No encryption in transit. The login page might have been https, but the rest of the session travelled in the clear, so anyone sharing the network could read it and replay it.",
      theCost: "It was a deliberate, very public wake-up call, and it worked. Within a couple of years the major sites moved to https for the entire session, and 'https everywhere' became the default you now rely on. It is the direct reason the padlock protects you today.",
      control: "secure-configuration",
      source: "Firesheep, released by Eric Butler at ToorCon, October 2010; widely credited with pushing the web to full-session https.",
      brandColor: "#ff7a2f",
      news: { headline: "Firesheep add-on lets anyone hijack Wi-Fi web sessions", outlet: "The Guardian", date: "October 2010" },
    },
  ],

  lab: {
    title: "The Encryption Lab",
    intro: "This is real AES-256 running in your own browser. Your message and key never leave the page.",
    prompts: [
      "Lock a short message with a key like 'bluewhale', and watch it turn to noise.",
      "Change one letter of the message, or the key, and see the whole box change.",
      "Now try to open it with the WRONG key first. Then the right one. Feel the difference a key makes.",
    ],
    component: EncryptionLab,
  },

  check: {
    explain: {
      prompt: "A friend says: 'Our app is safe, we invented our own secret encryption method and we keep it hidden.' In your own words, why should that worry you more, not less? Write a sentence or two, then reveal a model answer.",
      modelAnswer: "Real security comes from the key, not from hiding the method (Kerckhoffs's principle). A homemade cipher kept secret has never been publicly tested, which is exactly how weaknesses survive undiscovered until an attacker finds them. Trusted ciphers like AES are safe because they are public and everyone has tried and failed to break them. 'We made our own and won't tell you how' usually means no one has ever checked it works.",
    },
    quiz: [
      {
        q: "What is the core difference between hashing and encryption?",
        options: [
          "Hashing is faster; encryption is slower but does the same job",
          "Hashing is one-way and cannot be undone; encryption is two-way and reverses with the key",
          "Hashing needs a key; encryption does not",
          "They are two words for the same process",
        ],
        answer: 1,
        why: "A hash is a one-way fingerprint used to check a value without storing it. Encryption is a two-way lockbox: the right key turns the ciphertext back into the exact original. Different jobs, opposite directions.",
      },
      {
        q: "AES is completely public, so anyone can read how it works. Why is it still safe?",
        options: [
          "Because the code is too complicated to understand",
          "Because the safety lives in the secret key, not in hiding the method",
          "Because only approved companies are allowed to use it",
          "Because it changes its own algorithm every day",
        ],
        answer: 1,
        why: "That is Kerckhoffs's principle. A cipher should stay secure even when the attacker knows exactly how it works, because the only secret is the key. Being public is why AES can be trusted: it has survived decades of people trying to break it.",
      },
      {
        q: "You are on open café Wi-Fi. Which best protects what you send?",
        options: [
          "Using a site over plain http so it loads faster",
          "Only visiting sites whose address begins with https",
          "Typing your password quickly so no one sees",
          "Turning the screen brightness down",
        ],
        answer: 1,
        why: "https encrypts the whole session between you and the site, so a snooper on the same network sees only noise. Plain http travels as readable text, exactly the gap Firesheep exploited in 2010.",
      },
    ],
  },

  wrap: {
    headline: "You have locked a real message, and watched the wrong key get nothing.",
    takeaways: [
      "Hashing proves (one-way, no reverse); encryption hides (two-way, reverses with the key). Different jobs.",
      "The method is public; the key is the whole secret. A homemade 'secret' cipher is a red flag, not a feature.",
      "https encrypts your whole session; on open Wi-Fi it is the difference between a sealed box and a postcard.",
    ],
    project: {
      name: "Personal Security Audit (continued)",
      blurb: "This week's entry: check that the sites where you log in show https, turn on device encryption if your phone or laptop does not already have it (most now do by default), and note anywhere you still send sensitive things unencrypted (an email attachment, say). Add a short paragraph to your audit on what you found and what you changed.",
    },
    ethicsNote: "Strong encryption is legal and it protects everyone: your messages, your bank, hospital records. The same lesson has a discipline attached, only ever decrypt or intercept traffic that is yours or that you are explicitly authorised to test. Reading someone else's traffic without permission is an offence under the UK Computer Misuse Act 1990.",
  },
};

export default week02;

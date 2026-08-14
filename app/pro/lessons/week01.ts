import type { LessonManifest } from "../learn/types";
import PasswordLab from "../learn/PasswordLab";

/* Week 1 - Passwords and hashing. The strongest from-zero hook: it is
 * personal, it uses real data and a real primitive (browser SHA-256),
 * and it kicks off the Personal Security Audit project. Both cases are
 * real and source-verified (public record only, per canon section 9).
 *
 * Sources checked at authoring:
 *  - RockYou 2009: ~32.6M passwords stored in plaintext, exposed via
 *    SQL injection Dec 2009; the list became `rockyou.txt`. (Widely
 *    documented; Imperva analysis 2010, the origin of the wordlist.)
 *  - LinkedIn 2012: password hashes stored as unsalted SHA-1; ~6.5M
 *    posted in 2012, revealed in 2016 to total ~117M+ accounts. */
const week01: LessonManifest = {
  id: "week-01",
  weekLabel: "Week 1",
  act: "Act 1 - Foundations you can touch",
  title: "Passwords: the lock everyone picks first",
  role: "Every role starts here. SOC analysts, incident responders and pen testers all reason about credentials daily.",
  minutes: 35,
  promise: "Understand how passwords are really stored, see two real companies that got it wrong, then break some yourself.",

  learn: [
    {
      heading: "A password is not stored the way you type it",
      body: [
        "When you make an account, it feels like the website saves your password in a big list next to your name. If that were true, anyone who stole the list would instantly have every password. Good websites never do this.",
        "Instead they run your password through a one-way maths function called a hash. It turns any text into a fixed jumble of characters, and there is no reverse gear: you cannot turn the jumble back into the password.",
      ],
      analogy: {
        plain: "A hash is like a fingerprint, not a lock. You can take someone's fingerprint in a second, but you cannot rebuild the person from the fingerprint.",
        realTerm: "hashing",
      },
      diagram: "hash-oneway",
    },
    {
      heading: "Same input, same fingerprint. Change one letter, everything changes",
      body: [
        "Hashing is consistent: the same password always produces the same fingerprint. That is how a site checks your login without ever storing the real password. It fingerprints what you typed and compares it to the fingerprint it saved.",
        "But change a single character and the whole fingerprint transforms completely. This is called the avalanche effect, and you will watch it happen for yourself in a moment.",
      ],
      analogy: {
        plain: "Add one full stop to a sentence and imagine the whole page rewriting itself. Small change in, huge change out.",
        realTerm: "the avalanche effect",
      },
      diagram: "avalanche",
    },
    {
      heading: "So why do breaches still leak passwords?",
      body: [
        "Two reasons, and they are exactly the mistakes our two real companies made. First, some sites do not hash at all and store the raw password. Second, some hash badly: they use a fast, outdated method with no random 'salt' added, so attackers can guess billions of candidates per second and crack the weak ones anyway.",
        "You cannot control how a website stores your password. But you can control two things that beat both mistakes: make each password long and unique, and turn on a second step (MFA) so a stolen password is not enough on its own.",
      ],
    },
  ],

  seeHeading: "Two companies that got this wrong",

  cases: [
    {
      org: "RockYou",
      year: "2009",
      headline: "32 million passwords, stored as plain readable text",
      whatHappened: "RockYou built widgets for social networks and kept every user's password in its database exactly as typed, with no hashing at all. In December 2009 an attacker pulled the whole database out through a basic SQL injection flaw.",
      theMissedMeasure: "Passwords were never hashed. Once the database leaked, every password was simply readable.",
      theCost: "The full list of 32 million real passwords was published. It became the file `rockyou.txt`, still the first password-guessing wordlist attackers reach for today. One company's shortcut became a permanent weapon against everyone.",
      control: "secure-configuration",
      source: "Public breach record; Imperva 'Consumer Password Worst Practices' analysis, 2010.",
      brandColor: "#e0524a",
      news: { headline: "RockYou hack: from bad to worse", outlet: "TechCrunch", date: "December 2009", url: "https://techcrunch.com/2009/12/14/rockyou-hack-security-myspace-facebook-passwords/" },
    },
    {
      org: "LinkedIn",
      year: "2012",
      headline: "Hashed, but the lazy way, so 117 million cracked anyway",
      whatHappened: "LinkedIn did hash its passwords, but used an old fast method (SHA-1) with no random salt added. That let attackers pre-compute and guess candidates at enormous speed against the whole leaked set.",
      theMissedMeasure: "Hashing without salt and with a fast algorithm. Hashing is not a tick-box; done poorly it barely slows an attacker down.",
      theCost: "First reported as 6.5 million in 2012, the true scale emerged in 2016: over 117 million accounts. The dumped credentials fed years of account-takeover attacks on other sites, because people reuse passwords.",
      control: "secure-configuration",
      source: "Public breach record; 2016 disclosure of the full ~117M dataset.",
      brandColor: "#0a66c2",
      news: { headline: "LinkedIn passwords leaked by hackers", outlet: "BBC News", date: "June 2012", url: "https://www.bbc.co.uk/news/technology-18338956" },
    },
  ],

  lab: {
    title: "The Password Lab",
    intro: "This is a real hash function running in your own browser. Nothing you type is sent anywhere.",
    prompts: [
      "Type a weak password like 'password123' and read the crack-time estimate.",
      "Now try a long passphrase like 'purple-tractor-window-jazz'. Watch the estimate jump.",
      "Change one single character and watch the whole fingerprint avalanche.",
    ],
    component: PasswordLab,
  },

  check: {
    explain: {
      prompt: "A friend says: 'I use one really strong password everywhere, so I'm safe.' In your own words, why is that still risky? Write a sentence or two, then reveal a model answer.",
      modelAnswer: "The password being strong does not help if any one of those sites stores or hashes it badly and gets breached, like RockYou or LinkedIn. Once that single password leaks, attackers try it on every other site the person uses, because reuse means one leak unlocks everything. Strong-but-reused still has a single point of failure; unique passwords plus MFA remove it.",
    },
    quiz: [
      {
        q: "Why can a website check your login without storing your actual password?",
        options: [
          "It stores the password encrypted and decrypts it each time",
          "It stores a one-way hash and compares the hash of what you typed",
          "It emails you to confirm the password every time",
          "It keeps the password in a hidden file only staff can read",
        ],
        answer: 1,
        why: "Hashing is one-way. The site saves the fingerprint of your password, then fingerprints your login attempt and checks the two match, so it never needs the real password on file.",
      },
      {
        q: "What was the specific mistake that made the RockYou breach so damaging?",
        options: [
          "They used weak two-factor authentication",
          "They hashed passwords with an old algorithm",
          "They stored passwords as plain readable text, not hashed at all",
          "They reused the same password internally",
        ],
        answer: 2,
        why: "RockYou stored raw passwords with no hashing, so the leaked database was instantly readable. That is why the list became the rockyou.txt wordlist attackers still use.",
      },
      {
        q: "You cannot control how a site stores your password. What best protects you anyway?",
        options: [
          "Changing your password every week",
          "Using a long, unique password per site plus MFA",
          "Only using websites you have heard of",
          "Adding numbers to the end of one favourite password",
        ],
        answer: 1,
        why: "Unique-per-site means one breach cannot unlock your other accounts, and MFA means a stolen password alone is not enough to get in. Together they beat both the RockYou and LinkedIn failure modes.",
      },
    ],
  },

  wrap: {
    headline: "You understand how passwords really work, and you have the fingerprints to prove it.",
    takeaways: [
      "Good sites store a one-way hash of your password, never the password itself.",
      "Hashing done badly (no salt, fast algorithm) is barely better than not hashing at all, as LinkedIn found out.",
      "You control the two measures that beat both mistakes: unique passwords and MFA.",
    ],
    project: {
      name: "Personal Security Audit (starts now)",
      blurb: "Your first real portfolio piece. Over Act 1 you will audit your own security: check which of your accounts have appeared in known breaches, move to a password manager, and turn on MFA for your five most important accounts. This week: list those five accounts and check them. You will record a before-and-after at the end of the act.",
    },
    ethicsNote: "One rule from day one: everything you learn here is for defending and for systems you own or are authorised to test. In the UK, accessing an account or system without permission is a criminal offence under the Computer Misuse Act 1990. We will treat this seriously throughout the course.",
  },
};

export default week01;

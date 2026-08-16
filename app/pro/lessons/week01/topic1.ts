import type { TopicManifest } from "../../learn/types";
import PasswordLab from "../../learn/PasswordLab";

/* Week 1 - Topic 1: how a password is really stored (hashing). The
 * from-zero hook: personal, real data, a real primitive (browser
 * SHA-256). Cases are real, source-verified public record only. */
const topic1: TopicManifest = {
  id: "w1t1",
  weekLabel: "Module 3",
  act: "Act 1 - Foundations you can touch",
  title: "How your password is really stored",
  role: "Every role starts here. SOC analysts, incident responders and pen testers all reason about credentials daily.",
  minutes: 22,
  promise: "See how good websites store your password without ever keeping the password itself, and meet a password manager whose stolen vaults showed why it all comes down to storage.",

  learn: [
    {
      heading: "A password is not stored the way you type it",
      body: [
        "When you make an account, it feels like the website saves your password in a big list next to your name. If that were true, anyone who stole the list would instantly have every password. Good websites never do this.",
        "Instead they run your password through a one-way maths function called a hash. It turns any text into a fixed jumble of characters, and there is no reverse gear: you cannot turn the jumble back into the password.",
      ],
      examples: [
        "'apple' always turns into the same fixed jumble, but there is no button to turn that jumble back into 'apple'.",
        "It is like mincing meat: the steak goes through the grinder easily, but you can never un-grind the mince back into a steak.",
        "When you log in, the site does not compare your password to a saved password. It compares the jumble of what you typed to the jumble it saved.",
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
      examples: [
        "'password' and 'Password' (one capital letter) produce two completely unrelated fingerprints.",
        "There is no 'close enough': a fingerprint either matches exactly or it does not, which is why a single wrong character fails the login.",
        "This is also how a site can spot two files are identical without opening them: same contents, same fingerprint.",
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
        "A few reasons. Some sites still store passwords in a recoverable form. Others hash badly: a fast, outdated method with no random 'salt' added, so attackers can guess billions of candidates a second and crack the weak ones. And even when the storage is done right, as with the password manager you are about to meet, a stolen store is only as strong as the one password guarding it.",
        "You cannot control how a website stores your password. But you can control two things that beat every version of this: make each password long and unique, and turn on a second step (MFA) so a stolen password is not enough on its own.",
      ],
      examples: [
        "Stored in a recoverable form: a leak hands attackers every password instantly, no cracking needed.",
        "Hashed with a fast method and no salt: attackers guess billions per second and crack the weak ones anyway.",
        "A long passphrase like 'purple-tractor-window-jazz' would take centuries to crack; 'password123' falls in under a second.",
      ],
    },
  ],

  glossary: [
    { term: "hash", definition: "A one-way maths function that turns any text into a fixed jumble of characters. You can go text to jumble, but never jumble back to text." },
    { term: "hashing", definition: "Running data through a one-way function to get a fixed 'fingerprint'. Same input always gives the same fingerprint; you cannot reverse it." },
    { term: "salt", definition: "A random value added to a password before hashing, so two people with the same password get different fingerprints and pre-built cracking tables are useless." },
    { term: "MFA", definition: "Multi-factor authentication: a second step to log in (like a code on your phone), so a stolen password alone is not enough to get in." },
    { term: "avalanche effect", definition: "The way changing one character of the input changes the entire hash, with no resemblance to the original." },
    { term: "fingerprint", definition: "A plain-English word for a hash: a short, unique-looking value that stands in for the original data." },
  ],

  seeHeading: "When even a password manager was breached",

  cases: [
    {
      org: "LastPass",
      year: "2022",
      headline: "Attackers walked off with the encrypted password vaults themselves",
      whatHappened: "LastPass, a widely used password manager, was breached in 2022. Attackers first stole source code, then used credentials taken from a senior engineer's home computer to reach cloud backups and copy customers' password vaults. The vaults were encrypted, so the passwords inside were not instantly readable, but the attackers now held the files and could attack them offline, at their leisure.",
      theMissedMeasure: "Once a vault is stolen, its safety comes down to how it was protected. Vaults locked with a short or reused master password could be brute-forced offline, and some data stored alongside them, like the website addresses, was not encrypted at all.",
      theCost: "Millions of customers' encrypted vaults were taken, triggering a wave of 'change everything' advice, and later thefts where weakly-protected vaults were cracked to reach crypto wallets. The lesson: how your passwords are stored, and the strength of the one password guarding them, is everything.",
      control: "secure-configuration",
      impact: ["Millions of encrypted vaults stolen", "weak master passwords crackable offline", "stored web addresses left unencrypted"],
      source: "Public record; LastPass incident disclosures, 2022-2023.",
      brandColor: "#d32d27",
      news: { headline: "LastPass says hackers copied customer password vaults", outlet: "BBC News", date: "December 2022" },
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
      modelAnswer: "The password being strong does not help if any one of those sites stores or protects it badly and gets breached, the way even LastPass's vaults were stolen. Once that single password leaks, attackers try it on every other site the person uses, because reuse means one leak unlocks everything. Strong-but-reused still has a single point of failure; unique passwords plus MFA remove it.",
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
        q: "When attackers stole LastPass's encrypted vaults, what decided whether a customer's passwords were safe?",
        options: [
          "How often they changed their password",
          "The strength of their one master password",
          "Whether they used the mobile app",
          "How many passwords were in the vault",
        ],
        answer: 1,
        why: "The vaults were encrypted, so a strong master password kept them locked. Short or reused master passwords could be cracked offline once the files were stolen. How your store is protected, and by what, is everything.",
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
        why: "Unique-per-site means one breach cannot unlock your other accounts, and MFA means a stolen password alone is not enough to get in. Together they beat every version of the storage problem.",
      },
    ],
  },

  wrap: {
    headline: "You understand how passwords really work, and you have the fingerprints to prove it.",
    takeaways: [
      "Good sites store a one-way hash of your password, never the password itself.",
      "Hashing done badly (no salt, fast algorithm) is barely better than not hashing at all.",
      "You control the two measures that beat both mistakes: unique passwords and MFA.",
    ],
    project: {
      name: "Start your Personal Security Audit",
      blurb: "This week's portfolio piece begins now. Make a list of your five most important accounts (email, banking, main logins). You will secure them properly across the next four topics and record a before-and-after at the end.",
    },
    ethicsNote: "One rule from day one: everything you learn here is for defending and for systems you own or are authorised to test. In the UK, accessing an account or system without permission is a criminal offence under the Computer Misuse Act 1990.",
  },
};

export default topic1;

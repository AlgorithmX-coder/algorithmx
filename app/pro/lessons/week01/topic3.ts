import type { TopicManifest } from "../../learn/types";
import PasswordLab from "../../learn/PasswordLab";

/* Week 1 - Topic 3: building passwords worth trusting (length over
 * complexity, uniqueness, password managers). Case: Dropbox 2012 (real
 * public record: ~68M credentials, traced to an employee reusing a
 * password that had leaked in the LinkedIn breach). */
const topic3: TopicManifest = {
  id: "w1t3",
  weekLabel: "Module 3",
  act: "Act 1 - Foundations you can touch",
  title: "Building passwords worth trusting",
  role: "Advising people on real password hygiene is core to security awareness work, and the reuse problem is behind a huge share of real-world account takeovers.",
  minutes: 20,
  promise: "Learn the three habits that actually protect you (length over cleverness, one unique password per site, and a password manager), and see how reused passwords exposed 6.9 million people at 23andMe.",

  learn: [
    {
      heading: "Length beats complexity",
      body: [
        "For years we were told to use passwords like 'P@ssw0rd!'. But those tricks are exactly what cracking tools expect, and a short password is quick to guess no matter how many symbols you sprinkle in. What actually makes a password hard to guess is length.",
        "A passphrase of a few random words is both longer and easier to remember than a jumble of symbols. Each extra word multiplies the number of possibilities the attacker must try, pushing the crack time from seconds into centuries.",
      ],
      examples: [
        "'Tr0ub4dor&3' looks strong but is short and pattern-based, so it falls fast.",
        "'correct-horse-battery-staple' is longer, easier to remember, and far harder to guess.",
        "The rule of thumb: aim for length and unpredictability, not clever character-swaps.",
      ],
      analogy: {
        plain: "A short password with symbols is a fancy padlock on a garden gate: it looks tough, but the gate is low. A long passphrase just makes the wall too tall to climb.",
        realTerm: "a passphrase",
      },
    },
    {
      heading: "Reuse is the mistake that actually gets people hacked",
      body: [
        "Here is the uncomfortable truth: the single most dangerous thing you do with passwords is reuse one across sites. When any one of those sites is breached, attackers take the leaked email-and-password pairs and try them, automatically, against banks, email, and shops. This is called credential stuffing.",
        "Because so many people reuse, it works often enough to be worth doing at massive scale. A password that leaked from a forgotten forum in 2015 can unlock your email today if you used it in both places.",
      ],
      examples: [
        "Attackers take a leaked list and try each email-and-password pair against hundreds of other sites in minutes.",
        "You will never know which of the sites you use will be breached next, so reuse turns someone else's mistake into your problem.",
        "Your email is the crown jewel: whoever controls it can reset the password on everything else, so it must have its own unique password.",
      ],
      analogy: {
        plain: "Reusing one password is like having one key for your house, your car, your office and your safe. Lose it once, and the finder can open everything.",
        realTerm: "credential stuffing",
      },
    },
    {
      heading: "A password manager does the hard part for you",
      body: [
        "Nobody can remember a long, unique password for a hundred sites, and you should not try. A password manager generates a different strong password for every site and stores them all, locked behind one master password (or your fingerprint or face) that only you know.",
        "You go from memorising dozens of passwords to remembering one. It fills them in for you, and because each site has its own, a breach of one site can never unlock the others.",
      ],
      examples: [
        "You remember one strong master password; the manager remembers the other hundred, all long and all unique.",
        "It warns you when a site you use has appeared in a known breach, so you can change that one password fast.",
        "It also spots when you have reused a password, and offers to replace it with a unique one.",
      ],
    },
  ],

  glossary: [
    { term: "passphrase", definition: "A password made of several random words. Longer and easier to remember than a symbol jumble, and much harder to guess." },
    { term: "entropy", definition: "A measure of how unpredictable a password is. More length and randomness means more entropy, which means far more guesses to crack it." },
    { term: "credential stuffing", definition: "Taking email-and-password pairs leaked from one breach and trying them automatically against many other sites, which works because people reuse passwords." },
    { term: "reuse", definition: "Using the same password on more than one site. One breach then unlocks every account that shares it." },
    { term: "password manager", definition: "An app that generates and stores a unique strong password for every site, locked behind one master password you remember." },
  ],

  seeHeading: "What one reused password can cost",

  cases: [
    {
      org: "23andMe",
      year: "2023",
      headline: "Reused passwords unlocked 6.9 million people's DNA profiles",
      whatHappened: "In 2023, attackers broke into around 14,000 23andMe accounts by credential stuffing: trying email-and-password pairs leaked from other sites, betting people had reused them. It worked. But 23andMe links you to relatives through a shared-DNA feature, so from those 14,000 accounts the attackers scraped personal and ancestry data on roughly 6.9 million people, most of whom never had their own password stolen.",
      theMissedMeasure: "Users reused passwords that had already leaked elsewhere, and a second factor was not enforced, so a stolen-but-correct password was enough to walk in.",
      theCost: "Data on about 6.9 million people exposed, lawsuits, and a settlement; 23andMe later made MFA mandatory. It is the textbook modern example: reuse, not clever hacking, is how accounts really fall.",
      control: "access-control",
      impact: ["~14,000 accounts stuffed with leaked passwords", "~6.9 million people's data scraped", "no MFA enforced"],
      source: "Public record; 23andMe disclosures and 2023-2024 reporting.",
      brandColor: "#4c9a2a",
      news: { headline: "23andMe confirms hackers stole ancestry data on 6.9 million users", outlet: "TechCrunch", date: "December 2023" },
    },
  ],

  lab: {
    title: "Prove length wins",
    intro: "One more visit to the Password Lab, to prove the rule to yourself: length beats cleverness, every time.",
    prompts: [
      "Type your idea of a 'strong' password, symbols and all. Note the crack-time.",
      "Now type three or four random words joined with dashes. Compare the crack-time.",
      "Keep the words but make them genuinely random (not a famous phrase). See the estimate climb.",
    ],
    component: PasswordLab,
  },

  check: {
    explain: {
      prompt: "Your colleague says: 'My password is P@ssw0rd99, it has capitals, numbers and a symbol, so it's strong, and I use it everywhere because it's easy to remember.' Give them the two things wrong with that. Write a couple of sentences, then reveal a model answer.",
      modelAnswer: "First, it is short and pattern-based, exactly what cracking tools try first, so the symbols do not save it; length and unpredictability are what matter, so a long passphrase would be far stronger. Second, and worse, using it everywhere means the day any one of those sites is breached, attackers will stuff that email-and-password pair into every other site and get straight into the rest, including email and banking. The fix is a unique password per site, generated and stored by a password manager.",
    },
    quiz: [
      {
        q: "What makes a password genuinely hard to crack?",
        options: [
          "Adding symbols and numbers to a short word",
          "Length and unpredictability, such as a long passphrase",
          "Changing one letter to a number",
          "Using a word that means something to you",
        ],
        answer: 1,
        why: "Cracking tools expect the usual character-swaps. Length is what multiplies the possibilities beyond what any attacker can try, which is why a long random passphrase wins.",
      },
      {
        q: "Why is reusing one password across sites so dangerous?",
        options: [
          "It slows your computer down",
          "It makes the password easier to forget",
          "One breached site lets attackers unlock all the others (credential stuffing)",
          "It uses more storage",
        ],
        answer: 2,
        why: "Attackers take leaked email-and-password pairs and try them everywhere. Reuse turns one site's breach into a master key for your other accounts.",
      },
      {
        q: "What is the main job of a password manager?",
        options: [
          "To make one strong password you use everywhere",
          "To generate and store a unique strong password for every site",
          "To hide your passwords from the website",
          "To type your password faster",
        ],
        answer: 1,
        why: "A manager gives every site its own unique, strong password and remembers them all behind one master password, so a breach of one site can never unlock the others.",
      },
    ],
  },

  wrap: {
    headline: "You know the three habits that actually protect your accounts.",
    takeaways: [
      "Length beats complexity: a long passphrase outguns a short symbol-jumble.",
      "Reuse is the real killer: one breach then unlocks every account that shares the password.",
      "A password manager makes unique-per-site passwords effortless.",
    ],
    project: {
      name: "Audit step: move to a password manager",
      blurb: "Pick a reputable password manager and install it. Add your five key accounts, and let it generate a fresh, unique password for each one, starting with your email. This is the backbone of your audit.",
    },
    ethicsNote: "Everything here is about defending your own accounts. Trying leaked credentials against accounts that are not yours is credential stuffing, and a criminal offence under the Computer Misuse Act 1990.",
  },
};

export default topic3;

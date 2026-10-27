import type { TopicManifest } from "../../learn/types";
import PasswordLab from "../../learn/PasswordLab";

/* Week 1 - Topic 2: how a stolen hash file actually gets cracked, and
 * why salt and slow hashes matter. Case: Adobe 2013 (real public record:
 * ~150M accounts, passwords encrypted with a reversible cipher in ECB
 * mode with plaintext password hints, making them trivially recoverable). */
const topic2: TopicManifest = {
  id: "w1t2",
  weekLabel: "Module 3",
  act: "Act 1 - Foundations you can touch",
  title: "How attackers crack the stolen file",
  role: "Understanding cracking is the analyst's mindset: when a hash dump leaks, you need to know how fast the weak ones fall and which accounts to force-reset first.",
  minutes: 22,
  promise: "Watch how a leaked hash file is cracked (attackers guess, they never reverse it), and see the two defences that decide how many passwords fall: salt, and a deliberately slow hash.",

  learn: [
    {
      heading: "Cracking is guessing at enormous speed, not reversing",
      body: [
        "You already know a hash cannot be reversed. So how do stolen passwords get cracked? The attacker guesses. They take a candidate word, hash it, and check if the result matches a hash in the stolen file. If it does, they have found that password.",
        "The trick is speed. A cheap graphics card can try billions of guesses a second, and attackers start with wordlists of real leaked passwords, like the RockYou2024 list you are about to meet. Every common password falls almost instantly.",
      ],
      examples: [
        "The guess list starts with millions of real passwords from past breaches, so 'liverpool1' or 'letmein' are found in under a second.",
        "Then it tries variations: adding numbers, swapping a for @, capitalising the first letter, exactly the 'clever' tricks people think are safe.",
        "Only a genuinely long, random or unguessable password survives, because it never appears in any list and there are too many possibilities to try.",
      ],
      analogy: {
        plain: "It is like a burglar with a bump key ring holding every common key ever cut. They do not pick your lock; they just try keys they already have, incredibly fast, until one turns.",
        realTerm: "a dictionary or wordlist attack",
      },
    },
    {
      heading: "Salt: why two identical passwords should never look identical",
      body: [
        "If two people both use 'password1', an unsalted hash stores the exact same fingerprint for both. Attackers exploit that: they pre-compute the hashes of millions of common passwords once, then just look up matches. These pre-built tables are called rainbow tables.",
        "A salt is a random value added to each password before hashing. Now the two 'password1' users get completely different fingerprints, and every pre-computed table is useless, because the attacker would have had to build a table for every possible salt.",
      ],
      examples: [
        "Without salt: everyone who chose 'sunshine' shares one fingerprint, so cracking it once cracks all of them at the same time.",
        "With salt: each 'sunshine' looks different, so the attacker has to attack every account separately, which is vastly slower.",
        "This is exactly the step that separates a breach where only a few weak passwords fall from one where nearly all of them do.",
      ],
      analogy: {
        plain: "Salt is like adding a different random word to everyone's answer before locking it away. Even people who gave the same answer now have different-looking locks, so one master key can't open them all.",
        realTerm: "salting",
      },
    },
    {
      heading: "Fast hashes are for files. Slow hashes are for passwords",
      body: [
        "Not all hashes are equal. MD5 and SHA-1 were built to be fast, which is perfect for checking a file downloaded correctly, but terrible for passwords, because 'fast' means an attacker can make billions of guesses a second.",
        "Password-specific functions like bcrypt, scrypt and Argon2 are deliberately slow and can be tuned slower as computers get faster. If each guess takes a fraction of a second instead of a billionth, a full cracking run goes from minutes to lifetimes.",
      ],
      examples: [
        "A fast hash lets an attacker try the entire RockYou2024 list against a leaked file in no time.",
        "A slow hash like bcrypt can make that same run take years, so only the very weakest passwords are ever recovered.",
        "Good sites combine both defences: a unique salt per user and a slow, modern hash.",
      ],
    },
  ],

  glossary: [
    { term: "wordlist", definition: "A ready-made list of likely passwords (often real ones from past breaches) that an attacker hashes and checks against a stolen file. The RockYou2024 compilation is the biggest example." },
    { term: "salt", definition: "A random value added to each password before hashing, so identical passwords get different fingerprints and pre-built cracking tables stop working." },
    { term: "rainbow table", definition: "A giant pre-computed lookup of common passwords and their hashes. Salting defeats it, because every account's hash is now unique." },
    { term: "brute force", definition: "Trying huge numbers of guesses in a row, very fast, until one matches." },
    { term: "bcrypt", definition: "A password-hashing function designed to be deliberately slow (and adjustable), so cracking is far harder than with a fast hash like MD5 or SHA-1." },
    { term: "MD5", definition: "An old, very fast hash. Fine for checking a file downloaded correctly, but unsafe for passwords precisely because it is so fast to guess against." },
  ],

  seeHeading: "The biggest guess-list ever assembled",

  cases: [
    {
      org: "RockYou2024",
      year: "2024",
      headline: "Nearly 10 billion real passwords, stacked into one file",
      whatHappened: "In mid-2024 a file named rockyou2024.txt appeared on a hacking forum: a compilation of close to 10 billion unique passwords, gathered from thousands of past breaches over many years. It was not a new hack; it was every old leak, stacked together into the single largest password list ever assembled, and handed to every attacker on earth for free.",
      theMissedMeasure: "There is no one company to blame here, and that is the point. Every password that has ever leaked is now on the guess list, so anything that has appeared in any breach, or merely looks like a common choice, is tried first and falls instantly.",
      theCost: "It supercharges both credential stuffing and offline cracking: attackers run these billions of known passwords before anything else, so reused and common passwords are cracked in moments. It is the clearest proof that only a genuinely long, unique password survives.",
      control: "secure-configuration",
      impact: ["~10 billion passwords in one list", "compiled from thousands of past breaches", "free fuel for cracking and credential stuffing"],
      source: "Public record; 2024 disclosure of the rockyou2024.txt compilation.",
      brandColor: "#e0524a",
      news: { headline: "Nearly 10 billion passwords leaked in the largest compilation ever", outlet: "Cybernews", date: "July 2024" },
    },
  ],

  lab: {
    title: "Feel the difference length makes",
    intro: "Back in the Password Lab. This time, focus on the crack-time estimate: it is the difference between a password that falls in seconds and one that never falls.",
    prompts: [
      "Type a 'clever' password like 'P@ssw0rd1'. Read how fast it cracks, tricks and all.",
      "Now type four random words joined up, like 'otter-canyon-velvet-9'. Watch the estimate jump to years.",
      "Add one more word. See how each extra word multiplies the time, because there are simply more possibilities to guess.",
    ],
    component: PasswordLab,
  },

  check: {
    explain: {
      prompt: "In your own words, why does adding a random salt to each password make an attacker's job so much harder, even if the passwords themselves are weak? Write a sentence or two, then reveal a model answer.",
      modelAnswer: "Without salt, everyone who picked the same password has the same fingerprint, so an attacker can pre-compute common passwords once (a rainbow table) and crack all of them together. A unique salt per user makes every fingerprint different, so those pre-built tables are useless and the attacker has to attack each account separately. It does not make a weak password strong, but it removes the attacker's biggest shortcut and buys the defender enormous time, especially combined with a slow hash.",
    },
    quiz: [
      {
        q: "How does an attacker actually 'crack' a stolen hash?",
        options: [
          "They run the hash backwards to reveal the original password text",
          "They guess candidate passwords, hash each, and check for a match",
          "They trick the website into handing over its stored password file",
          "They decrypt the hash using a secret key held by the site",
          "They open the hash with a tool that reads out its contents",
        ],
        answer: 1,
        reasons: [
          "A hash has no reverse gear, so it cannot be run backwards into the password. That is the whole point of a one-way function.",
          "Right. Cracking is guessing at huge speed: hash a candidate, compare it to the stolen file, and repeat billions of times a second until something matches.",
          "That would be a fresh attack on the live site, not cracking the file already stolen. Cracking works offline on the hashes the attacker already holds.",
          "Hashing is not encryption, so there is no key to decrypt it with. The only way in is to guess inputs and hash them.",
          "A hash does not contain the password hidden inside it, so no tool can read it out. Attackers must guess the input that produces it.",
        ],
      },
      {
        q: "What does a unique salt per user prevent?",
        options: [
          "It stops the stored password database from being stolen",
          "It makes two identical passwords produce the same fingerprint",
          "It makes pre-computed tables, called rainbow tables, useless",
          "It slows down how long each single password guess takes",
          "It stops attackers from guessing any password at all",
        ],
        answer: 2,
        reasons: [
          "Salt does not stop the file being stolen; it assumes the file already is. What it changes is how useful that stolen file is to the attacker.",
          "That is the opposite of what salt does. A unique salt makes two identical passwords produce different fingerprints, which is the whole benefit.",
          "Right. A unique salt makes every hash different even for identical passwords, so attackers cannot pre-compute one table of common passwords and match everyone at once.",
          "Slowing each guess is the job of a slow hash like bcrypt, not of salt. Salt tackles pre-computed tables, not the speed of a single guess.",
          "Salt does not stop guessing; an attacker can still hash candidates against a salted account. It just removes their pre-computed shortcut, forcing them to attack each account separately.",
        ],
      },
      {
        q: "Why is bcrypt a better choice than MD5 for passwords?",
        options: [
          "It is faster, so logins and guessing both complete more quickly",
          "It is deliberately slow, so each guess takes far longer",
          "It produces a much longer hash that is harder to crack",
          "It does not need a salt added to stay secure",
          "It scrambles the password so it can never be guessed",
        ],
        answer: 1,
        reasons: [
          "For passwords, fast is exactly the problem: it lets an attacker try billions of guesses a second. bcrypt is valued for being slow, not fast.",
          "Right. Fast hashes let attackers guess billions of times a second, so bcrypt is intentionally slow and tunable, turning a minutes-long cracking run into a lifetimes-long one.",
          "A longer hash is not what helps here. Even a long fast hash falls quickly; it is bcrypt's deliberate slowness that does the work.",
          "bcrypt still uses a salt and benefits from one. Its advantage over MD5 is its slowness, not doing without salt.",
          "No hash makes a weak password unguessable; attackers can still try candidates. bcrypt simply makes each attempt so slow that far fewer passwords fall.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You know how the stolen file gets cracked, and the two defences that decide the outcome.",
    takeaways: [
      "Cracking is fast guessing against wordlists, not reversing the hash.",
      "A unique salt per user kills pre-computed rainbow tables.",
      "A slow, modern hash (bcrypt, scrypt, Argon2) turns a fast attack into an impractical one.",
    ],
    project: {
      name: "Audit step: find your weak and reused ones",
      blurb: "Open your list of five key accounts. Be honest about which passwords are short, guessable, or reused. Mark those as 'to replace'. In the next topics you will fix them properly.",
    },
    ethicsNote: "Cracking tools are legitimate for auditing systems you own or are authorised to test. Running them against anyone else's accounts is an offence under the Computer Misuse Act 1990.",
  },
};

export default topic2;

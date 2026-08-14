import type { TopicManifest } from "../../learn/types";
import PasswordLab from "../../learn/PasswordLab";

/* Week 1 - Topic 2: how a stolen hash file actually gets cracked, and
 * why salt and slow hashes matter. Case: Adobe 2013 (real public record:
 * ~150M accounts, passwords encrypted with a reversible cipher in ECB
 * mode with plaintext password hints, making them trivially recoverable). */
const topic2: TopicManifest = {
  id: "w1t2",
  weekLabel: "Week 1",
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
        "The trick is speed. A cheap graphics card can try billions of guesses a second, and attackers start with wordlists of real leaked passwords, like the rockyou.txt file from the last topic. Every common password falls almost instantly.",
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
        "This is exactly the step LinkedIn skipped in 2012, which is why so many of their hashes fell so fast.",
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
        "A fast hash lets an attacker try the entire rockyou.txt list against a leaked file in seconds.",
        "A slow hash like bcrypt can make that same run take years, so only the very weakest passwords are ever recovered.",
        "Good sites combine both defences: a unique salt per user and a slow, modern hash.",
      ],
    },
  ],

  glossary: [
    { term: "wordlist", definition: "A ready-made list of likely passwords (often real ones from past breaches) that an attacker hashes and checks against a stolen file. rockyou.txt is the classic example." },
    { term: "salt", definition: "A random value added to each password before hashing, so identical passwords get different fingerprints and pre-built cracking tables stop working." },
    { term: "rainbow table", definition: "A giant pre-computed lookup of common passwords and their hashes. Salting defeats it, because every account's hash is now unique." },
    { term: "brute force", definition: "Trying huge numbers of guesses in a row, very fast, until one matches." },
    { term: "bcrypt", definition: "A password-hashing function designed to be deliberately slow (and adjustable), so cracking is far harder than with a fast hash like MD5 or SHA-1." },
    { term: "MD5", definition: "An old, very fast hash. Fine for checking a file downloaded correctly, but unsafe for passwords precisely because it is so fast to guess against." },
  ],

  seeHeading: "When the file was barely protected at all",

  cases: [
    {
      org: "Adobe",
      year: "2013",
      headline: "150 million passwords, 'encrypted' in a way that unravelled",
      whatHappened: "Attackers stole a database of around 150 million Adobe accounts. Instead of salted, slow hashes, Adobe had encrypted the passwords with a reversible cipher, used in a mode where identical passwords produced identical output, and stored each user's password hint in plain text right next to it. Researchers used the repeated patterns and the hints to recover huge numbers of passwords.",
      theMissedMeasure: "Passwords were encrypted (reversible) rather than salted and hashed, in a mode that leaked which accounts shared a password, with plaintext hints handed to the attacker as clues.",
      theCost: "One of the most-studied password failures ever. The dataset became a teaching example of everything not to do, and the reused passwords fuelled account-takeover attempts across other sites for years.",
      control: "secure-configuration",
      source: "Public breach record; widely analysed 2013 disclosure of the ~150M-record dump.",
      brandColor: "#fa0f00",
      news: { headline: "Adobe hack: At least 38 million accounts breached", outlet: "BBC News", date: "October 2013", url: "https://www.bbc.co.uk/news/technology-24740873" },
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
          "They run the hash backwards to reveal the password",
          "They guess candidate passwords, hash each one, and look for a match",
          "They email the user asking for the password",
          "They decrypt it with the website's key",
        ],
        answer: 1,
        why: "Hashes cannot be reversed. Cracking is guessing at huge speed: hash a candidate, compare to the stolen file, repeat billions of times a second.",
      },
      {
        q: "What does a unique salt per user prevent?",
        options: [
          "It stops the database from being stolen",
          "It makes identical passwords share one fingerprint",
          "It makes pre-computed tables (rainbow tables) useless",
          "It encrypts the whole hard drive",
        ],
        answer: 2,
        why: "Salt makes every hash unique even for identical passwords, so attackers cannot pre-compute one table of common passwords and match everyone at once.",
      },
      {
        q: "Why is bcrypt a better choice than MD5 for passwords?",
        options: [
          "It is faster, so logins are quicker",
          "It is deliberately slow, so guessing is far harder",
          "It cannot be stolen",
          "It does not need a salt",
        ],
        answer: 1,
        why: "Fast hashes let attackers try billions of guesses a second. bcrypt is intentionally slow and tunable, turning a minutes-long cracking run into a lifetimes-long one.",
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

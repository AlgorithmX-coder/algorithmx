/**
 * Block 3 · Case 011 "The Master Key", SKELETON KEY ②, for THE CONSOLE runtime.
 *
 * Block 3 = SYSTEMS. You don't read a message (Block 1) or get targeted (Block 2)
 *, you OPERATE the machine. The Console is an amber control panel: switches you
 * flip, parts you assemble, gauges that fill. Same framework (7 skills LEARN ->
 * PRACTICE, blind boss, must-pass test), a genuinely different game.
 *
 * Case 11 = BUILD debut: your brain can't do unique-x-strong-x-forty-accounts, so
 * you BUILD a vault (a password manager) with one strong master passphrase, and
 * flip on the second lock (2FA). Boss "Locksmith's Nightmare": SKELETON KEY's
 * cracking rig returns and bounces off. Curriculum row M11.
 */

/* ---- shared Console types (Block 3 cases import from here) ---- */
export type ConsoleStep =
  | { t: "wren"; text: string; voice?: string }
  | { t: "sys"; text: string } // a system readout line on the console
  | {
      t: "choose";
      prompt?: string;
      options: { label: string; sub?: string; outcome?: "good" | "bad"; then?: ConsoleStep[] }[];
    }
  | {
      // flip a panel of switches to their wanted state, then submit
      t: "toggle";
      prompt?: string;
      switches: { label: string; sub?: string; want: boolean }[];
      ok?: string;
      okVoice?: string;
      bad?: string; // shown if submitted wrong
      badVoice?: string;
    }
  | {
      // pick exactly the `need` good parts (e.g. build a strong passphrase), then submit
      t: "build";
      prompt?: string;
      parts: { label: string; good: boolean; sub?: string }[];
      need: number;
      ok?: string;
      okVoice?: string;
      bad?: string;
      badVoice?: string;
    };

export interface ConsoleSkill {
  n: number;
  title: string;
  goal: string;
  panel?: string; // the system/app being operated, shown in the console header
  learn: ConsoleStep[];
  practice: ConsoleStep[];
}
export interface ConsoleBossPhase { name: string; steps: ConsoleStep[] }
export interface ConsoleBoss {
  panel: string;
  intro: string;
  introVoice?: string;
  phases: ConsoleBossPhase[];
  win: string;
  winVoice?: string;
}
export interface ConsoleTestQ {
  scenario: string;
  ask: string;
  options: { label: string; correct?: boolean }[];
}
export interface ConsoleTest {
  intro: string;
  introVoice?: string;
  passVoice?: string;
  failVoice?: string;
  pass: number;
  questions: ConsoleTestQ[];
}
export interface ConsoleCase {
  id: string;
  caseNumber: string;
  title: string;
  actor: string;
  /** per-case console tint within the amber Systems block (a little variety). */
  accent?: string;
  open: string[];
  openVoice?: string[];
  skills: ConsoleSkill[];
  boss: ConsoleBoss;
  test: ConsoleTest;
  debrief: { title: string; lines: string[]; move: string };
}

export const case11Console: ConsoleCase = {
  id: "explorers-m11",
  caseNumber: "CASE 011",
  title: "The Master Key",
  actor: "SKELETON KEY",
  accent: "#FFB23E",
  open: [
    "New clearance, Agent, and a whole new job. No more reading messages, no more dodging DMs. Now you're at the controls of the machine itself.",
    "SKELETON KEY is back, the one whose rig guesses passwords. Last time you just watched it. This time, you're going to BUILD the defences that stop it dead.",
    "Seven skills to lock every door you own, then a boss and a test. Hands on the console, Agent. Let's build.",
  ],
  openVoice: [
    "/audio/wren/m11c-open-1.mp3",
    "/audio/wren/m11c-open-2.mp3",
    "/audio/wren/m11c-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · Why your brain can't do this ============ */
    {
      n: 1,
      title: "Why your brain can't do this",
      goal: "Unique + strong + forty accounts is impossible for a human. It's a tool's job.",
      panel: "ACCOUNT AUDIT",
      learn: [
        { t: "wren", text: "Start with the honest truth. To be safe, every account needs its own long, random password. Not one clever password everywhere, a DIFFERENT strong one for each. And you've got dozens of accounts. Nobody, no human alive, can invent and remember forty random passwords. So we stop trying. This is a job for a tool, and I'll show you how to build one.", voice: "/audio/wren/m11c-s1-learn.mp3" },
        { t: "sys", text: "ACCOUNTS DETECTED: 41   ·   UNIQUE STRONG PASSWORDS A HUMAN CAN REMEMBER: ~2" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "So what's the RIGHT way to have a strong, unique password on all 41 accounts?",
          options: [
            { label: "Use a tool that makes and remembers them for you", sub: "a password manager", outcome: "good", then: [{ t: "wren", text: "Exactly. A password manager invents a long random password for every account and remembers all of them, so you don't have to. Your brain's job shrinks to remembering just ONE. That's the whole trick, and it's what we build next.", voice: "/audio/wren/m11c-s1-ok.mp3" }] },
            { label: "Think of one really clever password and use it everywhere", sub: "", outcome: "bad", then: [{ t: "wren", text: "One password everywhere is the master key SKELETON KEY dreams of, crack it once, open everything. Unique per account is the rule, and no human can do that alone. Try again.", voice: "/audio/wren/m11c-s1-bad.mp3" }] },
            { label: "Write all 41 on a note in your bag", sub: "", outcome: "bad", then: [{ t: "wren", text: "A list anyone could find or lose isn't a vault. We want them generated and locked, not scribbled on paper. Try again.", voice: "/audio/wren/m11c-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "Tap the TWO honest reasons no human can keep 41 unique passwords in their head:",
          need: 2,
          parts: [
            { label: "Forty-one is far too many to memorise", good: true, sub: "" },
            { label: "Truly random passwords have no pattern to recall", good: true, sub: "" },
            { label: "Your memory never fails", good: false, sub: "everyone forgets" },
            { label: "You really only have one account", good: false, sub: "you have dozens" },
          ],
          ok: "Right. Too many, and no pattern to lean on. That is exactly why we hand the job to a tool.",
          okVoice: "/audio/wren/m11c-s1-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "Sort the jobs. Flip ON the ones the TOOL should handle for you:",
          switches: [
            { label: "Invent a random password for each site", sub: "", want: true },
            { label: "Remember all 41 passwords", sub: "", want: true },
            { label: "Remember your single master key", sub: "that stays in your head", want: false },
          ],
          ok: "Exactly. The tool invents and remembers the 41. Your brain only keeps the one master key.",
          okVoice: "/audio/wren/m11c-s1-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 2 · Build the master passphrase ============ */
    {
      n: 2,
      title: "Build the master passphrase",
      goal: "The vault needs one key you never forget and no rig can guess: a long passphrase.",
      panel: "VAULT SETUP",
      learn: [
        { t: "wren", text: "A password manager locks all your passwords behind ONE master key, so that key has to be brilliant. Not short and clever, LONG and random. The strongest trick is a passphrase: several random, unrelated words strung together. Long enough that a guessing rig would take centuries, simple enough that you'll never forget it. Let's build one.", voice: "/audio/wren/m11c-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "Build a strong master passphrase. Tap the FOUR parts that make it strong:",
          need: 4,
          parts: [
            { label: "copper", good: true, sub: "random word" },
            { label: "otter", good: true, sub: "random word" },
            { label: "lantern", good: true, sub: "random word" },
            { label: "galaxy", good: true, sub: "random word" },
            { label: "your birthday", good: false, sub: "everyone can find it" },
            { label: "password123", good: false, sub: "cracked instantly" },
            { label: "your pet's name", good: false, sub: "it's on your profile" },
          ],
          ok: "Now THAT is a master key. Four random words a rig would take centuries to guess, but you'll picture a copper otter with a lantern in a galaxy and never forget it. Long and random beats short and clever, every time.",
          okVoice: "/audio/wren/m11c-s2-ok.mp3",
          bad: "Careful. Anything a rig can guess or a stranger can look up, like your birthday, a pet, or 'password123', weakens the whole vault. Pick only the long, random, unguessable parts.",
          badVoice: "/audio/wren/m11c-s2-bad.mp3",
        },
        {
          t: "choose",
          prompt: "Three people set a master passphrase. Whose is strongest?",
          options: [
            { label: "river-cactus-velvet-thunder", sub: "four random, unrelated words", outcome: "good", then: [{ t: "wren", text: "Yes. Four random words a rig would take centuries to crack, and a picture you will never forget.", voice: "/audio/wren/m11c-s2-q2ok.mp3" }] },
            { label: "Fluffy2011", sub: "pet name and birth year", outcome: "bad", then: [{ t: "wren", text: "A pet and a year are both easy to look up or guess. The master key has to be long and random. Try again.", voice: "/audio/wren/m11c-s2-q2bad.mp3" }] },
            { label: "qwerty", sub: "short and common", outcome: "bad", then: [{ t: "wren", text: "Short and common is the first thing any rig tries. Reach for several random words instead. Try again.", voice: "/audio/wren/m11c-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Flip ON every trait a strong master passphrase needs:",
          switches: [
            { label: "Made of several random, unrelated words", sub: "", want: true },
            { label: "Long enough to take centuries to guess", sub: "", want: true },
            { label: "Built from your name or birthday", sub: "easy to look up", want: false },
          ],
          ok: "That is the recipe. Long and random, never personal. Personal facts are the first thing a rig checks.",
          okVoice: "/audio/wren/m11c-s2-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 3 · Let the vault do the rest ============ */
    {
      n: 3,
      title: "Let the vault do the rest",
      goal: "With the master key set, the manager generates a unique password for every account.",
      panel: "VAULT · GENERATE",
      learn: [
        { t: "wren", text: "Master key set. Now the magic. From here, every time you make an account, the manager generates a brand-new random password, stores it, and fills it in for you. You never see it, never type it, never reuse it. Forty-one unique fortress passwords, and you only ever remember the one master. Watch it fill the vault.", voice: "/audio/wren/m11c-s3-learn.mp3" },
        { t: "sys", text: "GENERATING… bank ✓  email ✓  game ✓  school ✓  … 41/41 UNIQUE PASSWORDS STORED" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A new account asks you to set a password. What do you do now?",
          options: [
            { label: "Let the manager generate and store a random one", outcome: "good", then: [{ t: "wren", text: "Perfect. That's the whole point of the vault, you never invent a password again. It makes one no human could guess, and remembers it so you don't have to.", voice: "/audio/wren/m11c-s3-ok.mp3" }] },
            { label: "Reuse your master passphrase for this one too", outcome: "bad", then: [{ t: "wren", text: "Never reuse the master, it's the one key to everything. Let the manager make a fresh, unique password instead. Try again.", voice: "/audio/wren/m11c-s3-bad.mp3" }] },
            { label: "Make up a new one in your head", outcome: "bad", then: [{ t: "wren", text: "That's back to the impossible human job. The manager exists so you never have to invent one again. Let it. Try again.", voice: "/audio/wren/m11c-s3-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Which jobs does the vault handle now? Flip ON the ones it does for you:",
          switches: [
            { label: "Generate a new random password", sub: "", want: true },
            { label: "Store it safely", sub: "", want: true },
            { label: "Fill it in when you log in", sub: "", want: true },
            { label: "Make you memorise each one", sub: "that job is gone", want: false },
          ],
          ok: "Right. Generate, store, fill. Three jobs off your plate, so you never type or reuse a password again.",
          okVoice: "/audio/wren/m11c-s3-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "The vault offers to make the password for a new account. Tap the TWO smart reasons to let it:",
          need: 2,
          parts: [
            { label: "It makes one no human could guess", good: true, sub: "" },
            { label: "It stores and remembers it for you", good: true, sub: "" },
            { label: "So you can reuse your master key", good: false, sub: "never reuse the master" },
            { label: "So you can memorise it yourself", good: false, sub: "that is the old, impossible job" },
          ],
          ok: "Exactly. It builds an unguessable one and remembers it, so your brain stays free for the master key alone.",
          okVoice: "/audio/wren/m11c-s3-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 4 · The second lock ============ */
    {
      n: 4,
      title: "The second lock (2FA)",
      goal: "A second key means even a stolen password isn't enough. Turn it on.",
      panel: "SECURITY · TWO-FACTOR",
      learn: [
        { t: "wren", text: "Even a perfect password can be phished or leaked. So we add a SECOND lock, two-factor, or 2FA. It's a second key, usually a code on your phone, needed on top of the password. Now a thief with your password still can't get in, because they don't have your phone. It's the single strongest switch you can flip. So flip it, on the accounts that matter most.", voice: "/audio/wren/m11c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "toggle",
          prompt: "Turn the second lock ON for your important accounts:",
          switches: [
            { label: "Bank", sub: "money", want: true },
            { label: "Email", sub: "resets every other account", want: true },
            { label: "Main game account", sub: "years of progress", want: true },
          ],
          ok: "Locked down. Especially email, because whoever controls your email can reset every other password you own. With 2FA on, a stolen password is just half a key. It won't open the door.",
          okVoice: "/audio/wren/m11c-s4-ok.mp3",
          bad: "Not quite. Turn the second lock ON for all three, these are the accounts a thief wants most. Email especially: it's the master key to everything else.",
          badVoice: "/audio/wren/m11c-s4-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A thief buys your real password in a leak, but the account has 2FA on. What happens when they try to log in?",
          options: [
            { label: "They're stopped, they don't have the code on your phone", outcome: "good", then: [{ t: "wren", text: "Exactly. The password is only half a key now. Without the code on your phone, the door stays shut.", voice: "/audio/wren/m11c-s4-q2ok.mp3" }] },
            { label: "They walk straight in, the password is enough", outcome: "bad", then: [{ t: "wren", text: "Not with 2FA on. The password alone is only half the key, they still need the code on your phone. Try again.", voice: "/audio/wren/m11c-s4-q2bad.mp3" }] },
            { label: "The account deletes itself for safety", outcome: "bad", then: [{ t: "wren", text: "Nothing so dramatic. 2FA simply blocks the login until the second key is entered. Try again.", voice: "/audio/wren/m11c-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "With 2FA on, tap the TWO things you need to log in:",
          need: 2,
          parts: [
            { label: "Your password", good: true, sub: "something you know" },
            { label: "The code on your phone", good: true, sub: "something you have" },
            { label: "Just your username", good: false, sub: "that is public" },
            { label: "Only your birthday", good: false, sub: "easy to look up" },
          ],
          ok: "Right. Two keys now: something you know and something you have. A thief needs both, and they only ever get one.",
          okVoice: "/audio/wren/m11c-s4-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 5 · A code is a key ============ */
    {
      n: 5,
      title: "A code is a key",
      goal: "Your 2FA code IS a key. Nobody legitimate ever asks you to hand it over.",
      panel: "SECURITY · CODES",
      learn: [
        { t: "wren", text: "One warning that comes with 2FA. That code on your phone is a KEY, the second key to your account. And you know the rule about keys from last block: nobody real ever asks you for one. Not the bank, not support, not a friend. A code only ever goes in the login box yourself, never read out to a person. If anyone asks for your code, they're a thief, every single time.", voice: "/audio/wren/m11c-s5-learn.mp3" },
      ],
      practice: [
        { t: "sys", text: "INCOMING: \"Hi, this is Account Security. To verify you, read us back the code we just texted.\"" },
        {
          t: "choose",
          prompt: "What do you do?",
          options: [
            { label: "Never share it, real security never asks for your code", outcome: "good", then: [{ t: "wren", text: "Exactly. Real security already knows it, they don't need you to read it back. Anyone asking for your code is trying to be the second key. You never hand it over.", voice: "/audio/wren/m11c-s5-ok.mp3" }] },
            { label: "Read it back so they can help", outcome: "bad", then: [{ t: "wren", text: "That code is the only thing standing between a thief and your account. Read it out and you've handed them the second key. Never share it. Try again.", voice: "/audio/wren/m11c-s5-bad.mp3" }] },
            { label: "Ask them to text a fresh code first", outcome: "bad", then: [{ t: "wren", text: "Any code you read to a person unlocks your account for them. Don't negotiate, just refuse. Real security never asks. Try again.", voice: "/audio/wren/m11c-s5-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Flip ON the ONLY place your 2FA code should ever go:",
          switches: [
            { label: "Typed into the real login box by you", sub: "", want: true },
            { label: "Read out to a caller from 'support'", sub: "", want: false },
            { label: "Sent in a chat to a friend who asks", sub: "", want: false },
          ],
          ok: "Right. The code only ever goes in the login box, and only you put it there. Anyone asking you to hand it over is a thief.",
          okVoice: "/audio/wren/m11c-s5-q2ok.mp3",
        },
        { t: "sys", text: "INCOMING DM: \"Quick, read me the code you just got so I can prove it's you and fix your account.\"" },
        {
          t: "build",
          prompt: "Tap the TWO things you know are true here:",
          need: 2,
          parts: [
            { label: "Real security already has the code, so they never ask", good: true, sub: "" },
            { label: "Reading it out hands over the second key", good: true, sub: "" },
            { label: "Support needs you to read it back", good: false, sub: "they never do" },
            { label: "Sharing the code keeps you safe", good: false, sub: "it does the opposite" },
          ],
          ok: "Exactly. They already know it, so anyone who asks is after your second key. You never read it out.",
          okVoice: "/audio/wren/m11c-s5-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 6 · Know SKELETON KEY's play ============ */
    {
      n: 6,
      title: "Know SKELETON KEY's play",
      goal: "The credential attack runs the same four moves, and your vault beats every one.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See SKELETON KEY's whole play, four moves. First, guess or steal one password. Second, try that same password on all your other accounts, hoping you reused it. Third, if it works, walk straight in. Fourth, use your email to reset everything else. Now look how your vault breaks it: unique passwords kill the reuse, and 2FA kills the walk-in. You've beaten every move before it starts.", voice: "/audio/wren/m11c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "SKELETON KEY steals one of your passwords. Why does the attack STOP there now?",
          options: [
            { label: "It's unique, so it opens nothing else, and 2FA blocks even that account", outcome: "good", then: [{ t: "wren", text: "That's the whole defence in one line. A unique password means a stolen one opens exactly one door, and 2FA means it can't even open that. The rig runs out of moves. That's what building defences that HOLD looks like.", voice: "/audio/wren/m11c-s6-ok.mp3" }] },
            { label: "Because you'll notice and change it in time", outcome: "bad", then: [{ t: "wren", text: "Don't rely on being fast, rely on the locks. The real reason it stops: unique passwords plus 2FA. Try again.", voice: "/audio/wren/m11c-s6-bad.mp3" }] },
            { label: "Because SKELETON KEY gives up easily", outcome: "bad", then: [{ t: "wren", text: "A rig never gives up, it just fails. What makes it fail is your unique passwords and 2FA. Try again.", voice: "/audio/wren/m11c-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "SKELETON KEY runs its play. Flip ON the two defences that stop it dead:",
          switches: [
            { label: "Give every account its own unique password", sub: "kills the reuse move", want: true },
            { label: "Switch on 2FA", sub: "kills the walk-in", want: true },
            { label: "Reuse one password to keep it simple", sub: "", want: false },
          ],
          ok: "Right. Unique passwords kill the reuse trick, and 2FA blocks the walk-in. Two switches beat all four of its moves.",
          okVoice: "/audio/wren/m11c-s6-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "The rig steals ONE of your passwords. Tap the TWO reasons the attack stops right there:",
          need: 2,
          parts: [
            { label: "It's unique, so it opens nothing else", good: true, sub: "" },
            { label: "2FA blocks even that one account", good: true, sub: "" },
            { label: "You reused it everywhere", good: false, sub: "that would help the rig" },
            { label: "SKELETON KEY gives up easily", good: false, sub: "a rig never does" },
          ],
          ok: "That's it. Unique means one stolen key opens one door, and 2FA means it can't even open that.",
          okVoice: "/audio/wren/m11c-s6-q3ok.mp3",
        },
      ],
    },

    /* ============ SKILL 7 · Turn it on today ============ */
    {
      n: 7,
      title: "Turn it on today",
      goal: "Knowing isn't enough. The one action that protects you most, done for real.",
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, and it's a real-world one. None of this protects you until you actually switch it on. So here's your mission outside these walls: turn on 2FA on your most important account, your email, this week, with a parent or carer to help. Then, over time, let a password manager take over the rest. Knowing is good. Flipping the switch is what keeps you safe.", voice: "/audio/wren/m11c-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "If you only do ONE thing this week, which protects you most?",
          options: [
            { label: "Turn on 2FA for your email, with an adult", outcome: "good", then: [{ t: "wren", text: "The single best move you can make. Email resets everything else, so locking it with a second key protects your whole digital life. Do that one thing, and you're already ahead of most adults.", voice: "/audio/wren/m11c-s7-ok.mp3" }] },
            { label: "Change your game password to something longer", outcome: "bad", then: [{ t: "wren", text: "Not bad, but the biggest win is 2FA on your EMAIL, because it can reset every other account. Start there. Try again.", voice: "/audio/wren/m11c-s7-bad.mp3" }] },
            { label: "Nothing, you understand it now, that's enough", outcome: "bad", then: [{ t: "wren", text: "Understanding a lock doesn't lock the door. The protection only starts when you flip the switch. Pick the real action. Try again.", voice: "/audio/wren/m11c-s7-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "Tap the TWO real actions to take THIS week:",
          need: 2,
          parts: [
            { label: "Turn on 2FA for your email, with an adult", good: true, sub: "" },
            { label: "Start a password manager for the rest", good: true, sub: "" },
            { label: "Decide that knowing is enough", good: false, sub: "knowing locks nothing" },
            { label: "Keep reusing one password", good: false, sub: "the opposite of safe" },
          ],
          ok: "Perfect. 2FA on your email first, then let a manager take over. Real switches, flipped for real.",
          okVoice: "/audio/wren/m11c-s7-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "You can protect ONE account first. Flip ON the one that protects you most:",
          switches: [
            { label: "Your email", sub: "it can reset every other account", want: true },
            { label: "An old forum you never use", sub: "", want: false },
            { label: "A random quiz site", sub: "", want: false },
          ],
          ok: "Right. Email first, always. Whoever holds your email can reset every other account you own.",
          okVoice: "/audio/wren/m11c-s7-q3ok.mp3",
        },
      ],
    },
  ],

  /* ================= BOSS · "Locksmith's Nightmare" (blind, no coaching) ================= */
  boss: {
    panel: "LIVE ATTACK · SKELETON KEY",
    intro: "This is it, Agent. SKELETON KEY has dusted off the cracking rig from your last case and pointed it straight at your accounts. No hints from me. You've built the defences, now watch them work, and tell me exactly why the rig fails.",
    introVoice: "/audio/wren/m11c-boss-intro.mp3",
    phases: [
      {
        name: "The rig attacks",
        steps: [
          { t: "sys", text: "SKELETON KEY: loading 10,000,000 common passwords…" },
          { t: "sys", text: "TARGET: your game account   ATTEMPTS: 4,812,006   RESULT: ✗ LOCKED (unique password, not in any list)" },
          {
            t: "choose",
            prompt: "The rig just threw millions of guesses at your game account and failed. Why?",
            options: [
              { label: "Your password is long, random and unique, it's in no guess-list", outcome: "good" },
              { label: "The rig wasn't trying hard enough", outcome: "bad", then: [{ t: "sys", text: "SKELETON KEY: escalating… still ✗" }] },
              { label: "You got lucky this time", outcome: "bad", then: [{ t: "sys", text: "SKELETON KEY: retrying… still ✗" }] },
            ],
          },
        ],
      },
      {
        name: "The stolen password",
        steps: [
          { t: "sys", text: "SKELETON KEY: bought your OLD forum password from a leak. Trying it everywhere…" },
          { t: "sys", text: "TRYING leaked password on: email ✗  bank ✗  game ✗   (none match)" },
          {
            t: "choose",
            prompt: "It has a real password of yours from an old leak, and it opens nothing. Why?",
            options: [
              { label: "Every account has its OWN password, reuse is dead", outcome: "good" },
              { label: "The leak must have been fake", outcome: "bad", then: [{ t: "sys", text: "SKELETON KEY: leak verified real… still no matches" }] },
              { label: "The other sites are down", outcome: "bad", then: [{ t: "sys", text: "SKELETON KEY: sites online… still no matches" }] },
            ],
          },
        ],
      },
      {
        name: "The last door",
        steps: [
          { t: "sys", text: "SKELETON KEY: somehow got your email password. Attempting login…" },
          { t: "sys", text: "LOGIN BLOCKED · SECOND KEY REQUIRED · code sent to your phone only" },
          {
            t: "choose",
            prompt: "It has your actual email password. Why is it STILL locked out?",
            options: [
              { label: "2FA, it doesn't have the second key on your phone", outcome: "good" },
              { label: "It just needs to guess the code too", outcome: "bad", then: [{ t: "sys", text: "SKELETON KEY: 6-digit code, 1,000,000 options, 3 tries… LOCKED OUT" }] },
              { label: "The password must be wrong", outcome: "bad", then: [{ t: "sys", text: "PASSWORD ACCEPTED · but SECOND KEY still required · ✗" }] },
            ],
          },
        ],
      },
    ],
    win: "Watch that, Agent. Millions of guesses, a real leaked password, even your email password, and the rig walked away with NOTHING. Unique passwords killed the reuse, and 2FA killed the last door. You didn't dodge SKELETON KEY this time. You built a wall it couldn't climb, and made it bounce off. That's what defences that hold look like.",
    winVoice: "/audio/wren/m11c-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I sign off your build, the test. Six fresh ones, no hints, and you need five right. Everything you just built, put it to work. Ready?",
    introVoice: "/audio/wren/m11c-test-intro.mp3",
    passVoice: "/audio/wren/m11c-test-pass.mp3",
    failVoice: "/audio/wren/m11c-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "You have 40-odd accounts and want a strong, unique password on each.",
        ask: "What's the realistic way?",
        options: [
          { label: "Use a password manager to generate and store them", correct: true },
          { label: "Invent one clever password and use it everywhere" },
          { label: "Memorise all forty" },
        ],
      },
      {
        scenario: "You need one master passphrase for your vault.",
        ask: "Which is strongest?",
        options: [
          { label: "Four random unrelated words, like copper-otter-lantern-galaxy", correct: true },
          { label: "Your birthday and your pet's name" },
          { label: "Password123!" },
        ],
      },
      {
        scenario: "Someone gets hold of one of your passwords.",
        ask: "Why does the damage stop at one account?",
        options: [
          { label: "Because every account has its own unique password", correct: true },
          { label: "Because you'd notice quickly" },
          { label: "Because passwords can't really be stolen" },
        ],
      },
      {
        scenario: "You can only add a second lock (2FA) to one account first.",
        ask: "Which matters most?",
        options: [
          { label: "Your email, it can reset every other account", correct: true },
          { label: "An old forum you never use" },
          { label: "It doesn't matter which" },
        ],
      },
      {
        scenario: "\"This is Account Security, read us back the code we texted you.\"",
        ask: "What do you do?",
        options: [
          { label: "Never share it, real security never asks for your code", correct: true },
          { label: "Read it back so they can help" },
          { label: "Ask for a fresh code first" },
        ],
      },
      {
        scenario: "A thief has your real password but hits a 2FA prompt.",
        ask: "Why can't they get in?",
        options: [
          { label: "They don't have the second key on your phone", correct: true },
          { label: "They'll just guess the code" },
          { label: "The password must be wrong" },
        ],
      },
    ],
  },

  debrief: {
    title: "The vault holds.",
    lines: [
      "Seven skills, a live cracking rig, and a test, and SKELETON KEY walked away with nothing.",
      "You built a vault with one strong master passphrase, let it generate a unique password for every account, and flipped on the second lock.",
      "You watched millions of guesses, a leaked password, even a stolen email password, all bounce off the wall you built.",
    ],
    move:
      "This week, do the one thing that protects you most: turn on 2FA for your email, with a parent or carer. Then start letting a password manager take over the rest. A lock you understand only protects you once you actually switch it on.",
  },
};

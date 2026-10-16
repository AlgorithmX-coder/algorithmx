import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 1 - Passwords: The Secret Code.
 *
 * Re-cut to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md):
 *
 *   Opening video  -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck):
 *     1 KEY     a password is a secret key   | MATCH  | finish
 *     2 LONG    long is strong (3 words)      | BUILD  | speed
 *     3 MIX     letters+numbers+symbols       | REPAIR | lie
 *     4 SECRET  never share it                | DECIDE | recall
 *     5 OBVIOUS not name/birthday/123456       | SORT   | recall
 *   Consolidation (cyberScanner) -> 5-phase boss -> closing video -> reward.
 *
 * The 5 games are 5 DISTINCT mechanic patterns (never repeat in one sitting).
 * Out-of-scope topics (phishing, pop-ups, spam, account-rescue, uniqueness)
 * have moved to their home weeks (W4 / later). Curve rule: every concept is
 * TAUGHT before it is TESTED.
 */
export const WEEK_1: WeekContent = {
  weekNumber: 1,
  title: "Passwords: The Secret Code",
  topic: "passwords",
  badgeName: "Password Protector",
  badgeIcon: "🔐",

  // The opening "video" carries the cold-open hook, so the cutscene is just a
  // short title lead-in (no redundant re-telling of the Break-In).
  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 1: PASSWORDS", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: "The Break-In" (Raccoon cracks a weak password)
    { type: "video", videoPlaceholder: "Week 1: The Break-In", videoSrc: "/videos/module-01-intro.mp4" },

    // 1 - ALERT: incident report with this week's topic image (comes FIRST now,
    // so the incident lands before Mission Command briefs the plan - owner 2026-09-10)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-01.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Hacker Raccoon is hunting for Adam and Layla's passwords. They need YOUR help!",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "Cyber Hero, come and look at this.",
          "The Hacker Raccoon is trying to steal Adam and Layla's passwords.",
          "If he cracks even one, he gets into all their games and all their messages.",
          "[warmly] By the end of this week you will know how to build a password he can NEVER break.",
          "Mission Command has the details. Let's go.",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, now AFTER the alert
    { type: "weekIntro", ...WEEK_INTROS[1] },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Find out what a password really is",
        "Build a password the Raccoon can't crack",
        "Beat the Raccoon and lock him out for good",
      ],
    },

    // (Signature "Tumbler Dials" removed 2026-09-10: it sat before any teaching
    // and asked kids to build a strong password they hadn't learned to build.
    // Week 1 now opens straight into Concept 1's teaching, teach-first.)

    /* ─────────── BEAT 1 · KEY ─────────── */
    // 3 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "What Is a Password?",
      content:
        "A password is a secret code that only YOU know. It's like a key - it proves to the computer that it's really you. A weak key snaps. A strong key keeps the Raccoon out.",
      bullets: [
        "A password proves it's YOU",
        "Like a key, it locks up your stuff",
        "A strong key keeps hackers out",
        "Only you should ever have it",
      ],
      bulletIcons: ["🆔", "🔑", "🛡️", "🤫"],
      emblem: "🔒",
      narration: {
        speaker: "adam",
        lines: [
          "Let's start with the big question. What IS a password?",
          "Your password is like a key, and it belongs to nobody but you.",
          "When you type it in, the computer knows the real you has arrived.",
          "A weak key lets the Raccoon walk straight in.",
          "[warmly] A strong one keeps him outside, every single time.",
          "Before we build one, we need the words that heroes use.",
          "Let's play Cyber Word Match, and learn them.",
        ],
      },
    },
    // 4 - Game: MATCH (Cyber Words)
    {
      type: "memoryMatch",
      threat: {
        raccoonLine:
          "Heh heh! Most kids don't even know what a password really IS. They think a hiding spot keeps them safe. That's how I sneak right in!",
      },
      introTitle: "Cyber Word Match",
      introSubtitle: "Match each cyber word to what it means. Remember where the cards are!",
      // Four DISTINCT cyber words, each with a meaning that fits exactly one
      // of them (unique keyword in every clue: unlocks / guesses / crack /
      // tell). The earlier set overlapped for a 6-9yo - "Proves it's YOU" vs
      // "Only YOU know it" both said YOU, and "Keeps hackers out" mirrored
      // "Wants to break in" - so more than one card could plausibly match.
      pairs: [
        { term: "Password", match: "Unlocks your account", why: "A password is the secret key that unlocks your account and proves it's really you.", colour: "#00e5ff" },
        { term: "Strong", match: "Too hard to crack", why: "A strong password is so long and mixed up that a cracking machine gives up.", colour: "#7eff97" },
        { term: "Hacker", match: "A baddie who guesses", why: "A hacker is someone who guesses passwords to sneak into accounts that aren't theirs.", colour: "#ff5fb3" },
        { term: "Secret", match: "You never tell anyone", why: "A secret password stays secret; the moment you tell someone, it isn't your key anymore.", colour: "#ffd158" },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "The cards are face down. Tap one, then tap another to find its pair.",
          "Match every pair and you will know the four words heroes use.",
          "[warmly] Off you go.",
        ],
      },
      // Played at the "Rebuild From Memory" phase-2 card so the second
      // mini-game is explained out loud too, not just on the first phase.
      coachLines: {
        speaker: "layla",
        lines: [
          "Good matching. Now a memory round.",
          "You have ten seconds to learn where each card sits.",
          "Then they flip over, and you tap where you think they are.",
        ],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every pair matched. You now know the words: password, strong, hacker, secret.",
          "[warmly] When a grown-up uses one of those, you will know exactly what they mean.",
        ],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "A password proves it's ___.",
      choices: [
        { text: "YOU", isCorrect: true },
        { text: "a robot", isCorrect: false, why: "A password isn't for robots; it's the secret that shows who is really typing." },
        { text: "a hacker", isCorrect: false, why: "A hacker is exactly who the password keeps out." },
        { text: "your friend", isCorrect: false, why: "Your friend shouldn't know your password at all; it proves one person only." },
      ],
      praise: "Exactly - it proves it's YOU! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "That's right. A password proves it's YOU.",
          "It is a key only you have, so the computer lets you in and keeps everybody else out.",
          "[proud] Good start, Cyber Hero.",
        ],
      },
    },

    // - Recap · Concept 1 of 5 (What Is a Password?)
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You know a password is your own secret key that proves it's YOU - so no one can pretend to be you and get into your stuff.",
      next: "why a long password is a strong one",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "First power learned. A password is your own secret key, and it proves it is really you.",
          "Nobody can pretend to be you, so the Raccoon stays out of your things.",
          "[warmly] Now, one thing makes a key hard to crack more than anything else, and it is simply how LONG it is.",
        ],
      },
    },


    /* ─────────── BEAT 2 · LONG ─────────── */
    // 6 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Long Is Strong",
      content:
        "The longer your password, the harder it is to crack. The easiest trick? Stick THREE RANDOM WORDS together - like dragon-taco-comet. Long, strong, AND easy to remember!",
      bullets: [
        "Longer = stronger",
        "Three random words make a great password",
        "Easy to remember, hard to crack",
        "The longer, the stronger - no limit!",
      ],
      bulletIcons: ["📏", "🎲", "🧠", "🔢"],
      emblem: "💪",
      narration: {
        speaker: "layla",
        lines: [
          "Length. That is the whole trick.",
          "Every extra letter gives the Raccoon's guessing machine more work to do.",
          "A short password takes him a blink. A long one takes him YEARS.",
          "And the easiest way to make a long one is to glue three silly words together.",
          "Dragon. Taco. Comet.",
          "[warmly] Long, strong, and easy to remember.",
          "Let's go and build one of your own!",
        ],
      },
    },
    // 7 - Game: BUILD (Three Random Words)
    {
      type: "threeRandomWords",
      whyRight: "Three random words make a long passphrase: easy for you to remember, and years of guessing for the Raccoon.",
      threat: {
        raccoonLine:
          "My guessing machine chews through short little passwords in a blink! Go on, pick a nice SHORT one, make my job easy, heh heh!",
      },
      slots: 3,
      words: [
        { id: "w-tiger", text: "tiger", category: "animal" },
        { id: "w-otter", text: "otter", category: "animal" },
        { id: "w-falcon", text: "falcon", category: "animal" },
        { id: "w-dolphin", text: "dolphin", category: "animal" },
        { id: "w-llama", text: "llama", category: "animal" },
        { id: "w-bumblebee", text: "bumblebee", category: "animal" },
        { id: "w-kettle", text: "kettle", category: "object" },
        { id: "w-rocket", text: "rocket", category: "object" },
        { id: "w-lantern", text: "lantern", category: "object" },
        { id: "w-compass", text: "compass", category: "object" },
        { id: "w-trumpet", text: "trumpet", category: "object" },
        { id: "w-puzzle", text: "puzzle", category: "object" },
        { id: "w-mountain", text: "mountain", category: "place" },
        { id: "w-island", text: "island", category: "place" },
        { id: "w-meadow", text: "meadow", category: "place" },
        { id: "w-jungle", text: "jungle", category: "place" },
        { id: "w-harbour", text: "harbor", category: "place" },
        { id: "w-volcano", text: "volcano", category: "place" },
        { id: "w-pancake", text: "pancake", category: "food" },
        { id: "w-mango", text: "mango", category: "food" },
        { id: "w-noodle", text: "noodle", category: "food" },
        { id: "w-cookie", text: "cookie", category: "food" },
        { id: "w-pretzel", text: "pretzel", category: "food" },
        { id: "w-pickle", text: "pickle", category: "food" },
        { id: "w-dragon", text: "dragon", category: "animal" },
        { id: "w-penguin", text: "penguin", category: "animal" },
        { id: "w-robot", text: "robot", category: "object" },
        { id: "w-comet", text: "comet", category: "object" },
        { id: "w-taco", text: "taco", category: "food" },
        { id: "w-waffle", text: "waffle", category: "food" },
      ],
      hints: {
        tier1: "Pick any 3 words - they don't need to make sense. The longer your password, the harder it is to crack.",
        tier2: "Any three words work - it's the LENGTH that makes it strong. Silly combos are just easier to remember.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "There is a wall of silly words in front of you. Tap any three to snap them together.",
          "The sillier your three, the harder they are to guess.",
          "[warmly] Build yours now.",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap any word you like to begin."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at the length of that! His machine would still be guessing next year.",
          "[warmly] Three silly words. That is all it takes.",
        ],
      },
    },
    // 8 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Which password would take the Raccoon YEARS to crack?",
      speedMs: 5000,
      choices: [
        { text: "cat", isCorrect: false, why: "Cat is three little letters; a cracking machine guesses that in a blink." },
        { text: "Tiger7", isCorrect: false, why: "One word and one number is still a quick guess; hackers try a name plus a number first." },
        { text: "dragon-taco-comet", isCorrect: true },
        { text: "sun", isCorrect: false, why: "Sun is a tiny common word; it would be cracked in a second." },
      ],
      praise: "Fast AND right - long is strong! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "Yes. Dragon-taco-comet is the one.",
          "The more letters there are, the more guesses his machine has to make, and it simply runs out of TIME.",
          "[proud] Nicely worked out.",
        ],
      },
    },

    // - Recap · Concept 2 of 5 (Long Is Strong)
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "You make your password long with three random words - so the Raccoon's guessing machine runs out of time before it ever cracks yours.",
      next: "the weak spot a long password still has",
      emblem: "💪",
      narration: {
        speaker: "adam",
        lines: [
          "Second power learned. You make a password long with three random words.",
          "The guessing machine runs and runs, and it never gets there.",
          "[warmly] But length on its own is not quite enough. A long password made of plain words still has a weak spot.",
        ],
      },
    },


    /* ─────────── BEAT 3 · MIX ─────────── */
    // 9 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Mix It Up",
      content:
        "A strong password mixes different kinds of characters: BIG letters, small letters, numbers, and symbols like ! or $. And never use a plain word on its own - the Raccoon guesses those first.",
      bullets: [
        "Mix CAPITAL and small letters",
        "Add numbers and symbols (! $ #)",
        "Don't use a plain word like 'tiger'",
        "A mixed-up key is the hardest to crack",
      ],
      bulletIcons: ["🔠", "🔣", "🚫", "🌀"],
      emblem: "🎨",
      narration: {
        speaker: "adam",
        lines: [
          "Here is the weak spot. A plain word is a word the Raccoon already has on his LIST.",
          "So we mix it up. Big letters, small letters, numbers, and symbols.",
          "Tiger is a word he knows. But put in a capital, a number and a symbol, and it is not a word at all.",
          "Once there is no plain word left inside, he has nothing to look up.",
          "Time to take some weak passwords into the Password Hospital and make them strong.",
        ],
      },
    },
    // 10 - Game: REPAIR (Fix the Weak Password)
    {
      type: "passwordHospital",
      threat: {
        raccoonLine:
          "A plain little word with nothing mixed in? I gobble those up in one bite! Leave them nice and plain for me, won't you?",
      },
      reasons: [
        { id: "common-word", label: "Plain word - no mix", example: "like 'banana'" },
        { id: "too-short", label: "Too short", example: "like 'cat'" },
        { id: "personal", label: "Has a name", example: "like your name" },
        { id: "keyboard", label: "Keyboard row", example: "like 'asdf'" },
      ],
      patients: [
        {
          id: "pat-tiger",
          password: "tiger",
          primaryReason: "common-word",
          chartNote: "Patient #1 - a plain word, no mix at all",
          diagnosisExplanation:
            "'tiger' is just a plain word - no capitals, numbers or symbols. The Raccoon guesses plain words first.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol", "addLetters"],
        },
        {
          id: "pat-abc",
          password: "abc",
          primaryReason: "too-short",
          chartNote: "Patient #2 - admitted critically short",
          diagnosisExplanation:
            "Only 3 letters - far too short. Short passwords are cracked in seconds. It needs to be much longer.",
          recommendedActions: ["addLetters", "addNumber", "addSymbol"],
        },
        {
          id: "pat-qwerty",
          password: "qwerty",
          primaryReason: "keyboard",
          chartNote: "Patient #3 - a keyboard run from the home row",
          diagnosisExplanation:
            "Those letters sit in a row on the keyboard. It's the FIRST pattern any hacker tries.",
          recommendedActions: ["scramble", "addLetters", "mixCase", "addSymbol"],
        },
        {
          id: "pat-sam",
          password: "Sam2014",
          primaryReason: "personal",
          chartNote: "Patient #4 - a name plus a year",
          diagnosisExplanation:
            "It's a name and a year. Anyone who knows you could guess this in a few tries. Take the personal bits out.",
          recommendedActions: ["removePersonal", "addLetters", "addSymbol"],
        },
        {
          id: "pat-dragon",
          password: "dragon",
          primaryReason: "common-word",
          chartNote: "Patient #5 - a popular word, no extras",
          diagnosisExplanation:
            "'dragon' is one of everyone's favorite words to use. No capitals, no numbers, no symbols.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol", "addLetters"],
        },
        {
          id: "pat-123",
          password: "123",
          primaryReason: "too-short",
          alsoAccept: ["keyboard"],
          chartNote: "Patient #6 - tiny, and just numbers",
          diagnosisExplanation:
            "Only 3 characters, and they're numbers in a row. Cracked in less than a second.",
          recommendedActions: ["addLetters", "addSymbol", "mixCase"],
        },
      ],
      hints: {
        diagnosisTier1: "Is it a plain word you'd find in a book? Then it needs a MIX.",
        diagnosisTier2: "No capitals, numbers or symbols = 'Plain word - no mix'.",
        repairTier1: "Each fix does one thing. Watch the strength meter climb.",
        repairTier2: "The big wins: mix the case, add a number, add a symbol.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "Each patient is a weak password. Tap what is wrong with it, then use your tools to fix it.",
          "Watch the strength meter climb as you go.",
          "[warmly] Heal them all, Cyber Hero.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Look at this patient. What is wrong with this password?"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every patient healed. A capital, a number and a symbol, and the plain word is gone.",
          "[warmly] Nothing left in there for him to look up.",
        ],
      },
    },
    // 11 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "a password made of small letters only is just as strong as a mixed-up one!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Small letters only is easy to guess; mixing in capitals, numbers and symbols is what makes it strong." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Mixing it up makes it MUCH stronger. ✓",
      nudge: "Think - what did the cyber-doctor add to heal those passwords?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "Not true, and you spotted it.",
          "All small letters is an easy job for him. Add capitals, numbers and symbols. Now there are so many MORE guesses to make that his machine gives up.",
          "[proud] Sharp eyes, Cyber Hero.",
        ],
      },
    },

    // - Recap · Concept 3 of 5 (Mix It Up)
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned:
        "You mix in capitals, numbers and symbols - so there's no plain word left for the Raccoon to guess.",
      next: "the one way he gets in without cracking anything",
      emblem: "🎨",
      narration: {
        speaker: "layla",
        lines: [
          "Third power learned. You mix in capitals, numbers and symbols, so no plain word is left inside.",
          "Long, and mixed up. That is a very hard password to crack.",
          "[warmly] But there is one way he gets a password without cracking anything at all. That is the thing we most need to talk about.",
        ],
      },
    },


    /* ─────────── BEAT 4 · SECRET ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Keep It Secret",
      content:
        "A password only works if you're the ONLY one who knows it. Don't tell your best friend. Don't leave it where others can see. The only people who help are your parents or a trusted grown-up.",
      bullets: [
        "Never tell anyone - not even a best friend",
        "Don't write it where others can see",
        "Only a parent / trusted grown-up helps",
        "A shared secret isn't a secret anymore",
      ],
      bulletIcons: ["🤐", "🙈", "👪", "🔓"],
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "He ASKS for it.",
          "That is his favorite trick, because a password you hand over needs no cracking at all.",
          "[warmly] So here is the rule. Your password stays secret.",
          "Not your best friend. Not somebody in your game. Not a message that says it is urgent.",
          "The only place you ever type it is your own real login screen.",
          "[whispers] And the only person who ever helps you with it is a trusted grown-up.",
          "Come and meet some of his tricks, and decide what to do!",
        ],
      },
    },
    // 13 - Game: DECIDE (What Would You Do?)
    {
      // Uses the chooseYourPath DATA shape but presentation:"device" mounts
      // PauseDecide (an app screen + two NEUTRAL choice cards; the safe side is
      // randomised per moment and colour is revealed only after the pick) - a
      // different mechanic from Week 15's doors.
      type: "chooseYourPath",
      presentation: "device",
      speakScenarios: true,
      threat: {
        raccoonLine:
          "My best trick of all? I don't crack passwords, I get kids to just HAND them over! Watch me pop up and ask ever so nicely, heh heh!",
      },
      // The safe answer VARIES so it's a real decision, not "always tap PAUSE":
      // keep it secret from strangers/sites/friends (pause), the ONE safe helper
      // is a trusted grown-up (safeKind:"ask"), and your OWN real login screen is
      // the one place it belongs (safeKind:"go"). Moments are runtime-shuffled.
      scenarios: [
        {
          frame: { appName: "Game Chat", icon: "🎮" },
          setup: "A player messages you: \"Send me your password and I'll give you FREE stuff!\"",
          choices: [
            { text: "Send my password", isSafe: false, consequence: "There was no free gift. They wanted the account, and now it is theirs." },
            { text: "PAUSE - it's my secret", isSafe: true, consequence: "Good. A real gift never needs your password, so that was never a gift." },
          ],
        },
        {
          frame: { appName: "Login", icon: "🔐" },
          setup: "Uh oh - you forgot your password and can't log in. What's the smart thing to do?",
          safeKind: "ask",
          choices: [
            { text: "Ask a friend to guess it", isSafe: false, consequence: "A friend cannot get it back for you, and now they might know it. There is a better person to ask." },
            { text: "Ask my mom or dad", isSafe: true, consequence: "That is the one. A trusted grown-up is the only person who helps you with your password." },
          ],
        },
        {
          frame: { appName: "PasswordChecker.fun", icon: "🔐" },
          setup: "A website pops up: \"Type your password here and we'll tell you how STRONG it is!\"",
          choices: [
            { text: "Type it in", isSafe: false, consequence: "That box checks nothing. It keeps whatever you type." },
            { text: "PAUSE - close it", isSafe: true, consequence: "Closed, and quite right. A real checker never asks for your actual password." },
          ],
        },
        {
          frame: { appName: "Messages", icon: "💬" },
          setup: "Your best friend texts: \"Tell me your password so I can log in and get you cool stuff!\"",
          choices: [
            { text: "Tell my best friend", isSafe: false, consequence: "Even a best friend should not know it. If their account is broken into, yours goes with it." },
            { text: "PAUSE - keep it zipped", isSafe: true, consequence: "You kept it. Nobody else needs your password, and that includes a best friend." },
          ],
        },
        {
          frame: { appName: "My Game Login", icon: "🎮" },
          setup: "You open YOUR game on the family tablet. The real login screen asks for your password so you can play.",
          safeKind: "go",
          choices: [
            { text: "Type it in - it's my own login", isSafe: true, consequence: "Yes. Your own login screen is the one place it belongs. Just check that nobody is watching." },
            { text: "PAUSE - never type it anywhere", isSafe: false, consequence: "It has to go somewhere, and your own login is exactly where it goes. Strangers, pop-ups and friends never get it." },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "You will see one moment at a time. Read it, think, then tap the card that keeps your secret safe.",
          "[warmly] Take your time. There is no rush on this one.",
        ],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] You kept it secret every single time!",
          "[warmly] A stranger asked, a pop-up asked, a best friend asked, and he still has nothing.",
        ],
      },
    },
    // 14 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who should know your password?",
      choices: [
        { text: "Only me (and a parent)", isCorrect: true },
        { text: "My best friend", isCorrect: false, why: "Even a best friend shouldn't know it; a secret shared is a secret that can leak." },
        { text: "My whole class", isCorrect: false, why: "A whole class is a lot of people; a password is for you alone." },
        { text: "Anyone who asks", isCorrect: false, why: "Anyone who asks is exactly who must not get it; the Raccoon asks nicely too." },
      ],
      praise: "Right - it stays your secret! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "Correct. You, and a trusted grown-up at home.",
          "Not your best friend, not your class, not ANYBODY who asks nicely.",
          "[proud] Exactly right.",
        ],
      },
    },

    // - Recap · Concept 4 of 5 (Keep It Secret)
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "You keep your password secret and never share it - so no one can ever be tricked into handing it to the Raccoon.",
      next: "what is on the Raccoon's list",
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "Fourth power learned. You keep your password secret, even from a best friend.",
          "So nobody can ever be talked into handing it over.",
          "[warmly] One power left. He does not guess at random. He has a list, and he tries the same things FIRST.",
        ],
      },
    },


    /* ─────────── BEAT 5 · OBVIOUS ─────────── */
    // 15 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Don't Pick the Obvious",
      content:
        "The Raccoon tries the OBVIOUS passwords first: your name, your birthday, 123456, or the word 'password'. If someone could guess it about you, it's a bad password.",
      bullets: [
        "Not your name (or your pet's name)",
        "Not your birthday",
        "Not 123456 or 'password'",
        "Not keyboard rows like 'qwerty'",
      ],
      bulletIcons: ["🏷️", "🎂", "🔢", "⌨️"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "Let's look at his list.",
          "Your name. Your birthday. Your pet. Your favorite team.",
          "And right at the top, one two three four five six.",
          "These are the first things he tries, because they are the things people pick MOST.",
          "[warmly] So we pick something that is on nobody's list.",
          "Your turn to sort some weak passwords, and work out why each one is weak.",
        ],
      },
    },
    // 16 - Game: SORT (Why Is It Weak?)
    {
      type: "weakSorter",
      threat: {
        raccoonLine:
          "I always try the OBVIOUS ones first: names, birthdays, one-two-three! You'd be amazed how many kids pick those. Please, make it easy for me!",
      },
      reasons: [
        { id: "too-short", label: "Too short", example: "abc" },
        { id: "common-word", label: "Common word", example: "football" },
        { id: "personal", label: "Has your name or birthday", example: "OliviaSmith2016" },
        { id: "keyboard", label: "Keyboard pattern", example: "qwerty" },
      ],
      items: [
        { text: "abc", reasonId: "too-short", explanation: "Only 3 letters - far too tiny to keep anything safe." },
        { text: "football", reasonId: "common-word", explanation: "A word from the dictionary - hackers try common words first." },
        { text: "OliviaSmith2016", reasonId: "personal", explanation: "A name and a birthday - the easiest things to guess about you." },
        { text: "qwerty", reasonId: "keyboard", explanation: "These letters sit in a row on the keyboard - the FIRST pattern hackers try." },
        { text: "123", reasonId: "too-short", alsoAccept: ["keyboard"], explanation: "Only 3 characters, and numbers in order - cracked in under a second." },
        { text: "dragon", reasonId: "common-word", explanation: "A popular word - 'dragon' is in every hacker's top-100 list." },
        { text: "JacobSmith0511", reasonId: "personal", explanation: "A name plus what looks like a date - quick to guess if someone knows you." },
        { text: "asdfgh", reasonId: "keyboard", explanation: "Another row of keys in order - just like qwerty." },
      ],
      hints: {
        tier1: "Look at WHY it's weak: too short, a real word, about you, or just keyboard keys in a row?",
        tier2: "Is it really tiny - just a few letters? That's 'Too short'. Or is it a word you'd find in a book?",
        tier3: "'too-short' = really tiny, just a few letters. 'common-word' = a real word. 'personal' = a name/birthday. 'keyboard' = letters in a straight line.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "Look at each weak password and tap the reason it is weak.",
          "Too short. A real word. Something about you. Or just keys in a row.",
          "[warmly] Sort them all, Cyber Hero.",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] All sorted. You can see why a password is weak before you ever choose one.",
          "[warmly] No names, no birthdays, no numbers in a row.",
        ],
      },
    },
    // 17 - Prove: RECALL (which would the Raccoon guess first)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which password would a hacker guess FIRST?",
      choices: [
        { text: "password", isCorrect: true },
        { text: "Dragon-Pickle9!", isCorrect: false, why: "Dragon-Pickle9! is long and mixed up; a hacker would take years, so it's not a first guess." },
        { text: "Comet$Turtle3", isCorrect: false, why: "Comet$Turtle3 mixes words, a symbol and a number; that's a hard one, not a first guess." },
        { text: "Waffle!Ninja6", isCorrect: false, why: "Waffle!Ninja6 is long and mixed; a hacker would never start there." },
      ],
      praise: "Yep - 'password' is the #1 worst! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "Yes. The word password is the most popular password there is, so it is the FIRST thing he tries.",
          "The safe ones are random words with nothing to do with you.",
          "[proud] Nothing gets past you.",
        ],
      },
    },

    // - Recap · Concept 5 of 5 (Don't Pick the Obvious)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned:
        "You steer clear of obvious passwords - so the Raccoon can't guess his way in from your name, birthday or 123456.",
      next: "all five powers together in Power Bingo",
      emblem: "🕵️",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] That is all five powers, Cyber Hero!",
          "A key that proves it is you. Long. Mixed up. Secret. Nothing obvious.",
          "[warmly] Before we face him, let's put all five together one more time in Power Bingo.",
        ],
      },
    },

    // 18 - Consolidation: "Hero Power Bingo" (mixed review of the week's
    // password-building powers). A DIFFERENT mechanic from Week 15's
    // CyberScanner: each round plays a little move and the child taps which
    // password power it used, filling a 2x2 card to BINGO.
    {
      type: "signBingo",
      // Owner picked "The Vault Door" from three concept boards (2026-09-11):
      // four brass dials around the vault door; a correct tap turns the dial
      // and slides its bolt home; four bolts seal the vault.
      skin: "vault",
      // Sarah's instructions ON the board (owner: "I need instructions from Sarah"):
      // the how-to once as the board appears (coachLines), then after every move the
      // prompt below, plus the visible action strip the component renders.
      roundPrompt: "Which power did that move use? Tap its dial.",
      coachLines: {
        speaker: "adam",
        lines: ["Listen to the move, then tap the dial for the power it used."],
      },
      introTitle: "Hero Power Bingo",
      introSubtitle: "Watch each move, then tap the dial for the password power it used. Four bolts home seals the vault!",
      introIcon: "🔒",
      cardTitle: "Hero Power Bingo",
      stampToast: "BOLTED!",
      wrongTitle: "Not that dial, Cyber Hero",
      completeTitle: "BINGO! Vault sealed!",
      completeLine: "Four bolts home. The Raccoon is locked out for good!",
      signs: [
        { id: "long", label: "Long & random", icon: "💪" },
        { id: "mix", label: "Mix it up", icon: "🎨" },
        { id: "secret", label: "Keep it secret", icon: "🤐" },
        { id: "obvious", label: "Nothing obvious", icon: "🚫" },
      ],
      rounds: [
        {
          id: "r-long",
          scene: "Mia's password is otter-lamp-rocket-comet. The Raccoon's cracker runs for a MILLION years and still can't open it!",
          sceneIcon: "🧩",
          signId: "long",
          note: "Mia used four random words. That makes a password long, so this one is the long power.",
          why: "Four random words, so his cracker runs out of time. That is the long power.",
        },
        {
          id: "r-mix",
          scene: "Ben took his word and popped in a big capital, a 9 and a $ sign. Now it's a jumble the Raccoon can't read.",
          sceneIcon: "🔢",
          signId: "mix",
          note: "Ben mixed a capital, a number and a symbol through his. That is the mix-it-up power.",
          why: "A capital, a number and a symbol, and the plain word is gone. The mix-it-up power.",
        },
        {
          id: "r-secret",
          scene: "A stranger in chat begs Ada for her password. She zips her lips and tells a grown-up instead.",
          sceneIcon: "💬",
          signId: "secret",
          note: "Ada did not share it with anybody. That is the keep-it-secret power.",
          why: "Ada told a grown-up and nobody else. That is keeping it secret.",
        },
        {
          id: "r-obvious",
          scene: "Sam nearly used his birthday... then picked something no one could EVER guess about him.",
          sceneIcon: "🎂",
          signId: "obvious",
          note: "No name and no birthday, nothing anyone could guess. That is the nothing-obvious power.",
          why: "Nothing about Sam that anyone could guess. Nothing obvious, every time.",
        },
      ],
      hints: {
        tier1: "Which of your four powers does this move show? Tap that dial.",
        tier2: "Listen to what they DID: made it long, mixed it up, kept it secret, or picked nothing obvious?",
      },
      narration: {
        speaker: "adam",
        lines: [
          "I will read out something a person did. You tap the dial for the power they used. Then the bolt slides into the vault door.",
          "Then I will tell you why it worked.",
          "[warmly] Four bolts home and the vault is sealed.",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[excited] Bingo! Every power spotted.",
          "[warmly] Long, mixed up, secret, nothing obvious. Now let's go and lock him out.",
        ],
      },
    },

    // 19 - BOSS BATTLE (5 phases)
    { type: "bossBattle" },

    // 20 - CLOSING VIDEO: "The Bounce" (Raccoon attacks again, bounces off)
    { type: "video", videoPlaceholder: "Week 1: The Bounce", videoSrc: "/videos/module-01-outro.mp4" },

    // 21 - Mission Debrief (consolidate by concept)
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "key", label: "Your Secret Key", accent: "#7eff97", icon: "🔑", summary: "A password proves it's really you - only you should have it." },
        { id: "long", label: "Long Is Strong", accent: "#00e5ff", icon: "💪", summary: "Three random words make a long password the Raccoon can't crack." },
        { id: "mix", label: "Mix It Up", accent: "#ffd158", icon: "🎨", summary: "Capitals, numbers and symbols - never a plain word." },
        { id: "secret", label: "Keep It Secret", accent: "#ff5fb3", icon: "🤐", summary: "Never share it - not even with a best friend." },
        { id: "obvious", label: "Nothing Obvious", accent: "#7c5cff", icon: "🚫", summary: "No names, birthdays, '123456' or 'qwerty'." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Look at what you can do now, Cyber Hero.",
          "You know your password is a key that proves it is you.",
          "You make it long with three random words.",
          "You mix in capitals, numbers and symbols.",
          "You keep it secret.",
          "And you never pick the obvious.",
          "[proud] That is a password the Hacker Raccoon cannot beat. Time to claim your stickers!",
        ],
      },
    },

    // 22 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "password-protector", name: "Password Protector", icon: "🔐", art: "/cyberheroes/stickers/w01/password-protector.png", description: "Built passwords the Raccoon can't crack." },
        { id: "key-master", name: "Key Master", icon: "🗝️", art: "/cyberheroes/stickers/w01/key-master.png", description: "Knows a password is your secret key." },
        { id: "secret-keeper", name: "Secret Keeper", icon: "🤐", art: "/cyberheroes/stickers/w01/secret-keeper.png", description: "Stood firm when asked to share." },
      ],
    },

    // 23 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#e3b341",
    passMark: 4,
    theme: {
      topic: "Passwords",
      motifs: ["🔑", "🔒", "🛡️", "🔢", "🔣", "🗝️", "🔐", "⭐"],
    },
    intro: {
      slug: "quiz-w1-intro",
      text: "Well well, look who finished the lesson! Think you learned anything? Step up and prove it, hero!",
    },
    victory: {
      slug: "quiz-w1-victory",
      text: "Every single one?! Nobody beats my quiz! I am taking my questions and going home!",
    },
    questions: [
      {
        phaseId: "phase-what",
        key: "quiz-what-1",
        label: "What Is a Password?",
        ask: {
          slug: "quiz-w1-ask-what-1",
          text: "Adam left his tablet on the bus seat. What actually keeps his stuff safe?",
        },
        options: [
          { text: "A secret code only he knows" },
          { text: "Keeping it in a secret hiding spot" },
          { text: "Only using it in his own room" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Only a secret code locks it!",
          explanation: "Hiding a tablet will not stop someone who finds it. A house rule will not stop them either. A password is the one thing that really locks it.",
        },
        villainRight: {
          slug: "quiz-w1-right-what-1",
          text: "OW! A secret code?! Nothing to peek at, nothing to pick up, no way in!",
        },
        villainWrong: {
          slug: "quiz-w1-wrong-what-1",
          text: "Hiding spots and house rules? The second I get my paws on it, it pops right open!",
        },
      },
      {
        phaseId: "phase-length",
        key: "quiz-length-1",
        label: "Long Is Strong",
        ask: {
          slug: "quiz-w1-ask-length-1",
          text: "My guessing robot tries millions of passwords every second. Which one would take it the LONGEST to crack?",
        },
        options: [
          { text: "hedgehog-saxophone-waterfall" },
          { text: "hedgehog-hedgehog-hedgehog" },
          { text: "Purple9!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Long AND different is strong!",
          explanation: "A short password? His robot cracks it in a blink. The same word three times? Just as easy, once he spots the pattern. Three DIFFERENT words give him the most to chew through.",
        },
        villainRight: {
          slug: "quiz-w1-right-length-1",
          text: "Three whole DIFFERENT words?! My robot will be guessing until it rusts!",
        },
        villainWrong: {
          slug: "quiz-w1-wrong-length-1",
          text: "Too easy! A short one, or the same word on repeat, my robot races right through both!",
        },
      },
      {
        phaseId: "phase-mix",
        key: "quiz-mix-1",
        label: "Mix It Up",
        ask: {
          slug: "quiz-w1-ask-mix-1",
          text: "All three of these have a trick or two in them. Which one is HARDEST for a hacker to crack?",
        },
        options: [
          { text: "S3a$hell9Wave!" },
          { text: "Sunflower2024" },
          { text: "sunflower!!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Mix in all three!",
          explanation: "One extra thing stuck on the end is not enough. Mix a capital, a number AND a symbol all the way through. A word plus a year is still mostly a word.",
        },
        villainRight: {
          slug: "quiz-w1-right-mix-1",
          text: "Ouch! Capitals, numbers AND symbols all at once poked my decoder right in the circuits!",
        },
        villainWrong: {
          slug: "quiz-w1-wrong-mix-1",
          text: "Just a plain word with one little trick tacked on? My decoder eats those for lunch!",
        },
      },
      {
        phaseId: "phase-secret",
        key: "quiz-secret-1",
        label: "Keep It Secret",
        ask: {
          slug: "quiz-w1-ask-secret-1",
          text: "A website says: type your password here and we will tell you how strong it is! What do you do?",
        },
        options: [
          { text: "Keep it secret" },
          { text: "Type it in to get the free reward" },
          { text: "Tell only your best friend" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Keep it secret!",
          explanation: "A checker box, a free reward, even a best friend. None of them ever gets your real password. The only person who helps you is a trusted grown-up at home.",
        },
        villainRight: {
          slug: "quiz-w1-right-secret-1",
          text: "You kept your secret from the box AND from your friend?! That was my best trick!",
        },
        villainWrong: {
          slug: "quiz-w1-wrong-secret-1",
          text: "Yes, pop it in the box or whisper it to a pal! Secrets always leak, and then they're MINE!",
        },
      },
      {
        phaseId: "phase-obvious",
        key: "quiz-obvious-1",
        label: "Don't Pick the Obvious",
        ask: {
          slug: "quiz-w1-ask-obvious-1",
          text: "I always guess everyone's favorites first! Which one of these could I NEVER guess?",
        },
        options: [
          { text: "Igloo-Banjo-Comet7!" },
          { text: "Superman-Batman-2015" },
          { text: "Password1!" },
          { text: "Qwerty123" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Don't pick the obvious!",
          explanation: "Password with a one on the end. Keyboard rows like qwerty. A hero's name with a birthday year. They are all near the top of his LIST. A safe password is random words that have nothing to do with you.",
        },
        villainRight: {
          slug: "quiz-w1-right-obvious-1",
          text: "Igloo-Banjo-WHAT?! That is on none of my lists! NONE of them!",
        },
        villainWrong: {
          slug: "quiz-w1-wrong-obvious-1",
          text: "Favorites first! Password, qwerty, superheroes, that's the very first page of my guessing book!",
        },
      },





    
    ],
  },
  badgeArt: "/cyberheroes/badges/week-01-password-protector.png",

  /* ─── Legacy 5-phase MCQ data (fallback if bossVault is ever cleared) ─── */
  bossPhases: [
    {
      kind: "mcq",
      id: "phase-length",
      label: "Length",
      announceText: "Round 1 - The Length Test!",
      announceTone: "cyan",
      questions: [
        { question: "A guessing robot tries millions of passwords a second. Which one keeps it busy the LONGEST?", answers: ["hedgehog-saxophone-waterfall", "hedgehog", "H3llo!", "wow"], correctIndex: 0, explanation: "Three long words give the robot far more to guess than one short word, so it lasts longest.", key: "boss-length-1" },
        { question: "Your friend says: 'Short passwords are fine, I'll just add ONE letter.' Why isn't that enough?", answers: ["It makes it too hard to type", "Short passwords are the strongest", "One extra letter is still short and quick to guess", "Letters aren't allowed"], correctIndex: 2, explanation: "One letter barely helps. Real strength comes from lots more length.", key: "boss-length-2" },
        { question: "Which password is the LONGEST, and so the toughest?", answers: ["marshmallow-submarine", "marshmallow-submarine-umbrella-cabbage", "biscuit9", "cake"], correctIndex: 1, explanation: "Four long words beat two words or one short one every time.", key: "boss-length-3" },
        { question: "'thunder' has seven letters. Which change makes it MUCH harder to crack?", answers: ["Add two more random words after it", "Write it all in capitals", "Spell it backwards", "Say it out loud twice"], correctIndex: 0, explanation: "Extra random words add length, and length is what stumps the guesser. Capitals or backwards keep it the same length.", key: "boss-length-4" },
        { question: "Which of these does NOT make a password longer?", answers: ["Adding another word", "Adding a few more letters", "Joining two words together", "Choosing a shorter word"], correctIndex: 3, explanation: "Everything else adds length. A shorter word does the opposite.", key: "boss-length-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-mix",
      label: "Mix",
      announceText: "Round 2 - Mix It Up!",
      announceTone: "blue",
      questions: [
        { question: "Which password truly MIXES big letters, small letters, numbers AND a symbol?", answers: ["waterfallwombat", "Waterfall$Wombat7", "WATERFALLWOMBAT", "77777777"], correctIndex: 1, explanation: "It has capitals, small letters, a number and a symbol, a full mix.", key: "boss-mix-1" },
        { question: "Both are long. Which is HARDER for a hacker: 'sunshinesunshine' or 'S3a$hell9Wave!'?", answers: ["S3a$hell9Wave!", "sunshinesunshine", "They're exactly the same", "sunshine"], correctIndex: 0, explanation: "Same length, but the mixed-up one has far more surprises to guess.", key: "boss-mix-2" },
        { question: "'hippopotamus' is a nice long word. Why is it still not great on its own?", answers: ["It's too short", "It already has a symbol", "It's one plain word, so a hacker's word list can find it", "It already has numbers"], correctIndex: 2, explanation: "Hackers try whole words from a list. Mix it up so yours isn't just a word.", key: "boss-mix-3" },
        { question: "Three of these mix it up well. Which one does NOT?", answers: ["biscuitbiscuit", "Br1ck$Owl", "Kite9!Moon", "Fox$7Lamp"], correctIndex: 0, explanation: "'biscuitbiscuit' is just one word twice, no capitals, numbers or symbols.", key: "boss-mix-4" },
        { question: "How would you turn the plain word 'galaxy' into a strong password?", answers: ["Type it three times", "Make every letter a capital", "Put a 1 at the very end", "Add more words plus a capital, a number and a symbol"], correctIndex: 3, explanation: "A real mix: extra words, capitals, a number and a symbol, not just one small change.", key: "boss-mix-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-secret",
      label: "Secret",
      announceText: "Round 3 - Keep It Secret!",
      announceTone: "gold",
      questions: [
        { question: "A website says: 'Type your password here and we'll tell you how strong it is!' You...", answers: ["Keep it secret, a real check never needs your real password", "Type it in to see the score", "Type in half of it", "Type it with one letter changed"], correctIndex: 0, explanation: "Never type your real password into a stranger's box. That's just a way to steal it.", key: "boss-secret-1" },
        { question: "Your cousin says: 'Tell me your password, I'll only use it to save your game, promise!' You...", answers: ["Share it, they promised", "Say no, even people you like keep it secret", "Whisper it so nobody hears", "Give them the first half"], correctIndex: 1, explanation: "A promise doesn't make it safe. Your password stays yours alone.", key: "boss-secret-2" },
        { question: "You're really stuck logging in and need help. Who is the SAFE person to ask?", answers: ["A helpful player in the chat", "Your whole friend group", "A parent or trusted grown-up", "Whoever replies the fastest online"], correctIndex: 2, explanation: "Only a grown-up you trust helps with passwords, never an online stranger.", key: "boss-secret-3" },
        { question: "You're about to say your password out loud on a voice call so a friend can type it. What's the problem?", answers: ["Anyone nearby or on the call could hear your secret", "Passwords can't be spoken", "It would take too long", "Your friend types too slowly"], correctIndex: 0, explanation: "Said out loud, a secret isn't a secret. Type it yourself, quietly.", key: "boss-secret-4" },
        { question: "On a shared family tablet a box asks 'Save this password for everyone?' The safest choice is...", answers: ["Save it so it's quick next time", "Save it and tell your friends", "Turn the tablet off and hope", "Ask a grown-up before saving it anywhere"], correctIndex: 3, explanation: "When you're unsure where a password gets saved, check with a grown-up first.", key: "boss-secret-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-obvious",
      label: "Nothing Obvious",
      announceText: "Round 4 - Nothing Obvious!",
      announceTone: "red",
      questions: [
        { question: "Which of these is a super common password a hacker tries almost first?", answers: ["iloveyou", "Kite$9Fern", "Wolf7!Rain", "Plum$3Cloud"], correctIndex: 0, explanation: "'iloveyou' is on every hacker's top-guess list. The others are random and mixed.", key: "boss-obvious-1" },
        { question: "Why is your favorite football team's name a weak password?", answers: ["It's far too long", "Anyone who knows what you like could guess it", "It has too many symbols", "Teams change their names often"], correctIndex: 1, explanation: "If people can guess it from what you love, it isn't secret enough.", key: "boss-obvious-2" },
        { question: "Which of these is the EASIEST to guess?", answers: ["aaaaaa", "Moth$7Vine", "Reef9!Sky", "Bolt$Fox3"], correctIndex: 0, explanation: "The same letter six times is one of the first patterns a hacker tries.", key: "boss-obvious-3" },
        { question: "Your friend uses their house number as a password. Why is that risky?", answers: ["House numbers are too long", "Numbers aren't allowed in passwords", "People who know where they live could guess it", "It's actually far too strong"], correctIndex: 2, explanation: "Anything a person could learn about you makes a weak password.", key: "boss-obvious-4" },
        { question: "Which of these would someone who knows you guess FASTEST?", answers: ["Frost$9Hawk", "Vine7!Drum", "Quail3Moss", "Your best friend's name"], correctIndex: 3, explanation: "Names of people close to you are easy guesses. Random and mixed is the way.", key: "boss-obvious-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-final",
      label: "Final Showdown",
      announceText: "FINAL ROUND - Lock Him Out!",
      announceTone: "red",
      questions: [
        { question: "Pick the password the Raccoon could NEVER crack:", answers: ["Glacier$Hamster9Doorbell!", "hello123", "myname2015", "abcabc"], correctIndex: 0, explanation: "Long random words plus a capital, number and symbol, and nothing about you.", key: "boss-final-1" },
        { question: "The Raccoon messages: 'I'm from the game team, type your password to PROVE the account is yours.' You...", answers: ["Type it to prove it's yours", "Refuse, the real game team never asks for your password", "Type it backwards to be safe", "Send just the last letter"], correctIndex: 1, explanation: "No real helper ever needs your password. That's always a trick.", key: "boss-final-2" },
        { question: "You just got a puppy named Biscuit. Should 'Biscuit2026' be your new password?", answers: ["No, exciting news about you is easy for others to guess", "Yes, nobody knows the puppy", "Yes, because it has a number", "Only if you tell your friends"], correctIndex: 0, explanation: "Exciting personal news spreads. Keep pets, names and years OUT.", key: "boss-final-3" },
        { question: "The Raccoon laughs: 'Just give me a HINT about your password!' The hero move is...", answers: ["Give one tiny hint", "Tell him just the first letter", "Give no hints at all, hints help him guess", "Tell him how long it is"], correctIndex: 2, explanation: "Even a hint or the length helps a guesser. He gets nothing.", key: "boss-final-4" },
        { question: "Which is the STRONGEST password here?", answers: ["telescope", "Cabbage2017", "telescopetelescope", "Telescope-Cabbage-Thunder-Wombat8!"], correctIndex: 3, explanation: "Four random words plus a capital, number and symbol, unbeatable and nothing obvious.", key: "boss-final-5" },
      ],
    },
  ],

  // Legacy flat fallback (used only if bossPhases is ever cleared).
  bossQuestions: {
    easy: [
      { question: "What is a password?", answers: ["A secret code to prove it's you", "Your username", "A song", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in." },
      { question: "Which is strongest because it's LONG?", answers: ["dragon-taco-comet", "cat", "Tiger7", "sun"], correctIndex: 0, explanation: "Three random words make a long, hard-to-crack password." },
      { question: "What makes a password nice and long?", answers: ["Three random words", "3 letters", "Your name written three times", "your initials"], correctIndex: 0, explanation: "Three random words make it long and strong!" },
    ],
    medium: [
      { question: "Which password MIXES all the types?", answers: ["Robot-Comet7!", "tigertiger", "12345678", "FOOTBALL"], correctIndex: 0, explanation: "Capitals, small letters, numbers AND symbols." },
      { question: "Your best friend asks for your password. You say...", answers: ["No - it's my secret", "Sure!", "Only half", "I'll write it down"], correctIndex: 0, explanation: "Passwords are always secret, even from friends." },
      { question: "Which is the WORST password?", answers: ["password", "Dragon-Pickle9!", "Comet$Turtle3", "Waffle!Ninja6"], correctIndex: 0, explanation: "'password' is the most-guessed password in the world." },
    ],
    hard: [
      { question: "Pick the Raccoon-proof password:", answers: ["Comet$Dragon7Waffle!", "cat", "yourname2014", "123456"], correctIndex: 0, explanation: "Long, mixed, nothing obvious." },
      { question: "The Raccoon says 'just tell me ONE letter.' You...", answers: ["Tell him nothing", "Tell one letter", "Tell a hint", "Tell a friend"], correctIndex: 0, explanation: "Your password stays completely secret." },
      { question: "Which should you NEVER use in a password?", answers: ["Your birthday", "A symbol", "A capital letter", "A random word"], correctIndex: 0, explanation: "Birthdays are easy to guess about you." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
  // Keyed by SCREEN INDEX (0-29), one per screen.
  //
  // These were authored for a 29-screen Week 1, before the ATLAS briefing was
  // inserted at index 2, and nobody shifted them afterwards. Every reaction
  // from index 2 on therefore sat one screen EARLY: a game prompt on a Learn
  // screen, "Boss battle!" on the outro video. Renumbered 2026-09-24, and the
  // briefing given its own line. If a screen is ever inserted again, shift
  // these with it (the trailing labels make that checkable at a glance).
    0: { adam: { mood: "excited", message: "Mission 1 - let's go, Cyber Hero!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Alert! The Raccoon's after our passwords - let's stop him!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the briefing." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "A password is your secret key." }, layla: null }, // learn: key
    5: { adam: null, layla: { mood: "excited", message: "Match the cyber words!" } }, // game: match
    6: { adam: { mood: "thumbsup", message: "Prove it - finish the rule!" }, layla: null }, // prove: finish
    7: { adam: null, layla: { mood: "excited", message: "You did it! One secret down - keep going!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Long beats clever every time." } }, // learn: long
    9: { adam: { mood: "excited", message: "Pick three random words!" }, layla: null }, // game: build
    10: { adam: null, layla: { mood: "excited", message: "Quick - tap the longest!" } }, // prove: speed
    11: { adam: { mood: "thumbsup", message: "Stronger every round - nice!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Now let's MIX it up." }, layla: null }, // learn: mix
    13: { adam: { mood: "excited", message: "Heal these weak passwords!" }, layla: null }, // game: repair
    14: { adam: null, layla: { mood: "worried", message: "The Raccoon's talking - true or false?" } }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Three secrets mastered - amazing!" } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Keep your password secret." } }, // learn: secret
    17: { adam: { mood: "curious", message: "Pick the safe choice." }, layla: null }, // game: decide
    18: { adam: null, layla: { mood: "thumbsup", message: "Who should know it? You decide." } }, // prove: recall
    19: { adam: { mood: "thumbsup", message: "Almost there, Cyber Hero!" }, layla: null }, // recap 4
    20: { adam: { mood: "worried", message: "Never pick the obvious ones." }, layla: null }, // learn: obvious
    21: { adam: { mood: "thinking", message: "Tell me WHY each one is weak." }, layla: null }, // game: sort
    22: { adam: { mood: "excited", message: "Which would he guess first?" }, layla: null }, // prove: recall
    23: { adam: null, layla: { mood: "excited", message: "All five! You're ready for the boss!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Rip the weak ones from his notebook!" } }, // consolidation
    25: { adam: { mood: "worried", message: "Boss battle - lock him out!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the Raccoon bounce right off!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to your Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Password Protector badge earned!" }, layla: null }, // completion
  },
};

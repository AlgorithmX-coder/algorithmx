import type { WeekContent } from "./types";

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

    // 1 - ALERT: incident report with this week's topic image
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-01.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Hacker Raccoon is hunting for Adam and Layla's passwords. They need YOUR help!",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Find out what a password really is",
        "Build a password the Raccoon can't crack",
        "Beat the Raccoon and lock him out for good",
      ],
    },

    /* ─────────── BEAT 1 · KEY ─────────── */
    // 3 - Learn
    {
      type: "info",
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
          "[warmly] Hey there, Cyber Hero! I've got a secret... just for you.",
          "[whispers] Come a little closer.",
          "Your password is like a magic key, and it's all yours.",
          "It's how the computer knows it's really YOU.",
          "[nervous] A weak little key? Uh-oh... that lets the sneaky Raccoon slip right in.",
          "[excited] But a big, strong one? [laughs] He doesn't stand a chance!",
        ],
      },
    },
    // 4 - Game: MATCH (Cyber Words)
    {
      type: "memoryMatch",
      pairs: [
        { term: "Password", match: "Your secret code", colour: "#00e5ff" },
        { term: "Strong", match: "Long and mixed up", colour: "#7eff97" },
        { term: "Hacker", match: "Guesses your password", colour: "#ff5fb3" },
        { term: "Secret", match: "Never share it", colour: "#ffd158" },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Let's match the cyber words to their meanings!",
          "Flip two cards to find a matching pair.",
          "[warmly] Take your time, and remember where they are!",
        ],
      },
      // Played at the "Rebuild From Memory" phase-2 card so the second
      // mini-game is explained out loud too, not just on the first phase.
      coachLines: {
        speaker: "layla",
        lines: [
          "[excited] Awesome matching! Now let's test your memory.",
          "You'll get ten seconds to remember where each card is.",
          "Then they flip over, tap where you think each one is!",
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
        { text: "a robot", isCorrect: false },
        { text: "a hacker", isCorrect: false },
        { text: "your friend", isCorrect: false },
      ],
      praise: "Exactly - it proves it's YOU! ✓",
    },

    // - Recap · Concept 1 of 5 (What Is a Password?)
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "A password is a secret code that proves it's really YOU.",
      next: "making your password super strong",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Brilliant work, Cyber Hero!",
          "You just learned what a password really is.",
          "It's a secret code that proves it's really you.",
          "[excited] Next, let's make it super strong!",
        ],
      },
    },

    /* ─────────── BEAT 2 · LONG ─────────── */
    // 6 - Learn
    {
      type: "info",
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
          "[excited] Ooh, want to know a clever trick?",
          "The longer your key, the harder it is to crack!",
          "[excited] So glue three silly words together, like dragon, taco, comet!",
          "[laughs] Long, strong, and super easy to remember!",
        ],
      },
    },
    // 7 - Game: BUILD (Three Random Words)
    {
      type: "threeRandomWords",
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
        { id: "w-harbour", text: "harbour", category: "place" },
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
        tier2: "Try mixing categories - one animal, one object, one place. The combo is what makes it memorable AND strong.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time to build a password the Raccoon can't crack!",
          "Tap any three silly words from the wall.",
          "The longer and sillier, the stronger it gets!",
          "[warmly] Take your time, pick words you'll remember.",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Go on, tap any word you like to begin!"],
      },
    },
    // 8 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Tap the LONGEST password!",
      speedMs: 5000,
      choices: [
        { text: "cat", isCorrect: false },
        { text: "Tiger7", isCorrect: false },
        { text: "dragon-taco-comet", isCorrect: true },
        { text: "sun", isCorrect: false },
      ],
      praise: "Fast AND right - long is strong! ✓",
    },

    // - Recap · Concept 2 of 5 (Long Is Strong)
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "The longer your password, the harder it is to crack.",
      next: "mixing it up to really stump the Raccoon",
      emblem: "💪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Amazing! You're getting stronger already!",
          "You just learned that long passwords are strong passwords.",
          "Three random words make a key that's super hard to crack.",
          "[warmly] Now, let's mix things up!",
        ],
      },
    },

    /* ─────────── BEAT 3 · MIX ─────────── */
    // 9 - Learn
    {
      type: "info",
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
          "[excited] Now let's make that key SUPER tough!",
          "Mix it all up, big letters, little letters, numbers, and squiggly symbols!",
          "[nervous] A plain word like 'tiger'? The Raccoon gobbles that up in one bite.",
          "[excited] But scramble it like that, [laughs] and he's totally stumped!",
        ],
      },
    },
    // 10 - Game: REPAIR (Fix the Weak Password)
    {
      type: "passwordHospital",
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
            "'dragon' is one of everyone's favourite words to use. No capitals, no numbers, no symbols.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol", "addLetters"],
        },
        {
          id: "pat-123",
          password: "123",
          primaryReason: "too-short",
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
          "[excited] Uh oh! These passwords are sick! You're the cyber-doctor.",
          "First, work out what's WRONG with each one.",
          "Then use your tools to make it strong, watch the meter climb!",
          "[warmly] No rush, Doctor. Take your time.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Look at the patient. What's wrong with this password?"],
      },
    },
    // 11 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "the password 'tiger' is totally unbreakable - trust me!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Nice try, Raccoon! A plain word is easy to crack. ✓",
      nudge: "Look again - 'tiger' has no mix at all.",
    },

    // - Recap · Concept 3 of 5 (Mix It Up)
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned:
        "Mixing big letters, small letters, numbers and symbols makes a password tough.",
      next: "keeping your password secret",
      emblem: "🎨",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Wow! Look at you go!",
          "You just learned how to mix it all up.",
          "Big letters, little letters, numbers and symbols make a password really tough.",
          "[warmly] Next up, a super important one. Keeping it secret.",
        ],
      },
    },

    /* ─────────── BEAT 4 · SECRET ─────────── */
    // 12 - Learn
    {
      type: "info",
      title: "Keep It Secret",
      content:
        "A password only works if you're the ONLY one who knows it. Don't tell your best friend. Don't leave it where others can see. The only people who help are your parents or a trusted grown-up.",
      bullets: [
        "Never tell anyone - not even a best friend",
        "Don't write it where others can see",
        "Only a parent / trusted grown-up helps",
        "A shared secret isn't a secret any more",
      ],
      bulletIcons: ["🤐", "🙈", "👪", "🔓"],
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Okay, this is the MOST important part. Lean in close...",
          "[whispers] A password only works if you keep it secret.",
          "Don't tell your best friend. Don't leave it where anyone can peek!",
          "[warmly] The only person who ever helps is a grown-up you really trust. Deal?",
        ],
      },
    },
    // 13 - Game: DECIDE (What Would You Do?)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Your best friend says: 'Tell me your Roblox password so I can get you cool stuff!' What do you do?",
          choices: [
            { text: "Share it - they're my best friend", isSafe: false, consequence: "Even best friends shouldn't know. Accounts get hacked that way." },
            { text: "Say no - it's my secret", isSafe: true, consequence: "Perfect! Your password is YOUR secret - nobody else needs it." },
          ],
        },
        {
          setup: "You're worried you'll forget your password. What's the safest thing to do?",
          choices: [
            { text: "Write it on your desk so you see it", isSafe: false, consequence: "Now anyone walking past can read it!" },
            { text: "Ask a parent to help you remember", isSafe: true, consequence: "Great - a trusted grown-up is the safe way." },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] The Raccoon's set some sneaky traps for you.",
          "Read each one carefully. Think, what would YOU do?",
          "[excited] Then pick the safe path. You've got this!",
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
        { text: "My best friend", isCorrect: false },
        { text: "My whole class", isCorrect: false },
        { text: "Anyone who asks", isCorrect: false },
      ],
      praise: "Right - it stays your secret! ✓",
    },

    // - Recap · Concept 4 of 5 (Keep It Secret)
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Never share your password, not even with your best friend.",
      next: "spotting passwords that are too easy to guess",
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] You're doing so well, Cyber Hero.",
          "You just learned the golden rule, keep it secret.",
          "Never share your password, not even with your best friend.",
          "[excited] One more thing to master before the big battle!",
        ],
      },
    },

    /* ─────────── BEAT 5 · OBVIOUS ─────────── */
    // 15 - Learn
    {
      type: "info",
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
          "[excited] Let's get inside the sneaky Raccoon's head!",
          "[whispers] He guesses the easy stuff first. Your name? [nervous] Your birthday?",
          "And one-two-three-four-five-six? [laughs] That's the FIRST thing he tries!",
          "[excited] So pick something he'd NEVER guess, and outsmart him!",
        ],
      },
    },
    // 16 - Game: SORT (Why Is It Weak?)
    {
      type: "weakSorter",
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
        { text: "123", reasonId: "too-short", explanation: "Only 3 characters, and numbers in order - cracked in under a second." },
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
          "[excited] Detective time, Cyber Hero! Each password here is weak.",
          "Look closely and work out WHY it's weak.",
          "[warmly] Too short? A real word? About you? Take your time.",
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
        { text: "Dragon-Pickle9!", isCorrect: false },
        { text: "Comet$Turtle3", isCorrect: false },
        { text: "Waffle!Ninja6", isCorrect: false },
      ],
      praise: "Yep - 'password' is the #1 worst! ✓",
    },

    // - Recap · Concept 5 of 5 (Don't Pick the Obvious)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned:
        "Stay away from obvious passwords, not your name, your birthday, or 123456.",
      next: "one final challenge, then the big boss battle",
      emblem: "🕵️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Incredible! You've mastered all five secrets!",
          "You just learned to dodge the obvious ones. No names, no birthdays, no one-two-three.",
          "[warmly] You're ready, Cyber Hero.",
          "[excited] Time to show that Raccoon who's boss!",
        ],
      },
    },

    // 18 - Consolidation: "The Raccoon's Notebook" (fun mixed recap)
    {
      type: "cyberScanner",
      items: [
        { text: "password123", isStrong: false, explanation: "Obvious AND a common word - the Raccoon's favourite." },
        { text: "Comet-Dragon-Waffle7!", isStrong: true, explanation: "Three random words, mixed up - long and strong!" },
        { text: "qwerty", isStrong: false, explanation: "A keyboard row - the first pattern hackers try." },
        { text: "dragon-taco-comet", isStrong: true, explanation: "Three random words - long and hard to crack." },
        { text: "Sam2014", isStrong: false, explanation: "A name and a birthday - easy to guess about you." },
        { text: "MyL0ng_Pass!", isStrong: true, explanation: "Long and mixed - keeps the Raccoon out." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Final drill, Cyber Hero! Passwords will drift past.",
          "Quickly tap STRONG or WEAK for each one.",
          "[warmly] Trust everything you've learned, you're ready!",
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
          "[excited] WOW! Look at everything you learned this week!",
          "Your password is your secret key, make it nice and long,",
          "[excited] mix it ALL up, keep it super secret, and nothing the Raccoon could ever guess!",
          "[laughs] You did it, Cyber Hero! [excited] Now, time to claim your stickers!",
        ],
      },
    },

    // 22 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "password-protector", name: "Password Protector", icon: "🔐", description: "Built passwords the Raccoon can't crack." },
        { id: "key-master", name: "Key Master", icon: "🗝️", description: "Knows a password is your secret key." },
        { id: "secret-keeper", name: "Secret Keeper", icon: "🤐", description: "Stood firm when asked to share." },
      ],
    },

    // 23 - Completion
    { type: "completion" },
  ],

  /* ─────────── BESPOKE BOSS: The Cracking Machine (5 micro-games) ───────────
     Phase ids MATCH the shipped quiz boss (phase-length/mix/secret/obvious/
     final) so family dashboards stay continuous across the swap. */
  bossVault: {
    // ONE password is built across the whole fight:
    // dragon → dragon-taco-comet → Dragon-Taco-Comet7! → sealed at 400 years.
    wall: {
      id: "phase-length",
      label: "Build It LONG",
      intro: "My battering ram eats short passwords for breakfast!",
      crackTime: "3 DAYS",
      blocks: ["dragon", "taco", "comet"],
      coach: "Tap the word blocks - make it LONG!",
    },
    scrambler: {
      id: "phase-mix",
      label: "Mix It UP",
      intro: "Plain little letters? My decoder will chew through those in seconds!",
      crackTime: "87 YEARS",
      baseWord: "dragon-taco-comet",
      mixers: [
        { id: "mix-caps", label: "BIG letters", icon: "🔠", kind: "caps" },
        { id: "mix-num", label: "A number", icon: "🔢", kind: "number" },
        { id: "mix-sym", label: "A symbol", icon: "🔣", kind: "symbol" },
      ],
      coach: "Tap every mixer - mix it UP!",
    },
    cover: {
      id: "phase-secret",
      label: "Keep It SECRET",
      intro: "Type it in, type it in… I LOVE watching people type!",
      crackTime: "STILL 87 YEARS - AND SECRET",
      snoops: 3,
      openSecs: 3.2,
      explanation: "When his eye is open, cover your typing! In real life, shield the keypad with your hand - a password someone SAW isn't a secret any more.",
      coach: "Spy eye? Press and HOLD to cover!",
    },
    feed: {
      id: "phase-obvious",
      label: "Don't Be OBVIOUS",
      intro: "My Guess-o-Tron knows every password kids pick. Feed it!",
      crackTime: "214 YEARS",
      junk: [
        { id: "j-123456", text: "123456", note: "His number ONE favourite guess!" },
        { id: "j-password", text: "password", note: "He tries the word 'password' every single time!" },
        { id: "j-qwerty", text: "qwerty", note: "Keyboard letters in a row - guess number three!" },
      ],
      yours: "Dragon-Taco-Comet7!",
      coach: "Feed him the obvious ones - he can't guess YOURS!",
    },
    final: {
      id: "phase-final",
      label: "The 400-Year Lock",
      intro: "FINAL ROUND! Nobody out-passwords the CRACK-O-MATIC!",
      crackTime: "400 YEARS",
      forged: "Dragon-Taco-Comet7!",
      chargeSecs: 4,
      milestones: ["3 DAYS", "87 YEARS", "400 YEARS"],
      sweetTalk: "Beautiful password! Truly. Just whisper it to me once - I'll only use it for NICE things!",
      refuse: "Never! It's secret!",
      tellExplanation: "A password only works while it's secret - not even a very polite raccoon gets to hear it.",
      coach: "HOLD the golden button - charge to 400 years!",
    },
  },

  /* ─── Legacy 5-phase MCQ data (fallback if bossVault is ever cleared) ─── */
  bossPhases: [
    {
      kind: "mcq",
      id: "phase-length",
      label: "Length",
      announceText: "Round 1 - The Length Test!",
      announceTone: "cyan",
      questions: [
        { question: "Which is strongest because it's LONG?", answers: ["dragon-taco-comet", "cat", "Tiger7", "sun"], correctIndex: 0, explanation: "Three random words make a long, hard-to-crack password.", key: "boss-length-1" },
        { question: "What makes a password nice and long?", answers: ["Three random words", "3 letters", "1 number", "your initials"], correctIndex: 0, explanation: "Three random words make it long and strong!", key: "boss-length-2" },
        { question: "Which password is the LONGEST?", answers: ["Wizard-Penguin-Volcano", "dog", "Sun9", "ab"], correctIndex: 0, explanation: "More words make it longer - and longer is stronger.", key: "boss-length-3" },
        { question: "Which password is HARDEST to crack because it's so long?", answers: ["Kangaroo-Waffle-Comet-Pickle", "hi", "Cat3", "moon"], correctIndex: 0, explanation: "Four random words make it super long and super tough!", key: "boss-length-4" },
        { question: "Adding MORE words to your password makes it...", answers: ["Longer and stronger", "Weaker", "Easier to guess", "Shorter"], correctIndex: 0, explanation: "Every extra word makes it much harder to crack!", key: "boss-length-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-mix",
      label: "Mix",
      announceText: "Round 2 - Mix It Up!",
      announceTone: "blue",
      questions: [
        { question: "Which password MIXES all the types?", answers: ["Robot-Comet7!", "tigertiger", "12345678", "FOOTBALL"], correctIndex: 0, explanation: "Capitals, small letters, numbers AND symbols - a real mix.", key: "boss-mix-1" },
        { question: "What makes the STRONGEST password?", answers: ["Three random words, mixed up", "A short word with a number", "Your name and birthday", "1234"], correctIndex: 0, explanation: "Long, random and mixed - the toughest of all!", key: "boss-mix-2" },
        { question: "Which one has a good MIX?", answers: ["Cactus-Banjo8!", "banana", "ALLCAPSWORD", "0000"], correctIndex: 0, explanation: "Big and small letters, a number AND a symbol - a real mix.", key: "boss-mix-3" },
        { question: "Which one mixes big letters, small letters, numbers AND a symbol?", answers: ["Ninja-Waffle9!", "ninjawaffle", "NINJAWAFFLE", "99999999"], correctIndex: 0, explanation: "A real mix uses all four: capitals, small letters, numbers and symbols.", key: "boss-mix-4" },
        { question: "How do you make the word 'penguin' much stronger?", answers: ["Add more words, a capital, a number and a symbol", "Write it twice", "Make it ALL CAPITALS", "Add a 1 at the end"], correctIndex: 0, explanation: "Mix it up: more words plus capitals, numbers and symbols!", key: "boss-mix-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-secret",
      label: "Secret",
      announceText: "Round 3 - Keep It Secret!",
      announceTone: "gold",
      questions: [
        { question: "Your best friend asks for your password. You say...", answers: ["No - it's my secret", "Sure!", "Only half of it", "I'll write it down for you"], correctIndex: 0, explanation: "Passwords are always secret, even from friends.", key: "boss-secret-1" },
        { question: "Where should your password live?", answers: ["In your head (a parent can help)", "On a sticky note on your screen", "In the class group chat", "On your school bag"], correctIndex: 0, explanation: "A password only works if nobody else can see it.", key: "boss-secret-2" },
        { question: "Who is allowed to know your password?", answers: ["Just you (a parent can help)", "Your whole class", "Anyone who asks", "Your favourite YouTuber"], correctIndex: 0, explanation: "A password is only yours - keep it secret.", key: "boss-secret-3" },
        { question: "A teammate says 'share your password and we'll win the game!' You...", answers: ["Say no, it stays my secret", "Share it to win", "Share just half of it", "Type it in the chat"], correctIndex: 0, explanation: "No game is ever worth your password, keep it secret!", key: "boss-secret-4" },
        { question: "Someone is watching as you type your password. What do you do?", answers: ["Wait until they look away", "Type it in anyway", "Say it out loud", "Ask them to type it"], correctIndex: 0, explanation: "Never let anyone watch you type your secret password!", key: "boss-secret-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-obvious",
      label: "Nothing Obvious",
      announceText: "Round 4 - Nothing Obvious!",
      announceTone: "red",
      questions: [
        { question: "Which is the WORST password?", answers: ["password", "Dragon-Pickle9!", "Comet$Turtle3", "Waffle!Ninja6"], correctIndex: 0, explanation: "'password' is the most-guessed password in the world.", key: "boss-obvious-1" },
        { question: "Which should you NEVER use?", answers: ["Your birthday", "three random words", "a symbol", "a capital letter"], correctIndex: 0, explanation: "Birthdays are easy to guess about you.", key: "boss-obvious-2" },
        { question: "Which is too EASY to guess?", answers: ["123456", "Taco-Wizard5!", "Robot$Penguin8", "Volcano!Cactus3"], correctIndex: 0, explanation: "123456 is one of the most-guessed passwords ever.", key: "boss-obvious-3" },
        { question: "Which password would the Raccoon guess FIRST?", answers: ["qwerty", "Dragon-Comet-Waffle8!", "Turtle$Banjo3", "Ninja-Volcano9!"], correctIndex: 0, explanation: "'qwerty' is just keys in a row, the first thing hackers try!", key: "boss-obvious-4" },
        { question: "Why is your PET'S name a weak password?", answers: ["People who know you could guess it", "It is far too long", "It has no letters in it", "Pets do not have names"], correctIndex: 0, explanation: "Anyone who knows you could guess your pet's name!", key: "boss-obvious-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-final",
      label: "Final Showdown",
      announceText: "FINAL ROUND - Lock Him Out!",
      announceTone: "red",
      questions: [
        { question: "Pick the Raccoon-proof password:", answers: ["Comet$Dragon7Waffle!", "cat", "yourname2014", "123456"], correctIndex: 0, explanation: "Long, mixed, no plain words and nothing obvious.", key: "boss-final-1" },
        { question: "The Raccoon says 'just tell me ONE letter of your password.' You...", answers: ["Tell him nothing", "Tell one letter", "Tell him a hint", "Tell a friend instead"], correctIndex: 0, explanation: "Not one letter - your password stays completely secret.", key: "boss-final-2" },
        { question: "The Raccoon says 'I'll guess your pet's name!' Your password should...", answers: ["Have nothing about you in it", "Be your pet's name", "Be your birthday", "Be 'password'"], correctIndex: 0, explanation: "Keep personal things OUT - use random words instead.", key: "boss-final-3" },
        { question: "The Raccoon laughs 'I crack passwords all day, give up!' You...", answers: ["Use a long, mixed, random password he can't crack", "Use your own name", "Use 1234", "Give him a little hint"], correctIndex: 0, explanation: "A long, random, mixed password beats him every time!", key: "boss-final-4" },
        { question: "Pick the STRONGEST password of them all:", answers: ["Comet-Dragon-Waffle-Ninja7!", "dragon", "Dragon2016", "dragondragon"], correctIndex: 0, explanation: "Four random words PLUS a capital, number and symbol, unbeatable!", key: "boss-final-5" },
      ],
    },
  ],

  // Legacy flat fallback (used only if bossPhases is ever cleared).
  bossQuestions: {
    easy: [
      { question: "What is a password?", answers: ["A secret code to prove it's you", "A type of game", "A song", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in." },
      { question: "Which is strongest because it's LONG?", answers: ["dragon-taco-comet", "cat", "Tiger7", "sun"], correctIndex: 0, explanation: "Three random words make a long, hard-to-crack password." },
      { question: "What makes a password nice and long?", answers: ["Three random words", "3 letters", "1 number", "your initials"], correctIndex: 0, explanation: "Three random words make it long and strong!" },
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
    0: { adam: { mood: "excited", message: "Mission 1 - let's go, Cyber Hero!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Alert! The Raccoon's after our passwords - let's stop him!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "A password is your secret key." }, layla: null }, // learn: key
    4: { adam: null, layla: { mood: "excited", message: "Match the cyber words!" } }, // game: match
    5: { adam: { mood: "thumbsup", message: "Prove it - finish the rule!" }, layla: null }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "You did it! One secret down - keep going!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Long beats clever every time." } }, // learn: long
    8: { adam: { mood: "excited", message: "Pick three random words!" }, layla: null }, // game: build
    9: { adam: null, layla: { mood: "excited", message: "Quick - tap the longest!" } }, // prove: speed
    10: { adam: { mood: "thumbsup", message: "Stronger every round - nice!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Now let's MIX it up." }, layla: null }, // learn: mix
    12: { adam: { mood: "excited", message: "Heal these weak passwords!" }, layla: null }, // game: repair
    13: { adam: null, layla: { mood: "worried", message: "The Raccoon's telling fibs - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Three secrets mastered - amazing!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Keep your password secret." } }, // learn: secret
    16: { adam: { mood: "curious", message: "Pick the safe choice." }, layla: null }, // game: decide
    17: { adam: null, layla: { mood: "thumbsup", message: "Who should know it? You decide." } }, // prove: recall
    18: { adam: { mood: "thumbsup", message: "Almost there, Cyber Hero!" }, layla: null }, // recap 4
    19: { adam: { mood: "worried", message: "Never pick the obvious ones." }, layla: null }, // learn: obvious
    20: { adam: { mood: "thinking", message: "Tell me WHY each one is weak." }, layla: null }, // game: sort
    21: { adam: { mood: "excited", message: "Which would he guess first?" }, layla: null }, // prove: recall
    22: { adam: null, layla: { mood: "excited", message: "All five! You're ready for the boss!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Rip the weak ones from his notebook!" } }, // consolidation
    24: { adam: { mood: "worried", message: "Boss battle - lock him out!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the Raccoon bounce right off!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to your Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Password Protector badge earned!" }, layla: null }, // completion
  },
};

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
    // 0 — OPENING VIDEO: "The Break-In" (Raccoon cracks a weak password)
    { type: "video", videoPlaceholder: "Week 1: The Break-In", videoSrc: "/videos/module-01-intro.mp4" },

    // 1 — Mission brief
    {
      type: "mission",
      objectives: [
        "Find out what a password really is",
        "Build a password the Raccoon can't crack",
        "Beat the Raccoon and lock him out for good",
      ],
    },

    /* ─────────── BEAT 1 · KEY ─────────── */
    // 2 — Learn
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
      narration: {
        speaker: "adam",
        lines: [
          "A password is your secret key.",
          "It tells the computer it's really YOU.",
          "A weak key? The Raccoon snaps it.",
          "A strong key keeps him locked out.",
        ],
      },
    },
    // 3 — Game: MATCH (Cyber Words)
    {
      type: "memoryMatch",
      pairs: [
        { term: "Password", match: "Your secret code", colour: "#00e5ff" },
        { term: "Key", match: "Opens a lock", colour: "#7eff97" },
        { term: "Hacker", match: "Tries to break in", colour: "#ff5fb3" },
        { term: "Secret", match: "Only you know it", colour: "#ffd158" },
      ],
    },
    // 4 — Prove: FINISH
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

    /* ─────────── BEAT 2 · LONG ─────────── */
    // 5 — Learn
    {
      type: "info",
      title: "Long Is Strong",
      content:
        "The longer your password, the harder it is to crack. The easiest trick? Stick THREE RANDOM WORDS together - like otter-rocket-mango. Long, strong, AND easy to remember!",
      bullets: [
        "Longer = stronger",
        "Three random words make a great password",
        "Easy to remember, hard to crack",
        "Aim for 8 letters or more",
      ],
      narration: {
        speaker: "layla",
        lines: [
          "The longer the password, the stronger it is.",
          "Try three random words.",
          "Like otter... rocket... mango!",
          "Long, strong, and easy to remember.",
        ],
      },
    },
    // 6 — Game: BUILD (Three Random Words)
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
      ],
      hints: {
        tier1: "Pick any 3 words - they don't need to make sense. The longer your passphrase, the harder it is to crack.",
        tier2: "Try mixing categories - one animal, one object, one place. The combo is what makes it memorable AND strong.",
      },
    },
    // 7 — Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Tap the LONGEST password!",
      speedMs: 5000,
      choices: [
        { text: "cat", isCorrect: false },
        { text: "Tiger7", isCorrect: false },
        { text: "otter-rocket-mango", isCorrect: true },
        { text: "sun", isCorrect: false },
      ],
      praise: "Fast AND right - long is strong! ✓",
    },

    /* ─────────── BEAT 3 · MIX ─────────── */
    // 8 — Learn
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
      narration: {
        speaker: "adam",
        lines: [
          "Mix it up to make it tough.",
          "Big letters, small letters, numbers, symbols.",
          "A plain word like 'tiger'? Too easy.",
          "Mix it, and the Raccoon's stuck.",
        ],
      },
    },
    // 9 — Game: REPAIR (Fix the Weak Password)
    {
      type: "passwordHospital",
      reasons: [
        { id: "common-word", label: "Plain word - no mix" },
        { id: "too-short", label: "Too short" },
        { id: "personal", label: "Has a name" },
        { id: "keyboard", label: "Keyboard row" },
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
          id: "pat-sunshine",
          password: "sunshine",
          primaryReason: "common-word",
          chartNote: "Patient #2 - lovely word, zero mix",
          diagnosisExplanation:
            "'sunshine' has no mix. Add capitals, numbers and symbols to toughen it right up.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol"],
        },
      ],
      hints: {
        diagnosisTier1: "Is it a plain word you'd find in a book? Then it needs a MIX.",
        diagnosisTier2: "No capitals, numbers or symbols = 'Plain word - no mix'.",
        repairTier1: "Each fix does one thing. Watch the strength meter climb.",
        repairTier2: "The big wins: mix the case, add a number, add a symbol.",
      },
    },
    // 10 — Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "tiger is totally unbreakable - trust me!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Nice try, Raccoon! A plain word is easy to crack. ✓",
      nudge: "Look again - 'tiger' has no mix at all.",
    },

    /* ─────────── BEAT 4 · SECRET ─────────── */
    // 11 — Learn
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
      narration: {
        speaker: "layla",
        lines: [
          "A password only works if it's secret.",
          "Don't tell your best friend.",
          "Don't leave it where people can see.",
          "Only a grown-up you trust helps.",
        ],
      },
    },
    // 12 — Game: DECIDE (What Would You Do?)
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
    },
    // 13 — Prove: RECALL
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

    /* ─────────── BEAT 5 · OBVIOUS ─────────── */
    // 14 — Learn
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
      narration: {
        speaker: "adam",
        lines: [
          "The Raccoon guesses the obvious first.",
          "Your name? Your birthday? Too easy.",
          "123456? He tries that first.",
          "Pick something he'd never guess.",
        ],
      },
    },
    // 15 — Game: SORT (Why Is It Weak?)
    {
      type: "weakSorter",
      reasons: [
        { id: "too-short", label: "Too short", example: "abc" },
        { id: "common-word", label: "Common word", example: "football" },
        { id: "personal", label: "Has your name or birthday", example: "Sam2014" },
        { id: "keyboard", label: "Keyboard pattern", example: "qwerty" },
      ],
      items: [
        { text: "abc", reasonId: "too-short", explanation: "Only 3 letters - way under the 8-character rule." },
        { text: "football", reasonId: "common-word", explanation: "A word from the dictionary - hackers try common words first." },
        { text: "Sam2014", reasonId: "personal", explanation: "A name and a birthday - the easiest things to guess about you." },
        { text: "qwerty", reasonId: "keyboard", explanation: "These letters sit in a row on the keyboard - the FIRST pattern hackers try." },
        { text: "123", reasonId: "too-short", explanation: "Only 3 characters, and numbers in order - cracked in under a second." },
        { text: "dragon", reasonId: "common-word", explanation: "A popular word - 'dragon' is in every hacker's top-100 list." },
        { text: "Maya0511", reasonId: "personal", explanation: "A name plus what looks like a date - quick to guess if someone knows you." },
        { text: "asdfgh", reasonId: "keyboard", explanation: "Another row of keys in order - just like qwerty." },
      ],
      hints: {
        tier1: "Look at WHY it's weak: too short, a real word, about you, or just keyboard keys in a row?",
        tier2: "Count the letters first. Under 8 = 'Too short'. Then check if it's a word you'd find in a book.",
        tier3: "'too-short' = under 8 chars. 'common-word' = a real word. 'personal' = a name/birthday. 'keyboard' = letters in a straight line.",
      },
    },
    // 16 — Prove: RECALL (which would the Raccoon guess first)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which password would a hacker guess FIRST?",
      choices: [
        { text: "password", isCorrect: true },
        { text: "Kettle-Jungle-7!", isCorrect: false },
        { text: "Otter$Rocket9", isCorrect: false },
        { text: "Mango!Lantern2", isCorrect: false },
      ],
      praise: "Yep - 'password' is the #1 worst! ✓",
    },

    // 17 — Consolidation: "The Raccoon's Notebook" (fun mixed recap)
    {
      type: "cyberScanner",
      items: [
        { text: "password123", isStrong: false, explanation: "Obvious AND a common word - the Raccoon's favourite." },
        { text: "Tr0pic4l$un!", isStrong: true, explanation: "Long, with capitals, numbers and symbols. Strong!" },
        { text: "qwerty", isStrong: false, explanation: "A keyboard row - the first pattern hackers try." },
        { text: "otter-rocket-mango", isStrong: true, explanation: "Three random words - long and hard to crack." },
        { text: "Sam2014", isStrong: false, explanation: "A name and a birthday - easy to guess about you." },
        { text: "MyL0ng_Pass!", isStrong: true, explanation: "Long and mixed - keeps the Raccoon out." },
      ],
    },

    // 18 — BOSS BATTLE (5 phases)
    { type: "bossBattle" },

    // 19 — CLOSING VIDEO: "The Bounce" (Raccoon attacks again, bounces off)
    { type: "video", videoPlaceholder: "Week 1: The Bounce", videoSrc: "/videos/module-01-outro.mp4" },

    // 20 — Mission Debrief (consolidate by concept)
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
          "Look at everything you learned this week!",
          "A password is your secret key.",
          "Make it long, and mix it up.",
          "Keep it secret, and nothing obvious.",
          "Time to claim your stickers!",
        ],
      },
    },

    // 21 — Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "password-protector", name: "Password Protector", icon: "🔐", description: "Built passwords the Raccoon can't crack." },
        { id: "key-master", name: "Key Master", icon: "🗝️", description: "Knows a password is your secret key." },
        { id: "secret-keeper", name: "Secret Keeper", icon: "🤐", description: "Stood firm when asked to share." },
      ],
    },

    // 22 — Completion
    { type: "completion" },
  ],

  /* ─────────── 5-PHASE BOSS: The Crack-Proof Vault ─────────── */
  bossPhases: [
    {
      kind: "mcq",
      id: "phase-length",
      label: "Length",
      announceText: "Round 1 - The Length Test!",
      announceTone: "cyan",
      questions: [
        { question: "Which is strongest because it's LONG?", answers: ["otter-rocket-mango", "cat", "Tiger7", "sun"], correctIndex: 0, explanation: "Three random words make a long, hard-to-crack password.", key: "boss-length-1" },
        { question: "A password should be at least how long?", answers: ["8 characters", "3 letters", "1 number", "your initials"], correctIndex: 0, explanation: "8+ characters is the safe minimum.", key: "boss-length-2" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-mix",
      label: "Mix",
      announceText: "Round 2 - Mix It Up!",
      announceTone: "blue",
      questions: [
        { question: "Which password MIXES all the types?", answers: ["Tr0pic4l$un!", "tigertiger", "12345678", "FOOTBALL"], correctIndex: 0, explanation: "Capitals, small letters, numbers AND symbols - a real mix.", key: "boss-mix-1" },
        { question: "Why is 'Tr0pic4l$un!' stronger than 'tropicalsun'?", answers: ["It mixes capitals, numbers and symbols", "It's shorter", "It's a real word", "No reason"], correctIndex: 0, explanation: "A mix of character types is much harder to crack.", key: "boss-mix-2" },
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
      ],
    },
    {
      kind: "mcq",
      id: "phase-obvious",
      label: "Nothing Obvious",
      announceText: "Round 4 - Nothing Obvious!",
      announceTone: "red",
      questions: [
        { question: "Which is the WORST password?", answers: ["password", "Kettle-Jungle-7!", "Otter$Rocket9", "Mango!Lantern2"], correctIndex: 0, explanation: "'password' is the most-guessed password in the world.", key: "boss-obvious-1" },
        { question: "Which should you NEVER use?", answers: ["Your birthday", "three random words", "a symbol", "a capital letter"], correctIndex: 0, explanation: "Birthdays are easy to guess about you.", key: "boss-obvious-2" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-final",
      label: "Final Showdown",
      announceText: "FINAL ROUND - Lock Him Out!",
      announceTone: "red",
      questions: [
        { question: "Pick the Raccoon-proof password:", answers: ["Otter$Rocket9Mango!", "cat", "yourname2014", "123456"], correctIndex: 0, explanation: "Long, mixed, no plain words and nothing obvious.", key: "boss-final-1" },
        { question: "The Raccoon says 'just tell me ONE letter of your password.' You...", answers: ["Tell him nothing", "Tell one letter", "Tell him a hint", "Tell a friend instead"], correctIndex: 0, explanation: "Not one letter - your password stays completely secret.", key: "boss-final-2" },
      ],
    },
  ],

  // Legacy flat fallback (used only if bossPhases is ever cleared).
  bossQuestions: {
    easy: [
      { question: "What is a password?", answers: ["A secret code to prove it's you", "A type of game", "A song", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in." },
      { question: "Which is strongest because it's LONG?", answers: ["otter-rocket-mango", "cat", "Tiger7", "sun"], correctIndex: 0, explanation: "Three random words make a long, hard-to-crack password." },
      { question: "A password should be at least how long?", answers: ["8 characters", "3 letters", "1 number", "your initials"], correctIndex: 0, explanation: "8+ characters is the safe minimum." },
    ],
    medium: [
      { question: "Which password MIXES all the types?", answers: ["Tr0pic4l$un!", "tigertiger", "12345678", "FOOTBALL"], correctIndex: 0, explanation: "Capitals, small letters, numbers AND symbols." },
      { question: "Your best friend asks for your password. You say...", answers: ["No - it's my secret", "Sure!", "Only half", "I'll write it down"], correctIndex: 0, explanation: "Passwords are always secret, even from friends." },
      { question: "Which is the WORST password?", answers: ["password", "Kettle-Jungle-7!", "Otter$Rocket9", "Mango!Lantern2"], correctIndex: 0, explanation: "'password' is the most-guessed password in the world." },
    ],
    hard: [
      { question: "Pick the Raccoon-proof password:", answers: ["Otter$Rocket9Mango!", "cat", "yourname2014", "123456"], correctIndex: 0, explanation: "Long, mixed, nothing obvious." },
      { question: "The Raccoon says 'just tell me ONE letter.' You...", answers: ["Tell him nothing", "Tell one letter", "Tell a hint", "Tell a friend"], correctIndex: 0, explanation: "Your password stays completely secret." },
      { question: "Which should you NEVER use in a password?", answers: ["Your birthday", "A symbol", "A capital letter", "A random word"], correctIndex: 0, explanation: "Birthdays are easy to guess about you." },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Mission 1 - let's go, Cyber Hero!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } },
    2: { adam: { mood: "thinking", message: "A password is your secret key." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Match the cyber words!" } },
    4: { adam: { mood: "thumbsup", message: "Prove it - finish the rule!" }, layla: null },
    5: { adam: null, layla: { mood: "curious", message: "Long beats clever every time." } },
    6: { adam: { mood: "excited", message: "Pick three random words!" }, layla: null },
    7: { adam: null, layla: { mood: "excited", message: "Quick - tap the longest!" } },
    8: { adam: { mood: "thinking", message: "Now let's MIX it up." }, layla: null },
    9: { adam: { mood: "excited", message: "Heal these weak passwords!" }, layla: null },
    10: { adam: null, layla: { mood: "worried", message: "The Raccoon's telling fibs - catch him!" } },
    11: { adam: null, layla: { mood: "thinking", message: "Keep your password secret." } },
    12: { adam: { mood: "curious", message: "Pick the safe choice." }, layla: null },
    13: { adam: null, layla: { mood: "thumbsup", message: "Who should know it? You decide." } },
    14: { adam: { mood: "worried", message: "Never pick the obvious ones." }, layla: null },
    15: { adam: null, layla: { mood: "thinking", message: "Tell me WHY each one is weak." } },
    16: { adam: { mood: "excited", message: "Which would he guess first?" }, layla: null },
    17: { adam: null, layla: { mood: "excited", message: "Rip the weak ones from his notebook!" } },
    18: { adam: { mood: "worried", message: "Boss battle - lock him out!" }, layla: null },
    19: { adam: null, layla: { mood: "excited", message: "Watch the Raccoon bounce right off!" } },
    20: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null },
    21: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to your Cyber HQ!" } },
    22: { adam: { mood: "thumbsup", message: "Password Protector badge earned!" }, layla: null },
  },
};

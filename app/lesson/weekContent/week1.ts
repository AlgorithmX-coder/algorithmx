import type { WeekContent } from "./types";

/**
 * Week 1 - data-driven content.
 *
 * Curve rule: every concept is TAUGHT before it is TESTED. Concepts
 * outside Week 1's scope (password managers, two-step authentication,
 * hashing, etc.) are intentionally absent and belong in later weeks.
 */
export const WEEK_1: WeekContent = {
  weekNumber: 1,
  title: "Passwords: The Secret Code",
  topic: "passwords",
  badgeName: "Password Protector",
  badgeIcon: "🔐",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 1: PASSWORDS", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Welcome, Cyber Hero! Ready for Mission 1?", sound: "lessonStart", duration: 4500 },
    { character: "raccoon", characterMood: "idle", text: "\"Haha! Your password is 'password123'? Too easy - I'm in!\"", bg: "danger", textColour: "#c084fc", sound: "bossRoar", duration: 5000 },
    { character: "adam", characterMood: "worried", text: "The Hacker Raccoon is cracking weak passwords! We need to teach kids how to make them STRONG.", bg: "danger", duration: 5000 },
    { character: "layla", characterMood: "thinking", text: "A strong password mixes letters, numbers, and symbols - and it's long enough to slow down any hacker.", duration: 5000 },
    { character: "adam", characterMood: "thumbsup", text: "Today we'll build passwords the Raccoon can't crack. Let's go!", sound: "select", duration: 5000 },
    { text: "MISSION START! 🔐", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    // 0
    { type: "video", videoPlaceholder: "Week 1: Passwords intro video", videoSrc: "/videos/module-01-intro.mp4" },

    // 1
    {
      type: "mission",
      objectives: [
        "Find out what a password really is",
        "Learn what makes a password strong",
        "Spot bad passwords a hacker could crack",
      ],
    },

    // 2 - core teaching: what + four strength rules
    {
      type: "info",
      title: "What Is a Password?",
      content:
        "A password is a secret code that only YOU know. It proves to the computer that it's really you trying to log in. The stronger the code, the harder the Hacker Raccoon has to work.",
      bullets: [
        "Keep it secret - even from friends",
        "Longer is stronger (8+ characters)",
        "Mix uppercase, lowercase, numbers, and symbols",
        "Don't use your name, birthday, or 'password'",
      ],
      narration: {
        speaker: "adam",
        lines: [
          "A password is your secret code.",
          "It tells the computer it's really YOU.",
          "Keep it secret - even from your best friend.",
          "Long passwords are stronger than short ones.",
          "Mix big letters, small letters, numbers and symbols.",
        ],
      },
    },

    // 3 - first practice: classify (everything tested has been taught)
    {
      type: "cyberScanner",
      items: [
        { text: "password123", isStrong: false, explanation: "Too common and predictable" },
        { text: "Tr0pic4l$unR1se!", isStrong: true, explanation: "Mix of upper, lower, numbers, and symbols" },
        { text: "qwerty", isStrong: false, explanation: "Keyboard pattern - easy to guess" },
        { text: "MyN@me1sJ0hn!", isStrong: true, explanation: "Good length with mixed characters" },
        { text: "ilovecats", isStrong: false, explanation: "Common phrase, no numbers or symbols" },
        { text: "G4m3r#Pr0!", isStrong: true, explanation: "Short but has all character types" },
        { text: "123456789", isStrong: false, explanation: "Just numbers in order" },
        { text: "Cyb3r$h13ld_2024!", isStrong: true, explanation: "Long, random, all character types" },
        { text: "football", isStrong: false, explanation: "Dictionary word, easy to crack" },
        { text: "X#9kL2$mP!", isStrong: true, explanation: "Random characters, very strong" },
      ],
    },

    // 4 - build
    { type: "passwordLab" },

    // 5 - NEW: Three Random Words Builder. Demonstrates the
    // length-beats-complexity insight via tactile play - tap 3 words
    // from a wall, watch the strength meter rise, swap freely.
    // Variety bonus when 3 different categories chosen.
    {
      type: "threeRandomWords",
      slots: 3,
      words: [
        // animals
        { id: "w-tiger", text: "tiger", category: "animal" },
        { id: "w-otter", text: "otter", category: "animal" },
        { id: "w-falcon", text: "falcon", category: "animal" },
        { id: "w-dolphin", text: "dolphin", category: "animal" },
        { id: "w-llama", text: "llama", category: "animal" },
        { id: "w-bumblebee", text: "bumblebee", category: "animal" },
        // objects
        { id: "w-kettle", text: "kettle", category: "object" },
        { id: "w-rocket", text: "rocket", category: "object" },
        { id: "w-lantern", text: "lantern", category: "object" },
        { id: "w-compass", text: "compass", category: "object" },
        { id: "w-trumpet", text: "trumpet", category: "object" },
        { id: "w-puzzle", text: "puzzle", category: "object" },
        // places
        { id: "w-mountain", text: "mountain", category: "place" },
        { id: "w-island", text: "island", category: "place" },
        { id: "w-meadow", text: "meadow", category: "place" },
        { id: "w-jungle", text: "jungle", category: "place" },
        { id: "w-harbour", text: "harbour", category: "place" },
        { id: "w-volcano", text: "volcano", category: "place" },
        // foods
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

    // 6 - flagship synthesis. Replaces the legacy CrackTheCode rings
    // with the Password Vault scene: 5 glowing locks on a cinematic
    // vault door, one per password rule (length / mix / no personal /
    // not common / secret). Tap a lock to focus-zoom the camera, get
    // the challenge in a 2D overlay panel, wrong answers teach via
    // WrongAnswerPanel, all 5 active opens the vault. This is the
    // commercial-quality reusable scene template the brief asks for.
    {
      type: "passwordVault",
      guidance: {
        intro: "Tap a glowing lock to begin.",
        progress: "Keep going - each rule opens a lock!",
        complete: "VAULT OPEN - the Raccoon can't get in!",
      },
      locks: [
        {
          id: "length",
          ruleLabel: "LENGTH",
          icon: "📏",
          prompt: "Which password is LONG enough?",
          speaker: "adam",
          choices: [
            { text: "cat", isCorrect: false, explanation: "Only 3 letters - way under the 8-character rule." },
            { text: "Tiger!7", isCorrect: false, explanation: "Only 7 characters. The rule is 8 OR MORE." },
            { text: "MyL0ng_Pass!", isCorrect: true, explanation: "" },
            { text: "abc", isCorrect: false, explanation: "Just 3 letters - cracked in less than a second." },
          ],
        },
        {
          id: "mix",
          ruleLabel: "MIX",
          icon: "🎨",
          prompt: "Which password mixes ALL the character types?",
          speaker: "layla",
          choices: [
            { text: "tigertigertiger", isCorrect: false, explanation: "All lowercase - no numbers, no symbols, no capitals." },
            { text: "Tr0pic4l$un!", isCorrect: true, explanation: "" },
            { text: "12345678", isCorrect: false, explanation: "Just numbers - no letters and no symbols." },
            { text: "ABCDEFGHIJ", isCorrect: false, explanation: "All capitals - no lowercase, no numbers, no symbols." },
          ],
        },
        {
          id: "personal",
          ruleLabel: "PERSONAL",
          icon: "🪪",
          prompt: "Which password does NOT use personal info?",
          speaker: "adam",
          choices: [
            { text: "Sam2014!", isCorrect: false, explanation: "That's a name and what looks like a birth year - easy for anyone who knows you." },
            { text: "Maya0511", isCorrect: false, explanation: "A name plus a date - hackers try names and birthdays first." },
            { text: "Volcano$Mango7", isCorrect: true, explanation: "" },
            { text: "Smith123", isCorrect: false, explanation: "That looks like a surname plus '123' - very easy to guess." },
          ],
        },
        {
          id: "common",
          ruleLabel: "COMMON",
          icon: "📕",
          prompt: "Which password is NOT in a hacker's top-guess list?",
          speaker: "layla",
          choices: [
            { text: "password", isCorrect: false, explanation: "Literally the #1 most-guessed password in the world." },
            { text: "qwerty", isCorrect: false, explanation: "Keyboard row in order - hackers try this in the first 5 attempts." },
            { text: "Compass!Otter9", isCorrect: true, explanation: "" },
            { text: "football", isCorrect: false, explanation: "Common dictionary word - top-100 every year." },
          ],
        },
        {
          id: "secret",
          ruleLabel: "SECRET",
          icon: "🤐",
          prompt: "Who should know your password?",
          speaker: "adam",
          choices: [
            { text: "Just my best friend", isCorrect: false, explanation: "Even best friends shouldn't know. Accounts get hacked that way." },
            { text: "Anyone who asks nicely", isCorrect: false, explanation: "Never. People who really need access ask a grown-up - not you." },
            { text: "Only me (and a parent)", isCorrect: true, explanation: "" },
            { text: "My whole class", isCorrect: false, explanation: "That's not a secret any more - that's a public announcement!" },
          ],
        },
      ],
    },

    // 7 - reworked sorter. CyberScanner already covers strong/weak
    // classification, so this screen now teaches the *reasons* a
    // password is weak. Each card is a weak password; the child taps
    // the reason it's weak from 4 buttons. Wrong answer pauses with a
    // specific, kid-friendly explanation.
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
        { text: "football", reasonId: "common-word", explanation: "It's a word from the dictionary - hackers try every common word first." },
        { text: "Sam2014", reasonId: "personal", explanation: "It looks like a name and a birthday - the easiest things for someone to guess about you." },
        { text: "qwerty", reasonId: "keyboard", explanation: "These letters sit in a row on the keyboard - the FIRST pattern hackers try." },
        { text: "123", reasonId: "too-short", explanation: "Only 3 characters AND they're numbers in order - the Raccoon cracks this in less than a second." },
        { text: "dragon", reasonId: "common-word", explanation: "It's a popular word - 'dragon' is in every hacker's top-100 password list." },
        { text: "Maya0511", reasonId: "personal", explanation: "A name plus four numbers that look like a date - someone who knows you could guess this fast." },
        { text: "asdfgh", reasonId: "keyboard", explanation: "Another row of keys in order - just like qwerty, a classic keyboard pattern." },
      ],
      hints: {
        tier1: "Look at WHY it's weak: is it too short, a real word, about you, or just keyboard keys in a row?",
        tier2: "Count the letters first. If it's under 8 - that's 'Too short'. Then check if it's a word you'd find in a book.",
        tier3: "Each reason has a clear sign. 'too-short' = fewer than 8 characters. 'common-word' = a real English word. 'personal' = a name or numbers that look like a birthday. 'keyboard' = letters in a straight line on the keyboard.",
      },
    },

    // 8 - Password Hospital. Moves the child from RECOGNITION
    // (WeakSorter directly above) to CONSTRUCTION. Same reason ids as
    // WeakSorter so analytics aggregations are consistent. Curriculum
    // discipline holds: no 2FA, no password managers - every fix
    // action maps to a rule already taught on screen 2.
    {
      type: "passwordHospital",
      reasons: [
        { id: "too-short", label: "Too short" },
        { id: "common-word", label: "Common word" },
        { id: "personal", label: "Has name / birthday" },
        { id: "keyboard", label: "Keyboard pattern" },
      ],
      patients: [
        {
          id: "pat-1",
          password: "abc",
          primaryReason: "too-short",
          chartNote: "Patient #1 - admitted critically short",
          diagnosisExplanation: "Only 3 characters. The 8-character rule isn't optional - shorter passwords are cracked in seconds.",
          recommendedActions: ["addLetters", "addNumber", "addSymbol"],
        },
        {
          id: "pat-2",
          password: "football",
          primaryReason: "common-word",
          chartNote: "Patient #2 - found in the top-100 password list",
          diagnosisExplanation: "Hackers try common dictionary words first. 'football' is one of the top guesses every year.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol", "addLetters"],
        },
        {
          id: "pat-3",
          password: "qwerty",
          primaryReason: "keyboard",
          chartNote: "Patient #3 - keyboard run from the home row",
          diagnosisExplanation: "Those letters sit in a row on the keyboard. It's the FIRST pattern any hacker tries.",
          recommendedActions: ["scramble", "addLetters", "mixCase", "addSymbol"],
        },
        {
          id: "pat-4",
          password: "Sam2014",
          primaryReason: "personal",
          chartNote: "Patient #4 - name plus a year",
          diagnosisExplanation: "It's a name and what looks like a birth year. Anyone who knows you could guess this in a few tries.",
          recommendedActions: ["removePersonal", "addLetters", "addSymbol"],
        },
        {
          id: "pat-5",
          password: "123",
          primaryReason: "too-short",
          chartNote: "Patient #5 - tiny AND just numbers",
          diagnosisExplanation: "Only 3 characters, and they're numbers in order. Cracked in less than a second.",
          recommendedActions: ["addLetters", "addSymbol", "mixCase"],
        },
        {
          id: "pat-6",
          password: "dragon",
          primaryReason: "common-word",
          chartNote: "Patient #6 - popular word, no extras",
          diagnosisExplanation: "'dragon' is everyone's favourite word to use. No upper case, no numbers, no symbols.",
          recommendedActions: ["mixCase", "addNumber", "addSymbol", "addLetters"],
        },
      ],
      hints: {
        diagnosisTier1: "Look closely - does it have letters in a row, real words, parts of someone's name, or is it just very short?",
        diagnosisTier2: "Count characters. Under 8 = Too short. Real word you'd find in a book = Common word. Name + year = Has name/birthday. Letters in a row on the keyboard = Keyboard pattern.",
        repairTier1: "Each fix does ONE thing. Use the green check on the patient card to see what it still needs.",
        repairTier2: "The big wins are: adding length, adding a symbol, mixing case, and removing names. Try each one and watch the strength meter.",
      },
    },

    // 9 - uniqueness teaching (lands BEFORE Golden Rules so "UNIQUE" isn't a surprise)
    {
      type: "info",
      title: "One Password, One Account",
      content:
        "Imagine you have ONE key that opens your house, your locker AND your bike lock. If a thief steals that key, they can open EVERYTHING. Passwords work the same way - if you use the same one for Roblox, your email and your school account, a hacker who steals one gets them all.",
      bullets: [
        "Use a DIFFERENT password for every account",
        "If you reuse passwords, one hack can become many hacks",
        "Each password should be strong AND different",
        "Ask a parent to help you keep track",
      ],
      narration: {
        speaker: "layla",
        lines: [
          "Imagine ONE key opens your house AND your bike.",
          "If a thief steals it, they open both!",
          "Passwords are the same.",
          "Use a DIFFERENT one for every account.",
          "If one gets stolen, the others stay safe.",
        ],
      },
    },

    // 10 - NEW: Account Rescue. Practical uniqueness drill right after
    // the teaching screen above. The Raccoon hacked one of 3 accounts
    // sharing the same password; the child assigns a different new
    // password to each. Duplicate picks are blocked at assignment time.
    {
      type: "accountRescue",
      sharedPassword: "Dragon2014",
      leakedAccountId: "acc-roblox",
      accounts: [
        { id: "acc-roblox", label: "Roblox", icon: "🎮" },
        { id: "acc-school", label: "School", icon: "📚" },
        { id: "acc-email", label: "Email", icon: "✉️" },
      ],
      passwordBank: [
        { id: "pw-1", text: "Tiger#Mountain42" },
        { id: "pw-2", text: "Cookie!Lantern9" },
        { id: "pw-3", text: "Otter$Rocket27" },
        { id: "pw-4", text: "Mango_Compass85" },
        { id: "pw-5", text: "Falcon&Jungle13" },
      ],
      hints: {
        tier1: "Every account needs its OWN password. Pick a different one from the bank for each account.",
        tier2: "Look closely - one password can only be used by ONE account. If it's already in use, find another.",
      },
    },

    // 11 - recap (all five rules have now been taught)
    {
      type: "info",
      title: "The 5 Golden Rules",
      content: "Follow these and the Hacker Raccoon can never get in:",
      bullets: [
        "Keep it SECRET - never share passwords",
        "Make it LONG - 8 characters or more",
        "Make it MIXED - letters, numbers, symbols",
        "Make it UNIQUE - different for every account",
        "NEVER use your name, birthday, or 'password'",
      ],
      narration: {
        speaker: "adam",
        lines: [
          "Time to remember the five Golden Rules!",
          "One - keep it SECRET. Never share it.",
          "Two - make it LONG. Eight characters or more.",
          "Three - MIX letters, numbers and symbols.",
          "Four - make it UNIQUE for every account.",
          "Five - never use your name, birthday or the word 'password'.",
        ],
      },
    },

    // 12 - phishing teaching (lands BEFORE SpamBlaster)
    {
      type: "info",
      title: "Watch Out for Phishing",
      content:
        "Phishing (say it like 'fishing') is when a hacker sends a FAKE message that tries to trick you into giving away your password or clicking a bad link. The Hacker Raccoon is great at this - he pretends to be your school, a game, or even a free-prize website. Real schools and real games NEVER ask for your password in a message.",
      bullets: [
        "If a message offers a free prize - it's bait",
        "If a message says 'URGENT' and demands your password - it's bait",
        "If a message comes from someone you don't know - be careful",
        "When in doubt, show a parent",
      ],
      narration: {
        speaker: "layla",
        lines: [
          "Phishing sounds like 'fishing' - and it works the same way.",
          "A hacker drops bait. Hoping you bite.",
          "Free prize? Bait.",
          "'URGENT - type your password!' Bait.",
          "Message from someone you don't know? Be careful.",
          "If you're not sure, show a parent.",
        ],
      },
    },

    // 13 - NEW: Phish Inspector. The DELIBERATE counterpart to
    // SpamBlaster's reaction-speed shooter. Each email opens with 4
    // inspect zones; the child must tap WHO sent it, WHAT the link
    // is, HOW it sounds, and WHAT it's promising before ZAP/SAFE
    // unlocks. Teaches "don't react, inspect first" - the missing
    // mental model SpamBlaster alone doesn't build.
    {
      type: "phishInspector",
      emails: [
        {
          id: "email-roblox",
          sender: "RobIox Security <support@robIox-secure.com>",
          subject: "URGENT: Verify your account or it will be DELETED",
          body: "Dear player, we detected suspicious activity on your account. Tap the link below and enter your password within 60 seconds to keep your account active.",
          isPhishing: true,
          inspections: {
            senderNote:
              "Look closely - 'RobIox' has a capital I instead of a lowercase l. Real Roblox emails come from @roblox.com, never random secure-sounding domains.",
            senderIsRedFlag: true,
            linkText: "robIox-security.com",
            linkNote:
              "Same trick again - that's not roblox.com. Hackers use lookalike letters so the link LOOKS real at a glance.",
            linkIsRedFlag: true,
            urgencyNote:
              "'URGENT' plus a 60-second countdown is a pressure tactic. Real companies never panic you into action.",
            urgencyIsRedFlag: true,
            claimNote:
              "Real services NEVER ask you to type your password in an email. That's the whole trick.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "email-school",
          sender: "Mrs Johnson <m.johnson@yourschool.edu>",
          subject: "Reminder: PE kit tomorrow",
          body: "Hi class - quick reminder to bring your PE kit for tomorrow's lesson. Have a great evening!",
          isPhishing: false,
          inspections: {
            senderNote:
              "Mrs Johnson is your real teacher, writing from your school's real email address.",
            senderIsRedFlag: false,
            linkText: "(no link)",
            linkNote: "No suspicious links here - just a normal message.",
            linkIsRedFlag: false,
            urgencyNote:
              "Friendly tone, no panic words, no scary countdowns.",
            urgencyIsRedFlag: false,
            claimNote:
              "She isn't asking you to type anything secret - it's just a reminder.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "email-vbucks",
          sender: "V-Bucks Giveaway <freevbucks@prize-central.io>",
          subject: "🎉 You won 10,000 FREE V-Bucks!",
          body: "Congratulations! Tap the link below and log in with your Fortnite password to claim. Offer expires in 5 minutes!",
          isPhishing: true,
          inspections: {
            senderNote:
              "Real V-Bucks come from Epic Games, not 'prize-central.io'. Anyone offering free V-Bucks is a scam.",
            senderIsRedFlag: true,
            linkText: "free-vbucks-now.io",
            linkNote:
              "Random made-up website. Real Fortnite logins only ever happen INSIDE Fortnite or on epicgames.com.",
            linkIsRedFlag: true,
            urgencyNote:
              "'Expires in 5 minutes!' is pure pressure - they want you to act before you think.",
            urgencyIsRedFlag: true,
            claimNote:
              "Asking for your Fortnite password is the scam. You log into Fortnite IN Fortnite - never through an email.",
            claimIsRedFlag: true,
          },
        },
      ],
      hints: {
        tier1:
          "Tap all 4 inspect zones before deciding. Look at WHO sent it, WHAT the link is, HOW it sounds, and WHAT it's asking for.",
        tier2:
          "Even ONE red flag means it's a phish. Most fake emails have several - sneaky sender, fake link, scary urgency, password ask.",
      },
    },

    // 14 - phishing reaction-speed drill (after Inspector teaches the
    // mental model). Same sequence as before but bumped one index.
    {
      type: "spamBlaster",
      emails: [
        { sender: "Prize Central", subject: "YOU WON A FREE iPHONE!", isPhishing: true, clue: "Too good to be true" },
        { sender: "Sam", subject: "Funny video from school!", isPhishing: false, clue: "" },
        { sender: "Security Team", subject: "URGENT: Enter your password NOW!", isPhishing: true, clue: "Real services never ask for passwords by email" },
        { sender: "School Admin", subject: "Reminder: PE kit tomorrow", isPhishing: false, clue: "" },
        { sender: "V-Bucks Giveaway", subject: "FREE 10,000 V-BUCKS!", isPhishing: true, clue: "Free currency scams" },
        { sender: "Mrs Johnson", subject: "Homework reminder for Monday", isPhishing: false, clue: "" },
        { sender: "Your School", subject: "Your school needs your password", isPhishing: true, clue: "Schools never ask for passwords via email" },
        { sender: "Grandma", subject: "Happy birthday next week!", isPhishing: false, clue: "" },
        { sender: "Lucky Visitor", subject: "You are our 1,000,000th visitor!", isPhishing: true, clue: "No website tracks visitors this way" },
        { sender: "Account Security", subject: "Verify your account or it will be DELETED", isPhishing: true, clue: "Scare tactics = phishing" },
      ],
    },

    // 15 - Pop-up Panic. Drills the close-and-tell instinct against
    // the most common phishing-adjacent UX trick: pop-ups with a big
    // tempting OK and a small (but always tappable) X.
    {
      type: "popupPanic",
      popups: [
        {
          id: "pop-prize",
          icon: "🎁",
          title: "YOU WON A FREE iPHONE!",
          body: "Tap OK to claim your prize before it expires.",
          whyTrick: "Real companies don't give away iPhones via pop-ups. Anything offering a 'free prize' for a tap is bait.",
        },
        {
          id: "pop-virus",
          icon: "⚠️",
          title: "VIRUS DETECTED!",
          body: "Click OK to scan and clean your computer.",
          whyTrick: "Real antivirus software never warns you through a website pop-up. This one wants you to install something nasty.",
        },
        {
          id: "pop-delete",
          icon: "⏱️",
          title: "ACCOUNT DELETED IN 60 SECONDS",
          body: "Type your password here to keep it.",
          whyTrick: "Countdown threats are pure pressure tactics. Real apps don't ever delete your account from a pop-up.",
        },
        {
          id: "pop-vbucks",
          icon: "💰",
          title: "FREE 10,000 V-BUCKS",
          body: "Just tap OK and the V-Bucks are yours.",
          whyTrick: "Free in-game currency is one of the oldest scams targeting kids. Real games sell V-Bucks - they don't give them away via pop-ups.",
        },
        {
          id: "pop-phone",
          icon: "📞",
          title: "YOUR DEVICE WILL LOCK",
          body: "Call this number now to stop it.",
          whyTrick: "No real company asks you to phone a number from a pop-up. That number leads to a scammer pretending to be tech support.",
        },
      ],
      hints: {
        tier1: "Look for the small X in the corner of the pop-up. The big OK is the trap.",
        tier2: "Top-right of the pop-up. Tap the X, not the colourful button.",
        tier3: "Every pop-up has an X in the top corner. The OK button is always the wrong choice - tap the X and tell a grown-up.",
      },
    },

    // 16 - vocabulary consolidation. Password Manager and 2FA pairs removed
    // (not taught in Week 1). Replaced with concepts now taught: Phishing + Secret.
    {
      type: "memoryMatch",
      pairs: [
        { term: "Password", match: "Your secret code to prove it's you", colour: "#60a5fa" },
        { term: "Strong", match: "Long, mixed, hard to guess", colour: "#34d399" },
        { term: "Weak", match: "Short, common, easy to guess", colour: "#ef4444" },
        { term: "Unique", match: "Different for every account", colour: "#8b5cf6" },
        { term: "Phishing", match: "A fake message that wants to trick you", colour: "#ff5fb3" },
        { term: "Secret", match: "Only you know it", colour: "#fbbf24" },
      ],
    },

    // 17
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Your best friend asks you to share your Roblox password so they can help you get items. What do you do?",
          choices: [
            { text: "Share it - they're my best friend", isSafe: false, consequence: "Even best friends shouldn't know your password. Accounts get hacked that way." },
            { text: "Say no - passwords are secret", isSafe: true, consequence: "Perfect! Your password is YOUR secret. Nobody else needs to know it except your parents." },
          ],
        },
        {
          setup: "A pop-up says your account is hacked and you must enter your password on this page RIGHT NOW. What do you do?",
          choices: [
            { text: "Enter it quickly - sounds urgent!", isSafe: false, consequence: "That was a phishing trick. You just gave your password to a hacker." },
            { text: "Close it and tell a parent", isSafe: true, consequence: "Great thinking! Real companies don't demand passwords via pop-ups." },
          ],
        },
      ],
    },

    // 18 - end-of-lesson maze recap. 2FA and "where to store passwords" (Password
    // Manager) questions removed. Replaced with uniqueness + phishing recall.
    {
      type: "cyberMaze",
      questions: [
        { question: "What makes a password STRONG?", answers: ["Mix of letters, numbers, symbols, 8+ long", "Your birthday", "The word 'password'", "One letter"], correctIndex: 0 },
        { question: "Who should know your password?", answers: ["Only you (and a parent for safety)", "Your best friend", "Everyone in your class", "Everyone who asks"], correctIndex: 0 },
        { question: "A good password does NOT include...", answers: ["Your name or birthday", "Numbers", "Symbols", "Uppercase letters"], correctIndex: 0 },
        { question: "If a hacker steals ONE of your passwords, which other accounts are at risk?", answers: ["Any other account where you used the same password", "Only the one that was stolen", "No accounts at all", "Only accounts you opened that day"], correctIndex: 0 },
        { question: "A pop-up says you won a free phone if you type your password. What is it?", answers: ["A phishing trick", "A real prize", "A school message", "A game"], correctIndex: 0 },
      ],
    },

    // 19
    { type: "bossBattle" },

    // 20 - NEW: Mission Debrief. Final-act recap that consolidates
    // the lesson by CONCEPT (Strength / Secrecy / Uniqueness /
    // Phishing). Four cards reveal in sequence with Layla narration,
    // then the child taps through to claim their stickers.
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's what you mastered this week.",
      concepts: [
        {
          id: "strength",
          label: "Strong Passwords",
          accent: "#00e5ff",
          icon: "💪",
          summary: "You can build long, mixed passwords the Raccoon can't crack.",
        },
        {
          id: "secrecy",
          label: "Keep It Secret",
          accent: "#fde047",
          icon: "🤐",
          summary: "Even best friends don't need your passwords. Adults help instead.",
        },
        {
          id: "uniqueness",
          label: "One Per Account",
          accent: "#7c5cff",
          icon: "🗝️",
          summary: "Every account gets its own password. One leak doesn't open all doors.",
        },
        {
          id: "phishing",
          label: "Spot the Trick",
          accent: "#ff5fb3",
          icon: "🔍",
          summary: "Inspect the sender, link, urgency and ask before you click.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "Wow! Look at everything you learned this week.",
          "Strong passwords - long and mixed.",
          "Secret passwords - even from your best friend.",
          "Unique passwords - one for every account.",
          "And you can spot phishing tricks too.",
          "Time to claim your stickers!",
        ],
      },
    },

    // 21 - NEW: Sticker Unlock. The reward-loop celebration. Three
    // stickers drop in sequence with confetti + audio per sticker.
    // Server-side awarding happens in DynamicLesson on lesson
    // completion; this screen is the visual moment.
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        {
          id: "password-master",
          name: "Password Master",
          icon: "🔐",
          description: "Built strong passwords the Raccoon can't crack.",
        },
        {
          id: "secret-keeper",
          name: "Secret Keeper",
          icon: "🤐",
          description: "Stood firm when asked to share. Passwords stay secret.",
        },
        {
          id: "phish-spotter",
          name: "Phish Spotter",
          icon: "🔍",
          description: "Inspected the bait and didn't bite. Sharp eyes!",
        },
      ],
    },

    // 22
    { type: "completion" },
  ],

  // Multi-phase boss (Week 1). The flat `bossQuestions` block below
  // is retained for backwards compat (BossBattle falls back to it if
  // `bossPhases` is unset), but the live boss is driven by the 5-act
  // structure defined here:
  //
  //   Phase 1 - Strength  (3 Q)  "Which is stronger?"
  //   Phase 2 - Secrecy   (2 Q)  "Who should know it?"
  //   Phase 3 - Uniqueness(2 Q)  "Same password everywhere?"
  //   Phase 4 - Phishing  (3 Q)  "Spot the trick"
  //   Phase 5 - Final     (4 Q)  Scenario combo
  //
  // Total: 14 questions (down from 15), tighter narrative arc, every
  // question tagged with a concept for parent-dashboard attribution.
  // Curriculum discipline: every concept is taught in earlier screens.
  // No 2FA, no password managers, no jargon.
  bossPhases: [
    {
      kind: "mcq",
      id: "phase-strength",
      label: "Strength",
      announceText: "Round 1 - The Strength Test!",
      announceTone: "cyan",
      questions: [
        { question: "Which is the STRONGEST password?", answers: ["Tr0pic4l$unR1se!", "password", "12345", "yourname"], correctIndex: 0, explanation: "A mix of uppercase, lowercase, numbers and symbols - long, too.", key: "boss-strength-1" },
        { question: "A password should be at least how long?", answers: ["8 characters", "3 letters", "1 number", "Just your name"], correctIndex: 0, explanation: "8+ characters is the safe minimum.", key: "boss-strength-2" },
        { question: "Why is 'Tropical$unR1se!' stronger than 'TropicalSunrise'?", answers: ["It mixes case, numbers and symbols - much harder to crack", "It is shorter", "It is the same", "It has a capital T"], correctIndex: 0, explanation: "Character variety makes passwords much harder to guess.", key: "boss-strength-3" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-secrecy",
      label: "Secrecy",
      announceText: "Round 2 - Keep It Secret!",
      announceTone: "gold",
      questions: [
        { question: "Should you share your password with a best friend?", answers: ["Never", "Yes", "Only on weekends", "Only at school"], correctIndex: 0, explanation: "Passwords are always secret, even from friends.", key: "boss-secrecy-1" },
        { question: "Your big sister's friend says 'I forgot my password - can I borrow yours just for today?' What do you do?", answers: ["Tell her to ask an adult for help", "Lend it - it's just for a day", "Make a new one together and share it", "Tell her but ask her not to share"], correctIndex: 0, explanation: "Passwords are never lent - even for a minute. The right help is from a grown-up.", key: "boss-secrecy-2" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-uniqueness",
      label: "Uniqueness",
      announceText: "Round 3 - One Key Per Door!",
      announceTone: "blue",
      questions: [
        { question: "Using the same password for everything is...", answers: ["Risky - one hack unlocks them all", "Safer - easier to remember", "Required", "Normal"], correctIndex: 0, explanation: "If one account is stolen, every account is - always use different passwords.", key: "boss-uniqueness-1" },
        { question: "You used the SAME password for your school account AND Roblox. Roblox just got hacked. What should you do?", answers: ["Change BOTH passwords to different ones", "Nothing - it's only Roblox", "Change just your Roblox password", "Stop using Roblox forever"], correctIndex: 0, explanation: "When one is stolen, change every place it was used - and make each new one different.", key: "boss-uniqueness-2" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-phishing",
      label: "Phishing",
      announceText: "Round 4 - Spot the Trick!",
      announceTone: "red",
      questions: [
        { question: "A message says 'URGENT: type your password to keep your account.' What kind of message is this?", answers: ["A phishing trick", "A normal school message", "A friend asking nicely", "A safe alert"], correctIndex: 0, explanation: "Real services never demand your password by message - that's phishing.", key: "boss-phishing-1" },
        { question: "A pop-up says 'Your account will be deleted in 60 seconds unless you type your password here NOW.' What's the trick?", answers: ["They want you to panic so you don't think", "Your account really is being deleted", "It's a game", "They want to help you"], correctIndex: 0, explanation: "Scary countdown pop-ups are phishing - real apps never delete your account from a pop-up.", key: "boss-phishing-2" },
        { question: "A stranger online says 'I'll give you free game money if you tell me your password.' What's the smartest thing to do?", answers: ["Say no and tell a parent", "Tell them - free money sounds great", "Tell them but only half of it", "Make a new password and tell them the old one"], correctIndex: 0, explanation: "Nobody real gives you free stuff for a password - that's the Hacker Raccoon's trick.", key: "boss-phishing-3" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-final",
      label: "Final Showdown",
      announceText: "FINAL ROUND - The Raccoon's last stand!",
      announceTone: "red",
      questions: [
        { question: "What is a password?", answers: ["A secret code to prove it's you", "A type of game", "A song lyric", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in.", key: "boss-final-1" },
        { question: "Why shouldn't you write your password on a sticky note under your keyboard?", answers: ["Anyone who lifts the keyboard can read it", "The ink fades", "Paper is bad", "Stickies are too small"], correctIndex: 0, explanation: "A password only works if nobody else can see it.", key: "boss-final-2" },
        { question: "Which makes guessing a password take much longer?", answers: ["More characters and a random mix", "Using your name", "Making it shorter", "Using only numbers"], correctIndex: 0, explanation: "Every extra character makes guessing take much, much longer.", key: "boss-final-3" },
        { question: "A website you use got hacked and your password leaked. What should you do everywhere ELSE you used that same password?", answers: ["Change it on every account where you used it", "Do nothing", "Only change it on the hacked site", "Delete the internet"], correctIndex: 0, explanation: "Change it everywhere it was reused - this is why unique passwords matter.", key: "boss-final-4" },
      ],
    },
  ],

  // Legacy 15-question flat fallback. Kept so the boss still works if
  // `bossPhases` is ever cleared. Identical content distribution to
  // the prior pre-phase version.
  bossQuestions: {
    easy: [
      { question: "What is a password?", answers: ["A secret code to prove it's you", "A type of game", "A song lyric", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in." },
      { question: "Which is the STRONGEST password?", answers: ["Tr0pic4l$unR1se!", "password", "12345", "yourname"], correctIndex: 0, explanation: "A mix of uppercase, lowercase, numbers and symbols - long, too." },
      { question: "Should you share your password with a best friend?", answers: ["Never", "Yes", "Only on weekends", "Only at school"], correctIndex: 0, explanation: "Passwords are always secret, even from friends." },
      { question: "A password should be at least how long?", answers: ["8 characters", "3 letters", "1 number", "Just your name"], correctIndex: 0, explanation: "8+ characters is the safe minimum." },
      { question: "Using the same password for everything is...", answers: ["Risky - one hack unlocks them all", "Safer - easier to remember", "Required", "Normal"], correctIndex: 0, explanation: "If one account is stolen, every account is - always use different passwords." },
    ],
    medium: [
      { question: "Why shouldn't you write your password on a sticky note under your keyboard?", answers: ["Anyone who lifts the keyboard can read it", "The ink fades", "Paper is bad", "Stickies are too small"], correctIndex: 0, explanation: "A password only works if nobody else can see it." },
      { question: "Why is 'Tropical$unR1se!' stronger than 'TropicalSunrise'?", answers: ["It mixes case, numbers and symbols - much harder to crack", "It is shorter", "It is the same", "It has a capital T"], correctIndex: 0, explanation: "Character variety makes passwords much harder to guess." },
      { question: "Which makes guessing a password take much longer?", answers: ["More characters and a random mix", "Using your name", "Making it shorter", "Using only numbers"], correctIndex: 0, explanation: "Every extra character makes guessing take much, much longer." },
      { question: "A website you use got hacked and your password leaked. What should you do everywhere ELSE you used that same password?", answers: ["Change it on every account where you used it", "Do nothing", "Only change it on the hacked site", "Delete the internet"], correctIndex: 0, explanation: "Change it everywhere it was reused - this is why unique passwords matter." },
      { question: "A message says 'URGENT: type your password to keep your account.' What kind of message is this?", answers: ["A phishing trick", "A normal school message", "A friend asking nicely", "A safe alert"], correctIndex: 0, explanation: "Real services never demand your password by message - that's phishing." },
    ],
    hard: [
      { question: "A stranger online says 'I'll give you free game money if you tell me your password.' What's the smartest thing to do?", answers: ["Say no and tell a parent", "Tell them - free money sounds great", "Tell them but only half of it", "Make a new password and tell them the old one"], correctIndex: 0, explanation: "Nobody real gives you free stuff for a password - that's the Hacker Raccoon's trick." },
      { question: "Your big sister's friend says 'I forgot my password - can I borrow yours just for today?' What do you do?", answers: ["Tell her to ask an adult for help", "Lend it - it's just for a day", "Make a new one together and share it", "Tell her but ask her not to share"], correctIndex: 0, explanation: "Passwords are never lent - even for a minute. The right help is from a grown-up." },
      { question: "You used the SAME password for your school account AND Roblox. Roblox just got hacked. What should you do?", answers: ["Change BOTH passwords to different ones", "Nothing - it's only Roblox", "Change just your Roblox password", "Stop using Roblox forever"], correctIndex: 0, explanation: "When one is stolen, change every place it was used - and make each new one different." },
      { question: "A pop-up says 'Your account will be deleted in 60 seconds unless you type your password here NOW.' What's the trick?", answers: ["They want you to panic so you don't think", "Your account really is being deleted", "It's a game", "They want to help you"], correctIndex: 0, explanation: "Scary countdown pop-ups are phishing - real apps never delete your account from a pop-up." },
      { question: "You wrote your password on a sticky note under your keyboard so you don't forget. Why is that a problem?", answers: ["Anyone who sits at your computer can lift the keyboard and read it", "The paper might tear", "The ink will fade", "It isn't a problem"], correctIndex: 0, explanation: "A password only works if you're the only one who knows where it is." },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Welcome back to Week 1!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Let's learn what makes a password strong." } },
    2: { adam: { mood: "thinking", message: "Passwords are your secret code." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Scan each password!" } },
    4: { adam: { mood: "excited", message: "Let's brew a super-strong password!" }, layla: null },
    5: { adam: null, layla: { mood: "curious", message: "Three random words - long beats clever every time." } },
    6: { adam: { mood: "excited", message: "Open every lock on the vault door!" }, layla: null },
    7: { adam: null, layla: { mood: "thinking", message: "Each of these is WEAK - tell me WHY." } },
    8: { adam: { mood: "excited", message: "Welcome to the Hospital - let's heal these weak passwords!" }, layla: null },
    9: { adam: { mood: "thinking", message: "One key, one door - never reuse passwords." }, layla: null },
    10: { adam: null, layla: { mood: "worried", message: "The Raccoon's in - rescue every account!" } },
    11: { adam: null, layla: { mood: "thumbsup", message: "The 5 Golden Rules - memorise them!" } },
    12: { adam: { mood: "worried", message: "Phishing is the Raccoon's favourite trick - watch out!" }, layla: null },
    13: { adam: null, layla: { mood: "curious", message: "Inspect each email before deciding - look for the red flags." } },
    14: { adam: null, layla: { mood: "worried", message: "Zap the phishing emails!" } },
    15: { adam: { mood: "worried", message: "Find the X - never tap OK on a scary pop-up." }, layla: null },
    16: { adam: { mood: "curious", message: "Match the password concepts." }, layla: null },
    17: { adam: null, layla: { mood: "thinking", message: "Pick the safe door." } },
    18: { adam: { mood: "excited", message: "Navigate the maze!" }, layla: null },
    19: { adam: null, layla: { mood: "excited", message: "Boss battle - let's beat the Raccoon!" } },
    20: { adam: { mood: "thumbsup", message: "Look at everything you learned this week!" }, layla: null },
    21: { adam: null, layla: { mood: "excited", message: "Stickers earned - they're going to your Cyber HQ!" } },
    22: { adam: { mood: "thumbsup", message: "Password Protector badge earned!" }, layla: null },
  },
};

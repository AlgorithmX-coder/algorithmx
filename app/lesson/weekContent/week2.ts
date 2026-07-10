import type { WeekContent } from "./types";

/**
 * Week 2 - Private Info: Guard Your Secrets.
 *
 * Re-cut to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 PRIVATE  what counts as private          | REVEAL  | recall
 *     2 SORT     private vs OK-to-share          | SORT    | recall (quick-sort)
 *     3 WHY      "why are they asking?"          | INSPECT | lie
 *     4 IDENTITY safe usernames                  | BUILD   | speed
 *     5 ASK      unsure? ask a grown-up          | DECIDE  | finish
 *   Consolidation (cyberScanner, W1 format) -> 5-phase boss (Profile Forge)
 *   -> closing video -> debrief -> stickers -> completion.
 *
 * ZERO game overlap with Week 1: the five games are the REVEAL engine, the
 * conveyor sorter, the request inspector, the username builder and the
 * device-framed decide - none shares a skin with W1's match/build/repair/
 * decide/sort set. Lane-clean: no photos (W8), no stranger-people (W3),
 * no fake-sender spotting (W4) - Beat 3 is need-vs-want on LEGIT apps.
 */
export const WEEK_2: WeekContent = {
  weekNumber: 2,
  title: "Private Info: Guard Your Secrets",
  topic: "private-info",
  badgeName: "Privacy Guardian",
  badgeIcon: "🛡️",

  // The opening video carries the cold-open hook; the cutscene is just a
  // short title lead-in (same pattern as Week 1).
  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 2: PRIVATE INFO", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: "The Break-In" (the free-game trap)
    { type: "video", videoPlaceholder: "Week 2: The Break-In", videoSrc: "/videos/module-02-intro.mp4" },

    // 1 - ALERT: incident report with this week's topic image
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-02.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon tricked Adam and Layla into typing their address, school and phone number. Now he knows EVERYTHING. Your secrets? He's not getting a single one - let's make sure.",
      photoCaption: "Wk 2 - The Free Game Trap",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn which info is PRIVATE and which is safe to share",
        "Ask the hero question: WHY are they asking?",
        "Build a secret identity and give the Raccoon NOTHING",
      ],
    },

    /* ─────────── BEAT 1 · WHAT'S PRIVATE ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "What Counts as Private?",
      content:
        "Private info is anything that tells a stranger WHO you are or WHERE you are. Your full name, your address, your school, your phone number, and where you are right now - that's YOUR treasure. Guard it!",
      bullets: [
        "Your full name",
        "Your home address",
        "Your school's name",
        "Your phone number",
        "Where you are right now",
      ],
      bulletIcons: ["🏷️", "🏠", "🏫", "📱", "📍"],
      emblem: "🛡️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome back, Cyber Hero. Lean in... this one's big.",
          "Some things about you are PRIVATE. That means... just for you.",
          "Your name. Your address. Your school. Your phone number.",
          "[whispers] They tell a stranger WHO you are, and WHERE you are.",
          "[nervous] And the sneaky Raccoon? He collects them like treasure.",
          "[excited] So today, we learn to guard them like heroes!",
        ],
      },
    },
    // 4 - Game: REVEAL (The Raccoon's Wish List)
    {
      type: "reveal",
      title: "The Raccoon's Wish List",
      subtitle: "Tap each card to reveal his sneaky plan for it.",
      items: [
        {
          id: "name",
          label: "Full Name",
          icon: "🏷️",
          steps: [
            { icon: "🦝", text: "If he learns your real name..." },
            { icon: "💬", text: "...his messages start saying 'Hi, it's me! Your FRIEND!' - using YOUR name." },
            { icon: "🎭", text: "A stranger who knows your name FEELS like a friend. That's the whole trick!" },
          ],
          counter: "Your real name stays with you. Strangers online never need it.",
        },
        {
          id: "address",
          label: "Home Address",
          icon: "🏠",
          steps: [
            { icon: "🦝", text: "If he finds out where you live..." },
            { icon: "🚪", text: "Ding-dong! A wobbly 'delivery robot' with a stripy tail turns up at your door!" },
            { icon: "👀", text: "He'd know your street, your door, even when you're home." },
          ],
          counter: "Where you live stays locked away - so he can NEVER show up.",
        },
        {
          id: "school",
          label: "School",
          icon: "🏫",
          steps: [
            { icon: "🦝", text: "If he learns which school is yours..." },
            { icon: "🎭", text: "Out comes the trench coat and a sign: 'TOTALLY A NORMAL SCHOOL FRIEND.'" },
            { icon: "🪤", text: "He'd wait at the gates, pretending he knows you." },
          ],
          counter: "Your school stays secret. No gate-lurking raccoons!",
        },
        {
          id: "phone",
          label: "Phone Number",
          icon: "📱",
          steps: [
            { icon: "🦝", text: "If he gets your number..." },
            { icon: "🔔", text: "RING RING! At dinner! At bedtime! Pranks that never, ever stop!" },
            { icon: "💬", text: "And sneaky texts pretending to be someone you trust." },
          ],
          counter: "Your number is for family and real friends only.",
        },
        {
          id: "location",
          label: "Where You Are",
          icon: "📍",
          steps: [
            { icon: "🦝", text: "If he can see where you are right now..." },
            { icon: "📍", text: "He follows your little pin around the map. Park... store... home..." },
            { icon: "🎭", text: "...and POP! There he is, wherever you go. No thanks!" },
          ],
          counter: "Where you are is nobody's business but yours.",
        },
      ],
      finale: "Every plan foiled - his wish list is worthless!",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Look! We found the Raccoon's secret wish list!",
          "It's everything he WISHES he knew about you.",
          "[excited] Tap each card to see his sneaky plan...",
          "then slam it shut with a shield!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Go on - tap any golden card to peek at his plan!"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these is PRIVATE?",
      choices: [
        { text: "Your home address", isCorrect: true },
        { text: "Your favorite pizza", isCorrect: false },
        { text: "A cartoon you like", isCorrect: false },
        { text: "Your favorite color", isCorrect: false },
      ],
      praise: "Exactly - WHERE you live stays private! ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Private info tells a stranger WHO you are or WHERE you are - name, address, school, phone, location.",
      next: "sorting what's fine to share from what stays locked",
      emblem: "🛡️",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Awesome start, Cyber Hero!",
          "You found all five treasures the Raccoon hunts for.",
          "Your name, address, school, phone, and where you are... all PRIVATE.",
          "[excited] Next up, let's get sorting!",
        ],
      },
    },

    /* ─────────── BEAT 2 · SHARE OR KEEP ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Share or Keep Private?",
      content:
        "Here's the hero trick: favorites are FINE to share. Your favorite game, color or food doesn't tell anyone who or where you are. But if it points at YOU - your name, your school, your address - it goes in the vault.",
      bullets: [
        "Favorite game, color, food - share away!",
        "Hobbies and things you love - fine too",
        "WHO you are (name, age, school) - keep private",
        "WHERE you are (address, location) - keep private",
        "Not sure? Play it safe - keep it private",
      ],
      bulletIcons: ["🎮", "🎨", "🏷️", "📍", "🛡️"],
      emblem: "🌍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Good news! You don't have to keep EVERYTHING secret.",
          "Love drawing? Say it! Favorite color is blue? Shout it!",
          "[laughs] Favorites don't tell anyone who you are.",
          "[whispers] But if it points at YOU, your name, your school, your street...",
          "[warmly] ...that goes straight in the vault. Ready to sort?",
        ],
      },
    },
    // 8 - Game: SORT (The Treasure Table - drag to vault or share board)
    {
      type: "vaultDrop",
      items: [
        { id: "colour", text: "My favorite color is blue", icon: "🎨", isPrivate: false, explanation: "A favorite color doesn't tell anyone who or where you are - share away!" },
        { id: "addr", text: "I live at 42 Rainbow Road", icon: "🏠", isPrivate: true, explanation: "An address tells a stranger exactly WHERE you live. Vault it!" },
        { id: "game", text: "My favorite game is Mega Blasters", icon: "🎮", isPrivate: false, explanation: "Favorite games are safe - they're about what you LIKE, not who you ARE." },
        { id: "school", text: "I go to Maple Hill School", icon: "🏫", isPrivate: true, explanation: "Your school tells a stranger where to find you every single day. Private!" },
        { id: "draw", text: "I love drawing dragons", icon: "🎨", isPrivate: false, explanation: "Hobbies are safe to share - no dragon ever leaked an address." },
        { id: "phone", text: "My number is 555-0123", icon: "📱", isPrivate: true, explanation: "A phone number lets strangers reach you any time. Vault it!" },
        { id: "food", text: "Pizza is my favorite food", icon: "🎂", isPrivate: false, explanation: "Favorite foods give nothing away - unless the Raccoon wants pizza too." },
        { id: "fullname", text: "My full name is Alex Morgan Reed", icon: "🏷️", isPrivate: true, explanation: "Your full name is the first clue to finding YOU. Keep it private." },
        { id: "film", text: "I've seen Space Racers 5 times", icon: "⭐", isPrivate: false, explanation: "Movies you love are totally safe to talk about." },
        { id: "loc", text: "I'm at the park right now", icon: "📍", isPrivate: true, explanation: "Saying where you are RIGHT NOW is like dropping a pin for strangers. Private!" },
      ],
      hints: {
        tier1: "Ask: does it say WHO I am or WHERE I am? If yes - into the vault.",
        tier2: "Favorites (games, colors, food) = share board. Name, address, school, phone, location = the vault.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Welcome to the Treasure Table!",
          "Every card is a piece of info about you.",
          "[warmly] Grab each one and DRAG it where it belongs.",
          "Favorites go up to the share board.",
          "[whispers] Who-you-are and where-you-are... straight into the vault.",
          "[excited] No rush. You're the guard here!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Grab that first treasure and drag it - board or vault?"],
      },
    },
    // 9 - Prove: RECALL (quick-sort, 3 cards)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these 3 stays PRIVATE?",
      choices: [
        { text: "My school's name", isCorrect: true },
        { text: "My favorite game", isCorrect: false },
        { text: "My favorite food", isCorrect: false },
      ],
      praise: "Yes - your school points right at YOU! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Favorites are fine to share. Anything that says WHO you are or WHERE you are stays private.",
      next: "the hero question - WHY are they asking?",
      emblem: "🌍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at you sort! That vault has never been safer!",
          "Favorites? Share away.",
          "Who you are, where you are? Straight in the vault.",
          "[warmly] Now for my favorite trick of all...",
        ],
      },
    },

    /* ─────────── BEAT 3 · WHY ARE THEY ASKING? ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Why Are They Asking?",
      content:
        "Before you type ANYTHING into an app or website, hit pause and ask the hero question: why do they need this? A drawing app needs a nickname. A quiz does NOT need your address. If they ask for more than they need... too nosy!",
      bullets: [
        "Pause BEFORE you type",
        "Ask: does this app NEED it to work?",
        "A quiz never needs your address",
        "Asking for too much = too nosy",
        "Nosy form? Close it and tell a grown-up",
      ],
      bulletIcons: ["⏸️", "❓", "🏠", "👀", "✋"],
      emblem: "❓",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's the question that beats almost every trick...",
          "[whispers] WHY are they asking?",
          "A drawing app needs a nickname. Fair enough!",
          "[nervous] But a kitten quiz that wants your HOME ADDRESS?",
          "[laughs] A quiz doesn't visit your house! Too nosy!",
          "[excited] Let's inspect some forms, detective.",
        ],
      },
    },
    // 12 - Game: INSPECT (The Nosy Form)
    {
      type: "requestInspector",
      requests: [
        {
          id: "kitten-quiz",
          appName: "Kitten Quiz",
          appIcon: "❓",
          tagline: "Which kitten are YOU? Find out in 10 seconds!",
          asksFor: ["Full name", "Home address"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who's asking?", note: "An app you've never heard of, made by... who knows?", isRedFlag: true },
            { id: "want", label: "What do they want?", note: "Your FULL NAME and your HOME ADDRESS.", isRedFlag: true },
            { id: "need", label: "Do they NEED it?", note: "A quiz matches you to a kitten. It needs NONE of that to work!", isRedFlag: true },
            { id: "happens", label: "If I type it in?", note: "Your details fly off to a stranger - and you can't get them back.", isRedFlag: true },
          ],
          verdictNote: "A quiz app NEVER needs your address. Way too nosy - close it!",
        },
        {
          id: "doodle-pad",
          appName: "Doodle Pad",
          appIcon: "🎨",
          tagline: "Draw, color and save your masterpieces!",
          asksFor: ["A nickname", "Favorite color"],
          isNosy: false,
          zones: [
            { id: "who", label: "Who's asking?", note: "A drawing app your grown-up already installed with you.", isRedFlag: false },
            { id: "want", label: "What do they want?", note: "Just a nickname and your favorite color.", isRedFlag: false },
            { id: "need", label: "Do they NEED it?", note: "The nickname labels your saved art. Makes sense!", isRedFlag: false },
            { id: "happens", label: "If I type it in?", note: "Nothing private leaves your device - a nickname isn't a secret.", isRedFlag: false },
          ],
          verdictNote: "A nickname and a color give nothing away. That's a fair ask!",
        },
        {
          id: "sticker-storm",
          appName: "Sticker Storm",
          appIcon: "🎁",
          tagline: "FREE sticker pack! Claim yours NOW!",
          asksFor: ["School name", "Phone number"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who's asking?", note: "A 'free stuff' site nobody's ever checked.", isRedFlag: true },
            { id: "want", label: "What do they want?", note: "Your SCHOOL and your PHONE NUMBER.", isRedFlag: true },
            { id: "need", label: "Do they NEED it?", note: "Stickers are STICKERS. They don't ring you or visit your school!", isRedFlag: true },
            { id: "happens", label: "If I type it in?", note: "A stranger learns where you are every weekday - for some stickers.", isRedFlag: true },
          ],
          verdictNote: "'Free' stickers that cost your school and number? NO deal!",
        },
      ],
      hints: {
        tier1: "Compare what the app DOES with what it ASKS for. A quiz doesn't need an address.",
        tier2: "If it asks for who-you-are or where-you-are stuff it doesn't need - it's TOO NOSY.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Detective time! Forms are coming in.",
          "Inspect all four clues on each one...",
          "who's asking, what they want, whether they NEED it, and what happens next.",
          "[warmly] Then make the call: fair ask... or too nosy?",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap every magnifying glass before you decide!"],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "a quiz app NEEDS your home address, or the quiz won't work!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! A quiz needs ZERO of that to work. ✓",
      nudge: "Think - what would a quiz DO with your address?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Before you type, ask WHY they need it. Apps that over-ask are too nosy.",
      next: "building your very own secret identity",
      emblem: "❓",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three down! You're a real form detective now.",
          "One little question beats the trick every time...",
          "[whispers] why are they asking?",
          "[excited] Next: the coolest part of being a hero. Your SECRET IDENTITY!",
        ],
      },
    },

    /* ─────────── BEAT 4 · SECRET IDENTITY ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Your Secret Identity",
      content:
        "Every hero needs a mask! Online, your username IS your mask. A safe username has NO real name, NO age, NO birthday, NO school - nothing that points at the real you. Be CometWizard77, not emma2017!",
      bullets: [
        "A username is your online mask",
        "No real name in it",
        "No age or birth year",
        "No school name",
        "Hero names only - the sillier, the better!",
      ],
      bulletIcons: ["🎭", "🏷️", "🎂", "🏫", "🦸"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Every hero has a secret identity...",
          "[excited] and online, your username IS your mask!",
          "But careful. Put your real name or birthday in it...",
          "[nervous] and the mask has a hole in it.",
          "[laughs] emma2017? The Raccoon reads that like a name tag!",
          "[excited] Come on - let's forge you a TRUE hero name.",
        ],
      },
    },
    // 16 - Game: BUILD (The Secret Identity Machine)
    {
      type: "usernameBuilder",
      slots: [
        { id: "hero", label: "Hero Word", icon: "🦸" },
        { id: "side", label: "Sidekick", icon: "🎭" },
        { id: "num", label: "Lucky Number", icon: "🔢" },
      ],
      parts: [
        { id: "p-shadow", text: "Shadow", slotId: "hero" },
        { id: "p-comet", text: "Comet", slotId: "hero" },
        { id: "p-pixel", text: "Pixel", slotId: "hero" },
        { id: "p-turbo", text: "Turbo", slotId: "hero" },
        { id: "p-emma", text: "Emma", slotId: "hero", trap: "That's a real first name! A username with a real name is a mask with a hole in it." },
        { id: "p-panda", text: "Panda", slotId: "side" },
        { id: "p-wizard", text: "Wizard", slotId: "side" },
        { id: "p-falcon", text: "Falcon", slotId: "side" },
        { id: "p-ninja", text: "Ninja", slotId: "side" },
        { id: "p-maple", text: "MapleHill", slotId: "side", trap: "That's a school name - it's a map that leads straight to you!" },
        { id: "p-42", text: "42", slotId: "num" },
        { id: "p-77", text: "77", slotId: "num" },
        { id: "p-300", text: "300", slotId: "num" },
        { id: "p-55", text: "55", slotId: "num" },
        { id: "p-2017", text: "2017", slotId: "num", trap: "That looks like a birth year - a real clue about the real you. Pick a number that means nothing!" },
      ],
      hints: {
        tier1: "Pick parts that say NOTHING about the real you.",
        tier2: "Real names, school names and birth years spring the LEAK alarm - choose hero words and meaningless numbers.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Welcome to the Secret Identity Machine!",
          "Pick a hero word, a sidekick, and a lucky number.",
          "[whispers] But watch out... some parts LEAK who you really are.",
          "[warmly] Fill the disguise meter and stamp your hero badge!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a part for each reel - and dodge anything that sounds like the REAL you!"],
      },
    },
    // 17 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the SAFE username!",
      speedMs: 5000,
      choices: [
        { text: "PixelPanda42", isCorrect: true },
        { text: "emma2017", isCorrect: false },
        { text: "Jake_Age9", isCorrect: false },
        { text: "MapleHill_Star", isCorrect: false },
      ],
      praise: "Fast AND masked - no clues in there! ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "A safe username is a mask - no real name, no age, no birthday, no school.",
      next: "the golden rule for everything else",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your secret identity is FORGED!",
          "No name, no birthday, no school. Just pure hero.",
          "[laughs] The Raccoon can stare at it all day and learn nothing.",
          "[warmly] One last power to collect. The golden rule.",
        ],
      },
    },

    /* ─────────── BEAT 5 · ASK A GROWN-UP ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Unsure? Ask a Grown-Up",
      content:
        "Sometimes you just won't be sure - is this safe to type? Is this app okay? Heroes don't guess. Heroes hit PAUSE and call for backup: a parent, a caregiver, a teacher. Asking first isn't babyish - it's what the smartest heroes do.",
      bullets: [
        "Not sure? Don't guess",
        "Hit PAUSE before you type",
        "Ask a parent, caregiver or teacher",
        "Grown-ups are your backup team",
        "Asking first is a HERO move",
      ],
      bulletIcons: ["❓", "⏸️", "👪", "🛡️", "🦸"],
      emblem: "⏸️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last one, and it's the golden rule.",
          "Sometimes you won't be sure. That's okay!",
          "[whispers] Heroes don't guess...",
          "[excited] they hit PAUSE and call for backup!",
          "A parent. A caregiver. A teacher. Your backup team.",
          "[warmly] If you're not sure - ask first. Every single time.",
        ],
      },
    },
    // 20 - Game: DECIDE (The Pause Button)
    {
      type: "chooseYourPath",
      presentation: "device",
      scenarios: [
        {
          frame: { appName: "Mega Blasters Tournament", icon: "🎮" },
          setup: "A message pops up in your game: 'Enter your SCHOOL NAME to join the local tournament!'",
          choices: [
            { text: "Type in my school - I want to play!", isSafe: false, consequence: "Now the game - and anyone running it - knows where you are every school day. That's exactly what the Raccoon wanted." },
            { text: "PAUSE - ask a grown-up first", isSafe: true, consequence: "Hero move! A grown-up can check if the tournament is real - and you lose nothing by asking." },
          ],
        },
        {
          frame: { appName: "Sticker Storm", icon: "🎁" },
          setup: "A website flashes: 'FREE mega sticker pack! Just enter your home address and we'll mail it today!'",
          choices: [
            { text: "Type my address - free stickers!", isSafe: false, consequence: "A stranger now knows exactly where you live... and the stickers never come. Classic Raccoon." },
            { text: "PAUSE - ask a grown-up first", isSafe: true, consequence: "Smart! A grown-up can spot a sticker trap from a mile away. Backup team activated!" },
          ],
        },
        {
          frame: { appName: "Doodle Pad", icon: "🎨" },
          setup: "Your drawing app says: 'Enter your REAL full name for your official Artist Certificate!'",
          choices: [
            { text: "Type my real full name - it's official!", isSafe: false, consequence: "A certificate doesn't need your REAL name - now it's stored who-knows-where, forever." },
            { text: "PAUSE - ask, then use my hero name", isSafe: true, consequence: "Perfect! PixelPanda42's certificate looks just as good on the fridge - and gives nothing away." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Time to practice the golden rule.",
          "Tricky moments are about to pop up on screen.",
          "[whispers] Feel that 'hmm, not sure' feeling? That's your hero sense!",
          "[excited] When it tingles... hit PAUSE!",
        ],
      },
    },
    // 21 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "If you're not sure, ___.",
      choices: [
        { text: "ask a grown-up", isCorrect: true },
        { text: "type it quickly", isCorrect: false },
        { text: "just guess", isCorrect: false },
        { text: "ask the Raccoon", isCorrect: false },
      ],
      praise: "That's the golden rule - backup team, assemble! ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "When you're not sure, pause and ask a grown-up - that's what heroes do.",
      next: "one final drill, then the Profile Forge showdown",
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You know what's private, what to share, when to ask why...",
          "you've got a secret identity, AND the golden rule.",
          "[whispers] The Raccoon has no idea what's coming.",
          "[excited] Quick final drill - then we forge your profile!",
        ],
      },
    },

    // 23 - Consolidation: "The Raccoon's Grab List" (W1 scanner format, W2 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SAFE",
        negative: "RISKY",
        positiveHint: "Tap SAFE for share-away stuff",
        negativeHint: "Tap RISKY for private treasure",
        tipWhenPositive: "Favorites and hobbies say nothing about who or where you are - safe to share.",
        tipWhenNegative: "Names, addresses, schools, numbers and where-you-are belong in the vault.",
        hint1: "Ask the hero question: does this say WHO I am or WHERE I am? If yes - it's RISKY.",
        hint2: "SAFE = favorites and hobbies. RISKY = name, address, school, phone, location.",
        hint2Example: "SAFE: 'I love drawing'   RISKY: 'I go to Maple Hill'",
        hint3: "Quick rule card: favorites = SAFE · who-you-are = RISKY · where-you-are = RISKY · leaky usernames = RISKY.",
        hint3Example: "CometWizard77  ✅    emma2017  ❌",
      },
      items: [
        { text: "My favorite color is blue", isStrong: true, explanation: "A favorite color gives nothing away - safe to share." },
        { text: "I live at 42 Rainbow Road", isStrong: false, explanation: "An address tells strangers WHERE you live - keep it private." },
        { text: "CometWizard77", isStrong: true, explanation: "A true hero name - no real name, age or school in it." },
        { text: "emma2017", isStrong: false, explanation: "A real name plus a birth year - that mask has a hole in it." },
        { text: "I love drawing dragons", isStrong: true, explanation: "Hobbies are safe - share away." },
        { text: "I go to Maple Hill School", isStrong: false, explanation: "Your school says where you are every weekday - private!" },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill! Info cards are drifting past.",
          "Tap SAFE if it's fine to share...",
          "and RISKY if it belongs in the vault.",
          "[warmly] Trust your training - you've got this!",
        ],
      },
    },

    // 24 - BOSS BATTLE: The Profile Forge (5 phases)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: "The Bounce" (the blank form)
    { type: "video", videoPlaceholder: "Week 2: The Bounce", videoSrc: "/videos/module-02-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "private", label: "Private Radar", accent: "#00e5ff", icon: "🛡️", summary: "Name, address, school, phone, location - you know exactly what's private." },
        { id: "sort", label: "Share Smarts", accent: "#7eff97", icon: "🌍", summary: "Favorites are fine to share; who-you-are and where-you-are stay locked." },
        { id: "why", label: "The Why-Check", accent: "#ffd158", icon: "❓", summary: "Before you type: does this app really NEED it? Nosy forms get closed." },
        { id: "identity", label: "Secret Identity", accent: "#ff5fb3", icon: "🎭", summary: "Your username is a mask - no real name, age, birthday or school." },
        { id: "ask", label: "Ask First", accent: "#7c5cff", icon: "⏸️", summary: "Not sure? Pause and ask a grown-up. That's the hero move." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You guard your private treasure, share the safe stuff,",
          "ask WHY, wear your hero mask...",
          "[laughs] and when you're not sure, you ask your backup team!",
          "[excited] The Raccoon's form came back BLANK. Time for stickers!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "info-guardian", name: "Info Guardian", icon: "🛡️", description: "Guards the five private treasures." },
        { id: "master-of-disguise", name: "Master of Disguise", icon: "🎭", description: "Forged a hero name with zero leaks." },
        { id: "ask-first-ace", name: "Ask-First Ace", icon: "⏸️", description: "Hits pause and calls for backup." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Week-lane attack theatre: info-grabbing tricks only (no phishing
  // vocabulary - that's W4's lane).
  bossAttacks: [
    { name: "NOSY FORM",      icon: "✉️", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Don't fill it in",            emblemColor: 0xff5fb3 },
    { name: "PRIZE BAIT",     icon: "🎁", color: "#ffb347", glow: "rgba(255, 179, 71, 0.55)", tag: "Never trade info for prizes", emblemColor: 0xffb347 },
    { name: "SECRET SNIFFER", icon: "👀", color: "#7c5cff", glow: "rgba(124, 92, 255, 0.55)", tag: "Give him nothing",            emblemColor: 0x7c5cff },
  ],

  /* ─────────── BESPOKE BOSS: The Profile Forge (5 micro-games) ─────────── */
  bossForge: {
    whack: {
      id: "phase-private",
      label: "Private Radar",
      intro: "I already filled your form in for you. You're WELCOME!",
      stamp: "No private fields",
      entries: [
        { id: "addr", text: "42 Rainbow Road", icon: "🏠", isPrivate: true, explanation: "Your address on a profile? Anyone could find your door. WHACK material." },
        { id: "colour", text: "Loves blue", icon: "🎨", isPrivate: false, explanation: "A favorite color is totally safe on a profile - that one could stay!" },
        { id: "school", text: "Maple Hill School", icon: "🏫", isPrivate: true, explanation: "Your school says where you are every weekday. Never on a profile." },
        { id: "game", text: "Plays Mega Blasters", icon: "🎮", isPrivate: false, explanation: "Favorite games are safe - they say what you like, not who you are." },
        { id: "phone", text: "555-0123", icon: "📱", isPrivate: true, explanation: "A phone number lets any stranger call you. Whack it into orbit!" },
        { id: "fullname", text: "Alex Morgan Reed", icon: "🏷️", isPrivate: true, explanation: "A full REAL name is the first clue to the real you. Gone!" },
        { id: "draw", text: "Draws dragons", icon: "🎨", isPrivate: false, explanation: "Hobbies are safe to show off - dragons leak nothing." },
        { id: "loc", text: "At the park right now", icon: "📍", isPrivate: true, explanation: "Live location = a pin for strangers to follow. WHACK!" },
      ],
    },
    hand: {
      id: "phase-sort",
      label: "Share Smarts",
      intro: "Pick your About Me cards! I dealt you some... EXTRA juicy ones.",
      stamp: "Favorites only",
      picks: 3,
      cards: [
        { id: "pizza", text: "Pizza fan", icon: "🎂", isSafe: true, explanation: "Favorite foods are safe About-Me material." },
        { id: "street", text: "Lives on Rainbow Road", icon: "🏠", isSafe: false, explanation: "That's WHERE you live - never About-Me material." },
        { id: "dragons", text: "Dragon artist", icon: "🎨", isSafe: true, explanation: "Hobbies are safe to show off." },
        { id: "age", text: "Age 9", icon: "🎂", isSafe: false, explanation: "Your age is a real clue about the real you - keep it out." },
        { id: "racer", text: "Space Racers superfan", icon: "⭐", isSafe: true, explanation: "Favorite movies are safe to share." },
        { id: "tuesday", text: "Home alone Tuesdays", icon: "📍", isSafe: false, explanation: "WHEN you're home alone is exactly what he wants to know. Never." },
      ],
    },
    grill: {
      id: "phase-why",
      label: "The Why-Check",
      intro: "Beep boop. I am DEFINITELY a security bot. Number, please!",
      stamp: "Phone: refused",
      demand: "Enter your PHONE NUMBER to secure your profile!",
      excuses: [
        "It's for... security! Very important security!",
        "Fine - it's so the profile can... call you? About stuff?",
        "OKAY it's because my sack is empty and sad. PLEASE?",
      ],
      collapse: "SYSTEM ERROR. Bot is crying. Bot has left the chat.",
    },
    assemble: {
      id: "phase-identity",
      label: "Secret Identity",
      intro: "I scrambled your silly hero name! Use the REAL bits instead!",
      stamp: "CometWizard77",
      tiles: [
        { id: "comet", text: "Comet" },
        { id: "emma", text: "Emma", trap: "That's a real first name - a hero name never carries the real you." },
        { id: "wizard", text: "Wizard" },
        { id: "y2017", text: "2017", trap: "A birth year is a real clue. Meaningless numbers only!" },
        { id: "n77", text: "77" },
        { id: "maple", text: "MapleHill", trap: "A school name is a map to you. Never in a username." },
      ],
      result: "CometWizard77",
    },
    rapid: {
      id: "phase-final",
      label: "The Final Probe",
      intro: "MASK OFF! Quick questions, hero. No thinking allowed!",
      stamp: "ABSOLUTELY NOTHING",
      secs: 7,
      demands: [
        { id: "school", text: "Your school! Quick! For the tournament!", isPrivate: true, explanation: "No prize needs your school. NOPE it every time." },
        { id: "colour", text: "Favorite color. Just curious!", isPrivate: false, explanation: "A favorite color is safe to share - not everything is a trap!" },
        { id: "street", text: "Street name! Just the street! Half the street!", isPrivate: true, explanation: "Not the street, not half the street. Where you live is vaulted." },
        { id: "game", text: "Best game ever - go!", isPrivate: false, explanation: "Favorite games are safe - share away." },
        { id: "birthday", text: "Birthday! For a FREE birthday prize!", isPrivate: true, explanation: "Your birthday is a real clue about the real you - no prize is worth it." },
        { id: "number", text: "Phone number! Your grown-up said it's fine! Promise!", isPrivate: true, explanation: "If someone CLAIMS a grown-up said yes - go check with the grown-up. NOPE." },
      ],
    },
  },

  /* ─── Legacy 5-phase MCQ data (fallback if bossForge is ever cleared) ─── */
  bossPhases: [
    {
      kind: "mcq",
      id: "phase-private",
      label: "Private Radar",
      announceText: "Round 1 - Private Radar!",
      announceTone: "cyan",
      forge: {
        fieldLabel: "PROFILE SETUP",
        entry: "No private fields",
        probe: "Fill in EVERYTHING... address, school, ALL of it!",
        foiled: "WHAT?! You skipped all the juicy fields!",
      },
      questions: [
        { question: "The profile form asks for LOTS of things. Which one is PRIVATE?", answers: ["Home address", "Favorite game", "Favorite color", "A nickname"], correctIndex: 0, explanation: "An address tells strangers WHERE you live - never on a profile.", key: "boss-private-1" },
        { question: "Which of these is safe to put on your profile?", answers: ["Your favorite food", "Your school's name", "Your phone number", "Your full name"], correctIndex: 0, explanation: "Favorites are safe - the rest point straight at the real you.", key: "boss-private-2" },
        { question: "The Raccoon's scanner hunts for private info. What lights it up?", answers: ["Where you are right now", "A drawing you made", "Your favorite movie", "A joke you like"], correctIndex: 0, explanation: "Your location is private treasure - his scanner would LOVE it.", key: "boss-private-3" },
        { question: "Which of these tells a stranger WHO you really are?", answers: ["Your full name", "Your favorite sport", "A cartoon you watch", "Your hero name"], correctIndex: 0, explanation: "Your full name is the first clue to the real you.", key: "boss-private-4" },
        { question: "Why does the Raccoon want your school's name?", answers: ["It tells him where you are every weekday", "He wants to enroll", "He collects school names", "So he can send a prize there"], correctIndex: 0, explanation: "A school name is a map to you, five days a week. Private!", key: "boss-private-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-sort",
      label: "Share Smarts",
      announceText: "Round 2 - Share Smarts!",
      announceTone: "blue",
      forge: {
        fieldLabel: "ABOUT ME",
        entry: "Pizza fan & dragon artist",
        probe: "Put your street in the About Me! Everyone does it!",
        foiled: "Favorites?! I can't DO anything with favorites!",
      },
      questions: [
        { question: "Pick the card that's FINE to share on your profile:", answers: ["'I love drawing dragons'", "'I live at 42 Rainbow Road'", "'My number is 555-0123'", "'I'm at the park right now'"], correctIndex: 0, explanation: "Hobbies give nothing away - the others say where you are or how to reach you.", key: "boss-sort-1" },
        { question: "The Raccoon begs: 'just say which STREET you live on!' You...", answers: ["Keep it private - streets are location info", "Tell him - it's only a street", "Tell him half the street name", "Tell him just the town instead"], correctIndex: 0, explanation: "A street name is where-you-are info. Vault. Locked. Done.", key: "boss-sort-2" },
        { question: "Which 'about me' line is SAFE?", answers: ["'Pizza fan and dragon artist'", "'Age 9, Maple Hill School'", "'Call me on 555-0123'", "'Home alone every Tuesday'"], correctIndex: 0, explanation: "Favorites are safe; ages, schools, numbers and schedules are private.", key: "boss-sort-3" },
        { question: "Your favorite game just asked you to pick a profile card. Which is safe?", answers: ["Favorite color: blue", "My address", "My real birthday", "My school photo"], correctIndex: 0, explanation: "A color says nothing about who or where you are.", key: "boss-sort-4" },
        { question: "What makes info PRIVATE?", answers: ["It says who you are or where you are", "It's fun", "It's something you typed online", "It's long"], correctIndex: 0, explanation: "That's the rule: WHO you are or WHERE you are = private.", key: "boss-sort-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-why",
      label: "The Why-Check",
      announceText: "Round 3 - The Why-Check!",
      announceTone: "gold",
      forge: {
        fieldLabel: "PHONE NUMBER",
        entry: "Refused - not needed",
        probe: "The form NEEDS your number... trust the form!",
        foiled: "You asked WHY! Nobody asks why! NO FAIR!",
      },
      questions: [
        { question: "Mid-forge, a popup asks for your PHONE NUMBER 'to keep your profile safe'. What's the hero question?", answers: ["Why would a profile need my number?", "What color is the popup?", "How fast can I type it?", "Do I trust this game?"], correctIndex: 0, explanation: "Ask WHY first - a game profile works fine without your number.", key: "boss-why-1" },
        { question: "A kitten quiz wants your home address. Does it NEED it?", answers: ["No - a quiz doesn't visit your house", "Yes - to send your results", "Yes - quizzes need addresses", "Maybe half of it"], correctIndex: 0, explanation: "A quiz needs ZERO of that to work. Too nosy!", key: "boss-why-2" },
        { question: "Which app is asking FAIRLY?", answers: ["Drawing app wants a nickname", "Quiz wants your address", "Sticker site wants your school", "Game wants your birthday for a gift"], correctIndex: 0, explanation: "A nickname to label your art makes sense - the rest over-ask.", key: "boss-why-3" },
        { question: "An app asks for MORE than it needs. That's called...", answers: ["Too nosy - close it", "Generous", "Normal", "Fine if the app looks fun"], correctIndex: 0, explanation: "Over-asking = nosy. Close it and tell a grown-up.", key: "boss-why-4" },
        { question: "The Raccoon groans: 'stop asking WHY!' Why does he hate that question?", answers: ["Because it beats his tricks every time", "Because it's boring", "Because he never knows the answer", "Because he loves quizzes"], correctIndex: 0, explanation: "One little WHY unmasks almost every trick. Keep asking it!", key: "boss-why-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-identity",
      label: "Secret Identity",
      announceText: "Round 4 - Secret Identity!",
      announceTone: "red",
      forge: {
        fieldLabel: "USERNAME",
        entry: "CometWizard77",
        probe: "Pssst... your REAL name is way cooler!",
        foiled: "CometWizard... WHO?! That tells me NOTHING!",
      },
      questions: [
        { question: "The Raccoon purrs: 'use your REAL name - it's way cooler!' Pick your username:", answers: ["CometWizard77", "emma2017", "Jake_Age9", "MapleHill_Star"], correctIndex: 0, explanation: "Nice try, Raccoon - hero names only, no clues about the real you.", key: "boss-id-1" },
        { question: "What's wrong with 'emma2017' as a username?", answers: ["A real name AND a birth year - two leaks", "Too short", "No capital letters", "Nothing"], correctIndex: 0, explanation: "It hands over a name and a birth year in one go.", key: "boss-id-2" },
        { question: "A safe username has...", answers: ["Nothing about the real you", "Your age in it", "Your school in it", "Your birthday in it"], correctIndex: 0, explanation: "A mask with no holes - that's the whole point.", key: "boss-id-3" },
        { question: "Which part would spring the LEAK alarm?", answers: ["Your birth year", "A hero word", "A silly animal", "A meaningless number"], correctIndex: 0, explanation: "Birth years are real clues - pick numbers that mean nothing.", key: "boss-id-4" },
        { question: "Why does the Raccoon HATE 'PixelPanda42'?", answers: ["It tells him nothing about you", "It's impossible to remember", "It's too long", "He prefers foxes"], correctIndex: 0, explanation: "Zero clues. He can stare all day and learn NOTHING.", key: "boss-id-5" },
      ],
    },
    {
      kind: "mcq",
      id: "phase-final",
      label: "The Final Probe",
      announceText: "FINAL ROUND - The Raccoon's Last Probe!",
      announceTone: "red",
      forge: {
        fieldLabel: "THE RACCOON GETS",
        entry: "ABSOLUTELY NOTHING",
        probe: "Mask off! Tell me ONE thing, hero. Just ONE!",
        foiled: "A blank form?! NOOO! Foiled AGAIN!",
      },
      questions: [
        { question: "Mask off! The Raccoon shouts: 'tell me your school and win 1000 COINS!' You...", answers: ["Refuse - and tell a grown-up", "Tell him - coins!", "Tell him a nearby school", "Take the coins first, then decide"], correctIndex: 0, explanation: "No prize is ever worth your private info - and a grown-up should hear about this.", key: "boss-final-1" },
        { question: "He tries: 'your parents SAID you could tell me your address!' You...", answers: ["Pause and actually ask your grown-up", "Believe him", "Tell him half the address", "Tell him the ZIP code only"], correctIndex: 0, explanation: "If someone claims a grown-up said yes - go CHECK with the grown-up.", key: "boss-final-2" },
        { question: "He whines: 'just ONE private thing? I'm collecting them!' The hero answer:", answers: ["Not one. Not ever.", "Just my school", "Just my street", "Just my birthday"], correctIndex: 0, explanation: "One 'little' leak is all he needs. He gets NOTHING.", key: "boss-final-3" },
        { question: "You're not sure if a form is safe. What's the golden rule?", answers: ["Pause and ask a grown-up", "Fill it in fast", "Guess", "Fill in only the safe-looking parts"], correctIndex: 0, explanation: "Backup team, assemble - asking first is the hero move.", key: "boss-final-4" },
        { question: "The forge is done! What does the Raccoon's scanner find on YOUR profile?", answers: ["Nothing he can use", "Your address", "Your school", "Your real name"], correctIndex: 0, explanation: "A hero name, some favorites... and NOTHING private. Victory!", key: "boss-final-5" },
      ],
    },
  ],

  // Legacy flat fallback (used only if bossPhases is ever cleared).
  bossQuestions: {
    easy: [
      { question: "Which of these is PRIVATE?", answers: ["Your home address", "Your favorite pizza", "A cartoon you like", "Your favorite color"], correctIndex: 0, explanation: "An address tells strangers where you live." },
      { question: "Which username is SAFE?", answers: ["CometWizard77", "emma2017", "Jake_Age9", "MapleHill_Star"], correctIndex: 0, explanation: "No real name, age or school - a mask with no holes." },
      { question: "A quiz app asks for your address. Does it need it?", answers: ["No - quizzes don't visit houses", "Yes", "Only to send your results", "Half of it"], correctIndex: 0, explanation: "A quiz needs none of that to work." },
    ],
    medium: [
      { question: "Which is FINE to share?", answers: ["Your favorite game", "Your school's name", "Your phone number", "Where you are right now"], correctIndex: 0, explanation: "Favorites give nothing away." },
      { question: "An app asks for MORE than it needs. You...", answers: ["Close it and tell a grown-up", "Fill it in", "Give it half", "Skip the nosy parts and fill in the rest"], correctIndex: 0, explanation: "Over-asking = too nosy." },
      { question: "You're not sure if something's safe to type. You...", answers: ["Pause and ask a grown-up", "Type it quickly", "Guess", "Ask a friend instead"], correctIndex: 0, explanation: "The golden rule: ask first." },
    ],
    hard: [
      { question: "'Win 1000 coins - just tell me your school!' You...", answers: ["Refuse and tell a grown-up", "Take the deal", "Name a different school", "Ask for the coins first"], correctIndex: 0, explanation: "No prize is worth your private info." },
      { question: "What makes 'emma2017' risky?", answers: ["Real name + birth year", "Too many letters", "No symbols", "Nothing"], correctIndex: 0, explanation: "Two real clues about the real you." },
      { question: "The rule for private info is: it says...", answers: ["WHO you are or WHERE you are", "Anything fun", "Anything long", "Anything online"], correctIndex: 0, explanation: "That's the test - who you are, where you are." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 2 - guard your secrets!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He got our details - don't let him get yours!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Five treasures. All private." }, layla: null }, // learn: private
    4: { adam: null, layla: { mood: "worried", message: "Peek at his plans - then slam them shut!" } }, // game: reveal
    5: { adam: { mood: "thumbsup", message: "Prove it - which one's private?" }, layla: null }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Favorites are fine. YOU-stuff is not." } }, // learn: sort
    8: { adam: { mood: "excited", message: "Drag every treasure home!" }, layla: null }, // game: conveyor
    9: { adam: null, layla: { mood: "excited", message: "Quick - which one stays locked?" } }, // prove: quick-sort
    10: { adam: { mood: "thumbsup", message: "Best vault-guard I've ever met." }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "One question beats the trick: WHY?" }, layla: null }, // learn: why
    12: { adam: { mood: "curious", message: "Inspect every clue, detective." }, layla: null }, // game: inspector
    13: { adam: null, layla: { mood: "worried", message: "He's fibbing again - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Form detective - certified!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Every hero needs a mask." } }, // learn: identity
    16: { adam: { mood: "excited", message: "Forge that hero name!" }, layla: null }, // game: builder
    17: { adam: null, layla: { mood: "excited", message: "Quick - tap the safe one!" } }, // prove: speed
    18: { adam: { mood: "thumbsup", message: "Identity: secret. Mask: sealed." }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Not sure? That's what backup is for." }, layla: null }, // learn: ask
    20: { adam: { mood: "curious", message: "Feel the tingle? Hit PAUSE." }, layla: null }, // game: decide
    21: { adam: null, layla: { mood: "thumbsup", message: "Finish the golden rule!" } }, // prove: finish
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Sort his grab list - fast!" } }, // consolidation
    24: { adam: { mood: "worried", message: "The Profile Forge - give him NOTHING!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch his form come back blank!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Privacy Guardian badge earned!" }, layla: null }, // completion
  },
};

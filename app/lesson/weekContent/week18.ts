import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 18 - Sharing Devices: Lock Before You Leave
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 RACK     lots of devices are shared          | hookSort       | recall
 *     2 RELAY    log out when you're done            | buttonHunt     | speed
 *     3 DOOR     lock it (a lock screen = front door)| passcodeForge  | finish
 *     4 CHEST    respect other people's privacy      | chooseYourPath | lie
 *     5 BALLOON  never save passwords on shared kit  | replyCards     | recall
 *   Consolidation (cyberScanner, Morning Relay skin) -> boss
 *   (placeholder quiz boss - the bespoke W18 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: beat 1 is hookSort's fifth outing 2 weeks after W16's
 * Sticker Peel (conveyorSort ran only last week as W17's Photo Wall);
 * beat 2 takes buttonHunt's W6-earmarked log-out slot 4 weeks after
 * W14's Dusk Watch; beat 3 debuts the small NEW passcodeForge engine
 * (the BUILD ledger's anvil dressing - no W1 password re-teach, this is
 * about HAVING a lock); beat 4 is chooseYourPath on the respect beat
 * (villain kept OFF it - it's an empathy beat, W5/W11 precedent); beat
 * 5 gives replyCards a new BALLOONS skin (same freshness move as W5's
 * doors and W8's levers) 2 weeks after W16's Clear-Glass Doors.
 * Lane-clean: shared-vs-mine / log-out / lock-screens / respect /
 * save-password balloons - password STRENGTH was W1's lane, app
 * permissions W9's, device ears W14's. In-week flavour: the Family
 * Tablet. Palette: morning warm (breakfast relay + chest glow).
 */
export const WEEK_18: WeekContent = {
  weekNumber: 18,
  title: "Sharing Devices: Lock Before You Leave",
  topic: "sharing-devices",
  badgeName: "Lock Master",
  badgeIcon: "🗝️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 18: LOCK BEFORE YOU LEAVE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the family tablet
    { type: "video", videoPlaceholder: "Week 18: The Family Tablet", videoSrc: "/videos/module-18-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[18] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-18.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon doesn't need to crack anything this week - he just waits. A family tablet left signed in on the kitchen shelf, a school computer still wearing the last kid's name, SAVE PASSWORD balloons bobbing over every login... every left-open device is a door he can stroll through wearing YOUR face. This week you become the Lock Master: spot the shared devices, log out like a relay runner, forge a front-door code - and pop every sticky balloon.",
      photoCaption: "Wk 18 - The Family Tablet",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Spot which devices are shared",
        "Log out and lock before you leave",
        "Closed chests stay closed",
      ],
    },

    // Signature mini-game (bespoke to this week)
    {
      type: "signature",
      mechanic: "logOutFlick",
      title: "Log-Out Flick",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Break is over, hero. Time to sweep the shared tablet.",
          "Flick every open card down to log it out.",
          "Look back for sneaky ones, then tap the lock before you leave.",
        ],
      },
    },

    /* ─────────── BEAT 1 · THE COAT RACK ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "The Coat Rack",
      content:
        "Think of the hallway coat rack: some hooks are yours, most belong to everybody. Devices work the same way. The family tablet on the kitchen shelf, the school computers, the living-room console - those hang on EVERYONE'S hook: lots of hands, lots of logins, all day long. Your own gear - your sticker-covered tablet, your camera - hangs on YOUR hook. First Lock Master power: always know WHICH hook the device you're holding came off, because everyone's-hook devices need extra care when you leave.",
      bullets: [
        "The family tablet - everyone's hands",
        "School computers - a new kid every lesson",
        "The living-room console - whole-family games",
        "Your own gear hangs on YOUR hook",
        "Shared = extra care when you leave",
      ],
      bulletIcons: ["📱", "🏫", "🎮", "🏷️", "🗝️"],
      emblem: "📱",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Week eighteen - the family tablet week!",
          "Picture the hallway coat rack.",
          "Some hooks are yours. Most belong to EVERYBODY.",
          "[warmly] Devices are exactly the same.",
          "The kitchen tablet? Everyone's. Your sticker tablet? Yours.",
          "[curious] Can you tell which is which? Let's find out!",
        ],
      },
    },
    // 4 - Game: SORT (hookSort re-dress - the Coat Rack)
    {
      type: "hookSort",
      introTitle: "The Coat Rack",
      introSubtitle: "Devices are arriving at the hallway rack one at a time. Hang each one on the right hook: JUST MINE, or EVERYONE'S!",
      introIcon: "📱",
      reelLabel: "JUST MINE",
      cutLabel: "EVERYONE'S!",
      reelToast: "YOUR HOOK!",
      cutToast: "SHARED - EXTRA CARE!",
      wrongScamTitle: "That one's everyone's!",
      wrongRealTitle: "That one's just yours!",
      completeTitle: "The rack is sorted!",
      completeLine: "Know which hook it came off - everyone's-hook devices get the log-out-and-lock care.",
      items: [
        {
          id: "kitchen-tablet",
          text: "The family tablet on the kitchen shelf",
          icon: "📱",
          isScam: true,
          explanation: "Mom's recipes, Dad's news, your games, your sister's drawings - that tablet belongs to EVERYBODY, so it hangs on everyone's hook.",
        },
        {
          id: "sticker-tablet",
          text: "Your own tablet - dinosaur stickers, your login only",
          icon: "🏷️",
          isScam: false,
          explanation: "Your stickers, your login, your hook - this one's just yours.",
        },
        {
          id: "school-computer",
          text: "The school computer in the computer lab",
          icon: "🏫",
          isScam: true,
          explanation: "A different kid sits at that keyboard every single lesson - school computers are as shared as devices get.",
        },
        {
          id: "drawing-pad",
          text: "Your drawing pad that lives in your backpack",
          icon: "🎨",
          isScam: false,
          explanation: "It rides in YOUR backpack and nobody else touches it - your hook.",
        },
        {
          id: "console",
          text: "The living-room console the whole family plays",
          icon: "🎮",
          isScam: true,
          explanation: "Saturday racing with Dad, your cousin's football game - the living-room console is everyone's, hook and all.",
        },
        {
          id: "camera",
          text: "Your camera - a birthday present, only you use it",
          icon: "🎁",
          isScam: false,
          explanation: "A present with your name on the tag - just yours.",
        },
        {
          id: "library-computer",
          text: "The library computer - a different visitor every hour",
          icon: "🌍",
          isScam: true,
          explanation: "Strangers all day long - a library computer is the most everyone's-hook device in town.",
        },
        {
          id: "handheld",
          text: "Your handheld console - every saved game is yours",
          icon: "🚀",
          isScam: false,
          explanation: "Your saves, your pocket, your hook.",
        },
      ],
      hints: {
        tier1: "Ask the hook question: how many different HANDS touch this device?",
        tier2: "Kitchen shelf, classroom, living room, library = everyone's. Stickers, backpack, birthday tag, your pocket = just yours.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The coat rack - devices incoming!",
          "One question for each:",
          "how many different hands touch it?",
          "[warmly] Lots of hands, everyone's hook. Just yours? Your hook. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["First device is here - whose hands touch it? Hang it on the right hook!"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these is a SHARED device?",
      choices: [
        { text: "The family tablet on the kitchen shelf", isCorrect: true },
        { text: "The dinosaur-sticker tablet in your backpack", isCorrect: false },
        { text: "Your drawing pad", isCorrect: false },
        { text: "Your birthday camera", isCorrect: false },
      ],
      praise: "The kitchen shelf one - everyone's hands, everyone's hook, extra care. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Family tablet, school computer, living-room console hang on EVERYONE'S hook - know which device you're on before anything else.",
      next: "the relay-runner move that hands a shared device back clean",
      emblem: "📱",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - you can spot a shared device!",
          "Everyone's hook, extra care.",
          "[whispers] But what happens if you walk away still signed in...?",
          "The breakfast relay will show you. Come on.",
        ],
      },
    },

    /* ─────────── BEAT 2 · THE LOG-OUT RELAY ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "The Log-Out Relay",
      content:
        "On a shared device you're a relay runner: you use it, then you HAND IT OVER clean. Here's why it matters - if you walk away still signed in, the next person is wearing YOUR name. They could post as you, read your messages, spend your coins... without even meaning to! And watch the sneaky ones: tapping Home just hides your apps, and switching the screen off just makes it dark - your accounts stay open behind both. Only one button hands the baton over clean, and it says LOG OUT.",
      bullets: [
        "Shared device = a relay race",
        "Stay signed in = the next kid wears your name",
        "They could post and spend as YOU",
        "Home and screen-off don't close accounts",
        "Only LOG OUT hands the baton clean",
      ],
      bulletIcons: ["🏠", "🎭", "💬", "🙈", "✅"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[curious] Ever seen a relay race?",
          "Run your bit, hand the baton over CLEAN.",
          "[whispers] Walk away signed in, and the next kid... wears your name.",
          "Your posts. Your coins. Your messages.",
          "[warmly] And no - tapping Home doesn't count. Screen-off doesn't count.",
          "[excited] Only LOG OUT counts. Three accounts are open - let's run the relay!",
        ],
      },
    },
    // 8 - Game: FIND (buttonHunt re-dress - the Log-Out Relay)
    {
      type: "buttonHunt",
      menuTitle: "The Family Tablet",
      scenario: "Breakfast relay! You used three apps and school starts soon - hand the tablet over clean.",
      introTitle: "The Log-Out Relay",
      introSubtitle: "Three of your accounts are still open on the family tablet. Find all three LOG OUT buttons - and don't let the decoys fool you!",
      introIcon: "🗝️",
      buttons: [
        {
          id: "logout-game",
          label: "Log out - Blast Racers",
          icon: "🎮",
          targetOrder: 1,
          note: "Baton one handed over - your racing coins are safe behind you!",
        },
        {
          id: "home",
          label: "Home screen",
          icon: "🏠",
          note: "Home just HIDES your apps - you're still signed in behind it. The sneakiest non-log-out there is.",
        },
        {
          id: "logout-art",
          label: "Log out - Art Cloud",
          icon: "🎨",
          targetOrder: 2,
          note: "Baton two - your gallery closes its doors behind you!",
        },
        {
          id: "brightness",
          label: "Brightness",
          icon: "💡",
          note: "A shinier screen... with the same three accounts wide open on it.",
        },
        {
          id: "stay-signed-in",
          label: "Keep me signed in",
          icon: "✅",
          note: "The keep-me-signed-in trap! On a shared tablet this props every door open - never this one.",
        },
        {
          id: "logout-chat",
          label: "Log out - Chirp Chat",
          icon: "💬",
          targetOrder: 3,
          note: "Baton three - relay complete, nobody wears your name today!",
        },
        {
          id: "volume",
          label: "Volume",
          icon: "🔔",
          note: "Louder cartoons, same open accounts.",
        },
        {
          id: "new-tab",
          label: "New tab",
          icon: "📋",
          note: "That opens MORE doors - today we're closing them.",
        },
        {
          id: "screen-off",
          label: "Screen off",
          icon: "⏸️",
          note: "The screen goes dark but your accounts stay open behind it - sleep isn't log-out.",
        },
      ],
      hints: {
        tier1: "Look for the words LOG OUT - there's one for each open app.",
        tier2: "Home, brightness, volume and screen-off don't close anything. Find the three buttons that actually say LOG OUT.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The relay is ON!",
          "Three apps, three batons to hand over.",
          "[whispers] Watch out - some buttons only PRETEND to finish the race.",
          "Find every LOG OUT. Go go go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Scan the menu for the words LOG OUT - start with your racing game!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - the button that hands a shared tablet back clean!",
      speedMs: 5000,
      choices: [
        { text: "LOG OUT", isCorrect: true },
        { text: "HOME SCREEN", isCorrect: false },
        { text: "VOLUME UP", isCorrect: false },
      ],
      praise: "LOG OUT at relay speed - baton handed over clean! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Walk away signed in and the next person wears your name - Home and screen-off don't count, only LOG OUT hands the baton clean.",
      next: "the front door every device needs - and the forge that makes one",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power two - relay runner form!",
          "Every baton handed over clean.",
          "[whispers] But what about the device itself, just lying there...",
          "unlocked? Time to forge it a front door.",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE FRONT DOOR ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "The Front Door",
      content:
        "Your house has a front door, and it locks. A device needs one too - that's what the lock screen is. No lock code means anyone who picks it up walks straight in: the kid who finds it on the bus, the cousin who 'just wants a look'. And one more Lock Master secret: the code itself mustn't be a story a guesser can read. 1-2-3-4 is the first thing anyone tries, 0-0-0-0 is the second, and your birthday? The whole family knows it. Pick digits with NOTHING to guess.",
      bullets: [
        "A lock screen is a front door",
        "No code = anyone walks in",
        "1-2-3-4 is every guesser's first try",
        "Birthdays are family-famous",
        "Forge digits with nothing to guess",
      ],
      bulletIcons: ["🚪", "🔓", "🔢", "🎂", "🔨"],
      emblem: "🔨",
      narration: {
        speaker: "adam",
        lines: [
          "[curious] Would you leave your house with no front door?",
          "Of course not!",
          "A lock screen IS the front door - every device needs one.",
          "[whispers] But careful: some codes tell guessers a story.",
          "One-two-three-four? First thing anyone tries.",
          "[excited] The forge is hot - let's hammer out a code with NO story!",
        ],
      },
    },
    // 12 - Game: BUILD (NEW passcodeForge - the Passcode Forge)
    {
      type: "passcodeForge",
      introTitle: "The Passcode Forge",
      introSubtitle: "The family tablet has NO lock code! Three pairs of digits forge one. At each strike, pick the metal a guesser can't read a story off.",
      introIcon: "🔨",
      meterLabel: "GUESS-O-METER",
      strikeToast: "CLANG! GUESS-PROOF!",
      wrongTitle: "A guesser would crack that one!",
      completeTitle: "The lock clicks shut!",
      completeLine: "The tablet has a front door now - and its code tells guessers nothing at all.",
      rounds: [
        {
          id: "first",
          prompt: "Forge the FIRST pair",
          options: [
            {
              digits: "12",
              tell: "the start of 1-2-3-4",
              isStrong: false,
              explanation: "1-2-3-4 is the first code every guesser on Earth tries - starting with 12 hands them the story on a plate.",
            },
            {
              digits: "58",
              tell: "no pattern, no story",
              isStrong: true,
              explanation: "",
            },
            {
              digits: "00",
              tell: "the lazy double-zero",
              isStrong: false,
              explanation: "0-0-0-0 is the second code every guesser tries - double zeros are the laziest metal in the forge.",
            },
          ],
        },
        {
          id: "middle",
          prompt: "Forge the MIDDLE pair",
          options: [
            {
              digits: "34",
              tell: "finishes 1-2-3-4",
              isStrong: false,
              explanation: "Put 34 after anything and the counting story continues - guessers LOVE a pattern that finishes itself.",
            },
            {
              digits: "07",
              tell: "your birthday month",
              isStrong: false,
              explanation: "Your birthday month is family-famous - Grandma knows it, your cousin knows it, and guessers try birthdays third.",
            },
            {
              digits: "93",
              tell: "means nothing to anyone",
              isStrong: true,
              explanation: "",
            },
          ],
        },
        {
          id: "last",
          prompt: "Forge the LAST pair",
          options: [
            {
              digits: "41",
              tell: "quiet, random, guess-proof",
              isStrong: true,
              explanation: "",
            },
            {
              digits: "56",
              tell: "keeps on counting",
              isStrong: false,
              explanation: "5-6 keeps the counting song going - any pattern a kid can sing, a guesser can sing too.",
            },
            {
              digits: "77",
              tell: "double trouble",
              isStrong: false,
              explanation: "Doubles are the guesser's warm-up lap - 7-7, 8-8, 9-9, they rattle through them in seconds.",
            },
          ],
        },
      ],
      hints: {
        tier1: "Read each blank's little story - if a guesser could READ it, don't hammer it.",
        tier2: "Counting runs (12, 34, 56), doubles (00, 77) and birthdays all tell stories. Pick the quiet metal that means nothing.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The forge is ROARING!",
          "Three strikes, three pairs, one lock code.",
          "[whispers] Skip the metal with a story on it...",
          "counting, doubles, birthdays - guessers read those.",
          "[excited] Hammer the quiet metal. Strike one - go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read all three blanks first - which one tells a guesser NOTHING?"],
      },
    },
    // 13 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Before you leave it, ___ it.",
      choices: [
        { text: "lock", isCorrect: true },
        { text: "shake", isCorrect: false },
        { text: "hide", isCorrect: false },
        { text: "polish", isCorrect: false },
      ],
      praise: "LOCK it - the front door clicks shut behind you, every time. ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A lock screen is a device's front door - have one, and forge a code with no story for guessers to read.",
      next: "the chests OTHER people leave open - and what a hero does about them",
      emblem: "🔨",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power three - forged and locked!",
          "A front door with a quiet code.",
          "[warmly] Now for the gentle one...",
          "what about the things OTHER people leave open?",
        ],
      },
    },

    /* ─────────── BEAT 4 · THE CLOSED CHEST ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "The Closed Chest",
      content:
        "Sharing cuts both ways. Sometimes YOU'RE the one who finds a chest open: your sister's diary app glowing on the family tablet, your brother's chat left up, the last kid's account still on the school computer. Here's the Lock Master truth: a closed chest isn't yours to open - and an ACCIDENTALLY open one still isn't. Peeking is peeking, even when it's easy. The hero move has three steps: don't read, close it gently, tell them - because that's exactly what you'd want for YOUR chest.",
      bullets: [
        "Sharing cuts both ways",
        "A closed chest isn't yours to open",
        "Accidentally open still isn't yours",
        "Don't read - close it gently",
        "Tell them - you'd want the same",
      ],
      bulletIcons: ["👪", "🤐", "🙈", "🤫", "💬"],
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] This power is the gentle one.",
          "Sometimes it's YOU who finds something open.",
          "A diary app. A chat. Somebody's account.",
          "[whispers] Open by accident... is still not yours.",
          "Don't read it, close it gently, tell them.",
          "[warmly] Because that's what you'd want for your chest. Three moments - show me.",
        ],
      },
    },
    // 16 - Game: DECIDE (chooseYourPath - the Dust-and-Close; villain OFF this empathy beat)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "The family tablet is on the sofa - and your sister's diary app is glowing, wide open. 'Dear Diary...' is RIGHT THERE...",
          choices: [
            {
              text: "Close it without reading, then tell her it was open",
              isSafe: true,
              consequence: "She goes pink, locks it with a code, and says thanks about nine times. At dinner she lets you pick the film - trust is the best trade there is.",
            },
            {
              text: "Just one little peek - she'll never know",
              isSafe: false,
              consequence: "Now you know her secret wish and it sits in your tummy like a swallowed marble. She'd never have shown you - open by accident was never an invitation.",
            },
          ],
        },
        {
          setup: "Your brother sprinted to football and left his chat open on the shared computer. The top message says 'don't tell anyone but...'",
          choices: [
            {
              text: "Look away, close the window, tell him at dinner",
              isSafe: true,
              consequence: "He skids back in a panic an hour later - and finds it closed. 'YOU closed it? Legend.' Next week he spots YOUR game left open... and closes it, no peeking. It comes back around.",
            },
            {
              text: "Scroll up a bit - he left it open, so it's fine",
              isSafe: false,
              consequence: "'He left it open' is the Raccoon's kind of excuse - an open door doesn't make it your room. Secrets read by accident still can't be un-read.",
            },
          ],
        },
        {
          setup: "You sit down at the school computer and the kid before you is STILL SIGNED IN. Their homework folder is right there...",
          choices: [
            {
              text: "Log them out untouched and mention it to the teacher",
              isSafe: true,
              consequence: "The teacher says 'good catch' and reminds the whole class about the relay rule. That kid never knows what you DIDN'T look at - which is exactly what makes it the hero move.",
            },
            {
              text: "Have a quick look through their files first",
              isSafe: false,
              consequence: "Their stories, their pictures, their marks - none of it yours, and you'd feel it if it were YOUR folder. Left signed in is a mistake to fix, not a ticket to snoop.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three open chests. Three chances.",
          "Remember: open by accident isn't an invitation.",
          "Don't read it, close it gently, tell them -",
          "[excited] show me the Lock Master's gentle side!",
        ],
      },
    },
    // 17 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "If it's already OPEN, it's fine to have a little look! Open means invited - everybody knows that!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted - open by accident is NOT an invitation. Close it, tell them, walk tall. ✓",
      nudge: "If it was YOUR diary left open, would 'it was open' feel like an invitation?",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Other people's stuff isn't yours to read, even left open - don't read it, close it gently, tell them.",
      next: "the sticky balloon that bobs up at every login - and how to pop it",
      emblem: "🤫",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power four - and it's the kindest one!",
          "Closed chests stay closed, both ways.",
          "[whispers] One power left... hear that squeaky bobbing sound?",
          "The SAVE PASSWORD balloon. Pin ready.",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE SAVE-ME BALLOON ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Save-Me Balloon",
      content:
        "Every time you log in somewhere, a shiny balloon bobs up: SAVE PASSWORD? KEEP ME SIGNED IN? Tap yes and the DEVICE remembers you - which sounds handy, until you remember whose hands touch a shared device. Saving your password on the family tablet, the school computer or a borrowed phone hands your account to whoever picks it up next. So the Lock Master rule: on a shared or borrowed device, the answer is always NO THANKS - pop! On your OWN device, ask your grown-up first - there it can be OK.",
      bullets: [
        "The balloon bobs up at every login",
        "SAVE = the device remembers you",
        "Shared device = whoever's next gets in",
        "Shared or borrowed: NO THANKS - pop!",
        "Your own device: ask your grown-up",
      ],
      bulletIcons: ["💬", "🔓", "👪", "✋", "✅"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[curious] Hear that squeak? There it is again!",
          "SAVE PASSWORD? KEEP ME SIGNED IN?",
          "[whispers] Tap yes on a shared device...",
          "and whoever picks it up next walks straight into your account.",
          "[warmly] Shared or borrowed? NO THANKS - pop. Your own? Ask first.",
          "[excited] Four balloons are bobbing - pin at the ready!",
        ],
      },
    },
    // 20 - Game: SELECT (replyCards BALLOONS skin - the Balloon Refuser)
    {
      type: "replyCards",
      skin: "balloons",
      introTitle: "The Balloon Refuser",
      introSubtitle: "SAVE-ME balloons are bobbing up on every device in town. Pop the right answer on each one - and remember to check WHOSE device it is first!",
      introIcon: "✋",
      pickLabel: "Pop your answer",
      roundNoun: "Balloon",
      correctToast: "POP! SQUEAK!",
      wrongTitle: "The balloon got you!",
      completeTitle: "Every balloon handled!",
      completeLine: "Shared or borrowed: NO THANKS. Your own: ask your grown-up first.",
      scoreNoun: "balloons popped",
      rounds: [
        {
          id: "school",
          from: "THE SCHOOL COMPUTER",
          fromIcon: "🏫",
          message: "🎈 SAVE PASSWORD for next time? So handy!",
          replies: [
            {
              text: "NO THANKS - pop!",
              isSafe: true,
              explanation: "",
            },
            {
              text: "YES - saves typing tomorrow",
              isSafe: false,
              explanation: "A different kid sits here every lesson - save it, and tomorrow's kid walks straight into your account. On school computers it's NO, every time.",
            },
          ],
        },
        {
          id: "family-tablet",
          from: "THE FAMILY TABLET",
          fromIcon: "📱",
          message: "🎈 KEEP ME SIGNED IN? You'll be back soon anyway!",
          replies: [
            {
              text: "YES - I use it every day",
              isSafe: false,
              explanation: "Everyone's hands, remember? Signed-in-forever means your little cousin is posting as you by dinnertime. Relay rule: log out, every time.",
            },
            {
              text: "NO - sign me out when I'm done",
              isSafe: true,
              explanation: "",
            },
          ],
        },
        {
          id: "cousins-phone",
          from: "YOUR COUSIN'S PHONE",
          fromIcon: "🎮",
          message: "🎈 REMEMBER THIS LOGIN? One tap and it's saved!",
          replies: [
            {
              text: "NO THANKS - it's not my phone",
              isSafe: true,
              explanation: "",
            },
            {
              text: "YES - we play this game together anyway",
              isSafe: false,
              explanation: "When the phone goes home in your cousin's pocket, your saved account goes with it - borrowed devices never keep your keys.",
            },
          ],
        },
        {
          id: "own-tablet",
          from: "YOUR OWN TABLET (Mom's right beside you)",
          fromIcon: "🏷️",
          message: "🎈 SAVE PASSWORD on this device?",
          replies: [
            {
              text: "SAVE IT - no need to ask anyone",
              isSafe: false,
              explanation: "On your OWN tablet saving can be fine - but ask-first still rules. Your grown-up knows things you don't, like who else borrows it on car trips.",
            },
            {
              text: "ASK MOM FIRST - on MY tablet it can be OK",
              isSafe: true,
              explanation: "",
            },
          ],
        },
      ],
      hints: {
        tier1: "First question, every time: WHOSE device is this?",
        tier2: "Shared or borrowed = NO THANKS, always. Your own device = ask your grown-up first.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four balloons, four devices!",
          "Before you pop anything, ask:",
          "whose device is this?",
          "[warmly] Shared says no. Your own asks first. Pin up!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Check the device name at the top first - then pop your answer!"],
      },
    },
    // 21 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Where could 'Save password?' be OK - with a grown-up's yes?",
      choices: [
        { text: "Your own tablet at home", isCorrect: true },
        { text: "The school computer", isCorrect: false },
        { text: "The library computer", isCorrect: false },
        { text: "Your cousin's phone", isCorrect: false },
      ],
      praise: "Your own device, with your grown-up's yes - everywhere else the balloon gets popped. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "SAVE PASSWORD on shared or borrowed devices always gets a NO - on your own device, ask your grown-up first.",
      next: "one last morning relay through the house, then the Raccoon's den itself",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Lock Master!",
          "Hooks sorted, batons handed, the door forged,",
          "chests respected... and every balloon popped.",
          "[whispers] One last relay through the house...",
          "[excited] then we lock the Raccoon out for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Morning Relay (W1 scanner engine, W18 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "CLEAN HANDOFF",
        negative: "LEFT OPEN",
        positiveHint: "Tap CLEAN HANDOFF for true Lock Master form",
        negativeHint: "Tap LEFT OPEN for doors the Raccoon strolls through",
        tipWhenPositive: "Logged out, locked up, chests closed, balloons popped - stamp it CLEAN.",
        tipWhenNegative: "Signed-in screens, no lock codes, sneaky peeks, saved passwords - all doors left open.",
        hint1: "Ask: does this hand the device over clean... or leave a door open behind you?",
        hint2: "CLEAN = log out, lock it, close chests, pop balloons. OPEN = stay signed in, no code, peek, save.",
        hint2Example: "CLEAN: 'logged out before school'   OPEN: 'saved my password on the library computer'",
        hint3: "Lock Master card: know the hook · log out · lock the door · close the chest · pop the balloon.",
        hint3Example: "Telling your sister her diary was open ✅    Reading it first ❌",
      },
      items: [
        {
          text: "Logging out of your game before school",
          isStrong: true,
          explanation: "Baton handed over clean - nobody wears your name at breakfast.",
        },
        {
          text: "Staying signed in on the school computer - it's quicker",
          isStrong: false,
          explanation: "Quicker for you, quicker for the next kid to walk in as YOU - the relay rule exists for exactly this.",
        },
        {
          text: "A lock code that isn't 1-2-3-4 or a birthday",
          isStrong: true,
          explanation: "A front door with a quiet code - guessers read nothing off it.",
        },
        {
          text: "Reading the diary app someone left open",
          isStrong: false,
          explanation: "Open by accident is not an invitation - that chest was closed in every way that matters.",
        },
        {
          text: "Closing your brother's chat without reading, then telling him",
          isStrong: true,
          explanation: "Don't read it, close it gently, tell them - the gentle power in action.",
        },
        {
          text: "Tapping YES on SAVE PASSWORD at the library",
          isStrong: false,
          explanation: "A different visitor every hour, and now the machine remembers YOUR keys - that balloon needed popping.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Morning Relay - final lap!",
          "House moments are coming past.",
          "CLEAN HANDOFF for Lock Master form...",
          "[warmly] LEFT OPEN for the Raccoon's favorite doors. Stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W18 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: lock before you leave
    { type: "video", videoPlaceholder: "Week 18: Lock Before You Leave", videoSrc: "/videos/module-18-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "rack", label: "Coat-Rack Sorter", accent: "#ffd158", icon: "📱", summary: "Family tablet, school computer, living-room console - you know exactly which devices are everyone's." },
        { id: "relay", label: "Log-Out Legend", accent: "#7df0ff", icon: "🎭", summary: "You hand shared devices back clean - nobody wears your name after you leave." },
        { id: "forge", label: "Passcode Smith", accent: "#7eff97", icon: "🔨", summary: "Every device gets a front door - with a code that tells guessers nothing." },
        { id: "chest", label: "Chest Closer", accent: "#c084fc", icon: "🤫", summary: "Open or closed, other people's stuff isn't yours to read - don't read it, close it gently, tell them." },
        { id: "balloon", label: "Balloon Popper", accent: "#ff5fb3", icon: "✋", summary: "SAVE PASSWORD on a shared device? NO THANKS - pop, every single time." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Hooks sorted, batons handed over,",
          "the door forged, the chests closed... and the balloons popped.",
          "[laughs] Every door he was counting on just clicked shut.",
          "[excited] Sticker time, Lock Master!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "log-out-legend", name: "Log-Out Legend", icon: "🎭", description: "Hands every shared device back clean - nobody wears their name." },
        { id: "passcode-smith", name: "Passcode Smith", icon: "🔨", description: "Forges lock codes with no story for guessers to read." },
        { id: "balloon-popper", name: "Balloon Popper", icon: "✋", description: "Pops SAVE PASSWORD balloons on every shared device in town." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#62b6cb",
    theme: {
      topic: "Sharing Devices",
      motifs: ["🔒", "🔑", "👤", "🚪", "🛡️", "📱", "⚙️", "🔐"],
    },
    intro: {
      slug: "quiz-w18-intro",
      text: "So you think you're a Lock Master now? I've slipped through a thousand left-open screens, and yours will be next, unless you can answer me door for door!",
    },
    victory: {
      slug: "quiz-w18-victory",
      text: "Every hook checked, every door bolted, every balloon popped?! There isn't a single crack left in this house for a raccoon to wiggle through! I'm off to find a family that never logs out!",
    },
    questions: [
      {
        phaseId: "phase-w18-c1",
        key: "quiz-w18-c1-1",
        label: "Spot the Shared Device",
        ask: {
          slug: "quiz-w18-ask-c1-1",
          text: "Layla is about to open her diary app. One of these screens deserves EXTRA care before she types anything. Which one?",
        },
        options: [
          { text: "The computer in the school library" },
          { text: "Her own tablet with her name stickers on it" },
          { text: "The e-reader she got for her birthday" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Everyone's hands, extra care!",
          explanation: "Her own tablet and her birthday e-reader hang on HER hook, but the library computer hangs on everyone's. When lots of hands share a screen, that's the one that gets extra care.",
        },
        villainRight: {
          slug: "quiz-w18-right-c1-1",
          text: "The LIBRARY one?! How did you know that's where I do my best lurking?!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c1-1",
          text: "Type away, type away! Forty kids use that computer, and one of them has a stripey tail!",
        },
      },
      {
        phaseId: "phase-w18-c2",
        key: "quiz-w18-c2-1",
        label: "The Log-Out Relay",
        ask: {
          slug: "quiz-w18-ask-c2-1",
          text: "Adam finishes his game on the library computer and taps the little X to close the window. Is his account safe now?",
        },
        options: [
          { text: "No, the X just hides the window, only LOG OUT shuts the door" },
          { text: "Yes, the X signs him out all by itself" },
          { text: "Yes, library computers wipe everything at closing time" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The X only hides it!",
          explanation: "Closing a window is like sliding a book over your open diary, everything is still there underneath. Only tapping LOG OUT actually shuts your account before the next person sits down.",
        },
        villainRight: {
          slug: "quiz-w18-right-c2-1",
          text: "You know about the X trick?! That little X has fed me for YEARS!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c2-1",
          text: "One tap of the X and off you skip! Meanwhile your account sits there warm and cozy, waiting for meeee!",
        },
      },
      {
        phaseId: "phase-w18-c3",
        key: "quiz-w18-c3-1",
        label: "The Front Door",
        ask: {
          slug: "quiz-w18-ask-c3-1",
          text: "I read lock codes like bedtime stories! Adam's soccer number is 9 and his birthday is June 2. Which code tells me NOTHING?",
        },
        options: [
          { text: "83-51-27" },
          { text: "99-99-99" },
          { text: "06-02-16" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Codes with no story!",
          explanation: "His soccer nines and his birthday digits are stories a guesser can read about him. Quiet digits that mean nothing to anybody are the ones no guesser can figure out.",
        },
        villainRight: {
          slug: "quiz-w18-right-c3-1",
          text: "Eighty-three, fifty-one, WHAT?! I read that code front to back and learned absolutely nothing!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c3-1",
          text: "A story code! I read the soccer newsletter AND the birthday calendar, so I already know the ending!",
        },
      },
      {
        phaseId: "phase-w18-c4",
        key: "quiz-w18-c4-1",
        label: "The Closed Chest",
        ask: {
          slug: "quiz-w18-ask-c4-1",
          text: "On the bus, the kid next to Adam falls asleep and their phone slips out, screen glowing and unlocked. What's the Lock Master move?",
        },
        options: [
          { text: "Leave it alone, an unlocked phone still isn't an invitation" },
          { text: "Take one tiny peek, then put it back exactly where it was" },
          { text: "Scroll through it to check the kid isn't in any trouble" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Open isn't an invitation!",
          explanation: "Even one tiny peek, even a helpful-sounding peek, is still reading someone's private things. A phone that isn't yours stays a closed chest, glowing or not.",
        },
        villainRight: {
          slug: "quiz-w18-right-c4-1",
          text: "You didn't even PEEK?! That was a free sample and you just walked past it!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c4-1",
          text: "Yes, peek! Everybody peeks! And once you've peeked, you can never un-know my favorite hobby!",
        },
      },
      {
        phaseId: "phase-w18-c5",
        key: "quiz-w18-c5-1",
        label: "The Save-Me Balloon",
        ask: {
          slug: "quiz-w18-ask-c5-1",
          text: "On Grandad's computer, the SAVE PASSWORD balloon pops up. Grandad smiles and says: go on, save it, it's fine! What's the safest answer?",
        },
        options: [
          { text: "No thanks, it's a shared computer, so my keys shouldn't live in it" },
          { text: "Save it, a grown-up just said it was fine" },
          { text: "Save it now and delete it before going home" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Shared screens keep no keys!",
          explanation: "Grandad is being kind, but his computer is shared, so a saved password would wait there for whoever clicks next. The ask-first rule only opens the door on your OWN device.",
        },
        villainRight: {
          slug: "quiz-w18-right-c5-1",
          text: "But GRANDAD said yes! You out-ruled a grandad! Who does that?!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c5-1",
          text: "Saved on Grandad's computer! I visit on Sundays, you know. For the cookies. And the passwords!",
        },
      },
      {
        phaseId: "phase-w18-c1",
        key: "quiz-w18-c1-2",
        label: "Spot the Shared Device",
        ask: {
          slug: "quiz-w18-ask-c1-2",
          text: "Adam sits down at the living-room console the whole family plays on. What should he remember before he logs in?",
        },
        options: [
          { text: "Other hands use this screen, so it hangs on everyone's hook" },
          { text: "It's inside his own house, so it counts as just his" },
          { text: "Consoles don't really have accounts, so none of this matters" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Home can still be shared!",
          explanation: "Being in your own living room doesn't make a screen yours alone, and consoles hold accounts, coins, and chats just like tablets do. If the whole family uses it, it hangs on everyone's hook.",
        },
        villainRight: {
          slug: "quiz-w18-right-c1-2",
          text: "Even the cozy living-room one counts?! You're hanging hooks EVERYWHERE, it's a nightmare!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c1-2",
          text: "His house, his console, his rules? Wonderful! Somebody left the shopping app open, so now it's MY rules!",
        },
      },
      {
        phaseId: "phase-w18-c2",
        key: "quiz-w18-c2-2",
        label: "The Log-Out Relay",
        ask: {
          slug: "quiz-w18-ask-c2-2",
          text: "Layla is done on the family tablet. Which move actually hands it back clean?",
        },
        options: [
          { text: "Tapping LOG OUT inside her account" },
          { text: "Pressing Home so her apps disappear" },
          { text: "Turning the screen off so it goes dark" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Only LOG OUT counts!",
          explanation: "Home just hides your apps and screen-off just makes the glass go dark, your account stays open behind both. Tapping LOG OUT is the only move that hands the tablet over clean.",
        },
        villainRight: {
          slug: "quiz-w18-right-c2-2",
          text: "A real log-out?! But the Home button is RIGHT THERE, big and friendly and useless!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c2-2",
          text: "Dark screens and hidden apps, my two favorite doormats! One tap and everything's exactly where you left it, for me!",
        },
      },
      {
        phaseId: "phase-w18-c3",
        key: "quiz-w18-c3-2",
        label: "The Front Door",
        ask: {
          slug: "quiz-w18-ask-c3-2",
          text: "Layla's brand-new tablet arrives with no lock screen at all. Does it need one?",
        },
        options: [
          { text: "Yes, a screen with no lock is a house with no front door" },
          { text: "Only if she takes it outside, at home it's fine without one" },
          { text: "Not yet, brand-new tablets have nothing on them worth locking" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Every device gets a door!",
          explanation: "The moment she signs in to anything, that tablet is full of her stuff, and screens get borrowed and picked up at home too. Every device needs its front door from day one.",
        },
        villainRight: {
          slug: "quiz-w18-right-c3-2",
          text: "A front door from DAY ONE?! I had plans for that shiny new thing! Dinner plans!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c3-2",
          text: "No lock! Come in, come in! I'll wipe my paws on the mat, and I promise nothing else!",
        },
      },
      {
        phaseId: "phase-w18-c4",
        key: "quiz-w18-c4-2",
        label: "The Closed Chest",
        ask: {
          slug: "quiz-w18-ask-c4-2",
          text: "Layla picks up the family tablet and her brother's diary app is sitting wide open. What does she do?",
        },
        options: [
          { text: "Close it gently without reading and tell him it was open" },
          { text: "Read just the first page, since he's the one who left it open" },
          { text: "Screenshot it, in case she gets blamed for it later" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Don't read, close, tell!",
          explanation: "Leaving it open was an accident, not an invitation, and a screenshot is just a peek you keep. Close it gently and tell him, so he knows his chest is safe around you.",
        },
        villainRight: {
          slug: "quiz-w18-right-c4-2",
          text: "Closed WITHOUT reading?! I've been circling that diary for a week, and you shut it in one second!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c4-2",
          text: "Read it, save it, frame it! And when you're done, I know a raccoon who buys secondhand secrets!",
        },
      },
      {
        phaseId: "phase-w18-c5",
        key: "quiz-w18-c5-2",
        label: "The Save-Me Balloon",
        ask: {
          slug: "quiz-w18-ask-c5-2",
          text: "The SAVE PASSWORD balloon bobs up on Layla's very own phone at home. What's the rule there?",
        },
        options: [
          { text: "Ask her trusted grown-up first, her own device is the only maybe" },
          { text: "Always yes, saving is exactly what your own phone is for" },
          { text: "Always no, passwords can never be saved anywhere, ever" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Your own device? Ask first!",
          explanation: "On shared or borrowed screens the balloon always gets a NO, but her own phone is the one maybe. That's a question for her trusted grown-up, who knows where keys can safely live.",
        },
        villainRight: {
          slug: "quiz-w18-right-c5-2",
          text: "She asked a GROWN-UP?! There's no balloon big enough to float past a grown-up!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c5-2",
          text: "Always yes! Save them all! I love a phone that remembers everything, especially one left on a bus!",
        },
      },
      {
        phaseId: "phase-w18-c1",
        key: "quiz-w18-c1-3",
        label: "Spot the Shared Device",
        ask: {
          slug: "quiz-w18-ask-c1-3",
          text: "On vacation, the hotel lobby has a tablet that any guest can use. Layla wants to check her game on it. What is she looking at?",
        },
        options: [
          { text: "A shared device, a new stranger uses it every single night" },
          { text: "A safe device, hotels clean their tablets between guests" },
          { text: "Her family's device, since they paid for the room" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The share-iest screen of all!",
          explanation: "Cleaning wipes off fingerprints, not accounts, and paying for a room doesn't make the lobby tablet yours. A screen a new stranger uses every night needs the most care of all.",
        },
        villainRight: {
          slug: "quiz-w18-right-c1-3",
          text: "The LOBBY tablet?! That's my summer home! Do you know how many vacations I've borrowed from that thing?!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c1-3",
          text: "Log in, sandy fingers! Guest number one hundred says thank you, and guest number one-oh-one has a TAIL!",
        },
      },
      {
        phaseId: "phase-w18-c2",
        key: "quiz-w18-c2-3",
        label: "The Log-Out Relay",
        ask: {
          slug: "quiz-w18-ask-c2-3",
          text: "The bell rings and the next class is walking in to the school computers. Adam is still signed in to three things. What does a relay runner do?",
        },
        options: [
          { text: "Log out of all three, even if he's last out the door" },
          { text: "Leave them open, the next kid has their own login anyway" },
          { text: "Turn the monitor off so nobody can see his accounts" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Hand the baton clean!",
          explanation: "The next kid doesn't need their own login to use YOURS if it's still open, and a dark monitor switches right back on. A relay runner logs out of everything, every time.",
        },
        villainRight: {
          slug: "quiz-w18-right-c2-3",
          text: "All THREE?! Even the email?! Nobody remembers the email! I COUNT on the email!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c2-3",
          text: "The next kid sits down wearing YOUR name! And who taught that kid everything he knows? Wink!",
        },
      },
      {
        phaseId: "phase-w18-c3",
        key: "quiz-w18-c3-3",
        label: "The Front Door",
        ask: {
          slug: "quiz-w18-ask-c3-3",
          text: "The family is picking a lock code for the new tablet, and everyone shouts an idea. Which idea wins?",
        },
        options: [
          { text: "Random digits that no birthday can explain" },
          { text: "The house number, so everyone remembers it" },
          { text: "1-2-3-4, quick to type in a hurry" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Quiet digits win!",
          explanation: "The house number is painted right on the front of the house, and 1-2-3-4 is the first code every guesser tries. Digits with no story are the ones that keep the front door shut.",
        },
        villainRight: {
          slug: "quiz-w18-right-c3-3",
          text: "Digits with no STORY?! I'm a detective with nothing to detect! It's insulting!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c3-3",
          text: "The house number! On the house! Next to the door! Some mysteries solve themselves, folks!",
        },
      },
      {
        phaseId: "phase-w18-c4",
        key: "quiz-w18-c4-3",
        label: "The Closed Chest",
        ask: {
          slug: "quiz-w18-ask-c4-3",
          text: "You borrow your friend's tablet for a game and their private messages pop up on the screen. What's the hero move?",
        },
        options: [
          { text: "Look away, hand it back, and tell them it popped up" },
          { text: "Read them fast, so you can warn your friend if anything's wrong" },
          { text: "Say nothing, so your friend never feels embarrassed about it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Eyes off, hand it back!",
          explanation: "Reading to help is still reading, and staying quiet leaves their chest hanging open. Look away, hand it back, and tell them, so they can close it themselves.",
        },
        villainRight: {
          slug: "quiz-w18-right-c4-3",
          text: "You looked AWAY?! I once climbed three drainpipes to read half a message!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c4-3",
          text: "Ooh yes, read it for SAFETY reasons! That's what I always say! We're basically twins!",
        },
      },
      {
        phaseId: "phase-w18-c5",
        key: "quiz-w18-c5-3",
        label: "The Save-Me Balloon",
        ask: {
          slug: "quiz-w18-ask-c5-3",
          text: "Adam borrows his friend's laptop for homework and the SAVE PASSWORD balloon bobs up. Why does it get a NO?",
        },
        options: [
          { text: "The laptop goes home with his friend, and saved keys would go with it" },
          { text: "It's fine to save, his best friend would never ever peek" },
          { text: "It's fine to save, if he promises to delete it at the end of the year" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Borrowed means it goes home!",
          explanation: "It isn't about whether his friend would peek. When the laptop goes home, Adam's saved key rides along inside it, out of his reach. Borrowed and shared screens never keep your keys.",
        },
        villainRight: {
          slug: "quiz-w18-right-c5-3",
          text: "POP goes my balloon! Do you know how long it takes to blow those up?!",
        },
        villainWrong: {
          slug: "quiz-w18-wrong-c5-3",
          text: "Saved on a TRAVELING laptop! A password with wheels! It'll roll right to my den!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-18-lock-master.png",

  // Week-lane attack theatre: left-open-device tricks only (password
  // cracking = W1, app fakes = W9, device ears = W14).
  bossAttacks: [
    { name: "LEFT-OPEN TAB", icon: "🔓", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Log out when you're done", emblemColor: 0xffd158 },
    { name: "SNEAKY PEEK", icon: "👀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Closed chests stay closed", emblemColor: 0xc084fc },
    { name: "STICKY BALLOON", icon: "🪤", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Never save on shared devices", emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W18 fight - slam every door in the
  // house before the Raccoon strolls in - is designed with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Which of these is a SHARED device?", answers: ["The family tablet on the kitchen shelf", "The dinosaur-sticker tablet in your backpack", "Your birthday camera", "Your drawing pad"], correctIndex: 0, explanation: "Everyone's hands touch it - so it hangs on everyone's hook and gets extra care." },
      { question: "You're done on a shared device. Before you leave, you...", answers: ["Log out of your accounts", "Just tap the Home button", "Turn the screen off", "Walk away - it's fine"], correctIndex: 0, explanation: "Home hides apps and screen-off just goes dark - only LOG OUT hands the baton over clean." },
      { question: "A lock screen is like...", answers: ["A front door for your device", "A password for your apps", "A decoration", "A game"], correctIndex: 0, explanation: "No lock means anyone who picks it up walks straight in - every device needs its front door." },
    ],
    medium: [
      { question: "Why is staying signed in on a shared device risky?", answers: ["The next person is wearing YOUR name - posts, coins, messages", "It's only risky if a stranger uses it next", "It wastes battery", "It isn't - sharing is caring"], correctIndex: 0, explanation: "They could post and spend as you without even meaning to - log out, every time." },
      { question: "Which lock code tells guessers NOTHING?", answers: ["58-93-41", "1-2-3-4", "0-0-0-0", "Your birthday"], correctIndex: 0, explanation: "Counting runs, doubles and birthdays are stories guessers read - quiet digits beat them all." },
      { question: "Your sister's diary app was left open. A Lock Master...", answers: ["Closes it without reading and tells her", "Has one little peek", "Reads it all - it was open!", "Screenshots it for later"], correctIndex: 0, explanation: "Open by accident is not an invitation - don't read it, close it gently, tell them." },
    ],
    hard: [
      { question: "Tapping Home instead of logging out means...", answers: ["Your accounts are still open behind it", "You're safely logged out", "The tablet locks itself", "Your apps are deleted"], correctIndex: 0, explanation: "Home just HIDES the apps - the sneakiest non-log-out there is. Only LOG OUT closes the door." },
      { question: "The SAVE PASSWORD balloon pops up on your cousin's phone. You...", answers: ["Say NO - when the phone goes home, saved keys go with it", "Tap yes - you play together anyway", "Tap yes but whisper it", "Save it and delete it next year"], correctIndex: 0, explanation: "Borrowed devices never keep your keys - the account would live in their pocket, not yours." },
      { question: "When CAN saving a password be OK?", answers: ["On your OWN device, after your grown-up says yes", "On any device if you're quick", "On school computers on Fridays", "Whenever the balloon asks nicely"], correctIndex: 0, explanation: "Your own device plus the ask-first rule - everywhere shared or borrowed, the balloon gets popped." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 18 - lock before you leave!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's found the left-open doors..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Keys ready? Let's do the rounds." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Whose hook does it hang on?" }, layla: null }, // learn: rack
    4: { adam: { mood: "curious", message: "Sort the rack - mine or everyone's!" }, layla: null }, // game: hookSort
    5: { adam: null, layla: { mood: "thumbsup", message: "Which one was shared?" } }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "You can spot a shared device!" } }, // recap 1
    7: { adam: null, layla: { mood: "thinking", message: "Hand the baton over CLEAN." } }, // learn: relay
    8: { adam: null, layla: { mood: "curious", message: "Three log-outs - find them all!" } }, // game: buttonHunt
    9: { adam: { mood: "thumbsup", message: "Quick - the clean-handoff button!" }, layla: null }, // prove: speed
    10: { adam: { mood: "excited", message: "Relay runner form!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Every device needs a front door." }, layla: null }, // learn: door
    12: { adam: { mood: "curious", message: "Hammer the quiet metal!" }, layla: null }, // game: passcodeForge
    13: { adam: null, layla: { mood: "thumbsup", message: "Finish the Lock Master rule!" } }, // prove: finish
    14: { adam: null, layla: { mood: "excited", message: "The door is forged!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Open by accident isn't an invitation." } }, // learn: chest
    16: { adam: null, layla: { mood: "curious", message: "Don't read it, close it gently, tell them." } }, // game: decide
    17: { adam: { mood: "worried", message: "He's fibbing about open chests - catch him!" }, layla: null }, // prove: lie
    18: { adam: { mood: "excited", message: "The kindest power - earned!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Hear that squeaky balloon?" }, layla: null }, // learn: balloon
    20: { adam: { mood: "curious", message: "Whose device? Then pop!" }, layla: null }, // game: replyCards balloons
    21: { adam: null, layla: { mood: "thumbsup", message: "Where CAN saving be OK?" } }, // prove: recall
    22: { adam: null, layla: { mood: "excited", message: "All five powers - final lap!" } }, // recap 5
    23: { adam: null, layla: { mood: "curious", message: "Clean handoff or left open - you know!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His last open door - slam it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Locked, logged out, legendary!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, Lock Master!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Lock Master badge earned!" }, layla: null }, // completion
  },
};

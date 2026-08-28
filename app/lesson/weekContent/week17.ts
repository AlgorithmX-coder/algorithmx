import type { WeekContent } from "./types";

/**
 * Week 17 - Social Media: The Profile Shield
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 SOON     why the 13+ sign exists            | growthRings    | recall
 *     2 FROST    private accounts & settings        | settingsSwitch | speed
 *     3 HEART    followers aren't friends           | conveyorSort   | lie
 *     4 SCRUB    smart posting (highlighter check)  | clueBoard      | recall
 *     5 PAUSE    perfect feeds aren't real life     | chooseYourPath | finish
 *   Consolidation (cyberScanner, Backstage Pass skin) -> boss
 *   (placeholder quiz boss - the bespoke W17 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: beat 1 debuts the small NEW growthRings engine
 * (RevealBoard ran only last week as W16's Door Swing - same call as
 * W13's signBingo and W16's plaquePeek) with an enforced centre-outward
 * ring order no other drill has; settingsSwitch takes its W6-earmarked
 * W17 slot 3 weeks after W14 (the profile burrow); conveyorSort's fifth
 * outing 2 weeks after W15 as the Photo Wall (teamPoster stays reserved
 * for W19's quilt); clueBoard's fourth outing 2 weeks after W15 in its
 * W8-earmarked highlighter dressing; chooseYourPath carries the
 * wellbeing beat. Lane-clean: age signs / your own privacy switches /
 * follower-vs-friend / draft scrubbing / comparison - fake profiles
 * were W3's lane, footprint trails W12's, doors W16's. In-week flavour:
 * the Highlight Reel. Warmth note: beat 5 touches feelings-of-not-
 * enough - villain stays OFF that beat (W5/W11 precedent).
 */
export const WEEK_17: WeekContent = {
  weekNumber: 17,
  title: "Social Media: The Profile Shield",
  topic: "social-media",
  badgeName: "Shield Bearer",
  badgeIcon: "🔰",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 17: THE PROFILE SHIELD", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the highlight reel
    { type: "video", videoPlaceholder: "Week 17: The Highlight Reel", videoSrc: "/videos/module-17-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-17.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has opened a Hall of Mirrors: endless perfect posts, follower numbers spinning round and round, and unlocked profiles anyone - ANYONE - can stare into. He wants kids dazzled, comparing, and wide open. This week you forge the Profile Shield: learn why the 13+ sign stands at the door, make your profile private, sort followers from friends, scrub your drafts - and see through the highlight reel.",
      photoCaption: "Wk 17 - The Highlight Reel",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know why the 13+ sign exists",
        "Make your profile PRIVATE - friends only",
        "Remember: feeds aren't real life",
      ],
    },

    /* ─────────── BEAT 1 · THE 13+ SIGN ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "The 13+ Sign",
      content:
        "Social media apps have a sign on the door: 13+. Not a punishment - it means NOT YET. Those rooms are built for teenagers and grown-ups: strangers, pressure, and tricks that take practice to dodge. You're not missing out - you're still growing your trick-spotting powers, year by year, like a tree grows rings. When you reach the sign, you'll walk in strong - because you waited AND you trained.",
      bullets: [
        "Social media's door sign says 13+",
        "Not a punishment - it means NOT YET",
        "The rooms are grown-up-sized",
        "Your trick-spotting powers grow every year",
        "13+ means SOON - and you'll be ready",
      ],
      bulletIcons: ["🔰", "❓", "🚪", "🧠", "🌟"],
      emblem: "🔰",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Week seventeen - the mirror-hall week!",
          "Social media's door has a sign: thirteen plus.",
          "[warmly] It's not a punishment. Promise.",
          "Those rooms are built grown-up-sized.",
          "And you? You're growing, ring by ring, like a tree.",
          "[excited] Come see what grows before you reach the sign!",
        ],
      },
    },
    // 4 - Game: REVEAL (NEW growthRings - the Growth Rings)
    {
      type: "growthRings",
      introTitle: "The Growth Rings",
      introSubtitle: "A tree slice of YOU. Tap the glowing ring - middle first - and watch what grows on the way to the 13+ sign.",
      introIcon: "🔰",
      centerLabel: "YOU",
      revealToast: "RING GROWN!",
      finale: "EVERY RING GROWN - THE SIGN IS A PROMISE!",
      completeTitle: "Every ring is glowing!",
      completeLine: "The 13+ sign isn't a wall - it's a promise: SOON, and readier every ring.",
      rings: [
        {
          id: "now",
          label: "NOW · 6-9",
          icon: "🎨",
          title: "The ring you're in",
          text: "Games, drawing, big ideas, chats with family close by. This ring is already STRONG - and it's yours.",
        },
        {
          id: "radar",
          label: "10-12 · RADAR",
          icon: "🧠",
          title: "The trick-radar ring",
          text: "Reading tricky messages, spotting pressure, smelling a scam a mile off - your radar grows sharper every single year.",
        },
        {
          id: "sign",
          label: "13 · THE SIGN",
          icon: "🔰",
          title: "The number on the door",
          text: "13+ is where social media's rooms begin - built grown-up-sized, with strangers and pressure inside. The sign waits so YOU'RE ready, not because you're not clever.",
        },
        {
          id: "ready",
          label: "READY & STRONG",
          icon: "🌟",
          title: "The walking-in ring",
          text: "Every ring you grow, the shield gets thicker. When you walk through that door at 13+, you'll walk in STRONG - with every Cyber Heroes power already yours.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] A tree slice of YOU!",
          "Every ring is a year of growing.",
          "Tap the glowing middle first...",
          "[warmly] and grow your way out to the sign!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Start at the glowing center ring - that one's you right now!"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What number is on social media's door sign?",
      choices: [
        { text: "13", isCorrect: true },
        { text: "3", isCorrect: false },
        { text: "30", isCorrect: false },
        { text: "100", isCorrect: false },
      ],
      praise: "Thirteen - and every ring until then grows your shield. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "The 13+ sign isn't a punishment - it means NOT YET: a promise you grow toward, ring by ring.",
      next: "the frost switch that hides YOUR mirror from strangers",
      emblem: "🔰",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power one - the sign makes sense now!",
          "Not a wall. A promise.",
          "[whispers] But some profiles are already out there, wide open...",
          "Time to learn the frost switch. Come on.",
        ],
      },
    },

    /* ─────────── BEAT 2 · FROST THE MIRROR ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Frost the Mirror",
      content:
        "A profile is like a mirror hanging in a public hall - unlocked, ANYONE walking past can stare into it: your photos, your posts, your name. The fix is one hero move: flip it to PRIVATE, so only people you actually know can see in. Remember the Raccoon's frosted doors last week? Frost on HIS doors hid tricks. Frost on YOUR mirror is armor - it hides YOU from strangers. Photos friends-only, messages friends-only, and the padlock ON.",
      bullets: [
        "A public profile = a mirror in a hall",
        "Anyone passing can stare in",
        "Flip it PRIVATE - friends only",
        "Frost on YOUR mirror is armor",
        "Photos, messages, padlock - all locked",
      ],
      bulletIcons: ["🚪", "👀", "🔒", "🛡️", "✅"],
      emblem: "🔒",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Picture your profile as a mirror in a busy hall.",
          "Unlocked? Anyone can stare in.",
          "Your photos. Your name. Anyone.",
          "[warmly] So we frost it: PRIVATE, friends only.",
          "On his doors, frost hid tricks. On YOUR mirror, frost is armor.",
          "[excited] The settings burrow is open - flip those switches!",
        ],
      },
    },
    // 8 - Game: FIND (settingsSwitch re-dress - the Settings Burrow)
    {
      type: "settingsSwitch",
      panelTitle: "PIP'S PROFILE SETTINGS",
      introTitle: "The Settings Burrow",
      introSubtitle: "Pip the fox cub's profile mirror hangs wide open in the hall. Dig through the settings and frost every switch a stranger could stare through!",
      introIcon: "🔒",
      rows: [
        {
          id: "account",
          label: "Account",
          value: "PUBLIC - the whole hall can peek",
          safeValue: "PRIVATE - friends only",
          icon: "🔒",
          isRisky: true,
          note: "The big one - one flip and the mirror frosts over. Strangers see nothing; friends see Pip.",
        },
        {
          id: "photos",
          label: "Who sees my photos",
          value: "EVERYONE",
          safeValue: "PEOPLE I KNOW",
          icon: "👀",
          isRisky: true,
          note: "Photos are treasure (Week 8 rule!) - the gallery is for people Pip actually knows.",
        },
        {
          id: "messages",
          label: "Who can message me",
          value: "ANYBODY",
          safeValue: "FRIENDS ONLY",
          icon: "💬",
          isRisky: true,
          note: "ANYBODY means any stranger with a keyboard. Friends-only shuts the flap on the burrow door.",
        },
        {
          id: "name",
          label: "Name shown",
          value: "Pip + a made-up hero tag",
          icon: "🆔",
          isRisky: false,
          note: "Already perfect - no full name, no school. The Week 2 disguise, still holding strong.",
        },
        {
          id: "location",
          label: "Location on posts",
          value: "OFF",
          icon: "📍",
          isRisky: false,
          note: "Already off - no map pins to the den. Trail Ranger form from Week 12.",
        },
      ],
      hints: {
        tier1: "Ask each row: could a STRANGER see in through this one?",
        tier2: "The risky rows say EVERYONE, PUBLIC or ANYBODY. The safe rows already say friends-only, off, or disguised.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The settings burrow - dig in!",
          "Some switches are wide open to the hall.",
          "Find every one a stranger could stare through...",
          "[whispers] and frost it. Friends only. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read each row - if strangers can see through it, tap it and flip it safe!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the switch that frosts the WHOLE mirror!",
      speedMs: 5000,
      choices: [
        { text: "Account: PRIVATE 🔒", isCorrect: true },
        { text: "Messages: FRIENDS ONLY", isCorrect: false },
        { text: "Sound: EXTRA LOUD", isCorrect: false },
      ],
      praise: "Padlock found at shield speed - one flip, whole mirror frosted! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A public profile is a mirror anyone can stare into - flip it private, friends only, padlock on.",
      next: "the follower counter - and why big numbers aren't friendship",
      emblem: "🔒",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Two powers - the mirror is frosted!",
          "Strangers see armor. Friends see you.",
          "[whispers] But the hall has a counter that never stops spinning...",
          "followers. Let's talk about that number.",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE HEART FRAME ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Followers Aren't Friends",
      content:
        "In the mirror hall there's a counter that spins: followers! 500! 10,000! Here's the truth the Raccoon hopes you never learn: a follower is just a VIEWER - someone watching through the glass. A friend is someone you KNOW: they sit with you at lunch, they know your dog's name, they'd notice if you were sad. Friends go inside the heart frame on your wall. Everyone else - however many, however flattering - stays behind the rope.",
      bullets: [
        "The follower counter just spins",
        "A follower = a viewer through glass",
        "A friend = someone you KNOW",
        "Friends go in the heart frame",
        "Everyone else stays behind the rope",
      ],
      bulletIcons: ["🔢", "👀", "👪", "🌟", "🚫"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[curious] See that counter spinning? Followers!",
          "Five hundred! Ten thousand! Ooooh!",
          "[warmly] Now the truth: a follower is a viewer.",
          "A friend knows your dog's name.",
          "Friends go in the heart frame. Everyone else - behind the rope.",
          "[excited] Follower cards incoming - sort the wall!",
        ],
      },
    },
    // 12 - Game: SORT (conveyorSort re-dress - the Photo Wall)
    {
      type: "conveyorSort",
      introTitle: "The Photo Wall",
      introSubtitle: "Follower cards are riding the belt to Pip's photo wall. People Pip KNOWS go in the heart frame - everyone else stays behind the rope!",
      introIcon: "👪",
      machineLabel: "THE PHOTO WALL",
      chuteWord: "SPOT",
      completeTitle: "The wall is sorted!",
      completeLine: "Knowing someone beats being followed by them - the heart frame stays honest.",
      categories: [
        { id: "heart", label: "HEART FRAME", icon: "👪", tone: "safe" },
        { id: "rope", label: "BEHIND THE ROPE", icon: "🚫", tone: "lock" },
      ],
      items: [
        {
          id: "maya",
          text: "Maya from class - you sit together at lunch every day",
          icon: "💬",
          categoryId: "heart",
          explanation: "Lunch-table, real-life, knows-your-jokes Maya - exactly who the heart frame is for.",
        },
        {
          id: "coolgamer",
          text: "CoolGamer_9000 - never met, follows 4,000 kids",
          icon: "🎮",
          categoryId: "rope",
          explanation: "Four thousand kids isn't friendship, it's a collection - behind the rope it goes.",
        },
        {
          id: "zain",
          text: "Cousin Zain - beach vacation together every summer",
          icon: "🎉",
          categoryId: "heart",
          explanation: "Family you actually see and know - heart frame, always.",
        },
        {
          id: "scout",
          text: "'Talent scout' who messaged: 'you could be FAMOUS!'",
          icon: "🌟",
          categoryId: "rope",
          explanation: "Too-friendly-too-fast plus a big shiny promise - that's the Week 3 stranger trick in a new coat.",
        },
        {
          id: "leo",
          text: "Leo next door - backyard soccer every weekend",
          icon: "💪",
          categoryId: "heart",
          explanation: "Real backyard, real soccer, real friend - in the frame.",
        },
        {
          id: "instaliker",
          text: "A grown-up stranger who likes every photo within seconds",
          icon: "👀",
          categoryId: "rope",
          explanation: "Watching a kid's profile that closely is a rope-and-tell-a-grown-up moment, not a friendship.",
        },
        {
          id: "gran",
          text: "Grandma - biggest fan of every drawing you post",
          icon: "🎁",
          categoryId: "heart",
          explanation: "Grandma knows you, loves you, and claps for every scribble - heart frame royalty.",
        },
        {
          id: "coinclub",
          text: "FreeCoinsClub - a 'friend' that only posts prize links",
          icon: "🪤",
          categoryId: "rope",
          explanation: "That's not a person, it's a store wearing a face - and its doors are painted doors from Week 16.",
        },
      ],
      hints: {
        tier1: "Ask the friend question: do you KNOW them in real life?",
        tier2: "HEART = lunch table, family, next door, Grandma. ROPE = never-met, too-flattering, always-watching, prize links.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The photo wall - cards on the belt!",
          "One question for every card:",
          "do you KNOW them in real life?",
          "[warmly] Heart frame for yes. Rope for everyone else. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["First card's here - would they know your dog's name? Sort it!"],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "followers are just viewers watching through the glass - they'd never even notice if you were sad. That's why I LOVE a big spinning counter... viewers ask no questions!",
      choices: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
      praise: "Sharp ears - this time he told the TRUTH and twisted it. Followers ARE just viewers... which is exactly why friends beat counters. ✓",
      nudge: "Careful - read it again. Is the first bit of what he said actually TRUE this time?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A follower is a viewer through the glass; a friend is someone you KNOW - the heart frame stays honest.",
      next: "the highlighter that checks every draft before it goes anywhere",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three powers - the counter can't dazzle you!",
          "Viewers watch. Friends KNOW.",
          "[whispers] Now, about the posts themselves...",
          "some drafts glow RED under the highlighter. Come see.",
        ],
      },
    },

    /* ─────────── BEAT 4 · THE HIGHLIGHTER CHECK ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "The Highlighter Check",
      content:
        "Before any post goes anywhere, heroes run the highlighter over it. Risky bits glow RED: your school's name, times and places you'll be, what you're wearing today - together they make a find-me map for strangers. Happy news with no clues glows GREEN: new sneakers, a drawing you're proud of, a game your team won. The rule from Week 8 still rules: scrub the red, keep the green, THEN post.",
      bullets: [
        "Run the highlighter before posting",
        "School names glow RED",
        "Times + places = a find-me map",
        "What-you're-wearing glows red too",
        "Scrub the red, keep the green, post",
      ],
      bulletIcons: ["🔍", "🏫", "📍", "👀", "✅"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Every hero post starts as a draft...",
          "and every draft gets the highlighter.",
          "School names? RED. Times and places? RED.",
          "What you're wearing today? Red, red, red.",
          "[warmly] Happy news with no clues? Green and good to go.",
          "[excited] Pip's draft is on the desk - light it up!",
        ],
      },
    },
    // 16 - Game: INSPECT (clueBoard re-dress - the Draft-Post Highlighter)
    {
      type: "clueBoard",
      introTitle: "The Draft-Post Highlighter",
      introSubtitle: "Pip's first-day-back post is ready to send. Run the highlighter over every line - see what glows red before it goes anywhere!",
      introIcon: "🔍",
      photoTitle: "Pip's draft: 'First day back! Meet me at Sunnyside School gates at 3:15 - I'm the one in the red scarf! #NewSneakers'",
      photoIcon: "💬",
      clues: [
        {
          id: "school",
          icon: "🏫",
          label: "'Sunnyside School gates'",
          evidence: "RED GLOW: that's the school's name AND the pick-up spot - the biggest pin on a stranger's map.",
        },
        {
          id: "time",
          icon: "🔔",
          label: "'at 3:15'",
          evidence: "RED GLOW: now the map has a TIME. Where-plus-when is exactly what a stranger can use.",
        },
        {
          id: "scarf",
          icon: "👀",
          label: "'the one in the red scarf'",
          evidence: "RED GLOW: that tells anyone how to SPOT Pip in a crowd of kids. What-you're-wearing never posts.",
        },
        {
          id: "trainers",
          icon: "🎉",
          label: "'#NewSneakers'",
          evidence: "GREEN GLOW: happy news, zero clues - no school, no time, no way to find anyone. This bit is post-safe!",
        },
      ],
      verdict: {
        prompt: "Highlighter's done. What's the call on this draft?",
        options: [
          {
            text: "Scrub the school, the time and the scarf - then post the happy bit",
            isCorrect: true,
            explanation: "Exactly - the excitement posts, the find-me map doesn't. That's shield-bearer form.",
          },
          {
            text: "Post it as-is - it's just first-day excitement",
            isCorrect: false,
            explanation: "Three red glows say otherwise: school + time + what-to-look-for is a complete stranger's map.",
          },
          {
            text: "Never post anything again, ever",
            isCorrect: false,
            explanation: "Too far! The sneakers line glowed green - posting isn't the danger, the DETAILS are.",
          },
        ],
      },
      stampText: "SCRUBBED CLEAN!",
      completeTitle: "Draft checked, line by line!",
      completeLine: "Three red glows scrubbed, one green kept - the post is safe AND still fun.",
      hints: {
        tier1: "Highlight every line - which ones help a stranger FIND Pip?",
        tier2: "School name, time, what-Pip's-wearing = red. Sneakers with no clues = green.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The draft is on the desk!",
          "Run the highlighter over every line.",
          "Red for find-me clues...",
          "[whispers] green for safe-and-happy. Light it up!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the first line and see what color it glows!"],
      },
    },
    // 17 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which line was safe to post?",
      choices: [
        { text: "#NewSneakers", isCorrect: true },
        { text: "'Sunnyside School gates'", isCorrect: false },
        { text: "'at 3:15'", isCorrect: false },
        { text: "'the one in the red scarf'", isCorrect: false },
      ],
      praise: "Green glow spotted - joy with zero find-me clues posts every time. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "The highlighter finds the find-me clues - school, times, what-you're-wearing glow red and get scrubbed before posting.",
      next: "the hall of perfect posts - and the pause that beats it",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four powers - no draft escapes the highlighter!",
          "Red scrubbed, green posted.",
          "[warmly] One power left, and it's the gentlest one...",
          "for the days the mirror hall makes you feel small.",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE BACKSTAGE TRUTH ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Backstage Truth",
      content:
        "Walk the mirror hall and every post sparkles: perfect vacations, perfect goals, perfect hair. Here's the backstage truth: feeds are HIGHLIGHT REELS. People post their one shiny minute, never the boring Tuesday, the burnt toast, the fifteen blurry photos it took to get the good one. Comparing your real, messy, wonderful life to everyone else's highlight reel is a game nobody wins. When the sparkle makes you feel small: put the screen down, remember the un-posted bits of YOUR day, and tell someone how you feel - yours is real, and real is better.",
      bullets: [
        "Feeds are highlight reels",
        "One shiny minute, posted",
        "The messy Tuesday, never posted",
        "Don't compare backstage to reels",
        "Feeling small? Pause + tell someone",
      ],
      bulletIcons: ["🌟", "🎉", "🌀", "🚫", "👪"],
      emblem: "🌟",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Last power - and it's the gentlest.",
          "Every post in the hall sparkles. Perfect, perfect, perfect.",
          "[whispers] But feeds are highlight reels.",
          "Nobody posts the burnt toast or the soggy Tuesday.",
          "Comparing your backstage to their reel? Nobody wins that.",
          "[excited] Three sparkly moments coming - show me the pause!",
        ],
      },
    },
    // 20 - Game: DECIDE (chooseYourPath - the Perfect-Feed Pause)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Scroll... scroll... everyone's summer looks AMAZING - beaches, pools, fireworks. Yours was a rainy campsite. Your sparkle dims a little...",
          choices: [
            {
              text: "Flip to backstage - remember the un-posted bits",
              isSafe: true,
              consequence: "Their reel didn't show THEIR rainy days either - nobody posts those. Your soggy-tent giggles with Dad were real, and real beats posted, every time.",
            },
            {
              text: "Keep scrolling and comparing",
              isSafe: false,
              consequence: "An hour later the sparkle feels worse, not better - because you compared your whole backstage to a hundred one-shiny-minute reels. That game has no winner; the pause does.",
            },
          ],
        },
        {
          setup: "Priya's drawing got 94 likes. Yours got 6. Your tummy does the sinking thing...",
          choices: [
            {
              text: "Close the app and tell someone how it felt",
              isSafe: true,
              consequence: "Mom reminds you: Grandma printed your drawing and stuck it on her fridge. Six real people who love it beats ninety-four taps from viewers - and saying the feeling out loud shrinks it.",
            },
            {
              text: "Post something you don't even like, to chase likes",
              isSafe: false,
              consequence: "Now a picture you never liked is out there wearing your name, and the counter still won't fill the tummy-sink. Likes are taps, not love - post what YOU'RE proud of or nothing at all.",
            },
          ],
        },
        {
          setup: "A sparkly 'perfect' account announces: 'REAL fans post their morning routine at 6am EVERY day - or you're out of the club!'",
          choices: [
            {
              text: "Pause - a feed that gives you homework isn't a friend",
              isSafe: true,
              consequence: "You skip the 6am club and nothing bad happens - because it was never a club, just a counter feeding itself. Feeds that demand things from you have forgotten who's boss.",
            },
            {
              text: "Set the alarm - you don't want to lose them",
              isSafe: false,
              consequence: "A stranger's feed now runs your mornings, and the 'club' never even knew your name. When an app starts setting YOUR alarm clock, that's the moment to hand it to a grown-up.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three sparkly moments. Three chances to pause.",
          "Remember: reels show the shiny minute.",
          "Backstage is where real life lives -",
          "[excited] and yours is wonderful. Show me the pause!",
        ],
      },
    },
    // 21 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Feeds aren't ___ life.",
      choices: [
        { text: "real", isCorrect: true },
        { text: "fun", isCorrect: false },
        { text: "big", isCorrect: false },
        { text: "new", isCorrect: false },
      ],
      praise: "REAL life is backstage - messy, funny, yours. The reel is just the shiny minute. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Feeds are highlight reels - pause, flip to backstage, and remember your real, messy, wonderful life wins.",
      next: "one last walk past the mirrors, then the Raccoon's hall itself",
      emblem: "🌟",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Shield Bearer!",
          "The sign understood, the mirror frosted, the frame honest,",
          "the drafts scrubbed... and the reel seen through.",
          "[whispers] One last walk past the mirrors...",
          "[excited] then we close his hall for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Backstage Pass (W1 scanner engine, W17 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SHIELD MOVE",
        negative: "MIRROR TRAP",
        positiveHint: "Tap SHIELD MOVE for true shield-bearer form",
        negativeHint: "Tap MIRROR TRAP for the hall's glittery tricks",
        tipWhenPositive: "Mirrors frosted, frames honest, drafts scrubbed, reels seen through - stamp it SHIELD.",
        tipWhenNegative: "Counter-chasing, wide-open profiles, find-me posts - the hall glitters with these.",
        hint1: "Ask: does this move protect the kid behind the profile... or feed the mirror hall?",
        hint2: "SHIELD = private, friends-only, scrubbed, paused. TRAP = public, counter-chasing, school-name posts.",
        hint2Example: "SHIELD: 'flipped it to friends-only'   TRAP: 'posted the school gates pic for likes'",
        hint3: "Shield card: 13+ is a promise · frost the mirror · friends beat followers · scrub the red · reels aren't real.",
        hint3Example: "Tell someone the feed made you feel small ✅    Chase the counter with posts you hate ❌",
      },
      items: [
        {
          text: "Flipping the account to PRIVATE, friends only",
          isStrong: true,
          explanation: "One flip and the mirror frosts - strangers see armor, friends see you.",
        },
        {
          text: "Accepting every follow to make the counter spin",
          isStrong: false,
          explanation: "A spinning counter of strangers isn't friendship - it's an open door to the hall.",
        },
        {
          text: "Scrubbing the school name out of a draft before posting",
          isStrong: true,
          explanation: "The highlighter caught the red glow - the joy posts, the map doesn't.",
        },
        {
          text: "Posting 'meet me at the gates at 3:15' to everyone",
          isStrong: false,
          explanation: "Where-plus-when is a find-me map - exactly what the highlighter exists to catch.",
        },
        {
          text: "Pausing the scroll when the sparkle makes you feel small",
          isStrong: true,
          explanation: "That's the backstage flip - reels are one shiny minute, your real life is the whole show.",
        },
        {
          text: "Believing a follower counter measures how loved you are",
          isStrong: false,
          explanation: "Counters count taps. Love is Grandma's fridge with your drawing on it.",
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Backstage Pass - final walk!",
          "Mirror-hall moments are drifting past.",
          "SHIELD MOVE for shield-bearer form...",
          "[warmly] MIRROR TRAP for the glittery tricks. Stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W17 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the profile shield
    { type: "video", videoPlaceholder: "Week 17: The Profile Shield", videoSrc: "/videos/module-17-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "soon", label: "Soon Ticket", accent: "#ffd158", icon: "🔰", summary: "13+ isn't a wall - it's a promise you grow toward, ring by ring." },
        { id: "frost", label: "Mirror Froster", accent: "#7df0ff", icon: "🔒", summary: "Private account, friends-only photos - you flip every switch strangers stare through." },
        { id: "heart", label: "Heart Framer", accent: "#7eff97", icon: "👪", summary: "Followers are viewers; friends know your dog's name. The frame stays honest." },
        { id: "scrub", label: "Draft Scrubber", accent: "#c084fc", icon: "🔍", summary: "School, times and what-you're-wearing glow red - you scrub before you post." },
        { id: "backstage", label: "Backstage Passer", accent: "#ff5fb3", icon: "🌟", summary: "Feeds are highlight reels - you pause, flip to backstage, and keep your sparkle." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The sign understood, the mirror frosted,",
          "the frame honest, the drafts scrubbed... and the reel seen through.",
          "[laughs] His hall of mirrors just went dark.",
          "[excited] Sticker time, Shield Bearer!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "ring-grower", name: "Ring Grower", icon: "🔰", description: "Knows the 13+ sign is a promise, not a punishment." },
        { id: "mirror-froster", name: "Mirror Froster", icon: "🔒", description: "Flips every switch a stranger could stare through." },
        { id: "backstage-passer", name: "Backstage Passer", icon: "🌟", description: "Sees the messy, wonderful real life behind every reel." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Bespoke W17 showdown: darken the hall of mirrors. Backstage is real
  // life, the heart-rope is for real friends, and frost beats the stare.
  bossShowdown: {
    machine: {
      name: "THE HALL OF MIRRORS",
      tagline: "A funhouse engine that loops everyone's shiniest minute forever",
      art: {
        intact: "/game/bosses/w17-mirrorhall-intact.png",
        damaged: "/game/bosses/w17-mirrorhall-damaged.png",
        defeated: "/game/bosses/w17-mirrorhall-defeated.png",
      },
      arena: "/game/backgrounds/w17-arena-funhouse.png",
      accent: "#b8c6ff",
      glow: "rgba(184,198,255,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w17/adam-knight-idle.png",
        attack: "/game/characters/w17/adam-knight-attack.png",
        celebrate: "/game/characters/w17/adam-knight-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w17/layla-knight-idle.png",
        attack: "/game/characters/w17/layla-knight-attack.png",
        celebrate: "/game/characters/w17/layla-knight-celebrate.png",
      },
    },
    phases: [
      // P1 · HIGHLIGHT REEL → TAP-THE-TELL: flip each glossy poster to
      // its backstage truth.
      {
        kind: "tapTell",
        attack: 0,
        coach: "Every glossy poster hides a messy backstage. Tap the TRUTH behind each one!",
        rounds: [
          {
            id: "bedroom",
            prompt: "The poster: 'MY BEDROOM IS ALWAYS THIS TIDY AND CLEAN!'",
            promptIcon: "🌟",
            options: [
              { id: "wardrobe", label: "Backstage: everything got shoved in the closet two minutes before the snap", icon: "🌀", isTell: true, note: "" },
              { id: "spotless", label: "Backstage: some kids really do keep a spotless room all day long", icon: "💬", isTell: false, note: "No room stays perfect all day - the photo caught the ONE tidy minute. Find the truth card!" },
              { id: "nohide", label: "Backstage: room photos can't hide anything, what you see is what you get", icon: "🙈", isTell: false, note: "Every photo has a backstage, even a bedroom one. That's the whole trick!" },
            ],
          },
          {
            id: "cake",
            prompt: "The poster: 'I BAKED THIS CAKE MYSELF - PERFECT ON THE FIRST GO!'",
            promptIcon: "🌟",
            options: [
              { id: "flopped", label: "Backstage: the first two cakes flopped and a grown-up rescued this one", icon: "🌀", isTell: true, note: "" },
              { id: "natural", label: "Backstage: baking always works first time if you're a natural", icon: "🎁", isTell: false, note: "First tries flop for everyone - the reel just deletes the flops. Tap the truth!" },
              { id: "nostage", label: "Backstage: cake photos are never set up or tidied first", icon: "📋", isTell: false, note: "The messy bowls got moved out of shot. Find the real backstage!" },
            ],
          },
          {
            id: "holiday",
            prompt: "The poster: 'OUR VACATION WAS NON-STOP FUN, EVERY SINGLE DAY!'",
            promptIcon: "🌟",
            options: [
              { id: "rainy", label: "Backstage: two whole days were rainy and grumpy, and nobody posted those", icon: "🌀", isTell: true, note: "" },
              { id: "everyminute", label: "Backstage: some vacations honestly are fun every single minute", icon: "🎮", isTell: false, note: "Even the best vacation has a boring bit - the post skips it. Keep hunting!" },
              { id: "wholetrip", label: "Backstage: vacation posts show the whole trip, dull moments and all", icon: "💡", isTell: false, note: "Only the shiny minutes made the post. Tap the true backstage!" },
            ],
          },
        ],
      },
      // P2 · FOLLOWER FLOOD → DEFLECT-SORT: the velvet heart-rope. Real
      // friends come under; stranger-viewers get the rope closed.
      {
        kind: "deflectSort",
        attack: 1,
        coach: "Do you know them in REAL life? Real friends come under the rope, strangers stay out!",
        actLabel: "CLOSE THE ROPE!",
        actIcon: "✋",
        passLabel: "REAL FRIEND - COME UNDER",
        items: [
          { id: "swimpal", label: "Your swim-team pal who high-fived you at practice this morning", icon: "👪", act: false, note: "You splash next to her every week - that's a real friend. Under the rope!" },
          { id: "megaprizes", label: "'MEGA-PRIZES': 'you're pre-approved for a golden crown, just DM your address'", icon: "🎭", act: true, note: "Never met, wants your address, dangling a prize. The rope stays CLOSED." },
          { id: "amir", label: "Your neighbor Amir, who walks to school beside you every day", icon: "💬", act: false, note: "A real face from the real sidewalk - under the rope he goes!" },
          { id: "procoach", label: "'xX-ProCoach-Xx', a stranger saying 'I'll train you, just add me on another app'", icon: "🎮", act: true, note: "A stranger steering you somewhere quieter is a trap, not a coach. Rope CLOSED." },
          { id: "auntie", label: "Your auntie, who came to your birthday party last month", icon: "🎁", act: false, note: "Family you actually hugged in real life - under the rope!" },
          { id: "kittens", label: "'Kittens4U', an account you've never met that hearts 100 posts a minute", icon: "🌀", act: true, note: "A machine spraying hearts isn't a friend. Rope CLOSED." },
        ],
      },
      // P3 · OPEN MIRROR → SHIELD-HOLD: frost-breath until the profile
      // mirror frosts over - friends see you, strangers see armour.
      {
        kind: "shieldHold",
        attack: 2,
        coach: "He wants your mirror wide open. Breathe your frost-breath and DON'T let him peek!",
        holdLabel: "FROST THE MIRROR",
        holdIcon: "🛡️",
        holdSecs: 6,
        barrage: [
          "Leave it open just a crack - what's ONE little peek?",
          "Private is BORING! Nobody gets to see your cool stuff!",
          "Everybody else's profile is open, why not yours?!",
          "Frost it and your followers might all LEAVE!",
          "Come on, unlock it - I only want the tiniest look!",
        ],
        burnoutLine: "The glass ices over edge to edge and the padlock clicks - friends still see you, but every stranger just sees armor.",
      },
    ],
    weakPoints: [
      { question: "Every kid in class posted an AMAZING party, but your birthday was small and quiet. What's the fair way to think about it?", answers: ["They posted their one best moment, not the whole day - and quiet can be lovely too", "Their whole life really is better than yours", "You should have thrown a bigger party for the photos", "Only big loud parties count for anything"], correctIndex: 0, explanation: "Feeds show the shiny minute, never the boring or wobbly bits. Comparing your whole day to their one photo isn't fair on you." },
      { question: "Someone with a MILLION followers messages: 'Follow me back and we'll be best friends forever!' Are they your friend?", answers: ["No - a friend is someone who actually knows you, not a big number on a screen", "Yes - a million followers means they must be trustworthy", "Yes - 'best friends forever' makes it real", "Yes - famous accounts are always kind"], correctIndex: 0, explanation: "Big numbers aren't friendship. A real friend knows you offline; a stranger's follow is just a tap." },
      { question: "A pop-up on your profile says: 'Make your account PUBLIC to unlock a secret badge!' What do you do?", answers: ["Keep it private - no badge is worth opening your mirror to strangers", "Go public - a shiny badge is worth it", "Go public for just one day to grab it", "Go public but ask the strangers to be gentle"], correctIndex: 0, explanation: "Nothing a stranger dangles is worth unfrosting your mirror. Private stays private, badge or no badge." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE SHIELD RING",
      chargeIcon: "🛡️",
      chargeSecs: 5,
      milestones: ["The ring is glowing at your feet…", "The ripple is racing down the hall…", "SHIELDS UP! LET GO!"],
      payoffTitle: "EVERY MIRROR DIMMED!",
      payoffLine: "WHOOSH! A shield-ring ripples down the whole funhouse - mirror after mirror dims to plain old glass. No loops, no strangers, no 'perfect'. Just your own reflection... smiling back. That's the only feed that matters.",
    },
    villain: {
      arrival: "Mirror mirror on the FEED! Everyone's life is better! Look closer!",
      phases: [
        "That campsite was DEFINITELY sunny! I edited it myself!",
        "Ten thousand friends! I counted! Roughly!",
        "Leave the mirror open! I like the view of your homework!",
      ],
      escape: "Frost?! On MY mirrors?! This funhouse is a FLOP!",
    },
    voiceSlug: "w17",
  },
  badgeArt: "/cyberheroes/badges/week-17-shield-bearer.png",

  // Week-lane attack theatre: mirror-hall tricks only (fake profiles = W3,
  // footprint trails = W12, painted doors = W16).
  bossAttacks: [
    { name: "HIGHLIGHT REEL", icon: "🌟", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Backstage is real life", emblemColor: 0xff5fb3 },
    { name: "FOLLOWER FLOOD", icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Viewers aren't friends", emblemColor: 0xc084fc },
    { name: "OPEN MIRROR", icon: "👀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Frost it - friends only", emblemColor: 0x7df0ff },
  ],

  // Placeholder quiz boss (the bespoke W17 fight - darken the hall of
  // mirrors - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What does the 13+ sign on social media really mean?", answers: ["The rooms are grown-up-sized - you grow toward it", "You're not clever enough", "It's a punishment", "Nothing - ignore it"], correctIndex: 0, explanation: "Not a punishment - it means NOT YET, and every ring you grow makes you readier." },
      { question: "The one flip that frosts your whole profile mirror is...", answers: ["Account: PRIVATE - friends only", "Messages: friends only", "Sound: loud", "Name: bigger letters"], correctIndex: 0, explanation: "Private means strangers see armor and friends see you." },
      { question: "A follower is...", answers: ["A viewer watching through the glass", "Automatically a friend", "Someone who loves you", "Family"], correctIndex: 0, explanation: "Friends know your dog's name - viewers just watch." },
    ],
    medium: [
      { question: "Which draft line glows RED under the highlighter?", answers: ["'Meet me at the school gates at 3:15'", "'#NewSneakers'", "'I love drawing dragons'", "'We won our game!'"], correctIndex: 0, explanation: "Where-plus-when is a find-me map - it gets scrubbed before anything posts." },
      { question: "10,000 followers means...", answers: ["10,000 viewers - the counter doesn't measure friendship", "10,000 friends", "You're 10,000 times more loved", "You win social media"], correctIndex: 0, explanation: "Counters count taps; love is Grandma printing your drawing for her fridge." },
      { question: "Everyone's feed looks perfect and yours feels small. The truth is...", answers: ["Feeds are highlight reels - nobody posts the soggy Tuesday", "Everyone's life really is perfect", "You should post more", "Your life is boring"], correctIndex: 0, explanation: "One shiny minute gets posted; the burnt toast never does. Backstage is where real life lives." },
    ],
    hard: [
      { question: "Why does a 'talent scout' who says 'you could be FAMOUS!' go behind the rope?", answers: ["Too-friendly-too-fast plus a shiny promise is the stranger playbook", "Scouts are always real", "Fame is guaranteed", "Because they're busy"], correctIndex: 0, explanation: "Week 3's tells in a new coat - flattery is bait, and the rope is for bait." },
      { question: "A feed announces: 'post at 6am daily or you're out of the club!' A shield bearer...", answers: ["Pauses - a feed that gives you homework isn't a friend", "Sets the alarm", "Posts twice to be safe", "Begs to stay in"], correctIndex: 0, explanation: "When an app starts setting your alarm clock, it's forgotten who's boss - pause and tell someone." },
      { question: "The heart-frame rule says friends are people who...", answers: ["You KNOW in real life - they'd notice if you were sad", "Follow you back", "Like every photo fast", "Have the most followers"], correctIndex: 0, explanation: "Knowing beats following - the frame stays honest however fast the counter spins." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 17 - the profile shield!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "His hall of mirrors is OPEN..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Shield up? Let's walk the hall." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "13+ is a promise, not a wall." } }, // learn: sign
    4: { adam: null, layla: { mood: "curious", message: "Grow the rings, middle first!" } }, // game: growthRings
    5: { adam: { mood: "thumbsup", message: "What's the number on the door?" }, layla: null }, // prove: recall
    6: { adam: { mood: "excited", message: "The sign makes sense now!" }, layla: null }, // recap 1
    7: { adam: { mood: "thinking", message: "An unlocked mirror... anyone can stare." }, layla: null }, // learn: frost
    8: { adam: { mood: "curious", message: "Dig in - frost those switches!" }, layla: null }, // game: settingsSwitch
    9: { adam: null, layla: { mood: "thumbsup", message: "Quick - the padlock flip!" } }, // prove: speed
    10: { adam: null, layla: { mood: "excited", message: "The mirror is FROSTED!" } }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "That counter just spins..." } }, // learn: heart
    12: { adam: null, layla: { mood: "curious", message: "Heart frame or rope - sort them!" } }, // game: conveyorSort
    13: { adam: { mood: "worried", message: "Careful - is he ALWAYS fibbing? Listen close!" }, layla: null }, // prove: lie
    14: { adam: { mood: "excited", message: "The frame stays honest!" }, layla: null }, // recap 3
    15: { adam: { mood: "thinking", message: "Some lines glow red..." }, layla: null }, // learn: scrub
    16: { adam: { mood: "curious", message: "Run the highlighter - every line!" }, layla: null }, // game: clueBoard
    17: { adam: null, layla: { mood: "thumbsup", message: "Which line stayed green?" } }, // prove: recall
    18: { adam: null, layla: { mood: "excited", message: "No draft escapes the highlighter!" } }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "Reels show one shiny minute." } }, // learn: backstage
    20: { adam: null, layla: { mood: "curious", message: "Feel the pull? Pause it!" } }, // game: decide
    21: { adam: { mood: "thumbsup", message: "Finish the backstage rule!" }, layla: null }, // prove: finish
    22: { adam: { mood: "excited", message: "All five powers - final walk!" }, layla: null }, // recap 5
    23: { adam: { mood: "excited", message: "Shield move or mirror trap - you know!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "His hall - darken it for good!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Shield forged - hall closed!" } }, // outro video
    26: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    27: { adam: { mood: "excited", message: "Stickers earned, Shield Bearer!" }, layla: null }, // stickers
    28: { adam: { mood: "thumbsup", message: "Shield Bearer badge earned!" }, layla: null }, // completion
  },
};

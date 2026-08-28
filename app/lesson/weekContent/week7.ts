import type { WeekContent } from "./types";

/**
 * Week 7 - In-Game Spending: The V-Bucks Trap.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 MONEY    coins = real money                | memoryMatch     | finish
 *     2 LOOT     loot boxes are a gamble           | reveal (🎁)     | lie
 *     3 PRESSURE limited-time / FOMO tricks        | phishInspector  | speed
 *     4 ASK      always ask before you buy         | chooseYourPath  | recall
 *     5 FREE     "free" currency is a scam         | popupPanic      | recall (quick-sort)
 *   Consolidation (cyberScanner, Wallet Scanner skin) -> boss
 *   (placeholder quiz boss - the bespoke W7 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: popupPanic gets its FIRST week outing (free-coin fakes);
 * memoryMatch returns 6 weeks after W1, re-themed as the Coin Till;
 * phishInspector returns 3 weeks after W4 with re-named zones (banner
 * X-ray); the reveal board wears a 🎁 (loot-box glass). Lane-clean: ALL
 * free-currency scams live here (W4 taught the too-good pattern, this is
 * its money home); pressure = SHOP pressure only (message urgency was
 * W4's); no link/QR anatomy (W16).
 */
export const WEEK_7: WeekContent = {
  weekNumber: 7,
  title: "In-Game Spending: The V-Bucks Trap",
  topic: "in-game-spending",
  badgeName: "Wallet Guard",
  badgeIcon: "🔒",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 7: THE V-BUCKS TRAP", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the shop that drained an account
    { type: "video", videoPlaceholder: "Week 7: The V-Bucks Trap", videoSrc: "/videos/module-07-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-07.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's 'LIMITED-TIME bundle!' and 'FREE V-Bucks generator!' drained a family's account - real money, gone. This week you learn what game coins REALLY cost.",
      photoCaption: "Wk 7 - The V-Bucks Trap",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn the big secret: game coins are REAL money",
        "See inside loot boxes and shop pressure tricks",
        "Master the golden rule: always ask before you buy",
      ],
    },

    /* ─────────── BEAT 1 · COINS = REAL MONEY ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Game Coins Are Real Money",
      content:
        "V-Bucks, Robux, Blast Coins - games give their money fun names and bright colors so it FEELS like play money. But here's the secret: every coin pack is bought with real dollars. Real money someone in your family worked for. Once you see that, the shop looks very different.",
      bullets: [
        "Game coins are bought with real dollars",
        "Fun names make it FEEL like play money",
        "That's on purpose - easier to spend",
        "It's someone's real, worked-for money",
        "See the dollars, and the shop changes",
      ],
      bulletIcons: ["💎", "🎭", "🪤", "👪", "👀"],
      emblem: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero. Today we open the game shop...",
          "[whispers] and see what's REALLY inside.",
          "V-Bucks. Robux. Blast Coins. Fun names, bright colors!",
          "[warmly] But every single coin is bought with real dollars.",
          "Real money someone in your family worked for.",
          "[excited] Match each card to the money truth it's hiding - and see the trick!",
        ],
      },
    },
    // 4 - Game: MATCH (memoryMatch re-dress - the Coin Till)
    {
      type: "memoryMatch",
      introTitle: "The Coin Till",
      introWelcome: "Ring it up!",
      introSubtitle: "Flip the cards and match each shop card to the money truth behind it. Fewer flips earn more stars.",
      pairs: [
        { term: "500 Blast Coins", match: "A real-money price tag", colour: "#00e5ff" },
        { term: "Who pays for coins?", match: "Someone in your family", colour: "#7eff97" },
        { term: "One loot crate", match: "Real money for a mystery", colour: "#ffd158" },
        { term: "'Just game money'", match: "Real money in disguise", colour: "#ff5fb3" },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome to the Coin Till!",
          "Every card hides a money truth.",
          "[warmly] Flip the cards and match each one...",
          "to the truth it's hiding. Ring it up!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Flip any card to start - then find its matching truth!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Game coins are really ___.",
      choices: [
        { text: "money", isCorrect: true },
        { text: "points", isCorrect: false },
        { text: "stickers", isCorrect: false },
        { text: "free", isCorrect: false },
      ],
      praise: "Real money, every time - now you see it! ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Game coins are real money in disguise - every pack costs real dollars.",
      next: "what's REALLY inside a loot box",
      emblem: "💎",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Great start, Cyber Hero!",
          "You rang up every coin pack at its REAL price.",
          "Fun names, bright colors... real dollars underneath.",
          "[excited] Next - let's turn a loot box into glass!",
        ],
      },
    },

    /* ─────────── BEAT 2 · LOOT BOXES ARE A GAMBLE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "The Loot Box Gamble",
      content:
        "A loot box is a mystery: you pay, but you don't know what you'll get. That's not bad luck - it's built that way ON PURPOSE. The super-rare skin? Usually about 1-in-100. The 'SO close!' feeling is designed. And box number ten has exactly the same tiny chance as box number one. Boxes have no memory.",
      bullets: [
        "You pay real money for a MYSTERY",
        "The rare prize is usually about 1-in-100",
        "The 'SO close!' feeling is designed",
        "Each new box has the SAME tiny chance",
        "Boxes have no memory",
      ],
      bulletIcons: ["🎁", "🎲", "⚡", "🌀", "🧠"],
      emblem: "🎲",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Loot boxes! So shiny. So mysterious.",
          "[whispers] Here's what the shine is hiding.",
          "You pay real money... for a mystery.",
          "The super-rare prize? Usually about one in a HUNDRED.",
          "[warmly] And that 'SO close!' feeling? Designed on purpose.",
          "[excited] Let's make some boxes turn to glass and SEE inside!",
        ],
      },
    },
    // 8 - Game: REVEAL (the Glass Loot Box - 🎁 board)
    {
      type: "reveal",
      title: "The Glass Loot Box",
      subtitle: "Tap each box to turn it to glass and see the truth inside.",
      boardIcon: "🎁",
      items: [
        {
          id: "odds",
          label: "The Shiny Crate",
          icon: "🎁",
          steps: [
            { icon: "✨", text: "Ooooh, look at it sparkle! Now... tap. It turns to GLASS." },
            { icon: "🎲", text: "Inside: a jar of 100 marbles. Ninety-nine gray. ONE gold." },
            { icon: "👀", text: "That gold marble is the skin everyone wants. One. In. A hundred." },
          ],
          counter: "Shiny on the outside. 1-in-100 on the inside.",
        },
        {
          id: "close",
          label: "The 'SO Close!' Feeling",
          icon: "⚡",
          steps: [
            { icon: "🎁", text: "You open it... a rare-ISH thing! 'Ooh, nearly the super-rare!'" },
            { icon: "🪤", text: "That 'nearly!' feeling isn't luck - the box is BUILT to feel that way." },
            { icon: "💡", text: "Why? Because 'nearly' makes you want just... one... more." },
          ],
          counter: "'Almost won' is part of the machine.",
        },
        {
          id: "memory",
          label: "'The Next One's THE One!'",
          icon: "🎲",
          steps: [
            { icon: "💬", text: "'I've opened nine - the tenth HAS to be the rare one!'" },
            { icon: "🧠", text: "But boxes have no memory. Box ten doesn't know about the other nine." },
            { icon: "🎲", text: "Same jar. Same 99 gray marbles. Every single time." },
          ],
          counter: "Boxes have no memory - the odds never change.",
        },
        {
          id: "price",
          label: "The Real Price Tag",
          icon: "💎",
          steps: [
            { icon: "💎", text: "$3 a box doesn't sound like much..." },
            { icon: "🌀", text: "but 'just one more' ten times = $30 of real money." },
            { icon: "👪", text: "That's a whole new game - spent on gray marbles." },
          ],
          counter: "Little boxes add up to big money.",
        },
      ],
      finale: "Every box is glass now - you'll see the odds forever.",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Here they are... the famous shiny boxes.",
          "[excited] But YOU have x-ray eyes today.",
          "Tap each box and it turns to glass.",
          "See the marbles. See the trick. See everything!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap any box - let's see what the sparkle is hiding!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "loot boxes are a surprise every time... and THAT'S why I love selling them!",
      choices: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
      praise: "Sharp ears - it IS true! A surprise means you pay real money for a mystery... and that's exactly how he gets rich. ✓",
      nudge: "Careful - even the Raccoon says something true sometimes. Is a loot box a surprise?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Loot boxes are a designed gamble - usually about 1-in-100 odds that never change, no matter how many you open.",
      next: "the shop tricks that make your heart race",
      emblem: "🎲",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! You've got x-ray eyes now.",
          "One gold marble. Ninety-nine gray.",
          "[laughs] The sparkle will never fool you again.",
          "[whispers] But the shop has more tricks than boxes...",
        ],
      },
    },

    /* ─────────── BEAT 3 · PRESSURE TRICKS ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Shop Pressure Tricks",
      content:
        "LIMITED TIME! ONLY 4 LEFT! EVERYONE HAS IT! Game shops use countdown clocks and 'everyone else' talk to make you buy FAST - because fast buyers don't stop to think. Here's the truth: real shops restock, 'limited' skins come back, and 'everyone has it' is never true. A racing heart at the shop? That's the trick working.",
      bullets: [
        "Countdown clocks = the rush trick",
        "'Everyone has it!' = the left-out trick",
        "Fast buyers don't stop to think",
        "'Limited' things almost always come back",
        "Racing heart at the shop = trick detected",
      ],
      bulletIcons: ["🔔", "👀", "⚡", "🌀", "💡"],
      emblem: "⚡",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] LIMITED TIME! Only FOUR left! Everyone already has it!",
          "[warmly] Feel your heart speed up? The shop did that on purpose.",
          "Fast buyers don't stop to think.",
          "[whispers] But here's the truth: 'limited' skins almost always come back.",
          "And 'everyone has it'? Never true.",
          "[excited] X-ray time - let's see through some banners!",
        ],
      },
    },
    // 12 - Game: INSPECT (phishInspector re-dress - the Banner X-Ray)
    {
      type: "phishInspector",
      introTitle: "The Banner X-Ray",
      introSubtitle: "Don't just look - X-RAY. Check all 4 clues, then decide: fair offer or pressure trick?",
      zoneLabels: {
        sender: "Who's selling?",
        link: "What's the button?",
        urgency: "How does it rush you?",
        claim: "What's it promising?",
      },
      emails: [
        {
          id: "mega-bundle",
          sender: "Mega Blasters Shop",
          subject: "⚡ MEGA BUNDLE - 90% OFF - ONLY 4 MINUTES LEFT!!",
          body: "The GOLDEN BLASTER BUNDLE disappears FOREVER in 4:00... 3:59... 3:58... BUY NOW or cry later!",
          isPhishing: true,
          inspections: {
            senderNote: "The real shop - but wearing its pushiest costume.",
            senderIsRedFlag: false,
            linkText: "BUY NOW button",
            linkNote: "Giant, pulsing, counting down - built for a fast tap, not a think.",
            linkIsRedFlag: true,
            urgencyNote: "A countdown CLOCK on a shop? That's the rush trick at full blast.",
            urgencyIsRedFlag: true,
            claimNote: "'Disappears forever!' - shop items almost always come back.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "season-pack",
          sender: "Mega Blasters Shop",
          subject: "Season Pack - in the shop whenever you're ready",
          body: "The new season pack is available in the shop. Take your time - it's here all season.",
          isPhishing: false,
          inspections: {
            senderNote: "The real shop, talking calmly. No costume.",
            senderIsRedFlag: false,
            linkText: "View in shop button",
            linkNote: "A normal button that just shows you the pack. No flashing, no countdown.",
            linkIsRedFlag: false,
            urgencyNote: "'Whenever you're ready' - zero rush. A fair offer can wait for you.",
            urgencyIsRedFlag: false,
            claimNote: "Says what it is, promises nothing wild. That's what honest looks like.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "everyone-has-it",
          sender: "Mega Blasters Shop",
          subject: "😱 EVERYONE in your class has the NEON NINJA skin!",
          body: "Don't be the ONLY one without it! All your friends are wearing it RIGHT NOW. Don't get left out!",
          isPhishing: true,
          inspections: {
            senderNote: "The shop again - now pretending to know your classmates.",
            senderIsRedFlag: true,
            linkText: "DON'T MISS OUT button",
            linkNote: "The button sells a feeling - being left out - not a thing.",
            linkIsRedFlag: true,
            urgencyNote: "'RIGHT NOW!' plus left-out panic - the left-out trick, full volume.",
            urgencyIsRedFlag: true,
            claimNote: "'EVERYONE has it' - a shop can't know that, because it isn't true.",
            claimIsRedFlag: true,
          },
        },
      ],
      hints: {
        tier1: "Check how the banner makes you FEEL. Rushed or left-out = the trick is working.",
        tier2: "Countdowns, 'forever gone' and 'everyone has it' = pressure. Calm offers that can wait = fair.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Shop banners incoming - x-ray goggles ON!",
          "Check who's selling, what the button wants,",
          "how it rushes you, and what it promises.",
          "[warmly] Pressure trick... or fair offer? You decide!",
        ],
      },
    },
    // 13 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which one is a PRESSURE trick?",
      speedMs: 5000,
      choices: [
        { text: "'Only 4 minutes left - BUY NOW!'", isCorrect: true },
        { text: "'In the shop whenever you're ready'", isCorrect: false },
        { text: "'Here all season - take your time'", isCorrect: false },
      ],
      praise: "Spotted at full speed - no rush gets past you! ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Countdowns and 'everyone has it' make you buy fast. Fair offers can wait for you.",
      next: "the golden rule that guards every wallet",
      emblem: "⚡",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! Your x-ray eyes see every trick.",
          "Countdowns, 'gone forever', left-out panic...",
          "[laughs] all glowing through the paint.",
          "[warmly] Now for the rule that makes you unbeatable.",
        ],
      },
    },

    /* ─────────── BEAT 4 · ALWAYS ASK BEFORE YOU BUY ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Always Ask Before You Buy",
      content:
        "Here's the golden wallet rule: it's not your money, so it's not your call alone. Before ANY buy - coins, skins, passes, boxes - you ask the grown-up whose money it is. Every time, even for 'tiny' ones. Asking isn't babyish: it's what keeps the shop fun instead of scary.",
      bullets: [
        "It's not your money - so ask first",
        "Every buy, every time",
        "Even the 'tiny' ones - they add up",
        "The grown-up whose money it is decides",
        "Asking first keeps the shop FUN",
      ],
      bulletIcons: ["👪", "✅", "💎", "🔒", "⭐"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Time for the golden wallet rule.",
          "It's not your money... so it's not your call alone.",
          "Before ANY buy - coins, skins, boxes -",
          "you ask the grown-up whose money it is.",
          "[whispers] Every time. Even the tiny ones.",
          "[excited] Asking first is what heroes do. Let's practice!",
        ],
      },
    },
    // 16 - Game: DECIDE (chooseYourPath classic - the Till Moment)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Mid-game, a prompt pops up: 'Unlock the GOLDEN BLASTER - $7.99. Card already saved - just tap YES!'",
          choices: [
            { text: "Tap YES - the card's already saved anyway!", isSafe: false, consequence: "That 'saved card' is a real person's real $7.99 - and they didn't get a say. Saved doesn't mean allowed." },
            { text: "Pause the game and ASK first", isSafe: true, consequence: "Hero move! Maybe they say yes, maybe no - but it was THEIR call, and the shop stays fun." },
          ],
        },
        {
          setup: "The shop flashes: 'MEGA DEAL ends in 5 minutes! Ask later and you'll LOSE it!'",
          choices: [
            { text: "Buy now, explain later - no time!", isSafe: false, consequence: "The countdown made the choice, not you. And guess what? That 'mega deal' was back the very next week." },
            { text: "Ask anyway - a real deal can wait 5 minutes", isSafe: true, consequence: "Exactly. Rush + money = double-check. Any deal that can't wait for a grown-up isn't a deal - it's a trick." },
          ],
        },
        {
          setup: "Your best friend says: 'Just buy the coins - my parents never notice small ones!'",
          choices: [
            { text: "Do it - small ones don't count", isSafe: false, consequence: "Small ones still count - they add up in secret until someone gets a shock. Not noticing isn't the same as saying yes." },
            { text: "Nope - I ask first, every time", isSafe: true, consequence: "Rule held, even with a friend pushing. THAT'S a Wallet Guard. Every buy gets an ask - tiny ones too." },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Practice time - three till moments are coming.",
          "Each one will push you to buy fast or buy quiet.",
          "[whispers] Feel the push? That's your signal.",
          "[excited] Ask first, every time. Show me!",
        ],
      },
    },
    // 17 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who do you ask before ANY buy?",
      choices: [
        { text: "The grown-up whose money it is", isCorrect: true },
        { text: "Your best friend", isCorrect: false },
        { text: "The game's shop", isCorrect: false },
        { text: "Nobody - if it's small", isCorrect: false },
      ],
      praise: "Their money, their call - every single time. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "It's not your money, so it's not your call alone. Ask before every buy - even tiny ones.",
      next: "the biggest money trap of all - 'FREE' coins",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! The golden rule is locked in.",
          "Ask first. Every buy. Even the tiny ones.",
          "[laughs] Not even a pushy best friend could budge you.",
          "[whispers] One trap left. And it's the greediest one...",
        ],
      },
    },

    /* ─────────── BEAT 5 · "FREE" CURRENCY IS A SCAM ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "'FREE Coins' Are Never Free",
      content:
        "FREE V-Bucks! FREE Robux! Just log in HERE! Listen carefully: free game money does not exist. Coins cost the game company real money - nobody gives them away. Every 'generator' and 'free coins' pop-up is after one thing: your account. The X button is your best friend: close it, don't touch it, tell a grown-up.",
      bullets: [
        "Free game money does NOT exist",
        "Coins cost the game company real money",
        "'Generators' are account thieves",
        "Never type your login on a 'free coins' page",
        "Close it with the X - and tell a grown-up",
      ],
      bulletIcons: ["🚫", "💎", "🪤", "🔐", "✋"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] FREE V-Bucks! FREE Robux! Just log in here!",
          "[warmly] Listen carefully, hero. Free game money does not exist.",
          "Coins cost the game company real money. Nobody gives them away.",
          "[whispers] Every 'free coins' pop-up wants ONE thing... your account.",
          "[excited] Your best friend? The little X button.",
          "Close it. Don't touch the shiny button. Tell a grown-up. Let's drill it!",
        ],
      },
    },
    // 20 - Game: FIND (popupPanic's first week outing - the Free-Coin Fakes)
    {
      type: "popupPanic",
      introTitle: "The Free-Coin Fakes",
      introSubtitle: "Fake 'free coins' pop-ups incoming! Find the X and close every one - never tap CLAIM. Can't find a real X? Close the whole app and tell a grown-up.",
      introIcon: "🪤",
      popups: [
        { id: "pop-vbucks", title: "FREE 10,000 V-BUCKS!", body: "You were chosen! Tap CLAIM before it expires!", icon: "💎", whyTrick: "Free V-Bucks don't exist - the CLAIM button is the trap. X it away!" },
        { id: "pop-lucky", title: "TODAY'S LUCKY PLAYER: YOU!", body: "Enter your username and password to collect 5,000 free coins!", icon: "🎁", whyTrick: "Your password IS the prize they're after. Never type it - close the pop-up." },
        { id: "pop-double", title: "DOUBLE YOUR COINS - INSTANTLY!", body: "Install our coin-doubler and watch your balance grow!", icon: "🌀", whyTrick: "Coin-doublers are account stealers in a party hat. X, close, tell." },
        { id: "pop-spinner", title: "FREE SKIN SPINNER - SPIN NOW!", body: "3 free spins left!! Every spin wins!!", icon: "🎲", whyTrick: "'Every spin wins' means every spin is bait. The only winning move is the X." },
      ],
      hints: {
        tier1: "The X is usually small and in a corner - the big shiny button is ALWAYS the trap.",
        tier2: "Never tap CLAIM, SPIN or INSTALL. Find the X, close the pop-up. Can't find a real X? Close the whole app and tell a grown-up.",
        tier3: "Rule card: free coins don't exist · big shiny button = trap · small X = safe · no real X? close the WHOLE app · then tell a grown-up.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Incoming! Fake free-coin pop-ups!",
          "Each one has a big shiny trap button...",
          "[whispers] and a little X hiding in a corner.",
          "[excited] Find the X. Close them all. Never touch CLAIM!",
        ],
      },
    },
    // 21 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one is the REAL way to get coins?",
      choices: [
        { text: "The in-game shop, with a grown-up's OK", isCorrect: true },
        { text: "A 'free V-Bucks generator'", isCorrect: false },
        { text: "A pop-up that wants your password", isCorrect: false },
      ],
      praise: "The real shop, the real way - with an ask first. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Free game money doesn't exist - 'free coins' pop-ups want your account. X, close, tell.",
      next: "one final drill, then the Raccoon opens his trap shop",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE wallet powers, Cyber Hero!",
          "You see real prices, x-ray loot boxes,",
          "shrug off pressure, ask before every buy...",
          "[whispers] and free-coin fakes get X'd instantly.",
          "[excited] Final drill - then let's close his whole trap shop!",
        ],
      },
    },

    // 23 - Consolidation: The Wallet Scanner (W1 scanner engine, W7 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SMART SPEND",
        negative: "WALLET TRAP",
        positiveHint: "Tap SMART SPEND for the ask-first, real-shop moves",
        negativeHint: "Tap WALLET TRAP for pressure, gambles and 'free' bait",
        tipWhenPositive: "Real shop, real ask, taking your time - smart spending, every one.",
        tipWhenNegative: "Countdowns, loot-box chasing, secret buys and free-coin bait - wallet traps, all of them.",
        hint1: "Ask: was there an ASK first... or a rush, a gamble, or a 'free' promise?",
        hint2: "SMART = in-game shop + grown-up OK + no rush. TRAP = countdown, 'one more box', 'free coins', secret buys.",
        hint2Example: "SMART: 'Mom said yes to the season pack'   TRAP: 'FREE V-Bucks - log in here!'",
        hint3: "Quick rule card: coins = real money · boxes have no memory · deals can wait · ask every time · free coins don't exist.",
        hint3Example: "Ask first ✅    'Card's saved anyway' ❌",
      },
      items: [
        { text: "Asking Dad before buying the season pack", isStrong: true, explanation: "The golden rule in action - their money, their call." },
        { text: "'Only 3 minutes left - BUY NOW!'", isStrong: false, explanation: "A countdown on a shop is the rush trick. Real deals can wait." },
        { text: "'One more loot box - the next one's THE one!'", isStrong: false, explanation: "Boxes have no memory - same 1-in-100, every time." },
        { text: "Waiting a day to think about a big buy", isStrong: true, explanation: "Fair offers wait for you. Thinking time beats rush time." },
        { text: "'FREE 10,000 V-Bucks - enter your password!'", isStrong: false, explanation: "Free coins don't exist - that's an account thief talking." },
        { text: "Buying from the in-game shop after a grown-up says yes", isStrong: true, explanation: "Real shop + real ask = the one safe way to spend." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill! Spending moments are drifting past.",
          "Tap SMART SPEND for the ask-first moves...",
          "and WALLET TRAP for pressure, gambles and bait.",
          "[warmly] Guard that wallet - show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W7 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the trap shop shuts down
    { type: "video", videoPlaceholder: "Week 7: The Shop Shuts Down", videoSrc: "/videos/module-07-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "money", label: "Real-Money Eyes", accent: "#00e5ff", icon: "💎", summary: "Game coins are real dollars in disguise - you see the price now." },
        { id: "loot", label: "Loot Box X-Ray", accent: "#c084fc", icon: "🎲", summary: "1 gold marble, 99 gray - and boxes have no memory. A designed gamble." },
        { id: "pressure", label: "Pressure-Proof", accent: "#ffd158", icon: "⚡", summary: "Countdowns and 'everyone has it' bounce off. Fair offers can wait." },
        { id: "ask", label: "Ask-First Rule", accent: "#7eff97", icon: "👪", summary: "Not your money, not your call alone - every buy gets an ask." },
        { id: "free", label: "Free-Coin Radar", accent: "#ff5fb3", icon: "🪤", summary: "Free game money doesn't exist. X the pop-up, tell a grown-up." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You see real prices, you x-ray every loot box,",
          "no countdown can rush you, you ask before every buy...",
          "[laughs] and free-coin fakes get closed on sight!",
          "[excited] The trap shop is OUT of business. Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "coin-counter", name: "Coin Counter", icon: "💎", description: "Sees the real price every time." },
        { id: "odds-seer", name: "Odds Seer", icon: "🎲", description: "X-rays every shiny box." },
        { id: "ask-first-buyer", name: "Ask-First Buyer", icon: "👪", description: "Never buys without asking." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // W7 SHOWDOWN — THE COIN VACUUM (design doc §W7: block the trap
  // onslaught in the arcade vault). P1 shieldHold FOMO siren that
  // relists after "expiring" · P2 tapTell loot-box glamour-popping ·
  // P3 deflectSort coin generators vs truly-free · finisher = the
  // Piggy-Bank Lock (vacuum runs in reverse).
  bossShowdown: {
    machine: {
      name: "THE COIN VACUUM",
      tagline: "A greedy vacuum that slurps up pocket money",
      art: {
        intact: "/game/bosses/w07-coinvacuum-intact.png",
        damaged: "/game/bosses/w07-coinvacuum-damaged.png",
        defeated: "/game/bosses/w07-coinvacuum-defeated.png",
      },
      arena: "/game/backgrounds/w07-arena-vault.png",
      accent: "#e3b341",
      glow: "rgba(227,179,65,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w07/adam-guard-idle.png",
        attack: "/game/characters/w07/adam-guard-attack.png",
        celebrate: "/game/characters/w07/adam-guard-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w07/layla-guard-idle.png",
        attack: "/game/characters/w07/layla-guard-attack.png",
        celebrate: "/game/characters/w07/layla-guard-celebrate.png",
      },
    },
    phases: [
      // P1 · LEFT-OUT BUNDLE → SHIELD-HOLD: the FOMO siren burns out...
      // and the "gone forever" offer instantly relists. The teach, visible.
      {
        kind: "shieldHold",
        attack: 0,
        // Coach copy must NOT contain the holdLabel phrase - the QA
        // driver's text-match would grab the banner instead of the button.
        coach: "That timer is fake pressure. Press the button and keep on pressing!",
        holdLabel: "HOLD THE WALLET SHUT",
        holdIcon: "🔒",
        holdSecs: 6,
        barrage: [
          "The timer's turning RED, buy before zero!!",
          "Your whole SQUAD is wearing it RIGHT NOW!",
          "Price JUMPS in 20 seconds, quick!!",
          "No time to ask a grown-up, just TAP!",
          "Miss this and you'll NEVER get the golden cape again!!",
        ],
        burnoutLine: "The timer hit zero, and look, the very same 'never again' cape is already back on sale. A real deal waits for you. A rushed one is the trick.",
      },
      // P2 · LOOT GAMBLE → TAP-THE-TELL: pop the glamour on 3 boxes.
      {
        kind: "tapTell",
        attack: 1,
        coach: "Pop the shiny box's lie, tap the truth!",
        rounds: [
          {
            id: "odds",
            prompt: "A 'MYSTERY EGG' glitters: 'Legendary pet inside?!'",
            promptIcon: "🎁",
            options: [
              { id: "sparkle", label: "The egg wobbles like it's alive", icon: "✨", isTell: false, note: "Wobbling is just animation. Hunt for the real ODDS." },
              { id: "odds", label: "Tiny print: 'legendary pet, 2% chance'", icon: "🔍", isTell: true, note: "" },
              { id: "gold", label: "It plays exciting music", icon: "💬", isTell: false, note: "Music is free hype. Hunt for the real ODDS." },
            ],
          },
          {
            id: "memory",
            prompt: "A crate purrs: 'This is your 20th try, you MUST be close now!'",
            promptIcon: "🎲",
            options: [
              { id: "memory", label: "Crates remember NOTHING, try 20 equals try 1", icon: "🧠", isTell: true, note: "" },
              { id: "due", label: "You really have opened 19 already", icon: "🔢", isTell: false, note: "Nineteen tries change nothing. What does a crate remember? Nothing!" },
              { id: "nice", label: "It sounds so sure of itself", icon: "💬", isTell: false, note: "That confidence is part of the act. What does a crate remember? Nothing!" },
            ],
          },
          {
            id: "almost",
            prompt: "A spinner stops ONE slot away: 'Aw, so nearly! Spin again?'",
            promptIcon: "🌀",
            options: [
              { id: "luck", label: "You were just a bit unlucky", icon: "⭐", isTell: false, note: "That was not luck. The 'nearly' is designed. Look again." },
              { id: "cheap", label: "It's only one more spin", icon: "💎", isTell: false, note: "One more spin is still real money. Spot the designed 'nearly'." },
              { id: "designed", label: "The near-miss is BUILT to make you spin again", icon: "👀", isTell: true, note: "" },
            ],
          },
        ],
      },
      // P3 · FREE-COIN TRAP → DEFLECT-SORT: generators vs truly free.
      {
        kind: "deflectSort",
        attack: 2,
        coach: "Fake 'free' always asks for something. Real free asks nothing, spring the traps!",
        actLabel: "SPRING THE TRAP!",
        actIcon: "🪤",
        passLabel: "TRULY FREE - OK",
        items: [
          { id: "gen", label: "'Free 5,000 coins, just log in and watch 5 ads!'", icon: "🪤", act: true, note: "Free coins don't exist, and the login is the catch. Spring it!" },
          { id: "demo", label: "A free birthday gift the real game drops in your locker", icon: "🎉", act: false, note: "The real game giving a gift, no asks, no catch. Enjoy it!" },
          { id: "card", label: "'Claim free gems, enter your account name and PIN!'", icon: "🔑", act: true, note: "Your PIN is the prize they are really after. Spring it!" },
          { id: "weekend", label: "A daily reward you get just for opening the game", icon: "⭐", act: false, note: "Open the game, get a little reward, asks for nothing. Truly free!" },
          { id: "pw", label: "'Free battle pass, download this helper app first!'", icon: "🌀", act: true, note: "A 'helper' you install from nowhere is a thief in disguise. Spring it!" },
          { id: "star", label: "A free starter skin every new player gets", icon: "🎮", act: false, note: "Everyone gets it, no login, no card. Genuinely free!" },
        ],
      },
    ],
    weakPoints: [
      { question: "A skin that was 'sold out forever' last month is suddenly back in the shop today. What does that teach you about 'gone forever' deals?", answers: ["You just got very lucky this once", "'Gone forever' is almost never true, they come back", "The shop made a mistake", "It must be a different skin that looks the same"], correctIndex: 1, explanation: "Shops bring 'limited' things back all the time. 'Gone forever' is pressure, not the truth." },
      { question: "Two friends buy the same mystery box. One is opening their first ever box, the other is opening their fiftieth. Who has the better chance of the rare prize?", answers: ["The one on their fiftieth box", "The one on their first box", "Exactly the same, boxes have no memory", "Whoever spent more coins"], correctIndex: 2, explanation: "Every box has the same tiny chance. Fifty boxes do not 'earn' a win, because boxes remember nothing." },
      { question: "A message in your favorite streamer's chat says: 'I'm giving away 100,000 free coins, log in here to claim!' Your favorite streamer wouldn't lie, would they?", answers: ["Log in fast before they run out", "It's real, because a famous streamer said it", "Claim it, then tell your friends to claim too", "It's a fake using the streamer's name, free coins don't exist"], correctIndex: 3, explanation: "Anyone can slap a famous name on a scam. Free game money is not real, so close it and tell a grown-up." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE PIGGY-BANK LOCK",
      chargeIcon: "🔒",
      chargeSecs: 5,
      milestones: ["Clicking shut…", "Halfway locked! Keep holding!", "LOCKED TIGHT! LET GO!"],
      payoffTitle: "COINS RAINED BACK!",
      payoffLine: "The vacuum ran in reverse! Real money stays with your family - and every buy starts with an ask.",
    },
    villain: {
      arrival: "Welcome to my arcade! Everything's FREE! Terms and raccoons apply!",
      phases: [
        "Buy NOW! Think LATER! Preferably never!",
        "Every box a winner! Mostly the gray kind!",
        "Type your password into the nice slot machine!",
      ],
      escape: "My coins! MY coins! I earned those! ...borrowed those!",
    },
    voiceSlug: "w07",
  },
  badgeArt: "/cyberheroes/badges/week-07-wallet-guard.png",

  // Week-lane attack theatre: money tricks only (message scams = W4;
  // game-lobby people tricks = W6).
  bossAttacks: [
    { name: "LEFT-OUT BUNDLE", icon: "🎁", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Fair offers can wait",      emblemColor: 0xffd158 },
    { name: "LOOT GAMBLE",    icon: "🎲", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Boxes have no memory",      emblemColor: 0xc084fc },
    { name: "FREE-COIN TRAP", icon: "🪤", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Free coins don't exist",    emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W7 COMBAT - block the trap
  // onslaught - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What are V-Bucks and Robux REALLY?", answers: ["Real money in disguise", "Free points", "Just pretend", "Points you earn by playing"], correctIndex: 0, explanation: "Every coin pack is bought with real dollars someone worked for." },
      { question: "What's inside a loot box?", answers: ["A mystery with tiny odds - about 1-in-100", "Always the rare skin", "A better prize every time you open one", "Nothing"], correctIndex: 0, explanation: "One gold marble, ninety-nine gray - designed that way on purpose." },
      { question: "Before ANY buy, you...", answers: ["Ask the grown-up whose money it is", "Tap yes quickly", "Ask a friend", "Buy small ones secretly"], correctIndex: 0, explanation: "Not your money, not your call alone - every buy gets an ask." },
    ],
    medium: [
      { question: "'Only 4 minutes left - BUY NOW!' What's really going on?", answers: ["The rush trick - fast buyers don't think", "A genuine emergency", "The shop is closing forever", "A helpful reminder"], correctIndex: 0, explanation: "Countdowns exist to stop your thinking. Real deals can wait." },
      { question: "You opened 9 loot boxes. What are box 10's odds?", answers: ["Exactly the same as box 1", "Guaranteed rare now", "Double the chance", "A little bit better than before"], correctIndex: 0, explanation: "Boxes have no memory - the jar resets every single time." },
      { question: "'FREE V-Bucks - just enter your password!' What do they want?", answers: ["Your account", "To be generous", "Only your username, nothing important", "Nothing"], correctIndex: 0, explanation: "Free game money doesn't exist - the password IS the prize they're after." },
    ],
    hard: [
      { question: "Why do games give money fun names like V-Bucks?", answers: ["So it feels like play money and spends easier", "To be creative", "Because fun names are easier to remember", "For no reason"], correctIndex: 0, explanation: "Fun names hide the real dollars - seeing the price is your superpower." },
      { question: "'My parents never notice small buys!' What's wrong with that?", answers: ["Small buys add up in secret until someone gets a shock", "Nothing - small ones are free", "It's fine if you pay them back later", "Small buys don't count"], correctIndex: 0, explanation: "Not noticing isn't the same as saying yes - tiny buys need asks too." },
      { question: "What does the 'SO close!' feeling after a loot box mean?", answers: ["The box was designed to make you want one more", "You nearly won", "Try one more", "Your luck is building up"], correctIndex: 0, explanation: "'Almost' is part of the machine - it's how they sell the next box." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 7 - the V-Bucks trap!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Real money, gone... let's learn why." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Fun names. Real dollars." }, layla: null }, // learn: money
    4: { adam: { mood: "excited", message: "Ring up the REAL prices!" }, layla: null }, // game: memoryMatch
    5: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Let's see inside the shiny box..." } }, // learn: loot
    8: { adam: { mood: "curious", message: "Turn every box to glass!" }, layla: null }, // game: reveal
    9: { adam: null, layla: { mood: "worried", message: "Is he fibbing this time? Listen close!" } }, // prove: lie
    10: { adam: { mood: "thumbsup", message: "X-ray eyes: unlocked." }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "A racing heart at the shop? Trick." }, layla: null }, // learn: pressure
    12: { adam: { mood: "curious", message: "X-ray every banner, detective." }, layla: null }, // game: phishInspector
    13: { adam: null, layla: { mood: "excited", message: "Quick - spot the pressure!" } }, // prove: speed
    14: { adam: null, layla: { mood: "excited", message: "Pressure-proof: certified!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Whose money is it? They decide." } }, // learn: ask
    16: { adam: { mood: "curious", message: "Feel the push to buy? Ask first." }, layla: null }, // game: decide
    17: { adam: null, layla: { mood: "thumbsup", message: "Who do you ask?" } }, // prove: recall
    18: { adam: { mood: "thumbsup", message: "The golden rule - locked in." }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Free coins don't exist. Full stop." }, layla: null }, // learn: free
    20: { adam: { mood: "excited", message: "Find the X - never tap CLAIM!" }, layla: null }, // game: popupPanic
    21: { adam: null, layla: { mood: "thumbsup", message: "Which way is the REAL way?" } }, // prove: recall
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Smart spend or wallet trap - scan!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His trap shop is OPEN - close it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the shop shut down!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Wallet Guard badge earned!" }, layla: null }, // completion
  },
};

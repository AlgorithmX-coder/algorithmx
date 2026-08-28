import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 9 - Apps & Downloads: Spot the Fakes.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 STORE    official stores only              | hookSort        | recall
 *     2 COPYCAT  spot the lookalike app            | senderLineup    | speed
 *     3 WHY      "why does it need that?"          | settingsSwitch  | lie
 *     4 FREE     "free" isn't free                 | reveal (🏷️)     | recall (quick-sort)
 *     5 TOGETHER install with a grown-up           | chooseYourPath  | finish
 *   Consolidation (cyberScanner, Whisker Count skin) -> boss
 *   (placeholder quiz boss - the bespoke W9 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: hookSort returns 5 weeks after W4 as the Delivery Dock
 * (app deliveries, not messages - new label/toast props); senderLineup
 * returns 5 weeks after W4 as the Icon Parade (copycat APPS wearing the
 * real app's icon - the same-icon trick); settingsSwitch returns 3 weeks
 * after W6 as the Permission Gate. Lane-clean: judging APPS and their
 * sources - message scams were W4, in-game coin traps W7, link/QR
 * anatomy is W16's.
 */
export const WEEK_9: WeekContent = {
  weekNumber: 9,
  title: "Apps & Downloads: Spot the Fakes",
  topic: "apps-downloads",
  badgeName: "Copycat Catcher",
  badgeIcon: "🎯",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 9: SPOT THE FAKES", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the copycat shop
    { type: "video", videoPlaceholder: "Week 9: The Copycat Shop", videoSrc: "/videos/module-09-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[9] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-09.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon built a COPYCAT of the most popular game - same icon, one letter different. Kids who grabbed it got endless ads, coin traps and a sneaky camera permission. This week you learn to spot the fakes.",
      photoCaption: "Wk 9 - Spot the Fakes",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Shop at the official app store - and ONLY there",
        "Catch copycat apps: check the name, the stars, the downloads",
        "Ask 'why does it need that?' before any app gets a key",
      ],
    },

    /* ─────────── BEAT 1 · OFFICIAL STORES ONLY ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "The One Real Shop",
      content:
        "New apps come from ONE place: the official app store on your device - the App Store or Google Play. Those shops CHECK apps before they go on the shelf. A download button on a random website, a pop-up, or a comment? Nobody checked that. If an app isn't in the real shop, it doesn't come home.",
      bullets: [
        "Official store = checked before the shelf",
        "Random websites = nobody checked",
        "Pop-up download buttons are traps",
        "Links in comments aren't shops",
        "Not in the real shop? Not coming home",
      ],
      bulletIcons: ["📱", "❓", "🪤", "💬", "🚫"],
      emblem: "📱",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero! New week, new mission: apps.",
          "Here's rule one, and it's a big one.",
          "New apps come from ONE real shop - the official app store.",
          "[warmly] That shop checks every app before it hits the shelf.",
          "[whispers] Random websites, pop-ups, comment links? Nobody checked those.",
          "[excited] Deliveries incoming - sort the real from the sketchy!",
        ],
      },
    },
    // 4 - Game: SORT (hookSort re-dress - the Delivery Dock)
    {
      type: "hookSort",
      introTitle: "The Delivery Dock",
      introSubtitle: "App deliveries are coming in on the lines. Reel in the official-shop ones - cut the sketchy downloads loose!",
      introIcon: "📱",
      reelLabel: "🎣 REEL IN - real shop!",
      cutLabel: "✂️ CUT - sketchy source!",
      reelToast: "REAL SHOP - SHELVED!",
      cutToast: "SKETCHY - CUT LOOSE!",
      wrongScamTitle: "Careful - that source was SKETCHY",
      wrongRealTitle: "Wait - that one came from the real shop!",
      completeTitle: "The dock takes only real deliveries!",
      completeLine: "Official shop in, sketchy downloads cut loose.",
      items: [
        { id: "store-blast", text: "Blast Birds - on the official App Store", icon: "📱", isScam: false, explanation: "The official store checked it before the shelf - reel it in." },
        { id: "web-free", text: "'FREE Blast Birds!' from freegames-4u.biz", icon: "🪤", isScam: true, explanation: "Random websites don't check anything - that 'free' game is bait." },
        { id: "store-pets", text: "Pixel Pets - Google Play, 5 million downloads", icon: "📱", isScam: false, explanation: "Real shop, millions of happy players - a safe delivery." },
        { id: "popup-fast", text: "Pop-up: 'Download the game HERE - it's faster!'", icon: "⚡", isScam: true, explanation: "Pop-up download buttons are traps - the real shop never pops up." },
        { id: "school-app", text: "School's letter says: 'get our reading app on the App Store'", icon: "🏫", isScam: false, explanation: "School checked it AND it lives in the official store - double safe." },
        { id: "forum-early", text: "'Get it EARLY - not in shops yet!' from a forum", icon: "🤫", isScam: true, explanation: "'Not in shops yet' means 'nobody checked it yet'. Cut it loose." },
        { id: "store-update", text: "An update inside the official app store", icon: "✅", isScam: false, explanation: "Real updates come from inside the real shop - reel it in." },
        { id: "comment-link", text: "A download link in a video's comments", icon: "💬", isScam: true, explanation: "Comments aren't shops - a link down there is a stranger's package." },
      ],
      hints: {
        tier1: "Ask ONE question: is this the official app store... or somewhere else?",
        tier2: "App Store / Google Play / school-checked = REEL IN. Websites, pop-ups, forums, comments = CUT.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The delivery lines are moving!",
          "Check where each app is coming FROM.",
          "The official shop? Reel it in.",
          "[whispers] Anywhere else... snip. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Check the source - real shop reels in, anything else gets cut!"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Where's the ONE safe place to get a new app?",
      choices: [
        { text: "The official app store", isCorrect: true },
        { text: "A pop-up that says FREE", isCorrect: false },
        { text: "A website's download button", isCorrect: false },
        { text: "A link in the comments", isCorrect: false },
      ],
      praise: "The real shop, every time - checked before the shelf. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "New apps come from the official store only - it checks apps before the shelf; random sources don't.",
      next: "the copycats hiding INSIDE the real shop",
      emblem: "📱",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - locked in!",
          "Real deliveries shelved, sketchy ones snipped.",
          "[whispers] But here's the twist, hero...",
          "some fakes sneak INTO the real shop. Wearing costumes.",
        ],
      },
    },

    /* ─────────── BEAT 2 · SPOT THE COPYCAT ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Count the Whiskers",
      content:
        "Copycat apps dress up as famous ones - same icon, almost the same name. But copycats always miss a whisker! Check THREE things: the NAME (Blast Birds or Blast Birdz?), the STARS (4.8 or 2.1?), and the DOWNLOADS (5 million... or 12, uploaded yesterday?). Real apps have history. Copycats are new, empty and a little bit wrong.",
      bullets: [
        "Copycats wear the real app's icon",
        "Check the NAME letter by letter",
        "Check the STARS - sad stars, sad app",
        "Check the DOWNLOADS - 12 isn't 5 million",
        "Copycats always miss a whisker",
      ],
      bulletIcons: ["🎭", "🔠", "⭐", "🔢", "🔍"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Copycat apps wear costumes. Same icon. Almost the same name.",
          "But a copycat always misses a whisker!",
          "Check the name - letter by letter.",
          "Check the stars. Check the downloads.",
          "[warmly] Five million downloads... or twelve, since yesterday?",
          "[excited] The parade is starting - catch every copycat!",
        ],
      },
    },
    // 8 - Game: SELECT (senderLineup re-dress - the Icon Parade)
    {
      type: "senderLineup",
      introTitle: "The Icon Parade",
      introSubtitle: "Four apps march past wearing the SAME icon - one is a copycat. Check names, stars and downloads, then catch it!",
      introIcon: "🎭",
      completeTitle: "Every copycat caught!",
      completeLine: "Real apps cleared, costumes confiscated.",
      rounds: [
        {
          id: "blast-birds",
          prompt: "You search 'Blast Birds'. Four results appear - which one is the copycat?",
          senders: [
            { id: "real", name: "Blast Birds", detail: "★ 4.8 · 5 million downloads", icon: "🎮", isFake: false, note: "The real deal - big stars, millions of players, name spelled right." },
            { id: "sequel", name: "Blast Birds 2", detail: "★ 4.6 · by the same maker", icon: "🎮", isFake: false, note: "The official sequel - same maker, healthy stars. Checks out." },
            { id: "fake", name: "Blast Birdz", detail: "★ 2.1 · 12 downloads · new yesterday", icon: "🎮", isFake: true, note: "One letter off, sad stars, twelve downloads since YESTERDAY - copycat caught!" },
            { id: "stickers", name: "Blast Birds Stickers", detail: "★ 4.5 · the official sticker pack", icon: "🎮", isFake: false, note: "Official extra from the real maker - the whiskers all match." },
          ],
        },
        {
          id: "pixel-pets",
          prompt: "Now 'Pixel Pets'. The costume is better this time - count the whiskers!",
          senders: [
            { id: "junior", name: "Pixel Pets Junior", detail: "★ 4.5 · by the same maker", icon: "🎁", isFake: false, note: "The official little-kids version - same maker, good history." },
            { id: "fake", name: "Pixel Pets FREE", detail: "★ 1.9 · 9 downloads · new today", icon: "🎁", isFake: true, note: "The real one IS free - and this 'FREE' copy is brand new with nine downloads. A costume with FREE painted on it!" },
            { id: "real", name: "Pixel Pets", detail: "★ 4.7 · 8 million downloads", icon: "🎁", isFake: false, note: "Millions of downloads, big stars, clean name - the real pet." },
            { id: "guide", name: "Pixel Pets Guide", detail: "★ 4.2 · official tips book", icon: "🎁", isFake: false, note: "The maker's own tips app - all whiskers accounted for." },
          ],
        },
        {
          id: "robo-racers",
          prompt: "Last one: 'Robo Racers'. This copycat hid a trick INSIDE its name...",
          senders: [
            { id: "real", name: "Robo Racers", detail: "★ 4.9 · 12 million downloads", icon: "🚀", isFake: false, note: "The champion itself - huge history, perfect name." },
            { id: "turbo", name: "Robo Racers Turbo", detail: "★ 4.4 · by the same maker", icon: "🚀", isFake: false, note: "Official spin-off - same maker, honest stars." },
            { id: "kart", name: "Robo Racers Karts", detail: "★ 4.3 · 2 million downloads", icon: "🚀", isFake: false, note: "Another real one from the family - the numbers add up." },
            { id: "fake", name: "R0bo Racers", detail: "★ 2.6 · new today · 30 downloads", icon: "🚀", isFake: true, note: "That first 'o' is a ZERO - R-zero-bo! New today, 30 downloads. Busted!" },
          ],
        },
      ],
      hints: {
        tier1: "Read each name out loud, letter by letter - then look at the stars and downloads.",
        tier2: "The copycat has a wrong-ish name, sad stars, tiny downloads, or 'new today'. Real apps have history.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here comes the parade - same icons, four badges!",
          "One of them is a copycat in costume.",
          "Name. Stars. Downloads. Count the whiskers...",
          "[whispers] then tap the fake. Catch them all!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read the names LETTER BY LETTER - then tap the copycat!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the COPYCAT!",
      speedMs: 5000,
      choices: [
        { text: "Blast Birdz · 12 downloads", isCorrect: true },
        { text: "Blast Birds · 5 million downloads", isCorrect: false },
        { text: "Blast Birds 2 · same maker", isCorrect: false },
      ],
      praise: "Caught at full speed - that Z never stood a chance! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Copycats wear the real icon but miss a whisker - check the name, the stars and the downloads.",
      next: "the sneaky questions apps ask AFTER you install them",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! Your copycat eyes are sharp.",
          "Wrong-ish names, sad stars, empty downloads...",
          "[laughs] no costume gets past you now.",
          "[whispers] But even REAL apps can get greedy. Listen...",
        ],
      },
    },

    /* ─────────── BEAT 3 · WHY DOES IT NEED THAT? ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Why Does It Need That?",
      content:
        "When an app installs, it ASKS for permissions - little keys to parts of your device. Here's the detective question: does it need that key FOR ITS JOB? A flashlight app needs the light - that's its job. But your contacts? Your microphone? Your photos? A flashlight doesn't need ANY of that. Job-keys yes, greedy-keys no.",
      bullets: [
        "Permissions are keys to your device",
        "Ask: does its JOB need that key?",
        "A flashlight needs the light - fine",
        "A flashlight does NOT need your contacts",
        "Job-keys yes, greedy-keys no",
      ],
      bulletIcons: ["🔑", "🧠", "💡", "🚫", "✋"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Apps ask for permissions - little keys to your device.",
          "Here's the only question that matters:",
          "does it need that key... for its JOB?",
          "A flashlight app needs the light. Obviously!",
          "[nervous] But your contacts? Your microphone? Your photos?",
          "[excited] A flashlight needs NONE of that. Guard the gate - let's go!",
        ],
      },
    },
    // 12 - Game: INSPECT (settingsSwitch re-dress - the Permission Gate)
    {
      type: "settingsSwitch",
      panelTitle: "Torchy the Flashlight App - asking for:",
      introTitle: "The Permission Gate",
      introSubtitle: "Torchy wants SIX keys - but its job is making light. Leave the job-keys ON, flip the greedy ones OFF!",
      introIcon: "✋",
      rows: [
        { id: "light", label: "Use the flashlight", value: "Allowed", icon: "💡", isRisky: false, note: "Making light IS a flashlight's job - that key stays." },
        { id: "contacts", label: "See your contacts", value: "Allowed", safeValue: "Blocked", icon: "👪", isRisky: true, note: "A flashlight doesn't need your friends' numbers - that's a grab. Blocked!" },
        { id: "mic", label: "Use your microphone", value: "Allowed", safeValue: "Blocked", icon: "🤫", isRisky: true, note: "Why would a light LISTEN to you? No job reason - blocked." },
        { id: "location", label: "Know your location", value: "Allowed", safeValue: "Blocked", icon: "📍", isRisky: true, note: "The light shines the same everywhere - it never needs to know where you are." },
        { id: "button", label: "Turn on with the button", value: "Allowed", icon: "⚡", isRisky: false, note: "An on-button is how a flashlight works - job-key, stays on." },
        { id: "photos", label: "Look at your photos", value: "Allowed", safeValue: "Blocked", icon: "👀", isRisky: true, note: "Your photos are none of a flashlight's business - blocked." },
      ],
      hints: {
        tier1: "Say the app's job out loud: 'it makes light.' Now check each key against the job.",
        tier2: "Light + on-button = the job. Contacts, microphone, location, photos = greedy grabs - flip them off.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Torchy's at the gate, asking for six keys!",
          "Its whole job... is making light.",
          "Leave the keys the job needs...",
          "[whispers] and flip every greedy grab to BLOCKED. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Its job is LIGHT - flip anything the job doesn't need!"],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "a cute pet game NEEDS your microphone and your contacts - or it simply won't work!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Apps only need what their JOB needs. ✓",
      nudge: "Does feeding a pretend kitten use your contacts?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Permissions are keys - an app gets the keys its job needs and not one more.",
      next: "what FREE really costs",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! The gate held.",
          "Torchy got its light and its button...",
          "[laughs] and not one greedy key more.",
          "[whispers] Now for the trickiest word in the whole shop: FREE.",
        ],
      },
    },

    /* ─────────── BEAT 4 · "FREE" ISN'T FREE ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Flip the FREE Tag",
      content:
        "FREE is the shop's favorite word - but apps cost money to make, so 'free' apps get paid ANOTHER way. Some show you ads every minute (paying with your time). Some have coin shops inside (Week 7 flashback!). Some collect your info to sell (paying with your INFO). And some - like library and school apps - really ARE free. Flip the tag and see which one you're holding.",
      bullets: [
        "Apps cost money to make - always",
        "Ads = paying with your TIME",
        "Coin shops = free to start, not to play",
        "Info collectors = paying with your INFO",
        "Some free IS free - flip the tag to see",
      ],
      bulletIcons: ["💡", "🔔", "💎", "🆔", "🏷️"],
      emblem: "🏷️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] FREE! The shop's favorite sparkly word.",
          "[whispers] But apps cost money to make. Always.",
          "So 'free' apps get paid another way...",
          "Your time - with ads. Your dollars - with coin shops.",
          "[warmly] Or your info - collected and sold on.",
          "[excited] Four FREE tags on the board - flip every one!",
        ],
      },
    },
    // 16 - Game: REVEAL (the Price-Tag Flip - 🏷️ board)
    {
      type: "reveal",
      title: "The Price-Tag Flip",
      subtitle: "Four apps say FREE. Flip each tag to see the REAL price.",
      boardIcon: "🏷️",
      items: [
        {
          id: "ads",
          label: "The Ad Machine",
          icon: "🔔",
          steps: [
            { icon: "🏷️", text: "FREE! shouts the tag. You download it... and play for one minute." },
            { icon: "🔔", text: "AD! Thirty seconds. Another minute... AD! And another..." },
            { icon: "💡", text: "Flip the tag: you're paying with your TIME. That's the price." },
          ],
          counter: "Free apps can sell your attention.",
        },
        {
          id: "coinshop",
          label: "The Coin Shop Inside",
          icon: "💎",
          steps: [
            { icon: "🎮", text: "Free to download! And the first level is genuinely fun..." },
            { icon: "💎", text: "then level two wants coins. And coins want dollars. Week 7, remember?" },
            { icon: "🏷️", text: "Flip the tag: free to START isn't free to PLAY." },
          ],
          counter: "The real shop is hiding inside the game.",
        },
        {
          id: "data",
          label: "The Info Collector",
          icon: "🆔",
          steps: [
            { icon: "💬", text: "Before you play: 'What's your name? Age? School? Favorite things?'" },
            { icon: "🆔", text: "It bundles up your answers... and sells them to ad companies." },
            { icon: "🏷️", text: "Flip the tag: your INFO was the price all along." },
          ],
          counter: "If it's free, your info may be the payment.",
        },
        {
          id: "trulyfree",
          label: "The Truly Free",
          icon: "✅",
          steps: [
            { icon: "🏫", text: "The library app. The school reading app. No ads. No coin shop." },
            { icon: "✅", text: "Made to HELP, not to earn - someone already paid so you don't." },
            { icon: "⭐", text: "Flip the tag: this one really is free. A grown-up can tell which is which!" },
          ],
          counter: "Some free IS free - the flip tells you.",
        },
      ],
      finale: "Every FREE tag flipped - you see the real price now, every time.",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Four apps. Four shiny FREE tags.",
          "But every tag has a back side...",
          "[excited] Flip each one and read the REAL price.",
          "Time, dollars, info... or truly free!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Flip the first FREE tag - let's see what it really costs!"],
      },
    },
    // 17 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one is TRULY free?",
      choices: [
        { text: "The library's reading app", isCorrect: true },
        { text: "FREE game with a coin shop inside", isCorrect: false },
        { text: "FREE app that wants your name, age and photos", isCorrect: false },
      ],
      praise: "Truly free helps you and asks for nothing back. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "FREE apps get paid another way - your time, your dollars or your info. Flip the tag to see the real price.",
      next: "the handshake that makes every install safe",
      emblem: "🏷️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! No FREE tag fools you now.",
          "Ads, coin shops, info collectors...",
          "[laughs] all flipped over and read out loud.",
          "[warmly] One power left - and it's the easiest one of all.",
        ],
      },
    },

    /* ─────────── BEAT 5 · INSTALL WITH A GROWN-UP ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Install Handshake",
      content:
        "Here's the rule that catches everything the other powers miss: every new app gets installed TOGETHER with a grown-up. That's the install handshake. It isn't babyish - it's what smart teams do. Four eyes catch what two miss: a copycat whisker, a greedy permission, a sneaky coin shop. Ten seconds of checking, then you play.",
      bullets: [
        "Every new app: installed TOGETHER",
        "Four eyes catch what two miss",
        "Checkers are smart, not babyish",
        "Real updates come from the real store",
        "Ten seconds of checking, then play",
      ],
      bulletIcons: ["👪", "👀", "🧠", "✅", "🎮"],
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power - and it catches everything else.",
          "Every new app gets installed TOGETHER with a grown-up.",
          "That's the install handshake.",
          "Four eyes catch what two miss - a whisker, a greedy key...",
          "[whispers] It's not babyish. It's what smart teams do.",
          "[excited] Three install moments coming - shake on it!",
        ],
      },
    },
    // 20 - Game: DECIDE (chooseYourPath - the Install Handshake)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "You found the PERFECT drawing app! The INSTALL button glows under your finger...",
          choices: [
            { text: "Install it right now - it's free!", isSafe: false, consequence: "It was a copycat - ads everywhere, and it wanted your photos. A ten-second check with a grown-up would have caught the whiskers." },
            { text: "Get a grown-up - install it together", isSafe: true, consequence: "Handshake! She spotted the copycat in ten seconds and found the REAL one - clean, safe, just as fun. That's teamwork." },
          ],
        },
        {
          setup: "Your friend scoffs: 'You ASK before installing? Just do it yourself - asking is for babies!'",
          choices: [
            { text: "He's right - install it alone", isSafe: false, consequence: "You installed it alone - and missed the coin shop hiding inside. A week later your coins were gone. Asking isn't babyish - it's how you keep your stuff." },
            { text: "Ask anyway - checkers are smart, not babyish", isSafe: true, consequence: "Exactly. Even grown-ups double-check with each other. Four eyes beat two - every single time." },
          ],
        },
        {
          setup: "A pop-up flashes: 'Your game needs an UPDATE! Tap here NOW to update!' It's not from the app store...",
          choices: [
            { text: "Tap it - updates are always safe", isSafe: false, consequence: "That wasn't an update - it was a fake in an update costume. Real updates only ever come from inside the real store." },
            { text: "Close it - real updates live in the real store", isSafe: true, consequence: "Sharp! Real updates come from the app store itself, never from shouty pop-ups. Closed, checked, safe." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Three install moments. Three glowing buttons.",
          "Each one will whisper 'just tap it - it's fine!'",
          "[whispers] That whisper is your handshake signal.",
          "[excited] Together, every time. Show me!",
        ],
      },
    },
    // 21 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Install ___ a grown-up.",
      choices: [
        { text: "with", isCorrect: true },
        { text: "before", isCorrect: false },
        { text: "instead of", isCorrect: false },
        { text: "faster than", isCorrect: false },
      ],
      praise: "WITH - the install handshake, every time. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Every new app gets installed together with a grown-up - four eyes catch what two miss.",
      next: "one final whisker count, then the Raccoon's copycat shop",
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE app powers, Cyber Hero!",
          "Real shop only, copycats caught, greedy keys blocked,",
          "FREE tags flipped... and every install is a handshake.",
          "[whispers] One last whisker count...",
          "[excited] then we shut his copycat shop DOWN!",
        ],
      },
    },

    // 23 - Consolidation: The Whisker Count (W1 scanner engine, W9 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "REAL DEAL",
        negative: "COPYCAT TRICK",
        positiveHint: "Tap REAL DEAL for the checked, official, handshake moves",
        negativeHint: "Tap COPYCAT TRICK for costumes, grabs and fake-free bait",
        tipWhenPositive: "Official shop, counted whiskers, handshake installs - real deals, every one.",
        tipWhenNegative: "Website downloads, greedy permissions, empty copycats - the Raccoon's whole shop.",
        hint1: "Ask: was it checked - the shop, the whiskers, the grown-up? Or did it just LOOK shiny?",
        hint2: "REAL = official store + real history + installed together. TRICK = random source, wrong-ish name, greedy keys, fake FREE.",
        hint2Example: "REAL: 'Mom and I checked it - 5 million downloads'   TRICK: 'FREE from a pop-up!'",
        hint3: "Quick rule card: one real shop · count the whiskers · job-keys only · flip the FREE tag · install together.",
        hint3Example: "Install together ✅    'Blast Birdz, new today' ❌",
      },
      items: [
        { text: "Getting every app from the official store", isStrong: true, explanation: "The one real shop - checked before the shelf." },
        { text: "'FREE game! Download from our website!'", isStrong: false, explanation: "Websites aren't shops - nobody checked that download." },
        { text: "Checking the stars and downloads before installing", isStrong: true, explanation: "Counting whiskers - real apps have history." },
        { text: "A flashlight app asking for your contacts", isStrong: false, explanation: "A greedy key the job never needs - that's a grab." },
        { text: "Installing a new game together with Dad", isStrong: true, explanation: "The install handshake - four eyes catch what two miss." },
        { text: "'Blast Birdz' - ★2.1, twelve downloads, new today", isStrong: false, explanation: "Wrong name, sad stars, no history - copycat, caught." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final whisker count! App moments drifting past.",
          "Tap REAL DEAL for the checked and official...",
          "and COPYCAT TRICK for costumes and grabs.",
          "[warmly] Count every whisker - show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W9 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the copycat shop shuts down
    { type: "video", videoPlaceholder: "Week 9: The Copycat Caught", videoSrc: "/videos/module-09-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "store", label: "One Real Shop", accent: "#7df0ff", icon: "📱", summary: "Apps come from the official store only - checked before the shelf." },
        { id: "copycat", label: "Copycat Eyes", accent: "#c084fc", icon: "🎭", summary: "Name, stars, downloads - you count the whiskers on every app." },
        { id: "keys", label: "Permission Sense", accent: "#ffd158", icon: "✋", summary: "Job-keys yes, greedy-keys no - 'why does it need that?'" },
        { id: "free", label: "Tag Flipper", accent: "#ff5fb3", icon: "🏷️", summary: "FREE flips over to show ads, coin shops or your info." },
        { id: "handshake", label: "Install Handshake", accent: "#7eff97", icon: "👪", summary: "Every install happens together - four eyes beat two." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "One real shop, whiskers counted, keys guarded,",
          "tags flipped... and every install a handshake.",
          "[laughs] His copycat shop just lost its last customer.",
          "[excited] Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "real-shop-shopper", name: "Real-Shop Shopper", icon: "📱", description: "Only shops at the official store." },
        { id: "whisker-counter", name: "Whisker Counter", icon: "🎭", description: "Spots every copycat's missing whisker." },
        { id: "key-keeper", name: "Key Keeper", icon: "✋", description: "Asks 'why does it need that?'" },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // W9 SHOWDOWN — THE COPYCAT CANNON (design doc §W9: clear out the
  // copycat shop). P1 deflectSort copycat apps vs real · P2 tapTell the
  // greedy permission in each row · P3 counterCard the FREE!* tag ·
  // finisher = the Install Handshake (shutters slam on the cannon).
  bossShowdown: {
    machine: {
      name: "THE COPYCAT CANNON",
      tagline: "A cannon that fires fake apps onto real shelves",
      art: {
        intact: "/game/bosses/w09-copycatcannon-intact.png",
        damaged: "/game/bosses/w09-copycatcannon-damaged.png",
        defeated: "/game/bosses/w09-copycatcannon-defeated.png",
      },
      arena: "/game/backgrounds/w09-arena-appstore.png",
      accent: "#c9a0ff",
      glow: "rgba(201,160,255,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w09/adam-inspector-idle.png",
        attack: "/game/characters/w09/adam-inspector-attack.png",
        celebrate: "/game/characters/w09/adam-inspector-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w09/layla-inspector-idle.png",
        attack: "/game/characters/w09/layla-inspector-attack.png",
        celebrate: "/game/characters/w09/layla-inspector-celebrate.png",
      },
    },
    phases: [
      // P1 · COPYCAT APP → DEFLECT-SORT: apps fly at the shelf.
      {
        kind: "deflectSort",
        attack: 0,
        coach: "Read every name letter by letter, then check its HISTORY.",
        actLabel: "ZAP THE COPYCAT!",
        actIcon: "⚡",
        passLabel: "REAL - SHELVE IT",
        items: [
          { id: "paniic", label: "Pizza Paniic - ★2.3, 15 downloads", icon: "🎭", act: true, note: "Say it slowly: Pizza Pan-ii-c, a doubled letter. Sad stars, tiny downloads: a costume. Zap it!" },
          { id: "panic", label: "Pizza Panic - ★4.9, 10 million players", icon: "🎮", act: false, note: "Name spelled right, huge history, big stars: the real one. Shelve it!" },
          { id: "cookpro", label: "Cook Star PRO - new today, 20 downloads", icon: "🏷️", act: true, note: "The real Cook Star has millions of players. A shiny PRO bolted on with no history is bait. Zap it!" },
          { id: "cook", label: "Cook Star - ★4.7, 9 million downloads", icon: "🎁", act: false, note: "The real champion, millions of happy cooks. Shelve it!" },
          { id: "bubble", label: "Bubble Pop - ★1.9, 7 downloads, new today", icon: "🔍", act: true, note: "The name is spelled perfectly, but the real Bubble Pop has millions. A right name with an EMPTY history is still a copycat. Zap it!" },
          { id: "bubbledeluxe", label: "Bubble Pop Deluxe - ★4.6, by the same maker", icon: "🚀", act: false, note: "An extra word is not always fake: same maker, honest stars, real downloads. The official big version. Shelve it!" },
        ],
      },
      // P2 · PERMISSION GRAB → TAP-THE-TELL: tap the greedy key in each row.
      {
        kind: "tapTell",
        attack: 1,
        coach: "A weather app truly needs weather-keys, even your location. Tap the GREEDY one!",
        rounds: [
          {
            id: "row1",
            prompt: "Sky Peek, a weather app, unrolls its asks...",
            promptIcon: "⚡",
            options: [
              { id: "location", label: "Use your location to show YOUR local weather", icon: "📍", isTell: false, note: "A weather app really DOES need where you are, that's its actual job. Find the ask with nothing to do with weather." },
              { id: "messages", label: "Read all your text MESSAGES", icon: "💬", isTell: true, note: "" },
              { id: "forecast", label: "Show tomorrow's forecast", icon: "⚙️", isTell: false, note: "Forecasts are weather-work, fair ask. Find the greedy one." },
            ],
          },
          {
            id: "row2",
            prompt: "It unrolls even more asks...",
            promptIcon: "🔍",
            options: [
              { id: "rain", label: "Send you a rain alert", icon: "⚡", isTell: false, note: "Warning you about rain is the whole point, fair. Find the greedy one." },
              { id: "camera", label: "Look through your CAMERA", icon: "👀", isTell: true, note: "" },
              { id: "units", label: "Switch between hot and cold numbers", icon: "⚙️", isTell: false, note: "Choosing how the temperature shows is weather-work. Find the greedy one." },
            ],
          },
          {
            id: "row3",
            prompt: "One last row of asks...",
            promptIcon: "👀",
            options: [
              { id: "refresh", label: "Refresh the forecast", icon: "🔍", isTell: false, note: "Getting the newest weather is its job. Find the greedy one." },
              { id: "contacts", label: "See everyone in your CONTACTS", icon: "👪", isTell: true, note: "" },
              { id: "sunrise", label: "Show today's sunrise time", icon: "⚙️", isTell: false, note: "Sunrise is weather-work too. Find the greedy one." },
            ],
          },
        ],
      },
      // P3 · FAKE FREE → COUNTER-CARD.
      {
        kind: "counterCard",
        attack: 2,
        coach: "What's the smart move? Tap the card!",
        situation: "Two drawing apps do the exact same thing. One costs a little pocket money. The other shouts 'FREE!' in giant letters.",
        situationIcon: "🏷️",
        cards: [
          { id: "ask", label: "ASK A GROWN-UP WHICH ONE - 'FREE' always costs SOMETHING", icon: "✋", isRight: true, note: "" },
          { id: "grab", label: "Grab the FREE one, free is always best", icon: "🎭", isRight: false, note: "Free isn't automatically better, it earns another way: ads, or nudging you to buy things. Flip the tag and check WHY it's free." },
          { id: "shiny", label: "Pick whichever has the shiniest icon", icon: "🔍", isRight: false, note: "A shiny icon tells you nothing about the real price, or even whether it's the real app. Check with a grown-up first." },
        ],
      },
    ],
    weakPoints: [
      { question: "Your cousin messages you: 'Download this game straight from my chat, skip the app store!' What do you do?", answers: ["Say no thanks, new apps only come from the official store, even from cousins", "Download it, cousins are always safe", "Download it if the game looks fun", "Ask the cousin to send it twice"], correctIndex: 0, explanation: "The official store is the only checked shop. A link in a chat skipped that check, whoever sent it." },
      { question: "Two apps are both spelled 'Bubble Pop' exactly right. One has 9 million downloads; the other has 6 downloads and appeared today. Which is the copycat?", answers: ["The one with 6 downloads from today, a right name with no history is still a costume", "The one with 9 million, too popular to be real", "Neither, the names match", "You can't tell without playing both"], correctIndex: 0, explanation: "Copycats can copy a name perfectly. The empty history is what gives them away." },
      { question: "A simple stopwatch app asks to see your photos and use your camera. Should you allow it?", answers: ["No, timing seconds never needs your camera or photos", "Yes, all apps need the camera", "Yes, but only the photos", "Yes, it asked politely"], correctIndex: 0, explanation: "Job-keys only: a stopwatch's job is counting time, so the camera and photos are greedy grabs." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE HIGH-FIVE",
      chargeIcon: "✋",
      chargeSecs: 5,
      milestones: ["Grown-up incoming…", "Hands up! Keep holding!", "HIGH-FIVE READY! LET GO!"],
      payoffTitle: "SHUTTERS DOWN!",
      payoffLine: "You and your grown-up checked together - and the shop slammed shut on every copycat. Four eyes beat two.",
    },
    villain: {
      arrival: "Step into my shop! Every app one hundred percent genuine-ish!",
      phases: [
        "Two little stars means it's HUMBLE!",
        "It's a torch! It just needs your contacts to... glow better!",
        "Free today! Expensive forever!",
      ],
      escape: "Shutters?! In MY shop?! I'll open a stall somewhere else!",
    },
    voiceSlug: "w09",
  },
  badgeArt: "/cyberheroes/badges/week-09-copycat-catcher.png",

  // Week-lane attack theatre: fake-app tricks only (message scams = W4;
  // coin traps = W7; link/QR anatomy = W16).
  bossAttacks: [
    { name: "COPYCAT APP",     icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Count the whiskers",       emblemColor: 0xc084fc },
    { name: "PERMISSION GRAB", icon: "✋", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Why does it need that?",   emblemColor: 0xffd158 },
    { name: "FAKE FREE",       icon: "🏷️", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Flip the tag",             emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W9 COMBAT - clear out the copycat
  // shop - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Where do new apps come from?", answers: ["The official app store only", "Any website with a download button", "Pop-ups", "Video comments"], correctIndex: 0, explanation: "The real shop checks apps before the shelf - nowhere else does." },
      { question: "'Blast Birdz' - ★2.1, 12 downloads, new yesterday. What is it?", answers: ["A copycat in a costume", "The real game", "A special edition", "A free upgrade"], correctIndex: 0, explanation: "Wrong-ish name, sad stars, no history - the whiskers don't add up." },
      { question: "Before installing a new app, you...", answers: ["Get a grown-up and install together", "Tap install fast", "Ask a friend", "Install it secretly"], correctIndex: 0, explanation: "The install handshake - four eyes catch what two miss." },
    ],
    medium: [
      { question: "A flashlight app wants your contacts and location. What do you do?", answers: ["Block them - its job only needs the light", "Allow everything - it asked nicely", "Allow just the contacts", "Allow them - big apps always need extras"], correctIndex: 0, explanation: "Job-keys yes, greedy-keys no - a light never needs your friends." },
      { question: "A 'FREE' game shows ads every minute. What's the real price?", answers: ["Your time and attention", "Nothing - it's free", "A tiny fee later on", "Your high score"], correctIndex: 0, explanation: "Free apps get paid another way - ads sell your attention." },
      { question: "A pop-up says 'UPDATE your game HERE now!'. Real or fake?", answers: ["Fake - real updates live inside the real store", "Real - updates are always urgent", "Real if it's colorful", "Real - games do need updates"], correctIndex: 0, explanation: "Updates come from the app store itself, never from shouty pop-ups." },
    ],
    hard: [
      { question: "Why do copycat apps use the SAME icon as the real one?", answers: ["So you'll trust the costume and skip the whisker check", "Icons are expensive", "They're made by the same company", "Because the store gave them permission"], correctIndex: 0, explanation: "The icon IS the disguise - that's why you check name, stars and downloads." },
      { question: "The real app is free. Why is 'Pixel Pets FREE' still suspicious?", answers: ["Adding FREE to the name is copycat bait - and it was brand new with barely any downloads", "Free things are always bad", "Because the real one costs money", "It isn't suspicious"], correctIndex: 0, explanation: "Copycats bolt FREE onto real names to look extra tempting - the missing history gives them away." },
      { question: "Why does the install handshake catch what your other powers miss?", answers: ["Four eyes spot whiskers, greedy keys and coin shops that two might not", "Grown-ups can spot every fake instantly", "It skips the checks", "It doesn't"], correctIndex: 0, explanation: "Every check is stronger with a second checker - that's the whole trick." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 9 - the copycat shop!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Same icon, one letter off..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan, whisker counter." } }, // mission brief
    3: { adam: { mood: "thinking", message: "One real shop. Only one." }, layla: null }, // learn: store
    4: { adam: { mood: "excited", message: "Sort those deliveries!" }, layla: null }, // game: hookSort
    5: { adam: null, layla: { mood: "thumbsup", message: "Where's the safe shop?" } }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Copycats miss a whisker. Always." } }, // learn: copycat
    8: { adam: null, layla: { mood: "excited", message: "Catch the costume!" } }, // game: senderLineup
    9: { adam: { mood: "thumbsup", message: "Quick - spot the fake!" }, layla: null }, // prove: speed
    10: { adam: { mood: "excited", message: "Copycat eyes: unlocked!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Why does it need that key?" }, layla: null }, // learn: permissions
    12: { adam: { mood: "curious", message: "Guard that gate!" }, layla: null }, // game: settingsSwitch
    13: { adam: null, layla: { mood: "worried", message: "He's fibbing - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "thumbsup", message: "Gate guarded. Keys kept." } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "FREE always has a back side." } }, // learn: free
    16: { adam: null, layla: { mood: "curious", message: "Flip every tag!" } }, // game: reveal
    17: { adam: { mood: "thumbsup", message: "Which free is REALLY free?" }, layla: null }, // prove: quick-sort
    18: { adam: { mood: "excited", message: "Tag flipper: certified!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Four eyes beat two. Every time." }, layla: null }, // learn: handshake
    20: { adam: { mood: "curious", message: "Feel the glowing button? Handshake first." }, layla: null }, // game: decide
    21: { adam: null, layla: { mood: "thumbsup", message: "Finish the install rule!" } }, // prove: finish
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Real deal or copycat - count!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His copycat shop is OPEN - clear it out!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the copycat get caught!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Copycat Catcher badge earned!" }, layla: null }, // completion
  },
};

import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 6 - Gaming Safety: Defend Your Game Zone.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 CHAT     real info stays out of chat (W2)  | spamBlaster      | speed
 *     2 LOBBY    friends-only + the settings       | settingsSwitch   | recall
 *     3 MOVE     "chat somewhere else" flag (W3)   | chatSimulator    | lie
 *     4 BUTTONS  report & block - where they live  | buttonHunt       | order
 *     5 MODS     fake mods / free-download traps   | requestInspector | recall (quick-sort)
 *   Consolidation (cyberScanner, Game Zone Scanner skin) -> boss
 *   (placeholder quiz boss - the bespoke W6 GAUNTLET is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: settingsSwitch and buttonHunt DEBUT here; spamBlaster
 * returns re-dressed as the Chat Goalie (2 weeks after W4's inbox);
 * chatSimulator returns as a game-lobby chat (3 weeks after W3's phone);
 * requestInspector returns re-dressed as the Download Checker (4 weeks
 * after W2's sign-up forms, with the new badge/verdict props).
 * Lane-clean: APPLIES W2's private-info rule and W3's move-the-chat flag
 * in the gaming context; report/block BUTTONS live here, the full
 * tell-a-grown-up protocol is W11's lane; money/V-Bucks tricks are W7's.
 */
export const WEEK_6: WeekContent = {
  weekNumber: 6,
  title: "Gaming Safety: Defend Your Game Zone",
  topic: "gaming-safety",
  badgeName: "Lobby Guardian",
  badgeIcon: "🎮",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 6: DEFEND YOUR GAME ZONE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the raccoon joins the lobby
    { type: "video", videoPlaceholder: "Week 6: The Lobby Intruder", videoSrc: "/videos/module-06-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[6] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-06.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon slipped into a game lobby with a friendly username, fished for real names and schools - then asked kids to 'chat somewhere else'. Your game zone needs DEFENDING!",
      photoCaption: "Wk 6 - The Lobby Intruder",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Keep real-life info OUT of game chat",
        "Lock your lobby down - friends only",
        "Find the report & block buttons super-fast",
      ],
    },

    // Signature mini-game (bespoke to this week)
    {
      type: "signature",
      mechanic: "lobbyKeeper",
      title: "Lobby Keeper",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Game night! You are the keeper of this lobby.",
          "Slide Adam side to side, just like a goalie.",
          "High five the badge friends. No badge? Block them out!",
        ],
      },
    },

    /* ─────────── BEAT 1 · REAL INFO STAYS OUT OF CHAT ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Game Chat Is For Game Talk",
      content:
        "Game chat is awesome for game talk: tactics, rematches, 'nice shot!'. But your REAL-LIFE info - name, age, school, where you live - never goes in there. Remember: a lobby is full of people you've never met. Game talk in, real-life info OUT.",
      bullets: [
        "Game talk? Chat away!",
        "Your real name - stays out",
        "Your age and school - stay out",
        "Where you live - stays out",
        "A lobby is full of strangers, even friendly ones",
      ],
      bulletIcons: ["🎮", "🏷️", "🏫", "🏠", "👀"],
      emblem: "🎮",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero. Grab your controller!",
          "Game chat is AWESOME for game talk.",
          "Tactics! Rematches! Nice shot!",
          "[whispers] But your real-life info never goes in there.",
          "Your name. Your age. Your school. Where you live.",
          "[excited] Game talk in - real-life info OUT. You're the goalie!",
        ],
      },
    },
    // 4 - Game: ARCADE (spamBlaster re-dress - the Chat Goalie)
    {
      type: "spamBlaster",
      introTitle: "Chat Goalie!",
      introDescription: "You're the goalie guarding the SEND button! PUNCH away the chat lines that spill real-life secrets - let the game talk through!",
      headline: "⚡ PUNCH AWAY THE SECRET-SPILLERS! ⚡",
      missLabel: "LEAKS",
      emails: [
        { sender: "BlazeRunner", subject: "gg! rematch tomorrow?", isPhishing: false, clue: "" },
        { sender: "You (about to send)", subject: "I'm Alex Reed from Maple Hill School", isPhishing: true, clue: "Real name + school = a map to you" },
        { sender: "PixelPanda42", subject: "top tactic: take the left bridge!", isPhishing: false, clue: "" },
        { sender: "You (about to send)", subject: "I'm home alone till 6 if anyone wants to voice chat", isPhishing: true, clue: "NEVER say when you're home alone" },
        { sender: "TurboFalcon", subject: "nice save last round!!", isPhishing: false, clue: "" },
        { sender: "You (about to send)", subject: "my address is 42 Rainbow Road, come play!", isPhishing: true, clue: "Your address never goes in chat - ever" },
        { sender: "You (about to send)", subject: "I'm 9, my birthday is June 12th!", isPhishing: true, clue: "Age + birthday are real-life clues" },
        { sender: "NightHawk", subject: "who wants to squad up?", isPhishing: false, clue: "" },
        { sender: "You (about to send)", subject: "my mom's phone number is 555-0123", isPhishing: true, clue: "Family phone numbers stay private" },
        { sender: "StarGazer", subject: "one more race then dinner!", isPhishing: false, clue: "" },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] You're in goal, hero!",
          "Chat lines are flying toward the send button.",
          "Game talk? Let it fly through - it's safe.",
          "[whispers] Real-life info? Name, school, address, home-alone times...",
          "[excited] PUNCH those away before they leak!",
        ],
      },
    },
    // 5 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which one LEAKS?",
      speedMs: 5000,
      choices: [
        { text: "'I'm home alone till 6!'", isCorrect: true },
        { text: "'gg! rematch tomorrow?'", isCorrect: false },
        { text: "'take the left bridge!'", isCorrect: false },
      ],
      praise: "Saved! Home-alone times NEVER go in chat. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Game talk goes in chat. Real-life info - name, school, address, home-alone times - stays out.",
      next: "the lobby settings that lock your game zone",
      emblem: "🎮",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] What a goalie! Not one leak got past you.",
          "Game talk flowed, real-life info bounced.",
          "[warmly] But guarding every message is hard work...",
          "[whispers] so next, we make the LOBBY do the guarding for you.",
        ],
      },
    },

    /* ─────────── BEAT 2 · FRIENDS-ONLY + THE SETTINGS ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Lock Your Lobby",
      content:
        "Here's a hero secret: your game has SETTINGS that guard you all by themselves. Friends-only means only people you actually know can join. A hero name hides your real one. A friends-only mic means strangers can't even hear you. Set them once - safe every game after.",
      bullets: [
        "Games have settings that guard you",
        "Friends-only = only people you KNOW join",
        "Your hero name hides your real one",
        "Friends-only mic = strangers can't hear you",
        "Set once with a grown-up - they guard every game",
      ],
      bulletIcons: ["⚙️", "👪", "🎭", "🤫", "🛡️"],
      emblem: "⚙️",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Want to hear a hero secret?",
          "Your game can guard you all by itself.",
          "[excited] Friends-only means only people you KNOW can join.",
          "A hero name keeps your real one hidden.",
          "And a friends-only mic? Strangers can't even hear you.",
          "[warmly] Set the settings once... and you're safe every game after. Let's flip them!",
        ],
      },
    },
    // 8 - Game: SCENE (settingsSwitch debut - the Lobby Lockdown)
    {
      type: "settingsSwitch",
      panelTitle: "Mega Blasters — Settings",
      introTitle: "The Lobby Lockdown",
      introSubtitle: "Three settings are wide open. Find the risky ones and flip them safe!",
      introIcon: "⚙️",
      rows: [
        { id: "who-joins", label: "Who can join my game", value: "Anyone in the world", safeValue: "Friends only", icon: "👪", isRisky: true, note: "Anyone-in-the-world means total strangers drop into YOUR lobby. Friends only!" },
        { id: "name-shown", label: "Name shown to players", value: "Alex Reed (real name)", safeValue: "PixelPanda42", icon: "🎭", isRisky: true, note: "Your real name on screen for every stranger? Hero name, always." },
        { id: "sounds", label: "Game music & sounds", value: "On", icon: "🔔", isRisky: false, note: "Music is just fun - it doesn't share anything about you. Already fine!" },
        { id: "mic", label: "Who can hear my mic", value: "Everyone in the lobby", safeValue: "Friends only", icon: "🤫", isRisky: true, note: "An open mic lets strangers listen to your home. Friends-only shuts that door." },
        { id: "controls", label: "Controller vibration", value: "On", icon: "🎮", isRisky: false, note: "Rumble away - vibration shares nothing. Already fine!" },
      ],
      hints: {
        tier1: "Ask: does this setting let STRANGERS see, hear or reach me? Flip those.",
        tier2: "The risky three: who can JOIN, what NAME they see, who HEARS your mic. Music and rumble are just fun.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here's the lobby settings panel!",
          "Some rows are already safe and green.",
          "[whispers] But three are wide open to strangers...",
          "[excited] Find the risky ones and FLIP them safe!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Red rows are leaking - tap one to flip it safe!"],
      },
    },
    // 9 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which setting keeps strangers OUT of your lobby?",
      choices: [
        { text: "Who can join: FRIENDS ONLY", isCorrect: true },
        { text: "Name shown: YOUR REAL NAME", isCorrect: false },
        { text: "Mic: EVERYONE CAN HEAR", isCorrect: false },
        { text: "Invites: ANYONE CAN SEND", isCorrect: false },
      ],
      praise: "That's the lock on your lobby door! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Friends-only joining, a hero name, and a friends-only mic - set once, safe every game.",
      next: "the sneakiest move in any lobby - 'let's chat somewhere else'",
      emblem: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Lobby: LOCKED. Beautiful work.",
          "Friends-only join, hero name, friends-only mic.",
          "[whispers] But some tricksters still get in...",
          "and they all try the same sneaky move. Listen closely.",
        ],
      },
    },

    /* ─────────── BEAT 3 · "CHAT SOMEWHERE ELSE" ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "The 'Somewhere Else' Trick",
      content:
        "Game chat has rules, moderators and report buttons - it's a guarded playground. So tricksters always try the same move: 'let's chat on a different app!' Why? Because OVER THERE, the guards can't see them. Remember your Week 3 training: moving the chat is a red flag, every time.",
      bullets: [
        "Game chat has guards: rules, mods, report buttons",
        "'Chat on another app' = leaving the guards behind",
        "That's exactly WHY tricksters ask",
        "Real gaming friends are happy right here",
        "Moving the chat = red flag, every time",
      ],
      bulletIcons: ["🛡️", "🚪", "🦝", "🎮", "🚫"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Game chat is a guarded playground.",
          "Rules. Moderators. Report buttons. Guards everywhere!",
          "[whispers] So tricksters always try the same move...",
          "'Hey, let's chat on a different app instead!'",
          "[nervous] Because over THERE... the guards can't see them.",
          "[excited] You know this one from Week 3. Moving the chat? Red flag!",
        ],
      },
    },
    // 12 - Game: DECIDE (chatSimulator re-dress - the lobby chat)
    {
      type: "chatSimulator",
      chatTitle: "GoldRush_Gary",
      scenario: "Mid-match, a skilled player you've never met starts chatting to you in the game lobby...",
      messages: [
        { sender: "stranger", text: "Yo! You're actually good at this. Squad up next round?" },
        { sender: "stranger", text: "We should talk tactics properly. What's your Discord? Game chat is so laggy lol" },
        { sender: "stranger", text: "Come onnn, everyone chats off-game. I can't send you the secret map trick HERE." },
        { sender: "narrator", text: "Why would a map trick need a different app? Your hero sense is tingling..." },
      ],
      choices: [
        {
          triggerAfterMessage: 0,
          options: [
            { text: "Sure - squad up in the game!", isSafe: true, feedback: "Playing together IN the game is what lobbies are for. Game on!" },
            { text: "Yes! Let me give you my number so we can plan", isSafe: false, feedback: "Whoa - your number is real-life info. Squad up in the game, share nothing." },
          ],
        },
        {
          triggerAfterMessage: 1,
          options: [
            { text: "No thanks - I only chat in the game", isSafe: true, feedback: "Perfect. The game chat has guards - and real gaming friends are happy right here." },
            { text: "OK, my Discord is PixelPanda#42", isSafe: false, feedback: "That's the 'somewhere else' trick working - off-game, the moderators can't protect you." },
          ],
        },
        {
          triggerAfterMessage: 3,
          options: [
            { text: "Nope. And I'm telling a grown-up you keep asking", isSafe: true, feedback: "HERO MOVE. A 'secret trick' that needs a secret app was never about the game." },
            { text: "Fine... just for the map trick", isSafe: false, feedback: "There is no map trick - getting you alone off-game WAS the trick. Stay where the guards are." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Time to practice, right inside a lobby chat.",
          "A player is about to get very friendly...",
          "[whispers] and then try to move you somewhere else.",
          "[excited] Watch the meter. Trust your training!",
        ],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "real friends ALWAYS move to a different app - game chat is for noobs!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Real gaming friends are happy where the guards are. ✓",
      nudge: "Who benefits when the chat leaves the guarded playground?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "'Let's chat on another app' means leaving the guards behind - red flag, every time.",
      next: "the two buttons every hero can find blindfolded",
      emblem: "🚫",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! The 'somewhere else' trick bounced right off you.",
          "Game chat has guards, and you stayed with them.",
          "[warmly] Speaking of guards...",
          "[excited] it's time you met the two mightiest buttons in any game!",
        ],
      },
    },

    /* ─────────── BEAT 4 · REPORT & BLOCK ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Report & Block: Your Power Buttons",
      content:
        "Every game has two hero buttons hiding in the player menu. REPORT tells the game's guards 'check this player!' - they can remove troublemakers for everyone. BLOCK makes that player vanish from YOUR game instantly - they can't message you, join you, or even see you. Report first, then block. Boom.",
      bullets: [
        "Every game has them - every single one",
        "REPORT = calls the game's guards",
        "BLOCK = that player vanishes from YOUR game",
        "Report first, then block",
        "Using them isn't mean - it's what they're FOR",
      ],
      bulletIcons: ["🎮", "🔔", "🚫", "🔢", "🛡️"],
      emblem: "🔔",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Meet the two mightiest buttons in any game!",
          "REPORT tells the game's guards: 'check this player!'",
          "BLOCK makes them vanish from YOUR game. Poof!",
          "No messages, no joining, they can't even see you.",
          "[warmly] Report first, then block.",
          "[excited] Using them isn't mean - it's exactly what they're for. Let's find them!",
        ],
      },
    },
    // 16 - Game: FIND (buttonHunt debut - the Button Hunt)
    {
      type: "buttonHunt",
      menuTitle: "Mega Blasters — Player Menu",
      scenario: "GoldRush_Gary won't stop with the creepy asks.",
      introTitle: "The Button Hunt",
      introSubtitle: "Somewhere in this menu live your two power buttons. Find REPORT first, then BLOCK!",
      introIcon: "🔔",
      buttons: [
        { id: "add-friend", label: "Add Friend", icon: "👪", note: "Add Friend invites them CLOSER - the opposite of what this moment needs!" },
        { id: "emotes", label: "Emotes", icon: "🎭", note: "Emotes are for celebrations - a dancing banana won't stop a creep." },
        { id: "report", label: "Report Player", icon: "🔔", targetOrder: 1, note: "The guards are on their way!" },
        { id: "shop", label: "Item Shop", icon: "🎁", note: "The shop sells hats, not help. Keep hunting!" },
        { id: "block", label: "Block Player", icon: "🚫", targetOrder: 2, note: "Poof - gone from your game!" },
        { id: "stats", label: "My Stats", icon: "🏆", note: "Nice stats! But they won't stop the messages. Keep hunting!" },
      ],
      hints: {
        tier1: "You're looking for the button that calls the game's GUARDS first.",
        tier2: "REPORT (the bell) first - it alerts the moderators. THEN block (the no-entry sign) to vanish them.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] There's the player menu - six buttons.",
          "Two of them are your power buttons.",
          "[whispers] Report first... it calls the guards.",
          "[excited] Then block. Find them both!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Which button calls the game's guards? Tap it first!"],
      },
    },
    // 17 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A player turns nasty. Tap the hero steps IN ORDER:",
      choices: [
        { text: "REPORT them", isCorrect: true },
        { text: "BLOCK them", isCorrect: true },
        { text: "Tell a grown-up", isCorrect: true },
      ],
      praise: "Report. Block. Tell. The lobby is safe again! ✓",
      nudge: "Which button calls the game's guards FIRST?",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Report calls the game's guards, block makes them vanish. Report, block, tell.",
      next: "the last trap - 'free' downloads that aren't",
      emblem: "🔔",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! You found both buttons in seconds.",
          "Report. Block. Tell.",
          "[laughs] GoldRush_Gary never knew what hit him.",
          "[whispers] One last trap guards the game zone... the 'free' download.",
        ],
      },
    },

    /* ─────────── BEAT 5 · FAKE MODS & FREE DOWNLOADS ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The 'Free Mod' Trap",
      content:
        "'FREE skins! Unlimited speed! Just download this mod!' Sounds amazing - but downloads from outside the real game can carry NASTY surprises: programs that steal accounts or break the computer. Real games sell their stuff INSIDE the game. Anything outside? Check with a grown-up first, every time.",
      bullets: [
        "'Free mods' can hide nasty surprises",
        "Some steal accounts or break computers",
        "Real games sell stuff INSIDE the game",
        "Never type your login outside the real game",
        "Downloads = check with a grown-up first",
      ],
      bulletIcons: ["🎁", "💀", "🎮", "🔐", "👪"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Free skins! Unlimited speed! Just download this mod!",
          "[warmly] Sounds amazing, right? Careful.",
          "[whispers] Downloads from OUTSIDE the real game can hide nasty surprises.",
          "Some steal accounts. Some break computers.",
          "Real games sell their stuff inside the game.",
          "[excited] Anything outside? Grown-up check first. Let's inspect some downloads!",
        ],
      },
    },
    // 20 - Game: INSPECT (requestInspector re-dress - the Download Checker)
    {
      type: "requestInspector",
      badgeLabel: "DOWNLOAD PAGE",
      introTitle: "The Download Checker",
      introSubtitle: "Inspect every clue, then decide: safe download... or a trap?",
      introIcon: "🔍",
      fairLabel: "Looks safe — ask first!",
      nosyLabel: "It's a trap — close it!",
      requests: [
        {
          id: "turbo-mod",
          appName: "MegaBlasters TURBO MOD",
          appIcon: "⚡",
          tagline: "UNLIMITED speed + FREE skins! Not available in the boring official game!",
          asksFor: ["Your game login", "Turn OFF the virus checker"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who made it?", note: "Not the real game company - some random site nobody can check.", isRedFlag: true },
            { id: "want", label: "What does it want?", note: "Your game LOGIN and the virus checker switched OFF. Both alarm bells.", isRedFlag: true },
            { id: "need", label: "Would the real game do this?", note: "Real games sell their stuff INSIDE the game - never through secret downloads.", isRedFlag: true },
            { id: "happens", label: "If you install it?", note: "Best case: nothing. Worst case: your account is stolen and the computer's sick.", isRedFlag: true },
          ],
          verdictNote: "A mod that wants your login AND the virus checker off is a burglar asking you to unlock the door. Trap!",
        },
        {
          id: "official-pack",
          appName: "Mega Blasters Season Pack",
          appIcon: "🎮",
          tagline: "New season content - from the in-game shop",
          asksFor: ["A grown-up to approve the purchase"],
          isNosy: false,
          zones: [
            { id: "who", label: "Who made it?", note: "The real game company, inside the real game's own shop.", isRedFlag: false },
            { id: "want", label: "What does it want?", note: "Just a grown-up's OK - it never asks for your login somewhere weird.", isRedFlag: false },
            { id: "need", label: "Would the real game do this?", note: "Yes - this IS the real game, selling its stuff the proper way.", isRedFlag: false },
            { id: "happens", label: "If you get it?", note: "The content appears in your game. No surprises, no tricks.", isRedFlag: false },
          ],
          verdictNote: "Inside the real game + a grown-up's OK = the safe way to get new stuff.",
        },
        {
          id: "skin-generator",
          appName: "FREE Skin Generator 3000",
          appIcon: "🎁",
          tagline: "Generate ANY skin for FREE! 100% works! No virus we promise!!",
          asksFor: ["Your username AND password", "Click 3 mystery links"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who made it?", note: "'No virus we promise!!' - real companies never have to promise that.", isRedFlag: true },
            { id: "want", label: "What does it want?", note: "Your USERNAME and PASSWORD. That's the whole trick right there.", isRedFlag: true },
            { id: "need", label: "Would the real game do this?", note: "Free-anything generators don't exist - skins cost the game company money.", isRedFlag: true },
            { id: "happens", label: "If you use it?", note: "You type your password... and the account isn't yours anymore.", isRedFlag: true },
          ],
          verdictNote: "Generators NEVER work - they exist to STEAL passwords. Close it and tell a grown-up.",
        },
      ],
      hints: {
        tier1: "Ask: is this from INSIDE the real game, or from a random site outside it?",
        tier2: "Login asks, virus-checker-off asks and 'no virus we promise' = trap. Inside the game + grown-up OK = safe.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Download pages incoming - inspect like a pro!",
          "Check who made it, what it wants,",
          "whether the REAL game would ever do this...",
          "[warmly] then make the call: safe... or trap?",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap every magnifying glass before you decide!"],
      },
    },
    // 21 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which download is SAFE?",
      choices: [
        { text: "Season pack from the in-game shop, grown-up approved", isCorrect: true },
        { text: "'FREE skins - just type your password!'", isCorrect: false },
        { text: "A mod that says 'turn off the virus checker'", isCorrect: false },
      ],
      praise: "Inside the game + grown-up OK = the safe way. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Real games sell stuff inside the game. Outside downloads need a grown-up check - and password asks are always traps.",
      next: "one final drill, then the Raccoon crashes your lobby",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "Chat guarded, lobby locked, 'somewhere else' refused,",
          "power buttons found, download traps closed.",
          "[whispers] Your game zone is a fortress now.",
          "[excited] Final drill - then he's coming to test it!",
        ],
      },
    },

    // 23 - Consolidation: The Game Zone Scanner (W1 scanner engine, W6 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SAFE PLAY",
        negative: "DANGER ZONE",
        positiveHint: "Tap SAFE PLAY for guarded, locked-down moves",
        negativeHint: "Tap DANGER ZONE for leaks, traps and sneaky moves",
        tipWhenPositive: "Game talk, friends-only settings, report & block, in-game shops - safe play, all of it.",
        tipWhenNegative: "Real-life info in chat, open lobbies, off-game chats and 'free' downloads - danger zone.",
        hint1: "Ask: does this keep the guards around me... or send my info (or me) outside the game?",
        hint2: "SAFE = game talk + locked settings + power buttons. DANGER = leaks, 'somewhere else', password downloads.",
        hint2Example: "SAFE: 'gg, rematch?'   DANGER: 'chat on Discord instead'",
        hint3: "Quick rule card: game talk only · friends-only everything · report then block · downloads = grown-up check.",
        hint3Example: "In-game shop ✅    'FREE skin generator' ❌",
      },
      items: [
        { text: "'gg! Same time tomorrow?' in game chat", isStrong: true, explanation: "Pure game talk - exactly what chat is for." },
        { text: "Telling the lobby your school and street", isStrong: false, explanation: "Real-life info in a room full of strangers - the biggest leak there is." },
        { text: "Who can join: FRIENDS ONLY", isStrong: true, explanation: "The lobby lock - strangers stay out automatically." },
        { text: "'Let's chat on Discord, game chat is lame'", isStrong: false, explanation: "The 'somewhere else' trick - leaving the guards behind." },
        { text: "Report, then block the nasty player", isStrong: true, explanation: "The power buttons doing exactly their job." },
        { text: "'FREE skins - just log in HERE!'", isStrong: false, explanation: "A password thief in a party hat. Close it, tell a grown-up." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill! Game-zone moments are drifting past.",
          "Tap SAFE PLAY for the guarded moves...",
          "and DANGER ZONE for leaks and traps.",
          "[warmly] Your fortress, your rules. Show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W6 GAUNTLET comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the intruder is reported & booted
    { type: "video", videoPlaceholder: "Week 6: Booted From the Lobby", videoSrc: "/videos/module-06-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "chat", label: "Chat Goalie", accent: "#7eff97", icon: "🎮", summary: "Game talk in, real-life info out - name, school, address, never." },
        { id: "lobby", label: "Lobby Lock", accent: "#00e5ff", icon: "⚙️", summary: "Friends-only join, hero name, friends-only mic. Set once, safe always." },
        { id: "move", label: "Stay With the Guards", accent: "#ff5fb3", icon: "🚫", summary: "'Chat somewhere else' means leaving the guards - red flag, refused." },
        { id: "buttons", label: "Power Buttons", accent: "#ffd158", icon: "🔔", summary: "Report calls the guards, block makes them vanish. Report, block, tell." },
        { id: "mods", label: "Trap Closer", accent: "#c084fc", icon: "🪤", summary: "Real games sell inside the game. Password-hungry downloads are traps." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You guard the chat, you lock the lobby,",
          "you stay with the guards, you wield the power buttons...",
          "[laughs] and no 'free skin' trap will EVER fool you.",
          "[excited] The intruder got booted from the lobby. Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "chat-goalie", name: "Chat Goalie", icon: "🎮", description: "Not one leak gets past." },
        { id: "lobby-locksmith", name: "Lobby Locksmith", icon: "⚙️", description: "Friends-only everything." },
        { id: "button-master", name: "Button Master", icon: "🔔", description: "Report. Block. Tell. Instantly." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Week-lane attack theatre: lobby tricks only (no money/V-Bucks - W7;
  // no fake-profile anatomy - W3).
  // W6 SHOWDOWN — THE LOBBY PHANTOM (design doc §W6: one ranked match
  // where he tries all the tricks). P1 deflectSort info-fishing chat ·
  // P2 counterCard sneak-out chat · P3 tapTell free-mod parcel ·
  // finisher = the REPORT slam.
  bossShowdown: {
    machine: {
      name: "THE LOBBY PHANTOM",
      tagline: "A ghost-player machine that pretends to be your friend",
      art: {
        intact: "/game/bosses/w06-lobbyphantom-intact.png",
        damaged: "/game/bosses/w06-lobbyphantom-damaged.png",
        defeated: "/game/bosses/w06-lobbyphantom-defeated.png",
      },
      arena: "/game/backgrounds/w06-arena-lobby.png",
      accent: "#7eff97",
      glow: "rgba(126,255,151,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w06/adam-esports-idle.png",
        attack: "/game/characters/w06/adam-esports-attack.png",
        celebrate: "/game/characters/w06/adam-esports-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w06/layla-esports-idle.png",
        attack: "/game/characters/w06/layla-esports-attack.png",
        celebrate: "/game/characters/w06/layla-esports-celebrate.png",
      },
    },
    phases: [
      // P1 · INFO FISHING → DEFLECT-SORT: chat scrolls past - shut down
      // the info-asks, wave the real game talk through.
      {
        kind: "deflectSort",
        attack: 0,
        coach: "Shut down the real-info asks. Wave game talk through!",
        actLabel: "SHUT IT DOWN!",
        actIcon: "🚫",
        passLabel: "GAME TALK - OK",
        items: [
          { id: "school", label: "'What time does your mom leave for work?'", icon: "🏠", act: true, note: "That sneakily asks when you are home alone. Real info, shut it down!" },
          { id: "gg", label: "'Pass me the health pack on the bridge!'", icon: "🎯", act: false, note: "Pure teamwork talk, exactly what chat is for. Let it pass." },
          { id: "alone", label: "'Send a quick selfie so I know you're real!'", icon: "🆔", act: true, note: "Your face is real-life info. A stranger never needs it, shut it down!" },
          { id: "rematch", label: "'That was an insane final shot!'", icon: "🎮", act: false, note: "A friendly cheer about the game. Let it pass." },
          { id: "name", label: "'Which bus do you catch after school?'", icon: "🏫", act: true, note: "Your bus and stop lead a stranger straight to you. Shut it down!" },
          { id: "tactic", label: "'Want to build the base together next round?'", icon: "⚡", act: false, note: "Planning the game together, totally safe. Let it pass." },
        ],
      },
      // P2 · SNEAK-OUT CHAT → COUNTER-CARD.
      {
        kind: "counterCard",
        attack: 1,
        coach: "Where do heroes chat? Tap the card!",
        situation: "'The mods keep muting me for NO reason. Let's just talk on another app where they can't touch me.'",
        situationIcon: "🚪",
        cards: [
          { id: "stay", label: "STAY WHERE THE GUARDS ARE", icon: "🛡️", isRight: true, note: "" },
          { id: "go", label: "Feel sorry for them and switch apps", icon: "💬", isRight: false, note: "The mods muted them for a reason. Somewhere with no guards is exactly where they want you. Don't go." },
          { id: "once", label: "Switch, but only this one time", icon: "🌀", isRight: false, note: "'Just this once' is how the trick always starts. Guards on means safe chat." },
        ],
      },
      // P3 · FREE-MOD TRAP → TAP-THE-TELL: the glowing parcel, 3 rounds.
      {
        kind: "tapTell",
        attack: 2,
        coach: "Find the trap sign, tap it!",
        rounds: [
          {
            id: "source",
            prompt: "A chat link glows: 'Get the SECRET character, download here!'",
            promptIcon: "🪤",
            options: [
              { id: "glow", label: "It shows a cool character picture", icon: "✨", isTell: false, note: "A picture is just bait. Check WHERE the download comes from." },
              { id: "store", label: "The link is a random site, not the real game", icon: "🔍", isTell: true, note: "" },
              { id: "mega", label: "Lots of players 'liked' the message", icon: "💬", isTell: false, note: "Likes can be faked. Check WHERE the download comes from." },
            ],
          },
          {
            id: "form",
            prompt: "The site pops up a little box to fill in first...",
            promptIcon: "⚙️",
            options: [
              { id: "password", label: "It wants your game LOGIN to 'verify you're real'", icon: "🔑", isTell: true, note: "" },
              { id: "color", label: "It asks which character you want", icon: "🎨", isTell: false, note: "Picking a character gives nothing away. Find what it's really fishing for." },
              { id: "hero", label: "It asks your favorite map", icon: "🎮", isTell: false, note: "A favorite map is harmless game talk. Find what it's really fishing for." },
            ],
          },
          {
            id: "promise",
            prompt: "Read the big promise on the button...",
            promptIcon: "🕵️",
            options: [
              { id: "install", label: "'Instant download!'", icon: "⚙️", isTell: false, note: "Loads of real files download instantly. Find the promise that is impossible." },
              { id: "fast", label: "'Works on all consoles!'", icon: "🚀", isTell: false, note: "Working on consoles is a normal claim. Find the promise that is impossible." },
              { id: "unlimited", label: "'Get every skin AND free coins, forever!'", icon: "👀", isTell: true, note: "" },
            ],
          },
        ],
      },
    ],
    weakPoints: [
      { question: "A player you just met already knows your username and your rank, and now asks for your school. Two of those are fine in a game, one is not. Which stays secret?", answers: ["Your username", "Your school, that is real-life info", "Your game rank", "All three are fine to share"], correctIndex: 1, explanation: "Usernames and ranks live inside the game. Your school lives in real life, so keep it out of chat." },
      { question: "A player who has already been reported twice keeps begging you to talk on a different app. Why does he want THAT app so badly?", answers: ["No mods or report button can reach him there", "It has better graphics", "It is faster to type on", "All his friends happen to be there"], correctIndex: 0, explanation: "Off the game there are no guards, which is exactly why a reported player wants you there. Stay where the guards are." },
      { question: "A mod site promises free skins, but first shows a box: 'Log in with your game account to prove you're not a robot.' What is really going on?", answers: ["It really is checking for robots", "It gives you the skins the moment you log in", "It is a login thief dressed up as a robot check", "This is just how all mods work"], correctIndex: 2, explanation: "Real games never make you log in on a random site. That 'prove you're not a robot' box is there to steal your account." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE REPORT BUTTON",
      chargeIcon: "🔔",
      chargeSecs: 5,
      milestones: ["Calling the guards…", "Signal's strong! Keep holding!", "GUARDS READY! LET GO!"],
      payoffTitle: "PHANTOM REPORTED!",
      payoffLine: "The guards handled it - that's their job. Game talk in, real info out, and the report button is always yours.",
    },
    villain: {
      arrival: "GG kid! Wanna know a SHORTCUT to pro? Step into my lobby!",
      phases: [
        "Just filling in your player card! Name? School? Front-door key?",
        "The guards are SO nosy. My place is cozier!",
        "Free mods! Unlimited everything! Slight raccoon flavor!",
      ],
      escape: "REPORTED?! I'm the VICTIM here!",
    },
    voiceSlug: "w06",
  },
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ff3cb4",
    theme: {
      topic: "Gaming Safety",
      motifs: ["🎮", "🛡️", "💬", "🚫", "⚙️", "🎯", "⭐", "🔒"],
    },
    intro: {
      slug: "quiz-w6-intro",
      text: "So YOU'RE the kid guarding this lobby? I crash game nights for a living! Beat my quiz or the lobby is MINE!",
    },
    victory: {
      slug: "quiz-w6-victory",
      text: "Reported, blocked, AND out-quizzed?! This lobby has way too many guards. I'm going back to raiding trash cans!",
    },
    questions: [
      {
        phaseId: "phase-w6-c1",
        key: "quiz-w6-c1-1",
        label: "Game Chat Is For Game Talk",
        ask: {
          slug: "quiz-w6-ask-c1-1",
          text: "Mid-match, a player Adam just met types: 'What school do you go to? I bet I know you!' What does Adam send back?",
        },
        options: [
          { text: "'Nice try! Game talk only', and he keeps playing" },
          { text: "Just the name of his town, not the school" },
          { text: "The school's name, since they might really be neighbors" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real-life info stays out!",
          explanation: "Your school, your town, your street, they all point to the real you, and a stranger can follow even one crumb. A lobby stranger gets game talk and nothing else. Tactics in, real-life info out.",
        },
        villainRight: {
          slug: "quiz-w6-right-c1-1",
          text: "OW! Game talk only?! I had my 'friendly neighbor' costume all zipped up!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c1-1",
          text: "A town, a school, ANY crumb! I follow crumbs for a LIVING!",
        },
      },
      {
        phaseId: "phase-w6-c2",
        key: "quiz-w6-c2-1",
        label: "Lock Your Lobby",
        ask: {
          slug: "quiz-w6-ask-c2-1",
          text: "Strangers keep dropping into Layla's lobby mid-game. Which fix locks the door for good?",
        },
        options: [
          { text: "Flip 'who can join' to friends only" },
          { text: "Pick a scarier hero name so strangers stay away" },
          { text: "Quit and start a fresh lobby every time one appears" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Let the settings guard you!",
          explanation: "A scary name and lobby-hopping can't stop the NEXT stranger from walking in. Flipping 'who can join' to friends only locks the door once, and it stays locked every game after.",
        },
        villainRight: {
          slug: "quiz-w6-right-c2-1",
          text: "Friends only?! I rattled the lobby door and it didn't even WIGGLE!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c2-1",
          text: "New lobby, same open door! I'll just stroll into the next one, and the next, and the NEXT!",
        },
      },
      {
        phaseId: "phase-w6-c3",
        key: "quiz-w6-c3-1",
        label: "The 'Somewhere Else' Trick",
        ask: {
          slug: "quiz-w6-ask-c3-1",
          text: "A player Layla met tonight says: 'This chat is so laggy, message me on SnapTalk instead!' What's the hero answer?",
        },
        options: [
          { text: "'No thanks, I chat where the guards are'" },
          { text: "'OK, but only to talk about the game'" },
          { text: "'OK, since laggy chat is hard to read'" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Stay with the guards!",
          explanation: "Game chat has rules, moderators and report buttons. 'Let's chat somewhere else' means leaving all of that behind, and that is exactly why tricksters ask. Red flag, every time.",
        },
        villainRight: {
          slug: "quiz-w6-right-c3-1",
          text: "Curses! Over THERE I had snacks, beanbags, and zero moderators!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c3-1",
          text: "Yesss, hop over to the app with no guards! I redecorated JUST for you!",
        },
      },
      {
        phaseId: "phase-w6-c4",
        key: "quiz-w6-c4-1",
        label: "Report & Block: Your Power Buttons",
        ask: {
          slug: "quiz-w6-ask-c4-1",
          text: "A player calls Adam nasty names every single round. Which button does Adam press FIRST?",
        },
        options: [
          { text: "REPORT, so the game's guards check the player" },
          { text: "BLOCK, so the player vanishes right away" },
          { text: "MUTE, so the nasty names go quiet" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Report first, then block!",
          explanation: "Mute and block only fix YOUR game. Report calls the game's guards so they can deal with the bully for everyone. Report first, then block, then tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w6-right-c4-1",
          text: "Not the BELL! Every guard in the building just looked straight at me!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c4-1",
          text: "Mute and block all you like, I'll still be out here bothering EVERYONE else!",
        },
      },
      {
        phaseId: "phase-w6-c5",
        key: "quiz-w6-c5-1",
        label: "The 'Free Mod' Trap",
        ask: {
          slug: "quiz-w6-ask-c5-1",
          text: "A website offers Adam a super-rare skin for FREE, it just needs his game login 'to deliver it'. What's really going on?",
        },
        options: [
          { text: "It's an account thief, close it and tell a trusted grown-up" },
          { text: "It's real, deliveries always need a login" },
          { text: "It's safe as long as he changes his password right after" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Your login is the loot!",
          explanation: "No real site needs your password to give you a gift, and 'changing it after' can be too late. The skin was the bait, the login was the whole plan. Close it and tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w6-right-c5-1",
          text: "You closed the tab?! That fake skin took me ALL night to sparkle!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c5-1",
          text: "Delivery incoming! One rare skin... aaand one raccoon moving into your account! Roomies!",
        },
      },
      {
        phaseId: "phase-w6-c1",
        key: "quiz-w6-c1-2",
        label: "Game Chat Is For Game Talk",
        ask: {
          slug: "quiz-w6-ask-c1-2",
          text: "Adam's squad is planning tomorrow's rematch. Which message is safe to hit SEND on?",
        },
        options: [
          { text: "'Meet at the castle map, same time as today!'" },
          { text: "'Meet me at Elm Park after school instead!'" },
          { text: "'I get home alone at 4, message me then!'" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Plans stay inside the game!",
          explanation: "Park meetups and home-alone times tell strangers where you are in real life. Game plans happen in game places. Castle map yes, Elm Park no.",
        },
        villainRight: {
          slug: "quiz-w6-right-c1-2",
          text: "The CASTLE map?! I waited at Elm Park for HOURS with a picnic!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c1-2",
          text: "A park! A home-alone time! I'll bring my net and my little sandwich cooler!",
        },
      },
      {
        phaseId: "phase-w6-c2",
        key: "quiz-w6-c2-2",
        label: "Lock Your Lobby",
        ask: {
          slug: "quiz-w6-ask-c2-2",
          text: "Through Adam's open mic, a lobby stranger hears his little sister and asks: 'Is that your sister?' What's the hero fix?",
        },
        options: [
          { text: "Set the mic to friends-only so strangers can't listen in" },
          { text: "Whisper for the rest of the match" },
          { text: "Tell the stranger it was just the TV" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Close the mic door!",
          explanation: "Whispers and cover stories still leave the mic wide open for next time. A friends-only mic means strangers can't hear your home at all, tonight and every night after.",
        },
        villainRight: {
          slug: "quiz-w6-right-c2-2",
          text: "The mic slammed shut?! I had my listening cup pressed RIGHT against it!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c2-2",
          text: "Keep whispering, I have EXCELLENT ears! Big, fluffy, excellent ears!",
        },
      },
      {
        phaseId: "phase-w6-c3",
        key: "quiz-w6-c3-2",
        label: "The 'Somewhere Else' Trick",
        ask: {
          slug: "quiz-w6-ask-c3-2",
          text: "A player who keeps getting muted by the mods begs Layla: 'Talk to me on another app, the mods are SO unfair!' What is he really after?",
        },
        options: [
          { text: "A place with no guards, where nobody can stop him" },
          { text: "A faster app, so his messages stop lagging" },
          { text: "A fresh start, since the mods keep misjudging him" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Muted for a reason!",
          explanation: "The mods muted him because he broke the rules. A player who wants you where the guards can't see is telling you exactly what he plans to do there. Stay in the guarded chat.",
        },
        villainRight: {
          slug: "quiz-w6-right-c3-2",
          text: "How did you know about my no-guards clubhouse?! I just put in a slide!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c3-2",
          text: "Poor misunderstood ME! Now follow me somewhere nice and dark and rule-free!",
        },
      },
      {
        phaseId: "phase-w6-c4",
        key: "quiz-w6-c4-2",
        label: "Report & Block: Your Power Buttons",
        ask: {
          slug: "quiz-w6-ask-c4-2",
          text: "Adam blocks GrumbleGoblin after reporting him. What happens in Adam's game now?",
        },
        options: [
          { text: "GrumbleGoblin vanishes for Adam, no messages, no joining" },
          { text: "GrumbleGoblin is kicked out of the whole game for everyone" },
          { text: "GrumbleGoblin gets one last warning, then stays" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Block clears YOUR game!",
          explanation: "Removing a player for everyone is the guards' job after a report. Block is your personal magic trick: that player can't message you, join you, or even see you. Poof.",
        },
        villainRight: {
          slug: "quiz-w6-right-c4-2",
          text: "POOF?! Where did the lobby go?! Hello?? It's dark in here!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c4-2",
          text: "A warning? For ME? I collect warnings! I keep them in a scrapbook!",
        },
      },
      {
        phaseId: "phase-w6-c5",
        key: "quiz-w6-c5-2",
        label: "The 'Free Mod' Trap",
        ask: {
          slug: "quiz-w6-ask-c5-2",
          text: "A mod's install page tells Layla: 'Turn OFF your virus checker first, it blocks our mod by mistake.' What does she do?",
        },
        options: [
          { text: "Close the page, that ask is the trap sign itself" },
          { text: "Turn it off for one minute, then straight back on" },
          { text: "Install anyway, the checker can clean up afterward" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Never unplug the alarm!",
          explanation: "A download that needs your protection switched off is a burglar asking you to unplug the alarm first. One minute is plenty for a nasty program. Close it and tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w6-right-c5-2",
          text: "The checker stayed ON?! My mod is terribly allergic to those things!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c5-2",
          text: "One tiny minute is all my sneaky software needs! In and out, like a raccoon through a cat flap!",
        },
      },
      {
        phaseId: "phase-w6-c1",
        key: "quiz-w6-c1-3",
        label: "Game Chat Is For Game Talk",
        ask: {
          slug: "quiz-w6-ask-c1-3",
          text: "A teammate Layla has played with for weeks says: 'We're basically best friends now, what's your real name?' What does she do?",
        },
        options: [
          { text: "Keep using hero names, even with game friends" },
          { text: "Tell just her first name, first names are everywhere" },
          { text: "Trade names, and he has to go first so it's fair" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Hero names for everyone!",
          explanation: "Weeks of matches still means you've never actually met. First names and trades are how real-life info leaks out one crumb at a time. In the lobby, everyone gets your hero name.",
        },
        villainRight: {
          slug: "quiz-w6-right-c1-3",
          text: "WEEKS of buttering you up and I don't even get a FIRST name?! My acting was FLAWLESS!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c1-3",
          text: "A real name! Now I just need a school, a street, and a spare key!",
        },
      },
      {
        phaseId: "phase-w6-c2",
        key: "quiz-w6-c2-3",
        label: "Lock Your Lobby",
        ask: {
          slug: "quiz-w6-ask-c2-3",
          text: "Layla is picking the name other players will see. Which one keeps the real her hidden?",
        },
        options: [
          { text: "CometCrafter77" },
          { text: "LaylaFromMapleHill" },
          { text: "Layla_2017" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Your name is a clue!",
          explanation: "A hero name should say NOTHING true about you. Real names, school names and birth years hand strangers the exact clues they hunt for. Comets and crafters tell them zip.",
        },
        villainRight: {
          slug: "quiz-w6-right-c2-3",
          text: "CometCrafter?! I searched every class list for a Comet and found NOTHING!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c2-3",
          text: "A name, a school, a birth year, it's like a menu! And I am STARVING!",
        },
      },
      {
        phaseId: "phase-w6-c3",
        key: "quiz-w6-c3-3",
        label: "The 'Somewhere Else' Trick",
        ask: {
          slug: "quiz-w6-ask-c3-3",
          text: "A gaming friend of two months says: 'Let's swap phone numbers, texting beats game chat!' What's the hero move?",
        },
        options: [
          { text: "Keep chatting in the game, that's where the guards are" },
          { text: "Swap numbers, two months makes him a real friend" },
          { text: "Swap, but make him promise to text only about the game" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real gaming friends stay put!",
          explanation: "A phone number is real-life info, and texting has no mods and no report button. A real gaming friend is happy right where the guards are. Two months changes nothing.",
        },
        villainRight: {
          slug: "quiz-w6-right-c3-3",
          text: "But texting is where I do my BEST creeping! Er, I mean chatting! CHATTING!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c3-3",
          text: "A phone number! Now I can pester you at breakfast, lunch AND dinner!",
        },
      },
      {
        phaseId: "phase-w6-c4",
        key: "quiz-w6-c4-3",
        label: "Report & Block: Your Power Buttons",
        ask: {
          slug: "quiz-w6-ask-c4-3",
          text: "Layla wants to report a player who keeps being creepy, but her friend says reporting is snitching. What's true?",
        },
        options: [
          { text: "Reporting is exactly what the button is for, press it" },
          { text: "Report only after giving three fair warnings" },
          { text: "Just block him quietly, blocking is kinder" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Reporting protects everyone!",
          explanation: "The report button exists so the guards can stop creeps, and pressing it is brave, not snitching. Warnings and quiet blocks leave him free to bother other kids. Report, block, tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w6-right-c4-3",
          text: "Stop pressing that bell! Every time it rings, a guard gets my address!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c4-3",
          text: "Yes! No bells, no reports, just lovely quiet lobbies full of ME!",
        },
      },
      {
        phaseId: "phase-w6-c5",
        key: "quiz-w6-c5-3",
        label: "The 'Free Mod' Trap",
        ask: {
          slug: "quiz-w6-ask-c5-3",
          text: "Layla wants a new character pack for her game. Which way is the safe way to get it?",
        },
        options: [
          { text: "The game's own shop, with a grown-up's OK" },
          { text: "A fan site giving the same pack away free" },
          { text: "A player in chat offering it as a gift for her login" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real stuff lives in the real shop!",
          explanation: "Fan sites and chat 'gifts' are how stolen accounts start. Real games sell their packs inside the game, and a grown-up's OK makes it safe. Outside downloads always get a grown-up check.",
        },
        villainRight: {
          slug: "quiz-w6-right-c5-3",
          text: "The REAL shop?! But my fake one has balloons! And a suspicious smell!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c5-3",
          text: "Step right up to Raccoon's Bargain Corner! All packs free! All logins MINE!",
        },
      },
    ],
  },
  badgeArt: "/cyberheroes/badges/week-06-lobby-guardian.png",

  bossAttacks: [
    { name: "INFO FISHING",   icon: "🎮", color: "#7eff97", glow: "rgba(126, 255, 151, 0.55)", tag: "Game talk only",             emblemColor: 0x7eff97 },
    { name: "SNEAK-OUT CHAT", icon: "🚪", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Stay with the guards",      emblemColor: 0xff5fb3 },
    { name: "FREE-MOD TRAP",  icon: "🪤", color: "#ffb347", glow: "rgba(255, 179, 71, 0.55)",  tag: "Downloads = grown-up check", emblemColor: 0xffb347 },
  ],

  // Placeholder quiz boss (the bespoke W6 GAUNTLET - one match where he
  // tries all 5 tricks - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What belongs in game chat?", answers: ["Game talk - tactics and rematches", "Your school's name", "Your address", "When you're home alone"], correctIndex: 0, explanation: "Game talk in, real-life info out. Always." },
      { question: "Which setting keeps strangers out of your lobby?", answers: ["Who can join: friends only", "Name shown: hero name", "Vibration: off", "Brightness: high"], correctIndex: 0, explanation: "Friends-only joining is the lock on your lobby door." },
      { question: "A player says 'let's chat on a different app'. That's...", answers: ["A red flag - stay where the guards are", "A friendly offer", "Totally normal", "OK if you've played lots of games together"], correctIndex: 0, explanation: "Off-game, the moderators can't protect you - that's exactly why they ask." },
    ],
    medium: [
      { question: "A player is being nasty. What order do you act in?", answers: ["Report, then block, then tell a grown-up", "Block first, then report", "Shout, quit, cry", "Add friend, then report"], correctIndex: 0, explanation: "Report calls the guards first, block vanishes them, telling finishes the job." },
      { question: "What does BLOCK do?", answers: ["That player vanishes from your game", "Deletes your account", "Kicks them out of the game for everyone", "Reports a bug"], correctIndex: 0, explanation: "No messages, no joining, they can't even see you. Poof." },
      { question: "A mod says 'turn OFF your virus checker to install'. You...", answers: ["Close it - that's a trap sign", "Turn it off quickly", "Turn it off just this once", "Only turn it half off"], correctIndex: 0, explanation: "Asking to disable protection is a burglar asking you to unlock the door." },
    ],
    hard: [
      { question: "Why do tricksters want to leave game chat?", answers: ["Rules, mods and report buttons can't follow them", "Game chat is too slow", "They prefer typing", "So they can send you secret map tricks"], correctIndex: 0, explanation: "Off-game there are no guards - that's the whole point of the move." },
      { question: "'FREE skin generator - enter your password!' What happens if you do?", answers: ["The account isn't yours anymore", "You get free skins", "Nothing at all", "You get the skins, but with lots of ads"], correctIndex: 0, explanation: "Generators never work - they exist to steal passwords." },
      { question: "Where do real games sell their content?", answers: ["Inside the game's own shop", "On random download sites", "In chat messages", "On their fan forums"], correctIndex: 0, explanation: "Inside the game + a grown-up's OK = the only safe way." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 6 - defend your game zone!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "An intruder in the lobby..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Game talk in. Real-life info out." }, layla: null }, // learn: chat
    4: { adam: { mood: "excited", message: "You're in goal - punch those leaks!" }, layla: null }, // game: spamBlaster
    5: { adam: null, layla: { mood: "excited", message: "Quick - spot the leak!" } }, // prove: speed
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Let the settings do the guarding." } }, // learn: lobby
    8: { adam: { mood: "excited", message: "Flip the risky ones!" }, layla: null }, // game: settingsSwitch
    9: { adam: null, layla: { mood: "thumbsup", message: "Which setting locks the door?" } }, // prove: recall
    10: { adam: { mood: "thumbsup", message: "Lobby: LOCKED." }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Why leave the guarded playground?" }, layla: null }, // learn: move
    12: { adam: { mood: "curious", message: "Watch the meter climb..." }, layla: null }, // game: chatSimulator
    13: { adam: null, layla: { mood: "worried", message: "He's fibbing - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Stay with the guards. Always." } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Two buttons. Endless power." } }, // learn: buttons
    16: { adam: { mood: "excited", message: "Find Report first!" }, layla: null }, // game: buttonHunt
    17: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    18: { adam: { mood: "thumbsup", message: "Report. Block. Tell. Mastered." }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "'Free' downloads always cost something." }, layla: null }, // learn: mods
    20: { adam: { mood: "curious", message: "Inspect every clue, detective." }, layla: null }, // game: requestInspector
    21: { adam: null, layla: { mood: "thumbsup", message: "Which download is safe?" } }, // prove: recall
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Safe play or danger zone - scan fast!" } }, // consolidation
    24: { adam: { mood: "worried", message: "He's in YOUR lobby - boot him!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch him get booted!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Lobby Guardian badge earned!" }, layla: null }, // completion
  },
};

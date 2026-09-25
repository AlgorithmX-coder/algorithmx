import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 6 - Gaming Safety: Defend Your Game Zone. REBUILT to the Learn-Loop
 * Build Standard v0.10 (2026-09-16, the seventh rebuilt week). World: the
 * Neon Arcade (grid floor, glyph motes, arcade-cabinet cards, the cast in
 * esports kit). An APPLICATION week: Week 2's private-info rule and Week 3's
 * stranger rule go to work inside a game lobby; the lobby setting, the two
 * power buttons and the download trap are its own three lessons.
 *
 *   0 video · 1 alert · 2 ATLAS briefing · 3 mission
 *   5 x (Learn -> Game -> Prove -> Recap):
 *     1 CHAT     game chat is for game talk (W2)   | chatFixer   The Chat Fixer (SWAP)        | speed
 *     2 LOBBY    lock your lobby, friends only      | lobbyDoors  Lobby Doors (GATEKEEP)       | recall
 *     3 MOVE     "chat somewhere else" flag (W3)    | guardCount  Guard Count (CHECKLIST)      | lie
 *     4 BUTTONS  report and block                   | powerPanel  The Power Panel (FIND/ORDER) | order
 *     5 MODS     fake mods and free downloads       | requestInspector The Download Dock       | finish
 *   24 review: signBingo "Game Zone Bingo" · 25 quiz boss (5 questions, pass 4)
 *   26 video · 27 debrief · 28 stickers · 29 completion. 30 screens; the old
 *   screen-4 signature (Lobby Keeper) is remade tap-only as concept 2's game.
 *
 * Engine reuse (audit-engine-reuse): chatFixer, lobbyDoors, guardCount and
 * powerPanel are NEW (built for this week; guardCount and powerPanel carry a
 * second skin for W9 / W10). requestInspector (W2) and signBingo (W1) are
 * re-themes under the amended reuse rule: different skill, non-neighbouring
 * weeks, both under the cap of three.
 *
 * Content fixes carried in: no real brand names (the "other app" is SnapTalk),
 * pretend contact details only, and the download trap copy names no real
 * shop. Sarah reads the alert caption word for word; every item has a
 * readAloud; verdicts are one take with the reason; a teach on every Prove-it;
 * a spoken payoff on every complete beat. Dialogue audited to 0 flags on both
 * layers with `node scripts/audit-narration-flow.mjs --week=6`.
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

    // 1 - ALERT: incident report (Sarah reads the caption word for word, then reacts)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-06.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon slipped into a game lobby with a friendly username, fished for real names and schools - then asked kids to 'chat somewhere else'. Your game zone needs DEFENDING!",
      photoCaption: "Wk 6 - The Lobby Intruder",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, grab your controller and read this incident report with me.",
          "The Raccoon slipped into a game lobby with a friendly username, fished for real names and schools - then asked kids to 'chat somewhere else'. Your game zone needs DEFENDING!",
          "[whispers] A friendly username. That is all it took to get in.",
          "[warmly] By the end of today, your lobby will have guards on every door.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[6] },

    // 3 - Mission brief (learn this, so you're protected from that)
    {
      type: "mission",
      objectives: [
        "Keep real-life info out of game chat",
        "Find the lobby setting and the two power buttons",
        "Spot the somewhere-else trick and the free-download trap",
      ],
    },

    /* ─────────── BEAT 1 · GAME CHAT IS FOR GAME TALK ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Game Chat Is For Game Talk",
      content:
        "Game chat is brilliant for game talk: tactics, rematches, 'nice shot!'. But your REAL-LIFE info, your name, your age, your school, where you live, never goes in there. A lobby is full of people you have never met. Game talk in, real-life info OUT.",
      bullets: [
        "Game talk? Chat away!",
        "Your real name stays out",
        "Your age and school stay out",
        "Where you live stays out",
        "A lobby is full of strangers, even friendly ones",
      ],
      bulletIcons: ["🎮", "🏷️", "🏫", "🏠", "👀"],
      emblem: "🎮",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero. Grab your controller!",
          "Game chat is brilliant for game talk. Tactics, rematches, nice shot!",
          "[whispers] But your real-life info never goes in there.",
          "Your name. Your age. Your school. Where you live.",
          "A lobby is full of people you have never met, even the friendly ones.",
          "[excited] Game talk in, real-life info out. Come and catch the leaks before you hit SEND!",
        ],
      },
    },
    // 5 - Game: SWAP "The Chat Fixer" (chatFixer, new engine)
    {
      type: "chatFixer",
      threat: {
        raccoonLine:
          "I don't even ask for secrets. Kids just type them! A school here, a street there, one 'I'm home alone'. I read the chat and draw my map.",
      },
      introTitle: "The Chat Fixer",
      introSubtitle: "A message is about to fly. Tap the word that gives something away, pick a safer swap, then SEND.",
      introIcon: "🎮",
      chatTitle: "Mega Blasters chat",
      sendLabel: "SEND",
      tileHint: "Tap the word that leaks, or SEND if it is all game talk",
      cleanToast: "CLEAN! SENT.",
      fixedToast: "FIXED! SENT.",
      wrongTitle: "Hold on, that leaks",
      completeTitle: "Every message sent safely!",
      completeLine: "Game talk flew. Real-life info stayed home.",
      messages: [
        {
          id: "rematch",
          tiles: ["gg!", "rematch", "tomorrow?"],
          readAloud: "Your message says: gg! Rematch tomorrow? Is there anything in there that gives you away?",
          why: "Nothing in that message gives you away. Pure game talk, so it flies as it is.",
          whyWrong: "That message was already clean. Game talk can fly exactly as it is.",
        },
        {
          id: "school",
          tiles: ["I'm at", "Maple Hill School,", "who's", "playing?"],
          leakIndex: 1,
          readAloud: "Your message says: I'm at Maple Hill School, who's playing? Which word gives you away?",
          chips: [
            { text: "my house,", isSafe: false, whyWrong: "My house still gives you away: it is where you live. Swap the school for something about the game." },
            { text: "on my team,", isSafe: true, whyWrong: "" },
            { text: "Maple Hill,", isSafe: false, whyWrong: "That is still the school's name, just shorter. A stranger can look it up." },
          ],
          why: "Your school says where you are every weekday. On my team keeps it about the game, and the message still works.",
          whyWrong: "Your school is where you are. A stranger with your school can find you, so that word cannot fly.",
        },
        {
          id: "home-alone",
          tiles: ["I'm", "home alone", "till 6,", "voice chat?"],
          leakIndex: 1,
          readAloud: "Your message says: I'm home alone till 6, voice chat? Which word gives you away?",
          chips: [
            { text: "free", isSafe: true, whyWrong: "" },
            { text: "by myself", isSafe: false, whyWrong: "By myself means the same as home alone. Nobody online ever needs to know that." },
            { text: "at 42 Rainbow Road", isSafe: false, whyWrong: "Now you have added your address. That is an even bigger leak." },
          ],
          why: "When you are home alone is the one thing a stranger must never know. I'm free till 6 says the same about the game and nothing about you.",
          whyWrong: "Home alone tells a stranger there is no grown-up with you. That never goes in chat, not ever.",
        },
        {
          id: "bridge",
          tiles: ["take", "the left", "bridge!"],
          readAloud: "Your message says: take the left bridge! Anything in there that gives you away?",
          why: "The left bridge is a tactic. Nothing in there gives you away, so it flies.",
          whyWrong: "That was pure game talk. Swapping it changes nothing, so send it as it is.",
        },
        {
          id: "birthday",
          tiles: ["it's my", "birthday", "on June 12th!"],
          leakIndex: 2,
          readAloud: "Your message says: it's my birthday on June 12th! Which words give you away?",
          chips: [
            { text: "this week!", isSafe: true, whyWrong: "" },
            { text: "on the 12th!", isSafe: false, whyWrong: "The day is still your birthday. Keep the date to yourself." },
            { text: "on June 12th, I'm 9!", isSafe: false, whyWrong: "Now the date AND your age are in the chat. Two clues instead of one." },
          ],
          why: "Your birthday is a real-life clue, and with your age it is two. This week keeps the happy news and drops the date.",
          whyWrong: "The date of your birthday is real-life info. Strangers use it to guess passwords and pretend to know you.",
        },
        {
          id: "number",
          tiles: ["message me", "on", "555-0123", "to plan"],
          leakIndex: 2,
          readAloud: "Your message says: message me on 555-0123 to plan. Which word gives you away?",
          chips: [
            { text: "my mom's phone", isSafe: false, whyWrong: "A phone number is a phone number, even a grown-up's. Plan it here in the game." },
            { text: "555-0123 after 6", isSafe: false, whyWrong: "That is the same number with a time added. Even more to give away." },
            { text: "here in game chat", isSafe: true, whyWrong: "" },
          ],
          why: "A phone number reaches you outside the game. Planning here in game chat keeps the plan and keeps the guards.",
          whyWrong: "A phone number lets a stranger reach you anywhere. It never goes in chat.",
        },
      ],
      hints: {
        tier1: "Ask: does this word say WHO I am or WHERE I am? That is the one to swap.",
        tier2: "Name, school, address, home-alone times, birthdays and phone numbers leak. Tactics and rematches are fine.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, you fix chat messages before they fly!",
          "This game is all about keeping real-life info out of game chat.",
          "Out in the real world, a leak is usually one little word in a friendly message.",
          "Here is what you do. Your message appears as word tiles. Read it. If a word gives away who you are or where you are, tap it, then tap the safer swap. If it is all game talk, just tap SEND.",
          "[warmly] Send every message clean, and the lobby learns nothing about you. Ready? First message!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here is your first message. Tap the word that leaks, or SEND if it is all game talk."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every message sent safely, Cyber Hero! You caught every leak.",
          "[warmly] Out in the real world, read your message once before you send it. Game talk flies, real-life info stays home.",
        ],
      },
    },
    // 6 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one LEAKS?",
      speedMs: 5000,
      choices: [
        { text: "'I'm home alone till 6!'", isCorrect: true },
        { text: "'gg! rematch tomorrow?'", isCorrect: false, why: "That is game talk. Nothing about who you are or where you are." },
        { text: "'take the left bridge!'", isCorrect: false, why: "A tactic. It says nothing about you, so it is safe to send." },
      ],
      praise: "Saved! Home-alone times NEVER go in chat. ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Home alone tells a stranger there is no grown-up with you.",
          "Rematches and tactics are game talk, and game talk is safe.",
          "[warmly] One quick read before you send, every time.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Game talk goes in chat. Real-life info, your name, school, address and home-alone times, stays out.",
      next: "the setting that makes your lobby guard itself",
      emblem: "🎮",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] What a fixer, Cyber Hero. Not one leak got past you.",
          "Game talk flew, real-life info stayed home.",
          "[whispers] But checking every message is hard work. What if the lobby could guard itself?",
          "Next, we'll learn the setting that does exactly that. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · LOCK YOUR LOBBY ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Lock Your Lobby",
      content:
        "Here is a hero secret: your game has SETTINGS that guard you all by themselves. Friends only means only people you actually know can join. A hero name hides your real one. A friends-only mic means strangers cannot even hear you. Set them once with a grown-up, and you are safe every game after.",
      bullets: [
        "Games have settings that guard you",
        "Friends only = only people you KNOW can join",
        "Your hero name hides your real one",
        "Friends-only mic = strangers cannot hear you",
        "Set once with a grown-up, guarded every game",
      ],
      bulletIcons: ["⚙️", "👪", "🎭", "🤫", "🛡️"],
      emblem: "⚙️",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Here is the setting that guards your lobby all by itself.",
          "[excited] Friends only. It means only people you KNOW can join.",
          "A hero name keeps your real one hidden.",
          "And a friends-only mic? Strangers cannot even hear you.",
          "[warmly] Set them once with a grown-up, and you are safe every game after.",
          "[excited] Come and guard the door with me!",
        ],
      },
    },
    // 9 - Game: GATEKEEP "Lobby Doors" (lobbyDoors, the old Lobby Keeper remade tap-only)
    {
      type: "lobbyDoors",
      threat: {
        raccoonLine:
          "Open lobby, open door! I just pick a friendly name, walk in, and start fishing. Nobody checks for a badge!",
      },
      introTitle: "Lobby Doors",
      introSubtitle: "Players wait at your lobby doors. Let in the team badges, deny the rest. Then flip the setting and watch.",
      introIcon: "⚙️",
      letInLabel: "LET IN",
      denyLabel: "DENY",
      badgeLabel: "TEAM BADGE",
      toggleLabel: "Friends only",
      letInToast: "WELCOME!",
      denyToast: "DENIED!",
      wrongTitle: "Check the badge",
      completeTitle: "Lobby locked!",
      completeLine: "Friends in, strangers out, and the setting guards the door for you.",
      waves: [
        {
          id: "open",
          friendsOnly: false,
          players: [
            { id: "panda", name: "PixelPanda42", hasBadge: true, readAloud: "PixelPanda42 is at the door, wearing the team badge. That is someone you know.", why: "The team badge means a friend you actually know. Let them in and play.", whyWrong: "Look at the badge. PixelPanda42 wears the team badge, so this is a friend you know." },
            { id: "gary", name: "GoldRush_Gary", hasBadge: false, readAloud: "GoldRush Gary is at the door. Friendly name, no team badge.", why: "A friendly name is not a badge. No badge means a stranger, however nice the name sounds.", whyWrong: "Look for the badge, not the name. GoldRush Gary has no badge, so he is a stranger." },
            { id: "falcon", name: "TurboFalcon", hasBadge: true, readAloud: "TurboFalcon is at the door with the team badge on.", why: "Badge on, friend in. That is what the doors are for.", whyWrong: "Look again: the team badge is on. TurboFalcon is a friend, and friends with the badge come in." },
            { id: "newguy", name: "xX_NewGuy_Xx", hasBadge: false, readAloud: "xX NewGuy Xx is at the door. No badge, and nobody on the team knows the name.", why: "Nobody knows the name and there is no badge. Strangers stay outside the lobby.", whyWrong: "No badge and nobody knows the name. That is a stranger, and strangers stay out." },
          ],
        },
        {
          id: "locked",
          friendsOnly: true,
          players: [
            { id: "star", name: "StarGazer", hasBadge: true, readAloud: "With friends only on, StarGazer arrives, badge and all.", why: "Friends only did the checking for you. Only badges reach the door now.", whyWrong: "StarGazer wears the team badge, and friends only let only badges this far. Let them in." },
            { id: "hawk", name: "NightHawk", hasBadge: true, readAloud: "NightHawk is here too, team badge shining.", why: "Another badge, another friend. The setting keeps the strangers away before they even knock.", whyWrong: "NightHawk has the team badge. With friends only on, everyone at the door is a friend." },
          ],
        },
      ],
      toggleCard: {
        title: "Lobby settings",
        text: "Who can join my game: Anyone in the world. Tap to change it.",
        buttonLabel: "FRIENDS ONLY: ON",
        readAloud: "Checking every player one by one is hard work. Here is the setting: who can join my game. Right now it says anyone in the world. Tap the button to switch it to friends only.",
        why: "Friends only. Now the lobby checks the badges for you, before anyone even reaches the door.",
      },
      hints: {
        tier1: "Look at the badge, not the name. Team badge in, no badge out.",
        tier2: "A friendly name means nothing. Only the TEAM BADGE means a friend you know.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your second challenge, you stand at the Lobby Doors!",
          "This game is all about letting friends in and keeping strangers out.",
          "Out in the real world, a lobby door with no lock lets anyone walk in with a friendly name.",
          "Here is what you do. A player comes to the door. I will tell you who it is. If they wear the team badge, tap LET IN. No badge? Tap DENY. After the first few players, a settings card appears. Tap it to switch the lobby to friends only, and watch what changes.",
          "[warmly] Guard the door, then let the setting guard it for you. Ready? First player!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Someone is at the door. Badge? LET IN. No badge? DENY."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Lobby locked, Cyber Hero! Friends in, strangers out.",
          "[warmly] Out in the real world, ask a grown-up to flip friends only with you once. After that, the lobby does the checking for you, every game.",
        ],
      },
    },
    // 10 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which setting keeps strangers OUT of your lobby?",
      choices: [
        { text: "Who can join: FRIENDS ONLY", isCorrect: true },
        { text: "Name shown: YOUR REAL NAME", isCorrect: false, why: "Your real name on screen shows strangers who you are. That is the opposite of a guard." },
        { text: "Mic: EVERYONE CAN HEAR", isCorrect: false, why: "An open mic lets strangers listen in. Friends only is the safe mic too." },
        { text: "Invites: ANYONE CAN SEND", isCorrect: false, why: "Anyone can send means any stranger can knock. Friends only is the lock." },
      ],
      praise: "That's the lock on your lobby door! ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Friends only is the lock on the lobby door.",
          "Only people you actually know can even reach it.",
          "[warmly] Set it once with a grown-up, and it guards every game after.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Friends only joining, a hero name and a friends-only mic. Set once, safe every game.",
      next: "the sneakiest move in any lobby: 'let's chat somewhere else'",
      emblem: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Lobby locked, Cyber Hero. Friends only, hero name, friends-only mic.",
          "The doors check the badges for you now.",
          "[whispers] But every so often a trickster still slips in, and they all try one sneaky move.",
          "Next, we'll learn what 'let's chat somewhere else' really means. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE 'SOMEWHERE ELSE' TRICK ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "The 'Somewhere Else' Trick",
      content:
        "Game chat has rules, moderators and report buttons. It is a guarded playground. So tricksters always try the same move: 'let's chat on a different app!' Why? Because OVER THERE, the guards cannot see them. You know this from Week 3: moving the chat is a red flag, every time.",
      bullets: [
        "Game chat has guards: rules, mods, report buttons",
        "'Chat on another app' = leaving the guards behind",
        "That is exactly WHY tricksters ask",
        "Real gaming friends are happy right here",
        "Moving the chat = red flag, every time",
      ],
      bulletIcons: ["🛡️", "🚪", "🦝", "🎮", "🚫"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So what does 'let's chat somewhere else' really mean?",
          "Game chat is a guarded playground. Rules. Moderators. Report buttons. Guards everywhere!",
          "[whispers] Over on another app, those guards cannot see a thing.",
          "That is exactly why tricksters want to move you.",
          "[excited] You know this one from Week 3. Moving the chat? Red flag!",
          "Come and count the guards with me!",
        ],
      },
    },
    // 13 - Game: CHECKLIST "Guard Count" (guardCount, new engine)
    {
      type: "guardCount",
      skin: "rooms",
      threat: {
        raccoonLine:
          "Game chat is FULL of guards. Report buttons, moderators, grown-ups peeking in. So I say the chat is laggy and invite kids somewhere with no guards at all. Works every time!",
      },
      introTitle: "Guard Count",
      introSubtitle: "Two places to chat. Count the guards in each, then tap the room to stay in.",
      introIcon: "🛡️",
      slotHint: "Tap each guard to check it",
      chooseHint: "Now tap the room to stay in",
      stayLabel: "STAY HERE",
      presentWord: "HERE",
      missingWord: "MISSING",
      wrongTitle: "Count the guards again",
      completeTitle: "Every guard counted!",
      completeLine: "You stayed where the guards are, every time.",
      rounds: [
        {
          id: "laggy",
          prompt: "'This chat is so laggy. Message me on SnapTalk instead!'",
          readAloud: "A player says: this chat is so laggy, message me on SnapTalk instead! Count the guards in each place before you decide.",
          panels: [
            {
              id: "lobby",
              title: "Game lobby chat",
              icon: "🎮",
              isSafe: true,
              slots: [
                { id: "report", label: "Report button", present: true, readAloud: "Report button: here. One tap calls the game's guards." },
                { id: "block", label: "Block button", present: true, readAloud: "Block button: here. Any player can vanish from your game." },
                { id: "friends", label: "Friends only", present: true, readAloud: "Friends only: here. Only badges reach this room." },
                { id: "grownup", label: "Grown-ups can see", present: true, readAloud: "Grown-ups can see: here. Your family can read this chat any time." },
              ],
            },
            {
              id: "snaptalk",
              title: "SnapTalk",
              icon: "💬",
              isSafe: false,
              slots: [
                { id: "report", label: "Report button", present: false, readAloud: "Report button: missing. Nobody to call over there." },
                { id: "block", label: "Block button", present: false, readAloud: "Block button: missing." },
                { id: "friends", label: "Friends only", present: false, readAloud: "Friends only: missing. Anyone can message you there." },
                { id: "grownup", label: "Grown-ups can see", present: false, readAloud: "Grown-ups can see: missing. That is the whole point of the move." },
              ],
            },
          ],
          why: "Four guards here, none over there. A laggy chat is not the real reason for the move. Stay where the guards are.",
          whyWrong: "Count again. SnapTalk has no report button, no block button, no friends only and no grown-ups. Four guards here, zero there.",
        },
        {
          id: "secret-map",
          prompt: "'Come to my private server. I'll send you the secret map trick there.'",
          readAloud: "A player says: come to my private server, I'll send you the secret map trick there. Count the guards before you decide.",
          panels: [
            {
              id: "private",
              title: "Private server",
              icon: "💬",
              isSafe: false,
              slots: [
                { id: "report", label: "Report button", present: false, readAloud: "Report button: missing. It is their server, their rules." },
                { id: "block", label: "Block button", present: true, readAloud: "Block button: here, but blocking is all you could do." },
                { id: "friends", label: "Friends only", present: false, readAloud: "Friends only: missing. Whoever they invite is in." },
                { id: "grownup", label: "Grown-ups can see", present: false, readAloud: "Grown-ups can see: missing. Your family would never know you were there." },
              ],
            },
            {
              id: "lobby",
              title: "Game lobby chat",
              icon: "🎮",
              isSafe: true,
              slots: [
                { id: "report", label: "Report button", present: true, readAloud: "Report button: here." },
                { id: "block", label: "Block button", present: true, readAloud: "Block button: here." },
                { id: "friends", label: "Friends only", present: true, readAloud: "Friends only: here." },
                { id: "grownup", label: "Grown-ups can see", present: true, readAloud: "Grown-ups can see: here. That is all four guards, right here in the lobby." },
              ],
            },
          ],
          why: "Four guards here, three missing on the private server. A map trick that only works over there was never about the map. Stay here.",
          whyWrong: "Look at the private server: no report button, no friends only, no grown-ups. A secret trick is not worth losing three guards.",
        },
        {
          id: "party",
          prompt: "'Join my party chat in the game so we can plan the raid!'",
          readAloud: "A teammate says: join my party chat in the game so we can plan the raid! Count the guards before you decide.",
          panels: [
            {
              id: "lobby",
              title: "Game lobby chat",
              icon: "🎮",
              isSafe: false,
              slots: [
                { id: "report", label: "Report button", present: true, readAloud: "Report button: here." },
                { id: "block", label: "Block button", present: true, readAloud: "Block button: here." },
                { id: "friends", label: "Friends only", present: true, readAloud: "Friends only: here." },
                { id: "grownup", label: "Grown-ups can see", present: true, readAloud: "Grown-ups can see: here." },
              ],
            },
            {
              id: "party",
              title: "Party chat, inside the game",
              icon: "🎮",
              isSafe: true,
              slots: [
                { id: "report", label: "Report button", present: true, readAloud: "Report button: here. Party chat is still inside the game." },
                { id: "block", label: "Block button", present: true, readAloud: "Block button: here." },
                { id: "friends", label: "Friends only", present: true, readAloud: "Friends only: here. Only your team is in the party." },
                { id: "grownup", label: "Grown-ups can see", present: true, readAloud: "Grown-ups can see: here. Same game, same guards." },
              ],
            },
          ],
          why: "Party chat is still inside the game, with every guard in place. Moving rooms inside the game is fine. Leaving the game is the red flag.",
          whyWrong: "Both rooms have four guards. Party chat is inside the same game, so joining your team there is fine. Not every move is a trick.",
        },
      ],
      hints: {
        tier1: "Count the guards in each place: report, block, friends only, grown-ups. Stay where there are more.",
        tier2: "Inside the game, the guards come with you. Another app leaves them behind. Same guards in both? Then it is fine.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, you count the guards in Guard Count!",
          "This game is all about spotting when a chat is trying to move you away from the guards.",
          "Out in the real world, the move always comes with a friendly reason: laggy chat, a secret trick, a private server.",
          "Here is what you do. A player asks you to chat somewhere else. Two places appear. Tap each guard slot in both places to see if that guard is there or missing. When you have checked them all, tap STAY HERE under the place you would stay in.",
          "[warmly] Count first, then choose, and no trickster can talk you out of the guarded playground. Ready? First invite!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap every guard slot in both places. Then tap STAY HERE under the safer one."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every guard counted, Cyber Hero! You stayed where they are, every time.",
          "[warmly] Out in the real world, when someone says let's chat somewhere else, count the guards. If they would be left behind, so would your safety.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "real friends ALWAYS move to a different app, game chat is for noobs!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Real gaming friends are happy where the guards are. Only tricksters need you to leave." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Real gaming friends are happy where the guards are. ✓",
      nudge: "Who benefits when the chat leaves the guarded playground?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Busted. Real gaming friends are happy right where the guards are.",
          "Only a trickster needs you somewhere the guards cannot see.",
          "[warmly] Count the guards, and stay with them.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "'Let's chat on another app' means leaving the guards behind. Red flag, every time.",
      next: "the two buttons every hero can find in any game",
      emblem: "🚫",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. The somewhere-else trick bounced right off you.",
          "You counted the guards and you stayed with them.",
          "[whispers] Speaking of guards, two of them live in every game, hiding in a menu.",
          "Next, we'll learn where the report and block buttons live. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · REPORT AND BLOCK ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Report and Block: Your Power Buttons",
      content:
        "Every game has two hero buttons hiding in the player menu. REPORT tells the game's guards 'check this player!' and they can remove troublemakers for everyone. BLOCK makes that player vanish from YOUR game: no messages, no joining, they cannot even see you. Report first, then block, then tell a grown-up.",
      bullets: [
        "Every game has them, every single one",
        "REPORT = calls the game's guards",
        "BLOCK = that player vanishes from YOUR game",
        "Report first, then block, then tell",
        "Using them isn't mean, it is what they're FOR",
      ],
      bulletIcons: ["🎮", "🔔", "🚫", "🔢", "🛡️"],
      emblem: "🔔",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here they are: the two mightiest buttons in any game.",
          "REPORT tells the game's guards: check this player!",
          "BLOCK makes them vanish from YOUR game. Poof! No messages, no joining, they cannot even see you.",
          "[warmly] Report first, then block, then tell a grown-up.",
          "Using them isn't mean. It is exactly what they are for.",
          "[excited] Come and find them in three tricky menus!",
        ],
      },
    },
    // 17 - Game: FIND IN ORDER "The Power Panel" (powerPanel, new engine)
    {
      type: "powerPanel",
      skin: "menu",
      threat: {
        raccoonLine:
          "Every game hides those buttons in a different spot. By the time a kid finds them, I've moved on to the next lobby!",
      },
      introTitle: "The Power Panel",
      introSubtitle: "A nasty player, a menu full of buttons. Find REPORT, then BLOCK, then TELL.",
      introIcon: "🔔",
      panelTitle: "Player menu",
      stepLabels: ["REPORT", "BLOCK", "TELL"],
      wrongTitle: "Not that one yet",
      completeTitle: "Every button found!",
      completeLine: "Report, block, tell. In any menu, in any game.",
      rounds: [
        {
          id: "names",
          prompt: "GoldRush_Gary: 'You're the worst player I've ever seen. Quit the game, loser.'",
          readAloud: "GoldRush Gary keeps typing nasty names at you. The player menu is open. Find report, then block, then tell.",
          layout: "grid",
          buttons: [
            { id: "friend", label: "Add friend", note: "Add friend invites GoldRush Gary closer. That is the opposite of what this moment needs. Find report." },
            { id: "report", label: "Report player", step: 1 },
            { id: "emotes", label: "Emotes", note: "A dancing emote will not stop a bully. Look for the bell: report." },
            { id: "block", label: "Block player", step: 2 },
            { id: "shop", label: "Item shop", note: "The shop sells hats, not help. Keep looking for the report button." },
            { id: "tell", label: "Tell a grown-up", step: 3 },
          ],
          stepTeach: [
            "Report comes first. It calls the game's guards so they can deal with the bully for everyone.",
            "Block comes before tell. Make them vanish from your game, then tell a grown-up what happened.",
          ],
          why: "Report called the guards, block made him vanish, and a grown-up knows. Three taps and the lobby is yours again.",
        },
        {
          id: "creepy",
          prompt: "SkinDealer99: 'Send me a photo and I'll give you a free rare skin.'",
          readAloud: "SkinDealer99 wants a photo of you for a free skin. This menu looks different. Find report, then block, then tell.",
          layout: "list",
          buttons: [
            { id: "mute", label: "Mute", note: "Mute only quiets your game. The guards never hear about it. Report first." },
            { id: "stats", label: "View stats", note: "Their stats will not stop the asks. Keep looking for report." },
            { id: "report", label: "Report player", step: 1 },
            { id: "gift", label: "Send gift", note: "Sending anything is the last thing to do here. Find report." },
            { id: "block", label: "Block player", step: 2 },
            { id: "tell", label: "Tell a grown-up", step: 3 },
          ],
          stepTeach: [
            "Report first, always. Asking for a photo is exactly what the game's guards need to hear about.",
            "Block before you tell. Once they have vanished, a grown-up hears the whole story.",
          ],
          why: "Asking a kid for a photo is a red flag from Week 3, and you answered it with report, block, tell. Perfect order.",
        },
        {
          id: "spam",
          prompt: "FreeCoinz_Bot: 'CLICK HERE FOR 10,000 FREE COINS!!! CLICK NOW!!!'",
          readAloud: "FreeCoinz Bot is spamming the lobby with a free coins link. A different menu again. Find report, then block, then tell.",
          layout: "sidebar",
          buttons: [
            { id: "link", label: "Open link", note: "Never open a stranger's link. That is how the trick gets in. Find report." },
            { id: "report", label: "Report player", step: 1 },
            { id: "invite", label: "Invite to party", note: "Inviting a spammer into your party? No. Look for report." },
            { id: "block", label: "Block player", step: 2 },
            { id: "settings", label: "Settings", note: "Settings can wait. The report button is what this moment needs." },
            { id: "tell", label: "Tell a grown-up", step: 3 },
          ],
          stepTeach: [
            "Report first. A spam bot bothers everyone in the lobby, and only the guards can remove it for everyone.",
            "Block comes next, then tell. Vanish the bot from your game, then tell a grown-up about the free coins trick.",
          ],
          why: "Three different menus, and you found the buttons in every one. Report calls the guards, block clears your game, tell brings help.",
        },
      ],
      hints: {
        tier1: "Look for the word, not the spot. Report first: it calls the game's guards.",
        tier2: "Report, then block, then tell a grown-up. The buttons move, the order never does.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, you take on the Power Panel!",
          "This game is all about finding report and block, fast, in any game.",
          "Out in the real world, every game hides these buttons in a different spot, so you look for the WORD, not the place.",
          "Here is what you do. A nasty message sits at the top. Below it, a menu full of buttons. Tap REPORT first. Then tap BLOCK. Then tap TELL A GROWN-UP. If you tap something else, I will tell you why it does not help, and you try again.",
          "[warmly] Three menus, three times report, block, tell. Ready? First menu!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Find the button that calls the game's guards first. It says REPORT."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every button found, Cyber Hero! Three menus, three times report, block, tell.",
          "[warmly] Out in the real world, the buttons move around but the words stay the same. Look for the word, and the order never changes.",
        ],
      },
    },
    // 18 - Prove: PUT-IN-ORDER
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Report. Block. Tell. That is the order.",
          "Report calls the guards for everyone, block clears your game, telling brings help.",
          "[warmly] Same order in every game you will ever play.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Report calls the game's guards, block makes them vanish. Report, block, tell.",
      next: "the last trap: 'free' downloads that aren't",
      emblem: "🔔",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Four powers, Cyber Hero. You found both buttons in every menu.",
          "Report. Block. Tell.",
          "[whispers] One last trap guards the game zone, and it comes wrapped as a gift.",
          "Next, we'll learn why a free download is never free. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · FAKE MODS AND FREE DOWNLOADS ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "The 'Free Mod' Trap",
      content:
        "'FREE skins! Unlimited speed! Just download this mod!' It sounds amazing, but downloads from outside the real game can carry NASTY surprises: programs that steal accounts or break the computer. Real games sell their stuff INSIDE the game. Anything outside? Check with a grown-up first, every time.",
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
          "[excited] Free download, you say? Let's see what it really costs.",
          "Free skins! Unlimited speed! Just download this mod! Sounds amazing, right?",
          "[whispers] Downloads from OUTSIDE the real game can hide nasty surprises.",
          "Some steal accounts. Some break computers.",
          "Real games sell their stuff inside the game. Anything outside? Grown-up check first.",
          "[excited] Come and inspect a few downloads with me!",
        ],
      },
    },
    // 21 - Game: INSPECT "The Download Dock" (requestInspector re-theme, W2 engine)
    {
      type: "requestInspector",
      threat: {
        raccoonLine:
          "I wrap my traps as gifts. FREE skins! Unlimited speed! All I need is your login and your virus checker switched off. Kids click before they check!",
      },
      badgeLabel: "DOWNLOAD PAGE",
      introTitle: "The Download Dock",
      introSubtitle: "Downloads arrive at the dock. Inspect every clue, then decide: safe to ask about, or a trap to close.",
      introIcon: "🔍",
      fairLabel: "Looks safe: ask a grown-up first",
      nosyLabel: "It's a trap: close it",
      requests: [
        {
          id: "turbo-mod",
          appName: "MegaBlasters TURBO MOD",
          appIcon: "🎮",
          tagline: "UNLIMITED speed + FREE skins! Not available in the boring official game!",
          asksFor: ["Your game login", "Turn OFF the virus checker"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who made it?", note: "Not the real game company. Some random site nobody can check.", isRedFlag: true },
            { id: "want", label: "What does it want?", note: "Your game LOGIN, and the virus checker switched OFF. Two alarm bells.", isRedFlag: true },
            { id: "need", label: "Would the real game do this?", note: "Real games sell their stuff INSIDE the game, never through secret downloads.", isRedFlag: true },
            { id: "happens", label: "If you install it?", note: "Best case, nothing. Worst case, your account is stolen and the computer is sick.", isRedFlag: true },
          ],
          nudge: "Stolen account, sick computer. So who does a mod like this really help?",
          verdictNote: "A mod that wants your login and the virus checker off is a burglar asking you to unlock the door. Trap!",
          why: "Your login is the whole prize, and switching the virus checker off opens the door for the rest. Close it and tell a grown-up.",
        },
        {
          id: "official-pack",
          appName: "Mega Blasters Season Pack",
          appIcon: "🎮",
          tagline: "New season content, from the in-game shop",
          asksFor: ["A grown-up to approve the purchase"],
          isNosy: false,
          zones: [
            { id: "who", label: "Who made it?", note: "The real game company, inside the real game's own shop.", isRedFlag: false },
            { id: "want", label: "What does it want?", note: "Just a grown-up's OK. It never asks for your login somewhere weird.", isRedFlag: false },
            { id: "need", label: "Would the real game do this?", note: "Yes. This IS the real game, selling its stuff the proper way.", isRedFlag: false },
            { id: "happens", label: "If you get it?", note: "The content appears in your game. No surprises, no tricks.", isRedFlag: false },
          ],
          nudge: "Inside the real game, and it only wants a grown-up's OK. Does that sound like a trap?",
          verdictNote: "The real game's own shop, and nothing but your family's OK. That is the safe way to get new stuff.",
          why: "It lives inside the real game and asks for nothing but a grown-up's OK. That is how real games sell things.",
        },
        {
          id: "skin-generator",
          appName: "FREE Skin Generator 3000",
          appIcon: "🎮",
          tagline: "Generate ANY skin for FREE! 100% works! No virus we promise!!",
          asksFor: ["Your username AND password", "Click 3 mystery links"],
          isNosy: true,
          zones: [
            { id: "who", label: "Who made it?", note: "'No virus we promise!!' Real companies never have to promise that.", isRedFlag: true },
            { id: "want", label: "What does it want?", note: "Your USERNAME and PASSWORD. That is the whole trick, right there.", isRedFlag: true },
            { id: "need", label: "Would the real game do this?", note: "Free-anything generators do not exist. Skins cost the game company money.", isRedFlag: true },
            { id: "happens", label: "If you use it?", note: "You type your password... and the account is not yours any more.", isRedFlag: true },
          ],
          nudge: "It promises free skins, but it asks for your password. What is it really after?",
          verdictNote: "Generators never work. They exist to steal passwords. Close it and tell a grown-up.",
          why: "Nothing can generate free skins, so the password box is the real reason the page exists. Close it and tell a grown-up.",
        },
      ],
      hints: {
        tier1: "Ask: is this from INSIDE the real game, or from a random site outside it?",
        tier2: "Login asks, virus-checker-off asks and 'no virus we promise' mean a trap. Inside the game plus a grown-up's OK means safe.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, downloads arrive at the Download Dock!",
          "This game is all about telling a real in-game shop from a free-download trap.",
          "Out in the real world, the trap always looks like the better deal, and it always asks for one thing too many.",
          "Here is what you do. A download page appears. Tap each magnifying glass to inspect a clue: who made it, what it wants, whether the real game would do this, and what happens if you install it. Then tap your verdict: looks safe, ask a grown-up first, or it's a trap, close it.",
          "[warmly] Inspect every clue before you decide, and no free skin will ever cost you your account. Ready? First download!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap every magnifying glass before you decide."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every download inspected, Cyber Hero! Two traps closed, one real pack spotted.",
          "[warmly] Out in the real world, real games sell their stuff inside the game. Anything outside gets a grown-up check first, every time.",
        ],
      },
    },
    // 22 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Real games sell their stuff ___ the game.",
      choices: [
        { text: "inside", isCorrect: true },
        { text: "outside", isCorrect: false, why: "Outside the game is where the traps live. Real games sell inside their own shop." },
        { text: "beside", isCorrect: false, why: "Not beside. Inside the real game's own shop, with a grown-up's OK." },
        { text: "under", isCorrect: false, why: "Not under. Inside the game is the only safe shop." },
      ],
      praise: "INSIDE the game, with a grown-up's OK. ✓",
      nudge: "Where does the real game's own shop live?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Inside the game. That is where real games sell their stuff.",
          "A download from outside needs a grown-up check first.",
          "[warmly] And a password box on a free-skin page is always a trap.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Real games sell stuff inside the game. Outside downloads need a grown-up check, and password asks are always traps.",
      next: "one quick review to make it all stick",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "Chat fixed, lobby locked, guards counted, buttons found, traps closed.",
          "[whispers] Your game zone is a fortress now.",
          "One quick review to make it all stick, then the Raccoon comes to test it. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "Game Zone Bingo" (signBingo re-theme, W1 engine, card skin)
    {
      type: "signBingo",
      skin: "card",
      threat: {
        raccoonLine:
          "Five tricks, one lobby. Surely a kid can't remember the hero move for ALL of them!",
      },
      introTitle: "Game Zone Bingo",
      introSubtitle: "Lobby moments flash by. For each one, tap the hero move that answers it.",
      introIcon: "🎮",
      cardTitle: "GAME ZONE BINGO",
      stampToast: "SPOT ON!",
      wrongTitle: "Not that move",
      completeTitle: "BINGO! Game zone defended!",
      completeLine: "Five powers, one fortress, zero leaks.",
      // One sign per round (the engine ends the card when every sign is stamped).
      signs: [
        { id: "game-talk", label: "Game talk only", icon: "🎮" },
        { id: "friends-only", label: "Friends only lock", icon: "🎮" },
        { id: "guards", label: "Stay with the guards", icon: "🎮" },
        { id: "report", label: "Report, block, tell", icon: "🎮" },
        { id: "close-trap", label: "Close it, tell a grown-up", icon: "🎮" },
        { id: "swap-leak", label: "Swap it before SEND", icon: "🎮" },
      ],
      rounds: [
        {
          id: "school-ask",
          scene: "Mid-match, a player types: 'What school do you go to? I bet I know you!'",
          sceneIcon: "🎮",
          signId: "game-talk",
          note: "Your school is real-life info. The move here is game talk only: nice try, back to the game.",
          why: "School is real-life info, so the hero move is game talk only. Nice try, back to the game.",
        },
        {
          id: "strangers-drop-in",
          scene: "Three players you have never met drop into your lobby in one night.",
          sceneIcon: "🎮",
          signId: "friends-only",
          note: "Strangers reaching your lobby means the door is open. The move is the friends only lock.",
          why: "Strangers keep dropping into your lobby because the door is open. Flipping friends only locks it once, for every game after.",
        },
        {
          id: "snaptalk",
          scene: "'This chat is laggy, message me on SnapTalk instead!'",
          sceneIcon: "🎮",
          signId: "guards",
          note: "Moving the chat leaves the report button, the block button and your grown-ups behind. Stay with the guards.",
          why: "SnapTalk has none of the guards this chat has. The hero move is to stay right where they are.",
        },
        {
          id: "nasty-names",
          scene: "A player calls you names every single round.",
          sceneIcon: "🎮",
          signId: "report",
          note: "Names every round need the power buttons: report, block, then tell a grown-up.",
          why: "Report calls the guards, block clears your game, and a grown-up hears about it. Report, block, tell.",
        },
        {
          id: "free-skins",
          scene: "A website offers FREE rare skins if you type your game login.",
          sceneIcon: "🎮",
          signId: "close-trap",
          note: "A password box on a free-skin page is a trap. The move is close it, tell a grown-up.",
          why: "Your login is the loot on that free-skin page. Close it, tell a grown-up, and your account stays yours.",
        },
        {
          id: "home-alone",
          scene: "You are about to type: 'I'm home alone till 6, anyone want to voice chat?'",
          sceneIcon: "🎮",
          signId: "swap-leak",
          note: "Home alone is the one thing a lobby must never hear. The move is swap it before SEND.",
          why: "Home alone tells strangers there is no grown-up with you. Swap it before SEND, and the message flies clean.",
        },
      ],
      hints: {
        tier1: "Ask: is this a leak, an open door, a move away from the guards, a bully, or a trap? Each one has its own hero move.",
        tier2: "Someone asks for real-life info: game talk only. You are about to type it: swap it before SEND. Strangers in: friends only. Chat elsewhere: stay with the guards. Bully: report, block, tell. Password page: close it, tell a grown-up.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review: Game Zone Bingo!",
          "This game is all about matching each lobby moment to its hero move.",
          "Out in the real world, the moments come mixed up, so the moves have to be ready in any order.",
          "Here is what you do. A lobby moment appears above the bingo card. I will read it. Then tap the square with the hero move that answers it. Fill the card and it is bingo.",
          "[warmly] Six moments, six moves, one fortress. Ready? First moment!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here is a lobby moment. Tap the square with the hero move that answers it."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Bingo, Cyber Hero! Every lobby moment met its hero move.",
          "[warmly] Out in the real world, your game zone has a guard on every door now, and you know which one to call.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the intruder is reported and booted
    { type: "video", videoPlaceholder: "Week 6: Booted From the Lobby", videoSrc: "/videos/module-06-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "chat", label: "Chat Fixer", accent: "#7eff97", icon: "🎮", summary: "Game talk in, real-life info out. Name, school, address, never." },
        { id: "lobby", label: "Lobby Lock", accent: "#00e5ff", icon: "⚙️", summary: "Friends only join, hero name, friends-only mic. Set once, safe always." },
        { id: "move", label: "Stay With the Guards", accent: "#ff5fb3", icon: "🚫", summary: "'Chat somewhere else' means leaving the guards. Red flag, refused." },
        { id: "buttons", label: "Power Buttons", accent: "#ffd158", icon: "🔔", summary: "Report calls the guards, block makes them vanish. Report, block, tell." },
        { id: "mods", label: "Trap Closer", accent: "#c084fc", icon: "🪤", summary: "Real games sell inside the game. Password-hungry downloads are traps." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You fix the chat, you lock the lobby,",
          "you stay with the guards, you wield the power buttons...",
          "[warmly] and no free-skin trap will ever fool you.",
          "[excited] The intruder got booted from the lobby. Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "chat-fixer", name: "Chat Fixer", icon: "🎮", description: "Not one leak gets past." },
        { id: "lobby-locksmith", name: "Lobby Locksmith", icon: "⚙️", description: "Friends only everything." },
        { id: "button-master", name: "Button Master", icon: "🔔", description: "Report. Block. Tell. Instantly." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     5 apply-the-skill questions, one per taught concept, 4 right to pass
     (owner decision, UAT batch 2). Every villain line is distinct. Recorded
     via the narration generator (week6.ts is in LEARN_LOOP_WEEKS). */
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
    passMark: 4,
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
          text: "Curses! Over on SnapTalk I had snacks, beanbags, and zero moderators!",
        },
        villainWrong: {
          slug: "quiz-w6-wrong-c3-1",
          text: "Yesss, hop over to the app with no guards! I redecorated JUST for you!",
        },
      },
      {
        phaseId: "phase-w6-c4",
        key: "quiz-w6-c4-1",
        label: "Report and Block: Your Power Buttons",
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
          explanation: "Only report calls the game's guards so they can deal with the bully for everyone. Mute and block fix nothing but YOUR game. Report first, then block, then tell a trusted grown-up.",
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
    ],
  },

  badgeArt: "/cyberheroes/badges/week-06-lobby-guardian.png",

  // Legacy question pool, required by the WeekContent type; the quiz boss above
  // is what renders.
  bossQuestions: {
    easy: [
      { question: "What belongs in game chat?", answers: ["Game talk, tactics and rematches", "Your school's name", "Your address", "When you're home alone"], correctIndex: 0, explanation: "Game talk in, real-life info out. Always." },
      { question: "Which setting keeps strangers out of your lobby?", answers: ["Who can join: friends only", "Name shown: hero name", "Vibration: off", "Brightness: high"], correctIndex: 0, explanation: "Friends-only joining is the lock on your lobby door." },
      { question: "A player says 'let's chat on a different app'. That's...", answers: ["A red flag, stay where the guards are", "A friendly offer", "Totally normal", "OK if you've played lots of games together"], correctIndex: 0, explanation: "Off-game, the moderators can't protect you. That's exactly why they ask." },
    ],
    medium: [
      { question: "A player is being nasty. What order do you act in?", answers: ["Report, then block, then tell a grown-up", "Block first, then report", "Shout, quit, cry", "Add friend, then report"], correctIndex: 0, explanation: "Report calls the guards first, block vanishes them, telling finishes the job." },
      { question: "What does BLOCK do?", answers: ["That player vanishes from your game", "Deletes your account", "Kicks them out of the game for everyone", "Reports a bug"], correctIndex: 0, explanation: "No messages, no joining, they can't even see you. Poof." },
      { question: "A mod says 'turn OFF your virus checker to install'. You...", answers: ["Close it, that's a trap sign", "Turn it off quickly", "Turn it off just this once", "Only turn it half off"], correctIndex: 0, explanation: "Asking to disable protection is a burglar asking you to unlock the door." },
    ],
    hard: [
      { question: "Why do tricksters want to leave game chat?", answers: ["Rules, mods and report buttons can't follow them", "Game chat is too slow", "They prefer typing", "So they can send you secret map tricks"], correctIndex: 0, explanation: "Off-game there are no guards. That's the whole point of the move." },
      { question: "'FREE skin generator, enter your password!' What happens if you do?", answers: ["The account isn't yours anymore", "You get free skins", "Nothing at all", "You get the skins, but with lots of ads"], correctIndex: 0, explanation: "Generators never work. They exist to steal passwords." },
      { question: "Where do real games sell their content?", answers: ["Inside the game's own shop", "On random download sites", "In chat messages", "On their fan forums"], correctIndex: 0, explanation: "Inside the game plus a grown-up's OK is the only safe way." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29), in lock-step with `screens` above.
  // The 5 recap checkpoints are 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 6: defend your game zone!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "An intruder in the lobby..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Game talk in. Real-life info out." }, layla: null }, // learn: chat
    5: { adam: { mood: "excited", message: "Fix the leak, then SEND!" }, layla: null }, // game: Chat Fixer
    6: { adam: null, layla: { mood: "excited", message: "Quick! Spot the leak!" } }, // prove: speed
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Let the settings do the guarding." } }, // learn: lobby
    9: { adam: { mood: "excited", message: "Badge in, no badge out!" }, layla: null }, // game: Lobby Doors
    10: { adam: null, layla: { mood: "thumbsup", message: "Which setting locks the door?" } }, // prove: recall
    11: { adam: { mood: "thumbsup", message: "Lobby: LOCKED." }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Why leave the guarded playground?" }, layla: null }, // learn: move
    13: { adam: { mood: "curious", message: "Count the guards first." }, layla: null }, // game: Guard Count
    14: { adam: null, layla: { mood: "worried", message: "He's fibbing. Catch him!" } }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Stay with the guards. Always." } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Two buttons. Endless power." } }, // learn: buttons
    17: { adam: { mood: "excited", message: "Find REPORT first!" }, layla: null }, // game: Power Panel
    18: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    19: { adam: { mood: "thumbsup", message: "Report. Block. Tell. Mastered." }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "'Free' downloads always cost something." }, layla: null }, // learn: mods
    21: { adam: { mood: "curious", message: "Inspect every clue, Cyber Hero." }, layla: null }, // game: Download Dock
    22: { adam: null, layla: { mood: "thumbsup", message: "Finish the shop rule!" } }, // prove: finish
    23: { adam: null, layla: { mood: "excited", message: "All five powers. Review time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Bingo the whole game zone!" } }, // review: Game Zone Bingo
    25: { adam: { mood: "worried", message: "He's in YOUR lobby. Boot him!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch him get booted!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Lobby Guardian badge earned!" }, layla: null }, // completion
  },
};

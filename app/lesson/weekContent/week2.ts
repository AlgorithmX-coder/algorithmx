import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 2 - Private Info: Guard Your Secrets.
 *
 * Built to the LEARN-LOOP gold standard (see the Build Standard: distilled
 * from Week 1 + Week 15). Spine:
 *
 *   video -> alert (Sarah hook) -> weekIntro (ATLAS: learn X so protected from Y)
 *   -> mission -> 5 concepts, each = Learn (info, numbered) -> Game (folded-in
 *      Spot-the-Danger `threat` + 5-beat intro + completeNarration payoff)
 *      -> Prove (quickCheck + teachNarration) -> recap. Every Learn opens on a
 *      ~2s "POWER N OF 5" chapter sweep (the separate Next-Power screen was CUT,
 *      owner 2026-09-11: theory -> exercise, never theory-theory-theory):
 *     1 PRIVATE  what counts as private   | reveal            | recall
 *     2 SORT     private vs OK-to-share   | vaultDrop         | recall (quick-sort)
 *     3 WHY      "why are they asking?"   | requestInspector  | lie
 *     4 IDENTITY safe usernames           | usernameBuilder   | speed
 *     5 ASK      unsure? ask a grown-up   | stepOrder "The Hero Pause" (skin: hero) | finish
 *   -> consolidation "Grab-Bag Blaster" (spamBlaster, re-themed) -> bossBattle
 *      (QuizBoss, 7 Q / passMark 5) -> closing video -> debrief -> stickers ->
 *      completion.
 *
 * The Leak Torch signature was SCRAPPED (teach-before-test); its "find the
 * leaks" idea returns, correctly placed, as the consolidation.
 *
 * ENGINE REUSE POLICY (owner, caps: "WE NEVER COPY AN EXERCISE"): a rebuilt week
 * never uses an engine already used by a previously rebuilt week (W15: proofScale,
 * conveyorSort, clueBoard, chooseYourPath, senderLineup, trailStamper,
 * cyberScanner; W1: memoryMatch, threeRandomWords, passwordHospital, pauseDecide,
 * weakSorter, signBingo). W2 = reveal / vaultDrop / requestInspector /
 * usernameBuilder / stepOrder / spamBlaster: zero overlap. Run
 * `node scripts/audit-engine-reuse.mjs` before picking an engine. Lane-clean: no photos (W8), no stranger-people (W3),
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
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Oh no, look what happened! The Raccoon tricked Adam and Layla into typing their address, their school, even their phone number.",
          "[whispers] Now he knows exactly where they are... yikes.",
          "[warmly] But YOUR secrets? He is getting nothing.",
          "[excited] By the end of this week, you'll guard every private treasure like a hero. Come on, let's see the mission!",
        ],
      },
    },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[2] },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn which info is PRIVATE and which is safe to share",
        "Ask the hero question: WHY are they asking?",
        "Build a secret identity and give the Raccoon NOTHING",
      ],
    },

    // NOTE: the "Leak Torch" signature was SCRAPPED (teach-before-test) - a
    // seal-the-leaks build task BEFORE any teaching, same call as Week 1's
    // Tumbler Dials. The "find the leaks" idea returns, correctly placed, as
    // the end-of-week consolidation. We open straight into Concept 1's Learn.

    /* ─────────── BEAT 1 · WHAT'S PRIVATE ─────────── */
    // 3 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
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
      threat: {
        raccoonLine:
          "Heh heh! I don't even need to BREAK in if kids just hand me their name, their street, their school. I collect those like shiny treasure!",
      },
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
          "[excited] On your very first challenge, we raid the Raccoon's secret wish list!",
          "This game is all about knowing which bits of YOU are private treasure.",
          "Out in the real world, the Raccoon collects these little clues to find you and trick you.",
          "Here is what you do. Tap each golden card to see his sneaky plan, then slam it shut with a shield.",
          "[excited] Foil every plan and his wish list is worthless. Ready? Let's peek!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Go on - tap any golden card to peek at his plan!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every card slammed shut! You just learned the five private treasures the Raccoon hunts for.",
          "[warmly] Out in the real world, keep your name, address, school, phone and where-you-are locked away, and he can never find you.",
        ],
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
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Exactly right. Your home address is PRIVATE.",
          "It tells a stranger WHERE you live, and that's one of your five treasures.",
          "A favorite pizza or a favorite color says nothing about who or where you are, so those are fine to share.",
          "[excited] Keep the treasures locked and the Raccoon can never find you. Well done!",
        ],
      },
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You guard your private info - name, address, school, phone and where you are - so a stranger can never find you or pretend to know you.",
      next: "what's fine to share and what stays locked away",
      emblem: "🛡️",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Awesome start, Cyber Hero!",
          "You found all five treasures the Raccoon hunts for.",
          "Your name, address, school, phone, and where you are... all PRIVATE.",
          "Next, we'll learn what's fine to share and what stays locked away. Come and see!",
        ],
      },
    },


    /* ─────────── BEAT 2 · SHARE OR KEEP ─────────── */
    // 7 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
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
          "[warmly] ...that goes straight in the vault.",
          "[excited] Time to guard the Treasure Table!",
        ],
      },
    },
    // 8 - Game: SORT (The Treasure Table - drag to vault or share board)
    {
      type: "vaultDrop",
      threat: {
        raccoonLine:
          "Ooh, a whole table of your info! Just pop your street or your school on the SHARE pile... go on, everybody does it! Then I'll swing by and collect.",
      },
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
          "[excited] On your next challenge, you're the guard at the Treasure Table!",
          "This game is all about sorting what's safe to share from what stays locked away.",
          "Out in the real world, mixing those two up is exactly how the Raccoon grabs a clue about you.",
          "Here is what you do. Grab each card and drag it. Favorites go up to the share board. Who-you-are and where-you-are drop straight into the vault.",
          "[excited] Guard every treasure and he gets nothing. Ready? Let's sort!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Grab that first treasure and drag it - board or vault?"],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Vault sealed! Now you can tell your favorites from your private treasure.",
          "[warmly] Share the fun stuff all you like, and keep who-you-are and where-you-are locked, so the Raccoon leaves empty-pawed.",
        ],
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[warmly] Yes! Your school stays PRIVATE.",
          "It points right at you, every single weekday.",
          "Your favorite game and favorite food are just things you LIKE, so share those away.",
          "[excited] Sort them right and your vault stays sealed. Great work!",
        ],
      },
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "You share your favorites but lock away who-you-are and where-you-are - so you can have fun online and still give the Raccoon nothing.",
      next: "the hero question - WHY are they asking?",
      emblem: "🌍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at you sort! That vault has never been safer!",
          "Favorites? Share away.",
          "Who you are, where you are? Straight in the vault.",
          "[warmly] Now for my favorite hero question of all...",
          "Next, we'll learn the ONE question that beats almost every trick. Come and see!",
        ],
      },
    },


    /* ─────────── BEAT 3 · WHY ARE THEY ASKING? ─────────── */
    // 11 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
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
          "[warmly] Ready for my favorite hero question?",
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
      threat: {
        raccoonLine:
          "My favorite trick! I build a cute little quiz that BEGS for your address 'to work'. It doesn't need it one bit... but you'll type it anyway, won't you? Heh heh.",
      },
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
          nudge: "Think. It's only a kitten quiz. Does it really need your name and your address?",
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
          nudge: "Think. It's a drawing app. Does a nickname and a favorite color give anything away?",
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
          nudge: "Think. They're stickers. Do stickers need your school and your phone number?",
        },
      ],
      hints: {
        tier1: "Compare what THIS app DOES with what it ASKS for. Does it really need that to work?",
        tier2: "If it asks for who-you-are or where-you-are stuff it doesn't need - it's TOO NOSY.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your next challenge, you become a form detective!",
          "This game is all about asking one hero question before you type: WHY are they asking?",
          "Out in the real world, sneaky apps ask for far more than they need, and that's the Raccoon's trap.",
          "Here is what you do. Tap all four magnifying glasses on each form, who's asking, what they want, whether they NEED it, and what happens next. Then make the call: fair ask, or too nosy?",
          "[excited] Catch every nosy form and no trick gets past you. Ready? Let's inspect!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap every magnifying glass before you decide!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Case closed, detective! Now you can ask WHY any app wants your info.",
          "[warmly] If it asks for more than it needs to work, it's too nosy, so you close it and tell a grown-up.",
        ],
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
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Busted! That was a fib.",
          "A quiz just matches you to a kitten. It does NOT need your home address to do that.",
          "Whenever an app asks for more than it needs, that's the hero signal: too nosy.",
          "[excited] Ask WHY every time and the trick falls apart. Nice catch!",
        ],
      },
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "You ask WHY before you type - so a nosy app can never trick you into handing over more than it needs.",
      next: "building your very own secret identity",
      emblem: "❓",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three down! You're a real form detective now.",
          "One little question beats the trick every time...",
          "[whispers] why are they asking?",
          "[excited] Next, we'll learn the coolest part of being a hero. Your SECRET IDENTITY!",
        ],
      },
    },


    /* ─────────── BEAT 4 · SECRET IDENTITY ─────────── */
    // 15 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
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
          "[excited] Come on, your hero mask is waiting!",
        ],
      },
    },
    // 16 - Game: BUILD (The Secret Identity Machine)
    {
      type: "usernameBuilder",
      threat: {
        raccoonLine:
          "Go on, tuck your real name into your username! Or your birth year! It looks SO cool... and it tells me exactly who you are. My favorite kind of name tag!",
      },
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
          "[excited] On your next challenge, we fire up the Secret Identity Machine!",
          "This game is all about building a username that's a perfect mask, with none of the real you inside.",
          "Out in the real world, a username with your name or birthday is a mask with a hole in it, and the Raccoon peeks right through.",
          "Here is what you do. Tap a hero word, a sidekick, and a lucky number for each reel, and dodge any part that leaks the real you.",
          "[excited] Fill the disguise meter and stamp your hero badge. Ready? Let's forge!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a part for each reel - and dodge anything that sounds like the REAL you!"],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Hero name forged! Now you can build a username that's a mask with no holes.",
          "[warmly] No real name, no age, no birthday, no school, so the Raccoon can stare all day and learn nothing.",
        ],
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[warmly] Fast and sharp! PixelPanda42 is the safe one.",
          "No real name, no age, no school, nothing that points at the real you.",
          "emma2017, Jake underscore Age9 and MapleHill underscore Star each leak a clue, so the mask has a hole.",
          "[excited] A true hero name gives the Raccoon nothing. Brilliant!",
        ],
      },
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "You wear a hero-name mask with no real name, age, birthday or school - so no one online can work out the real you.",
      next: "the golden rule for everything else",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your secret identity is FORGED!",
          "Nothing that points at the real you. Just pure hero.",
          "[laughs] The Raccoon can stare at it all day and learn nothing.",
          "[warmly] One more power to collect, and it's the one that saves you when you're stuck.",
          "Next, we'll learn what to do when you're just not sure. Come and see!",
        ],
      },
    },


    /* ─────────── BEAT 5 · ASK A GROWN-UP ─────────── */
    // 19 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
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
          "[warmly] If you're not sure, ask first. Every single time.",
          "[excited] Let's practise the Hero Pause together!",
        ],
      },
    },
    // 20 - Game: ORDER "The Hero Pause" (stepOrder, skin "hero"). Engine-reuse
    // policy: W1 already uses PauseDecide, so W2 gets a different verb (ORDER)
    // on a different board (hero-badge trail, not W5's river stones).
    {
      type: "stepOrder",
      skin: "hero",
      pathLabel: "THE HERO PAUSE",
      threat: {
        raccoonLine:
          "Here's my sneakiest move: I pop up something confusing and hope you just tap YES to make it vanish. Whatever you do, DON'T go asking a grown-up... they ruin everything!",
      },
      introTitle: "The Hero Pause",
      introSubtitle: "A confusing pop-up just appeared. Put the four hero moves in the order a hero does them.",
      introIcon: "⏸️",
      steps: [
        { id: "tingle", text: "Feel the not-sure tingle", icon: "❓", affirmation: "That tingle is your hero alarm!" },
        { id: "stop", text: "Stop. Don't type yet", icon: "✋", affirmation: "Hands off. The Raccoon HATES a pause!" },
        { id: "ask", text: "Ask a grown-up", icon: "👪", affirmation: "Backup team, called in!" },
        { id: "decide", text: "Decide together", icon: "✅", affirmation: "Now you choose, and you choose safe!" },
      ],
      completeTitle: "Backup team, assembled!",
      completeLine: "Tingle, stop, ask, decide. That's the Hero Pause, for real life too.",
      hints: {
        tier1: "What does a hero do the very second something feels not-sure?",
        tier2: "First feel the tingle, then STOP, then ask a grown-up, then decide together.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your LAST challenge, you learn the Hero Pause!",
          "This game is all about what to do when you're just not sure: stop, and ask a grown-up.",
          "Out in the real world, tricky pop-ups appear all the time, and the smartest heroes never guess.",
          "Here is what you do. Four hero moves are jumbled up below. Tap them in the order a hero does them, and each one lights up on the path.",
          "[excited] Get the whole Hero Pause in order and no trick can catch you. Ready? You've got this!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Which hero move comes FIRST? Tap it!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Golden rule mastered! When you're not sure, you stop and ask a trusted grown-up.",
          "[warmly] A parent, a carer, a teacher, your backup team, so you never have to guess and the Raccoon never wins.",
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
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] That's the golden rule. When you're not sure, you ask a grown-up.",
          "Not a guess, not a quick type, not the Raccoon. A parent, a carer or a teacher.",
          "They're your backup team, and asking first is the smartest hero move there is.",
          "[excited] Pause and ask, every single time. You've got this!",
        ],
      },
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "You pause and ask a grown-up whenever you're unsure - so you never have to guess, and a trap never catches you.",
      next: "one final drill, then the final test",
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You know what's private, what to share, when to ask why...",
          "you've got a secret identity, AND the golden rule.",
          "[whispers] The Raccoon has no idea what's coming.",
          "[excited] One quick final drill to make it all stick... then we send that Raccoon home empty-pawed. Come on!",
        ],
      },
    },

    // 23 - Consolidation: "Grab-Bag Blaster" (spamBlaster, fully re-themed).
    // Engine-reuse policy: W15 owns conveyorSort + cyberScanner and W1 owns
    // signBingo, so W2's mixed review gets a new verb: ZAP. The Raccoon's grabs
    // for private info fly at the child's device; zap every grab, let the safe
    // messages through. Cards mix all five concepts; the engine runtime-shuffles.
    {
      type: "spamBlaster",
      threat: {
        raccoonLine:
          "Here comes my grab bag - EVERY trick at once! Name grabs, address grabs, school grabs... you can't zap them all. Just let a couple through, I'm not fussy!",
      },
      introTitle: "Grab-Bag Blaster",
      introDescription: "The Raccoon's grabs are flying at your device! ZAP every grab for private info. Let the safe messages through.",
      introIcon: "⚡",
      headline: "⚡ ZAP THE RACCOON'S GRABS! ⚡",
      missLabel: "GRABS",
      copy: {
        deviceTitle: "◆ Hero Vault",
        inboxLabel: "KEPT SAFE",
        missWord: "GRAB",
        missWordPlural: "GRABS",
        clearLabel: "VAULT SEALED",
        safeFloater: "OOPS! That one was safe!",
        safeWrongTitle: "That one was safe to share!",
        safeWrongExplanation: '"{sender}" only asked for something fun, or came from one of your real people. Only zap the grabs for who-you-are or where-you-are info.',
        safeWrongTip: "Favorites, hobbies and messages from your real people are safe. Read WHO is asking and WHAT they want.",
        missTitle: "A grab got through!",
        missExplanation: '"{subject}" from "{sender}" was a grab for your private info. {clue}.',
        missClueFallback: "It asked for who-you-are or where-you-are info it does not need",
        missTip: "Grabs ask for your name, address, school, phone or where you are. Zap them fast!",
        finishTitle: "GRAB BAG EMPTY!",
        deliveredWord: "Kept safe",
      },
      emails: [
        { sender: "Kitten Quiz", subject: "Type your HOME ADDRESS to see your kitten!", isPhishing: true, clue: "A quiz never needs your address" },
        { sender: "Grandma", subject: "Show me your dragon drawing!", isPhishing: false, clue: "" },
        { sender: "Mega Blasters", subject: "Enter your SCHOOL to join the tournament!", isPhishing: true, clue: "Your school says where you are every weekday" },
        { sender: "Doodle Pad", subject: "Pick a nickname to label your art", isPhishing: false, clue: "" },
        { sender: "Sticker Storm", subject: "FREE stickers! Just type your phone number!", isPhishing: true, clue: "Stickers never need to ring you" },
        { sender: "Coach Ali", subject: "Swim practice moved to 4pm", isPhishing: false, clue: "" },
        { sender: "Prize Bot", subject: "Tell us your FULL NAME to claim your prize!", isPhishing: true, clue: "Your full name is the first clue to finding you" },
        { sender: "Art Club", subject: "What's your favorite color this week?", isPhishing: false, clue: "" },
        { sender: "Friend Finder", subject: "Share your location so friends can find you!", isPhishing: true, clue: "Where you are is nobody's business but yours" },
        { sender: "Dad", subject: "Pizza for dinner tonight!", isPhishing: false, clue: "" },
        { sender: "Game Sign-Up", subject: "Use your REAL NAME as your username!", isPhishing: true, clue: "A real name in a username is a mask with a hole" },
      ],
      hints: {
        tier1: "Read WHO is asking and WHAT they want. Does it ask for who-you-are or where-you-are info?",
        tier2: "Grabs want your name, address, school, phone, location or a leaky username. Favorites and messages from your real people are safe.",
        tier2Example: "'Type your HOME ADDRESS' / 'Enter your SCHOOL' = a grab",
        tier3: "Quick rule: if it wants a private treasure it doesn't need, ZAP it. If it's a favorite or one of your real people, let it through.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill, Cyber Hero! The Raccoon has emptied his whole grab bag at you.",
          "This one mixes up everything you learned about guarding your secrets.",
          "Out in the real world, grabs for your private info and perfectly safe messages fly past you all the time.",
          "Here is what you do. Messages fly toward your device. Tap a grab for private info to ZAP it. Leave the safe ones alone and they land in your vault.",
          "[warmly] Trust your training, you guard this vault now. Ready? Let's zap!",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Grab bag empty! You can spot a grab for private info in a flash.",
          "[warmly] The Raccoon packed up his bag and went home with absolutely nothing. That's a Privacy Guardian!",
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

  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     Same contract as W1: 15 apply-the-skill questions, 3 per taught
     concept, interleaved round-robin (c1..c5, c1..c5, c1..c5). Every
     villain line below is DISTINCT (zero repeated phrases in this file).
     TODO(audio): record every slug below (villain = Callum via the
     cyberheroes-narration-audio pipeline); browser TTS speaks each text
     until its clip exists at /audio/villain/{slug}.mp3. */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#9d7bff",
    theme: {
      topic: "Private Info",
      motifs: ["🆔", "📍", "🏠", "🎭", "📱", "🌍", "🔒", "👤"],
    },
    // Learn-Loop standard: 7 questions (5 concepts + 2 review), pass 5/7.
    passMark: 5,
    intro: {
      slug: "quiz-w2-intro",
      text: "Ah, the little vault-keeper is back! You guarded your treasures all lesson, but one quiz with me and they'll come tumbling out!",
    },
    victory: {
      slug: "quiz-w2-victory",
      text: "Not one single secret?! My grab list is blank, my scanner is sulking, and my snoop-mobile just ran out of gas!",
    },
    questions: [
      {
        phaseId: "phase-w2-c1",
        key: "quiz-w2-c1-1",
        label: "Private Radar",
        ask: {
          slug: "quiz-w2-ask-c1-1",
          text: "Adam's new game wants him to fill in his player card, and three facts are ready to type. Which one stays locked in the vault?",
        },
        options: [
          { text: "The name of the school he goes to" },
          { text: "The name of the game he plays most" },
          { text: "The name of his favorite dinosaur" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Who-you-are and where-you-are stay locked!",
          explanation: "A favorite game and a favorite dinosaur only say what Adam LIKES. His school says where he is five days a week, and that's one of the five private treasures.",
        },
        villainRight: {
          slug: "quiz-w2-right-c1-1",
          text: "OW! Zero schools on that card?! My snoop-map has a big empty hole where you should be!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c1-1",
          text: "A school name! My wish list finally gets its gold star sticker!",
        },
      },
      {
        phaseId: "phase-w2-c2",
        key: "quiz-w2-c2-1",
        label: "Share Smarts",
        ask: {
          slug: "quiz-w2-ask-c2-1",
          text: "Layla's club profile has one empty box left for a fun line about herself. Which line is safe to type in?",
        },
        options: [
          { text: "Pancakes are the best breakfast ever" },
          { text: "Maple Hill is the best school ever" },
          { text: "Rainbow Road is the best street ever" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Favorites yes, places no!",
          explanation: "All three sound like favorites, but only the pancakes are really about what she likes. A best school or a best street quietly tells a stranger where to find her.",
        },
        villainRight: {
          slug: "quiz-w2-right-c2-1",
          text: "Pancakes?! I can't DO anything with pancakes except get hungry! Unfair!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c2-1",
          text: "A school or a street dressed up as a favorite, and you waved it right through! Scribble scribble!",
        },
      },
      {
        phaseId: "phase-w2-c3",
        key: "quiz-w2-c3-1",
        label: "The Why-Check",
        ask: {
          slug: "quiz-w2-ask-c3-1",
          text: "Three coloring apps each want one thing before Adam can draw. Which app is being too nosy?",
        },
        options: [
          { text: "The one that wants his phone number" },
          { text: "The one that wants a made-up nickname" },
          { text: "The one that wants his favorite color" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Ask what the app NEEDS!",
          explanation: "A nickname labels his art and a favorite color picks his paints, those asks match the app. Coloring never rings anybody, so a phone number is an over-ask. Too nosy!",
        },
        villainRight: {
          slug: "quiz-w2-right-c3-1",
          text: "You asked WHY?! That question gives me a rash, you know that?!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c3-1",
          text: "Phone number collected! RING RING, it's your friendly coloring app calling at bedtime!",
        },
      },
      {
        phaseId: "phase-w2-c4",
        key: "quiz-w2-c4-1",
        label: "Secret Identity",
        ask: {
          slug: "quiz-w2-ask-c4-1",
          text: "Layla needs a username for her drawing club. Which one keeps her hero mask on?",
        },
        options: [
          { text: "VelvetFox31" },
          { text: "Layla_Draws" },
          { text: "MapleHill_Artist" },
          { text: "ArtKid2017" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "No real-you clues in the mask!",
          explanation: "A real first name, a school, or a birth year pokes a hole in the mask, even inside a cool-sounding name. Hero words plus a number that means nothing keep the real Layla invisible.",
        },
        villainRight: {
          slug: "quiz-w2-right-c4-1",
          text: "VelvetFox WHO?! I own an actual fox costume and even I can't trace that name!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c4-1",
          text: "A name, a school, a birth year... that's not a mask, that's a name tag! I LOVE name tags!",
        },
      },
      {
        phaseId: "phase-w2-c5",
        key: "quiz-w2-c5-1",
        label: "Ask First",
        ask: {
          slug: "quiz-w2-ask-c5-1",
          text: "A pop-up in Adam's game asks him something he's never seen before, and he's not sure if it's safe to answer. What's the hero move?",
        },
        options: [
          { text: "Pause and ask a trusted grown-up" },
          { text: "Type an answer and see what happens" },
          { text: "Ask the app's help robot instead" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Heroes don't guess!",
          explanation: "The help robot works for the app, and typing to see what happens is just guessing. When you're not sure, hit pause and call your backup: a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w2-right-c5-1",
          text: "A trusted grown-up?! They ruin EVERYTHING! They check things! With their EYES!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c5-1",
          text: "Type first, think never! You're my favorite kind of quiz-taker!",
        },
      },
      {
        phaseId: "phase-w2-c1",
        key: "quiz-w2-c1-2",
        label: "Private Radar",
        ask: {
          slug: "quiz-w2-ask-c1-2",
          text: "My scanner beeps when it finds private treasure. Adam typed three things in chat today. Which one made it beep?",
        },
        options: [
          { text: "I ride the number 12 bus home" },
          { text: "I beat level 12 this morning" },
          { text: "My high score ends in 12" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Where-you-go is treasure too!",
          explanation: "Levels and high scores say nothing about the real Adam. The bus he rides home shows where he goes every single day, and that's exactly the kind of treasure a scanner hunts.",
        },
        villainRight: {
          slug: "quiz-w2-right-c1-2",
          text: "The bus?! I waited at level 12 with a butterfly net and caught NOTHING!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c1-2",
          text: "The number 12 bus! Time to buy myself a little raccoon bus pass, toot toot!",
        },
      },
      {
        phaseId: "phase-w2-c2",
        key: "quiz-w2-c2-2",
        label: "Share Smarts",
        ask: {
          slug: "quiz-w2-ask-c2-2",
          text: "Layla won her swim race and wants to tell her game friends. Which message is the safe way to celebrate?",
        },
        options: [
          { text: "I won my swim race today, best day ever!" },
          { text: "I won my swim race at the pool on Oak Street!" },
          { text: "I won my swim race for Maple Hill School!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Share the win, not the where!",
          explanation: "The happy news is hers to shout! It only turns private when a place gets attached: a pool's street or a school name tells strangers where to find her.",
        },
        villainRight: {
          slug: "quiz-w2-right-c2-2",
          text: "You shared the WIN and kept the WHERE?! That's not how bragging is supposed to work!",
        },
        villainWrong: {
          slug: "quiz-w2-wrong-c2-2",
          text: "A trophy with a street or a school attached?! Best gift wrap I ever saw!",
        },
      },
    ],
  },

  /* Bespoke medal art for the victory scene (W2 rewrap). */
  badgeArt: "/cyberheroes/badges/week-02-privacy-guardian.png",

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

  // Keyed by SCREEN INDEX (0-33), re-keyed to the true Learn-Loop order after
  // the signature was scrapped and 4 nextPower cards + a new consolidation were
  // added. Keep in lock-step with `screens` above (trailing labels help).
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 2 - guard your secrets!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He got their details - don't let him get yours!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the plan." } }, // weekIntro (ATLAS)
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Five treasures. All private." }, layla: null }, // C1 learn: private
    5: { adam: null, layla: { mood: "worried", message: "Peek at his plans - then slam them shut!" } }, // C1 game: reveal
    6: { adam: { mood: "thumbsup", message: "Prove it - which one's private?" }, layla: null }, // C1 prove
    7: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // C1 recap
    8: { adam: null, layla: { mood: "curious", message: "Favorites are fine. YOU-stuff is not." } }, // C2 learn: sort
    9: { adam: { mood: "excited", message: "Drag every treasure home!" }, layla: null }, // C2 game: vaultDrop
    10: { adam: null, layla: { mood: "excited", message: "Quick - which one stays locked?" } }, // C2 prove
    11: { adam: { mood: "thumbsup", message: "Best vault-guard I've ever met." }, layla: null }, // C2 recap
    12: { adam: { mood: "thinking", message: "One question beats the trick: WHY?" }, layla: null }, // C3 learn: why
    13: { adam: { mood: "curious", message: "Inspect every clue, detective." }, layla: null }, // C3 game: inspector
    14: { adam: null, layla: { mood: "worried", message: "He's fibbing again - catch him!" } }, // C3 prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Form detective - certified!" } }, // C3 recap
    16: { adam: null, layla: { mood: "thinking", message: "Every hero needs a mask." } }, // C4 learn: identity
    17: { adam: { mood: "excited", message: "Forge that hero name!" }, layla: null }, // C4 game: builder
    18: { adam: null, layla: { mood: "excited", message: "Quick - tap the safe one!" } }, // C4 prove: speed
    19: { adam: { mood: "thumbsup", message: "Identity: secret. Mask: sealed." }, layla: null }, // C4 recap
    20: { adam: { mood: "thinking", message: "Not sure? That's what backup is for." }, layla: null }, // C5 learn: ask
    21: { adam: { mood: "curious", message: "Feel the tingle? Ask a grown-up." }, layla: null }, // C5 game: stepOrder (Hero Pause)
    22: { adam: null, layla: { mood: "thumbsup", message: "Finish the golden rule!" } }, // C5 prove: finish
    23: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // C5 recap
    24: { adam: null, layla: { mood: "excited", message: "Sort his grab list - fast!" } }, // consolidation: Grab-Bag Blaster
    25: { adam: { mood: "worried", message: "The Quiz Showdown - give him NOTHING!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch his form come back blank!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Privacy Guardian badge earned!" }, layla: null }, // completion
  },
};

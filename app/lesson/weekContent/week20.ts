import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 20 - Graduation Day: The Final Mission
 *
 * Rebuilt to the Learn-Loop Build Standard. 30 screens:
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 MISSIONS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 VAULT   the reset envelope           | passwordVault    | lie
 *     2 ASKING  the app that wants too much  | requestInspector | recall
 *     3 MONEY   the last money trap          | truePriceLever   | speed
 *     4 LEAK    one photo, four facts        | trackBack        | recall
 *     5 TOGETHER you never do this alone     | askRing          | finish
 *   review (encoreOfTwenty) -> boss -> video -> debrief -> stickers -> done
 *
 * WHAT THE REBUILD FIXED. 31 screens and it OPENED ON A GAME, and its reactions
 * map carried 29 keys for those 31 screens, so from index 2 onward every
 * reaction landed on the wrong screen. Now 30 and 30, counted. It was also the
 * last week still carrying silent board lines: five of them, now recorded.
 *
 * NO NEW CONCEPTS, AND THAT IS THE POINT. This is the capstone. Every mission
 * is a recombination of powers the child already owns, and every engine is one
 * they have met before. RECOGNITION IS THE DESIGN: a child who says "oh, I know
 * this one" is having exactly the experience this week exists to give them.
 * That is the opposite of a re-theme, which exists to make a familiar mechanic
 * feel new, so this week is NOT charged against the re-theme budget. It is
 * recorded in the reuse audit as the graduation exemption, by name.
 *
 * Even so, nothing here is over its cap and nothing comes from Week 19, so the
 * recognition is spread right across the course rather than echoing last week:
 *   passwordVault     Week 4 and Week 9   (11 weeks since the child last saw it)
 *   requestInspector  Week 2 and Week 6   (14 weeks)
 *   truePriceLever    Week 7              (13 weeks)
 *   trackBack         Week 12             (8 weeks)
 *   askRing           Week 8              (12 weeks)
 *   encoreOfTwenty    this week's own signature, promoted to the REVIEW slot,
 *                     which is where it always belonged: echoing the six
 *                     emblems back is a celebration-shaped rehearsal of the
 *                     whole twenty weeks. Already tap-only and untimed, so no
 *                     conversion was needed. It gained a spoken payoff here,
 *                     because the last game of the entire course used to finish
 *                     in silence.
 *
 * MISSION 5 IS THE REAL ENDING. The five missions deliberately do not end on a
 * trick. The last thing a child does in this course is ask the people in a
 * photo whether they mind being in it, because the whole nineteen weeks comes
 * down to one habit: you are allowed to check with somebody first, and you
 * never have to work any of this out on your own. The recap says so plainly.
 *
 * TONE. Nothing in this week teaches anything new, so nothing in it should feel
 * like a test. The Raccoon is beaten and he knows it; his lines are bluster
 * rather than menace, and he loses for good at the end rather than escaping as
 * he has every other week.
 */
export const WEEK_20: WeekContent = {
  weekNumber: 20,
  title: "Graduation Day: The Final Mission",
  topic: "graduation",
  badgeName: "Certified Cyber Hero",
  badgeIcon: "🏆",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 20: GRADUATION DAY", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the final mission
    { type: "video", videoPlaceholder: "Week 20: The Final Mission", videoSrc: "/videos/module-20-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-20.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "Storm clouds over the city. Nineteen weeks of defeats have left the Raccoon exactly one plan: everything, all at once, in one night. The fake reset envelope. The app that wants far too much. The free coin machines. The leak hunt. Every trick he owns, thrown at you in one last heist. Here is the bit he still has not understood. You have beaten every single one of these before. Tonight is not a lesson. It is a graduation. Five final missions, and at dawn you walk out CERTIFIED.",
      photoCaption: "Wk 20 - Graduation Day",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, look at that sky, and read this last incident report with me.",
          "Storm clouds over the city. Nineteen weeks of defeats have left the Raccoon exactly one plan: everything, all at once, in one night. Every trick he owns, thrown at you in one last heist.",
          "Here is the bit he has not understood. You have beaten every one of these before. Tonight is not a lesson, it is a graduation.",
          "[whispers] Every trick he owns. And you have already beaten all of them.",
          "[warmly] By the end of tonight, Cyber Hero, you graduate.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[20] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Five missions, and you already know all of them",
        "Nothing new tonight. Just everything you have",
        "Finish, and you walk out certified",
      ],
    },

    /* ─────────── MISSION 1 · THE RESET ENVELOPE ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "The Reset Envelope",
      content:
        "Tonight opens where the whole course opened: a password. There is an envelope on the doormat saying your account needs a new one, and four locks on the vault door waiting for you to choose. Nothing about this is new. You built your first strong password in Week 1, you spotted your first lying envelope in Week 4, and you learned the address plate in Week 16. Tonight is only those three things standing next to each other. That is what a final mission is.",
      bullets: [
        "Long beats complicated, every time",
        "Three random words is still the best trick",
        "Never the same one in two places",
        "An envelope is not proof of anything",
        "You have done all of this before",
      ],
      bulletIcons: ["🔑", "🔠", "🔀", "✉️", "💪"],
      emblem: "🔑",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Well. Here we are, Cyber Hero. Graduation night.",
          "And look where it starts. A password, which is exactly where you started nineteen weeks ago.",
          "[thinking] There is an envelope on the mat saying your account wants a new one.",
          "Nothing tonight is new. This is Week 1, Week 4 and Week 16 standing next to each other.",
          "[excited] Come on. Let's open the vault one last time!",
        ],
      },
    },
    // 5 - Game: VAULT (PasswordVault, its 3rd use, 11 weeks after W9). The
    // recognition IS the point tonight: no re-theme, no new dressing.
    {
      type: "passwordVault",
      skin: "vault",
      introTitle: "The Reset Envelope",
      introSubtitle: "Four locks on the vault door. You have picked every one of these before.",
      introIcon: "🔑",
      masterTitle: "THE VAULT DOOR",
      claimLabel: "Open it",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four locks, and a rule written above each one.",
          "Read the rule, then pick the answer that keeps it.",
          "You know all four of these. That is rather the point tonight.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Read the rule above the lock first. The answer is always the one that keeps it.",
        ],
      },
      threat: {
        raccoonLine: "One envelope! That is all it takes! Nineteen weeks and everybody still falls for the envelope!",
      },
      locks: [
        {
          id: "long",
          ruleLabel: "LONG BEATS COMPLICATED",
          icon: "📏",
          prompt: "Which of these would take the longest to crack?",
          speaker: "adam",
          choices: [
            { text: "purple-tractor-biscuit", isCorrect: true, why: "Three ordinary words and it is enormous. Length is what makes a password hard, not fiddly symbols.", explanation: "Have another look at how LONG each one is." },
            { text: "P@ss1!", isCorrect: false, explanation: "It looks clever and it is tiny. A machine gets through something that short in moments." },
            { text: "Dragon7", isCorrect: false, explanation: "Seven characters would take no time at all to crack. Short is the problem here, not the spelling." },
          ],
        },
        {
          id: "words",
          ruleLabel: "THREE RANDOM WORDS",
          icon: "🔠",
          prompt: "Which one is built the way you were taught in Week 1?",
          speaker: "adam",
          choices: [
            { text: "otter-lamp-thunder", isCorrect: true, why: "Three words that have nothing to do with each other, easy for you to remember and horrible for a machine to guess.", explanation: "Count the words, and check they have nothing to do with each other." },
            { text: "football-football-football", isCorrect: false, explanation: "It is built from words, yes, but it is one word said three times, so there is far less to guess." },
            { text: "mydogsname2014", isCorrect: false, explanation: "That is a fact about you plus a year, and both of those are on your profile somewhere." },
          ],
        },
        {
          id: "unique",
          ruleLabel: "NEVER THE SAME ONE TWICE",
          icon: "🔀",
          prompt: "Your game password is brilliant. Where else should you use it?",
          speaker: "adam",
          choices: [
            { text: "Nowhere else at all", isCorrect: true, why: "If one place ever leaks it, everywhere else stays shut. That is the whole reason for the rule.", explanation: "Think about what happens to the OTHER accounts if one place leaks." },
            { text: "On your email too, to remember it", isCorrect: false, explanation: "Email is the one that can reset all the others, so it is the worst possible place to repeat it." },
            { text: "Everywhere, it is a strong one", isCorrect: false, explanation: "Strong does not help once somebody else has it. Then it is just one key to everything you own." },
          ],
        },
        {
          id: "envelope",
          ruleLabel: "AN ENVELOPE IS NOT PROOF",
          icon: "✉️",
          prompt: "The envelope says to reset your password at the address on the card. What now?",
          speaker: "adam",
          choices: [
            { text: "Ignore the card and go to the app yourself", isCorrect: true, why: "Going there yourself means it does not matter one bit who sent the envelope. That works on every trick there is.", explanation: "Ask yourself who chose that address on the card." },
            { text: "Check the address looks about right, then use it", isCorrect: false, explanation: "About right is exactly what a copycat address is built to look like. You would be judging the paint again." },
            { text: "Use it, because it knew your name", isCorrect: false, explanation: "Your name is the easiest thing in the world for them to know. It proves nothing at all." },
          ],
        },
      ],
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four locks and you did not hesitate on one of them.",
          "Week 1, Week 4, Week 16. All of it still in there.",
          "[warmly] One mission down. He has four tricks left.",
        ],
      },
    },
    // 6 - Prove
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon says: 'A really CLEVER short password beats a long boring one!' Is he right?",
      choices: [
        { text: "No. Length beats cleverness every single time", isCorrect: true },
        { text: "Yes, symbols make it much harder", isCorrect: false, why: "Symbols help a little. Length helps enormously, and a short password stays short however clever it is." },
        { text: "Yes, if nobody can guess it", isCorrect: false, why: "Nobody is guessing. A machine is trying millions, and that is a race short passwords lose." },
        { text: "Yes, as long as you change it often", isCorrect: false, why: "Changing a short one often just gives you lots of short ones." },
      ],
      praise: "No. Length beats cleverness every single time. ✓",
      nudge: "Think about the lock that said long beats complicated.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Nineteen weeks and he is still trying that one!",
          "Three random words. Long, easy to remember, horrible to crack.",
          "[warmly] You knew that in Week 1 and you still know it now.",
        ],
      },
    },
    // 7 - Recap · Mission 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "The vault opened on rules you have had since Week 1: long beats clever, three random words, never repeated, and an envelope proves nothing.",
      next: "the app that asks for far more than it needs",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Mission one down, Cyber Hero, and you did not stop to think once.",
          "That is what happens when something has become a habit rather than a rule.",
          "[whispers] He is already onto the next one. Something is asking to be installed...",
          "Next, we'll take on the app that asks for far more than it needs. Come and see!",
        ],
      },
    },

    /* ─────────── MISSION 2 · THE APP THAT WANTS TOO MUCH ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "What Is It Asking For?",
      content:
        "Second mission, and it is one you have run since Week 2. Something wants to be let in, and the only question that matters is what it is asking for compared with what it actually does. A torch app needs to use the torch. It does not need your contacts, your location and your microphone. Fair or nosy is not about whether the app is nice. It is about whether the ask matches the job.",
      bullets: [
        "Everything that asks wants something",
        "Compare the ask against the JOB",
        "A torch needs the torch, nothing else",
        "Nice looking has nothing to do with it",
        "Nosy is a fact, not a feeling",
      ],
      bulletIcons: ["📱", "⚖️", "💡", "🎨", "🔍"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Mission two, and this is a check you have been running since Week 2.",
          "Something wants to be let in. And there is only one question worth asking.",
          "[warmly] What is it asking for, compared with what it actually DOES?",
          "A torch app needs the torch. It does not need your contacts and your location.",
          "[excited] Come and inspect a few. You could do this in your sleep by now!",
        ],
      },
    },
    // 9 - Game: ASKING (RequestInspector, its 3rd use, 14 weeks after W6).
    {
      type: "requestInspector",
      introTitle: "Fair or Nosy?",
      introSubtitle: "Open every window on the request, then say whether the ask matches the job.",
      introIcon: "🔍",
      badgeLabel: "INSPECTOR",
      fairLabel: "FAIR ASK",
      nosyLabel: "TOO NOSY",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three things want to be let in tonight.",
          "Open all four windows on each one before you decide anything.",
          "Then call it. Does the ask match the job, or not?",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Every window first. Then one question: does it need that to do its job?",
        ],
      },
      threat: {
        raccoonLine: "Just tap accept! NOBODY reads these! It is the most reliable thing in the entire world!",
      },
      requests: [
        {
          id: "torch",
          appName: "Bright Torch",
          appIcon: "💡",
          tagline: "Turns your phone into a torch",
          asksFor: ["Your camera light", "Your contacts", "Your location, always"],
          isNosy: true,
          zones: [
            { id: "job", label: "What it does:", note: "Switches the little light on the back of the phone on and off.", isRedFlag: false },
            { id: "light", label: "The light:", note: "Fair enough, a torch needs the light. That is literally the whole job.", isRedFlag: false },
            { id: "contacts", label: "Your contacts:", note: "But the job stops at the light, and a torch has no reason to know a single person you know.", isRedFlag: true },
            { id: "location", label: "Where you are, always:", note: "Nor does it need to know where you are. Always means even when the torch is off.", isRedFlag: true },
          ],
          verdictNote: "Two of those asks have nothing to do with switching a light on. That is nosy, however useful the torch is.",
          why: "It needs the light and it asked for the light. Then it asked for your friends and your movements, which no torch has ever needed.",
          nudge: "All four windows are open. Line up what the torch DOES against what it is asking for.",
        },
        {
          id: "camera",
          appName: "Photo Fixer",
          appIcon: "📸",
          tagline: "Makes your photos brighter",
          asksFor: ["Your photos", "Your camera"],
          isNosy: false,
          zones: [
            { id: "job", label: "What it does:", note: "Takes a photo you already have and makes it brighter.", isRedFlag: false },
            { id: "photos", label: "Your photos:", note: "It has to see a photo to fix one. That is the job, exactly.", isRedFlag: false },
            { id: "camera", label: "Your camera:", note: "And the camera so you can take a new photo inside it. Fair for something that edits pictures.", isRedFlag: false },
            { id: "rest", label: "Anything else:", note: "Nothing else at all. No contacts, no location, no microphone.", isRedFlag: false },
          ],
          verdictNote: "Photos and a camera, and nothing else at all. Not every app is a trick, and saying so is part of the job.",
          why: "Photos and camera, for something that edits photos. The ask matches the job exactly, and it stopped there.",
          nudge: "All four windows are open, and nothing else was asked for. Is there anything on that list it does not need?",
        },
        {
          id: "game",
          appName: "Pocket Racer",
          appIcon: "🎮",
          tagline: "Free racing game!",
          asksFor: ["Your microphone, always", "Your contacts", "Your messages"],
          isNosy: true,
          zones: [
            { id: "job", label: "What it does:", note: "A racing game you steer with your thumbs.", isRedFlag: false },
            { id: "mic", label: "Your microphone, always:", note: "You steer this game with your thumbs, so it does not need to hear your room at all.", isRedFlag: true },
            { id: "contacts", label: "Your contacts:", note: "Nor does it need to hear from everybody you know. That ask is for them, not for you.", isRedFlag: true },
            { id: "messages", label: "Your messages:", note: "And nothing about a racing game needs to read what people have written to you.", isRedFlag: true },
          ],
          verdictNote: "A microphone, your contacts and your messages, and not one of them steers a car.",
          why: "Three asks, and none of them make a car go any faster. You steer the thing with your thumbs.",
          nudge: "All four windows are open. Which of those actually helps a racing car round a corner?",
        },
      ],
      hints: {
        tier1: "Open every window first. The verdict unlocks when you have.",
        tier2: "Put the job next to the asks. Anything on the list the job does not need makes it nosy.",
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three inspected, and you got the fair one right as well as the two nosy ones.",
          "That matters. A Cyber Hero who thinks everything is a trick cannot use anything.",
          "[warmly] Two missions down. Halfway, and he is running out of ideas.",
        ],
      },
    },
    // 10 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "How do you tell a fair ask from a nosy one?",
      choices: [
        { text: "Compare what it asks for against what it does", isCorrect: true },
        { text: "Check how many people have installed it", isCorrect: false, why: "Plenty of people install nosy things. A big number says nothing about the ask." },
        { text: "See if it looks professional", isCorrect: false, why: "Looking smart is the cheapest part of making an app." },
        { text: "Check whether it is free", isCorrect: false, why: "Free and nosy often go together, and plenty of fair apps are free too." },
      ],
      praise: "Compare what it asks for against what it does. ✓",
      nudge: "Think about the torch. What made its list wrong?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight to it!",
          "The job on one side, the asks on the other.",
          "Anything on the list the job does not need is the nosy bit.",
          "[warmly] Same check every single time.",
        ],
      },
    },
    // 11 - Recap · Mission 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A fair ask is one the job actually needs, so you line up what it does against what it wants and look at the gap.",
      next: "the last money trap he has left",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Mission two down, Cyber Hero. Two nosy caught, and one fair one let through.",
          "Job on one side, asks on the other. It never gets harder than that.",
          "[whispers] He has gone quiet. Which usually means something is about to be free...",
          "Next, we'll take on the last money trap he has left. Come and see!",
        ],
      },
    },

    /* ─────────── MISSION 3 · THE LAST MONEY TRAP ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Pull the Lever",
      content:
        "Third mission, and this one is Week 7 all over again. A price is on a tag, and the tag is not the price. There are bits underneath it: the thing you have to buy first, the bit that renews every month, the coins that only come in bundles of five when you wanted one. The lever pulls all of it into the light. A Cyber Hero never argues with a price tag. They just pull the lever and read the real number.",
      bullets: [
        "The tag is not the price",
        "Look for what you must buy first",
        "Look for what renews on its own",
        "Bundles hide the cost of one",
        "Pull the lever, read the real number",
      ],
      bulletIcons: ["💎", "🔍", "⏱️", "🎁", "📋"],
      emblem: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Mission three, and we are right back in Week 7.",
          "There is a price on a tag. And the tag, as you know perfectly well by now, is not the price.",
          "[warmly] Underneath there is always something. A thing you must buy first. A bit that renews.",
          "So we do what we always do. We pull the lever and we read the real number.",
          "[excited] Come on. One last go on the lever!",
        ],
      },
    },
    // 13 - Game: MONEY (TruePriceLever, its 2nd use, 13 weeks after W7).
    {
      type: "truePriceLever",
      startCoins: 60,
      introTitle: "The True Price Lever",
      introSubtitle: "Pull the lever on each deal, read the real total, then buy it or walk away.",
      introIcon: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three deals, sixty coins, and the lever.",
          "Pull it on every one and the receipt comes out with the real total on it.",
          "Then decide. Buy it, or walk away.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Always pull the lever first. The tag is never the number that matters.",
        ],
      },
      threat: {
        raccoonLine: "Last night of trading! Everything must go! Do NOT read the small writing, there is no time!",
      },
      deals: [
        {
          id: "cape",
          name: "Starter Cape",
          art: "cape",
          priceTag: "10 coins",
          advertised: 10,
          trueCost: 10,
          receipt: [
            { label: "Starter Cape", amount: "10 coins", bad: false },
            { label: "Anything you must buy first", amount: "nothing", bad: false },
            { label: "Renews by itself", amount: "no", bad: false },
          ],
          totalLabel: "REAL TOTAL: 10 coins",
          stamp: "FAIR!",
          rightMove: "buy",
          readAloud: "First deal. A starter cape, ten coins on the tag.",
          why: "Ten on the tag and ten on the receipt. Nothing underneath it, so the tag was telling the truth this time.",
          teach: { title: "Have another look at the receipt", body: "The tag said ten and the receipt says ten. Nothing to buy first, nothing renewing. This one is honest.", tip: "Pull the lever on everything, including the ones that turn out fine." },
        },
        {
          id: "pass",
          name: "Champion Pass",
          art: "pass",
          priceTag: "15 coins",
          pressure: "Tonight only!",
          countdown: true,
          advertised: 15,
          trueCost: 60,
          receipt: [
            { label: "Champion Pass", amount: "15 coins", bad: false },
            { label: "Renews every month", amount: "15 coins a month", bad: true },
            { label: "Over four months", amount: "60 coins", bad: true },
          ],
          totalLabel: "REAL TOTAL: 60 coins",
          stamp: "TRICK!",
          rightMove: "walk",
          readAloud: "Second deal. A champion pass, fifteen coins, and a clock ticking on it.",
          why: "Fifteen on the tag, and it renews every month without asking. That is your whole sixty coins in four months.",
          teach: { title: "Have another look at the receipt", body: "Fifteen coins, then fifteen again next month, and again. The tag showed you one month of a thing that never stops.", tip: "Look for the word renews. It turns one price into all of them." },
        },
        {
          id: "box",
          name: "Mega Coin Box",
          art: "box",
          priceTag: "1 coin each!",
          pressure: "Everyone is buying!",
          advertised: 1,
          trueCost: 40,
          receipt: [
            { label: "Advertised as", amount: "1 coin each", bad: false },
            { label: "Only sold in bundles of", amount: "40", bad: true },
            { label: "Smallest you can buy", amount: "40 coins", bad: true },
          ],
          totalLabel: "REAL TOTAL: 40 coins",
          stamp: "TRICK!",
          rightMove: "walk",
          readAloud: "Last deal. A mega coin box, and the tag says one coin each.",
          why: "One coin each is true and you cannot buy one. The smallest bundle is forty, so forty is the actual price.",
          teach: { title: "Have another look at the receipt", body: "One coin each is perfectly true. It just is not a thing you can buy. The real price is the smallest bundle they sell.", tip: "When a price says each, look for how many you are forced to take." },
        },
      ],
      hints: {
        tier1: "Pull the lever before you decide anything. The receipt has the real number on it.",
        tier2: "Renews means it never stops. Each means you cannot buy one. Both turn a small tag into a big total.",
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three levers pulled, and you bought the one that was actually honest.",
          "Sixty coins and you still have fifty of them.",
          "[warmly] Three missions down. Two to go, and then the stage.",
        ],
      },
    },
    // 14 - Prove
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "A deal says '1 coin each!' but only sells in bundles of 40. What is the real price?",
      choices: [
        { text: "40 coins, because that is the smallest you can buy", isCorrect: true },
        { text: "1 coin, that is what it says", isCorrect: false, why: "One coin each is true and useless, because there is no way to buy just one." },
        { text: "It depends how many you want", isCorrect: false, why: "It does not. You take forty whatever you wanted." },
        { text: "You cannot tell without asking", isCorrect: false, why: "The receipt tells you. The smallest bundle is the price." },
      ],
      praise: "40 coins, because that is the smallest you can buy. ✓",
      nudge: "What is the least you could actually hand over?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Quick as anything!",
          "Each is the oldest trick on the board.",
          "The real price is always the smallest thing you are allowed to buy.",
          "[warmly] Pull the lever and it shows up every time.",
        ],
      },
    },
    // 15 - Recap · Mission 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "The tag is never the price, so you pull the lever and read the real total off the receipt before deciding anything.",
      next: "how much one photo can give away",
      emblem: "💎",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Mission three down, Cyber Hero. Fifty coins still in your pocket.",
          "Renews, and each. Two little words that change every price there is.",
          "[thinking] Now. He has one photo left, and he thinks it is enough...",
          "Next, we'll see how much one photo can give away. Come and see!",
        ],
      },
    },

    /* ─────────── MISSION 4 · ONE PHOTO, FOUR FACTS ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "One Photo, Four Facts",
      content:
        "Fourth mission, and it is Week 12's footprint all over again. He has one photo, and he is going to try to build a whole map out of it. A shirt with a badge on it. A street sign behind somebody's head. A clock on a wall. A bus in the background. On their own each one is nothing at all. Together they are a school, a street and a time, which is the only thing he ever actually wanted.",
      bullets: [
        "A photo says more than what it shows",
        "A badge is a school",
        "A sign is a street",
        "A clock is a time",
        "Alone nothing, together a map",
      ],
      bulletIcons: ["📸", "🏫", "📍", "⏱️", "🌍"],
      emblem: "🌍",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Mission four, and this is Week 12's footprint, one last time.",
          "He has got hold of one photo. And he is going to try to build a map out of it.",
          "[warmly] A badge on a shirt. A street sign. A clock on the wall. A bus going past.",
          "On their own, every one of those is nothing at all.",
          "Put them together, though, and you have a school, a street and a time.",
          "[excited] Come and track it back with me!",
        ],
      },
    },
    // 17 - Game: LEAK (TrackBack, its 2nd use, 8 weeks after W12).
    {
      type: "trackBack",
      introTitle: "Track It Back",
      introSubtitle: "Four things in one photo. For each one, say what it actually tells him.",
      introIcon: "🌍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is the photo, and here are four things in it.",
          "For each one, pick what it actually tells somebody looking.",
          "Not what it looks like. What it TELLS them.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Ask the same question about every one. What could a stranger work out from that?",
        ],
      },
      threat: {
        raccoonLine: "One photo! That is all I need! Four little clues and I will have the whole address!",
      },
      prints: [
        {
          id: "badge",
          label: "The school badge on the jumper",
          icon: "🏫",
          readAloud: "First thing in the photo. A school badge, right there on the jumper.",
          options: [
            { id: "b-right", label: "Which school they go to", icon: "🏫", isRight: true, why: "A badge is a building with a name on it, and anybody can look up where that building is.", explanation: "Think about what a badge is FOR. It says which school, to everybody who sees it." },
            { id: "b-colour", label: "Their favourite colour", icon: "🎨", isRight: false, explanation: "The colours belong to the school, not to them, and the colours are not the useful bit." },
            { id: "b-nothing", label: "Nothing at all", icon: "🚫", isRight: false, explanation: "A badge names a school. That is the one thing it definitely does." },
          ],
        },
        {
          id: "sign",
          label: "The street sign behind them",
          icon: "📍",
          readAloud: "Next. A street sign, just behind their head.",
          options: [
            { id: "s-right", label: "Which street they were standing in", icon: "📍", isRight: true, why: "A street sign is an address with the number left off, and the school badge fills that in.", explanation: "Read the sign as a stranger would. It names exactly one street in the whole country." },
            { id: "s-far", label: "That they live far away", icon: "🌍", isRight: false, explanation: "It says nothing about far. It says exactly where, which is much more useful to him." },
            { id: "s-nothing", label: "Nothing, signs are everywhere", icon: "🚫", isRight: false, explanation: "Signs are everywhere and each one names one street. That is the whole point of them." },
          ],
        },
        {
          id: "clock",
          label: "The clock on the wall",
          icon: "⏱️",
          readAloud: "Now the clock on the wall behind them.",
          options: [
            { id: "c-right", label: "What time they are there", icon: "⏱️", isRight: true, why: "The clock is the dangerous half. A place is not much on its own, but a place plus a time is somewhere to wait.", explanation: "Put the clock next to the street. What do a place and a time make together?" },
            { id: "c-old", label: "How old the building is", icon: "🏠", isRight: false, explanation: "The clock says the time, not the age of anything." },
            { id: "c-nothing", label: "Nothing, it is just a clock", icon: "🚫", isRight: false, explanation: "A clock on its own is almost nothing. Next to a street sign it is the most useful thing in the photo." },
          ],
        },
        {
          id: "bus",
          label: "The bus going past",
          icon: "🌍",
          readAloud: "And last, a bus going past in the background.",
          options: [
            { id: "u-right", label: "Roughly which part of town", icon: "🌍", isRight: true, why: "A bus number only runs on one route, so it narrows the town down without anybody meaning it to.", explanation: "Think about where a bus with that number actually goes. It only runs one route." },
            { id: "u-rich", label: "Whether their family has a car", icon: "💎", isRight: false, explanation: "A bus in the background says nothing about anybody's car." },
            { id: "u-nothing", label: "Nothing, buses go everywhere", icon: "🚫", isRight: false, explanation: "Each numbered bus runs one route, so it quietly narrows down the area." },
          ],
        },
      ],
      hints: {
        tier1: "Do not ask what it looks like. Ask what somebody could work out from it.",
        tier2: "A badge is a school, a sign is a street, a clock is a time and a bus is an area. Put them together.",
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four things, and you read every one of them for what it really says.",
          "A badge, a sign, a clock and a bus. Not one of them mattered on its own.",
          "[warmly] Four missions down. One left, and it is my favourite.",
        ],
      },
    },
    // 18 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Why do four harmless things in one photo matter?",
      choices: [
        { text: "Put together they make a place and a time", isCorrect: true },
        { text: "Because photos are always dangerous", isCorrect: false, why: "They are not. It is what can be pieced together from them that matters." },
        { text: "Because four is a lot of clues", isCorrect: false, why: "It is not the number. Two of these would do it if they were the right two." },
        { text: "Because the photo was taken outside", isCorrect: false, why: "Inside or outside makes no difference. The clock was indoors." },
      ],
      praise: "Put together they make a place and a time. ✓",
      nudge: "Which two of the four were the dangerous pair?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That is exactly it!",
          "Alone, every one of them was nothing.",
          "A place and a time together is the bit he was actually after.",
          "[warmly] Same as it was in Week 12.",
        ],
      },
    },
    // 19 - Recap · Mission 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Four harmless things in one photo become a school, a street and a time once somebody puts them side by side.",
      next: "the one habit the whole twenty weeks comes down to",
      emblem: "🌍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Mission four down, Cyber Hero. His map fell apart in your hands.",
          "Alone nothing, together a map. You have known that since the snowfield.",
          "[warmly] And now the last one. It is not a trick at all, this one.",
          "Next, we'll learn the one habit the whole twenty weeks comes down to. Come and see!",
        ],
      },
    },

    /* ─────────── MISSION 5 · YOU NEVER DO THIS ALONE ─────────── */
    // THE REAL ENDING. The course deliberately does not finish on a trick.
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "You Never Do This Alone",
      content:
        "Last mission, and there is no trick in it. It is graduation night and you have a photo of the whole group, and before it goes anywhere you are going to do the thing this entire course has been about: you are going to check with somebody first. Ask the people in the picture. Some will say yes. Some will say leave me out, and that is a completely ordinary thing for somebody to say. Nineteen weeks of powers, and they all rest on one habit. You are allowed to ask, and you never have to work any of it out on your own.",
      bullets: [
        "Ask the people who are in it",
        "Leave me out is an ordinary answer",
        "Checking first costs you nothing",
        "The same habit works for everything",
        "You never have to do this alone",
      ],
      bulletIcons: ["👪", "🙈", "🤝", "🔰", "💪"],
      emblem: "🤝",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last mission, Cyber Hero. And there is no trick in this one at all.",
          "It is graduation night, you have a photo of everybody, and it is not posted yet.",
          "[thinking] So you are going to do the thing this whole course has really been about.",
          "You are going to ask the people in it first. Some will say yes. Some will say leave me out.",
          "Nineteen weeks of powers, and they all sit on one habit. You are allowed to ask.",
          "[excited] Come on. Let's finish this properly!",
        ],
      },
    },
    // 21 - Game: TOGETHER (AskRing, its 2nd use, 12 weeks after W8). NO threat:
    // the last game of the course is not a trap, and the Raccoon is not in it.
    {
      type: "askRing",
      introTitle: "Ask the Ring",
      introSubtitle: "Graduation night, one photo, and everybody in it gets a say.",
      introIcon: "🤝",
      postLabel: "POST IT",
      leaveOutLabel: "LEAVE THEM OUT",
      dontPostLabel: "DON'T POST IT",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here is the photo, and here is everybody who is in it.",
          "Ask each of them, one at a time, and listen to what they say.",
          "Then do what they asked. That is the whole mission.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Ask everybody first. Then do what they actually said, not what you hoped.",
        ],
      },
      rounds: [
        {
          id: "cap-toss",
          caption: "The whole group, caps in the air",
          photoIcon: "🎓",
          readAloud: "First photo. The whole group with their caps in the air.",
          friends: [
            { id: "f-ada", name: "Ada", answer: "yes", says: "Yes! Put it everywhere, I look brilliant.", readAloud: "Ada says yes, put it everywhere, she looks brilliant." },
            { id: "f-sam", name: "Sam", answer: "yes", says: "Go on then. Tag me in it.", readAloud: "Sam says go on then, tag him in it." },
            { id: "f-ollie", name: "Ollie", answer: "yes", says: "Yeah, that one's good.", readAloud: "Ollie says yes, that one is good." },
          ],
          why: "All three in the group said yes, so up it goes. Asking is not about expecting a no. It is about actually knowing.",
        },
        {
          id: "backstage",
          caption: "Backstage, mid laugh, Maya mid sneeze",
          photoIcon: "📸",
          readAloud: "Second photo. Backstage, everybody laughing, and Maya caught mid sneeze.",
          friends: [
            { id: "g-ada", name: "Ada", answer: "yes", says: "Fine by me!", readAloud: "Ada says fine by her." },
            { id: "g-maya", name: "Maya", answer: "no", noMove: "leaveOut", says: "Ugh, not that one of me. Crop me out?", readAloud: "Maya says not that one of her, and asks to be cropped out.", why: "She asked to be left out and you left her out. No arguing, no persuading, and the photo still goes up.", whyWrong: "Listen to what Maya actually asked for. She did not say do not post it. She said crop me out." },
            { id: "g-sam", name: "Sam", answer: "yes", says: "Ha, post it.", readAloud: "Sam says ha, post it." },
          ],
          why: "Two yeses and one leave me out, so you crop her and post the rest. Everybody got what they asked for.",
        },
        {
          id: "the-certificate",
          caption: "Close up of somebody's certificate, name and address showing",
          photoIcon: "🏆",
          readAloud: "Last photo. A close up of a certificate, with a name and an address showing on it.",
          friends: [
            { id: "h-ollie", name: "Ollie", answer: "no", noMove: "dontPost", says: "That's got my address on it. Please don't.", readAloud: "Ollie says that one has his address on it, and asks you please not to.", why: "His address is in the picture and he asked you not to. That one does not go anywhere, and you did not need to be talked into it.", whyWrong: "Look at what is actually visible on that certificate, and at what Ollie asked for." },
            { id: "h-ada", name: "Ada", answer: "no", noMove: "dontPost", says: "Yeah, don't post that one.", readAloud: "Ada says yes, do not post that one either.", why: "Ada said the same thing about the same photo. A second no does not cancel the first one out, it adds to it.", whyWrong: "Ada said do not post it. That is the same answer Ollie gave, about the same photo." },
            { id: "h-sam", name: "Sam", answer: "no", noMove: "dontPost", says: "Nah, leave that.", readAloud: "Sam says no, leave that one.", why: "Sam said leave it too. Nobody in that photo wanted it up, and you listened to every one of them.", whyWrong: "Sam said leave that one, so that photo stays on your phone with everybody else who said no." },
          ],
          why: "Everybody said no and there is an address in it, so it stays on your phone. That was the easiest decision of the night.",
        },
      ],
      hints: {
        tier1: "Ask everybody in the photo before you do anything with it.",
        tier2: "Leave me out means crop that person. Do not post means the whole photo stays put.",
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three photos, everybody asked, and everybody got what they asked for.",
          "That is it. That is the whole thing, underneath all twenty weeks.",
          "[warmly] You are allowed to check with somebody first. And you never have to do any of this on your own.",
        ],
      },
    },
    // 22 - Prove
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Somebody in your photo says 'leave me out'. Finish the rule: you...",
      choices: [
        { text: "crop them out and post the rest", isCorrect: true },
        { text: "post it anyway, they look fine", isCorrect: false, why: "How they look was never the question. They asked, and asking is the whole point of asking." },
        { text: "do not post any of it, ever", isCorrect: false, why: "They did not say that. Leave me out is a smaller ask than do not post." },
        { text: "ask them again until they agree", isCorrect: false, why: "That is not asking, that is wearing somebody down. They already answered." },
      ],
      praise: "Crop them out and post the rest. ✓",
      nudge: "Think about exactly what Maya asked for backstage.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect.",
          "Leave me out means crop me out. It is a small ask.",
          "Do the thing they actually said.",
          "[warmly] And that is the last power of twenty, Cyber Hero.",
        ],
      },
    },
    // 23 - Recap · Mission 5 of 5 (promises the REVIEW, not the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Every power in twenty weeks rests on one habit: you are allowed to check with somebody first, and you never have to work it out alone.",
      next: "take the stage and play all twenty back",
      emblem: "🤝",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five missions, Cyber Hero. Five out of five, on graduation night.",
          "The vault, the asking, the lever, the photo, and the ring.",
          "[warmly] There is a stage out there and a crowd on it, and they have come to see you.",
          "Next, we'll take the stage and play all twenty back. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: the Encore of Twenty. The old screen-4 signature promoted to
    // the review slot, which is where it always belonged: echoing the six
    // emblems back is a celebration-shaped rehearsal of the whole course.
    // Already tap-only and untimed; it gained its spoken payoff in this rebuild.
    {
      type: "encoreOfTwenty",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] There it is, Cyber Hero. The stage, and everybody you have met all twenty weeks.",
          "The floor is going to light your power emblems up in order. Watch it, then tap them back.",
          "[warmly] Three encores, and the whole place is yours.",
        ],
      },
      threat: {
        raccoonLine: "A STAGE? A crowd? Oh, this is the worst night of my entire life.",
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Listen to them. That is all for you.",
          "Twenty weeks ago you could not have done one of tonight's five missions, and you did all of them without stopping to think.",
          "[excited] Caps in the air, Cyber Hero. You did it.",
        ],
      },
    },

    // 25 - Boss: the last one. He does not escape this time.
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: dawn over the city
    { type: "video", videoPlaceholder: "Week 20: Certified Cyber Hero", videoSrc: "/videos/module-20-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "vault", label: "Vault Opener", accent: "#7eff97", icon: "🔑", summary: "Long beats clever, and an envelope proves nothing." },
        { id: "asking", label: "The Inspector", accent: "#7df0ff", icon: "🔍", summary: "Line the job up against the ask and look at the gap." },
        { id: "money", label: "Lever Puller", accent: "#ffd158", icon: "💎", summary: "The tag is never the price. Read the receipt." },
        { id: "leak", label: "Track Backer", accent: "#c084fc", icon: "🌍", summary: "Alone nothing, together a place and a time." },
        { id: "together", label: "The Asker", accent: "#ff5fb3", icon: "🤝", summary: "You are allowed to check with somebody first." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The vault, the inspection, the lever, the photo,",
          "and the one that matters most of all: asking first.",
          "[laughs] Twenty weeks. He threw the lot at you and not one of them landed.",
          "[excited] Sticker time, Cyber Hero. The last ones!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "vault-opener", name: "Vault Opener", icon: "🔑", description: "Knew every lock without stopping to think." },
        { id: "lever-puller", name: "Lever Puller", icon: "💎", description: "Never once argued with a price tag." },
        { id: "the-asker", name: "The Asker", icon: "🤝", description: "Checks with people first, every time." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#5b76ff",
    theme: {
      topic: "Graduation",
      motifs: ["🎓", "🏆", "🥇", "👑", "🎉", "✨", "🦸", "⭐"],
    },
    intro: {
      slug: "quiz-w20-intro",
      text: "So it all comes down to this, the FINAL EXAM! Every trick I own, sharpened and shined, from week one to week twenty. Pass this and they'll call you a Certified Cyber Hero. Nobody passes. NOBODY!",
    },
    victory: {
      slug: "quiz-w20-victory",
      text: "Passwords, footprints, fake friends, sneaky links... you saw through every single trick in my book, and it's my ONLY book! Take the cape and the seal, Certified Cyber Hero. The city is all yours. I'm retiring to a nice quiet dumpster!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w20-c1",
        key: "quiz-w20-c1-1",
        label: "Strong Passwords & Accounts",
        ask: {
          slug: "quiz-w20-ask-c1-1",
          text: "Final exam, question one! My guessing robot is fully charged. Which password keeps it spinning the longest?",
        },
        options: [
          { text: "Lantern-Cricket-Meadow8!" },
          { text: "Lantern-Lantern-Lantern8!" },
          { text: "L4ntern!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Long AND different wins!",
          explanation: "A short password falls in a blink, and the same word repeated is one pattern away from cracked. Three different random words with a mix sprinkled in keeps a guessing robot busy for ages.",
        },
        villainRight: {
          slug: "quiz-w20-right-c1-1",
          text: "Three DIFFERENT words, all these weeks later?! My robot just handed in its resignation!",
        },
        villainWrong: {
          slug: "quiz-w20-wrong-c1-1",
          text: "Short or samey, my robot chews through both before its batteries even warm up!",
        },
      },
      {
        phaseId: "phase-w20-c2",
        key: "quiz-w20-c2-1",
        label: "Private Info & Footprint",
        ask: {
          slug: "quiz-w20-ask-c2-1",
          text: "A fun quiz app asks for your full name, your school, and your home address to build your hero profile. Which of those does it get?",
        },
        options: [
          { text: "None of them, real-life info stays out of little boxes" },
          { text: "Just the school, since schools are public buildings anyway" },
          { text: "All of them, words in a quiz can't go anywhere" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real-life info stays home!",
          explanation: "Your name, school, and address are real-life clues that point straight to the real you, and typed words CAN travel. A quiz doesn't need any of them. A made-up hero name works fine.",
        },
        villainRight: {
          slug: "quiz-w20-right-c2-1",
          text: "Empty boxes?! I built that adorable quiz myself! Three little boxes, one big map to YOU!",
        },
        villainWrong: {
          slug: "quiz-w20-wrong-c2-1",
          text: "Name, school, address, thank you kindly! My map of you is drawing itself!",
        },
      },
      {
        phaseId: "phase-w20-c3",
        key: "quiz-w20-c3-1",
        label: "Strangers, Scams & Links",
        ask: {
          slug: "quiz-w20-ask-c3-1",
          text: "A player you met TODAY already knows your dog's name and your street, and you never told them. What does that tell you?",
        },
        options: [
          { text: "They've been digging up your info, that's not a safe friend, tell a trusted grown-up" },
          { text: "They're extra clever, and clever players make the best friends" },
          { text: "They must live nearby, so it's fine to keep chatting" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Safe friends don't snoop!",
          explanation: "A real friend learns about you by talking WITH you, not by digging behind your back. Someone who arrives already knowing your private things is a warning sign, and a trusted grown-up should hear about it today.",
        },
        villainRight: {
          slug: "quiz-w20-right-c3-1",
          text: "How did you spot my homework?! Do you know how long it takes to research one dog's name?!",
        },
        villainWrong: {
          slug: "quiz-w20-wrong-c3-1",
          text: "Keep chatting, old pal! I know your dog, your street, and by Friday, your SCHEDULE!",
        },
      },
      {
        phaseId: "phase-w20-c4",
        key: "quiz-w20-c4-1",
        label: "Being Safe & Kind Online",
        ask: {
          slug: "quiz-w20-ask-c4-1",
          text: "A bully posts one mean comment about your drawing, then sits back and waits. What starves the meanness fastest?",
        },
        options: [
          { text: "No reply at all, then block and tell, a reaction is what they're fishing for" },
          { text: "One perfect comeback, so everyone can watch you win" },
          { text: "A polite reply asking them very nicely to stop" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Don't feed the bully!",
          explanation: "A comeback, and even a polite please-stop, are both reactions, and reactions are exactly what a waiting bully eats. No reply, block, and tell a trusted grown-up, and the meanness starves.",
        },
        villainRight: {
          slug: "quiz-w20-right-c4-1",
          text: "You gave them NOTHING?! A bully with no reaction is just a sad little typer in the dark!",
        },
        villainWrong: {
          slug: "quiz-w20-wrong-c4-1",
          text: "Reply, reply! Feed the fire! I'll fetch the marshmallows and the popcorn!",
        },
      },
      {
        phaseId: "phase-w20-c5",
        key: "quiz-w20-c5-1",
        label: "Getting Help & Balance",
        ask: {
          slug: "quiz-w20-ask-c5-1",
          text: "Something online scared you, and a little voice says: keep it secret or you'll get in trouble. What's true?",
        },
        options: [
          { text: "Telling a trusted grown-up is the hero move, and you're never in trouble for telling" },
          { text: "It's safest to wait a week, most scary things fix themselves" },
          { text: "It only counts as worth telling if it happens twice" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Telling is the hero move!",
          explanation: "That little keep-it-secret voice is the trick talking. Scary things shrink the moment a trusted grown-up hears them, and telling never gets you in trouble. Not once, not ever.",
        },
        villainRight: {
          slug: "quiz-w20-right-c5-1",
          text: "You TOLD?! Secrets are my oxygen! I'm wheezing over here!",
        },
        villainWrong: {
          slug: "quiz-w20-wrong-c5-1",
          text: "Keep it secret, keep it simmering! Scared and silent is my favorite flavor of hero!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-20-certified-cyber-hero.png",

  // The finale's attack theatre: his whole playbook at once - every name
  // deliberately echoes a week the child has beaten.
  bossAttacks: [
    { name: "THE FULL HEIST", icon: "💀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Every trick at once", emblemColor: 0xc084fc },
    { name: "PANIC CLOCK", icon: "🔔", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Real life never rushes you", emblemColor: 0xff5fb3 },
    { name: "THE LAST DOOR", icon: "🚪", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "No plaque, no walk-through", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke FINAL fight - the dawn showdown -
  // is designed with the boss batch). Questions sweep the whole course.
  bossQuestions: {
    easy: [
      { question: "An 'URGENT - reset your password in 10 minutes!' message is...", answers: ["A trick - don't tap it", "Real - better reset fast, just to be safe", "From your best friend", "A prize"], correctIndex: 0, explanation: "The panic clock exists to stop you thinking - real games and banks never rush a reset." },
      { question: "A brand-new account says 'let's chat on a different app instead'. That's...", answers: ["The somewhere-else trick - refuse and tell", "Fine - as long as you know the other app", "Totally normal", "A reward"], correctIndex: 0, explanation: "Moving you somewhere quieter is Week 6's oldest flag - real friends are happy where you are." },
      { question: "A machine offers FREE coins if you type your password. You...", answers: ["Never - walk away", "Only if the coins show up first", "Type it fast", "Share it with the lobby"], correctIndex: 0, explanation: "Any ask for your password IS the trap - it wants to BE you, and real free asks for nothing back." },
    ],
    medium: [
      { question: "Which of tonight's posts was safe to share?", answers: ["The dragon drawing", "The school-gates meetup time", "The map-pinned park photo", "The school-name comment"], correctIndex: 0, explanation: "Posting isn't the danger, clues are - proud and clue-free tracks are the good kind." },
      { question: "The full protocol, in order, is...", answers: ["Stop → screenshot → block → tell", "Stop → block → screenshot → tell", "Tap → panic → hide → forget", "Share → like → follow → wave"], correctIndex: 0, explanation: "Give it nothing, freeze the evidence FIRST - blocking can make the message vanish - then slam the door and never carry it alone." },
      { question: "How do you check where a QR code or link-door really goes?", answers: ["Lift the plaque - check the real address before walking through", "Read the words on the sign carefully", "Trust the pretty sign", "Scan it quickly"], correctIndex: 0, explanation: "A link is a door - Week 16's rule holds forever: words can be paint, so no plaque, no walk-through." },
    ],
    hard: [
      { question: "The fake reset email had fastp1ay with a number 1 in the sender. Why does that matter?", answers: ["Lookalike senders wear a real name's costume - one swapped letter is the tell", "It only matters if the link looks strange too", "It loads faster", "It doesn't"], correctIndex: 0, explanation: "Week 4's lookalike lineup: the costume is one character deep, and checking the sender unmasks it." },
      { question: "What makes COACH the graduate's fifth protocol step?", answers: ["Teaching your family makes the firewall outlive tonight", "It replaces TELL once you've graduated", "Graduates skip the other four", "It isn't a real step"], correctIndex: 0, explanation: "Week 19's role-flip folded into Week 11's protocol - powers shared are powers doubled." },
      { question: "Why did Buddy_Blaze2000 fail the Profile Detective's check?", answers: ["Joined yesterday + borrowed photo + fishing-net follows + somewhere-else move", "He asked for a rematch too fast", "Too good at racing", "Online at night"], correctIndex: 0, explanation: "All four Week 3 tells at once - real profiles grow like tree rings, costumes appear overnight. (A rematch in a game you both play is what REAL looks like - Maya asked for one!)" },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.

  // Keyed by SCREEN INDEX (0-29), and there are exactly 30 screens above.
  // The shipped week carried 29 keys for 31 screens, so from index 2 onward
  // every reaction landed on the wrong screen. Counted and re-checked on the
  // rebuild. The 5 recap checkpoints are indices 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 20 - graduation night!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Everything he has, all at once..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the layout." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "excited", message: "Five missions. You know them all." } }, // mission brief
    4: { adam: null, layla: { mood: "thinking", message: "It starts where you started." } }, // learn: vault
    5: { adam: null, layla: { mood: "curious", message: "Four locks. You've done these!" } }, // game: passwordVault
    6: { adam: { mood: "worried", message: "Careful - is he fibbing? Listen close!" }, layla: null }, // prove: lie
    7: { adam: { mood: "excited", message: "Not a moment's hesitation!" }, layla: null }, // recap 1
    8: { adam: { mood: "thinking", message: "What is it ASKING for?" }, layla: null }, // learn: asking
    9: { adam: { mood: "curious", message: "Every window, then decide." }, layla: null }, // game: requestInspector
    10: { adam: null, layla: { mood: "thumbsup", message: "Fair or nosy - how do you tell?" } }, // prove: recall
    11: { adam: null, layla: { mood: "excited", message: "You let the fair one through too!" } }, // recap 2
    12: { adam: null, layla: { mood: "thinking", message: "The tag is never the price." } }, // learn: money
    13: { adam: null, layla: { mood: "curious", message: "Pull the lever on all three!" } }, // game: truePriceLever
    14: { adam: { mood: "thumbsup", message: "Quick - what's the real price?" }, layla: null }, // prove: speed
    15: { adam: { mood: "excited", message: "Fifty coins still in your pocket!" }, layla: null }, // recap 3
    16: { adam: { mood: "thinking", message: "One photo. Four little facts." }, layla: null }, // learn: leak
    17: { adam: { mood: "curious", message: "What does each one TELL him?" }, layla: null }, // game: trackBack
    18: { adam: null, layla: { mood: "thumbsup", message: "Why do four nothings matter?" } }, // prove: recall
    19: { adam: null, layla: { mood: "excited", message: "His map fell apart!" } }, // recap 4
    20: { adam: null, layla: { mood: "thinking", message: "No trick in this one at all." } }, // learn: together
    21: { adam: null, layla: { mood: "curious", message: "Ask everybody. Then do what they said." } }, // game: askRing (no villain)
    22: { adam: { mood: "thumbsup", message: "Finish the leave-me-out rule!" }, layla: null }, // prove: finish
    23: { adam: { mood: "excited", message: "Five out of five. To the stage!" }, layla: null }, // recap 5
    24: { adam: { mood: "excited", message: "Watch it, then play it back!" }, layla: null }, // review: encoreOfTwenty
    25: { adam: { mood: "worried", message: "Last one ever. Finish it." }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Dawn over the city. You did it!" } }, // outro video
    27: { adam: null, layla: { mood: "thumbsup", message: "Twenty weeks. Look at all of it." } }, // debrief
    28: { adam: { mood: "excited", message: "The last stickers, Cyber Hero!" }, layla: null }, // stickers
    29: { adam: { mood: "thumbsup", message: "CERTIFIED CYBER HERO!" }, layla: null }, // completion
  },
};

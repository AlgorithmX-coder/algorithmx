import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 18 - Sharing Devices: Lock Before You Leave
 *
 * Rebuilt to the Learn-Loop Build Standard. 30 screens:
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 RACK      most screens are shared            | hookSort      | recall
 *     2 RELAY     close, log out, lock, LOOK BACK    | logOutFlick   | speed
 *     3 DOOR      every screen needs a front door    | buttonHunt    | lie
 *     4 SHELF     other people's things              | whoseIsIt     | recall
 *     5 BALLOON   do not let it remember you         | replyCards    | finish
 *   review (stepOrder) -> boss -> video -> debrief -> stickers -> done
 *
 * WHAT THE REBUILD FIXED. The shipped week had 31 screens and OPENED ON A GAME
 * (the old screen-4 Log Out Flick), against the owner's rule. Its `reactions`
 * map carried 29 keys for those 31 screens, so from index 2 onward every
 * reaction landed on the wrong screen. Both are gone: 30 screens, 30 keys,
 * counted, and the week opens on a Learn.
 *
 * ENGINES. Only ONE is new this week, because for once the library genuinely
 * had the right shapes free:
 *   hookSort     RE-THEMED on a NEW "rack" skin (3rd and final use of the
 *                twenty weeks). Cool slate and steel, nothing like Week 14's
 *                lamp-lit evening room four weeks earlier.
 *   logOutFlick  CONVERTED from this week's drag signature, now tap-only. The
 *                original wanted a press-and-swipe-down flick, a gesture with a
 *                velocity threshold, so a child who could not flick could not
 *                finish. The sweep, the door light, the goblin paw and the
 *                look-back all survive intact.
 *   buttonHunt   FREE (no rebuilt week uses it) and earmarked for this slot
 *                since Week 6. Gained a `threat` and a spoken `completeNarration`
 *                in this PR: it had neither, so its games ended in silence.
 *   whoseIsIt    NEW. Name the OWNER of a thing on the shared shelf. Answering
 *                with a person rather than a yes or a no is the whole design.
 *   replyCards   RE-THEMED on its existing "balloons" skin (3rd and final use).
 *   stepOrder    RE-THEMED on a NEW "rail" skin for the review (3rd and final
 *                use). The review is a SEQUENCE, which no other week's is, and
 *                it is the right shape because this week's lesson IS an order.
 *
 * LANE. Concept 3 is HAVING a lock, never password strength: that is Week 1's
 * ground and the Button Hunt never asks what a good code looks like, only where
 * the lock lives. Concept 5 is the save-password prompt on somebody else's kit,
 * not password reuse. Device ears were Week 14, account privacy Week 17, app
 * permissions Week 9.
 *
 * WARMTH NOTE. Beat 4 is an empathy beat, so the villain stays OFF it entirely
 * (the W5 and W11 precedent): no `threat` on its game, and no raccoon in its
 * recap. It is also deliberately NOT a temptation game. Nothing dares the child
 * or tells them nobody would know, because that frames privacy as a test of
 * willpower they might one day fail. On the shelf it is simply a fact: most
 * things are not yours.
 *
 * TONE. Never "shared devices are dangerous". A family tablet is a lovely thing
 * and the week ends with the child using one confidently, not avoiding it.
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

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-18.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon does not need to crack anything this week. He just waits. A family tablet left signed in on the kitchen shelf, a school computer still wearing the last kid's name, SAVE PASSWORD balloons bobbing over every login. Every left open screen is a door he can stroll through wearing YOUR face. This week you become the Lock Master: spot which screens are shared, close down like a relay runner, find the front door on any device, leave other people's things alone, and pop every sticky balloon.",
      photoCaption: "Wk 18 - The Family Tablet",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, check the shelf, then read this incident report with me.",
          "The Raccoon does not need to crack anything this week. He just waits. A family tablet left signed in on the kitchen shelf, SAVE PASSWORD balloons bobbing over every login. Every left open screen is a door he can stroll through wearing YOUR face.",
          "This week you become the Lock Master, and learn to close a door behind you.",
          "[whispers] He does not crack anything. He just waits for somebody to walk away.",
          "[warmly] By the end of today, you will never leave a door open behind you again.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[18] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know which screens you are only borrowing",
        "Close down, lock up, then LOOK BACK",
        "Never let a borrowed screen remember you",
      ],
    },

    /* ─────────── BEAT 1 · WHOSE SCREEN IS THIS ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Most Screens Are Shared",
      content:
        "Count the screens you used this week. The family tablet, the computer at school, Grandma's phone when you wanted a photo, the console in the living room. Now count how many of those are only yours. Probably none of them. That is completely normal and nothing to worry about, but it does change one thing: on a screen you are only borrowing, you are a visitor. Visitors are brilliant guests. They tidy up after themselves and they leave the place as they found it.",
      bullets: [
        "Nearly every screen is a shared one",
        "Borrowing a screen is completely normal",
        "On a shared screen you are a visitor",
        "Visitors tidy up after themselves",
        "Leave it as you found it",
      ],
      bulletIcons: ["📱", "👪", "🏠", "🔀", "👍"],
      emblem: "📱",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Quick question, Cyber Hero. How many screens did you use this week?",
          "The tablet at home. The computer at school. Somebody's phone when you wanted a photo.",
          "[thinking] Now the harder one. How many of those are only YOURS? Probably none of them.",
          "That is completely normal. It just means you are a visitor on most screens you touch.",
          "And visitors are brilliant guests. They tidy up, and they leave a place as they found it.",
          "[excited] Come and sort a whole rack of them with me!",
        ],
      },
    },
    // 5 - Game: RACK (HookSort, NEW "rack" skin).
    // isScam TRUE means the CUT call, which in this skin is SHARED. Sarah
    // speaks readAloud, why and explanation; `text` stays on screen.
    {
      type: "hookSort",
      skin: "rack",
      introTitle: "The Charging Rack",
      introSubtitle: "Screens on the rack, one at a time. Shared, or just yours?",
      introIcon: "📱",
      askPrompt: "Whose screen is this one?",
      cutLabel: "SHARED",
      reelLabel: "JUST MINE",
      cutBinLabel: "SHARED SCREENS",
      reelBinLabel: "MINE ALONE",
      cutToast: "SHARED!",
      reelToast: "YOURS!",
      progressNoun: "sorted",
      wrongScamTitle: "Have another look at that one",
      wrongRealTitle: "Have another look at that one",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is the charging rack, and there is a screen on it.",
          "Read what it says, then send it to one of the two shelves underneath.",
          "Shared, if anybody else in the world uses it. Just mine, if truly nobody else ever does.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "One question sorts every one of them. Does ANYBODY else ever touch this?",
        ],
      },
      threat: {
        raccoonLine: "Oh, I love a shared screen. Everyone assumes somebody ELSE tidied it up. Nobody ever does!",
      },
      items: [
        {
          id: "family-tablet",
          text: "The tablet on the kitchen shelf that everyone uses",
          icon: "📱",
          isScam: true,
          readAloud: "First up. The tablet that lives on the kitchen shelf, and everyone in the house uses it.",
          why: "Everyone in the house picks that one up, so everything you leave on it is sitting there for the next person.",
          explanation: "Read it again. It says everyone uses it, and that is the whole test.",
        },
        {
          id: "school-pc",
          text: "The computer at school you sit at on Tuesdays",
          icon: "🏫",
          isScam: true,
          readAloud: "Next one. The computer at school, the one you sit at on Tuesdays.",
          why: "A different child sits there on every other day of the week, so it is about as shared as a screen gets.",
          explanation: "Think about Wednesday. Somebody else is sitting at that exact computer.",
        },
        {
          id: "my-locked-phone",
          text: "Your own phone, with your own lock code on it",
          icon: "🔒",
          isScam: false,
          readAloud: "Here is one of yours. Your own phone, with your own lock code on it.",
          why: "Your phone with your code on it really is yours alone, and it is fine to be relaxed on that one.",
          explanation: "Look at what it says. Your phone, your code, and nobody else has either.",
        },
        {
          id: "gran-phone",
          text: "Grandma's phone, borrowed to take one photo",
          icon: "👪",
          isScam: true,
          readAloud: "Now this one. Grandma's phone, borrowed for one quick photo.",
          why: "It goes straight back in Grandma's pocket, so anything you left signed in goes with it.",
          explanation: "Ask yourself whose pocket that phone ends up in. Not yours.",
        },
        {
          id: "living-room-console",
          text: "The games console in the living room",
          icon: "🎮",
          isScam: true,
          readAloud: "And this one. The games console in the living room.",
          why: "Everyone who sits on that sofa can play as whoever is still logged in, and that is usually you.",
          explanation: "Picture who else sits on that sofa. They can play as whoever is still signed in.",
        },
        {
          id: "my-diary-app",
          text: "Your notebook, the paper one under your bed",
          icon: "📋",
          isScam: false,
          readAloud: "Last one, and it is not a screen at all. Your paper notebook, the one under your bed.",
          why: "No screen, no login and no next person. Some things really are just yours, and that is lovely.",
          explanation: "Have another look. There is no screen there at all, and nobody else has it.",
        },
      ],
      hints: {
        tier1: "Ask one question about each one. Does anybody else ever touch this?",
        tier2: "If it lives anywhere but your own pocket, somebody else uses it. That makes it shared.",
      },
      completeTitle: "Rack sorted!",
      completeLine: "Nearly all of them shared, Cyber Hero. That is normal, and now you know which is which.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at those two shelves. Nearly everything went on the shared side.",
          "That is not a problem. That is just what screens are like.",
          "[warmly] It only means one thing: on most screens you touch, you are a visitor. So let's learn how a good visitor leaves.",
        ],
      },
    },
    // 6 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What makes a screen a SHARED one?",
      choices: [
        { text: "Anybody else ever uses it", isCorrect: true },
        { text: "It is old", isCorrect: false, why: "Age has nothing to do with it. A brand new tablet on the kitchen shelf is shared from day one." },
        { text: "It does not have games on it", isCorrect: false, why: "What is on a screen does not change who else picks it up." },
        { text: "It belongs to a grown-up", isCorrect: false, why: "Close, but a screen your brother uses is shared too, and he is not a grown-up." },
      ],
      praise: "Anybody else ever uses it. ✓",
      nudge: "Think about the one question that sorted the whole rack.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it!",
          "Not who owns it, not how old it is.",
          "Just whether anybody else ever picks it up.",
          "[warmly] And on nearly every screen, somebody does.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Nearly every screen you use is shared, which makes you a visitor on it, and visitors leave a place as they found it.",
      next: "exactly how a good visitor leaves a screen",
      emblem: "📱",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You can spot a shared screen across a room now.",
          "Borrowed screen, visitor rules. Simple as that.",
          "[whispers] Although... he did say nobody ever tidies up after themselves...",
          "Next, we'll learn exactly how a good visitor leaves a screen. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · LOCK BEFORE YOU LEAVE ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Close, Lock, Look Back",
      content:
        "Leaving a shared screen is four moves, always in the same order. Close everything you opened. Log out so it stops wearing your name. Lock the screen. Then look back and check one more time, because a shared screen can change behind you while you are putting your shoes on. That last move is the one almost everybody skips, and it is the one that catches the thing you missed.",
      bullets: [
        "Close everything you opened",
        "Log out so it stops being you",
        "Lock the screen",
        "Then LOOK BACK and check again",
        "The look back catches what you missed",
      ],
      bulletIcons: ["🗑️", "🚪", "🔒", "👀", "✅"],
      emblem: "🔒",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Right. Here is how a good visitor leaves a screen. It is four moves, always the same order.",
          "Close everything you opened. Log out, so it stops wearing your name.",
          "Lock the screen. And then, Cyber Hero, look back and check one more time.",
          "[thinking] That last one is the bit almost everybody skips.",
          "A shared screen can change behind you while you are still putting your shoes on.",
          "[excited] Come and clear a tablet with me. You'll see exactly what I mean!",
        ],
      },
    },
    // 9 - Game: RELAY (LogOutFlick, the converted signature, TAP-ONLY).
    // A ritual, not a quiz: the only judged tap is locking over open cards. The
    // goblin arrives after a CORRECT lock, every time, scripted.
    {
      type: "logOutFlick",
      introTitle: "Lock Before You Leave",
      introSubtitle: "The shared tablet is covered in your open cards. Close every one, then lock it.",
      introIcon: "🔒",
      tabletLabel: "THE SHARED TABLET",
      lockLabel: "LOCK IT AND GO",
      lockedLabel: "LOGGED OUT",
      openCountLabel: "STILL OPEN",
      greenLabel: "GREEN: SAFE TO LEAVE",
      amberLabel: "AMBER: LOOK BACK",
      redLabel: "RED: STILL OPEN",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Break is over and look at the state of this tablet. Your cards, all over it.",
          "Tap every open card to log it out. Then press the big lock and off you go.",
          "Keep an eye on the little light at the top. It tells you the truth about this tablet.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Every card that is still bright is still open. Tap them all before you lock.",
        ],
      },
      threat: {
        raccoonLine: "Off you pop, hero! Don't look back! Nobody EVER looks back. That's my favourite part.",
      },
      cards: [
        { id: "game", label: "Game", detail: "Still signed in as you", icon: "🎮", logOut: "Game logged out. Now nobody can play as you." },
        { id: "message", label: "Message", detail: "Half written, still open", icon: "💬", logOut: "Message closed. Your words stay yours." },
        { id: "photos", label: "Photos", detail: "Your whole gallery, open", icon: "📸", logOut: "Gallery closed. Your pictures are private again." },
        { id: "homework", label: "Homework", detail: "Your name across the top", icon: "📋", logOut: "Homework closed. That was your work with your name on it." },
      ],
      lockWhy: "Every card shut and the tablet locked. That is a properly clean leave.",
      earlyLockExplanation: "Look at the tablet before you lock it. There are cards still lit up, and locking now leaves every one of them open underneath.",
      goblinLine: "Hang on. Something just opened up again behind you.",
      lookBackWhy: "You turned round and caught it. That is the move almost everybody skips.",
      hints: {
        tier1: "A bright card is an open card. Tap it to log it out.",
        tier2: "The light at the top goes green only when the tablet is genuinely clear. Lock it then.",
      },
      completeTitle: "Locked and safe!",
      completeLine: "Close, lock, then look back, Cyber Hero. That last bit is the one that counts.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Now THAT is how a visitor leaves a screen.",
          "And did you see what happened? You had done everything right, and one thing still opened up behind you.",
          "[warmly] That was never your fault. It is just what shared screens do. Which is exactly why we look back.",
        ],
      },
    },
    // 10 - Prove
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "You have closed everything and locked the shared tablet. What is the LAST move?",
      choices: [
        { text: "Look back and check it one more time", isCorrect: true },
        { text: "Nothing, you are finished", isCorrect: false, why: "Almost. One card had opened up behind you last time, remember?" },
        { text: "Turn the tablet off at the wall", isCorrect: false, why: "You do not need to. A locked screen is already a shut front door." },
        { text: "Tell everyone you locked it", isCorrect: false, why: "Nobody needs telling. The looking back is the bit that actually helps." },
      ],
      praise: "Look back and check it one more time. ✓",
      nudge: "Think about the goblin paw. When did it strike?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight to it!",
          "Close, log out, lock, and then LOOK BACK.",
          "Four moves, every single time, and the fourth is the one that catches things.",
          "[warmly] It takes about two seconds.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Leaving a shared screen is close, log out, lock, then look back, and the looking back is what catches whatever you missed.",
      next: "where the lock actually lives on any screen you meet",
      emblem: "🔒",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers down, Cyber Hero. You leave a screen like a proper guest now.",
          "Close it, lock it, and always that one look over your shoulder.",
          "[whispers] But hang on. What if you pick up a screen that has no lock on it at all...",
          "Next, we'll learn where the lock actually lives on any screen you meet. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE FRONT DOOR ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Every Screen Needs a Front Door",
      content:
        "A lock screen is a front door. It is not about whether your code is clever, it is about whether the door exists at all, because a screen with no lock is a house with the door standing open. Every device has one, and it is always in the same sort of place: in Settings, under a word like Lock, Screen Lock or Passcode. Knowing where to find it means you can put a front door on anything, including the tablet the whole family shares.",
      bullets: [
        "A lock screen is a front door",
        "No lock means the door stands open",
        "Every device has one somewhere",
        "It lives in Settings, under Lock",
        "Find the door, and you can shut it",
      ],
      bulletIcons: ["🚪", "🔓", "📱", "⚙️", "🔒"],
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] So here is a thing worth knowing. A lock screen is a front door.",
          "And this is not about whether your code is clever. We did clever codes ages ago.",
          "This is about whether the door is THERE at all. A screen with no lock is a house with the door wide open.",
          "[warmly] Every single device has one, and it always hides in the same sort of spot.",
          "In Settings, under a word like Lock, or Screen Lock, or Passcode.",
          "[excited] Come and hunt one down with me!",
        ],
      },
    },
    // 13 - Game: DOOR (ButtonHunt, free engine, earmarked for this slot since
    // W6). LANE: this never asks what a GOOD code looks like (Week 1's ground),
    // only where the lock lives.
    {
      type: "buttonHunt",
      menuTitle: "FAMILY TABLET · SETTINGS",
      scenario: "The family tablet has no lock on it at all. Find the two buttons that put a front door on it.",
      introTitle: "Find the Front Door",
      introSubtitle: "Settings is a big menu. The lock is in there somewhere, and so is the switch that turns it on.",
      introIcon: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here we are, deep in the tablet's settings. Look at all these buttons.",
          "Two of them put a front door on this tablet. The rest do something else entirely.",
          "Find SCREEN LOCK first, then the switch that actually turns it on.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Read the buttons, do not guess. The right one has the word LOCK in it.",
        ],
      },
      threat: {
        raccoonLine: "No lock on this one! I can walk straight in. Don't go poking about in those settings, hero.",
      },
      buttons: [
        { id: "screen-lock", label: "Screen Lock", icon: "🔒", targetOrder: 1, note: "This is the front door itself. Everything about locking this tablet lives in here." },
        { id: "require-code", label: "Require Code to Unlock", icon: "🔐", targetOrder: 2, note: "And this is the switch that actually shuts the door. Without it the lock is only decoration." },
        { id: "wallpaper", label: "Wallpaper", icon: "🎨", note: "That changes the picture behind everything. Lovely, but it locks nothing." },
        { id: "brightness", label: "Brightness", icon: "💡", note: "That makes the screen brighter or dimmer. A bright screen is just as open as a dim one." },
        { id: "sound", label: "Sound", icon: "🔔", note: "That is the volume. It will not stop anybody picking the tablet up." },
        { id: "storage", label: "Storage", icon: "🧱", note: "That shows how full the tablet is. Useful one day, no help at the front door." },
        { id: "language", label: "Language", icon: "🌍", note: "That changes what language the buttons are in. The door would still be open, just in French." },
        { id: "about", label: "About This Tablet", icon: "❓", note: "That tells you what model it is. Nothing in there shuts a door." },
      ],
      hints: {
        tier1: "You are looking for the word LOCK. Read every button rather than guessing.",
        tier2: "Two buttons, in order: find Screen Lock first, then the switch that says the code is required.",
      },
      completeTitle: "Front door fitted!",
      completeLine: "Now that tablet has a door, Cyber Hero. And you could find it on any device in the world.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] There it is. Screen Lock, then the switch that makes it mean something.",
          "That tablet has a front door on it now, and it did not have one five minutes ago.",
          "[warmly] And here is the good bit. It is in the same sort of place on every device you will ever pick up.",
        ],
      },
    },
    // 14 - Prove
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon says: 'A lock screen is pointless, anyone clever can get past it!' Is he right?",
      choices: [
        { text: "No. A shut door stops nearly everyone who walks past", isCorrect: true },
        { text: "Yes, so there is no point having one", isCorrect: false, why: "That is exactly what he wants you to think. An open door stops nobody at all." },
        { text: "Yes, unless your code is really long", isCorrect: false, why: "This is not about the code. It is about whether there is a door there to begin with." },
        { text: "Yes, locks are only for phones", isCorrect: false, why: "Tablets, computers and consoles all have one, and all of them need it." },
      ],
      praise: "No. A shut door stops nearly everyone who walks past. ✓",
      nudge: "Think about a real front door. Does it have to be unbreakable to be worth shutting?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] You saw through that one!",
          "He would love you to leave the door open because a door is not perfect.",
          "Nearly everybody who picks up a tablet just puts it down again when it is locked.",
          "[warmly] A shut door does its job.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A lock screen is a front door, it lives in Settings under a word like Lock, and having one at all matters more than how clever the code is.",
      next: "what to do about all the things on a shared screen that are not yours",
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers down, Cyber Hero. You can fit a front door to anything now.",
          "Settings, then Lock. Same sort of place on every device there is.",
          "[thinking] Now. A shared screen has other people's doors on it too...",
          "Next, we'll learn what to do about all the things on a shared screen that are not yours. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · OTHER PEOPLE'S THINGS ─────────── */
    // EMPATHY BEAT: the villain is OFF it entirely (the W5 and W11 precedent).
    // No `threat` on the game, no raccoon in the recap. It is also NOT a
    // temptation game: nothing dares the child or says nobody would know.
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Other People's Things",
      content:
        "A shared screen is a shelf with everybody's things on it. Your brother's messages, Dad's email, Mum's photos, and somewhere in there, yours. Here is the question that sorts the whole shelf out, and it comes BEFORE any other question: whose is this? Once you know the answer, you already know what to do. Yours means carry on. Somebody else's means leave it exactly as you found it, because on the other end of every one of those things is a person who would mind.",
      bullets: [
        "A shared screen holds everyone's things",
        "Ask whose it is BEFORE anything else",
        "Yours means carry on",
        "Theirs means leave it as you found it",
        "There is a person on the other end",
      ],
      bulletIcons: ["🏠", "❓", "👍", "🙈", "👪"],
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Think of a shared tablet as a shelf, Cyber Hero. Everybody's things are on it.",
          "Your brother's messages. Dad's email. Mum's photos. And somewhere in the middle, yours.",
          "[thinking] There is one question that sorts the whole shelf, and it comes before every other question.",
          "Whose is this? That is it. That is the whole thing.",
          "Because once you know the answer, you already know what to do about it.",
          "[excited] Come and go along the shelf with me!",
        ],
      },
    },
    // 17 - Game: SHELF (WhoseIsIt, NEW). The answer is a PERSON, not a yes or
    // a no, because that is what puts somebody on the other end of it. NO
    // `threat`: the villain is off this beat.
    {
      type: "whoseIsIt",
      introTitle: "Other People's Things",
      introSubtitle: "A shared tablet is everybody's shelf. Before you touch anything, ask whose it is.",
      introIcon: "👪",
      shelfLabel: "ON THE SHARED SHELF",
      askPrompt: "Whose is this?",
      tagsLabel: "THE NAME TAGS",
      counterLabel: "Thing",
      mineLabel: "YOURS. GO AHEAD!",
      theirsLabel: "LID DOWN",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here is the shelf, and here are the name tags for everyone in the house.",
          "One thing comes up at a time. Have a proper look at it, then tap whose it is.",
          "If it belongs to somebody else the lid closes itself. If it is yours, it stays open for you.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Read the little line underneath. It always tells you whose thing you are looking at.",
        ],
      },
      owners: [
        { id: "me", label: "Me", icon: "🦸", isChild: true },
        { id: "sam", label: "Sam", icon: "👤" },
        { id: "dad", label: "Dad", icon: "👪" },
        { id: "gran", label: "Gran", icon: "🏠" },
      ],
      things: [
        {
          id: "sam-messages",
          label: "A chat, half open",
          detail: "Sam was talking to his football team",
          icon: "💬",
          readAloud: "First thing on the shelf. A chat, still half open, about a football team.",
          ownerId: "sam",
          why: "Sam would go pink if he knew somebody had read that. Lid down, and he never has to feel it.",
          explanation: "Look at the line underneath. It says who was doing the talking.",
        },
        {
          id: "my-drawing",
          label: "A drawing app",
          detail: "Your half finished dragon is still on it",
          icon: "🎨",
          readAloud: "Next. A drawing app, with a half finished dragon sitting in it.",
          ownerId: "me",
          why: "That dragon is yours, so off you go and finish the wings. Nobody minds at all.",
          explanation: "Read it again. Whose half finished dragon is that?",
        },
        {
          id: "dad-email",
          label: "An email, open",
          detail: "About work, from somebody called Ravi",
          icon: "📧",
          readAloud: "Now this one. An email, open, about work, from somebody called Ravi.",
          ownerId: "dad",
          why: "Grown-up work post is nobody's business but the grown-up's. Dad would want that lid down without even being asked.",
          explanation: "Who in this house gets work emails? That is your answer.",
        },
        {
          id: "gran-photos",
          label: "A photo album",
          detail: "Old pictures, scanned in last summer",
          icon: "📸",
          readAloud: "Here is a photo album. Old pictures, scanned in last summer.",
          ownerId: "gran",
          why: "Gran scanned every one of those herself. She would love to show you, and that is different from you helping yourself.",
          explanation: "Think about who scans in old photographs. It is usually the person who was in them.",
        },
        {
          id: "my-homework",
          label: "A homework folder",
          detail: "Your name is across the top of it",
          icon: "📋",
          readAloud: "And the last thing on the shelf. A homework folder, with a name across the top.",
          ownerId: "me",
          why: "Your name, your homework, your folder. Open it up whenever you like.",
          explanation: "Have a proper look at the name written across the top of it.",
        },
      ],
      hints: {
        tier1: "Read the little line under the thing. It always names the person somewhere.",
        tier2: "Work post is Dad's. Old scanned photographs are Gran's. Football chat is Sam's. Anything with your own name on it is yours.",
      },
      completeTitle: "Shelf sorted!",
      completeLine: "Whose is this, Cyber Hero. Ask that first and the rest works itself out.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Five things on that shelf, and you found a person behind every single one.",
          "Two of them were yours and you went straight ahead, which is exactly right.",
          "[warmly] And the other three got their lids put down by somebody kind. That is all respect really is.",
        ],
      },
    },
    // 18 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "You pick up the family tablet and your sister's messages are open on it. What is the question to ask?",
      choices: [
        { text: "Whose is this?", isCorrect: true },
        { text: "Is it interesting?", isCorrect: false, why: "How interesting it is has nothing to do with whether it is yours to read." },
        { text: "Would anybody find out?", isCorrect: false, why: "That question is about not being caught. The kind question is about whose it is." },
        { text: "Is it important?", isCorrect: false, why: "Important or silly, it still belongs to your sister either way." },
      ],
      praise: "Whose is this? ✓",
      nudge: "Which question came BEFORE all the others on the shelf?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's the one!",
          "Whose is this. Before anything else, every time.",
          "And when the answer is somebody else, the lid goes down.",
          "[warmly] Not because of a rule. Because there is a person on the other end.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5 (villain stays off this beat)
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "A shared screen holds everybody's things, and the question that sorts it is whose is this, asked before any other question.",
      next: "the one thing you must never let a borrowed screen do",
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers down, Cyber Hero. You put three lids down today and nobody ever had to ask you.",
          "Whose is this. It is such a small question and it settles everything.",
          "[thinking] Now there is one last thing a borrowed screen tries to do, and it is very sneaky indeed...",
          "Next, we'll learn the one thing you must never let a borrowed screen do. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE SAVE PASSWORD BALLOON ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Don't Let It Remember You",
      content:
        "You log in on the family tablet and a little balloon pops up: shall I remember this password for you? On your own device, with your own lock on it, that is a fair offer. On a borrowed one it is the worst idea in the world, because it means the next person who picks it up is already you. They do not need your password. The tablet hands it over for them. So on anything shared, the answer is always the same: no thank you.",
      bullets: [
        "Borrowed screens offer to remember you",
        "Saying yes makes the next person YOU",
        "They never even see your password",
        "On shared kit the answer is no thank you",
        "On your own locked device it is fine",
      ],
      bulletIcons: ["💬", "🎭", "🔓", "🚫", "👍"],
      emblem: "🎈",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Last one, Cyber Hero, and it is the sneakiest of the lot.",
          "You log in on a borrowed tablet and a little balloon floats up. Shall I remember this for you?",
          "[warmly] On your own device, with your own lock on it, that is a perfectly fair offer.",
          "But on a borrowed one? Saying yes means the next person who picks it up is already you.",
          "They never even see your password. The tablet just hands it straight over.",
          "[excited] Come and answer some balloons with me!",
        ],
      },
    },
    // 21 - Game: BALLOON (ReplyCards, "balloons" skin, 3rd and final use).
    // LANE: this is the save-password prompt on borrowed kit, never password
    // strength (W1) and never password reuse.
    {
      type: "replyCards",
      skin: "balloons",
      introTitle: "The Save Password Balloons",
      introSubtitle: "A balloon floats up every time you log in. Pick the answer that fits the screen you are on.",
      introIcon: "🎈",
      deviceLabel: "THE SCREEN YOU ARE ON",
      situationLabel: "THE BALLOON ASKS",
      airLabel: "ANSWERED",
      pickLabel: "Pick your answer",
      roundNoun: "Balloon",
      correctToast: "POPPED IT!",
      wrongTitle: "Have another look at whose screen that is",
      scoreNoun: "answered",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here come the balloons. One floats up every time somebody logs in somewhere.",
          "Look at WHICH SCREEN it is first. That is the only thing that changes the answer.",
          "Then pick what you would say back to it.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Same balloon every time. The answer depends entirely on whose screen it popped up on.",
        ],
      },
      threat: {
        raccoonLine: "Say yes! Go on, say yes! It's SO much quicker next time. For me, mostly.",
      },
      rounds: [
        {
          id: "school-pc",
          from: "The school computer",
          fromIcon: "🏫",
          message: "Save your password on this computer?",
          readAloud: "First balloon. You are on the school computer, and it wants to save your password.",
          replies: [
            { text: "No thank you", isSafe: true, why: "A different child sits there tomorrow, and saying yes would have handed them your account.", explanation: "Think about who sits at that computer tomorrow. Saving it makes them you." },
            { text: "Yes, it is quicker", isSafe: false, explanation: "Quicker for you once, and quicker for every other child who sits down there afterwards." },
            { text: "Yes, but only for today", isSafe: false, explanation: "There is no only for today button. Once it is saved it stays saved." },
          ],
        },
        {
          id: "my-phone",
          from: "Your own phone",
          fromIcon: "🔒",
          message: "Save your password on this phone?",
          readAloud: "Second balloon. This time you are on your own phone, the one with your lock code on it.",
          replies: [
            { text: "Yes, this one is mine", isSafe: true, why: "Your phone, your lock code, nobody else gets in. That is exactly what saving is for.", explanation: "Look at which screen this is. It is your own, with a lock on it." },
            { text: "No, never anywhere", isSafe: false, explanation: "Never anywhere is a bit strict. On your own locked phone it is genuinely fine." },
            { text: "Only if Mum says so", isSafe: false, explanation: "Lovely manners, but on your own locked phone this one really is your call." },
          ],
        },
        {
          id: "family-tablet",
          from: "The family tablet",
          fromIcon: "📱",
          message: "Save your password on this tablet?",
          readAloud: "Third balloon. Now you are on the family tablet, the one from the kitchen shelf.",
          replies: [
            { text: "No thank you", isSafe: true, why: "Everyone in the house picks that tablet up, so a saved password would let any of them be you.", explanation: "Who else picks up the family tablet? All of them, and a saved password lets any of them in." },
            { text: "Yes, it is only family", isSafe: false, explanation: "Family is lovely, but the tablet cannot tell family from anybody else who picks it up." },
            { text: "Yes, nobody else uses it", isSafe: false, explanation: "It is the family tablet. Everybody uses it, which is what makes it the family tablet." },
          ],
        },
        {
          id: "gran-phone",
          from: "Grandma's phone",
          fromIcon: "👪",
          message: "Save your password on this phone?",
          readAloud: "Last balloon. You have borrowed Grandma's phone for one photo, and up it floats again.",
          replies: [
            { text: "No thank you", isSafe: true, why: "That phone goes home in Gran's pocket, and anything saved on it goes with her.", explanation: "Whose pocket does that phone go home in? Anything saved on it travels too." },
            { text: "Yes, Gran would not mind", isSafe: false, explanation: "She would not mind at all, and that is not the problem. The problem is that your account leaves the house." },
            { text: "Yes, it is only one photo", isSafe: false, explanation: "The photo takes a second. The saved password stays on that phone for good." },
          ],
        },
      ],
      hints: {
        tier1: "Look at the top of the card first. Which screen is the balloon floating over?",
        tier2: "Borrowed screen, always no thank you. Your own locked device, yes is fine.",
      },
      completeTitle: "Every balloon popped!",
      completeLine: "Yours means yes, borrowed means no thank you. That is the whole rule, Cyber Hero.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four balloons, and you answered every one of them by looking at the screen first.",
          "Your own locked phone got a yes. Everything borrowed got a no thank you.",
          "[warmly] And that is the last of the five. Let's put the whole lot together.",
        ],
      },
    },
    // 22 - Prove
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "The school computer asks if it should remember your password. Finish the rule: on a borrowed screen...",
      choices: [
        { text: "the answer is always no thank you", isCorrect: true },
        { text: "the answer is yes if you are in a hurry", isCorrect: false, why: "Being in a hurry is exactly when it happens, which is why the rule has no exceptions in it." },
        { text: "the answer is yes if you trust the people", isCorrect: false, why: "The screen cannot tell who it is handing your account to. It just hands it over." },
        { text: "the answer depends on the password", isCorrect: false, why: "It makes no difference how good the password is if the screen types it in for somebody else." },
      ],
      praise: "On a borrowed screen, the answer is always no thank you. ✓",
      nudge: "Think about what saying yes does to the NEXT person who sits down.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect!",
          "Borrowed screen, no thank you. Every single time, no exceptions.",
          "Because saying yes does not just save YOU time.",
          "[warmly] It makes the next person you.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the REVIEW, not the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "A borrowed screen offering to remember your password always gets no thank you, because saying yes makes the next person you.",
      next: "put all five together into the routine you do every time",
      emblem: "🎈",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers down, Cyber Hero. Every single one of them earned.",
          "Shared screens spotted, a clean leave, a front door fitted, lids put down, balloons popped.",
          "[warmly] Now here is the best bit. All five of those happen in an order.",
          "Next, we'll put them together into the routine you do every time. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: the whole week as one ORDERED routine (StepOrder, new "rail"
    // skin, 3rd and final use). No other week's review is a sequence, and it is
    // the right shape here because this week's lesson IS an order. `speakSteps`
    // makes Sarah read each affirmation as it lands.
    {
      type: "stepOrder",
      skin: "rail",
      introTitle: "The Lock Master's Routine",
      introSubtitle: "Six moves, in the right order, every time you finish on a screen that is not yours.",
      introIcon: "🗝️",
      pathLabel: "THE ROUTINE",
      speakSteps: true,
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last job of the week, Cyber Hero, and it is the one that ties the lot together.",
          "Six moves. They are all things you already know how to do.",
          "Put them on the rail in the order you would actually do them, from the moment you sit down.",
        ],
      },
      threat: {
        raccoonLine: "Six whole moves?! Nobody does six moves. People do about one and a half. That's my entire business model!",
      },
      whyWrong: "Not quite that one yet. Think about what you would actually be doing at that moment, from sitting down to walking away.",
      steps: [
        { id: "notice", text: "Notice the screen is not yours", icon: "📱", affirmation: "First move. You spotted it was a borrowed screen before you touched anything." },
        { id: "no-save", text: "Tell the balloon no thank you", icon: "🎈", affirmation: "Second. A borrowed screen, so when the balloon asked, you said no thank you." },
        { id: "lids", text: "Leave other people's things shut", icon: "👪", affirmation: "Third. You said no to the balloon, and you left everything that was not yours alone too." },
        { id: "logout", text: "Close your cards and log out", icon: "🚪", affirmation: "Fourth. What WAS yours, you closed, and your name came off the screen." },
        { id: "lock", text: "Lock the screen", icon: "🔒", affirmation: "Fifth. Your name is off it, and now the front door is shut behind you." },
        { id: "lookback", text: "Look back and check once more", icon: "👀", affirmation: "And sixth, the one everybody skips. Door shut, and you still turned round and looked back." },
      ],
      hints: {
        tier1: "Walk through it in your head, from sitting down to walking away.",
        tier2: "The balloon pops up as you log IN, so it comes early. Looking back is always the very last thing.",
      },
      completeTitle: "Routine locked in!",
      completeLine: "Six moves, in that order, on every borrowed screen you ever meet. That is a Lock Master.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at the whole thing on the rail. Notice, no thank you, lids down, log out, lock, look back.",
          "Every one of those was a power you learned this week, and now they are one routine.",
          "[excited] Which is just as well, because somebody has been waiting for you at the end of it.",
        ],
      },
    },

    // 25 - Boss
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: every screen locked
    { type: "video", videoPlaceholder: "Week 18: Lock Master", videoSrc: "/videos/module-18-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "rack", label: "Screen Spotter", accent: "#7eff97", icon: "📱", summary: "Nearly every screen is shared, and you are a visitor on it." },
        { id: "relay", label: "Clean Leaver", accent: "#7df0ff", icon: "🔒", summary: "Close, log out, lock, then look back." },
        { id: "door", label: "Door Fitter", accent: "#ffd158", icon: "🚪", summary: "The lock lives in Settings, and having one beats having a clever one." },
        { id: "shelf", label: "Lid Putter-Downer", accent: "#c084fc", icon: "👪", summary: "Whose is this, asked before any other question." },
        { id: "balloon", label: "Balloon Popper", accent: "#ff5fb3", icon: "🎈", summary: "Borrowed screen, no thank you. Every time." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Shared screens spotted, clean leaves, front doors fitted,",
          "lids put down... and not one balloon said yes to.",
          "[laughs] He was counting on you being in a hurry. You weren't.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "clean-leaver", name: "Clean Leaver", icon: "🔒", description: "Closes, locks, and always looks back." },
        { id: "door-fitter", name: "Door Fitter", icon: "🚪", description: "Can find the lock on any device there is." },
        { id: "balloon-popper", name: "Balloon Popper", icon: "🎈", description: "Never lets a borrowed screen remember them." },
      ],
    },

    // 29 - Completion
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
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
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
          text: "You know that little X only HIDES the window?! That X has fed me for YEARS!",
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
          text: "You didn't even PEEK at that glowing screen?! A free sample, and you walked straight past it!",
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
          text: "Saved on that lovely old machine of his! I visit on Sundays, you know. For the cookies. And the passwords!",
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

  // Keyed by SCREEN INDEX (0-29), and there are exactly 30 screens above.
  // The shipped week carried 29 keys for 31 screens, so from index 2 onward
  // every reaction landed on the wrong screen. Counted and re-checked on the
  // rebuild: if a screen is ever inserted or removed, shift these with it (the
  // trailing labels are there to make that possible at a glance).
  // The 5 recap checkpoints are indices 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 18 - lock before you leave!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He doesn't crack anything. He just waits..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the layout." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Lock Master? Let's earn it." } }, // mission brief
    4: { adam: null, layla: { mood: "thinking", message: "How many screens are really YOURS?" } }, // learn: rack
    5: { adam: null, layla: { mood: "curious", message: "Shared shelf or mine? Sort them!" } }, // game: hookSort
    6: { adam: { mood: "thumbsup", message: "What makes a screen shared?" }, layla: null }, // prove: recall
    7: { adam: { mood: "excited", message: "You spot a shared screen a mile off!" }, layla: null }, // recap 1
    8: { adam: { mood: "thinking", message: "Four moves, always the same order." }, layla: null }, // learn: relay
    9: { adam: { mood: "curious", message: "Clear every card, then lock it!" }, layla: null }, // game: logOutFlick
    10: { adam: null, layla: { mood: "thumbsup", message: "Quick - what's the LAST move?" } }, // prove: speed
    11: { adam: null, layla: { mood: "excited", message: "You looked back. Nobody looks back!" } }, // recap 2
    12: { adam: null, layla: { mood: "thinking", message: "A lock screen is a front door." } }, // learn: door
    13: { adam: null, layla: { mood: "curious", message: "Hunt it down - read every button!" } }, // game: buttonHunt
    14: { adam: { mood: "worried", message: "Careful - is he fibbing? Listen close!" }, layla: null }, // prove: lie
    15: { adam: { mood: "excited", message: "You can fit a door to anything now!" }, layla: null }, // recap 3
    16: { adam: { mood: "thinking", message: "Whose is this? Ask it first." }, layla: null }, // learn: shelf
    17: { adam: { mood: "curious", message: "Find the person behind each one." }, layla: null }, // game: whoseIsIt (villain OFF)
    18: { adam: null, layla: { mood: "thumbsup", message: "Which question comes first?" } }, // prove: recall
    19: { adam: null, layla: { mood: "excited", message: "Three lids down, and nobody asked!" } }, // recap 4
    20: { adam: null, layla: { mood: "thinking", message: "Shall I remember this for you...?" } }, // learn: balloon
    21: { adam: null, layla: { mood: "curious", message: "Check the screen, then answer!" } }, // game: replyCards
    22: { adam: { mood: "thumbsup", message: "Finish the borrowed-screen rule!" }, layla: null }, // prove: finish
    23: { adam: { mood: "excited", message: "All five - now put them in order!" }, layla: null }, // recap 5
    24: { adam: { mood: "excited", message: "Six moves on the rail. In order!" }, layla: null }, // review: stepOrder
    25: { adam: { mood: "worried", message: "He's been waiting all week - go!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Every screen locked behind you!" } }, // outro video
    27: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    28: { adam: { mood: "excited", message: "Stickers earned, Lock Master!" }, layla: null }, // stickers
    29: { adam: { mood: "thumbsup", message: "Lock Master badge earned!" }, layla: null }, // completion
  },
};

import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 16 - QR Codes & Links: Don't Take the Bait.
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE DOORWAY MAZE -
 * a corridor of doors where every link and every QR code is a door. The SIGN
 * is what the door promises. Where it actually opens is a separate question.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 SIGN     the sign is not the destination   | phishInspector "plate" | recall
 *     2 KEYRING  is this sender one of yours       | keyholeCheck (signature)| finish
 *     3 STICKER  a fake pasted over a real code    | stickerPeel NEW         | lie
 *     4 GLASS    you can read a link, not a code   | glassCheck NEW          | order
 *     5 BARRIER  cannot tell? wheel out the barrier| popupPanic "barrier"    | speed
 *   review (teamPoster, poster skin) -> boss -> video -> debrief -> stickers
 *   -> completion. 30 screens, no game before Learn 1.
 *
 * **The signature is CONVERTED but RE-VERBED.** `keyholeCheck` used to lay a key
 * over a door and flash the ONE tooth that disagreed on a copycat. That verb,
 * "spot the one difference in a lookalike", is already Week 4 (the lookalike
 * sender), Week 9 (count the whiskers) and Week 14 (compare two pictures). A
 * fourth would be repetition. It now asks whether the sender is on the child's
 * keyring AT ALL: possession, not comparison. A door you cannot match to
 * somebody you actually know does not get opened, however good the sign looks.
 *
 * Engine allocation (see RETHEME_ALLOWED[16] in scripts/audit-engine-reuse.mjs):
 * - stickerPeel and glassCheck are NEW. stickerPeel's verb is PRESS A CORNER AND
 *   SEE IF IT LIFTS, and it deliberately shows no tilt, shadow or bubble before
 *   the press: a visible tell would teach a child to eyeball a code instead of
 *   doing the test. glassCheck's verb is READ THE PANE OR ADMIT YOU CANNOT, and
 *   its whole point is that "I cannot read this" is a complete answer.
 * - phishInspector returns from Week 4 as the address plate: concept re-theme 1.
 * - popupPanic returns from Week 3 as the barrier: concept re-theme 2.
 * - teamPoster returns from Week 3 as the review.
 *
 * Lane-clean: DOORS. Scam feelings and the hurry-up trick were Week 4, stranger
 * red flags Week 3, device switches Week 14. This week is only ever about what
 * is behind a link or a code, and what you can tell before you walk through.
 */
export const WEEK_16: WeekContent = {
  weekNumber: 16,
  title: "QR Codes & Links: Don't Take the Bait",
  topic: "qr-links",
  badgeName: "Door Checker",
  badgeIcon: "🚪",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 16: DON'T TAKE THE BAIT", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the doorway maze
    { type: "video", videoPlaceholder: "Week 16: Don't Take the Bait", videoSrc: "/videos/module-16-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-16.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's Doorway Trick is everywhere. Links and QR codes are doors, and he paints their signs with parties and prizes while the doors open onto his slide. He is even pasting his own sticker-codes over real ones on posters and menus. This week you become a Door Checker. Read the address. Run the peel test. Know which doors you simply cannot see through. And when you cannot tell, wheel out the barrier and ask.",
      photoCaption: "Wk 16 - The Doorway Maze",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[16] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know that every link and code is a doorway",
        "Read the address, or admit you cannot",
        "Cannot tell? Wheel out the barrier and ask",
      ],
    },

    /* BEAT 1 - THE SIGN IS NOT THE DOOR */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "A Door You Can't See Through",
      content:
        "Every link and every QR code is a DOOR. Here is the thing about doors: the sign hanging on one is painted by whoever put it there. A door can say FREE PUPPIES in lovely letters and open onto a broom cupboard. The sign is a promise, not a destination, and anybody can paint a sign. So a Door Checker learns the one habit that beats all of it: never judge the door by the sign. Look at the address plate, which is the small bit that says where the door actually goes.",
      bullets: [
        "Every link and every code is a door",
        "The sign is painted by whoever made the door",
        "A lovely sign can open onto anywhere",
        "The address plate says where it really goes",
        "Never judge a door by its sign",
      ],
      bulletIcons: ["🚪", "🎨", "🪤", "🔍", "✋"],
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome to the Doorway Maze, Cyber Hero. Doors as far as you can see.",
          "Every link you tap and every code you scan is one of these. A door.",
          "[thinking] And here is the thing about a door. The sign on it was painted by whoever put it there.",
          "A door can say FREE PUPPIES in beautiful letters and open straight onto a broom cupboard.",
          "So we never judge a door by its sign. We read the little address plate instead.",
          "[excited] Let's go and inspect some plates together!",
        ],
      },
    },
    // 5 - Game: PLATE (PhishInspector, doorway skin).
    // Sarah speaks linkNote only, never linkText, so the address it shows must
    // also be said inside linkNote or the child never hears it. whyWrong falls
    // back to a component default, which would be SILENT, so every door has one.
    {
      type: "phishInspector",
      skin: "doorway",
      introTitle: "The Address Plate",
      introSubtitle: "Doors in the maze. Tap all four clues on each one, then decide: walk through, or turn it away.",
      introIcon: "🚪",
      signCaption: "WHAT THE SIGN SAYS",
      plateCaption: "WHERE IT REALLY OPENS",
      counterLabel: "Door",
      headerLabel: "THE DOORWAY MAZE",
      zapLabel: "TURN IT AWAY",
      safeLabel: "WALK THROUGH",
      zapToast: "TURNED AWAY!",
      safeToast: "STRAIGHT THROUGH!",
      wrongTitle: "Read the plate again",
      completeTitle: "Every door checked!",
      completeLine: "You read the plate on all of them, even the pretty ones.",
      zoneLabels: {
        sender: "Who it's from",
        link: "The address plate",
        urgency: "Any rushing?",
        claim: "What it promises",
      },
      zoneQuestions: {
        sender: "Check the sender",
        link: "Read the plate",
        urgency: "Is it hurrying you?",
        claim: "Check the promise",
      },
      threat: {
        raccoonLine: "I paint my signs BEAUTIFULLY. Big letters, bright colours, lovely promises. Nobody ever crouches down to read the little plate at the bottom.",
      },
      emails: [
        {
          id: "school-trip",
          sender: "Northside Elementary",
          subject: "Sports day letter for your grown-up",
          body: "The letter about sports day is ready. Open it with a grown-up when you get a minute.",
          isPhishing: false,
          readAloud: "A door from Northside Elementary. Sports day letter for your grown-up. The letter about sports day is ready, open it with a grown-up when you get a minute.",
          why: "The plate says your school, the sign matches the plate, and nothing is rushing you. That door is exactly what it says it is.",
          whyWrong: "Read the plate again. It says your own school, and the sign is asking you to take a letter to a grown-up. Nothing here is a trick.",
          inspections: {
            senderNote: "Northside Elementary is your actual school, and it is on your keyring.",
            senderIsRedFlag: false,
            linkText: "northside-elementary.sch.uk",
            linkNote: "The plate reads northside dash elementary dot s c h dot u k, which is your school's real address.",
            linkIsRedFlag: false,
            urgencyNote: "When you get a minute. Nothing is counting down at you.",
            urgencyIsRedFlag: false,
            claimNote: "It promises a letter about sports day, which is a very ordinary thing for a school to send.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "free-tablet",
          sender: "Prize Club",
          subject: "CLAIM YOUR FREE TABLET NOW!",
          body: "You have been chosen! Tap within 10 minutes or your free tablet goes to somebody else!",
          isPhishing: true,
          readAloud: "A door from Prize Club. Claim your free tablet now! You have been chosen, tap within ten minutes or your free tablet goes to somebody else.",
          why: "A prize nobody entered, a ten minute countdown, and a plate that is not a single place you know. That door is all paint.",
          whyWrong: "Look at Prize Club's plate and its clock. The address is a stranger and there is a countdown on it, which is the hurry-up trick doing its job.",
          inspections: {
            senderNote: "Prize Club is on nobody's keyring, and you never entered anything.",
            senderIsRedFlag: true,
            linkText: "free-tablet-now.prizeclub.xyz",
            linkNote: "The plate reads free dash tablet dash now dot prizeclub dot x y z, which is not one single place you have ever been.",
            linkIsRedFlag: true,
            urgencyNote: "Tap within ten minutes. A countdown is there to stop you reading the plate at all.",
            urgencyIsRedFlag: true,
            claimNote: "A free tablet for a competition you never entered. Prizes do not arrive out of nowhere.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "library-club",
          sender: "The library",
          subject: "Summer reading club starts Saturday",
          body: "Your reading club starts Saturday at ten. Ask a grown-up to bring you along.",
          isPhishing: false,
          readAloud: "A door from the library. Summer reading club starts Saturday. Your reading club starts Saturday at ten, ask a grown-up to bring you along.",
          why: "The library is on your ring, the plate says the library, and it points you at a grown-up rather than away from one.",
          whyWrong: "Have another look at the plate. It says the library, which is a place you know, and it asks you to bring a grown-up along.",
          inspections: {
            senderNote: "The library is a real place you go to, and it is on your keyring.",
            senderIsRedFlag: false,
            linkText: "library.gov.uk/reading",
            linkNote: "The plate reads library dot gov dot u k slash reading, which is the library's own address.",
            linkIsRedFlag: false,
            urgencyNote: "Saturday at ten. That is a time, not a countdown.",
            urgencyIsRedFlag: false,
            claimNote: "It promises a reading club and asks for a grown-up. Nothing is being dangled at you.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "game-coins",
          sender: "Games Hub Support",
          subject: "500 FREE COINS for your account!",
          body: "Log in here to collect your 500 free coins before they expire tonight!",
          isPhishing: true,
          readAloud: "A door from Games Hub Support. Five hundred free coins for your account! Log in here to collect your five hundred free coins before they expire tonight.",
          why: "A log in box, a plate that only wears the game's name, and coins that do not exist. Log in here is fishing for your password.",
          whyWrong: "Read the plate slowly. It only looks like the game's address, and a door asking you to log in is after the password, not giving you coins.",
          inspections: {
            senderNote: "Games Hub Support sounds official, and support never comes to find you with presents.",
            senderIsRedFlag: true,
            linkText: "gameshub-rewards.co/login",
            linkNote: "The plate reads gameshub dash rewards dot c o slash login, which is not the game's address, it just wears its name.",
            linkIsRedFlag: true,
            urgencyNote: "Before they expire tonight. Another countdown, doing exactly the same job as the last one.",
            urgencyIsRedFlag: true,
            claimNote: "Free coins that need you to log in. Free game money does not exist, and the log in box is the real ask.",
            claimIsRedFlag: true,
          },
        },
      ],
      hints: {
        tier1: "Ignore the sign completely. Crouch down and read the plate at the bottom.",
        tier2: "A plate that names a place you actually go is fine. A plate you have never seen, or one that only wears a familiar name, is not.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is your first challenge, Cyber Hero. The Address Plate!",
          "This game is all about reading where a door really goes.",
          "Out in the real world, the sign is the loud bit and the plate is the true bit.",
          "So here is what you do.",
          "A door comes up with a sign on it and a little brass plate underneath.",
          "Tap all four clues to look at them, and I will read each one out.",
          "[warmly] Then decide: WALK THROUGH, or TURN IT AWAY. Four doors. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap all four clues on the door, then choose WALK THROUGH or TURN IT AWAY."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four doors read, Cyber Hero, and you never once went by the sign.",
          "Your school and the library opened. The tablet and the coins did not.",
          "[warmly] And the two you turned away had the prettiest signs of the lot.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "A link says WIN A FREE BIKE. What does that tell you about where it goes?",
      choices: [
        { text: "Nothing at all. The sign is just paint", isCorrect: true },
        { text: "It goes to a bike competition", isCorrect: false, why: "That is what the sign promises. Whoever made the door chose those words, and they can choose anything." },
        { text: "It must be real, it named a prize", isCorrect: false, why: "Naming a prize is the easiest part of painting a sign. It costs nothing." },
        { text: "It is safe, because it is only a link", isCorrect: false, why: "A link is a door. Doors go somewhere, and this one has not told you where." },
      ],
      praise: "Nothing at all. The sign is just paint. ✓",
      nudge: "Who chose those words, and what did it cost them?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it!",
          "The sign tells you what somebody WANTS you to think.",
          "It never tells you where the door goes.",
          "[warmly] Only the address plate does that.",
        ],
      },
    },
    // 7 - Recap . Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Every link and code is a door, and the sign on it is painted by whoever made it, so it promises nothing.",
      next: "how a Door Checker knows which doors are theirs",
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You read plates now, not paint.",
          "A sign is a promise. An address is a fact.",
          "[whispers] But plenty of doors do not even have a plate you can read...",
          "Next, we'll learn how a Door Checker knows which doors are theirs. Come and see!",
        ],
      },
    },

    /* BEAT 2 - YOUR KEYRING */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Peek Before You Walk",
      content:
        "Here is the Door Checker's real tool, and it is simpler than checking every letter of an address. You carry a KEYRING. On it are the people and places you actually know: your mum, your school, the library, your football club. When a door claims to be from one of them, you look at the ring. If they are on it, fine. If a door says it is from somebody who is not on your ring at all, there is no key for it, and no amount of friendly paint changes that. You do not have to prove a door is bad. It has to prove it is yours.",
      bullets: [
        "Your keyring is the people and places you know",
        "Mum, school, the library, your club",
        "A door claims a sender; check the ring",
        "Not on the ring means no key, so no entry",
        "A door has to prove it is yours, not the other way round",
      ],
      bulletIcons: ["🔑", "👪", "🏫", "🚫", "🛡️"],
      emblem: "🔑",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Now for the Door Checker's real tool, Cyber Hero. It is simpler than you think.",
          "You carry a keyring. On it are the people and places you actually know.",
          "Your mum. Your school. The library. Your football club.",
          "[thinking] A door claims to be from somebody. You look at your ring.",
          "Not on the ring? Then there is no key for that door, and the paint does not matter.",
          "[excited] Come and try the ring on a few doors!",
        ],
      },
    },
    // 9 - Game: RING (the week's own signature, now tap-only and re-verbed)
    {
      type: "keyholeCheck",
      introTitle: "Your Keyring",
      introSubtitle: "Doors down the corridor, each claiming a sender. Lift the key that matches, or lift NO KEY, then commit.",
      introIcon: "🔑",
      ringLabel: "YOUR KEYRING",
      openLabel: "OPEN IT",
      chainLabel: "CHAIN IT",
      askPrompt: "Is this sender on your ring?",
      completeTitle: "Every door checked!",
      completeLine: "Two opened, and the rest never got a key.",
      threat: {
        raccoonLine: "I paint my doors the SAME bright colours as the real ones. Same letters, same sparkles. Nobody has ever once stopped to ask whose door it actually is.",
      },
      keyring: [
        { id: "mum", label: "Mum", icon: "🏠" },
        { id: "school", label: "My school", icon: "🏫" },
        { id: "club", label: "My swim club", icon: "🏅" },
        { id: "zak", label: "My friend Zak", icon: "💬" },
      ],
      doors: [
        {
          id: "mum-photos",
          claim: "From: Mum",
          sign: "Photos from the weekend!",
          icon: "🏠",
          readAloud: "First door. It says it is from Mum, with photos from the weekend.",
          keyId: "mum",
          why: "Mum is right there on your ring, so there is a key for this one and the door opens.",
          explanation: "Look along the ring again. Mum is on it, so this door does have a key.",
        },
        {
          id: "prize-palace",
          claim: "From: Prize Palace",
          sign: "YOU WON! Claim your free coins!",
          icon: "🎁",
          readAloud: "Next door. From somewhere called Prize Palace, saying you have won free coins.",
          keyId: null,
          why: "Prize Palace is on nobody's ring. No key, so it gets chained, and the shouting about coins changes nothing.",
          explanation: "Check the ring once more. There is no Prize Palace on it, so there is no key for this door.",
        },
        {
          id: "swim-partner",
          claim: "From: your swim club's new prize partner",
          sign: "Free kit for every swimmer. Scan me!",
          icon: "🏅",
          readAloud: "This door says it is from your swim club's new prize partner, offering free kit.",
          keyId: null,
          why: "Your swim club is on the ring. A partner of theirs is not, and borrowing a name you trust is the oldest trick down here.",
          explanation: "Read the claim slowly. Your club is on the ring, but this door is not from your club. It is from somebody standing next to the name.",
        },
        {
          id: "games-hub",
          claim: "From: Games Hub",
          sign: "Scan for 500 free coins!",
          icon: "🎮",
          readAloud: "A door from Games Hub, with a code for five hundred free coins.",
          keyId: null,
          why: "Games Hub is not on your ring, so it never gets a key, however good five hundred coins sounds.",
          explanation: "Games Hub is not one of yours. Nothing on the ring matches it, so there is no key to lift.",
        },
        {
          id: "school-letter",
          claim: "From: My school",
          sign: "Sports day letter for your grown-up",
          icon: "🏫",
          readAloud: "Last door, and this one says it is from your school, with the sports day letter.",
          keyId: "school",
          why: "Your school is on the ring, so this one opens. Checking the ring is not about chaining everything.",
          explanation: "Have another look. Your school is on the ring, so this door has a key waiting for it.",
        },
      ],
      hints: {
        tier1: "Read who the door says it is FROM, then look down your ring for that exact name.",
        tier2: "If the name is not on the ring, lift NO KEY. A partner or a friend-of is not the same as the name itself.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your second challenge, Cyber Hero. Your Keyring!",
          "This game is all about whether a door belongs to somebody you actually know.",
          "Out in the real world, that one question sorts almost every door there is.",
          "So here is what you do.",
          "A door slides in and says who it is from. Your keyring sits underneath it.",
          "Tap the key that matches, or tap the NO KEY tag at the end of the ring.",
          "[warmly] Then press the big button to commit. Five doors. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Tap the key that matches the door, or tap NO KEY if nobody on your ring fits.",
          "Then press the button underneath: it says OPEN IT for a key, and CHAIN IT for no key.",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every door checked, Cyber Hero, and notice what you did NOT do.",
          "You did not chain the lot. Mum's opened, and so did your school's.",
          "[warmly] The ring is not about saying no. It is about knowing whose door it is.",
        ],
      },
    },
    // 10 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Finish the keyring rule: a door does not have to look bad, it has to...",
      choices: [
        { text: "prove it is one of yours", isCorrect: true },
        { text: "look a bit suspicious first", isCorrect: false, why: "The good fakes never look suspicious. That is the whole point of painting a nice sign." },
        { text: "be from somebody famous", isCorrect: false, why: "Famous is not the same as known. Your keyring holds people YOU know, not people everybody knows." },
        { text: "have a spelling mistake in it", isCorrect: false, why: "Plenty of fakes are spelled perfectly. Waiting for a mistake means missing the tidy ones." },
      ],
      praise: "It has to prove it is yours. ✓",
      nudge: "Whose job is it to prove something here, yours or the door's?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Exactly right!",
          "You never have to prove a door is bad.",
          "It has to show you it belongs to somebody on your ring.",
          "[warmly] That is a much easier job, and it catches the tidy fakes too.",
        ],
      },
    },
    // 11 - Recap . Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Your keyring is the people and places you actually know, and a door that matches nobody on it does not get opened.",
      next: "the trick where a real code gets covered up",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers, Cyber Hero. The ring does the hard work for you.",
          "On the ring, fine. Not on the ring, no key.",
          "[whispers] Now. What if somebody covered up a REAL code with their own...",
          "Next, we'll learn the sticker trick. Come and see!",
        ],
      },
    },

    /* BEAT 3 - THE STICKER TRICK */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "The Sticker Trick",
      content:
        "This one happens out in the world, not on a screen. A cafe prints a code on its menu so you can see the puddings. Somebody comes along and sticks their OWN code on top, and now the menu points at their door instead. You cannot spot it by staring, and that is important: a good sticker looks perfectly flat. So Door Checkers do not stare, they TEST. Press a corner with your thumb. Printed ink does not lift, because it is part of the paper. A sticker lifts, every time.",
      bullets: [
        "Somebody sticks their code over a real one",
        "Menus, posters, parking signs, shop windows",
        "Staring does not work; a good sticker looks flat",
        "So press a corner instead of looking",
        "Ink cannot lift. A sticker always can",
      ],
      bulletIcons: ["🏷️", "🎨", "👀", "👆", "📌"],
      emblem: "🏷️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] This one happens out in the world, Cyber Hero. Not on a screen at all.",
          "A cafe prints a code on its menu. Somebody sticks their own code right on top of it.",
          "[thinking] And here is the bit that matters. You cannot spot that by staring.",
          "A good sticker lies perfectly flat. Looking harder will not help you.",
          "So we do not look. We TEST. Press a corner, and see whether it lifts.",
          "[excited] Come and run some peel tests with me!",
        ],
      },
    },
    // 13 - Game: PEEL (new stickerPeel engine)
    {
      type: "stickerPeel",
      introTitle: "The Peel Test",
      introSubtitle: "Codes out in the world. Press a corner on each one and see whether it lifts.",
      introIcon: "🏷️",
      boardLabel: "OUT AND ABOUT",
      peelLabel: "PEEL TEST",
      stuckLabel: "PRINTED ON",
      liftedLabel: "IT LIFTED",
      askPrompt: "Printed on, or stuck on top?",
      completeTitle: "Every code tested!",
      completeLine: "You never once guessed. You pressed a corner and found out.",
      threat: {
        raccoonLine: "My stickers are beautiful. Flat as anything, straight as a ruler. Nobody has ever once looked at one and thought: I shall put my thumb on that.",
      },
      spots: [
        {
          id: "menu",
          place: "the cafe menu",
          icon: "🏷️",
          readAloud: "The cafe menu, with a code at the bottom for the puddings.",
          isSticker: true,
          tell: "The corner lifts, and there is a different code printed underneath.",
          why: "It lifted, so it was a sticker, and the cafe's real code was hiding underneath it all along.",
          explanation: "Have another look at that menu corner. It came away from the paper, and printed ink cannot do that.",
        },
        {
          id: "poster",
          place: "the library poster",
          icon: "📌",
          readAloud: "A poster in the library, telling you about the summer reading club.",
          isSticker: false,
          tell: "The corner does not move. The code is printed into the poster itself.",
          why: "Nothing lifted, so that code is part of the poster. The library printed it there themselves.",
          explanation: "That corner would not budge. When a code is printed into the paper, there is nothing to peel.",
        },
        {
          id: "parking",
          place: "the car park sign",
          icon: "🚪",
          readAloud: "The sign in the car park, where you pay for your ticket.",
          isSticker: true,
          tell: "The whole square peels back and a proper printed code sits under it.",
          why: "The whole square came away. Car park signs are a favourite for this one, because everybody is in a hurry.",
          explanation: "Press the car park corner again. A whole square lifting off is the clearest sticker there is.",
        },
        {
          id: "shopwindow",
          place: "the shop window",
          icon: "🔍",
          readAloud: "A code in the shop window, next to the opening times.",
          isSticker: false,
          tell: "It stays flat. The code is printed on the same card as the opening times.",
          why: "It stayed put, and it is on the same card as the opening times. That one is the shop's own.",
          explanation: "Nothing lifted there. It is printed on the same piece of card as everything else in the window.",
        },
      ],
      hints: {
        tier1: "Do not look at it. Press the corner and watch what the corner does.",
        tier2: "Lifted means a sticker somebody added. Stayed flat means ink that was always there.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your third challenge, Cyber Hero. The Peel Test!",
          "This game is all about testing a code instead of staring at it.",
          "Out in the real world, a good sticker looks exactly as flat as printed ink.",
          "So here is what you do.",
          "A code comes up on a poster or a menu. Tap PEEL TEST to press its corner.",
          "Then tap PRINTED ON, or tap IT LIFTED.",
          "[warmly] Four codes to test. Thumbs at the ready.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap PEEL TEST first, then make your call."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every code tested, Cyber Hero, and look how you did it.",
          "You did not squint at a single one. You pressed a corner and found out.",
          "[warmly] Two of those were stickers, and neither of them looked like one.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon is fibbing about his stickers. Which bit is the lie?",
      raccoonLine: "You can always SPOT a sticker! They're crooked, they're bubbly, they've got shadows. If it looks neat, it's definitely the real one!",
      choices: [
        { text: "A good sticker looks perfectly flat and neat", isCorrect: true },
        { text: "Stickers only go on menus", isCorrect: false, why: "They turn up on posters, car parks and shop windows too. The place is not the tell." },
        { text: "You can spot one if you look for ages", isCorrect: false, why: "Looking for ages is still looking. The test is your thumb, not your eyes." },
        { text: "Real codes are always crooked", isCorrect: false, why: "That is his trick turned round. Neat or crooked tells you nothing either way." },
      ],
      praise: "Caught him. Neat proves nothing. ✓",
      nudge: "If a sticker were easy to see, would his trick work at all?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Got him!",
          "If stickers looked crooked and bubbly, nobody would ever fall for one.",
          "The good ones are flat and tidy. That is why they work.",
          "[warmly] Which is why we press, instead of peering.",
        ],
      },
    },
    // 15 - Recap . Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A fake code gets stuck over a real one and looks perfectly flat, so you press a corner instead of staring at it.",
      next: "the doors you cannot read at all, however hard you try",
      emblem: "🏷️",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Thumb beats eyeball.",
          "Flat and tidy proves nothing at all. Only the peel does.",
          "[whispers] Although... some doors cannot be read even when nobody has stuck anything on them...",
          "Next, we'll learn about clear glass and frosted glass. Come and see!",
        ],
      },
    },

    /* BEAT 4 - CLEAR GLASS, FROSTED GLASS */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Clear Glass, Frosted Glass",
      content:
        "Some doors have a clear pane: a link shows you its address, so you can read where it goes before you walk through. Some doors have a frosted pane: a QR code is a pattern for a machine, and no human being can read it. Not you, not your teacher, not anybody. That is not you being bad at reading. It is a fact about codes. So the honest answer for a frosted door is always the same, and it is not a cop out: I cannot read this one, so a grown-up looks with me. Saying that IS the skill.",
      bullets: [
        "A link is a clear pane: you can read the address",
        "A QR code is frosted: nobody can read a pattern",
        "That is true for grown-ups too, not just you",
        "So a code always gets a grown-up, every time",
        "Saying 'I cannot read this' IS the skill",
      ],
      bulletIcons: ["🔍", "🌀", "👪", "🚪", "💪"],
      emblem: "🌀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Some of these doors have clear glass, Cyber Hero. Some have frosted.",
          "A link is clear glass. It shows you its address, so you can read where it goes.",
          "[thinking] A code is frosted. It is a pattern for a machine, and no person can read it.",
          "Not you. Not me. Not your teacher. Nobody.",
          "So the honest answer for a frosted door is always the same, and it is not giving up.",
          "[excited] Let's go and try some panes for ourselves, the clear ones and the frosted. You'll see what I mean!",
        ],
      },
    },
    // 17 - Game: PANES (new glassCheck engine)
    {
      type: "glassCheck",
      introTitle: "Clear Glass, Frosted Glass",
      introSubtitle: "Doors down the corridor. Read the pane if you can, and say so honestly when you cannot.",
      introIcon: "🌀",
      clearLabel: "CLEAR PANE",
      frostedLabel: "FROSTED PANE",
      walkLabel: "SAFE TO WALK",
      stopLabel: "NOT THIS ONE",
      grownUpLabel: "ASK A GROWN-UP",
      askPrompt: "What does this door need?",
      completeTitle: "Every pane read!",
      completeLine: "And you said so, out loud, on the ones nobody can read.",
      threat: {
        raccoonLine: "Frosted glass is my favourite invention. A little pattern, and not one human being alive can tell what is behind it. They just scan it and hope!",
      },
      doors: [
        {
          id: "school-clear",
          sign: "Sports day letter",
          icon: "🏫",
          readAloud: "A door with a clear pane, and your school's letter on the sign.",
          pane: "yourschool.sch.uk/sportsday",
          verdict: "walk",
          why: "You could read that one, and it says your school right there in the address. Clear pane, known place, safe to walk.",
          explanation: "Have another read of the pane. It says your school, and you could read it yourself, so this one is fine.",
        },
        {
          id: "prize-clear",
          sign: "CLAIM YOUR FREE TABLET",
          icon: "🎁",
          readAloud: "This door has a clear pane too, and a very exciting sign about a free tablet.",
          pane: "free-tablet-now.prizeclub.xyz",
          verdict: "stop",
          why: "You read it, and it does not say anybody you know. A clear pane you CAN read is still a no when the address is a stranger.",
          explanation: "Read the pane rather than the sign. Nothing in that address is a place you know, so the free tablet does not matter.",
        },
        {
          id: "menu-frosted",
          sign: "Scan for our puddings",
          icon: "🌀",
          readAloud: "A frosted pane now, on a door from the cafe menu.",
          pane: "",
          verdict: "grown-up",
          why: "Nothing to read, so nothing to judge. A frosted pane always gets a grown-up, even for puddings.",
          explanation: "Look at the pane again. There is nothing on it, because a code is a pattern. That is always a grown-up.",
        },
        {
          id: "library-clear",
          sign: "Summer reading club",
          icon: "🔍",
          readAloud: "Another clear pane, on the library's reading club door.",
          pane: "library.gov.uk/reading",
          verdict: "walk",
          why: "The library is on your ring and the pane says the library. Read it, recognised it, walk through.",
          explanation: "You can read that pane, and it names the library. That one is genuinely fine.",
        },
        {
          id: "poster-frosted",
          sign: "WIN A BIKE! Scan here",
          icon: "🌀",
          readAloud: "Last door. A frosted pane, on a poster shouting about winning a bike.",
          pane: "",
          verdict: "grown-up",
          why: "Still nothing to read, so it is still a grown-up. A loud sign on a frosted door does not make the glass any clearer.",
          explanation: "The shouting is on the sign, not the pane. The pane is blank, so this is a grown-up like every other code.",
        },
      ],
      hints: {
        tier1: "Look at the pane, not the sign. Can you read words on it, or is it blank?",
        tier2: "Blank pane always means a grown-up. A readable pane you still have to recognise: known place walks, stranger stops.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Fourth challenge, Cyber Hero. Clear Glass, Frosted Glass!",
          "This game is all about knowing when you CAN read a door and when you honestly cannot.",
          "Out in the real world, a link shows its address and a code shows a pattern.",
          "So here is what you do.",
          "A door slides in with a pane. If there are words on it, read them.",
          "Then tap SAFE TO WALK, or NOT THIS ONE, or ASK A GROWN-UP.",
          "[warmly] And remember: a blank pane is not you failing. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read the pane if it has words, then tap one of the three answers."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every pane sorted, Cyber Hero, and the frosted ones were the best bit.",
          "You did not guess at them. You said the honest thing: I cannot read this one.",
          "[warmly] That is not giving up. That is the whole skill.",
        ],
      },
    },
    // 18 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the Door Checker's look in order.",
      choices: [
        { text: "1. Ignore the sign", isCorrect: true },
        { text: "2. Look at the pane", isCorrect: true },
        { text: "3. Read it, or say you cannot", isCorrect: true },
        { text: "4. Walk, stop, or fetch a grown-up", isCorrect: true },
      ],
      praise: "Sign last, pane first. That is the order. ✓",
      nudge: "Which part was painted by whoever built the door?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect order!",
          "The sign goes first because it is the part you ignore.",
          "Then the pane, then the honest answer about it.",
          "[warmly] And only then do you decide what to do.",
        ],
      },
    },
    // 19 - Recap . Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "A link has a pane you can read and a code is frosted glass, so 'I cannot read this one' is a complete and correct answer.",
      next: "what a Door Checker does when they genuinely cannot tell",
      emblem: "🌀",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers, Cyber Hero, and that fourth one is the grown-up one.",
          "Clear glass you read. Frosted glass nobody reads, and you say so.",
          "[whispers] Which leaves one last thing. What do you actually DO when you are stuck...",
          "Next, we'll wheel out the barrier. Come and see!",
        ],
      },
    },

    /* BEAT 5 - THE BARRIER RULE */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "The Barrier Rule",
      content:
        "Last power, and it is the one that covers everything the other four miss. Sometimes you genuinely cannot tell. The sign looks ordinary, the address is half familiar, the code is frosted, and there is a little voice saying just tap it and find out. That is exactly the moment a Door Checker wheels out the barrier. Stop. Do not walk through. Go and get a grown-up. Nothing bad happens while a door is waiting, and that is the part the Raccoon hates most: a door you never opened cannot do a single thing to you.",
      bullets: [
        "Sometimes you genuinely cannot tell, and that is fine",
        "That is the moment for the barrier, not a guess",
        "Stop, do not walk through, fetch a grown-up",
        "Nothing bad happens while a door waits",
        "A door you never opened cannot do anything at all",
      ],
      bulletIcons: ["✋", "❓", "👪", "⏱️", "🛡️"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, Cyber Hero, and it catches everything the others miss.",
          "Sometimes you genuinely cannot tell. The sign is ordinary, the address is half familiar.",
          "[thinking] And there is a little voice saying: go on, just tap it and find out.",
          "That is exactly when a Door Checker wheels out the barrier.",
          "Stop. Do not walk through. Go and get a grown-up. Nothing bad happens while a door waits.",
          "[excited] Let's go and practise the barrier together!",
        ],
      },
    },
    // 21 - Game: BARRIER (PopupPanic, doorway skin).
    // `body` is what Sarah speaks, and `whyTrick` is the ONLY reason field: it
    // carries BOTH branches, so each one reads as a reason whichever way the
    // child called it. Every door wears the same icon on purpose: `icon` renders
    // before the tap, so a scary one on barrier doors would give the answer away.
    {
      type: "popupPanic",
      skin: "doorway",
      introTitle: "The Barrier",
      introSubtitle: "Doors you are not sure about. Wheel the barrier out, or walk through, one at a time.",
      introIcon: "✋",
      headerLabel: "THE BARRIER",
      boardPrompt: "Can you tell about this one?",
      counterLabel: "DOOR",
      cardBadge: "A DOOR APPEARS",
      fromFallback: "A door",
      fineLabel: "WALK THROUGH",
      flagLabel: "BARRIER OUT",
      fineIcon: "🚪",
      flagIcon: "✋",
      fineToast: "STRAIGHT THROUGH!",
      flagToast: "BARRIER OUT!",
      wrongTitle: "Have another think about this door",
      wrongTip: "The barrier is for the ones you cannot tell about. It is never the wrong answer to be unsure.",
      completeTitle: "Every door handled!",
      completeLine: "Barriers where you needed them, and none where you did not.",
      threat: {
        raccoonLine: "Just tap it and find out! That is my favourite sentence in the whole world. Nobody ever went and fetched a grown-up over a little door.",
      },
      popups: [
        {
          id: "gran-photos",
          from: "Gran",
          icon: "🚪",
          title: "sends the holiday photos",
          body: "Gran has sent a link to the holiday photos, and the plate says her photo site, the same one as last time.",
          isRedFlag: false,
          whyTrick: "Gran is on your ring and the plate is the same site as last time, so there is nothing here you cannot tell. The barrier is for the unclear ones, not for everything.",
        },
        {
          id: "half-familiar",
          from: "A door",
          icon: "🚪",
          title: "looks a bit like your school's",
          body: "A door that looks a bit like your school's, but the plate has an extra word in it you do not recognise.",
          isRedFlag: true,
          whyTrick: "A word on the plate you have never seen before is exactly the not-sure feeling, and not-sure is the barrier's cue. Nothing bad happens while that door waits for a grown-up.",
        },
        {
          id: "frosted-poster",
          from: "A poster",
          icon: "🚪",
          title: "has a code and no words",
          body: "A poster in the street with a code on it and no address you can read anywhere.",
          isRedFlag: true,
          whyTrick: "A code you cannot read is the clearest barrier there is. You are not stuck, you just genuinely cannot see through that pane, so a grown-up looks with you.",
        },
        {
          id: "club-known",
          from: "Your swim club",
          icon: "🚪",
          title: "sends the timetable",
          body: "Your swim club has sent the new timetable, on the same address they always use, with no rush on it at all.",
          isRedFlag: false,
          whyTrick: "Your club is on the ring, the address is their usual one, and nothing is hurrying you. Wheeling the barrier out here would just mean never going swimming.",
        },
        {
          id: "just-tap-it",
          from: "A door",
          icon: "🚪",
          title: "says just tap and see",
          body: "A door with a friendly sign, a plate you half recognise, and a little voice saying just tap it and find out.",
          isRedFlag: true,
          whyTrick: "That little voice is the exact moment the barrier exists for. Half recognise is not recognise, and a door you never opened cannot do anything at all.",
        },
      ],
      hints: {
        tier1: "Ask yourself one thing: can I actually tell about this door, or am I guessing?",
        tier2: "Guessing means the barrier. Knowing the sender and the address means you can walk through.",
        tier3: "The barrier is never wrong when you are unsure. It is only wrong on doors you genuinely could tell about.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last challenge of the week, Cyber Hero. The Barrier!",
          "This game is all about what you do when you cannot tell.",
          "Out in the real world, that little voice saying just tap it is the whole trick.",
          "So here is what you do.",
          "A door comes up, and I will read out what you can see about it.",
          "Tap WALK THROUGH if you can genuinely tell, or BARRIER OUT if you cannot.",
          "[warmly] And watch out: two of these you CAN tell about. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap WALK THROUGH if you can tell, or BARRIER OUT if you cannot."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every door handled, Cyber Hero, and you got the balance exactly right.",
          "Barriers on the three you could not tell about. Gran and your club straight through.",
          "[warmly] The barrier is not for being scared of doors. It is for being honest about which ones you can read.",
        ],
      },
    },
    // 22 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! You cannot tell about a door. What do you do?",
      choices: [
        { text: "Wheel out the barrier and fetch a grown-up", isCorrect: true },
        { text: "Tap it once, just to see", isCorrect: false, why: "Once is all a door needs. There is no peeking through a doorway without walking into it." },
        { text: "Leave it and never mention it", isCorrect: false, why: "Leaving it is safe, but the grown-up is the bit that makes it safe for everyone else too." },
      ],
      praise: "Barrier out, grown-up fetched. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight away!",
          "Not sure is not a problem. It is just the barrier's cue.",
          "[warmly] And a door that waits cannot do a thing to anybody.",
        ],
      },
    },
    // 23 - Recap . Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "When you genuinely cannot tell, the barrier goes out and a grown-up comes over, because a door that waits cannot do anything.",
      next: "the power poster, where all five go up at once",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers, Cyber Hero. Every single one.",
          "Sign ignored, ring checked, corner pressed, pane read, barrier ready.",
          "[whispers] So there is one thing left to do with them...",
          "Next, you put all five up on the poster at once. Come and see!",
        ],
      },
    },


    // 24 - REVIEW: The Power Board (TeamPoster, doorway skin).
    // speakNotes MUST be true: it defaults to false, and every placed power
    // would land silent with nothing erroring. `note` is the only spoken
    // per-tile field and carries BOTH branches, so each reads as a reason
    // either way. The four decoys are deliberate NEAR MISSES: this engine
    // cannot enforce recall on its own, so the decoys are what make the child
    // retrieve the week's actual rule instead of just recognising a word.
    {
      type: "teamPoster",
      skin: "doorway",
      speakNotes: true,
      introTitle: "The Power Board",
      introSubtitle: "Five sockets on the wall. Bolt on the powers a Door Checker really uses, and leave the rest in the tray.",
      introIcon: "🚪",
      posterTitle: "DOOR CHECKER POWER BOARD",
      trayPrompt: "Tap a power a Door Checker really uses on a door",
      placedToast: "BOLTED ON!",
      countLabel: "POWERS BOLTED ON",
      wrongTitle: "That one is not a Door Checker power",
      completeTitle: "Power board complete!",
      completeLine: "Five powers up on the wall, and four near-misses left in the tray.",
      threat: {
        raccoonLine: "Five little powers on a wall. Go on then. But I have slipped some VERY sensible sounding ones into that tray, and they are my favourites.",
      },
      tiles: [
        { id: "ignore-sign", label: "Ignore the sign, read the plate", icon: "🚪", isTeam: true,
          note: "Bolted on! The sign was painted by whoever built the door, so the plate underneath is the only part that tells you anything." },
        { id: "decoy-logo", label: "Trust it if the logo looks right", icon: "🎨", isTeam: false,
          note: "Near miss! A logo is part of the sign, and copying a logo is the easiest painting job there is. It proves nothing about the door." },
        { id: "keyring", label: "Is this sender on my ring?", icon: "🔑", isTeam: true,
          note: "Bolted on! A door has to prove it is one of yours. If the sender is on nobody's ring, there is no key for it." },
        { id: "decoy-partner", label: "A partner of somebody I know counts", icon: "💬", isTeam: false,
          note: "Near miss! Your club is on the ring; somebody standing next to your club's name is not. Borrowing a trusted name is the oldest trick down here." },
        { id: "peel", label: "Press the corner, do not stare", icon: "🏷️", isTeam: true,
          note: "Bolted on! A Door Checker presses the corner because a good sticker lies perfectly flat, so looking harder never works." },
        { id: "decoy-crooked", label: "Fake stickers always look crooked", icon: "👀", isTeam: false,
          note: "Near miss! If fakes looked crooked nobody would ever fall for one. Neat and flat is exactly what a good sticker looks like." },
        { id: "frosted", label: "A code is frosted glass, so ask", icon: "🌀", isTeam: true,
          note: "Bolted on! Nobody can read a code, not even a grown-up, so saying I cannot read this one is the honest and complete answer." },
        { id: "decoy-scan", label: "Codes on real posters are always safe", icon: "📌", isTeam: false,
          note: "Near miss! A real poster is exactly where somebody sticks a fake code. The poster being real says nothing about the code on it." },
        { id: "barrier", label: "Cannot tell? Barrier and a grown-up", icon: "✋", isTeam: true,
          note: "Bolted on! Not sure is not a problem, it is the barrier's cue. A door that waits cannot do a single thing to anybody." },
      ],
      hints: {
        tier1: "Ask whether each one is something you actually DO, or just something that sounds sensible.",
        tier2: "The four near-misses all trust something on the outside: a logo, a borrowed name, a neat sticker, a real poster.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review, Cyber Hero. The Power Board!",
          "This game is all about knowing which moves a Door Checker actually uses.",
          "Out in the real world, plenty of sensible sounding rules are quietly useless.",
          "So here is what you do.",
          "Nine powers sit in the tray, and only five of them are real.",
          "Tap the ones a Door Checker really uses, and they bolt onto the wall.",
          "[warmly] Five sockets, nine choices. Off you go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a power from the tray to bolt it onto the board. Only five belong."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers up on the wall, Cyber Hero, and look what you left in the tray.",
          "The right logo. A friend of a friend. A neat sticker. A real poster.",
          "[warmly] Every one of those sounds sensible, and every one of them trusts the outside of a door. You did not.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the checked maze
    { type: "video", videoPlaceholder: "Week 16: Door Checker", videoSrc: "/videos/module-16-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "sign", label: "Sign Reader", accent: "#7eff97", icon: "🚪", summary: "The sign is paint. The address plate is the fact." },
        { id: "ring", label: "Keyring Keeper", accent: "#7df0ff", icon: "🔑", summary: "A door has to prove it is yours, not the other way round." },
        { id: "peel", label: "Peel Tester", accent: "#c084fc", icon: "🏷️", summary: "A good sticker looks flat, so you press a corner instead of staring." },
        { id: "glass", label: "Pane Reader", accent: "#ffd158", icon: "🌀", summary: "Clear glass you read. Frosted glass nobody reads, and you say so." },
        { id: "barrier", label: "Barrier Wheeler", accent: "#ff5fb3", icon: "✋", summary: "Cannot tell? The barrier goes out and a grown-up comes over." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Signs ignored, the keyring checked, corners pressed,",
          "panes read honestly... and the barrier always ready.",
          "[laughs] His whole Doorway Trick just stopped working on you.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "keyring-keeper", name: "Keyring Keeper", icon: "🔑", description: "Knows whose door is whose." },
        { id: "peel-tester", name: "Peel Tester", icon: "🏷️", description: "Presses the corner instead of guessing." },
        { id: "barrier-wheeler", name: "Barrier Wheeler", icon: "✋", description: "Stops and fetches a grown-up." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#b44dff",
    theme: {
      topic: "QR Codes & Links",
      motifs: ["🔗", "🚪", "🔍", "🚫", "🛡️", "📱", "❓", "✋"],
    },
    intro: {
      slug: "quiz-w16-intro",
      text: "Welcome to my quiz corridor! Every question wears a lovely painted door. Go on, hero, trust the signs. I wrote them all personally!",
    },
    victory: {
      slug: "quiz-w16-victory",
      text: "You read every plaque in the place?! That's it, I'm switching to a business with no doors at all! ...Windows! Wait. No.",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w16-c1",
        key: "quiz-w16-c1-1",
        label: "A Door You Can't See Through",
        ask: {
          slug: "quiz-w16-ask-c1-1",
          text: "A flashing button says 'FREE GAME COINS, TAP HERE!' Who decided where that button really leads?",
        },
        options: [
          { text: "Whoever built the button" },
          { text: "The words written on the button" },
          { text: "The first person who taps the button" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The builder picks the place!",
          explanation: "Paint can promise anything, and tapping does not steer where you land. The person who BUILT the door chose where it goes before you ever saw it.",
        },
        villainRight: {
          slug: "quiz-w16-right-c1-1",
          text: "You know who really decides where a button leads?! Next you'll be asking who does my decorating!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c1-1",
          text: "The words are in charge, sure they are! Tap away, the coins are DEFINITELY real!",
        },
      },
      {
        phaseId: "phase-w16-c2",
        key: "quiz-w16-c2-1",
        label: "Peek Before You Walk",
        ask: {
          slug: "quiz-w16-ask-c2-1",
          text: "Layla wants to see where 'Tap for the class photo album!' REALLY goes before she taps. What is the peek move on her tablet?",
        },
        options: [
          { text: "Press and HOLD the link until the real address pops up" },
          { text: "Tap it super quickly and be ready to close it fast" },
          { text: "Zoom way in on the link's letters to study them" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Press and hold shows the plaque!",
          explanation: "A fast tap already walks you through the door, and zooming just shows you bigger paint. Press and HOLD, and the door's true address pops up for you to read first.",
        },
        villainRight: {
          slug: "quiz-w16-right-c2-1",
          text: "The press-and-hold peek?! Who keeps handing out my trade secrets?!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c2-1",
          text: "Quick taps and squinting, my two best customer moves! Come through, come through!",
        },
      },
      {
        phaseId: "phase-w16-c3",
        key: "quiz-w16-c3-1",
        label: "The Sticker Trick",
        ask: {
          slug: "quiz-w16-ask-c3-1",
          text: "At the pizza place, the menu's QR code sits crooked, with a bubble in the middle and an edge you can lift. What happened here?",
        },
        options: [
          { text: "Somebody pasted their own code on top of the real one" },
          { text: "The menu is just old and wrinkly, safe to scan anyway" },
          { text: "It's a bonus code, two codes always mean two prizes" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The peel test tells!",
          explanation: "Old menus wrinkle all over, not in one perfect square, and real restaurants don't hide bonus codes on top of their own. Crooked, bubbly, liftable means STICKER, and a sticker over a code means the door was swapped.",
        },
        villainRight: {
          slug: "quiz-w16-right-c3-1",
          text: "The bubble gave it away?! I smoothed that sticker with my own two paws!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c3-1",
          text: "Wrinkles! Bonus prizes! Believe anything you like, so long as you scan my little masterpiece!",
        },
      },
      {
        phaseId: "phase-w16-c4",
        key: "quiz-w16-c4-1",
        label: "Clear Glass, Frosted Glass",
        ask: {
          slug: "quiz-w16-ask-c4-1",
          text: "Two links lead to the same cartoon: 'toon-town.tv/silly-cat-show' and 'bit.ly/x7qz2'. Which one can Layla actually CHECK before walking through?",
        },
        options: [
          { text: "toon-town.tv/silly-cat-show, the whole address is readable" },
          { text: "bit.ly/x7qz2, a shorter address is quicker to check" },
          { text: "Either one, all links show where they're going" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Clear glass can be read!",
          explanation: "Short doesn't mean checkable, a bit.ly link hides its whole destination behind scrambled letters. The long clear address can be READ from end to end, so it's the one that can be checked.",
        },
        villainRight: {
          slug: "quiz-w16-right-c4-1",
          text: "You checked which link you could actually READ?! Nobody ever picks the one they can read!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c4-1",
          text: "Shorter is safer, everyone knows that! Straight through the frost you go, wheee!",
        },
      },
      {
        phaseId: "phase-w16-c5",
        key: "quiz-w16-c5-1",
        label: "The Barrier Rule",
        ask: {
          slug: "quiz-w16-ask-c5-1",
          text: "A pop-up yells: 'SCAN THIS CODE IN TEN SECONDS OR LOSE YOUR PRIZE!' Adam isn't sure about it. What wins here?",
        },
        options: [
          { text: "Don't scan, unsure means DON'T, a trusted grown-up can look with him" },
          { text: "Scan fast, ten seconds is too short to go ask anybody" },
          { text: "Scan it, but keep his fingers crossed the entire time" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Countdowns are pressure paint!",
          explanation: "The timer is there so you skip the thinking part, and crossed fingers aren't a safety plan. Unsure means DON'T: wheel in the barrier and check it with a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w16-right-c5-1",
          text: "Adam wasn't sure, so he STOPPED?! That countdown was my best pressure paint yet!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c5-1",
          text: "Ten seconds and counting! Rushed feet never read plaques! In you come!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-16-door-checker.png",

  // Week-lane attack theatre: doorway tricks only (fake senders = W4,
  // copycat apps = W9, pop-up X-hunts = W7).
  bossAttacks: [
    { name: "PAINTED DOOR", icon: "🚪", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Signs are just paint", emblemColor: 0xc084fc },
    { name: "STICKY SWAP", icon: "🏷️", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Peel test the corner", emblemColor: 0xffd158 },
    { name: "FROSTED LINK", icon: "🌀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Can't see through? Ask", emblemColor: 0x7df0ff },
  ],

  // Placeholder quiz boss (the bespoke W16 fight - close the paint shop -
  // is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What IS a link?", answers: ["A doorway to another place online", "A sign that tells you where you'll end up", "A prize", "A game"], correctIndex: 0, explanation: "A doorway - and the sign on it can say anything at all." },
      { question: "Who decides where a link-door really goes?", answers: ["The person who BUILT it", "The sign on the door", "Whoever taps it", "Nobody"], correctIndex: 0, explanation: "The builder picks the destination - the sign is just paint." },
      { question: "A QR code is best described as...", answers: ["A door made of dots only scanners can read", "A picture you can read if you look closely", "Always safe", "A game piece"], correctIndex: 0, explanation: "You can't read the dots - which is why it gets checked before it gets scanned." },
    ],
    medium: [
      { question: "The sign says 'School Photos' but the address says 'prize-grab.win'. Believe...", answers: ["The address - signs can lie, plaques can't", "The sign - it mentions your school", "Both", "Neither - flip a coin"], correctIndex: 0, explanation: "When sign and address disagree, the address is the door's true name." },
      { question: "A QR sticker sits crooked on top of another code. That means...", answers: ["The door was swapped - peel it, don't scan it", "The store just updated its old code", "Extra safe - two codes!", "Scan both"], correctIndex: 0, explanation: "Real codes are printed flat - a code over a code is the sticker trick." },
      { question: "Why is a bit.ly link 'frosted glass'?", answers: ["It hides the whole destination so you can't check it", "It's shorter, so it's safer", "It's always a virus", "It's shiny"], correctIndex: 0, explanation: "Frosted isn't always evil - but uncheckable means a grown-up checks it, not you." },
    ],
    hard: [
      { question: "A friend forwards a mystery link saying 'OPEN IT!'. The Door Checker move is...", answers: ["Ask what it is and check with a grown-up - friends forward unchecked doors too", "Open it - friends are always safe", "Forward it to more friends", "Open it quickly then close it"], correctIndex: 0, explanation: "A kind sender doesn't tell you where a door goes - only the address does." },
      { question: "The 'barrier rule' means...", answers: ["Unsure = don't tap, don't scan - stop and ask", "Ask a grown-up AFTER you tap, just in case", "Never use links at all", "Build a wall around the computer"], correctIndex: 0, explanation: "You never decide alone - the barrier plus a grown-up beats every mystery door." },
      { question: "An address reads 'cart00ns-4-free.tv'. The tell is...", answers: ["Zeros dressed as letters - a copy-door", "The word FREE - free always means fake", "The dot-tv part", "Nothing - looks fine"], correctIndex: 0, explanation: "Swapped letters and zeros are the copycat trick painted onto an address." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted or removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 16 - into the doorway maze!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "His Doorway Trick is everywhere..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Checker kit ready? Here's the plan." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Three powers to pack. Let's go." } }, // mission brief
    4: { adam: { mood: "thinking", message: "The sign is only paint." }, layla: null }, // learn: sign
    5: { adam: { mood: "curious", message: "Read the plate, not the poster!" }, layla: null }, // game: address plate
    6: { adam: null, layla: { mood: "thumbsup", message: "What does a sign actually promise?" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Whose door IS it, though?" } }, // learn: keyring
    9: { adam: null, layla: { mood: "excited", message: "Check the ring, Cyber Hero!" } }, // game: keyring
    10: { adam: { mood: "thinking", message: "Finish the keyring rule." }, layla: null }, // prove: finish
    11: { adam: { mood: "excited", message: "It has to prove it's yours!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Somebody's covered the real one..." }, layla: null }, // learn: sticker
    13: { adam: { mood: "curious", message: "Thumb on the corner - press!" }, layla: null }, // game: peel test
    14: { adam: { mood: "worried", message: "He's fibbing about stickers - catch him!" }, layla: null }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Thumb beats eyeball every time!" } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "Some panes you just can't read." } }, // learn: glass
    17: { adam: null, layla: { mood: "excited", message: "Read it, or say you can't!" } }, // game: panes
    18: { adam: { mood: "thumbsup", message: "Put the Checker's look in order." }, layla: null }, // prove: order
    19: { adam: { mood: "excited", message: "Saying 'I can't read it' IS the skill!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "And when you really can't tell..." }, layla: null }, // learn: barrier
    21: { adam: { mood: "curious", message: "Barrier out - fetch a grown-up!" }, layla: null }, // game: barrier
    22: { adam: null, layla: { mood: "thumbsup", message: "Quick - you can't tell. Now what?" } }, // prove: speed
    23: { adam: null, layla: { mood: "excited", message: "All five powers - poster time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Every power up on the poster!" } }, // review: power poster
    25: { adam: { mood: "worried", message: "His Doorway Trick - shut it down!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Look at that maze, all checked!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, Cyber Hero!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Door Checker badge earned!" }, layla: null }, // completion
  },
};

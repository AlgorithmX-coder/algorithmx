import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 5 - Cyberbullying: Words Have Power. REBUILT to the Learn-Loop
 * Build Standard v0.10 (2026-09-16, the sixth rebuilt week after W15, W1,
 * W2, W3 and W4). World: the Warm Campfire (moss floor, ember motes, wooden
 * cards, the cast as artists).
 *
 *   0 video · 1 alert · 2 ATLAS briefing · 3 mission
 *   5 x (Learn -> Game -> Prove -> Recap):
 *     1 WHAT   joke or bullying          | dayBalancer "scales"  Laughing Scales   | recall
 *     2 FAULT  never your fault          | growthRings "campfire" Campfire Ring    | finish
 *     3 CALM   don't feed the fire       | dontFeedTheFire (the week's signature) | lie
 *     4 KIND   don't pass it on          | snowballChase Ember Chase              | speed
 *     5 TELL   you don't carry it alone  | passcodeForge "stones" Stepping Stones | order
 *   24 review: accountRescue "moves" The Kind Moves Board (every moment its
 *   own hero move) · 25 quiz boss (5 questions, pass 4) · 26 video · 27
 *   debrief · 28 stickers · 29 completion. 30 screens; the old screen-4
 *   signature slot is gone (a week never opens on a game).
 *
 * THE SENSITIVE WEEK. Design rule (owner-approved, weeks 4-5 design page):
 * nothing is timed against the child, nothing can be failed, the child is
 * never asked to judge a victim or explain a feeling, and no beat ever
 * suggests they brought it on themselves. The Ember Chase runs on its own
 * clock as a demonstration (full stars by design). Reporting and evidence
 * stay in Week 11; Week 5 owns the feelings. The Raccoon's boasts stay in
 * his bubble and mock his own tricks, never a child.
 *
 * Engine reuse (audit-engine-reuse): dayBalancer (W13), growthRings (W17),
 * snowballChase (W12), passcodeForge (W18) are borrowed from legacy weeks
 * that give them up when rebuilt; accountRescue was unused; dontFeedTheFire
 * is this week's own signature, moved behind the lesson that teaches its
 * move. Zero new engines.
 *
 * Voice: Sarah reads the alert caption word for word, every game item as it
 * arrives (`readAloud`), every verdict in one take with its reason (`why`),
 * a teach on every Prove-it, and a spoken payoff on every complete beat.
 * Both content voices are Sarah. Dialogue audited to 0 flags on both layers
 * with `node scripts/audit-narration-flow.mjs --week=5`.
 */
export const WEEK_5: WeekContent = {
  weekNumber: 5,
  title: "Cyberbullying: Words Have Power",
  topic: "cyberbullying",
  badgeName: "Kind Defender",
  badgeIcon: "⭐",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 5: WORDS HAVE POWER", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the group chat pile-on
    { type: "video", videoPlaceholder: "Week 5: The Pile-On", videoSrc: "/videos/module-05-intro.mp4" },

    // 1 - ALERT: incident report (Sarah reads the caption word for word, then reacts)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-05.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon stirred up a group chat and got kids piling on ONE kid with mean messages. Words can really, really hurt - but this week, YOUR words become a superpower.",
      photoCaption: "Wk 5 - The Pile-On",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Cyber Hero, come and read this incident report with me.",
          "The Raccoon stirred up a group chat and got kids piling on ONE kid with mean messages. Words can really, really hurt - but this week, YOUR words become a superpower.",
          "[whispers] Somewhere, that kid is still reading those messages.",
          "[warmly] By the end of today you will know exactly what to do, for yourself and for a friend.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[5] },

    // 3 - Mission brief (learn this, so you're protected from that)
    {
      type: "mission",
      objectives: [
        "Learn the laugh test, so a mean message can never hide behind the word joke",
        "Learn the biggest truth of all, so no mean word can ever make you feel it was your fault",
        "Learn the kind moves that stop a pile-on cold, and who to tell, so you never carry it alone",
      ],
    },

    /* ─────────── BEAT 1 · WHAT BULLYING IS (THE LAUGH TEST) ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Joke... or Bullying?",
      content:
        "Friends joke around, and when BOTH of you are laughing, that is just fun. Bullying is different: it is mean ON PURPOSE, it happens AGAIN AND AGAIN, and only one side is laughing. The test is simple: is everyone laughing, or is someone hurting?",
      bullets: [
        "A joke = BOTH of you are laughing",
        "Bullying = mean ON PURPOSE",
        "Bullying happens again and again",
        "Only one side is laughing",
        "The test: is someone hurting?",
      ],
      bulletIcons: ["💬", "🚫", "🌀", "👀", "💡"],
      emblem: "💬",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Welcome back, Cyber Hero. This week is a big-hearted one.",
          "Friends joke around. When BOTH of you are laughing, that is just fun.",
          "[whispers] Bullying is different. It is mean on purpose, and it happens again and again.",
          "Here is your test: is everyone laughing, or is someone hurting?",
          "That one question works on every chat moment you will ever see.",
          "[excited] Come and put that test to work on some real chat moments!",
        ],
      },
    },
    // 5 - Game: WEIGH "The Laughing Scales" (dayBalancer, scales skin)
    {
      type: "dayBalancer",
      skin: "scales",
      threat: {
        raccoonLine:
          "Heh heh! I love it when kids can't tell the difference. If nobody knows it's bullying, nobody stops it. Just call it a joke and keep going!",
      },
      introTitle: "The Laughing Scales",
      introSubtitle: "Weigh each chat moment: is everyone laughing, or is someone hurting?",
      introIcon: "⭐",
      meterLabel: "MOMENTS WEIGHED",
      leftLabel: "TO WEIGH",
      rightLabel: "WEIGHED",
      swapToast: "WEIGHED!",
      wrongTitle: "Weigh it again",
      completeTitle: "Every moment weighed!",
      completeLine: "You can tell a joke from bullying, every time.",
      keptBlocks: [],
      swaps: [
        {
          id: "lava",
          story: "'Haha, you fell in the lava AGAIN!' and you both crack up laughing.",
          blockLabel: "Lava laugh",
          blockIcon: "💬",
          readAloud: "Haha, you fell in the lava again! And you both crack up laughing.",
          options: [
            { label: "A joke: both laughing", icon: "💬", isBalancing: true, note: "", why: "You are both laughing, so nobody is hurting. That is two friends having fun." },
            { label: "Bullying: one side hurting", icon: "💬", isBalancing: false, note: "Look again: both of you are laughing. When nobody is hurting, it is a joke, not bullying." },
            { label: "Bullying: it happened in a game", icon: "💬", isBalancing: false, note: "Where it happens never decides it. The test is who is laughing and who is hurting." },
          ],
        },
        {
          id: "class-pileon",
          story: "'Everyone laugh at Sam's drawing!' posted to the whole class chat.",
          blockLabel: "Class pile-on",
          blockIcon: "💬",
          readAloud: "Everyone laugh at Sam's drawing! Posted to the whole class chat.",
          options: [
            { label: "Bullying: mean on purpose", icon: "💬", isBalancing: true, note: "", why: "Getting a whole class to laugh AT one kid is mean on purpose. Sam is not laughing." },
            { label: "A joke: both laughing", icon: "💬", isBalancing: false, note: "Ask who is laughing. The class might be, but Sam is hurting. One side laughing is not a joke." },
            { label: "Just a drawing, forget it", icon: "💬", isBalancing: false, note: "It is not about the drawing. Someone is hurting on purpose, and that is what makes it bullying." },
          ],
        },
        {
          id: "nickname",
          story: "A silly team nickname you picked for YOURSELF, and everyone uses it.",
          blockLabel: "My nickname",
          blockIcon: "💬",
          readAloud: "A silly team nickname you picked for yourself, and everyone uses it.",
          options: [
            { label: "A joke: both laughing", icon: "💬", isBalancing: true, note: "", why: "You picked that nickname yourself and you love it. Nobody is hurting, so it is fun, not bullying." },
            { label: "Bullying: mean on purpose", icon: "💬", isBalancing: false, note: "Nobody meant to hurt you with that nickname, and you love it. Mean on purpose is missing, so it is not bullying." },
            { label: "Bullying: names are always mean", icon: "💬", isBalancing: false, note: "A nickname is only mean when it is used to hurt. You picked this one yourself." },
          ],
        },
        {
          id: "every-day",
          story: "The same kid gets called 'loser' every single day.",
          blockLabel: "Every single day",
          blockIcon: "💬",
          readAloud: "The same kid gets called loser, every single day.",
          options: [
            { label: "Bullying: again and again", icon: "💬", isBalancing: true, note: "", why: "That kid hears it every day, and it is mean on purpose. Mean, again and again: that is the pattern, and it is bullying." },
            { label: "A joke: both laughing", icon: "💬", isBalancing: false, note: "Is that kid laughing at being called loser? No. Only one side is, and it keeps happening every day." },
            { label: "Just a game, forget it", icon: "💬", isBalancing: false, note: "Hurting someone every single day is never a game. That is exactly what bullying looks like." },
          ],
        },
        {
          id: "shut-out",
          story: "'Don't let Maya join. Nobody likes her.'",
          blockLabel: "Shut out",
          blockIcon: "💬",
          readAloud: "Don't let Maya join. Nobody likes her.",
          options: [
            { label: "Bullying: mean on purpose", icon: "💬", isBalancing: true, note: "", why: "Shutting Maya out on purpose hurts, even with no rude words. That is a bullying move." },
            { label: "A joke: both laughing", icon: "💬", isBalancing: false, note: "Maya is not laughing. Being left out on purpose hurts, so it fails the test." },
            { label: "Not bullying: no rude words", icon: "💬", isBalancing: false, note: "Bullying does not need rude words. Shutting Maya out on purpose is enough." },
          ],
        },
      ],
      hints: {
        tier1: "Ask the test question: is EVERYONE laughing, or is someone hurting?",
        tier2: "Both laughing means a joke. One side hurting, again and again, or shut out on purpose, means bullying.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your first challenge, we weigh chat moments on the Laughing Scales!",
          "This game is all about telling a joke from bullying.",
          "Out in the real world, a mean message often hides behind the word joke, and the test tells you the truth.",
          "Here is what you do. A chat moment appears in the gold card. Read it, and ask: is everyone laughing, or is someone hurting? Then tap the card that says what it is.",
          "[warmly] Weigh all five, and nobody will ever fool you with the word joke. Ready? Let's weigh!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here is the first moment. Read it, then tap the card that says what it really is."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every moment weighed! Joke or bullying, you can tell them apart now.",
          "[warmly] Out in the real world, when someone says it was just a joke, you know the test: is everyone laughing, or is someone hurting?",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one is BULLYING?",
      choices: [
        { text: "The same kid gets teased every single day", isCorrect: true },
        { text: "You and a friend laugh at the same meme", isCorrect: false, why: "You are both laughing. That is a shared joke, not bullying." },
        { text: "A silly nickname you gave yourself", isCorrect: false, why: "You chose it and you like it. Nobody is hurting." },
        { text: "'I'll beat you next race!' before a rematch", isCorrect: false, why: "That is game talk with everyone smiling. Nobody is hurting." },
      ],
      praise: "Exactly: mean, on purpose, again and again. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Mean, on purpose, again and again. That is bullying.",
          "The others had everyone laughing, so they were just fun.",
          "[warmly] Keep asking your test question: is someone hurting?",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "A joke means BOTH of you are laughing. Bullying is mean on purpose, again and again.",
      next: "the most important truth in this whole course",
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Great start, Cyber Hero. You can weigh a chat moment now.",
          "Joke or bullying: is everyone laughing, or is someone hurting?",
          "[whispers] Now lean in close, because the next lesson is the most important truth in this whole course.",
          "Come and hear it.",
        ],
      },
    },

    /* ─────────── BEAT 2 · IT'S NEVER YOUR FAULT ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "It's NEVER Your Fault",
      content:
        "If someone is mean to you online, here is the truest thing in the world: it is NOT your fault. Not because of what you posted. Not because of your drawing, your game, your face, or your name. Mean words say everything about the person TYPING them, and nothing about you.",
      bullets: [
        "Someone mean to you? NOT your fault",
        "Not because of anything you posted",
        "Not because of anything about you",
        "Mean words describe the person typing them",
        "You never deserve it. Full stop",
      ],
      bulletIcons: ["🛡️", "💬", "⭐", "🚫", "💪"],
      emblem: "🛡️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Ready for the most important truth in this whole course? Come close.",
          "If anyone is ever mean to you online, it is NOT your fault.",
          "Not because of what you posted. Not because of anything about you.",
          "[whispers] Mean words only describe the person typing them.",
          "You never deserve it. Full stop.",
          "[excited] Let's make that feeling strong. Come and sit by the fire with me!",
        ],
      },
    },
    // 9 - Game: REVEAL "The Campfire Ring" (growthRings, campfire skin; no wrong answers)
    {
      type: "growthRings",
      skin: "campfire",
      ringNoun: "stone",
      placeholder: "Tap the glowing stone in the middle to hear the first truth...",
      completeStat: "4/4 stones lit",
      threat: {
        raccoonLine:
          "Here's my sneakiest trick. After a mean message, I whisper one tiny thought: maybe it was YOUR fault. Kids believe that one all by themselves!",
      },
      introTitle: "The Campfire Ring",
      introSubtitle: "Four stones sit around the fire. Tap the glowing one to hear a true thing about you.",
      introIcon: "⭐",
      centerLabel: "YOU",
      revealToast: "TRUE!",
      finale: "Every stone glows. The truth is all around you.",
      completeTitle: "The whole ring is glowing!",
      completeLine: "Four true things, and not one of them is your fault.",
      rings: [
        {
          id: "their-choice",
          label: "THEIR CHOICE",
          icon: "💬",
          title: "Someone chose to be mean",
          text: "Being mean was their choice, made with their fingers. Their choice is their fault, never yours.",
          readAloud: "Someone chose to be mean. Being mean was their choice, made with their fingers. Their choice is their fault, never yours.",
        },
        {
          id: "sharing-good",
          label: "SHARING IS GOOD",
          icon: "⭐",
          title: "Sharing was a kind thing to do",
          text: "You shared a drawing, a game clip, a thought. Kind people smiled. One person chose meanness, and that is about them.",
          readAloud: "Sharing was a kind thing to do. You shared a drawing, a game clip, a thought. Kind people smiled. One person chose meanness, and that is about them.",
        },
        {
          id: "nothing-wrong",
          label: "NOTHING WRONG",
          icon: "🛡️",
          title: "There is nothing wrong with you",
          text: "The kindest, funniest, best kids get picked on too. Being picked on says zero about you.",
          readAloud: "There is nothing wrong with you. The kindest, funniest, best kids get picked on too. Being picked on says zero about you.",
        },
        {
          id: "never-alone",
          label: "NEVER ALONE",
          icon: "👪",
          title: "You are never alone with it",
          text: "Grown-ups you trust were picked on too, once. They can help you carry it, so you never carry it alone.",
          readAloud: "And you are never alone with it. Grown-ups you trust were picked on too, once. They can help you carry it, so you never carry it alone.",
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] On your second challenge, four stones wait for you around the campfire.",
          "This game is all about one truth: mean words are never your fault.",
          "Out in the real world, after a mean message, a gray little doubt can sneak in. This ring is how you answer it.",
          "Here is what you do. Four stones sit around the fire. Tap the glowing one nearest the middle, and I will read the true thing written on it. Then the next stone lights up. There are no wrong taps in this game.",
          "[warmly] Light all four, and the doubt has nowhere left to hide. Ready? Tap the first stone.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the glowing stone in the middle, and I will read what it says."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] The whole ring is glowing, Cyber Hero. Every stone told the truth.",
          "[warmly] Out in the real world, if a gray thought whispers that it was your fault, you know four true things that say it never was.",
        ],
      },
    },
    // 10 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "If someone is mean to you, it's ___ your fault.",
      choices: [
        { text: "never", isCorrect: true },
        { text: "sometimes", isCorrect: false, why: "Not sometimes. Mean words are always the typer's choice." },
        { text: "probably", isCorrect: false, why: "Not probably. Being mean is a choice, and the choice is theirs." },
        { text: "maybe", isCorrect: false, why: "No maybe about it. It is their choice, every time." },
      ],
      praise: "NEVER. Say it like you mean it! ✓",
      nudge: "The truest word in the whole course...",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Never. Say it like you mean it.",
          "Mean words describe the person typing them, not you.",
          "[warmly] Keep that truth somewhere safe. It is your armour.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Mean words are the typer's choice and the typer's fault. Never yours.",
      next: "the clever move for the hot moment, when mean words land",
      emblem: "🛡️",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] That truth is your armour now, Cyber Hero.",
          "Not your fault. Not ever.",
          "[whispers] But what do you actually DO when mean words land and your face goes hot?",
          "Next, we'll learn the clever move for that exact moment. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · DON'T FEED THE FIRE ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Don't Feed the Fire",
      content:
        "When someone is mean, everything in you wants to fire back something MEANER. Here is the secret: mean messages are a fire, and angry replies are wood. Fight back and the fire grows. Stay calm and don't reply, and it cannot grow. Then TELLING a grown-up is what puts it out.",
      bullets: [
        "Mean messages are a FIRE",
        "Angry replies are WOOD for that fire",
        "Fight back = the fire grows",
        "Don't reply = the fire cannot grow",
        "TELLING a grown-up puts it out",
      ],
      bulletIcons: ["⚡", "🌀", "🚫", "✋", "💪"],
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Here it is: the move that keeps you calm when mean words land.",
          "Your face goes hot, and your fingers itch to fire back.",
          "[whispers] But a mean message is a fire, and an angry reply is wood.",
          "Fight back, and the fire grows. Stay calm, and it cannot grow.",
          "Then telling a grown-up puts it out for good.",
          "[excited] Staying calm is the strongest move there is. Come to the campfire and starve some sparks!",
        ],
      },
    },
    // 13 - Game: HOLD "Don't Feed the Fire" (the week's signature, behind its lesson)
    {
      type: "dontFeedTheFire",
      threat: {
        raccoonLine:
          "Mean sparks are my favourite. I only need ONE angry reply to feed them, and the fire does the rest!",
      },
      introTitle: "Don't Feed the Fire",
      introSubtitle: "Mean sparks land by the fire. Press and HOLD the cool river stone until each one fizzles out.",
      introIcon: "✋",
      completeTitle: "The fire went quiet!",
      completeLine: "Three sparks starved, one friend stood up for.",
      sparks: [
        {
          id: "spark-1",
          from: "grumbler_77",
          text: "You're the WORST at this game!",
          readAloud: "A spark lands. It says: you're the worst at this game.",
          why: "No firewood, no fire. You stayed calm and the spark had nothing to burn.",
        },
        {
          id: "spark-2",
          from: "anon_kid",
          text: "Nobody wants you on this team.",
          readAloud: "Another spark. It says: nobody wants you on this team.",
          why: "That spark wanted a reply and got a cool stone instead. It fizzled out.",
        },
        {
          id: "spark-3",
          from: "mega_meanie",
          text: "That was SO silly. Just log off!",
          readAloud: "One more spark. It says: that was so silly, just log off.",
          why: "Three sparks, zero firewood. Calm on the outside is the strongest move there is.",
        },
      ],
      friendRound: {
        id: "friend-1",
        from: "loud_larry",
        text: "Look at Maya's drawing. It's SO bad! Everyone laugh at her!",
        readAloud: "This spark is not aimed at you. It says: look at Maya's drawing, it's so bad, everyone laugh at her.",
        why: "You stood up for Maya the kind way, with no firewood. Now she is not alone, and a grown-up will hear about it.",
      },
      teachSpark: {
        title: "Whoa! That's firewood!",
        body: "Your reply is firewood for that spark. It makes the fire bigger. A hero starves it instead.",
        tip: "Press and HOLD the blue river stone. No firewood, no fire.",
      },
      teachFriend: {
        title: "Mean words back are still firewood!",
        body: "Firing back at that spark still feeds the fire, even when you are helping a friend.",
        tip: "Stand up the kind way. Tap the green STAND UP button.",
      },
      teachStoneOnFriend: {
        title: "This spark isn't aimed at you!",
        body: "That spark is aimed at Maya, and she needs you. Staying quiet leaves a friend all alone.",
        tip: "Tap the green STAND UP button to help her, and tell a grown-up.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your third challenge, mean sparks are landing by our campfire!",
          "This game is all about not feeding the fire.",
          "Out in the real world, the itch to fire back is the fire asking for wood, and you can say no.",
          "Here is what you do. A spark lands with a big red REPLY button. Do not tap it. Press and HOLD the cool blue river stone until the spark fizzles into ash. On the last round a friend is picked on, so tap the green STAND UP button instead.",
          "[warmly] Starve three sparks and stand up for one friend, and you are the calm one. Ready? Here comes the first spark.",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here comes a spark. Press and hold the blue stone until it fizzles out."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] The fire went quiet, Cyber Hero. Three sparks, no firewood, and a friend who is not alone.",
          "[warmly] Out in the real world, when your face goes hot, remember the stone. Stay calm, and then tell a grown-up.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "if someone's mean to you, hit back MEANER, that's how you make it stop!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Hitting back is wood on the fire. Now there are two mean messages, and it grows." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Fighting back feeds the fire. Staying calm stops it growing, and TELLING puts it out. ✓",
      nudge: "What happens to a fire when you add wood?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Busted. Fighting back feeds the fire.",
          "Staying calm stops it growing, and telling a grown-up puts it out.",
          "[warmly] Cool head, warm heart. That is a hero.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Mean messages are a fire and angry replies are wood. Stay calm so it can't grow, and telling a grown-up puts it out.",
      next: "why passing a message on is joining in",
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Three powers, Cyber Hero. You kept your cool in the hottest moments.",
          "No wood for the fire. Not one stick.",
          "[whispers] Now, here is something huge: you can join a pile-on without typing a single word.",
          "Next, we'll learn why passing a message on is joining in. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · DON'T PASS IT ON ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Don't Pass It On",
      content:
        "Here is something huge: you don't have to WRITE a mean message to spread one. Forwarding it, laughing at it, even just adding a laughing emoji, that is joining in. But the opposite is true too: one kind message can turn a whole chat around. That is YOUR superpower.",
      bullets: [
        "Forwarding a mean post = joining in",
        "Laughing along = joining in too",
        "Even one laughing emoji says 'more please'",
        "ONE kind message can flip a whole chat",
        "Kindness is the real superpower here",
      ],
      bulletIcons: ["🌀", "👀", "🚫", "💬", "⭐"],
      emblem: "⭐",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's the huge thing: you don't have to WRITE a mean message to spread one.",
          "Forwarding it, laughing at it, even one little laughing emoji.",
          "[whispers] Every one of those tells the bully: more, please.",
          "But flip it around. One kind message can turn a whole chat.",
          "That is your superpower this week.",
          "[excited] Come and see what happens when one message gets passed on!",
        ],
      },
    },
    // 17 - Game: CHASE "The Ember Chase" (snowballChase, ember skin; a demonstration, full stars)
    {
      type: "snowballChase",
      skin: "embers",
      edgeLabel: "INTO THE NIGHT →",
      threat: {
        raccoonLine:
          "Pass it on, pass it on! Every forward makes a new copy, and NOBODY can catch a copy once it flies. My favourite kind of fire!",
      },
      introTitle: "The Ember Chase",
      introSubtitle: "One tap sends a mean message on. Then try to catch every ember back.",
      introIcon: "🌀",
      startCard: {
        text: "'Pass it on: Maya still sleeps with a teddy bear lol'",
        buttonLabel: "PASS IT ON",
        readAloud: "Here is the message: pass it on, Maya still sleeps with a teddy bear, lol. Tap PASS IT ON once, and watch what happens.",
      },
      ballIcon: "💬",
      sweptLabel: "CAUGHT",
      rolledLabel: "SPREAD",
      captions: ["Catch the embers before they spread!", "They're MULTIPLYING!", "They just keep coming...!"],
      completeTitle: "The embers got away",
      completeLine: "Nobody can catch every copy. Heroes stop it before the first tap.",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your fourth challenge, we watch one message fly in the Ember Chase.",
          "This game is all about what happens when a mean message gets passed on.",
          "Out in the real world, one forward makes copies you can never get back.",
          "Here is what you do. A mean message sits in the card with a PASS IT ON button. Tap it once, just this once, to see what happens. Embers scatter across the field. Tap every ember you can to catch it back.",
          "[warmly] Try your hardest, and watch what the embers do. Ready? Tap the button.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["The embers are flying! Tap every ember you can to catch it back."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[warmly] You tried so hard, Cyber Hero, and the embers still got away. That is not your fault. That is how copies work.",
          "Out in the real world, the only time you can stop a message is BEFORE you pass it on. So you don't. You check on the person instead.",
        ],
      },
    },
    // 18 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one HELPS?",
      choices: [
        { text: "Checking the person is OK", isCorrect: true },
        { text: "Adding one little laughing emoji", isCorrect: false, why: "Even one emoji joins in. It tells the bully: more, please." },
        { text: "Forwarding it to one friend", isCorrect: false, why: "One forward is one more copy, and you can never catch it back." },
      ],
      praise: "Yes: kindness helps, everything else joins in. ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Checking on the person helps. Everything else joins in.",
          "One kind message can flip a whole chat.",
          "[warmly] That is the kind door, and you found it.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Forwarding and laughing along join in. One kind message can flip a whole chat.",
      next: "the last power: you never carry it alone",
      emblem: "⭐",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers, Cyber Hero. You know what one forward really does.",
          "No forwards, no laughing along. One kind message instead.",
          "[whispers] There is one more power, and it is the warmest one of all.",
          "Next, we'll learn how heroes never carry heavy words alone. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · YOU DON'T CARRY IT ALONE ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "You Don't Carry It Alone",
      content:
        "Mean words are heavy, way too heavy to carry by yourself. So heroes don't. If bullying happens, there is a calm path: don't reply to the message, keep it (don't delete it, a grown-up needs to see), then tell someone you trust. Telling isn't snitching. It is how the hurting STOPS.",
      bullets: [
        "Mean words are too heavy to carry alone",
        "Step 1: don't reply",
        "Step 2: keep the message (don't delete it)",
        "Step 3: tell someone you trust",
        "Telling isn't snitching. It is how it stops",
      ],
      bulletIcons: ["💪", "✋", "💬", "👪", "⭐"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Here's the warmest power of all. Heroes share the weight.",
          "Mean words are heavy. Too heavy for one hero to carry.",
          "So there is a calm path across, three steps long.",
          "[whispers] Don't reply. Keep the message, so a grown-up can see it. Then tell someone you trust.",
          "Telling isn't snitching. It is how the hurting STOPS.",
          "[excited] Come and cross the stream with me!",
        ],
      },
    },
    // 21 - Game: CHOOSE PER STEP "The Stepping Stones" (passcodeForge, stones skin)
    {
      type: "passcodeForge",
      skin: "stones",
      promptIcon: "⭐",
      threat: {
        raccoonLine:
          "Delete it, hide it, keep it secret! If nobody ever sees the mean message, nobody ever helps. That's my favourite ending!",
      },
      introTitle: "The Stepping Stones",
      introSubtitle: "Three steps across the stream. At each one, tap the stone a hero would step on.",
      introIcon: "👪",
      meterLabel: "ACROSS THE STREAM",
      meterCountLabel: "CROSSED",
      meterDoneLabel: "ACROSS!",
      strikeToast: "SAFE STONE!",
      wrongTitle: "That stone wobbles!",
      completeTitle: "You're across!",
      completeLine: "Don't reply. Keep it. Tell. You never carry it alone.",
      rounds: [
        {
          id: "first",
          prompt: "The first stone",
          readAloud: "The first stone. Mean words just landed. What do you do first?",
          options: [
            { digits: "Don't reply", tell: "No wood for the fire", isStrong: true, explanation: "", why: "Not replying is the first step, every time. The fire gets nothing to burn." },
            { digits: "Reply, but calmly", tell: "Still a reply", isStrong: false, explanation: "Even a calm reply is still a reply to those mean words. The bully learns you are listening, and the fire gets wood." },
            { digits: "Delete it fast", tell: "Gone in a tap", isStrong: false, explanation: "Deleting feels better for a second, but the proof vanishes with it. First, don't reply." },
          ],
        },
        {
          id: "second",
          prompt: "The second stone",
          readAloud: "The second stone. You didn't reply. Now, what happens to the message?",
          options: [
            { digits: "Keep the message", tell: "A grown-up needs to see it", isStrong: true, explanation: "", why: "Keeping it means a grown-up can see exactly what happened, and help properly." },
            { digits: "Forward it to a friend", tell: "Now it spreads", isStrong: false, explanation: "Forwarding the message makes a copy, and copies fly. Keep it, don't spread it." },
            { digits: "Delete it", tell: "Gone, and no proof", isStrong: false, explanation: "If the message is gone, nobody can help with it. Keep it, so a grown-up can see." },
          ],
        },
        {
          id: "third",
          prompt: "The third stone",
          readAloud: "The third stone. You kept the message. Who hears about it?",
          options: [
            { digits: "Tell someone you trust", tell: "Now you're not alone", isStrong: true, explanation: "", why: "Telling someone you trust is how the hurting stops. The message is kept, a grown-up sees it, and you never carry it alone." },
            { digits: "Keep it to yourself", tell: "Heavy words, carried alone", isStrong: false, explanation: "Keeping the message to yourself is too heavy for one hero. Telling isn't snitching, it's how it stops." },
            { digits: "Wait and see", tell: "The fire gets time", isStrong: false, explanation: "Waiting means nobody hears about it, and the fire gets time to grow. Tell someone you trust today." },
          ],
        },
      ],
      hints: {
        tier1: "Which step comes first, the very second a mean message lands?",
        tier2: "First don't reply, then keep the message as proof, then tell someone you trust.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your last challenge, we cross the stream on the Stepping Stones!",
          "This game is all about the three hero steps when mean words land.",
          "Out in the real world, the steps go in order, and each one makes the next one easier.",
          "Here is what you do. Three stones are offered for each step across the stream. Read all three, then tap the safe one. A wobbly stone teaches you why, and you try again.",
          "[warmly] Cross all three, and you never carry it alone. Ready? First stone!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here are three stones for the first step. Tap the safe one."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] You're across, Cyber Hero! Don't reply, keep it, tell.",
          "[warmly] Out in the real world, those three stones are always there. Step on them in order, and you never carry heavy words alone.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Mean words landed. Tap the hero steps IN ORDER:",
      choices: [
        { text: "Don't reply", isCorrect: true },
        { text: "Keep the message", isCorrect: true },
        { text: "Tell someone you trust", isCorrect: true },
      ],
      praise: "Don't reply. Keep it. Tell. That's the path! ✓",
      nudge: "What's the very FIRST thing, before keeping or telling?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Don't reply. Keep it. Tell. That is the path.",
          "First you starve the fire, then you keep the proof, then you share the weight.",
          "[warmly] Three steps, and you are never alone.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Don't reply, keep the message, tell someone you trust. You never carry it alone.",
      next: "one quick review to make it all stick",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You can weigh a moment, you know it is never your fault, you starve the fire, you stop the chain...",
          "[warmly] and you never carry heavy words alone.",
          "One quick review to make it all stick, then the Raccoon's Echo Machine meets a heart it can't copy. Come on!",
        ],
      },
    },

    // 24 - Consolidation: ASSIGN "The Kind Moves Board" (accountRescue, moves skin: every moment its own move)
    {
      type: "accountRescue",
      skin: "moves",
      threat: {
        raccoonLine:
          "My Echo Machine repeats one move for EVERY moment: fire back! It never notices that different moments need different moves.",
      },
      introTitle: "The Kind Moves Board",
      introSubtitle: "Three chat moments need three different hero moves. Give each one its own.",
      introIcon: "⭐",
      headerLabel: "⭐ Kind Moves Board",
      storyLine: "Three chat moments. Three different hero moves. Give each moment its own.",
      bankPrompt: "Pick the hero move for",
      bankIdle: "Tap a moment first ↑",
      finishLabel: "Match every moment",
      finishReadyLabel: "Board complete →",
      securedLabel: "✓ HERO MOVE",
      pickToast: "HERO MOVE!",
      allToast: "EVERY MOMENT ANSWERED!",
      completeTitle: "Every moment answered!",
      completeLine: "Five powers, three moments, one big heart.",
      wrongTitle: "Not the move for this moment",
      accounts: [
        {
          id: "me-mean",
          label: "A mean message lands on YOU",
          icon: "💬",
          readAloud: "First moment: a mean message lands on you. It says you're rubbish at the game.",
          correctMoveId: "keep-tell",
          why: "Mean words aimed at you: don't reply, keep the message, tell someone you trust. That is the calm path.",
          whyWrong: "This one is aimed at you. Think about the three stones: don't reply, keep it, tell.",
        },
        {
          id: "friend-piled",
          label: "A friend is being piled on",
          icon: "💬",
          readAloud: "Second moment: kids are piling on your friend Sam in the class chat.",
          correctMoveId: "kind-message",
          why: "One kind message straight to Sam flips the moment. Sam knows they are not alone.",
          whyWrong: "Sam is the one hurting here. Which move helps the person who is hurting?",
        },
        {
          id: "pass-it-on",
          label: "'Pass it on' lands on your screen",
          icon: "💬",
          readAloud: "Third moment: an embarrassing photo arrives with pass it on, lol.",
          correctMoveId: "stop-chain",
          why: "That photo goes no further. The chain stops with you, and the friend in it gets checked on.",
          whyWrong: "This one asks you to forward it. Which move stops the chain?",
        },
      ],
      passwordBank: [
        { id: "keep-tell", text: "Don't reply, keep it, tell a grown-up", icon: "⭐" },
        { id: "kind-message", text: "Send them one kind message", icon: "⭐" },
        { id: "stop-chain", text: "Don't forward it, and check they're OK", icon: "⭐" },
        { id: "fire-back", text: "Fire back something meaner", icon: "⭐" },
      ],
      hints: {
        tier1: "Ask: who is hurting in this moment, and what do they need?",
        tier2: "Aimed at you: don't reply, keep it, tell. A friend hurting: one kind message. Pass it on: stop the chain.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Time for your review: the Kind Moves Board!",
          "This game is all about picking the right hero move for each moment.",
          "Out in the real world, moments are different, and so are the moves.",
          "Here is what you do. Three chat moments sit on the board. Tap a moment, and I will read it. Then tap the hero move that fits it from the moves below. Every moment needs its OWN move, so no move can be used twice.",
          "[warmly] Match all three and the board is complete. Ready? Tap the first moment.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap a moment on the board, and I will read it out."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every moment answered, Cyber Hero. Three moments, three different hero moves.",
          "[warmly] Out in the real world, you will meet all three. Now you know which move each one needs, and the Raccoon's echo has nothing to copy.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the chat turns kind
    { type: "video", videoPlaceholder: "Week 5: The Chat Turns Kind", videoSrc: "/videos/module-05-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "what", label: "The Laugh Test", accent: "#00e5ff", icon: "💬", summary: "A joke = both laughing. Bullying = mean on purpose, again and again." },
        { id: "fault", label: "Never Your Fault", accent: "#7c5cff", icon: "🛡️", summary: "Mean words describe the typer, not you. Not your fault, not ever." },
        { id: "calm", label: "Fire Starver", accent: "#ffd158", icon: "✋", summary: "Angry replies are wood for the fire. Stay calm so it can't grow, and telling puts it out." },
        { id: "kind", label: "Stop the Chain", accent: "#ff5fb3", icon: "⭐", summary: "No forwarding, no laughing along. One kind message flips a chat." },
        { id: "tell", label: "Never Alone", accent: "#7eff97", icon: "👪", summary: "Don't reply, keep the message, tell someone you trust." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You know the laugh test, you know it's never your fault,",
          "you starve the fire, you stop the chain...",
          "[warmly] and you never carry heavy words alone.",
          "[excited] The whole chat turned kind, because of YOU. Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "kind-door", name: "Kind Message Sender", icon: "⭐", description: "One kind message, every time." },
        { id: "fire-starver", name: "Fire Starver", icon: "✋", description: "Gives meanness nothing to burn." },
        { id: "never-alone", name: "Never Alone", icon: "👪", description: "Keeps it, tells it, shares the weight." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     5 apply-the-skill questions, one per taught concept, 4 right to pass
     (owner decision, UAT batch 2). Every villain line is distinct. SENSITIVE
     WEEK: his gloats mock his own Echo Machine and his plans, never a child
     and never a victim. Recorded via the narration generator (week5.ts is in
     LEARN_LOOP_WEEKS). */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ff8e6e",
    theme: {
      topic: "Cyberbullying",
      motifs: ["💬", "🛡️", "👍", "🤫", "✋", "⭐", "👪", "🚫"],
    },
    intro: {
      slug: "quiz-w5-intro",
      text: "Testing, testing! My Echo Machine is polished up and ready to repeat every wobbly answer you give me. Speak up, hero, it's hungry!",
    },
    victory: {
      slug: "quiz-w5-victory",
      text: "All that kindness gummed up my speakers! Echo... echo... ech... oh no, it's gone all warm and quiet in here! I'm leaving before I catch the niceness!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w5-c1",
        key: "quiz-w5-c1-1",
        label: "The Laugh Test",
        ask: {
          slug: "quiz-w5-ask-c1-1",
          text: "Adam teases his friend Leo about a typo in the class chat, and Leo posts three laughing faces back. What's the verdict?",
        },
        options: [
          { text: "A shared joke, both of them are laughing" },
          { text: "Bullying, teasing always counts as mean" },
          { text: "Bullying, because it happened in the chat" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Use the laugh test!",
          explanation: "The test is simple: is everyone laughing, or is someone hurting? When both friends are cracking up, that's shared fun. Chats and teasing aren't the problem by themselves.",
        },
        villainRight: {
          slug: "quiz-w5-right-c1-1",
          text: "Both laughing?! My Echo Machine can't echo giggles, they're too bouncy!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c1-1",
          text: "Every tease into the echo bin! My machine never checks who's laughing, hee hee!",
        },
      },
      {
        phaseId: "phase-w5-c2",
        key: "quiz-w5-c2-1",
        label: "Never Your Fault",
        ask: {
          slug: "quiz-w5-ask-c2-1",
          text: "A mean comment lands on Adam's dinosaur drawing, and he thinks: 'I shouldn't have posted it.' What's the truth?",
        },
        options: [
          { text: "Posting was fine, the meanness is the typer's choice" },
          { text: "He should wait to post until he draws better" },
          { text: "It's a little bit his fault for posting in public" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Sharing isn't wrong. Meanness is.",
          explanation: "His drawing made kind people smile, sharing it was a nice thing to do. One person chose to be mean, and that choice belongs completely to the typer, never to Adam.",
        },
        villainRight: {
          slug: "quiz-w5-right-c2-1",
          text: "You blamed the TYPER?! But my doubt clouds were so gray and convincing!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c2-1",
          text: "Yes, blame the drawing! Upside-down thinking, my absolute favorite kind!",
        },
      },
      {
        phaseId: "phase-w5-c3",
        key: "quiz-w5-c3-1",
        label: "Fire Starver",
        ask: {
          slug: "quiz-w5-ask-c3-1",
          text: "'You're the WORST goalie ever' pops up after Layla's game, and her fingers are already typing something meaner back. What happens if she sends it?",
        },
        options: [
          { text: "The fire grows, now there are two mean messages" },
          { text: "The bully learns a lesson and stops" },
          { text: "Nothing much, they started it first" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Angry replies are wood!",
          explanation: "Mean messages are a fire, and firing back is wood: the chat just gets hotter and Layla feels worse, not better. Don't reply, that's what stops the fire growing.",
        },
        villainRight: {
          slug: "quiz-w5-right-c3-1",
          text: "You saw the fire trick coming?! I had a whole wheelbarrow of wood ready!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c3-1",
          text: "TWO mean messages now! The fire says thank you and orders marshmallows!",
        },
      },
      {
        phaseId: "phase-w5-c4",
        key: "quiz-w5-c4-1",
        label: "Stop the Chain",
        ask: {
          slug: "quiz-w5-ask-c4-1",
          text: "An embarrassing photo of Sam is going around with 'pass it on lol', and it lands on Adam's screen. Adam didn't write anything mean. Does forwarding still join in?",
        },
        options: [
          { text: "Yes, every forward spreads the hurt" },
          { text: "No, joining in needs mean words" },
          { text: "Only if he adds a laughing face to it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Forwarding is joining!",
          explanation: "You don't have to write a word to join a pile-on. Forwarding, laughing along, even one little emoji all tell the bully 'more please'. Heroes stop the chain instead.",
        },
        villainRight: {
          slug: "quiz-w5-right-c4-1",
          text: "You didn't forward it?! Chains aren't supposed to have heroes in them!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c4-1",
          text: "Pass it on, pass it on! The best part is nobody thinks they joined in!",
        },
      },
      {
        phaseId: "phase-w5-c5",
        key: "quiz-w5-c5-1",
        label: "Never Alone",
        ask: {
          slug: "quiz-w5-ask-c5-1",
          text: "A mean message about Adam is sitting in his chat, and his first thought is to delete it so he never sees it again. Why keep it instead?",
        },
        options: [
          { text: "A trusted grown-up needs to see it to help" },
          { text: "Deleting messages breaks the chat rules" },
          { text: "He might want to answer it later on" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Keep it, don't delete it!",
          explanation: "Deleting feels better for a second, but the proof vanishes with it. Keep the message, don't reply, and show it to a trusted grown-up, that's how real help arrives.",
        },
        villainRight: {
          slug: "quiz-w5-right-c5-1",
          text: "You KEPT it?! Deleting was supposed to be the comfy choice!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c5-1",
          text: "Delete delete delete! If nobody ever sees it, nobody ever helps!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-05-kind-defender.png",

  // Legacy question pool, required by the WeekContent type; the quiz boss above
  // is what renders.
  bossQuestions: {
    easy: [
      { question: "What makes something BULLYING instead of a joke?", answers: ["Mean on purpose, again and again", "Any joke at all", "Losing a game", "A silly nickname you like"], correctIndex: 0, explanation: "The test: is everyone laughing, or is someone hurting, over and over?" },
      { question: "Someone is mean to you online. Whose fault is it?", answers: ["Theirs, never yours", "Yours for posting", "Both of yours", "Nobody's"], correctIndex: 0, explanation: "Mean words describe the person typing them. Never your fault." },
      { question: "A mean message lands. What do you do FIRST?", answers: ["Don't reply", "Reply in capitals", "Delete everything", "Forward it for advice"], correctIndex: 0, explanation: "No wood for the fire: don't reply, keep it, then tell." },
    ],
    medium: [
      { question: "Why shouldn't you fire back a meaner reply?", answers: ["It feeds the fire and makes it all worse", "Because you might lose", "It takes too long", "You might get in trouble too"], correctIndex: 0, explanation: "Angry replies are wood, the fire grows. Calm stops it growing." },
      { question: "Adding one laughing emoji to a pile-on is...", answers: ["Joining in", "Totally harmless", "Being friendly", "Staying neutral"], correctIndex: 0, explanation: "Even one emoji tells the bully 'more please', and the hurt kid sees it." },
      { question: "Why KEEP a mean message instead of deleting it?", answers: ["So a grown-up can see it and help properly", "To read it again", "To forward it later", "To reply when you're calmer"], correctIndex: 0, explanation: "Proof helps grown-ups stop it. Keep it, don't delete it." },
    ],
    hard: [
      { question: "Your friend is being piled on in the chat. The STRONGEST move is...", answers: ["One kind message + tell a grown-up", "A meaner message at the bullies", "Leaving the chat quietly", "Waiting for it to blow over"], correctIndex: 0, explanation: "Kindness out loud plus real help on the way: that's the upstander move." },
      { question: "Is telling a trusted adult 'snitching'?", answers: ["No, telling is how the hurting stops", "Yes, always", "Only if you could fix it yourself", "Only if it's about you"], correctIndex: 0, explanation: "Snitching gets someone IN trouble. Telling gets someone OUT of it." },
      { question: "What does a pile-on need to keep growing?", answers: ["More people joining in, so don't", "Nothing at all", "One really mean kid", "A faster phone"], correctIndex: 0, explanation: "Pile-ons starve when nobody joins. Your NO is powerful." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29), in lock-step with `screens` above.
  // The 5 recap checkpoints are 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 5: words have power!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "A pile-on... we can fix this." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: null, layla: { mood: "thinking", message: "Both laughing? Or someone hurting?" } }, // learn: what
    5: { adam: { mood: "excited", message: "Weigh every moment, heart first!" }, layla: null }, // game: Laughing Scales
    6: { adam: null, layla: { mood: "thumbsup", message: "Which one's bullying?" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: { mood: "thinking", message: "Lean in. This one matters most." }, layla: null }, // learn: fault
    9: { adam: { mood: "curious", message: "Light every stone!" }, layla: null }, // game: Campfire Ring
    10: { adam: null, layla: { mood: "thumbsup", message: "Finish the truest rule!" } }, // prove: finish
    11: { adam: { mood: "thumbsup", message: "That truth is your armour." }, layla: null }, // recap 2
    12: { adam: null, layla: { mood: "thinking", message: "Don't feed the fire." } }, // learn: calm
    13: { adam: { mood: "curious", message: "Hold the stone. Stay calm." }, layla: null }, // game: Don't Feed the Fire
    14: { adam: null, layla: { mood: "worried", message: "He's fibbing. Catch him!" } }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Cool head: certified!" } }, // recap 3
    16: { adam: { mood: "thinking", message: "One kind message changes everything." }, layla: null }, // learn: kind
    17: { adam: { mood: "excited", message: "Catch those embers!" }, layla: null }, // game: Ember Chase
    18: { adam: null, layla: { mood: "excited", message: "Which choice HELPS?" } }, // prove: speed
    19: { adam: { mood: "thumbsup", message: "The chain stops with you." }, layla: null }, // recap 4
    20: { adam: null, layla: { mood: "thinking", message: "Heavy words need two people." } }, // learn: tell
    21: { adam: null, layla: { mood: "curious", message: "One stone at a time..." } }, // game: Stepping Stones
    22: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers. Review time!" } }, // recap 5
    24: { adam: { mood: "excited", message: "Every moment gets its own move!" }, layla: null }, // review: Kind Moves Board
    25: { adam: { mood: "worried", message: "Turn the whole chat kind!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the chat turn kind!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Kind Defender badge earned!" }, layla: null }, // completion
  },
};

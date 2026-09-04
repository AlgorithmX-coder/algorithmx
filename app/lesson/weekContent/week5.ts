import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 5 - Cyberbullying: Words Have Power.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 WHAT     what cyberbullying is             | conveyorSort    | recall
 *     2 FAULT    it's not your fault               | reveal (💬)     | finish
 *     3 CALM     don't fight back                  | chooseYourPath  | lie
 *     4 KIND     don't pass it on                  | replyCards doors| recall (quick-sort)
 *     5 TELL     tell someone you trust            | stepOrder       | order
 *   Consolidation (cyberScanner, Kindness Scanner skin) -> boss
 *   (placeholder quiz boss - the bespoke W5 UPSTANDER is designed with
 *   the boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * THE SENSITIVE WEEK: warmth-first everywhere. The villain stays OUT of
 * the emotional beats (beat 2's reveal board fronts a 💬, not the
 * Raccoon); nothing is ever the child's fault; the boss form will be
 * UPSTANDER (kindness, never a fight). stepOrder DEBUTS here; replyCards
 * wears its new DOORS skin; the conveyor returns re-themed (kind-or-mean
 * judgment, two weeks after its red-flag outing).
 * Lane-clean: the emotional frame only - report/block protocol details
 * are W11's lane ("tell someone" is taught here, the full protocol there).
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

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[5] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-05.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon stirred up a group chat and got kids piling on ONE kid with mean messages. Words can really, really hurt - but this week, YOUR words become a superpower.",
      photoCaption: "Wk 5 - The Pile-On",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know the difference between a joke and bullying",
        "Learn the biggest truth: it's NEVER your fault",
        "Become the kind one - the hero every chat needs",
      ],
    },

      // SIGNATURE: Do Not Feed the Fire (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "dontFeedTheFire",
        title: "Do Not Feed the Fire",
        narration: {
          speaker: "adam",
          lines: [
            "[warmly] A mean message is a spark that wants to grow.",
            "Don't tap reply. Your reply is firewood for the fire.",
            "Hold the cool river stone until the spark fizzles out.",
          ],
        },
      },

    /* ─────────── BEAT 1 · WHAT CYBERBULLYING IS ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Joke... or Bullying?",
      content:
        "Friends joke around - and when BOTH of you are laughing, that's just fun. Bullying is different: it's mean ON PURPOSE, it happens AGAIN AND AGAIN, and only one side is laughing. The test is simple: is everyone laughing... or is someone hurting?",
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
          "Friends joke around. And when BOTH of you are laughing... that's just fun!",
          "[whispers] But bullying is different.",
          "It's mean on purpose. And it happens again and again.",
          "Here's the test: is everyone laughing... or is someone hurting?",
          "[excited] Let's practice telling them apart!",
        ],
      },
    },
    // 4 - Game: SORT (the conveyor returns - Kind-or-Mean machine)
    {
      type: "conveyorSort",
      categories: [
        { id: "joke", label: "BOTH LAUGHING", icon: "💬", tone: "safe" },
        { id: "mean", label: "MEAN ON PURPOSE", icon: "🚫", tone: "flag" },
      ],
      items: [
        { id: "gg", text: "Haha you fell in the lava AGAIN 😂 - you both crack up", icon: "💬", categoryId: "joke", explanation: "You're BOTH laughing - that's just friends having fun." },
        { id: "everyone-lol", text: "'Everyone laugh at Sam's drawing' - posted to the whole class", icon: "🚫", categoryId: "mean", explanation: "Getting a whole group to laugh AT someone is mean on purpose." },
        { id: "nickname", text: "A silly team nickname you picked for YOURSELF", icon: "⭐", categoryId: "joke", explanation: "You chose it, you love it - that's fun, not bullying." },
        { id: "daily-mean", text: "The same kid gets called 'loser' every single day", icon: "🚫", categoryId: "mean", explanation: "Mean + again and again = bullying. That's the pattern to spot." },
        { id: "banter", text: "'My turn to beat YOU this time!' before a rematch", icon: "🎮", categoryId: "joke", explanation: "Game talk where everyone's smiling - totally fine." },
        { id: "left-out", text: "'Don't let Maya join - nobody likes her'", icon: "🚫", categoryId: "mean", explanation: "Shutting someone out on purpose hurts - that's a bullying move." },
        { id: "typo-tease", text: "A friend giggles at your typo, you giggle too", icon: "💬", categoryId: "joke", explanation: "Both giggling = a shared joke, not a jab." },
        { id: "photo-laugh", text: "Sharing an embarrassing photo of someone to make kids laugh", icon: "🚫", categoryId: "mean", explanation: "Laughing AT someone with their embarrassing photo is mean on purpose." },
      ],
      hints: {
        tier1: "Ask the test question: is EVERYONE laughing... or is someone hurting?",
        tier2: "BOTH LAUGHING = shared fun. MEAN ON PURPOSE = laughing AT someone, again and again, or shutting them out.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The sorting machine is back - with a heart upgrade!",
          "Chat moments are riding the belt.",
          "[warmly] Both laughing? Send it to the fun chute.",
          "[whispers] Mean on purpose? That chute stops it cold.",
          "[excited] Trust the test - is someone hurting?",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here comes the first one - both laughing, or mean on purpose?"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one is BULLYING?",
      choices: [
        { text: "The same kid gets teased every single day", isCorrect: true },
        { text: "You and a friend laugh at the same meme", isCorrect: false },
        { text: "A silly nickname you gave yourself", isCorrect: false },
        { text: "'I'll beat you next race!' before a rematch", isCorrect: false },
      ],
      praise: "Exactly - mean, on purpose, again and again. ✓",
    },

    // 6 - Recap · Concept 1 of 5
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
          "[warmly] Great start, Cyber Hero.",
          "You know the test now: is everyone laughing... or is someone hurting?",
          "[whispers] Now lean in close.",
          "Because the next one is the most important thing we will EVER tell you.",
        ],
      },
    },

    /* ─────────── BEAT 2 · IT'S NOT YOUR FAULT ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "It's NEVER Your Fault",
      content:
        "If someone is mean to you online, here is the truest thing in the world: it is NOT your fault. Not because of what you posted. Not because of your drawing, your game, your face, or your name. Mean words say everything about the person TYPING them - and nothing about you.",
      bullets: [
        "Someone mean to you? NOT your fault",
        "Not because of anything you posted",
        "Not because of anything about you",
        "Mean words describe the person typing them",
        "You never deserve it - full stop",
      ],
      bulletIcons: ["🛡️", "💬", "⭐", "🚫", "💪"],
      emblem: "🛡️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Come close. This is the big one.",
          "If anyone is ever mean to you online...",
          "it is NOT. YOUR. FAULT.",
          "Not because of what you posted. Not because of anything about you.",
          "[whispers] Mean words only describe the person typing them.",
          "[warmly] You never deserve it. Full stop. Let's make that feeling strong.",
        ],
      },
    },
    // 8 - Game: REVEAL (Pop the Doubt Clouds - warm board, no Raccoon)
    {
      type: "reveal",
      title: "Pop the Doubt Clouds",
      subtitle: "Tap each gray cloud to pop it with the truth.",
      boardIcon: "💬",
      items: [
        {
          id: "my-fault",
          label: "'It's my fault...'",
          icon: "🌀",
          steps: [
            { icon: "💬", text: "That gray little thought loves to sneak in. But look at it closely..." },
            { icon: "💡", text: "Someone CHOSE to be mean. That was their choice - not yours." },
          ],
          counter: "POP! Their choice, their fault. Never yours.",
        },
        {
          id: "shouldnt-posted",
          label: "'I shouldn't have posted it...'",
          icon: "🌀",
          steps: [
            { icon: "💬", text: "You shared a drawing. A game clip. A thought. That's a NICE thing to do." },
            { icon: "💡", text: "Kind people saw it and smiled. One person chose meanness - that's about THEM." },
          ],
          counter: "POP! Sharing isn't wrong. Meanness is.",
        },
        {
          id: "something-wrong-me",
          label: "'Maybe something's wrong with me...'",
          icon: "🌀",
          steps: [
            { icon: "💬", text: "The heaviest cloud of all. Let's shine a light on it." },
            { icon: "⭐", text: "Millions of amazing kids get picked on - the BEST kids, the kindest kids." },
            { icon: "💡", text: "Being picked on says ZERO about you, and everything about them." },
          ],
          counter: "POP! There is nothing wrong with you. Nothing.",
        },
        {
          id: "alone",
          label: "'I'm the only one...'",
          icon: "🌀",
          steps: [
            { icon: "💬", text: "It can feel like you're all alone with it. You're not." },
            { icon: "👪", text: "Grown-ups you trust have felt it too - and they can help you carry it." },
          ],
          counter: "POP! You are never, ever alone with this.",
        },
      ],
      finale: "Every doubt cloud - popped! The sky is yours again.",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] When mean words land, gray little doubt clouds show up.",
          "'Maybe it's my fault.' 'Maybe something's wrong with me.'",
          "[whispers] Every single one of those clouds is WRONG.",
          "[excited] Tap each cloud and pop it with the truth!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap any gray cloud - the truth is waiting inside!"],
      },
    },
    // 9 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "If someone is mean to you, it's ___ your fault.",
      choices: [
        { text: "never", isCorrect: true },
        { text: "sometimes", isCorrect: false },
        { text: "probably", isCorrect: false },
        { text: "maybe", isCorrect: false },
      ],
      praise: "NEVER. Say it like you mean it! ✓",
      nudge: "The truest word in the whole course...",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Mean words are the typer's choice and the typer's fault. Never yours.",
      next: "what to do when mean words land - and what not to do",
      emblem: "🛡️",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] That truth is your armor now.",
          "Not your fault. Not ever.",
          "[whispers] Keep it somewhere safe - you might need it one day.",
          "[excited] Next: the clever move when mean words actually land.",
        ],
      },
    },

    /* ─────────── BEAT 3 · DON'T FIGHT BACK ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Don't Feed the Fire",
      content:
        "When someone's mean, everything in you wants to fire back something MEANER. But here's the secret: mean messages are a fire, and angry replies are wood. Fight back and the fire grows. Stay calm and don't reply - that stops the fire GROWING. Then TELLING a grown-up is what puts it out.",
      bullets: [
        "Mean messages are a FIRE",
        "Angry replies are WOOD for that fire",
        "Fight back = the fire grows",
        "Don't reply = the fire stops growing",
        "TELLING a grown-up puts it out",
      ],
      bulletIcons: ["⚡", "🌀", "🚫", "✋", "💪"],
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] When mean words land, your tummy goes hot.",
          "Everything in you wants to fire back something MEANER.",
          "[whispers] But mean messages are a fire...",
          "and angry replies? They're wood.",
          "[excited] Don't feed the fire, and it can't grow. Then TELLING a grown-up puts it out for good.",
          "Staying calm isn't weak. It's the strongest move there is.",
        ],
      },
    },
    // 12 - Game: DECIDE (device skin - the hot moment)
    {
      type: "chooseYourPath",
      presentation: "device",
      scenarios: [
        {
          frame: { appName: "Class Chat", icon: "💬" },
          setup: "Someone posts: 'Your drawing is the WORST in the class 😂' Your face goes hot. Your fingers hover over the keyboard...",
          choices: [
            { text: "Type something meaner back", isSafe: false, consequence: "Now there are TWO mean messages, the fire is bigger, and you feel worse - not better. Fighting back always feeds it." },
            { text: "Don't reply. Breathe. Step away.", isSafe: true, consequence: "The fire got NOTHING to burn. You stayed the calm one - and calm is what heroes look like." },
          ],
        },
        {
          frame: { appName: "Mega Blasters", icon: "🎮" },
          setup: "After you win a race, a player types: 'You only won because you CHEAT.' Everyone in the lobby can see it.",
          choices: [
            { text: "Call THEM a cheater and worse", isSafe: false, consequence: "The lobby turns into a shouting match and the fun is gone for everyone. Wood, meet fire." },
            { text: "Skip it - play the next race", isSafe: true, consequence: "You won the race AND the moment. The sore loser's words just... fizzled out." },
          ],
        },
        {
          frame: { appName: "Class Chat", icon: "💬" },
          setup: "A mean message about your best friend appears. You're SO angry your hands are shaking.",
          choices: [
            { text: "Blast the sender with everything you've got", isSafe: false, consequence: "Now the chat's about YOUR angry message - and your friend still needs real help. Anger fed the fire again." },
            { text: "Stay calm - and go tell a grown-up", isSafe: true, consequence: "THAT'S the move. Calm on the outside, hero on the inside - and real help is on the way for your friend." },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Practice time - and these moments feel HOT.",
          "Your face burns, your fingers itch to fire back.",
          "[whispers] That heat is the fire asking for wood.",
          "[excited] Show it who's boss. Stay calm!",
        ],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "if someone's mean to you, hit back MEANER - that's how you make it stop!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Fighting back feeds the fire. Staying calm stops it growing - and TELLING puts it out. ✓",
      nudge: "What happens to a fire when you add wood?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Mean messages are a fire and angry replies are wood. Stay calm so it can't grow - telling a grown-up puts it out.",
      next: "the move that makes you the hero of any group chat",
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three powers! You kept your cool in the hottest moments.",
          "No wood for the fire. Not one stick.",
          "[warmly] Now for my favorite part of this whole week...",
          "the moment YOU get to be the hero of the story.",
        ],
      },
    },

    /* ─────────── BEAT 4 · DON'T PASS IT ON ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Don't Pass It On",
      content:
        "Here's something huge: you don't have to WRITE a mean message to spread one. Forwarding it, laughing at it, even just adding a 😂 - that's joining in. But the opposite is true too: one kind message can turn a whole chat around. That's YOUR superpower.",
      bullets: [
        "Forwarding a mean post = joining in",
        "Laughing along = joining in too",
        "Even one 😂 tells the bully 'more please'",
        "But ONE kind message can flip a whole chat",
        "Kindness is the real superpower here",
      ],
      bulletIcons: ["🌀", "👀", "🚫", "💬", "⭐"],
      emblem: "⭐",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's something huge.",
          "You don't have to WRITE a mean message to spread one.",
          "Forwarding it... laughing at it... even one little laughing emoji...",
          "[whispers] that all tells the bully: 'more, please.'",
          "[excited] But flip it around! ONE kind message can turn a whole chat.",
          "Four doors are coming up. Only one is the kind one!",
        ],
      },
    },
    // 16 - Game: SELECT (the Four Doors of Kindness - replyCards doors skin)
    {
      type: "replyCards",
      skin: "doors",
      introTitle: "The Four Doors",
      introSubtitle: "A mean post lands in the chat. Four doors open - only ONE is the hero's door.",
      introIcon: "🚪",
      rounds: [
        {
          id: "photo-pileon",
          from: "In the class chat",
          fromIcon: "💬",
          message: "Someone posts an embarrassing photo of Sam and kids are adding 😂😂😂. What do you do?",
          replies: [
            { text: "Add my own 😂", isSafe: false, explanation: "Even one emoji joins the pile-on - it tells everyone 'this is fine'. It isn't." },
            { text: "Forward it to another chat", isSafe: false, explanation: "Forwarding spreads the hurt to MORE people. That's joining in, big time." },
            { text: "Message Sam: 'Ignore them - want to play later?'", isSafe: true, explanation: "One kind message, straight to Sam - that's the hero's door." },
            { text: "Say nothing and scroll past", isSafe: false, explanation: "Good instinct - you didn't join in! But the HERO door is checking on Sam. One kind message changes everything." },
          ],
        },
        {
          id: "mean-video",
          from: "In the game lobby",
          fromIcon: "🎮",
          message: "A player shares a clip making fun of the newest kid's first game. Everyone's watching. What do you do?",
          replies: [
            { text: "'Everyone starts somewhere - good first game!'", isSafe: true, explanation: "One kind line, said out loud - the new kid knows they're not alone." },
            { text: "Watch it again and laugh", isSafe: false, explanation: "Laughing along feeds it - the new kid sees who laughed." },
            { text: "Share it with your team", isSafe: false, explanation: "Sharing spreads the sting further. That's the pass-it-on trap." },
            { text: "Quietly leave the lobby", isSafe: false, explanation: "Good move - you didn't laugh along! But the HERO move is one kind line in the chat. That's what helps the new kid." },
          ],
        },
        {
          id: "rumour",
          from: "In a group message",
          fromIcon: "💬",
          message: "'Pass it on: Maya still sleeps with a teddy bear lol' - it's been forwarded 4 times already. What do you do?",
          replies: [
            { text: "Pass it on - everyone else did", isSafe: false, explanation: "Every forward makes it worse. 'Everyone else did' is how pile-ons grow." },
            { text: "Add 'haha so true'", isSafe: false, explanation: "That's joining the pile-on with extra sting for Maya." },
            { text: "Reply 'lol' just to fit in", isSafe: false, explanation: "Even a tiny 'lol' joins in. Fitting in with meanness is still meanness." },
            { text: "Don't forward it - and check Maya's OK", isSafe: true, explanation: "The chain stops with YOU - and Maya gets a friend checking in." },
          ],
        },
      ],
      hints: {
        tier1: "The hero door is the one that helps the person HURTING - not the one that gets a laugh.",
        tier2: "Laughing, forwarding and 'lol' all join in. The kind door checks on the person and passes NOTHING on.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] A mean post just landed in the chat.",
          "Four doors swing open in front of you.",
          "[whispers] Three of them join the meanness - some sneakily.",
          "[excited] Find the hero's door. It's the KIND one!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read all four doors - then walk through the kind one!"],
      },
    },
    // 17 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these HELPS?",
      choices: [
        { text: "Checking the person is OK", isCorrect: true },
        { text: "Adding one little 😂", isCorrect: false },
        { text: "Forwarding it to one friend", isCorrect: false },
      ],
      praise: "Yes - kindness helps, everything else joins in. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Forwarding and laughing along join in. One kind message can flip a whole chat.",
      next: "the last power - you never carry this alone",
      emblem: "⭐",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four powers! You found the kind door every time.",
          "No forwards. No laughing along.",
          "[warmly] Just one hero, being kind, out loud.",
          "One last power now - and it's a warm one.",
        ],
      },
    },

    /* ─────────── BEAT 5 · TELL SOMEONE YOU TRUST ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "You Don't Carry It Alone",
      content:
        "Mean words are heavy - way too heavy to carry by yourself. So heroes don't. If bullying happens, there's a calm path: don't reply to the message, keep it (don't delete - a grown-up needs to see), then tell someone you trust. Telling isn't snitching. It's how the hurting STOPS.",
      bullets: [
        "Mean words are too heavy to carry alone",
        "Step 1: don't reply",
        "Step 2: keep the message (don't delete it)",
        "Step 3: tell someone you trust",
        "Telling isn't snitching - it's how it stops",
      ],
      bulletIcons: ["💪", "✋", "💬", "👪", "⭐"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Last power. And it might be the warmest one.",
          "Mean words are heavy. Too heavy for one hero to carry.",
          "[whispers] So heroes don't carry them alone.",
          "Don't reply. Keep the message so a grown-up can see it.",
          "Then tell someone you trust.",
          "[excited] Telling isn't snitching - it's how the hurting STOPS. Let's walk the path!",
        ],
      },
    },
    // 20 - Game: ORDER (stepOrder debut - the Calm Path)
    {
      type: "stepOrder",
      introTitle: "The Calm Path",
      introSubtitle: "Mean words landed. Cross the river one stone at a time - in the order a hero would.",
      introIcon: "💬",
      steps: [
        { id: "dont-reply", text: "Don't reply", icon: "✋", affirmation: "That's it - no wood for the fire!" },
        { id: "keep-it", text: "Keep the message", icon: "💬", affirmation: "Smart - a grown-up needs to SEE it." },
        { id: "tell", text: "Tell someone you trust", icon: "👪", affirmation: "The hero step. Now you're not alone!" },
      ],
      hints: {
        tier1: "What would a hero do FIRST, the very second a mean message lands?",
        tier2: "First don't reply, then keep the message as proof, THEN tell someone you trust.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] See the river? Mean words are on this side.",
          "Feeling better is on the other.",
          "[whispers] Three stepping stones take you across.",
          "[excited] Tap the steps in the order a hero would take them!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Which step comes first? Tap it and hop on!"],
      },
    },
    // 21 - Prove: PUT-IN-ORDER
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
      nudge: "What's the very FIRST thing - before keeping or telling?",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Don't reply, keep the message, tell someone you trust. You never carry it alone.",
      next: "one final drill, then it's time to turn a whole chat kind",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You know what bullying is, you know it's never your fault,",
          "you stay calm, you choose the kind door...",
          "[warmly] and you never, ever carry it alone.",
          "[excited] Quick final drill - then let's make a whole chat kind again!",
        ],
      },
    },

    // 23 - Consolidation: The Kindness Scanner (W1 scanner engine, W5 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "HERO MOVE",
        negative: "FEEDS IT",
        positiveHint: "Tap HERO MOVE for the kind, calm choices",
        negativeHint: "Tap FEEDS IT for anything that helps the meanness grow",
        tipWhenPositive: "Kind messages, staying calm, keeping proof and telling a grown-up - hero moves, all of them.",
        tipWhenNegative: "Firing back, forwarding, laughing along and carrying it alone - they all feed the meanness.",
        hint1: "Ask: does this choice HELP the person hurting... or help the meanness spread?",
        hint2: "HERO MOVE = kind, calm, tell. FEEDS IT = reply-mean, forward, laugh along, stay silent and alone.",
        hint2Example: "HERO: 'You OK, Sam?'   FEEDS IT: forwarding the photo",
        hint3: "Quick rule card: never your fault · don't feed the fire · don't pass it on · don't reply, keep it, tell.",
        hint3Example: "One kind message ✅    One little 😂 ❌",
      },
      items: [
        { text: "Messaging the picked-on kid: 'Want to play later?'", isStrong: true, explanation: "One kind message - the strongest move in the whole week." },
        { text: "Firing back something even meaner", isStrong: false, explanation: "Wood on the fire - now there are two mean messages." },
        { text: "Adding a 😂 to the pile-on", isStrong: false, explanation: "Even one emoji joins in and asks for more." },
        { text: "Keeping the mean message to show a grown-up", isStrong: true, explanation: "Proof helps grown-ups stop it properly - keep, don't delete." },
        { text: "Forwarding the embarrassing photo 'just to one friend'", isStrong: false, explanation: "Every forward spreads the hurt further. No exceptions." },
        { text: "Telling someone you trust what happened", isStrong: true, explanation: "The hero step - telling is how the hurting stops." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Final drill! Choices are drifting past.",
          "Tap HERO MOVE for the kind and calm ones...",
          "and FEEDS IT for anything that helps meanness grow.",
          "[warmly] Five powers. One big heart. Show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W5 UPSTANDER comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the chat turns kind
    { type: "video", videoPlaceholder: "Week 5: The Chat Turns Kind", videoSrc: "/videos/module-05-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "what", label: "The Laugh Test", accent: "#00e5ff", icon: "💬", summary: "A joke = both laughing. Bullying = mean on purpose, again and again." },
        { id: "fault", label: "Never Your Fault", accent: "#7c5cff", icon: "🛡️", summary: "Mean words describe the typer, not you. Not your fault - not ever." },
        { id: "calm", label: "Fire Starver", accent: "#ffd158", icon: "✋", summary: "Angry replies are wood for the fire. Stay calm so it can't grow - telling puts it out." },
        { id: "kind", label: "The Kind Door", accent: "#ff5fb3", icon: "⭐", summary: "No forwarding, no laughing along - one kind message flips a chat." },
        { id: "tell", label: "Never Alone", accent: "#7eff97", icon: "👪", summary: "Don't reply, keep the message, tell someone you trust." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You know the laugh test, you know it's never your fault,",
          "you starve the fire, you open the kind door...",
          "[warmly] and you never carry heavy words alone.",
          "[excited] The whole chat turned kind - because of YOU. Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "kind-door", name: "Kind Door Opener", icon: "⭐", description: "One kind message, every time." },
        { id: "fire-starver", name: "Fire Starver", icon: "✋", description: "Gives meanness nothing to burn." },
        { id: "never-alone", name: "Never Alone", icon: "👪", description: "Keeps it, tells it, shares the weight." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     Same contract as W1: 15 apply-the-skill questions, 3 per taught
     concept, interleaved round-robin (c1..c5, c1..c5, c1..c5). Every
     villain line below is DISTINCT (zero repeated phrases in this file).
     SENSITIVE WEEK: his gloats mock his own Echo Machine and his plans,
     never a child and never a victim.
     TODO(audio): record every slug below (villain = Callum via the
     cyberheroes-narration-audio pipeline); browser TTS speaks each text
     until its clip exists at /audio/villain/{slug}.mp3. */
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
        label: "The Kind Door",
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
          text: "The chain stopped at YOU?! Chains aren't supposed to have heroes in them!",
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
      {
        phaseId: "phase-w5-c1",
        key: "quiz-w5-c1-2",
        label: "The Laugh Test",
        ask: {
          slug: "quiz-w5-ask-c1-2",
          text: "Every day this week, the same player has called Maya 'slowpoke' in the game, and Maya has stopped joining. What makes this bullying instead of a joke?",
        },
        options: [
          { text: "It's mean on purpose, again and again" },
          { text: "It happened inside a video game" },
          { text: "Slowpoke is a banned word online" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Spot the pattern!",
          explanation: "No word is banned on its own, and games aren't the problem. Mean on purpose, repeated day after day, with only one side laughing: that's the bullying pattern.",
        },
        villainRight: {
          slug: "quiz-w5-right-c1-2",
          text: "You spotted the again-and-again pattern?! My repeat button is my favorite button!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c1-2",
          text: "Game words don't count! (A rule I just made up this second.)",
        },
      },
      {
        phaseId: "phase-w5-c2",
        key: "quiz-w5-c2-2",
        label: "Never Your Fault",
        ask: {
          slug: "quiz-w5-ask-c2-2",
          text: "Someone has been mean to Layla in chat three times this week, and she starts wondering if something is wrong with HER. What do mean words actually tell you about?",
        },
        options: [
          { text: "The person typing them, nothing else" },
          { text: "Both people, a little bit each" },
          { text: "Whoever gets picked on the most" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Mean words describe the typer!",
          explanation: "Being picked on says zero about Layla, the kindest, most amazing kids get picked on too. Mean words only ever describe the person choosing to type them.",
        },
        villainRight: {
          slug: "quiz-w5-right-c2-2",
          text: "Nothing else?! But I aimed those words SO carefully at the wrong target!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c2-2",
          text: "Split the blame, a little each! Half-price fault for everybody!",
        },
      },
      {
        phaseId: "phase-w5-c3",
        key: "quiz-w5-c3-2",
        label: "Fire Starver",
        ask: {
          slug: "quiz-w5-ask-c3-2",
          text: "A player calls Adam a cheater in front of the whole lobby, and Adam is boiling inside. What does staying calm actually do to the meanness?",
        },
        options: [
          { text: "Starves it, no reply means nothing to burn" },
          { text: "Nothing, staying calm is just being shy" },
          { text: "Saves his energy for a comeback later" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Calm is the power move!",
          explanation: "Staying calm isn't weak or shy, and comebacks are just slow wood. A mean message that gets no reply has nothing to burn, so it fizzles while Adam plays the next race.",
        },
        villainRight: {
          slug: "quiz-w5-right-c3-2",
          text: "It FIZZLED?! A mean message with no reply is just me shouting at a wall!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c3-2",
          text: "Calm is shy, loud is strong! Now say that back to me angrily, please!",
        },
      },
      {
        phaseId: "phase-w5-c4",
        key: "quiz-w5-c4-2",
        label: "The Kind Door",
        ask: {
          slug: "quiz-w5-ask-c4-2",
          text: "Kids are dropping laughing emojis on the new kid's very first game, and Layla wants to be the hero of this chat. Which move flips it?",
        },
        options: [
          { text: "One kind message, said out loud in the chat" },
          { text: "Leaving the lobby so she's not part of it" },
          { text: "Watching quietly without adding an emoji" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Kindness out loud wins!",
          explanation: "Not joining in is good, but the hero move goes one step further. One kind message out loud shows the new kid they're not alone, and it can turn the whole chat warm again.",
        },
        villainRight: {
          slug: "quiz-w5-right-c4-2",
          text: "One kind message and the whole lobby went WARM?! My echo hates warm!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c4-2",
          text: "Tiptoe away, look away! An empty room is almost as good as a mean one!",
        },
      },
      {
        phaseId: "phase-w5-c5",
        key: "quiz-w5-c5-2",
        label: "Never Alone",
        ask: {
          slug: "quiz-w5-ask-c5-2",
          text: "Layla told her mom about the mean messages, and her tummy already feels lighter. Then a classmate says: 'You snitched!' What's true?",
        },
        options: [
          { text: "Telling isn't snitching, it's how hurting stops" },
          { text: "It was snitching, but worth it this once" },
          { text: "It only counts as telling if it's about you" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Telling is the hero step!",
          explanation: "Snitching tries to get someone IN trouble. Telling gets someone OUT of hurt. Heroes never carry heavy words alone, and telling someone you trust is exactly how the hurting stops.",
        },
        villainRight: {
          slug: "quiz-w5-right-c5-2",
          text: "She told and felt LIGHTER?! Heavy was the whole entire point!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c5-2",
          text: "Snitch snitch! Keep every heavy word to yourself, they're collectible!",
        },
      },
      {
        phaseId: "phase-w5-c1",
        key: "quiz-w5-c1-3",
        label: "The Laugh Test",
        ask: {
          slug: "quiz-w5-ask-c1-3",
          text: "Layla nicknames herself 'CaptainClumsy' after tripping, and everyone giggles WITH her. Later, kids start calling Sam 'CaptainClumsy' to make him feel small. Same nickname, so what changed?",
        },
        options: [
          { text: "Who's laughing: with her, but at him" },
          { text: "Nothing, nicknames are always just fun" },
          { text: "The nickname got too old to be funny" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "With you or at you?",
          explanation: "The words stayed the same, the laughing moved. Layla picked her nickname and laughed along. Sam didn't pick it and isn't laughing, and when someone's hurting, it stopped being a joke.",
        },
        villainRight: {
          slug: "quiz-w5-right-c1-3",
          text: "You tracked where the laugh WENT?! I thought recycled nicknames were untraceable!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c1-3",
          text: "Same name, same joke, no difference! My echo plays reruns all day long!",
        },
      },
      {
        phaseId: "phase-w5-c2",
        key: "quiz-w5-c2-3",
        label: "Never Your Fault",
        ask: {
          slug: "quiz-w5-ask-c2-3",
          text: "Sam keeps getting mean messages about his favorite hobby, and a friend suggests: 'Just change your hobby and they'll stop.' Is the hobby the problem?",
        },
        options: [
          { text: "No, the bully's choice is the only problem" },
          { text: "Partly, unusual hobbies invite teasing" },
          { text: "Yes, quieter hobbies are safer online" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The hobby was never the problem!",
          explanation: "Sam's hobby is great, and hiding it wouldn't fix a thing, because the meanness was never really about the hobby. It's the typer's choice and the typer's fault, full stop.",
        },
        villainRight: {
          slug: "quiz-w5-right-c2-3",
          text: "The hobby STAYS?! I was so sure you'd blame the hobby!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c2-3",
          text: "Swap the hobby, hide the fun! An idea only I could love!",
        },
      },
      {
        phaseId: "phase-w5-c3",
        key: "quiz-w5-c3-3",
        label: "Fire Starver",
        ask: {
          slug: "quiz-w5-ask-c3-3",
          text: "Layla is SO angry about a mean message that her hands are shaking, and she really wants to fight back. What's the calm-and-strong path?",
        },
        options: [
          { text: "Breathe, don't reply, and tell a trusted grown-up" },
          { text: "Send one small mean reply, then stop there" },
          { text: "Wait an hour, then fire back calmly" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Shaky hands, steady plan!",
          explanation: "One small mean reply is still wood, and a comeback an hour later burns just the same. Breathe until the shake fades, reply with nothing, and let a trusted grown-up help put it out.",
        },
        villainRight: {
          slug: "quiz-w5-right-c3-3",
          text: "You BREATHED?! Nobody breathes! My whole plan runs on shaky hands!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c3-3",
          text: "An hour later still burns beautifully! Slow wood is still wood!",
        },
      },
      {
        phaseId: "phase-w5-c4",
        key: "quiz-w5-c4-3",
        label: "The Kind Door",
        ask: {
          slug: "quiz-w5-ask-c4-3",
          text: "'Haha pass it on: Leo still wears armbands at the pool.' It's been forwarded loads already, so one more won't matter... right?",
        },
        options: [
          { text: "Wrong, every single forward makes it heavier" },
          { text: "Right, it's already everywhere anyway" },
          { text: "Right, if she adds 'this isn't nice' under it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The chain stops with you!",
          explanation: "A forward with a kind note stapled on is still a forward, and 'it's everywhere anyway' is exactly how pile-ons grow. Stop the chain, then check that Leo is okay.",
        },
        villainRight: {
          slug: "quiz-w5-right-c4-3",
          text: "You checked on LEO instead?! That was my juiciest forward of the year!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c4-3",
          text: "One more is free, it's everywhere anyway! That's pile-on math!",
        },
      },
      {
        phaseId: "phase-w5-c5",
        key: "quiz-w5-c5-3",
        label: "Never Alone",
        ask: {
          slug: "quiz-w5-ask-c5-3",
          text: "Mean messages keep landing, and Sam has already done 'don't reply' and 'keep the message'. He's tired and wants to skip the last step. Which step finishes the path?",
        },
        options: [
          { text: "Tell someone you trust, every single time" },
          { text: "Wait quietly for the messages to stop" },
          { text: "Mute the chat and handle it all alone" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The last stone matters most!",
          explanation: "The first two steps stop the fire growing, but only telling shares the weight and brings real help. A trusted grown-up, a parent, a caregiver, a teacher: that's how the path ends and the hurting stops.",
        },
        villainRight: {
          slug: "quiz-w5-right-c5-3",
          text: "He TOLD someone?! Shared between two, heavy words weigh nothing, and that's TERRIBLE news for me!",
        },
        villainWrong: {
          slug: "quiz-w5-wrong-c5-3",
          text: "Handle it alone, super duper quietly! Lonely heroes are my best customers!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-05-kind-defender.png",

  bossAttacks: [
    { name: "PILE-ON",     icon: "🌀", color: "#7c5cff", glow: "rgba(124, 92, 255, 0.55)", tag: "Don't join in",              emblemColor: 0x7c5cff },
    { name: "MEAN ECHO",   icon: "💬", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "No wood for the fire",       emblemColor: 0xff5fb3 },
    { name: "LONELY CLOUD", icon: "🌀", color: "#5d6a99", glow: "rgba(93, 106, 153, 0.55)", tag: "You never carry it alone",  emblemColor: 0x5d6a99 },
  ],

  // Placeholder quiz boss (the bespoke W5 UPSTANDER - win by kindness,
  // never force - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What makes something BULLYING instead of a joke?", answers: ["Mean on purpose, again and again", "Any joke at all", "Losing a game", "A silly nickname you like"], correctIndex: 0, explanation: "The test: is everyone laughing, or is someone hurting - over and over?" },
      { question: "Someone is mean to you online. Whose fault is it?", answers: ["Theirs - never yours", "Yours for posting", "Both of yours", "Nobody's"], correctIndex: 0, explanation: "Mean words describe the person typing them. Never your fault." },
      { question: "A mean message lands. What do you do FIRST?", answers: ["Don't reply", "Reply in capitals", "Delete everything", "Forward it for advice"], correctIndex: 0, explanation: "No wood for the fire - don't reply, keep it, then tell." },
    ],
    medium: [
      { question: "Why shouldn't you fire back a meaner reply?", answers: ["It feeds the fire and makes it all worse", "Because you might lose", "It takes too long", "You might get in trouble too"], correctIndex: 0, explanation: "Angry replies are wood - the fire grows. Calm stops it growing." },
      { question: "Adding one 😂 to a pile-on is...", answers: ["Joining in", "Totally harmless", "Being friendly", "Staying neutral"], correctIndex: 0, explanation: "Even one emoji tells the bully 'more please' - and the hurt kid sees it." },
      { question: "Why KEEP a mean message instead of deleting it?", answers: ["So a grown-up can see it and help properly", "To read it again", "To forward it later", "To reply when you're calmer"], correctIndex: 0, explanation: "Proof helps grown-ups stop it - keep it, don't delete it." },
    ],
    hard: [
      { question: "Your friend is being piled on in the chat. The STRONGEST move is...", answers: ["One kind message + tell a grown-up", "A meaner message at the bullies", "Leaving the chat quietly", "Waiting for it to blow over"], correctIndex: 0, explanation: "Kindness out loud + real help on the way - that's the upstander move." },
      { question: "Is telling a trusted adult 'snitching'?", answers: ["No - telling is how the hurting stops", "Yes, always", "Only if you could fix it yourself", "Only if it's about you"], correctIndex: 0, explanation: "Snitching gets someone IN trouble. Telling gets someone OUT of it." },
      { question: "What does a pile-on need to keep growing?", answers: ["More people joining in - so don't", "Nothing at all", "One really mean kid", "A faster phone"], correctIndex: 0, explanation: "Pile-ons starve when nobody joins. Your NO is powerful." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 5 - words have power!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "A pile-on... we can fix this." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "Both laughing? Or someone hurting?" } }, // learn: what
    4: { adam: { mood: "excited", message: "Work those chutes - heart first!" }, layla: null }, // game: conveyorSort
    5: { adam: null, layla: { mood: "thumbsup", message: "Which one's bullying?" } }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: { mood: "thinking", message: "Lean in. This one matters most." }, layla: null }, // learn: fault
    8: { adam: { mood: "curious", message: "Pop every doubt cloud!" }, layla: null }, // game: reveal
    9: { adam: null, layla: { mood: "thumbsup", message: "Finish the truest rule!" } }, // prove: finish
    10: { adam: { mood: "thumbsup", message: "That truth is your armor." }, layla: null }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "Don't feed the fire." } }, // learn: calm
    12: { adam: { mood: "curious", message: "Feel the heat? Stay calm." }, layla: null }, // game: decide
    13: { adam: null, layla: { mood: "worried", message: "He's fibbing - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Cool head: certified!" } }, // recap 3
    15: { adam: { mood: "thinking", message: "One kind message changes everything." }, layla: null }, // learn: kind
    16: { adam: { mood: "excited", message: "Find the hero's door!" }, layla: null }, // game: replyCards doors
    17: { adam: null, layla: { mood: "excited", message: "Which choice HELPS?" } }, // prove: recall
    18: { adam: { mood: "thumbsup", message: "The kind door, every time." }, layla: null }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "Heavy words need two people." } }, // learn: tell
    20: { adam: null, layla: { mood: "curious", message: "One stone at a time..." } }, // game: stepOrder
    21: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: { mood: "excited", message: "Hero move or feeds it - scan fast!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "Turn the whole chat kind!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the chat turn kind!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Kind Defender badge earned!" }, layla: null }, // completion
  },
};

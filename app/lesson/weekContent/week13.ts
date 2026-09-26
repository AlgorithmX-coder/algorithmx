import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 13 - Screen Time: Balance Your Power.
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE POWER STATION -
 * a warm plant on the edge of town where a hero's charge is made, measured and
 * spent. In-week flavour: the Battery Thief.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 SIZE    screens are brilliant AND have a size | dayBalancer "seesaw" | recall
 *     2 TRADE   a day holds only so much              | dayJug (signature)   | finish
 *     3 SET     decide it before you start            | setTheDial NEW       | lie
 *     4 OFF     stopping is a ritual, not a fight     | powerPanel "powerdown"| order
 *     5 NIGHT   the last hour belongs to your body    | nightFall NEW        | speed
 *   review (memoryMatch, station skin) -> boss -> video -> debrief -> stickers
 *   -> completion. 30 screens, no game before Learn 1.
 *
 * **NEVER ANTI-SCREEN.** This is the one tone rule the legacy week wrote down
 * and it survives the rebuild intact: balance means SOME, not none. The see-saw
 * in concept 1 is level with screen blocks still aboard, never emptied. No guilt,
 * no "too much telly" scolding, and the child is never the problem.
 *
 * **The Four Body-Bells are GONE from this week (decided 2026-09-19).** The
 * legacy concept 2 taught "notice the signs your body gives you", and Week 10's
 * Pause Power, live since 2026-09-18, already teaches exactly that with the same
 * four signs and the same verb. Splitting them by scope (one sitting vs a day)
 * is too fine a distinction for a six-year-old and fails the owner's test that a
 * parent must not mistake two weeks side by side. **Week 10 owns body signals.**
 * The slot became "Set It Before You Start", which is proactive where Week 10 is
 * reactive and is taught nowhere else in the twenty weeks. The `bodyCheck` engine
 * the design called for was dropped with it.
 *
 * Engine allocation (owner option B: max 2 concept re-themes per week plus the
 * review slot; see RETHEME_ALLOWED[13] in scripts/audit-engine-reuse.mjs):
 * - dayJug is this week's own screen-4 signature, converted to tap-only and
 *   moved to concept 2, where a day that holds only so much belongs.
 * - setTheDial and nightFall are NEW. setTheDial COMPOSES a plan on three dials
 *   and commits it, rather than picking one card of three, which four engines
 *   already do. nightFall clears a room and darkens a sky.
 * - dayBalancer returns from Week 5 as the see-saw: concept re-theme 1. Week 5
 *   weighed whether a chat moment was a joke or a hurt; this weighs a day.
 * - powerPanel returns from Weeks 6 and 10 as the shutdown panel: concept
 *   re-theme 2, and its third and final use. Finding the right controls in the
 *   right order IS the stopping ritual.
 * - memoryMatch returns from Weeks 1 and 7 as the review, its third and final use.
 *
 * Lane-clean: the SIZE of screen time and how you steer it. The autoplay PULL is
 * Week 10's, in-game spending is Week 7's, and body signals are Week 10's.
 */
export const WEEK_13: WeekContent = {
  weekNumber: 13,
  title: "Screen Time: Balance Your Power",
  topic: "screen-time",
  badgeName: "Battery Keeper",
  badgeIcon: "⚡",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 13: BALANCE YOUR POWER", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the power station
    { type: "video", videoPlaceholder: "Week 13: Balance Your Power", videoSrc: "/videos/module-13-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-13.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has a new hobby: battery thieving. Not phone batteries, KID batteries. He loves heroes drained and glued to the glow, because a tired hero is an easy hero to trick. This week you take your power back. Screens stay in your life. You just get to say how big they are.",
      photoCaption: "Wk 13 - The Battery Thief",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, read this incident report with me.",
          "The Raccoon has a new hobby: battery thieving. Not phone batteries, KID batteries. He loves heroes drained and glued to the glow, because a tired hero is an easy hero to trick. This week you take your power back. Screens stay in your life. You just get to say how big they are.",
          "[whispers] A tired hero is an easy hero to trick. That is the entire plan.",
          "[warmly] By the end of today, YOU are the one who says how big the screens get.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[13] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Keep screens in your day, at a size that fits",
        "Set the plan before you start, not halfway in",
        "Stop like a pro, and give the night back to your body",
      ],
    },

    /* BEAT 1 - SOME, NOT NONE */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Some, Not None",
      content:
        "Let's get one thing straight, Cyber Hero. Screens are BRILLIANT. Games, films, video calls with Gran, looking up how volcanoes work. Nobody here is going to tell you to give them up. But a screen is like a rucksack. It can hold a lot, and it cannot hold everything, because your day has a size. A hero with a level day gets the screen AND the park AND the sleep. The Battery Thief only wins when one thing takes the whole day.",
      bullets: [
        "Screens are brilliant, and you get to keep them",
        "Your day has a size, like a rucksack",
        "Level is the goal, not empty",
        "A level day keeps the fun IN",
        "The Thief only wins when one thing takes it all",
      ],
      bulletIcons: ["🎮", "🌍", "📏", "🎉", "🦝"],
      emblem: "📏",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome to the Power Station, Cyber Hero. This is where a hero's charge gets made.",
          "And before we start, let's get one thing straight.",
          "[excited] Screens are BRILLIANT. Nobody here is taking them off you.",
          "But your day is a bit like a rucksack. It holds a lot... and it does not hold everything.",
          "So the goal is not an empty screen. The goal is LEVEL.",
          "[excited] There's a see-saw out the back. Come and get it level with me!",
        ],
      },
    },
    // 5 - Game: LEVEL (DayBalancer re-theme, seesaw skin)
    {
      type: "dayBalancer",
      skin: "seesaw",
      introTitle: "The See-Saw Day",
      introSubtitle: "This day is tipping over with screens. Swap blocks for real recharges until it sits level. Watch out, some swaps are screens in disguise.",
      introIcon: "📏",
      meterLabel: "BALANCE",
      leftLabel: "SCREEN SIDE",
      rightLabel: "RECHARGE SIDE",
      swapToast: "REAL RECHARGE!",
      wrongTitle: "Still a screen in disguise",
      completeTitle: "The see-saw sits LEVEL!",
      completeLine: "Two screen blocks stayed aboard. Balance means SOME, not none.",
      threat: {
        raccoonLine: "Load one side right up! A hero who does ONE thing all day is a hero I can drain by teatime. Level is the only thing I cannot pick the lock on.",
      },
      keptBlocks: [
        { label: "Saturday cartoons", icon: "🌀" },
        { label: "After-homework game hour", icon: "🎮" },
      ],
      swaps: [
        {
          id: "breakfast",
          story: "Seven in the morning. Cartoons at breakfast, cartoons brushing teeth, cartoons in the car.",
          blockLabel: "Breakfast cartoons",
          blockIcon: "📱",
          readAloud: "Seven in the morning. Cartoons at breakfast, cartoons brushing teeth, cartoons in the car. The plank is creaking. Swap this block for a real recharge.",
          options: [
            { label: "Breakfast chat at the table", icon: "👪", isBalancing: true, note: "", why: "Talking to your people over toast costs nothing and fills you right up. That is a real recharge." },
            { label: "Cartoons with the sound off", icon: "🤫", isBalancing: false, note: "Sneaky, but silent cartoons are still a screen. Your eyes do not care about the volume." },
            { label: "Cartoons on the tiny phone", icon: "📱", isBalancing: false, note: "A smaller screen is still a screen. Shrinking it does not take it off the plank." },
          ],
        },
        {
          id: "afterschool",
          story: "Home from school, bag still on, straight onto the console until tea.",
          blockLabel: "Straight on the console",
          blockIcon: "🎮",
          readAloud: "Home from school, bag still on, straight onto the console until tea. That block is heavy. Swap it.",
          options: [
            { label: "A park game of catch first", icon: "💪", isBalancing: true, note: "", why: "Moving about outside is the fastest refill there is, and the console is still there afterwards." },
            { label: "Swap the console for videos", icon: "🌀", isBalancing: false, note: "That is a screen swapped for a screen. The plank feels exactly the same weight." },
            { label: "Game with snacks so it counts as dinner", icon: "🍕", isBalancing: false, note: "Crisps at the controller is not a recharge and it is not dinner. The block has not moved." },
          ],
        },
        {
          id: "bedtime",
          story: "Half past eight, and one more episode is running with the light off.",
          blockLabel: "One more episode",
          blockIcon: "🌀",
          readAloud: "Half past eight, and one more episode is running with the light off. Swap the last block and the see-saw might just sit level.",
          options: [
            { label: "A story, then lights out", icon: "🌠", isBalancing: true, note: "", why: "A story at half past eight winds you down instead of winding you up, and the night gets its full run at you." },
            { label: "Scrolling with the brightness down", icon: "📱", isBalancing: false, note: "Dimmer is still light, and your brain still reads it as daytime. The block stays put." },
            { label: "Falling asleep to autoplay", icon: "🔀", isBalancing: false, note: "Autoplay keeps going long after you stop watching. That is the heaviest block on the plank." },
          ],
        },
      ],
      hints: {
        tier1: "A real recharge has no glow at all. If it still has a screen in it, the plank does not care how quiet or small it is.",
        tier2: "Quieter, smaller and dimmer are the three disguises. Look for the swap with no screen in it anywhere.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is your first challenge, Cyber Hero. The See-Saw Day!",
          "This game is all about getting a day to sit level.",
          "Out in the real world, a day tips over when one thing quietly takes the lot.",
          "So here is what you do.",
          "A heavy block sits on the screen side, and I will read you what is going on.",
          "Then three swaps appear. Tap the one that is a REAL recharge, with no screen hiding in it.",
          "[warmly] And watch the two blocks we keep. Level is the goal, not empty. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the swap that is a real recharge, with no screen in it."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that plank, Cyber Hero. Dead level.",
          "And look what is still aboard. Saturday cartoons. The game hour after homework.",
          "[warmly] Nobody took your screens away. You just gave them a size.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "A Battery Keeper's day sits level. What does level mean?",
      choices: [
        { text: "Some screen fun AND real recharges", isCorrect: true },
        { text: "No screens at all, ever", isCorrect: false, why: "Nobody is taking your screens away. An empty side is not level, it is tipped the other way." },
        { text: "Screens all day if they are educational", isCorrect: false, why: "A day can tip over with useful things in it too. The size is what matters, not the subject." },
        { text: "Screens only at weekends", isCorrect: false, why: "That is a rule about days, not about balance. A tipped-over Saturday is still tipped over." },
      ],
      praise: "Some, not none. That is the whole idea. ✓",
      nudge: "Which one still has the fun in it?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it!",
          "Level keeps the good stuff in.",
          "Cartoons, games, calls with Gran, all still there.",
          "[warmly] Just sharing the day with everything else.",
        ],
      },
    },
    // 7 - Recap . Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Screens are brilliant and your day has a size, so the goal is a level day, never an empty one.",
      next: "why a day can only hold so much",
      emblem: "📏",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero, and it is the friendliest one.",
          "Level, not empty. Your cartoons are safe.",
          "[whispers] But there is a reason that plank creaks...",
          "Next, we'll learn why a day only holds so much. Come and see!",
        ],
      },
    },

    /* BEAT 2 - THE TRADE */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "The Trade",
      content:
        "Here is why the plank creaks. A day is a jug, and the jug does not get bigger because you want it to. Everything you do pours out of the same jug: sleep, school, food, football, the game, the film. So every hour you pour into one cup is an hour that is not going into another. That is not a telling-off, it is just arithmetic. Heroes who know the jug is a jug get to choose where it goes. Heroes who do not, find it already empty.",
      bullets: [
        "Your day is a jug, and it does not get bigger",
        "Everything pours out of the same jug",
        "An hour here is an hour not there",
        "That is arithmetic, not a telling-off",
        "Knowing the jug is a jug lets you choose",
      ],
      bulletIcons: ["⏱️", "🌍", "🔀", "🔢", "💪"],
      emblem: "⏱️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So why does that plank creak, Cyber Hero? Here is the honest reason.",
          "Your day is a jug. And the jug does not get bigger just because you would like it to.",
          "Sleep, school, food, football, the game, the film. All of it pours from the same jug.",
          "[thinking] Which means every hour you pour into one cup... is an hour not going into another.",
          "That is not me telling you off. That is just how much a jug holds.",
          "[excited] Come and pour one with me. You'll see it straight away!",
        ],
      },
    },
    // 9 - Game: POUR (the week's own signature, now tap-only)
    {
      type: "dayJug",
      introTitle: "The Day Jug",
      introSubtitle: "One jug, one day. Every cup you fill takes from the others, so decide what gives.",
      introIcon: "⏱️",
      jugLabel: "TODAY'S JUG",
      askPrompt: "What has to give?",
      completeTitle: "The whole jug poured!",
      completeLine: "Every hour came from somewhere. Now you know where.",
      threat: {
        raccoonLine: "Pour it ALL in one cup! Nobody ever checks the jug until it is empty, and by then the day is mine.",
      },
      pours: [
        {
          id: "saturday",
          label: "Saturday: the new game arrived",
          icon: "🎮",
          readAloud: "Saturday, and the new game arrived. You want five hours on it. The jug holds the day, and football training is at eleven.",
          options: [
            { id: "split", label: "Two hours now, football, more after", icon: "🔀", isRight: true, why: "The game still gets a proper go, and football still happens. The jug stretched to both because you poured on purpose.", explanation: "" },
            { id: "all", label: "Five hours now, skip football", icon: "🎮", isRight: false, why: "", explanation: "Five hours is a lovely idea and the jug is the jug. That pour empties football out of the day, and the team notices." },
            { id: "none", label: "No game at all today", icon: "🚫", isRight: false, why: "", explanation: "You do not have to give it up to fit football in. Emptying the cup is not the same as sharing the jug." },
          ],
        },
        {
          id: "homework",
          label: "Thursday: homework and a film night",
          icon: "📋",
          readAloud: "Thursday. There is homework, and the family film starts at seven. It is six o'clock now.",
          options: [
            { id: "first", label: "Homework now, film at seven", icon: "✅", isRight: true, why: "The film is at seven whatever you do, so the hour before it is the only one homework can have.", explanation: "" },
            { id: "after", label: "Film first, homework after", icon: "🌀", isRight: false, why: "", explanation: "After the film it is bedtime, so that pour quietly empties the homework cup and borrows from sleep as well." },
            { id: "during", label: "Homework during the film", icon: "📱", isRight: false, why: "", explanation: "Doing two things at once pours into both cups badly. You end up with half a film and half a homework." },
          ],
        },
        {
          id: "tired",
          label: "Sunday: everybody wants an hour",
          icon: "👪",
          readAloud: "Sunday. Gran wants a video call, your friend wants you online, and you want to finish your model. There is one hour left in the jug.",
          options: [
            { id: "choose", label: "Pick one, and say when for the others", icon: "⏱️", isRight: true, why: "One hour only pours one way, so you choose it, and the others get a real time instead of a maybe.", explanation: "" },
            { id: "all3", label: "Squeeze all three into the hour", icon: "🔀", isRight: false, why: "", explanation: "Three things in one hour gives everybody twenty rushed minutes. The jug does not get bigger for being hurried." },
            { id: "avoid", label: "Do none of them and scroll", icon: "📱", isRight: false, why: "", explanation: "That still pours the hour out, it just pours it where nobody chose. The jug empties either way." },
          ],
        },
        {
          id: "latenight",
          label: "The hour that borrows from tomorrow",
          icon: "🌠",
          readAloud: "It is late. You are enjoying yourself and the jug is empty, so this hour has to come from somewhere else.",
          options: [
            { id: "stop", label: "Stop. Tomorrow's jug is not mine to spend", icon: "⏸️", isRight: true, why: "An hour borrowed from tonight comes straight out of tomorrow, and you are the one who pays it back.", explanation: "" },
            { id: "borrow", label: "Borrow it from sleep, just tonight", icon: "🌀", isRight: false, why: "", explanation: "Sleep is the cup that refills all the others, so borrowing from it makes tomorrow's whole jug smaller." },
            { id: "morning", label: "Borrow it and lie in tomorrow", icon: "⏱️", isRight: false, why: "", explanation: "A lie-in pours tomorrow morning away to pay for tonight. The hour still came out of the jug, just later." },
          ],
        },
      ],
      hints: {
        tier1: "Ask where the hour is coming FROM, not just where it is going. Something always gives.",
        tier2: "The best pour keeps both cups in the day. Emptying one, or borrowing from sleep, is the jug losing.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your second challenge, Cyber Hero. The Day Jug!",
          "This game is all about noticing what an hour costs.",
          "Out in the real world, nobody announces the trade. It just happens while you are busy.",
          "So here is what you do.",
          "A day comes up and I will read you what is in it.",
          "Then three pours appear. Tap the one that shares the jug best.",
          "[warmly] Four days to pour. Take your time.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read the day, then tap the pour that shares the jug best."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four days poured, Cyber Hero, and not one of them tipped over.",
          "You kept the game AND the football. The film AND the homework.",
          "[warmly] That is what knowing the jug gets you. Not less fun. Better aim.",
        ],
      },
    },
    // 10 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Finish the rule: every hour I pour into one thing...",
      choices: [
        { text: "is an hour that is not going into another", isCorrect: true },
        { text: "makes the day a little bit longer", isCorrect: false, why: "The jug is the jug. Wanting more day has never once made more day." },
        { text: "only counts if it was a screen", isCorrect: false, why: "Football pours from the same jug as the game does. Every hour comes out of it." },
        { text: "can be borrowed back from tomorrow", isCorrect: false, why: "Borrowing is real, and tomorrow is the one who pays. That makes tomorrow's jug smaller, not tonight's bigger." },
      ],
      praise: "An hour here is an hour not there. ✓",
      nudge: "If the jug never gets bigger, where does the hour come from?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Word for word!",
          "That is the whole trade, and it is not a scary one.",
          "It just means YOU get to aim the hours.",
          "[warmly] Which is much better than finding them gone.",
        ],
      },
    },
    // 11 - Recap . Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A day is a jug that never gets bigger, so every hour you pour into one thing is an hour not going into another.",
      next: "the one moment when choosing is actually easy",
      emblem: "⏱️",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers, Cyber Hero. You can see the trade now.",
          "One jug, and you are the one aiming it.",
          "[whispers] Although... there is one moment when aiming is easy, and one when it is nearly impossible...",
          "Next, we'll find the easy moment. Come and see!",
        ],
      },
    },

    /* BEAT 3 - SET IT BEFORE YOU START */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Set It Before You Start",
      content:
        "Here is the easy moment: BEFORE. Before you press play, you are outside the game. You can think clearly, you are not in the middle of anything, and stopping later costs you nothing yet. Thirty seconds in there and it all changes. Inside the game, every part of you wants one more, and no game ever feels finished, because they are built not to. So heroes decide outside. How long. What happens after. And who else knows, because a plan somebody agreed with you is a plan that holds.",
      bullets: [
        "Before you start, you are outside the game",
        "Inside it, every part of you wants one more",
        "A game never feels finished. They are built that way",
        "Decide how long, and what happens after",
        "Say it out loud to a grown-up, so it holds",
      ],
      bulletIcons: ["⏸️", "🎮", "🔀", "⏱️", "👪"],
      emblem: "⏸️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So when is aiming easy, Cyber Hero? It is right now. Before.",
          "Before you press play, you are standing outside the game.",
          "[thinking] Thirty seconds in there and it is a completely different story.",
          "Inside, every part of you wants one more. And a game never FEELS finished, because they are built that way.",
          "So heroes decide outside. How long, what happens after, and who else knows.",
          "[excited] There is a plan desk at the Power Station. Come and set one!",
        ],
      },
    },
    // 13 - Game: SET (new setTheDial engine)
    {
      type: "setTheDial",
      introTitle: "The Plan Desk",
      introSubtitle: "Set the three dials before you press play, then agree it. How long, what after, and who knows.",
      introIcon: "⏸️",
      deskLabel: "THE PLAN DESK",
      howLongLabel: "HOW LONG",
      whatAfterLabel: "WHAT AFTER",
      whoKnowsLabel: "WHO KNOWS",
      agreeLabel: "AGREE IT",
      completeTitle: "Every plan agreed!",
      completeLine: "Set outside, so it holds inside.",
      threat: {
        raccoonLine: "Do not plan a thing! Just press play and see how it goes. See how it goes is my favourite phrase in the whole world.",
      },
      rounds: [
        {
          id: "saturday",
          situation: "Saturday morning. Swimming is at half eleven.",
          readAloud: "Saturday morning, and swimming is at half past eleven. Set your plan before you press play.",
          dials: {
            howLong: [
              { id: "hour", label: "One hour", icon: "⏱️", isGood: true },
              { id: "seehow", label: "See how it goes", icon: "🔀", isGood: false },
              { id: "allmorning", label: "All morning", icon: "🎮", isGood: false },
            ],
            whatAfter: [
              { id: "swim", label: "Get ready for swimming", icon: "💪", isGood: true },
              { id: "another", label: "Probably another game", icon: "🌀", isGood: false },
              { id: "dunno", label: "Not thought about it", icon: "❓", isGood: false },
            ],
            whoKnows: [
              { id: "dad", label: "Told Dad the plan", icon: "👪", isGood: true },
              { id: "nobody", label: "Nobody", icon: "🤫", isGood: false },
              { id: "friend", label: "Only my friend online", icon: "💬", isGood: false },
            ],
          },
          why: "An hour, then swimming, and Dad knows. Every dial has a real answer in it, so there is nothing left to argue about later.",
          explanation: "A plan needs all three. See how it goes is not a how long, not thought about it is not a what after, and a plan nobody else heard is just a thought.",
        },
        {
          id: "afterschool",
          situation: "Tuesday after school. Tea is at six, homework is not done.",
          readAloud: "Tuesday after school. Tea is at six and the homework is not done. It is four o'clock.",
          dials: {
            howLong: [
              { id: "halfhour", label: "Half an hour", icon: "⏱️", isGood: true },
              { id: "tilltea", label: "Right up to tea", icon: "🎮", isGood: false },
              { id: "onemore", label: "Until it feels done", icon: "🔀", isGood: false },
            ],
            whatAfter: [
              { id: "homework", label: "Homework at the table", icon: "📋", isGood: true },
              { id: "tv", label: "Telly until tea", icon: "📱", isGood: false },
              { id: "later", label: "Homework after tea, maybe", icon: "❓", isGood: false },
            ],
            whoKnows: [
              { id: "mum", label: "Told Mum before I started", icon: "👪", isGood: true },
              { id: "after", label: "I will tell her after", icon: "⏱️", isGood: false },
              { id: "secret", label: "Nobody needs to know", icon: "🤫", isGood: false },
            ],
          },
          why: "Half an hour, then homework at the table, and Mum heard it first. That plan survives the moment you do not feel like stopping.",
          explanation: "Until it feels done never arrives, telly after a game is a screen after a screen, and telling her afterwards is not a plan, it is a report.",
        },
        {
          id: "sleepover",
          situation: "A sleepover at your friend's, and there is a console in the room.",
          readAloud: "A sleepover at your friend's house, and there is a console right there in the room. It is nearly nine.",
          dials: {
            howLong: [
              { id: "tillnine", label: "Until half past nine", icon: "⏱️", isGood: true },
              { id: "late", label: "As late as we can", icon: "🌀", isGood: false },
              { id: "whenever", label: "Until we get tired", icon: "❓", isGood: false },
            ],
            whatAfter: [
              { id: "talk", label: "Torch and talking", icon: "🌠", isGood: true },
              { id: "films", label: "Films in the dark", icon: "📱", isGood: false },
              { id: "sleeporplay", label: "See if we fancy more", icon: "🔀", isGood: false },
            ],
            whoKnows: [
              { id: "theirs", label: "Told the grown-up in the house", icon: "👪", isGood: true },
              { id: "justus", label: "Just us two", icon: "🤫", isGood: false },
              { id: "mine", label: "My mum, at home", icon: "💬", isGood: false },
            ],
          },
          why: "A real stopping time, something good to do after, and the grown-up who is actually in the house knows it. That is a plan that works away from home.",
          explanation: "Until we get tired always means later than you think, a film after a game is still a screen, and the grown-up who can help is the one in THIS house, not the one at home.",
        },
      ],
      hints: {
        tier1: "All three dials need a real answer. A maybe is not an answer on any of them.",
        tier2: "How long needs a number or a time. What after needs something with no screen in it. Who knows needs a grown-up who is actually there.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Third challenge, Cyber Hero. The Plan Desk!",
          "This game is all about setting the plan while you are still outside the game.",
          "Out in the real world, this is the thirty seconds before you press play.",
          "So here is what you do.",
          "A situation comes up on the desk, and three dials sit under it.",
          "Tap a dial to turn it. How long, what after, and who knows.",
          "[warmly] When all three look right to you, press AGREE IT. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Turn all three dials, then press AGREE IT."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three plans, all agreed, Cyber Hero, and every one took about ten seconds.",
          "That is the trick nobody tells you. The deciding is easy out here.",
          "[warmly] Do it out here, and the you who is deep in a game does not have to.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon is fibbing about stopping. Which bit is the lie?",
      raccoonLine: "Don't plan anything! Just start, and stop when the game feels finished. You'll KNOW. Everyone knows.",
      choices: [
        { text: "A game never feels finished. They are built that way", isCorrect: true },
        { text: "You do know, but only if you are good at the game", isCorrect: false, why: "Being good at it makes it more fun to carry on, not easier to stop. That is the opposite of a finish line." },
        { text: "It works, but only on short games", isCorrect: false, why: "Short games just start again. The one that ends by itself is very rare indeed." },
        { text: "He is right, planning is a waste of time", isCorrect: false, why: "Ten seconds outside the game saves the whole argument later. That is a very good trade." },
      ],
      praise: "Caught him. Games have no finish line. ✓",
      nudge: "When was the last time a game told you it was over?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Got him!",
          "Waiting for a game to feel finished is waiting forever.",
          "There is always one more level, and that is on purpose.",
          "[warmly] So the ending is yours to pick, and you pick it early.",
        ],
      },
    },
    // 15 - Recap . Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Deciding is easy outside a game and nearly impossible inside one, so you set how long, what after and who knows before you press play.",
      next: "what to do when the time you set actually arrives",
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Your plan is set before you even start.",
          "How long, what after, who knows. Ten seconds, out here.",
          "[whispers] Now for the bit everyone finds hard. The moment the time actually arrives...",
          "Next, we'll learn how to stop like a pro. Come and see!",
        ],
      },
    },

    /* BEAT 4 - OFF LIKE A PRO */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Off Like a Pro",
      content:
        "The time you set arrives, and here is the thing nobody admits: stopping badly is what makes stopping feel awful. Screen yanked off mid-level, friends left hanging, controller flat again tomorrow. Of course that hurts. So pros do not just stop, they LAND. Save it, so the work is still there. Say bye, so your friends are not left staring at an empty space. Plug it in, so tomorrow-you starts full. Three moves, about twenty seconds, and stopping stops being a fight.",
      bullets: [
        "Stopping badly is what makes stopping hurt",
        "SAVE it, so nothing you did is lost",
        "SAY BYE, so your friends are not left hanging",
        "PLUG IN, so tomorrow-you starts full",
        "Twenty seconds, and it is a landing, not a crash",
      ],
      bulletIcons: ["🎮", "✅", "💬", "⚡", "🏆"],
      emblem: "⚡",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So the time arrives, Cyber Hero. And here is what nobody admits.",
          "Stopping BADLY is what makes stopping feel horrible.",
          "Screen yanked off mid-level. Friends left staring at an empty space. Flat controller tomorrow.",
          "[thinking] Of course that hurts. Anybody would hate that.",
          "So pros do not just stop. They land. Save it, say bye, plug it in.",
          "[excited] There is a shutdown panel down in the station. Let's land one!",
        ],
      },
    },
    // 17 - Game: LAND (PowerPanel re-theme, powerdown skin)
    {
      type: "powerPanel",
      skin: "powerdown",
      introTitle: "The Shutdown Panel",
      introSubtitle: "The panel is crowded with buttons. Find SAVE, then SAY BYE, then PLUG IN.",
      introIcon: "⚡",
      panelTitle: "Station console",
      boardTitle: "Shutdown Panel",
      stepLabels: ["SAVE", "SAY BYE", "PLUG IN"],
      wrongTitle: "Not that one yet",
      completeTitle: "Landed, not crashed!",
      completeLine: "Save, say bye, plug in. On any console, on any screen.",
      threat: {
        raccoonLine: "Just yank it off! Mid-level, mid-sentence, mid-everything. A horrible ending today means a big fight about screens tomorrow, and I LOVE a big fight about screens.",
      },
      rounds: [
        {
          id: "level",
          prompt: "Your half hour is up and you are halfway through a level.",
          readAloud: "Your half hour is up and you are halfway through a level. The panel is open. Find save, then say bye, then plug in.",
          layout: "grid",
          buttons: [
            { id: "quit", label: "Quit to menu", note: "Quitting now throws the half-finished level away. Save it first and it is still there tomorrow." },
            { id: "save", label: "Save", step: 1 },
            { id: "onemore", label: "One more level", note: "One more level is the exact thing your plan already answered. The plan was made out here, where thinking is easy." },
            { id: "bye", label: "Say bye in chat", step: 2 },
            { id: "bright", label: "Brightness up", note: "Nothing on this panel needs to be brighter. You are landing, not taking off again." },
            { id: "plug", label: "Plug in", step: 3 },
          ],
          stepTeach: [
            "Save comes first. Everything else can wait twenty seconds, but an unsaved level cannot.",
            "Say bye before you plug in. Your friends are still standing there waiting for you.",
          ],
          why: "Saved, said bye, plugged in. The level is safe, your friends know you left, and tomorrow-you gets a full battery.",
        },
        {
          id: "friends",
          prompt: "Tea is ready and you are in the middle of a team game with three friends.",
          readAloud: "Tea is ready, and you are in a team game with three friends. Find save, then say bye, then plug in.",
          layout: "list",
          buttons: [
            { id: "save", label: "Save", step: 1 },
            { id: "vanish", label: "Just close the app", note: "Vanishing mid-game leaves three friends wondering what happened. Ten seconds of goodbye saves all of that." },
            { id: "bye", label: "Say bye in chat", step: 2 },
            { id: "mute", label: "Mute and keep playing", note: "Muting hides the room, it does not stop the game. The tea goes cold and you are still in it." },
            { id: "plug", label: "Plug in", step: 3 },
            { id: "invite", label: "Invite one more", note: "Inviting somebody now starts a whole new game just as you are trying to end this one." },
          ],
          stepTeach: [
            "Save first, even with a team waiting on you. Your own progress is yours to keep.",
            "Now say bye. Leaving without a word is the bit friends actually mind.",
          ],
          why: "Saved, said a proper goodbye, plugged in. Your three friends know you left, and the tea is still hot.",
        },
        {
          id: "bedtime",
          prompt: "It is bedtime and the tablet is nearly flat.",
          readAloud: "It is bedtime and the tablet is nearly flat. Find save, then say bye, then plug in.",
          layout: "grid",
          buttons: [
            { id: "bed", label: "Take it to bed", note: "A tablet in the bed is the Battery Thief's favourite place in the house. It goes on charge instead." },
            { id: "save", label: "Save", step: 1 },
            { id: "lowpower", label: "Low power mode", note: "Low power mode just makes a flat tablet last a bit longer. It does not end anything." },
            { id: "bye", label: "Say bye in chat", step: 2 },
            { id: "plug", label: "Plug in", step: 3 },
            { id: "alarm", label: "Set an alarm on it", note: "Setting an alarm keeps the tablet in your hand and in your room. The clock can do that job." },
          ],
          stepTeach: [
            "Save first. Even at bedtime, whatever you were doing gets to survive the night.",
            "Say bye before it goes on charge, so nobody is left mid-conversation.",
          ],
          why: "Saved, said bye, and on charge outside the bedroom. Tomorrow-you wakes up to a full battery and no argument.",
        },
      ],
      hints: {
        tier1: "Save is always first, because it is the only one that cannot wait. Then the people, then the plug.",
        tier2: "Save, say bye, plug in. Every other button on that panel is the Thief trying to keep you there.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Fourth challenge, Cyber Hero. The Shutdown Panel!",
          "This game is all about landing instead of crashing.",
          "Out in the real world, the panel is crowded and only three buttons end things well.",
          "So here is what you do.",
          "A moment comes up and I will read it to you.",
          "Then find SAVE, then SAY BYE, then PLUG IN. In that order, on a crowded panel.",
          "[warmly] Three landings to make. You've got this.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Find SAVE first, then SAY BYE, then PLUG IN."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three landings, Cyber Hero, and not one crash.",
          "Nothing lost, nobody left hanging, and a full battery in the morning.",
          "[warmly] Stopping only feels bad when it is done badly. You just did it well three times.",
        ],
      },
    },
    // 18 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the landing in order.",
      choices: [
        { text: "1. Save it", isCorrect: true },
        { text: "2. Say bye to whoever you are with", isCorrect: true },
        { text: "3. Plug it in", isCorrect: true },
        { text: "4. Walk away proud of the landing", isCorrect: true },
      ],
      praise: "Save, say bye, plug in, walk away. ✓",
      nudge: "Which one cannot wait even twenty seconds?",
      nudgeNext: "What comes straight after the step you just did?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect landing!",
          "Save first, because it is the only one that cannot wait.",
          "Then the people. Then the plug.",
          "[warmly] And then you walk away, actually pleased with yourself.",
        ],
      },
    },
    // 19 - Recap . Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Stopping badly is what makes stopping hurt, so pros land it: save, say bye, plug in.",
      next: "the last hour of the day, and who it really belongs to",
      emblem: "⚡",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers, Cyber Hero, and that landing was smooth.",
          "Save, say bye, plug in. Twenty seconds, no fight.",
          "[whispers] There is one hour left in the day, and it does not belong to the screen...",
          "Next, we'll learn who the last hour really belongs to. Come and see!",
        ],
      },
    },

    /* BEAT 5 - THE LAST HOUR */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "The Last Hour",
      content:
        "The last hour before bed belongs to your body, and your body has been waiting for it all day. Here is why screens make it hard: a screen shines light straight into your eyes, and your brain reads bright light as DAYTIME. So it politely hides the sleepy feeling, and you lie there wide awake wondering why. The fix is not complicated. The screens go somewhere else for the night, the room gets dim, and sleep gets a clear run at you. That is the biggest recharge there is, and it is free.",
      bullets: [
        "The last hour belongs to your body",
        "Screen light tells your brain it is daytime",
        "So your brain hides the sleepy feeling",
        "Screens sleep somewhere else, on charge",
        "Sleep is the biggest recharge, and it is free",
      ],
      bulletIcons: ["🌠", "💡", "🧠", "🔌", "⚡"],
      emblem: "🌠",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power of the week, Cyber Hero, and it is the calmest one.",
          "The last hour before bed belongs to your body. It has been waiting all day for it.",
          "[thinking] And here is why screens make that hard.",
          "A screen shines light right into your eyes, and your brain reads bright light as daytime.",
          "So it hides the sleepy feeling, and you lie there wide awake, wondering why.",
          "[excited] Come up to the room with me. Let's get the night back.",
        ],
      },
    },
    // 21 - Game: SETTLE (new nightFall engine)
    {
      type: "nightFall",
      introTitle: "Night Fall",
      introSubtitle: "The room is still buzzing. Send the screens out for the night, and watch the sky go dark.",
      introIcon: "🌠",
      roomLabel: "YOUR ROOM",
      outLabel: "OUT FOR THE NIGHT",
      stayLabel: "STAYS",
      askPrompt: "Tap what goes out for the night",
      completeTitle: "Full dark, and the stars are out!",
      completeLine: "The screens are on charge and the night has a clear run at you.",
      threat: {
        raccoonLine: "Leave ONE little screen in there. Just one, face down, on silent. That is all I need to keep a hero awake until midnight.",
      },
      things: [
        {
          id: "tablet",
          label: "Tablet on the pillow",
          icon: "📱",
          readAloud: "The tablet, face down on the pillow.",
          moveOut: true,
          why: "Face down still means within reach, and within reach means one more look. It charges by the door instead.",
          explanation: "",
        },
        {
          id: "book",
          label: "A bookmarked book",
          icon: "📋",
          readAloud: "A book, with a bookmark about halfway through.",
          moveOut: false,
          why: "",
          explanation: "That book winds you down instead of winding you up, and it shines no light at all. It stays."
        },
        {
          id: "console",
          label: "The handheld console",
          icon: "🎮",
          readAloud: "The handheld console, still warm.",
          moveOut: true,
          why: "Still warm means recently played, and a console by the bed is an invitation. Out it goes, on charge.",
          explanation: "",
        },
        {
          id: "lamp",
          label: "The bedside lamp",
          icon: "💡",
          readAloud: "The little bedside lamp, turned down low.",
          moveOut: false,
          why: "",
          explanation: "A low warm lamp helps you settle. It is the bright blue-white screens your brain argues with, not this."
        },
        {
          id: "phone",
          label: "Phone by your head",
          icon: "🔌",
          readAloud: "A phone on charge, right beside your head.",
          moveOut: true,
          why: "Charging is the right idea in the wrong room. Every buzz lands next to your ear all night.",
          explanation: "",
        },
        {
          id: "water",
          label: "A glass of water",
          icon: "🍌",
          readAloud: "A glass of water on the bedside table.",
          moveOut: false,
          why: "",
          explanation: "That is not a screen and it never wakes anybody. It stays exactly where it is."
        },
        {
          id: "telly",
          label: "Telly on standby",
          icon: "🌀",
          readAloud: "The telly in the corner, blinking on standby.",
          moveOut: true,
          why: "A blinking light in a dark room keeps catching your eye, and standby is not off. Properly off, for the night.",
          explanation: "",
        },
      ],
      hints: {
        tier1: "Ask one question about each thing: does it make light, or make a noise, in the night?",
        tier2: "Screens go out, even face down, even on silent, even on standby. Books, lamps and water stay.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last challenge of the week, Cyber Hero. Night Fall.",
          "This game is all about giving the night a clear run at you.",
          "Out in the real world, this is a two minute job you do once, and then it is just how your room works.",
          "So here is what you do.",
          "Your room is up on the board, with things dotted around it.",
          "Tap anything that should go out for the night, and the sky gets a little darker.",
          "[warmly] Some things belong in there, mind. Leave those be.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap what goes out for the night. Some things stay."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that sky, Cyber Hero. Full dark, stars and all.",
          "Screens on charge by the door. Book, lamp and water right where they should be.",
          "[warmly] That room is not empty. It is just quiet. And quiet is what the night needed.",
        ],
      },
    },
    // 22 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one still keeps you awake?",
      choices: [
        { text: "A phone face down on silent, next to your pillow", isCorrect: true },
        { text: "A book with a bookmark in it", isCorrect: false, why: "A book makes no light and no noise. It is on the settling side, every time." },
        { text: "A lamp turned down low", isCorrect: false, why: "A low warm lamp helps you wind down. It is bright screens your brain argues with." },
      ],
      praise: "Face down and silent is still right there. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight away!",
          "Face down, silent, within reach. Still one more look away.",
          "[warmly] Out of the room and on charge, and the whole problem goes away.",
        ],
      },
    },
    // 23 - Recap . Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Screen light tells your brain it is daytime, so the screens spend the night on charge somewhere else and sleep gets a clear run at you.",
      next: "the Power Station Match, where all five powers get used at once",
      emblem: "🌠",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers, Cyber Hero. Every one of them.",
          "Level, the jug, the plan, the landing, and the night.",
          "[whispers] So there is one thing left to find out...",
          "Next, you take all five of them down to the station floor at once. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: The Power Station Match (MemoryMatch, station skin)
    {
      type: "memoryMatch",
      skin: "station",
      introTitle: "The Power Station Match",
      introWelcome: "Power up!",
      introSubtitle: "Flip the cards and match each Battery Thief trick to its hero move. Fewer flips earn more stars.",
      threat: {
        raccoonLine: "Five of my best tricks, all face down in one place. Go on then, hero. See if you can even remember what beats them.",
      },
      pairs: [
        { term: "A day tipping over with screens", match: "Get it level, keep the fun in", colour: "#7eff97", why: "Level is the goal, never empty. Two screen blocks stayed on that see-saw and it still balanced." },
        { term: "'There's time for all of it'", match: "The jug never gets bigger", colour: "#ffd158", why: "Every hour you pour into one thing is an hour not going into another. That is just how much a jug holds." },
        { term: "'Stop when it feels finished'", match: "Set it before you start", colour: "#c084fc", why: "A game never feels finished, because they are built that way. So you decide how long while you are still outside it." },
        { term: "Screen yanked off mid-level", match: "Save, say bye, plug in", colour: "#ff5fb3", why: "Stopping badly is what makes stopping hurt. Landing it takes twenty seconds and there is no fight." },
        { term: "A phone face down by your pillow", match: "Screens sleep on charge", colour: "#00e5ff", why: "Face down and silent is still one more look away, and screen light tells your brain it is daytime." },
        { term: "'Balance means no screens'", match: "Balance means SOME, not none", colour: "#ff7a59", why: "Nobody is taking your screens away. A hero with a level day gets the game AND the park AND the sleep." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review, Cyber Hero. The Power Station Match!",
          "This game is all about using every Battery Keeper power at once.",
          "Out in the real world, the Thief's tricks turn up in any order, so all five have to be ready.",
          "So here is what you do.",
          "Tap a card to flip it, then find the card that goes with it.",
          "Each trick has one hero move hiding somewhere on the board.",
          "[warmly] Fewer flips earn more stars. Off you go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a card to flip it, then find its pair."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every pair matched, Cyber Hero, and every one of them was a trick you can now name.",
          "[warmly] Out in the real world, the Thief does not announce himself. He just hopes you never gave your day a size. And you have.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the battery keeper
    { type: "video", videoPlaceholder: "Week 13: Battery Keeper", videoSrc: "/videos/module-13-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "size", label: "Level Keeper", accent: "#7eff97", icon: "📏", summary: "Screens stay in your day, at a size that fits. Level, never empty." },
        { id: "jug", label: "Jug Reader", accent: "#ffd158", icon: "⏱️", summary: "A day never gets bigger, so every hour comes out of somewhere." },
        { id: "plan", label: "Plan Setter", accent: "#c084fc", icon: "⏸️", summary: "How long, what after, who knows. All decided before you press play." },
        { id: "land", label: "Smooth Lander", accent: "#ff5fb3", icon: "⚡", summary: "Save, say bye, plug in. Stopping stopped being a fight." },
        { id: "night", label: "Night Keeper", accent: "#00e5ff", icon: "🌠", summary: "Screens sleep on charge, and the night gets a clear run at you." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The see-saw level, the jug read, the plan set,",
          "the landing smooth... and the night handed back to your body.",
          "[laughs] The Battery Thief did not get a single drop.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "level-keeper", name: "Level Keeper", icon: "📏", description: "Keeps the fun in and the day level." },
        { id: "plan-setter", name: "Plan Setter", icon: "⏸️", description: "Decides it before pressing play." },
        { id: "night-keeper", name: "Night Keeper", icon: "🌠", description: "Gives the last hour back to the night." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#2ec4b6",
    theme: {
      topic: "Screen-Time Balance",
      motifs: ["⏱️", "💡", "💪", "🔔", "🧠", "⏸️", "🎮", "⭐"],
    },
    intro: {
      slug: "quiz-w13-intro",
      text: "Yaaawn... who left the daylight on? Welcome to my garage, hero! Let's see if that famous battery of yours has any answer-juice left!",
    },
    victory: {
      slug: "quiz-w13-victory",
      text: "Still FULL bars?! I leeched and leeched and got zip! Take your batteries, take your bedtimes... I'm powering down out of pure embarrassment!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w13-c1",
        key: "quiz-w13-c1-1",
        label: "Your Power Bar",
        ask: {
          slug: "quiz-w13-ask-c1-1",
          text: "Your battery feels totally drained after a long screen morning. What's the FASTEST way to fill it back up?",
        },
        options: [
          { text: "Get outside and move, then eat something real" },
          { text: "Switch to a calmer, quieter show to rest" },
          { text: "Play a different game so my brain gets a change" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Screens can't refill a screen drain!",
          explanation: "A calmer show and a different game still glow, so they keep sipping charge. The recharge kit is moving, real food, rest and your people. That's what fills the bar back up.",
        },
        villainRight: {
          slug: "quiz-w13-right-c1-1",
          text: "Outside AND a snack?! You refilled faster than I can slurp!",
        },
        villainWrong: {
          slug: "quiz-w13-wrong-c1-1",
          text: "Rest with MORE screen, yes! Calmer glow, same juice, straight down my hose!",
        },
      },
      {
        phaseId: "phase-w13-c2",
        key: "quiz-w13-c2-1",
        label: "Set It Before You Start",
        ask: {
          slug: "quiz-w13-ask-c2-1",
          text: "Saturday morning, and you are about to start a game. When is the EASIEST moment to decide how long you will play?",
        },
        options: [
          { text: "Right now, before I start, out loud with a grown-up" },
          { text: "Nothing, that's just how voices work mid-game" },
          { text: "When the game starts to feel finished" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Decide it OUTSIDE the game!",
          explanation: "Once you are inside a game, stopping is the hardest decision there is, and a game never feels finished, because that is how they are built. The easy moment is before you start, out loud, with a grown-up.",
        },
        villainRight: {
          slug: "quiz-w13-right-c2-1",
          text: "You decided BEFORE?! My whole business is the middle of the game!",
        },
        villainWrong: {
          slug: "quiz-w13-wrong-c2-1",
          text: "Snappy voices are normal! Nothing to hear! Keep playing, keep dripping!",
        },
      },
      {
        phaseId: "phase-w13-c3",
        key: "quiz-w13-c3-1",
        label: "Sleep Guard",
        ask: {
          slug: "quiz-w13-ask-c3-1",
          text: "Sleepover at Gran's, and there's no charging garage anywhere. Where does the tablet spend the night?",
        },
        options: [
          { text: "Out of the room I sleep in, like on the kitchen side" },
          { text: "Under my pillow so it can't get lost" },
          { text: "Inside my sleeping bag to keep it warm" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Screens sleep away from you!",
          explanation: "A screen tucked that close puts a tiny sun right beside your brain all night. No charging spot at Gran's? The rule still works: the screen sleeps in another room, and the moon does the rest.",
        },
        villainRight: {
          slug: "quiz-w13-right-c3-1",
          text: "The KITCHEN?! My hose doesn't reach the kitchen!",
        },
        villainWrong: {
          slug: "quiz-w13-wrong-c3-1",
          text: "Under the pillow, in the bag, closer, closer! Warm screens leak the sweetest sleep!",
        },
      },
      {
        phaseId: "phase-w13-c4",
        key: "quiz-w13-c4-1",
        label: "Plan It Together",
        ask: {
          slug: "quiz-w13-ask-c4-1",
          text: "Mom hands you a screen-time rule she wrote all by herself. What actually makes a plan WORK?",
        },
        options: [
          { text: "Building it together and both signing it, like teammates" },
          { text: "A grown-up writing it alone, they know best" },
          { text: "No plan at all, I can feel when I've had enough" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Build it together!",
          explanation: "A rule dropped on you feels unfair, and 'I can feel it' usually notices AFTER the battery is empty. A plan you build and sign WITH a grown-up is yours, and plans you own actually work.",
        },
        villainRight: {
          slug: "quiz-w13-right-c4-1",
          text: "You SIGNED it together?! Co-signed plans are leech-proof, it's so unfair!",
        },
        villainWrong: {
          slug: "quiz-w13-wrong-c4-1",
          text: "No plan, or somebody else's plan! Either way, nobody's guarding the battery but me!",
        },
      },
      {
        phaseId: "phase-w13-c5",
        key: "quiz-w13-c5-1",
        label: "The Power-Down Five",
        ask: {
          slug: "quiz-w13-ask-c5-1",
          text: "You keep telling yourself you'll stop 'when the game feels done.' Why does that never work?",
        },
        options: [
          { text: "Games are built to never feel done, so I pick the ending" },
          { text: "It works fine if the game is short enough" },
          { text: "Because grown-ups always interrupt before then" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "'Done' never comes!",
          explanation: "Every level ends at a shiny new level, that's how games are built, short ones too. Waiting for 'done' waits forever. A Battery Keeper decides the ending on purpose.",
        },
        villainRight: {
          slug: "quiz-w13-right-c5-1",
          text: "You know the game never feels done?! That secret was load-bearing!",
        },
        villainWrong: {
          slug: "quiz-w13-wrong-c5-1",
          text: "Wait for 'done', keep waiting! The queue refills faster than you do!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-13-battery-keeper.png",

  // Week-lane attack theatre: battery tricks only (autoplay's PULL was
  // W10's lane; in-game spending W7's; this is drain/sleep/stopping).
  bossAttacks: [
    { name: "ONE MORE EPISODE", icon: "🌀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "You choose the ending", emblemColor: 0xc084fc },
    { name: "UNDER-THE-COVERS SCREEN", icon: "🤫", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Screens sleep in the garage", emblemColor: 0x7df0ff },
    { name: "BATTERY DRAIN", icon: "⚡", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Set it before you start", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W13 fight - drain the Thief's
  // stolen battery hoard - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "When is the easiest moment to decide how long you will play?", answers: ["Before I start, out loud, with a grown-up", "When the game feels finished", "Halfway through", "When somebody makes me stop"], correctIndex: 0, explanation: "Deciding is easy outside a game and hardest inside one, so Keepers set it before they start." },
      { question: "Where do devices sleep at night?", answers: ["In the charging garage, outside the bedroom", "Under the pillow", "Under the covers", "On the bed, volume up"], correctIndex: 0, explanation: "Park the screen, and the moon handles the biggest recharge of all." },
      { question: "What refills your power bar?", answers: ["Sleep, snacks, moving and your people", "A brighter screen", "Louder volume", "Extra episodes"], correctIndex: 0, explanation: "Screens are fun and they USE charge - the refills come from everywhere else." },
    ],
    medium: [
      { question: "Why do games never feel 'finished'?", answers: ["They're built that way - so YOU choose the ending", "Because you're bad at them", "They finish after one more level, promise", "Games always finish by themselves"], correctIndex: 0, explanation: "Waiting for a game to feel finished is waiting forever - pros pick their own ending." },
      { question: "The screen plan works best when...", answers: ["You and a grown-up build it and sign it TOGETHER", "It's done TO you as a punishment", "You hide it from everyone", "There are no rules at all"], correctIndex: 0, explanation: "A plan you helped build is a plan you own - and plans you own actually work." },
      { question: "Which is a REAL recharge - not a screen in disguise?", answers: ["A park game of catch with friends", "Cartoons with the sound off", "Watching on a smaller phone", "Scrolling with brightness down"], correctIndex: 0, explanation: "Quieter, smaller and dimmer are still screens - real recharges have no glow at all." },
    ],
    hard: [
      { question: "Why does a bright screen at bedtime steal your sleep?", answers: ["Its light shouts 'daytime!' so your brain hides the sleepiness", "Screens are too heavy for beds", "The moon gets jealous", "It doesn't - screens help sleep"], correctIndex: 0, explanation: "Screen light works like a tiny sun - and brains don't sleep in 'daytime'." },
      { question: "What's the FIRST move of the Power-Down Five?", answers: ["Finish the level or episode", "Throw the controller", "Screen off mid-game", "Hide the tablet"], correctIndex: 0, explanation: "Finish first - endings feel great when they're tidy and YOURS." },
      { question: "A Battery Keeper knows 'balance' means...", answers: ["SOME screen fun plus real recharges - not zero screens", "No screens ever again", "Screens all day if they're educational", "Only weekends count"], correctIndex: 0, explanation: "The see-saw kept two screen blocks aboard - balance keeps the fun IN." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted or removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 13 - power station ahead!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's been thieving KID batteries..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Keeper kit ready? Here's the plan." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Three powers to pack. Let's go." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Screens stay. They just get a size." }, layla: null }, // learn: size
    5: { adam: { mood: "curious", message: "Get that plank level!" }, layla: null }, // game: seesaw
    6: { adam: null, layla: { mood: "thumbsup", message: "Level, not empty. Remember?" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "The jug never gets bigger..." } }, // learn: trade
    9: { adam: null, layla: { mood: "excited", message: "Pour it where you mean to!" } }, // game: day jug
    10: { adam: { mood: "thinking", message: "Finish the rule, Cyber Hero." }, layla: null }, // prove: finish
    11: { adam: { mood: "excited", message: "Now YOU aim the hours!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Deciding is easy out HERE." }, layla: null }, // learn: set
    13: { adam: { mood: "curious", message: "Three dials, then agree it!" }, layla: null }, // game: plan desk
    14: { adam: { mood: "worried", message: "He's fibbing about stopping - catch him!" }, layla: null }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Plan set before you start!" } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "Land it, don't crash it." } }, // learn: off
    17: { adam: null, layla: { mood: "excited", message: "Save, say bye, plug in!" } }, // game: shutdown panel
    18: { adam: { mood: "thumbsup", message: "Put the landing in order." }, layla: null }, // prove: order
    19: { adam: { mood: "excited", message: "That landing was SMOOTH!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "The last hour is your body's." }, layla: null }, // learn: night
    21: { adam: { mood: "curious", message: "Send the screens out - watch the sky!" }, layla: null }, // game: night fall
    22: { adam: null, layla: { mood: "thumbsup", message: "Quick - which one keeps you up?" } }, // prove: speed
    23: { adam: null, layla: { mood: "excited", message: "All five powers - match time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Every trick has a hero move!" } }, // review: station match
    25: { adam: { mood: "worried", message: "The Battery Thief - drain his hoard!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch that power bar fill!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, Cyber Hero!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Battery Keeper badge earned!" }, layla: null }, // completion
  },
};

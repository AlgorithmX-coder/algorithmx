import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 13 - Screen Time: Balance Your Power.
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 BATTERY  screens use charge, life refills  | conveyorSort      | recall
 *     2 BELLS    notice the low-battery signs      | signBingo NEW     | speed
 *     3 SLEEP    screens out of bedtime            | chooseYourPath    | lie
 *     4 PLAN     build it WITH a grown-up          | dayBalancer NEW   | finish
 *     5 OFF      power off like a pro              | stepOrder         | order
 *   Consolidation (cyberScanner, Recharge Race skin) -> boss
 *   (placeholder quiz boss - the bespoke W13 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: SignBingo DEBUTS (match-the-scene-to-the-sign card -
 * fills square by square); DayBalancer DEBUTS (the over-loaded see-saw
 * with fake-recharge decoys - swap weight until it sits level);
 * conveyorSort returns 3 weeks after W10's Fact Scales as the Power
 * Sorter; stepOrder returns 2 weeks after W11's Protocol Launchpad
 * (earmarked for this ritual at its W5 debut). Lane-clean: balance,
 * body-signs, sleep, co-planning, stopping skills - the autoplay PULL
 * was W10's lane, in-game spending W7's. In-week flavour: the Battery
 * Thief. NEVER anti-screen: balance means SOME, not none.
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
    // 0 - OPENING VIDEO: the battery thief
    { type: "video", videoPlaceholder: "Week 13: The Battery Thief", videoSrc: "/videos/module-13-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[13] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-13.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's got a new hobby: battery thieving. Not phone batteries - KID batteries. He loves heroes drained, grumpy and glued to the glow, because tired heroes are easy to trick. This week you take your power back: hear the warning bells, guard your sleep, and power off like a pro.",
      photoCaption: "Wk 13 - The Battery Thief",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Hear the body-bells that say 'battery low'",
        "Keep screens out of your bedroom at night",
        "Power off like a pro - and make the plan WITH a grown-up",
      ],
    },

      // SIGNATURE: The Day Jug (bespoke mini-game unique to this week)
      { type: "signature", mechanic: "dayJug", title: "The Day Jug" },

    /* ─────────── BEAT 1 · YOUR POWER BAR ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Your Power Bar",
      content:
        "Game characters have a power bar over their heads - and guess what? So do you. It's invisible, but it's there. Fun things on screens are awesome... and they USE your charge. Sleep, snacks, running around and time with your people REFILL it. A Battery Keeper doesn't pick one or the other - they use BOTH, every day. That's what balance means.",
      bullets: [
        "You carry an invisible power bar",
        "Screen fun USES your charge",
        "Sleep and snacks REFILL you",
        "Moving and your people refill you too",
        "Battery Keepers use BOTH - that's balance",
      ],
      bulletIcons: ["⚡", "🎮", "🍌", "💪", "✅"],
      emblem: "⚡",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Week thirteen, hero - power week!",
          "Imagine a power bar floating over your head.",
          "Screen fun is awesome... and it USES your charge.",
          "Sleep, snacks, running around, your people - those REFILL it.",
          "[warmly] Keepers don't pick one. They balance both.",
          "[excited] Day-moments are rolling in - let's sort them!",
        ],
      },
    },
    // 4 - Game: SORT (conveyorSort re-dress - the Power Sorter)
    {
      type: "conveyorSort",
      introTitle: "The Power Sorter",
      introSubtitle: "Day-moments are riding the belt! Send each one to the right slot: does it REFILL your battery, or USE charge?",
      introIcon: "⚡",
      machineLabel: "THE POWER SORTER",
      chuteWord: "SLOT",
      completeTitle: "Every moment sorted!",
      completeLine: "Both slots belong in a good day - a Battery Keeper just keeps them balanced.",
      categories: [
        { id: "refill", label: "REFILLS", icon: "⚡", tone: "safe" },
        { id: "use", label: "USES CHARGE", icon: "🎮", tone: "lock" },
      ],
      items: [
        {
          id: "sleep",
          text: "A whole night's sleep",
          icon: "⏸️",
          categoryId: "refill",
          explanation: "The number one recharge in the universe - nothing refills a hero like sleep.",
        },
        {
          id: "kart",
          text: "An hour of kart racing",
          icon: "🎮",
          categoryId: "use",
          explanation: "Great fun - AND it uses charge. Fun isn't free power, and that's fine: it just needs balancing.",
        },
        {
          id: "park",
          text: "A park game of catch with friends",
          icon: "💪",
          categoryId: "refill",
          explanation: "Running, laughing, fresh air - your battery drinks this stuff up.",
        },
        {
          id: "episodes",
          text: "One more episode... then three more",
          icon: "🌀",
          categoryId: "use",
          explanation: "Every 'one more' sips a little more charge - four episodes is a LOT.",
        },
        {
          id: "dinner",
          text: "Family dinner and the day's stories",
          icon: "👪",
          categoryId: "refill",
          explanation: "Food AND your people at the same table - a double recharge.",
        },
        {
          id: "wakeup",
          text: "Grabbing the tablet the second you wake up",
          icon: "📱",
          categoryId: "use",
          explanation: "Spending charge before breakfast means starting the day already half-drained.",
        },
        {
          id: "drawing",
          text: "Drawing a comic on paper",
          icon: "🎨",
          categoryId: "refill",
          explanation: "Making things with your hands refills you - no glow required.",
        },
        {
          id: "midnight",
          text: "Scrolling under the covers at midnight",
          icon: "🤫",
          categoryId: "use",
          explanation: "A double drain: it spends charge AND blocks the night's big refill. The Battery Thief's favorite.",
        },
      ],
      hints: {
        tier1: "Ask: after this, would you feel MORE full of energy... or less?",
        tier2: "REFILLS = sleep, food, moving, people, making things. USES CHARGE = anything with a glowing screen.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Power Sorter is humming!",
          "Day-moments on the belt - sort every one.",
          "REFILLS to the left, USES CHARGE to the right.",
          "[warmly] Remember: using charge is fine. Heroes just keep it balanced!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here comes the first moment - which slot does it belong in?"],
      },
    },
    // 5 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What REFILLS your power bar?",
      choices: [
        { text: "Sleep, snacks, moving and your people", isCorrect: true },
        { text: "A brighter screen", isCorrect: false },
        { text: "Louder volume", isCorrect: false },
        { text: "One more episode", isCorrect: false },
      ],
      praise: "That's the recharge kit - sleep, food, moving, people. Screens are fun; they just don't refill. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Screen fun USES charge; sleep, food, moving and people REFILL it - a balanced day has both.",
      next: "the four body-bells that ring when your battery runs low",
      emblem: "⚡",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power one - you can READ a day now!",
          "Refills on one side, charge-users on the other.",
          "[whispers] But how do you know when the bar runs low?",
          "Your body rings little bells. Come listen...",
        ],
      },
    },

    /* ─────────── BEAT 2 · THE FOUR BODY-BELLS ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "The Four Body-Bells",
      content:
        "Your body is clever: when the battery runs low, it rings little warning bells. Nobody else can hear them - only you. There are four famous ones: eyes that go dry and scratchy, legs that turn buzzy and jiggly, a voice that snaps louder than you meant, and a tummy that rumbles because you forgot all about it. Hearing a bell isn't bad news - it's a superpower. It means you caught the Battery Thief EARLY.",
      bullets: [
        "Your body rings quiet warning bells",
        "Dry, scratchy eyes",
        "Buzzy, jiggly legs",
        "A snappy grump voice",
        "A rumbly, forgotten tummy",
      ],
      bulletIcons: ["🔔", "👀", "⚡", "💬", "🍌"],
      emblem: "🔔",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's a secret: your body TALKS to you.",
          "When the battery runs low, it rings little bells.",
          "Scratchy eyes. Jiggly legs. A snappy voice. A forgotten tummy.",
          "[whispers] Only you can hear them...",
          "[excited] and hearing one means you caught the Thief EARLY.",
          "Four scenes coming up - spot the bell in each one!",
        ],
      },
    },
    // 8 - Game: SELECT (signBingo DEBUT - Break-Sign Bingo)
    {
      type: "signBingo",
      introTitle: "Break-Sign Bingo",
      introSubtitle: "Four scenes, four body-bells. Tap the sign each scene is showing and fill the whole card!",
      introIcon: "🔔",
      cardTitle: "BREAK-SIGN BINGO",
      stampToast: "SIGN SPOTTED!",
      wrongTitle: "Not that bell!",
      completeTitle: "BINGO! Full card!",
      completeLine: "Four body-bells learned - when one rings, you've caught the Battery Thief early.",
      signs: [
        { id: "eyes", label: "Dry, scratchy eyes", icon: "👀" },
        { id: "legs", label: "Buzzy, jiggly legs", icon: "⚡" },
        { id: "grump", label: "Snappy grump voice", icon: "💬" },
        { id: "tummy", label: "Forgotten rumbly tummy", icon: "🍌" },
      ],
      rounds: [
        {
          id: "maya",
          scene: "Maya's been kart-racing for AGES. She blinks and blinks - her eyes feel like sandpaper.",
          sceneIcon: "🎮",
          signId: "eyes",
          note: "Listen again: it's Maya's EYES doing the talking - blinky and scratchy like sandpaper. That's the dry-eyes bell.",
        },
        {
          id: "leo",
          scene: "Leo's watched videos all afternoon. Under the table, his legs bounce and jiggle like they're full of bees.",
          sceneIcon: "🌀",
          signId: "legs",
          note: "It's Leo's LEGS - bouncing under the table like they're full of bees. They're begging to run somewhere real.",
        },
        {
          id: "zara",
          scene: "Dad asks Zara ONE tiny question. 'WHAT?!' she snaps - way louder than she meant to.",
          sceneIcon: "💬",
          signId: "grump",
          note: "Hear the snap? A voice that comes out louder than you meant is the grump bell - that's low battery talking.",
        },
        {
          id: "kai",
          scene: "Kai's tummy rumbles like thunder. Lunchtime came and went... and he never even noticed.",
          sceneIcon: "🍌",
          signId: "tummy",
          note: "That thunder-rumble is Kai's TUMMY - so glued to the screen it forgot lunch existed.",
        },
      ],
      hints: {
        tier1: "Read the scene again - which body part is doing the talking?",
        tier2: "Eyes = scratchy blinking · legs = bouncing · voice = snapping · tummy = rumbling.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Bingo card ready - four bells on it!",
          "A scene plays... somebody's body is ringing.",
          "Tap the sign you spot,",
          "[excited] and fill the whole card. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read Maya's scene - which body-bell is ringing? Tap it on the card!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - your eyes have gone dry and scratchy! What are they saying?",
      speedMs: 5000,
      choices: [
        { text: "Battery low - break time!", isCorrect: true },
        { text: "Blink less, play more", isCorrect: false },
        { text: "Turn the brightness up", isCorrect: false },
      ],
      praise: "Heard at hero speed - that bell means break time! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Dry eyes, jiggly legs, a grump voice, a forgotten tummy - four bells that mean 'break time'.",
      next: "the Battery Thief's favorite trick: screens at bedtime",
      emblem: "🔔",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Two powers - you can HEAR your battery now!",
          "Four bells, four early warnings.",
          "[whispers] But the Thief's biggest steal happens after dark...",
          "He's after the biggest recharge of all. Your sleep.",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE MOON-SHOOER ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Screens Shoo Sleep Away",
      content:
        "Sleep is the biggest recharge there is - and screens can shoo it away. Here's why: screen light is bright, like a tiny sun. Show it to your brain at bedtime and your brain shouts 'It's DAYTIME! Stay awake!' - and your sleepiness runs off and hides. That's why devices sleep OUTSIDE the bedroom, in a charging garage. You park the screen, the moon does the rest.",
      bullets: [
        "Sleep is the BIGGEST recharge",
        "Screen light shouts 'it's daytime!'",
        "Your brain believes it - and sleep hides",
        "Devices sleep in the charging garage",
        "Not under the covers. Not by the pillow.",
      ],
      bulletIcons: ["🌠", "💡", "🧠", "🏠", "🚫"],
      emblem: "🌠",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Now for the biggest recharge of all: sleep.",
          "Screen light is like a tiny sun.",
          "Show it to your brain at bedtime and it shouts:",
          "[excited] 'It's DAYTIME! Stay awake!'",
          "[whispers] So the screen sleeps in the garage... and the moon does the rest.",
          "Three bedtime moments - make the Keeper's call!",
        ],
      },
    },
    // 12 - Game: DECIDE (chooseYourPath - the Bedtime Garage)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "The bedtime chime rings right in the MIDDLE of an episode...",
          choices: [
            {
              text: "Park the tablet in its charging garage",
              isSafe: true,
              consequence: "The episode waits all night without moving a single pixel - stories are patient like that. You sleep like a champion and catch the ending tomorrow.",
            },
            {
              text: "Sneak it under the covers for 'five more minutes'",
              isSafe: false,
              consequence: "The little sun shouts 'DAYTIME!' at your brain till way past ten. Morning-you stumbles about like a grumpy zombie with sandpaper eyes.",
            },
          ],
        },
        {
          setup: "'Just one more level and THEN I'll sleep,' you promise yourself. But the level ends at a shiny NEW level...",
          choices: [
            {
              text: "Pause and park - the level will wait",
              isSafe: true,
              consequence: "Here's the pro secret: games are built to never feel finished. YOU chose the ending anyway - and tomorrow-you plays better on a full battery.",
            },
            {
              text: "Keep going till the game feels finished",
              isSafe: false,
              consequence: "Games are built to NEVER feel finished - that's the trap. The Battery Thief giggles while your big recharge shrinks hour by hour.",
            },
          ],
        },
        {
          setup: "Your friend whispers: 'Keep your phone under your pillow tonight - we can chat at MIDNIGHT!'",
          choices: [
            {
              text: "Phones sleep in the garage - we chat tomorrow",
              isSafe: true,
              consequence: "The messages are all still there in the morning - and you've got the battery to actually enjoy them. Best of both!",
            },
            {
              text: "Sounds fun - secret midnight chats!",
              isSafe: false,
              consequence: "Ping! Ping! Every buzz pokes a hole in your sleep. By Tuesday there are two drained, grumpy friends - the Battery Thief's favorite double steal.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three bedtime moments. One golden rule.",
          "Screens sleep in the garage -",
          "[whispers] so the moon can do its work.",
          "[excited] Show me the Keeper's moves!",
        ],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "bright screens at bedtime shout 'DAYTIME!' at kids' brains and shoo their sleep away... that's why I LOVE tucking tablets under pillows!",
      choices: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
      praise: "Sharp ears - that one's actually TRUE! Screen light really does shoo sleep away... which is exactly why screens sleep in the garage. ✓",
      nudge: "Careful - check the FACT, not just who's saying it. What does screen light shout at your brain?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Screen light shouts 'daytime!' at your brain - so devices sleep in the charging garage, not the bedroom.",
      next: "building the battery plan WITH a grown-up - as a team",
      emblem: "🌠",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three powers - your sleep is GUARDED!",
          "Chime rings, tablet parks, moon works.",
          "[warmly] Now, who helps you plan the whole day?",
          "Not a boss. A teammate. Come and meet the see-saw...",
        ],
      },
    },

    /* ─────────── BEAT 4 · PLAN IT TOGETHER ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Plan It Together",
      content:
        "Rules dropped on you feel unfair - and unfair rules are hard to keep. But a plan you build WITH a grown-up? That one's YOURS. You agree the screen time and the recharge time together, then you both sign it like teammates. And here's the best bit: a good plan keeps screen fun IN. Balance means some every day - not none.",
      bullets: [
        "Rules done TO you feel unfair",
        "A plan made TOGETHER is yours",
        "Agree screen time AND recharge time",
        "Both of you sign it",
        "Balance keeps the fun IN",
      ],
      bulletIcons: ["✋", "👪", "⚡", "✅", "🎉"],
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Nobody likes rules dumped on them.",
          "So Keepers don't get rules. They BUILD plans.",
          "You and a grown-up, agreeing it together -",
          "screen time AND recharge time. Then you both sign.",
          "[excited] And the fun stays in! Balance means some, not none.",
          "One day is tipping over with screens - let's fix it together!",
        ],
      },
    },
    // 16 - Game: BUILD (dayBalancer DEBUT - the See-Saw Day)
    {
      type: "dayBalancer",
      introTitle: "The See-Saw Day",
      introSubtitle: "This day plan is tipping over with screens! Swap blocks for REAL recharges until it sits level. Watch out - some swaps are screens in disguise!",
      introIcon: "⚡",
      meterLabel: "BALANCE",
      leftLabel: "SCREEN SIDE",
      rightLabel: "RECHARGE SIDE",
      swapToast: "REAL RECHARGE!",
      wrongTitle: "Still a screen in disguise!",
      cosignLine: "👪 CO-SIGNED! This plan belongs to both of you now.",
      completeTitle: "The see-saw sits LEVEL!",
      completeLine: "Two screen blocks stayed aboard - balance means SOME, not none.",
      keptBlocks: [
        { label: "Saturday cartoons", icon: "🌀" },
        { label: "After-homework game hour", icon: "🎮" },
      ],
      swaps: [
        {
          id: "breakfast",
          story: "7am: cartoons at breakfast, cartoons brushing teeth, cartoons in the car. The plank is CREAKING - swap this block for a real recharge!",
          blockLabel: "Breakfast cartoons",
          blockIcon: "📱",
          options: [
            { label: "Breakfast chat at the table", icon: "👪", isBalancing: true, note: "" },
            {
              label: "Cartoons with the sound OFF",
              icon: "🤫",
              isBalancing: false,
              note: "Sneaky - but silent cartoons are still a screen! Your eyes don't care about the volume.",
            },
            {
              label: "Watch on the tiny phone instead",
              icon: "📱",
              isBalancing: false,
              note: "Smaller screen, same drain. The Battery Thief LOVES this swap - because nothing really changed.",
            },
          ],
        },
        {
          id: "afterschool",
          story: "3:30pm: straight off the bus, straight onto the console, straight through till dinner. Swap it for something that refills!",
          blockLabel: "Bus-to-dinner gaming",
          blockIcon: "🎮",
          options: [
            { label: "Park game of catch first, console after", icon: "💪", isBalancing: true, note: "" },
            {
              label: "Swap the console for videos",
              icon: "🌀",
              isBalancing: false,
              note: "Console to videos is screen to screen - the plank didn't move an inch!",
            },
            {
              label: "Game with snacks so it counts as dinner",
              icon: "🍌",
              isBalancing: false,
              note: "Chips balanced on a controller isn't dinner - that's a screen block wearing a snack hat!",
            },
          ],
        },
        {
          id: "bedtime",
          story: "9pm: scrolling in bed 'to get sleepy'... but the scroll never sleeps. One last swap makes it level!",
          blockLabel: "Bed scrolling",
          blockIcon: "🤫",
          options: [
            { label: "A story, then lights out", icon: "🌠", isBalancing: true, note: "" },
            {
              label: "Scrolling with brightness turned down",
              icon: "💡",
              isBalancing: false,
              note: "Dimmer is still daytime-light to your brain - the big sleep recharge stays broken.",
            },
            {
              label: "Falling asleep to autoplay videos",
              icon: "🌀",
              isBalancing: false,
              note: "Autoplay pokes your sleep all night long - that's the Battery Thief tucking you in!",
            },
          ],
        },
      ],
      hints: {
        tier1: "A real recharge has NO screen in it - check each card for hidden glow.",
        tier2: "'Quieter', 'smaller' and 'dimmer' are still screens. Look for people, moving, stories and sleep.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at this day - the see-saw's tipping right over!",
          "One screen block at a time will light up.",
          "Swap it for a REAL recharge...",
          "[whispers] but watch out. Some swaps are screens in disguise!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read the glowing block's story - then pick the swap with NO screen hiding in it!"],
      },
    },
    // 17 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Who makes the screen plan work best?",
      choices: [
        { text: "You and a grown-up, together", isCorrect: true },
        { text: "Just you, on your own", isCorrect: false },
        { text: "Just the grown-up", isCorrect: false },
        { text: "Nobody - plans aren't needed", isCorrect: false },
      ],
      praise: "Together - you build it and sign it like teammates. A plan you own is a plan that works. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Build the battery plan WITH a grown-up and co-sign it - balance keeps some screen fun in every day.",
      next: "the final Keeper skill: powering off like a pro",
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four powers - and a co-signed plan!",
          "The see-saw sits level, fun still aboard.",
          "[warmly] One skill left, and it's the trickiest:",
          "actually STOPPING. Pros make it look easy. Let's learn how.",
        ],
      },
    },

    /* ─────────── BEAT 5 · POWER OFF LIKE A PRO ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Power Off Like a Pro",
      content:
        "Anyone can get dragged off a screen, kicking and moaning. A pro POWERS OFF - and it's a real skill with five moves. Finish the level or episode. Say bye to your game friends. Screen off. Park it in the garage. Pick your next adventure. Same five moves every time, until they're easy. Because here's the truth: endings feel great when YOU'RE the one choosing them.",
      bullets: [
        "Stopping is a SKILL - pros practice it",
        "Finish the level or episode first",
        "Say bye to your game friends",
        "Screen off, park it in the garage",
        "Pick your next adventure",
      ],
      bulletIcons: ["🏆", "✅", "💬", "🏠", "🎨"],
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Last power - and it's the one pros brag about.",
          "Anyone can be dragged off a screen, moaning.",
          "A pro powers OFF. Five smooth moves:",
          "finish, say bye, screen off, park it, pick what's next.",
          "[excited] Same five every time - till it's easy.",
          "The launchpad's ready. Show me the Power-Down Five!",
        ],
      },
    },
    // 20 - Game: ORDER (stepOrder re-dress - the Power-Down Five)
    {
      type: "stepOrder",
      introTitle: "The Power-Down Five",
      introSubtitle: "Five pro moves, one smooth power-off. Tap them in the order a Battery Keeper would do them!",
      introIcon: "⏸️",
      steps: [
        { id: "finish", text: "Finish the level", icon: "✅", affirmation: "Ended on YOUR terms - like a pro!" },
        { id: "bye", text: "Say bye to your friends", icon: "💬", affirmation: "No vanishing - heroes sign off!" },
        { id: "off", text: "Screen OFF", icon: "⏸️", affirmation: "Click. The glow goes quiet." },
        { id: "park", text: "Park it in the garage", icon: "🏠", affirmation: "Parked and charging - for the screen AND for you!" },
        { id: "next", text: "Pick your next adventure", icon: "🎨", affirmation: "Straight into the next fun thing - that's the pro trick!" },
      ],
      hints: {
        tier1: "Start where the fun ends TIDILY - and finish by choosing what comes next.",
        tier2: "Finish → say bye → screen off → park it → pick what's next.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Power-Down Five, all shuffled up!",
          "Tap the moves in a pro's order.",
          "Where does a smooth ending START?",
          "[whispers] Think it through... then go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["What's a pro's FIRST move when the chime rings? Tap it!"],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "The bedtime chime rings mid-level! Tap your pro moves in order:",
      choices: [
        { text: "Finish the level", isCorrect: true },
        { text: "Say bye to your game friends", isCorrect: true },
        { text: "Screen OFF, park it in the garage", isCorrect: true },
        { text: "Pick what's next - story, then sleep", isCorrect: true },
      ],
      praise: "Chime rang, pro moves rolled - finish, bye, park, pick. YOU chose the ending. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Finish, say bye, off, park, pick what's next - the Power-Down Five makes YOU the boss of endings.",
      next: "one final battery check, then the Battery Thief's lair",
      emblem: "⏸️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Battery Keeper!",
          "Bar read, bells heard, sleep guarded,",
          "plan co-signed... and endings YOU choose.",
          "[whispers] One final battery check...",
          "[excited] then we take back every drop he stole!",
        ],
      },
    },

    // 23 - Consolidation: Recharge Race (W1 scanner engine, W13 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "POWER UP",
        negative: "POWER DRAIN",
        positiveHint: "Tap POWER UP for choices that keep your battery green",
        negativeHint: "Tap POWER DRAIN for the Battery Thief's sneaky steals",
        tipWhenPositive: "Bells heard, garages used, plans co-signed - green-bar moves, every one.",
        tipWhenNegative: "Under-the-covers screens, endless episodes, ignored bells - the Thief feeds on these.",
        hint1: "Ask: does this REFILL the battery... or quietly drain it?",
        hint2: "POWER UP = breaks, sleep, co-signed plans, real recharges. DRAIN = sneaky screens and ignored bells.",
        hint2Example: "POWER UP: 'parked at the chime'   DRAIN: 'scrolling under the covers'",
        hint3: "Keeper card: hear the bells · park at night · plan together · power off like a pro.",
        hint3Example: "Park it in the garage ✅    Under the pillow ❌",
      },
      items: [
        {
          text: "Parking the tablet the moment the bedtime chime rings",
          isStrong: true,
          explanation: "The garage move - your brain gets the moon, the screen gets its charger.",
        },
        {
          text: "One more episode... for the fifth time tonight",
          isStrong: false,
          explanation: "Autoplay math: 'one more' five times is a whole missed recharge.",
        },
        {
          text: "Taking a break the moment your legs go jiggly",
          isStrong: true,
          explanation: "Bell heard, break taken - you caught the Thief before he got a drop.",
        },
        {
          text: "A phone tucked under the pillow for midnight chats",
          isStrong: false,
          explanation: "Every ping pokes a hole in the night's big recharge - the Thief's double steal.",
        },
        {
          text: "A screen plan you and Dad both signed",
          isStrong: true,
          explanation: "Co-signed means it's YOURS - and plans you own are plans that work.",
        },
        {
          text: "Playing on till your eyes feel like sandpaper",
          isStrong: false,
          explanation: "That bell rang ages ago - playing through it hands the Thief your charge.",
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Final check - the Recharge Race!",
          "Choices are drifting past the scanner.",
          "POWER UP for the green-bar moves...",
          "[warmly] POWER DRAIN for the Thief's tricks. Scan!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W13 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: balance your power
    { type: "video", videoPlaceholder: "Week 13: Balance Your Power", videoSrc: "/videos/module-13-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "battery", label: "Battery Wise", accent: "#7eff97", icon: "⚡", summary: "Screen fun uses charge; sleep, food, moving and people refill it." },
        { id: "bells", label: "Bell Hearer", accent: "#7df0ff", icon: "🔔", summary: "Dry eyes, jiggly legs, grump voice, forgotten tummy - you hear all four." },
        { id: "moon", label: "Moon Keeper", accent: "#c084fc", icon: "🌠", summary: "Screens sleep in the garage so the night's big recharge works." },
        { id: "plan", label: "Plan Partner", accent: "#ffd158", icon: "👪", summary: "You build the plan WITH a grown-up and co-sign it like teammates." },
        { id: "pro", label: "Power-Off Pro", accent: "#ff5fb3", icon: "⏸️", summary: "Finish, bye, off, park, pick next - endings YOU choose." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The bar, the bells, the garage,",
          "the co-signed plan... and the Power-Down Five.",
          "[laughs] The Battery Thief just went hungry.",
          "[excited] Sticker time, Battery Keeper!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "bell-hearer", name: "Bell Hearer", icon: "🔔", description: "Hears the body-bells before anyone else." },
        { id: "garage-keeper", name: "Garage Keeper", icon: "🏠", description: "Parks the screens so the moon can work." },
        { id: "power-off-pro", name: "Power-Off Pro", icon: "⏸️", description: "Ends the game like a boss - on purpose." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Bespoke W13 showdown: drain the Battery Leech's stolen hoard in the
  // garage-lair. Heroes fight in pajamas - it's a power-down week.
  bossShowdown: {
    machine: {
      name: "THE BATTERY LEECH",
      tagline: "A greedy hose that slurps kid-charge straight into his hoard",
      art: {
        intact: "/game/bosses/w13-batteryleech-intact.png",
        damaged: "/game/bosses/w13-batteryleech-damaged.png",
        defeated: "/game/bosses/w13-batteryleech-defeated.png",
      },
      arena: "/game/backgrounds/w13-arena-garage.png",
      accent: "#7eff97",
      glow: "rgba(126,255,151,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w13/adam-pj-idle.png",
        attack: "/game/characters/w13/adam-pj-attack.png",
        celebrate: "/game/characters/w13/adam-pj-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w13/layla-pj-idle.png",
        attack: "/game/characters/w13/layla-pj-attack.png",
        celebrate: "/game/characters/w13/layla-pj-celebrate.png",
      },
    },
    phases: [
      // P1 · ONE MORE EPISODE → SHIELD-HOLD: hold your own ending until the
      // auto-next spiral winds down and the credits roll. (Coach copy must
      // not contain the holdLabel phrase - QA text-match rule.)
      {
        kind: "shieldHold",
        attack: 0,
        coach: "The next match starts itself every time. Press and keep pressing till YOU call the last one!",
        holdLabel: "THAT WAS MY LAST MATCH",
        holdIcon: "✋",
        holdSecs: 6,
        barrage: [
          "Next match starts in three... two...",
          "You can't stop on a LOSS, can you?",
          "Winners always play just ONE more round!",
          "The queue NEVER runs out, kid!",
          "Stopping now? On THIS streak?!",
        ],
        burnoutLine: "The auto-queue fizzles out... you set the controller down. THAT was the last one, because YOU said so.",
      },
      // P2 · UNDER-THE-COVERS SCREEN → TAP-THE-TELL: the dark bedroom,
      // one sneaky glow per round marching itself to the charging garage.
      {
        kind: "tapTell",
        attack: 1,
        coach: "Sleep happens here, so screens don't. Tap the sneaky glow!",
        rounds: [
          {
            id: "tent",
            prompt: "Torch off, sleeping bags zipped in the tent... but something in here is still glowing.",
            promptIcon: "🤫",
            options: [
              { id: "console", label: "A games console someone smuggled in", icon: "🎮", isTell: true, note: "" },
              { id: "glowstar", label: "A glow-star stuck to the tent roof", icon: "🌠", isTell: false, note: "Glow-stars soak up daylight and shine soft, no screen and no steal. Find the real glow!" },
              { id: "biscuits", label: "A packet of biscuits saved for morning", icon: "🍌", isTell: false, note: "Biscuits don't glow, and they'll keep till sunrise. Hunt the screen!" },
            ],
          },
          {
            id: "sleepover",
            prompt: "Sleepover night, everyone meant to be asleep... one corner keeps flickering.",
            promptIcon: "🤫",
            options: [
              { id: "nightlight", label: "A little plug-in nightlight", icon: "💡", isTell: false, note: "A soft nightlight helps sleep, it never shouts daytime at your brain. Keep looking!" },
              { id: "phone", label: "A phone propped up playing videos", icon: "📱", isTell: true, note: "" },
              { id: "comics", label: "A pile of comics for the morning", icon: "📋", isTell: false, note: "Paper comics wait quietly till sunrise, no glow at all. Find the flicker!" },
            ],
          },
          {
            id: "carride",
            prompt: "The car's dark and quiet on the long drive home. One little light won't switch off.",
            promptIcon: "🤫",
            options: [
              { id: "dashclock", label: "The car's dashboard clock", icon: "💡", isTell: false, note: "The dashboard glow helps the grown-up DRIVE, that light has a job. Find the screen stealing your sleep!" },
              { id: "softtoy", label: "A soft toy buckled in beside you", icon: "🎁", isTell: false, note: "Buckled-in teddies are champion nappers, zero glow. Hunt the screen!" },
              { id: "tablet", label: "A tablet still streaming a show", icon: "🌀", isTell: true, note: "" },
            ],
          },
        ],
      },
      // P3 · BATTERY DRAIN → DEFLECT-SORT (inverted): CATCH the refills
      // into your battery, let the drains bounce off.
      {
        kind: "deflectSort",
        attack: 2,
        coach: "Refills go IN the battery. Everything else bounces!",
        actLabel: "CATCH THE REFILL!",
        actIcon: "⚡",
        passLabel: "DRAIN - LET IT BOUNCE",
        items: [
          { id: "bike", label: "A bike ride round the block", icon: "💪", act: true, note: "Pedaling, fresh air, real energy, your battery fills right up. Catch it!" },
          { id: "learnapp", label: "A learning app... for the fourth hour straight", icon: "📱", act: false, note: "Learning apps are still screens, four hours drains you no matter how clever it is. Bounce it!" },
          { id: "den", label: "Building a den with your cousins", icon: "👪", act: true, note: "Cousins, cushions and imagination, not a screen in sight. Pure refill. Catch it!" },
          { id: "gardengame", label: "A phone game played out in the garden", icon: "🎮", act: false, note: "Fresh air is lovely, but the eyes are still on a screen, so it still uses charge. Bounce it!" },
          { id: "breakfast", label: "A proper breakfast before anything else", icon: "🍌", act: true, note: "Fuel first thing beats starting the day half-drained. Catch it!" },
          { id: "watching", label: "Watching someone ELSE play games for an hour", icon: "🌀", act: false, note: "Watching play-throughs is still an hour of glow, fun but it uses charge. Bounce it!" },
        ],
      },
    ],
    weakPoints: [
      { question: "You keep telling yourself you'll stop 'when the game feels done'. Why is that a trap?", answers: ["The game is broken and won't end", "Games are built to never feel done, so 'done' never comes, YOU pick the ending", "You're not good enough to finish it yet", "Grown-ups hid the ending button"], correctIndex: 1, explanation: "Waiting for 'done' waits forever, a Battery Keeper decides the ending on purpose." },
      { question: "You're sleeping over at Gran's and there's no charging garage. Where should your tablet spend the night?", answers: ["Tucked under your pillow so you don't lose it", "On the bed by your head, screen up", "Out of the room you sleep in, like on the kitchen side", "Inside your sleeping bag to keep it warm"], correctIndex: 2, explanation: "No garage? The rule still holds, screens sleep away from where YOU sleep, so the light can't shout daytime." },
      { question: "Your battery feels totally drained after a long screen morning. What's the FASTEST way to fill it back up?", answers: ["Get outside and move, then eat something real", "Switch to a different, brighter game", "Watch a calmer show to 'rest'", "Turn the volume down and keep playing"], correctIndex: 0, explanation: "A screen can't refill a screen-drained battery, moving, food, rest and people do that job." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE POWER-DOWN",
      chargeIcon: "⏸️",
      chargeSecs: 5,
      milestones: ["Finish... bye... off…", "The batteries are flying home…", "NIGHT-LIGHT ON! LET GO!"],
      payoffTitle: "POWERED DOWN!",
      payoffLine: "Every stolen battery zips home to its kid, glowing full. The leech's hose flops flat, and the whole lair dims to one cozy night-light. Fun had, charge kept - the ending was YOURS.",
    },
    villain: {
      arrival: "Shhh! Welcome to my battery collection! All donated! Involuntarily!",
      phases: [
        "The next episode picked ITSELF! Democracy!",
        "A little glow under the duvet never hurt anyone! Much!",
        "Your charge tastes like WEEKENDS!",
      ],
      escape: "Give those BACK! Do you know how long I leeched for those?!",
    },
    voiceSlug: "w13",
  },
  badgeArt: "/cyberheroes/badges/week-13-battery-keeper.png",

  // Week-lane attack theatre: battery tricks only (autoplay's PULL was
  // W10's lane; in-game spending W7's; this is drain/sleep/stopping).
  bossAttacks: [
    { name: "ONE MORE EPISODE", icon: "🌀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "You choose the ending", emblemColor: 0xc084fc },
    { name: "UNDER-THE-COVERS SCREEN", icon: "🤫", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Screens sleep in the garage", emblemColor: 0x7df0ff },
    { name: "BATTERY DRAIN", icon: "⚡", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Hear the body-bells", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W13 fight - drain the Thief's
  // stolen battery hoard - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Your eyes go dry and scratchy mid-game. What's your body saying?", answers: ["Battery low - break time!", "Play faster", "Turn the brightness up", "Nothing at all"], correctIndex: 0, explanation: "That's one of the four body-bells - hearing it early is a Keeper superpower." },
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

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 13 - power week!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's stealing KID batteries now..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Keeper kit ready? Here's the plan." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "Everyone carries a power bar." } }, // learn: battery
    4: { adam: null, layla: { mood: "curious", message: "Sort the day-moments!" } }, // game: conveyorSort
    5: { adam: { mood: "thumbsup", message: "What fills the bar back up?" }, layla: null }, // prove: recall
    6: { adam: { mood: "excited", message: "You can read a whole day now!" }, layla: null }, // recap 1
    7: { adam: { mood: "curious", message: "Listen... your body rings bells." }, layla: null }, // learn: bells
    8: { adam: { mood: "excited", message: "Fill that bingo card!" }, layla: null }, // game: signBingo
    9: { adam: null, layla: { mood: "thumbsup", message: "Quick - what's that bell saying?" } }, // prove: speed
    10: { adam: null, layla: { mood: "excited", message: "Four bells - you hear them all!" } }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "Screen light is a tiny sun..." } }, // learn: sleep
    12: { adam: null, layla: { mood: "curious", message: "Bedtime calls - Keeper's choice!" } }, // game: decide
    13: { adam: { mood: "worried", message: "Careful - is he fibbing this time?" }, layla: null }, // prove: lie
    14: { adam: { mood: "excited", message: "Sleep guarded - the moon thanks you!" }, layla: null }, // recap 3
    15: { adam: { mood: "thinking", message: "Plans beat punishments every time." }, layla: null }, // learn: plan
    16: { adam: { mood: "curious", message: "Level that see-saw - carefully!" }, layla: null }, // game: dayBalancer
    17: { adam: null, layla: { mood: "thumbsup", message: "Who makes the plan work best?" } }, // prove: finish
    18: { adam: null, layla: { mood: "excited", message: "Co-signed and level - amazing!" } }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "Stopping is a skill. Truly!" } }, // learn: power-off
    20: { adam: null, layla: { mood: "curious", message: "Five moves - pro order!" } }, // game: stepOrder
    21: { adam: { mood: "thumbsup", message: "One more time - in order!" }, layla: null }, // prove: order
    22: { adam: { mood: "excited", message: "All five powers - final check!" }, layla: null }, // recap 5
    23: { adam: { mood: "excited", message: "Power up or power drain - you know!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "His battery hoard - take it back!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch your power come home!" } }, // outro video
    26: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    27: { adam: { mood: "excited", message: "Stickers earned, Keeper!" }, layla: null }, // stickers
    28: { adam: { mood: "thumbsup", message: "Battery Keeper badge earned!" }, layla: null }, // completion
  },
};

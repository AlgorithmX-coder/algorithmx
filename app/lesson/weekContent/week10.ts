import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 10 - YouTube & Videos: Escape the Rabbit Hole.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 BELT     autoplay is built to keep you   | reveal (🌀)     | finish
 *     2 FACTS    "a video said so" isn't proof   | conveyorSort    | lie
 *     3 ESCAPE   not everything is for you       | buttonHunt      | order
 *     4 COMMENTS comments are strangers          | spamBlaster     | recall
 *     5 SIGNS    notice "I've been watching a while" | chooseYourPath | speed
 *   Consolidation (cyberScanner, Climb Out skin) -> boss
 *   (placeholder quiz boss - the bespoke W10 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: buttonHunt returns 4 weeks after W6 as the Escape Hatch
 * (video-player controls, not a game lobby); spamBlaster returns 4 weeks
 * after W6 as the Comment Pond (incoming stranger comments, not outgoing
 * overshares - new introIcon + hints props stop the W1 email copy
 * leaking); conveyorSort returns 2 weeks after W8 as the Fact Scales
 * (claims vs facts, not photo audiences). Lane-clean: the PULL of videos
 * - screen-time balance is W13's, app sources were W9's, stranger chat
 * was W3's (beat 4 only APPLIES W3 to comments).
 */
export const WEEK_10: WeekContent = {
  weekNumber: 10,
  title: "YouTube & Videos: Escape the Rabbit Hole",
  topic: "youtube-videos",
  badgeName: "Pull Noticer",
  badgeIcon: "⏸️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 10: ESCAPE THE RABBIT HOLE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: down the rabbit hole
    { type: "video", videoPlaceholder: "Week 10: Down the Rabbit Hole", videoSrc: "/videos/module-10-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[10] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-10.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon rigged the video app so the next video ALWAYS starts by itself. Kids sat down for ONE video and looked up two hours later - and some of what they watched wasn't even true. This week you learn to notice the pull... and climb out.",
      photoCaption: "Wk 10 - Escape the Rabbit Hole",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Notice the belt that picks the next video FOR you",
        "Weigh wild claims against a real source",
        "Know the calm way out - back out, then tell",
      ],
    },

      // SIGNATURE: The Great Climb-Out (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "greatClimbOut",
        title: "The Great Climb-Out",
        narration: {
          speaker: "adam",
          lines: [
            "[warmly] Those videos pulled you deep, but you can climb out.",
            "Tap left, then right, up the ladder to the daylight.",
            "Don't tap the shiny bubbles. You choose when to stop!",
          ],
        },
      },

    /* ─────────── BEAT 1 · THE AUTOPLAY BELT ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "The Next-Video Belt",
      content:
        "When one video ends, the next one starts all by itself - did you ever wonder why? Under the screen there's a belt, and its one job is to keep you watching. The countdown rushes you, the thumbnails shout at your eyes, and the belt rolls on and on. It isn't magic - it's a machine. And once you can SEE a machine, it can't sneak up on you.",
      bullets: [
        "The next video picks ITSELF - that's autoplay",
        "The countdown rushes you on purpose",
        "Thumbnails are chosen to hook your eyes",
        "It's a machine - not magic",
        "See the machine, break the spell",
      ],
      bulletIcons: ["🔀", "⚡", "👀", "⚙️", "⏸️"],
      emblem: "🔀",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero! Week ten - the rabbit hole.",
          "Ever notice how the next video just... starts?",
          "You didn't pick it. Nobody picked it.",
          "[whispers] Something under the screen picked it FOR you.",
          "It's called autoplay - and it's a machine with one job: keep you watching.",
          "[excited] Come on - let's pull the curtain and see it!",
        ],
      },
    },
    // 4 - Game: REVEAL (the Curtain Pull - 🌀 board)
    {
      type: "reveal",
      title: "The Curtain Pull",
      subtitle: "Four parts of the watching machine. Pull each curtain and see what's REALLY doing the pulling.",
      boardIcon: "🌀",
      items: [
        {
          id: "belt",
          label: "The Never-Ending Belt",
          icon: "🔀",
          steps: [
            { icon: "👀", text: "Your video ends... and a new one starts ALL BY ITSELF. You never touched a thing." },
            { icon: "🔀", text: "Look under the screen: a belt, rolling the next video in. IT picks - not you." },
            { icon: "💡", text: "The belt's only job is keeping you on it. Knowing that is half the escape." },
          ],
          counter: "Autoplay chooses FOR you.",
        },
        {
          id: "countdown",
          label: "The Countdown Rush",
          icon: "⚡",
          steps: [
            { icon: "⚡", text: "NEXT VIDEO IN 5... 4... 3... Why the big rush?" },
            { icon: "🧠", text: "Five seconds is NOT enough time to ask 'do I even want this?' - and that's on purpose." },
            { icon: "⏸️", text: "The pause button beats every countdown. YOU set the speed, not the timer." },
          ],
          counter: "The rush is built in - the pause is yours.",
        },
        {
          id: "thumbnails",
          label: "The Hungry Thumbnails",
          icon: "👀",
          steps: [
            { icon: "👀", text: "Huge faces! Giant arrows! 'YOU WON'T BELIEVE WHAT HAPPENS!'" },
            { icon: "🎯", text: "A computer picked that exact picture for YOUR eyes - like candy stacked at the checkout." },
            { icon: "🧠", text: "Ask yourself: do I want THIS... or did the picture just shout the loudest?" },
          ],
          counter: "Thumbnails are chosen to hook your eyes.",
        },
        {
          id: "curtain",
          label: "Behind the Curtain",
          icon: "🦝",
          steps: [
            { icon: "🚪", text: "Grab the big red curtain at the back of the machine... and PULL." },
            { icon: "🦝", text: "The Raccoon! Oil can in paw, greasing the belt so it never squeaks and never, ever stops." },
            { icon: "💪", text: "It's a MACHINE - and machine-spotters can't be pulled. That's your new power." },
          ],
          counter: "See the machine, break the spell.",
        },
      ],
      finale: "Curtain pulled! You've seen the whole machine - the belt can never sneak up on you again.",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Hear that hum? That's the watching machine.",
          "Four curtains hide its four tricks.",
          "[excited] Pull every one and see what's really pulling YOU.",
          "Machine-spotters can't be caught. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Pull the first curtain - let's see what's doing the pulling!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Autoplay is built to keep me ___.",
      choices: [
        { text: "watching", isCorrect: true },
        { text: "choosing", isCorrect: false },
        { text: "waiting", isCorrect: false },
        { text: "learning", isCorrect: false },
      ],
      praise: "WATCHING - that's the belt's whole job. And now you can see it. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "The next video picks itself - autoplay is a machine built to keep you watching, and you can see it now.",
      next: "the wild claims videos love to shout",
      emblem: "🔀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - the curtain is DOWN!",
          "Belt, countdown, hungry thumbnails... all spotted.",
          "[whispers] But the hole hides something else, hero...",
          "videos that say things that just aren't true.",
        ],
      },
    },

    /* ─────────── BEAT 2 · NOT EVERYTHING IS TRUE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Weigh It Before You Believe It",
      content:
        "Would a real book, my teacher or my grown-up say this too? That's the ONE question that weighs any claim. Videos can say ANYTHING - 'The moon is cheese!' 'This trick makes you taller overnight!' - because anyone can film anything. Saying it in a video doesn't make it true. So put every claim on the scales against a real source. Real facts balance. Wild claims fling right off.",
      bullets: [
        "Videos can say anything - anyone can film",
        "'A video said so' is NOT proof",
        "Ask: would a book, teacher or grown-up say this too?",
        "Books, teachers, grown-ups can check",
        "Real facts balance - wild claims fling off",
      ],
      bulletIcons: ["🌀", "🧠", "📏", "🏫", "✅"],
      emblem: "📏",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Next power: the truth scales!",
          "Videos can say anything at all. Anyone can film anything.",
          "[whispers] 'The moon is cheese!' 'Grow taller overnight!'",
          "Saying it loudly doesn't make it TRUE.",
          "[warmly] So we weigh it - against a real book, a teacher, a grown-up.",
          "[excited] The claims are rolling in - to the scales!",
        ],
      },
    },
    // 8 - Game: SORT (conveyorSort re-dress - the Fact Scales)
    {
      type: "conveyorSort",
      introTitle: "The Fact Scales",
      introSubtitle: "Claim cards from the rabbit hole ride the belt. Weigh each one - does a real source agree, or does it fling off the scales?",
      introIcon: "📏",
      machineLabel: "THE FACT SCALES",
      chuteWord: "PAN",
      completeTitle: "Every claim weighed!",
      completeLine: "Real facts balanced, wild ones flung off the scales.",
      categories: [
        { id: "checks", label: "CHECKS OUT", icon: "✅", tone: "safe" },
        { id: "wild", label: "WILD CLAIM", icon: "🌀", tone: "flag" },
      ],
      items: [
        { id: "octopus", text: "Octopuses have three hearts - your animal book says: YES", icon: "🧠", categoryId: "checks", explanation: "Your animal book agrees - three hearts, really! It balances on the scales." },
        { id: "cheese", text: "The moon is made of cheese - no book says this, only the video", icon: "🌀", categoryId: "wild", explanation: "No real book anywhere says cheese-moon. A video saying it isn't proof - fling!" },
        { id: "honey", text: "Honey basically never goes bad - your science book says: YES", icon: "✅", categoryId: "checks", explanation: "Checked and true - sealed honey keeps for ages and ages. It balances." },
        { id: "invisible", text: "Eat this candy and turn INVISIBLE - no book anywhere says this, only the video", icon: "🙈", categoryId: "wild", explanation: "Fun to imagine - but no source on Earth backs it. Wild claim, flung." },
        { id: "lightning", text: "Lightning is hotter than the sun's surface - your science book says: YES", icon: "⚡", categoryId: "checks", explanation: "Sounds wild but the science book AGREES - that's why we weigh instead of guess!" },
        { id: "school", text: "School is canceled FOREVER - no teacher says this, only a YouTuber", icon: "🏫", categoryId: "wild", explanation: "Who would know? Your school and your grown-ups - and they say no. Flung." },
        { id: "space", text: "Astronauts float inside the space station - every space book says: YES", icon: "🚀", categoryId: "checks", explanation: "Every space book and real NASA video agrees - it balances beautifully." },
        { id: "luck", text: "Send this to 5 friends or you'll have bad luck - no book says this, only the video", icon: "🌀", categoryId: "wild", explanation: "Luck doesn't travel by message - that's a trick to make videos spread. Fling!" },
      ],
      hints: {
        tier1: "Ask ONE question: would a real book, a teacher or a grown-up agree?",
        tier2: "CHECKS OUT = a real source says it too. WILD = only the video says it, or it's too silly to check.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Claim cards on the belt!",
          "Weigh each one: does a real source agree?",
          "Facts settle gently into the CHECKS OUT pan...",
          "[laughs] and wild ones FLING right off. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Would a real book agree? That's the whole test!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "the moon is made of cheese - I watched a video that PROVED it!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! A video saying it doesn't make it true - the scales beat the shouting. ✓",
      nudge: "Would your science book agree with him?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "'A video said so' isn't proof - weigh claims against a real source before believing.",
      next: "what to do when a video is NOT for you",
      emblem: "📏",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! The scales don't lie.",
          "Cheese-moons and canceled school - flung!",
          "[warmly] Now for a power every hero needs...",
          "the calm way OUT when a video isn't for you.",
        ],
      },
    },

    /* ─────────── BEAT 3 · NOT EVERYTHING IS FOR YOU ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Not Everything Is for You",
      content:
        "Sometimes the belt rolls in a video that is NOT for kids - too scary, too grown-up, or just plain icky. Here's the truth: that is never your fault, and leaving is STRONG, not scared. The plan has three calm steps: NOTICE ('this isn't for me'), BACK OUT (one calm tap), and TELL a grown-up if it felt icky. Heroes know where the exit is.",
      bullets: [
        "Some videos are not for kids - that's a fact",
        "Landing on one is never your fault",
        "Leaving is strong, not scared",
        "Notice it, back out, tell if it felt icky",
        "Heroes always know where the exit is",
      ],
      bulletIcons: ["🚫", "💡", "💪", "🚪", "🦸"],
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] This one's important, hero, so I'll say it gently.",
          "Sometimes the belt rolls in a video that is NOT for kids.",
          "If that happens - it is never, ever your fault.",
          "And leaving? Leaving is STRONG, not scared.",
          "[whispers] Notice it... back out... tell a grown-up if it felt icky.",
          "[excited] Let's practice finding that exit - calm and quick!",
        ],
      },
    },
    // 12 - Game: FIND (buttonHunt re-dress - the Escape Hatch)
    {
      type: "buttonHunt",
      menuTitle: "TubeTown Player",
      scenario: "A video starts that is NOT for kids. Stay calm - you know the way out.",
      introTitle: "The Escape Hatch",
      introSubtitle: "The player is full of buttons - but only two make the escape. Find BACK first, then TELL A GROWN-UP.",
      introIcon: "🚪",
      buttons: [
        { id: "next", label: "Next Video", icon: "🔀", note: "That's the belt - it goes DEEPER down the hole, not out of it." },
        { id: "back", label: "Back", icon: "🚪", targetOrder: 1, note: "One calm tap - and you're out. That's hero strength." },
        { id: "like", label: "Like", icon: "👍", note: "Liking tells the app 'more like this, please!' - the opposite of escaping." },
        { id: "comment", label: "Comment", icon: "💬", note: "Strangers live down there - and typing doesn't get you out." },
        { id: "tell", label: "Tell a Grown-Up", icon: "👪", targetOrder: 2, note: "Telling makes the icky feeling lighter - and they can fix what the belt shows next." },
        { id: "share", label: "Share", icon: "✉️", note: "Sharing sends it to a friend's screen too - now TWO of you have seen it." },
      ],
      hints: {
        tier1: "The escape has two steps: first the button that takes you OUT, then the one that gets a grown-up.",
        tier2: "BACK first - one calm tap out. THEN Tell a Grown-Up. Next, Like, Comment and Share all keep you in the hole.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Deep breath. You've got this.",
          "Six buttons - only two make the escape.",
          "BACK gets you out. TELL gets you backup.",
          "[excited] Calm and quick - find them in order!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Out first, backup second - find the BACK button!"],
      },
    },
    // 13 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the escape plan in order:",
      choices: [
        { text: "Notice: 'this isn't for me'", isCorrect: true },
        { text: "Back out - one calm tap", isCorrect: true },
        { text: "Tell a grown-up if it felt icky", isCorrect: true },
      ],
      praise: "Notice, back out, tell - the calm escape, in order. ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Not every video is for you - notice it, back out with one calm tap, and tell a grown-up if it felt icky.",
      next: "the strangers hiding under every video",
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three powers - and that one makes me proud.",
          "Notice. Back out. Tell.",
          "[whispers] Now look UNDER the video... see all those comments?",
          "Time to meet who really lives down there.",
        ],
      },
    },

    /* ─────────── BEAT 4 · COMMENTS ARE STRANGERS ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Who Lives in the Comments?",
      content:
        "Under every video there's a pond of comments - and here's the thing: the people down there are STRANGERS. Remember Week 3? Same rule, new place. Most comments just swim past. But some are FISHING - asking your name, your school, your age, or dangling free stuff and dares to make you reply. You don't reply, you don't share info. You just watch, smile and move on.",
      bullets: [
        "The comments are full of strangers",
        "Week 3 rules work here too",
        "Some comments FISH - they want a reply",
        "Your name, school and age stay yours",
        "Watch, smile, move on - no replies",
      ],
      bulletIcons: ["💬", "🕵️", "🪤", "🤫", "👍"],
      emblem: "💬",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Look under the video... see the comment pond?",
          "Everyone down there is a STRANGER.",
          "Remember week three? Same rule, new place.",
          "[nervous] Some comments are fishing - for your name, your school, a reply.",
          "[warmly] You don't bite. You watch, you smile, you move on.",
          "[excited] Grab the net - the fishers are coming!",
        ],
      },
    },
    // 16 - Game: ARCADE (spamBlaster re-dress - the Comment Pond)
    {
      type: "spamBlaster",
      introTitle: "The Comment Pond",
      introDescription: "Comments swim up from the pond! NET the fishing ones - let the friendly chatter swim past.",
      introIcon: "💬",
      headline: "NET THE FISHING COMMENTS!",
      missLabel: "NIBBLES",
      hints: {
        tier1: "Read what the comment WANTS. Asking about YOU - school, age, name, photos - is fishing.",
        tier2: "Fishing comments want a reply: questions about you, free-stuff links, dares. Nice words about the VIDEO just swim past.",
        tier2Example: "'What school do you go to?' = fishing · 'Cute puppy!' = just a viewer",
        tier3: "Quick rule: comments about the VIDEO swim by - comments about YOU get the net.",
      },
      emails: [
        { sender: "PuppyFan22", subject: "The puppy at the start is SO cute!", isPhishing: false, clue: "" },
        { sender: "CoolDude_9999", subject: "What school do you go to? Just curious!", isPhishing: true, clue: "Strangers never need your school" },
        { sender: "LegoBuilder", subject: "I built this set too - took me two days!", isPhishing: false, clue: "" },
        { sender: "FreeVBucks_Real", subject: "FREE V-BUCKS - click the link in my bio!", isPhishing: true, clue: "Free-stuff links are bait" },
        { sender: "BestFriend4Ever", subject: "How old are you? Where do you live?", isPhishing: true, clue: "Info-fishing - never answer" },
        { sender: "GrannyRose", subject: "Lovely video, this made me smile!", isPhishing: false, clue: "" },
        { sender: "DareMaster", subject: "Reply 'I'm scared' if you're too chicken to try this!", isPhishing: true, clue: "Dares just want a reply - don't bite" },
        { sender: "SpeedRunner", subject: "Great tips - the last one really helped!", isPhishing: false, clue: "" },
        { sender: "TalentScout_TV", subject: "You seem cool! Send a photo and become famous!", isPhishing: true, clue: "Never send photos to strangers" },
        { sender: "QuizWizard", subject: "Comment your FULL NAME to get your wizard name!", isPhishing: true, clue: "Your name isn't a game token" },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The pond is bubbling - comments incoming!",
          "Friendly chatter about the video? Let it swim past.",
          "[whispers] Fishing for YOU - your school, your name, a reply?",
          "[excited] NET IT! Ready... go!",
        ],
      },
    },
    // 17 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who lives in the comments?",
      choices: [
        { text: "Strangers - people you don't know", isCorrect: true },
        { text: "Mostly kids your age", isCorrect: false },
        { text: "People the video maker invited", isCorrect: false },
        { text: "Only people who liked the video", isCorrect: false },
      ],
      praise: "Strangers - so no replies, no info. Watch, smile, move on. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Comments are strangers - some fish for your info or a reply, and you never bite.",
      next: "the body signs that say 'I've been watching a while'",
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! The pond can't catch you.",
          "School questions, dare bait, free-stuff hooks...",
          "[laughs] all netted, none bitten.",
          "[warmly] Last power - and this one lives in your own body.",
        ],
      },
    },

    /* ─────────── BEAT 5 · NOTICE THE SIGNS ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Your Body Rings a Bell",
      content:
        "Here's a secret: when you've been watching a while, your BODY tells you first. Dry, blinky eyes. A jiggly leg. A stiff neck. The sky outside changed color and you didn't notice. Those aren't bad things - they're your body ringing a friendly bell: 'been here a while!' The hero move is simple: notice the bell, pause the belt, and pick what happens next YOURSELF.",
      bullets: [
        "Your body notices before you do",
        "Dry eyes and jiggly legs are the bell",
        "The sky changed? You've been a while",
        "Notice the bell - pause the belt",
        "YOU pick what happens next",
      ],
      bulletIcons: ["🔔", "👀", "🌍", "⏸️", "🎉"],
      emblem: "⏸️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, hero - and it's already inside you.",
          "When you've watched a while, your body rings a little bell.",
          "Dry blinky eyes. A jiggly leg. A stiff neck.",
          "[whispers] Outside, the sky changed color... and you missed it.",
          "That bell isn't bad news - it's your signal.",
          "[excited] Notice it, pause the belt, and YOU pick what's next!",
        ],
      },
    },
    // 20 - Game: DECIDE (chooseYourPath - the Clock Mirror)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "You said 'just one more' three videos ago. The next one is loading all by itself...",
          choices: [
            { text: "Let it play - it already started anyway", isSafe: false, consequence: "That's the belt choosing FOR you. 'One more' became five more, and the whole afternoon slid down the hole." },
            { text: "Pause it - I pick what happens next", isSafe: true, consequence: "You grabbed the controls back! Pausing the belt is the strongest button on the whole player." },
          ],
        },
        {
          setup: "You catch your reflection in the screen: dry blinky eyes, a jiggly leg... and outside the sun is shining.",
          choices: [
            { text: "Keep watching - the couch is comfy", isSafe: false, consequence: "Your body was ringing its bell - and the bell doesn't stop, it just rings louder. Dry eyes don't fix themselves on video six." },
            { text: "That's my bell - time for something else", isSafe: true, consequence: "You NOTICED! Trampoline, snack, drawing, calling a friend - your eyes and legs said thank you in about two minutes." },
          ],
        },
        {
          setup: "Dinner's ready! But the screen flashes: NEXT EPISODE IN 3... 2...",
          choices: [
            { text: "Just the START of the next one", isSafe: false, consequence: "The start became the middle, dinner went cold, and everyone waited. Episodes keep forever - hot dinners don't." },
            { text: "Screen off - dinner time", isSafe: true, consequence: "You beat the countdown! The episode will wait patiently all night. Hot dinner and family jokes won't." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Three watching moments. Three little bells.",
          "The belt will whisper 'just one more'...",
          "[whispers] but you know whose choice it really is.",
          "[excited] Notice the bell - show me the hero move!",
        ],
      },
    },
    // 21 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the 'been watching a while' sign!",
      speedMs: 5000,
      choices: [
        { text: "Dry eyes and a jiggly leg", isCorrect: true },
        { text: "Laughing at one funny video", isCorrect: false },
        { text: "Turning it off after your show", isCorrect: false },
      ],
      praise: "Spotted at full speed - your body always rings the bell first! ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Your body rings a bell when you've watched a while - notice it, pause the belt, pick what's next yourself.",
      next: "one last climb up the ladder, then the Raccoon's conveyor room",
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE rabbit-hole powers, Cyber Hero!",
          "Machine spotted, claims weighed, exit found,",
          "pond netted... and your own bell noticed.",
          "[whispers] Now - one last climb...",
          "[excited] then we unplug his conveyor for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Climb Out (W1 scanner engine, W10 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "MY CHOICE",
        negative: "THE PULL",
        positiveHint: "Tap MY CHOICE when the kid decides for themselves",
        negativeHint: "Tap THE PULL for the belt, the bait and the hole",
        tipWhenPositive: "Pausing, weighing, backing out, choosing - that's a hero holding the controls.",
        tipWhenNegative: "Autoplay marathons, wild claims, comment hooks - the Raccoon's greasy belt at work.",
        hint1: "Ask: who chose this - the KID... or the machine?",
        hint2: "MY CHOICE = pausing, checking, backing out, telling. THE PULL = the belt choosing, believing videos, replying to strangers.",
        hint2Example: "MY CHOICE: 'Screen off, dinner time'   THE PULL: 'ten videos picked themselves'",
        hint3: "Quick rule card: see the machine · weigh the claim · back out calmly · never feed the pond · notice your bell.",
        hint3Example: "Pause and pick yourself ✅    'One more' for the fifth time ❌",
      },
      items: [
        { text: "Pausing to ask 'do I even WANT the next one?'", isStrong: true, explanation: "That's the pause beating the countdown - your choice, made by you." },
        { text: "Letting autoplay pick ten videos in a row", isStrong: false, explanation: "That's the belt choosing, not you - the hole at full pull." },
        { text: "Checking a wild claim in a real book", isStrong: true, explanation: "The scales at work - real sources beat loud videos." },
        { text: "Replying to a comment that asks your school", isStrong: false, explanation: "That's a fishing comment - and answering is biting the hook." },
        { text: "Backing out of a not-for-kids video, then telling Mom", isStrong: true, explanation: "Notice, back out, tell - the calm escape, done perfectly." },
        { text: "'Just one more' for the fifth time at dinner", isStrong: false, explanation: "The bell was ringing and the belt kept winning - time to pause and climb out." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The ladder out of the hole - final climb!",
          "Watching moments are floating past.",
          "MY CHOICE for the hero moves...",
          "[warmly] THE PULL for the belt's tricks. Climb!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W10 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: unplugging the conveyor
    { type: "video", videoPlaceholder: "Week 10: The Climb Out", videoSrc: "/videos/module-10-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "belt", label: "Machine Spotter", accent: "#7df0ff", icon: "🔀", summary: "Autoplay is a machine that picks FOR you - and you can see it now." },
        { id: "facts", label: "Fact Weigher", accent: "#c084fc", icon: "📏", summary: "'A video said so' isn't proof - you weigh claims against real sources." },
        { id: "escape", label: "Calm Escaper", accent: "#ffd158", icon: "🚪", summary: "Notice, back out, tell - one calm tap and you're out." },
        { id: "pond", label: "Pond Watcher", accent: "#ff5fb3", icon: "💬", summary: "Comments are strangers - fishing comments get the net, never a reply." },
        { id: "bell", label: "Bell Noticer", accent: "#7eff97", icon: "⏸️", summary: "Dry eyes, jiggly leg - you hear your body's bell and pick what's next." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The machine spotted, wild claims flung,",
          "the exit found, the pond netted... and your bell heard.",
          "[laughs] His conveyor is unplugged and squeaking.",
          "[excited] Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "curtain-puller", name: "Curtain Puller", icon: "🌀", description: "Sees the machine behind the next-video belt." },
        { id: "fact-weigher", name: "Fact Weigher", icon: "📏", description: "Weighs wild claims against real books." },
        { id: "calm-escaper", name: "Calm Escaper", icon: "🚪", description: "One calm tap out - then tells a grown-up." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  bossShowdown: {
    machine: {
      name: "THE WHIRLPOOL ROOM",
      tagline: "A conveyor of next-next-next that never lets you choose",
      art: {
        intact: "/game/bosses/w10-whirlpool-intact.png",
        damaged: "/game/bosses/w10-whirlpool-damaged.png",
        defeated: "/game/bosses/w10-whirlpool-defeated.png",
      },
      arena: "/game/backgrounds/w10-arena-conveyor.png",
      accent: "#4fd8c4",
      glow: "rgba(79,216,196,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w10/adam-rescue-idle.png",
        attack: "/game/characters/w10/adam-rescue-attack.png",
        celebrate: "/game/characters/w10/adam-rescue-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w10/layla-rescue-idle.png",
        attack: "/game/characters/w10/layla-rescue-attack.png",
        celebrate: "/game/characters/w10/layla-rescue-celebrate.png",
      },
    },
    phases: [
      // P1 · AUTOPLAY BELT → SHIELD-HOLD: hold the giant PAUSE against the pull.
      {
        kind: "shieldHold",
        attack: 0,
        // Coach copy must NOT contain the holdLabel phrase - the QA
        // driver's text-match would grab the banner instead of the button.
        coach: "The belt never asks, it just rolls. Press and KEEP pressing!",
        holdLabel: "HOLD THE PAUSE",
        holdIcon: "⏸️",
        holdSecs: 6,
        barrage: [
          "Three... two... the next one's already loading!",
          "Why stop now? You're on a ROLL!",
          "Choosing is boring, let the belt pick!",
          "Just five more seconds, then five more, then five more...",
          "Blink and you'll miss it! Keep watching!",
        ],
        burnoutLine: "The belt shudders, whines, and grinds to a stop. Quiet. The screen waits for YOU now, and you decide if there's even a next one at all.",
      },
      // P2 · WILD CLAIM → DEFLECT-SORT: zap the shouty fakes, pass the checkable.
      {
        kind: "deflectSort",
        attack: 1,
        coach: "Would a book or a teacher agree? Weigh it!",
        actLabel: "ZAP THE WILD CLAIM!",
        actIcon: "⚡",
        passLabel: "CHECKABLE - LET IT PASS",
        items: [
          { id: "flypop", label: "DRINK FIZZY POP AND YOU'LL FLY - GOVERNMENT HIDING IT!", icon: "🌀", act: true, note: "'Government hiding it!' is a classic wild-claim costume: no book, no teacher, no proof. Zap it!" },
          { id: "xray", label: "THIS ONE WEIRD TRICK GIVES YOU X-RAY EYES!", icon: "⚡", act: true, note: "No trick gives you x-ray eyes, a shouty surprise with zero real sources. Zap it!" },
          { id: "explode", label: "SHARE IN 10 SECONDS OR YOUR PHONE EXPLODES!", icon: "💬", act: true, note: "'Share or something bad happens' is a panic trick to make you spread it, not proof. Zap it!" },
          { id: "rainbows", label: "How rainbows are made, explained by a science teacher", icon: "🔍", act: false, note: "A real teacher could check every word, let it roll on." },
          { id: "bean", label: "Growing a bean plant from a seed, day by day", icon: "🎁", act: false, note: "You could grow that bean yourself and SEE, checkable. Let it pass." },
          { id: "lighthouse", label: "A tour of a real lighthouse with the keeper", icon: "🎮", act: false, note: "Real place, real keeper, nothing shouty. Let it pass." },
        ],
      },
      // P3 · COMMENT HOOK → COUNTER-CARD.
      {
        kind: "counterCard",
        attack: 2,
        coach: "What's the hero move? Tap the card!",
        situation: "A comment under your favorite video says: 'You'd be PERFECT for a kids TV show! Message me your address and I'll post you a prize!'",
        situationIcon: "💬",
        cards: [
          { id: "scroll", label: "SCROLL PAST - a stranger in the comments never needs my address", icon: "🛡️", isRight: true, note: "" },
          { id: "reply", label: "Reply with my address, a prize sounds amazing!", icon: "🌀", isRight: false, note: "'You'd be perfect!' plus a prize is exactly how fishing feels. Your address is never a stranger's to have." },
          { id: "prize", label: "Ask what the prize is first", icon: "🔍", isRight: false, note: "Any reply tells a stranger you're listening, and 'what's the prize?' is the first bite. Leave the hook and scroll on." },
        ],
      },
    ],
    weakPoints: [
      { question: "A too-grown-up video the belt rolled in makes you feel like you did something wrong. What's true?", answers: ["It's never my fault it appeared, I back out and tell a grown-up", "It's my fault for clicking", "I should hide it and never mention it", "I have to finish it now"], correctIndex: 0, explanation: "The belt rolled it in, not you. Backing out and telling is the strong move, and leaving is strong, not scared." },
      { question: "A video says 'eating carrots lets you see in the DARK like a cat!' What's the smart first move?", answers: ["Check it against a real book or a grown-up before believing", "Believe it, it was in a video", "Eat lots of carrots tonight", "Share it so friends can try"], correctIndex: 0, explanation: "A video saying it isn't proof, weigh every wild claim against a real source." },
      { question: "You've been watching for ages: your eyes feel scratchy, you're slumped right down, and you can't remember what the last video was even about. What's your body telling you?", answers: ["'Been watching a while, time to pause and do something else'", "'Watch faster'", "'One more won't hurt'", "Nothing at all"], correctIndex: 0, explanation: "That's your body's bell. Notice it, pause the belt, and pick what's next yourself." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE BACK BUTTON",
      chargeIcon: "🚀",
      chargeSecs: 5,
      milestones: ["The rocket hums…", "The whirlpool is slowing…", "HATCH OPEN! LET GO!"],
      payoffTitle: "UP AND OUT!",
      payoffLine: "The BACK button fires you through the hatch into daylight. The belt only wins if you forget you can leave - and you never will.",
    },
    villain: {
      arrival: "Next up! Next up! NEXT UP! You never have to choose again!",
      phases: [
        "The belt goes one way, kid! Down!",
        "It's TRUE! A video said so, and videos never fib!",
        "The comments are lovely this time of night!",
      ],
      escape: "NOBODY finds the hatch! Who showed you the hatch?!",
    },
    voiceSlug: "w10",
  },
  badgeArt: "/cyberheroes/badges/week-10-pull-noticer.png",

  // Week-lane attack theatre: the video-hole tricks only (screen-time
  // balance = W13; stranger chat = W3; app fakes = W9).
  bossAttacks: [
    { name: "AUTOPLAY BELT", icon: "🔀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "You choose what's next", emblemColor: 0x7df0ff },
    { name: "WILD CLAIM",    icon: "🌀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Weigh it on the scales", emblemColor: 0xc084fc },
    { name: "COMMENT HOOK",  icon: "💬", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Strangers live there",   emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W10 COMBAT - unplug the conveyor
  // room - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "When a video ends and the next one starts by itself, who picked it?", answers: ["The autoplay machine", "You did", "Your best friend", "The video maker picked it"], correctIndex: 0, explanation: "That's the belt - a machine built to keep you watching." },
      { question: "A video says the moon is made of cheese. What do you do?", answers: ["Weigh it against a real source", "Believe it - videos are proof", "Share it with 5 friends", "Watch it twice to be sure"], correctIndex: 0, explanation: "'A video said so' isn't proof - books, teachers and grown-ups can check." },
      { question: "Who lives in the comments under a video?", answers: ["Strangers", "Your classmates", "Your family", "Other kids who love the video"], correctIndex: 0, explanation: "Week 3 rules apply - no replies, no info, just watch and move on." },
    ],
    medium: [
      { question: "A not-for-kids video starts. What's the calm escape?", answers: ["Notice it, back out, tell a grown-up if it felt icky", "Watch it to the end", "Comment 'this is scary'", "Share it to ask friends"], correctIndex: 0, explanation: "One calm tap out, then backup - leaving is strong, not scared." },
      { question: "A comment says 'What school do you go to? Just curious!' What is it?", answers: ["A fishing comment - never answer", "A friendly question", "A school survey", "Fine to answer if they seem nice"], correctIndex: 0, explanation: "Questions about YOU are fishing - your school stays yours." },
      { question: "Dry eyes, jiggly leg, the sky's gone dark outside. What's your body saying?", answers: ["'Been watching a while - time to pick something else'", "'One more video!'", "'Just blink and keep watching'", "Nothing at all"], correctIndex: 0, explanation: "That's the bell - notice it, pause the belt, choose what's next yourself." },
    ],
    hard: [
      { question: "Why does the countdown only give you 5 seconds before the next video?", answers: ["So you don't have time to ask 'do I want this?'", "To save electricity", "To help you find good videos faster", "It's a rule for grown-ups"], correctIndex: 0, explanation: "The rush is designed - no thinking time means the belt keeps winning." },
      { question: "Why do wild claims spread so fast in videos?", answers: ["Shouty surprises get clicks - true or not", "Because they're always true", "Videos check facts first", "Because wild claims are usually half-true"], correctIndex: 0, explanation: "The machine rewards exciting, not true - that's why heroes weigh before believing." },
      { question: "Why is 'reply if you're too scared!' a trap even though it asks for no info?", answers: ["Any reply feeds the stranger and pulls you into their game", "Replies cost money", "It isn't a trap", "It's only a trap if you type your real name"], correctIndex: 0, explanation: "Dares fish for a REPLY - and any bite tells a stranger you're listening." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 10 - the rabbit hole!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "That belt never stops..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the climb-out plan, hero." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Who picked that next video? Not you..." }, layla: null }, // learn: belt
    4: { adam: { mood: "excited", message: "Pull that curtain!" }, layla: null }, // game: reveal
    5: { adam: null, layla: { mood: "thumbsup", message: "Finish the belt's rule!" } }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "Machine spotted - four powers to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Weigh it before you believe it." } }, // learn: facts
    8: { adam: null, layla: { mood: "excited", message: "To the scales!" } }, // game: conveyorSort
    9: { adam: { mood: "worried", message: "Cheese moon? Really? Catch him!" }, layla: null }, // prove: lie
    10: { adam: { mood: "excited", message: "The scales don't lie!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Leaving is strong, not scared." }, layla: null }, // learn: escape
    12: { adam: { mood: "curious", message: "Calm and quick - find the exit!" }, layla: null }, // game: buttonHunt
    13: { adam: null, layla: { mood: "thumbsup", message: "Escape plan - in order!" } }, // prove: order
    14: { adam: null, layla: { mood: "thumbsup", message: "Exit found. So proud of you." } }, // recap 3
    15: { adam: null, layla: { mood: "curious", message: "Who's down in that pond?" } }, // learn: comments
    16: { adam: null, layla: { mood: "excited", message: "Net the fishers!" } }, // game: spamBlaster
    17: { adam: { mood: "thumbsup", message: "Who lives down there?" }, layla: null }, // prove: recall
    18: { adam: { mood: "excited", message: "The pond can't catch you!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Hear that little bell?" }, layla: null }, // learn: signs
    20: { adam: { mood: "curious", message: "Notice the bell - then choose!" }, layla: null }, // game: decide
    21: { adam: null, layla: { mood: "thumbsup", message: "Quick - spot the sign!" } }, // prove: speed
    22: { adam: null, layla: { mood: "excited", message: "All five powers - climb time!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "My choice or the pull - climb out!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His conveyor room - unplug it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the climb out!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - up and out!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Pull Noticer badge earned!" }, layla: null }, // completion
  },
};

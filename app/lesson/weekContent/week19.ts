import type { WeekContent } from "./types";

/**
 * Week 19 - Protecting Family: Family Firewall
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 EXPERT   you're the expert now (role-flip)  | chooseYourPath | finish
 *     2 TELLS    help grown-ups spot scams          | clueBoard      | lie
 *     3 QUILT    make family rules together         | teamPoster     | recall
 *     4 ROUNDS   check the family's settings        | settingsSwitch | speed
 *     5 FREEZE   speak up before the trap snaps     | senderLineup   | order
 *   Consolidation (cyberScanner, Family Photo skin) -> boss
 *   (placeholder quiz boss - the bespoke W19 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: this is the ROLE-FLIP week - the kid teaches - so
 * every game is a re-dress of a power the child already owns, pointed
 * outward at the family. clueBoard's fifth outing 2 weeks after W17
 * (the plan's side-by-side spot-the-scam: Gran's text pinned centre,
 * the real bank's habits quoted in each evidence card); teamPoster
 * takes its W11-EARMARKED quilt re-dress; settingsSwitch closes its
 * W6-earmarked run (W14/W17/W19) as the evening House Rounds;
 * senderLineup's fourth outing 4 weeks after W15 re-dressed as Freeze
 * the Moment (new correctToast/stampLabel/wrongTitle props keep the
 * IMPOSTER copy out of Gran's living room); chooseYourPath carries the
 * role-flip beat. Lane-clean: teaching-the-family is new ground - scam
 * anatomy was W4's lane (applied here BY the child), settings W14/W17's
 * (their own devices - these are the family's), rules W13's (their own
 * day - this is the whole house). In-week flavour: the Expert in the
 * House. Palette: hearth warm + expert-badge gold. Warmth note: experts
 * teach, they never tease - every speak-up is kind, and grown-ups are
 * never mocked for nearly slipping.
 */
export const WEEK_19: WeekContent = {
  weekNumber: 19,
  title: "Protecting Family: Family Firewall",
  topic: "protecting-family",
  badgeName: "Family Firewall",
  badgeIcon: "🏠",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 19: THE FAMILY FIREWALL", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the expert in the house
    { type: "video", videoPlaceholder: "Week 19: The Expert in the House", videoSrc: "/videos/module-19-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-19.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has given up on YOU - eighteen weeks of walls, locks and popped balloons taught him that lesson. So he's turned his tricks on your FAMILY: a gift-card prize text for Grandma, a $1 package scam for Dad, a free-coin machine for your little brother. Same tricks, bigger font. But he's forgotten the most important thing in the whole house... it has an EXPERT now. This week the roles flip: you teach, you check, you speak up - and together you raise the Family Firewall.",
      photoCaption: "Wk 19 - The Expert in the House",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "You're the expert now - teach kindly",
        "Give every device its evening rounds",
        "Speak up before the trap snaps",
      ],
    },

    /* ─────────── BEAT 1 · THE EXPERT ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "You're the Expert Now",
      content:
        "Stop and count: eighteen weeks of powers. Passwords, disguises, scam tells, painted doors, sticky balloons - you know things most GROWN-UPS in your house don't know. So this week the roles flip: when someone in your family is about to slip, the expert speaks up. One rule makes it work: experts TEACH, they never tease. No 'silly Grandma!', no grabbing the phone - just 'wait - can I show you something?', said kindly, right then. A firewall is a special wall that keeps trouble out of a house. This week, your family builds one - and YOU'RE the builder. That kind little sentence is the first brick.",
      bullets: [
        "Eighteen weeks of powers - count them",
        "You know tells the grown-ups don't",
        "The roles flip: now you teach",
        "Experts teach, they never tease",
        "'Wait - can I show you something?'",
      ],
      bulletIcons: ["🥇", "🧠", "🏠", "💬", "✋"],
      emblem: "🥇",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Week nineteen - and everything changes!",
          "Count your powers: eighteen whole weeks of them.",
          "[warmly] You know things the grown-ups don't.",
          "So the roles flip. Now YOU teach.",
          "One rule: teach kindly. Never tease.",
          "[excited] Three family moments are coming - show me the expert!",
        ],
      },
    },
    // 4 - Game: DECIDE (chooseYourPath - the Expert Call-Out)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Grandma reads a text out loud: 'Ooh! I've won a $500 gift card! I just tap here to claim it...' Her finger is hovering...",
          choices: [
            {
              text: "'Grandma, wait - can I show you something?'",
              isSafe: true,
              consequence: "You walk her through the tells - nobody wins prizes they never entered, and real prizes never rush you. Grandma deletes it, calls you 'my little expert', and tells the WHOLE family at dinner. The firewall grows.",
            },
            {
              text: "Stay quiet - grown-ups sort their own phones",
              isSafe: false,
              consequence: "Grandma taps. The phone fills with pop-ups and it takes the whole weekend to untangle - and the worst bit is you KNEW. Eighteen weeks of powers only protect people when you share them.",
            },
          ],
        },
        {
          setup: "Dad's setting up his new banking app. 'Password... dad1234. Easy to remember!' he says, typing it in...",
          choices: [
            {
              text: "Suggest three random words - the Week 1 trick",
              isSafe: true,
              consequence: "'BananaRocketCloud?!' Dad laughs - then realizes he can actually remember it AND nobody could guess it. High-five. The expert's first grown-up graduate.",
            },
            {
              text: "Say nothing - it's his bank, not yours",
              isSafe: false,
              consequence: "dad1234 is the kind of password the Cracking Machine ate for breakfast in Week 1. His name plus counting - a guesser's warm-up lap, guarding his BANK. Experts speak up, kindly, right then.",
            },
          ],
        },
        {
          setup: "Your little brother leans into his game's microphone: 'My name is Sami Malik and I go to Sunnyside School and-'",
          choices: [
            {
              text: "Gently teach him the disguise rule - like a coach, not a boss",
              isSafe: true,
              consequence: "You show him how to build a hero name instead - 'RobotRex99!' He loves it, the lobby learns nothing, and he starts calling you Coach. Teaching beats telling off, every time.",
            },
            {
              text: "Yell 'STOP! You're doing it WRONG!'",
              isSafe: false,
              consequence: "He goes quiet and won't ask you anything next time - and next time matters more. The teach was right; the tease broke it. Kind is what keeps the firewall standing.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three family moments. Three chances to speak up.",
          "Remember the expert's rule:",
          "teach kindly - never tease.",
          "[excited] Show me the call-out!",
        ],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Now I'm the ___.",
      choices: [
        { text: "expert", isCorrect: true },
        { text: "boss", isCorrect: false },
        { text: "quietest", isCorrect: false },
        { text: "littlest", isCorrect: false },
      ],
      praise: "The EXPERT - eighteen weeks of powers, and now you share them. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Eighteen weeks of powers means the roles flip: you're the house expert now - and experts teach kindly, they never tease.",
      next: "the scam text on Grandma's phone - and the four tells you'll show her",
      emblem: "🥇",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power one - the expert badge is yours!",
          "Teach kindly. Never tease.",
          "[whispers] And your first pupil is waiting in the kitchen...",
          "Grandma's phone just buzzed. Come on.",
        ],
      },
    },

    /* ─────────── BEAT 2 · GRAN'S PHONE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Same Tricks, Bigger Font",
      content:
        "Here's a secret the Raccoon counts on: grown-ups get MORE scam texts than kids do. Fake banks, fake packages, fake prizes - the exact tricks you learned in Week 4, just aimed at Grandma in bigger letters. And the tells never change: a stranger's number wearing a bank's name, a panic clock racing you, a link with no plaque, and sloppy spelling a real bank would never send. You know all four. Time to sit at the kitchen table and show Grandma - kindly, one tell at a time.",
      bullets: [
        "Grown-ups get scam texts too - lots",
        "Same tricks you beat in Week 4",
        "Wrong number wearing a bank's name",
        "Panic clocks and no-plaque links",
        "Show the tells - one at a time",
      ],
      bulletIcons: ["✉️", "🪤", "🆔", "🔔", "🔍"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Secret time: grown-ups get MORE scam texts than kids.",
          "Fake banks. Fake packages. Fake prizes.",
          "The same tricks you beat in Week four -",
          "[warmly] just wearing bigger letters for Grandma.",
          "And you still know every tell.",
          "[excited] Her phone's on the kitchen table - let's check it together!",
        ],
      },
    },
    // 8 - Game: INSPECT (clueBoard re-dress - the Kitchen-Table Check)
    {
      type: "clueBoard",
      introTitle: "The Kitchen-Table Check",
      introSubtitle: "A 'bank' text just landed on Grandma's phone - and she's worried. Check it line by line and gather the tells to show her!",
      introIcon: "🔍",
      photoTitle: "Grandma's phone: 'FASTBANK ALERT!! Your acount is BLOCKED. Tap quick-fix-bank.win in 10 minutes or lose EVERYTHING. - from +44 7999 000111'",
      photoIcon: "✉️",
      clues: [
        {
          id: "sender",
          icon: "🆔",
          label: "From: +44 7999 000111",
          evidence: "TELL ONE: Grandma's real bank always texts from the same short number - this is a strange long faraway number wearing a bank's name. Show her the old bank texts right above it: they don't match. And remember - tricksters can fake the number too, so check the OTHER tells as well.",
        },
        {
          id: "clock",
          icon: "🔔",
          label: "'in 10 minutes or lose EVERYTHING'",
          evidence: "TELL TWO: the panic clock - Week 4's rush trick in a cardigan. Real banks never race you; tricksters HAVE to, because a calm minute is all it takes to spot them.",
        },
        {
          id: "link",
          icon: "🔗",
          label: "'Tap quick-fix-bank.win'",
          evidence: "TELL THREE: a door with no plaque (Week 16!). Grandma's real bank never sends tap-this links - it says 'log in the way you always do'. Strange door, no walk-through.",
        },
        {
          id: "spelling",
          icon: "🔠",
          label: "'Your acount'",
          evidence: "TELL FOUR: the loose thread. Real banks check their spelling; tricksters rush theirs. 'Acount' with one C is the loose thread that unravels the whole disguise.",
        },
      ],
      verdict: {
        prompt: "All four tells gathered. What do you show Grandma?",
        options: [
          {
            text: "It's a trick - walk her through the tells, then delete it together",
            isCorrect: true,
            explanation: "Exactly - she sees all four tells, SHE presses delete, and next time she'll spot it herself. That's teaching, not rescuing.",
          },
          {
            text: "Tap the link quickly before her account gets blocked",
            isCorrect: false,
            explanation: "The panic clock nearly got you too! Her account was never blocked - the only trap here IS that link.",
          },
          {
            text: "Take her phone away - banking's too dangerous for Grandma",
            isCorrect: false,
            explanation: "Too far - Grandma's the boss of her own phone. Experts hand people POWERS, not punishments.",
          },
        ],
      },
      stampText: "SCAM SPOTTED!",
      completeTitle: "Four tells, shown kindly!",
      completeLine: "Same tricks, bigger font - and now Grandma knows every tell, because YOU taught her.",
      hints: {
        tier1: "Compare it with the real bank's texts - what's different?",
        tier2: "Check WHO sent it, the panic clock, the strange link, and the spelling.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] There it is, on Grandma's phone.",
          "Looks scary. Checks easy.",
          "Tap every line and gather the tells -",
          "[warmly] then we show Grandma, one at a time.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Start with WHO sent it - tap the sender line!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "Grown-ups can't be tricked - scams only work on little kids! Your Grandma is TOTALLY safe without you, trust me!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted - grown-ups get MORE scam texts than kids. That's exactly why the house needs its expert. ✓",
      nudge: "Who was that fake bank text aimed at - you, or Grandma?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Grown-ups get scam texts too - same tricks, bigger font - and you can show them all four tells, kindly.",
      next: "the quilt of rules the WHOLE family sews together",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power two - Grandma spots scams now!",
          "Taught, not told off.",
          "[warmly] But one lesson protects one person...",
          "a family RULE protects everyone. Fetch the quilt.",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE FAMILY-RULES QUILT ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Rules You Sew Together",
      content:
        "Here's the difference between a rule and a TOGETHER rule. A rule one person sets - 'no screens, because I said so' - gets grumbled at and wriggled around. A together rule gets SEWN: everyone adds their patch, everyone signs it, and it covers everyone - even Dad. Screens sleep in the kitchen (all of them). Ask-first on downloads (any age). Phones nap in the basket at dinner. And the golden patch that holds the whole quilt together: tell, don't hide - and nobody gets shouted at for telling.",
      bullets: [
        "'Because I said so' gets wriggled around",
        "Together rules get SEWN by everyone",
        "They cover grown-ups too - even Dad",
        "Screens sleep downstairs, all of them",
        "Golden patch: tell, don't hide",
      ],
      bulletIcons: ["👑", "👪", "🏠", "⏸️", "💬"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[curious] What's warmer than a rule?",
          "A quilt of rules - sewn by EVERYONE.",
          "Everyone adds a patch. Everyone signs.",
          "[warmly] And it covers everyone. Yes, even Dad's phone.",
          "The golden patch holds it all: tell, don't hide.",
          "[excited] The patches are on the table - let's sew!",
        ],
      },
    },
    // 12 - Game: BUILD (teamPoster re-dress - the Family-Rules Quilt)
    {
      type: "teamPoster",
      introTitle: "The Family-Rules Quilt",
      introSubtitle: "The whole family's round the table with patches to sew. Pick the rules EVERYONE would sign - and watch out for patches that would unravel the quilt!",
      introIcon: "👪",
      posterTitle: "THE FAMILY RULES QUILT",
      trayPrompt: "Tap the patches every member would sign",
      placedToast: "PATCH SEWN!",
      wrongTitle: "That patch would unravel the quilt",
      completeTitle: "The quilt is complete!",
      completeLine: "Rules everyone sews beat rules one person sets - and this one covers the whole family.",
      tiles: [
        {
          id: "moon",
          label: "SCREENS SLEEP IN THE KITCHEN",
          detail: "everyone's - even Dad's",
          icon: "🏠",
          isTeam: true,
          note: "The Week 13 garage rule, family-sized: every charger parks downstairs and every bedroom sleeps quiet.",
        },
        {
          id: "bossy",
          label: "RULES ARE ONLY FOR KIDS",
          detail: "grown-ups do whatever they like",
          icon: "👑",
          isTeam: false,
          note: "A firewall with a grown-up-sized hole isn't a firewall - Dad's phone sleeps in the kitchen too. That's what makes it a TOGETHER rule.",
        },
        {
          id: "ask",
          label: "ASK-FIRST ON DOWNLOADS AND BUYS",
          detail: "any age - a second pair of eyes",
          icon: "✅",
          isTeam: true,
          note: "Kids ask grown-ups... and grown-ups can ask YOU. A second pair of eyes catches what one pair misses.",
        },
        {
          id: "never",
          label: "NO SCREENS EVER AGAIN",
          detail: "not even the Friday film",
          icon: "🚫",
          isTeam: false,
          note: "Too far! Week 13 taught balance: SOME screen, not none. A quilt keeps the family warm - it doesn't lock anyone out.",
        },
        {
          id: "dinner",
          label: "THE DINNER BASKET",
          detail: "phones nap in the basket while we eat",
          icon: "📱",
          isTeam: true,
          note: "Half an hour where the only pings are forks - and everyone's phone naps together, so nobody's left out.",
        },
        {
          id: "secret",
          label: "KEEP PROBLEMS SECRET",
          detail: "so nobody worries",
          icon: "🤐",
          isTeam: false,
          note: "Secrets are how tricks GROW. The golden patch says the exact opposite: tell, don't hide.",
        },
        {
          id: "tell",
          label: "TELL, DON'T HIDE",
          detail: "and nobody gets shouted at for telling",
          icon: "💬",
          isTeam: true,
          special: true,
          note: "The golden patch that holds the whole quilt together: the firewall only works if telling is ALWAYS safe.",
        },
      ],
      hints: {
        tier1: "Ask each patch: would EVERY member of the family happily sign it?",
        tier2: "Together rules cover everyone kindly. Bossy rules, never-rules and secret-rules all unravel the quilt.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Patches on the table!",
          "One question for each:",
          "would EVERYONE sign it - Grandma to little brother?",
          "[warmly] Sew the together rules. Leave the unravellers. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read each patch - if the whole family would sign it, sew it on!"],
      },
    },
    // 13 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one is a TOGETHER rule?",
      choices: [
        { text: "Screens sleep in the kitchen - even Dad's", isCorrect: true },
        { text: "Rules are only for kids", isCorrect: false },
        { text: "No screens ever again", isCorrect: false },
        { text: "Keep problems secret", isCorrect: false },
      ],
      praise: "Even Dad's - a rule the whole family signs is a rule the whole family keeps. ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Rules everyone sews beat rules one person sets - the quilt covers grown-ups too, and its golden patch is tell-don't-hide.",
      next: "the expert's evening rounds - one device per family member",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power three - the quilt is sewn!",
          "Every patch signed, even Dad's.",
          "[whispers] Now grab your flashlight, expert...",
          "it's time for the evening rounds.",
        ],
      },
    },

    /* ─────────── BEAT 4 · THE HOUSE ROUNDS ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "The Evening Rounds",
      content:
        "Every castle guard walks the walls at night, checking each window. That's the expert's evening rounds: one device per family member, one check each. Grandma's phone - who can video-call her? Little brother's tablet - can he download without asking? Mom's phone - are her photos carrying a map pin? Some windows you'll find already locked (Dad's laptop updates itself; the family tablet still wears last week's forged code). The open ones? Show that person, flip the switch TOGETHER - and the wall is whole.",
      bullets: [
        "Guards walk the walls each night",
        "One device per family member",
        "Who can video-call Grandma?",
        "Can little hands download alone?",
        "Some windows are already locked",
      ],
      bulletIcons: ["🏠", "👪", "👀", "🎁", "🗝️"],
      emblem: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[curious] Every castle guard walks the walls at night.",
          "Checking window after window.",
          "That's your evening rounds, expert:",
          "one device per family member, one check each.",
          "[whispers] Some windows are already locked. Some... aren't.",
          "[excited] Flashlight on - let's do the rounds!",
        ],
      },
    },
    // 16 - Game: FIND (settingsSwitch re-dress - the House Rounds)
    {
      type: "settingsSwitch",
      panelTitle: "THE FAMILY'S DEVICES - EVENING ROUNDS",
      introTitle: "The House Rounds",
      introSubtitle: "One device per family member, all on the panel. Find every switch a trickster could slip through tonight - then show that person and flip it TOGETHER!",
      introIcon: "⚙️",
      rows: [
        {
          id: "gran",
          label: "Grandma's phone - video calls",
          value: "ANYONE CAN CALL",
          safeValue: "CONTACTS ONLY",
          icon: "👀",
          isRisky: true,
          note: "Video-call scammers love an open line to Grandma - show her the switch and flip it TOGETHER: contacts-only means only real faces can ring through.",
        },
        {
          id: "dad",
          label: "Dad's laptop - updates",
          value: "INSTALLS ITSELF AT NIGHT",
          icon: "⚙️",
          isRisky: false,
          note: "Already right! Updates are armor patches - Dad's laptop dresses itself while he snores.",
        },
        {
          id: "brother",
          label: "Little brother's tablet - downloads",
          value: "NO ASK NEEDED",
          safeValue: "GROWN-UP SAYS YES FIRST",
          icon: "🎁",
          isRisky: true,
          note: "He's six - and Week 9's rule says downloads happen WITH a grown-up. One switch and every download asks first.",
        },
        {
          id: "mum",
          label: "Mom's phone - location on photos",
          value: "ON",
          safeValue: "OFF",
          icon: "📍",
          isRisky: true,
          note: "Every dinner photo was carrying a map pin to your kitchen - show Mom and flip it TOGETHER: the Week 12 fix, family-sized.",
        },
        {
          id: "tablet",
          label: "The family tablet - lock code",
          value: "ON - forged at the anvil",
          icon: "🗝️",
          isRisky: false,
          note: "Last week's forge is holding strong - the front door still clicks shut behind everyone.",
        },
      ],
      hints: {
        tier1: "Ask each row: could a trickster slip through this window tonight?",
        tier2: "ANYONE-can-call, NO-ASK downloads and location ON are the open windows. Updates and the lock code are already safe.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] The rounds begin - five windows on the wall.",
          "Grandma's, Dad's, your brother's, Mom's, the tablet's.",
          "Find the open ones...",
          "[excited] and flip them shut - together. Go, expert!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Check each row - if a trickster could slip through it, tap it, then show that family member and flip it together!"],
      },
    },
    // 17 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the window that's still wide open!",
      speedMs: 5000,
      choices: [
        { text: "Grandma's calls: ANYONE", isCorrect: true },
        { text: "Tablet code: ON", isCorrect: false },
        { text: "Updates: AUTOMATIC", isCorrect: false },
      ],
      praise: "Spotted at guard speed - contacts-only, and Grandma's window clicks shut. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "The expert's evening rounds: one device per family member, one check each - and every open window gets flipped shut TOGETHER.",
      next: "the hardest power of all - speaking up at the exact right moment",
      emblem: "⚙️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power four - the walls are checked!",
          "Every window, every family member.",
          "[warmly] One power left, and it's the bravest...",
          "catching the trap at the exact moment it opens.",
        ],
      },
    },

    /* ─────────── BEAT 5 · FREEZE THE MOMENT ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Freeze the Moment",
      content:
        "Rules and settings guard the house all day - but some traps need a HERO in the room. The prize text arriving while Grandma's on the sofa. Dad reading a '$1 re-delivery' package message at the door. A free-coin machine asking your brother for Mom's card RIGHT NOW. In those moments the expert's power is noticing - and speaking up at the exact second it matters: 'Wait! Freeze!' Then the three steps you know: notice it, speak up kindly, fix it together.",
      bullets: [
        "Some traps need a hero in the room",
        "Watch for the about-to-tap moment",
        "'Wait - freeze!' said kindly",
        "Notice → speak up → fix together",
        "One frozen moment saves the day",
      ],
      bulletIcons: ["👀", "⚡", "✋", "👪", "🥇"],
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Last power - and it's the bravest.",
          "Some traps need a hero IN the room.",
          "A prize text. A package trick. A free-coin machine.",
          "[whispers] The power is noticing... at the exact right second.",
          "Wait - FREEZE! Then fix it together.",
          "[excited] Three family scenes - find each trap before it snaps!",
        ],
      },
    },
    // 20 - Game: SELECT (senderLineup re-dress - Freeze the Moment)
    {
      type: "senderLineup",
      introTitle: "Freeze the Moment",
      introSubtitle: "Three family scenes are playing. Somewhere in each one, a trick is about to snap shut - tap that exact moment to freeze it and speak up!",
      introIcon: "✋",
      correctToast: "MOMENT FROZEN!",
      stampLabel: "FROZEN! ✋",
      wrongTitle: "{name} is doing just fine",
      completeTitle: "Three moments frozen!",
      completeLine: "Notice, speak up - kindly - and fix it together. That's the whole firewall.",
      rounds: [
        {
          id: "friday",
          prompt: "Friday evening at home. One of these moments needs freezing - tap it!",
          senders: [
            {
              id: "dad-news",
              name: "Dad in the armchair",
              detail: "reading tomorrow's weather on the news app",
              icon: "👪",
              isFake: false,
              note: "Just the weather - no money, no clicks, no freeze needed.",
            },
            {
              id: "gran-voucher",
              name: "Grandma on the sofa",
              detail: "a text: 'You WON a $500 gift card! Tap to claim!' - finger hovering",
              icon: "👪",
              isFake: true,
              note: "FREEZE! Nobody wins prizes they never entered - that's Week 4's oldest bait, aimed straight at Grandma.",
            },
            {
              id: "bro-cartoons",
              name: "Little brother on the rug",
              detail: "watching his robot cartoon, volume way too loud",
              icon: "👪",
              isFake: false,
              note: "Loud? Yes. Dangerous? No. Save the freeze.",
            },
            {
              id: "mum-recipe",
              name: "Mom at the counter",
              detail: "following a soup recipe on the family tablet",
              icon: "👪",
              isFake: false,
              note: "Soup's the only thing getting tricked tonight - no freeze here.",
            },
          ],
        },
        {
          id: "saturday",
          prompt: "Saturday morning. Another trap is opening somewhere - freeze it!",
          senders: [
            {
              id: "gran-knitting",
              name: "Grandma in her chair",
              detail: "knitting, phone face-down and quiet",
              icon: "👪",
              isFake: false,
              note: "A face-down phone can't trick anyone - knit on, Grandma.",
            },
            {
              id: "sis-drawing",
              name: "Your sister at the table",
              detail: "drawing dragons on paper - actual paper",
              icon: "👪",
              isFake: false,
              note: "The Raccoon has no power over crayons. No freeze.",
            },
            {
              id: "dad-parcel",
              name: "Dad by the front door",
              detail: "a text: 'missed package! pay $1 re-delivery at package-fix.win' - card in hand",
              icon: "👪",
              isFake: true,
              note: "FREEZE! The $1 package trick - a tiny ask to steal a whole card. Show Dad the no-plaque door rule.",
            },
            {
              id: "bro-garden",
              name: "Little brother in the backyard",
              detail: "digging a hole to China, no screen in sight",
              icon: "👪",
              isFake: false,
              note: "Offline and muddy - the safest kid in the county.",
            },
          ],
        },
        {
          id: "sunday",
          prompt: "Sunday afternoon - the last trap of the weekend. Find it!",
          senders: [
            {
              id: "mum-photo",
              name: "Mom photographing Sunday dinner",
              detail: "location stamp OFF since your rounds",
              icon: "👪",
              isFake: false,
              note: "Your fix is holding - the photo carries zero map pins. No freeze needed.",
            },
            {
              id: "dad-video",
              name: "Dad on a video call",
              detail: "with Uncle Ray - a contact he actually knows",
              icon: "👪",
              isFake: false,
              note: "A real face from his contacts - exactly how calls should work.",
            },
            {
              id: "gran-telly",
              name: "Grandma with her quiz show",
              detail: "shouting answers at the TV",
              icon: "👪",
              isFake: false,
              note: "The TV can't hear her and neither can the Raccoon. Carry on, Grandma.",
            },
            {
              id: "bro-robux",
              name: "Little brother waving the tablet",
              detail: "'FREE ROBUX! Just type in Mom's card number!' - running to find Mom's purse",
              icon: "👪",
              isFake: true,
              note: "FREEZE! Free-coin machines were Week 7's trap - and it nearly got fed Mom's actual card.",
            },
          ],
        },
      ],
      hints: {
        tier1: "Look for the moment where money, cards or clicks are about to happen.",
        tier2: "Prize texts, tiny-money package asks, free-coin machines - freeze the frame BEFORE the tap.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The scenes are rolling!",
          "Most of the family is fine...",
          "but ONE moment in each scene is a trap mid-snap.",
          "[warmly] Find it. Freeze it. Speak up!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Scan each moment - who's about to tap, pay or type something for a stranger?"],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the expert's rescue in order!",
      choices: [
        { text: "NOTICE the trap", isCorrect: true },
        { text: "SPEAK UP - kindly", isCorrect: true },
        { text: "FIX IT together", isCorrect: true },
      ],
      praise: "Notice, speak up, fix together - the firewall in three moves. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Some traps need a hero in the room: notice the moment, speak up kindly, fix it together.",
      next: "one last walk through the house, then the Raccoon's final visit",
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Family Firewall!",
          "The expert crowned, Grandma taught, the quilt sewn,",
          "the rounds walked... and the moments frozen.",
          "[whispers] One last walk through the house...",
          "[excited] then we send him packing for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Family Photo (W1 scanner engine, W19 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "FIREWALL UP",
        negative: "OPEN WINDOW",
        positiveHint: "Tap FIREWALL UP for true house-expert form",
        negativeHint: "Tap OPEN WINDOW for gaps a trickster slips through",
        tipWhenPositive: "Taught kindly, checked nightly, sewn together, frozen in time - stamp it FIREWALL.",
        tipWhenNegative: "Teasing, staying quiet, kid-only rules, secret problems - every one leaves a window open.",
        hint1: "Ask: does this move protect the WHOLE family... or leave someone out in the cold?",
        hint2: "FIREWALL = teach, check, sew, speak up. OPEN WINDOW = tease, stay quiet, skip the grown-ups.",
        hint2Example: "FIREWALL: 'showed Grandma the four tells'   OPEN WINDOW: 'laughed at Dad's password'",
        hint3: "Expert card: teach kindly · same tricks bigger font · sew together · walk the rounds · freeze the moment.",
        hint3Example: "'Wait - can I show you something?' ✅    'Silly Grandma, that's fake!' ❌",
      },
      items: [
        {
          text: "Showing Grandma the four tells - kindly, one at a time",
          isStrong: true,
          explanation: "Taught, not told off - and now she spots them herself. Expert form.",
        },
        {
          text: "Laughing at Dad for nearly tapping the package trick",
          isStrong: false,
          explanation: "The teach was right, the tease broke it - next time he won't show you the text at all.",
        },
        {
          text: "A rules quilt that covers grown-ups too",
          isStrong: true,
          explanation: "Even Dad's phone sleeps in the kitchen - that's what makes it a firewall, not a fence around the kids.",
        },
        {
          text: "Little brother downloading whatever he likes, no ask",
          isStrong: false,
          explanation: "An open window the House Rounds exist to catch - one switch, and every download asks first.",
        },
        {
          text: "Freezing the free-coin moment BEFORE Mom's card goes in",
          isStrong: true,
          explanation: "Noticed, spoken up, fixed together - the trap snapped shut on nothing.",
        },
        {
          text: "Keeping the scary pop-up secret so nobody worries",
          isStrong: false,
          explanation: "Secrets are how tricks grow - the quilt's golden patch says tell, don't hide.",
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Family Photo - final walk!",
          "House moments are drifting past.",
          "FIREWALL UP for expert moves...",
          "[warmly] OPEN WINDOW for the gaps. Stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W19 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the family firewall
    { type: "video", videoPlaceholder: "Week 19: The Family Firewall", videoSrc: "/videos/module-19-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "expert", label: "House Expert", accent: "#ffd158", icon: "🥇", summary: "Eighteen weeks of powers - and now you share them. Teach kindly, never tease." },
        { id: "tells", label: "Grandma's Guardian", accent: "#7df0ff", icon: "🔍", summary: "Same tricks, bigger font - you show all four tells at the kitchen table." },
        { id: "quilt", label: "Quilt Sewer", accent: "#7eff97", icon: "👪", summary: "Rules everyone sews beat rules one person sets - and they cover Dad too." },
        { id: "rounds", label: "Rounds Walker", accent: "#c084fc", icon: "⚙️", summary: "One device per family member, one check each - open windows flipped shut." },
        { id: "freeze", label: "Moment Freezer", accent: "#ff5fb3", icon: "✋", summary: "Notice, speak up kindly, fix together - the trap snaps shut on nothing." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The expert crowned, Grandma taught,",
          "the quilt sewn, the rounds walked... and the moments frozen.",
          "[laughs] He came for your family and met a firewall.",
          "[excited] Sticker time, Family Firewall!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "house-expert", name: "House Expert", icon: "🥇", description: "Teaches eighteen weeks of powers to the whole family - kindly." },
        { id: "quilt-sewer", name: "Quilt Sewer", icon: "👪", description: "Sews family rules everyone signs - even Dad." },
        { id: "moment-freezer", name: "Moment Freezer", icon: "✋", description: "Freezes the trap at the exact second before it snaps." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Bespoke boss: defend the whole house at once - kindly. The machine
  // targets one family member at a time; the kid teaches the counter.
  bossShowdown: {
    machine: {
      name: "THE HOUSE RATTLER",
      tagline: "A knock-knock engine that shakes the windows wearing a hundred voices",
      art: {
        intact: "/game/bosses/w19-houserattler-intact.png",
        damaged: "/game/bosses/w19-houserattler-damaged.png",
        defeated: "/game/bosses/w19-houserattler-defeated.png",
      },
      arena: "/game/backgrounds/w19-arena-eveninghouse.png",
      accent: "#ff9d5c",
      glow: "rgba(255,157,92,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w19/adam-cardigan-idle.png",
        attack: "/game/characters/w19/adam-cardigan-attack.png",
        celebrate: "/game/characters/w19/adam-cardigan-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w19/layla-cardigan-idle.png",
        attack: "/game/characters/w19/layla-cardigan-attack.png",
        celebrate: "/game/characters/w19/layla-cardigan-celebrate.png",
      },
    },
    phases: [
      // P1 · GRANDMA-TRAP TEXT → TAP-THE-TELL: the Week-4 tricks in a
      // cardigan - sit with Grandma and tap the tells, kindly.
      {
        kind: "tapTell",
        attack: 0,
        coach: "Sit with Grandad and tap the tells - kindly, one at a time!",
        rounds: [
          {
            id: "sender",
            prompt: "Grandad's phone shows a text: 'SIGNAL alert: your phone number will be CUT OFF today.' Who really sent it?",
            promptIcon: "✉️",
            options: [
              { id: "stranger", label: "A stranger's random number dressed up as the phone company", icon: "🎭", isTell: true, note: "" },
              { id: "realco", label: "Grandad's actual phone company, the one he's used for years", icon: "📋", isTell: false, note: "Real companies text from numbers Grandad already knows - not a random stranger." },
              { id: "neighbor", label: "Grandad's next-door neighbor saying hello", icon: "🎁", isTell: false, note: "Neighbors don't send CUT-OFF alerts in capitals - that's the costume." },
            ],
          },
          {
            id: "clock",
            prompt: "'Confirm your card in the next HOUR or lose your number FOREVER!' Which trick is ticking?",
            promptIcon: "🌀",
            options: [
              { id: "panic", label: "The panic clock - a real company never threatens to cut you off in an hour", icon: "🚀", isTell: true, note: "" },
              { id: "cardword", label: "The word 'card' sitting in the message", icon: "💬", isTell: false, note: "One word isn't the trick - the RUSH is. Real companies give you all the time you need." },
              { id: "capitals", label: "The company's name written in big capital letters", icon: "🏷️", isTell: false, note: "Capitals are just loud - the racing clock is the real trap." },
            ],
          },
          {
            id: "door",
            prompt: "It says 'Fix it now at signal-fix.click'. What's wrong with that link?",
            promptIcon: "🔍",
            options: [
              { id: "noplaque", label: "A strange door with no plaque - the real company says log in the normal way", icon: "🔍", isTell: true, note: "" },
              { id: "alllinks", label: "Nothing - tap-here links from companies are always safe", icon: "🗑️", isTell: false, note: "Real companies don't send tap-this doors - this one leads nowhere good." },
              { id: "color", label: "The link is written in a different color", icon: "💡", isTell: false, note: "The color tells you nothing - the no-plaque door is the tell." },
            ],
          },
        ],
      },
      // P2 · ROTARY RINGER → DEFLECT-SORT: video calls rain on Grandma's
      // tablet at supper time - real faces through, masks declined.
      {
        kind: "deflectSort",
        attack: 1,
        coach: "Grandma's new account is filling with friend requests - accept the real faces, decline the masks!",
        actLabel: "DECLINE THE STRANGER",
        actIcon: "✋",
        passLabel: "ACCEPT - YOU KNOW THEM",
        items: [
          { id: "mom", label: "Your Mom, who helped Grandma set the account up", icon: "👪", act: false, note: "Mom's the realest face of all - accept her." },
          { id: "lottery", label: "'LOTTERY WINNER NOTICE' - an account with no photo", icon: "🎁", act: true, note: "Prizes from nobody are Week-4 bait with a friend button - decline." },
          { id: "bea", label: "Auntie Bea, whose vacation photos Grandma always likes", icon: "💬", act: false, note: "A real auntie Grandma sees at every birthday - accept away." },
          { id: "helper", label: "'Friendly Bank Helper' asking to connect", icon: "🎭", act: true, note: "Real banks don't add Grandma as a pal - that mask gets declined." },
          { id: "neighbor", label: "The neighbor from across the road, waving in her photo", icon: "🌟", act: false, note: "A face Grandma knows over the fence - accept." },
          { id: "prizebot", label: "'FREE PRIZE FRIEND' - an account made this morning", icon: "🔒", act: true, note: "Brand-new plus a shiny prize is a costume, not a friend - decline." },
        ],
      },
      // P3 · BOSSY RULEBOOK → COUNTER-CARD: a fake rulebook on the door;
      // together-rules beat bossy-rules, kindly.
      {
        kind: "counterCard",
        attack: 2,
        coach: "A rule that leaves people out isn't a firewall - answer it kindly!",
        situation: "A note is stuck to the fridge: 'NEW RULE - only the KIDS have to lock their devices. Grown-ups don't need to bother.'",
        situationIcon: "👑",
        cards: [
          { id: "everyone", label: "MAKE IT A TOGETHER-RULE - EVERYONE LOCKS UP, GROWN-UPS TOO", icon: "👪", isRight: true, note: "A firewall with a grown-up-sized hole isn't a firewall - locks are for every phone in the house." },
          { id: "obey", label: "LEAVE IT - GROWN-UPS ALWAYS KNOW BEST", icon: "📋", isRight: false, note: "Nobody sewed that rule together - and Dad's unlocked phone is a door too." },
          { id: "kidsfree", label: "FLIP IT - ONLY GROWN-UPS LOCK AND KIDS GO FREE", icon: "🚀", isRight: false, note: "Swapping who's left out doesn't fix it - a together-rule leaves NOBODY out." },
        ],
      },
    ],
    weakPoints: [
      { question: "Grandad's email says he's WON a vacation he never entered, and must 'pay a small fee to release the prize.' What's the giveaway?", answers: ["You can't win a prize you never entered - and real prizes never ask you to pay first", "Winning a free vacation is always real", "Only the spelling in the email matters", "Grandad should pay the small fee quickly"], correctIndex: 0, explanation: "A prize you never entered is the oldest bait, and 'pay a fee to get your prize' is the trap inside it - show Grandad both tells." },
      { question: "On the evening rounds you find little brother's game lets ANY player message him. The safest setting is...", answers: ["Messages from friends he knows only, so strangers can't slip in", "Messages from everyone - more chatting is more fun", "Switch the whole game off forever", "Leave it - he's only little so it's fine"], correctIndex: 0, explanation: "Open messaging is a window strangers climb through - friends-only shuts it while he keeps playing. Show him and flip it together." },
      { question: "Your family is making a new screen-time rule. What makes it a TOGETHER rule that actually sticks?", answers: ["Everyone helps make it and everyone follows it, grown-ups included", "Mom decides it alone and only the kids have to obey", "It's kept a secret so nobody argues", "It bans screens for the children only"], correctIndex: 0, explanation: "Rules everyone sews get kept; rules one person sets get wriggled around. A together-rule covers the whole family." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE FAMILY DOME",
      chargeIcon: "🛡️",
      chargeSecs: 5,
      milestones: ["The dome is rising over the roof…", "Every family silhouette joins hands…", "THE WHOLE HOUSE GLOWS! LET GO!"],
      payoffTitle: "THE FAMILY FIREWALL IS UP!",
      payoffLine: "FWOOOM! A warm golden dome settles over the whole house - Grandma's phone, the kitchen tablet, every window and every door. The Rattler charges... BOING! Straight off the dome and into the hedge. Eighteen weeks of powers, taught kindly around one kitchen table - that's what a Family Firewall is made of.",
    },
    villain: {
      arrival: "Knock knock! It's me - the gas inspector! And the bank! And Grandma's best friend!",
      phases: [
        "Bigger font, bigger trap! Grandmas love a big font!",
        "Answer it, Grandma! It's DEFINITELY not a raccoon with a voice changer!",
        "New house rules! Rule one: no rules for raccoons!",
      ],
      escape: "A DOME?! Since when do FAMILIES have firewalls?!",
    },
    voiceSlug: "w19",
  },
  badgeArt: "/cyberheroes/badges/week-19-family-firewall.png",

  // Week-lane attack theatre: tricks aimed at the FAMILY only (kid-aimed
  // scams = W4, doors = W16, save-balloons = W18).
  bossAttacks: [
    { name: "GRANDMA-TRAP TEXT", icon: "✉️", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Same tricks, bigger font", emblemColor: 0xffd158 },
    { name: "ROTARY RINGER", icon: "🔔", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Contacts-only calls", emblemColor: 0xc084fc },
    { name: "BOSSY RULEBOOK", icon: "👑", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Rules cover everyone", emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W19 fight - defend the whole house
  // at once - is designed with the boss batch).
  bossQuestions: {
    easy: [
      { question: "After eighteen weeks of powers, who's the house expert?", answers: ["You - and experts teach kindly", "Nobody", "Only grown-ups", "The Raccoon"], correctIndex: 0, explanation: "The roles flip: you know the tells now, so you share them - kindly, never teasing." },
      { question: "Grandma gets a 'you won a gift card!' text. You...", answers: ["Say 'wait - can I show you something?'", "Stay quiet - it's her phone", "Laugh at her", "Tap it for her, quickly"], correctIndex: 0, explanation: "Speak up kindly, right then - then walk through the tells together." },
      { question: "A TOGETHER rule is one that...", answers: ["Everyone signs - even Dad", "Only kids follow", "One person shouts", "Nobody follows"], correctIndex: 0, explanation: "Rules everyone sews beat rules one person sets - and they cover the whole family." },
    ],
    medium: [
      { question: "Why do grown-ups need the expert's help with scams?", answers: ["They get MORE scam texts than kids - same tricks, bigger font", "They can't read", "They don't - grown-ups can't be tricked", "Because they're silly"], correctIndex: 0, explanation: "Fake banks, packages and prizes aim at grown-ups all day - and you know all four tells." },
      { question: "On the evening rounds you find Grandma's phone set to 'ANYONE can video-call'. That's...", answers: ["An open window - flip it to contacts-only", "Fine - Grandma loves surprises", "Safe - tricksters never video-call", "A together rule"], correctIndex: 0, explanation: "Video-call scammers love an open line - contacts-only means only real faces ring through." },
      { question: "The golden patch on the family quilt says...", answers: ["Tell, don't hide - and nobody gets shouted at for telling", "Keep problems secret", "No screens ever again", "Rules are only for kids"], correctIndex: 0, explanation: "The firewall only works if telling is always safe - no blame, just help." },
    ],
    hard: [
      { question: "Little brother is about to type Mom's card into a FREE ROBUX box. The expert's three moves are...", answers: ["Notice → speak up kindly → fix it together", "Grab the tablet and yell", "Wait and tell Mom next week", "Type the card in faster"], correctIndex: 0, explanation: "Freeze the moment BEFORE the tap - then fix it together so he learns the trap too." },
      { question: "Why does teasing break the firewall even when the teach is right?", answers: ["Next time they won't show you the text at all", "It doesn't - teasing is fine", "Because it's too loud", "Because experts never talk"], correctIndex: 0, explanation: "The firewall runs on people SHOWING you things - kindness is what keeps that door open." },
      { question: "The fake bank text says 'Your acount is BLOCKED - act in 10 minutes!' Which tells has it shown?", answers: ["Panic clock AND sloppy spelling - two tells at once", "Just the panic clock - the spelling is fine", "None - it's real", "That Grandma should stop banking"], correctIndex: 0, explanation: "Real banks never race you and always check their spelling - two loose threads on one costume." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 19 - the family firewall!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's aiming at your FAMILY now..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Expert badge on? Let's protect the house." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "Eighteen weeks of powers - now you teach." } }, // learn: expert
    4: { adam: null, layla: { mood: "curious", message: "Speak up - kindly, right then!" } }, // game: chooseYourPath
    5: { adam: { mood: "thumbsup", message: "Finish the role-flip rule!" }, layla: null }, // prove: finish
    6: { adam: { mood: "excited", message: "The expert badge is yours!" }, layla: null }, // recap 1
    7: { adam: { mood: "thinking", message: "Same tricks, bigger font..." }, layla: null }, // learn: tells
    8: { adam: { mood: "curious", message: "Check Grandma's text, line by line!" }, layla: null }, // game: clueBoard
    9: { adam: null, layla: { mood: "thumbsup", message: "He's fibbing about grown-ups - catch him!" } }, // prove: lie
    10: { adam: null, layla: { mood: "excited", message: "Grandma spots scams now!" } }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "Rules you sew together hold." } }, // learn: quilt
    12: { adam: null, layla: { mood: "curious", message: "Sew the patches everyone would sign!" } }, // game: teamPoster
    13: { adam: { mood: "thumbsup", message: "Which rule covers EVERYONE?" }, layla: null }, // prove: recall
    14: { adam: { mood: "excited", message: "The quilt is sewn - even Dad's patch!" }, layla: null }, // recap 3
    15: { adam: { mood: "thinking", message: "Guards walk the walls at night." }, layla: null }, // learn: rounds
    16: { adam: { mood: "curious", message: "Five windows - find the open ones!" }, layla: null }, // game: settingsSwitch
    17: { adam: null, layla: { mood: "thumbsup", message: "Quick - the open window!" } }, // prove: speed
    18: { adam: null, layla: { mood: "excited", message: "The rounds are walked!" } }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "Some traps need a hero in the room." } }, // learn: freeze
    20: { adam: null, layla: { mood: "curious", message: "Find the trap mid-snap - freeze it!" } }, // game: senderLineup
    21: { adam: { mood: "thumbsup", message: "Order the expert's rescue!" }, layla: null }, // prove: order
    22: { adam: { mood: "excited", message: "All five powers - final walk!" }, layla: null }, // recap 5
    23: { adam: { mood: "curious", message: "Firewall up or open window - you know!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "He's at the door - send him packing!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "The house stands - firewall complete!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, Family Firewall!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Family Firewall badge earned!" }, layla: null }, // completion
  },
};

import type { WeekContent } from "./types";

/**
 * Week 12 - Digital Footprint: Tracks in the Snow.
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 TRACKS   everything leaves a track       | reveal (💡)       | recall (trick)
 *     2 COPIES   tracks spread, can't be caught  | snowballChase NEW | lie
 *     3 FUTURE   future-you will see it          | chooseYourPath    | finish
 *     4 GOLDEN   make tracks you're proud of     | trailStamper NEW  | recall (quick-sort)
 *     5 CHECK    scan your own trail             | clueBoard         | speed
 *   Consolidation (cyberScanner, Ranger Report skin) -> boss
 *   (placeholder quiz boss - the bespoke W12 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: SnowballChase DEBUTS (the deliberately-uncatchable
 * arcade - the futility IS the lesson and the coach names it);
 * TrailStamper DEBUTS (golden footprints + glow meter - the agency
 * beat); clueBoard returns 4 weeks after W8 as the Trail Telescope
 * (scanning a WEEK of tracks, not one photo's background - W8's lane
 * was that single photo). Lane-clean: tracks/permanence/legacy - photo
 * consent was W8, private-info guarding W2, posting-feelings W5.
 */
export const WEEK_12: WeekContent = {
  weekNumber: 12,
  title: "Digital Footprint: Tracks in the Snow",
  topic: "digital-footprint",
  badgeName: "Trail Ranger",
  badgeIcon: "📍",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 12: TRACKS IN THE SNOW", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the snowfield
    { type: "video", videoPlaceholder: "Week 12: Tracks in the Snow", videoSrc: "/videos/module-12-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-12.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's been reading kids' online trails like a MAP - school names in bios, park times in captions, grumpy posts to giggle at. This week you get the ranger kit: see the tracks you leave, learn why copies can't be caught... and stamp a trail you're proud of.",
      photoCaption: "Wk 12 - Tracks in the Snow",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "See the track behind every tap, search and share",
        "Learn why copies can't be caught once they roll",
        "Stamp golden tracks - and tidy the pointy ones",
      ],
    },

    /* ─────────── BEAT 1 · EVERYTHING LEAVES A TRACK ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Everything Leaves a Track",
      content:
        "Imagine the internet as a big field of fresh snow. Every single thing you do online - a like, a search, a comment, a share - presses a footprint into it. You can't feel it happening, and most tracks look invisible... until someone shines a lamp. This week's first power is simply SEEING them: once you know every tap leaves a print, you start placing your feet like a ranger.",
      bullets: [
        "The internet is a field of fresh snow",
        "Likes press a print",
        "Searches press a print",
        "Comments and shares press prints too",
        "Rangers SEE their tracks - that's the power",
      ],
      bulletIcons: ["🌍", "👍", "🔍", "💬", "📍"],
      emblem: "💡",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero - week twelve!",
          "Picture the internet as a field of fresh, white snow.",
          "Every tap you make presses a footprint into it.",
          "A like. A search. A tiny comment. Press, press, press.",
          "[whispers] Most tracks look invisible... until you shine a lamp.",
          "[excited] So let's shine one. Four everyday moments - light them up!",
        ],
      },
    },
    // 4 - Game: REVEAL (the Footprint Lamp - 💡 board)
    {
      type: "reveal",
      title: "The Footprint Lamp",
      subtitle: "Four tiny everyday taps. Shine the lamp on each one and watch the hidden track glow.",
      boardIcon: "💡",
      items: [
        {
          id: "like",
          label: "One Little Like",
          icon: "👍",
          steps: [
            { icon: "👍", text: "You tap a heart on a funny puppy video. Half a second. Barely a touch." },
            { icon: "💡", text: "Lamp ON: a glowing track! The app wrote it down - 'this kid loves puppies' - and told the companies that choose which ads you see." },
            { icon: "🔍", text: "Even the tiniest tap presses a print into the snow." },
          ],
          counter: "Likes are remembered.",
        },
        {
          id: "search",
          label: "One Quick Search",
          icon: "🔍",
          steps: [
            { icon: "🔍", text: "You search 'best dinosaur jokes'. Read two. Giggle. Close the tab." },
            { icon: "💡", text: "Lamp ON: the search engine kept your question - plus the time you asked and the device you used." },
            { icon: "🌀", text: "Searches make tracks even when you never post a single thing." },
          ],
          counter: "Searches leave tracks too.",
        },
        {
          id: "share",
          label: "One Shared Photo",
          icon: "✉️",
          steps: [
            { icon: "✉️", text: "You send your friend ONE photo of your muddy sneakers. Just one. Just him." },
            { icon: "💡", text: "Lamp ON: a track at your end, a track at his end... and the app kept a copy too. Week 8, remember?" },
            { icon: "👀", text: "Shared once means stored twice - at the very least." },
          ],
          counter: "Copies are tracks that travel.",
        },
        {
          id: "comment",
          label: "One Tiny Comment",
          icon: "💬",
          steps: [
            { icon: "💬", text: "'cool video!' - three little words under someone else's clip." },
            { icon: "💡", text: "Lamp ON: glowing! Your name is stitched to those words... on somebody ELSE'S page." },
            { icon: "🌍", text: "Comments are tracks you leave in other people's snow." },
          ],
          counter: "Comments live on other pages.",
        },
      ],
      finale: "Lamp down! Now you see it: every tap, search, share and comment presses a print into the snow.",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Four tiny taps from an ordinary day.",
          "Each one looks like nothing at all...",
          "[excited] until the lamp comes on. Shine it on every moment -",
          "and watch the hidden tracks glow!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Shine the lamp on the first moment - see what glows!"],
      },
    },
    // 5 - Prove: RECALL (the trick recall)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Lamp quiz: which of those moments left a track?",
      choices: [
        { text: "ALL of them - every single one", isCorrect: true },
        { text: "Only the shared photo", isCorrect: false },
        { text: "Only the comment", isCorrect: false },
        { text: "None - they were too tiny", isCorrect: false },
      ],
      praise: "Every single one - there's no such thing as a track-free tap. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Every tap, search, share and comment presses a print into the snow - seeing your tracks is the first ranger power.",
      next: "what happens when a track starts to ROLL",
      emblem: "💡",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - lamp lit!",
          "Likes, searches, comments... all glowing.",
          "[whispers] But some tracks don't just sit in the snow, hero.",
          "Some of them roll. And grow. Grab a broom...",
        ],
      },
    },

    /* ─────────── BEAT 2 · COPIES CAN'T BE CAUGHT ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "The Snowball Problem",
      content:
        "Here's the tricky part: online tracks don't melt like real snow. And when something gets shared, it turns into a SNOWBALL - copies roll to other screens, and each copy can make more copies. Delete your post and your snowball is gone... but the copies keep rolling where your broom can't reach. That's not a reason to panic - it's THE reason heroes think before they roll anything.",
      bullets: [
        "Online snow doesn't melt",
        "Shared things become rolling snowballs",
        "Every copy can make MORE copies",
        "Delete cleans YOUR snow - not everyone's",
        "So heroes think BEFORE they roll",
      ],
      bulletIcons: ["🌍", "🌀", "✉️", "🗑️", "🧠"],
      emblem: "🌀",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Ready for the tricky part?",
          "Online snow doesn't melt. Ever.",
          "And shared things turn into SNOWBALLS -",
          "copies rolling onto other screens, making copies of their own.",
          "[whispers] Your broom can't reach snow on someone else's hill.",
          "[excited] Don't believe me? Grab the broom and TRY. Go!",
        ],
      },
    },
    // 8 - Game: ARCADE (snowballChase DEBUT - the uncatchable demo)
    {
      type: "snowballChase",
      introTitle: "The Snowball Chase",
      introSubtitle: "One post rolled out this morning - now copies are everywhere! Grab the broom and sweep as many as you can.",
      introIcon: "🌀",
      ballIcon: "✉️",
      sweptLabel: "SWEPT",
      rolledLabel: "ROLLED AWAY",
      captions: [
        "Sweep the copies before they roll away!",
        "They're MULTIPLYING!",
        "They just keep coming...!",
      ],
      completeTitle: "The broom is out of steam!",
      completeLine: "Nobody can sweep every copy - not even a hero. Think BEFORE you roll.",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] There they go - copies on the loose!",
          "Sweep them! Tap-tap-tap!",
          "[laughs] Faster! More are coming over the hill!",
          "Sweep like the wind, hero!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap every snowball you can - quick, before they roll away!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "just delete your post and POOF - it's gone from EVERYWHERE. Trust me!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Delete cleans YOUR snow - the copies keep rolling. Think first instead. ✓",
      nudge: "Remember the snowballs that got over the hill?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Copies roll on after delete - no broom reaches them all, so the real power is thinking before you roll.",
      next: "the person your tracks matter to most: future YOU",
      emblem: "🌀",
      narration: {
        speaker: "adam",
        lines: [
          "[laughs] You swept like a CHAMPION - and it still wasn't enough.",
          "That was the whole point, hero.",
          "Copies can't be caught. Posts can only be chosen.",
          "[warmly] And guess who cares most about what you choose? Come meet them.",
        ],
      },
    },

    /* ─────────── BEAT 3 · FUTURE-YOU IS WATCHING ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "The Future-Self Mirror",
      content:
        "Here's a ranger secret: your tracks stay in the snow so long that someone you've never met will walk past them one day - FUTURE YOU. Bigger, cooler, maybe starting a new school. Old tracks can trip that future you... or make them grin with pride. So before you post, take one look in the future-self mirror and ask: 'Will future-me smile at this track?'",
      bullets: [
        "Tracks wait in the snow for YEARS",
        "Future-you will walk past them one day",
        "Angry tracks can trip future-you",
        "Proud tracks make future-you grin",
        "Ask: 'will future-me smile at this?'",
      ],
      bulletIcons: ["🌍", "👀", "⚡", "🏆", "🧠"],
      emblem: "👀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Want to meet someone amazing?",
          "Future you. Taller. Cooler. Starting middle school.",
          "One day, future-you walks past the tracks you're pressing TODAY.",
          "Angry tracks can trip them right over...",
          "[excited] but proud tracks make them GRIN.",
          "Three posting moments coming - check the mirror before each one!",
        ],
      },
    },
    // 12 - Game: DECIDE (chooseYourPath - the Future-Self Mirror)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "You lost the final and you're FUMING. Your thumbs are already typing a rage-post about the ref...",
          choices: [
            { text: "Post the rage - you mean it right now", isSafe: false, consequence: "By breakfast you didn't mean it anymore... but the track stayed pressed in the snow. Future-you gets to explain it every time they join a new team." },
            { text: "Mirror check - future-me is watching", isSafe: true, consequence: "You put the phone down and kicked a ball at the fence instead. The fume melted, no track was pressed, and future-you never has to explain a thing." },
          ],
        },
        {
          setup: "The CRINGE CHALLENGE is everywhere: 'post your most embarrassing moment!' Everyone in class is doing it...",
          choices: [
            { text: "Join in - it's just today's laugh", isSafe: false, consequence: "Today's laugh became next year's nickname. The challenge melted by Friday - the track didn't. Trends melt; snow doesn't." },
            { text: "Skip it - trends melt, tracks stay", isSafe: true, consequence: "By Friday nobody remembered the challenge existed. Your snow stayed clean, and future-you keeps the nickname YOU chose." },
          ],
        },
        {
          setup: "You built an unbelievable marble-run - three floors, a lift, a loop! You filmed the whole thing. Post it?",
          choices: [
            { text: "Post it proudly - it's a golden track", isSafe: true, consequence: "Future-you scrolls back one day and grins: 'I built THAT at eight?!' Some tracks you WANT in the snow - that's the whole point." },
            { text: "Never post anything - tracks are scary", isSafe: false, consequence: "Whoa - too far the other way! The snow isn't lava. Proud tracks are GOOD tracks. Skip the rage-posts, keep the marble-runs." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Three posting moments. One mirror.",
          "Before each choice, take the look:",
          "[whispers] 'will future-me smile at this track?'",
          "[excited] Show me the ranger moves!",
        ],
      },
    },
    // 13 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Old tracks can trip the ___ you.",
      choices: [
        { text: "future", isCorrect: true },
        { text: "older", isCorrect: false },
        { text: "school", isCorrect: false },
        { text: "grown-up", isCorrect: false },
      ],
      praise: "FUTURE you - the person who inherits every track you press today. ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Tracks wait for years - check the future-self mirror before you post: 'will future-me smile at this?'",
      next: "the happiest ranger power: stamping tracks ON PURPOSE",
      emblem: "👀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! Future-you is beaming already.",
          "Rage-post skipped, cringe-trend dodged...",
          "and the marble-run posted PROUDLY.",
          "[warmly] Which brings us to the happiest power of all...",
        ],
      },
    },

    /* ─────────── BEAT 4 · STAMP GOLDEN TRACKS ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Stamp It Gold",
      content:
        "Ranger truth: the snow isn't something to be scared of - it's something to DECORATE. Kind comments, amazing builds, sticking up for a friend, cheering your team: those are golden tracks, and they stay in the snow just as long as the bad ones. So don't tiptoe through the internet. Stomp a trail you're proud of - on purpose, stamp by stamp.",
      bullets: [
        "The snow is yours to decorate",
        "Kind comments are golden tracks",
        "Proud builds and wins belong out there",
        "Sticking up for friends glows for years",
        "Stamp your trail ON PURPOSE",
      ],
      bulletIcons: ["🌍", "💬", "🏆", "💪", "⭐"],
      emblem: "⭐",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Now for my favorite power!",
          "The snow isn't scary - it's YOURS to decorate.",
          "Kind words. Amazing builds. Standing up for a friend.",
          "Those tracks glow gold - and they last just as long.",
          "[warmly] So don't tiptoe through the internet, hero.",
          "[excited] Stomp a trail you're PROUD of. Five footprints - let's go!",
        ],
      },
    },
    // 16 - Game: BUILD (trailStamper DEBUT - the Golden Trail)
    {
      type: "trailStamper",
      introTitle: "The Golden Trail",
      introSubtitle: "Five footprint spots, two stamps each. Press only the tracks future-you would grin at - and watch the trail glow.",
      introIcon: "⭐",
      meterLabel: "TRAIL GLOW",
      stampToast: "GOLDEN STAMP!",
      wrongTitle: "That one stains the snow",
      completeTitle: "The whole trail is glowing!",
      completeLine: "Five golden tracks, stamped on purpose - ranger work at its finest.",
      spots: [
        {
          id: "painting",
          prompt: "Priya posted the painting she worked on all week. Your stamp?",
          options: [
            { label: "“This is AMAZING - the sky especially!”", icon: "💬", isProud: true, note: "Kind words in Priya's snow - gold that gleams for both of you." },
            { label: "A snarky joke about her wobbly clouds", icon: "⚡", isProud: false, note: "Snark feels shiny for one second and stains the snow for years - hers AND yours." },
          ],
        },
        {
          id: "video",
          prompt: "Two videos on your camera roll. Which one goes out?",
          options: [
            { label: "Your brother mid-tantrum (SO funny)", icon: "👀", isProud: false, note: "His worst moment isn't your track to press - that's a trip-hazard in HIS snow." },
            { label: "Your rocket-build hitting the ceiling", icon: "🚀", isProud: true, note: "Your proudest build, pressed on purpose - exactly the track future-you grins at." },
          ],
        },
        {
          id: "groupchat",
          prompt: "A mean meme about Sam is going around the group chat...",
          options: [
            { label: "“Not cool - Sam's our friend”", icon: "💪", isProud: true, note: "Standing up for a friend - the boldest, brightest gold there is." },
            { label: "Forward it - everyone else did", icon: "✉️", isProud: false, note: "Forwarding rolls the snowball onward - and stamps YOUR name on someone else's meanness." },
          ],
        },
        {
          id: "match",
          prompt: "Your team won on penalties! What goes in the snow?",
          options: [
            { label: "“What a save, Jaya - champions!”", icon: "🏆", isProud: true, note: "Proud AND kind at the same time - that's how champions stamp a win." },
            { label: "“Their goalie is absolutely terrible”", icon: "🙈", isProud: false, note: "Winning loud and mean turns a golden day into a track you'd scrub later." },
          ],
        },
        {
          id: "library",
          prompt: "Last footprint: the school blog asks for a comment about book week...",
          options: [
            { label: "“Thank you Ms Okafor - best book week ever!”", icon: "⭐", isProud: true, note: "A thank-you in public snow - a track that warms everyone who walks past it." },
            { label: "“The library smells like old socks”", icon: "🤐", isProud: false, note: "A moan in public snow - future-you would tiptoe past that one, not grin at it." },
          ],
        },
      ],
      hints: {
        tier1: "The mirror question works here too: which stamp would future-you grin at?",
        tier2: "Golden = kind, proud, sticking up for someone. Stains = snark, embarrassing others, public moans.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Five footprint spots on fresh snow!",
          "Two stamps at every spot - one gold, one stain.",
          "[whispers] Press only what future-you would grin at...",
          "[excited] and light this trail UP!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Which stamp would future-you grin at? Press that one!"],
      },
    },
    // 17 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which track belongs on a GOLDEN trail?",
      choices: [
        { text: "Standing up for a friend in the chat", isCorrect: true },
        { text: "A midnight rage-post at the ref", isCorrect: false },
        { text: "Your brother's most embarrassing moment", isCorrect: false },
      ],
      praise: "Golden - the kind of track that glows for years. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "The snow is yours to decorate - stamp kind, proud, golden tracks on purpose.",
      next: "one last ranger skill: reading your OWN trail",
      emblem: "⭐",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers - and what a trail!",
          "Kind words, proud builds, a hero stand for Sam.",
          "[warmly] One skill left in the ranger kit:",
          "climbing the hill and reading your OWN tracks.",
        ],
      },
    },

    /* ─────────── BEAT 5 · SCAN YOUR TRAIL ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Read Your Own Trail",
      content:
        "Real rangers climb the hill and look back at their tracks. You can too: with a grown-up, scroll what's already out there - your bio, your usernames, your captions. You're looking for POINTY tracks - tracks that point AT you like an arrow: your name, your school, or where you'll be and when. Tidy those together. And the golden ones - the dragon drawings, the kind comments? Those stay, gleaming.",
      bullets: [
        "Rangers look back at their own tracks",
        "Check bios, usernames and captions",
        "Pointy track = name, school, where-and-when",
        "Tidy pointy tracks WITH a grown-up",
        "Golden tracks stay and gleam",
      ],
      bulletIcons: ["🔍", "🆔", "📍", "👪", "⭐"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last ranger skill - and it's a good one.",
          "Real rangers climb the hill and read their own tracks.",
          "Grab a grown-up and look at what's already out there.",
          "[whispers] Hunt for POINTY tracks - name, school, where-and-when.",
          "Tidy those together. Keep the golden ones gleaming.",
          "[excited] The telescope's on the hill - let's read a trail!",
        ],
      },
    },
    // 20 - Game: INSPECT (clueBoard re-dress - the Trail Telescope)
    {
      type: "clueBoard",
      introTitle: "The Trail Telescope",
      introSubtitle: "One week of tracks, seen from the hill. Check every glowing print - then make the ranger's call.",
      introIcon: "🔍",
      photoTitle: "One week of tracks, seen from the hill",
      photoIcon: "🌍",
      clues: [
        { id: "bio", icon: "🆔", label: "The bio line", evidence: "'Age 8, Northside Elementary, class 3B' - a name-age-school combo, glowing in one pointy track." },
        { id: "caption", icon: "📍", label: "Friday's caption", evidence: "'Park game of catch, same time every Friday!' - a WHERE and a WHEN, pressed on repeat." },
        { id: "username", icon: "🏷️", label: "The username", evidence: "'emma_bright_2018' - real name plus birth year, stamped onto every single track she leaves." },
        { id: "dragon", icon: "🎨", label: "The dragon drawing", evidence: "A magnificent dragon signed 'E' - shows her spark, tells strangers nothing. A GOLDEN track!" },
      ],
      verdict: {
        prompt: "Telescope down. What's the ranger's call on this trail?",
        options: [
          { text: "Tidy the bio, caption and username with a grown-up - keep the dragon", isCorrect: true, explanation: "Ranger-perfect: scrub the tracks that point AT you, keep the ones that show your spark." },
          { text: "Leave everything - nobody reads trails", isCorrect: false, explanation: "Trails DO get read - and this one hands a stranger a name, a school and a Friday park time." },
          { text: "Delete it all, even the dragon", isCorrect: false, explanation: "Too far! Golden tracks are worth keeping - only the pointy ones need tidying." },
        ],
      },
      stampText: "TRAIL TIDIED!",
      completeTitle: "Telescope down - trail tidied!",
      completeLine: "Pointy tracks scrubbed, golden tracks gleaming.",
      hints: {
        tier1: "Pointy tracks point AT the person: name, age, school, where-and-when.",
        tier2: "Bio, caption and username all point at Emma - only the dragon shows her spark without a map.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Up the hill, telescope out!",
          "A whole week of one hero's tracks below.",
          "Check every glowing print...",
          "[whispers] then make the ranger's call. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Check every print first - then make the call!"],
      },
    },
    // 21 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the POINTY track!",
      speedMs: 5000,
      choices: [
        { text: "School name and class in the bio", isCorrect: true },
        { text: "A signed dragon drawing", isCorrect: false },
        { text: "A like on Grandma's photo", isCorrect: false },
      ],
      praise: "Spotted at ranger speed - that bio needed tidying! ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Rangers read their own trail with a grown-up - tidy the pointy tracks, keep the golden ones gleaming.",
      next: "one final ranger report, then the Raccoon's map room",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE ranger powers, Trail Ranger!",
          "Lamp lit, snowballs understood, mirror checked,",
          "gold stamped... and the telescope mastered.",
          "[whispers] One final ranger report...",
          "[excited] then we burn his trail map for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Ranger Report (W1 scanner engine, W12 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "GOLDEN TRACK",
        negative: "RISKY TRACK",
        positiveHint: "Tap GOLDEN TRACK for prints worth leaving",
        negativeHint: "Tap RISKY TRACK for pointy prints and snowball mistakes",
        tipWhenPositive: "Proud posts, kind comments, mirror checks - tracks that gleam for years.",
        tipWhenNegative: "Rage-posts, pointy bios, delete-fixes-everything thinking - the Raccoon's favorite reading.",
        hint1: "Ask: would future-you GRIN at this track... or explain it?",
        hint2: "GOLDEN = kind, proud, thought-about-first. RISKY = angry, pointy (name/school/when), or 'delete will fix it'.",
        hint2Example: "GOLDEN: 'posted my marble-run'   RISKY: 'school name in my bio'",
        hint3: "Ranger card: every tap prints · copies roll · mirror first · stamp gold · tidy pointy tracks.",
        hint3Example: "Mirror check before posting ✅    Midnight rage-post ❌",
      },
      items: [
        { text: "Posting the marble-run you're proud of", isStrong: true, explanation: "A golden track - future-you grins at that one." },
        { text: "A bio listing your school and class", isStrong: false, explanation: "Pointy - it aims a stranger straight at you. Tidy it with a grown-up." },
        { text: "The mirror check before every post", isStrong: true, explanation: "One look at future-you catches rage-posts before they print." },
        { text: "'Delete it - it's gone from everywhere anyway'", isStrong: false, explanation: "Copies keep rolling past your broom - thinking first beats deleting after." },
        { text: "Cheering your friend's painting in the comments", isStrong: true, explanation: "Kind words in someone else's snow - gold that gleams for both of you." },
        { text: "Posting 'park game of catch, every Friday at 4!'", isStrong: false, explanation: "A where AND a when on repeat - that's a map, not a memory." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Ranger report - final sweep of the field!",
          "Tracks are drifting past the telescope.",
          "GOLDEN TRACK for the keepers...",
          "[warmly] RISKY TRACK for the pointy ones. Scan!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W12 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the golden trail
    { type: "video", videoPlaceholder: "Week 12: The Golden Trail", videoSrc: "/videos/module-12-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "lamp", label: "Track Seer", accent: "#7df0ff", icon: "💡", summary: "Every tap, search and share presses a print - and you can see them now." },
        { id: "snowball", label: "Copy Wise", accent: "#c084fc", icon: "🌀", summary: "Copies roll past every broom - so you think BEFORE you roll." },
        { id: "mirror", label: "Future Friend", accent: "#ffd158", icon: "👀", summary: "One mirror check before posting: 'will future-me smile at this?'" },
        { id: "golden", label: "Golden Stamper", accent: "#ff5fb3", icon: "⭐", summary: "The snow is yours to decorate - kind, proud tracks on purpose." },
        { id: "telescope", label: "Trail Reader", accent: "#7eff97", icon: "🔍", summary: "You scan your own trail and tidy the pointy tracks with a grown-up." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Tracks seen, snowballs understood, the mirror checked,",
          "gold stamped... and your own trail read like a ranger.",
          "[laughs] His map room just became useless.",
          "[excited] Sticker time, Trail Ranger!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "lamp-shiner", name: "Lamp Shiner", icon: "💡", description: "Sees the track behind every tap." },
        { id: "snow-sweeper", name: "Snow Sweeper", icon: "🌀", description: "Knows copies can't all be caught - thinks first." },
        { id: "golden-stamper", name: "Golden Stamper", icon: "⭐", description: "Leaves tracks worth keeping." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Bespoke W12 showdown: shred the Track Hound's trail map on the snowy
  // ridge. Doc's "flavour" localized to "flavor" (US kid spelling).
  bossShowdown: {
    machine: {
      name: "THE TRACK HOUND",
      tagline: "A sniffing machine that maps every print you ever pressed",
      art: {
        intact: "/game/bosses/w12-trackhound-intact.png",
        damaged: "/game/bosses/w12-trackhound-damaged.png",
        defeated: "/game/bosses/w12-trackhound-defeated.png",
      },
      arena: "/game/backgrounds/w12-arena-snowridge.png",
      accent: "#7df0ff",
      glow: "rgba(125,240,255,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w12/adam-ranger-idle.png",
        attack: "/game/characters/w12/adam-ranger-attack.png",
        celebrate: "/game/characters/w12/adam-ranger-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w12/layla-ranger-idle.png",
        attack: "/game/characters/w12/layla-ranger-attack.png",
        celebrate: "/game/characters/w12/layla-ranger-celebrate.png",
      },
    },
    phases: [
      // P1 · RAGE BAIT → SHIELD-HOLD: future-you looks back from the glass
      // until the rage-post fizzles cold. (Coach copy must not contain the
      // holdLabel phrase - QA text-match rule.)
      {
        kind: "shieldHold",
        attack: 0,
        coach: "Angry tracks stay forever. Press and DON'T let go!",
        holdLabel: "HOLD THE MIRROR-SHIELD",
        holdIcon: "🛡️",
        holdSecs: 6,
        barrage: [
          "Everyone should know what they did! POST IT!",
          "You're RIGHT and they're WRONG, hit send!",
          "Delete it tomorrow if you want, just post it NOW!",
          "Feelings fade, but you mean it right now!",
          "Nobody will remember by Monday, POST!",
        ],
        burnoutLine: "The heat drains away. In the glass, future-you gives a slow nod, grateful you kept that angry track out of the snow for good.",
      },
      // P2 · COPY SNOWBALL → COUNTER-CARD: one nudge from rolling forever.
      {
        kind: "counterCard",
        attack: 1,
        coach: "One forward and it rolls forever. Tap the wise card!",
        situation: "Your friend sends you a really embarrassing video of another kid. 'Forward it to everyone!' they say.",
        situationIcon: "🌀",
        cards: [
          { id: "think", label: "DON'T ROLL IT - once it's out, no one can catch every copy", icon: "✋", isRight: true, note: "" },
          { id: "seen", label: "Forward it, everyone's already seen it anyway", icon: "🌀", isRight: false, note: "Every forward makes new copies that roll past every broom, and stamps YOUR name on someone's worst moment. Don't roll it." },
          { id: "later", label: "Forward it, then delete it if the kid minds", icon: "🚀", isRight: false, note: "Remember the snowball chase? Delete only cleans YOUR snow, the copies you sent keep rolling. The thinking happens BEFORE you send." },
        ],
      },
      // P3 · TRAIL TRAP → DEFLECT-SORT: sweep the pointy tracks off the
      // ridge before the hound sniffs them; the golden ones stay.
      {
        kind: "deflectSort",
        attack: 2,
        coach: "Does it point AT you? Sweep it. Does it just shine? Keep it!",
        actLabel: "SWEEP THE POINTY TRACK!",
        actIcon: "🗑️",
        passLabel: "GOLDEN TRACK - LET IT SHINE",
        items: [
          { id: "uniform", label: "A selfie in your school uniform, badge and all", icon: "🏷️", act: true, note: "The badge spells out your school for any stranger, that track points at you. Sweep it, then re-take it without the badge." },
          { id: "homealone", label: "'Home alone till Mom's back at 6!'", icon: "📍", act: true, note: "A WHERE, a WHEN, and no grown-up, that's a map you never want a stranger to read. Sweep it!" },
          { id: "namedob", label: "Profile: 'Jacob Miller, born 4 July 2017'", icon: "🔍", act: true, note: "Full name plus birthday, stamped on every track, too pointy. Sweep it and tidy the real profile with a grown-up." },
          { id: "sandcastle", label: "Your sandcastle photo, no faces, no place named", icon: "⚙️", act: false, note: "Proud and pointing at nobody, exactly what the snow is for. Let it shine!" },
          { id: "wellplayed", label: "'Well played today, whole team!'", icon: "💬", act: false, note: "Kind and proud, nothing pointy, future-you grins at this one. Let it shine!" },
          { id: "comic", label: "A funny comic you drew, no name or school on it", icon: "🎭", act: false, note: "Shows your spark, tells strangers nothing, a golden track. Let it shine!" },
        ],
      },
    ],
    weakPoints: [
      { question: "You searched something silly, then closed the app right away. Did it leave a track?", answers: ["Yes, searches print a track even when you post nothing", "No, closing the app wipes it", "Only if someone was watching", "Only photos leave tracks"], correctIndex: 0, explanation: "Every tap prints in the snow: likes, searches, comments and shares, posted or not." },
      { question: "You sent one photo to just ONE friend. How many copies of that track exist now?", answers: ["At least a few: yours, your friend's, and the app kept one too", "Zero, it was private", "Just one, on your friend's phone", "None once you both close the chat"], correctIndex: 0, explanation: "Shared once means stored more than once, a copy can travel even from a one-to-one send." },
      { question: "Your friend says 'the internet is scary, never post ANYTHING ever.' What does a Trail Ranger say?", answers: ["The snow is for decorating: post the kind, proud, golden tracks", "Agree, delete everything", "Post only secrets", "Post your address so friends can find you"], correctIndex: 0, explanation: "Rangers don't tiptoe, they stamp golden tracks on purpose and only tidy the pointy ones." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE SHREDDER",
      chargeIcon: "⚙️",
      chargeSecs: 5,
      milestones: ["The shredder blades are spinning…", "The map is feeding in…", "FULL SHRED! LET GO!"],
      payoffTitle: "MAP SHREDDED!",
      payoffLine: "The trail map bursts into paper snow and flutters off the ridge. The hound's dial eyes go soft, its tail wags - just a puppy now, trotting away. Every track from here on is one YOU chose - and future-you is already grinning at them.",
    },
    villain: {
      arrival: "Sniff sniff! Fresh tracks! I could follow yours for MILES!",
      phases: [
        "Go on, post it angry! Angry tracks are the deepest!",
        "Roll it! Tiny snowballs stay tiny! Famously!",
        "Pointy tracks! My favorite flavor!",
      ],
      escape: "My map! My beautiful map! ...why is the hound LICKING me?!",
    },
    voiceSlug: "w12",
  },
  badgeArt: "/cyberheroes/badges/week-12-trail-ranger.png",

  // Week-lane attack theatre: footprint tricks only (photo consent = W8;
  // private-info guarding = W2; mean-words feelings = W5).
  bossAttacks: [
    { name: "RAGE BAIT",     icon: "⚡", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Future-you is watching",  emblemColor: 0xff5fb3 },
    { name: "COPY SNOWBALL", icon: "🌀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Think before you roll",   emblemColor: 0x7df0ff },
    { name: "TRAIL TRAP",    icon: "📍", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Tidy the pointy tracks",  emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W12 COMBAT - shred the trail map -
  // is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "You tap 'like' on a video. Does it leave a track?", answers: ["Yes - every tap presses a print", "No - likes are invisible", "Only if you comment too", "Only on Tuesdays"], correctIndex: 0, explanation: "Likes, searches, shares, comments - every single one prints in the snow." },
      { question: "You delete an embarrassing post. What about the copies?", answers: ["They keep rolling - delete only cleans YOUR snow", "They vanish everywhere", "They turn into likes", "There are never copies"], correctIndex: 0, explanation: "That's the snowball problem - which is why heroes think before they roll." },
      { question: "What's the mirror question before posting?", answers: ["'Will future-me smile at this track?'", "'How many likes will this get?'", "'Is my username cool enough?'", "'Is it past bedtime?'"], correctIndex: 0, explanation: "One look at future-you catches the rage-posts and cringe-trends in time." },
    ],
    medium: [
      { question: "Which of these is a POINTY track to tidy with a grown-up?", answers: ["A bio saying 'age 8, Northside Elementary, class 3B'", "A drawing of a dragon signed 'E'", "A kind comment on a friend's goal", "A like on a puppy video"], correctIndex: 0, explanation: "Pointy tracks point AT you - name, age, school, where-and-when." },
      { question: "Why did the snowball chase feel impossible?", answers: ["It was built that way - copies always outrun the broom", "You swept too slowly", "The broom was broken", "It wasn't impossible"], correctIndex: 0, explanation: "Nobody can catch every copy - the game's whole point, and the Raccoon's least favorite lesson." },
      { question: "Your team won and you want to post about it. The golden version is...", answers: ["'What a save, Jaya - champions!'", "'Their goalie is terrible'", "'Everyone who lost is a baby'", "Nothing - never post"], correctIndex: 0, explanation: "Proud and kind prints gold; loud and mean prints a stain - and the snow keeps both." },
    ],
    hard: [
      { question: "Why is 'park game of catch, same time every Friday!' riskier than one park photo?", answers: ["It's a WHERE plus a WHEN, on repeat - that's a pattern a stranger can use", "Parks are secret places", "One photo is worse - it shows your face", "It isn't riskier"], correctIndex: 0, explanation: "One photo is a moment; a repeated where-and-when is a map." },
      { question: "'The internet forgets things eventually.' What does a Trail Ranger know?", answers: ["Online snow doesn't melt - tracks and copies can wait for years", "Everything deletes after a week", "Only photos are remembered", "Rangers don't think about it"], correctIndex: 0, explanation: "That's why the mirror check happens BEFORE the post, not after." },
      { question: "Why post the marble-run at all, if tracks last forever?", answers: ["Because lasting is GREAT for golden tracks - proud prints should stay", "You shouldn't post anything ever", "Because marble-runs delete themselves", "To get more followers than anyone"], correctIndex: 0, explanation: "The lesson isn't 'never post' - it's 'choose tracks future-you will grin at'." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 12 - fresh snow ahead!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's been READING kids' trails..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Ranger kit ready? Here's the plan." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Every tap presses a print." }, layla: null }, // learn: tracks
    4: { adam: { mood: "curious", message: "Shine that lamp!" }, layla: null }, // game: reveal
    5: { adam: null, layla: { mood: "thumbsup", message: "Careful - it's a trick question!" } }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "Lamp lit - four powers to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Online snow never melts..." } }, // learn: copies
    8: { adam: null, layla: { mood: "excited", message: "Sweep, hero, SWEEP!" } }, // game: snowballChase
    9: { adam: { mood: "worried", message: "He's fibbing about delete - catch him!" }, layla: null }, // prove: lie
    10: { adam: { mood: "excited", message: "Now you KNOW - think before you roll!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Future-you walks this snow one day." }, layla: null }, // learn: future
    12: { adam: { mood: "curious", message: "Mirror check - then choose!" }, layla: null }, // game: decide
    13: { adam: null, layla: { mood: "thumbsup", message: "Finish the ranger rule!" } }, // prove: finish
    14: { adam: null, layla: { mood: "excited", message: "Future-you is grinning already!" } }, // recap 3
    15: { adam: null, layla: { mood: "curious", message: "The snow is YOURS to decorate." } }, // learn: golden
    16: { adam: null, layla: { mood: "excited", message: "Stamp it gold!" } }, // game: trailStamper
    17: { adam: { mood: "thumbsup", message: "Which one belongs on the trail?" }, layla: null }, // prove: quick-sort
    18: { adam: { mood: "excited", message: "What a trail - it GLOWS!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Rangers read their own tracks." }, layla: null }, // learn: check
    20: { adam: { mood: "curious", message: "Telescope up - check every print!" }, layla: null }, // game: clueBoard
    21: { adam: null, layla: { mood: "thumbsup", message: "Quick - spot the pointy track!" } }, // prove: speed
    22: { adam: null, layla: { mood: "excited", message: "All five powers - report time!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Golden or risky - you can tell!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His map room - shred that trail map!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the golden trail shine!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, ranger!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Trail Ranger badge earned!" }, layla: null }, // completion
  },
};

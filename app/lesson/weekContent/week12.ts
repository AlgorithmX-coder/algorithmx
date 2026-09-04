import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

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

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[12] },

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

      // SIGNATURE: The Trail Planner (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "trailPlanner",
        title: "The Trail Planner",
        narration: {
          speaker: "adam",
          lines: [
            "[warmly] Use your finger to draw a trail in the snow.",
            "Then watch the hound read every track you left.",
            "Keep your trail small and safe, hero.",
          ],
        },
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
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#a8e4ff",
    theme: {
      topic: "Digital Footprint",
      motifs: ["📍", "👀", "🔍", "🌍", "🏷️", "⭐", "📱", "🔒"],
    },
    intro: {
      slug: "quiz-w12-intro",
      text: "Sniff sniff... fresh prints, leading right to my quiz stand! I've read a thousand trails, little ranger. Yours smells... beatable!",
    },
    victory: {
      slug: "quiz-w12-victory",
      text: "My map, my sniffing, my whole trail-reading business... useless! Go on then, stamp your gold everywhere. I can't STAND glitter!",
    },
    questions: [
      {
        phaseId: "phase-w12-c1",
        key: "quiz-w12-c1-1",
        label: "Tracks in the Snow",
        ask: {
          slug: "quiz-w12-ask-c1-1",
          text: "You searched 'best dinosaur jokes', giggled twice, and closed the tab without posting a thing. Track or no track?",
        },
        options: [
          { text: "Track, searches print even when I post nothing" },
          { text: "No track, closing the tab wipes it clean" },
          { text: "Half a track, it fades away by tomorrow" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Searches print too!",
          explanation: "Closing the tab puts the jokes away, but the search engine kept your question, plus when you asked it, and tracks don't fade by tomorrow. Every search presses a print, posted or not.",
        },
        villainRight: {
          slug: "quiz-w12-right-c1-1",
          text: "Even your JOKES leave prints?! Stop knowing my favorite secret!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c1-1",
          text: "Closed the tab, wiped the snow? Ho ho, the snow remembers EVERYTHING!",
        },
      },
      {
        phaseId: "phase-w12-c2",
        key: "quiz-w12-c2-1",
        label: "The Snowball Problem",
        ask: {
          slug: "quiz-w12-ask-c2-1",
          text: "You sent ONE photo to just ONE friend. How many copies of it exist now?",
        },
        options: [
          { text: "More than one: mine, my friend's, and the app kept one too" },
          { text: "Exactly one, on my friend's phone" },
          { text: "Zero, sending moves a photo instead of copying it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Count ALL the copies!",
          explanation: "Sending doesn't move a photo, it copies it. One stays at your end, one lands at your friend's end, and the app kept one too. Shared once means stored more than once.",
        },
        villainRight: {
          slug: "quiz-w12-right-c2-1",
          text: "You counted the app's copy TOO?! Nobody ever counts the app's copy!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c2-1",
          text: "One little copy, all alone? Keep believing that while they multiply!",
        },
      },
      {
        phaseId: "phase-w12-c3",
        key: "quiz-w12-c3-1",
        label: "The Future-Self Mirror",
        ask: {
          slug: "quiz-w12-ask-c3-1",
          text: "You lost the final and your thumbs are already typing a rage-post about the ref. Mirror check: what does future-you say?",
        },
        options: [
          { text: "Skip it, the anger melts by morning, the track stays" },
          { text: "Post it, you can delete it once you calm down" },
          { text: "Post it, being right makes it a golden track" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The fume melts, the track doesn't!",
          explanation: "By breakfast you won't even mean it anymore, but deleting later only cleans YOUR snow, and being right doesn't make an angry post golden. One mirror look first: will future-me smile at this?",
        },
        villainRight: {
          slug: "quiz-w12-right-c3-1",
          text: "You mirror-checked my rage bait?! It marinated in fury ALL day!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c3-1",
          text: "Post it hot! Angry tracks press deepest, and I read them with popcorn!",
        },
      },
      {
        phaseId: "phase-w12-c4",
        key: "quiz-w12-c4-1",
        label: "Stamp It Gold",
        ask: {
          slug: "quiz-w12-ask-c4-1",
          text: "Your team won on penalties! Which post stamps the win GOLD?",
        },
        options: [
          { text: "'What a save, Jaya, champions!'" },
          { text: "'We won! Their goalie is terrible, ha!'" },
          { text: "'We won, no thanks to our slowpoke defenders'" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Win it kind!",
          explanation: "A win posted loud and mean, at the other team or your own, turns a golden day into a stain. Proud AND kind is the champion stamp, and it gleams for years.",
        },
        villainRight: {
          slug: "quiz-w12-right-c4-1",
          text: "Kind AND proud?! That post is so golden it hurt my eyes!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c4-1",
          text: "Boast it loud and mean! A stained win reads deliciously from up here!",
        },
      },
      {
        phaseId: "phase-w12-c5",
        key: "quiz-w12-c5-1",
        label: "Read Your Trail",
        ask: {
          slug: "quiz-w12-ask-c5-1",
          text: "A trail check with your grown-up finds a bio: 'Age 8, Northside Elementary, class 3B.' What kind of track is that?",
        },
        options: [
          { text: "Pointy, it aims a stranger straight at me, tidy it" },
          { text: "Golden, it helps real friends find me" },
          { text: "Neither, bios don't count as tracks" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "That bio is pointy!",
          explanation: "Real friends already know where to find you, so a bio doesn't need your school, and bios print just like posts do. Name plus age plus school points a stranger straight at you. Tidy it with a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w12-right-c5-1",
          text: "You called the bio pointy?! I had that trail memorized in one sniff!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c5-1",
          text: "Name, age, school, all on one line! It's a menu, and I'm starving!",
        },
      },
      {
        phaseId: "phase-w12-c1",
        key: "quiz-w12-c1-2",
        label: "Tracks in the Snow",
        ask: {
          slug: "quiz-w12-ask-c1-2",
          text: "You tap one tiny heart on a puppy video. Half a second, barely a touch. What got written down?",
        },
        options: [
          { text: "A track, the app noted 'this kid loves puppies'" },
          { text: "Nothing, likes are too small to save" },
          { text: "Just the puppy's name, nothing about me" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "No tap is too tiny!",
          explanation: "Half a second still prints. The app wrote down what you liked and uses it to pick what you see next. Likes aren't really about the puppy, they're about YOU.",
        },
        villainRight: {
          slug: "quiz-w12-right-c1-2",
          text: "Half a second and it STILL counts?! Who leaked the lamp?!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c1-2",
          text: "Too small to save! Sure! And I definitely don't collect crumbs!",
        },
      },
      {
        phaseId: "phase-w12-c2",
        key: "quiz-w12-c2-2",
        label: "The Snowball Problem",
        ask: {
          slug: "quiz-w12-ask-c2-2",
          text: "An embarrassing post got shared around, so you delete it. What did delete actually do?",
        },
        options: [
          { text: "Cleaned MY snow only, the copies keep rolling" },
          { text: "Wiped it from everywhere at once" },
          { text: "Turned all the copies into blank pictures" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Delete cleans only your snow!",
          explanation: "Your post disappears from YOUR page, but every copy that already rolled keeps rolling where your broom can't reach. That's why the thinking happens BEFORE the post.",
        },
        villainRight: {
          slug: "quiz-w12-right-c2-2",
          text: "You knew the broom stops at your own snow?! My favorite loophole, exposed!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c2-2",
          text: "Deleted from everywhere, poof! ...except the seventeen hills it already rolled over!",
        },
      },
      {
        phaseId: "phase-w12-c3",
        key: "quiz-w12-c3-2",
        label: "The Future-Self Mirror",
        ask: {
          slug: "quiz-w12-ask-c3-2",
          text: "The CRINGE CHALLENGE is everywhere: post your most embarrassing moment! Everyone in class is doing it. Ranger call?",
        },
        options: [
          { text: "Skip it, trends melt by Friday, tracks don't" },
          { text: "Join in, a track everyone else has too is safe" },
          { text: "Join in, then delete it when the trend ends" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Trends melt, tracks stay!",
          explanation: "By Friday nobody remembers the challenge, but the embarrassing post waits in the snow, and deleting won't catch the copies. 'Everyone's doing it' just means everyone pressed a track, it doesn't protect yours.",
        },
        villainRight: {
          slug: "quiz-w12-right-c3-2",
          text: "You skipped the cringe challenge?! But EVERYONE was rolling in it!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c3-2",
          text: "Join the trend, press the track! Next year's nickname, courtesy of me!",
        },
      },
      {
        phaseId: "phase-w12-c4",
        key: "quiz-w12-c4-2",
        label: "Stamp It Gold",
        ask: {
          slug: "quiz-w12-ask-c4-2",
          text: "Two videos on your camera roll: your rocket-build hitting the ceiling, and your brother mid-tantrum (SO funny). Which goes out?",
        },
        options: [
          { text: "The rocket, my proud build is my track to press" },
          { text: "The tantrum, funny tracks get the most likes" },
          { text: "Both, more tracks means more gold" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "His worst moment isn't your track!",
          explanation: "Funny likes fade fast, but a tantrum video trips your brother for years, and 'more tracks' was never the goal, better ones are. Press YOUR proud build, that's the golden print.",
        },
        villainRight: {
          slug: "quiz-w12-right-c4-2",
          text: "The rocket over the tantrum?! Tantrums get premium giggles!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c4-2",
          text: "Press his worst moment! Trip hazards in other people's snow, delightful!",
        },
      },
      {
        phaseId: "phase-w12-c5",
        key: "quiz-w12-c5-2",
        label: "Read Your Trail",
        ask: {
          slug: "quiz-w12-ask-c5-2",
          text: "Your username is your real name plus your birth year. What does a ranger do about it?",
        },
        options: [
          { text: "Pick a made-up name with my grown-up, that one's pointy" },
          { text: "Keep it, a true name is more honest than a fake one" },
          { text: "Keep it, usernames aren't part of my trail" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Make the name point nowhere!",
          explanation: "Honest is for people, usernames are just labels, and a label with your real name and birth year stamps itself onto every track you leave. A made-up name keeps the trail yours.",
        },
        villainRight: {
          slug: "quiz-w12-right-c5-2",
          text: "A made-up name?! Now every print reads 'somebody somewhere'! Useless!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c5-2",
          text: "Real name, real year, stamped on every track! My map fills itself!",
        },
      },
      {
        phaseId: "phase-w12-c1",
        key: "quiz-w12-c1-3",
        label: "Tracks in the Snow",
        ask: {
          slug: "quiz-w12-ask-c1-3",
          text: "You type 'cool video!' under someone else's clip. Where does that track live?",
        },
        options: [
          { text: "On their page, with my name stitched to it" },
          { text: "Only on my own phone, where I typed it" },
          { text: "Nowhere, comments melt when the video ends" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Comments live in other snow!",
          explanation: "Your words went onto somebody else's page with your name stitched on, and they stay there long after the video ends. Comments are tracks you press in other people's snow.",
        },
        villainRight: {
          slug: "quiz-w12-right-c1-3",
          text: "You know your words live on THEIR page?! My comment collection is leaking!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c1-3",
          text: "Melted when the video ended? Comments are forever, signed and dated!",
        },
      },
      {
        phaseId: "phase-w12-c2",
        key: "quiz-w12-c2-3",
        label: "The Snowball Problem",
        ask: {
          slug: "quiz-w12-ask-c2-3",
          text: "A friend sends you an embarrassing video of another kid: 'forward it to everyone!' What does a ranger know?",
        },
        options: [
          { text: "Don't roll it, once it's out no broom catches every copy" },
          { text: "Forward it, then delete it if the kid minds" },
          { text: "Forward it to just one person, that's only one copy" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Don't roll it at all!",
          explanation: "One forward makes copies, each copy can copy again, and deleting later never catches them. 'Just one person' is how every blizzard starts. The kind move is not rolling someone's worst moment at all.",
        },
        villainRight: {
          slug: "quiz-w12-right-c2-3",
          text: "You didn't roll it?! One forward and it was mine by lunchtime!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c2-3",
          text: "Roll it, roll it! One forward each and by Friday it's a blizzard!",
        },
      },
      {
        phaseId: "phase-w12-c3",
        key: "quiz-w12-c3-3",
        label: "The Future-Self Mirror",
        ask: {
          slug: "quiz-w12-ask-c3-3",
          text: "You filmed your unbelievable three-floor marble-run, a lift, a loop, everything. Post it or not?",
        },
        options: [
          { text: "Post it proudly, that's a track future-me grins at" },
          { text: "Never post, every track is a risk" },
          { text: "Post it, but say a friend built it, just in case" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Golden tracks belong out there!",
          explanation: "The snow isn't lava, and fibbing about your own build just presses a weird track. A proud, kind post is exactly what the snow is FOR. Skip the rage-posts, keep the marble-runs.",
        },
        villainRight: {
          slug: "quiz-w12-right-c3-3",
          text: "You posted your build ON PURPOSE?! Confident trails are unreadable!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c3-3",
          text: "No proud tracks, or fibbed ones! A trail with no shine suits me fine!",
        },
      },
      {
        phaseId: "phase-w12-c4",
        key: "quiz-w12-c4-3",
        label: "Stamp It Gold",
        ask: {
          slug: "quiz-w12-ask-c4-3",
          text: "A mean meme about Sam is rolling around the group chat. Which stamp is the golden one?",
        },
        options: [
          { text: "'Not cool, Sam's our friend'" },
          { text: "Send Sam a private 'ignore them' and stay quiet in the chat" },
          { text: "Forward it with 'so mean lol' so everyone knows it's bad" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Stand up, don't pass it on!",
          explanation: "Forwarding a mean meme rolls it onward, even with 'so mean' written on it, and a quiet chat lets it keep rolling too. Five brave words, 'Not cool, Sam's our friend', are the brightest gold there is.",
        },
        villainRight: {
          slug: "quiz-w12-right-c4-3",
          text: "You stood up IN the chat?! Gold that bright shows up from space!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c4-3",
          text: "Pass it on or hush it up, the snowball rolls either way! Wheee!",
        },
      },
      {
        phaseId: "phase-w12-c5",
        key: "quiz-w12-c5-3",
        label: "Read Your Trail",
        ask: {
          slug: "quiz-w12-ask-c5-3",
          text: "Scanning your trail you find a dragon drawing signed 'E'... and a caption with your Friday park time. What's the call?",
        },
        options: [
          { text: "Tidy the park caption, keep the dragon gleaming" },
          { text: "Delete both, a clean trail is the safest trail" },
          { text: "Keep both, nobody reads old captions" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Tidy the pointy, keep the gold!",
          explanation: "A where-and-when on repeat is a map a stranger can read, so that caption gets tidied with a trusted grown-up. The dragon shows your spark and points at nobody. Rangers never scrub the gold.",
        },
        villainRight: {
          slug: "quiz-w12-right-c5-3",
          text: "You kept the dragon and scrubbed the park time?! Precision tidying! Revolting!",
        },
        villainWrong: {
          slug: "quiz-w12-wrong-c5-3",
          text: "A schedule pressed in the snow! I do love a trail that plans ahead for me!",
        },
      },
    ],
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

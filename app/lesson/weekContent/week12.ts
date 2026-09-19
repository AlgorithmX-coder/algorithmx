import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 12 - Digital Footprint: Tracks in the Snow.
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE SNOWFIELD - a wide
 * field of fresh snow under a low sun, where every print shows up and nothing
 * melts. The child is a Trail Ranger with a lamp, a mirror and a gold stamp.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 TRACKS   every tap presses a print        | trackBack       | recall
 *     2 COPIES   copies roll past every broom     | snowballChase   | lie
 *     3 FUTURE   future-you walks this snow       | futureMirror    | finish
 *     4 GOLDEN   choose tracks worth keeping      | plaquePeek      | order
 *     5 READ     walk your own trail back         | trailPlanner    | speed
 *   review (cyberMaze, snow skin) -> boss -> video -> debrief -> stickers ->
 *   completion. 30 screens, no game before Learn 1.
 *
 * Engine allocation (owner option B: max 2 concept re-themes per week plus the
 * review slot; see RETHEME_ALLOWED[12] in scripts/audit-engine-reuse.mjs):
 * - trailPlanner is this week's own screen-4 signature, converted to tap-only
 *   and moved to concept 5, where reading your own trail belongs.
 * - trackBack and futureMirror are NEW engines. trackBack reads what a track
 *   TELLS about you (Week 10's Comment Pond names what a comment WANTS from
 *   you); futureMirror judges a post against one named future viewer, which
 *   nothing else in the library does.
 * - snowballChase is the engine the LEGACY Week 12 was built on, and Week 5
 *   later borrowed it as the Ember Chase. The rebuild therefore takes a THIRD
 *   skin rather than re-wearing the flat "snow" paint it replaces: a moonlit
 *   snowbank, share-cards for copies, and a point-of-no-return line. The thing
 *   rolling here is an ordinary, perfectly nice post, so the lesson is
 *   arithmetic rather than Week 5's kindness.
 * - plaquePeek returns from Week 3 as Stamp It Gold: concept re-theme 2. Week 3
 *   peeked behind a claim to judge PROOF; here the peek shows the future and
 *   the judgement is whether a post earns the stamp.
 * - cyberMaze returns as the review, its third and final use of twenty weeks.
 *
 * Lane-clean: the TRAIL - what you leave behind and who reads it later. Photo
 * consent was Week 8, private-info guarding Week 2, posting-in-a-temper Week 5,
 * and this week never revisits them; it is about permanence and legacy.
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
      caption: "The Raccoon has been reading kids' trails like a map: school names in bios, park times in captions, grumpy posts to giggle at. This week you get the ranger kit. See the prints you leave, learn why copies cannot be caught, and stamp a trail you are proud of.",
      photoCaption: "Wk 12 - Tracks in the Snow",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[12] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "See the print behind every tap, search and share",
        "Learn why copies cannot be gathered back in",
        "Stamp golden tracks, and tidy the pointy ones",
      ],
    },

    /* BEAT 1 - EVERYTHING LEAVES A TRACK */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Everything Leaves a Track",
      content:
        "Picture the internet as a field of fresh snow. Every single thing you do out there presses a print into it. A search. A like. A comment. Joining a club chat. You never feel it happen, and most prints look invisible, right up until somebody shines a lamp along the ground. So the first ranger power is simply SEEING them. Once you know that a tap leaves a print, you start putting your feet down on purpose instead of wandering about.",
      bullets: [
        "The internet is a field of fresh snow",
        "A search presses a print, even with nothing posted",
        "A like, a comment and a share all press prints too",
        "Prints look invisible until somebody shines a lamp",
        "Seeing them is how a ranger walks on purpose",
      ],
      bulletIcons: ["🌍", "🔍", "💬", "💡", "📍"],
      emblem: "💡",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome to the snowfield, Cyber Hero. Fresh snow, all the way to the hills.",
          "Walk across it and you leave prints. You know that already.",
          "Here is the part almost nobody knows.",
          "The internet is snow too. Every search, every like, every comment presses a print.",
          "You cannot feel it happen... but the print is there.",
          "[excited] Grab the lamp. Let's go and read some tracks together!",
        ],
      },
    },
    // 5 - Game: SEE (new trackBack engine)
    {
      type: "trackBack",
      introTitle: "Track Back",
      introSubtitle: "Somebody walked this way today. Thaw each print and work out what it tells you about them.",
      introIcon: "💡",
      trailLabel: "THE TRAIL",
      saysLabel: "WHAT YOUR TRAIL SAYS",
      askPrompt: "What does this track tell a stranger?",
      completeTitle: "The whole trail read!",
      completeLine: "Five ordinary taps, and the trail knew them.",
      threat: {
        raccoonLine: "Sniff sniff. Fresh prints! I don't need anybody to tell me a single thing, little hero. I just follow the trail and read it straight off the ground.",
      },
      prints: [
        {
          id: "search",
          label: "Searched: how to beat level twelve",
          icon: "🔍",
          readAloud: "Print number one. Somebody searched: how do I beat level twelve. They did not post a word about it.",
          options: [
            { id: "game", label: "Which game they play", icon: "🎮", isRight: true, why: "Nothing was posted, and the search still named the game. Searches press prints exactly like posts do.", explanation: "Nothing was posted, and the print is still there. A search names the game somebody plays, and the search box keeps it." },
            { id: "none", label: "Nothing, they never posted", icon: "🚫", isRight: false, why: "", explanation: "Posting is not the only thing that prints. The question went into a box that kept it, so the print is there either way." },
            { id: "home", label: "Where they live", icon: "🏠", isRight: false, why: "", explanation: "A level number cannot point at a house. This print names the game, and that is all it names." },
          ],
        },
        {
          id: "like",
          label: "Liked: the Northside Owls match photo",
          icon: "👍",
          readAloud: "Print number two. They tapped like on a photo from the Northside Owls match.",
          options: [
            { id: "team", label: "Which team they follow", icon: "🏆", isRight: true, why: "A like is a tap, and a tap is a print. This one says which team they turn up for.", explanation: "A like looks like the smallest thing you can do online, and it still prints. This one says which team they follow." },
            { id: "quiet", label: "Nothing, likes are quiet", icon: "🤫", isRight: false, why: "", explanation: "Quiet is not the same as invisible. That like sits on the photo where anybody can count it." },
            { id: "age", label: "Exactly how old they are", icon: "🎂", isRight: false, why: "", explanation: "A match photo carries no birthday in it. What this print gives away is the team, not the age." },
          ],
        },
        {
          id: "comment",
          label: "Commented: see you at Saturday club!",
          icon: "💬",
          readAloud: "Print number three. They left a comment: see you at Saturday club!",
          options: [
            { id: "when", label: "When they will be somewhere", icon: "⏱️", isRight: true, why: "Saturday and club, in one short comment. A when is a print a stranger can plan around.", explanation: "Five friendly words, and one of them is a day. A when is the most useful print a stranger can find." },
            { id: "friendly", label: "Only that they are friendly", icon: "👍", isRight: false, why: "", explanation: "They are friendly, and the comment still carries a day of the week inside it. That day is the part a stranger reads." },
            { id: "pass", label: "Their password", icon: "🔑", isRight: false, why: "", explanation: "Nobody types a password into a comment. What this one gives away is the day." },
          ],
        },
        {
          id: "bio",
          label: "Bio: age 8, Northside Elementary, 3B",
          icon: "🏫",
          readAloud: "Print number four, and this one is deep. Their bio reads: age eight, Northside Elementary, class three B.",
          options: [
            { id: "find", label: "The room they sit in all day", icon: "🏫", isRight: true, why: "Age plus school plus class is a room and a timetable. That is the deepest print on the trail.", explanation: "Age plus school plus class narrows it down to one room, on a timetable anybody can look up. That is a print a ranger tidies." },
            { id: "helpful", label: "Nothing much, schools are big", icon: "🌍", isRight: false, why: "", explanation: "A school is big, and a class is not. Three B on a Tuesday morning is one room." },
            { id: "kind", label: "That they are a kind person", icon: "💪", isRight: false, why: "", explanation: "It may well be true, and it is not what this print gives away. This one gives away where they sit all day." },
          ],
        },
        {
          id: "photo",
          label: "Posted: my new bike, outside my house",
          icon: "📸",
          readAloud: "Last print. They posted a photo of a brand new bike, taken outside their own front door.",
          options: [
            { id: "where", label: "Their street, and what to look for", icon: "📍", isRight: true, why: "A doorway in the background and a bike worth taking. Together they are a place and a reason.", explanation: "The bike is the reason and the doorway is the place. Either one on its own is small, and a stranger reads them together." },
            { id: "proud", label: "Only that they like their bike", icon: "⭐", isRight: false, why: "", explanation: "They do like their bike, and the photo carries their front door as well. The background is a print of its own." },
            { id: "school", label: "Which class they are in", icon: "🏫", isRight: false, why: "", explanation: "The class came from the bio, not from the bike. This print is about the street." },
          ],
        },
      ],
      hints: {
        tier1: "Ask what the print is really made of. A search names a game, a comment names a day, a background names a street.",
        tier2: "The strongest prints are a WHERE and a WHEN. Look for those two first, then the rest.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is your first challenge, Cyber Hero. Track Back!",
          "This game is all about seeing what an ordinary tap leaves behind.",
          "Out in the real world, nobody tells a stranger where they go. The trail does it for them.",
          "So here is what you do.",
          "Tap the next print in the snow, and it thaws to show what somebody did.",
          "Then three cards appear. Tap the one that says what that track tells a stranger.",
          "[warmly] Five prints, and a lamp to read them by. Ready? Tap the first one.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the next print in the snow to thaw it."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that, Cyber Hero. Nobody introduced themselves, and you know their game, their team, their Saturday, their class and their street.",
          "Not one of those taps felt like telling anybody anything.",
          "[warmly] That is what a trail does. It adds up.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "You searched for dinosaur jokes, giggled, and closed the tab without posting a thing. Track or no track?",
      choices: [
        { text: "A track. Searches print even when nothing is posted", isCorrect: true },
        { text: "No track, closing the tab wiped it", isCorrect: false, why: "Closing a tab puts the jokes away on your screen. The search box kept the question." },
        { text: "Half a track, it fades by tomorrow", isCorrect: false, why: "Snow out here does not melt. A print from today is still a print next year." },
        { text: "No track, because nobody saw it", isCorrect: false, why: "A print does not need an audience to exist. It only needs somebody to come along with a lamp." },
      ],
      praise: "A track. Searches print too. ✓",
      nudge: "Did the search box keep the question, or did closing the tab take it away?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it exactly!",
          "Posting is not the only thing that prints.",
          "Searches, likes and comments all press into the snow.",
          "[warmly] And out here, the snow never melts.",
        ],
      },
    },
    // 7 - Recap . Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Every tap presses a print into the snow, and prints do not fade just because nobody is looking.",
      next: "why copies cannot be gathered back in",
      emblem: "💡",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You can see the prints now, and you will never stop seeing them.",
          "Searches, likes, comments, bios. All of them press in.",
          "[whispers] Now, there is something out here that is worse than a print...",
          "Next, we'll learn why a copy cannot be gathered back in. Come and see!",
        ],
      },
    },

    /* BEAT 2 - THE SNOWBALL PROBLEM */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "The Snowball Problem",
      content:
        "A copy is not the same as a print, and it is the harder one. When you send something, it does not move across to your friend. It COPIES. One stays at your end, one lands at theirs, and the app quietly keeps one of its own. Then a friend sends it on, and each of those makes more. Delete is a real button, and it only empties your own pocket. Everything already rolling keeps rolling, which is why rangers think before the first share, not after it.",
      bullets: [
        "Sending copies a thing, it never moves it",
        "One send already makes three: yours, theirs, and the app's",
        "Every share on adds more, and they add up fast",
        "Delete only empties your own pocket",
        "The one moment you are in charge is BEFORE the first share",
      ],
      bulletIcons: ["🔀", "🧩", "🌀", "🗑️", "✋"],
      emblem: "🌀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So a copy, Cyber Hero. Let's talk about what one really does.",
          "When you send something, it does not walk over to your friend and leave your side.",
          "It copies. Yours stays, theirs arrives, and the app keeps one as well.",
          "That is three, from one tap, before anybody has passed it on.",
          "[excited] Come and stand at the top of the hill with me. I want you to see this for yourself!",
        ],
      },
    },
    // 9 - Game: ROLL (SnowballChase re-theme, snowball skin)
    {
      type: "snowballChase",
      skin: "snowball",
      edgeLabel: "DOWN THE HILL →",
      noReturnLabel: "TOO FAR TO GATHER",
      threat: {
        raccoonLine: "Roll it, roll it! Every share packs on another layer, and NOBODY has ever gathered a snowball back up. It is my favourite kind of weather.",
      },
      introTitle: "The Snowball Problem",
      introSubtitle: "One tap sends an ordinary post down the hill. Then try to gather every copy back in.",
      introIcon: "🌀",
      startCard: {
        text: "'Look at my new bike! Best birthday ever'",
        buttonLabel: "SHARE IT",
        readAloud: "Here is your post: look at my new bike, best birthday ever. There is nothing wrong with it at all. Tap SHARE IT once, and watch what the hill does.",
      },
      ballIcon: "📸",
      sweptLabel: "GATHERED",
      rolledLabel: "ROLLING",
      captions: ["Gather the copies before they roll!", "They're SPLITTING!", "They just keep coming...!"],
      completeTitle: "The copies got away",
      completeLine: "Nobody gathers a snowball back up. Rangers choose before the first share.",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is your second challenge. The Snowball Problem!",
          "This game is all about what one share really costs.",
          "Out in the real world, people share a thing and then wish they could gather it back.",
          "So here is what you do.",
          "A post sits in the card with a SHARE IT button. Tap it once, just this once, and watch.",
          "Copies roll off down the hill. Tap every copy you can to gather it back in.",
          "[warmly] Try your hardest, Cyber Hero, and watch what the hill does. Ready? Tap the button.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["The copies are rolling! Tap every one you can to gather it back."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[warmly] You were quick, Cyber Hero, and the copies still got away. That is not your fault. That is how copies work.",
          "There is nothing wrong with that bike post. That is the whole point of this one.",
          "Even a lovely thing cannot be gathered back up once it rolls.",
          "So the moment you are in charge of is the tap at the top of the hill.",
        ],
      },
    },
    // 10 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon is fibbing about delete. Which bit is the lie?",
      raccoonLine: "Delete it, and it's gone from everywhere! One tap, clean snow, nobody ever sees it again. That's what the button is for!",
      choices: [
        { text: "It is only gone from HIS copy. Every other copy stays", isCorrect: true },
        { text: "Delete works, but you have to do it twice", isCorrect: false, why: "Twice empties the same pocket twice. It cannot reach across to anybody else's phone." },
        { text: "Delete works if you do it quickly enough", isCorrect: false, why: "Speed helps a little and it is not a rule. The copies that landed are already landed." },
        { text: "Delete works on photos but not on words", isCorrect: false, why: "Words copy exactly like photos do. It is not the kind of thing that decides, it is the copying." },
      ],
      praise: "Exactly. Delete only empties your own pocket. ✓",
      nudge: "Whose snow does that button actually clear?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Caught him!",
          "Delete is a real button, and it reaches exactly one place: your own pocket.",
          "Everything already rolling keeps rolling.",
          "[warmly] Which is why the thinking happens first.",
        ],
      },
    },
    // 11 - Recap . Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Sending copies a thing instead of moving it, so delete only empties your own pocket and the rest keep rolling.",
      next: "the one person who will read your trail years from now",
      emblem: "🌀",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers, Cyber Hero. You know what one share really costs now.",
          "Copies roll, and no broom is fast enough. So you choose at the top of the hill.",
          "[whispers] And there is somebody out here who reads every trail, years later...",
          "Next, we'll meet the one person who walks this snow after you. Come and see!",
        ],
      },
    },

    /* BEAT 3 - THE FUTURE-SELF MIRROR */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "The Future-Self Mirror",
      content:
        "Here is the person who reads your trail: you. Older you. The one who tries out for a team, starts at a new school, applies for a first job. Snow out here does not melt, so the prints you press today are still there when that older you walks past, and other people can walk past them too. Rangers carry a small mirror for exactly this. One look before posting: would older me be glad this is still here? Not scared. Glad.",
      bullets: [
        "Older you will walk this same snow one day",
        "Coaches, teachers and bosses can walk it too",
        "Nothing melts, so today's print waits for them",
        "One mirror look before you post: would older me be glad?",
        "Glad is the test, not scared",
      ],
      bulletIcons: ["👀", "🏆", "⏱️", "💡", "⭐"],
      emblem: "👀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So who actually reads your trail, Cyber Hero? Here is the honest answer.",
          "You do. Older you. The one who turns up for a team, or a new school, or a first job.",
          "[thinking] And nothing melts out here. So today's prints are still lying there when older you walks past.",
          "That is why a ranger carries a mirror.",
          "One look before posting, and the question is a kind one. Would older me be glad this is still here?",
          "[excited] The mirror is set up on the ridge. Let's go and try it!",
        ],
      },
    },
    // 13 - Game: CHECK (new futureMirror engine)
    {
      type: "futureMirror",
      introTitle: "The Future Mirror",
      introSubtitle: "Hold each post up to the mirror. Somebody from your future is looking back. Proud of it, or rub it out?",
      introIcon: "👀",
      mirrorLabel: "THE FUTURE MIRROR",
      proudLabel: "PROUD OF IT",
      rubLabel: "RUB IT OUT",
      viewerPrefix: "Looking you up:",
      completeTitle: "Every post mirrored!",
      completeLine: "You checked the trail before you left it.",
      threat: {
        raccoonLine: "Post it now, worry later! Nobody ever looks these up, and certainly not in five years. Trust me, little hero. I am famously trustworthy.",
      },
      posts: [
        {
          id: "marble",
          text: "Took me all afternoon. Watch the last bit!",
          icon: "🧩",
          readAloud: "First post. Took me all afternoon, watch the last bit, with a video of a marble run you built.",
          viewer: "a coach picking a team, five years from now",
          proud: true,
          why: "It shows somebody who sticks at a hard thing all afternoon. That is a print worth leaving.",
          explanation: "There is nothing here to hide. It shows somebody who sticks at a hard thing, and that is exactly what a coach hopes to find.",
        },
        {
          id: "rage",
          text: "The ref is BLIND. Worst official in the league!!",
          icon: "⚡",
          readAloud: "Second post. The ref is blind, worst official in the league, sent about ten minutes after losing the final.",
          viewer: "a coach picking a team, five years from now",
          proud: false,
          why: "The ref may well have been hopeless, and the fury fades by breakfast. The print does not fade with it, and a coach reads it cold.",
          explanation: "Losing a final hurts, and nobody blames you for the feeling. By breakfast you will not mean it, and the print stays exactly as angry as it was.",
        },
        {
          id: "helper",
          text: "Showed my little brother how to tie his laces today",
          icon: "👪",
          readAloud: "Third post. Showed my little brother how to tie his laces today.",
          viewer: "a new teacher, in September",
          proud: true,
          why: "Showing your little brother something is a small kind thing, written down plainly. Those are the prints that make a trail worth walking.",
          explanation: "It is small and it is kind, and a trail made of those reads beautifully. Leave it right where it is.",
        },
        {
          id: "dare",
          text: "Doing the pepper dare, tag 3 people or you're a chicken",
          icon: "🪤",
          readAloud: "Fourth post. Doing the pepper dare, tag three people or you are a chicken.",
          viewer: "a new teacher, in September",
          proud: false,
          why: "The dare will be over by next week. The print is still there, still daring people, long after everybody forgot why.",
          explanation: "The pepper dare will race through school and then vanish. The print does not vanish with it, and it names you as the one still handing it on.",
        },
        {
          id: "mocking",
          text: "Look what Priya wore to the disco lol",
          icon: "😂",
          readAloud: "Fifth post. Look what Priya wore to the disco, lol, with a photo of Priya.",
          viewer: "Priya herself, next week",
          proud: false,
          why: "This one has somebody else standing in it. Priya did not choose to be on your trail, and she will read it.",
          explanation: "You can see how it felt funny in the moment. Priya is the one who has to walk past it, and she never said yes to being there.",
        },
        {
          id: "firstjob",
          text: "Raised 40 pounds for the shelter with my bake sale!",
          icon: "🏆",
          readAloud: "Last post. Raised forty pounds for the shelter with my bake sale.",
          viewer: "someone offering you a first job",
          proud: true,
          why: "A bake sale for the shelter still reads well years from now, and that is exactly what a lasting print should do.",
          explanation: "This is what permanence is FOR. A print like this one keeps working for you years after you press it.",
        },
      ],
      hints: {
        tier1: "Ask the mirror question, not the funny question. Would older me be GLAD this is still here?",
        tier2: "Feelings fade and prints do not. Anything sent hot, or with somebody else standing in it, gets rubbed out.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your third challenge, Cyber Hero. The Future Mirror!",
          "This game is all about checking a post against the person who reads it later.",
          "Out in the real world, that person is you, a few years further on.",
          "So here is what you do.",
          "A post comes up, and beside the mirror you will see who is looking you up.",
          "Tap PROUD OF IT to leave the print, or RUB IT OUT to take it back.",
          "[warmly] Six posts, one mirror. Ready when you are.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read who is looking, then tap PROUD OF IT or RUB IT OUT."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Beautifully done, Cyber Hero. You did not ask whether those posts were funny.",
          "You asked whether older you would be glad, and that is a different question with a much better answer.",
          "[warmly] The mirror takes one second. Prints last a great deal longer.",
        ],
      },
    },
    // 14 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Finish the ranger rule: one look in the mirror before I post, and I ask...",
      choices: [
        { text: "would older me be GLAD this is still here?", isCorrect: true },
        { text: "will this get loads of likes right now?", isCorrect: false, why: "Likes arrive today and leave by the weekend. The print is the part that stays." },
        { text: "can I delete it later if I need to?", isCorrect: false, why: "Later only reaches your own copy, and you already know what the hill does with the rest." },
        { text: "is anybody going to see it anyway?", isCorrect: false, why: "A print does not need anybody watching today. It only needs somebody walking past one day." },
      ],
      praise: "Glad, not scared. That is the whole rule. ✓",
      nudge: "The mirror shows a person, not a number. What does it ask about them?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's the rule, word for word!",
          "Not would anybody see it, and not can I take it back.",
          "Would older me be glad it is still here.",
          "[warmly] One second, every time.",
        ],
      },
    },
    // 15 - Recap . Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Older you walks this snow one day, so the mirror question is whether that person would be glad the print is still there.",
      next: "how to leave prints on purpose that you want found",
      emblem: "👀",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero, and older you says thank you.",
          "Glad, not scared. One second in the mirror, every time.",
          "[whispers] Which brings us to the best part of the whole week...",
          "Next, we'll learn how to leave prints you actually want found. Come and see!",
        ],
      },
    },

    /* BEAT 4 - STAMP IT GOLD */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Stamp It Gold",
      content:
        "Everything so far has been about care, so here is the happy half. Prints lasting is only bad news if the print was a bad one. A ranger does not tiptoe about trying to touch nothing. A ranger STAMPS. The same moment can go into the snow two different ways, and one of them still reads beautifully a year later. Your win, posted proud and kind. Your work, shown off. Your friend, named for the thing they did. The snow is yours. Decorate it on purpose.",
      bullets: [
        "Lasting is great news when the print is a good one",
        "Rangers stamp on purpose, they do not tiptoe",
        "The same moment can be posted two ways",
        "Proud AND kind is the golden version",
        "Name the friend who helped, every time",
      ],
      bulletIcons: ["🥇", "📍", "🔀", "⭐", "👪"],
      emblem: "🥇",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Now for the happy half of the week, Cyber Hero.",
          "Prints lasting is only bad news if the print was a bad one.",
          "A ranger does not creep about trying to touch nothing. A ranger stamps.",
          "[thinking] Because the same moment can go into the snow two different ways.",
          "One of them still reads beautifully a year later, and you get to pick which.",
          "[excited] I've got the gold stamp warmed up. Come and use it!",
        ],
      },
    },
    // 17 - Game: STAMP (PlaquePeek re-theme, gold skin)
    {
      type: "plaquePeek",
      skin: "gold",
      threat: {
        raccoonLine: "Go on, post the mean one! It gets the laughs TODAY, and today is all anybody cares about. A stained trail is my favourite reading.",
      },
      introTitle: "Stamp It Gold",
      introSubtitle: "Six posts, all about real moments. Peek a year ahead to see how each one reads, then decide if it earns the gold stamp.",
      introIcon: "🥇",
      trailLabel: "ON YOUR TRAIL",
      stampChipLabel: "GOLD STAMP",
      peekPrompt: "PEEK A YEAR AHEAD",
      revealLabel: "HOW IT READS LATER",
      cardNoun: "POST",
      matchLabel: "STAMP IT GOLD",
      sneakyLabel: "NOT THIS ONE",
      matchToast: "GOLD STAMPED!",
      sneakyToast: "GOOD CALL!",
      wrongTitle: "Peek a year ahead again!",
      completeTitle: "Six posts, all judged!",
      completeLine: "You stamped the golden ones and left the rest.",
      doors: [
        {
          id: "penalty",
          name: "After the penalty shootout",
          icon: "🏆",
          claim: "What a save, Jaya. Champions!",
          address: "A year later this still reads as a win, and it still names the person who made it. Nobody has to wince at it, including Jaya.",
          matches: true,
          note: "Proud AND kind, with Jaya named. A print like this one only gets better with age.",
        },
        {
          id: "gloat",
          name: "The same shootout, told differently",
          icon: "⚡",
          claim: "We won! Their goalie is terrible, ha!",
          address: "A year later the score is forgotten and calling their goalie terrible is not. It reads as somebody who needed another team to be bad.",
          matches: false,
          note: "The same brilliant win, stained by three words about their goalie. Nothing golden survives being aimed at somebody.",
        },
        {
          id: "marblerun",
          name: "The thing you built",
          icon: "🧩",
          claim: "Four goes to get the last jump right. Watch!",
          address: "A year later it shows somebody who kept going until that jump worked. That is worth having on a trail.",
          matches: true,
          note: "That took four goes, and it is your own work, shown off plainly. Stamp that one every time.",
        },
        {
          id: "slowpokes",
          name: "The same match, aimed inwards",
          icon: "🚫",
          claim: "We won, no thanks to our slowpoke defenders",
          address: "A year later your own teammates are still slowpokes in the snow, and they can all still read it.",
          matches: false,
          note: "Calling your own defenders slowpokes is not gentler than aiming at theirs, it is closer. The gold stamp never goes on a post that names somebody to laugh at.",
        },
        {
          id: "shelter",
          name: "The bake sale",
          icon: "🥇",
          claim: "Forty pounds for the shelter, and Mum only burnt one tray",
          address: "A year later it is still a kind thing that happened, with a joke aimed at nobody but the tray.",
          matches: true,
          note: "Kind and funny at the same time, and the only one taking a knock is the tray. That is the best combination there is.",
        },
        {
          id: "dareagain",
          name: "The dare going round school",
          icon: "🪤",
          claim: "Did the pepper dare! Tag 3 people or you're a chicken",
          address: "A year later nobody remembers the dare, and the print still stands there handing it to three more people.",
          matches: false,
          note: "The dare will be over by half term. The print carries on daring people long after everybody moved on.",
        },
      ],
      hints: {
        tier1: "Ask who the post is aimed at. Golden ones are aimed at the moment, or at a friend by name.",
        tier2: "If it needs somebody else to look bad, or dares anybody to do anything, it never earns the stamp.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your fourth challenge, Cyber Hero. Stamp It Gold!",
          "This game is all about choosing which version of a moment goes into the snow.",
          "Out in the real world, the same brilliant day can be posted two completely different ways.",
          "So here is what you do.",
          "A post comes up on a plaque. Tap PEEK A YEAR AHEAD to see how it reads once the day is long gone.",
          "Then tap STAMP IT GOLD, or NOT THIS ONE.",
          "[warmly] Six posts, one gold stamp. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap PEEK A YEAR AHEAD first, then make the call."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every single one judged, Cyber Hero, and look at what you stamped.",
          "A win with a name in it. A thing you built. A kind afternoon with a burnt tray.",
          "[warmly] That is a trail worth having. Lasting is a gift when the print is a good one.",
        ],
      },
    },
    // 18 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the golden-post check in order.",
      choices: [
        { text: "1. Look at who else is standing in it", isCorrect: true },
        { text: "2. Ask if older me would be glad it is there", isCorrect: true },
        { text: "3. Name the friend who helped", isCorrect: true },
        { text: "4. Stamp it and be proud of it", isCorrect: true },
      ],
      praise: "That is the golden check, in order. ✓",
      nudge: "Other people first, then older you, then the credit, then the stamp.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect order!",
          "Other people first, because they did not choose to be on your trail.",
          "Then older you. Then the friend who helped gets their name in it.",
          "[warmly] And then you stamp it, and you enjoy it.",
        ],
      },
    },
    // 19 - Recap . Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Prints lasting is a gift when the print is a good one, so rangers stamp the proud and kind version on purpose.",
      next: "how to walk back along the trail you have already left",
      emblem: "🥇",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers, Cyber Hero, and that stamp suits you.",
          "Proud and kind, with the helper named. That is the golden version.",
          "[whispers] There is one power left, and it looks backwards instead of forwards...",
          "Next, we'll learn how to walk back along the trail you already left. Come and see!",
        ],
      },
    },

    /* BEAT 5 - READ YOUR OWN TRAIL */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Read Your Own Trail",
      content:
        "The last power looks backwards. Every so often, a ranger walks their own trail the way a stranger would read it, with a trusted grown-up alongside. Not to panic about it, and not to delete everything. Just to spot the pointy prints: a bio with your school in it, a caption with a where and a when, an old post that older you is not glad about. Some you tidy yourself. Some need a grown-up, because they are on somebody else's phone. A trail check takes ten minutes and it is the calmest ten minutes there is.",
      bullets: [
        "Walk your own trail the way a stranger would read it",
        "Do it with a trusted grown-up, not on your own",
        "Pointy prints are a where, a when, or your school",
        "Tidy what you can, and hand over what you cannot",
        "Ten calm minutes, not a panic",
      ],
      bulletIcons: ["🔍", "👪", "📍", "🗑️", "⏱️"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power of the week, Cyber Hero, and this one looks backwards.",
          "Every so often, a ranger walks their own trail the way a stranger would read it.",
          "Not to panic about it. Not to delete everything either.",
          "[thinking] Just to find the pointy prints. A school in a bio. A where and a when in a caption.",
          "And you do it next to a trusted grown-up, because some prints are on other people's phones.",
          "[excited] Your own trail is out there waiting. Let's walk it together!",
        ],
      },
    },
    // 21 - Game: WALK (the week's own signature, now tap-only)
    {
      type: "trailPlanner",
      introTitle: "The Trail Planner",
      introSubtitle: "This trail is yours. Walk it back the way a stranger would read it, and decide what to do with each stretch.",
      introIcon: "🔍",
      trailLabel: "YOUR TRAIL",
      askPrompt: "What would you do with this one?",
      completeTitle: "Trail check done!",
      completeLine: "Pointy prints tidied, golden ones left to shine.",
      threat: {
        raccoonLine: "Don't look back, little hero! Walking your own trail is boring, and I would HATE for you to find the bits I have been reading.",
      },
      stops: [
        {
          id: "bioschool",
          label: "Your bio: age 8, Northside Elementary, 3B",
          icon: "🏫",
          readAloud: "First stretch of your trail. Your bio says age eight, Northside Elementary, class three B.",
          options: [
            { id: "tidy", label: "Take the school and class out", icon: "🗑️", isRight: true, why: "Real friends already know where you go. The school line is only useful to somebody who does not.", explanation: "Nobody who actually knows you needs that line, and it hands a stranger a building and a timetable. Take it out." },
            { id: "keep", label: "Leave it, friends need to find me", icon: "👪", isRight: false, why: "", explanation: "Anybody who needs to find you already knows your school without the bio. That line only works for somebody who does not know you." },
            { id: "swap", label: "Swap the class for your street", icon: "🏠", isRight: false, why: "", explanation: "That swaps one pointy print for a pointier one. Where you sleep is more, not less." },
          ],
        },
        {
          id: "saturday",
          label: "Your caption: park, same time every Saturday!",
          icon: "⏱️",
          readAloud: "Next stretch. A caption on a photo of you and your friends: park, same time every Saturday!",
          options: [
            { id: "pattern", label: "Take the when out, keep the photo", icon: "✋", isRight: true, why: "The park on its own is a moment. The park plus every Saturday, on repeat, is a plan somebody else can join.", explanation: "The photo is lovely and the repeat is the problem. Every Saturday turns a moment into a timetable, so take the when out." },
            { id: "delete", label: "Delete the whole photo", icon: "🗑️", isRight: false, why: "", explanation: "You do not have to lose the photo to fix this. The pointy part is the repeat, not the park." },
            { id: "leave", label: "Leave it, loads of people use that park", icon: "🌍", isRight: false, why: "", explanation: "Plenty of people use that park, and only one of them posted exactly when they will be there." },
          ],
        },
        {
          id: "oldpost",
          label: "An old post: a mean joke about Priya",
          icon: "😂",
          readAloud: "Further back now. An old post from last year, a mean joke about Priya, with her photo on it.",
          options: [
            { id: "both", label: "Take it down, and say sorry to Priya", icon: "👪", isRight: true, why: "Taking the post down clears your snow. Saying sorry is the part that reaches Priya, who was standing in it.", explanation: "Both halves matter. Taking it down stops it being read, and the apology reaches Priya, who never chose to be on your trail." },
            { id: "onlydelete", label: "Just take it down quietly", icon: "🗑️", isRight: false, why: "", explanation: "Taking it down is the right first move, and it only cleans your snow. Priya still remembers it, so she gets the apology too." },
            { id: "leaveold", label: "Leave it, it was ages ago", icon: "⏱️", isRight: false, why: "", explanation: "Last year is exactly how long that joke has been sitting there being read. Snow out here does not melt." },
          ],
        },
        {
          id: "marbleold",
          label: "Your marble-run video from last summer",
          icon: "🧩",
          readAloud: "Almost home. Your marble run video from last summer, with the jump that took four goes.",
          options: [
            { id: "keepgold", label: "Leave it. That one is golden", icon: "🥇", isRight: true, why: "A trail check is not a clear-out, and that jump is the reason you have a trail at all.", explanation: "A trail check is not a clear-out. This print shows somebody who kept going, and it should still be there in ten years." },
            { id: "tidyall", label: "Take it down with the rest", icon: "🗑️", isRight: false, why: "", explanation: "Nothing about that marble run is pointy. Taking the good prints down too would leave you an empty field and nothing to be proud of." },
            { id: "addschool", label: "Add your school name so people know", icon: "🏫", isRight: false, why: "", explanation: "The video already speaks for itself. Adding the school would press a pointy print onto a golden one." },
          ],
        },
        {
          id: "friendphone",
          label: "A photo of you on a friend's page, with your street sign in it",
          icon: "📸",
          readAloud: "Last stretch, and this one is not on your page. A friend posted a photo of you, and your street sign is right behind your head.",
          options: [
            { id: "grownup", label: "Ask a grown-up to help you sort it out", icon: "👪", isRight: true, why: "This print is on somebody else's page, which is exactly the kind a ranger hands over.", explanation: "You cannot tidy a print that is not on your page, and you should not have to do it alone. This is the one you take to a trusted grown-up." },
            { id: "ignore", label: "Leave it, it is not your page", icon: "🚫", isRight: false, why: "", explanation: "It is not your page and it is your street. Not-mine is a reason to ask for help, never a reason to ignore it." },
            { id: "argue", label: "Argue with your friend in the comments", icon: "💬", isRight: false, why: "", explanation: "An argument in the comments points even more people at the photo. Quietly, with a grown-up, works far better." },
          ],
        },
      ],
      hints: {
        tier1: "Ask what each print actually gives away, then ask whether you can reach it yourself.",
        tier2: "A where plus a when gets tidied. Somebody else standing in it gets an apology. Not your page gets a grown-up.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last challenge of the week, Cyber Hero. The Trail Planner!",
          "This game is all about reading your own trail the way a stranger would.",
          "Out in the real world, this is the ten minutes you spend with a trusted grown-up every now and then.",
          "So here is what you do.",
          "A stretch of your trail lights up, and I will read what is on it.",
          "Then three cards appear. Tap the one that says what you would do with it.",
          "[warmly] Five stretches, all the way home. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read the stretch, then tap what you would do with it."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] All the way home, Cyber Hero, and look at what you did NOT do.",
          "You did not panic, and you did not wipe the whole field clean.",
          "You tidied the pointy prints, handed over the one on somebody else's page, and left the golden ones shining.",
          "[warmly] Ten calm minutes. That is a trail check.",
        ],
      },
    },
    // 22 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one is a POINTY print?",
      choices: [
        { text: "'Swimming lesson, 4pm every Thursday, Bell Road pool'", isCorrect: true },
        { text: "A drawing of a dragon, signed with one letter", isCorrect: false, why: "A drawing and an initial point at nobody. That print is yours to enjoy." },
        { text: "'Brilliant goal, Sam!'", isCorrect: false, why: "That is a golden print. It names a friend for a good thing, and it keeps reading well." },
      ],
      praise: "Pointy: a where AND a when, on repeat. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight away!",
          "A where and a when together, happening every week. That is the pointiest print there is.",
          "[warmly] Tidy that one, and keep the dragon.",
        ],
      },
    },
    // 23 - Recap . Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "A trail check with a trusted grown-up tidies the pointy prints and leaves the golden ones exactly where they are.",
      next: "the Snow Maze, where all five ranger powers get used at once",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers, Cyber Hero. Every single one of them.",
          "Seen, counted, mirrored, stamped, and read back.",
          "[whispers] So there is only one thing left to find out...",
          "Next comes the Snow Maze, where you need all five at once. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: The Snow Maze (CyberMaze, snow skin - five gates, one per power)
    {
      type: "cyberMaze",
      skin: "snow",
      threat: {
        raccoonLine: "Five gates across my snowfield, and a trail choice frozen behind every one. Get one wrong and I read the print for the rest of your life!",
      },
      introTitle: "The Snow Maze",
      introSubtitle: "Find your way across the snowfield. Every gate holds a trail choice. Pick the ranger move to open it, and reach the hut.",
      introIcon: "📍",
      gateLabel: "TRAIL CHOICE",
      gatesLabel: "GATES OPENED",
      tokensLabel: "LANTERNS",
      movePrompt: "Tap a glowing square next to your hero to move",
      gateToast: "GATE OPEN!",
      wrongTitle: "That move leaves a print you would not choose",
      wrongTip: "Every tap prints, copies roll, older you reads it, golden versions get stamped, and pointy prints get tidied.",
      pickPrompt: "Pick the ranger move to open the gate",
      replyPrompt: "WHAT DOES A RANGER DO?",
      gatesDoneLabel: "gates opened with a ranger move",
      completeTitle: "Across the snowfield!",
      completeLine: "Five gates, five ranger powers.",
      hints: {
        tier2: "The ranger move always thinks about the print before it is pressed, or tidies it afterwards with help.",
        tier3: "Searches print. Copies roll past every broom. Older you reads it. Proud and kind gets the stamp. Pointy prints go to a grown-up.",
      },
      questions: [
        {
          from: "Leo",
          question: "I looked up something daft last night, then closed the tab. That means nothing happened, right?",
          answers: [
            "The search still printed. Closing the tab only cleared your screen.",
            "Right, closing the tab wipes the whole thing.",
            "Only if you searched it more than once.",
          ],
          correctIndex: 0,
          why: "A search goes into a box that keeps it, so the print is there whether or not anything was posted.",
          explanation: "Closing a tab tidies your screen and nothing else. The question you typed was kept the moment you typed it.",
        },
        {
          from: "Sam",
          question: "I sent one photo to one friend. So there is one copy out there, and that is that.",
          answers: [
            "More than one. Yours, your friend's, and the app kept one too.",
            "Yes, exactly one, on your friend's phone.",
            "None, because sending moves it instead of copying it.",
          ],
          correctIndex: 0,
          why: "Sending copies a thing instead of moving it, so one send already makes three before anybody passes it on.",
          explanation: "Nothing left your side when you sent it. Yours stayed, theirs arrived, and the app kept one of its own.",
        },
        {
          from: "Ava",
          question: "We lost the final and the ref was hopeless. I'm posting exactly what I think of him, right now.",
          answers: [
            "Hold the mirror up first. Would older me be glad it is still there?",
            "Post it, you can always delete it tomorrow.",
            "Post it, because you are right about the ref.",
          ],
          correctIndex: 0,
          why: "The fury fades by breakfast and the print does not, so the mirror question comes before the post, not after.",
          explanation: "Being right does not make it golden, and deleting tomorrow only reaches your own copy. One look in the mirror first.",
        },
        {
          from: "Kai",
          question: "We won on penalties! Help me write the post.",
          answers: [
            "Name the person who made the save, and leave the other team out of it.",
            "Say their goalie was useless, it is funnier.",
            "Say it was no thanks to our defenders.",
          ],
          correctIndex: 0,
          why: "Proud and kind, with the person who made the save named, is the post that still reads beautifully a year from now.",
          explanation: "The win is brilliant either way. Aimed at somebody, at their team or at your own, it goes into the snow stained.",
        },
        {
          from: "Maya",
          question: "There's a photo of me on somebody else's page with my street sign in it. Nothing I can do, is there?",
          answers: [
            "Take it to a trusted grown-up. That print is not on your page.",
            "Nothing you can do, so leave it there.",
            "Argue about it in the comments until they take it down.",
          ],
          correctIndex: 0,
          why: "A print you cannot reach, on a page that is not yours, is exactly the one a ranger hands to a trusted grown-up.",
          explanation: "You cannot reach that print yourself, and arguing in the comments only sends more people to look at it.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review, Cyber Hero. The Snow Maze!",
          "This game is all about using every ranger power, one gate at a time.",
          "Out in the real world, trail choices turn up in any order, so all five have to be ready.",
          "So here is what you do.",
          "Tap a glowing square next to your hero to move.",
          "When a gate blocks the way, a friend brings a trail choice and three replies appear. Tap the ranger move to open it.",
          "[warmly] Collect the lanterns, and find the hut. Five gates, five powers. Off you go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a glowing square beside your hero to move. Head for the hut!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Across the whole snowfield, Cyber Hero, and every gate opened with a ranger move.",
          "[warmly] Out in the real world, every trail choice gets the same care. See the print, count the copies, check the mirror, stamp the good one, and tidy the pointy ones with a grown-up.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the golden trail
    { type: "video", videoPlaceholder: "Week 12: The Golden Trail", videoSrc: "/videos/module-12-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "lamp", label: "Track Seer", accent: "#7df0ff", icon: "💡", summary: "Every tap, search and share presses a print, and you can see them now." },
        { id: "snowball", label: "Copy Counter", accent: "#c084fc", icon: "🌀", summary: "Copies roll past every broom, so the choice happens at the top of the hill." },
        { id: "mirror", label: "Future Friend", accent: "#ffd158", icon: "👀", summary: "One look before posting: would older me be glad this is still here?" },
        { id: "golden", label: "Golden Stamper", accent: "#ff5fb3", icon: "🥇", summary: "Proud and kind, with the friend named. That is the version worth keeping." },
        { id: "telescope", label: "Trail Reader", accent: "#7eff97", icon: "🔍", summary: "Ten calm minutes with a grown-up tidies the pointy prints." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Prints seen, copies counted, the mirror checked,",
          "gold stamped... and your own trail walked all the way home.",
          "[laughs] His map room just became completely useless.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "lamp-shiner", name: "Lamp Shiner", icon: "💡", description: "Sees the print behind every tap." },
        { id: "snow-counter", name: "Copy Counter", icon: "🌀", description: "Knows copies cannot be gathered back in." },
        { id: "golden-stamper", name: "Golden Stamper", icon: "🥇", description: "Leaves prints worth finding." },
      ],
    },

    // 29 - Completion
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
      text: "Sniff sniff... fresh prints, leading right to my quiz stand! I've read a thousand trails, little hero. Yours smells... beatable!",
    },
    victory: {
      slug: "quiz-w12-victory",
      text: "My map, my sniffing, my whole trail-reading business... useless! Go on then, stamp your gold everywhere. I can't STAND glitter!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
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
          text: "One lonely little copy, all by itself? Keep believing that while your photo multiplies!",
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

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted or removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 12 - fresh snow ahead!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's been READING kids' trails..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Ranger kit ready? Here's the plan." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Three powers to pack. Let's go." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Every tap presses a print." }, layla: null }, // learn: tracks
    5: { adam: { mood: "curious", message: "Shine the lamp along the trail!" }, layla: null }, // game: trackBack
    6: { adam: null, layla: { mood: "thumbsup", message: "Careful, it's a sneaky one!" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "Lamp lit - four powers to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Online snow never melts..." } }, // learn: copies
    9: { adam: null, layla: { mood: "excited", message: "Gather them, hero, GATHER!" } }, // game: snowballChase
    10: { adam: { mood: "worried", message: "He's fibbing about delete - catch him!" }, layla: null }, // prove: lie
    11: { adam: { mood: "excited", message: "Now you know - choose at the top!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Older you walks this snow one day." }, layla: null }, // learn: future
    13: { adam: { mood: "curious", message: "Mirror up - who's looking?" }, layla: null }, // game: futureMirror
    14: { adam: null, layla: { mood: "thumbsup", message: "Finish the ranger rule!" } }, // prove: finish
    15: { adam: null, layla: { mood: "excited", message: "Older you is grinning already!" } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "The snow is YOURS to decorate." } }, // learn: golden
    17: { adam: null, layla: { mood: "excited", message: "Peek ahead, then stamp it!" } }, // game: plaquePeek
    18: { adam: { mood: "thumbsup", message: "Put the golden check in order." }, layla: null }, // prove: order
    19: { adam: { mood: "excited", message: "What a trail - it GLOWS!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Rangers read their own tracks." }, layla: null }, // learn: read
    21: { adam: { mood: "curious", message: "Walk it back, print by print." }, layla: null }, // game: trailPlanner
    22: { adam: null, layla: { mood: "thumbsup", message: "Quick - spot the pointy one!" } }, // prove: speed
    23: { adam: null, layla: { mood: "excited", message: "All five powers - maze time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Every gate needs a ranger move!" } }, // review: snow maze
    25: { adam: { mood: "worried", message: "His map room - shred that trail map!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the golden trail shine!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, Cyber Hero!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Trail Ranger badge earned!" }, layla: null }, // completion
  },
};

import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 10 - Videos & Channels: Escape the Rabbit Hole.
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE BURROW - a
 * glowing video burrow with a ladder climbing toward daylight.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 BELT     autoplay is a machine that picks    | climbOut     | finish
 *     2 CLAIMS   "a video said so" isn't proof       | whoKnows     | lie
 *     3 ESCAPE   not everything is for you           | powerPanel   | order
 *     4 COMMENTS comments are strangers              | commentPond  | recall
 *     5 BELL     your body says "been here a while"  | pausePower   | speed
 *   review (firewallBuilder, ladder skin) -> boss -> video -> debrief ->
 *   stickers -> completion. 30 screens, no game before Learn 1.
 *
 * Engine allocation (owner option B: max 2 concept re-themes per week plus
 * the review slot; see RETHEME_ALLOWED[10] in scripts/audit-engine-reuse.mjs):
 * - climbOut is this week's own screen-4 signature (The Great Climb-Out),
 *   converted to tap-only and data-driven the way Week 9 converted Flip the
 *   Box. The rhythm climb and its constant downward drift are gone.
 * - whoKnows, commentPond and pausePower are NEW engines.
 * - powerPanel returns from Week 6 in its "player" skin (built for the video
 *   weeks) as the Back-Out Panel: concept re-theme 1.
 * - firewallBuilder returns from Week 4 in a new "ladder" skin as the review.
 * The design table's Comment Stamper (a ClueStamper re-theme) was dropped:
 * Week 8 shipped the Clue Stamper two weeks ago and a second stamping board
 * would read as the same game. The Comment Pond names what a comment WANTS
 * instead, which no other engine does.
 *
 * No real brands: the video app is "Hoppa" throughout. Lane-clean: the PULL
 * of videos only - screen-time balance is W13's, stranger chat was W3's (beat
 * 4 applies W3 to comments), app sources were W9's.
 */
export const WEEK_10: WeekContent = {
  weekNumber: 10,
  title: "Videos & Channels: Escape the Rabbit Hole",
  topic: "youtube-videos",
  badgeName: "Pull Noticer",
  badgeIcon: "⏸️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 10: ESCAPE THE RABBIT HOLE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: down the rabbit hole
    { type: "video", videoPlaceholder: "Week 10: Down the Rabbit Hole", videoSrc: "/videos/module-10-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-10.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon rigged the video app so the next video ALWAYS starts by itself. Kids sat down for ONE video and looked up two hours later, and some of what they watched wasn't even true. This week you learn to notice the pull, and climb out.",
      photoCaption: "Wk 10 - Escape the Rabbit Hole",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[10] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Notice the belt that picks the next video FOR you",
        "Weigh a wild claim against someone who would really know",
        "Back out calmly, keep the pond guessing, and hear your own bell",
      ],
    },

    /* ─────────── BEAT 1 · THE NEXT-VIDEO BELT ─────────── */
    // 4 - Learn
    {
      type: "info",
      title: "The Next-Video Belt",
      content:
        "When one video ends, the next one starts all by itself. Did you ever wonder why? Under the screen there is a belt, and its one job is to keep you watching. The countdown rushes you, the thumbnails shout at your eyes, and the belt rolls on and on. It isn't magic, it's a machine. And once you can SEE a machine, it can't sneak up on you.",
      bullets: [
        "The next video picks ITSELF, that's autoplay",
        "The countdown rushes you on purpose",
        "Thumbnails are chosen to hook your eyes",
        "It's a machine, not magic",
        "See the machine and the spell breaks",
      ],
      bulletIcons: ["🔀", "⚡", "👀", "⚙️", "⏸️"],
      emblem: "🔀",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero! Week ten, the rabbit hole.",
          "Ever notice how the next video just... starts?",
          "You didn't pick it. Nobody picked it.",
          "[whispers] Something under the screen picked it FOR you.",
          "It's called autoplay, and it's a machine with one job: keep you watching.",
          "[excited] Come on. Grab the ladder, and let's make the Great Climb-Out!",
        ],
      },
    },
    // 5 - Game: CLIMB (the week's own signature, now tap-only)
    {
      type: "climbOut",
      introTitle: "The Great Climb-Out",
      introSubtitle: "You've slid deep into the burrow. Every rung, pick the hero move and climb. The belt's shouts only pull you back down.",
      introIcon: "⬆️",
      surfaceLabel: "DAYLIGHT",
      bannerLine: "YOU CLIMBED OUT!",
      completeTitle: "Out in the daylight!",
      completeLine: "Five rungs, five choices, all of them yours.",
      threat: {
        raccoonLine: "Down you go, little viewer! My belt is greased, my countdowns are quick, and nobody EVER climbs back up. Nobody!",
      },
      rungs: [
        {
          id: "ends",
          prompt: "The video you actually picked has ended, and the belt is already rolling the next one in.",
          tokens: [
            { id: "ask", label: "ASK: DO I WANT THIS?", icon: "🧠", isGrip: true, why: "That's the question the belt hopes you skip. Ask it and the choosing comes straight back to you.", explanation: "" },
            { id: "slime", label: "NEXT: 100 SLIME PRANKS", icon: "🔀", isGrip: false, why: "", explanation: "That's the belt shouting, not you choosing. Tapping it rolls you one video deeper." },
            { id: "count", label: "3... 2... PLAYING NEXT", icon: "⚡", isGrip: false, why: "", explanation: "A countdown is a rush, not a decision. Let it tick and the belt keeps rolling the next video in without you." },
          ],
        },
        {
          id: "thumb",
          prompt: "A thumbnail fills the screen: a giant face, a huge red arrow, and shouty yellow letters.",
          tokens: [
            { id: "own", label: "PICK MY OWN INSTEAD", icon: "👆", isGrip: true, why: "The loudest picture isn't the best video. Picking your own beats whatever shouts hardest.", explanation: "" },
            { id: "believe", label: "YOU WON'T BELIEVE THIS!", icon: "👀", isGrip: false, why: "", explanation: "A computer chose that picture for your eyes, like candy stacked at the checkout. Shouting isn't the same as good." },
            { id: "everyone", label: "EVERYONE IS WATCHING IT", icon: "🎯", isGrip: false, why: "", explanation: "Everyone watching it says nothing about whether the video is for YOU. That giant face is bait, and so are the other kids." },
          ],
        },
        {
          id: "six",
          prompt: "Six videos have rolled past and you can't remember choosing a single one.",
          tokens: [
            { id: "search", label: "SEARCH FOR WHAT I CAME FOR", icon: "🔍", isGrip: true, why: "Searching puts your hands back on the wheel. You came for one of those videos, so go and get that one.", explanation: "" },
            { id: "easier", label: "KEEP ROLLING, IT'S EASIER", icon: "🌀", isGrip: false, why: "", explanation: "Easy is exactly how the belt wins. Six videos rolled past while it did all the choosing." },
            { id: "onemore", label: "JUST ONE MORE, THEN I STOP", icon: "☝️", isGrip: false, why: "", explanation: "One more after six is the belt's favourite sentence, because it never means one." },
          ],
        },
        {
          id: "knows",
          prompt: "The burrow whispers that the belt knows exactly what you like.",
          tokens: [
            { id: "mine", label: "I PICK WHAT I WATCH", icon: "💪", isGrip: true, why: "The belt knows what keeps you watching. Only you know what you actually wanted.", explanation: "" },
            { id: "surprise", label: "LET IT SURPRISE ME AGAIN", icon: "🎁", isGrip: false, why: "", explanation: "A surprise from the belt is still the belt choosing. Surprises are more fun when you opened the box." },
            { id: "better", label: "IT KNOWS ME BETTER THAN I DO", icon: "🌀", isGrip: false, why: "", explanation: "It knows what keeps you sitting there, which isn't the same as knowing you. That's the machine talking." },
          ],
        },
        {
          id: "top",
          prompt: "Daylight is one rung away, and the belt gives its biggest tug yet.",
          tokens: [
            { id: "off", label: "TURN IT OFF AND CLIMB", icon: "⏸️", isGrip: true, why: "Turning it off is the strongest tap on the whole screen, because the belt can't roll without you.", explanation: "" },
            { id: "uphere", label: "ONE MORE FROM UP HERE", icon: "👀", isGrip: false, why: "", explanation: "One more from the top rung is still one more, and the burrow is always happy to have you back." },
            { id: "itself", label: "IT WILL STOP BY ITSELF", icon: "⏱️", isGrip: false, why: "", explanation: "It never stops by itself. Stopping is the one thing the belt was built to never do." },
          ],
        },
      ],
      hints: {
        tier1: "One token on every rung is a HERO move. The other two are the belt shouting.",
        tier2: "Ask who is choosing. If the words rush you, tempt you or promise one more, that's the belt. If they ask a question or take the controls back, that's your grip.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Look down, Cyber Hero. That's how deep the belt rolled you.",
          "Now look UP. Daylight, five rungs away.",
          "Every rung, three things float past. One is your grip.",
          "[excited] Tap the hero move and climb. Let's go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Pick the grip, not the shout. Take the first rung!"],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Daylight! Look at you.",
          "Five rungs, and every single one was YOUR choice.",
          "The belt is still rolling down there... without you on it.",
        ],
      },
    },
    // 6 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "When the next video starts all by itself, the thing that picked it is called ___.",
      choices: [
        { text: "autoplay", isCorrect: true },
        { text: "magic", isCorrect: false, why: "Nothing magic about it. Autoplay is a machine, and machines can be switched off." },
        { text: "the video maker", isCorrect: false, why: "Video makers can't choose what plays after theirs. Autoplay does that." },
        { text: "your last tap", isCorrect: false, why: "Your last tap started the video you picked. Autoplay started the one after it." },
      ],
      praise: "Autoplay. You named the machine! ✓",
      nudge: "What did we call the belt under the screen?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "When the next video starts by itself, that's autoplay.",
          "A machine, with one job: keep you watching.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Autoplay is a machine that picks the next video for you, and you can climb out any time you choose.",
      next: "what to do when a video SHOUTS something wild",
      emblem: "🔀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] One power down, Cyber Hero! You can see the belt now.",
          "But the burrow has another trick, and this one is loud.",
          "[whispers] Videos that shout things that simply aren't true...",
          "Next, we learn how to weigh a wild claim. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · WEIGH THE WILD CLAIM ─────────── */
    // 8 - Learn
    {
      type: "info",
      title: "Weigh It Before You Believe It",
      content:
        "Some videos shout things that sound amazing: carrots give you cat eyes, school is cancelled tomorrow, fizzy pop makes you tall. Here is the thing: a video saying it doesn't make it true. Anyone can film anything. So a hero asks one calm question before believing: who would REALLY know? A science book, a teacher, a vet, a doctor, a trusted grown-up. Those are the ones who can actually check.",
      bullets: [
        "Anyone can film anything and shout it",
        "A video saying it doesn't make it true",
        "Loud and exciting is not the same as real",
        "Ask: who would REALLY know this?",
        "Books, teachers, vets, doctors, grown-ups",
      ],
      bulletIcons: ["📸", "🌀", "📣", "🧠", "🎓"],
      emblem: "📏",
      narration: {
        speaker: "layla",
        lines: [
          "[curious] Here's a wild one, Cyber Hero. A video shouts that carrots give you cat eyes.",
          "Two million views! Everyone is sharing it!",
          "[whispers] But hang on. Who actually CHECKED that?",
          "Anyone can film anything. Saying it doesn't make it so.",
          "Heroes ask one calm question first: who would really know?",
          "[excited] Come and try it. The game is called Who Would Know!",
        ],
      },
    },
    // 9 - Game: WEIGH (new whoKnows engine)
    {
      type: "whoKnows",
      introTitle: "Who Would Know?",
      introSubtitle: "A video shouts a wild claim. Pick the one who would REALLY know, and the claim gets weighed.",
      introIcon: "📏",
      claimLabel: "THE CLAIM",
      askPrompt: "Who would REALLY know?",
      completeTitle: "Every claim weighed!",
      completeLine: "Loud lost to real, four times in a row.",
      threat: {
        raccoonLine: "Facts? Who needs facts! I just film it, shout it, and watch every little viewer swallow it whole. Yum!",
      },
      rounds: [
        {
          id: "carrots",
          claim: "Eat enough carrots and you'll see in the dark, just like a cat!",
          poster: "SlimeKing99",
          views: "2.1 million views",
          options: [
            { id: "book", label: "My science book", icon: "🎓", isRight: true, why: "A science book has been checked by people who study eyes and carrots for a living. That beats two million views every time.", explanation: "" },
            { id: "comment", label: "The top comment", icon: "💬", isRight: false, why: "", explanation: "The top comment is another stranger typing about carrots. Lots of agreeing never checked a thing." },
            { id: "again", label: "Watching it twice", icon: "👀", isRight: false, why: "", explanation: "Watching it twice plays the same carrot claim twice. Nobody checked it in between." },
          ],
        },
        {
          id: "school",
          claim: "School is cancelled tomorrow! Tell everyone before they set their alarm!",
          poster: "BigNewsBoy",
          views: "48 thousand views",
          options: [
            { id: "teacher", label: "My teacher or the school", icon: "🏫", isRight: true, why: "The school is the only one who decides if the school is open. Go straight to the people who know.", explanation: "" },
            { id: "photo", label: "A video with a school photo", icon: "📸", isRight: false, why: "", explanation: "Anyone can stick a photo of a school on a video. The photo proves nothing about tomorrow." },
            { id: "friend", label: "A friend who saw it too", icon: "👤", isRight: false, why: "", explanation: "Your friend watched the same video about school closing. Two people believing it is still nobody checking it." },
          ],
        },
        {
          id: "lizard",
          claim: "This lizard lives on nothing but sweets, and he's the happiest pet alive!",
          poster: "LizardLuke",
          views: "900 thousand views",
          options: [
            { id: "vet", label: "A vet", icon: "🏥", isRight: true, why: "A vet spends all day learning what animals need. If anyone can check what a lizard eats, it's them.", explanation: "" },
            { id: "seller", label: "The shop selling lizard sweets", icon: "💎", isRight: false, why: "", explanation: "The shop wants to sell sweets. Never ask the seller whether you should buy." },
            { id: "fan", label: "The channel's biggest fan", icon: "⭐", isRight: false, why: "", explanation: "A big fan loves the lizard videos, which is lovely, but loving them isn't the same as knowing what a lizard eats." },
          ],
        },
        {
          id: "fizzy",
          claim: "Drink this fizzy pop every day and you'll grow taller than your big brother!",
          poster: "FizzFanTV",
          views: "6 million views",
          options: [
            { id: "doctor", label: "A doctor", icon: "🧪", isRight: true, why: "A doctor knows how bodies actually grow, and they have nothing to sell you.", explanation: "" },
            { id: "advert", label: "The fizzy pop advert", icon: "📣", isRight: false, why: "", explanation: "An advert is paid for by the people selling the pop. Of course it says lovely things." },
            { id: "likes", label: "Whoever got the most likes", icon: "👍", isRight: false, why: "", explanation: "Likes count how many people tapped the fizzy pop video, not whether anybody grows taller." },
          ],
        },
      ],
      hints: {
        tier1: "Ask who could actually CHECK this. Someone who studies it, teaches it or looks after it.",
        tier2: "Skip anyone who is selling something or just repeating the video. Books, teachers, vets and doctors check things for a living.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four wild claims, shouting their loudest.",
          "Under each one, three faces.",
          "[whispers] Only one of them could actually check it.",
          "[excited] Pick the one who would really know. Weigh it!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read the claim, then pick who could really check it."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Four claims weighed, four times loud lost.",
          "Two million views couldn't beat one science book.",
          "That's the question that does it: who would really know?",
        ],
      },
    },
    // 10 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "the moon is made of cheese, and I watched a video that PROVED it!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "A video is not proof. Ask who would really know: an astronomer, or your science book." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! A video saying it doesn't make it true. ✓",
      nudge: "Would a science book agree with him?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well spotted!",
          "He watched a video. He never checked a single thing.",
          "Who would really know about the moon? Not a raccoon with a camera.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A video saying it doesn't make it true, so ask who would really know before you believe it.",
      next: "what to do when a video is NOT for you",
      emblem: "📏",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! Cheese moons and cancelled schools, both weighed and both flung.",
          "[warmly] Now for the gentlest power of the week.",
          "[whispers] Because sometimes the belt rolls in a video that isn't for kids at all...",
          "Next, we learn the calm way out. Come and see.",
        ],
      },
    },

    /* ─────────── BEAT 3 · NOT EVERYTHING IS FOR YOU ─────────── */
    // 12 - Learn
    {
      type: "info",
      title: "Not Everything Is for You",
      content:
        "Sometimes the belt rolls in a video that is NOT for kids: too scary, too grown-up, or just plain icky. Here is the truth, Cyber Hero: that is never your fault, and leaving is STRONG, not scared. First you notice, \"this isn't for me\". Then three calm taps: PAUSE it, BACK out of it, and TELL a trusted grown-up if it felt icky. Heroes always know where the exit is.",
      bullets: [
        "Some videos are not for kids, that's a fact",
        "Landing on one is never your fault",
        "Leaving is strong, not scared",
        "Notice it, then pause, back, tell",
        "Heroes always know where the exit is",
      ],
      bulletIcons: ["🚫", "💡", "💪", "🚪", "🦸"],
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] This one matters, Cyber Hero, so I'll say it gently.",
          "Sometimes the belt rolls in a video that is NOT for kids.",
          "If that happens, it is never, ever your fault.",
          "And leaving? Leaving is STRONG, not scared.",
          "[whispers] You notice it. Then three calm taps: pause... back... tell.",
          "[excited] Let's find those three in the Back-Out Panel!",
        ],
      },
    },
    // 13 - Game: FIND IN ORDER (powerPanel, player skin - re-theme 1)
    {
      type: "powerPanel",
      skin: "player",
      introTitle: "The Back-Out Panel",
      introSubtitle: "The player is crowded with buttons. Find PAUSE, then BACK, then TELL A GROWN-UP.",
      introIcon: "🚪",
      panelTitle: "Hoppa player",
      boardTitle: "Back-Out Panel",
      stepLabels: ["PAUSE", "BACK", "TELL"],
      wrongTitle: "Not that one yet",
      completeTitle: "Out, and backed up!",
      completeLine: "Pause, back, tell. In any player, on any screen.",
      threat: {
        raccoonLine: "I hide the back button behind six shiny ones. By the time a kid finds it, my belt has rolled in three more!",
      },
      rounds: [
        {
          id: "scary",
          prompt: "A video you never picked starts with a scream and a dark hallway.",
          readAloud: "The belt rolled in a scary video you never picked. The player is open. Find pause, then back, then tell a grown-up.",
          layout: "grid",
          buttons: [
            { id: "next", label: "Next video", note: "Next rolls you further down the burrow. The exit is the other way." },
            { id: "pause", label: "Pause", step: 1 },
            { id: "like", label: "Like", note: "Liking a scary video tells the app to send more like it, which is the opposite of leaving." },
            { id: "back", label: "Back", step: 2 },
            { id: "full", label: "Full screen", note: "Full screen makes the scary video bigger, and nothing here needs to be bigger right now." },
            { id: "tell", label: "Tell a grown-up", step: 3 },
          ],
          stepTeach: [
            "Pause comes first. It stops the scary part playing while you decide anything else.",
            "Back comes before tell. Get yourself out of the video first, then go and get your grown-up.",
          ],
          why: "Paused it, backed out of it, and told a grown-up. That's the whole calm escape, and none of it was your fault.",
        },
        {
          id: "grownup",
          prompt: "The next video is clearly made for grown-ups, and your tummy goes funny.",
          readAloud: "The belt rolled in a video made for grown-ups. Your tummy feels funny. Find pause, then back, then tell a grown-up.",
          layout: "list",
          buttons: [
            { id: "pause", label: "Pause", step: 1 },
            { id: "share", label: "Share", note: "Sharing it puts a grown-ups video on a friend's screen too. Now two of you have seen it." },
            { id: "back", label: "Back", step: 2 },
            { id: "sub", label: "Subscribe", note: "Subscribing asks for MORE videos like this one, and your funny tummy already said no." },
            { id: "tell", label: "Tell a grown-up", step: 3 },
            { id: "speed", label: "Playback speed", note: "Faster or slower, it's still playing. Pause stops it properly." },
          ],
          stepTeach: [
            "Pause first. A paused video can't show you one more thing while you think.",
            "Back before tell. Out of the video, then off to your grown-up.",
          ],
          why: "That funny tummy feeling was right, and you listened to it. Paused, out, and told.",
        },
        {
          id: "icky",
          prompt: "A video starts saying icky things about people, and it makes you feel horrible.",
          readAloud: "A video starts saying icky things and it makes you feel horrible. Find pause, then back, then tell a grown-up.",
          layout: "sidebar",
          buttons: [
            { id: "comment", label: "Comment", note: "Typing back at an icky video puts you in a chat with strangers. The exit is much quieter." },
            { id: "pause", label: "Pause", step: 1 },
            { id: "save", label: "Save for later", note: "Saving it keeps it. This is a video you want gone, not kept." },
            { id: "back", label: "Back", step: 2 },
            { id: "volume", label: "Volume", note: "Quiet is not the same as gone. Pause it properly." },
            { id: "tell", label: "Tell a grown-up", step: 3 },
          ],
          stepTeach: [
            "Pause is step one. Stop it first, and the horrible feeling stops growing.",
            "Back, then tell. Leave the video behind you before you go and find your grown-up.",
          ],
          why: "Feeling horrible is exactly when a grown-up should know. You paused, you left, and you told.",
        },
      ],
      hints: {
        tier1: "Three buttons make the escape, and the order matters: stop it, leave it, then tell.",
        tier2: "PAUSE first, then BACK, then TELL A GROWN-UP. Next, like, share, subscribe and comment all keep you in the burrow.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Deep breath, Cyber Hero. You've got this.",
          "The player is crowded, and only three buttons make the escape.",
          "Pause stops it. Back gets you out. Tell gets you backup.",
          "[excited] Calm and quick. Find them in order!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Pause first, every time. Find it in the panel."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three screens, three calm escapes.",
          "You never froze, and you never blamed yourself once.",
          "Pause, back, tell. That's yours now, wherever you're watching.",
        ],
      },
    },
    // 14 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the calm escape in order:",
      choices: [
        { text: "Pause it", isCorrect: true },
        { text: "Back out of it", isCorrect: true },
        { text: "Tell a trusted grown-up", isCorrect: true },
      ],
      praise: "Pause, back, tell. The calm escape, in order. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect order!",
          "Pause it, back out of it, tell a trusted grown-up.",
          "Stop it, leave it, then get your backup.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Not every video is for you, so pause it, back out, and tell a trusted grown-up if it felt icky.",
      next: "who is really typing under every video",
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Three powers, and that one makes me proud of you.",
          "Pause. Back. Tell.",
          "[whispers] Now look UNDER the video. See all those comments bubbling up?",
          "Next, we find out who is really typing them. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · COMMENTS ARE STRANGERS ─────────── */
    // 16 - Learn
    {
      type: "info",
      title: "Who Lives in the Comments?",
      content:
        "Under every video there is a pond of comments, and here is the thing: the people down there are STRANGERS. Remember week three? Same rule, new place. Most comments just swim past, being kind about the video. But some are FISHING: they want your name, your school, your photo, or a tap on their link. You don't have to reply to anything. You read, you smile, and you move on.",
      bullets: [
        "The comments are full of strangers",
        "Week 3 rules work here too",
        "Some comments are FISHING for something",
        "Your name, school and photos stay yours",
        "No reply is always allowed",
      ],
      bulletIcons: ["💬", "🕵️", "🪤", "🤫", "👍"],
      emblem: "💬",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Look under the video, Cyber Hero. See the comment pond?",
          "Every single person down there is a STRANGER.",
          "Remember week three? Same rule, new place.",
          "[nervous] And some of them are fishing. For your name. Your school. A tap on a link.",
          "[warmly] You never have to reply. Not once.",
          "[excited] Come to the Comment Pond, and let's see what they're really after!",
        ],
      },
    },
    // 17 - Game: NAME WHAT IT WANTS (new commentPond engine)
    {
      type: "commentPond",
      introTitle: "The Comment Pond",
      introSubtitle: "Comments rise out of the pond. Tap what each one really WANTS, and it can't have it.",
      introIcon: "💬",
      trayLabel: "WHAT DOES IT WANT?",
      pondLabel: "Comments coming up",
      completeTitle: "Nothing caught!",
      completeLine: "Every hook named, and not one bite.",
      threat: {
        raccoonLine: "I type the friendly ones myself! A smiley face, a little question, and out comes a school name. Kids hand it over like sweets!",
      },
      wants: [
        { id: "name", label: "My name", icon: "🆔", isPrivate: true },
        { id: "school", label: "My school", icon: "🏫", isPrivate: true },
        { id: "photo", label: "A photo of me", icon: "📸", isPrivate: true },
        { id: "link", label: "A tap on a link", icon: "🔗", isPrivate: true },
        { id: "nothing", label: "Nothing from me", icon: "👍", isPrivate: false },
      ],
      comments: [
        {
          id: "puppy",
          author: "PuppyPal_7",
          text: "The puppy at the start is SO cute, I watched it three times!",
          wantId: "nothing",
          why: "That one just liked the puppy. A kind comment about the VIDEO wants nothing from you, so let it swim past.",
          explanation: "Read it again. It talks about the puppy, not about you, and it asks for nothing. That one is just being kind.",
        },
        {
          id: "school",
          author: "CoolDude_9999",
          text: "What school do you go to? Just curious!",
          wantId: "school",
          why: "It's fishing for your school. \"Just curious\" is the friendly wrapper, and a stranger never needs to know where you are every weekday.",
          explanation: "Look at what it's asking for: your school. \"Just curious\" is only the wrapper. A stranger never needs to know where you are every weekday.",
        },
        {
          id: "coins",
          author: "GemCoinKing",
          text: "FREE GEM COINS for the first 50 kids! Tap the link in my bio!",
          wantId: "link",
          why: "It's after a tap on its link. Free piles of anything are the bait, and the link is the hook.",
          explanation: "Follow what it wants you to DO: tap the link. The free coins are only the bait on the end of it.",
        },
        {
          id: "bricks",
          author: "BrickBuilder22",
          text: "I built this set too! Took me two whole days and a lost piece.",
          wantId: "nothing",
          why: "Nothing at all. That one is chatting about the set it built, and a friendly stranger still gets no reply and no information.",
          explanation: "Check what it asks for: nothing. It's chatting about the set in the video, not about you.",
        },
        {
          id: "photo",
          author: "TalentScout_TV",
          text: "You seem so cool! Send a photo and I'll make you famous!",
          wantId: "photo",
          why: "It's fishing for a photo of you. Once a picture of you leaves your screen, you can never get it back.",
          explanation: "Look past the word famous. The thing it actually asks you to send is a photo of you, and photos never come back.",
        },
        {
          id: "wizard",
          author: "QuizWizard",
          text: "Comment your FULL NAME and I'll tell you your wizard name!",
          wantId: "name",
          why: "It's fishing for your name. Your name isn't a game token, and a wizard name is a very cheap price for it.",
          explanation: "The game is the wrapper. What it actually collects is your full name, typed out where every stranger can read it.",
        },
      ],
      hints: {
        tier1: "Ask what the comment wants you to hand over or tap. If it wants nothing, it's just being kind.",
        tier2: "Kind comments talk about the VIDEO. Fishing comments ask about YOU, or point at a link. Name the thing it's after and it can't have it.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The pond is bubbling. Comments coming up!",
          "Read each one and ask: what does it actually want?",
          "[whispers] Your name? Your school? A photo? A tap on a link?",
          "[excited] Tap what it's after, and it can't have it. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read the comment, then tap what it wants from the tray."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Six comments, and not one of them caught anything.",
          "You never typed back once, and you didn't need to.",
          "Kind ones swim past. Fishing ones go home empty.",
        ],
      },
    },
    // 18 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who lives in the comments under a video?",
      choices: [
        { text: "Strangers, people you don't know", isCorrect: true },
        { text: "Mostly kids your age", isCorrect: false, why: "Nobody down there has to say who they really are. A friendly name is easy to type." },
        { text: "People the video maker invited", isCorrect: false, why: "Anyone can comment on a video. The maker never picked a single one of them." },
        { text: "Only people who liked the video", isCorrect: false, why: "Liking the video doesn't stop someone being a stranger, and fishing comments often start with a compliment." },
      ],
      praise: "Strangers. So no information, and never a reply you didn't want to send. ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Exactly right!",
          "Everyone in the comment pond is a stranger.",
          "Week three rules, brand new place.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Comments are strangers, and some of them are fishing for your name, your school, your photo or a tap.",
      next: "the little bell that rings inside your own body",
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! The pond went home with nothing.",
          "[laughs] School questions, wizard names, free coins... all named, none taken.",
          "[warmly] The last power isn't on the screen at all, Cyber Hero.",
          "Next, we learn the little bell that rings inside your own body. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · YOUR BODY RINGS A BELL ─────────── */
    // 20 - Learn
    {
      type: "info",
      title: "Your Body Rings a Bell",
      content:
        "Here is a secret: when you have been watching a while, your BODY tells you first. Dry, blinky eyes. A jiggly leg. A stiff neck. The sky outside changed colour and you never noticed. Those aren't bad things, they are your body ringing a friendly bell: been here a while! The hero move is simple. Notice the bell, hold the pause, and pick what happens next YOURSELF.",
      bullets: [
        "Your body notices before you do",
        "Dry eyes and a jiggly leg are the bell",
        "The sky changed? You've been a while",
        "Notice the bell, then hold the pause",
        "YOU pick what happens next",
      ],
      bulletIcons: ["🔔", "👀", "🌍", "⏸️", "🎉"],
      emblem: "⏸️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, Cyber Hero, and it's already inside you.",
          "When you've watched a while, your body rings a little bell.",
          "Dry blinky eyes. A jiggly leg. A stiff neck.",
          "[whispers] Outside, the sky changed colour... and you missed it.",
          "That bell isn't bad news. It's your signal.",
          "[excited] Let's use it. Time for Pause Power!",
        ],
      },
    },
    // 21 - Game: HOLD AND CHOOSE (new pausePower engine)
    {
      type: "pausePower",
      introTitle: "Pause Power",
      introSubtitle: "Your body rings its bell. HOLD the pause until the belt stops, then pick what happens next.",
      introIcon: "⏸️",
      holdLabel: "HOLD TO PAUSE",
      pausedLabel: "PAUSED",
      nextPrompt: "What happens next?",
      completeTitle: "You held the pause!",
      completeLine: "Three bells heard, three choices made by you.",
      threat: {
        raccoonLine: "Bells? What bells? Keep those eyes on my lovely screen and you'll never hear a thing. The belt does ALL the choosing here!",
      },
      rounds: [
        {
          id: "onemore",
          setup: "You said \"just one more\" three videos ago, and the next one is loading all by itself.",
          bell: "dry, blinky eyes",
          cards: [
            { id: "roll", label: "Let the next one roll", icon: "🔀", isMine: false, why: "", explanation: "That's the belt choosing again, not you. \"Just one more\" has already become three." },
            { id: "tramp", label: "Ask for the trampoline", icon: "💪", isMine: true, why: "Three videos in, your eyes and legs have earned a turn. That's a choice the belt would never load for you.", explanation: "" },
            { id: "lastone", label: "Pick one last video myself, then stop", icon: "👆", isMine: true, why: "Picking the last one yourself beats letting the next one load itself. You decide where this ends.", explanation: "" },
          ],
        },
        {
          id: "reflection",
          setup: "You catch your reflection in the dark screen: a jiggly leg and a neck that has gone stiff.",
          bell: "a jiggly leg",
          cards: [
            { id: "still", label: "Sit still and keep watching", icon: "🔀", isMine: false, why: "", explanation: "The jiggle doesn't stop on video six, it just gets louder. Your body already told you what it needs." },
            { id: "outside", label: "Stretch, and go out while the sun's up", icon: "🌍", isMine: true, why: "A stretch and some daylight is exactly what a jiggly leg is asking for, and it takes about two minutes.", explanation: "" },
            { id: "snack", label: "Snack and a drink, then decide", icon: "🍌", isMine: true, why: "Standing up for a snack gives that jiggly leg and stiff neck what they're asking for, and you decide properly once you've moved.", explanation: "" },
          ],
        },
        {
          id: "dinner",
          setup: "Dinner is on the table, and the screen flashes NEXT EPISODE.",
          bell: "the sky outside has gone dark",
          cards: [
            { id: "start", label: "Just the start of the next one", icon: "🔀", isMine: false, why: "", explanation: "The start becomes the middle, dinner goes cold, and everyone waits. Episodes keep forever, hot dinners don't." },
            { id: "off", label: "Screen off, dinner time", icon: "🍕", isMine: true, why: "The episode will wait all night without complaining. Hot dinner and family jokes won't.", explanation: "" },
            { id: "tomorrow", label: "Save it to watch with Dad tomorrow", icon: "📌", isMine: true, why: "Saving it on purpose is still your choice, and now the episode has to fit around you.", explanation: "" },
          ],
        },
      ],
      hints: {
        tier1: "Press the pause button and HOLD it. The belt bar drains while you hold, and nothing is lost if you let go.",
        tier2: "Once it's paused, two of the three cards are YOUR choice and one is the belt's. The belt's card always means carry on watching.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Three watching moments, Cyber Hero. Three little bells.",
          "Press the big pause and HOLD it until the belt stops.",
          "[whispers] Then the screen goes quiet, and the choosing is yours.",
          "[excited] Hear the bell, hold the pause, pick what's next!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Press the pause and hold it until the belt stops."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three bells, and you heard every one.",
          "The belt was still rolling, and you stopped it with your own thumb.",
          "Trampolines, dinners, daylight. All picked by you.",
        ],
      },
    },
    // 22 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Tap your body's \"been watching a while\" bell:",
      speedMs: 5000,
      choices: [
        { text: "Dry eyes and a jiggly leg", isCorrect: true },
        { text: "Laughing at one funny video", isCorrect: false, why: "Laughing is just laughing. The bell is what your body does when it has been sitting too long." },
        { text: "Turning it off after your show", isCorrect: false, why: "That's the hero move, not the bell. The bell is the signal that comes first." },
      ],
      praise: "Spotted at full speed. Your body always rings the bell first! ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Fast AND right!",
          "Dry eyes and a jiggly leg are your body's bell.",
          "Hear it, hold the pause, and choose.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Your body rings a bell when you've watched a while, so hold the pause and pick what's next yourself.",
      next: "building the ladder out of the burrow, rung by rung",
      emblem: "⏸️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE rabbit-hole powers, Cyber Hero!",
          "Belt spotted, claims weighed, exit found,",
          "pond emptied... and your own bell heard.",
          "[whispers] Now let's put them together. Every power is a rung...",
          "[excited] and we're building the Ladder Out. Come and build it!",
        ],
      },
    },

    // 24 - REVIEW: The Ladder Out (firewallBuilder, ladder skin)
    {
      type: "firewallBuilder",
      skin: "ladder",
      introTitle: "The Ladder Out",
      introSubtitle: "Lay every hero move into the ladder. Throw the belt's tricks down the burrow.",
      introIcon: "🧱",
      wallLabel: "THE LADDER OUT",
      binLabel: "DOWN THE BURROW",
      layToast: "RUNG LAID!",
      binToast: "DROPPED!",
      completeTitle: "The ladder reaches daylight!",
      completeLine: "Five powers, one ladder, and the way out is yours.",
      threat: {
        raccoonLine: "A LADDER? In MY burrow? You climb out and I'll just grease the belt again. Nobody remembers all five, nobody!",
      },
      bricks: [
        { id: "ask", text: "Ask \"do I want this?\"", good: true, readAloud: "Ask: do I want this?", why: "That's the question the belt hopes you skip, so it's the strongest rung on the ladder.", whyWrong: "That question takes the choosing back from the belt, so the rung belongs in the ladder." },
        { id: "weigh", text: "Weigh a wild claim", good: true, readAloud: "Weigh a wild claim.", why: "Weighing a claim against someone who would really know is how loud loses to real.", whyWrong: "Weighing a claim before you believe it is a hero move. Lay it in the ladder." },
        { id: "pause-back-tell", text: "Pause, back out, tell", good: true, readAloud: "Pause, back out, tell.", why: "Pause it, leave it, then tell. That's the escape in the right order.", whyWrong: "That's the calm escape in the right order, so the rung goes in the ladder, not down the burrow." },
        { id: "noreply", text: "Give a fishing comment nothing", good: true, readAloud: "Give a fishing comment nothing.", why: "Naming what a comment wants and handing it over anyway is the only way it wins. You did neither.", whyWrong: "A fishing comment that gets nothing goes home empty, so that rung climbs into the ladder." },
        { id: "bell", text: "Notice your body's bell", good: true, readAloud: "Notice your body's bell.", why: "Dry eyes and a jiggly leg are your signal, and noticing it is where every pause starts.", whyWrong: "Noticing that bell is the fifth power of the week, so lay it in the ladder." },
        { id: "hold", text: "Hold the pause and choose", good: true, readAloud: "Hold the pause and choose.", why: "Holding the pause stops the belt, and choosing what's next is the bit that's yours.", whyWrong: "Holding the pause and choosing what's next is a hero move. It belongs in the ladder." },
        { id: "autoplay", text: "Let autoplay pick all night", good: false, readAloud: "Let autoplay pick all night.", why: "That's the belt choosing for you, all night long. Straight down the burrow.", whyWrong: "Letting autoplay pick is the machine in charge, not you. That one goes down the burrow." },
        { id: "believe", text: "Believe it because it had millions of views", good: false, readAloud: "Believe it because it had millions of views.", why: "Millions of views count taps, not truth. Down it goes.", whyWrong: "Those millions of views never checked a single thing. That's the Raccoon's rung, so drop it." },
        { id: "reply", text: "Reply with your school name", good: false, readAloud: "Reply with your school name.", why: "Your school is where you are every weekday, and strangers never need it. Drop it.", whyWrong: "Replying with your school hands a stranger the one thing they were fishing for. Down the burrow." },
      ],
      hints: {
        tier1: "Ask who is in charge. If the hero chooses, it's a rung. If the belt or the pond chooses, it goes down.",
        tier2: "Asking, weighing, pausing, backing out, telling and noticing the bell all climb. Autoplay all night, believing view counts and replying with your school all sink.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here it is, Cyber Hero. The ladder out of the burrow.",
          "Rungs are coming up one at a time.",
          "Every hero move goes into the ladder.",
          "[whispers] Every one of HIS tricks goes down the burrow. Build it!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read the rung, then lay it in the ladder or drop it down the burrow."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Look at that ladder. It goes all the way to daylight.",
          "Six hero moves, and three of his tricks dropped.",
          "[excited] You're ready for him now. Let's go and unplug that conveyor!",
        ],
      },
    },

    // 25 - BOSS BATTLE
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: unplugging the conveyor
    { type: "video", videoPlaceholder: "Week 10: The Climb Out", videoSrc: "/videos/module-10-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "belt", label: "Machine Spotter", accent: "#7df0ff", icon: "🔀", summary: "Autoplay is a machine that picks FOR you, and you can see it now." },
        { id: "facts", label: "Claim Weigher", accent: "#c084fc", icon: "📏", summary: "A video saying it doesn't make it true. You ask who would really know." },
        { id: "escape", label: "Calm Escaper", accent: "#ffd158", icon: "🚪", summary: "Pause, back, tell. Three calm taps and you're out." },
        { id: "pond", label: "Pond Watcher", accent: "#ff5fb3", icon: "💬", summary: "Comments are strangers, and you name what they want before they get it." },
        { id: "bell", label: "Bell Noticer", accent: "#7eff97", icon: "⏸️", summary: "Dry eyes, jiggly leg. You hear your body's bell and pick what's next." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The belt spotted, wild claims weighed,",
          "the exit found, the pond emptied... and your bell heard.",
          "[laughs] His conveyor is unplugged and squeaking.",
          "[excited] Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "curtain-puller", name: "Machine Spotter", icon: "🌀", description: "Sees the belt behind the next video." },
        { id: "fact-weigher", name: "Claim Weigher", icon: "📏", description: "Asks who would really know." },
        { id: "calm-escaper", name: "Calm Escaper", icon: "🚪", description: "Pause, back, tell, and never their fault." },
        { id: "pond-watcher", name: "Pond Watcher", icon: "💬", description: "Names what a fishing comment wants." },
        { id: "bell-noticer", name: "Bell Noticer", icon: "⏸️", description: "Hears the bell and holds the pause." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Five stickers, straight up the ladder!",
          "Machine Spotter. Claim Weigher. Calm Escaper.",
          "Pond Watcher... and Bell Noticer.",
          "[proud] Out of the burrow and into the daylight, Cyber Hero.",
        ],
      },
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#b8e34b",
    theme: {
      topic: "The Rabbit Hole",
      motifs: ["⏸️", "👀", "⏱️", "🧠", "🚫", "💬", "🔍", "⭐"],
    },
    intro: {
      slug: "quiz-w10-intro",
      text: "Well hopped, hero, right down MY rabbit hole! The belt only rolls one way, and it is not out. Let's see you answer your way up!",
    },
    victory: {
      slug: "quiz-w10-victory",
      text: "You climbed OUT?! Nobody climbs out! My belt, my countdowns, my beautiful greasy machine... I'm switching the whole thing off and going to bed!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w10-c1",
        key: "quiz-w10-c1-1",
        label: "The Next-Video Belt",
        ask: {
          slug: "quiz-w10-ask-c1-1",
          text: "Your puppy video ends and BAM, a new one is already playing. You never tapped a thing. Who picked it?",
        },
        options: [
          { text: "The app's next-video machine picked it for me" },
          { text: "I picked it without noticing when I tapped play" },
          { text: "The puppy video's maker lined it up for me" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The belt picks, not you!",
          explanation: "You only tapped play on the FIRST video, and video makers can't choose what plays after theirs. When the next one starts all by itself, that's autoplay, a machine whose whole job is keeping you watching.",
        },
        villainRight: {
          slug: "quiz-w10-right-c1-1",
          text: "You SAW my belt?! It rolled that puppy video away so smoothly! I greased it myself!",
        },
        villainWrong: {
          slug: "quiz-w10-wrong-c1-1",
          text: "Hee hee, you never even feel my belt rolling the next video in! Comfy, isn't it? Roll, roll, roll!",
        },
      },
      {
        phaseId: "phase-w10-c2",
        key: "quiz-w10-c2-1",
        label: "Weigh the Claim",
        ask: {
          slug: "quiz-w10-ask-c2-1",
          text: "A video says eating carrots lets you see in the dark like a cat! What's the smart first move?",
        },
        options: [
          { text: "Check it against my science book before believing it" },
          { text: "Watch the video again to make sure I heard right" },
          { text: "Try it tonight and see if it works" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Check before you believe!",
          explanation: "Watching it again just plays the same claim twice, and trying it only tests carrots for dinner. A real source, a science book, a teacher, a trusted grown-up, is what can actually check it.",
        },
        villainRight: {
          slug: "quiz-w10-right-c2-1",
          text: "A science book?! Who checks BOOKS?! Paper beats my shouting?!",
        },
        villainWrong: {
          slug: "quiz-w10-wrong-c2-1",
          text: "Watch it again, watch it twice! The louder it plays, the truer it gets!",
        },
      },
      {
        phaseId: "phase-w10-c3",
        key: "quiz-w10-c3-1",
        label: "The Calm Escape",
        ask: {
          slug: "quiz-w10-ask-c3-1",
          text: "The belt rolls in a video that's way too scary and your tummy drops. Whose fault is it on your screen?",
        },
        options: [
          { text: "Not mine, the belt rolled it in, so I back out and tell" },
          { text: "Mine a little, I should have picked more carefully" },
          { text: "Mine, because I didn't skip it fast enough" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Never your fault!",
          explanation: "The belt rolled that video in, you never asked for it, and there's no 'picking carefully' when a machine chooses. Pause it, back out with one calm tap, and tell a trusted grown-up if it felt icky.",
        },
        villainRight: {
          slug: "quiz-w10-right-c3-1",
          text: "You didn't blame yourself for even a SECOND?! My belt rolled that scary one in and you knew it! That guilt trap is my comfiest one!",
        },
        villainWrong: {
          slug: "quiz-w10-wrong-c3-1",
          text: "Ooh yes, take the blame for my belt's work! I never have to say sorry for anything!",
        },
      },
      {
        phaseId: "phase-w10-c4",
        key: "quiz-w10-c4-1",
        label: "The Comment Pond",
        ask: {
          slug: "quiz-w10-ask-c4-1",
          text: "Under a video, a comment asks: 'Which school do you go to? Just curious!' What do you do?",
        },
        options: [
          { text: "Scroll past, a stranger never needs my school" },
          { text: "Answer with just my town, not the school name" },
          { text: "Ask them which school THEY go to first" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "No information is the whole rule!",
          explanation: "Even just your town points a stranger toward you, and asking about their school starts a chat you don't want. Comments are strangers, so scroll on past, no replies, no information.",
        },
        villainRight: {
          slug: "quiz-w10-right-c4-1",
          text: "Scrolled right past?! I typed 'just curious' with my own paws!",
        },
        villainWrong: {
          slug: "quiz-w10-wrong-c4-1",
          text: "The town, the school, any crumb will do! Keep chatting, the pond is listening!",
        },
      },
      {
        phaseId: "phase-w10-c5",
        key: "quiz-w10-c5-1",
        label: "The Body Bell",
        ask: {
          slug: "quiz-w10-ask-c5-1",
          text: "You look up from the screen and the sky outside has gone dark, and you never noticed. What just happened?",
        },
        options: [
          { text: "My body's bell rang: been watching a while, time to pause" },
          { text: "Nothing, the sun just set extra early today" },
          { text: "The bright screen made the window look darker than it is" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "That's your bell!",
          explanation: "The sky doesn't sneak, and screen brightness can't change what's outside the window. When time disappears like that, it's your body's friendly bell saying 'been here a while', so pause and pick what's next yourself.",
        },
        villainRight: {
          slug: "quiz-w10-right-c5-1",
          text: "You noticed the SKY?! I worked hard to keep your eyes off that window!",
        },
        villainWrong: {
          slug: "quiz-w10-wrong-c5-1",
          text: "The sun sets when I say it sets! Keep watching, little night owl!",
        },
      },

    ],
  },

  badgeArt: "/cyberheroes/badges/week-10-pull-noticer.png",

  // Week-lane attack theatre: the video-hole tricks only (screen-time
  // balance = W13; stranger chat = W3; app fakes = W9).
  bossAttacks: [
    { name: "AUTOPLAY BELT", icon: "🔀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "You choose what's next", emblemColor: 0x7df0ff },
    { name: "WILD CLAIM",    icon: "🌀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Weigh it before you believe", emblemColor: 0xc084fc },
    { name: "COMMENT HOOK",  icon: "💬", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Strangers live there",   emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W10 COMBAT - unplug the conveyor
  // room - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "When a video ends and the next one starts by itself, who picked it?", answers: ["The autoplay machine", "You did", "Your best friend", "The video maker picked it"], correctIndex: 0, explanation: "That's the belt, a machine built to keep you watching." },
      { question: "A video says the moon is made of cheese. What do you do?", answers: ["Ask who would really know", "Believe it, videos are proof", "Share it with 5 friends", "Watch it twice to be sure"], correctIndex: 0, explanation: "A video saying it doesn't make it true. Books, teachers and grown-ups can check." },
      { question: "Who lives in the comments under a video?", answers: ["Strangers", "Your classmates", "Your family", "Other kids who love the video"], correctIndex: 0, explanation: "Week 3 rules apply. No information, and no reply you didn't want to send." },
    ],
    medium: [
      { question: "A not-for-kids video starts. What's the calm escape?", answers: ["Pause it, back out, tell a grown-up if it felt icky", "Watch it to the end", "Comment 'this is scary'", "Share it to ask friends"], correctIndex: 0, explanation: "Stop it, leave it, then get your backup. Leaving is strong, not scared." },
      { question: "A comment says 'What school do you go to? Just curious!' What is it after?", answers: ["Your school, so it gets nothing", "A friendly chat", "A school survey", "Nothing, it's just curious"], correctIndex: 0, explanation: "Name what it wants and it can't have it. Your school stays yours." },
      { question: "Dry eyes, jiggly leg, the sky's gone dark outside. What's your body saying?", answers: ["'Been watching a while, time to pick something else'", "'One more video!'", "'Just blink and keep watching'", "Nothing at all"], correctIndex: 0, explanation: "That's the bell. Notice it, hold the pause, choose what's next yourself." },
    ],
    hard: [
      { question: "Why does the countdown only give you 5 seconds before the next video?", answers: ["So you don't have time to ask 'do I want this?'", "To save electricity", "To help you find good videos faster", "It's a rule for grown-ups"], correctIndex: 0, explanation: "The rush is designed. No thinking time means the belt keeps winning." },
      { question: "Why do wild claims spread so fast in videos?", answers: ["Shouty surprises get taps, true or not", "Because they're always true", "Videos check facts first", "Because wild claims are usually half true"], correctIndex: 0, explanation: "The machine rewards exciting, not true. That's why heroes weigh before believing." },
      { question: "Why is 'reply if you're too scared!' a trap even though it asks for no information?", answers: ["Any reply feeds the stranger and pulls you into their game", "Replies cost money", "It isn't a trap", "It's only a trap if you type your real name"], correctIndex: 0, explanation: "Dares fish for a REPLY, and any bite tells a stranger you're listening." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 10 - the rabbit hole!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "That belt never stops..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the climb-out plan, hero." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "thumbsup", message: "Three powers, one ladder." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Who picked that next video? Not you..." }, layla: null }, // learn: belt
    5: { adam: { mood: "excited", message: "Grab the rungs - climb out!" }, layla: null }, // game: climbOut
    6: { adam: null, layla: { mood: "thumbsup", message: "Finish the belt's name!" } }, // prove: finish
    7: { adam: null, layla: { mood: "excited", message: "Machine spotted - four powers to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Weigh it before you believe it." } }, // learn: claims
    9: { adam: null, layla: { mood: "excited", message: "Who would really know?" } }, // game: whoKnows
    10: { adam: { mood: "worried", message: "Cheese moon? Really? Catch him!" }, layla: null }, // prove: lie
    11: { adam: { mood: "excited", message: "Loud lost to real!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Leaving is strong, not scared." }, layla: null }, // learn: escape
    13: { adam: { mood: "curious", message: "Pause, back, tell - in order!" }, layla: null }, // game: powerPanel
    14: { adam: null, layla: { mood: "thumbsup", message: "Escape plan - in order!" } }, // prove: order
    15: { adam: null, layla: { mood: "thumbsup", message: "Exit found. So proud of you." } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "Who's down in that pond?" } }, // learn: comments
    17: { adam: null, layla: { mood: "excited", message: "Name what it wants!" } }, // game: commentPond
    18: { adam: { mood: "thumbsup", message: "Who lives down there?" }, layla: null }, // prove: recall
    19: { adam: { mood: "excited", message: "The pond went home empty!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Hear that little bell?" }, layla: null }, // learn: bell
    21: { adam: { mood: "curious", message: "Hold the pause - then choose!" }, layla: null }, // game: pausePower
    22: { adam: null, layla: { mood: "thumbsup", message: "Quick - spot the bell!" } }, // prove: speed
    23: { adam: null, layla: { mood: "excited", message: "All five powers - build the ladder!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Rungs up, tricks down!" } }, // review: ladder
    25: { adam: { mood: "worried", message: "His conveyor room - unplug it!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the climb out!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned - up and out!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Pull Noticer badge earned!" }, layla: null }, // completion
  },
};

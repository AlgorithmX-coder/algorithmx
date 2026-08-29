import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 8 - Photos & Videos: Think Before You Share.
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 OUT      shared means out forever          | reveal (✉️)     | finish
 *     2 CONSENT  ask before posting people         | chooseYourPath  | recall
 *     3 CLUES    what a photo gives away           | clueBoard       | speed
 *     4 DOORS    who can actually see it           | conveyorSort ×3 | lie
 *     5 THINK    look -> think -> ask              | replyCards levers| order
 *   Consolidation (cyberScanner, Case Closed skin) -> boss
 *   (placeholder quiz boss - the bespoke W8 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: clueBoard DEBUTS here (detective corkboard, the film's
 * red-string board); conveyorSort returns 3 weeks after W5 wearing a
 * three-DOOR theatre skin (its first 3-category outing); replyCards
 * returns as brass share LEVERS (new skin, 2 choices per photo).
 * Lane-clean: photo/video sharing only - the friend-or-foe judgement was
 * W3, message scams W4, and the full footprint trail is W12's lane
 * (this week's clue lesson feeds it).
 */
export const WEEK_8: WeekContent = {
  weekNumber: 8,
  title: "Photos & Videos: Think Before You Share",
  topic: "photo-video-sharing",
  badgeName: "Photo Detective",
  badgeIcon: "🕵️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 8: THINK BEFORE YOU SHARE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the photo that ran away
    { type: "video", videoPlaceholder: "Week 8: The Runaway Photo", videoSrc: "/videos/module-08-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[8] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-08.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "A kid shared one photo with one friend. The Raccoon grabbed it and passed it on - and the school crest and street sign in the background showed strangers her school and her street, way more than she ever meant to share. This week you become a Picture Detective.",
      photoCaption: "Wk 8 - Think Before You Share",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn why a shared photo never really comes home",
        "X-ray photos for the secret clues they leak",
        "Master the hero ritual: look, think, ask",
      ],
    },

      // SIGNATURE: The Developing Tray (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "developingTray",
        title: "The Developing Tray",
        narration: {
          speaker: "adam",
          lines: [
            "[excited] A secret picture is hiding in this tray!",
            "Rub it all over with your finger to develop it.",
            "Look at the whole photo, then choose share or keep.",
          ],
        },
      },

    /* ─────────── BEAT 1 · SHARED MEANS OUT FOREVER ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Once It's Out, It's OUT",
      content:
        "Here's the biggest photo secret: DELETE only deletes YOUR copy. The moment you share a photo, copies fly off like paper pigeons - to your friend's phone, to the group chat, to the app's computers. You can't call pigeons home. That's not scary if you remember it BEFORE you share.",
      bullets: [
        "Delete only deletes YOUR copy",
        "Every share makes NEW copies",
        "Screenshots are copies you can't see",
        "The app keeps a copy too",
        "Remember the pigeons BEFORE you share",
      ],
      bulletIcons: ["🗑️", "✉️", "📱", "⚙️", "💡"],
      emblem: "✉️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Welcome back, Cyber Hero! Big photo secret today.",
          "You share a picture... and it flies off like a paper pigeon.",
          "To your friend's phone. The group chat. The app's computers.",
          "[whispers] Then you press DELETE... but only YOUR copy disappears.",
          "The pigeons are already on every rooftop.",
          "[warmly] Let's watch it happen - tap and see!",
        ],
      },
    },
    // 4 - Game: REVEAL (the Copy Pigeons - ✉️ board)
    {
      type: "reveal",
      title: "The Copy Pigeons",
      subtitle: "Tap each moment to see where the copies REALLY go.",
      boardIcon: "✉️",
      items: [
        {
          id: "delete",
          label: "The DELETE Button",
          icon: "🗑️",
          steps: [
            { icon: "📱", text: "You post a silly photo... then think better of it. DELETE!" },
            { icon: "✨", text: "Phew - it's gone! ...Isn't it?" },
            { icon: "✉️", text: "Only YOUR copy vanished. Every copy that flew off is still flying." },
          ],
          counter: "Delete empties YOUR nest - not the sky.",
        },
        {
          id: "screenshot",
          label: "The Screenshot",
          icon: "📱",
          steps: [
            { icon: "💬", text: "Your friend giggles and screenshots your photo - just to keep it." },
            { icon: "✉️", text: "CLICK. A brand-new pigeon hatches... on HER phone." },
            { icon: "👀", text: "You can't see it, reach it, or delete it. It's hers now." },
          ],
          counter: "A screenshot is a copy you can never call back.",
        },
        {
          id: "groupchat",
          label: "The Group Chat",
          icon: "💬",
          steps: [
            { icon: "✉️", text: "One tap sends your photo to the class chat - 8 friends." },
            { icon: "🌀", text: "That's not ONE copy. That's EIGHT pigeons, on eight phones." },
            { icon: "🚪", text: "And any of those eight can forward it on. And on. And on..." },
          ],
          counter: "One send = a whole flock.",
        },
        {
          id: "theapp",
          label: "The App Itself",
          icon: "⚙️",
          steps: [
            { icon: "⚙️", text: "Even the app keeps a copy on its big computers far away." },
            { icon: "🎭", text: "'Disappearing' photos too - a quick screenshot beats the timer." },
            { icon: "💡", text: "So the real power isn't delete... it's THINKING before you send." },
          ],
          counter: "The app remembers - so think first.",
        },
      ],
      finale: "Now you see every pigeon - BEFORE it flies.",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Ready to see where photos REALLY go?",
          "Tap each moment on the board...",
          "and watch the copy pigeons take off.",
          "[excited] Once you see them, you'll never unsee them!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap the DELETE button first - watch what it really does!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Once a photo is shared, it's ___.",
      choices: [
        { text: "out", isCorrect: true },
        { text: "secret", isCorrect: false },
        { text: "only yours", isCorrect: false },
        { text: "easy to delete", isCorrect: false },
      ],
      praise: "Out - like pigeons off the rooftop. You've got it! ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Delete only deletes YOUR copy - a shared photo is out forever, so think before it flies.",
      next: "whose photo is it anyway? Ask before you post people",
      emblem: "✉️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power one - unlocked!",
          "You watched the pigeons fly and DELETE grab at empty air.",
          "[warmly] Shared means out. Forever.",
          "[whispers] But what if the photo isn't just... yours?",
        ],
      },
    },

    /* ─────────── BEAT 2 · ASK BEFORE YOU POST PEOPLE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Their Face, Their Call",
      content:
        "A photo with your friend in it isn't only YOUR photo - it's their face, so it's their call too. Before you post or forward a picture of ANYONE, ask them first. And here's the flip side: if a photo of YOU goes up and you don't like it, you're allowed to say 'please take it down.' Heroes ask both ways.",
      bullets: [
        "A photo of a friend is THEIR face too",
        "Ask before you post ANYONE",
        "Sent 'just to you' is NOT yours to forward",
        "You can say 'take mine down' too",
        "Asking first is what heroes do",
      ],
      bulletIcons: ["🎭", "💬", "🤫", "✋", "⭐"],
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Quick question, hero. Your friend's face in a photo...",
          "whose is it? Theirs! So posting it is THEIR call too.",
          "Before you post or forward anyone - you ask.",
          "[whispers] Even when it's hilarious. ESPECIALLY when it's hilarious.",
          "And if a photo of YOU goes up? You can ask for it down.",
          "[excited] Three tricky moments coming - show me the ask!",
        ],
      },
    },
    // 8 - Game: DECIDE (chooseYourPath - the Ask-First Moments)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "You catch your best friend mid-sneeze - the FUNNIEST photo ever taken. Your finger hovers over 'post'...",
          choices: [
            { text: "Post it - she'll laugh... probably!", isSafe: false, consequence: "She didn't laugh. Everyone else did. 'Probably fine' isn't a yes - and now the pigeons have flown with her face." },
            { text: "Show HER first and ask", isSafe: true, consequence: "Hero move! She cracks up - and picks her superhero pose for the photo you post instead. Asking first kept it funny for BOTH of you." },
          ],
        },
        {
          setup: "Your little brother faceplants off the sofa mid-dance. You filmed it. It would get SO many laughs in the class chat.",
          choices: [
            { text: "Send it - he's just my little brother!", isSafe: false, consequence: "Little brothers have faces too! He felt laughed AT by kids he's never met. Family counts - the ask comes first, every time." },
            { text: "Ask him (and a grown-up) before sharing", isSafe: true, consequence: "Exactly right. He said 'nooo!' - so it stayed a family giggle instead of becoming the whole class's joke about him." },
          ],
        },
        {
          setup: "A friend sends you a silly just-for-you selfie. It's gold. The group chat would LOVE it.",
          choices: [
            { text: "Forward it - she sent it to me, so it's mine!", isSafe: false, consequence: "Sent TO you isn't yours to send ON. She trusted you with it - forwarding it breaks the trust and frees the pigeons." },
            { text: "Keep it - just-for-me means just-for-me", isSafe: true, consequence: "That's a real friend. A just-for-you photo stays just-for-you - HER face, HER call, always." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Three moments. Three faces that aren't yours.",
          "Each time, something will whisper 'just post it!'",
          "[whispers] That whisper is your signal to ask first.",
          "[excited] Their face, their call - show me!",
        ],
      },
    },
    // 9 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Before posting a photo of your friend, what comes FIRST?",
      choices: [
        { text: "Ask them", isCorrect: true },
        { text: "Pick a funny caption", isCorrect: false },
        { text: "Tag the whole class", isCorrect: false },
        { text: "Post fast before they see", isCorrect: false },
      ],
      praise: "Ask first - their face, their call. ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A photo of someone else is their face and their call - ask before you post, every time.",
      next: "the secret clues hiding inside every photo",
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Two powers! The ask-first rule is locked in.",
          "Sneezes, faceplants, just-for-you selfies...",
          "[laughs] not one pigeon escaped on your watch.",
          "[whispers] Now grab your magnifying glass, detective...",
        ],
      },
    },

    /* ─────────── BEAT 3 · WHAT A PHOTO GIVES AWAY ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Photos Talk",
      content:
        "Every photo says more than 'cheese!' A school crest whispers WHICH school you go to. A street sign points AT your front door. A birthday banner shouts your exact birthday. Strangers can read all of it. Real detectives check the background BEFORE the photo goes anywhere.",
      bullets: [
        "A school crest names your school",
        "A street sign points at your home",
        "A banner can shout your birthday",
        "Backgrounds talk to strangers too",
        "Detectives check BEFORE they share",
      ],
      bulletIcons: ["🏫", "📍", "🎂", "👀", "🔍"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Lean in, detective. Photos... talk.",
          "A school crest whispers which school is yours.",
          "A street sign points right at your front door.",
          "[nervous] And strangers can read every word.",
          "[warmly] So we check the background BEFORE it flies.",
          "[excited] One photo. Four clues. Pin them all to the board!",
        ],
      },
    },
    // 12 - Game: INSPECT (clueBoard DEBUT - the Picture Detective)
    {
      type: "clueBoard",
      introTitle: "The Picture Detective",
      introSubtitle: "One photo, four hidden clues. Pin every clue to the evidence board, then make the call.",
      introIcon: "🔍",
      photoTitle: "'Just a normal Saturday photo'... or is it?",
      photoIcon: "🏠",
      clues: [
        {
          id: "crest",
          icon: "🏫",
          label: "The sweater crest",
          evidence: "That school crest tells any stranger exactly WHICH school to wait outside.",
        },
        {
          id: "sign",
          icon: "📍",
          label: "The street sign",
          evidence: "'Maple Road' + the house behind you = a map straight to your front door.",
        },
        {
          id: "banner",
          icon: "🎂",
          label: "The birthday banner",
          evidence: "'HAPPY 9th BIRTHDAY!' hands over your age AND your exact birthday.",
        },
        {
          id: "nametag",
          icon: "🆔",
          label: "The name label",
          evidence: "Your name on the party bag finishes the set: name, age, school, street.",
        },
      ],
      verdict: {
        prompt: "Case check, detective: is this photo safe to share as-is?",
        options: [
          {
            text: "Share it - it's just a birthday pic!",
            isCorrect: false,
            explanation: "Look at the board: name, age, school AND street - this photo tells a stranger everything. Crop or cover the clues first.",
          },
          {
            text: "Not as-is - scrub the clues first!",
            isCorrect: true,
            explanation: "Exactly - crop the crest and sign out, then it's just a happy birthday photo.",
          },
        ],
      },
      stampText: "CASE CLOSED!",
      completeLine: "Photos talk - now you hear every word.",
      hints: {
        tier1: "Count what the board knows: name... age... school... street. Is that a safe parcel to post?",
        tier2: "Four clues = a stranger's treasure map. Scrub the clues BEFORE sharing.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your first case, Picture Detective!",
          "One happy birthday photo... four leaky clues.",
          "Tap each clue to pin its evidence to the board.",
          "[whispers] Then make the call: share it... or scrub it?",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Start anywhere - tap a clue on the photo to pin it!"],
      },
    },
    // 13 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which clue tells strangers where you LIVE?",
      speedMs: 5000,
      choices: [
        { text: "The street sign behind you", isCorrect: true },
        { text: "The birthday banner", isCorrect: false },
        { text: "The sunny sky", isCorrect: false },
      ],
      praise: "Spotted in a flash - the street sign talks loudest! ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Photos talk - crests, signs, banners and labels leak your school, home and birthday to strangers.",
      next: "the three doors every photo walks through",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers, detective!",
          "Crest, sign, banner, name tag - all pinned and busted.",
          "[warmly] Backgrounds can't sneak past you now.",
          "[whispers] Next: even a CLEAN photo needs the right door...",
        ],
      },
    },

    /* ─────────── BEAT 4 · WHO CAN ACTUALLY SEE IT ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Pick the Smallest Door",
      content:
        "Before a photo goes anywhere, ask: who ACTUALLY gets to see this? 'Whole World' means everyone, forever - including strangers. 'Friends' sounds safe... but friends can screenshot and reshare. So heroes pick the SMALLEST door that fits the photo. And some photos are PRIVATE - ones that show your body, your secrets, or anything you'd hate strangers to see. Private photos are JUST FOR ME: they go through no door at all.",
      bullets: [
        "'Whole World' = everyone, forever",
        "Friends can reshare - doors leak",
        "Pick the SMALLEST door that fits",
        "No clues in it? Bigger door is OK",
        "Private photos = JUST FOR ME, no door",
      ],
      bulletIcons: ["🌍", "🚪", "🔒", "✅", "🤫"],
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Picture a theater with three doors.",
          "A little door for friends. A middle door for school.",
          "And a HUGE door marked... whole world.",
          "[whispers] Whatever walks through a door can't walk back out.",
          "Heroes pick the smallest door - and private photos get NO door at all.",
          "[excited] The photos are lining up - be the door keeper!",
        ],
      },
    },
    // 16 - Game: SORT (conveyorSort's first 3-door outing - the Theatre of Doors)
    {
      type: "conveyorSort",
      introTitle: "The Theater of Doors",
      introSubtitle: "Each photo walks toward the doors. Send it through the SMALLEST door that fits - and remember, JUST FOR ME photos get no door at all!",
      introIcon: "🚪",
      machineLabel: "THE THEATER OF DOORS",
      chuteWord: "DOOR",
      completeTitle: "Every photo through the right door!",
      completeLine: "Smallest door that fits - and some photos get no door at all.",
      categories: [
        { id: "friends", label: "FRIENDS ONLY", icon: "👪", tone: "safe" },
        { id: "school", label: "SCHOOL ONLY", icon: "🏫", tone: "lock" },
        { id: "world", label: "WHOLE WORLD", icon: "🌍", tone: "flag" },
        { id: "justforme", label: "JUST FOR ME - no door", icon: "🤫", tone: "lock" },
      ],
      items: [
        { id: "dragon", text: "Your dragon drawing - no names, no faces", icon: "🎨", categoryId: "world", explanation: "No faces, no clues - pure art can meet the whole world!" },
        { id: "party", text: "Party photo - three friends' faces in it", icon: "🎂", categoryId: "friends", explanation: "Their faces = their call. Friends-only, and only after they said yes." },
        { id: "classproject", text: "Class volcano project - everyone in uniform", icon: "🏫", categoryId: "school", explanation: "Uniforms name your school - keep school photos inside school walls." },
        { id: "pyjamas", text: "You in pajamas doing a victory dance", icon: "🎭", categoryId: "friends", explanation: "Silly stays with friends - the whole world doesn't need your pajamas." },
        { id: "trophy", text: "Your football trophy on a plain shelf", icon: "🏆", categoryId: "world", explanation: "Just a shiny trophy - no clues, no faces. Shine on, champion!" },
        { id: "planner", text: "Homework snap - your school planner's name showing", icon: "📋", categoryId: "school", explanation: "The planner names your school - that clue stays in school." },
        { id: "sunset", text: "A sunset over the park - nobody in it", icon: "⭐", categoryId: "world", explanation: "Clouds and colors belong to everyone - share away!" },
        { id: "bedroom", text: "Silly selfie in your bedroom", icon: "🤫", categoryId: "friends", explanation: "Your bedroom is your private castle - friends-only at the very most." },
        { id: "bathtime", text: "A bath-time photo from when you were tiny", icon: "🤫", categoryId: "justforme", explanation: "Photos that show your body are private - they get NO door at all. Just for you." },
        { id: "diary", text: "A snap of your secret diary page", icon: "📋", categoryId: "justforme", explanation: "Secrets aren't for ANY door - some photos stay just for you." },
      ],
      hints: {
        tier1: "Check the photo for faces and clues first - THEN pick the smallest door that fits.",
        tier2: "Faces or private places = FRIENDS. School stuff = SCHOOL. Zero clues and zero faces = the world can see. Body photos and secrets = JUST FOR ME, no door.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Places, everyone - the photos are walking!",
          "Faces go friends-only. School things, school door.",
          "No clues at all? The world door's fine.",
          "[warmly] And private photos? NO door - just for you. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Check it for faces and clues - then tap its smallest door!"],
      },
    },
    // 17 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "your account is PRIVATE, so your photos can NEVER escape!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Private slows pigeons down - screenshots still fly. ✓",
      nudge: "Can a friend inside your 'private' door still screenshot?",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Pick the smallest door that fits - and remember even 'private' doors leak through screenshots.",
      next: "the one ritual that makes you share-proof",
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! You kept every door, door keeper.",
          "Faces to friends, school stuff to school...",
          "[laughs] and the Raccoon's 'private is magic' fib? Busted.",
          "[whispers] One last power. The biggest one.",
        ],
      },
    },

    /* ─────────── BEAT 5 · LOOK, THINK, ASK ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Look. Think. Ask.",
      content:
        "Here's the whole week in one hero ritual, three seconds long. LOOK at every corner of the photo - who's in it, what's behind them? THINK - happy for ANYONE to see this, forever? ASK - the people in it, and a grown-up if you're not sure. Look, think, ask... and only THEN let the pigeon fly.",
      bullets: [
        "LOOK at every corner first",
        "THINK: happy for anyone, forever?",
        "ASK the people in it",
        "Not sure? Ask a grown-up",
        "Three seconds saves a photo",
      ],
      bulletIcons: ["👀", "🧠", "💬", "👪", "⚡"],
      emblem: "🧠",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Time for the ritual that makes you share-proof.",
          "LOOK - every corner, every background.",
          "THINK - happy for anyone to see it, forever?",
          "ASK - the people in it, and a grown-up if unsure.",
          "[whispers] Look. Think. Ask. Three seconds.",
          "[excited] Now take the lever room - one photo at a time!",
        ],
      },
    },
    // 20 - Game: SELECT (replyCards LEVERS skin - the Share Lever)
    {
      type: "replyCards",
      skin: "levers",
      introTitle: "The Share Lever",
      introSubtitle: "One photo at a time. Run the ritual - look, think, ask - then pull SHARE IT or HOLD IT.",
      introIcon: "✋",
      pickLabel: "Pull a lever",
      roundNoun: "Photo",
      correctToast: "GOOD CALL!",
      wrongTitle: "Hold on - run the ritual again",
      completeTitle: "Lever room mastered!",
      completeLine: "Look. Think. Ask. Then - and only then - share.",
      scoreNoun: "good calls",
      rounds: [
        {
          id: "sunset",
          from: "The photo tray",
          fromIcon: "👀",
          message: "A golden sunset over the park. No people, no signs - just sky.",
          replies: [
            { text: "SHARE IT", isSafe: true, explanation: "Good call! No faces, no places, no clues - this pigeon is safe to fly." },
            { text: "HOLD IT", isSafe: false, explanation: "Look again - no faces, no places, no clues. A pure sky photo is exactly the kind that CAN fly!" },
          ],
        },
        {
          id: "sneeze",
          from: "The photo tray",
          fromIcon: "👀",
          message: "Your friend mid-sneeze - hilarious! She hasn't seen it yet.",
          replies: [
            { text: "SHARE IT", isSafe: false, explanation: "The ritual says ASK - and she hasn't even SEEN it. Her face, her call: hold it until she says yes." },
            { text: "HOLD IT", isSafe: true, explanation: "Held! Her face, her call - nothing flies until she says yes." },
          ],
        },
        {
          id: "frontdoor",
          from: "The photo tray",
          fromIcon: "👀",
          message: "The new family bike - parked by your front door, house number 42 in view.",
          replies: [
            { text: "SHARE IT", isSafe: false, explanation: "LOOK caught it: house number 42 points every stranger straight home. Crop the door out first - then maybe." },
            { text: "HOLD IT", isSafe: true, explanation: "Held! That house number points straight home - crop it out before this one ever flies." },
          ],
        },
        {
          id: "lego",
          from: "The photo tray",
          fromIcon: "👀",
          message: "Your finished LEGO castle on the kitchen table - just bricks and glory.",
          replies: [
            { text: "SHARE IT", isSafe: true, explanation: "Good call! Bricks, table, zero clues, zero faces - this one was built to be shown off." },
            { text: "HOLD IT", isSafe: false, explanation: "Think it through - bricks, table, zero clues, zero faces. This one's built to be shown off!" },
          ],
        },
        {
          id: "uniform",
          from: "The photo tray",
          fromIcon: "👀",
          message: "First-day-of-school pic - big smile, full uniform, school sign behind you.",
          replies: [
            { text: "SHARE IT", isSafe: false, explanation: "Uniform + school sign = your school, handed to strangers. That one's for family eyes, not the open internet." },
            { text: "HOLD IT", isSafe: true, explanation: "Held! Uniform and school sign name your school - family eyes only, not the open internet." },
          ],
        },
      ],
      hints: {
        tier1: "Run the ritual out loud: LOOK for faces and clues... THINK forever... ASK if it's someone else's face.",
        tier2: "Faces that haven't said yes, house numbers, school signs = HOLD IT. No clues, no faces = SHARE IT.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The lever room! Photos on the tray.",
          "Look at every corner. Think: anyone, forever?",
          "[whispers] Ask - if it's not just your face.",
          "[excited] Then pull the lever. Show me your calls!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Run look-think-ask on the first photo, then pull a lever!"],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A photo's ready to fly. Tap the hero ritual IN ORDER:",
      choices: [
        { text: "LOOK at every corner", isCorrect: true },
        { text: "THINK: anyone, forever?", isCorrect: true },
        { text: "ASK before it flies", isCorrect: true },
      ],
      praise: "Look. Think. Ask. The ritual is yours! ✓",
      nudge: "What do your EYES do before your brain gets a turn?",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Look at every corner, think 'anyone, forever?', ask the people in it - then share.",
      next: "one final case file, then the Raccoon's photo heist",
      emblem: "🧠",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE photo powers, detective!",
          "Pigeons watched, asks made, clues pinned,",
          "doors kept... and the ritual runs itself now.",
          "[whispers] One last case file to close...",
          "[excited] then we crash his photo heist for good!",
        ],
      },
    },

    // 23 - Consolidation: Case Closed (W1 scanner engine, W8 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SHARE-SMART",
        negative: "PHOTO LEAK",
        positiveHint: "Tap SHARE-SMART for the look-think-ask moves",
        negativeHint: "Tap PHOTO LEAK for flying pigeons and leaking clues",
        tipWhenPositive: "Asking first, checking corners, picking small doors - a detective's share, every one.",
        tipWhenNegative: "No-ask posts, street signs, 'delete fixes it' - those pigeons are already flying.",
        hint1: "Ask: did they LOOK, THINK and ASK... or did the photo just fly?",
        hint2: "SMART = asked first, clues checked, smallest door. LEAK = faces without a yes, home/school clues, trusting delete.",
        hint2Example: "SMART: 'She said yes to the party pic'   LEAK: 'Posted it - I can always delete!'",
        hint3: "Quick rule card: delete isn't magic · their face their call · photos talk · smallest door · look-think-ask.",
        hint3Example: "Ask first ✅    'It's just my street sign' ❌",
      },
      items: [
        { text: "Showing your friend the photo BEFORE posting it", isStrong: true, explanation: "Their face, their call - the ask-first rule in action." },
        { text: "'I'll post it now and delete it later if she minds'", isStrong: false, explanation: "Delete only catches YOUR copy - the pigeons will already be flying." },
        { text: "Cropping the street sign out before sharing", isStrong: true, explanation: "A true Picture Detective - scrub the clue, save the photo." },
        { text: "Posting your first-day uniform pic for the whole world", isStrong: false, explanation: "The crest and sign hand your school to strangers - small door only." },
        { text: "Keeping a friend's just-for-you selfie to yourself", isStrong: true, explanation: "Sent to you isn't yours to send on - trust kept, pigeons grounded." },
        { text: "Forwarding the class chat a photo nobody said yes to", isStrong: false, explanation: "Eight phones, zero asks - that's a whole flock of leaks at once." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Final case file! Sharing moments are drifting past.",
          "Tap SHARE-SMART for the look-think-ask moves...",
          "and PHOTO LEAK for flying pigeons and leaky clues.",
          "[warmly] Close the case, detective - show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W8 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the heist that fell apart
    { type: "video", videoPlaceholder: "Week 8: Case Closed", videoSrc: "/videos/module-08-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "pigeons", label: "Pigeon Eyes", accent: "#7df0ff", icon: "✉️", summary: "Shared means out forever - delete only empties YOUR nest." },
        { id: "consent", label: "Ask-First Poster", accent: "#7eff97", icon: "👪", summary: "Their face, their call - nobody gets posted without a yes." },
        { id: "clues", label: "Clue Spotter", accent: "#ffd158", icon: "🔍", summary: "Crests, signs and banners talk - you pin every leak before it flies." },
        { id: "doors", label: "Door Keeper", accent: "#c084fc", icon: "🚪", summary: "Smallest door that fits - and 'private' still leaks screenshots." },
        { id: "ritual", label: "Look-Think-Ask", accent: "#ff5fb3", icon: "🧠", summary: "Three seconds before every share - the ritual that runs itself." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered, detective!",
          "You see every pigeon before it flies,",
          "you ask before faces fly, you pin every clue,",
          "you keep the doors... and the ritual is automatic.",
          "[excited] His photo heist is CLOSED. Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "pigeon-watcher", name: "Pigeon Watcher", icon: "✉️", description: "Sees every copy before it flies." },
        { id: "clue-spotter", name: "Clue Spotter", icon: "🔍", description: "Pins every leaky clue to the board." },
        { id: "door-keeper", name: "Door Keeper", icon: "🚪", description: "Always picks the smallest door." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Week-lane attack theatre: photo/share tricks only (people-judging =
  // W3; message scams = W4; the full footprint trail = W12).
  // W8 SHOWDOWN — THE SNAPSHOT CLAW (design doc §W8: crash the photo
  // heist on the rooftop gallery). P1 shieldHold the pigeon cage ·
  // P2 tapTell the talking clue in 3 photos · P3 counterCard the sneaky
  // snap · finisher = the Golden Frame (claw grabs, finds nothing).
  bossShowdown: {
    machine: {
      name: "THE SNAPSHOT CLAW",
      tagline: "A grabby crane that snatches photos full of clues",
      art: {
        intact: "/game/bosses/w08-snapshotclaw-intact.png",
        damaged: "/game/bosses/w08-snapshotclaw-damaged.png",
        defeated: "/game/bosses/w08-snapshotclaw-defeated.png",
      },
      arena: "/game/backgrounds/w08-arena-rooftop.png",
      accent: "#7df0ff",
      glow: "rgba(125,240,255,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w08/adam-photographer-idle.png",
        attack: "/game/characters/w08/adam-photographer-attack.png",
        celebrate: "/game/characters/w08/adam-photographer-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w08/layla-photographer-idle.png",
        attack: "/game/characters/w08/layla-photographer-attack.png",
        celebrate: "/game/characters/w08/layla-photographer-celebrate.png",
      },
    },
    phases: [
      // P1 · COPY PIGEONS → SHIELD-HOLD: the SHARE gale batters the cage.
      {
        kind: "shieldHold",
        attack: 0,
        coach: "Keep every photo caged. Press and don't let go!",
        holdLabel: "HOLD THE CAGE DOOR",
        holdIcon: "🔒",
        holdSecs: 6,
        barrage: [
          "It'll get a HUNDRED likes, post it!",
          "Everyone's already sharing theirs!",
          "You can just delete it after, go on!",
          "It's only ONE photo, what's the harm?",
          "Quick, before the moment's gone!",
        ],
        burnoutLine: "The gale dropped and the cage held. Even 'delete it after' can't catch a photo once it flies, so the smart move is never letting it out. Yours stayed yours.",
      },
      // P2 · CLUE LEAK → TAP-THE-TELL: three photos, tap the talking clue.
      {
        kind: "tapTell",
        attack: 1,
        coach: "Photos TALK. Tap the clue that gives you away!",
        rounds: [
          {
            id: "crest",
            prompt: "Photo one: you cheering at your football match.",
            promptIcon: "🕵️",
            options: [
              { id: "smile", label: "Your muddy football cleats", icon: "🎉", isTell: false, note: "Muddy cleats tell nothing. Look for what NAMES a place." },
              { id: "crest", label: "The club banner: 'RIVERSIDE COLTS FC'", icon: "🏫", isTell: true, note: "" },
              { id: "pose", label: "The cloudy sky above", icon: "👀", isTell: false, note: "Sky is safe to share. Look for what NAMES a place." },
            ],
          },
          {
            id: "sign",
            prompt: "Photo two: your new puppy in the front yard.",
            promptIcon: "🔍",
            options: [
              { id: "sign", label: "The house number '12' on the door behind", icon: "📍", isTell: true, note: "" },
              { id: "bike", label: "The fluffy puppy", icon: "🚀", isTell: false, note: "The puppy gives nothing away. Find what points to your home." },
              { id: "helmet", label: "The green grass", icon: "🛡️", isTell: false, note: "Grass is everywhere. Find what points to your home." },
            ],
          },
          {
            id: "banner",
            prompt: "Photo three: your medal from Tuesday swim club.",
            promptIcon: "🎂",
            options: [
              { id: "cake", label: "Your shiny new medal", icon: "🎉", isTell: false, note: "A medal is just a medal. Find what tells a stranger WHERE to find you." },
              { id: "balloons", label: "Your swim goggles", icon: "🛡️", isTell: false, note: "Goggles say nothing about you. Find what tells a stranger WHERE to find you." },
              { id: "banner", label: "The pool schedule board: 'Tue and Thu, 4pm'", icon: "👀", isTell: true, note: "" },
            ],
          },
        ],
      },
      // P3 · SNEAKY SNAP → COUNTER-CARD.
      {
        kind: "counterCard",
        attack: 2,
        coach: "Whose face? Whose call? Tap the card!",
        situation: "At the sleepover your friend falls asleep first, mouth wide open. The others dare you to post it.",
        situationIcon: "👀",
        cards: [
          { id: "ask", label: "ASK HER FIRST, WHEN SHE'S AWAKE", icon: "💬", isRight: true, note: "" },
          { id: "post", label: "Post it, it's just a bit of fun", icon: "⚡", isRight: false, note: "She can't say yes while she's asleep, and it's HER face. No yes means no post." },
          { id: "keep", label: "Only put it on your close-friends story", icon: "🤫", isRight: false, note: "A close-friends story still shows her, and any of them can screenshot it. Ask her first, always." },
        ],
      },
    ],
    weakPoints: [
      { question: "You post a photo, then delete it two minutes later. In those two minutes a stranger already saved it. Where is your photo now?", answers: ["On the stranger's device, out of your reach forever", "Gone, because you deleted it", "Back in your camera roll only", "Deleted from the stranger's device too"], correctIndex: 0, explanation: "Two minutes was plenty for a copy to fly. Delete empties your nest, not everybody else's." },
      { question: "A photo shows only the back of your football shirt, with your last name and squad number on it. Is that safe to post to the whole world?", answers: ["Yes, it's just a shirt", "Yes, last names aren't private anyway", "No, a name plus your team can lead a stranger to you", "Only risky if your face is showing too"], correctIndex: 2, explanation: "A name and a team are two clues that join up. Small clues together still make a map, so cover them first." },
      { question: "Your friend is in a photo you took and asks, 'please take it down, I hate it.' You think she looks great in it. What do you do?", answers: ["Leave it up, she looks great", "Take it down, it's her face and her call", "Ask everyone else to vote on it", "Leave it up but turn off the comments"], correctIndex: 1, explanation: "Her face means her call, even when you disagree. 'Take mine down' is always allowed." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE GOLDEN FRAME",
      chargeIcon: "⭐",
      chargeSecs: 5,
      milestones: ["Polishing the frame…", "It's gleaming! Keep holding!", "FRAME READY! LET GO!"],
      payoffTitle: "NOTHING TO STEAL!",
      payoffLine: "The claw grabbed the safe photo and found zero clues inside. Look, think, ask - every share, every time.",
    },
    villain: {
      arrival: "One little photo tells me EVERYTHING. Say cheese!",
      phases: [
        "Let the pigeons out! They only bite a little!",
        "Lovely crest! Lovely street sign! Lovely front door!",
        "Snap first, ask never! That's the raccoon way!",
      ],
      escape: "A clean photo?! What am I supposed to do with MEMORIES?!",
    },
    voiceSlug: "w08",
  },
  badgeArt: "/cyberheroes/badges/week-08-photo-detective.png",

  bossAttacks: [
    { name: "COPY PIGEONS", icon: "✉️", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Delete can't catch them", emblemColor: 0x7df0ff },
    { name: "CLUE LEAK",    icon: "📍", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Photos talk",             emblemColor: 0xffd158 },
    { name: "SNEAKY SNAP",  icon: "👀", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Their face, their call",  emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W8 COMBAT - crash the photo
  // heist - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "You DELETE a photo you shared. What happens?", answers: ["Only YOUR copy disappears", "Every copy everywhere vanishes", "The internet forgets it", "Screenshots delete too"], correctIndex: 0, explanation: "Delete empties your nest - the copy pigeons are already flying." },
      { question: "Before posting a photo of your friend, you...", answers: ["Ask them first", "Add a funny caption", "Tag everyone fast", "Post it - friends don't mind"], correctIndex: 0, explanation: "Their face, their call - every single time." },
      { question: "What can a school crest in your photo tell a stranger?", answers: ["Which school you go to", "Your favorite color", "Nothing at all", "Just that you go to SOME school"], correctIndex: 0, explanation: "Crests, signs and banners talk - check the background before sharing." },
    ],
    medium: [
      { question: "A friend screenshots your 'disappearing' photo. Now what?", answers: ["A copy exists that you can't reach", "It still disappears on time", "Screenshots don't work on photos", "The app deletes her copy"], correctIndex: 0, explanation: "A screenshot is a brand-new pigeon - the timer can't call it back." },
      { question: "Which photo fits the WHOLE WORLD door?", answers: ["A sunset with nobody in it", "Your first-day uniform pic", "A party pic of three friends", "Your bedroom selfie"], correctIndex: 0, explanation: "No faces, no clues = the only kind that meets the world safely." },
      { question: "A friend sends a just-for-you selfie. The group chat would love it. You...", answers: ["Keep it - just-for-me means just-for-me", "Forward it - she sent it to me!", "Post it but say sorry after", "Crop her face and send it"], correctIndex: 0, explanation: "Sent TO you isn't yours to send ON - that's her trust in your hands." },
    ],
    hard: [
      { question: "Why isn't a PRIVATE account total protection for photos?", answers: ["People inside can still screenshot and reshare", "Private only works on photos, not videos", "Strangers can see private posts anyway", "It is total protection"], correctIndex: 0, explanation: "Private shrinks the door - it doesn't stop the pigeons inside it." },
      { question: "What's the full hero ritual before any share?", answers: ["Look, think, ask", "Post, check, delete", "Crop, filter, tag", "Ask, post, forget"], correctIndex: 0, explanation: "Look at every corner, think 'anyone, forever?', ask the people in it." },
      { question: "One photo shows your name, age, school AND street. Why is that a big deal?", answers: ["Together they're a stranger's map to you", "It just looks untidy", "It's only a problem if you're famous", "Names aren't private"], correctIndex: 0, explanation: "Each clue is small - together they tell a stranger everything they need." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 8 - the runaway photo!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "One photo told strangers everything..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan, detective." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "Delete isn't magic. Watch." } }, // learn: out forever
    4: { adam: null, layla: { mood: "curious", message: "Follow those pigeons!" } }, // game: reveal
    5: { adam: { mood: "thumbsup", message: "Finish the photo rule!" }, layla: null }, // prove: finish
    6: { adam: { mood: "excited", message: "One power down - four to go!" }, layla: null }, // recap 1
    7: { adam: { mood: "thinking", message: "Whose face is it? Their call." }, layla: null }, // learn: consent
    8: { adam: { mood: "curious", message: "Feel the 'just post it'? Ask first." }, layla: null }, // game: decide
    9: { adam: null, layla: { mood: "thumbsup", message: "What comes first?" } }, // prove: recall
    10: { adam: null, layla: { mood: "excited", message: "Ask-first: locked in!" } }, // recap 2
    11: { adam: { mood: "thinking", message: "Shhh... the photo is talking." }, layla: null }, // learn: clues
    12: { adam: { mood: "curious", message: "Pin every clue, detective!" }, layla: null }, // game: clueBoard
    13: { adam: null, layla: { mood: "excited", message: "Quick - which clue leaks home?" } }, // prove: speed
    14: { adam: null, layla: { mood: "thumbsup", message: "Magnifying glass: earned." } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Smallest door that fits." } }, // learn: doors
    16: { adam: null, layla: { mood: "excited", message: "Be the door keeper!" } }, // game: conveyorSort
    17: { adam: { mood: "worried", message: "He's fibbing about 'private' - catch him!" }, layla: null }, // prove: lie
    18: { adam: { mood: "thumbsup", message: "Doors kept. Fib busted." }, layla: null }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "Look. Think. Ask. Three seconds." } }, // learn: ritual
    20: { adam: null, layla: { mood: "curious", message: "Run the ritual - pull the lever!" } }, // game: levers
    21: { adam: { mood: "thumbsup", message: "Put the ritual in order!" }, layla: null }, // prove: order
    22: { adam: { mood: "excited", message: "All five powers - boss time soon!" }, layla: null }, // recap 5
    23: { adam: { mood: "excited", message: "Share-smart or photo leak - scan!" }, layla: null }, // consolidation
    24: { adam: null, layla: { mood: "worried", message: "His photo heist is ON - crash it!" } }, // boss
    25: { adam: { mood: "excited", message: "Watch the heist fall apart!" }, layla: null }, // outro video
    26: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    27: { adam: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" }, layla: null }, // stickers
    28: { adam: null, layla: { mood: "thumbsup", message: "Photo Detective badge earned!" } }, // completion
  },
};

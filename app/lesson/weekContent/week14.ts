import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 14 - Smart Devices: Who's Listening?
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 EARS     know which things listen        | hookSort          | recall (surprise)
 *     2 DIARY    they hear to help - and record  | reveal (📋)       | lie
 *     3 EYES     little glass lenses watch       | buttonHunt        | speed
 *     4 WHISPER  no secrets out loud             | chooseYourPath    | finish
 *     5 SWITCH   flip the settings together      | settingsSwitch    | order
 *   Consolidation (cyberScanner, Quiet House skin) -> boss
 *   (placeholder quiz boss - the bespoke W14 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: hookSort returns 5 weeks after W9's Delivery Dock as
 * the Ears Check (one house-thing at a time, EARS ON! vs FAST ASLEEP);
 * RevealBoard back after a 2-week rest as the Speaker Diary; buttonHunt
 * re-dressed as the Dusk Watch (find the two lenses - its earmarked W14
 * slot); settingsSwitch's earmarked W14 reuse as the Mute Safari.
 * Lane-clean: device ears/eyes/switches - passwords were W1, private
 * info W2, screen-time balance W13. In-week flavour: the House That
 * Listens. Tone: curious, never creepy - devices are helpers to KNOW,
 * not monsters to fear.
 */
export const WEEK_14: WeekContent = {
  weekNumber: 14,
  title: "Smart Devices: Who's Listening?",
  topic: "smart-devices",
  badgeName: "Settings Scout",
  badgeIcon: "⚙️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 14: WHO'S LISTENING?", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the house that listens
    { type: "video", videoPlaceholder: "Week 14: The House That Listens", videoSrc: "/videos/module-14-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[14] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-14.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's found a lazy new trick: he listens through the gadgets already inside your house. Speakers, TVs, even talking toys. This week you become a Settings Scout: spot the ears, find the eyes, keep secrets off the air - and flip the switches together.",
      photoCaption: "Wk 14 - The House That Listens",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Spot which things have ears - and eyes",
        "Keep secrets OFF the air",
        "Find the privacy switches together",
      ],
    },

      // SIGNATURE: Goodnight, Gadgets (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "goodnightGadgets",
        title: "Goodnight, Gadgets",
        narration: {
          speaker: "adam",
          lines: [
            "[warmly] Bedtime, hero! Some gadgets in this room can see and hear.",
            "Put each one to sleep: cover its camera or mute its mic.",
            "No eyes and no ears? Then it can stay up with you.",
          ],
        },
      },

    /* ─────────── BEAT 1 · KNOW THE EARS ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "The House That Listens",
      content:
        "Look around your house: some things in it are SMART - connected to the internet, with tiny ears called microphones and sometimes even eyes called cameras. Smart speakers, some TVs, watches, doorbells... and here's the surprise: even some TOYS. Smart isn't scary - they listen so they can do their jobs. But a Scout's first power is simply KNOWING which things have ears and which are fast asleep.",
      bullets: [
        "Smart things connect to the internet",
        "Speakers listen for their name",
        "Some TVs and watches listen too",
        "Doorbells can watch the front step",
        "Even some TOYS have ears",
      ],
      bulletIcons: ["🌍", "💬", "📱", "🚪", "🎁"],
      emblem: "🏠",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Week fourteen - and this mission starts AT HOME.",
          "Some things in your house are smart.",
          "That means tiny ears... and sometimes tiny eyes.",
          "Speakers. TVs. Watches. Doorbells.",
          "[whispers] And the surprise: even some toys.",
          "[excited] House things incoming - sort the ears from the sleepers!",
        ],
      },
    },
    // 4 - Game: SORT (hookSort re-dress - the Ears Check)
    {
      type: "hookSort",
      introTitle: "The Ears Check",
      introSubtitle: "House things drift in one at a time. Make the Scout's call: has it got EARS... or is it fast asleep?",
      introIcon: "🏠",
      reelLabel: "FAST ASLEEP",
      cutLabel: "EARS ON!",
      reelToast: "ASLEEP!",
      cutToast: "EARS SPOTTED!",
      wrongScamTitle: "That one was LISTENING!",
      wrongRealTitle: "That one really is asleep",
      completeTitle: "House checked, Scout!",
      completeLine: "Now you know exactly who's got ears - that's the whole first power.",
      items: [
        {
          id: "speaker",
          text: "The kitchen smart speaker",
          icon: "💬",
          isScam: true,
          explanation: "Its whole job is listening for its name - those ears are always on standby.",
        },
        {
          id: "teddy",
          text: "Your old teddy bear",
          icon: "🤫",
          isScam: false,
          explanation: "Just fluff and stuffing - no wires, no ears. The best listener who never repeats a word.",
        },
        {
          id: "tv",
          text: "The TV with a voice remote",
          icon: "📱",
          isScam: true,
          explanation: "Say 'find dinosaur cartoons' and it obeys - that remote has a microphone inside.",
        },
        {
          id: "toaster",
          text: "The toaster",
          icon: "⚡",
          isScam: false,
          explanation: "Hot, buttery and completely deaf - plugged-in isn't the same as listening.",
        },
        {
          id: "robopup",
          text: "Robo-Pup, the talking toy dog",
          icon: "🎁",
          isScam: true,
          explanation: "It answers when you talk to it... which means it's got ears. SURPRISE - some toys listen!",
        },
        {
          id: "books",
          text: "The pile of bedtime books",
          icon: "🔠",
          isScam: false,
          explanation: "Paper ears only - stories go in, nothing ever goes out.",
        },
        {
          id: "watch",
          text: "Dad's smart watch",
          icon: "🔔",
          isScam: true,
          explanation: "It listens for 'call Grandma' - a tiny ear riding along on a wrist.",
        },
        {
          id: "lamp",
          text: "The cozy reading lamp",
          icon: "💡",
          isScam: false,
          explanation: "Bright, warm and earless - light is its whole job.",
        },
      ],
      hints: {
        tier1: "Ask: can you TALK to it and it answers back? Then it's got ears.",
        tier2: "EARS ON = speaker, voice-remote TV, talking toy, smart watch. ASLEEP = teddy, toaster, books, lamp.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Ears Check - house things incoming!",
          "One at a time, make the call:",
          "EARS ON for the listeners...",
          "[whispers] FAST ASLEEP for the quiet ones. Watch for surprises!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["First one's here - can you talk to it and it answers? Make the call!"],
      },
    },
    // 5 - Prove: RECALL (the surprise)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Sneaky one: which of these was LISTENING?",
      choices: [
        { text: "Robo-Pup the talking toy", isCorrect: true },
        { text: "The teddy bear", isCorrect: false },
        { text: "The toaster", isCorrect: false },
        { text: "The bedtime books", isCorrect: false },
      ],
      praise: "Toys can have ears too - that's the Scout surprise of the week. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Speakers, TVs, watches, doorbells - even toys - can have ears; a Scout knows which is which.",
      next: "what all those ears actually DO with what they hear",
      emblem: "🏠",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - the house has no secrets from YOU now!",
          "Every ear in the place, spotted.",
          "[whispers] But what do those ears do with what they catch?",
          "One of them keeps a diary. Come and read it...",
        ],
      },
    },

    /* ─────────── BEAT 2 · THE SPEAKER DIARY ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Why They Listen",
      content:
        "Smart ears listen to HELP - answer questions, play songs, dim the lights, call Grandma. They wake up when they hear their name. But here's the Scout secret: sometimes they RECORD what they hear, and keep a copy in an app. That's the speaker's diary. Grown-ups can open that diary, read it... and delete it. Not scary - just very worth knowing.",
      bullets: [
        "They listen so they can help",
        "They wake at their name",
        "Sometimes they RECORD",
        "Copies live in an app",
        "Grown-ups can check and delete",
      ],
      bulletIcons: ["✅", "💬", "📋", "📱", "👪"],
      emblem: "📋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] So why do they listen? To HELP.",
          "Songs, questions, lights, Grandma calls.",
          "They wake when they hear their name...",
          "[whispers] but sometimes, they write down what they hear.",
          "That's the speaker's diary - and it lives in an app.",
          "[excited] Nova heard four things today. Let's read the diary!",
        ],
      },
    },
    // 8 - Game: REVEAL (RevealBoard re-dress - the Speaker Diary)
    {
      type: "reveal",
      title: "The Speaker Diary",
      subtitle: "Nova the speaker heard four things today. Tap each moment and see what the diary wrote down.",
      boardIcon: "📋",
      items: [
        {
          id: "wake",
          label: "'Hey Nova!'",
          icon: "💬",
          steps: [
            { icon: "💬", text: "You call its name from across the kitchen. 'Hey Nova!'" },
            { icon: "🔔", text: "Ding! The ear-light glows - Nova is now FULLY awake and listening." },
            { icon: "📋", text: "Diary entry: 'Woke at 4:02pm.' The name is the ON switch." },
          ],
          counter: "The name switches the ears ON.",
        },
        {
          id: "song",
          label: "The kitchen concert",
          icon: "🎉",
          steps: [
            { icon: "🎉", text: "You belt out your made-up sausage song at full volume. A masterpiece." },
            { icon: "🔔", text: "But Nova was still awake from 'Hey Nova, play drums'..." },
            { icon: "📋", text: "Diary entry: one RECORDING of the sausage song, saved to the app." },
          ],
          counter: "Awake ears can record.",
        },
        {
          id: "question",
          label: "The homework question",
          icon: "🧠",
          steps: [
            { icon: "🧠", text: "'Nova, how far away is the moon?' Homework rescue in one second flat." },
            { icon: "✅", text: "Helpful! That's exactly the job smart ears are for." },
            { icon: "📋", text: "Diary entry: your question, kept - so the app can learn what you like." },
          ],
          counter: "Questions get remembered.",
        },
        {
          id: "secret",
          label: "The present plan",
          icon: "🎁",
          steps: [
            { icon: "🎁", text: "You and Mom plan Grandma's surprise present, right next to the counter." },
            { icon: "🔔", text: "Mid-chat, someone says 'Nova, dim the lights' - the ears wake up..." },
            { icon: "📋", text: "Diary entry: a little slice of the secret plan, caught by accident." },
          ],
          counter: "Diaries can catch secrets.",
        },
      ],
      finale: "Diary closed! Smart ears listen to help - AND they write things down. Scouts never forget that second part.",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Four moments from one ordinary day.",
          "Nova heard every single one.",
          "[excited] Tap each moment -",
          "and see what the diary wrote down!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap the first moment - let's see what Nova's diary says!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "relax, kid! the speaker ONLY ever hears its own name - nothing else, not once, promise!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! It listens FOR its name - and once awake, it can hear and record plenty more. ✓",
      nudge: "What did the diary catch during the kitchen concert?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Smart ears help - and sometimes record; the diary lives in an app grown-ups can check and delete.",
      next: "the gadgets that don't just listen... they WATCH",
      emblem: "📋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers - you've read the diary!",
          "Helpful ears, with a memory.",
          "[whispers] But some gadgets have more than ears...",
          "Some have little glass EYES. Lights down - let's hunt.",
        ],
      },
    },

    /* ─────────── BEAT 3 · LITTLE GLASS EYES ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Little Glass Eyes",
      content:
        "Some smart things have eyes as well as ears - a small, round, shiny lens, like a little glass eye. Doorbells use theirs to watch the front step: that's their job, and it keeps the house safe. Some TVs and toys have lenses tucked into their frames too. Scouts play spot-the-lens: find the little glass circle. And one rule above all: bedrooms are lens-free zones. A camera pointing at your bed? Tell a grown-up right away - every time.",
      bullets: [
        "Cameras hide in doorbells, TVs, toys",
        "Look for the small round lens",
        "Front-step watching = its job",
        "Bedrooms are lens-free zones",
        "Unsure? Ask a grown-up",
      ],
      bulletIcons: ["👁️", "🔍", "🚪", "🚫", "👪"],
      emblem: "👁️",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Some gadgets don't just listen. They watch.",
          "The clue is a small, round, shiny lens - a little glass eye.",
          "Doorbells watch the front step. That's their job.",
          "But bedrooms? Lens-free zones. Always.",
          "[excited] The living room's gone dusky - and two glass eyes are hiding in it.",
          "Find them both, Scout!",
        ],
      },
    },
    // 12 - Game: FIND (buttonHunt re-dress - the Dusk Watch)
    {
      type: "buttonHunt",
      menuTitle: "THE LIVING ROOM AT DUSK",
      scenario: "The lights are low. Somewhere in this cozy room, two little glass eyes are watching. Find them both!",
      introTitle: "The Dusk Watch",
      introSubtitle: "Two hidden lenses, four cozy decoys. Tap the doorbell's eye first, then the TV's - and learn why the rest can't see a thing.",
      introIcon: "👁️",
      buttons: [
        {
          id: "doorbell",
          label: "Smart Doorbell",
          icon: "👁️",
          targetOrder: 1,
          note: "Lens one! The little glass eye that watches the front step - hard at work, exactly where it belongs.",
        },
        {
          id: "tv",
          label: "TV's Top Edge",
          icon: "👁️",
          targetOrder: 2,
          note: "Lens two - a tiny camera dot right on the frame. Spotted like a pro Scout.",
        },
        {
          id: "lamp",
          label: "Cozy Lamp",
          icon: "💡",
          note: "Warm and bright - but no lens in there. Light is its whole job.",
        },
        {
          id: "painting",
          label: "Grandma's Painting",
          icon: "🎨",
          note: "Only painted eyes in there - they never blink and they never record.",
        },
        {
          id: "fruit",
          label: "Fruit Bowl",
          icon: "🍌",
          note: "Bananas: famously camera-free.",
        },
        {
          id: "books",
          label: "Book Pile",
          icon: "🔠",
          note: "A million stories, zero lenses.",
        },
      ],
      hints: {
        tier1: "Hunt for the small round GLASS circle - shiny and dark, like a little eye.",
        tier2: "One watches the front step. The other sits right on the TV's frame.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Dusk in the living room...",
          "Two little glass eyes are out there somewhere.",
          "Doorbell first, then the TV.",
          "[excited] Eyes sharp, Scout - go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Where would a lens watch the front step from? Tap it!"],
      },
    },
    // 13 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the thing that can WATCH!",
      speedMs: 5000,
      choices: [
        { text: "The doorbell's little glass eye", isCorrect: true },
        { text: "The cozy lamp", isCorrect: false },
        { text: "The fruit bowl", isCorrect: false },
      ],
      praise: "Spotted at Scout speed - the glass eye can't hide from you! ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Little glass lenses are eyes - front-step watching is a job, bedrooms stay lens-free, and unsure means ask.",
      next: "keeping secrets OFF the air - the megaphone rule",
      emblem: "👁️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers - ears AND eyes, all spotted!",
          "The house can't surprise you anymore.",
          "[whispers] So now the big question:",
          "with all those ears about... where do SECRETS go?",
        ],
      },
    },

    /* ─────────── BEAT 4 · NO SECRETS OUT LOUD ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "The Megaphone Rule",
      content:
        "Here's the rule that ties the whole week together: anything said OUT LOUD near smart ears might be heard, recorded, or repeated. So heroes keep secrets OFF THE AIR - that just means never saying them out loud near a listening thing. Not passwords, not surprises, not private stuff. Write it down and pass it over. Whisper it somewhere ear-free. Or just walk to another room. Because near smart ears, saying it out loud is saying it through a megaphone.",
      bullets: [
        "Ears nearby? Assume they hear",
        "Passwords NEVER out loud",
        "Write it and pass it over",
        "Or take it to another room",
        "Out loud = megaphone",
      ],
      bulletIcons: ["🔔", "🔐", "📋", "🚪", "💬"],
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Now for the rule that ties it all together.",
          "Near smart ears, out loud is a MEGAPHONE.",
          "Passwords? Never out loud.",
          "Surprises? Take them to another room.",
          "[warmly] Write it. Whisper it away. Move it.",
          "[excited] Three secret moments coming - keep them off the air!",
        ],
      },
    },
    // 16 - Game: DECIDE (chooseYourPath - the Whisper Check)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Dad asks for the new tablet password. Nova the speaker sits right there on the counter, ear-light glowing...",
          choices: [
            {
              text: "Write it on paper and slide it over",
              isSafe: true,
              consequence: "Dad grins, reads it, nods - and not one letter went out loud. Nova's diary caught nothing but the kettle boiling.",
            },
            {
              text: "Just say it - 'dragon42rocket!'",
              isSafe: false,
              consequence: "Straight into the ears - maybe straight into the diary. A password inside a recording isn't fully yours anymore... time to change it.",
            },
          ],
        },
        {
          setup: "You and Mom are planning Grandma's SURPRISE party in the kitchen. Robo-Pup sits on the counter, switched on and listening...",
          choices: [
            {
              text: "Carry the plan out to the backyard",
              isSafe: true,
              consequence: "Party plans stay surprises when the only ears around are the people you invited. Grandma won't see it coming!",
            },
            {
              text: "Keep planning - it's just a toy",
              isSafe: false,
              consequence: "Robo-Pup's ears caught the whole plan - and saved it. Days later, the recording is sitting right there in the toy's app for anyone to play. Toys with ears make terrible secret-keepers.",
            },
          ],
        },
        {
          setup: "Your friend wants the secret club password over video chat - and the smart TV's mic is on in the same room...",
          choices: [
            {
              text: "Write it in the club notebook tomorrow",
              isSafe: true,
              consequence: "The club stays secret because the password never touched the air. Proper spy work, agent.",
            },
            {
              text: "Shout it across the room",
              isSafe: false,
              consequence: "Now the TV heard it, the chat heard it, and half the street probably heard it too. A shouted secret isn't a secret - it's news.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Three secret moments. Ears everywhere.",
          "Remember the megaphone rule:",
          "write it, whisper it away, or move rooms.",
          "[excited] Keep every secret off the air - go!",
        ],
      },
    },
    // 17 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Near smart ears, saying a secret out loud is like using a ___.",
      choices: [
        { text: "megaphone", isCorrect: true },
        { text: "whisper", isCorrect: false },
        { text: "telephone", isCorrect: false },
        { text: "secret code", isCorrect: false },
      ],
      praise: "A megaphone - said out loud once, it can be heard, recorded and repeated. Keep secrets off the air. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Near smart ears, out loud = megaphone - write secrets down, whisper them away, or change rooms.",
      next: "the last Scout skill: the switches that put ears to sleep",
      emblem: "🤫",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers - your secrets stay YOURS!",
          "Written, whispered, moved. Off the air.",
          "[warmly] And now the best news of the whole week:",
          "every one of those ears... has an OFF switch. Let's find them.",
        ],
      },
    },

    /* ─────────── BEAT 5 · FLIP IT TOGETHER ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Flip It Together",
      content:
        "Best Scout news of the week: every smart thing has switches. Mute buttons that put ears to sleep. Push-to-talk that only opens the ear while you hold it. Camera covers. Settings that turn 'always listening' into 'only when asked'. You don't flip them alone - you find them, show a grown-up, and flip them together. That's the whole Settings Scout job: patrol, point, flip.",
      bullets: [
        "Every device has switches",
        "Mute buttons put ears to sleep",
        "Push-to-talk beats always-on",
        "Find them WITH a grown-up",
        "Patrol again now and then",
      ],
      bulletIcons: ["⚙️", "🔔", "✋", "👪", "🔍"],
      emblem: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Ready for the best news all week?",
          "Every ear in the house has an OFF switch.",
          "Mute buttons. Push-to-talk. Camera covers.",
          "You find them, show a grown-up, flip them TOGETHER.",
          "[excited] Patrol, point, flip - the Settings Scout way.",
          "The house settings panel is open - safari time!",
        ],
      },
    },
    // 20 - Game: FIND (settingsSwitch re-dress - the Mute Safari)
    {
      type: "settingsSwitch",
      panelTitle: "THE HOUSE SETTINGS PANEL",
      introTitle: "The Mute Safari",
      introSubtitle: "Five settings from around the house. Flip the risky always-on ones - and learn why the safe ones are fine as they are.",
      introIcon: "⚙️",
      rows: [
        {
          id: "nova",
          label: "Nova Speaker - microphone",
          value: "Always listening",
          safeValue: "Wakes at its name only",
          icon: "💬",
          isRisky: true,
          note: "Ears that never sleep hear EVERYTHING - name-only wake gives the house its quiet back.",
        },
        {
          id: "tv",
          label: "TV - voice remote",
          value: "Mic always on",
          safeValue: "Push to talk",
          icon: "📱",
          isRisky: true,
          note: "Push-to-talk opens the ear only while the button's held down - YOU decide when it hears.",
        },
        {
          id: "robopup",
          label: "Robo-Pup - recordings",
          value: "Keeps recordings: ON",
          safeValue: "Keeps recordings: OFF",
          icon: "🎁",
          isRisky: true,
          note: "A toy doesn't need to keep recordings to play fetch - off it goes.",
        },
        {
          id: "doorbell",
          label: "Doorbell camera",
          value: "Watches the front step",
          icon: "🚪",
          isRisky: false,
          note: "That's exactly its job - the family put that lens there to watch the step, and it does.",
        },
        {
          id: "tablet",
          label: "Tablet microphone",
          value: "Asks every time",
          icon: "✅",
          isRisky: false,
          note: "Asking first is the gold standard - the ear only opens when YOU say yes.",
        },
      ],
      hints: {
        tier1: "Risky = ears or recorders that are ALWAYS on. Safe = asks first, or does exactly its job.",
        tier2: "Flip the always-listening mic, the always-on remote and the recording toy. The doorbell and ask-first tablet are fine.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Mute Safari - five settings on patrol!",
          "Hunt the always-on ears and flip them.",
          "[whispers] But careful - some settings are already doing their job right.",
          "Patrol, point, flip. Go, Scout!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Which setting never stops listening? That one needs the flip!"],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the Scout's three moves in order!",
      choices: [
        { text: "Find the switch", isCorrect: true },
        { text: "Show a grown-up", isCorrect: true },
        { text: "Flip it together", isCorrect: true },
      ],
      praise: "Find, show, flip together - the Settings Scout patrol. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Switches put ears to sleep - find them, show a grown-up, flip them together.",
      next: "one last patrol of the house, then the Raccoon's listening post",
      emblem: "⚙️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE Scout powers!",
          "Ears known, diary read, lenses spotted,",
          "secrets off the air... and switches flipped together.",
          "[whispers] One final patrol of the house...",
          "[excited] then we unplug his listening post for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Quiet House (W1 scanner engine, W14 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "QUIET HOUSE",
        negative: "LEAKY HOUSE",
        positiveHint: "Tap QUIET HOUSE for Scout moves that keep the ears in check",
        negativeHint: "Tap LEAKY HOUSE for moments the Raccoon could listen in on",
        tipWhenPositive: "Secrets written, switches flipped together, lenses spotted - the house stays yours.",
        tipWhenNegative: "Passwords on the air, always-on ears, mystery lenses - his favorite listening posts.",
        hint1: "Ask: could a hidden ear or eye catch this moment?",
        hint2: "QUIET = written secrets, push-to-talk, checked switches. LEAKY = out-loud passwords, always-on mics, unasked-about lenses.",
        hint2Example: "QUIET: 'wrote the password down'   LEAKY: 'shouted it near Nova'",
        hint3: "Scout card: know the ears · read the diary · spot the lens · whisper away · flip together.",
        hint3Example: "Push-to-talk ✅    Always listening ❌",
      },
      items: [
        {
          text: "Writing the password instead of saying it",
          isStrong: true,
          explanation: "Not one letter touched the air - the diary got nothing but silence.",
        },
        {
          text: "Shouting your password across the room",
          isStrong: false,
          explanation: "Every ear in range just got a copy - human and gadget alike.",
        },
        {
          text: "Flipping Robo-Pup's recorder off with Dad",
          isStrong: true,
          explanation: "Found, shown, flipped together - textbook Settings Scout.",
        },
        {
          text: "A mystery camera nobody's asked about",
          isStrong: false,
          explanation: "Unknown lenses get a grown-up asked about them - that's Scout rule one.",
        },
        {
          text: "Push-to-talk on the TV remote",
          isStrong: true,
          explanation: "The ear opens only while the button's held - you decide when it hears.",
        },
        {
          text: "Planning the surprise party next to an awake speaker",
          isStrong: false,
          explanation: "Awake ears can record - surprises belong in ear-free rooms.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final patrol - the Quiet House check!",
          "House moments drifting past the scanner.",
          "QUIET HOUSE for the Scout moves...",
          "[warmly] LEAKY HOUSE for his listening posts. Scan!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W14 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the quiet house
    { type: "video", videoPlaceholder: "Week 14: The Quiet House", videoSrc: "/videos/module-14-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "smart", label: "Smart Spotter", accent: "#7eff97", icon: "🏠", summary: "You know exactly which things have ears - even the toys." },
        { id: "diary", label: "Diary Wise", accent: "#7df0ff", icon: "📋", summary: "Smart ears help AND record - and grown-ups can check the diary." },
        { id: "lens", label: "Lens Finder", accent: "#c084fc", icon: "👁️", summary: "Little glass eyes can't hide from you - and bedrooms stay lens-free." },
        { id: "whisper", label: "Whisper Keeper", accent: "#ffd158", icon: "🤫", summary: "Secrets stay off the air - written, whispered away, or moved rooms." },
        { id: "switch", label: "Switch Scout", accent: "#ff5fb3", icon: "⚙️", summary: "You find the privacy switches and flip them with a grown-up." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Ears spotted, diary read, lenses found,",
          "secrets kept off the air... and every switch flipped together.",
          "[laughs] His listening post just went silent.",
          "[excited] Sticker time, Settings Scout!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "ears-spotter", name: "Ears Spotter", icon: "🔔", description: "Knows every ear in the house - even the toy ones." },
        { id: "lens-finder", name: "Lens Finder", icon: "👁️", description: "No little glass eye escapes the dusk watch." },
        { id: "switch-scout", name: "Switch Scout", icon: "⚙️", description: "Patrols, points, and flips - together." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#45e3ff",
    theme: {
      topic: "Smart Devices",
      motifs: ["🏠", "👀", "📱", "🔒", "🔔", "🛡️", "💡", "⚙️"],
    },
    intro: {
      slug: "quiz-w14-intro",
      text: "You made it past my rooftop, but this quiz booth hears EVERYTHING. Let's find out if those big Scout ears of yours actually work!",
    },
    victory: {
      slug: "quiz-w14-victory",
      text: "Muted?! By a kid with a checklist?! Fine! I'm taking my big brass ears somewhere folks appreciate good eavesdropping!",
    },
    questions: [
      {
        phaseId: "phase-w14-c1",
        key: "quiz-w14-c1-1",
        label: "The House That Listens",
        ask: {
          slug: "quiz-w14-ask-c1-1",
          text: "You want to tell your cousin a birthday-surprise secret at Grandma's house. Which thing in the room could actually HEAR it?",
        },
        options: [
          { text: "The speaker that plays a song when you ask it" },
          { text: "The music box that plays when you wind the key" },
          { text: "The radio that plays when you press its big button" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Ears answer back!",
          explanation: "The music box and the radio only work when your hands touch them, no microphones inside. The speaker answers when you TALK to it, and answering back means ears.",
        },
        villainRight: {
          slug: "quiz-w14-right-c1-1",
          text: "You picked the one with ears out of a whole shelf of music makers?! My kitchen disguises are RUINED!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c1-1",
          text: "Sing away, hero! While you watched the music box, the speaker with EARS caught every single word!",
        },
      },
      {
        phaseId: "phase-w14-c2",
        key: "quiz-w14-c2-1",
        label: "Why They Listen",
        ask: {
          slug: "quiz-w14-ask-c2-1",
          text: "Mom says 'Nova, call Grandma' and the kitchen speaker wakes right up. What actually woke it?",
        },
        options: [
          { text: "Hearing its own name at the start" },
          { text: "Hearing the word Grandma at the end" },
          { text: "Knowing the sound of Mom's voice only" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The name is the ON switch!",
          explanation: "Smart speakers doze until they hear their special name. It isn't Grandma's name and it isn't one person's voice, it's the wake word, and once awake, the speaker can hear everything that comes next.",
        },
        villainRight: {
          slug: "quiz-w14-right-c2-1",
          text: "OW! You know the wake-word trick?! Now you'll always know the exact moment the listening starts!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c2-1",
          text: "Wrongo! It naps through Grandmas and mumbles alike, but its NAME flips the ears on, and you never even noticed!",
        },
      },
      {
        phaseId: "phase-w14-c3",
        key: "quiz-w14-c3-1",
        label: "Little Glass Eyes",
        ask: {
          slug: "quiz-w14-ask-c3-1",
          text: "Layla's new talking doll has a small round shiny circle on its head that nobody mentioned. What is her first Scout move?",
        },
        options: [
          { text: "Show it to a trusted grown-up and ask what it is" },
          { text: "Stick a sticker over it and tell nobody at all" },
          { text: "Wave at it in case somebody nice is watching" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Mystery lens? Ask first!",
          explanation: "Covering it in secret or waving at it leaves the mystery a mystery. A little glass circle nobody explained might be a camera, and a trusted grown-up can find out for sure.",
        },
        villainRight: {
          slug: "quiz-w14-right-c3-1",
          text: "You showed a grown-up?! That little glass eye was my favorite window!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c3-1",
          text: "A sticker and a secret, or a friendly little wave! Either way, nobody ever asks about my lens, hee hee!",
        },
      },
      {
        phaseId: "phase-w14-c4",
        key: "quiz-w14-c4-1",
        label: "The Megaphone Rule",
        ask: {
          slug: "quiz-w14-ask-c4-1",
          text: "Dad asks for the new tablet password and Nova the speaker is wide awake on the counter. What is the hero way to give it to him?",
        },
        options: [
          { text: "Write it on paper and slide it across" },
          { text: "Say it extra fast so the speaker can't keep up" },
          { text: "Spell it out letter by letter instead of saying it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Off the air means OFF the air!",
          explanation: "Fast talking and spelling are still sounds, and microphones catch sounds however quick or lettery they are. Paper makes no sound at all, so the password never touches the air.",
        },
        villainRight: {
          slug: "quiz-w14-right-c4-1",
          text: "Paper?! PAPER?! My beautiful microphones cannot hear handwriting!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c4-1",
          text: "Speedy or spelled, my recorders catch it all! I'll just play it back nice and slooooow!",
        },
      },
      {
        phaseId: "phase-w14-c5",
        key: "quiz-w14-c5-1",
        label: "Flip It Together",
        ask: {
          slug: "quiz-w14-ask-c5-1",
          text: "The TV remote's microphone has two settings: 'always on' or 'push-to-talk'. Which one hands the ear's ON switch to YOU?",
        },
        options: [
          { text: "Push-to-talk, it hears only while the button is held" },
          { text: "Always on, it never misses a single word you say" },
          { text: "Extra loud, it can hear you from any room in the house" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "You hold the switch!",
          explanation: "'Always on' means the ear never sleeps, and 'extra loud' is about talking, not listening. Push-to-talk opens the ear only while YOUR finger holds the button, so you decide when it hears.",
        },
        villainRight: {
          slug: "quiz-w14-right-c5-1",
          text: "Push-to-talk?! So the ear only opens when YOU say so?! What about MY needs?!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c5-1",
          text: "Always on, always listening, alllways sharing with me! Greatest setting ever invented!",
        },
      },
      {
        phaseId: "phase-w14-c1",
        key: "quiz-w14-c1-2",
        label: "The House That Listens",
        ask: {
          slug: "quiz-w14-ask-c1-2",
          text: "Adam's little brother got three new toys. Which one has EARS?",
        },
        options: [
          { text: "The robot dino that roars back when you ask it to" },
          { text: "The plush dragon that squeaks when you squeeze it" },
          { text: "The race car that zooms when you pull it backwards" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Toys can listen too!",
          explanation: "Squeezes and pulls are hand tricks, no microphones needed. But a toy that answers your VOICE has a microphone inside. That's the Scout surprise: some toys are smart devices too.",
        },
        villainRight: {
          slug: "quiz-w14-right-c1-2",
          text: "Ouch! You found my dino spy in a whole toy box of decoys!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c1-2",
          text: "Squeeze the dragon all you like! Meanwhile my roaring little dino hears every bedtime secret!",
        },
      },
      {
        phaseId: "phase-w14-c2",
        key: "quiz-w14-c2-2",
        label: "Why They Listen",
        ask: {
          slug: "quiz-w14-ask-c2-2",
          text: "Layla asked the speaker for a dinosaur song yesterday. Where could a COPY of her words still be today?",
        },
        options: [
          { text: "In the speaker's app, where grown-ups can check and delete it" },
          { text: "Written on the back of the speaker, easy to wipe off" },
          { text: "Nowhere, speakers forget everything the moment you stop talking" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The diary lives in the app!",
          explanation: "Nothing gets written on the speaker itself, and smart ears don't always forget. Sometimes they RECORD, and the copies live in an app, where a grown-up can read them and delete them.",
        },
        villainRight: {
          slug: "quiz-w14-right-c2-2",
          text: "You know about the diary app?! That was my number-one bedtime reading!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c2-2",
          text: "Forget? Wipe off? Ha! The recordings pile up in the app, and I do love a chunky pile!",
        },
      },
      {
        phaseId: "phase-w14-c3",
        key: "quiz-w14-c3-2",
        label: "Little Glass Eyes",
        ask: {
          slug: "quiz-w14-ask-c3-2",
          text: "Adam's family has two cameras at home. Which one is exactly where it BELONGS?",
        },
        options: [
          { text: "The doorbell camera watching the front step" },
          { text: "The shelf camera pointing at Adam's bed" },
          { text: "The hallway camera nobody has ever asked about" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Jobs, not bedrooms!",
          explanation: "Watching the front step is the doorbell's actual job, the family put it there on purpose. A lens aimed at a bed, or a camera nobody explained, is different: bedrooms are lens-free zones, and mystery cameras get a trusted grown-up told right away.",
        },
        villainRight: {
          slug: "quiz-w14-right-c3-2",
          text: "Front step only?! Who guards a doorstep THAT carefully?!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c3-2",
          text: "Ooh yes, cameras everywhere are fiiiine! Especially the ones nobody asks questions about!",
        },
      },
      {
        phaseId: "phase-w14-c4",
        key: "quiz-w14-c4-2",
        label: "The Megaphone Rule",
        ask: {
          slug: "quiz-w14-ask-c4-2",
          text: "You and Mom are planning Grandma's surprise party, and Robo-Pup the talking toy is switched ON nearby. How does the plan stay a real surprise?",
        },
        options: [
          { text: "Carry the planning out to the backyard" },
          { text: "Keep going, a toy is too small to be a real listener" },
          { text: "Whisper the whole plan right into Robo-Pup's ear" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Ears are ears, even cute ones!",
          explanation: "A toy with a microphone is a real listener however small it is, and whispering INTO it is delivering the secret by hand. Moving to a spot with no smart ears keeps the surprise a surprise.",
        },
        villainRight: {
          slug: "quiz-w14-right-c4-2",
          text: "The backyard?! I can't plant a listening toy in every bush! ...Yet!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c4-2",
          text: "Tell the puppy everything! Robo-Pup works for ME, and he's SUCH a good boy!",
        },
      },
      {
        phaseId: "phase-w14-c5",
        key: "quiz-w14-c5-2",
        label: "Flip It Together",
        ask: {
          slug: "quiz-w14-ask-c5-2",
          text: "Adam just found the mute switch on the kitchen speaker all by himself. What is the FULL Settings Scout move?",
        },
        options: [
          { text: "Show a trusted grown-up and flip it together" },
          { text: "Flip it quickly himself before anyone notices" },
          { text: "Leave it alone forever, switches are not for kids" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Patrol, point, flip together!",
          explanation: "Flipping alone can mix up settings the family needs, and never touching switches leaves the ears always on. Scouts find the switch, show a trusted grown-up, and flip it together, so it's right AND it stays right.",
        },
        villainRight: {
          slug: "quiz-w14-right-c5-2",
          text: "Together?! One kid I can out-sneak, but a kid AND a grown-up is just unfair!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c5-2",
          text: "Secret solo flipping, or no flipping at all! Either way the settings end up MY way!",
        },
      },
      {
        phaseId: "phase-w14-c1",
        key: "quiz-w14-c1-3",
        label: "The House That Listens",
        ask: {
          slug: "quiz-w14-ask-c1-3",
          text: "Dad says one thing in the kitchen is always ready to hear its name. Which one is it?",
        },
        options: [
          { text: "The counter speaker that starts a timer when you ask it" },
          { text: "The microwave that beeps when the timer runs out" },
          { text: "The kettle that clicks when the water gets hot" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Beeping isn't listening!",
          explanation: "The microwave and the kettle make sounds, but they can't hear any, there's no microphone inside either one. The speaker you can ASK is the one with ears, waiting for its name.",
        },
        villainRight: {
          slug: "quiz-w14-right-c1-3",
          text: "Straight past the beepers and right to the listener! Nothing in that kitchen fools you!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c1-3",
          text: "Interrogate the kettle, go on! While you do, the REAL ears on the counter hear it all!",
        },
      },
      {
        phaseId: "phase-w14-c2",
        key: "quiz-w14-c2-3",
        label: "Why They Listen",
        ask: {
          slug: "quiz-w14-ask-c2-3",
          text: "Layla told a silly joke near the awake speaker and wonders if it got recorded. Who can open the speaker's diary to check, and delete it?",
        },
        options: [
          { text: "A trusted grown-up at home, using the speaker's app" },
          { text: "Only the speaker company, nobody at home can look" },
          { text: "Nobody anywhere, recordings can never be found again" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Grown-ups hold the diary key!",
          explanation: "The recordings aren't locked away forever or lost, they sit in the speaker's app. A trusted grown-up at home can open it, listen, and delete, which is exactly why Scouts tell them.",
        },
        villainRight: {
          slug: "quiz-w14-right-c2-3",
          text: "Checked AND deleted?! Somebody erased my whole joke collection!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c2-3",
          text: "No one can check it, noooo one can delete it! The diary just grows and grows, marvelous!",
        },
      },
      {
        phaseId: "phase-w14-c3",
        key: "quiz-w14-c3-3",
        label: "Little Glass Eyes",
        ask: {
          slug: "quiz-w14-ask-c3-3",
          text: "The lights are low in the den. Which of these could actually WATCH you?",
        },
        options: [
          { text: "The tiny dark glass circle on top of the tablet" },
          { text: "The shiny sequins on the throw pillow" },
          { text: "The glow-in-the-dark stars on the ceiling" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Hunt the little glass eye!",
          explanation: "Sequins and glow-stars shine and sparkle, but they're flat and empty, nothing behind them. A small round GLASS circle is a lens, and a lens is the little eye that can see.",
        },
        villainRight: {
          slug: "quiz-w14-right-c3-3",
          text: "You spotted the one real eye in a room FULL of sparkles?! Unbelievable!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c3-3",
          text: "Stare at the sparkly pillow, hero! The real little eye watches quietly from the tablet. Blink blink!",
        },
      },
      {
        phaseId: "phase-w14-c4",
        key: "quiz-w14-c4-3",
        label: "The Megaphone Rule",
        ask: {
          slug: "quiz-w14-ask-c4-3",
          text: "Oops! Layla said her password out loud near the awake speaker. What is the Scout move NOW?",
        },
        options: [
          { text: "Tell a trusted grown-up and change the password" },
          { text: "Say a fake password out loud to confuse the recording" },
          { text: "Whisper that same password from now on and keep it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Heard once is heard!",
          explanation: "A fake password doesn't un-say the real one, and whispering later doesn't fix what's already in a recording. A password that touched the air gets changed, with a trusted grown-up helping.",
        },
        villainRight: {
          slug: "quiz-w14-right-c4-3",
          text: "Changed already?! I finally hear one good password and it expires in MINUTES!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c4-3",
          text: "Decoys and whispers, how adorable! The first recording is the one I keep, and it still works!",
        },
      },
      {
        phaseId: "phase-w14-c5",
        key: "quiz-w14-c5-3",
        label: "Flip It Together",
        ask: {
          slug: "quiz-w14-ask-c5-3",
          text: "Robo-Pup has a setting called 'Keeps recordings', and it is ON. What do a Scout and a trusted grown-up do with it?",
        },
        options: [
          { text: "Flip it OFF, a toy doesn't need recordings to play fetch" },
          { text: "Leave it ON, recordings help the toy learn your games" },
          { text: "Turn the volume DOWN instead, quiet counts as off" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Fetch needs no diary!",
          explanation: "Volume changes what the toy SAYS, not what it hears, and a toy can play perfectly well without keeping a single recording. Off it goes, flipped together.",
        },
        villainRight: {
          slug: "quiz-w14-right-c5-3",
          text: "You flipped my puppy's recorder OFF?! Who taught this kid about toy settings?!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c5-3",
          text: "Leave it on, turn it down, either way Robo-Pup keeps taping! Goooood puppy!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-14-settings-scout.png",

  // Week-lane attack theatre: device ears/eyes tricks only (passwords =
  // W1; private info = W2; screen-time = W13).
  bossAttacks: [
    { name: "THE LONG EAR", icon: "🔔", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Know who's listening", emblemColor: 0x7df0ff },
    { name: "GLASS EYE", icon: "👁️", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Spot the little lens", emblemColor: 0xc084fc },
    { name: "MEGAPHONE MOUTH", icon: "💬", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "No secrets out loud", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W14 fight - unplug the listening
  // post - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Which of these has EARS?", answers: ["The smart speaker", "The teddy bear", "The toaster", "The pile of books"], correctIndex: 0, explanation: "If you can talk to it and it answers, it's got ears." },
      { question: "What wakes a smart speaker up?", answers: ["Hearing its name", "Sunlight", "A secret handshake", "Nothing - it never sleeps"], correctIndex: 0, explanation: "The name is the ON switch - and once awake, it hears much more." },
      { question: "Where do secrets go when smart ears are nearby?", answers: ["On paper, in a whisper away, or in another room", "Whispered right next to the speaker", "Straight to the speaker", "Nowhere - stop having secrets"], correctIndex: 0, explanation: "Out loud near smart ears is a megaphone - keep secrets off the air." },
    ],
    medium: [
      { question: "What's in the speaker's 'diary'?", answers: ["Recordings and questions it kept - which grown-ups can check and delete", "Its favorite songs", "Nothing, ever", "Your homework answers"], correctIndex: 0, explanation: "Smart ears sometimes record - and the copies live in an app grown-ups can open." },
      { question: "Which camera is doing its job RIGHT?", answers: ["The doorbell lens watching the front step", "A lens pointing at your bed", "A mystery camera nobody's asked about", "A toy filming the bathroom"], correctIndex: 0, explanation: "Front-step watching is the job; bedrooms are lens-free zones, and mystery lenses get asked about." },
      { question: "Why is push-to-talk better than always-on?", answers: ["The ear only opens while YOU hold the button", "It makes the TV louder", "It isn't better", "It records more"], correctIndex: 0, explanation: "Push-to-talk hands the ON switch to you - the ear hears only when you choose." },
    ],
    hard: [
      { question: "You said a password out loud near an awake speaker. What's the Scout move?", answers: ["Tell a grown-up and change the password", "Nothing - speakers forget instantly", "Whisper the same password next time", "Unplug every device forever"], correctIndex: 0, explanation: "A password in a recording isn't fully yours - change it, and keep the next one off the air." },
      { question: "Why do Scouts flip switches WITH a grown-up instead of alone?", answers: ["Together you pick the right settings - and they stay picked", "Alone is fine if you're really careful", "So the grown-up takes the blame", "Scouts never flip anything"], correctIndex: 0, explanation: "Patrol, point, flip together - that's how settings get right AND stay right." },
      { question: "Robo-Pup answers when you talk to it. What does a Scout know?", answers: ["It has ears - so it counts as a smart device, switches and all", "Toys can't listen", "It's magic", "Only phones can hear"], correctIndex: 0, explanation: "Answering back = ears. Even toys join the ears list - the Scout surprise of the week." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 14 - listen closely!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's listening through GADGETS now..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Scout kit ready? Here's the plan." } }, // mission brief
    3: { adam: { mood: "thinking", message: "Some things in your house have ears." }, layla: null }, // learn: ears
    4: { adam: { mood: "curious", message: "Ears on... or fast asleep?" }, layla: null }, // game: hookSort
    5: { adam: null, layla: { mood: "thumbsup", message: "Careful - one was a surprise!" } }, // prove: recall
    6: { adam: null, layla: { mood: "excited", message: "Every ear in the house - spotted!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "One of them keeps a diary..." } }, // learn: diary
    8: { adam: null, layla: { mood: "excited", message: "Open the diary - tap away!" } }, // game: reveal
    9: { adam: { mood: "worried", message: "He's fibbing about the speaker - catch him!" }, layla: null }, // prove: lie
    10: { adam: { mood: "excited", message: "Diary read - nothing hides from you!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Little glass eyes, hiding in plain sight." }, layla: null }, // learn: eyes
    12: { adam: { mood: "curious", message: "Two lenses in the dusk - find them!" }, layla: null }, // game: buttonHunt
    13: { adam: null, layla: { mood: "thumbsup", message: "Quick - which one can watch?" } }, // prove: speed
    14: { adam: null, layla: { mood: "excited", message: "Lens-spotter extraordinaire!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Out loud = megaphone. Remember it." } }, // learn: whisper
    16: { adam: null, layla: { mood: "curious", message: "Keep every secret off the air!" } }, // game: decide
    17: { adam: { mood: "thumbsup", message: "Finish the megaphone rule!" }, layla: null }, // prove: finish
    18: { adam: { mood: "excited", message: "Your secrets stay YOURS!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Every ear has an OFF switch." }, layla: null }, // learn: switches
    20: { adam: { mood: "curious", message: "Safari time - flip the risky ones!" }, layla: null }, // game: settingsSwitch
    21: { adam: null, layla: { mood: "thumbsup", message: "Find, show, flip - in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - final patrol!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Quiet house or leaky house - you know!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His listening post - unplug it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Listen... beautiful quiet!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, Scout!" }, }, // stickers
    28: { adam: { mood: "thumbsup", message: "Settings Scout badge earned!" }, layla: null }, // completion
  },
};

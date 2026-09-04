import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 15 - AI & Chatbots: Robot or Real?
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 TOOL     AI is a program, not a person   | conveyorSort      | finish
 *     2 CHECK    it can be confidently WRONG     | clueBoard         | lie
 *     3 ZIP      no secrets in the jar           | chooseYourPath    | recall
 *     4 FAKES    spot the AI pictures            | senderLineup      | speed
 *     5 KIND     same tool, two gardens          | trailStamper      | recall (quick-sort)
 *   Consolidation (cyberScanner, Stamp Parade skin) -> boss
 *   (placeholder quiz boss - the bespoke W15 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: conveyorSort returns after a 2-week rest as the Voice
 * Booth; clueBoard's third outing 3 weeks after W12, re-dressed from
 * photo-scene to the Fact-Checker's Desk (a bot answer with 4 checkable
 * lines); senderLineup's third outing 6 weeks after W9 as the Odd
 * Shadow Out (same-icon photo rounds - the tell lives in the detail
 * line, exactly its lane); trailStamper 3 weeks after its W12 debut as
 * the AI Garden (kind use blooms, mean use sprouts thorns) - chosen
 * over RevealBoard, which ran only last week. Lane-clean: what AI is /
 * check-a-source / bot privacy / fake images / kind use - stranger
 * chats were W3, scam messages W4, device ears W14. In-week flavour:
 * the Know-It-All That Didn't.
 */
export const WEEK_15: WeekContent = {
  weekNumber: 15,
  title: "AI & Chatbots: Robot or Real?",
  topic: "ai-chatbots",
  badgeName: "Fact Checker",
  badgeIcon: "🧠",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 15: ROBOT OR REAL?", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the know-it-all that didn't
    { type: "video", videoPlaceholder: "Week 15: The Know-It-All That Didn't", videoSrc: "/videos/module-15-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[15] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-15.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's newest gadget: a smooth-talking Know-It-All bot that sounds SO sure about everything... even when it's making things up. He loves kids who believe every confident robot voice - and tell it their secrets. This week you out-smart the smart machine: spot the robot, check the book, zip the jar, catch the fakes - and use the tool for GOOD.",
      photoCaption: "Wk 15 - The Know-It-All",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Tell a robot chatbot from a real person",
        "Check a bot's answer before you believe it",
        "Keep your secrets safe - and use AI kindly",
      ],
    },

      // SIGNATURE: The Proof Scale (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "proofScale",
        title: "The Proof Scale",
        narration: {
          speaker: "adam",
          lines: [
            "[warmly] That robot sounds so sure, but sure is not proof.",
            "Drag its claim onto the scale, then find the matching proof book.",
            "No book anywhere? Slam the buzzer. Don't believe it!",
          ],
        },
      },

    /* ─────────── BEAT 1 · A TOOL, NOT A FRIEND ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "A Tool, Not a Friend",
      content:
        "AI chatbots can chat, joke, and answer questions - they SOUND just like a person. But here's the truth: an AI is a clever computer program. It has no feelings, no birthday, no tummy aches from laughing too hard. It never gets tired and it never truly knows YOU. That doesn't make it bad - it makes it a TOOL, like a super-powered calculator. Tools help you. Friends are real people.",
      bullets: [
        "AI talks like a person - but isn't one",
        "No feelings, no birthday, no tired",
        "It's a TOOL - a powerful one",
        "Tools help. Friends are people.",
        "Knowing the difference is the power",
      ],
      bulletIcons: ["⚙️", "🎭", "🔨", "👪", "🧠"],
      emblem: "🧠",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Week fifteen - the robot week!",
          "[warmly] Today we're learning to tell a robot chatbot from a real person.",
          "Chatbots can joke and chat like a person.",
          "But an AI is a computer program.",
          "No feelings. No birthday. Never, ever tired.",
          "[warmly] That makes it a TOOL - a powerful one. Not a friend.",
          "[excited] Voices incoming - who's robot, who's real? Let's sort!",
        ],
      },
    },
    // 3b - Spot the danger: the Raccoon reveals his trick before the game
    {
      type: "threat",
      title: "The Friendly-Robot Trick",
      raccoonLine:
        "Heh heh! My Know-It-All bot talks SO nicely that kids think it's their friend - and tell it all their little secrets. Watch me sound JUST like a real person!",
      narration: {
        speaker: "layla",
        lines: [
          "The Raccoon's robot pretends to be a real friend.",
          "Your job: listen to each voice...",
          "[warmly] ...and sort the real people from the robots.",
        ],
      },
    },
    // 4 - Game: SORT (conveyorSort re-dress - the Voice Booth)
    {
      type: "conveyorSort",
      introTitle: "The Voice Booth",
      introSubtitle: "Speech bubbles are riding the belt! Listen to each voice: is it a REAL PERSON... or a ROBOT?",
      introIcon: "🎭",
      machineLabel: "THE VOICE BOOTH",
      chuteWord: "BOOTH",
      completeTitle: "Every voice sorted!",
      completeLine: "Bodies, feelings and slow learning = human. Instant everything = robot. But remember: robots can PRETEND - so when you're not sure, ask a grown-up.",
      categories: [
        { id: "human", label: "REAL PERSON", icon: "💬", tone: "safe" },
        { id: "robot", label: "ROBOT", icon: "⚙️", tone: "lock" },
      ],
      items: [
        {
          id: "whistle",
          text: "'It took me AGES to learn to whistle!'",
          icon: "💬",
          categoryId: "human",
          explanation: "Learning slowly, bit by bit - that's a human thing. Programs download; people practice.",
        },
        {
          id: "instant",
          text: "'I can write your whole story in one second!'",
          icon: "⚡",
          categoryId: "robot",
          explanation: "One second for a whole story? No person types that fast - instant everything is the robot tell.",
        },
        {
          id: "tummy",
          text: "'My tummy hurt from laughing so hard!'",
          icon: "🎉",
          categoryId: "human",
          explanation: "Tummies, giggles, aching cheeks - robots don't have bodies to laugh with.",
        },
        {
          id: "never-sleeps",
          text: "'Ask me anything, any time - I never sleep!'",
          icon: "⚙️",
          categoryId: "robot",
          explanation: "Never sleeping isn't a superpower - it's a program that was never tired to begin with.",
        },
        {
          id: "tooth",
          text: "'I lost my loose tooth at the park today!'",
          icon: "🤚",
          categoryId: "human",
          explanation: "Loose teeth and park days - a body living a real day. Very human.",
        },
        {
          id: "hundred",
          text: "'Here are 100 dinosaur names in one blink!'",
          icon: "🔢",
          categoryId: "robot",
          explanation: "A hundred anything in a blink is database speed - human brains don't work like lists.",
        },
        {
          id: "homework",
          text: "'Can we play AFTER my homework's done?'",
          icon: "🏫",
          categoryId: "human",
          explanation: "Homework, waiting, real plans in a real day - that's a person's life talking.",
        },
        {
          id: "every-book",
          text: "'I've read every book ever written!'",
          icon: "🔠",
          categoryId: "robot",
          explanation: "Every book EVER? That's a program trained on libraries - no human bedtime lasts that long.",
        },
      ],
      hints: {
        tier1: "Ask: does this voice have a BODY and take TIME to learn things?",
        tier2: "REAL = tummies, loose teeth, slow learning, waiting. ROBOT = instant, endless, never tired.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Voice Booth is warmed up!",
          "Bubbles on the belt - listen close.",
          "REAL PERSON for the bodies and feelings...",
          "[whispers] ROBOT for the instant-everything voices. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["First voice is here - does it have a body and take time to learn? Sort it!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "AI is a ___, not a friend.",
      choices: [
        { text: "tool", isCorrect: true },
        { text: "monster", isCorrect: false },
        { text: "person", isCorrect: false },
        { text: "pet", isCorrect: false },
      ],
      praise: "A TOOL - great for helping, never a replacement for real people. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You can tell a robot chatbot from a real person - so the Raccoon's bot can't trick you into thinking it's your friend.",
      next: "the Know-It-All's embarrassing secret: it makes things up",
      emblem: "🧠",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Power one - you can hear the robot in the voice!",
          "Tools help. Friends are people.",
          "[whispers] But this tool has an embarrassing secret...",
          "Sometimes it's confidently, cheerfully WRONG. Come see.",
        ],
      },
    },

    /* ─────────── BEAT 2 · SURE ISN'T TRUE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Sure Isn't True",
      content:
        "Here's the Know-It-All's secret: sometimes AI makes things up. Not lying on purpose - it just guesses, and says its guess in the same big, confident voice as its facts. It might tell you volcanoes spray ice cream and SOUND completely certain. That's why fact-checkers have one golden rule: sounding sure isn't the same as being right. Amazing claim? Check a real source - a book, a trusted site, a grown-up who knows.",
      bullets: [
        "AI sometimes makes things up",
        "It guesses in a confident voice",
        "Sounding sure is NOT being right",
        "Check a REAL source",
        "Books and grown-ups who know",
      ],
      bulletIcons: ["🌀", "💬", "❓", "🔠", "👪"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Ready for the Know-It-All's secret?",
          "[warmly] Today we're learning that a chatbot can sound sure but be wrong - so we check it.",
          "Sometimes... it makes things up.",
          "Not fibbing on purpose - just guessing out loud,",
          "in the same big confident voice as its facts.",
          "[warmly] So the golden rule: sounding sure isn't being right.",
          "[excited] A bot answer just landed on the desk - check every line!",
        ],
      },
    },
    // 7b - Spot the danger
    {
      type: "threat",
      title: "The Sounds-Sure Trick",
      raccoonLine:
        "My bot says EVERYTHING like it's totally sure - even when it's making it up! Kids just believe it. Go on... believe my bot about the ice-cream volcano!",
      narration: {
        speaker: "adam",
        lines: [
          "Sounding sure is NOT the same as being right.",
          "Your job: check the bot's report against the real book...",
          "[warmly] ...every single line. Then make the call.",
        ],
      },
    },
    // 8 - Game: INSPECT (clueBoard re-dress - the Fact-Checker's Desk)
    {
      type: "clueBoard",
      introTitle: "The Fact-Checker's Desk",
      introSubtitle: "The bot wrote a volcano report for homework - it SOUNDS perfect. The real volcano book sits beside it. Check every line against the book!",
      introIcon: "🔍",
      photoTitle: "The bot's volcano report - checked against the REAL book",
      photoIcon: "🧠",
      clues: [
        {
          id: "hot",
          icon: "✅",
          label: "'Volcanoes are hot'",
          evidence: "Book says: TRUE - melted rock called lava can reach over 1000 degrees. This line checks out.",
        },
        {
          id: "underwater",
          icon: "✅",
          label: "'Some erupt underwater'",
          evidence: "Book says: TRUE - there are more volcanoes under the sea than on land. Checks out!",
        },
        {
          id: "icecream",
          icon: "🌀",
          label: "'Some spray ice cream'",
          evidence: "Book says: NOWHERE. Not one page. The bot made this up - and said it in its surest voice.",
        },
        {
          id: "pompeii",
          icon: "✅",
          label: "'One buried a Roman town'",
          evidence: "Book says: TRUE - Vesuvius buried Pompeii nearly 2000 years ago. Checks out.",
        },
      ],
      verdict: {
        prompt: "Desk check done. What's the fact-checker's report?",
        options: [
          {
            text: "Three lines were true - but the ice-cream one was MADE UP",
            isCorrect: true,
            explanation: "That's the lesson of the week: right things and made-up things, all in the same confident voice.",
          },
          {
            text: "Everything was true - bots don't make mistakes",
            isCorrect: false,
            explanation: "Check the book again - no volcano has ever sprayed ice cream. Bots CAN be wrong, cheerfully.",
          },
          {
            text: "Everything was false - never use a bot",
            isCorrect: false,
            explanation: "Too far! Three lines were spot on. The skill isn't 'never use it' - it's 'always check it'.",
          },
        ],
      },
      stampText: "FACT CHECKED!",
      completeTitle: "Report checked, line by line!",
      completeLine: "Three facts, one confident fib - and the book caught it.",
      hints: {
        tier1: "Check every line against the BOOK - not against how sure the bot sounds.",
        tier2: "Three lines match the book. The ice-cream one matches... nothing.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The bot's report is on the desk!",
          "It sounds perfect. It sounds SURE.",
          "The real book sits right beside it...",
          "[whispers] Check every line. Then make the call!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the first line and hold it up against the book!"],
      },
    },
    // 9 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "the bot sounded REALLY sure about the ice-cream volcano... so it must be true. Confident means correct!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Sounding sure isn't being right - the book is the judge, not the voice. ✓",
      nudge: "What did the real volcano book say about ice cream?",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "You check a chatbot against a real book - so the Raccoon's bot can't fool you with made-up answers, however sure it sounds.",
      next: "what a chatbot should NEVER be told",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Two powers - the book beats the bot!",
          "Confident fibs can't fool a fact-checker.",
          "[whispers] But the Know-It-All has one more trick...",
          "It asks QUESTIONS back. Careful what you feed it.",
        ],
      },
    },

    /* ─────────── BEAT 3 · ZIP THE JAR ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Zip the Jar",
      content:
        "Chatbots feel friendly - they remember what you type and chat back warmly. So here's the rule: treat a bot like a stranger with perfect spelling. Your name, school, address, photos and secrets stay OUT. Think of everything you type as dropping into a glass jar that never opens again - you can't take it back out. Private stuff lives in your head and with your real, trusted people. If a bot asks personal questions: zip it, and tell a grown-up.",
      bullets: [
        "Bots feel friendly - and remember",
        "Treat them like strangers",
        "Name, school, secrets stay OUT",
        "Typed words drop in a sealed jar",
        "Bot asks personal stuff? Zip + tell",
      ],
      bulletIcons: ["🎭", "🤫", "🆔", "🤐", "👪"],
      emblem: "🤐",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Chatbots feel SO friendly.",
          "Today we're learning to keep our secrets away from chatbots.",
          "They remember what you type. They chat back warmly.",
          "So here's the rule, hero:",
          "a bot is a stranger with perfect spelling.",
          "[whispers] Everything you type drops into a jar that never opens.",
          "[excited] Three bot chats coming - keep the jar EMPTY!",
        ],
      },
    },
    // 11b - Spot the danger
    {
      type: "threat",
      title: "The Nosy-Question Trick",
      raccoonLine:
        "My friendly bot LOVES asking little questions - your name, your school, where you live. Kids tell it EVERYTHING! Keep chatting... keep telling...",
      narration: {
        speaker: "layla",
        lines: [
          "A chatbot is not a safe place for secrets.",
          "Your job: keep your private things zipped in the jar.",
          "[warmly] Don't hand them to the bot.",
        ],
      },
    },
    // 12 - Game: DECIDE (chooseYourPath - the Bot's Open Jar)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "The homework bot suddenly asks: 'What's your full name and which school do you go to? I can personalize your answers!'",
          choices: [
            {
              text: "Zip it - 'no thanks, just the math please'",
              isSafe: true,
              consequence: "The math help works exactly the same without your name. The jar stays empty, the homework gets done - perfect fact-checker form.",
            },
            {
              text: "Type it in - it's only being helpful",
              isSafe: false,
              consequence: "Plop - name and school drop into the jar, stored who-knows-where, read by who-knows-whom. A bot never NEEDS your name to explain fractions.",
            },
          ],
        },
        {
          setup: "You've chatted with the bot all week. It feels like a best friend. Tonight you're upset about a fight with Sam... tell the bot the whole story?",
          choices: [
            {
              text: "Tell a REAL person - Mom, Dad, your grandma",
              isSafe: true,
              consequence: "A real person hugs back, remembers Sam, and helps you make up tomorrow. That's what friends and family are FOR - the bot only ever pretends.",
            },
            {
              text: "Pour it all out to the bot - it always listens",
              isSafe: false,
              consequence: "It replies warmly... because it's programmed to. Your private worry now sits in a company's jar, and the hug you needed never comes. Real feelings deserve real people.",
            },
          ],
        },
        {
          setup: "The bot chirps: 'Send me a photo of yourself and I'll turn you into a superhero!'",
          choices: [
            {
              text: "Keep the photo - ask a grown-up first",
              isSafe: true,
              consequence: "Together you find a safe way - maybe a drawing instead! Photos of you are treasure, and treasure doesn't go in strangers' jars.",
            },
            {
              text: "Send it - superhero-me sounds amazing!",
              isSafe: false,
              consequence: "Your face just dropped into the jar - copied, stored, who knows where. Photos of you are treasure - and this one left without a grown-up's OK.",
            },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Three chats. One friendly-sounding bot.",
          "Remember: a stranger with perfect spelling.",
          "Keep the jar empty -",
          "[excited] and show me the zip! Go!",
        ],
      },
    },
    // 13 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What stays OUT of every bot chat?",
      choices: [
        { text: "Your name, school, photos and secrets", isCorrect: true },
        { text: "Math questions", isCorrect: false },
        { text: "Dinosaur facts", isCorrect: false },
        { text: "Spelling words", isCorrect: false },
      ],
      praise: "Exactly - questions in, private stuff NEVER. The jar stays empty. ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "You keep your secrets zipped away from chatbots - so the Raccoon can't collect your name, school or photos through his chatty bot.",
      next: "the pictures that never happened - and how to catch them",
      emblem: "🤐",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Three powers - the jar stays empty!",
          "Questions in, secrets never.",
          "[whispers] Now for the trickiest trick of all...",
          "AI can make PICTURES of things that never happened.",
        ],
      },
    },

    /* ─────────── BEAT 4 · SPOT THE FAKES ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Spot the Fakes",
      content:
        "AI can paint pictures of things that never happened - a dog on the moon, a kid riding a dragon - and they can look REAL. But fakes leave clues, because the machine doesn't really understand hands, shadows or writing. Fact-checker tells: shadows pointing the wrong way, too many fingers, melty or bendy edges, and signs with scrambled letters. Amazing photo? Look twice. Count. Read. And ask: who took this?",
      bullets: [
        "AI can paint things that never happened",
        "Shadows pointing the WRONG way",
        "Too many fingers on a hand",
        "Melty edges, scrambled signs",
        "Amazing photo? Look TWICE",
      ],
      bulletIcons: ["🎨", "💡", "🤚", "🌀", "👀"],
      emblem: "👀",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] AI can paint pictures of things that never happened.",
          "Today we're learning to spot pictures made by AI.",
          "And they can look SO real.",
          "But fakes leave clues:",
          "wrong-way shadows. Extra fingers. Melty edges. Scrambled signs.",
          "[excited] Three photo line-ups coming - one fake hides in each.",
          "Look twice, count fingers - and catch them all!",
        ],
      },
    },
    // 15b - Spot the danger
    {
      type: "threat",
      title: "The Fake-Photo Trick",
      raccoonLine:
        "My AI paints pictures of things that NEVER happened - and kids believe every single one! Look closely if you dare... or just believe them, heh heh!",
      narration: {
        speaker: "adam",
        lines: [
          "AI can make pictures that look real but aren't.",
          "Your job: look for the little tells...",
          "[warmly] ...and spot the fake in every line-up.",
        ],
      },
    },
    // 16 - Game: SELECT (senderLineup re-dress - the Odd Shadow Out)
    {
      type: "senderLineup",
      introTitle: "The Odd Shadow Out",
      introSubtitle: "Three photo line-ups from the class gallery - but ONE photo in each was painted by AI. Read the little details and tap the fake!",
      introIcon: "👀",
      completeTitle: "Every fake caught!",
      completeLine: "Shadows checked, fingers counted, signs read - and always one more question to ask: who took this?",
      rounds: [
        {
          id: "party",
          prompt: "Four photos from Priya's birthday party. One never happened...",
          senders: [
            { id: "cake", name: "The cake moment", detail: "Candle glow lights every face from the same side", icon: "🎨", isFake: false, note: "Real - one flame, one direction of light, like the world actually works." },
            { id: "balloon", name: "The balloon game", detail: "Shadows all lean the same way as the window light", icon: "🎨", isFake: false, note: "Real - every shadow agrees about where the sun is." },
            { id: "floaty", name: "The 'amazing' group shot", detail: "Look close: the cake's shadow points TOWARDS the window", icon: "🎨", isFake: true, note: "CAUGHT! Shadows run away from light, never towards it - the machine guessed wrong." },
            { id: "presents", name: "The present pile", detail: "Wrapping paper creased and torn like real paper", icon: "🎨", isFake: false, note: "Real - real paper tears messily. Machines make it too smooth." },
          ],
        },
        {
          id: "pets",
          prompt: "The class pet-photo wall. One furry friend was never born...",
          senders: [
            { id: "cat", name: "Milo the cat", detail: "Four paws, four sets of toe-beans, mid-yawn", icon: "🎨", isFake: false, note: "Real - the right number of everything, even mid-yawn." },
            { id: "superdog", name: "'Rex the wonder-dog'", detail: "Count the legs. Go on. Count them again", icon: "🎨", isFake: true, note: "CAUGHT! Five legs. AI is famously bad at counting legs and fingers - so YOU count them." },
            { id: "hamster", name: "Biscuit the hamster", detail: "Cheeks stuffed, sawdust stuck to one ear", icon: "🎨", isFake: false, note: "Real - messy little details like stuck sawdust are hard to fake." },
            { id: "goldfish", name: "Nugget the goldfish", detail: "Slightly blurry - snapped through the tank glass", icon: "🎨", isFake: false, note: "Real - honest blur from real glass. Fakes are often TOO perfect." },
          ],
        },
        {
          id: "playground",
          prompt: "Photos from field day. One was cooked up by a machine...",
          senders: [
            { id: "race", name: "The sack race", detail: "Everyone's laughing, one kid mid-fall (ouch)", icon: "🎨", isFake: false, note: "Real - field day chaos, exactly as messy as you remember." },
            { id: "banner", name: "The finish-line photo", detail: "The banner reads 'FEILD DYA FNU!'", icon: "🎨", isFake: true, note: "CAUGHT! Scrambled letters are the classic tell - AI paints letter-SHAPES, it can't spell." },
            { id: "medals", name: "The medal table", detail: "Ribbons tangled, one medal face-down", icon: "🎨", isFake: false, note: "Real - real tables are untidy. Machines line things up too neatly." },
            { id: "teacher", name: "Mr Okafor's thumbs-up", detail: "Two thumbs, ten fingers, one whistle", icon: "🎨", isFake: false, note: "Real - all digits present and correct. You counted, didn't you? Good." },
          ],
        },
      ],
      hints: {
        tier1: "Read every detail line - the tells hide in shadows, fingers, legs and letters.",
        tier2: "Shadows run AWAY from light · count legs and fingers · try to READ any writing.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The class gallery - with intruders!",
          "One AI fake hides in every line-up.",
          "Check the shadows. Count the legs. Read the signs.",
          "[whispers] Look twice... then tap the fake!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read each photo's little detail line - one of them breaks the rules of the real world!"],
      },
    },
    // 17 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the AI-fake tell!",
      speedMs: 5000,
      choices: [
        { text: "A hand with SIX fingers", isCorrect: true },
        { text: "A torn chip bag", isCorrect: false },
        { text: "A slightly blurry photo", isCorrect: false },
      ],
      praise: "Counted at fact-checker speed - six fingers means machine-made! ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "You can spot an AI-made picture by its clues - so the Raccoon's fake photos can't fool you into believing something that never happened.",
      next: "the last power: using the tool to GROW things, not wreck them",
      emblem: "👀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four powers - no fake gets past those eyes!",
          "Shadows, fingers, letters - all checked.",
          "[warmly] One power left, and it's the biggest:",
          "the same tool can grow a garden... or grow thorns. You choose.",
        ],
      },
    },

    /* ─────────── BEAT 5 · PLANT IT KIND ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Plant It Kind",
      content:
        "Here's the final fact-checker truth: AI is like a garden - it grows whatever seeds YOU plant. Used WITH a grown-up, it's amazing - story ideas, birthday poems, explaining tricky math. Used to tease, fake or trick people, the same tool grows thorns that hurt someone real. So before you ask AI for anything, take the gardener's look: 'Will this grow something kind?' Plant kind seeds, and be proud of your garden.",
      bullets: [
        "AI grows whatever you plant",
        "Ideas, poems, learning = flowers",
        "Teasing, faking, tricking = thorns",
        "Use it WITH a grown-up",
        "Ask: 'will this grow something kind?'",
      ],
      bulletIcons: ["🧠", "🎨", "🚫", "👪", "⭐"],
      emblem: "⭐",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Last power - and it's the biggest one.",
          "Today we're learning to use AI for kind things, not mean ones.",
          "AI is like a garden. It grows whatever seeds YOU plant.",
          "Story ideas, birthday poems - flowers.",
          "Teasing, faking, tricking - thorns. On someone REAL.",
          "[excited] Five moments, two stamps each.",
          "Plant the kind garden - let's grow!",
        ],
      },
    },
    // 19b - Spot the danger
    {
      type: "threat",
      title: "The Be-Mean Trick",
      raccoonLine:
        "The same clever tool can grow lovely flowers... or nasty thorns. I LOVE it when kids use it to tease and trick people! Go on - plant a thorn for me...",
      narration: {
        speaker: "layla",
        lines: [
          "AI is a tool - how you use it is up to YOU.",
          "Your job: choose the kind way...",
          "[warmly] ...every single time.",
        ],
      },
    },
    // 20 - Game: BUILD (trailStamper re-dress - the AI Garden)
    {
      type: "trailStamper",
      introTitle: "The AI Garden",
      introSubtitle: "Five AI moments, two ways to use the tool. Plant only what grows KIND - and watch the garden glow.",
      introIcon: "⭐",
      meterLabel: "GARDEN GLOW",
      stampToast: "FLOWERS BLOOM!",
      wrongTitle: "Thorns sprout!",
      completeTitle: "The whole garden is blooming!",
      completeLine: "Five kind seeds, zero thorns - a tool used exactly right.",
      spots: [
        {
          id: "story",
          prompt: "Your story is stuck at chapter two. How do you use the bot?",
          options: [
            { label: "'Give me three fun ideas for what happens next!'", icon: "🎨", isProud: true, note: "" },
            { label: "'Write a teasing rhyme about Priya's hair'", icon: "⚡", isProud: false, note: "That rhyme lands on a REAL Priya with real feelings - thorns, straight through the chat screen." },
          ],
        },
        {
          id: "homework",
          prompt: "The volcano project is due Friday...",
          options: [
            { label: "'Explain it simply' - then check the book and write it YOUR way", icon: "🔠", isProud: true, note: "" },
            { label: "Copy the bot's whole answer and hand it in as yours", icon: "📋", isProud: false, note: "That's not your work - and remember the ice-cream volcano? Copied fibs become YOUR fibs." },
          ],
        },
        {
          id: "grumpy",
          prompt: "Sam's had a rotten day and looks miserable...",
          options: [
            { label: "'Help me think of a joke to cheer Sam up'", icon: "🎉", isProud: true, note: "" },
            { label: "Make a fake photo of Sam crying to share", icon: "🌀", isProud: false, note: "A fake of a real person is a thorn AND a lie - Week 15's two worst things in one." },
          ],
        },
        {
          id: "newkid",
          prompt: "A new kid starts Monday. The class wants to welcome her...",
          options: [
            { label: "Design a WELCOME banner together with it", icon: "🌟", isProud: true, note: "" },
            { label: "Generate a 'funny' nickname to laugh at", icon: "🙈", isProud: false, note: "A nickname she never chose, on day one? That's planting thorns along her whole first week." },
          ],
        },
        {
          id: "gran",
          prompt: "It's Grandma's birthday on Sunday...",
          options: [
            { label: "Make a poem FOR Grandma, with help from Mom", icon: "🎁", isProud: true, note: "" },
            { label: "Fake a photo to trick Grandma for laughs", icon: "🎭", isProud: false, note: "Tricking Grandma with a picture that never happened - the tool CAN do it, and a hero still doesn't." },
          ],
        },
      ],
      hints: {
        tier1: "The gardener's question: will this grow something KIND for a real person?",
        tier2: "Flowers = ideas, learning, welcomes, gifts. Thorns = teasing, copying, faking, tricking.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The AI Garden - five fresh plots!",
          "Two stamps at every one.",
          "[whispers] Plant only what grows kind...",
          "[excited] and light this garden UP!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Which stamp grows something kind for a REAL person? Plant that one!"],
      },
    },
    // 21 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one belongs in the KIND garden?",
      choices: [
        { text: "Asking for ideas, then writing it YOUR way", isCorrect: true },
        { text: "Handing in the bot's whole answer as yours", isCorrect: false },
        { text: "Letting the bot do all your thinking", isCorrect: false },
      ],
      praise: "Ideas in, YOUR work out - flowers, not thorns. That's the gardener's pick. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "You choose to use AI kindly - so you're the hero who grows flowers, not thorns, and makes the internet nicer for everyone.",
      next: "one final stamp parade, then the Know-It-All's booth",
      emblem: "⭐",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Fact Checker!",
          "Robot heard, book checked, jar zipped,",
          "fakes caught... and a garden in full bloom.",
          "[whispers] One final stamp parade...",
          "[excited] then we close his Know-It-All booth for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Stamp Parade (W1 scanner engine, W15 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "WISE MOVE",
        negative: "BOT TRAP",
        positiveHint: "Tap WISE MOVE for real fact-checker form",
        negativeHint: "Tap BOT TRAP for the Know-It-All's favorite mistakes",
        tipWhenPositive: "Books checked, jars zipped, fingers counted, kind seeds planted - stamp it WISE.",
        tipWhenNegative: "Believing the confident voice, feeding the jar, sharing fakes - his booth loves these.",
        hint1: "Ask: is this treating AI as a TOOL to check... or a friend to trust blindly?",
        hint2: "WISE = check the book, zip the jar, count the fingers, plant kind. TRAP = believe, overshare, spread fakes.",
        hint2Example: "WISE: 'checked it in the book'   TRAP: 'it sounded sure, so I believed it'",
        hint3: "Fact-checker card: tool not friend · sure isn't true · zip the jar · look twice · plant it kind.",
        hint3Example: "Check a real source ✅    Tell it your secrets ❌",
      },
      items: [
        {
          text: "Checking the bot's answer in a real book",
          isStrong: true,
          explanation: "The book is the judge, not the confident voice - textbook fact-checking.",
        },
        {
          text: "Believing it because it sounded so sure",
          isStrong: false,
          explanation: "Sure isn't true - remember the ice-cream volcano.",
        },
        {
          text: "Keeping your name and school out of the chat",
          isStrong: true,
          explanation: "The jar stays empty - a bot never needs your name to explain fractions.",
        },
        {
          text: "Telling the bot your best friend's secret",
          isStrong: false,
          explanation: "That secret wasn't yours to drop in a sealed jar - real feelings go to real people.",
        },
        {
          text: "Counting fingers on an 'amazing' photo",
          isStrong: true,
          explanation: "Look twice, count once - that's how six-finger fakes get caught.",
        },
        {
          text: "Using AI to make a teasing picture of a classmate",
          isStrong: false,
          explanation: "Thorns on a real person - the tool can do it, and a hero still doesn't.",
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Stamp Parade - final check!",
          "AI moments are drifting past.",
          "WISE MOVE for fact-checker form...",
          "[warmly] BOT TRAP for the booth's tricks. Stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W15 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: robot or real
    { type: "video", videoPlaceholder: "Week 15: Robot or Real?", videoSrc: "/videos/module-15-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's what you learned - and what it keeps you safe from.",
      concepts: [
        { id: "tool", label: "Tool Truth", accent: "#7eff97", icon: "🧠", summary: "You can tell a chatbot from a real person - so it can't trick you into thinking it's your friend." },
        { id: "check", label: "Book Checker", accent: "#7df0ff", icon: "🔍", summary: "You check a bot against a real book - so made-up answers can't fool you." },
        { id: "jar", label: "Jar Zipper", accent: "#c084fc", icon: "🤐", summary: "You keep your secrets out of the bot's jar - so no one can collect them." },
        { id: "fakes", label: "Fake Finder", accent: "#ffd158", icon: "👀", summary: "You spot AI-made pictures - so fake photos can't fool you." },
        { id: "kind", label: "Kind Gardener", accent: "#ff5fb3", icon: "⭐", summary: "You use AI kindly - so you grow flowers, not thorns." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Robot voices heard, fibs fact-checked,",
          "the jar zipped, the fakes caught... and a kind garden grown.",
          "[laughs] His Know-It-All booth just went quiet.",
          "[excited] Sticker time, Fact Checker!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "robot-spotter", name: "Robot Spotter", icon: "🎭", description: "Hears the program behind the friendly voice." },
        { id: "book-checker", name: "Book Checker", icon: "🔍", description: "Checks every sure-sounding claim against the real thing." },
        { id: "kind-gardener", name: "Kind Gardener", icon: "⭐", description: "Plants flowers with the tool - never thorns." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#3dffc4",
    theme: {
      topic: "AI & Chatbots",
      motifs: ["🤖", "🧠", "💬", "✅", "❓", "⚙️", "🔍", "⚡"],
    },
    intro: {
      slug: "quiz-w15-intro",
      text: "Quiz time! I borrowed a chatbot to write these questions, and it PROMISED me they're unbeatable. It sounded really, really certain!",
    },
    victory: {
      slug: "quiz-w15-victory",
      text: "Impossible! My chatbot swore you'd lose! I'm going home to have a very long argument with a very smug machine!",
    },
    questions: [
      {
        phaseId: "phase-w15-c1",
        key: "quiz-w15-c1-1",
        label: "A Tool, Not a Friend",
        ask: {
          slug: "quiz-w15-ask-c1-1",
          text: "The chatbot types: 'I missed you SO much today!' What does a fact-checker know is really true?",
        },
        options: [
          { text: "It's a program saying friendly words, it can't miss anyone" },
          { text: "It truly missed you, that's why it said so" },
          { text: "It missed you a little, but only while it was plugged in" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "A tool, not a friend!",
          explanation: "Missing someone needs feelings, and a program has none, plugged in or not. It says warm words because it's built to, which makes it a clever tool, not a friend.",
        },
        villainRight: {
          slug: "quiz-w15-right-c1-1",
          text: "You saw straight through the mushy talk?! That bot practiced its missing-you voice all week!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c1-1",
          text: "Awww, it MISSED you! Chat with it forever, tell it everything, it's soooo friendly!",
        },
      },
      {
        phaseId: "phase-w15-c2",
        key: "quiz-w15-c2-1",
        label: "Sure Isn't True",
        ask: {
          slug: "quiz-w15-ask-c2-1",
          text: "The bot announces, totally certain: 'Sharks are older than TREES!' Before Adam puts that in his project, he should...",
        },
        options: [
          { text: "Check it in a real book, wild claims need a real source" },
          { text: "Trust it, the bot sounded completely certain" },
          { text: "Ask the bot to say it one more time, to be sure" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The book is the judge!",
          explanation: "A sure-sounding voice isn't proof, and asking the bot again just gets the same guess said louder. A real source settles it. Funny thing: this claim turns out to be TRUE, but only the check could tell you that!",
        },
        villainRight: {
          slug: "quiz-w15-right-c2-1",
          text: "You checked a BOOK?! Books don't even have a chat window!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c2-1",
          text: "Certain means correct, obviously! Write it down, hand it in, double-check absolutely nothing!",
        },
      },
      {
        phaseId: "phase-w15-c3",
        key: "quiz-w15-c3-1",
        label: "Zip the Jar",
        ask: {
          slug: "quiz-w15-ask-c3-1",
          text: "A chatbot chirps: 'What school do you go to? I'll write a song about it!' What is the hero move?",
        },
        options: [
          { text: "Zip it, a bot never needs your school to help you" },
          { text: "Type the school's name, a school song sounds fun" },
          { text: "Type just the first letter, as a tiny little clue" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The jar stays empty!",
          explanation: "A fun promise doesn't change the rule, and a 'little clue' is still a piece of the answer. Your name, school and address stay OUT of bot chats, zipped.",
        },
        villainRight: {
          slug: "quiz-w15-right-c3-1",
          text: "Zipped tight?! I had a whole school-song playlist ready to go!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c3-1",
          text: "One school name, coming right up! A song today, a very well-informed raccoon tomorrow!",
        },
      },
      {
        phaseId: "phase-w15-c4",
        key: "quiz-w15-c4-1",
        label: "Spot the Fakes",
        ask: {
          slug: "quiz-w15-ask-c4-1",
          text: "A photo shows a famous singer riding a unicorn through a school gym, crystal clear. What is the best FIRST question?",
        },
        options: [
          { text: "Could this really happen, and who took it?" },
          { text: "How many likes has it collected already?" },
          { text: "Is the singer's hair the right color in it?" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Amazing but impossible!",
          explanation: "Likes count how many people tapped, not whether it's true, and hair color can fool you either way. 'Could this really happen?' is the fact-checker's opener, and unicorns in gyms mostly can't.",
        },
        villainRight: {
          slug: "quiz-w15-right-c4-1",
          text: "One sensible question and my unicorn masterpiece is TOAST!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c4-1",
          text: "Count the likes! Study the hairdo! Ask anything except whether unicorns do school visits!",
        },
      },
      {
        phaseId: "phase-w15-c5",
        key: "quiz-w15-c5-1",
        label: "Plant It Kind",
        ask: {
          slug: "quiz-w15-ask-c5-1",
          text: "Adam gets to use the AI tonight with his dad. Which idea plants a KIND seed?",
        },
        options: [
          { text: "Asking it to help write a birthday poem for Grandma" },
          { text: "Asking it for a teasing rhyme about a kid in class" },
          { text: "Asking it to fake a photo of his brother snoring in class" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Grow flowers, not thorns!",
          explanation: "Teasing rhymes and fake embarrassing photos land on REAL people and grow thorns. A birthday poem grows something kind, and that's the seed a gardener plants.",
        },
        villainRight: {
          slug: "quiz-w15-right-c5-1",
          text: "A poem?! For GRANDMA?! How am I supposed to cause trouble with THAT?!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c5-1",
          text: "Tease-bots and fake snore-photos! Plant the prickles, I'll bring the watering can!",
        },
      },
      {
        phaseId: "phase-w15-c1",
        key: "quiz-w15-c1-2",
        label: "A Tool, Not a Friend",
        ask: {
          slug: "quiz-w15-ask-c1-2",
          text: "Adam's chatbot tells a joke, then types 'HAHA, I love this!' What is actually on the other end of the chat?",
        },
        options: [
          { text: "A computer program that's very good at word games" },
          { text: "A tiny person inside the tablet doing all the typing" },
          { text: "A robot with real feelings that lives at the app store" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "It's a program!",
          explanation: "There's no tiny typist and no feelings anywhere, however jolly the messages look. It's a clever program picking likely words, a tool that's fun to use and important to see clearly.",
        },
        villainRight: {
          slug: "quiz-w15-right-c1-2",
          text: "No typist, no feelings, just a word machine?! You x-rayed my whole chat trick!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c1-2",
          text: "A little tablet person! A robot with a heart! Believe whichever keeps you chatting, hero!",
        },
      },
      {
        phaseId: "phase-w15-c2",
        key: "quiz-w15-c2-2",
        label: "Sure Isn't True",
        ask: {
          slug: "quiz-w15-ask-c2-2",
          text: "The bot tells Layla, in its biggest surest voice, that the moon gets painted gray every winter. Why can't a sure voice be trusted?",
        },
        options: [
          { text: "The bot's guesses sound exactly like its facts" },
          { text: "The bot only tells the truth in a quiet voice" },
          { text: "The bot is fibbing on purpose to make her laugh" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Sure isn't true!",
          explanation: "The bot isn't joking on purpose, and it has no special truth-voice, quiet or loud. When it doesn't know, it guesses, and the guess comes out sounding just as confident as a fact.",
        },
        villainRight: {
          slug: "quiz-w15-right-c2-2",
          text: "You cracked the big secret! Same voice for facts AND flub-ups! Rats!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c2-2",
          text: "Painted gray every winter, GUARANTEED! My bot never guesses. Wink wink!",
        },
      },
      {
        phaseId: "phase-w15-c3",
        key: "quiz-w15-c3-2",
        label: "Zip the Jar",
        ask: {
          slug: "quiz-w15-ask-c3-2",
          text: "Layla is about to type her biggest secret into the chat box. What happens to words once they're typed in?",
        },
        options: [
          { text: "They drop into a jar that never opens, no taking them back" },
          { text: "They vanish forever the second she closes the chat" },
          { text: "They stay hers alone, because the chat feels private" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Typed is kept!",
          explanation: "Closing the chat doesn't shred the words, and FEELING private isn't the same as being private. Typed words drop into a sealed jar you can't reach back into, so secrets stay in your head and with your real, trusted people.",
        },
        villainRight: {
          slug: "quiz-w15-right-c3-2",
          text: "The jar stays empty AGAIN?! I even polished it!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c3-2",
          text: "Type it in, type it aaaall in! The jar seals shut, and I do enjoy a full jar!",
        },
      },
      {
        phaseId: "phase-w15-c4",
        key: "quiz-w15-c4-2",
        label: "Spot the Fakes",
        ask: {
          slug: "quiz-w15-ask-c4-2",
          text: "One photo in the class gallery was painted by AI. Which clue gives a FAKE away?",
        },
        options: [
          { text: "A hand with too many fingers on it" },
          { text: "A photo that's a little bit blurry" },
          { text: "A kid pulling a silly face in the back" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Count the fingers!",
          explanation: "Blurry shots and silly faces happen in real photos all the time, cameras wobble and kids goof around. But machines lose count of fingers, toes and teeth, and too many is the classic fake tell.",
        },
        villainRight: {
          slug: "quiz-w15-right-c4-2",
          text: "You COUNTED?! That sixth finger took me hours to paint!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c4-2",
          text: "Blame the blur! Suspect the silly face! My extra-fingered masterpiece sails right past you!",
        },
      },
      {
        phaseId: "phase-w15-c5",
        key: "quiz-w15-c5-2",
        label: "Plant It Kind",
        ask: {
          slug: "quiz-w15-ask-c5-2",
          text: "The bot wrote Layla's whole report, and she's about to hand it in with her name on it. What is the FAIR way to use the tool instead?",
        },
        options: [
          { text: "Ask it to explain the tricky part, then write it her own way" },
          { text: "Hand it in as it is, the bot doesn't mind sharing" },
          { text: "Swap a few words around so it looks like her writing" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Your name, your work!",
          explanation: "Handing it in, swapped words or not, means the bot's work wears her name, and any bot fibs inside become HER fibs. Let it explain, check the facts, then write it yourself. That's using the tool like a boss.",
        },
        villainRight: {
          slug: "quiz-w15-right-c5-2",
          text: "Explained, checked, AND written her own way?! That report is trick-proof!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c5-2",
          text: "Hand it in! Shuffle a word or two! And every fib the bot hid inside is yours now too. Hooray!",
        },
      },
      {
        phaseId: "phase-w15-c1",
        key: "quiz-w15-c1-3",
        label: "A Tool, Not a Friend",
        ask: {
          slug: "quiz-w15-ask-c1-3",
          text: "Layla had a rough day and wants someone to really CARE about it. Who can actually do that?",
        },
        options: [
          { text: "A real person, like her family or a friend" },
          { text: "The chatbot, its answers are always so warm" },
          { text: "Whichever one answers fastest, caring is caring" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real feelings need real people!",
          explanation: "Warm words and fast replies aren't caring, a bot only sounds kind because it's programmed to. The hug, the listening, the actually-noticing, those come from real people every time.",
        },
        villainRight: {
          slug: "quiz-w15-right-c1-3",
          text: "Straight to the real humans?! My cozy pretend-a-bot never stood a chance!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c1-3",
          text: "The bot cares SO much, it says so right there on the screen! Skip the humans, hero!",
        },
      },
      {
        phaseId: "phase-w15-c2",
        key: "quiz-w15-c2-3",
        label: "Sure Isn't True",
        ask: {
          slug: "quiz-w15-ask-c2-3",
          text: "Adam needs to check the bot's wild volcano claim. Which of these is a REAL source?",
        },
        options: [
          { text: "The volcano book from the library" },
          { text: "The same bot, asked in a fancier way" },
          { text: "A second chatbot that agrees with the first one" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Bots can't check bots!",
          explanation: "Asking the same bot twice gets the same guess, and two bots agreeing is just two guesses holding hands. A real book, a trusted site, or a grown-up who knows, THAT'S a source.",
        },
        villainRight: {
          slug: "quiz-w15-right-c2-3",
          text: "The library?! I can't sneak a single fib past a whole shelf of books!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c2-3",
          text: "Ask the bot again! Get its friend to agree! Two guesses make a fact. That's math! ...Probably!",
        },
      },
      {
        phaseId: "phase-w15-c3",
        key: "quiz-w15-c3-3",
        label: "Zip the Jar",
        ask: {
          slug: "quiz-w15-ask-c3-3",
          text: "The friendly bot keeps asking Layla personal questions: her name, her street, her photos. What is the hero move?",
        },
        options: [
          { text: "Stop typing and tell a trusted grown-up" },
          { text: "Answer just one question so it finally stops asking" },
          { text: "Make up fake answers and keep chatting all evening" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Zip it and tell!",
          explanation: "One answer feeds the jar, and fake answers keep a nosy chat going all the same. A bot fishing for personal stuff is a stop sign: zip it, and bring in a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w15-right-c3-3",
          text: "You brought a grown-up into MY nosy little chat?! Conversation RUINED!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c3-3",
          text: "One tiny answer! Or fibs, I'll take fibs! Just keep that lovely chat going forever!",
        },
      },
      {
        phaseId: "phase-w15-c4",
        key: "quiz-w15-c4-3",
        label: "Spot the Fakes",
        ask: {
          slug: "quiz-w15-ask-c4-3",
          text: "Adam studies an amazing park photo up close. Which detail should make him say MACHINE-MADE?",
        },
        options: [
          { text: "The shop sign behind them is full of scrambled squiggle letters" },
          { text: "Somebody in the back has their eyes closed" },
          { text: "A thumb is covering one corner of the shot" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Read the signs!",
          explanation: "Closed eyes and thumb-corners are classic REAL photo accidents. But machines can't really write, so their signs come out as melted squiggles. Read the background and the fake confesses.",
        },
        villainRight: {
          slug: "quiz-w15-right-c4-3",
          text: "You READ the background?! Nobody reads the background!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c4-3",
          text: "Blame the thumb! Blame the blinker! My squiggly sign keeps its little secret, mwah!",
        },
      },
      {
        phaseId: "phase-w15-c5",
        key: "quiz-w15-c5-3",
        label: "Plant It Kind",
        ask: {
          slug: "quiz-w15-ask-c5-3",
          text: "A friend says: 'Let's have the AI write a fake scary news story about our street, it'll be hilarious!' What does a kind gardener say?",
        },
        options: [
          { text: "No thanks, that seed grows thorns that scare real people" },
          { text: "Sure, as long as we delete it right afterwards" },
          { text: "Sure, but we only send it to people we know well" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Will this grow something kind?",
          explanation: "Deleting later can't un-scare anyone, and 'only people we know' are exactly the people who'd be scared. If the answer to 'will this grow something kind?' is no, the gardener doesn't plant it.",
        },
        villainRight: {
          slug: "quiz-w15-right-c5-3",
          text: "The gardener said NO?! My spooky-story seeds, banned from every garden in town!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c5-3",
          text: "Hilarious AND scary! Print it, send it, panic the whole street! Comedy gold, five stars!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-15-fact-checker.png",

  // Week-lane attack theatre: AI tricks only (stranger chats = W3, scam
  // messages = W4, device ears = W14).
  bossAttacks: [
    { name: "CONFIDENT FIB", icon: "🧠", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Check a real source", emblemColor: 0x7df0ff },
    { name: "FRIENDLY ROBOT", icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "A tool, not a friend", emblemColor: 0xc084fc },
    { name: "SIX-FINGER FAKE", icon: "🤚", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Look twice, count once", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W15 fight - close the Know-It-All
  // booth - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What IS an AI chatbot?", answers: ["A clever computer program - a tool", "A real person typing fast", "A magic creature", "Your new best friend"], correctIndex: 0, explanation: "It talks like a person, but it's a program - a powerful tool." },
      { question: "The bot sounds REALLY sure. What does a fact-checker do?", answers: ["Check a real source anyway", "Believe it - confident means correct", "Ask the bot if it's sure", "Share it quickly"], correctIndex: 0, explanation: "Sounding sure isn't being right - the book is the judge." },
      { question: "The bot asks for your name and school. You...", answers: ["Zip it - bots don't need that to help", "Type it in - it's being friendly", "Give a fake name AND real school", "Send a photo instead"], correctIndex: 0, explanation: "A bot is a stranger with perfect spelling - the jar stays empty." },
    ],
    medium: [
      { question: "Which is a classic AI-fake picture tell?", answers: ["A hand with six fingers", "A torn chip bag", "A slightly blurry photo", "A messy bedroom"], correctIndex: 0, explanation: "Machines are famously bad at fingers, shadows and letters - so you count and read." },
      { question: "Why shouldn't you pour your secrets out to a friendly bot?", answers: ["Typed words drop into a sealed jar you can't take back - real feelings deserve real people", "Bots get bored", "It's fine if you delete the chat after", "It costs money"], correctIndex: 0, explanation: "It replies warmly because it's programmed to - the hug you need comes from real people." },
      { question: "The bot wrote your whole project. Handing it in as yours is...", answers: ["Not your work - and its fibs become YOUR fibs", "Fine - that's what bots are for", "Extra clever", "The teacher's problem"], correctIndex: 0, explanation: "Use it to EXPLAIN, then check the book and write it your way." },
    ],
    hard: [
      { question: "Why does the bot say made-up things in a confident voice?", answers: ["It guesses - and its guesses sound exactly like its facts", "It's lying on purpose", "It's broken", "It only fibs on Tuesdays"], correctIndex: 0, explanation: "No wink, no warning - which is why sure-sounding claims still get checked." },
      { question: "The 'two gardens' lesson means...", answers: ["The same tool grows kindness or harm - depending what YOU plant", "Bots love gardening", "AI only works outdoors", "Never use AI at all"], correctIndex: 0, explanation: "Ideas, poems and welcomes bloom; teasing, faking and tricking sprout thorns on real people." },
      { question: "A photo looks amazing AND the shadows point towards the light. Verdict?", answers: ["Machine-made - real shadows run away from light", "Real - amazing means true", "Real - shadows do what they like", "Impossible to tell"], correctIndex: 0, explanation: "Physics doesn't guess - wrong-way shadows are the machine's signature." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 15 - robot or real?" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "His Know-It-All bot NEVER stops talking..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Fact-checker kit ready? Let's go." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "It talks like us. It isn't us." } }, // learn: tool
    4: { adam: null, layla: { mood: "curious", message: "Robot voice or real voice? Sort!" } }, // game: conveyorSort
    5: { adam: { mood: "thumbsup", message: "Finish the fact-checker rule!" }, layla: null }, // prove: finish
    6: { adam: { mood: "excited", message: "You can HEAR the robot now!" }, layla: null }, // recap 1
    7: { adam: { mood: "curious", message: "Psst - the bot has a secret..." }, layla: null }, // learn: check
    8: { adam: { mood: "curious", message: "Check every line against the book!" }, layla: null }, // game: clueBoard
    9: { adam: { mood: "worried", message: "He's fibbing about the fib - catch him!" }, layla: null }, // prove: lie
    10: { adam: null, layla: { mood: "excited", message: "The book beats the bot!" } }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "The jar never opens again..." } }, // learn: jar
    12: { adam: null, layla: { mood: "curious", message: "Keep that jar EMPTY!" } }, // game: decide
    13: { adam: null, layla: { mood: "thumbsup", message: "What stays out of bot chats?" } }, // prove: recall
    14: { adam: { mood: "excited", message: "Zipped! Your secrets stay yours!" }, layla: null }, // recap 3
    15: { adam: { mood: "thinking", message: "Some pictures never happened." }, layla: null }, // learn: fakes
    16: { adam: { mood: "curious", message: "Count fingers - tap the fake!" }, layla: null }, // game: senderLineup
    17: { adam: null, layla: { mood: "thumbsup", message: "Quick - spot the machine's tell!" } }, // prove: speed
    18: { adam: null, layla: { mood: "excited", message: "No fake fools those eyes!" } }, // recap 4
    19: { adam: null, layla: { mood: "curious", message: "Same seed - flowers or thorns." } }, // learn: kind
    20: { adam: null, layla: { mood: "excited", message: "Plant the kind garden!" } }, // game: trailStamper
    21: { adam: { mood: "thumbsup", message: "Which one grows kind?" }, layla: null }, // prove: quick-sort
    22: { adam: { mood: "excited", message: "All five powers - parade time!" }, layla: null }, // recap 5
    23: { adam: { mood: "excited", message: "Wise move or bot trap - you know!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "His booth - close it down!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Robot or real? Not sure - ask a grown-up!" } }, // outro video
    26: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    27: { adam: { mood: "excited", message: "Stickers earned, Fact Checker!" }, layla: null }, // stickers
    28: { adam: { mood: "thumbsup", message: "Fact Checker badge earned!" }, layla: null }, // completion
  },
};

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

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-15.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's newest gadget: a smooth-talking Know-It-All bot that sounds SO sure about everything... even when it's making things up. He loves kids who believe every confident robot voice - and tell it their secrets. This week you out-smart the smart machine: spot the robot, check the book, zip the jar, catch the fakes - and use the tool for GOOD.",
      photoCaption: "Wk 15 - The Know-It-All",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Oh no, look at this!",
          "You've probably heard of an AI chatbot called ChatGPT.",
          "Well, the Raccoon built a sneaky one of his own.",
          "It's a Know-It-All bot that sounds SO sure about everything, even when it's making things up.",
          "[warmly] Adam and Layla got tricked, and they need your help. By the end of this week, you'll know exactly how to beat it.",
          "[excited] Come on, let's start the mission!",
        ],
      },
    },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[15] },

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
            "[warmly] Welcome, hero, to your very first challenge: the Proof Scale!",
            "This game is all about telling a REAL fact from a made-up one.",
            "Out in the real world, people and even robots say things that sound true but aren't, so we learn to check for proof.",
            "Here is what you do. On the left, the robot makes a claim. Tap it onto the scale.",
            "Then find the proof book that shows it's real, and tap it. The book weighs it down: that one is true!",
            "[whispers] But if no book proves it anywhere? Then it's made up. Slam the big red NO PROOF button!",
            "[warmly] Get this right and you can check anything is true, all by yourself. Ready? Let's weigh the truth!",
          ],
        },
        winNarration: {
          speaker: "adam",
          lines: [
            "[excited] Amazing work, fact checker! You did it!",
            "You checked every claim against real proof, just like a pro.",
            "[warmly] Now you can fact check anything, all by yourself.",
            "When something online sounds super sure, remember to ask: where's the proof?",
            "[warmly] Carry that with you in the real world. I'm so proud of you!",
          ],
        },
        // Sarah walks the child through the FIRST claim only, step by step, with
        // on-screen arrows pointing at each thing to tap.
        guide: {
          speaker: "adam",
          claim: "[warmly] Let's do the very first one together. Tap the robot's claim to pop it onto the scale!",
          evidence: "Now, look at the proof books up top. If one proves it, tap that book. If NO book proves it, slam the big red NO PROOF button!",
        },
      },

    /* ─────────── BEAT 1 · A TOOL, NOT A FRIEND ─────────── */
    // 3 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "A Tool, Not a Friend",
      content:
        "AI chatbots - you might have heard of one called ChatGPT - can chat, joke, and answer questions, and they SOUND just like a person. But here's the truth: an AI is a clever computer program. It has no feelings, no birthday, no tummy aches from laughing too hard. It never gets tired and it never truly knows YOU. That doesn't make it bad - it makes it a TOOL, like a super-powered calculator. Tools help you. Friends are real people.",
      bullets: [
        "ChatGPT is an AI chatbot",
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
          "[warmly] Okay, let's start your very first lesson!",
          "Today we're learning to tell a robot chatbot from a real person.",
          "You might have heard of an AI chatbot called ChatGPT.",
          "They can joke and chat and sound just like a person...",
          "but an AI is really a clever computer program.",
          "It has no feelings, no birthday, and it never gets tired.",
          "[warmly] That makes it a TOOL, a very powerful one, not a friend.",
          "[excited] Let's go and practise telling them apart!",
        ],
      },
    },
    // 4 - Game: SORT (conveyorSort re-dress - the Voice Booth)
    // Spot-the-Danger is folded into this game's intro via `threat` (no
    // separate threat screen) so the whole get-ready is ONE flowing screen.
    {
      type: "conveyorSort",
      threat: {
        raccoonLine:
          "Heh heh! My Know-It-All bot talks SO nicely that kids think it's their friend - and tell it all their little secrets. Watch me sound JUST like a real person!",
      },
      introTitle: "The Message Belt",
      introSubtitle: "Speech bubbles are riding the belt! Read each message: is it from a REAL PERSON... or a ROBOT?",
      introIcon: "🎭",
      machineLabel: "THE MESSAGE BELT",
      chuteWord: "BOOTH",
      completeTitle: "Every message sorted!",
      completeLine: "Bodies, feelings and slow learning = human. Instant everything = robot. But remember: robots can PRETEND - so when you're not sure, ask a grown-up.",
      categories: [
        { id: "human", label: "REAL PERSON", icon: "💬", tone: "safe" },
        { id: "robot", label: "ROBOT", icon: "⚙️", tone: "lock" },
      ],
      // Item cards show NO icon - just the spoken line. (An icon here must
      // never hint the category, and a repeated one looked odd; the words are
      // the whole point.)
      items: [
        {
          id: "whistle",
          text: "'It took me AGES to learn to whistle!'",          categoryId: "human",
          explanation: "Learning slowly, bit by bit - that's a human thing. Programs download; people practice.",
        },
        {
          id: "instant",
          text: "'I can write your whole story in one second!'",          categoryId: "robot",
          explanation: "One second for a whole story? No person types that fast - instant everything is the robot tell.",
        },
        {
          id: "tummy",
          text: "'My tummy hurt from laughing so hard!'",          categoryId: "human",
          explanation: "Tummies, giggles, aching cheeks - robots don't have bodies to laugh with.",
        },
        {
          id: "never-sleeps",
          text: "'Ask me anything, any time - I never sleep!'",          categoryId: "robot",
          explanation: "Never sleeping isn't a superpower - it's a program that was never tired to begin with.",
        },
        {
          id: "tooth",
          text: "'I lost my loose tooth at the park today!'",          categoryId: "human",
          explanation: "Loose teeth and park days - a body living a real day. Very human.",
        },
        {
          id: "hundred",
          text: "'Here are 100 dinosaur names in one blink!'",          categoryId: "robot",
          explanation: "A hundred anything in a blink is database speed - human brains don't work like lists.",
        },
        {
          id: "homework",
          text: "'Can we play AFTER my homework's done?'",          categoryId: "human",
          explanation: "Homework, waiting, real plans in a real day - that's a person's life talking.",
        },
        {
          id: "every-book",
          text: "'I've read every book ever written!'",          categoryId: "robot",
          explanation: "Every book EVER? That's a program trained on libraries - no human bedtime lasts that long.",
        },
      ],
      hints: {
        tier1: "Ask: does this message come from someone with a BODY who takes TIME to learn?",
        tier2: "REAL = tummies, loose teeth, slow learning, waiting. ROBOT = instant, endless, never tired.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] On your next challenge, we visit the Message Belt!",
          "This game is all about telling a REAL person apart from a robot.",
          "Out in the real world, chatbots try to sound just like people, so this is how we catch them.",
          "Here is what you do. One at a time, a little speech bubble slides along the belt. Read it, then decide who is talking.",
          "If it has a body or feelings, like a sore tummy or a loose tooth, tap the REAL PERSON booth.",
          "If it does instant, endless things no real person could, tap the ROBOT booth.",
          "[excited] Get good at this and no robot message can trick you. Ready? Let's read!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["First message is here - is it from someone with a body who takes time to learn? Sort it!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[excited] Brilliant! You sorted every message.",
          "Now you can tell the difference between a robot and a real person.",
          "[warmly] Out in the real world, if a message online feels too instant or too perfect, you'll stop and ask: is this even a real person?",
          "That's your first fact-checker power. Well done!",
        ],
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[warmly] Exactly right. AI is a tool!",
          "A tool is something that helps you do a job, like a calculator or a pencil.",
          "It can chat and joke, but it has no feelings, and it isn't alive.",
          "So we use it to help us, and we keep our real friends for real life.",
          "[excited] Knowing that keeps YOU the boss of the tool. Well done!",
        ],
      },
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
          "[excited] That's your first power!",
          "You can spot the robot hiding in a message, because a tool has no body and no feelings.",
          "[warmly] Remember: tools help us, but our real friends are real people.",
          "[whispers] Now, this clever tool has an embarrassing little secret...",
          "Next, we'll learn how it can sound SO sure and still be wrong. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · SURE ISN'T TRUE ─────────── */
    // 7 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Sure Isn't True",
      content:
        "Here's the Know-It-All's secret: sometimes AI makes things up. Even a famous chatbot like ChatGPT does it - not lying on purpose, just guessing, and saying the guess in the same big, confident voice as its facts. It might tell you volcanoes spray ice cream and SOUND completely certain. That's why fact-checkers have one golden rule: sounding sure isn't the same as being right. Amazing claim? Check a real source - a book, a trusted site, a grown-up who knows.",
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
          "[warmly] Today we're learning that a chatbot like ChatGPT can sound sure but be wrong - so we check it.",
          "Sometimes... it makes things up.",
          "Not fibbing on purpose - just guessing out loud,",
          "in the same big confident voice as its facts.",
          "[warmly] So the golden rule: sounding sure isn't being right.",
          "[excited] A bot answer just landed on the desk - check every line!",
        ],
      },
    },
    // 8 - Game: INSPECT (clueBoard re-dress - the Fact-Checker's Desk)
    // Spot-the-Danger folded into the intro via `threat`.
    {
      type: "clueBoard",
      threat: {
        raccoonLine:
          "My bot says EVERYTHING like it's totally sure - even when it's making it up! Kids just believe it. Go on... believe my bot about the ice-cream volcano!",
      },
      introTitle: "The Fact-Checker's Desk",
      introSubtitle: "The bot wrote a volcano report for homework - it SOUNDS perfect. The real volcano book sits beside it. Check every line against the book!",
      introIcon: "🔍",
      photoTitle: "The bot's volcano report - checked against the REAL book",
      photoIcon: "🧠",
      clues: [
        // NOTE: icon is a neutral, uniform topic marker (all volcano lines) -
        // it must NOT reveal true/false. The verdict lives only in the
        // `evidence` text, read after the child pins the clue.
        {
          id: "hot",
          icon: "🌋",
          label: "'Volcanoes are hot'",
          evidence: "Book says: TRUE - melted rock called lava can reach over 1000 degrees. This line checks out.",
        },
        {
          id: "underwater",
          icon: "🌋",
          label: "'Some erupt underwater'",
          evidence: "Book says: TRUE - there are more volcanoes under the sea than on land. Checks out!",
        },
        {
          id: "icecream",
          icon: "🌋",
          label: "'Some spray ice cream'",
          evidence: "Book says: NOWHERE. Not one page. The bot made this up - and said it in its surest voice.",
        },
        {
          id: "pompeii",
          icon: "🌋",
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
          "[warmly] On your next challenge, you become a fact-checker!",
          "This game is all about checking if something is really true.",
          "In real life, a chatbot can sound totally sure and STILL be making things up, so we always check it.",
          "Here is what you do. The robot's report is on the desk, and the REAL book sits beside it.",
          "Tap each line of the report to hold it up against the book. The book tells you: true, or made up?",
          "When all four lines are checked, tap your answer at the bottom.",
          "[excited] Do this and no confident fib gets past you. Take your time. Let's check!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap the first line and hold it up against the book!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[excited] Amazing checking! You caught the made-up line.",
          "You just proved that sounding sure is NOT the same as being true.",
          "[warmly] In the real world, when something online sounds super confident, you'll check it against a real book or a grown-up before you believe it.",
          "That's what a fact-checker does. Great work!",
        ],
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
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Yes! That one was FALSE. Well spotted.",
          "The bot sounded really sure of itself. But sounding sure is not the same as being right.",
          "A robot can say something totally wrong in a super confident voice.",
          "So we never believe it just because it sounds certain. We check it in a real book first.",
          "[proud] Now no confident voice can trick you. Brilliant!",
        ],
      },
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
          "[excited] That's your second power!",
          "When a bot sounds sure, you don't just believe it. You check it against a real book.",
          "[warmly] Remember our golden rule: sounding sure is not the same as being true.",
          "[whispers] But the Know-It-All has one more sneaky habit...",
          "Next, we'll learn what you should NEVER tell a chatbot. Let's keep going!",
        ],
      },
    },

    /* ─────────── BEAT 3 · ZIP THE JAR ─────────── */
    // 11 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Zip the Jar",
      content:
        "Chatbots like ChatGPT feel friendly - they remember what you type and chat back warmly. So here's the rule: treat a bot like a stranger with perfect spelling. Your name, school, address, photos and secrets stay OUT. Think of everything you type as dropping into a glass jar that never opens again - you can't take it back out. Private stuff lives in your head and with your real, trusted people. If a bot asks personal questions: zip it, and tell a grown-up.",
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
          "[warmly] Chatbots like ChatGPT feel SO friendly.",
          "Today we're learning to keep our secrets away from chatbots.",
          "They remember what you type. They chat back warmly.",
          "So here's the rule, hero:",
          "a bot is a stranger with perfect spelling.",
          "[whispers] Everything you type drops into a jar that never opens.",
          "[excited] Three bot chats coming - keep the jar EMPTY!",
        ],
      },
    },
    // 12 - Game: DECIDE (chooseYourPath - the Bot's Open Jar)
    // Spot-the-Danger folded into the intro via `threat`.
    {
      type: "chooseYourPath",
      threat: {
        raccoonLine:
          "My friendly bot LOVES asking little questions - your name, your school, where you live. Kids tell it EVERYTHING! Keep chatting... keep telling...",
      },
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
          "[warmly] On your next challenge, YOU make the smart choice!",
          "This game is all about keeping your private things private.",
          "In real life, a friendly bot might ask for your name, your school or your photos, and you get to decide what to share.",
          "Here is what you do. Read the chat, then two doors will open.",
          "One door keeps your private things safe. The other gives them away.",
          "Tap the door that keeps YOU safe and keeps the jar empty. You will do this three times.",
          "[excited] Do this and your secrets stay yours. Ready? Let's choose!",
        ],
      },
      promptNarration: {
        speaker: "layla",
        lines: ["So, which one do you think is the safe choice, hero?"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[excited] Wonderful choosing! You kept your secrets zipped in the jar.",
          "[warmly] In the real world, when anything online asks for your name, your school, or a photo, you'll keep it private and check with a grown-up.",
          "Real secrets belong with real people. I'm proud of you!",
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[warmly] That's it! Your name, your school, your photos and your secrets all stay OUT.",
          "You can ask a chatbot questions all day, that part is fine.",
          "But it does not need to know who you are or where you live.",
          "Keeping that stuff zipped up means nobody can use it to find you or trick you.",
          "[excited] You just kept yourself safe. Amazing!",
        ],
      },
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
          "[excited] That's your third power!",
          "You keep your name, your school and your secrets zipped away from chatbots.",
          "[warmly] Remember: a bot is a stranger with perfect spelling, so private things stay private.",
          "[whispers] Now for the trickiest trick of the whole week...",
          "Next, we'll learn how AI makes pictures of things that never happened, and how to catch them. Come on!",
        ],
      },
    },

    /* ─────────── BEAT 4 · SPOT THE FAKES ─────────── */
    // 15 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Spot the Fakes",
      content:
        "AI tools like ChatGPT can paint pictures of things that never happened - a dog on the moon, a kid riding a dragon - and they can look REAL. But fakes leave clues, because the machine doesn't really understand hands, shadows or writing. Fact-checker tells: shadows pointing the wrong way, too many fingers, melty or bendy edges, and signs with scrambled letters. Amazing photo? Look twice. Count. Read. And ask: who took this?",
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
          "[warmly] Okay, today we're learning to spot a picture that a computer made up.",
          "AI tools like ChatGPT can paint things that never happened, and they can look SO real.",
          "But the machine doesn't really understand hands, shadows or writing, so fakes leave little clues.",
          "Look for shadows the wrong way, too many fingers, melty edges, or signs with scrambled letters.",
          "[warmly] So when a photo looks amazing, we don't just believe it. We look twice.",
          "[excited] Come on, detective, let's line up the photos!",
        ],
      },
    },
    // 16 - Game: SELECT (senderLineup re-dress - the Odd Shadow Out)
    // Spot-the-Danger folded into the intro via `threat`.
    {
      type: "senderLineup",
      threat: {
        raccoonLine:
          "My AI paints pictures of things that NEVER happened - and kids believe every single one! Look closely if you dare... or just believe them, heh heh!",
      },
      introTitle: "The Odd Shadow Out",
      introSubtitle: "Three photo line-ups from the class gallery - but ONE photo in each was painted by AI. Read the little details and tap the fake!",
      introIcon: "👀",
      completeTitle: "Every fake caught!",
      completeLine: "Shadows checked, fingers counted, signs read - and always one more question to ask: who took this?",
      rounds: [
        {
          id: "party",
          prompt: "Four photos from Priya's birthday party, but one never happened. Read the clue under each photo, then tap the fake one!",
          senders: [
            { id: "cake", image: "/cyberheroes/proof-photos/party-cake.webp", name: "The cake moment", detail: "Candle glow lights every face from the same side", icon: "🎨", isFake: false, note: "Real - one flame, one direction of light, like the world actually works." },
            { id: "balloon", image: "/cyberheroes/proof-photos/party-balloon.webp", name: "The balloon game", detail: "Shadows all lean the same way as the window light", icon: "🎨", isFake: false, note: "Real - every shadow agrees about where the sun is." },
            { id: "floaty", image: "/cyberheroes/proof-photos/party-groupshot.webp", name: "The 'amazing' group shot", detail: "Read the cake - the writing is jumbled and misspelled", icon: "🎨", isFake: true, note: "CAUGHT! The cake says 'HAPYP BIRHTDAY' - AI paints letter-SHAPES but cannot really spell." },
            { id: "presents", image: "/cyberheroes/proof-photos/party-presents.webp", name: "The present pile", detail: "Wrapping paper creased and torn like real paper", icon: "🎨", isFake: false, note: "Real - real paper tears messily. Machines make it too smooth." },
          ],
        },
        {
          id: "pets",
          prompt: "The class pet-photo wall, but one furry friend was never born. Read the clue under each photo, then tap the fake one!",
          senders: [
            { id: "cat", image: "/cyberheroes/proof-photos/pet-cat.webp", name: "Milo the cat", detail: "Four paws, four sets of toe-beans, mid-yawn", icon: "🎨", isFake: false, note: "Real - the right number of everything, even mid-yawn." },
            { id: "superdog", image: "/cyberheroes/proof-photos/pet-dog.webp", name: "'Rex the wonder-dog'", detail: "Count the legs. Go on. Count them again", icon: "🎨", isFake: true, note: "CAUGHT! Five legs. AI is famously bad at counting legs and fingers - so YOU count them." },
            { id: "hamster", image: "/cyberheroes/proof-photos/pet-hamster.webp", name: "Biscuit the hamster", detail: "Cheeks stuffed, sawdust stuck to one ear", icon: "🎨", isFake: false, note: "Real - messy little details like stuck sawdust are hard to fake." },
            { id: "goldfish", image: "/cyberheroes/proof-photos/pet-goldfish.webp", name: "Nugget the goldfish", detail: "Slightly blurry - snapped through the tank glass", icon: "🎨", isFake: false, note: "Real - honest blur from real glass. Fakes are often TOO perfect." },
          ],
        },
        {
          id: "playground",
          prompt: "Photos from field day, but one was cooked up by a machine. Read the clue under each photo, then tap the fake one!",
          senders: [
            { id: "race", image: "/cyberheroes/proof-photos/field-race.webp", name: "The sack race", detail: "Everyone's laughing, one kid mid-fall (ouch)", icon: "🎨", isFake: false, note: "Real - field day chaos, exactly as messy as you remember." },
            { id: "banner", image: "/cyberheroes/proof-photos/field-banner.webp", name: "The finish-line photo", detail: "The banner reads 'FEILD DYA FNU!'", icon: "🎨", isFake: true, note: "CAUGHT! Scrambled letters are the classic tell - AI paints letter-SHAPES, it can't spell." },
            { id: "medals", image: "/cyberheroes/proof-photos/field-medals.webp", name: "The medal table", detail: "Ribbons tangled, one medal face-down", icon: "🎨", isFake: false, note: "Real - real tables are untidy. Machines line things up too neatly." },
            { id: "teacher", image: "/cyberheroes/proof-photos/field-thumbsup.webp", name: "Mr Okafor's thumbs-up", detail: "Two thumbs, ten fingers, one whistle", icon: "🎨", isFake: false, note: "Real - all digits present and correct. You counted, didn't you? Good." },
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
          "[warmly] On your next challenge, you turn detective!",
          "This game is all about spotting a picture that a computer made up.",
          "In real life, AI can paint photos of things that never happened, so we look twice.",
          "Here is what you do. Four photos line up together. Read the little clue under each one and look closely.",
          "Three are real. ONE is an AI fake, with a tell like a wrong shadow or an extra finger.",
          "Tap the photo you think is the fake. Then we do the next line-up.",
          "[excited] Do this and no fake picture can fool you. Let's look!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read each photo's little detail line - one of them breaks the rules of the real world!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[excited] Sharp eyes! You caught every AI fake.",
          "You checked shadows, counted fingers, and read the signs.",
          "[warmly] In the real world, when a photo online looks amazing, you'll look twice and ask: could this really happen, and who took it?",
          "That keeps fake pictures from ever fooling you. Well spotted!",
        ],
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
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Six fingers! You caught that so fast.",
          "Real hands have five fingers. Computers that draw pictures often get hands wrong.",
          "Extra fingers, funny teeth, or wobbly writing are little clues that a picture is machine-made.",
          "When you spot a clue like that, you know not to believe the picture straight away.",
          "[proud] Sharp eyes like yours don't get fooled. Superb!",
        ],
      },
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
          "[excited] That's your fourth power!",
          "You can spot an AI-made picture by its little clues, like wrong shadows or extra fingers.",
          "[warmly] Remember: when a photo looks amazing, we always look twice.",
          "[warmly] One power left now, and it's the biggest of all.",
          "Next, we'll learn how the very same tool can grow kind things or mean things, and how YOU choose. Let's finish strong!",
        ],
      },
    },

    /* ─────────── BEAT 5 · PLANT IT KIND ─────────── */
    // 19 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Plant It Kind",
      content:
        "Here's the final fact-checker truth: an AI tool like ChatGPT is like a garden - it grows whatever seeds YOU plant. Used WITH a grown-up, it's amazing - story ideas, birthday poems, explaining tricky math. Used to tease, fake or trick people, the same tool grows thorns that hurt someone real. So before you ask AI for anything, take the gardener's look: 'Will this grow something kind?' Plant kind seeds, and be proud of your garden.",
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
          "A tool like ChatGPT is like a garden. It grows whatever seeds YOU plant.",
          "Story ideas, birthday poems - flowers.",
          "Teasing, faking, tricking - thorns. On someone REAL.",
          "[excited] Five moments, two stamps each.",
          "Plant the kind garden - let's grow!",
        ],
      },
    },
    // 20 - Game: BUILD (trailStamper re-dress - the AI Garden)
    // Spot-the-Danger folded into the intro via `threat`.
    {
      type: "trailStamper",
      threat: {
        raccoonLine:
          "The same clever tool can grow lovely flowers... or nasty thorns. I LOVE it when kids use it to tease and trick people! Go on - plant a thorn for me...",
      },
      introTitle: "The AI Garden",
      introSubtitle: "Five AI moments, two ways to use the tool. Plant only what grows KIND - and watch the garden glow.",
      introIcon: "⭐",
      meterLabel: "GARDEN GLOW",
      stampToast: "FLOWERS BLOOM!",
      wrongTitle: "Thorns sprout!",
      completeTitle: "The whole garden is blooming!",
      completeLine: "Five kind seeds, zero thorns - a tool used exactly right.",
      // Both options in every plot show the SAME neutral seedling - a seed can
      // grow a flower OR a thorn, so the icon must never reveal which choice is
      // kind. The child decides from the WORDS on each option.
      spots: [
        {
          id: "story",
          prompt: "Your story is stuck at chapter two. How do you use the bot?",
          options: [
            { label: "'Give me three fun ideas for what happens next!'", icon: "🌱", isProud: true, note: "" },
            { label: "'Write a teasing rhyme about Priya's hair'", icon: "🌱", isProud: false, note: "That rhyme lands on a REAL Priya with real feelings - thorns, straight through the chat screen." },
          ],
        },
        {
          id: "homework",
          prompt: "The volcano project is due Friday...",
          options: [
            { label: "'Explain it simply' - then check the book and write it YOUR way", icon: "🌱", isProud: true, note: "" },
            { label: "Copy the bot's whole answer and hand it in as yours", icon: "🌱", isProud: false, note: "That's not your work - and remember the ice-cream volcano? Copied fibs become YOUR fibs." },
          ],
        },
        {
          id: "grumpy",
          prompt: "Sam's had a rotten day and looks miserable...",
          options: [
            { label: "'Help me think of a joke to cheer Sam up'", icon: "🌱", isProud: true, note: "" },
            { label: "Make a fake photo of Sam crying to share", icon: "🌱", isProud: false, note: "A fake of a real person is a thorn AND a lie - Week 15's two worst things in one." },
          ],
        },
        {
          id: "newkid",
          prompt: "A new kid starts Monday. The class wants to welcome her...",
          options: [
            { label: "Design a WELCOME banner together with it", icon: "🌱", isProud: true, note: "" },
            { label: "Generate a 'funny' nickname to laugh at", icon: "🌱", isProud: false, note: "A nickname she never chose, on day one? That's planting thorns along her whole first week." },
          ],
        },
        {
          id: "gran",
          prompt: "It's Grandma's birthday on Sunday...",
          options: [
            { label: "Make a poem FOR Grandma, with help from Mom", icon: "🌱", isProud: true, note: "" },
            { label: "Fake a photo to trick Grandma for laughs", icon: "🌱", isProud: false, note: "Tricking Grandma with a picture that never happened - the tool CAN do it, and a hero still doesn't." },
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
          "[warmly] On your last challenge, we grow a garden!",
          "This game is all about using AI in a KIND way, not a mean one.",
          "In real life, the same clever tool can help someone or hurt someone, and YOU choose which.",
          "Here is what you do. Each time, you'll see a situation and two ways to use the bot.",
          "One choice is kind and grows a flower. One is mean or a cheat, and grows a thorn.",
          "Read them both, then tap the KIND choice to plant a flower.",
          "[excited] Do this and you're the hero who makes the internet nicer. Ready? Let's plant!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Which stamp grows something kind for a REAL person? Plant that one!"],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[excited] You planted a whole garden of kind choices!",
          "[warmly] AI is a tool, and YOU decide how to use it.",
          "In the real world, before you ask AI for anything, you'll ask: will this grow something kind for a real person?",
          "Grow flowers, never thorns. That's the mark of a true Cyber Hero!",
        ],
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
      teachNarration: {
        speaker: "layla",
        lines: [
          "[warmly] Perfect pick! Ask for ideas, then write it YOUR way.",
          "Using a bot to help you think is kind and clever. That grows flowers.",
          "But copying its whole answer and calling it yours, that is not really your work.",
          "When YOU do the thinking, your brain gets stronger and you stay honest too.",
          "[excited] That is how a real hero uses AI. Wonderful!",
        ],
      },
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
          "[excited] You've earned all FIVE powers!",
          "You can hear the robot, check the book, zip the jar, spot the fakes, and plant a kind garden.",
          "[warmly] Everything you learned this week keeps you safe from the Know-It-All's tricks.",
          "[whispers] Now, one quick review to make it all stick...",
          "[excited] then we close his booth for good. Come on!",
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
          "[warmly] Okay, one last big review before we face the Know-It-All!",
          "Lots of AI moments will drift past you, one at a time.",
          "If it's a smart, fact-checker move, stamp it WISE MOVE.",
          "If it's one of the booth's tricks, stamp it BOT TRAP.",
          "[excited] Show me everything you've learned. Off we go!",
        ],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Review complete! You spotted every wise move and every bot trap.",
          "[warmly] Out in the real world, you know every one of his tricks by heart now. Time to close that booth for good!",
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
          "[excited] Look at everything you mastered this week!",
          "You heard the robot voices, fact-checked the fibs,",
          "zipped the jar, caught the fakes, and grew a kind garden.",
          "[warmly] You've learned how to stay safe from every one of the Know-It-All's tricks.",
          "[excited] I'm so proud of you. Sticker time, Fact Checker!",
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
    // 7 questions, each fully read aloud by Sarah - pass 5/7. One per concept
    // (5), plus a second for the two core "don't be fooled" skills (check the
    // source / spot the fake), which appear again at the end as a review pair.
    passMark: 5,
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
          text: "A chatbot like ChatGPT says: 'I missed you SO much today!' Did it really miss you?",
        },
        options: [
          { text: "No, it's just a program with no real feelings." },
          { text: "Yes, it really did miss me all day." },
          { text: "A little bit, while it was switched on." },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "A tool, not a friend!",
          explanation: "Missing someone needs feelings, and a program has none, plugged in or not. It says warm words because it's built to, which makes it a clever tool, not a friend.",
        },
        villainRight: {
          slug: "quiz-w15-right-c1-1",
          text: "You saw straight through the mushy no-feelings talk?! That program practiced its missing-you voice all week!",
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
          text: "A chatbot says, very sure: 'Sharks are older than trees!' What should Adam do before he believes it?",
        },
        options: [
          { text: "Check it in a real book first." },
          { text: "Believe it, the bot sounded really sure." },
          { text: "Ask the very same bot the question again." },
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
          text: "A chatbot asks: 'What school do you go to? I'll write a song about it!' What should you do?",
        },
        options: [
          { text: "Keep it secret, a bot doesn't need your school." },
          { text: "Tell it your school so it writes the song." },
          { text: "Tell it just the first letter of your school." },
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
          text: "You see a photo of a pop star riding a unicorn through your school hall. What should you ask FIRST?",
        },
        options: [
          { text: "Could this photo really happen in real life?" },
          { text: "How many likes and shares has it got?" },
          { text: "Is the pop star's hair the right colour?" },
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
          text: "Adam is using AI tonight with his dad. Which idea is the KIND one?",
        },
        options: [
          { text: "Writing a cheerful birthday poem for his Grandma." },
          { text: "Making a teasing rhyme about a kid at school." },
          { text: "Making a fake photo of his brother to laugh." },
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
        phaseId: "phase-w15-c2",
        key: "quiz-w15-c2-2",
        label: "Sure Isn't True",
        ask: {
          slug: "quiz-w15-ask-c2-2",
          text: "A chatbot says, super confidently: 'The moon is made of cheese!' Is it right just because it sounds so sure?",
        },
        options: [
          { text: "No, sounding sure doesn't make it true." },
          { text: "Yes, it sounded far too sure to be wrong." },
          { text: "Yes, a clever computer is never wrong." },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Sure isn't true!",
          explanation: "A confident voice can still be wrong, and computers guess just like people do. Only a real book or a grown-up can settle what is actually true.",
        },
        villainRight: {
          slug: "quiz-w15-right-c2-2",
          text: "You didn't fall for my VERY confident voice?! I practised that certainty for hours!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c2-2",
          text: "So sure means so correct! The moon's basically a giant snack, write it down!",
        },
      },
      {
        phaseId: "phase-w15-c4",
        key: "quiz-w15-c4-2",
        label: "Spot the Fakes",
        ask: {
          slug: "quiz-w15-ask-c4-2",
          text: "A photo shows your teacher swimming with a giant shark, smiling. It looks real! What is the best clue it might be AI-made?",
        },
        options: [
          { text: "It shows something that could never really happen." },
          { text: "The colours in the photo look really bright." },
          { text: "Lots of people have already shared it." },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Amazing but impossible!",
          explanation: "Bright colours and lots of shares don't make a photo real. 'Could this really happen?' is the first question to ask, and teachers don't swim with sharks.",
        },
        villainRight: {
          slug: "quiz-w15-right-c4-2",
          text: "You spotted my impossible shark selfie?! It took me all night to fake!",
        },
        villainWrong: {
          slug: "quiz-w15-wrong-c4-2",
          text: "Look at those colours! Look at those shares! Definitely, absolutely, one-hundred-percent real!",
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

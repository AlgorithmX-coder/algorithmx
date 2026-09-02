import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 4 - Scams and Tricks: Real or Fake?
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 WHAT     what a scam is                    | hookSort       | finish
 *     2 TOOGOOD  too good to be true               | spamBlaster    | speed
 *     3 HURRY    urgency + fear are the trick      | phishInspector | lie
 *     4 SENDERS  fake senders (NOT links - W16)    | senderLineup   | recall
 *     5 NOBITE   stop, check, show a grown-up      | chooseYourPath | order
 *   Consolidation (cyberScanner, Trick Scanner skin) -> boss (placeholder
 *   quiz boss until the bespoke W4 COMBAT is designed) -> closing video
 *   -> debrief -> stickers -> completion.
 *
 * Game freshness: hookSort and senderLineup DEBUT here; spamBlaster and
 * phishInspector get their first-ever week outing (re-dressed); the
 * decide beat uses the classic card look (W2 used the device skin).
 * Lane-clean: fake SENDERS and too-good MESSAGES only - no link/QR
 * mechanics (W16), no free-currency generators (W7), no fake PEOPLE
 * (W3 owns profiles).
 */
export const WEEK_4: WeekContent = {
  weekNumber: 4,
  title: "Scams and Tricks: Real or Fake?",
  topic: "scams",
  badgeName: "Trick Catcher",
  badgeIcon: "🪤",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 4: REAL OR FAKE?", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the V-Bucks blast
    { type: "video", videoPlaceholder: "Week 4: The Prize That Wasn't", videoSrc: "/videos/module-04-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[4] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-04.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon blasted out 'YOU WON 10,000 V-BUCKS!' to every kid in the city - and someone clicked. There was no prize. There never is. Time to learn his tricks!",
      photoCaption: "Wk 4 - The Prize That Wasn't",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn what a scam really is - a trick in a costume",
        "Spot 'too good to be true' and 'hurry up!' a mile away",
        "Master the no-bite rule: stop, check, show a grown-up",
      ],
    },

      // SIGNATURE: The Rigged Ring Toss (bespoke mini-game unique to this week)
      {
        type: "signature",
        mechanic: "riggedRingToss",
        title: "The Rigged Ring Toss",
        narration: {
          speaker: "adam",
          lines: [
            "[excited] Drag back and let go to flick rings onto the pegs!",
            "Watch closely, because one shiny booth never lets you win.",
            "Sniff out the hidden trick and shut that booth down!",
          ],
        },
      },

    /* ─────────── BEAT 1 · WHAT A SCAM IS ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "What Is a Scam?",
      content:
        "A scam is a TRICK dressed up as something nice. It wants one of three things: your info, your family's money, or your click - pressing its button is how the trick gets in. Real messages just say normal things. Scams always want something back - that's how you spot them.",
      bullets: [
        "A scam is a trick in a costume",
        "It wants your info, money or clicks",
        "Real messages don't beg or push",
        "Scams always want something from you",
        "You can learn to spot every single one",
      ],
      bulletIcons: ["🪤", "👀", "💬", "🎁", "🏆"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome back, Cyber Hero. New mission!",
          "This week we hunt SCAMS.",
          "A scam is a trick... wearing a costume.",
          "[whispers] It wants your info, your family's money, or your click - pressing is how the trick gets in.",
          "[excited] But here's the good news. Tricks follow patterns!",
          "Learn the patterns, and no scam can touch you.",
        ],
      },
    },
    // 4 - Game: SORT (the Fishing Dock - hookSort debut)
    {
      type: "hookSort",
      items: [
        { id: "mum-dinner", text: "Mom: Dinner in 10 minutes!", icon: "🏠", isScam: false, explanation: "A normal message from someone you know - reel it in!" },
        { id: "prize-draw", text: "You WON a giveaway you never entered!", icon: "🎁", isScam: true, explanation: "You can't win a giveaway you never entered. A baited hook - snip it before anyone bites!" },
        { id: "teammate", text: "Your teammate: Good game yesterday!", icon: "⭐", isScam: false, explanation: "Friendly game chat from a real teammate - keep it." },
        { id: "free-coins", text: "FREE game coins! Just type your password here", icon: "🪤", isScam: true, explanation: "NOTHING free ever needs your password. That's the whole trick." },
        { id: "school-day", text: "School: Pajama day on Friday", icon: "🏫", isScam: false, explanation: "A normal school notice - real and useful." },
        { id: "parcel", text: "Your package is stuck! Pay $1 to release it", icon: "✉️", isScam: true, explanation: "Real packages don't get 'stuck' for $1. Tiny payments are how they grab card numbers." },
        { id: "billionaire", text: "A billionaire is giving away money - reply FAST!", icon: "💎", isScam: true, explanation: "Billionaires don't message kids. 'Reply fast' is the rush trick." },
        { id: "library", text: "Library: Your book is ready to pick up", icon: "✅", isScam: false, explanation: "A normal library message - nothing asked for, nothing fishy." },
      ],
      hints: {
        tier1: "Ask: does it WANT something from me - info, money, or a click?",
        tier2: "Normal messages just tell you things. Scams offer prizes, beg for passwords, or demand tiny payments.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome to the Fishing Dock!",
          "The Raccoon's dangling baited hooks in the water - scams dressed up as treats.",
          "[warmly] Real messages float in like friendly mail. Reel those in safe.",
          "[whispers] Spot a baited hook? SNIP! Cut the line before anyone bites.",
          "[excited] Take your time. One line at a time!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Check the first line - real mail reels in, baited hooks get SNIPPED!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "A scam is a ___ in a costume.",
      choices: [
        { text: "trick", isCorrect: true },
        { text: "game", isCorrect: false },
        { text: "prize", isCorrect: false },
        { text: "friend", isCorrect: false },
      ],
      praise: "Exactly - a trick in a costume! ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "A scam is a trick in a costume - it wants your info, money or your click. Pressing is how the trick gets in.",
      next: "the oldest bait in the book: too good to be true",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Great start, Cyber Hero!",
          "You sorted the whole dock - real ones kept, scams sunk.",
          "Remember: scams always WANT something.",
          "[excited] Next up - the shiniest bait of all!",
        ],
      },
    },

    /* ─────────── BEAT 2 · TOO GOOD TO BE TRUE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Too Good To Be True",
      content:
        "FREE iPhone! 10,000 V-Bucks! You're our millionth visitor! Here's the hero rule: if it sounds TOO amazing, it isn't real. Nobody gives away treasure to strangers. The more amazing the prize, the bigger the trick.",
      bullets: [
        "'FREE' + amazing = almost always a trick",
        "'You WON!' - but you never entered",
        "Nobody gives treasure to strangers",
        "The bigger the prize, the bigger the trick",
        "Real free things never ask for anything back",
      ],
      bulletIcons: ["🎁", "🏆", "💎", "🪤", "✅"],
      emblem: "🎁",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Free iPhone! Ten thousand V-Bucks! A puppy!",
          "[laughs] Sounds amazing, right?",
          "[whispers] That's exactly the point. It's BAIT.",
          "Nobody gives away treasure to strangers. Nobody.",
          "[warmly] If it sounds too good to be true... it isn't true.",
          "[excited] Ready to blast some bait? Let's go!",
        ],
      },
    },
    // 8 - Game: ARCADE (spamBlaster's first week outing - Too-Good Blaster)
    {
      type: "spamBlaster",
      introTitle: "Too-Good Blaster!",
      introDescription: "Offers are flying in! ZAP the too-good-to-be-true ones - let the normal messages through!",
      headline: "⚡ ZAP THE TOO-GOOD OFFERS! ⚡",
      missLabel: "TRICKS",
      emails: [
        { sender: "Prize Central", subject: "You WON a FREE iPhone!", isPhishing: true, clue: "You can't win a giveaway you never entered" },
        { sender: "Sam", subject: "Funny cat video from recess!", isPhishing: false, clue: "" },
        { sender: "V-Bucks Giveaway", subject: "FREE 10,000 V-BUCKS - claim NOW!", isPhishing: true, clue: "Free game money is always bait" },
        { sender: "Coach Lee", subject: "Football moved to 4pm today", isPhishing: false, clue: "" },
        { sender: "Lucky Visitor", subject: "You're our 1,000,000th visitor! Collect your prize!", isPhishing: true, clue: "No website counts visitors like this" },
        { sender: "Grandma", subject: "See you Sunday for dinner!", isPhishing: false, clue: "" },
        { sender: "Mega Deals", subject: "FREE tablet for the first 10 kids!", isPhishing: true, clue: "'Free for the first 10' is a rush trick" },
        { sender: "Library", subject: "Your dragon book is ready", isPhishing: false, clue: "" },
        { sender: "Puppy Prizes", subject: "You won a PUPPY! Click to claim!", isPhishing: true, clue: "Nobody mails you a free puppy" },
        { sender: "Golden Tickets", subject: "Golden ticket winner - that's YOU!", isPhishing: true, clue: "Too amazing = not real" },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Bait incoming! Offers are flying at your screen.",
          "Free iPhones. Free V-Bucks. Free puppies!",
          "[laughs] All bait. ZAP every too-good offer!",
          "[warmly] But careful - normal messages fly through too. Let those pass!",
        ],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which one is BAIT?",
      speedMs: 5000,
      choices: [
        { text: "FREE tablet - 10 left!", isCorrect: true },
        { text: "Practice moved to 4pm", isCorrect: false },
        { text: "Library book ready", isCorrect: false },
      ],
      praise: "Zapped in record time! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "If it sounds too good to be true, it isn't true. Amazing prizes are bait.",
      next: "the trick that makes your heart race - HURRY!",
      emblem: "🎁",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two tricks down! Your bait-detector is gleaming.",
          "Free stuff from strangers? ZAPPED.",
          "[laughs] The Raccoon's puppy prize fooled nobody today.",
          "[whispers] But his next trick doesn't offer... it SCARES.",
        ],
      },
    },

    /* ─────────── BEAT 3 · HURRY! / SCARY ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "The Hurry-Up Trick",
      content:
        "ONLY 10 MINUTES LEFT! Your account will be DELETED! Scams rush you and scare you ON PURPOSE - because a racing heart doesn't stop to think. Here's the secret: real companies NEVER give you scary countdowns. Feeling rushed IS the red flag.",
      bullets: [
        "Countdowns and deadlines = the rush trick",
        "Scary warnings = the fear trick",
        "A racing heart doesn't stop to think",
        "Real companies never threaten you",
        "Feeling rushed? That IS the red flag",
      ],
      bulletIcons: ["🔔", "💀", "⚡", "✅", "🚫"],
      emblem: "🔔",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] URGENT! Ten minutes left! Your account will be DELETED!",
          "[warmly] Feel your heart speed up? That's the trick working.",
          "Scams rush you and scare you on purpose...",
          "[whispers] because a racing heart doesn't stop to think.",
          "[excited] So here's your superpower: feeling rushed IS the red flag.",
          "Spot the rush, and the trick falls apart. Inspector time!",
        ],
      },
    },
    // 12 - Game: INSPECT (phishInspector's first week outing - the Trick Inspector)
    {
      type: "phishInspector",
      introTitle: "The Trick Inspector",
      introSubtitle: "Don't just react - INSPECT. Check all 4 clues, then decide: safe or trick?",
      emails: [
        {
          id: "acct-panic",
          sender: "Account Security",
          subject: "URGENT: your game account will be DELETED in 10 MINUTES!",
          body: "We detected a problem! Click FIX IT NOW within 10 minutes or lose EVERYTHING you own forever!",
          isPhishing: true,
          inspections: {
            senderNote: "'Account Security' - but real games message you INSIDE the game, not like this.",
            senderIsRedFlag: true,
            linkText: "FIX IT NOW button",
            linkNote: "A big panic button begging for a click. We're not clicking ANYTHING while we check.",
            linkIsRedFlag: true,
            urgencyNote: "TEN MINUTES?! Real companies never give you a scary countdown. Ever.",
            urgencyIsRedFlag: true,
            claimNote: "'Lose EVERYTHING forever' - big scary threats are the fear trick at full volume.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "school-books",
          sender: "Mrs. Patel (Maple Hill School)",
          subject: "Library books due back Friday",
          body: "Just a reminder that class 4B's library books are due back this Friday. Thanks! Mrs. Patel",
          isPhishing: false,
          inspections: {
            senderNote: "Your actual teacher, from the school's own address. Checks out.",
            senderIsRedFlag: false,
            linkText: "No links at all",
            linkNote: "Nothing to click - it just tells you something useful.",
            linkIsRedFlag: false,
            urgencyNote: "A calm, normal reminder. No countdown, no panic.",
            urgencyIsRedFlag: false,
            claimNote: "Asks for nothing. Real messages don't want anything back.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "tablet-tonight",
          sender: "PrizeBot 3000",
          subject: "LAST CHANCE! Your FREE tablet expires TONIGHT!",
          body: "You were chosen! Claim your FREE tablet before MIDNIGHT or it goes to someone else. Hurry!!!",
          isPhishing: true,
          inspections: {
            senderNote: "'PrizeBot 3000'? You've never heard of it - and it's 'chosen' you out of nowhere.",
            senderIsRedFlag: true,
            linkText: "CLAIM NOW link",
            linkNote: "The whole message exists to make you tap this. That's the goal of the trick.",
            linkIsRedFlag: true,
            urgencyNote: "'Expires TONIGHT!' - a deadline to stop you thinking. The rush trick again.",
            urgencyIsRedFlag: true,
            claimNote: "A free tablet for doing nothing? Too good to be true = not true.",
            claimIsRedFlag: true,
          },
        },
      ],
      hints: {
        tier1: "Check how it makes you FEEL. Rushed or scared = the trick is working on you.",
        tier2: "Real messages are calm and want nothing. Countdowns, threats and panic buttons = trick, every time.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Inspector on duty! Messages are coming in.",
          "Check all four clues on each one...",
          "who sent it, what it wants you to press, how it sounds, and what it promises.",
          "[warmly] Rushed and scary... or calm and normal? You decide!",
        ],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "you have 60 seconds to click, or your account is GONE FOREVER! Tick tock!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Real companies never THREATEN you with a countdown. ✓",
      nudge: "Who actually talks like that - a real company, or a trickster?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Scams rush and scare you on purpose. Feeling rushed IS the red flag.",
      next: "the disguise trick - senders that LOOK real",
      emblem: "🔔",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three tricks down!",
          "Countdowns, threats, panic buttons...",
          "[laughs] you inspected them all and never once got rushed.",
          "[whispers] But his sneakiest trick is next. The lookalike...",
        ],
      },
    },

    /* ─────────── BEAT 4 · FAKE SENDERS ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "The Lookalike Sender",
      content:
        "The sneakiest scams pretend to be someone you TRUST - your game, your school, even family. But look closely and the disguise slips: a letter swapped for a number, a weird address, a name that's almost-but-not-quite right. Real senders you can check; lookalikes fall apart when you look.",
      bullets: [
        "Scams dress up as people you trust",
        "Look close: swapped letters, sneaky numbers",
        "Check the address, not just the name",
        "Almost-right is all-wrong",
        "Not sure? Check with a grown-up first",
      ],
      bulletIcons: ["🎭", "🔍", "✉️", "🚫", "👪"],
      emblem: "🕵️",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Now for the sneakiest trick of all.",
          "A message that LOOKS like it's from your game... or your school.",
          "[warmly] But look closely. A letter becomes a number.",
          "The address is weird. Something's just... off.",
          "[excited] Almost-right is ALL-WRONG.",
          "Time to line up some senders and bust the imposter!",
        ],
      },
    },
    // 16 - Game: SELECT (Sender Lineup debut)
    {
      type: "senderLineup",
      rounds: [
        {
          id: "game-update",
          prompt: "Four messages say your game needs attention. One sender is wearing a disguise - bust it!",
          senders: [
            { id: "mega-real", name: "Mega Blasters", detail: "message center, inside the game", icon: "🎮", isFake: false, note: "Real games talk to you INSIDE the game - that's the safe channel." },
            { id: "school", name: "Maple Hill School", detail: "office@maplehill.edu", icon: "🏫", isFake: false, note: "Your actual school, from its own address. Checks out." },
            { id: "mega-fake", name: "Mega B1asters", detail: "prize@mega-blasterz.win", icon: "🎮", isFake: true, note: "Look close: a '1' where the 'l' should be, and a weird '.win' address. IMPOSTER." },
            { id: "grandma", name: "Grandma", detail: "saved in the family phone", icon: "👪", isFake: false, note: "A saved family contact - as real as it gets." },
          ],
        },
        {
          id: "spelling-prize",
          prompt: "Someone says you won a spelling prize. Who's the imposter?",
          senders: [
            { id: "teacher", name: "Mrs. Patel", detail: "your teacher, school email", icon: "🏫", isFake: false, note: "Your real teacher would be the one to tell you - and she asks for nothing." },
            { id: "dad", name: "Dad", detail: "saved family contact", icon: "👪", isFake: false, note: "A saved family contact. Real." },
            { id: "office", name: "School Office", detail: "office@maplehill.edu", icon: "✅", isFake: false, note: "The school's own address again - consistent and checkable." },
            { id: "prizes4u", name: "Spelling Prizes 4U", detail: "winner@freeprizes.biz", icon: "🎁", isFake: true, note: "A prize company you've never heard of, from 'freeprizes.biz'? IMPOSTER." },
          ],
        },
        {
          id: "gift-card",
          prompt: "A gift card has arrived... apparently. Spot the disguise!",
          senders: [
            { id: "roblox-real", name: "Roblox", detail: "gift message, inside the app", icon: "🎮", isFake: false, note: "Inside the app = the real channel." },
            { id: "roblox-fake", name: "R0BLOX Rewards", detail: "gift@roblox-rewards.club", icon: "🎮", isFake: true, note: "A ZERO instead of an 'O', plus a '.club' address. Almost-right is all-wrong!" },
            { id: "cousin", name: "Your cousin", detail: "saved family contact", icon: "⭐", isFake: false, note: "A real saved contact sending a real gift. Lovely!" },
            { id: "shop", name: "Game Shop receipt", detail: "after Mom bought the card", icon: "✅", isFake: false, note: "A receipt for something a grown-up actually bought. Real." },
          ],
        },
      ],
      hints: {
        tier1: "Read every NAME letter by letter - and check where the message is really from.",
        tier2: "Swapped letters (1 for l, 0 for O) and weird addresses (.win, .biz, .club) give the imposter away.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The lineup is ready!",
          "Four senders on the podiums. Three are real.",
          "[whispers] One is a lookalike in disguise.",
          "[warmly] Read carefully, letter by letter... then bust the imposter!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Check each name AND its address - then tap the imposter!"],
      },
    },
    // 17 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which sender is the FAKE?",
      choices: [
        { text: "Mega B1asters - prize@mega-blasterz.win", isCorrect: true },
        { text: "Grandma - saved family contact", isCorrect: false },
        { text: "School Office - the school's own address", isCorrect: false },
        { text: "Mega Blasters - inside the game", isCorrect: false },
      ],
      praise: "That sneaky '1' didn't fool you! ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Lookalike senders swap letters and use weird addresses. Almost-right is all-wrong.",
      next: "the golden move that beats every scam at once",
      emblem: "🕵️",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four tricks down! Nothing gets past you.",
          "Ones for L's, zeros for O's...",
          "[laughs] you read every disguise like a book.",
          "[warmly] One last move to learn. And it beats ALL of them.",
        ],
      },
    },

    /* ─────────── BEAT 5 · DON'T BITE ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Don't Bite: Stop, Check, Show",
      content:
        "Here's the move that beats every scam ever made: DON'T BITE. Step 1 - STOP. Don't click, don't reply, don't rush. Step 2 - CHECK. Read it slowly. Who sent it? What does it want? Step 3 - SHOW a grown-up. Every time. A scam only works if you bite - so don't!",
      bullets: [
        "Step 1: STOP - no clicking, no rushing",
        "Step 2: CHECK - read it slowly",
        "Step 3: SHOW a grown-up",
        "A scam only works if you bite",
        "Not biting beats every trick ever made",
      ],
      bulletIcons: ["✋", "🔍", "👪", "🪤", "🏆"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last lesson - and it's the golden one.",
          "Every scam, every trick, every disguise...",
          "[excited] loses to the same three steps.",
          "STOP. Don't click, don't rush.",
          "CHECK. Read it slowly, like a detective.",
          "[whispers] And SHOW a grown-up. Every single time.",
          "[excited] A scam only works if you bite. So... don't bite!",
        ],
      },
    },
    // 20 - Game: DECIDE (Bite or Don't - classic card look)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "A message flashes: 'You WON 10,000 V-Bucks! Click in 10 seconds or lose them FOREVER!'",
          choices: [
            { text: "Click fast - only 10 seconds!", isSafe: false, consequence: "There were never any V-Bucks. Rushing you is HOW the trick works - and the click was all he wanted." },
            { text: "STOP - check - show a grown-up", isSafe: true, consequence: "Hero move! You paused, and the 'prize' vanished... because it never existed. No bite, no trick." },
          ],
        },
        {
          setup: "A text says: 'Your package is waiting! Enter a parent's card number to release it.'",
          choices: [
            { text: "Type in the card number - I want my package!", isSafe: false, consequence: "There is no package - and now a stranger has the card number. Card numbers NEVER go into surprise messages." },
            { text: "STOP - check - show a grown-up", isSafe: true, consequence: "Perfect! A grown-up checked: no package was ever coming. The 'stuck package' is one of the oldest tricks going." },
          ],
        },
        {
          setup: "A pop-up screams: 'Your computer has 5 VIRUSES! Call this number NOW!'",
          choices: [
            { text: "Panic and call the number", isSafe: false, consequence: "The 'virus warning' WAS the trick - the people on that number are the tricksters themselves." },
            { text: "STOP - close it - show a grown-up", isSafe: true, consequence: "Exactly right. Scary pop-ups are ads in monster costumes. A grown-up can check the computer properly." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Practice time - the tricky moments are coming.",
          "Each one will push you to act FAST.",
          "[whispers] That push is your signal.",
          "[excited] Stop. Check. Show. Let's see you do it!",
        ],
      },
    },
    // 21 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A tricky message lands. Tap the hero steps IN ORDER:",
      choices: [
        { text: "STOP - don't click", isCorrect: true },
        { text: "CHECK it slowly", isCorrect: true },
        { text: "SHOW a grown-up", isCorrect: true },
      ],
      praise: "Stop. Check. Show. Trick-proof! ✓",
      nudge: "What's the very FIRST thing - before any checking?",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Stop, check, show a grown-up. A scam only works if you bite - so don't bite.",
      next: "one final drill, then the Raccoon's inbox of tricks",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE trick-beating powers!",
          "You know what scams are, you smell the bait,",
          "you never rush, you bust every lookalike...",
          "[whispers] and you never, ever bite.",
          "[excited] Final drill - then let's empty his whole inbox of tricks!",
        ],
      },
    },

    // 23 - Consolidation: The Trick Scanner (W1 scanner engine, W4 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "REAL",
        negative: "TRICK",
        positiveHint: "Tap REAL for normal, calm messages",
        negativeHint: "Tap TRICK for bait, rush and lookalikes",
        tipWhenPositive: "Calm messages from people you can check, wanting nothing back - real.",
        tipWhenNegative: "Prizes, countdowns, threats and lookalike senders - tricks, every one.",
        hint1: "Ask the hero questions: does it WANT something? Is it RUSHING me? Is the sender almost-but-not-quite right?",
        hint2: "REAL = calm + checkable + wants nothing. TRICK = prizes, panic, deadlines, swapped letters.",
        hint2Example: "REAL: 'Practice moved to 4pm'   TRICK: 'FREE iPhone - 10 minutes left!'",
        hint3: "Quick rule card: too good = trick · countdown = trick · lookalike name = trick · calm and checkable = real.",
        hint3Example: "'R0BLOX Rewards' ❌    'Library book ready' ✅",
      },
      items: [
        { text: "'Football practice moved to 4pm' - Coach Lee", isStrong: true, explanation: "Calm, useful, from a real known sender." },
        { text: "'FREE iPhone! Claim in 10 minutes!' - Prize Central", isStrong: false, explanation: "Bait AND a countdown - a double trick." },
        { text: "'Your account will be DELETED unless you click NOW'", isStrong: false, explanation: "Fear + rush = the scariest costume tricks wear." },
        { text: "'See you Sunday for dinner!' - Grandma", isStrong: true, explanation: "A real message from a saved family contact." },
        { text: "'Gift card inside!' - R0BLOX Rewards (.club)", isStrong: false, explanation: "A zero for an O and a weird address - lookalike imposter." },
        { text: "'Your dragon book is ready' - Library", isStrong: true, explanation: "Calm, wants nothing, easy to check. Real." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill! Messages are drifting past.",
          "Tap REAL for the calm, normal ones...",
          "and TRICK for bait, panic and lookalikes.",
          "[warmly] Five powers. One scanner. Show me!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - bespoke W4 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: every scam returns to sender
    { type: "video", videoPlaceholder: "Week 4: Return to Sender", videoSrc: "/videos/module-04-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "what", label: "Trick Radar", accent: "#ffb347", icon: "🪤", summary: "A scam is a trick in a costume - it wants your info, money or your click. Pressing is how the trick gets in." },
        { id: "toogood", label: "Bait Detector", accent: "#ffd158", icon: "🎁", summary: "Too good to be true = not true. Amazing prizes from strangers are bait." },
        { id: "hurry", label: "Panic-Proof", accent: "#ff5fb3", icon: "🔔", summary: "Countdowns and threats are the rush trick. Feeling rushed IS the red flag." },
        { id: "senders", label: "Imposter Buster", accent: "#00e5ff", icon: "🕵️", summary: "Lookalike senders swap letters and hide behind weird addresses. Busted." },
        { id: "nobite", label: "The No-Bite Rule", accent: "#7eff97", icon: "✋", summary: "Stop. Check. Show a grown-up. A scam only works if you bite." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You smell bait a mile away, no countdown can rush you,",
          "no lookalike can fool you...",
          "[laughs] and you never, ever bite!",
          "[excited] Every scam went straight back to sender. Sticker time!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "bait-dodger", name: "Bait Dodger", icon: "🎁", description: "No prize can fool this hero." },
        { id: "panic-proof", name: "Panic-Proof", icon: "🔔", description: "Countdowns bounce right off." },
        { id: "imposter-buster", name: "Imposter Buster", icon: "🕵️", description: "Spots the lookalike every time." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // W4 SHOWDOWN — THE BAIT CASTER (design doc §W4: the Inbox of Tricks).
  // P1 deflectSort bait vs real mail · P2 shieldHold countdown burnout ·
  // P3 tapTell lookalike parcels · finisher = the SCAM stamp.
  bossShowdown: {
    machine: {
      name: "THE BAIT CASTER",
      tagline: "A hook machine that makes tricks look like treats",
      art: {
        intact: "/game/bosses/w04-baitcaster-intact.png",
        damaged: "/game/bosses/w04-baitcaster-damaged.png",
        defeated: "/game/bosses/w04-baitcaster-defeated.png",
      },
      arena: "/game/backgrounds/w04-arena-dock.png",
      accent: "#ffd158",
      glow: "rgba(255,209,88,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w04/adam-fisher-idle.png",
        attack: "/game/characters/w04/adam-fisher-attack.png",
        celebrate: "/game/characters/w04/adam-fisher-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w04/layla-fisher-idle.png",
        attack: "/game/characters/w04/layla-fisher-attack.png",
        celebrate: "/game/characters/w04/layla-fisher-celebrate.png",
      },
    },
    phases: [
      // P1 · FAKE PRIZE → SIGNATURE ("The Bargainster's hooked lures"): the
      // bespoke climactic board for this boss — reel in each dangling deal, cut
      // the baited scams (each hides a tell), set the real notes free. Replaces
      // the plain deflect-sort so W4's fight has its own distinctive mechanic.
      // Uses the component's built-in W4 lure set (no config needed).
      {
        kind: "signature",
        mechanic: "w4Bargainster",
        attack: 0,
        coach: "Reel in each deal! Cut the baited hooks, set the real notes free.",
      },
      // P2 · COUNTDOWN SCARE → SHIELD-HOLD: the clock blares and burns out.
      {
        kind: "shieldHold",
        attack: 1,
        coach: "Press the CALM shield and DON'T let go!",
        holdLabel: "HOLD THE CALM",
        holdIcon: "🛡️",
        holdSecs: 6,
        barrage: [
          "Offer ENDS in 30 seconds!",
          "Tap now or miss out FOREVER!",
          "The timer's nearly at ZERO!",
          "No time to ask anyone, GO!",
          "Everyone else already claimed theirs!",
        ],
        burnoutLine: "The timer ran out and nothing bad happened. Real messages never rush you, stay calm and show a grown-up.",
      },
      // P3 · LOOKALIKE → TAP-THE-TELL: two parcels 'from Nintendo'.
      {
        kind: "tapTell",
        attack: 2,
        coach: "Read it LETTER BY LETTER - tap the tell!",
        rounds: [
          {
            id: "zero",
            prompt: "A message says it's from your school: 'Sch00l Office'...",
            promptIcon: "🎭",
            options: [
              { id: "zeros", label: "The two O's in School are ZEROS", icon: "🔍", isTell: true, note: "" },
              { id: "crest", label: "It has the school crest", icon: "🎨", isTell: false, note: "Crests are easy to copy. Read the NAME letter by letter." },
              { id: "class", label: "It mentions your class", icon: "💬", isTell: false, note: "Anyone can type a class. Read the NAME letter by letter." },
            ],
          },
          {
            id: "addr",
            prompt: "A 'YouTube prize' message looks shiny. Check where it's from...",
            promptIcon: "🕵️",
            options: [
              { id: "cartoons", label: "Knows you like cartoons", icon: "💬", isTell: false, note: "Anyone could guess that. Check the ADDRESS." },
              { id: "website", label: "Sent from youtube-free-cash.xyz", icon: "👀", isTell: true, note: "" },
              { id: "playbtn", label: "Uses a red play button", icon: "⭐", isTell: false, note: "Logos are easy to fake. Check the ADDRESS." },
            ],
          },
        ],
      },
    ],
    weakPoints: [
      { question: "A message says 'Send this to 10 friends and a FREE games console arrives at your door!' Why is it fake?", answers: ["No one mails free consoles for forwarding a message", "It's real if you have 10 friends", "Because 10 friends is too many", "Consoles are cheap now"], correctIndex: 0, explanation: "Chain messages promising big prizes are always bait. Nobody gives treasure to strangers." },
      { question: "A pop-up shouts 'Your tablet is INFECTED, tap to fix in 20 seconds!' Why the scary countdown?", answers: ["Tablets really do break in 20 seconds", "To panic you into tapping before you think", "It's a helpful safety warning", "To be polite about the problem"], correctIndex: 1, explanation: "Fear and countdowns stop you thinking. Slow down and the trick falls apart." },
      { question: "Which sender is the imposter?", answers: ["Coach Lee, saved contact", "Maple Hill School, office@maplehill.edu", "App St0re Rewards, prizes@app-store-gifts.top", "Gran, saved family contact"], correctIndex: 2, explanation: "A zero in 'St0re' and an odd '.top' address, almost-right is all-wrong." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE SCAM STAMP",
      chargeIcon: "🔨",
      chargeSecs: 5,
      milestones: ["Inking up…", "Halfway! Keep pressing!", "FULLY INKED! SLAM IT!"],
      payoffTitle: "STAMPED: SCAM!",
      payoffLine: "You stopped, you checked, you never bit. Every trick goes back to sender!",
    },
    villain: {
      arrival: "Congratulations!!! You've WON a once-in-a-lifetime BOSS BATTLE!",
      phases: [
        "Every hook hand-glittered by yours truly!",
        "Tick tock tick tock! No thinking allowed!",
        "Spot the difference? There ISN'T one! Probably!",
      ],
      escape: "Keep your stamp! I've got other inboxes to visit!",
    },
    voiceSlug: "w04",
  },
  badgeArt: "/cyberheroes/badges/week-04-trick-catcher.png",

  // Week-lane attack theatre: scam-message tricks only (no fake-people
  // vocabulary - that's W3's lane; no link/QR mechanics - W16).
  bossAttacks: [
    { name: "FAKE PRIZE",      icon: "🎁", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Too good = not true",       emblemColor: 0xffd158 },
    { name: "COUNTDOWN SCARE", icon: "🔔", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Real companies don't rush", emblemColor: 0xff5fb3 },
    { name: "LOOKALIKE",       icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Almost-right is all-wrong", emblemColor: 0xc084fc },
  ],

  // Placeholder quiz boss (the bespoke W4 COMBAT - the Inbox of Tricks -
  // is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What does a scam always WANT?", answers: ["Your info, money or clicks", "To be your friend", "Nothing at all", "To give you a real prize"], correctIndex: 0, explanation: "Scams always want something back - that's how you spot them." },
      { question: "'FREE iPhone - you WON!' But you never entered anything. That's...", answers: ["Bait - too good to be true", "Your lucky day", "A nice surprise", "Worth one little click"], correctIndex: 0, explanation: "You can't win a draw you never entered. Amazing prizes are bait." },
      { question: "A message gives you a scary 10-minute countdown. Real companies...", answers: ["NEVER do that - it's the rush trick", "Do it all the time", "Only do it for big problems", "Do it to be helpful"], correctIndex: 0, explanation: "Countdowns exist to stop you thinking. Feeling rushed IS the red flag." },
    ],
    medium: [
      { question: "Which sender is the imposter?", answers: ["R0BLOX Rewards - gift@roblox-rewards.club", "Roblox - inside the app", "Grandma - saved contact", "School Office - school address"], correctIndex: 0, explanation: "A zero for an O and a weird address - almost-right is all-wrong." },
      { question: "A pop-up screams 'You have 5 VIRUSES! Call NOW!' What is it?", answers: ["The trick itself - close it and show a grown-up", "A helpful warning", "A real virus checker", "A reason to call the number fast"], correctIndex: 0, explanation: "Scary pop-ups are ads in monster costumes - the panic IS the trick." },
      { question: "What are the three no-bite steps?", answers: ["Stop, check, show a grown-up", "Click, read, delete", "Run, hide, wait", "Reply, ask, click"], correctIndex: 0, explanation: "Stop. Check. Show. A scam only works if you bite." },
    ],
    hard: [
      { question: "Why do scams RUSH you on purpose?", answers: ["A racing heart doesn't stop to think", "They're in a hurry", "Their offers really expire", "They're just excited"], correctIndex: 0, explanation: "The rush is engineered - slow down and the whole trick falls apart." },
      { question: "'Your package is stuck - pay $1 to release it.' What's really going on?", answers: ["A trick to grab the card number", "A real delivery problem", "A bargain", "A shipping discount"], correctIndex: 0, explanation: "The $1 isn't the prize - the card number is. Cards never go into surprise messages." },
      { question: "What beats EVERY scam ever made?", answers: ["Not biting - stop, check, show", "Clicking really fast", "A strong password", "Turning the screen off"], correctIndex: 0, explanation: "Every trick needs a bite to work. No bite, no trick." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 4 - real or fake?" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "10,000 V-Bucks... and someone bit!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "A trick... in a costume." }, layla: null }, // learn: what
    4: { adam: { mood: "excited", message: "Reel in the real - cut the scams!" }, layla: null }, // game: hookSort
    5: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "If it's TOO amazing... it's bait." } }, // learn: toogood
    8: { adam: { mood: "excited", message: "ZAP that bait!" }, layla: null }, // game: spamBlaster
    9: { adam: null, layla: { mood: "excited", message: "Quick - spot the bait!" } }, // prove: speed
    10: { adam: { mood: "thumbsup", message: "Bait detector: gleaming!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Feeling rushed IS the red flag." }, layla: null }, // learn: hurry
    12: { adam: { mood: "curious", message: "Inspect all four clues, detective." }, layla: null }, // game: phishInspector
    13: { adam: null, layla: { mood: "worried", message: "He's fibbing - catch him!" } }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Panic-proof: certified!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Almost-right is all-wrong." } }, // learn: senders
    16: { adam: { mood: "excited", message: "Bust that imposter!" }, layla: null }, // game: senderLineup
    17: { adam: null, layla: { mood: "excited", message: "Which one was fake?" } }, // prove: recall
    18: { adam: { mood: "thumbsup", message: "No disguise gets past you." }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Stop. Check. Show. Every time." }, layla: null }, // learn: nobite
    20: { adam: { mood: "curious", message: "Feel the push to rush? That's the signal." }, layla: null }, // game: decide
    21: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Real or trick - scan them fast!" } }, // consolidation
    24: { adam: { mood: "worried", message: "The Inbox of Tricks - empty it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Return to sender - all of them!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Trick Catcher badge earned!" }, layla: null }, // completion
  },
};

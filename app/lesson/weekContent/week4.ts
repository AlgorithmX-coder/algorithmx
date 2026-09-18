import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 4 - Scams and Tricks: Real or Fake?
 *
 * Rebuilt to the LEARN-LOOP standard (Build Standard v0.8: Weeks 15, 1, 2, 3
 * and all three UAT batches). Spine (30 screens):
 *
 *   video -> alert (Sarah hook) -> weekIntro (ATLAS) -> mission -> 5 concepts,
 *   each = Learn (info, numbered, opens on the POWER N OF 5 sweep) -> Game
 *   (folded-in Spot-the-Danger `threat` + 5-beat intro + Sarah's on-board
 *   how-to + every item read aloud + one-take spoken verdicts + guided round 1
 *   + completeNarration payoff) -> Prove (quickCheck + teachNarration) -> recap
 *   (praise, restate, cliffhanger AND the lesson bridge in one breath):
 *     1 WANT     a scam always wants something back | stringsAttached "Strings Attached"   | finish
 *     2 BAIT     too good to be true                 | believeOMeter "The Believe-o-Meter"  | speed
 *     3 HURRY    urgency + fear are the trick        | phishInspector "The Barker's Booth"   | lie
 *     4 COPYCAT  lookalike senders (NOT links - W16) | nameTagCheck "The Name Tag Check"     | recall
 *     5 NOBITE   stop, check, show a grown-up        | firewallBuilder "The No-Bite Wall"    | order
 *   -> consolidation "The Hall of Mirrors" (passwordVault, skin: mirrors) ->
 *      bossBattle (QuizBoss, 5 Q / passMark 4) -> closing video -> debrief ->
 *      stickers -> completion.
 *
 * "The Rigged Ring Toss" signature was CUT (flick-and-drag control, and it
 * taught "too good to be true" two screens before the lesson). Its x-ray
 * reveal (the magnet under the counter, the Raccoon crouched behind the booth)
 * lives on in the Believe-o-Meter's Spot-the-Danger boast.
 *
 * ENGINE REUSE POLICY (owner, caps: "WE NEVER COPY AN EXERCISE"): a rebuilt week
 * never uses an engine already used by a previously rebuilt week (W15, W1, W2,
 * W3) nor a neighbour week (W3, W5). W4 = stringsAttached / believeOMeter /
 * phishInspector / nameTagCheck / firewallBuilder / passwordVault: zero overlap.
 * Two engines are new (connect, dials), one is a new mark-and-compare drill,
 * two were orphaned legacy engines brought to the standard (the wall, the
 * vault) and one was already this week's (the inspector), now fully wired.
 * `node scripts/audit-engine-reuse.mjs --week=4 --strict`.
 *
 * Lane-clean: scam MESSAGES and lookalike SENDERS only. No link/QR mechanics
 * (W16), no free-currency generators (W7), no fake PEOPLE (W3 owns profiles).
 * Real product names (V-Bucks, Roblox) appear only as the REAL thing a
 * copycat imitates; the trickster is always the Raccoon.
 *
 * Dialogue: both layers audited to 0 flags with
 * `node scripts/audit-narration-flow.mjs --week=4`. Sarah reads every in-game
 * beat; the Raccoon's boasts are on-screen text in his bubble. Sarah never
 * reads an address aloud: a lookalike can't be spotted by ear.
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

    // 1 - ALERT: incident report (Sarah's hook)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-04.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon blasted out 'YOU WON 10,000 V-BUCKS!' to every kid in the city, and someone clicked. There was no prize. There never is. He's opening a whole carnival of fakes!",
      photoCaption: "Wk 4 - The Prize That Wasn't",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Oh no, Cyber Hero, look at this! The Raccoon blasted out YOU WON ten thousand V-Bucks to every kid in the city.",
          "And someone clicked. There was no prize. There never is.",
          "[whispers] Right now, he's setting up a whole carnival of fakes.",
          "[warmly] But YOU are about to learn every trick in his book.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[4] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn what a scam really is: a trick in a costume",
        "Spot too good to be true and the hurry-up trick a mile away",
        "Master the no-bite rule: stop, check, show a grown-up",
      ],
    },

    /* ─────────── BEAT 1 · WHAT A SCAM IS (IT ALWAYS WANTS SOMETHING) ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "What Is a Scam?",
      content:
        "A scam is a TRICK dressed up as something nice. Under the costume it always wants something back: your password, your family's money, or your tap, because pressing its button is how the trick gets in. Real messages just tell you things and want nothing. Scams always want something, and that is how you spot them.",
      bullets: [
        "A scam is a trick in a costume",
        "It wants your password, your money or your tap",
        "Real messages want NOTHING back",
        "Every prize has a string attached",
        "Follow the string before you touch anything",
      ],
      bulletIcons: ["🪤", "🔑", "✅", "📣", "🔍"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome back, Cyber Hero. This week we hunt SCAMS.",
          "A scam is a trick... wearing a costume.",
          "[whispers] Under the costume, it always wants something back: your password, your money, or your tap.",
          "[excited] And that is how you catch one. Real messages want NOTHING from you.",
          "Every prize at the Raccoon's fair has a string attached. Come and see where the strings lead!",
        ],
      },
    },
    // 5 - Game: CONNECT "Strings Attached" (stringsAttached, new engine)
    {
      type: "stringsAttached",
      threat: {
        raccoonLine:
          "Roll up, roll up! Every prize at my carnival has a teeny string attached. Nobody ever looks at where the string GOES, they just grab the prize!",
      },
      introTitle: "Strings Attached",
      introSubtitle: "Every prize has a string. Follow it to what the offer really wants.",
      introIcon: "🎈",
      scamToast: "STRING FOLLOWED: A TRICK!",
      fairToast: "NO STRINGS: A REAL ONE!",
      completeTitle: "Every string followed!",
      completeLine: "You saw what each prize really wanted.",
      offers: [
        {
          id: "free-coins",
          text: "FREE MEGA COINS! Type your password to claim",
          readAloud: "Free mega coins! Just type your password to claim them.",
          wants: "password",
          why: "Free coins that need your password are not free at all. The password is the whole prize, and it's YOURS.",
          nudge: "Look at what this offer asks you to type. That is what its string is tied to.",
        },
        {
          id: "parcel",
          text: "Your parcel is stuck! Pay $1 to release it",
          readAloud: "Your parcel is stuck! Pay one dollar to release it.",
          wants: "money",
          why: "There is no parcel. That one dollar is a doorway to a grown-up's card number, and the money is what it wants.",
          nudge: "What does this message want you to PAY? Follow the string to that.",
        },
        {
          id: "puppy",
          text: "You WON a puppy! Tap here to claim it",
          readAloud: "You won a puppy! Tap here to claim it.",
          wants: "tap",
          why: "You never entered a puppy contest. The prize is bait, and the tap is the hook: pressing that button is how the trick gets in.",
          nudge: "This prize doesn't ask for money or a password. So what is the one thing it wants you to DO?",
        },
        {
          id: "library",
          text: "Library: your dragon book is ready to pick up",
          readAloud: "Library: your dragon book is ready to pick up.",
          wants: "nothing",
          why: "The library just tells you something useful and asks for nothing back. A message with no strings is a real one.",
          nudge: "Read the library's message again. Does it ask you for anything at all?",
        },
        {
          id: "billionaire",
          text: "A billionaire is giving away money! Reply with a card number",
          readAloud: "A billionaire is giving away money! Reply with a card number to get yours.",
          wants: "money",
          why: "Billionaires don't message kids. The giveaway is the costume, and a card number is money, so money is what the string is tied to.",
          nudge: "Nobody gives money away to strangers. Look at what it wants you to send BACK.",
        },
        {
          id: "coach",
          text: "Coach Lee: practice moved to 4pm today",
          readAloud: "Coach Lee: practice moved to four p m today.",
          wants: "nothing",
          why: "Your coach is someone you know, and the message asks for nothing. No strings, so it's real.",
          nudge: "Does your coach ask you for anything at all? Check for a string before you tie one.",
        },
      ],
      hints: {
        tier1: "Ask: does it WANT something from me? A password, money, or one quick tap?",
        tier2: "Real messages just tell you things and want nothing. Scams beg for a password, ask for money, or push you to tap.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, we visit the Raccoon's carnival. Every prize there is tied to a string!",
          "This game is all about what a scam really WANTS from you.",
          "Out in the real world, a message that offers you something amazing is often fishing for your password, your money, or one quick tap.",
          "Here is what you do. Tap a prize balloon and I'll read its offer.",
          "Then tap the token on the counter that its string really leads to.",
          "Your password... your money... your tap... or nothing at all, because some offers are real.",
          "[warmly] Follow every string and no prize can hook you. Ready? Let's follow the strings!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap a prize balloon to hear its offer. Then tap the token its string really leads to. Some offers want nothing at all: those are the real ones."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every string followed! You can see what a scam really wants, so the Raccoon's prizes can't hook you.",
          "[warmly] Out in the real world, the moment a message asks for your password, your money or a quick tap, you'll spot the string. And a message with no strings? That one's real.",
        ],
      },
    },
    // 6 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "A scam is a ___ in a costume.",
      choices: [
        { text: "trick", isCorrect: true },
        { text: "game", isCorrect: false, why: "A game is something you play for fun; a scam is pretending to be nice to get something from you." },
        { text: "prize", isCorrect: false, why: "The prize is the costume, not the thing hiding underneath it." },
        { text: "friend", isCorrect: false, why: "A scam might act friendly, but a real friend wants nothing from you." },
      ],
      praise: "Exactly. A TRICK in a costume! ✓",
      nudge: "Think about what's hiding under the costume...",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Exactly. A trick in a costume.",
          "The costume is the shiny part: a prize, a warning, a friendly hello.",
          "Underneath, it always wants something back, and real messages don't.",
          "[excited] Spot the want, spot the trick. Nice work!",
        ],
      },
    },

    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "A scam is a trick in a costume. It wants your password, your money or your tap, so you follow the string before you touch anything.",
      next: "the shiniest bait of all: too good to be true",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Great start, Cyber Hero!",
          "You followed every string, and you saw what each prize really wanted.",
          "Real messages ask for nothing. Scams always want something back.",
          "[whispers] But the Raccoon's biggest booth is still open, and its prizes are ENORMOUS...",
          "Next, we'll learn the shiniest bait of all: too good to be true. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · TOO GOOD TO BE TRUE ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Too Good To Be True",
      content:
        "FREE tablet! 10,000 coins! A puppy for the millionth visitor! Here's the hero rule: if it sounds TOO amazing, it isn't real. Nobody gives treasure to strangers, and you can't win a prize you never entered. But not everything is a trick: a small prize you really earned can be real. Not sure? That means check with a grown-up first.",
      bullets: [
        "'FREE' + amazing = bait",
        "'You WON!' but you never entered? Bait",
        "Nobody gives treasure to strangers",
        "A small prize you really earned can be real",
        "Not sure? Check with a grown-up first",
      ],
      bulletIcons: ["🎁", "🏆", "💎", "✅", "👪"],
      emblem: "🎁",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Free tablet! Ten thousand coins! A puppy for the millionth visitor!",
          "[laughs] Sounds amazing, right? That is exactly the point. It is BAIT.",
          "Nobody gives treasure to strangers. And you can't win a prize you never entered.",
          "[warmly] So here's the hero rule: if it sounds too good to be true, it isn't true.",
          "But not everything is a trick. A small prize you really earned can be real. Not sure? That means check with a grown-up first.",
          "[excited] A carnival dial will show you how believable each offer is. Let's go and measure some offers!",
        ],
      },
    },
    // 9 - Game: DIALS "The Believe-o-Meter" (believeOMeter, new engine)
    {
      type: "believeOMeter",
      threat: {
        raccoonLine:
          "Step right up! The bigger I make the prize, the faster they grab it. Ten thousand coins! A free tablet! Nobody stops to ask if a prize that big could possibly be real. And nobody checks under my counter for the magnet, hee hee!",
      },
      introTitle: "The Believe-o-Meter",
      introSubtitle: "Turn the needle to how believable each offer is, then lock it in.",
      introIcon: "🎯",
      lockLabel: "LOCK IT IN",
      completeTitle: "Every offer measured!",
      completeLine: "Your believe-o-meter is perfectly tuned.",
      offers: [
        {
          id: "tablet",
          text: "FREE tablet for the first 10 kids!",
          from: "Mega Deals",
          readAloud: "Free tablet for the first ten kids! From: Mega Deals.",
          answer: "noway",
          why: "A free tablet from a shop you've never heard of, for doing nothing, is too good to be true. That is bait.",
          whyWrong: "Ask: would a real shop give tablets to strangers for free? A prize that big, from a stranger, is never real.",
        },
        {
          id: "coach",
          text: "You won player of the match!",
          from: "Coach Lee",
          readAloud: "You won player of the match! From: Coach Lee.",
          answer: "real",
          why: "You really played in that match, and Coach Lee is someone you know. A small prize you earned, from a real person, can be real.",
          whyWrong: "Think about who this is from and what you did. You played the match, and Coach Lee is real. That changes the needle.",
        },
        {
          id: "skin",
          text: "FREE weekend skin! Log in to grab it",
          from: "Mega Blasters",
          readAloud: "Free weekend skin! Log in to grab it. From: Mega Blasters.",
          answer: "hmm",
          why: "Games really do give away a free skin sometimes, so it could be real, but it could be a copycat too. Not sure means check with a grown-up first.",
          whyWrong: "Games do give away a free skin sometimes, but you can't be sure this is really your game. When you can't tell, the needle points to check first.",
        },
        {
          id: "millionth",
          text: "You are our 1,000,000th visitor! Collect your prize!",
          from: "Lucky Visitor",
          readAloud: "You are our one millionth visitor! Collect your prize! From: Lucky Visitor.",
          answer: "noway",
          why: "No website counts visitors and hands out prizes. You never entered anything, so this is bait.",
          whyWrong: "You didn't enter anything, and a millionth visitor prize is enormous. Think about how big and how strange that is.",
        },
        {
          id: "bookmark",
          text: "You finished 10 books! A free bookmark is waiting",
          from: "Library",
          readAloud: "You finished ten books! A free bookmark is waiting for you. From: the Library.",
          answer: "real",
          why: "You really joined the reading challenge, the library is a place you know, and a bookmark is a tiny prize. That is believable.",
          whyWrong: "Look at the prize and the sender. A tiny bookmark from your own library, for reading you actually did, is not bait.",
        },
        {
          id: "survey",
          text: "A $5 gift card for filling in a quick survey",
          from: "Game Rewards Team",
          readAloud: "A five dollar gift card for filling in a quick survey. From: Game Rewards Team.",
          answer: "hmm",
          why: "A small gift card could be real, but a survey often asks for private info, and you don't know this sender. Not sure means check first.",
          whyWrong: "It's small, so it might be real, but you don't know this sender and a survey asks questions. When you can't be sure, the needle points to check first.",
        },
      ],
      hints: {
        tier1: "Ask: how BIG is the prize, and do I know who it's from? Giant prize from a stranger? No way.",
        tier2: "A tiny prize you earned, from someone you know: could be real. A giant prize from a stranger: no way. Not sure: check first.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your second challenge, you take charge of the Believe-o-Meter!",
          "This game is all about how believable an offer is: could be real, hmm, check first, or no way.",
          "Out in the real world, most offers land on one of those three, and the enormous ones from strangers are always no way.",
          "Here is what you do. A poster hangs above the dial and I'll read it.",
          "Tap the arrows to move the needle to one of three stops... Could be real... Hmm, check first... or No way.",
          "Then tap LOCK IT IN.",
          "[warmly] Get the needle right and no giant prize can dazzle you. Ready? Let's measure!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Listen to the poster. Then tap the arrows to move the needle, and tap Lock it in when it points where you believe."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every offer measured! You can tell a real prize from bait, so the Raccoon's giant giveaways can't dazzle you.",
          "[warmly] Out in the real world, enormous prizes from strangers go straight to no way, and when you're not sure, you check with a grown-up first.",
        ],
      },
    },
    // 10 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one is BAIT?",
      speedMs: 5000,
      choices: [
        { text: "FREE tablet, only 10 left!", isCorrect: true },
        { text: "Practice moved to 4pm", isCorrect: false, why: "A time change from your coach asks for nothing and promises nothing; that's a normal message." },
        { text: "Library book ready", isCorrect: false, why: "The library is just telling you something; there's no prize and no rush." },
      ],
      praise: "Spotted in seconds! ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[excited] Spotted in seconds!",
          "A free tablet with only ten left is bait: a giant prize AND a hurry, from a stranger.",
          "Practice times and library books ask for nothing, so they're real.",
          "[warmly] Too good to be true means not true. Sharp eyes!",
        ],
      },
    },

    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "If it sounds too good to be true, it isn't true. Giant prizes from strangers are bait, and when you're not sure, you check with a grown-up first.",
      next: "the trick that makes your heart race",
      emblem: "🎁",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers down! Your believe-o-meter is perfectly tuned.",
          "Giant prizes from strangers? No way. A little prize you really earned? Could be real. Not sure? Check first.",
          "[whispers] But the Raccoon's next trick doesn't offer you anything. It SCARES you, and it makes you hurry...",
          "Next, we'll learn the trick that makes your heart race. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · HURRY! / SCARY ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "The Hurry-Up Trick",
      content:
        "ONLY 10 MINUTES LEFT! Your account will be DELETED! Scams rush you and scare you ON PURPOSE, because a racing heart doesn't stop to think. Here's the secret: real companies never give you scary countdowns. Feeling rushed IS the red flag.",
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
          "[nervous] Urgent! Ten minutes left! Your account will be DELETED!",
          "[warmly] Feel your heart speed up? That is the trick working.",
          "Scams rush you and scare you on purpose, because a racing heart doesn't stop to think.",
          "[excited] So here is your superpower: feeling rushed IS the red flag.",
          "Real companies never give you scary countdowns. Ever.",
          "The loudest messages at the whole carnival are waiting at one booth. Let's go and inspect them, one clue at a time!",
        ],
      },
    },
    // 13 - Game: INSPECT "The Barker's Booth" (phishInspector, fully wired)
    {
      type: "phishInspector",
      threat: {
        raccoonLine:
          "Hurry, hurry, HURRY! Ten minutes left! When a heart is racing, nobody checks who's shouting. They just press the big red button!",
      },
      introTitle: "The Barker's Booth",
      introSubtitle: "Every message here is shouting. Open all four clues, then decide: trick, or real?",
      introIcon: "🔔",
      headerLabel: "🎪 The Barker's Booth",
      zoneLabels: {
        sender: "Who sent it?",
        link: "What's the button?",
        urgency: "What's the clock saying?",
        claim: "What's the promise?",
      },
      zoneQuestions: {
        sender: "Tap to check who's shouting",
        link: "Tap to see what it wants pressed",
        urgency: "Tap to check for a countdown",
        claim: "Tap to check the promise",
      },
      zapLabel: "TRICK! Zap it",
      safeLabel: "REAL. Keep it",
      zapToast: "TRICK ZAPPED!",
      safeToast: "REAL, KEPT!",
      wrongTitle: "Check the four clues again",
      completeTitle: "Every message inspected!",
      completeLine: "No countdown rushed you.",
      emails: [
        {
          id: "acct-panic",
          sender: "Account Security",
          subject: "URGENT: your game account will be DELETED in 10 MINUTES!",
          body: "We found a problem! Press FIX IT NOW within 10 minutes or lose EVERYTHING you own, forever!",
          isPhishing: true,
          readAloud: "From Account Security. Urgent: your game account will be deleted in ten minutes! We found a problem. Press fix it now within ten minutes, or lose everything you own, forever!",
          why: "A countdown, a threat, a panic button and a sender you can't check. Four red flags shouting at once is a trick, every time.",
          whyWrong: "Look at the clock clue and the promise clue. A ten minute countdown and lose everything forever are the hurry-up trick, not a real warning.",
          inspections: {
            senderNote: "Account Security? Real games talk to you INSIDE the game, not with a shouting message like this.",
            senderIsRedFlag: true,
            linkText: "FIX IT NOW button",
            linkNote: "One giant panic button begging for a press. We never press anything while we're checking.",
            linkIsRedFlag: true,
            urgencyNote: "Ten minutes! Real companies never give you a scary countdown. Ever.",
            urgencyIsRedFlag: true,
            claimNote: "Lose everything forever? Big scary threats are the fear trick at full volume.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "school-books",
          sender: "Mrs. Patel (Maple Hill School)",
          subject: "Library books due back Friday",
          body: "Just a reminder that class 4B's library books are due back this Friday. Thanks! Mrs. Patel",
          isPhishing: false,
          readAloud: "From Mrs. Patel at Maple Hill School. Library books due back Friday. Just a reminder that class four B's library books are due back this Friday. Thanks! Signed, Mrs. Patel.",
          why: "A teacher you know, a calm date, no button and no ask. Four calm clues means a real message you keep.",
          whyWrong: "Look again at the clock clue. Friday is a normal date, not a countdown, and Mrs. Patel is someone you can check with tomorrow.",
          inspections: {
            senderNote: "Your actual teacher, from the school's own address. That checks out.",
            senderIsRedFlag: false,
            linkText: "No button at all",
            linkNote: "Nothing to press. It just tells you something useful.",
            linkIsRedFlag: false,
            urgencyNote: "A calm reminder with a normal date. No countdown, no panic.",
            urgencyIsRedFlag: false,
            claimNote: "It promises nothing and asks for nothing. Real messages don't want anything back.",
            claimIsRedFlag: false,
          },
        },
        {
          id: "tablet-tonight",
          sender: "PrizeBot 3000",
          subject: "LAST CHANCE! Your FREE tablet expires TONIGHT!",
          body: "You were chosen! Claim your FREE tablet before MIDNIGHT or it goes to someone else. Hurry!!!",
          isPhishing: true,
          readAloud: "From PrizeBot three thousand. Last chance! Your free tablet expires tonight! You were chosen. Claim your free tablet before midnight or it goes to someone else. Hurry!",
          why: "Expires tonight, claim now, a stranger who chose you and a free tablet: the hurry and the bait in one message. A trick.",
          whyWrong: "Check the clock clue: expires tonight is a deadline built to rush you, and a free tablet from PrizeBot is bait on top.",
          inspections: {
            senderNote: "PrizeBot 3000? You've never heard of it, and it chose you out of nowhere.",
            senderIsRedFlag: true,
            linkText: "CLAIM NOW button",
            linkNote: "The whole message exists to make you press this. That press is the goal of the trick.",
            linkIsRedFlag: true,
            urgencyNote: "Expires tonight! A deadline to stop you thinking. The rush trick again.",
            urgencyIsRedFlag: true,
            claimNote: "A free tablet for doing nothing? Too good to be true means not true.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "dentist",
          sender: "Smile Dental",
          subject: "Reminder: Adam's check-up is Tuesday at 4pm",
          body: "Hi! A friendly reminder that Adam's check-up is on Tuesday at 4pm. See you then. Smile Dental",
          isPhishing: false,
          readAloud: "From Smile Dental. Reminder: Adam's check-up is Tuesday at four. Hi! A friendly reminder that Adam's check-up is on Tuesday at four. See you then. Smile Dental.",
          why: "A real dentist, a normal time, no button and nothing wanted. Calm clues all the way down means it's real.",
          whyWrong: "Look at the clock clue and the promise clue. Tuesday at four is a normal time, and nobody is threatening or promising anything.",
          inspections: {
            senderNote: "The dentist your family really goes to. A grown-up can check the appointment in one call.",
            senderIsRedFlag: false,
            linkText: "No button",
            linkNote: "Nothing to press, nothing to type. Just a date to remember.",
            linkIsRedFlag: false,
            urgencyNote: "A normal appointment time. No countdown, no threat, no hurry.",
            urgencyIsRedFlag: false,
            claimNote: "No prize, no warning, nothing wanted. That's how real reminders sound.",
            claimIsRedFlag: false,
          },
        },
      ],
      hints: {
        tier1: "Check how it makes you FEEL. Rushed or scared? The trick is working on you.",
        tier2: "Real messages are calm and want nothing. Countdowns, threats and panic buttons mean trick, every time.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, you step up to the Barker's Booth, where every message is SHOUTING.",
          "This game is all about the hurry-up trick: countdowns, threats and big panic buttons.",
          "Out in the real world, a scary message wants you to act before you think, and slowing down is what beats it.",
          "Here is what you do. A message opens.",
          "Tap its four clues one at a time... who sent it... the button... the clock... and the promise.",
          "I'll read what each clue shows.",
          "When all four are open, tap TRICK to zap it, or tap REAL to keep it.",
          "[warmly] Slow down, check the clues, and no countdown can rush you. Ready? Let's inspect!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap each of the four clues and listen to what it shows. When all four are open, tap Trick to zap it, or Real to keep it."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every message inspected, and not one countdown rushed you!",
          "[warmly] Out in the real world, when a message makes your heart race, you'll know that racing feeling is the red flag. Slow down, check the four clues, and the trick falls apart.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "you have 60 seconds to click, or your account is GONE FOREVER! Tick tock!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Real companies never give you a scary countdown; a ticking clock is the rush trick talking." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Real companies never THREATEN you with a countdown. ✓",
      nudge: "Who actually talks like that: a real company, or a trickster?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Busted! That was a fib.",
          "Real companies never give you a scary countdown, and nothing real disappears in sixty seconds.",
          "Tick tock is the rush trick talking, so you slow right down.",
          "[excited] Feeling rushed IS the red flag. Great catch!",
        ],
      },
    },

    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Scams rush and scare you on purpose. Feeling rushed IS the red flag, so you slow down and check.",
      next: "the sneakiest disguise: senders that look real but aren't",
      emblem: "🔔",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers down!",
          "Countdowns, threats, panic buttons... you inspected them all and never once got rushed.",
          "[whispers] But the Raccoon has a costume that fools almost everyone. He dresses up as someone you TRUST...",
          "Next, we'll learn the sneakiest disguise: senders that look real but aren't. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · THE LOOKALIKE SENDER ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "The Lookalike Sender",
      content:
        "The sneakiest scams pretend to be someone you TRUST: your game, your school, even family. But look closely and the disguise slips. A letter becomes a number, a 1 where the l should be, a 0 where the O should be. The address ends in something weird. Real senders you can check; lookalikes fall apart when you compare them piece by piece. Almost-right is all-wrong.",
      bullets: [
        "Scams dress up as people you trust",
        "Look close: a 1 for an l, a 0 for an O",
        "Check the address, not just the name",
        "A weird ending gives it away",
        "Almost-right is all-wrong",
      ],
      bulletIcons: ["🎭", "🔍", "✉️", "🚫", "✅"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Now for the sneakiest trick of all.",
          "A message that LOOKS like it's from your game, or your school, or even family.",
          "[warmly] But look closely. A letter becomes a number. A one where the L should be. A zero where the O should be.",
          "The address ends in something weird. Something is just... off.",
          "[excited] Almost-right is ALL-WRONG.",
          "You'll compare every sender with the real one, piece by piece. Let's go and catch some copycats!",
        ],
      },
    },
    // 17 - Game: MARK "The Name Tag Check" (nameTagCheck, new engine)
    {
      type: "nameTagCheck",
      threat: {
        raccoonLine:
          "One little swap! A one for an L, a zero for an O, and my costume is perfect. Who reads a name letter by letter? Nobody, that's who!",
      },
      introTitle: "The Name Tag Check",
      introSubtitle: "The real sender's tag is on top. Mark every piece underneath that doesn't match, then close the booth.",
      introIcon: "🔍",
      stampLabel: "SWAPPED!",
      closeLabel: "CLOSE THE BOOTH",
      realSeal: "REAL SENDER",
      fakeSeal: "COPYCAT!",
      realToast: "BOOTH CLOSED: REAL SENDER!",
      fakeToast: "BOOTH CLOSED: COPYCAT!",
      wrongTitle: "Compare the pieces again!",
      completeTitle: "Every tag checked!",
      completeLine: "Copycats caught, real senders welcomed.",
      cases: [
        {
          id: "mega",
          realChunks: ["Mega Blasters", "help@megablasters", ".com"],
          chunks: [
            { text: "Mega B1asters", isWrong: true, teach: "Look at the name. There's a number one where the letter L should be. A swapped letter means a copycat." },
            { text: "prize@mega-blasterz", isWrong: true, teach: "Look at the address. It is not the real address above it: a different word, and a Z on the end. Different means swapped." },
            { text: ".win", isWrong: true, teach: "Look at the ending. The real one ends dot com. Dot win is a weird ending, so it's swapped." },
          ],
          readAloud: "A message says it's from Mega Blasters, your game. Compare its name, its address and its ending with the real tag above, piece by piece.",
          rightWhy: "Every piece was swapped: a one for an L, a different address, and a weird dot win ending. Almost-right is all-wrong. Copycat caught!",
        },
        {
          id: "school",
          realChunks: ["Maple Hill School", "office@maplehill", ".edu"],
          chunks: [
            { text: "Maple Hill School", isWrong: false, teach: "Look at the name again. Maple Hill School matches the tag above it exactly, so lift that mark." },
            { text: "office@maplehill", isWrong: false, teach: "The address matches the real one letter for letter. Lift that mark." },
            { text: ".edu", isWrong: false, teach: "Dot edu is the school's real ending, the same as above. Lift that mark." },
          ],
          readAloud: "A message says it's from Maple Hill School. Compare its name, its address and its ending with the real tag above, piece by piece.",
          rightWhy: "Every piece matched the real tag, letter for letter. No swaps means the real school. Some senders are exactly who they say!",
        },
        {
          id: "petpals",
          realChunks: ["PetPals Club", "hello@petpals", ".com"],
          chunks: [
            { text: "PetPals Club", isWrong: false, teach: "The name matches the real one exactly. Lift that mark." },
            { text: "hello@petpa1s", isWrong: true, teach: "Look closely at the address. There's a number one where the letter L should be in pals. One tiny swap makes a copycat." },
            { text: ".com", isWrong: false, teach: "Dot com matches the real ending. Lift that mark." },
          ],
          readAloud: "A message says it's from PetPals Club. Compare its name, its address and its ending with the real tag above, piece by piece. Look very closely.",
          rightWhy: "Just one tiny swap, a one hiding where the L should be, and that's enough. One swapped piece makes the whole sender a copycat.",
        },
        {
          id: "roblox",
          realChunks: ["Roblox", "no-reply@roblox", ".com"],
          chunks: [
            { text: "R0BLOX Rewards", isWrong: true, teach: "Look at the name. A zero where the O should be, and an extra word. That is not the real name above it." },
            { text: "gift@roblox-rewards", isWrong: true, teach: "Look at the address. Gift at roblox rewards is not the real address above it. Different means swapped." },
            { text: ".club", isWrong: true, teach: "Look at the ending. The real one ends dot com. Dot club is a weird ending, so it's swapped." },
          ],
          readAloud: "A message says a gift is waiting from Roblox. Compare its name, its address and its ending with the real tag above, piece by piece.",
          rightWhy: "A zero for an O, an extra word, a different address and a dot club ending. Every piece swapped. That gift was the Raccoon's costume!",
        },
      ],
      hints: {
        tier1: "Compare one piece at a time: the name, the address, the ending. Same as above? Leave it. Different? Mark it.",
        tier2: "Sarah named a piece. Find it. Swapped means mark it. Matching means lift the mark.",
        tier3: "Let me help. I fixed that one piece for you. Now close the booth.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, you run the Name Tag Check!",
          "This game is all about lookalike senders, and the tiny swaps that give them away.",
          "Out in the real world, a copycat picks a name that is ALMOST right, hoping you never look closely.",
          "Here is what you do. The real sender's name tag is on top.",
          "The sender to check hangs underneath, split into the same pieces.",
          "Compare each piece with the one above it.",
          "If a piece doesn't match, tap it to mark it SWAPPED. Tap it again to lift the mark.",
          "Then tap CLOSE THE BOOTH.",
          "[warmly] Sometimes the sender is the real one, so no marks is a real answer too. Ready? Let's compare!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Compare each piece on the bottom tag with the piece above it. Tap a piece that doesn't match to mark it. Nothing swapped? Mark nothing. Then close the booth."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every tag checked! You read names letter by letter, so the Raccoon's copycats can't fool you.",
          "[warmly] Out in the real world, a one where an L should be, or a strange ending, will jump out at you. Almost-right is all-wrong, and you'll know it.",
        ],
      },
    },
    // 18 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which sender is the COPYCAT?",
      choices: [
        { text: "Mega B1asters, prize@mega-blasterz.win", isCorrect: true },
        { text: "Grandma, saved in the family phone", isCorrect: false, why: "A saved family contact is as real as it gets; nothing is swapped." },
        { text: "Maple Hill School, office@maplehill.edu", isCorrect: false, why: "The school's own address, spelled exactly right, checks out." },
        { text: "Mega Blasters, inside the game", isCorrect: false, why: "Inside the game is the real channel your game uses to talk to you." },
      ],
      praise: "That sneaky '1' didn't fool you! ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[excited] That sneaky one didn't fool you!",
          "A number one where the L should be, and a weird dot win ending. Almost-right is all-wrong.",
          "Grandma, your school, and a message from inside your own game are all senders you can check.",
          "[warmly] Letter by letter, every time. Brilliant!",
        ],
      },
    },

    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Lookalike senders swap a letter or use a weird address. Almost-right is all-wrong, so you check the name piece by piece.",
      next: "the golden move that beats every scam at once",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! Nothing gets past you.",
          "Ones for L's, zeros for O's, strange endings... you read every disguise like a book.",
          "[warmly] Now, what if a tricky message lands and you're just not sure? There's one move that works on EVERY scam ever made...",
          "Next, we'll learn the golden move that beats every scam at once. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · DON'T BITE: STOP, CHECK, SHOW ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Don't Bite: Stop, Check, Show",
      content:
        "Here's the move that beats every scam ever made: DON'T BITE. Step 1: STOP. Don't tap, don't reply, don't rush. Step 2: CHECK. Read it slowly. Who sent it? What does it want? Step 3: SHOW a grown-up. Every time. A scam only works if you bite, so don't!",
      bullets: [
        "Step 1: STOP. No tapping, no rushing",
        "Step 2: CHECK. Read it slowly",
        "Step 3: SHOW a grown-up",
        "A scam only works if you bite",
        "Not biting beats every trick ever made",
      ],
      bulletIcons: ["✋", "🔍", "👪", "🪤", "🏆"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] The last power is the golden one, because it beats every scam ever made.",
          "Step one: STOP. Don't tap, don't reply, don't rush.",
          "Step two: CHECK. Read it slowly. Who sent it? What does it want?",
          "[whispers] Step three: SHOW a grown-up. Every single time.",
          "[excited] A scam only works if you bite. So... don't bite!",
          "Every safe habit is a brick. Let's go and lay them, one at a time!",
        ],
      },
    },
    // 21 - Game: BUILD "The No-Bite Wall" (firewallBuilder, rebuilt from the orphaned canvas game)
    {
      type: "firewallBuilder",
      threat: {
        raccoonLine:
          "Stop? Check? SHOW a grown-up? Pah! Nobody has time for that. One little press, that's all I need, and my whole carnival is paid for!",
      },
      introTitle: "The No-Bite Wall",
      introSubtitle: "Lay every safe habit into the wall. Throw the bad ones in the bin.",
      introIcon: "🧱",
      wallLabel: "THE NO-BITE WALL",
      binLabel: "THROW IT OUT",
      layToast: "BRICK LAID!",
      binToast: "BINNED!",
      completeTitle: "The wall is built!",
      completeLine: "Nothing bites through a wall like that.",
      bricks: [
        { id: "stop", text: "STOP before you tap", good: true, readAloud: "Stop before you tap.", why: "Stopping before you tap is step one. A scam can't work while your finger is still.", whyWrong: "Stopping before you tap is step one of the no-bite rule. That brick belongs in the wall, not the bin." },
        { id: "check-who", text: "CHECK who sent it", good: true, readAloud: "Check who sent it.", why: "Checking who sent it is step two. Copycats fall apart when you look.", whyWrong: "Checking who sent it is a safe habit from step two. Lay it in the wall." },
        { id: "check-what", text: "CHECK what it wants", good: true, readAloud: "Check what it wants.", why: "Checking what a message wants shows you the string. That's a safe habit.", whyWrong: "Checking what it wants is how you spot a scam. That brick belongs in the wall." },
        { id: "show", text: "SHOW a grown-up", good: true, readAloud: "Show a grown-up.", why: "Showing a grown-up is step three, and it beats every trick you're not sure about.", whyWrong: "Showing a grown-up is step three of the no-bite rule. It belongs in the wall." },
        { id: "slowly", text: "Read it slowly", good: true, readAloud: "Read it slowly.", why: "Reading slowly is how you catch a swapped letter or a scary countdown. Safe habit.", whyWrong: "Reading slowly is a safe habit. A racing heart doesn't stop to think, but a slow reader does. Lay it in the wall." },
        { id: "rushing", text: "Ask: is it rushing me?", good: true, readAloud: "Ask: is it rushing me?", why: "Asking if a message is rushing you catches the hurry-up trick. That's a safe habit.", whyWrong: "Asking if it's rushing you is how you catch the hurry-up trick. It belongs in the wall." },
        { id: "tap-fast", text: "Tap fast before it's gone!", good: false, readAloud: "Tap fast before it's gone!", why: "Tapping fast is exactly what a scam wants. Into the bin!", whyWrong: "Tapping fast is biting. That's the Raccoon's brick, not yours. It goes in the bin." },
        { id: "type-password", text: "Type your password to check", good: false, readAloud: "Type your password to check.", why: "Typing your password into a message is handing the Raccoon your key. Bin it.", whyWrong: "Typing your password into a message is never a check, it's a bite. That brick goes in the bin." },
        { id: "card-number", text: "Reply with a card number", good: false, readAloud: "Reply with a card number.", why: "Card numbers never go into surprise messages. Straight into the bin.", whyWrong: "Sending a card number to a stranger is giving money away. That's a bad habit, so it goes in the bin." },
      ],
      hints: {
        tier1: "Ask: is this a hero habit, or the Raccoon's? Stop, check and show go in the wall. Tapping fast and typing secrets go in the bin.",
        tier2: "Wall bricks keep you safe: stop, check, show, read slowly, ask if it's rushing you. Bin bricks are bites: tap fast, type a password, send a card number.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, you build the No-Bite Wall!",
          "This game is all about the three steps that beat every scam: stop, check, show.",
          "Out in the real world, a scam only works if you bite, so every safe habit you keep is another brick between you and the Raccoon.",
          "Here is what you do. A brick arrives in the tray and I'll read it.",
          "If it's a safe habit, tap a column of the wall to lay it in.",
          "If it's a bad habit, tap the bin to throw it out.",
          "[warmly] Lay every safe brick and nothing bites through. Ready? Let's build!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Listen to the brick. A safe habit? Tap a column to lay it in the wall. A bad habit? Tap the bin."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] The wall is built! Stop, check, show, and every safe habit is a brick the Raccoon can't get through.",
          "[warmly] Out in the real world, when a tricky message lands, you'll stop, you'll check, and you'll show a grown-up. No bite, no trick. That's the golden move.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A tricky message lands. Tap the hero steps IN ORDER:",
      choices: [
        { text: "STOP, don't tap", isCorrect: true },
        { text: "CHECK it slowly", isCorrect: true },
        { text: "SHOW a grown-up", isCorrect: true },
      ],
      praise: "Stop. Check. Show. Trick-proof! ✓",
      nudge: "What's the very FIRST thing, before any checking?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[excited] Stop. Check. Show. That's the order, every time.",
          "First you stop, so the trick can't get in. Then you check who sent it and what it wants. Then you show a grown-up.",
          "A scam only works if you bite.",
          "[warmly] Three steps, and the Raccoon's whole carnival goes quiet. Brilliant!",
        ],
      },
    },

    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Stop, check, show a grown-up. A scam only works if you bite, so you don't bite.",
      next: "one final drill in the Hall of Mirrors",
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE trick-beating powers, Cyber Hero!",
          "You follow the strings, you measure the bait, you never rush, you catch every copycat...",
          "[whispers] and you never, ever bite.",
          "[warmly] Now, the Raccoon has one last attraction: a hall of mirrors, with a fake hiding in every one.",
          "One quick final drill to make it all stick, then the Raccoon gets what's coming. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "The Hall of Mirrors" (passwordVault, skin "mirrors").
    // Engine-reuse policy: W15 owns cyberScanner, W1 signBingo, W2 spamBlaster,
    // W3 teamPoster, so W4's mixed review gets the unused cinematic SCENE engine:
    // five mirrors around the hall, one question per power, choices shuffled.
    {
      type: "passwordVault",
      skin: "mirrors",
      threat: {
        raccoonLine:
          "Welcome to my Hall of Mirrors! Five mirrors, five fakes, and every one of them looks REAL. Get one wrong and I keep your prize!",
      },
      introTitle: "The Hall of Mirrors",
      introSubtitle: "Five mirrors, one fake in each. Answer the mirror's question to clear it.",
      introIcon: "🔮",
      masterTitle: "HALL CLEARED!",
      claimLabel: "Walk out of the hall",
      hotspotNoun: "mirror",
      guidance: {
        intro: "Tap a glowing mirror to begin.",
        complete: "HALL CLEARED! Every fake shown up.",
      },
      locks: [
        {
          id: "want",
          ruleLabel: "THE WANT",
          icon: "🪤",
          prompt: "A quiet message says: 'Game bag full! Type your password to make space.' What gives it away as a scam?",
          readAloud: "A quiet message says: game bag full, type your password to make space. What gives it away as a scam?",
          choices: [
            { text: "It wants something back: your password", isCorrect: true, explanation: "That's the giveaway.", why: "Quiet or loud, a scam always wants something back. This one wants your password, and that is the giveaway." },
            { text: "It's too short to be a scam", isCorrect: false, explanation: "Scams can be short and quiet. Look at what it WANTS, not how loud it is." },
            { text: "Game bags really do get full", isCorrect: false, explanation: "Even if a bag was full, no real game asks you to type your password into a message to fix it." },
          ],
          recap: "Follow the string",
        },
        {
          id: "bait",
          ruleLabel: "THE BAIT",
          icon: "🎁",
          prompt: "'You WON a family trip to the beach!' from LuckyMail. You never entered anything. Where does the needle go?",
          readAloud: "You won a family trip to the beach, says LuckyMail. You never entered anything. Where does the needle go?",
          choices: [
            { text: "No way. You can't win what you never entered", isCorrect: true, explanation: "Straight to no way.", why: "A giant prize from a stranger, for a contest you never entered, is bait. The needle goes straight to no way." },
            { text: "Could be real, beaches are real", isCorrect: false, explanation: "Beaches are real, but the prize isn't. Nobody hands a stranger a free holiday for a contest they never entered." },
            { text: "Hmm, maybe tap to see", isCorrect: false, explanation: "One tap to see is the bite the trick is waiting for. An enormous prize from a stranger needs no checking: it's no way." },
          ],
          recap: "Too good = not true",
        },
        {
          id: "hurry",
          ruleLabel: "THE HURRY",
          icon: "🔔",
          prompt: "A pop-up shouts: 'ONLY 2 MINUTES LEFT to keep your photos!' What do real companies do?",
          readAloud: "A pop-up shouts: only two minutes left to keep your photos! What do real companies do?",
          choices: [
            { text: "Never give you a scary countdown", isCorrect: true, explanation: "Never.", why: "Real companies never give you a scary countdown. Two minutes left is the hurry-up trick, and feeling rushed is the red flag." },
            { text: "Count down too, it's helpful", isCorrect: false, explanation: "A countdown that scares you is never helpful. It exists to stop you thinking." },
            { text: "Delete your photos if you're slow", isCorrect: false, explanation: "Nothing real disappears because you took a minute. The threat is the trick." },
          ],
          recap: "Rushed = red flag",
        },
        {
          id: "copycat",
          ruleLabel: "THE COPYCAT",
          icon: "🎭",
          prompt: "Two messages say they're from PetPals. One is hello@petpals.com. The other is gift@petpa1s.win. Which is the copycat?",
          readAloud: "Two messages say they're from PetPals. Look closely at the two addresses in the mirror. Which one is the copycat?",
          choices: [
            { text: "gift@petpa1s.win, a 1 where the l should be", isCorrect: true, explanation: "Copycat.", why: "A one hiding where the L should be, and a weird dot win ending. Almost-right is all-wrong, so that's the copycat." },
            { text: "hello@petpals.com, it's too plain", isCorrect: false, explanation: "Plain is good. The real address is spelled exactly right, with a normal ending." },
            { text: "Neither, they're both PetPals", isCorrect: false, explanation: "Read the letters one by one. One address has a number one where the L should be. That's a swap, and a swap means a copycat." },
          ],
          recap: "Almost-right = all-wrong",
        },
        {
          id: "nobite",
          ruleLabel: "NO BITE",
          icon: "✋",
          prompt: "A scary message sits on the screen and your finger hovers over its big red button. What's the no-bite rule?",
          readAloud: "A scary message sits on the screen, and your finger hovers over its big red button. What's the no-bite rule?",
          choices: [
            { text: "Stop, check, show a grown-up", isCorrect: true, explanation: "Stop. Check. Show.", why: "Stop, so nothing gets in. Check who sent it and what it wants. Show a grown-up. A scam only works if you bite." },
            { text: "Tap it once, then decide", isCorrect: false, explanation: "One tap is a bite, and a bite is all the trick needs. Stop comes first, before anything." },
            { text: "Delete it fast and forget it", isCorrect: false, explanation: "Deleting skips the checking and the showing. A grown-up can't help with a message they never see." },
          ],
          recap: "Stop, check, show",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill, Cyber Hero! Every trick you beat this week is hiding in the Hall of Mirrors.",
          "This drill mixes up all five powers you learned about scams.",
          "Out in the real world, tricks don't come one at a time, so a hero keeps every power ready at once.",
          "Here is what you do. Tap a glowing mirror and it asks you a question. I'll read it.",
          "Tap the answer you believe.",
          "Get it right and the mirror clears. Clear all five, and the hall is yours.",
          "[warmly] Five mirrors, five powers. Ready? Let's clear the hall!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a glowing mirror to hear its question, then tap the answer you believe."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Hall cleared! Every mirror showed a fake, and you saw straight through all five.",
          "[warmly] You follow the strings, you measure the bait, you never rush, you catch the copycats and you never bite. The Raccoon's carnival is closed for good. Time for the final test!",
        ],
      },
    },

    // 25 - BOSS BATTLE: the carnival showdown (QuizBoss, 5 Q / pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: every scam returns to sender
    { type: "video", videoPlaceholder: "Week 4: Return to Sender", videoSrc: "/videos/module-04-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "want", label: "String Follower", accent: "#ffb347", icon: "🪤", summary: "A scam is a trick in a costume. It wants your password, your money or your tap, and you follow the string first." },
        { id: "bait", label: "Bait Detector", accent: "#ffd158", icon: "🎁", summary: "Too good to be true means not true. Giant prizes from strangers are bait; not sure means check first." },
        { id: "hurry", label: "Panic-Proof", accent: "#ff5fb3", icon: "🔔", summary: "Countdowns and threats are the rush trick. Feeling rushed IS the red flag." },
        { id: "copycat", label: "Copycat Catcher", accent: "#c084fc", icon: "🎭", summary: "Lookalike senders swap a letter or hide behind a weird address. Almost-right is all-wrong." },
        { id: "nobite", label: "The No-Bite Rule", accent: "#7eff97", icon: "✋", summary: "Stop. Check. Show a grown-up. A scam only works if you bite." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You follow every string, no giant prize can dazzle you, no countdown can rush you,",
          "no copycat can fool you...",
          "[laughs] and you never, ever bite!",
          "[excited] Every scam went straight back to sender. Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "bait-dodger", name: "Bait Dodger", icon: "🎁", description: "No prize can fool this hero." },
        { id: "panic-proof", name: "Panic-Proof", icon: "🔔", description: "Countdowns bounce right off." },
        { id: "copycat-catcher", name: "Copycat Catcher", icon: "🎭", description: "Reads every name letter by letter." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE QUIZ BOSS (week-ending test) ────────────────
     Learn-Loop standard: 5 apply-the-skill questions (one per concept, in
     concept order), passMark 4 (owner decision, UAT batch 2). Options are
     shuffled at runtime with the seeded order the narration generator shares;
     a code-like option (an address) is never read aloud. Every villain line
     is DISTINCT across the 20 weeks; the quiz-boss villain voice is OFF by
     owner decision (2026-09-03), so Callum's lines are on-screen text. */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#e84dff",
    theme: {
      topic: "Scams & Tricks",
      motifs: ["🎁", "🪤", "💎", "❓", "🔍", "🚫", "💬", "⚡"],
    },
    intro: {
      slug: "quiz-w4-intro",
      text: "Ding ding ding! YOU are my one millionth quiz-taker! Your prize is a quiz stuffed with my finest tricks. No refunds, no escaping!",
    },
    victory: {
      slug: "quiz-w4-victory",
      text: "Not a single bite?! Not even a nibble?! My hooks are bent, my glitter budget is blown, and my countdown clock just quit on the spot!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w4-c1",
        key: "quiz-w4-c1-1",
        label: "String Follower",
        ask: {
          slug: "quiz-w4-ask-c1-1",
          text: "Three quiet little messages land on Adam's tablet. A scam always wants something back. Which one is the scam?",
        },
        options: [
          { text: "Game bag full! Type your password to make space" },
          { text: "Library: your dragon book is ready for pickup" },
          { text: "Coach: practice moved to four o'clock today" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Scams always WANT something!",
          explanation: "The library and the coach just tell Adam things and ask for nothing. The bag message wants his password, and wanting something back is how you smell a scam, however quiet it sounds.",
        },
        villainRight: {
          slug: "quiz-w4-right-c1-1",
          text: "OW! You spotted the WANT! I worked so hard to make that message sound bored!",
        },
        villainWrong: {
          slug: "quiz-w4-wrong-c1-1",
          text: "Password accepted! Your game bag has loads of space now, because it's MY game bag!",
        },
      },
      {
        phaseId: "phase-w4-c2",
        key: "quiz-w4-c2-1",
        label: "Bait Detector",
        ask: {
          slug: "quiz-w4-ask-c2-1",
          text: "Three 'you won!' messages arrive on the same day. Which win could actually be REAL?",
        },
        options: [
          { text: "Coach Lee: You won player of the match!" },
          { text: "PrizeZone: You won a brand-new game console!" },
          { text: "LuckyMail: You won a family trip to the beach!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real wins come from real tries!",
          explanation: "Adam really played in that match, and Coach Lee is someone he knows and can check. Winning a contest you never entered, from a name you've never heard of, is bait wearing a bow.",
        },
        villainRight: {
          slug: "quiz-w4-right-c2-1",
          text: "You kept the one prize you actually EARNED?! Who taught you that?!",
        },
        villainWrong: {
          slug: "quiz-w4-wrong-c2-1",
          text: "A console AND a beach trip! Enjoy them both! They're imaginary, but enjoy them!",
        },
      },
      {
        phaseId: "phase-w4-c3",
        key: "quiz-w4-c3-1",
        label: "Panic-Proof",
        ask: {
          slug: "quiz-w4-ask-c3-1",
          text: "A message tells Layla: 'Your account breaks in 5 minutes! Fix it NOW!' Her heart starts racing. What is her racing heart telling her?",
        },
        options: [
          { text: "The rush trick is working, slow down" },
          { text: "Something really is wrong, so hurry" },
          { text: "Fix it first and think about it after" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Feeling rushed IS the red flag!",
          explanation: "Scams squeeze your heart on purpose, because a racing heart doesn't stop to think. The rushed feeling is the alarm itself: breathe, slow right down, and show a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w4-right-c3-1",
          text: "You slowed DOWN?! That message was built entirely for speed!",
        },
        villainWrong: {
          slug: "quiz-w4-wrong-c3-1",
          text: "Hurry hurry, fix fix fix! Thinking is for people with spare minutes, and you have NONE!",
        },
      },
      {
        phaseId: "phase-w4-c4",
        key: "quiz-w4-c4-1",
        label: "Copycat Catcher",
        ask: {
          slug: "quiz-w4-ask-c4-1",
          text: "Layla lines up four senders from her inbox. Which one is wearing a costume?",
        },
        options: [
          { text: "Petpa1s Club, gift@petpa1s.fun" },
          { text: "PetPals, message center inside the app" },
          { text: "Grandpa, saved in the family phone" },
          { text: "Maple Hill School, office@maplehill.edu" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Read it letter by letter!",
          explanation: "Real senders can be checked: inside the app, a saved contact, the school's own address. The imposter hid a number one where the L should be and picked a weird address ending. Almost-right is all-wrong!",
        },
        villainRight: {
          slug: "quiz-w4-right-c4-1",
          text: "You found the costume?! I hid that number one right where the L should be, my best hiding spot ever!",
        },
        villainWrong: {
          slug: "quiz-w4-wrong-c4-1",
          text: "Welcome to Petpa1s Club! Membership costs everything you type, hee hee!",
        },
      },
      {
        phaseId: "phase-w4-c5",
        key: "quiz-w4-c5-1",
        label: "The No-Bite Rule",
        ask: {
          slug: "quiz-w4-ask-c5-1",
          text: "A scary message is sitting on Adam's screen, and his finger is hovering over its big red button. What's step one of the no-bite rule?",
        },
        options: [
          { text: "STOP, no clicking while he checks" },
          { text: "Press it once, just to see what happens" },
          { text: "Delete it fast without reading anything" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Stop comes first!",
          explanation: "One press is a bite, and deleting skips the checking and the showing. Step one is STOP: no clicking, no replying, no rushing. Then check it slowly and show a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w4-right-c5-1",
          text: "You just... STOPPED?! My big red button has never felt so unclicked!",
        },
        villainWrong: {
          slug: "quiz-w4-wrong-c5-1",
          text: "One little press! Buttons love being pressed, it's their whole entire job!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-04-trick-catcher.png",

  // Week-lane attack theatre: scam-message tricks only (no fake-people
  // vocabulary, that's W3's lane; no link/QR mechanics, W16).
  bossAttacks: [
    { name: "FAKE PRIZE",      icon: "🎁", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Too good = not true",       emblemColor: 0xffd158 },
    { name: "COUNTDOWN SCARE", icon: "🔔", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Real companies don't rush", emblemColor: 0xff5fb3 },
    { name: "LOOKALIKE",       icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Almost-right is all-wrong", emblemColor: 0xc084fc },
  ],

  // Legacy quiz-boss question bank (required by the WeekContent shape; the
  // bossQuiz above is what the child plays).
  bossQuestions: {
    easy: [
      { question: "What does a scam always WANT?", answers: ["Your password, money or tap", "To be your friend", "Nothing at all", "To give you a real prize"], correctIndex: 0, explanation: "Scams always want something back. That's how you spot them." },
      { question: "'FREE tablet, you WON!' But you never entered anything. That's...", answers: ["Bait, too good to be true", "Your lucky day", "A nice surprise", "Worth one little tap"], correctIndex: 0, explanation: "You can't win a draw you never entered. Amazing prizes are bait." },
      { question: "A message gives you a scary 10-minute countdown. Real companies...", answers: ["NEVER do that, it's the rush trick", "Do it all the time", "Only do it for big problems", "Do it to be helpful"], correctIndex: 0, explanation: "Countdowns exist to stop you thinking. Feeling rushed IS the red flag." },
    ],
    medium: [
      { question: "Which sender is the copycat?", answers: ["R0BLOX Rewards, gift@roblox-rewards.club", "Roblox, inside the app", "Grandma, saved contact", "School Office, school address"], correctIndex: 0, explanation: "A zero for an O and a weird address. Almost-right is all-wrong." },
      { question: "A pop-up screams 'You have 5 VIRUSES! Call NOW!' What is it?", answers: ["The trick itself: close it and show a grown-up", "A helpful warning", "A real virus checker", "A reason to call the number fast"], correctIndex: 0, explanation: "Scary pop-ups are ads in monster costumes. The panic IS the trick." },
      { question: "What are the three no-bite steps?", answers: ["Stop, check, show a grown-up", "Click, read, delete", "Run, hide, wait", "Reply, ask, click"], correctIndex: 0, explanation: "Stop. Check. Show. A scam only works if you bite." },
    ],
    hard: [
      { question: "Why do scams RUSH you on purpose?", answers: ["A racing heart doesn't stop to think", "They're in a hurry", "Their offers really expire", "They're just excited"], correctIndex: 0, explanation: "The rush is built in on purpose. Slow down and the whole trick falls apart." },
      { question: "'Your parcel is stuck, pay $1 to release it.' What's really going on?", answers: ["A trick to grab the card number", "A real delivery problem", "A bargain", "A shipping discount"], correctIndex: 0, explanation: "The $1 isn't the prize, the card number is. Cards never go into surprise messages." },
      { question: "What beats EVERY scam ever made?", answers: ["Not biting: stop, check, show", "Tapping really fast", "A strong password", "Turning the screen off"], correctIndex: 0, explanation: "Every trick needs a bite to work. No bite, no trick." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above:
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 4: real or fake?" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "10,000 V-Bucks... and someone bit!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // weekIntro
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "A trick... in a costume." }, layla: null }, // learn: want
    5: { adam: { mood: "excited", message: "Follow every string!" }, layla: null }, // game: stringsAttached
    6: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "If it's TOO amazing... it's bait." } }, // learn: bait
    9: { adam: { mood: "excited", message: "Turn that needle, Cyber Hero!" }, layla: null }, // game: believeOMeter
    10: { adam: null, layla: { mood: "excited", message: "Quick, spot the bait!" } }, // prove: speed
    11: { adam: { mood: "thumbsup", message: "Believe-o-meter: tuned!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Feeling rushed IS the red flag." }, layla: null }, // learn: hurry
    13: { adam: { mood: "curious", message: "Open all four clues first." }, layla: null }, // game: phishInspector
    14: { adam: null, layla: { mood: "worried", message: "He's fibbing. Catch him!" } }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "Panic-proof: certified!" } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Almost-right is all-wrong." } }, // learn: copycat
    17: { adam: { mood: "excited", message: "Compare every piece!" }, layla: null }, // game: nameTagCheck
    18: { adam: null, layla: { mood: "excited", message: "Which one's the copycat?" } }, // prove: recall
    19: { adam: { mood: "thumbsup", message: "No disguise gets past you." }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Stop. Check. Show. Every time." }, layla: null }, // learn: nobite
    21: { adam: { mood: "curious", message: "Build the wall, brick by brick." }, layla: null }, // game: firewallBuilder
    22: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers, one drill to go!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Clear every mirror!" } }, // consolidation
    25: { adam: { mood: "worried", message: "The carnival showdown. Don't bite!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Return to sender, all of them!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Trick Catcher badge earned!" }, layla: null }, // completion
  },
};

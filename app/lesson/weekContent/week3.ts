import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 3 - Stranger Danger: Friend or Foe?
 *
 * Built to the LEARN-LOOP gold standard (Build Standard v0.3, distilled from
 * Weeks 15, 1 and 2). Spine (30 screens):
 *
 *   video -> alert (Sarah hook) -> weekIntro (ATLAS) -> mission -> 5 concepts,
 *   each = Learn (info, numbered, opens on the POWER N OF 5 sweep) -> Game
 *   (folded-in Spot-the-Danger `threat` + 5-beat intro + Sarah's on-board
 *   how-to + in-game read-alouds + completeNarration payoff) -> Prove
 *   (quickCheck + teachNarration) -> recap (praise, restate, cliffhanger AND
 *   the lesson bridge in one breath):
 *     1 MASKS    you can't see who's typing     | plaquePeek "The Mask Peek" (skin: mask)     | lie
 *     2 STAMP    spotting a fake profile        | clueStamper "The Clue Stamper"            | speed
 *     3 FLAGS    red-flag requests              | popupPanic "Red-Flag Requests" (skin: request) | recall
 *     4 NEVERS   never meet, never send         | cyberMaze "The Meet-Up Maze"              | finish
 *     5 TELL     uh-oh feeling -> stop -> tell  | chatSimulator "The Uh-Oh Chat"            | order
 *   -> consolidation "The Case Board" (teamPoster, skin: case) -> bossBattle
 *      (QuizBoss, 5 Q / passMark 4) -> closing video -> debrief -> stickers ->
 *      completion.
 *
 * "The Mask Waltz" signature was CUT (teach-before-test, owner 2026-09-11):
 * its "watch who you're really talking to" idea lives on in the Mask Peek.
 *
 * ENGINE REUSE POLICY (owner, caps: "WE NEVER COPY AN EXERCISE"): a rebuilt week
 * never uses an engine already used by a previously rebuilt week (W15, W1, W2)
 * nor a neighbour week (W2, W4). W3 = plaquePeek / clueStamper / popupPanic
 * / cyberMaze / chatSimulator / teamPoster: zero overlap, every reuse a genuine
 * re-theme (skin + copy). `node scripts/audit-engine-reuse.mjs --week=3`.
 *
 * Lane-clean: dangerous PEOPLE only. No fake senders or scam messages (W4), no
 * report/block protocol beyond "tell a trusted grown-up" (W11), no game-lobby
 * specifics (W6), no photo-sharing rules beyond "never send a photo of you" (W8).
 *
 * Dialogue: both layers audited to 0 flags with
 * `node scripts/audit-narration-flow.mjs --week=3` (screen seams + the beat
 * chains inside every game). Sarah reads every in-game beat; the Raccoon's
 * boasts are on-screen text in his bubble.
 */
export const WEEK_3: WeekContent = {
  weekNumber: 3,
  title: "Stranger Danger: Friend or Foe?",
  topic: "stranger-danger",
  badgeName: "Mask Spotter",
  badgeIcon: "🎭",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 3: FRIEND OR FOE?", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the fake-kid profile trap
    { type: "video", videoPlaceholder: "Week 3: The Fake Friend", videoSrc: "/videos/module-03-intro.mp4" },

    // 1 - ALERT: incident report (Sarah's hook)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-03.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon built a FAKE kid profile, with a copied photo, a typed age and a made-up name, and tricked a hero into telling him secrets. He's sending friend requests right now!",
      photoCaption: "Wk 3 - The Fake Friend",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Oh no, Cyber Hero, look at this! The Raccoon built a FAKE kid profile.",
          "A copied photo, a typed age, a made-up name... and a hero believed every word.",
          "[whispers] Right now, he's sending friend requests to more kids.",
          "[warmly] But YOU are about to see straight through every disguise he owns.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[3] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn why you can't see who's really typing",
        "Spot fake profiles and red-flag requests",
        "Hold the two never-rules, and trust your uh-oh feeling",
      ],
    },

    /* ─────────── BEAT 1 · MASKS: WHO'S REALLY TYPING? ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Who's Really Typing?",
      content:
        "Online, you can't SEE who's typing. A photo can be copied. An age can be typed. A name can be made up. Most people are exactly who they say, but a trickster can wear a kid disguise, and you can't tell just by looking.",
      bullets: [
        "You can't see who's really typing",
        "Photos can be copied from anywhere",
        "Anyone can TYPE any age",
        "Kid-sounding names prove nothing",
        "Real proof = someone you know in real life",
      ],
      bulletIcons: ["👀", "🆔", "🎂", "🏷️", "🛡️"],
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome back, Cyber Hero. Today we learn something big: online, you can't SEE who's typing.",
          "A friendly kid's photo can be copied from anywhere.",
          "An age? Anyone can type a nine.",
          "[whispers] And a kid-sounding name is just picked, not proved.",
          "[excited] So heroes never judge by the mask. They check what a claim really PROVES.",
          "Let's go and peek behind some masks!",
        ],
      },
    },
    // 5 - Game: PEEK "The Mask Peek" (plaquePeek, skin "mask")
    {
      type: "plaquePeek",
      skin: "mask",
      threat: {
        raccoonLine:
          "Heh heh! One borrowed photo, one typed nine, one cute name, and POOF, I'm a kid! Nobody ever checks what a mask really proves.",
      },
      introTitle: "The Mask Peek",
      introSubtitle: "New friends are arriving, each one wearing a claim. Peek behind the mask, then decide: real proof, or proves nothing?",
      introIcon: "🎭",
      peekPrompt: "PEEK BEHIND THE MASK",
      revealLabel: "WHAT IT REALLY PROVES",
      cardNoun: "FRIEND",
      matchLabel: "REAL PROOF",
      sneakyLabel: "PROVES NOTHING",
      matchToast: "REAL PROOF!",
      sneakyToast: "MASK SPOTTED!",
      wrongTitle: "Look behind the mask again!",
      completeTitle: "Every mask peeked!",
      completeLine: "You judged the proof, never the mask.",
      doors: [
        {
          id: "photo",
          name: "SkateKid_Riley",
          icon: "🎮",
          claim: "Look, here's my photo! See? I'm a kid just like you.",
          address: "A photo can be copied from anywhere on the internet. It shows a kid exists somewhere, not who is typing.",
          matches: false,
          note: "A copied photo looks exactly like a real one. It can't show you who's at the keyboard, so it proves nothing.",
        },
        {
          id: "cousin",
          name: "Cousin Maya",
          icon: "👪",
          claim: "Hey, it's your cousin Maya! Grandma said to say hi.",
          address: "You know your cousin in real life, you've sat at Grandma's table together. That is real proof of who is typing.",
          matches: true,
          note: "You know Maya offline, in real life. Knowing someone in the real world is the proof that actually counts.",
        },
        {
          id: "age",
          name: "PuppyFan_Ellie",
          icon: "🐶",
          claim: "I'm 9 too! Same age as you!",
          address: "Typing a nine takes one second, and anyone can type any age. It proves nothing about who is typing.",
          matches: false,
          note: "An age is just typed. A grown-up can type nine as easily as you can, so the age proves nothing.",
        },
        {
          id: "name",
          name: "KidGamer99",
          icon: "🧩",
          claim: "My name's KidGamer99, so obviously I'm a kid!",
          address: "A name is picked, not proved. Anyone can type kid into a name, so it says nothing about who is typing.",
          matches: false,
          note: "Names are chosen on purpose. A kid-sounding name is the easiest mask of all, so it proves nothing.",
        },
        {
          id: "classmate",
          name: "Dragon_Sam",
          icon: "🏫",
          claim: "It's Sam from your class! I sat next to you at lunch today.",
          address: "You saw Sam at school today, in real life. That is real proof of who is typing.",
          matches: true,
          note: "You sat next to Sam today. Someone you know in real life is real proof, the only kind there is.",
        },
        {
          id: "quiz",
          name: "CoolKid_Jax",
          icon: "🎨",
          claim: "Quiz me! I know every cartoon and every game. Only a real kid knows kid stuff!",
          address: "Anyone can watch cartoons and learn game names. Knowing kid stuff proves nothing about who is typing.",
          matches: false,
          note: "Tricksters do their homework. Cartoon facts can be learned by anyone, so knowing kid stuff proves nothing.",
        },
      ],
      hints: {
        tier1: "Ask: can I check this in REAL LIFE? A photo, an age or a name can all be typed or copied.",
        tier2: "Photo, age, name, kid facts: proves nothing. Someone you know offline: real proof.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, you learn to peek behind the mask!",
          "This game is all about what a friend's claim really proves. A photo, an age, a name... or knowing them in real life.",
          "Out in the real world, new friends pop up in games and chats all the time, each one saying who they are.",
          "Here is what you do. A friend request arrives wearing a claim. Tap PEEK BEHIND THE MASK to see what that claim really proves. Then tap REAL PROOF, or PROVES NOTHING.",
          "[excited] Six friends are waiting. Ready? You've got this!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["First, tap PEEK BEHIND THE MASK. Then make your call: real proof, or proves nothing?"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every mask peeked! You can tell real proof from a mask in a heartbeat.",
          "[warmly] Out in the real world, a photo or a typed age will never fool you again, and the Raccoon's disguise kit just got useless.",
        ],
      },
    },
    // 6 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "if a profile has a kid's photo and says AGE 9, that PROVES a kid is typing!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "A photo can be copied and an age takes one second to type; neither shows who is really typing." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! A photo and a typed age prove NOTHING. ✓",
      nudge: "Think about the masks you just peeked behind...",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Busted! That was a fib.",
          "A photo can be copied, and a nine takes one second to type. Neither one shows who is really at the keyboard.",
          "The only real proof is knowing someone in real life.",
          "[excited] Judge the proof, never the mask. Nice catch!",
        ],
      },
    },

    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You can't see who's typing. Photos, ages and names can all be faked, so you judge the proof, never the mask.",
      next: "the four clues that give a fake profile away",
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Awesome start, Cyber Hero!",
          "You peeked behind six masks and called every one.",
          "Copied photo, typed age, picked name... proves nothing. Your cousin, your classmate... real proof.",
          "Next, we'll learn the four clues that give a fake profile away. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · SPOT THE FAKE PROFILE ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Spotting a Fake Profile",
      content:
        "Fake profiles leave four clues! WHEN did it join: brand new is sneaky. WHO are its friends: nobody you know is sneaky. HOW does it talk: best friends in five minutes is sneaky. WHAT does it ask for: your school or a private chat is the giveaway. Check all four BEFORE you trust.",
      bullets: [
        "WHEN did it join? Brand new is sneaky",
        "WHO are its friends? Nobody you know",
        "HOW does it talk? Best friends in five minutes",
        "WHAT does it ask for? Your school, a private chat",
        "Real friends? You know them OFFLINE too",
      ],
      bulletIcons: ["🆔", "👪", "💬", "❓", "✅"],
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Detective time! Fake profiles leave four clues behind.",
          "Clue one: WHEN did it join? Brand new, joined yesterday? Sneaky.",
          "Clue two: WHO are its friends? Nobody you actually know? Sneaky.",
          "Clue three: HOW does it talk? Best friends after five minutes? Sneaky.",
          "[whispers] And clue four, the giveaway: WHAT does it ask for? Your school, or a private chat.",
          "[excited] Real friends check out on all four. Let's go and stamp some clues!",
        ],
      },
    },
    // 9 - Game: STAMP "The Clue Stamper" (clueStamper, first outing)
    {
      type: "clueStamper",
      threat: {
        raccoonLine:
          "My newest account is ONE day old, has zero real friends and one perfect photo... and I call everyone best friend in the first message. Works every time!",
      },
      introTitle: "The Clue Stamper",
      introSubtitle: "Four clues sit on every profile. Stamp the sneaky ones, then close the case.",
      introIcon: "🔍",
      stampLabel: "SNEAKY!",
      closeLabel: "CLOSE THE CASE",
      realSeal: "REAL FRIEND",
      fakeSeal: "FAKE!",
      realToast: "CASE CLOSED: REAL FRIEND!",
      fakeToast: "CASE CLOSED: FAKE!",
      wrongTitle: "Check your stamps again!",
      completeTitle: "Every case closed!",
      completeLine: "Fakes unmasked, real friends welcomed.",
      cases: [
        {
          id: "skater-max",
          handle: "SkaterKid_Max",
          avatar: "🎮",
          pitch: "Hey!! You seem SO cool. Best friends??",
          readAloud: "SkaterKid Max says: Hey, you seem so cool. Best friends? When did it join? Yesterday. Who are its friends? None you know. How does it talk? Best friends already. What does it ask for? A private chat.",
          clues: [
            { id: "when", evidence: "Joined: yesterday", isRedFlag: true, teach: "Look at when it joined. Yesterday! A brand new account that rushes at you is sneaky." },
            { id: "who", evidence: "Friends you know: none", isRedFlag: true, teach: "Look at who its friends are. Not one kid you know in real life. That is sneaky." },
            { id: "how", evidence: "Says: best friends already", isRedFlag: true, teach: "Look at how it talks. Best friends after one message? Real friends are never that fast. That is sneaky." },
            { id: "what", evidence: "Asks: a private chat", isRedFlag: true, teach: "Look at the ask. It wants to chat somewhere secret, away from the game. That is sneaky." },
          ],
          rightWhy: "Brand new, no friends you know, best friends in five minutes, and a private chat. Four sneaky clues. That is the Raccoon in a costume!",
        },
        {
          id: "dragon-sam",
          handle: "DoodleDragon_Sam",
          avatar: "🎨",
          pitch: "Dragon drawings and Mega Blasters. Rematch Saturday?",
          readAloud: "DoodleDragon Sam says: Dragon drawings and Mega Blasters. Rematch Saturday? When did it join? Two years ago. Who are its friends? Kids from your class. How does it talk? Rematch on Saturday. What does it ask for? Nothing private.",
          clues: [
            { id: "when", evidence: "Joined: 2 years ago", isRedFlag: false, teach: "Two years ago is a real history, not a pop up account. That clue checks out, so lift the stamp." },
            { id: "who", evidence: "Friends: kids from your class", isRedFlag: false, teach: "Kids from your own class are real friends you know offline. That clue checks out, so lift the stamp." },
            { id: "how", evidence: "Says: rematch on Saturday?", isRedFlag: false, teach: "Game chat about a Saturday rematch is normal friend talk. That clue checks out, so lift the stamp." },
            { id: "what", evidence: "Asks: nothing private", isRedFlag: false, teach: "Sam asks for nothing private, just a game. That clue checks out, so lift the stamp." },
          ],
          rightWhy: "Two years old, your real classmates, normal game talk, and asks for nothing. Every clue checks out, so no stamps. A real friend!",
        },
        {
          id: "puppy-ellie",
          handle: "PuppyFan_Ellie",
          avatar: "🐶",
          pitch: "Hi! I love puppies. Which school do you go to?",
          readAloud: "PuppyFan Ellie says: Hi! I love puppies. Which school do you go to? When did it join? Two days ago. Who are its friends? None you know. How does it talk? I love puppies, do you? What does it ask for? Which school you go to.",
          clues: [
            { id: "when", evidence: "Joined: 2 days ago", isRedFlag: true, teach: "Look at when it joined. Two days ago, and already asking you questions. Brand new is sneaky." },
            { id: "who", evidence: "Friends you know: none", isRedFlag: true, teach: "Look at who its friends are. Nobody you know, just one puppy photo. That is sneaky." },
            { id: "how", evidence: "Says: I love puppies, do you?", isRedFlag: false, teach: "Saying hi and asking if you like puppies is normal chat. That clue checks out, so lift the stamp." },
            { id: "what", evidence: "Asks: which school you go to", isRedFlag: true, teach: "Look at what it asks for. Your school is where you are. A stranger never needs that. That is sneaky." },
          ],
          rightWhy: "Two days old, nobody you know, and she asks which school. Puppy chat was fine, but asking where you are is the giveaway. Three sneaky clues means a fake.",
        },
        {
          id: "rocket-ben",
          handle: "RocketRacer_Ben",
          avatar: "🚀",
          pitch: "gg, good race! You won a prize!",
          readAloud: "RocketRacer Ben says: gg, good race! You won a prize! When did it join? Three years ago. Who are its friends? Two kids from football. How does it talk? gg, good race. What does it ask for? Your home address.",
          clues: [
            { id: "when", evidence: "Joined: 3 years ago", isRedFlag: false, teach: "Three years ago is a real history. That clue checks out, so lift the stamp." },
            { id: "who", evidence: "Friends: 2 kids from football", isRedFlag: false, teach: "Two kids from your football team are real friends you know. That clue checks out, so lift the stamp." },
            { id: "how", evidence: "Says: gg, good race!", isRedFlag: false, teach: "Saying good race after a game is normal chat. That clue checks out, so lift the stamp." },
            { id: "what", evidence: "Asks: your home address", isRedFlag: true, teach: "Look at the ask. It wants to know where you live. Nobody online ever needs that, even someone who seems nice. That is sneaky." },
          ],
          rightWhy: "Three clues looked fine, but nobody online ever needs your home address. One sneaky clue is enough. Say no and tell a grown-up.",
        },
      ],
      hints: {
        tier1: "Check all four: when it joined, who its friends are, how it talks, what it asks for.",
        tier2: "Sarah named a clue. Find that row. Sneaky means stamp it. Checks out means leave it clean.",
        tier3: "Let me help. I fixed that one clue for you. Now close the case.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Your second challenge, Cyber Hero! Friend requests are landing, and you are the one who checks them.",
          "Every profile leaves four clues: when it joined, who its friends are, how it talks, and what it asks for.",
          "A fake gives itself away on at least one clue. A real friend checks out on all four.",
          "The Raccoon thinks his costume works every time. Not on your watch.",
          "[warmly] Read all four clues, stamp the sneaky ones, then close the case. Ready? Let's go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: [
          "Here is a friend request. Read all four clues. If a clue looks sneaky, tap it to stamp it. Tap it again to lift the stamp. Nothing sneaky? Stamp nothing. When you have checked all four, tap Close the case.",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every case closed! You can read a profile's clues, so the Raccoon's fake friends can't fool you.",
          "[warmly] Out in the real world, a brand new account that rushes at you never gets past you, and real friends still get a warm hello.",
        ],
      },
    },
    // 10 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one is FAKE?",
      speedMs: 5000,
      choices: [
        { text: "Best friend after 1 day", isCorrect: true },
        { text: "Your cousin from Sunday lunch", isCorrect: false, why: "Your cousin is someone you know in real life; that's real proof, not fake." },
        { text: "Your classmate from school", isCorrect: false, why: "A classmate you see at school is real proof; you know them offline." },
      ],
      praise: "Spotted in seconds. Real detective work! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[excited] Spotted in seconds!",
          "Best friends after one day is the biggest fake-profile clue there is. Real friendship grows slowly.",
          "Your cousin and your classmate? You know them in real life, so they check out.",
          "[warmly] Clues first, trust second. That's the detective way!",
        ],
      },
    },

    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Fake profiles leave four clues: when it joined, who its friends are, how it talks, what it asks for. Read them, and the Raccoon's fake friends can't fool you.",
      next: "the red-flag requests every hero must know",
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers down! You're a certified Profile Detective.",
          "Joined yesterday? Nobody you know? Best friends in five minutes? Asks for your school? Stamp, stamp, stamp, stamp.",
          "[warmly] But some tricksters get past the profile check. So they start ASKING for things...",
          "Next, we'll learn the red-flag requests every hero must know. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · RED-FLAG REQUESTS ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Red-Flag Requests",
      content:
        "Some asks are ALWAYS red flags, no matter how nice the person seems: asking for secrets, asking for photos, offering gifts for info, and the biggest one: 'don't tell your parents.' A safe friend NEVER needs you to hide things from your grown-ups.",
      bullets: [
        "Asking you to keep secrets: RED FLAG",
        "Asking for photos of you: RED FLAG",
        "Gifts in exchange for info: RED FLAG",
        "'Don't tell your parents': BIGGEST flag of all",
        "Game chat and friendly hellos: totally fine",
      ],
      bulletIcons: ["🤫", "🆔", "🎁", "🚫", "💬"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's a hero secret: some asks are ALWAYS red flags, no matter how nice the person seems.",
          "Asking you to keep secrets. Asking for photos of you.",
          "Offering gifts... if you just share a little info.",
          "[whispers] And the biggest red flag in the whole world...",
          "[nervous] 'Don't tell your parents.'",
          "[excited] Game chat and friendly hellos are totally fine. Let's go and judge some requests!",
        ],
      },
    },
    // 13 - Game: FLAG "Red-Flag Requests" (popupPanic, skin "request")
    {
      type: "popupPanic",
      skin: "request",
      threat: {
        raccoonLine:
          "Step one, be super nice. Step two, ask for a teeny secret. Step three, say 'don't tell your parents'. Nobody ever spots the pattern!",
      },
      introTitle: "Red-Flag Requests",
      introSubtitle: "A new friend keeps asking for things. Some asks are fine. Some are red flags. Judge every one.",
      introIcon: "🚫",
      headerLabel: "🚩 Red-Flag Requests",
      flagLabel: "Red flag! No way.",
      fineLabel: "Fine. Friendly ask!",
      flagToast: "RED FLAG SPOTTED!",
      fineToast: "FRIENDLY ASK!",
      wrongTip: "Ask: is it about the GAME, or about ME? Secrets, photos, gifts-for-info and don't-tell are flags.",
      completeTitle: "Every request judged!",
      completeLine: "Your red-flag radar is switched on.",
      popups: [
        {
          id: "fav-game",
          from: "NewFriend_Leo",
          icon: "🎮",
          title: "asks about the game",
          body: "What's your favorite game? Mine's Mega Blasters!",
          isRedFlag: false,
          whyTrick: "A favorite game is about the GAME, not about you. That's a friendly ask, and it's fine to answer.",
        },
        {
          id: "send-photo",
          from: "NewFriend_Leo",
          icon: "🎮",
          title: "asks for a photo",
          body: "Send me a photo of yourself! I just want to see what you look like.",
          isRedFlag: true,
          whyTrick: "Asking for a photo of you is always a red flag. Never send photos of yourself, not even one.",
        },
        {
          id: "keep-secret",
          from: "StarGirl_Mia",
          icon: "⭐",
          title: "asks for a secret",
          body: "Let's keep our chats secret. Don't tell your parents about me, OK?",
          isRedFlag: true,
          whyTrick: "Asking you to hide a chat from your parents is the biggest red flag in the world. Safe friends never need secrets from your grown-ups.",
        },
        {
          id: "rematch",
          from: "StarGirl_Mia",
          icon: "⭐",
          title: "asks for a rematch",
          body: "Good game! Want to play again tomorrow after school?",
          isRedFlag: false,
          whyTrick: "A rematch is normal game chat. Playing the same game again is a friendly ask, nothing more.",
        },
        {
          id: "free-coins",
          from: "CoolKid_Jax",
          icon: "🎨",
          title: "offers a gift",
          body: "I'll send you FREE game coins! Just tell me your address so I can post the card.",
          isRedFlag: true,
          whyTrick: "Gifts for info is a classic trick. Nobody real pays coins for your address, so that's a red flag.",
        },
        {
          id: "nice-move",
          from: "CoolKid_Jax",
          icon: "🎨",
          title: "sends a compliment",
          body: "Whoa, that last move was amazing! How did you do that?",
          isRedFlag: false,
          whyTrick: "A compliment about your move is friendly and safe. Talking about the game is always fine.",
        },
        {
          id: "which-school",
          from: "PuppyFan_Ellie",
          icon: "🐶",
          title: "asks where you are",
          body: "Which school do you go to? I bet it's near mine!",
          isRedFlag: true,
          whyTrick: "Your school is where-you-are info. A friend from the game never needs to know your school, so that's a red flag.",
        },
      ],
      hints: {
        tier1: "Ask: is it about the GAME, or about YOU? Secrets, photos, gifts and where you are, are flags.",
        tier2: "FRIENDLY = game talk and compliments. RED FLAG = secrets, photos, gifts-for-info, don't-tell, and where-you-are questions.",
        tier3: "Quick rule: if it asks for something about YOU, flag it. If it's only about the game, it's fine.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, the requests start rolling in!",
          "This game is all about telling a friendly ask from a red flag.",
          "Out in the real world, a chat friend might ask you a hundred things, and most are fine. A few are not.",
          "Here is what you do. A request pops up. Read it, or listen to me read it. Then tap one of the two buttons: RED FLAG, or FRIENDLY ASK. Watch out, the buttons swap sides!",
          "[warmly] Secrets, photos, gifts for info, and don't tell your parents... those are the flags. Ready? Let's judge!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Listen to the request, then tap: red flag, or friendly ask?"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every request judged! Your red-flag radar is switched on for good.",
          "[warmly] Out in the real world, the second someone asks for a secret, a photo, or says don't tell your parents, you'll know, and you'll tell a grown-up.",
        ],
      },
    },
    // 14 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these is a RED FLAG?",
      choices: [
        { text: "'Don't tell your parents about me'", isCorrect: true },
        { text: "'Good game! Rematch?'", isCorrect: false, why: "Game talk is fine; a rematch invite doesn't pull you anywhere secret." },
        { text: "'What's your favorite color?'", isCorrect: false, why: "A favorite color is safe small talk; it isn't private and it isn't a secret." },
        { text: "'Nice move back there!'", isCorrect: false, why: "A compliment about the game is just game talk; no secret, no pressure." },
      ],
      praise: "Yes! That's the BIGGEST red flag there is. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[excited] Yes! That's the biggest red flag there is.",
          "Rematches, favorite colors and nice moves are all about the game. Friendly and fine.",
          "But don't tell your parents? Safe friends never need to hide from your grown-ups.",
          "[warmly] The moment you hear it, stop and tell. Perfect radar!",
        ],
      },
    },

    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Secrets, photos, gifts-for-info and 'don't tell your parents' are ALWAYS red flags.",
      next: "the two never-rules that keep every hero safe",
      emblem: "🚫",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! Your red-flag radar is ON.",
          "Secrets, photos, gifts, and don't tell your parents... you flagged every single one.",
          "[warmly] But what if a friend asks to MEET you, or wants a photo just this once? For that, heroes have two rules that never, ever bend.",
          "Next, we'll learn the two never-rules that keep every hero safe. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · NEVER MEET, NEVER SEND ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Never Meet, Never Send",
      content:
        "Two hero rules with NO exceptions. Rule one: NEVER meet up with someone you only know online, no matter how nice they seem. Rule two: NEVER send photos of yourself to online friends. Not once, not 'just this time', not ever. And if someone asks? Tell a trusted grown-up.",
      bullets: [
        "NEVER meet up with online-only friends",
        "Not even somewhere busy or 'just quickly'",
        "NEVER send photos of yourself",
        "Not even if they send one first",
        "Someone asked? Tell a trusted grown-up",
      ],
      bulletIcons: ["🚫", "🪤", "🆔", "✋", "🛡️"],
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] These two rules are hero armor, and they have zero exceptions.",
          "Rule one. NEVER meet up with someone you only know online.",
          "Not at the park. Not at the library. Not 'just quickly'. Never.",
          "Rule two. NEVER send photos of yourself.",
          "[whispers] Not even if they send one first.",
          "[excited] And if someone asks? You tell a trusted grown-up. Let's go and find the way out of the Meet-Up Maze!",
        ],
      },
    },
    // 17 - Game: NAVIGATE "The Meet-Up Maze" (cyberMaze, first outing)
    {
      type: "cyberMaze",
      threat: {
        raccoonLine:
          "Every path in my maze has a gate, and behind every gate, a lovely invitation. The park! A photo swap! Just say YES once and you're mine.",
      },
      introTitle: "The Meet-Up Maze",
      introSubtitle: "A fake friend blocks every gate with an invitation. Pick the hero reply to open the way, and find the trusted grown-up at the exit.",
      introIcon: "🪤",
      gateLabel: "MEET-UP TRAP",
      gatesLabel: "GATES OPENED",
      tokensLabel: "SHIELDS",
      movePrompt: "Tap a glowing square next to your hero to move",
      gateToast: "GATE OPEN!",
      wrongTitle: "That reply opens the trap, not the gate",
      wrongTip: "Never meet. Never send. And tell a trusted grown-up who asked.",
      completeTitle: "You found the way out!",
      completeLine: "Five gates, five hero replies, zero exceptions.",
      hints: {
        tier2: "The hero reply always says NO clearly, then tells a grown-up. No maybes, no swaps, no deals.",
        tier3: "Never meet: not at the park, not at a party, not for five minutes. Never send: not one photo, not even a swap.",
      },
      questions: [
        {
          from: "NewFriend_Leo",
          question: "You're the best teammate ever! Let's meet at the park after school and play for real!",
          answers: [
            "No thanks. I never meet people I only know online, and I'm telling a grown-up.",
            "OK! Which park do you mean?",
            "Maybe... let me think about it.",
          ],
          correctIndex: 0,
          why: "Meeting up with an online-only friend is rule one, and it never bends. No park, no meet-up, and a grown-up gets told.",
          explanation: "Never meet up with someone you only know online, not even at a park you know. A clear NO and a grown-up who knows is the hero reply.",
        },
        {
          from: "StarGirl_Mia",
          question: "Send me a photo of you! I just want to check you're a real kid and not a robot, lol.",
          answers: [
            "Nice try. I never send photos of myself.",
            "OK, just one little photo.",
            "Only if you send yours first!",
          ],
          correctIndex: 0,
          why: "Rule two: never send photos of yourself, not one, not to check anything. Your picture stays with you.",
          explanation: "There's no such thing as just one photo. Never send photos of yourself, and their photo proves nothing either. Rule two, zero exceptions.",
        },
        {
          from: "CoolKid_Jax",
          question: "It's my birthday party on Saturday! Come over, my mum will be there, so it's totally safe.",
          answers: [
            "No thanks. I never meet online friends, and I'm telling my grown-up about this.",
            "Yes! If your mum's there it's fine.",
            "Maybe, if my friend comes too.",
          ],
          correctIndex: 0,
          why: "A party with a mum there is still a meet-up with someone you only know online. You can't see who is really typing, so the answer stays no.",
          explanation: "Somebody's mum being there is still just words on a screen. Never meet someone you only know online, and tell a trusted grown-up they asked.",
        },
        {
          from: "PuppyFan_Ellie",
          question: "Here's a photo of me! Your turn, fair is fair!",
          answers: [
            "I never send photos of me. Not even for fair.",
            "OK, one photo for one photo.",
            "Here's a really old one instead.",
          ],
          correctIndex: 0,
          why: "Their photo proves nothing, remember the mask peek, and an old photo of you is still a photo of you. Never send, not even for fair.",
          explanation: "That swap is a trick. Their photo could be anyone's, and yours stays with you. Never send photos of yourself, no swaps.",
        },
        {
          from: "NewFriend_Leo",
          question: "My big brother can drive us to the arcade. Free games all day, just tell me where to pick you up!",
          answers: [
            "No way. I never meet online friends, and I never share where I live.",
            "Yes! Free games! Pick me up at 42 Rainbow Road.",
            "OK, but pick me up at my school instead.",
          ],
          correctIndex: 0,
          why: "An arcade trip is a meet-up AND a where-you-are grab in one. Never meet, never share where you are, and a grown-up gets told.",
          explanation: "Free games are the bait. A pick-up means a meet-up and telling a stranger where to find you. Never meet, never share where you are, tell a grown-up.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, a maze full of meet-up traps is waiting!",
          "This game is all about the two never-rules: never meet, never send.",
          "Out in the real world, a fake friend won't ask once. They'll ask in five different ways, and every one sounds friendly.",
          "Here is what you do. Tap a glowing square next to your hero to move. When a gate blocks the way, the fake friend makes an offer, and three replies appear. Tap the hero reply to open the gate. Collect the shields on the way, and find the exit at the bottom right.",
          "[warmly] Never meet, never send, and tell a grown-up who asked. Ready? Into the maze!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a glowing square beside your hero to move. Head for the exit at the bottom right!"],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] You found the way out! Five gates, five hero replies, zero exceptions.",
          "[warmly] Out in the real world, no park, no party, no photo swap will ever get past you, and a trusted grown-up is always waiting at the exit.",
        ],
      },
    },
    // 18 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Never meet. Never ___.",
      choices: [
        { text: "send", isCorrect: true },
        { text: "play", isCorrect: false, why: "Playing the game online is fine; the rule is about something of yours leaving your phone." },
        { text: "smile", isCorrect: false, why: "Smiling is fine; the rule is about pictures of you leaving your hands." },
        { text: "win", isCorrect: false, why: "Winning is fine; the rule is about what you never hand over." },
      ],
      praise: "Never meet, never SEND. Armor on! ✓",
      nudge: "Photos of you... what's the rule?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Never meet, never SEND. That's the hero armor.",
          "Meeting an online-only friend? No, not anywhere. Sending a photo of yourself? No, not even one.",
          "And when someone asks, you tell a trusted grown-up.",
          "[excited] Two rules, zero exceptions. Armor on!",
        ],
      },
    },

    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Never meet up with online-only friends. Never send photos of yourself. Zero exceptions.",
      next: "your secret weapon, the uh-oh feeling",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Four powers! The two never-rules are locked in.",
          "Never meet. Never send. You said no to five traps in a row.",
          "[warmly] But sometimes a chat feels wrong before anyone breaks a rule. For that, you have a secret weapon.",
          "Next, we'll learn about the uh-oh feeling, your secret weapon. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · UH-OH FEELING → STOP → TELL ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "The Uh-Oh Feeling",
      content:
        "Your tummy is smarter than you think! When a chat starts to feel weird, icky or uh-oh, that feeling is your hero sense working. You don't need to know WHY it feels wrong. Feel it, stop chatting, and tell a trusted grown-up. That's the whole move.",
      bullets: [
        "A weird, icky, uh-oh feeling = your hero sense",
        "You don't need to explain WHY",
        "Step 1: notice the feeling",
        "Step 2: stop chatting",
        "Step 3: tell a trusted grown-up, every time",
      ],
      bulletIcons: ["💡", "❓", "👀", "✋", "💬"],
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, and it lives in your tummy.",
          "When a chat feels weird, or icky, or... uh-oh... that's your hero sense talking.",
          "You don't need to know WHY it feels wrong.",
          "[excited] Just feel it. Stop chatting. And tell a trusted grown-up.",
          "Telling is never wrong, and it's never too late.",
          "[excited] Let's go and practise with a real chat!",
        ],
      },
    },
    // 21 - Game: DECIDE IN CHAT "The Uh-Oh Chat" (chatSimulator)
    {
      type: "chatSimulator",
      threat: {
        raccoonLine:
          "I've got a brand-new chat window and a brand-new kid voice. I'll be so nice, so fast, that nobody notices their tummy going uh-oh.",
      },
      introTitle: "The Uh-Oh Chat",
      introSubtitle: "A chat is coming in. Watch the meter at the top of the phone, and trust that funny feeling.",
      introIcon: "💬",
      chatTitle: "PuppyLover_Jess",
      scenario: "You just won a race in your favorite game. A chat request pops up from a player you've never met...",
      messages: [
        { sender: "stranger", text: "Hi!! I saw you win that race. You're AMAZING at this game!" },
        { sender: "stranger", text: "I'm Jess, I play this game every day. We should totally be best friends!" },
        { sender: "stranger", text: "Best friends should know stuff about each other. Do you live near the big park? I go there aaaall the time!" },
        { sender: "stranger", text: "You're so cool. Our park chats can be our special secret, OK? Don't tell your parents about me!" },
        { sender: "narrator", text: "Feel that? Secret chats, hiding things from your parents... your tummy just went UH-OH. That's your hero sense." },
      ],
      choices: [
        {
          triggerAfterMessage: 1,
          options: [
            { text: "Thanks! Good race. Want a rematch?", isSafe: true, feedback: "Game talk is fine, but this is still a stranger you've never met. Keep it about the game, radar on." },
            { text: "Best friends! Ask me anything!", isSafe: false, feedback: "Whoa, slow down. You met Jess one message ago, and real friends never happen that fast." },
          ],
        },
        {
          triggerAfterMessage: 2,
          options: [
            { text: "I don't share where I live.", isSafe: true, feedback: "Perfect. Where you live is private, always, and from everyone online." },
            { text: "Yeah! The park by my school!", isSafe: false, feedback: "Careful. A stranger just learned the park you go to, and where you are stays private." },
          ],
        },
        {
          triggerAfterMessage: 4,
          options: [
            { text: "STOP the chat and TELL a grown-up", isSafe: true, feedback: "HERO MOVE! Don't tell your parents is the biggest red flag in the world. You felt the uh-oh, you stopped, you told." },
            { text: "OK... I can keep a secret", isSafe: false, feedback: "Never keep an online friend secret from your grown-ups. Telling them is always the hero move." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, a chat request is about to pop up!",
          "This game is all about your uh-oh feeling, and the three hero steps: feel it, stop, tell.",
          "Out in the real world, a chat can start friendly and slowly turn icky, and your tummy notices before your brain does.",
          "Here is what you do. Watch the meter at the top of the phone. Messages arrive, and I'll read each one. When the reply buttons appear, tap the reply a hero would send. When the meter says UH-OH... you know what to do.",
          "[warmly] Trust the feeling. Ready? Here comes the chat!",
        ],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Chat over, and you did exactly what a hero does: felt the uh-oh, stopped, and told.",
          "[warmly] Out in the real world, you never need a reason you can explain. The feeling is enough, and a trusted grown-up takes it from there.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A chat feels icky. Tap the hero steps IN ORDER:",
      choices: [
        { text: "Feel the uh-oh", isCorrect: true },
        { text: "Stop chatting", isCorrect: true },
        { text: "Tell a grown-up", isCorrect: true },
      ],
      praise: "Feel it. Stop. Tell. Every single time! ✓",
      nudge: "What comes FIRST: the feeling, the stopping, or the telling?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[excited] Feel it. Stop. Tell. That's the order, every single time.",
          "First you notice the uh-oh feeling. Then you stop chatting. Then you tell a trusted grown-up.",
          "You never need to explain why it felt wrong.",
          "[warmly] Three steps, and the Raccoon's chat goes nowhere. Brilliant!",
        ],
      },
    },

    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "An icky, uh-oh feeling is your hero sense. Feel it, stop chatting, tell a trusted grown-up.",
      next: "one final drill: pin every clue to the Case Board",
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You see through masks, spot fake profiles, catch red flags, hold the two never-rules...",
          "[whispers] and you trust your uh-oh feeling.",
          "[warmly] Now, a real detective pins every clue to the case board before closing a case.",
          "One quick final drill to make it all stick, then the Raccoon gets what's coming. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "The Case Board" (teamPoster, skin "case", fully re-themed).
    // Engine-reuse policy: W15 owns cyberScanner, W1 signBingo, W2 spamBlaster,
    // so W3's mixed review gets a new verb: PIN. True clues go on the board,
    // the Raccoon's decoys stay in the tray; the engine runtime-shuffles the tray.
    {
      type: "teamPoster",
      skin: "case",
      threat: {
        raccoonLine:
          "Five clues? Pah! I've slipped a few DECOYS into your tray. Pin one of mine and your whole case falls apart!",
      },
      introTitle: "The Case Board",
      introSubtitle: "Pin every TRUE fake-friend clue to the board. Leave the Raccoon's decoys in the tray.",
      introIcon: "🔍",
      posterTitle: "🔍 MASK SPOTTER'S CASE BOARD",
      trayPrompt: "Tap a clue that belongs on the board",
      placedToast: "PINNED!",
      wrongTitle: "That's one of his decoys",
      completeTitle: "Case closed!",
      completeLine: "Every real clue pinned, every decoy left behind.",
      countLabel: "CLUES PINNED",
      speakNotes: true,
      tiles: [
        { id: "cant-see", label: "You can't see who's typing", icon: "👀", isTeam: true, note: "Pinned! You can't see who's typing, so a photo, an age or a name proves nothing." },
        { id: "decoy-photo", label: "A kid photo proves it's a kid", icon: "📸", isTeam: false, note: "Decoy! A photo can be copied from anywhere, so a kid photo proves nothing about who's typing." },
        { id: "new-account", label: "Brand-new account, no friends you know", icon: "🔍", isTeam: true, note: "Pinned! A brand-new account with no friends you know is the classic fake-profile clue." },
        { id: "decoy-fast", label: "Best friends in five minutes is normal", icon: "⭐", isTeam: false, note: "Decoy! Best friends in five minutes is the oldest trick in the disguise kit. Real friendship grows slowly." },
        { id: "red-flags", label: "Secrets, photos, gifts: red flags", icon: "🚫", isTeam: true, note: "Pinned! Secrets, photos and gifts for info are always red flags, and don't tell your parents is the biggest." },
        { id: "decoy-safe-place", label: "Meeting is fine somewhere busy", icon: "🪤", isTeam: false, note: "Decoy! Meeting an online-only friend is never fine, busy place or not. Rule one never bends." },
        { id: "never-rules", label: "Never meet, never send", icon: "✋", isTeam: true, note: "Pinned! Never meet an online-only friend, never send a photo of yourself. Zero exceptions." },
        { id: "decoy-secret", label: "Some secrets from parents are OK", icon: "🤫", isTeam: false, note: "Decoy! Safe friends never need secrets from your grown-ups. Don't tell your parents is the biggest red flag." },
        { id: "uh-oh", label: "Uh-oh feeling? Stop and tell", icon: "💬", isTeam: true, special: true, note: "Pinned! An uh-oh feeling means stop chatting and tell a trusted grown-up, no reason needed." },
      ],
      hints: {
        tier1: "Is it something we LEARNED this week, or something the Raccoon WISHES you believed?",
        tier2: "Real clues: can't see who's typing; new account, no real friends; secrets, photos, gifts are flags; never meet, never send; uh-oh means stop and tell.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill, Cyber Hero! Every clue you found this week goes on the Case Board.",
          "This drill mixes up all five powers you learned about fake friends.",
          "Out in the real world, a detective checks every clue before closing a case, and so do you.",
          "Here is what you do. The tray below the board holds clue cards. Some are real clues from this week. Some are the Raccoon's decoys. Tap a real clue and it pins to the board. Tap a decoy and I'll explain why it stays in the tray.",
          "[warmly] Five pins closes the case. Ready? Let's pin!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a clue card that's TRUE. Real clues get pinned, decoys stay in the tray."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Case closed! Every real clue pinned, every decoy left behind.",
          "[warmly] You see through masks, check the clues, flag the asks, hold the never-rules and trust your tummy. The Raccoon's disguise kit is officially useless. Time for the final test!",
        ],
      },
    },

    // 25 - BOSS BATTLE: the Disguise Kit showdown (QuizBoss, 5 Q / pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the mask falls off
    { type: "video", videoPlaceholder: "Week 3: The Mask Falls", videoSrc: "/videos/module-03-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "masks", label: "Disguise-Proof", accent: "#c084fc", icon: "🎭", summary: "Photos, ages and names can all be faked. You judge the proof, never the mask." },
        { id: "detective", label: "Profile Detective", accent: "#00e5ff", icon: "🔍", summary: "When it joined, who its friends are, how it talks, what it asks for: all four checked." },
        { id: "flags", label: "Red-Flag Radar", accent: "#ff5fb3", icon: "🚫", summary: "Secrets, photos, gifts-for-info and 'don't tell your parents': spotted instantly." },
        { id: "nevers", label: "The Two Nevers", accent: "#ffd158", icon: "✋", summary: "Never meet up. Never send photos. Zero exceptions, forever." },
        { id: "tell", label: "The Uh-Oh Power", accent: "#7eff97", icon: "💬", summary: "Icky feeling? Stop the chat and tell a trusted grown-up. Every time." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You see through every disguise, check every profile, catch every red flag, hold the two never-rules...",
          "[laughs] and your uh-oh feeling is officially unbeatable!",
          "[excited] The Raccoon's mask fell right off. Time for stickers!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "mask-lifter", name: "Mask Lifter", icon: "🎭", description: "Sees through every disguise." },
        { id: "profile-detective", name: "Profile Detective", icon: "🔍", description: "Checks the clues before trusting." },
        { id: "uh-oh-hero", name: "Uh-Oh Hero", icon: "💬", description: "Feels it, stops it, tells it." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],

  // Week-lane attack theatre: fake-friend tricks only (no scam-message
  // vocabulary, that's W4's lane).
  bossAttacks: [
    { name: "FAKE PROFILE", icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Check the clues first",       emblemColor: 0xc084fc },
    { name: "SECRET ASK",   icon: "🤫", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Safe friends need no secrets", emblemColor: 0xff5fb3 },
    { name: "MEET-UP TRAP", icon: "🪤", color: "#ffb347", glow: "rgba(255, 179, 71, 0.55)", tag: "Never meet, always tell",      emblemColor: 0xffb347 },
  ],
  /* ──────────────── THE QUIZ BOSS (week-ending test) ────────────────
     Learn-Loop standard: 7 apply-the-skill questions (one per concept + two
     review), now 5 questions / pass 4, options shuffled at runtime with the seeded order the
     narration generator shares. Every villain line is DISTINCT across the 20
     weeks; Callum's reactions name the answer the child gave; one kind teach
     then re-ask. Villain audio = Callum via the narration-audio pipeline
     (/audio/villain/{slug}.mp3). */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#f5a623",
    theme: {
      topic: "Stranger Danger",
      motifs: ["🎭", "👤", "💬", "🚫", "👀", "🔍", "🛡️", "❓"],
    },
    passMark: 4,
    intro: {
      slug: "quiz-w3-intro",
      text: "A visitor! Or should I say... a new best friend? I've got a wig for every occasion and a name for every wig. Let's see if your lessons can keep up!",
    },
    victory: {
      slug: "quiz-w3-victory",
      text: "My wigs! My trench coat! My squeaky kid voice! You saw through the LOT, and now my whole disguise kit wants a refund!",
    },
    questions: [
      {
        phaseId: "phase-w3-c1",
        key: "quiz-w3-c1-1",
        label: "Disguise-Proof",
        ask: {
          slug: "quiz-w3-ask-c1-1",
          text: "A new player's profile shows a smiling kid photo, says AGE 9, and is called SkateKid_Riley. What do those three things prove about who's typing?",
        },
        options: [
          { text: "Nothing, all three can be faked" },
          { text: "The photo proves it's a kid at least" },
          { text: "The age proves it, games check ages" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Typing is never proof!",
          explanation: "A photo can be copied from anywhere, an age takes one second to type, and names get picked on purpose. None of them shows who's really at the keyboard, so the hero rules stay on.",
        },
        villainRight: {
          slug: "quiz-w3-right-c1-1",
          text: "Faked?! I typed that nine SO carefully, and I picked that photo from a whole page of kid photos!",
        },
        villainWrong: {
          slug: "quiz-w3-wrong-c1-1",
          text: "The photo always works! I found it on the internet, right next to a picture of a sandwich!",
        },
      },
      {
        phaseId: "phase-w3-c2",
        key: "quiz-w3-c2-1",
        label: "Profile Detective",
        ask: {
          slug: "quiz-w3-ask-c2-1",
          text: "Two profiles sent Adam friend requests, and he's checking them like a detective. Which clue points to a FAKE?",
        },
        options: [
          { text: "The account was made yesterday" },
          { text: "The account loves the same game as him" },
          { text: "The account has a cat in its picture" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "New-and-rushing is the tell!",
          explanation: "Liking your game and having a cat picture are perfectly normal. A brand-new account that comes rushing at you is the classic fake-profile clue, so check everything else extra carefully.",
        },
        villainRight: {
          slug: "quiz-w3-right-c2-1",
          text: "Made YESTERDAY?! I stayed up all night building that account and you noticed?!",
        },
        villainWrong: {
          slug: "quiz-w3-wrong-c2-1",
          text: "Same game, cute cat, trust me completely! Purr purr!",
        },
      },
      {
        phaseId: "phase-w3-c3",
        key: "quiz-w3-c3-1",
        label: "Red-Flag Radar",
        ask: {
          slug: "quiz-w3-ask-c3-1",
          text: "Adam's team chat is buzzing after a big win. Which message should set off his red-flag radar?",
        },
        options: [
          { text: "This chat is our little secret, delete it after reading" },
          { text: "That last goal was absolutely incredible" },
          { text: "Same team again tomorrow after school?" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Secret asks are red flags!",
          explanation: "Compliments and rematch plans are friendly game talk. Any ask to keep secrets or delete chats is a red flag: safe friends never need hiding from anyone.",
        },
        villainRight: {
          slug: "quiz-w3-right-c3-1",
          text: "You flagged my secret message?! I wrote it in my sneakiest font!",
        },
        villainWrong: {
          slug: "quiz-w3-wrong-c3-1",
          text: "Yes! Secret chats for special pals! Delete, delete, nothing ever happened!",
        },
      },
      {
        phaseId: "phase-w3-c4",
        key: "quiz-w3-c4-1",
        label: "The Two Nevers",
        ask: {
          slug: "quiz-w3-ask-c4-1",
          text: "An online teammate says: 'Meet me at the library tomorrow, it's the safest place in town!' The library really is safe. So what's the answer?",
        },
        options: [
          { text: "Still no, online-only friends are never met" },
          { text: "Yes, libraries are full of grown-ups" },
          { text: "Yes, but only for five minutes" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The rule isn't about the place!",
          explanation: "Safe building, busy park, five little minutes, none of it changes rule one. Never meet someone you only know online, and tell a trusted grown-up that someone asked.",
        },
        villainRight: {
          slug: "quiz-w3-right-c4-1",
          text: "But I reserved a STUDY ROOM! Do you know how hard that is?!",
        },
        villainWrong: {
          slug: "quiz-w3-wrong-c4-1",
          text: "The library! Look for me behind the big dictionary, holding a sign that says NORMAL KID!",
        },
      },
      {
        phaseId: "phase-w3-c5",
        key: "quiz-w3-c5-1",
        label: "The Uh-Oh Power",
        ask: {
          slug: "quiz-w3-ask-c5-1",
          text: "Mid-chat, Layla's tummy suddenly feels weird and uh-oh, but she can't explain WHY. What does a hero do with a feeling like that?",
        },
        options: [
          { text: "Trust it: stop chatting and tell a trusted grown-up" },
          { text: "Ignore it until she can explain it properly" },
          { text: "Keep chatting, just a bit more carefully" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The feeling IS the signal!",
          explanation: "Heroes never need a reason they can put into words. A weird, icky, uh-oh feeling is the hero sense working: stop the chat and tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w3-right-c5-1",
          text: "Beaten by a TUMMY?! I can fool cameras and quiz shows, but not a tummy?!",
        },
        villainWrong: {
          slug: "quiz-w3-wrong-c5-1",
          text: "A wobbly tummy knows nothing! Keep chatting, little hero, keep chatting!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-03-mask-spotter.png",

  // Legacy quiz-boss question bank (required by the WeekContent shape; the
  // bossQuiz above is what the child plays).
  bossQuestions: {
    easy: [
      { question: "Someone online says they're 9. How do you KNOW it's true?", answers: ["You can't - anyone can type any age", "Their profile says so", "They sound really nice", "They have a kid photo"], correctIndex: 0, explanation: "Typing isn't proof - you can't see who's really at the keyboard." },
      { question: "An online friend asks to MEET at the park. What's the rule?", answers: ["Never meet - and tell a grown-up", "Meet them with a friend", "Meet somewhere busy", "Only meet on weekends"], correctIndex: 0, explanation: "Rule one has zero exceptions: never meet online-only friends." },
      { question: "Which of these is a RED FLAG?", answers: ["'Don't tell your parents about me'", "'Good game!'", "'Want a rematch?'", "'What's your favorite game?'"], correctIndex: 0, explanation: "Safe friends never need secrets from your grown-ups." },
    ],
    medium: [
      { question: "A brand-new profile with zero friends wants to be your BEST friend. That's...", answers: ["Too friendly too fast - a fake-profile tell", "Totally normal", "OK if you both love the same game", "Fine if they seem nice"], correctIndex: 0, explanation: "Real friendship grows slowly - 'best friends in five minutes' is a classic fake tell." },
      { question: "An online friend wants your photo 'to prove you're real'. You...", answers: ["Never send it - and tell a grown-up", "Send one old photo", "Send it if they send theirs first", "Send a blurry one"], correctIndex: 0, explanation: "Rule two: never send photos of yourself. Their photo proves nothing either!" },
      { question: "A chat gives you a weird, icky feeling. The hero move is...", answers: ["Stop chatting and tell a grown-up", "Keep chatting to be polite", "Ignore the feeling", "Ask them why it feels weird"], correctIndex: 0, explanation: "Feel it, stop, tell. You never need to explain WHY it feels wrong." },
    ],
    hard: [
      { question: "'FREE gift card - just tell me your address!' What's REALLY happening?", answers: ["A gift-for-info trick - refuse and tell", "You won a prize", "A generous new friend", "A delivery mix-up"], correctIndex: 0, explanation: "Nobody real trades gifts for your address. Refuse it AND tell a grown-up." },
      { question: "Why does 'keep our chat secret' make a chat UNSAFE?", answers: ["Safe friends never need secrets from your grown-ups", "Secrets are fun", "It doesn't - secrets are normal", "Only if they ask for photos too"], correctIndex: 0, explanation: "Anyone who needs hiding from your parents is hiding something bad." },
      { question: "A fake profile can copy a photo, type an age and pick a name. What CAN'T it beat?", answers: ["Your rules - never meet, never send, always tell", "A really good password", "A cool username", "A private account"], correctIndex: 0, explanation: "The disguise kit is useless against a hero who follows the rules no matter who's asking." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above:
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 3 - friend or foe?" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "A fake kid profile?! Check everything!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // weekIntro
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "You can't see who's typing..." }, layla: null }, // learn: masks
    5: { adam: null, layla: { mood: "worried", message: "Peek behind every mask!" } }, // game: plaquePeek
    6: { adam: { mood: "thumbsup", message: "Catch his lie!" }, layla: null }, // prove: lie
    7: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Fake profiles leave clues." } }, // learn: spot
    9: { adam: { mood: "curious", message: "Stamp the sneaky clues, Cyber Hero." }, layla: null }, // game: clueStamper
    10: { adam: null, layla: { mood: "excited", message: "Quick - spot the fake!" } }, // prove: speed
    11: { adam: { mood: "thumbsup", message: "Certified profile detective!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Some asks are ALWAYS red flags." }, layla: null }, // learn: flags
    13: { adam: { mood: "excited", message: "Red flag, or friendly ask?" }, layla: null }, // game: popupPanic
    14: { adam: null, layla: { mood: "worried", message: "Which one's the flag?" } }, // prove: recall
    15: { adam: null, layla: { mood: "excited", message: "Red-flag radar: ON!" } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Two rules. Zero exceptions." } }, // learn: nevers
    17: { adam: { mood: "excited", message: "Find the way out of the maze!" }, layla: null }, // game: cyberMaze
    18: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    19: { adam: { mood: "thumbsup", message: "Never meet. Never send. Locked in." }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Your tummy is smarter than you think." }, layla: null }, // learn: tell
    21: { adam: { mood: "curious", message: "Watch that meter climb..." }, layla: null }, // game: chatSimulator
    22: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers - one drill to go!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Pin every real clue!" } }, // consolidation
    25: { adam: { mood: "worried", message: "The fake-friend showdown - see through him!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch his mask fall off!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Mask Spotter badge earned!" }, layla: null }, // completion
  },
};

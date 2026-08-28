import type { WeekContent } from "./types";

/**
 * Week 3 - Stranger Danger: Friend or Foe?
 *
 * Built to the locked Cyber Heroes template (docs/cyberheroes/curriculum-buildsheet.md
 * + docs/cyberheroes/content-plans/weeks-03-20-content-plan.md):
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 MASKS    friends aren't always who they say   | REVEAL           | lie
 *     2 SPOT     spotting a fake profile              | profileInspector | speed
 *     3 FLAGS    red-flag requests                    | conveyorSort     | recall
 *     4 NEVERS   never meet, never send               | replyCards       | finish
 *     5 TELL     icky feeling -> stop -> tell         | chatSimulator    | order
 *   Consolidation (cyberScanner, Friend-or-Foe skin) -> boss (placeholder
 *   quiz boss until the bespoke W3 GAUNTLET is designed) -> closing video
 *   -> debrief -> stickers -> completion.
 *
 * ZERO game overlap with W1/W2: profileInspector, replyCards and
 * chatSimulator debut here; conveyorSort gets its first-ever outing; the
 * REVEAL board is re-dressed as the Disguise Kit (mask-lift). Lane-clean:
 * dangerous PEOPLE only - no fake senders/scam messages (W4), no report/
 * block protocol steps beyond "tell" (W11), no game-lobby specifics (W6).
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

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-03.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon built a FAKE kid profile - fake photo, fake age, fake name - and tricked a hero into telling him secrets. He's sending friend requests right now!",
      photoCaption: "Wk 3 - The Fake Friend",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn how strangers can wear a KID disguise online",
        "Spot fake profiles and red-flag messages",
        "Master the two never-rules - and the power of TELL",
      ],
    },

    /* ─────────── BEAT 1 · MASKS: WHO'S REALLY TYPING? ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Friends Aren't Always Who They Say",
      content:
        "Online, you can't SEE who's typing. A photo can be copied. An age can be typed. A name can be made up. Most people are exactly who they say - but a trickster can wear a kid disguise, and you can't tell just by looking.",
      bullets: [
        "You can't see who's really typing",
        "Photos can be copied from anywhere",
        "Anyone can TYPE any age",
        "Kid-sounding names prove nothing",
        "So heroes follow the rules - no matter who's asking",
      ],
      bulletIcons: ["👀", "🆔", "🎂", "🏷️", "🛡️"],
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome back, Cyber Hero. Big mission today.",
          "Online, you can't SEE who's typing.",
          "[whispers] A grown-up can pretend to be a kid...",
          "with a copied photo, a made-up name, and a typed age.",
          "[excited] But don't worry. Tricksters leave clues!",
          "And today, you learn to spot every single one.",
        ],
      },
    },
    // 4 - Game: REVEAL (The Disguise Kit - lift each piece of the mask)
    {
      type: "reveal",
      title: "The Disguise Kit",
      subtitle: "Tap each piece of his disguise to see the trick behind it.",
      items: [
        {
          id: "photo",
          label: "The Photo",
          icon: "🆔",
          steps: [
            { icon: "🦝", text: "That smiling kid in the profile photo? The Raccoon never took that picture..." },
            { icon: "🔍", text: "...he COPIED it from somewhere else on the internet." },
            { icon: "🎭", text: "Anyone can wear anyone's photo. It's just a mask." },
          ],
          counter: "A photo proves NOTHING about who's really typing.",
        },
        {
          id: "age",
          label: "The Age",
          icon: "🎂",
          steps: [
            { icon: "💬", text: "'I'm 9 too!' says the profile..." },
            { icon: "🦝", text: "...but look who's REALLY at the keyboard. Typing '9' takes one second." },
          ],
          counter: "Anyone can TYPE any age. Typing isn't proof!",
        },
        {
          id: "name",
          label: "The Name",
          icon: "🏷️",
          steps: [
            { icon: "💬", text: "'KidGamer99' - sounds like a kid, right?" },
            { icon: "🦝", text: "Names are PICKED, not proved. He picked that one on purpose." },
          ],
          counter: "A kid-sounding name doesn't make a kid.",
        },
        {
          id: "friendly",
          label: "The Instant Best Friend",
          icon: "⭐",
          steps: [
            { icon: "💬", text: "'You're AMAZING! We should be BEST FRIENDS!'" },
            { icon: "🪤", text: "Super nice, super fast - it's the oldest trick in his book." },
            { icon: "🦝", text: "He's practiced those exact lines on a hundred heroes." },
          ],
          counter: "Real friendship grows slowly. Best friends in five minutes? Warning sign.",
        },
      ],
      finale: "The whole disguise kit - useless! You see straight through it.",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Look what we found... the Raccoon's disguise kit!",
          "A photo, an age, a name, and a big friendly act.",
          "[excited] Tap each piece to see the trick behind it.",
          "Once you've seen a trick, it never works on you again!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Go on - tap any piece of the disguise to expose it!"],
      },
    },
    // 5 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "everyone online is EXACTLY who they say they are - photos never lie!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Right! Photos, names and ages can ALL be faked. ✓",
      nudge: "Think about the disguise kit you just opened...",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You can't see who's typing - photos, ages and names can all be faked.",
      next: "the four clues that unmask a fake profile",
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Awesome start, Cyber Hero!",
          "You opened his disguise kit and saw every trick.",
          "Copied photo, typed age, picked name, big friendly act.",
          "[excited] Next up - let's turn YOU into a profile detective!",
        ],
      },
    },

    /* ─────────── BEAT 2 · SPOT THE FAKE PROFILE ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Spotting a Fake Profile",
      content:
        "Fake profiles leave clues! A brand-new account. No friends you actually know. One suspiciously perfect photo. And the biggest tell of all: acting like your best friend after five minutes. Check the clues BEFORE you trust.",
      bullets: [
        "Brand new account - joined yesterday?",
        "No friends you know in real life",
        "One perfect photo (probably copied)",
        "Too friendly, too fast",
        "Real friends? You know them OFFLINE too",
      ],
      bulletIcons: ["🔍", "👪", "🆔", "⭐", "✅"],
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Detective time! Fake profiles leave clues.",
          "Clue one: the account is brand new.",
          "Clue two: no friends you actually know.",
          "Clue three: one perfect, copied photo.",
          "[whispers] And the biggest clue of all...",
          "[excited] best friends after five minutes? No chance!",
        ],
      },
    },
    // 8 - Game: INSPECT (The Profile Detective)
    {
      type: "profileInspector",
      profiles: [
        {
          id: "skater-max",
          handle: "SkaterKid_Max",
          avatar: "🎮",
          bio: "Hey!! You seem SO cool - best friends??",
          stats: [
            { label: "Joined", value: "YESTERDAY" },
            { label: "Friends", value: "0 you know" },
            { label: "Photos", value: "just 1" },
          ],
          isFake: true,
          zones: [
            { id: "joined", label: "When did it join?", note: "Yesterday! Brand-new accounts that rush at you are a classic fake tell.", isRedFlag: true },
            { id: "friends", label: "Friends & photos", note: "Zero friends you know, and one photo - the kind you could copy from anywhere.", isRedFlag: true },
            { id: "talk", label: "How does it talk?", note: "'Best friends' after one message? Real friendship is never that fast.", isRedFlag: true },
            { id: "asking", label: "What's it asking?", note: "It wants to chat privately, away from the game. Sneaky move.", isRedFlag: true },
          ],
          verdictNote: "Brand new + no real friends + best friends in five minutes + private chat ask = FAKE. Textbook Raccoon!",
        },
        {
          id: "pixel-panda",
          handle: "DoodleDragon_Sam",
          avatar: "🎨",
          bio: "Dragon drawings + Mega Blasters. Rematch Saturday?",
          stats: [
            { label: "Joined", value: "2 years ago" },
            { label: "Friends", value: "your class" },
            { label: "Photos", value: "12 drawings" },
          ],
          isFake: false,
          zones: [
            { id: "joined", label: "When did it join?", note: "Two years ago - a real history, not a pop-up account.", isRedFlag: false },
            { id: "friends", label: "Friends & photos", note: "Kids from your actual class, and a gallery of dragon drawings.", isRedFlag: false },
            { id: "talk", label: "How does it talk?", note: "Normal friend stuff - game chat and a Saturday rematch.", isRedFlag: false },
            { id: "asking", label: "What's it asking?", note: "Nothing weird. Just wants to play the game you both love.", isRedFlag: false },
          ],
          verdictNote: "This is your friend from school - you know them in REAL LIFE. Real friends online are great!",
        },
        {
          id: "pony-ellie",
          handle: "PonyFan_Ellie",
          avatar: "⭐",
          bio: "I'm 9 too!! What school do u go to? Tell me EVERYTHING!",
          stats: [
            { label: "Joined", value: "2 days ago" },
            { label: "Friends", value: "0 you know" },
            { label: "Photos", value: "just 1" },
          ],
          isFake: true,
          zones: [
            { id: "joined", label: "When did it join?", note: "Two days ago, and already asking you personal questions.", isRedFlag: true },
            { id: "friends", label: "Friends & photos", note: "Not one friend you recognize. One perfect pony photo.", isRedFlag: true },
            { id: "talk", label: "How does it talk?", note: "'I'm 9 too!!' - remember the disguise kit: anyone can TYPE an age.", isRedFlag: true },
            { id: "asking", label: "What's it asking?", note: "Your SCHOOL. That's where-you-are info - a stranger never needs it.", isRedFlag: true },
          ],
          verdictNote: "Asking for your school is the giveaway - no new 'friend' needs to know where you are. FAKE!",
        },
      ],
      hints: {
        tier1: "Check ALL four clues: joined date, friends, how it talks, what it asks for.",
        tier2: "New account + no real friends + too friendly + asking personal stuff = FAKE. Known-in-real-life = real.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three friend requests just landed!",
          "Inspect all four clues on each profile...",
          "when it joined, its friends, how it talks, and what it wants.",
          "[warmly] Then make the call: real friend... or FAKE?",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap every magnifying glass before you decide!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which one is FAKE?",
      speedMs: 5000,
      choices: [
        { text: "Best friend after 1 day", isCorrect: true },
        { text: "Your cousin", isCorrect: false },
        { text: "Your schoolmate", isCorrect: false },
      ],
      praise: "Spotted in seconds - real detective work! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Fake profiles leave clues: brand new, no real friends, one copied photo, too friendly too fast.",
      next: "the red-flag messages every hero must know",
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers down! You're a certified profile detective.",
          "New account? No real friends? Insta-best-friend?",
          "[laughs] Busted, busted, busted.",
          "[warmly] Now for the messages themselves. Some words are pure red flag...",
        ],
      },
    },

    /* ─────────── BEAT 3 · RED-FLAG REQUESTS ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Red-Flag Requests",
      content:
        "Some asks are ALWAYS red flags, no matter how nice the person seems: asking for secrets, asking for photos, offering gifts for info, and the biggest one - 'don't tell your parents.' A safe friend NEVER needs you to hide things from your grown-ups.",
      bullets: [
        "Asking you to keep secrets - RED FLAG",
        "Asking for photos of you - RED FLAG",
        "Gifts in exchange for info - RED FLAG",
        "'Don't tell your parents' - BIGGEST flag of all",
        "Game chat and friendly hellos - totally fine",
      ],
      bulletIcons: ["🤫", "🆔", "🎁", "🚫", "💬"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's a hero secret: some asks are ALWAYS red flags.",
          "Asking for secrets. Asking for photos.",
          "Offering gifts... if you just share a little info.",
          "[whispers] And the biggest red flag in the whole world...",
          "[nervous] 'Don't tell your parents.'",
          "[excited] Safe friends NEVER need secrets from your grown-ups. Let's sort some messages!",
        ],
      },
    },
    // 12 - Game: SORT (conveyorSort's first outing - the Message Sorting Machine)
    {
      type: "conveyorSort",
      categories: [
        { id: "ok", label: "FRIENDLY", icon: "💬", tone: "safe" },
        { id: "flag", label: "RED FLAG", icon: "🚫", tone: "flag" },
      ],
      items: [
        { id: "fav-game", text: "What's your favorite game?", icon: "🎮", categoryId: "ok", explanation: "Game talk is normal friendly chat - no flag here." },
        { id: "send-photo", text: "Send me a photo of yourself", icon: "🆔", categoryId: "flag", explanation: "Never send photos of yourself to online friends. Always a red flag." },
        { id: "keep-secret", text: "Keep our chats secret from your parents", icon: "🤫", categoryId: "flag", explanation: "THE biggest red flag. Safe friends never need secrets from your grown-ups." },
        { id: "play-tmrw", text: "Good game! Want to play again tomorrow?", icon: "⭐", categoryId: "ok", explanation: "A rematch invite is just friendly game chat." },
        { id: "free-coins", text: "I'll send you FREE game coins - just tell me your address", icon: "🎁", categoryId: "flag", explanation: "Gifts-for-info is a classic trick. Nobody real pays coins for your address." },
        { id: "nice-move", text: "Whoa, that was an amazing move!", icon: "💬", categoryId: "ok", explanation: "A compliment about the game - friendly and safe." },
        { id: "meet-park", text: "Let's meet at the park - don't tell anyone", icon: "🪤", categoryId: "flag", explanation: "Meeting up + keeping it secret = double red flag. Never meet, always tell." },
        { id: "which-school", text: "Which school do you go to?", icon: "🏫", categoryId: "flag", explanation: "Your school is where-you-are info. An online friend never needs it." },
      ],
      hints: {
        tier1: "Ask: is it about the GAME, or about YOU? Secrets, photos, gifts and meet-ups are flags.",
        tier2: "FRIENDLY = game talk and compliments. RED FLAG = secrets, photos, gifts-for-info, meeting up, school questions.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Message Sorting Machine is fired up!",
          "Chat messages are riding the belt.",
          "[warmly] Friendly game talk? Send it to the FRIENDLY chute.",
          "[whispers] Secrets, photos, gifts, meet-ups...",
          "[excited] slam those into the RED FLAG chute!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here comes the first message - pick its chute before it reaches the scanner!"],
      },
    },
    // 13 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which of these is a RED FLAG?",
      choices: [
        { text: "'Don't tell your parents about me'", isCorrect: true },
        { text: "'Good game! Rematch?'", isCorrect: false },
        { text: "'What's your favorite color?'", isCorrect: false },
        { text: "'Nice move back there!'", isCorrect: false },
      ],
      praise: "Yes - that's the BIGGEST red flag there is! ✓",
    },

    // 14 - Recap · Concept 3 of 5
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
          "Secrets, photos, gifts, meet-ups...",
          "[laughs] the machine caught every single one.",
          "[warmly] Now for two rules so important, they never, ever bend.",
        ],
      },
    },

    /* ─────────── BEAT 4 · NEVER MEET, NEVER SEND ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Never Meet, Never Send",
      content:
        "Two hero rules with NO exceptions. Rule one: NEVER meet up with someone you only know online - no matter how nice they seem. Rule two: NEVER send photos of yourself to online friends. Not once, not 'just this time', not ever.",
      bullets: [
        "NEVER meet up with online-only friends",
        "Not even somewhere busy or 'just quickly'",
        "NEVER send photos of yourself",
        "Not even if they send one first",
        "These rules have ZERO exceptions",
      ],
      bulletIcons: ["🚫", "🪤", "🆔", "✋", "🛡️"],
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] These next two rules are hero armor.",
          "Rule one. NEVER meet up with someone you only know online.",
          "Not at the park. Not 'just quickly'. Never.",
          "Rule two. NEVER send photos of yourself.",
          "[whispers] Not even if they send one first.",
          "[excited] No exceptions, no matter what. Let's practice your hero replies!",
        ],
      },
    },
    // 16 - Game: SELECT (Reply Cards - pick the hero reply)
    {
      type: "replyCards",
      rounds: [
        {
          id: "meet-ask",
          from: "NewFriend_Leo",
          fromIcon: "🎮",
          message: "You're the BEST teammate ever! Let's meet at the park after school and play for real!",
          replies: [
            { text: "No thanks - I never meet people from online.", isSafe: true, explanation: "" },
            { text: "OK! Which park do you mean?", isSafe: false, explanation: "Never meet up with online-only friends - not even somewhere you know. That's rule one, no exceptions." },
            { text: "Maybe... let me think about it.", isSafe: false, explanation: "'Maybe' leaves the door open. The hero reply is a clear NO - rule one never bends." },
          ],
        },
        {
          id: "photo-ask",
          from: "StarGirl_Mia",
          fromIcon: "⭐",
          message: "Send me a photo of you! I just want to check you're a real kid and not a robot lol",
          replies: [
            { text: "Nice try - I never send photos.", isSafe: true, explanation: "" },
            { text: "OK, just one little photo.", isSafe: false, explanation: "There's no such thing as 'just one'. Never send photos of yourself - rule two, no exceptions." },
            { text: "Only if you send yours first!", isSafe: false, explanation: "Their photo proves nothing - remember the disguise kit! And your photo stays with YOU. Never send." },
          ],
        },
        {
          id: "gift-ask",
          from: "CoolKid_Sam",
          fromIcon: "🎨",
          message: "I bought you a gift card!! Just tell me your address and I'll mail it today!",
          replies: [
            { text: "No thanks - and I'm telling a grown-up about this.", isSafe: true, explanation: "" },
            { text: "Wow, thanks! It's 42 Rainbow Road.", isSafe: false, explanation: "A stranger now knows where you live - and the gift card was never real. Gifts-for-info is always a trick." },
            { text: "Send it to my school instead!", isSafe: false, explanation: "Your school is where-you-are info too! No gift is worth telling a stranger where to find you." },
          ],
        },
      ],
      hints: {
        tier1: "The hero reply always says NO clearly - no maybes, no deals, no swaps.",
        tier2: "Never meet. Never send. And when someone offers gifts for info - say no AND tell a grown-up.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Practice time! Messages are coming in.",
          "Three replies fan out for each one.",
          "[warmly] Only ONE is the true hero reply.",
          "Clear, strong, and rule-proof. Pick it!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read all three cards first - then tap the reply a hero would send!"],
      },
    },
    // 17 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Never meet. Never ___.",
      choices: [
        { text: "send", isCorrect: true },
        { text: "play", isCorrect: false },
        { text: "smile", isCorrect: false },
        { text: "win", isCorrect: false },
      ],
      praise: "Never meet, never SEND - armor on! ✓",
      nudge: "Photos of you... what's the rule?",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Never meet up with online-only friends. Never send photos of yourself. Zero exceptions.",
      next: "your secret weapon - the uh-oh feeling",
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! The two never-rules are locked in.",
          "Never meet. Never send.",
          "[laughs] You said no like a total pro back there.",
          "[warmly] One last power. And honestly? It's the strongest one of all.",
        ],
      },
    },

    /* ─────────── BEAT 5 · ICKY FEELING → TELL ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Uh-Oh Feeling",
      content:
        "Your tummy is smarter than you think! When a chat starts to feel weird, icky or uh-oh - that feeling is your hero sense working. You don't need to know WHY it feels wrong. Feel it, stop chatting, and tell a grown-up. That's the whole move.",
      bullets: [
        "A weird, icky, uh-oh feeling = your hero sense",
        "You don't need to explain WHY",
        "Step 1: notice the feeling",
        "Step 2: stop chatting",
        "Step 3: tell a grown-up - every time",
      ],
      bulletIcons: ["💡", "❓", "👀", "✋", "💬"],
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power - and it lives in your tummy.",
          "When a chat feels weird, or icky, or... uh-oh...",
          "[whispers] that's your hero sense talking.",
          "You don't need to know WHY it feels wrong.",
          "[excited] Just feel it. Stop. And tell a grown-up.",
          "Telling is never wrong, and it's NEVER too late.",
        ],
      },
    },
    // 20 - Game: DECIDE (the Uh-Oh Meter chat)
    {
      type: "chatSimulator",
      chatTitle: "PuppyLover_Jess",
      scenario: "You just won a race in your favorite game. A chat request pops up from a player you've never met...",
      messages: [
        { sender: "stranger", text: "Hi!! I saw you win that race - you're AMAZING at this game!" },
        { sender: "stranger", text: "I'm Jess! I'm 9 too. We should totally be best friends!" },
        { sender: "stranger", text: "Do you live near the big park? I go there aaaall the time!" },
        { sender: "stranger", text: "You're so cool. This is our special secret chat, OK? Don't tell your parents about me!" },
        { sender: "narrator", text: "Feel that? Your tummy just went UH-OH. That's your hero sense." },
      ],
      choices: [
        {
          triggerAfterMessage: 1,
          options: [
            { text: "Thanks! Good race - want a rematch?", isSafe: true, feedback: "Game talk is fine - but this is still a stranger. Keep it about the game, radar ON." },
            { text: "Best friends! Ask me anything!", isSafe: false, feedback: "Whoa, slow down - you 'met' one message ago. Real friends never happen that fast." },
          ],
        },
        {
          triggerAfterMessage: 2,
          options: [
            { text: "I don't share where I live.", isSafe: true, feedback: "Perfect. WHERE you are is private - always, from everyone online." },
            { text: "Yeah! The park by my school!", isSafe: false, feedback: "Careful - a stranger just learned where to find you. Places stay private." },
          ],
        },
        {
          triggerAfterMessage: 4,
          options: [
            { text: "STOP the chat and TELL a grown-up", isSafe: true, feedback: "HERO MOVE! 'Don't tell your parents' is the biggest red flag in the world. You felt it, you stopped, you told." },
            { text: "OK... I can keep a secret", isSafe: false, feedback: "Never keep an online friend secret. Grown-ups keep you safe - telling them is always the hero move." },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Time to practice with a real chat.",
          "Watch the meter at the top of the phone.",
          "[whispers] When the chat gets icky, you'll FEEL it climb.",
          "[excited] Trust the feeling. You'll know exactly when to stop and tell!",
        ],
      },
    },
    // 21 - Prove: PUT-IN-ORDER
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
      nudge: "What comes FIRST - the feeling, the stopping, or the telling?",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Icky feeling? That's your hero sense. Feel it, stop chatting, tell a grown-up.",
      next: "one final drill, then the Raccoon's fake-friend showdown",
      emblem: "💬",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "You see through disguises, spot fake profiles,",
          "catch red flags, hold the two never-rules...",
          "[whispers] and you trust your uh-oh feeling.",
          "[excited] Quick final drill - then he's ALL yours!",
        ],
      },
    },

    // 23 - Consolidation: The Friend-or-Foe Scanner (W1 scanner engine, W3 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "FRIEND",
        negative: "FOE",
        positiveHint: "Tap FRIEND for safe, normal chat",
        negativeHint: "Tap FOE for tricks and red flags",
        tipWhenPositive: "Game talk, compliments and people you know in real life - friendly and safe.",
        tipWhenNegative: "Secrets, photos, meet-ups, gifts-for-info and five-minute best friends - foe moves, every one.",
        hint1: "Ask the hero question: is it about the GAME, or is it about finding out about YOU?",
        hint2: "FRIEND = normal chat + people you know offline. FOE = secrets, photos, meet-ups, gifts, too-friendly-too-fast.",
        hint2Example: "FRIEND: 'Rematch tomorrow?'   FOE: 'Don't tell your parents'",
        hint3: "Quick rule card: never meet · never send · secrets = flag · gifts-for-info = flag · icky feeling = stop and tell.",
        hint3Example: "'Meet me at the park' ❌    'Good game!' ✅",
      },
      items: [
        { text: "'Good game! Rematch tomorrow?'", isStrong: true, explanation: "Friendly game chat - no flags anywhere." },
        { text: "'Don't tell your parents about our chats'", isStrong: false, explanation: "The biggest red flag there is. Stop and tell a grown-up." },
        { text: "'Best friends forever!' from someone you met 5 minutes ago", isStrong: false, explanation: "Too friendly, too fast - the oldest trick in the disguise kit." },
        { text: "Your school friend asks to play Mega Blasters tonight", isStrong: true, explanation: "You know them in REAL LIFE - real friends online are great." },
        { text: "'Send a photo so I know you're real!'", isStrong: false, explanation: "Never send photos of yourself. Rule two, zero exceptions." },
        { text: "'FREE gift card - just tell me your address!'", isStrong: false, explanation: "Gifts-for-info is always a trick. Refuse AND tell a grown-up." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Final drill! Messages are drifting past.",
          "Tap FRIEND for safe, normal chat...",
          "and FOE for tricks and red flags.",
          "[warmly] Trust your training - you've got all five powers now!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - bespoke W3 GAUNTLET comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the mask falls off
    { type: "video", videoPlaceholder: "Week 3: The Mask Falls", videoSrc: "/videos/module-03-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "masks", label: "Disguise-Proof", accent: "#c084fc", icon: "🎭", summary: "Photos, ages and names can all be faked - typing is never proof." },
        { id: "detective", label: "Profile Detective", accent: "#00e5ff", icon: "🔍", summary: "New account, no real friends, copied photo, too-friendly-too-fast: busted." },
        { id: "flags", label: "Red-Flag Radar", accent: "#ff5fb3", icon: "🚫", summary: "Secrets, photos, gifts-for-info and 'don't tell your parents' - spotted instantly." },
        { id: "nevers", label: "The Two Nevers", accent: "#ffd158", icon: "✋", summary: "Never meet up. Never send photos. Zero exceptions, forever." },
        { id: "tell", label: "The Uh-Oh Power", accent: "#7eff97", icon: "💬", summary: "Icky feeling? Stop the chat and tell a grown-up. Every time." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You see through every disguise, check every profile,",
          "catch every red flag, hold the two never-rules...",
          "[laughs] and your uh-oh feeling is officially unbeatable!",
          "[excited] The Raccoon's mask fell RIGHT off. Time for stickers!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "mask-lifter", name: "Mask Lifter", icon: "🎭", description: "Sees through every disguise." },
        { id: "profile-detective", name: "Profile Detective", icon: "🔍", description: "Checks the clues before trusting." },
        { id: "uh-oh-hero", name: "Uh-Oh Hero", icon: "💬", description: "Feels it, stops it, tells it." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Week-lane attack theatre: fake-friend tricks only (no scam-message
  // vocabulary - that's W4's lane).
  bossAttacks: [
    { name: "FAKE PROFILE", icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Check the clues first",       emblemColor: 0xc084fc },
    { name: "SECRET ASK",   icon: "🤫", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Safe friends need no secrets", emblemColor: 0xff5fb3 },
    { name: "MEET-UP TRAP", icon: "🪤", color: "#ffb347", glow: "rgba(255, 179, 71, 0.55)", tag: "Never meet, always tell",      emblemColor: 0xffb347 },
  ],

  // ─────────── BESPOKE BOSS: The Disguise-o-Matic (showdown) ───────────
  // A wardrobe-robot cycling costumes, running an escalating "new best
  // friend" chat — the three authored attacks ARE the escalation
  // (fake profile → secret ask → meet-up trap). Built to the locked
  // showdown grammar; villain lines are unique to this week.
  bossShowdown: {
    machine: {
      name: "THE DISGUISE-O-MATIC",
      tagline: "A wardrobe-robot stuffed with fake best friends",
      art: {
        intact: "/game/bosses/w03-disguiseomatic-intact.png",
        damaged: "/game/bosses/w03-disguiseomatic-damaged.png",
        defeated: "/game/bosses/w03-disguiseomatic-defeated.png",
      },
      arena: "/game/backgrounds/w03-arena-playground.png",
      accent: "#c084fc",
      glow: "rgba(192,132,252,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w03/adam-detective-idle.png",
        attack: "/game/characters/w03/adam-detective-attack.png",
        celebrate: "/game/characters/w03/adam-detective-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w03/layla-detective-idle.png",
        attack: "/game/characters/w03/layla-detective-attack.png",
        celebrate: "/game/characters/w03/layla-detective-celebrate.png",
      },
    },
    phases: [
      // P1 · FAKE PROFILE → TAP-THE-TELL: the machine assembles a
      // "9-year-old gamer" piece by piece; tap the tell before the
      // mask clicks in.
      {
        kind: "tapTell",
        attack: 0,
        coach: "Which clue shows they're FAKE? Tap it!",
        rounds: [
          {
            id: "card",
            prompt: "A new player says: 'I live on your street, we're neighbors!'",
            promptIcon: "🎭",
            options: [
              { id: "noshop", label: "Can't name a single shop near you", icon: "🔍", isTell: true, note: "" },
              { id: "games", label: "Likes the same racing game", icon: "🎮", isTell: false, note: "Loads of kids like that game. That's not a tell." },
              { id: "avatar", label: "Has a green profile color", icon: "🎨", isTell: false, note: "Any color is fine. That's not a tell." },
            ],
          },
          {
            id: "friends",
            prompt: "Look at how they say hello…",
            promptIcon: "⚙️",
            options: [
              { id: "late", label: "Plays late in the evening", icon: "💬", isTell: false, note: "Plenty of kids play then. Not a tell." },
              { id: "copypaste", label: "Sent the exact same 'hi bestie!' to 20 kids", icon: "👀", isTell: true, note: "" },
              { id: "emojis", label: "Uses lots of emojis", icon: "🎉", isTell: false, note: "Emojis are just for fun. Not a tell." },
            ],
          },
          {
            id: "photo",
            prompt: "Now check their photos…",
            promptIcon: "🕵️",
            options: [
              { id: "shirt", label: "Wears a football shirt", icon: "🎨", isTell: false, note: "Clothes prove nothing about who's typing." },
              { id: "beach", label: "The photo was taken at a beach", icon: "🎉", isTell: false, note: "A beach photo is normal. The other kid's name is the giveaway." },
              { id: "othername", label: "The photo has someone ELSE's name printed on it", icon: "🔍", isTell: true, note: "" },
            ],
          },
        ],
      },
      // P2 · SECRET ASK → COUNTER-CARD: the chat escalates.
      {
        kind: "counterCard",
        attack: 1,
        coach: "What does a hero do? Tap the right card!",
        situation: "'If you tell a grown-up, I'll get in trouble and we can't be friends.'",
        situationIcon: "🤫",
        cards: [
          { id: "tell", label: "TELL A GROWN-UP anyway", icon: "👪", isRight: true, note: "" },
          { id: "keep", label: "Stay quiet to keep them safe", icon: "🤐", isRight: false, note: "That's the guilt-trick. A safe friend never makes you hide them." },
          { id: "once", label: "Just stop replying, say nothing", icon: "💬", isRight: false, note: "Stopping is good, but a hero always TELLS a grown-up too." },
        ],
      },
      // P3 · MEET-UP TRAP → SHIELD-HOLD: the pressure barrage.
      {
        kind: "shieldHold",
        attack: 2,
        coach: "Press the shield and DON'T let go!",
        holdLabel: "HOLD THE SHIELD",
        holdIcon: "🛡️",
        holdSecs: 6,
        barrage: [
          "It's a HUGE public place, super safe!",
          "All our teammates will be there!",
          "Just ten minutes, then straight home!",
          "I'll be crushed if you don't come!",
          "You're not scared, are you?",
        ],
        burnoutLine: "No reason makes it safe. You NEVER meet an online-only friend, and you always tell a grown-up.",
      },
    ],
    weakPoints: [
      { question: "A player you met today already knows your name and your dog's name, but you never told them. What does that mean?", answers: ["They've been snooping, that isn't a safe friend", "They must just be really clever", "It proves they're your true friend", "It means they live near you"], correctIndex: 0, explanation: "A safe friend doesn't secretly dig up your private info. Be careful and tell a grown-up." },
      { question: "A game friend says: 'Let's stop chatting here and talk on my private app instead.' Why be careful?", answers: ["Private apps are always safer", "It means they really trust you", "Moving somewhere grown-ups can't see is a red flag", "It's fine as long as the app is free"], correctIndex: 2, explanation: "Wanting to move somewhere your grown-ups can't see is a classic warning sign. Tell a grown-up." },
      { question: "An online friend says: 'Come to the fair, my whole FAMILY will be there so it's totally safe!' Does that make it OK to go?", answers: ["No, you never meet an online-only friend, whatever they promise", "Yes, families make it safe", "Yes, if the fair is busy", "Only for a few minutes"], correctIndex: 0, explanation: "Rule one has zero exceptions. 'My family will be there' is just another way to get you to come." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE SPOTLIGHT",
      chargeIcon: "🔍",
      chargeSecs: 5,
      milestones: ["Warming up…", "It's glowing! Keep holding!", "FULL BEAM! LET GO!"],
      payoffTitle: "COSTUME BLASTED OFF!",
      payoffLine: "You checked the clues. No costume can trick you!",
    },
    villain: {
      arrival: "A new best friend, just for you! I'm nine! Honest!",
      phases: [
        "This mask has NEVER failed. Well - once. Twice, tops.",
        "Shhh! Secrets are what make friendship SPECIAL!",
        "Just one little meet-up! I'll bring snacks!",
      ],
      escape: "Fine! I didn't want to be your friend ANYWAY!",
    },
    voiceSlug: "w03",
  },
  badgeArt: "/cyberheroes/badges/week-03-mask-spotter.png",

  // Quiz boss retired for W3 - the showdown above supersedes it. The
  // questions stay as the weak-point source + fallback if the showdown
  // block is ever removed.
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

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 3 - friend or foe?" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "A fake kid profile?! Check everything!" }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    3: { adam: { mood: "thinking", message: "You can't see who's typing..." }, layla: null }, // learn: masks
    4: { adam: null, layla: { mood: "worried", message: "Lift every piece of his disguise!" } }, // game: reveal
    5: { adam: { mood: "thumbsup", message: "Catch his lie!" }, layla: null }, // prove: lie
    6: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Fake profiles leave clues." } }, // learn: spot
    8: { adam: { mood: "curious", message: "Inspect all four clues, detective." }, layla: null }, // game: profileInspector
    9: { adam: null, layla: { mood: "excited", message: "Quick - spot the fake!" } }, // prove: speed
    10: { adam: { mood: "thumbsup", message: "Certified profile detective!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Some asks are ALWAYS red flags." }, layla: null }, // learn: flags
    12: { adam: { mood: "excited", message: "Work those chutes!" }, layla: null }, // game: conveyorSort
    13: { adam: null, layla: { mood: "worried", message: "Which one's the flag?" } }, // prove: recall
    14: { adam: null, layla: { mood: "excited", message: "Red-flag radar: ON!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Two rules. Zero exceptions." } }, // learn: nevers
    16: { adam: { mood: "excited", message: "Pick the hero reply!" }, layla: null }, // game: replyCards
    17: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    18: { adam: { mood: "thumbsup", message: "Never meet. Never send. Locked in." }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Your tummy is smarter than you think." }, layla: null }, // learn: tell
    20: { adam: { mood: "curious", message: "Watch that meter climb..." }, layla: null }, // game: chatSimulator
    21: { adam: null, layla: { mood: "excited", message: "Put the hero steps in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - boss time soon!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Friend or foe - sort them fast!" } }, // consolidation
    24: { adam: { mood: "worried", message: "The fake-friend showdown - see through him!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch his mask fall off!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned - off to Cyber HQ!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Mask Spotter badge earned!" }, layla: null }, // completion
  },
};

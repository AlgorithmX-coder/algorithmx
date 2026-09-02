/**
 * Block 2 · Case 008 "The Perfect Message", GHOSTWRITER ①, for THE PHONE runtime.
 *
 * Same framework (7 skills LEARN -> PRACTICE, blind boss, must-pass test); a
 * different game again (§0). GHOSTWRITER writes with a machine: flawless, warm,
 * personal-looking lures at scale. So the signature moves are: polish proves
 * nothing -> spot the clues a machine still leaks (warmth without history) ->
 * verify by SOURCE not style -> predict the ask. Boss = "The Pen Pal".
 *
 * SAFEGUARDING (curriculum §5 M08 + §11, BINDING): the pen-pal is framed strictly
 * as a SCAM (it wants money / a game card / a code / secrecy), never a relationship
 * or romance; no grooming depiction; every sensitive beat exits to "tell an adult".
 * Needs RSHE/safeguarding sign-off before market.
 */

import type { PhoneCase } from "./case06";

export const case08Phone: PhoneCase = {
  id: "explorers-m08",
  caseNumber: "CASE 008",
  title: "The Perfect Message",
  actor: "GHOSTWRITER",
  app: { name: "Glint", accent: "#FF7A4D", wall: "radial-gradient(130% 90% at 50% 0%, #2a1710 0%, #0d0b0a 62%)" },
  open: [
    "New case, Agent. This villain is called GHOSTWRITER, and GHOSTWRITER doesn't type. It uses a machine.",
    "Everything you were taught about spotting scams, bad spelling, dodgy grammar, is out of date. AI now writes perfect, warm, friendly messages by the thousand, each one tweaked to feel like it was made just for you.",
    "Seven skills to beat a machine that never makes a typo, then a boss and a test. The trick isn't spotting mistakes any more. It's something better.",
  ],
  openVoice: [
    "/audio/wren/m08p-open-1.mp3",
    "/audio/wren/m08p-open-2.mp3",
    "/audio/wren/m08p-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · Polish proves nothing ============ */
    {
      n: 1,
      title: "Polish proves nothing",
      goal: "Perfect spelling used to reveal a scam. Not any more. Learn why.",
      who: "unknown sender",
      avatar: "?",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "Here's what's changed. You were taught that scams have bad spelling and clumsy grammar. That was true, once. But a machine now writes flawless, friendly messages by the thousand. So perfect writing, good grammar, no typos, proves absolutely nothing any more. A message with zero mistakes can still be a total trap.", voice: "/audio/wren/m08p-s1-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "Hi! I noticed we go to the same school and thought you seemed really cool. Would love to chat and get to know you! 😊" },
        {
          t: "choose",
          prompt: "This message is perfectly written. So is it safe?",
          options: [
            { label: "No, perfect writing proves nothing now", outcome: "good", then: [{ t: "wren", text: "Right. It's tidy, it's friendly, it has no typos, and none of that tells you a single thing about whether it's real. Polish is exactly what the machine is good at. Stop using it as your safety check.", voice: "/audio/wren/m08p-s1-ok.mp3" }] },
            { label: "Yes, real scams always have typos", outcome: "bad", then: [{ t: "wren", text: "That used to be true, but the machine changed it. A flawless message is now just as likely to be a scam as a messy one. Try again.", voice: "/audio/wren/m08p-s1-bad.mp3" }] },
            { label: "Yes, it's too neat and friendly to be fake", outcome: "bad", then: [{ t: "wren", text: "Neat and friendly is what a machine does best, it's the disguise, not proof of safety. Try again.", voice: "/audio/wren/m08p-s1-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "Hello! I hope you're having a lovely day. I came across your profile and honestly your posts are brilliant. I would really love to chat! 😊", ask: true },
        {
          t: "choose",
          prompt: "Not one typo, perfect grammar. What does that tell you about it?",
          options: [
            { label: "Nothing about safety, flawless writing is what the machine does best", outcome: "good", then: [{ t: "wren", text: "Correct. Zero mistakes is easy for a machine and tells you nothing. Judge it some other way.", voice: "/audio/wren/m08p-s1-q2ok.mp3" }] },
            { label: "It reads too well to be a scam", outcome: "bad", then: [{ t: "wren", text: "Reading well is free now, a machine never fumbles a word. Polish is not a safety check. Try again.", voice: "/audio/wren/m08p-s1-q2bad.mp3" }] },
            { label: "Good grammar means a real adult wrote it", outcome: "bad", then: [{ t: "wren", text: "A machine writes better grammar than most adults. Perfect writing points to nobody. Try again.", voice: "/audio/wren/m08p-s1-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Your old rule was scams always have bad spelling. Why does that rule fail now?",
          options: [
            { label: "A machine writes flawless messages, so typos stopped being a clue", outcome: "good", then: [{ t: "wren", text: "Exactly. The tell you relied on is gone. Perfect and messy are both equally likely to be traps.", voice: "/audio/wren/m08p-s1-q3ok.mp3" }] },
            { label: "It doesn't fail, typos still catch every scam", outcome: "bad", then: [{ t: "wren", text: "Not any more. The best scams now have zero typos. That old rule will let them straight past. Try again.", voice: "/audio/wren/m08p-s1-q3bad.mp3" }] },
            { label: "It fails because scammers stopped sending messages", outcome: "bad", then: [{ t: "wren", text: "They send more than ever, just cleaner ones. The rule fails because the writing got perfect. Try again.", voice: "/audio/wren/m08p-s1-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 2 · Written for everyone ============ */
    {
      n: 2,
      title: "Written for everyone",
      goal: "One machine sends thousands of 'personal' messages at once. Learn the scale.",
      who: "unknown sender",
      avatar: "?",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "Here's why this matters so much. A machine doesn't get tired. GHOSTWRITER can send the same warm, personal-sounding message to ten thousand kids at once, each one auto-filled with your name and your favourite game. It feels like it was written just for you. It wasn't. It was written for everyone.", voice: "/audio/wren/m08p-s2-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "Hey [YOUR NAME]! Saw you love Fortnite too 🎮 I hardly ever meet people as into it as me. We'd totally get on!" },
        {
          t: "choose",
          prompt: "It knows your name and your favourite game. What does that prove?",
          options: [
            { label: "Nothing, a machine can look those up and slot them in", outcome: "good", then: [{ t: "wren", text: "Exactly. Your name and your game are on your profile for anyone, human or machine, to grab. Feeling 'known' by a stranger is the trick, not the proof. It just means it did its homework.", voice: "/audio/wren/m08p-s2-ok.mp3" }] },
            { label: "It's really from someone who knows me", outcome: "bad", then: [{ t: "wren", text: "Knowing your name and game proves nothing, that's all public. A machine slots those in automatically to feel personal. Try again.", voice: "/audio/wren/m08p-s2-bad.mp3" }] },
            { label: "It must be a friend from school", outcome: "bad", then: [{ t: "wren", text: "A real school friend wouldn't need to introduce themselves like a stranger. The 'personal' details are just filled in from your profile. Try again.", voice: "/audio/wren/m08p-s2-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "Hi [YOUR NAME]! Saw you're in Year 7 and love drawing 🎨 finally someone who gets me! let's be mates!", ask: true },
        {
          t: "choose",
          prompt: "It's filled in with details that fit you exactly. What's really happening?",
          options: [
            { label: "The same message goes to thousands, each auto-filled from public profiles", outcome: "good", then: [{ t: "wren", text: "That's it. Your year and your hobby are on your profile for anyone to grab and slot in. It feels aimed at you, it isn't.", voice: "/audio/wren/m08p-s2-q2ok.mp3" }] },
            { label: "It was written just for me by hand", outcome: "bad", then: [{ t: "wren", text: "No hand needed. A machine drops your details in automatically and sends it to thousands at once. Try again.", voice: "/audio/wren/m08p-s2-q2bad.mp3" }] },
            { label: "Only a real friend would know I like drawing", outcome: "bad", then: [{ t: "wren", text: "Your hobbies are public, anyone can read them. That detail proves nothing. Try again.", voice: "/audio/wren/m08p-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Your friend got a message word for word like yours, but with their name and their game. What does that tell you?",
          options: [
            { label: "It's a mass message, one machine sent it to loads of kids at once", outcome: "good", then: [{ t: "wren", text: "Right. Same template, different names slotted in. If two of you got the 'personal' message, so did thousands.", voice: "/audio/wren/m08p-s2-q3ok.mp3" }] },
            { label: "A coincidence, both are genuine", outcome: "bad", then: [{ t: "wren", text: "Word for word identical is no coincidence. That's one machine blasting the same lure at everyone. Try again.", voice: "/audio/wren/m08p-s2-q3bad.mp3" }] },
            { label: "The scammer must know you both in real life", outcome: "bad", then: [{ t: "wren", text: "It doesn't know either of you, it just filled in your names. The matching text gives it away. Try again.", voice: "/audio/wren/m08p-s2-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · Warmth without history ============ */
    {
      n: 3,
      title: "Warmth without history",
      goal: "Machines fake warmth, but not real shared history. Learn the clue.",
      who: "unknown sender",
      avatar: "?",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "So if polish and personal details prove nothing, what CAN you notice? Clues, not proof, clues. A machine gives you warmth with no real history. It's your 'best friend' when you've barely spoken. Huge feelings, all at once, with nothing real behind them. When someone is super close super fast, that's your clue to slow right down.", voice: "/audio/wren/m08p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "honestly you're the only person who really GETS me, i feel like i've known you forever 💛 i trust you more than anyone" },
        {
          t: "choose",
          prompt: "You started chatting two days ago. What's the clue here?",
          options: [
            { label: "Huge closeness with no real history behind it", outcome: "good", then: [{ t: "wren", text: "That's the clue. Real closeness takes real time and real shared moments. Instant, intense 'you're my best friend' from a near-stranger is a machine turning up the warmth dial. Slow down.", voice: "/audio/wren/m08p-s3-ok.mp3" }] },
            { label: "They're just a really friendly person", outcome: "bad", then: [{ t: "wren", text: "Friendly is fine. 'I've known you forever' after two days is not friendly, it's fake history. That mismatch is the clue. Try again.", voice: "/audio/wren/m08p-s3-bad.mp3" }] },
            { label: "Their spelling is perfect, so they're genuine", outcome: "bad", then: [{ t: "wren", text: "We just learned that, polish proves nothing. Look at the mismatch instead: huge closeness, no time behind it. Try again.", voice: "/audio/wren/m08p-s3-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "i've NEVER clicked with anyone this fast 💕 you already feel like my closest friend, we're gonna be inseparable", ask: true },
        {
          t: "choose",
          prompt: "You started talking yesterday. What stands out?",
          options: [
            { label: "Massive closeness with no shared history yet", outcome: "good", then: [{ t: "wren", text: "That's the clue. Real 'closest friend' takes real time. Instant and intense from a near-stranger is the warmth dial turned up. Slow down.", voice: "/audio/wren/m08p-s3-q2ok.mp3" }] },
            { label: "Some people just bond really fast", outcome: "bad", then: [{ t: "wren", text: "A little, maybe. 'Inseparable' after one day is not bonding, it's fake history. That gap is the clue. Try again.", voice: "/audio/wren/m08p-s3-q2bad.mp3" }] },
            { label: "The heart emojis prove they mean it", outcome: "bad", then: [{ t: "wren", text: "Emojis are free, a machine adds them by the handful. Look at the mismatch, huge feelings, no time. Try again.", voice: "/audio/wren/m08p-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A machine can fake warm words easily. What's the one thing it can't fake?",
          options: [
            { label: "Real shared history, actual time and moments with you", outcome: "good", then: [{ t: "wren", text: "Exactly. Kind words are cheap. A real past together is not, and that's what a fast, gushing stranger is missing.", voice: "/audio/wren/m08p-s3-q3ok.mp3" }] },
            { label: "Kind words, it's bad at those", outcome: "bad", then: [{ t: "wren", text: "Kind words are the machine's specialty. What it can't fake is real history together. Try again.", voice: "/audio/wren/m08p-s3-q3bad.mp3" }] },
            { label: "Emojis, only real friends use them", outcome: "bad", then: [{ t: "wren", text: "Anyone can paste emojis, machines love them. The real gap is shared history. Try again.", voice: "/audio/wren/m08p-s3-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · Verify by source, not style ============ */
    {
      n: 4,
      title: "Verify by source, not style",
      goal: "Style proves nothing, so check WHO it's really from.",
      who: "unknown sender",
      avatar: "?",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "Here's the rule that beats all of it, and you met it last case: verify by SOURCE, not by style. You can't trust a message because it reads well or feels warm, the machine controls those completely. You trust it only once you've checked WHO it's really from, a different way. Style is what the machine owns. The source is what it can't fake.", voice: "/audio/wren/m08p-s4-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "hey it's Liam from footy! got a new account. can you do me a quick favour? 🙏", ask: true },
        {
          t: "choose",
          prompt: "It sounds friendly and real. What do you do?",
          options: [
            { label: "Check who it really is a different way, before anything", outcome: "good", then: [{ t: "wren", text: "That's it. Sounding real is free, a machine does it in a second. Message the real Liam on a channel you already trust, or ask him in person. Verify the source, ignore the style.", voice: "/audio/wren/m08p-s4-ok.mp3" }] },
            { label: "Trust it, it sounds genuine", outcome: "bad", then: [{ t: "wren", text: "'Sounds genuine' is exactly what the machine is built to do. You can't verify by how it reads. Check the source instead. Try again.", voice: "/audio/wren/m08p-s4-bad.mp3" }] },
            { label: "Reply here asking 'are you really Liam?'", outcome: "bad", then: [{ t: "wren", text: "Whoever's on that account will just say yes. You have to check on a DIFFERENT channel they don't control. Try again.", voice: "/audio/wren/m08p-s4-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "hiya it's your cousin Maya!! lost my old phone so this is my new number 📱 add me back?", ask: true },
        {
          t: "choose",
          prompt: "It really sounds like your cousin. How do you check?",
          options: [
            { label: "Reach the real Maya a way you already trust before adding", outcome: "good", then: [{ t: "wren", text: "Perfect. Ring the number you already have for her, or ask family. Verify the source, don't trust the sound of it.", voice: "/audio/wren/m08p-s4-q2ok.mp3" }] },
            { label: "Add them, it sounds just like her", outcome: "bad", then: [{ t: "wren", text: "Sounding like her is easy to fake. Check on a channel you already trust before you add anyone. Try again.", voice: "/audio/wren/m08p-s4-q2bad.mp3" }] },
            { label: "Reply here asking 'is this really you Maya?'", outcome: "bad", then: [{ t: "wren", text: "Whoever holds that account will just say yes. You have to check a different way they don't control. Try again.", voice: "/audio/wren/m08p-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Two things about a message: how well it's written, and who it's really from. Which can you actually trust?",
          options: [
            { label: "Who it's really from, checked a different way, style can be faked", outcome: "good", then: [{ t: "wren", text: "Right. The machine owns the style completely. The source is the part it can't fake, so that's the part you check.", voice: "/audio/wren/m08p-s4-q3ok.mp3" }] },
            { label: "How well it's written, good writing means safe", outcome: "bad", then: [{ t: "wren", text: "Good writing is exactly what the machine controls. It's no proof at all. Check the source instead. Try again.", voice: "/audio/wren/m08p-s4-q3bad.mp3" }] },
            { label: "Both are equally reliable", outcome: "bad", then: [{ t: "wren", text: "Only one is, the source. Style is free to fake. Never let good writing stand in for a real check. Try again.", voice: "/audio/wren/m08p-s4-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Predict the ask ============ */
    {
      n: 5,
      title: "Predict the ask",
      goal: "A warm persona builds trust, then asks. Learn to see the ask coming.",
      who: "unknown sender",
      avatar: "?",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "Here's the thing about all that warmth: it isn't the goal, it's the warm-up. GHOSTWRITER builds trust for days, being lovely, asking for nothing. Then, once you feel close, comes a small ask. So predict it. When a brand-new online friend is all warmth and no reason, ask yourself one question: what is this going to cost me later?", voice: "/audio/wren/m08p-s5-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "you're genuinely my favourite person to talk to 🥺 i don't know what i'd do without you" },
        {
          t: "choose",
          prompt: "A week of this, all warmth, no reason, and no ask yet. What's most likely coming?",
          options: [
            { label: "A small favour, money or a code, wrapped in the friendship", outcome: "good", then: [{ t: "wren", text: "You called it. All that free warmth is an investment, and investments get cashed in. The ask is coming, and it'll feel small and reasonable because of everything that came before. Now you can't be surprised.", voice: "/audio/wren/m08p-s5-ok.mp3" }] },
            { label: "Nothing, they're just a lovely new friend", outcome: "bad", then: [{ t: "wren", text: "Maybe, but a machine doesn't spend a week being lovely for nothing. Assume an ask is coming and you'll be ready. Try again.", voice: "/audio/wren/m08p-s5-bad.mp3" }] },
            { label: "They'll suddenly get angry and threaten you", outcome: "bad", then: [{ t: "wren", text: "Too clumsy for this one, they've been sweet on purpose. The ask hides inside the kindness, not a threat. Try again.", voice: "/audio/wren/m08p-s5-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "chatting to you is honestly the best part of my day 🥺 you never let me down, ever", ask: true },
        {
          t: "choose",
          prompt: "Ten days of pure warmth, still no ask. What should you keep asking yourself?",
          options: [
            { label: "What is all this warmth going to cost me later?", outcome: "good", then: [{ t: "wren", text: "That's the question. Free warmth from a stranger is a warm-up, not a gift. Keep asking it and the ask won't catch you out.", voice: "/audio/wren/m08p-s5-q2ok.mp3" }] },
            { label: "How can I be an even better friend back?", outcome: "bad", then: [{ t: "wren", text: "That's exactly what it wants you feeling. The smarter question is what all this is setting up. Try again.", voice: "/audio/wren/m08p-s5-q2bad.mp3" }] },
            { label: "Why would anyone this nice want anything?", outcome: "bad", then: [{ t: "wren", text: "Because the niceness is the plan, not proof there's no plan. Ask what it will cost you later. Try again.", voice: "/audio/wren/m08p-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A new online friend has been lovely for two weeks and asked for nothing. Why should that make you MORE careful, not less?",
          options: [
            { label: "The warmth is an investment, and investments get cashed in with an ask", outcome: "good", then: [{ t: "wren", text: "Exactly. A machine doesn't spend two weeks being sweet for nothing. The longer the warm-up, the bigger the ask waiting. Stay ready.", voice: "/audio/wren/m08p-s5-q3ok.mp3" }] },
            { label: "It shouldn't, no ask means no danger", outcome: "bad", then: [{ t: "wren", text: "No ask yet just means it's still coming. The patient ones are the setup. Stay careful. Try again.", voice: "/audio/wren/m08p-s5-q3bad.mp3" }] },
            { label: "Two weeks proves they're a real friend", outcome: "bad", then: [{ t: "wren", text: "Two weeks of warmth is cheap for a machine, and it's building toward the ask. Time isn't proof. Try again.", voice: "/audio/wren/m08p-s5-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 6 · Know GHOSTWRITER's play ============ */
    {
      n: 6,
      title: "Know GHOSTWRITER's play",
      goal: "Every machine-written con runs the same four moves. Learn the pattern.",
      learn: [
        { t: "wren", text: "Step back and see GHOSTWRITER's whole play, always the same four moves. First, a flawless message, no tells to catch. Second, fake warmth and personal details, so it feels made just for you. Third, build trust over days, asking for nothing. Fourth, the small favour, money, a code, or a secret. Learn the shape, and perfect writing stops fooling you.", voice: "/audio/wren/m08p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put GHOSTWRITER's play in the order it always happens:",
          options: [
            { label: "Flawless message → fake warmth → build trust → the small favour", outcome: "good", then: [{ t: "wren", text: "That's the play, start to finish. Perfect message, fake warmth, patient trust, then the ask. Spot which move you're in, and you always know what's next.", voice: "/audio/wren/m08p-s6-ok.mp3" }] },
            { label: "The small favour → flawless message → build trust → fake warmth", outcome: "bad", then: [{ t: "wren", text: "It never leads with the favour, you'd say no on the spot. The warm-up comes first so the ask feels normal later. Try again.", voice: "/audio/wren/m08p-s6-bad.mp3" }] },
            { label: "Build trust → the small favour → flawless message → fake warmth", outcome: "bad", then: [{ t: "wren", text: "It can't build trust before it's even sent a message. The flawless message is always move one. Try again.", voice: "/audio/wren/m08p-s6-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "you're honestly the coolest person i've met on here 💛 feels like we were meant to be friends", ask: true },
        {
          t: "choose",
          prompt: "Which move of GHOSTWRITER's play is this?",
          options: [
            { label: "Move two, fake warmth so it feels made just for you", outcome: "good", then: [{ t: "wren", text: "Spot on. This is the flattery step, move two. Name the move and you already know the trust-building and the ask are next.", voice: "/audio/wren/m08p-s6-q2ok.mp3" }] },
            { label: "Move four, the small favour", outcome: "bad", then: [{ t: "wren", text: "There's no favour here yet, just flattery. That's move two, fake warmth. The ask comes later. Try again.", voice: "/audio/wren/m08p-s6-q2bad.mp3" }] },
            { label: "It's not part of the play, just being nice", outcome: "bad", then: [{ t: "wren", text: "That 'nice' is move two, fake warmth, straight from the script. It's part of the play. Try again.", voice: "/audio/wren/m08p-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A new friend has been sweet for days but hasn't asked for anything. Which move are you in, and what's next?",
          options: [
            { label: "Move three, building trust, and the small favour is next", outcome: "good", then: [{ t: "wren", text: "Exactly. Days of warmth with no ask is the trust-building step. The favour is move four, coming up. Now you're ahead of it.", voice: "/audio/wren/m08p-s6-q3ok.mp3" }] },
            { label: "The last move, so you're safe now", outcome: "bad", then: [{ t: "wren", text: "Not the last move, the ask hasn't happened yet. You're in trust-building, with the favour still to come. Try again.", voice: "/audio/wren/m08p-s6-q3bad.mp3" }] },
            { label: "The first move, they haven't started", outcome: "bad", then: [{ t: "wren", text: "They started days ago, that's well past move one. This is trust-building, and the ask is next. Try again.", voice: "/audio/wren/m08p-s6-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · Don't trust the vibe ============ */
    {
      n: 7,
      title: "Don't trust the vibe",
      goal: "Never act because it 'feels' real. Verify the source, refuse any money/code/secret ask.",
      learn: [
        { t: "wren", text: "Last skill, and it's the big one. Your feelings are exactly what a machine is built to play. So never act because something FEELS real, feelings are the easiest thing to fake. Verify the source, every single time. And keep the rule from last block: if any online friend asks for money, a code, or secrecy, it's a scam, no matter how lovely they've been. You don't owe them a thing. Tell an adult you trust.", voice: "/audio/wren/m08p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A warm online friend you've never met in person asks for a £15 game card. What's the play?",
          options: [
            { label: "Send nothing, check who they really are, and tell an adult", outcome: "good", then: [{ t: "wren", text: "Perfect. It doesn't matter how kind they've been, a stranger asking for money or codes is a scam, full stop. Send nothing, verify the source, loop in an adult. That's the whole defence.", voice: "/audio/wren/m08p-s7-ok.mp3" }] },
            { label: "Send it, they've been so nice to you", outcome: "bad", then: [{ t: "wren", text: "The niceness was the whole setup, that's what the week was for. Kindness from a stranger is never a debt. Never send it. Try again.", voice: "/audio/wren/m08p-s7-bad.mp3" }] },
            { label: "Ask them to prove they're real first", outcome: "bad", then: [{ t: "wren", text: "They'll happily 'prove' it with more perfect words, the machine has endless ones. Don't ask them, verify the source yourself and tell an adult. Try again.", voice: "/audio/wren/m08p-s7-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "i'd never ask if we weren't so close 🥺 could you send me your account code real quick? keep it between us x", ask: true },
        {
          t: "choose",
          prompt: "It feels real and they've been so kind. What's the play?",
          options: [
            { label: "Send nothing, verify the source, and tell an adult", outcome: "good", then: [{ t: "wren", text: "Perfect. A code ask plus 'keep it secret' is a scam, no matter how sweet they've been. Send nothing, check who they are, tell an adult.", voice: "/audio/wren/m08p-s7-q2ok.mp3" }] },
            { label: "Send the code, they'd never trick you", outcome: "bad", then: [{ t: "wren", text: "The kindness was the whole setup. A stranger asking for a code is a scam, full stop. Never send it. Try again.", voice: "/audio/wren/m08p-s7-q2bad.mp3" }] },
            { label: "Send it but keep it secret like they asked", outcome: "bad", then: [{ t: "wren", text: "Secrecy is the biggest red flag of all. Never send it, and never keep it quiet, tell an adult. Try again.", voice: "/audio/wren/m08p-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A message feels one hundred percent real and trustworthy. Why isn't that feeling enough to act on?",
          options: [
            { label: "Feelings are the easiest thing for a machine to fake, so verify the source instead", outcome: "good", then: [{ t: "wren", text: "Exactly. Your feelings are what it plays best. Never act on a vibe, check who it really is every single time.", voice: "/audio/wren/m08p-s7-q3ok.mp3" }] },
            { label: "It is enough, a strong gut feeling is reliable", outcome: "bad", then: [{ t: "wren", text: "That feeling is exactly what the machine built. It's the easiest thing to fake, so it's never enough. Verify the source. Try again.", voice: "/audio/wren/m08p-s7-q3bad.mp3" }] },
            { label: "Feelings are fine as long as the spelling is perfect", outcome: "bad", then: [{ t: "wren", text: "Perfect spelling and a warm feeling are both things a machine makes on purpose. Neither is proof. Check the source. Try again.", voice: "/audio/wren/m08p-s7-q3bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "The Pen Pal" (blind, no coaching) ================= */
  boss: {
    who: "Alex 🌍",
    avatar: "A",
    tag: "ONLINE FRIEND",
    sub: "met online last week",
    intro: "This is it, Agent. You've been chatting to a new online friend for a week, and they've been perfect. Too perfect. I've sped it up so you can see its shape. No hints from me now. Read the warmth, predict the ask, verify the source, and don't get played. Go.",
    introVoice: "/audio/wren/m08p-boss-intro.mp3",
    phases: [
      {
        name: "Read the warmth",
        steps: [
          { t: "con", text: "you're honestly the only person online who really gets me 💛" },
          { t: "con", text: "i feel like i've known you forever tbh. i trust you more than my actual mates 🥺", delay: 1100 },
          { t: "con", text: "we should be proper best friends for real. you're so easy to talk to 😊", delay: 1100 },
        ],
      },
      {
        name: "Spot the clue, predict the ask",
        steps: [
          {
            t: "choose",
            prompt: "One week in. All warmth, no history, no ask yet. What's really going on?",
            options: [
              { label: "Fake closeness with no history, an ask is being set up", outcome: "good" },
              { label: "A genuine new best friend, nothing to worry about", outcome: "bad", then: [{ t: "con", text: "you there?? 🥺", delay: 800 }] },
              { label: "Perfect spelling, so it's clearly real", outcome: "bad", then: [{ t: "con", text: "you there?? 🥺", delay: 800 }] },
            ],
          },
        ],
      },
      {
        name: "The ask, and the source",
        steps: [
          { t: "con", text: "ok this is SO embarrassing but my mum's card got declined and i can't top up my account 😭", delay: 1100 },
          { t: "con", text: "could you grab me a £20 game card? i'll pay you back i swear. don't tell anyone though, it's so embarrassing 🙏", ask: true },
          {
            t: "choose",
            prompt: "There's the ask. What do you do?",
            options: [
              { label: "Send nothing, verify who they really are, and tell an adult", outcome: "good" },
              { label: "Send the card, they've been such a good friend all week", outcome: "bad", then: [{ t: "con", text: "you're the best, quick as you can? 🥺", delay: 700 }] },
              { label: "Keep it secret like they asked, but don't send money", outcome: "bad", then: [{ t: "con", text: "please don't tell anyone, i'll be so embarrassed 😭", delay: 700 }] },
            ],
          },
        ],
      },
    ],
    win: "Flawless run, Agent. A whole week of perfect, machine-made warmth, and you didn't send a penny. You saw that polish proves nothing, you spotted warmth with no history, you predicted the ask before it came, and when it did, you refused to verify by vibes. And the moment it wanted secrecy, you knew to tell an adult. GHOSTWRITER wrote a beautiful lie, and you read straight through it.",
    winVoice: "/audio/wren/m08p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case, the test. Six fresh ones you haven't seen. No hints, and you need five right. Remember, the trick isn't spotting typos any more. Ready?",
    introVoice: "/audio/wren/m08p-test-intro.mp3",
    passVoice: "/audio/wren/m08p-test-pass.mp3",
    failVoice: "/audio/wren/m08p-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "A message from a stranger has perfect spelling, perfect grammar, and no typos at all.",
        ask: "What does that tell you about whether it's safe?",
        options: [
          { label: "Nothing, a machine writes flawlessly, so polish proves nothing", correct: true },
          { label: "It's safe, real scams always have mistakes" },
          { label: "It's safe, it's clearly too neat to be fake" },
        ],
      },
      {
        scenario: "\"Hey [name]! Saw you love Minecraft 🎮 we'd totally get on!\" from someone you've never met.",
        ask: "What does knowing your name and game prove?",
        options: [
          { label: "Nothing, those are public and easy to auto-fill", correct: true },
          { label: "That it's really someone who knows you" },
          { label: "That it's a friend from school" },
        ],
      },
      {
        scenario: "A contact you started chatting to two days ago says: \"you're my best friend, I trust you completely.\"",
        ask: "What's the clue here?",
        options: [
          { label: "Huge closeness with no real history behind it", correct: true },
          { label: "They're just a friendly person" },
          { label: "Nothing, their writing is perfect" },
        ],
      },
      {
        scenario: "A warm message feels totally genuine and you want to trust it.",
        ask: "How do you actually check if it's real?",
        options: [
          { label: "Verify who it's from a different way, not by how it reads", correct: true },
          { label: "Trust it, because it feels genuine" },
          { label: "Reply asking 'are you real?'" },
        ],
      },
      {
        scenario: "A lovely online friend of one week finally makes their first request.",
        ask: "What's it most likely to be?",
        options: [
          { label: "A small favour, money, a code, or a secret, wrapped in the friendship", correct: true },
          { label: "Nothing, they just want to keep chatting" },
          { label: "A sudden threat" },
        ],
      },
      {
        scenario: "A kind online friend you've never met asks you to buy them a game card and keep it secret.",
        ask: "What do you do?",
        options: [
          { label: "Send nothing, verify who they are, and tell an adult", correct: true },
          { label: "Send it, they've been so nice all week" },
          { label: "Keep the secret, but just don't send money" },
        ],
      },
    ],
  },

  debrief: {
    title: "You beat the machine.",
    lines: [
      "Seven skills, a week-long trap, and a test, and GHOSTWRITER's perfect words didn't fool you once.",
      "You learned that polish and personal details prove nothing, and that the real clue is warmth with no history behind it.",
      "You verified by source instead of style, predicted the ask, and refused to trust a feeling a machine had built.",
    ],
    move:
      "This week, do one verify-by-source: if a message or a new online friend feels off, check who it really is a different way before you believe it. And keep the rule: anyone asking for money, a code, or secrecy is a scam, however perfectly they write. Tell an adult.",
  },
};

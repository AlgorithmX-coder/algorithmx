/**
 * Block 2 · Case 006 "Levers" — authored for THE PHONE runtime.
 *
 * SAME STRUCTURE as Block 1 (owner: "structure-wise they all need to be the same
 * as 1-5, 7 skills; the phone design is fine"): SEVEN skills, each LEARN -> PRACTICE,
 * then a blind BOSS, then a must-pass TEST — but all of it happens inside the phone,
 * as DMs. WREN teaches and coaches from inside the thread (voiced); the cons are
 * text you read (never voiced), so you learn by being TARGETED, not lectured.
 *
 * 7 skills:
 *   1 Spot the lever      (INSPECT)  — the six feelings; name one as it's pulled
 *   2 Levers stack        (INSPECT)  — a con piles feeling on feeling; name each
 *   3 The gift with a string (INSPECT) — payback; find the real ask under the pressure
 *   4 Verify another channel (DECIDE) — a friend acting off; check a different way
 *   5 Read one move ahead  (SIMULATE) — predict the con's next step
 *   6 Know SIREN's play    (PROFILE)  — the anatomy of a human con, in order
 *   7 Walk away clean      (BUILD)    — refuse and exit, no shame
 * BOSS  "The Setup"  — one blind con, no coaching, in phases.
 * TEST  "Prove it"   — fresh scenarios, blind, must-pass.
 */

export type LeverId = "hurry" | "scarcity" | "authority" | "liking" | "fear" | "payback";

export const LEVERS: { id: LeverId; name: string; emoji: string }[] = [
  { id: "hurry", name: "HURRY", emoji: "⏱️" },
  { id: "scarcity", name: "SCARCITY", emoji: "🎟️" },
  { id: "authority", name: "AUTHORITY", emoji: "🎩" },
  { id: "liking", name: "LIKING", emoji: "🤝" },
  { id: "fear", name: "FEAR", emoji: "😱" },
  { id: "payback", name: "PAYBACK", emoji: "🎁" },
];

/** A teaching card for one lever — shown in the skill-1 LEARN, before any pad. */
export interface LeverTeach { id: LeverId; line: string; example: string; voice?: string }

export type PhoneStep =
  | { t: "con"; text: string; ask?: boolean; delay?: number }
  | { t: "you"; text: string }
  | { t: "wren"; text: string; voice?: string }
  | { t: "call"; answer: LeverId; prompt?: string; ok?: string; okVoice?: string }
  | {
      t: "choose";
      prompt?: string;
      options: { label: string; outcome?: "good" | "bad"; then?: PhoneStep[] }[];
    };

/** One of the 7 skills: WREN teaches (learn), then the child does it (practice). */
export interface PhoneSkill {
  n: number;
  title: string;
  goal: string; // one line, shown on the skill divider
  /** con identity for the practice; omit for a WREN-led reflection exercise. */
  who?: string;
  avatar?: string;
  tag?: string;
  sub?: string;
  /** skill 1 only: the six lever flash-cards. */
  cards?: LeverTeach[];
  cardsIntro?: string;
  cardsIntroVoice?: string;
  cardsOutro?: string;
  cardsOutroVoice?: string;
  learn: PhoneStep[];
  practice: PhoneStep[];
}

export interface PhoneBossPhase { name: string; steps: PhoneStep[] }
export interface PhoneBoss {
  who: string;
  avatar: string;
  tag?: string;
  sub: string;
  intro: string;
  introVoice?: string;
  phases: PhoneBossPhase[];
  win: string;
  winVoice?: string;
}

export interface PhoneTestQ {
  scenario: string; // the con's message / the situation
  ask: string; // the question about it
  options: { label: string; correct?: boolean }[];
}
export interface PhoneTest {
  intro: string;
  introVoice?: string;
  passVoice?: string;
  failVoice?: string;
  pass: number; // questions needed to pass
  questions: PhoneTestQ[];
}

export interface PhoneCase {
  id: string;
  caseNumber: string;
  title: string;
  actor: string;
  open: string[];
  openVoice?: string[];
  skills: PhoneSkill[];
  boss: PhoneBoss;
  test: PhoneTest;
  debrief: { title: string; lines: string[]; move: string };
}

export const case06Phone: PhoneCase = {
  id: "explorers-m06",
  caseNumber: "CASE 006",
  title: "Levers",
  actor: "SIREN",
  open: [
    "New block, Agent, and a whole new job. No control room tonight. Just this, your phone.",
    "Because this is where it really happens. People won't hack your machine. They'll message you, sweet as anything, and try to work you through the screen.",
    "Seven skills, then a boss and a test to close the case, all in your messages. Let's turn you into someone a con can't touch.",
  ],
  openVoice: [
    "/audio/wren/m06p-open-1.mp3",
    "/audio/wren/m06p-open-2.mp3",
    "/audio/wren/m06p-open-3c.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · Spot the lever ============ */
    {
      n: 1,
      title: "Spot the lever",
      goal: "Learn the six feelings a con uses, and name one the second it's pulled.",
      who: "Kai_TourneyMod",
      avatar: "K",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      cardsIntro: "Every con on earth runs on just six feelings, six levers they pull on you. Learn these six and you'll see one coming a mile off.",
      cardsIntroVoice: "/audio/wren/m06p-teach-intro.mp3",
      cards: [
        { id: "hurry", line: "They rush you so you can't stop and think.", example: "Quick, only 20 mins left!", voice: "/audio/wren/m06p-teach-hurry.mp3" },
        { id: "scarcity", line: "They make it feel rare, so you grab it fast.", example: "Only 2 spots left!", voice: "/audio/wren/m06p-teach-scarcity.mp3" },
        { id: "authority", line: "They act important so you just do as you're told.", example: "I'm a mod. I'm from security.", voice: "/audio/wren/m06p-teach-authority.mp3" },
        { id: "liking", line: "They befriend you first, so you won't want to say no.", example: "You're so funny, we just click!", voice: "/audio/wren/m06p-teach-liking.mp3" },
        { id: "fear", line: "They scare you so you panic and act fast.", example: "Someone's breaking into your account!", voice: "/audio/wren/m06p-teach-fear.mp3" },
        { id: "payback", line: "They give you a gift so you feel you owe them.", example: "Here's something free, enjoy!", voice: "/audio/wren/m06p-teach-payback.mp3" },
      ],
      cardsOutro: "That's your six: hurry, scarcity, authority, liking, fear, payback. Now let's catch one in the wild. Here comes your first message.",
      cardsOutroVoice: "/audio/wren/m06p-teach-outro.mp3",
      learn: [],
      practice: [
        { t: "con", text: "yo!! you just made the school tournament shortlist 🎮🔥" },
        { t: "con", text: "you want your spot or not? 👀", delay: 900 },
        {
          t: "choose",
          options: [
            { label: "wait, who is this?", outcome: "good" },
            { label: "omg yes!! 🙌", outcome: "bad", then: [{ t: "wren", text: "Whoa, slow down. You don't even know who this is yet. Getting excited is exactly what he's counting on. Ask who he is first.", voice: "/audio/wren/m06p-t1-eager.mp3" }] },
          ],
        },
        { t: "wren", text: "Good. Now don't chase the prize, read HIM. Here he goes.", voice: "/audio/wren/m06p-t1-read.mp3" },
        { t: "con", text: "I'm Kai, one of the tournament mods 👍 but you gotta be quick, I need your answer in the next 20 mins!!" },
        { t: "call", answer: "hurry", ok: "Called it. That 20-minute clock isn't real, it's just there to stop you thinking. That's your first lever, felt and named.", okVoice: "/audio/wren/m06p-t1-hurry.mp3" },
      ],
    },

    /* ============ SKILL 2 · Levers stack ============ */
    {
      n: 2,
      title: "Levers stack",
      goal: "See how a con piles feeling on feeling, and name each one as it lands.",
      who: "Kai_TourneyMod",
      avatar: "K",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "A con almost never stops at one lever. He stacks them, hoping one of them lands. So don't relax after you spot the first, the next is usually right behind it. Watch Kai keep going.", voice: "/audio/wren/m06p-s2-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "and only 2 spots left for your whole school tbh 😬" },
        { t: "call", answer: "scarcity", ok: "Two in a row. He rushed you, then made it rare. That's the stack, and you named both.", okVoice: "/audio/wren/m06p-t1-scarcity.mp3" },
        { t: "con", text: "since I'm a mod I can lock yours in right now, just send me your login + password so I can enter you 🙏", ask: true },
        { t: "wren", text: "And there's the real ask. Freeze. A real mod NEVER needs your password. This whole 'tournament' was the bait for THIS. Your call.", voice: "/audio/wren/m06p-t1-ask.mp3" },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            { label: "ok! my login is…", outcome: "bad", then: [{ t: "wren", text: "Stop, don't send it. That password is the only thing he ever wanted, and once it's gone you can't get it back. Try that last move again.", voice: "/audio/wren/m06p-t1-bad.mp3" }] },
            { label: "nice try, that's the HURRY trick. bye 👋", outcome: "good", then: [{ t: "con", text: "wait no i...", delay: 700 }, { t: "con", text: "no it's REAL i swear, don't go!! 😭", delay: 900 }, { t: "wren", text: "Look at that. Now HE'S the one panicking. He's scrambling like this because he knows that you know it's a scam. The moment a con flips from smooth to desperate, you've already won. Brilliant, Agent.", voice: "/audio/wren/m06p-t1-win.mp3" }] },
            { label: "block & report 🚫", outcome: "good", then: [{ t: "con", text: "This person has been blocked and reported.", delay: 600 }, { t: "wren", text: "Even better. You shut him down before he could get another word in. That's how you end it. Well done, Agent.", voice: "/audio/wren/m06p-t1-win2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · The gift with a string ============ */
    {
      n: 3,
      title: "The gift with a string",
      goal: "Spot a 'free gift' that's really bait, and find the real ask hidden under the pressure.",
      who: "SkinDrop_Official",
      avatar: "S",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      learn: [
        { t: "wren", text: "Here's a sneaky one. Sometimes a con gives you something first, a gift, a prize, so you feel like you owe them back. It's called payback, and under all the pressure there's always ONE real ask. Your job is to find it. Watch.", voice: "/audio/wren/m06p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "🎉 CONGRATS! you've been picked for our free skin drop, 800 v-bucks + a legendary skin 🔥" },
        { t: "con", text: "wanna claim it? 👀", delay: 900 },
        {
          t: "choose",
          options: [
            { label: "what's the catch?", outcome: "good" },
            { label: "free stuff?? yes!", outcome: "bad", then: [{ t: "wren", text: "Careful. Free stuff you never entered for, from a stranger? That's the hook, and you're reaching for it. Ask what the catch is first.", voice: "/audio/wren/m06p-t3-eager.mp3" }] },
          ],
        },
        { t: "wren", text: "Nothing's free, and you never entered anything. Keep reading, here comes the hook.", voice: "/audio/wren/m06p-t3-warn.mp3" },
        { t: "con", text: "so here's the thing, we already added a free bonus entry to your account last week, as a little gift 😊" },
        { t: "con", text: "so honestly you owe it to yourself to grab this, don't waste our gift! 🙏", delay: 900 },
        { t: "call", answer: "payback", ok: "There's PAYBACK. They 'gave' you something so you feel like you owe them one. But a gift with a string was never a gift, it was bait on a hook.", okVoice: "/audio/wren/m06p-t3-payback.mp3" },
        { t: "con", text: "just log in through this link to release your prize 👉 skindrop-claim.net", ask: true },
        {
          t: "choose",
          prompt: "Under all that, what is he REALLY after?",
          options: [
            { label: "your account login", outcome: "good", then: [{ t: "wren", text: "Exactly. Every lever was just there to get you to that one link and hand over your login. Find the real ask and the whole con falls apart.", voice: "/audio/wren/m06p-s3-ask.mp3" }] },
            { label: "to give you free v-bucks", outcome: "bad", then: [{ t: "wren", text: "That's the wrapper, not the goal. No real prize ever needs you to log in through a stranger's link. Look again at what he wants you to DO.", voice: "/audio/wren/m06p-s3-askbad.mp3" }] },
            { label: "your opinion of the skin", outcome: "bad", then: [{ t: "wren", text: "He doesn't care about that. Follow the pressure to the thing he wants you to DO, that's the real ask.", voice: "/audio/wren/m06p-s3-askbad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            { label: "ok, logging in…", outcome: "bad", then: [{ t: "wren", text: "Stop. That login is the whole prize, for THEM. You don't owe a stranger a thing. Try that again.", voice: "/audio/wren/m06p-t3-bad.mp3" }] },
            { label: "you didn't give me a gift. that's the bait 👋", outcome: "good", then: [{ t: "con", text: "wait it's a REAL prize i promise!!", delay: 700 }] },
            { label: "report & block 🚫", outcome: "good", then: [{ t: "con", text: "This person has been blocked and reported.", delay: 600 }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · Verify another channel ============ */
    {
      n: 4,
      title: "Verify another channel",
      goal: "When a friend acting strangely asks for something, check them a different way first.",
      who: "Maya 💜",
      avatar: "M",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "This next one is actually your best friend Maya's account. So why might it feel off? Because accounts get stolen, and when they do, the thief keeps the friendship you built. Watch how 'Maya' talks.", voice: "/audio/wren/m06p-t2-intro.mp3" },
      ],
      practice: [
        { t: "con", text: "heyyy you around? 🥺 kind of an emergency" },
        { t: "con", text: "i'm locked out of my account and the only way to fix it is a code, but it's sending to YOUR number by mistake", delay: 1200 },
        { t: "con", text: "can you just screenshot me the code the second it comes? pleeease, i'll literally cry, you're the only one online 😭", ask: true },
        { t: "call", answer: "fear", ok: "Yep, panic and pressure, so you act before you think. There's a bit of LIKING in there too, leaning on your friendship. But a code sent to YOUR phone unlocks YOUR account, never hers.", okVoice: "/audio/wren/m06p-t2-fear.mp3" },
        { t: "wren", text: "Here's the golden rule for a friend acting weird: check on a DIFFERENT channel. Don't reply here, where a thief could be reading. What do you do?", voice: "/audio/wren/m06p-t2-verify.mp3" },
        {
          t: "choose",
          prompt: "How do you handle it?",
          options: [
            { label: "send the code, it's Maya!", outcome: "bad", then: [{ t: "wren", text: "That code was for YOUR account, and you just handed it to whoever stole hers. Rewind, a real friend won't mind you checking first.", voice: "/audio/wren/m06p-t2-bad.mp3" }] },
            { label: "call Maya's actual phone to check", outcome: "good", then: [{ t: "you", text: "[you call Maya… the real Maya picks up, confused. Her account was hacked an hour ago.]" }] },
            { label: "ask something only the real Maya knows", outcome: "good", then: [{ t: "con", text: "haha what? just send the code, no time for games!!", delay: 900 }, { t: "wren", text: "See that? The real Maya would answer. A thief dodges and rushes you instead. That dodge just gave the whole thing away.", voice: "/audio/wren/m06p-t2-dodge.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Read one move ahead ============ */
    {
      n: 5,
      title: "Read one move ahead",
      goal: "Some cons take weeks. Learn to see the ask coming before it arrives.",
      who: "Robyn 🌸",
      avatar: "R",
      tag: "NEW",
      sub: "added you 2 weeks ago",
      learn: [
        { t: "wren", text: "This account added you two weeks ago. Sweet, funny, seemed to know your mates. I've fast-forwarded the whole thing so you can see its shape. Watch how patient it is, and try to see where it's heading.", voice: "/audio/wren/m06p-t4-intro.mp3" },
      ],
      practice: [
        { t: "con", text: "heyy! you're Priya's friend right? saw you in the group, you're actually so funny 😄" },
        { t: "con", text: "we should be proper friends fr, you just GET my humour 💕", delay: 1000 },
        { t: "call", answer: "liking", ok: "See that? No ask at all, just warmth, for days on end. That's the LIKING lever being BUILT. She's not spending it yet, she's saving it up.", okVoice: "/audio/wren/m06p-t4-liking.mp3" },
        { t: "wren", text: "Now two weeks of this go by. Then one day the tone changes. You've seen the levers, so YOU tell me. What do you think her first real ask looks like?", voice: "/audio/wren/m06p-t4-ahead.mp3" },
        {
          t: "choose",
          prompt: "What do you think comes next?",
          options: [
            { label: "a small favour, wrapped up in the friendship", outcome: "good" },
            { label: "she asks for nothing, just chats forever", outcome: "bad", then: [{ t: "wren", text: "That's what she WANTS you to expect. Two weeks of niceness was an investment, and investments get cashed in. Think again.", voice: "/audio/wren/m06p-t4-pred-a.mp3" }] },
            { label: "she suddenly threatens you", outcome: "bad", then: [{ t: "wren", text: "Too clumsy for this one. She's sweet, remember? The ask hides INSIDE the kindness. Think again.", voice: "/audio/wren/m06p-t4-pred-b.mp3" }] },
          ],
        },
        { t: "con", text: "😭 ok this is embarrassing but my mum's phone got cut off and i can't reach her" },
        { t: "con", text: "could you grab me a £10 game card? i'll pay you back the second i can, you're literally my only friend rn 💕", ask: true },
        { t: "call", answer: "payback", ok: "And there it is, exactly where you called it. Two weeks of being lovely, cashed in for money. 'You're my only friend' is the squeeze, so saying no feels cruel. That's how the long con pays off.", okVoice: "/audio/wren/m06p-t4-ask.mp3" },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            { label: "send the card, she's my friend", outcome: "bad", then: [{ t: "wren", text: "You'll never see that tenner again, and next week she'll need twenty. Kindness isn't a debt you owe. Try again.", voice: "/audio/wren/m06p-t4-bad.mp3" }] },
            { label: "i'm sorry things are hard, but i can't send money. can you tell an adult you trust?", outcome: "good" },
            { label: "block, this isn't a real friend 🚫", outcome: "good" },
          ],
        },
        { t: "con", text: "wow. after everything i told you. i thought you actually cared 😔", delay: 1100 },
        { t: "wren", text: "And there's the last trick, guilt. 'After everything' is FEAR and PAYBACK teamed up to make you feel like a bad person for saying no. You're not. A real friend would never do this, and you did exactly right.", voice: "/audio/wren/m06p-t4-guilt.mp3" },
      ],
    },

    /* ============ SKILL 6 · Know SIREN's play ============ */
    {
      n: 6,
      title: "Know SIREN's play",
      goal: "Every human con runs the same four moves. Learn the pattern and you see the whole play.",
      learn: [
        { t: "wren", text: "Step back, because every con you just met ran the SAME four moves, in the same order. First they make friends or grab your attention. Then they pull a lever, a feeling. Then comes the real ask. And if you hesitate, they pile on guilt to push you over. Learn that shape and no con can surprise you.", voice: "/audio/wren/m06p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put SIREN's play in the order it always happens:",
          options: [
            { label: "Warm you up → pull a lever → the real ask → pile on guilt", outcome: "good", then: [{ t: "wren", text: "That's the play, start to finish. Warm-up, lever, ask, guilt. Spot which move you're in, and you always know what's coming next.", voice: "/audio/wren/m06p-s6-ok.mp3" }] },
            { label: "The real ask → warm you up → guilt → pull a lever", outcome: "bad", then: [{ t: "wren", text: "No con leads with the ask, you'd say no on the spot. They warm you up FIRST, so the ask feels normal by the time it lands. Try again.", voice: "/audio/wren/m06p-s6-bad.mp3" }] },
            { label: "Pull a lever → pile on guilt → warm you up → the real ask", outcome: "bad", then: [{ t: "wren", text: "Close, but guilt is the LAST move, the shove when you hesitate, not the opener. Put the warm-up first. Try again.", voice: "/audio/wren/m06p-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · Walk away clean ============ */
    {
      n: 7,
      title: "Walk away clean",
      goal: "Once you've spotted a con, get out safely, no arguing, no shame.",
      learn: [
        { t: "wren", text: "Last skill, and it's the most important. When you've spotted a con, you don't owe them a debate. You don't need to prove they're fake. You just get out clean: stop replying, block and report, and if it shook you at all, tell an adult you trust. Walking away isn't rude and it isn't weak. It's the win.", voice: "/audio/wren/m06p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A stranger's con just asked for your password. What's the clean walk-away?",
          options: [
            { label: "Don't reply, block and report, and tell an adult you trust", outcome: "good", then: [{ t: "wren", text: "Perfect. No reply, no argument, just gone, and an adult in the loop. That's a clean walk-away, and it's exactly how a pro ends it.", voice: "/audio/wren/m06p-s7-ok.mp3" }] },
            { label: "Argue back to prove you know it's a scam", outcome: "bad", then: [{ t: "wren", text: "Tempting, but arguing just tells them you're paying attention, and keeps the door open. You owe a con nothing, not even the last word. Try again.", voice: "/audio/wren/m06p-s7-bad.mp3" }] },
            { label: "Send a fake password to waste their time", outcome: "bad", then: [{ t: "wren", text: "I know it feels clever, but any reply keeps you on their hook and marks you as a live target. The clean move is no reply at all. Try again.", voice: "/audio/wren/m06p-s7-bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "The Setup" (blind, no coaching) ================= */
  boss: {
    who: "Jordan_Security",
    avatar: "J",
    tag: "UNKNOWN",
    sub: "not in your contacts",
    intro: "This is it, Agent. One last con, and this time you're on your own. No hints from me. Name every lever, find the ask, and get out clean. Show me you've got it.",
    introVoice: "/audio/wren/m06p-boss-intro.mp3",
    phases: [
      {
        name: "Name the levers",
        steps: [
          { t: "con", text: "hello. this is Jordan from account security. official team ⚠️" },
          { t: "call", answer: "authority" },
          { t: "con", text: "we've detected someone trying to break into your account right now", delay: 1000 },
          { t: "call", answer: "fear" },
          { t: "con", text: "you have 5 minutes to stop it or the account is deleted for good", delay: 1000 },
          { t: "call", answer: "hurry" },
        ],
      },
      {
        name: "Find the ask",
        steps: [
          { t: "con", text: "quick, just reply with the code we've texted you and we'll lock it down 🔒", ask: true },
          {
            t: "choose",
            prompt: "What is he REALLY after?",
            options: [
              { label: "the security code from your phone", outcome: "good" },
              { label: "to protect your account", outcome: "bad", then: [{ t: "con", text: "hurry!! 3 minutes left ⏳", delay: 800 }] },
              { label: "to text you a warning", outcome: "bad", then: [{ t: "con", text: "hurry!! 3 minutes left ⏳", delay: 800 }] },
            ],
          },
        ],
      },
      {
        name: "Walk away clean",
        steps: [
          {
            t: "choose",
            prompt: "How do you end it?",
            options: [
              { label: "here's the code!", outcome: "bad", then: [{ t: "con", text: "hurry!! the account will be deleted ⏳", delay: 800 }] },
              { label: "no. real security never asks for my code.", outcome: "good", then: [{ t: "con", text: "wait, this is your last chance—", delay: 700 }] },
              { label: "block & report 🚫", outcome: "good", then: [{ t: "con", text: "This person has been blocked and reported.", delay: 600 }] },
            ],
          },
        ],
      },
    ],
    win: "That's it. Authority, fear, and hurry, stacked up and thrown at you fast, and you named every one, found the ask, and refused, with me saying nothing at all. You're not just safe now, Agent. You're sharp.",
    winVoice: "/audio/wren/m06p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case: the test. Six quick ones, fresh scams you haven't seen. No hints, and you need five right. Take what you learned and think. Ready?",
    introVoice: "/audio/wren/m06p-test-intro.mp3",
    passVoice: "/audio/wren/m06p-test-pass.mp3",
    failVoice: "/audio/wren/m06p-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "\"⚠️ Your account will be LOCKED in 1 hour unless you verify now.\"",
        ask: "Which lever is this?",
        options: [
          { label: "Hurry", correct: true },
          { label: "Liking" },
          { label: "Payback" },
        ],
      },
      {
        scenario: "\"Hey it's your cousin, I'm in trouble and can't call. Can you send me a gift card? I'll pay you back x\"",
        ask: "What's the safest move?",
        options: [
          { label: "Call your cousin on their real number to check", correct: true },
          { label: "Send the gift card, they said they'll pay you back" },
          { label: "Reply asking which shop to buy it from" },
        ],
      },
      {
        scenario: "\"You've been chatting for weeks and they've been lovely. Today: 'you're my only friend, can you lend me £20?'\"",
        ask: "What is this?",
        options: [
          { label: "A long con cashing in the friendship it built", correct: true },
          { label: "A normal request from a real friend" },
          { label: "A hurry trick" },
        ],
      },
      {
        scenario: "\"FREE PS5! We picked you 🎉 Only 3 left, claim in the next 10 mins by logging in here: prize-win.net\"",
        ask: "How many levers are being stacked here?",
        options: [
          { label: "Three: payback, scarcity and hurry", correct: true },
          { label: "None, it's a real prize" },
          { label: "One: just scarcity" },
        ],
      },
      {
        scenario: "\"This is IT Support. To fix your account, read us back the code we just texted you.\"",
        ask: "What do you do?",
        options: [
          { label: "Never share the code; real support never asks for it", correct: true },
          { label: "Read the code back so they can help" },
          { label: "Ask them to text a second code first" },
        ],
      },
      {
        scenario: "You've realised a stranger messaging you is running a scam.",
        ask: "What's the clean walk-away?",
        options: [
          { label: "Stop replying, block and report, tell an adult you trust", correct: true },
          { label: "Argue until they admit it's a scam" },
          { label: "Keep chatting to find out who they are" },
        ],
      },
    ],
  },

  debrief: {
    title: "You made it through the night.",
    lines: [
      "Seven skills, a blind boss, and a test, and not one con got a thing out of you.",
      "You named every one of the six levers, found the real ask under the pressure, and read a two-week con before it landed.",
      "You checked a hijacked friend another way, learned SIREN's whole play, and walked away clean, every time.",
    ],
    move:
      "This week, when a message rushes you or tugs your heart, name the feeling out loud before you reply. If a friend messages something strange, reach them another way first. And remember: a gift with a string, and a prize that needs your password, were never really either.",
  },
};

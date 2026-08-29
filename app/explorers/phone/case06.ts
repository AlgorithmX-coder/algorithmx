/**
 * Block 2 · Case 006 "Levers" — authored for THE PHONE runtime.
 *
 * Not a course of skills. A kid on their phone, being worked in their DMs, one
 * thread at a time. Each thread is a real encounter; the con pulls the six
 * pressure levers ON you, and you name them as you feel them. WREN lives in the
 * thread as the friend in your ear (voiced), including a spoken nudge when you
 * get one wrong. It ends with an UNAIDED must-pass check, so nobody breezes out.
 *
 * Coverage: all six levers across five encounters —
 *   1 Tournament   · hurry, scarcity, authority   (refuse the login ask)
 *   2 Free skins   · payback, scarcity            (the gift with a string)
 *   3 Hijacked friend · fear, liking              (verify on another channel)
 *   4 The long game · liking built → guilt closer (read one move ahead)
 *   5 THE CHECK    · authority, fear, hurry        (no coaching — prove it)
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

/** A teaching card for one lever — shown BEFORE the child is ever asked to name
 * a lever, so the pad options are things they've been taught, not guessed. */
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

export interface PhoneThread {
  id: string;
  who: string;
  avatar: string;
  tag?: string;
  sub: string;
  intro?: string;
  introVoice?: string;
  steps: PhoneStep[];
  clear: string;
}

export interface PhoneCase {
  id: string;
  caseNumber: string;
  title: string;
  actor: string;
  open: string[];
  openVoice?: string[];
  /** LEARN phase: teach all six levers before any are asked as pad options. */
  teachIntro?: string;
  teachIntroVoice?: string;
  teach?: LeverTeach[];
  teachOutro?: string;
  teachOutroVoice?: string;
  threads: PhoneThread[];
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
    "They do it with just six feelings, six levers they pull on you. Before anyone tries a single one, I'm going to teach you all six.",
  ],
  openVoice: [
    "/audio/wren/m06p-open-1.mp3",
    "/audio/wren/m06p-open-2.mp3",
    "/audio/wren/m06p-open-3b.mp3",
  ],

  // ---- LEARN: meet the six levers, taught one at a time, BEFORE any pad ----
  teachIntro: "Here they are. Learn these six and you'll see a con coming a mile off. Each one is a feeling they try to switch on in you.",
  teachIntroVoice: "/audio/wren/m06p-teach-intro.mp3",
  teach: [
    { id: "hurry", line: "They rush you so you can't stop and think.", example: "Quick, only 20 mins left!", voice: "/audio/wren/m06p-teach-hurry.mp3" },
    { id: "scarcity", line: "They make it feel rare, so you grab it fast.", example: "Only 2 spots left!", voice: "/audio/wren/m06p-teach-scarcity.mp3" },
    { id: "authority", line: "They act important so you just do as you're told.", example: "I'm a mod. I'm from security.", voice: "/audio/wren/m06p-teach-authority.mp3" },
    { id: "liking", line: "They befriend you first, so you won't want to say no.", example: "You're so funny, we just click!", voice: "/audio/wren/m06p-teach-liking.mp3" },
    { id: "fear", line: "They scare you so you panic and act fast.", example: "Someone's breaking into your account!", voice: "/audio/wren/m06p-teach-fear.mp3" },
    { id: "payback", line: "They give you a gift so you feel you owe them.", example: "Here's something free, enjoy!", voice: "/audio/wren/m06p-teach-payback.mp3" },
  ],
  teachOutro: "That's your six: hurry, scarcity, authority, liking, fear, payback. Now let's catch them in the wild. Here comes your first message.",
  teachOutroVoice: "/audio/wren/m06p-teach-outro.mp3",

  threads: [
    /* ---------------- 1 · the tournament con · hurry, scarcity, authority ---------------- */
    {
      id: "tournament",
      who: "Kai_TourneyMod",
      avatar: "K",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      intro: "You don't know this account. Watch how he talks, not what he's offering.",
      introVoice: "/audio/wren/m06p-t1-intro.mp3",
      clear: "One con down. You felt the levers instead of the prize.",
      steps: [
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
        { t: "call", answer: "hurry", ok: "Called it. That 20-minute clock isn't real, it's just there to stop you thinking.", okVoice: "/audio/wren/m06p-t1-hurry.mp3" },
        { t: "con", text: "and only 2 spots left for your whole school tbh 😬", delay: 1000 },
        { t: "call", answer: "scarcity", ok: "Two in a row. He's stacking levers, hoping one of them lands.", okVoice: "/audio/wren/m06p-t1-scarcity.mp3" },
        { t: "con", text: "since I'm a mod I can lock yours in right now, just send me your login + password so I can enter you 🙏", ask: true },
        { t: "wren", text: "And there's the real ask. Freeze. A real mod NEVER needs your password. This whole 'tournament' was the bait for THIS. Your call.", voice: "/audio/wren/m06p-t1-ask.mp3" },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            { label: "ok! my login is…", outcome: "bad", then: [{ t: "wren", text: "Stop, don't send it. That password is the only thing he ever wanted, and once it's gone you can't get it back. Try that last move again.", voice: "/audio/wren/m06p-t1-bad.mp3" }] },
            { label: "nice try, that's the HURRY trick. bye 👋", outcome: "good", then: [{ t: "con", text: "wait no I—", delay: 700 }] },
            { label: "block & report 🚫", outcome: "good", then: [{ t: "con", text: "This person has been blocked and reported.", delay: 600 }] },
          ],
        },
      ],
    },

    /* ---------------- 2 · free skins · payback, scarcity ---------------- */
    {
      id: "skins",
      who: "SkinDrop_Official",
      avatar: "S",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      intro: "A giveaway you never entered, from an account you've never heard of. But watch the NEW trick this one slips in.",
      introVoice: "/audio/wren/m06p-t3-intro.mp3",
      clear: "A free prize that made you feel like you owed them. You saw the string on the gift.",
      steps: [
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
        { t: "call", answer: "payback", ok: "There's the new one. PAYBACK. They 'gave' you something so you feel like you owe them one. But a gift with a string was never a gift, it was bait on a hook.", okVoice: "/audio/wren/m06p-t3-payback.mp3" },
        { t: "con", text: "oh and only 4 unclaimed prizes left in your whole area, so be quick! ⏳", delay: 1000 },
        { t: "call", answer: "scarcity", ok: "And a countdown on top, you know that one now. Two levers stacked on one little giveaway.", okVoice: "/audio/wren/m06p-t3-scarcity.mp3" },
        { t: "con", text: "just log in through this link to release your prize 👉 skindrop-claim.net", ask: true },
        { t: "wren", text: "And the ask. A real prize never, ever needs your password. That 'gift' only existed to make you feel like you owed them a login.", voice: "/audio/wren/m06p-t3-ask.mp3" },
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

    /* ---------------- 3 · the hijacked friend · fear, liking ---------------- */
    {
      id: "friend",
      who: "Maya 💜",
      avatar: "M",
      sub: "best friend · online now",
      intro: "This one's different. This is actually your best friend Maya's account. So why does it feel off? Watch.",
      introVoice: "/audio/wren/m06p-t2-intro.mp3",
      clear: "You spotted a hijacked account, and checked another way. Textbook.",
      steps: [
        { t: "con", text: "heyyy you around? 🥺 kind of an emergency" },
        { t: "con", text: "i'm locked out of my account and the only way to fix it is a code, but it's sending to YOUR number by mistake", delay: 1200 },
        { t: "wren", text: "It really is Maya's account, so this is confusing. But accounts get stolen, and when they do, the thief keeps the friendship you built. Keep watching how 'Maya' is talking.", voice: "/audio/wren/m06p-t2-hijack.mp3" },
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

    /* ---------------- 4 · the long game · liking built → guilt closer ---------------- */
    {
      id: "longgame",
      who: "Robyn 🌸",
      avatar: "R",
      tag: "NEW",
      sub: "added you 2 weeks ago",
      intro: "This account added you two weeks ago. Sweet, funny, seemed to know your mates. I've fast-forwarded the whole thing so you can see its shape. Watch how patient it is.",
      introVoice: "/audio/wren/m06p-t4-intro.mp3",
      clear: "You read a two-week con in two minutes, spotted the guilt, and didn't pay a penny.",
      steps: [
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
        { t: "call", answer: "payback", ok: "And there it is. Two weeks of being lovely, cashed in for money. 'You're my only friend' is the squeeze, so saying no feels cruel. That's how the long con pays off.", okVoice: "/audio/wren/m06p-t4-ask.mp3" },
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
        { t: "wren", text: "And there's the last lever, guilt. 'After everything' is FEAR and PAYBACK teamed up to make you feel like a bad person for saying no. You're not. A real friend would never do this, and you did exactly right.", voice: "/audio/wren/m06p-t4-guilt.mp3" },
      ],
    },

    /* ---------------- 5 · THE CHECK · unaided, must-pass ---------------- */
    {
      id: "check",
      who: "Jordan_Security",
      avatar: "J",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      intro: "Last one, Agent, and this time you're on your own. No hints from me. Just show me you've got it.",
      introVoice: "/audio/wren/m06p-check-intro.mp3",
      clear: "You did the whole thing without me.",
      steps: [
        { t: "con", text: "hello. this is Jordan from account security. official team ⚠️" },
        { t: "call", answer: "authority" },
        { t: "con", text: "we've detected someone trying to break into your account right now", delay: 1000 },
        { t: "call", answer: "fear" },
        { t: "con", text: "you have 5 minutes to stop it or the account is deleted for good", delay: 1000 },
        { t: "call", answer: "hurry" },
        { t: "con", text: "quick, just reply with the code we've texted you and we'll lock it down 🔒", ask: true },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            { label: "here's the code!", outcome: "bad", then: [{ t: "wren", text: "No. That code hands YOUR account to whoever's asking. Real security never needs your code. Try again.", voice: "/audio/wren/m06p-check-bad.mp3" }] },
            { label: "no. real security never asks for my code.", outcome: "good" },
            { label: "block & report 🚫", outcome: "good" },
          ],
        },
        { t: "wren", text: "That's it. Authority, fear, and hurry, stacked up and thrown at you fast, and you named every one and refused, with me saying nothing at all. You're not just safe now, Agent. You're sharp. Case closed.", voice: "/audio/wren/m06p-check-done.mp3" },
      ],
    },
  ],

  debrief: {
    title: "You made it through the night.",
    lines: [
      "Five people tried to work you through your own phone, and not one of them got a thing.",
      "You felt every one of the six levers being pulled, and you named them instead of reacting: hurry, scarcity, authority, liking, fear, and payback.",
      "You checked a hijacked friend another way, read a two-week con in two minutes, and passed the last one with no help at all.",
    ],
    move:
      "This week, when a message rushes you or tugs your heart, name the feeling out loud before you reply. If a friend messages something strange, reach them another way first. And remember: a gift with a string, and a prize that needs your password, were never really either.",
  },
};

/**
 * Block 2 · Case 006 "Levers" — authored for THE PHONE runtime.
 *
 * Not a course of skills. A kid on their phone, being worked in their DMs, one
 * thread at a time. Each thread is a real encounter; the con pulls the six
 * pressure levers ON you, and you name them as you feel them. WREN lives in
 * the thread as the friend in your ear. Text-first (these are DMs), so there's
 * no narrator droning — you read, feel, and answer.
 *
 * Add a case by adding threads; the engine (PhoneRuntime) plays them in order.
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

export type PhoneStep =
  /** A message from the other person. `ask` flags the dangerous ask (red outline). */
  | { t: "con"; text: string; ask?: boolean; delay?: number }
  /** A message auto-sent as you (used inside a choice's follow-up). */
  | { t: "you"; text: string }
  /** WREN drops into the thread to coach. */
  | { t: "wren"; text: string }
  /** Tap the lever the last message pulled; `ok` is WREN's line after a correct call. */
  | { t: "call"; answer: LeverId; prompt?: string; ok?: string }
  /** You choose how to reply. A wrong `outcome:"bad"` can rewind via `then`. */
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
  /** WREN's set-up line shown before the thread opens. */
  intro?: string;
  steps: PhoneStep[];
  /** Shown on the little "done" card between threads. */
  clear: string;
}

export interface PhoneCase {
  id: string;
  caseNumber: string;
  title: string;
  actor: string;
  /** WREN's very first line, on the lock screen. */
  open: string[];
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
    "They do it with six feelings: hurry, scarcity, authority, liking, fear, and payback. I'll be right here in your messages. Your job is to feel a lever the second it's pulled, and name it.",
    "Here comes the first one now.",
  ],

  threads: [
    /* ---------------- thread 1: the tournament con ---------------- */
    {
      id: "tournament",
      who: "Kai_TourneyMod",
      avatar: "K",
      tag: "UNKNOWN",
      sub: "not in your contacts",
      intro: "You don't know this account. Watch how he talks, not what he's offering.",
      clear: "One con down. You felt the levers instead of the prize.",
      steps: [
        { t: "con", text: "yo!! you just made the school tournament shortlist 🎮🔥" },
        { t: "con", text: "you want your spot or not? 👀", delay: 900 },
        {
          t: "choose",
          options: [
            { label: "wait, who is this?" },
            { label: "omg yes!! 🙌" },
          ],
        },
        { t: "wren", text: "Good. Now don't chase the prize, read HIM. Here he goes." },
        { t: "con", text: "I'm Kai, one of the tournament mods 👍 but you gotta be quick, slots close in 20 mins!!" },
        { t: "call", answer: "hurry", ok: "Called it. That 20-minute clock isn't real, it's just there to stop you thinking." },
        { t: "con", text: "and only 2 spots left for your whole school tbh 😬", delay: 1000 },
        { t: "call", answer: "scarcity", ok: "Two in a row. He's stacking levers, hoping one of them lands." },
        { t: "con", text: "since I'm a mod I can lock yours in right now, just send me your login + password so I can enter you 🙏", ask: true },
        { t: "wren", text: "And there's the real ask. Freeze. A real mod NEVER needs your password. This whole 'tournament' was the bait for THIS. Your call." },
        {
          t: "choose",
          prompt: "How do you reply?",
          options: [
            {
              label: "ok! my login is…",
              outcome: "bad",
              then: [
                { t: "wren", text: "Stop, don't send it. That password is the only thing he ever wanted, and once it's gone you can't get it back. Try that last move again." },
              ],
            },
            { label: "nice try, that's the HURRY trick. bye 👋", outcome: "good", then: [{ t: "con", text: "wait no I—", delay: 700 }] },
            { label: "block & report 🚫", outcome: "good", then: [{ t: "con", text: "This person has been blocked and reported.", delay: 600 }] },
          ],
        },
      ],
    },

    /* ---------------- thread 2: the hijacked friend ---------------- */
    {
      id: "friend",
      who: "Maya 💜",
      avatar: "M",
      sub: "best friend · online now",
      intro: "This one's different. This is actually your best friend Maya's account. So why does it feel off? Watch.",
      clear: "You spotted a hijacked account, and checked another way. Textbook.",
      steps: [
        { t: "con", text: "heyyy you around? 🥺 kind of an emergency" },
        { t: "con", text: "i'm locked out of my account and the only way to fix it is a code, but it's sending to YOUR number by mistake", delay: 1200 },
        { t: "wren", text: "It really is Maya's account, so this is confusing. But accounts get stolen, and when they do, the thief keeps the friendship you built. Keep watching how 'Maya' is talking." },
        { t: "con", text: "can you just screenshot me the code the second it comes? pleeease, i'll literally cry, you're the only one online 😭", ask: true },
        { t: "call", answer: "fear", ok: "Yep, panic and pressure, so you act before you think. There's a bit of LIKING in there too, leaning on your friendship. But a code sent to YOUR phone unlocks YOUR account, never hers." },
        { t: "wren", text: "Here's the golden rule for a friend acting weird: check on a DIFFERENT channel. Don't reply here, where a thief could be reading. What do you do?" },
        {
          t: "choose",
          prompt: "How do you handle it?",
          options: [
            {
              label: "send the code, it's Maya!",
              outcome: "bad",
              then: [
                { t: "wren", text: "That code was for YOUR account, and you just handed it to whoever stole hers. Rewind, a real friend won't mind you checking first." },
              ],
            },
            { label: "call Maya's actual phone to check", outcome: "good", then: [{ t: "you", text: "[you call Maya… the real Maya picks up, confused. Her account was hacked an hour ago.]" }] },
            { label: "ask something only the real Maya knows", outcome: "good", then: [{ t: "con", text: "haha what? just send the code, no time for games!!", delay: 900 }, { t: "wren", text: "See that? The real Maya would answer. A thief dodges and rushes you instead. That dodge just gave the whole thing away." }] },
          ],
        },
      ],
    },
  ],

  debrief: {
    title: "You made it through the night.",
    lines: [
      "Two people tried to work you through your own phone, and neither one got a thing.",
      "You felt the levers being pulled, hurry, scarcity, authority, fear, and you named them instead of reacting.",
      "And when a friend's account went weird, you checked another way instead of trusting the screen.",
    ],
    move:
      "This week, when a message rushes you or tugs your heart, name the feeling out loud before you reply. And if a friend messages something strange, reach them another way first. A real one never minds.",
  },
};

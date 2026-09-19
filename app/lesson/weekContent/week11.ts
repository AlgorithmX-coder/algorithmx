import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 11 - Something Wrong? Emergency Protocol.
 *
 * SENSITIVE WEEK, built warmth-first like Week 5: the Raccoon stays out of the
 * feelings beats (concepts 1, 2 and 4 carry no threat line at all), the child is
 * never blamed, and nothing here is frightening. The lesson carries the Childhelp
 * number (1-800-422-4453) that the no-text films could not.
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE LIGHTHOUSE - a warm
 * rescue station on a dark coast, where the light never goes out.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 FAULT     it is never your fault        | calmConsole      | recall
 *     2 TEAM      name your grown-ups now       | radioRoll        | finish
 *     3 BLOCK     your reply is the fuel        | dontFeedTheFire  | lie
 *     4 EVIDENCE  camera, not trash             | developingTray   | order
 *     5 PROTOCOL  breathe, snap, stop, block, tell | drillRun      | speed
 *   review (accountRescue, rescue skin) -> boss -> video -> debrief ->
 *   stickers -> completion. 30 screens, no game before Learn 1.
 *
 * Engine allocation (owner option B: max 2 concept re-themes per week plus the
 * review slot; see RETHEME_ALLOWED[11] in scripts/audit-engine-reuse.mjs):
 * - calmConsole is this week's own screen-4 signature, converted to tap-only.
 *   The breathing ring is TAP-PACED, never held: Week 10's Pause Power is a hold
 *   and ships one week earlier, so a hold here would read as the same game.
 * - radioRoll and drillRun are NEW engines. drillRun lives the five steps in
 *   sequence rather than sorting them on a board (StepOrder is at its cap) or
 *   hunting three buttons (PowerPanel is Week 10's).
 * - dontFeedTheFire returns from Week 5 as Starve the Signal: concept re-theme 1.
 * - developingTray returns from Week 8 as the Evidence Tray: concept re-theme 2.
 * - accountRescue returns from Week 5 as the review.
 *
 * Lane-clean: WHAT TO DO when something is wrong. Cyberbullying feelings were
 * Week 5's, stranger red flags Week 3's; this week is the calm drill.
 */
export const WEEK_11: WeekContent = {
  weekNumber: 11,
  title: "Something Wrong? Emergency Protocol",
  topic: "emergency-protocol",
  badgeName: "Team Captain",
  badgeIcon: "👑",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 11: EMERGENCY PROTOCOL", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: something feels wrong
    { type: "video", videoPlaceholder: "Week 11: Something Wrong?", videoSrc: "/videos/module-11-intro.mp4" },

    // 1 - ALERT: incident report (warm, never frightening)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-11.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "Messages landed on kids' screens that made their tummies drop, and the Raccoon whispered a sneaky lie after them: \"it's YOUR fault, keep it quiet.\" This week you learn the calm steps every hero knows, in a lighthouse where the light never goes out. First truth first: it is NEVER your fault.",
      photoCaption: "Wk 11 - Emergency Protocol",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[11] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn the biggest truth: it is never your fault",
        "Name your team, the grown-ups who have got you",
        "Keep the proof and run the calm drill",
      ],
    },

    /* ─────────── BEAT 1 · NEVER YOUR FAULT ─────────── */
    // 4 - Learn
    {
      type: "info",
      title: "Never Your Fault",
      content:
        "Sometimes a message lands and your tummy drops. Here is the first and biggest truth, Cyber Hero: when someone is unkind to you, that was THEIR choice. It is not yours to carry. Not if you opened it. Not if you replied. Not if you waited days before telling anyone. The heavy feeling is real, and it is still not your fault. So we start the way every lighthouse keeper starts: breathe, and put the heavy things down.",
      bullets: [
        "Unkind words are the sender's choice, not yours",
        "Opening it does not make it your fault",
        "Replying does not make it your fault",
        "Waiting to tell does not make it your fault",
        "Breathe first, then put the heavy things down",
      ],
      bulletIcons: ["💪", "👀", "💬", "⏱️", "🔔"],
      emblem: "💪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Come in, Cyber Hero. This is the lighthouse, and the light stays on all night.",
          "Sometimes a message lands and your tummy drops.",
          "So here is the biggest truth I know.",
          "When somebody is unkind to you, that was THEIR choice.",
          "[warmly] Not yours. Not ever.",
          "[excited] Let's go to the Calm-Down Console and put the heavy things down together!",
        ],
      },
    },
    // 5 - Game: BREATHE (the week's own signature, now tap-only)
    {
      type: "calmConsole",
      introTitle: "The Calm-Down Console",
      introSubtitle: "Tap IN and OUT with the ring. After every breath, lift one heavy stone off and hear why it was never yours.",
      introIcon: "🔔",
      inLabel: "BREATHE IN",
      outLabel: "BREATHE OUT",
      stonesLabel: "NOT YOURS TO CARRY",
      truthLine: "Every stone was someone else's choice. You were carrying them for nothing.",
      completeTitle: "Every stone is down.",
      completeLine: "Lighter, calmer, and still exactly as brave.",
      stones: [
        { id: "opened", label: "I opened it", icon: "👀", why: "You opened it, and opening a message is only reading it. You cannot know what is inside until you look, and looking has never made anybody the bad guy." },
        { id: "replied", label: "I replied once", icon: "💬", why: "You replied once, and replying usually means you wanted it to stop. That is a kind instinct, and it hands nothing back to you." },
        { id: "waited", label: "I waited to tell", icon: "⏱️", why: "You waited, and waiting usually means you were scared, or hoping it would go away on its own. Telling late is still telling, and it still counts." },
        { id: "laughed", label: "I laughed along", icon: "😂", why: "Laughing when you are uncomfortable is something bodies do all by themselves. It was never you agreeing." },
        { id: "clicked", label: "I clicked their link", icon: "👆", why: "A link that hides what it really is was built to be clicked. Falling for a trap is the trap working, not you failing." },
      ],
      hints: {
        tier1: "Tap IN as the ring grows, then OUT as it shrinks. There is no rush and nothing to get wrong.",
        tier2: "After each breath, tap any stone to lift it off. Every single one belongs to somebody else.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] This is the calm-down console. Nothing here is a test.",
          "Tap IN while the ring grows. Tap OUT while it shrinks.",
          "Slow as you like. The ring waits for you.",
          "[whispers] Then lift a stone off, and I'll tell you who it really belonged to.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Breathe in with the ring, then out. Then lift a stone."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look how straight you're standing.",
          "Every one of those stones was somebody else's choice.",
          "[warmly] You were carrying them for nothing, Cyber Hero.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Someone sends you something unkind. Whose fault is it?",
      choices: [
        { text: "Theirs. They chose to send it", isCorrect: true },
        { text: "Mine, a bit, for opening it", isCorrect: false, why: "Opening a message is only reading it. You cannot know what is inside until you look." },
        { text: "Mine, because I replied", isCorrect: false, why: "Replying usually means you wanted it to stop. That never makes their words yours." },
        { text: "Both of ours, really", isCorrect: false, why: "Only one person chose to be unkind, and it was not you." },
      ],
      praise: "Theirs. Always theirs. ✓",
      nudge: "Who actually chose to press send?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's the one!",
          "The person who chose to send it owns it.",
          "You just happened to be the one holding the screen.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "When somebody is unkind to you it was their choice, so the heavy feeling is never yours to carry.",
      next: "the grown-ups who come running when you call",
      emblem: "💪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] One power down, Cyber Hero, and it's the biggest one.",
          "The stones are on the floor where they belong.",
          "[whispers] Now, a lighthouse keeper never works alone...",
          "Next, we name the people who come running. Come and meet them!",
        ],
      },
    },

    /* ─────────── BEAT 2 · NAME YOUR TEAM ─────────── */
    // 8 - Learn
    {
      type: "info",
      title: "Name Your Team",
      content:
        "Every lighthouse has a crew, and so do you. Your team is the grown-ups who come running: a parent or carer, a teacher you like, a grandparent, an aunt or uncle, a club leader. Name them NOW, while nothing is wrong, because a name you already know is much easier to reach for when your tummy drops. And if your team is asleep or far away, Childhelp is awake all night, every night, on 1-800-422-4453.",
      bullets: [
        "Your team is grown-ups who come running",
        "Name them now, before anything is wrong",
        "Three is plenty. One is a start",
        "A grown-up you only know online is not on it",
        "Childhelp is awake all night: 1-800-422-4453",
      ],
      bulletIcons: ["👪", "📌", "🔢", "🚫", "🔔"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] No lighthouse keeper works alone, Cyber Hero. Neither do you.",
          "Your team is the grown-ups who come running.",
          "A parent. A teacher. A grandparent. Somebody you'd shout for.",
          "Name them NOW, while everything is calm and easy.",
          "[warmly] And if they're all asleep, Childhelp is awake. One, eight hundred, four two two, four four five three.",
          "[excited] Come to the radio. Let's call your crew in!",
        ],
      },
    },
    // 9 - Game: CALL (new radioRoll engine)
    {
      type: "radioRoll",
      introTitle: "The Radio Roll",
      introSubtitle: "Turn the dial, then CALL. The grown-ups who come running join your team board.",
      introIcon: "📣",
      dialLabel: "TUNE THE RADIO",
      callLabel: "CALL",
      teamLabel: "MY TEAM",
      teamSize: 3,
      completeTitle: "Your crew is named!",
      completeLine: "Three people who come running, and you knew them before you needed them.",
      channels: [
        { id: "mum", label: "Mum or Dad at home", icon: "🏠", isTeam: true, why: "The people at home come running first, and they would rather know at midnight than find out next week.", explanation: "" },
        { id: "teacher", label: "Mrs Okafor, my teacher", icon: "🎓", isTeam: true, why: "A teacher you like can sort out things that happen with people at school, and they have done it many times before.", explanation: "" },
        { id: "gran", label: "Gran, two streets away", icon: "👪", isTeam: true, why: "Gran is a brilliant pick. Two streets away is close enough to come round, and a grandparent is never too busy for you.", explanation: "" },
        { id: "helpline", label: "Childhelp, 1-800-422-4453", icon: "🔔", isTeam: true, why: "Childhelp is awake every hour of every night, and the person who answers is there to help a child exactly like you.", explanation: "" },
        { id: "static", label: "Static, nobody there", icon: "📱", isTeam: false, why: "", explanation: "That channel is just hiss. When you really need somebody, pick a person you could name out loud instead." },
        { id: "gamer", label: "ShadowFox99, from my game", icon: "🎮", isTeam: false, why: "", explanation: "Somebody from your game cannot come round, cannot ring your school, and might not be who they say they are. Your team stands in the same room as you." },
        { id: "influencer", label: "My favourite streamer", icon: "📣", isTeam: false, why: "", explanation: "A streamer does not know your name and never will. Your team is people who know you back." },
      ],
      hints: {
        tier1: "Turn the dial with the arrows, then tap CALL to see who picks up.",
        tier2: "Your team can come round, ring your school, or sit with you. If they only exist on a screen, they are not on it.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here's the lighthouse radio. Every channel is somebody you could call.",
          "Turn the dial, and tap CALL.",
          "[warmly] The ones who come running join your board.",
          "Let's find three, Cyber Hero!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Turn the dial to a channel, then tap CALL."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Look at that board. Three people who come running.",
          "You named them while everything was calm.",
          "[warmly] That's the trick, Cyber Hero. Now you'll never have to think of one in a hurry.",
        ],
      },
    },
    // 10 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "The best time to name your team is ___.",
      choices: [
        { text: "now, before anything is wrong", isCorrect: true },
        { text: "the moment something goes wrong", isCorrect: false, why: "That is exactly when it is hardest to think. Names you already know come much faster." },
        { text: "after you have tried to fix it yourself", isCorrect: false, why: "You never have to fix it yourself first. Your team wants to hear from you straight away." },
        { text: "only if it happens twice", isCorrect: false, why: "Once is enough. Your team would rather hear about one message than ten." },
      ],
      praise: "Now. While it is calm and easy. ✓",
      nudge: "When is it easiest to think of a name?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Exactly!",
          "You name your team while everything is calm.",
          "Then, on a bad day, the name is already waiting for you.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Your team is the grown-ups who come running, and you name them before anything is wrong.",
      next: "what to do with the sender who keeps going",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! Your crew is named and on the board.",
          "[whispers] But what about the sender, still tapping away out there?",
          "Next, we learn how their signal runs out of fuel.",
          "Come and see, Cyber Hero!",
        ],
      },
    },

    /* ─────────── BEAT 3 · STOP AND BLOCK ─────────── */
    // 12 - Learn
    {
      type: "info",
      title: "Stop and Block",
      content:
        "A mean sender is running on one thing: your reply. Every answer, even an angry one, even a clever one, is fuel that keeps their signal going. So heroes do the opposite of what the sender wants. Stop replying. Block them, which takes their signal off your screen. Then breathe, and tell your team. Blocking is not rude and it is not running away. It is you deciding who gets to reach you.",
      bullets: [
        "Your reply is the fuel. Stop feeding it",
        "An angry reply is still a reply",
        "Block takes their signal off your screen",
        "Blocking is not rude, it is your choice",
        "Then breathe, and tell your team",
      ],
      bulletIcons: ["✋", "💬", "🚫", "👑", "👪"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here's something the sender hopes you never work out.",
          "They're running on your replies.",
          "[whispers] Every answer you send is fuel. Even a clever one. Even an angry one.",
          "So we do the opposite. We stop feeding it.",
          "[excited] Come and watch a signal starve, Cyber Hero!",
        ],
      },
    },
    // 13 - Game: STARVE (DontFeedTheFire re-theme, signal skin). Every spoken
    // line lives here, not in the engine's skin defaults: the clip generator
    // reads the week file, so a line left as a component default ships silent.
    {
      type: "dontFeedTheFire",
      skin: "signal",
      friendName: "Priya",
      friendSupportLine: "Priya's painting is brilliant! Be kind. I'm telling a grown-up too.",
      introTitle: "Starve the Signal",
      introSubtitle: "Mean messages are pings, and every reply is power. Press and HOLD the brass quiet dial to starve each one until the signal fades out.",
      introIcon: "🔔",
      completeTitle: "The signal faded out!",
      completeLine: "No power, no signal. And when a friend is getting pinged, heroes send help and tell a grown-up.",
      sparks: [
        {
          id: "ping-1",
          from: "grumble_gull",
          text: "You're rubbish at this game. Answer me!",
          readAloud: "A ping from grumble gull. You're rubbish at this game. Answer me!",
          why: "You gave it nothing, so there was nothing to burn. Notice how it ends with a demand: answer me. That is the whole trick.",
        },
        {
          id: "ping-2",
          from: "no_name_caller",
          text: "Nobody on this coast wants you around.",
          readAloud: "A ping from no name caller. Nobody on this coast wants you around.",
          why: "Starved again. That caller will not even say who they are, and a name-less caller is hoping you answer before you notice.",
        },
        {
          id: "ping-3",
          from: "buzz_bother",
          text: "Say something back. I'm waiting!",
          readAloud: "A ping from buzz bother. Say something back. I'm waiting!",
          why: "That one asked out loud for the very thing that keeps it going, and you still gave it nothing. The signal is nearly out.",
        },
      ],
      friendRound: {
        id: "friend-ping",
        from: "loudhailer_lou",
        text: "Look at Priya's painting. It's SO wobbly! Everyone laugh at her!",
        readAloud: "A ping from loudhailer lou. Look at Priya's painting. It's so wobbly! Everyone laugh at her!",
        why: "That ping was not aimed at you, so staying quiet would have left Priya on her own. You sent help and told a grown-up, which is the kind way to be loud.",
      },
      teachSpark: {
        title: "Whoa! That's power!",
        body: "That reply is power for their signal, and it makes it stronger however clever the words are. A hero starves it instead.",
        tip: "Press and HOLD the brass quiet dial. No power, no signal.",
      },
      teachFriend: {
        title: "Pinging back is still power",
        body: "But sending mean words back keeps their signal strong, even when you are sticking up for a friend. Priya needs help, not a bigger argument.",
        tip: "Tap the green SEND HELP button instead.",
      },
      teachStoneOnFriend: {
        title: "This ping isn't aimed at you",
        body: "That ping was aimed at Priya, not at you. Going quiet is right when it is about you, but here it would leave her all alone.",
        tip: "Tap the green SEND HELP button to help her and tell a grown-up.",
      },
      hints: {
        tier1: "Anything you send back is power, however clever it is. Look for the move that gives the sender nothing.",
        tier2: "Hold the quiet dial for a ping aimed at you. When a friend is the target, send help and tell a grown-up instead.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The sender's signal is blinking away out on the mast.",
          "Every reply you send is power for it.",
          "[whispers] So give it nothing at all...",
          "[excited] and watch what happens. Go on!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Press and hold the quiet dial to starve a ping aimed at you."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at the mast. Not a flicker left on it.",
          "You never sent a single word back.",
          "[warmly] That's not running away, Cyber Hero. That's you choosing who reaches you.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "if you block me, that PROVES you're scared of me!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Blocking is a choice, not a fright. It means somebody decided you were finished talking." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Blocking is not fear, it is you shutting the door. ✓",
      nudge: "Who is actually in charge when the block button gets pressed?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Nicely caught!",
          "He says blocking is fear because blocking is the one thing that stops him.",
          "The person pressing the button is the person in charge.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A mean sender runs on your replies, so you send nothing, block them, and tell your team.",
      next: "why a picture of it beats deleting it",
      emblem: "🚫",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers, and the mast has gone dark.",
          "[warmly] Now, one thing heroes almost always want to do is delete it.",
          "[whispers] Wait until you hear why we keep it instead...",
          "Next, the camera. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · CAMERA, NOT TRASH ─────────── */
    // 16 - Learn
    {
      type: "info",
      title: "Camera, Not Trash",
      content:
        "When something horrible is on your screen, deleting it feels wonderful for about four seconds. Then it is gone, and so is the proof. A screenshot freezes it: who sent it, what it said, and when. That is what lets a grown-up sort it out fast, and it is not for you to look at again. Snap it, show your team, then let them carry it. You never have to keep reading it.",
      bullets: [
        "Deleting it also deletes the proof",
        "A screenshot freezes who, what and when",
        "Proof is what helps a grown-up act fast",
        "You never have to read it again",
        "Snap it, show it, then let them carry it",
      ],
      bulletIcons: ["🗑️", "📸", "👪", "🤫", "💪"],
      emblem: "📸",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] I know exactly what you want to do with a horrible message.",
          "Delete it. Make it vanish.",
          "[whispers] But when it vanishes, so does the proof.",
          "A picture freezes it: who sent it, what it said, when.",
          "[warmly] Then you hand it over, and you never have to look at it again.",
          "[excited] Into the tray, Cyber Hero. Let's develop some proof!",
        ],
      },
    },
    // 17 - Game: DEVELOP (DevelopingTray re-theme, evidence skin)
    {
      type: "developingTray",
      skin: "evidence",
      introTitle: "The Evidence Tray",
      introSubtitle: "Develop the screenshot, find the three things a grown-up needs, then decide what happens to it.",
      introIcon: "📸",
      developPrompt: "Tap the sheet to develop the screenshot",
      developReadAloud: "Here is the screenshot, still blank. Tap the sheet and let's see what you kept.",
      spotPrompt: "Tap the three things a grown-up needs",
      spotReadAloud: "There it is. Now find the three things that make this useful: who sent it, when it came, and what it actually said.",
      decidePrompt: "Now what happens to it?",
      decideReadAloud: "You have the proof. So what happens to it now: delete it, or show a grown-up?",
      shareLabel: "DELETE IT",
      keepLabel: "SHOW A GROWN-UP",
      why: "You showed it. The proof does the talking now, a grown-up can act on it, and you never have to read it again.",
      teach: {
        title: "That deletes the proof too",
        body: "Deleting feels wonderful for about four seconds. Then the message is gone, and so is the only thing that shows a grown-up who sent it, what it said and when it came. Keep it, show it once, and let them carry it from there.",
        tip: "Snap it, show it, then let your team take it.",
      },
      leakCopy: {
        sender: {
          chip: "Who sent it!",
          bullet: "The sender's name is right there at the top",
          readAloud: "The name at the top. That is who sent it, and it is the first thing anybody will ask you.",
        },
        time: {
          chip: "When it came!",
          bullet: "The time stamp shows exactly when it arrived",
          readAloud: "And the time stamp, which shows exactly when it landed. That matters when there has been more than one.",
        },
        words: {
          chip: "What it said!",
          bullet: "The words themselves, frozen exactly as they were sent",
          readAloud: "Then the words themselves, frozen exactly as they were sent. Now nobody can say it never happened.",
        },
      },
      completeTitle: "Proof developed!",
      completeLine: "Every piece your team needs, and nothing left for you to reread.",
      hints: {
        tier1: "The tray can only develop what was kept. Look for what a grown-up would need to SEE.",
        tier2: "Who sent it, when it came and what it said are the three that matter. Then show it, because deleting takes the proof with it.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] This is the evidence tray. Slide a screen in and it develops.",
          "[whispers] If you kept it, the proof comes up clear...",
          "and if you deleted it, there is nothing to develop at all.",
          "[excited] Let's see what your team can work with!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap the sheet to develop it, then find what a grown-up needs."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every piece of proof, clear as day.",
          "Who sent it, when it came, and what it said.",
          "[warmly] Your team can take it from here, Cyber Hero. You're done carrying it.",
        ],
      },
    },
    // 18 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the evidence steps in order:",
      choices: [
        { text: "Screenshot it", isCorrect: true },
        { text: "Block the sender", isCorrect: true },
        { text: "Show your team", isCorrect: true },
      ],
      praise: "Snap, block, show. The proof survives and the sender does not. ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Perfect order!",
          "Snap it first, because blocking can take the message with it.",
          "Then block, then show your team what you kept.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "A screenshot keeps the proof that a delete would throw away, so you snap it, block, then show your team.",
      next: "putting all five together in one calm drill",
      emblem: "📸",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers, Cyber Hero! The proof is safe and so are you.",
          "[warmly] Now let's put them together, the way firefighters practise.",
          "[whispers] Not because anything is wrong...",
          "but so your hands know what to do. To the drill!",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE EMERGENCY PROTOCOL ─────────── */
    // 20 - Learn
    {
      type: "info",
      title: "The Emergency Protocol",
      content:
        "Here is the whole thing in five calm steps, in the order heroes use them. BREATHE, because a calm head thinks better. SNAP, so the proof is frozen. STOP, meaning send nothing back. BLOCK, so they cannot reach you. TELL your team, and hand the whole thing over. You do not have to remember it perfectly. You just have to start at the first one.",
      bullets: [
        "Breathe: a calm head thinks better",
        "Snap: freeze the proof",
        "Stop: send nothing back",
        "Block: take their signal off your screen",
        "Tell: hand it to your team",
      ],
      bulletIcons: ["🔔", "📸", "✋", "🚫", "👪"],
      emblem: "🚀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Five steps, Cyber Hero, and you already know every one.",
          "Breathe. Snap. Stop. Block. Tell.",
          "Firefighters practise on calm days so their hands know the way.",
          "[whispers] That's all this is. A practice run.",
          "[excited] Take the drill!",
        ],
      },
    },
    // 21 - Game: DRILL (new drillRun engine)
    {
      type: "drillRun",
      introTitle: "The Drill Run",
      introSubtitle: "A practice call-out. Pick the next move and the drill moves on, one calm step at a time.",
      introIcon: "🚀",
      railLabel: "THE DRILL",
      situationLabel: "WHAT'S HAPPENING",
      completeTitle: "Drill complete!",
      completeLine: "Breathe, snap, stop, block, tell. Your hands know the way now.",
      threat: {
        raccoonLine: "Five steps? In a panic? Nobody remembers five of anything when their tummy drops. You'll freeze, little captain, and I'll still be there.",
      },
      steps: [
        {
          id: "breathe",
          stepLabel: "Breathe",
          situation: "A message lands and your tummy drops. Your heart is going fast.",
          options: [
            { id: "breath", label: "Take three slow breaths", icon: "🔔", isRight: true, why: "A fast heart makes everything look worse. Three slow breaths and your thinking comes back online.", explanation: "" },
            { id: "reply-fast", label: "Fire something back right now", icon: "💬", isRight: false, why: "", explanation: "That is the one thing the sender is hoping for. Nothing good gets typed by a racing heart." },
            { id: "hide", label: "Shove the phone under a cushion", icon: "🙈", isRight: false, why: "", explanation: "Hiding the message does not un-send it, and your heart is still going fast under that cushion." },
          ],
        },
        {
          id: "snap",
          stepLabel: "Snap",
          situation: "You are calmer. The message is still on the screen.",
          options: [
            { id: "screenshot", label: "Screenshot it", icon: "📸", isRight: true, why: "Now the proof is frozen: who sent it, what it said, when it came. That is what lets a grown-up act fast.", explanation: "" },
            { id: "delete", label: "Delete it, quick", icon: "🗑️", isRight: false, why: "", explanation: "It feels wonderful for about four seconds, and then the proof is gone too. Snap it first." },
            { id: "read-again", label: "Read it a few more times", icon: "👀", isRight: false, why: "", explanation: "Reading the message again only hurts you twice, and it is still there on the screen either way. One picture is all anybody needs." },
          ],
        },
        {
          id: "stop",
          stepLabel: "Stop",
          situation: "The proof is safe. Your thumbs are itching to answer.",
          options: [
            { id: "nothing", label: "Send nothing at all", icon: "✋", isRight: true, why: "Those itching thumbs are exactly what the sender is waiting for. Send nothing and there is nothing to burn.", explanation: "" },
            { id: "clever", label: "One clever comeback", icon: "💬", isRight: false, why: "", explanation: "Clever or not, it is still an answer, and answering is what those itching thumbs want to do. The sender does not mind which kind they get." },
            { id: "friends", label: "Forward it to your friends", icon: "📣", isRight: false, why: "", explanation: "Now it is on more screens than before, and the sender got an audience out of it." },
          ],
        },
        {
          id: "block",
          stepLabel: "Block",
          situation: "You have not replied. The sender is still there in your app.",
          options: [
            { id: "block-them", label: "Block the sender", icon: "🚫", isRight: true, why: "Blocking takes that sender out of your app for good. It is not rude and it is not fear, it is you choosing who reaches you.", explanation: "" },
            { id: "mute", label: "Just mute them for now", icon: "🤫", isRight: false, why: "", explanation: "Muting leaves the sender in your app, still sending, just where you cannot see it. Blocking is the one that closes the door." },
            { id: "new-account", label: "Make a whole new account", icon: "📱", isRight: false, why: "", explanation: "That is a lot of work to avoid one button, and everything you built goes with it. Block them instead." },
          ],
        },
        {
          id: "tell",
          stepLabel: "Tell",
          situation: "Blocked, and the proof is in your camera roll.",
          options: [
            { id: "team", label: "Show a grown-up on your team", icon: "👪", isRight: true, why: "This is the step that ends it. You hand over the whole thing and stop carrying it by yourself.", explanation: "" },
            { id: "alone", label: "Sort it out on your own", icon: "💪", isRight: false, why: "", explanation: "You are brave enough, but the proof you saved is exactly what a grown-up can act on. They can do things you cannot, like ring a school." },
            { id: "wait", label: "Wait and see if it happens again", icon: "⏱️", isRight: false, why: "", explanation: "Once is already enough, and that proof is safe now either way. Waiting just means carrying it longer." },
          ],
        },
      ],
      hints: {
        tier1: "Ask what a calm hero does next. The drill only moves on when the move is the right one.",
        tier2: "Breathe, snap, stop, block, tell. Anything that sends something back, or throws the proof away, is not it.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Practice run, Cyber Hero. Nothing here is real.",
          "A call-out comes in and you pick the next move.",
          "[whispers] Get it right and the drill rolls on.",
          "[excited] Breathe, snap, stop, block, tell. Off we go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Read what's happening, then pick the calm next move."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Drill complete, and you never once rushed.",
          "Breathe. Snap. Stop. Block. Tell.",
          "[warmly] Your hands know the way now, and that's the whole point of practising.",
        ],
      },
    },
    // 22 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! What is the very FIRST step of the protocol?",
      speedMs: 5000,
      choices: [
        { text: "Breathe", isCorrect: true },
        { text: "Block them", isCorrect: false, why: "Blocking comes later. A calm head comes first, so the rest goes right." },
        { text: "Reply once", isCorrect: false, why: "Replying is never a step. It is the fuel the sender wants." },
      ],
      praise: "Breathe. Everything else works better after it. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] First time!",
          "Breathe comes first, every single time.",
          "A calm head makes the other four steps easy.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "The protocol is five calm steps in order: breathe, snap, stop, block, tell.",
      next: "one last shift in the lighthouse, answering real call-outs",
      emblem: "🚀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Cyber Hero!",
          "Never your fault. Your team named. The signal starved,",
          "the proof developed... and the drill run clean.",
          "[whispers] One last shift in the lighthouse...",
          "[excited] and real call-outs coming in. Come on!",
        ],
      },
    },

    // 24 - REVIEW: The Rescue Board (AccountRescue, "moves" skin - five call-outs,
    // five powers, one each. NOT the "rescue" skin: that one is the W5 password drill.)
    {
      type: "accountRescue",
      skin: "moves",
      tileLayout: "wrap",
      introTitle: "The Rescue Board",
      introSubtitle: "Five call-outs light up the board. Each hero needs one of this week's powers. Send the right one.",
      introIcon: "🔔",
      headerLabel: "🔔 The Rescue Board",
      storyLine: "Five call-outs came in tonight, and every one of them needs something you already know.",
      needsLabel: "NEEDS YOU",
      leakedAccountId: "froze",
      bankPrompt: "Send a power to",
      bankIdle: "Tap a call-out first ↑",
      securedLabel: "✓ HELPED",
      countLabel: "helped",
      duplicateToast: "That power is already out on another call-out",
      pickToast: "HELP SENT!",
      allToast: "BOARD CLEAR!",
      finishLabel: "Light the lamp",
      finishReadyLabel: "Light the lamp",
      wrongTitle: "Not the power this one needs",
      completeTitle: "Every call-out answered!",
      completeLine: "Five heroes helped, and not one of them carrying it alone now.",
      threat: {
        raccoonLine: "Five at once! Nobody keeps five calm steps straight with a board lit up like that. Somebody is bound to panic.",
      },
      accounts: [
        {
          id: "froze",
          label: "Sam froze",
          icon: "🔔",
          readAloud: "Sam's tummy dropped when a mean message landed, and now Sam is just staring at the screen.",
          correctMoveId: "breathe",
          why: "Breathing is always the first move. A racing heart cannot think, and everything else works better once Sam is calm.",
          whyWrong: "Sam is frozen, so nothing else will happen yet. The very first step of the protocol comes before all the others.",
        },
        {
          id: "arguing",
          label: "Ali keeps replying",
          icon: "💬",
          readAloud: "Ali has sent eleven messages back, and every reply is cleverer than the last one.",
          correctMoveId: "block",
          why: "Every reply was fuel, however clever it was. Sending nothing and blocking takes the sender's signal off Ali's screen.",
          whyWrong: "Ali is still typing, so this one is about the replies first. What keeps a mean sender going?",
        },
        {
          id: "blaming",
          label: "Nia blames herself",
          icon: "💪",
          readAloud: "Nia thinks the whole thing is her fault because she posted the photo in the first place.",
          correctMoveId: "fault",
          why: "Posting a photo is not the same as choosing to be unkind about it. The person who wrote the words owns them, not Nia.",
          whyWrong: "Nia is carrying a stone that was never hers. Before anything practical, she needs the biggest truth of the week.",
        },
        {
          id: "deleted",
          label: "Theo deleted it",
          icon: "📸",
          readAloud: "Theo deleted the message straight away, and now a grown-up is asking what it actually said.",
          correctMoveId: "proof",
          why: "A screenshot would have frozen who sent it, what it said and when. Next time Theo snaps it before anything else disappears.",
          whyWrong: "Theo has nothing left to show anybody. Think about what a delete takes with it.",
        },
        {
          id: "alone",
          label: "Kai told nobody",
          icon: "👪",
          readAloud: "Kai has been carrying this on their own for a whole week, and has not told a single grown-up.",
          correctMoveId: "team",
          why: "A week is a long time to carry something alone. Kai's team can do things Kai cannot, and telling late still counts.",
          whyWrong: "Coping alone that long is the hard part, and Kai has already done it. What is missing is other people.",
        },
      ],
      passwordBank: [
        { id: "breathe", text: "Breathe first", icon: "🔔" },
        { id: "proof", text: "Screenshot it", icon: "📸" },
        { id: "block", text: "Send nothing, then block", icon: "🚫" },
        { id: "team", text: "Tell your team", icon: "👪" },
        { id: "fault", text: "It was never your fault", icon: "💪" },
      ],
      hints: {
        tier1: "Read what this hero is stuck on, then send the one power that unsticks them.",
        tier2: "Frozen needs a breath. Replying needs a block. Self-blame needs the truth. A deleted message needs proof. Carrying it alone needs a team.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Your last shift, Cyber Hero. The board is lighting up.",
          "Every call-out is a hero who needs one of your five powers.",
          "[warmly] Read each one, then send the right help.",
          "[excited] The light's on you!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a call-out, then send the power that hero needs."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every light on the board answered.",
          "Five heroes, five powers, and not one of them carrying it alone now.",
          "[excited] You're ready for him, Team Captain. Let's go!",
        ],
      },
    },

    // 25 - BOSS BATTLE
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the calm captain
    { type: "video", videoPlaceholder: "Week 11: Team Captain", videoSrc: "/videos/module-11-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "fault", label: "Never Your Fault", accent: "#7df0ff", icon: "💪", summary: "Someone unkind made THEIR choice, and it was never yours to carry." },
        { id: "team", label: "My Team", accent: "#ffd158", icon: "👪", summary: "Named before you needed them, plus Childhelp 1-800-422-4453, always awake." },
        { id: "block", label: "Stop & Block", accent: "#c084fc", icon: "🚫", summary: "Your reply is the fuel, so you send nothing and close the door." },
        { id: "camera", label: "Camera, Not Trash", accent: "#ff5fb3", icon: "📸", summary: "A screenshot freezes the proof a delete would throw away." },
        { id: "protocol", label: "The Protocol", accent: "#7eff97", icon: "🚀", summary: "Breathe, snap, stop, block, tell, in that order, calmly." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The stones put down, the crew named,",
          "the signal starved, the proof developed... and the drill run clean.",
          "[warmly] Whatever lands on your screen, you know exactly what to do.",
          "[excited] Sticker time, Team Captain!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "balloon-lifter", name: "Stone Lifter", icon: "💪", description: "Puts down every heavy stone that was never theirs." },
        { id: "team-namer", name: "Team Namer", icon: "👪", description: "Named their crew before they needed it." },
        { id: "evidence-freezer", name: "Evidence Freezer", icon: "📸", description: "Camera first, trash never. The proof stays safe." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three stickers, Team Captain!",
          "Stone Lifter. Team Namer. Evidence Freezer.",
          "[warmly] And a lighthouse that never goes dark, Cyber Hero.",
        ],
      },
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ff9528",
    theme: {
      topic: "Emergencies",
      motifs: ["✋", "📸", "🔔", "👪", "⚠️", "🚫", "🛡️", "💬"],
    },
    intro: {
      slug: "quiz-w11-intro",
      text: "Ah, the little captain! I hear you learned five calm steps. Calm! Steps! Let's see if they hold when my quiz-machine gives them a wobble!",
    },
    victory: {
      slug: "quiz-w11-victory",
      text: "Every boulder... floated?! Fine! I'll lug my blame machine home myself. It's heavier than it looks, and NOBODY is helping me carry it!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w11-c1",
        key: "quiz-w11-c1-1",
        label: "Never Your Fault",
        ask: {
          slug: "quiz-w11-ask-c1-1",
          text: "A kid sends a horrid message, then says 'you MADE me do it, your drawing was silly.' What's true?",
        },
        options: [
          { text: "Being unkind was their choice, it is never my fault" },
          { text: "It's a little bit my fault for posting the drawing" },
          { text: "It's only my fault if I reply back" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Their choice, never yours!",
          explanation: "'You made me' is a trick, nobody can make someone be unkind. Not posting, not replying, nothing you did. The person who chose the mean words is the only one at fault.",
        },
        villainRight: {
          slug: "quiz-w11-right-c1-1",
          text: "Their choice, not yours?! But I painted that blame boulder SO convincingly!",
        },
        villainWrong: {
          slug: "quiz-w11-wrong-c1-1",
          text: "A little bit your fault? Splendid! I sell fault by the little bit, first slice free!",
        },
      },
      {
        phaseId: "phase-w11-c2",
        key: "quiz-w11-c2-1",
        label: "Name Your Team",
        ask: {
          slug: "quiz-w11-ask-c2-1",
          text: "It's the middle of the night, everyone at home is asleep, and a worry is growing. Who can you still reach?",
        },
        options: [
          { text: "Childhelp, 1-800-422-4453, free and always awake" },
          { text: "Nobody until morning, worries have to wait" },
          { text: "A friendly player from my game, they're online all night" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Someone is always awake!",
          explanation: "Worries don't have to wait for morning, and a game stranger isn't a helper. Childhelp, 1-800-422-4453, is free, just for kids, and always awake. Your team never fully sleeps.",
        },
        villainRight: {
          slug: "quiz-w11-right-c2-1",
          text: "The golden number?! Everyone asleep, and there is STILL a helper awake?! Who approved this?!",
        },
        villainWrong: {
          slug: "quiz-w11-wrong-c2-1",
          text: "Wait till morning, wait till NEXT week! Worries age beautifully overnight!",
        },
      },
      {
        phaseId: "phase-w11-c3",
        key: "quiz-w11-c3-1",
        label: "Stop and Block",
        ask: {
          slug: "quiz-w11-ask-c3-1",
          text: "Your friend says 'just reply STOP and the meanie will quit.' What's the better move?",
        },
        options: [
          { text: "Don't reply at all, block instead, even STOP feeds them" },
          { text: "Reply STOP once, politely, then wait and see" },
          { text: "Reply STOP in capitals so they know you mean it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Not even one STOP!",
          explanation: "Even a polite 'stop' is a reply, and a reply is what the sender is fishing for. Block shuts the door without giving them a single thing, then tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w11-right-c3-1",
          text: "Not even one tiny STOP?! I had a whole comeback speech memorized!",
        },
        villainWrong: {
          slug: "quiz-w11-wrong-c3-1",
          text: "One polite STOP coming up! And then a reply to the reply to the reply!",
        },
      },
      {
        phaseId: "phase-w11-c4",
        key: "quiz-w11-c4-1",
        label: "Camera, Not Trash",
        ask: {
          slug: "quiz-w11-ask-c4-1",
          text: "A message says 'do what I say or you're banned from the game!' Your thumb hovers over delete. What comes first?",
        },
        options: [
          { text: "Camera, freeze the proof, then show a trusted grown-up" },
          { text: "Delete it fast so it can't scare me again" },
          { text: "Beg them not to ban me, just in case" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Freeze it first!",
          explanation: "Deleting makes it feel gone, but then there's nothing to show your team, and begging tells the trickster the trick is working. Screenshot first, then a trusted grown-up can see exactly what happened and help fast.",
        },
        villainRight: {
          slug: "quiz-w11-right-c4-1",
          text: "Frozen AND shown?! Your thumb was supposed to hit delete, not reach for the camera!",
        },
        villainWrong: {
          slug: "quiz-w11-wrong-c4-1",
          text: "Poof, deleted! Nothing to show anybody... so I'll just send another one!",
        },
      },
      {
        phaseId: "phase-w11-c5",
        key: "quiz-w11-c5-1",
        label: "The Protocol",
        ask: {
          slug: "quiz-w11-ask-c5-1",
          text: "A horrid message is on your screen RIGHT NOW and your heart is going fast. What's step one?",
        },
        options: [
          { text: "STOP, hands off, send nothing back" },
          { text: "Screenshot it before anything else" },
          { text: "Block the sender before they send more" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "STOP comes first!",
          explanation: "Screenshot and block are real steps, but they come after. Step one is STOP, hands off, send nothing back. Calm fingers first, then the camera, then the door.",
        },
        villainRight: {
          slug: "quiz-w11-right-c5-1",
          text: "Hands off FIRST?! But itchy fingers are my favorite fingers!",
        },
        villainWrong: {
          slug: "quiz-w11-wrong-c5-1",
          text: "Skipping straight to the middle? A wobbly first step makes the whole drill wobble!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-11-team-captain.png",

  // Week-lane attack theatre: the blame-and-silence tricks only (mean-words
  // feelings = W5; stranger red flags = W3; this week is the response drill).
  bossAttacks: [
    { name: "BLAME BOULDER", icon: "🙈", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Never your fault",        emblemColor: 0xc084fc },
    { name: "SECRET WEIGHT", icon: "🤐", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Telling makes it lighter", emblemColor: 0xffd158 },
    { name: "DELETE TRICK",  icon: "🗑️", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Camera, not trash",        emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W11 COMBAT - pop the blame balloon
  // machine - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Someone sends you a horrid message. Whose fault is it?", answers: ["Theirs - they chose to send it", "Yours", "A little bit yours", "Nobody knows"], correctIndex: 0, explanation: "The sender made the choice - it is never your fault." },
      { question: "What's the golden number on every kid's team poster?", answers: ["Childhelp 1-800-422-4453", "911 for everything", "Your best friend's number", "There isn't one"], correctIndex: 0, explanation: "Childhelp - free, just for kids, always awake." },
      { question: "A nasty message arrives. What happens to it FIRST?", answers: ["Screenshot - freeze the proof", "Delete it fast", "Reply to it", "Forward it to friends"], correctIndex: 0, explanation: "Camera, not trash - your team helps best when they can see." },
    ],
    medium: [
      { question: "Why do heroes NOT reply to mean messages?", answers: ["A reply is exactly what the sender wants", "Replying costs money", "Replying shows them you're not scared", "They do reply"], correctIndex: 0, explanation: "Starve it, don't feed it - block instead." },
      { question: "Why does deleting the message make things harder?", answers: ["Your team can't see the proof anymore", "Deleting is against the rules", "The sender just sends it again", "It doesn't"], correctIndex: 0, explanation: "Seeing the evidence is how grown-ups help fast - freeze it first." },
      { question: "When do you pick the grown-ups on your team?", answers: ["Now - before you ever need them", "Only after something goes wrong", "Never - handle it alone", "When you turn 13"], correctIndex: 0, explanation: "Captains pick their team early - then help is one tell away." },
    ],
    hard: [
      { question: "Why does 'keep it secret' make everything heavier?", answers: ["Carrying it alone grows the worry - telling shares the weight", "Secrets are illegal", "Grown-ups always find out", "It doesn't"], correctIndex: 0, explanation: "Telling someone starts making it lighter right away - that's the whole trick." },
      { question: "The full protocol, in order, is...", answers: ["Stop → Screenshot → Block → Tell → Childhelp if needed", "Reply → Delete → Forget", "Stop → Block → Screenshot → Tell", "Screenshot → Fire back → Tell"], correctIndex: 0, explanation: "Fingers, camera, door, team, phone - freeze the proof BEFORE the door shuts." },
      { question: "Your friend says 'don't tell anyone what happened to me online.' What's the hero move?", answers: ["Tell a trusted grown-up anyway - some secrets need helpers", "Promise and keep the secret", "Post about it", "Ignore your friend"], correctIndex: 0, explanation: "Safety secrets are the kind you SHARE with a grown-up - that's real friendship." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 11 - the lighthouse!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Tummy-drop messages. Let's help." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Here's the calm plan, hero." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "thumbsup", message: "Five steps, one light." } }, // mission brief
    4: { adam: { mood: "thinking", message: "The biggest truth first..." }, layla: null }, // learn: fault
    5: { adam: { mood: "warm", message: "Breathe with me, Cyber Hero." }, layla: null }, // game: calm console
    6: { adam: null, layla: { mood: "thumbsup", message: "Whose choice was it?" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "Stones down. Four powers to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Who comes running for you?" } }, // learn: team
    9: { adam: null, layla: { mood: "excited", message: "Call your crew in!" } }, // game: radio roll
    10: { adam: { mood: "thumbsup", message: "When do we name them?" }, layla: null }, // prove: finish
    11: { adam: { mood: "excited", message: "Your crew is on the board!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Their signal runs on your replies." }, layla: null }, // learn: block
    13: { adam: { mood: "curious", message: "Give it nothing at all." }, layla: null }, // game: starve the signal
    14: { adam: null, layla: { mood: "worried", message: "Blocking is fear? Catch him!" } }, // prove: lie
    15: { adam: null, layla: { mood: "excited", message: "The mast went dark!" } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "Don't delete it. Snap it." } }, // learn: camera
    17: { adam: null, layla: { mood: "excited", message: "Let's develop the proof!" } }, // game: evidence tray
    18: { adam: { mood: "thumbsup", message: "Snap, block, show - in order!" }, layla: null }, // prove: order
    19: { adam: { mood: "excited", message: "The proof is safe!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Five calm steps, in order." }, layla: null }, // learn: protocol
    21: { adam: { mood: "curious", message: "Practice run. Nothing is real." }, layla: null }, // game: drill run
    22: { adam: null, layla: { mood: "thumbsup", message: "Quick - what comes first?" } }, // prove: speed
    23: { adam: null, layla: { mood: "excited", message: "All five powers - last shift!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "The board is lighting up!" } }, // review: rescue board
    25: { adam: { mood: "worried", message: "His blame machine - unplug it!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the calm captain!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, Team Captain!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Team Captain badge earned!" }, layla: null }, // completion
  },
};

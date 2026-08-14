/**
 * Mission 08 — "The Perfect Message" (Block 2: The Human Factor, SECRET).
 * Actor: GHOSTWRITER ①. Map slot: curriculum-map-v1 §M08.
 *
 * Teaching register (ages 10–13): the old tells are dead — machines
 * write flawless scams now. The machine-clues (specificity without
 * relationship, warmth without history, flattery floods) are taught
 * as CLUES that decay, never as a reliable detector. The durable
 * defense: verify by SOURCE, never by style (ties to M07's protocol).
 *
 * Safeguarding frame: the Pen Pal is a SCAM arc (money/codes). The
 * protective grooming frame stays with Heroes W3/W11 per the map's
 * sensitive-topics policy.
 */

import Mission08Incident from "../incidents/Mission08Incident";
import type { MissionManifest } from "../engine/types";

export const mission08: MissionManifest = {
  id: "explorers-m08",
  caseNumber: "CASE 008",
  title: "Catfish",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "GHOSTWRITER",
    mo: "Writes perfect fakes. The writer never existed.",
    portrait: "/explorers/actors/ghostwriter.png",
  },

  hook: "A new online friend is funny, kind, likes everything you like. Perfect, really. Way too perfect. Let's meet the ghost doing the typing.",
  scene: "/explorers/scenes/m08-cold-open.jpg",

  transmission: {
    headline: "NEW PEN PAL",
    lines: [
      "A student's had a shiny new online friend for two weeks now.",
      "Funny, kind, loves every single thing she loves. What are the odds?",
      "Yesterday, this “friend” asked for a small favour.",
      "Time to meet the ghost doing the typing.",
    ],
  },

  briefing: {
    summary:
      "Ghostwriter writes flawless fakes: perfect spelling, perfect warmth, and nobody actually behind them. Nice writing proves nothing now.",
    objectives: [
      "Forget the old typo clues",
      "Read the machine's clues",
      "Check the writer, not the writing",
    ],
    wrenLine: "If it sounds too perfect, don't check the writing. Check the writer.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: old tells are dead */
    {
      id: "polish",
      title: "Perfect writing proves nothing",
      concept: "Machines write perfect fakes now",
      promise: "You'll learn why perfect writing means nothing.",
      instruction: "Tap the 3 whispers under the perfect writing.",
      intel: {
        beats: [
          "You may have heard that scams are full of typos.",
          "That rule is out of date now.",
          "Ghostwriter lets a machine write his messages, perfectly, for free. So perfect spelling proves nothing.",
          "But look closely. The fake still leaves a few quiet tells. Here are three.",
        ],
        beatAudio: [
          "/audio/wren/m08-c1-b1.mp3",
          "/audio/wren/m08-c1-b2.mp3",
          "/audio/wren/m08-c1-b3.mp3",
          "/audio/wren/m08-c1-b4.mp3",
        ],
        prediction: {
          question: "Why don't typos give scams away now?",
          options: [
            "Scammers started studying harder",
            "Machines write the scams now, perfectly",
            "Typos never mattered anyway",
          ],
          answer: 1,
          right: "Right. A machine writes ten thousand perfect messages before breakfast.",
          wrong: "No study needed. The scammer types, and the machine writes it perfectly.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 whispers under the perfect writing.",
          device: { app: "DM", owner: "FIRST CONTACT · CAPTURED" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "sunny_sketches_09 · 0 mutual friends" } },
          ],
          body: [
            [{ id: "w1", text: "hiii! saw your comment on the Star Chasers forum. you're SO funny and talented!", tellId: "flattery" }],
            [{ id: "w2", text: "I go to Hillcrest, right near your school! basically neighbors 😄", tellId: "specificity" }],
            [{ id: "w3", text: "I feel like we're already best friends. you can tell me anything, honestly", tellId: "warmth" }],
            [{ id: "w4", text: "my favorite episode is the moon one, obviously" }],
          ],
          tells: [
            {
              id: "flattery",
              label: "The flattery flood",
              why: "Compliments before knowing you. Real people warm up slower.",
            },
            {
              id: "specificity",
              label: "Knows facts, not you",
              why: "Knows your school, shares zero history. Facts minus friendship equals research.",
            },
            {
              id: "warmth",
              label: "Best friends too fast",
              why: "“Already best friends” on day one. Real warmth takes time.",
            },
          ],
          doneLine: "Perfect spelling, three whispers. The writing is perfect. The writer is the question.",
        },
      },
      playAudio: "/audio/wren/m08-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A message is beautifully written. That proves:",
            options: [
              "It's safe to trust",
              "Nothing, machines write beautifully for free",
              "The sender is clever",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“I know your school” from someone you've never met is:",
            options: [
              "Neighborly",
              "Research dressed up as friendship",
              "A lucky guess",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the machine's clues */
    {
      id: "mirror",
      title: "The perfect mirror",
      concept: "Clues help today, not forever",
      promise: "You'll watch a fake friendship get built.",
      instruction: "Predict the pen pal's next move. Three rounds.",
      intel: {
        beats: [
          "Into the simulator. We replay a real pen-pal scam.",
          "Watch what the machine does well: mirroring. It loves everything you love, instantly.",
          "And watch what it can't do: take time. Real feelings are slow. Scripts are instant.",
          "These are clues, not proof. They fade as machines improve. Watch closely anyway.",
        ],
        beatAudio: [
          "/audio/wren/m08-c2-b1.mp3",
          "/audio/wren/m08-c2-b2.mp3",
          "/audio/wren/m08-c2-b3.mp3",
          "/audio/wren/m08-c2-b4.mp3",
        ],
        prediction: {
          question: "Can these clues ALWAYS catch a machine fake?",
          options: [
            "Yes, clues are forever",
            "No, clues fade as machines improve",
            "Only in long messages",
          ],
          answer: 1,
          right: "Right. Treat clues as whispers, not alarms. The real defense is next.",
          wrong: "Machines improve monthly. Today's clue is tomorrow's fixed bug. Whispers, not alarms.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback: the pen-pal scam, move by move",
          steps: [
            {
              scene:
                "“no way, you like Star Chasers too?? literally NOBODY at my school does. we're basically twins 😂”",
              question: "what's the next move?",
              options: [
                "Ask for money right now",
                "Mirror more of your interests, build the twin feeling",
                "Say goodbye forever",
              ],
              answer: 1,
              reveal:
                "Every reply mirrors you back: your shows, your jokes, your opinions. Machines are perfect mirrors. The twin feeling IS the product.",
            },
            {
              scene:
                "Two weeks of daily chats. Then: “ugh. family stuff. might not be online for a while 😞”",
              question: "what's the next move?",
              options: [
                "They disappear politely",
                "A crisis appears that only YOU can fix",
                "They introduce you to their family",
              ],
              answer: 1,
              reveal:
                "“My data's running out and mum won't top up… could you send a gift card code? a tiny one 🙏” That crisis is bait. It sets up the ask.",
            },
            {
              scene:
                "You say you're not sure. The reply lands in under five seconds: “wow. ok. after EVERYTHING I've shared with you??”",
              question: "what just happened?",
              options: [
                "Instant guilt: the payback lever, scripted",
                "A genuine, thought-through reaction",
                "A typing accident",
              ],
              answer: 0,
              reveal:
                "Real hurt takes time. Scripts answer in seconds. And notice the lever: payback, straight off the M06 board. The levers never change. Only the writer did.",
            },
          ],
          doneLine: "MIRROR, CRISIS, GUILT. THE FRIENDSHIP WAS A SCRIPT WITH YOUR NAME PASTED IN.",
        },
      },
      playAudio: "/audio/wren/m08-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "The new friend loves EVERYTHING you love. Most likely:",
            options: [
              "Destiny",
              "A mirror reflecting you back",
              "Great taste",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A hurt, guilt-heavy reply arrives in five seconds. That speed means:",
            options: [
              "They're very emotional",
              "A script, real feelings take longer",
              "Good wifi",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: verify by source */
    {
      id: "source",
      title: "Check the writer",
      concept: "Check the source, not the style",
      promise: "You'll learn the check no machine can fake.",
      instruction: "Pick the move that unmasks the writer.",
      intel: {
        beats: [
          "So if style proves nothing, what does? Whether the person is real.",
          "A machine can write a person. It cannot BE one.",
          "No real school, no real mutuals, no real anywhere.",
          "Style takes forty seconds to fake. A whole life can't. Check the life, not the writing.",
        ],
        beatAudio: [
          "/audio/wren/m08-c3-b1.mp3",
          "/audio/wren/m08-c3-b2.mp3",
          "/audio/wren/m08-c3-b3.mp3",
          "/audio/wren/m08-c3-b4.mp3",
        ],
        prediction: {
          question: "What beats a perfect fake every time?",
          options: [
            "Reading it even more carefully",
            "Checking the source: does this person exist anywhere real?",
            "Asking “are you a bot?”",
          ],
          answer: 1,
          right: "Exactly. Anyone can fake writing. Nobody can fake a whole life.",
          wrong: "You can't beat a machine at reading. Bots just lie. Check if the person is REAL.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the move that unmasks the writer.",
          situation:
            "The pen pal wants to move to a private app: “just us 💛”. They ask again about that gift card. Softly. Kindly.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "kind",
              label: "Keep chatting, they're clearly going through a lot",
              outcome:
                "The crisis is the fuel the script runs on. Every kind reply powers the next ask. Kindness deserves a real person.",
            },
            {
              id: "quiz",
              label: "Test them with tricky questions about Hillcrest",
              outcome:
                "Machines answer anything, smoothly and instantly. A quiz just tests their made-up story. You need the real world.",
            },
            {
              id: "source",
              label: "Stop and check the source: real-world proof, plus an adult",
              correct: true,
              outcome:
                "No Hillcrest student matches. No real-world links anywhere. An adult helps you report it. The whole friend was forty seconds of machine writing.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m08-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "“Verify by source” means:",
            options: [
              "Read the message twice",
              "Check the sender is real, on places you trust",
              "Ask them very politely",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "“Let's move to a private app, just us” is usually:",
            options: [
              "Cozy and flattering",
              "Getting you alone, fewer people watching",
              "More convenient",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Pen Pal",
    phases: 3,
    phaseNames: ["Read the timeline", "Hold the line", "The unmasking"],
    component: Mission08Incident,
  },

  debrief: {
    report: [
      "Old clues dropped: perfect writing proves nothing when machines write for free.",
      "Saw it built live: mirror, crisis, then guilt. A script with your name pasted in.",
      "Source checked, adult brought in, fake friend unmasked and reported.",
    ],
    realWorldMove:
      "This week: pick one message that sounds too perfect. Check its source. Does the sender really exist somewhere you trust? Writing proves nothing. A real life does.",
    wrenLine: "The pen pal never existed. Your checks do. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m08-transmission.mp3",
    briefing: "/audio/wren/m08-briefing.mp3",
    debrief: "/audio/wren/m08-debrief.mp3",
  },

  dossier: {
    mo: "Writes flawless fakes: warm, funny, perfectly spelled. “I can be anyone you want.” Trouble is, nobody's actually there.",
    defeatedBy: "Anyone who checks the real life behind the words, not the writing. A machine can write a person. It can't be one.",
  },
};

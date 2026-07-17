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
  title: "The Perfect Message",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "GHOSTWRITER",
    mo: "Writes flawless fakes. The writer never existed.",
    portrait: "/explorers/actors/ghostwriter.png",
  },

  hook: "A stranger online sounds like your perfect friend. Too perfect. Let's check the writer.",
  scene: "/explorers/scenes/m08-cold-open.jpg",

  transmission: {
    headline: "NEW PEN PAL",
    lines: [
      "A student's been chatting to a new online friend for two weeks.",
      "The friend is funny, kind, and loves everything she loves.",
      "Yesterday, the friend asked for a small favor.",
      "Today we find out who's really typing.",
    ],
  },

  briefing: {
    summary:
      "GHOSTWRITER's scams have perfect grammar and perfect warmth. Style can't clear anyone anymore.",
    objectives: [
      "Retire the old tells",
      "Read the machine's clues",
      "Verify by source, not style",
    ],
    wrenLine: "If it sounds too right, check who's writing, Operative.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: old tells are dead */
    {
      id: "polish",
      title: "Polish proves nothing",
      concept: "Machines write flawless fakes now",
      promise: "You'll learn why perfect writing means nothing.",
      instruction: "Tap the 3 whispers under the perfect writing.",
      intel: {
        beats: [
          "You were maybe taught: scams have typos.",
          "That era is over.",
          "Machines write the scams now. Flawlessly. For free.",
          "Perfect spelling proves exactly nothing.",
          "But listen closer — patterns still whisper.",
          "Three whispers, coming up.",
        ],
        prediction: {
          question: "Why don't typos expose scams anymore?",
          options: [
            "Scammers started studying harder",
            "Machines write the scams now — flawlessly",
            "Typos never mattered anyway",
          ],
          answer: 1,
          right: "Right. A machine writes ten thousand perfect messages before breakfast.",
          wrong: "No study needed — the scammer types a prompt, the machine writes perfection.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 whispers under the perfect writing.",
          device: { app: "DM", owner: "FIRST CONTACT · CAPTURED" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "sunny_sketches_09 — 0 mutual friends" } },
          ],
          body: [
            [{ id: "w1", text: "hiii! saw your comment on the Star Chasers forum — you're SO funny and talented", tellId: "flattery" }],
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
              label: "Facts without relationship",
              why: "Knows your school, shares zero history. Facts minus friendship equals research.",
            },
            {
              id: "warmth",
              label: "Warmth without history",
              why: "“Already best friends” on day one. Warmth needs time; costumes don't.",
            },
          ],
          doneLine: "Perfect spelling, three whispers. The writing is flawless — the writer is the question.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A message is beautifully written. That proves:",
            options: [
              "It's safe to trust",
              "Nothing — machines write beautifully for free",
              "The sender is clever",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“I know your school” from someone you've never met is:",
            options: [
              "Neighborly",
              "Research pretending to be relationship",
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
      concept: "Clues help today; they decay tomorrow",
      promise: "You'll watch a fake friendship get manufactured.",
      instruction: "Predict the pen pal's next move. Three rounds.",
      intel: {
        beats: [
          "Into the simulator — a captured pen-pal con, replayed.",
          "Watch what the machine does brilliantly: mirroring.",
          "It loves everything you love. Instantly.",
          "And watch what it can't do: take time.",
          "Real feelings are slow. Scripts are instant.",
          "Clues, not proof. They fade as machines improve. Watch anyway.",
        ],
        prediction: {
          question: "Can these clues ALWAYS catch a machine fake?",
          options: [
            "Yes — clues are forever",
            "No — clues decay as machines improve",
            "Only in long messages",
          ],
          answer: 1,
          right: "Right. Treat clues as whispers, not alarms. The real defense comes next skill.",
          wrong: "Machines improve monthly. Today's clue is tomorrow's fixed bug. Whispers, not alarms.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback — the pen-pal con, move by move",
          steps: [
            {
              scene:
                "“no way, you like Star Chasers too?? literally NOBODY at my school does. we're basically twins 😂”",
              question: "what's the next move?",
              options: [
                "Ask for money right now",
                "Mirror more of your interests — build the twin feeling",
                "Say goodbye forever",
              ],
              answer: 1,
              reveal:
                "Every reply mirrors you back — your shows, your jokes, your opinions. Machines are perfect mirrors. The twin feeling IS the product.",
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
                "“My data's running out and mum won't top up… could you send a gift card code? a tiny one 🙏” The crisis exists to manufacture the favor.",
            },
            {
              scene:
                "You say you're not sure. The reply lands in under five seconds: “wow. ok. after EVERYTHING I've shared with you??”",
              question: "what just happened?",
              options: [
                "Instant guilt — the payback lever, scripted",
                "A genuine, thought-through reaction",
                "A typing accident",
              ],
              answer: 0,
              reveal:
                "Real hurt takes time. Scripts answer in seconds. And notice the lever — payback, straight off the M06 board. The levers never change. Only the writer did.",
            },
          ],
          doneLine: "MIRROR, CRISIS, GUILT. THE FRIENDSHIP WAS A SCRIPT WITH YOUR NAME PASTED IN.",
        },
      },
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
              "A script — real feelings take longer",
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
      concept: "Verify by source, never by style",
      promise: "You'll learn the check no machine can fake.",
      instruction: "Pick the move that unmasks the writer.",
      intel: {
        beats: [
          "So if style proves nothing — what does?",
          "Existence.",
          "A machine can write a person. It can't BE one.",
          "No real school. No real mutuals. No real anywhere.",
          "Style can be generated in forty seconds.",
          "A life can't. Check the life, not the writing.",
        ],
        prediction: {
          question: "What beats a perfect fake every time?",
          options: [
            "Reading it even more carefully",
            "Checking the source — does this person exist anywhere real?",
            "Asking “are you a bot?”",
          ],
          answer: 1,
          right: "Exactly. Style is generated. Existence isn't.",
          wrong: "You can't out-read a machine — and bots say no. Check whether the person EXISTS.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the move that unmasks the writer.",
          situation:
            "The pen pal wants to move to a private app — “just us 💛” — and asks again about that gift card. Softly. Kindly.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "kind",
              label: "Keep chatting — they're clearly going through a lot",
              outcome:
                "The crisis is the script's engine. Every kind reply powers the next ask. Kindness deserves a real person.",
            },
            {
              id: "quiz",
              label: "Test them with tricky questions about Hillcrest",
              outcome:
                "Machines answer anything, smoothly, instantly. A style test grades fiction. You need the real world.",
            },
            {
              id: "source",
              label: "Stop and verify by source — real-world checks, plus an adult",
              correct: true,
              outcome:
                "No Hillcrest student matches. Zero real-world links anywhere. An adult helps you report it — the whole warm, funny friend was forty seconds of text generation.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "“Verify by source” means:",
            options: [
              "Read the message twice",
              "Check the sender exists on channels you trust",
              "Ask them very politely",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "“Let's move to a private app, just us” is usually:",
            options: [
              "Cozy and flattering",
              "Isolation — fewer witnesses, fewer alarms",
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
      "The old tells retired: polish proves nothing when machines write for free.",
      "The manufacture watched live: mirror, crisis, guilt — a script with a name pasted in.",
      "Source check run, adult looped in, persona unmasked and reported.",
    ],
    realWorldMove:
      "This week: pick one message that sounds perfect and check its source — does the sender exist on a channel you trust? Style proves nothing. Existence does.",
    wrenLine: "The pen pal never existed. Your checks do. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m08-transmission.mp3",
    briefing: "/audio/wren/m08-briefing.mp3",
    debrief: "/audio/wren/m08-debrief.mp3",
  },

  dossier: {
    mo: "Writes flawless fakes — warm, funny, perfectly spelled. The writer never existed.",
    defeatedBy: "Anyone who verifies by source instead of style. Machines write words, not lives.",
  },
};

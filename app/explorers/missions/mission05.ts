/**
 * Mission 05 — "Signal Storm" (Block 1: Signals — BLOCK FINALE).
 * Actor: PHANTOM HOOK ②. Map slot: curriculum-map-v1 §M05.
 *
 * Teaching register (ages 10–13): the same M.O. across channels (SMS,
 * QR, DM — the costume change), display-name vs address (the "from"
 * is a costume too), and severity triage when volume is the weapon.
 * Ends Block 1: CONFIDENTIAL clearance confirmed in the debrief.
 *
 * Season arc — breadcrumb ②: the spear-phish in the boss carries
 * personal details that match the file PACKRAT auctioned in M04.
 * The actors are connected.
 */

import Mission05Incident from "../incidents/Mission05Incident";
import type { MissionManifest } from "../engine/types";

export const mission05: MissionManifest = {
  id: "explorers-m05",
  caseNumber: "CASE 005",
  title: "Signal Storm",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "One trick, every channel, all at once.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "Fake alerts are flooding every channel at once. Analysts don't panic. They triage.",
  scene: "/explorers/scenes/m05-cold-open.jpg",

  transmission: {
    headline: "STORM WARNING",
    lines: [
      "PHANTOM HOOK is back, and done being subtle.",
      "Texts. QR posters. DMs. All at once.",
      "Volume is the weapon. Panic is the goal.",
      "Analysts don't panic. They work the queue.",
    ],
  },

  briefing: {
    summary:
      "Same trick, three costumes, three hundred targets. Read the fingerprints.",
    objectives: [
      "Spot the shared fingerprints",
      "Read senders at header level",
      "Triage by severity",
    ],
    wrenLine: "Storms pass, Operative. Queues get worked.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the costume change */
    {
      id: "costume",
      title: "The costume change",
      concept: "Same trick, different channels",
      promise: "You'll learn to see one scam wearing three costumes.",
      instruction: "Tap the 3 fingerprints the channels share.",
      intel: {
        beats: [
          "A text. A QR poster. A DM.",
          "Three channels. Three costumes.",
          "Underneath: one author, running one play.",
          "Attackers change the costume because it's cheap.",
          "They keep the moves because moves are habits.",
          "Match the fingerprints and the storm becomes one case.",
        ],
        prediction: {
          question: "The same scam hits texts, posters, and DMs. Why spread it?",
          options: [
            "Different channels reach different kids",
            "It's more fun to make posters",
            "Each channel is a different scammer",
          ],
          answer: 0,
          right: "Right. Channels are fishing spots. The net is the same.",
          wrong: "One author, many spots. Wherever you are, a costume is waiting.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 fingerprints the channels share.",
          device: { app: "CHANNEL MONITOR", owner: "ARC INTERCEPTS · LAST 20 MIN" },
          header: [
            { label: "FEED:", seg: { id: "feed", text: "three channels, one storm" } },
          ],
          body: [
            [{ id: "sms", text: "[SMS] LIBRARY ALERT: account locked, fix it within 12 hours", tellId: "clock" }],
            [{ id: "qr", text: "[QR POSTER] scan to keep your canteen balance → pay-canteen-verify.net", tellId: "domain", mono: true }],
            [{ id: "dm", text: "[DM] your game account is flagged!! log in here quick to keep it", tellId: "ask" }],
            [{ id: "ok", text: "[SCHOOL APP] football trials moved to Friday · Mr. Ortega" }],
          ],
          tells: [
            {
              id: "clock",
              label: "The countdown",
              why: "Every channel, the same ticking clock. One author.",
            },
            {
              id: "domain",
              label: "The verify-domain",
              why: "Same weird verify-site family in every costume.",
            },
            {
              id: "ask",
              label: "The ask",
              why: "Three channels, one ask: your login. That's the M.O.",
            },
          ],
          doneLine: "Three costumes, one signature. The storm is one case now.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A scary text AND a matching poster appear the same day. Read?",
            options: [
              "Two problems, two scammers",
              "One campaign wearing two costumes",
              "Coincidence, ignore both",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "What stays the SAME when the costume changes?",
            options: [
              "The colors and logos",
              "The pressure, the domain, the ask",
              "The channel it arrives on",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: spoofed senders */
    {
      id: "senders",
      title: "The name is a costume",
      concept: "Display name vs real address",
      promise: "You'll learn why the sender's name proves nothing.",
      instruction: "Pick the 3 sender moves in this actor's M.O.",
      intel: {
        beats: [
          "Every message wears a name tag.",
          "“GameHub Support.” “Library Desk.” Even “Mrs. Cole.”",
          "The name tag is typed by the SENDER.",
          "Anyone can type anything.",
          "The address underneath is harder to fake.",
          "Analysts read the address. Names are for costumes.",
        ],
        prediction: {
          question: "A message says it's from your head teacher. What proves it?",
          options: [
            "The name looks official",
            "Nothing yet, check the address underneath",
            "It uses the school colors",
          ],
          answer: 1,
          right: "Exactly. Names are typed. Addresses are checked.",
          wrong: "Names and colors are costume parts. The address underneath is the test.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 sender moves in this actor's M.O.",
          evidence: [
            "“GameHub Support”: actually sent from renew-alerts.net",
            "“Library Desk”: actually sent from lib-renew-check.net",
            "“Mrs. Cole (Head)”: actually sent from head-office-mail.net",
          ],
          behaviors: [
            { id: "borrow", label: "Borrows a trusted display name", matches: true },
            { id: "mismatch", label: "Address never matches the name", matches: true },
            { id: "login", label: "Always asks for a login", matches: true },
            { id: "guess", label: "Guesses passwords over and over", matches: false },
            { id: "hijack", label: "Steals a friend's real account", matches: false },
            { id: "prize", label: "Gives away free prizes", matches: false },
          ],
          picks: 3,
          doneLine: "Names are costumes. Addresses are fingerprints. Filed.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Who controls the display name on a message?",
            options: ["The phone company", "Whoever sent it", "The school"],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "“Mrs. Cole” emails from head-office-mail.net. Your move?",
            options: [
              "Reply, it's the head teacher",
              "Treat it as a costume; verify at school",
              "Forward it to friends",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the analyst's queue */
    {
      id: "queue",
      title: "Work the queue",
      concept: "Triage by severity, not by loudness",
      promise: "You'll learn which threat to handle first.",
      instruction: "Pick which flagged message you handle first.",
      intel: {
        beats: [
          "In a storm, everything screams for attention.",
          "Analysts don't answer screams. They rank them.",
          "Loud isn't the same as dangerous.",
          "A message sent to everyone is spray. It's guessing.",
          "A message that knows YOU did research.",
          "Targeted beats loud. Every time.",
        ],
        prediction: {
          question: "Which message is more dangerous?",
          options: [
            "One blasted to the whole school",
            "One that knows your name and your club",
            "The one with the most emojis",
          ],
          answer: 1,
          right: "Right. Personal details mean somebody did homework on you.",
          wrong: "Loud is cheap. The one that KNOWS things did research. That's the threat.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick which flagged message you handle first.",
          situation:
            "Three flagged messages, one of you. The storm is live and the queue is yours.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "spray",
              label: "The blast sent to every inbox in school",
              outcome:
                "Dangerous but shallow, that's spray. It guesses. The one that KNOWS things outranks it.",
            },
            {
              id: "spear",
              label: "The one that names your form class and your teacher",
              correct: true,
              outcome:
                "Correct. Personal details mean research. That's a spear, not spray. It goes to the top of the queue.",
            },
            {
              id: "typos",
              label: "The one full of typos promising a free jetpack",
              outcome:
                "Almost funny. Log it, move on. Severity first: the queue doesn't care what's entertaining.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "What makes a message a SPEAR instead of spray?",
            options: [
              "It's longer",
              "It contains researched personal details",
              "It arrives at night",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "In a flood of scary messages, the analyst's first move is:",
            options: [
              "Answer the loudest one",
              "Rank them by severity",
              "Turn the phone off forever",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Flood",
    phases: 3,
    phaseNames: ["Hold the queue", "Find the spear", "Trace the data"],
    component: Mission05Incident,
  },

  debrief: {
    report: [
      "One storm reduced to one case: shared clock, shared domains, shared ask.",
      "Senders read at header level: names treated as costumes, addresses as fingerprints.",
      "The spear found, traced, and filed. Block One closed: CONFIDENTIAL clearance confirmed.",
    ],
    realWorldMove:
      "This week: when an urgent message lands, check one thing first: does the address match the name? Then check the real app. Two checks, ten seconds.",
    wrenLine: "Block One closed. CONFIDENTIAL clearance, confirmed. Wear it well, Operative.",
  },

  voice: {
    transmission: "/audio/wren/m05-transmission.mp3",
    briefing: "/audio/wren/m05-briefing.mp3",
    debrief: "/audio/wren/m05-debrief.mp3",
  },

  dossier: {
    mo: "One trick, every channel, all at once, and a spear hidden in the spray.",
    defeatedBy: "Anyone who matches fingerprints across channels and triages instead of panicking.",
    breadcrumb:
      "CROSS-REF: the spear's personal lines match the file PACKRAT auctioned in CASE 004. Two actors, one supply chain, relaying through that same ZERO tag. Filed as breadcrumb ②.",
  },
};

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
 *
 * VOICE PASS v1: kid-voice + humour; PHANTOM HOOK is a smug master of
 * disguise who brags he can cut a costume to fit anyone, then gets
 * read by his own fingerprints. Teaching, ids, answers all unchanged.
 */

import Mission05Incident from "../incidents/Mission05Incident";
import type { MissionManifest } from "../engine/types";

export const mission05: MissionManifest = {
  id: "explorers-m05",
  caseNumber: "CASE 005",
  title: "Spear Phishing",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "Same trick, a costume cut to fit you, fired at every channel at once.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "Fake alerts are flooding every channel at once, and one of them knows your name. Analysts don't panic. They triage.",
  scene: "/explorers/scenes/m05-cold-open.jpg",

  transmission: {
    headline: "STORM WARNING",
    lines: [
      "PHANTOM HOOK is back, and done being subtle. Now he's showing off.",
      "Texts. QR posters. DMs. Every screen you own, all at once.",
      "Volume is the weapon, panic is the plan. Tick tock, player, he says.",
      "Here's the thing: analysts don't panic. They work the queue.",
    ],
  },

  briefing: {
    summary:
      "Same trick, three costumes, three hundred targets, and one costume cut to fit you. Read the fingerprints.",
    objectives: [
      "Match the shared fingerprints",
      "Read the address, not the name tag",
      "Triage by danger, not by volume",
    ],
    wrenLine: "Three skills, then his storm is just one case. Eyes open.",
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
          "A text. A QR poster. A DM. Three screens, three costumes, one quick-change artist.",
          "Underneath every costume: one author, running one play.",
          "He swaps costumes because they're cheap. He keeps the moves, and habits leave fingerprints.",
          "Match the fingerprints and the whole storm becomes one case.",
        ],
        beatAudio: [
          "/audio/wren/m05-c1-b1.mp3",
          "/audio/wren/m05-c1-b2.mp3",
          "/audio/wren/m05-c1-b3.mp3",
          "/audio/wren/m05-c1-b4.mp3",
        ],
        prediction: {
          question: "The same scam hits texts, posters, and DMs. Why bother spreading it around?",
          options: [
            "Different channels reach different kids",
            "It's more fun to make posters",
            "Each channel is a different scammer",
          ],
          answer: 0,
          right: "Right. Every channel is just another fishing spot. The net is the same.",
          wrong: "One author, many spots. Wherever you scroll, a costume is waiting.",
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
              why: "Every channel, the same ticking clock. That's one author, not three.",
            },
            {
              id: "domain",
              label: "The verify-domain",
              why: "The same weird verify-site family shows up under every costume.",
            },
            {
              id: "ask",
              label: "The ask",
              why: "Three channels, one ask: hand over your login. That's the whole M.O.",
            },
          ],
          doneLine: "Three costumes, one signature. Tick tock, player: your storm is one case now.",
        },
      },
      playAudio: "/audio/wren/m05-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A scary text AND a matching poster land the same day. How do you read it?",
            options: [
              "Two problems, two scammers",
              "One campaign wearing two costumes",
              "Coincidence, ignore both",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "When the costume changes, what stays exactly the SAME?",
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
          "Every message shows up wearing a name tag: “GameHub Support.” “Library Desk.” Even “Mrs. Cole.”",
          "Here's the catch: the name tag is typed by the SENDER.",
          "Anyone can type anything. Phantom Hook types whatever fits you.",
          "The address underneath is much harder to fake. So analysts read the address, not the name.",
        ],
        beatAudio: [
          "/audio/wren/m05-c2-b1.mp3",
          "/audio/wren/m05-c2-b2.mp3",
          "/audio/wren/m05-c2-b3.mp3",
          "/audio/wren/m05-c2-b4.mp3",
        ],
        prediction: {
          question: "A message swears it's from your head teacher. What actually proves that?",
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
            { id: "borrow", label: "Borrows a trusted name for the tag", matches: true },
            { id: "mismatch", label: "Address never matches the name", matches: true },
            { id: "login", label: "Always, always asks for a login", matches: true },
            { id: "guess", label: "Guesses passwords over and over", matches: false },
            { id: "hijack", label: "Steals a friend's real account", matches: false },
            { id: "prize", label: "Hands out free prizes, no strings", matches: false },
          ],
          picks: 3,
          doneLine: "Names are costume. Addresses are fingerprints. Filed, and he hates that.",
        },
      },
      playAudio: "/audio/wren/m05-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Who actually controls the display name on a message?",
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
          "In a storm, every message is screaming for attention. Analysts don't answer screams, they rank them.",
          "Loud is not the same as dangerous.",
          "A message blasted to everyone is spray. It's just guessing.",
          "One that knows YOUR name and YOUR club took real research. Targeted beats loud, every time.",
        ],
        beatAudio: [
          "/audio/wren/m05-c3-b1.mp3",
          "/audio/wren/m05-c3-b2.mp3",
          "/audio/wren/m05-c3-b3.mp3",
          "/audio/wren/m05-c3-b4.mp3",
        ],
        prediction: {
          question: "Two threats land at once. Which one is actually more dangerous?",
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
            "Three flagged messages, one of you. The storm is live, and the queue is yours, Agent.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "spray",
              label: "The blast sent to every inbox in school",
              outcome:
                "Dangerous but shallow: that's spray, and spray is guessing. The one that KNOWS things about you outranks it.",
            },
            {
              id: "spear",
              label: "The one that names your form class and your teacher",
              correct: true,
              outcome:
                "Correct. Personal details mean someone did homework on you. That's a spear, not spray. Straight to the top of the queue.",
            },
            {
              id: "typos",
              label: "The one full of typos promising a free jetpack",
              outcome:
                "Almost funny, that free jetpack. Log it, move on. Severity first: the queue doesn't care what's entertaining.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m05-c3-play.mp3",
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
      "Senders read at header level: names treated as costume, addresses as fingerprints.",
      "The spear found, traced, and filed. Block One closed: CONFIDENTIAL clearance confirmed.",
    ],
    realWorldMove:
      "This week: when an urgent message lands, check one thing first. Does the address match the name? Then open the real app yourself and check there. Two checks, ten seconds. Still feels off? Tell an adult you trust.",
    wrenLine: "Block One closed. Phantom Hook's storm is one filed case. CONFIDENTIAL clearance, confirmed. Wear it well, Agent.",
  },

  voice: {
    transmission: "/audio/wren/m05-transmission.mp3",
    briefing: "/audio/wren/m05-briefing.mp3",
    debrief: "/audio/wren/m05-debrief.mp3",
  },

  dossier: {
    mo: "One trick, a costume cut to fit each target, fired at every channel at once, with a spear hidden in the spray.",
    defeatedBy: "Anyone who matches the fingerprints across every costume and triages instead of panicking. Reads the tells, ruins his whole show.",
    breadcrumb:
      "CROSS-REF: the spear's personal lines match the file PACKRAT auctioned in CASE 004. Two actors, one supply chain, relaying through that same ZERO tag. Filed as breadcrumb ②.",
  },
};

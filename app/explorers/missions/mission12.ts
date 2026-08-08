/**
 * Mission 12 — "Unreadable" (Block 3: Systems, TOP SECRET track).
 * Actor: PACKRAT ②. CIPHER debuts. Map slot: curriculum-map-v1 §M12.
 *
 * Teaching register (ages 10–13): NEW GROUND — Heroes never touched
 * crypto. Make and break a Caesar (why simple ciphers fall), the
 * padlock as sealed-envelope-vs-postcard, and who can read your
 * messages (in-transit vs end-to-end, lite) — why sketchy public
 * Wi-Fi is a postcard party.
 */

import Mission12Incident from "../incidents/Mission12Incident";
import type { MissionManifest } from "../engine/types";

export const mission12: MissionManifest = {
  id: "explorers-m12",
  caseNumber: "CASE 012",
  title: "Unreadable",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "PACKRAT",
    mo: "Reads everything sent unsealed. Keeps it.",
    portrait: "/explorers/actors/packrat.png",
  },

  hook: "Anyone between you and a website can read your messages. Unless you seal them.",
  scene: "/explorers/scenes/m12-cold-open.jpg",

  transmission: {
    headline: "OPEN MAIL",
    lines: [
      "PACKRAT found a new nest: a café's free Wi-Fi.",
      "Every unsealed message drifts right through his claws.",
      "He doesn't hack anything. He just… reads.",
      "Tonight you learn sealing. Two thousand years of it.",
    ],
  },

  briefing: {
    summary:
      "Messages travel through strangers' hands. Sealed ones arrive secret. Postcards don't.",
    objectives: [
      "Break a cipher yourself",
      "Find the padlock",
      "Survive public Wi-Fi",
    ],
    wrenLine: "Make it unreadable, Operative. Then nobody's nest matters.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: make and break */
    {
      id: "caesar",
      title: "Break the code",
      concept: "Simple ciphers always fall",
      promise: "You'll crack a two-thousand-year-old cipher yourself.",
      instruction: "Spin the shift dial until the note reads.",
      intel: {
        beats: [
          "Sealing messages is older than computers.",
          "Julius Caesar did it by sliding the alphabet.",
          "A becomes D. B becomes E. Slide by three.",
          "Unreadable. Unless you know the slide.",
          "Or unless you just… try every slide.",
          "There are only 25. Watch how fast you break it.",
        ],
        prediction: {
          question: "Why do slide-the-alphabet ciphers always fall?",
          options: [
            "Computers are magic",
            "There are only 25 slides to try",
            "They don't, they're unbreakable",
          ],
          answer: 1,
          right: "Right. A secret with 25 possibilities isn't a secret for long.",
          wrong: "Count the slides: 25. A minute of trying beats the seal every time.",
        },
      },
      fieldwork: {
        verb: "CIPHER",
        payload: {
          intro: "Crack the captured notes: spin the dial",
          rounds: [
            {
              id: "r1",
              prompt: "NOTE 1: sealed with a small slide",
              plaintext: "MEET AT THE LIBRARY",
              shift: 3,
              why: "Slide of three: Caesar's own setting. Two thousand years old. You broke it in seconds.",
            },
            {
              id: "r2",
              prompt: "NOTE 2: a bigger slide this time",
              plaintext: "THE PADLOCK MEANS SEALED",
              shift: 5,
              why: "Five clicks, still seconds to break. Simple ciphers ALWAYS fall. Real encryption needs a bigger idea.",
            },
          ],
          doneLine: "TWO SEALS BROKEN IN A MINUTE. NOW YOU KNOW WHY MODERN SEALS USE MATH INSTEAD OF SLIDES.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "You cracked the Caesar cipher by:",
            options: [
              "Guessing the sender's birthday",
              "Trying slides until it read",
              "Asking nicely",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Modern encryption beats the try-everything attack because:",
            options: [
              "Trying is illegal",
              "The number of keys is too huge to ever try",
              "It uses invisible ink",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the padlock */
    {
      id: "padlock",
      title: "Sealed or postcard",
      concept: "The padlock = a sealed envelope",
      promise: "You'll learn to spot which messages travel sealed.",
      instruction: "Tap the 3 seals and leaks in this scan.",
      intel: {
        beats: [
          "Every message you send takes a journey.",
          "Through routers, cables, and strangers' machines.",
          "A SEALED message crosses them unreadable.",
          "An unsealed one is a postcard. Everyone on the way can read it.",
          "The browser tells you which is which.",
          "The padlock. Smallest icon, biggest promise.",
        ],
        prediction: {
          question: "The padlock next to a web address promises:",
          options: [
            "The website is honest",
            "The JOURNEY is sealed: nobody on the way can read it",
            "The site has no ads",
          ],
          answer: 1,
          right: "Right, and only that. A sealed road can still lead to a fake castle. M15 soon.",
          wrong: "The padlock seals the ROAD, not the destination. Honest is a different check.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 seals and leaks in this scan.",
          device: { app: "TRAFFIC SCAN", owner: "ARC RANGE · YOUR DEVICE" },
          header: [
            { label: "SCAN:", seg: { id: "scan", text: "four connections, live right now" } },
          ],
          body: [
            [{ id: "l1", text: "School portal, padlock showing: journey SEALED", tellId: "sealed" }],
            [{ id: "l2", text: "Quiz site, no padlock: every answer travels as a postcard", tellId: "postcard" }],
            [{ id: "l3", text: "Chat app, “end-to-end encrypted”: only the two phones can read it", tellId: "e2e" }],
            [{ id: "l4", text: "Weather widget, checking tomorrow's rain" }],
          ],
          tells: [
            {
              id: "sealed",
              label: "The padlock",
              why: "Sealed envelope. Strangers on the way see gibberish.",
            },
            {
              id: "postcard",
              label: "No padlock",
              why: "A postcard. Every machine on the journey can read it.",
            },
            {
              id: "e2e",
              label: "End-to-end",
              why: "The strongest seal. Even the app company can't read it. Phone to phone.",
            },
          ],
          doneLine: "Sealed, postcard, end-to-end. Three kinds of journey. Now you can tell them apart.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "No padlock on a login page means:",
            options: [
              "The page loads faster",
              "Your password travels as a postcard",
              "The site is new",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "“End-to-end encrypted” means who can read your chat?",
            options: [
              "You, the friend, and the app company",
              "Only the two phones in the chat",
              "Anyone with good Wi-Fi",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the postcard party */
    {
      id: "wifi",
      title: "The postcard party",
      concept: "Unknown Wi-Fi, unsealed traffic: never both",
      promise: "You'll learn when free Wi-Fi is safe and when it isn't.",
      instruction: "Pick the safe move at the café.",
      intel: {
        beats: [
          "Free public Wi-Fi is a room full of strangers.",
          "Whoever runs the network sits on the road itself.",
          "Sealed traffic? Still safe. They see gibberish.",
          "Unsealed traffic? They're READING your postcards.",
          "And a network named FREE_COFFEE could be anyone's laptop.",
          "Rule: unknown network plus no padlock, never both at once.",
        ],
        prediction: {
          question: "On café Wi-Fi with the padlock showing, a snooper sees:",
          options: [
            "Everything you type",
            "Gibberish: the seal holds even on strange roads",
            "Only your username",
          ],
          answer: 1,
          right: "Right. Sealing exists exactly for journeys you don't control.",
          wrong: "That's the seal's whole job. Strange road, sealed envelope, gibberish for snoopers.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the safe move at the café.",
          situation:
            "You're at a café on “FREE_COFFEE_WIFI”. You need to check your email. The login page shows NO padlock.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "login",
              label: "Log in quickly, it's only two minutes",
              outcome:
                "No padlock on an unknown network. Your password just crossed the room as a postcard. Two minutes is plenty for a nest.",
            },
            {
              id: "data",
              label: "Switch to phone data, or wait for a padlocked page",
              correct: true,
              outcome:
                "Clean. Known road or sealed envelope: you always need at least one. And email deserves both.",
            },
            {
              id: "barista",
              label: "Ask the barista if the Wi-Fi is safe",
              outcome:
                "The barista didn't wire the network. He can't see who's snooping it. Padlocks vouch for journeys. People can't.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The café-Wi-Fi rule is:",
            options: [
              "Never use café Wi-Fi ever",
              "Unknown network + no padlock: never both at once",
              "Only use it for homework",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A network called FREE_AIRPORT_WIFI is:",
            options: [
              "Run by the airport, guaranteed",
              "Whoever named it that, maybe a laptop in seat 14C",
              "Always the fastest option",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Intercept",
    phases: 3,
    phaseNames: ["The sniffer", "Seal the channel", "The gibberish prize"],
    component: Mission12Incident,
  },

  debrief: {
    report: [
      "One ancient cipher made and broken by hand. The lesson: 25 slides is no secret.",
      "The padlock decoded: sealed, postcard, end-to-end. Three journeys, told apart.",
      "Café rule set: known road or sealed envelope, always at least one.",
    ],
    realWorldMove:
      "This week: before typing anything private, glance for the padlock. On free Wi-Fi, glance twice. When in doubt, use phone data.",
    wrenLine: "Unreadable achieved. Let him collect gibberish. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m12-transmission.mp3",
    briefing: "/audio/wren/m12-briefing.mp3",
    debrief: "/audio/wren/m12-debrief.mp3",
  },

  dossier: {
    mo: "Sits on the road and reads every postcard. Never hacks, just collects what travels unsealed.",
    defeatedBy: "Sealed envelopes. The padlock, end-to-end chats, and phone data on strange networks.",
  },
};

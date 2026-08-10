/**
 * Mission 14 — "The Update Trap" (Block 3: Systems, TOP SECRET track).
 * Actor: GHOSTWRITER ②. Map slot: curriculum-map-v1 §M14.
 *
 * Teaching register (ages 10–13): a download is a SET OF POWERS
 * (permissions as capabilities — Heroes W9's "why does it need that?"
 * grown into the capability model), updates are armor (what patching
 * actually fixes), and the fake-installer lure (malware wrapped in
 * Block-1 lure clothing).
 */

import Mission14Incident from "../incidents/Mission14Incident";
import type { MissionManifest } from "../engine/types";

export const mission14: MissionManifest = {
  id: "explorers-m14",
  caseNumber: "CASE 014",
  title: "Trojan",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "GHOSTWRITER",
    mo: "Wraps bad software in things you want.",
    portrait: "/explorers/actors/ghostwriter.png",
  },

  hook: "Every app you install gets a set of powers. One flashlight is asking for your contacts.",
  scene: "/explorers/scenes/m14-cold-open.jpg",

  transmission: {
    headline: "PENDING INSTALLS",
    lines: [
      "Five downloads are waiting on a student's tablet.",
      "Four are gifts. One is a trojan horse.",
      "GHOSTWRITER wrapped it himself.",
      "Tonight: powers, patches, and presents you shouldn't open.",
    ],
  },

  briefing: {
    summary:
      "Apps are sets of powers. Updates are armor. Some presents carry their own soldiers.",
    objectives: [
      "Read permissions as powers",
      "Understand what patches plug",
      "Spot the trojan",
    ],
    wrenLine: "Check the powers before you grant them, Operative.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: powers */
    {
      id: "powers",
      title: "Apps are powers",
      concept: "A permission is a capability you grant",
      promise: "You'll learn to read what an app can DO to you.",
      instruction: "Tap the 3 powers this torch never needs.",
      intel: {
        beats: [
          "Installing an app isn't like buying a toy.",
          "It's like hiring a worker to live in your house.",
          "Permissions are the powers you hand the worker.",
          "See your messages. Hear your room. Know where you are.",
          "The question is never “is the app fun?”",
          "It's “why does a torch need my contact list?”",
        ],
        prediction: {
          question: "A flashlight app requests your contact list. Why?",
          options: [
            "Flashlights need friends",
            "The app is free because your data is the price",
            "It's a harmless glitch",
          ],
          answer: 1,
          right: "Right. When the app is free and hungry, YOU are the product.",
          wrong: "No torch needs your friends. Powers it doesn't need are the real prize.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 powers this torch never needs.",
          device: { app: "PERMISSION VIEWER", owner: "TORCH+ FREE FLASHLIGHT" },
          header: [
            { label: "APP:", seg: { id: "app", text: "Torch+ · “the brightest free flashlight!”" } },
          ],
          body: [
            [{ id: "p1", text: "Wants: camera flash control (to be a torch)" }],
            [{ id: "p2", text: "Wants: your full contact list", tellId: "contacts" }],
            [{ id: "p3", text: "Wants: microphone, always on", tellId: "mic" }],
            [{ id: "p4", text: "Wants: precise location, even when closed", tellId: "location" }],
          ],
          tells: [
            {
              id: "contacts",
              label: "The contact grab",
              why: "A light has no reason to know your friends. That's grab number one.",
            },
            {
              id: "mic",
              label: "Always-on ears",
              why: "A microphone in a flashlight? That never makes sense.",
            },
            {
              id: "location",
              label: "The tracker",
              why: "Light doesn't need to know where you are. A power it can't use is a warning.",
            },
          ],
          doneLine: "Three powers a torch never needs. The real product was you.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "The one question to ask any permission popup:",
            options: [
              "Is this app popular?",
              "Does this power match what the app DOES?",
              "Is the icon cute?",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "A drawing app wants your messages. You:",
            options: [
              "Allow, it probably has a reason",
              "Deny, drawing needs no messages",
              "Uninstall your messages app",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: patches */
    {
      id: "armor",
      title: "Updates are armor",
      concept: "A patch plugs a hole that's already public",
      promise: "You'll learn why attackers love the un-updated.",
      instruction: "Pick when the update happens.",
      intel: {
        beats: [
          "“Update available.” The most skipped message on earth.",
          "Here's what an update actually is.",
          "Someone found a hole in the app's walls.",
          "The update is the plug.",
          "And here's the scary part: the hole is now PUBLIC.",
          "Attackers list every device that skipped the fix. Don't be on it.",
        ],
        prediction: {
          question: "Why do attackers love devices that skip updates?",
          options: [
            "Old devices are slower to run away",
            "The holes are public, so skipping the fix leaves your door open",
            "They don't, updates don't matter",
          ],
          answer: 1,
          right: "Right. A patched hole is shut. An open one goes on their list.",
          wrong: "Every fix is announced, so the hole is public. Skip it and you're a target.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick when the update happens.",
          situation:
            "Bedtime. The tablet pops up: “System update ready. Includes a security fix.” You're mid-game. The button says LATER.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "later",
              label: "Later, maybe the weekend",
              outcome:
                "That fix means the hole is already public. Every day you wait, you stay a target. Armor can't wait for the weekend.",
            },
            {
              id: "tonight",
              label: "Tonight, while you sleep",
              correct: true,
              outcome:
                "Perfect. The game pauses. The armor goes on overnight. Tomorrow that public hole isn't yours.",
            },
            {
              id: "never",
              label: "Never, updates change things I like",
              outcome:
                "An update changes way less than an attacker would. A few things look different. The holes stay until you fix them.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "A security update exists because:",
            options: [
              "The company was bored",
              "A hole was found, the update is the plug",
              "Your device was hacked already",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "The safest update habit:",
            options: [
              "Install overnight, automatically",
              "Wait a year to be sure",
              "Only update games",
            ],
            answer: 0,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the fake installer */
    {
      id: "installer",
      title: "The wrapped horse",
      concept: "Malware arrives dressed as what you want",
      promise: "You'll watch a fake installer show its true face.",
      instruction: "Predict the installer's next move. Three rounds.",
      intel: {
        beats: [
          "GHOSTWRITER's specialty: wrapping.",
          "The wrapper is always something you WANT.",
          "A free game. A paid app, now free. An update you “need”.",
          "The bait is the old trick: pressure, prizes, costumes.",
          "The hidden part is new: an app with powers.",
          "Into the simulator. Watch a present unwrap itself.",
        ],
        prediction: {
          question: "Where do trojans hide?",
          options: [
            "In official app stores only",
            "Inside downloads from forums, links, and “free premium” posts",
            "They can't hide anymore",
          ],
          answer: 1,
          right: "Right. Stores check the wrapping. Random links don't.",
          wrong: "Stores scan their shelves. The forum post promising free premium scans nothing.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback: a fake installer unwrapping",
          steps: [
            {
              scene:
                "[FORUM POST] “GameHub PREMIUM unlocked FREE forever!! just grab my installer 🎁 (link below)”",
              question: "after the download, what's its first ask?",
              options: [
                "Nothing, it installs and works",
                "“Turn OFF your tablet's protection, just for setup!”",
                "A five-star review",
              ],
              answer: 1,
              reveal:
                "“Turn off protection first.” The guard would spot it, so it wants the guard gone. No real game ever asks that.",
            },
            {
              scene:
                "(range replay, protection off) The installer runs. A permission screen unrolls… and unrolls…",
              question: "what does it ask for?",
              options: [
                "Just storage for game files",
                "Everything: contacts, messages, and reading your whole screen",
                "Your favorite color",
              ],
              answer: 1,
              reveal:
                "Contacts, messages, your whole screen. A game needs none of that. The powers ARE the attack. The game is just a costume.",
            },
            {
              scene:
                "(replay) Powers granted. The screen shows a game loading bar, slowly filling…",
              question: "what's happening behind the bar?",
              options: [
                "The game is just loading slowly",
                "The powers go to work: it reads messages and spams your contacts",
                "It politely uninstalls itself",
              ],
              answer: 1,
              reveal:
                "It mails itself to everyone the student knows, using THEIR name. It copies real people to fool more. The loading bar never finishes. There was never a game.",
            },
          ],
          doneLine: "GUARD OFF, POWERS GRANTED, HORSE INSIDE. NOW YOU'VE SEEN THE WHOLE UNWRAPPING.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Any installer that says “turn off your protection first” is:",
            options: [
              "Normal setup stuff",
              "Telling you exactly what it is",
              "Just badly coded",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "The safest place to get apps:",
            options: [
              "Forum links promising free premium",
              "The official store, which scans its shelves",
              "Wherever's fastest",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Trojan Delivery",
    phases: 3,
    phaseNames: ["Sort the deliveries", "Handle the horse", "Raise the armor"],
    component: Mission14Incident,
  },

  debrief: {
    report: [
      "One torch exposed: three powers it never needed, denied.",
      "Updates understood: a public hole gets fixed the same night.",
      "The trojan unwrapped in the range: turn off the guard, grab the powers, mail itself out.",
    ],
    realWorldMove:
      "This week: run your waiting updates. Then open one app's permissions with a parent. Ask one question: why does it need that power?",
    wrenLine: "Deliveries sorted, armor raised. The horse stays outside the walls. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m14-transmission.mp3",
    briefing: "/audio/wren/m14-briefing.mp3",
    debrief: "/audio/wren/m14-debrief.mp3",
  },

  dossier: {
    mo: "Wraps bad software inside things you want: free games, paid apps for free, urgent installers.",
    defeatedBy: "Anyone who reads the powers, keeps devices updated, and uses official stores only.",
  },
};

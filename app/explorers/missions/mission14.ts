/**
 * Mission 14 — "The Update Trap" (Block 3: Systems, TOP SECRET track).
 * Actor: GHOSTWRITER ②. Map slot: curriculum-map-v1 §M14.
 *
 * Teaching register (ages 10–13): a download is a SET OF POWERS
 * (permissions as capabilities — Heroes W9's "why does it need that?"
 * grown into the capability model), updates are armor (what patching
 * actually fixes), and the fake-installer lure (malware wrapped in
 * Block-1 lure clothing).
 *
 * VOICE PASS v1: kid-voice + humour; GHOSTWRITER is a hollow ghost of
 * borrowed words who writes a flawless label and hides a stranger under
 * it. Teaching, ids, answers all unchanged.
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
    mo: "Writes a flawless label, then hides a stranger's app inside the download.",
    portrait: "/explorers/actors/ghostwriter.png",
  },

  hook: "Every app you install gets a set of powers. This “free flashlight” is quietly asking for your whole contact list. Why?",
  scene: "/explorers/scenes/m14-cold-open.jpg",

  transmission: {
    headline: "PENDING INSTALLS",
    lines: [
      "Five downloads are waiting on a student's tablet.",
      "Four are the real thing. One is a horse packed with soldiers.",
      "GHOSTWRITER wrapped that one himself. Beautiful label. Nothing real underneath.",
      "Tonight: powers, patches, and the one present you do not open.",
    ],
  },

  briefing: {
    summary:
      "Apps are sets of powers. Updates are armor. And some presents come with soldiers already inside.",
    objectives: [
      "Read permissions as powers",
      "Learn what a patch plugs",
      "Spot the wrapped horse",
    ],
    wrenLine: "Read the powers before you hand them over, Agent. A pretty label proves nothing.",
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
          "Installing an app isn't grabbing a toy. It's hiring a worker to move into your house.",
          "Permissions are the powers you hand that worker on day one.",
          "Read your messages. Listen to your room. Always know where you are.",
          "So don't ask if the app is fun. Ask why a flashlight needs your whole contact list.",
        ],
        beatAudio: [
          "/audio/wren/m14-c1-b1.mp3",
          "/audio/wren/m14-c1-b2.mp3",
          "/audio/wren/m14-c1-b3.mp3",
          "/audio/wren/m14-c1-b4.mp3",
        ],
        prediction: {
          question: "A flashlight app asks for your contact list. Why?",
          options: [
            "Flashlights get lonely too",
            "It's free because your data is the price",
            "It's a harmless glitch",
          ],
          answer: 1,
          right: "Right. When the app is free and hungry, YOU are the product.",
          wrong: "No torch needs your friends. The power it doesn't need is the whole point.",
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
              why: "A flashlight has no reason to know your friends. That's grab number one.",
            },
            {
              id: "mic",
              label: "Always-on ears",
              why: "An always-on microphone inside a torch? That never adds up.",
            },
            {
              id: "location",
              label: "The tracker",
              why: "Light doesn't need to know where you are. A power an app can't use is a warning.",
            },
          ],
          doneLine: "Three powers a torch never needs. It wasn't selling light. It was buying you.",
        },
      },
      playAudio: "/audio/wren/m14-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "The one question to ask every permission popup:",
            options: [
              "Is this app popular?",
              "Does this power match what the app actually DOES?",
              "Is the icon cute?",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "A drawing app asks for your messages. You:",
            options: [
              "Allow it, there's probably a reason",
              "Deny it, drawing needs no messages",
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
          "“Update available” might be the most-ignored message ever written. Here's what it really is.",
          "Someone found a hole in the app's walls. The update is the patch that plugs it.",
          "And here's the part nobody mentions: that hole is now public.",
          "Attackers keep a list of every device that skipped the fix. Don't be on it.",
        ],
        beatAudio: [
          "/audio/wren/m14-c2-b1.mp3",
          "/audio/wren/m14-c2-b2.mp3",
          "/audio/wren/m14-c2-b3.mp3",
          "/audio/wren/m14-c2-b4.mp3",
        ],
        prediction: {
          question: "Why do attackers love devices that skip updates?",
          options: [
            "Old devices are slower to run away",
            "The holes are public, so skipping the fix leaves your door open",
            "They don't, updates don't matter",
          ],
          answer: 1,
          right: "Right. A patched hole is shut. An open one goes straight on their list.",
          wrong: "Every fix gets announced, so the hole is public. Skip it and you're a target.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick when the update happens.",
          situation:
            "Bedtime. The tablet pops up: “System update ready. Includes a security fix.” You're mid-game. The button says LATER.",
          prompt: "YOUR CALL, AGENT:",
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
                "Perfect. The game pauses, the armor goes on overnight, and tomorrow that public hole isn't yours.",
            },
            {
              id: "never",
              label: "Never, updates change things I like",
              outcome:
                "An update changes way less than an attacker would. A few things look different. The holes just sit there until you fix them.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m14-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "A security update exists because:",
            options: [
              "The company got bored",
              "A hole was found, and the update is the plug",
              "Your device is already hacked",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "The safest update habit:",
            options: [
              "Install overnight, automatically",
              "Wait a year to be safe",
              "Only ever update games",
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
          "GHOSTWRITER's whole talent is the wrapping. “Don't check inside,” he says. “Just admire the label.”",
          "A free game. A paid app, suddenly free. An update you totally “need”.",
          "The pitch is the old trick: pressure, prizes, costumes. What's new is hidden: a whole app stuffed with powers.",
          "Into the range, Agent. Watch one of his presents unwrap itself.",
        ],
        beatAudio: [
          "/audio/wren/m14-c3-b1.mp3",
          "/audio/wren/m14-c3-b2.mp3",
          "/audio/wren/m14-c3-b3.mp3",
          "/audio/wren/m14-c3-b4.mp3",
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
          wrong: "Stores scan their shelves. A forum post promising free premium scans nothing.",
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
                "“Turn off protection first.” The guard would catch him, so he needs the guard gone. No real game ever asks that.",
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
                "Contacts, messages, your whole screen. A game needs none of it. The powers ARE the attack. The game was only ever a costume.",
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
                "It mails itself to everyone the student knows, signed with THEIR name. It borrows real people to fool more people. The loading bar never finishes. There was never a game.",
            },
          ],
          doneLine: "GUARD OFF, POWERS GRANTED, HORSE INSIDE. NOW YOU'VE SEEN THE WHOLE UNWRAPPING.",
        },
      },
      playAudio: "/audio/wren/m14-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Any installer that says “turn off your protection first” is:",
            options: [
              "Just normal setup stuff",
              "Telling you exactly what it is",
              "Only badly coded",
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
      "One torch exposed: three powers it never needed, all denied.",
      "Updates understood: a public hole gets patched that same night.",
      "The trojan unwrapped in the range: kill the guard, grab the powers, mail itself out.",
    ],
    realWorldMove:
      "This week: run your waiting updates. Then open one app's permissions with a parent and ask one question: why does it need that power?",
    wrenLine: "Deliveries sorted, armor up. The horse stays outside the walls. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m14-transmission.mp3",
    briefing: "/audio/wren/m14-briefing.mp3",
    debrief: "/audio/wren/m14-debrief.mp3",
  },

  dossier: {
    mo: "Wraps bad software inside things you want: free games, paid apps for free, urgent installers. A perfect label, a stranger underneath.",
    defeatedBy: "Anyone who reads the powers instead of the pitch, keeps devices updated, and installs only from official stores.",
  },
};

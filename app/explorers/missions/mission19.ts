/**
 * Mission 19 — "Static Rising" (Block 4: The Long Game, ULTRA track).
 * Actor: ALL ACTORS (PHANTOM HOOK ③ leads). Map slot: §M19.
 *
 * Teaching register (ages 10–13): campaign anatomy — recon → lure →
 * access → harvest, each phase mapped to the actor who owns it (the
 * whole course revised by construction). Defense in depth (your
 * layered defenses as one system; every layer catches what the last
 * one missed). Incident command — triage, contain, report, for a
 * whole-school scenario.
 *
 * VOICE PASS v1: the coordinator (ZERO) moves in cold silence, not
 * taunts; the wave stays tense and clever; WREN a touch graver.
 * Strings only; teaching, ids, answers, order, and flags unchanged.
 */

import Mission19Incident from "../incidents/Mission19Incident";
import type { MissionManifest } from "../engine/types";

export const mission19: MissionManifest = {
  id: "explorers-m19",
  caseNumber: "CASE 019",
  title: "Attack Chain",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "ZERO",
    mo: "Every actor at once, in one coordinated wave.",
    portrait: "/explorers/actors/coordinator.png",
  },

  hook: "The coordinator moves at last. Every actor at once, one wave, your whole school. No warning, no noise. Hold the line.",
  scene: "/explorers/scenes/m19-cold-open.jpg",

  transmission: {
    headline: "ALL FREQUENCIES",
    lines: [
      "This is it. Not one actor. All of them.",
      "The coordinator lit the whole network at once, quietly, all in one breath.",
      "Your entire school is the target tonight.",
      "Everything you've learned. All of it. Right now.",
    ],
  },

  briefing: {
    summary:
      "A real campaign runs in phases. Beat it with layers. Every layer catches what the last one missed.",
    objectives: [
      "Map the campaign phases",
      "See defense in depth",
      "Run incident command",
    ],
    wrenLine: "One layer fails sometimes, Agent. That's why we build many.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: campaign anatomy */
    {
      id: "anatomy",
      title: "Anatomy of a wave",
      concept: "Recon, lure, access, harvest",
      promise: "You'll learn the four phases every campaign runs.",
      instruction: "Order the 4 phases of the campaign.",
      intel: {
        beats: [
          "Big attacks aren't one move. They're a sequence.",
          "RECON: PACKRAT collects who's who.",
          "LURE: PHANTOM HOOK and SIREN bait the click.",
          "ACCESS: SKELETON KEY and MIMIC get in.",
          "HARVEST: everything of value, taken and sold.",
          "See the phases and you can defend each one.",
        ],
        prediction: {
          question: "What comes FIRST in a big campaign?",
          options: [
            "Stealing the data",
            "Recon: quietly collecting who's who",
            "The final ransom",
          ],
          answer: 1,
          right: "Right. They study before they strike. Recon is phase one.",
          wrong: "Harvest is the END. First they learn you. Recon always leads.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Campaign board: order the wave, phase by phase",
          fingerprintHint: "each actor owns one phase of the attack",
          cards: [
            {
              id: "t1",
              surface: "PHASE",
              from: "PACKRAT",
              text: "RECON: quietly builds the file, who you are and what you like",
              inCampaign: true,
              clue: "study first",
              order: 1,
            },
            {
              id: "d1",
              surface: "NOISE",
              from: "the school",
              text: "the actual bake sale newsletter goes out",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "PHASE",
              from: "PHANTOM HOOK + SIREN",
              text: "LURE: the recon makes the bait feel personal and hard to resist",
              inCampaign: true,
              clue: "the click",
              order: 2,
            },
            {
              id: "t3",
              surface: "PHASE",
              from: "SKELETON KEY + MIMIC",
              text: "ACCESS: clicked links and borrowed faces open the doors",
              inCampaign: true,
              clue: "the way in",
              order: 3,
            },
            {
              id: "d2",
              surface: "NOISE",
              from: "a student",
              text: "posts a normal photo of their lunch",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "PHASE",
              from: "GHOSTWRITER + the market",
              text: "HARVEST: accounts, data, and money taken and sold on",
              inCampaign: true,
              clue: "the payday",
              order: 4,
            },
          ],
          stage2Prompt: "Order the campaign: recon to harvest",
          doneLine: "Recon → lure → access → harvest. You just mapped a whole attack, end to end.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Which actor owns the RECON phase?",
            options: ["PHANTOM HOOK", "PACKRAT", "MIMIC"],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Why map a campaign into phases?",
            options: [
              "It looks organized",
              "Each phase has its own defense, so you can break any link",
              "Attackers require it",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: defense in depth */
    {
      id: "depth",
      title: "Layers hold",
      concept: "Every layer catches what the last one missed",
      promise: "You'll build defenses that survive one mistake.",
      instruction: "Fill each slot with a layer that holds.",
      intel: {
        beats: [
          "Here's the secret of real security.",
          "No single defense is perfect. Not one.",
          "So you don't build ONE wall. You build many.",
          "If the lure slips past, the vault catches it.",
          "If the password leaks, 2FA catches it.",
          "Every layer covers the gap in the layer before.",
        ],
        prediction: {
          question: "Why build many defenses instead of one perfect one?",
          options: [
            "One perfect defense is impossible, so layers cover each other's gaps",
            "More is always better, no reason",
            "To confuse yourself",
          ],
          answer: 0,
          right: "Right. No wall is perfect. Each layer saves you when another fails.",
          wrong: "There's no perfect wall. Layers work BECAUSE each covers where the last one leaks.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live. Stack the school's defenses, layer by layer.",
          target: "THE LAYERED DEFENSE",
          slots: [
            {
              id: "layer1",
              label: "LAYER 1: WHEN THE LURE ARRIVES",
              options: [
                { id: "a1", label: "Hope nobody clicks", good: false, why: "Hope isn't a layer. In a whole school, SOMEONE clicks. Plan for it." },
                { id: "a2", label: "Trained eyes: read the address, check the source", good: true, why: "The first check catches most lures before they land. Most, not all. That's why there's a layer 2." },
                { id: "a3", label: "Ban the internet", good: false, why: "Not a defense, just a shutdown. Layers protect your life online, they don't end it." },
              ],
            },
            {
              id: "layer2",
              label: "LAYER 2: WHEN A LINK GETS CLICKED ANYWAY",
              options: [
                { id: "b1", label: "Nothing, the click already lost", good: false, why: "That's one-layer thinking. The click is where layer 2 EARNS its place." },
                { id: "b2", label: "The vault sees the fake site and refuses to fill your password", good: true, why: "Layer 1 leaked, layer 2 caught it. The fake site gets no password. That's depth." },
                { id: "b3", label: "Turn off the wifi for everyone", good: false, why: "Punishing everyone isn't a fix. The vault quietly covers this one gap." },
              ],
            },
            {
              id: "layer3",
              label: "LAYER 3: WHEN A PASSWORD LEAKS SOMEWHERE",
              options: [
                { id: "c1", label: "Panic and reset everything by hand", good: false, why: "Panic is not a layer. Your setup should already hold, no scramble needed." },
                { id: "c2", label: "2FA: the leaked password alone opens nothing", good: true, why: "Layers 1 and 2 both failed, and the account STILL holds. That's defense in depth working." },
                { id: "c3", label: "Hope the leak was fake", good: false, why: "Assume every password leaks one day. 2FA is the layer that keeps you safe." },
              ],
            },
          ],
          testLine: "STRESS TEST: FULL CAMPAIGN vs THE STACK … LURE CAUGHT / VAULT HELD / 2FA HELD. 0 ACCOUNTS LOST.",
          doneLine: "Three layers, each covering the last one's gap. One mistake can't sink you now.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "“Defense in depth” means:",
            options: [
              "One very strong wall",
              "Many layers, each covering the gaps in the others",
              "Hiding your accounts",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A password leaks but 2FA is on. Depth means:",
            options: [
              "You're doomed",
              "The next layer holds, the account survives",
              "Delete the account",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: incident command */
    {
      id: "command",
      title: "Incident command",
      concept: "Triage, contain, report, communicate",
      promise: "You'll run a whole-school incident, one move ahead.",
      instruction: "Predict the wave's next phase. Three rounds.",
      intel: {
        beats: [
          "When the wave hits, panic is the enemy's friend.",
          "Analysts run a calm routine instead.",
          "TRIAGE: what's worst, first.",
          "CONTAIN: stop the spread before the cleanup.",
          "REPORT and COMMUNICATE: adults, platform, everyone at risk.",
          "And predict the next phase, because you know the pattern now.",
        ],
        prediction: {
          question: "First move when a whole-school attack hits?",
          options: [
            "Fix your own account, then relax",
            "Triage: find and handle the worst-hit first",
            "Post about it dramatically",
          ],
          answer: 1,
          right: "Right. Worst-first, calmly. Incident command starts with triage.",
          wrong: "Not you first, not drama. Triage means handle the worst-hit first, stay calm.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback: call the wave's next phase before it fires",
          steps: [
            {
              scene:
                "3:02pm. A flood of DMs hits the whole school: “URGENT: verify your school account or lose your grades!”",
              question: "You've seen this before. What phase is NEXT?",
              options: [
                "They give up and go home",
                "ACCESS: the panic clicks become stolen logins",
                "A polite apology",
              ],
              answer: 1,
              reveal:
                "Right on schedule: the clicked links grab passwords. But you called it. 2FA is already on. The vaults refuse the fakes. Reading ahead bought the defense.",
            },
            {
              scene:
                "3:20pm. A few accounts DID get taken. Now they message friends: “hey lend me your login real quick”.",
              question: "what's this phase, and the move?",
              options: [
                "MIMIC's spread. Contain it: warn friends another way, start recovery",
                "Ignore it, only a few accounts",
                "Shame the kids who got caught",
              ],
              answer: 0,
              reveal:
                "Borrowed faces, spreading. Contain it: the code-words and check-another-way habit you taught everyone stop it cold. The wave hits a wall of ready kids.",
            },
            {
              scene:
                "3:45pm. The attack is failing. The coordinator goes still, then sends one quiet, testing message to YOU alone.",
              question: "what does the analyst do with that?",
              options: [
                "Reply and taunt them for losing",
                "Log it, trace the signature, report. It's a lead, not a chat",
                "Panic, they're coming for you",
              ],
              answer: 1,
              reveal:
                "The rhythm of the whole wave just showed where the coordinator hides. You didn't win by fighting harder. You won by reading the pattern. One case left.",
            },
          ],
          doneLine: "TRIAGE, CONTAIN, REPORT. THE WAVE'S OWN RHYTHM POINTED HOME. ONE CASE LEFT.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Incident command, in order:",
            options: [
              "Panic, post, blame",
              "Triage, contain, report, communicate",
              "Hide and wait",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A whole school prepared with code words and 2FA means the wave:",
            options: [
              "Wins easily",
              "Hits a wall of ready kids and fails",
              "Gets angrier",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "All Frequencies",
    phases: 3,
    phaseNames: ["Hold the lures", "Contain the spread", "Read the cadence"],
    component: Mission19Incident,
  },

  debrief: {
    report: [
      "The campaign mapped end to end: recon, lure, access, harvest. Each actor named.",
      "Defense in depth held: lure caught, vault refused, 2FA saved the rest.",
      "Incident command run clean. The wave's own rhythm revealed the coordinator's location.",
    ],
    realWorldMove:
      "This week: pick your three layers and check them. Trained eyes, a password manager, 2FA on your top account. One layer can fail. Three is a wall.",
    wrenLine: "The whole network threw everything at us and the line held. One case left, Agent. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m19-transmission.mp3",
    briefing: "/audio/wren/m19-briefing.mp3",
    debrief: "/audio/wren/m19-debrief.mp3",
  },

  dossier: {
    mo: "The whole network at once: recon, lure, access, harvest. Six actors, one coordinated wave.",
    defeatedBy: "Defense in depth and a whole community that saw it coming. Layers beat waves.",
  },
};

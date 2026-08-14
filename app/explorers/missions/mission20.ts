/**
 * Mission 20 — "Signal Zero" (Block 4 — CAPSTONE, ULTRA ceremony).
 * Actor: ZERO (the coordinator). Map slot: curriculum-map-v1 §M20.
 *
 * No new concepts (Heroes W20 precedent). Pure recombination:
 * (1) the identity puzzle — all five breadcrumbs on one TRACE
 * mega-board; (2) the final lure — a spear built from everything
 * "you" leaked in the course fiction, the hardest INSPECT in the
 * tier; (3) the handoff — you document and hand to adults + the
 * platform (escalation modeled at mastery). Coordinator unmasked as
 * an ex-ARC analyst. ARC chrome never corrupts, even now.
 *
 * VOICE PASS v1: the capstone reads as an earned graduation, a little
 * epic; ZERO stays quiet and grown-up, unmasked with weight not jokes.
 * Strings only; teaching, ids, answers, order, and flags unchanged.
 */

import Mission20Incident from "../incidents/Mission20Incident";
import type { MissionManifest } from "../engine/types";

export const mission20: MissionManifest = {
  id: "explorers-m20",
  caseNumber: "CASE 020",
  title: "Signal Zero",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "ZERO",
    mo: "The one behind all of them. Unmasked tonight.",
    portrait: "/explorers/actors/coordinator.png",
  },

  hook: "Five breadcrumbs. One coordinator. Everything you've learned, one last time. Let's finish this.",
  scene: "/explorers/scenes/m20-cold-open.jpg",

  transmission: {
    headline: "SIGNAL ZERO",
    lines: [
      "This is the last one, Agent. No new tricks.",
      "Only everything you already know, at once.",
      "The coordinator is cornered at last. The calm is gone, and that is when he is most dangerous.",
      "Finish the board. Read the final lure. Hand it over clean.",
    ],
  },

  briefing: {
    summary:
      "No new lessons tonight. Just proof of everything you've become.",
    objectives: [
      "Assemble the identity",
      "Beat the perfect lure",
      "Make the handoff",
    ],
    wrenLine: "Everything you know, Agent, all at once. That is the whole test. And you know so much now.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the identity puzzle */
    {
      id: "identity",
      title: "The whole board",
      concept: "Five breadcrumbs, one coordinator",
      promise: "You'll connect every clue from the whole season.",
      instruction: "Pin the 4 breadcrumbs that name the coordinator.",
      intel: {
        beats: [
          "Every case left a breadcrumb. The routing tag. The linked actors.",
          "One supplier for all. The hidden architect. The recruiter's fingerprint.",
          "Alone, each was a whisper. Tonight they all point at one person.",
          "Assemble the board. Name the coordinator.",
        ],
        beatAudio: [
          "/audio/wren/m20-c1-b1.mp3",
          "/audio/wren/m20-c1-b2.mp3",
          "/audio/wren/m20-c1-b3.mp3",
          "/audio/wren/m20-c1-b4.mp3",
        ],
        prediction: {
          question: "How do five small clues catch one big villain?",
          options: [
            "One clue is always enough",
            "Combined, they point where one alone can't. That's assembly, on your side",
            "Luck",
          ],
          answer: 1,
          right: "Right. The assembly attack, turned around. Their own crumbs give them away.",
          wrong: "One breadcrumb names nobody. TOGETHER they point to one name. Your method, aimed at them.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "The mega-board: pin the breadcrumbs that unmask the coordinator",
          fingerprintHint: "each block's final breadcrumb points at the same person",
          cards: [
            {
              id: "t1",
              surface: "CASE 001",
              from: "breadcrumb ①",
              text: "the ZERO routing tag, first sighting",
              inCampaign: true,
              clue: "the name, before it meant anything",
              order: 1,
            },
            {
              id: "d1",
              surface: "NOISE",
              from: "the archive",
              text: "an old solved case with no STATIC link",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "CASE 005 + 010",
              from: "breadcrumbs ② + ③",
              text: "the actors are connected: one supplier feeds them all",
              inCampaign: true,
              clue: "they were never separate",
              order: 2,
            },
            {
              id: "t3",
              surface: "CASE 015",
              from: "breadcrumb ④",
              text: "every mirror site made by ONE hidden architect",
              inCampaign: true,
              clue: "one hand builds all of it",
              order: 3,
            },
            {
              id: "d2",
              surface: "NOISE",
              from: "the archive",
              text: "a random data leak in another country",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "CASE 018",
              from: "breadcrumb ⑤",
              text: "the recruiter's mark is on every actor and the architect",
              inCampaign: true,
              clue: "the coordinator, reaching out, and caught doing it",
              order: 4,
            },
          ],
          stage2Prompt: "Order the breadcrumbs: first sighting to full identity",
          doneLine: "Tag → connection → architect → recruiter. Five whispers, one name. The board is complete.",
        },
      },
      playAudio: "/audio/wren/m20-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "The breadcrumbs across the season were:",
            options: [
              "Random unrelated clues",
              "Pieces of one identity, revealed a block at a time",
              "Decorations",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Catching the coordinator used the same method as:",
            options: [
              "PACKRAT's assembly attack, turned around",
              "Guessing passwords",
              "A lucky screenshot",
            ],
            answer: 0,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the perfect lure */
    {
      id: "perfectlure",
      title: "The last lure",
      concept: "A spear built from everything you leaked",
      promise: "You'll face the hardest fake in the whole course.",
      instruction: "Tap the 3 tells hidden in the perfect lure.",
      intel: {
        beats: [
          "The coordinator has one move left, aimed at you. Not a sloppy scam.",
          "The perfect one, built from every crumb you left. Your callsign, your cases, even my name.",
          "It will feel completely real. That's the point.",
          "But you know the tells live where the pixels aren't.",
        ],
        beatAudio: [
          "/audio/wren/m20-c2-b1.mp3",
          "/audio/wren/m20-c2-b2.mp3",
          "/audio/wren/m20-c2-b3.mp3",
          "/audio/wren/m20-c2-b4.mp3",
        ],
        prediction: {
          question: "The most dangerous lure of all is the one that:",
          options: [
            "Has the flashiest graphics",
            "Knows the most true things about you",
            "Is the longest",
          ],
          answer: 1,
          right: "Right. Real details lower your guard. That's exactly when tools, not feelings, decide.",
          wrong: "Truth is the weapon here. It makes the ask feel safe. Check with a tool.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 tells hidden in the perfect lure.",
          device: { app: "SECURE MESSAGE", owner: "SENDER: “ARC COMMAND”" },
          header: [
            {
              label: "FROM:",
              seg: { id: "from", text: "“ARC Command <ops@arc-command-secure.net>”", tellId: "domain" },
            },
            { label: "SUBJ:", seg: { id: "subj", text: "Agent: final clearance code required" } },
          ],
          body: [
            [{ id: "b1", text: "“Your ULTRA promotion is approved. WREN is proud.”" }],
            [{ id: "b2", text: "“One step left: confirm your identity with your account code.”", tellId: "ask" }],
            [{ id: "b3", text: "“Reply within 10 minutes or clearance resets.”", tellId: "urgency" }],
            [{ id: "b4", text: "“You've earned this, Agent. Signed, ARC.”" }],
          ],
          tells: [
            {
              id: "domain",
              label: "The address",
              why: "arc-command-secure.net isn't ARC. Read right to left, always. Even at the finish line.",
            },
            {
              id: "ask",
              label: "The code ask",
              why: "ARC never asks for your code. Nobody real ever does. The biggest tell of all.",
            },
            {
              id: "urgency",
              label: "The countdown",
              why: "Ten minutes: CASE 001's oldest trick, dressed as your graduation.",
            },
          ],
          doneLine: "It knew everything about you. Still it couldn't fake a real address or a real ask. The perfect lure fails to the basics.",
        },
      },
      playAudio: "/audio/wren/m20-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "A message knows all your true details AND asks for a code. It's:",
            options: [
              "Definitely real, it knows so much",
              "The most dangerous lure: real facts, fake ask",
              "A nice surprise",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Even from “ARC”, a request for your account code means:",
            options: [
              "Obey, it's your own team",
              "Fake: real ARC never asks for keys",
              "Reply and check",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the handoff */
    {
      id: "handoff",
      title: "The handoff",
      concept: "Write it up and hand it over. You don't punish",
      promise: "You'll learn what a real analyst does at the end.",
      instruction: "Pick how the analyst closes it.",
      intel: {
        beats: [
          "You've cornered the coordinator. Now the real lesson.",
          "You're not the police, not the judge. You're the analyst who sees clearly and documents.",
          "You don't hack them back. You hand the evidence to adults and the platform.",
          "That's not weakness. That's exactly how the pros end it.",
        ],
        beatAudio: [
          "/audio/wren/m20-c3-b1.mp3",
          "/audio/wren/m20-c3-b2.mp3",
          "/audio/wren/m20-c3-b3.mp3",
          "/audio/wren/m20-c3-b4.mp3",
        ],
        prediction: {
          question: "You've found a real criminal. The right final move?",
          options: [
            "Hack them back, they deserve it",
            "Document everything and hand it to adults and the platform",
            "Expose them online yourself",
          ],
          answer: 1,
          right: "Right. See clearly, write it up, pass it to those who act. Mastery, not revenge.",
          wrong: "Hacking back makes you an actor. Exposing yourself puts you in danger. Write it up and hand off.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick how the analyst closes it.",
          situation:
            "The coordinator's identity is proven. You have every receipt. WREN asks: “Your call, Agent. How does this end?”",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "hack",
              label: "Break into their systems and shut them down yourself",
              outcome:
                "That's the recruiter's offer, taken a case too late. The moment you attack, you're what you've spent twenty cases fighting. The Code holds even now.",
            },
            {
              id: "expose",
              label: "Post their identity everywhere so everyone knows",
              outcome:
                "Posting it tips them off, risks the wrong person, and paints a target on you. Analysts don't hand out justice. They help the right people do it.",
            },
            {
              id: "handoff",
              label: "Package the evidence, hand it to ARC's adults and the platform, let them act",
              correct: true,
              outcome:
                "That's mastery. A clean file, the proper channels, people whose job this is. The coordinator was an ex-ARC analyst who chose the other path. Now they're handed over by the rules they threw away. You end it as an analyst, not an avenger.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m20-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The mark of a real analyst at the end of a case:",
            options: [
              "The biggest counter-attack",
              "A clean report handed to people who can act",
              "The most public takedown",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Why NOT hack the criminal back, even when you can?",
            options: [
              "It's too hard",
              "Attacking makes you an actor. The Code is the whole point",
              "You might get a bad grade",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Signal Zero",
    phases: 3,
    phaseNames: ["The last flood", "The unmasking", "The handoff"],
    component: Mission20Incident,
  },

  debrief: {
    report: [
      "The mega-board completed: five breadcrumbs, one coordinator, fully named.",
      "The perfect lure beaten by the basics: true details, fake address, code-ask.",
      "The handoff made clean: written up, passed up, ended by the rules. ULTRA clearance earned.",
    ],
    realWorldMove:
      "You're the family's analyst now. Run a family security night: code word, password manager, 2FA, a privacy audit. Teach one person one thing you learned. That's how a whole community gets safer.",
    wrenLine: "Signal Zero, silenced. You started as a trainee, Agent. You finish as ULTRA, the best analyst I've worked with. Case closed.",
  },

  voice: {
    transmission: "/audio/wren/m20-transmission.mp3",
    briefing: "/audio/wren/m20-briefing.mp3",
    debrief: "/audio/wren/m20-debrief.mp3",
  },

  dossier: {
    mo: "The coordinator behind all six actors. An ex-ARC analyst who chose the other path.",
    defeatedBy: "An operative who assembled every clue. Beat the perfect lure with the basics. Handed it over clean.",
    breadcrumb:
      "CASE CLOSED. Dossier wall complete: six actors, one coordinator, five breadcrumbs (① to ⑤), all connected, all filed. The trainee who started at CASE 001 signs off as ULTRA. The card reprints with a new name on it: yours.",
  },
};

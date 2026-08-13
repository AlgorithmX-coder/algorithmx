/**
 * Mission 09 — "The Long Game" (Block 2: The Human Factor, SECRET).
 * Actor: SIREN ③. Map slot: curriculum-map-v1 §M09.
 *
 * Teaching register (ages 10–13): cons as a BUSINESS (you're volume,
 * not special — and that's liberating), trust-farming (gifts build a
 * debt feeling), the sunk-cost trap, and EXIT SKILLS: leaving a con
 * mid-way without shame. The con is always the con's fault.
 *
 * Sensitive-topics policy (§11, DECIDE 1): the blackmail lever is
 * handled ABSTRACTLY — never pay, never comply, tell an adult
 * immediately, you are not in trouble. No specific imagery.
 */

import Mission09Incident from "../incidents/Mission09Incident";
import type { MissionManifest } from "../engine/types";

export const mission09: MissionManifest = {
  id: "explorers-m09",
  caseNumber: "CASE 009",
  title: "The Long Con",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "SIREN",
    mo: "Plays long. Gifts now, the ask later.",
    portrait: "/explorers/actors/siren.png",
  },

  hook: "Some cons take weeks, all smiles and free gifts. The trap is kindness. And the exit was open the whole time.",
  scene: "/explorers/scenes/m09-cold-open.jpg",

  transmission: {
    headline: "THE COLLECTOR",
    lines: [
      "There's an account on a game server being SO generous it's suspicious.",
      "Free skins. Endless compliments. Weeks of it.",
      "Nobody's been asked for anything back. Yet.",
      "That little “yet” is Siren's whole game. Let's read it.",
    ],
  },

  briefing: {
    summary:
      "Siren plays the long game: gifts first, then weeks of warmth, and the ask lands right when leaving feels too hard.",
    objectives: [
      "See the business behind cons",
      "Trace the trust farm",
      "Learn the clean exit",
    ],
    wrenLine: "The door's never locked, Agent. Cons just paint it shut.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: cons are a business */
    {
      id: "business",
      title: "It's a business",
      concept: "You're one of many, not special. Good news",
      promise: "You'll learn why you were never the special one.",
      instruction: "Pick the 3 moves that prove it's a business.",
      intel: {
        beats: [
          "Here's the secret that breaks every long con.",
          "It's not personal. It's a business.",
          "Siren runs hundreds of targets at once. Same scripts, copy-pasted.",
          "Little numbers tracked in a spreadsheet.",
          "So you're not her special one. You're a row. Row 37, maybe.",
          "Which means none of it was ever really about you. Kind of freeing, right?",
        ],
        prediction: {
          question: "Why does it HELP to know you're one of hundreds?",
          options: [
            "It doesn't, it's just sad",
            "That special feeling dies: it was never about you",
            "It means you're safe no matter what",
          ],
          answer: 1,
          right: "Exactly. Cons run on you feeling chosen. Spreadsheets aren't chosen.",
          wrong: "The con NEEDS you to feel chosen. Seeing the spreadsheet kills the spell.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 moves that prove it's a business.",
          evidence: [
            "The same “you're the only one I trust” line, sent to 40 kids",
            "A ranking of which gifts get the best replies",
            "Chats dropped the instant a kid asks questions",
          ],
          behaviors: [
            { id: "volume", label: "Messages hundreds to catch a few", matches: true },
            { id: "metrics", label: "Tracks which lines work best", matches: true },
            { id: "drops", label: "Drops anyone who asks questions", matches: true },
            { id: "special", label: "Chooses one special friend", matches: false },
            { id: "quits", label: "Gives up after one no", matches: false },
            { id: "friendship", label: "Does it all for friendship", matches: false },
          ],
          picks: 3,
          doneLine: "A spreadsheet, not a friendship. You were just a number. Good news.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "“You're the only one I trust” from an online stranger is:",
            options: [
              "A rare compliment",
              "A script line sent to dozens",
              "Proof of friendship",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "For a scam business, which number matters most?",
            options: [
              "How many kids say no",
              "How few need to say yes",
              "Their follower count",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the trust farm */
    {
      id: "farm",
      title: "The trust farm",
      concept: "Gifts build a debt feeling",
      promise: "You'll trace how weeks of niceness become a trap.",
      instruction: "Pin the 4 farming moves. Then order them.",
      intel: {
        beats: [
          "Long cons don't take. Not at first.",
          "They GIVE. Gifts, compliments, time.",
          "Every gift plants a tiny feeling: I owe them.",
          "Weeks of deposits into your guilt account.",
          "Then one day the account gets collected.",
          "You never signed the loan. Doesn't matter. It FEELS real.",
        ],
        prediction: {
          question: "Why does SIREN give real gifts for weeks?",
          options: [
            "She's generous sometimes",
            "Gifts build a debt feeling she plans to collect",
            "She has spares to burn",
          ],
          answer: 1,
          right: "Right. The gift isn't kindness. It's a deposit.",
          wrong: "Nothing in a long con is free. Gifts are deposits. Collection comes later.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "The trust farm is on the board. Pin every move.",
          fingerprintHint: "warmth that arrives on a schedule",
          cards: [
            {
              id: "t1",
              surface: "WEEK 1",
              from: "collector_account",
              text: "“here, free skin! no reason 😊 just think you're cool”",
              inCampaign: true,
              clue: "a gift out of nowhere: the opening deposit",
              order: 1,
            },
            {
              id: "d1",
              surface: "WEEK 2",
              from: "server admin",
              text: "tournament brackets are posted, good luck all",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "WEEK 2",
              from: "collector_account",
              text: "daily check-ins: “how was the maths test?? tell me everything”",
              inCampaign: true,
              clue: "closeness on a schedule",
              order: 2,
            },
            {
              id: "t3",
              surface: "WEEK 3",
              from: "collector_account",
              text: "“hold 50 coins for me? actually keep them lol you've earned it”",
              inCampaign: true,
              clue: "small trust deposits that grow your debt feeling",
              order: 3,
            },
            {
              id: "d2",
              surface: "WEEK 3",
              from: "your friend Maya",
              text: "team call at 6? bring snacks",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "WEEK 4",
              from: "collector_account",
              text: "“I need your account for one day. after everything… yeah?”",
              inCampaign: true,
              clue: "the collection: the debt gets called in",
              order: 4,
            },
          ],
          stage2Prompt: "Order the farm: how the debt feeling was built",
          doneLine: "Gift → streak → deposits → collection. A loan you never asked for, called in.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "A surprise gift from a stranger account is usually:",
            options: [
              "Free stuff, no strings",
              "An opening deposit they plan to collect",
              "A system glitch",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "“Hold my coins lol, actually keep them” builds:",
            options: [
              "Your savings",
              "A trust-debt feeling for later",
              "Nothing at all",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: exit skills */
    {
      id: "exit",
      title: "The clean exit",
      concept: "Leaving a con partway, without shame",
      promise: "You'll learn to walk out of a con at any point.",
      instruction: "Pick the exit that actually works.",
      intel: {
        beats: [
          "The most important skill tonight: leaving.",
          "Cons make exits feel impossible. “You've come this far.”",
          "That's the sunk-cost trap. It counts your old steps for you.",
          "Truth: steps already taken are never a reason for one more.",
          "And if anyone threatens to share something embarrassing:",
          "Never pay. Never obey. Tell an adult. You are NOT in trouble.",
        ],
        prediction: {
          question: "Three weeks in, leaving feels wasteful. That feeling is:",
          options: [
            "Proof you should stay",
            "The sunk-cost trap doing its job",
            "Loyalty, which matters",
          ],
          answer: 1,
          right: "Right. Wasted weeks aren't saved by wasting more.",
          wrong: "That exact feeling IS the trap. Past steps are never a reason for more.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the exit that actually works.",
          situation:
            "Week 3. You've realized it's a con. But you took the gifts. The message reads: “after everything I've given you, you owe me this.”",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "stay",
              label: "See it through, you've come this far",
              outcome:
                "The con's favorite math. Every step you've taken is exactly why it wants one more. The count only stops when you stop.",
            },
            {
              id: "exit",
              label: "Exit now: stop replying, keep the evidence, tell an adult",
              correct: true,
              outcome:
                "Clean. You owe a con nothing. Gifts were bait, not kindness. The con is 100% the con's fault. An adult plus evidence ends it properly.",
            },
            {
              id: "comply",
              label: "Do the favor quietly so it all goes away",
              outcome:
                "It never goes away. Giving in proves the hook is set, so the asks grow. Never pay, never obey. Tell an adult. You are not in trouble.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Someone threatens to share something embarrassing unless you obey. The rule:",
            options: [
              "Pay once, quickly and quietly",
              "Never pay, never obey, tell an adult right away",
              "Delete all your accounts",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A con is ALWAYS whose fault?",
            options: [
              "The kid who believed it",
              "The con artist. Every time.",
              "The internet's",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Collector",
    phases: 3,
    phaseNames: ["Spot the farm", "Find the turn", "Coach the exit"],
    component: Mission09Incident,
  },

  debrief: {
    report: [
      "You saw the business from above: scripts, numbers, hundreds of targets. Nobody special, everybody safer.",
      "The trust farm traced end to end: gift, streak, deposits, collection.",
      "One clean exit coached: no shame, no payment, evidence kept, adult told.",
    ],
    realWorldMove:
      "The pause-and-tell rule. Any ask about money, codes, or secrets? Pause. Tell an adult the same day. And if anyone threatens you with something embarrassing, tell an adult right away. Never pay. Never obey. You are not in trouble.",
    wrenLine: "Long game read, exit clean. Nobody owes a con anything. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m09-transmission.mp3",
    briefing: "/audio/wren/m09-briefing.mp3",
    debrief: "/audio/wren/m09-debrief.mp3",
  },

  dossier: {
    mo: "Plays the long game: gifts, flattery, weeks of patience. “You're special… just us.” Then the ask you feel you owe.",
    defeatedBy: "Anyone who knows they're one of many and the exit's always open. The con is the con's fault. Every time.",
  },
};

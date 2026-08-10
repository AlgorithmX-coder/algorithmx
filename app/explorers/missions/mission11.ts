/**
 * Mission 11 — "The Master Key" (Block 3: Systems, TOP SECRET track).
 * Actor: SKELETON KEY ②. BUILD debuts. Map slot: curriculum-map-v1 §M11.
 *
 * Teaching register (ages 10–13): unique × strong × forty accounts is
 * a TOOL'S job, not a brain's. Build the password manager (generate,
 * store, one strong master passphrase), then 2FA — the second lock.
 * Codes are keys, and NOBODY gets asked for keys (M07 callback).
 * The landing page's "watch them hold" — delivered in the boss.
 */

import Mission11Incident from "../incidents/Mission11Incident";
import type { MissionManifest } from "../engine/types";

export const mission11: MissionManifest = {
  id: "explorers-m11",
  caseNumber: "CASE 011",
  title: "Two-Factor",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "SKELETON KEY",
    mo: "Back with the rig. Bigger lists this time.",
    portrait: "/explorers/actors/skeleton-key.png",
  },

  hook: "Forty accounts, forty strong locks. No brain can do that. Tonight you build the machine that can.",
  scene: "/explorers/scenes/m11-cold-open.jpg",

  transmission: {
    headline: "THE RIG RETURNS",
    lines: [
      "SKELETON KEY is back. New lists, faster rig.",
      "In Case 3 you beat him with one good passphrase.",
      "But you own forty accounts, not one.",
      "Brains can't hold forty strong locks. Tools can.",
    ],
  },

  briefing: {
    summary:
      "Unique, strong, times forty. That's not a memory job. It's an engineering job.",
    objectives: [
      "See the brain's limit",
      "Build the vault",
      "Add the second lock",
    ],
    wrenLine: "Analysts don't memorize harder, Operative. They build better.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the brain's limit */
    {
      id: "limit",
      title: "The forty-lock problem",
      concept: "Strong and unique, times forty: a tool's job",
      promise: "You'll learn why no one can memorize forty strong locks.",
      instruction: "Pick the plan that actually works.",
      intel: {
        beats: [
          "Quick math, Operative.",
          "Every account needs a STRONG password.",
          "Every account needs a DIFFERENT one. That was Case 3.",
          "You have about forty accounts.",
          "Forty strong, unique passwords, memorized? Nobody can.",
          "So people cheat and reuse. The rig loves cheaters.",
        ],
        prediction: {
          question: "Why do most people end up reusing passwords?",
          options: [
            "They're lazy and careless",
            "The job is impossible, so they cut corners",
            "Reusing is actually fine",
          ],
          answer: 1,
          right: "Right. It's not laziness. An impossible job needs a tool.",
          wrong: "It's not laziness. The job really is impossible for brains. That's why tools exist.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the plan that actually works.",
          situation:
            "Jake's back. After Case 3 he fixed three passwords. But he has forty accounts and one brain.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "memorize",
              label: "Train harder: memorize forty random passphrases",
              outcome:
                "Nobody keeps that up. By week two he'll reuse. Then one leak opens forty doors again. Impossible plans turn into bad habits.",
            },
            {
              id: "onegreat",
              label: "One AMAZING passphrase, used everywhere",
              outcome:
                "One great key on forty doors is a master key. It works for whoever leaks it. The strength isn't the problem. The reuse is.",
            },
            {
              id: "manager",
              label: "A password manager: it remembers forty, he remembers one",
              correct: true,
              outcome:
                "That's the tool. The manager makes and stores forty random monsters. Jake memorizes ONE master passphrase. Brains do one thing well. Let them.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A password manager's deal is:",
            options: [
              "It emails you your passwords",
              "It remembers forty, you remember one",
              "It removes passwords entirely",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Why does “memorize everything” always fail?",
            options: [
              "People are careless",
              "The job is impossible, so people reuse instead",
              "Memory apps are expensive",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: BUILD the vault */
    {
      id: "vault",
      title: "Build the vault",
      concept: "Generate, store, one master passphrase",
      promise: "You'll build a real password vault, part by part.",
      instruction: "Fill each slot with the part that holds.",
      intel: {
        beats: [
          "New tool unlocked: the WORKBENCH.",
          "Three slots make a vault.",
          "The master passphrase: the one key you'll actually remember.",
          "The generator: where the forty monsters come from.",
          "The storage: where they live, sealed.",
          "Choose well. The rig gets a test run after.",
        ],
        prediction: {
          question: "The master passphrase is the one password you memorize. It should be:",
          options: [
            "Short, so it's quick to type",
            "Long random words, it guards everything else",
            "Your name plus the year",
          ],
          answer: 1,
          right: "Right. It's the door to every door. Case 3 rules, at full strength.",
          wrong: "It guards ALL the others. So it gets your strongest Case 3 passphrase, nothing less.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live: build the vault",
          target: "JAKE'S PASSWORD VAULT",
          slots: [
            {
              id: "master",
              label: "SLOT 1: THE MASTER KEY (the one he memorizes)",
              options: [
                { id: "m1", label: "Jake2015!", good: false, why: "The rig guesses these first. Case 3 showed this falls in a second." },
                { id: "m2", label: "crater-violin-mustard-9-lantern", good: true, why: "Five random words. Centuries of rig-work. And it's the ONLY thing Jake memorizes." },
                { id: "m3", label: "biscuit1 (the dog, for luck)", good: false, why: "Biscuit is in forty posts. PACKRAT sells that list. Nothing about you, ever." },
              ],
            },
            {
              id: "generator",
              label: "SLOT 2: WHERE THE OTHER 40 COME FROM",
              options: [
                { id: "g1", label: "Reuse the master everywhere, it's strong enough", good: false, why: "One key on forty doors is SKELETON KEY's dream. The master opens the vault, nothing else." },
                { id: "g2", label: "Let the manager generate random 20-character monsters", good: true, why: "Forty unique monsters nobody ever has to remember or type. The rig retires." },
                { id: "g3", label: "Keep his old passwords, they're familiar", good: false, why: "The old ones are the leaked ones. Familiar means already on a list somewhere." },
              ],
            },
            {
              id: "storage",
              label: "SLOT 3: WHERE THEY LIVE",
              options: [
                { id: "s1", label: "A note on his phone called “passwords”", good: false, why: "Case 3's check found exactly this note. Unlocked storage is a gift basket." },
                { id: "s2", label: "The manager's encrypted vault, locked by the master key", good: true, why: "Sealed with real encryption. Even stolen, it's unreadable without the master passphrase." },
                { id: "s3", label: "A sticky note under the keyboard", good: false, why: "Anyone in the room owns every account. Storage has to survive visitors." },
              ],
            },
          ],
          testLine: "STRESS TEST: RIG vs VAULT … 0 DOORS OPENED. PROJECTED CRACK TIME: CENTURIES.",
          doneLine: "One key in his head, forty monsters in the vault. Jake just out-engineered the rig.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "How many passwords does Jake memorize now?",
            options: ["Forty", "One: the master passphrase", "Zero"],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Where must generated passwords NEVER live?",
            options: [
              "The encrypted vault",
              "An unlocked note or sticky note",
              "The manager's autofill",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the second lock */
    {
      id: "secondlock",
      title: "The second lock",
      concept: "2FA: something you know + something you have",
      promise: "You'll learn the lock that holds even if the password leaks.",
      instruction: "Tap the 3 accounts missing their second lock.",
      intel: {
        beats: [
          "One more layer and this fortress is done.",
          "Two-factor authentication. 2FA.",
          "Lock one: something you KNOW, the password.",
          "Lock two: something you HAVE, your phone's code.",
          "A thief needs both. Stealing one gets nothing.",
          "And remember Case 7: codes are keys. Nobody gets asked for keys.",
        ],
        prediction: {
          question: "A thief has your password. 2FA is on. What happens?",
          options: [
            "They're in anyway",
            "They're stopped, they don't have your phone",
            "The account deletes itself",
          ],
          answer: 1,
          right: "Right. One stolen lock, zero doors. That's the whole point of two.",
          wrong: "They hit the second lock: the code on YOUR phone. One stolen key opens nothing.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 accounts missing their second lock.",
          device: { app: "SECURITY CENTER", owner: "JAKE'S ACCOUNTS · CHECK VIEW" },
          header: [
            { label: "SCAN:", seg: { id: "scan", text: "which doors still have ONE lock?" } },
          ],
          body: [
            [{ id: "a1", text: "EMAIL · the master door · 2FA: OFF", tellId: "email" }],
            [{ id: "a2", text: "GAMEHUB · saved card attached · 2FA: OFF", tellId: "game" }],
            [{ id: "a3", text: "SCHOOL PORTAL · 2FA: ON via app code" }],
            [{ id: "a4", text: "CLOUD PHOTOS · every family picture · 2FA: OFF", tellId: "photos" }],
          ],
          tells: [
            {
              id: "email",
              label: "Email, one lock",
              why: "The master door with a single lock. 2FA here first, always.",
            },
            {
              id: "game",
              label: "Money attached, one lock",
              why: "A saved card makes this a wallet. Wallets get two locks.",
            },
            {
              id: "photos",
              label: "Memories, one lock",
              why: "These photos can't be replaced. Things you can't replace get the second lock.",
            },
          ],
          doneLine: "Three doors upgraded to two locks. Now even a leaked password opens nothing.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "2FA means a thief needs:",
            options: [
              "A better password list",
              "Something you know AND something you have",
              "Your username twice",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Anyone at all asks you to read out a 2FA code. That's:",
            options: [
              "Normal support stuff",
              "A key-ask. Nobody legit ever asks for keys",
              "Fine if they sound official",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Locksmith's Nightmare",
    phases: 3,
    phaseNames: ["The rig sings", "The old trick", "The last resort"],
    component: Mission11Incident,
  },

  debrief: {
    report: [
      "The forty-lock problem solved by engineering, not memory: one master key, forty monsters.",
      "The vault built and stress-tested: zero doors opened, crack time in centuries.",
      "Second locks installed on email, wallet, and memories. The rig retired mid-song.",
    ],
    realWorldMove:
      "This week, with a parent: turn on 2FA for your most important account. Email first. Ten minutes, one QR code. A leaked password becomes worthless.",
    wrenLine: "Forty doors, eighty locks, zero worries. The locksmith's having a bad night. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m11-transmission.mp3",
    briefing: "/audio/wren/m11-briefing.mp3",
    debrief: "/audio/wren/m11-debrief.mp3",
  },

  dossier: {
    mo: "Nonstop guessing: bigger lists, faster rigs, and every stolen key tried everywhere.",
    defeatedBy: "A vault he can't guess and a second lock he can't hold. Engineering beats memory.",
  },
};

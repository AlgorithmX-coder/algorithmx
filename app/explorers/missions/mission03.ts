/**
 * Mission 03 — "The Guessing Game" (Block 1: Signals, CONFIDENTIAL).
 * Actor: SKELETON KEY ①. Map slot: curriculum-map-v1 §M03.
 *
 * Teaching register (ages 10–13): mechanism over slogan. Heroes W1
 * taught password RULES; this teaches WHY they work — how a guessing
 * rig actually thinks (patterns first), why reuse is a master key
 * (email = the master door), and why length beats cleverness.
 *
 * Safety canon (Redoubt boundary): the child WATCHES and ANALYZES the
 * rig — in the fiction it runs inside ARC's sealed range. The child
 * never operates it, and audits are volunteer-authorized.
 */

import Mission03Incident from "../incidents/Mission03Incident";
import type { MissionManifest } from "../engine/types";

export const mission03: MissionManifest = {
  id: "explorers-m03",
  caseNumber: "CASE 003",
  title: "The Guessing Game",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "SKELETON KEY",
    mo: "Doesn't trick you. Guesses you.",
    portrait: "/explorers/actors/skeleton-key.png",
  },

  hook: "Someone is guessing student passwords. Three hundred tries a second. Let's beat it.",
  scene: "/explorers/scenes/m03-cold-open.jpg",

  transmission: {
    headline: "RIG DETECTED",
    lines: [
      "A password-guessing rig just lit up on ARC's board.",
      "It's pointed at student accounts.",
      "Three hundred guesses a second. No tricks, no bait.",
      "Just math. Let's learn how it thinks, then beat it.",
    ],
  },

  briefing: {
    summary:
      "SKELETON KEY doesn't fool people. He guesses them. Tonight we learn his math.",
    objectives: [
      "See how the rig guesses",
      "Break the reuse chain",
      "Build a passphrase that holds",
    ],
    wrenLine: "Locks first, Operative. The rig doesn't sleep.",
  },

  cycles: [
    /* ---------------------------------------- cycle 1: how guessing works */
    {
      id: "rig",
      title: "Watch the rig think",
      concept: "Guessing is a list, not magic",
      promise: "You'll learn why weak passwords fall in seconds.",
      instruction: "Tap the 3 passwords the rig eats first.",
      intel: {
        beats: [
          "The rig is running in ARC's sealed range right now.",
          "Watch it. It isn't guessing randomly.",
          "It runs lists: names, pets, birthdays, keyboard rows.",
          "Millions of common patterns, most likely first.",
          "Millie2013! looks personal. It's on the list.",
          "The rig never met Millie. It didn't need to.",
        ],
        prediction: {
          question: "Why does Millie2013! fall in seconds?",
          options: [
            "The rig knows Millie personally",
            "Name-plus-year is on every guessing list",
            "The ! gives it away",
          ],
          answer: 1,
          right: "Exactly. It's not magic. It's a list. Common patterns go first.",
          wrong: "The rig never met her. It just tries the most common patterns first.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 passwords the rig eats first.",
          device: { app: "NOTES", owner: "JAKE'S PHONE (audit: he said yes)" },
          header: [
            { label: "NOTE:", seg: { id: "title", text: "my passwords (don't tell anyone lol)" } },
            { label: "AUDIT:", seg: { id: "audit", text: "authorized by Jake · ARC volunteer check" } },
          ],
          body: [
            [{ id: "e1", text: "GameHub: Jake2014!", tellId: "pattern", mono: true }],
            [{ id: "e2", text: "School email: Jake2014! (same as game, easy!)", tellId: "reuse", mono: true }],
            [{ id: "e3", text: "Streaming: biscuit1 (my dog lol)", tellId: "pet", mono: true }],
            [{ id: "e4", text: "Library: kite-mango-thunder-52", mono: true }],
          ],
          tells: [
            {
              id: "pattern",
              label: "Name + year",
              why: "Name-plus-year is the rig's first guess family. Falls in under a second.",
            },
            {
              id: "reuse",
              label: "Same key twice",
              why: "Same key, two doors. One leak opens both.",
            },
            {
              id: "pet",
              label: "Pet name",
              why: "Biscuit is in Jake's posts. Rigs read posts.",
            },
          ],
          doneLine: "Three soft locks. The rig eats these for breakfast. The library one outlives it.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Which password does the rig crack FIRST?",
            options: ["Emma2015!", "plum-glacier-radio-77", "A random 12-letter jumble"],
            answer: 0,
          },
          {
            id: "c1q2",
            question: "Your password is your cat plus your birth year. Why is that weak?",
            options: [
              "Cats are too common",
              "Both facts are in your posts, and on the list",
              "It's too short to remember",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 2: reuse is a master key */
    {
      id: "reuse",
      title: "Break the chain",
      concept: "One reused key opens every door",
      promise: "You'll learn why one leak can take every account.",
      instruction: "Pick which account Jake fixes first.",
      intel: {
        beats: [
          "Last month a tiny game forum leaked its passwords.",
          "SKELETON KEY bought the list.",
          "Now he tries each stolen key on every other door.",
          "Email. Games. School. Same key, same minute.",
          "A reused password isn't one problem.",
          "It's every problem, all at once.",
        ],
        prediction: {
          question: "A forum leaks your password. Which door does SK try first?",
          options: [
            "The same forum again",
            "Your email: it can reset everything else",
            "None: one site is one site",
          ],
          answer: 1,
          right: "Right. Email is the master door. Reset any lock from inside it.",
          wrong: "The forum is already done. Email is the master door. It resets everything.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick which account Jake fixes first.",
          situation:
            "Jake's forum password just leaked. He reuses it in three places. He has time to fix ONE account right now.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "game",
              label: "The game account: the leak came from there",
              outcome:
                "The leak started there, but the damage moved on. His email is the master door, and SK is already at it.",
            },
            {
              id: "email",
              label: "The email: it resets everything else",
              correct: true,
              outcome:
                "Clean. Lock the master door first, then work down the list. That's triage.",
            },
            {
              id: "social",
              label: "The socials: losing those would be so embarrassing",
              outcome:
                "Embarrassing, sure. But email can take everything, including the socials. Master door first.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Why protect your email hardest of all?",
            options: [
              "It gets the most messages",
              "It can reset every other password",
              "It's the oldest account",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A site you use gets breached. Your move?",
            options: [
              "Change that password everywhere you reused it",
              "Wait for the site to fix it",
              "Delete the account and forget it",
            ],
            answer: 0,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 3: passphrases that survive */
    {
      id: "phrase",
      title: "Build the wall",
      concept: "Length beats cleverness",
      promise: "You'll learn to build a password the rig can't touch.",
      instruction: "Pick the 3 rules that stop the rig.",
      intel: {
        beats: [
          "So what actually survives the rig?",
          "Not cleverness. Length.",
          "P@ssw0rd! looks tough. Falls in minutes. Swaps are on the list.",
          "Three random words beat one clever word.",
          "banana-rocket-lampshade-9 gives the rig centuries of work.",
          "Long. Random. Never reused. That's the whole spell.",
        ],
        prediction: {
          question: "Which password survives the rig longest?",
          options: ["P@ssw0rd!2026", "banana-rocket-lampshade-9", "Jake!!!"],
          answer: 1,
          right: "Length wins. Twenty-five characters of nonsense is a wall.",
          wrong: "Letter-swaps are on the rig's list too. Length and randomness win.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 rules that stop the rig.",
          evidence: [
            "Jake2014! fell in under a second",
            "P@ssw0rd! fell in minutes: swaps are on the list",
            "kite-mango-thunder-52 outlived the whole test",
          ],
          behaviors: [
            { id: "long", label: "Long: three or four random words", matches: true },
            { id: "random", label: "Random: nothing about you in it", matches: true },
            { id: "unique", label: "Unique: a different key for every door", matches: true },
            { id: "swap", label: "Swap letters for symbols (a → @)", matches: false },
            { id: "exclaim", label: "Add a ! at the end", matches: false },
            { id: "capital", label: "Capitalize the first letter", matches: false },
          ],
          picks: 3,
          doneLine: "Long, random, unique. The rig just became SKELETON KEY's problem.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Which change upgrades a password MOST?",
            options: [
              "Adding a ! at the end",
              "Making it three random words",
              "Capitalizing the first letter",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "You use plum-glacier-radio-77 for EVERY account. The weak spot?",
            options: [
              "Too silly to be safe",
              "Reused: one leak opens every door",
              "Too long to type",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Ten Thousand Doors",
    phases: 3,
    phaseNames: ["Spot the weak door", "Break the chain", "Hold the wall"],
    component: Mission03Incident,
  },

  debrief: {
    report: [
      "One guessing rig dissected: lists first, patterns first, no magic anywhere.",
      "Reuse chain broken: master door locked first, then down the list.",
      "New wall built: long, random, unique. The rig bounced.",
    ],
    realWorldMove:
      "This week: find your one most-reused password and change it. Three random words, different everywhere. If the account is shared with family, do it together with a parent.",
    wrenLine: "Ten thousand doors held. Your locks, your rules. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m03-transmission.mp3",
    briefing: "/audio/wren/m03-briefing.mp3",
    debrief: "/audio/wren/m03-debrief.mp3",
  },

  dossier: {
    mo: "Doesn't trick you. Guesses you. Names, pets, birthdays, then every stolen key on every door.",
    defeatedBy: "Long random passphrases, never reused. His rig does the math and gives up.",
  },
};

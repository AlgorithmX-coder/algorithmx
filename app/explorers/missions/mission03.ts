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
 *
 * VOICE PASS v1: kid-voice + humour; SKELETON KEY is a cocky lock-picker
 * who brags he can crack anything. Teaching, ids, answers all unchanged.
 */

import Mission03Incident from "../incidents/Mission03Incident";
import type { MissionManifest } from "../engine/types";

export const mission03: MissionManifest = {
  id: "explorers-m03",
  caseNumber: "CASE 003",
  title: "Brute Force",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "SKELETON KEY",
    mo: "Doesn't trick you. He guesses you. Swears every lock talks eventually.",
    portrait: "/explorers/actors/skeleton-key.png",
  },

  hook: "Someone's guessing student passwords. Three hundred tries a second, no coffee breaks. Let's beat him at his own game.",
  scene: "/explorers/scenes/m03-cold-open.jpg",

  transmission: {
    headline: "RIG DETECTED",
    lines: [
      "A password-guessing rig just lit up ARC's board.",
      "It's aimed straight at student accounts.",
      "Three hundred guesses a second. No tricks, no bait, just cold math.",
      "The owner calls himself SKELETON KEY. Says every lock talks. Let's shut him up.",
    ],
  },

  briefing: {
    summary:
      "SKELETON KEY doesn't fool people. He guesses them. Tonight we learn his math and jam it.",
    objectives: [
      "See how the rig guesses",
      "Break the reuse chain",
      "Build a passphrase that holds",
    ],
    wrenLine: "Locks first, Operative. The rig doesn't sleep, and neither does his ego.",
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
          "The rig's running in ARC's sealed range right now. Behind glass. Relax.",
          "Watch it work. It isn't guessing at random.",
          "It runs lists: names, pets, birthdays, keyboard rows.",
          "Millions of common patterns, most likely ones first.",
          "Millie2013! looks personal, right? It's already on the list.",
          "SKELETON KEY never met Millie. Didn't need to. That's the con.",
        ],
        prediction: {
          question: "Why does Millie2013! fall in seconds?",
          options: [
            "The rig knows Millie personally",
            "Name-plus-year is on every guessing list",
            "The ! gives it away",
          ],
          answer: 1,
          right: "Exactly. No magic, just a list. The common stuff goes first.",
          wrong: "The rig never met her. It just tries the most common patterns first, and hers is one.",
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
              why: "Name-plus-year is the rig's favorite opener. Down in under a second.",
            },
            {
              id: "reuse",
              label: "Same key twice",
              why: "Same key, two doors. One leak and both swing open.",
            },
            {
              id: "pet",
              label: "Pet name",
              why: "Biscuit's all over Jake's posts. The rig reads posts too.",
            },
          ],
          doneLine: "Three soft locks, gone. The rig eats these for breakfast. That library one will still be standing.",
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
          "Last month a tiny game forum spilled its passwords.",
          "SKELETON KEY bought the whole list. Cheap, apparently.",
          "Now he tries every stolen key on every other door.",
          "Email, games, school. Same key, same minute.",
          "A reused password isn't one problem.",
          "It's every problem at once, gift-wrapped.",
        ],
        prediction: {
          question: "A forum leaks your password. Which door does SK try first?",
          options: [
            "The same forum again",
            "Your email: it can reset everything else",
            "None: one site is one site",
          ],
          answer: 1,
          right: "Right. Email's the master door. From inside it he resets every other lock.",
          wrong: "The forum's old news. Email is the master door, and it resets everything.",
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
                "The leak started there, sure, but SKELETON KEY already moved on. Email's the master door, and he's picking at it right now.",
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
                "Embarrassing, yeah. But email can grab everything, socials included. Master door first.",
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
          "Not cleverness. Boring old length.",
          "P@ssw0rd! looks tough. Falls in minutes. The rig knows every letter-swap.",
          "Three random words beat one clever word, every time.",
          "banana-rocket-lampshade-9 buys you centuries of the rig's time.",
          "Long, random, never reused. That's the whole trick.",
        ],
        prediction: {
          question: "Which password survives the rig longest?",
          options: ["P@ssw0rd!2026", "banana-rocket-lampshade-9", "Jake!!!"],
          answer: 1,
          right: "Length wins. Twenty-five characters of pure nonsense is a wall.",
          wrong: "Letter-swaps are on the rig's list too. Length and randomness are what win.",
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
          doneLine: "Long, random, unique. Now the rig is SKELETON KEY's problem, not yours.",
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
      "One guessing rig taken apart: lists first, patterns first, no magic anywhere.",
      "Reuse chain snapped: master door locked first, then down the list.",
      "New wall built, long, random, unique. The rig bounced right off it.",
    ],
    realWorldMove:
      "This week: find your one most-reused password and change it. Three random words, different everywhere. If the account is shared with family, do it together with a parent.",
    wrenLine: "Ten thousand doors, all still locked. Your rules now, not his. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m03-transmission.mp3",
    briefing: "/audio/wren/m03-briefing.mp3",
    debrief: "/audio/wren/m03-debrief.mp3",
  },

  dossier: {
    mo: "Doesn't trick you, he guesses you. Names, pets, birthdays, then every stolen key on every door. Swears every lock talks eventually.",
    defeatedBy: "Long random passphrases, never reused. The rig does the math, sulks, and gives up.",
  },
};

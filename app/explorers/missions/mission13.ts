/**
 * Mission 13 — "Backdoors" (Block 3: Systems, TOP SECRET track).
 * Actor: SKELETON KEY ③. Map slot: curriculum-map-v1 §M13.
 *
 * Teaching register (ages 10–13): recovery is the back door. Security
 * questions are answered by public crumbs (direct M04 callback —
 * cross-actor synthesis: PACKRAT's harvest opens SKELETON KEY's
 * door). Strategic answers (true is guessable, nonsense is safe),
 * recovery-contact freshness, and session hygiene (Heroes W18's rule
 * grown into the session concept).
 */

import Mission13Incident from "../incidents/Mission13Incident";
import type { MissionManifest } from "../engine/types";

export const mission13: MissionManifest = {
  id: "explorers-m13",
  caseNumber: "CASE 013",
  title: "Backdoors",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "SKELETON KEY",
    mo: "Skips your lock. Rings the recovery bell.",
    portrait: "/explorers/actors/skeleton-key.png",
  },

  hook: "Your password is perfect now. So SKELETON KEY stopped attacking it. Find his new door.",
  scene: "/explorers/scenes/m13-cold-open.jpg",

  transmission: {
    headline: "SIDE DOOR",
    lines: [
      "Jake's vault held. The rig retired. Good work.",
      "So SKELETON KEY changed doors.",
      "Every account has a back door: the recovery path.",
      "“Forgot password?” Tonight, that button is the battlefield.",
    ],
  },

  briefing: {
    summary:
      "Locks don't matter if the side door answers to your dog's name.",
    objectives: [
      "Trace the crumb chain",
      "Harden the recovery path",
      "Sweep your sessions",
    ],
    wrenLine: "Strong front doors make busy side doors, Operative.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the crumb chain */
    {
      id: "chain",
      title: "The side door",
      concept: "Public crumbs answer private questions",
      promise: "You'll trace a break-in that never touched the lock.",
      instruction: "Pin the 4 break-in steps. Then order them.",
      intel: {
        beats: [
          "Remember CASE 004? Priya's crumbs. PACKRAT's file.",
          "Watch what those crumbs are worth now.",
          "“First pet's name?” Her posts answered that.",
          "“First school?” The match-day photo answered that.",
          "Security questions assume your life is private.",
          "Your life is posted. That's the back door.",
        ],
        prediction: {
          question: "Why does SKELETON KEY love security questions?",
          options: [
            "They're fun to read",
            "The answers are usually posted somewhere public",
            "They can't be changed",
          ],
          answer: 1,
          right: "Right. Questions about your life, answered by your feed.",
          wrong: "Pet names, schools, birthdays: your feed answers them all. That's his door.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Break-in board: pin every step of the side-door entry",
          fingerprintHint: "public crumbs answering private questions",
          cards: [
            {
              id: "t1",
              surface: "LOGIN PAGE",
              from: "SKELETON KEY",
              text: "clicks “Forgot password?” and the security questions appear",
              inCampaign: true,
              clue: "the side door, found",
              order: 1,
            },
            {
              id: "d1",
              surface: "FORUM",
              from: "Priya",
              text: "how do you solve question 4 on the maths sheet lol",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "HER POSTS",
              from: "SKELETON KEY",
              text: "“First pet's name?” → biscuit1, posted in a dozen captions",
              inCampaign: true,
              clue: "CASE 004's crumbs, cashed in",
              order: 2,
            },
            {
              id: "t3",
              surface: "HER PHOTOS",
              from: "SKELETON KEY",
              text: "“First school?” → the match-day photo crest answers it",
              inCampaign: true,
              clue: "the photo speaks for her",
              order: 3,
            },
            {
              id: "d2",
              surface: "SERVER",
              from: "admin",
              text: "tournament bracket update posted",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "LOGIN PAGE",
              from: "SKELETON KEY",
              text: "answers accepted: “set your new password now”",
              inCampaign: true,
              clue: "the door opens; the lock was never touched",
              order: 4,
            },
          ],
          stage2Prompt: "Order the break-in. No password was ever guessed.",
          doneLine: "Question → crumb → answer → open door. The monster passphrase never even got a visit.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "The side-door break-in needed:",
            options: [
              "A faster guessing rig",
              "Your public posts and a “forgot password” button",
              "A stolen phone",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Which actor's earlier work made this break-in possible?",
            options: ["SIREN's gifts", "PACKRAT's crumb file", "GHOSTWRITER's scripts"],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: strategic answers */
    {
      id: "answers",
      title: "Lie to the robot",
      concept: "Answers must be unguessable, not true",
      promise: "You'll harden a recovery path so crumbs stop working.",
      instruction: "Fill each slot with the part that holds.",
      intel: {
        beats: [
          "Here's the trick nobody tells you.",
          "Security answers don't have to be TRUE.",
          "They have to be UNGUESSABLE.",
          "First pet? “purple-staircase-42.” The robot doesn't care.",
          "Store the nonsense in your vault, M11's machine.",
          "And keep recovery email and phone CURRENT. Stale ones get stolen.",
        ],
        prediction: {
          question: "Best answer to “What's your first pet's name?”",
          options: [
            "The truth, it's easy to remember",
            "Made-up nonsense, stored in the password manager",
            "Leave it blank",
          ],
          answer: 1,
          right: "Right. True is findable. Nonsense in the vault is invisible.",
          wrong: "The truth is in your posts. Lie to the robot. Let the vault remember the lie.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live: harden Priya's recovery path",
          target: "PRIYA'S SIDE DOOR",
          slots: [
            {
              id: "answers",
              label: "SLOT 1: THE SECURITY ANSWERS",
              options: [
                { id: "a1", label: "True answers: pet, school, birthday", good: false, why: "All three are in her posts. True answers are the open door we just traced." },
                { id: "a2", label: "Made-up nonsense answers, saved in the vault", good: true, why: "“First pet: purple-staircase-42.” Unfindable, unforgettable. The vault remembers." },
                { id: "a3", label: "The same made-up word for every question", good: false, why: "One leak and every question falls together. Nonsense, but DIFFERENT nonsense." },
              ],
            },
            {
              id: "email",
              label: "SLOT 2: THE RECOVERY EMAIL",
              options: [
                { id: "e1", label: "The old address she can't log into anymore", good: false, why: "Dead addresses get claimed by collectors. A stale door is an open door." },
                { id: "e2", label: "Her current, 2FA-locked email", good: true, why: "Fresh, watched, and double-locked. Recovery flows through the strongest room." },
                { id: "e3", label: "Her best friend's email, she trusts her", good: false, why: "Trust isn't the issue. Her friend's login now guards Priya's account. Own doors only." },
              ],
            },
            {
              id: "phone",
              label: "SLOT 3: THE RECOVERY PHONE",
              options: [
                { id: "p1", label: "The old number from two SIM cards ago", good: false, why: "Old numbers get handed to strangers. That stranger can reset her account." },
                { id: "p2", label: "Her current number, checked yearly", good: true, why: "Current and re-checked. Old contacts go stale quietly. Put the check on a calendar." },
                { id: "p3", label: "Skip the phone entirely", good: false, why: "An empty slot means one lost email locks her out forever. Backups need backups." },
              ],
            },
          ],
          testLine: "STRESS TEST: CRUMB FILE vs SIDE DOOR … 0 QUESTIONS ANSWERED. DOOR HOLDS.",
          doneLine: "The crumbs are worthless now. PACKRAT's whole file just stopped opening doors.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Where do your made-up security answers live?",
            options: [
              "In your head, hopefully",
              "In the password manager's vault",
              "On a sticky note",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A recovery email you lost access to is:",
            options: [
              "Harmless leftover settings",
              "A stale door someone else can claim",
              "Automatically deleted",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: session hygiene */
    {
      id: "sessions",
      title: "The forgotten doors",
      concept: "Every logged-in device is an open door",
      promise: "You'll learn to close the doors you forgot were open.",
      instruction: "Pick the move that closes every door.",
      intel: {
        beats: [
          "One more kind of door: the session.",
          "Every device you've EVER logged in on holds one open.",
          "The library computer. Your cousin's tablet. The old phone in a drawer.",
          "Logged in means open. Still. Right now.",
          "Every account has a “logged-in devices” list.",
          "Analysts read that list like a door check at closing time.",
        ],
        prediction: {
          question: "You logged into a library computer last month. That session is:",
          options: [
            "Gone when you walked away",
            "Possibly still open for whoever sits down next",
            "Only readable by librarians",
          ],
          answer: 1,
          right: "Right. Walking away doesn't log you out. Only logging out does.",
          wrong: "Sessions outlive your visit. To the account, the next kid in that chair is YOU.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the move that closes every door.",
          situation:
            "The bell rings mid-homework. You're logged into email on a library computer. Everyone's packing up.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "walk",
              label: "Grab your bag and go, the computer sleeps anyway",
              outcome:
                "Sleep isn't logout. The next kid taps a key and IS you: inbox, resets, everything. Same rule as Heroes: lock it before you leave.",
            },
            {
              id: "logout",
              label: "Log out now, and tonight check the “logged-in devices” list at home",
              correct: true,
              outcome:
                "Both halves of the skill: close THIS door now. Then check the list for doors you forgot. Old sessions die tonight.",
            },
            {
              id: "close",
              label: "Just close the browser window, same thing but faster",
              outcome:
                "Closing a window hides the room. It doesn't lock it. Reopen the browser and the session's often still warm. Log OUT.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Closing the browser window on a shared computer:",
            options: [
              "Logs you out completely",
              "Often leaves the session alive underneath",
              "Deletes your account",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "The “logged-in devices” list is for:",
            options: [
              "Showing off how many devices you own",
              "Finding and closing doors you forgot were open",
              "Speeding up your Wi-Fi",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Side Door",
    phases: 3,
    phaseNames: ["The ignored door", "Slam the side door", "The device sweep"],
    component: Mission13Incident,
  },

  debrief: {
    report: [
      "One side-door break-in traced: question, crumb, answer, open door. Lock untouched.",
      "Recovery path hardened: nonsense answers in the vault, fresh contacts, no stale doors.",
      "Session sweep run: every forgotten login found and closed.",
    ],
    realWorldMove:
      "This week: open one account's security questions. Swap the true answers for made-up nonsense. Save that nonsense in your password manager. True is guessable. Nonsense is safe.",
    wrenLine: "Side door slammed, sessions swept. The building is finally all yours. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m13-transmission.mp3",
    briefing: "/audio/wren/m13-briefing.mp3",
    debrief: "/audio/wren/m13-debrief.mp3",
  },

  dossier: {
    mo: "Skips strong locks and rings the recovery bell. Security questions answered from public posts.",
    defeatedBy: "Made-up answers in the vault, fresh recovery contacts, and a clean device list.",
  },
};

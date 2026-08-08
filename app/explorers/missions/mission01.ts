/**
 * Mission 01 — "The 24-Hour Threat" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK. Concept: pressure + look-alike addresses are the
 * anatomy of a lure; slow readers beat fast clickers.
 *
 * Curriculum dedupe note: Heroes taught "fake messages exist, check
 * with a trusted adult." This mission teaches the MECHANISM — how the
 * lure works (urgency), how the costume works (domains), and how the
 * pattern repeats (M.O.) — with supported-autonomy escalation.
 */

import Mission01Incident from "../incidents/Mission01Incident";
import type { MissionManifest } from "../engine/types";

export const mission01: MissionManifest = {
  id: "explorers-m01",
  caseNumber: "CASE 001",
  title: "The 24-Hour Threat",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "Urgent fakes dressed as companies you trust.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "A fake email almost got Maya's account. Find out how it works.",
  scene: "/explorers/scenes/m01-cold-open.jpg",

  transmission: {
    headline: "SIGNAL DETECTED",
    lines: [
      "A message just hit Maya's inbox.",
      "It says her game account gets deleted in 24 hours.",
      "She almost clicked.",
      "Something about it reads wrong. Find out what.",
    ],
  },

  briefing: {
    summary:
      "One fake email. It wants a password before anyone slows down to read.",
    objectives: [
      "Spot the pressure trick",
      "Read the real address",
      "File the actor's M.O.",
    ],
    wrenLine: "Three skills, then the boss. Work clean.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: read the lure */
    {
      id: "lure",
      title: "Read the lure",
      concept: "Urgency is a tool aimed at you",
      promise: "You'll learn why scary deadlines are a trick.",
      instruction: "Tap the 3 clues that don't belong.",
      intel: {
        beats: [
          "Every PHANTOM HOOK trick starts the same way.",
          "Not with a fact. With a feeling.",
          "The feeling is hurry.",
          "A deadline flips your brain from thinking to reacting.",
          "Attackers know that.",
          "Pressure in a message isn't drama. It's a tool — aimed at you.",
        ],
        prediction: {
          question: "Why put a 24-hour deadline in a message?",
          options: [
            "Accounts really get deleted that fast",
            "To make you act before you think",
            "The attacker is in a hurry",
          ],
          answer: 1,
          right: "Right. The deadline is pressure, not information.",
          wrong: "No — the deadline targets your reflexes, not your calendar.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 clues that don't belong.",
          device: { app: "MAIL", owner: "MAYA'S PHONE" },
          header: [
            {
              label: "FROM:",
              seg: { id: "from", text: "GameHub Support <support@gamehub-rewards-center.com>", tellId: "sender" },
            },
            { label: "TO:", seg: { id: "to", text: "maya.k@homemail.com" } },
            {
              label: "SUBJ:",
              seg: { id: "subj", text: "URGENT: your account will be DELETED in 24 hours", tellId: "urgency" },
            },
          ],
          body: [
            [{ id: "greet", text: "Hi player," }],
            [
              { id: "p1", text: "We detected a problem with your GameHub account. " },
              { id: "p2", text: "To keep your skins and progress, you must verify your password now:" },
            ],
            [
              {
                id: "link",
                text: "[ VERIFY MY ACCOUNT → gamehub.support-verify.net ]",
                tellId: "link",
                mono: true,
              },
            ],
            [{ id: "sig", text: "— The GameHub Team" }],
          ],
          tells: [
            {
              id: "sender",
              label: "Sender address",
              why: "It ends in gamehub-rewards-center.com. The real domain is gamehub.com. Close isn't same.",
            },
            {
              id: "urgency",
              label: "Pressure line",
              why: "A countdown threat is a rush tactic. Real companies don't do countdowns.",
            },
            {
              id: "link",
              label: "Link target",
              why: "The button says GameHub. The link goes to support-verify.net. A costume.",
            },
          ],
          doneLine: "All three. Nicely done, Operative.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question:
              "A message says: “Photos deleted TONIGHT unless you log in now.” Your first move?",
            options: [
              "Log in fast, to be safe",
              "Slow down — pressure is a red flag",
              "Forward it to friends to vote",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question:
              "Your friend starts typing his password for a “24 hours” email. You say:",
            options: [
              "Type faster, beat the clock",
              "Stop — check in the official app",
              "Reply and ask if it's real",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* -------------------------------------- cycle 2: read the address */
    {
      id: "address",
      title: "Read the address",
      concept: "The domain is who you're really talking to",
      promise: "You'll learn who a web address really belongs to.",
      instruction: "Pick the safest move for Maya.",
      intel: {
        beats: [
          "Web addresses read right to left.",
          "The words just before the first slash — that's who you're visiting.",
          "Everything in front is decoration.",
          "So gamehub.support-verify.net isn't GameHub.",
          "It's support-verify.net, wearing a GameHub costume.",
        ],
        prediction: {
          question: "Which address really belongs to GameHub?",
          options: ["gamehub.support-verify.net", "gamehub.com/account", "secure-gamehub-login.net"],
          answer: 1,
          right: "Yes. gamehub.com is the destination. /account is just a room inside it.",
          wrong: "Costume. The real owner sits just before the first slash.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the safest move for Maya.",
          situation:
            "Maya's email is locked away. But she's worried: what if the problem is real?",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "click",
              label: "Click the link and check",
              outcome:
                "That's the hook. Everything she types goes straight to PHANTOM HOOK.",
            },
            {
              id: "reply",
              label: "Reply and ask if it's real",
              outcome:
                "The sender IS the attacker. A reply invites twice the bait tomorrow.",
            },
            {
              id: "official",
              label: "Check in the official app, then report",
              correct: true,
              outcome:
                "Clean. The real app is ground truth — and the report protects the next kid.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "You want to check your Roblox account. Safest route?",
            options: [
              "The link in the email",
              "Type roblox.com yourself",
              "A login page from an ad",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Which of these addresses is a costume?",
            options: ["photos.google.com", "google.photo-share-login.com", "google.com/photos"],
            answer: 1,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 3: know the actor */
    {
      id: "actor",
      title: "Know the actor",
      concept: "The costume changes; the moves don't",
      promise: "You'll learn how one pattern exposes every disguise.",
      instruction: "Pick this actor's 3 signature moves.",
      intel: {
        beats: [
          "Attackers repeat themselves.",
          "The costume changes. The moves don't.",
          "Spot the pattern once — you'll recognize every disguise.",
          "ARC files each actor's moves as an M.O.",
          "One closed case protects a thousand inboxes.",
        ],
        prediction: {
          question: "Next month PHANTOM HOOK targets a homework app. What stays the same?",
          options: ["The logo on the email", "The pressure and the costume link", "The color of the button"],
          answer: 1,
          right: "Exactly. The deadline and the fake address are the signature.",
          wrong: "Those are costume. The signature is the pressure and the lying address.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick this actor's 3 signature moves.",
          evidence: [
            "Invented a 24-hour deadline to rush the target",
            "Sent from gamehub-rewards-center.com dressed as GameHub",
            "Button claimed GameHub; link went to support-verify.net",
          ],
          behaviors: [
            { id: "deadline", label: "Invents a deadline to rush you", matches: true },
            { id: "costume", label: "Wears a trusted name over a stranger's address", matches: true },
            { id: "mislink", label: "Sends links that lie about their target", matches: true },
            { id: "guess", label: "Guesses passwords over and over", matches: false },
            { id: "voice", label: "Fakes a friend's voice on a call", matches: false },
            { id: "meet", label: "Asks to meet you in person", matches: false },
          ],
          picks: 3,
          doneLine: "That's the pattern. You'll see it again wearing a different logo.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question:
              "A text: “FINAL WARNING from your bank — verify at bank-safety-check.net in 2 hours.” Whose M.O.?",
            options: ["PHANTOM HOOK", "Someone guessing passwords", "A friend pranking you"],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "Why does ARC keep files on closed cases?",
            options: [
              "Trophies look good",
              "Patterns repeat — old tricks expose new ones",
              "To fill the archive",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Second Wave",
    phases: 3,
    phaseNames: ["Sort the flood", "Cut the hooks", "Send the report"],
    component: Mission01Incident,
  },

  debrief: {
    report: [
      "One lure dissected: deadline pressure, look-alike sender, costume link.",
      "Field call: official app for ground truth. Report filed. No link touched.",
      "Second wave triaged. Campaign contained and on the record.",
    ],
    realWorldMove:
      "This week: if a message rushes you, don't touch its links. Open the real app and check there. Still feels wrong? Report it and tell an adult you trust.",
    wrenLine: "Four lures, zero clicks in your lane. Read the report, sign out.",
  },

  voice: {
    transmission: "/audio/wren/m01-transmission.mp3",
    briefing: "/audio/wren/m01-briefing.mp3",
    debrief: "/audio/wren/m01-debrief.mp3",
  },

  dossier: {
    mo: "Fake “urgent” messages dressed as companies you trust. Wants the click before the think.",
    defeatedBy: "Anyone who slows down, reads the address, and checks the official app.",
    breadcrumb:
      "ROUTING NOTE: this campaign relayed through a node tagged ZERO. First time that tag has surfaced. Filed.",
  },
};

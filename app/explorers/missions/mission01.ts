/**
 * Mission 01 — "The 24-Hour Threat" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK. Concept: pressure + look-alike addresses are the
 * anatomy of a lure; slow readers beat fast clickers.
 *
 * Curriculum dedupe note: Heroes taught "fake messages exist, check
 * with a trusted adult." This mission teaches the MECHANISM — how the
 * lure works (urgency), how the costume works (domains), and how the
 * pattern repeats (M.O.) — with supported-autonomy escalation.
 *
 * VOICE PASS v1: kid-voice + humour; PHANTOM HOOK is a smug show-off who
 * brags that "everyone clicks". Teaching, ids, answers all unchanged.
 */

import Mission01Incident from "../incidents/Mission01Incident";
import type { MissionManifest } from "../engine/types";

export const mission01: MissionManifest = {
  id: "explorers-m01",
  caseNumber: "CASE 001",
  title: "Phishing",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "Urgent fakes dressed as companies you trust.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "A fake email nearly grabbed Maya's game account. Let's catch how it works, and the show-off who sent it.",
  scene: "/explorers/scenes/m01-cold-open.jpg",

  transmission: {
    headline: "SIGNAL DETECTED",
    lines: [
      "A message just pinged Maya's inbox.",
      "“Your account will be DELETED in 24 hours!” Scary. Bold. All caps.",
      "She nearly clicked. Almost everyone does. That's the whole point.",
      "But it's a fake, and the show-off who sent it got sloppy. Let's prove it.",
    ],
  },

  briefing: {
    summary:
      "One fake email, built to grab a password before anyone slows down to read it.",
    objectives: [
      "Spot the pressure trick",
      "Read the real address",
      "Log the villain's M.O.",
    ],
    wrenLine: "Three skills, then we corner the culprit. Eyes open.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: read the lure */
    {
      id: "lure",
      title: "Read the lure",
      concept: "Urgency is a trick aimed at you",
      promise: "You'll learn why scary countdowns are pure bluff.",
      instruction: "Tap the 3 clues that give the fake away.",
      intel: {
        beats: [
          "Every Phantom Hook scam opens the exact same way: a countdown.",
          "Not a fact. A feeling. And that feeling is HURRY.",
          "A ticking clock flips your brain from “think it through” to “panic and click.”",
          "That's the whole trick. No magic, just pressure.",
          "Phantom Hook is basically yelling “don't think, just click!”",
          "So we do the rudest thing you can do to a scammer. We slow right down.",
        ],
        prediction: {
          question: "Why slap a 24-hour deadline on a message?",
          options: [
            "Accounts really do vanish that fast",
            "To make you act before you think",
            "The scammer is just in a hurry",
          ],
          answer: 1,
          right: "Right. The countdown is pressure, not information.",
          wrong: "Nope. The clock is aimed at your reflexes, not your calendar.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 clues that give the fake away.",
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
            [{ id: "sig", text: "The GameHub Team" }],
          ],
          tells: [
            {
              id: "sender",
              label: "Sender address",
              why: "It ends in gamehub-rewards-center.com. The real one is just gamehub.com. Close is not the same.",
            },
            {
              id: "urgency",
              label: "Pressure line",
              why: "A countdown threat is pure rush tactic. Real companies never run an “or else” timer.",
            },
            {
              id: "link",
              label: "Link target",
              why: "The button brags “GameHub”. The link sneaks off to support-verify.net. Classic costume.",
            },
          ],
          doneLine: "All three, clean. Phantom Hook is not as slick as he thinks.",
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
              "Slow down. Pressure is a red flag",
              "Forward it to friends to vote",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question:
              "Your friend starts typing his password into a “24 hours!” email. You say:",
            options: [
              "Type faster, beat the clock",
              "Stop. Check in the official app",
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
      promise: "You'll learn who a web address actually belongs to.",
      instruction: "Pick the safest move for Maya.",
      intel: {
        beats: [
          "Web addresses read right to left. Weird, but true.",
          "The words just before the first slash? That's who you're really visiting.",
          "Everything in front of that is just decoration.",
          "So gamehub.support-verify.net is NOT GameHub.",
          "It's support-verify.net, wearing a GameHub costume. Phantom Hook loves a costume.",
        ],
        prediction: {
          question: "Which address really belongs to GameHub?",
          options: ["gamehub.support-verify.net", "gamehub.com/account", "secure-gamehub-login.net"],
          answer: 1,
          right: "Yes. gamehub.com is the real place. /account is just a room inside it.",
          wrong: "Costume. The real owner sits right before that first slash.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the safest move for Maya.",
          situation:
            "Maya's locked out and nervous: what if the problem is actually real?",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "click",
              label: "Click the link and check",
              outcome:
                "That's the hook. Everything she types drops straight into Phantom Hook's lap.",
            },
            {
              id: "reply",
              label: "Reply and ask if it's real",
              outcome:
                "The sender IS the scammer. Reply, and tomorrow he sends double the bait.",
            },
            {
              id: "official",
              label: "Check in the official app, then report",
              correct: true,
              outcome:
                "Clean. The real app is the truth, and the report protects the next kid in line.",
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
      promise: "You'll learn how one pattern unmasks every disguise.",
      instruction: "Tag this actor's 3 signature moves.",
      intel: {
        beats: [
          "Scammers are repeat offenders. They reuse their best tricks.",
          "The costume changes. The moves never do.",
          "Spot the pattern once, and you'll clock every disguise after.",
          "ARC files each villain's moves as an M.O.",
          "One closed case protects a thousand inboxes. Yours included.",
        ],
        prediction: {
          question: "Next month Phantom Hook targets a homework app. What stays the same?",
          options: ["The logo on the email", "The pressure and the costume link", "The color of the button"],
          answer: 1,
          right: "Exactly. The countdown and the fake address are his signature.",
          wrong: "Those are just costume. The signature is the pressure and the lying address.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Tag Phantom Hook's 3 signature moves.",
          evidence: [
            "Invented a 24-hour deadline to rush the target",
            "Sent from gamehub-rewards-center.com dressed as GameHub",
            "Button claimed GameHub; link went to support-verify.net",
          ],
          behaviors: [
            { id: "deadline", label: "Invents a deadline to rush you", matches: true },
            { id: "costume", label: "Wears a trusted name over a stranger's address", matches: true },
            { id: "mislink", label: "Sends links that lie about where they go", matches: true },
            { id: "guess", label: "Guesses passwords over and over", matches: false },
            { id: "voice", label: "Fakes a friend's voice on a call", matches: false },
            { id: "meet", label: "Asks to meet you in person", matches: false },
          ],
          picks: 3,
          doneLine: "That's his pattern. Next time he'll just be wearing a different logo.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question:
              "A text: “FINAL WARNING from your bank. Verify at bank-safety-check.net in 2 hours.” Whose M.O.?",
            options: ["PHANTOM HOOK", "Someone guessing passwords", "A friend pranking you"],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "Why does ARC keep files on closed cases?",
            options: [
              "Trophies look good",
              "Patterns repeat: old tricks expose new ones",
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
      "One lure taken apart: countdown pressure, look-alike sender, costume link.",
      "Right call made: open the real app, report it, touch zero links.",
      "Second wave sorted. Phantom Hook's campaign is contained and on the record.",
    ],
    realWorldMove:
      "This week: if a message rushes you, don't touch its links. Open the real app and check there yourself. Still feels off? Tell an adult you trust and report it.",
    wrenLine: "Four lures, zero clicks on your watch. Read the report, sign out.",
  },

  voice: {
    transmission: "/audio/wren/m01-transmission.mp3",
    briefing: "/audio/wren/m01-briefing.mp3",
    debrief: "/audio/wren/m01-debrief.mp3",
  },

  dossier: {
    mo: "Fake “urgent” messages dressed as apps you trust. Wants the click before you think.",
    defeatedBy: "Anyone who slows down, reads the address, and checks the official app. Ruins his whole night.",
    breadcrumb:
      "ROUTING NOTE: this campaign relayed through a node tagged ZERO. First time that tag has surfaced. Filed as breadcrumb ①.",
  },
};

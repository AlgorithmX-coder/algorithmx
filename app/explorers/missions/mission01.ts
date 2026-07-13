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

  transmission: {
    headline: "SIGNAL DETECTED",
    lines: [
      "Operative. A message just hit a student's inbox — it says her game account gets deleted in 24 hours. She almost clicked.",
      "Something about it reads wrong. Find out what.",
    ],
  },

  briefing: {
    summary:
      "One intercepted email. The sender wants a password before anyone slows down enough to read carefully. You read carefully.",
    objectives: [
      "Break down how the lure works",
      "Flag every detail that doesn't belong",
      "Profile the actor and contain the wave",
    ],
    wrenLine: "Three cycles, then it gets live. Work clean.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: read the lure */
    {
      id: "lure",
      title: "Read the lure",
      concept: "Urgency is a tool aimed at you",
      intel: {
        beats: [
          "Every trick PHANTOM HOOK runs starts the same way: with a feeling, not a fact. The feeling is hurry.",
          "A deadline flips your brain from thinking to reacting. Attackers know that. Pressure in a message isn't drama — it's a tool, aimed at you.",
        ],
        prediction: {
          question: "Why would an attacker put a 24-hour deadline in a message?",
          options: [
            "Accounts really do get deleted that fast",
            "To make you act before you think",
            "Because they're in a hurry themselves",
          ],
          answer: 1,
          right: "Right. The deadline isn't information — it's pressure. Real companies move slower than panic.",
          wrong: "Reasonable guess — but no. The deadline is aimed at your reflexes, not your calendar.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Evidence 01 — intercepted email · tap anything that doesn't belong",
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
              why: "The address ends in gamehub-rewards-center.com. The real company's domain is gamehub.com. Close is not the same.",
            },
            {
              id: "urgency",
              label: "Pressure line",
              why: "“24 hours or you lose everything” is a rush tactic. Real companies don't threaten a countdown.",
            },
            {
              id: "link",
              label: "Link target",
              why: "The button says GameHub, but the link goes to gamehub.support-verify.net — a different site wearing a costume.",
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
              "A message says: “Your photos will be deleted TONIGHT unless you log in right now.” Smartest first move?",
            options: [
              "Log in fast, just to be safe",
              "Slow down — pressure itself is a red flag",
              "Forward it to friends so they can vote",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question:
              "Your friend gets a “24 hours to save your account” email and starts typing his password. You say:",
            options: [
              "Type faster, the clock's running",
              "Stop — real companies don't rush you. Check in the official app instead",
              "Reply to the email and ask if it's real",
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
      intel: {
        beats: [
          "Web addresses read right to left. The words just before the first slash are who you're actually visiting. Everything in front of them is decoration.",
          "So gamehub.support-verify.net isn't GameHub. It's a site called support-verify.net — wearing a GameHub costume.",
        ],
        prediction: {
          question: "Which of these really belongs to GameHub?",
          options: ["gamehub.support-verify.net", "gamehub.com/account", "secure-gamehub-login.net"],
          answer: 1,
          right: "Yes. gamehub.com is the destination; /account is just a room inside it. The other two are costumes.",
          wrong: "Costume. Read right to left: the real owner is whatever sits just before the first slash.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Field decision — Maya is waiting on you",
          situation:
            "Maya's email is flagged and quarantined. She's worried the account problem might be real, and she's asking you what to do next.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "click",
              label: "Click the link — quickest way to see if the problem is real",
              outcome:
                "That's the hook. The page will look perfect, and everything she types goes straight to PHANTOM HOOK. This click is the entire point of the email.",
            },
            {
              id: "reply",
              label: "Reply and ask the sender if this is really GameHub",
              outcome:
                "The sender IS the attacker. A reply just confirms a real person reads this inbox — expect twice the bait tomorrow.",
            },
            {
              id: "official",
              label: "Don't touch the email. Check the account in the official app, then report the message",
              correct: true,
              outcome:
                "Clean. The official app is ground truth — if there's a real problem, it shows there. And the report protects the next kid on the list.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "You want to check whether your Roblox account really has a problem. Safest route?",
            options: [
              "The link in the email",
              "Type roblox.com yourself, or open the official app",
              "The first login page in a search ad",
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
      intel: {
        beats: [
          "Attackers repeat themselves. The costume changes — the moves don't. Spot the pattern once and you'll recognize it in every disguise.",
          "ARC files each actor's signature moves as an M.O. Filing it is how one closed case protects a thousand inboxes.",
        ],
        prediction: {
          question: "Next month PHANTOM HOOK targets a homework app instead of GameHub. What stays the same?",
          options: ["The logo on the email", "The pressure and the costume link", "The color of the button"],
          answer: 1,
          right: "Exactly. The lure changes costume; the deadline and the fake address are the signature.",
          wrong: "Those are the costume. The signature is what's underneath: the pressure, and the address that isn't what it claims.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Build the M.O. — separate this actor's moves from everyone else's",
          evidence: [
            "Invented a 24-hour deadline to rush the target",
            "Sent from gamehub-rewards-center.com dressed as GameHub",
            "Button claimed GameHub; link went to support-verify.net",
          ],
          behaviors: [
            { id: "deadline", label: "Invents a deadline to rush you", matches: true },
            { id: "costume", label: "Wears a trusted company's name over a stranger's address", matches: true },
            { id: "mislink", label: "Sends links that go somewhere other than they claim", matches: true },
            { id: "guess", label: "Guesses your password over and over", matches: false },
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
              "A text reads: “FINAL WARNING from your bank — verify at bank-safety-check.net within 2 hours.” Whose M.O.?",
            options: ["PHANTOM HOOK", "Someone guessing passwords", "A friend pranking you"],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "Why does ARC keep dossiers on closed cases?",
            options: [
              "Trophies look good on a wall",
              "Patterns repeat — yesterday's trick exposes tomorrow's",
              "To make the archive look full",
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
    component: Mission01Incident,
  },

  debrief: {
    report: [
      "One lure intercepted and dissected: deadline pressure, look-alike sender, costume link.",
      "Field call made correctly: official app for ground truth, report filed, no link touched.",
      "Second wave of four messages triaged; the campaign is contained and on the record.",
    ],
    realWorldMove:
      "This week, when any message rushes you — a deadline, a prize, a threat — don't touch its links. Open the real app yourself and check there. If it still feels wrong, report it in the app and loop in an adult you trust.",
    wrenLine: "Four lures, zero clicks in your lane. Read the report, sign out.",
  },

  dossier: {
    mo: "Sends fake “urgent” messages dressed up as companies you trust. Wants you to click before you think.",
    defeatedBy: "Anyone who slows down, reads the address, and checks in the official app instead.",
    breadcrumb:
      "ROUTING NOTE: this campaign relayed through a node tagged K-STATIC/COORD. First time that tag has surfaced. Filed.",
  },
};

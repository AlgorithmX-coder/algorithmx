/**
 * Mission 01 — "The 24-Hour Threat" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK. Concept: pressure + look-alike addresses are the
 * anatomy of a lure; slow readers beat fast clickers.
 *
 * GOLD STANDARD PASS (child-first): every on-screen line rewritten for a
 * 10-13 year old — short, concrete, warm, plain words, no adult wit. The
 * "your call" questions are voiced and interactive (WREN asks, waits, reacts)
 * and each has a hint. This mission is the template the other 19 copy.
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
    mo: "Fake 'urgent' messages that copy apps you trust.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "A fake email nearly tricked Maya out of her game account. Let's find out how it works, and catch the one who sent it.",
  scene: "/explorers/scenes/m01-cold-open.jpg",

  transmission: {
    headline: "SIGNAL DETECTED",
    lines: [
      "Maya just got a message. It says her game account will be deleted in 24 hours.",
      "It's got a scary countdown and big shouty capital letters.",
      "She almost tapped it. Most people would, and that's exactly what the hacker wants.",
      "But it's a fake. And the hacker who sent it made some mistakes. Let's go find them.",
    ],
  },

  briefing: {
    summary:
      "It's one fake email. Its whole job is to scare you into typing your password fast.",
    objectives: [
      "Spot the scare trick",
      "Find out who a link really goes to",
      "Learn the scammer's habits",
    ],
    wrenLine: "Three quick skills, then we catch him. Ready?",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: read the lure */
    {
      id: "lure",
      title: "Read the lure",
      concept: "A countdown is a trick to rush you",
      promise: "You'll learn why scary countdowns are just for show.",
      instruction: "Tap the 3 clues that show it's a fake.",
      intel: {
        beats: [
          "Every one of Phantom Hook's tricks starts the same way: with a countdown.",
          "But that countdown isn't real. It's only there to make you panic and rush.",
          "When you rush, you stop thinking and just tap. That's the whole trick. Nothing clever, just pressure.",
          "So here's how we beat him. We slow down and think first. That's it.",
        ],
        beatAudio: [
          "/audio/wren/m01-c1-b1.mp3",
          "/audio/wren/m01-c1-b2.mp3",
          "/audio/wren/m01-c1-b3.mp3",
          "/audio/wren/m01-c1-b4.mp3",
        ],
        prediction: {
          question: "Why does the message only give you 24 hours?",
          options: [
            "Accounts really do disappear that fast",
            "To make you act before you think",
            "The hacker is just in a hurry",
          ],
          answer: 1,
          right: "Exactly. The countdown is there to rush you, not to tell you the truth.",
          wrong: "Not quite. That clock isn't real, it's just there to make you panic. Have another think.",
          hint: "Ask yourself: does that countdown help YOU, or does it help the hacker who sent it?",
        },
        predictionAudio: {
          question: "/audio/wren/m01-c1-q.mp3",
          right: "/audio/wren/m01-c1-qr.mp3",
          wrong: "/audio/wren/m01-c1-qw.mp3",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Here's Maya's email. Three things give it away as a fake. Tap the three you can spot.",
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
              label: "Who it's from",
              why: "Look at the address. It's gamehub-rewards-center.com. The real one is just gamehub.com. Close, but not the same.",
            },
            {
              id: "urgency",
              label: "The countdown",
              why: "It threatens you with a timer. Real companies don't do that. It's only there to make you rush.",
            },
            {
              id: "link",
              label: "Where the link goes",
              why: "The button says GameHub, but the link actually goes to support-verify.net. It's only pretending to be GameHub.",
            },
          ],
          doneLine: "Nice, all three! Phantom Hook isn't as clever as he thinks.",
        },
      },
      playAudio: "/audio/wren/m01-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question:
              "A message says: 'Your photos get deleted TONIGHT unless you log in now.' What do you do first?",
            options: [
              "Log in fast, just in case",
              "Slow down. A countdown like that is a warning sign",
              "Send it to friends to see what they think",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question:
              "Your friend starts typing his password into a '24 hours!' email. What do you say?",
            options: [
              "Type faster, beat the clock",
              "Stop. Let's check in the real app instead",
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
      concept: "A link's real owner is right before the first slash",
      promise: "You'll learn how to tell who a link really goes to.",
      instruction: "Help Maya pick the safest move.",
      intel: {
        beats: [
          "Web addresses have a little secret. The important bit is right before the first single slash.",
          "That bit tells you who you're really visiting. Everything in front of it is just for show.",
          "So that link that looks like GameHub? It really goes to support-verify.net. That's a stranger pretending to be GameHub.",
          "Phantom Hook loves a good disguise. Let's learn to see straight through it.",
        ],
        beatAudio: [
          "/audio/wren/m01-c2-b1.mp3",
          "/audio/wren/m01-c2-b2.mp3",
          "/audio/wren/m01-c2-b3.mp3",
          "/audio/wren/m01-c2-b4.mp3",
        ],
        prediction: {
          question: "Which address really belongs to GameHub?",
          options: ["gamehub.support-verify.net", "gamehub.com/account", "secure-gamehub-login.net"],
          answer: 1,
          right: "Yes! gamehub.com is the real one. The /account part is just a page inside it.",
          wrong: "That one's a disguise. Look for the name right before the first slash, that's the real owner. Try again.",
          hint: "Find the first single slash. The word right before it is who you're really visiting.",
        },
        predictionAudio: {
          question: "/audio/wren/m01-c2-q.mp3",
          right: "/audio/wren/m01-c2-qr.mp3",
          wrong: "/audio/wren/m01-c2-qw.mp3",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Maya isn't sure what to do. Help her pick the safest move.",
          situation:
            "Maya's locked out and worried. What if the problem is actually real?",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "click",
              label: "Click the link and check",
              outcome:
                "That's the trap. Everything she types goes straight to Phantom Hook.",
            },
            {
              id: "reply",
              label: "Reply and ask if it's real",
              outcome:
                "But the hacker IS the scammer. Reply, and tomorrow he sends even more fakes.",
            },
            {
              id: "official",
              label: "Open the real app, check there, then report it",
              correct: true,
              outcome:
                "Perfect. The real app tells the truth, and reporting it helps the next person too.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m01-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "You want to check your Roblox account. What's the safest way in?",
            options: [
              "The link in the email",
              "Type roblox.com yourself",
              "A login page you saw in an ad",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Which one is a disguise, a fake pretending to be Google?",
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
      concept: "The disguise changes; the tricks stay the same",
      promise: "You'll learn to spot this scammer even in a new disguise.",
      instruction: "Tap the 3 tricks that are really his.",
      intel: {
        beats: [
          "Scammers do the same tricks over and over. They don't invent new ones.",
          "The disguise changes. The tricks stay exactly the same.",
          "Learn his tricks once, and you'll spot him every time, no matter what he's dressed as.",
          "That's why ARC keeps a file on every villain. Catch one scam, and you protect loads of people, including you.",
        ],
        beatAudio: [
          "/audio/wren/m01-c3-b1.mp3",
          "/audio/wren/m01-c3-b2.mp3",
          "/audio/wren/m01-c3-b3.mp3",
          "/audio/wren/m01-c3-b4.mp3",
        ],
        prediction: {
          question: "Next month Phantom Hook goes after a homework app. What will be the same?",
          options: ["The logo on the email", "The countdown and the fake link", "The colour of the button"],
          answer: 1,
          right: "Exactly. The scary countdown and the fake link are his signature. Those never change.",
          wrong: "Those are just the disguise. His real signature is the countdown and the fake link. Try again.",
          hint: "The disguise (logo, colours) changes every time. Which TRICKS did he use in both scams?",
        },
        predictionAudio: {
          question: "/audio/wren/m01-c3-q.mp3",
          right: "/audio/wren/m01-c3-qr.mp3",
          wrong: "/audio/wren/m01-c3-qw.mp3",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Now build his file. Tap the 3 tricks that are really his.",
          evidence: [
            "Made up a 24-hour countdown to rush Maya",
            "Sent it from gamehub-rewards-center.com, pretending to be GameHub",
            "The button said GameHub, but the link went to support-verify.net",
          ],
          behaviors: [
            { id: "deadline", label: "Makes up a countdown to rush you", matches: true },
            { id: "costume", label: "Uses a trusted name over a stranger's address", matches: true },
            { id: "mislink", label: "Sends links that lie about where they go", matches: true },
            { id: "guess", label: "Tries to guess your password over and over", matches: false },
            { id: "voice", label: "Fakes a friend's voice on a phone call", matches: false },
            { id: "meet", label: "Asks to meet you in person", matches: false },
          ],
          picks: 3,
          doneLine: "That's his pattern. Next time, he'll just be wearing a different disguise.",
        },
      },
      playAudio: "/audio/wren/m01-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question:
              "A text says: 'FINAL WARNING from your bank. Log in at bank-safety-check.net in 2 hours.' Who does this sound like?",
            options: ["PHANTOM HOOK", "Someone guessing passwords", "A friend playing a prank"],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "Why does ARC keep files on old cases?",
            options: [
              "Trophies look cool",
              "The same tricks come back, so old cases help spot new ones",
              "Just to fill up the archive",
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

  catchThem: {
    intro:
      "Right, Agent. From here, I go quiet. Five fresh tricks are coming, some you've never seen. Read each one and make the call yourself. Catch four to close the case.",
    pass: 4,
    voice: {
      intro: "/audio/wren/m01-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    reteach: [
      "He caught you with the panic trick. Remember, a countdown is there to rush you, not to help you. Watch again.",
      "He got you with the fake links. The trick's always the same: read the name right before the first slash. Here.",
      "He switched costumes and fooled you. But his tricks never change. Let's run them one more time.",
    ],
    scenarios: [
      {
        id: "ct1",
        skill: 0,
        prompt: "A pop-up flashes: “WARNING! Your account will be DELETED in 15 minutes. Act NOW!” What's the real giveaway that it's a scam?",
        options: [
          "It mentions your account",
          "The countdown rushing you to act fast",
          "It uses capital letters",
        ],
        answer: 1,
        right: "Yes. That ticking clock is the whole trick. A real warning never hands you 15 minutes to panic.",
        wrong: "Look at what it's doing to you. The countdown is there to make you panic and tap before you think.",
      },
      {
        id: "ct2",
        skill: 1,
        prompt: "You get a link to “fix” your Roblox account. Which web address is the REAL Roblox?",
        evidence: "roblox.com/login    ·    roblox-support.net    ·    login-roblox-help.com",
        options: [
          "roblox.com/login",
          "roblox-support.net",
          "login-roblox-help.com",
        ],
        answer: 0,
        right: "Correct. The real name sits right before the first slash: roblox.com. The other two just borrow the word.",
        wrong: "Read the part right before the first slash. Only roblox.com is really Roblox. The others are strangers wearing the name.",
      },
      {
        id: "ct3",
        skill: 0,
        prompt: "A DM lands: “You won a £50 gift card! Claim it here before it expires.” You never entered anything. What's the smart move?",
        options: [
          "Claim it fast before it expires",
          "Ignore it, you can't win what you never entered",
          "Reply to ask if it's real",
        ],
        answer: 1,
        right: "Exactly. No entry, no prize. And replying only tells them you're a real person. Just delete it.",
        wrong: "You never entered a giveaway, so there's no prize. Replying just proves you're real. The safe move is ignore and delete.",
      },
      {
        id: "ct4",
        skill: 1,
        prompt: "Which of these is the FAKE, a stranger pretending to be Google?",
        evidence: "mail.google.com    ·    google-mail-login.com    ·    drive.google.com",
        options: [
          "mail.google.com",
          "google-mail-login.com",
          "drive.google.com",
        ],
        answer: 1,
        right: "Sharp. mail.google.com and drive.google.com are real parts of google.com. google-mail-login.com just stuffs the word in with dashes.",
        wrong: "The fake is google-mail-login.com. The real ones end in .google.com. Extra words bolted on with dashes are a costume.",
      },
      {
        id: "ct5",
        skill: 2,
        prompt: "Next week the same scammer goes after a homework app instead of a game. What will probably STAY the same?",
        options: [
          "The brand name in the message",
          "The scary countdown and the fake link",
          "The time of day it's sent",
        ],
        answer: 1,
        right: "Exactly. The costume changes, the tricks don't. The countdown and the fake link are his signature.",
        wrong: "The disguise changes every time, the brand, the wording. What stays the same is his method: the countdown and the fake link.",
      },
    ],
  },

  debrief: {
    report: [
      "You took the fake email apart: the scary countdown, the sneaky hacker, and the fake link.",
      "You made the right call: open the real app, report it, and don't tap any links.",
      "The second wave is sorted. Phantom Hook's plan is stopped and on the record.",
    ],
    realWorldMove:
      "This week: if a message tries to rush you, don't tap its links. Open the real app yourself and check there. Still feels wrong? Tell an adult you trust, and report it.",
    wrenLine: "Four fakes, and you didn't fall for a single one. Nice work, Agent.",
  },

  voice: {
    transmission: "/audio/wren/m01-transmission.mp3",
    briefing: "/audio/wren/m01-briefing.mp3",
    debrief: "/audio/wren/m01-debrief.mp3",
  },

  dossier: {
    mo: "Sends fake 'urgent' messages that copy apps you trust. Wants you to tap before you think.",
    defeatedBy: "Anyone who slows down, checks the real address, and opens the official app instead.",
    breadcrumb:
      "ROUTING NOTE: this scam was passed through something tagged ZERO. First time we've seen that name. Filed as clue ①.",
  },
};

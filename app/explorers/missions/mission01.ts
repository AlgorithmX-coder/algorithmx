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
    wrenLine: "Three quick skills, then a test to close the case. Every answer is hidden in the lessons, so pay close attention. Ready?",
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
            question: "How does nearly every one of Phantom Hook's tricks start?",
            options: ["With a countdown", "With a friendly hello", "With a spelling mistake", "With your real name"],
            answer: 0,
          },
          {
            id: "c1q2",
            question: "The lesson said the countdown isn't real. So what is it only there to do?",
            options: ["Make you panic and rush", "Tell you the real deadline", "Count how many people saw it", "Keep your account safe"],
            answer: 0,
          },
          {
            id: "c1q3",
            question: "So what should you do the moment you see a countdown?",
            options: ["Slow down and think first", "Tap it before time runs out", "Forward it to a friend", "Turn your phone off"],
            answer: 0,
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
            question: "Which part of a web address tells you who it REALLY goes to?",
            options: ["The part right before the first slash", "The very last word", "The first word after www", "The longest word"],
            answer: 0,
          },
          {
            id: "c2q2",
            question: "Everything in FRONT of that important part is...?",
            options: ["Just for show", "The bit that really matters", "Who really owns the site", "A secret safety code"],
            answer: 0,
          },
          {
            id: "c2q3",
            question: "In the lesson, the link looked like GameHub. Where did it REALLY go?",
            options: ["support-verify.net, a stranger's site", "gamehub.com, the real one", "straight to your account", "nowhere at all"],
            answer: 0,
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
            question: "Do scammers invent brand-new tricks each time?",
            options: ["No, they reuse the same tricks over and over", "Yes, always brand-new ones", "Only on weekends", "Only when going after banks"],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "The disguise changes every time. What stays exactly the same?",
            options: ["His tricks", "The brand he copies", "The time of day he strikes", "The name he uses"],
            answer: 0,
          },
          {
            id: "c3q3",
            question: "Why is it worth learning his tricks just once?",
            options: ["You'll spot him every time, in any disguise", "He'll leave you alone after that", "You win a prize for it", "It makes him stop scamming forever"],
            answer: 0,
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
      "Okay Agent, this is the test. Five questions, and every answer is somewhere in the three lessons you just did. I won't tell you how you're doing until the end. Get four right to close the case. Miss it, and you sit the whole case again.",
    pass: 4,
    voice: {
      intro: "/audio/wren/m01-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 4 recall questions + 1 "use it". Every answer is stated in this case's
    // lessons, line by line:
    //  ct1 <- skill 1 beat "Every one of his tricks starts the same way: with a countdown."
    //  ct2 <- skill 1 beat "It's only there to make you panic and rush."
    //  ct3 <- skill 2 beat "The important bit is right before the first single slash."
    //  ct4 <- skill 3 beat "The disguise changes. But the tricks stay exactly the same."
    //  ct5 <- USE IT: apply the skill 2 rule to a fresh link.
    scenarios: [
      {
        id: "ct1",
        skill: 0,
        prompt: "In the lesson, how does nearly every one of Phantom Hook's tricks start?",
        options: [
          "With a countdown",
          "With a friendly hello",
          "With your real name",
          "With a spelling mistake",
        ],
        answer: 0,
      },
      {
        id: "ct2",
        skill: 0,
        prompt: "The lesson said the countdown isn't real. So what is it only there to do?",
        options: [
          "Make you panic and rush",
          "Tell you the real deadline",
          "Count how many people saw it",
          "Keep your account safe",
        ],
        answer: 0,
      },
      {
        id: "ct3",
        skill: 1,
        prompt: "To find out who a link REALLY goes to, which part of the web address do you read?",
        options: [
          "The part right before the first slash",
          "The very last word of the address",
          "The first word after www",
          "The longest word in it",
        ],
        answer: 0,
      },
      {
        id: "ct4",
        skill: 2,
        prompt: "The lesson said a scammer's disguise changes every time. What stays exactly the same?",
        options: [
          "His tricks, like the countdown and the fake link",
          "The name of the game or app",
          "The day of the week he strikes",
          "The colour of the message",
        ],
        answer: 0,
      },
      {
        id: "ct5",
        skill: 1,
        prompt: "Now use it. Read the name right before the first slash. Who does this link really belong to?",
        evidence: "gamehub-rewards.net/claim",
        options: [
          "A stranger's site, not GameHub",
          "GameHub, because it says gamehub",
          "You can't tell from the address",
          "The GameHub rewards team",
        ],
        answer: 0,
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

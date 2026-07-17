/**
 * Mission 07 — "Borrowed Faces" (Block 2: The Human Factor, SECRET).
 * Actor: MIMIC ①. Map slot: curriculum-map-v1 §M07.
 *
 * Teaching register (ages 10–13): the hijacked friend. Heroes taught
 * fake PROFILES; this teaches compromised REAL ones — the account is
 * genuine, the hands aren't. Trust doesn't transfer with a login.
 * Home of the tier's most-used protocol: out-of-band verification.
 */

import Mission07Incident from "../incidents/Mission07Incident";
import type { MissionManifest } from "../engine/types";

export const mission07: MissionManifest = {
  id: "explorers-m07",
  caseNumber: "CASE 007",
  title: "Borrowed Faces",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Steals real accounts and wears them.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "Your best friend's account just asked for something weird. Is it still your friend?",
  scene: "/explorers/scenes/m07-cold-open.jpg",

  transmission: {
    headline: "TWO SIGNALS, ONE NAME",
    lines: [
      "Leo's account just messaged you.",
      "Same name. Same photo. Same typing style.",
      "But something about the ask reads wrong.",
      "Reading won't settle this. Protocol will.",
    ],
  },

  briefing: {
    summary:
      "MIMIC doesn't fake accounts. He takes real ones. Trust the protocol, not the face.",
    objectives: [
      "See how hijacks work",
      "Learn the out-of-band check",
      "Install the weird-ask alarm",
    ],
    wrenLine: "Faces lie, Operative. Channels don't.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the hijacked friend */
    {
      id: "hijack",
      title: "The borrowed face",
      concept: "Real account, wrong hands",
      promise: "You'll learn why a real account can still lie.",
      instruction: "Tap the 3 signs the hands aren't Leo's.",
      intel: {
        beats: [
          "This isn't a fake profile. Those are easy.",
          "This is Leo's REAL account.",
          "Real photo, real history, real friends list.",
          "Accounts get stolen. Trust doesn't transfer with them.",
          "The face is your friend's.",
          "The hands on the keyboard might not be.",
        ],
        prediction: {
          question: "The message truly comes from Leo's account. What does that prove?",
          options: [
            "It's definitely Leo",
            "Only that the ACCOUNT is Leo's — not the hands",
            "Accounts can't be stolen",
          ],
          answer: 1,
          right: "Exactly. The account is real. The question is who's holding it.",
          wrong: "Accounts get stolen every day. The account is real — the hands are the question.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 signs the hands aren't Leo's.",
          device: { app: "CHAT", owner: "LEO ⚡ · friends since Year 3" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "Leo — real account, verified history" } },
          ],
          body: [
            [{ id: "m1", text: "yooo EMERGENCY are you there?? answer quick", tellId: "urgency" }],
            [{ id: "m2", text: "I need a favor and you CAN'T tell anyone, promise me", tellId: "secrecy" }],
            [{ id: "m3", text: "a code is coming to your phone — just send it to me fast", tellId: "code" }],
            [{ id: "m4", text: "it's for a surprise, you'll see 😄" }],
          ],
          tells: [
            {
              id: "urgency",
              label: "The panic open",
              why: "Leo never opens with panic. Sudden urgency is a borrowed voice.",
            },
            {
              id: "secrecy",
              label: "The secrecy demand",
              why: "“Tell no one” removes your backup — the people who'd catch this.",
            },
            {
              id: "code",
              label: "The code ask",
              why: "Codes are keys. Real friends never ask for keys.",
            },
          ],
          doneLine: "Right face, wrong hands. Three tells say Leo isn't home.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A stolen account still shows real photos and history. Why?",
            options: [
              "The thief made copies",
              "It IS the real account — that's what stolen means",
              "Photos can't be real online",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Which line should stop you INSTANTLY?",
            options: [
              "“did you watch the match”",
              "“send me the code fast”",
              "“lol what”",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: out-of-band */
    {
      id: "protocol",
      title: "Switch the channel",
      concept: "Verify on a channel the thief doesn't hold",
      promise: "You'll learn the check that beats every borrowed face.",
      instruction: "Pick the move that settles it for sure.",
      intel: {
        beats: [
          "Here's the protocol. It never fails.",
          "A thief steals ONE channel — the chat.",
          "So step OUT of it.",
          "Call the real number. Find them at school. Knock on the door.",
          "ARC calls it out-of-band: a channel the thief doesn't hold.",
          "The costume only covers one channel. Always.",
        ],
        prediction: {
          question: "Why not just ask in the chat: “is this really you?”",
          options: [
            "It's rude to ask",
            "The thief is holding that chat — they'll just say yes",
            "Chats delete questions",
          ],
          answer: 1,
          right: "Right. You'd be asking the thief to grade their own costume.",
          wrong: "Whoever holds the chat answers the chat. Ask where the thief ISN'T.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the move that settles it for sure.",
          situation:
            "“Leo” is pushing harder — the code expires in two minutes. Right then your phone buzzes: a login code has arrived.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "send",
              label: "Send the code — it's Leo, and he's in trouble",
              outcome:
                "That code unlocks YOUR account. Send it and the thief walks in as you — two accounts stolen with one favor.",
            },
            {
              id: "ask",
              label: "Ask in the chat: “prove it's really you”",
              outcome:
                "The thief has Leo's whole chat history to mine for answers. You're quizzing someone holding the answer sheet.",
            },
            {
              id: "call",
              label: "Step out of the chat — call Leo's actual number",
              correct: true,
              outcome:
                "Out-of-band. Real Leo picks up at school, confused — he never messaged you. Hijack confirmed in ten seconds, and your code stays yours.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Out-of-band verification means:",
            options: [
              "Asking politely in the same chat",
              "Checking on a channel the thief doesn't hold",
              "Waiting a day to reply",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A login code arrives that you never requested. It means:",
            options: [
              "A free bonus code",
              "Someone is trying to enter YOUR account right now",
              "The app is broken",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the weird-ask alarm */
    {
      id: "weirdask",
      title: "The weird-ask alarm",
      concept: "Codes, cash, secrecy — never friend asks",
      promise: "You'll learn the 3 asks real friends never make.",
      instruction: "Pick the 3 asks that trip the alarm.",
      intel: {
        beats: [
          "One alarm covers every borrowed face.",
          "Real friends ask for memes. Homework. Backup in a game.",
          "Thieves ask for three things.",
          "Codes. Money. Secrecy.",
          "Any one of those, from ANY account — alarm.",
          "Even if the face is your best friend's. Especially then.",
        ],
        prediction: {
          question: "Why do thieves always add “don't tell anyone”?",
          options: [
            "They're shy",
            "Secrecy switches off the people who'd catch them",
            "It makes the favor feel special",
          ],
          answer: 1,
          right: "Exactly. Your friends and adults are the alarm system. Secrecy unplugs it.",
          wrong: "Secrecy isn't about the surprise. It unplugs everyone who'd spot the con.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 asks that trip the alarm.",
          evidence: [
            "“just send me the code quick” — hijacked account, last Tuesday",
            "“can you send £20, I'll explain later” — hijacked account, last month",
            "“you can't tell ANYONE about this” — every hijack, always",
          ],
          behaviors: [
            { id: "codes", label: "Asks for login or verification codes", matches: true },
            { id: "money", label: "Asks for money with a rushed story", matches: true },
            { id: "secrecy", label: "Demands total secrecy", matches: true },
            { id: "memes", label: "Sends too many memes", matches: false },
            { id: "homework", label: "Asks for homework help", matches: false },
            { id: "game", label: "Invites you to a new game", matches: false },
          ],
          picks: 3,
          doneLine: "Codes, cash, secrecy. The weird-ask alarm is installed for life.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "“Don't tell anyone” inside a favor message is:",
            options: [
              "Normal between friends",
              "The thief unplugging your safety net",
              "Just being dramatic",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A friend suddenly asks for money. First move?",
            options: [
              "Send a small amount to be kind",
              "Verify on another channel first",
              "Block them forever, no questions",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Two Best Friends",
    phases: 3,
    phaseNames: ["Read the twins", "Run the protocol", "The rescue"],
    component: Mission07Incident,
  },

  debrief: {
    report: [
      "One hijack read correctly: real account, borrowed hands, three tells.",
      "The out-of-band protocol run — ten seconds, hijack confirmed, code kept.",
      "Leo's account recovered and the warning sent clean: no link, no shame.",
    ],
    realWorldMove:
      "This week: agree a check-question with your best friend — one only you two know. If either account ever acts weird, switch channels and ask it.",
    wrenLine: "Right face found. Protocol beats instinct — filed. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m07-transmission.mp3",
    briefing: "/audio/wren/m07-briefing.mp3",
    debrief: "/audio/wren/m07-debrief.mp3",
  },

  dossier: {
    mo: "Steals real accounts and wears them. The face is real; the hands aren't.",
    defeatedBy: "Anyone who checks on a second channel. The costume only covers one.",
  },
};

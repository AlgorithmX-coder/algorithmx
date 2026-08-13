/**
 * Mission 07 — "Borrowed Faces" (Block 2: The Human Factor, SECRET).
 * Actor: MIMIC ①. Map slot: curriculum-map-v1 §M07.
 *
 * Teaching register (ages 10–13): the hijacked friend. Heroes taught
 * fake PROFILES; this teaches compromised REAL ones — the account is
 * genuine, the hands aren't. Trust doesn't transfer with a login.
 * Home of the tier's most-used protocol: out-of-band verification.
 *
 * VOICE PASS v1: WREN wry-mentor voice; MIMIC is a vain, faceless
 * copycat who wears other people's accounts. Teaching, ids, answers
 * all unchanged.
 */

import Mission07Incident from "../incidents/Mission07Incident";
import type { MissionManifest } from "../engine/types";

export const mission07: MissionManifest = {
  id: "explorers-m07",
  caseNumber: "CASE 007",
  title: "Account Takeover",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Steals real accounts and wears them like costumes. No face of his own, so he borrows yours.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "Your best friend's account just messaged you something weird. Same name, same face. So is it still your friend behind it?",
  scene: "/explorers/scenes/m07-cold-open.jpg",

  transmission: {
    headline: "TWO SIGNALS, ONE NAME",
    lines: [
      "Leo's account just messaged you. It really is his account, that part checks out.",
      "Same name, same photo, same little typing quirks. A flawless impression.",
      "That's MIMIC's whole act: he wears someone you trust and hopes you never look past the costume.",
      "So we won't read the message harder. We'll check the source. Protocol beats a hunch.",
    ],
  },

  briefing: {
    summary:
      "MIMIC doesn't build fake accounts. He steals real ones and wears them. So we trust the protocol, never the face.",
    objectives: [
      "See how a hijack really works",
      "Learn the switch-channel check",
      "Install the weird-ask alarm",
    ],
    wrenLine: "Faces lie, Agent. Channels don't.",
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
          "This isn't some clumsy fake profile. MIMIC is fancier than that.",
          "This is Leo's REAL account. The genuine article.",
          "Real photo, real history, real friends list, all of it true.",
          "MIMIC didn't copy the account. He walked in and put it on.",
          "The face is your friend's. No argument there.",
          "The hands on the keyboard? Those might belong to a copycat.",
        ],
        prediction: {
          question: "The message really does come from Leo's account. What does that actually prove?",
          options: [
            "It's a hundred percent Leo",
            "Only that the ACCOUNT is Leo's, not the hands typing",
            "Accounts can't be stolen, so it's fine",
          ],
          answer: 1,
          right: "Exactly. The account is real. The only question left is who's holding it.",
          wrong: "Accounts get borrowed every day. Real account, sure. The hands are the whole question.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 signs the hands aren't really Leo's.",
          device: { app: "CHAT", owner: "LEO ⚡ · friends since Year 3" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "Leo: real account, real history" } },
          ],
          body: [
            [{ id: "m1", text: "yooo EMERGENCY are you there?? answer quick", tellId: "urgency" }],
            [{ id: "m2", text: "I need a favor and you CAN'T tell anyone, promise me", tellId: "secrecy" }],
            [{ id: "m3", text: "a code is coming to your phone, just send it to me fast", tellId: "code" }],
            [{ id: "m4", text: "it's for a surprise, you'll see 😄" }],
          ],
          tells: [
            {
              id: "urgency",
              label: "The panic open",
              why: "Leo never opens with a panic alarm. A sudden rush is the costume talking, not him.",
            },
            {
              id: "secrecy",
              label: "The keep-it-secret push",
              why: "“Tell no one” quietly unplugs every person who'd catch this.",
            },
            {
              id: "code",
              label: "The code ask",
              why: "Codes are keys to your account. Real friends never ask you to hand over a key.",
            },
          ],
          doneLine: "Right face, wrong hands. Three signs say Leo isn't home.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A hijacked account still shows all the real photos and history. Why?",
            options: [
              "The copycat made copies of everything",
              "It IS the real account, that's what hijacked means",
              "Photos are never real online",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Which line should freeze you on the spot?",
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
      concept: "Check on a channel the thief doesn't hold",
      promise: "You'll learn the check that beats every borrowed face.",
      instruction: "Pick the move that settles it for sure.",
      intel: {
        beats: [
          "Here's the protocol. Boring name, unbeatable move.",
          "MIMIC only ever grabs ONE channel: this chat.",
          "So we step clean OUT of it.",
          "Call the real number. Catch them at school. Knock on the actual door.",
          "ARC calls it out-of-band: a channel the copycat was never handed.",
          "The costume only ever covers one channel. Every single time.",
        ],
        prediction: {
          question: "Why not just ask right there in the chat: “is this really you?”",
          options: [
            "Asking would be rude",
            "MIMIC is holding that chat, so of course he'll say yes",
            "Chats delete your questions",
          ],
          answer: 1,
          right: "Right. That's asking the copycat to grade his own costume. He'll give it top marks.",
          wrong: "Whoever holds the chat answers the chat. Ask somewhere MIMIC isn't standing.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the move that settles it for sure.",
          situation:
            "“Leo” is pushing harder now. The code expires in two minutes, he says. Then your phone buzzes: a login code just landed.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "send",
              label: "Send the code, it's Leo and he's in trouble",
              outcome:
                "That code is the key to YOUR account. Send it, and MIMIC strolls in wearing you next. Two accounts stolen with one little favor.",
            },
            {
              id: "ask",
              label: "Ask in the chat: “prove it's really you”",
              outcome:
                "MIMIC has Leo's whole chat history to crib from. You'd be quizzing a copycat who's holding the answer sheet.",
            },
            {
              id: "call",
              label: "Step out of the chat: call Leo's real number",
              correct: true,
              outcome:
                "Out-of-band, textbook. Real Leo picks up at school, totally confused. He never messaged you. Hijack confirmed in ten seconds, and your code stays yours.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "The out-of-band check means:",
            options: [
              "Asking nicely in the very same chat",
              "Checking on a channel the copycat doesn't hold",
              "Waiting a day before you reply",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A login code shows up that you never asked for. That means:",
            options: [
              "A free bonus code, nice",
              "Someone is trying to get into YOUR account right now",
              "The app glitched",
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
      concept: "Codes, cash, secrecy: never what friends ask",
      promise: "You'll learn the 3 asks real friends never make.",
      instruction: "Pick the 3 asks that trip the alarm.",
      intel: {
        beats: [
          "One alarm covers every borrowed face MIMIC will ever wear.",
          "Real friends ask for memes. Homework. Backup in a boss fight.",
          "Copycats ask for three things, always the same three.",
          "Codes. Money. Secrecy.",
          "Any one of those, from ANY account: alarm goes off.",
          "Even when the face is your best friend's. Especially then.",
        ],
        prediction: {
          question: "Why do copycats always slip in “don't tell anyone”?",
          options: [
            "They're a bit shy",
            "Secrecy switches off the people who'd catch them",
            "It makes the favor feel special",
          ],
          answer: 1,
          right: "Exactly. Your friends and trusted adults ARE the alarm system. Secrecy quietly unplugs it.",
          wrong: "This was never about a surprise. Secrecy unplugs everyone who'd spot the con.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 asks that trip the alarm.",
          evidence: [
            "“just send me the code quick” (hijacked account, last Tuesday)",
            "“can you send £20, I'll explain later” (hijacked account, last month)",
            "“you can't tell ANYONE about this” (every hijack, always)",
          ],
          behaviors: [
            { id: "codes", label: "Asks for codes sent to your phone", matches: true },
            { id: "money", label: "Asks for money with a rushed story", matches: true },
            { id: "secrecy", label: "Says you can't tell anyone", matches: true },
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
            question: "“Don't tell anyone” tucked inside a favor message is:",
            options: [
              "Totally normal between friends",
              "The copycat unplugging your safety net",
              "Just someone being dramatic",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A friend suddenly asks you for money. First move?",
            options: [
              "Send a little, just to be kind",
              "Check on another channel first",
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
      "Protocol run in ten seconds flat: hijack confirmed, code kept.",
      "Leo's account recovered, warning sent clean. No link clicked, no shame.",
    ],
    realWorldMove:
      "This week: agree a secret check-question with your best friend, something only the two of you know. If either account ever acts strange, switch channels and ask it.",
    wrenLine: "Right face, wrong hands, case closed. Protocol beats a hunch every time. Filed. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m07-transmission.mp3",
    briefing: "/audio/wren/m07-briefing.mp3",
    debrief: "/audio/wren/m07-debrief.mp3",
  },

  dossier: {
    mo: "Steals real accounts and wears them like costumes. The face is genuine; the hands are the copycat's. No face of his own, so he borrows someone you trust.",
    defeatedBy: "Anyone who checks on a second channel, one MIMIC doesn't hold. The costume only ever covers one.",
  },
};

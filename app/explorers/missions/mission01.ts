/**
 * Mission 01 — "Phishing" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK.
 *
 * DEPTH PASS (owner: "too easy, feels like a recap"): the three lessons now
 * teach the REASONING, not just facts — the feelings a scammer fakes, how to
 * properly take a web address apart (incl. the subdomain trap), and the
 * three-part anatomy behind every disguise. The skill checks and the final
 * test are think-for-yourself: fresh messages the child must work out, not
 * "what did WREN say". Everything needed is still taught in-lesson.
 * This is the template the other 19 copy.
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
      "It's one fake email. Its whole job is to scare you into typing your password fast. Learn how it's built, and you'll spot every one like it.",
    objectives: [
      "Spot the feelings a scammer fakes",
      "Take apart a link and find its real owner",
      "Learn the pattern behind every disguise",
    ],
    wrenLine: "Three skills, then a test to close the case. This test makes you THINK, it won't just ask what I said. So learn it properly. Ready?",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: spot the pressure */
    {
      id: "lure",
      title: "Spot the pressure",
      concept: "Scammers fake a strong feeling to rush you past thinking",
      promise: "You'll learn the feelings a scammer fakes, and how to catch it.",
      instruction: "Read this NEW message. Select every part that's trying to pressure you, then submit.",
      intel: {
        beats: [
          "A scammer can't reach through the screen and make you do anything. So they do the next best thing. They make you FEEL something strong, fast.",
          "There are three feelings they fake again and again. Fear: your account's in danger. Greed: you've won something. And rush: act NOW, or lose it.",
          "Here's the tell most people miss. A real message gives you time. A scam slams a clock on you, so you move before your brain catches up.",
          "So no real company will ever say your account gets deleted in an hour. That countdown isn't a warning. It's the bait.",
          "Which means the feeling itself is your clue. The moment a message makes you panic or rush, that's the signal to STOP, not to tap.",
        ],
        beatAudio: [
          "/audio/wren/m01-c1-b1.mp3",
          "/audio/wren/m01-c1-b2.mp3",
          "/audio/wren/m01-c1-b3.mp3",
          "/audio/wren/m01-c1-b4.mp3",
          "/audio/wren/m01-c1-b5.mp3",
        ],
        // Delivery: teach ON the real message (not chat bubbles). The child taps
        // the parts that pressure them and uncovers the feeling each one fakes.
        artifact: {
          intro: "This is the message that nearly caught Maya. Let me show you the three tricks hiding in it. Tap each highlighted part and I'll explain exactly how it works on you.",
          introAudio: "/audio/wren/m01-c1-art-intro.mp3",
          device: { app: "MAIL", owner: "MAYA'S PHONE" },
          segments: [
            { id: "from", text: "From: GameHub Support" },
            { id: "hi", text: "Hi player," },
            { id: "prob", text: "We've spotted a problem with your account." },
            { id: "s-threat", text: "Your account will be permanently DELETED", hotspotId: "threat" },
            { id: "s-clock", text: "unless you act within the next 24 hours.", hotspotId: "clock" },
            { id: "s-now", text: "Verify your password NOW to save it.", hotspotId: "now" },
            { id: "sig", text: "The GameHub Team" },
          ],
          hotspots: [
            {
              id: "threat",
              label: "The threat",
              reveal: "This one fakes FEAR. It puts something you care about, your account, in danger, so you feel scared. And scared people act fast, without stopping to think.",
              audio: "/audio/wren/m01-c1-art-threat.mp3",
            },
            {
              id: "clock",
              label: "The countdown",
              reveal: "This one fakes RUSH. A real company would give you time. This clock is made up, it's only here to hurry you along before your brain catches up.",
              audio: "/audio/wren/m01-c1-art-clock.mp3",
            },
            {
              id: "now",
              label: "The push",
              reveal: "See the word NOW? Every line is shoving you to act this second. That jolt of panic you feel reading it? THAT feeling is your signal, to stop, not to tap.",
              audio: "/audio/wren/m01-c1-art-now.mp3",
            },
          ],
          doneLine: "That's the whole pressure play: fear, then a fake clock, then act NOW. Some scams fake good news instead (you've WON!), but it's the same trick, a strong feeling to rush you.",
          doneAudio: "/audio/wren/m01-c1-art-done.mp3",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          // PRACTICE on a NEW message (a prize scam), so they APPLY "spot the
          // pressure" rather than re-recognise the one they were taught on.
          // Select the 3 pressure lines; the 4 safe lines are decoys.
          intro: "A brand-new message just landed on Sam's phone. Find every part that's trying to pressure him.",
          device: { app: "TEXTS", owner: "SAM'S PHONE" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "+44 7700 900418 (unknown)" } },
          ],
          body: [
            [{ id: "greet", text: "Hi there!" }],
            [{ id: "win", text: "You've been specially chosen to WIN a £100 voucher!", tellId: "greed" }],
            [{ id: "rush", text: "Claim it in the next 15 minutes, before it's gone.", tellId: "rush" }],
            [{ id: "miss", text: "You really DON'T want to miss out on this one.", tellId: "fomo" }],
            [{ id: "members", text: "This offer is just for our valued members." }],
            [{ id: "reply", text: "Reply YES to claim yours." }],
            [{ id: "sig", text: "The Prizes Team" }],
          ],
          tells: [
            {
              id: "greed",
              label: "Fake good news",
              why: "That's GREED, being told you've won gets you excited so you act without checking.",
            },
            {
              id: "rush",
              label: "The countdown",
              why: "That's RUSH, a made-up 15-minute clock to hurry you before you think.",
            },
            {
              id: "fomo",
              label: "Fear of missing out",
              why: "Another pressure trick, scaring you that you'll lose out if you don't act fast.",
            },
          ],
          doneLine: "Spot on. Different scam, different bait, same three pressure tricks you just learned: greed, a countdown, and fear of missing out. The other lines are just normal message bits.",
        },
      },
      playAudio: "/audio/wren/m01-c1-play.mp3",
    },

    /* -------------------------------------- cycle 2: take apart the address */
    {
      id: "address",
      title: "Take apart the address",
      concept: "The real owner is the last two chunks before the first slash",
      promise: "You'll learn to find who a link REALLY goes to, even the sneaky ones.",
      instruction: "Help Maya pick the safest move.",
      intel: {
        beats: [
          "Every web address has one part that can't lie: the real name. Everything else is decoration the scammer gets to choose.",
          "To find the real name, do two things. Find the first single slash. Then read the two chunks right before it.",
          "So in account.gamehub.com/login, the two chunks before the slash are gamehub.com. That's the real owner. “account” is just a room inside their house.",
          "Now the trick that fools grown-ups. Look at gamehub.com.rewards-login.net. It SAYS gamehub.com, but the last two chunks are rewards-login.net. The real name is glued on the front to trick you.",
          "So never read left to right and relax the moment you see a name you know. Find the slash, take the last two chunks. That's who you're really talking to.",
        ],
        beatAudio: [
          "/audio/wren/m01-c2-b1.mp3",
          "/audio/wren/m01-c2-b2.mp3",
          "/audio/wren/m01-c2-b3.mp3",
          "/audio/wren/m01-c2-b4.mp3",
          "/audio/wren/m01-c2-b5.mp3",
        ],
        prediction: {
          question: "Which of these really belongs to GameHub?",
          options: [
            "account.gamehub.com",
            "gamehub.com.secure-login.net",
            "gamehub-rewards.com",
            "login.gamehub.verify.io",
          ],
          answer: 0,
          right: "Yes! Its last two chunks are gamehub.com, so it's really GameHub. “account” is just a page inside it.",
          wrong: "Read the LAST two chunks of each name. Only account.gamehub.com ends in gamehub.com. The rest are disguises. Try again.",
          hint: "Ignore the front of each address. Which one actually ENDS in gamehub.com?",
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
            question: "Which of these is really Netflix?",
            options: [
              "account.netflix.com",
              "netflix.com.watch-verify.net",
              "netflix-login.com",
              "secure-netflix.tv",
            ],
            answer: 0,
          },
          {
            id: "c2q2",
            question: "Who really owns  login.gamehub.com.secure-net.io ?",
            options: [
              "secure-net.io, a stranger",
              "gamehub.com",
              "login",
              "GameHub",
            ],
            answer: 0,
          },
          {
            id: "c2q3",
            question: "A link is  help.roblox.com . Using the rule, is it really Roblox?",
            options: [
              "Yes, its last two chunks are roblox.com",
              "No, it says help at the front",
              "No, you can never really tell",
              "Yes, because it's short",
            ],
            answer: 0,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 3: know the play */
    {
      id: "actor",
      title: "Know the play",
      concept: "Every phishing scam is built from the same three parts",
      promise: "You'll learn the pattern behind every disguise, and the one move that beats it.",
      instruction: "Tap the 3 tricks that are really his.",
      intel: {
        beats: [
          "Here's the secret that makes you unbeatable. Every phishing scam, whatever it's dressed as, is built from the same three parts.",
          "One: a feeling, to rush you. Two: a trusted name, faked. Three: a link that lies about where it goes.",
          "You don't need all three to be sure. Spot two of them in a message, and you're almost certainly looking at a scam. Game, bank, or school, it doesn't matter.",
          "And here's the move that beats every single one of them. Never act from the message itself. Go to the real app or website yourself, and check there.",
          "That one habit, go direct and never tap the message, defeats every disguise he will ever wear.",
        ],
        beatAudio: [
          "/audio/wren/m01-c3-b1.mp3",
          "/audio/wren/m01-c3-b2.mp3",
          "/audio/wren/m01-c3-b3.mp3",
          "/audio/wren/m01-c3-b4.mp3",
          "/audio/wren/m01-c3-b5.mp3",
        ],
        prediction: {
          question: "An email copies your school's logo perfectly, with zero spelling mistakes. But it rushes you, and its link goes to a stranger's site. Scam or safe?",
          options: [
            "Scam, it has two of the three parts, so the disguise doesn't matter",
            "Safe, the logo is perfect",
            "Safe, there are no spelling mistakes",
            "Can't tell without more info",
          ],
          answer: 0,
          right: "Right. A perfect disguise means nothing. The rush and the fake link are two of the three parts. That's a scam.",
          wrong: "Don't be fooled by a good disguise. Count the parts: a rush AND a fake link. That's two of three. Try again.",
          hint: "Ignore the logo and the spelling, that's just the costume. How many of the three scam parts can you count?",
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
            question: "A message has a faked sender AND a link that lies, but no countdown. Scam or safe?",
            options: [
              "Almost certainly a scam, that's two of the three parts",
              "Safe, there's no countdown",
              "Safe, it has a link",
              "Can't tell",
            ],
            answer: 0,
          },
          {
            id: "c3q2",
            question: "An email looks perfect, but it asks you to log in through its link. What's the ONE safe move?",
            options: [
              "Ignore the link, go to the real site yourself",
              "Log in through the link, it looks fine",
              "Reply to ask if it's real",
              "Forward it to a friend",
            ],
            answer: 0,
          },
          {
            id: "c3q3",
            question: "Why does “go direct” beat every disguise a scammer wears?",
            options: [
              "You check the real source yourself, instead of trusting the message",
              "Because scammers give up",
              "Because all links are fake",
              "Because it's the fastest way",
            ],
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
      "Okay Agent, this is the test. Six questions, and they're not “what did I say”. You'll have to work each one out using what you learned. I won't tell you how you're doing until the end. Get five right to close the case. Miss it, and you sit the whole case again.",
    pass: 5,
    voice: {
      intro: "/audio/wren/m01-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // Think-for-yourself: fresh scenarios the child must reason through, mixing
    // all three skills. Everything needed was taught, but none of it is recall.
    scenarios: [
      {
        id: "ct1",
        skill: 0,
        prompt: "A pop-up: “Unusual activity on your account. Verify within 30 minutes or lose access.” What makes this a classic scam move?",
        options: [
          "The 30-minute deadline, built to panic you into acting",
          "It mentions your account",
          "It uses the word verify",
          "It's about activity",
        ],
        answer: 0,
      },
      {
        id: "ct2",
        skill: 0,
        prompt: "Which of these is the LEAST likely to be a scam?",
        options: [
          "A shop emails your receipt after you bought something",
          "A “bank” texts: confirm your PIN in 5 minutes",
          "A DM: you've won, claim in 10 minutes",
          "A pop-up: your account deletes tonight",
        ],
        answer: 0,
      },
      {
        id: "ct3",
        skill: 1,
        prompt: "Which link REALLY belongs to GameHub?",
        evidence: "account.gamehub.com   ·   gamehub.com.rewards-login.net   ·   gamehub-support.net   ·   secure-gamehub.com",
        options: [
          "account.gamehub.com",
          "gamehub.com.rewards-login.net",
          "gamehub-support.net",
          "secure-gamehub.com",
        ],
        answer: 0,
      },
      {
        id: "ct4",
        skill: 1,
        prompt: "Who really owns this link?",
        evidence: "login-gamehub.com.verify-now.io",
        options: [
          "verify-now.io, a stranger",
          "gamehub.com",
          "GameHub login",
          "login-gamehub.com",
        ],
        answer: 0,
      },
      {
        id: "ct5",
        skill: 2,
        prompt: "A message copies your bank's logo perfectly, no spelling mistakes. But its link goes to bankofsafe-verify.net and it says “act within 1 hour”. Scam or safe?",
        options: [
          "Scam, the fake link and the rush are two of the three parts",
          "Safe, the logo is perfect",
          "Safe, there are no spelling mistakes",
          "Can't tell",
        ],
        answer: 0,
      },
      {
        id: "ct6",
        skill: 2,
        prompt: "Everything about an email looks fine, but it wants you to log in through its link. Safest thing to do?",
        options: [
          "Ignore the link, go to the real site yourself and log in there",
          "Log in through the link, since it looks fine",
          "Reply to check it's real first",
          "Click it just to see where it goes",
        ],
        answer: 0,
      },
    ],
  },

  debrief: {
    report: [
      "You took the fake email apart: the feeling it faked, the sneaky sender, and the link that lied.",
      "You made the right call: open the real app, report it, and don't tap any links.",
      "The second wave is sorted. Phantom Hook's plan is stopped and on the record.",
    ],
    realWorldMove:
      "This week: if a message tries to rush you, don't tap its links. Open the real app yourself and check there. Still feels wrong? Tell an adult you trust, and report it.",
    wrenLine: "You didn't just remember it, you worked it out. That's the real thing, Agent.",
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

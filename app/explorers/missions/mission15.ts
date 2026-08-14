/**
 * Mission 15 — "The Real Site" (Block 3: Systems — BLOCK FINALE).
 * Actor: MIMIC ③. Map slot: curriculum-map-v1 §M15.
 *
 * Teaching register (ages 10–13): a login page's LOOK cannot
 * authenticate it (pixel-perfect fakes), browser chrome vs page
 * content (the ARC-chrome art rule taught out loud as browser
 * literacy), and the password manager as lie detector — autofill
 * refuses wrong domains (M01 domains + M11 tools, in synthesis).
 * Ends Block 3: TOP SECRET clearance confirmed.
 *
 * Season arc — breadcrumb ④: every mirror domain registered by one
 * hidden entity. Six actors, one architect.
 *
 * VOICE PASS v1: WREN wry-mentor voice; MIMIC is a vain, faceless
 * copycat, now cloning whole sites. Teaching, ids, answers,
 * domains all unchanged.
 */

import Mission15Incident from "../incidents/Mission15Incident";
import type { MissionManifest } from "../engine/types";

export const mission15: MissionManifest = {
  id: "explorers-m15",
  caseNumber: "CASE 015",
  title: "Spoofing",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Copies whole websites, pixel for pixel, then mails you the fake.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "Five login pages. Four are perfect copies. Your eyes can't help. Your tools can.",
  scene: "/explorers/scenes/m15-cold-open.jpg",

  transmission: {
    headline: "HALL OF MIRRORS",
    lines: [
      "MIMIC built four copies of GameHub's login page.",
      "Pixel-perfect. Logo-perfect. Perfect-perfect. He's so proud of these.",
      "Kids across three schools each got a different link to a different mirror.",
      "“Do I look like the real thing?” Sure you do, MIMIC. Eyes are done here. Tonight we trust tools.",
    ],
  },

  briefing: {
    summary:
      "A page's LOOK can't prove what it is, no matter how perfect. The address bar and your vault can.",
    objectives: [
      "Retire the eyes test",
      "Read the browser's frame",
      "Let the vault detect lies",
    ],
    wrenLine: "The prettiest mirror is still a mirror, Agent.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: pixel-perfect fakes */
    {
      id: "pixels",
      title: "Perfect isn't proof",
      concept: "A page's look can't prove it's real",
      promise: "You'll learn where a fake page's clues really live.",
      instruction: "Tap the 3 clues. None are in the pixels.",
      intel: {
        beats: [
          "Fake sites used to have tells: blurry logos, weird fonts.",
          "Now MIMIC copies a whole site the same way he copies a face. Perfectly.",
          "The pixels match because they're flat-out stolen. So where did the clues go?",
          "Not into what the page shows you. Into where it lives, how you got there, and what it wants.",
        ],
        beatAudio: [
          "/audio/wren/m15-c1-b1.mp3",
          "/audio/wren/m15-c1-b2.mp3",
          "/audio/wren/m15-c1-b3.mp3",
          "/audio/wren/m15-c1-b4.mp3",
        ],
        prediction: {
          question: "A login page looks EXACTLY right. What does that actually prove?",
          options: [
            "It's the real site",
            "Nothing. Pixels get copied in one click",
            "It's at least probably safe",
          ],
          answer: 1,
          right: "Right. The look is just a screenshot, and a screenshot proves nothing.",
          wrong: "MIMIC saves the real page and serves it right back. Perfection is one right-click away.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 clues. None are in the pixels.",
          device: { app: "BROWSER CAPTURE", owner: "MIRROR SITE · RANGE COPY" },
          header: [
            { label: "PAGE:", seg: { id: "page", text: "GameHub login: logo, colors, fonts all flawless" } },
          ],
          body: [
            [{ id: "t1", text: "The address reads: gamehub.account-check.net", tellId: "address", mono: true }],
            [{ id: "t2", text: "How she got here: a link inside a DM", tellId: "path" }],
            [{ id: "t3", text: "First thing it wants: username + password, before showing anything", tellId: "ask" }],
            [{ id: "t4", text: "The buttons animate exactly like the real site" }],
          ],
          tells: [
            {
              id: "address",
              label: "The address",
              why: "Read it right to left: account-check.net wearing GameHub's face. Same trick as Case 1, always.",
            },
            {
              id: "path",
              label: "The arrival",
              why: "Real logins are places you GO to. Fakes are places you get SENT.",
            },
            {
              id: "ask",
              label: "The instant demand",
              why: "A page that demands your login before it shows you anything was built purely FOR the login.",
            },
          ],
          doneLine: "The look was flawless. Every clue lived somewhere the eyes never look. Eyes retire tonight.",
        },
      },
      playAudio: "/audio/wren/m15-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Why are fake pages pixel-perfect these days?",
            options: [
              "Scammers hire fancy designers",
              "The real page gets copied and re-served",
              "They aren't, just look closer",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Where do a mirror site's clues actually live?",
            options: [
              "In the quality of the logo",
              "The address, the arrival, and the ask",
              "In the loading speed",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: chrome vs content */
    {
      id: "chrome",
      title: "The frame can't lie",
      concept: "The frame is yours; the page is theirs",
      promise: "You'll learn which part of the screen tells the truth.",
      instruction: "Pick the part of the screen you can trust.",
      intel: {
        beats: [
          "Your screen is split into two territories.",
          "The frame, address bar and padlock and buttons, belongs to your browser. The page belongs to whoever sent it.",
          "The page can draw anything it likes, even a lovely fake padlock. The frame can't be drawn on.",
          "It's your browser's turf, not MIMIC's. Trust the territory, never the decoration.",
        ],
        beatAudio: [
          "/audio/wren/m15-c2-b1.mp3",
          "/audio/wren/m15-c2-b2.mp3",
          "/audio/wren/m15-c2-b3.mp3",
          "/audio/wren/m15-c2-b4.mp3",
        ],
        prediction: {
          question: "A page shows a big padlock badge inside its banner. That padlock is:",
          options: [
            "The browser's security seal",
            "Just decoration. The page can draw anything",
            "Proof it's encrypted",
          ],
          answer: 1,
          right: "Right. A padlock IN the page is clip-art. Only the frame's padlock is the real one.",
          wrong: "It's inside the page, so the sender drew it. Only the FRAME's padlock is your browser talking.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the part of the screen you can trust.",
          situation:
            "A login page flashes a huge green padlock badge and “100% SECURE” across its banner. The address bar above it reads: gamehub-secure-login.net.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "badge",
              label: "Trust the padlock badge, it's right there, in green",
              outcome:
                "That badge is part of the PAGE. MIMIC drew it there, like wallpaper. The page can claim anything it wants. A claim is not the frame.",
            },
            {
              id: "bar",
              label: "Trust the address bar, and it says this ISN'T gamehub.com",
              correct: true,
              outcome:
                "Territory read perfectly. The frame is your browser's, and nobody can draw on it. It just told you the truth: wrong domain, mirror site.",
            },
            {
              id: "design",
              label: "Trust the design, it's too professional to be fake",
              outcome:
                "It's professionally STOLEN. That design is the real site's, copied and re-served. Professional proves nothing. Territory proves everything.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m15-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Which part of the screen can a fake page NOT control?",
            options: [
              "Its own banner",
              "The browser's address bar",
              "The login form",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "“100% SECURE” written inside a page means:",
            options: [
              "The page is secure",
              "Someone typed “100% SECURE”",
              "The browser approved it",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the lie detector */
    {
      id: "detector",
      title: "The vault smells lies",
      concept: "Autofill checks domains your eyes can't",
      promise: "You'll build a login net no mirror gets through.",
      instruction: "Fill each slot with the part that holds.",
      intel: {
        beats: [
          "Now put it together. Case 1 gave you domains. Case 11 gave you the vault.",
          "Here's the secret MIMIC hates: the vault reads domains. It only fills on the exact site it saved.",
          "A mirror can fool your eyes all day. It can never fool the vault.",
          "So when autofill goes quiet on a login page, that silence is a siren.",
        ],
        beatAudio: [
          "/audio/wren/m15-c3-b1.mp3",
          "/audio/wren/m15-c3-b2.mp3",
          "/audio/wren/m15-c3-b3.mp3",
          "/audio/wren/m15-c3-b4.mp3",
        ],
        prediction: {
          question: "Your vault refuses to autofill on a login page. Most likely:",
          options: [
            "The vault is broken",
            "The domain doesn't match, so you're on a mirror",
            "The page just needs a refresh",
          ],
          answer: 1,
          right: "Right. The vault compared the addresses and refused. It just saved you.",
          wrong: "Autofill only fills the one exact address. Silence means the address is wrong. Mirror.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live. Build the login safety net.",
          target: "THE MIRROR-PROOF LOGIN NET",
          slots: [
            {
              id: "arrive",
              label: "SLOT 1: HOW YOU REACH LOGINS",
              options: [
                { id: "a1", label: "Links inside messages and DMs", good: false, why: "Places you get SENT. That's the mirror's front door, held open just for you." },
                { id: "a2", label: "Type the address, or use your own bookmark", good: true, why: "Places you GO to on purpose. A mirror can't catch an address you type yourself." },
                { id: "a3", label: "Search it and click the first ad", good: false, why: "Ads get bought by mirrors. Your bookmark can't be bought." },
              ],
            },
            {
              id: "typing",
              label: "SLOT 2: WHO TYPES THE PASSWORD",
              options: [
                { id: "t1", label: "You, by hand, wherever a page asks", good: false, why: "Hands don't read the address when you're rushed. That's exactly how mirrors win." },
                { id: "t2", label: "The vault's autofill: it checks the address first", good: true, why: "It checks the exact address every single time. The tool reads what tired eyes skip." },
                { id: "t3", label: "The browser's “remember me” on shared devices", good: false, why: "Shared devices remember for EVERYONE who sits down next. Straight from Case 13." },
              ],
            },
            {
              id: "refusal",
              label: "SLOT 3: WHEN AUTOFILL GOES QUIET",
              options: [
                { id: "r1", label: "Type it yourself, autofill's just being buggy", good: false, why: "That's exactly the mirror's plan for you. The silence IS the siren." },
                { id: "r2", label: "Stop. Read the address. Assume mirror until proven real.", good: true, why: "The vault refusing IS the warning. Treat it like an alarm, because that's what it is." },
                { id: "r3", label: "Refresh until it fills", good: false, why: "It will never fill on the wrong domain. That stubbornness is the whole point." },
              ],
            },
          ],
          testLine: "STRESS TEST: 4 MIRRORS vs THE NET … 0 PASSWORDS HANDED OVER.",
          doneLine: "Arrive on your own terms, let the vault type, treat silence as a siren. Officially mirror-proof.",
        },
      },
      playAudio: "/audio/wren/m15-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The safest way to reach a login page:",
            options: [
              "The link someone sent you",
              "Your bookmark, or typing the address yourself",
              "Whatever loads fastest",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Autofill refusing to fill is:",
            options: [
              "A bug to work around",
              "A domain mismatch, and a mirror alarm",
              "A sign to clear your cookies",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Hall of Mirrors",
    phases: 3,
    phaseNames: ["The eyes test", "Read the addresses", "The lie detector"],
    component: Mission15Incident,
  },

  debrief: {
    report: [
      "The eyes test retired: the pixels are stolen, so perfection proves nothing.",
      "Territory learned: the frame is the browser's and cannot lie. The page can, and does.",
      "Four mirrors beaten by one quiet vault. Block Three closed: TOP SECRET clearance confirmed.",
    ],
    realWorldMove:
      "This week: reach one login the analyst way. Type the address, or use your bookmark. Never a message link. If autofill ever goes quiet, stop and read the address.",
    wrenLine: "Block Three closed. TOP SECRET clearance, confirmed. The board is starting to talk, Agent.",
  },

  voice: {
    transmission: "/audio/wren/m15-transmission.mp3",
    briefing: "/audio/wren/m15-briefing.mp3",
    debrief: "/audio/wren/m15-debrief.mp3",
  },

  dossier: {
    mo: "Copies whole websites pixel for pixel and mails out the mirrors. A perfect look, hiding a wrong address.",
    defeatedBy: "The address bar, arrivals you typed yourself, and a vault that flat refuses to talk to strangers.",
    breadcrumb:
      "REGISTRY TRACE: one hidden owner registered all four mirror sites. Same signature behind every actor. Six actors, one architect, and the architect's tag reads ZERO. Filed as breadcrumb ④.",
  },
};

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
 */

import Mission15Incident from "../incidents/Mission15Incident";
import type { MissionManifest } from "../engine/types";

export const mission15: MissionManifest = {
  id: "explorers-m15",
  caseNumber: "CASE 015",
  title: "The Real Site",
  block: 3,
  classification: "TOP SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Copies whole websites, pixel for pixel.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "Five login pages. Four are perfect copies. Your eyes can't help — your tools can.",
  scene: "/explorers/scenes/m15-cold-open.jpg",

  transmission: {
    headline: "HALL OF MIRRORS",
    lines: [
      "MIMIC built four copies of GameHub's login page.",
      "Pixel-perfect. Logo-perfect. Perfect-perfect.",
      "Kids across three schools got four different links.",
      "Eyes are done here. Tonight, we trust tools.",
    ],
  },

  briefing: {
    summary:
      "A page's look cannot prove what it is. The address bar and your vault can.",
    objectives: [
      "Retire the eyes test",
      "Read the browser's chrome",
      "Let the vault detect lies",
    ],
    wrenLine: "The prettiest mirror is still a mirror, Operative.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: pixel-perfect fakes */
    {
      id: "pixels",
      title: "Perfect isn't proof",
      concept: "A page's look can't authenticate it",
      promise: "You'll learn where a fake page's tells really live.",
      instruction: "Tap the 3 tells — none are in the pixels.",
      intel: {
        beats: [
          "Once, fake sites had tells. Blurry logos. Weird fonts.",
          "MIMIC copies sites the way he copies faces.",
          "Perfectly. The pixels are identical because they're STOLEN.",
          "So where do the tells live now?",
          "Not in what the page shows.",
          "In where it lives, how you got there, and what it wants.",
        ],
        prediction: {
          question: "A login page looks EXACTLY right. What does that prove?",
          options: [
            "It's the real site",
            "Nothing — pixels are copied in one click",
            "It's at least probably safe",
          ],
          answer: 1,
          right: "Right. The look is a screenshot. Screenshots don't authenticate.",
          wrong: "MIMIC saves the real page and re-serves it. Perfection is one right-click away.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 tells — none are in the pixels.",
          device: { app: "BROWSER CAPTURE", owner: "MIRROR SITE · RANGE COPY" },
          header: [
            { label: "PAGE:", seg: { id: "page", text: "GameHub login — logo, colors, fonts: flawless" } },
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
              why: "Read right to left: account-check.net wearing GameHub's face. M01, always.",
            },
            {
              id: "path",
              label: "The arrival",
              why: "Real logins are places you GO. Fakes are places you're SENT.",
            },
            {
              id: "ask",
              label: "The instant ask",
              why: "A page that demands login before showing anything was built FOR the login.",
            },
          ],
          doneLine: "The look was flawless. All three tells lived somewhere else. Eyes retire tonight.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Why are fake pages pixel-perfect now?",
            options: [
              "Scammers hire designers",
              "The real page gets copied and re-served",
              "They aren't — look closer",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "Where do a mirror site's tells live?",
            options: [
              "In the logo quality",
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
      concept: "Browser chrome is yours; page content is theirs",
      promise: "You'll learn which part of the screen tells the truth.",
      instruction: "Pick the part of the screen you can trust.",
      intel: {
        beats: [
          "Your screen has two territories.",
          "The FRAME — address bar, padlock, buttons. The browser's.",
          "The PAGE — everything inside. The sender's.",
          "The page can draw ANYTHING. Including a fake padlock.",
          "The frame can't be drawn on. It belongs to your browser.",
          "Trust territory, not decoration.",
        ],
        prediction: {
          question: "A page shows a big padlock badge in its banner. That padlock is:",
          options: [
            "The browser's security seal",
            "Decoration — content can draw anything",
            "Proof of encryption",
          ],
          answer: 1,
          right: "Right. A padlock IN the page is clip-art. The frame's padlock is the real one.",
          wrong: "It's inside the page — the sender drew it. Only the FRAME's padlock is your browser talking.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the part of the screen you can trust.",
          situation:
            "A login page shows a huge green padlock badge and “100% SECURE” in its banner. The address bar above reads: gamehub-secure-login.net.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "badge",
              label: "Trust the padlock badge — it's right there, in green",
              outcome:
                "That badge is part of the PAGE — the sender drew it, like wallpaper. Content can claim anything. Claims aren't chrome.",
            },
            {
              id: "bar",
              label: "Trust the address bar — and it says this ISN'T gamehub.com",
              correct: true,
              outcome:
                "Territory read correctly. The frame belongs to your browser and can't be drawn on — and it just told you the truth: wrong domain, mirror site.",
            },
            {
              id: "design",
              label: "Trust the design — it's too professional to be fake",
              outcome:
                "It's professionally STOLEN. The design is the real site's, re-served. Professional means nothing; territory means everything.",
            },
          ],
        },
      },
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
          "Now the synthesis. M01 gave you domains.",
          "M11 gave you the vault.",
          "Here's the secret: the vault READS domains.",
          "Autofill only fills on the EXACT site it saved.",
          "A mirror can fool your eyes. Never the vault's.",
          "When autofill goes quiet on a login page — that silence is a siren.",
        ],
        prediction: {
          question: "Your vault won't autofill on a login page. Most likely:",
          options: [
            "The vault is broken",
            "The domain doesn't match — you're on a mirror",
            "The page needs a refresh",
          ],
          answer: 1,
          right: "Right. The vault compared addresses and refused. It just saved you.",
          wrong: "Autofill is domain-exact by design. Its silence means the address is wrong — mirror.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live — build the login safety net",
          target: "THE MIRROR-PROOF LOGIN NET",
          slots: [
            {
              id: "arrive",
              label: "SLOT 1 — HOW YOU ARRIVE AT LOGINS",
              options: [
                { id: "a1", label: "Links inside messages and DMs", good: false, why: "Places you're SENT. That's the mirror's front door." },
                { id: "a2", label: "Type the address, or use your own bookmark", good: true, why: "Places you GO. Mirrors can't intercept a typed address." },
                { id: "a3", label: "Search it and click the first ad", good: false, why: "Ads get bought by mirrors. Bookmarks don't." },
              ],
            },
            {
              id: "typing",
              label: "SLOT 2 — WHO TYPES THE PASSWORD",
              options: [
                { id: "t1", label: "You, by hand, wherever a page asks", good: false, why: "Hands can't read domains under pressure. That's how mirrors harvest." },
                { id: "t2", label: "The vault's autofill — it checks the domain first", good: true, why: "Domain-exact, every time. The tool reads what eyes skip." },
                { id: "t3", label: "The browser's “remember me” on shared devices", good: false, why: "Shared devices remember for EVERYONE who sits down. M13's lesson." },
              ],
            },
            {
              id: "refusal",
              label: "SLOT 3 — WHEN AUTOFILL GOES QUIET",
              options: [
                { id: "r1", label: "Type it manually — autofill's just being buggy", good: false, why: "That override is the mirror's entire plan. Silence is the siren." },
                { id: "r2", label: "Stop. Read the address. Assume mirror until proven real.", good: true, why: "The refusal IS the detection. Treat it like an alarm, because it is one." },
                { id: "r3", label: "Refresh until it fills", good: false, why: "It will never fill on the wrong domain. That's the point of it." },
              ],
            },
          ],
          testLine: "STRESS TEST: 4 MIRRORS vs THE NET … 0 PASSWORDS SURRENDERED.",
          doneLine: "Arrive on your own terms, let the vault type, treat silence as a siren. Mirror-proof.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The safest way to reach a login page:",
            options: [
              "The link that was sent to you",
              "Your bookmark, or typing the address",
              "Whatever loads fastest",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Autofill refusing to fill is:",
            options: [
              "A bug to work around",
              "A domain mismatch — a mirror alarm",
              "A sign to clear cookies",
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
      "The eyes test retired: pixels are stolen, perfection proves nothing.",
      "Territory learned: the frame is the browser's and cannot lie; the page can.",
      "Four mirrors defeated by one quiet vault. Block Three closed: TOP SECRET clearance confirmed.",
    ],
    realWorldMove:
      "This week: reach one login the analyst way — type it or use your bookmark, never a message link. And if autofill ever goes quiet, stop and read the address.",
    wrenLine: "Block Three closed. TOP SECRET clearance, confirmed. The board is starting to talk, Operative.",
  },

  voice: {
    transmission: "/audio/wren/m15-transmission.mp3",
    briefing: "/audio/wren/m15-briefing.mp3",
    debrief: "/audio/wren/m15-debrief.mp3",
  },

  dossier: {
    mo: "Copies whole websites pixel for pixel and mails out the mirrors.",
    defeatedBy: "The address bar, typed arrivals, and a vault that refuses to talk to strangers.",
    breadcrumb:
      "REGISTRY TRACE: all four mirror domains registered by one hidden entity — the same signature behind every actor's infrastructure. Six actors, one architect. Filed.",
  },
};

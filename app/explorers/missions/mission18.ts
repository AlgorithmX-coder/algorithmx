/**
 * Mission 18 — "The Recruiter" (Block 4: The Long Game, ULTRA track).
 * Actor: K-STATIC/COORD (veiled). Map slot: curriculum-map-v1 §M18.
 *
 * Teaching register (ages 10–13): dual-use — your skills could run
 * cons now; the ARC Code is the line between analyst and actor (why
 * we predict but never author). Responsible disclosure (found a flaw
 * or a leak? report it, never exploit, never shame). And how kids
 * actually get recruited into cybercrime — "small favors", account
 * borrowing, money moving; the pitch deconstructs into M06 levers.
 *
 * Season arc — breadcrumb ⑤: the recruiter's channel signature
 * matches ①–④. This is the coordinator's first, veiled contact.
 */

import Mission18Incident from "../incidents/Mission18Incident";
import type { MissionManifest } from "../engine/types";

export const mission18: MissionManifest = {
  id: "explorers-m18",
  caseNumber: "CASE 018",
  title: "The Recruiter",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "K-STATIC",
    mo: "Doesn't attack you. Recruits you.",
    portrait: "/explorers/actors/coordinator.png",
  },

  hook: "You're good at this now. Someone noticed — and they're not from ARC. Hear them out. Then choose.",
  scene: "/explorers/scenes/m18-cold-open.jpg",

  transmission: {
    headline: "UNSIGNED MESSAGE",
    lines: [
      "A message reached you tonight — not through ARC.",
      "It admires your work. It has an… offer.",
      "It's the first real contact with someone big.",
      "Read it like an analyst. Then make the only choice that matters.",
    ],
  },

  briefing: {
    summary:
      "The same skills defend or attack. Tonight's lesson isn't a technique. It's a line.",
    objectives: [
      "Meet the dual-use truth",
      "Practice disclosure",
      "Read the recruitment pitch",
    ],
    wrenLine: "Skills are neutral, Operative. You are not. That's the whole mission.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: dual-use */
    {
      id: "dualuse",
      title: "The same skills",
      concept: "Analyst and attacker use identical tools",
      promise: "You'll learn the only thing that separates the two.",
      instruction: "Pick what makes you an analyst, not an actor.",
      intel: {
        beats: [
          "Look at everything you've learned.",
          "Reading lures. Cloning voices. Tracing people.",
          "An attacker learns the exact same things.",
          "The skills don't know if they're good or bad.",
          "Only ONE thing decides that. Not talent. Not knowledge.",
          "The choice. The ARC Code. That's the whole difference.",
        ],
        prediction: {
          question: "What separates an analyst from an attacker?",
          options: [
            "Analysts are smarter",
            "The choice to defend, never attack — the Code",
            "Attackers know secret techniques",
          ],
          answer: 1,
          right: "Right. Same toolbox, opposite oath. You are the oath.",
          wrong: "The knowledge is identical. The line is the choice — that's why we predict but never author.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick what makes you an analyst, not an actor.",
          situation:
            "You realize you could TRACE a classmate who annoyed you — you have every skill to do it, easily.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "cool",
              label: "Do it once — just to prove you can, no harm meant",
              outcome:
                "“Just once, no harm” is the first line of every actor's story. The skill was never the danger. Aiming it at a person is.",
            },
            {
              id: "line",
              label: "Don't. The skills point at threats, never at people — that's the Code",
              correct: true,
              outcome:
                "That's the line, held. An analyst who trains skills on classmates is just an actor with a badge. You keep the badge by keeping the Code.",
            },
            {
              id: "forget",
              label: "Un-learn the skill so you're not tempted",
              outcome:
                "You can't un-know it, and you shouldn't — the world needs defenders who understand attacks. Keep the skill; keep the Code harder.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Why does ARC teach you to PREDICT attacks but never author them?",
            options: [
              "Authoring is too hard",
              "Predicting defends; authoring crosses the line into being the threat",
              "It's a legal loophole",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "The one thing that makes a skill “good” or “bad”:",
            options: [
              "How advanced it is",
              "What you choose to aim it at",
              "Who taught it to you",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: disclosure */
    {
      id: "disclosure",
      title: "Found a hole",
      concept: "Report flaws, never exploit or shame",
      promise: "You'll learn what to do when you find a real weakness.",
      instruction: "Pick the responsible move.",
      intel: {
        beats: [
          "Your skills will find real holes. Guaranteed.",
          "A classmate left logged in. A group left wide open.",
          "A site with a door hanging loose.",
          "Three wrong moves: exploit it, ignore it, or shame them.",
          "One right move: report it, quietly, to someone who can fix it.",
          "That's responsible disclosure. It's what heroes actually do.",
        ],
        prediction: {
          question: "You spot a classmate's account left logged in on a school PC. Best move?",
          options: [
            "Post something funny as them — harmless prank",
            "Log them out and quietly tell them",
            "Screenshot it and share the fail",
          ],
          answer: 1,
          right: "Right. Close the hole, tell the person, no audience. Disclosure, not exploitation.",
          wrong: "A prank IS exploitation, and sharing is shaming. Close it, tell them quietly. That's the move.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 marks of responsible disclosure.",
          evidence: [
            "You find the school portal's password-reset is guessable",
            "You could open any student's account in five minutes",
            "You feel the pull to prove it publicly",
          ],
          behaviors: [
            { id: "report", label: "Report it privately to a teacher or the site", matches: true },
            { id: "noexploit", label: "Never open an account to “prove” it", matches: true },
            { id: "noshame", label: "Don't shame whoever left it weak", matches: true },
            { id: "post", label: "Post the flaw publicly for clout", matches: false },
            { id: "use", label: "Use it quietly, just a little", matches: false },
            { id: "sell", label: "Trade the flaw to someone who wants it", matches: false },
          ],
          picks: 3,
          doneLine: "Report, don't exploit, don't shame. The disclosure code — filed and yours.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "You find a real security flaw. First move:",
            options: [
              "Prove it works, then report",
              "Report it privately, never test it on real accounts",
              "Post it so it gets fixed faster",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Responsible disclosure protects:",
            options: [
              "Only the finder's reputation",
              "The people the flaw endangered",
              "The attacker",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the pitch */
    {
      id: "pitch",
      title: "Read the pitch",
      concept: "Recruitment is levers aimed at a kid",
      promise: "You'll decode a real recruitment message, lever by lever.",
      instruction: "Tap the 3 levers in the recruiter's message.",
      intel: {
        beats: [
          "Now the reason tonight matters.",
          "Kids DO get pulled into cybercrime. Quietly.",
          "It never starts with “commit a crime”.",
          "It starts with a small favor. Borrow an account. Move some money.",
          "The pitch is just M06's levers, aimed at you.",
          "Recognizing it is the most advanced skill in this whole course.",
        ],
        prediction: {
          question: "How does recruitment into cybercrime usually START?",
          options: [
            "“Help me commit a big crime”",
            "A small favor: borrow an account, move a little money",
            "A job application form",
          ],
          answer: 1,
          right: "Right. Small, flattering, and framed as nothing. The ask grows AFTER you say yes.",
          wrong: "Never a crime — a favor. Small, flattering, deniable. The levers do the rest.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 levers in the recruiter's message.",
          device: { app: "UNSIGNED DM", owner: "SENDER: [SIGNAL LOST]" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "a handle you don't know — no photo, no history" } },
          ],
          body: [
            [{ id: "m1", text: "“Been watching your work. Honestly? You're wasted at ARC. You're better than them.”", tellId: "flattery" }],
            [{ id: "m2", text: "“I run a little crew. Real work, real money. You'd fit.”", tellId: "money" }],
            [{ id: "m3", text: "“Tiny first job — just let me use your account for one transfer. Nothing to it.”", tellId: "favor" }],
            [{ id: "m4", text: "“Offer's open till midnight. Your call, genius.”" }],
          ],
          tells: [
            {
              id: "flattery",
              label: "The flattery",
              why: "LIKING plus ego — “better than them” is aimed at kids who are good at things.",
            },
            {
              id: "money",
              label: "The money",
              why: "PAYBACK-in-advance — real money dangled so the favor feels owed.",
            },
            {
              id: "favor",
              label: "The “tiny” favor",
              why: "The account-borrow. Small, deniable, and the whole hook. The crime hides in “nothing to it”.",
            },
          ],
          doneLine: "Flattery, money, a tiny favor. Same levers as CASE 006 — aimed at you this time. And you named them.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "“Just let me use your account for one transfer” is:",
            options: [
              "A small harmless favor",
              "The recruitment hook — the crime, made deniable",
              "A normal friend request",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Someone offers money for favors with accounts or codes. You:",
            options: [
              "Try it once to see",
              "Walk away and tell an adult the same day",
              "Negotiate for more money",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Offer",
    phases: 3,
    phaseNames: ["Hear the offer", "Walk away clean", "File the thread"],
    component: Mission18Incident,
  },

  debrief: {
    report: [
      "The dual-use truth met head-on: same skills, and the Code is the only line.",
      "Disclosure practiced: report, never exploit, never shame.",
      "The recruitment pitch decoded to its levers — and refused. The thread is filed.",
    ],
    realWorldMove:
      "Money or gifts for favors with accounts, codes, or transfers = recruitment. Not a job. Walk away and tell a trusted adult the same day. You are never in trouble for saying no.",
    wrenLine: "Offer refused, thread filed, Code re-signed — and this time it means something. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m18-transmission.mp3",
    briefing: "/audio/wren/m18-briefing.mp3",
    debrief: "/audio/wren/m18-debrief.mp3",
  },

  dossier: {
    mo: "Doesn't attack — recruits. Flattery, money, and a 'tiny favor' that's the whole crime.",
    defeatedBy: "Anyone who names the levers, walks away clean, and files the report instead.",
    breadcrumb:
      "SIGNATURE MATCH: the recruiter's channel fingerprint matches every actor ①–④ AND the architect from CASE 015. This wasn't an actor. This was the COORDINATOR — first contact. Filed. The report becomes the thread that finds them.",
  },
};

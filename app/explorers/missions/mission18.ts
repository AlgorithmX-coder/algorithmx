/**
 * Mission 18 — "The Recruiter" (Block 4: The Long Game, ULTRA track).
 * Actor: ZERO (veiled). Map slot: curriculum-map-v1 §M18.
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
 *
 * VOICE PASS v1: ZERO gets the calm, quiet gravitas of the endgame
 * mastermind (no jokes, no street patter); WREN a touch graver; the
 * refusal stays clean and sincere. Strings only; teaching, ids,
 * answers, flags, and structure unchanged.
 */

import Mission18Incident from "../incidents/Mission18Incident";
import type { MissionManifest } from "../engine/types";

export const mission18: MissionManifest = {
  id: "explorers-m18",
  caseNumber: "CASE 018",
  title: "Black Hat",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "ZERO",
    mo: "Doesn't attack you. Recruits you.",
    portrait: "/explorers/actors/coordinator.png",
  },

  hook: "You're good at this now, and someone has been watching. Not ARC. He has an offer, and he'll stay calm while he makes it. Hear him out, then draw your line.",
  scene: "/explorers/scenes/m18-cold-open.jpg",

  transmission: {
    headline: "UNSIGNED MESSAGE",
    lines: [
      "A message reached you tonight. It did not come through ARC. Nothing from him ever does.",
      "It admires your work. Calm, patient, sure of itself. And it has an offer.",
      "This is the first real contact with the one the whole season has been circling.",
      "Read it like an analyst. Then make the only choice that matters.",
    ],
  },

  briefing: {
    summary:
      "The same skills defend or attack. Tonight is not a new trick. It's a line, and only you can draw it.",
    objectives: [
      "See how skills cut both ways",
      "Practice reporting a weakness",
      "Read the recruiter's message",
    ],
    wrenLine: "Skills pick no side, Agent. You do. That is the whole mission tonight.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: dual-use */
    {
      id: "dualuse",
      title: "The same skills",
      concept: "Analyst and attacker use the same tools",
      promise: "You'll learn the one thing that tells them apart.",
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
            "The choice to defend, never attack: the Code",
            "Attackers know secret tricks",
          ],
          answer: 1,
          right: "Right. Same toolbox, opposite promise. You are the promise.",
          wrong: "The knowledge is the same. The line is the choice. That's why we predict attacks but never make them.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick what makes you an analyst, not an actor.",
          situation:
            "You could TRACE a classmate who annoyed you. You have every skill to do it, easily.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "cool",
              label: "Do it once, just to prove you can. No harm meant",
              outcome:
                "“Just once, no harm” is the first line of every actor's story. The skill was never the danger. Aiming it at a person is.",
            },
            {
              id: "line",
              label: "Don't. The skills point at threats, never at people. That's the Code",
              correct: true,
              outcome:
                "That's the line, held. An analyst who trains skills on classmates is just an actor with a badge. You keep the badge by keeping the Code.",
            },
            {
              id: "forget",
              label: "Un-learn the skill so you're not tempted",
              outcome:
                "You can't un-know it, and you shouldn't. The world needs defenders who understand attacks. Keep the skill. Keep the Code harder.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Why does ARC teach you to PREDICT attacks but never make them?",
            options: [
              "Making them is too hard",
              "Predicting defends you. Making attacks turns you into the threat",
              "It's a way around the rules",
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
      concept: "Report the hole, don't sneak in, don't shame",
      promise: "You'll learn what to do when you find a real weakness.",
      instruction: "Pick the responsible move.",
      intel: {
        beats: [
          "Your skills will find real holes. Guaranteed.",
          "A classmate left logged in. A group left wide open.",
          "A site with a door hanging loose.",
          "Three wrong moves: sneak in, ignore it, or shame them.",
          "One right move: report it, quietly, to someone who can fix it.",
          "That's responsible disclosure. It's what real heroes do.",
        ],
        prediction: {
          question: "You spot a classmate's account left logged in on a school PC. Best move?",
          options: [
            "Post something funny as them, just a harmless prank",
            "Log them out and quietly tell them",
            "Screenshot it and share the fail",
          ],
          answer: 1,
          right: "Right. Close the hole, tell the person, no audience. Report it, don't use it.",
          wrong: "A prank still uses them, and sharing shames them. Close it, tell them quietly. That's the move.",
        },
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Pick the 3 right ways to report a hole.",
          evidence: [
            "You find the school login's password reset is easy to guess",
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
          doneLine: "Report, don't sneak in, don't shame. That's the code, filed and yours.",
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
            question: "Reporting a hole the right way protects:",
            options: [
              "Only the person who found it",
              "The people the hole put at risk",
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
          "The pitch is just CASE 006's levers, aimed at you.",
          "Spotting it is the most advanced skill in this whole course.",
        ],
        prediction: {
          question: "How does recruitment into cybercrime usually START?",
          options: [
            "“Help me commit a big crime”",
            "A small favor: borrow an account, move a little money",
            "A job application form",
          ],
          answer: 1,
          right: "Right. Small, flattering, and made to feel like nothing. The ask grows AFTER you say yes.",
          wrong: "Never a crime, just a favor. Small, flattering, easy to hide. The levers do the rest.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 levers in the recruiter's message.",
          device: { app: "UNSIGNED DM", owner: "SENDER: [SIGNAL LOST]" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "a handle you don't know, no photo, no history" } },
          ],
          body: [
            [{ id: "m1", text: "“I've watched you work for a while now. You see what the others miss. You're better than them, and I think you already know it.”", tellId: "flattery" }],
            [{ id: "m2", text: "“I build things. Quiet, careful, and they pay. Real money, real work. There's room for someone like you.”", tellId: "money" }],
            [{ id: "m3", text: "“We start small. Lend me your account for one transfer. Nothing to it. You'd barely feel it.”", tellId: "favor" }],
            [{ id: "m4", text: "“The offer stays open until midnight. No pressure. Just think it over.”" }],
          ],
          tells: [
            {
              id: "flattery",
              label: "The flattery",
              why: "This is flattery, aimed at your ego. “Better than them” hooks kids who are good at things.",
            },
            {
              id: "money",
              label: "The money",
              why: "This dangles real money first, so the favor feels owed.",
            },
            {
              id: "favor",
              label: "The “tiny” favor",
              why: "The account borrow. Small, easy to hide, and the whole hook. The crime hides in “nothing to it”.",
            },
          ],
          doneLine: "Flattery, money, a tiny favor. Same levers as CASE 006, aimed at you this time. And you named them.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "“Just let me use your account for one transfer” is:",
            options: [
              "A small harmless favor",
              "The recruitment hook: the crime, made to look tiny",
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
      "One hard truth, faced: same skills, and the Code is the only line.",
      "Reporting done right: report, never sneak in, never shame.",
      "The recruitment pitch decoded to its levers, and refused. The thread is filed.",
    ],
    realWorldMove:
      "Money or gifts for a favor with accounts, codes, or transfers? That is recruitment, not a job. Walk away. Tell a trusted adult the same day. You are never in trouble for saying no.",
    wrenLine: "Offer refused, thread filed, Code re-signed. And this time it means something. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m18-transmission.mp3",
    briefing: "/audio/wren/m18-briefing.mp3",
    debrief: "/audio/wren/m18-debrief.mp3",
  },

  dossier: {
    mo: "Doesn't attack, recruits. Flattery, money, and a 'tiny favor' that's the whole crime.",
    defeatedBy: "Anyone who names the levers, walks away clean, and files the report instead.",
    breadcrumb:
      "SIGNATURE MATCH: the recruiter's fingerprint matches breadcrumbs ① to ④ AND the architect from CASE 015. This wasn't an actor. This was the COORDINATOR, ZERO. First contact. Filed as breadcrumb ⑤. The report becomes the thread that finds them.",
  },
};

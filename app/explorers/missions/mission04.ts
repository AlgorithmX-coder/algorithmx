/**
 * Mission 04 — "The Puzzle You Posted" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PACKRAT ①. Map slot: curriculum-map-v1 §M04.
 *
 * Teaching register (ages 10–13): the ASSEMBLY attack. Heroes taught
 * "don't share personal info"; this teaches how harmless crumbs
 * COMBINE — handle + photo + comment = school, schedule, birthday —
 * and therefore which crumbs to scrub first.
 *
 * Safety canon: the assembly runs as an AUTHORIZED ARC AUDIT of a
 * volunteer's test account (built from her old posts, with her help).
 * Defensive framing throughout — never "how to stalk".
 *
 * VOICE PASS v1: WREN wry-mentor voice; PACKRAT is a comic data-hoarding
 * magpie who never breaks in ("you left it out, I picked it up"). Teaching,
 * ids, answers all unchanged.
 */

import Mission04Incident from "../incidents/Mission04Incident";
import type { MissionManifest } from "../engine/types";

export const mission04: MissionManifest = {
  id: "explorers-m04",
  caseNumber: "CASE 004",
  title: "OSINT",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PACKRAT",
    mo: "Never breaks in. Grabs the crumbs you drop and files them away.",
    portrait: "/explorers/actors/packrat.png",
  },

  hook: "Four harmless posts, and PACKRAT just built a file on a student out of the scraps. Let's take it apart.",
  scene: "/explorers/scenes/m04-cold-open.jpg",

  transmission: {
    headline: "AUCTION DETECTED",
    lines: [
      "There's an auction running on a hidden channel.",
      "The lot for sale: a file about a student.",
      "School. Schedule. Birthday. All of it.",
      "She never told anyone. She posted it in pieces, and PACKRAT pocketed every crumb.",
    ],
  },

  briefing: {
    summary:
      "PACKRAT never breaks in. Why would he? He just pockets what you left lying outside.",
    objectives: [
      "See the assembly attack",
      "Read what photos leak",
      "Scrub what matters first",
    ],
    wrenLine: "Crumbs first, Agent. The nest is patient.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the assembly */
    {
      id: "assembly",
      title: "The assembly attack",
      concept: "Harmless crumbs combine into a file",
      promise: "You'll learn how strangers turn posts into a profile.",
      instruction: "Pin the 4 crumbs. Then chain them.",
      intel: {
        beats: [
          "One post on its own? PACKRAT can't do a thing with it.",
          "That's the trap: every crumb feels harmless. A handle, a photo, a birthday joke.",
          "Alone they're nothing. Stacked in his nest they're a file. ARC calls it the assembly attack.",
          "Tonight we run one ourselves, on a volunteer's test account, with her OK.",
        ],
        beatAudio: [
          "/audio/wren/m04-c1-b1.mp3",
          "/audio/wren/m04-c1-b2.mp3",
          "/audio/wren/m04-c1-b3.mp3",
          "/audio/wren/m04-c1-b4.mp3",
        ],
        prediction: {
          question: "Priya's posts each share one tiny thing. What's the real danger?",
          options: [
            "One post might have a typo",
            "The tiny things combine into one big file",
            "Posting too often looks uncool",
          ],
          answer: 1,
          right: "Exactly. Crumbs combine. The file is bigger than any single post.",
          wrong: "No single post is the problem. Stacked together, they build a file.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Audit board: pin every crumb that feeds the file",
          fingerprintHint: "anything that says who, where, or when",
          cards: [
            {
              id: "t1",
              surface: "GAME PROFILE",
              from: "@priya_riverdale09",
              text: "bio: goalie for the Riverdale Foxes ⚽ love saves & snacks",
              inCampaign: true,
              clue: "the handle names her town AND her team",
              order: 1,
            },
            {
              id: "d1",
              surface: "GAME CHAT",
              from: "@priya_riverdale09",
              text: "anyone else think the new update made the menus worse??",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "PHOTO POST",
              from: "@priya_riverdale09",
              text: "match day!! 📸 Team photo, school gates behind them",
              inCampaign: true,
              clue: "the gates say WHICH school",
              order: 2,
            },
            {
              id: "t3",
              surface: "COMMENT",
              from: "@priya_riverdale09",
              text: "we practice every Tuesday til 6, come watch!",
              inCampaign: true,
              clue: "a schedule, posted in public",
              order: 3,
            },
            {
              id: "d2",
              surface: "FORUM",
              from: "@priya_riverdale09",
              text: "how do you solve question 4 on the maths sheet lol",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "QUIZ POST",
              from: "@priya_riverdale09",
              text: "my goalie number + my birth year = my lucky number lol",
              inCampaign: true,
              clue: "birthday math, posted as a joke",
              order: 4,
            },
          ],
          stage2Prompt: "Now chain it like PACKRAT does: order the crumbs into a file",
          doneLine: "Who → where → when → birthday. Four posts, one file. That's assembly, and PACKRAT never lifted a claw.",
        },
      },
      playAudio: "/audio/wren/m04-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "Which post is the SAFEST on its own?",
            options: [
              "None are dangerous alone, that's the point",
              "The photo, because photos are private",
              "The bio, because everyone has one",
            ],
            answer: 0,
          },
          {
            id: "c1q2",
            question: "Why does PACKRAT love quiz posts like “your first pet + your street”?",
            options: [
              "They're funny",
              "They harvest security answers as a game",
              "They get lots of likes",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the leaky photo */
    {
      id: "photo",
      title: "Read the photo",
      concept: "A photo leaks more than its subject",
      promise: "You'll learn to see everything a photo quietly gives away.",
      instruction: "Tap the 3 leaks hiding in this photo.",
      intel: {
        beats: [
          "A photo shows what you pointed it at. It also shows everything BEHIND it.",
          "Uniform crests. Street signs. Reflections in windows.",
          "And underneath, the location tag your phone stapled on without asking.",
          "You checked the smile. PACKRAT checked the background.",
        ],
        beatAudio: [
          "/audio/wren/m04-c2-b1.mp3",
          "/audio/wren/m04-c2-b2.mp3",
          "/audio/wren/m04-c2-b3.mp3",
          "/audio/wren/m04-c2-b4.mp3",
        ],
        prediction: {
          question: "What does PACKRAT look at first in a photo?",
          options: [
            "Whether the photo is blurry",
            "The background and the tags",
            "How many likes it got",
          ],
          answer: 1,
          right: "Right. The subject is for your friends. The background is for the collector.",
          wrong: "Likes don't feed a file. Backgrounds and tags do.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 leaks hiding in this photo.",
          device: { app: "PHOTOS", owner: "TEST ACCOUNT (Priya's audit)" },
          header: [
            { label: "POST:", seg: { id: "cap", text: "match day!! ⚽🔥" } },
            { label: "SCAN:", seg: { id: "scan", text: "ARC photo audit: what's in frame?" } },
          ],
          body: [
            [{ id: "p1", text: "In frame: the team, wearing Riverdale Academy crests", tellId: "crest" }],
            [{ id: "p2", text: "In frame: Priya mid-save (great save, honestly)" }],
            [{ id: "p3", text: "In frame: street sign by the gates, Mill Lane", tellId: "street" }],
            [{ id: "p4", text: "Under the photo: 📍 location tag, added by the phone", tellId: "geo", mono: true }],
          ],
          tells: [
            {
              id: "crest",
              label: "The crest",
              why: "The uniform names her exact school. No caption needed.",
            },
            {
              id: "street",
              label: "The street sign",
              why: "Background signs put the school on a map.",
            },
            {
              id: "geo",
              label: "The location tag",
              why: "The phone tagged the spot automatically. Nobody typed it.",
            },
          ],
          doneLine: "Three leaks, and not one of them in the caption. That's why PACKRAT loves a photo.",
        },
      },
      playAudio: "/audio/wren/m04-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Before posting a photo, the analyst's check is:",
            options: [
              "Is my smile good?",
              "What's in the background, and is location on?",
              "Which filter looks best?",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Where did the photo's location tag come from?",
            options: [
              "Priya typed it in",
              "Her phone added it automatically",
              "The school added it",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: scrub triage */
    {
      id: "scrub",
      title: "Scrub what matters",
      concept: "Take down the crumb that hurts most first",
      promise: "You'll learn what to delete first, and why.",
      instruction: "Pick what Priya scrubs first.",
      intel: {
        beats: [
          "One thing makes assembly even easier: the same handle everywhere.",
          "@priya_riverdale09 on games, photos, forums. Same name, one thread tying every crumb together.",
          "You can't delete the internet. Good news: you don't need to.",
          "Analysts scrub by priority: the crumb that hurts most goes first.",
        ],
        beatAudio: [
          "/audio/wren/m04-c3-b1.mp3",
          "/audio/wren/m04-c3-b2.mp3",
          "/audio/wren/m04-c3-b3.mp3",
          "/audio/wren/m04-c3-b4.mp3",
        ],
        prediction: {
          question: "Why does the same handle everywhere help PACKRAT?",
          options: [
            "It's easier to spell",
            "It links every post into one trail",
            "Handles don't matter",
          ],
          answer: 1,
          right: "Exactly. One name, one thread: tug it and the whole file follows.",
          wrong: "The handle is the thread. Same name everywhere links every crumb.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick what Priya scrubs first.",
          situation:
            "The audit found three loud crumbs. Priya has five minutes before practice. She can fix ONE thing right now.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "schedule",
              label: "Delete the practice-schedule comment",
              correct: true,
              outcome:
                "Clean. WHERE plus WHEN a stranger can find her in person beats every other leak. Scrub it, then the photo, then the quiz.",
            },
            {
              id: "handle",
              label: "Rename her handle everywhere",
              outcome:
                "Worth doing: it cuts the thread for FUTURE crumbs. But the schedule is a real-world where-and-when. That goes first.",
            },
            {
              id: "nuke",
              label: "Delete the whole account",
              outcome:
                "That's panic, not analysis. She loses everything, learns nothing, and the file PACKRAT already built stays built. Scrub smart instead.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m04-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Which crumb gets scrubbed FIRST, every time?",
            options: [
              "Anything embarrassing",
              "Anything that says where you'll be, and when",
              "Anything with a typo",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Different handles on different apps means:",
            options: [
              "Friends can't find you",
              "Crumbs stop linking into one trail",
              "You look suspicious",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Paper Trail",
    phases: 3,
    phaseNames: ["Read the file", "Scrub the sources", "Poison the auction"],
    component: Mission04Incident,
  },

  debrief: {
    report: [
      "One assembly attack run and understood: four crumbs, one file.",
      "Photo audit done: crests, signs, and silent location tags flagged.",
      "Sources scrubbed by priority; the auctioned file went stale and worthless.",
    ],
    realWorldMove:
      "This week: audit your own top three posts. Check the background, the tags, and the handle. Scrub anything that says where you'll be and when.",
    wrenLine: "File closed, nest empty. Watch what you drop, Agent. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m04-transmission.mp3",
    briefing: "/audio/wren/m04-briefing.mp3",
    debrief: "/audio/wren/m04-debrief.mp3",
  },

  dossier: {
    mo: "Never breaks in. He pockets the crumbs you drop, stacks them into a file, and sells it. His whole motto: you left it out, he picked it up.",
    defeatedBy: "Anyone who checks the background, kills the location tags, and scrubs the where-and-when before anything else.",
  },
};

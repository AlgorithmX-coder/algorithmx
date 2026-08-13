/**
 * Mission 16 — "The File On You" (Block 4: The Long Game, ULTRA track).
 * Actor: PACKRAT ③. Map slot: curriculum-map-v1 §M16.
 *
 * Teaching register (ages 10-13), kid-plain: companies keep a file
 * about you and trade it. Spy on your own trail (Case 4's trick aimed
 * at yourself), then clean it up: cut links, close dead accounts, and
 * leave GOOD tracks on purpose (choosing your story, not hiding).
 *
 * VOICE PASS v1: WREN wry-mentor voice; PACKRAT is a comic data-hoarding
 * magpie, now the market's best customer ("you left it out, I picked it up").
 * Teaching, ids, answers all unchanged.
 */

import Mission16Incident from "../incidents/Mission16Incident";
import type { MissionManifest } from "../engine/types";

export const mission16: MissionManifest = {
  id: "explorers-m16",
  caseNumber: "CASE 016",
  title: "Data Brokers",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "PACKRAT",
    mo: "Never breaks in. He's just the data market's best customer.",
    portrait: "/explorers/actors/packrat.png",
  },

  hook: "Companies keep a file on you and trade it like cards. Tonight you see yours, and shrink it.",
  scene: "/explorers/scenes/m16-cold-open.jpg",

  transmission: {
    headline: "LOT 47",
    lines: [
      "PACKRAT's biggest sale yet goes down tonight.",
      "What's for sale? A full file on one kid. Years of tiny clues.",
      "Not stolen. Collected, bit by bit. And mostly legal.",
      "Time you saw how this market works, from the inside.",
    ],
  },

  briefing: {
    summary:
      "Apps watch, collectors trade, your file grows. You beat it by cutting links, not by hiding.",
    objectives: [
      "See how your info gets sold",
      "Spy on your own trail",
      "Cut the links",
    ],
    wrenLine: "You can't erase every track, Agent. Just make the ones you leave worth reading.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the data economy */
    {
      id: "market",
      title: "The market for your info",
      concept: "Free apps sell what you do",
      promise: "You'll learn who buys the clues you leave.",
      instruction: "Pick the smart call on tracking.",
      intel: {
        beats: [
          "You already know: everything online leaves tracks.",
          "Here's the bigger-kid truth: those tracks get SOLD.",
          "Free apps have trackers that watch what you do.",
          "Collectors like PACKRAT buy those logs and build a file on you.",
          "That file follows you: ads, offers, and worse.",
          "A free app isn't a gift. You are what it sells.",
        ],
        prediction: {
          question: "How does a free game with no purchases make money?",
          options: [
            "It doesn't, it's just being kind",
            "It sells your attention and your habits",
            "The government pays for it",
          ],
          answer: 1,
          right: "Right. The game is the shop window. You're what's for sale.",
          wrong: "Servers cost money. If you don't pay with coins, you pay with your info.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the smart call on tracking.",
          situation:
            "A free game pops up: “Allow tracking across all your apps? It helps the game!”",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "allow",
              label: "Allow, it's only fair, the game is free",
              outcome:
                "Fair means knowing the price. Here it's hidden: your app list, your hours, your habits. A hidden price is the tell.",
            },
            {
              id: "decline",
              label: "Decline tracking, play the game, keep your info",
              correct: true,
              outcome:
                "Smart. The game still works. And one more page goes missing from your file.",
            },
            {
              id: "never",
              label: "Delete every free app forever",
              outcome:
                "You don't have to hide. You just trade on YOUR terms. Decline, check, decide.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A “collector” (a data broker) makes money by:",
            options: [
              "Fixing broken apps",
              "Buying your tracks and selling your file",
              "Deleting old accounts",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“Allow tracking?” really means:",
            options: [
              "Can we make the game better?",
              "Can we log what you do and sell it?",
              "Can we send fewer ads?",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: the self-audit */
    {
      id: "audit",
      title: "Check your own trail",
      concept: "The trick from Case 4, aimed at you",
      promise: "You'll hunt your own clues, the way a collector would.",
      instruction: "Pin the 4 loudest clues in your trail.",
      intel: {
        beats: [
          "In Case 4, you dug through Priya's trail.",
          "Tonight you do it to your OWN trail.",
          "Your test account's trail is on the board.",
          "Find the clues a collector would link up.",
          "This is the check real analysts run on themselves.",
          "Twice a year, for life. Starting now.",
        ],
        prediction: {
          question: "Why check your own trail like an attacker would?",
          options: [
            "To feel bad about old posts",
            "You can't fix clues you haven't found",
            "Because it's the law",
          ],
          answer: 1,
          right: "Right. The check is a map of what to fix. No map, no fixes.",
          wrong: "No shame in old clues, everyone has them. Find them so you can cut them.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Your trail is on the board. Pin the clues a collector would link.",
          fingerprintHint: "anything that links one account to another",
          cards: [
            {
              id: "t1",
              surface: "3 APPS",
              from: "your test account",
              text: "the same name everywhere: @nova_blazer_09",
              inCampaign: true,
              clue: "one name = one thread through every app",
              order: 1,
            },
            {
              id: "d1",
              surface: "GAME",
              from: "your test account",
              text: "a high score on the space shooter",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "PHOTOS",
              from: "your test account",
              text: "a park photo with the location tag left on",
              inCampaign: true,
              clue: "a map pin, given away free",
              order: 2,
            },
            {
              id: "t3",
              surface: "QUIZ POST",
              from: "your test account",
              text: "“my birth month + favourite animal = my hero name!”",
              inCampaign: true,
              clue: "a password answer, gift-wrapped",
              order: 3,
            },
            {
              id: "d2",
              surface: "FORUM",
              from: "your test account",
              text: "a question about level 12's boss",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "OLD APP",
              from: "age 9 you",
              text: "a forgotten account, still public, still using that name",
              inCampaign: true,
              clue: "a dead door nobody watches, except collectors",
              order: 4,
            },
          ],
          stage2Prompt: "Now chain them, the way a collector stitches a file",
          doneLine: "Name, pin, answer, dead door. Your file, mapped. Now we shrink it.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "How often should you check your own trail?",
            options: [
              "Once, ever",
              "Twice a year, for life",
              "Only after something goes wrong",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "The loudest clue in most trails is:",
            options: [
              "High scores",
              "The same name on every account",
              "Typos",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: curation */
    {
      id: "curation",
      title: "Clean up your trail",
      concept: "Cut links, close doors, leave good tracks",
      promise: "You'll shrink the file and choose what it says.",
      instruction: "Fill each slot with the choice that holds up.",
      intel: {
        beats: [
          "You can't delete the whole internet. Old news.",
          "But you CAN cut the links that make files valuable.",
          "Close dead accounts. Remove tags. Use different names.",
          "And here's the grown-up move:",
          "Leave GOOD tracks on purpose.",
          "The trail you choose is the story strangers read.",
        ],
        prediction: {
          question: "Why leave good tracks instead of posting nothing?",
          options: [
            "Silence looks suspicious",
            "Your trail is your story, so choose it",
            "Posting nothing is impossible",
          ],
          answer: 1,
          right: "Right. Coaches, schools, future you: the trail talks. Make it say what YOU pick.",
          wrong: "Hiding forever isn't the skill. A trail you're proud of is. You're the author.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench on. Time to harden your trail.",
          target: "YOUR CLEANED-UP TRAIL",
          slots: [
            {
              id: "dead",
              label: "SLOT 1: THE DEAD ACCOUNTS",
              options: [
                { id: "d1", label: "Leave them, they're harmless history", good: false, why: "Dead accounts get grabbed and linked. An old open door is a risk." },
                { id: "d2", label: "Close them properly, with a parent's help", good: true, why: "Every closed account is a page torn out of your file. Fewer doors, smaller file." },
                { id: "d3", label: "Just forget the passwords, same thing", good: false, why: "Forgotten isn't closed. It's still public, still linked, still collectable." },
              ],
            },
            {
              id: "live",
              label: "SLOT 2: THE ACCOUNTS YOU KEEP",
              options: [
                { id: "l1", label: "Make everything public, hiding is for people with secrets", good: false, why: "If it's all public, collectors grab it all. Private-first is smarter." },
                { id: "l2", label: "Private by default, location off, different names", good: true, why: "Links cut three ways at once. The file just fell apart." },
                { id: "l3", label: "Delete every account", good: false, why: "Vanishing isn't a plan when you have a life online. Clean up, don't disappear." },
              ],
            },
            {
              id: "good",
              label: "SLOT 3: THE TRACKS YOU LEAVE",
              options: [
                { id: "g1", label: "Post nothing, ever again", good: false, why: "An empty trail says nothing FOR you. The move is authorship, not silence." },
                { id: "g2", label: "Good tracks on purpose: the projects and wins you're proud of", good: true, why: "A trail you choose tells YOUR story to everyone who looks. Author it." },
                { id: "g3", label: "Post everything and let people judge", good: false, why: "Everything includes clues. Chosen means chosen. Choose." },
              ],
            },
          ],
          testLine: "STRESS TEST: COLLECTOR RE-SCAN … LINKS BROKEN. FILE VALUE: FALLING.",
          doneLine: "Doors closed, links cut, story chosen. The file shrinks; the trail shines.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "A forgotten account from years ago is:",
            options: [
              "Harmless nostalgia",
              "A dead door still feeding your file, close it",
              "Deleted automatically",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "The grown-up version of “be careful what you post” is:",
            options: [
              "Post nothing",
              "Clean up: cut bad links, leave good tracks",
              "Post only at night",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Auction",
    phases: 3,
    phaseNames: ["Read the lot", "Cut the links", "The gavel"],
    component: Mission16Incident,
  },

  debrief: {
    report: [
      "You saw the market from inside: apps watch, collectors stitch, files sell.",
      "Self-check done: name, pin, answer, dead door, all found and mapped.",
      "Clean-up ran: doors closed, links cut, good tracks left on purpose.",
    ],
    realWorldMove:
      "This week: check your privacy settings with a parent. Every app, one hour. Theirs will be worse than yours, so fix those too.",
    wrenLine: "File shrunk, links cut, story yours. The market moved on. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m16-transmission.mp3",
    briefing: "/audio/wren/m16-briefing.mp3",
    debrief: "/audio/wren/m16-debrief.mp3",
  },

  dossier: {
    mo: "The data market's best customer. Never breaks in, just buys the tracker logs and files you leave lying around, then links them into masterpieces. Same magpie, deeper pockets: you left it out, he bought it up.",
    defeatedBy: "Cut links: different names, private settings, closed doors. Plus good tracks on purpose.",
  },
};

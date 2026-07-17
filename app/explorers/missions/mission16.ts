/**
 * Mission 16 — "The File On You" (Block 4: The Long Game, ULTRA track).
 * Actor: PACKRAT ③. Map slot: curriculum-map-v1 §M16.
 *
 * Teaching register (ages 10–13): the data economy at kid scale —
 * "companies keep a file about you and trade it" (Heroes W12's
 * tracks-in-snow grown into the market for tracks). The self-audit
 * (M04's method turned formally on yourself), then curation:
 * cutting links, closing dead doors, and laying GOOD tracks on
 * purpose (agency, not hiding).
 */

import Mission16Incident from "../incidents/Mission16Incident";
import type { MissionManifest } from "../engine/types";

export const mission16: MissionManifest = {
  id: "explorers-m16",
  caseNumber: "CASE 016",
  title: "The File On You",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "PACKRAT",
    mo: "The data market's best customer.",
    portrait: "/explorers/actors/packrat.png",
  },

  hook: "Companies keep a file about you and trade it. Tonight you see yours — and shrink it.",
  scene: "/explorers/scenes/m16-cold-open.jpg",

  transmission: {
    headline: "LOT 47",
    lines: [
      "PACKRAT's biggest auction yet is tonight.",
      "The lot: a finished file on one student. Years of crumbs.",
      "Not stolen. COLLECTED. Traded. Perfectly legal, mostly.",
      "Time you saw the data market — from the inside.",
    ],
  },

  briefing: {
    summary:
      "Trackers watch, brokers trade, files grow. The counter-move is cutting links, not hiding.",
    objectives: [
      "See the data market",
      "Audit your own trail",
      "Cut the links",
    ],
    wrenLine: "You can't burn every track, Operative. Make the ones you keep worth following.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the data economy */
    {
      id: "market",
      title: "The market for tracks",
      concept: "Free apps sell your habits",
      promise: "You'll learn who buys the tracks you leave.",
      instruction: "Pick the deliberate call on tracking.",
      intel: {
        beats: [
          "Heroes taught you: everything online leaves tracks.",
          "Here's the older-kid truth: tracks get SOLD.",
          "Trackers inside free apps watch your habits.",
          "Brokers buy the logs and stitch them into files.",
          "The file follows you — as ads, offers, and worse.",
          "You're not the customer of a free app. You're the shipment.",
        ],
        prediction: {
          question: "How does a free game with no purchases make money?",
          options: [
            "It doesn't — it's charity",
            "It sells your attention and your habits",
            "Governments pay for it",
          ],
          answer: 1,
          right: "Right. The game is the shop window. The shipment is you.",
          wrong: "Servers cost money. If you're not paying with coins, you're paying with tracks.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the deliberate call on tracking.",
          situation:
            "A free game pops up: “Allow tracking across apps and websites? It helps support the game!”",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "allow",
              label: "Allow — it's only fair, the game is free",
              outcome:
                "Fair would be knowing WHAT you paid: your app list, your hours, your habits — logged, brokered, filed. The price was hidden; that's the tell.",
            },
            {
              id: "decline",
              label: "Decline tracking — play the game, keep the tracks",
              correct: true,
              outcome:
                "Deliberate. The game still runs; the shipment doesn't ship. Every decline is a page missing from the file.",
            },
            {
              id: "never",
              label: "Uninstall every free app forever",
              outcome:
                "The skill isn't hiding from the market — it's trading on YOUR terms. Decline, audit, decide. That's analyst-grade.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A data broker's job is:",
            options: [
              "Fixing broken apps",
              "Buying tracks and stitching them into files",
              "Deleting old accounts",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“Allow tracking?” is really asking:",
            options: [
              "Can we make the game better?",
              "Can we log your habits and trade them?",
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
      title: "Audit yourself",
      concept: "M04's method, turned on your own trail",
      promise: "You'll run the assembly attack on yourself — safely.",
      instruction: "Pin your 4 loudest crumbs. Then chain them.",
      intel: {
        beats: [
          "In CASE 004 you audited Priya's trail.",
          "Tonight the method comes home.",
          "Your test-account's trail is on the board.",
          "Find the crumbs a broker would link.",
          "This is the audit real analysts run on themselves.",
          "Twice a year, forever. Starting now.",
        ],
        prediction: {
          question: "Why audit YOUR OWN trail like an attacker would?",
          options: [
            "To feel bad about old posts",
            "You can't cut links you haven't found",
            "It's required by law",
          ],
          answer: 1,
          right: "Right. The audit is a map of what to fix. No map, no fixes.",
          wrong: "No shame in old crumbs — everyone has them. The audit finds them so you can cut them.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Self-audit board — pin the crumbs a broker would link",
          fingerprintHint: "anything that links one account to another",
          cards: [
            {
              id: "t1",
              surface: "3 APPS",
              from: "your test account",
              text: "the same handle, everywhere: @nova_blazer_09",
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
              text: "a park photo with the location tag still on",
              inCampaign: true,
              clue: "a map pin, donated free",
              order: 2,
            },
            {
              id: "t3",
              surface: "QUIZ POST",
              from: "your test account",
              text: "“my birth month + favorite animal = my superhero name!”",
              inCampaign: true,
              clue: "a security answer, gift-wrapped",
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
              text: "a forgotten account, still public, still linked to the handle",
              inCampaign: true,
              clue: "a dead door nobody's watching — except collectors",
              order: 4,
            },
          ],
          stage2Prompt: "Chain it like a broker — how the file gets stitched",
          doneLine: "Handle → pin → answer → dead door. Your file, mapped. Now we shrink it.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "The self-audit's schedule is:",
            options: [
              "Once, ever",
              "Twice a year, forever",
              "Only after something goes wrong",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "The loudest crumb in most trails is:",
            options: [
              "High scores",
              "The same handle linking every account",
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
      title: "Curate the trail",
      concept: "Cut links, close doors, lay good tracks",
      promise: "You'll shrink the file and choose what it says.",
      instruction: "Fill each slot with the part that holds.",
      intel: {
        beats: [
          "You can't delete the internet. Old news.",
          "You CAN cut the links that make files valuable.",
          "Close dead accounts. Untag. De-locate. Vary handles.",
          "And here's the Heroes W12 move, grown up:",
          "Lay GOOD tracks on purpose.",
          "The trail you curate is the story strangers read.",
        ],
        prediction: {
          question: "Why lay good tracks instead of posting nothing?",
          options: [
            "Silence looks suspicious",
            "Your trail is your story — curated beats empty",
            "Posting nothing is impossible",
          ],
          answer: 1,
          right: "Right. Coaches, schools, future you — the trail speaks. Make it say what YOU choose.",
          wrong: "Hiding forever isn't the skill. A deliberate, proud trail is. You're the author.",
        },
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Workbench live — the privacy hardening pass",
          target: "YOUR CURATED TRAIL",
          slots: [
            {
              id: "dead",
              label: "SLOT 1 — THE DEAD ACCOUNTS",
              options: [
                { id: "d1", label: "Leave them — they're harmless history", good: false, why: "Dead doors get claimed, scraped, and linked. History with a working lock is a liability." },
                { id: "d2", label: "Close them properly, with a parent's help", good: true, why: "Every closed account is a page torn out of the file. Fewer doors, smaller file." },
                { id: "d3", label: "Just forget the passwords — same thing", good: false, why: "Forgotten isn't closed. The account is still public, still linked, still collectible." },
              ],
            },
            {
              id: "live",
              label: "SLOT 2 — THE LIVE PROFILES",
              options: [
                { id: "l1", label: "Public everything — hiding is for people with secrets", good: false, why: "Public-by-default is broker-food. Private-by-default with chosen exceptions is curation." },
                { id: "l2", label: "Private by default, location tags off, handles varied", good: true, why: "Links cut on all three axes. The file's stitching just came undone." },
                { id: "l3", label: "Delete every profile", good: false, why: "Scorched earth isn't a strategy for someone with a life online. Curate, don't vanish." },
              ],
            },
            {
              id: "good",
              label: "SLOT 3 — THE TRACKS YOU KEEP",
              options: [
                { id: "g1", label: "Post nothing, ever again", good: false, why: "An empty trail says nothing FOR you. The W12 move is authorship, not silence." },
                { id: "g2", label: "Deliberate good tracks — the projects and wins you're proud of", good: true, why: "The curated trail tells YOUR story to every future reader. Author it." },
                { id: "g3", label: "Post everything and let people judge", good: false, why: "Everything includes crumbs. Deliberate means chosen. Choose." },
              ],
            },
          ],
          testLine: "STRESS TEST: BROKER RE-SCAN … LINKS BROKEN. FILE VALUE: FALLING.",
          doneLine: "Doors closed, links cut, story authored. The file shrinks; the trail shines.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "A forgotten account from years ago is:",
            options: [
              "Harmless nostalgia",
              "A dead door still feeding the file — close it",
              "Automatically deleted",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "The grown-up version of “be careful what you post” is:",
            options: [
              "Post nothing",
              "Curate: cut bad links, lay good tracks",
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
      "The market seen from inside: trackers watch, brokers stitch, files trade.",
      "Self-audit complete: handle, pin, answer, dead door — all found, all mapped.",
      "The hardening pass ran: doors closed, links cut, good tracks laid on purpose.",
    ],
    realWorldMove:
      "This week: run a privacy-settings audit with a parent — every app, one hour. And yes, their settings will be worse than yours. Fix theirs too.",
    wrenLine: "File shrunk, links cut, story yours. The market moved on. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m16-transmission.mp3",
    briefing: "/audio/wren/m16-briefing.mp3",
    debrief: "/audio/wren/m16-debrief.mp3",
  },

  dossier: {
    mo: "The data market's best customer: buys tracker logs and broker files, links them into masterpieces.",
    defeatedBy: "Cut links — varied handles, private defaults, closed doors — and good tracks laid on purpose.",
  },
};

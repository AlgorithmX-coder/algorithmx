/**
 * Mission 17 — "Ghost Stories" (Block 4: The Long Game, ULTRA track).
 * Actor: GHOSTWRITER ③. Map slot: curriculum-map-v1 §M17.
 *
 * Teaching register (ages 10–13): synthetic everything — images,
 * screenshots, reviews made to order; the provenance question ("who
 * benefits if I believe this?"). Lateral reading as a workflow
 * (Heroes W15's "AI can be wrong" grown up), and AI in your corner —
 * useful for leads while knowing it confidently lies.
 *
 * Safety canon: SIMULATE predicts which claims get attacked next.
 * The child never authors a fake.
 */

import Mission17Incident from "../incidents/Mission17Incident";
import type { MissionManifest } from "../engine/types";

export const mission17: MissionManifest = {
  id: "explorers-m17",
  caseNumber: "CASE 017",
  title: "Ghost Stories",
  block: 4,
  classification: "ULTRA",
  actor: {
    codename: "GHOSTWRITER",
    mo: "Manufactures believable things. Friends deliver them.",
    portrait: "/explorers/actors/ghostwriter.png",
  },

  hook: "A screenshot can be typed in ten seconds. Today one rips through your school. Stop it.",
  scene: "/explorers/scenes/m17-cold-open.jpg",

  transmission: {
    headline: "THE MILL TURNS",
    lines: [
      "A screenshot is tearing through the school group chats.",
      "It looks completely real. Screenshots always do.",
      "This one was typed, not taken.",
      "Trace it. Break it. Still the mill — kindly.",
    ],
  },

  briefing: {
    summary:
      "Anything can be made to order now. The question is never “does it look real” — it's “who benefits”.",
    objectives: [
      "Ask who benefits",
      "Read laterally",
      "Contain without amplifying",
    ],
    wrenLine: "Check in a second tab, Operative. The first one belongs to the storyteller.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: synthetic everything */
    {
      id: "synthetic",
      title: "Made to order",
      concept: "Images, screenshots, reviews — all manufacturable",
      promise: "You'll learn the question that beats every fake.",
      instruction: "Tap the 3 manufactured items in the evidence set.",
      intel: {
        beats: [
          "Photos used to be proof. Screenshots used to be proof.",
          "Now they're PRODUCTS. Made to order, in seconds.",
          "So looking harder is a dead end.",
          "Ask the provenance question instead:",
          "WHO BENEFITS if I believe this?",
          "Fakes always have a customer. Find the customer.",
        ],
        prediction: {
          question: "A “screenshot” of a celebrity's post proves:",
          options: [
            "The celebrity posted it",
            "Someone typed a screenshot-shaped image",
            "It's real if it's high resolution",
          ],
          answer: 1,
          right: "Right. A screenshot is pixels arranged like a post. Ten seconds' work.",
          wrong: "Screenshots are typed in any editor. Resolution measures effort, not truth.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 manufactured items in the evidence set.",
          device: { app: "EVIDENCE SET", owner: "ARC RANGE · TODAY'S CATCH" },
          header: [
            { label: "SET:", seg: { id: "set", text: "four items pulled from the school's feeds today" } },
          ],
          body: [
            [{ id: "s1", text: "“Screenshot”: a footballer announcing he hates his own club", tellId: "shot" }],
            [{ id: "s2", text: "A gadget with 400 five-star reviews — all posted on launch day", tellId: "reviews" }],
            [{ id: "s3", text: "The school's newsletter PDF about the bake sale" }],
            [{ id: "s4", text: "A “leaked photo” of next year's console — six fingers on the hand holding it", tellId: "image" }],
          ],
          tells: [
            {
              id: "shot",
              label: "The typed screenshot",
              why: "Who benefits? Rage clicks. Screenshots are claims, never proof.",
            },
            {
              id: "reviews",
              label: "The review flood",
              why: "400 delighted strangers in one day — reviews are bought by the bucket.",
            },
            {
              id: "image",
              label: "The impossible photo",
              why: "Six fingers today; flawless next month. Artifacts decay — provenance doesn't.",
            },
          ],
          doneLine: "Three products, one real document. The tell that lasts: who benefits.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "The question that beats every fake:",
            options: [
              "Does it look real?",
              "Who benefits if I believe this?",
              "How many likes does it have?",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "400 five-star reviews on launch day means:",
            options: [
              "An amazing product",
              "Reviews bought by the bucket",
              "Fast typers",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: lateral reading */
    {
      id: "lateral",
      title: "The second tab",
      concept: "Verify claims outside the page that makes them",
      promise: "You'll trace a viral claim back to its empty source.",
      instruction: "Pin the 4 links of the claim's chain. Then order.",
      intel: {
        beats: [
          "Here's how fact-checkers actually read.",
          "Not deeper into the page. SIDEWAYS, out of it.",
          "The page vouching for itself proves nothing.",
          "Open a second tab. Search the claim.",
          "Does anyone REAL report it? That's the whole test.",
          "Lateral reading: ten seconds, kills most fakes.",
        ],
        prediction: {
          question: "A shocking claim appears on a site you've never heard of. First move?",
          options: [
            "Read the site's About page",
            "Open a new tab and search the claim itself",
            "Check how professional the site looks",
          ],
          answer: 1,
          right: "Right. Leave the page. The claim gets checked in the world, not in its own house.",
          wrong: "About pages and design are the storyteller's territory. Check the claim OUTSIDE it.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Claim chain — pin how the rumor really traveled",
          fingerprintHint: "each link points at where the claim CAME from",
          cards: [
            {
              id: "t1",
              surface: "GROUP CHAT",
              from: "everywhere",
              text: "the viral post: “GameHub SHUTS DOWN TOMORROW — save your skins NOW!”",
              inCampaign: true,
              clue: "the claim, at full speed",
              order: 1,
            },
            {
              id: "d1",
              surface: "GROUP CHAT",
              from: "Leo",
              text: "does anyone have the maths homework",
              inCampaign: false,
            },
            {
              id: "t2",
              surface: "FIRST POST",
              from: "@gaming_truth_daily",
              text: "the account that posted it first — created two days ago",
              inCampaign: true,
              clue: "a newborn account with one viral hit",
              order: 2,
            },
            {
              id: "t3",
              surface: "CITED SOURCE",
              from: "the post's link",
              text: "“gamer-news-central.net” — registered last week, no other articles",
              inCampaign: true,
              clue: "a source built to be cited once",
              order: 3,
            },
            {
              id: "d2",
              surface: "CHAT",
              from: "Maya",
              text: "team call moved to 7 tonight",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "SECOND TAB",
              from: "lateral search",
              text: "no real outlet, no official post, nothing — the claim exists only in its own echo",
              inCampaign: true,
              clue: "the lateral read: silence where news should be",
              order: 4,
            },
          ],
          stage2Prompt: "Order the chain — from viral roar back to empty source",
          doneLine: "Claim → newborn account → cardboard source → silence. Ten seconds of sideways reading.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Lateral reading means:",
            options: [
              "Reading the whole page carefully",
              "Checking the claim in a second tab, outside the page",
              "Reading lying down",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "A real, big story will always have:",
            options: [
              "The best headline",
              "More than one real outlet reporting it",
              "A countdown",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: AI in your corner */
    {
      id: "aicorner",
      title: "The confident liar",
      concept: "AI helps you check — and confidently lies",
      promise: "You'll predict the mill's next move — and AI's limits.",
      instruction: "Predict the next move. Three rounds.",
      intel: {
        beats: [
          "Last tool on the bench: AI itself.",
          "Great for leads. Fast for summaries.",
          "And it lies with PERFECT confidence.",
          "Same warm tone when it's right and when it's wrong.",
          "Rule: AI gives you threads to pull, never verdicts.",
          "Verdicts come from sources. Always.",
        ],
        prediction: {
          question: "An AI chatbot says a rumor is “definitely true.” That confidence is:",
          options: [
            "Proof it checked",
            "Style, not evidence — it sounds identical when wrong",
            "A legal guarantee",
          ],
          answer: 1,
          right: "Right. Confidence is its writing style, not its homework.",
          wrong: "It has one tone: certain. Certainty from an AI is font, not fact.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback — predict the mill's next targets",
          steps: [
            {
              scene:
                "The shutdown rumor got 3,000 shares before lunch. GHOSTWRITER's mill is warm. What rolls out next?",
              question: "what's the next fake?",
              options: [
                "A correction apologizing for the rumor",
                "Something juicier — a fake screenshot of a TEACHER saying something awful",
                "A maths worksheet",
              ],
              answer: 1,
              reveal:
                "Drama is fuel. The mill escalates from games to PEOPLE — a teacher, a classmate. Bigger feelings, faster shares.",
            },
            {
              scene:
                "Two candidate fakes on GHOSTWRITER's bench: “school adds five minutes to lunch” vs “year 8 student cheated in the tournament”.",
              question: "which one does he print?",
              options: [
                "The lunch one — everyone loves lunch",
                "The cheating one — outrage travels, boring doesn't",
                "Both equally",
              ],
              answer: 1,
              reveal:
                "Fakes are chosen for FEELINGS-per-share. Outrage and betrayal outrun mild good news every time. That's the targeting rule.",
            },
            {
              scene:
                "You ask an AI chatbot: “Is the cheating story real?” It answers instantly, warmly, certainly.",
              question: "what's the right use of that answer?",
              options: [
                "Trust it — it sounded very sure",
                "Take its leads, then verify by source in a second tab",
                "Ask it again until it changes its mind",
              ],
              answer: 1,
              reveal:
                "It named two threads worth pulling — and invented a third that doesn't exist. Leads, never verdicts. The second tab decides.",
            },
          ],
          doneLine: "TARGETS PREDICTED, LIMITS KNOWN. THE MILL CAN'T SURPRISE YOU — AND NEITHER CAN THE CHATBOT.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The mill picks its fakes by:",
            options: [
              "Alphabetical order",
              "Feelings-per-share — outrage travels",
              "Whatever's true",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "AI's right job in fact-checking:",
            options: [
              "Final judge",
              "Lead generator — the second tab decides",
              "No job at all",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Rumor Mill",
    phases: 3,
    phaseNames: ["Find the source", "Break the claim", "Still the mill"],
    component: Mission17Incident,
  },

  debrief: {
    report: [
      "Three manufactured items caught by one question: who benefits.",
      "The viral claim traced sideways to a newborn account and a cardboard source.",
      "The mill stilled kindly — no shame, no amplification, truth intact.",
    ],
    realWorldMove:
      "This week: lateral-read one viral thing before sharing it — new tab, search the claim, see if anyone real reports it. Ten seconds. Every skipped share counts.",
    wrenLine: "Mill stilled, nobody shamed, truth intact. That's analyst work. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m17-transmission.mp3",
    briefing: "/audio/wren/m17-briefing.mp3",
    debrief: "/audio/wren/m17-debrief.mp3",
  },

  dossier: {
    mo: "Manufactures believable things — screenshots, reviews, rumors. Your friends do the delivery.",
    defeatedBy: "Lateral readers who ask who benefits, and contain kindly instead of forwarding.",
  },
};

/**
 * Mission 10 — "The Voice" (Block 2: The Human Factor — BLOCK FINALE).
 * Actor: MIMIC ②. Map slot: curriculum-map-v1 §M10.
 *
 * Teaching register (ages 10–13): voice cloning (seconds of audio is
 * enough — the landing page's promise, delivered), deepfake tells AND
 * why tells decay (the durable defense is verification, not
 * spotting), and THE FAMILY CODE WORD — the course's single most
 * valuable take-home. Ends Block 2: SECRET clearance confirmed.
 *
 * Season arc — breadcrumb ③: the clone trained on audio PACKRAT
 * scraped, reading lines GHOSTWRITER wrote. Three actors, one
 * supply chain.
 */

import Mission10Incident from "../incidents/Mission10Incident";
import type { MissionManifest } from "../engine/types";

export const mission10: MissionManifest = {
  id: "explorers-m10",
  caseNumber: "CASE 010",
  title: "Voice Clone",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Clones voices from seconds of audio.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "A voice you love asks for help. Voices can be copied now. Your family needs a code word.",
  scene: "/explorers/scenes/m10-cold-open.jpg",

  transmission: {
    headline: "VOICE PRINT ALERT",
    lines: [
      "Tonight's threat sounds like someone you love.",
      "A phone call, in a voice you know by heart.",
      "Except nobody you love is on the line.",
      "Seconds of audio is all a clone needs now.",
    ],
  },

  briefing: {
    summary:
      "MIMIC's upgrade: cloned voices, faked faces. Spotting fails eventually. Verification never does.",
    objectives: [
      "Hear how cloning works",
      "Watch the tells decay",
      "Set the family code word",
    ],
    wrenLine: "Trust the protocol over your own ears, Operative. Tonight, that's the skill.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the cloned call */
    {
      id: "clone",
      title: "The borrowed voice",
      concept: "Seconds of audio make a perfect copy",
      promise: "You'll hear how a cloned call plays out.",
      instruction: "Predict the clone's next move. Three rounds.",
      intel: {
        beats: [
          "How much audio does a voice clone need?",
          "Not hours. Seconds.",
          "One birthday video. One school assembly clip.",
          "The copy laughs like her. Pauses like her.",
          "Your ears will say it's really her.",
          "Your ears are wrong. Into the simulator.",
        ],
        prediction: {
          question: "Where would a cloner get seconds of a parent's voice?",
          options: [
            "Breaking into the phone company",
            "Public videos: birthdays, sports day, group chats",
            "You can't get voices online",
          ],
          answer: 1,
          right: "Right. The training data was posted as memories.",
          wrong: "No break-in needed. Family videos online carry all the voice a clone needs.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback: a cloned call, move by move",
          steps: [
            {
              scene:
                "(a voice EXACTLY like mum's, shaky) “Sweetheart? It's mum. My phone broke, I'm on a friend's phone. Something's happened.”",
              question: "what's the next move?",
              options: [
                "A calm chat about your day",
                "Build urgency: a crisis with a clock on it",
                "Hang up on you",
              ],
              answer: 1,
              reveal:
                "“I need you to do something RIGHT NOW. There's no time to explain.” Urgency first, always. Thinking is the clone's enemy.",
            },
            {
              scene:
                "“The bank needs the code that just went to your phone. Read it to me quick, before it expires. Please, love.”",
              question: "what is the clone really after?",
              options: [
                "The 6-digit code: a key to an account",
                "A nice long chat",
                "Your homework answers",
              ],
              answer: 0,
              reveal:
                "Always the code, the money, or the secret. The voice is brand new technology. The ask is ancient.",
            },
            {
              scene:
                "You hesitate. The voice goes soft and hurt: “Darling… it's ME. Don't you recognize me?”",
              question: "what's really happening?",
              options: [
                "The recognition trap: ears can't verify anymore",
                "It's definitely her now",
                "The call is ending",
              ],
              answer: 0,
              reveal:
                "That line lands because it always used to be true. Ears verified people for a million years. Machines just broke that. Protocol replaces ears.",
            },
          ],
          doneLine: "URGENCY, THE ASK, THE RECOGNITION TRAP. NEW VOICE, ANCIENT CON.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "How much audio does a voice clone need?",
            options: [
              "Hours of clean speeches",
              "Seconds: one birthday video is plenty",
              "It isn't possible yet",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“Don't you recognize me?” works because:",
            options: [
              "Not recognizing family is rude",
              "Ears used to be proof, machines broke that",
              "It's a trick question",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: tells that decay */
    {
      id: "tells",
      title: "The fading tells",
      concept: "Spotting decays; verification doesn't",
      promise: "You'll learn which fake-spotting clues actually last.",
      instruction: "Tap the 3 tells in this video call.",
      intel: {
        beats: [
          "Deepfake video has tells. Today.",
          "Mouths that lag the words. Jewelry that flickers.",
          "Here's the honest part: those tells DECAY.",
          "Every month, the fakes get cleaner.",
          "One tell never decays: what the caller ASKS for.",
          "Spot with your eyes today. Verify with protocol forever.",
        ],
        prediction: {
          question: "Why can't we just learn to spot deepfakes forever?",
          options: [
            "We can, eyes always win",
            "The tells decay as the fakes improve",
            "Deepfakes are already illegal",
          ],
          answer: 1,
          right: "Right. Today's glitch is next month's patch. Build on what doesn't decay.",
          wrong: "Eyes lose this race. The fakes improve monthly. The ASK is the tell that stays.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 tells in this video call.",
          device: { app: "VIDEO CALL", owner: "CAPTURED FRAME · ARC ANALYSIS" },
          header: [
            { label: "CALLER:", seg: { id: "caller", text: "“Auntie Rosa” · surprise call, urgent tone" } },
          ],
          body: [
            [{ id: "t1", text: "Her mouth lands a beat behind the words", tellId: "sync" }],
            [{ id: "t2", text: "Her earring flickers when she turns her head", tellId: "artifact" }],
            [{ id: "t3", text: "She's asking you to read out a login code", tellId: "ask" }],
            [{ id: "t4", text: "The kitchen behind her looks like her real kitchen" }],
          ],
          tells: [
            {
              id: "sync",
              label: "Mouth lag",
              why: "Today's tell. Next year's models will fix it. A clue, not proof.",
            },
            {
              id: "artifact",
              label: "Flicker glitch",
              why: "Glitches fade too. Every update cleans them up.",
            },
            {
              id: "ask",
              label: "The ask",
              why: "The forever-tell. Codes, money, secrets: no update removes the ask.",
            },
          ],
          doneLine: "Two fading tells, one forever-tell. Bank on the forever one.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Deepfake tells like lag and flicker are:",
            options: [
              "Reliable forever",
              "Clues that decay as models improve",
              "Urban legends",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "The tell that NEVER decays:",
            options: [
              "Bad lighting",
              "The ask: codes, money, secrets",
              "Weird blinking",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: the code word */
    {
      id: "codeword",
      title: "The family code word",
      concept: "One rehearsed phrase beats every clone",
      promise: "You'll build the check no machine can copy.",
      instruction: "Pick the code-word system that holds.",
      intel: {
        beats: [
          "Now the best defense this course will ever hand you.",
          "The family code word.",
          "A phrase only your family knows.",
          "Never typed. Never posted. Rehearsed once.",
          "Any emergency call, any voice: ask for the word.",
          "Real family answers or laughs. Clones go quiet.",
        ],
        prediction: {
          question: "Why does a code word beat a perfect voice clone?",
          options: [
            "Clones can't speak twice",
            "The clone copied a voice, not a secret that never went online",
            "It doesn't, really",
          ],
          answer: 1,
          right: "Exactly. Clones are built from what's online. The word never was.",
          wrong: "The clone knows everything ever posted. The code word never was posted. That's the wall.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the code-word system that holds.",
          situation:
            "Family meeting. You're the analyst now. You set the family's emergency check.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "pet",
              label: "Use the dog's name, everyone remembers it",
              outcome:
                "Biscuit is in forty of your family's posts. A word that ever went online isn't a code word. It's training data.",
            },
            {
              id: "silly",
              label: "A silly private phrase, never typed anywhere, rehearsed once",
              correct: true,
              outcome:
                "Perfect. Never posted, easy to remember, impossible to scrape. One practice run at dinner. Every clone on earth is locked out of your family.",
            },
            {
              id: "bio",
              label: "Write it in everyone's bio so nobody forgets it",
              outcome:
                "Public defeats the point. PACKRAT reads bios for a living. The word lives in heads, nowhere else.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The best family code word is:",
            options: [
              "Your pet's name",
              "A silly phrase never posted anywhere",
              "Your house number",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "A REAL family member hears the code-word question and:",
            options: [
              "Gets angry and hangs up",
              "Answers easily, or laughs at you",
              "Asks what a code word is",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "Caller ID",
    phases: 3,
    phaseNames: ["The call", "The wobble", "The trace"],
    component: Mission10Incident,
  },

  debrief: {
    report: [
      "One cloned call survived: urgency named, ask refused, recognition trap seen through.",
      "The fading tells filed as clues. The forever-tell, the ask, banked as proof.",
      "Family code word designed and rehearsed. Block Two closed: SECRET clearance confirmed.",
    ],
    realWorldMove:
      "This week, with your family: set the code word. A silly phrase nobody ever posted. Rehearse it once at dinner. It beats every clone ever made.",
    wrenLine: "Block Two closed. SECRET clearance, confirmed. Go give your family the code word, Operative.",
    },

  voice: {
    transmission: "/audio/wren/m10-transmission.mp3",
    briefing: "/audio/wren/m10-briefing.mp3",
    debrief: "/audio/wren/m10-debrief.mp3",
  },

  dossier: {
    mo: "Clones voices from seconds of audio and faces from photos. Sounds exactly like love.",
    defeatedBy: "The family code word, and calling the real number back.",
    breadcrumb:
      "TRACE: the clone trained on audio PACKRAT scraped, reading lines GHOSTWRITER wrote. Three actors, one supply chain, all routing through ZERO. Filed as breadcrumb ③.",
  },
};

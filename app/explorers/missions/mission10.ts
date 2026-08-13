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
 *
 * VOICE PASS v1: WREN wry-mentor voice; MIMIC is a vain, faceless
 * copycat who now wears voices too. Teaching, ids, answers all
 * unchanged; scam-call scenes kept realistic on purpose.
 */

import Mission10Incident from "../incidents/Mission10Incident";
import type { MissionManifest } from "../engine/types";

export const mission10: MissionManifest = {
  id: "explorers-m10",
  caseNumber: "CASE 010",
  title: "Vishing",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "MIMIC",
    mo: "Clones any voice from seconds of audio. Sounds exactly like someone you love.",
    portrait: "/explorers/actors/mimic.png",
  },

  hook: "A voice you love calls, begging for help. Voices can be copied now. Your family needs a code word.",
  scene: "/explorers/scenes/m10-cold-open.jpg",

  transmission: {
    headline: "VOICE PRINT ALERT",
    lines: [
      "Tonight's threat sounds exactly like someone you love.",
      "A phone call, in a voice you know by heart. Every wobble, every laugh.",
      "Except nobody you love is on the line. It's MIMIC, wearing a voice.",
      "“Do I sound like someone you trust?” Seconds of audio is all his clone needs now.",
    ],
  },

  briefing: {
    summary:
      "MIMIC's newest costume is a voice. Cloned calls, faked faces. Spotting the fake fails eventually. Verifying the source never does.",
    objectives: [
      "Hear how voice cloning works",
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
          "How much audio does MIMIC need to clone a voice?",
          "Not hours. Seconds.",
          "One birthday video. One clip from the school assembly. Done.",
          "The copy laughs like her. Pauses like her. Nails the little sigh.",
          "Your ears will swear it's really her.",
          "Your ears are wrong tonight. Into the simulator.",
        ],
        prediction: {
          question: "Where would MIMIC get seconds of a parent's voice?",
          options: [
            "By breaking into the phone company",
            "Public videos: birthdays, sports day, group chats",
            "You can't get voices online at all",
          ],
          answer: 1,
          right: "Right. The training data got posted as happy memories.",
          wrong: "No break-in needed. Family videos online hand a clone all the voice it needs.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback: one cloned call, move by move",
          steps: [
            {
              scene:
                "(a voice EXACTLY like mum's, shaky) “Sweetheart? It's mum. My phone broke, I'm on a friend's phone. Something's happened.”",
              question: "what's the next move?",
              options: [
                "A calm chat about your day",
                "Build urgency: a crisis with a clock ticking on it",
                "Just hang up on you",
              ],
              answer: 1,
              reveal:
                "“I need you to do something RIGHT NOW. There's no time to explain.” Urgency first, always. Thinking is the clone's worst enemy.",
            },
            {
              scene:
                "“The bank needs the code that just went to your phone. Read it to me quick, before it expires. Please, love.”",
              question: "what is the clone really after?",
              options: [
                "The 6-digit code: it's a key to an account",
                "A nice long chat",
                "Your homework answers",
              ],
              answer: 0,
              reveal:
                "Always the code, the money, or the secret. The voice is shiny new tech. The ask is ancient.",
            },
            {
              scene:
                "You hesitate. The voice goes soft and hurt: “Darling… it's ME. Don't you recognize me?”",
              question: "what's really happening?",
              options: [
                "The recognition trap: ears can't verify a voice anymore",
                "It's definitely her now",
                "The call is about to end",
              ],
              answer: 0,
              reveal:
                "That line lands because it always used to be true. Ears verified people for a million years. Machines just broke that. Protocol takes over from ears.",
            },
          ],
          doneLine: "URGENCY, THE ASK, THE RECOGNITION TRAP. NEW VOICE, ANCIENT CON.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "How much audio does a voice clone actually need?",
            options: [
              "Hours of clean speeches",
              "Seconds: one birthday video is plenty",
              "It still isn't possible",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“Don't you recognize me?” works because:",
            options: [
              "Not recognizing family feels rude",
              "Ears used to be proof, and machines broke that",
              "It's just a trick question",
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
          "Deepfake video has tells. For now.",
          "Mouths that lag the words. Earrings that flicker.",
          "Here's the honest bit: those tells DECAY.",
          "Every month, MIMIC's fakes get a little cleaner.",
          "One tell never decays: what the caller ASKS you for.",
          "Spot with your eyes today. Verify with protocol forever.",
        ],
        prediction: {
          question: "Why can't we just learn to spot deepfakes and be done forever?",
          options: [
            "We can, eyes always win",
            "The tells decay as the fakes keep improving",
            "Deepfakes are already illegal",
          ],
          answer: 1,
          right: "Right. Today's glitch is next month's patch. Build on what doesn't decay.",
          wrong: "Eyes lose this race. The fakes get better every month. The ASK is the tell that stays put.",
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
              why: "Today's tell. Next year's models patch it out. A clue, not proof.",
            },
            {
              id: "artifact",
              label: "Flicker glitch",
              why: "Glitches fade too. Every update scrubs a few away.",
            },
            {
              id: "ask",
              label: "The ask",
              why: "The forever-tell. Codes, money, secrets: no update ever removes the ask.",
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
              "Clues that decay as the models improve",
              "Just urban legends",
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
          "Now, the best defense this whole course will ever hand you.",
          "The family code word.",
          "A phrase only your family knows, and nobody else.",
          "Never typed. Never posted. Just rehearsed once out loud.",
          "Any emergency call, any voice, no matter how perfect: ask for the word.",
          "Real family answers, or laughs at you. MIMIC's clone goes dead quiet.",
        ],
        prediction: {
          question: "Why does one code word beat a flawless voice clone?",
          options: [
            "Clones can't talk twice",
            "MIMIC copied a voice, not a secret that never went online",
            "It doesn't, honestly",
          ],
          answer: 1,
          right: "Exactly. Clones are built from what's online. The word never was.",
          wrong: "MIMIC knows everything ever posted. The code word was never posted. That's the wall he can't climb.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the code-word system that holds.",
          situation:
            "Family meeting, and you're the analyst in the room. You set the family's emergency check.",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "pet",
              label: "Use the dog's name, everyone remembers it",
              outcome:
                "Biscuit shows up in forty of your family's posts. Any word that ever went online isn't a code word. It's training data for MIMIC.",
            },
            {
              id: "silly",
              label: "A silly private phrase, never typed anywhere, rehearsed once",
              correct: true,
              outcome:
                "Perfect. Never posted, easy to remember, impossible to scrape. One practice run at dinner and every clone on earth is locked out of your family.",
            },
            {
              id: "bio",
              label: "Write it in everyone's bio so nobody forgets it",
              outcome:
                "Public defeats the whole point. PACKRAT reads bios for a living. The word lives in your heads and nowhere else.",
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
              "Answers it easily, or laughs at you",
              "Asks what a code word even is",
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
      "One cloned call survived: urgency named, the ask refused, the recognition trap seen straight through.",
      "Fading tells filed as clues. The forever-tell, the ask, banked as proof.",
      "Family code word designed and rehearsed. Block Two closed: SECRET clearance confirmed.",
    ],
    realWorldMove:
      "This week, with your family: set your code word. A silly phrase nobody ever posted online. Rehearse it once at dinner. It beats every clone ever made.",
    wrenLine: "Block Two closed. SECRET clearance, confirmed. Go give your family the code word, Operative.",
    },

  voice: {
    transmission: "/audio/wren/m10-transmission.mp3",
    briefing: "/audio/wren/m10-briefing.mp3",
    debrief: "/audio/wren/m10-debrief.mp3",
  },

  dossier: {
    mo: "Clones voices from seconds of audio and faces from a few photos. Sounds exactly like someone you love. Never actually is.",
    defeatedBy: "The family code word, and calling the real number back yourself. A copycat can't fake a secret he was never told.",
    breadcrumb:
      "TRACE: the clone trained on audio PACKRAT scraped, reading lines GHOSTWRITER wrote. Three actors, one supply chain, all routing through ZERO. Filed as breadcrumb ③.",
  },
};

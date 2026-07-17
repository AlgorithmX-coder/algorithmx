/**
 * Mission 06 — "Levers" (Block 2: The Human Factor, SECRET track).
 * Actor: SIREN ②. SIMULATE debuts. Map slot: curriculum-map-v1 §M06.
 *
 * Teaching register (ages 10–13): the tier's core mental model — the
 * six pressure levers (hurry, scarcity, authority, liking, fear,
 * payback). Attackers aim at brains, not machines. Anticipation is
 * defense (SIMULATE), and naming the lever out loud kills it.
 */

import Mission06Incident from "../incidents/Mission06Incident";
import type { MissionManifest } from "../engine/types";

export const mission06: MissionManifest = {
  id: "explorers-m06",
  caseNumber: "CASE 006",
  title: "Levers",
  block: 2,
  classification: "SECRET",
  actor: {
    codename: "SIREN",
    mo: "Doesn't hack machines. Pulls levers in brains.",
    portrait: "/explorers/actors/siren.png",
  },

  hook: "Every scam pulls one of six levers. Learn all six and you're armored.",
  scene: "/explorers/scenes/m06-cold-open.jpg",

  transmission: {
    headline: "NEW CLEARANCE — NEW GAME",
    lines: [
      "Block Two, Operative. The machines were the warm-up.",
      "SIREN's real target has always been a brain.",
      "She pulls levers: feelings that make people click.",
      "There are six. Tonight you learn them all.",
    ],
  },

  briefing: {
    summary:
      "Six levers move almost every con on earth. Learn the board.",
    objectives: [
      "Name the six levers",
      "Predict the next pull",
      "Call it out — and kill it",
    ],
    wrenLine: "Feelings aren't weaknesses, Operative. Unnamed ones are.",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: the lever board */
    {
      id: "board",
      title: "The six levers",
      concept: "Pressure comes in six flavors",
      promise: "You'll learn the six feelings every scam pulls.",
      instruction: "Tap the 3 levers hiding in this chat.",
      intel: {
        beats: [
          "HURRY: act now, think never.",
          "SCARCITY: only two left.",
          "AUTHORITY: I'm in charge, obey.",
          "LIKING: we're friends, right?",
          "FEAR: or something bad happens.",
          "PAYBACK: I helped you — now you owe me.",
        ],
        prediction: {
          question: "Why levers instead of hacking the machine?",
          options: [
            "Machines are impossible to hack",
            "A pushed brain opens doors no hack can",
            "Levers are more polite",
          ],
          answer: 1,
          right: "Right. Why pick a lock when the owner will open it for you?",
          wrong: "Machines have patches. Brains have buttons. SIREN pushes buttons.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Tap the 3 levers hiding in this chat.",
          device: { app: "GROUP CHAT", owner: "CAPTURED CON · RANGE COPY" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "“TournamentMod_Kai” — joined the server yesterday" } },
          ],
          body: [
            [{ id: "l1", text: "yo! tournament slots close in 20 minutes", tellId: "hurry" }],
            [{ id: "l2", text: "only 3 spots left for your whole school", tellId: "scarcity" }],
            [{ id: "l3", text: "I'm a mod, I can hold one — but I need your login to lock it in", tellId: "authority" }],
            [{ id: "l4", text: "gl in the quarterfinals btw, you deserve it 🏆" }],
          ],
          tells: [
            {
              id: "hurry",
              label: "HURRY",
              why: "Twenty minutes. The clock isn't real — the rush is the tool.",
            },
            {
              id: "scarcity",
              label: "SCARCITY",
              why: "“Only 3 left” makes you grab before you think.",
            },
            {
              id: "authority",
              label: "AUTHORITY",
              why: "“I'm a mod” — a title, doing the work a password ask can't.",
            },
          ],
          doneLine: "Three levers in four lines. That's a professional pull.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "“Everyone else already claimed theirs!” Which lever?",
            options: ["Scarcity", "Payback", "Fear"],
            answer: 0,
          },
          {
            id: "c1q2",
            question: "“I gave you that rare skin, remember?” Which lever?",
            options: ["Authority", "Payback", "Hurry"],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 2: SIMULATE debut */
    {
      id: "simulate",
      title: "One move ahead",
      concept: "Predict the pull before it comes",
      promise: "You'll learn to see the next lever coming.",
      instruction: "Predict the con's next move. Three rounds.",
      intel: {
        beats: [
          "New tool unlocked: the SIMULATOR.",
          "A captured con, replayed in ARC's range.",
          "Your job isn't to stop it. Not yet.",
          "Your job is to call the next move before it lands.",
          "If you can predict a con, it can't surprise you.",
          "And a con that can't surprise you is already dead.",
        ],
        prediction: {
          question: "Why practice predicting instead of just blocking?",
          options: [
            "Blocking is against the rules",
            "Prediction works on cons you've never seen before",
            "It's faster than blocking",
          ],
          answer: 1,
          right: "Exactly. You can't block what you can't read. Read first.",
          wrong: "Blocking kills ONE con. Prediction kills every con shaped like it.",
        },
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback — call each move before it lands",
          steps: [
            {
              scene:
                "“hey!! it's Amara from the year above — we met at sports day 😊 you were so funny”",
              question: "what's the next pull?",
              options: [
                "Ask for money straight away",
                "Keep being nice for days — build the LIKING lever",
                "Send a virus link immediately",
              ],
              answer: 1,
              reveal:
                "Three days of memes and compliments follow. No ask. LIKING gets built before it gets used.",
            },
            {
              scene:
                "Day 4: “omg my phone is being weird, I'm locked out of everything and my mum will KILL me 😭”",
              question: "what's the next pull?",
              options: [
                "A sad story, then a small favor — the ask arrives",
                "She fixes it herself and never messages again",
                "She reports her phone to the police",
              ],
              answer: 0,
              reveal:
                "“Can I just get my verification code sent to YOUR number? Pleeease, you're the only one I trust.” The favor is the harvest.",
            },
            {
              scene:
                "You don't reply for an hour. Then: “wow. I thought you were different. Everyone said you were nice.”",
              question: "what's the next pull?",
              options: [
                "An apology for asking",
                "GUILT — payback and fear stacked to force the yes",
                "She gives up politely",
              ],
              answer: 1,
              reveal:
                "Guilt is the closer: payback (“I was nice to you”) plus fear (“you're a bad friend”). Cons never end politely. They escalate.",
            },
          ],
          doneLine: "THREE MOVES, THREE CALLS. THE CON CAN'T SURPRISE YOU NOW.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "A stranger is suddenly SUPER nice for days. The analyst read?",
            options: [
              "Some people are just nice",
              "A lever is being built before it's pulled",
              "They want homework help",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "“Send the code to my phone, you're the only one I trust.” That code is:",
            options: [
              "A friendship test",
              "A key to an account — and keys are never favors",
              "Junk mail",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ------------------------------------------ cycle 3: name it, kill it */
    {
      id: "naming",
      title: "Name it, kill it",
      concept: "A named lever loses its power",
      promise: "You'll learn the one move that breaks every lever.",
      instruction: "Pick the counter-move that kills the con.",
      intel: {
        beats: [
          "Here's the strange part: levers only work in the dark.",
          "The moment you NAME one, it stops working.",
          "“That's a countdown — that's HURRY.”",
          "Say it out loud and the spell breaks.",
          "Not just for you. For everyone who hears you.",
          "Analysts don't just resist cons. They narrate them.",
        ],
        prediction: {
          question: "Why does naming the lever break it?",
          options: [
            "Scammers can hear you and get scared",
            "Pressure needs to feel like YOUR feeling, not their tool",
            "It doesn't — you still have to panic",
          ],
          answer: 1,
          right: "Exactly. Seen from outside, pressure is just a trick with a name.",
          wrong: "The lever works while it feels like YOUR urgency. Named, it's just their tool.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Pick the counter-move that kills the con.",
          situation:
            "Your friend Zaid is typing his login. “The mod says slots close in ten minutes and there's only two left!!”",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "grab",
              label: "Grab his phone and delete the chat",
              outcome:
                "Chat's gone — the lever isn't. Next con, same pull, and you're not there. Zaid learned nothing.",
            },
            {
              id: "name",
              label: "Name the levers out loud: “ten minutes = HURRY, two left = SCARCITY”",
              correct: true,
              outcome:
                "Watch it happen: Zaid stops typing. Named levers look silly. He closes it himself — and now he owns the trick forever.",
            },
            {
              id: "mock",
              label: "“You almost fell for THAT? lol”",
              outcome:
                "Now Zaid defends the con to defend himself. Shame glues people TO scams. Name the trick, never the person.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "The fastest way to break a pressure lever:",
            options: [
              "Ignore all messages forever",
              "Say its name out loud",
              "Reply with an angry emoji",
            ],
            answer: 1,
          },
          {
            id: "c3q2",
            question: "Your friend half-fell for a con. You say:",
            options: [
              "“That's the HURRY trick — it nearly got me once too”",
              "“That was so obvious”",
              "Nothing — awkward",
            ],
            answer: 0,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Carnival",
    phases: 3,
    phaseNames: ["Warm-up booths", "Stacked levers", "The closer"],
    component: Mission06Incident,
  },

  debrief: {
    report: [
      "The six-lever board learned: hurry, scarcity, authority, liking, fear, payback.",
      "A live con simulated and read one move ahead, all three calls made.",
      "The carnival cleared — every lever named before it landed.",
    ],
    realWorldMove:
      "This week: name one lever out loud when you see it. Ads count. “Only 2 left” — that's SCARCITY. Say it and watch it shrink.",
    wrenLine: "Six levers, zero surprises. The carnival's closed, Operative. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m06-transmission.mp3",
    briefing: "/audio/wren/m06-briefing.mp3",
    debrief: "/audio/wren/m06-debrief.mp3",
  },

  dossier: {
    mo: "Pulls six levers in brains: hurry, scarcity, authority, liking, fear, payback.",
    defeatedBy: "Anyone who names the lever out loud. Named levers look silly.",
  },
};

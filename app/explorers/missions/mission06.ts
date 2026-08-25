/**
 * Mission 06 — "Levers" (Block 2: The Human Factor, SECRET track).
 * Actor: SIREN ②. SIMULATE / "Call the Lever" debuts. Map slot: §M06.
 *
 * ★ BLOCK 2 STARTS HERE — a deliberate world change. Where Block 1 was the
 *   dark Signal Room (audit a static artifact), Block 2 is THE CARNIVAL:
 *   a warm fairground at night where a con works you in real time and you
 *   call the pressure lever before the pitch lands. `theme: "carnival"`
 *   swaps the mission ground; the LEVER mechanic is fully carnival-styled;
 *   WREN comes off the analyst desk and into your earpiece.
 *
 * Teaching register (ages 10–13): the tier's core mental model — the six
 * pressure levers (hurry, scarcity, authority, liking, fear, payback).
 * Attackers aim at brains, not machines. Anticipation is defence (call the
 * lever live), and naming the lever out loud kills it.
 *
 * NOTE: prototype of the new Block-2 direction (owner reviewing the feel).
 * Three genuine skills + the blind must-pass test; expands toward the full
 * framework once the direction is signed off.
 */

import Mission06Incident from "../incidents/Mission06Incident";
import type { MissionManifest } from "../engine/types";

export const mission06: MissionManifest = {
  id: "explorers-m06",
  caseNumber: "CASE 006",
  title: "Levers",
  block: 2,
  classification: "SECRET",
  theme: "carnival",
  actor: {
    codename: "SIREN",
    mo: "Doesn't hack machines. Pulls the levers in your heart, sweetly, patiently, until you say yes.",
    portrait: "/explorers/actors/siren.png",
  },

  hook: "Every con pulls one of six levers inside you. Learn all six, and no barker can move you.",
  scene: "/explorers/scenes/m06-cold-open.jpg",

  transmission: {
    headline: "STEP RIGHT UP",
    lines: [
      "New clearance, Agent, and a whole new world. Forget the quiet control room. Tonight we're going somewhere loud.",
      "SIREN is back, and she's working a carnival. Every game rigged, every barker a con. And she never once touches your machine.",
      "She reaches for the levers inside YOU. Hurry. Fear. Wanting to be liked. There are six, and tonight you learn to feel every single one being pulled.",
    ],
  },

  briefing: {
    summary:
      "Almost every con on earth pulls one of six feelings: hurry, scarcity, authority, liking, fear, payback. Learn the six, and you can feel the hand reaching for the lever before it even pulls.",
    objectives: [
      "Learn the six pressure levers",
      "Call the lever a con pulls, live",
      "Name it out loud, and watch it die",
    ],
    wrenLine: "I'm in your ear the whole way tonight, Agent. Feelings aren't weaknesses. Unnamed ones are. Ready?",
  },

  cycles: [
    /* --------------------------------------------- cycle 1: the six levers */
    {
      id: "board",
      title: "The six levers",
      concept: "Almost every con pulls one of six feelings, not a single wire in a machine",
      promise: "You'll learn the six feelings every scam reaches for.",
      instruction: "Tap the 3 levers hiding in this one little chat.",
      intel: {
        beats: [
          "Here's the secret of Block Two, Agent. Con artists don't hack computers. They hack the person holding the computer. YOU.",
          "And they do it with just six levers, six feelings that make good, clever people click. HURRY: decide now, think never. SCARCITY: only one left, grab it.",
          "AUTHORITY: I'm in charge, do as I say. LIKING: we're friends, aren't we? FEAR: do it, or something bad happens. PAYBACK: I did you a favour, now you owe me.",
          "That's the whole board. Six levers. Once you can feel one being pulled, the con stops being magic and starts being obvious.",
        ],
        beatAudio: [
          "/audio/wren/m06-c1-b1.mp3",
          "/audio/wren/m06-c1-b2.mp3",
          "/audio/wren/m06-c1-b3.mp3",
          "/audio/wren/m06-c1-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "A captured con from the range. Tap the 3 pressure levers hiding in four short lines.",
          device: { app: "GROUP CHAT", owner: "CAPTURED CON · RANGE COPY" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "“TournamentMod_Kai”, joined the server yesterday" } },
          ],
          body: [
            [{ id: "l1", text: "yo! tournament slots close in 20 minutes", tellId: "hurry" }],
            [{ id: "l2", text: "only 3 spots left for your whole school", tellId: "scarcity" }],
            [{ id: "l3", text: "I'm a mod, I can hold one for you. just need your login to lock it in", tellId: "authority" }],
            [{ id: "l4", text: "gl in the quarterfinals btw, you totally deserve it 🏆" }],
          ],
          tells: [
            { id: "hurry", label: "HURRY", why: "Twenty minutes. The clock isn't real. The rush is the whole tool." },
            { id: "scarcity", label: "SCARCITY", why: "“Only 3 left” makes you grab before you stop to think." },
            { id: "authority", label: "AUTHORITY", why: "“I'm a mod” is just a title. It's there to make the password ask feel normal." },
          ],
          doneLine: "Three levers in four little lines, and a compliment for dessert. That's SIREN-grade work, and you read all of it.",
          doneAudio: "/audio/wren/m06-c1-review.mp3",
        },
      },
      playAudio: "/audio/wren/m06-c1-play.mp3",
    },

    /* --------------------------------------------- cycle 2: call the lever (LEVER — carnival signature) */
    {
      id: "call",
      title: "Call the lever",
      concept: "You don't have to wait for the con to land; you can name the lever while it's being pulled",
      promise: "You'll learn to call the lever a barker pulls, live, before the pitch even lands.",
      instruction: "A barker's working you. Call the lever before he finishes.",
      intel: {
        beats: [
          "Now the fun part. You're at the carnival, in the crowd, and a barker leans in to work you. You don't have to wait to see how it ends.",
          "The moment you feel a feeling being FORCED, that's a lever. Your job is to name which one, right there, out loud, before the pitch lands.",
          "That's the new skill, Agent. Not reacting after. Reading one move AHEAD. A con you can call is a con that can't surprise you.",
          "So watch his hands, not the shiny prize. Feel for the push, and call the lever. Ready? Step right up.",
        ],
        beatAudio: [
          "/audio/wren/m06-c2-b1.mp3",
          "/audio/wren/m06-c2-b2.mp3",
          "/audio/wren/m06-c2-b3.mp3",
          "/audio/wren/m06-c2-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "LEVER",
        payload: {
          intro: "Four stalls, four barkers. Call the lever each one is pulling.",
          rounds: [
            {
              line: "Psst, kid. This golden ticket? I've got ONE left. One. Blink and it's somebody else's. You want it or not, quick-quick!",
              answer: "scarcity",
              why: "“One left, blink and it's gone.” That's SCARCITY, fake shortage. A real prize doesn't run a stopwatch on you. Name it, and the panic just drains out.",
            },
            {
              line: "Listen, I RUN this carnival, kid, official staff, see the badge? Just hand me your account so I can 'verify' you for the big prize.",
              answer: "authority",
              why: "“I run this place, official, trust me.” That's AUTHORITY, borrowed. A badge you can print proves nothing, and nobody real needs your account to 'verify' you.",
            },
            {
              line: "Come ooon, I gave you three free goes already, didn't I? Don't be like that. One tiny favour back. You wouldn't stiff a mate.",
              answer: "payback",
              why: "“I gave you free goes, now do me a favour.” That's PAYBACK, the debt trap. A gift with strings was never a gift. You owe a con nothing.",
            },
            {
              line: "If you DON'T claim this right now, your account gets wiped tonight, and honestly? That'd be your own fault, kid.",
              answer: "fear",
              why: "“Do it now or something terrible happens, and it's your fault.” That's FEAR plus blame. Real help never threatens you or makes you the villain.",
            },
          ],
          doneLine: "Four stalls, four levers, every one named before it landed. That's the whole game: see the lever, say its name, watch it snap.",
          doneAudio: "/audio/wren/m06-c2-review.mp3",
        },
      },
      playAudio: "/audio/wren/m06-c2-play.mp3",
    },

    /* --------------------------------------------- cycle 3: name it, kill it (DECIDE) */
    {
      id: "naming",
      title: "Name it, kill it",
      concept: "A lever only works in the dark; say its name out loud and it stops working",
      promise: "You'll learn the one move that breaks every lever, for you and for your friends.",
      instruction: "Your friend's mid-con. Make the call that actually helps.",
      intel: {
        beats: [
          "Here's the strangest part of all, Agent. These levers only work in the dark. The second you SAY one out loud, it dies.",
          "“That's a countdown, that's HURRY.” “Only one left? That's SCARCITY.” Named, a lever looks silly, and a silly trick can't push anyone.",
          "And it doesn't just save you. Say it out loud and the spell breaks for everyone who hears you. That's how you cover your friends.",
          "One rule, though. Name the TRICK, never the person. “You fell for that?” glues people TO the con. “That's the HURRY trick” sets them free.",
        ],
        beatAudio: [
          "/audio/wren/m06-c3-b1.mp3",
          "/audio/wren/m06-c3-b2.mp3",
          "/audio/wren/m06-c3-b3.mp3",
          "/audio/wren/m06-c3-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Your friend Zaid is about to hand over his login. Make the call.",
          situation:
            "Zaid is typing his password into a chat. “The mod says slots close in ten minutes and there's only two left!!” His thumb is hovering over send.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "grab",
              label: "Grab his phone and delete the chat",
              outcome:
                "The chat's gone, but the lever isn't. Next con, same pull, and you won't be there. Zaid learned nothing, and he'll click next time.",
            },
            {
              id: "name",
              label: "Name the levers out loud: “ten minutes is HURRY, two left is SCARCITY”",
              correct: true,
              outcome:
                "Watch it happen. Zaid stops typing. Named out loud, the levers look silly, and he closes it himself. Now he owns the trick forever, not just today.",
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
      playAudio: "/audio/wren/m06-c3-play.mp3",
    },
  ],

  incident: {
    title: "The Carnival",
    phases: 3,
    phaseNames: ["Warm-up booths", "Stacked levers", "The closer"],
    component: Mission06Incident,
  },

  catchThem: {
    intro:
      "Alright Agent, last game of the night, and it's the real one. Twelve questions. Not one of them is “what did I say”. Every single one makes you THINK. Take the six levers into a con you've never seen and call it. I won't say how you're doing till the very end. Get nine right to close the case. Miss it, and you walk the whole midway again. Take your time.",
    pass: 9,
    voice: {
      intro: "/audio/wren/m06-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 12 fresh, think-for-yourself questions across the 3 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 the-six-levers · 1 call-the-lever · 2 name-it-kill-it.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "“Only 2 left, and everyone else already grabbed theirs!” Which lever?", options: ["Scarcity", "Payback", "Wanting to fit in", "Liking"], answer: 0 },
      { id: "cq2", skill: 0, prompt: "“I gave you that rare skin last week, remember?” Which lever?", options: ["Payback", "Authority", "Hurry", "Fear"], answer: 0 },
      { id: "cq3", skill: 0, prompt: "Why do con artists pull levers instead of hacking the machine?", options: ["A tricked person opens the door", "Machines can't be hacked at all", "Levers are just more polite", "It is the only way in"], answer: 0 },
      { id: "cq4", skill: 0, prompt: "“Do this now or your account is deleted forever.” Which lever?", options: ["Fear", "Liking", "Scarcity", "Payback"], answer: 0 },
      { id: "cq5", skill: 1, prompt: "A brand-new 'friend' is super nice for days, then asks a favour. What was the niceness?", options: ["The LIKING lever, built first", "A genuine new best friend", "Just some random online kindness", "A test of your patience"], answer: 0 },
      { id: "cq6", skill: 1, prompt: "“Quick, before the timer runs out!” The barker is pulling:", options: ["Hurry", "Payback", "Authority", "Liking"], answer: 0 },
      { id: "cq7", skill: 1, prompt: "Why call the lever WHILE it's happening, not after?", options: ["A con you read can't surprise you", "It is faster than blocking it", "It makes the con artist leave", "Reacting later is against the rules"], answer: 0 },
      { id: "cq8", skill: 1, prompt: "“Official staff here, just send me your password to verify.” Which lever?", options: ["Authority", "Scarcity", "Just being helpful", "Payback"], answer: 0 },
      { id: "cq9", skill: 2, prompt: "What's the fastest way to break a pressure lever?", options: ["Say its name out loud", "Ignore every message forever", "Reply with an angry emoji", "Turn your phone off"], answer: 0 },
      { id: "cq10", skill: 2, prompt: "Your friend half-fell for a con. The BEST thing to say is:", options: ["“That's the HURRY trick”", "“That was honestly so obvious”", "Nothing; it's too awkward now", "“You really should know better”"], answer: 0 },
      { id: "cq11", skill: 2, prompt: "Why does naming a lever out loud kill it?", options: ["Named, the pressure looks silly", "Scammers overhear and get scared", "It doesn't; you still panic", "It deletes the message for you"], answer: 0 },
      { id: "cq12", skill: 2, prompt: "You should name the ___, never the ___.", options: ["trick, person", "person, trick", "friend, scammer", "app, feeling"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "The six-lever board, learned cold: hurry, scarcity, authority, liking, fear, payback.",
      "A carnival of barkers worked, and every lever called out loud before it could land.",
      "The closer beaten the only way it can be: name the trick, never the person, and the spell breaks for everyone.",
    ],
    realWorldMove:
      "This week: name one lever out loud when you spot it. Ads count. “Only 2 left”? That's SCARCITY. Say it, and watch it shrink to nothing. Try it on a grown-up, they fall for these too.",
    wrenLine: "Six levers, zero surprises. The carnival's closed, Agent, and you never once reached for a prize. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m06-transmission.mp3",
    briefing: "/audio/wren/m06-briefing.mp3",
    debrief: "/audio/wren/m06-debrief.mp3",
  },

  dossier: {
    mo: "Pulls six levers in brains, sweetly: hurry, scarcity, authority, liking, fear, payback. Makes every mark feel like the one true friend, right up until the ask.",
    defeatedBy: "Anyone who names the lever out loud, and remembers a real friend never needs your password or your code. Named levers look silly, and silly can't push you.",
  },
};

/**
 * Mission 06 — "Levers" (Block 2: The Human Factor, SECRET track).
 * Actor: SIREN ②. Map slot: curriculum-map-v1 §M06.
 *
 * ★ BLOCK 2 STARTS HERE — a deliberate world change. Block 1 was the dark
 *   Signal Room (audit a static artifact); Block 2 is THE CARNIVAL: a warm
 *   fairground at night where a con works you in real time. `theme: "carnival"`
 *   swaps the mission ground; the LEVER mechanic is fully carnival-styled; WREN
 *   comes off the analyst desk and into your earpiece (warmer, present-tense).
 *
 * Lesson (stated plainly to the child): the six pressure levers con artists
 * pull — hurry, scarcity, authority, liking, fear, payback. SEVEN skills, each
 * LEARN -> PRACTICE, then ONE blind must-pass TEST:
 *   1 the six levers    (INSPECT)  — meet all six, spot them in a chat
 *   2 call the lever    (LEVER)    — SIGNATURE: name it live at the stall
 *   3 read one ahead    (SIMULATE) — predict a slow con's next move
 *   4 when levers stack  (INSPECT)  — real cons pull several at once
 *   5 name it, kill it   (DECIDE)   — the counter-move; name the trick not the person
 *   6 know SIREN's play  (PROFILE)  — build liking, add a closer, you open the door
 *   7 walk away clean    (BUILD)    — the exit plan, nothing to be ashamed of
 *
 * VOICE: WREN's Block-2 register — in your ear, conversational, flowing. Copy
 * written as connected speech (no staccato fragment lists); one tone per clip.
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
    mo: "Doesn't hack machines. Pulls the levers in your heart, sweetly and patiently, until you say yes.",
    portrait: "/explorers/actors/siren.png",
  },

  hook: "Every con pulls one of six feelings inside you. Learn all six, and no barker can move you.",
  scene: "/explorers/scenes/m06-cold-open.jpg",

  transmission: {
    headline: "STEP RIGHT UP",
    lines: [
      "New clearance, Agent, and a whole new world to go with it. The quiet control room is behind us now. Tonight we're working somewhere loud and bright.",
      "SIREN is back, and she's running a carnival where every game is rigged and every friendly voice wants something. And she never once touches your machine.",
      "She reaches for the levers inside you instead, the feelings that make good, clever people say yes. There are six of them, and by the end of tonight you'll feel every single one coming.",
    ],
  },

  briefing: {
    summary:
      "Here's tonight's lesson, plain and simple. Almost every con on earth pulls one of six feelings to make you say yes: hurry, scarcity, authority, liking, fear, and payback. You'll meet all six, learn to call them out while a con is actually happening, and learn the one little move that snaps every one of them.",
    objectives: [
      "Meet the six pressure levers",
      "Call and predict them in a live con",
      "Name it to kill it, then walk away clean",
    ],
    wrenLine: "I'm right in your ear the whole way tonight, Agent. Feelings aren't weaknesses. The ones you can't name are. Ready?",
  },

  cycles: [
    /* --------------------------------------------- skill 1: the six levers (INSPECT) */
    {
      id: "board",
      title: "The six levers",
      concept: "Con artists pull six feelings, not wires; learn all six and you can feel one coming",
      promise: "You'll meet the six feelings every con reaches for, so you can feel one being pulled a mile off.",
      instruction: "Tap the 3 levers hiding in this one short chat.",
      intel: {
        beats: [
          "Let me tell you what this whole case is really about, because it's simpler than you'd think. Con artists almost never break into your computer. They break into you, by pulling on your feelings.",
          "And here's the good news. There are only six feelings they ever pull. Just six. Learn all of them tonight, and no con will catch you off guard again.",
          "The first three rush you. HURRY says decide this second. SCARCITY says grab it before it's gone. And AUTHORITY says I'm in charge here, so just do as you're told.",
          "The other three go for your heart. LIKING makes you feel like the two of you are friends. FEAR makes you scared of what happens if you say no. And PAYBACK makes you feel like you owe them one. Six levers, and that's the whole game.",
        ],
        beatAudio: ["/audio/wren/m06-c1-b1.mp3", "/audio/wren/m06-c1-b2.mp3", "/audio/wren/m06-c1-b3.mp3", "/audio/wren/m06-c1-b4.mp3"],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Here's a captured con from the range. Three of these four lines are pulling a lever. Tap all three.",
          device: { app: "GROUP CHAT", owner: "CAPTURED CON · RANGE COPY" },
          header: [{ label: "FROM:", seg: { id: "from", text: "“TournamentMod_Kai”, joined the server yesterday" } }],
          body: [
            [{ id: "l1", text: "yo! tournament slots close in 20 minutes", tellId: "hurry" }],
            [{ id: "l2", text: "only 3 spots left for your whole school", tellId: "scarcity" }],
            [{ id: "l3", text: "I'm a mod, I can hold one for you, just need your login to lock it in", tellId: "authority" }],
            [{ id: "l4", text: "gl in the quarterfinals btw, you totally deserve it 🏆" }],
          ],
          tells: [
            { id: "hurry", label: "HURRY", why: "Twenty minutes on a clock. That clock isn't real, and the rush is the whole tool." },
            { id: "scarcity", label: "SCARCITY", why: "“Only 3 left” is there to make you grab before you stop and think." },
            { id: "authority", label: "AUTHORITY", why: "“I'm a mod” is just a title. It's there to make asking for your password feel normal." },
          ],
          doneLine: "Three levers in three little lines, with a compliment for dessert. You read every one of them.",
          doneAudio: "/audio/wren/m06-c1-review.mp3",
        },
      },
      playAudio: "/audio/wren/m06-c1-play.mp3",
    },

    /* --------------------------------------------- skill 2: call the lever (LEVER — carnival signature) */
    {
      id: "call",
      title: "Call the lever",
      concept: "You don't have to wait for a con to finish; you can name the lever while it's being pulled",
      promise: "You'll learn to name the lever a con is pulling, out loud, right as it happens.",
      instruction: "A barker's working you. Call the lever before he finishes.",
      intel: {
        beats: [
          "Now that you know the six, let's actually use them. Picture yourself right in the middle of the carnival, in the crowd, when a barker leans in close to work you.",
          "You don't have to wait and see how it ends. The moment you feel a feeling being pushed onto you, that's a lever, and your only job is to name which one it is.",
          "This is the real skill of the whole block, Agent. Not reacting after you've already been caught, but reading the con one move ahead of itself.",
          "So watch his hands, never the shiny prize he's waving about. Feel for the push, name the lever, and step right up.",
        ],
        beatAudio: ["/audio/wren/m06-c2-b1.mp3", "/audio/wren/m06-c2-b2.mp3", "/audio/wren/m06-c2-b3.mp3", "/audio/wren/m06-c2-b4.mp3"],
      },
      fieldwork: {
        verb: "LEVER",
        payload: {
          intro: "Four stalls, four barkers. Call the lever each one is pulling.",
          rounds: [
            { line: "Psst, kid. This golden ticket? I've got ONE left. One. Blink and it's somebody else's. You want it or not, quick-quick!", answer: "scarcity", why: "“One left, blink and it's gone.” That's SCARCITY, fake shortage. A real prize doesn't run a stopwatch on you. Name it, and the panic just drains out." },
            { line: "Listen, I RUN this carnival, kid, official staff, see the badge? Just hand me your account so I can 'verify' you for the big prize.", answer: "authority", why: "“I run this place, official, trust me.” That's AUTHORITY, borrowed. A badge you can print proves nothing, and nobody real needs your account to 'verify' you." },
            { line: "Come ooon, I gave you three free goes already, didn't I? Don't be like that. One tiny favour back. You wouldn't stiff a mate.", answer: "payback", why: "“I gave you free goes, now do me a favour.” That's PAYBACK, the debt trap. A gift with strings was never a gift. You owe a con nothing." },
            { line: "If you DON'T claim this right now, your account gets wiped tonight, and honestly? That'd be your own fault, kid.", answer: "fear", why: "“Do it now or something terrible happens, and it's your fault.” That's FEAR plus blame. Real help never threatens you or makes you the villain." },
          ],
          doneLine: "Four stalls, four levers, every one of them named before it landed. That's the whole game: see the lever, say its name, watch it snap.",
          doneAudio: "/audio/wren/m06-c2-review.mp3",
        },
      },
      playAudio: "/audio/wren/m06-c2-play.mp3",
    },

    /* --------------------------------------------- skill 3: read one move ahead (SIMULATE) */
    {
      id: "ahead",
      title: "Read one move ahead",
      concept: "A slow con builds a lever over days; predict its next move and it can't surprise you",
      promise: "You'll learn to predict a con's very next move before it makes it.",
      instruction: "Watch the con play out. Call each move before it lands.",
      intel: {
        beats: [
          "Some cons are slow, and slow ones are trickier. They don't pull a lever in a single message, they build one quietly over days, so you never feel the exact moment it happens.",
          "So we're going to practise reading ahead. I'll play you a real con from the range, one move at a time, and before each move lands, you tell me what's coming next.",
          "You won't always get it right, and honestly that's fine. Guessing wrong teaches you the shape of a con just as well as guessing right does.",
          "Because once you can predict a con, it's already lost. A trick only works while it can still surprise you, and this one is about to run out of surprises.",
        ],
        beatAudio: ["/audio/wren/m06-c3-b1.mp3", "/audio/wren/m06-c3-b2.mp3", "/audio/wren/m06-c3-b3.mp3", "/audio/wren/m06-c3-b4.mp3"],
      },
      fieldwork: {
        verb: "SIMULATE",
        payload: {
          intro: "Range playback. Before each move lands, call what the con does next.",
          steps: [
            {
              scene: "“hey!! it's Amara from the year above, we met at sports day. you were so funny that day 😊”",
              question: "What's her next move?",
              options: [
                "Ask you for money straight away",
                "Keep being lovely for days, building the LIKING lever first",
                "Send you a virus link right now",
              ],
              answer: 1,
              reveal: "Days of memes and compliments follow, and no ask at all. She's building LIKING first, because a lever works far better once you already like her.",
            },
            {
              scene: "Day four: “omg my phone is being so weird, I'm locked out of everything and my mum is going to actually kill me 😭”",
              question: "What comes next?",
              options: [
                "A sad story, and then a small favour: the real ask arrives",
                "She fixes it herself and never messages you again",
                "She reports her lost phone to the police",
              ],
              answer: 0,
              reveal: "“Could I just get my verification code sent to YOUR number? Pleeease, you're the only one I trust.” That little favour was the whole point of the con.",
            },
            {
              scene: "You don't reply for an hour. Then: “wow. I really thought you were different. Everyone told me you were nice.”",
              question: "What's the closing move?",
              options: [
                "A kind apology for asking too much",
                "GUILT: payback and fear team up to force a yes",
                "She gives up politely and wishes you well",
              ],
              answer: 1,
              reveal: "Guilt is the closer, every time. Payback, “I was so nice to you,” plus fear, “you're a bad friend.” A real con never ends politely. It pushes harder.",
            },
          ],
          doneLine: "Three moves, three calls. You read the whole con before it happened, and now it can't touch you.",
        },
      },
      playAudio: "/audio/wren/m06-c3-play.mp3",
    },

    /* --------------------------------------------- skill 4: when levers stack (INSPECT) */
    {
      id: "stack",
      title: "When levers stack",
      concept: "Real cons pull several levers at once; the size of the stack tells you how worried to be",
      promise: "You'll learn that real cons pull several levers at once, and how to spot the whole stack.",
      instruction: "This one message pulls FOUR levers. Tap every single one.",
      intel: {
        beats: [
          "Here's where cons get sneaky. A clever one almost never pulls just a single lever. It stacks them up, three or four at a time, hoping at least one of them lands on you.",
          "And that is actually a gift, because a stack is loud. The more levers a message is pulling, the harder it's trying, and the more certain you can be that it's a con.",
          "So never stop at the first lever you spot. When you feel HURRY, look again for the SCARCITY hiding right behind it, and the AUTHORITY hiding behind that.",
          "Read the whole message to the end, count the levers, and let the size of the stack tell you exactly how worried you should be.",
        ],
        beatAudio: ["/audio/wren/m06-c4-b1.mp3", "/audio/wren/m06-c4-b2.mp3", "/audio/wren/m06-c4-b3.mp3", "/audio/wren/m06-c4-b4.mp3"],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "One DM, a whole stack of levers. Tap all four. One line is just normal small print.",
          device: { app: "DIRECT MESSAGE", owner: "“PrizeTeam_Official” · RANGE COPY" },
          header: [{ label: "FROM:", seg: { id: "from", text: "“PrizeTeam_Official”, no posts, no followers" } }],
          body: [
            [{ id: "s1", text: "🎉 CONGRATS! you won our £100 gift card giveaway!", tellId: "prize" }],
            [{ id: "s2", text: "but you MUST claim it in the next 10 minutes", tellId: "hurry" }],
            [{ id: "s3", text: "only 1 unclaimed prize left in your whole area", tellId: "scarcity" }],
            [{ id: "s4", text: "I'm on the official prize team, I can see your account from here", tellId: "authority" }],
            [{ id: "s5", text: "and we already gave you a free entry last week, remember? 😉", tellId: "payback" }],
            [{ id: "s6", text: "reply STOP to leave this list" }],
          ],
          tells: [
            { id: "hurry", label: "HURRY", why: "“In the next 10 minutes.” The clock is fake, and it's there so you can't stop to think." },
            { id: "scarcity", label: "SCARCITY", why: "“Only 1 left in your area.” Invented shortage, to make you grab before you check." },
            { id: "authority", label: "AUTHORITY", why: "“Official prize team, I can see your account.” A borrowed title, to make the ask feel allowed." },
            { id: "payback", label: "PAYBACK", why: "“We already gave you a free entry.” A pretend favour, so you feel like you owe them a yes." },
          ],
          doneLine: "Four levers stacked in one little message, and you named all four. A stack that big isn't a giveaway. It's a giant flashing sign that says con.",
          doneAudio: "/audio/wren/m06-c4-review.mp3",
        },
      },
      playAudio: "/audio/wren/m06-c4-play.mp3",
    },

    /* --------------------------------------------- skill 5: name it, kill it (DECIDE) */
    {
      id: "naming",
      title: "Name it, kill it",
      concept: "A lever only works in the dark; saying its name out loud breaks it, for you and your friends",
      promise: "You'll learn the one move that breaks any lever, for you and for a friend.",
      instruction: "Your friend's mid-con. Make the call that actually helps him.",
      intel: {
        beats: [
          "Now the best part, the one move that beats every lever there is. And the amazing thing is it costs you nothing. You simply say the lever's name, out loud.",
          "I know it sounds too easy. But a lever only works in the dark. The second you say “that's a countdown, that's HURRY,” the pressure turns into a silly little trick, and a silly trick can't push anyone around.",
          "And it doesn't only save you. Say it out loud near a friend, and the spell breaks for them as well. That's how you quietly cover the people around you.",
          "There's one rule, though, and it really matters. Name the trick, never the person. “You almost fell for that?” shames your friend into defending the con. “That's just HURRY, it nearly got me too” sets them free.",
        ],
        beatAudio: ["/audio/wren/m06-c5-b1.mp3", "/audio/wren/m06-c5-b2.mp3", "/audio/wren/m06-c5-b3.mp3", "/audio/wren/m06-c5-b4.mp3"],
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Your friend Zaid is about to hand over his login. You've got one move. Make it count.",
          situation:
            "Zaid is typing his password into a chat. “The mod says slots close in ten minutes and there's only two left!!” His thumb is hovering right over send.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            { id: "grab", label: "Grab his phone and delete the chat for him", outcome: "The chat's gone, but the lever isn't, and you won't be there for the next one. Zaid learned nothing, so he'll click again tomorrow." },
            { id: "name", label: "Name the levers out loud: “ten minutes is HURRY, two left is SCARCITY”", correct: true, outcome: "Watch what happens. Zaid stops typing. Said out loud, the levers look silly, and he closes the chat himself. Now he owns the trick forever, not just for today." },
            { id: "mock", label: "Laugh: “you actually almost fell for THAT?”", outcome: "Now Zaid defends the con just to defend himself, and the shame glues him to it. Name the trick, never the person." },
          ],
        },
      },
      playAudio: "/audio/wren/m06-c5-play.mp3",
    },

    /* --------------------------------------------- skill 6: know SIREN's play (PROFILE) */
    {
      id: "play",
      title: "Know SIREN's play",
      concept: "SIREN builds liking first, adds a closer lever, and needs YOU to open the door",
      promise: "You'll learn SIREN's whole game from start to finish, so you can see it coming.",
      instruction: "Tap the 3 moves that are really SIREN's.",
      intel: {
        beats: [
          "Let's put a face to all of this. The operator running tonight's carnival is SIREN, and here's the thing about her. She isn't loud, and she isn't scary. She's lovely. That's the whole trick.",
          "Her play is always the same three steps. First she builds LIKING, being warm and kind and funny, for as long as it takes, until you honestly feel like friends.",
          "Then, once you like her, she reaches for one more lever to close the deal. Usually a favour, wrapped up in a little HURRY or FEAR so you don't stop to think it through.",
          "And the whole time, she never once touches your machine. She just needs YOU to open the door for her. Learn those three steps, and you'll spot her before she's even begun.",
        ],
        beatAudio: ["/audio/wren/m06-c6-b1.mp3", "/audio/wren/m06-c6-b2.mp3", "/audio/wren/m06-c6-b3.mp3", "/audio/wren/m06-c6-b4.mp3"],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Everything you've learned tonight, on one board. Tap the 3 moves that are really SIREN's.",
          evidence: [
            "She was warm and funny for days before she asked for anything",
            "The ask always came wrapped in a little hurry or fear",
            "She never once tried to touch the machine itself",
          ],
          behaviors: [
            { id: "liking", label: "Builds LIKING first, for as long as it takes", matches: true },
            { id: "closer", label: "Adds a closer lever, hurry or fear, at the ask", matches: true },
            { id: "door", label: "Needs YOU to open the door; never hacks it", matches: true },
            { id: "guess", label: "Runs a rig to guess your password", matches: false },
            { id: "crumbs", label: "Quietly collects your public crumbs", matches: false },
            { id: "flood", label: "Floods every channel you own at once", matches: false },
          ],
          picks: 3,
          doneLine: "Liking, then a closer, then your own hand on the door. That's SIREN, start to finish. And a con you can see coming is a con that's already lost.",
        },
      },
      playAudio: "/audio/wren/m06-c6-play.mp3",
    },

    /* --------------------------------------------- skill 7: walk away clean (BUILD) */
    {
      id: "exit",
      title: "Walk away clean",
      concept: "Getting out of a con: stop, tell someone, never pay, and never feel silly",
      promise: "You'll build the exact plan for getting out of a con, with nothing to be ashamed of.",
      instruction: "Build the walk-away plan. Pick the right move for each step.",
      intel: {
        beats: [
          "So what do you actually DO the moment you realise you're in one? Here's the plan, and step one is the hardest. You stop. You don't reply, you don't explain, and you don't apologise. You just stop.",
          "You do not owe a con artist a goodbye. Leaving right in the middle of a sentence isn't rude, it's clever, and it's the single most powerful move you have.",
          "Then you tell someone you trust. Not because you're in trouble, because you're not, but because a con is built to make you feel alone, and telling one person breaks that on the spot.",
          "And last of all, never feel silly. These things are built by grown-ups, to fool grown-ups. Walking away clean isn't losing the game, Agent. It IS the way you win it.",
        ],
        beatAudio: ["/audio/wren/m06-c7-b1.mp3", "/audio/wren/m06-c7-b2.mp3", "/audio/wren/m06-c7-b3.mp3", "/audio/wren/m06-c7-b4.mp3"],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Build the walk-away plan, the one you'd use the moment a con turns real. Pick the right move for each step.",
          target: "The walk-away plan",
          slots: [
            {
              id: "stop",
              label: "The moment you realise",
              options: [
                { id: "s1", label: "Stop replying, right away", good: true, why: "The pause is your superpower. Every lever needs you to keep going, so stopping ends all of them at once." },
                { id: "s2", label: "Explain politely why you're leaving", good: false, why: "You owe a con artist nothing, not even a goodbye. Explaining just gives them another opening." },
              ],
            },
            {
              id: "tell",
              label: "Straight after",
              options: [
                { id: "t1", label: "Tell someone you trust", good: true, why: "A con is designed to make you feel alone. Telling one person breaks that spell instantly." },
                { id: "t2", label: "Handle it alone so nobody finds out", good: false, why: "Alone and quiet is exactly where a con wants you. Bring in a second pair of eyes." },
              ],
            },
            {
              id: "pay",
              label: "If they ask for a code, money, or a password",
              options: [
                { id: "p1", label: "Never send it, no matter what they say", good: true, why: "Codes, money, and passwords are the whole prize. Once they're sent, you can't get them back." },
                { id: "p2", label: "Send it once just to make them go away", good: false, why: "They never go away, they ask for more. Sending something is the one move you can't undo." },
              ],
            },
            {
              id: "feel",
              label: "And afterwards, you feel",
              options: [
                { id: "f1", label: "Proud, because walking away is winning", good: true, why: "These are built by adults to fool adults. Spotting one and leaving is a genuine win." },
                { id: "f2", label: "Silly for nearly falling for it", good: false, why: "Shame is the con's last lever. Don't hand it that one. Nearly getting caught and leaving is a good day's work." },
              ],
            },
          ],
          testLine: "Stop, tell someone, never pay, never feel silly. Four steps, and SIREN's whole carnival has nothing left to grab.",
          doneLine: "That's the walk-away plan. Learn it once and it fits every con there is, on any night, at any stall.",
        },
      },
      playAudio: "/audio/wren/m06-c7-play.mp3",
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
      "Alright Agent, last game of the night, and it's the real one. Nineteen questions, and not a single one is “what did I say.” Every one makes you take the six levers into a con you've never seen, and call it. I won't tell you how you're doing until the very end. Get fifteen right and you close the case. Miss it, and you walk the whole midway again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m06-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 19 fresh, think-for-yourself questions across the 7 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 six-levers · 1 call-the-lever · 2 read-ahead · 3 the-stack
    //        4 name-it-kill-it · 5 SIREN's-play · 6 walk-away.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "Why do con artists pull levers instead of hacking the machine?", options: ["A tricked person opens the door", "Machines can't be hacked at all", "Levers are just more polite", "It is the only way in"], answer: 0 },
      { id: "cq2", skill: 0, prompt: "“Only 2 left, and everyone else already grabbed theirs!” Which lever?", options: ["Scarcity", "Payback", "Wanting to fit in", "Liking"], answer: 0 },
      { id: "cq3", skill: 0, prompt: "“I gave you that rare skin last week, remember?” Which lever?", options: ["Payback", "Authority", "Hurry", "Fear"], answer: 0 },
      { id: "cq4", skill: 1, prompt: "“Quick, decide before the timer runs out!” The barker is pulling:", options: ["Hurry", "Payback", "Authority", "Liking"], answer: 0 },
      { id: "cq5", skill: 1, prompt: "Why is it better to call a lever WHILE it's happening?", options: ["A con you read can't surprise you", "It is faster than blocking it", "It makes the con artist leave", "Reacting later is against the rules"], answer: 0 },
      { id: "cq6", skill: 1, prompt: "“Official staff here, just send me your password to verify.” Which lever?", options: ["Authority", "Scarcity", "Just being helpful", "Payback"], answer: 0 },
      { id: "cq7", skill: 2, prompt: "A brand-new 'friend' is super nice for days, then asks a favour. What was the niceness?", options: ["The LIKING lever, built first", "A genuine new best friend", "Just some random online kindness", "A test of your patience"], answer: 0 },
      { id: "cq8", skill: 2, prompt: "Why practise predicting a con's next move?", options: ["A con you can read is beaten", "It is quicker than ignoring it", "It scares the con artist off", "Guessing right earns more points"], answer: 0 },
      { id: "cq9", skill: 2, prompt: "A slow con guilt-trips you at the end: “I thought you were nice.” That's:", options: ["Payback and fear", "A genuinely hurt friend", "Just a normal disagreement", "The con giving up on you"], answer: 0 },
      { id: "cq10", skill: 3, prompt: "A message pulls hurry AND scarcity AND authority at once. What does the big stack tell you?", options: ["It's trying hard; a con", "It must be a real emergency", "It's just very well written", "Nothing; ignore the number"], answer: 0 },
      { id: "cq11", skill: 3, prompt: "Spotting one lever in a message, you should:", options: ["Keep reading for more", "Stop; one is enough", "Reply to ask about it", "Trust the rest of it"], answer: 0 },
      { id: "cq12", skill: 4, prompt: "What's the fastest way to break a pressure lever?", options: ["Say its name out loud", "Ignore every message forever", "Reply with an angry emoji", "Turn your phone off"], answer: 0 },
      { id: "cq13", skill: 4, prompt: "Your friend half-fell for a con. The BEST thing to say is:", options: ["“That's the HURRY trick”", "“That was honestly so obvious”", "Nothing; it's too awkward now", "“You really should know better”"], answer: 0 },
      { id: "cq14", skill: 4, prompt: "Why name the TRICK and not the person?", options: ["Shame glues people to the con", "The person can't hear you anyway", "Tricks have funnier names", "It doesn't matter which you name"], answer: 0 },
      { id: "cq15", skill: 5, prompt: "What's SIREN's very first move, every time?", options: ["Being lovely first", "Threatening to delete things", "Guessing your password fast", "Flooding all your channels"], answer: 0 },
      { id: "cq16", skill: 5, prompt: "A 'friend' who never asked for anything suddenly needs a big favour. Be:", options: ["Careful; the ask is the point", "Flattered they picked you", "Sure it's fine; you're friends", "Quick, before they're upset"], answer: 0 },
      { id: "cq17", skill: 6, prompt: "The FIRST step when you realise you're in a con is to:", options: ["Stop replying", "Explain why you're leaving", "Send one last polite message", "Wait and see what happens"], answer: 0 },
      { id: "cq18", skill: 6, prompt: "A con asks for a code “to help you.” You:", options: ["Never send it", "Send it just this once", "Send a slightly wrong one", "Ask why they need it"], answer: 0 },
      { id: "cq19", skill: 6, prompt: "You spotted a con and walked away. You should feel:", options: ["Proud; that's a win", "Silly for nearly falling", "Angry at yourself", "Scared it comes back"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "You met all six levers and can spot them now: hurry, scarcity, authority, liking, fear, and payback.",
      "You called them live, read a slow con one move ahead, and pulled apart a message that stacked four levers at once.",
      "And you learned the two moves that beat every one of them: name the trick, never the person, then walk away clean.",
    ],
    realWorldMove:
      "This week, name one lever out loud the moment you spot it. Adverts count. “Only 2 left”? Say “that's SCARCITY,” and watch it shrink to nothing. Try it on a grown-up too, they fall for these just as easily as anyone.",
    wrenLine: "Six levers, and not one of them moved you. The carnival's closed, Agent, and you never once reached for a prize. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m06-transmission.mp3",
    briefing: "/audio/wren/m06-briefing.mp3",
    debrief: "/audio/wren/m06-debrief.mp3",
  },

  dossier: {
    mo: "Pulls six levers in brains, sweetly: hurry, scarcity, authority, liking, fear, payback. Builds liking first, then closes with a favour wrapped in hurry or fear. Never touches the machine.",
    defeatedBy: "Anyone who names the lever out loud, remembers a real friend never needs a password or a code, and walks away without a shred of shame. Named levers look silly, and silly can't push you.",
  },
};

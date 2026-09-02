/**
 * Mission 04 — "The Puzzle You Posted" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PACKRAT ①. Built to the LOCKED case framework
 * (see docs/explorers/case-framework-locked.md) — Case 001 is the reference.
 *
 * SEVEN skills, each LEARN -> PRACTICE, then ONE blind must-pass TEST. The
 * magpie/nest metaphor carries it: PACKRAT never breaks in, he pockets the
 * crumbs you drop and stacks them into a file.
 *   1 the assembly attack (beats + TRACE)   — SIGNATURE: pin crumbs, chain a file
 *   2 read the photo       (beats + INSPECT) — a photo leaks its background
 *   3 the fun quiz trap    (beats + SORT)    — quizzes harvest security answers
 *   4 scrub the post       (beats + REDACT)  — black out the where-and-when
 *   5 scrub by priority    (beats + DECIDE)  — take the worst crumb down first
 *   6 know PACKRAT's play  (beats + PROFILE) — collect, link, assemble, sell
 *   7 lock down your trail (beats + BUILD)   — the footprint clean-up plan
 *
 * Signature per curriculum-map-v1: the assembly attack (a two-stage TRACE:
 * pin the crumbs, then chain them into a file) and a poison-the-auction boss
 * (Paper Trail) — deliberately NOT a re-skin of an earlier case.
 *
 * Safety canon: the assembly runs as an AUTHORIZED ARC AUDIT of a volunteer's
 * test account (built from her old posts, with her help). Defensive framing
 * throughout — never "how to stalk".
 */

import Mission04Incident from "../incidents/Mission04Incident";
import type { MissionManifest } from "../engine/types";

export const mission04: MissionManifest = {
  id: "explorers-m04",
  caseNumber: "CASE 004",
  title: "The Puzzle You Posted",
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
      "Agent, there's an auction running on a hidden channel, and the lot for sale is a file about a student. Her school, her schedule, her birthday, all of it.",
      "Here's the thing. She never told anyone any of it. She posted it in pieces, all harmless on their own, and PACKRAT pocketed every crumb.",
      "He never broke in. He never had to. Tonight we learn how the pieces became a file, and make his file worthless.",
    ],
  },

  briefing: {
    summary:
      "PACKRAT never breaks in. Why would he? He just pockets what you leave lying outside, a handle here, a photo there, and stacks it into a file he can sell.",
    objectives: [
      "See how harmless crumbs combine into one file",
      "Read what a photo and a 'fun' quiz quietly give away",
      "Scrub your trail, and starve the nest for good",
    ],
    wrenLine: "Seven skills, then a test to close the case. One rule tonight, Agent. PACKRAT can only keep what you leave lying out. Ready?",
  },

  cycles: [
    /* --------------------------------------------- cycle 1: the assembly attack (TRACE — signature) */
    {
      id: "assembly",
      title: "The assembly attack",
      concept: "Harmless crumbs combine into one file",
      checkpoint: {
        questions: [
          { id: "m04-c1-chk1", question: "Over one week Leo posts his dog's name, his estate's summer fair, and his Saturday football club. Each post is harmless. Why should he still worry?", options: ["Three posts in a week looks like showing off", "One of the posts probably has a typo", "Stacked together they reveal his where, his when, and a password answer"], answer: 2, ok: "Exactly. On their own they are crumbs. Stacked, they hand a stranger a whole file. That is the assembly attack.", okVoice: "/audio/wren/m04-c1-chk1-ok.mp3" },
          { id: "m04-c1-chk2", question: "A stranger has built a file on a girl he has never met, and he never once touched her account. How did he most likely do it?", options: ["He guessed her password over and over", "He collected her separate public posts and stacked them", "He read a fake prize email she tapped"], answer: 1, ok: "That is the whole trick. No break-in, just patience. He pockets each harmless crumb and stacks them into one file.", okVoice: "/audio/wren/m04-c1-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn how a stranger turns scattered posts into a profile.",
      instruction: "Pin every crumb that feeds the file, then chain them in order.",
      intel: {
        beats: [
          "One post on its own? PACKRAT can't do a thing with it. A handle. A team photo. A birthday joke. Each one is harmless.",
          "That's exactly the trap. Every crumb feels too small to matter, so you drop it in public without a second thought.",
          "But PACKRAT doesn't read one post. He STACKS them. A handle names your town. A photo names your school. A comment names your schedule. Alone, nothing. Stacked, a file. ARC calls it the assembly attack.",
          "Tonight we run one ourselves, the safe way, on a volunteer's test account, with her say-so. Watch four harmless crumbs become a file, without anyone breaking into anything.",
        ],
        beatAudio: [
          "/audio/wren/m04-c1-b1.mp3",
          "/audio/wren/m04-c1-b2.mp3",
          "/audio/wren/m04-c1-b3.mp3",
          "/audio/wren/m04-c1-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Audit board: pin every crumb that feeds the file, then chain them in the order PACKRAT would.",
          fingerprintHint: "anything that says who, where, or when",
          cards: [
            { id: "t1", surface: "GAME PROFILE", from: "@priya_riverdale09", text: "bio: goalie for the Riverdale Foxes ⚽ love saves & snacks", inCampaign: true, clue: "the handle names her town AND her team", order: 1 },
            { id: "d1", surface: "GAME CHAT", from: "@priya_riverdale09", text: "anyone else think the new update made the menus worse??", inCampaign: false },
            { id: "t2", surface: "PHOTO POST", from: "@priya_riverdale09", text: "match day!! 📸 team photo, school gates behind us", inCampaign: true, clue: "the gates say WHICH school", order: 2 },
            { id: "t3", surface: "COMMENT", from: "@priya_riverdale09", text: "we practise every Tuesday til 6, come watch!", inCampaign: true, clue: "a schedule, posted in public", order: 3 },
            { id: "d2", surface: "FORUM", from: "@priya_riverdale09", text: "how do you solve question 4 on the maths sheet lol", inCampaign: false },
            { id: "t4", surface: "QUIZ POST", from: "@priya_riverdale09", text: "my goalie number + my birth year = my lucky number lol", inCampaign: true, clue: "birthday math, posted as a joke", order: 4 },
          ],
          stage2Prompt: "Now chain it like PACKRAT does: order the crumbs into a file",
          doneLine: "Who, then where, then when, then birthday. Four harmless posts, one complete file, and PACKRAT never lifted a claw. That's the assembly attack.",
        },
      },
      playAudio: "/audio/wren/m04-c1-play.mp3",
    },

    /* --------------------------------------------- cycle 2: read the photo (INSPECT) */
    {
      id: "photo",
      title: "Read the photo",
      concept: "A photo leaks far more than the thing you pointed it at",
      checkpoint: {
        questions: [
          { id: "m04-c2-chk1", question: "Maya posts a cute selfie in her bedroom. She only meant to show off her new haircut. What might the photo ALSO give away?", options: ["Details behind her, like a school letter or a house number on view", "Nothing, a selfie only ever shows her face", "Only the haircut, a phone never captures anything else"], answer: 0, ok: "Right. You checked the haircut. PACKRAT checks the shelf, the window, the letter on the desk. Same photo, a whole other read.", okVoice: "/audio/wren/m04-c2-chk1-ok.mp3" },
          { id: "m04-c2-chk2", question: "Sam took a photo at the park and posted it straight away. He typed no location at all. How could a stranger still learn exactly where he was?", options: ["They could not, because he typed no location", "Only if Sam had tagged the park himself", "His phone can staple a location tag on automatically"], answer: 2, ok: "That is the silent one. The phone tags the exact spot without ever asking. Turn location tags off and that leak closes.", okVoice: "/audio/wren/m04-c2-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to see everything a photo quietly gives away.",
      instruction: "Tap every leak hiding in this photo. Some of it is just a nice picture.",
      intel: {
        beats: [
          "A photo shows what you pointed it at. It also shows everything BEHIND it, and you stopped looking the second the smile was good.",
          "Uniform crests that name your school. Street signs. House numbers. A reflection in a window. A landmark out the bus.",
          "And underneath the whole thing, the location tag your phone stapled on automatically, without ever asking you.",
          "You checked the smile. PACKRAT checked the background, and the tags. Same photo, two completely different reads.",
        ],
        beatAudio: [
          "/audio/wren/m04-c2-b1.mp3",
          "/audio/wren/m04-c2-b2.mp3",
          "/audio/wren/m04-c2-b3.mp3",
          "/audio/wren/m04-c2-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Priya's match-day photo, from the audit. Tap every leak hiding in it. Some of what's in frame is just a nice picture.",
          device: { app: "PHOTOS", owner: "TEST ACCOUNT (Priya's audit)" },
          header: [
            { label: "POST:", seg: { id: "cap", text: "match day!! ⚽🔥" } },
            { label: "SCAN:", seg: { id: "scan", text: "ARC photo audit: what's actually in frame?" } },
          ],
          body: [
            [{ id: "p1", text: "In frame: the team, in Riverdale Academy crested kit", tellId: "crest" }],
            [{ id: "p2", text: "In frame: Priya mid-save (a genuinely great save)" }],
            [{ id: "p3", text: "In frame: a street sign by the gates reading 'Mill Lane'", tellId: "street" }],
            [{ id: "p4", text: "In frame: the sky, some clouds, a nice sunset" }],
            [{ id: "p5", text: "Under the photo: 📍 a location tag, added by the phone", tellId: "geo", mono: true }],
          ],
          tells: [
            { id: "crest", label: "The crest", why: "The uniform names her exact school. No caption needed, no typing." },
            { id: "street", label: "The street sign", why: "A background sign puts the school on a map, down to the road." },
            { id: "geo", label: "The location tag", why: "The phone tagged the exact spot automatically. Nobody typed a word." },
          ],
          doneLine: "Three leaks, and not one of them in the caption she actually wrote. The crest, the sign, the silent tag. That's exactly why PACKRAT loves a photo.",
          doneAudio: "/audio/wren/m04-c2-review.mp3",
        },
      },
      playAudio: "/audio/wren/m04-c2-play.mp3",
    },

    /* --------------------------------------------- cycle 3: the fun quiz trap (SORT) */
    {
      id: "quiz",
      title: "The fun quiz that isn't",
      concept: "Those 'fun' quizzes are quietly harvesting the answers to your security questions",
      checkpoint: {
        questions: [
          { id: "m04-c3-chk1", question: "A quiz going round says 'Your elf name = your first pet plus your birth month!'. Why is joining in risky?", options: ["Elf names are a bit childish and embarrassing", "First pet and birth month are answers banks use to check it is really you", "It will spam a link to all of your friends"], answer: 1, ok: "Spot on. Those are not random. They are the exact security answers that unlock accounts, and the quiz just got you to post them for laughs.", okVoice: "/audio/wren/m04-c3-chk1-ok.mp3" },
          { id: "m04-c3-chk2", question: "Which of these 'fun' quizzes is actually SAFE to join in?", options: ["Which pizza topping matches your personality?", "Your rockstar name = your first street plus your first pet", "Your secret code = the town you were born in plus your mum's maiden name"], answer: 0, ok: "That is the safe one. It asks for an opinion, not a real fact from your life. The dangerous ones always fish for facts.", okVoice: "/audio/wren/m04-c3-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to spot the quiz that's really fishing for your secrets.",
      instruction: "Sort each quiz: harmless fun, or is it fishing for a real secret?",
      intel: {
        beats: [
          "PACKRAT's favourite trick isn't sneaky at all. It's FUN. 'Your superstar name is your first pet plus your street name!' Everyone joins in, laughing.",
          "But look at what it's actually asking for. Your first pet. Your street. Your first school. Your mum's maiden name.",
          "Those aren't random. They're the exact 'security questions' your bank and your apps use to check it's really you. You just posted the answers, as a joke, in public.",
          "So when a quiz asks for a real FACT about your past, that's not a game. That's PACKRAT, holding out a bucket and hoping you fill it.",
        ],
        beatAudio: [
          "/audio/wren/m04-c3-b1.mp3",
          "/audio/wren/m04-c3-b2.mp3",
          "/audio/wren/m04-c3-b3.mp3",
          "/audio/wren/m04-c3-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "A feed full of 'fun' quizzes. Sort each one: harmless fun, or is it fishing for a real secret about you?",
          buckets: [
            { id: "fun", label: "HARMLESS FUN", hint: "opinions only" },
            { id: "secret", label: "FISHING FOR A SECRET", hint: "real facts about you" },
          ],
          items: [
            { id: "q1", label: "Which cartoon character are you? Take the quiz!", bucket: "fun", why: "Pure opinion, nothing real about you. Actually harmless." },
            { id: "q2", label: "Your rockstar name = your first pet + your street", bucket: "secret", why: "First pet and street are classic security answers. Never post them." },
            { id: "q3", label: "Rate this new song out of ten!", bucket: "fun", why: "An opinion, and a forgettable one. Gives nothing away." },
            { id: "q4", label: "Your spy code = your first school + mum's maiden name", bucket: "secret", why: "Both are exactly what a bank asks to reset your account. Straight in the bucket." },
            { id: "q5", label: "Tag a friend who'd survive a zombie apocalypse", bucket: "fun", why: "Silly, and about nobody's real life. Fine to join in." },
            { id: "q6", label: "Your elf name = the town you were born in + your birth month", bucket: "secret", why: "Birth town and birth month, posted straight onto PACKRAT's list." },
            { id: "q7", label: "Post your favourite pizza topping!", bucket: "fun", why: "A topping tells a stranger nothing they can use. Harmless." },
          ],
          doneLine: "See the pattern? The 'fun' ones ask for OPINIONS. The dangerous ones ask for FACTS from your real life, the same facts that unlock your accounts.",
        },
      },
      playAudio: "/audio/wren/m04-c3-play.mp3",
    },

    /* --------------------------------------------- cycle 4: scrub the post (REDACT) */
    {
      id: "scrubpost",
      title: "Scrub the post",
      concept: "Before a post goes up, black out the bits that hand a stranger your where-and-when",
      checkpoint: {
        questions: [
          { id: "m04-c4-chk1", question: "Priya's friend is about to post this. Which part should she black out before it goes up?", evidence: "Buzzing after drama club! We meet at St Mark's Hall every Thursday at 5.", options: ["The word buzzing, it sounds a bit too excited", "Nothing, the whole post is fine to share", "St Mark's Hall and every Thursday at 5, the where and the when"], answer: 2, ok: "Exactly. Keep the excitement, black out the where-and-when. A stranger should learn she is happy, and nothing else.", okVoice: "/audio/wren/m04-c4-chk1-ok.mp3" },
          { id: "m04-c4-chk2", question: "Which line is completely safe to keep in a post, with no scrubbing needed?", options: ["We train on Oak Road every Monday night", "That was the best game I have ever played", "Come find me at Northgate School at 4"], answer: 1, ok: "That is the one. A feeling gives a stranger nothing to stand on. The other two hand over exactly where and when to find you.", okVoice: "/audio/wren/m04-c4-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to scrub a post down to the bits that are actually safe to share.",
      instruction: "Black out everything a stranger could use to find Priya in person.",
      intel: {
        beats: [
          "Here's the good news. You don't have to go silent to stay safe. You just have to scrub. Read a post before it goes up, the way PACKRAT will.",
          "Some bits are completely fine. That you had a great game. That you're buzzing about it. Feelings give a stranger nothing.",
          "But the WHERE and the WHEN? Your school's name, the street, 'every Tuesday at six', a live location? Those put a stranger at your door.",
          "So black out the where-and-when, keep the feeling, and post THAT. Same fun, none of the map.",
        ],
        beatAudio: [
          "/audio/wren/m04-c4-b1.mp3",
          "/audio/wren/m04-c4-b2.mp3",
          "/audio/wren/m04-c4-b3.mp3",
          "/audio/wren/m04-c4-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "REDACT",
        payload: {
          intro: "Priya's about to post this. Black out every bit a stranger could use to find her in person. Leave the harmless bits.",
          surface: "Priya's match-day post",
          spans: [
            { id: "feel1", text: "Best game of my life today!", risky: false, why: "A feeling. Gives a stranger nothing to work with. Keep it." },
            { id: "school", text: "playing for Riverdale Academy", risky: true, why: "Names her exact school. That's a WHERE. Black it out." },
            { id: "feel2", text: "so buzzing right now", risky: false, why: "Pure excitement. Totally safe to share." },
            { id: "street", text: "we practise on Mill Lane", risky: true, why: "A street plus a school is a map pin. Hide it." },
            { id: "when", text: "every Tuesday til 6pm", risky: true, why: "Where AND when, in public. This is the one that puts a stranger at the pitch." },
            { id: "invite", text: "so proud of this team", risky: false, why: "A feeling about her team. Nothing a stranger can stand on. Keep it." },
          ],
          doneLine: "That's scrubbed. The excitement stays, the map disappears. A stranger reading this now learns Priya is happy, and absolutely nothing else.",
          doneLabel: "POST IT SAFELY",
          doneAudio: "/audio/wren/m04-c4-review.mp3",
        },
      },
      playAudio: "/audio/wren/m04-c4-play.mp3",
    },

    /* --------------------------------------------- cycle 5: scrub by priority (DECIDE) */
    {
      id: "scrub",
      title: "Scrub by priority",
      concept: "You can't delete the internet, so take down the crumb that hurts most, first",
      checkpoint: {
        questions: [
          { id: "m04-c5-chk1", question: "An audit finds three of Jordan's leaks at once: an old blurry team photo, a joke about his birthday, and a public post saying 'at the skate park every Friday at 6'. He can fix ONE now. Which comes first?", options: ["The skate park every Friday at 6, a real place and time", "The old blurry team photo", "The birthday joke"], answer: 0, ok: "Right first move. A real-world where-and-when beats every other leak. That one comes down first, then the rest.", okVoice: "/audio/wren/m04-c5-chk1-ok.mp3" },
          { id: "m04-c5-chk2", question: "Panicking, Jordan wants to just delete his whole account instead. Why is that the wrong call?", options: ["Deleting an account is against the rules", "He would lose all of his likes and followers", "The file a stranger already built stays built, and he learns nothing"], answer: 2, ok: "That is it. Panic is not a plan. Scrub the most dangerous crumb first instead, calm and by priority.", okVoice: "/audio/wren/m04-c5-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn what to scrub first, and why panic is the wrong move.",
      instruction: "Priya has five minutes. Make the call: what comes down first?",
      intel: {
        beats: [
          "One thing makes assembly even easier for PACKRAT: the same handle everywhere. The same name on games, photos, and forums is one thread, tying every crumb together.",
          "So you'd think, delete everything! But you can't delete the internet, and you don't need to. Panic is not a plan.",
          "Analysts scrub by PRIORITY. Not the most embarrassing crumb. The most DANGEROUS one. The one that could put a stranger in front of you.",
          "So which is that? Where you'll be, and when. A real-world place and time beats every other leak. That one comes down first, every single time.",
        ],
        beatAudio: [
          "/audio/wren/m04-c5-b1.mp3",
          "/audio/wren/m04-c5-b2.mp3",
          "/audio/wren/m04-c5-b3.mp3",
          "/audio/wren/m04-c5-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "The audit found three loud crumbs, and Priya has five minutes before practice. Make the call.",
          situation:
            "The audit flagged three live leaks: a public 'practice every Tuesday til 6' comment, the located match photo, and the birthday-math joke. Priya can fix ONE thing right now.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "schedule",
              label: "Delete the practice-schedule comment",
              correct: true,
              outcome:
                "Clean. WHERE plus WHEN a stranger could find her in person beats every other leak. Scrub that first, then the photo, then the birthday joke.",
            },
            {
              id: "handle",
              label: "Rename her handle everywhere first",
              outcome:
                "Worth doing, it cuts the thread for FUTURE crumbs. But the schedule is a real-world where-and-when, happening this week. That goes first.",
            },
            {
              id: "nuke",
              label: "Delete the whole account in a panic",
              outcome:
                "That's panic, not analysis. She loses everything, learns nothing, and the file PACKRAT already built stays built. Scrub smart instead.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m04-c5-play.mp3",
    },

    /* --------------------------------------------- cycle 6: know PACKRAT's play (PROFILE) */
    {
      id: "play",
      title: "Know PACKRAT's play",
      concept: "PACKRAT never hacks; he collects public crumbs, links them by your handle, and sells the file",
      checkpoint: {
        questions: [
          { id: "m04-c6-chk1", question: "Someone uses the exact same username on their game, their photo app, and a forum. How does that HELP a collector like PACKRAT?", options: ["It makes their username a little easier to spell", "It is one thread that ties all of their accounts together", "It has no real effect on anything at all"], answer: 1, ok: "That is the thread he pulls. One handle links every account, so every crumb comes along together. Vary it and you cut the thread.", okVoice: "/audio/wren/m04-c6-chk1-ok.mp3" },
          { id: "m04-c6-chk2", question: "Which of these is NOT part of PACKRAT's method?", options: ["Breaking into a locked account", "Saving public crumbs and keeping them forever", "Stacking the crumbs into a file and selling it"], answer: 0, ok: "Correct. He never breaks in. He only collects, links, and sells what you already left lying out. That is the whole game.", okVoice: "/audio/wren/m04-c6-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn PACKRAT's whole game, and the one thing that starves him.",
      instruction: "Tap the 3 moves that are really PACKRAT's.",
      intel: {
        beats: [
          "Let's name PACKRAT's game so you see it coming. Move one, he COLLECTS. He never breaks into anything. He just saves every crumb you drop in public, and he keeps it forever.",
          "Move two, he LINKS. The same handle on every app is a thread. He pulls it, and every crumb from every account comes along for the ride.",
          "Move three, he ASSEMBLES and SELLS. Stacked crumbs become a file, a where, a when, a name, and he auctions it to whoever's buying.",
          "And the counter to all of it? Give him nothing worth linking. Different handles, no where-and-when, backgrounds checked. An empty nest is a very bored magpie.",
        ],
        beatAudio: [
          "/audio/wren/m04-c6-b1.mp3",
          "/audio/wren/m04-c6-b2.mp3",
          "/audio/wren/m04-c6-b3.mp3",
          "/audio/wren/m04-c6-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Here's the evidence from tonight. Tap the 3 moves that are really PACKRAT's.",
          evidence: [
            "Every crumb came from a PUBLIC post",
            "The same handle tied every account together",
            "He never once broke into anything",
          ],
          behaviors: [
            { id: "collect", label: "Saves every public crumb you drop, forever", matches: true },
            { id: "link", label: "Links your accounts together by your reused handle", matches: true },
            { id: "assemble", label: "Stacks the crumbs into a file and sells it", matches: true },
            { id: "guess", label: "Runs a rig to guess your password", matches: false },
            { id: "prize", label: "Sends a fake 'you've won!' giveaway", matches: false },
            { id: "rush", label: "Warns your account will shut in 24 hours", matches: false },
          ],
          picks: 3,
          doneLine: "Collect, link, assemble. No hacking anywhere, just patience and a good memory. So starve him: give him nothing to link, and nothing worth stacking.",
        },
      },
      playAudio: "/audio/wren/m04-c6-play.mp3",
    },

    /* --------------------------------------------- cycle 7: lock down your trail (BUILD) */
    {
      id: "lockdown",
      title: "Lock down your trail",
      concept: "The footprint clean-up: audit your posts, kill location, go private, vary your handle",
      checkpoint: {
        questions: [
          { id: "m04-c7-chk1", question: "You are starting a footprint clean-up on your own accounts. What is the sensible FIRST step?", options: ["Buy yourself a brand-new phone", "Post lots more to bury the old posts", "Audit your recent posts the way a collector would"], answer: 2, ok: "Right. You cannot scrub what you have not spotted. Look at your own posts first and find the leaks.", okVoice: "/audio/wren/m04-c7-chk1-ok.mp3" },
          { id: "m04-c7-chk2", question: "As part of the clean-up, what does turning location tags OFF actually stop?", options: ["Your friends from ever finding you again", "Your phone from stapling the exact spot onto your photos", "Your photos from saving to your phone at all"], answer: 1, ok: "Exactly. It kills the silent geotag your phone adds on its own. One setting, and that leak is closed.", okVoice: "/audio/wren/m04-c7-chk2-ok.mp3" },
        ],
      },
      promise: "You'll build the exact plan to starve the nest for good.",
      instruction: "Build the footprint clean-up. Pick the right move for each step.",
      intel: {
        beats: [
          "So how do you starve the nest for good? A footprint clean-up, in four steps, and you can do it this week.",
          "Step one, audit. Look at your last few posts the way PACKRAT does. Where's the where, the when, the school, the face in the background?",
          "Steps two and three, kill location and go private. Turn location tags off, and set the accounts that don't need to be public, to private.",
          "Step four, cut the thread. Use a different handle where you can, so your game name can't lead a stranger straight to your real one.",
        ],
        beatAudio: [
          "/audio/wren/m04-c7-b1.mp3",
          "/audio/wren/m04-c7-b2.mp3",
          "/audio/wren/m04-c7-b3.mp3",
          "/audio/wren/m04-c7-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Build Priya's footprint clean-up. For each step, pick the move that actually starves the nest.",
          target: "Priya's footprint clean-up",
          slots: [
            {
              id: "start",
              label: "Start by",
              options: [
                { id: "s1", label: "Auditing your recent posts like PACKRAT would", good: true, why: "You can't scrub what you haven't spotted. See the leaks first." },
                { id: "s2", label: "Deleting the whole account in a panic", good: false, why: "You lose everything and learn nothing, and the old file stays built. Scrub smart." },
              ],
            },
            {
              id: "photos",
              label: "For photos",
              options: [
                { id: "p1", label: "Turn location tags off", good: true, why: "Kills the silent geotag your phone staples onto every photo." },
                { id: "p2", label: "Just crop the picture a bit", good: false, why: "Cropping doesn't touch the hidden location tag, the crest, or the sign." },
              ],
            },
            {
              id: "privacy",
              label: "For personal stuff",
              options: [
                { id: "v1", label: "Set personal accounts to private", good: true, why: "Only people you actually approve can read the crumbs." },
                { id: "v2", label: "Keep everything public for more likes", good: false, why: "Every public crumb goes straight to the nest. Likes aren't worth a file." },
              ],
            },
            {
              id: "handle",
              label: "Across apps",
              options: [
                { id: "h1", label: "Use a different handle where you can", good: true, why: "Breaks the thread, so one name can't link all your accounts together." },
                { id: "h2", label: "Use the same catchy handle everywhere", good: false, why: "That's the exact thread PACKRAT pulls. Same name links every crumb." },
              ],
            },
          ],
          testLine: "Posts audited, location off, personal accounts private, handles varied. The nest gets nothing new, and the file PACKRAT already has goes stale.",
          doneLine: "That's a starved nest. Do the audit this week, one real post at a time. PACKRAT can only ever keep what you leave lying out.",
        },
      },
      playAudio: "/audio/wren/m04-c7-play.mp3",
    },
  ],

  incident: {
    title: "Paper Trail",
    phases: 3,
    phaseNames: ["Read the file", "Scrub the sources", "Poison the auction"],
    component: Mission04Incident,
  },

  catchThem: {
    intro:
      "Okay Agent, this is the real test. Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned about the nest and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m04-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 19 fresh, think-for-yourself questions across the 7 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 assembly · 1 photo · 2 quiz · 3 scrub-post · 4 scrub-priority
    //        5 PACKRAT's-play · 6 lock-down.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "You post four harmless things over a week. Why might that be risky?", options: ["Combined, they build a full file on you", "One of them might have a spelling error", "Posting a lot can look a bit uncool", "Old posts slow your phone right down"], answer: 0 },
      { id: "cq2", skill: 0, prompt: "Which single post is dangerous ON ITS OWN?", options: ["None; it's the combining", "The one with the most likes on it", "The one you posted late at night", "The one with an emoji in it"], answer: 0 },
      { id: "cq3", skill: 0, prompt: "A stranger knows your school, team, and practice time. How did they most likely get it?", options: ["From separate public posts, combined", "By hacking into the school's computers", "By guessing your account password", "From a fake prize link you tapped"], answer: 0 },
      { id: "cq4", skill: 1, prompt: "Before posting a photo, what does an analyst check?", options: ["The background and the tags", "Whether the smile looks good", "Which filter is the trendiest", "How fast it will get likes"], answer: 0 },
      { id: "cq5", skill: 1, prompt: "A team photo gives away your school with NO caption. How?", options: ["The crest on the uniform", "The number of players in it", "The weather in the sky", "The brand of the camera"], answer: 0 },
      { id: "cq6", skill: 1, prompt: "Where does a photo's location tag usually come from?", options: ["The phone adds it on its own", "The school types it in for you", "A friend adds it on later", "It only shows if you ask"], answer: 0 },
      { id: "cq7", skill: 2, prompt: "A 'fun' quiz asks for your first pet and your street. Why is that risky?", options: ["They're answers to security questions", "Quizzes are always a waste of time", "It might spam your whole friends list", "Pets and streets are boring facts"], answer: 0 },
      { id: "cq8", skill: 2, prompt: "Which quiz is actually SAFE to share?", options: ["Which cartoon character are you?", "Your name = first pet + your street", "Your code = birth town + birth month", "Your ID = first school + mum's name"], answer: 0 },
      { id: "cq9", skill: 2, prompt: "Why does PACKRAT disguise the harvest as a game?", options: ["It's fun, so people just share", "Games are just cheaper to build", "It is the only trick he knows", "A quiz can never be reported"], answer: 0 },
      { id: "cq10", skill: 3, prompt: "You want to post about your match. What's safe to keep in?", options: ["That you had a great time", "The exact name of your school", "The street where you practise", "The time your practice ends"], answer: 0 },
      { id: "cq11", skill: 3, prompt: "Which bit of a post puts a stranger at your door?", options: ["Where you'll be, and when", "How happy you felt", "Which emoji you chose", "The colour of your football kit"], answer: 0 },
      { id: "cq12", skill: 3, prompt: "Staying safe online actually means you should:", options: ["Scrub the where-and-when", "Delete every account that you own", "Never post a single photo again", "Only ever post about the weather"], answer: 0 },
      { id: "cq13", skill: 4, prompt: "You can fix ONE leak right now. Which comes first?", options: ["Where you'll be, and when", "A slightly blurry old team photo", "A caption with a small typo", "An account you never really use"], answer: 0 },
      { id: "cq14", skill: 4, prompt: "Why NOT just delete your whole account in a panic?", options: ["The already-built file still exists", "Deleting accounts is against the rules", "You would lose all of your likes", "It makes your phone run slow"], answer: 0 },
      { id: "cq15", skill: 5, prompt: "PACKRAT's whole method, in one line, is:", options: ["Collect, link, and sell your crumbs", "Guess your password millions of times", "Send fake prizes to reel you in", "Rush you with 24-hour warnings"], answer: 0 },
      { id: "cq16", skill: 5, prompt: "How does using the SAME handle everywhere help PACKRAT?", options: ["It links your accounts together", "It makes your name easier to spell", "It gets all your posts more likes", "It has no real effect at all"], answer: 0 },
      { id: "cq17", skill: 5, prompt: "Which is NOT one of PACKRAT's moves?", options: ["Breaking into a locked account", "Saving your public crumbs", "Linking accounts by your handle", "Selling the assembled file"], answer: 0 },
      { id: "cq18", skill: 6, prompt: "What's the FIRST step in a footprint clean-up?", options: ["Audit your recent posts for leaks", "Buy yourself a brand-new phone", "Make every account you own public", "Post lots more to bury old posts"], answer: 0 },
      { id: "cq19", skill: 6, prompt: "Turning location tags OFF stops:", options: ["Your phone tagging a photo's location", "Your friends from ever finding you again", "Your photos from saving to the phone", "Your posts from getting any likes"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "You ran the assembly attack and saw it plain: four harmless crumbs, stacked into one file, no break-in anywhere.",
      "You read what a photo and a 'fun' quiz quietly hand over, and scrubbed a post down to just the feeling.",
      "You took the sources down by priority, named PACKRAT's game, and poisoned the auction. Stale data sells for nothing.",
    ],
    realWorldMove:
      "This week: audit your own top three posts the way PACKRAT would. Check the background, the tags, and the handle. Turn location tags off, and scrub anything that says where you'll be and when. Do it with a parent if an account is shared.",
    wrenLine: "File closed, nest empty. Watch what you drop, Agent. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m04-transmission.mp3",
    briefing: "/audio/wren/m04-briefing.mp3",
    debrief: "/audio/wren/m04-debrief.mp3",
  },

  dossier: {
    mo: "Never breaks in. He pockets the crumbs you drop, links them by your handle, stacks them into a file, and sells it. His whole motto: you left it out, he picked it up.",
    defeatedBy: "Anyone who checks the background, kills the location tags, varies their handle, and scrubs the where-and-when before anything else.",
  },
};

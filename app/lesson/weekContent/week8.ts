import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 8 - Photos & Videos: Think Before You Share. REBUILT to the Learn-Loop
 * Build Standard v0.10 (2026-09-17, the ninth rebuilt week). World: the
 * Darkroom (amber safelight, photo prints on a line, developing trays, the
 * cast as photographers). The week where a photo stops being "just a photo"
 * and becomes copies, faces, clues and doors.
 *
 *   0 video · 1 alert · 2 ATLAS briefing · 3 mission
 *   5 x (Learn -> Game -> Prove -> Recap):
 *     1 COPIES   delete only deletes your copy       | undoTest       The Undo Test (ACT AND SEE)       | finish
 *     2 CONSENT  their face, their call               | askRing        The Ask Ring (ASK AND RESPECT)    | recall
 *     3 CLUES    photos talk                          | developingTray The Developing Tray (DEVELOP, SPOT)| speed
 *     4 DOORS    pick the door that fits              | believeOMeter  The Door Dial (doors skin)        | lie
 *     5 RITUAL   look, think, ask                     | clueStamper    The Photo Detective (photo skin)  | order
 *   24 review: cyberMaze "The Share Maze" (darkroom skin) · 25 quiz boss (5 questions, pass 4)
 *   26 video · 27 debrief · 28 stickers · 29 completion. 30 screens; the old
 *   screen-4 signature (the tray) now lives behind its lesson as concept 3.
 *
 * Engine reuse (audit-engine-reuse): undoTest and askRing are NEW; the tray is
 * the week's own signature made tap-only and data-driven. BelieveOMeter (W4),
 * ClueStamper (W3) and CyberMaze (W3, review) are re-themes under the amended
 * reuse rule (owner decided option B): different skill, non-neighbouring
 * weeks, under cap, at most two concept-game re-themes.
 *
 * Content fixes carried in: no game before Learn 1, the paper-pigeon metaphor
 * replaced by the copies the child can see on the phones, the body-privacy
 * item moved out of a timed sort into a calm Learn and an untimed dial item,
 * every item has a readAloud, verdicts are one take with the reason, a teach
 * on every Prove-it, a spoken payoff on every complete beat, and no dash-style
 * punctuation in child-facing copy. Dialogue audited to 0 flags on both layers
 * with `node scripts/audit-narration-flow.mjs --week=8`.
 */
export const WEEK_8: WeekContent = {
  weekNumber: 8,
  title: "Photos & Videos: Think Before You Share",
  topic: "photo-video-sharing",
  badgeName: "Photo Detective",
  badgeIcon: "🕵️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 8: THINK BEFORE YOU SHARE", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the photo that ran away
    { type: "video", videoPlaceholder: "Week 8: The Runaway Photo", videoSrc: "/videos/module-08-intro.mp4" },

    // 1 - ALERT: incident report (Sarah reads the caption word for word, then reacts)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-08.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "A kid shared one photo with one friend. The Raccoon grabbed a copy and passed it on, and the school crest and street sign in the background showed strangers her school and her street. This week you become a Photo Detective.",
      photoCaption: "Wk 8 - Think Before You Share",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, grab your magnifying glass and read this incident report with me.",
          "A kid shared one photo with one friend. The Raccoon grabbed a copy and passed it on, and the school crest and street sign in the background showed strangers her school and her street. This week you become a Photo Detective.",
          "[whispers] One photo, one friend. And a crest and a sign told strangers the rest.",
          "[warmly] By the end of today, no photo leaves your hands until you have checked every corner.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[8] },

    // 3 - Mission brief (learn this, so you're protected from that)
    {
      type: "mission",
      objectives: [
        "Learn that delete only deletes your copy, so you do your thinking before a photo ever goes",
        "Learn to ask every face and check every corner, so no friend and no clue gets shared by accident",
        "Learn to pick the door that fits and run look, think, ask, so strangers never see what is not for them",
      ],
    },

    /* ─────────── BEAT 1 · DELETE ONLY DELETES YOUR COPY ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Once It's Out, It's Out",
      content:
        "Here is the biggest photo secret: DELETE only deletes YOUR copy. The moment you share a photo, copies land on your friend's phone, in the group chat and on the app's computers. A friend can screenshot it or send it on. You cannot reach into their phones and take it back. That is not scary if you remember it BEFORE you share.",
      bullets: [
        "Delete only deletes YOUR copy",
        "Every share makes NEW copies",
        "A screenshot is a copy you can't see",
        "The app keeps a copy too",
        "Remember it BEFORE you share",
      ],
      bulletIcons: ["🗑️", "📱", "📸", "⚙️", "💡"],
      emblem: "📸",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero. Today we step into the darkroom, where photos are made!",
          "And here is the biggest photo secret of all.",
          "[whispers] When you share a photo, copies land on other phones. And DELETE only deletes YOUR copy.",
          "Your friend's copy stays on your friend's phone. The app keeps one too.",
          "[warmly] So the time to think is before you share, not after.",
          "[excited] Come and put delete to the Undo Test, and see what it really does!",
        ],
      },
    },
    // 5 - Game: ACT AND SEE "The Undo Test" (undoTest, new engine)
    {
      type: "undoTest",
      threat: {
        raccoonLine:
          "Post it, delete it, done? Ha! By the time a kid taps delete, I have already saved my copy. Delete is my favourite button. It never touches mine!",
      },
      introTitle: "The Undo Test",
      introSubtitle: "Share a photo with three friends, tap DELETE, then check every friend's phone. Then tap the card that is true.",
      introIcon: "🗑️",
      shareLabel: "SHARE",
      deleteLabel: "DELETE",
      goneChip: "Gone from your phone",
      theirCopyChip: "Still on their phone",
      youLabel: "You",
      trueToast: "TRUE!",
      wrongTitle: "That's the fib",
      completeTitle: "Undo Test passed!",
      completeLine: "Delete only ever deletes your copy.",
      rounds: [
        {
          id: "silly-face",
          caption: "Your silliest face, mid-giggle",
          photoIcon: "😂",
          readAloud: "Your silliest face photo, mid-giggle. Tap SHARE, then tap DELETE, then check every friend's phone.",
          friends: [
            { id: "maya", name: "Maya", reaction: "Saved it!" },
            { id: "leo", name: "Leo", reaction: "So funny!" },
            { id: "sam", name: "Sam", reaction: "Keeping this one!" },
          ],
          cardPrompt: "So what is true?",
          cards: [
            { text: "Your copy is gone. Their copies are still there.", isTrue: true, whyWrong: "" },
            { text: "Delete took it back from every phone.", isTrue: false, whyWrong: "Look at the three phones. Delete only emptied yours, and their copies never moved." },
            { text: "It was only shared for a second, so it doesn't count.", isTrue: false, whyWrong: "A second is plenty. The moment it landed, each friend had a copy of their own." },
          ],
          why: "Delete emptied your phone, and three copies stayed on three phones. That is what once it's out, it's out means.",
        },
        {
          id: "vanishing",
          caption: "A vanishing photo: gone in 10 seconds",
          photoIcon: "⏱️",
          readAloud: "A vanishing photo that disappears in ten seconds. Share it, delete it, and check what each friend's phone still has.",
          friends: [
            { id: "zara", name: "Zara", reaction: "Screenshot!" },
            { id: "kai", name: "Kai", reaction: "Snapped it in time!" },
            { id: "ava", name: "Ava", reaction: "Screenshot too!" },
          ],
          cardPrompt: "So what is true?",
          cards: [
            { text: "A screenshot beats the timer, so copies still exist.", isTrue: true, whyWrong: "" },
            { text: "Vanishing photos always vanish for everyone.", isTrue: false, whyWrong: "A screenshot is a brand new copy that the timer never touches. Look at the friends' phones." },
            { text: "The app deletes their screenshots too.", isTrue: false, whyWrong: "A screenshot lives in your friend's own pictures. The app cannot reach in and delete it." },
          ],
          why: "The timer only cleared the app. Each screenshot is a new copy on a friend's phone, so vanishing never means gone.",
        },
        {
          id: "sent-on",
          caption: "Your drawing, sent to the group chat",
          photoIcon: "🎨",
          readAloud: "Your drawing, sent to the group chat. Share it, delete it, and check where the copies went next.",
          friends: [
            { id: "leo", name: "Leo", reaction: "Sent it to my cousin!" },
            { id: "maya", name: "Maya", reaction: "Saved it!" },
            { id: "sam", name: "Sam", reaction: "Posted it on my page!" },
          ],
          cardPrompt: "So what is true?",
          cards: [
            { text: "Copies can make more copies you never sent.", isTrue: true, whyWrong: "" },
            { text: "Only the people you sent it to can ever have it.", isTrue: false, whyWrong: "Look at Leo's phone. He sent it to his cousin, so someone you never picked has a copy too." },
            { text: "The app throws its copy away when you delete yours.", isTrue: false, whyWrong: "The app keeps its own copy on its own computers. Your delete button cannot reach them." },
          ],
          why: "One share, and the copies made more copies, all the way to people you never picked. That is why the thinking happens before you share.",
        },
      ],
      hints: {
        tier1: "Watch the phones after you tap DELETE. Which copy disappeared?",
        tier2: "Delete only empties YOUR phone. Every friend's copy, screenshot and send-on stays where it landed.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, you run the Undo Test!",
          "This game is all about what the delete button really does.",
          "Out in the real world, a photo lands on other phones the instant you share it.",
          "Here is what you do. A photo sits on your phone. Tap SHARE, and watch it land on three friends' phones. Then tap DELETE on your phone. Then tap each friend's phone to check what is on it. Last, three cards appear. Tap the one that is TRUE.",
          "[warmly] Keep your eyes on all the phones, not just yours. Ready? First photo!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here is your phone, with a photo on it, and your friends' phones all around."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Undo Test passed, Cyber Hero! You watched the copies stay put.",
          "[warmly] Out in the real world, delete only ever deletes your copy. So you do your thinking before you share.",
        ],
      },
    },
    // 6 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Delete only deletes ___ copy.",
      choices: [
        { text: "your", isCorrect: true },
        { text: "every", isCorrect: false, why: "Every copy? Think back to the phones. Their copies stayed right where they landed." },
        { text: "the app's", isCorrect: false, why: "The app keeps its own copy on its own computers. Your delete never reaches it." },
        { text: "your friend's", isCorrect: false, why: "Your friend's copy lives on your friend's phone. Only they can delete it." },
      ],
      praise: "Only YOUR copy. Now you know the secret! ✓",
      nudge: "When you tapped DELETE, which phone went empty?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Delete only deletes your copy.",
          "Every other copy stays where it landed.",
          "[warmly] So the thinking happens before you share.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Delete only deletes YOUR copy. A shared photo is out for good, so think before you share.",
      next: "whose photo it really is when a friend is in it",
      emblem: "📸",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] What a test, Cyber Hero. Delete got caught out.",
          "Your copy gone, every other copy still there.",
          "[whispers] But some photos have more than your face in them. What about your friends' faces?",
          "Next, we'll learn whose photo it really is when a friend is in it. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · THEIR FACE, THEIR CALL ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Their Face, Their Call",
      content:
        "When a friend is in your photo, whose photo is it? It is their face, so it is their call too. Before you post or send a picture of ANYONE, ask them first. If they say no, you listen: leave them out, or don't post it. And the flip side: if a photo of YOU goes up and you don't like it, you can ask for it to come down. Heroes ask both ways.",
      bullets: [
        "A photo of a friend is THEIR face too",
        "Ask before you post ANYONE",
        "A no means leave them out, or don't post",
        "Sent just to you is NOT yours to send on",
        "You can ask for yours to come down too",
      ],
      bulletIcons: ["👤", "💬", "✋", "🤫", "⭐"],
      emblem: "💬",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] So, Cyber Hero, when your friend is in a photo, whose face is it?",
          "Theirs! So posting it is their call too.",
          "Before you post or send anyone's picture, you ask them first.",
          "[whispers] If they say no, you listen. Leave them out, or don't post it at all.",
          "And if a photo of you goes up that you don't like? You can ask for it to come down.",
          "[excited] Come and ask every face in the Ask Ring!",
        ],
      },
    },
    // 9 - Game: ASK AND RESPECT "The Ask Ring" (askRing, new engine)
    {
      type: "askRing",
      threat: {
        raccoonLine:
          "Nobody asks! A funny face, a quick post, and the whole class is laughing. And if they wanted to say no? Too late, it's already out there. My kind of photo!",
      },
      introTitle: "The Ask Ring",
      introSubtitle: "Everyone in the photo gets asked. Tap each friend to hear their answer. A yes glows. A no needs your hero move. Then POST lights up.",
      introIcon: "💬",
      postLabel: "POST",
      leaveOutLabel: "Leave them out",
      dontPostLabel: "Don't post it",
      yesChip: "Yes!",
      noChip: "No thanks",
      leftOutChip: "Left out",
      postToast: "POSTED WITH A YES!",
      keptToast: "KEPT OFF THE INTERNET!",
      wrongTitle: "Listen to that no again",
      completeTitle: "Every face asked!",
      completeLine: "Their face, their call. Every time.",
      rounds: [
        {
          id: "park",
          caption: "You, Maya and Leo on the climbing frame",
          photoIcon: "📸",
          readAloud: "A sunny photo from the park: you, Maya and Leo on the climbing frame. Tap each friend to ask before you post.",
          friends: [
            { id: "maya", name: "Maya", answer: "yes", says: "Yes! I look so cool!", readAloud: "Maya says: Yes, post it! I look so cool!" },
            { id: "leo", name: "Leo", answer: "yes", says: "Sure, it's a great one!", readAloud: "Leo says: Sure, post it. It's a great one!" },
          ],
          why: "Two friends, two yeses, and you asked before posting. That is exactly how a hero posts a photo.",
        },
        {
          id: "sleepover",
          caption: "Sleepover: you, Zara in her pyjamas, and Sam",
          photoIcon: "🎉",
          readAloud: "A sleepover photo: you, Zara in her pyjamas, and Sam pulling a funny face. Tap each friend to ask before you post.",
          friends: [
            {
              id: "zara",
              name: "Zara",
              answer: "no",
              says: "Not me in my pyjamas! Crop me out, please.",
              readAloud: "Zara says: Not me in my pyjamas! Crop me out, please.",
              noMove: "leaveOut",
              why: "Zara asked to be cropped out, so out she goes. Her no was about her own face, so the rest of the photo can still be posted.",
              whyWrong: "Zara asked to be cropped out, not for the whole photo to stay hidden. Leave her out, and Sam's yes still counts.",
            },
            { id: "sam", name: "Sam", answer: "yes", says: "Post it! My silly face is famous!", readAloud: "Sam says: Post it! My silly face is famous!" },
          ],
          why: "Zara left out, Sam said yes. Everyone in that photo had a say before it went anywhere.",
        },
        {
          id: "birthday",
          caption: "Ava's birthday: you, Ava and Kai with the cake",
          photoIcon: "🎂",
          readAloud: "Ava's birthday photo: you, Ava and Kai around the cake. Tap each friend to ask before you post.",
          friends: [
            {
              id: "ava",
              name: "Ava",
              answer: "no",
              says: "Don't post it anywhere, please. Mum says no party photos online.",
              readAloud: "Ava says: Don't post it anywhere, please. Mum says no party photos online.",
              noMove: "dontPost",
              why: "Her no was for the whole photo, so it stays off the internet. One no can keep a photo private, even when Kai says yes.",
              whyWrong: "Her no was about the whole photo, not just her face. Cropping her out would still post her party, so this one stays off the internet.",
            },
            { id: "kai", name: "Kai", answer: "yes", says: "Fine by me!", readAloud: "Kai says: Fine by me! Post it." },
          ],
          // A don't-post round ends on Ava's move and never reaches POST, so the
          // round's why repeats her line (same text = one recording).
          why: "Her no was for the whole photo, so it stays off the internet. One no can keep a photo private, even when Kai says yes.",
        },
      ],
      hints: {
        tier1: "Tap every friend in the photo and listen to exactly what they say.",
        tier2: "A yes glows. For a no, listen: crop me out means LEAVE THEM OUT. Don't post it anywhere means DON'T POST IT.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your second challenge, you step into the Ask Ring!",
          "This game is all about asking everyone in a photo before it goes anywhere.",
          "Out in the real world, it only takes one quick question, and it keeps everyone's face safe.",
          "Here is what you do. A photo appears with your friends in it. Tap each friend to ask, and listen to their answer. A yes glows. For a no, tap the hero move: leave them out, or don't post it. When every face is settled, tap POST.",
          "[warmly] Listen to exactly what each friend says. Ready? First photo!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a friend in the photo to ask them."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every face asked, Cyber Hero! Yeses posted, and every no respected.",
          "[warmly] Out in the real world, their face is their call. One quick ask before you post keeps everyone smiling.",
        ],
      },
    },
    // 10 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Before posting a photo of your friend, what comes FIRST?",
      choices: [
        { text: "Ask them", isCorrect: true },
        { text: "Pick a funny caption", isCorrect: false, why: "A caption can wait. Their face needs their yes before anything else." },
        { text: "Tag the whole class", isCorrect: false, why: "Tagging spreads it even further. Nobody gets tagged or posted before they say yes." },
        { text: "Post fast before they see", isCorrect: false, why: "Posting fast skips their say completely. Their face, their call, so you ask first." },
      ],
      praise: "Ask first. Their face, their call. ✓",
      nudge: "What did you do with every friend in the Ask Ring?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "You ask them first.",
          "Their face, their call, before any caption or tag.",
          "[warmly] And if they say no, you listen.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A photo of someone else is their face and their call. Ask before you post, and respect a no.",
      next: "the secret clues hiding in the corners of a photo",
      emblem: "💬",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Two powers, Cyber Hero. Every friend got a say.",
          "Yeses posted, and every no respected.",
          "[whispers] But even a photo with a yes can talk. It can tell strangers things you never said out loud.",
          "Next, we'll learn the secret clues hiding in the corners of a photo. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · PHOTOS TALK ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Photos Talk",
      content:
        "Every photo says more than cheese! A house number points at your front door. A school name on a wall or a jumper tells strangers where you are all day. A friend peeking in who never said yes is a face that is not yours to share. Real detectives check the corners of a photo BEFORE it goes anywhere.",
      bullets: [
        "A house number points at your home",
        "A school name tells where you are all day",
        "A friend in the corner still needs their yes",
        "Backgrounds talk to strangers too",
        "Detectives check every corner first",
      ],
      bulletIcons: ["🏠", "🏫", "👤", "👀", "🔍"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Now lean in close, Cyber Hero. Photos talk.",
          "A house number points right at your front door.",
          "A school name tells a stranger where you are all day.",
          "[nervous] And strangers can read every word of it.",
          "[warmly] So detectives check every corner before a photo goes anywhere.",
          "[excited] Come and develop a photo in the tray, and find what it gives away!",
        ],
      },
    },
    // 13 - Game: DEVELOP AND SPOT "The Developing Tray" (the week's signature, tap-only)
    {
      type: "developingTray",
      threat: {
        raccoonLine:
          "Kids look at the big smile in the middle and never at the corners. A door number here, a school name there. I read the corners. That's where the good stuff is!",
      },
      introTitle: "The Developing Tray",
      introSubtitle: "A photo is hiding in the tray. Tap every square to develop it, tap everything it gives away, then decide: SHARE or KEEP.",
      introIcon: "📸",
      developPrompt: "Tap every square to develop the photo",
      developReadAloud: "A photo is hiding in the developing tray. Tap every square of film, and watch the photo appear.",
      spotPrompt: "Tap everything this photo gives away",
      spotReadAloud: "There it is: a party, a trophy and a big smile. Now check every corner of the photo, the door, the wall and the edges. Tap everything it gives away.",
      leakCopy: {
        house: {
          chip: "House number 42!",
          bullet: "The house number 42 is right there on the front door",
          readAloud: "The door says forty-two. That number points a stranger straight to your home.",
        },
        school: {
          chip: "Oakwood School!",
          bullet: "The school name is on the pennant on the wall",
          readAloud: "And the pennant on the wall says Oakwood School. Now a stranger knows where you are all day.",
        },
        friend: {
          chip: "Never said yes!",
          bullet: "Your friend is peeking in from the corner, and never said yes",
          readAloud: "And in the bottom corner, your friend is peeking in. They never said yes to being in it.",
        },
      },
      decidePrompt: "Three clues found. SHARE it, or KEEP it?",
      decideReadAloud: "So, three clues in one happy photo. Share it, or keep it?",
      shareLabel: "SHARE",
      keepLabel: "KEEP",
      why: "A home, a school and a friend with no yes. A happy photo can still say far too much, so this one stays with you.",
      teach: {
        title: "That photo talks too much",
        body: "Look at the three clues again: the house number, the school name, and a friend who never said yes. Sharing it hands all three to anyone who sees it.",
        tip: "Clues in the corners? Keep it, or crop them out first.",
      },
      completeTitle: "Photo developed, clues found!",
      completeLine: "Every corner checked before anything goes.",
      hints: {
        tier1: "Tap every square of film until the whole photo shows.",
        tier2: "Check the edges: the door on the left, the wall at the top right, and the bottom corner.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, you work the Developing Tray!",
          "This game is all about finding what a photo gives away before it goes anywhere.",
          "Out in the real world, everyone looks at the smile in the middle, and the clues hide in the corners.",
          "Here is what you do. A photo is hiding under squares of film. Tap every square to develop it. Then tap everything the photo gives away. When you have found them all, tap SHARE or KEEP.",
          "[warmly] Check every corner, not just the middle. Ready? Start developing!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here is the developing tray, with a photo waiting under the film."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Photo developed and every clue found, Cyber Hero!",
          "[warmly] Out in the real world, you check the corners before the smile. A house number or a school name never slips past you.",
        ],
      },
    },
    // 14 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which clue tells strangers where you LIVE?",
      speedMs: 5000,
      choices: [
        { text: "The house number on the door", isCorrect: true },
        { text: "The balloons behind you", isCorrect: false, why: "Balloons look the same at every party. They point nowhere." },
        { text: "The sunny sky", isCorrect: false, why: "The sky looks the same over every town. It tells a stranger nothing." },
      ],
      praise: "Spotted in a flash. The house number talks loudest! ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "The house number points straight at your home.",
          "Balloons and sky tell a stranger nothing.",
          "[warmly] Check every corner, and no clue can hide.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Photos talk. House numbers, school names and faces without a yes give away more than you meant to share.",
      next: "who can actually see a photo once it is shared",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Not one corner got past you.",
          "House numbers, school names, friends with no yes. All found.",
          "[whispers] But even a clean photo leaves one question. Who is going to see it?",
          "Next, we'll learn who can actually see a photo once it is shared. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · PICK THE DOOR THAT FITS ─────────── */
    // 16 - Learn (the calm home of the body-privacy rule)
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Pick the Door That Fits",
      content:
        "Before a photo goes anywhere, ask: who can actually see this? Think of four doors. EVERYONE means the whole world, forever, strangers too. SCHOOL means the whole school, not just your class. FRIENDS sounds safe, but friends can screenshot and send it on. So faces and clues get the smallest door that fits, and a photo with no faces and no clues can go to everyone. Some photos are JUST ME: pictures of your body, like bath time or getting changed, and your secrets. They go through no door at all.",
      bullets: [
        "Everyone = the whole world, forever",
        "School = the whole school, not just your class",
        "Friends can still screenshot and send on",
        "Faces and clues get the smallest door",
        "Body photos are JUST ME: no door at all",
      ],
      bulletIcons: ["🌍", "🏫", "📱", "🚪", "🤫"],
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Picture four doors, Cyber Hero.",
          "A tiny door marked Just Me. A small door for friends. A bigger door for school. And a HUGE door marked Everyone.",
          "[whispers] Whatever walks through a door can't walk back out.",
          "So faces and clues get the smallest door that fits, and a photo with no faces and no clues can go to everyone.",
          "[warmly] And photos of your body, like bath time or getting changed, are Just Me photos. They get no door at all. If anyone ever asks you for one, tell a trusted grown-up.",
          "[excited] Come and find the door that fits on the Door Dial!",
        ],
      },
    },
    // 17 - Game: DIALS "The Door Dial" (believeOMeter re-theme, doors skin, W4 engine; untimed)
    {
      type: "believeOMeter",
      skin: "doors",
      threat: {
        raccoonLine:
          "Big doors, big audiences! Every photo through the Everyone door lands right in my paws. Nobody ever turns the dial down to a smaller door!",
      },
      introTitle: "The Door Dial",
      introSubtitle: "Four doors on one dial: Just Me, Friends, School and Everyone. Turn the needle to the door that fits each photo, then lock it in.",
      introIcon: "🚪",
      lockLabel: "LOCK IT IN",
      itemLabel: "Photo",
      fromLabel: "",
      doneLabel: "photos through the right door",
      dialNote: "Faces and clues: a small door. Your body and your secrets: Just me.",
      stopLabels: {
        justMe: "Just me",
        friends: "Friends",
        school: "School",
        everyone: "Everyone",
      },
      completeTitle: "Every photo through the right door!",
      completeLine: "The door that fits, and some photos get no door at all.",
      offers: [
        {
          id: "dragon",
          text: "Dragon drawing for the online art show",
          from: "No faces, no names",
          readAloud: "Your dragon drawing, for the online art show. No faces, no names, no clues.",
          answer: "everyone",
          why: "No faces, no names, no clues, and it's made for an art show. A drawing like that is safe to go through the Everyone door.",
          whyWrong: "The art show is for everyone, and this drawing has no faces and no clues at all. It is safe for the biggest door.",
        },
        {
          id: "volcano",
          text: "Class volcano project, everyone in uniform",
          from: "For the school newsletter",
          readAloud: "Your class volcano project, with everyone in school uniform. It's for the school newsletter.",
          answer: "school",
          why: "Uniforms name your school, and your school already knows that. The School door fits, and no stranger learns where you are.",
          whyWrong: "The uniforms name your school, so strangers should not see it, but the newsletter is for your school. The School door fits.",
        },
        {
          id: "party",
          text: "Party photo: three friends who said yes",
          from: "For the friends' group chat",
          readAloud: "A party photo with three friends in it. All three said yes to the friends' group chat.",
          answer: "friends",
          why: "Three faces, three yeses, for friends. Their faces are still not for strangers, so the Friends door fits.",
          whyWrong: "They said yes to friends seeing it. Everyone is too big a door, and Just Me would hide it from the friends it's for. The Friends door fits.",
        },
        {
          id: "bath",
          text: "Bath time photo from when you were tiny",
          from: "The family album",
          readAloud: "A bath time photo from when you were tiny, from the family album.",
          answer: "justMe",
          why: "Photos of your body are private. This is a Just Me photo, and it goes through no door at all.",
          whyWrong: "This photo shows your body, so it is private. It gets no door, not even a small one. It stays Just Me.",
        },
        {
          id: "brick-castle",
          text: "Brick castle for the building contest",
          from: "Just bricks, no clues",
          readAloud: "Your brick castle, for the online building contest. Just bricks on a plain table, no faces and no clues.",
          answer: "everyone",
          why: "Nothing but bricks, and no faces or clues anywhere. It was built to be shown off, so the Everyone door fits.",
          whyWrong: "Look for faces or clues. There are none, just bricks, and the contest is for everyone. The biggest door is safe for this one.",
        },
        {
          id: "diary",
          text: "Your secret diary page",
          from: "Your bedroom",
          readAloud: "A photo of your secret diary page.",
          answer: "justMe",
          why: "A secret diary is just for you, and so is a photo of it. It's a Just Me photo, with no door at all.",
          whyWrong: "Secrets are for you alone. A photo of a secret diary page stays Just Me, with no door at all.",
        },
      ],
      hints: {
        tier1: "Ask: are there faces or clues? Who is the photo for?",
        tier2: "No faces, no clues, made to show off: Everyone. For your school: School. Friends who said yes: Friends. Your body or your secrets: Just Me.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, you turn the Door Dial!",
          "This game is all about picking the door that fits each photo: Just Me, Friends, School or Everyone.",
          "Out in the real world, every share goes through one of those doors, so the door you choose decides who sees it.",
          "Here is what you do. A photo appears above the dial and I'll read it. Tap the arrows to move the needle to the door that fits. Then tap LOCK IT IN. Take your time. There is no clock.",
          "[warmly] Faces and clues get small doors, and private photos get none. Ready? First photo!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Listen to the photo. Then tap the arrows to move the needle, and tap Lock it in when it points at the door that fits."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every photo through the right door, Cyber Hero!",
          "[warmly] Out in the real world, you ask who will see it before you share. Faces and clues get small doors, and Just Me photos get none.",
        ],
      },
    },
    // 18 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "your account is PRIVATE, so your photos can NEVER escape!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Private makes the door smaller, but anyone inside can still screenshot a photo and send it on." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Private shrinks the door. Screenshots still get out. ✓",
      nudge: "Can a friend inside your private door still take a screenshot?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Busted. Private makes the door smaller, not locked.",
          "Anyone inside can still screenshot a photo and send it on.",
          "[warmly] So even behind a small door, you still think first.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Pick the door that fits. Faces and clues get small doors, body photos get no door, and private can still leak.",
      next: "the three-second ritual that uses every photo power at once",
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Four powers, Cyber Hero. Every photo found its door.",
          "Small doors for faces, no door for private photos, and his private-is-magic fib, busted.",
          "[whispers] One power is left, and it puts all the others together in three seconds.",
          "Next, we'll learn the ritual that uses every photo power at once. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · LOOK, THINK, ASK ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Look. Think. Ask.",
      content:
        "Here is the whole week in one hero ritual, three seconds long. LOOK at every corner: who is in it, and what is behind them? THINK: where is it going, and would I be happy for anyone to see it, forever? ASK: the people in it, and a grown-up if you are not sure. Look, think, ask, and only THEN does a photo go anywhere.",
      bullets: [
        "LOOK: who is in it, what is behind?",
        "THINK: where is it going, forever?",
        "ASK the people in it",
        "Not sure? Ask a grown-up",
        "Three seconds saves a photo",
      ],
      bulletIcons: ["👀", "🧠", "💬", "👪", "⚡"],
      emblem: "🧠",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Time for the ritual that puts it all together, Cyber Hero.",
          "LOOK. Who is in it, and what is behind them?",
          "THINK. Where is it going, and would you be happy for anyone to see it, forever?",
          "ASK. The people in it, and a grown-up if you're not sure.",
          "[whispers] Look. Think. Ask. Three seconds.",
          "[excited] Come and be the Photo Detective, and run the ritual on real prints!",
        ],
      },
    },
    // 21 - Game: STAMP "The Photo Detective" (clueStamper re-theme, photo skin, W3 engine)
    {
      type: "clueStamper",
      skin: "photo",
      rowLabels: {
        when: "WHO is in it?",
        who: "WHAT is behind them?",
        how: "WHERE is it going?",
        what: "Did they say YES?",
      },
      boardPrompt: "Read all four · tap a leaking row to stamp it · tap again to lift it · then finish the check",
      caughtLabel: { one: "leaky photo kept back", many: "leaky photos kept back" },
      threat: {
        raccoonLine:
          "Three seconds? Nobody has three seconds! Kids see a good photo and tap share before the looking even starts. Every skipped corner is a present for me!",
      },
      introTitle: "The Photo Detective",
      introSubtitle: "Every print has four questions: who is in it, what is behind them, where is it going, did they say yes. Stamp every LEAK, then finish the check.",
      introIcon: "🕵️",
      stampLabel: "LEAK!",
      closeLabel: "FINISH CHECK",
      realSeal: "SAFE TO SHARE",
      fakeSeal: "KEEP IT",
      realToast: "SAFE TO SHARE!",
      fakeToast: "KEEP IT: LEAK FOUND!",
      wrongTitle: "Check your stamps again!",
      completeTitle: "Every print checked!",
      completeLine: "Look, think, ask. Then share, or keep.",
      cases: [
        {
          id: "brick-castle",
          handle: "Brick castle photo",
          avatar: "🧱",
          pitch: "My brick castle is finished! Share it?",
          readAloud: "Brick castle photo: my brick castle is finished! Share it? Who is in it? Nobody, just bricks. What is behind them? A plain table. Where is it going? The family chat. Did they say yes? Nobody else is in it.",
          clues: [
            { id: "when", evidence: "Nobody, just bricks", isRedFlag: false, teach: "Nobody is in this photo, just bricks. That row checks out, so lift the stamp." },
            { id: "who", evidence: "A plain table", isRedFlag: false, teach: "A plain table tells nobody anything. That row checks out, so lift the stamp." },
            { id: "how", evidence: "The family chat", isRedFlag: false, teach: "The family chat is a small door full of people you know. That row checks out, so lift the stamp." },
            { id: "what", evidence: "Nobody else in it", isRedFlag: false, teach: "With nobody else in the photo, there is nobody to ask. That row checks out, so lift the stamp." },
          ],
          rightWhy: "Nobody in it, nothing behind it, a small door, and nobody to ask. Every row checks out, so this one is safe to share!",
        },
        {
          id: "sneeze",
          handle: "Sneeze photo",
          avatar: "😂",
          pitch: "Maya mid-sneeze! Funniest photo ever!",
          readAloud: "Sneeze photo: Maya mid-sneeze, the funniest photo ever! Who is in it? Maya. What is behind them? A plain wall. Where is it going? The class chat. Did they say yes? Not asked yet.",
          clues: [
            { id: "when", evidence: "Maya, mid-sneeze", isRedFlag: false, teach: "Maya being in it is fine on its own. The ask has its own row. That row checks out, so lift the stamp." },
            { id: "who", evidence: "A plain wall", isRedFlag: false, teach: "A plain wall gives nothing away. That row checks out, so lift the stamp." },
            { id: "how", evidence: "The class chat", isRedFlag: false, teach: "The class chat is kids you know, a small door. That row is fine on its own, so lift the stamp." },
            { id: "what", evidence: "Not asked yet", isRedFlag: true, teach: "Look at the ask. Maya hasn't said yes yet, and it's her face. That is a leak." },
          ],
          rightWhy: "Everything else looked fine, but Maya never said yes. One missing yes is enough to keep it. Ask her first!",
        },
        {
          id: "snowman",
          handle: "Snowman photo",
          avatar: "🏠",
          pitch: "Our snowman in the front garden!",
          readAloud: "Snowman photo: our snowman in the front garden! Who is in it? Just you. What is behind them? House number 7. Where is it going? Everyone online. Did they say yes? Nobody else is in it.",
          clues: [
            { id: "when", evidence: "Just you", isRedFlag: false, teach: "It's just you, and it's your own photo. That row checks out, so lift the stamp." },
            { id: "who", evidence: "House number 7", isRedFlag: true, teach: "Look behind the snowman. House number seven points straight to your home. That is a leak." },
            { id: "how", evidence: "Everyone online", isRedFlag: true, teach: "Look where it's going. Everyone online means strangers, forever, through the biggest door. That is a leak." },
            { id: "what", evidence: "Nobody else in it", isRedFlag: false, teach: "With just you in the photo, there's no one to ask. That row checks out, so lift the stamp." },
          ],
          rightWhy: "A house number, heading through the biggest door. Two leaks. Keep it, or crop the number and pick a smaller door first.",
        },
        {
          id: "team",
          handle: "Team photo",
          avatar: "🏆",
          pitch: "We won! The whole team with the cup!",
          readAloud: "Team photo: we won, the whole team with the cup! Who is in it? Your whole team. What is behind them? A plain green pitch. Where is it going? The team families chat. Did they say yes? Yes, every player.",
          clues: [
            { id: "when", evidence: "Your whole team", isRedFlag: false, teach: "Your team being in it is fine, because the ask has its own row. That row checks out, so lift the stamp." },
            { id: "who", evidence: "A plain green pitch", isRedFlag: false, teach: "Grass looks the same at every pitch. That row checks out, so lift the stamp." },
            { id: "how", evidence: "Team families chat", isRedFlag: false, teach: "That chat is a small door, full of grown-ups who know the team. That row checks out, so lift the stamp." },
            { id: "what", evidence: "Yes, every player", isRedFlag: false, teach: "Every player said yes. That row checks out, so lift the stamp." },
          ],
          rightWhy: "Every player said yes, nothing leaks from behind, and it's going through a small door. Every row checks out, so share away!",
        },
      ],
      hints: {
        tier1: "Run the ritual on every row: who is in it, what is behind them, where is it going, did they say yes.",
        tier2: "Sarah named a row. Find that row. A leak means stamp it. Checks out means leave it clean.",
        tier3: "Let me help. I fixed that one row for you. Now finish the check.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, you become the Photo Detective!",
          "This game is all about running look, think, ask on real photos.",
          "Out in the real world, it takes three seconds, and it catches every leak before a photo goes.",
          "Here is what you do. A photo print lands with four rows: who is in it, what is behind them, where is it going, and did they say yes. If a row leaks, tap it to stamp it. Tap it again to lift the stamp. Nothing leaking? Stamp nothing. Then tap FINISH CHECK.",
          "[warmly] Look, think, ask on every single row. Ready? First print!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Here is your first print. Read all four rows. If a row leaks, tap it to stamp it. Tap it again to lift the stamp. When you have checked all four, tap Finish check.",
        ],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every print checked, Cyber Hero! Leaks kept back, safe photos shared.",
          "[warmly] Out in the real world, look, think, ask takes three seconds, and it's yours for every photo from now on.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A photo is ready to go. Tap the hero ritual IN ORDER:",
      choices: [
        { text: "LOOK at every corner", isCorrect: true },
        { text: "THINK: anyone, forever?", isCorrect: true },
        { text: "ASK before it goes", isCorrect: true },
      ],
      praise: "Look. Think. Ask. The ritual is yours! ✓",
      nudge: "What do your EYES do before your brain gets a turn?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Look at every corner. Think: anyone, forever? Ask before it goes.",
          "Eyes first, because you can't think about a clue you haven't seen.",
          "[warmly] Three seconds, every photo.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Look at every corner, think 'anyone, forever?', ask the people in it. Then share, or keep.",
      next: "one quick review to make it all stick",
      emblem: "🧠",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE photo powers, Cyber Hero!",
          "Delete tested, faces asked, corners checked, doors picked, and the ritual runs itself.",
          "[whispers] The Raccoon can't sneak a single photo past you now.",
          "One quick review to make it all stick, then he brings out his photo quiz. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "The Share Maze" (cyberMaze re-theme, darkroom skin, W3 engine)
    {
      type: "cyberMaze",
      skin: "darkroom",
      threat: {
        raccoonLine:
          "Five gates in my darkroom, and a photo moment waiting behind every one. One wrong share and the prints are mine!",
      },
      introTitle: "The Share Maze",
      introSubtitle: "Find your way through the darkroom. Every gate holds a photo moment. Pick the hero move to open it, and reach the exit.",
      introIcon: "📸",
      gateLabel: "PHOTO MOMENT",
      gatesLabel: "GATES OPENED",
      tokensLabel: "FILM ROLLS",
      movePrompt: "Tap a glowing square next to your hero to move",
      gateToast: "GATE OPEN!",
      wrongTitle: "That move lets the photo slip out",
      wrongTip: "Delete only clears yours, faces need a yes, corners talk, pick the door that fits, and look, think, ask.",
      pickPrompt: "Pick the hero move to open the gate",
      replyPrompt: "WHAT DOES A HERO DO?",
      gatesDoneLabel: "gates opened with a hero move",
      completeTitle: "Out of the darkroom!",
      completeLine: "Five gates, five photo powers.",
      hints: {
        tier2: "The hero move always thinks before the photo goes: ask the faces, check the corners, or pick a smaller door.",
        tier3: "Delete only clears your copy. Their face, their call. Corners talk. Body photos get no door. Look, think, ask.",
      },
      questions: [
        {
          from: "Leo",
          question: "Oops, you posted a silly photo! Just delete it, and it's gone from everyone's phone.",
          answers: [
            "Delete only clears MY copy. Next time I'll think first.",
            "Phew! Delete fixes everything.",
            "I'll delete it twice, just to be sure.",
          ],
          correctIndex: 0,
          why: "Delete only clears your copy. Every copy on other phones stays put, so heroes think before they post.",
          explanation: "Delete, once or twice, only empties your own phone. The copies that landed on other phones are still there.",
        },
        {
          from: "Sam",
          question: "I got a funny photo of Zara asleep at the sleepover. Let's post it before she wakes up!",
          answers: [
            "No. It's her face, so we ask her first.",
            "Yes! She'll think it's funny later.",
            "Post it, and delete it if she gets upset.",
          ],
          correctIndex: 0,
          why: "Her face, her call. Zara gets asked before her photo goes anywhere, and asleep means she can't say yes.",
          explanation: "Zara hasn't said yes, and deleting later can't call the copies back. Ask her first, every time.",
        },
        {
          from: "Ava",
          question: "Take a selfie in front of your house! The big door number looks so cool.",
          answers: [
            "I'll move, so the house number isn't in it.",
            "OK, the number makes it look cool!",
            "I'll post it just for my friends.",
          ],
          correctIndex: 0,
          why: "The house number points straight to your home. Move, or crop it out, and the photo stops talking.",
          explanation: "Friends can screenshot and send it on, so the house number could still reach strangers. Keep the number out of the photo.",
        },
        {
          from: "Kai",
          question: "Show the group chat your bath time baby photo. It's so cute!",
          answers: [
            "No. Body photos are Just Me photos, with no door at all.",
            "OK, it's only the group chat.",
            "Only if everyone promises not to share it.",
          ],
          correctIndex: 0,
          why: "Photos of your body are private. They are Just Me photos, and they go through no door, not even a small one.",
          explanation: "A small chat and a promise are still doors. A photo of your body stays Just Me.",
        },
        {
          from: "Maya",
          question: "Quick, the whole class is online right now! Post our class trip photo this second!",
          answers: [
            "Wait. Look, think, ask first. It takes three seconds.",
            "Post it fast before everyone logs off!",
            "Post it now, and check the photo later.",
          ],
          correctIndex: 0,
          why: "Look at every corner, think about who will see it, and ask the people in it. Three seconds beats any rush.",
          explanation: "Rushing skips the ritual. Look, think and ask first, then decide. Three seconds is always worth it.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review: the Share Maze!",
          "This game is all about using every photo power, one gate at a time.",
          "Out in the real world, photo moments come in any order, so every power has to be ready.",
          "Here is what you do. Tap a glowing square next to your hero to move. When a gate blocks the way, a friend brings a photo moment, and three replies appear. Tap the hero move to open the gate. Collect the film rolls, and find the exit.",
          "[warmly] Five gates, five powers. Ready? Into the darkroom!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap a glowing square beside your hero to move. Head for the exit!"],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Out of the darkroom, Cyber Hero! Every gate opened with a hero move.",
          "[warmly] Out in the real world, every photo moment gets the same care: think first, ask the faces, check the corners, pick the door.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the darkroom heist falls apart
    { type: "video", videoPlaceholder: "Week 8: Case Closed", videoSrc: "/videos/module-08-outro.mp4" },

    // 27 - Mission Debrief (ids kept from the legacy week so saved progress still lines up)
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "pigeons", label: "Copy Watcher", accent: "#7df0ff", icon: "🗑️", summary: "Delete only deletes your copy, so you think before you share." },
        { id: "consent", label: "Ask-First Poster", accent: "#7eff97", icon: "💬", summary: "Their face, their call. Every friend gets asked, and a no is respected." },
        { id: "clues", label: "Corner Checker", accent: "#ffd158", icon: "🔍", summary: "House numbers and school names talk. You find them first." },
        { id: "doors", label: "Door Picker", accent: "#c084fc", icon: "🚪", summary: "The door that fits, and no door at all for Just Me photos." },
        { id: "ritual", label: "Look-Think-Ask", accent: "#ff5fb3", icon: "🧠", summary: "Three seconds before every share. The ritual runs itself." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You know delete only deletes your copy, you ask every face,",
          "you check every corner, you pick the door that fits...",
          "[warmly] and look, think, ask runs before every photo.",
          "[excited] The Raccoon's darkroom heist is OVER. Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock (ids kept from the legacy week)
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "pigeon-watcher", name: "Copy Watcher", icon: "🗑️", description: "Knows delete only deletes your copy." },
        { id: "clue-spotter", name: "Clue Spotter", icon: "🔍", description: "Finds every clue before a photo goes." },
        { id: "door-keeper", name: "Door Keeper", icon: "🚪", description: "Always picks the door that fits." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     5 apply-the-skill questions, one per taught concept, 4 right to pass
     (owner decision, UAT batch 2). Every scenario is new (none repeats a game
     item) and every villain line is distinct. Recorded via the narration
     generator (week8.ts is in LEARN_LOOP_WEEKS). */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ff6b3d",
    theme: {
      topic: "Photos & Videos",
      motifs: ["📸", "👀", "🔍", "🚫", "🔒", "🏠", "🎭", "📱"],
    },
    intro: {
      slug: "quiz-w8-intro",
      text: "Say cheese, hero! One little snapshot tells me EVERYTHING I need. Think your photos are clue-proof? Let's find out!",
    },
    victory: {
      slug: "quiz-w8-victory",
      text: "Not one clue?! Not one loose copy?! What am I supposed to steal, MEMORIES?! I'm going back to blurry trash-can selfies!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w8-c1",
        key: "quiz-w8-c1-1",
        label: "Once It's Out, It's Out",
        ask: {
          slug: "quiz-w8-ask-c1-1",
          text: "Layla sent a funny video to her cousin, then deleted it from the chat. Her cousin had already saved it. Where is the video now?",
        },
        options: [
          { text: "Still on her cousin's phone, delete only cleared Layla's copy" },
          { text: "Gone from every phone, delete reaches everywhere" },
          { text: "Nowhere, videos can't be saved by cousins" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Delete only clears your copy!",
          explanation: "The moment the video landed, her cousin had a copy of their own. Layla's delete only emptied Layla's phone. That's why the thinking happens before you send.",
        },
        villainRight: {
          slug: "quiz-w8-right-c1-1",
          text: "Still on the cousin's phone?! You're not supposed to KNOW that!",
        },
        villainWrong: {
          slug: "quiz-w8-wrong-c1-1",
          text: "Gone everywhere? Ha! The cousin has a copy, and SO DO I!",
        },
      },
      {
        phaseId: "phase-w8-c2",
        key: "quiz-w8-c2-1",
        label: "Their Face, Their Call",
        ask: {
          slug: "quiz-w8-ask-c2-1",
          text: "Adam filmed his little brother's wobbly first bike ride. It's brilliant! Before sending it to the family chat, what comes first?",
        },
        options: [
          { text: "Ask his brother if he's happy for it to be shared" },
          { text: "Send it, family chats don't count" },
          { text: "Send just the funniest wobbly bit" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Their face, their call!",
          explanation: "Little brothers have faces too, and a family chat still makes copies. Adam asks his brother first, and if the answer is no, the video stays put.",
        },
        villainRight: {
          slug: "quiz-w8-right-c2-1",
          text: "You ASKED the little brother?! Now I'll never see the wobble!",
        },
        villainWrong: {
          slug: "quiz-w8-wrong-c2-1",
          text: "Send the wobble! Family chats leak like a bucket full of holes!",
        },
      },
      {
        phaseId: "phase-w8-c3",
        key: "quiz-w8-c3-1",
        label: "Photos Talk",
        ask: {
          slug: "quiz-w8-ask-c3-1",
          text: "Layla's swimming photo shows her new medal, her stripy towel, and the swimming pool's name on the wall behind her. Which one talks to strangers?",
        },
        options: [
          { text: "The pool's name on the wall, it shows where she swims every week" },
          { text: "The shiny medal around her neck" },
          { text: "The stripy towel over her shoulder" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Backgrounds talk!",
          explanation: "A medal and a towel tell a stranger nothing useful. The pool's name on the wall tells them where Layla swims every week. Detectives check what's behind the smile.",
        },
        villainRight: {
          slug: "quiz-w8-right-c3-1",
          text: "You read the WALL?! I had my swimming goggles all packed!",
        },
        villainWrong: {
          slug: "quiz-w8-wrong-c3-1",
          text: "Same pool every week? Lovely! I'll bring my rubber ring!",
        },
      },
      {
        phaseId: "phase-w8-c4",
        key: "quiz-w8-c4-1",
        label: "Pick the Door That Fits",
        ask: {
          slug: "quiz-w8-ask-c4-1",
          text: "Adam filmed the class play for the school's families. It shows every kid's face and the school hall. Which door fits?",
        },
        options: [
          { text: "School, it was made for the school's families" },
          { text: "Everyone, the play was brilliant" },
          { text: "Just Me, nobody should ever watch a play" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Pick the door that fits!",
          explanation: "Lots of faces and the school hall make Everyone far too big a door. Just Me would hide it from the families it was made for. The School door fits.",
        },
        villainRight: {
          slug: "quiz-w8-right-c4-1",
          text: "The School door?! And I bought popcorn for the world premiere!",
        },
        villainWrong: {
          slug: "quiz-w8-wrong-c4-1",
          text: "Fling the big doors open! Every face, every name, and a front row seat for ME!",
        },
      },
      {
        phaseId: "phase-w8-c5",
        key: "quiz-w8-c5-1",
        label: "Look. Think. Ask.",
        ask: {
          slug: "quiz-w8-ask-c5-1",
          text: "Layla wants to post a video of her friends' dance routine. She has LOOKED at every corner, and it's clean. What's the next step of the ritual?",
        },
        options: [
          { text: "THINK: where is it going, and is it OK for anyone, forever?" },
          { text: "Post it now, looking was enough" },
          { text: "Add music first so it gets more likes" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Look, then THINK, then ask!",
          explanation: "Looking is only step one. Next she thinks about where it's going and who could see it forever, then she asks every friend in the dance. Three steps, three seconds.",
        },
        villainRight: {
          slug: "quiz-w8-right-c5-1",
          text: "THINK comes next?! You kids have a ritual for EVERYTHING now!",
        },
        villainWrong: {
          slug: "quiz-w8-wrong-c5-1",
          text: "Looked once? Good enough! Post it, post it, POST IT!",
        },
      },
    ],
  },
  badgeArt: "/cyberheroes/badges/week-08-photo-detective.png",

  // Week-lane attack theatre: photo and video sharing only (people tricks = W3,
  // message scams = W4, the full footprint trail = W12).
  bossAttacks: [
    { name: "RUNAWAY COPIES", icon: "📱", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Delete can't catch them", emblemColor: 0x7df0ff },
    { name: "CLUE LEAK",      icon: "📍", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Photos talk",             emblemColor: 0xffd158 },
    { name: "SNEAKY SNAP",    icon: "👀", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Their face, their call",  emblemColor: 0xff5fb3 },
  ],

  // Legacy question pool, required by the WeekContent type; the quiz boss above
  // is what renders.
  bossQuestions: {
    easy: [
      { question: "You DELETE a photo you shared. What happens?", answers: ["Only YOUR copy disappears", "Every copy everywhere vanishes", "The internet forgets it", "Screenshots delete too"], correctIndex: 0, explanation: "Delete only empties your phone. The copies on other phones stay put." },
      { question: "Before posting a photo of your friend, you...", answers: ["Ask them first", "Add a funny caption", "Tag everyone fast", "Post it, friends don't mind"], correctIndex: 0, explanation: "Their face, their call, every single time." },
      { question: "What can a school name in your photo tell a stranger?", answers: ["Where you are all day", "Your favourite colour", "Nothing at all", "Just that you go to SOME school"], correctIndex: 0, explanation: "School names, house numbers and signs talk. Check the corners before sharing." },
    ],
    medium: [
      { question: "A friend screenshots your vanishing photo. Now what?", answers: ["A copy exists that you can't reach", "It still vanishes on time", "Screenshots don't work on photos", "The app deletes her copy"], correctIndex: 0, explanation: "A screenshot is a brand new copy, and the timer can't touch it." },
      { question: "Which photo fits the EVERYONE door?", answers: ["A drawing with no faces and no clues", "Your first-day uniform photo", "A party photo of three friends", "Your bedroom selfie"], correctIndex: 0, explanation: "No faces and no clues is the only kind that meets the whole world safely." },
      { question: "A friend sends you a just-for-you selfie. The group chat would love it. You...", answers: ["Keep it, just for you means just for you", "Forward it, she sent it to me!", "Post it and say sorry after", "Crop her face and send it"], correctIndex: 0, explanation: "Sent to you isn't yours to send on. That's her trust in your hands." },
    ],
    hard: [
      { question: "Why isn't a PRIVATE account total protection for photos?", answers: ["People inside can still screenshot and send on", "Private only works on photos, not videos", "Strangers can see private posts anyway", "It is total protection"], correctIndex: 0, explanation: "Private shrinks the door. It doesn't stop the copies made inside it." },
      { question: "What's the full hero ritual before any share?", answers: ["Look, think, ask", "Post, check, delete", "Crop, filter, tag", "Ask, post, forget"], correctIndex: 0, explanation: "Look at every corner, think 'anyone, forever?', ask the people in it." },
      { question: "One photo shows your name, age, school AND street. Why is that a big deal?", answers: ["Together they're a stranger's map to you", "It just looks untidy", "It's only a problem if you're famous", "Names aren't private"], correctIndex: 0, explanation: "Each clue is small. Together they tell a stranger everything they need." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29), in lock-step with `screens` above.
  // The 5 recap checkpoints are 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 8: the runaway photo!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "One photo told strangers everything." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Delete isn't magic. Watch." }, layla: null }, // learn: copies
    5: { adam: { mood: "excited", message: "Share it, delete it, watch the phones!" }, layla: null }, // game: Undo Test
    6: { adam: null, layla: { mood: "thumbsup", message: "Finish the photo rule!" } }, // prove: finish
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "thinking", message: "Whose face is it? Their call." } }, // learn: consent
    9: { adam: { mood: "curious", message: "Ask every face in the photo." }, layla: null }, // game: Ask Ring
    10: { adam: null, layla: { mood: "thumbsup", message: "What comes first?" } }, // prove: recall
    11: { adam: { mood: "thumbsup", message: "Ask-first: locked in!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Shhh. The photo is talking." }, layla: null }, // learn: clues
    13: { adam: { mood: "excited", message: "Develop it, then check the corners!" }, layla: null }, // game: Developing Tray
    14: { adam: null, layla: { mood: "excited", message: "Quick! Which clue leaks home?" } }, // prove: speed
    15: { adam: null, layla: { mood: "thumbsup", message: "Magnifying glass: earned." } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Which door fits this photo?" } }, // learn: doors
    17: { adam: { mood: "curious", message: "Turn the dial. No rush." }, layla: null }, // game: Door Dial
    18: { adam: { mood: "worried", message: "He's fibbing about private. Catch him!" }, layla: null }, // prove: lie
    19: { adam: { mood: "thumbsup", message: "Doors picked. Fib busted." }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Look. Think. Ask. Three seconds." }, layla: null }, // learn: ritual
    21: { adam: { mood: "curious", message: "Check every row, detective." }, layla: null }, // game: Photo Detective
    22: { adam: null, layla: { mood: "thumbsup", message: "Put the ritual in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers. Review time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Find the way out of the darkroom!" } }, // review: Share Maze
    25: { adam: { mood: "worried", message: "His photo heist is ON. Crash it!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the heist fall apart!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Photo Detective badge earned!" }, layla: null }, // completion
  },
};

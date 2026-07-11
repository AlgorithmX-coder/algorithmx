import type { WeekContent } from "./types";

/**
 * Week 11 - Something Wrong? Emergency Protocol.
 *
 * SENSITIVE WEEK - built warmth-first like Week 5: the villain stays out
 * of the emotional beats (no raccoon on the reveal board), the child's
 * side is calm and empowering, and nothing here is frightening. The
 * lesson carries the Childhelp number (1-800-422-4453) that the no-text films
 * couldn't.
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 FAULT    it's never your fault           | reveal (💪)     | finish
 *     2 TEAM     name your trusted adults        | teamPoster NEW  | recall
 *     3 BLOCK    stop - don't reply - block      | buttonHunt      | speed
 *     4 EVIDENCE camera, not bin                 | replyCards      | lie
 *     5 PROTOCOL the full five steps             | stepOrder       | order
 *   Consolidation (cyberScanner, Drill Run skin) -> boss
 *   (placeholder quiz boss - the bespoke W11 COMBAT is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: TeamPoster DEBUTS (BUILD lane - poster slots + tray;
 * earmarked reuse W19 family-rules quilt); buttonHunt returns 1 week
 * after W10 BY PLAN (the locked FIND ledger assigns it W10+W11 - the
 * dressing moves from video player to chat app and its delete decoy
 * pre-teaches beat 4); replyCards returns 3 weeks after W8 in its
 * original cards skin (camera-vs-bin evidence calls); stepOrder returns
 * 6 weeks after W5 as the Protocol Launchpad. Lane-clean: WHAT TO DO
 * when something's wrong - cyberbullying feelings were W5's, stranger
 * red flags W3's; this week is the calm drill.
 */
export const WEEK_11: WeekContent = {
  weekNumber: 11,
  title: "Something Wrong? Emergency Protocol",
  topic: "emergency-protocol",
  badgeName: "Team Captain",
  badgeIcon: "👑",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 11: EMERGENCY PROTOCOL", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: something feels wrong
    { type: "video", videoPlaceholder: "Week 11: Something Wrong?", videoSrc: "/videos/module-11-intro.mp4" },

    // 1 - ALERT: incident report (warm, not scary)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-11.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "Kids across Cyber City got messages that made their tummies drop - and the Raccoon spread a sneaky lie: 'it's YOUR fault, keep it secret.' This week you learn the calm five-step protocol every hero knows. First truth first: it is NEVER your fault.",
      photoCaption: "Wk 11 - Emergency Protocol",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Learn the biggest truth: it is never your fault",
        "Name your team - the grown-ups who've got you",
        "Save the proof: camera, not trash",
      ],
    },

    /* ─────────── BEAT 1 · NEVER YOUR FAULT ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Never Your Fault",
      content:
        "When something horrid lands on your screen, a heavy thought can land with it: 'this is my fault.' Here's the truth, and it's the biggest one in this whole academy: when someone is unkind to you online, THEY made that choice - not you. Not your fault. Not a little bit. Not ever. And the moment you believe that, telling a grown-up gets easy.",
      bullets: [
        "Someone unkind CHOSE to be unkind",
        "Their choice is never your fault",
        "Not a little bit - not ever",
        "Heavy thoughts lie - lift them and look",
        "Believing this makes telling easy",
      ],
      bulletIcons: ["💬", "💡", "🚫", "💪", "👪"],
      emblem: "💪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Hey, Cyber Hero. This week is a gentle one - and a mighty one.",
          "Sometimes something lands on your screen that feels horrid.",
          "And a heavy thought lands with it: 'this is my fault.'",
          "Here's the biggest truth in the whole academy:",
          "when someone is unkind, THEY made that choice. Not you.",
          "[excited] Four heavy boulders ahead - let's lift every one!",
        ],
      },
    },
    // 4 - Game: REVEAL (the Weight Lift - 💪 board, villain kept OFF the board)
    {
      type: "reveal",
      title: "The Weight Lift",
      subtitle: "Four heavy boulder-thoughts. Lift each one and watch it turn into a balloon.",
      boardIcon: "💪",
      items: [
        {
          id: "myfault",
          label: "“It's my fault”",
          icon: "🙈",
          steps: [
            { icon: "💬", text: "A mean message lands... and a boulder-thought lands with it: 'I must have caused this.'" },
            { icon: "💪", text: "Lift it and look underneath: someone ELSE chose to be unkind. Their choice. Their hands." },
            { icon: "✨", text: "The boulder goes light as a balloon: NOT your fault. Not now, not ever." },
          ],
          counter: "The sender made the choice - not you.",
        },
        {
          id: "trouble",
          label: "“I'll be in trouble”",
          icon: "🤚",
          steps: [
            { icon: "🤚", text: "'If I show a grown-up... maybe I'M the one who gets in trouble?'" },
            { icon: "👪", text: "Lift it: grown-ups aren't there to blame you - helping with EXACTLY this is their job." },
            { icon: "✨", text: "Whoosh - a balloon: telling isn't trouble. Telling is the way OUT of trouble." },
          ],
          counter: "Helpers help - that's the whole job.",
        },
        {
          id: "secret",
          label: "“I should keep it secret”",
          icon: "🤐",
          steps: [
            { icon: "🤐", text: "'Maybe if I tell nobody... it just goes away?'" },
            { icon: "🧠", text: "Lift it: secrets like this get HEAVIER the longer you carry them alone." },
            { icon: "✨", text: "Balloon! Telling someone starts making it lighter right away - you're not carrying it alone anymore." },
          ],
          counter: "Telling makes it lighter - every time.",
        },
        {
          id: "nohelp",
          label: "“No one can help”",
          icon: "❓",
          steps: [
            { icon: "❓", text: "'What could anyone even DO about it?'" },
            { icon: "👪", text: "Lift it: your team can block, report, fix settings - and just LISTEN, which helps most." },
            { icon: "✨", text: "Up it floats: helpers exist everywhere - and one is always awake: Childhelp, 1-800-422-4453." },
          ],
          counter: "Help always exists - always.",
        },
      ],
      finale: "Four boulders lifted, four balloons in the sky. Nothing that lands ON you is ever your fault.",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] See those four gray boulders? They're heavy thoughts.",
          "Every single one of them is lying to you.",
          "Lift each one and look underneath...",
          "[excited] and watch it float away like a balloon. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Lift the first boulder - it's lighter than it looks!"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "It's never ___ fault.",
      choices: [
        { text: "your", isCorrect: true },
        { text: "a little bit your", isCorrect: false },
        { text: "sometimes your", isCorrect: false },
        { text: "mostly your", isCorrect: false },
      ],
      praise: "NEVER your fault - not a little bit, not sometimes, not ever. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "When someone is unkind online, they made that choice - it is never, ever your fault.",
      next: "the team of grown-ups who've always got you",
      emblem: "💪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Power one - and it's the mightiest of all.",
          "Never your fault. Say it like you mean it!",
          "[excited] Now, every captain needs a team...",
          "and it's time to put YOURS on a poster.",
        ],
      },
    },

    /* ─────────── BEAT 2 · NAME YOUR TEAM ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Name Your Team",
      content:
        "Here's a hero secret: the best time to pick your team is BEFORE you need it. Your team is the grown-ups you'd tell if something felt wrong - a parent or caregiver, a teacher, a grandparent, an aunt or uncle. Name them in your head right now! And one more goes on every kid's poster: Childhelp, 1-800-422-4453 - a free phone line just for kids, always awake, always kind.",
      bullets: [
        "Pick your team BEFORE you need it",
        "A parent or caregiver you trust",
        "A teacher at school",
        "Grandparents, aunts, uncles count too",
        "Childhelp 1-800-422-4453 - free, always awake",
      ],
      bulletIcons: ["⭐", "👪", "🏫", "🏠", "💬"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Every captain has a team - and here's the secret:",
          "you pick your team BEFORE you ever need it.",
          "A parent. A teacher. A grandparent. Someone you'd tell anything.",
          "Name them in your head... right now. Got them?",
          "[excited] And one goes on EVERY kid's poster: Childhelp!",
          "One, eight hundred, four two two, four four five three. Free. Always awake. Let's build!",
        ],
      },
    },
    // 8 - Game: BUILD (teamPoster DEBUT - the My-Team Poster)
    {
      type: "teamPoster",
      introTitle: "The My-Team Poster",
      introSubtitle: "Four empty spots on the wall. Fill them with your real team - the people who've truly got you.",
      introIcon: "👪",
      posterTitle: "★ MY TEAM ★",
      trayPrompt: "Tap everyone who belongs on your team",
      placedToast: "ON THE TEAM!",
      wrongTitle: "Not for the poster",
      completeTitle: "Your team is on the wall!",
      completeLine: "Four spots, four helpers - you are never, ever alone.",
      tiles: [
        { id: "parent", label: "Mom, Dad or your caregiver", icon: "👪", isTeam: true, note: "The captain's first call - they'd want to know, every time." },
        { id: "lobby", label: "A player from your game lobby", detail: "“we're basically best friends”", icon: "🎮", isTeam: false, note: "Game friends can be fun - but your TEAM is grown-ups you know in real life, plus one special phone line just for kids." },
        { id: "teacher", label: "Your teacher", icon: "🏫", isTeam: true, note: "School helpers deal with this stuff every week - they know exactly what to do." },
        { id: "secret", label: "Nobody - keep it secret", icon: "🤐", isTeam: false, note: "Secrets like this get heavier the longer you hold them. Your team makes them lighter." },
        { id: "grandparent", label: "Grandma or Grandpa", icon: "🏠", isTeam: true, note: "Endless time to listen, and always on your side - poster material for sure." },
        { id: "trustme", label: "A stranger who says “trust me”", icon: "🎭", isTeam: false, note: "Saying 'trust me' doesn't earn a poster spot - BEING there for you does." },
        { id: "childline", label: "Childhelp", detail: "1-800-422-4453 · free · always awake", icon: "💬", isTeam: true, special: true, note: "The golden tile - a free phone line just for kids, any hour, any worry." },
      ],
      hints: {
        tier1: "Team = grown-ups you know in REAL life... plus the one golden phone line for kids.",
        tier2: "Parent or caregiver, teacher, grandparent, Childhelp 1-800-422-4453 - those four belong. Strangers and secrets never do.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Here's your poster - four empty spots!",
          "Tap the people who truly belong on your team.",
          "[whispers] Careful - a couple of tiles don't belong at all.",
          "[warmly] Fill it up, captain. This poster is forever.",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Real-life grown-ups you trust - tap them onto the poster!"],
      },
    },
    // 9 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who belongs on your MY TEAM poster?",
      choices: [
        { text: "Grown-ups I trust - plus Childhelp 1-800-422-4453", isCorrect: true },
        { text: "Anyone online who's friendly", isCorrect: false },
        { text: "Nobody - I handle things alone", isCorrect: false },
        { text: "Only people from my game", isCorrect: false },
      ],
      praise: "Your real-life team plus the golden number - captain's picks. ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Your team is the trusted grown-ups you name BEFORE you need them - plus Childhelp 1-800-422-4453, free and always awake.",
      next: "the two buttons that shut a meanie down",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers! Your poster is GLOWING.",
          "Parent, teacher, grandparent... and the golden number.",
          "[warmly] Now let's learn what your fingers do...",
          "when the mean messages are still coming in.",
        ],
      },
    },

    /* ─────────── BEAT 3 · STOP & BLOCK ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Stop and Block",
      content:
        "When mean messages come in, your fingers will itch to reply. Don't! A reply is exactly what the sender wants - it keeps the game going. Heroes starve it instead: STOP (hands off the keyboard), snap the proof FIRST if there's a message to keep, THEN BLOCK the sender (the door shuts, they can't reach you), and CLOSE the app for a while. No speeches, no fighting back. Calm fingers, strong moves.",
      bullets: [
        "Don't reply - a reply is what they want",
        "Snap the proof FIRST - the camera keeps it",
        "THEN block - the door shuts on the sender",
        "Close the app and take a breather",
        "Calm fingers, strong moves",
      ],
      bulletIcons: ["✋", "📋", "🚫", "🚪", "💪"],
      emblem: "🚫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] When mean messages land, your fingers itch to fire back.",
          "Don't feed it! A reply is exactly what the sender wants.",
          "Heroes starve it instead.",
          "Stop - hands off. Snap the proof. THEN block - the door shuts.",
          "[whispers] Then close the app and breathe.",
          "[excited] Camera, then block - let's find the buttons fast!",
        ],
      },
    },
    // 12 - Game: FIND (buttonHunt re-dress - the Block Button)
    {
      type: "buttonHunt",
      menuTitle: "ChatterBox",
      scenario: "Mean messages keep arriving from the same sender. Calm fingers - you know the moves.",
      introTitle: "The Block Button",
      introSubtitle: "Six buttons on the chat screen - only three are hero moves. SCREENSHOT the proof, then BLOCK, then CLOSE APP.",
      introIcon: "🚫",
      buttons: [
        { id: "reply", label: "Reply", icon: "💬", note: "A reply feeds the sender - it's exactly what they're waiting for. Starve it instead." },
        { id: "fireback", label: "Fire One Back", icon: "⚡", note: "Firing back keeps the fight alive - and turns you into a target. Heroes don't feed it." },
        { id: "shot", label: "Screenshot", icon: "📋", targetOrder: 1, note: "Proof frozen FIRST - now blocking can't make the message vanish." },
        { id: "block", label: "Block Sender", icon: "🚫", targetOrder: 2, note: "BLOCKED - the door is shut. They can't reach you anymore." },
        { id: "delete", label: "Delete Message", icon: "🗑️", note: "Careful - we KEEP the message as proof for your team. Never trash the evidence." },
        { id: "close", label: "Close App", icon: "🚪", targetOrder: 3, note: "App closed, breather taken - calm fingers win again." },
      ],
      hints: {
        tier1: "Three hero moves: freeze the proof first, THEN shut the door, then leave the room for a bit.",
        tier2: "SCREENSHOT first, BLOCK SENDER second, CLOSE APP third. Reply, Fire Back and Delete all make it worse.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Deep breath. Calm fingers.",
          "Six buttons - only three are hero moves.",
          "Camera freezes the proof. Block shuts the door. Close App gives you air.",
          "[excited] Find them in order - go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Freeze the proof first - find SCREENSHOT!"],
      },
    },
    // 13 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - tap the button that stops the sender!",
      speedMs: 5000,
      choices: [
        { text: "BLOCK", isCorrect: true },
        { text: "Reply", isCorrect: false },
        { text: "Read it again", isCorrect: false },
      ],
      praise: "BLOCK at full speed - the door is shut! ✓",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Don't reply, don't fire back - snap the proof, THEN block and close the app. Starve it, don't feed it.",
      next: "why the camera beats the trash every time",
      emblem: "🚫",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers! Proof snapped, block found, door shut.",
          "And did you spot the trick button?",
          "[whispers] DELETE looked helpful... but it wasn't.",
          "Here's why the camera always beats the trash.",
        ],
      },
    },

    /* ─────────── BEAT 4 · CAMERA, NOT BIN ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Camera, Not Trash",
      content:
        "When something horrid lands, every part of you wants to delete it - poof, gone, pretend it never happened. But wait! If it's deleted, your team can't SEE what happened, and seeing it is how they help. So heroes do the opposite: SCREENSHOT first (freeze the evidence), then show a grown-up. The camera keeps the proof. The trash loses it forever.",
      bullets: [
        "Deleting feels good - for one second",
        "Deleted = your team can't see the proof",
        "SCREENSHOT first - freeze the evidence",
        "Then show it to your grown-up",
        "Camera keeps proof, trash loses it",
      ],
      bulletIcons: ["🗑️", "🙈", "📋", "👪", "✅"],
      emblem: "📋",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] When something horrid lands, your thumb hovers over delete.",
          "Poof - gone - pretend it never happened?",
          "[whispers] But if it's gone... what do you show your team?",
          "Heroes freeze it first. Screenshot. Click.",
          "Evidence saved - NOW a grown-up can see exactly what happened.",
          "[excited] Camera or trash - let's practice the call!",
        ],
      },
    },
    // 16 - Game: SELECT (replyCards cards skin - Camera or Bin)
    {
      type: "replyCards",
      skin: "cards",
      introTitle: "Camera or Trash?",
      introSubtitle: "Four horrid moments. For each one, freeze the evidence - or lose it forever. Choose like a hero.",
      introIcon: "📋",
      pickLabel: "What do you do first?",
      roundNoun: "Moment",
      correctToast: "EVIDENCE FROZEN!",
      wrongTitle: "Hmm - that loses the proof",
      completeTitle: "Every moment frozen!",
      completeLine: "Camera first, grown-up next - the proof is safe.",
      scoreNoun: "evidence saves",
      rounds: [
        {
          id: "mean-text",
          from: "Unknown number",
          fromIcon: "💬",
          message: "A message so mean it makes your tummy flip.",
          replies: [
            { text: "Camera - screenshot the proof", isSafe: true, explanation: "Frozen! Now your team can SEE exactly what happened - that's how they help." },
            { text: "Trash it - delete it fast", isSafe: false, explanation: "Deleting feels good for one second - but the proof your team needed is gone forever." },
            { text: "Reply with something meaner", isSafe: false, explanation: "Firing back feeds it - and now there's a fight where evidence should be." },
          ],
        },
        {
          id: "threat",
          from: "GrimGamer_99",
          fromIcon: "🎮",
          message: "“Do what I say or you'll be banned from the game!”",
          replies: [
            { text: "Beg them not to ban you", isSafe: false, explanation: "They can't really ban you - and begging tells them the trick is working." },
            { text: "Camera - freeze it, then tell", isSafe: true, explanation: "Snap! Threats are exactly the kind of proof grown-ups need to see." },
            { text: "Trash it and hope they stop", isSafe: false, explanation: "Hope isn't a shield - and now there's nothing to show your team." },
          ],
        },
        {
          id: "popup",
          from: "SYSTEM ALERT!!",
          fromIcon: "⚡",
          message: "“Pay 500 coins or your account gets deleted TONIGHT!”",
          replies: [
            { text: "Pay the coins quickly", isSafe: false, explanation: "That's a scare-trick after your coins - paying feeds the trickster." },
            { text: "Trash it - it's obviously fake", isSafe: false, explanation: "Probably fake, yes - but freezing it first means a grown-up can make SURE." },
            { text: "Camera - snap it, show a grown-up", isSafe: true, explanation: "Frozen! Fake or not, now your team can check it and shut it down." },
          ],
        },
        {
          id: "group",
          from: "Class group chat",
          fromIcon: "👪",
          message: "Someone starts posting mean things about your friend.",
          replies: [
            { text: "Laugh along so you fit in", isSafe: false, explanation: "Laughing along feeds the fire - and your friend deserves a hero." },
            { text: "Camera - freeze it and tell a grown-up", isSafe: true, explanation: "Hero move! Evidence frozen, help called - your friend has backup now." },
            { text: "Trash the chat and stay quiet", isSafe: false, explanation: "Quiet keeps the meanness rolling - frozen proof and a grown-up stop it." },
          ],
        },
      ],
      hints: {
        tier1: "Ask one question: if I do this, can my team still SEE what happened?",
        tier2: "Camera first, every time - screenshot, then show a grown-up. Trash, beg, laugh and fire-back all lose the proof.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Four horrid moments - all pretend, all practice.",
          "For each one: freeze it... or lose it?",
          "[whispers] Remember: your team helps best when they can SEE.",
          "[excited] Camera at the ready - go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Can your team still SEE the proof? Pick the camera!"],
      },
    },
    // 17 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "just delete the nasty message and POOF - it never happened!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Deleting only hides the proof - camera first, then show your team. ✓",
      nudge: "If the message is gone... what do you show your grown-up?",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Screenshot first, then show a grown-up - the camera keeps the proof your team needs, the trash loses it.",
      next: "all five steps, stacked into one launchpad",
      emblem: "📋",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers! Camera beats trash, every time.",
          "Frozen proof means real help, fast.",
          "[warmly] Now let's stack everything you've learned...",
          "into one calm countdown you'll never forget.",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE FULL PROTOCOL ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Emergency Protocol",
      // SAFETY FIX (screen audit): SCREENSHOT comes BEFORE BLOCK — on
      // some apps blocking hides or deletes the chat, losing the proof
      // beat 4 taught the child to freeze. Order everywhere:
      // STOP → SCREENSHOT → BLOCK → TELL → Childhelp.
      content:
        "Time to put the whole week in order - the five calm steps every Cyber Hero knows by heart. STOP: hands off, don't reply. SCREENSHOT: freeze the proof FIRST - blocking can make the message vanish. BLOCK: now shut the door on the sender. TELL: show someone on your team. And if you ever need more - or your team feels far away - CHILDHELP, 1-800-422-4453, free and always awake. That's the protocol. Calm, quick, powerful.",
      bullets: [
        "STOP - hands off, don't reply",
        "SCREENSHOT - freeze the proof first",
        "BLOCK - now shut the door",
        "TELL - someone on your team",
        "CHILDHELP 1-800-422-4453 - if you need more",
      ],
      bulletIcons: ["✋", "📋", "🚫", "👪", "💬"],
      emblem: "🚀",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Time to stack the whole week into one launchpad!",
          "Stop - hands off the keyboard.",
          "Screenshot - freeze the proof FIRST.",
          "THEN block - the door shuts. Tell - your team jumps in.",
          "[warmly] And if you ever need more: Childhelp. One, eight hundred, four two two, four four five three.",
          "[excited] Five stages... stack them and LAUNCH!",
        ],
      },
    },
    // 20 - Game: ORDER (stepOrder re-dress - the Protocol Launchpad)
    {
      type: "stepOrder",
      introTitle: "The Protocol Launchpad",
      introSubtitle: "Five rocket stages, shuffled on the pad. Stack them in the right order - then watch the protocol launch!",
      introIcon: "🚀",
      steps: [
        { id: "stop", text: "STOP - don't reply", icon: "✋", affirmation: "Hands off the keyboard - the sender gets nothing." },
        { id: "shot", text: "SCREENSHOT the proof", icon: "📋", affirmation: "Evidence frozen BEFORE the door shuts - nothing can vanish now." },
        { id: "block", text: "BLOCK the sender", icon: "🚫", affirmation: "The door is shut - they can't reach you." },
        { id: "tell", text: "TELL your team", icon: "👪", affirmation: "A grown-up is on it - you're not alone anymore." },
        { id: "childline", text: "Childhelp 1-800-422-4453 if you need more", icon: "💬", affirmation: "Free, always awake, always kind - the golden number." },
      ],
      hints: {
        tier1: "First calm your own fingers... then freeze the proof... THEN shut the door.",
        tier2: "STOP → SCREENSHOT → BLOCK → TELL → Childhelp. Fingers, camera, door, team, phone.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Five stages on the launchpad - all shuffled!",
          "Tap them in the order you'd really do them.",
          "Fingers... camera... door... team... phone.",
          "[warmly] Stack it right and LAUNCH, captain!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["What comes FIRST? Calm your own fingers - find STOP!"],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the protocol in order:",
      choices: [
        { text: "Stop - hands off, don't reply", isCorrect: true },
        { text: "Screenshot the proof", isCorrect: true },
        { text: "Block, then tell your team", isCorrect: true },
      ],
      praise: "Stop, screenshot, block, tell - the protocol, launched in order. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "The protocol: STOP, SCREENSHOT, BLOCK, TELL - and Childhelp 1-800-422-4453 whenever you need more.",
      next: "one calm drill run, then the Raccoon's blame machine",
      emblem: "🚀",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE protocol powers, Team Captain!",
          "Never your fault, team named, block found,",
          "proof frozen... and the launchpad stacked.",
          "[warmly] One calm drill run...",
          "[excited] then we pop his blame balloon for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Drill Run (W1 scanner engine, W11 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "PROTOCOL",
        negative: "PANIC MOVE",
        positiveHint: "Tap PROTOCOL for the calm hero steps",
        negativeHint: "Tap PANIC MOVE for the moves that make it heavier",
        tipWhenPositive: "Blocking, freezing proof, telling your team - calm steps that actually work.",
        tipWhenNegative: "Firing back, deleting, keeping secrets - panic moves that feed the problem.",
        hint1: "Ask: does this move make things LIGHTER... or heavier?",
        hint2: "PROTOCOL = stop, screenshot, block, tell, Childhelp. PANIC = reply, fire back, delete, keep it secret.",
        hint2Example: "PROTOCOL: 'I blocked them and told Mom'   PANIC: 'I deleted everything and told no one'",
        hint3: "Quick rule card: never your fault · name your team · block don't reply · camera not trash · Childhelp 1-800-422-4453.",
        hint3Example: "Screenshot then tell ✅    Keep it secret ❌",
      },
      items: [
        { text: "Blocking the sender instead of replying", isStrong: true, explanation: "Starve it, don't feed it - the door shuts and you're free." },
        { text: "Firing back a meaner message", isStrong: false, explanation: "Feeding the fire - now the fight grows and the proof gets messy." },
        { text: "Screenshotting before anything else", isStrong: true, explanation: "Camera, not trash - now your team can see exactly what happened." },
        { text: "Deleting everything so it feels gone", isStrong: false, explanation: "The trash loses the proof your helpers needed - freeze first instead." },
        { text: "Telling your teacher the same day", isStrong: true, explanation: "Team power - telling makes it lighter and gets real help moving." },
        { text: "Keeping it secret so nobody worries", isStrong: false, explanation: "Secrets get heavier - your team WANTS to carry this with you." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Drill run - nice and calm, captain!",
          "Moments are floating past.",
          "PROTOCOL for the hero steps...",
          "[warmly] PANIC MOVE for the ones that make it heavier. Go!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W11 COMBAT comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: the team wins
    { type: "video", videoPlaceholder: "Week 11: The Team Wins", videoSrc: "/videos/module-11-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "fault", label: "Never Your Fault", accent: "#7df0ff", icon: "💪", summary: "Someone unkind made THEIR choice - it's never, ever yours to carry." },
        { id: "team", label: "My Team", accent: "#ffd158", icon: "👪", summary: "Named before you need them - plus Childhelp 1-800-422-4453, always awake." },
        { id: "block", label: "Stop & Block", accent: "#c084fc", icon: "🚫", summary: "No replies, no firing back - block the sender and breathe." },
        { id: "camera", label: "Camera, Not Trash", accent: "#ff5fb3", icon: "📋", summary: "Screenshot first - frozen proof is how your team helps fast." },
        { id: "protocol", label: "The Protocol", accent: "#7eff97", icon: "🚀", summary: "Stop, screenshot, block, tell - launched calmly, in order." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "The boulders lifted, the team named,",
          "the proof frozen, the block found... and the protocol launched.",
          "[warmly] Whatever lands on your screen - you know exactly what to do.",
          "[excited] Sticker time, Team Captain!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "balloon-lifter", name: "Balloon Lifter", icon: "💪", description: "Lifts every 'my fault' boulder - and lets it float away." },
        { id: "team-namer", name: "Team Namer", icon: "👪", description: "Named their team before they needed it." },
        { id: "evidence-freezer", name: "Evidence Freezer", icon: "📋", description: "Camera first, trash never - the proof stays safe." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Warmth week #2: untimed primitives only (counterCard / tapTell /
  // orderStrike - no shieldHold barrage), villain kept distant and muted.
  // ⚠️ Protocol order is STOP → SCREENSHOT → BLOCK → TELL (camera BEFORE
  // the door shuts) - the 34cbc05 safety fix; older docs say BLOCK first.
  bossShowdown: {
    machine: {
      name: "THE BOULDER PRESS",
      tagline: "A press that stamps 'YOUR FAULT' on boulders that were never yours",
      art: {
        intact: "/game/bosses/w11-boulderpress-intact.png",
        damaged: "/game/bosses/w11-boulderpress-damaged.png",
        defeated: "/game/bosses/w11-boulderpress-defeated.png",
      },
      arena: "/game/backgrounds/w11-arena-hillside.png",
      accent: "#ffb86b",
      glow: "rgba(255,184,107,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w11/adam-captain-idle.png",
        attack: "/game/characters/w11/adam-captain-attack.png",
        celebrate: "/game/characters/w11/adam-captain-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w11/layla-captain-idle.png",
        attack: "/game/characters/w11/layla-captain-attack.png",
        celebrate: "/game/characters/w11/layla-captain-celebrate.png",
      },
    },
    phases: [
      // P1 · BLAME BOULDER → COUNTER-CARD: pop the boulder into a balloon.
      {
        kind: "counterCard",
        attack: 0,
        coach: "Whose choice was it? Tap the card!",
        situation: "A boulder rolls in with your name chalked on it: 'This one's YOURS.'",
        situationIcon: "🙈",
        cards: [
          { id: "sender", label: "THE SENDER CHOSE TO SEND IT - NEVER MY FAULT", icon: "🛡️", isRight: true, note: "" },
          { id: "abit", label: "Maybe a little bit my fault", icon: "🌀", isRight: false, note: "Not even a little. The sender made the choice - reading a message doesn't make it yours." },
          { id: "online", label: "My fault for being online", icon: "💬", isRight: false, note: "Being online is like being at the park. If someone throws mud, the mud-thrower did it - not you for standing there." },
        ],
      },
      // P2 · SECRET WEIGHT → TAP-THE-TELL: name the hidden heavy thing;
      // naming it out loud IS the tell, and the bag gets lighter.
      {
        kind: "tapTell",
        attack: 1,
        coach: "Secrets get lighter when you NAME them. Tap the heavy one!",
        rounds: [
          {
            id: "bag1",
            prompt: "The backpack sags. What's the heavy thing hiding inside?",
            promptIcon: "🤐",
            options: [
              { id: "meanmsg", label: "A mean message I never told anyone about", icon: "💬", isTell: true, note: "" },
              { id: "homework", label: "My spelling homework", icon: "📋", isTell: false, note: "Homework's heavy, but it's no secret. Find the one you'd whisper." },
              { id: "book", label: "A library book to return", icon: "🎁", isTell: false, note: "That's just Tuesday stuff. Find the thing that's been hiding." },
            ],
          },
          {
            id: "bag2",
            prompt: "Lighter already! But the bag still sags...",
            promptIcon: "🤐",
            options: [
              { id: "cleats", label: "My muddy soccer cleats", icon: "⚙️", isTell: false, note: "Muddy, sure - secret, no. Find the one that makes your tummy flip." },
              { id: "weirdchat", label: "A game chat that made me feel weird", icon: "🎮", isTell: true, note: "" },
              { id: "sweater", label: "My rainy-day sweater", icon: "🎁", isTell: false, note: "Cozy, not heavy. Find the hiding one." },
            ],
          },
          {
            id: "bag3",
            prompt: "One last lump at the very bottom...",
            promptIcon: "🤐",
            options: [
              { id: "snack", label: "A squashed granola bar", icon: "🎁", isTell: false, note: "Squashy, not secret. One more heavy thing to name!" },
              { id: "marker", label: "A dried-out marker", icon: "📋", isTell: false, note: "That's just clutter. Find the one someone told you to HIDE." },
              { id: "secretpic", label: "A picture someone said to keep secret", icon: "🤫", isTell: true, note: "" },
            ],
          },
        ],
      },
      // P3 · DELETE TRICK → ORDER-STRIKE: the protocol, camera before door.
      {
        kind: "orderStrike",
        attack: 2,
        coach: "Camera BEFORE the door! Tap the steps in order!",
        intro: "'Bin it! Pretend it never happened!' Counter him with the hero protocol.",
        steps: [
          { id: "stop", label: "STOP - don't reply", icon: "✋" },
          { id: "shot", label: "SCREENSHOT - freeze the proof", icon: "📋" },
          { id: "block", label: "BLOCK the sender", icon: "🔒" },
          { id: "tell", label: "TELL your team", icon: "👪" },
        ],
      },
    ],
    weakPoints: [
      { question: "Someone sends you a horrid message. Whose fault is it?", answers: ["Theirs - they chose to send it", "Yours", "A little bit yours", "Nobody knows"], correctIndex: 0, explanation: "The sender made the choice - it is never your fault." },
      { question: "Why does 'keep it secret' make everything heavier?", answers: ["Carrying it alone grows the worry - telling shares the weight", "Secrets are illegal", "Grown-ups always find out", "It doesn't"], correctIndex: 0, explanation: "Telling someone starts making it lighter right away - that's the whole trick." },
      { question: "A nasty message arrives. What happens to it FIRST?", answers: ["Screenshot - freeze the proof", "Delete it fast", "Reply to it", "Forward it to friends"], correctIndex: 0, explanation: "Camera, not trash - your team helps best when they can see." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE TEAM BEACON",
      chargeIcon: "💡",
      chargeSecs: 5,
      milestones: ["Your team is gathering…", "The poster is glowing…", "BEACON BRIGHT! LET GO!"],
      payoffTitle: "TEAM LIT!",
      payoffLine: "Your whole team lights up - and the golden Childhelp tile shines brightest: 1-800-422-4453, free, just for kids, always awake. The press wheezes flat. You were never carrying this alone.",
    },
    villain: {
      arrival: "Heavy stuff, kid. Good thing you're carrying it ALL ALONE.",
      phases: [
        "That boulder's got your name on it! I checked!",
        "Keep it secret! Secrets weigh NOTHING! Trust me!",
        "Bin it! Gone! Nothing ever happened!",
      ],
      escape: "A whole TEAM?! That's cheating! One kid was supposed to be alone!",
    },
    voiceSlug: "w11",
  },
  badgeArt: "/cyberheroes/badges/week-11-team-captain.png",

  // Week-lane attack theatre: the blame-and-silence tricks only (mean-words
  // feelings = W5; stranger red flags = W3; this week is the response drill).
  bossAttacks: [
    { name: "BLAME BOULDER", icon: "🙈", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Never your fault",        emblemColor: 0xc084fc },
    { name: "SECRET WEIGHT", icon: "🤐", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Telling makes it lighter", emblemColor: 0xffd158 },
    { name: "DELETE TRICK",  icon: "🗑️", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Camera, not trash",        emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W11 COMBAT - pop the blame balloon
  // machine - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Someone sends you a horrid message. Whose fault is it?", answers: ["Theirs - they chose to send it", "Yours", "A little bit yours", "Nobody knows"], correctIndex: 0, explanation: "The sender made the choice - it is never your fault." },
      { question: "What's the golden number on every kid's team poster?", answers: ["Childhelp 1-800-422-4453", "911 for everything", "Your best friend's number", "There isn't one"], correctIndex: 0, explanation: "Childhelp - free, just for kids, always awake." },
      { question: "A nasty message arrives. What happens to it FIRST?", answers: ["Screenshot - freeze the proof", "Delete it fast", "Reply to it", "Forward it to friends"], correctIndex: 0, explanation: "Camera, not trash - your team helps best when they can see." },
    ],
    medium: [
      { question: "Why do heroes NOT reply to mean messages?", answers: ["A reply is exactly what the sender wants", "Replying costs money", "Replying shows them you're not scared", "They do reply"], correctIndex: 0, explanation: "Starve it, don't feed it - block instead." },
      { question: "Why does deleting the message make things harder?", answers: ["Your team can't see the proof anymore", "Deleting is against the rules", "The sender just sends it again", "It doesn't"], correctIndex: 0, explanation: "Seeing the evidence is how grown-ups help fast - freeze it first." },
      { question: "When do you pick the grown-ups on your team?", answers: ["Now - before you ever need them", "Only after something goes wrong", "Never - handle it alone", "When you turn 13"], correctIndex: 0, explanation: "Captains pick their team early - then help is one tell away." },
    ],
    hard: [
      { question: "Why does 'keep it secret' make everything heavier?", answers: ["Carrying it alone grows the worry - telling shares the weight", "Secrets are illegal", "Grown-ups always find out", "It doesn't"], correctIndex: 0, explanation: "Telling someone starts making it lighter right away - that's the whole trick." },
      { question: "The full protocol, in order, is...", answers: ["Stop → Screenshot → Block → Tell → Childhelp if needed", "Reply → Delete → Forget", "Stop → Block → Screenshot → Tell", "Screenshot → Fire back → Tell"], correctIndex: 0, explanation: "Fingers, camera, door, team, phone - freeze the proof BEFORE the door shuts." },
      { question: "Your friend says 'don't tell anyone what happened to me online.' What's the hero move?", answers: ["Tell a trusted grown-up anyway - some secrets need helpers", "Promise and keep the secret", "Post about it", "Ignore your friend"], correctIndex: 0, explanation: "Safety secrets are the kind you SHARE with a grown-up - that's real friendship." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "thinking", message: "Mission 11 - the one every hero needs." }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "That blame lie... we're popping it today." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "The calm plan, captain - ready?" } }, // mission brief
    3: { adam: { mood: "thinking", message: "Whose choice was it? Not yours." }, layla: null }, // learn: fault
    4: { adam: { mood: "curious", message: "Lift those boulders!" }, layla: null }, // game: reveal
    5: { adam: null, layla: { mood: "thumbsup", message: "Finish the biggest rule!" } }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "The mightiest power - yours now!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Who's on YOUR team? Name them!" } }, // learn: team
    8: { adam: null, layla: { mood: "excited", message: "Fill that poster, captain!" } }, // game: teamPoster
    9: { adam: { mood: "thumbsup", message: "Who made the poster?" }, layla: null }, // prove: recall
    10: { adam: { mood: "excited", message: "Team named - never alone!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "Starve it - never feed it." }, layla: null }, // learn: block
    12: { adam: { mood: "curious", message: "Calm fingers - find BLOCK!" }, layla: null }, // game: buttonHunt
    13: { adam: null, layla: { mood: "thumbsup", message: "Quick - shut the door!" } }, // prove: speed
    14: { adam: null, layla: { mood: "thumbsup", message: "Blocked and breathing. Nice." } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Camera keeps it. Trash loses it." } }, // learn: camera
    16: { adam: null, layla: { mood: "curious", message: "Freeze the proof!" } }, // game: replyCards
    17: { adam: { mood: "worried", message: "He's fibbing about delete - catch him!" }, layla: null }, // prove: lie
    18: { adam: { mood: "excited", message: "Evidence freezer: certified!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Five steps. One calm countdown." }, layla: null }, // learn: protocol
    20: { adam: { mood: "curious", message: "Stack the stages - then launch!" }, layla: null }, // game: stepOrder
    21: { adam: null, layla: { mood: "thumbsup", message: "The whole protocol - in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - drill time!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Protocol or panic - you know it!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His blame machine - pop it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Watch the team win!" } }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, captain!" } }, // stickers
    28: { adam: { mood: "thumbsup", message: "Team Captain badge earned!" }, layla: null }, // completion
  },
};

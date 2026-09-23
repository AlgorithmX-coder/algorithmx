import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 17 - Social Media: The Profile Shield
 *
 * Rebuilt to the Learn-Loop Build Standard. 30 screens:
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 NUMBER   why the 13+ sign exists          | ropeLine       | recall
 *     2 FROST    account privacy, pane by pane    | frostMirror    | speed
 *     3 GOLD     followers are not friends        | friendPanner   | lie
 *     4 SCRUB    check a draft before it goes     | draftScrub     | recall
 *     5 BACKSTAGE the reel is one shiny minute    | reveal         | finish
 *   review (profileInspector) -> boss -> video -> debrief -> stickers -> done
 *
 * WHAT THE REBUILD FIXED. The shipped week had 31 screens and OPENED ON A GAME
 * (the old screen-4 Friend Panner), against the owner's rule that a week never
 * does. Worse, its `reactions` map carried 29 keys for those 31 screens, so from
 * index 2 onward every single reaction landed on the wrong screen: the Raccoon
 * worried about his hall of mirrors over the mission brief, and so on all the
 * way to the completion screen. Both are gone. The map below is 30 keys for 30
 * screens and every line is against the screen it names.
 *
 * ENGINES. Three are NEW, because the six formally free engines are all unfit
 * on merit: ConveyorBelt and ProtectTheData are timed arcade games with a lose
 * state, and CrackTheCode and PasswordLab are password puzzles with no bearing
 * on a social week.
 *   ropeLine     NEW. Rate a room from what is going on inside it.
 *   frostMirror  NEW. Choose an audience for each pane of your own profile.
 *   friendPanner CONVERTED from this week's drag-and-shake signature, now
 *                tap-only: pick the gold out of a scoop, then tip the pan.
 *   draftScrub   NEW. Rewrite your own post, line by line, before it goes.
 *   reveal       RE-THEMED (RETHEME_ALLOWED[17]), W2's only other use, on a new
 *                "backstage" skin: a lit gallery of framed posts, not a brown
 *                cork board of golden cards.
 *   profileInspector  FREE (no rebuilt week uses it) and re-verbed for the
 *                review: W3 judged a STRANGER's profile for fakeness; this
 *                audits the child's OWN for openness, one zone per concept.
 *
 * LANE, and the one that matters most this week: CONCEPT 2 IS ACCOUNT PRIVACY.
 * Week 14 shipped DEVICE privacy (a microphone, a camera, a history, switched
 * off). Nothing in the Frost Mirror switches off; every pane stays on the
 * mirror and the answer is WHO MAY LOOK. Do not let a microphone anywhere near
 * this week. Elsewhere: fake profiles are W3's lane, footprint trails W12's,
 * painted doors W16's, and concept 3 stays on follower-versus-friend rather
 * than drifting onto strangers.
 *
 * TONE. Never anti social media, and never "say less". A profile with nothing
 * on it is not the win and a child taught to fear their own news simply stops
 * posting, which teaches them nothing. Every frosted pane leaves the lovely
 * ones clear, and every scrubbed line keeps the news it was carrying. The 13+
 * number is a label on a room, never a verdict on the child.
 *
 * WARMTH NOTE. Beat 5 touches feeling not-good-enough, so the villain stays OFF
 * that beat entirely (the W5 and W11 precedent): no `threat` on its game, and
 * no raccoon in its recap.
 */
export const WEEK_17: WeekContent = {
  weekNumber: 17,
  title: "Social Media: The Profile Shield",
  topic: "social-media",
  badgeName: "Shield Bearer",
  badgeIcon: "🔰",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 17: THE PROFILE SHIELD", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the highlight reel
    { type: "video", videoPlaceholder: "Week 17: The Highlight Reel", videoSrc: "/videos/module-17-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-17.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has opened a Hall of Mirrors: endless perfect posts, follower numbers spinning round and round, and unlocked profiles anyone at all can stand and stare into. He wants kids dazzled, comparing, and wide open. This week you forge the Profile Shield: read the number on the room, frost your own mirror, tell gold from glitter, check a post before it goes, and see what is really backstage.",
      photoCaption: "Wk 17 - The Hall of Mirrors",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[17] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Read the number on the room, not on yourself",
        "Choose who looks through every pane",
        "Check a post BEFORE it goes anywhere",
      ],
    },

    /* ─────────── BEAT 1 · THE NUMBER ON THE ROOM ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "The 13+ Sign",
      content:
        "You have seen the number. 13+, sitting on the app you wanted. It feels like somebody looked at you and said no. It is not that at all. That number is a LABEL ON THE ROOM, the same way the label on a jar tells you what is in the jar. A 13 means the room is full of grown-up sized things: strangers who can talk to anybody, arguments, adverts aimed at people with money. The number describes what is inside. It never once describes you.",
      bullets: [
        "The number is a label on the ROOM",
        "It says what is going on in there",
        "13 means grown-up sized things inside",
        "It is not a score for how clever you are",
        "Not yet is a fact, not a telling off",
      ],
      bulletIcons: ["🔢", "👀", "🏷️", "🧠", "⏱️"],
      emblem: "🔢",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome to the Hall of Mirrors, Cyber Hero. Look at all these rooms.",
          "Every one of them has a number on a little brass stand outside.",
          "[thinking] And I know how that number feels. Like somebody looked at YOU and said no.",
          "It is not you. That number is a label on the ROOM, like the label on a jam jar.",
          "It tells you what is going on in there. That is the only job it has.",
          "[excited] Come and hand out some numbers with me. You'll see exactly what I mean!",
        ],
      },
    },
    // 5 - Game: NUMBER (RopeLine, NEW).
    // Sarah speaks readAloud, why and explanation only. `name` and `inside` are
    // on screen and never spoken, and no readAloud may name the number.
    {
      type: "ropeLine",
      introTitle: "The Number on the Room",
      introSubtitle: "Look over the rope at what is actually going on in there, then put the right number on the stand.",
      introIcon: "🔢",
      ropeLabel: "OVER THE ROPE",
      insideLabel: "WHAT GOES ON IN THERE",
      shelfLabel: "THE PLATES ON THE SHELF",
      askPrompt: "Which number belongs on this room?",
      counterLabel: "Room",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here we are. Five rooms, and a shelf of brass number plates.",
          "Look over the rope at each one. Not at the name over the door, at what is HAPPENING inside.",
          "Then pick the plate that fits the room. Three, seven or thirteen.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Remember the jam jar. The label is about what is inside, never about who is reading it.",
        ],
      },
      threat: {
        raccoonLine: "I took ALL the number plates off my rooms! Now nobody knows what they are walking into. Heh heh heh.",
      },
      rooms: [
        {
          id: "bouncy",
          name: "The Bouncy Room",
          icon: "🎨",
          inside: "Soft blocks, a slide, and a grown-up sitting by the door the whole time.",
          readAloud: "Have a look in this one. Soft blocks, a little slide, and a grown-up right there by the door.",
          plate: "3",
          why: "Soft blocks and a grown-up sitting right there. Nothing in that room needs anybody to be big yet.",
          explanation: "Look again at what is in there. Blocks, a slide, and a grown-up watching. Who is that room built for?",
        },
        {
          id: "openmic",
          name: "The Big Talk Room",
          icon: "💬",
          inside: "Thousands of strangers, all talking to each other at once, with nobody checking.",
          readAloud: "This one is loud. Thousands of people who have never met, all talking at once, and nobody checking any of it.",
          plate: "13",
          why: "Strangers can say anything to anybody in there and nobody is checking, so that room waits until you are older.",
          explanation: "Count the strangers in there, and then count the people checking what they say. Nobody. That is what the number is for.",
        },
        {
          id: "craft",
          name: "The Making Room",
          icon: "🎨",
          inside: "You build things and show them to people you have added yourself.",
          readAloud: "In here you build things, and you show them to people you added yourself.",
          plate: "7",
          why: "You choose who sees your building, so it is a middle sized room. Not tiny, and nowhere near grown-up.",
          explanation: "The making is easy. The bit to look at is WHO sees it, and in there you pick them yourself.",
        },
        {
          id: "market",
          name: "The Bargain Room",
          icon: "💎",
          inside: "Adverts everywhere asking for a card number to buy things right now.",
          readAloud: "Look at all the adverts in this one. Every single one is asking for a card number to buy something right now.",
          plate: "13",
          why: "That room is asking for a bank card, and a bank card belongs to a grown-up, so the room does too.",
          explanation: "Follow what the room is ASKING for. It wants a card number, and that is a grown-up thing to hand over.",
        },
        {
          id: "story",
          name: "The Story Corner",
          icon: "📋",
          inside: "Picture books read out loud, and the same six stories every day.",
          readAloud: "Nice and quiet in this one. Picture books read out loud, the same six stories every day.",
          plate: "3",
          why: "Six picture books read out loud, and nothing else can happen in there. That is as small and safe as a room gets.",
          explanation: "Ask yourself what else could possibly happen in there. Nothing. Just the stories.",
        },
      ],
      hints: {
        tier1: "Do not read the name over the arch. Read the line under it, the one about what goes on inside.",
        tier2: "Ask one question: can a stranger talk to anybody in there, or is somebody asking for money? Either one means thirteen.",
      },
      completeTitle: "Every room labelled!",
      completeLine: "The number was never about you, Cyber Hero. It was always about the room.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that. Five rooms, five numbers, and you earned every one of them from what was inside.",
          "So when an app shows you a thirteen, you already know what it is telling you.",
          "[warmly] It is describing its room. It is not describing you.",
        ],
      },
    },
    // 6 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "An app has 13+ on it. What is that number actually telling you?",
      choices: [
        { text: "What kind of things go on inside that app", isCorrect: true },
        { text: "How clever you are", isCorrect: false, why: "The number has never met you. It was written before anybody knew you existed." },
        { text: "That you are in trouble", isCorrect: false, why: "Nobody is cross with you. It is a label, and labels do not tell anybody off." },
        { text: "That the app is broken", isCorrect: false, why: "The app works perfectly. It is simply built for a room you are not in yet." },
      ],
      praise: "What kind of things go on inside that app. ✓",
      nudge: "Think about the jam jar. What does a label on a jar describe?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it!",
          "The number is about the room, every single time.",
          "Grown-up sized things inside, grown-up sized number outside.",
          "[warmly] And you can walk right past it without feeling small.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "The number on an app is a label on the room, describing what goes on inside it, never describing you.",
      next: "how to choose who is allowed to look at your own profile",
      emblem: "🔢",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You read the room now, not the telling off.",
          "A number is a label. A label is a fact. Facts are easy to walk past.",
          "[whispers] But there is one room you are already standing in, and it has no door on it at all...",
          "Next, we'll learn how to choose who is allowed to look at your own profile. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · FROST THE MIRROR ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Frost the Mirror",
      content:
        "Your own profile is the room with no door on it. It hangs in the hall like a mirror, and anybody walking past can stop and look through it for as long as they like. Here is the good part: every pane of that mirror has a setting, and the setting says WHO may look. Friends only, or anybody at all. Frosting a pane does not delete it. The thing is still there, still yours, still on your profile. You have simply decided who gets to stand and stare at it.",
      bullets: [
        "Your profile hangs where people walk past",
        "Every pane has a who-can-see setting",
        "Frosted means friends only",
        "Frosting hides nothing from your friends",
        "Some panes are lovely left clear",
      ],
      bulletIcons: ["🆔", "⚙️", "🔒", "👪", "👀"],
      emblem: "🔒",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] So. That room with no door on it? It is yours, Cyber Hero. It is your profile.",
          "It hangs right here in the hall, and anybody walking past can stop and look straight through it.",
          "[warmly] Now here is the lovely part. Every pane of that mirror has a little setting on it.",
          "The setting says who may look. Just your friends, or absolutely anybody.",
          "And frosting a pane deletes nothing. Your friends still see it. You just chose who else does.",
          "[excited] Let's go and frost your mirror together, pane by pane!",
        ],
      },
    },
    // 9 - Game: FROST (FrostMirror, NEW).
    // ACCOUNT privacy, never device switches (W14 owns those). Sarah speaks
    // readAloud, why and explanation; `label` and `shows` stay on screen.
    // At least one pane MUST be frost:false or the lesson becomes "hide it all".
    {
      type: "frostMirror",
      introTitle: "Frost the Mirror",
      introSubtitle: "Six panes, all of them wide open. Work them in any order and decide who looks through each one.",
      introIcon: "🔒",
      mirrorLabel: "YOUR PROFILE MIRROR",
      frostLabel: "FROST IT (FRIENDS ONLY)",
      clearLabel: "LEAVE IT CLEAR (ANYONE)",
      askPrompt: "Who should see the pane you lift?",
      liftPrompt: "Tap a pane to lift it and have a proper look",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here it is. Your whole mirror, all six panes, every one of them clear.",
          "Stand back and look at the lot for a second. That is what a stranger sees in one go.",
          "Tap any pane you like to lift it out, then choose. Frost it for friends, or leave it clear for anybody.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Ask yourself one thing about each pane. Could a stranger USE this to find me?",
        ],
      },
      threat: {
        raccoonLine: "Wide open, every pane of it! I can stand here all day reading your lovely profile. Do NOT touch those settings.",
      },
      panes: [
        {
          id: "school",
          label: "MY SCHOOL",
          icon: "🏫",
          shows: "Oakfield Primary, Class 4B",
          readAloud: "This pane has your school on it. The name of it, and which class you are in.",
          frost: true,
          why: "A school and a class is a building and a time. Anybody reading that knows where to stand at half past three.",
          explanation: "Read it again as a stranger would. It names a building, and it names when you will be in it.",
        },
        {
          id: "drawing",
          label: "MY DRAWING",
          icon: "🎨",
          shows: "A dragon I drew, with the wings all wrong",
          readAloud: "Here is the dragon you drew. The one with the wings you are still cross about.",
          frost: false,
          why: "A dragon with wonky wings tells a stranger absolutely nothing except that you can draw. Leave it up and be proud of it.",
          explanation: "Have another look. Is there anything in that dragon that could help somebody find you? Nothing at all.",
        },
        {
          id: "birthday",
          label: "MY BIRTHDAY",
          icon: "🎂",
          shows: "14 March, and I will be 9",
          readAloud: "This one is your birthday. The day, and how old you are turning.",
          frost: true,
          why: "Your birthday is one of the answers grown-ups use to prove who they are, so it stays with people you know.",
          explanation: "Think about who asks for a date of birth. Banks and schools do. That makes it worth keeping close.",
        },
        {
          id: "team",
          label: "MY TEAM",
          icon: "⭐",
          shows: "I support the team in the red shirts",
          readAloud: "This pane says which team you support. The one in the red shirts.",
          frost: false,
          why: "Millions of people love that team. Knowing you are one of them gets a stranger no closer to you at all.",
          explanation: "Count how many people support that team. A stranger would have to knock on an awful lot of doors.",
        },
        {
          id: "street",
          label: "MY STREET",
          icon: "📍",
          shows: "A photo of my front door and the number on it",
          readAloud: "Look at this one carefully. It is a photo of your front door, with the number showing.",
          frost: true,
          why: "A front door with its number on it is an address, even without a single word written under it.",
          explanation: "Look past the photo to what is IN it. That number is your address, sitting there in a picture.",
        },
        {
          id: "walk",
          label: "MY WALK HOME",
          icon: "🌍",
          shows: "I walk home past the big park every day at 3:30",
          readAloud: "And this one says how you get home. Past the big park, and what time you do it.",
          frost: true,
          why: "A route and a time is the easiest thing in the world for a stranger to wait in, so that one goes to friends only.",
          explanation: "Put the two halves together. A place, and a time you are always there. That is somewhere to wait.",
        },
      ],
      hints: {
        tier1: "Lift the pane and ask it one question. Could somebody who has never met me USE this?",
        tier2: "The ones to frost name a place, a time, or a date. The ones to leave clear are just things you like.",
      },
      completeTitle: "Mirror sorted!",
      completeLine: "Not hidden, Cyber Hero. Yours. You chose who looks through every single pane.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at your mirror now. Frosted where it needed it, and still bright where it did not.",
          "Your dragon is still up there. Your team is still up there. Your friends still see all of it.",
          "[warmly] Nothing got hidden away. You just decided who stands and stares. That is your profile shield.",
        ],
      },
    },
    // 10 - Prove
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Which of these belongs behind frosted glass, friends only?",
      choices: [
        { text: "The name of my school", isCorrect: true },
        { text: "A painting I am proud of", isCorrect: false, why: "A painting tells nobody where you are. Leave it clear and let people enjoy it." },
        { text: "My favourite colour", isCorrect: false, why: "There is nothing a stranger can do with a favourite colour. That one is safe in the open." },
        { text: "The team I support", isCorrect: false, why: "Millions of people support that team. It gets a stranger no nearer to you." },
      ],
      praise: "The name of my school. ✓",
      nudge: "Which one of those is a building a stranger could stand outside?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight to it!",
          "A school is a place, and places are how strangers find people.",
          "Paintings and colours and teams are just you being you.",
          "[warmly] Frost the places. Keep the you.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Every pane of your profile has a who-can-see setting, and frosting one keeps it for friends without hiding it from them.",
      next: "why the big follower number is not a list of your friends",
      emblem: "🔒",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers down, Cyber Hero. Your mirror is frosted exactly where it needed to be.",
          "Friends see everything. Strangers see the dragon and nothing else.",
          "[whispers] Although... he is awfully quiet about that big number spinning at the top of your mirror...",
          "Next, we'll learn why that big follower number is not a list of your friends. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · GOLD AND GLITTER ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Followers Are Not Friends",
      content:
        "At the top of every profile sits a number, and it only ever goes up. That number counts FOLLOWERS, and a follower is simply somebody watching. A friend is different, and there is one question that tells them apart every time: could you say where you know this person from? Sam, from football. Your nana. That is gold. Somebody lovely who replies to everything and has never been anywhere near you is glitter, and glitter is the trick, because glitter is the bit that shines.",
      bullets: [
        "The follower number counts watchers",
        "A friend is somebody you can place",
        "Ask: where do I know them from?",
        "Lovely in the comments is not a place",
        "A few real ones beats a big number",
      ],
      bulletIcons: ["🔢", "👪", "❓", "✨", "💎"],
      emblem: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Right. That big number at the top of your mirror. Let's talk about that one.",
          "It counts followers. And a follower is just somebody watching. That is the whole job.",
          "A friend is a different thing entirely, and there is one question that sorts them out.",
          "[warmly] Could you say WHERE you know them from? Sam, from football. Your nana. That is gold.",
          "Somebody lovely who replies to everything but has never been anywhere near you? That is glitter.",
          "[excited] Come and pan the river with me. You'll spot the difference in a second!",
        ],
      },
    },
    // 13 - Game: GOLD (FriendPanner, the converted signature, TAP-ONLY).
    // Every scoop needs at least one gold and at least one fool's gold. `who`
    // carries the whole test and is never spoken; the scoop's why walks its own
    // pebbles. Nothing is judged until the child tips.
    {
      type: "friendPanner",
      introTitle: "The Friend Panner",
      introSubtitle: "The Feed river is full of followers. Pick out the gold, then tip the pan and let the rest wash through.",
      introIcon: "💎",
      followerCount: 214,
      followersLabel: "FOLLOWERS",
      friendsLabel: "GOLD FOUND",
      panLabel: "IN YOUR PAN",
      tipLabel: "TIP THE PAN",
      emptyTipLabel: "PICK YOUR GOLD FIRST",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here comes the river, and here is your pan. Two hundred and fourteen followers in there.",
          "A scoop at a time. Tap everyone you could actually place, and they stay in the pan.",
          "Then tip it, and everybody else washes straight through. Nothing bad happens to them, they simply are not gold.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Read the little line under each name. If it says WHERE you know them from, that is your gold.",
        ],
      },
      threat: {
        raccoonLine: "Two hundred and fourteen! What a POPULAR little hero. Keep them all, go on. The more the merrier for me.",
      },
      scoops: [
        {
          id: "scoop-1",
          label: "First scoop",
          readAloud: "First scoop out of the river. Four of them. Have a good look at each one.",
          why: "Maya sits next to you and Nana is your nana. SuperFan2000 and the star sender are lovely, but you could not say where either of them is standing right now.",
          explanation: "Go along the little lines underneath. Two of them name a real place. Two of them only name something nice.",
          pebbles: [
            { id: "p-maya", name: "Maya", who: "Sits next to you in Class 4B", icon: "🏫", gold: true },
            { id: "p-nana", name: "Nana", who: "Makes the good custard", icon: "👪", gold: true },
            { id: "p-fan", name: "SuperFan2000", who: "Replies to every post with a heart", icon: "💬", gold: false },
            { id: "p-star", name: "StarSender", who: "Sends a hundred stars a day", icon: "⭐", gold: false },
          ],
        },
        {
          id: "scoop-2",
          label: "Second scoop",
          readAloud: "Second scoop. Four more, and one of these is going to glitter at you.",
          why: "Sam kicks a ball at you every Saturday and Ollie lives four doors down. The scout and the prize account have never once said where they are.",
          explanation: "One of these is shinier than the others and that is exactly why it is worth checking. Where would you have met them?",
          pebbles: [
            { id: "p-sam", name: "Sam", who: "Kicks with you at football", icon: "🎮", gold: true },
            { id: "p-scout", name: "TalentScout", who: "Says you could be famous", icon: "🌟", gold: false },
            { id: "p-ollie", name: "Ollie", who: "Lives four doors down from you", icon: "🏠", gold: true },
            { id: "p-prize", name: "PrizeDrop", who: "Gives away a phone every single day", icon: "🎁", gold: false },
          ],
        },
        {
          id: "scoop-3",
          label: "Last scoop",
          readAloud: "Last scoop of the day. Four more out of the river.",
          why: "Mr Patel teaches you and Ada swims with you on Tuesdays. The other two are just very keen, and keen is not a place.",
          explanation: "Two of these you could point out to a grown-up tomorrow. The other two you could not point out anywhere.",
          pebbles: [
            { id: "p-patel", name: "Mr Patel", who: "Teaches your class on Fridays", icon: "🏫", gold: true },
            { id: "p-hype", name: "HypeSquad", who: "Calls everybody their best friend", icon: "💬", gold: false },
            { id: "p-ada", name: "Ada", who: "Swims with you on Tuesdays", icon: "👪", gold: true },
            { id: "p-follow", name: "FollowBack99", who: "Follows anybody who follows first", icon: "🔀", gold: false },
          ],
        },
      ],
      hints: {
        tier1: "Do not look at how nice they sound. Look for a PLACE in the little line underneath.",
        tier2: "Football, school, four doors down, Tuesdays. Those are places. Hearts, stars and compliments are not.",
      },
      completeTitle: "Panned to the gold!",
      completeLine: "That is the real number, Cyber Hero. Small, and every single one of them yours.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at those two numbers sitting next to each other.",
          "Two hundred and fourteen watching. Six you could walk up to tomorrow and say hello.",
          "[warmly] And here is the thing. The small number is the one that would notice if you were sad.",
        ],
      },
    },
    // 14 - Prove
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon says: 'Anyone who follows you back is officially your friend!' Is he right?",
      choices: [
        { text: "No. Following is watching, and watching is not knowing", isCorrect: true },
        { text: "Yes, following back makes it official", isCorrect: false, why: "Nothing official happens. A button was pressed, and that is the whole of it." },
        { text: "Yes, if they follow you fast", isCorrect: false, why: "Speed says nothing about somebody. It only says their thumb was quick." },
        { text: "Yes, if they have lots of followers", isCorrect: false, why: "A big number means a lot of people are watching them too. It still is not knowing you." },
      ],
      praise: "No. Following is watching, and watching is not knowing. ✓",
      nudge: "Ask the panning question about a follower. Could you say where you know them from?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] You spotted it!",
          "He wants that counter to feel like a friendship list.",
          "It is a list of people watching, and it always was.",
          "[warmly] Your gold is the handful you could name a place for.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "The follower number counts people watching, and the one question that finds a real friend is where do I know them from.",
      next: "how to check a post before it goes anywhere",
      emblem: "💎",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers down, Cyber Hero. Gold in the pan, glitter in the river.",
          "Watching is easy. Knowing somebody takes an actual place and an actual day.",
          "[whispers] Now. All those watchers are still out there, and you are about to post something...",
          "Next, we'll learn how to check a post before it goes anywhere. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · THE HIGHLIGHTER CHECK ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Check It Before It Goes",
      content:
        "Between writing a post and sending it there is a little gap, and that gap belongs entirely to you. Nobody has seen anything yet. So you read it back with a highlighter, looking for two things only: WHERE, and WHEN. Those two together are a map. The good news is that a map can be taken out without taking the news out. Back at Oakfield Primary tomorrow at half eight becomes back at school tomorrow, and it is the same happy post with the map gone.",
      bullets: [
        "Nothing is sent until you send it",
        "Read it back looking for WHERE",
        "Then read it back looking for WHEN",
        "Where plus when makes a map",
        "Swap the map out, keep the news",
      ],
      bulletIcons: ["⏸️", "📍", "⏱️", "🌍", "🔀"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So you have written a post. Lovely. And here is the best bit: it has not gone anywhere.",
          "There is a little gap between writing a thing and sending it, and that gap is all yours.",
          "[thinking] So we read it back with a highlighter, hunting for two words. Where, and when.",
          "Those two stuck together make a map, and a map is the only part a stranger can actually use.",
          "And listen, we are not deleting your news. We swap the map out and keep every bit of the fun.",
          "[excited] Come and run the highlighter over a draft with me!",
        ],
      },
    },
    // 17 - Game: SCRUB (DraftScrub, NEW).
    // Worked top to bottom and NEVER shuffled (it is a sentence), so keeps and
    // swaps are interleaved by hand: keep, swap, keep, swap, swap, keep. Every
    // swapTo keeps the news, or the game teaches a child to stop posting.
    {
      type: "draftScrub",
      introTitle: "The Highlighter Check",
      introSubtitle: "Your post is written and not sent. Read it line by line and swap out the bits that draw a map.",
      introIcon: "🔍",
      draftLabel: "YOUR DRAFT, NOT SENT YET",
      keepLabel: "KEEP IT",
      swapLabel: "SWAP IT",
      askPrompt: "Does this line go as it is?",
      postedByLabel: "Pip",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is the draft. Six lines, sitting on the phone, not sent.",
          "I will light up one line at a time. Read it, then tell me: does it go as it is, or does it get swapped?",
          "Swapping never deletes your news. It just says the same thing without the map.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Two words to hunt for on every line. Where, and when.",
        ],
      },
      threat: {
        raccoonLine: "Post it! Post it all! Every lovely little detail! I do so enjoy a draft that nobody read twice.",
      },
      lines: [
        {
          id: "l1",
          text: "Best day EVER at swimming club!",
          safe: true,
          readAloud: "First line. Best day ever at swimming club.",
          why: "That is your news and it is lovely. It says you had a brilliant time and it does not say where you are.",
          explanation: "Have another read. Is there a place in that line, or a time? Neither. It is just your happy news.",
        },
        {
          id: "l2",
          text: "The pool on Mill Road, next to the big clock",
          swapTo: "At our pool",
          safe: false,
          readAloud: "Second line. The pool on Mill Road, next to the big clock.",
          why: "A road name and a landmark is an address with the word address left off. At our pool says the same thing and keeps it yours.",
          explanation: "That line names a road and a landmark. Put together, somebody could walk straight to it.",
        },
        {
          id: "l3",
          text: "I did a whole length without stopping!",
          safe: true,
          readAloud: "Third line. I did a whole length without stopping.",
          why: "That is the proudest bit of the whole post and there is nothing in it but you being brilliant.",
          explanation: "Read it once more. A whole length is a thing you DID, not a place anybody could stand.",
        },
        {
          id: "l4",
          text: "Same time next Saturday, 10am sharp",
          swapTo: "Going again next week",
          safe: false,
          readAloud: "Fourth line. Same time next Saturday, ten in the morning, sharp.",
          why: "A day and a time is somewhere to wait. Going again next week tells your friends exactly as much and tells a stranger nothing.",
          explanation: "This one is the WHEN. A day and a clock time means anybody reading it knows where you will be standing.",
        },
        {
          id: "l5",
          text: "My badge has my full name and school on it",
          swapTo: "I got my new badge",
          safe: false,
          readAloud: "Fifth line. My badge has my full name and my school on it.",
          why: "A full name and a school in one line is the whole map at once. I got my new badge is still the proud bit, with the map taken out.",
          explanation: "Count what is in that line. A full name, and a school. That is two of the biggest things on your mirror.",
        },
        {
          id: "l6",
          text: "Mum says I can get chips after. YES.",
          safe: true,
          readAloud: "Last line. Mum says I can get chips after. Yes.",
          why: "Chips are not a map. That line is just a happy ending and it can go exactly as it is.",
          explanation: "Look for the where and the when in that one. There is not a single one of either. Only chips.",
        },
      ],
      hints: {
        tier1: "Read the glowing line and hunt for two things only. A place, or a time.",
        tier2: "Road names, clock times and full names get swapped. Feelings and things you did stay exactly as they are.",
      },
      completeTitle: "Draft ready to send!",
      completeLine: "Still your news, Cyber Hero. Just without the map to your front door.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Read it back. Best day ever, a whole length, and chips after.",
          "Every bit of the fun is still sitting right there in it.",
          "[warmly] The only things you took out were a road, a clock and a full name. Nobody will miss those but him.",
        ],
      },
    },
    // 18 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "You are reading a draft back with the highlighter. Which two words are you hunting for?",
      choices: [
        { text: "Where, and when", isCorrect: true },
        { text: "Please, and thank you", isCorrect: false, why: "Lovely manners, but manners do not draw anybody a map." },
        { text: "Funny, and boring", isCorrect: false, why: "How good the post is has nothing to do with how safe it is." },
        { text: "Long, and short", isCorrect: false, why: "A short post can hand over an address, and a long one might hand over nothing." },
      ],
      praise: "Where, and when. ✓",
      nudge: "Which two things stuck together make a map somebody could follow?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Exactly right!",
          "A place on its own is not much. A time on its own is not much either.",
          "Stick them together and you have made somewhere to wait.",
          "[warmly] So we swap one of them out, and the post is still yours.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "The gap before you send belongs to you, and running a highlighter over it takes the map out without taking the news out.",
      next: "what is really behind a perfect looking post",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers down, Cyber Hero. No draft of yours leaves without a read back now.",
          "Map out, news in. That is the whole highlighter trick.",
          "[thinking] And now the strangest room in his whole hall. The one where everything looks perfect...",
          "Next, we'll learn what is really behind a perfect looking post. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE BACKSTAGE TRUTH ─────────── */
    // WARMTH NOTE: this beat touches feeling not-good-enough, so the villain is
    // OFF it entirely. No `threat` on the game, no raccoon in the recap.
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "The Backstage Truth",
      content:
        "Scroll for a minute and everybody looks like they are having the best day of their life. Here is what is actually happening: people post their SHINY MINUTE. The cake that came out right, the goal that went in, the holiday morning. Nobody posts the forty photos before the good one, or the ordinary wet Tuesday, or the bit where they were bored. You are comparing your whole day, all of it, against everybody else's best minute. That is not a fair race, and it was never meant to be one.",
      bullets: [
        "People post their shiniest minute",
        "The other thousand minutes stay off",
        "You see one photo, not forty tries",
        "Your whole day against their best bit",
        "Feeling small means the reel worked",
      ],
      bulletIcons: ["🌟", "🙈", "📸", "⭐", "🧠"],
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Have you ever scrolled for a bit and come away feeling a bit rubbish? I have.",
          "Everybody looks like they are having the best day of their life, all at once.",
          "[warmly] Here is what is really going on. People post their shiniest minute.",
          "The cake that worked. The goal that went in. Not the forty photos before the good one.",
          "So you end up putting your whole ordinary day next to everybody else's best bit. That is not a fair race.",
          "[excited] Come backstage with me. Let's see what is really behind these posts!",
        ],
      },
    },
    // 21 - Game: BACKSTAGE (RevealBoard, RETHEME_ALLOWED[17], "backstage" skin).
    // The board and every word of its chrome are re-themed: a lit gallery of
    // framed posts, not W2's brown cork board of golden cards, and no raccoon
    // anywhere in it. `counter` is the line the child leaves each post with.
    {
      type: "reveal",
      skin: "backstage",
      title: "The Backstage Pass",
      subtitle: "Every post in this gallery looks perfect. Tap one and walk round the back of it.",
      boardIcon: "🎭",
      tapLabel: "TAP TO GO BACKSTAGE",
      stampLabel: "SEEN IT!",
      stampIcon: "👀",
      lockedLine: "Every frame checked. Not one of them was a whole day.",
      progressNoun: "seen backstage",
      planEyebrow: "WHAT THE POST SHOWS",
      planIcon: "📸",
      counterEyebrow: "AND HERE IS THE REST OF IT",
      counterIcon: "🎭",
      revealToast: "BACKSTAGE!",
      stepButtonLabel: "So what is behind it? →",
      counterButtonLabel: "🎭 Got it!",
      vignetteAriaPrefix: "What is really behind",
      trailIcon: "👀",
      completeTitle: "Backstage pass: used!",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here we are. A whole gallery of perfect posts, all framed up and shining.",
          "Tap any frame you like and we will walk round the back of it together.",
          "[thinking] You will see the bit that did not get posted. That bit is where everybody actually lives.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "There is no wrong tap in here, Cyber Hero. Open them all and see everything.",
        ],
      },
      items: [
        {
          id: "cake",
          label: "The Perfect Cake",
          icon: "🎂",
          steps: [
            { icon: "📸", text: "One beautiful cake, lit from the side, not a crumb out of place..." },
            { icon: "🗑️", text: "...and behind the camera, the first two in the bin because they sank in the middle." },
            { icon: "⏱️", text: "That photo took an hour and a half of a Saturday that nobody saw." },
          ],
          counter: "So one perfect cake is really three cakes and an afternoon.",
        },
        {
          id: "holiday",
          label: "The Best Holiday",
          icon: "🌍",
          steps: [
            { icon: "📸", text: "Blue sky, blue sea, everybody laughing at exactly the same moment..." },
            { icon: "🙈", text: "...and just out of the frame, two of them had been arguing about the car park." },
            { icon: "⏱️", text: "It rained for four of the seven days. Those four are not in anybody's feed." },
          ],
          counter: "So a perfect holiday is a real one with the wet bits left out.",
        },
        {
          id: "goal",
          label: "The Amazing Goal",
          icon: "🎮",
          steps: [
            { icon: "📸", text: "The ball in the top corner, arms up, the whole team running over..." },
            { icon: "🙈", text: "...and not filmed at all, the eleven shots before it that went nowhere near." },
            { icon: "💪", text: "Eleven misses, then one goal. The goal is real, it simply arrived at the end of all that missing." },
          ],
          counter: "So one amazing goal is really twelve tries and one camera.",
        },
        {
          id: "room",
          label: "The Tidy Room",
          icon: "🏠",
          steps: [
            { icon: "📸", text: "A bed made perfectly, shelves straight, everything in its place..." },
            { icon: "🙈", text: "...and one foot to the left, the entire floor covered in everything that was on the shelves." },
            { icon: "🌀", text: "So the camera was pointed at the one tidy corner, with that floor carefully just out of shot." },
          ],
          counter: "So a tidy room is often one tidy corner, carefully aimed at.",
        },
        {
          id: "friends",
          label: "Always Out With Friends",
          icon: "👪",
          steps: [
            { icon: "📸", text: "Out laughing on Friday, out again Saturday, out again Sunday..." },
            { icon: "⏱️", text: "...all three photos were taken on the same afternoon and posted across a week." },
            { icon: "🙈", text: "The Tuesday, the Wednesday and the Thursday were homework and telly, same as yours." },
          ],
          counter: "So a busy week can be one busy hour, stretched out.",
        },
      ],
      finale: "Not one of those frames was a whole day. Every single one of them was a minute somebody chose.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[warmly] Five frames, and not one of them was a whole day.",
          "Behind every single one there was a bin, or an argument, or eleven misses, or a floor covered in stuff.",
          "[proud] So the next time a feed makes you feel small, you already know what you are looking at. A minute, Cyber Hero. Not a life.",
        ],
      },
    },
    // 22 - Prove
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "You scroll for a while and start feeling like everybody's life is better than yours. What is actually happening?",
      choices: [
        { text: "You are comparing your whole day to everybody's best minute", isCorrect: true },
        { text: "Everybody's life really is better", isCorrect: false, why: "You are seeing their chosen minute. The bin, the rain and the misses stayed off the screen." },
        { text: "You need to post more", isCorrect: false, why: "Posting more would not change a thing, because you would still be seeing everybody else's shiny minutes." },
        { text: "Your day was boring", isCorrect: false, why: "Your day had ordinary bits in it, the same as theirs did. Theirs simply did not get posted." },
      ],
      praise: "You are comparing your whole day to everybody's best minute. ✓",
      nudge: "Think about what you saw backstage. How much of a day actually gets posted?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That is exactly it!",
          "Your whole day, ordinary bits and all, against their one best minute.",
          "Nobody could win that, and nobody is meant to.",
          "[warmly] Knowing that is the shield, Cyber Hero. It takes all the sting straight out.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the REVIEW, not the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Feeds show a chosen minute, so feeling small is the reel working, not a true thing about your day.",
      next: "walk the whole hall once more and check a profile all the way round",
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers down, Cyber Hero. Every single one of them earned.",
          "Room numbers, frosted panes, gold in the pan, a scrubbed draft, and the backstage truth.",
          "[warmly] Now let's put the whole lot together at once.",
          "Next, we'll walk the hall once more and check a profile all the way round. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: the whole week on one board (ProfileInspector, free engine,
    // re-verbed). W3 judged a STRANGER's profile for fakeness; this audits a
    // profile for OPENNESS, and the four zones are four of the week's concepts,
    // in a fixed order because they ARE the checking round.
    {
      type: "profileInspector",
      introTitle: "The Shield Check",
      introSubtitle: "Three profiles, and a round of four checks on each. Open every check, then call it.",
      introIcon: "🔰",
      realLabel: "SHIELD UP",
      fakeLabel: "STILL OPEN",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last walk of the hall, Cyber Hero, and you are doing the checking this time.",
          "Three profiles. On each one, tap all four checks before you decide anything.",
          "Then call it. Shield up, or still open.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "All four checks first. A profile can look lovely and still have one pane wide open.",
        ],
      },
      threat: {
        raccoonLine: "Oh, inspecting now, are we? Go on then. I have left something open on every single one of these. Probably.",
      },
      profiles: [
        {
          id: "pip",
          handle: "Pip",
          avatar: "👤",
          bio: "Draws dragons. Swims on Tuesdays.",
          stats: [
            { label: "Followers", value: "214" },
            { label: "Account", value: "PRIVATE" },
          ],
          isFake: false,
          zones: [
            { id: "age", label: "The room number", note: "Pip uses the app made for under thirteens, not the big talk one.", isRedFlag: false },
            { id: "panes", label: "The mirror panes", note: "School, birthday and street are all frosted. The dragon is clear.", isRedFlag: false },
            { id: "gold", label: "The follower list", note: "Two hundred and fourteen watching, and the six in the heart frame are all placeable.", isRedFlag: false },
            { id: "draft", label: "The last post", note: "Best day at swimming, one whole length, chips after. No road and no clock.", isRedFlag: false },
          ],
          verdictNote: "Every check came back clean. That is a shield, all the way round.",
          why: "Right room, frosted panes, a heart frame you could point at, and a post with no map in it. All four.",
          nudge: "Four checks open, and not a road or a clock among them. Is there a single one that hands anything over?",
        },
        {
          id: "bo",
          handle: "Bo",
          avatar: "👤",
          bio: "Football mad. Back at training Saturday 10am, Mill Road pitches!",
          stats: [
            { label: "Followers", value: "1,208" },
            { label: "Account", value: "PUBLIC" },
          ],
          isFake: true,
          zones: [
            { id: "age", label: "The room number", note: "Bo is on the big talk app, where anybody can message anybody.", isRedFlag: true },
            { id: "panes", label: "The mirror panes", note: "Every pane is clear, school badge included.", isRedFlag: true },
            { id: "gold", label: "The follower list", note: "Twelve hundred followers, and most of the heart frame are people Bo has never met.", isRedFlag: true },
            { id: "draft", label: "The last post", note: "Saturday, ten in the morning, and the name of the road.", isRedFlag: true },
          ],
          verdictNote: "Wide open on all four. A road, a time and a school, sitting out where anybody can read them.",
          why: "All four checks came back open. The post alone gives a place and a time, which is somewhere to wait.",
          nudge: "Four checks open. Put the last post together with the public setting. What could a stranger do with that?",
        },
        {
          id: "wren",
          handle: "Wren",
          avatar: "👤",
          bio: "Baking, badly. Ask me about my sunken cakes.",
          stats: [
            { label: "Followers", value: "96" },
            { label: "Account", value: "PRIVATE" },
          ],
          isFake: true,
          zones: [
            { id: "age", label: "The room number", note: "Wren is in the making room, which is the right one.", isRedFlag: false },
            { id: "panes", label: "The mirror panes", note: "Almost all frosted, but the walk home is still clear: past the big park, half three.", isRedFlag: true },
            { id: "gold", label: "The follower list", note: "Ninety six followers and a small heart frame, every one of them placeable.", isRedFlag: false },
            { id: "draft", label: "The last post", note: "A photo of a sunken cake. No place in it and no time in it.", isRedFlag: false },
          ],
          verdictNote: "Three checks clean and one pane left clear, and that one pane is a route and a time.",
          why: "Three of these were lovely, and that is exactly why the fourth is worth finding. A walk home is a place plus a time.",
          nudge: "Four checks open. Three came back fine. Go back and read the panes one more time.",
        },
      ],
      hints: {
        tier1: "Open all four checks before you call it. One clear pane is enough to leave a profile open.",
        tier2: "A profile is only shielded when all four come back clean: the right room, frosted panes, a placeable heart frame and a post with no map.",
      },
      completeTitle: "Hall walked!",
      completeLine: "Four checks, every profile, every time. That is the Profile Shield, Cyber Hero.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three profiles, four checks each, and you found every open pane in the place.",
          "The room, the panes, the heart frame and the last post. That is the round, and now it is yours.",
          "[excited] Which is just as well, because somebody is waiting at the end of this hall.",
        ],
      },
    },

    // 25 - Boss
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the hall goes dark
    { type: "video", videoPlaceholder: "Week 17: Shield Bearer", videoSrc: "/videos/module-17-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "number", label: "Room Reader", accent: "#7eff97", icon: "🔢", summary: "The number is a label on the room, never on you." },
        { id: "frost", label: "Mirror Froster", accent: "#7df0ff", icon: "🔒", summary: "Every pane has a who-can-see, and you choose it." },
        { id: "gold", label: "Gold Panner", accent: "#ffd158", icon: "💎", summary: "Ask where you know them from. That finds the gold." },
        { id: "scrub", label: "Draft Checker", accent: "#c084fc", icon: "🔍", summary: "Swap the where and the when out, keep the news in." },
        { id: "backstage", label: "Backstage Pass", accent: "#ff5fb3", icon: "🎭", summary: "A feed is a chosen minute, never a whole day." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Rooms read, panes frosted, gold panned,",
          "drafts checked... and the backstage seen for what it is.",
          "[laughs] His whole Hall of Mirrors just stopped working on you.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "mirror-froster", name: "Mirror Froster", icon: "🔒", description: "Chooses who looks through every pane." },
        { id: "gold-panner", name: "Gold Panner", icon: "💎", description: "Knows where every friend is known from." },
        { id: "backstage-pass", name: "Backstage Pass", icon: "🎭", description: "Sees the whole day, not the shiny minute." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#38b6ff",
    theme: {
      topic: "Social Media",
      motifs: ["💬", "👍", "👀", "🔒", "🛡️", "🌍", "📱", "⭐"],
    },
    intro: {
      slug: "quiz-w17-intro",
      text: "Step into the quiz hall! Every mirror in here says you'll get everything wrong. Very honest mirrors. I checked them myself!",
    },
    victory: {
      slug: "quiz-w17-victory",
      text: "The mirrors say the kid WON?! Ugh, honest mirrors, worst purchase I ever made! I'm off to go follow myself for comfort!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w17-c1",
        key: "quiz-w17-c1-1",
        label: "The 13+ Sign",
        ask: {
          slug: "quiz-w17-ask-c1-1",
          text: "A new app's door has a big 13+ sign, and Adam is eight. What is the sign really telling him?",
        },
        options: [
          { text: "Not yet, that room is built grown-up-sized" },
          { text: "Never, kids are banned from the internet forever" },
          { text: "Go on in, door signs are only suggestions" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "13+ means not yet!",
          explanation: "It isn't a ban on everything, and it isn't a suggestion. It's a NOT YET: those rooms are full of strangers, pressure and tricks that take practice, and Adam is still growing his powers for them.",
        },
        villainRight: {
          slug: "quiz-w17-right-c1-1",
          text: "Not yet, says the kid, and walks away HAPPY?! I can't work with patient heroes!",
        },
        villainWrong: {
          slug: "quiz-w17-wrong-c1-1",
          text: "Only a suggestion! Or a lifetime ban! Whichever! Both keep things nice and muddled!",
        },
      },
      {
        phaseId: "phase-w17-c2",
        key: "quiz-w17-c2-1",
        label: "Frost the Mirror",
        ask: {
          slug: "quiz-w17-ask-c2-1",
          text: "Pip the fox cub's profile is set to PUBLIC. Who can stare into that mirror right now?",
        },
        options: [
          { text: "Anyone at all who wanders past online" },
          { text: "Only the people Pip has met in real life" },
          { text: "Only kind people, mean ones get blocked automatically" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Public means everyone!",
          explanation: "A public profile doesn't check who's kind or who Pip knows, there's no magic doorman. Unlocked means ANY passerby can look in, and that's exactly why the mirror gets frosted.",
        },
        villainRight: {
          slug: "quiz-w17-right-c2-1",
          text: "You know what public really means?! There goes my favorite window shopping!",
        },
        villainWrong: {
          slug: "quiz-w17-wrong-c2-1",
          text: "A magic mean-people filter, of course! Leave it public, the hall is FULL of lovely strangers!",
        },
      },
      {
        phaseId: "phase-w17-c3",
        key: "quiz-w17-c3-1",
        label: "Followers Aren't Friends",
        ask: {
          slug: "quiz-w17-ask-c3-1",
          text: "A stranger with a MILLION followers messages Pip: 'Follow me back and we'll be best friends forever!' What is true here?",
        },
        options: [
          { text: "A big follower number can't make someone a friend" },
          { text: "A million followers means a million safety checks passed" },
          { text: "Saying best friends forever is what makes it real" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Friends know YOU!",
          explanation: "Follower counters count taps, not kindness, and words in a message are just words. A friend is someone who actually knows you, and a stranger stays behind the rope, whatever their number says.",
        },
        villainRight: {
          slug: "quiz-w17-right-c3-1",
          text: "The rope stays UP?! But I typed 'forever' and everything!",
        },
        villainWrong: {
          slug: "quiz-w17-wrong-c3-1",
          text: "A million followers, all definitely wonderful! Swing that rope wide open, bestie incoming!",
        },
      },
      {
        phaseId: "phase-w17-c4",
        key: "quiz-w17-c4-1",
        label: "The Highlighter Check",
        ask: {
          slug: "quiz-w17-ask-c4-1",
          text: "Which line in Pip's draft post glows RED under the highlighter?",
        },
        options: [
          { text: "Meet me at the school gates at 3:15!" },
          { text: "We won our game this morning!" },
          { text: "I love drawing dragons best!" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Where plus when glows red!",
          explanation: "Winning news and dragon love carry no clues, they glow green. A place AND a time together make a find-me map, and find-me maps get scrubbed before anything posts.",
        },
        villainRight: {
          slug: "quiz-w17-right-c4-1",
          text: "Scrubbed before sending?! That was the juiciest line in the whole draft!",
        },
        villainWrong: {
          slug: "quiz-w17-wrong-c4-1",
          text: "Post the where! Post the when! I do love a post with directions in it!",
        },
      },
      {
        phaseId: "phase-w17-c5",
        key: "quiz-w17-c5-1",
        label: "The Backstage Truth",
        ask: {
          slug: "quiz-w17-ask-c5-1",
          text: "Everyone posted AMAZING birthday parties, and Pip's was small and quiet. What is the backstage truth?",
        },
        options: [
          { text: "Feeds show one shiny minute, not the whole day" },
          { text: "Everyone else's whole life really is that sparkly" },
          { text: "Pip should throw a bigger party next time, for the photos" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Reels aren't real days!",
          explanation: "Nobody's life is all sparkle, and parties aren't for photos. A feed shows each person's one best minute, and comparing a whole real day to that minute isn't fair on anyone. Quiet can be lovely.",
        },
        villainRight: {
          slug: "quiz-w17-right-c5-1",
          text: "You saw backstage?! The confetti is GLUED on, you know! All of it!",
        },
        villainWrong: {
          slug: "quiz-w17-wrong-c5-1",
          text: "Yes, believe the sparkle! Feeling left out is what my mirrors run on!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-17-shield-bearer.png",

  // Week-lane attack theatre: mirror-hall tricks only (fake profiles = W3,
  // footprint trails = W12, painted doors = W16).
  bossAttacks: [
    { name: "HIGHLIGHT REEL", icon: "🌟", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Backstage is real life", emblemColor: 0xff5fb3 },
    { name: "FOLLOWER FLOOD", icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Viewers aren't friends", emblemColor: 0xc084fc },
    { name: "OPEN MIRROR", icon: "👀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Frost it - friends only", emblemColor: 0x7df0ff },
  ],

  // Placeholder quiz boss (the bespoke W17 fight - darken the hall of
  // mirrors - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What does the 13+ sign on social media really mean?", answers: ["The rooms are grown-up-sized - you grow toward it", "You're not clever enough", "It's a punishment", "Nothing - ignore it"], correctIndex: 0, explanation: "Not a punishment - it means NOT YET, and every ring you grow makes you readier." },
      { question: "The one flip that frosts your whole profile mirror is...", answers: ["Account: PRIVATE - friends only", "Messages: friends only", "Sound: loud", "Name: bigger letters"], correctIndex: 0, explanation: "Private means strangers see armor and friends see you." },
      { question: "A follower is...", answers: ["A viewer watching through the glass", "Automatically a friend", "Someone who loves you", "Family"], correctIndex: 0, explanation: "Friends know your dog's name - viewers just watch." },
    ],
    medium: [
      { question: "Which draft line glows RED under the highlighter?", answers: ["'Meet me at the school gates at 3:15'", "'#NewSneakers'", "'I love drawing dragons'", "'We won our game!'"], correctIndex: 0, explanation: "Where-plus-when is a find-me map - it gets scrubbed before anything posts." },
      { question: "10,000 followers means...", answers: ["10,000 viewers - the counter doesn't measure friendship", "10,000 friends", "You're 10,000 times more loved", "You win social media"], correctIndex: 0, explanation: "Counters count taps; love is Grandma printing your drawing for her fridge." },
      { question: "Everyone's feed looks perfect and yours feels small. The truth is...", answers: ["Feeds are highlight reels - nobody posts the soggy Tuesday", "Everyone's life really is perfect", "You should post more", "Your life is boring"], correctIndex: 0, explanation: "One shiny minute gets posted; the burnt toast never does. Backstage is where real life lives." },
    ],
    hard: [
      { question: "Why does a 'talent scout' who says 'you could be FAMOUS!' go behind the rope?", answers: ["Too-friendly-too-fast plus a shiny promise is the stranger playbook", "Scouts are always real", "Fame is guaranteed", "Because they're busy"], correctIndex: 0, explanation: "Week 3's tells in a new coat - flattery is bait, and the rope is for bait." },
      { question: "A feed announces: 'post at 6am daily or you're out of the club!' A shield bearer...", answers: ["Pauses - a feed that gives you homework isn't a friend", "Sets the alarm", "Posts twice to be safe", "Begs to stay in"], correctIndex: 0, explanation: "When an app starts setting your alarm clock, it's forgotten who's boss - pause and tell someone." },
      { question: "The heart-frame rule says friends are people who...", answers: ["You KNOW in real life - they'd notice if you were sad", "Follow you back", "Like every photo fast", "Have the most followers"], correctIndex: 0, explanation: "Knowing beats following - the frame stays honest however fast the counter spins." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.

  // Keyed by SCREEN INDEX (0-29), and there are exactly 30 screens above.
  // The shipped week carried 29 keys for 31 screens, so from index 2 onward
  // every reaction landed on the wrong screen. Counted and re-checked on the
  // rebuild: if a screen is ever inserted or removed, shift these with it (the
  // trailing labels are there to make that possible at a glance).
  // The 5 recap checkpoints are indices 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 17 - the profile shield!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "His hall of mirrors is OPEN..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the layout." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Shield up? Let's walk the hall." } }, // mission brief
    4: { adam: null, layla: { mood: "thinking", message: "13+ is a label, not a wall." } }, // learn: the number
    5: { adam: null, layla: { mood: "curious", message: "Look inside, then pick a plate!" } }, // game: ropeLine
    6: { adam: { mood: "thumbsup", message: "What is that number really about?" }, layla: null }, // prove: recall
    7: { adam: { mood: "excited", message: "The sign makes sense now!" }, layla: null }, // recap 1
    8: { adam: { mood: "thinking", message: "A room with no door... anyone can stare." }, layla: null }, // learn: frost
    9: { adam: { mood: "curious", message: "Six panes. Who gets to look?" }, layla: null }, // game: frostMirror
    10: { adam: null, layla: { mood: "thumbsup", message: "Quick now - which one is a place?" } }, // prove: speed
    11: { adam: null, layla: { mood: "excited", message: "The mirror is FROSTED!" } }, // recap 2
    12: { adam: null, layla: { mood: "thinking", message: "That counter only ever goes up..." } }, // learn: gold
    13: { adam: null, layla: { mood: "curious", message: "Pick your gold, then tip the pan!" } }, // game: friendPanner
    14: { adam: { mood: "worried", message: "Careful - is he fibbing? Listen close!" }, layla: null }, // prove: lie
    15: { adam: { mood: "excited", message: "Gold in the pan, glitter in the river!" }, layla: null }, // recap 3
    16: { adam: { mood: "thinking", message: "Nothing is sent until YOU send it." }, layla: null }, // learn: scrub
    17: { adam: { mood: "curious", message: "Line by line - where and when!" }, layla: null }, // game: draftScrub
    18: { adam: null, layla: { mood: "thumbsup", message: "Which two words were you hunting?" } }, // prove: recall
    19: { adam: null, layla: { mood: "excited", message: "No draft leaves without a read back!" } }, // recap 4
    20: { adam: null, layla: { mood: "thinking", message: "One shiny minute is not a day." } }, // learn: backstage
    21: { adam: null, layla: { mood: "curious", message: "Go on, walk round the back of one!" } }, // game: reveal
    22: { adam: { mood: "thumbsup", message: "So what were you really comparing?" }, layla: null }, // prove: finish
    23: { adam: { mood: "excited", message: "All five powers - one last walk!" }, layla: null }, // recap 5
    24: { adam: { mood: "excited", message: "Four checks on every profile!" }, layla: null }, // review: profileInspector
    25: { adam: { mood: "worried", message: "His hall - darken it for good!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Shield forged - hall closed!" } }, // outro video
    27: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    28: { adam: { mood: "excited", message: "Stickers earned, Shield Bearer!" }, layla: null }, // stickers
    29: { adam: { mood: "thumbsup", message: "Shield Bearer badge earned!" }, layla: null }, // completion
  },
};

import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 9 - Apps & Downloads: Spot the Fakes. REBUILT to the Learn-Loop Build
 * Standard v0.10 (2026-09-17, the tenth rebuilt week). World: the Sorting
 * Warehouse (a busy app warehouse: parcels on a loading dock, crates on
 * shelves, a big roller door, the cast as warehouse checkers). The week where
 * the child learns to check an app before it ever reaches their device.
 *
 *   0 video · 1 alert · 2 ATLAS briefing · 3 mission
 *   5 x (Learn -> Game -> Prove -> Recap):
 *     1 SHOP      apps come from the official store only | vaultDrop   The Delivery Dock (dock skin)    | recall
 *     2 COPYCAT   count the whiskers                     | nameTagCheck The Whisker Check (app skin)     | speed
 *     3 KEYS      why does it need that?                 | flipTheBox  Flip the Box (tap-only signature) | lie
 *     4 FREE      FREE apps get paid another way         | testDrive   The Test Drive (NEW)              | finish
 *     5 TOGETHER  install together with a grown-up       | fourEyes    Four Eyes (NEW)                   | order
 *   24 review: passwordVault "The Warehouse" (warehouse skin) · 25 quiz boss (5 questions, pass 4)
 *   26 video · 27 debrief · 28 stickers · 29 completion. 30 screens; the old
 *   screen-4 signature (Flip the Box) now lives behind its lesson as concept 3.
 *
 * Engine reuse (audit-engine-reuse): testDrive and fourEyes are NEW; Flip the
 * Box is the week's own signature made tap-only and data-driven. VaultDrop
 * (W2), NameTagCheck (W4) and PasswordVault (W4, review) are re-themes under the
 * amended reuse rule (owner decided option B): different skill, non-neighbouring
 * weeks, under cap, at most two concept-game re-themes. The design table's
 * Install Handshake (a GuardCount re-theme) is the new Four Eyes engine instead.
 *
 * Content fixes carried in: no game before Learn 1, no real store brands (the
 * "official app store on your device"), invented app names only, every item
 * has a readAloud, verdicts are one take with the reason, a teach on every
 * Prove-it, a spoken payoff on every complete beat, and no dash-style
 * punctuation in child-facing copy. Dialogue audited to 0 flags on both layers
 * with `node scripts/audit-narration-flow.mjs --week=9`.
 */
export const WEEK_9: WeekContent = {
  weekNumber: 9,
  title: "Apps & Downloads: Spot the Fakes",
  topic: "apps-downloads",
  badgeName: "Copycat Catcher",
  badgeIcon: "🎯",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 9: SPOT THE FAKES", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the copycat shop
    { type: "video", videoPlaceholder: "Week 9: The Copycat Shop", videoSrc: "/videos/module-09-intro.mp4" },

    // 1 - ALERT: incident report (Sarah reads the caption word for word, then reacts)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-09.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon built a COPYCAT of the most popular game: same icon, one letter different. Kids who grabbed it got endless ads, coin traps and a sneaky camera permission. This week you learn to spot the fakes.",
      photoCaption: "Wk 9 - Spot the Fakes",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, something fishy just arrived at the warehouse. Read this incident report with me.",
          "The Raccoon built a COPYCAT of the most popular game: same icon, one letter different. Kids who grabbed it got endless ads, coin traps and a sneaky camera permission. This week you learn to spot the fakes.",
          "[whispers] Same icon. One letter different. That was all it took.",
          "[warmly] By the end of today, no copycat gets past your checks.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[9] },

    // 3 - Mission brief (learn this, so you're protected from that)
    {
      type: "mission",
      objectives: [
        "Know where real apps come from, and spot a copycat",
        "Check an app only asks for the keys its job needs",
        "Install a new app with a grown-up, so four eyes check it",
      ],
    },

    /* ─────────── BEAT 1 · THE ONE REAL SHOP ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "The One Real Shop",
      content:
        "New apps come from ONE place: the official app store on your device. That shop CHECKS apps before they go on the shelf. A download button on a random website, a pop-up, or a link in the comments? Nobody checked that. If an app isn't in the official store, it doesn't come home.",
      bullets: [
        "The official store checks apps first",
        "Random websites: nobody checked",
        "Pop-up download buttons are traps",
        "Links in comments aren't shops",
        "Not in the real shop? Not coming home",
      ],
      bulletIcons: ["📱", "❓", "🪤", "💬", "🚫"],
      emblem: "📱",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero! This week we run the app warehouse.",
          "And here is rule one, a big one.",
          "New apps come from ONE real shop: the official app store on your device.",
          "[warmly] That shop checks every app before it goes on the shelf.",
          "[whispers] Random websites, pop-ups, comment links? Nobody checked those.",
          "[excited] Come and work the Delivery Dock, and send back anything sketchy!",
        ],
      },
    },
    // 5 - Game: SORT "The Delivery Dock" (vaultDrop re-theme, dock skin, W2 engine)
    {
      type: "vaultDrop",
      skin: "dock",
      threat: {
        raccoonLine:
          "My parcels come from everywhere: websites, pop-ups, comment links! Kids never read the label. They just grab the box with the shiny game on it!",
      },
      introTitle: "The Delivery Dock",
      introSubtitle: "App parcels are arriving. Read where each one came from, then put it on the real shop shelf or send it back.",
      introIcon: "📥",
      destinationLabels: { keep: "REAL SHOP SHELF", away: "SEND IT BACK" },
      motto: "Official store in. Everything else goes back.",
      rightToast: "SORTED!",
      wrongTitle: "Read the label again",
      completeTitle: "Every parcel sorted!",
      completeLine: "Official store apps shelved, sketchy parcels sent back.",
      items: [
        {
          id: "store-blast",
          text: "Blast Birds, from the official app store",
          icon: "📱",
          isPrivate: false,
          readAloud: "A parcel from the official app store: Blast Birds.",
          why: "The official store checked Blast Birds before the shelf, so on the shelf it goes.",
          explanation: "This one came from the official app store, which checks every app first. It belongs on the real shop shelf.",
        },
        {
          id: "web-free",
          text: "FREE Blast Birds, from freegames-4u.biz",
          icon: "🪤",
          isPrivate: true,
          readAloud: "A parcel from a website called freegames four u: FREE Blast Birds.",
          why: "A random website checks nothing, and that FREE game is bait. Back it goes.",
          explanation: "Look where it came from: a random website. Nobody checked that app, so it gets sent back.",
        },
        {
          id: "store-pets",
          text: "Pixel Pets, from the official app store",
          icon: "📱",
          isPrivate: false,
          readAloud: "A parcel from the official app store: Pixel Pets.",
          why: "Official store, checked before the shelf. Pixel Pets goes on the shelf.",
          explanation: "Pixel Pets came from the one shop that checks apps first. It belongs on the shelf.",
        },
        {
          id: "popup-fast",
          text: "A pop-up: download the game HERE, it's faster!",
          icon: "⚡",
          isPrivate: true,
          readAloud: "A parcel from a pop-up that says: download the game here, it's faster!",
          why: "Pop-up download buttons are traps. The real shop never pops up, so send it back.",
          explanation: "That parcel came from a pop-up, and nobody checked what's inside. Pop-ups aren't shops, so it goes back.",
        },
        {
          id: "school-app",
          text: "The school's reading app, in the official app store",
          icon: "🏫",
          isPrivate: false,
          readAloud: "A parcel from the official app store: the reading app your school picked.",
          why: "School picked it, and the real shop checked it. Double checked, so it goes on the shelf.",
          explanation: "Your school chose it, and the real shop checked it. That parcel belongs on the shelf.",
        },
        {
          id: "forum-early",
          text: "Get it EARLY, not in shops yet! From a forum",
          icon: "🤫",
          isPrivate: true,
          readAloud: "A parcel from a forum that says: get it early, it's not in shops yet!",
          why: "Not in shops yet means nobody has checked it yet. Send it back.",
          explanation: "Not in shops yet means no shop has checked it. A parcel from a forum goes back.",
        },
        {
          id: "store-update",
          text: "An update for your game, inside the official app store",
          icon: "✅",
          isPrivate: false,
          readAloud: "A parcel from inside the official app store: an update for your game.",
          why: "Real updates live inside the real shop, so on the shelf it goes.",
          explanation: "This update came from inside the real shop, where real updates live. It goes on the shelf.",
        },
        {
          id: "comment-link",
          text: "A download link in a video's comments",
          icon: "💬",
          isPrivate: true,
          readAloud: "A parcel from a link in a video's comments.",
          why: "A link down in the comments is a stranger's parcel. Nobody checked it, so send it back.",
          explanation: "That parcel came from a comment link. Nobody checked it, so it goes back.",
        },
      ],
      hints: {
        tier1: "Read the label: did it come from the official app store, or somewhere else?",
        tier2: "Official app store, even when school picked it: shelf. Websites, pop-ups, forums and comment links: send it back.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, you run the Delivery Dock!",
          "This game is all about where an app comes from.",
          "Out in the real world, apps turn up from everywhere: shops, websites, pop-ups and comment links.",
          "Here is what you do. A parcel rolls onto the dock, and I read its label. If it came from the official app store, tap REAL SHOP SHELF. If it came from anywhere else, tap SEND IT BACK.",
          "[warmly] Read every label before you choose. Ready? First parcel!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here comes the first parcel, with its label on top."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every parcel sorted, Cyber Hero! Only official store apps made the shelf.",
          "[warmly] Out in the real world, new apps come from the official app store, and anything else goes straight back.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Where's the ONE safe place to get a new app?",
      choices: [
        { text: "The official app store", isCorrect: true },
        { text: "A pop-up that says FREE", isCorrect: false, why: "Pop-ups aren't shops. Nobody checked what's behind that button." },
        { text: "A website's download button", isCorrect: false, why: "Websites don't check apps. The official app store does." },
        { text: "A link in the comments", isCorrect: false, why: "Comments aren't shops. A link down there could lead anywhere." },
      ],
      praise: "The official app store, every time. ✓",
      nudge: "Which shop checked every parcel before the shelf?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "The official app store is the one safe place.",
          "It checks every app before the shelf.",
          "[warmly] Anywhere else, nobody checked.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "New apps come from the official app store only. It checks apps before the shelf, and random sources don't.",
      next: "how to catch the copycats that sneak into the real shop",
      emblem: "📱",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] What a dock, Cyber Hero. Every label read, every sketchy parcel sent back.",
          "Official store in, everything else out.",
          "[whispers] But here's the twist. Some fakes sneak into the real shop itself, wearing a costume.",
          "Next, we'll learn how to catch the copycats that sneak into the real shop. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · COUNT THE WHISKERS ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Count the Whiskers",
      content:
        "Copycat apps dress up as famous ones: the same icon and almost the same name. But a copycat always misses a whisker! Check THREE things: the NAME (Blast Birds or Blast Birdz?), the MAKER (Pebble Games or Pebb1e Games?), and the DOWNLOADS (5 million, or 12 since yesterday?). Real apps have a history. Copycats are brand new and a little bit wrong.",
      bullets: [
        "Copycats copy the real app's icon",
        "Check the NAME, letter by letter",
        "Check the MAKER's name too",
        "Check the DOWNLOADS: 12 isn't 5 million",
        "A copycat always misses a whisker",
      ],
      bulletIcons: ["🎭", "🔠", "👤", "🔢", "🔍"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] So, Cyber Hero, copycat apps wear costumes. Same icon, almost the same name.",
          "But a copycat always misses a whisker!",
          "Check the name, letter by letter. Check who made it.",
          "And check the downloads. Five million, or twelve since yesterday?",
          "[warmly] Real apps have a history. Copycats are brand new and a little bit wrong.",
          "[excited] Come and catch every copycat in the Whisker Check!",
        ],
      },
    },
    // 9 - Game: MARK "The Whisker Check" (nameTagCheck re-theme, app skin, W4 engine)
    {
      type: "nameTagCheck",
      skin: "app",
      pieceLabels: ["Name", "Maker", "Downloads"],
      threat: {
        raccoonLine:
          "One tiny letter, that's all I change! A z for an s, a zero for an o. Kids see the icon and tap GET before they read a single letter!",
      },
      introTitle: "The Whisker Check",
      introSubtitle: "The real app sits on top. Check the app underneath piece by piece, mark every swapped piece, then finish the check.",
      introIcon: "🎭",
      stampLabel: "SWAPPED",
      closeLabel: "CHECK DONE",
      realSeal: "REAL APP",
      fakeSeal: "COPYCAT!",
      realToast: "REAL APP!",
      fakeToast: "COPYCAT CAUGHT!",
      wrongTitle: "Check the pieces again!",
      completeTitle: "Every copycat caught!",
      completeLine: "Real apps cleared, costumes caught.",
      boardPrompt: "Compare each piece with the real app · tap a swapped piece to mark it · tap again to lift it · then tap check done",
      caughtLabel: { one: "copycat caught", many: "copycats caught" },
      cases: [
        {
          id: "blast-birds",
          appIcon: "🎮",
          realChunks: ["Blast Birds", "by Pebble Games", "5 million downloads"],
          chunks: [
            { text: "Blast Birdz", isWrong: true, teach: "Look at the last letter of the name. Birdz with a z is not Blast Birds. That's a swap." },
            { text: "by Pebble Games", isWrong: false, teach: "The maker's name matches the real one exactly. That piece checks out, so leave it clean." },
            { text: "12 downloads", isWrong: true, teach: "Twelve downloads is not five million. A real hit has a history. That's a swap." },
          ],
          readAloud: "The real Blast Birds is on top. Check the Blast Birds underneath: its name, its maker and its downloads, piece by piece.",
          rightWhy: "A z for an s, and only twelve downloads. Two swaps, so this Blast Birds is a copycat.",
        },
        {
          id: "pixel-pets",
          appIcon: "🐶",
          realChunks: ["Pixel Pets", "by Brightbox Studio", "8 million downloads"],
          chunks: [
            { text: "Pixel Pets", isWrong: false, teach: "The name matches the real Pixel Pets letter for letter. That piece checks out, so leave it clean." },
            { text: "by Brightbox Studio", isWrong: false, teach: "Brightbox Studio is spelled exactly like the real maker. That piece checks out, so leave it clean." },
            { text: "8 million downloads", isWrong: false, teach: "Eight million downloads matches the real history. That piece checks out, so leave it clean." },
          ],
          readAloud: "Pixel Pets, on both cards this time. Check the one underneath against the one on top, piece by piece.",
          rightWhy: "Every piece matches the real Pixel Pets, letter for letter. No swaps, so this one is the real app.",
        },
        {
          id: "robo-racers",
          appIcon: "🚀",
          realChunks: ["Robo Racers", "by Zoomtrack", "12 million downloads"],
          chunks: [
            { text: "R0bo Racers", isWrong: true, teach: "Look closely at the first o in the name. It's a zero! That's a swap." },
            { text: "by Zoomtrack", isWrong: false, teach: "Zoomtrack matches the real maker exactly. That piece checks out, so leave it clean." },
            { text: "12 million downloads", isWrong: false, teach: "Twelve million downloads matches the real history. That piece checks out, so leave it clean." },
          ],
          readAloud: "The real Robo Racers is on top. Check the Robo Racers underneath, piece by piece. Look very closely.",
          rightWhy: "One sneaky zero hiding in the name. One swap is enough, so this Robo Racers is a copycat.",
        },
        {
          id: "torchy",
          appIcon: "💡",
          realChunks: ["Torchy Light", "by Beacon Apps", "3 million downloads"],
          chunks: [
            { text: "Torchy Light", isWrong: false, teach: "The name matches the real Torchy Light exactly. That piece checks out, so leave it clean." },
            { text: "by Beacon App", isWrong: true, teach: "Look at the end of the maker's name. Beacon App is missing its s. That's a swap." },
            { text: "3 million downloads", isWrong: false, teach: "Three million downloads matches the real history. That piece checks out, so leave it clean." },
          ],
          readAloud: "Torchy Light, the flashlight app. Check its name, its maker and its downloads against the real one, all the way to the last letter.",
          rightWhy: "The name looked perfect, but the maker's name is missing a letter. Copycats hide in the small print too.",
        },
      ],
      hints: {
        tier1: "Compare each piece with the real app above it, letter by letter.",
        tier2: "Look for a swapped letter (a z for an s, a zero for an o), a missing letter, or a tiny download number. Mark only those pieces.",
        tier3: "Let me help. I fixed one piece for you. Now finish the check.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your second challenge, you run the Whisker Check!",
          "This game is all about spotting a copycat app, piece by piece.",
          "Out in the real world, copycats sit right next to the real app, wearing the same icon.",
          "Here is what you do. The real app is on top. The app to check is underneath, split into its name, its maker and its downloads. If a piece doesn't match the real one, tap it to mark it SWAPPED. Tap again to lift the mark. When you've checked every piece, tap CHECK DONE.",
          "[warmly] Some apps are the real thing, so only mark what's really swapped. Ready? First app!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Compare the app underneath with the real one on top, piece by piece."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every copycat caught, Cyber Hero! And every real app cleared.",
          "[warmly] Out in the real world, you check the name, the maker and the downloads, and a copycat's missing whisker never slips past you.",
        ],
      },
    },
    // 10 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one is the COPYCAT?",
      speedMs: 5000,
      choices: [
        { text: "Moon Jumpz · 20 downloads", isCorrect: true },
        { text: "Moon Jump · 4 million downloads", isCorrect: false, why: "That's the real Moon Jump: the right name and a huge history." },
        { text: "Moon Jump 2 · by the same maker", isCorrect: false, why: "A sequel from the same maker is a real app, not a copycat." },
      ],
      praise: "Caught at full speed. That z never stood a chance! ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Moon Jumpz with twenty downloads is the copycat.",
          "A swapped letter and no history give it away.",
          "[warmly] Name, maker, downloads. Count the whiskers every time.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Copycats copy the real icon but miss a whisker. Check the name, the maker and the downloads.",
      next: "which keys an app really needs",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Two powers, Cyber Hero. Your copycat eyes are sharp.",
          "Swapped letters, missing letters, tiny downloads. No costume gets past you.",
          "[whispers] But even a real app can get greedy. Once it's on your device, it starts asking for keys.",
          "Next, we'll learn which keys an app really needs. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · WHY DOES IT NEED THAT? ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Why Does It Need That?",
      content:
        "When an app installs, it ASKS for permissions: little keys to parts of your device. Here's the detective question: does it need that key FOR ITS JOB? A flashlight app needs the light, because that's its job. But your contacts? Your microphone? Your photos? A flashlight needs NONE of that. Job keys, yes. Greedy keys, no.",
      bullets: [
        "Permissions are keys to your device",
        "Ask: does its JOB need that key?",
        "A flashlight needs the light: fine",
        "A flashlight does NOT need your contacts",
        "Job keys yes, greedy keys no",
      ],
      bulletIcons: ["🔑", "🧠", "💡", "🚫", "✋"],
      emblem: "🔑",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Now, Cyber Hero, apps ask for permissions: little keys to your device.",
          "Here's the only question that matters.",
          // Lower case on purpose. ElevenLabs read the all-caps JOB as an
          // initialism, so Sarah said jay oh bee out loud (Abdullah, retest).
          // Confirmed by transcribing the shipped clip rather than guessing.
          // Every JOB the child SEES stays capitalised: only the spoken line
          // changed, so the emphasis on the page is untouched.
          "Does it need that key for its job?",
          "A flashlight app needs the light. Of course!",
          "[nervous] But your contacts? Your microphone? Your photos? A flashlight needs none of that.",
          "[excited] Come and flip the app boxes, and check every key they ask for!",
        ],
      },
    },
    // 13 - Game: FLIP "Flip the Box" (the week's signature, tap-only)
    {
      type: "flipTheBox",
      threat: {
        raccoonLine:
          "The front of my boxes always looks perfect! Nobody turns them over to see the keys I'm asking for. A flashlight with your contacts? Nobody checks!",
      },
      introTitle: "Flip the Box",
      introSubtitle: "An app box rolls in. Turn it to read every side: the front, the maker, the reviews and the keys it asks for. Then call it: safe app, or bin it.",
      introIcon: "🔑",
      installLabel: "SAFE APP",
      binLabel: "BIN IT",
      installToast: "SAFE APP!",
      binToast: "BINNED!",
      wrongTitle: "Turn the box again",
      completeTitle: "Every box checked!",
      completeLine: "Job keys kept, greedy keys binned.",
      boxes: [
        {
          id: "torchy",
          name: "Torchy Light",
          icon: "💡",
          tagline: "The brightest light app!",
          readAloud: "Here comes Torchy Light, the brightest light app. Turn the box and read every side.",
          maker: { text: "Made by Beacon Apps · 3 million downloads", readAloud: "The maker side: made by Beacon Apps, with three million downloads.", fishy: false },
          reviews: { text: "Bright and simple! ★ 4.7", readAloud: "The reviews side: bright and simple, four point seven stars.", fishy: false },
          asks: {
            job: "Its job: make light",
            items: [
              { label: "Use the light", icon: "💡", fishy: false },
              { label: "See your contacts", icon: "👪", fishy: true },
              { label: "Use your microphone", icon: "🔔", fishy: true },
            ],
            readAloud: "The keys side: use the light, see your contacts, and use your microphone.",
          },
          rightMove: "bin",
          why: "The maker and reviews looked fine, but a flashlight asking for your contacts and your microphone wants keys its job never needs. In the bin it goes.",
          whyWrong: "Look at the keys side again. A flashlight's job is light. Contacts and a microphone are greedy keys, so this box goes in the bin.",
          wrongFace: "asks",
        },
        {
          id: "doodle-pad",
          name: "Doodle Pad",
          icon: "🎨",
          tagline: "Draw, colour and save your art!",
          readAloud: "Here comes Doodle Pad: draw, colour and save your art. Turn the box and read every side.",
          maker: { text: "Made by Brightbox Studio · 8 million downloads", readAloud: "The maker side: made by Brightbox Studio, with eight million downloads.", fishy: false },
          reviews: { text: "My kids love the colours! ★ 4.8", readAloud: "The reviews side: my kids love the colours, four point eight stars.", fishy: false },
          asks: {
            job: "Its job: drawing and colouring",
            items: [
              { label: "Save your drawings", icon: "🎨", fishy: false },
              { label: "Use the touch screen", icon: "👆", fishy: false },
            ],
            readAloud: "The keys side: save your drawings, and use the touch screen.",
          },
          rightMove: "install",
          why: "A drawing app asking to save your drawings: every key fits its job, and the maker and reviews check out. That's a safe app.",
          whyWrong: "Check every side again. The maker is real, the reviews are happy, and saving drawings is a drawing app's job. This one is safe.",
          wrongFace: "asks",
        },
        {
          id: "puzzle-planet",
          name: "Puzzle Planet",
          icon: "🧩",
          tagline: "A thousand puzzles, free!",
          readAloud: "Here comes Puzzle Planet: a thousand puzzles, free. Turn the box and read every side.",
          maker: { text: "Made by Unknown Dev 4412 · new today", readAloud: "The maker side: made by Unknown Dev four four one two, and it only appeared today.", fishy: true },
          reviews: { text: "Only 3 reviews, all the same words", readAloud: "The reviews side: only three reviews, and they all use the same words.", fishy: true },
          asks: {
            job: "Its job: puzzles",
            items: [
              { label: "Play sounds", icon: "🔔", fishy: false },
              { label: "Know where you are", icon: "📍", fishy: true },
            ],
            readAloud: "The keys side: play sounds, and know where you are.",
          },
          rightMove: "bin",
          why: "An unknown maker from today, copied reviews, and a puzzle game that wants your location. Every side said bin it.",
          whyWrong: "Turn to the maker side again: an unknown maker that only appeared today. And puzzles never need your location. Bin it.",
          wrongFace: "maker",
        },
      ],
      hints: {
        tier1: "Read all four sides, then ask: does its job need every key it asks for?",
        tier2: "A greedy key, an unknown brand-new maker or copied reviews means BIN IT. A real maker, happy reviews and job keys only means SAFE APP.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, you work the Flip the Box belt!",
          "This game is all about checking every side of an app, especially the keys it asks for.",
          "Out in the real world, the front of an app always looks perfect. The truth is on the other sides.",
          "Here is what you do. An app box rolls in. Tap the arrows to turn it, and read every side: the front, the maker, the reviews and the keys it asks for. When you've seen all four, tap SAFE APP or BIN IT.",
          "[warmly] Check every key against the app's job. Ready? First box!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["The belt is rolling, with the first box front side up."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every box checked, Cyber Hero! Job keys kept, greedy apps binned.",
          "[warmly] Out in the real world, you ask why does it need that, and no greedy app gets a key it doesn't need.",
        ],
      },
    },
    // 14 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "a cute pet game NEEDS your microphone and your contacts, or it simply won't work!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Feeding a pretend pet needs taps and sounds. Your contacts and your microphone are greedy keys." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Apps only need what their JOB needs. ✓",
      nudge: "Does feeding a pretend kitten use your contacts?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Busted. A pet game doesn't need your contacts or your microphone.",
          "An app only needs the keys its job uses.",
          "[warmly] Job keys yes, greedy keys no.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Permissions are keys. An app gets the keys its job needs, and not one more.",
      next: "what FREE really costs",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Not one greedy key got through.",
          "Light for the flashlight, saving for the drawing app, and nothing extra.",
          "[whispers] Now for the trickiest word in the whole warehouse. FREE.",
          "Next, we'll learn what FREE really costs. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · FREE ISN'T FREE ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "What FREE Really Costs",
      content:
        "FREE is the shop's favourite word. But apps cost money to make, so a FREE app gets paid ANOTHER way. Some show you ads every minute: you pay with your TIME. Some have a coin shop inside: free to start, not free to play. Some ask for your name, age and school: you pay with your INFO. And some, like library and school apps, really ARE free. Play for a minute and you'll see which one you've got.",
      bullets: [
        "Apps always cost money to make",
        "Ads every minute: you pay with TIME",
        "A coin shop inside: free to start, not to play",
        "Questions about you: you pay with INFO",
        "Some free IS free, like library apps",
      ],
      bulletIcons: ["💡", "⏱️", "💎", "🆔", "✅"],
      emblem: "🏷️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] FREE! The shop's favourite sparkly word.",
          "[whispers] But apps cost money to make. Always.",
          "So a FREE app gets paid another way.",
          "With your time, watching ads. With coins, in a shop inside. Or with your info, collected and sold.",
          "[warmly] And some apps, like the library's, really are free.",
          "[excited] Come and see what FREE really costs, on a Test Drive!",
        ],
      },
    },
    // 17 - Game: TEST-DRIVE "The Test Drive" (testDrive, new engine)
    {
      type: "testDrive",
      threat: {
        raccoonLine:
          "FREE, FREE, FREE! Nobody plays long enough to see my ads, my coin walls and my little questions. They see FREE and they tap GET!",
      },
      introTitle: "The Test Drive",
      introSubtitle: "Four FREE apps. Play each one a minute at a time, watch what the meters fill, then flip the FREE tag to show the real price.",
      introIcon: "🏷️",
      freeTag: "FREE",
      playLabel: "PLAY ONE MINUTE",
      flipLabel: "FLIP THE TAG",
      meterLabels: { time: "Time", coins: "Coins", info: "Info" },
      priceLabels: { time: "Your time", coins: "Your coins", info: "Your info", free: "Truly free" },
      rightToast: "REAL PRICE FOUND!",
      wrongTitle: "Check the meters again",
      completeTitle: "Every FREE tag flipped!",
      completeLine: "Time, coins, info, or truly free. You see the real price now.",
      rounds: [
        {
          id: "bubble-pop",
          appName: "Bubble Pop Party",
          appIcon: "🎉",
          readAloud: "Bubble Pop Party, and it's FREE! Play it one minute at a time, and watch the meters.",
          minutes: [
            { id: "m1", text: "Level 1: pop, pop, pop! So much fun.", icon: "🎮", cost: "none", readAloud: "Minute one: pop, pop, pop! So much fun." },
            { id: "m2", text: "A 30-second ad!", icon: "🔔", cost: "time", readAloud: "Minute two: an ad. Thirty seconds of waiting." },
            { id: "m3", text: "Another 30-second ad!", icon: "🔔", cost: "time", readAloud: "Minute three: another ad. Thirty more seconds." },
            { id: "m4", text: "Watch one more ad for an extra life?", icon: "⏱️", cost: "time", readAloud: "Minute four: watch one more ad for an extra life?" },
          ],
          answer: "time",
          why: "Even the extra life cost another ad. Ad after ad filled the time meter, so this FREE app gets paid with your time.",
          whyWrong: "Look at the meters. Every ad, even the extra-life one, filled up the time meter. This app gets paid with your time.",
        },
        {
          id: "rocket-dash",
          appName: "Rocket Dash",
          appIcon: "🚀",
          readAloud: "Rocket Dash, and it's FREE too! Play it one minute at a time, and watch the meters.",
          minutes: [
            { id: "m1", text: "Level 1: zoom through the stars!", icon: "🚀", cost: "none", readAloud: "Minute one: zoom through the stars!" },
            { id: "m2", text: "Level 2 is locked: 500 coins", icon: "🔒", cost: "coins", readAloud: "Minute two: level two is locked. It costs five hundred coins." },
            { id: "m3", text: "Buy 500 coins with real money?", icon: "💎", cost: "coins", readAloud: "Minute three: buy five hundred coins with real money?" },
            { id: "m4", text: "Special offer: a bigger coin pack!", icon: "💎", cost: "coins", readAloud: "Minute four: a special offer, a bigger coin pack!" },
          ],
          answer: "coins",
          why: "Locked levels and coin offers filled the coin meter. Free to start, but not free to play.",
          whyWrong: "Check the meters. Locked levels and coin offers filled up the coin meter, so this app gets paid with coins.",
        },
        {
          id: "quiz-buddy",
          appName: "Quiz Buddy",
          appIcon: "🧠",
          readAloud: "Quiz Buddy, FREE as well. Play it one minute at a time, and watch the meters.",
          minutes: [
            { id: "m1", text: "Before you play: what's your full name?", icon: "🆔", cost: "info", readAloud: "Minute one: before you play, what's your full name?" },
            { id: "m2", text: "How old are you?", icon: "🆔", cost: "info", readAloud: "Minute two: how old are you?" },
            { id: "m3", text: "Which school do you go to?", icon: "🏫", cost: "info", readAloud: "Minute three: which school do you go to?" },
            { id: "m4", text: "Quiz time! Question one.", icon: "❓", cost: "none", readAloud: "Minute four: quiz time, question one." },
          ],
          answer: "info",
          why: "Before the quiz even started, your name, your age and your school filled the info meter. Your info was the price.",
          whyWrong: "Look at what the quiz asked for first: your name, your age and your school. That filled the info meter, so you'd pay with your info.",
        },
        {
          id: "story-library",
          appName: "Story Library",
          appIcon: "🎓",
          readAloud: "Story Library, and it says FREE. Play it one minute at a time, and watch the meters.",
          minutes: [
            { id: "m1", text: "A new story to read!", icon: "⭐", cost: "none", readAloud: "Minute one: a new story to read!" },
            { id: "m2", text: "No ads. The next chapter!", icon: "✅", cost: "none", readAloud: "Minute two: no ads, just the next chapter." },
            { id: "m3", text: "Borrow a book. No coins needed.", icon: "📋", cost: "none", readAloud: "Minute three: borrow a book, no coins needed." },
            { id: "m4", text: "The end! Pick your next story.", icon: "🌟", cost: "none", readAloud: "Minute four: the end, pick your next story." },
          ],
          answer: "free",
          why: "No ads, no coins and no questions about you. Every meter stayed empty, because the library already paid. This one is truly free.",
          whyWrong: "Look at the meters. Story after story, every one stayed empty: no ads, no coins, no info. This one really is free.",
        },
      ],
      hints: {
        tier1: "Look at which meter filled up while you played.",
        tier2: "Ads fill TIME. Locked levels and coin offers fill COINS. Questions about you fill INFO. Nothing filled up? Truly free.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, you take FREE apps for a Test Drive!",
          "This game is all about finding out what FREE really costs.",
          "Out in the real world, the price hides inside the app, so you only see it by playing.",
          "Here is what you do. Tap PLAY ONE MINUTE, and watch what happens on the screen. The meters show what each minute cost. When every minute is played, tap FLIP THE TAG, and pick the real price.",
          "[warmly] Watch the meters the whole time. Ready? First app!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Here is the first FREE app, ready for a test drive."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every FREE tag flipped, Cyber Hero! Time, coins, info, and one that was truly free.",
          "[warmly] Out in the real world, you know apps get paid somehow, and a FREE tag can't hide its real price from you.",
        ],
      },
    },
    // 18 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "An app with ads every minute costs you your ___.",
      choices: [
        { text: "time", isCorrect: true },
        { text: "nothing", isCorrect: false, why: "Ads every minute are never nothing. Each one takes a piece of your time." },
        { text: "coins", isCorrect: false, why: "Ads don't take coins. They take minutes of your time." },
        { text: "photos", isCorrect: false, why: "Ads don't take your photos. They take your time and your attention." },
      ],
      praise: "Your TIME. You read the real price! ✓",
      nudge: "What filled up on the meter while the ads played?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "An app with ads every minute costs you your time.",
          "The ads are how it gets paid.",
          "[warmly] Flip the FREE tag, and the real price shows.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "FREE apps get paid another way: your time, your coins or your info. Some really are free.",
      next: "the rule that catches everything else",
      emblem: "🏷️",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Four powers, Cyber Hero. No FREE tag fools you now.",
          "Ads, coin shops and nosy questions, all caught on the meters.",
          "[whispers] One power is left, and it catches anything the others might miss.",
          "Next, we'll learn the rule that catches everything else. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · INSTALL TOGETHER ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Install Together",
      content:
        "Here's the rule that catches everything the other powers miss: every new app gets installed TOGETHER with a grown-up. Four eyes catch what two miss: a copycat whisker, a greedy key, a coin shop hiding inside. It isn't babyish. It's what smart teams do. And when you both check and it's fine? Then installing is fine.",
      bullets: [
        "Every new app: installed TOGETHER",
        "Four eyes catch what two miss",
        "Checking together is smart, not babyish",
        "Real updates come from the real store",
        "Both checked and it's fine? Install!",
      ],
      bulletIcons: ["👪", "👀", "🧠", "✅", "👍"],
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, Cyber Hero, and it catches everything else.",
          "Every new app gets installed together with a grown-up.",
          "Four eyes catch what two miss. A whisker, a greedy key, a coin shop.",
          "[whispers] It isn't babyish. It's what smart teams do.",
          "And when you both check and it's fine, installing is fine.",
          "[excited] Come and play Four Eyes, and call in your grown-up!",
        ],
      },
    },
    // 21 - Game: CALL AND DECIDE TOGETHER "Four Eyes" (fourEyes, new engine)
    {
      type: "fourEyes",
      threat: {
        raccoonLine:
          "One pair of eyes sees the shiny side. That's all I need! The moment a grown-up looks too, my tricks get spotted. So shhh, don't call them!",
      },
      introTitle: "Four Eyes",
      introSubtitle: "You see the shiny side of an app. Call your grown-up to see what you might miss, then decide together.",
      introIcon: "👀",
      yourEyesLabel: "Your eyes",
      grownUpEyesLabel: "Your grown-up's eyes",
      callLabel: "CALL MY GROWN-UP",
      installLabel: "INSTALL TOGETHER",
      skipLabel: "SKIP IT TOGETHER",
      installToast: "INSTALLED TOGETHER!",
      skipToast: "SKIPPED TOGETHER!",
      wrongTitle: "Look at what they spotted",
      completeTitle: "Four eyes, every time!",
      completeLine: "Checked together, decided together.",
      rounds: [
        {
          id: "doodle-star",
          appName: "Doodle Star",
          appIcon: "🎨",
          kidView: { tagline: "Draw anything!", stars: "★★★★★", perks: ["100 colours", "Magic brushes"] },
          readAloud: "Doodle Star: draw anything, with a hundred colours and magic brushes. Before you tap GET, call your grown-up.",
          spots: [
            { id: "maker", label: "Made by: Unknown Dev 4412, new today", icon: "👤", fishy: true, readAloud: "Your grown-up spots the maker: Unknown Dev four four one two, and it only appeared today." },
            { id: "contacts", label: "Wants: your contacts", icon: "👪", fishy: true, readAloud: "They spot a key it wants: your contacts. A drawing app doesn't need those." },
          ],
          rightMove: "skip",
          why: "Your grown-up spotted an unknown new maker and a greedy key you couldn't see. Four eyes caught it, so you skipped it together.",
          whyWrong: "Look at what your grown-up spotted: an unknown new maker and a greedy key. That's one to skip, together.",
        },
        {
          id: "story-time",
          appName: "Story Time",
          appIcon: "🎓",
          kidView: { tagline: "A new story every day", stars: "★★★★★", perks: ["Read along", "No ads"] },
          readAloud: "Story Time: a new story every day, read along, and no ads. Call your grown-up to check it with you.",
          spots: [
            { id: "maker", label: "Made by: your town library", icon: "🏫", fishy: false, readAloud: "Your grown-up checks the maker: it's your own town library." },
            { id: "keys", label: "Wants: nothing extra", icon: "🔑", fishy: false, readAloud: "They check the keys: it doesn't ask for anything extra." },
          ],
          rightMove: "install",
          why: "You both checked, and everything was fine: your real library, and no extra keys. So you installed it together.",
          whyWrong: "Look again at what your grown-up found: your real library, and no extra keys. Checked together and fine means install together.",
        },
        {
          id: "star-racer",
          appName: "Star Racer",
          appIcon: "🚀",
          kidView: { tagline: "Race to the stars!", stars: "★★★★☆", perks: ["Free to play", "10 rockets"] },
          readAloud: "Star Racer: race to the stars, free to play, with ten rockets. Call your grown-up before you tap GET.",
          spots: [
            { id: "shop", label: "Coin shop inside: real-money packs", icon: "💎", fishy: true, readAloud: "Your grown-up spots a coin shop inside, with packs that cost real money." },
          ],
          rightMove: "skip",
          why: "A coin shop with real-money packs was hiding inside. Your grown-up spotted it, so you skipped it together.",
          whyWrong: "That coin shop, with its real-money packs, means this one gets skipped, together.",
        },
        {
          id: "puzzle-town",
          appName: "Puzzle Town",
          appIcon: "🧩",
          kidView: { tagline: "Hundreds of puzzles", stars: "★★★★★", perks: ["Easy to hard", "Play offline"] },
          readAloud: "Puzzle Town: hundreds of puzzles, easy to hard, and you can play offline. Call your grown-up to check it with you.",
          spots: [
            { id: "maker", label: "Made by: Brightbox Studio, 8 million downloads", icon: "👤", fishy: false, readAloud: "Your grown-up checks the maker: Brightbox Studio, with eight million downloads." },
            { id: "keys", label: "Wants: to play sounds", icon: "🔔", fishy: false, readAloud: "They check the keys: it only wants to play sounds." },
            { id: "store", label: "Found in: the official app store", icon: "📱", fishy: false, readAloud: "And they check the shop: it's in the official app store." },
          ],
          rightMove: "install",
          why: "A real maker, a key that fits the job, and the real shop. You both checked, so installing it together is fine.",
          whyWrong: "Check what your grown-up found: a real maker, a fair key and the real shop. That's a safe one to install together.",
        },
      ],
      hints: {
        tier1: "Read everything your grown-up spotted before you choose.",
        tier2: "An unknown maker, a greedy key or a coin shop means SKIP IT TOGETHER. A real maker, fair keys and the official store mean INSTALL TOGETHER.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, you play Four Eyes!",
          "This game is all about checking a new app together with a grown-up.",
          "Out in the real world, a shiny app page shows you the good bits and hides the rest.",
          "Here is what you do. An app page appears on your side. Tap CALL MY GROWN-UP, and their side opens. Tap everything they spot, and I'll read it. Then decide together: install it, or skip it.",
          "[warmly] Four eyes catch what two miss. Ready? First app!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here is an app you might want. Look at your side first."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four eyes every time, Cyber Hero! You caught what one pair of eyes would miss, and you installed the good ones together.",
          "[warmly] Out in the real world, every new app is a team job, and checking together keeps your device safe.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A new app looks great. Tap the hero steps IN ORDER:",
      choices: [
        { text: "Find it in the official app store", isCorrect: true },
        { text: "Check it together with a grown-up", isCorrect: true },
        { text: "Install it together", isCorrect: true },
      ],
      praise: "Real shop, check together, install together! ✓",
      nudge: "Where does a new app always come from first?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Find it in the official app store. Check it together. Install it together.",
          "The real shop comes first, because nothing else gets checked.",
          "[warmly] Then four eyes, every time.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Every new app gets installed together with a grown-up. Four eyes catch what two miss.",
      next: "one quick review to make it all stick",
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE app powers, Cyber Hero!",
          "Real shop only, whiskers counted, keys checked, FREE tags flipped, and every install together.",
          "[whispers] The Raccoon's copycat warehouse doesn't stand a chance.",
          "One quick review to make it all stick, then he opens his quiz stall. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "The Warehouse" (passwordVault re-theme, warehouse skin, W4 engine)
    {
      type: "passwordVault",
      skin: "warehouse",
      threat: {
        raccoonLine:
          "My warehouse is stacked with crates, and every one hides a trick! Open one wrong and the whole shipment is MINE!",
      },
      introTitle: "The Warehouse",
      introSubtitle: "Five crates, one app question in each. Answer a crate's question to check it, and roll up the big door.",
      introIcon: "🎁",
      masterTitle: "WAREHOUSE CLEARED!",
      claimLabel: "Roll up the big door",
      hotspotNoun: "crate",
      guidance: {
        intro: "Tap a crate to check it.",
        complete: "WAREHOUSE CLEARED! Every crate checked.",
      },
      locks: [
        {
          id: "shop",
          ruleLabel: "THE REAL SHOP",
          icon: "📱",
          prompt: "A game website shows a big DOWNLOAD NOW button for Pixel Pets. Where should you get Pixel Pets?",
          readAloud: "A game website shows a big download now button for Pixel Pets. Where should you get Pixel Pets?",
          choices: [
            { text: "The official app store on your device", isCorrect: true, explanation: "The official app store.", why: "Only the official app store checks apps before the shelf. A website button skips that check." },
            { text: "The website's big button, it's faster", isCorrect: false, explanation: "Faster isn't safer. Nobody checked the app behind that button." },
            { text: "Any button that says Pixel Pets", isCorrect: false, explanation: "A button can say anything. Only the official app store checks what's behind it." },
          ],
          recap: "One real shop",
        },
        {
          id: "whiskers",
          ruleLabel: "THE WHISKERS",
          icon: "🎭",
          prompt: "Two apps called Moon Jump. One is by Starlight Games, with 4 million downloads. The other is by Star1ight Games, with 9 downloads. Which is the copycat?",
          readAloud: "Two apps called Moon Jump. Look closely at who made each one, and how many downloads they have. Which one is the copycat?",
          choices: [
            { text: "The one by Star1ight Games, with 9 downloads", isCorrect: true, explanation: "That's the copycat.", why: "A number one where the l should be, and only nine downloads. Almost right is all wrong, so that's the copycat." },
            { text: "The one with 4 million downloads", isCorrect: false, explanation: "Four million downloads and a maker spelled right is a real history. Look at the other maker's name." },
            { text: "Neither, the app names match", isCorrect: false, explanation: "The app names match, but check every piece. One maker has a number one where the l should be." },
          ],
          recap: "Count the whiskers",
        },
        {
          id: "keys",
          ruleLabel: "THE KEYS",
          icon: "🔑",
          prompt: "A music player app asks to play sounds and to see your photos. Which key does its job need?",
          readAloud: "A music player app asks to play sounds, and to see your photos. Which key does its job need?",
          choices: [
            { text: "Playing sounds, that's a music player's job", isCorrect: true, explanation: "Playing sounds.", why: "Playing sounds is exactly a music player's job. Your photos aren't, so that key stays locked." },
            { text: "Seeing your photos, for album covers", isCorrect: false, explanation: "Songs play without anyone looking at your photos. That's a greedy key." },
            { text: "Both, apps need every key they ask for", isCorrect: false, explanation: "Apps only need the keys their job uses. Your photos aren't part of playing music." },
          ],
          recap: "Job keys only",
        },
        {
          id: "price",
          ruleLabel: "THE REAL PRICE",
          icon: "🏷️",
          prompt: "Your friend says a game is FREE, so it can't cost anything. But it has a coin shop inside. What's true?",
          readAloud: "Your friend says a game is FREE, so it can't cost anything. But it has a coin shop inside. What's true?",
          choices: [
            { text: "Free to start isn't free to play: the coin shop costs real money", isCorrect: true, explanation: "Free to start, not free to play.", why: "That shop inside means the game gets paid with coins, and coins cost real money. Free to start isn't free to play." },
            { text: "Your friend is right, FREE means free", isCorrect: false, explanation: "Apps always get paid somehow, and the shop inside is how this one gets paid." },
            { text: "Game coins aren't real money", isCorrect: false, explanation: "Remember the Loot Shop? Game coins are bought with real money, every time." },
          ],
          recap: "Flip the FREE tag",
        },
        {
          id: "together",
          ruleLabel: "TOGETHER",
          icon: "👪",
          prompt: "You found a brilliant new app and the GET button is glowing. What's the hero move?",
          readAloud: "You found a brilliant new app, and the get button is glowing. What's the hero move?",
          choices: [
            { text: "Show a grown-up and check it together first", isCorrect: true, explanation: "Check it together.", why: "Four eyes catch what two miss. Check it together, and if it's fine, install it together." },
            { text: "Tap GET fast, before it's gone", isCorrect: false, explanation: "That glowing button isn't going anywhere. A quick check together keeps copycats and greedy keys out." },
            { text: "Install it now, and tell a grown-up later", isCorrect: false, explanation: "Later is too late for a greedy key. Check together before you install." },
          ],
          recap: "Four eyes",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review: the Warehouse!",
          "This game is all about using every app power, one crate at a time.",
          "Out in the real world, app tricks turn up in any order, so every power has to be ready.",
          "Here is what you do. Tap a crate to open it. I'll read its question, and you tap the hero answer. A checked crate slides onto the real shop shelf. Check all five, and the big door rolls up.",
          "[warmly] Five crates, five powers. Ready? Pick a crate!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap any crate to open it and hear its question."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Warehouse cleared, Cyber Hero! Every crate checked.",
          "[warmly] Out in the real world, the real shop, the whiskers, the keys, the real price and four eyes keep every copycat off your device.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the copycat shop shuts down
    { type: "video", videoPlaceholder: "Week 9: The Copycat Caught", videoSrc: "/videos/module-09-outro.mp4" },

    // 27 - Mission Debrief (ids kept from the legacy week so saved progress still lines up)
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "store", label: "One Real Shop", accent: "#7df0ff", icon: "📱", summary: "Apps come from the official app store only, checked before the shelf." },
        { id: "copycat", label: "Copycat Eyes", accent: "#c084fc", icon: "🎭", summary: "Name, maker, downloads. You count the whiskers on every app." },
        { id: "keys", label: "Key Checker", accent: "#ffd158", icon: "🔑", summary: "Job keys yes, greedy keys no. Why does it need that?" },
        { id: "free", label: "Price Finder", accent: "#ff5fb3", icon: "🏷️", summary: "FREE apps get paid with time, coins or info, unless they're truly free." },
        { id: "handshake", label: "Four Eyes", accent: "#7eff97", icon: "👪", summary: "Every new app gets checked and installed together." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "One real shop, whiskers counted, keys checked,",
          "FREE tags flipped, and every install done together.",
          "[warmly] His copycat warehouse just lost its last customer.",
          "[excited] Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock (ids kept from the legacy week)
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "real-shop-shopper", name: "Real-Shop Shopper", icon: "📱", description: "Only gets apps from the official store." },
        { id: "whisker-counter", name: "Whisker Counter", icon: "🎭", description: "Spots every copycat's missing whisker." },
        { id: "key-keeper", name: "Key Keeper", icon: "🔑", description: "Asks why does it need that?" },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     5 apply-the-skill questions, one per taught concept, 4 right to pass
     (owner decision, UAT batch 2). Every scenario is new (none repeats a game
     item) and every villain line is distinct. Recorded via the narration
     generator (week9.ts is in LEARN_LOOP_WEEKS). */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#2b7fff",
    theme: {
      topic: "Apps & Downloads",
      motifs: ["📱", "⚙️", "🔍", "✅", "🚫", "🛡️", "⭐", "🔒"],
    },
    intro: {
      slug: "quiz-w9-intro",
      text: "Welcome to my app bazaar, hero! Five questions, hand-stuffed with my finest fakes. Spot them all? HA! Nobody reads the small print!",
    },
    victory: {
      slug: "quiz-w9-victory",
      text: "You checked EVERYTHING?! The names, the keys, the prices?! That's it, I'm closing the warehouse and opening a soup stand!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w9-c1",
        key: "quiz-w9-c1-1",
        label: "The One Real Shop",
        ask: {
          slug: "quiz-w9-ask-c1-1",
          text: "Adam's cousin messages: 'Skip the app store, download my favourite game straight from this chat link!' What's the safe move?",
        },
        options: [
          { text: "Say no thanks, new apps come from the official app store only" },
          { text: "Download it, links from family are family-checked" },
          { text: "Download it, then run a free virus scan right after" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "One real shop, no exceptions!",
          explanation: "The official app store checks apps before they reach the shelf. A chat link skips that check, whoever sent it, and a scan afterwards can be too late. Not in the real shop, not coming home.",
        },
        villainRight: {
          slug: "quiz-w9-right-c1-1",
          text: "Even from a COUSIN?! I borrowed that cousin's account specially!",
        },
        villainWrong: {
          slug: "quiz-w9-wrong-c1-1",
          text: "Straight from the chat, fresh and unchecked! Just how I package them!",
        },
      },
      {
        phaseId: "phase-w9-c2",
        key: "quiz-w9-c2-1",
        label: "Count the Whiskers",
        ask: {
          slug: "quiz-w9-ask-c2-1",
          text: "Layla wants Maze Mates. One result is by Tiny Tower Games with 2 million downloads. The other is by Tiny Tower Gamez with 40 downloads. Which is the copycat?",
        },
        options: [
          { text: "The one by Tiny Tower Gamez, with 40 downloads" },
          { text: "The one with 2 million downloads" },
          { text: "Neither, both are called Maze Mates" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Count every whisker!",
          explanation: "The app names match, but one maker's name ends in a z, and it only has 40 downloads. A copycat always misses a whisker somewhere, so check every piece, not just the name.",
        },
        villainRight: {
          slug: "quiz-w9-right-c2-1",
          text: "You checked the Tiny Tower MAKER too?! I only changed one teeny letter!",
        },
        villainWrong: {
          slug: "quiz-w9-wrong-c2-1",
          text: "Tiny Tower Gamez, at your service! Mind the ads on your way in!",
        },
      },
      {
        phaseId: "phase-w9-c3",
        key: "quiz-w9-c3-1",
        label: "Why Does It Need That?",
        ask: {
          slug: "quiz-w9-ask-c3-1",
          text: "Adam's new calculator app asks for his microphone and his contacts. What's the hero move?",
        },
        options: [
          { text: "Block them, a calculator's job is doing sums" },
          { text: "Allow them, it asked politely" },
          { text: "Allow the contacts, so he can share his answers" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Job keys only!",
          explanation: "A calculator's job is doing sums. A microphone and contacts have nothing to do with that job, so those greedy keys get blocked.",
        },
        villainRight: {
          slug: "quiz-w9-right-c3-1",
          text: "Blocked?! But I wanted to hear what numbers SOUND like!",
        },
        villainWrong: {
          slug: "quiz-w9-wrong-c3-1",
          text: "Contacts for a calculator? Very sensible! Now I can count all your friends!",
        },
      },
      {
        phaseId: "phase-w9-c4",
        key: "quiz-w9-c4-1",
        label: "What FREE Really Costs",
        ask: {
          slug: "quiz-w9-ask-c4-1",
          text: "Layla's FREE colouring app stops after two pictures: 'Unlock more pictures for 300 coins!' What is the real price?",
        },
        options: [
          { text: "Coins, it's free to start but not free to play" },
          { text: "Nothing, pictures are always free" },
          { text: "Her time, because colouring takes a while" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Free to start, not free to play!",
          explanation: "Locked pictures that need coins mean this app gets paid through a coin shop, and coins cost real money. Colouring time is just fun, not a price.",
        },
        villainRight: {
          slug: "quiz-w9-right-c4-1",
          text: "You found the coin wall?! I hid it behind picture number three!",
        },
        villainWrong: {
          slug: "quiz-w9-wrong-c4-1",
          text: "Just three hundred coins a picture! Colour me RICH!",
        },
      },
      {
        phaseId: "phase-w9-c5",
        key: "quiz-w9-c5-1",
        label: "Install Together",
        ask: {
          slug: "quiz-w9-ask-c5-1",
          text: "A pop-up in Adam's game says: 'Update needed! Tap here to update now!' It isn't from the app store. What's the hero move?",
        },
        options: [
          { text: "Close it, and check for updates in the real app store with a grown-up" },
          { text: "Tap it quickly, updates keep games safe" },
          { text: "Tap it, but only because it's his favourite game" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Real updates, real store, together!",
          explanation: "Real updates come from the official app store, never from shouty pop-ups. Close it, then check for updates in the real store together with a grown-up.",
        },
        villainRight: {
          slug: "quiz-w9-right-c5-1",
          text: "You closed my update?! It was a very up-to-date trap!",
        },
        villainWrong: {
          slug: "quiz-w9-wrong-c5-1",
          text: "Tap, tap, update! My pop-up thanks you for your service!",
        },
      },
    ],
  },
  badgeArt: "/cyberheroes/badges/week-09-copycat-catcher.png",

  // Week-lane attack theatre: fake-app tricks only (message scams = W4;
  // coin traps = W7; link/QR anatomy = W16).
  bossAttacks: [
    { name: "COPYCAT APP",     icon: "🎭", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Count the whiskers",       emblemColor: 0xc084fc },
    { name: "PERMISSION GRAB", icon: "✋", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Why does it need that?",   emblemColor: 0xffd158 },
    { name: "FAKE FREE",       icon: "🏷️", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Flip the tag",             emblemColor: 0xff5fb3 },
  ],

  // Legacy question pool, required by the WeekContent type; the quiz boss above
  // is what renders.
  bossQuestions: {
    easy: [
      { question: "Where do new apps come from?", answers: ["The official app store only", "Any website with a download button", "Pop-ups", "Video comments"], correctIndex: 0, explanation: "The official store checks apps before the shelf. Nowhere else does." },
      { question: "'Blast Birdz', 12 downloads, new yesterday. What is it?", answers: ["A copycat in a costume", "The real game", "A special edition", "A free upgrade"], correctIndex: 0, explanation: "A swapped letter and no history. The whiskers don't add up." },
      { question: "Before installing a new app, you...", answers: ["Check it and install it together with a grown-up", "Tap install fast", "Ask a friend", "Install it secretly"], correctIndex: 0, explanation: "Four eyes catch what two miss." },
    ],
    medium: [
      { question: "A flashlight app wants your contacts and location. What do you do?", answers: ["Block them, its job only needs the light", "Allow everything, it asked nicely", "Allow just the contacts", "Allow them, big apps always need extras"], correctIndex: 0, explanation: "Job keys yes, greedy keys no. A light never needs your friends." },
      { question: "A FREE game shows ads every minute. What's the real price?", answers: ["Your time and attention", "Nothing, it's free", "A tiny fee later on", "Your high score"], correctIndex: 0, explanation: "FREE apps get paid another way, and ads sell your time." },
      { question: "A pop-up says 'UPDATE your game HERE now!'. Real or fake?", answers: ["Fake, real updates live inside the real store", "Real, updates are always urgent", "Real if it's colourful", "Real, games do need updates"], correctIndex: 0, explanation: "Updates come from the app store itself, never from shouty pop-ups." },
    ],
    hard: [
      { question: "Why do copycat apps use the SAME icon as the real one?", answers: ["So you'll trust the costume and skip the whisker check", "Icons are expensive", "They're made by the same company", "Because the store gave them permission"], correctIndex: 0, explanation: "The icon IS the disguise, so you check the name, the maker and the downloads." },
      { question: "The real app is free. Why is 'Pixel Pets FREE' still suspicious?", answers: ["FREE bolted onto a real name is copycat bait, and it was brand new", "Free things are always bad", "Because the real one costs money", "It isn't suspicious"], correctIndex: 0, explanation: "Copycats add FREE to real names to look tempting. The missing history gives them away." },
      { question: "Why does checking together catch what your other powers miss?", answers: ["Four eyes spot whiskers, greedy keys and coin shops that two might not", "Grown-ups can spot every fake instantly", "It skips the checks", "It doesn't"], correctIndex: 0, explanation: "Every check is stronger with a second checker. That's the whole trick." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29), in lock-step with `screens` above.
  // The 5 recap checkpoints are 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 9: the copycat shop!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Same icon, one letter off." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "One real shop. Only one." }, layla: null }, // learn: shop
    5: { adam: { mood: "excited", message: "Read every label on the dock!" }, layla: null }, // game: Delivery Dock
    6: { adam: null, layla: { mood: "thumbsup", message: "Where's the safe shop?" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Copycats miss a whisker. Always." } }, // learn: copycat
    9: { adam: { mood: "curious", message: "Piece by piece, Cyber Hero." }, layla: null }, // game: Whisker Check
    10: { adam: null, layla: { mood: "excited", message: "Quick! Spot the copycat!" } }, // prove: speed
    11: { adam: { mood: "thumbsup", message: "Copycat eyes: unlocked!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Why does it need that key?" }, layla: null }, // learn: keys
    13: { adam: { mood: "excited", message: "Turn the box. Read every side!" }, layla: null }, // game: Flip the Box
    14: { adam: null, layla: { mood: "worried", message: "He's fibbing. Catch him!" } }, // prove: lie
    15: { adam: null, layla: { mood: "thumbsup", message: "Greedy keys: blocked." } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "FREE always gets paid somehow." } }, // learn: free
    17: { adam: { mood: "curious", message: "Watch the meters fill up." }, layla: null }, // game: Test Drive
    18: { adam: null, layla: { mood: "thumbsup", message: "Finish the price rule!" } }, // prove: finish
    19: { adam: { mood: "excited", message: "Price finder: certified!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Four eyes beat two. Every time." }, layla: null }, // learn: together
    21: { adam: { mood: "curious", message: "Call your grown-up first." }, layla: null }, // game: Four Eyes
    22: { adam: null, layla: { mood: "thumbsup", message: "Put the hero steps in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers. Review time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Check every crate!" } }, // review: The Warehouse
    25: { adam: { mood: "worried", message: "His copycat stall is OPEN. Shut it!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the copycat get caught!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Copycat Catcher badge earned!" }, layla: null }, // completion
  },
};

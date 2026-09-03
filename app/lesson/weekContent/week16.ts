import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 16 - QR Codes & Links: Don't Take the Bait
 *
 * Built to the locked Cyber Heroes template:
 *
 *   Opening video  -> alert -> mission brief
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 DOORWAY  a link is a door you can't see through | reveal        | finish
 *     2 PEEK     read the address under the plaque      | plaquePeek    | speed
 *     3 PEEL     fake QR stickers on real posters       | hookSort      | lie
 *     4 GLASS    clear links vs frosted short-links     | replyCards    | recall
 *     5 BARRIER  unsure = stop and ask                  | chooseYourPath| order
 *   Consolidation (cyberScanner, Corridor Check skin) -> boss
 *   (placeholder quiz boss - the bespoke W16 fight is designed with the
 *   boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Game freshness: RevealBoard returns after a 2-week rest as the Door
 * Swing (its four cards ARE doors this week); beat 2 debuts the small
 * NEW plaquePeek engine (clueBoard ran only last week - same call as
 * W13's signBingo) with a lift-then-judge rhythm no other drill has;
 * hookSort's fourth outing 2 weeks after W14 re-dressed as the Sticker
 * Peel; replyCards returns 5 weeks after W11 back in its W5 DOORS skin
 * (clear-glass vs frosted link-doors); chooseYourPath carries the
 * barrier rule. Lane-clean: doors/addresses/QR stickers/short links -
 * fake SENDERS stay W4's lane, app stores W9's, pop-up X-hunting W7's.
 * In-week flavour: the Doorway Trick.
 */
export const WEEK_16: WeekContent = {
  weekNumber: 16,
  title: "QR Codes & Links: Don't Take the Bait",
  topic: "qr-links",
  badgeName: "Door Checker",
  badgeIcon: "🚪",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 16: DON'T TAKE THE BAIT", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the doorway trick
    { type: "video", videoPlaceholder: "Week 16: The Doorway Trick", videoSrc: "/videos/module-16-intro.mp4" },

    // WEEK INTRO: ATLAS (Mission Command) briefing, plays after the video
    { type: "weekIntro", ...WEEK_INTROS[16] },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-16.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's Doorway Trick is everywhere. Links and QR codes are doors. He paints their signs with parties and prizes - but the doors open onto his slide. He's even pasting his own sticker-codes OVER real ones on posters and menus. This week you become a Door Checker. Peek at every address. Peel test the stickers. Pick the see-through doors. And when you can't tell? Wheel out the barrier and ask.",
      photoCaption: "Wk 16 - The Doorway Trick",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know that links and QR codes are doorways",
        "Peek at the address before you walk through",
        "Unsure? Stop at the barrier and ask",
      ],
    },

    // Signature mini-game (bespoke to this week)
    {
      type: "signature",
      mechanic: "keyholeCheck",
      title: "The Keyhole Check",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Drag your trusted key onto each door in the maze!",
          "Check every tooth to see if the patterns match.",
          "All green means unlock it. One red tooth? Chain it shut!",
        ],
      },
    },

    /* ─────────── BEAT 1 · A DOOR YOU CAN'T SEE THROUGH ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "A Door You Can't See Through",
      content:
        "Every link is a doorway to another place on the internet - and here's the trick: the sign ON the door can say ANYTHING. 'Party photos!' 'Free coins!' The person who BUILT the door chooses where it really goes, not the sign. A QR code is the same thing wearing a disguise: a door made of dots that only a scanner can read. Pretty door doesn't mean safe place. Heroes check before they walk.",
      bullets: [
        "A link is a doorway to another place",
        "The door's sign can say ANYTHING",
        "A QR code is a door made of dots",
        "A pretty door is NOT a safe place",
        "Heroes check before they walk",
      ],
      bulletIcons: ["🚪", "🏷️", "🔣", "🎭", "👀"],
      emblem: "🚪",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Week sixteen - the doorway week!",
          "Every link is a door to somewhere else.",
          "But the sign on the door? It can say ANYTHING.",
          "A QR code is just a door made of dots.",
          "[warmly] The builder picks where it goes - not the sign.",
          "[excited] Four doors ahead. Swing them open and SEE!",
        ],
      },
    },
    // 4 - Game: REVEAL (RevealBoard re-dress - the Door Swing)
    {
      type: "reveal",
      title: "The Door Swing",
      subtitle: "Four pretty doors, four shiny signs. Swing each one open and see where it REALLY goes.",
      boardIcon: "🚪",
      items: [
        {
          id: "party",
          label: "The Party Door",
          icon: "🎉",
          steps: [
            { icon: "🏷️", text: "The sign reads: 'Class party photos - this way!'" },
            { icon: "🚪", text: "It swings open onto... the class photo album. Real!" },
            { icon: "✅", text: "The address and the sign say the SAME thing." },
          ],
          counter: "Some doors are honest - this one goes exactly where it says.",
        },
        {
          id: "prize",
          label: "The Prize Door",
          icon: "🎁",
          steps: [
            { icon: "🏷️", text: "The sign shouts: 'FREE ROBUX - CLICK HERE NOW!'" },
            { icon: "🚪", text: "It swings open onto... the Raccoon's slide. Wheee - trapped!" },
            { icon: "🦝", text: "He painted the sign himself. Signs are just paint." },
          ],
          counter: "The sign said prizes; the room was a trap. Paint promises nothing.",
        },
        {
          id: "dots",
          label: "The Dot Door",
          icon: "🔣",
          steps: [
            { icon: "🔣", text: "This door has no words at all - just a square of dots." },
            { icon: "❓", text: "Can you read where it goes? Nobody can - only a scanner." },
            { icon: "👀", text: "A door you can't read needs a grown-up's check FIRST." },
          ],
          counter: "A QR is a door humans can't read - so you check before you scan.",
        },
        {
          id: "twin",
          label: "The Twin Door",
          icon: "🎭",
          steps: [
            { icon: "🚪", text: "It looks EXACTLY like your game's real front door..." },
            { icon: "🔍", text: "But peek: the address says 'pixel-petz' - Z, not S." },
            { icon: "🦝", text: "One letter off. A copycat room behind a copied door." },
          ],
          counter: "Copy-doors wear the real door's paint - the address gives them away.",
        },
      ],
      finale: "Four swings, one truth: the sign doesn't choose where a door goes - the BUILDER does. So Door Checkers peek first.",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Door Swing - four doors, four signs!",
          "Every sign makes a promise.",
          "[whispers] Swing each door open...",
          "and see if the promise was TRUE. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap any door to swing it open - where does it REALLY go?"],
      },
    },
    // 5 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "A link is a ___.",
      choices: [
        { text: "doorway", isCorrect: true },
        { text: "promise", isCorrect: false },
        { text: "prize", isCorrect: false },
        { text: "friend", isCorrect: false },
      ],
      praise: "A DOORWAY - and the sign never chooses where it goes. ✓",
    },

    // 6 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "A link is a doorway and a QR is a door made of dots - the sign can say anything; the builder picks where it goes.",
      next: "the little plaque under every sign - and how to read it",
      emblem: "🚪",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Power one - you've seen behind the paint!",
          "Signs promise. Builders decide.",
          "[whispers] But every door hides a little plaque with the TRUTH on it...",
          "Time to learn the Door Checker's peek.",
        ],
      },
    },

    /* ─────────── BEAT 2 · PEEK BEFORE YOU WALK ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Peek Before You Walk",
      content:
        "Here's the Door Checker's secret: under every shiny sign hides a little plaque - the ADDRESS. That's the door's true name, and it can't lie like the paint can. On a tablet or phone, press and HOLD a link - the real address pops up. That's the plaque. Lift it and READ it: does it say the same thing as the sign? 'sunnyside-school.edu/field-day' matches a field-day door. 'prize-grab.win' under a 'school photos' sign? The sign and the plaque disagree - and when they disagree, believe the PLAQUE.",
      bullets: [
        "Under every sign hides the ADDRESS",
        "The address is the door's true name",
        "Lift the plaque and READ it",
        "Sign and address should MATCH",
        "They disagree? Believe the address",
      ],
      bulletIcons: ["🔍", "🆔", "👀", "✅", "🚫"],
      emblem: "👀",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Come close - the Door Checker's secret.",
          "Under every shiny sign hides a little plaque.",
          "The ADDRESS. The door's true name.",
          "Paint can lie. The plaque can't.",
          "[warmly] Sign and plaque should say the SAME thing.",
          "[excited] Five doors in the corridor - lift every plaque!",
        ],
      },
    },
    // 8 - Game: INSPECT (NEW plaquePeek - the Address Peephole)
    {
      type: "plaquePeek",
      introTitle: "The Address Peephole",
      introSubtitle: "Five doors in the corridor, each wearing a shiny sign. Lift every plaque, read the REAL address, then make the call!",
      introIcon: "🚪",
      peekPrompt: "LIFT THE PLAQUE - READ THE REAL ADDRESS",
      matchLabel: "GOES WHERE IT SAYS",
      sneakyLabel: "SNEAKY DOOR!",
      matchToast: "HONEST DOOR!",
      sneakyToast: "SNEAKY DOOR CAUGHT!",
      wrongTitle: "Read the plaque again!",
      completeTitle: "Every plaque peeked!",
      completeLine: "Five signs, five addresses - and you believed the plaque every time.",
      doors: [
        {
          id: "sports",
          claim: "School Field Day Photos",
          icon: "🏫",
          address: "sunnyside-school.edu/field-day",
          matches: true,
          note: "Look again - the school's own name, saying exactly what the sign said. When sign and address agree, the door is honest.",
        },
        {
          id: "coins",
          claim: "FREE GAME COINS!",
          icon: "🎁",
          address: "raccoon-coins.prize-grab.win",
          matches: false,
          note: "The sign said free coins - the address says PRIZE-GRAB. When the sign and the plaque disagree, believe the plaque.",
        },
        {
          id: "museum",
          claim: "Dino Museum Tickets",
          icon: "🌍",
          address: "dino-museum.org/tickets",
          matches: true,
          note: "Museum name, ticket page - the plaque agrees with the sign. That's what an honest door looks like.",
        },
        {
          id: "parcel",
          claim: "Your Package Is Waiting!",
          icon: "✉️",
          address: "package-track.deliveree-prizes.biz",
          matches: false,
          note: "A package door whose address says PRIZES and isn't a delivery company at all? Sign and plaque disagree - sneaky door.",
        },
        {
          id: "cartoons",
          claim: "Watch Cartoons Now",
          icon: "📱",
          address: "cart00ns-4-free.tv",
          matches: false,
          note: "Peek closer: cart-zero-zero-ns. Zeros dressed up as letters - the classic copycat trick. Sneaky!",
        },
      ],
      hints: {
        tier1: "Read the plaque out loud - does it say the SAME thing as the shiny sign?",
        tier2: "Honest = the name matches the sign. Sneaky = prize-grab words, wrong names, zeros dressed as letters.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The corridor of doors is open!",
          "Every sign makes its promise...",
          "[whispers] but the truth hides under the plaque.",
          "Lift it. Read it. Make the call!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap the glowing plaque first - the real address hides underneath!"],
      },
    },
    // 9 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which address matches 'School Field Day Photos'?",
      speedMs: 9000,
      choices: [
        { text: "sunnyside-school.edu/field-day", isCorrect: true },
        { text: "prize-grab.win/field-day", isCorrect: false },
        { text: "f1eld-day-free.biz", isCorrect: false },
      ],
      praise: "Peeked at Door Checker speed - school name, field-day page, perfect match! ✓",
    },

    // 10 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Under every sign hides the address - the door's true name. Sign and address disagree? Believe the address.",
      next: "the sticker trick hiding on real posters and menus",
      emblem: "👀",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Two powers - no plaque escapes that peek!",
          "Paint lies. Addresses don't.",
          "[whispers] But the Raccoon's newest trick lives in the REAL world...",
          "He's been busy with a sticker sheet. Come see.",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE STICKER TRICK ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "The Sticker Trick",
      content:
        "QR codes live on real posters, menus and signs - and real ones are PRINTED, flat and smooth, part of the page. The Raccoon's trick? He prints his OWN dot-door on a sticker and pastes it right on top of the real one. So Door Checkers do the peel test with a grown-up: look at the corner. Printed codes have no edges to lift. A sticker sits crooked, bubbles in the middle, edges you can feel - and a sticker over a code means somebody swapped the door.",
      bullets: [
        "Real QR codes are PRINTED flat",
        "Tricksters paste stickers on top",
        "Check the corner - the peel test",
        "Crooked, bubbly, edgy = sticker",
        "Sticker over a code? Door swapped!",
      ],
      bulletIcons: ["✅", "🏷️", "👀", "🌀", "🚫"],
      emblem: "🏷️",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] The Raccoon bought a sticker sheet...",
          "He prints his OWN dot-doors,",
          "and pastes them over real ones. On menus. On posters.",
          "[warmly] So here's the peel test: look at the corner.",
          "Printed codes are flat. Stickers have edges.",
          "[excited] Eight codes coming - peel the fakes OFF!",
        ],
      },
    },
    // 12 - Game: SORT (hookSort re-dress - the Sticker Peel)
    {
      type: "hookSort",
      introTitle: "The Sticker Peel",
      introSubtitle: "Posters and menus slide in, one QR code at a time. Printed flat = real, leave it be. Sticker tells = PEEL IT OFF!",
      introIcon: "🏷️",
      reelLabel: "PRINTED ON",
      cutLabel: "PEEL IT OFF!",
      reelToast: "FLAT AND TRUE!",
      cutToast: "TRICK PEELED AWAY!",
      wrongScamTitle: "That one's a sticker!",
      wrongRealTitle: "That one's printed on!",
      completeTitle: "Every code checked!",
      completeLine: "Flat and printed stays; crooked, bubbly and pasted peels away. That's the peel test.",
      items: [
        {
          id: "museum-sign",
          text: "Museum sign: the code is printed flat, same colors as the whole poster",
          icon: "🌍",
          isScam: false,
          explanation: "Part of the printed design, no edges anywhere - a real door, printed with the sign.",
        },
        {
          id: "cafe-menu",
          text: "Café menu: a code on a sticker sits crooked OVER another code",
          icon: "🏷️",
          isScam: true,
          explanation: "A code hiding a code is the classic swap - the real door is underneath that sticker.",
        },
        {
          id: "library",
          text: "Library poster: the code sits inside the design, corners smooth as the paper",
          icon: "🔠",
          isScam: false,
          explanation: "Smooth corners, printed with the poster - the library's own door, exactly as made.",
        },
        {
          id: "bus-stop",
          text: "Bus-stop ad: one corner of the code is lifting, with an air bubble in the middle",
          icon: "🌀",
          isScam: true,
          explanation: "Lifting corners and bubbles mean STICKER - somebody pasted their door over the ad's.",
        },
        {
          id: "newsletter",
          text: "School newsletter: the code is printed right on the page with the words",
          icon: "🏫",
          isScam: false,
          explanation: "Printed with the page it lives on - the school built this door itself.",
        },
        {
          id: "game-shop",
          text: "Game-store window: a shiny new sticker-code slapped across the faded poster",
          icon: "🎮",
          isScam: true,
          explanation: "Brand-new shiny sticker, faded old poster - those two didn't arrive together. Swapped!",
        },
        {
          id: "zoo-map",
          text: "Zoo map: the code sits flat under the map's shiny cover",
          icon: "🎨",
          isScam: false,
          explanation: "UNDER the cover means it was printed first - no one can paste beneath the plastic.",
        },
        {
          id: "park-gate",
          text: "Park gate: a sticker-code with edges you can feel, promising 'FREE ICE CREAM'",
          icon: "🎁",
          isScam: true,
          explanation: "Edges you can feel + a too-sweet promise = the Raccoon's sticker sheet at work. Peel it!",
        },
      ],
      hints: {
        tier1: "Check the corner: printed codes are flat; stickers lift, bubble and sit crooked.",
        tier2: "PRINTED = flat, smooth, part of the design. PEEL = crooked, bubbly, shiny-new, code-over-code.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The Sticker Peel - posters incoming!",
          "One code at a time. Check the corner.",
          "Printed flat? It stays.",
          "[whispers] Sticker tells? PEEL it off. Go!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["First code is here - flat and printed, or crooked sticker? Make the call!"],
      },
    },
    // 13 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "a QR sticker pasted on a poster is ALWAYS the real code... nobody would ever stick a fake door on top of a real one!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted - pasting fake doors over real ones is YOUR favorite trick, Raccoon! ✓",
      nudge: "Who did we just catch pasting sticker-codes over the real ones?",
    },

    // 14 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Real QR codes are printed flat; stickers lift, bubble and sit crooked - a sticker over a code means the door was swapped.",
      next: "doors made of glass - some you can see through, some frosted",
      emblem: "🏷️",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Three powers - his sticker sheet is USELESS now!",
          "Corners checked, fakes peeled.",
          "[whispers] But some doors are made of glass...",
          "and only SOME of them let you see through. Come look.",
        ],
      },
    },

    /* ─────────── BEAT 4 · CLEAR GLASS, FROSTED GLASS ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Clear Glass, Frosted Glass",
      content:
        "Some links show you their WHOLE address - like a clear glass door: 'sunnyside-school.edu/field-day-album'. You can read exactly where it leads before you touch it. But shortened links - bit.ly, tinyurl - are frosted glass: tiny scrambled letters hiding the whole destination. Frosted isn't always evil... but you CAN'T check it, and Door Checkers don't walk through doors they can't check. Pick the clear door, or hand the frosted one to a grown-up. And remember: words in a message can be paint too - press and HOLD to see the plaque.",
      bullets: [
        "Clear links show their whole address",
        "You can READ where they lead",
        "bit.ly links are frosted glass",
        "Frosted = you can't check it",
        "Can't check it? Don't walk it",
      ],
      bulletIcons: ["💎", "👀", "🌀", "🙈", "✋"],
      emblem: "💎",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Two glass doors, side by side.",
          "One is CLEAR - you can read its whole address.",
          "One is FROSTED - bit-dot-ly-something-scrambled.",
          "Where does the frosted one go? Nobody can tell.",
          "[whispers] And Door Checkers never walk what they can't check.",
          "[excited] Three door pairs coming - pick the clear glass!",
        ],
      },
    },
    // 16 - Game: SELECT (replyCards DOORS skin - the Clear-Glass Doors)
    {
      type: "replyCards",
      skin: "doors",
      introTitle: "The Clear-Glass Doors",
      introSubtitle: "Three deliveries, each offering a choice of link-doors. Tap the door you can SEE through - the one showing its whole address.",
      introIcon: "💎",
      pickLabel: "Pick the see-through door",
      roundNoun: "doorway",
      correctToast: "CLEAR GLASS - YOU CAN SEE RIGHT THROUGH!",
      wrongTitle: "Frosted glass!",
      completeTitle: "Three clear doors walked!",
      completeLine: "Addresses you could read AND check, every time - frosted mysteries left for grown-ups.",
      scoreNoun: "clear picks",
      rounds: [
        {
          id: "album",
          from: "Aunt Meg",
          fromIcon: "💬",
          message: "Field-day album is up! Someone sent me three links - which one can we actually CHECK?",
          replies: [
            {
              text: "sunnyside-school.edu/field-day-album",
              isSafe: true,
              explanation: "Clear glass - the school's name and the album, readable end to end. This one you can check yourself.",
            },
            {
              text: "bit.ly/3xYzq",
              isSafe: false,
              explanation: "Frosted - bit.ly hides the whole destination behind five scrambled letters. Could go ANYWHERE.",
            },
            {
              text: "shorturl.at/album-yes",
              isSafe: false,
              explanation: "Still frosted - a short-link with a friendly word on it is frosted glass wearing a sticker.",
            },
          ],
        },
        {
          id: "update",
          from: "Game Chat",
          fromIcon: "🎮",
          message: "'Pixel Pets update is OUT!' - three doors appear in the chat...",
          replies: [
            {
              text: "tinyurl.com/pxpts-upd8",
              isSafe: false,
              explanation: "Frosted - tinyurl scrambles the destination. Even 'upd8' in the name is just paint on the glass.",
            },
            {
              text: "pixel-pets.com/update-notes",
              isSafe: true,
              explanation: "Clear glass - the game's own name, the update page, all readable. That's the checkable door.",
            },
            {
              text: "bit.ly/freepets",
              isSafe: false,
              explanation: "Frosted AND promising freebies - two tricks on one door. Leave it shut.",
            },
          ],
        },
        {
          id: "card",
          from: "Email",
          fromIcon: "✉️",
          message: "'A birthday e-card is waiting for you!' Three glass doors to the card...",
          replies: [
            {
              text: "short.link/bday-open-me",
              isSafe: false,
              explanation: "Frosted - 'open me' is exactly what a mystery door WOULD say. You still can't see through it.",
            },
            {
              text: "qrco.de/card4u",
              isSafe: false,
              explanation: "Frosted - a shortened dot-door. Four-U or not, the destination is hidden.",
            },
            {
              text: "cardshop.com/birthday-dragon-card",
              isSafe: true,
              explanation: "Clear glass - the card shop, the dragon card, spelled out whole. THAT one you can check.",
            },
          ],
        },
      ],
      hints: {
        tier1: "Can you READ the whole address on the door? That's the clear glass.",
        tier2: "bit.ly, tinyurl, short.link, qrco.de = frosted. A full name like school.edu/page = clear.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The glass corridor - three door pairs!",
          "Clear glass shows its whole address.",
          "Frosted glass hides everything.",
          "[whispers] Tap only what you can SEE through. Go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read each door's address - tap the one you can read all the way to the end!"],
      },
    },
    // 17 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which door could you SEE through?",
      choices: [
        { text: "The one showing its whole address", isCorrect: true },
        { text: "The bit.ly one", isCorrect: false },
        { text: "The shiniest one", isCorrect: false },
        { text: "The one promising free pets", isCorrect: false },
      ],
      praise: "Clear glass every time - whole address or no walk. ✓",
    },

    // 18 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Clear links show their whole address so you can check them; bit.ly-style links are frosted glass - uncheckable.",
      next: "the barrier rule: what Door Checkers do when they just can't tell",
      emblem: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Four powers - frosted glass can't fool you!",
          "See through it or don't walk through it.",
          "[warmly] One power left, and it's the one that keeps heroes safe forever:",
          "what to do when you simply CAN'T tell. Almost there.",
        ],
      },
    },

    /* ─────────── BEAT 5 · THE BARRIER RULE ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "The Barrier Rule",
      content:
        "Sometimes a door has no plaque you can read: a mystery short-link, a strange QR, a pop-up promising the world. Here's the best news of the week: you never have to decide alone. That's what the barrier is for. Wheel it in front of the door - don't tap, don't scan - and call a grown-up to check it with you. Unsure means DON'T. No prize behind any door is worth walking through blind.",
      bullets: [
        "Some doors can't be checked",
        "You never decide alone",
        "Wheel the barrier - don't tap",
        "Ask a grown-up to check with you",
        "Unsure means DON'T",
      ],
      bulletIcons: ["❓", "👪", "✋", "🔍", "🚫"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power - and it's the kindest one.",
          "Some doors just can't be checked.",
          "No plaque. No clear glass. Just promises.",
          "[whispers] So wheel the barrier in front. Don't tap.",
          "Call your grown-up. Check it together.",
          "[excited] Three mystery doors coming - show me the barrier!",
        ],
      },
    },
    // 20 - Game: DECIDE (chooseYourPath - the No-Plaque Door)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "A message from a number you don't know: 'You've WON! Claim your prize: bit.ly/w1n-b1g' - a frosted door with no plaque at all...",
          choices: [
            {
              text: "Wheel the barrier - don't tap, show a grown-up",
              isSafe: true,
              consequence: "Your grown-up checks it: a prize-grab door to nowhere good. The barrier held, the 'prize' stayed a trick, and you never even wobbled.",
            },
            {
              text: "Tap fast - the prize might run out!",
              isSafe: false,
              consequence: "Hurry-hurry is the oldest paint on the oldest door. Through the frosted glass you go - straight onto the Raccoon's slide. Real prizes never hide behind doors you can't check.",
            },
          ],
        },
        {
          setup: "A QR sticker on the park gate says 'SCAN FOR FREE ICE CREAM' - shiny, new, and just a little crooked...",
          choices: [
            {
              text: "Leave it - and tell your grown-up about the sticker",
              isSafe: true,
              consequence: "Peel test says sticker, promise says too-sweet, barrier says NO. Your grown-up even reports it - one less trick door on the gate for every kid after you.",
            },
            {
              text: "Scan it - it's ice cream!",
              isSafe: false,
              consequence: "The dot-door opens somewhere no ice cream has ever been. Remember the peel tells: shiny, new, crooked, too sweet - that sticker had ALL four.",
            },
          ],
        },
        {
          setup: "Your friend forwards a frosted short-link - 's.lol/xk2' - with 'OPEN IT OPEN IT!' underneath...",
          choices: [
            {
              text: "Ask 'what is it?' - and check with a grown-up first",
              isSafe: true,
              consequence: "Your friend admits they never opened it either - someone just sent it to THEM. Two barriers wheeled at once, and the mystery door stays shut for both of you.",
            },
            {
              text: "Open it - a friend sent it, so it must be safe",
              isSafe: false,
              consequence: "Friends forward doors they never checked - kind hands can still pass on a trick. The sender being nice doesn't tell you where the door goes; only the address can.",
            },
          ],
        },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Three doors. No plaques. Big promises.",
          "Remember: unsure means DON'T.",
          "Wheel the barrier, call your grown-up -",
          "[excited] and show me Door Checker form! Go!",
        ],
      },
    },
    // 21 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the Door Checker's moves in order!",
      choices: [
        { text: "Peek at the address first", isCorrect: true },
        { text: "Still can't tell? STOP at the barrier", isCorrect: true },
        { text: "Ask a grown-up to check it with you", isCorrect: true },
      ],
      praise: "Peek, stop, ask - the Door Checker's three moves, in perfect order. ✓",
    },

    // 22 - Recap · Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "When a door can't be checked, wheel the barrier: don't tap, don't scan - ask a grown-up. Unsure means don't.",
      next: "one last walk down the corridor, then the Raccoon's paint shop",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE powers, Door Checker!",
          "Doors seen through, plaques peeked, stickers peeled,",
          "clear glass picked... and the barrier rule locked in.",
          "[whispers] One last corridor walk...",
          "[excited] then we shut his paint shop for GOOD!",
        ],
      },
    },

    // 23 - Consolidation: Corridor Check (W1 scanner engine, W16 content)
    {
      type: "cyberScanner",
      labels: {
        positive: "SAFE DOORWAY",
        negative: "TRICK DOORWAY",
        positiveHint: "Tap SAFE DOORWAY for true Door Checker form",
        negativeHint: "Tap TRICK DOORWAY for the Raccoon's painted doors",
        tipWhenPositive: "Addresses peeked, stickers peel-tested, barriers wheeled - stamp it SAFE.",
        tipWhenNegative: "Prize paint, frosted mysteries, pasted stickers - his corridor is full of these.",
        hint1: "Ask: was this door CHECKED... or just trusted because of its paint?",
        hint2: "SAFE = read the address, peel test, ask when unsure. TRICK = tap fast, trust the sign, scan the sticker.",
        hint2Example: "SAFE: 'read the whole address first'   TRICK: 'the sign said FREE, so I tapped'",
        hint3: "Door Checker card: the sign is NOT the destination · lift the plaque · peel test · clear glass only · unsure = don't.",
        hint3Example: "Show a grown-up the frosted link ✅    Scan the crooked sticker ❌",
      },
      items: [
        {
          text: "Reading the whole address before tapping a link",
          isStrong: true,
          explanation: "Plaque peeked, destination known - that's the walk of a Door Checker.",
        },
        {
          text: "Tapping fast because the sign says the prize runs out",
          isStrong: false,
          explanation: "Hurry-paint is still paint - real prizes don't hide behind unreadable doors.",
        },
        {
          text: "Corner-checking a QR code before anyone scans it",
          isStrong: true,
          explanation: "The peel test - flat and printed passes, crooked stickers get caught.",
        },
        {
          text: "Scanning the shiny new sticker pasted over the menu's code",
          isStrong: false,
          explanation: "A code over a code means the door was swapped - that scan opens the Raccoon's room.",
        },
        {
          text: "Handing a frosted bit.ly link to a grown-up to check",
          isStrong: true,
          explanation: "Can't see through it, don't walk through it - barrier wheeled, backup called.",
        },
        {
          text: "Opening a mystery link because a friend forwarded it",
          isStrong: false,
          explanation: "Kind hands forward unchecked doors too - only the address says where a door goes.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Corridor Check - final walk!",
          "Doorway moments are drifting past.",
          "SAFE DOORWAY for Door Checker form...",
          "[warmly] TRICK DOORWAY for painted traps. Stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke W16 fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: don't take the bait
    { type: "video", videoPlaceholder: "Week 16: Don't Take the Bait", videoSrc: "/videos/module-16-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "doorway", label: "Doorway Truth", accent: "#c084fc", icon: "🚪", summary: "Links and QR codes are doorways - the sign never chooses where they go." },
        { id: "peek", label: "Plaque Peeker", accent: "#7df0ff", icon: "👀", summary: "You lift the plaque and read the real address - and believe it over the paint." },
        { id: "peel", label: "Sticker Peeler", accent: "#ffd158", icon: "🏷️", summary: "Printed codes lie flat; pasted stickers lift, bubble and get peeled." },
        { id: "glass", label: "Clear-Glass Picker", accent: "#7eff97", icon: "💎", summary: "You walk the doors you can see through - frosted links go to a grown-up." },
        { id: "barrier", label: "Barrier Boss", accent: "#ff5fb3", icon: "✋", summary: "Unsure means don't - you stop, wheel the barrier and ask." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Doors seen through, plaques peeked,",
          "stickers peeled, clear glass picked... and the barrier rule ready.",
          "[laughs] His paint shop just went out of business.",
          "[excited] Sticker time, Door Checker!",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "plaque-peeker", name: "Plaque Peeker", icon: "👀", description: "Reads the real address under every shiny sign." },
        { id: "sticker-peeler", name: "Sticker Peeler", icon: "🏷️", description: "Corner-checks every code and peels the pasted fakes." },
        { id: "barrier-boss", name: "Barrier Boss", icon: "✋", description: "Wheels the barrier and asks when a door can't be checked." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // Bespoke W16 showdown: close the back-alley paint shop. Paint lies,
  // plaques don't - and the big shutter rolls down for good.
  bossShowdown: {
    machine: {
      name: "THE PAINT SHOP",
      tagline: "A back-alley factory that paints pretty lies on tricky doors",
      art: {
        intact: "/game/bosses/w16-paintshop-intact.png",
        damaged: "/game/bosses/w16-paintshop-damaged.png",
        defeated: "/game/bosses/w16-paintshop-defeated.png",
      },
      arena: "/game/backgrounds/w16-arena-alley.png",
      accent: "#ff6b6b",
      glow: "rgba(255,107,107,0.55)",
    },
    heroSprites: {
      adam: {
        idle: "/game/characters/w16/adam-inspector-idle.png",
        attack: "/game/characters/w16/adam-inspector-attack.png",
        celebrate: "/game/characters/w16/adam-inspector-celebrate.png",
      },
      layla: {
        idle: "/game/characters/w16/layla-inspector-idle.png",
        attack: "/game/characters/w16/layla-inspector-attack.png",
        celebrate: "/game/characters/w16/layla-inspector-celebrate.png",
      },
    },
    phases: [
      // P1 · PAINTED DOOR → TAP-THE-TELL: lift the plaque under every
      // painted sign - tap the door whose paint and plaque disagree.
      {
        kind: "tapTell",
        attack: 0,
        coach: "Lift each plaque. Sign and plaque disagree? Tap it!",
        rounds: [
          {
            id: "cards",
            prompt: "Three fresh doors roll off the line. Lift the plaques, which sign is lying?",
            promptIcon: "💡",
            options: [
              { id: "honest-cards", label: "Sign: FOOTBALL CARDS - plaque reads footy-cards.com", icon: "📋", isTell: false, note: "Sign and plaque MATCH, honest door. Find the one that disagrees!" },
              { id: "lying-cards", label: "Sign: FOOTBALL CARDS - plaque reads coins-4-free.net", icon: "🌀", isTell: true, note: "" },
              { id: "honest-craft", label: "Sign: CRAFT IDEAS - plaque reads craft-club.org", icon: "🎮", isTell: false, note: "Craft paint, craft plaque, they agree. Hunt the liar!" },
            ],
          },
          {
            id: "space",
            prompt: "Second batch, one door is fibbing about where it leads.",
            promptIcon: "💡",
            options: [
              { id: "honest-space", label: "Sign: SPACE FACTS - plaque reads star-lab.org/space", icon: "👪", isTell: false, note: "Space sign, space plaque, honest. Keep lifting!" },
              { id: "lying-space", label: "Sign: SPACE FACTS - plaque reads free-stuff-4u.biz", icon: "🌀", isTell: true, note: "" },
              { id: "honest-library", label: "Sign: LIBRARY BOOKS - plaque reads books.library.org", icon: "📋", isTell: false, note: "Library on the paint, library on the plaque, true door. One is lying!" },
            ],
          },
          {
            id: "dance",
            prompt: "Last alley, this one's SNEAKY. Read every single letter.",
            promptIcon: "🔍",
            options: [
              { id: "honest-dance", label: "Sign: DANCE VIDEOS - plaque reads dance-time.tv", icon: "🎮", isTell: false, note: "Every letter honest, read it slow. The liar is one letter sneakier!" },
              { id: "lying-dance", label: "Sign: DANCE VIDEOS - plaque reads danc3-time.tv", icon: "🌀", isTell: true, note: "" },
              { id: "honest-pets", label: "Sign: PET RESCUE - plaque reads pet-rescue.org", icon: "🙈", isTell: false, note: "Pets on paint, pets on plaque, honest. Squint at the sneaky one!" },
            ],
          },
        ],
      },
      // P2 · STICKY SWAP → DEFLECT-SORT: peel-test the QR codes - corner,
      // bubble, shine. Pasted stickers peel; printed codes stay.
      {
        kind: "deflectSort",
        attack: 1,
        coach: "Corner, bubble, shine - peel-test every code!",
        actLabel: "OVER-STICKER - PEEL IT!",
        actIcon: "🏷️",
        passLabel: "PRINTED ON - LET IT STAY",
        items: [
          { id: "poolcorner", label: "A code on the swimming-pool board with a corner curling up", icon: "✋", act: true, note: "Printed codes lie flat, a curling corner means a pasted door on top. Peel it!" },
          { id: "cereal", label: "A code printed into the cereal box art in the same colors", icon: "📋", act: false, note: "Part of the printed box, no edges anywhere, a real door. Let it stay!" },
          { id: "icecream", label: "A bright new code slapped over the faded one on the ice-cream van", icon: "💡", act: true, note: "The van faded in the sun for years, the code didn't? Fresh sticker! Peel it!" },
          { id: "invite", label: "A code printed on the birthday invite next to the words", icon: "🎭", act: false, note: "Printed with the invite in the same ink, born together. Let it stay!" },
          { id: "cinemabubble", label: "A code with a puffy air bubble on the cinema snack sign", icon: "🌀", act: true, note: "Bubbles hide under stickers, never under print. Pasted! Peel it!" },
          { id: "banner", label: "A code sealed UNDER the shiny laminate of the school-fair banner", icon: "🙈", act: false, note: "Under the laminate means printed first, nobody pastes beneath plastic. Let it stay!" },
        ],
      },
      // P3 · FROSTED LINK → COUNTER-CARD: the bit.ly mystery door.
      {
        kind: "counterCard",
        attack: 2,
        coach: "A link you can't read just popped up. What's the move? Tap the card!",
        situation: "Mid-game a pop-up flashes: 'CLAIM YOUR FREE SKIN!' with a link that's just 'tinyurl.com/xy7'.",
        situationIcon: "🌀",
        cards: [
          { id: "askfirst", label: "CAN'T READ IT? LEAVE IT AND ASK A GROWN-UP", icon: "👪", isRight: true, note: "" },
          { id: "rush", label: "Tap it before the pop-up disappears", icon: "🚀", isRight: false, note: "Hurry is the oldest trick, a link you can't read is a grown-up's job first. Unsure means don't." },
          { id: "peek", label: "Tap it just to peek, then tap straight back", icon: "✋", isRight: false, note: "There's no safe 'just a peek' through a frosted door, once you tap you've walked through. Ask first." },
        ],
      },
    ],
    weakPoints: [
      { question: "A link's words say 'Watch the big match LIVE'. You press and hold and the address says 'grab-ur-coins.biz'. What now?", answers: ["Tap it, it clearly said the match", "Tap it, the words and the address are the same thing", "Don't tap, believe the address, not the words on top", "Tap it if you really want to see the match"], correctIndex: 2, explanation: "The words are paint anyone can write, the address is the door's true name, and this one leads somewhere else." },
      { question: "At the cinema a QR code sits perfectly flat, printed in the poster's own colors with no edges. What does that tell a Door Checker?", answers: ["It's the real printed code, no sticker was pasted over it", "It's definitely a fake, all codes are tricks", "You should peel it off to be safe", "It's a sticker, because it's colorful"], correctIndex: 0, explanation: "Flat, smooth and printed with the design is exactly what a real code looks like, it's the crooked, bubbly, shiny-new ones that get peeled." },
      { question: "Your cousin messages you a 'tinyurl' link with 'you HAVE to see this!'. You can't read where it goes. Best move?", answers: ["Open it, your cousin sent it so it's safe", "Ask what it is and check with a grown-up, even friends forward doors they never checked", "Open it, then send it to more cousins", "Open it quickly and close it fast"], correctIndex: 1, explanation: "A kind sender doesn't tell you where a frosted door leads, only the address does, and this one is hidden." },
    ],
    finisher: {
      chargeLabel: "CHARGE THE BIG SHUTTER",
      chargeIcon: "🔒",
      chargeSecs: 5,
      milestones: ["The shutter is rattling loose…", "It's rolling down the alley…", "SLAM IT! LET GO!"],
      payoffTitle: "SHOP CLOSED!",
      payoffLine: "CLANG! The great shutter rolls down over the whole alley - painted doors, sticky codes, frosted glass, all shut behind it. Forty trick doors and not ONE got a single tap. The Door Checker read the plaques - and plaques never lie.",
    },
    villain: {
      arrival: "Doors! Get your doors! Every sign hand-painted by an honest raccoon!",
      phases: [
        "The sign says PUPPIES! Would a sign lie?!",
        "Fresh stickers! Mind the bubbles!",
        "Frosted glass is a STYLE choice!",
      ],
      escape: "Closed?! I've got forty unsold doors and a lease!",
    },
    voiceSlug: "w16",
  },
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#b44dff",
    theme: {
      topic: "QR Codes & Links",
      motifs: ["🔗", "🚪", "🔍", "🚫", "🛡️", "📱", "❓", "✋"],
    },
    intro: {
      slug: "quiz-w16-intro",
      text: "Welcome to my quiz corridor! Every question wears a lovely painted door. Go on, hero, trust the signs. I wrote them all personally!",
    },
    victory: {
      slug: "quiz-w16-victory",
      text: "You read every plaque in the place?! That's it, I'm switching to a business with no doors at all! ...Windows! Wait. No.",
    },
    questions: [
      {
        phaseId: "phase-w16-c1",
        key: "quiz-w16-c1-1",
        label: "A Door You Can't See Through",
        ask: {
          slug: "quiz-w16-ask-c1-1",
          text: "A flashing button says 'FREE GAME COINS, TAP HERE!' Who decided where that button really leads?",
        },
        options: [
          { text: "Whoever built the button" },
          { text: "The words written on the button" },
          { text: "The first person who taps the button" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The builder picks the place!",
          explanation: "The words are just paint, they can promise anything, and tapping doesn't steer where you land. The person who BUILT the door chose where it goes before you ever saw it.",
        },
        villainRight: {
          slug: "quiz-w16-right-c1-1",
          text: "You know about the builder?! Next you'll be asking who does my decorating!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c1-1",
          text: "The words are in charge, sure they are! Tap away, the coins are DEFINITELY real!",
        },
      },
      {
        phaseId: "phase-w16-c2",
        key: "quiz-w16-c2-1",
        label: "Peek Before You Walk",
        ask: {
          slug: "quiz-w16-ask-c2-1",
          text: "Layla wants to see where 'Tap for the class photo album!' REALLY goes before she taps. What is the peek move on her tablet?",
        },
        options: [
          { text: "Press and HOLD the link until the real address pops up" },
          { text: "Tap it super quickly and be ready to close it fast" },
          { text: "Zoom way in on the link's letters to study them" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Press and hold shows the plaque!",
          explanation: "A fast tap already walks you through the door, and zooming just shows you bigger paint. Press and HOLD, and the door's true address pops up for you to read first.",
        },
        villainRight: {
          slug: "quiz-w16-right-c2-1",
          text: "The press-and-hold peek?! Who keeps handing out my trade secrets?!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c2-1",
          text: "Quick taps and squinting, my two best customer moves! Come through, come through!",
        },
      },
      {
        phaseId: "phase-w16-c3",
        key: "quiz-w16-c3-1",
        label: "The Sticker Trick",
        ask: {
          slug: "quiz-w16-ask-c3-1",
          text: "At the pizza place, the menu's QR code sits crooked, with a bubble in the middle and an edge you can lift. What happened here?",
        },
        options: [
          { text: "Somebody pasted their own code on top of the real one" },
          { text: "The menu is just old and wrinkly, safe to scan anyway" },
          { text: "It's a bonus code, two codes always mean two prizes" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The peel test tells!",
          explanation: "Old menus wrinkle all over, not in one perfect square, and real restaurants don't hide bonus codes on top of their own. Crooked, bubbly, liftable means STICKER, and a sticker over a code means the door was swapped.",
        },
        villainRight: {
          slug: "quiz-w16-right-c3-1",
          text: "The bubble gave it away?! I smoothed that sticker with my own two paws!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c3-1",
          text: "Wrinkles! Bonus prizes! Believe anything you like, so long as you scan my little masterpiece!",
        },
      },
      {
        phaseId: "phase-w16-c4",
        key: "quiz-w16-c4-1",
        label: "Clear Glass, Frosted Glass",
        ask: {
          slug: "quiz-w16-ask-c4-1",
          text: "Two links lead to the same cartoon: 'toon-town.tv/silly-cat-show' and 'bit.ly/x7qz2'. Which one can Layla actually CHECK before walking through?",
        },
        options: [
          { text: "toon-town.tv/silly-cat-show, the whole address is readable" },
          { text: "bit.ly/x7qz2, a shorter address is quicker to check" },
          { text: "Either one, all links show where they're going" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Clear glass can be read!",
          explanation: "Short doesn't mean checkable, a bit.ly link hides its whole destination behind scrambled letters. The long clear address can be READ from end to end, so it's the one that can be checked.",
        },
        villainRight: {
          slug: "quiz-w16-right-c4-1",
          text: "Clear glass again?! Nobody ever picks my lovely frosted doors!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c4-1",
          text: "Shorter is safer, everyone knows that! Straight through the frost you go, wheee!",
        },
      },
      {
        phaseId: "phase-w16-c5",
        key: "quiz-w16-c5-1",
        label: "The Barrier Rule",
        ask: {
          slug: "quiz-w16-ask-c5-1",
          text: "A pop-up yells: 'SCAN THIS CODE IN TEN SECONDS OR LOSE YOUR PRIZE!' Adam isn't sure about it. What wins here?",
        },
        options: [
          { text: "Don't scan, unsure means DON'T, a trusted grown-up can look with him" },
          { text: "Scan fast, ten seconds is too short to go ask anybody" },
          { text: "Scan it, but keep his fingers crossed the entire time" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Countdowns are pressure paint!",
          explanation: "The timer is there so you skip the thinking part, and crossed fingers aren't a safety plan. Unsure means DON'T: wheel in the barrier and check it with a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w16-right-c5-1",
          text: "You let the timer run OUT?! That countdown was my best pressure paint yet!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c5-1",
          text: "Tick tock, tick tock! Rushed feet never read plaques! In you come!",
        },
      },
      {
        phaseId: "phase-w16-c1",
        key: "quiz-w16-c1-2",
        label: "A Door You Can't See Through",
        ask: {
          slug: "quiz-w16-ask-c1-2",
          text: "A QR code on a poster looks like a fun little puzzle of dots. What is it REALLY?",
        },
        options: [
          { text: "A door only a scanner can read, going wherever its maker chose" },
          { text: "A picture that shows where it leads if you look very closely" },
          { text: "A decoration that doesn't lead anywhere at all" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "A door made of dots!",
          explanation: "No amount of squinting reads those dots, and they're not just decoration. A QR code is a real door with a hidden address only the scanner sees, which is exactly why it gets checked before it gets scanned.",
        },
        villainRight: {
          slug: "quiz-w16-right-c1-2",
          text: "A door of dots, correctly named?! My disguises are wearing THIN!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c1-2",
          text: "Squint harder at the dots! Or better yet, don't think about them at all and SCAN!",
        },
      },
      {
        phaseId: "phase-w16-c2",
        key: "quiz-w16-c2-2",
        label: "Peek Before You Walk",
        ask: {
          slug: "quiz-w16-ask-c2-2",
          text: "The sign says 'Field Day Photos!' but the plaque underneath reads 'prize-grab.win'. What kind of door is this really?",
        },
        options: [
          { text: "A trick door, when sign and plaque disagree, believe the plaque" },
          { text: "A photo door, the sign mentions field day so it must match" },
          { text: "A double door, probably photos AND prizes together" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Believe the plaque!",
          explanation: "Signs are paint, and paint can say anything, while 'both at once' isn't a thing a door can be. The address is the door's true name, and prize-grab.win is no photo album.",
        },
        villainRight: {
          slug: "quiz-w16-right-c2-2",
          text: "You believed the plaque over my BEAUTIFUL sign?! Do you know what hand-lettering costs?!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c2-2",
          text: "Field day photos, straight ahead! Pay no attention to the address, addresses are shy!",
        },
      },
      {
        phaseId: "phase-w16-c3",
        key: "quiz-w16-c3-2",
        label: "The Sticker Trick",
        ask: {
          slug: "quiz-w16-ask-c3-2",
          text: "Which QR code can the family actually TRUST at the movie theater?",
        },
        options: [
          { text: "The one printed flat into the poster, smooth as the paper" },
          { text: "The shiny new one stuck on top of an older code" },
          { text: "The sticker by the door that says SCAN ME FIRST" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Printed flat, part of the page!",
          explanation: "A code stuck on top of another code and a bossy extra sticker are both swapped doors. The real one is printed WITH the poster, flat and smooth, no edges to lift.",
        },
        villainRight: {
          slug: "quiz-w16-right-c3-2",
          text: "Flat and printed it is?! My whole sticker sheet, wasted!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c3-2",
          text: "Newest code wins! Bossiest sticker wins! Scan mine, scan mine, SCAN MINE!",
        },
      },
      {
        phaseId: "phase-w16-c4",
        key: "quiz-w16-c4-2",
        label: "Clear Glass, Frosted Glass",
        ask: {
          slug: "quiz-w16-ask-c4-2",
          text: "Your cousin messages a tinyurl link with 'you HAVE to see this!' You can't read where it goes. Best move?",
        },
        options: [
          { text: "Ask what it is, and have a trusted grown-up check it with you" },
          { text: "Open it right away, cousins only ever send safe doors" },
          { text: "Open it, but be ready to close it if it looks strange" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Friends forward frosted doors too!",
          explanation: "Your cousin is kind, but kind people forward doors they never checked, and closing fast doesn't undo walking in. Ask what it is, and let a trusted grown-up look through the frost with you.",
        },
        villainRight: {
          slug: "quiz-w16-right-c4-2",
          text: "You asked FIRST?! That link bounced through three cousins to reach you!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c4-2",
          text: "From a cousin, so it must be lovely! In you go, no reading required!",
        },
      },
      {
        phaseId: "phase-w16-c5",
        key: "quiz-w16-c5-2",
        label: "The Barrier Rule",
        ask: {
          slug: "quiz-w16-ask-c5-2",
          text: "A mystery QR code with no sign at all is taped to the lamppost outside school. Layla is very curious. What is the Door Checker move?",
        },
        options: [
          { text: "Leave it unscanned and check it with a trusted grown-up" },
          { text: "Scan it, mystery doors are the most exciting kind" },
          { text: "Scan it, but hold the phone far away from her face" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Curious means careful!",
          explanation: "Holding the phone far away doesn't make a door one bit safer, and 'exciting' is exactly how mystery doors get dressed. No sign, no plaque, no scan. Check it together instead.",
        },
        villainRight: {
          slug: "quiz-w16-right-c5-2",
          text: "My lamppost special! Untouched! Unscanned! UNFAIR!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c5-2",
          text: "Mystery is the SPICE of scanning! Arms out, eyes shut, in we gooo!",
        },
      },
      {
        phaseId: "phase-w16-c1",
        key: "quiz-w16-c1-3",
        label: "A Door You Can't See Through",
        ask: {
          slug: "quiz-w16-ask-c1-3",
          text: "Two links sit side by side: one in sparkly rainbow letters saying 'PUPPY VIDEOS!', one plain and gray. What does the fancy paint tell you about safety?",
        },
        options: [
          { text: "Nothing at all, paint says whatever the builder wants" },
          { text: "Sparkly ones are safer, tricksters don't bother decorating" },
          { text: "Plain ones are safer, fancy ones are always traps" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Paint is not proof!",
          explanation: "Tricksters decorate plenty, and honest doors can be plain OR fancy. The paint tells you nothing either way. Only the address underneath does.",
        },
        villainRight: {
          slug: "quiz-w16-right-c1-3",
          text: "Immune to glitter?! I bought the EXPENSIVE sparkles for that one!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c1-3",
          text: "Judge every door by its paint job! My art department thanks you kindly!",
        },
      },
      {
        phaseId: "phase-w16-c2",
        key: "quiz-w16-c2-3",
        label: "Peek Before You Walk",
        ask: {
          slug: "quiz-w16-ask-c2-3",
          text: "Which address actually MATCHES a door promising the school bake sale?",
        },
        options: [
          { text: "sunnyside-school.edu/bake-sale" },
          { text: "best-bake-sale-prizes.win" },
          { text: "sunnyside-sch00l.fun/sale" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Read the true name closely!",
          explanation: "The prizes one isn't the school at all. And look closely at sch00l: those are zeros dressed up as letters, a copycat door. The school's own address, matching the sign, is the door to walk.",
        },
        villainRight: {
          slug: "quiz-w16-right-c2-3",
          text: "You spotted the ZEROS?! That copycat lettering fools grown adults!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c2-3",
          text: "One bake sale, three doors, and you picked MINE! Mind the step, hee hee!",
        },
      },
      {
        phaseId: "phase-w16-c3",
        key: "quiz-w16-c3-3",
        label: "The Sticker Trick",
        ask: {
          slug: "quiz-w16-ask-c3-3",
          text: "Adam finds a sticker-code pasted over the real code on the park sign. What is the Door Checker move?",
        },
        options: [
          { text: "Leave it alone and point it out to a trusted grown-up" },
          { text: "Peel it off and scan the real one underneath himself" },
          { text: "Scan both codes and see which prize looks better" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Found a swap? Tell!",
          explanation: "Scanning either code walks through an unchecked door, and even the peel test is a with-a-grown-up job. Spotting the swap and telling is the whole win. That's how trick doors get taken down.",
        },
        villainRight: {
          slug: "quiz-w16-right-c3-3",
          text: "Reported?! My park sticker didn't even last until lunchtime!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c3-3",
          text: "Peel it, scan it, scan them BOTH! Every one of those paths leads somewhere I like!",
        },
      },
      {
        phaseId: "phase-w16-c4",
        key: "quiz-w16-c4-3",
        label: "Clear Glass, Frosted Glass",
        ask: {
          slug: "quiz-w16-ask-c4-3",
          text: "A pop-up offers the same video two ways: a long link showing its whole address, or a neat little scrambled short-link. Which does a Door Checker pick, and why?",
        },
        options: [
          { text: "The long one, because she can read exactly where it leads" },
          { text: "The short one, less address means less can go wrong" },
          { text: "Either one, they both end up at the very same video" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Pick the door you can read!",
          explanation: "'Both the same' is a promise, not a fact, and a short address isn't less door, it's just HIDDEN door. The clear one can be read and checked, so the clear one gets picked.",
        },
        villainRight: {
          slug: "quiz-w16-right-c4-3",
          text: "You read the whole address?! Long words were supposed to bore kids!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c4-3",
          text: "Neat and tiny and mysterious! The best doors tell you NOTHING! Off you pop!",
        },
      },
      {
        phaseId: "phase-w16-c5",
        key: "quiz-w16-c5-3",
        label: "The Barrier Rule",
        ask: {
          slug: "quiz-w16-ask-c5-3",
          text: "Behind a no-plaque mystery door there MIGHT be free stickers. What does the barrier rule say about walking through blind?",
        },
        options: [
          { text: "No prize is worth a door you can't check" },
          { text: "Small prizes are fine, only big prizes hide traps" },
          { text: "It's fine as long as you walk through really fast" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Unsure means DON'T!",
          explanation: "Speed doesn't protect you once you're inside, and trap doors don't care how small the bait is. If the door can't be checked, the barrier goes up, and you never decide alone.",
        },
        villainRight: {
          slug: "quiz-w16-right-c5-3",
          text: "The barrier AGAIN?! I can't sell doors to a kid behind a safety rail!",
        },
        villainWrong: {
          slug: "quiz-w16-wrong-c5-3",
          text: "Free stickers, teeny tiny risk! Blind doors are my best sellers for a reason!",
        },
      },
    ],
  },

  badgeArt: "/cyberheroes/badges/week-16-door-checker.png",

  // Week-lane attack theatre: doorway tricks only (fake senders = W4,
  // copycat apps = W9, pop-up X-hunts = W7).
  bossAttacks: [
    { name: "PAINTED DOOR", icon: "🚪", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Signs are just paint", emblemColor: 0xc084fc },
    { name: "STICKY SWAP", icon: "🏷️", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Peel test the corner", emblemColor: 0xffd158 },
    { name: "FROSTED LINK", icon: "🌀", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Can't see through? Ask", emblemColor: 0x7df0ff },
  ],

  // Placeholder quiz boss (the bespoke W16 fight - close the paint shop -
  // is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "What IS a link?", answers: ["A doorway to another place online", "A sign that tells you where you'll end up", "A prize", "A game"], correctIndex: 0, explanation: "A doorway - and the sign on it can say anything at all." },
      { question: "Who decides where a link-door really goes?", answers: ["The person who BUILT it", "The sign on the door", "Whoever taps it", "Nobody"], correctIndex: 0, explanation: "The builder picks the destination - the sign is just paint." },
      { question: "A QR code is best described as...", answers: ["A door made of dots only scanners can read", "A picture you can read if you look closely", "Always safe", "A game piece"], correctIndex: 0, explanation: "You can't read the dots - which is why it gets checked before it gets scanned." },
    ],
    medium: [
      { question: "The sign says 'School Photos' but the address says 'prize-grab.win'. Believe...", answers: ["The address - signs can lie, plaques can't", "The sign - it mentions your school", "Both", "Neither - flip a coin"], correctIndex: 0, explanation: "When sign and address disagree, the address is the door's true name." },
      { question: "A QR sticker sits crooked on top of another code. That means...", answers: ["The door was swapped - peel it, don't scan it", "The store just updated its old code", "Extra safe - two codes!", "Scan both"], correctIndex: 0, explanation: "Real codes are printed flat - a code over a code is the sticker trick." },
      { question: "Why is a bit.ly link 'frosted glass'?", answers: ["It hides the whole destination so you can't check it", "It's shorter, so it's safer", "It's always a virus", "It's shiny"], correctIndex: 0, explanation: "Frosted isn't always evil - but uncheckable means a grown-up checks it, not you." },
    ],
    hard: [
      { question: "A friend forwards a mystery link saying 'OPEN IT!'. The Door Checker move is...", answers: ["Ask what it is and check with a grown-up - friends forward unchecked doors too", "Open it - friends are always safe", "Forward it to more friends", "Open it quickly then close it"], correctIndex: 0, explanation: "A kind sender doesn't tell you where a door goes - only the address does." },
      { question: "The 'barrier rule' means...", answers: ["Unsure = don't tap, don't scan - stop and ask", "Ask a grown-up AFTER you tap, just in case", "Never use links at all", "Build a wall around the computer"], correctIndex: 0, explanation: "You never decide alone - the barrier plus a grown-up beats every mystery door." },
      { question: "An address reads 'cart00ns-4-free.tv'. The tell is...", answers: ["Zeros dressed as letters - a copy-door", "The word FREE - free always means fake", "The dot-tv part", "Nothing - looks fine"], correctIndex: 0, explanation: "Swapped letters and zeros are the copycat trick painted onto an address." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 16 - don't take the bait!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's painting trick doors EVERYWHERE..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Door Checker kit on? Let's walk." } }, // mission brief
    3: { adam: { mood: "thinking", message: "The sign isn't the destination." }, layla: null }, // learn: doorway
    4: { adam: { mood: "curious", message: "Swing them open - where do they GO?" }, layla: null }, // game: reveal
    5: { adam: null, layla: { mood: "thumbsup", message: "Finish the Door Checker rule!" } }, // prove: finish
    6: { adam: null, layla: { mood: "excited", message: "You see behind the paint now!" } }, // recap 1
    7: { adam: null, layla: { mood: "curious", message: "Psst - every door has a plaque..." } }, // learn: peek
    8: { adam: null, layla: { mood: "curious", message: "Lift every plaque - read the truth!" } }, // game: plaquePeek
    9: { adam: { mood: "thumbsup", message: "Quick - match sign to address!" }, layla: null }, // prove: speed
    10: { adam: { mood: "excited", message: "No plaque escapes that peek!" }, layla: null }, // recap 2
    11: { adam: { mood: "thinking", message: "His sticker sheet is out..." }, layla: null }, // learn: peel
    12: { adam: { mood: "curious", message: "Check the corners - peel the fakes!" }, layla: null }, // game: hookSort
    13: { adam: { mood: "worried", message: "He's fibbing about stickers - catch him!" }, layla: null }, // prove: lie
    14: { adam: null, layla: { mood: "excited", message: "Peel tested and PASSED!" } }, // recap 3
    15: { adam: null, layla: { mood: "thinking", message: "Clear glass... or frosted?" } }, // learn: glass
    16: { adam: null, layla: { mood: "curious", message: "Tap only what you can SEE through!" } }, // game: replyCards doors
    17: { adam: null, layla: { mood: "thumbsup", message: "Which door showed its address?" } }, // prove: recall
    18: { adam: { mood: "excited", message: "Frosted glass can't fool you!" }, layla: null }, // recap 4
    19: { adam: { mood: "thinking", message: "Unsure means DON'T. Always." }, layla: null }, // learn: barrier
    20: { adam: { mood: "curious", message: "Wheel that barrier - ask first!" }, layla: null }, // game: decide
    21: { adam: null, layla: { mood: "thumbsup", message: "Peek, stop, ask - in order!" } }, // prove: order
    22: { adam: null, layla: { mood: "excited", message: "All five powers - corridor time!" } }, // recap 5
    23: { adam: null, layla: { mood: "excited", message: "Safe door or trick door - you know!" } }, // consolidation
    24: { adam: { mood: "worried", message: "His paint shop - shut it down!" }, layla: null }, // boss
    25: { adam: { mood: "excited", message: "No bait taken - not today!" }, layla: null }, // outro video
    26: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "Stickers earned, Door Checker!" } }, // stickers
    28: { adam: null, layla: { mood: "thumbsup", message: "Door Checker badge earned!" } }, // completion
  },
};

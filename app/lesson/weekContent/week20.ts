import type { WeekContent } from "./types";

/**
 * Week 20 - Graduation Day: The Final Mission
 *
 * THE CAPSTONE - built to the locked template, with a twist the plan
 * locks in: NO new concepts. Five recombination missions where the
 * mechanics are REUSED knowingly - the child should RECOGNISE every
 * engine (that's the graduation feeling) - but every scene is new:
 *
 *   Opening video  -> alert -> mission brief
 *   5 MISSIONS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 VAULT    the password vault (W1+W4+W16)   | phishInspector  | lie
 *     2 FRIEND   the fake friend (W3+W6+W2)       | profileInspector| recall
 *     3 MONEY    the money trap (W7+W4+W16)       | popupPanic      | speed
 *     4 LEAK     the leak (W8+W12+W17)            | trailStamper    | recall
 *     5 BACKUP   the call for backup (W11+W19)    | stepOrder       | order
 *   Consolidation (cyberScanner, Highlight Reel skin) -> boss
 *   (placeholder quiz boss - the bespoke FINAL fight is designed with
 *   the boss batch) -> closing video -> debrief -> stickers -> completion.
 *
 * Engine recognition map: phishInspector returns from W4/W7 (13-week
 * gap) wearing W4's inspect zones; profileInspector returns from its
 * W3 debut (17-week gap) with its original Profile Detective dressing
 * kept ON PURPOSE - the returning title IS the recognition beat;
 * popupPanic returns from W7's Free-Coin Fakes (13-week gap);
 * trailStamper's third outing 5 weeks after W15's AI Garden; stepOrder
 * closes the course 7 weeks after W13, growing a fifth COACH step that
 * folds W19's role-flip into W11's protocol. The final Prove of the
 * course is the protocol put in order. Palette: heist-night storm
 * purple breaking into dawn gold.
 */
export const WEEK_20: WeekContent = {
  weekNumber: 20,
  title: "Graduation Day: The Final Mission",
  topic: "graduation",
  badgeName: "Certified Cyber Hero",
  badgeIcon: "🏆",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 20: GRADUATION DAY", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the final mission
    { type: "video", videoPlaceholder: "Week 20: The Final Mission", videoSrc: "/videos/module-20-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-20.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "Storm clouds over the city. Nineteen weeks of defeats have left the Raccoon exactly one plan: EVERYTHING, all at once, in one night. The fake reset envelope. The too-friendly buddy. The free-coin machines. The leak hunt. Every trick he owns, thrown in one last heist. Here's what he still hasn't understood: you've beaten every single one of these before. Tonight isn't a lesson - it's a graduation. Five final missions. Finish them, and at dawn you walk out CERTIFIED.",
      photoCaption: "Wk 20 - Graduation Day",
      ctaLabel: "Start the Mission →",
    },

    // 2 - Mission brief
    {
      type: "mission",
      objectives: [
        "Everything he's got - all at once",
        "You've done ALL of this before",
        "Finish it - and graduate",
      ],
    },

    /* ─────────── MISSION 1 · THE PASSWORD VAULT ─────────── */
    // 3 - Learn
    {
      type: "info",
      title: "Mission 1: The Password Vault",
      content:
        "It starts the way it always starts: an envelope. 'URGENT: reset your password NOW.' Feel that? You've stood here before. Week 4 taught you the four inspect zones - who sent it, where the door goes, what's the rush, what's the story. Week 16 taught you that a link is a door and this one has no plaque. And Week 1 built the vault it's trying to open. Same trick. Same tells. Same you - only nineteen weeks stronger. Inspect it, call it, hold the vault.",
      bullets: [
        "An 'urgent reset' envelope lands",
        "You KNOW this one - Week 4's zones",
        "Who sent it? Where's the door go?",
        "Real games never rush the reset",
        "Inspect, call it, hold the vault",
      ],
      bulletIcons: ["✉️", "🔍", "🆔", "🔔", "🔑"],
      emblem: "🔑",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] Graduation night. Mission one.",
          "An envelope, of course. 'URGENT! Reset your password!'",
          "[warmly] Feel that? You've stood right here before.",
          "Week four gave you the zones. Week one built the vault.",
          "Same trick. Same tells. Same you - nineteen weeks stronger.",
          "[excited] Inspect it and hold the vault. Go!",
        ],
      },
    },
    // 4 - Game: INSPECT (phishInspector returns from W4/W7 - the Vault Guard)
    {
      type: "phishInspector",
      introTitle: "The Vault Guard",
      introSubtitle: "Two envelopes at the vault door - one honest, one a crack attempt in a costume. Inspect all four zones on each, exactly like Week 4. The vault holds while you check!",
      zoneLabels: {
        sender: "Who wants your password?",
        link: "Where does the door really go?",
        urgency: "What's the rush?",
        claim: "What's the story?",
      },
      emails: [
        {
          id: "fake-reset",
          sender: "FastPlay Security <security@fastp1ay-verify.win>",
          subject: "URGENT!! Your password expires in 10 MINUTES",
          body: "Your FastPlay account will be DELETED FOREVER unless you reset your password RIGHT NOW. Tap reset-vault.win before the clock runs out!",
          isPhishing: true,
          inspections: {
            senderNote: "fastp1ay with a NUMBER one - a lookalike sender wearing the game's coat. The real game writes from the same address it always has.",
            senderIsRedFlag: true,
            linkText: "reset-vault.win",
            linkNote: "A no-plaque door (Week 16!) - the real game would say 'open the app and reset there', never 'walk through my strange door'.",
            linkIsRedFlag: true,
            urgencyNote: "Ten minutes, DELETED FOREVER - the panic clock. Real resets wait patiently for days.",
            urgencyIsRedFlag: true,
            claimNote: "Passwords don't 'expire in 10 minutes' - that story exists only to stop you thinking.",
            claimIsRedFlag: true,
          },
        },
        {
          id: "real-news",
          sender: "FastPlay Games <news@fastplay.com>",
          subject: "New racing season starts Saturday!",
          body: "Season 12 arrives this weekend with three new tracks. See you on the starting line! (No action needed - just racing news.)",
          isPhishing: false,
          inspections: {
            senderNote: "The game's usual address, spelled properly - the same one every real update has come from.",
            senderIsRedFlag: false,
            linkText: "(no link at all)",
            linkNote: "No door to walk through - it isn't asking you to go anywhere or tap anything.",
            linkIsRedFlag: false,
            urgencyNote: "No clock, no countdown - 'see you Saturday' is excitement, not panic.",
            urgencyIsRedFlag: false,
            claimNote: "New tracks on the weekend - a normal story that asks nothing of you. NO ACTION NEEDED says it all.",
            claimIsRedFlag: false,
          },
        },
      ],
      hints: {
        tier1: "Run the Week 4 drill: check all four zones before any verdict.",
        tier2: "A number hiding in the sender's name, a strange door, a panic clock - three tells is three too many.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The zones light up - just like Week four!",
          "Who sent it? Where's the door?",
          "What's the rush? What's the story?",
          "[whispers] Check all four... then make the call.",
        ],
      },
    },
    // 5 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "LAST CHANCE! Reset your password through MY special link in the next ten minutes, or your account is deleted FOREVER! Everyone knows resets work like that!",
      choices: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted for the final time - real resets never rush, and real doors have plaques. The vault holds. ✓",
      nudge: "Has anyone EVER really lost an account in ten minutes? And who WANTS you to panic?",
    },

    // 6 - Recap · Mission 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "The reset trick inspected zone by zone, the fake door refused - the vault held, just like Week 1 built it to.",
      next: "an old 'friend' from the lobby - Mission 2 is someone you've met before",
      emblem: "🔑",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Mission one - COMPLETE!",
          "The vault held. Of course it held.",
          "[whispers] But someone friendly is typing in the lobby...",
          "too friendly. Mission two. Come on.",
        ],
      },
    },

    /* ─────────── MISSION 2 · THE FAKE FRIEND ─────────── */
    // 7 - Learn
    {
      type: "info",
      title: "Mission 2: The Fake Friend",
      content:
        "Mission two slides into your lobby: 'Heyyy bestie! You're SO good at this game!' A brand-new buddy who moves fast. Week 3 handed you the magnifier for exactly this - when did they join, who are their friends, whose photo is that, why so friendly so fast? And Week 6 taught you the biggest tell of all: 'let's chat somewhere else instead'. The Profile Detective's magnifier is back in your hand - it never left. Check every clue, then make the call.",
      bullets: [
        "'Heyyy bestie!' - a brand-new buddy",
        "Week 3's magnifier is back",
        "Joined when? Friends with who?",
        "Whose photo is that really?",
        "'Chat somewhere else' = the flag",
      ],
      bulletIcons: ["💬", "🔍", "🆔", "🎭", "🚫"],
      emblem: "🎭",
      narration: {
        speaker: "layla",
        lines: [
          "[curious] Mission two just messaged you.",
          "'Heyyy bestie! You're SO good at this!'",
          "[whispers] A brand-new buddy... moving very fast.",
          "Week three gave you the magnifier for this.",
          "The Profile Detective rides again!",
          "[excited] Check every clue - then make the call!",
        ],
      },
    },
    // 8 - Game: INSPECT (profileInspector returns from W3 - the Profile Detective rides again)
    {
      type: "profileInspector",
      profiles: [
        {
          id: "buddy-blaze",
          handle: "Buddy_Blaze2000",
          avatar: "🎮",
          bio: "Heyyy bestie!! You're the BEST racer I've ever seen! How old are you? What school do you go to? Let's chat on ZapChat instead - it's way more fun there!",
          stats: [
            { label: "Joined", value: "YESTERDAY" },
            { label: "Friends", value: "0 you know" },
            { label: "Follows", value: "400 kids" },
          ],
          isFake: true,
          zones: [
            {
              id: "joined",
              label: "When did they join?",
              note: "Yesterday - and already your 'best friend'? Brand-new accounts that move this fast are wearing a costume.",
              isRedFlag: true,
            },
            {
              id: "friends",
              label: "Friends & follows",
              note: "Zero people you actually know, but following 400 kids - that's not a friend list, that's a fishing net.",
              isRedFlag: true,
            },
            {
              id: "photo",
              label: "Whose photo is that?",
              note: "That's a famous pro racer's picture, borrowed - Week 3's copied-photo tell, still working overtime.",
              isRedFlag: true,
            },
            {
              id: "asks",
              label: "What's it asking?",
              note: "Age, school AND 'chat somewhere else' in the first message - the Week 6 somewhere-else trick stapled to Week 2's never-share list.",
              isRedFlag: true,
            },
          ],
          verdictNote: "Every zone burned red: joined yesterday, borrowed face, fishing-net follows, and the somewhere-else move. FAKE - refused, reported, and not one fact given away.",
        },
        {
          id: "maya-draws",
          handle: "Maya_Draws",
          avatar: "🎨",
          bio: "Dragon drawings and kart racing on weekends! Zain's cousin - we met at field day. Rematch later? You totally won last time.",
          stats: [
            { label: "Joined", value: "2 YEARS AGO" },
            { label: "Friends", value: "Zain + 3 you know" },
            { label: "Posts", value: "Her own drawings" },
          ],
          isFake: false,
          zones: [
            {
              id: "joined",
              label: "When did they join?",
              note: "Two years of the same account, growing slowly - real people build profiles like tree rings.",
              isRedFlag: false,
            },
            {
              id: "friends",
              label: "Friends & follows",
              note: "Your cousin Zain and three kids you actually know - a real, checkable circle.",
              isRedFlag: false,
            },
            {
              id: "photo",
              label: "Whose photo is that?",
              note: "Her own drawings, posted for years - nobody borrows a gallery this consistent.",
              isRedFlag: false,
            },
            {
              id: "asks",
              label: "What's it asking?",
              note: "A rematch in the game you both already play - no personal questions, no somewhere-else, no rush.",
              isRedFlag: false,
            },
          ],
          verdictNote: "Real - and here's the hero move: you can ask Zain in REAL LIFE, 'is Maya your cousin?' Real people check out. THIS is what genuine looks like.",
        },
      ],
      hints: {
        tier1: "Run the Week 3 checks: joined when, friends with who, whose photo, asking what?",
        tier2: "Joined-yesterday + zero real friends + borrowed photo + 'chat somewhere else' = all four tells at once.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Two profiles on the desk!",
          "Magnifier out - all four clue zones each.",
          "[whispers] One's a costume. One's just Maya.",
          "The Detective knows the difference. Go!",
        ],
      },
    },
    // 9 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What was Buddy_Blaze's biggest red flag?",
      choices: [
        { text: "'Let's chat somewhere else instead'", isCorrect: true },
        { text: "Liking racing games", isCorrect: false },
        { text: "Playing on weekends", isCorrect: false },
        { text: "Having a nickname", isCorrect: false },
      ],
      praise: "The somewhere-else move - Week 6's flag, spotted in one second flat. ✓",
    },

    // 10 - Recap · Mission 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "The too-friendly buddy checked with Week 3's magnifier - borrowed photo, fishing-net follows, somewhere-else move: FAKE, and nothing given away.",
      next: "the arcade lights up with FREE - Mission 3 smells like Week 7",
      emblem: "🎭",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Mission two - COMPLETE!",
          "Costume pierced, nothing shared.",
          "[whispers] Hear that? The arcade just lit up...",
          "everything's suddenly FREE. Mission three.",
        ],
      },
    },

    /* ─────────── MISSION 3 · THE MONEY TRAP ─────────── */
    // 11 - Learn
    {
      type: "info",
      title: "Mission 3: The Money Trap",
      content:
        "Mission three is loud: FREE V-BUCKS! FREE SKINS! SCAN ME! PRIZE WINNER! Every machine in his midnight arcade is flashing the same magic word. You've smelled this before - Week 7 taught you free-coin machines eat accounts, Week 4 taught you the panic clock is the engine, and Week 16 taught you a QR is just a door wearing a dot-costume. The rule that beats them all still fits in one line: real free doesn't ask for anything back. Find every X. Feed them nothing.",
      bullets: [
        "The arcade flashes FREE, FREE, FREE",
        "Week 7: free-coin machines eat accounts",
        "Week 4: the countdown is the trick - rush = trap",
        "Week 16: a QR is a door - check it",
        "Real free asks for NOTHING back",
      ],
      bulletIcons: ["🎮", "🪤", "🔔", "🏷️", "✋"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[curious] Mission three is... loud.",
          "FREE V-BUCKS! FREE SKINS! SCAN ME!",
          "[whispers] You've smelled this arcade before. Week seven.",
          "Free-coin machines eat accounts for breakfast.",
          "[warmly] Real free asks for nothing back. Remember that.",
          "[excited] Find every X - feed them NOTHING!",
        ],
      },
    },
    // 12 - Game: ARCADE (popupPanic returns from W7 - the Midnight Arcade)
    {
      type: "popupPanic",
      introTitle: "The Midnight Arcade",
      introSubtitle: "His whole arcade at once - every machine flashing FREE. Find the little X on every pop-up, exactly like Week 7. The shiny button is NEVER the way out!",
      introIcon: "🪤",
      popups: [
        {
          id: "vbucks",
          title: "FREE 50,000 V-BUCKS!",
          body: "10 MINUTES ONLY! Tap CLAIM before the timer hits zero!",
          icon: "🎁",
          whyTrick: "Week 7's oldest machine: nobody hands out 50,000 of anything - and the timer exists so you tap before you think.",
        },
        {
          id: "qr-skins",
          title: "SCAN ME FOR FREE SKINS!",
          body: "One little QR scan and the skins are yours!",
          icon: "🏷️",
          whyTrick: "A QR is a door wearing a dot-costume (Week 16) - and this one has no plaque, no address, no way to check where it goes.",
        },
        {
          id: "millionth",
          title: "YOU'RE OUR 1,000,000th PLAYER!",
          body: "Congratulations! Claim your GRAND PRIZE now!",
          icon: "🎉",
          whyTrick: "You can't win a prize draw you never entered - Week 4's oldest bait with confetti stapled on.",
        },
        {
          id: "doubler",
          title: "COIN DOUBLER 3000!",
          body: "Just type your password and we'll DOUBLE your coins!",
          icon: "🔑",
          whyTrick: "Any machine that asks for your password IS the trap - it doesn't want to double your coins, it wants to BE you.",
        },
      ],
      hints: {
        tier1: "The shiny button is never the way out - hunt the little X in the corner. Can't find a real X? Close the whole app and tell a grown-up - that always works.",
        tier2: "Timers, prizes you never entered, password asks - every one is bait. X them all.",
        tier3: "Corner by corner: find the small gray X on each pop-up and tap ONLY that.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The whole arcade at once!",
          "Every machine flashing FREE...",
          "[whispers] and every CLAIM button is a mouth.",
          "Find the X. Feed them nothing. GO!",
        ],
      },
    },
    // 13 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick - which one is ALWAYS a trap?",
      speedMs: 5000,
      choices: [
        { text: "FREE coins for your password", isCorrect: true },
        { text: "A demo from the real store", isCorrect: false },
        { text: "A game you saved up for", isCorrect: false },
      ],
      praise: "Called at arcade speed - password-for-coins is the trap, every single time. ✓",
    },

    // 14 - Recap · Mission 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "The midnight arcade fed on nothing - free-coin machines, prize confetti and QR doors all X-ed shut, Week 7 style.",
      next: "he goes quiet and starts hunting for leaks - Mission 4 is about YOUR tracks",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Mission three - COMPLETE!",
          "The arcade starved. Not one tap.",
          "[whispers] So now he goes quiet... and starts reading tracks.",
          "Your tracks. Mission four - the leak hunt.",
        ],
      },
    },

    /* ─────────── MISSION 4 · THE LEAK ─────────── */
    // 15 - Learn
    {
      type: "info",
      title: "Mission 4: The Leak",
      content:
        "No flashing lights this time. Mission four is the quiet one: he's hunting for a leak - one draft with a find-me clue, one map pin, one open mirror, one old track he can still reach. You've swept this ground before: Week 8 taught you photos talk, Week 12 taught you tracks last, Week 17 taught you the highlighter and the frost. Walk your own trail one spot at a time and seal every leak - and remember the Week 12 twist: the proud tracks STAY. Posting isn't the danger. The clues are.",
      bullets: [
        "The quiet mission: a leak hunt",
        "One clue is all he needs",
        "Week 8: photos talk",
        "Week 12: tracks last - sweep the reachable",
        "Proud tracks STAY - clues get scrubbed",
      ],
      bulletIcons: ["🔍", "📍", "👀", "🌍", "🎨"],
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[whispers] Mission four has no flashing lights.",
          "He's gone quiet. Hunting for a leak.",
          "One clue. One pin. One open mirror.",
          "[warmly] You've swept this ground before - weeks eight, twelve, seventeen.",
          "And remember: proud tracks STAY.",
          "[excited] Walk your trail. Seal every leak!",
        ],
      },
    },
    // 16 - Game: BUILD (trailStamper's third outing - the Final Sweep)
    {
      type: "trailStamper",
      introTitle: "The Final Sweep",
      introSubtitle: "Five spots along tonight's trail - drafts, pins, mirrors and old tracks. Stamp the sealing move at each one. Proud tracks stay; clues get scrubbed!",
      introIcon: "🔍",
      meterLabel: "LEAK-FREE GLOW",
      stampToast: "LEAK SEALED!",
      wrongTitle: "That one leaks",
      completeTitle: "The trail is sealed!",
      completeLine: "Clues scrubbed, pins off, mirror frosted - and the dragon posted PROUDLY. That's the whole course in five stamps.",
      spots: [
        {
          id: "draft",
          prompt: "Your end-of-term draft says: 'Meet at the school gates at 3:15!' The highlighter glows red...",
          options: [
            {
              label: "Scrub the where-and-when, keep the joy",
              icon: "🔍",
              isProud: true,
              note: "",
            },
            {
              label: "Post it - term's ending, who cares!",
              icon: "🌍",
              isProud: false,
              note: "School gates plus a time is a find-me map (Week 17's exact lesson) - the excitement can post, the map can't.",
            },
          ],
        },
        {
          id: "pin",
          prompt: "The camera wants to stamp today's park photo with its location...",
          options: [
            {
              label: "Leave the map pin on - it's cool",
              icon: "📍",
              isProud: false,
              note: "A pin on a photo is a track that says WHERE YOU GO - Week 12's fix exists for exactly this switch.",
            },
            {
              label: "Location OFF before it posts",
              icon: "✋",
              isProud: true,
              note: "",
            },
          ],
        },
        {
          id: "mirror",
          prompt: "Your profile mirror is still set to EVERYONE from that one time...",
          options: [
            {
              label: "Frost it - friends only, padlock on",
              icon: "🔒",
              isProud: true,
              note: "",
            },
            {
              label: "Leave it open - more likes that way",
              icon: "👀",
              isProud: false,
              note: "An open mirror is the leak hunter's favorite window - Week 17's frost is armor, and it costs one flip.",
            },
          ],
        },
        {
          id: "dragon",
          prompt: "Your new dragon drawing is BRILLIANT - no school, no places, no names. Post it?",
          options: [
            {
              label: "Post it proudly!",
              icon: "🎨",
              isProud: true,
              note: "",
            },
            {
              label: "Never post anything, ever again",
              icon: "🚫",
              isProud: false,
              note: "Too far! The Week 12 twist: proud, clue-free tracks are the GOOD kind - posting isn't the danger, the clues are.",
            },
          ],
        },
        {
          id: "old-track",
          prompt: "An old comment of yours still shows your school's name - your copy can still be deleted...",
          options: [
            {
              label: "Leave it - nobody reads old stuff",
              icon: "🙈",
              isProud: false,
              note: "Old tracks are exactly what a leak hunter digs for - sweep every copy you can still reach (Week 12's broom).",
            },
            {
              label: "Sweep the reachable track",
              icon: "✅",
              isProud: true,
              note: "",
            },
          ],
        },
      ],
      hints: {
        tier1: "Ask each spot: does this help a stranger FIND you - or is it just proud, clue-free you?",
        tier2: "School names, times, map pins and open mirrors leak. Clue-free art is a track to keep.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Five spots on tonight's trail!",
          "Stamp the sealing move at each one.",
          "[whispers] And remember the twist...",
          "one of these tracks deserves to SHINE. Go!",
        ],
      },
    },
    // 17 - Prove: RECALL (quick-sort)
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which post was safe to share tonight?",
      choices: [
        { text: "The dragon drawing", isCorrect: true },
        { text: "'Meet at the school gates at 3:15'", isCorrect: false },
        { text: "The park photo with its map pin ON", isCorrect: false },
        { text: "The comment naming your school", isCorrect: false },
      ],
      praise: "The dragon - proud, brilliant and clue-free. Posting isn't the danger; clues are. ✓",
    },

    // 18 - Recap · Mission 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "The leak hunt found nothing: clues scrubbed, pin off, mirror frosted, old track swept - and the dragon posted proudly.",
      next: "his very last move - and the full protocol that answers it",
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Mission four - COMPLETE!",
          "He hunted all night and found... nothing.",
          "[whispers] So here it comes. His very last move.",
          "And you already know the answer to it. Mission five.",
        ],
      },
    },

    /* ─────────── MISSION 5 · THE CALL FOR BACKUP ─────────── */
    // 19 - Learn
    {
      type: "info",
      title: "Mission 5: The Call for Backup",
      // SAFETY FIX (screen audit): protocol order everywhere is
      // STOP → SCREENSHOT → BLOCK → TELL — freeze the proof BEFORE
      // blocking can make the message vanish. Also: name the threat
      // plainly ("land wrong" was adult idiom).
      content:
        "His last move isn't clever - it's just a MEAN, scary message, sent late at night, hoping you'll be frightened and all alone. But 'alone' stopped being true in Week 11. You have the protocol: STOP - don't reply, don't tap. SCREENSHOT the evidence FIRST, camera-not-bin. BLOCK the sender. TELL someone on your team. And now, because of Week 19, there's a fifth step only a graduate can do: COACH - show a family member the whole protocol, so the firewall outlives tonight. Run it one last time. Then pass it on.",
      bullets: [
        "His last move: a mean, scary message at midnight",
        "'Alone' stopped being true in Week 11",
        "STOP - SCREENSHOT - BLOCK - TELL",
        "Camera, not bin - freeze the proof FIRST",
        "Graduate's fifth step: COACH it onward",
      ],
      bulletIcons: ["✉️", "👪", "✋", "📋", "🥇"],
      emblem: "🥇",
      narration: {
        speaker: "adam",
        lines: [
          "[whispers] His last move isn't clever. Just mean.",
          "A scary message, sent at midnight.",
          "[warmly] But alone stopped being true in week eleven.",
          "Stop. Screenshot. Block. Tell.",
          "And tonight there's a fifth step - the graduate's step.",
          "[excited] Run the protocol one last time... then PASS IT ON!",
        ],
      },
    },
    // 20 - Game: ORDER (stepOrder closes the course - the Final Launchpad)
    {
      type: "stepOrder",
      introTitle: "The Final Launchpad",
      introSubtitle: "The protocol you've trained all course - plus the fifth step only graduates get. Stack the stages in order and launch the Raccoon out of the city for good!",
      introIcon: "🚀",
      steps: [
        {
          id: "stop",
          text: "STOP - don't reply, don't tap",
          icon: "✋",
          affirmation: "Stage one locked - his message gets NOTHING back.",
        },
        {
          id: "screenshot",
          text: "SCREENSHOT the evidence",
          icon: "📋",
          affirmation: "Stage two locked - camera, not bin. The proof is frozen BEFORE any door shuts.",
        },
        {
          id: "block",
          text: "BLOCK the sender",
          icon: "🚫",
          affirmation: "Stage three locked - the door slams in his mask.",
        },
        {
          id: "tell",
          text: "TELL someone on your team",
          icon: "👪",
          affirmation: "Stage four locked - you never carry it alone.",
        },
        {
          id: "coach",
          text: "COACH it - teach the protocol to your family",
          icon: "🥇",
          affirmation: "FIFTH STAGE LOCKED - the graduate's step. The firewall outlives tonight. LAUNCH!",
        },
      ],
      hints: {
        tier1: "Start the way every rescue starts: give the message NOTHING.",
        tier2: "Stop → screenshot → block → tell → and the graduate's step: coach it onward.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] The final launchpad!",
          "Four stages you know by heart...",
          "plus the fifth, for graduates only.",
          "[warmly] Stack them in order - and LAUNCH him out of the city!",
        ],
      },
    },
    // 21 - Prove: ORDER (the final Prove of the course)
    {
      type: "quickCheck",
      mode: "order",
      prompt: "The final Prove of the course: run the protocol!",
      choices: [
        { text: "STOP - give it nothing", isCorrect: true },
        { text: "SCREENSHOT the evidence", isCorrect: true },
        { text: "BLOCK the sender", isCorrect: true },
        { text: "TELL your team", isCorrect: true },
        { text: "COACH it onward - the graduate's step", isCorrect: true },
      ],
      praise: "Stop, screenshot, block, tell - and coach it onward. Perfect order, twenty weeks strong. Course PROVED. ✓",
    },

    // 22 - Recap · Mission 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "The protocol ran perfectly one last time - and gained its graduate's step: coach it onward, so the firewall outlives tonight.",
      next: "one last look back at everything - nineteen weeks in one reel, then the dawn",
      emblem: "🥇",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] ALL FIVE MISSIONS COMPLETE!",
          "The vault held, the costume fell, the arcade starved,",
          "the leak sealed... and the protocol launched.",
          "[warmly] The sky's getting lighter, Cyber Hero.",
          "[excited] One last reel before the dawn!",
        ],
      },
    },

    // 23 - Consolidation: the Highlight Reel (W1 scanner engine, whole-course content)
    {
      type: "cyberScanner",
      labels: {
        positive: "HERO MOVE",
        negative: "OLD TRAP",
        positiveHint: "Tap HERO MOVE for twenty weeks of true form",
        negativeHint: "Tap OLD TRAP for the tricks that never worked again",
        tipWhenPositive: "Random words, frosted mirrors, popped balloons, told grown-ups - the whole course glows in these.",
        tipWhenNegative: "Password shares, lobby overshares, free-coin taps, kept secrets - his whole playbook, retired tonight.",
        hint1: "Ask: is this one of your twenty-week powers... or one of his oldest tricks?",
        hint2: "HERO = check it, frost it, ask first, tell someone. TRAP = rush, share, tap, keep it secret.",
        hint2Example: "HERO: 'peeled the QR sticker first'   TRAP: 'typed the password for free coins'",
        hint3: "The graduate's card: strong and secret · check who's asking · real free asks nothing · clues stay scrubbed · never alone.",
        hint3Example: "Telling a grown-up the moment it lands wrong ✅    Racing a 10-minute panic clock ❌",
      },
      items: [
        {
          text: "Three random words guarding every account",
          isStrong: true,
          explanation: "Week 1's first power, still unbroken - long beats clever, and BananaRocketCloud beats everything.",
        },
        {
          text: "Telling a lobby 'friend' your school's name",
          isStrong: false,
          explanation: "The oldest give-away in the book - real info stays out of chat, whoever's asking (Weeks 2, 3 and 6).",
        },
        {
          text: "Peeling at the QR sticker before trusting the door",
          isStrong: true,
          explanation: "Week 16's peel test - printed-on codes check out, stickers over stickers come off in your hand.",
        },
        {
          text: "Tapping FREE V-BUCKS with 10 minutes on the clock",
          isStrong: false,
          explanation: "Week 7's hungriest machine plus Week 4's panic clock - the combo that never once paid out.",
        },
        {
          text: "Frosting the profile mirror - friends only",
          isStrong: true,
          explanation: "Week 17's one-flip armor: strangers see frost, friends see you.",
        },
        {
          text: "Keeping the scary message secret so nobody worries",
          isStrong: false,
          explanation: "The trap behind every trap - Week 11 and the golden patch both say it: tell, don't hide, and never alone.",
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] The Highlight Reel - twenty weeks in one walk! His reels were fake. This one is REAL - you lived every moment.",
          "Every moment you're about to stamp, you LIVED.",
          "HERO MOVE for your powers...",
          "[warmly] OLD TRAP for his retired playbook. One last time - stamp them all!",
        ],
      },
    },

    // 24 - BOSS BATTLE (placeholder quiz boss - the bespoke FINAL fight comes with the boss batch)
    { type: "bossBattle" },

    // 25 - CLOSING VIDEO: graduation day
    { type: "video", videoPlaceholder: "Week 20: Graduation Day", videoSrc: "/videos/module-20-outro.mp4" },

    // 26 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Final Mission Complete!",
      subtitle: "Five missions. Twenty weeks. One Certified Cyber Hero.",
      concepts: [
        { id: "vault", label: "Vault Holder", accent: "#ffd158", icon: "🔑", summary: "The reset trick inspected zone by zone, the fake door refused - the vault held." },
        { id: "friend", label: "Disguise Piercer", accent: "#7df0ff", icon: "🎭", summary: "Joined-yesterday, borrowed photo, 'chat somewhere else' - seen through in seconds." },
        { id: "money", label: "Trap Snapper", accent: "#7eff97", icon: "🪤", summary: "Free coins, prize confetti, sketchy QRs - the whole arcade fed on nothing." },
        { id: "leak", label: "Leak Sealer", accent: "#c084fc", icon: "🔍", summary: "Clues scrubbed, pins off, mirror frosted - and the dragon posted proudly." },
        { id: "backup", label: "Protocol Captain", accent: "#ff5fb3", icon: "🥇", summary: "Stop, screenshot, block, tell - and now you coach it onward too." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] FIVE MISSIONS. TWENTY WEEKS. Look at you!",
          "The vault held, the costume fell, the arcade starved,",
          "the leak sealed, the protocol launched...",
          "[laughs] and the Raccoon left town at sunrise.",
          "[warmly] One thing left, graduate. The stickers - then the stage.",
        ],
      },
    },

    // 27 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "vault-holder", name: "Vault Holder", icon: "🔑", description: "Held the vault through the final crack attempt - zones checked, door refused." },
        { id: "trap-snapper", name: "Trap Snapper", icon: "🪤", description: "Starved the whole midnight arcade - not one CLAIM button tapped." },
        { id: "certified-cyber-hero", name: "Certified Cyber Hero", icon: "🏆", description: "Twenty weeks. Every power. The city's newest certified defender." },
      ],
    },

    // 28 - Completion
    { type: "completion" },
  ],

  // The finale's attack theatre: his whole playbook at once - every name
  // deliberately echoes a week the child has beaten.
  bossAttacks: [
    { name: "THE FULL HEIST", icon: "💀", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Every trick at once", emblemColor: 0xc084fc },
    { name: "PANIC CLOCK", icon: "🔔", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Real life never rushes you", emblemColor: 0xff5fb3 },
    { name: "THE LAST DOOR", icon: "🚪", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "No plaque, no walk-through", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke FINAL fight - the dawn showdown -
  // is designed with the boss batch). Questions sweep the whole course.
  bossQuestions: {
    easy: [
      { question: "An 'URGENT - reset your password in 10 minutes!' message is...", answers: ["A trick - don't tap it", "Real - better reset fast, just to be safe", "From your best friend", "A prize"], correctIndex: 0, explanation: "The panic clock exists to stop you thinking - real games and banks never rush a reset." },
      { question: "A brand-new account says 'let's chat on a different app instead'. That's...", answers: ["The somewhere-else trick - refuse and tell", "Fine - as long as you know the other app", "Totally normal", "A reward"], correctIndex: 0, explanation: "Moving you somewhere quieter is Week 6's oldest flag - real friends are happy where you are." },
      { question: "A machine offers FREE coins if you type your password. You...", answers: ["Never - walk away", "Only if the coins show up first", "Type it fast", "Share it with the lobby"], correctIndex: 0, explanation: "Any ask for your password IS the trap - it wants to BE you, and real free asks for nothing back." },
    ],
    medium: [
      { question: "Which of tonight's posts was safe to share?", answers: ["The dragon drawing", "The school-gates meetup time", "The map-pinned park photo", "The school-name comment"], correctIndex: 0, explanation: "Posting isn't the danger, clues are - proud and clue-free tracks are the good kind." },
      { question: "The full protocol, in order, is...", answers: ["Stop → screenshot → block → tell", "Stop → block → screenshot → tell", "Tap → panic → hide → forget", "Share → like → follow → wave"], correctIndex: 0, explanation: "Give it nothing, freeze the evidence FIRST - blocking can make the message vanish - then slam the door and never carry it alone." },
      { question: "How do you check where a QR code or link-door really goes?", answers: ["Lift the plaque - check the real address before walking through", "Read the words on the sign carefully", "Trust the pretty sign", "Scan it quickly"], correctIndex: 0, explanation: "A link is a door - Week 16's rule holds forever: words can be paint, so no plaque, no walk-through." },
    ],
    hard: [
      { question: "The fake reset email had fastp1ay with a number 1 in the sender. Why does that matter?", answers: ["Lookalike senders wear a real name's costume - one swapped letter is the tell", "It only matters if the link looks strange too", "It loads faster", "It doesn't"], correctIndex: 0, explanation: "Week 4's lookalike lineup: the costume is one character deep, and checking the sender unmasks it." },
      { question: "What makes COACH the graduate's fifth protocol step?", answers: ["Teaching your family makes the firewall outlive tonight", "It replaces TELL once you've graduated", "Graduates skip the other four", "It isn't a real step"], correctIndex: 0, explanation: "Week 19's role-flip folded into Week 11's protocol - powers shared are powers doubled." },
      { question: "Why did Buddy_Blaze2000 fail the Profile Detective's check?", answers: ["Joined yesterday + borrowed photo + fishing-net follows + somewhere-else move", "He asked for a rematch too fast", "Too good at racing", "Online at night"], correctIndex: 0, explanation: "All four Week 3 tells at once - real profiles grow like tree rings, costumes appear overnight. (A rematch in a game you both play is what REAL looks like - Maya asked for one!)" },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.
  reactions: {
    0: { adam: { mood: "excited", message: "The FINAL mission - graduation day!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Everything he's got... all at once." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "You've done ALL of this before. Finish it." } }, // mission brief
    3: { adam: null, layla: { mood: "thinking", message: "Mission one - you know this envelope." } }, // learn: vault
    4: { adam: null, layla: { mood: "curious", message: "Four zones - just like Week 4!" } }, // game: phishInspector
    5: { adam: { mood: "thumbsup", message: "Catch his last reset fib!" }, layla: null }, // prove: lie
    6: { adam: { mood: "excited", message: "Mission one complete - the vault held!" }, layla: null }, // recap 1
    7: { adam: { mood: "thinking", message: "A too-friendly buddy... check the clues." }, layla: null }, // learn: friend
    8: { adam: { mood: "curious", message: "The Profile Detective rides again!" }, layla: null }, // game: profileInspector
    9: { adam: null, layla: { mood: "thumbsup", message: "Which flag was the big one?" } }, // prove: recall
    10: { adam: null, layla: { mood: "excited", message: "Mission two - costume pierced!" } }, // recap 2
    11: { adam: null, layla: { mood: "thinking", message: "The arcade's flashing FREE again..." } }, // learn: money
    12: { adam: null, layla: { mood: "curious", message: "Find every X - feed them nothing!" } }, // game: popupPanic
    13: { adam: { mood: "thumbsup", message: "Quick - the always-a-trap one!" }, layla: null }, // prove: speed
    14: { adam: { mood: "excited", message: "Mission three - the arcade starved!" }, layla: null }, // recap 3
    15: { adam: { mood: "thinking", message: "The quiet mission. He's hunting leaks." }, layla: null }, // learn: leak
    16: { adam: { mood: "curious", message: "Seal every leak - the dragon stays!" }, layla: null }, // game: trailStamper
    17: { adam: null, layla: { mood: "thumbsup", message: "Which track was safe to share?" } }, // prove: recall
    18: { adam: null, layla: { mood: "excited", message: "Mission four - he found NOTHING!" } }, // recap 4
    19: { adam: null, layla: { mood: "thinking", message: "His last move. You know the answer." } }, // learn: backup
    20: { adam: null, layla: { mood: "curious", message: "Five stages - stack and LAUNCH!" } }, // game: stepOrder
    21: { adam: { mood: "thumbsup", message: "The final Prove - run the protocol!" }, layla: null }, // prove: order
    22: { adam: { mood: "excited", message: "ALL FIVE MISSIONS COMPLETE!" }, layla: null }, // recap 5
    23: { adam: { mood: "excited", message: "The Highlight Reel - one last walk!" }, layla: null }, // consolidation
    24: { adam: { mood: "worried", message: "The dawn showdown - finish it!" }, layla: null }, // boss
    25: { adam: null, layla: { mood: "excited", message: "Sunrise. He's GONE. You did it!" } }, // outro video
    26: { adam: null, layla: { mood: "thumbsup", message: "Five missions. Twenty weeks. Look at you!" } }, // debrief
    27: { adam: null, layla: { mood: "excited", message: "The graduate's stickers!" } }, // stickers
    28: { adam: { mood: "excited", message: "CERTIFIED CYBER HERO - you graduated!" }, layla: null }, // completion
  },
};

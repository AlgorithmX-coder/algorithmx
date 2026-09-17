import type { CutsceneSlide } from "@/app/components/StoryCutscene";

export interface WeekContent {
  weekNumber: number;
  title: string;
  topic: string;
  badgeName: string;
  badgeIcon: string;
  /**
   * Bespoke badge artwork for the victory scene (PILOT FEEDBACK: badges
   * designed creatively per week, not the generic gold shield). Path
   * under public/, e.g. /cyberheroes/badges/week-03-mask-spotter.png.
   * Omitted = the default shield mark.
   */
  badgeArt?: string;

  introCutscene: CutsceneSlide[];

  screens: ScreenDef[];

  bossQuestions: {
    easy: BossQuestion[];
    medium: BossQuestion[];
    hard: BossQuestion[];
  };

  /**
   * Multi-phase boss support (Week 1+). When present, supersedes
   * `bossQuestions` for the boss render: BossBattle organises the
   * fight as N labelled acts (Strength / Secrecy / Uniqueness /
   * Phishing / Final Showdown) with phase-change announcements + a
   * persistent phase badge in the HUD + per-phase result tracking
   * persisted to QuestionResponse + analytics.
   *
   * Phase shape mirrors the BossPhase union in
   * `app/components/game/BossBattle.tsx`. Only the "mcq" kind is
   * implemented today; the other kinds (miniHospital, miniRescue,
   * miniInspector) are reserved for the upcoming mini-mechanic phases.
   */
  bossPhases?: BossPhaseDef[];

  /** THE STANDARD QUIZ BOSS (the week-ending test for all 20 weeks). When
   *  present, QuizBoss.tsx renders as the week's boss in preference to every
   *  bespoke boss above; the data is fully generic (see BossQuizDef). */
  bossQuiz?: BossQuizDef;

  /**
   * Week-themed boss attack theatre (name/icon/tag per telegraphed
   * attack, cycled per question). Omitted = BossBattle's Week 1 set.
   * Keeps the fight's vocabulary inside the week's curriculum lane.
   */
  bossAttacks?: {
    name: string;
    icon: string;
    color: string;
    glow: string;
    tag: string;
    emblemColor: number;
  }[];

  /**
   * Per-screen character reactions (by screen index). Either character can be
   * null for that screen - the other will use their idle pose.
   */
  reactions: Record<
    number,
    {
      adam: { mood: string; message: string } | null;
      layla: { mood: string; message: string } | null;
    }
  >;
}

/** Phase definition shape used by week-content data files. Mirrors
 *  the BossPhase union exported from BossBattle. */
export type BossPhaseDef = {
  kind: "mcq";
  id: string;
  label: string;
  announceText: string;
  announceTone: "blue" | "red" | "gold" | "cyan";
  questions: {
    question: string;
    answers: string[];
    correctIndex: number;
    explanation?: string;
    key?: string;
  }[];
  /**
   * Profile Forge chrome (Week 2 BUILD-FINAL). Mirrors the forge field
   * on BossBattle's BossPhase: the profile card stamps `entry` when the
   * phase is beaten, `probe`/`foiled` are the Raccoon's lines.
   */
  forge?: {
    fieldLabel: string;
    entry: string;
    probe: string;
    foiled: string;
  };
};

export interface BossQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
}

/* ──────────────── QUIZ BOSS (the standard week-ending test) ────────────────
   Data shapes for QuizBoss.tsx. Every week authors ONLY this data; the
   component is fully generic. Every spoken line is a {slug, text}: the slug
   names the recorded villain clip at /audio/villain/{slug}.mp3; until it
   exists the text stands in, and the text is ALWAYS mirrored on screen so the
   quiz plays fully muted. */

/** One spoken line: a stable slug (recorded-clip key) plus the on-screen text,
 *  which is always shown so the quiz reads fully with sound off. */
export interface BossQuizVoiceLine {
  slug: string;
  text: string;
}

/** One quiz-boss question: a spoken apply-the-skill scenario with 2-4 big
 *  tappable answers. Exactly one option is correct (correctIndex, in AUTHORED
 *  order; display order is shuffled per attempt). A wrong answer shows the ONE
 *  kind teach line, then the same question re-asks; nothing fails the kid out. */
export interface BossQuizQuestion {
  /** Stable phase id for dashboards/analytics, e.g. "phase-what". */
  phaseId: string;
  /** Stable base answer key, e.g. "quiz-what"; attempts report as `{key}-a{n}`. */
  key: string;
  /** Short concept label for the per-phase results, e.g. "Long Is Strong". */
  label: string;
  /** The scenario: spoken by the villain host AND shown as text. */
  ask: BossQuizVoiceLine;
  /** 2-4 short, picture-friendly answers (optional PixIcon emoji). */
  options: { text: string; icon?: string }[];
  /** Index of the correct option in the AUTHORED options array. */
  correctIndex: number;
  /** The ONE kind teach line shown for any wrong pick. */
  teachOnWrong: { title: string; explanation: string };
  /** His comic "ow" when the kid is RIGHT (distinct per question). */
  villainRight?: BossQuizVoiceLine;
  /** His comic gloat when the kid is WRONG (distinct per question). */
  villainWrong?: BossQuizVoiceLine;
}

/** The whole quiz boss for one week: one intro taunt, one question per taught
 *  concept (5 on the standard template), one victory payoff. */
export interface BossQuizDef {
  /** The host. `sprite` keys into bossArena's sprite maps; only "raccoon"
   *  exists today and it is the default. */
  villain: { name: string; sprite?: "raccoon" };
  /** Week theme accent, 6-digit hex. Omitted = the W1 gold "#e3b341". */
  accent?: string;
  /** Per-week intro theme so every week looks like its own topic. */
  theme?: { topic: string; motifs: string[] };
  /** Correct answers needed to beat the boss. Default 10 (of 15); Week 20's
   *  cumulative graduation final uses a higher bar. */
  passMark?: number;
  /** One spoken taunt that opens the fight. */
  intro: BossQuizVoiceLine;
  /** One spoken payoff line when he is beaten. */
  victory: BossQuizVoiceLine;
  /** The questions, asked in order: one per taught concept. */
  questions: BossQuizQuestion[];
}

export interface WeekIntroContent {
  /** Big title, e.g. "Passwords: The Secret Code". */
  title: string;
  /** One friendly line under the title. */
  tagline: string;
  /** Path to the ATLAS narration mp3, e.g. "/audio/atlas/heroes-week-01.mp3". */
  audioSrc: string;
  /** Per-week accent colour (hex). Defaults to cyan. */
  accent?: string;
  /** Up to three "what we'll do" chips (mapped emoji + short label). */
  points?: { icon: string; label: string }[];
  /** Commander label under the player. Defaults to "MISSION COMMAND". */
  commanderName?: string;
}

/**
 * A single lesson screen. The rendering logic in `app/lesson/[week]/page.tsx`
 * switches on `type` to mount the right component with the right data.
 */
export type ScreenDef = (
  // `videoSrc` is the path to a real playable file (e.g.
  // "/videos/module-01-intro.mp4"). When present the lesson renders an
  // actual <video> player; when omitted it falls back to the decorative
  // placeholder play button (used for weeks whose video isn't filmed yet).
  | { type: "video"; videoPlaceholder: string; videoSrc?: string }
  | ({ type: "weekIntro" } & WeekIntroContent)
  | {
      /**
       * A week's bespoke SIGNATURE mini-game — one distinctive activity unique
       * to that week (like the bosses are bespoke). `mechanic` keys into the
       * SIGNATURE component registry (app/components/exercises/signatures).
       */
      type: "signature";
      mechanic: string;
      title?: string;
      /** Spoken "here's what to do" intro (Sarah), read aloud in the game's intro. */
      narration?: { speaker?: "adam" | "layla"; lines: string[] };
      /**
       * Spoken closing payoff (Sarah), read aloud on the game's WIN screen:
       * "well done, now you can fact-check, carry this to the real world."
       * Part of the Learn Loop's "You're protected" beat, on the game itself.
       */
      winNarration?: { speaker?: "adam" | "layla"; lines: string[] };
      /**
       * Optional first-round WALKTHROUGH (Sarah), used by signature games that
       * support a guided first round with on-screen arrows: `claim` is spoken
       * when the first claim needs tapping, `evidence` when the child must then
       * pick a proof (currently the Proof Scale, W15).
       */
      guide?: { speaker?: "adam" | "layla"; claim: string; evidence: string };
    }
  | { type: "mission"; objectives: string[] }
  | {
      /**
       * The Raccoon's "spot the danger" beat — one per skill, shown right
       * before that skill's game. He reveals the trick he's about to try, in
       * kid words, so the child knows exactly what they're defending against
       * (the "why" that turns the game into a mission). Part of the Learn Loop:
       * Learn → Spot the danger → Your turn → Prove it → You're protected.
       */
      type: "threat";
      /** The Raccoon's trick, shown large in his speech bubble. Kid language. */
      raccoonLine: string;
      /** Small label above the bubble (defaults to "The Raccoon's Trick"). */
      title?: string;
      /**
       * Spoken setup by Sarah (read aloud) that frames the danger and names
       * the child's job. Short lines (≤ 12 words), plain 6–9-year-old words.
       */
      narration?: { speaker?: "adam" | "layla"; lines: string[] };
    }
  | {
      /** Post-intro "incident report" reveal with the week's topic image. */
      type: "alert";
      /** Per-week scene image shown in the polaroid (e.g. /cyberheroes/alerts/week-01.png). */
      photoSrc?: string;
      title?: string;
      badge?: string;
      caption?: string;
      /** Handwritten note on the polaroid frame (defaults to the Week 1 note). */
      photoCaption?: string;
      ctaLabel?: string;
    }
  | {
      type: "info";
      title: string;
      content: string;
      bullets?: string[];
      /** Optional per-bullet topic icon (emoji), shown in a badge on each row. */
      bulletIcons?: string[];
      /** Optional header emblem glyph for this concept (defaults to 🔒). */
      emblem?: string;
      /**
       * Optional Adam/Layla narration. Each line is read aloud in order
       * by the InfoNarration block on the info screen. Lines should be
       * short (≤ 12 words) and use plain language a 6–9 year old can
       * follow.
       */
      narration?: { speaker?: "adam" | "layla"; lines: string[] };
    }
  | {
      type: "cyberScanner";
      items: { text: string; isStrong: boolean; explanation: string; why?: string }[];
      /**
       * Re-theme the scanner's copy (verdict buttons, how-to rows, tips,
       * tiered hints). Omitted = Week 1's STRONG/WEAK password drill.
       * Mirrors CyberScannerLabels in CyberScanner.tsx.
       */
      labels?: {
        positive: string;
        negative: string;
        positiveHint: string;
        negativeHint: string;
        tipWhenPositive: string;
        tipWhenNegative: string;
        hint1: string;
        hint2: string;
        hint2Example: string;
        hint3: string;
        hint3Example: string;
      };
    }
  | {
      type: "protectTheData";
      items: { text: string; isPrivate: boolean }[];
    }
  | { type: "passwordLab" }
  | { type: "crackTheCode" }
  | {
      /**
       * QuickCheck - the short "Prove it" beat that closes each concept
       * loop. One question, no hints, an instant win. Five flavours via
       * `mode` so five in a row never feel the same:
       *   finish - complete the rule ("Keep it ___")
       *   speed  - beat the urgency bar (never hard-fails)
       *   lie    - catch the Raccoon's claim (TRUE / FALSE)
       *   recall - one-tap "which?"
       *   order  - PUT-IN-ORDER: tap the step tiles in sequence. In this
       *            mode the AUTHORED array order of `choices` is the
       *            correct sequence (isCorrect is ignored); the component
       *            shuffles them for display.
       */
      type: "quickCheck";
      mode: "finish" | "speed" | "lie" | "recall" | "order";
      prompt: string;
      /**
       * `why` (owner 2026-09-12, spoken verdicts): Sarah's reason for THIS
       * choice. Wrong choice = "Not quite." + why it is wrong (no giveaway).
       * Correct choice = "That's right!" + why, used only when there is no
       * teachNarration. Ignored in `order` mode (the nudge speaks instead).
       */
      choices: { text: string; isCorrect: boolean; why?: string }[];
      /** `lie` mode: the Raccoon's bogus claim shown in his speech bubble. */
      raccoonLine?: string;
      praise?: string;
      nudge?: string;
      /** `speed` mode urgency window (ms). Cosmetic. */
      speedMs?: number;
      /**
       * Optional spoken teacher explanation (Sarah), read aloud when the child
       * answers CORRECTLY — a real "here's WHY that's right, and why it helps
       * you" moment instead of a silent tick. When present, the beat waits on a
       * "Got it!" button instead of auto-advancing, so the child hears it out.
       */
      teachNarration?: { speaker?: "adam" | "layla"; lines: string[] };
    }
  | {
      /**
       * Password Vault - the flagship first-person guided scene.
       *
       * A cinematic vault door with 5 glowing locks. The child taps a
       * lock, the camera pans/zooms to it, and a focused 2D challenge
       * panel appears overlaid on the scene. Each lock teaches one of
       * the 5 password rules:
       *
       *   1. length
       *   2. mix of characters
       *   3. no personal info
       *   4. not common / guessable
       *   5. unique / secret
       *
       * Wrong answers pause + teach via WrongAnswerPanel. Correct
       * answers activate the lock with a juicy animation. All 5
       * active → the vault door opens with a premium light burst +
       * confetti, then onComplete fires.
       *
       * This is the reusable scene template for Phish Inspector,
       * Account Rescue and BossBattle scene work in future weeks -
       * the hotspot + 2D-overlay-panel + camera-pan pattern is the
       * commercial-quality pattern this exercise proves out.
       */
      type: "passwordVault";
      /** Visual skin: the W1 holographic vault (default) or W4's "Hall of
       *  Mirrors" (magenta palette, mirror copy). */
      skin?: "vault" | "mirrors" | "warehouse";
      /** Learn-Loop copy (Week 4). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Big title on the final reveal ("VAULT MASTER!"). */
      masterTitle?: string;
      /** The continue button on the final reveal ("Claim your secrets"). */
      claimLabel?: string;
      /** Noun for the hotspots in the status copy ("lock" / "mirror"). */
      hotspotNoun?: string;
      locks: {
        /** Stable id used in QuestionResponse keys (e.g. "length"). */
        id: string;
        /** Short uppercase label shown on/under the lock ("LENGTH"). */
        ruleLabel: string;
        /** Emoji / glyph rendered inside the lock face. */
        icon: string;
        /** The challenge prompt shown when the lock is focused. */
        prompt: string;
        /** Multiple-choice answers; exactly one must have isCorrect. */
        choices: {
          text: string;
          isCorrect: boolean;
          /** Shown in the WrongAnswerPanel when the child picks this. */
          explanation: string;
          /** Sarah's reason on the correct pick ("That's right!" + why). */
          why?: string;
        }[];
        /** Optional speaker hint for the WrongAnswerPanel ("layla"|"adam"). */
        speaker?: "adam" | "layla";
        /** Sarah reads this as the hotspot opens (one clip). Never spells an
         *  address: the on-screen prompt carries the code-like text. */
        readAloud?: string;
        /** The recap tile text in the final reveal (defaults to the W1 map). */
        recap?: string;
      }[];
      /** Optional Adam/Layla guidance ribbon copy keyed by state. */
      guidance?: {
        intro?: string;
        progress?: string;
        complete?: string;
      };
    }
  | {
      type: "conveyorBelt";
      items: { text: string; category: "strong" | "weak" }[];
    }
  | {
      /**
       * Week 1's reworked sorter. Instead of classifying strong vs weak
       * (already covered by CyberScanner), the child names *why* a weak
       * password is weak by tapping one of 4 reason buttons.
       *
       * `reasons` is a stable, ordered list of all reason ids the
       * exercise can present as buttons. `items` reference those ids by
       * `reasonId`.
       *
       * `hints[1|2|3]` is the tiered hint copy shown after 1/2/3 wrong
       * answers within this screen.
       */
      type: "weakSorter";
      reasons: { id: string; label: string; example: string }[];
      items: {
        text: string;
        reasonId: string;
        /** Other reasons that are also honestly right (e.g. "123" is too short AND a keyboard run). */
        alsoAccept?: string[];
        /** Sentence shown in the WrongAnswerPanel when the child mis-sorts this item. */
        explanation: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
      }[];
      hints?: { tier1: string; tier2: string; tier3: string };
    }
  | {
      /**
       * Phish Inspector. The deliberate counterpart to SpamBlaster's
       * reaction-speed shooter: an email opens with 4 inspect zones
       * the child must tap (Who sent it / What's the link / How does
       * it sound / What's it promising). Each tap reveals a red flag
       * or green check + a kid-friendly explanation. ZAP and SAFE
       * decision buttons unlock only after all 4 zones are inspected.
       *
       * Teaches the mental model of phishing literacy: don't react,
       * inspect first. Pedagogically the cleanest counter to "all
       * scary pop-ups, all the time" because it tells the child what
       * to LOOK AT.
       */
      type: "phishInspector";
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Learn-Loop copy (Week 4 "The Barker's Booth"): the header label above
       *  the message, the two verdict buttons, their toasts, and the beats. */
      headerLabel?: string;
      zapLabel?: string;
      safeLabel?: string;
      zapToast?: string;
      safeToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      /** Zone label overrides (re-theme the 4 inspect zones). */
      zoneLabels?: Partial<Record<"sender" | "link" | "urgency" | "claim", string>>;
      /** The sub-line under each closed zone ("Check the sender"). */
      zoneQuestions?: Partial<Record<"sender" | "link" | "urgency" | "claim", string>>;
      emails: {
        id: string;
        sender: string;
        subject: string;
        body: string;
        isPhishing: boolean;
        /** Sarah reads the message as it opens (one clip; Learn-Loop weeks). */
        readAloud?: string;
        /** Sarah's reason on a correct verdict ("That's right!" + why). */
        why?: string;
        /** The wrong-answer panel's explanation for this message (falls back
         *  to the engine's generic line). */
        whyWrong?: string;
        inspections: {
          senderNote: string;
          senderIsRedFlag: boolean;
          linkText: string;
          linkNote: string;
          linkIsRedFlag: boolean;
          urgencyNote: string;
          urgencyIsRedFlag: boolean;
          claimNote: string;
          claimIsRedFlag: boolean;
        };
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Mission Debrief. Final-act recap that consolidates the lesson
       * by CONCEPT instead of by screen. Four cards
       * (Strength / Secrecy / Uniqueness / Phishing) light up in
       * sequence with optional Layla narration. Receives no stat data
       * yet - that comes in a follow-up Prisma migration. For now the
       * cards just celebrate "you learned X" with a fixed line per
       * concept.
       */
      type: "missionDebrief";
      title: string;
      subtitle?: string;
      concepts: {
        id: string;
        label: string;
        accent: string; // hex
        icon: string;
        summary: string;
      }[];
      narration?: { speaker?: "adam" | "layla"; lines: string[] };
    }
  | {
      /**
       * Sticker Unlock screen. Fires the reward-loop celebration when
       * the lesson is completed. Stickers are persisted server-side
       * (EarnedSticker table) by the parent renderer; this component
       * just shows the animated reveal and a "View HQ" CTA.
       */
      type: "stickerUnlock";
      title: string;
      stickers: {
        id: string;
        name: string;
        icon: string;
        /** Tagline shown under the sticker. */
        description: string;
      }[];
    }
  | {
      /**
       * Pop-up Panic. A sequence of scary fake pop-ups; the child has
       * to find and tap the X (close) button on each, NOT the tempting
       * OK button. Teaches the "close it and tell a grown-up" instinct
       * - a phishing-adjacent skill the current build under-teaches.
       *
       * Curriculum-clean: each popup uses bait patterns already taught
       * on the Phishing teaching screen (free prize / urgent threat /
       * scary countdown / unknown sender claim).
       */
      type: "popupPanic";
      /** Visual skin: scary browser pop-ups (default) or W3 chat requests
       *  judged RED FLAG / FRIENDLY on two identical, side-swapping buttons. */
      skin?: "popup" | "request";
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      popups: {
        /** Stable id e.g. "pop-1". */
        id: string;
        /** Headline shown big in the popup (request skin: small eyebrow under the name). */
        title: string;
        /** Optional supporting line under the headline (request skin: the message, read aloud). */
        body?: string;
        /** Emoji that prefixes the title for visual flavour (request skin: the sender's avatar). */
        icon?: string;
        /** Why this popup is a trick / why the ask is fine - Sarah reads it after a correct call
         *  and the wrong-answer panel shows it after a wrong one. */
        whyTrick: string;
        /** Request skin: false = a fine, friendly ask (default true = red flag). */
        isRedFlag?: boolean;
        /** Request skin: who the request is from. */
        from?: string;
      }[];
      /** Board copy (request skin re-theme). */
      headerLabel?: string;
      boardPrompt?: string;
      flagLabel?: string;
      fineLabel?: string;
      flagToast?: string;
      fineToast?: string;
      wrongTitle?: string;
      wrongTip?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string; tier3: string };
    }
  | {
      /**
       * Three Random Words Builder. The child picks 3 unrelated nouns
       * from a wall to form a memorable strong passphrase, watching a
       * strength meter rise. Demonstrates the NCSC "three random
       * words" approach: length beats complexity, and you can keep
       * passwords memorable without sacrificing strength.
       *
       * Categories on the words are used to surface a small bonus
       * when the child picks 3 different categories (encourages
       * variety without forcing it).
       */
      type: "threeRandomWords";
      /** Word bank. 24-30 entries recommended. */
      words: {
        id: string;
        text: string;
        category: "animal" | "object" | "place" | "food";
      }[];
      /** Number of words to pick. Default 3. */
      slots?: number;
      hints?: { tier1: string; tier2: string };
      /** Sarah's reason on a RIGHT answer ("That's right!" + why). */
      whyRight?: string;
      /** Spoken, paced intro that explains the task before play (read aloud). */
      narration?: { speaker?: "adam" | "layla"; lines: string[] };
    }
  | {
      /**
       * Account Rescue Mission. Three account tiles share the same
       * leaked password (the Raccoon hit one of them). The child taps
       * each account and assigns a new password from a shared bank.
       * The constraint: every account must end up with a DIFFERENT
       * new password. Practical uniqueness drill.
       */
      type: "accountRescue";
      /** Visual skin: W1 account rescue (default) or W5 "moves" (chat moments
       *  on tiles, hero moves in the bank, every moment its OWN move). */
      skin?: "rescue" | "moves";
      /** The shared starter password all accounts initially use (rescue skin). */
      sharedPassword?: string;
      /** Which account the Raccoon compromised (rescue: LEAKED chip; moves:
       *  the tile that pulses `needsLabel`). */
      leakedAccountId?: string;
      accounts: {
        id: string;
        /** Display name e.g. "Roblox", or the chat moment in the moves skin. */
        label: string;
        /** Optional emoji icon. */
        icon?: string;
        /** Sarah reads the moment when its tile becomes active. */
        readAloud?: string;
        /** The one bank item that fits this moment; other picks teach. */
        correctMoveId?: string;
        /** Sarah's reason on the right pick ("That's right!" + why). */
        why?: string;
        /** WrongAnswerPanel copy on a wrong pick ("Not quite." + whyWrong). */
        whyWrong?: string;
      }[];
      /** Bank of strong replacement passwords (or hero moves). Need >= accounts.length. */
      passwordBank: {
        id: string;
        /** The password text shown on the chip. */
        text: string;
        /** Optional PixIcon emoji before the text (moves skin). Keep uniform. */
        icon?: string;
      }[];
      hints?: { tier1: string; tier2: string };
      /** Copy overrides (moves skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      headerLabel?: string;
      storyLine?: string;
      needsLabel?: string;
      bankPrompt?: string;
      bankIdle?: string;
      finishLabel?: string;
      finishReadyLabel?: string;
      securedLabel?: string;
      pickToast?: string;
      allToast?: string;
      completeTitle?: string;
      completeLine?: string;
      wrongTitle?: string;
    }
  | {
      /**
       * Don't Feed the Fire (Week 5, "don't fight back"). The HOLD drill and
       * the week's own signature, moved behind the lesson that teaches its
       * move. Mean-message sparks land beside a campfire, each with a big
       * REPLY button; the hero move is to press and HOLD the cool river stone
       * until the spark starves. The last round flips the verb: a friend is
       * picked on and the right move is to tap STAND UP. Nothing is timed,
       * nothing fails; a REPLY tap teaches and the spark waits.
       */
      type: "dontFeedTheFire";
      sparks: {
        id: string;
        from: string;
        text: string;
        /** Sarah reads the spark as it lands (framed, e.g. "A spark lands. It says: ..."). */
        readAloud?: string;
        /** Sarah's reason when the spark is starved ("That's right!" + why). */
        why?: string;
      }[];
      friendRound: {
        id: string;
        from: string;
        text: string;
        readAloud?: string;
        why?: string;
      };
      /** WrongAnswerPanel copy: REPLY tapped on a spark. */
      teachSpark: { title: string; body: string; tip: string };
      /** WrongAnswerPanel copy: REPLY tapped on the friend round. */
      teachFriend: { title: string; body: string; tip: string };
      /** WrongAnswerPanel copy: the stone held on the friend round. */
      teachStoneOnFriend: { title: string; body: string; tip: string };
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      completeTitle?: string;
      completeLine?: string;
    }
  | {
      /**
       * The Chat Fixer (Week 6, "game chat is for game talk"). The SWAP drill:
       * an outgoing chat message as word tiles; tap the tile that leaks
       * real-life info, pick the safe swap chip, then SEND. Clean messages are
       * sent as they stand (zero fixes is a legal, sometimes right, answer).
       */
      type: "chatFixer";
      messages: {
        id: string;
        /** Word tiles in order. */
        tiles: string[];
        /** Index of the leaking tile; omit when the message is already clean. */
        leakIndex?: number;
        /** Sarah reads the message as it appears. */
        readAloud: string;
        /** Three swap chips for the leaky tile; exactly one isSafe. */
        chips?: { text: string; isSafe: boolean; whyWrong: string }[];
        /** Sarah's reason on a correct SEND ("That's right!" + why). */
        why: string;
        /** WrongAnswerPanel when SEND is tapped with the leak still in. */
        whyWrong: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      chatTitle?: string;
      sendLabel?: string;
      tileHint?: string;
      cleanToast?: string;
      fixedToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Lobby Doors (Week 6, "lock your lobby"). The GATEKEEP drill and the
       * tap-only remake of the old Lobby Keeper: players wait at the lobby
       * doors one at a time; LET IN anyone wearing the team badge, DENY
       * anyone without one. Between waves a settings card flips Friends only
       * ON, and the second wave shows only badge friends reach the door.
       */
      type: "lobbyDoors";
      waves: {
        id: string;
        friendsOnly: boolean;
        players: { id: string; name: string; hasBadge: boolean; readAloud: string; why: string; whyWrong: string }[];
      }[];
      toggleCard?: { title: string; text: string; buttonLabel: string; readAloud: string; why: string };
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      letInLabel?: string;
      denyLabel?: string;
      badgeLabel?: string;
      toggleLabel?: string;
      letInToast?: string;
      denyToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Guard Count (Week 6, "let's chat somewhere else"; Week 9 skin
       * "install"). The CHECKLIST drill: tap each guard slot on each panel to
       * see whether it is there, then tap the room to stay in (or INSTALL /
       * NOT THIS ONE in the install skin).
       */
      type: "guardCount";
      skin?: "rooms" | "install";
      rounds: {
        id: string;
        prompt: string;
        readAloud: string;
        panels: {
          id: string;
          title: string;
          icon?: string;
          slots: { id: string; label: string; present: boolean; readAloud: string }[];
          isSafe: boolean;
        }[];
        why: string;
        whyWrong: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      slotHint?: string;
      chooseHint?: string;
      stayLabel?: string;
      installLabel?: string;
      refuseLabel?: string;
      presentWord?: string;
      missingWord?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Power Panel (Week 6, "report and block"; Week 10 skin "player").
       * The FIND IN ORDER drill: a menu crowded with buttons whose layout
       * changes every round; tap the three hero buttons in order (REPORT,
       * BLOCK, TELL). Decoys and wrong-order taps teach and wait.
       */
      type: "powerPanel";
      skin?: "menu" | "player";
      rounds: {
        id: string;
        prompt: string;
        readAloud: string;
        layout: "grid" | "list" | "sidebar";
        buttons: { id: string; label: string; step?: 1 | 2 | 3; note?: string }[];
        /** Teach for skipping step 1 / skipping step 2. */
        stepTeach: [string, string];
        why: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      panelTitle?: string;
      stepLabels?: [string, string, string];
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Password Hospital - the construction (vs recognition) exercise.
       *
       * Each "patient" is a weak password. The child:
       *   1. Diagnoses why it is weak (taps one of 4 reason buttons).
       *      Wrong picks pause with WrongAnswerPanel; hints escalate
       *      after repeated wrongs on the same patient.
       *   2. Repairs it by tapping action cards from a toolbox
       *      (add letters / add number / add symbol / mix case /
       *      remove name+date / scramble keyboard pattern). Each tap
       *      transforms the working password text and raises a
       *      strength meter.
       *   3. Discharges the patient once the strength threshold is
       *      crossed - a "HEALED!" beat fires.
       *
       * Curriculum-clean: every reasonId here is taught in the
       * preceding info / scanner / sorter screens. No 2FA, no
       * password managers. Discharge threshold is computed inline
       * from a kid-friendly strength heuristic - not a real entropy
       * calc, intentionally.
       */
      type: "passwordHospital";
      /**
       * Reusable diagnosis buttons. Same id space as weakSorter's
       * reasons so question keys stay consistent across screens.
       */
      reasons: { id: string; label: string; example?: string }[];
      patients: {
        /** Stable id for QuestionResponse keys. e.g. "pat-1". */
        id: string;
        /** The weak password the child starts with. */
        password: string;
        /** Which reason the child should pick in phase 1. */
        primaryReason: string;
        /** Other diagnoses that are also honestly right (e.g. "123" is too short AND a keyboard run). */
        alsoAccept?: string[];
        /**
         * Friendly one-line context shown above the patient card
         * during diagnosis. Optional; keep short.
         */
        chartNote?: string;
        /**
         * Explanation for the diagnosis WrongAnswerPanel when the
         * child mis-diagnoses this patient.
         */
        diagnosisExplanation: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
        /**
         * Recommended repair actions (by action id). Used for hint
         * targeting in phase 2 - the panel can nudge "try adding a
         * symbol" if the child taps non-recommended fixes.
         */
        recommendedActions: string[];
      }[];
      hints?: {
        diagnosisTier1: string;
        diagnosisTier2: string;
        repairTier1: string;
        repairTier2: string;
      };
    }
  | {
      type: "chooseYourPath";
      scenarios: {
        setup: string;
        choices: { text: string; isSafe: boolean; consequence: string }[];
        /** `device` presentation: what app/site this moment happens in. */
        frame?: { appName: string; icon: string };
        /** `device` presentation: how the SAFE move reads - "pause" (default,
         *  red don't-share) or "ask" (green "ask a grown-up"). */
        safeKind?: "pause" | "ask" | "go";
        /** `device` presentation: WrongAnswerPanel header/tip overrides for
         *  this moment (the defaults are Week 2's password wording). */
        wrongTitle?: string;
        wrongTip?: string;
      }[];
      /**
       * Presentation variant. `device` stages each scenario as an in-world
       * device screen (app chrome + a big PAUSE action) instead of the
       * classic text card — Week 2's "The Pause Button" skin. Omitting it
       * keeps the classic Week 1 look.
       */
      presentation?: "device";
      /**
       * `device` presentation only: have Sarah read each scenario (and its
       * outcome) aloud, with the no-skip guard holding the buttons until she
       * finishes. Opt-in because device weeks without per-scenario recordings
       * stay silent; setups/consequences must be generated (they record under
       * speaker "adam").
       */
      speakScenarios?: boolean;
      /** `device` presentation only: intro copy overrides (Week 7 "The Buy Button"). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
    }
  | {
      /**
       * The Coin Counter (Week 7, concept 1). The COUNT drill: a gem pack, a
       * till and a piggy bank of real coins that carries over between packs.
       * Tap coins into the till until the price is paid and the receipt prints
       * what it really cost; when the bank cannot cover a pack, the right move
       * is the single stop button. No wrong path (a demonstration of counting).
       */
      type: "coinCounter";
      startBank: number;
      packs: {
        id: string;
        name: string;
        gems: number;
        /** Whole real coins the pack costs. */
        price: number;
        /** Sarah reads the pack as it lands on the counter. */
        readAloud: string;
        /** The till's receipt line when the pack is paid (or refused). */
        receipt: string;
        /** Sarah's reason ("That's right!" + why). */
        why: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      shopLabel?: string;
      tillLabel?: string;
      bankLabel?: string;
      coinWord?: string;
      stopLabel?: string;
      paidToast?: string;
      stopToast?: string;
      fullNote?: string;
      shortNote?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Odds Jar (Week 7, concept 2). OPEN AND TALLY: a jar of a hundred
       * marbles with one gold one, a loot box, a spent counter. Tap OPEN the
       * authored number of times (grey every time, the gold never leaves), then
       * tap the true card about the odds. Cards shuffle per play.
       */
      type: "oddsJar";
      rounds: {
        id: string;
        prize: string;
        oddsLine: string;
        readAloud: string;
        opens: number;
        cards: { text: string; isTrue: boolean; whyWrong: string }[];
        why: string;
        cardPrompt?: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      openLabel?: string;
      spentLabel?: string;
      costPerOpen?: number;
      coinWord?: string;
      marbleTotal?: number;
      jarNote?: string;
      trueToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The True-Price Lever (Week 7, concept 3): the week's signature as a
       * concept game, data-driven. A deal flashes with a pressure banner and a
       * fake countdown; pull and HOLD the lever to print the real receipt, then
       * BUY or WALK AWAY. Wrong buys drain and refund the pouch while Sarah
       * teaches. Deals play in authored order.
       */
      type: "truePriceLever";
      startCoins?: number;
      deals: {
        id: string;
        name: string;
        art: "hat" | "box" | "pass" | "cape";
        priceTag: string;
        pressure?: string;
        countdown?: boolean;
        advertised: number;
        trueCost: number;
        receipt: { label: string; amount: string; bad: boolean; note?: boolean }[];
        totalLabel: string;
        stamp: "FAIR!" | "TRICK!";
        rightMove: "buy" | "walk";
        readAloud: string;
        why: string;
        teach: { title: string; body: string; tip: string };
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      shopLabel?: string;
      leverHint?: string;
      buyLabel?: string;
      walkLabel?: string;
      fakeStamp?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Undo Test (Week 8, concept 1: once it's out, it's out). ACT AND
       * SEE: SHARE copies the photo onto three friends' phones, DELETE empties
       * only yours, each friend's phone shows "their copy, their phone", then
       * the child taps the true rule card. Only the rule card is judged.
       */
      type: "undoTest";
      rounds: {
        id: string;
        caption: string;
        photoIcon: string;
        /** Sarah reads the round's photo moment as it appears. */
        readAloud: string;
        friends: { id: string; name: string; reaction: string }[];
        cards: { text: string; isTrue: boolean; whyWrong: string }[];
        /** Sarah's reason on the true card ("That's right!" + why). */
        why: string;
        cardPrompt?: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      shareLabel?: string;
      deleteLabel?: string;
      goneChip?: string;
      theirCopyChip?: string;
      youLabel?: string;
      trueToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Ask Ring (Week 8, concept 2: their face, their call). ASK and
       * RESPECT: tap each friend in the photo to ask; a yes glows, a no needs
       * the right hero move (leave them out, or don't post it at all); POST
       * lights only once every face is settled. Friends shuffle per round.
       */
      type: "askRing";
      rounds: {
        id: string;
        caption: string;
        photoIcon: string;
        readAloud: string;
        friends: {
          id: string;
          name: string;
          answer: "yes" | "no";
          /** Their answer in their own words, shown in a speech bubble. */
          says: string;
          readAloud: string;
          /** For a no: the right hero move. */
          noMove?: "leaveOut" | "dontPost";
          why?: string;
          whyWrong?: string;
        }[];
        /** Sarah's reason when POST is tapped with every face settled. */
        why: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      postLabel?: string;
      leaveOutLabel?: string;
      dontPostLabel?: string;
      yesChip?: string;
      noChip?: string;
      leftOutChip?: string;
      postToast?: string;
      keptToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Developing Tray (Week 8, concept 3: photos talk), the week's
       * signature as a concept game. Tap every tile to develop the built-in
       * photo, tap each leak it gives away, then decide SHARE or KEEP (KEEP is
       * right). `leakCopy` overrides the built-in copy per leak id.
       */
      type: "developingTray";
      leakCopy?: Partial<Record<string, { chip: string; bullet: string; readAloud: string }>>;
      developPrompt?: string;
      developReadAloud?: string;
      spotPrompt?: string;
      spotReadAloud?: string;
      decidePrompt?: string;
      decideReadAloud?: string;
      shareLabel?: string;
      keepLabel?: string;
      why?: string;
      teach?: { title: string; body: string; tip: string };
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Flip the Box (Week 9, concept 3: why does it need that?), the week's
       * signature as a concept game. Tap the arrows to turn an app box through
       * its front, maker, reviews and asks sides; SAFE APP / BIN IT unlock once
       * all four are seen. A wrong call turns the box to the side that gave it away.
       */
      type: "flipTheBox";
      boxes: {
        id: string;
        name: string;
        icon: string;
        tagline: string;
        stars?: number;
        /** Sarah reads the front as the box rolls in. */
        readAloud: string;
        maker: { title?: string; text: string; readAloud: string; fishy: boolean };
        reviews: { title?: string; text: string; readAloud: string; fishy: boolean };
        asks: { job?: string; items: { label: string; icon: string; fishy: boolean }[]; readAloud: string };
        rightMove: "install" | "bin";
        why: string;
        whyWrong: string;
        wrongFace?: "maker" | "reviews" | "asks";
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      faceLabels?: Partial<Record<"front" | "maker" | "reviews" | "asks", string>>;
      installLabel?: string;
      binLabel?: string;
      installToast?: string;
      binToast?: string;
      wrongTitle?: string;
      wrongStamp?: string;
      completeTitle?: string;
      completeLine?: string;
      turnPrompt?: string;
      decidePrompt?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Test Drive (Week 9, concept 4: FREE isn't free). TEST-DRIVE then
       * FLIP: PLAY ONE MINUTE reveals each minute of a FREE app, the TIME /
       * COINS / INFO meters fill with what it cost, then the FREE tag flips to
       * four identical price stickers and the child taps the real price.
       */
      type: "testDrive";
      rounds: {
        id: string;
        appName: string;
        appIcon: string;
        /** Sarah reads the app as it arrives. */
        readAloud: string;
        minutes: { id: string; text: string; icon: string; cost: "time" | "coins" | "info" | "none"; readAloud: string }[];
        answer: "time" | "coins" | "info" | "free";
        /** Sarah's reason on the right sticker ("That's right!" + why). */
        why: string;
        /** Sarah's teach on a wrong sticker ("Not quite." + whyWrong). */
        whyWrong: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      freeTag?: string;
      playLabel?: string;
      flipLabel?: string;
      realPriceLabel?: string;
      metersTitle?: string;
      meterLabels?: Partial<Record<"time" | "coins" | "info", string>>;
      priceLabels?: Partial<Record<"time" | "coins" | "info" | "free", string>>;
      rightToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Four Eyes (Week 9, concept 5: install together with a grown-up). CALL
       * then DECIDE TOGETHER: the child's view shows the shiny side of an app;
       * CALL MY GROWN-UP opens a second view whose spotted details the child
       * taps to read; INSTALL TOGETHER / SKIP IT TOGETHER unlock only after.
       */
      type: "fourEyes";
      rounds: {
        id: string;
        appName: string;
        appIcon: string;
        kidView: { tagline: string; stars: string; perks: string[] };
        readAloud: string;
        spots: { id: string; label: string; icon: string; fishy: boolean; readAloud: string }[];
        rightMove: "install" | "skip";
        why: string;
        whyWrong: string;
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      yourEyesLabel?: string;
      grownUpEyesLabel?: string;
      callLabel?: string;
      installLabel?: string;
      skipLabel?: string;
      getLabel?: string;
      fishyChip?: string;
      fineChip?: string;
      installToast?: string;
      skipToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * REVEAL engine (Week 2+). A board of face-down cards; tapping one
       * flips it and plays a short cause→effect vignette (2-4 beats), then
       * closes on a counter-line ("…so it stays PRIVATE") and stamps the
       * card. All cards revealed → a finale beat fires onComplete. Fully
       * data-driven: the same component powers who-could-misuse (W2),
       * unmask-profile (W3), loot-box odds (W7), screenshot-permanence
       * (W8) and the other ~11 REVEAL beats in the build sheet.
       */
      type: "reveal";
      title: string;
      subtitle?: string;
      /** PixIcon key fronting the board header (default the Raccoon). */
      boardIcon?: string;
      items: {
        /** Stable id used in QuestionResponse keys (e.g. "address"). */
        id: string;
        /** Card face label ("Home Address"). */
        label: string;
        /** Emoji rendered via PixIcon on the card face. */
        icon: string;
        /** The vignette beats played after the flip, in order. */
        steps: { icon?: string; text: string }[];
        /** Closing counter-line for this card. */
        counter: string;
      }[];
      /** Line spoken/shown once every card has been revealed. */
      finale?: string;
    }
  | {
      /**
       * Vault Drop (Week 2's Beat 2). The DRAG game: info treasures are
       * scattered on the table and the child physically drags each one
       * either into the vault (private — the door swallows it and
       * clunks shut) or onto the share board (safe — it gets pinned).
       * No timer, no belt: deliberately the calm, tactile opposite of
       * Week 1's beam-scanner reflex drill. Wrong drops bounce back and
       * teach via WrongAnswerPanel.
       */
      type: "vaultDrop";
      items: {
        id: string;
        text: string;
        /** Emoji rendered via PixIcon on the treasure card. */
        icon: string;
        /** True = belongs in the vault; false = safe for the share board. */
        isPrivate: boolean;
        /** Shown in the WrongAnswerPanel on a wrong drop. */
        explanation: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
        /** Dock skin: Sarah reads the parcel label as it arrives (audio only). */
        readAloud?: string;
      }[];
      hints?: { tier1: string; tier2: string };
      /** "treasure" (Week 2, default) or "dock" (Week 9 Delivery Dock: isPrivate true = SEND IT BACK). */
      skin?: "treasure" | "dock";
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Dock skin: the two destination names (keep = first, away = second). */
      destinationLabels?: { keep?: string; away?: string };
      motto?: string;
      rightToast?: string | { keep?: string; away?: string };
      wrongTitle?: string | { keep?: string; away?: string };
      completeTitle?: string;
      completeLine?: string;
    }
  | {
      /**
       * Conveyor sorter (Week 2+). Items ride a belt toward a scanner and
       * the child sends each into one of TWO chutes before it arrives.
       * Wrong sorts pause the belt and teach (WrongAnswerPanel). Distinct
       * from weakSorter (static four-way diagnosis) and cyberScanner
       * (drifting strong/weak taps): this is a physical machine with
       * binary categories as data.
       */
      type: "conveyorSort";
      /** Two or three categories. `tone` picks the chute styling. */
      categories: { id: string; label: string; icon: string; tone: "safe" | "lock" | "flag" }[];
      items: {
        id: string;
        text: string;
        /** Optional emoji badge on the card. */
        icon?: string;
        categoryId: string;
        /** Shown in the WrongAnswerPanel on a mis-sort. */
        explanation: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
      }[];
      /** Copy overrides (re-theme per week; defaults keep the W3 machine skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      machineLabel?: string;
      chuteWord?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Request Inspector (Week 2). The deliberate "why are they asking?"
       * drill: a cheerful app sign-up form arrives and the child must tap
       * every inspect zone (who's asking / what do they want / do they
       * NEED it / what happens if I type it) before the decision buttons
       * ("Fill it in" / "Too nosy!") unlock. Generalises the
       * phishInspector pattern with data-driven zones — the lesson here
       * is need-vs-want on legit-looking apps, NOT spotting fakes (W4).
       */
      type: "requestInspector";
      /** Card chip + intro + verdict re-dress (default the W2 form skin). */
      badgeLabel?: string;
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      fairLabel?: string;
      nosyLabel?: string;
      requests: {
        id: string;
        appName: string;
        /** Emoji rendered via PixIcon as the app logo. */
        appIcon: string;
        /** The app's cheerful pitch line. */
        tagline: string;
        /** Field labels the form asks for. */
        asksFor: string[];
        /** True when the request over-asks and should be refused. */
        isNosy: boolean;
        zones: {
          id: string;
          label: string;
          note: string;
          isRedFlag: boolean;
        }[];
        /** Explanation shown after the child's verdict. */
        verdictNote: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
        /** Optional Sarah "think" nudge: shown and read aloud once all four zones
         *  are inspected, BEFORE the verdict buttons unlock (owner: a little hint
         *  like "it is only a quiz form, do they really need this?"). */
        nudge?: string;
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Settings Switch (Week 6+). A realistic settings panel with toggle
       * rows; find the RISKY ones and flip them safe. Already-safe rows
       * teach gently when tapped. Re-themable per week (W6 lobby, W14
       * devices, W17 profile, W19 family rounds).
       */
      type: "settingsSwitch";
      panelTitle: string;
      rows: {
        id: string;
        label: string;
        value: string;
        safeValue?: string;
        icon: string;
        isRisky: boolean;
        note: string;
      }[];
      introTitle: string;
      introSubtitle?: string;
      introIcon?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Button Hunt (Week 6+). A menu mock full of buttons; find and tap
       * the target controls IN ORDER (e.g. Report then Block). Decoys
       * teach what they really do. Re-themable per week (W6 report/block,
       * W10 escape, W11 block, W14 mute, W18 log-out).
       */
      type: "buttonHunt";
      menuTitle: string;
      /** Situation line above the menu. */
      scenario: string;
      buttons: {
        id: string;
        label: string;
        icon: string;
        /** Position in the find-order (1-based). Omit = decoy. */
        targetOrder?: number;
        /** Decoys: what this button really does. Targets: celebration line. */
        note: string;
      }[];
      introTitle: string;
      introSubtitle?: string;
      introIcon?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Hook Sort (Week 4). The Fishing Dock: one message at a time
       * dangles on a line; REEL IN the real ones, CUT THE LINE on scams.
       * Calm binary sort - no belt, no timer, one catch in play.
       */
      type: "hookSort";
      /** Copy overrides (re-theme per week; defaults keep the W4 dock skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      reelLabel?: string;
      cutLabel?: string;
      reelToast?: string;
      cutToast?: string;
      wrongScamTitle?: string;
      wrongRealTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      items: {
        id: string;
        text: string;
        /** Emoji rendered via PixIcon on the dangling card. */
        icon?: string;
        /** True = a scam; the right call is CUT THE LINE. */
        isScam: boolean;
        /** Shown in the WrongAnswerPanel on a wrong call. */
        explanation: string;
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Sender Lineup (Week 4). Four sender badges on podiums; exactly
       * one is a lookalike imposter. Tap the imposter to bust it. Fake
       * SENDERS only - link mechanics are Week 16's lane.
       */
      type: "senderLineup";
      /** Copy overrides (re-theme per week; defaults keep the W4 sender skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Toast on catching the fake (default "IMPOSTER BUSTED!"). */
      correctToast?: string;
      /** Stamp on the caught card, e.g. "FROZEN!" (default "IMPOSTER! 🎭"). */
      stampLabel?: string;
      /** WrongAnswerPanel title on a safe-card tap; {name} is replaced. */
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      rounds: {
        id: string;
        /** The situation, e.g. "Four messages say your game needs an update…" */
        prompt: string;
        senders: {
          id: string;
          name: string;
          /** Small supporting detail (e.g. the from-address). */
          detail: string;
          /** Emoji rendered via PixIcon as the badge crest. */
          icon: string;
          /**
           * Optional photo (public path) shown INSTEAD of the emoji crest, so a
           * "spot the fake photo" round shows real pictures with the clue under
           * each (W15 "Odd Shadow Out"). Falls back to `icon` when absent.
           */
          image?: string;
          /** True = the imposter (exactly one per round). */
          isFake: boolean;
          /** Teach copy: why fake / why it checks out. */
          note: string;
          /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
          why?: string;
        }[];
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Profile Inspector (Week 3). The social-profile sibling of
       * requestInspector: a friendly-looking profile card arrives and the
       * child must tap every inspect zone (when it joined / friends &
       * photos / how it talks / what it's asking) before the verdict
       * buttons unlock: "Real friend" or "FAKE!". Teaches the four fake-
       * profile tells: brand-new account, no real friends, copied photo,
       * too-friendly-too-fast. Lane-clean: judging PEOPLE, not messages
       * (W4) and not report/block protocol (W11).
       */
      type: "profileInspector";
      profiles: {
        id: string;
        /** Display handle e.g. "SkaterKid_Max". */
        handle: string;
        /** Emoji rendered via PixIcon as the avatar. */
        avatar: string;
        /** The profile's friendly pitch/bio line. */
        bio: string;
        /** Small stat chips shown on the card (e.g. "Joined: YESTERDAY"). */
        stats: { label: string; value: string }[];
        /** True when the profile is fake and should be called out. */
        isFake: boolean;
        zones: {
          id: string;
          label: string;
          note: string;
          isRedFlag: boolean;
        }[];
        /** Explanation shown after the child's verdict. */
        verdictNote: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
        /** Optional "Think!" line Sarah says once every clue is open, before the
         *  verdict (read aloud; the verdict unlocks when she finishes). */
        nudge?: string;
      }[];
      /** Copy overrides (defaults keep the W3 detective skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      realLabel?: string;
      fakeLabel?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Clue Stamper (Week 3, replaces the profile inspector: owner
       * 2026-09-12, "we never copy an exercise"). The MARK-A-SET-THEN-LOCK
       * drill: a friend request lands beside a detective notebook showing
       * the profile's FOUR clues in the fixed order the Learn screen teaches
       * (WHEN did it join, WHO are its friends, HOW does it talk, WHAT does
       * it ask for). Nothing is hidden. The child taps a clue to stamp it
       * SNEAKY! (tap again to lift), then taps CLOSE THE CASE to commit the
       * whole set at once; zero stamps is a legal answer. The verdict is
       * never picked: it is derived from the set (any sneaky clue = fake).
       * A wrong lock teaches the first mismatched clue and keeps every
       * stamp, so the retry is a one-row fix.
       */
      type: "clueStamper";
      cases: {
        id: string;
        /** Display handle e.g. "SkaterKid_Max". */
        handle: string;
        /** Emoji rendered via PixIcon as the avatar. */
        avatar: string;
        /** The one-line bio in the speech bubble, six to nine words. */
        pitch: string;
        /** Sarah's read-aloud as the case arrives: the pitch, then each row
         *  as "question? evidence." in WHEN/WHO/HOW/WHAT order. */
        readAloud: string;
        /** Exactly four, one per id. Authored order does not matter: the
         *  component renders the fixed WHEN/WHO/HOW/WHAT procedure. */
        clues: {
          id: "when" | "who" | "how" | "what";
          /** The visible evidence, five words or fewer ("Joined: yesterday"). */
          evidence: string;
          isRedFlag: boolean;
          /** Sarah's teach line when this row is mismatched at the lock. A
           *  red clue can only be missed, a clean clue only over-stamped, so
           *  one line per clue reads in its only possible direction. */
          teach: string;
        }[];
        /** Sarah's reason on a correct lock ("That's right!" + rightWhy). */
        rightWhy: string;
      }[];
      /** Copy overrides (defaults keep the W3 detective skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Text on the red rubber stamp. Default "SNEAKY!". One short word. */
      stampLabel?: string;
      /** Text on the commit button. Default "CLOSE THE CASE". */
      closeLabel?: string;
      /** The board's instruction strip, and the complete-beat count noun. */
      boardPrompt?: string;
      caughtLabel?: { one: string; many: string };
      realSeal?: string;
      fakeSeal?: string;
      realToast?: string;
      fakeToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string; tier3?: string };
      /** Visual skin: "profile" (Week 3, default) or "photo" (Week 8 photo prints). */
      skin?: "profile" | "photo";
      /** Row question per fixed id (Week 8 asks photo questions instead of profile ones). */
      rowLabels?: Partial<Record<"when" | "who" | "how" | "what", string>>;
    }
  | {
      /**
       * Strings Attached (Week 4, "a scam always wants something back"). The
       * CONNECT drill: three prize balloons float over a carnival counter, each
       * on a string; four tokens sit on the counter (your password, your money,
       * your tap, nothing). Tap a balloon, then tap the token its string really
       * leads to. A real offer connects to "nothing". Every board holds at least
       * one fair offer so "everything is a scam" is never a strategy. Boards
       * and balloons are shuffled per play; round 1 is guided.
       */
      type: "stringsAttached";
      /** Visual skin: "balloons" (Week 4 carnival, default) or "coins" (Week 7 shop till). */
      skin?: "balloons" | "coins";
      offers: {
        id: string;
        /** The balloon's banner, two short lines at most. */
        text: string;
        /** Sarah reads the offer as its balloon floats up (one clip). */
        readAloud: string;
        /** What the string really leads to. "nothing" = a fair, real offer. */
        wants: "password" | "money" | "tap" | "nothing";
        /** Sarah's reason on a correct connection ("That's right!" + why). */
        why: string;
        /** Sarah's teach on a wrong connection ("Not quite." + nudge). Names no token. */
        nudge: string;
      }[];
      /** Copy overrides (defaults keep the W4 carnival skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Labels on the four counter tokens. */
      tokenLabels?: Partial<Record<"password" | "money" | "tap" | "nothing", string>>;
      /** Toasts after a correct connection (a scam exposed / a fair offer kept). */
      scamToast?: string;
      fairToast?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Believe-o-Meter (Week 4, "too good to be true"). The DIALS drill:
       * one offer poster at a time above a fairground dial with three stops
       * (Could be real / Hmm, check first / No way). Tap the arrows to turn the
       * needle, then tap LOCK IT IN. Nothing is judged before the lock; the
       * needle always starts in the middle. Offers are shuffled per play and
       * round 1 is guided (the right stop glows).
       */
      type: "believeOMeter";
      offers: {
        id: string;
        /** The poster headline. */
        text: string;
        /** Who it claims to be from, shown as the poster's small print. */
        from: string;
        /** Sarah reads the poster as it hangs (one clip). */
        readAloud: string;
        /** Where the needle belongs (the four door ids are for skin "doors"). */
        answer: "real" | "hmm" | "noway" | "justMe" | "friends" | "school" | "everyone";
        /** Sarah's reason on a correct lock ("That's right!" + why). */
        why: string;
        /** Sarah's teach on a wrong lock ("Not quite." + whyWrong), any stop. */
        whyWrong: string;
      }[];
      /** Copy overrides (defaults keep the W4 carnival skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      stopLabels?: Partial<Record<"real" | "hmm" | "noway" | "justMe" | "friends" | "school" | "everyone", string>>;
      /** Visual skin: "believe" (Week 4 three-stop dial, default) or "doors" (Week 8 four-stop door dial). */
      skin?: "believe" | "doors";
      /** Text on the commit button. Default "LOCK IT IN". */
      lockLabel?: string;
      /** Header noun ("Offer 2 of 6"), the small print before `from` ("" = just `from`),
       *  the complete-beat count noun, and optional small print under the dial. */
      itemLabel?: string;
      fromLabel?: string;
      doneLabel?: string;
      dialNote?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * The Name Tag Check (Week 4, "the lookalike sender"). The MARK drill:
       * the REAL sender's name tag sits on top, the sender to check underneath,
       * both split into the same aligned pieces (name / address / ending). Tap
       * a piece on the bottom tag that does not match the one above it to mark
       * it SWAPPED (tap again to lift), then tap CLOSE THE BOOTH to commit the
       * whole set. Zero marks is legal and sometimes right (the sender IS the
       * real one). The verdict (real / copycat) is derived from the marks.
       * Cases are shuffled per play.
       */
      type: "nameTagCheck";
      cases: {
        id: string;
        /** The real sender's pieces, in display order. */
        realChunks: string[];
        /** The pieces to check, aligned by index with realChunks. */
        chunks: {
          text: string;
          /** True when this piece differs from the real one above it. */
          isWrong: boolean;
          /** Sarah's teach when this piece is mismarked at the lock (missed
           *  when isWrong, over-marked when not). */
          teach: string;
        }[];
        /** Sarah reads the case as it arrives (one clip). Never spells an address. */
        readAloud: string;
        /** Sarah's reason on a correct lock ("That's right!" + rightWhy). */
        rightWhy: string;
        /** App skin: the app's icon tile (a PixIcon emoji). */
        appIcon?: string;
      }[];
      /** "tag" (Week 4 name tags, default) or "app" (Week 9 app-store listing cards). */
      skin?: "tag" | "app";
      /** App skin: a small caption per piece row ("Name", "Maker", "Downloads"). */
      pieceLabels?: string[];
      realLabel?: string;
      checkLabel?: string;
      itemLabel?: string;
      boardPrompt?: string;
      doneLabel?: string;
      caughtLabel?: { one: string; many: string };
      /** Copy overrides (defaults keep the W4 carnival skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Text on the red mark. Default "SWAPPED!". */
      stampLabel?: string;
      /** Text on the commit button. Default "CLOSE THE BOOTH". */
      closeLabel?: string;
      realSeal?: string;
      fakeSeal?: string;
      realToast?: string;
      fakeToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string; tier3?: string };
    }
  | {
      /**
       * Reply Cards (Week 3). The SELECT drill: an incoming chat message
       * appears and three reply cards fan out. Tap the safe reply and it
       * slots into the chat with a green glow; tap a risky one and it
       * bounces back with a teach panel. One round per message — practises
       * the never-meet / never-send / tell-a-grown-up replies without a
       * meter or branching (that's chatSimulator's job).
       */
      type: "replyCards";
      /** Visual skin: fanned chat cards (default), tall kindness DOORS (W5), brass LEVERS (W8) or bobbing BALLOONS (W18). */
      skin?: "cards" | "doors" | "levers" | "balloons";
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** In-game copy overrides (defaults keep the W3 chat skin). */
      pickLabel?: string;
      roundNoun?: string;
      correctToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      scoreNoun?: string;
      rounds: {
        id: string;
        /** Who the message is from (display name shown on the bubble). */
        from: string;
        /** Emoji rendered via PixIcon as the sender's avatar. */
        fromIcon: string;
        /** The incoming message. */
        message: string;
        /** 3-4 reply cards; exactly one has isSafe: true. */
        replies: { text: string; isSafe: boolean; explanation: string }[];
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Clue Board (Week 8 debut). The detective-corkboard INSPECT: one
       * "photo" pinned centre with clue chips waiting on it. Tap a clue
       * → a red-thread evidence card pins beside the photo revealing
       * what that clue gives away; once every clue is strung, one
       * verdict call closes the case. Distinct from profileInspector
       * (profile card) and phishInspector (message anatomy): a spatial
       * photo scene. Re-dressable for later inspect weeks.
       */
      type: "clueBoard";
      /** Intro copy overrides. */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Caption under the pinned photo. */
      photoTitle: string;
      /** Big central PixIcon standing in for the photo's subject. */
      photoIcon?: string;
      clues: {
        id: string;
        /** PixIcon key on the photo hotspot. */
        icon: string;
        /** Short chip label, e.g. "School crest". */
        label: string;
        /** What this clue gives away. */
        evidence: string;
      }[];
      verdict: {
        prompt: string;
        /** Exactly one isCorrect; explanation teaches on a wrong call. */
        options: { text: string; isCorrect: boolean; explanation: string; why?: string }[];
      };
      /** Stamp + complete-beat copy overrides. */
      stampText?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Team Poster (Week 11 debut). The poster-building BUILD drill: a
       * warm poster with empty slots and a tray of candidate tiles. Tap
       * a tile that belongs → it fills the next slot with a glow; tap
       * one that doesn't → a gentle teach panel. Special tiles (the
       * Childline number) get a golden frame. Re-dressable via the copy
       * props (W19 family-rules quilt is the earmarked reuse).
       */
      type: "teamPoster";
      tiles: {
        id: string;
        label: string;
        /** Optional small line under the label. */
        detail?: string;
        /** Emoji rendered via PixIcon on the tile. */
        icon: string;
        /** True = belongs on the poster. */
        isTeam: boolean;
        /** Golden frame on the poster (e.g. the Childline tile). */
        special?: boolean;
        /** Teach copy: why it belongs / why it doesn't. */
        note: string;
      }[];
      /** Visual skin: warm W11 poster (default) or the W3 detective cork board. */
      skin?: "poster" | "case";
      /** Copy overrides (defaults keep the W11 team skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      posterTitle?: string;
      trayPrompt?: string;
      placedToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      /** Counter label under the board ("ON THE POSTER" / "CLUES PINNED"). */
      countLabel?: string;
      /** Sarah reads each pinned tile's note aloud as it lands (recorded only). */
      speakNotes?: boolean;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Snowball Chase (Week 12). The deliberately-uncatchable ARCADE
       * demo: copies roll onto a snowfield, the child sweeps them with
       * taps while the ROLLED AWAY counter climbs faster than any broom.
       * No lose state, always full stars - the futility IS the lesson
       * and the complete beat names it out loud.
       */
      type: "snowballChase";
      /** Field skin: W12 snowfield (default) or W5 "embers" (night ground, ember copies). */
      skin?: "snow" | "embers";
      /** Label at the field's edge (default "OVER THE HILL →"). */
      edgeLabel?: string;
      /** Optional opening card: the post about to be passed on, with ONE big
       *  button. Nothing spawns until it is tapped; Sarah reads `readAloud`
       *  first. (W5 Ember Chase: "one tap sends the message on".) */
      startCard?: { text: string; buttonLabel: string; readAloud?: string };
      /** Copy overrides (defaults keep the W12 snowfield skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** PixIcon key stamped on each rolling copy. */
      ballIcon?: string;
      sweptLabel?: string;
      rolledLabel?: string;
      /** Mid-game caption beats (shown in order as time passes). */
      captions?: [string, string, string];
      completeTitle?: string;
      completeLine?: string;
    }
  | {
      /**
       * Trail Stamper (Week 12). The golden-trail BUILD drill: footprint
       * spots along a snow path, two stamp choices per spot (proud vs
       * regret). Proud stamps press golden footprints and raise the
       * TRAIL GLOW meter; regret stamps teach gently. The agency beat -
       * you CHOOSE the tracks you leave.
       */
      type: "trailStamper";
      spots: {
        id: string;
        /** The moment, e.g. "Priya posted her new painting..." */
        prompt: string;
        /** Two options; exactly one isProud. */
        options: {
          label: string;
          /** Emoji rendered via PixIcon on the stamp card. */
          icon: string;
          isProud: boolean;
          /** Teach copy when the regret stamp is picked. */
          note: string;
          /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
          why?: string;
        }[];
      }[];
      /** Copy overrides (defaults keep the W12 snow-trail skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      meterLabel?: string;
      stampToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Sign Bingo (Week 13). The bingo-card SELECT drill: a 2×2 card of
       * body-signs, one scene at a time playing above it. Tap the sign
       * the scene shows → the square stamps; wrong taps teach gently and
       * replay the scene. All four stamped → BINGO. Distinct from
       * buttonHunt (find controls) and quickCheck recall (one question).
       */
      type: "signBingo";
      /** Board dressing: "card" (W13 2x2 card, default) or "vault" (W1 brass dials
       *  around a vault door; a correct tap bolts the door). Needs exactly 4 signs. */
      skin?: "card" | "vault";
      /** Vault skin: the short prompt Sarah reads after every move so the board
       *  always states the action ("Which power did that move use? Turn its dial."). */
      roundPrompt?: string;
      /** The card squares (4 recommended). */
      signs: {
        id: string;
        label: string;
        /** Emoji rendered via PixIcon on the square. */
        icon: string;
      }[];
      rounds: {
        id: string;
        /** The mini scene played above the card. */
        scene: string;
        /** Emoji badge on the scene card. */
        sceneIcon?: string;
        /** Which sign this scene shows. */
        signId: string;
        /** Teach copy on a wrong tap for this scene. */
        note: string;
        /** Positive explanation read aloud on a CORRECT tap (teach-on-success);
         *  omit to advance immediately. */
        why?: string;
      }[];
      /** Copy overrides (defaults keep the W13 body-bell skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      cardTitle?: string;
      stampToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Day Balancer (Week 13). The see-saw BUILD drill: a day plan
       * tipping over with screen blocks. One block at a time lights up
       * and the child swaps it for a replacement - the decoys are FAKE
       * recharges (screens in disguise). Each true swap lifts the plank
       * a step; it ends level with screen blocks still aboard (balance
       * means SOME, not none) and a grown-up co-signs the plan.
       */
      type: "dayBalancer";
      /** Visual skin: W13 day plan (default) or W5 "scales" (no co-sign line
       *  unless `cosignLine` is given; every label from the copy props). */
      skin?: "day" | "scales";
      /** Screen blocks that STAY on the plank (balance keeps the fun). */
      keptBlocks: { label: string; icon: string }[];
      swaps: {
        id: string;
        /** The highlighted screen block's story. */
        story: string;
        /** Sarah reads the moment as it arrives (Learn-Loop weeks). */
        readAloud?: string;
        /** Chip label/icon for the block on the screen side. */
        blockLabel: string;
        blockIcon: string;
        /** Three options; exactly one isBalancing. */
        options: {
          label: string;
          /** Emoji rendered via PixIcon on the card. Keep it UNIFORM across
           *  the three cards so it never encodes the answer. */
          icon: string;
          isBalancing: boolean;
          /** Teach copy when a fake-recharge decoy is picked. */
          note: string;
          /** Sarah's reason on a correct pick ("That's right!" + why). */
          why?: string;
        }[];
      }[];
      /** Copy overrides (defaults keep the W13 day-plan skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      meterLabel?: string;
      leftLabel?: string;
      rightLabel?: string;
      swapToast?: string;
      wrongTitle?: string;
      /** The grown-up sign-off line on the complete beat. */
      cosignLine?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Growth Rings (Week 17). The tree-ring REVEAL drill: concentric
       * rings light up ONE AT A TIME from the centre outward - tap the
       * glowing ring and its story card slides in (what grows in that
       * ring, and why the 13+ sign waits at the edge). Rings out of turn
       * wobble; no wrong answers by design. The enforced centre-outward
       * order separates it from RevealBoard's any-order flips.
       */
      type: "growthRings";
      /** Visual skin: W17 tree (default) or W5 "campfire" (ember ring
       *  colours and centre glow; geometry identical). */
      skin?: "tree" | "campfire";
      /** What one ring is called in the board copy ("RING 2 OF 4"); default "ring". */
      ringNoun?: string;
      /** Placeholder shown before the first tap (default: the tree wording). */
      placeholder?: string;
      /** First stat line on the complete beat (default "n/n rings grown"). */
      completeStat?: string;
      /** Rings in centre-outward order (4 recommended). */
      rings: {
        id: string;
        /** Short ring label, e.g. "NOW · 6-9". */
        label: string;
        /** Emoji rendered via PixIcon on the story card. */
        icon: string;
        /** Story card headline. */
        title: string;
        /** Story card body - what grows in this ring. */
        text: string;
        /** Sarah reads the story as the ring lights (the reveal IS the
         *  payoff; taps are held while she speaks). */
        readAloud?: string;
      }[];
      /** Copy overrides (defaults keep the W17 tree skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      centerLabel?: string;
      revealToast?: string;
      /** Line shown once every ring is lit. */
      finale?: string;
      completeTitle?: string;
      completeLine?: string;
    }
  | {
      /**
       * Plaque Peek (Week 16). The address-peephole INSPECT drill: one
       * link-door at a time wears a shiny sign claiming a destination.
       * The child lifts the plaque (mandatory, penalty-free) to reveal
       * the real address underneath, then calls it: honest door or
       * sneaky door. The forced lift-then-judge rhythm IS the lesson -
       * you check the address, not the paint. Distinct from clueBoard
       * (many clues, one verdict) and the zone inspectors.
       */
      type: "plaquePeek";
      /** Visual skin: W16 link doors (default) or W3 masked friends ("The Mask
       *  Peek": peek behind the claim to see what it really proves). */
      skin?: "door" | "mask";
      doors: {
        id: string;
        /** The shiny sign's claim, e.g. "FREE GAME COINS!" (mask skin: what the
         *  friend says, read aloud as the card arrives). */
        claim: string;
        /** Emoji rendered via PixIcon on the sign (mask skin: the friend's avatar). */
        icon: string;
        /** The real address revealed under the plaque (mask skin: what the claim
         *  really proves, read aloud as it lifts). */
        address: string;
        /** True = the address matches the claim (an honest door / real proof). */
        matches: boolean;
        /** Teach copy shown on a wrong verdict for this door. */
        note: string;
        /** Sarah's reason on a RIGHT verdict ("That's right!" + why); defaults to note. */
        why?: string;
        /** Mask skin: the friend's display name. */
        name?: string;
      }[];
      /** Copy overrides (defaults keep the W16 doorway skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      peekPrompt?: string;
      revealLabel?: string;
      cardNoun?: string;
      matchLabel?: string;
      sneakyLabel?: string;
      matchToast?: string;
      sneakyToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Passcode Forge (Week 18). The lock-forging BUILD drill: an anvil,
       * a code bar with empty slots and a GUESS-O-METER. Each round offers
       * three metal blanks - digit pairs wearing the story a guesser would
       * read off them ("starts 1-2-3-4!", "your birth year"). Hammer the
       * one with nothing to guess; the pair stamps into the code bar and
       * the meter climbs until the padlock clicks shut. NOT a W1 password
       * re-teach - the lesson is HAVING a lock, and keeping its code
       * un-guessable. Distinct from usernameBuilder (category slots) and
       * dayBalancer (swap-to-level).
       */
      type: "passcodeForge";
      /** Visual skin: W18 forge (default) or W5 "stones" (the `digits` field
       *  is a word label, the code bar shows the chosen labels, "Path:" stat). */
      skin?: "forge" | "stones";
      /** Emoji before the round prompt (default "🔨"). */
      promptIcon?: string;
      rounds: {
        id: string;
        /** Round prompt, e.g. "Forge the FIRST pair". */
        prompt: string;
        /** Sarah reads the round as it arrives (Learn-Loop weeks). */
        readAloud?: string;
        /** 3 metal blanks; exactly one isStrong. */
        options: {
          /** The digit pair on the blank, e.g. "58" (a word label in the "stones" skin). */
          digits: string;
          /** Kid-readable tell under the digits. */
          tell: string;
          isStrong: boolean;
          /** WrongAnswerPanel copy when a guessable blank is hammered. */
          explanation: string;
          /** Sarah's reason on a correct strike ("That's right!" + why). */
          why?: string;
          /** Optional PixIcon emoji on the blank. Keep uniform or omit. */
          icon?: string;
        }[];
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Label over the quality meter (default GUESS-O-METER). */
      meterLabel?: string;
      /** Meter status copy: "n/N {meterCountLabel}" while forging (default
       *  FORGED), `meterDoneLabel` when complete (default GUESS-PROOF!). */
      meterCountLabel?: string;
      meterDoneLabel?: string;
      strikeToast?: string;
      wrongTitle?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      /**
       * Step Order (Week 5+). The stepping-stones ORDER game: shuffled
       * step tiles below a river; tap them in the order you'd do them
       * and each hops onto the next stone. Gentle - a wrong tap wobbles
       * and teaches, nothing fails. Re-themable via the intro fields
       * (W5 calm path, W11 protocol, W13 power-off ritual).
       */
      type: "stepOrder";
      /** Steps in CORRECT order; display order is shuffled. */
      steps: {
        id: string;
        text: string;
        /** Emoji rendered via PixIcon on the tile/stone. */
        icon: string;
        /** Line shown when this step lands. */
        affirmation?: string;
      }[];
      introTitle: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Board dressing: "river" (W5 stepping stones, default) or "hero"
       *  (W2 Hero Pause: badge trail on a purple backup-signal board). */
      skin?: "river" | "hero";
      /** Label above the path (e.g. "THE HERO PAUSE"). */
      pathLabel?: string;
      /** Complete-beat copy overrides. */
      completeTitle?: string;
      completeLine?: string;
      /** Sarah reads each step's affirmation aloud as it lands (default true). */
      speakSteps?: boolean;
      hints?: { tier1: string; tier2: string };
      /** Sarah's reason on a WRONG tile ("Not quite." + whyWrong); falls back to hints.tier1. */
      whyWrong?: string;
    }
  | {
      /**
       * Chat Simulator (Week 3+). A phone-framed live chat with an
       * escalating uh-oh meter: scripted messages arrive with a typing
       * indicator, the meter climbs as things get icky, and at set points
       * the child picks how to respond. The DECIDE mechanic for
       * chats-that-turn-uncomfortable — trust the funny feeling, then
       * stop and tell.
       */
      type: "chatSimulator";
      /** Header title on the phone (e.g. "New Chat Request"). */
      chatTitle?: string;
      /** One-line scene-setter shown above the phone. */
      scenario: string;
      /** The transcript, in order (the order IS the lesson; never shuffled).
       *  Sarah reads each bubble aloud as it lands. */
      messages: { sender: "stranger" | "narrator"; text: string; delay?: number }[];
      choices: {
        /** 0-based message index this choice moment fires after. */
        triggerAfterMessage: number;
        /** Reply options (shuffled at runtime); `feedback` is read aloud after the pick. */
        options: { text: string; isSafe: boolean; feedback: string }[];
      }[];
      /** Intro copy overrides (defaults keep the W3 uh-oh meter skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Sarah reads bubbles + feedback aloud (recorded only). Default true. */
      speakMessages?: boolean;
    }
  | {
      /**
       * Secret Identity Machine (Week 2). Three part-reels (hero word /
       * creature / lucky number) forge a username. TRAP parts carrying
       * real-life details (a first name, an age, a birth year, a school)
       * are mixed in: picking one trips a LEAK! alarm + teach panel and
       * drops the disguise meter; safe picks raise it. Meter full → the
       * avatar's ID badge is stamped. Judges identity-leakage, not
       * password strength — deliberately unlike threeRandomWords.
       */
      type: "usernameBuilder";
      slots: { id: string; label: string; icon: string }[];
      parts: {
        id: string;
        text: string;
        slotId: string;
        /** If set, this part LEAKS real info; value = why (teach copy). */
        trap?: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
        why?: string;
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      type: "memoryMatch";
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introWelcome?: string;
      pairs: { term: string; match: string; colour: string; why?: string }[];
    }
  | {
      /**
       * The wall builder (rebuilt for Week 4 as "The No-Bite Wall"). The BUILD
       * drill: bricks arrive one at a time in a tray; tap a column to lay a
       * safe habit into the wall, or tap the bin to throw a bad one out. No
       * timer, no lose state: a wrong move teaches and the same brick waits.
       * The wall is complete when every good brick is laid. Bricks shuffle per
       * play; round 1 is guided.
       */
      type: "firewallBuilder";
      bricks: {
        id: string;
        /** The brick's text, five words or fewer. */
        text: string;
        /** True = belongs in the wall; false = goes in the bin. */
        good: boolean;
        /** Sarah reads the brick as it arrives (one clip). */
        readAloud: string;
        /** Sarah's reason on the right move ("That's right!" + why). */
        why: string;
        /** Sarah's teach on the wrong move ("Not quite." + whyWrong). */
        whyWrong: string;
      }[];
      /** Copy overrides (defaults keep the W4 no-bite skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      wallLabel?: string;
      binLabel?: string;
      layToast?: string;
      binToast?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier1: string; tier2: string };
    }
  | {
      type: "spamBlaster";
      emails: {
        sender: string;
        subject: string;
        isPhishing: boolean;
        clue: string;
        /** Sarah's reason on a RIGHT answer ("That's right!" + why). Defaults to the clue. */
        why?: string;
      }[];
      /** Intro card copy overrides (re-theme per week). */
      introTitle?: string;
      introDescription?: string;
      /** In-canvas goal headline override. */
      headline?: string;
      /** HUD label for tricks that slipped through (default "VIRUSES"). */
      missLabel?: string;
      /** Intro card icon (PixIcon key; default "📧"). */
      introIcon?: string;
      /** Tiered wrong-try hints (defaults keep the Week 1 email copy). */
      hints?: { tier1: string; tier2: string; tier2Example?: string; tier3?: string };
      /** Per-week copy (device title, pile label, wrong-panel + finish text;
       *  templates may use {sender} {subject} {clue}). A reuse must be a genuine
       *  re-theme, so every visible word is re-skinnable. */
      copy?: {
        deviceTitle?: string;
        inboxLabel?: string;
        missWord?: string;
        missWordPlural?: string;
        clearLabel?: string;
        safeFloater?: string;
        safeWrongTitle?: string;
        safeWrongExplanation?: string;
        safeWrongTip?: string;
        missTitle?: string;
        missExplanation?: string;
        missClueFallback?: string;
        missTip?: string;
        finishTitle?: string;
        deliveredWord?: string;
      };
    }
  | {
      /**
       * Cyber Maze (Week 3 debut as "The Meet-Up Maze"). The NAVIGATE drill:
       * tap a lit square next to the hero to move through a glowing maze; five
       * forks are blocked by a gate where the fake friend proposes something
       * and three replies fan out (shuffled at runtime). The hero reply opens
       * the gate (Sarah reads the `why`); a wrong reply teaches (`explanation`)
       * and the gate stays shut for another go. Tap-only, no timer, no lose.
       */
      type: "cyberMaze";
      questions: {
        /** The gate's proposal / question, read aloud as the gate card opens. */
        question: string;
        /** Reply options; authored data may lead with the hero reply. */
        answers: string[];
        correctIndex: number;
        /** Who is asking (shown on the gate card as a chat bubble). */
        from?: string;
        /** Sarah's spoken why after the hero reply. */
        why?: string;
        /** Teach copy on a wrong reply. */
        explanation?: string;
      }[];
      /** Copy overrides (defaults keep the generic cyber-maze skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      gateLabel?: string;
      gatesLabel?: string;
      tokensLabel?: string;
      movePrompt?: string;
      gateToast?: string;
      wrongTitle?: string;
      wrongTip?: string;
      /** Gate-card wording: the pick instruction, the reply heading, the complete-beat count noun. */
      pickPrompt?: string;
      replyPrompt?: string;
      gatesDoneLabel?: string;
      completeTitle?: string;
      completeLine?: string;
      hints?: { tier2: string; tier3: string };
      /** Visual skin: "default" (Week 3) or "darkroom" (Week 8 amber safelight). */
      skin?: "default" | "darkroom";
    }
  | {
      /**
       * Concept Recap checkpoint — fires after each Learn→Play→Prove loop
       * to consolidate the win and chunk the week into clear chapters
       * (so it doesn't feel like flicking through screens). Shows a
       * celebratory "Concept X of N", a plain one-line takeaway of what
       * was just learned, what's coming next, and a progress track.
       * Narrated by Sarah via the shared `narration` field.
       */
      type: "recap";
      /** 1-based index of the concept just completed. */
      concept: number;
      /** Total concepts in the week (for the progress track). */
      total: number;
      /** Plain one-line takeaway, e.g. "A password is a secret code…". */
      learned: string;
      /** What's coming next. Omit/replace with a finale line on the last. */
      next?: string;
      /** Header emblem glyph (defaults to ✅). */
      emblem?: string;
    }
  | { type: "bossBattle" }
  | { type: "completion" }
) & {
  /**
   * Optional spoken intro narration — available on ANY screen. Exercises use
   * it for a paced, read-aloud "here's what to do" intro; info screens use it
   * as the in-screen teaching narration. The ElevenLabs generator scans for
   * `narration: { speaker, lines }` blocks here, so this also drives the audio.
   */
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional "teach-once" coach line played IN the exercise at the first
   * action (e.g. "Go on — tap any word to begin!"), then it gets out of the
   * way. Distinct from the intro `narration`: this reinforces the first rep
   * contextually, on the board. The ElevenLabs generator also scans
   * `coachLines: { speaker, lines }` blocks so these get a recorded voice.
   */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional spoken acknowledgment read aloud on an exercise's COMPLETE screen
   * ("well done, now you can X, use it in the real world, this is what you
   * learned"). The ElevenLabs generator scans `completeNarration` blocks too.
   */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional spoken prompt (Sarah) for Choose-Your-Path scenarios, read AFTER
   * the storyteller narrator reads the situation ("which one do you think?").
   * The generator scans `promptNarration` blocks too.
   */
  promptNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional "Spot the Danger" preamble folded into a game's own intro: the
   * Hacker Raccoon's boast, shown above the warm mission so the get-ready is
   * ONE screen (no separate `type:"threat"` scene). The Learn Loop merges the
   * threat beat into the game intro this way. Shown as text in his bubble.
   */
  threat?: { raccoonLine: string };
  /**
   * Optional "Concept N of M" progression marker for a Learn (info) screen, so
   * it shares the same label as its end-of-concept checkpoint (recap). Makes
   * the Learn → Play → Prove → Complete loop read as one numbered concept.
   */
  conceptNumber?: number;
  conceptTotal?: number;
};

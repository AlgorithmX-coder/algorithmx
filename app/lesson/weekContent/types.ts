import type { CutsceneSlide } from "@/app/components/StoryCutscene";

export interface WeekContent {
  weekNumber: number;
  title: string;
  topic: string;
  badgeName: string;
  badgeIcon: string;

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

  /**
   * Bespoke BUILD-FINAL boss (Week 2's Profile Forge). When present,
   * the lesson mounts ProfileForgeBoss instead of the quiz-combat
   * BossBattle: five phases, each a DIFFERENT micro-game, reported
   * through the same BossEndStats/phaseResults contract so the parent
   * dashboard and analytics are unchanged. Exactly five phases, one
   * per concept, in order: whack, hand, grill, assemble, rapid.
   */
  bossForge?: {
    /** WHACK — leaky entries fly toward the form; swat the private ones,
     *  let the safe ones dock. */
    whack: {
      id: string;
      label: string;
      intro: string;
      /** Line stamped on the profile card when this phase is beaten. */
      stamp: string;
      entries: { id: string; text: string; icon: string; isPrivate: boolean; explanation: string }[];
    };
    /** HAND — the Raccoon fans out cards; pick the safe ones for the
     *  About Me section. */
    hand: {
      id: string;
      label: string;
      intro: string;
      /** Line stamped on the profile card when this phase is beaten. */
      stamp: string;
      /** How many safe picks complete the phase. */
      picks: number;
      cards: { id: string; text: string; icon: string; isSafe: boolean; explanation: string }[];
    };
    /** GRILL — a disguised popup demands info; press WHY? until the
     *  excuses collapse. Breather phase: no fail state. */
    grill: {
      id: string;
      label: string;
      intro: string;
      /** Line stamped on the profile card when this phase is beaten. */
      stamp: string;
      demand: string;
      /** Escalating (crumbling) excuses, one per WHY press. */
      excuses: string[];
      collapse: string;
    };
    /** ASSEMBLE — rebuild the hero name from safe tiles; leak tiles
     *  pulse temptingly and teach when tapped. */
    assemble: {
      id: string;
      label: string;
      intro: string;
      /** Line stamped on the profile card when this phase is beaten. */
      stamp: string;
      /** Tiles in slot order; exactly the non-trap tiles spell the name. */
      tiles: { id: string; text: string; trap?: string }[];
      /** The finished hero name, for the completion stamp. */
      result: string;
    };
    /** RAPID — mask off: quick-fire demands; NOPE the private ones,
     *  SHARE the genuinely safe asks. */
    rapid: {
      id: string;
      label: string;
      intro: string;
      /** Line stamped on the profile card when this phase is beaten. */
      stamp: string;
      /** Seconds per demand before a gentle timeout-teach. */
      secs: number;
      demands: { id: string; text: string; isPrivate: boolean; explanation: string }[];
    };
  };

  /**
   * Bespoke COMBAT boss (Week 1's Cracking Machine). When present, the
   * lesson mounts VaultBoss instead of the quiz-combat BossBattle.
   *
   * KID-FIRST CONTRACT (ages 6-9): the whole fight uses exactly two
   * verbs — TAP a big stationary thing, and press-and-HOLD one button.
   * Nothing is timed, nothing moves that must be caught, and there are
   * no trap options. One password is built across all five phases
   * (build words → mix → keep secret → not obvious → forge to 400
   * years). Each phase opens with ONE spoken coach line (`coach`, read
   * by Will — no reading required) while the target pulses.
   *
   * Reported through the same BossEndStats/phaseResults contract with
   * the SAME phase ids as the shipped quiz boss, so family analytics
   * stay continuous. No lose state.
   */
  bossVault?: {
    /** LENGTH — tap the big word blocks; each SLAMS onto the vault door.
     *  All blocks are good: a guaranteed confidence win to open. */
    wall: {
      id: string;
      label: string;
      intro: string;
      crackTime: string;
      /** The word blocks, in display order. Tapping all of them wins. */
      blocks: string[];
      /** One spoken instruction (audio: /audio/coach/vault-go-wall.mp3). */
      coach: string;
    };
    /** MIX — tap each mixer once; the password transforms and his
     *  decoder screen cracks tap by tap until it explodes. */
    scrambler: {
      id: string;
      label: string;
      intro: string;
      crackTime: string;
      /** The plain password his decoder locks onto (phase 1's result). */
      baseWord: string;
      mixers: { id: string; label: string; icon: string; kind: "caps" | "number" | "symbol" }[];
      coach: string;
    };
    /** SECRET — press-and-hold to cover the keypad when spy eyes open.
     *  Slow telegraph, generous forgiveness. */
    cover: {
      id: string;
      label: string;
      intro: string;
      crackTime: string;
      /** Snoop events to survive, and how long each eye stays open. */
      snoops: number;
      openSecs: number;
      /** Teach copy when a peek lands uncovered. */
      explanation: string;
      coach: string;
    };
    /** OBVIOUS — tap the junk passwords to feed them to the Guess-o-Tron
     *  until it overloads; YOUR golden password isn't on his list. */
    feed: {
      id: string;
      label: string;
      intro: string;
      crackTime: string;
      /** Junk passwords; `note` is the fun fact shown as each is eaten. */
      junk: { id: string; text: string; note: string }[];
      /** The child's golden un-guessable password (not feedable). */
      yours: string;
      coach: string;
    };
    /** FINAL — press-and-HOLD the golden forge button to charge the
     *  password to 400 years, then refuse the sweet talk and watch the
     *  machine detonate against it. */
    final: {
      id: string;
      label: string;
      intro: string;
      crackTime: string;
      /** The finished 400-year password. */
      forged: string;
      /** Total seconds of held charge needed (release just pauses). */
      chargeSecs: number;
      /** Counter text at 1/3, 2/3 and full charge. */
      milestones: [string, string, string];
      /** His last-ditch ask, the refusal label, and the teach if told. */
      sweetTalk: string;
      refuse: string;
      tellExplanation: string;
      coach: string;
    };
  };

  /**
   * Bespoke SHOWDOWN boss (Weeks 3-20, the boss batch). When present the
   * lesson mounts ShowdownBoss instead of the quiz-combat BossBattle.
   *
   * THE LOCKED GRAMMAR (docs/cyberheroes/content-plans/boss-battles-design.md):
   * every boss is a machine the Raccoon wheels in. Arrival taunt → three
   * phases (each one of the week's authored `bossAttacks`: telegraph →
   * counter → gear pops) → one weak-point question per popped gear (the
   * best of the week's authored bossQuestions) → CHARGE-RELEASE finisher →
   * unique escape line. Two verbs only (tap + hold), no lose state, no
   * hard timers; comfort mode is honoured by construction.
   *
   * Reported through the same BossEndStats/phaseResults contract as
   * VaultBoss/ProfileForgeBoss so dashboards and analytics are unchanged.
   */
  bossShowdown?: ShowdownDef;

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

/* ───────────────────── SHOWDOWN boss (Weeks 3-20) ─────────────────────
   Shapes for the config-driven boss engine (ShowdownBoss.tsx). Five
   counter primitives, dressed uniquely per week; every phase references
   one of the week's authored bossAttacks by index for its telegraph. */

/** TAP-THE-TELL — a trick object appears; tap the red flag on it.
 *  Turn-based: wrong taps teach and retry, nothing moves. */
export type ShowdownTapTell = {
  kind: "tapTell";
  attack: number;
  coach: string;
  rounds: {
    id: string;
    /** The trick object being inspected this round. */
    prompt: string;
    promptIcon: string;
    options: { id: string; label: string; icon: string; isTell: boolean; note: string }[];
  }[];
};

/** SHIELD-HOLD — a pressure barrage rages; press-and-hold the shield
 *  until it burns out. Release just pauses the burn. No deadline. */
export type ShowdownShieldHold = {
  kind: "shieldHold";
  attack: number;
  coach: string;
  holdLabel: string;
  holdIcon: string;
  /** Total seconds of held charge needed to burn the attack out. */
  holdSecs: number;
  /** Pressure lines cycling on the attack panel while it rages. */
  barrage: string[];
  /** Shown when the barrage burns out — the teach, made visible. */
  burnoutLine: string;
};

/** COUNTER-CARD — the attack lands as a situation; pick the right
 *  defence from three big cards. Wrong picks teach and retry. */
export type ShowdownCounterCard = {
  kind: "counterCard";
  attack: number;
  coach: string;
  situation: string;
  situationIcon: string;
  cards: { id: string; label: string; icon: string; isRight: boolean; note: string }[];
};

/** ORDER-STRIKE — tap the counter-steps in the right sequence; each
 *  correct step lands a hit. Authored array order = correct order
 *  (display is shuffled deterministically). */
export type ShowdownOrderStrike = {
  kind: "orderStrike";
  attack: number;
  coach: string;
  intro: string;
  steps: { id: string; label: string; icon: string }[];
};

/** DEFLECT-SORT — his things slide in one at a time; hit the primary
 *  verb on the right ones, wave the others through. Turn-based. */
export type ShowdownDeflectSort = {
  kind: "deflectSort";
  attack: number;
  coach: string;
  /** Primary action label (ZAP IT! / CATCH IT!) + its icon. */
  actLabel: string;
  actIcon: string;
  /** Secondary action label (LET IT PASS / WAVE IT ON). */
  passLabel: string;
  items: {
    id: string;
    label: string;
    icon: string;
    /** true = the primary action is the right response for this item. */
    act: boolean;
    note: string;
  }[];
};

export type ShowdownPhaseDef =
  | ShowdownTapTell
  | ShowdownShieldHold
  | ShowdownCounterCard
  | ShowdownOrderStrike
  | ShowdownDeflectSort;

export interface ShowdownDef {
  machine: {
    /** Nameplate, e.g. "THE DISGUISE-O-MATIC". */
    name: string;
    /** One-line subtitle under the nameplate at arrival. */
    tagline: string;
    /** Damage-state art, following the crackomatic convention. */
    art: { intact: string; damaged: string; defeated: string };
    /** Arena backdrop plate (full-bleed, per week). */
    arena: string;
    /** Week palette for chrome accents. */
    accent: string;
    glow: string;
  };
  /** Per-week hero outfit sprites (OpenArt). Missing keys fall back to
   *  the base wardrobe via makeHeroes. */
  heroSprites?: Partial<
    Record<
      "adam" | "layla",
      Partial<{ idle: string; attack: string; celebrate: string }>
    >
  >;
  /** Exactly three phases, each keyed to a bossAttacks index. */
  phases: ShowdownPhaseDef[];
  /** One weak-point question per phase, asked when its gear pops. */
  weakPoints: BossQuestion[];
  finisher: {
    chargeLabel: string;
    chargeIcon: string;
    /** Total seconds of held charge (release pauses, never resets). */
    chargeSecs: number;
    /** Counter text at 1/3, 2/3 and full charge. */
    milestones: [string, string, string];
    /** Big stamp when the release lands, e.g. "COSTUME BLASTED OFF!". */
    payoffTitle: string;
    /** The wrap-up teach line under the stamp. */
    payoffLine: string;
  };
  villain: {
    arrival: string;
    /** One announce line per phase — never repeated across weeks. */
    phases: string[];
    /** Victory-screen bubble (W20: the defeat send-off). */
    escape: string;
  };
  /** Slug for voiced lines: /audio/villain/{slug}-arrival.mp3,
   *  {slug}-phase-1..3.mp3, {slug}-escape.mp3 and /audio/coach/
   *  {slug}-go-1..3.mp3, {slug}-victory.mp3. Omit = text-only. */
  voiceSlug?: string;
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
  | { type: "mission"; objectives: string[] }
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
      items: { text: string; isStrong: boolean; explanation: string }[];
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
      choices: { text: string; isCorrect: boolean }[];
      /** `lie` mode: the Raccoon's bogus claim shown in his speech bubble. */
      raccoonLine?: string;
      praise?: string;
      nudge?: string;
      /** `speed` mode urgency window (ms). Cosmetic. */
      speedMs?: number;
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
        }[];
        /** Optional speaker hint for the WrongAnswerPanel ("layla"|"adam"). */
        speaker?: "adam" | "layla";
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
        /** Sentence shown in the WrongAnswerPanel when the child mis-sorts this item. */
        explanation: string;
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
      /** Zone label overrides (re-theme the 4 inspect zones). */
      zoneLabels?: Partial<Record<"sender" | "link" | "urgency" | "claim", string>>;
      emails: {
        id: string;
        sender: string;
        subject: string;
        body: string;
        isPhishing: boolean;
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
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      popups: {
        /** Stable id e.g. "pop-1". */
        id: string;
        /** Headline shown big in the popup. */
        title: string;
        /** Optional supporting line under the headline. */
        body?: string;
        /** Emoji that prefixes the title for visual flavour. */
        icon?: string;
        /** Why this popup is a trick - shown in the wrong-answer panel if the child taps OK. */
        whyTrick: string;
      }[];
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
      /** The shared starter password all accounts initially use. */
      sharedPassword: string;
      /** Which account in `accounts` the Raccoon has compromised (id). */
      leakedAccountId: string;
      accounts: {
        id: string;
        /** Display name e.g. "Roblox". */
        label: string;
        /** Optional emoji icon. */
        icon?: string;
      }[];
      /** Bank of strong replacement password options. Need >= accounts.length. */
      passwordBank: {
        id: string;
        /** The password text shown on the chip. */
        text: string;
      }[];
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
      }[];
      /**
       * Presentation variant. `device` stages each scenario as an in-world
       * device screen (app chrome + a big PAUSE action) instead of the
       * classic text card — Week 2's "The Pause Button" skin. Omitting it
       * keeps the classic Week 1 look.
       */
      presentation?: "device";
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
      }[];
      hints?: { tier1: string; tier2: string };
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
          /** True = the imposter (exactly one per round). */
          isFake: boolean;
          /** Teach copy: why fake / why it checks out. */
          note: string;
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
      }[];
      hints?: { tier1: string; tier2: string };
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
        options: { text: string; isCorrect: boolean; explanation: string }[];
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
      /** Screen blocks that STAY on the plank (balance keeps the fun). */
      keptBlocks: { label: string; icon: string }[];
      swaps: {
        id: string;
        /** The highlighted screen block's story. */
        story: string;
        /** Chip label/icon for the block on the screen side. */
        blockLabel: string;
        blockIcon: string;
        /** Three options; exactly one isBalancing. */
        options: {
          label: string;
          /** Emoji rendered via PixIcon on the card. */
          icon: string;
          isBalancing: boolean;
          /** Teach copy when a fake-recharge decoy is picked. */
          note: string;
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
      doors: {
        id: string;
        /** The shiny sign's claim, e.g. "FREE GAME COINS!" */
        claim: string;
        /** Emoji rendered via PixIcon on the sign. */
        icon: string;
        /** The real address revealed under the plaque. */
        address: string;
        /** True = the address matches the claim (an honest door). */
        matches: boolean;
        /** Teach copy shown on a wrong verdict for this door. */
        note: string;
      }[];
      /** Copy overrides (defaults keep the W16 doorway skin). */
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      peekPrompt?: string;
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
      rounds: {
        id: string;
        /** Round prompt, e.g. "Forge the FIRST pair". */
        prompt: string;
        /** 3 metal blanks; exactly one isStrong. */
        options: {
          /** The digit pair on the blank, e.g. "58". */
          digits: string;
          /** Kid-readable tell under the digits. */
          tell: string;
          isStrong: boolean;
          /** WrongAnswerPanel copy when a guessable blank is hammered. */
          explanation: string;
        }[];
      }[];
      introTitle?: string;
      introSubtitle?: string;
      introIcon?: string;
      /** Label over the quality meter (default GUESS-O-METER). */
      meterLabel?: string;
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
      hints?: { tier1: string; tier2: string };
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
      messages: { sender: "stranger" | "narrator"; text: string; delay?: number }[];
      choices: {
        /** 0-based message index this choice moment fires after. */
        triggerAfterMessage: number;
        options: { text: string; isSafe: boolean; feedback: string }[];
      }[];
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
      }[];
      hints?: { tier1: string; tier2: string };
    }
  | {
      type: "memoryMatch";
      /** Intro copy overrides (re-theme per week). */
      introTitle?: string;
      introSubtitle?: string;
      introWelcome?: string;
      pairs: { term: string; match: string; colour: string }[];
    }
  | {
      type: "firewallBuilder";
      goodBlocks?: string[];
      badBlocks?: string[];
    }
  | {
      type: "spamBlaster";
      emails: {
        sender: string;
        subject: string;
        isPhishing: boolean;
        clue: string;
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
    }
  | {
      type: "cyberMaze";
      questions: {
        question: string;
        answers: string[];
        correctIndex: number;
      }[];
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
};

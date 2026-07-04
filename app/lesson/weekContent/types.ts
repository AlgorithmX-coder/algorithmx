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
       * loop. One question, no hints, an instant win. Four flavours via
       * `mode` so five in a row never feel the same:
       *   finish - complete the rule ("Keep it ___")
       *   speed  - beat the urgency bar (never hard-fails)
       *   lie    - catch the Raccoon's claim (TRUE / FALSE)
       *   recall - one-tap "which?"
       */
      type: "quickCheck";
      mode: "finish" | "speed" | "lie" | "recall";
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
      /** Exactly two categories. `tone` picks the chute styling. */
      categories: { id: string; label: string; icon: string; tone: "safe" | "lock" }[];
      items: {
        id: string;
        text: string;
        /** Optional emoji badge on the card. */
        icon?: string;
        categoryId: string;
        /** Shown in the WrongAnswerPanel on a mis-sort. */
        explanation: string;
      }[];
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

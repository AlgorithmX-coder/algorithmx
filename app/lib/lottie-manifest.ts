/**
 * Lottie manifest — one place to register every .lottie file the app uses.
 *
 * Drop a Lottie file in /public/lottie/ and add its path here. The rest
 * of the codebase consumes these constants, so a missing file shows
 * the legacy fallback (canvas-confetti) and a swap is one line.
 *
 * Format: prefer .lottie (binary, smaller) over .json. Both work.
 *
 * ─── How to fill these in ─────────────────────────────────────
 *
 * 1. Subscribe to LottieFiles Pro at https://lottiefiles.com/pricing
 *    ($19.99/mo).  Pro lets you use any animation in commercial work.
 *
 * 2. Search the marketplace for these specific concepts (suggested
 *    queries that work well):
 *      - correct       → "checkmark celebration", "success burst", "stars confetti"
 *      - correctBig    → "fireworks confetti", "celebration explosion"
 *      - wrong         → "x mark error", "shake head", "thinking face"
 *      - badge         → "trophy", "medal celebration", "achievement unlock"
 *      - characterIdle → "kid waving", "child idle", "boy idle loop"
 *      - characterTalk → "kid talking", "speaking child"
 *      - characterExcited → "happy kid jump", "child excited"
 *      - characterWorried → "worried child", "thinking kid"
 *      - missionBriefHero → "hero kid", "child superhero pose"
 *      - lessonComplete  → "graduation", "diploma", "certificate"
 *
 * 3. Download as .lottie. Save into /public/lottie/ with the suggested
 *    filename below.
 *
 * 4. Set the path here.  The lesson player picks it up immediately.
 *
 * Until any are filled in, the corresponding effect falls back to the
 * cyber-confetti / shake we already shipped. No regression.
 */

export const LOTTIE_OVERLAYS = {
  /** Plays on every correct answer (streak < 5). */
  correct: undefined as string | undefined,
  /** Bigger celebration for high streaks (>= 5). Optional. */
  correctBig: undefined as string | undefined,
  /** Plays alongside the body shake on a wrong answer. */
  wrong: undefined as string | undefined,
  /** Plays on milestone badge / week-complete. */
  badge: undefined as string | undefined,
};

/**
 * Character animations — used inside lesson screens for idle / react /
 * talk states. Wire these into specific cases as Lotties land.
 *
 * Naming: <character>_<state>. Set to undefined when nothing's
 * available; consumers fall back to the existing static PNG.
 */
export const LOTTIE_CHARACTERS = {
  adam: {
    idle: undefined as string | undefined,
    talk: undefined as string | undefined,
    excited: undefined as string | undefined,
    worried: undefined as string | undefined,
  },
  layla: {
    idle: undefined as string | undefined,
    talk: undefined as string | undefined,
    excited: undefined as string | undefined,
    worried: undefined as string | undefined,
  },
  robo: {
    idle: undefined as string | undefined,
    talk: undefined as string | undefined,
  },
  raccoon: {
    idle: undefined as string | undefined,
    taunt: undefined as string | undefined,
    defeated: undefined as string | undefined,
  },
};

/**
 * Misc decorative Lotties — backgrounds, transitions, ambient loops.
 */
export const LOTTIE_DECORATIVE = {
  /** Cosmic background loop on mission-brief / between-case fades. */
  cosmicAmbience: undefined as string | undefined,
  /** Sparkles / dust motes overlay. */
  sparkleField: undefined as string | undefined,
  /** Lesson-complete graduation animation. */
  graduation: undefined as string | undefined,
};

/**
 * Voice interjection catalogue - short voiced cues that play ON TOP
 * of the existing SFX chimes (correct.mp3, wrong.mp3, etc.) to make
 * the moment feel like a real person is reacting, not just a chime.
 *
 * All lines are recorded in Will's voice (the product narrator) via
 * scripts/elevenlabs-generate-interjections.mjs. The generator reads
 * this file as source-of-truth, so any change here triggers a fresh
 * MP3 on next run.
 *
 * Keep lines:
 *   - SHORT (≤ 6 words) - they layer on top of chimes; long lines
 *     fight with the chime and the next user action
 *   - WARM, not condescending - "Nice work!" not "Well done you!"
 *   - VARIED in tone - kids hearing the SAME line every correct
 *     answer notice the loop in ~2 minutes
 *   - SOFT on wrong - we never punish ("Not quite!" not "Wrong!")
 *
 * Triggers map to useGameAudio facade methods.
 */

export type InterjectionTrigger =
  | "correct"
  | "wrong"
  | "streak3"
  | "streak5"
  | "streak7"
  | "unlock"
  | "victory"
  | "lessonStart";

/**
 * Master list of lines per trigger. Numbers are intentionally varied
 * per trigger - higher-traffic triggers (correct, wrong) need more
 * variants to avoid loop fatigue across a 45-min session.
 */
export const VOICE_INTERJECTIONS: Record<InterjectionTrigger, string[]> = {
  // Most-fired trigger - 8 variants to cover a typical 25-30
  // correct-answer session without obvious repetition. Leading
  // eleven_v3 tags ([warmly]/[excited]/...) render as DELIVERY, not
  // words - these lines are audio-only, so nothing needs stripping.
  correct: [
    "[warmly] Nice work!",
    "[excited] Brilliant!",
    "[warmly] You got it!",
    "[excited] Yes!",
    "[warmly] That's right!",
    "[excited] Spot on!",
    "[warmly] Great job!",
    "[excited] Awesome!",
  ],
  // Soft tone - we never want to make a kid feel bad for trying.
  // No "wrong" or "incorrect" - always encouraging the retry.
  wrong: [
    "[warmly] Try again!",
    "[warmly] Not quite!",
    "[warmly] Have another go!",
    "[curious] Hmm, look again!",
    "[warmly] Nearly!",
    "[warmly] Almost!",
  ],
  // Streaks escalate in excitement as the run grows.
  streak3: [
    "[excited] Three in a row!",
    "[excited] Nice streak!",
    "[excited] Keep going!",
  ],
  streak5: [
    "[excited] Five in a row!",
    "[excited] On fire!",
    "[excited] You're crushing it!",
  ],
  streak7: [
    "[excited] Seven straight!",
    "[excited] Unstoppable!",
    "[excited] Cyber Hero!",
  ],
  // Unlock = big moment (sticker, lock activate, vault open).
  unlock: [
    "[excited] Yes!",
    "[excited] Unlocked!",
    "[excited] Awesome!",
    "[excited] Wow!",
  ],
  // Victory = end-of-boss / mission complete. Bigger energy.
  victory: [
    "[excited] You did it!",
    "[excited] Cyber Hero!",
    "[excited] Amazing!",
    "[excited] Mission complete!",
  ],
  // Plays on lesson-start / week-start. Smaller pool because it
  // only fires once per session.
  lessonStart: [
    "[excited] Let's go!",
    "[warmly] Ready? [excited] Here we go!",
  ],
};

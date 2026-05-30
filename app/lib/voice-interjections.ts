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
  // correct-answer session without obvious repetition.
  correct: [
    "Nice work!",
    "Brilliant!",
    "You got it!",
    "Yes!",
    "That's right!",
    "Spot on!",
    "Great job!",
    "Awesome!",
  ],
  // Soft tone - we never want to make a kid feel bad for trying.
  // No "wrong" or "incorrect" - always encouraging the retry.
  wrong: [
    "Try again!",
    "Not quite!",
    "Have another go!",
    "Hmm, look again!",
    "Nearly!",
    "Almost!",
  ],
  // Streaks escalate in excitement as the run grows.
  streak3: [
    "Three in a row!",
    "Nice streak!",
    "Keep going!",
  ],
  streak5: [
    "Five in a row!",
    "On fire!",
    "You're crushing it!",
  ],
  streak7: [
    "Seven straight!",
    "Unstoppable!",
    "Cyber Hero!",
  ],
  // Unlock = big moment (sticker, lock activate, vault open).
  unlock: [
    "Yes!",
    "Unlocked!",
    "Awesome!",
    "Wow!",
  ],
  // Victory = end-of-boss / mission complete. Bigger energy.
  victory: [
    "You did it!",
    "Cyber Hero!",
    "Amazing!",
    "Mission complete!",
  ],
  // Plays on lesson-start / week-start. Smaller pool because it
  // only fires once per session.
  lessonStart: [
    "Let's go!",
    "Ready? Here we go!",
  ],
};

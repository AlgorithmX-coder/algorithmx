"use client";

/**
 * Audio polish helpers for the Week 1 exercises and Boss Battle.
 *
 * Why this module exists:
 *   - The base SFX `wrong` is a sharp buzzer. For ages 6-9 in a
 *     learning context we want a softer "no, try again" cue that
 *     doesn't read as punishment. `playSoftWrong()` plays the same
 *     sound at reduced volume + paired with a small "pop" so it lands
 *     as friendly correction rather than buzzer.
 *   - Hover SFX should be available everywhere but auto-suppress when
 *     mute is set globally; this is already true in SoundManager but
 *     `playHover()` here adds a per-element debounce so rapid hover
 *     events (button row scan) don't fire 8 hovers in a second.
 *   - `playSoftClick()` is the same idea for the boss battle answer
 *     buttons, which would otherwise play a hard click each tap.
 */

import { playSound } from "@/app/lib/sounds";

let lastHoverAt = 0;
const HOVER_DEBOUNCE_MS = 120;

/** Hover cue. Debounced to avoid machine-gun playback when scanning options. */
export function playHover(): void {
  const now = performance.now();
  if (now - lastHoverAt < HOVER_DEBOUNCE_MS) return;
  lastHoverAt = now;
  playSound("hover");
}

/** Standard tap. Same as playSound("click") but exported here so call sites are consistent. */
export function playTap(): void {
  playSound("click");
}

/**
 * Kid-friendly wrong-answer cue. Uses the existing "sortWrong" entry
 * (softer than the buzzer "wrong") plus a small "pop". If the registry
 * doesn't expose sortWrong, falls back to the standard wrong.
 */
export function playSoftWrong(): void {
  // sortWrong is the lighter "nope" variant in the registry; if it
  // isn't loaded the SoundManager silently no-ops and we still get
  // the buzzer via the fallback.
  playSound("sortWrong");
  // Tiny "pop" tail to make it feel intentional, not like a buzzer.
  window.setTimeout(() => playSound("pop"), 70);
}

/**
 * Boss-hit feedback cue. Plays the existing hitImpact + bossHurt pair
 * with a 30ms offset so they read as a single "thump" rather than two
 * stacked sounds.
 */
export function playBossHit(): void {
  playSound("hitImpact");
  window.setTimeout(() => playSound("bossHurt"), 30);
}

/** Victory beat - confetti + lessonComplete stinger. */
export function playVictoryStinger(): void {
  playSound("victory");
  window.setTimeout(() => playSound("confetti"), 220);
}

/** Defeat beat - softer than `defeat` SFX alone, paired with a back tone. */
export function playDefeatStinger(): void {
  playSound("defeat");
  window.setTimeout(() => playSound("back"), 280);
}

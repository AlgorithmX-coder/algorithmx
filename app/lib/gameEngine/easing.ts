/**
 * Easing functions for game-feel tweens. Every function takes
 * `t` in [0, 1] and returns the eased value in [0, 1] (or sometimes
 * slightly outside, for back/elastic).
 *
 * Reference curve names match easings.net so they're easy to look up.
 */

export const linear = (t: number) => t;

export const easeOutQuad = (t: number) => t * (2 - t);
export const easeInQuad = (t: number) => t * t;
export const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

const BACK_C1 = 1.70158;
const BACK_C3 = BACK_C1 + 1;
export const easeOutBack = (t: number) =>
  1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2);

const ELASTIC_C4 = (2 * Math.PI) / 3;
export const easeOutElastic = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1;
};

/** Simple linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clamped linear interpolation - useful when t may exceed [0,1]. */
export const lerpClamped = (a: number, b: number, t: number) =>
  a + (b - a) * Math.max(0, Math.min(1, t));

/**
 * Snap `t` into [0,1] and run it through `easing`. Common one-liner for
 * tween code: `progress = ease01(elapsed / duration, easeOutCubic)`.
 */
export const ease01 = (
  t: number,
  easing: (t: number) => number = easeOutCubic
) => easing(Math.max(0, Math.min(1, t)));

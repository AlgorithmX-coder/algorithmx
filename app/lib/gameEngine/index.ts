/**
 * Game-engine barrel.
 *
 * Shared helpers used by the Week 1 exercises and Boss Battle. Each
 * module is self-contained; import from this barrel or directly.
 */

export { setupHiDpiCanvas, getPointerLogicalPos } from "./canvas";
export type { HiDpiCanvasSetup, HiDpiOptions } from "./canvas";

export {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutQuart,
  easeOutExpo,
  easeOutBack,
  easeOutElastic,
  lerp,
  lerpClamped,
  ease01,
} from "./easing";

export { useRafLoop } from "./useRafLoop";
export type { RafLoopOptions } from "./useRafLoop";

export {
  getQualitySettings,
  useAdaptiveQuality,
  scaledParticleCount,
} from "./adaptiveQuality";
export type { QualitySettings, QualityTier } from "./adaptiveQuality";

export {
  createBurst,
  updateParticles,
  drawParticles,
} from "./hitEffects";
export type { Particle, BurstOptions } from "./hitEffects";

export {
  playHover,
  playTap,
  playSoftWrong,
  playBossHit,
  playVictoryStinger,
  playDefeatStinger,
} from "./audio";

export { useMotionIntensity } from "./useMotionIntensity";
export { useGameAudio } from "./useGameAudio";
export type { GameAudio } from "./useGameAudio";
export { useExerciseFeedback } from "./useExerciseFeedback";
export type {
  ExerciseFeedbackApi,
  ExerciseFeedbackOptions,
} from "./useExerciseFeedback";

/**
 * AlgorithmX Cinematic Engine — barrel export.
 *
 * The single import surface for the shared cinematic machinery. Each
 * Phase 0 batch adds its module's exports here so scenes can pull
 * everything from `@/app/lib/cinematic`.
 */

export * from "./tokens";
export * from "./juice";
export * from "./juiceKeyframes";
export * from "./useTimingScaler";
export * from "./useClimaxSequence";
export { default as SceneShell } from "./SceneShell";
export * from "./SceneShell";
export { default as ChallengePanel } from "./ChallengePanel";
export * from "./ChallengePanel";
export * from "./useHotspotPanel";

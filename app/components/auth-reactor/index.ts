/**
 * Auth Reactor — public surface.
 *
 * Drop-in centrepiece for the auth pages. Consumes the existing
 * `AuthMachineState`; the procedural prototype (AuthReactorModel) is swappable
 * for the production GLB without touching the pages.
 */
export { default as AuthReactorScene } from "./AuthReactorScene";
export { toReactorProgress, useAuthReactorProgress } from "./useAuthReactorProgress";
export { deriveStage, channelsForStage, energyForStage, STAGE_LABEL } from "./authReactorConfig";
export type {
  AuthMachineState,
  AuthMachinePhase,
  AuthReactorProgress,
  AuthReactorStage,
  ReactorQuality,
} from "./authReactorTypes";

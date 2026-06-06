/**
 * Auth Reactor — shared types.
 *
 * The signup/login pages build the existing `AuthMachineState` contract; the
 * reactor never touches form components directly. A single adapter
 * (useAuthReactorProgress) translates `AuthMachineState` → `AuthReactorProgress`
 * → an `AuthReactorStage` (0–8). This file is the boundary both sides agree on,
 * so the procedural prototype can be swapped for a production GLB with no page
 * changes.
 */

/** The existing form/auth state contract (kept identical, re-declared here so
 *  this module is the canonical home and pages can import it from one place). */
export type AuthMachinePhase = "idle" | "armed" | "submitting" | "success" | "error";

export interface AuthMachineState {
  /** 0–6 systems online (derived from valid form fields by the page). */
  modulesOnline: number;
  focus: "name" | "email" | "password" | "confirm" | null;
  phase: AuthMachinePhase;
  reducedMotion: boolean;
  quality: ReactorQuality;
}

export type ReactorQuality = "high" | "medium" | "low";

/** Granular, intent-revealing progress the reactor animates against. */
export interface AuthReactorProgress {
  nameComplete: boolean;
  emailValid: boolean;
  passwordStarted: boolean;
  passwordStrong: boolean;
  passwordsMatch: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  hasError: boolean;
}

/** Stage 0 (dormant) … 8 (error) — see authReactorConfig.deriveStage. */
export type AuthReactorStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

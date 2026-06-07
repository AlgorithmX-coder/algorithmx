/**
 * Auth Reactor — config: the stage machine, palette, and quality tiers.
 *
 * Pure + side-effect-free so it can be unit-tested and read from anywhere
 * (model, controller, leva). All visual numbers the model interpolates toward
 * live here as a single source of truth.
 */

import { ACCESS } from "../auth/accessTokens";
import type { AuthReactorProgress, AuthReactorStage, ReactorQuality } from "./authReactorTypes";

/** Map granular progress → a single stage 0–8 (highest reached wins; the
 *  transient phases error/success/submitting take precedence). */
export function deriveStage(p: AuthReactorProgress): AuthReactorStage {
  if (p.hasError) return 8;
  if (p.isSuccess) return 7;
  if (p.isSubmitting) return 6;
  if (p.passwordsMatch) return 5;
  if (p.passwordStrong) return 4;
  if (p.passwordStarted) return 3;
  if (p.emailValid) return 2;
  if (p.nameComplete) return 1;
  return 0;
}

/** Human-readable status per stage (used by the HUD / dev controls). */
export const STAGE_LABEL: Record<AuthReactorStage, string> = {
  0: "DORMANT",
  1: "IDENTITY",
  2: "COMMS LINK",
  3: "MECHANISM",
  4: "SHIELD",
  5: "ACCESS-READY",
  6: "VERIFYING",
  7: "ACCESS GRANTED",
  8: "DIAGNOSTIC",
};

/** How many of the six channels (panels/paths/lights) are powered at a stage.
 *  Stages 5–7 = all six; error holds the last valid count. */
export function channelsForStage(stage: AuthReactorStage, modulesOnline: number): number {
  if (stage >= 5 && stage <= 7) return 6;
  if (stage === 8) return Math.max(0, Math.min(6, modulesOnline));
  // stages 1..4 light progressively; map the four input steps onto six channels
  return Math.round((Math.max(0, Math.min(4, stage)) / 4) * 6);
}

/** Master 0–1 energy for core/light intensity. Full only on success. */
export function energyForStage(stage: AuthReactorStage): number {
  if (stage === 7) return 1;
  if (stage === 6) return 0.9;
  if (stage === 8) return 0.45;
  return Math.min(1, stage / 5); // 0..1 across dormant→ready
}

/* ── Palette (reuse the auth tokens so the whole surface stays coherent) ── */
export const REACTOR = {
  darkMetal: "#15131f",
  brass: "#c9a25e",
  cyan: ACCESS.cyan,
  violet: ACCESS.violet,
  dormant: ACCESS.dormant,
  charged: ACCESS.charged,
  warn: ACCESS.warn,
  white: "#eaf6ff",
} as const;

/* ── Quality tiers ── */
export interface QualityConfig {
  dpr: [number, number];
  postprocessing: boolean;
  contactShadows: boolean;
  envResolution: number;
  ringSegments: number;
  multisampling: number;
}

export const QUALITY: Record<ReactorQuality, QualityConfig> = {
  high: { dpr: [1, 2], postprocessing: true, contactShadows: true, envResolution: 256, ringSegments: 256, multisampling: 8 },
  medium: { dpr: [1, 1.75], postprocessing: false, contactShadows: false, envResolution: 128, ringSegments: 160, multisampling: 0 },
  low: { dpr: [1, 1.5], postprocessing: false, contactShadows: false, envResolution: 64, ringSegments: 96, multisampling: 0 },
};

/** Geometry constants shared by the prototype model + future GLB controller. */
export const RIG = {
  panelClosedAngle: 0, // hinge rotation at rest (Stage 0)
  panelOpenAngle: 0.62, // ~35° fully deployed
  clampSeatedZ: 0.16,
  clampRetractedZ: 0.04,
  ringBaseSpeed: [0.12, -0.18, 0.26] as const, // outer / middle / inner idle spin
  ringSubmitBoost: 3.2, // brief acceleration on submit
  tilt: [0.2, 0.06, 0] as [number, number, number], // more downward tilt → reads 3D (panel tops visible)
  scale: 1.0,
} as const;

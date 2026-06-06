"use client";

import { useMemo } from "react";
import type { AuthMachineState, AuthReactorProgress } from "./authReactorTypes";
import { channelsForStage, deriveStage, energyForStage } from "./authReactorConfig";

/**
 * Adapter: existing `AuthMachineState` → granular `AuthReactorProgress`.
 *
 * The current contract collapses the form into `modulesOnline` (0–6) + `phase`,
 * so this derives the granular booleans from that count. (Signup fills 4 fields
 * → modulesOnline 0–4; login 2 → 0–2.) This is the documented backwards-compatible
 * shim: when the pages later pass richer per-field flags, only this function
 * changes — no page or reactor churn.
 */
export function toReactorProgress(state: AuthMachineState): AuthReactorProgress {
  const n = state.modulesOnline;
  return {
    nameComplete: n >= 1,
    emailValid: n >= 2,
    passwordStarted: n >= 3,
    passwordStrong: n >= 3,
    passwordsMatch: n >= 4,
    isSubmitting: state.phase === "submitting",
    isSuccess: state.phase === "success",
    hasError: state.phase === "error",
  };
}

/** Memoized derived reactor inputs for a given machine state. */
export function useAuthReactorProgress(state: AuthMachineState) {
  return useMemo(() => {
    const progress = toReactorProgress(state);
    const stage = deriveStage(progress);
    return {
      progress,
      stage,
      channels: channelsForStage(stage, state.modulesOnline),
      energy: energyForStage(stage),
    };
  }, [state]);
}

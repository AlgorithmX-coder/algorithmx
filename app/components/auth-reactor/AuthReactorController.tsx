"use client";

import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import AuthReactorEnvironment from "./AuthReactorEnvironment";
import AuthReactorChamber from "./AuthReactorChamber";
import AuthReactorLighting from "./AuthReactorLighting";
import AuthReactorEffects from "./AuthReactorEffects";
import AuthReactorModel from "./AuthReactorModel";
import { useAuthReactorProgress } from "./useAuthReactorProgress";
import { channelsForStage, energyForStage } from "./authReactorConfig";
import type { AuthMachineState, AuthReactorStage } from "./authReactorTypes";

const DEV = process.env.NODE_ENV !== "production";
const lerp = THREE.MathUtils.lerp;

/** The single layer that turns form state → visual state, merges optional dev
 *  overrides, and composes the scene. Form components never touch this. */
function Rig({ stage, reducedMotion, lookAtX }: { stage: AuthReactorStage; reducedMotion: boolean; lookAtX: number }) {
  useFrame((st, dt) => {
    const cam = st.camera;
    const success = stage === 7;
    const t = st.clock.elapsedTime;
    // Slightly elevated, looking down a touch so the chamber floor reads. The
    // negative lookAt-X (desktop) yaws the view so the reactor sits centre-right
    // over a full-bleed floor, leaving the left for the form.
    const tz = reducedMotion ? 6.0 : success ? 5.2 : 6.0;
    const dx = reducedMotion || success ? 0 : Math.sin(t * 0.1) * 0.25;
    const dy = reducedMotion ? 0.35 : 0.35 + (success ? -0.05 : Math.sin(t * 0.07) * 0.08);
    cam.position.z = lerp(cam.position.z, tz, Math.min(1, dt * (success ? 2 : 1.2)));
    cam.position.x = lerp(cam.position.x, dx, Math.min(1, dt * 1.2));
    cam.position.y = lerp(cam.position.y, dy, Math.min(1, dt * 1.2));
    cam.lookAt(lookAtX, -0.05, 0);
  });
  return null;
}

export default function AuthReactorController({ state }: { state: AuthMachineState }) {
  const derived = useAuthReactorProgress(state);

  // Dev-only controls (Leva). In production the panel is never rendered, so the
  // overrides stay at their "use real state" defaults and have no effect.
  const ctl = useControls("Auth Reactor (dev)", {
    stageOverride: { value: -1, min: -1, max: 8, step: 1 },
    panelOpen: { value: -1, min: -1, max: 1, step: 0.01 },
    coreIntensity: { value: -1, min: -1, max: 1, step: 0.01 },
  });

  const useOverride = DEV && ctl.stageOverride >= 0;
  const stage = (useOverride ? (ctl.stageOverride as AuthReactorStage) : derived.stage);
  const channels = useOverride ? channelsForStage(stage, state.modulesOnline) : derived.channels;
  const energy = useOverride ? energyForStage(stage) : derived.energy;
  const openOverride = DEV && ctl.panelOpen >= 0 ? ctl.panelOpen : null;
  const coreOverride = DEV && ctl.coreIntensity >= 0 ? ctl.coreIntensity : null;

  return (
    <>
      <AuthReactorEnvironment quality={state.quality} />
      <AuthReactorChamber quality={state.quality} reducedMotion={state.reducedMotion} />
      <AuthReactorLighting energy={energy} isError={stage === 8} />
      <AuthReactorModel
        stage={stage}
        channels={channels}
        energy={energy}
        reducedMotion={state.reducedMotion}
        quality={state.quality}
        openOverride={openOverride}
        coreOverride={coreOverride}
      />
      <AuthReactorEffects quality={state.quality} />
      <Rig stage={stage} reducedMotion={state.reducedMotion} lookAtX={state.quality === "high" ? -1.7 : 0} />
    </>
  );
}

"use client";

/**
 * AlgorithmX Cinematic Engine — Scene Shell (the camera rig)
 * =========================================================
 *
 * Wraps `ExerciseFrame` and provides the perspective container + camera
 * zoom/translate rig the Password Vault hardcoded. A scene renders its
 * world as `children` (inside the camera-transformed space) and its
 * non-transformed overlays (panels, flashes, reveal UI, toasts) as
 * `overlay` (inside the viewport, above the camera).
 *
 * Camera generalisation: the caller passes a `camera` of
 * `{ kind:"overview" }` or `{ kind:"focus", x, y, zoom? }`, where `x`/`y`
 * are percent offsets from the scene centre (same convention as the
 * vault's lock positions). The translate maths and cubic-bezier
 * transitions are copied from the vault; transition durations scale via
 * `useTimingScaler`.
 *
 * To reproduce the vault's climax push-in, drive `camera` to
 * `{ kind:"focus", x:0, y:0, zoom: <stageScale> }` and pass
 * `cameraTransitionMs={720}`.
 */

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import { useTimingScaler } from "./useTimingScaler";

export type SceneCamera =
  | { kind: "overview" }
  | { kind: "focus"; x: number; y: number; zoom?: number };

export interface SceneShellProps {
  /** Aspect ratio of the inner scene viewport. Default 16:9. */
  aspectRatio?: { w: number; h: number };
  /** Scene background (passed to ExerciseFrame). */
  background?: string | null;
  /** Current camera state. */
  camera: SceneCamera;
  /**
   * Pixel basis the focus offsets are a percentage of. Default 520 — the
   * vault's DOOR_SIZE, so passing the vault's lock x/y reproduces it
   * exactly.
   */
  focusBasis?: number;
  /** Default zoom factor when a focus camera omits `zoom`. Default 1.75. */
  defaultZoom?: number;
  /**
   * Force a specific camera transition duration (ms). Use 720 for the
   * vault's slow climax push-in. When omitted, derived from intensity
   * (0 / 280 / 620), matching the vault's focus transitions.
   */
  cameraTransitionMs?: number;
  /** Optional camera-shake class (e.g. SHAKE_MD / SHAKE_LG from juice). */
  shakeClass?: string;
  /** ExerciseFrame width cap. Default 1100 (the vault's value). */
  maxWidth?: number;
  /** ExerciseFrame vertical reserve. Default 210 (the vault's value). */
  reserve?: number;
  /** The world, rendered inside the camera-transformed space. */
  children: ReactNode;
  /** Overlays rendered in the viewport, ABOVE/outside the camera transform. */
  overlay?: ReactNode;
}

export default function SceneShell({
  aspectRatio = { w: 16, h: 9 },
  background,
  camera,
  focusBasis = 520,
  defaultZoom = 1.75,
  cameraTransitionMs,
  shakeClass = "",
  maxWidth = 1100,
  reserve = 210,
  children,
  overlay,
}: SceneShellProps) {
  const { intensity } = useTimingScaler();

  const cameraStyle: CSSProperties = useMemo(() => {
    const transitionMs =
      cameraTransitionMs ??
      (intensity === 0 ? 0 : intensity < 1 ? 280 : 620);
    if (camera.kind === "overview") {
      return {
        transform: "scale(1) translate(0px, 0px)",
        transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }
    const zoom = camera.zoom ?? defaultZoom;
    const tx = (-camera.x / 100) * focusBasis * zoom;
    const ty = (-camera.y / 100) * focusBasis * zoom;
    return {
      transform: `scale(${zoom}) translate(${tx}px, ${ty}px)`,
      transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [camera, focusBasis, defaultZoom, cameraTransitionMs, intensity]);

  return (
    <ExerciseFrame
      maxWidth={maxWidth}
      aspectRatio={aspectRatio}
      reserve={reserve}
      background={background}
      padding={0}
      touchActionNone
    >
      {/* Scene viewport */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}`,
          overflow: "hidden",
          perspective: 1400,
        }}
      >
        {/* Camera shake wrapper — CSS animation, no React updates */}
        <div className={shakeClass} style={{ position: "absolute", inset: 0 }}>
          {/* Camera zoom/translate wrapper */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 50%",
              willChange: "transform",
              ...cameraStyle,
            }}
          >
            {children}
          </div>
        </div>

        {/* Non-transformed overlays (panels, flash, reveal UI, toasts) */}
        {overlay}
      </div>
    </ExerciseFrame>
  );
}

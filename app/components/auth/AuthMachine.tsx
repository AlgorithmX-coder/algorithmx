"use client";

import { useState } from "react";
import { ACCESS, rgba } from "./accessTokens";
import LivingHub from "./LivingHub";

export type { AuthMachineState, AuthMachinePhase } from "./LivingHub";
import type { AuthMachineState } from "./LivingHub";

/**
 * AuthMachine — the reactor centrepiece.
 *
 * A premium 2D render of a six-cylinder reactor (the six streams) around a
 * central core (the hub). It lives BEHIND everything and is essentially
 * invisible at rest; as the form is filled it emerges from the void and
 * brightens, the central core blooming on success. The render IS the look,
 * so it matches the reference exactly; the AuthMachineState wiring is shared
 * with the prior centrepieces, so a real GLB could swap in later.
 *
 * Drop the render at: public/auth/sentinel.png  (replace the old file).
 * If that file is missing / fails to load, this falls back to LivingHub so
 * nothing breaks.
 *
 * State → reveal (DOM + CSS transitions):
 *   dormant (0 fields) — hidden in the void
 *   per field           — emerges + brightens a step
 *   armed               — substantially revealed, core charged
 *   submit              — brighter, energy gathering
 *   success             — fully lit + a bloom toward the core
 *   error               — brief amber wash, no flash
 */

const SRC = "/auth/sentinel.png";

function chargeOf(s: AuthMachineState): number {
  return Math.min(1, s.modulesOnline / 6);
}

function Reactor({ state, onError }: { state: AuthMachineState; onError: () => void }) {
  const reduced = state.reducedMotion;
  const charge = chargeOf(state);
  const success = state.phase === "success";
  const submitting = state.phase === "submitting";
  const error = state.phase === "error";

  // Reveal 0→1. Hidden at rest, emerges as fields complete, full at success.
  const reveal = success ? 1 : submitting ? Math.max(charge, 0.9) : Math.min(1, charge * 1.3);
  const slow = reduced ? "0ms" : "1100ms";
  const med = reduced ? "0ms" : "640ms";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Reactor render — feathered into the void; opacity + brightness reveal */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt=""
        onError={onError}
        style={{
          height: success && !reduced ? "100%" : "96%",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
          opacity: 0.03 + reveal * 0.97,
          filter: `brightness(${0.5 + reveal * 0.7}) saturate(${0.8 + reveal * 0.4}) contrast(1.05)`,
          // Feather the render's rectangular edges into the background.
          WebkitMaskImage: "radial-gradient(ellipse 68% 80% at 50% 46%, #000 50%, transparent 90%)",
          maskImage: "radial-gradient(ellipse 68% 80% at 50% 46%, #000 50%, transparent 90%)",
          transform: success && !reduced ? "scale(1.04)" : "scale(1)",
          transition: `opacity ${slow} ease, filter ${slow} ease, transform ${slow} ease, height ${slow} ease`,
          animation: reduced ? undefined : "authReactorFloat 9s ease-in-out infinite",
        }}
      />

      {/* Central core bloom — intensifies with reveal, flares on success */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          width: `${14 + reveal * 16 + (success ? 24 : 0)}%`,
          aspectRatio: "1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rgba(ACCESS.cyan, 0.4)} 0%, ${rgba(ACCESS.violet, 0.22)} 40%, transparent 70%)`,
          opacity: reveal * (success ? 1 : 0.7),
          mixBlendMode: "screen",
          transition: `width ${slow} ease, opacity ${med} ease`,
        }}
      />

      {/* Error wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: rgba(ACCESS.warn, 0.12),
          opacity: error ? 1 : 0,
          mixBlendMode: "screen",
          transition: "opacity 260ms ease",
        }}
      />

      <style>{`
        @keyframes authReactorFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-1%) scale(1.005); }
        }
      `}</style>
    </div>
  );
}

/**
 * AuthMachine — renders the reactor on every tier (it's a light <img>).
 * Falls back to LivingHub only if the render asset is missing.
 */
export default function AuthMachine({ state }: { state: AuthMachineState }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <LivingHub state={state} />;
  return <Reactor state={state} onError={() => setFailed(true)} />;
}

"use client";

import { useState } from "react";
import { ACCESS, rgba } from "./accessTokens";

/**
 * AuthSentinelScene — the AlgorithmX Sentinel auth centrepiece.
 *
 * A premium 2.5D guardian composited in a dark studio chamber that powers
 * up as the form is completed. DOM/CSS layered approach (no heavy R3F) — a
 * high-quality layered render reads better and faster than weak procedural
 * 3D.
 *
 * ── ASSET STATUS ────────────────────────────────────────────────────────
 * The guardian art is NOT yet in the repo (the only image on disk is the
 * rejected reactor). Until the layers below exist this renders the
 * AuthSentinelFallback (a clean awaiting-asset chamber) — it deliberately
 * does NOT show the reactor or primitive geometry.
 *
 * Required layered assets (transparent, same registration, robot centred):
 *   /auth/sentinel-base.webp   (REQUIRED) dark-metal guardian cutout
 *   /auth/sentinel-core.png    chest-core emissive only
 *   /auth/sentinel-visor.png   visor only
 *   /auth/sentinel-seams.png   armour energy seams only
 *   /auth/sentinel-shield.png  optional protection field
 *   /auth/sentinel-shadow.png  contact shadow
 *
 * Consumes the existing AuthMachineState contract unchanged.
 */

export type AuthMachinePhase = "idle" | "armed" | "submitting" | "success" | "error";

export interface AuthMachineState {
  modulesOnline: number; // 0–6 systems online (derived from valid fields)
  focus: "name" | "email" | "password" | "confirm" | null;
  phase: AuthMachinePhase;
  reducedMotion: boolean;
  quality: "high" | "medium" | "low";
}

const BASE = "/auth/sentinel-base.webp";
const LAYER = {
  shadow: "/auth/sentinel-shadow.png",
  shield: "/auth/sentinel-shield.png",
  seams: "/auth/sentinel-seams.png",
  core: "/auth/sentinel-core.png",
  visor: "/auth/sentinel-visor.png",
} as const;

/* Derived 0–1 energy + system flags from the shared state. */
function systemsOf(s: AuthMachineState) {
  const charge = Math.min(1, s.modulesOnline / 6);
  const success = s.phase === "success";
  const submitting = s.phase === "submitting";
  const error = s.phase === "error";
  return {
    charge,
    success,
    submitting,
    error,
    identity: success || s.modulesOnline >= 1,
    comms: success || s.modulesOnline >= 2,
    protection: success || s.modulesOnline >= 3,
    locked: success || s.phase === "armed" || s.modulesOnline >= 4,
    // master visual energy: full only at success, gathered on submit
    energy: success ? 1 : submitting ? Math.max(charge, 0.9) : charge,
  };
}

/* ───────────────────────── LIGHTING / CHAMBER ───────────────────────── */
function AuthSentinelLighting({ energy, gateway }: { energy: number; gateway: number }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Deep studio chamber wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse 80% 60% at 58% 38%, ${rgba(ACCESS.indigo, 0.6)} 0%, transparent 60%),` +
            `linear-gradient(180deg, ${rgba(ACCESS.abyss, 0.4)} 0%, ${ACCESS.void} 100%)`,
        }}
      />
      {/* Access gateway forming behind the guardian (submit/success) */}
      <div
        style={{
          position: "absolute",
          left: "58%",
          top: "42%",
          width: "46%",
          aspectRatio: "1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rgba(ACCESS.cyan, 0.28)} 0%, ${rgba(ACCESS.violet, 0.16)} 45%, transparent 70%)`,
          opacity: 0.1 + gateway * 0.9,
          filter: "blur(8px)",
          transition: "opacity 700ms ease",
        }}
      />
      {/* Floor / contact plane */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "26%",
          background: `linear-gradient(180deg, transparent 0%, ${rgba(ACCESS.indigo, 0.5)} 70%, ${rgba(ACCESS.void, 0.9)} 100%)`,
        }}
      />
      {/* Soft top-down volumetric column */}
      <div
        style={{
          position: "absolute",
          left: "58%",
          top: 0,
          width: "30%",
          height: "100%",
          transform: "translateX(-50%)",
          background: `linear-gradient(180deg, ${rgba(ACCESS.cyanSoft, 0.06 + energy * 0.06)} 0%, transparent 55%)`,
          transition: "background 700ms ease",
        }}
      />
    </div>
  );
}

/* ───────────────────────── STATUS READOUT (decorative) ───────────────────────── */
function AuthSentinelStatus({ sys }: { sys: ReturnType<typeof systemsOf> }) {
  const label = sys.success
    ? "ACCOUNT SECURED"
    : sys.error
      ? "DIAGNOSTIC"
      : sys.submitting
        ? "VERIFYING"
        : sys.locked
          ? "ACCESS-READY"
          : sys.identity
            ? "POWERING UP"
            : "STANDBY";
  const color = sys.error ? ACCESS.warn : sys.success || sys.locked ? ACCESS.cyan : ACCESS.textMuted;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "58%",
        bottom: "8%",
        transform: "translateX(-50%)",
        fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: 3,
        color,
        opacity: 0.85,
        transition: "color 400ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

/* ───────────────────────── FALLBACK (no guardian asset yet) ───────────────────────── */
function AuthSentinelFallback({ sys }: { sys: ReturnType<typeof systemsOf> }) {
  // Honest, premium "awaiting asset" chamber — NOT the reactor, NOT polygons.
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <AuthSentinelLighting energy={sys.energy} gateway={sys.success ? 1 : sys.submitting ? 0.6 : sys.charge * 0.4} />
      {/* A standing-bay light column where the Sentinel will stand */}
      <div
        style={{
          position: "absolute",
          left: "58%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(34%, 360px)",
          height: "70%",
          borderRadius: 16,
          background: `linear-gradient(180deg, ${rgba(ACCESS.cyan, 0.05 + sys.energy * 0.07)} 0%, ${rgba(ACCESS.violet, 0.04 + sys.energy * 0.06)} 100%)`,
          border: `1px solid ${rgba(ACCESS.cyan, 0.12 + sys.energy * 0.18)}`,
          boxShadow: `0 0 60px ${rgba(ACCESS.cyan, 0.06 + sys.energy * 0.12)} inset`,
          transition: "all 600ms ease",
        }}
      />
      <AuthSentinelStatus sys={sys} />
    </div>
  );
}

/* ───────────────────────── VISUAL (layered guardian) ───────────────────────── */
function AuthSentinelVisual({ state, sys, onBaseError }: { state: AuthMachineState; sys: ReturnType<typeof systemsOf>; onBaseError: () => void }) {
  const reduced = state.reducedMotion;
  const low = state.quality === "low";
  const slow = reduced ? "0ms" : "900ms";
  const med = reduced ? "0ms" : "560ms";

  // Optional layers self-hide if their file is missing.
  const [layers, setLayers] = useState({ shadow: true, shield: true, seams: true, core: true, visor: true });
  const hide = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: false }));

  const figureH = low ? "118%" : state.quality === "medium" ? "62%" : "66%";
  const objectPos = low ? "center 12%" : "center";

  const gateway = sys.success ? 1 : sys.submitting ? 0.6 : sys.charge * 0.3;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <AuthSentinelLighting energy={sys.energy} gateway={gateway} />

      {/* Figure box — overlays register to the base via shared % box */}
      <div
        style={{
          position: "relative",
          height: figureH,
          aspectRatio: "1122 / 1402",
          maxWidth: "92%",
          transform: sys.success && !reduced ? "scale(1.03)" : "scale(1)",
          transition: `transform ${slow} cubic-bezier(0.2,0.7,0.2,1)`,
          animation: reduced ? undefined : "sentinelIdle 7s ease-in-out infinite",
        }}
      >
        {layers.shadow && layerImg(LAYER.shadow, { bottom: "-4%", filter: "none", opacity: 0.9 }, () => hide("shadow"), objectPos)}

        {/* Base metal guardian */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BASE}
          alt=""
          onError={onBaseError}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: low ? "cover" : "contain",
            objectPosition: objectPos,
            filter: `brightness(${0.78 + sys.energy * 0.28}) contrast(1.05)`,
            transition: `filter ${slow} ease`,
          }}
        />

        {/* Energy layers (additive, intensity-driven) */}
        {layers.seams && layerImg(LAYER.seams, { opacity: sys.protection ? 0.4 + sys.energy * 0.6 : 0.1, mixBlendMode: "screen", transition: `opacity ${med} ease` }, () => hide("seams"), objectPos)}
        {layers.core && layerImg(LAYER.core, { opacity: 0.2 + sys.energy * 0.8, mixBlendMode: "screen", transition: `opacity ${med} ease`, filter: sys.success ? "brightness(1.4)" : "none" }, () => hide("core"), objectPos)}
        {layers.visor && layerImg(LAYER.visor, { opacity: sys.identity ? 0.5 + sys.energy * 0.5 : 0.08, mixBlendMode: "screen", transition: `opacity ${med} ease` }, () => hide("visor"), objectPos)}
        {layers.shield && layerImg(LAYER.shield, { opacity: sys.locked ? 0.35 + (sys.success ? 0.4 : 0) : 0, mixBlendMode: "screen", transition: `opacity ${med} ease` }, () => hide("shield"), objectPos)}

        {/* Interim CSS core + visor glow (only meaningful until real layers exist) */}
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "30%",
            width: `${8 + sys.energy * 12 + (sys.success ? 16 : 0)}%`,
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(ACCESS.cyan, 0.5)} 0%, ${rgba(ACCESS.violet, 0.3)} 40%, transparent 70%)`,
            opacity: sys.protection ? 0.3 + sys.energy * 0.7 : 0.12,
            mixBlendMode: "screen",
            transition: `opacity ${med} ease, width ${slow} ease`,
          }}
        />
      </div>

      {/* Error wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: rgba(ACCESS.warn, 0.1),
          opacity: sys.error ? 1 : 0,
          mixBlendMode: "screen",
          transition: "opacity 260ms ease",
        }}
      />

      <AuthSentinelStatus sys={sys} />

      <style>{`
        @keyframes sentinelIdle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-0.7%) scale(1.004); }
        }
      `}</style>
    </div>
  );
}

/* Helper: an absolutely-positioned overlay layer image that self-hides on error. */
function layerImg(
  src: string,
  style: React.CSSProperties,
  onError: () => void,
  objectPosition: string,
) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={onError}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

/**
 * AuthSentinelScene — every tier shows the Sentinel (no LearningCore, no
 * emblem). If the guardian base asset is missing, renders the honest
 * awaiting-asset chamber fallback.
 */
export default function AuthSentinelScene({ state }: { state: AuthMachineState }) {
  const [baseMissing, setBaseMissing] = useState(false);
  const sys = systemsOf(state);
  if (baseMissing) return <AuthSentinelFallback sys={sys} />;
  return <AuthSentinelVisual state={state} sys={sys} onBaseError={() => setBaseMissing(true)} />;
}

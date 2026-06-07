"use client";

/**
 * AlgorithmX Cinematic Engine — Reveal / Reward Choreography
 * =========================================================
 *
 * The cascade reward sequence, generalised from the vault's
 * `VaultInteriorReveal`. A scene supplies its own centrepiece art (the
 * vault passes its shield relic); this module choreographs the reveal —
 * the reward chamber, the light shaft, the centrepiece settle, the
 * one-by-one artifact cascade, and the optional ribbon + teaser.
 *
 * Timing flows through `useTimingScaler`: at reduced motion the whole
 * cascade shows immediately (matching the vault) while still firing every
 * audio hook so the structure is preserved.
 */

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { TYPE } from "./tokens";
import { useTimingScaler } from "./useTimingScaler";

/* ────────────────────────────────────────────────────────────── */
/* Public API                                                     */
/* ────────────────────────────────────────────────────────────── */

export interface RevealArtifact {
  icon: string;
  label: string;
  recap: string;
  /** Accent hex for this artifact's glow/tile. */
  accent: string;
  /** Optional explicit position (% offset from centre). Auto-arced if omitted. */
  x?: number;
  y?: number;
}

export interface RevealStageProps {
  /** Chamber is mounted + faded in (e.g. once the door starts opening). */
  visible: boolean;
  /** Run the cascade + push-in (e.g. once the door is fully open). */
  active: boolean;
  /** The reward art, mounted on the central pedestal (passed in by the scene). */
  centrepiece: ReactNode;
  /** The rule/skill artifacts that cascade in around the centrepiece. */
  artifacts: RevealArtifact[];
  /** Optional celebratory ribbon line. */
  ribbonText?: string;
  /** Optional teaser node (e.g. a sticker preview), revealed last. */
  teaser?: ReactNode;
  /** Fired when the centrepiece reveals (for an audio sting). */
  onCentrepieceReveal?: () => void;
  /** Fired per artifact as it reveals (the vault fires audio.starEarned here). */
  onArtifactReveal?: (index: number) => void;
  /** Fired once the whole cascade has finished. */
  onCascadeComplete?: () => void;
}

/** Auto-arc N artifacts across the upper half when explicit positions are omitted. */
function autoArc(i: number, n: number): { x: number; y: number } {
  const frac = n <= 1 ? 0.5 : i / (n - 1);
  const x = -32 + frac * 64;
  const y = -16 - Math.sin(frac * Math.PI) * 26;
  return { x, y };
}

export function RevealStage({
  visible,
  active,
  centrepiece,
  artifacts,
  ribbonText,
  teaser,
  onCentrepieceReveal,
  onArtifactReveal,
  onCascadeComplete,
}: RevealStageProps) {
  const { intensity, t, reduced } = useTimingScaler();
  const [revealStep, setRevealStep] = useState(0);
  const firedRef = useRef(false);

  // Keep callbacks fresh without re-running the cascade.
  const cbRef = useRef({ onCentrepieceReveal, onArtifactReveal, onCascadeComplete });
  useEffect(() => {
    cbRef.current = { onCentrepieceReveal, onArtifactReveal, onCascadeComplete };
  });

  useEffect(() => {
    if (!active || firedRef.current) return;
    firedRef.current = true;
    const n = artifacts.length;

    if (reduced) {
      cbRef.current.onCentrepieceReveal?.();
      for (let i = 0; i < n; i++) cbRef.current.onArtifactReveal?.(i);
      setRevealStep(3 + n);
      cbRef.current.onCascadeComplete?.();
      return;
    }

    const coreBeat = 200;
    const artifactBeat = (i: number) => 420 + i * 120;
    const lastArtifact = n > 0 ? artifactBeat(n - 1) : coreBeat;
    const ribbonBeat = lastArtifact + 220;
    const teaserBeat = ribbonBeat + 200;

    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setRevealStep(1);
        cbRef.current.onCentrepieceReveal?.();
      }, t(coreBeat, 40)),
    );
    for (let i = 0; i < n; i++) {
      timers.push(
        window.setTimeout(() => {
          setRevealStep(2 + i);
          cbRef.current.onArtifactReveal?.(i);
        }, t(artifactBeat(i), 40)),
      );
    }
    timers.push(window.setTimeout(() => setRevealStep(2 + n), t(ribbonBeat, 40)));
    timers.push(
      window.setTimeout(() => {
        setRevealStep(3 + n);
        cbRef.current.onCascadeComplete?.();
      }, t(teaserBeat, 40)),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, reduced, t, artifacts.length]);

  const n = artifacts.length;

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: `opacity ${reduced ? 80 : 300}ms ease`,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Chamber backdrop (deep cosmic) */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 18,
          background:
            "radial-gradient(ellipse at 50% 32%, #2c1a55 0%, #150a2e 45%, #060214 100%)",
          boxShadow:
            "inset 0 0 70px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(253,224,71,0.18)",
        }}
      />

      {/* Perspective floor with grid lines for depth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 4,
          right: 4,
          bottom: 4,
          height: "44%",
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(30,12,80,0.55) 35%, rgba(8,4,22,0.95) 100%), repeating-linear-gradient(90deg, transparent 0 39px, rgba(253,224,71,0.16) 39px 40px), repeating-linear-gradient(0deg, transparent 0 39px, rgba(125,240,255,0.1) 39px 40px)",
          transform: "perspective(560px) rotateX(46deg)",
          transformOrigin: "50% 100%",
          borderTop: "1px solid rgba(253,224,71,0.28)",
          boxShadow:
            "inset 0 12px 24px rgba(124,92,255,0.25), 0 -1px 14px rgba(253,224,71,0.18)",
        }}
      />

      {/* Sun-burst rays */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "conic-gradient(from 0deg, rgba(253,224,71,0.4) 0deg, transparent 8deg, rgba(253,224,71,0.4) 30deg, transparent 38deg, rgba(253,224,71,0.4) 60deg, transparent 68deg, rgba(253,224,71,0.4) 90deg, transparent 98deg, rgba(253,224,71,0.4) 120deg, transparent 128deg, rgba(253,224,71,0.4) 150deg, transparent 158deg, rgba(253,224,71,0.4) 180deg, transparent 188deg, rgba(253,224,71,0.4) 210deg, transparent 218deg, rgba(253,224,71,0.4) 240deg, transparent 248deg, rgba(253,224,71,0.4) 270deg, transparent 278deg, rgba(253,224,71,0.4) 300deg, transparent 308deg, rgba(253,224,71,0.4) 330deg, transparent 338deg)",
          filter: "blur(2px)",
          opacity: 0.35,
          mixBlendMode: "screen",
          animation: intensity > 0 ? "cineRaysSpin 18s linear infinite" : undefined,
        }}
      />

      <LightShaft visible={revealStep >= 1} reduced={reduced} intensity={intensity} />

      {/* Central composition — scales 0.86 → 1.04 on cascade for a push-in. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: active ? "scale(1.04)" : "scale(0.86)",
          transition: `transform ${reduced ? 80 : 720}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        {/* Artifacts */}
        {artifacts.map((a, i) => {
          const pos = a.x !== undefined && a.y !== undefined ? { x: a.x, y: a.y } : autoArc(i, n);
          return (
            <ArtifactPedestal
              key={`${a.label}-${i}`}
              x={pos.x}
              y={pos.y}
              icon={a.icon}
              label={a.label}
              recap={a.recap}
              accent={a.accent}
              visible={revealStep >= 2 + i}
              intensity={intensity}
            />
          );
        })}

        {/* Centrepiece on its mount */}
        <div
          style={{
            position: "absolute",
            top: "54%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CoreMount visible={revealStep >= 1} intensity={intensity}>
            {centrepiece}
          </CoreMount>
        </div>

        {ribbonText && (
          <RecapRibbon
            text={ribbonText}
            visible={revealStep >= 2 + n}
            intensity={intensity}
          />
        )}

        {teaser && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: revealStep >= 3 + n ? 1 : 0,
              transition: `opacity ${reduced ? 120 : 360}ms ease`,
            }}
          >
            {teaser}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Centrepiece mount (aura ring + pedestal + settle)              */
/* ────────────────────────────────────────────────────────────── */

function CoreMount({
  visible,
  intensity,
  children,
}: {
  visible: boolean;
  intensity: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.45 }}
      animate={
        visible
          ? intensity === 0
            ? { opacity: 1 }
            : { opacity: 1, scale: 1 }
          : intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.45 }
      }
      transition={
        intensity === 0
          ? { duration: 0.12 }
          : { type: "spring", stiffness: 220, damping: 14 }
      }
      style={{
        position: "relative",
        width: 220,
        height: 260,
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* Aura ring */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          top: 14,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(124,92,255,0.25) 45%, transparent 75%)",
          filter: "blur(12px)",
          animation: intensity > 0 ? "cineCoreAura 4.2s ease-in-out infinite" : undefined,
        }}
      />
      {/* Pedestal disc */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: 4,
          width: 168,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, #fde047 0%, #b8862a 40%, #2a1a08 100%)",
          boxShadow:
            "0 6px 18px rgba(253,224,71,0.65), 0 0 0 1px rgba(255,255,255,0.18) inset",
        }}
      />
      {/* The scene's centrepiece art sits on the pedestal */}
      <div style={{ position: "relative", marginTop: -10 }}>{children}</div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Artifact pedestal                                              */
/* ────────────────────────────────────────────────────────────── */

function ArtifactPedestal({
  x,
  y,
  icon,
  label,
  recap,
  accent,
  visible,
  intensity,
}: {
  x: number;
  y: number;
  icon: string;
  label: string;
  recap: string;
  accent: string;
  visible: boolean;
  intensity: number;
}) {
  return (
    <motion.div
      initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.35, y: -10 }}
      animate={
        visible
          ? intensity === 0
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, y: 0 }
          : intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.35, y: -10 }
      }
      transition={
        intensity === 0
          ? { duration: 0.12 }
          : { type: "spring", stiffness: 320, damping: 16 }
      }
      style={{
        position: "absolute",
        top: `${50 + y}%`,
        left: `${50 + x}%`,
        transform: "translate(-50%, -50%)",
        width: 130,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 28,
          background: `radial-gradient(circle at 30% 30%, ${accent}cc 0%, ${accent}55 50%, rgba(8,4,22,0.95) 100%)`,
          boxShadow: `0 0 22px ${accent}aa, inset 0 0 0 1.5px rgba(255,255,255,0.35), inset 0 -4px 8px rgba(0,0,0,0.45)`,
          filter: `drop-shadow(0 0 8px ${accent})`,
          animation: intensity > 0 ? "cineArtifactBob 3.4s ease-in-out infinite" : undefined,
        }}
      >
        {icon}
      </span>
      <div
        style={{
          marginTop: 4,
          padding: "5px 10px 6px",
          borderRadius: 10,
          background: "rgba(10, 14, 36, 0.88)",
          border: `1px solid ${accent}88`,
          boxShadow: `0 6px 14px rgba(0,0,0,0.55), 0 0 12px ${accent}33`,
          textAlign: "center",
          minWidth: 110,
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 8,
            letterSpacing: "0.18em",
            fontWeight: 800,
            color: accent,
            textTransform: "uppercase",
            textShadow: `0 0 6px ${accent}88`,
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff7e6",
            lineHeight: 1.2,
          }}
        >
          {recap}
        </div>
      </div>
      <span
        aria-hidden
        style={{
          marginTop: 4,
          width: 70,
          height: 8,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${accent} 0%, ${accent}44 60%, transparent 100%)`,
          filter: "blur(2px)",
          opacity: 0.85,
        }}
      />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Ribbon + light shaft + reusable sticker teaser                 */
/* ────────────────────────────────────────────────────────────── */

function RecapRibbon({
  text,
  visible,
  intensity,
}: {
  text: string;
  visible: boolean;
  intensity: number;
}) {
  return (
    <motion.div
      initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, y: 14 }
      }
      transition={{ duration: intensity === 0 ? 0.15 : 0.42 }}
      style={{
        position: "absolute",
        bottom: 70,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 18px",
        borderRadius: 999,
        background:
          "linear-gradient(135deg, rgba(253,224,71,0.92) 0%, rgba(255,122,89,0.92) 60%, rgba(255,95,179,0.92) 100%)",
        boxShadow:
          "0 10px 26px rgba(253,224,71,0.45), 0 0 0 1px rgba(255,255,255,0.3) inset",
        color: "#1a1033",
        fontFamily: TYPE.display,
        fontWeight: 900,
        fontSize: 13,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </motion.div>
  );
}

function LightShaft({
  visible,
  reduced,
  intensity,
}: {
  visible: boolean;
  reduced: boolean;
  intensity: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -10,
        left: "50%",
        transform: "translateX(-50%)",
        width: 220,
        height: "78%",
        clipPath: "polygon(38% 0%, 62% 0%, 86% 100%, 14% 100%)",
        background:
          "linear-gradient(180deg, rgba(255,248,220,0.65) 0%, rgba(253,224,71,0.45) 30%, rgba(0,229,255,0.25) 65%, transparent 100%)",
        filter: "blur(8px)",
        opacity: visible ? 0.85 : 0,
        transition: `opacity ${reduced ? 80 : 480}ms ease-out`,
        mixBlendMode: "screen",
        animation:
          visible && intensity > 0 ? "cineShaftDrift 5.2s ease-in-out infinite" : undefined,
      }}
    />
  );
}

/**
 * Reusable "+N stickers" teaser pill (generalised from the vault's
 * `StickerTeaser`). Pass it to `RevealStage`'s `teaser` prop, or use
 * standalone. Pure visual — the ceremonial award lives on the next screen.
 */
export function StickerTeaser({
  icons,
  label,
}: {
  icons: string[];
  label?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px 6px 10px",
        borderRadius: 999,
        background: "rgba(10, 16, 36, 0.82)",
        border: "1px solid rgba(125,240,255,0.4)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5), 0 0 18px rgba(0,229,255,0.18)",
        color: "#fff7e6",
      }}
    >
      <div style={{ display: "flex" }}>
        {icons.map((s, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 14,
              background:
                "radial-gradient(circle at 30% 30%, #fde047 0%, #ff7a59 60%, #b8862a 100%)",
              border: "2px solid #0f1530",
              marginLeft: i === 0 ? 0 : -8,
              boxShadow: "0 0 8px rgba(253,224,71,0.65)",
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          fontWeight: 800,
          color: "#fde047",
          textShadow: "0 0 8px rgba(253,224,71,0.5)",
        }}
      >
        {label ?? `+${icons.length} STICKERS →`}
      </span>
    </div>
  );
}

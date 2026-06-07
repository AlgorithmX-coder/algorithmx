"use client";

/**
 * AcademyPortalBackdrop — the cinematic atmosphere behind the onboarding
 * "Academy Entry Portal". Dedicated to /onboarding so the shared
 * DataLabScene (used by the cyberstart landings) stays untouched.
 *
 * Built as three depth layers so the centre stays calm and readable:
 *   FAR  — tiny stars, very slow twinkle, low contrast
 *   MID  — drifting code glyphs / brackets at varied blur + opacity,
 *          some fading into the dark
 *   NEAR — sparse soft particles with gentle pointer parallax
 *
 * Plus a centred radial stage-light that separates the interface from the
 * field, a restrained rotating portal-ring motif that *frames* the content
 * (never a loud sci-fi HUD), cyan light from the upper-left + violet warmth
 * from the lower-right, and a refined academy status ticker (desktop) /
 * "systems online" pill (mobile).
 *
 * CSS / SVG / a couple of motion values only — no WebGL, cheap to mount.
 * Every layer is aria-hidden and pointer-events:none. Honours
 * prefers-reduced-motion: all drift / sweep / parallax drop to static.
 */

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { CYBER_PALETTE as P } from "@/app/components/scene/cyberTokens";
import { useReducedMotion } from "@/app/components/auth-reactor/useReducedMotion";

const KEYFRAMES = `
@keyframes apTwinkle   { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.8;transform:scale(1.25)} }
@keyframes apGlyph     { 0%,100%{transform:translateY(0) rotate(0);opacity:var(--o,.18)} 50%{transform:translateY(-16px) rotate(6deg);opacity:calc(var(--o,.18) + .14)} }
@keyframes apDrift     { 0%,100%{transform:translate(-3%,0) scale(1)} 50%{transform:translate(3%,-2%) scale(1.05)} }
@keyframes apOrbit     { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }
@keyframes apOrbitRev  { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(-360deg)} }
@keyframes apFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes apTickerPulse { 0%{transform:translateX(-30%)} 100%{transform:translateX(130%)} }
@keyframes apDot       { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1)} }
`;

/* Deterministic so the field is identical every mount (no jitter on
 * re-render / step change). */
function pseudo(i: number, mod: number, salt = 0) {
  return (i * 53 + salt * 17 + 11) % mod;
}

/* ───────────────────────── FAR: stars ───────────────────────── */
function FarStars({ reduced }: { reduced: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 54 }, (_, i) => ({
        left: pseudo(i, 100, 1),
        top: pseudo(i, 96, 2),
        size: 1 + (i % 3) * 0.5,
        delay: (i * 0.17) % 5,
        dur: 3 + (i % 4),
        hue: i % 5 === 0 ? P.cyan : i % 5 === 1 ? P.cosmic : i % 5 === 2 ? P.neon : P.cyanSoft,
      })),
    []
  );
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.hue,
            opacity: 0.5,
            boxShadow: `0 0 ${s.size * 3}px ${s.hue}`,
            animation: reduced ? undefined : `apTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── MID: drifting glyphs ─────────────── */
const GLYPHS = ["{ }", "</>", "[ ]", "( )", "✦", "⌬", "//", "fn", "01", "◇", "&&", "=>"];
function MidGlyphs({ reduced }: { reduced: boolean }) {
  const items = useMemo(
    () =>
      GLYPHS.map((g, i) => ({
        g,
        left: pseudo(i, 92, 3) + 3,
        top: pseudo(i, 82, 4) + 6,
        size: 18 + (i % 4) * 9,
        blur: (i % 3) * 1.4,
        opacity: 0.1 + (i % 4) * 0.05,
        dur: 11 + (i % 5) * 3,
        delay: (i * 1.3) % 9,
        hue: i % 2 === 0 ? P.cyan : P.cosmic,
      })),
    []
  );
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {items.map((it, i) => (
        <span
          key={i}
          style={
            {
              position: "absolute",
              left: `${it.left}%`,
              top: `${it.top}%`,
              fontSize: it.size,
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              color: it.hue,
              opacity: it.opacity,
              filter: `blur(${it.blur}px) drop-shadow(0 0 8px ${it.hue})`,
              "--o": it.opacity,
              animation: reduced ? undefined : `apGlyph ${it.dur}s ease-in-out ${it.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          {it.g}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────── Ambient corner lights ────────────── */
function AmbientLights({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* cyan from upper-left */}
      <div
        style={{
          position: "absolute",
          left: "-12%",
          top: "-15%",
          width: "62vw",
          height: "62vh",
          background: `radial-gradient(ellipse, ${P.cyan}26 0%, ${P.cyan}0d 38%, transparent 68%)`,
          filter: "blur(44px)",
          animation: reduced ? undefined : "apDrift 24s ease-in-out infinite",
        }}
      />
      {/* violet warmth from lower-right */}
      <div
        style={{
          position: "absolute",
          right: "-14%",
          bottom: "-16%",
          width: "66vw",
          height: "66vh",
          background: `radial-gradient(ellipse, ${P.cosmic}2e 0%, ${P.cosmic}0f 42%, transparent 72%)`,
          filter: "blur(52px)",
          animation: reduced ? undefined : "apDrift 30s ease-in-out 6s infinite reverse",
        }}
      />
    </div>
  );
}

/* ───────────────────────── Portal motif ─────────────────────── *
 * Frames the onboarding zone — partial concentric rings + a slow
 * dotted orbital + a faint radial-arc crest. Kept low-opacity so it
 * reads as structure, not a HUD. Drifts subtly with the pointer. */
function PortalMotif({ x, y, reduced }: { x: MotionValue<number>; y: MotionValue<number>; reduced: boolean }) {
  const ring = (size: number, opacity: number, dash?: string) => (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        border: dash ? "none" : `1px solid ${P.cyan}`,
        outline: dash ? `1px dashed ${P.cosmic}` : undefined,
        opacity,
      }}
    />
  );
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        left: "50%",
        top: "48%",
        width: 0,
        height: 0,
        zIndex: 0,
        pointerEvents: "none",
        x,
        y,
      }}
    >
      {/* concentric rings */}
      {ring(440, 0.1)}
      {ring(680, 0.07)}
      {ring(920, 0.05)}
      {/* rotating dotted orbital */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 560,
          height: 560,
          marginLeft: -280,
          marginTop: -280,
          borderRadius: "50%",
          border: `1.5px dotted ${P.cosmic}`,
          opacity: 0.14,
          animation: reduced ? undefined : "apOrbit 90s linear infinite",
        }}
      />
      {/* faint radial-arc crest behind everything */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 780,
          height: 780,
          marginLeft: -390,
          marginTop: -390,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0deg, ${P.cyan}14 40deg, transparent 90deg, transparent 270deg, ${P.cosmic}14 320deg, transparent 360deg)`,
          filter: "blur(8px)",
          opacity: 0.6,
          animation: reduced ? undefined : "apOrbitRev 120s linear infinite",
        }}
      />
    </motion.div>
  );
}

/* ───────────────────────── Centre stage light ───────────────── */
function StageLight() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: "50%",
        top: "46%",
        width: "min(1100px, 92vw)",
        height: "min(720px, 80vh)",
        transform: "translate(-50%, -50%)",
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at center, rgba(20,26,66,0.72) 0%, rgba(13,18,46,0.45) 42%, transparent 72%)",
        filter: "blur(10px)",
      }}
    />
  );
}

/* ───────────────────────── NEAR: parallax particles ─────────── */
function NearParticles({ x, y, reduced }: { x: MotionValue<number>; y: MotionValue<number>; reduced: boolean }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: pseudo(i, 94, 5) + 3,
        top: pseudo(i, 88, 6) + 4,
        size: 3 + (i % 3) * 2,
        dur: 6 + (i % 4) * 2,
        delay: (i * 0.5) % 5,
        hue: i % 3 === 0 ? P.neon : i % 3 === 1 ? P.cyan : P.cosmic,
      })),
    []
  );
  return (
    <motion.div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", x, y }}>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: d.hue,
            opacity: 0.5,
            boxShadow: `0 0 ${d.size * 4}px ${d.hue}`,
            animation: reduced ? undefined : `apFloat ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </motion.div>
  );
}

/* ───────────────────────── Status ticker ────────────────────── */
const TICKER = [
  "ACADEMY NETWORK: ONLINE",
  "HERO PROFILES: 1,247",
  "SYSTEM STATUS: SECURE",
  "RESPONSE: 24MS",
  "LEARNING WORLDS: 6",
];
function StatusTicker({ reduced }: { reduced: boolean }) {
  return (
    <>
      {/* Desktop / tablet: low-contrast bar with an occasional bright pulse */}
      <div
        aria-hidden
        className="hidden sm:flex"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 30,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.06) 100%)",
          borderTop: "1px solid rgba(0,229,255,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 28,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            fontSize: 10.5,
            letterSpacing: 2,
            color: P.cyan,
            opacity: 0.42,
            textShadow: `0 0 6px ${P.cyan}`,
          }}
        >
          {TICKER.map((t, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {t}
              {i < TICKER.length - 1 && <span style={{ opacity: 0.4 }}>·</span>}
            </span>
          ))}
        </div>
        {/* bright pulse travelling across */}
        {!reduced && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "22%",
              background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.16), transparent)",
              mixBlendMode: "screen",
              animation: "apTickerPulse 14s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Mobile: compact "systems online" indicator */}
      <div
        aria-hidden
        className="flex sm:hidden"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(14px, env(safe-area-inset-bottom))",
          transform: "translateX(-50%)",
          zIndex: 0,
          pointerEvents: "none",
          alignItems: "center",
          gap: 7,
          padding: "5px 12px",
          borderRadius: 999,
          background: "rgba(8,10,22,0.55)",
          border: "1px solid rgba(0,229,255,0.16)",
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontSize: 9.5,
          letterSpacing: 1.5,
          color: P.cyan,
          opacity: 0.6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: P.lime,
            boxShadow: `0 0 8px ${P.lime}`,
            animation: reduced ? undefined : "apDot 2.4s ease-in-out infinite",
          }}
        />
        ACADEMY SYSTEMS ONLINE
      </div>
    </>
  );
}

/* ───────────────────────── Root ─────────────────────────────── */
export default function AcademyPortalBackdrop() {
  const reduced = useReducedMotion();

  // Pointer parallax — normalised −1..1, springed for smoothness. Near
  // layer drifts more than the portal; disabled under reduced motion.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });
  const nearX = useTransform(sx, (v) => v * 18);
  const nearY = useTransform(sy, (v) => v * 18);
  const portalX = useTransform(sx, (v) => v * 7);
  const portalY = useTransform(sy, (v) => v * 7);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, px, py]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      {/* base gradient */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)",
        }}
      />
      <AmbientLights reduced={reduced} />
      <FarStars reduced={reduced} />
      <MidGlyphs reduced={reduced} />
      <PortalMotif x={portalX as MotionValue<number>} y={portalY as MotionValue<number>} reduced={reduced} />
      <StageLight />
      <NearParticles x={nearX} y={nearY} reduced={reduced} />
      <StatusTicker reduced={reduced} />
    </>
  );
}

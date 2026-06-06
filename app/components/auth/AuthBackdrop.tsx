"use client";

import { useReducedMotion } from "framer-motion";
import { ACCESS, ACCESS_GRAD, rgba } from "./accessTokens";

/**
 * AuthBackdrop — the restrained atmosphere behind the Access Layer.
 *
 * Replaces the marketing `CyberPanelBackdrop` (twinkling pink/violet
 * starfield) for the auth surface. Deliberately quiet: a deep indigo
 * wash, one faint precision grid masked to the centre, and two slow
 * aurora blooms that breathe rather than sparkle. Nothing here competes
 * with the access engine — it sets the void it lives in.
 *
 * All decorative; aria-hidden; freezes under reduced-motion.
 */
export default function AuthBackdrop() {
  const reduced = !!useReducedMotion();
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base wash */}
      <div style={{ position: "absolute", inset: 0, background: ACCESS_GRAD.page }} />

      {/* Precision grid — masked to a soft centre so edges stay clean. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            `linear-gradient(${rgba(ACCESS.cyan, 0.045)} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${rgba(ACCESS.cyan, 0.045)} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 78%)",
        }}
      />

      {/* Aurora bloom — violet, top. Slow breathe. */}
      <div
        style={{
          position: "absolute",
          top: "-18%",
          left: "50%",
          width: "70vw",
          height: "55vh",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, ${rgba(ACCESS.violet, 0.16)} 0%, transparent 65%)`,
          filter: "blur(30px)",
          animation: reduced ? undefined : "authBloomA 16s ease-in-out infinite",
        }}
      />
      {/* Aurora bloom — cyan, lower. Counter-phase. */}
      <div
        style={{
          position: "absolute",
          bottom: "-22%",
          left: "42%",
          width: "60vw",
          height: "50vh",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, ${rgba(ACCESS.cyan, 0.1)} 0%, transparent 65%)`,
          filter: "blur(36px)",
          animation: reduced ? undefined : "authBloomB 20s ease-in-out infinite",
        }}
      />

      {/* Top + bottom vignette to seat the columns. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${rgba(ACCESS.void, 0.5)} 0%, transparent 18%, transparent 82%, ${rgba(ACCESS.void, 0.6)} 100%)`,
        }}
      />

      <style>{`
        @keyframes authBloomA {
          0%, 100% { opacity: 0.75; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes authBloomB {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1.05); }
          50% { opacity: 0.9; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

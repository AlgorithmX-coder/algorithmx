"use client";

/**
 * Full-screen clearance-upgrade + XP-reward beat — fires once, the first
 * time an agent opens a block's first case, BEFORE that block's ATLAS
 * briefing. Two stages in one takeover (clearance, then the XP reward),
 * same visual language as RankUpMoment (that one's for the lifetime XP
 * ladder; this one's for the per-block clearance ladder — see
 * engine/rank.ts's header comment for how the two differ) but themed to
 * the block being entered, so it reads as part of ATLAS's briefing rather
 * than a generic popup. Gated by engine/blockBonus.ts so it never repeats.
 *
 * `finale` (ULTRA, Block 4's clearance — UAT request: "make the ULTRA
 * rank-up ceremony bigger than the previous Module 3 one") swaps the
 * single soft glow for a multi-ring pulse plus a burst of sparks, adds a
 * subtitle under the clearance name, and holds each stage longer — same
 * two-stage shape and same component, just turned up for the capstone.
 */

import { useEffect, useMemo, useState } from "react";
import { MONO } from "./tokens";
import type { BlockTheme } from "../phone/blockIntroData";

/**
 * The hero name (clearance + XP number) switched from plain MONO to a
 * stencilled display face — owner picked "Classified Upgrade" from a
 * 5-concept review (OpenArt/Artifact mockup, 2026-11-06): a dossier stamp
 * feel, the most tactile/spy-thriller of the five. Loaded here rather than
 * tokens.ts since no other engine screen uses it (same pattern as Console/
 * WarRoom's own IBM Plex Mono @import).
 */
const DISPLAY = '"Black Ops One", Impact, "Arial Narrow", sans-serif';

// Fixed angles/delays (not random) so the burst is identical every run —
// no hydration mismatch risk, and easy to tune by eye.
const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  angle: (360 / 14) * i,
  delay: (i % 7) * 70,
  dist: 120 + (i % 3) * 30,
}));

export function ClearanceUpMoment({
  from,
  to,
  xp,
  theme,
  reduced,
  finale = false,
  onDone,
}: {
  from: string | null;
  to: string;
  xp: number;
  theme: BlockTheme;
  reduced: boolean;
  /** The capstone treatment — pass true only for the top of the ladder (ULTRA). */
  finale?: boolean;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<"clearance" | "xp">("clearance");
  const mult = finale ? 1.35 : 1;

  useEffect(() => {
    const t = setTimeout(() => setStage("xp"), (reduced ? 1400 : 2600) * mult);
    return () => clearTimeout(t);
  }, [reduced, mult]);

  useEffect(() => {
    if (stage !== "xp") return;
    const t = setTimeout(onDone, (reduced ? 1200 : 2400) * mult);
    return () => clearTimeout(t);
  }, [stage, onDone, reduced, mult]);

  const acc = theme.accent, accHi = theme.accentHi;
  const sparks = useMemo(() => (finale && !reduced ? SPARKS : []), [finale, reduced]);

  return (
    <div
      role="status"
      aria-label={stage === "clearance" ? `Clearance upgrade: ${to}` : `XP reward: plus ${xp}`}
      onClick={() => (stage === "clearance" ? setStage("xp") : onDone())}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: "rgba(3,5,12,0.92)",
        backdropFilter: "blur(6px)",
        cursor: "pointer",
        animation: reduced ? undefined : "cuIn 400ms cubic-bezier(0.2,0,0,1)",
      }}
    >
      {/* paper-grain texture — the dossier feels handled, not generated */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          mixBlendMode: "overlay",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 0.6px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "-20%",
          background: `radial-gradient(circle at 50% 50%, ${acc}2E 0%, transparent 60%)`,
          animation: reduced ? undefined : "cuPulse 1.8s ease-in-out infinite",
        }}
      />
      {finale && (
        <>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 1,
                height: 1,
                borderRadius: "50%",
                border: `1px solid ${acc}`,
                opacity: 0,
                animation: reduced ? undefined : `cuRing 2.6s ${i * 0.7}s ease-out infinite`,
              }}
            />
          ))}
          {sparks.map((s, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: accHi,
                boxShadow: `0 0 6px ${accHi}`,
                opacity: 0,
                ["--ang" as string]: `${s.angle}deg`,
                ["--dist" as string]: `${s.dist}px`,
                animation: `cuSpark 1.3s ${s.delay}ms cubic-bezier(.2,.7,.3,1) both`,
              }}
            />
          ))}
        </>
      )}
      {stage === "clearance" ? (
        <>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em", color: acc }}>
            {finale ? "FINAL CLEARANCE UPGRADE" : "CLEARANCE UPGRADE"}
          </span>
          {from && (
            <span style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.12em", color: "#6B7A94", textDecoration: "line-through" }}>
              {from}
            </span>
          )}
          <span
            style={{
              position: "relative",
              fontFamily: DISPLAY,
              fontSize: finale ? "clamp(26px, 7.4vw, 52px)" : "clamp(21px, 5.8vw, 40px)",
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              color: acc,
              textAlign: "center",
              maxWidth: "88vw",
              padding: "0 12px",
              textShadow: finale ? `0 2px 0 rgba(0,0,0,0.6), 0 0 46px ${acc}88` : `0 2px 0 rgba(0,0,0,0.6), 0 0 28px ${acc}88`,
              animation: reduced ? undefined : "cuCut 260ms 160ms steps(2) both",
            }}
          >
            {to}
          </span>
          {/* ink-stamp slam — the dossier's own "CLEARANCE GRANTED" beat, timed
              to land just after the stencilled name cuts in */}
          <span
            aria-hidden
            style={{
              fontFamily: DISPLAY,
              fontSize: finale ? "clamp(14px, 3.6vw, 20px)" : "clamp(12px, 3.1vw, 17px)",
              letterSpacing: "0.14em",
              color: acc,
              border: `3px solid ${acc}`,
              borderRadius: 4,
              padding: "6px 16px",
              background: "rgba(0,0,0,0.25)",
              transform: "rotate(-9deg)",
              animation: reduced ? undefined : "cuStamp 340ms 420ms cubic-bezier(0.2,1.3,0.3,1) both",
              opacity: reduced ? 1 : undefined,
            }}
          >
            GRANTED
          </span>
          {finale && (
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: "#8FA2BF" }}>
              Highest clearance in the program
            </span>
          )}
        </>
      ) : (
        <>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em", color: acc }}>XP REWARD</span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: finale ? "clamp(30px, 7.6vw, 56px)" : "clamp(26px, 6.6vw, 46px)",
              letterSpacing: "0.02em",
              color: accHi,
              textShadow: finale ? `0 2px 0 rgba(0,0,0,0.6), 0 0 46px ${acc}88` : `0 2px 0 rgba(0,0,0,0.6), 0 0 28px ${acc}88`,
              animation: reduced ? undefined : "cuCut 260ms 160ms steps(2) both",
            }}
          >
            +{xp} XP
          </span>
        </>
      )}
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#8FA2BF" }}>tap anywhere to continue</span>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap');
        @keyframes cuIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cuCut { from { opacity: 0; filter: blur(2px); } to { opacity: 1; filter: blur(0); } }
        @keyframes cuStamp {
          0% { opacity: 0; transform: rotate(-9deg) scale(1.6); }
          55% { opacity: 1; transform: rotate(-9deg) scale(0.92); }
          70% { transform: rotate(-9deg) scale(1.04); }
          100% { opacity: 1; transform: rotate(-9deg) scale(1); }
        }
        @keyframes cuPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes cuRing { 0% { opacity: 0.55; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(220); } }
        @keyframes cuSpark {
          0% { opacity: 1; transform: translate(-50%,-50%) rotate(var(--ang)) translateX(0) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--ang)) translateX(var(--dist)) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

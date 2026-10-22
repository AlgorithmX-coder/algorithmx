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
              fontFamily: MONO,
              fontSize: finale ? "clamp(34px, 9vw, 64px)" : "clamp(28px, 7vw, 48px)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: acc,
              textShadow: finale ? `0 0 18px ${acc}, 0 0 46px ${acc}88` : `0 0 28px ${acc}88`,
              animation: reduced ? undefined : "cuScale 600ms 200ms cubic-bezier(0.2,0,0,1) both",
            }}
          >
            {to}
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
              fontFamily: MONO,
              fontSize: finale ? "clamp(38px, 9vw, 68px)" : "clamp(32px, 8vw, 56px)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: accHi,
              textShadow: finale ? `0 0 18px ${acc}, 0 0 46px ${acc}88` : `0 0 28px ${acc}88`,
              animation: reduced ? undefined : "cuScale 600ms 200ms cubic-bezier(0.2,0,0,1) both",
            }}
          >
            +{xp} XP
          </span>
        </>
      )}
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#8FA2BF" }}>tap anywhere to continue</span>
      <style>{`
        @keyframes cuIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cuScale { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
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

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
 */

import { useEffect, useState } from "react";
import { MONO } from "./tokens";
import type { BlockTheme } from "../phone/blockIntroData";

export function ClearanceUpMoment({
  from,
  to,
  xp,
  theme,
  reduced,
  onDone,
}: {
  from: string | null;
  to: string;
  xp: number;
  theme: BlockTheme;
  reduced: boolean;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<"clearance" | "xp">("clearance");

  useEffect(() => {
    const t = setTimeout(() => setStage("xp"), reduced ? 1400 : 2600);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (stage !== "xp") return;
    const t = setTimeout(onDone, reduced ? 1200 : 2400);
    return () => clearTimeout(t);
  }, [stage, onDone, reduced]);

  const acc = theme.accent, accHi = theme.accentHi;

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
      {stage === "clearance" ? (
        <>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em", color: acc }}>CLEARANCE UPGRADE</span>
          {from && (
            <span style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.12em", color: "#6B7A94", textDecoration: "line-through" }}>
              {from}
            </span>
          )}
          <span
            style={{
              fontFamily: MONO,
              fontSize: "clamp(28px, 7vw, 48px)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: acc,
              textShadow: `0 0 28px ${acc}88`,
              animation: reduced ? undefined : "cuScale 600ms 200ms cubic-bezier(0.2,0,0,1) both",
            }}
          >
            {to}
          </span>
        </>
      ) : (
        <>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em", color: acc }}>XP REWARD</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "clamp(32px, 8vw, 56px)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: accHi,
              textShadow: `0 0 28px ${acc}88`,
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
      `}</style>
    </div>
  );
}

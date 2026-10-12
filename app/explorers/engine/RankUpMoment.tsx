"use client";

/**
 * Full-screen rank-up celebration — fires once, on the mission board, the
 * moment lifetime XP crosses into a new named rank. A deliberate pause on
 * the new identity (not just a toast) so a rank actually feels earned.
 */

import { useEffect } from "react";
import { MONO } from "./tokens";
import type { ExplorersRankInfo } from "./rank";

export function RankUpMoment({
  from,
  to,
  onDone,
  reduced,
}: {
  from: ExplorersRankInfo;
  to: ExplorersRankInfo;
  onDone: () => void;
  reduced: boolean;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 2200 : 4200);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  return (
    <div
      role="status"
      aria-label={`Rank up: ${from.name} to ${to.name}`}
      onClick={onDone}
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
        animation: reduced ? undefined : "rankupIn 400ms cubic-bezier(0.2,0,0,1)",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "-20%",
          background: `radial-gradient(circle at 50% 50%, ${to.colour}2E 0%, transparent 60%)`,
          animation: reduced ? undefined : "rankupPulse 1.8s ease-in-out infinite",
        }}
      />
      <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em", color: to.colour }}>RANK UP</span>
      <span style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.12em", color: "#6B7A94", textDecoration: "line-through" }}>
        {from.name}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: "clamp(32px, 8vw, 56px)",
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: to.colour,
          textShadow: `0 0 28px ${to.colour}88`,
          animation: reduced ? undefined : "rankupScale 600ms 200ms cubic-bezier(0.2,0,0,1) both",
        }}
      >
        {to.name}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#8FA2BF" }}>
        tap anywhere to continue
      </span>
      <style>{`
        @keyframes rankupIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rankupScale { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes rankupPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}

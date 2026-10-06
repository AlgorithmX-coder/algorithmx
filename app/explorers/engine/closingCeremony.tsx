"use client";
import { useEffect, useMemo, useState } from "react";
import { StampMark } from "./primitives";

// Shared across all four blocks: the "case closed" payoff beat (animated
// stamp, visible XP, clearance-rank readout) that only Block 1 originally
// had. Reads the same explorers:checkpoint:* localStorage keys Block 1's
// own RewardsScene reads, so the clearance rank reflects the WHOLE 20-case
// program regardless of which block closed the case.
const PROGRAM_TOTAL = 20;

export function useClearance(caseId: string, recountKey: unknown) {
  const closedTotal = useMemo(() => {
    const ids = new Set<string>();
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("explorers:checkpoint:")) continue;
        try {
          const cp = JSON.parse(localStorage.getItem(k) || "{}");
          if (cp?.pos?.beat === "closed" && typeof cp?.missionId === "string") ids.add(cp.missionId);
        } catch {}
      }
    }
    ids.add(caseId);
    return ids.size;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, recountKey]);

  const { rank, tier } = useMemo(() => {
    if (closedTotal >= PROGRAM_TOTAL) return { rank: "ULTRA", tier: "ULTRA" };
    if (closedTotal >= 15) return { rank: "SPECIALIST", tier: "ULTRA" };
    if (closedTotal >= 10) return { rank: "SENIOR AGENT", tier: "TOP SECRET" };
    if (closedTotal >= 5) return { rank: "AGENT", tier: "SECRET" };
    return { rank: "TRAINEE", tier: "CONFIDENTIAL" };
  }, [closedTotal]);

  return { closedTotal, rank, tier, total: PROGRAM_TOTAL };
}

export function ClosingCeremony({
  caseId,
  xp,
  accent,
  signoff,
  reduced,
  font,
  ink = "rgba(255,255,255,.85)",
  dim = "rgba(255,255,255,.55)",
  onStamp,
}: {
  caseId: string;
  xp: number;
  accent: string;
  signoff: string;
  reduced: boolean;
  /** CSS font-family string — Phone passes its sans UI font, Console/WarRoom their mono. */
  font: string;
  ink?: string;
  dim?: string;
  onStamp?: () => void;
}) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamped(true);
      onStamp?.();
    }, reduced ? 150 : 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { rank, tier, closedTotal, total } = useClearance(caseId, stamped);

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${accent}55`, borderRadius: 10, padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: font, fontSize: 11.5, letterSpacing: ".08em", color: accent, fontWeight: 700 }}>CLEARANCE: {rank} · {tier}</span>
        <span style={{ fontFamily: font, fontSize: 11.5, color: dim }}>
          CASES CLOSED&nbsp;<span style={{ color: accent, fontWeight: 700 }}>{stamped ? closedTotal : Math.max(0, closedTotal - 1)}</span>&nbsp;/ {total}
        </span>
      </div>

      {stamped && (
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <StampMark text="CASE CLOSED" visible={stamped} reduced={reduced} color={accent} style={{ display: "inline-block" }} />
          <div style={{ marginTop: 16, fontFamily: font, fontSize: 11, letterSpacing: ".14em", color: dim, textTransform: "uppercase" }}>Case XP</div>
          <div className="sr-xpnum" style={{ fontFamily: font, fontSize: 44, fontWeight: 700, color: accent, textShadow: `0 0 28px ${accent}55`, lineHeight: 1.1 }}>
            {xp}
          </div>
          <p style={{ marginTop: 16, fontFamily: font, fontSize: 13, color: ink, lineHeight: 1.5, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            {signoff}
          </p>
        </div>
      )}
    </div>
  );
}

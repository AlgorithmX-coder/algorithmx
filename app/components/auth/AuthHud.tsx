"use client";

import { ACCESS, ACCESS_FONT, rgba } from "./accessTokens";
import type { AuthMachinePhase } from "@/app/components/auth-reactor";

/**
 * Decorative HUD annotations to the right of the reactor (desktop): system
 * read-outs (status / core temp / power level) with connector lines, reflecting
 * form progress. Purely cosmetic; aria-hidden.
 */
export default function HudReadout({ stage, level }: { stage: AuthMachinePhase; level: number }) {
  const status =
    stage === "success" ? "Online" : stage === "submitting" ? "Verifying" : stage === "error" ? "Diagnostic" : stage === "armed" ? "Ready" : "Standby";
  const labelStyle: React.CSSProperties = { fontFamily: ACCESS_FONT.mono, fontSize: 10, letterSpacing: 1.8, color: ACCESS.textSoft, textTransform: "uppercase" };
  const valStyle: React.CSSProperties = { fontFamily: ACCESS_FONT.mono, fontSize: 14, fontWeight: 700, color: ACCESS.cyan, marginTop: 3, letterSpacing: 0.5 };
  const item = (top: string, label: string, val: string, warn = false) => (
    <div className="absolute" style={{ right: 44, top, display: "flex", alignItems: "center", gap: 12 }}>
      <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(90deg, transparent, ${rgba(ACCESS.cyan, 0.5)})` }} />
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: warn ? ACCESS.warn : ACCESS.cyan, boxShadow: `0 0 8px ${warn ? ACCESS.warn : ACCESS.cyan}` }} />
      <div style={{ textAlign: "left", minWidth: 92 }}>
        <div style={labelStyle}>{label}</div>
        <div style={{ ...valStyle, color: warn ? ACCESS.warn : ACCESS.cyan }}>{val}</div>
      </div>
    </div>
  );
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
      {item("26%", "System Status", status, stage === "error")}
      {item("44%", "Core Temp.", `${(21.4 + level * 0.04).toFixed(1)}°C`)}
      {item("62%", "Power Level", `${String(Math.round(level)).padStart(2, "0")}%`)}
    </div>
  );
}

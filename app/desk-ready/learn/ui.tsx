"use client";

import type { CSSProperties, ReactNode } from "react";
import { D } from "../tokens";

/* Small shared pieces for the Desk Ready engine. Every button is at least
 * 48px tall and every icon is drawn inline-block (Tailwind preflight makes
 * a bare svg a block and drops it onto its own line). */

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Tick({ size = 18, color = D.good }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" aria-hidden style={{ display: "inline-block", flexShrink: 0, verticalAlign: "-3px" }}>
      <path d="M5 12.5 L10 17.5 L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Cross({ size = 18, color = D.bad }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" aria-hidden style={{ display: "inline-block", flexShrink: 0, verticalAlign: "-3px" }}>
      <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
    </svg>
  );
}

type ButtonKind = "primary" | "secondary" | "plain";

export function Button({
  children,
  onClick,
  kind = "primary",
  disabled,
  type = "button",
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    minHeight: 48,
    padding: "12px 22px",
    borderRadius: 12,
    fontFamily: D.display,
    fontWeight: 600,
    fontSize: 17,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    border: "none",
  };
  const look: Record<ButtonKind, CSSProperties> = {
    primary: { background: D.accent, color: D.onAccent },
    secondary: { background: D.panel, color: D.accent, border: `2px solid ${D.accent}` },
    plain: { background: "transparent", color: D.muted, padding: "12px 10px" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...look[kind], ...style }}>
      {children}
    </button>
  );
}

/* "Step 2 of 4" with a bar, for the Learn screens and multi-step tasks. */
export function StepBar({ at, of, label }: { at: number; of: number; label?: string }) {
  return (
    <div aria-label={`${label ?? "Step"} ${at} of ${of}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div aria-hidden style={{ flex: 1, height: 8, borderRadius: 99, background: D.sunk, overflow: "hidden" }}>
        <div style={{ width: `${(at / of) * 100}%`, height: "100%", background: D.accent, borderRadius: 99, transition: "width 0.25s ease" }} />
      </div>
      <span style={{ fontSize: 15, color: D.faint, whiteSpace: "nowrap" }}>
        {label ?? "Step"} {at} of {of}
      </span>
    </div>
  );
}

export const card: CSSProperties = {
  background: D.panel,
  border: `1px solid ${D.edge}`,
  borderRadius: 16,
  padding: "22px 20px",
};

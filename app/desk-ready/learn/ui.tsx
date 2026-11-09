"use client";

import type { CSSProperties, ReactNode } from "react";
import { D } from "../tokens";

/* Shared pieces for the Desk Ready engine, in the course's dark glass look
 * (docs/desk-ready/design-system.md). Every button is at least 48px tall
 * and every icon is drawn inline-block (Tailwind preflight makes a bare svg
 * a block and drops it onto its own line). */

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
    minHeight: 50,
    padding: "12px 24px",
    borderRadius: 999,
    fontFamily: D.display,
    fontWeight: 600,
    fontSize: 16.5,
    letterSpacing: "0.005em",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.42 : 1,
    border: "none",
    transition: "transform .15s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease",
  };
  const look: Record<ButtonKind, CSSProperties> = {
    primary: { background: D.action, color: D.onAccent, boxShadow: disabled ? "none" : D.actionGlow },
    secondary: { background: D.glass, color: D.ink, border: `1px solid ${D.edgeStrong}`, backdropFilter: "blur(8px)" },
    plain: { background: "transparent", color: D.muted, padding: "12px 10px", minHeight: 44 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`dr-btn dr-btn-${kind}`} style={{ ...base, ...look[kind], ...style }}>
      {children}
    </button>
  );
}

/* "Step 2 of 4" as a row of glowing segments. */
export function StepBar({ at, of, label }: { at: number; of: number; label?: string }) {
  return (
    <div aria-label={`${label ?? "Step"} ${at} of ${of}`} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div aria-hidden style={{ flex: 1, display: "flex", gap: 5 }}>
        {Array.from({ length: of }, (_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 99,
              background: i < at ? `var(--acc, ${D.accent})` : D.glassStrong,
              boxShadow: i === at - 1 ? `0 0 12px var(--acc, ${D.accent})` : "none",
              transition: "background .25s ease",
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: D.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: D.faint, whiteSpace: "nowrap" }}>
        {label ?? "Step"} {at} / {of}
      </span>
    </div>
  );
}

/* A mono, uppercase label: part tags, step names, counts. */
export function Kicker({ children, color = `var(--acc, ${D.accent})`, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <p style={{ margin: 0, fontFamily: D.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>
      {children}
    </p>
  );
}

/* A glass card: the navy gradient, a tinted border, a soft lift. Use with
 * className "dr-glass" for the lit top edge and faint grid (see SHELL_CSS). */
export const card: CSSProperties = {
  position: "relative",
  background: D.card,
  border: `1px solid ${D.edge}`,
  borderRadius: 20,
  padding: "26px 24px",
  boxShadow: D.lift,
  color: D.body,
};

/* A dark glass input for the course's own forms (not inside a practice app). */
export const darkInput: CSSProperties = {
  minHeight: 50,
  padding: "11px 15px",
  borderRadius: 12,
  border: `1px solid ${D.edgeStrong}`,
  background: "rgba(255,255,255,0.05)",
  color: D.ink,
  fontFamily: D.sans,
  fontSize: 17,
  outline: "none",
  boxSizing: "border-box",
};

/* Where a practice task runs: a darker stage with a grid, so the light app
 * window floats on it like the landing's hero. */
export function Workspace({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="dr-workspace" style={style}>
      {children}
    </div>
  );
}

/* Everything the shell's class names need, once per page (rendered by the
 * page shells: CourseHome, ModulePlayer). Focus rings, hovers and the glass
 * edge live here because inline styles cannot express them. */
export const SHELL_CSS = `
  .dr-shell { position: relative; min-height: 100svh; isolation: isolate; background: ${D.ground}; color: ${D.body}; font-family: ${D.sans}; color-scheme: dark; overflow-x: clip; }
  .dr-shell::before { content: ""; position: fixed; inset: 0; z-index: -2; pointer-events: none;
    background: radial-gradient(60% 50% at 12% 0%, rgba(43,89,195,0.28), transparent 60%), radial-gradient(50% 45% at 92% 18%, rgba(124,92,255,0.2), transparent 60%), radial-gradient(60% 50% at 50% 110%, rgba(10,112,133,0.22), transparent 60%); }
  .dr-shell::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background-image: linear-gradient(${D.grid} 1px, transparent 1px), linear-gradient(90deg, ${D.grid} 1px, transparent 1px); background-size: 48px 48px;
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 80%); mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 80%); }
  .dr-shell :is(a, button, input, select, textarea, [role=button]):focus-visible { outline: 2px solid ${D.accent}; outline-offset: 3px; }
  .dr-shell input::placeholder, .dr-shell textarea::placeholder { color: rgba(200,212,240,0.45); }
  .dr-btn-primary:not(:disabled):hover { transform: translateY(-1px); }
  .dr-btn-secondary:not(:disabled):hover { border-color: ${D.accentEdge} !important; background: ${D.glassStrong} !important; }
  .dr-btn-plain:not(:disabled):hover { color: ${D.ink} !important; }
  .dr-glass { overflow: hidden; isolation: isolate; }
  .dr-glass::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background-image: linear-gradient(${D.grid} 1px, transparent 1px), linear-gradient(90deg, ${D.grid} 1px, transparent 1px); background-size: 26px 26px;
    -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%); mask-image: linear-gradient(180deg, #000, transparent 70%); }
  .dr-glass::after { content: ""; position: absolute; left: 22px; right: 22px; top: 0; height: 2px; border-radius: 2px; pointer-events: none;
    background: linear-gradient(90deg, transparent, var(--acc, ${D.accent}), transparent); box-shadow: 0 0 14px var(--acc, ${D.accent}); }
  .dr-workspace { position: relative; padding: 22px; border-radius: 18px; background: radial-gradient(90% 70% at 50% 0%, rgba(43,89,195,0.22), transparent 65%), #050812;
    border: 1px solid ${D.edge}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02); isolation: isolate; }
  .dr-workspace::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
    background-image: linear-gradient(${D.grid} 1px, transparent 1px), linear-gradient(90deg, ${D.grid} 1px, transparent 1px); background-size: 22px 22px; }
  .dr-option { transition: border-color .18s ease, background .18s ease, transform .15s ease; }
  .dr-option:not(:disabled):hover { border-color: ${D.accentEdge} !important; background: ${D.glassStrong} !important; transform: translateX(2px); }
  @media (max-width: 560px) { .dr-workspace { padding: 12px; } }
  @media (prefers-reduced-motion: reduce) { .dr-shell * { transition: none !important; animation: none !important; } }
`;

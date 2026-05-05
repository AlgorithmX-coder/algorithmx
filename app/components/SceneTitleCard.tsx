"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * SceneTitleCard — full-screen "loading screen" beat that fades in
 * between cases. Real PC games use these to mask transitions and
 * deliver a useful tip while the next scene preloads. The visual
 * weight tells the player "you've completed something, the world
 * is moving on."
 *
 * Public API:
 *   fireSceneTitle({ caseNumber, title, tip })
 *
 * Mount the host once near the lesson root. The card auto-dismisses
 * after `duration` ms (default 1700ms — ~1.2s on screen + 250ms in/out).
 */

export interface SceneTitlePayload {
  /** "CASE 8" / "INTRO" / "BOSS" — small kicker above the title. */
  caseLabel: string;
  /** Big main line. */
  title: string;
  /** Optional secondary tip / setup line. */
  tip?: string;
  /** Total milliseconds on screen including in/out. Default 1700. */
  duration?: number;
}

const GLOBAL_KEY = "__axSceneTitle__";

declare global {
  interface Window {
    __axSceneTitle__?: (p: SceneTitlePayload) => void;
  }
}

export function fireSceneTitle(p: SceneTitlePayload): void {
  if (typeof window === "undefined") return;
  const fn = window[GLOBAL_KEY];
  if (typeof fn === "function") fn(p);
}

const TIP_POOL = [
  "Strong passwords have 12+ characters. Phrases beat single words.",
  "Two-step locks add a second proof — even a stolen password is useless.",
  "If something online feels off, ask a grown-up before you click.",
  "Phishing emails copy real ones — check the address letter by letter.",
  "Don't share your address, school, or birthday in chats.",
  "Updating apps fixes secret leaks bad guys try to use.",
  "A firewall is a rule book that blocks risky traffic.",
  "Public Wi-Fi can be watched. Skip private things until you're home.",
  "Your digital footprint stays online. Post like a future you is reading.",
  "When unsure, log out and walk away — the page will still be there.",
];

export default function SceneTitleHost() {
  const [active, setActive] = useState<SceneTitlePayload | null>(null);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const tipIdxRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const fire = useCallback(
    (p: SceneTitlePayload) => {
      clearTimers();
      const tip =
        p.tip ?? TIP_POOL[tipIdxRef.current++ % TIP_POOL.length];
      const duration = p.duration ?? 1700;
      const outAt = Math.max(400, duration - 320);

      setActive({ ...p, tip });
      setPhase("in");

      timersRef.current.push(
        window.setTimeout(() => setPhase("out"), outAt),
      );
      timersRef.current.push(
        window.setTimeout(() => setActive(null), duration),
      );
    },
    [clearTimers],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window[GLOBAL_KEY] = fire;
    return () => {
      if (window[GLOBAL_KEY] === fire) {
        delete window[GLOBAL_KEY];
      }
      clearTimers();
    };
  }, [fire, clearTimers]);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-scene-title-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-scene-bg-in { 0%{opacity:0;} 100%{opacity:1;} }
@keyframes ax-scene-bg-out { 0%{opacity:1;} 100%{opacity:0;} }
@keyframes ax-scene-kicker { 0%{opacity:0;transform:translateY(-6px);} 100%{opacity:1;transform:translateY(0);} }
@keyframes ax-scene-title { 0%{opacity:0;transform:translateY(12px) scale(0.96);filter:blur(6px);} 100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);} }
@keyframes ax-scene-rule { 0%{width:0;opacity:0;} 100%{width:280px;opacity:1;} }
@keyframes ax-scene-tip { 0%{opacity:0;transform:translateY(8px);} 100%{opacity:0.85;transform:translateY(0);} }
@keyframes ax-scene-out { 0%{opacity:1;transform:scale(1);} 100%{opacity:0;transform:scale(1.04);} }
`;
    document.head.appendChild(el);
  }, []);

  if (!active) return null;

  const isOut = phase === "out";

  return (
    <div
      style={{
        ...overlayStyle,
        animation: isOut
          ? "ax-scene-bg-out 320ms ease-in both"
          : "ax-scene-bg-in 280ms ease-out both",
      }}
      aria-hidden
    >
      <div
        style={{
          ...contentStyle,
          animation: isOut
            ? "ax-scene-out 280ms ease-in both"
            : undefined,
        }}
      >
        <div style={kickerStyle}>{active.caseLabel}</div>
        <div style={titleStyle}>{active.title}</div>
        <div style={ruleStyle} />
        {active.tip && (
          <div style={tipBoxStyle}>
            <span style={tipLabelStyle}>TIP</span>
            <span style={tipTextStyle}>{active.tip}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9000,
  /* Fully opaque centre — true curtain wipe so the underlying scene
   * change at swap time is invisible, not a translucent fade. */
  background:
    "radial-gradient(ellipse at center, rgba(15,21,48,1) 0%, rgba(4,5,13,1) 60%, rgba(4,5,13,1) 100%)",
  backdropFilter: "blur(14px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  pointerEvents: "none",
};

const contentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
  textAlign: "center",
  padding: 24,
};

const kickerStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: 6,
  color: "#7df0ff",
  fontWeight: 800,
  animation: "ax-scene-kicker 380ms 80ms ease-out both",
  textTransform: "uppercase",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(32px, 5vw, 56px)",
  fontWeight: 900,
  letterSpacing: 3,
  background:
    "linear-gradient(135deg, #00e5ff 0%, #7c5cff 60%, #ff5fb3 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textShadow: "0 0 32px rgba(124,92,255,0.35)",
  animation: "ax-scene-title 520ms 160ms cubic-bezier(0.16,1,0.3,1) both",
  lineHeight: 1.1,
};

const ruleStyle: CSSProperties = {
  height: 2,
  background:
    "linear-gradient(90deg, transparent, #00e5ff, #7c5cff, #ff5fb3, transparent)",
  animation: "ax-scene-rule 600ms 320ms ease-out both",
};

const tipBoxStyle: CSSProperties = {
  marginTop: 14,
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(15,21,48,0.6)",
  border: "1px solid rgba(0,229,255,0.18)",
  borderRadius: 999,
  padding: "10px 16px",
  fontSize: 13,
  color: "rgba(232,237,255,0.85)",
  maxWidth: 520,
  animation: "ax-scene-tip 480ms 480ms ease-out both",
};

const tipLabelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 3,
  fontWeight: 800,
  color: "#7df0ff",
  background: "rgba(0,229,255,0.12)",
  border: "1px solid rgba(0,229,255,0.3)",
  borderRadius: 999,
  padding: "2px 8px",
};

const tipTextStyle: CSSProperties = {
  flex: 1,
  textAlign: "left",
};

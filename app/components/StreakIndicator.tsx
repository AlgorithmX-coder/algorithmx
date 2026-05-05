"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * StreakIndicator — listens to the global `algorithmx:answer-correct`
 * and `algorithmx:answer-wrong` events fired by the celebrations
 * module and renders a flame-style streak chip in the top-right.
 *
 * - 2+ in a row → chip appears
 * - increments → bounce + colour escalates (cyan → violet → pink → gold)
 * - wrong answer → resets to 0 + chip fades out
 * - 8s of no events → chip fades out (idle reset)
 */

const IDLE_TIMEOUT_MS = 8000;

function tierFor(streak: number) {
  if (streak >= 10) return { label: "ON FIRE", colour: "#ffd158", emoji: "🔥" };
  if (streak >= 7) return { label: "BLAZING", colour: "#ff5fb3", emoji: "🔥" };
  if (streak >= 4) return { label: "HOT", colour: "#7c5cff", emoji: "🔥" };
  return { label: "STREAK", colour: "#00e5ff", emoji: "✦" };
}

export default function StreakIndicator() {
  const [streak, setStreak] = useState(0);
  const [bounceKey, setBounceKey] = useState(0);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onCorrect = (e: Event) => {
      const detail = (e as CustomEvent<{ streak?: number }>).detail;
      const incoming = detail?.streak ?? 0;
      /* The fire-site streak is 1-indexed for the FIRST correct,
       * which we don't show. Only render once we hit 2+. */
      if (incoming >= 2) {
        setStreak(incoming);
        setBounceKey((k) => k + 1);
      }
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(
        () => setStreak(0),
        IDLE_TIMEOUT_MS,
      );
    };

    const onWrong = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      setStreak(0);
    };

    window.addEventListener(
      "algorithmx:answer-correct",
      onCorrect as EventListener,
    );
    window.addEventListener(
      "algorithmx:answer-wrong",
      onWrong as EventListener,
    );
    return () => {
      window.removeEventListener(
        "algorithmx:answer-correct",
        onCorrect as EventListener,
      );
      window.removeEventListener(
        "algorithmx:answer-wrong",
        onWrong as EventListener,
      );
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-streak-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-streak-in { 0%{opacity:0;transform:translateY(-12px) scale(0.92);} 60%{opacity:1;transform:translateY(2px) scale(1.04);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes ax-streak-out { 0%{opacity:1;transform:scale(1);} 100%{opacity:0;transform:scale(0.92);} }
@keyframes ax-streak-pop { 0%{transform:scale(1);} 30%{transform:scale(1.18) rotate(-3deg);} 60%{transform:scale(0.96) rotate(2deg);} 100%{transform:scale(1) rotate(0);} }
@keyframes ax-streak-flicker { 0%,100%{filter:drop-shadow(0 0 8px var(--ax-streak-glow));} 50%{filter:drop-shadow(0 0 18px var(--ax-streak-glow));} }
`;
    document.head.appendChild(el);
  }, []);

  if (streak < 2) return null;

  const tier = tierFor(streak);

  return (
    <div
      style={{
        ...hostStyle,
        ["--ax-streak-glow" as string]: `${tier.colour}aa`,
        animation: "ax-streak-in 360ms cubic-bezier(0.16,1,0.3,1) both",
      }}
      aria-live="polite"
    >
      <div
        style={{
          ...chipStyle,
          borderColor: `${tier.colour}55`,
          background: `linear-gradient(135deg, ${tier.colour}22, rgba(15,21,48,0.85))`,
          boxShadow: `0 0 0 1px ${tier.colour}33 inset, 0 6px 18px ${tier.colour}33`,
          animation: "ax-streak-flicker 1.6s ease-in-out infinite",
        }}
      >
        <span
          key={bounceKey}
          style={{
            ...emojiStyle,
            animation: "ax-streak-pop 360ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {tier.emoji}
        </span>
        <div style={textColStyle}>
          <span style={{ ...kickerStyle, color: tier.colour }}>
            {tier.label}
          </span>
          <span style={countStyle}>×{streak}</span>
        </div>
      </div>
    </div>
  );
}

const hostStyle: CSSProperties = {
  position: "fixed",
  top: 80,
  right: 20,
  zIndex: 9300,
  pointerEvents: "none",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const chipStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 14px 8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(15,21,48,0.85)",
  color: "#e8edff",
};

const emojiStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
  display: "inline-block",
  willChange: "transform",
};

const textColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  lineHeight: 1.05,
};

const kickerStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 3,
  fontWeight: 800,
  textTransform: "uppercase",
};

const countStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  letterSpacing: 1,
  fontFamily: "monospace",
};

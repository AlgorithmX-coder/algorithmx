"use client";

/**
 * Signal Room primitives — the shared chrome every scene and mechanic
 * composes from. These components make the art direction hard to
 * violate: no springs, roles-only accents, brass nowhere near here.
 */

import { useEffect, useState } from "react";
import { BAND_BY_CLASSIFICATION, MONO, T } from "./tokens";
import type { Classification } from "./types";

/* ----------------------------------------------------- reduced motion */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------ eyebrow */

export function Eyebrow({ text, color = T.textSecondary }: { text: string; color?: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.08em",
        color,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
}

/* -------------------------------------------------------- amber button */

export function AmberButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="sr-btn"
      style={{
        fontFamily: MONO,
        fontSize: 13,
        letterSpacing: "0.06em",
        color: T.inkBlack,
        background: T.actionAmber,
        border: "none",
        borderRadius: 3,
        padding: "12px 22px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

/** Quiet secondary action — symmetric choice, never styled to disappear. */
export function GhostButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="sr-btn"
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: "0.06em",
        color: T.textSecondary,
        background: "transparent",
        border: `1px solid ${T.hairline}`,
        borderRadius: 3,
        padding: "11px 18px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------- classification band */

export function ClassificationBand({ level }: { level: Classification }) {
  return (
    <div
      style={{
        background: BAND_BY_CLASSIFICATION[level],
        color: T.inkBlack,
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.24em",
        textAlign: "center",
        padding: "6px 0",
      }}
    >
      {level}
    </div>
  );
}

/* --------------------------------------------------------- WREN chip */

export function HandlerChip({ reduced, speaking = true }: { reduced: boolean; speaking?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: T.panelRaised,
        border: `1px solid ${T.hairline}`,
        borderRadius: 3,
      }}
    >
      <span aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 2, height: 16 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={!reduced && speaking ? "sr-wavebar" : undefined}
            style={{
              width: 2,
              height: reduced || !speaking ? [6, 11, 8, 12, 5][i] : 4,
              background: T.arcCyan,
              animationDelay: `${i * 0.13}s`,
            }}
          />
        ))}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>
        WREN — HANDLER
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.08em",
          color: T.arcCyan,
          borderLeft: `1px solid ${T.hairline}`,
          paddingLeft: 10,
        }}
      >
        CHANNEL LIVE
      </span>
    </div>
  );
}

/* ------------------------------------------------- resolve (the verb) */

const NOISE = "▓▒░/\\|<>+=#%@$&";

export function Resolve({ text, reduced, delay = 0 }: { text: string; reduced: boolean; delay?: number }) {
  const [display, setDisplay] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const totalFrames = 18; // ≤600ms
    let raf = 0;
    const start = performance.now() + delay;
    const step = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(step);
        return;
      }
      frame++;
      const settled = Math.floor((frame / totalFrames) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === " ") out += text[i];
        else out += NOISE[Math.floor(Math.random() * NOISE.length)];
      }
      setDisplay(out);
      if (frame < totalFrames) raf = requestAnimationFrame(step);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, delay]);
  return <>{display || " "}</>;
}

/* -------------------------------------------------------- stamp mark */

export function StampMark({
  text,
  visible,
  reduced,
  style,
}: {
  text: string;
  visible: boolean;
  reduced: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={visible && !reduced ? "sr-stamp-in" : undefined}
      style={{
        transform: "rotate(-3deg)",
        border: `3px solid ${visible ? T.stampInk : "transparent"}`,
        color: T.stampInk,
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: 15,
        letterSpacing: "0.18em",
        padding: "6px 12px",
        borderRadius: 3,
        opacity: visible ? 0.9 : 0,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

/* -------------------------------------------------- engine stylesheet */
/* Every sr-* animation dies under prefers-reduced-motion; feedback then
   rides colour/text + sound (the two-channel rule). */

export function EngineStyles() {
  return (
    <style>{`
      .sr-btn { transition: filter 140ms cubic-bezier(0.2, 0, 0, 1); }
      .sr-btn:hover { filter: brightness(1.12); }
      .sr-btn:active { transform: translateY(1px); }

      .sr-wavebar { animation: srWave 0.9s cubic-bezier(0.2, 0, 0, 1) infinite alternate; }
      @keyframes srWave { from { height: 4px; } to { height: 14px; } }

      .sr-tell, .sr-decoy {
        background: none; border: none; padding: 0 2px; margin: 0;
        font: inherit; color: inherit; cursor: pointer; text-align: left;
        border-radius: 2px;
      }
      .sr-tell:hover, .sr-decoy:hover { background: rgba(20, 24, 29, 0.08); }
      .sr-tell[data-hit] {
        background: ${T.actionAmber}33;
        outline: 2px solid ${T.actionAmber};
        cursor: default;
      }
      .sr-tell[data-hit]::after { content: " ⚑"; color: #A66A00; }

      /* whisper-grade interference — evidence surfaces only, never ARC chrome */
      .sr-whisper::before {
        content: "";
        position: absolute; left: 0; right: 0; height: 1px;
        background: rgba(20, 24, 29, 0.18);
        animation: srScan 7s linear infinite;
        pointer-events: none;
      }
      @keyframes srScan {
        0%, 92% { opacity: 0; top: 0; }
        93% { opacity: 1; top: 12%; }
        96% { opacity: 1; top: 78%; }
        97%, 100% { opacity: 0; top: 100%; }
      }

      /* takeover-grade — incidents only; intensity-0 fallback is the
         static sr-corrupt-border treatment (art doc Appendix A.3) */
      .sr-takeover { animation: srJitter 1.6s steps(2, end) infinite; }
      @keyframes srJitter {
        0%, 86%, 100% { text-shadow: none; transform: none; }
        88% { text-shadow: 1.5px 0 ${T.threatRed}66, -1.5px 0 ${T.arcCyan}55; transform: translateX(0.5px); }
        92% { text-shadow: -1.5px 0 ${T.threatRed}66, 1.5px 0 ${T.arcCyan}55; transform: translateX(-0.5px); }
      }
      .sr-corrupt-border { border: 1px dashed ${T.threatRed}88 !important; }

      .sr-stamp-in { animation: srStamp 300ms cubic-bezier(0.2, 0, 0, 1); }
      @keyframes srStamp {
        0% { transform: rotate(-3deg) scale(1.15); opacity: 0; }
        30% { transform: rotate(-3deg) scale(1.0); opacity: 1; }
        38% { transform: rotate(-3deg) scale(1.0) translate(2px, 0); }
        46% { transform: rotate(-3deg) scale(1.0) translate(0, 0); }
        100% { transform: rotate(-3deg) scale(1.0); opacity: 0.9; }
      }

      .sr-scanfill { position: relative; overflow: hidden; }
      .sr-scanfill > .sr-scanfill-bar {
        position: absolute; left: 0; top: 0; bottom: 0;
        background: ${T.arcCyan}22;
        transition: width 120ms linear;
      }

      @media (max-width: 760px) {
        .sr-two-col { grid-template-columns: 1fr !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sr-wavebar, .sr-whisper::before, .sr-stamp-in, .sr-takeover { animation: none !important; }
      }
    `}</style>
  );
}

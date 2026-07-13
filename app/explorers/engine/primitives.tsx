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

/* ------------------------------------------------------- room backdrop */
/* The operations floor, lesson edition: the room is alive — drifting
   signal gas, dot dust, radar rings, a ground plane — and each beat
   tints it with its own color (tone). Cheap: transforms/opacity only. */

export function RoomBackdrop({ reduced, tone }: { reduced: boolean; tone: string }) {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* beat tone wash — the color journey between beats */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${tone}1C 0%, transparent 65%)`,
          transition: "background 700ms cubic-bezier(0.2,0,0,1)",
        }}
      />
      {/* drifting signal gas */}
      <div className="srof-blob" style={{ top: "-20vmax", right: "-14vmax", width: "56vmax", height: "56vmax", background: `radial-gradient(circle, ${tone}1F, transparent 62%)`, animationName: reduced ? "none" : "srofDriftA" }} />
      <div className="srof-blob" style={{ bottom: "-24vmax", left: "-16vmax", width: "62vmax", height: "62vmax", background: "radial-gradient(circle, rgba(42,91,143,0.24), transparent 62%)", animationName: reduced ? "none" : "srofDriftB" }} />
      {/* dot dust */}
      <div className="srof-dots srof-dots-far" />
      <div className="srof-dots srof-dots-near" />
      {/* radar rings, corner */}
      <div className="srof-radar">
        <div className="srof-radar-rings" />
        {!reduced && <div className="srof-radar-sweep" />}
      </div>
      {/* ground plane */}
      <div className="srof-floor" />
    </div>
  );
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
      className="sr-btn sr-cta"
      style={{
        fontFamily: MONO,
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: "0.06em",
        color: T.inkBlack,
        background: T.actionAmber,
        border: "none",
        borderRadius: 4,
        padding: "16px 28px",
        cursor: "pointer",
        boxShadow: `0 0 24px ${T.actionAmber}40, 0 4px 14px rgba(0,0,0,0.45)`,
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

      /* CTAs get lift + press */
      .sr-cta { transition: filter 140ms cubic-bezier(0.2,0,0,1), transform 140ms cubic-bezier(0.2,0,0,1); }
      .sr-cta:hover { filter: brightness(1.12); transform: translateY(-1px); }
      .sr-cta:active { transform: translateY(1px); }

      /* scene entrance — every beat rises in */
      .sr-scene { animation: srSceneIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      @keyframes srSceneIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }

      /* XP pop — the reward flies */
      .sr-xppop {
        position: absolute; right: 0; top: 100%;
        font-family: ${MONO}; font-size: 15px; font-weight: 600;
        color: ${T.confirmedGreen}; text-shadow: 0 0 14px ${T.confirmedGreen}66;
        animation: srXpPop 1.1s cubic-bezier(0.16,1,0.3,1) both;
        pointer-events: none; white-space: nowrap;
      }
      @keyframes srXpPop {
        0% { opacity: 0; transform: translateY(6px) scale(0.9); }
        18% { opacity: 1; transform: translateY(0) scale(1.12); }
        30% { transform: translateY(0) scale(1); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-14px); }
      }
      .sr-xpnum { display: inline-block; animation: srXpNum 0.5s cubic-bezier(0.2,0,0,1); }
      @keyframes srXpNum { 0% { transform: scale(1.35); color: ${T.confirmedGreen}; } 100% { transform: scale(1); } }

      /* choice buttons — bigger, alive */
      .sr-choice { transition: transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms, border-color 180ms; }
      @media (hover:hover) {
        .sr-choice:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px -12px rgba(0,0,0,0.8), 0 0 18px -6px ${T.arcCyan}44; border-color: ${T.arcCyan}88 !important; }
      }

      /* progress bar segments */
      .sr-seg { transition: background 400ms cubic-bezier(0.2,0,0,1), box-shadow 400ms; }
      .sr-seg-live { animation: srSegPulse 1.6s ease-in-out infinite; }
      @keyframes srSegPulse { 0%,100% { opacity: 0.65; } 50% { opacity: 1; } }

      /* ── the lesson room ── */
      .srof-blob { position: absolute; border-radius: 50%; filter: blur(70px); mix-blend-mode: screen; opacity: 0.65; will-change: transform; animation-duration: 85s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
      @keyframes srofDriftA { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-6vw, 5vh, 0) scale(1.14); } }
      @keyframes srofDriftB { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(6vw, -4vh, 0) scale(1); } }
      .srof-dots { position: absolute; inset: 0; background-repeat: repeat; }
      .srof-dots-far { opacity: 0.55; background-size: 230px 230px; background-image:
        radial-gradient(1px 1px at 30px 40px, ${T.arcCyan}40, transparent),
        radial-gradient(1px 1px at 140px 90px, ${T.textSecondary}30, transparent),
        radial-gradient(1px 1px at 80px 170px, ${T.arcCyan}2C, transparent); }
      .srof-dots-near { opacity: 0.4; background-size: 350px 350px; background-image:
        radial-gradient(1.5px 1.5px at 60px 100px, ${T.arcCyan}55, transparent),
        radial-gradient(1.4px 1.4px at 240px 210px, ${T.textSecondary}3C, transparent); }
      .srof-radar { position: absolute; top: -10vmax; right: -10vmax; width: 32vmax; height: 32vmax; }
      .srof-radar-rings { position: absolute; inset: 0; border-radius: 50%;
        background: repeating-radial-gradient(circle at center, transparent 0 calc(20% - 1px), ${T.arcCyan}20 calc(20% - 1px) 20%);
        border: 1px solid ${T.arcCyan}2A; }
      .srof-radar-sweep { position: absolute; inset: 0; border-radius: 50%;
        background: conic-gradient(from 0deg, ${T.arcCyan}30 0deg, ${T.arcCyan}0C 42deg, transparent 70deg);
        animation: srofSpin 17s linear infinite; }
      @keyframes srofSpin { to { transform: rotate(360deg); } }
      .srof-floor { position: absolute; left: -20%; right: -20%; bottom: -6vh; height: 30vh;
        background: repeating-linear-gradient(90deg, ${T.arcCyan}12 0 1px, transparent 1px 90px),
                    repeating-linear-gradient(0deg, ${T.arcCyan}0E 0 1px, transparent 1px 46px);
        transform: perspective(640px) rotateX(58deg); transform-origin: 50% 100%;
        mask-image: linear-gradient(180deg, transparent 0%, black 55%);
        -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 55%);
        opacity: 0.45; }

      @media (max-width: 760px) {
        .sr-two-col { grid-template-columns: 1fr !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sr-wavebar, .sr-whisper::before, .sr-stamp-in, .sr-takeover, .sr-scene,
        .sr-xppop, .sr-xpnum, .sr-seg-live, .srof-blob, .srof-radar-sweep { animation: none !important; }
        .sr-scene { opacity: 1; transform: none; }
      }
    `}</style>
  );
}

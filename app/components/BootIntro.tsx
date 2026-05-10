"use client";

import { type CSSProperties, useEffect } from "react";
import { playSound } from "@/app/lib/sounds";

/**
 * BootIntro - short cinematic that plays after the player creates a
 * NEW save slot, before the lesson mounts. Like the agency-issued
 * "WELCOME, AGENT" stings real games drop on first boot.
 *
 * Sequence (2.6s total):
 *   0.0s  black wipe in
 *   0.2s  cyan rule line draws across screen, logo glyph fades up
 *   0.7s  "WELCOME" stamp appears + small static crackle
 *   1.2s  "AGENT {name}" types out beneath
 *   1.9s  rule line collapses, logo zooms forward, screen fades
 *
 * Calls `onComplete()` once the timeline finishes. Reduce-motion
 * skips straight to onComplete after a short delay.
 */

export interface BootIntroProps {
  /** Hero name to greet. */
  name: string;
  /** Called when the intro is finished. */
  onComplete: () => void;
}

export default function BootIntro({ name, onComplete }: BootIntroProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const id = "ax-boot-intro-keyframes";
      if (!document.getElementById(id)) {
        const el = document.createElement("style");
        el.id = id;
        el.textContent = `
@keyframes ax-boot-rule { 0%{width:0;opacity:0;} 30%{width:60vw;opacity:1;} 80%{width:60vw;opacity:1;} 100%{width:0;opacity:0;} }
@keyframes ax-boot-glyph { 0%{opacity:0;letter-spacing:24px;filter:blur(10px);} 30%{opacity:1;letter-spacing:8px;filter:blur(0);} 90%{opacity:1;letter-spacing:8px;} 100%{opacity:0;letter-spacing:8px;transform:scale(1.4);} }
@keyframes ax-boot-stamp { 0%{opacity:0;transform:scale(1.6) rotate(-4deg);filter:blur(8px);} 60%{opacity:1;transform:scale(1) rotate(-2deg);filter:blur(0);} 100%{opacity:0;transform:scale(1) rotate(-2deg);} }
@keyframes ax-boot-type { from{width:0;} to{width:100%;} }
@keyframes ax-boot-cursor { 50%{opacity:0;} }
@keyframes ax-boot-fade-out { 0%{opacity:1;} 100%{opacity:0;} }
`;
        document.head.appendChild(el);
      }
    }

    /* Honour reduce-motion. */
    const reduce =
      typeof document !== "undefined" &&
      document.documentElement.dataset.axReduceMotion === "true";
    const total = reduce ? 600 : 2600;

    /* Sound cue at startup. */
    try {
      playSound("transition");
      window.setTimeout(() => playSound("levelUp"), 700);
    } catch {
      /* ignore */
    }

    const t = window.setTimeout(onComplete, total);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={hostStyle} aria-live="polite">
      <div style={ruleStyle} />
      <div style={glyphStyle}>AX</div>
      <div style={contentStyle}>
        <div style={stampStyle}>WELCOME</div>
        <div style={typeWrapStyle}>
          <span style={typeLabelStyle}>AGENT</span>
          <span style={typeNameWrapStyle}>
            <span style={typeNameTextStyle}>{name}</span>
          </span>
          <span style={cursorStyle}>_</span>
        </div>
      </div>
      <div style={fadeOverlayStyle} />
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const hostStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10500,
  background: "#04050d",
  color: "#e8edff",
  fontFamily: "system-ui, -apple-system, sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const ruleStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  height: 2,
  background:
    "linear-gradient(90deg, transparent, #00e5ff, #7c5cff, #ff5fb3, transparent)",
  transform: "translate(-50%, -50%)",
  animation: "ax-boot-rule 2400ms ease-in-out both",
  boxShadow: "0 0 24px rgba(0,229,255,0.6)",
};

const glyphStyle: CSSProperties = {
  position: "absolute",
  fontSize: 96,
  fontWeight: 900,
  letterSpacing: 8,
  background:
    "linear-gradient(135deg, #00e5ff 0%, #7c5cff 50%, #ff5fb3 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "ax-boot-glyph 2400ms 200ms cubic-bezier(0.16,1,0.3,1) both",
  textShadow: "0 0 80px rgba(124,92,255,0.5)",
};

const contentStyle: CSSProperties = {
  position: "absolute",
  bottom: "30%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const stampStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 12,
  color: "#7df0ff",
  border: "2px solid #7df0ff",
  borderRadius: 6,
  padding: "6px 20px",
  textTransform: "uppercase",
  animation: "ax-boot-stamp 1400ms 700ms cubic-bezier(0.16,1,0.3,1) both",
  boxShadow:
    "0 0 24px rgba(125,240,255,0.5), inset 0 0 12px rgba(125,240,255,0.18)",
};

const typeWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 10,
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: 4,
  fontFamily: "monospace",
  textTransform: "uppercase",
  animation: "ax-boot-stamp 600ms 1100ms ease-out both",
};

const typeLabelStyle: CSSProperties = {
  color: "rgba(232,237,255,0.6)",
};

const typeNameWrapStyle: CSSProperties = {
  display: "inline-flex",
  overflow: "hidden",
  whiteSpace: "nowrap",
  animation: "ax-boot-type 700ms 1200ms steps(20, end) both",
};

const typeNameTextStyle: CSSProperties = {
  color: "#00e5ff",
  textShadow: "0 0 12px rgba(0,229,255,0.6)",
};

const cursorStyle: CSSProperties = {
  color: "#00e5ff",
  animation: "ax-boot-cursor 800ms steps(2) infinite",
};

const fadeOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "#04050d",
  opacity: 0,
  animation: "ax-boot-fade-out 600ms 2000ms ease-in forwards",
  pointerEvents: "none",
};

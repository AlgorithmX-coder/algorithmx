"use client";

/**
 * NarrationClickGuard — while the narrator is speaking, block clicks/taps on
 * the lesson so children LISTEN instead of clicking ahead. Renders a
 * full-viewport pointer catcher (portalled to <body>) only while `active`.
 *
 * Z-INDEX 88 is deliberate: it sits ABOVE the lesson content but BELOW the
 * master MuteToggle (z-index 90, bottom-right). So the child cannot advance /
 * answer / skip during narration, but the mute button stays reachable — and
 * muting stops the narration (the natural "I don't want to listen" escape),
 * which also clears this guard. A small "Listen…" pill signals that clicks are
 * intentionally paused, so a blocked tap never feels broken.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function NarrationClickGuard({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!active || !mounted || typeof document === "undefined") return null;

  const swallow = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div
      aria-hidden
      onPointerDownCapture={swallow}
      onMouseDownCapture={swallow}
      onClickCapture={swallow}
      onTouchStartCapture={swallow}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 88, // above lesson content, below MuteToggle (z 90)
        background: "transparent",
        cursor: "default",
        touchAction: "none",
      }}
    >
      <style>{`@keyframes ncgPulse{0%,100%{opacity:.72}50%{opacity:1}}`}</style>
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 76,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 16px",
          borderRadius: 999,
          background: "rgba(10,16,38,0.9)",
          border: "1px solid rgba(125,240,255,0.45)",
          color: "#dff3ff",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.02em",
          fontFamily: "'Nunito', system-ui, sans-serif",
          boxShadow: "0 10px 28px -8px rgba(0,0,0,0.65), 0 0 18px rgba(0,229,255,0.25)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          animation: "ncgPulse 1.6s ease-in-out infinite",
        }}
      >
        <span aria-hidden>🔊</span> Listen…
      </div>
    </div>,
    document.body,
  );
}

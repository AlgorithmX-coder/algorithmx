"use client";

/**
 * NarrationClickGuard — while the narrator is speaking, catch clicks/taps on
 * the lesson so children can't skip or click through the voice. Renders a
 * full-viewport pointer catcher (portalled to <body>) only while `active`.
 *
 * HARD BLOCK (owner 2026-09-07): a tap is SWALLOWED, not a skip — the child
 * cannot skip the teaching voice by clicking. The voice auto-plays and the
 * guard lifts on its own when the voice ends (InfoNarration also has a
 * length-based safety-release, so the guard can never stick forever). The
 * master MuteToggle (z-index 90) stays reachable and is the only way to stop
 * the voice early (for a grown-up).
 *
 * Z-INDEX 88 is deliberate: above the lesson content, below the MuteToggle.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function NarrationClickGuard({
  active,
  hidePill = false,
}: {
  active: boolean;
  /** Keep the no-skip click-block but hide the "Listening…" pill, for a host
   *  that already shows its own listen indicator (e.g. WeekIntroScene's gated
   *  "Let's go!" button) - avoids two "listen" badges on one screen. */
  hidePill?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!active || !mounted || typeof document === "undefined") return null;

  // Swallow every pointer/click so nothing underneath fires and the voice
  // can't be skipped. NOT preventable by the child; only the voice ending
  // (or the mute button) lifts the guard.
  const block = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div
      aria-hidden
      onPointerDownCapture={block}
      onMouseDownCapture={block}
      onClickCapture={block}
      onTouchStartCapture={block}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 88, // above lesson content, below MuteToggle (z 90)
        background: "transparent",
        cursor: "default",
        touchAction: "none",
      }}
    >
      {!hidePill && (
        <>
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
            <span aria-hidden>🔊</span> Listening…
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}

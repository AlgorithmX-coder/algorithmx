"use client";
import { useEffect } from "react";
import { skipWrenWait } from "./audio";

/**
 * The "move forward" action shared by the ArrowRight shortcut and the
 * visible Skip button: collapse whatever WREN line is currently pacing,
 * then click the next "move forward" control if one's already on screen.
 *
 * It never answers a real question for the tester. Every pure move-forward
 * button in this app's copy ends its label with "→" (CONTINUE →, NEXT CASE
 * →, FIGHT →...) — genuine choice/option buttons never do — so that's the
 * one thing this keys off. It also skips anything `position: fixed` (the
 * Leave / WREN-voice-toggle buttons, and the Skip button itself, all live
 * there in every block), and skips disabled buttons, so a half-finished
 * build/pin/spot submit can't fire early.
 */
export function advanceNow() {
  skipWrenWait();
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const next = buttons.find(
    (b) => !b.disabled && b.textContent?.includes("→") && getComputedStyle(b).position !== "fixed",
  );
  next?.click();
}

/** ArrowRight fast-forwards through a case for UAT. See advanceNow(). */
export function useArrowAdvance() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea)$/i.test(t.tagName)) return; // don't hijack a text field
      e.preventDefault();
      advanceNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/**
 * Visible on-screen twin of the ArrowRight shortcut — same advanceNow()
 * action, for testers who'd rather click than use the keyboard. Owner-
 * requested, temporary for the UAT push: fixed bottom-right in every
 * block, out of the way of each block's own Leave/voice-toggle buttons.
 */
export function SkipButton() {
  return (
    <button
      onClick={advanceNow}
      aria-label="Skip ahead (testing)"
      style={{
        position: "fixed",
        bottom: 14,
        right: 14,
        // Block 1 has a full-viewport "hard lock" catcher at z50 that swallows
        // every click while WREN is speaking (engine/MissionRuntime.tsx) — sit
        // above it so Skip stays clickable exactly when it's needed most.
        zIndex: 55,
        fontFamily: "ui-monospace, Consolas, monospace",
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color: "#FFD166",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,209,102,0.55)",
        borderRadius: 999,
        padding: "9px 16px",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
      }}
    >
      Skip →
    </button>
  );
}

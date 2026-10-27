"use client";
import { useEffect } from "react";
import { skipWrenWait } from "./audio";

/**
 * UAT escape hatch: whatever exercise is currently on screen can register a
 * "just mark me complete" callback here, so Skip can finish it instead of
 * requiring a real answer. Only one exercise is ever mounted at a time, so a
 * single module-level slot is enough — each mechanic sets it on mount and
 * clears it on unmount (see useSkipToComplete below).
 */
let forceComplete: (() => void) | null = null;

/**
 * Call from any exercise component (a mechanic, a quiz question, the boss
 * test...) with the same "I'm done" callback it already uses on a real
 * correct answer. While that component is mounted, Skip will call this
 * directly instead of hunting for a "→" button — so testers aren't blocked
 * on actually solving the exercise.
 */
export function useSkipToComplete(onComplete: () => void) {
  useEffect(() => {
    forceComplete = onComplete;
    return () => {
      if (forceComplete === onComplete) forceComplete = null;
    };
  });
}

/**
 * The "move forward" action shared by the ArrowRight shortcut and the
 * visible Skip button: collapse whatever WREN line is currently pacing,
 * then either finish the current exercise (if one registered itself via
 * useSkipToComplete) or click the next "move forward" control if one's
 * already on screen.
 *
 * Every pure move-forward button in this app's copy ends its label with "→"
 * (CONTINUE →, NEXT CASE →, FIGHT →...) — genuine choice/option buttons
 * never do — so that's the one thing the button-search keys off. It also
 * skips anything `position: fixed` (the Leave / WREN-voice-toggle buttons,
 * and the Skip button itself, all live there in every block), and skips
 * disabled buttons, so a half-finished build/pin/spot submit can't fire
 * early via that path.
 */
export function advanceNow() {
  skipWrenWait();
  if (forceComplete) {
    forceComplete();
    return;
  }
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
        // Above EVERY other full-viewport overlay in Explorers: Block 1's
        // "hard lock" catcher that swallows clicks while WREN is speaking
        // (z50, engine/MissionRuntime.tsx) and BlockFilm's cinematic dialog
        // (z60, engine/BlockFilm.tsx). Skip needs to win against all of them,
        // not just the one it was first tested against.
        zIndex: 70,
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

/**
 * UAT escape hatch, the mirror image of SkipButton: lets a tester re-check
 * something they just scrolled past without losing any progress (owner —
 * Abdullah, Case 20 UAT: "add a back button so I can go back whilst doing
 * UAT"). Every one of the four blocks accumulates its current skill/scene
 * as a growing, scrollable transcript (never trimmed until the skill ends),
 * so going "back" never needs to touch game state — it only needs to
 * scroll that transcript up by about one screen. `target` is that block's
 * own scroll container's class (".wr-work" / ".ph-thread" / ".cn-work");
 * Signal Room's MissionRuntime instead replaces the whole screen per beat
 * (nothing to scroll), so it passes its own `onBack` that steps `pos`
 * backward one beat instead.
 */
export function BackButton({ target, onBack }: { target?: string; onBack?: () => void }) {
  const handleBack = () => {
    if (onBack) { onBack(); return; }
    const el = target ? document.querySelector<HTMLElement>(target) : null;
    el?.scrollBy({ top: -el.clientHeight * 0.8, behavior: "smooth" });
  };
  return (
    <button
      onClick={handleBack}
      aria-label="Back one step (testing)"
      style={{
        position: "fixed",
        bottom: 14,
        left: 14,
        zIndex: 70,
        fontFamily: "ui-monospace, Consolas, monospace",
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color: "#7CD1FF",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(124,209,255,0.55)",
        borderRadius: 999,
        padding: "9px 16px",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
      }}
    >
      ← Back
    </button>
  );
}

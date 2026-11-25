"use client";
import { useEffect, useState } from "react";
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

/**
 * The tester unlock. These controls let someone jump past the learning, and
 * one of them records the skipped exercise as mastered, so they must never be
 * reachable by a child. They now sit behind the same `explorers:qa` flag that
 * already gates the ?case= deep-link and the Zero File reset (app/explorers/
 * page.tsx): a tester visits /explorers?qa=1 once and keeps them for that
 * browser; ?qa=0 turns them off again. Nothing is deleted, so a re-test round
 * costs one query parameter.
 *
 * Development builds only (owner 2026-11-25: no tester shortcuts for
 * customers). A production build always answers false, whatever a browser
 * has stored.
 */
export function qaUnlocked(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    return localStorage.getItem("explorers:qa") === "1";
  } catch {
    return false; // private mode / storage blocked: treat as locked
  }
}

/**
 * Render-time twin of qaUnlocked(). Reads in an effect so the server and the
 * first client render agree (localStorage does not exist on the server), the
 * same pattern the map page uses for its own `qa` state.
 */
export function useQaUnlocked(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(qaUnlocked()); }, []);
  return on;
}

/** ArrowRight fast-forwards through a case for UAT. See advanceNow(). */
export function useArrowAdvance() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight") return;
      if (!qaUnlocked()) return; // tester-only; see qaUnlocked()
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
/**
 * Wrapper for a tester-only control that lives inside a block runtime (each
 * block has its own "Skip this whole skill" button). Renders nothing unless
 * the explorers:qa unlock is on, so the control is gated without having to
 * restructure the runtime around a hook.
 */
export function QaOnly({ children }: { children: React.ReactNode }) {
  const qa = useQaUnlocked();
  return qa ? <>{children}</> : null;
}

export function SkipButton() {
  const qa = useQaUnlocked();
  if (!qa) return null; // tester-only; see qaUnlocked()
  return (
    <button
      onClick={advanceNow}
      aria-label="Skip ahead (testing)"
      style={{
        position: "fixed",
        bottom: 14,
        right: 14,
        // Above EVERY other full-viewport overlay in Explorers, including
        // Block 1's "hard lock" catcher that swallows clicks while WREN is
        // speaking (z50, engine/MissionRuntime.tsx).
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

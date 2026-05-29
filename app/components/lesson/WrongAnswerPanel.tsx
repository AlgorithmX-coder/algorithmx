"use client";

/**
 * Shared "pause-on-wrong" panel used by every interactive exercise.
 *
 * When the child answers incorrectly, the exercise pauses its game loop
 * and renders this panel. It explains the specific mistake in
 * kid-friendly language and waits for an explicit "Got it!" tap before
 * letting the activity resume.
 *
 * This panel is the inverse of a flash-of-red punishment - it turns the
 * mistake into a teaching moment.
 */

import { useEffect, useRef } from "react";
import { playSound } from "@/app/lib/sounds";
import { useComfortMode } from "@/app/lib/comfortMode";

export interface WrongAnswerPanelProps {
  /** Short headline ("That one was WEAK"). */
  title: string;
  /** Specific explanation of *why* the child's answer was wrong. */
  explanation: string;
  /** Optional secondary tip (e.g. the rule that applies). */
  tip?: string;
  /**
   * Legacy: chose an Adam/Layla avatar for the panel header. Character
   * avatars were removed from exercise UI - this prop is now ignored
   * but kept in the type so existing callers compile unchanged.
   * @deprecated
   */
  speaker?: "adam" | "layla";
  /** Called when the child taps "Got it". */
  onContinue: () => void;
}

export default function WrongAnswerPanel({
  title,
  explanation,
  tip,
  onContinue,
}: WrongAnswerPanelProps) {
  const comfort = useComfortMode();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Focus the Got It button on mount so keyboard / switch users can
  // advance with Enter or Space.
  useEffect(() => {
    const btn = dialogRef.current?.querySelector<HTMLButtonElement>(
      "[data-got-it]"
    );
    btn?.focus();
  }, []);

  const reduce = comfort.enabled || comfort.prefersReducedMotion;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wrong-answer-title"
      ref={dialogRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(8, 10, 22, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: reduce ? undefined : "wrongPanelFadeIn 180ms ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(180deg, #1a1f4d 0%, #0f1530 100%)",
          border: "2px solid rgba(255, 209, 88, 0.55)",
          borderRadius: 22,
          boxShadow:
            "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 209, 88, 0.18)",
          padding: 22,
          color: "#fff7e6",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              minWidth: 56,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: "3px solid #ffd158",
              boxShadow:
                "0 0 18px rgba(255, 209, 88, 0.5), 0 0 0 1px rgba(255, 209, 88, 0.25) inset",
              background:
                "radial-gradient(circle at 30% 30%, #2a1f08 0%, #0f1530 70%)",
              flexShrink: 0,
              fontSize: 28,
              filter: "drop-shadow(0 0 6px rgba(255, 209, 88, 0.7))",
            }}
          >
            <span>!</span>
          </div>
          <h2
            id="wrong-answer-title"
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "#ffd158",
              textShadow: "0 0 12px rgba(255, 209, 88, 0.45)",
            }}
          >
            {title}
          </h2>
        </div>

        <p
          style={{
            margin: "0 0 12px",
            fontSize: 16,
            lineHeight: 1.45,
            color: "#e7ecff",
          }}
        >
          {explanation}
        </p>

        {tip && (
          <p
            style={{
              margin: "0 0 18px",
              padding: "10px 12px",
              fontSize: 14,
              lineHeight: 1.4,
              color: "#7df0ff",
              background: "rgba(0, 229, 255, 0.08)",
              border: "1px solid rgba(0, 229, 255, 0.25)",
              borderRadius: 10,
            }}
          >
            <strong style={{ color: "#7df0ff" }}>Remember: </strong>
            {tip}
          </p>
        )}

        <button
          type="button"
          data-got-it
          onClick={() => {
            playSound("click");
            onContinue();
          }}
          style={{
            background: "linear-gradient(135deg, #7eff97, #34d399)",
            color: "#0f1530",
            fontWeight: 900,
            fontSize: 16,
            border: "none",
            borderRadius: 14,
            padding: "12px 32px",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(52, 211, 153, 0.4)",
            letterSpacing: "0.02em",
          }}
        >
          Got it!
        </button>
      </div>

      <style>{`
        @keyframes wrongPanelFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

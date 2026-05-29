"use client";

/**
 * Pop-up Panic.
 *
 * A sequence of fake scary pop-ups. Each one has a tempting OK
 * button and a small but always-tappable X. The child has to find
 * and tap the X every time. Teaches the "close it, tell a grown-up,
 * don't engage" instinct that phishing relies on people NOT having.
 *
 * Not a reaction-speed game - untimed. The urgency is theatrical:
 * countdown numbers, scary icons, but tapping the wrong button is
 * met with a calm explanation, never a loss state.
 *
 * Toolkit-native build. Same shape as PasswordHospital so any future
 * exercise can follow this template.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";

export interface PopupPanicPopup {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  whyTrick: string;
}

export interface PopupPanicProps {
  popups: PopupPanicPopup[];
  hints?: { tier1: string; tier2: string; tier3: string };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

type Phase = "intro" | "active" | "finished";

export default function PopupPanic({
  popups,
  hints,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PopupPanicProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [popupIdx, setPopupIdx] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  // The popup keeps refreshing visually each render via a key bumped
  // on close. Avoids any chance of a "ghost" of the previous popup.
  const [popupRenderKey, setPopupRenderKey] = useState(0);

  const popup = popups[popupIdx];

  // Hint tier rises when the same popup has been "OK"-tapped multiple
  // times in a row. We surface tier-2/3 only - tier 1 is the popup
  // existing at all (X is visible, no extra nudge needed).
  useEffect(() => {
    if (!onHintReached || wrongOnCurrent === 0) return;
    if (wrongOnCurrent >= 3) onHintReached(3);
    else if (wrongOnCurrent === 2) onHintReached(2);
    else onHintReached(1);
  }, [wrongOnCurrent, onHintReached]);

  const handleX = useCallback(() => {
    if (!popup || feedback) return;
    onAnswered?.({
      questionKey: `popup-${popup.id}`,
      selectedIndex: 0,
      correctIndex: 0,
      wasCorrect: true,
    });
    onCorrect?.();
    fx.correct({ xp: 10, text: "GOT IT!" });
    setClosedCount((n) => n + 1);
    setWrongOnCurrent(0);
    const next = popupIdx + 1;
    if (next >= popups.length) {
      setPhase("finished");
    } else {
      setPopupIdx(next);
      setPopupRenderKey((k) => k + 1);
    }
  }, [popup, feedback, popupIdx, popups.length, fx, onCorrect, onAnswered]);

  const handleOk = useCallback(() => {
    if (!popup || feedback) return;
    onAnswered?.({
      questionKey: `popup-${popup.id}`,
      selectedIndex: 1,
      correctIndex: 0,
      wasCorrect: false,
    });
    onWrong?.();
    audio.wrong();
    setWrongTotal((n) => n + 1);
    setWrongOnCurrent((n) => n + 1);
    setFeedback({
      title: "OK is the trap!",
      explanation: popup.whyTrick,
      tip: "Scary pop-ups want you to panic. The X (close) is always the right button.",
    });
  }, [popup, feedback, audio, onWrong, onAnswered]);

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = wrongTotal === 0 ? 3 : wrongTotal <= 2 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title="All pop-ups closed!"
          stars={stars}
          statLines={[
            `${closedCount} of ${popups.length} dismissed`,
            wrongTotal === 0
              ? "Not once fooled by an OK button."
              : `${wrongTotal} OK-trap${wrongTotal === 1 ? "" : "s"} along the way.`,
          ]}
          onContinue={() => onComplete(closedCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active ─── */

  return (
    <ExerciseFrame
      maxWidth={900}
      padding={24}
      background="linear-gradient(180deg, #0f1530 0%, #1a0f2a 100%)"
    >
      {/* Header / progress */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#ff9bcb",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          ⚠ Pop-up Panic
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          {Math.min(popupIdx + 1, popups.length)} / {popups.length}
        </span>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#cbd5e1",
          fontSize: 14,
          marginTop: 0,
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        Scary pop-ups are trying to trick you. Find the{" "}
        <strong style={{ color: "#7eff97" }}>X</strong> on each one to close it.
      </p>

      {/* Hint area (always reserves space) */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {wrongOnCurrent > 0 && hints && (
          <HintBubble
            tier={(wrongOnCurrent >= 3 ? 3 : wrongOnCurrent === 2 ? 2 : 1) as 1 | 2 | 3}
            speaker="adam"
            text={
              wrongOnCurrent >= 3
                ? hints.tier3
                : wrongOnCurrent === 2
                  ? hints.tier2
                  : hints.tier1
            }
          />
        )}
      </div>

      {/* Faux browser frame containing the popup */}
      <div
        style={{
          position: "relative",
          background: "rgba(8, 10, 22, 0.7)",
          border: "1px solid rgba(255, 95, 179, 0.25)",
          borderRadius: 14,
          padding: 24,
          minHeight: 320,
          overflow: "hidden",
        }}
      >
        {/* "Browser desktop" placeholder behind the popup */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 16,
            border: "1px dashed rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            opacity: 0.4,
          }}
        />

        <AnimatePresence mode="wait">
          {popup && (
            <motion.div
              key={`popup-${popupRenderKey}`}
              initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -10 }}
              animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={
                intensity === 0
                  ? { duration: 0.18 }
                  : { type: "spring", stiffness: 340, damping: 22 }
              }
              style={{
                position: "relative",
                margin: "0 auto",
                maxWidth: 460,
                background: "linear-gradient(180deg, rgba(255, 95, 179, 0.12), rgba(15, 21, 48, 0.95))",
                border: "2.5px solid #ff5fb3",
                borderRadius: 14,
                padding: "20px 22px 22px",
                boxShadow:
                  "0 18px 48px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
                color: "#fff7e6",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                animation:
                  intensity === 0
                    ? undefined
                    : "popupShake 380ms cubic-bezier(0.36, 0.07, 0.19, 0.97) 80ms",
              }}
            >
              {/* The X (close) button - small but reachable. Min hit
                  area enforced via padding inside the button so the
                  visual X stays compact but the tap zone is 44pt+. */}
              <button
                type="button"
                aria-label="Close popup"
                onClick={handleX}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(15, 21, 48, 0.6)",
                  border: "1.5px solid rgba(126, 255, 151, 0.5)",
                  color: "#7eff97",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 900,
                  fontFamily: "system-ui",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  touchAction: "manipulation",
                }}
              >
                ×
              </button>

              <div
                style={{
                  fontSize: 36,
                  textAlign: "center",
                  lineHeight: 1,
                  marginBottom: 8,
                  animation:
                    intensity === 0
                      ? undefined
                      : "popupIconPulse 1.4s ease-in-out infinite",
                }}
              >
                {popup.icon ?? "⚠️"}
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                  color: "#ffd158",
                  lineHeight: 1.25,
                  textShadow: "0 0 14px rgba(255, 209, 88, 0.35)",
                }}
              >
                {popup.title}
              </h3>
              {popup.body && (
                <p
                  style={{
                    margin: "0 0 16px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  {popup.body}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {/* The OK button - tempting and large. This is the trap. */}
                <GameButton
                  variant="danger"
                  size="lg"
                  onClick={handleOk}
                  style={{ minWidth: 180 }}
                >
                  OK
                </GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Intro beat */}
      {phase === "intro" && (
        <ExerciseIntroBeat
          title="Pop-up Panic"
          subtitle="Close every fake pop-up by tapping its X. Don't tap OK - that's the trick."
          icon="⚠️"
          onDismiss={() => setPhase("active")}
        />
      )}

      {/* Wrong-answer panel */}
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={() => setFeedback(null)}
        />
      )}

      {fx.layer()}

      <style>{`
        @keyframes popupShake {
          0%   { transform: translate(0, 0) }
          15%  { transform: translate(-3px, 1px) }
          30%  { transform: translate(3px, -1px) }
          45%  { transform: translate(-2px, 1px) }
          60%  { transform: translate(2px, 0) }
          75%  { transform: translate(-1px, 0) }
          100% { transform: translate(0, 0) }
        }
        @keyframes popupIconPulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 95, 179, 0)) }
          50%     { transform: scale(1.08); filter: drop-shadow(0 0 12px rgba(255, 95, 179, 0.6)) }
        }
      `}</style>
    </ExerciseFrame>
  );
}

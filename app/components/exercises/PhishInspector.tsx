"use client";

/**
 * Phish Inspector.
 *
 * The deliberate cousin of SpamBlaster's reaction-speed turret. Each
 * email opens fullscreen; before the ZAP / SAFE decision buttons
 * unlock, the child must tap each of 4 inspect zones and read what
 * the analysis reveals:
 *
 *   1. WHO sent it?        (sender analysis)
 *   2. WHAT'S the link?    (URL / click target)
 *   3. HOW does it sound?  (urgency / pressure)
 *   4. WHAT'S it promising? (offer / threat)
 *
 * Each zone flips from a magnifying-glass icon to either a green ✓
 * (no red flag) or a red ⚠ (red flag) + a short kid-friendly note.
 * After all 4 are inspected the decision row appears. Wrong decision
 * pauses with a WrongAnswerPanel explanation.
 *
 * Teaches the mental model of phishing literacy: SLOW DOWN, LOOK AT
 * THESE FOUR THINGS, then decide. Replaces "every scary message =
 * delete" with "every message gets inspected".
 */

import { useCallback, useEffect, useMemo, useState } from "react";
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

export interface PhishEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  inspections: {
    senderNote: string;
    senderIsRedFlag: boolean;
    linkText: string;
    linkNote: string;
    linkIsRedFlag: boolean;
    urgencyNote: string;
    urgencyIsRedFlag: boolean;
    claimNote: string;
    claimIsRedFlag: boolean;
  };
}

export interface PhishInspectorProps {
  emails: PhishEmail[];
  hints?: { tier1: string; tier2: string };
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

type ZoneId = "sender" | "link" | "urgency" | "claim";
type Phase = "intro" | "active" | "finished";

const ZONE_META: Record<ZoneId, { label: string; question: string; icon: string }> = {
  sender:  { label: "Who sent it?",      question: "Check the sender", icon: "👤" },
  link:    { label: "What's the link?",  question: "Look at the link", icon: "🔗" },
  urgency: { label: "How does it sound?", question: "Listen to the tone", icon: "⏱️" },
  claim:   { label: "What's it promising?", question: "Check the offer", icon: "🎁" },
};

export default function PhishInspector({
  emails,
  hints,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PhishInspectorProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [emailIdx, setEmailIdx] = useState(0);
  const [inspected, setInspected] = useState<Record<ZoneId, boolean>>({
    sender: false,
    link: false,
    urgency: false,
    claim: false,
  });
  const [decided, setDecided] = useState(false);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const email = emails[emailIdx];
  const allInspected = useMemo(
    () => inspected.sender && inspected.link && inspected.urgency && inspected.claim,
    [inspected]
  );

  // Reset per-email state when advancing.
  useEffect(() => {
    setInspected({ sender: false, link: false, urgency: false, claim: false });
    setDecided(false);
    setWrongOnCurrent(0);
  }, [emailIdx]);

  const handleInspect = useCallback(
    (zone: ZoneId) => {
      if (!email || feedback || decided) return;
      if (inspected[zone]) return;
      audio.tap();
      setInspected((prev) => ({ ...prev, [zone]: true }));
      // Subtle juice: red-flag reveals get a danger toast, green reveals
      // get a soft xp toast.
      const isRedFlag =
        zone === "sender"
          ? email.inspections.senderIsRedFlag
          : zone === "link"
            ? email.inspections.linkIsRedFlag
            : zone === "urgency"
              ? email.inspections.urgencyIsRedFlag
              : email.inspections.claimIsRedFlag;
      if (isRedFlag) {
        fx.toast({
          text: "RED FLAG!",
          tone: "danger",
          durationMs: 700,
        });
      } else {
        fx.toast({
          text: "Looks ok",
          tone: "xp",
          durationMs: 600,
        });
      }
    },
    [email, feedback, decided, inspected, audio, fx]
  );

  const handleDecision = useCallback(
    (zapped: boolean) => {
      if (!email || feedback || decided) return;
      const wasCorrect = zapped === email.isPhishing;
      // correctIndex: 0 for ZAP if phishing, 1 for SAFE if legit.
      const correctIndex = email.isPhishing ? 0 : 1;
      const selectedIndex = zapped ? 0 : 1;
      onAnswered?.({
        questionKey: `phish-${email.id}-decision`,
        selectedIndex,
        correctIndex,
        wasCorrect,
      });
      if (wasCorrect) {
        setCorrectCount((n) => n + 1);
        onCorrect?.();
        fx.correct({
          xp: 15,
          text: zapped ? "ZAPPED!" : "STAYED SAFE!",
          tone: zapped ? "danger" : "xp",
        });
        setDecided(true);
        // Brief hold, then next email.
        window.setTimeout(
          () => {
            const next = emailIdx + 1;
            if (next >= emails.length) {
              setPhase("finished");
            } else {
              setEmailIdx(next);
            }
          },
          intensity === 0 ? 600 : 1100
        );
      } else {
        onWrong?.();
        audio.wrong();
        setWrongTotal((n) => n + 1);
        const nextWrong = wrongOnCurrent + 1;
        setWrongOnCurrent(nextWrong);
        const correctChoice = email.isPhishing ? "ZAP" : "SAFE";
        setFeedback({
          title: email.isPhishing
            ? "That was a phishing trick"
            : "That was a real email!",
          explanation: email.isPhishing
            ? "You inspected the red flags - the right call was ZAP. The Raccoon would have got your password."
            : `"${email.sender}" was a normal email. You'd want to keep it - the answer was SAFE.`,
          tip: `Look at all 4 inspections together. Multiple red flags = ${correctChoice}.`,
        });
        if (nextWrong === 1) onHintReached?.(1);
        if (nextWrong >= 2) onHintReached?.(2);
      }
    },
    [
      email,
      feedback,
      decided,
      emailIdx,
      emails.length,
      wrongOnCurrent,
      fx,
      audio,
      intensity,
      onCorrect,
      onWrong,
      onAnswered,
      onHintReached,
    ]
  );

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = wrongTotal === 0 ? 3 : wrongTotal <= 1 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title="Inspector training complete!"
          stars={stars}
          statLines={[
            `${correctCount} of ${emails.length} emails decided correctly`,
            wrongTotal === 0
              ? "Spotted every trick first time!"
              : `${wrongTotal} wrong decision${wrongTotal === 1 ? "" : "s"} along the way.`,
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active ─── */
  if (!email) return null;

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={24}
      background="linear-gradient(180deg, #050a1a 0%, #1a1f4d 100%)"
    >
      {/* Header */}
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
            color: "#7df0ff",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          🔍 Phish Inspector
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          Email {emailIdx + 1} / {emails.length}
        </span>
      </div>

      {/* Email card */}
      <div
        style={{
          padding: "14px 16px",
          marginBottom: 12,
          background: "rgba(8, 10, 22, 0.85)",
          border: "1px solid rgba(125, 240, 255, 0.25)",
          borderRadius: 12,
          color: "#e2e8f0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#94a3b8",
            marginBottom: 6,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          <span>From: <span style={{ color: "#cbd5e1" }}>{email.sender}</span></span>
          <span style={{ color: "#64748b" }}>now</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#fff7e6" }}>
          {email.subject}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "#cbd5e1" }}>
          {email.body}
        </div>
      </div>

      {/* 4-zone inspector grid */}
      <div
        role="group"
        aria-label="Inspect 4 zones"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {(Object.keys(ZONE_META) as ZoneId[]).map((zone) => {
          const meta = ZONE_META[zone];
          const isOpen = inspected[zone];
          const isRedFlag =
            zone === "sender"
              ? email.inspections.senderIsRedFlag
              : zone === "link"
                ? email.inspections.linkIsRedFlag
                : zone === "urgency"
                  ? email.inspections.urgencyIsRedFlag
                  : email.inspections.claimIsRedFlag;
          const noteText =
            zone === "sender"
              ? email.inspections.senderNote
              : zone === "link"
                ? `${email.inspections.linkText} - ${email.inspections.linkNote}`
                : zone === "urgency"
                  ? email.inspections.urgencyNote
                  : email.inspections.claimNote;
          const accent = isOpen
            ? isRedFlag
              ? { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(255, 95, 179, 0.65)", text: "#ff9bcb" }
              : { bg: "rgba(126, 255, 151, 0.1)", border: "rgba(126, 255, 151, 0.55)", text: "#a0ffb0" }
            : { bg: "rgba(15, 21, 48, 0.7)", border: "rgba(125, 240, 255, 0.3)", text: "#7df0ff" };
          return (
            <motion.button
              key={zone}
              type="button"
              onClick={() => handleInspect(zone)}
              disabled={isOpen || decided || phase !== "active"}
              initial={false}
              animate={
                isOpen
                  ? { scale: intensity === 0 ? 1 : [1, 1.04, 1], transition: { duration: 0.35 } }
                  : { scale: 1 }
              }
              style={{
                position: "relative",
                padding: "12px 14px",
                minHeight: 88,
                borderRadius: 12,
                background: accent.bg,
                border: `2px solid ${accent.border}`,
                color: accent.text,
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "left",
                cursor: !isOpen && phase === "active" && !decided ? "pointer" : "default",
                transition: "all 220ms ease-out",
                touchAction: "manipulation",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {isOpen ? (isRedFlag ? "⚠" : "✓") : "🔍"}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {meta.label}
                </span>
              </div>
              {isOpen ? (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#e2e8f0",
                    lineHeight: 1.4,
                  }}
                >
                  {noteText}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: accent.text,
                    fontWeight: 700,
                  }}
                >
                  {meta.question}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {wrongOnCurrent > 0 && hints && (
          <HintBubble
            tier={wrongOnCurrent >= 2 ? 2 : 1}
            speaker="layla"
            text={wrongOnCurrent >= 2 ? hints.tier2 : hints.tier1}
          />
        )}
      </div>

      {/* Decision row - only enabled once all 4 inspected */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          opacity: allInspected ? 1 : 0.5,
          transition: "opacity 240ms ease-out",
        }}
      >
        <GameButton
          variant="danger"
          size="lg"
          icon="⚡"
          disabled={!allInspected || decided || phase !== "active"}
          onClick={() => handleDecision(true)}
          style={{ minWidth: 160 }}
        >
          ZAP it!
        </GameButton>
        <GameButton
          variant="success"
          size="lg"
          icon="✅"
          disabled={!allInspected || decided || phase !== "active"}
          onClick={() => handleDecision(false)}
          style={{ minWidth: 160 }}
        >
          Mark SAFE
        </GameButton>
      </div>

      {!allInspected && (
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#64748b",
            marginTop: 8,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
          }}
        >
          Inspect all 4 zones to unlock
        </div>
      )}

      {phase === "intro" && (
        <ExerciseIntroBeat
          title="Phish Inspector"
          subtitle="Don't just react - INSPECT. Tap each of the 4 zones, then decide if it's safe or a trick."
          icon="🔍"
          onDismiss={() => setPhase("active")}
        />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={() => setFeedback(null)}
        />
      )}

      <AnimatePresence>
        {decided && phase === "active" && (
          <motion.div
            initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background: "rgba(8, 10, 22, 0.5)",
              backdropFilter: "blur(3px)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                background: email.isPhishing
                  ? "linear-gradient(135deg, #ff5fb3, #ef4444)"
                  : "linear-gradient(135deg, #7eff97, #34d399)",
                color: "#0f1530",
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 20,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.06em",
                boxShadow: "0 0 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              {email.isPhishing ? "⚡ ZAPPED!" : "✓ SAFE"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fx.layer()}
    </ExerciseFrame>
  );
}

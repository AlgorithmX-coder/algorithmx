"use client";

/**
 * Sticker Unlock screen.
 *
 * Fires after the Mission Debrief at the end of Week 1. Three
 * stickers drop in sequence with a big confetti unlock + audio
 * stinger per sticker. The actual server-side awarding happens at
 * the parent renderer level (DynamicLesson calls awardStickers when
 * the lesson completes) - this component is the visual celebration.
 *
 * After the third sticker has landed, two CTAs surface: "Visit Cyber
 * HQ" (deep-link to /cyberhq) and "Continue" (advance to the badge
 * ceremony / completion screen).
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";

export interface StickerData {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface StickerUnlockProps {
  title: string;
  stickers: StickerData[];
  onComplete: () => void;
}

const DROP_STAGGER_MS = 900;

export default function StickerUnlock({
  title,
  stickers,
  onComplete,
}: StickerUnlockProps) {
  const router = useRouter();
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [droppedCount, setDroppedCount] = useState(0);
  const allDropped = droppedCount >= stickers.length;

  // Sequenced drop: each sticker fires the unlock juice (confetti +
  // sound). Staggered so they feel like distinct earnings rather
  // than a single firehose.
  useEffect(() => {
    if (allDropped) return;
    const id = window.setTimeout(
      () => {
        setDroppedCount((n) => n + 1);
        audio.unlock();
        if (intensity > 0) {
          fx.unlock({
            text: stickers[droppedCount]?.name.toUpperCase() ?? "STICKER!",
          });
        }
      },
      droppedCount === 0 ? 600 : DROP_STAGGER_MS
    );
    return () => window.clearTimeout(id);
  }, [droppedCount, allDropped, audio, fx, stickers, intensity]);

  const handleContinue = useCallback(() => {
    audio.tap();
    onComplete();
  }, [audio, onComplete]);

  const handleVisitHQ = useCallback(() => {
    audio.tap();
    router.push("/cyberhq");
  }, [audio, router]);

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={28}
      background="linear-gradient(180deg, #050a1a 0%, #1f1240 70%, #1a1f4d 100%)"
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#fde047",
            textTransform: "uppercase",
            fontWeight: 800,
            marginBottom: 8,
            textShadow: "0 0 12px rgba(253, 224, 71, 0.55)",
          }}
        >
          ✦ Cyber HQ
        </span>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 30,
            fontWeight: 900,
            background: "linear-gradient(135deg, #fde047, #ff7a59, #ff5fb3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            color: "#cbd5e1",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Your first stickers are on the way to Cyber HQ.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {stickers.map((s, i) => {
          const visible = i < droppedCount;
          return (
            <motion.div
              key={s.id}
              initial={
                intensity === 0
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.4, rotate: -18, y: -30 }
              }
              animate={
                visible
                  ? intensity === 0
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, rotate: 0, y: 0 }
                  : intensity === 0
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: -18, y: -30 }
              }
              transition={
                intensity === 0
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 320, damping: 14 }
              }
              style={{
                padding: "20px 18px 18px",
                borderRadius: 22,
                background: visible
                  ? "linear-gradient(180deg, rgba(255, 209, 88, 0.22), rgba(15, 21, 48, 0.85))"
                  : "rgba(15, 21, 48, 0.55)",
                border: visible
                  ? "2.5px solid rgba(253, 224, 71, 0.8)"
                  : "2px dashed rgba(148, 163, 184, 0.3)",
                boxShadow: visible
                  ? "0 14px 40px rgba(253, 224, 71, 0.28), 0 0 0 1px rgba(255, 209, 88, 0.4) inset"
                  : "none",
                textAlign: "center",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  lineHeight: 1,
                  marginBottom: 8,
                  filter: visible
                    ? "drop-shadow(0 0 24px rgba(253, 224, 71, 0.65))"
                    : undefined,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 17,
                  fontWeight: 900,
                  color: visible ? "#fff7e6" : "#64748b",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: visible ? "#cbd5e1" : "#475569",
                  lineHeight: 1.45,
                }}
              >
                {s.description}
              </div>
            </motion.div>
          );
        })}
      </div>

      {allDropped && (
        <motion.div
          initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <GameButton
            variant="secondary"
            size="lg"
            icon="🏠"
            onClick={handleVisitHQ}
          >
            Visit Cyber HQ
          </GameButton>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
            icon="→"
          >
            Continue
          </GameButton>
        </motion.div>
      )}

      {fx.layer()}
    </ExerciseFrame>
  );
}

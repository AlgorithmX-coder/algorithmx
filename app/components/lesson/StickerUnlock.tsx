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
        // Signature sticker-drop SFX (paper-flutter + chime) layered
        // over the existing unlock chime for that "this is a real
        // sticker landing" character.
        audio.signature("sticker-drop");
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
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 22,
          paddingBottom: 18,
        }}
      >
        {stickers.map((s, i) => {
          const visible = i < droppedCount;
          return (
            <div
              key={s.id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              {/* Light beam from above - fades in once the sticker lands */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -60,
                  left: "50%",
                  width: 130,
                  height: 100,
                  transform: "translateX(-50%)",
                  clipPath: "polygon(34% 0%, 66% 0%, 88% 100%, 12% 100%)",
                  background:
                    "linear-gradient(180deg, rgba(255,248,220,0.7) 0%, rgba(253,224,71,0.55) 45%, rgba(255,122,89,0.25) 80%, transparent 100%)",
                  filter: "blur(6px)",
                  opacity: visible ? 0.9 : 0,
                  transition: `opacity ${intensity === 0 ? 80 : 420}ms ease-out`,
                  mixBlendMode: "screen",
                  pointerEvents: "none",
                }}
              />
              <motion.div
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
                  position: "relative",
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
                {/* Halo behind the sticker icon when visible */}
                {visible && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 18,
                      left: "50%",
                      width: 90,
                      height: 90,
                      transform: "translateX(-50%)",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(253,224,71,0.5) 0%, transparent 70%)",
                      filter: "blur(8px)",
                      animation:
                        intensity > 0
                          ? "stickerHaloPulse 3.2s ease-in-out infinite"
                          : undefined,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "relative",
                    fontSize: 64,
                    lineHeight: 1,
                    marginBottom: 8,
                    filter: visible
                      ? "drop-shadow(0 0 24px rgba(253, 224, 71, 0.7))"
                      : undefined,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    position: "relative",
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
                    position: "relative",
                    fontSize: 12,
                    color: visible ? "#cbd5e1" : "#475569",
                    lineHeight: 1.45,
                  }}
                >
                  {s.description}
                </div>
              </motion.div>
              {/* Gold pedestal disc beneath each card */}
              <span
                aria-hidden
                style={{
                  alignSelf: "center",
                  marginTop: -6,
                  width: "70%",
                  height: 12,
                  borderRadius: "50%",
                  background: visible
                    ? "radial-gradient(ellipse at center, rgba(253,224,71,0.9) 0%, rgba(184,134,42,0.55) 55%, transparent 100%)"
                    : "radial-gradient(ellipse at center, rgba(148,163,184,0.35) 0%, transparent 100%)",
                  filter: "blur(2px)",
                  transition: "background 280ms ease",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ALL EARNED stamp - lands when the third sticker is on the shelf */}
      {allDropped && (
        <motion.div
          key="all-earned-stamp"
          initial={
            intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.5, rotate: -6 }
          }
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={
            intensity === 0
              ? { duration: 0.16 }
              : { type: "spring", stiffness: 360, damping: 13, delay: 0.1 }
          }
          style={{
            position: "relative",
            margin: "0 auto 18px",
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 8,
            background: "rgba(253,224,71,0.95)",
            border: "3px double rgba(15,21,48,0.7)",
            color: "#1a1033",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            boxShadow: "0 8px 18px rgba(253,224,71,0.5)",
            textAlign: "center",
          }}
        >
          ✓ All 3 stickers earned
        </motion.div>
      )}

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

      <style jsx global>{`
        @keyframes stickerHaloPulse {
          0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1);    }
          50%      { opacity: 0.95; transform: translateX(-50%) scale(1.18); }
        }
      `}</style>
    </ExerciseFrame>
  );
}

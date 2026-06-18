"use client";

/**
 * InfoScene - the premium "Learn" beat (one per concept).
 *
 * Replaces the old flat title+bullets card. A teaching moment should still
 * feel cinematic (the "nothing flat" rule): cosmic backdrop with drifting
 * glow orbs, a gradient title, Adam/Layla narration (read aloud), and the
 * key points as staggered, glowing "rule chips" - not a plain list.
 *
 * Pure presentation + an onNext callback; all copy comes from week data.
 * Honours comfort mode via useMotionIntensity.
 */

import { useMemo } from "react";
import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";

export interface InfoSceneProps {
  title: string;
  content: string;
  bullets?: string[];
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onNext: () => void;
}

const ACCENTS = ["#00e5ff", "#7eff97", "#ffd158", "#ff5fb3", "#7c5cff"];

export default function InfoScene({
  title,
  content,
  bullets,
  narration,
  onNext,
}: InfoSceneProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: [6, 80, 26, 66, 48][i],
        y: [16, 22, 72, 60, 40][i],
        s: [240, 190, 280, 210, 160][i],
        c: ACCENTS[i % ACCENTS.length],
        d: 10 + i * 2,
      })),
    []
  );

  return (
    <ExerciseFrame
      maxWidth={920}
      padding={30}
      background="radial-gradient(120% 100% at 50% 0%, #131a3e 0%, #0c1230 48%, #060a1c 100%)"
      style={{ color: "#fff7e6", position: "relative", overflow: "hidden" }}
    >
      {/* drifting glow orbs - depth so the lesson never reads flat */}
      {!reduce &&
        orbs.map((o, i) => (
          <motion.div
            key={i}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55, x: [0, 14, -10, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.s,
              height: o.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}3a 0%, transparent 70%)`,
              filter: "blur(10px)",
              pointerEvents: "none",
            }}
          />
        ))}

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* LEARN badge */}
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={reduce ? false : { y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              borderRadius: 999,
              border: "1px solid rgba(125,240,255,0.4)",
              background: "rgba(0,229,255,0.08)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#7df0ff",
            }}
          >
            ◇ Learn ◇
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          initial={reduce ? false : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{
            textAlign: "center",
            margin: "16px auto 14px",
            maxWidth: 680,
            fontSize: "clamp(1.6rem, 3.4vw, 2.2rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            background: "linear-gradient(135deg, #7df0ff, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </motion.h2>

        {/* Narration (Adam / Layla, read aloud) */}
        {narration && (
          <InfoNarration
            lines={narration.lines}
            speaker={narration.speaker ?? "adam"}
          />
        )}

        {/* Content */}
        <p
          style={{
            color: "#cbd5e1",
            fontSize: 16,
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 620,
            margin: "14px auto 22px",
          }}
        >
          {content}
        </p>

        {/* Rule chips */}
        {bullets && (
          <div
            style={{
              display: "grid",
              gap: 10,
              maxWidth: 560,
              margin: "0 auto 24px",
            }}
          >
            {bullets.map((b, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderRadius: 14,
                    background: `${accent}12`,
                    border: `1px solid ${accent}55`,
                    boxShadow: `0 8px 22px -16px ${accent}`,
                    color: "#eef2ff",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: accent,
                      color: "#06080f",
                      fontWeight: 900,
                      fontSize: 14,
                      boxShadow: `0 0 14px -2px ${accent}`,
                    }}
                  >
                    ✓
                  </span>
                  <span>{b}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <GameButton variant="primary" size="lg" onClick={onNext}>
            Next →
          </GameButton>
        </div>
      </div>
    </ExerciseFrame>
  );
}

"use client";

/**
 * RaccoonThreatScene — the "Spot the Danger" beat of the Learn Loop.
 *
 * Right after a skill is taught, the Hacker Raccoon appears and reveals the
 * trick he's about to try — in plain kid words — so the child knows exactly
 * what they're defending against before the game (the "why" that turns the
 * game into a mission). Sarah frames it aloud and names the job. One verb to
 * move on: "I'm ready!", and that button is never disabled (a child always
 * has a way forward). Comfortable motion only, for ages 6–9.
 */

import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";

export interface RaccoonThreatSceneProps {
  raccoonLine: string;
  title?: string;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onNext: () => void;
}

const VIOLET = "#c084fc";

export default function RaccoonThreatScene({
  raccoonLine,
  title = "The Raccoon's Trick",
  narration,
  onNext,
}: RaccoonThreatSceneProps) {
  const reduce = useMotionIntensity() < 1;
  return (
    <ExerciseFrame
      maxWidth={780}
      padding={0}
      background="radial-gradient(120% 90% at 50% 0%, #241a44 0%, #140f2e 45%, #070510 100%)"
      style={{ color: "#f3ecff", position: "relative", overflow: "hidden" }}
    >
      {/* soft danger glow behind the villain */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute", left: "50%", top: "-8%", width: 460, height: 320,
            transform: "translateX(-50%)", borderRadius: "50%",
            background: `radial-gradient(circle, ${VIOLET}2e 0%, transparent 70%)`, filter: "blur(10px)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2, padding: "28px 24px 26px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800,
            letterSpacing: "0.24em", textTransform: "uppercase", color: VIOLET, marginBottom: 6,
          }}
        >
          ◇ Spot the Danger ◇
        </div>
        <h2 style={{ margin: "0 0 18px", fontSize: "clamp(1.4rem, 3.2vw, 2rem)", fontWeight: 900, color: "#fff" }}>
          {title}
        </h2>

        {/* The Raccoon reveals his trick */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 16, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 18,
          }}
        >
          <motion.img
            src="/game/characters/raccoon-taunt.png"
            alt="The Hacker Raccoon"
            initial={reduce ? false : { scale: 0.85, opacity: 0, rotate: -4 }}
            animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0, y: [0, -6, 0] }}
            transition={
              reduce
                ? { duration: 0.3 }
                : { scale: { type: "spring", stiffness: 200, damping: 16 }, y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }
            }
            style={{ height: 132, flexShrink: 0, objectFit: "contain", filter: `drop-shadow(0 10px 20px ${VIOLET}66)` }}
          />
          <motion.div
            initial={reduce ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
            style={{
              position: "relative", maxWidth: 440, padding: "16px 22px", borderRadius: 18,
              background: `${VIOLET}1c`, border: `1px solid ${VIOLET}70`, color: "#f0e4ff",
              fontStyle: "italic", fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)", fontWeight: 650, lineHeight: 1.4,
            }}
          >
            &ldquo;{raccoonLine}&rdquo;
          </motion.div>
        </div>

        {/* Sarah frames the danger + names the job, read aloud */}
        {narration && narration.lines.length > 0 && (
          <div style={{ maxWidth: 520, margin: "0 auto 20px", textAlign: "left" }}>
            <InfoNarration lines={narration.lines} speaker={narration.speaker ?? "layla"} />
          </div>
        )}

        <GameButton variant="primary" size="lg" onClick={onNext}>
          I&apos;m ready! →
        </GameButton>
      </div>
    </ExerciseFrame>
  );
}

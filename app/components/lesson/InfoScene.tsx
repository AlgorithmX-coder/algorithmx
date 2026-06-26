"use client";

/**
 * InfoScene - the premium "Learn" beat (one per concept).
 *
 * "Command-center" template aiming close to the reference art: a gold
 * lock-shield emblem with sparkles, an ornate gold-rimmed console frame, a
 * warm lit background, the Adam/Layla narration, glossy 3D colour rows (each
 * with a topic icon), and a big gold button. Rich + premium, but with NO
 * rapid motion/flashing so it stays comfortable for 6-9 yr olds. Honours
 * comfort mode. An illustrated background can drop in behind via `background`.
 */

import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface InfoSceneProps {
  title: string;
  content: string;
  bullets?: string[];
  /** Optional per-bullet topic icon (emoji) shown in a badge on each row. */
  bulletIcons?: string[];
  /** Header emblem glyph (defaults to the lock brand mark). */
  emblem?: string;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onNext: () => void;
}

const ROW_COLOURS = ["#3a93f5", "#34bd6c", "#eaa53c", "#df72c0"];
// Static decorative star dots (no twinkle) - depth without motion.
const STARS = [
  { x: "8%", y: "14%", s: 3 }, { x: "22%", y: "8%", s: 2 },
  { x: "70%", y: "10%", s: 2 }, { x: "88%", y: "20%", s: 3 },
  { x: "12%", y: "62%", s: 2 }, { x: "92%", y: "58%", s: 2 },
  { x: "84%", y: "82%", s: 3 }, { x: "16%", y: "86%", s: 2 },
];

export default function InfoScene({
  title,
  content,
  bullets,
  bulletIcons,
  emblem = "🔒",
  narration,
  onNext,
}: InfoSceneProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  return (
    <ExerciseFrame
      maxWidth={880}
      padding={0}
      background="linear-gradient(180deg, rgba(18,24,58,0.86) 0%, rgba(7,11,30,0.94) 100%), url(/cyberheroes/scenes/learn-command-center.png) center / cover no-repeat"
      style={{ color: "#fff7e6", position: "relative", overflow: "hidden" }}
    >
      {/* Warm lit glow at top + soft side glows + vignette */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "-6%", width: 460, height: 320, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,206,120,0.16) 0%, transparent 70%)", filter: "blur(8px)" }} />
        <div style={{ position: "absolute", left: "6%", top: "30%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, #2a3f7e 0%, transparent 70%)", opacity: 0.5, filter: "blur(18px)" }} />
        <div style={{ position: "absolute", right: "4%", top: "24%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, #3a2a6e 0%, transparent 70%)", opacity: 0.5, filter: "blur(18px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(4,6,18,0.55) 100%)" }} />
        {STARS.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: "50%", background: "#cfe0ff", opacity: 0.5, boxShadow: "0 0 6px rgba(207,224,255,0.7)" }} />
        ))}
      </div>

      {/* Ornate gold-rimmed console frame */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          margin: 18,
          padding: "26px 26px 28px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(18,24,58,0.72) 0%, rgba(10,14,36,0.82) 100%)",
          // gold rim via layered ring + soft outer glow + inner top highlight
          boxShadow:
            "0 0 0 1px rgba(255,212,120,0.55), 0 0 0 4px rgba(120,92,30,0.35), 0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,233,170,0.28), inset 0 0 36px rgba(60,90,170,0.14)",
          backdropFilter: "blur(2px)",
        }}
      >
        {/* corner accent brackets */}
        {[
          { top: 8, left: 8 }, { top: 8, right: 8 },
          { bottom: 8, left: 8 }, { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <span key={i} aria-hidden style={{ position: "absolute", ...pos, width: 12, height: 12, borderRadius: 3, background: "radial-gradient(circle at 35% 35%, #ffe7a8, #b8861f)", boxShadow: "0 0 8px rgba(255,206,90,0.5)" }} />
        ))}

        {/* Emblem + sparkles + LEARN kicker + title */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span aria-hidden style={{ color: "#ffe7a8", fontSize: 14, opacity: 0.85, textShadow: "0 0 10px rgba(255,206,90,0.6)" }}>✦</span>
            <motion.div
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{
                width: 66, height: 66, borderRadius: "50%",
                display: "grid", placeItems: "center", fontSize: 30,
                background: "radial-gradient(circle at 50% 32%, #46508a 0%, #1a2150 70%)",
                border: "2px solid rgba(255,206,90,0.75)",
                boxShadow: "0 6px 20px -6px rgba(255,206,90,0.5), inset 0 2px 6px rgba(255,233,170,0.35), inset 0 -6px 12px rgba(0,0,0,0.4)",
              }}
            >
              <PixIcon emoji={emblem} size={46} />
            </motion.div>
            <span aria-hidden style={{ color: "#ffe7a8", fontSize: 14, opacity: 0.85, textShadow: "0 0 10px rgba(255,206,90,0.6)" }}>✦</span>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: "#9fe9ff", margin: "12px 0 6px" }}>
            ◇ Learn ◇
          </div>
          <h2 style={{
            margin: 0, maxWidth: 680, marginInline: "auto",
            fontSize: "clamp(1.6rem, 3.4vw, 2.2rem)", fontWeight: 900, lineHeight: 1.12,
            background: "linear-gradient(180deg, #fff4cf 0%, #ffd86b 55%, #f3b13a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 2px 6px rgba(180,120,20,0.45))",
          }}>
            {title}
          </h2>
        </div>

        {/* Narration */}
        {narration && (
          <InfoNarration lines={narration.lines} speaker={narration.speaker ?? "adam"} />
        )}

        {/* Content fallback (only when no narration) */}
        {!narration && content && (
          <p style={{ color: "#cbd5e1", fontSize: 16, lineHeight: 1.65, textAlign: "center", maxWidth: 620, margin: "14px auto 22px" }}>
            {content}
          </p>
        )}

        {/* Glossy 3D colour rows with a check + topic-icon badge */}
        {bullets && (
          <div style={{ display: "grid", gap: 11, maxWidth: 600, margin: "6px auto 22px" }}>
            {bullets.map((b, i) => {
              const accent = ROW_COLOURS[i % ROW_COLOURS.length];
              const icon = bulletIcons?.[i];
              return (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : 0.14 + i * 0.07, duration: 0.3, ease: "easeOut" }}
                  style={{
                    display: "flex", alignItems: "center", gap: 13,
                    padding: "12px 14px 12px 13px", borderRadius: 999,
                    background: `linear-gradient(180deg, ${accent}42 0%, ${accent}1c 55%, ${accent}12 100%)`,
                    border: `1px solid ${accent}66`,
                    boxShadow: `inset 0 1px 0 ${accent}88, inset 0 -7px 14px -8px rgba(0,0,0,0.55), 0 6px 16px -10px ${accent}aa`,
                    color: "#f2f6ff", fontSize: 15, fontWeight: 650, lineHeight: 1.3,
                  }}
                >
                  <span aria-hidden style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: `radial-gradient(circle at 35% 30%, ${accent}, ${accent}cc)`,
                    color: "#06080f", fontWeight: 900, fontSize: 15,
                    boxShadow: `inset 0 1px 2px rgba(255,255,255,0.6), 0 0 12px -2px ${accent}`,
                  }}>✓</span>
                  <span style={{ flex: 1 }}>{b}</span>
                  {icon && (
                    <span aria-hidden style={{
                      flexShrink: 0, width: 34, height: 34, borderRadius: 11,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      background: `linear-gradient(180deg, ${accent}3a, ${accent}14)`,
                      border: `1px solid ${accent}66`,
                      boxShadow: `inset 0 1px 0 ${accent}77, 0 0 10px -3px ${accent}`,
                    }}><PixIcon emoji={icon} size={26} /></span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 4 }}>
          <GameButton variant="primary" size="lg" onClick={onNext}>
            Next →
          </GameButton>
        </div>
      </div>
    </ExerciseFrame>
  );
}

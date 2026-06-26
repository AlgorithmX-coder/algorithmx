"use client";

/**
 * ConceptRecap — the checkpoint that closes each Learn→Play→Prove loop.
 *
 * The week used to run as one long flick-through; this beat chunks it into
 * clear "I learned a thing" chapters. It consolidates the win: a celebratory
 * header, a PLAIN one-line takeaway of what was just mastered, a "here's
 * what's next" pointer, and a progress track (● ● ○ ○ ○) so kids feel the
 * arc. Narrated by Sarah (via the shared `narration` block) so a 6–9 year
 * old hears the takeaway, not just reads it.
 *
 * Same cosmic command-center family as the Learn screens, but with its own
 * celebratory identity (green "complete" accent, burst emblem) so it reads
 * as a reward checkpoint rather than another teaching page.
 */

import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface ConceptRecapProps {
  concept: number;
  total: number;
  learned: string;
  next?: string;
  emblem?: string;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onContinue: () => void;
}

const GREEN = "#7eff97";
const CYAN = "#7df0ff";

export default function ConceptRecap({
  concept,
  total,
  learned,
  next,
  emblem = "✅",
  narration,
  onContinue,
}: ConceptRecapProps) {
  const isFinale = concept >= total;
  // Strict reduced-motion: skip the entrance springs (render at rest).
  const reduce = useMotionIntensity() === 0;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        borderRadius: 28,
        overflow: "hidden",
        padding: "30px 26px 26px",
        background:
          "radial-gradient(120% 90% at 50% 0%, #14323a 0%, #0f1530 42%, #060a1c 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(8,10,22,0.6), 0 0 0 1px rgba(126,255,151,0.22) inset",
        color: "#eaf2ff",
        textAlign: "center",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* celebratory glow behind the emblem */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(126,255,151,0.22) 0%, transparent 70%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* kicker */}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: "0.24em",
          fontWeight: 800,
          textTransform: "uppercase",
          color: GREEN,
        }}
      >
        ◇ Checkpoint · Concept {concept} of {total} ◇
      </div>

      {/* burst emblem */}
      <motion.div
        initial={reduce ? false : { scale: 0.5, rotate: -14, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.05 }}
        style={{
          position: "relative",
          margin: "12px auto 6px",
          width: 86,
          height: 86,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 42,
          background:
            "radial-gradient(circle at 50% 36%, rgba(126,255,151,0.25), rgba(15,21,48,0.92))",
          border: `2px solid ${GREEN}`,
          boxShadow: `0 0 26px rgba(126,255,151,0.5), inset 0 0 16px rgba(126,255,151,0.22)`,
        }}
      >
        <PixIcon emoji={emblem} size={56} />
      </motion.div>

      {/* headline */}
      <motion.h2
        initial={reduce ? false : { y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          margin: "4px 0 14px",
          fontSize: "clamp(1.5rem, 3.4vw, 2rem)",
          fontWeight: 900,
          color: "#fff",
        }}
      >
        {isFinale ? (
          <>
            All concepts mastered!{" "}
            <PixIcon emoji="🎉" size={28} style={{ verticalAlign: "-4px" }} />
          </>
        ) : (
          "Nice work, Cyber Hero!"
        )}
      </motion.h2>

      {/* the takeaway — the hero of the screen */}
      <motion.div
        initial={reduce ? false : { scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.22 }}
        style={{
          position: "relative",
          margin: "0 auto 16px",
          maxWidth: 560,
          padding: "16px 20px",
          borderRadius: 18,
          background: "rgba(126,255,151,0.10)",
          border: `1px solid rgba(126,255,151,0.45)`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            fontWeight: 800,
            textTransform: "uppercase",
            color: GREEN,
            marginBottom: 6,
          }}
        >
          You just learned
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.35, color: "#fff" }}>
          {learned}
        </div>
      </motion.div>

      {/* what's next */}
      {next && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            margin: "0 auto 18px",
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(0,229,255,0.08)",
            border: `1px solid rgba(125,240,255,0.4)`,
            color: CYAN,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <PixIcon emoji="🎯" size={18} />
          <span>
            Up next: <strong style={{ color: "#fff" }}>{next}</strong>
          </span>
        </motion.div>
      )}

      {/* narration (Sarah reads the takeaway aloud) */}
      {narration && narration.lines.length > 0 && (
        <div style={{ maxWidth: 520, margin: "0 auto 8px", textAlign: "left" }}>
          <InfoNarration lines={narration.lines} speaker={narration.speaker ?? "layla"} />
        </div>
      )}

      {/* progress track */}
      <div
        style={{
          display: "flex",
          gap: 9,
          justifyContent: "center",
          alignItems: "center",
          margin: "8px 0 18px",
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const done = i < concept;
          return (
            <span
              key={i}
              aria-hidden
              style={{
                width: done ? 13 : 10,
                height: done ? 13 : 10,
                borderRadius: "50%",
                background: done
                  ? "linear-gradient(135deg, #7eff97, #00e5ff)"
                  : "rgba(125,240,255,0.18)",
                boxShadow: done ? "0 0 12px rgba(126,255,151,0.7)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>

      <GameButton variant="primary" size="lg" onClick={onContinue}>
        {isFinale ? "I'm ready →" : "Keep going →"}
      </GameButton>
    </div>
  );
}

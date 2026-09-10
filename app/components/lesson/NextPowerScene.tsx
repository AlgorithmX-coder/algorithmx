"use client";

/**
 * NextPowerScene — the "chapter card" that sits BETWEEN a concept's Complete
 * recap and the next concept's Learn screen.
 *
 * Without it, a "Concept N Complete" recap hands straight to another Learn
 * card, which reads like an exercise is coming (owner feedback). This beat is a
 * clear scene break: it names the NEXT power, teases it in one line, Sarah says
 * one short line (no-skip), then a gated "Let's learn it →" leads into the
 * Learn. Sibling of ConceptRecap (same command-center family, theme accent),
 * but a forward/anticipation identity rather than a reward checkpoint.
 *
 * Reusable across all 20 weeks: one card per concept seam (after concepts
 * 1..total-1). `recordedOnly` narration keeps un-recorded weeks silent (and
 * still releases the button gate) so the rollout is prod-safe.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";

export interface NextPowerSceneProps {
  /** The upcoming power's number (e.g. 2) and how many in the week. */
  power: number;
  total: number;
  /** The next concept's title (e.g. "Long Is Strong"). */
  title: string;
  /** One-line tease of the next power. */
  tease: string;
  /** Emblem glyph for the next power (defaults to a spark). */
  emblem?: string;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onContinue: () => void;
}

export default function NextPowerScene({
  power,
  total,
  title,
  tease,
  emblem = "⚡",
  narration,
  onContinue,
}: NextPowerSceneProps) {
  const reduce = useMotionIntensity() === 0;
  const themeAccent = useLessonTheme()?.accent;
  const ACCENT = themeAccent ?? "#ffce78";

  // No-skip gate: the button appears only once Sarah's line finishes (the
  // InfoNarration click-guard blocks the screen while she speaks). A generous
  // safety release means it can never stick if onDone never fires.
  const paced = !!narration && narration.lines.length > 0;
  const [narrationDone, setNarrationDone] = useState(false);
  const canStart = !paced || narrationDone;

  useEffect(() => {
    if (!paced) return;
    const maxMs = Math.min(45000, 6000 + (narration?.lines.length ?? 1) * 4500);
    const id = window.setTimeout(() => setNarrationDone(true), maxMs);
    return () => window.clearTimeout(id);
  }, [paced, narration?.lines.length]);

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
          "radial-gradient(120% 90% at 50% 0%, #23305e 0%, #0f1530 44%, #060a1c 100%)",
        boxShadow: `0 40px 90px -30px rgba(8,10,22,0.6), 0 0 0 1px ${ACCENT}38 inset`,
        color: "#eaf2ff",
        textAlign: "center",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* anticipation glow behind the emblem */}
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
          background: `radial-gradient(circle, ${ACCENT}33 0%, transparent 70%)`,
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
          color: ACCENT,
        }}
      >
        ◇ Next Power ◇
      </div>

      {/* power number pill */}
      <motion.div
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.05 }}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          margin: "12px auto 8px",
          padding: "6px 16px",
          borderRadius: 999,
          background: `${ACCENT}1f`,
          border: `1px solid ${ACCENT}80`,
          color: ACCENT,
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: "0.06em",
        }}
      >
        <PixIcon emoji={emblem} size={22} />
        Power {power} of {total}
      </motion.div>

      {/* title */}
      <motion.h2
        initial={reduce ? false : { y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          margin: "4px 0 10px",
          fontSize: "clamp(1.6rem, 3.6vw, 2.1rem)",
          fontWeight: 900,
          color: "#fff",
        }}
      >
        {title}
      </motion.h2>

      {/* tease */}
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        style={{
          margin: "0 auto 18px",
          maxWidth: 520,
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#cbd5e1",
        }}
      >
        {tease}
      </motion.p>

      {/* narration (Sarah teases the next power aloud) */}
      {paced && (
        <div style={{ maxWidth: 520, margin: "0 auto 10px", textAlign: "left" }}>
          <InfoNarration
            lines={narration!.lines}
            speaker={narration!.speaker ?? "adam"}
            accent={ACCENT}
            recordedOnly
            onDone={() => setNarrationDone(true)}
          />
        </div>
      )}

      {canStart ? (
        <GameButton variant="primary" size="lg" onClick={onContinue}>
          Let&apos;s learn it →
        </GameButton>
      ) : (
        <div style={{ height: 8 }} aria-hidden />
      )}
    </div>
  );
}

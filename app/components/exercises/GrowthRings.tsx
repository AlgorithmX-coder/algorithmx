"use client";

/**
 * GrowthRings — the tree-ring REVEAL drill (Week 17).
 *
 * A big tree slice with concentric rings, youngest at the centre. Rings
 * light up ONE AT A TIME from the middle outward: tap the glowing ring
 * and its story card slides in below (what grows in that ring, and why
 * the 13+ sign waits at the edge). Rings ahead of the glow just wobble —
 * no wrong answers by design, like every REVEAL beat.
 *
 * The enforced centre-outward order is the point (you grow through the
 * rings in order — no skipping), and is what separates this from
 * RevealBoard's any-order card flips.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface GrowthRing {
  id: string;
  /** Short ring label, e.g. "NOW · 6-9". */
  label: string;
  /** Emoji rendered via PixIcon on the ring's story card. */
  icon: string;
  /** Story card headline. */
  title: string;
  /** Story card body — what grows in this ring. */
  text: string;
}

export interface GrowthRingsProps {
  /** Rings in centre-outward order (4 recommended). */
  rings: GrowthRing[];
  /** Copy overrides (defaults keep the W17 tree skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Label at the very centre of the slice. */
  centerLabel?: string;
  revealToast?: string;
  /** Line shown once every ring is lit. */
  finale?: string;
  completeTitle?: string;
  completeLine?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const RING_COLOURS = ["#ffd158", "#7eff97", "#7df0ff", "#c084fc", "#ff5fb3"];

export default function GrowthRings({
  rings,
  introTitle,
  introSubtitle,
  introIcon,
  centerLabel,
  revealToast,
  finale,
  completeTitle,
  completeLine,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onAnswered,
}: GrowthRingsProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [litCount, setLitCount] = useState(0);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = litCount >= rings.length;
  const current = rings[litCount];

  const tap = (idx: number) => {
    if (showIntro || finished) return;
    setHasInteracted(true);
    const ring = rings[idx];
    if (idx !== litCount) {
      // Rings ahead (or already lit) just wobble — growth goes in order.
      audio.hover();
      setWobbleId(ring.id);
      window.setTimeout(() => setWobbleId(null), 450);
      return;
    }
    audio.correct();
    fx.correct({ xp: 25, text: revealToast ?? "RING GROWN!" });
    onCorrect?.();
    onAnswered?.({
      questionKey: `ring-${ring.id}`,
      selectedIndex: idx,
      correctIndex: idx,
      wasCorrect: true,
    });
    setLitCount((n) => n + 1);
  };

  // Concentric slice geometry: outermost ring drawn first, centre on top.
  const SIZE = 320;
  const step = SIZE / (rings.length * 2 + 1.6);

  return (
    <ExerciseFrame maxWidth={820} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Growth Rings"}
          subtitle={introSubtitle ?? "A tree slice of YOU. Tap the glowing ring, middle first, and watch what grows before you reach the 13+ sign."}
          icon={introIcon ?? "🔰"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", alignItems: "center" }}>
        {/* The tree slice */}
        <div style={{ position: "relative", width: SIZE, height: SIZE, flex: "0 0 auto" }}>
          {rings.map((ring, i) => {
            // ring i occupies the (i+1)-th band from the centre
            const diameter = SIZE - (rings.length - 1 - i) * step * 2;
            const lit = i < litCount;
            const isNext = i === litCount;
            return (
              <motion.button
                key={ring.id}
                type="button"
                onClick={() => tap(i)}
                onPointerEnter={() => audio.hover()}
                animate={
                  wobbleId === ring.id
                    ? { rotate: [0, -2.5, 2.5, 0] }
                    : isNext && !reduce
                      ? { scale: [1, 1.015, 1] }
                      : {}
                }
                transition={
                  wobbleId === ring.id
                    ? { duration: 0.4 }
                    : isNext && !reduce
                      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                }
                style={{
                  position: "absolute",
                  // computed offsets, NOT translate(-50%,-50%): framer-motion's
                  // scale/rotate animations replace the transform wholesale,
                  // which would drop the centering mid-pulse
                  left: (SIZE - diameter) / 2,
                  top: (SIZE - diameter) / 2,
                  width: diameter,
                  height: diameter,
                  // innermost ring must paint (and receive taps) on top
                  zIndex: rings.length - i,
                  borderRadius: "50%",
                  border: lit
                    ? `3px solid ${RING_COLOURS[i % RING_COLOURS.length]}`
                    : isNext
                      ? "3px dashed #7df0ff"
                      : "2.5px dashed rgba(125,140,201,0.4)",
                  background: lit
                    ? `radial-gradient(circle, transparent 55%, ${RING_COLOURS[i % RING_COLOURS.length]}26 100%)`
                    : "rgba(46,32,72,0.35)",
                  boxShadow: lit ? `0 0 24px -6px ${RING_COLOURS[i % RING_COLOURS.length]}` : "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  touchAction: "manipulation",
                }}
                aria-label={ring.label}
              >
                {/* ring label pinned to the top band of its circle */}
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10.5,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    color: lit ? RING_COLOURS[i % RING_COLOURS.length] : isNext ? "#7df0ff" : "rgba(125,140,201,0.75)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {ring.label}
                </span>
              </motion.button>
            );
          })}
          {/* Centre heartwood */}
          <div
            style={{
              position: "absolute",
              left: (SIZE - step * 1.6) / 2,
              top: (SIZE - step * 1.6) / 2,
              width: step * 1.6,
              height: step * 1.6,
              zIndex: rings.length + 1,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #ffe9ad, #e8a413)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 900,
              color: "#3a2a08",
              letterSpacing: "0.06em",
              boxShadow: "0 0 18px rgba(255,209,88,0.65)",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            {centerLabel ?? "YOU"}
          </div>
        </div>

        {/* Story card for the last-lit ring */}
        <div style={{ flex: "1 1 280px", maxWidth: 400, minHeight: 170 }}>
          <AnimatePresence mode="wait">
            {litCount > 0 && (
              <motion.div
                key={rings[litCount - 1].id}
                initial={reduce ? false : { y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: -24, opacity: 0 }}
                style={{
                  padding: "16px 18px",
                  borderRadius: 16,
                  background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                  border: `2px solid ${RING_COLOURS[(litCount - 1) % RING_COLOURS.length]}66`,
                  color: "#eaf9ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <PixIcon emoji={rings[litCount - 1].icon} size={30} />
                  <span style={{ fontSize: 15.5, fontWeight: 900, color: RING_COLOURS[(litCount - 1) % RING_COLOURS.length] }}>
                    {rings[litCount - 1].title}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: "#dff6ff" }}>
                  {rings[litCount - 1].text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {litCount === 0 && (
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                border: "2px dashed rgba(125,140,201,0.4)",
                color: "#7d8cc9",
                fontSize: 13.5,
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              Tap the glowing middle ring to start growing…
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
        {current ? `RING ${litCount + 1} OF ${rings.length}` : (finale ?? "EVERY RING GROWN!")}
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "Every ring is glowing!"}
          stars={3}
          statLines={[
            `${rings.length}/${rings.length} rings grown`,
            completeLine ?? (finale ?? "The 13+ sign isn't a wall - it's a promise you grow towards."),
          ]}
          onContinue={() => onComplete(rings.length)}
        />
      )}
    </ExerciseFrame>
  );
}

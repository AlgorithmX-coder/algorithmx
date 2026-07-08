"use client";

/**
 * SnowballChase — the deliberately-uncatchable ARCADE demo (Week 12).
 *
 * Copies of a post roll onto the snowfield as snowballs; the child sweeps
 * them with taps (satisfying bursts, no lose state) while the ROLLED AWAY
 * counter climbs faster than any broom can work. When the timer runs out
 * the complete beat names the point out loud: nobody can sweep every
 * copy — that's why heroes think BEFORE they roll.
 *
 * There are no wrong answers here; it's a demonstration arcade. The
 * futility IS the lesson, so the child always earns full stars.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import PixIcon from "@/app/components/lesson/PixIcon";

interface Ball {
  id: number;
  /** Position as % of the field. */
  x: number;
  y: number;
  size: number;
}

export interface SnowballChaseProps {
  /** Copy overrides (defaults keep the W12 snowfield skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** PixIcon key stamped on each rolling copy. */
  ballIcon?: string;
  sweptLabel?: string;
  rolledLabel?: string;
  /** Mid-game caption beats (shown in order as time passes). */
  captions?: [string, string, string];
  completeTitle?: string;
  completeLine?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
}

const DURATION_MS = 34000;
const REDUCED_DURATION_MS = 20000;
const ROLL_AWAY_MS = 2700;
const MAX_ON_FIELD = 8;

export default function SnowballChase({
  introTitle,
  introSubtitle,
  introIcon,
  ballIcon,
  sweptLabel,
  rolledLabel,
  captions,
  completeTitle,
  completeLine,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
}: SnowballChaseProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [swept, setSwept] = useState(0);
  const [rolled, setRolled] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const nextId = useRef(1);
  const duration = reduce ? REDUCED_DURATION_MS : DURATION_MS;

  // Spawn + clock loop. Spawn accelerates over time; untapped balls roll
  // away on their own and feed the futility counter.
  useEffect(() => {
    if (showIntro || finished) return;
    const start = performance.now();
    let spawnAt = 0;
    const tick = window.setInterval(() => {
      const t = performance.now() - start;
      setElapsed(t);
      if (t >= duration) {
        setFinished(true);
        return;
      }
      if (t >= spawnAt) {
        // 1 ball early on, pairs later - always faster than the broom.
        const phase = t / duration;
        const batch = phase > 0.45 ? 2 : 1;
        const gap = Math.max(420, 1100 - t / 40);
        spawnAt = t + gap;
        setBalls((prev) => {
          const room = Math.max(0, MAX_ON_FIELD - prev.length);
          const add: Ball[] = [];
          for (let i = 0; i < Math.min(batch, room); i++) {
            add.push({
              id: nextId.current++,
              x: 6 + ((nextId.current * 37) % 84),
              y: 12 + ((nextId.current * 53) % 72),
              size: 56 + ((nextId.current * 29) % 26),
            });
          }
          if (add.length < batch) setRolled((r) => r + (batch - add.length));
          return [...prev, ...add];
        });
      }
    }, 120);
    return () => window.clearInterval(tick);
  }, [showIntro, finished, duration]);

  // Balls that outstay their welcome roll off over the hill.
  useEffect(() => {
    if (showIntro || finished || balls.length === 0) return;
    const oldest = balls[0];
    const timer = window.setTimeout(() => {
      setBalls((prev) => prev.filter((b) => b.id !== oldest.id));
      setRolled((r) => r + 1);
    }, ROLL_AWAY_MS);
    return () => window.clearTimeout(timer);
  }, [balls, showIntro, finished]);

  const sweep = (ball: Ball) => {
    if (finished) return;
    setHasInteracted(true);
    audio.correct();
    onCorrect?.();
    setBalls((prev) => prev.filter((b) => b.id !== ball.id));
    setSwept((n) => {
      const v = n + 1;
      if (v === 5) fx.toast({ text: "GREAT SWEEPING!", tone: "bonus" });
      return v;
    });
  };

  const phase = elapsed / duration;
  const caption =
    phase > 0.72
      ? (captions?.[2] ?? "They just keep coming...!")
      : phase > 0.4
        ? (captions?.[1] ?? "They're MULTIPLYING!")
        : (captions?.[0] ?? "Sweep the copies before they roll away!");

  // The hill always wins - the completion owns the honesty.
  const rolledFinal = rolled + Math.max(12, swept * 3);

  return (
    <ExerciseFrame maxWidth={880} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Snowball Chase"}
          subtitle={introSubtitle ?? "Copies of the post are rolling everywhere. Grab the broom - sweep as many as you can!"}
          icon={introIcon ?? "🌀"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* HUD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 720, margin: "0 auto 10px" }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#7eff97" }}>
          {(sweptLabel ?? "SWEPT")} {swept}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: "#dff6ff", textAlign: "center", flex: 1, padding: "0 10px" }}>
          {caption}
        </span>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#ff9bcb" }}>
          {(rolledLabel ?? "ROLLED AWAY")} {rolled}
        </span>
      </div>

      {/* The snowfield */}
      <div
        style={{
          position: "relative",
          maxWidth: 720,
          margin: "0 auto",
          height: 400,
          borderRadius: 18,
          overflow: "hidden",
          background: "linear-gradient(180deg, #1c2b52 0%, #33507e 55%, #dfeafc 56%, #f6faff 100%)",
          border: "2px solid rgba(125,240,255,0.35)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        {/* hill line */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "48%",
            left: 0,
            right: 0,
            textAlign: "right",
            paddingRight: 14,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#33507e",
          }}
        >
          OVER THE HILL →
        </div>

        <AnimatePresence>
          {balls.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => sweep(b)}
              initial={reduce ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                marginLeft: -b.size / 2,
                marginTop: -b.size / 2,
                borderRadius: "50%",
                border: "3px solid #c9d8ee",
                background: "radial-gradient(circle at 35% 30%, #ffffff, #dbe7f8 70%, #b9cbe8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 10px 22px -10px rgba(20,40,80,0.6)",
                touchAction: "manipulation",
              }}
              aria-label="Sweep this copy"
            >
              <PixIcon emoji={ballIcon ?? "✉️"} size={Math.round(b.size * 0.45)} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* progress bar */}
        <div aria-hidden style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${Math.min(100, phase * 100)}%`, background: "linear-gradient(90deg, #00e5ff, #7eff97)" }} />
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "The broom is out of puff!"}
          stars={3}
          statLines={[
            `You swept ${swept} - but ${rolledFinal} rolled over the hill`,
            completeLine ?? "Nobody can sweep every copy - heroes think BEFORE they roll.",
          ]}
          onContinue={() => onComplete(swept)}
        />
      )}
    </ExerciseFrame>
  );
}

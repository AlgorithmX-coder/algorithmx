"use client";

/**
 * QuickCheck — the "Prove it" beat that closes every concept loop.
 *
 * Short (≤40s), unsupported retrieval: one question, no hints, an instant
 * "you've got it!" win. NOT a quiz screen — it's a snappy, juicy mini-beat.
 * Four flavours via `mode`, so five of these in a row never feel the same:
 *
 *   finish — complete the rule  ("Keep it ___")
 *   speed  — beat the counter   (urgency bar, never hard-fails for kids)
 *   lie    — catch the Raccoon's claim (TRUE / FALSE)
 *   recall — one-tap "which?"
 *
 * Premium by default (the "nothing flat" rule): cosmic backdrop with drifting
 * glow orbs, spring-in prompt, glowing tap chips, green flash + confetti +
 * STAMP on correct, gentle shake + nudge on wrong (retry, never punished).
 * Respects comfort mode via useMotionIntensity.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";

export type QuickCheckMode = "finish" | "speed" | "lie" | "recall";

export interface QuickCheckChoice {
  text: string;
  isCorrect: boolean;
}

export interface QuickCheckProps {
  mode: QuickCheckMode;
  /** The question. For `finish` use an underscore blank, e.g. "Keep it ___". */
  prompt: string;
  choices: QuickCheckChoice[];
  /** For `lie` mode: the Raccoon's bogus claim shown in his speech bubble. */
  raccoonLine?: string;
  /** Praise line on correct (defaults per mode). */
  praise?: string;
  /** Gentle nudge on wrong (defaults generic). */
  nudge?: string;
  /** `speed` mode urgency window, ms. Cosmetic — never hard-fails. */
  speedMs?: number;
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const MODE_LABEL: Record<QuickCheckMode, string> = {
  finish: "Finish the rule",
  speed: "Speed round",
  lie: "True or false?",
  recall: "Quick question",
};

const ACCENTS = ["#00e5ff", "#7c5cff", "#7eff97", "#ffd158"];

// Themed 3D icon that fronts each prove-it beat (no characters — matches the
// exercise redesign). The short line still poses the challenge.
const MODE_ICON: Record<Exclude<QuickCheckMode, "lie">, string> = {
  finish: "🎯",
  speed: "⚡",
  recall: "🧠",
};
const MODE_HERALD: Record<
  Exclude<QuickCheckMode, "lie">,
  { speaker: "adam" | "layla"; line: string }
> = {
  finish: { speaker: "layla", line: "Can you finish the rule?" },
  speed: { speaker: "adam", line: "Quick — beat the clock!" },
  recall: { speaker: "layla", line: "Do you remember this one?" },
};

// Fisher-Yates. The authored choices often list the correct answer first,
// which teaches "just tap the first one" — so we shuffle once per mount.
function shuffleChoices<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function QuickCheck({
  mode,
  prompt,
  choices,
  raccoonLine,
  praise,
  nudge,
  speedMs = 5000,
  onComplete,
  onCorrect,
  onWrong,
}: QuickCheckProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [solved, setSolved] = useState(false);
  const [wrongKey, setWrongKey] = useState(0); // bump to shake the picked wrong chip
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [nudgeText, setNudgeText] = useState<string | null>(null);
  // speed urgency: 1 → 0 over speedMs, cosmetic only
  const [urgency, setUrgency] = useState(1);
  const startedRef = useRef(false);

  useEffect(() => {
    if (mode !== "speed" || reduce || solved) return;
    startedRef.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const left = Math.max(0, 1 - (now - t0) / speedMs);
      setUrgency(left);
      if (left > 0 && !solved) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, reduce, solved, speedMs]);

  const onCorrectFire = () => {
    if (solved) return;
    setSolved(true);
    setNudgeText(null);
    audio.correct();
    void correctAnswerBurst();
    onCorrect?.();
    window.setTimeout(() => onComplete(1), reduce ? 350 : 1100);
  };

  const handlePick = (i: number) => {
    if (solved) return;
    if (shuffledChoices[i].isCorrect) {
      onCorrectFire();
    } else {
      audio.wrong();
      setWrongIdx(i);
      setWrongKey((k) => k + 1);
      setNudgeText(nudge ?? defaultNudge(mode));
      onWrong?.();
    }
  };

  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: [8, 78, 30, 62, 46][i],
        y: [18, 24, 70, 64, 44][i],
        s: [220, 180, 260, 200, 150][i],
        c: ACCENTS[i % ACCENTS.length],
        d: 9 + i * 2,
      })),
    []
  );

  // Shuffle once per mount so the correct answer isn't predictably first.
  const shuffledChoices = useMemo(() => shuffleChoices(choices), [choices]);

  // render the prompt with the blank emphasised for `finish`
  const promptNode =
    mode === "finish" && prompt.includes("___") ? (
      <>
        {prompt.split("___")[0]}
        <span
          style={{
            display: "inline-block",
            minWidth: 84,
            margin: "0 6px",
            color: "#7df0ff",
            borderBottom: "3px solid #7df0ff",
            textShadow: "0 0 16px rgba(125,240,255,0.75)",
          }}
        >
          ____
        </span>
        {prompt.split("___")[1]}
      </>
    ) : (
      prompt
    );

  return (
    <ExerciseFrame
      maxWidth={1100}
      padding={28}
      background="radial-gradient(120% 100% at 50% 0%, #131a3e 0%, #0c1230 45%, #060a1c 100%)"
      style={{ color: "#fff7e6", position: "relative", overflow: "hidden" }}
    >
      {/* drifting glow orbs — depth so it never reads flat */}
      {!reduce &&
        orbs.map((o, i) => (
          <motion.div
            key={i}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.62,
              x: [0, 14, -10, 0],
              y: [0, -12, 8, 0],
            }}
            transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.s,
              height: o.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}42 0%, transparent 70%)`,
              filter: "blur(10px)",
              pointerEvents: "none",
            }}
          />
        ))}

      {/* speed urgency bar */}
      {mode === "speed" && !reduce && (
        <div
          style={{
            position: "relative",
            height: 6,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${urgency * 100}%`,
              background:
                urgency > 0.4
                  ? "linear-gradient(90deg,#7eff97,#00e5ff)"
                  : "linear-gradient(90deg,#ffd158,#ff5fb3)",
              borderRadius: 999,
              transition: "width 80ms linear, background 200ms ease",
            }}
          />
        </div>
      )}

      {/* PROVE IT badge */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
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
          ◇ Prove it · {MODE_LABEL[mode]} ◇
        </motion.div>
      </div>

      {/* Raccoon claim (lie mode) */}
      {mode === "lie" && raccoonLine && (
        <motion.div
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "center",
            margin: "22px 0 6px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              filter: "drop-shadow(0 6px 14px rgba(192,132,252,0.5))",
            }}
          >
            <PixIcon emoji="🦝" size={54} />
          </div>
          <div
            style={{
              position: "relative",
              maxWidth: 520,
              padding: "14px 20px",
              borderRadius: 16,
              background: "rgba(192,132,252,0.12)",
              border: "1px solid rgba(192,132,252,0.45)",
              color: "#e9d5ff",
              fontStyle: "italic",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            “{raccoonLine}”
          </div>
        </motion.div>
      )}

      {/* Challenge herald (finish / speed / recall) — a themed 3D icon + a
          short line poses the challenge (no characters). */}
      {mode !== "lie" && (
        <motion.div
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "center",
            margin: "22px 0 6px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              flexShrink: 0,
              background: "#0c1230",
              boxShadow:
                "0 0 0 3px rgba(125,240,255,0.85), 0 0 0 5px rgba(124,92,255,0.45), 0 0 22px rgba(0,229,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PixIcon emoji={MODE_ICON[mode]} size={38} />
          </div>
          <div
            style={{
              position: "relative",
              maxWidth: 420,
              padding: "12px 18px",
              borderRadius: 16,
              background: "rgba(0,229,255,0.10)",
              border: "1px solid rgba(125,240,255,0.45)",
              color: "#dff6ff",
              fontWeight: 700,
              fontSize: 17,
              lineHeight: 1.3,
            }}
          >
            {MODE_HERALD[mode].line}
          </div>
        </motion.div>
      )}

      {/* Prompt */}
      <motion.h2
        initial={reduce ? false : { scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          margin: "20px auto 6px",
          maxWidth: 720,
          fontSize: "clamp(1.5rem, 3.2vw, 2.1rem)",
          fontWeight: 900,
          lineHeight: 1.2,
          color: "#fff",
        }}
      >
        {promptNode}
      </motion.h2>

      {/* nudge / praise line — reserves space so chips don't jump */}
      <div
        style={{
          minHeight: 26,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          marginBottom: 18,
          fontSize: 15,
          fontWeight: 700,
          color: solved ? "#7eff97" : "#ff9bcb",
        }}
      >
        {solved ? praise ?? defaultPraise(mode) : nudgeText}
      </div>

      {/* Choices */}
      <div
        role="group"
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns:
            choices.length <= 2 ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
          gap: 14,
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        {shuffledChoices.map((c, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const isWrongPick = wrongIdx === i;
          const isSolvedRight = solved && c.isCorrect;
          return (
            <motion.button
              key={i}
              type="button"
              disabled={solved}
              onClick={() => handlePick(i)}
              onPointerEnter={() => !solved && audio.hover()}
              animate={
                isWrongPick && !reduce
                  ? { x: [0, -8, 8, -6, 6, 0] }
                  : isSolvedRight && !reduce
                    ? { scale: [1, 1.06, 1] }
                    : {}
              }
              transition={{ duration: 0.4 }}
              whileHover={reduce || solved ? undefined : { y: -3 }}
              whileTap={solved ? undefined : { scale: 0.97 }}
              style={{
                position: "relative",
                minHeight: 72,
                padding: "16px 18px",
                borderRadius: 16,
                border: `2px solid ${
                  isSolvedRight ? "#7eff97" : `${accent}88`
                }`,
                background: isSolvedRight
                  ? "linear-gradient(160deg, rgba(126,255,151,0.30), rgba(126,255,151,0.10))"
                  : `linear-gradient(160deg, ${accent}28, ${accent}0c)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: choices.length <= 2 ? 20 : 17,
                cursor: solved ? "default" : "pointer",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
                boxShadow: isSolvedRight
                  ? `0 0 38px -2px #7eff97aa, inset 0 1px 0 rgba(255,255,255,0.30)`
                  : `0 12px 30px -16px ${accent}, inset 0 1px 0 rgba(255,255,255,0.16)`,
                opacity: solved && !c.isCorrect ? 0.4 : 1,
                transition: "opacity 200ms ease, border-color 200ms ease",
              }}
            >
              {isSolvedRight && !reduce && (
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.35, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: 18,
                    boxShadow: "0 0 0 2px #7eff97",
                    pointerEvents: "none",
                  }}
                />
              )}
              {isSolvedRight && (
                <span style={{ marginRight: 8, color: "#7eff97" }}>✓</span>
              )}
              {c.text}
            </motion.button>
          );
        })}
      </div>

      {/* shake keyframe key driver (force remount of the wrong chip animation) */}
      <span key={wrongKey} style={{ display: "none" }} />

      {fx.layer()}
    </ExerciseFrame>
  );
}

function defaultPraise(mode: QuickCheckMode): string {
  switch (mode) {
    case "lie":
      return "Nice — you spotted the trick! ✓";
    case "speed":
      return "Fast AND right! ✓";
    default:
      return "Got it! ✓";
  }
}

function defaultNudge(mode: QuickCheckMode): string {
  switch (mode) {
    case "lie":
      return "Look again — is that really true?";
    case "finish":
      return "Not quite — which word finishes the rule?";
    default:
      return "Not quite — have another go!";
  }
}

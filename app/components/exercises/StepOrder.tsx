"use client";

/**
 * StepOrder — the ORDER game (Week 5+, re-themed per week).
 *
 * N empty slots sit on a path; the step tiles float below in shuffled order.
 * The child taps them in the order they'd do them, and each correct tap hops
 * onto the next slot. A wrong tap wobbles with a gentle nudge — no splash, no
 * fail. All slots filled → the path glows and the crossing completes.
 *
 * SKINS (owner rule: a reuse must be a genuine re-theme, never a copy):
 *   - "river"  (W5 Calm Path): stepping stones across a calm river.
 *   - "hero"   (W2 The Hero Pause): a glowing hero-badge trail on a purple
 *              backup-signal board — no river, badge slots joined by a light
 *              line, gold tiles.
 *
 * Learn-Loop wiring: Spot-the-Danger `threat` folded into the narrated intro,
 * Sarah reads each step's affirmation aloud as it lands (`speakSteps`, recorded
 * only), and a spoken `completeNarration` payoff on the complete beat. Tiles are
 * runtime-shuffled (never the authored order) so the answer is never a sequence.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface OrderStep {
  id: string;
  /** Short step label ("Don't reply"). */
  text: string;
  /** Emoji rendered via PixIcon on the tile/stone. */
  icon: string;
  /** Affirmation shown (and read aloud) when this step lands. */
  affirmation?: string;
}

export type StepOrderSkin = "river" | "hero";

export interface StepOrderProps {
  /** Steps in CORRECT order; display order is runtime-shuffled. */
  steps: OrderStep[];
  /** Intro copy (re-theme per week). */
  introTitle: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Board dressing. Default "river" (W5 look). */
  skin?: StepOrderSkin;
  /** Label above the path (e.g. "THE HERO PAUSE"). */
  pathLabel?: string;
  /** Complete-beat copy overrides. */
  completeTitle?: string;
  completeLine?: string;
  /** Read each step's affirmation aloud as it lands (recorded only). Default true. */
  speakSteps?: boolean;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Spot-the-Danger boast folded into the intro. */
  threat?: { raccoonLine: string };
  /** Spoken "you're protected" payoff on the complete beat. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const SKINS = {
  river: {
    frameBg: "linear-gradient(180deg, #0a1230 0%, #10265c 60%, #0a3a4d 100%)",
    accent: "#7df0ff",
    filledBg: "linear-gradient(165deg, #3f7350 0%, #274d34 100%)",
    filledBorder: "#7eff97",
    filledGlow: "rgba(126,255,151,0.6)",
    emptyBg: "linear-gradient(165deg, #3a4569 0%, #262e4d 100%)",
    emptyBorder: "rgba(125,240,255,0.35)",
    slotRadius: "46% 54% 52% 48% / 58% 56% 44% 42%",
    numberColor: "#7d8cc9",
    affirmColor: "#7eff97",
    tileBorder: "rgba(255, 209, 88, 0.55)",
    tileBg: "linear-gradient(165deg, rgba(255,209,88,0.16), rgba(30,24,8,0.9))",
    tileText: "#fff3d6",
    tileGlow: "rgba(255,209,88,0.8)",
    completeTitle: "You crossed the river!",
    completeLine: "That path is yours now - for real life too.",
    fxText: "PATH COMPLETE!",
  },
  hero: {
    frameBg: "linear-gradient(180deg, #14082e 0%, #2a1258 55%, #12063a 100%)",
    accent: "#c9b3ff",
    filledBg: "linear-gradient(165deg, #6a3fd6 0%, #3f1f8f 100%)",
    filledBorder: "#ffd158",
    filledGlow: "rgba(255,209,88,0.6)",
    emptyBg: "linear-gradient(165deg, #2c1a5e 0%, #1b1040 100%)",
    emptyBorder: "rgba(201,179,255,0.35)",
    slotRadius: "22px",
    numberColor: "#8f7dc9",
    affirmColor: "#ffd158",
    tileBorder: "rgba(201,179,255,0.55)",
    tileBg: "linear-gradient(165deg, rgba(157,123,255,0.22), rgba(20,8,46,0.92))",
    tileText: "#f3ecff",
    tileGlow: "rgba(157,123,255,0.8)",
    completeTitle: "Backup team, assembled!",
    completeLine: "Now you know the Hero Pause by heart - for real life too.",
    fxText: "HERO PAUSE!",
  },
} as const;

export default function StepOrder({
  steps,
  introTitle,
  introSubtitle,
  introIcon = "🔢",
  skin = "river",
  pathLabel,
  completeTitle,
  completeLine,
  speakSteps = true,
  hints,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: StepOrderProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const sk = SKINS[skin];
  const voice = introNarration?.speaker ?? "adam";

  const [showIntro, setShowIntro] = useState(true);
  const [placedCount, setPlacedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  // True while Sarah is reading the last landed step's affirmation. The
  // complete beat waits for it so two narrations never overlap.
  const [affSpeaking, setAffSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);

  // Never the authored order (anti-sequence rule), stable within a play.
  const tiles = useShuffledOnce(steps);
  const placedIds = useMemo(
    () => new Set(steps.slice(0, placedCount).map((s) => s.id)),
    [steps, placedCount],
  );
  const allPlaced = placedCount >= steps.length;

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const pick = (step: OrderStep) => {
    if (showIntro || finished || affSpeaking || placedIds.has(step.id)) return;
    setHasInteracted(true);
    const expected = steps[placedCount];
    const wasCorrect = step.id === expected.id;
    onAnswered?.({
      questionKey: `step-${step.id}`,
      selectedIndex: tiles.findIndex((t) => t.id === step.id),
      correctIndex: tiles.findIndex((t) => t.id === expected.id),
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      setWrongId(null);
      const line = step.affirmation ?? null;
      setAffirmation(line);
      if (speakSteps && line) setAffSpeaking(true);
      const next = placedCount + 1;
      setPlacedCount(next);
      onCorrect?.();
      if (next >= steps.length) fx.correct({ xp: 25, text: sk.fxText });
    } else {
      audio.wrong();
      setWrongId(step.id);
      onWrong?.();
      setWrongCount((n) => {
        const v = n + 1;
        reportTier(v);
        return v;
      });
    }
  };

  // Completion: once every step is placed AND the last affirmation has been
  // heard, hand over to the complete beat (which carries its own narration).
  useEffect(() => {
    if (!allPlaced || finished || affSpeaking) return;
    const t = window.setTimeout(() => setFinished(true), reduce ? 400 : 900);
    return () => window.clearTimeout(t);
  }, [allPlaced, finished, affSpeaking, reduce]);

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const progressPct = steps.length > 1 ? (Math.max(0, placedCount - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <ExerciseFrame
      maxWidth={820}
      background={sk.frameBg}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {fx.layer()}

      {/* board dressing */}
      {skin === "river" ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "34%",
            height: 130,
            background: "linear-gradient(180deg, rgba(0,180,255,0.14) 0%, rgba(0,120,200,0.28) 100%)",
            borderTop: "2px solid rgba(125,240,255,0.25)",
            borderBottom: "2px solid rgba(125,240,255,0.25)",
          }}
        />
      ) : (
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* backup-signal glow + faint hero grid */}
          <div style={{ position: "absolute", left: "50%", top: "40%", width: 620, height: 220, transform: "translate(-50%, -50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,209,88,0.16) 0%, rgba(157,123,255,0.10) 45%, transparent 75%)", filter: "blur(10px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(201,179,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,179,255,0.06) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 80%)" }} />
        </div>
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          threat={threat}
          // Wide 820px frame: a threat-less intro would render as an empty box.
          overlay
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Sarah reads the landed step (audio only; the guard holds taps). */}
      {speakSteps && affSpeaking && affirmation && (
        <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          <InfoNarration
            key={`step-aff-${placedCount}`}
            speaker={voice}
            lines={[affirmation]}
            recordedOnly
            onDone={() => setAffSpeaking(false)}
          />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2, minHeight: 440, paddingTop: 8 }}>
        {pathLabel && (
          <div
            style={{
              textAlign: "center",
              marginTop: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: sk.accent,
              textShadow: `0 0 12px ${sk.accent}66`,
            }}
          >
            {pathLabel}
          </div>
        )}

        {/* The path: N slots filled in order */}
        <div style={{ position: "relative", maxWidth: 660, margin: `${pathLabel ? 40 : 70}px auto 96px` }}>
          {skin === "hero" && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: "50%",
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${sk.filledBorder} 0%, ${sk.filledBorder} ${progressPct}%, rgba(201,179,255,0.18) ${progressPct}%, rgba(201,179,255,0.18) 100%)`,
                boxShadow: placedCount > 1 ? `0 0 16px -2px ${sk.filledGlow}` : "none",
                transition: "background 400ms ease",
              }}
            />
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))`,
              gap: 12,
              alignItems: "center",
              position: "relative",
            }}
          >
            {steps.map((s, i) => {
              const filled = i < placedCount;
              return (
                <motion.div
                  key={s.id}
                  animate={filled && !reduce ? { scale: [1.12, 1] } : {}}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: "100%",
                      minHeight: 84,
                      borderRadius: sk.slotRadius,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "10px 8px",
                      background: filled ? sk.filledBg : sk.emptyBg,
                      border: `2.5px solid ${filled ? sk.filledBorder : sk.emptyBorder}`,
                      boxShadow: filled ? `0 0 28px -4px ${sk.filledGlow}` : "0 10px 24px -14px rgba(0,0,0,0.8)",
                      transition: "background 300ms ease, border-color 300ms ease",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 900, color: filled ? "#fff6d6" : sk.numberColor, letterSpacing: "0.08em" }}>
                      {i + 1}
                    </span>
                    {filled ? (
                      <>
                        <PixIcon emoji={s.icon} size={26} />
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff9ee", textAlign: "center", lineHeight: 1.2 }}>
                          {s.text}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: sk.numberColor }}>?</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* affirmation line */}
        <div
          style={{
            minHeight: 24,
            textAlign: "center",
            marginTop: -78,
            marginBottom: 54,
            fontSize: 15,
            fontWeight: 800,
            color: sk.affirmColor,
          }}
        >
          {affirmation}
        </div>

        {/* Shuffled step tiles */}
        {!finished && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tiles.length}, minmax(0,1fr))`,
              gap: 12,
              maxWidth: 660,
              margin: "0 auto",
            }}
          >
            {tiles.map((t) => {
              const used = placedIds.has(t.id);
              const isWrong = wrongId === t.id;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  disabled={used || showIntro || affSpeaking}
                  onClick={() => pick(t)}
                  onPointerEnter={() => !used && audio.hover()}
                  animate={
                    isWrong && !reduce
                      ? { x: [0, -7, 7, -5, 5, 0] }
                      : used
                        ? { opacity: 0.25, y: -6 }
                        : { opacity: 1, y: 0 }
                  }
                  whileHover={used || reduce ? undefined : { y: -4 }}
                  whileTap={used ? undefined : { scale: 0.96 }}
                  style={{
                    minHeight: 96,
                    padding: "12px 10px",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: `2px solid ${sk.tileBorder}`,
                    background: sk.tileBg,
                    color: sk.tileText,
                    fontSize: 14.5,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    cursor: used ? "default" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: `0 14px 30px -18px ${sk.tileGlow}`,
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={t.icon} size={30} />
                  {t.text}
                </motion.button>
              );
            })}
          </div>
        )}

        <div style={{ maxWidth: 560, margin: "14px auto 0" }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker={voice} text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker={voice} text={hints.tier2} />}
        </div>
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? sk.completeTitle}
          stars={stars}
          statLines={[
            `All ${steps.length} steps in the right order`,
            completeLine ?? sk.completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(steps.length - Math.min(wrongCount, steps.length - 1))}
        />
      )}
    </ExerciseFrame>
  );
}

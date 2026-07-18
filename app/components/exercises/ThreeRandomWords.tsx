"use client";

/**
 * Three Random Words Builder.
 *
 * The NCSC-recommended passphrase approach made playful: tap any 3
 * unrelated nouns from a wall to form a long, memorable, strong
 * password. Watch a strength meter rise. Tap a slot to clear it and
 * try a different combination - encourages tinkering.
 *
 * Bonus condition: pick 3 words from 3 different categories
 * (animal/object/place/food) - surfaces a small "VARIETY!" toast.
 *
 * Persists: the chosen word ids (stable), the slot count, and
 * whether the variety bonus fired. NOT the assembled password text.
 */

import { Fragment, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import HintBubble from "@/app/components/lesson/HintBubble";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface RandomWord {
  id: string;
  text: string;
  category: "animal" | "object" | "place" | "food";
}

export interface ThreeRandomWordsProps {
  words: RandomWord[];
  /** Number of slots. Defaults to 3. */
  slots?: number;
  hints?: { tier1: string; tier2: string };
  /** Spoken, paced intro that explains the task (read aloud before play). */
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Teach-once coach line played at the first word pick, then dismissed. */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
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

type Phase = "intro" | "active" | "submitted" | "finished";

const CATEGORY_COLOUR: Record<RandomWord["category"], string> = {
  animal: "#7eff97",
  object: "#7df0ff",
  place: "#fbbf24",
  food: "#ff9bcb",
};

function passphraseStrength(words: RandomWord[]): {
  score: number;
  label: string;
  colour: string;
} {
  // Simple kid-friendly: length is the dominant factor. 3 random
  // words is typically 15-22 characters - very strong.
  const totalLen = words.reduce((sum, w) => sum + w.text.length, 0);
  let score = Math.min(100, totalLen * 5);
  // Bonus for variety - distinct categories.
  const distinctCats = new Set(words.map((w) => w.category)).size;
  if (words.length >= 3 && distinctCats >= 3) score += 10;
  score = Math.max(0, Math.min(100, score));
  if (score < 30) return { score, label: "TINY", colour: "#ef4444" };
  if (score < 55) return { score, label: "OK", colour: "#fbbf24" };
  if (score < 80) return { score, label: "STRONG", colour: "#7eff97" };
  return { score, label: "SUPER STRONG", colour: "#34d399" };
}

export default function ThreeRandomWords({
  words,
  slots: slotCount = 3,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: ThreeRandomWordsProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [picked, setPicked] = useState<(string | null)[]>(() =>
    Array(slotCount).fill(null)
  );
  const [showVarietyHint, setShowVarietyHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Whichever slot index is the next empty - first unfilled slot.
  const nextEmptySlot = picked.findIndex((s) => s === null);
  const allFilled = nextEmptySlot === -1;

  const pickedWords = useMemo(
    () =>
      picked
        .map((id) => (id ? words.find((w) => w.id === id) ?? null : null))
        .filter((w): w is RandomWord => w !== null),
    [picked, words]
  );
  const strength = passphraseStrength(pickedWords);

  // Variety bonus: 3+ slots filled AND 3+ distinct categories.
  const hasVariety =
    pickedWords.length >= 3 &&
    new Set(pickedWords.map((w) => w.category)).size >= 3;

  const handleWordTap = useCallback(
    (wordId: string) => {
      if (phase !== "active") return;
      // Toggle: if word already picked, remove it from its slot.
      const existingIndex = picked.indexOf(wordId);
      if (existingIndex >= 0) {
        const next = [...picked];
        next[existingIndex] = null;
        setPicked(next);
        audio.tap();
        return;
      }
      // Otherwise fill the next empty slot. If all slots are full,
      // ignore - child has to clear one first.
      if (nextEmptySlot < 0) {
        fx.toast({
          text: "Tap a slot to clear it",
          tone: "danger",
          durationMs: 700,
        });
        return;
      }
      const next = [...picked];
      next[nextEmptySlot] = wordId;
      setPicked(next);
      audio.drop(); // word snaps into the slot
    },
    [picked, nextEmptySlot, phase, fx, audio]
  );

  const handleSlotTap = useCallback(
    (slotIdx: number) => {
      if (phase !== "active") return;
      if (picked[slotIdx] === null) return;
      const next = [...picked];
      next[slotIdx] = null;
      setPicked(next);
      audio.tap();
    },
    [picked, phase, audio]
  );

  const handleSubmit = useCallback(() => {
    if (!allFilled) {
      // Nudge hint after first submit attempt with empty slots
      setAttempts((n) => n + 1);
      onHintReached?.(1);
      fx.toast({
        text: "Pick 3 words first",
        tone: "danger",
        durationMs: 700,
      });
      return;
    }
    setPhase("submitted");
    // Stable per-build question key. Selected word ids embedded as
    // suffix so parent dashboard can see what combinations were tried
    // without storing the assembled password text.
    const ids = pickedWords.map((w) => w.id).join("+");
    onAnswered?.({
      questionKey: `trw-build@${ids}`,
      selectedIndex: 0,
      correctIndex: 0,
      // Any 3-word combination from the wall is "correct" - the
      // strength meter has already validated. We mark wasCorrect
      // true to keep parent-dashboard semantics consistent.
      wasCorrect: true,
    });
    onCorrect?.();
    fx.unlock({
      xp: hasVariety ? 35 : 25,
      text: hasVariety ? "VARIETY BONUS!" : "STRONG PASSPHRASE!",
    });
    if (hasVariety) {
      setShowVarietyHint(true);
    }
    // Brief hold on the submitted state, then finish.
    window.setTimeout(
      () => setPhase("finished"),
      intensity === 0 ? 800 : 1600
    );
  }, [
    allFilled,
    pickedWords,
    fx,
    hasVariety,
    onAnswered,
    onCorrect,
    onHintReached,
    intensity,
  ]);

  // No second-attempt = no wrong path in this exercise. onWrong is
  // wired for future variants where invalid combinations might exist.
  void onWrong;

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = hasVariety ? 3 : 2;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title="Passphrase built!"
          stars={stars}
          statLines={[
            `Strength: ${strength.label}`,
            hasVariety
              ? "Variety bonus: 3 different word types!"
              : "Try a mix of animals / objects / places / foods for a bonus.",
          ]}
          onContinue={() => onComplete(strength.score)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active build ─── */
  return (
    <ExerciseFrame
      maxWidth={1100}
      padding={24}
      decor={false}
      background="radial-gradient(ellipse 130% 85% at 50% -12%, rgba(124,92,255,0.42), transparent 56%), radial-gradient(ellipse 105% 70% at 50% 116%, rgba(0,229,255,0.22), transparent 55%), radial-gradient(circle at 84% 16%, rgba(255,160,80,0.12), transparent 42%), linear-gradient(180deg, #1b2050 0%, #0f1436 52%, #080a20 100%)"
      style={{
        boxShadow:
          "0 40px 90px -28px rgba(6,8,20,0.85), 0 0 0 1.5px rgba(124,92,255,0.5) inset, 0 0 78px rgba(124,92,255,0.20) inset",
      }}
    >
      <style>{FORGE_KEYFRAMES}</style>
      <ForgeBackdrop reduce={intensity === 0} />
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#7df0ff",
            textTransform: "uppercase",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 11px",
            borderRadius: 999,
            background: "rgba(0,229,255,0.10)",
            border: "1px solid rgba(0,229,255,0.28)",
          }}
        >
          ⚒ Passphrase Forge
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#aeb8d6",
          }}
        >
          Tap {slotCount} words to forge a passphrase
        </span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2
          style={{
            margin: "0 0 4px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            color: "#eaf2ff",
          }}
        >
          Build a{" "}
          <span
            style={{
              background: "linear-gradient(120deg, #7df0ff, #7c5cff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Passphrase
          </span>
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>
          Glue silly random words together — long, memorable, hard to crack!{" "}
          <span aria-hidden>✦</span>
        </p>
      </div>

      {/* Forge chambers — tap-to-fill slots that fuse into the passphrase */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          gap: 9,
          marginBottom: 2,
        }}
      >
        {picked.map((id, idx) => {
          const word = id ? words.find((w) => w.id === id) : null;
          const colour = word ? CATEGORY_COLOUR[word.category] : "#475569";
          return (
            <Fragment key={idx}>
              {idx > 0 && (
                <div
                  aria-hidden
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 26,
                    fontWeight: 900,
                    color: "rgba(125,240,255,0.55)",
                    textShadow: "0 0 12px rgba(0,229,255,0.5)",
                  }}
                >
                  +
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSlotTap(idx)}
                disabled={!word || phase !== "active"}
                style={{
                  flex: 1,
                  position: "relative",
                  minHeight: 82,
                  padding: "12px 10px",
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  border: word
                    ? `2px solid ${colour}`
                    : "2px dashed rgba(148,163,184,0.4)",
                  background: word
                    ? `linear-gradient(180deg, ${colour}42, ${colour}14)`
                    : "rgba(10,14,34,0.5)",
                  boxShadow: word
                    ? `0 0 22px ${colour}66, inset 0 0 14px ${colour}2e`
                    : "none",
                  color: word ? colour : "rgba(148,163,184,0.65)",
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: word && phase === "active" ? "pointer" : "default",
                  transition:
                    "background 220ms ease-out, border-color 220ms ease-out, box-shadow 220ms ease-out, color 220ms ease-out",
                  animation:
                    !word && intensity !== 0
                      ? "trwWell 2.4s ease-in-out infinite"
                      : undefined,
                  touchAction: "manipulation",
                }}
              >
                {word ? (
                  <>
                    <span
                      style={{
                        fontSize: 19,
                        fontWeight: 800,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {word.text}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        opacity: 0.75,
                      }}
                    >
                      {word.category}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 24, opacity: 0.5, lineHeight: 1 }}>
                      +
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      slot {idx + 1}
                    </span>
                  </>
                )}
                {word && phase === "active" && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 9,
                      fontSize: 12,
                      color: "rgba(226,232,240,0.7)",
                      fontFamily: "system-ui",
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            </Fragment>
          );
        })}
      </div>
      {/* fuse arrow → the passphrase forms below */}
      <div
        aria-hidden
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "rgba(125,240,255,0.7)",
          margin: "2px 0 8px",
        }}
      >
        ▼
      </div>

      {/* Live passphrase preview + strength core */}
      <div
        style={{
          padding: "16px 18px",
          background:
            "radial-gradient(ellipse 80% 120% at 50% 120%, rgba(0,229,255,0.14), transparent 60%), rgba(6, 9, 22, 0.72)",
          border: "1px solid rgba(125, 240, 255, 0.28)",
          boxShadow: "inset 0 0 26px rgba(0,229,255,0.10)",
          borderRadius: 18,
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#94a3b8",
            letterSpacing: "0.08em",
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          your passphrase
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 25,
            color: strength.colour,
            fontWeight: 700,
            minHeight: 30,
            wordBreak: "break-all",
            textShadow:
              pickedWords.length === 0
                ? "none"
                : `0 0 18px ${strength.colour}66`,
          }}
        >
          {pickedWords.length === 0
            ? "..."
            : pickedWords
                .map((w) => w.text.charAt(0).toUpperCase() + w.text.slice(1))
                .join("")}
        </div>
        <div
          style={{
            position: "relative",
            height: 12,
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 6,
            overflow: "hidden",
            marginTop: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${strength.score}%`,
              background: `linear-gradient(90deg, ${strength.colour}, ${strength.colour}cc)`,
              boxShadow: `0 0 10px ${strength.colour}88`,
              transition:
                intensity === 0
                  ? "width 100ms linear"
                  : "width 360ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#94a3b8",
            letterSpacing: "0.08em",
          }}
        >
          <span>STRENGTH</span>
          <span style={{ color: strength.colour, fontWeight: 800 }}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Hint area */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {attempts >= 1 && !allFilled && hints && (
          <HintBubble
            tier={1}
            speaker="layla"
            text={hints.tier1}
          />
        )}
        {showVarietyHint && hints && (
          <HintBubble
            tier={1}
            speaker="adam"
            text={hints.tier2}
          />
        )}
      </div>

      {/* Word bank legend — colour key for the four word types */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          margin: "2px 2px 8px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#8ea0c8",
        }}
      >
        <span>Word Bank</span>
        <span style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(
            [
              ["animal", CATEGORY_COLOUR.animal],
              ["object", CATEGORY_COLOUR.object],
              ["place", CATEGORY_COLOUR.place],
              ["food", CATEGORY_COLOUR.food],
            ] as const
          ).map(([label, c]) => (
            <span
              key={label}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                }}
              />
              {label}
            </span>
          ))}
        </span>
      </div>

      {/* Word wall */}
      <div
        role="group"
        aria-label="Word bank"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {words.map((w) => {
          const isPicked = picked.includes(w.id);
          const colour = CATEGORY_COLOUR[w.category];
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => handleWordTap(w.id)}
              disabled={phase !== "active"}
              style={{
                padding: "10px 8px 10px 12px",
                minHeight: 44,
                background: isPicked
                  ? `linear-gradient(135deg, ${colour}34, ${colour}14)`
                  : "rgba(13, 18, 42, 0.72)",
                border: `1.5px solid ${isPicked ? colour : "rgba(148, 163, 184, 0.22)"}`,
                borderLeft: `4px solid ${colour}`,
                borderRadius: 10,
                color: isPicked ? colour : "#e2e8f0",
                fontWeight: isPicked ? 800 : 600,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: isPicked ? `0 0 16px ${colour}59` : "none",
                cursor: phase === "active" ? "pointer" : "default",
                transition:
                  "transform 120ms ease-out, background 160ms ease-out, box-shadow 160ms ease-out",
                touchAction: "manipulation",
              }}
            >
              {w.text}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GameButton
          variant={allFilled ? "primary" : "ghost"}
          size="lg"
          onClick={handleSubmit}
          disabled={phase !== "active"}
          icon={allFilled ? "✨" : undefined}
          style={{ minWidth: 220 }}
        >
          {allFilled ? "Use this passphrase →" : "Pick 3 words first"}
        </GameButton>
      </div>

      {/* Submitted celebration overlay - the chosen words pulse */}
      <AnimatePresence>
        {phase === "submitted" && (
          <motion.div
            initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background: "rgba(8, 10, 22, 0.55)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                padding: "18px 28px",
                background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
                color: "#0f1530",
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 22,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.04em",
                boxShadow: "0 0 36px rgba(0, 229, 255, 0.55)",
                textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)",
              }}
            >
              <PixIcon emoji="✨" size={22} style={{ marginRight: 6 }} /> {strength.label}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "intro" && (
        <ExerciseIntroBeat
          title="Three Random Words"
          logo="/cyberheroes/logos/three-words.png"
          welcome="Your second challenge!"
          subtitle="Tap 3 words from the wall. Long random combos are way harder to crack than short clever ones."
          icon="✦"
          narration={introNarration}
          character={introNarration?.speaker ?? "layla"}
          onDismiss={() => setPhase("active")}
        />
      )}

      {/* Teach-once: nudge the first pick, then it dismisses itself / on pick */}
      {coachLines && phase === "active" && pickedWords.length === 0 && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {fx.layer()}
    </ExerciseFrame>
  );
}

/* ───────────────────────── FORGE BACKDROP ─────────────────────────
 * Floating word-fragment "sparks" that drift up, plus soft colour orbs,
 * giving the Passphrase Forge depth so it reads as its own lit stage
 * instead of blending into the dark lesson shell. Sits behind all
 * content (z-index:-1) and the sparks are skipped for reduced motion. */
const FORGE_KEYFRAMES = `
@keyframes trwRise {
  0%   { transform: translateY(30px) scale(0.8); opacity: 0; }
  15%  { opacity: 0.22; }
  85%  { opacity: 0.22; }
  100% { transform: translateY(-220px) scale(1.1); opacity: 0; }
}
@keyframes trwWell {
  0%,100% { border-color: rgba(148,163,184,0.34); }
  50%     { border-color: rgba(125,240,255,0.5); }
}
`;

const FORGE_GLYPHS = ["a", "#", "7", "x", "$", "w", "9", "@", "r", "k", "2", "!"];
const FORGE_TINTS = ["#7df0ff", "#c9b8ff", "#ff9bcb"];

function ForgeBackdrop({ reduce }: { reduce: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -30,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,92,255,0.5), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.4), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      {!reduce &&
        Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 53 + 7) % 100}%`,
              top: `${60 + ((i * 17) % 38)}%`,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 10 + (i % 4) * 4,
              color: FORGE_TINTS[i % FORGE_TINTS.length],
              animation: `trwRise ${7 + (i % 6)}s linear ${i * 0.5}s infinite`,
            }}
          >
            {FORGE_GLYPHS[i % FORGE_GLYPHS.length]}
          </span>
        ))}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
  wrongAnswerShake,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";

export interface CrackTheCodeProps {
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

interface RingConfig {
  id: string;
  label: string;
  options: string[];
  correct: number;
  colour: string;
  radius: number;
}

const RINGS: RingConfig[] = [
  {
    id: "chars",
    label: "CHARACTERS",
    options: [
      "Only lowercase",
      "Upper + lower",
      "Upper + lower + numbers",
      "All character types",
    ],
    correct: 3,
    colour: "#00e5ff",
    radius: 230,
  },
  {
    id: "length",
    label: "LENGTH",
    // Length options match the rest of the Cyber Heroes course, where
    // we consistently teach "at least 8 characters" as the safe target.
    // Anything 8+ is correct; the lower three are the wrong/weak answers.
    options: ["3 characters", "5 characters", "6 characters", "8+ characters"],
    correct: 3,
    colour: "#7eff97",
    radius: 195,
  },
  {
    id: "pattern",
    label: "PATTERN",
    options: [
      "Dictionary word",
      "Name + birthday",
      "Random mix",
      "Keyboard pattern",
    ],
    correct: 2,
    colour: "#f97316",
    radius: 160,
  },
  {
    id: "storage",
    label: "STORAGE",
    options: [
      "Written on sticky note",
      "Same for everything",
      "Password manager",
      "Shared with friends",
    ],
    correct: 2,
    colour: "#a855f7",
    radius: 125,
  },
];

const STYLES = `
@keyframes ccShake {
  0%,100% { transform: translateX(0); }
  15%  { transform: translateX(-10px); }
  30%  { transform: translateX(10px); }
  45%  { transform: translateX(-8px); }
  60%  { transform: translateX(8px); }
  75%  { transform: translateX(-4px); }
}
@keyframes ccRingFlashRed {
  0%,100% { box-shadow: 0 0 0 rgba(239,68,68,0); }
  40% { box-shadow: 0 0 22px rgba(239,68,68,0.9), inset 0 0 10px rgba(239,68,68,0.4); }
}
@keyframes ccKeyholePulse {
  0%,100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
  50%     { opacity: 1;   transform: translate(-50%,-50%) scale(1.25); }
}
@keyframes ccDoorOpenLeft {
  from { transform: translateX(0) rotate(0); }
  to   { transform: translateX(-100%) rotate(-4deg); }
}
@keyframes ccDoorOpenRight {
  from { transform: translateX(0) rotate(0); }
  to   { transform: translateX(100%) rotate(4deg); }
}
@keyframes ccLightRays {
  0%,100% { opacity: 0.55; transform: scale(1); }
  50%     { opacity: 1; transform: scale(1.08); }
}
@keyframes ccTrophyRise {
  0%   { opacity: 0; transform: translate(-50%, 40px) scale(0.4); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
@keyframes ccFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ccSelectedGlow {
  0%,100% { opacity: 0.75; }
  50%     { opacity: 1; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-crack-code-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

export default function CrackTheCode({
  onComplete,
  onCorrect,
  onWrong,
}: CrackTheCodeProps) {
  useEffect(ensureStyles, []);

  const [showIntro, setShowIntro] = useState(true);
  // Offsets: rings[i] = number of positions rotated clockwise (so selected
  // = options[(options.length - offset) % options.length]).
  const [offsets, setOffsets] = useState<number[]>(
    RINGS.map(() => Math.floor(Math.random() * 4))
  );
  const [ringFlash, setRingFlash] = useState<Record<number, "red" | null>>({});
  const [attempts, setAttempts] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [shakeAll, setShakeAll] = useState(false);
  const [prevCorrect, setPrevCorrect] = useState<boolean[]>(() =>
    RINGS.map(() => false)
  );

  /* ─── PHASE B: DEFEND THE PASSWORD ─────────────────────────────
   * After the kid cracks the rings and unlocks the vault, the Hacker
   * Raccoon doesn't give up - he throws 4 common weak guesses at the
   * lock and the kid has to REJECT each one in time. Same content
   * (passwords, locks) but a totally new mechanic: defensive reflex
   * instead of combinatorial puzzle. */
  type CtcPhase = "rings" | "defend" | "done";
  const [ctcPhase, setCtcPhase] = useState<CtcPhase>("rings");
  const WEAK_GUESSES = useMemo(
    () => [
      { text: "password", reason: "Most-guessed password ever." },
      { text: "12345", reason: "Easy keyboard run - try this!" },
      { text: "qwerty", reason: "Just the top row of keys." },
      { text: "abc123", reason: "First 3 letters + 1-2-3. Too obvious." },
    ],
    []
  );
  const [defendIdx, setDefendIdx] = useState(0);
  const [defendHits, setDefendHits] = useState(0);
  const [defendMisses, setDefendMisses] = useState(0);
  const [defendFeedback, setDefendFeedback] = useState<"hit" | "miss" | null>(null);
  const defendLockRef = useRef(false);

  const resetExercise = () => {
    setOffsets(RINGS.map(() => Math.floor(Math.random() * 4)));
    setRingFlash({});
    setAttempts(0);
    setUnlocked(false);
    setShakeAll(false);
    setPrevCorrect(RINGS.map(() => false));
    setShowIntro(true);
    setCtcPhase("rings");
    setDefendIdx(0);
    setDefendHits(0);
    setDefendMisses(0);
    setDefendFeedback(null);
    defendLockRef.current = false;
  };

  /** Kid pressed REJECT on the current weak guess (correct action). */
  const defendReject = () => {
    if (defendLockRef.current) return;
    if (defendIdx >= WEAK_GUESSES.length) return;
    defendLockRef.current = true;
    setDefendHits((n) => n + 1);
    setDefendFeedback("hit");
    playSound("sortCorrect");
    onCorrect?.();
    void correctAnswerBurst();
    window.setTimeout(() => {
      setDefendFeedback(null);
      const next = defendIdx + 1;
      if (next >= WEAK_GUESSES.length) {
        setCtcPhase("done");
        playSound("confetti");
        void badgeEarnedCelebration();
      } else {
        setDefendIdx(next);
      }
      defendLockRef.current = false;
    }, 600);
  };

  /** Kid pressed ALLOW on the current weak guess (wrong action - all
   *  Phase B guesses are deliberate weak passwords). */
  const defendAllow = () => {
    if (defendLockRef.current) return;
    if (defendIdx >= WEAK_GUESSES.length) return;
    defendLockRef.current = true;
    setDefendMisses((n) => n + 1);
    setDefendFeedback("miss");
    playSound("wrong");
    wrongAnswerShake();
    onWrong?.();
    window.setTimeout(() => {
      setDefendFeedback(null);
      const next = defendIdx + 1;
      if (next >= WEAK_GUESSES.length) {
        setCtcPhase("done");
        playSound("confetti");
      } else {
        setDefendIdx(next);
      }
      defendLockRef.current = false;
    }, 900);
  };

  const rotate = (ringIdx: number, dir: -1 | 1) => {
    if (unlocked) return;
    playSound("click");
    setOffsets((prev) => {
      const next = prev.slice();
      const n = RINGS[ringIdx].options.length;
      next[ringIdx] = (next[ringIdx] + dir + n) % n;
      return next;
    });
  };

  const selectedIndex = (ringIdx: number) => {
    const ring = RINGS[ringIdx];
    const n = ring.options.length;
    return (n - offsets[ringIdx]) % n;
  };

  const corrects = useMemo(
    () => RINGS.map((_, i) => selectedIndex(i) === RINGS[i].correct),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offsets]
  );

  // Play a correct cue when a ring first becomes correct
  useEffect(() => {
    corrects.forEach((isCorrect, i) => {
      if (isCorrect && !prevCorrect[i]) {
        playSound("sortCorrect");
        onCorrect?.();
      }
    });
    setPrevCorrect(corrects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsets]);

  const attemptUnlock = () => {
    if (unlocked) return;
    setAttempts((n) => n + 1);
    const wrongIdx = corrects
      .map((v, i) => (v ? -1 : i))
      .filter((i) => i >= 0);
    if (wrongIdx.length === 0) {
      setUnlocked(true);
      playSound("confetti");
      playSound("badgeEarned");
      void correctAnswerBurst();
      void badgeEarnedCelebration();
    } else {
      playSound("wrong");
      wrongAnswerShake();
      setShakeAll(true);
      const flashMap: Record<number, "red" | null> = {};
      wrongIdx.forEach((i) => (flashMap[i] = "red"));
      setRingFlash(flashMap);
      window.setTimeout(() => setShakeAll(false), 600);
      window.setTimeout(() => setRingFlash({}), 700);
      onWrong?.();
    }
  };

  // Combined Phase A (ring attempts) + Phase B (defend hits) stars.
  // Both must be excellent for a 3-star finish.
  const phaseAStars = attempts <= 1 ? 3 : attempts === 2 ? 2 : 1;
  const phaseBStars =
    defendHits === WEAK_GUESSES.length
      ? 3
      : defendHits >= WEAK_GUESSES.length - 1
      ? 2
      : 1;
  const stars =
    ctcPhase === "done" ? Math.min(phaseAStars, phaseBStars) : phaseAStars;

  const boltAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

  // PHASE B: render the defend mini-game in place of the rings.
  if (ctcPhase === "defend" || ctcPhase === "done") {
    return (
      <DefendPanel
        guesses={WEAK_GUESSES}
        guessIdx={defendIdx}
        hits={defendHits}
        misses={defendMisses}
        feedback={defendFeedback}
        done={ctcPhase === "done"}
        stars={stars}
        ringAttempts={attempts}
        onReject={defendReject}
        onAllow={defendAllow}
        onContinue={() => {
          playSound("click");
          onComplete(stars);
        }}
        onRetry={() => {
          playSound("select");
          resetExercise();
        }}
      />
    );
  }

  // When the intro is up, render ONLY the intro (no game underneath). The
  // intro overlay used position:absolute inset:0 inside this wrapper, but
  // the wrapper's overflowY:auto + maxHeight meant a tall game body could
  // poke out below the overlay (visible as a stacked-card overlap on
  // shorter viewports). Early-returning the intro avoids that entirely.
  if (showIntro) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 560,
          borderRadius: 28,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
          boxShadow:
            "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        }}
      >
        <ExerciseIntro
          title="Crack the Code!"
          description="Rotate the combination rings to set the strongest password settings, then unlock the vault!"
          icon="🔓"
          controls="Click the arrows to rotate"
          onStart={() => setShowIntro(false)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 560,
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        overflowX: "hidden",
        overflowY: "auto",
        background:
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        color: "#e8edff",
        padding: "20px 16px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 3,
          color: "#00e5ff",
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        Crack the Code
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          margin: "4px 0 6px",
          background: "linear-gradient(135deg, #7c5cff, #00e5ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Build the strongest password recipe
      </div>
      <div
        style={{
          color: "rgba(125,240,255,0.65)",
          fontSize: 13,
          marginBottom: 14,
          maxWidth: 460,
          lineHeight: 1.5,
        }}
      >
        Use ← → on each ring to spin to the <span style={{ color: "#7eff97", fontWeight: 800 }}>safest</span> answer. When all four rings glow green, hit <span style={{ color: "#00e5ff", fontWeight: 800 }}>UNLOCK</span>.
      </div>

      <SavedPasswordChip />


      {/* Compact concentric-ring indicator - purely decorative, gives the
          "rings" feel back without overwhelming the actual dials below.
          Each ring's current pick is shown as a glowing dot on its arc;
          rings turn green when correct so progress is obvious at a glance. */}
      <div
        style={{
          width: 168,
          height: 168,
          margin: "0 0 14px",
          position: "relative",
          flexShrink: 0,
        }}
        aria-hidden
      >
        <svg width={168} height={168} viewBox="0 0 168 168" style={{ display: "block" }}>
          <defs>
            <radialGradient id="ctcCore">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>
          </defs>
          {/* Centre keyhole */}
          <circle cx="84" cy="84" r="14" fill="url(#ctcCore)" opacity={corrects.every(Boolean) ? 1 : 0.55} />
          <circle cx="84" cy="84" r="14" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.7" />
          {RINGS.map((ring, i) => {
            const r = 28 + i * 16;
            const isCorrect = corrects[i];
            const optionCount = ring.options.length;
            const idx = selectedIndex(i);
            const angle = (idx * 360) / optionCount - 90;
            const dotX = 84 + Math.cos((angle * Math.PI) / 180) * r;
            const dotY = 84 + Math.sin((angle * Math.PI) / 180) * r;
            const flash = ringFlash[i] === "red";
            return (
              <g key={ring.id}>
                <circle
                  cx="84"
                  cy="84"
                  r={r}
                  fill="none"
                  stroke={isCorrect ? "#7eff97" : flash ? "#ef4444" : ring.colour}
                  strokeOpacity={isCorrect ? 0.9 : 0.4}
                  strokeWidth={isCorrect ? 2.4 : 1.6}
                  strokeDasharray={isCorrect ? "0" : "4 6"}
                />
                {/* Selection marker */}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={isCorrect ? 5 : 4}
                  fill={isCorrect ? "#7eff97" : ring.colour}
                  style={{
                    filter: `drop-shadow(0 0 6px ${isCorrect ? "#7eff97" : ring.colour})`,
                    transition: "cx 0.35s cubic-bezier(0.4,1.4,0.5,1), cy 0.35s cubic-bezier(0.4,1.4,0.5,1), fill 0.3s ease",
                  }}
                />
              </g>
            );
          })}
        </svg>
        {/* Progress badge */}
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -8,
            background: "rgba(15,21,37,0.9)",
            border: "1px solid rgba(160,106,255,0.45)",
            borderRadius: 999,
            padding: "3px 9px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 800,
            color: "#c08aff",
            letterSpacing: 1,
          }}
        >
          {corrects.filter(Boolean).length}/{RINGS.length}
        </div>
      </div>

      {/* Horizontal dial layout - primary interaction. Clear labels +
          arrow buttons keep it kid-friendly while the ring indicator
          above gives the "ring" visual feel back. */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "0 4px",
          animation: shakeAll ? "ccShake 0.6s ease-out" : undefined,
        }}
      >
        {RINGS.map((ring, ringIdx) => {
          const isCorrect = corrects[ringIdx];
          const selectedLabel = ring.options[selectedIndex(ringIdx)];
          const flash = ringFlash[ringIdx];
          const ringIcon = ring.id === "chars" ? "🔤" : ring.id === "length" ? "📏" : ring.id === "pattern" ? "🎲" : "🔒";
          return (
            <div
              key={ring.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                alignItems: "stretch",
                background: "rgba(15, 21, 48, 0.78)",
                border: `1px solid ${isCorrect ? "#7eff97" : flash === "red" ? "#ff7a59" : "rgba(0, 229, 255, 0.22)"}`,
                borderLeft: `4px solid ${isCorrect ? "#7eff97" : ring.colour}`,
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: flash === "red"
                  ? "0 0 22px rgba(255, 95, 179, 0.6)"
                  : isCorrect
                    ? "0 0 22px rgba(124, 200, 154, 0.45)"
                    : "0 4px 12px -4px rgba(8, 10, 22, 0.45)",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "10px 6px",
                  background: "rgba(4, 5, 13, 0.5)",
                  borderRight: "1px solid rgba(0, 229, 255, 0.15)",
                }}
              >
                <div style={{ fontSize: 22, lineHeight: 1 }}>{ringIcon}</div>
                <div
                  style={{
                    fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#00e5ff",
                    letterSpacing: 2,
                  }}
                >
                  {ring.label}
                </div>
                {isCorrect && <div style={{ color: "#a0ffb0", fontSize: 14 }}>✓</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 10px" }}>
                <button
                  type="button"
                  aria-label={`Previous option for ${ring.label}`}
                  onClick={() => rotate(ringIdx, -1)}
                  disabled={unlocked}
                  style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(0, 229, 255, 0.12)",
                    border: "1px solid rgba(0, 229, 255, 0.4)",
                    color: "#00e5ff",
                    cursor: unlocked ? "default" : "pointer",
                    fontSize: 16, fontWeight: 900, fontFamily: "inherit",
                  }}
                >←</button>
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#e8edff",
                    padding: "0 8px",
                    minHeight: 20,
                    letterSpacing: 0.3,
                    transition: "color 0.25s ease",
                    textShadow: "0 1px 2px rgba(8, 10, 22, 0.4)",
                  }}
                >
                  {selectedLabel}
                </div>
                <button
                  type="button"
                  aria-label={`Next option for ${ring.label}`}
                  onClick={() => rotate(ringIdx, 1)}
                  disabled={unlocked}
                  style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(0, 229, 255, 0.12)",
                    border: "1px solid rgba(0, 229, 255, 0.4)",
                    color: "#00e5ff",
                    cursor: unlocked ? "default" : "pointer",
                    fontSize: 16, fontWeight: 900, fontFamily: "inherit",
                  }}
                >→</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legacy concentric-ring visualisation - kept for reference/rollback,
          hidden so it doesn't render. Remove in a later pass if unused. */}
      <div
        style={{
          display: "none",
          position: "relative",
          width: 520,
          height: 520,
          maxWidth: "100%",
          animation: shakeAll ? "ccShake 0.6s ease-out" : undefined,
        }}
      >
        {/* Rings */}
        {RINGS.map((ring, ringIdx) => {
          const isCorrect = corrects[ringIdx];
          const size = ring.radius * 2;
          const flash = ringFlash[ringIdx];
          const rotation = (offsets[ringIdx] * 360) / ring.options.length;
          return (
            <div
              key={ring.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: size,
                height: size,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `2px solid ${isCorrect ? "#7eff97" : ring.colour}55`,
                  boxShadow: isCorrect
                    ? `0 0 22px ${ring.colour}66, inset 0 0 18px ${ring.colour}44`
                    : `inset 0 0 14px ${ring.colour}33`,
                  animationName: flash === "red" ? "ccRingFlashRed" : undefined,
                  animationDuration: "0.6s",
                  animationTimingFunction: "ease-out",
                  position: "relative",
                  transition:
                    "box-shadow 0.3s ease, border-color 0.3s ease",
                }}
              >
                {/* Rotating label container */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    transform: `rotate(-${rotation}deg)`,
                    transition: "transform 0.35s cubic-bezier(0.4, 1.4, 0.5, 1)",
                  }}
                >
                  {ring.options.map((opt, optIdx) => {
                    const angle = (optIdx * 360) / ring.options.length;
                    const isSelected = optIdx === selectedIndex(ringIdx);
                    return (
                      <div
                        key={opt}
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: 130,
                          transform: `rotate(${angle}deg) translateY(-${
                            ring.radius - 8
                          }px) rotate(${rotation}deg) translateX(-50%)`,
                          textAlign: "center",
                          color: isSelected
                            ? isCorrect
                              ? "#a0ffb0"
                              : ring.colour
                            : "rgba(125,240,255,0.55)",
                          fontSize: 11,
                          fontWeight: isSelected ? 900 : 600,
                          letterSpacing: 0.5,
                          textShadow: isSelected
                            ? `0 0 10px ${ring.colour}`
                            : "none",
                          opacity: isSelected ? 1 : 0.55,
                          transformOrigin: "center",
                        }}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {/* Top marker slot */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -6,
                    transform: "translateX(-50%)",
                    width: 20,
                    height: 14,
                    background: isCorrect ? "#7eff97" : ring.colour,
                    clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                    filter: `drop-shadow(0 0 6px ${ring.colour})`,
                  }}
                />

                {/* Ring label */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -32,
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    letterSpacing: 2,
                    fontWeight: 900,
                    color: ring.colour,
                    textShadow: `0 0 6px ${ring.colour}`,
                  }}
                >
                  {ring.label} {isCorrect && "✓"}
                </div>
              </div>

              {/* Rotation arrows (interactive) */}
              <button
                type="button"
                aria-label={`Rotate ${ring.label} left`}
                onClick={() => rotate(ringIdx, -1)}
                style={{
                  position: "absolute",
                  left: -22,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${ring.colour}22`,
                  border: `2px solid ${ring.colour}`,
                  color: ring.colour,
                  fontWeight: 900,
                  fontSize: 18,
                  cursor: unlocked ? "default" : "pointer",
                  pointerEvents: unlocked ? "none" : "auto",
                  boxShadow: `0 0 10px ${ring.colour}55`,
                }}
              >
                ←
              </button>
              <button
                type="button"
                aria-label={`Rotate ${ring.label} right`}
                onClick={() => rotate(ringIdx, 1)}
                style={{
                  position: "absolute",
                  right: -22,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${ring.colour}22`,
                  border: `2px solid ${ring.colour}`,
                  color: ring.colour,
                  fontWeight: 900,
                  fontSize: 18,
                  cursor: unlocked ? "default" : "pointer",
                  pointerEvents: unlocked ? "none" : "auto",
                  boxShadow: `0 0 10px ${ring.colour}55`,
                }}
              >
                →
              </button>
            </div>
          );
        })}

        {/* Vault door */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 220,
            height: 220,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 30%, #64748b 0%, #334155 40%, #0f1530 80%)",
            boxShadow:
              "0 0 30px rgba(0,0,0,0.6), inset 0 4px 14px rgba(255,255,255,0.15), inset 0 -4px 14px rgba(0,0,0,0.6)",
            overflow: "visible",
          }}
        >
          {/* Door halves (for opening animation) */}
          {unlocked && (
            <>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 80% 50%, #64748b 0%, #334155 55%, #0f1530 100%)",
                  borderRadius: "110px 0 0 110px",
                  animation: "ccDoorOpenLeft 1s ease-out forwards",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 20% 50%, #64748b 0%, #334155 55%, #0f1530 100%)",
                  borderRadius: "0 110px 110px 0",
                  animation: "ccDoorOpenRight 1s ease-out forwards",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
                }}
              />
              {/* Gold light rays */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -30,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(251,191,36,0.3) 40%, transparent 70%)",
                  animation: "ccLightRays 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              {/* Trophy */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "45%",
                  animation: "ccTrophyRise 0.9s cubic-bezier(0.18,1.5,0.4,1) 0.6s both",
                  fontSize: 64,
                  filter: "drop-shadow(0 0 20px rgba(251,191,36,0.8))",
                }}
              >
                🏆
              </div>
            </>
          )}

          {/* Bolts */}
          {!unlocked &&
            boltAngles.map((a, i) => {
              const lit = corrects[i % RINGS.length];
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    transform: `translate(-50%,-50%) translate(${
                      Math.cos(a) * 92
                    }px, ${Math.sin(a) * 92}px)`,
                    background: lit
                      ? "radial-gradient(circle, #a0ffb0, #7eff97 70%, #166534)"
                      : "radial-gradient(circle, rgba(125,240,255,0.55), #334155 70%, #0f1530)",
                    boxShadow: lit
                      ? "0 0 8px rgba(134,239,172,0.8)"
                      : "inset 0 0 4px rgba(0,0,0,0.6)",
                  }}
                />
              );
            })}

          {/* Handle wheel */}
          {!unlocked && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 70,
                height: 70,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 30%, #e8edff, rgba(125,240,255,0.55) 50%, #334155)",
                boxShadow:
                  "0 0 12px rgba(0,0,0,0.6), inset 0 0 8px rgba(0,0,0,0.5)",
                pointerEvents: "none",
              }}
            >
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <span
                  key={deg}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 4,
                    height: 32,
                    marginLeft: -2,
                    marginTop: -16,
                    background: "#3a1a3e",
                    borderRadius: 2,
                    transform: `rotate(${deg}deg)`,
                  }}
                />
              ))}
              {/* Keyhole glow */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, #00e5ff 0%, rgba(0,229,255,0.4) 55%, transparent 80%)",
                  animation: "ccKeyholePulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Unlock button / Victory */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        {!unlocked ? (
          <button
            type="button"
            onClick={attemptUnlock}
            style={{
              background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
              color: "#080a16",
              fontWeight: 900,
              letterSpacing: 2,
              borderRadius: 999,
              padding: "14px 40px",
              fontSize: 17,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow:
                "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.6) inset, 0 -3px 0 rgba(180,80,30,0.45) inset",
            }}
          >
            {attempts === 0 ? "UNLOCK" : "TRY AGAIN"}
          </button>
        ) : (
          <div
            style={{
              animation: "ccFadeIn 0.6s ease-out both",
              padding: "16px 24px",
              background: "rgba(15, 21, 48, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 18,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "rgba(0, 229, 255, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 5,
                color: "#00e5ff",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              ✦ Vault Cracked ✦
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 1,
              }}
            >
              UNLOCKED!
            </div>
            <div style={{ fontSize: 36, margin: "10px 0" }}>
              {"★".repeat(stars)}
              <span style={{ color: "rgba(125, 240, 255, 0.3)" }}>
                {"★".repeat(3 - stars)}
              </span>
            </div>
            <div style={{ color: "#c5cdf0", opacity: 0.8, fontSize: 13, marginBottom: 16, letterSpacing: 1 }}>
              Solved in {attempts} {attempts === 1 ? "attempt" : "attempts"}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  // Phase A done. If we haven't run Phase B yet,
                  // advance into the Defend mini-game. Otherwise (kid
                  // is on the post-Phase-B replay path), continue to
                  // the lesson.
                  if (ctcPhase === "rings") {
                    setCtcPhase("defend");
                  } else {
                    onComplete(stars);
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
                  color: "#080a16",
                  fontWeight: 800,
                  borderRadius: 999,
                  padding: "14px 36px",
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: 0.5,
                  boxShadow:
                    "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.6) inset, 0 -3px 0 rgba(180,80,30,0.45) inset",
                }}
              >
                {ctcPhase === "rings" ? "Defend the Vault →" : "Continue →"}
              </button>
              <button
                type="button"
                onClick={() => { playSound("select"); resetExercise(); }}
                style={{
                  background: "rgba(15, 21, 48, 0.65)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  color: "#c5cdf0",
                  fontWeight: 800,
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: 0.5,
                }}
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── DEFEND PANEL (PHASE B) ─────────────
 * Renders in place of the rings once the kid has cracked the
 * vault. The Hacker Raccoon throws weak guesses at the lock -
 * each card animates in from the side with the guess text + a
 * "why hackers love this" tooltip. Two buttons: REJECT (correct,
 * since every guess is weak) or ALLOW (wrong, demonstrative). */

function DefendPanel({
  guesses,
  guessIdx,
  hits,
  misses,
  feedback,
  done,
  stars,
  ringAttempts,
  onReject,
  onAllow,
  onContinue,
  onRetry,
}: {
  guesses: { text: string; reason: string }[];
  guessIdx: number;
  hits: number;
  misses: number;
  feedback: "hit" | "miss" | null;
  done: boolean;
  stars: number;
  ringAttempts: number;
  onReject: () => void;
  onAllow: () => void;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const total = guesses.length;
  const current = guessIdx < total ? guesses[guessIdx] : null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 560,
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        color: "#e8edff",
        padding: "26px 22px 28px",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
      }}
    >
      {/* Phase 2 tag */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: 800,
            color: "#00e5ff",
            textTransform: "uppercase",
            padding: "4px 14px",
            background: "rgba(8, 10, 22, 0.55)",
            border: "1px solid rgba(0, 229, 255, 0.4)",
            borderRadius: 999,
          }}
        >
          Phase 2 · Defend the Vault
        </span>
      </div>

      {/* HUD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px",
          background: "rgba(8, 10, 22, 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 14,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 18,
        }}
      >
        <span style={{ color: "#a0ffb0" }}>BLOCKED {hits}</span>
        <span style={{ color: "#ff5fb3" }}>SLIPPED {misses}</span>
        <span style={{ color: "#00e5ff" }}>
          {Math.min(guessIdx, total)}/{total}
        </span>
      </div>

      {/* Raccoon attack scene */}
      <div
        style={{
          position: "relative",
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {/* Raccoon on the left */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 64,
            filter: "drop-shadow(0 0 18px rgba(255, 95, 179, 0.55))",
            animation: "ccDefRaccoonHover 2.6s ease-in-out infinite",
          }}
        >
          🦝
        </div>
        {/* Vault on the right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: 18,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 64,
            filter: feedback === "miss"
              ? "drop-shadow(0 0 18px rgba(239, 68, 68, 0.85))"
              : "drop-shadow(0 0 18px rgba(124, 200, 154, 0.55))",
            animation: feedback === "miss"
              ? "ccDefVaultShake 0.4s ease-in-out 2"
              : undefined,
          }}
        >
          🔒
        </div>

        {/* Guess card flying through */}
        {current && (
          <div
            key={`guess-${guessIdx}-${feedback ?? ""}`}
            style={{
              position: "relative",
              minWidth: 240,
              maxWidth: 320,
              padding: "16px 22px",
              borderRadius: 16,
              background:
                "linear-gradient(180deg, rgba(15, 21, 48, 0.9), rgba(4, 5, 13, 0.96))",
              border: feedback === "hit"
                ? "2px solid #7eff97"
                : feedback === "miss"
                ? "2px solid #ef4444"
                : "1px solid rgba(0, 229, 255, 0.5)",
              boxShadow:
                feedback === "hit"
                  ? "0 0 28px rgba(124, 200, 154, 0.55)"
                  : feedback === "miss"
                  ? "0 0 28px rgba(239, 68, 68, 0.55)"
                  : "0 18px 36px -12px rgba(8,10,22,0.7), 0 0 26px rgba(124, 92, 255, 0.32)",
              animation: feedback
                ? undefined
                : "ccDefGuessIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                fontWeight: 800,
                color: "#ff5fb3",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Raccoon tries
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontSize: 22,
                fontWeight: 900,
                color: "#e8edff",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              &quot;{current.text}&quot;
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#c5cdf0",
                opacity: 0.78,
                lineHeight: 1.4,
              }}
            >
              {current.reason}
            </div>
            {feedback === "hit" && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#a0ffb0",
                  letterSpacing: 0.5,
                }}
              >
                BLOCKED! ✓
              </div>
            )}
            {feedback === "miss" && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#ff5fb3",
                  letterSpacing: 0.5,
                }}
              >
                LET THROUGH! ✗
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons or final result */}
      {!done ? (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 14,
              color: "#c5cdf0",
              opacity: 0.92,
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            All these guesses are <strong style={{ color: "#ff5fb3" }}>WEAK</strong>.
            Tap REJECT to block them - fast!
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onReject}
              disabled={feedback !== null}
              style={{
                background: "linear-gradient(135deg, #7eff97, #5eff80)",
                color: "#1f3a25",
                fontWeight: 900,
                borderRadius: 999,
                padding: "13px 32px",
                fontSize: 15,
                letterSpacing: 1.5,
                border: "none",
                cursor: feedback !== null ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: feedback !== null ? 0.6 : 1,
                boxShadow:
                  "0 18px 36px -10px rgba(70,140,90,0.6), 0 0 0 1px rgba(220,255,225,0.5) inset, 0 -3px 0 rgba(60,120,80,0.35) inset",
              }}
            >
              ✋ REJECT
            </button>
            <button
              type="button"
              onClick={onAllow}
              disabled={feedback !== null}
              style={{
                background: "rgba(15, 21, 48, 0.65)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                color: "#c5cdf0",
                fontWeight: 800,
                borderRadius: 999,
                padding: "13px 28px",
                fontSize: 14,
                letterSpacing: 1,
                border: "1px solid rgba(0,229,255,0.35)",
                cursor: feedback !== null ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: feedback !== null ? 0.6 : 1,
              }}
            >
              Allow
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "16px 24px",
            background: "rgba(15, 21, 48, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 18,
            border: "1px solid rgba(0, 229, 255, 0.4)",
            animation: "ccFadeIn 0.6s ease-out both",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 5,
              color: "#00e5ff",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ✦ Vault Defended ✦
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
              fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            }}
          >
            {hits === total ? "FLAWLESS!" : `${hits}/${total} BLOCKED`}
          </div>
          <div style={{ fontSize: 36, margin: "10px 0" }}>
            {"★".repeat(stars)}
            <span style={{ color: "rgba(125, 240, 255, 0.3)" }}>
              {"★".repeat(3 - stars)}
            </span>
          </div>
          <div
            style={{
              color: "#c5cdf0",
              opacity: 0.8,
              fontSize: 13,
              marginBottom: 16,
              letterSpacing: 0.5,
            }}
          >
            Cracked in {ringAttempts} {ringAttempts === 1 ? "attempt" : "attempts"} · Defended {hits}/{total}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onContinue}
              style={{
                background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
                color: "#080a16",
                fontWeight: 800,
                borderRadius: 999,
                padding: "14px 36px",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: 0.5,
                boxShadow:
                  "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.6) inset, 0 -3px 0 rgba(180,80,30,0.45) inset",
              }}
            >
              Continue →
            </button>
            <button
              type="button"
              onClick={onRetry}
              style={{
                background: "rgba(15, 21, 48, 0.65)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                color: "#c5cdf0",
                fontWeight: 700,
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: 14,
                letterSpacing: 1,
                border: "1px solid rgba(0,229,255,0.35)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ccDefGuessIn {
          0%   { opacity: 0; transform: translateX(-60px) scale(0.85); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes ccDefRaccoonHover {
          0%,100% { transform: translateY(-50%) translateX(0); }
          50%     { transform: translateY(-54%) translateX(6px); }
        }
        @keyframes ccDefVaultShake {
          0%,100% { transform: translateY(-50%) translateX(0); }
          25%     { transform: translateY(-50%) translateX(-4px); }
          75%     { transform: translateY(-50%) translateX(4px); }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── SAVED PASSWORD CHIP ─────────────────
 * Surfaces the password the kid built in PasswordLab (Case 3) as a
 * "this is YOUR vault - you set this" chip in the CrackTheCode
 * intro. Pure read-only display; absent when no password was saved. */

function SavedPasswordChip() {
  const [pwd, setPwd] = useState<string | null>(null);
  useEffect(() => {
    try {
      /* Slot-aware: read the saved password under the active slot's
       * key so siblings don't see each other's vault. Falls back to
       * the legacy global key for back-compat with older installs. */
      const id = window.localStorage.getItem("algorithmx-active-slot-v1");
      const namespaced = id
        ? `ax-w1-saved-password::${id}`
        : "ax-w1-saved-password";
      setPwd(
        window.localStorage.getItem(namespaced) ??
          window.localStorage.getItem("ax-w1-saved-password"),
      );
    } catch {
      // Private mode etc - silent fallback
    }
  }, []);
  if (!pwd) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        marginBottom: 18,
        borderRadius: 999,
        background: "rgba(0, 229, 255, 0.12)",
        border: "1px solid rgba(0, 229, 255, 0.55)",
        boxShadow: "0 0 18px rgba(0, 229, 255, 0.25)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 800,
          color: "#7df0ff",
          textTransform: "uppercase",
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        }}
      >
        Your password
      </span>
      <span
        style={{
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontSize: 14,
          fontWeight: 800,
          color: "#e8edff",
          letterSpacing: 1,
        }}
      >
        {pwd}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
  wrongAnswerShake,
} from "@/app/lib/celebrations";

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
    colour: "#60a5fa",
    radius: 230,
  },
  {
    id: "length",
    label: "LENGTH",
    options: ["4 characters", "6 characters", "8 characters", "12+ characters"],
    correct: 3,
    colour: "#22c55e",
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

  const stars = attempts <= 1 ? 3 : attempts === 2 ? 2 : 1;

  const boltAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 620,
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, rgba(168,85,247,0.15), transparent 60%), linear-gradient(180deg, #10102a 0%, #060714 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
        padding: "20px 16px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 3,
          color: "#c4b5fd",
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
          margin: "4px 0 20px",
          background: "linear-gradient(135deg, #a855f7, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Rotate the rings, then UNLOCK
      </div>

      <div
        style={{
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
                  border: `2px solid ${isCorrect ? "#4ade80" : ring.colour}55`,
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
                              ? "#86efac"
                              : ring.colour
                            : "#94a3b8",
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
                    background: isCorrect ? "#4ade80" : ring.colour,
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
              "radial-gradient(circle at 40% 30%, #64748b 0%, #334155 40%, #0f172a 80%)",
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
                    "radial-gradient(circle at 80% 50%, #64748b 0%, #334155 55%, #0f172a 100%)",
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
                    "radial-gradient(circle at 20% 50%, #64748b 0%, #334155 55%, #0f172a 100%)",
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
                      ? "radial-gradient(circle, #86efac, #22c55e 70%, #166534)"
                      : "radial-gradient(circle, #94a3b8, #334155 70%, #0f172a)",
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
                  "radial-gradient(circle at 40% 30%, #e2e8f0, #94a3b8 50%, #334155)",
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
                    background: "#1e293b",
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
                    "radial-gradient(circle, #60a5fa 0%, rgba(96,165,250,0.4) 55%, transparent 80%)",
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
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              color: "#fff",
              fontWeight: 900,
              letterSpacing: 2,
              borderRadius: 14,
              padding: "14px 40px",
              fontSize: 17,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 22px rgba(168,85,247,0.5)",
            }}
          >
            {attempts === 0 ? "UNLOCK" : "TRY AGAIN"}
          </button>
        ) : (
          <div style={{ animation: "ccFadeIn 0.6s ease-out both" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #fde047, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 2,
              }}
            >
              VAULT CRACKED!
            </div>
            <div style={{ fontSize: 36, margin: "10px 0" }}>
              {"★".repeat(stars)}
              <span style={{ color: "rgba(148,163,184,0.4)" }}>
                {"★".repeat(3 - stars)}
              </span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14 }}>
              Solved in {attempts} {attempts === 1 ? "attempt" : "attempts"}
            </div>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onComplete(stars);
              }}
              style={{
                background: "linear-gradient(135deg, #f97316, #f59e0b)",
                color: "#fff",
                fontWeight: 800,
                borderRadius: 14,
                padding: "14px 36px",
                fontSize: 17,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 18px rgba(249,115,22,0.5)",
              }}
            >
              Continue &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

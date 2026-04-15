"use client";

import Image from "next/image";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  bossDefeatedExplosion,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  attackName?: string;
};

type BattleArenaProps = {
  bossName: string;
  bossImage?: string;
  questions: Question[];
  onComplete: (score: number, total: number) => void;
  onBossDefeated?: () => void;
};

type Phase = "intro" | "attack-announce" | "question" | "feedback" | "victory";

const STYLES = `
@keyframes baBossFloat {
  0%,100% { transform: translateY(-4px); }
  50% { transform: translateY(4px); }
}
@keyframes baBossTremor {
  0%,100% { transform: translate(0,0); }
  25% { transform: translate(-1px,1px); }
  50% { transform: translate(1px,-1px); }
  75% { transform: translate(-1px,-1px); }
}
@keyframes baBossHitShake {
  0%,100% { transform: translateX(0); filter: brightness(1); }
  10% { filter: brightness(2.5); }
  20% { transform: translateX(-6px); filter: brightness(1); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
@keyframes baBossDefeat {
  0% { transform: rotate(0) scale(1); opacity: 1; }
  100% { transform: rotate(720deg) scale(0); opacity: 0; }
}
@keyframes baBossIntro {
  0% { transform: translateY(-120%); opacity: 0; }
  60% { transform: translateY(8%); opacity: 1; }
  80% { transform: translateY(-4%); }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes baHPGlowPulse {
  0%,100% { box-shadow: 0 0 12px rgba(239,68,68,0.4); }
  50% { box-shadow: 0 0 22px rgba(239,68,68,0.75); }
}
@keyframes baDamageFloat {
  0% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -36px); }
}
@keyframes baBannerIn {
  0% { transform: translateX(100%); opacity: 0; }
  20% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
}
@keyframes baCardEnter {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
@keyframes baWavePulse {
  0% { transform: translate(-50%, 0) scale(0.2); opacity: 0.7; }
  100% { transform: translate(-50%, 80vh) scale(3); opacity: 0; }
}
@keyframes baCardShake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
@keyframes baComboPop {
  0% { opacity: 0; transform: translateX(-50%) scale(0.6); }
  60% { opacity: 1; transform: translateX(-50%) scale(1.15); }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
}
@keyframes baIntroPulse {
  0%,100% { opacity: 0.65; }
  50% { opacity: 1; }
}
@keyframes baVictoryIn {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}
`;

function FallbackRaccoon({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="baRacFace" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="100%" stopColor="#1f2937" />
        </radialGradient>
      </defs>
      {/* ears */}
      <circle cx="32" cy="28" r="14" fill="#1f2937" stroke="#111827" strokeWidth="2" />
      <circle cx="88" cy="28" r="14" fill="#1f2937" stroke="#111827" strokeWidth="2" />
      <circle cx="32" cy="28" r="7" fill="#111827" />
      <circle cx="88" cy="28" r="7" fill="#111827" />
      {/* head */}
      <ellipse cx="60" cy="66" rx="42" ry="38" fill="url(#baRacFace)" />
      {/* mask */}
      <ellipse cx="42" cy="62" rx="16" ry="11" fill="#0a0a0a" />
      <ellipse cx="78" cy="62" rx="16" ry="11" fill="#0a0a0a" />
      {/* eyes */}
      <circle cx="42" cy="62" r="5" fill="#ef4444" />
      <circle cx="78" cy="62" r="5" fill="#ef4444" />
      <circle cx="43.5" cy="60.5" r="1.5" fill="#fff" />
      <circle cx="79.5" cy="60.5" r="1.5" fill="#fff" />
      {/* nose */}
      <ellipse cx="60" cy="78" rx="5" ry="4" fill="#111" />
      {/* snout highlight */}
      <path d="M52 88 Q60 94 68 88" stroke="#111" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* white muzzle */}
      <path d="M60 82 Q55 92 60 96 Q65 92 60 82" fill="#d1d5db" opacity="0.25" />
    </svg>
  );
}

let styleInjected = false;
function ensureStyles() {
  if (typeof document === "undefined" || styleInjected) return;
  const el = document.createElement("style");
  el.id = "ax-battle-arena-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  styleInjected = true;
}

export default function BattleArena({
  bossName,
  bossImage,
  questions,
  onComplete,
  onBossDefeated,
}: BattleArenaProps) {
  const total = Math.max(1, questions.length);
  const [phase, setPhase] = useState<Phase>("intro");
  const [bossHP, setBossHP] = useState(total);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  // Keys to retrigger animations (increment to replay)
  const [bossHitKey, setBossHitKey] = useState(0);
  const [damageKey, setDamageKey] = useState(0);
  const [attackWaveKey, setAttackWaveKey] = useState(0);
  const [bannerKey, setBannerKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeFiredRef = useRef(false);
  const defeatFiredRef = useRef(false);

  useEffect(() => {
    ensureStyles();
  }, []);

  // Intro → first attack announcement
  useEffect(() => {
    if (phase !== "intro") return;
    playSound("boss-appear");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBannerKey((k) => k + 1);
      setPhase("attack-announce");
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // Attack announcement → question
  useEffect(() => {
    if (phase !== "attack-announce") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase("question");
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // Victory → onBossDefeated + completion callback
  useEffect(() => {
    if (phase !== "victory") return;
    if (!defeatFiredRef.current) {
      defeatFiredRef.current = true;
      playSound("boss-defeated");
      void bossDefeatedExplosion();
      onBossDefeated?.();
    }
  }, [phase, onBossDefeated]);

  const currentQ = questions[qIdx % total];
  const bossLowHP = bossHP > 0 && bossHP / total < 0.25;
  const bossDefeatedAnim = phase === "victory";

  const handleSelect = useCallback(
    (i: number) => {
      if (selected !== null) return; // lock after first pick
      const correct = i === currentQ.correctIndex;
      setSelected(i);
      setPhase("feedback");

      if (correct) {
        playSound("boss-hit");
        void correctAnswerBurst();
        const newHP = Math.max(0, bossHP - 1);
        setBossHP(newHP);
        setScore((s) => s + 1);
        setCombo((c) => c + 1);
        setBossHitKey((k) => k + 1);
        setDamageKey((k) => k + 1);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (newHP <= 0) {
            setPhase("victory");
            if (!completeFiredRef.current) {
              completeFiredRef.current = true;
              // Score reported against the original question count
              onComplete(score + 1, total);
            }
            return;
          }
          // Advance to next attack
          setSelected(null);
          setQIdx((idx) => idx + 1);
          setBannerKey((k) => k + 1);
          setPhase("attack-announce");
        }, 1000);
      } else {
        playSound("wrong");
        wrongAnswerShake();
        setCombo(0);
        setAttackWaveKey((k) => k + 1);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setSelected(null);
          setQIdx((idx) => idx + 1);
          setBannerKey((k) => k + 1);
          setPhase("attack-announce");
        }, 1000);
      }
    },
    [selected, currentQ, bossHP, score, total, onComplete],
  );

  const arenaBorderColor =
    phase === "intro"
      ? "rgba(148,163,184,0.15)"
      : "rgba(239,68,68,0.28)";

  const bossAnimation = bossDefeatedAnim
    ? "baBossDefeat 1.2s cubic-bezier(0.5,0,0.75,0) forwards"
    : phase === "intro"
      ? "baBossIntro 0.9s cubic-bezier(0.25,0.9,0.3,1.1) both"
      : bossLowHP
        ? "baBossFloat 2s ease-in-out infinite, baBossTremor 0.2s ease-in-out infinite"
        : "baBossFloat 2s ease-in-out infinite";

  const hpPct = Math.max(0, (bossHP / total) * 100);
  const hpGlowAnim = bossLowHP
    ? "baHPGlowPulse 0.8s ease-in-out infinite"
    : undefined;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        background: "#0d1220",
        border: `1px solid ${arenaBorderColor}`,
        boxShadow:
          phase === "intro"
            ? "0 10px 30px rgba(0,0,0,0.35)"
            : "0 10px 30px rgba(0,0,0,0.4), 0 0 24px rgba(239,68,68,0.1)",
        transition: "border-color 0.8s, box-shadow 0.8s",
        fontFamily: "'Nunito', sans-serif",
        color: "#f1f5f9",
        position: "relative",
      }}
    >
      {/* ── Boss area (top, ~40%) ── */}
      <div
        style={{
          position: "relative",
          padding: "28px 24px 20px",
          background:
            "radial-gradient(ellipse at center, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.01) 60%, transparent 100%), linear-gradient(180deg, rgba(239,68,68,0.05), transparent 80%)",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {phase === "intro" && (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              top: 16,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "'Fredoka', 'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: "#ef4444",
              letterSpacing: "-0.02em",
              animation: "baIntroPulse 1.2s ease-in-out infinite",
            }}
          >
            ⚠️ BOSS BATTLE
          </div>
        )}

        {/* Boss sprite */}
        <div
          key={`boss-${bossHitKey}-${phase}`}
          style={{
            position: "relative",
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: bossHitKey
              ? `baBossHitShake 0.3s ease, ${bossAnimation}`
              : bossAnimation,
            willChange: "transform, filter, opacity",
          }}
        >
          {bossImage ? (
            <Image
              src={bossImage}
              alt={bossName}
              width={120}
              height={120}
              style={{ objectFit: "contain", borderRadius: 16 }}
            />
          ) : (
            <FallbackRaccoon size={120} />
          )}

          {damageKey > 0 && (
            <div
              key={`dmg-${damageKey}`}
              style={{
                position: "absolute",
                top: -8,
                left: "50%",
                transform: "translateX(-50%)",
                color: "#ef4444",
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                textShadow: "0 0 10px rgba(239,68,68,0.55)",
                animation: "baDamageFloat 0.8s ease-out forwards",
                pointerEvents: "none",
              }}
              aria-hidden
            >
              -1 HP
            </div>
          )}
        </div>

        {/* HP bar */}
        <div style={{ width: "100%", maxWidth: 560, marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 6,
              color: "#f1f5f9",
              letterSpacing: "0.02em",
            }}
          >
            <span>{bossName}</span>
            <span style={{ color: "#fca5a5" }}>
              HP: {bossHP}/{total}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 16,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${hpPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ef4444, #f97316)",
                borderRadius: 999,
                transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: "0 0 12px rgba(239,68,68,0.4)",
                animation: hpGlowAnim,
              }}
            />
          </div>
        </div>

        {/* Attack wave (fires on wrong answer) */}
        {attackWaveKey > 0 && (
          <div
            key={`wave-${attackWaveKey}`}
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.25)",
              pointerEvents: "none",
              animation: "baWavePulse 1s ease-out forwards",
              willChange: "transform, opacity",
            }}
          />
        )}
      </div>

      {/* ── Attack announcement banner ── */}
      {phase === "attack-announce" && currentQ && (
        <div
          key={`banner-${bannerKey}`}
          style={{
            margin: "0 20px 14px",
            padding: "14px 18px",
            background: "rgba(239,68,68,0.12)",
            borderLeft: "4px solid #ef4444",
            borderRadius: 12,
            color: "#fecaca",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            animation: "baBannerIn 1.5s ease-out both",
            willChange: "transform, opacity",
          }}
        >
          🦝 {currentQ.attackName || "Raccoon Attack!"}
        </div>
      )}

      {/* ── Defence zone (bottom, ~60%) ── */}
      <div style={{ padding: "8px 24px 28px", position: "relative" }}>
        {/* Combo badge */}
        {combo >= 2 && (phase === "question" || phase === "feedback") && (
          <div
            key={`combo-${combo}`}
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              background:
                combo >= 3
                  ? "linear-gradient(135deg, #f59e0b, #f97316)"
                  : "rgba(245,158,11,0.15)",
              color: combo >= 3 ? "#fff" : "#f59e0b",
              border: combo >= 3 ? "none" : "1px solid rgba(245,158,11,0.4)",
              borderRadius: 999,
              padding: combo >= 3 ? "6px 16px" : "5px 12px",
              fontFamily: "'Fredoka', 'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: combo >= 3 ? 16 : 13,
              boxShadow:
                combo >= 3
                  ? "0 0 22px rgba(245,158,11,0.6), 0 6px 16px rgba(0,0,0,0.3)"
                  : "0 4px 12px rgba(0,0,0,0.3)",
              animation: "baComboPop 0.35s cubic-bezier(0.2,1.5,0.4,1) both",
              pointerEvents: "none",
            }}
          >
            🔥 x{combo} COMBO!
          </div>
        )}

        {phase === "victory" ? (
          <VictoryPanel
            score={score}
            total={total}
            onContinue={() => {
              // Parent controls flow via onComplete fired earlier; keep button as a no-op surface
              // If consumers want another hook, they can observe onBossDefeated/onComplete.
            }}
          />
        ) : phase === "intro" ? (
          <div style={{ textAlign: "center", padding: "12px 0 6px", color: "#94a3b8", fontSize: 14 }}>
            Get ready…
          </div>
        ) : currentQ ? (
          <>
            {/* Question shield-terminal */}
            <div
              style={{
                background: "rgba(96,165,250,0.06)",
                border: "1px solid rgba(96,165,250,0.15)",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 17, lineHeight: 1.5, margin: 0, color: "#f1f5f9" }}>
                {currentQ.question}
              </p>
            </div>

            {/* Options grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {currentQ.options.map((opt, i) => {
                const isSelected = selected === i;
                const isTheCorrect = i === currentQ.correctIndex;
                const locked = selected !== null;
                const inFeedback = phase === "feedback";

                let borderColor = "rgba(255,255,255,0.08)";
                let extraShadow = "none";
                let opacity = 1;
                let shakeAnim: string | undefined;

                if (inFeedback) {
                  if (isSelected && isTheCorrect) {
                    borderColor = "#34d399";
                    extraShadow = "0 0 20px rgba(52,211,153,0.4)";
                  } else if (isSelected && !isTheCorrect) {
                    borderColor = "#ef4444";
                    extraShadow = "0 0 20px rgba(239,68,68,0.4)";
                    shakeAnim = "baCardShake 0.3s ease";
                  } else {
                    opacity = 0.3;
                  }
                }

                const cardStyle: CSSProperties = {
                  position: "relative",
                  background: "#111827",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: "16px 20px",
                  cursor: locked ? "default" : "pointer",
                  color: "#f1f5f9",
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: "left",
                  transition:
                    "border-color 0.25s, transform 0.25s, box-shadow 0.25s, opacity 0.25s",
                  boxShadow: extraShadow,
                  opacity,
                  animation: !inFeedback
                    ? `baCardEnter 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`
                    : shakeAnim,
                  willChange: "transform, opacity, box-shadow",
                  minWidth: 0,
                };

                return (
                  <button
                    key={`${qIdx}-${i}`}
                    type="button"
                    disabled={locked}
                    onClick={() => handleSelect(i)}
                    onMouseEnter={(e) => {
                      if (locked) return;
                      e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      if (locked) return;
                      e.currentTarget.style.borderColor = borderColor;
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = extraShadow;
                    }}
                    style={cardStyle}
                  >
                    {opt}
                    {inFeedback && isSelected && isTheCorrect && (
                      <span
                        style={{
                          position: "absolute",
                          top: -10,
                          right: -6,
                          background: "#34d399",
                          color: "#0d1220",
                          fontFamily: "'Fredoka', 'Nunito', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          padding: "3px 10px",
                          borderRadius: 999,
                          boxShadow: "0 0 14px rgba(52,211,153,0.6)",
                        }}
                      >
                        BLOCKED!
                      </span>
                    )}
                    {inFeedback && isSelected && !isTheCorrect && (
                      <span
                        style={{
                          position: "absolute",
                          top: -10,
                          right: -6,
                          background: "#ef4444",
                          color: "#fff",
                          fontFamily: "'Fredoka', 'Nunito', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          padding: "3px 10px",
                          borderRadius: 999,
                          boxShadow: "0 0 14px rgba(239,68,68,0.6)",
                        }}
                      >
                        FAILED TO BLOCK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function VictoryPanel({
  score,
  total,
  onContinue,
}: {
  score: number;
  total: number;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "18px 8px 4px",
        animation: "baVictoryIn 0.6s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <h3
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 32,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        🎉 BOSS DEFEATED!
      </h3>
      <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 15 }}>
        {score}/{total} attacks blocked!
      </p>
      <button
        type="button"
        onClick={onContinue}
        style={{
          padding: "14px 32px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(249,115,22,0.4)",
          letterSpacing: "0.01em",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

export type { BattleArenaProps, Question };

"use client";

/*
 * BattleArena — Pixar 2.5D climactic showdown.
 *
 * Storm palette during the fight (heavy purple sky with coral light
 * breaking through), golden sunrise during victory. Hero on the left
 * facing a Hacker Raccoon on the right. Parchment battle banners,
 * gold-vs-ember health bars, gold burst on hits, ember flash on
 * fails. Game logic preserved.
 */

import Image from "next/image";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  bossDefeatedExplosion,
} from "@/app/lib/celebrations";
import { playSound, playBGM, stopBGM } from "@/app/lib/sounds";
import {
  COLOR,
  SHADOW,
  SPRING,
  FONT_STACK,
} from "@/app/components/scene/tokens";
import {
  DistantRidges,
  FloatingParticles,
  PixarFinishOverlay,
  StarField,
  SunsetBackdrop,
} from "@/app/components/scene";

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
  10% { filter: brightness(2.2) sepia(0.4); }
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
@keyframes baHeroFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes baHPGlowPulse {
  0%,100% { box-shadow: 0 0 12px rgba(196, 81, 58, 0.45); }
  50% { box-shadow: 0 0 22px rgba(196, 81, 58, 0.8); }
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
  0%,100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes baLightning {
  0%,93%,100% { opacity: 0; }
  94% { opacity: 0.65; }
  96% { opacity: 0.2; }
  98% { opacity: 0.55; }
}
@keyframes baHaloSpin {
  to { transform: rotate(360deg); }
}
@keyframes baVictoryHeroBob {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
`;

function FallbackRaccoon({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="baRacFace" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#5a2a48" />
          <stop offset="100%" stopColor="#2a0d2e" />
        </radialGradient>
      </defs>
      {/* ears */}
      <circle cx="32" cy="28" r="14" fill="#2a0d2e" stroke="#1a0612" strokeWidth="2" />
      <circle cx="88" cy="28" r="14" fill="#2a0d2e" stroke="#1a0612" strokeWidth="2" />
      <circle cx="32" cy="28" r="7" fill="#1a0612" />
      <circle cx="88" cy="28" r="7" fill="#1a0612" />
      {/* head */}
      <ellipse cx="60" cy="66" rx="42" ry="38" fill="url(#baRacFace)" />
      {/* mask */}
      <ellipse cx="42" cy="62" rx="16" ry="11" fill="#0a0410" />
      <ellipse cx="78" cy="62" rx="16" ry="11" fill="#0a0410" />
      {/* eyes — ember red, not horror red */}
      <circle cx="42" cy="62" r="5" fill="#f08e7e" />
      <circle cx="78" cy="62" r="5" fill="#f08e7e" />
      <circle cx="43.5" cy="60.5" r="1.5" fill="#fff7e6" />
      <circle cx="79.5" cy="60.5" r="1.5" fill="#fff7e6" />
      {/* nose */}
      <ellipse cx="60" cy="78" rx="5" ry="4" fill="#1a0612" />
      {/* snout outline */}
      <path d="M52 88 Q60 94 68 88" stroke="#1a0612" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 82 Q55 92 60 96 Q65 92 60 82" fill="#fde2b5" opacity="0.3" />
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
    playSound("bossRoar");
    playBGM("bgmBattle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBannerKey((k) => k + 1);
      setPhase("attack-announce");
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // Stop battle BGM on unmount
  useEffect(() => {
    return () => {
      stopBGM(400);
    };
  }, []);

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
      stopBGM(400);
      playSound("bossDefeated");
      window.setTimeout(() => {
        playSound("victory");
        playBGM("bgmVictory");
      }, 500);
      void bossDefeatedExplosion();
      onBossDefeated?.();
    }
  }, [phase, onBossDefeated]);

  const currentQ = questions[qIdx % total];
  const bossLowHP = bossHP > 0 && bossHP / total < 0.25;
  const bossDefeatedAnim = phase === "victory";

  const handleSelect = useCallback(
    (i: number) => {
      if (selected !== null) return;
      const correct = i === currentQ.correctIndex;
      setSelected(i);
      setPhase("feedback");

      if (correct) {
        playSound("heroAttack");
        playSound("hitImpact");
        playSound("bossHurt");
        void correctAnswerBurst();
        const newHP = Math.max(0, bossHP - 1);
        setBossHP(newHP);
        setScore((s) => s + 1);
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo === 3) playSound("streak3");
        else if (newCombo === 5) playSound("streak5");
        else if (newCombo >= 7 && newCombo % 2 === 1) playSound("streak7");
        setBossHitKey((k) => k + 1);
        setDamageKey((k) => k + 1);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (newHP <= 0) {
            setPhase("victory");
            if (!completeFiredRef.current) {
              completeFiredRef.current = true;
              onComplete(score + 1, total);
            }
            return;
          }
          setSelected(null);
          setQIdx((idx) => idx + 1);
          setBannerKey((k) => k + 1);
          setPhase("attack-announce");
        }, 1000);
      } else {
        playSound("wrong");
        playSound("bossAttack");
        playSound("hitImpact");
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
    [selected, currentQ, bossHP, score, total, combo, onComplete],
  );

  const bossAnimation = bossDefeatedAnim
    ? "baBossDefeat 1.2s cubic-bezier(0.5,0,0.75,0) forwards"
    : phase === "intro"
      ? "baBossIntro 0.9s cubic-bezier(0.25,0.9,0.3,1.1) both"
      : bossLowHP
        ? "baBossFloat 2.4s ease-in-out infinite, baBossTremor 0.18s ease-in-out infinite"
        : "baBossFloat 2.4s ease-in-out infinite";

  const hpPct = Math.max(0, (bossHP / total) * 100);
  const hpGlowAnim = bossLowHP
    ? "baHPGlowPulse 0.8s ease-in-out infinite"
    : undefined;
  const heroHpPct = Math.max(0, ((total - (total - score - (qIdx - score))) / total) * 100);
  // Hero "wellbeing" bar — drains slightly with each wrong answer.
  const wrongCount = qIdx - score;
  const heroPct = Math.max(0, ((total - wrongCount) / total) * 100);
  void heroHpPct;

  const isVictory = phase === "victory";
  const variant = isVictory ? "golden" : "storm";

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 900,
        margin: "0 auto",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: SHADOW.sceneFrame,
        fontFamily: FONT_STACK,
        color: COLOR.cream,
        minHeight: "min(82vh, 760px)",
      }}
    >
      {/* Atmosphere — storm during fight, golden after */}
      <SunsetBackdrop variant={variant} parallax={{ x: 0, y: 0 }} showSun={!isVictory} />
      <DistantRidges variant={variant} parallax={{ x: 0, y: 0 }} />
      <StarField count={isVictory ? 30 : 50} />
      <FloatingParticles count={isVictory ? 50 : 28} />

      {/* Lightning (warm gold streaks) — subtle, periodic */}
      {!isVictory && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 30% 18%, rgba(255, 220, 130, 0.22) 0%, transparent 55%)," +
              "radial-gradient(ellipse at 75% 22%, rgba(255, 178, 110, 0.18) 0%, transparent 50%)",
            mixBlendMode: "screen",
            animation: "baLightning 6.5s ease-in-out infinite",
          }}
        />
      )}

      {/* Top status row — Hero banner (left) + Villain banner (right) */}
      {!isVictory && (
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            right: 18,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            zIndex: 8,
            pointerEvents: "none",
          }}
        >
          <HeroBanner pct={heroPct} />
          <VillainBanner
            name={bossName}
            hp={bossHP}
            total={total}
            hpPct={hpPct}
            hpGlowAnim={hpGlowAnim}
            lowHP={bossLowHP}
          />
        </div>
      )}

      {/* Main arena content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          minHeight: "min(82vh, 760px)",
          display: "flex",
          flexDirection: "column",
          padding: "92px 24px 28px",
        }}
      >
        {/* Showdown stage — hero left, raccoon right */}
        {!isVictory && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flex: 1,
              maxHeight: 240,
              position: "relative",
            }}
          >
            <HeroPortrait phase={phase} />

            {/* Centre — attack announcement banner */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                minHeight: 120,
              }}
            >
              {phase === "intro" && (
                <div
                  aria-live="polite"
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 5,
                    color: "#ffd58a",
                    textTransform: "uppercase",
                    padding: "6px 18px",
                    background: "rgba(40, 18, 38, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "rgba(255, 220, 180, 0.45)",
                    borderRadius: 999,
                    animation: "baIntroPulse 1.2s ease-in-out infinite",
                  }}
                >
                  ✦ Boss Battle ✦
                </div>
              )}
              {phase === "attack-announce" && currentQ && (
                <div
                  key={`banner-${bannerKey}`}
                  style={{
                    padding: "12px 24px",
                    background:
                      "linear-gradient(135deg, rgba(196, 81, 58, 0.85), rgba(122, 58, 82, 0.85))",
                    borderStyle: "solid",
                    borderWidth: 2,
                    borderColor: "rgba(244, 168, 154, 0.6)",
                    borderRadius: 14,
                    color: "#fff7e6",
                    fontWeight: 800,
                    fontSize: 18,
                    letterSpacing: 0.5,
                    animation: "baBannerIn 1.5s ease-out both",
                    willChange: "transform, opacity",
                    textShadow: "0 2px 6px rgba(20, 6, 12, 0.6)",
                    boxShadow:
                      "0 14px 28px -8px rgba(80, 20, 30, 0.6), 0 0 28px rgba(244, 168, 154, 0.3)",
                  }}
                >
                  🦝 {currentQ.attackName || "Raccoon Attack!"}
                </div>
              )}
            </div>

            <BossPortrait
              bossImage={bossImage}
              bossName={bossName}
              bossAnimation={bossAnimation}
              bossHitKey={bossHitKey}
              damageKey={damageKey}
              attackWaveKey={attackWaveKey}
              bossDefeated={bossDefeatedAnim}
              lowHP={bossLowHP}
            />
          </div>
        )}

        {/* Defence zone — question card + answer pills, OR victory */}
        <div style={{ position: "relative", marginTop: isVictory ? 0 : 18, flex: 1 }}>
          {combo >= 2 && (phase === "question" || phase === "feedback") && (
            <div
              key={`combo-${combo}`}
              style={{
                position: "absolute",
                top: -22,
                left: "50%",
                transform: "translateX(-50%)",
                background:
                  combo >= 3
                    ? "linear-gradient(135deg, #ffd58a, #ff9b4a)"
                    : "rgba(255, 220, 168, 0.22)",
                color: combo >= 3 ? "#3a1a06" : "#ffd58a",
                borderStyle: "solid",
                borderWidth: combo >= 3 ? 0 : 1,
                borderColor: "rgba(255, 215, 138, 0.5)",
                borderRadius: 999,
                padding: combo >= 3 ? "6px 18px" : "5px 14px",
                fontWeight: 800,
                fontSize: combo >= 3 ? 16 : 13,
                letterSpacing: 0.3,
                boxShadow:
                  combo >= 3
                    ? "0 0 22px rgba(255, 178, 110, 0.65), 0 6px 16px rgba(40, 18, 8, 0.4)"
                    : "0 4px 12px rgba(40, 18, 8, 0.3)",
                animation: "baComboPop 0.35s cubic-bezier(0.2,1.5,0.4,1) both",
                pointerEvents: "none",
                zIndex: 9,
              }}
            >
              🔥 x{combo} COMBO!
            </div>
          )}

          {isVictory ? (
            <PixarFinishOverlay
              badge="Hacker Defeated"
              title="YOU WON!"
              subline={`${score}/${total} attacks blocked · Adam & Layla are safe!`}
              stars={
                score === total
                  ? 3
                  : score >= Math.ceil(total * 0.7)
                    ? 2
                    : 1
              }
              onContinue={() => {
                /* Parent flow continues via onComplete already fired */
              }}
              continueLabel="Claim Reward →"
            />
          ) : phase === "intro" ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: "#ffe9c8",
                fontSize: 14,
                opacity: 0.85,
                letterSpacing: 1,
              }}
            >
              Get ready…
            </div>
          ) : currentQ ? (
            <>
              {/* Question parchment plaque */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 245, 215, 0.96) 0%, rgba(253, 226, 181, 0.96) 100%)",
                  borderStyle: "solid",
                  borderWidth: 1,
                  borderColor: "rgba(196, 115, 64, 0.55)",
                  borderRadius: 18,
                  padding: "20px 26px",
                  marginBottom: 18,
                  boxShadow:
                    "0 18px 40px -12px rgba(40, 18, 8, 0.5), inset 0 0 0 4px rgba(255, 245, 215, 0.85), inset 0 0 0 5px rgba(196, 115, 64, 0.35)",
                }}
              >
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.5,
                    margin: 0,
                    color: COLOR.inkDeep,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {currentQ.question}
                </p>
              </div>

              {/* Answer pills */}
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

                  let borderColor = "rgba(255, 220, 180, 0.35)";
                  let extraShadow =
                    "0 6px 18px -8px rgba(40, 18, 8, 0.5)";
                  let opacity = 1;
                  let shakeAnim: string | undefined;
                  let glow: string | null = null;

                  if (inFeedback) {
                    if (isSelected && isTheCorrect) {
                      borderColor = "#7cc89a";
                      extraShadow = "0 0 24px rgba(124, 200, 154, 0.55)";
                      glow = "rgba(124, 200, 154, 0.55)";
                    } else if (isSelected && !isTheCorrect) {
                      borderColor = "#c4513a";
                      extraShadow = "0 0 24px rgba(196, 81, 58, 0.55)";
                      shakeAnim = "baCardShake 0.3s ease";
                      glow = "rgba(196, 81, 58, 0.55)";
                    } else {
                      opacity = 0.35;
                    }
                  }

                  const cardStyle: CSSProperties = {
                    position: "relative",
                    background:
                      "linear-gradient(180deg, rgba(255, 245, 215, 0.94) 0%, rgba(253, 226, 181, 0.94) 100%)",
                    borderStyle: "solid",
                    borderWidth: 2,
                    borderColor,
                    borderRadius: 999,
                    padding: "14px 22px",
                    cursor: locked ? "default" : "pointer",
                    color: COLOR.inkDeep,
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: "center",
                    transition:
                      "border-color 0.25s, transform 0.25s, box-shadow 0.25s, opacity 0.25s",
                    boxShadow: extraShadow,
                    opacity,
                    animation: !inFeedback
                      ? `baCardEnter 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`
                      : shakeAnim,
                    willChange: "transform, opacity, box-shadow",
                    minWidth: 0,
                    fontFamily: "inherit",
                  };

                  return (
                    <motion.button
                      key={`${qIdx}-${i}`}
                      type="button"
                      disabled={locked}
                      onClick={() => handleSelect(i)}
                      whileHover={!locked ? { y: -3, scale: 1.03 } : undefined}
                      whileTap={!locked ? { scale: 0.97, y: 1 } : undefined}
                      transition={SPRING.snappy}
                      style={cardStyle}
                    >
                      {opt}
                      {inFeedback && isSelected && isTheCorrect && (
                        <span
                          style={{
                            position: "absolute",
                            top: -10,
                            right: 12,
                            background: "#4a9a6a",
                            color: "#fff7e6",
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: 1.5,
                            padding: "3px 12px",
                            borderRadius: 999,
                            boxShadow: glow ? `0 0 14px ${glow}` : undefined,
                            fontFamily: "inherit",
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
                            right: 12,
                            background: "#c4513a",
                            color: "#fff7e6",
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: 1.5,
                            padding: "3px 12px",
                            borderRadius: 999,
                            boxShadow: glow ? `0 0 14px ${glow}` : undefined,
                            fontFamily: "inherit",
                          }}
                        >
                          OUCH!
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── HERO BANNER ───────────────────────── */

function HeroBanner({ pct }: { pct: number }) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: 280,
        padding: "8px 14px",
        background: "rgba(40, 18, 38, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(255, 220, 180, 0.45)",
        borderRadius: 14,
        boxShadow:
          "0 10px 24px -8px rgba(20, 6, 12, 0.5), 0 0 18px rgba(255, 200, 110, 0.25) inset",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🛡</span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: 3,
            fontWeight: 800,
            color: "#ffd58a",
            textTransform: "uppercase",
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          }}
        >
          Cyber Hero
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(20, 6, 12, 0.55)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #fff5cc, #ffd158, #ff9b4a)",
            borderRadius: 999,
            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 0 12px rgba(255, 200, 110, 0.55)",
          }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────── VILLAIN BANNER ───────────────────────── */

function VillainBanner({
  name,
  hp,
  total,
  hpPct,
  hpGlowAnim,
  lowHP,
}: {
  name: string;
  hp: number;
  total: number;
  hpPct: number;
  hpGlowAnim?: string;
  lowHP: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: 280,
        padding: "8px 14px",
        background: "rgba(40, 18, 38, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(196, 115, 64, 0.55)",
        borderRadius: 14,
        boxShadow:
          "0 10px 24px -8px rgba(20, 6, 12, 0.5), 0 0 18px rgba(196, 81, 58, 0.25) inset",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: 3,
            fontWeight: 800,
            color: "#f4a89a",
            textTransform: "uppercase",
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          }}
        >
          {name}
        </span>
        <span style={{ fontSize: 11, color: "#fff7e6", fontWeight: 700, opacity: 0.85 }}>
          {hp}/{total}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(20, 6, 12, 0.55)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${hpPct}%`,
            height: "100%",
            background: lowHP
              ? "linear-gradient(90deg, #c4513a, #f08e7e)"
              : "linear-gradient(90deg, #c4513a, #e89938, #ffd158)",
            borderRadius: 999,
            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 0 12px rgba(196, 81, 58, 0.5)",
            animation: hpGlowAnim,
          }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────── HERO PORTRAIT ───────────────────────── */

function HeroPortrait({ phase }: { phase: Phase }) {
  void phase;
  return (
    <div
      style={{
        position: "relative",
        width: 130,
        height: 130,
        flexShrink: 0,
        animation: "baHeroFloat 2.6s ease-in-out infinite",
      }}
    >
      {/* Halo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -22,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 138, 0.55) 60deg, transparent 120deg, rgba(255, 178, 110, 0.45) 200deg, transparent 280deg, rgba(255, 220, 130, 0.5) 340deg, transparent 360deg)",
          filter: "blur(10px)",
          animation: "baHaloSpin 14s linear infinite",
          opacity: 0.7,
        }}
      />
      {/* Disc */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#fde2b5",
          boxShadow:
            "0 0 0 5px rgba(255, 230, 190, 0.85), 0 0 0 7px rgba(140, 70, 30, 0.6), 0 18px 36px -10px rgba(20, 6, 12, 0.7), 0 0 30px rgba(255, 178, 110, 0.5)",
        }}
      >
        <div
          role="img"
          aria-label="Cyber Hero"
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: "url(/characters/heroic.png)",
            backgroundSize: "180% auto",
            backgroundPosition: "center 18%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      {/* Name plate */}
      <div
        style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "3px 14px",
          background: "rgba(40, 18, 38, 0.85)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(255, 220, 180, 0.55)",
          borderRadius: 999,
          color: "#ffe9c8",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.5,
        }}
      >
        HERO
      </div>
    </div>
  );
}

/* ───────────────────────── BOSS PORTRAIT ───────────────────────── */

function BossPortrait({
  bossImage,
  bossName,
  bossAnimation,
  bossHitKey,
  damageKey,
  attackWaveKey,
  bossDefeated,
  lowHP,
}: {
  bossImage?: string;
  bossName: string;
  bossAnimation: string;
  bossHitKey: number;
  damageKey: number;
  attackWaveKey: number;
  bossDefeated: boolean;
  lowHP: boolean;
}) {
  void bossDefeated;
  void lowHP;
  return (
    <div
      key={`boss-${bossHitKey}-anim`}
      style={{
        position: "relative",
        width: 140,
        height: 140,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: bossHitKey
          ? `baBossHitShake 0.3s ease, ${bossAnimation}`
          : bossAnimation,
        willChange: "transform, filter, opacity",
      }}
    >
      {/* Ember halo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -18,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(196, 81, 58, 0.45) 0%, rgba(196, 81, 58, 0.15) 50%, transparent 75%)",
          filter: "blur(10px)",
        }}
      />
      {/* Disc frame */}
      <div
        style={{
          position: "relative",
          width: 130,
          height: 130,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#3a1a3e",
          boxShadow:
            "0 0 0 5px rgba(196, 115, 64, 0.7), 0 0 0 7px rgba(122, 58, 82, 0.85), 0 18px 36px -10px rgba(20, 6, 12, 0.75), 0 0 28px rgba(196, 81, 58, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {bossImage ? (
          <Image
            src={bossImage}
            alt={bossName}
            width={120}
            height={120}
            style={{
              objectFit: "cover",
              width: "180%",
              height: "auto",
              objectPosition: "center 18%",
            }}
          />
        ) : (
          <FallbackRaccoon size={120} />
        )}
      </div>
      {damageKey > 0 && (
        <div
          key={`dmg-${damageKey}`}
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#ffd58a",
            fontWeight: 800,
            fontSize: 22,
            textShadow:
              "0 0 12px rgba(255, 200, 110, 0.7), 0 2px 4px rgba(20, 6, 12, 0.5)",
            animation: "baDamageFloat 0.8s ease-out forwards",
            pointerEvents: "none",
          }}
          aria-hidden
        >
          -1 HP
        </div>
      )}
      {attackWaveKey > 0 && (
        <div
          key={`wave-${attackWaveKey}`}
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196, 81, 58, 0.5) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "baWavePulse 1s ease-out forwards",
            willChange: "transform, opacity",
          }}
        />
      )}
      {/* Name plate */}
      <div
        style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "3px 14px",
          background: "rgba(40, 18, 38, 0.85)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(244, 168, 154, 0.55)",
          borderRadius: 999,
          color: "#f4a89a",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.5,
          whiteSpace: "nowrap",
        }}
      >
        RACCOON
      </div>
    </div>
  );
}

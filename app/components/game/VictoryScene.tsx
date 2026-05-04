"use client";

/*
 * VictoryScene — Case 16 post-boss "You saved Adam and Layla" reward.
 *
 * Big celebratory beat. Bright golden palette, hero photo in a gold
 * frame, achievement chips drifting in on a stagger, fireworks burst,
 * Continue button.
 */

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  COLOR,
  FloatingParticles,
  SHADOW,
  SPRING,
  SceneFrame,
  SceneKeyframes,
  SceneTitle,
  StarField,
  Vignette,
} from "@/app/components/scene";

export interface Achievement {
  icon: string;
  label: string;
  coins: number;
  earned: boolean;
}

export interface VictorySceneProps {
  onContinue: () => void;
  heroPhotoSrc?: string;
  achievements?: Achievement[];
  bonusCoins?: number;
  ctaLabel?: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { icon: "🛡️", label: "Vault Defender", coins: 25, earned: true },
  { icon: "🔐", label: "Lock Master", coins: 30, earned: true },
  { icon: "🎯", label: "Sharp Shooter", coins: 25, earned: true },
  { icon: "🦝", label: "Raccoon Hunter", coins: 25, earned: true },
];

export default function VictoryScene({
  onContinue,
  heroPhotoSrc = "/characters/adam-layla-happy.png",
  achievements = DEFAULT_ACHIEVEMENTS,
  bonusCoins = 50,
  ctaLabel = "Claim Reward →",
}: VictorySceneProps) {
  return (
    <SceneFrame>
      {/* Cyber victory backdrop — replaces the golden Pixar dusk
          layers (SunsetBackdrop / DistantRidges / WoodFloor) with
          deep navy + cyan/violet/lime nebula bleeds matching the
          rest of the cyber app. The fireworks + coin rain stay since
          they read as celebration regardless of palette. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15, 21, 48, 0.5) 0%, rgba(8, 10, 22, 0.75) 100%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: "-10%", top: "-15%", width: "70vw", height: "75vh", background: "radial-gradient(ellipse, rgba(126, 255, 151, 0.18) 0%, rgba(126, 255, 151, 0.06) 40%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", right: "-15%", top: "20%", width: "60vw", height: "65vh", background: "radial-gradient(ellipse, rgba(0, 229, 255, 0.20) 0%, rgba(0, 229, 255, 0.06) 40%, transparent 70%)", filter: "blur(48px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: "20%", bottom: "-10%", width: "60vw", height: "55vh", background: "radial-gradient(ellipse, rgba(124, 92, 255, 0.18) 0%, rgba(124, 92, 255, 0.05) 45%, transparent 75%)", filter: "blur(52px)", pointerEvents: "none" }} />
      <StarField count={40} />
      <FloatingParticles count={50} />
      <Fireworks />
      <CoinRain />

      <SceneTitle title="YOU SAVED THEM!" badge="Heroes of the Day" />

      {/* Hero photo card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...SPRING.bouncy, delay: 0.4 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "30%",
          transform: "translateX(-50%)",
          zIndex: 6,
          width: "min(50vw, 320px)",
        }}
      >
        <HeroFrame src={heroPhotoSrc} />
      </motion.div>

      {/* Achievement chips — lifted from top:70% to top:62% so on
          shorter viewports the wrapping row no longer collides with
          the bonus-coins chip + the Claim Reward button below. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          transform: "translateX(-50%)",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          maxWidth: 560,
          zIndex: 7,
        }}
      >
        {achievements.map((a, i) => (
          <AchievementChip key={i} achievement={a} index={i} />
        ))}
      </div>

      {/* Bonus coins floating chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...SPRING.bouncy, delay: 1.4 }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 100,
          transform: "translateX(-50%)",
          zIndex: 8,
          padding: "8px 22px",
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.32), rgba(251,191,36,0.32))",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(245,158,11,0.75)",
          borderRadius: 999,
          boxShadow: "0 0 30px rgba(245,158,11,0.45)",
          color: "#fef3c7",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>🪙</span>+{bonusCoins} bonus coins
      </motion.div>

      {/* Cyber Claim Reward CTA — replaces PrimaryButton (warm gold)
          for the cyber victory surface. */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9,
        }}
      >
        <motion.button
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04, boxShadow: "0 0 32px rgba(0, 229, 255, 0.85), 0 14px 28px -6px rgba(0, 229, 255, 0.55), 0 0 0 1px rgba(125, 240, 255, 0.7) inset" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "16px 38px",
            fontSize: 18,
            fontWeight: 800,
            color: "#080a16",
            background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
            borderRadius: 999,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: 1,
            textTransform: "uppercase",
            boxShadow: "0 0 24px rgba(0, 229, 255, 0.55), 0 8px 20px -6px rgba(0, 229, 255, 0.45), 0 0 0 1px rgba(125, 240, 255, 0.6) inset",
          }}
        >
          {ctaLabel}
        </motion.button>
      </div>

      <Vignette />
      <SceneKeyframes />
      <style>{`
        @keyframes fireworkBurst {
          0% { transform: scale(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes coinRise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes heroHaloSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </SceneFrame>
  );
}

/* ───────────────────────── HERO FRAME ───────────────────────── */

function HeroFrame({ src }: { src: string }) {
  return (
    <div
      style={{
        position: "relative",
        padding: 12,
        borderRadius: 24,
        background:
          "linear-gradient(135deg, #ffe4a3 0%, #ffb058 50%, #c87a18 100%)",
        boxShadow:
          "0 24px 50px -12px rgba(80, 40, 5, 0.65), 0 0 50px rgba(255, 178, 80, 0.4)",
      }}
    >
      {/* Animated gold halo behind frame */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(253, 224, 71, 0.45) 60deg, transparent 120deg, rgba(255, 130, 80, 0.4) 180deg, transparent 240deg, rgba(167, 139, 250, 0.3) 300deg, transparent 360deg)",
          filter: "blur(28px)",
          animation: "heroHaloSpin 12s linear infinite",
          zIndex: -1,
        }}
      />
      <div
        style={{
          aspectRatio: "4 / 3",
          width: "100%",
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 14,
          borderStyle: "solid",
          borderWidth: 3,
          borderColor: "rgba(255, 245, 200, 0.65)",
          boxShadow: "inset 0 0 0 2px rgba(120, 60, 0, 0.4)",
          filter: "saturate(1.05) contrast(1.02)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── ACHIEVEMENT CHIP ───────────────────────── */

function AchievementChip({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const earned = achievement.earned;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING.bouncy, delay: 0.9 + index * 0.08 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        background: earned
          ? "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(96,165,250,0.25))"
          : "rgba(50, 30, 50, 0.4)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: earned
          ? "rgba(167,139,250,0.6)"
          : "rgba(125, 240, 255, 0.18)",
        borderRadius: 14,
        boxShadow: earned ? "0 0 20px rgba(167,139,250,0.35)" : "none",
        color: earned ? "#e0e7ff" : "rgba(220, 232, 255, 0.4)",
        opacity: earned ? 1 : 0.55,
      }}
    >
      <span
        style={{
          fontSize: 22,
          filter: earned ? "none" : "grayscale(0.7)",
        }}
      >
        {achievement.icon}
      </span>
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: earned ? "#c4b5fd" : "#7a6480",
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          }}
        >
          {earned ? "EARNED" : "LOCKED"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 12 }}>
          {achievement.label}
          {earned && (
            <span style={{ color: "#fbbf24", marginLeft: 6 }}>
              +{achievement.coins}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── FIREWORKS ───────────────────────── */

function Fireworks() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        left: 10 + (i * 16) % 80,
        top: 15 + ((i * 31) % 35),
        delay: i * 0.5,
        duration: 2.4 + (i % 3) * 0.4,
        color: ["#f97316", "#fbbf24", "#a78bfa", "#22d3ee", "#ec4899", "#10b981"][i],
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {bursts.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 60%)`,
            animation: `fireworkBurst ${b.duration}s ease-out ${b.delay}s infinite`,
            mixBlendMode: "screen",
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── COIN RAIN ───────────────────────── */

function CoinRain() {
  const coins = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        left: (i * 11 + 7) % 100,
        delay: (i * 0.55) % 9,
        duration: 5 + ((i * 5) % 5),
        size: 16 + ((i * 3) % 3) * 8,
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {coins.map((c, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${c.left}%`,
            bottom: -30,
            fontSize: c.size,
            filter: "drop-shadow(0 0 10px rgba(253,224,71,0.6))",
            animation: `coinRise ${c.duration}s linear ${c.delay}s infinite`,
            opacity: 0,
          }}
        >
          🪙
        </span>
      ))}
    </div>
  );
}

/* unused but exported for parity */
void COLOR;
void SHADOW;

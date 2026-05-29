"use client";

/**
 * Boss Victory Scene - the post-bossBattle payoff.
 *
 * Replaces the legacy `<Card>` with 🏆 + headline + 1 stat line. The
 * old card collapsed the biggest interactive moment of the lesson
 * into a generic confirmation. This scene treats the win as a real
 * celebration:
 *
 *   1. Defeated-Raccoon stamp arrives with rotation+overshoot settle
 *   2. "VICTORY!" wordmark blooms with gradient + drop shadow
 *   3. 4 stat tiles cascade in with audio stings (accuracy, best
 *      combo, phases cleared, XP earned)
 *   4. Badge bloom: badgeIcon + badgeName with halo + sparkle ring
 *   5. Continue + Cyber HQ CTAs land last
 *
 * Routed through the existing toolkit (useExerciseFeedback,
 * useGameAudio, useMotionIntensity) so juice is consistent with the
 * other premium screens.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import GameButton from "@/app/components/lesson/GameButton";

export interface BossVictoryStats {
  combo: number;
  accuracy: number;
  xp: number;
  phasesCleared?: number;
  totalPhases?: number;
}

export interface BossVictorySceneProps {
  badgeIcon: string;
  badgeName: string;
  weekNumber: number;
  stats: BossVictoryStats | null;
  onClaim: () => void;
}

export default function BossVictoryScene({
  badgeIcon,
  badgeName,
  weekNumber,
  stats,
  onClaim,
}: BossVictorySceneProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const firedRef = useRef(false);

  // Cascade — comfort/reduced motion compresses or skips beats.
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (intensity === 0) {
      setStep(99);
      return;
    }

    const scale = intensity < 1 ? 0.55 : 1;
    const t = (ms: number) => Math.max(60, Math.round(ms * scale));
    const beats = [220, 520, 720, 880, 1040, 1200, 1480, 1700, 1900];
    const timers: number[] = [];

    // Initial big-win sting + confetti
    audio.victory();
    if (intensity > 0) {
      fx.unlock({ text: "VICTORY!" });
    }

    beats.forEach((delay, i) => {
      timers.push(
        window.setTimeout(() => {
          setStep(i + 1);
          // Stat tiles (steps 4–7) get the xp tick chime
          if (i >= 3 && i <= 6) audio.xpTick();
          // Badge bloom
          if (i === 7) audio.badgeEarned();
        }, t(delay))
      );
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [audio, fx, intensity]);

  const handleHQ = useCallback(() => {
    audio.tap();
    router.push("/cyberhq");
  }, [audio, router]);

  const handleClaim = useCallback(() => {
    audio.tap();
    onClaim();
  }, [audio, onClaim]);

  // Stat tile data is computed from stats prop with safe fallbacks.
  const phasesCleared = stats?.phasesCleared ?? stats?.totalPhases ?? 5;
  const totalPhases = stats?.totalPhases ?? 5;
  const tiles: { id: string; label: string; value: string; accent: string; visibleAt: number }[] = [
    {
      id: "accuracy",
      label: "Accuracy",
      value: `${stats?.accuracy ?? 0}%`,
      accent: "#7eff97",
      visibleAt: 4,
    },
    {
      id: "combo",
      label: "Best combo",
      value: `×${stats?.combo ?? 0}`,
      accent: "#00e5ff",
      visibleAt: 5,
    },
    {
      id: "phases",
      label: "Phases cleared",
      value: `${phasesCleared}/${totalPhases}`,
      accent: "#ff5fb3",
      visibleAt: 6,
    },
    {
      id: "xp",
      label: "XP earned",
      value: `+${stats?.xp ?? 0}`,
      accent: "#fde047",
      visibleAt: 7,
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 980,
        margin: "0 auto",
        padding: "20px clamp(12px, 3vw, 28px)",
        color: "#fff7e6",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <SceneStyles />

      {/* Decorative rays behind everything */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "conic-gradient(from 0deg, rgba(253,224,71,0.32) 0deg, transparent 12deg, rgba(253,224,71,0.32) 30deg, transparent 42deg, rgba(253,224,71,0.32) 60deg, transparent 72deg, rgba(253,224,71,0.32) 90deg, transparent 102deg, rgba(253,224,71,0.32) 120deg, transparent 132deg, rgba(253,224,71,0.32) 150deg, transparent 162deg, rgba(253,224,71,0.32) 180deg, transparent 192deg, rgba(253,224,71,0.32) 210deg, transparent 222deg, rgba(253,224,71,0.32) 240deg, transparent 252deg, rgba(253,224,71,0.32) 270deg, transparent 282deg, rgba(253,224,71,0.32) 300deg, transparent 312deg, rgba(253,224,71,0.32) 330deg, transparent 342deg)",
          filter: "blur(2px)",
          opacity: 0.55,
          mixBlendMode: "screen",
          animation:
            intensity > 0 ? "bossRaysSpin 22s linear infinite" : undefined,
          pointerEvents: "none",
        }}
      />

      {/* Defeated raccoon panel */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <motion.div
          initial={
            intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.4, rotate: -25 }
          }
          animate={
            step >= 1
              ? intensity === 0
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, rotate: -6 }
              : intensity === 0
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.4, rotate: -25 }
          }
          transition={
            intensity === 0
              ? { duration: 0.14 }
              : { type: "spring", stiffness: 220, damping: 11 }
          }
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "grid",
            placeItems: "center",
            marginBottom: 4,
          }}
        >
          {/* Star burst halo */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -28,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(253,224,71,0.45) 0%, transparent 65%)",
              filter: "blur(8px)",
              animation:
                intensity > 0
                  ? "bossHaloPulse 2.6s ease-in-out infinite"
                  : undefined,
            }}
          />
          {/* The raccoon (defeated + crossed) */}
          <span
            aria-hidden
            style={{
              fontSize: 130,
              filter:
                "drop-shadow(0 8px 16px rgba(0,0,0,0.6)) grayscale(0.3) brightness(0.85)",
              opacity: 0.85,
              transform: "rotate(8deg)",
            }}
          >
            🦝
          </span>
          {/* Big diagonal NO stamp */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              width: 240,
              height: 12,
              background:
                "linear-gradient(90deg, transparent 0%, #ef4444 18%, #ef4444 82%, transparent 100%)",
              borderRadius: 6,
              transform: "rotate(-22deg)",
              boxShadow: "0 0 12px rgba(239,68,68,0.85)",
              opacity: 0.95,
            }}
          />
          {/* Z-z-z above its head */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 6,
              right: 14,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: 22,
              color: "#bfeaff",
              textShadow: "0 0 8px rgba(125,240,255,0.6)",
              transform: "rotate(12deg)",
            }}
          >
            zzz
          </span>
        </motion.div>

        {/* DEFEATED stamp */}
        <motion.div
          initial={
            intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.5, rotate: -8 }
          }
          animate={
            step >= 2
              ? intensity === 0
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, rotate: -4 }
              : intensity === 0
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.5, rotate: -8 }
          }
          transition={
            intensity === 0
              ? { duration: 0.12 }
              : { type: "spring", stiffness: 360, damping: 14 }
          }
          style={{
            padding: "6px 18px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.92)",
            border: "3px double rgba(255,255,255,0.85)",
            color: "#fff",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            boxShadow: "0 6px 14px rgba(239,68,68,0.55)",
            textShadow: "0 1px 0 rgba(0,0,0,0.4)",
          }}
        >
          Defeated
        </motion.div>
      </div>

      {/* VICTORY wordmark */}
      <motion.h1
        initial={
          intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.6, y: 20 }
        }
        animate={
          step >= 3
            ? intensity === 0
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
            : intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.6, y: 20 }
        }
        transition={
          intensity === 0
            ? { duration: 0.16 }
            : { type: "spring", stiffness: 280, damping: 14 }
        }
        style={{
          margin: "0 auto 18px",
          fontSize: "clamp(40px, 7.5vw, 72px)",
          fontWeight: 900,
          letterSpacing: "0.06em",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #fde047 0%, #ff7a59 50%, #ff5fb3 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 32px rgba(253, 224, 71, 0.5)",
          filter: "drop-shadow(0 8px 28px rgba(253,224,71,0.45))",
        }}
      >
        VICTORY!
      </motion.h1>

      {/* Stat tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 22,
          maxWidth: 760,
          marginInline: "auto",
        }}
      >
        {tiles.map((tile) => (
          <StatTile
            key={tile.id}
            label={tile.label}
            value={tile.value}
            accent={tile.accent}
            visible={step >= tile.visibleAt}
            intensity={intensity}
          />
        ))}
      </div>

      {/* Badge bloom */}
      <motion.div
        initial={
          intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.4 }
        }
        animate={
          step >= 8
            ? intensity === 0
              ? { opacity: 1 }
              : { opacity: 1, scale: 1 }
            : intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.4 }
        }
        transition={
          intensity === 0
            ? { duration: 0.16 }
            : { type: "spring", stiffness: 220, damping: 13 }
        }
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -36,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(124,92,255,0.18) 50%, transparent 80%)",
            filter: "blur(14px)",
            animation:
              intensity > 0 ? "bossHaloPulse 3.4s ease-in-out infinite" : undefined,
          }}
        />
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "radial-gradient(circle at 30% 28%, #fff8dc 0%, #fde047 35%, #ff7a59 75%, #b8862a 100%)",
            border: "3px solid #fff8dc",
            boxShadow:
              "0 12px 28px rgba(253, 224, 71, 0.55), inset 0 0 0 4px rgba(255,255,255,0.18)",
            fontSize: 48,
          }}
        >
          {badgeIcon}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.22em",
            fontWeight: 800,
            color: "#fde047",
            textTransform: "uppercase",
            textShadow: "0 0 10px rgba(253,224,71,0.6)",
          }}
        >
          Week {weekNumber} badge unlocked
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            color: "#fff7e6",
            textShadow: "0 0 14px rgba(253,224,71,0.45)",
          }}
        >
          {badgeName}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={
          step >= 9
            ? { opacity: 1, y: 0 }
            : intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, y: 12 }
        }
        transition={{ duration: intensity === 0 ? 0.15 : 0.3 }}
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <GameButton
          variant="secondary"
          size="lg"
          icon="🏠"
          onClick={handleHQ}
        >
          Visit Cyber HQ
        </GameButton>
        <GameButton
          variant="primary"
          size="lg"
          icon="→"
          onClick={handleClaim}
        >
          Claim Badge
        </GameButton>
      </motion.div>

      {fx.layer()}
    </div>
  );
}

/* ── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  accent,
  visible,
  intensity,
}: {
  label: string;
  value: string;
  accent: string;
  visible: boolean;
  intensity: number;
}) {
  return (
    <motion.div
      initial={
        intensity === 0
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.5, y: 14 }
      }
      animate={
        visible
          ? intensity === 0
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, y: 0 }
          : intensity === 0
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.5, y: 14 }
      }
      transition={
        intensity === 0
          ? { duration: 0.12 }
          : { type: "spring", stiffness: 320, damping: 16 }
      }
      style={{
        padding: "14px 16px 12px",
        borderRadius: 14,
        background: "rgba(10, 16, 36, 0.78)",
        border: `1.5px solid ${accent}88`,
        boxShadow: `0 10px 20px rgba(0,0,0,0.45), 0 0 18px ${accent}33`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.2em",
          fontWeight: 800,
          color: accent,
          textTransform: "uppercase",
          marginBottom: 4,
          textShadow: `0 0 6px ${accent}88`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 26,
          fontWeight: 900,
          color: "#fff7e6",
          lineHeight: 1,
          textShadow: `0 0 14px ${accent}55`,
        }}
      >
        {value}
      </div>
    </motion.div>
  );
}

/* ── Keyframes (scoped) ────────────────────────────────────────── */

function SceneStyles() {
  return (
    <style jsx global>{`
      @keyframes bossRaysSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes bossHaloPulse {
        0%, 100% { transform: scale(1);    opacity: 0.95; }
        50%      { transform: scale(1.1);  opacity: 0.7;  }
      }
    `}</style>
  );
}

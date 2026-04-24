"use client";

import { useEffect } from "react";
import type { RankInfo } from "@/app/lib/progression";
import { getRank } from "@/app/lib/progression";
import { playSound } from "@/app/lib/sounds";

export interface LevelUpProps {
  oldRank: RankInfo;
  newRank: RankInfo;
  totalXP: number;
  onDismiss: () => void;
}

export default function LevelUpCelebration({
  oldRank,
  newRank,
  totalXP,
  onDismiss,
}: LevelUpProps) {
  useEffect(() => {
    playSound("levelUp");
    const auto = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(auto);
  }, [onDismiss]);

  const rank = getRank(totalXP);
  const fillPct = rank.progressPct * 100;
  const confettiColors = ["#fbbf24", "#f59e0b", "#34d399", "#60a5fa", "#a78bfa", "#f97316"];

  return (
    <div
      role="dialog"
      aria-live="assertive"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Confetti rain */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: -16,
              left: `${(i * 3.4 + (i % 5) * 2) % 100}%`,
              width: 10,
              height: 14,
              borderRadius: 2,
              background: confettiColors[i % confettiColors.length],
              animation: `luFall ${3.4 + (i % 4) * 0.6}s linear infinite`,
              animationDelay: `${(i * 0.15) % 3}s`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          textAlign: "center",
          maxWidth: 520,
          width: "100%",
          animation: "luEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 48,
            fontWeight: 800,
            margin: "0 0 16px",
            letterSpacing: "0.04em",
            background: "linear-gradient(180deg, #fde047, #f59e0b)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            animation: "luTitlePulse 2s ease-in-out infinite",
          }}
        >
          RANK UP!
        </h1>

        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: "#64748b",
              fontSize: 18,
              fontWeight: 600,
              textDecoration: "line-through",
              opacity: 0.7,
            }}
          >
            {oldRank.name}
          </span>
          <span style={{ color: "#94a3b8", fontSize: 22 }}>→</span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: newRank.colour,
              textShadow: `0 0 14px ${newRank.colour}80, 0 0 28px ${newRank.colour}40`,
              letterSpacing: "-0.01em",
            }}
          >
            {newRank.name}
          </span>
        </div>

        <div
          aria-hidden="true"
          style={{
            fontSize: 64,
            lineHeight: 1,
            margin: "8px 0 16px",
            animation: "luIconBounce 1s ease-in-out infinite",
            filter: `drop-shadow(0 0 18px ${newRank.colour}80)`,
          }}
        >
          {newRank.icon}
        </div>

        <p
          style={{
            color: "#f1f5f9",
            fontSize: 20,
            fontWeight: 600,
            margin: "0 0 20px",
          }}
        >
          You are now a <span style={{ color: newRank.colour }}>{newRank.name}</span>!
        </p>

        <div style={{ margin: "0 auto 24px", maxWidth: 320 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#cbd5e1",
              letterSpacing: "0.08em",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            <span>Rank Progress</span>
            <span>
              {totalXP}
              {rank.next ? ` / ${rank.next.minXP} XP` : " XP (MAX)"}
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "rgba(15,23,42,0.8)",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${newRank.colour}, #f59e0b)`,
                transition: "width 0.8s ease-out",
                boxShadow: `0 0 10px ${newRank.colour}80`,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            border: "none",
            padding: "14px 36px",
            borderRadius: 100,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: "0 6px 22px rgba(249,115,22,0.5)",
          }}
        >
          Continue
        </button>
      </div>

      <style>{`
        @keyframes luFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 1; }
        }
        @keyframes luEnter {
          0% { opacity: 0; transform: translateY(16px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes luTitlePulse {
          0%,100% { text-shadow: 0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(249,115,22,0.4); }
          50% { text-shadow: 0 0 40px rgba(250,204,21,1), 0 0 80px rgba(249,115,22,0.7); }
        }
        @keyframes luIconBounce {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.15) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

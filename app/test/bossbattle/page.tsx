"use client";

import { useEffect, useState } from "react";
import BossBattle from "@/app/components/game/BossBattle";

type Stats = { combo: number; accuracy: number; xp: number };

export default function TestBoss() {
  const [badgeStats, setBadgeStats] = useState<Stats | null>(null);

  useEffect(() => {
    const prevHtml = document.documentElement.style.cssText;
    const prevBody = document.body.style.cssText;
    document.documentElement.style.cssText =
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;";
    document.body.style.cssText =
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;";
    return () => {
      document.documentElement.style.cssText = prevHtml;
      document.body.style.cssText = prevBody;
    };
  }, []);

  if (badgeStats) {
    return <BadgeEarned stats={badgeStats} />;
  }

  return (
    <BossBattle
      onEnd={(won, stats) => {
        console.log("Game ended:", won, stats);
        if (won) setBadgeStats(stats);
      }}
    />
  );
}

function BadgeEarned({ stats }: { stats: Stats }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(ellipse at center, #1a1033 0%, #0a0e1a 80%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <svg
          className="badge-shield"
          viewBox="0 0 120 140"
          width="120"
          height="140"
          aria-hidden="true"
          style={{ marginBottom: 16 }}
        >
          <defs>
            <linearGradient id="badgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path
            d="M60 4 L110 22 V72 Q110 108 60 136 Q10 108 10 72 V22 Z"
            fill="url(#badgeGrad)"
            stroke="#92400e"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M42 70 l12 14 l24 -30"
            stroke="#1a0f00"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            color: "#fbbf24",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "0.04em",
            marginBottom: 8,
            textShadow: "0 0 20px rgba(251,191,36,0.5)",
          }}
        >
          Week 1 Badge Earned!
        </div>
        <div
          style={{
            color: "#f1f5f9",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginBottom: 14,
          }}
        >
          Password Protector
        </div>
        <p
          style={{
            color: "#94a3b8",
            fontSize: 15,
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          You completed the Passwords: The Secret Code mission!
          {" "}XP earned: <span style={{ color: "#fbbf24", fontWeight: 700 }}>{stats.xp}</span>
          {" · "}Accuracy: <span style={{ color: "#10b981", fontWeight: 700 }}>{stats.accuracy}%</span>
          {" · "}Best combo: <span style={{ color: "#fde047", fontWeight: 700 }}>{stats.combo}×</span>
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/dashboard"
            style={{
              background: "rgba(15,23,42,0.7)",
              color: "#e2e8f0",
              border: "1px solid rgba(148,163,184,0.25)",
              padding: "12px 26px",
              borderRadius: 100,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Back to Dashboard
          </a>
          <a
            href="#"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: 100,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 22px rgba(249,115,22,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            Continue to Week 2 →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes badgeShieldPulse {
          0%,100% { filter: drop-shadow(0 0 18px rgba(251,191,36,0.6)) drop-shadow(0 0 36px rgba(249,115,22,0.35)) }
          50% { filter: drop-shadow(0 0 32px rgba(251,191,36,0.95)) drop-shadow(0 0 64px rgba(249,115,22,0.6)) }
        }
        .badge-shield { animation: badgeShieldPulse 2s ease-in-out infinite }
      `}</style>
    </div>
  );
}

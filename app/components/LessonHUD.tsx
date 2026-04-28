"use client";

import { useEffect, useState } from "react";
import { getProgressionState, getRank, RANKS } from "@/app/lib/progression";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

export interface LessonHUDProps {
  /** Optional — legacy single-character name (unused now, both heroes are shown). */
  characterName?: "ADAM" | "LAYLA";
  /** Optional — legacy single-character image (ignored; Adam + Layla idle sprites are used). */
  characterImage?: string;
  weekNumber: number;
  weekTitle: string;
  currentScreen: number;
  totalScreens: number;
  xpEarned: number;
  onMuteToggle?: () => void;
  muted?: boolean;
}

export default function LessonHUD({
  weekNumber,
  weekTitle,
  currentScreen,
  totalScreens,
  xpEarned,
  onMuteToggle,
  muted = false,
}: LessonHUDProps) {
  const [totalXP, setTotalXP] = useState<number>(0);
  const [xpPulseKey, setXpPulseKey] = useState(0);

  // Sync rank info from localStorage on mount and whenever lesson XP shifts.
  useEffect(() => {
    setTotalXP(getProgressionState().totalXP);
  }, [xpEarned]);

  useEffect(() => {
    setXpPulseKey((k) => k + 1);
  }, [xpEarned]);

  const rank = getRank(totalXP);
  const rankFillPct = rank.progressPct * 100;
  const lessonFillPct = totalScreens > 0
    ? Math.max(0, Math.min(1, currentScreen / totalScreens)) * 100
    : 0;
  const rankLabel = rank.next
    ? `${totalXP} / ${rank.next.minXP} XP`
    : `${totalXP} XP — MAX`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background:
          "linear-gradient(180deg, rgba(8, 10, 22, 0.92) 0%, rgba(15, 21, 48, 0.88) 100%)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.22)",
        boxShadow: "inset 0 -1px 0 rgba(0, 229, 255, 0.32), 0 0 24px rgba(0, 229, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 18px",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff7e6",
      }}
    >
      {/* Characters — Adam + Layla overlapping avatars */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid #00e5ff",
              boxShadow: "0 0 14px rgba(0, 229, 255, 0.7), 0 0 28px rgba(0, 229, 255, 0.35)",
              overflow: "hidden",
              background: "#0f1530",
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/game/characters/adam-idle.png"
              alt="Adam"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                pointerEvents: "none",
              }}
            />
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid #ff5fb3",
              boxShadow: "0 0 14px rgba(255, 95, 179, 0.7), 0 0 28px rgba(124, 92, 255, 0.35)",
              overflow: "hidden",
              background: "#0f1530",
              flexShrink: 0,
              marginLeft: -12,
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/game/characters/layla-idle.png"
              alt="Layla"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.06em",
            color: "#fff7e6",
          }}
        >
          ADAM & LAYLA
        </span>
      </div>

      {/* Rank badge + rank progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: rank.current.colour,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <CyberIconOrEmoji
              emoji={rank.current.icon}
              size={18}
              accent="cyan"
              glow={false}
            />
            <span style={{ textShadow: `0 0 8px ${rank.current.colour}60` }}>
              {rank.current.name}
            </span>
          </div>
          <div
            title={rankLabel}
            style={{
              position: "relative",
              width: 120,
              height: 10,
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${rankFillPct}%`,
                background: `linear-gradient(90deg, ${rank.current.colour}, ${
                  rank.next?.colour ?? rank.current.colour
                })`,
                transition: "width 0.5s ease-out",
                boxShadow: `0 0 6px ${rank.current.colour}80`,
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.04em",
                color: "#f8fafc",
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                pointerEvents: "none",
              }}
            >
              {rankLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Lesson progress */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#f8fafc",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          Week {weekNumber}: {weekTitle}
        </div>
        <div
          style={{
            width: 160,
            height: 4,
            background: "rgba(15,23,42,0.8)",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.15)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${lessonFillPct}%`,
              background: "linear-gradient(90deg, #00e5ff, #7c5cff)",
              transition: "width 0.4s ease-out",
              boxShadow: "0 0 10px rgba(0, 229, 255, 0.8), 0 0 20px rgba(124, 92, 255, 0.45)",
            }}
          />
        </div>
      </div>

      {/* Lesson XP + mute */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div
          key={xpPulseKey}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#ffd158",
            textShadow: "0 0 10px rgba(255,209,88,0.55)",
            letterSpacing: "0.02em",
            animation: "hudXpPulse 0.45s ease-out",
          }}
        >
          +{xpEarned} XP
        </div>
        {onMuteToggle && (
          <button
            type="button"
            onClick={onMuteToggle}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            title={muted ? "Unmute" : "Mute"}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,220,180,0.06)",
              border: "1px solid rgba(255,220,180,0.18)",
              color: "#fff7e6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {muted ? (
                <>
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              ) : (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes hudXpPulse {
          0% { transform: scale(1); text-shadow: 0 0 10px rgba(251,191,36,0.55); }
          40% { transform: scale(1.2); text-shadow: 0 0 22px rgba(251,191,36,0.95), 0 0 44px rgba(249,115,22,0.45); }
          100% { transform: scale(1); text-shadow: 0 0 10px rgba(251,191,36,0.55); }
        }
      `}</style>
    </div>
  );
}

// Re-export RANKS for convenience if consumers need it.
export { RANKS };

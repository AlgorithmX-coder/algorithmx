"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  getProgressionState,
  WEEK_BADGES,
  getRank,
} from "@/app/lib/progression";
import { playSound } from "@/app/lib/sounds";

/**
 * TrophiesGallery — full-screen overlay showing the 20 weekly badges
 * + the player's rank ladder. Earned badges are vivid; locked badges
 * render as dim outline silhouettes with their week number visible
 * so the kid sees there's more to chase.
 *
 * Mounted by the pause menu when the player picks "Trophies". Closes
 * on the X button or Esc.
 */

export interface TrophiesGalleryProps {
  onClose: () => void;
}

export default function TrophiesGallery({ onClose }: TrophiesGalleryProps) {
  const [state, setState] = useState(() => getProgressionState());

  useEffect(() => {
    /* Refresh once on mount + on each save event so the gallery
     * reflects newly earned badges instantly. */
    const refresh = () => setState(getProgressionState());
    refresh();
    window.addEventListener("algorithmx:autosave", refresh);
    return () =>
      window.removeEventListener("algorithmx:autosave", refresh);
  }, []);

  /* Esc to close. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    /* Capture phase so we steal Esc before the pause-menu hotkey
     * (the gallery lives ON TOP of the pause menu). */
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-trophies-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-troph-bg-in { 0%{opacity:0;} 100%{opacity:1;} }
@keyframes ax-troph-card-in { 0%{opacity:0;transform:translateY(12px) scale(0.96);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes ax-troph-shimmer { 0%{transform:translateX(-100%);} 100%{transform:translateX(120%);} }
`;
    document.head.appendChild(el);
  }, []);

  const earned = new Set(state.badges);
  const rank = getRank(state.totalXP);
  const earnedCount = earned.size;

  return (
    <div style={hostStyle} role="dialog" aria-modal="true">
      <div style={dimStyle} aria-hidden onClick={onClose} />
      <div style={panelStyle}>
        <header style={headerStyle}>
          <div>
            <div style={kickerStyle}>COLLECTION</div>
            <h2 style={headingStyle}>TROPHIES</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={closeButtonStyle}
            onMouseDown={() => playSound("hover")}
          >
            ✕
          </button>
        </header>

        <div style={summaryRowStyle}>
          <div style={summaryItemStyle}>
            <span style={summaryNumberStyle}>{earnedCount}</span>
            <span style={summaryLabelStyle}>BADGES</span>
            <span style={summaryHintStyle}>of {WEEK_BADGES.length}</span>
          </div>
          <div style={summaryDividerStyle} />
          <div style={summaryItemStyle}>
            <span
              style={{
                ...summaryNumberStyle,
                color: rank.current.colour,
              }}
            >
              {rank.current.icon}
            </span>
            <span style={summaryLabelStyle}>{rank.current.name.toUpperCase()}</span>
            <span style={summaryHintStyle}>
              {state.totalXP.toLocaleString()} XP
            </span>
          </div>
          <div style={summaryDividerStyle} />
          <div style={summaryItemStyle}>
            <span style={summaryNumberStyle}>
              {Object.values(state.weekProgress).reduce(
                (n, w) => n + (w?.stars ?? 0),
                0,
              )}
            </span>
            <span style={summaryLabelStyle}>STARS</span>
            <span style={summaryHintStyle}>across all weeks</span>
          </div>
        </div>

        <div style={gridStyle}>
          {WEEK_BADGES.map((b) => (
            <BadgeCard
              key={b.id}
              week={b.week}
              name={b.name}
              earned={earned.has(b.id)}
            />
          ))}
        </div>

        <footer style={footerStyle}>
          Earn badges by completing each week. New badges land here
          the moment they fire.
        </footer>
      </div>
    </div>
  );
}

function BadgeCard({
  week,
  name,
  earned,
}: {
  week: number;
  name: string;
  earned: boolean;
}) {
  return (
    <div
      style={{
        ...badgeCardStyle,
        background: earned
          ? "linear-gradient(180deg, rgba(255,209,88,0.18) 0%, rgba(124,92,255,0.12) 100%)"
          : "rgba(255,255,255,0.04)",
        borderColor: earned
          ? "rgba(255,209,88,0.55)"
          : "rgba(255,255,255,0.08)",
        boxShadow: earned
          ? "0 6px 20px rgba(255,209,88,0.18), inset 0 0 12px rgba(255,209,88,0.16)"
          : "none",
        opacity: earned ? 1 : 0.5,
      }}
    >
      {earned && (
        <div style={shimmerWrapStyle} aria-hidden>
          <div style={shimmerStyle} />
        </div>
      )}
      <div
        style={{
          ...badgeIconStyle,
          color: earned ? "#ffd158" : "rgba(232,237,255,0.4)",
          textShadow: earned
            ? "0 0 18px rgba(255,209,88,0.7)"
            : "none",
          filter: earned ? "none" : "grayscale(1)",
        }}
        aria-hidden
      >
        {earned ? "🏅" : "🔒"}
      </div>
      <div style={badgeWeekStyle}>WEEK {week}</div>
      <div
        style={{
          ...badgeNameStyle,
          color: earned ? "#fff7e6" : "rgba(232,237,255,0.65)",
        }}
      >
        {name}
      </div>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const hostStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  animation: "ax-troph-bg-in 240ms ease-out both",
};

const dimStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(4,5,13,0.86)",
  backdropFilter: "blur(10px)",
};

const panelStyle: CSSProperties = {
  position: "relative",
  width: "min(960px, 94vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background:
    "linear-gradient(180deg, rgba(15,21,48,0.96) 0%, rgba(10,8,32,0.99) 100%)",
  border: "1px solid rgba(255,209,88,0.32)",
  borderRadius: 22,
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
  padding: 32,
  color: "#e8edff",
  animation: "ax-troph-card-in 360ms cubic-bezier(0.16,1,0.3,1) both",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: 20,
};

const kickerStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 4,
  color: "#ffd158",
  fontWeight: 800,
  textTransform: "uppercase",
};

const headingStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 32,
  fontWeight: 900,
  letterSpacing: 6,
  background:
    "linear-gradient(135deg, #ffd158 0%, #ff5fb3 60%, #7c5cff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const closeButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "rgba(232,237,255,0.7)",
  cursor: "pointer",
  fontSize: 14,
};

const summaryRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  gap: 12,
  padding: "16px 12px",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  marginBottom: 24,
};

const summaryItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

const summaryNumberStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "#fff7e6",
  fontFamily: "monospace",
};

const summaryLabelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 3,
  fontWeight: 800,
  color: "#7df0ff",
};

const summaryHintStyle: CSSProperties = {
  fontSize: 10,
  color: "rgba(232,237,255,0.5)",
};

const summaryDividerStyle: CSSProperties = {
  width: 1,
  height: 36,
  background: "rgba(255,255,255,0.12)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12,
};

const badgeCardStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 6,
  padding: "16px 10px",
  border: "1px solid",
  borderRadius: 14,
  overflow: "hidden",
  transition: "transform 220ms ease, box-shadow 220ms ease",
};

const shimmerWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

const shimmerStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "60%",
  height: "100%",
  background:
    "linear-gradient(90deg, transparent, rgba(255,209,88,0.16), transparent)",
  animation: "ax-troph-shimmer 3.4s ease-in-out infinite",
};

const badgeIconStyle: CSSProperties = {
  fontSize: 36,
  lineHeight: 1,
  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
};

const badgeWeekStyle: CSSProperties = {
  fontSize: 9,
  letterSpacing: 3,
  fontWeight: 800,
  color: "rgba(232,237,255,0.55)",
};

const badgeNameStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.3,
  lineHeight: 1.2,
};

const footerStyle: CSSProperties = {
  marginTop: 20,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  fontSize: 11,
  color: "rgba(232,237,255,0.45)",
  textAlign: "center",
};

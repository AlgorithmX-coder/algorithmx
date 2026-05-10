"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  type ActivityEntry,
  listActivity,
} from "@/app/lib/activityLog";

/**
 * RecentActivityMarquee - horizontally-scrolling band of the player's
 * recent achievements, shown at the top of the title-screen slot
 * picker. Real games display "Adam earned Phishing Hunter" / "Layla
 * promoted to Specialist" in a feed; we mirror that vibe.
 *
 * Hides itself entirely if there are no entries yet (a brand-new
 * install shouldn't render an empty band).
 */

const SCROLL_SPEED_PX_PER_S = 70;

function formatRel(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function RecentActivityMarquee() {
  const [items, setItems] = useState<ActivityEntry[]>(() => listActivity());

  /* Refresh when a new activity is logged. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => setItems(listActivity());
    window.addEventListener("algorithmx:activity", refresh);
    return () => window.removeEventListener("algorithmx:activity", refresh);
  }, []);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-marquee-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.ax-marquee:hover .ax-marquee-track { animation-play-state: paused; }
`;
    document.head.appendChild(el);
  }, []);

  if (items.length === 0) return null;

  /* Estimate track length so we can scale the duration to keep speed
   * roughly constant regardless of how many entries the player has. */
  const approxItemPx = 280;
  const totalPx = items.length * approxItemPx;
  const durationS = Math.max(20, totalPx / SCROLL_SPEED_PX_PER_S);

  /* Duplicate the list so the loop is seamless - the keyframe scrolls
   * by exactly half the track width, which corresponds to one full
   * pass of the original list. */
  const doubled = [...items, ...items];

  return (
    <div className="ax-marquee" style={hostStyle} aria-hidden>
      <div style={kickerStyle}>RECENT ACTIVITY</div>
      <div style={maskStyle}>
        <div
          className="ax-marquee-track"
          style={{
            ...trackStyle,
            animation: `ax-marquee-scroll ${durationS}s linear infinite`,
          }}
        >
          {doubled.map((e, i) => (
            <div
              key={`${e.id}-${i}`}
              style={{
                ...itemStyle,
                borderColor: `${e.accent}55`,
              }}
            >
              <span style={{ ...itemIconStyle, color: e.accent }}>
                {e.icon}
              </span>
              <span style={itemNameStyle}>{e.slotName}</span>
              <span style={itemTextStyle}>{e.text}</span>
              <span style={itemTimeStyle}>{formatRel(e.ts)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const hostStyle: CSSProperties = {
  width: "min(960px, 92vw)",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const kickerStyle: CSSProperties = {
  flexShrink: 0,
  fontSize: 10,
  letterSpacing: 3,
  fontWeight: 800,
  color: "#7df0ff",
  textTransform: "uppercase",
  paddingRight: 12,
  borderRight: "1px solid rgba(125,240,255,0.18)",
};

const maskStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
  maskImage:
    "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
};

const trackStyle: CSSProperties = {
  display: "inline-flex",
  gap: 14,
  whiteSpace: "nowrap",
  willChange: "transform",
};

const itemStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "5px 12px",
  background: "rgba(15,21,48,0.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 999,
  fontSize: 12,
  color: "rgba(232,237,255,0.85)",
  flexShrink: 0,
};

const itemIconStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1,
};

const itemNameStyle: CSSProperties = {
  fontWeight: 800,
  letterSpacing: 0.5,
  color: "#e8edff",
};

const itemTextStyle: CSSProperties = {
  color: "rgba(232,237,255,0.7)",
};

const itemTimeStyle: CSSProperties = {
  color: "rgba(232,237,255,0.45)",
  fontFamily: "monospace",
  fontSize: 10,
};

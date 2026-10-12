"use client";

/**
 * Ambient per-case props in the margins around the phone on a wide screen —
 * the empty space either side of the centered mockup. Purely decorative
 * (pointer-events: none, desktop only, drifting in place — never a focal
 * point): objects that fit the case's own world, so Block 2 stops reading
 * as "the same screen five times."
 *
 * Each prop sits on its own glowing badge chip (not just a bare line on
 * black) — a first pass drew these as raw low-opacity strokes straight on
 * the page background and they all but disappeared; the chip is what
 * actually gives them contrast, the glow is what makes them read as "lit
 * up" rather than just outlined.
 */

type IconKey = "notebook" | "pen" | "keys" | "padlock" | "compass" | "screen" | "graph" | "waveform" | "shield" | "calendar";

function Icon({ k, accent }: { k: IconKey; accent: string }) {
  switch (k) {
    case "notebook":
      return (
        <>
          <rect x="4" y="3" width="15" height="18" rx="1.6" />
          <path d="M8 8h7M8 12h7M8 16h4" />
          <path d="M6 3v3.4l1.4-1 1.4 1V3" fill={accent} opacity={0.8} />
        </>
      );
    case "pen":
      return (
        <>
          <path d="M4 20l1-4.5L16.5 4l3 3L8 18.5 4 20z" />
          <path d="M13.5 6.5l3 3" />
          <circle cx="4.6" cy="19.4" r="1.1" fill={accent} stroke="none" />
        </>
      );
    case "keys":
      return (
        <>
          <circle cx="8" cy="8" r="4.5" />
          <circle cx="8" cy="8" r="1.6" fill={accent} opacity={0.7} />
          <path d="M11.5 11.5L20 20M16.5 15.5l2.5-2.5M19 18l2-2" />
        </>
      );
    case "padlock":
      return (
        <>
          <rect x="4.5" y="10.5" width="15" height="10" rx="1.6" />
          <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
          <circle cx="12" cy="15.2" r="1.3" fill={accent} stroke="none" />
          <path d="M12 16.5v1.6" />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="9" strokeDasharray="0.8 3.2" opacity={0.6} />
          <path d="M15.5 8.5L13 13l-4.5 2.5L11 11z" fill={accent} opacity={0.35} />
          <circle cx="12" cy="12" r="1" fill={accent} stroke="none" />
        </>
      );
    case "screen":
      return (
        <>
          <rect x="3" y="4.5" width="18" height="12" rx="1.4" />
          <path d="M8 20.5h8M12 16.5v4" />
          <path d="M9 11l2.2-2.2L13 10.5l3-3" />
          <circle cx="16" cy="7.5" r="1" fill={accent} stroke="none" />
        </>
      );
    case "graph":
      return (
        <>
          <path d="M4 20V4M4 20h16" />
          <path d="M6.5 16l4-5 3 3 5-7" />
          <circle cx="18.5" cy="7" r="1.4" fill={accent} opacity={0.85} stroke="none" />
        </>
      );
    case "waveform":
      return (
        <>
          <path d="M3 12h1.5M6 8v8M9 4v16M12 9v6M15 2v20M18 7v10M21 12h-1" />
          <circle cx="15" cy="2" r="1.2" fill={accent} opacity={0.8} stroke="none" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
          <path d="M9 12l2 2 4-4.5" fill="none" />
          <path d="M12 3l7 3v5c0 5-3 8.5-7 10z" fill={accent} opacity={0.14} stroke="none" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="4" y="5.5" width="16" height="14.5" rx="1.4" />
          <path d="M4 10h16M8 3v4M16 3v4" />
          <rect x="13.5" y="13" width="3.5" height="3.5" rx="0.6" fill={accent} opacity={0.5} stroke="none" />
        </>
      );
  }
}

interface Prop {
  icon: IconKey;
  side: "left" | "right";
  top: string; // CSS value
  offset: string; // distance from that side's edge
  size: number;
  delay: number;
  duration: number;
}

/** Icons per case, matching the theme the owner called out (privacy/
 *  confidentiality objects for the social-engineering opener; compasses,
 *  screens and graphs elsewhere). Kept to the LEFT margin and the lower
 *  right, clear of the voice/skip controls (top-right) and the journal
 *  tab (right edge, mid-height). */
const PROP_SETS: Record<string, Prop[]> = {
  "explorers-m06": [
    { icon: "notebook", side: "left", top: "14%", offset: "6%", size: 46, delay: 0, duration: 9 },
    { icon: "pen", side: "left", top: "38%", offset: "2%", size: 34, delay: 1.2, duration: 7.5 },
    { icon: "keys", side: "left", top: "66%", offset: "7%", size: 40, delay: 0.6, duration: 8.5 },
    { icon: "padlock", side: "right", top: "78%", offset: "9%", size: 36, delay: 1.8, duration: 8 },
  ],
  "explorers-m07": [
    { icon: "shield", side: "left", top: "16%", offset: "7%", size: 44, delay: 0.3, duration: 8.5 },
    { icon: "screen", side: "left", top: "42%", offset: "3%", size: 42, delay: 1.5, duration: 9.5 },
    { icon: "compass", side: "left", top: "68%", offset: "6%", size: 38, delay: 0.8, duration: 7.5 },
    { icon: "keys", side: "right", top: "80%", offset: "8%", size: 32, delay: 1.1, duration: 8 },
  ],
  "explorers-m08": [
    { icon: "screen", side: "left", top: "15%", offset: "6%", size: 40, delay: 0.5, duration: 8 },
    { icon: "graph", side: "left", top: "40%", offset: "3%", size: 44, delay: 1.3, duration: 9 },
    { icon: "pen", side: "left", top: "66%", offset: "7%", size: 32, delay: 0.2, duration: 7 },
    { icon: "notebook", side: "right", top: "78%", offset: "9%", size: 38, delay: 1.6, duration: 8.5 },
  ],
  "explorers-m09": [
    { icon: "calendar", side: "left", top: "15%", offset: "7%", size: 42, delay: 0.7, duration: 9 },
    { icon: "graph", side: "left", top: "40%", offset: "2%", size: 40, delay: 0.1, duration: 8 },
    { icon: "compass", side: "left", top: "67%", offset: "6%", size: 36, delay: 1.4, duration: 7.5 },
    { icon: "screen", side: "right", top: "80%", offset: "9%", size: 34, delay: 0.9, duration: 8.5 },
  ],
  "explorers-m10": [
    { icon: "waveform", side: "left", top: "16%", offset: "6%", size: 46, delay: 0.4, duration: 7.5 },
    { icon: "screen", side: "left", top: "41%", offset: "3%", size: 40, delay: 1.1, duration: 9 },
    { icon: "shield", side: "left", top: "67%", offset: "7%", size: 38, delay: 0.6, duration: 8 },
    { icon: "waveform", side: "right", top: "80%", offset: "9%", size: 30, delay: 1.7, duration: 8.5 },
  ],
};

export function PropField({ caseId, accent }: { caseId: string; accent: string }) {
  const props = PROP_SETS[caseId];
  if (!props) return null;
  return (
    <div className="ph-propfield" aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      {props.map((p, i) => {
        const pad = Math.round(p.size * 0.42);
        const chip = p.size + pad * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: p.top,
              [p.side]: p.offset,
              width: chip,
              height: chip,
              display: "grid",
              placeItems: "center",
              borderRadius: chip * 0.32,
              background: `linear-gradient(145deg, ${accent}2E, ${accent}0C)`,
              border: `1px solid ${accent}66`,
              boxShadow: `0 0 26px 2px ${accent}3D, inset 0 0 14px ${accent}1F`,
              animation: `phPropDrift ${p.duration}s ${p.delay}s ease-in-out infinite, phPropGlow ${p.duration * 0.8}s ${p.delay}s ease-in-out infinite`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={p.size}
              height={p.size}
              style={{ opacity: 0.92, filter: `drop-shadow(0 0 5px ${accent}99)` }}
            >
              <Icon k={p.icon} accent={accent} />
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes phPropDrift { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
        @keyframes phPropGlow { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
        @media (max-width: 960px) { .ph-propfield { display: none; } }
      `}</style>
    </div>
  );
}

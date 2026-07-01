"use client";

/**
 * Tiered hint bubble. The exercise tracks how many wrong answers the
 * child has accumulated in the current screen; the renderer shows
 * progressively clearer hints:
 *
 *   tier 1 (after 1 wrong)  - gentle nudge ("Look at the LENGTH")
 *   tier 2 (after 2 wrong)  - clearer pointer ("Strong = 8+ chars + symbols")
 *   tier 3 (after 3 wrong)  - mini-example or rule card
 *
 * The component is purely presentational; the exercise picks the
 * appropriate hint string and tier.
 */

import { useComfortMode } from "@/app/lib/comfortMode";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface HintBubbleProps {
  /** Visual intensity. */
  tier: 1 | 2 | 3;
  /** Hint copy. Keep it short and concrete. */
  text: string;
  /** Optional example string ("e.g. Tr0pic4l$un!"). */
  example?: string;
  /** Retained for call-site compatibility; no longer renders a face. */
  speaker?: "adam" | "layla";
}

const TIER_COLOUR: Record<1 | 2 | 3, { border: string; glow: string; label: string }> =
  {
    1: { border: "#7df0ff", glow: "rgba(125, 240, 255, 0.35)", label: "Hint" },
    2: {
      border: "#ffd158",
      glow: "rgba(255, 209, 88, 0.4)",
      label: "Bigger hint",
    },
    3: {
      border: "#ff7a59",
      glow: "rgba(255, 122, 89, 0.45)",
      label: "Reminder",
    },
  };

export default function HintBubble({
  tier,
  text,
  example,
}: HintBubbleProps) {
  const comfort = useComfortMode();
  const reduce = comfort.enabled || comfort.prefersReducedMotion;
  const palette = TIER_COLOUR[tier];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "rgba(15, 21, 48, 0.95)",
        border: `2px solid ${palette.border}`,
        borderRadius: 14,
        boxShadow: `0 0 16px ${palette.glow}`,
        color: "#e7ecff",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        fontSize: 14,
        lineHeight: 1.4,
        maxWidth: 520,
        margin: "0 auto",
        animation: reduce ? undefined : "hintBubbleIn 220ms ease-out",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `2px solid ${palette.border}`,
          flexShrink: 0,
          background: "rgba(15, 21, 48, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PixIcon emoji="💡" size={22} />
      </div>
      <div style={{ textAlign: "left", flex: 1 }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: "0.12em",
            color: palette.border,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {palette.label}
        </div>
        <div>{text}</div>
        {example && (
          <div
            style={{
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: "#7df0ff",
            }}
          >
            {example}
          </div>
        )}
      </div>
      <style>{`
        @keyframes hintBubbleIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

"use client";

/**
 * AlgorithmX Cinematic Engine — Challenge Panel
 * =============================================
 *
 * The responsive multiple-choice overlay a focused hotspot pops. A
 * generalised copy of the vault's `ChallengePanel`: narrow viewports get
 * a bottom-sheet, wide viewports a right-hand side card. Motion is scaled
 * by intensity; colours come from the cinematic tokens.
 *
 * It is content-agnostic — it takes a generic `{ prompt, choices, icon?,
 * label? }` instead of a lock.
 */

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { COSMIC, TYPE } from "./tokens";

export interface ChallengeChoice {
  text: string;
}

export interface ChallengePanelProps {
  /** The question/prompt shown as the panel heading. */
  prompt: string;
  /** The selectable answers. */
  choices: ChallengeChoice[];
  /** Optional emoji/glyph shown in the panel header. */
  icon?: string;
  /** Optional short uppercase label (e.g. the rule name). */
  label?: string;
  /** When true the choices are disabled and an "already done" note shows. */
  alreadyActive?: boolean;
  /** Bottom-sheet (narrow) vs side-card (wide). */
  isNarrow: boolean;
  /** Motion intensity (0 disables enter/exit motion). */
  intensity: number;
  /** Fired with the chosen index. */
  onChoose: (index: number) => void;
  /** Fired when the close (×) button is tapped. */
  onClose: () => void;
  /** Optional sound hook fired on a choice tap (before onChoose). */
  onChoiceSound?: () => void;
}

export default function ChallengePanel({
  prompt,
  choices,
  icon,
  label,
  alreadyActive = false,
  isNarrow,
  intensity,
  onChoose,
  onClose,
  onChoiceSound,
}: ChallengePanelProps) {
  const sheetStyle: CSSProperties = isNarrow
    ? { position: "absolute", left: 8, right: 8, bottom: 8 }
    : { position: "absolute", right: 16, top: 80, bottom: 16, width: 360 };

  return (
    <motion.div
      initial={
        intensity === 0
          ? { opacity: 0 }
          : { opacity: 0, y: isNarrow ? 30 : 0, x: isNarrow ? 0 : 30 }
      }
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={
        intensity === 0
          ? { opacity: 0 }
          : { opacity: 0, y: isNarrow ? 30 : 0, x: isNarrow ? 0 : 30 }
      }
      transition={{ duration: intensity === 0 ? 0.12 : 0.28 }}
      style={{
        ...sheetStyle,
        zIndex: 50,
        padding: 18,
        borderRadius: 20,
        background: "rgba(10, 16, 36, 0.93)",
        border: `1.5px solid ${COSMIC.cyan}61`, // ~0.38 alpha
        backdropFilter: "blur(14px)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(125,240,255,0.18) inset",
        color: "#e7ecff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      role="dialog"
      aria-label={`${label ?? "Challenge"}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon && (
            <span
              style={{
                fontSize: 26,
                filter: "drop-shadow(0 0 6px rgba(0,229,255,0.6))",
              }}
            >
              {icon}
            </span>
          )}
          {label && (
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10,
                letterSpacing: "0.2em",
                fontWeight: 800,
                color: "#7df0ff",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>

      {alreadyActive && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(126,255,151,0.12)",
            border: "1px solid rgba(126,255,151,0.32)",
            color: "#86efac",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          ✓ Already unlocked
        </div>
      )}

      <h3
        style={{
          margin: "0 0 14px",
          fontSize: 17,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.3,
        }}
      >
        {prompt}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        {choices.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={alreadyActive}
            onClick={() => {
              if (alreadyActive) return;
              onChoiceSound?.();
              onChoose(i);
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1.5px solid rgba(125,240,255,0.32)",
              background:
                "linear-gradient(180deg, rgba(15,21,48,0.95), rgba(28,38,80,0.95))",
              color: "#e7ecff",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "left",
              cursor: alreadyActive ? "default" : "pointer",
              opacity: alreadyActive ? 0.6 : 1,
              minHeight: 44,
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (alreadyActive) return;
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(125,240,255,0.5) inset, 0 6px 14px rgba(0,229,255,0.18)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {c.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

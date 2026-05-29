"use client";

/**
 * Shared game-feel button.
 *
 * Standard exercise / lesson CTA button with all the small "feel"
 * details in one place so every screen has the same affordances:
 *
 *   - Hover SFX (suppressed when comfort mode or reduced motion is on
 *     and when the button is disabled)
 *   - Click SFX
 *   - Hover lift + glow
 *   - Press scale (pointer-down)
 *   - Disabled fade + cursor + no SFX
 *   - Three visual variants: primary (orange hero CTA), secondary
 *     (cyan/blue accent), ghost (transparent outline)
 *
 * Replaces the dozen-or-so hand-rolled hover/press onMouse handlers
 * scattered across the exercises.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useCallback } from "react";
import { playSound } from "@/app/lib/sounds";
import { useComfortMode } from "@/app/lib/comfortMode";

export type GameButtonVariant =
  | "primary"   // orange hero CTA (Next/Continue/Accept)
  | "secondary" // cyan/violet (info confirmation)
  | "ghost"     // transparent outline (cancel/back)
  | "quiz"      // dark slate w/ blue accent (boss + maze answer buttons)
  | "success"   // green ZAP/FIX/RESCUE action buttons
  | "danger";   // pink/coral close/stop (e.g. pop-up dismiss)
export type GameButtonSize = "md" | "lg";

export interface GameButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  /** Sound played on click. Defaults to "click". Pass null to disable. */
  clickSound?: string | null;
  /** Sound played on hover. Defaults to "hover". Pass null to disable. */
  hoverSound?: string | null;
  /** Optional left-side icon glyph (emoji or text). */
  icon?: string;
  onClick?: () => void;
  children?: ReactNode;
}

const VARIANTS: Record<
  GameButtonVariant,
  { bg: string; color: string; border: string; shadow: string }
> = {
  primary: {
    bg: "linear-gradient(135deg, #f97316, #f59e0b)",
    color: "#fff",
    border: "transparent",
    shadow: "0 6px 22px rgba(249,115,22,0.45)",
  },
  secondary: {
    bg: "linear-gradient(135deg, #00e5ff, #7c5cff)",
    color: "#0f1530",
    border: "transparent",
    shadow: "0 6px 22px rgba(0,229,255,0.4)",
  },
  ghost: {
    bg: "transparent",
    color: "#93c5fd",
    border: "rgba(96,165,250,0.55)",
    shadow: "none",
  },
  // Quiz answer button - dark slate with cyan accent border. Designed
  // to host an A/B/C/D letter prefix; the letter is a visual affordance
  // for fast scanning. Used by boss + maze + recap quizzes.
  quiz: {
    bg: "rgba(15,23,42,0.92)",
    color: "#e2e8f0",
    border: "rgba(59,130,246,0.45)",
    shadow: "0 4px 14px rgba(8,10,22,0.4)",
  },
  // Big positive action - ZAP, FIX, RESCUE. Green forward energy.
  success: {
    bg: "linear-gradient(135deg, #34d399, #10b981)",
    color: "#062019",
    border: "transparent",
    shadow: "0 6px 22px rgba(52,211,153,0.45)",
  },
  // Stop / close / dismiss. Pink coral edge for "this is a no".
  danger: {
    bg: "linear-gradient(135deg, #ff5fb3, #ef4444)",
    color: "#fff",
    border: "transparent",
    shadow: "0 6px 22px rgba(239,68,68,0.45)",
  },
};

const SIZES: Record<GameButtonSize, { padding: string; fontSize: number; minHeight: number }> = {
  md: { padding: "12px 28px", fontSize: 14, minHeight: 44 },
  lg: { padding: "14px 36px", fontSize: 16, minHeight: 52 },
};

export default function GameButton({
  variant = "primary",
  size = "lg",
  clickSound = "click",
  hoverSound = "hover",
  icon,
  onClick,
  children,
  disabled,
  style,
  ...rest
}: GameButtonProps) {
  const comfort = useComfortMode();
  const reduce = comfort.enabled || comfort.prefersReducedMotion;
  const v = VARIANTS[variant];
  const s = SIZES[size];

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (clickSound) playSound(clickSound);
    onClick?.();
  }, [disabled, clickSound, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      onPointerEnter={(e) => {
        if (disabled || reduce) return;
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = v.shadow.replace("0.45", "0.65").replace("0.4", "0.6");
        if (hoverSound) playSound(hoverSound);
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = "";
        el.style.boxShadow = v.shadow;
      }}
      onPointerDown={(e) => {
        if (disabled || reduce) return;
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(1px) scale(0.97)";
      }}
      onPointerUp={(e) => {
        if (disabled || reduce) return;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
      }}
      style={{
        background: v.bg,
        color: v.color,
        border: `2px solid ${v.border}`,
        borderRadius: 14,
        padding: s.padding,
        fontSize: s.fontSize,
        minHeight: s.minHeight,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: v.shadow,
        letterSpacing: "0.02em",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition:
          "transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 160ms ease-out",
        touchAction: "manipulation",
        ...style,
      }}
      {...rest}
    >
      {icon && <span aria-hidden style={{ fontSize: "1.1em" }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

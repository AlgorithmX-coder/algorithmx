"use client";

import { useState } from "react";
import { playSound } from "@/app/lib/sounds";

export interface ButtonJuiceProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  sound?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "span";
  /** ARIA label override (default: derived from children if string). */
  ariaLabel?: string;
}

/**
 * Lightweight wrapper that adds game-feel press/release spring + hover lift
 * + click SFX to any clickable element. No framer-motion.
 *
 * Inline styles are used for transform so they win over any Tailwind or
 * global CSS specificity.
 *
 * A11y: tabIndex=0 so it's keyboard-focusable, Enter/Space activate it,
 * and a visible focus ring fires on keyboard focus (focus-visible polyfilled
 * via :focus-visible CSS, but as inline styles can't query that pseudo-class
 * we approximate with the `keyboardFocused` state — set true by onFocus and
 * cleared by onBlur or any mouse interaction).
 */
export default function ButtonJuice({
  children,
  onClick,
  sound = "click",
  disabled = false,
  className,
  style,
  as = "div",
  ariaLabel,
}: ButtonJuiceProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);

  const fire = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return;
    playSound(sound);
    onClick?.(e);
  };

  // Visual states:
  //   pressed   -> scale(0.95) with quick 80ms ease-out
  //   hovered   -> scale(1.02) + translateY(-1px) with spring
  //   resting   -> scale(1)
  const transform = pressed
    ? "scale(0.95)"
    : hovered && !disabled
      ? "translateY(-1px) scale(1.02)"
      : "scale(1)";
  const transition = pressed
    ? "transform 80ms ease-out"
    : "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease, outline 0.15s ease";

  const computedStyle: React.CSSProperties = {
    display: "inline-block",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    opacity: disabled ? 0.5 : 1,
    transform,
    transition,
    filter: hovered && !disabled ? "brightness(1.05)" : "none",
    // Visible cyan focus ring when reached via keyboard (Tab key).
    // Mouse focus does NOT show the ring — same UX as :focus-visible.
    outline: keyboardFocused ? "3px solid rgba(0, 229, 255, 0.85)" : "none",
    outlineOffset: keyboardFocused ? "3px" : 0,
    ...style,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPressed(true);
      fire(e);
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") setPressed(false);
  };

  const commonProps = {
    className,
    style: computedStyle,
    role: "button",
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled || undefined,
    "aria-label":
      ariaLabel ?? (typeof children === "string" ? children : undefined),
    onMouseDown: () => { if (!disabled) setPressed(true); },
    onMouseUp: () => setPressed(false),
    onMouseEnter: () => { if (!disabled) setHovered(true); setKeyboardFocused(false); },
    onMouseLeave: () => { setPressed(false); setHovered(false); },
    onFocus: (e: React.FocusEvent) => {
      // Heuristic: if focus arrived without a preceding mouse event, it's
      // a keyboard focus. We rely on document.hasFocus + the fact that
      // mouse interaction sets hovered=true above; if hovered is false at
      // the moment of focus, treat it as keyboard.
      if (!hovered && !disabled) setKeyboardFocused(true);
      // Suppress noisy autofocus rings inside non-interactive parents
      e.stopPropagation();
    },
    onBlur: () => {
      setKeyboardFocused(false);
      setPressed(false);
    },
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: fire,
  } as const;

  if (as === "span") {
    return <span {...commonProps}>{children}</span>;
  }
  return <div {...commonProps}>{children}</div>;
}

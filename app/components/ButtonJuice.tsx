"use client";

import { useState } from "react";
import { playSound } from "@/app/lib/sounds";

export interface ButtonJuiceProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  sound?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "span";
}

/**
 * Lightweight wrapper that adds game-feel press/release spring + hover lift
 * + click SFX to any clickable element. No framer-motion.
 *
 * Inline styles are used for transform so they win over any Tailwind or
 * global CSS specificity.
 */
export default function ButtonJuice({
  children,
  onClick,
  sound = "click",
  disabled = false,
  className,
  style,
  as = "div",
}: ButtonJuiceProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    playSound(sound);
    onClick?.(e);
  };

  // Three visual states:
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
    : "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease";

  const computedStyle: React.CSSProperties = {
    display: "inline-block",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    opacity: disabled ? 0.5 : 1,
    transform,
    transition,
    filter: hovered && !disabled ? "brightness(1.05)" : "none",
    ...style,
  };

  const commonProps = {
    className,
    style: computedStyle,
    role: "button",
    "aria-disabled": disabled || undefined,
    onMouseDown: () => { if (!disabled) setPressed(true); },
    onMouseUp: () => setPressed(false),
    onMouseEnter: () => { if (!disabled) setHovered(true); },
    onMouseLeave: () => { setPressed(false); setHovered(false); },
    onClick: handleClick,
  } as const;

  if (as === "span") {
    return <span {...commonProps}>{children}</span>;
  }
  return <div {...commonProps}>{children}</div>;
}

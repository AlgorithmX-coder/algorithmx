"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — animates a number from its previous render to the
 * new value with eased lerp, like classic game scoreboards. Default
 * duration 600ms with cubic ease-out.
 *
 * Drop-in for any place we're rendering a raw number that *should*
 * tick up rather than jump:  XP, coins, score, time-left, etc.
 *
 * Usage:
 *   <AnimatedCounter value={totalXP} prefix="+" suffix=" XP" />
 */

export interface AnimatedCounterProps {
  value: number;
  /** ms to animate between the old and new value. Default 600. */
  duration?: number;
  /** Decimal places to render. Default 0 (integer). */
  decimals?: number;
  /** Prepend a string ("+", "$"). */
  prefix?: string;
  /** Append a string (" XP", "%"). */
  suffix?: string;
  /** Use locale grouping (1,234,567). Default true. */
  group?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Runs once each time the animation completes (after the value lands). */
  onComplete?: () => void;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedCounter({
  value,
  duration = 600,
  decimals = 0,
  prefix = "",
  suffix = "",
  group = true,
  className,
  style,
  onComplete,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const reduceRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    reduceRef.current =
      document.documentElement.dataset.axReduceMotion === "true";
  });

  useEffect(() => {
    /* If reduce-motion is on, snap. */
    if (reduceRef.current) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    fromRef.current = display;
    startRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = easeOutCubic(t);
      const next = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        rafRef.current = 0;
        onComplete?.();
      }
    };
    rafRef.current = window.requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    /* We deliberately do NOT depend on `display` — re-running on each
     * intermediate frame would loop forever. The from-anchor is captured
     * synchronously above. */
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [value, duration, onComplete]);

  const rounded =
    decimals === 0
      ? Math.round(display)
      : Number(display.toFixed(decimals));
  const formatted = group
    ? rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : rounded.toFixed(decimals);

  return (
    <span className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

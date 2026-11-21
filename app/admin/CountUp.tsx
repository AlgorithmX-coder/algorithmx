"use client";

import { useEffect, useState } from "react";

/* A number that counts up to its value when it appears. Eased, ~900ms,
 * rAF-driven. Under prefers-reduced-motion it just shows the value.
 * Renders the final value on the server so the page is right without
 * JavaScript; the count-up starts from 0 on mount. No "ran once" guard:
 * React's dev double-mount cancels and re-runs the effect, and a guard
 * left the number stuck at 0. */
export default function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    setShown(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span suppressHydrationWarning>{shown.toLocaleString("en-GB")}</span>;
}

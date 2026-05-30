"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the viewport is at the Tailwind `lg` breakpoint
 * (1024px) or wider. SSR-safe: starts as `false` so the mobile path
 * renders first, then upgrades after hydration.
 */
export function useIsDesktop(minPx = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${minPx}px)`);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [minPx]);
  return isDesktop;
}

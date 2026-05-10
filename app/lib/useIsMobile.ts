"use client";

import { useEffect, useState } from "react";

/**
 * useIsMobile - true when the viewport is narrow OR the device looks
 * touch-only. SSR-safe (returns false during prerender, then resolves
 * after mount).
 *
 * Use to gate heavy WebGL surfaces, switch to simpler layouts, etc.
 *
 * The breakpoint is intentionally generous (≤768px) so iPads in
 * portrait don't get blocked from desktop layouts.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const narrow = window.innerWidth <= breakpoint;
      const touch =
        "ontouchstart" in window ||
        (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0);
      // Treat as "mobile" when BOTH narrow and touch - laptops with
      // touchscreens stay on the desktop layout.
      setIsMobile(narrow && touch);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [breakpoint]);

  return isMobile;
}

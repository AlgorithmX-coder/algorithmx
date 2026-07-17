"use client";
import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/* Lenis does not honor prefers-reduced-motion by itself, and synthetic
 * inertial scrolling is the one effect in the stack that intercepts the
 * user's actual input — so reduced-motion users get native scroll. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  if (reduced) return <>{children}</>;
  return <ReactLenis root options={{ smoothWheel: true, lerp: 0.07 }}>{children}</ReactLenis>;
}

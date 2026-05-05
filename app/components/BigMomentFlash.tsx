"use client";

import { type CSSProperties, useEffect, useState } from "react";

/**
 * BigMomentFlash — subtle radial accent flash from the screen edges
 * that fires alongside the achievement toast on big moments
 * (rank-up, badge earn, boss defeat). 1.2s total: 280ms in, 250ms
 * hold, ~700ms slow fade.
 *
 * Listens to `algorithmx:big-moment` custom events with a `colour`
 * detail. Honours reduce-motion (skipped entirely).
 *
 * Public helper:
 *   fireBigMoment("#ffd158")
 */

export function fireBigMoment(colour: string): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("algorithmx:big-moment", { detail: { colour } }),
    );
  } catch {
    /* ignore */
  }
}

interface FlashState {
  uid: number;
  colour: string;
}

let nextUid = 1;

export default function BigMomentFlash() {
  const [flash, setFlash] = useState<FlashState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFlash = (e: Event) => {
      const reduce =
        document.documentElement.dataset.axReduceMotion === "true";
      if (reduce) return;
      const detail = (e as CustomEvent<{ colour?: string }>).detail;
      const colour = detail?.colour ?? "#00e5ff";
      const uid = nextUid++;
      setFlash({ uid, colour });
      window.setTimeout(() => {
        setFlash((cur) => (cur?.uid === uid ? null : cur));
      }, 1200);
    };
    window.addEventListener("algorithmx:big-moment", onFlash as EventListener);
    return () => {
      window.removeEventListener(
        "algorithmx:big-moment",
        onFlash as EventListener,
      );
    };
  }, []);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-big-moment-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-bigmoment {
  0% { opacity: 0; }
  20% { opacity: 0.65; }
  35% { opacity: 0.55; }
  100% { opacity: 0; }
}
`;
    document.head.appendChild(el);
  }, []);

  if (!flash) return null;

  const c = flash.colour;
  return (
    <div
      key={flash.uid}
      aria-hidden
      style={{
        ...hostStyle,
        background: `radial-gradient(ellipse at center, transparent 50%, ${c}33 78%, ${c}88 100%)`,
        animation: "ax-bigmoment 1200ms cubic-bezier(0.16,1,0.3,1) both",
      }}
    />
  );
}

const hostStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9450,
  pointerEvents: "none",
  mixBlendMode: "screen",
};

"use client";

import { useEffect, useRef, useState } from "react";
import LottieScene from "@/app/components/LottieScene";
import { LOTTIE_OVERLAYS } from "@/app/lib/lottie-manifest";

/**
 * LottieOverlayHost — mounts once near the lesson root, then any
 * call to correctAnswerBurst / badgeEarnedCelebration / wrongAnswerShake
 * fires a full-screen Lottie overlay with a 1s lifetime.
 *
 * Wires itself to `window.__axLottieOverlay__` so the celebrations
 * library (which is a plain TS file, no React) can call us without
 * importing React.  When this component unmounts the global is cleared.
 *
 * If a particular kind has no manifest entry the overlay no-ops and
 * the legacy canvas-confetti effect plays instead.
 */

type Kind = "correct" | "wrong" | "badge";

interface ActiveOverlay {
  kind: Kind;
  /** Force-remount key so consecutive bursts of the same kind restart cleanly. */
  fireKey: number;
  /** Streak at the time of fire — used to pick a bigger Lottie at high streaks. */
  streak: number;
}

const LIFETIMES_MS: Record<Kind, number> = {
  correct: 1100,
  wrong: 900,
  badge: 1800,
};

export default function LottieOverlayHost() {
  const [active, setActive] = useState<ActiveOverlay | null>(null);
  const fireCounterRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__axLottieOverlay__ = {
      fire: (kind: Kind, streak: number = 0) => {
        fireCounterRef.current += 1;
        setActive({ kind, fireKey: fireCounterRef.current, streak });
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setActive(null);
          timerRef.current = null;
        }, LIFETIMES_MS[kind]);
      },
    };
    return () => {
      if (typeof window !== "undefined") {
        delete window.__axLottieOverlay__;
      }
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;

  // Pick the right Lottie path from the manifest.  For correct
  // answers we have an optional "big" variant for streak >= 5.
  let src: string | undefined;
  if (active.kind === "correct") {
    src =
      active.streak >= 5
        ? LOTTIE_OVERLAYS.correctBig ?? LOTTIE_OVERLAYS.correct
        : LOTTIE_OVERLAYS.correct;
  } else if (active.kind === "wrong") {
    src = LOTTIE_OVERLAYS.wrong;
  } else if (active.kind === "badge") {
    src = LOTTIE_OVERLAYS.badge;
  }

  // No Lottie configured for this kind — render nothing so the
  // legacy canvas-confetti effect (already returned false from the
  // celebrations library) fires instead.
  if (!src) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LottieScene
        src={src}
        loop={false}
        autoplay
        play={active.fireKey}
        style={{
          width: "min(640px, 80vw)",
          height: "min(640px, 80vh)",
        }}
        // Hide the dashed-fallback box if the file 404s — overlay
        // should silently disappear, not show a placeholder.
        fallback={null}
      />
    </div>
  );
}

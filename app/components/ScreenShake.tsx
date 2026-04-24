"use client";

import { useEffect, useRef, useState } from "react";

export interface ScreenShakeProps {
  children: React.ReactNode;
  /** Increment this to trigger a shake. */
  trigger: number;
  intensity?: number;
  duration?: number;
}

/**
 * Wraps its children and applies a brief CSS shake animation whenever the
 * `trigger` value increments. Animation class is removed after completion so
 * re-triggers always restart cleanly.
 */
export default function ScreenShake({
  children,
  trigger,
  intensity = 4,
  duration = 300,
}: ScreenShakeProps) {
  const [shaking, setShaking] = useState(false);
  const initialRef = useRef(trigger);

  useEffect(() => {
    // Skip the initial render — we only shake on subsequent trigger changes.
    if (trigger === initialRef.current) return;
    setShaking(false);
    // Force restart by re-flowing across a microtask.
    const raf = window.requestAnimationFrame(() => setShaking(true));
    const t = window.setTimeout(() => setShaking(false), duration);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [trigger, duration]);

  const animName = `ssShake_${intensity}_${duration}`;

  return (
    <div style={{ animation: shaking ? `${animName} ${duration}ms ease-in-out` : undefined }}>
      {children}
      <style>{`
        @keyframes ${animName} {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-${intensity}px, ${intensity}px); }
          40% { transform: translate(${intensity}px, -${intensity}px); }
          60% { transform: translate(-${intensity}px, 0); }
          80% { transform: translate(${intensity}px, ${intensity}px); }
        }
      `}</style>
    </div>
  );
}

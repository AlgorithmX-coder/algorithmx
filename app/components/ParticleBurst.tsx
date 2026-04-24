"use client";

import { useEffect, useMemo } from "react";

export interface ParticleBurstProps {
  x: number;
  y: number;
  colour?: string;
  count?: number;
  onComplete: () => void;
}

/**
 * A one-shot radial confetti burst. Particles fly outward with randomised
 * direction, speed, rotation, and shape (circle or square).
 */
export default function ParticleBurst({
  x,
  y,
  colour = "#34d399",
  count = 12,
  onComplete,
}: ParticleBurstProps) {
  useEffect(() => {
    const t = window.setTimeout(onComplete, 700);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const baseAngle = (Math.PI * 2 * i) / count;
      const jitter = (Math.random() - 0.5) * 0.6;
      const angle = baseAngle + jitter;
      const speed = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const size = 6 + Math.random() * 4;
      const rot = (Math.random() - 0.5) * 720;
      const r = Math.random();
      const c = r < 0.6 ? colour : r < 0.8 ? "#fbbf24" : "#ffffff";
      const square = Math.random() < 0.4;
      return { dx, dy, size, rot, c, square };
    });
  }, [count, colour]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.square ? 2 : "50%",
            background: p.c,
            boxShadow: `0 0 8px ${p.c}`,
            // Custom properties used by the animation below.
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--rot" as string]: `${p.rot}deg`,
            animation: "pbBurst 0.6s ease-out forwards",
            transformOrigin: "center",
            willChange: "transform, opacity",
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes pbBurst {
          0% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform:
              translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))
              scale(0)
              rotate(var(--rot));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

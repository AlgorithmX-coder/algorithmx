"use client";

import { useEffect } from "react";

export interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  colour?: string;
  size?: number;
  onComplete: () => void;
}

/**
 * A brief piece of floating feedback text (e.g. "+10 XP", "Correct!", "3x Combo!")
 * that rises 50 px from its start position and fades over 1 s.
 */
export default function FloatingText({
  text,
  x,
  y,
  colour = "#34d399",
  size = 20,
  onComplete,
}: FloatingTextProps) {
  useEffect(() => {
    const t = window.setTimeout(onComplete, 1000);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  const isGain = text.startsWith("+");

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, 0)",
        pointerEvents: "none",
        zIndex: 60,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: size,
        color: colour,
        textShadow: `0 0 12px ${colour}99, 2px 2px 0 rgba(0,0,0,0.5)`,
        whiteSpace: "nowrap",
        animation: isGain ? "ftGain 1s ease-out forwards" : "ftPlain 1s ease-out forwards",
      }}
    >
      {text}
      <style>{`
        @keyframes ftPlain {
          0% { opacity: 0; transform: translate(-50%, 0); }
          20% { opacity: 1; transform: translate(-50%, -8px); }
          100% { opacity: 0; transform: translate(-50%, -50px); }
        }
        @keyframes ftGain {
          0% { opacity: 0; transform: translate(-50%, 0) scale(1.2); }
          20% { opacity: 1; transform: translate(-50%, -8px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50px) scale(1); }
        }
      `}</style>
    </div>
  );
}

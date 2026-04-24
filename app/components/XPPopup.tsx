"use client";

import { useEffect } from "react";

export interface XPPopupProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export default function XPPopup({ amount, x, y, onComplete }: XPPopupProps) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, 1000);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  const big = amount >= 50;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        transform: "translate(-50%, 0)",
        zIndex: 60,
        pointerEvents: "none",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: big ? 28 : 20,
        color: "#fbbf24",
        textShadow:
          "0 0 12px rgba(251,191,36,0.65), 0 0 24px rgba(249,115,22,0.35), 2px 2px 0 rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
        animation: "xpPopupFloat 1s ease-out forwards",
      }}
    >
      {big ? `+${amount} XP! ✨` : `+${amount} XP`}
      <style>{`
        @keyframes xpPopupFloat {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.85); }
          20% { opacity: 1; transform: translate(-50%, -8px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(1); }
        }
      `}</style>
    </div>
  );
}

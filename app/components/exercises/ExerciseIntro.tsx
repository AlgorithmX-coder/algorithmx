"use client";

import { useEffect } from "react";
import { playSound } from "@/app/lib/sounds";

export interface ExerciseIntroProps {
  title: string;
  description: string;
  icon: string;
  controls: string;
  onStart: () => void;
}

const STYLES = `
@keyframes exIntroIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes exIntroPop {
  from { opacity: 0; transform: translateY(14px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes exIntroIconFloat {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-8px); }
}
@keyframes exIntroBtnPulse {
  0%,100% { box-shadow: 0 0 18px rgba(249,115,22,0.55), 0 0 0 rgba(249,115,22,0); }
  50%     { box-shadow: 0 0 30px rgba(249,115,22,0.85), 0 0 60px rgba(249,115,22,0.35); }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-exercise-intro-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

export default function ExerciseIntro({
  title,
  description,
  icon,
  controls,
  onStart,
}: ExerciseIntroProps) {
  useEffect(ensureStyles, []);

  return (
    <div
      role="dialog"
      aria-label={title}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 35%, rgba(59,130,246,0.15) 0%, rgba(10,14,26,0.95) 55%, rgba(5,6,14,0.98) 100%)",
        backdropFilter: "blur(8px)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        animation: "exIntroIn 0.35s ease-out both",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          fontSize: 64,
          lineHeight: 1,
          animation: "exIntroIconFloat 2.2s ease-in-out infinite",
          filter: "drop-shadow(0 8px 24px rgba(59,130,246,0.35))",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 28,
          fontWeight: 900,
          color: "#f1f5f9",
          margin: "6px 0 10px",
          letterSpacing: 0.3,
          animation: "exIntroPop 0.45s ease-out both",
          animationDelay: "0.08s",
          animationFillMode: "both",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
          fontSize: 16,
          color: "#94a3b8",
          maxWidth: 400,
          lineHeight: 1.5,
          margin: "0 auto 18px",
          animation: "exIntroPop 0.5s ease-out both",
          animationDelay: "0.16s",
          animationFillMode: "both",
        }}
      >
        {description}
      </p>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          color: "#64748b",
          marginBottom: 24,
          letterSpacing: 0.5,
          animation: "exIntroPop 0.55s ease-out both",
          animationDelay: "0.24s",
          animationFillMode: "both",
        }}
      >
        {controls}
      </div>
      <button
        type="button"
        onClick={() => {
          playSound("select");
          onStart();
        }}
        style={{
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 2,
          borderRadius: 16,
          padding: "16px 48px",
          border: "none",
          cursor: "pointer",
          animation: "exIntroBtnPulse 1.4s ease-in-out infinite",
          fontFamily: "inherit",
        }}
        onMouseEnter={() => playSound("hover")}
      >
        START &rarr;
      </button>
    </div>
  );
}

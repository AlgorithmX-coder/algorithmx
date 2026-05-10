"use client";

import type { ReactNode } from "react";

export interface FullSceneProps {
  children: ReactNode;
  /** Background - pass a CSS gradient string. */
  bg: string;
  /** Optional radial-gradient halo above the content. */
  glow?: string;
}

/**
 * Full-viewport scene wrapper used by every Week 1 case.
 *
 * Was defined inline in LessonPlayer.tsx; lifted here so per-case files
 * under `app/lesson/cases/` can import it without depending on the
 * 5,400-line player file. Identical behaviour to the inline version.
 */
export default function FullScene({ children, bg, glow }: FullSceneProps) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        background: bg,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        overflow: "hidden",
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: glow,
            filter: "blur(120px)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        {children}
      </div>
    </div>
  );
}

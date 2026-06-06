"use client";

import type { ReactNode } from "react";
import { ACCESS, rgba } from "./accessTokens";

/**
 * AuthTerminalPanel — a near-bare container the form sits on.
 *
 * The cold "terminal" chrome (status bar + corner brackets) is gone. All
 * that remains is a soft warm-glass scrim + hairline, kept only because it
 * gently separates the form from the 3D field behind it. The form owns its
 * own spacing.
 */
export default function AuthTerminalPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full" style={{ maxWidth: 440 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-26px -30px",
          borderRadius: 24,
          background: `linear-gradient(180deg, ${rgba(ACCESS.indigo, 0.55)} 0%, ${rgba(ACCESS.abyss, 0.72)} 100%)`,
          backdropFilter: "blur(16px) saturate(130%)",
          WebkitBackdropFilter: "blur(16px) saturate(130%)",
          border: `1px solid ${ACCESS.line}`,
          boxShadow: "0 30px 70px -28px rgba(0,0,0,0.7)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

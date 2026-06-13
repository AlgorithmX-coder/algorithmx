"use client";

import type { ReactNode } from "react";

/**
 * AuthTerminalPanel — a fully frameless container the form floats on.
 *
 * No card, no border, no dark pool — a pool would create a visible boundary
 * against the lit portal chamber. Instead the form text carries a soft shadow
 * for legibility, so the one chamber flows behind it uninterrupted. The form
 * owns its own spacing.
 */
export default function AuthTerminalPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full" style={{ maxWidth: 440 }}>
      <div style={{ position: "relative", zIndex: 1, textShadow: "0 1px 16px rgba(3,4,10,0.9), 0 0 6px rgba(3,4,10,0.7)" }}>
        {children}
      </div>
    </div>
  );
}

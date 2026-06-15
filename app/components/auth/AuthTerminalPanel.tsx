"use client";

import type { ReactNode } from "react";
import { ACCESS, rgba } from "./accessTokens";
import { useIsDesktop } from "./useIsDesktop";

/**
 * AuthTerminalPanel — the container the form floats on.
 *
 * Desktop (≥1200): fully frameless — the form sits directly in the portal
 * chamber (a card would create a seam), legibility via a soft text-shadow.
 *
 * Phone / tablet (<1200): the reactor + portal sit BEHIND the form, so a card
 * would otherwise show the glowing rings through the inputs. Here we add a calm
 * frosted surface so the form reads cleanly while the chamber still glows around
 * it. The form owns its own spacing.
 */
export default function AuthTerminalPanel({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop(1200);
  return (
    <div className="relative w-full" style={{ maxWidth: 440 }}>
      {!isDesktop && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-22px -18px",
            borderRadius: 22,
            background: `linear-gradient(180deg, ${rgba(ACCESS.indigo, 0.62)} 0%, ${rgba(ACCESS.abyss, 0.82)} 100%)`,
            backdropFilter: "blur(12px) saturate(120%)",
            WebkitBackdropFilter: "blur(12px) saturate(120%)",
            border: `1px solid ${ACCESS.line}`,
            boxShadow: "0 24px 60px -28px rgba(0,0,0,0.78)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          // Text-shadow only carries legibility on desktop (no surface there).
          textShadow: isDesktop ? "0 1px 16px rgba(3,4,10,0.9), 0 0 6px rgba(3,4,10,0.7)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

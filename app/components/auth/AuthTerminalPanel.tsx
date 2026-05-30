"use client";

import type { ReactNode } from "react";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

/**
 * AuthTerminalPanel - a glass scrim behind the auth form column.
 *
 * Sits between the cinematic backdrop and the form fields so the
 * fields stay legible without losing the scene behind them. On
 * desktop it's a subtle vertical glass panel with a cyan hairline
 * + soft inner glow; on mobile it tightens around the form so the
 * scrim becomes the "card" and the sphere stays in the background.
 *
 * Decorative chrome (corner brackets + status bar) makes it read as
 * a "secure terminal" rather than a generic blurred rectangle.
 */

export default function AuthTerminalPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{
        // The panel inherits the form column width and sits centred.
        maxWidth: 460,
      }}
    >
      {/* Glass surface - sits BEHIND the form content via absolute,
          so all spacing is controlled by the form. */}
      <div
        aria-hidden
        className="auth-panel-scrim"
        style={{
          position: "absolute",
          inset: "-24px -28px",
          borderRadius: 24,
          background:
            "linear-gradient(180deg, rgba(8, 10, 22, 0.55) 0%, rgba(8, 10, 22, 0.82) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          border: `1px solid ${CYBER_PALETTE.cyan}33`,
          boxShadow:
            `0 24px 60px -20px rgba(0,0,0,0.7), 0 0 32px ${CYBER_PALETTE.cyan}1a, inset 0 0 0 1px rgba(125,240,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
          pointerEvents: "none",
        }}
      />

      {/* Top status bar - "SECURE TERMINAL" + signal dot. Sits on the
          scrim border. Hidden on small screens to keep the form
          breathing. */}
      <div
        aria-hidden
        className="hidden sm:flex auth-panel-statusbar"
        style={{
          position: "absolute",
          top: -36,
          left: -28,
          right: -28,
          height: 24,
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 14,
          paddingRight: 14,
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontSize: 10,
          letterSpacing: 2,
          color: CYBER_PALETTE.cyan,
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: CYBER_PALETTE.lime,
              boxShadow: `0 0 8px ${CYBER_PALETTE.lime}`,
              animation: "authStatusDot 2s ease-in-out infinite",
            }}
          />
          Secure terminal
        </span>
        <span style={{ opacity: 0.7 }}>v1.0 · uplink ok</span>
      </div>

      {/* Corner brackets - decorative. */}
      <CornerBrackets />

      {/* Form content sits on top. */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      <style>{`
        @keyframes authStatusDot {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

function CornerBrackets() {
  const bracket = {
    position: "absolute" as const,
    width: 14,
    height: 14,
    borderColor: CYBER_PALETTE.cyan,
    pointerEvents: "none" as const,
  };
  return (
    <div aria-hidden>
      <span
        style={{
          ...bracket,
          top: -28,
          left: -32,
          borderTop: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderLeft: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderTopLeftRadius: 8,
        }}
      />
      <span
        style={{
          ...bracket,
          top: -28,
          right: -32,
          borderTop: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderRight: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderTopRightRadius: 8,
        }}
      />
      <span
        style={{
          ...bracket,
          bottom: -28,
          left: -32,
          borderBottom: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderLeft: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderBottomLeftRadius: 8,
        }}
      />
      <span
        style={{
          ...bracket,
          bottom: -28,
          right: -32,
          borderBottom: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderRight: `1.5px solid ${CYBER_PALETTE.cyan}aa`,
          borderBottomRightRadius: 8,
        }}
      />
    </div>
  );
}

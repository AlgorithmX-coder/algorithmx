"use client";

/**
 * InventoryBar - the persistent earned-items strip shown below the
 * lesson HUD. 19 slots in a single row, each ~32px square. Empty slots
 * show a dim outline; earned slots show the icon at full saturation
 * with a soft warm glow + a celebratory bounce on first appearance.
 *
 * Each slot also exposes a stable DOM id (`inv-slot-${item.id}`) so the
 * <EarnItemEffect/> overlay can read its bounding rect to know where
 * to fly the new icon.
 */

import { useInventory } from "./InventoryProvider";
import { useEffect, useRef, useState } from "react";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

const C = {
  cream: "#e8edff",
  dim: "rgba(125, 240, 255, 0.55)",
  border: "rgba(0, 229, 255, 0.32)",
  borderEarned: "rgba(0, 229, 255, 0.75)",
  bgPanel: "rgba(15, 21, 48, 0.82)",
  bgSlot: "rgba(8, 10, 22, 0.65)",
  bgSlotEarned: "rgba(15, 21, 48, 0.75)",
};

export interface InventoryBarProps {
  /** Currently-active screen (0..18). The matching slot gets a small
   *  "next reward" pulse so the kid knows what's up next. */
  currentScreen?: number;
}

export function InventoryBar({ currentScreen }: InventoryBarProps) {
  const { earned, catalog, flying } = useInventory();
  // Track which item ids have been earned for at least one render so
  // the slot-fill animation only plays once on first earn.
  const seenRef = useRef<Set<string>>(new Set());
  const [bouncing, setBouncing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newlyEarned: string[] = [];
    earned.forEach((id) => {
      if (!seenRef.current.has(id)) {
        seenRef.current.add(id);
        newlyEarned.push(id);
      }
    });
    if (newlyEarned.length === 0) return;
    setBouncing((prev) => {
      const next = new Set(prev);
      newlyEarned.forEach((id) => next.add(id));
      return next;
    });
    const t = window.setTimeout(() => {
      setBouncing((prev) => {
        const next = new Set(prev);
        newlyEarned.forEach((id) => next.delete(id));
        return next;
      });
    }, 700);
    return () => window.clearTimeout(t);
  }, [earned]);

  return (
    <div
      role="region"
      aria-label="Cyber Hero inventory"
      style={{
        position: "fixed",
        top: 64, // sits flush under the 64px LessonHUD
        left: 0,
        right: 0,
        zIndex: 45,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          background: C.bgPanel,
          border: `1px solid ${C.border}`,
          borderRadius: 999,
          boxShadow:
            "0 12px 28px -10px rgba(0, 0, 0, 0.7), 0 0 26px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(0, 229, 255, 0.12) inset",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
          maxWidth: "calc(100vw - 24px)",
          overflowX: "auto",
          // Hide the native scrollbar - small bar should look clean
          // even if the viewport is too narrow for all 19 slots.
          scrollbarWidth: "none",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: C.dim,
            fontWeight: 800,
            textTransform: "uppercase",
            paddingRight: 4,
            whiteSpace: "nowrap",
          }}
        >
          Hero Pack
        </span>
        {catalog.map((item) => {
          const isEarned = earned.has(item.id);
          const isFlying = flying?.item.id === item.id;
          const isBouncing = bouncing.has(item.id);
          const isCurrent = currentScreen === item.screen;
          return (
            <div
              key={item.id}
              id={`inv-slot-${item.id}`}
              title={isEarned ? `${item.name} ✓` : `Locked - earn on screen ${item.screen + 1}`}
              style={{
                position: "relative",
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                lineHeight: 1,
                background: isEarned ? C.bgSlotEarned : C.bgSlot,
                border: `1px solid ${
                  isEarned
                    ? item.accent
                    : isCurrent
                    ? C.borderEarned
                    : C.border
                }`,
                boxShadow: isEarned
                  ? `0 0 14px ${hexToRgba(item.accent, 0.45)}, inset 0 0 0 1px rgba(255,220,180,0.18)`
                  : isCurrent
                  ? "0 0 12px rgba(255,178,110,0.35)"
                  : "none",
                opacity: isEarned ? (isFlying ? 0 : 1) : 0.45,
                transition:
                  "opacity 0.25s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                transform: isBouncing ? "scale(1.18)" : "scale(1)",
                filter: isEarned ? "saturate(1)" : "saturate(0.4) brightness(0.85)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  filter: isEarned
                    ? `drop-shadow(0 0 6px ${hexToRgba(item.accent, 0.85)})`
                    : "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* CyberIconOrEmoji renders a clean SVG cyber icon when
                    the item's emoji has a mapped equivalent in the
                    CyberIcon library, falls back to the emoji glyph
                    otherwise. Glow off because the slot already glows. */}
                <CyberIconOrEmoji
                  emoji={item.icon}
                  size={20}
                  accent="cyan"
                  glow={false}
                />
              </span>
              {isCurrent && !isEarned && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: 12,
                    border: `1.5px solid ${item.accent}`,
                    opacity: 0.7,
                    animation: "axInvCurrentPulse 1.6s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes axInvCurrentPulse {
          0%,100% { transform: scale(1); opacity: 0.55; }
          50%     { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  // Cheap parser - input is always our palette which is always #rrggbb.
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

"use client";

/**
 * EarnItemEffect — overlay layer that animates a newly-earned item
 * from the action point (where the kid clicked / the answer landed)
 * into its matching slot inside <InventoryBar/>.
 *
 * Design: the item icon launches from the origin, arcs upward briefly
 * (gravity-defying "lift"), then accelerates into the slot with a
 * little particle trail behind it. On landing, calls onFlyLanded()
 * which clears flying state and opens the reveal beat.
 *
 * The component is mounted once at the top of LessonPlayer; it watches
 * the InventoryProvider's `flying` state and renders only while there
 * is something to animate.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useInventory } from "./InventoryProvider";

const TRAIL_DOTS = 6;

export function EarnItemEffect() {
  const { flying, onFlyLanded } = useInventory();
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  // Each time a new flight begins, look up the destination slot's
  // bounding rect. Done in a layout effect so the rect is stable
  // before the animation starts.
  useEffect(() => {
    if (!flying) {
      setTarget(null);
      return;
    }
    const slotEl = document.getElementById(`inv-slot-${flying.item.id}`);
    if (!slotEl) {
      // Slot not mounted (probably the bar is off-screen on a tiny
      // viewport). Skip the fly and signal landed immediately so the
      // reveal beat still fires.
      onFlyLanded();
      return;
    }
    const rect = slotEl.getBoundingClientRect();
    setTarget({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [flying, onFlyLanded]);

  return (
    <AnimatePresence>
      {flying && target && (
        <FlyingItem
          key={flying.nonce}
          icon={flying.item.icon}
          accent={flying.item.accent}
          name={flying.item.name}
          originX={flying.originX}
          originY={flying.originY}
          targetX={target.x}
          targetY={target.y}
          onLanded={onFlyLanded}
        />
      )}
    </AnimatePresence>
  );
}

interface FlyingItemProps {
  icon: string;
  accent: string;
  name: string;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  onLanded: () => void;
}

function FlyingItem({
  icon,
  accent,
  name,
  originX,
  originY,
  targetX,
  targetY,
  onLanded,
}: FlyingItemProps) {
  // Use an arcing two-keyframe path: a peak above both points giving
  // the icon a satisfying lift before it dives into the slot.
  const peakX = (originX + targetX) / 2;
  const peakY = Math.min(originY, targetY) - 90;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: "none",
      }}
    >
      {/* Trail — staggered ghost copies behind the lead icon */}
      {Array.from({ length: TRAIL_DOTS }).map((_, i) => (
        <motion.span
          key={`trail-${i}`}
          initial={{
            left: originX,
            top: originY,
            opacity: 0.7,
            scale: 0.55,
          }}
          animate={{
            left: [originX, peakX, targetX],
            top: [originY, peakY, targetY],
            opacity: [0.7, 0.4, 0],
            scale: [0.55, 0.45, 0.3],
          }}
          transition={{
            duration: 1.05,
            ease: [0.32, 0.78, 0.4, 1],
            delay: 0.04 + i * 0.05,
          }}
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 14px ${accent}`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Earn label that pops at the origin and fades */}
      <motion.div
        initial={{
          left: originX,
          top: originY - 20,
          opacity: 0,
          scale: 0.6,
          y: 0,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: -36,
          scale: [0.6, 1.05, 1, 0.95],
        }}
        transition={{ duration: 0.85, times: [0, 0.18, 0.7, 1] }}
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          padding: "4px 12px",
          borderRadius: 999,
          background: "rgba(40,18,38,0.85)",
          color: accent,
          border: `1px solid ${accent}`,
          fontSize: 12,
          fontWeight: 800,
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          boxShadow: `0 0 18px ${accent}55`,
        }}
      >
        + {name}
      </motion.div>

      {/* The flying icon itself */}
      <motion.span
        initial={{
          left: originX,
          top: originY,
          scale: 0.7,
          rotate: -12,
        }}
        animate={{
          left: [originX, peakX, targetX],
          top: [originY, peakY, targetY],
          scale: [0.7, 1.4, 1.1, 0.85],
          rotate: [-12, 8, -4, 0],
        }}
        transition={{
          duration: 1.05,
          ease: [0.32, 0.78, 0.4, 1],
          times: [0, 0.4, 0.85, 1],
        }}
        onAnimationComplete={onLanded}
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          fontSize: 38,
          lineHeight: 1,
          filter: `drop-shadow(0 0 18px ${accent}) drop-shadow(0 0 32px ${accent}aa)`,
          willChange: "transform, left, top",
        }}
      >
        {icon}
      </motion.span>
    </div>
  );
}

"use client";

/**
 * RevealOverlay — the second half of the Reveal-Then-Earn beat.
 *
 * Once <EarnItemEffect/> has landed the new item in its slot, the
 * provider opens a `reveal` state. This overlay watches that state
 * and pops a small Adam/Layla speech bubble in the centre of the
 * screen with the item's "did you know" line.
 *
 * Auto-dismisses after a generous read window (5s for the full
 * sentence) but a tap or the close button dismisses it sooner so
 * speed-runners aren't penalised.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useInventory } from "./InventoryProvider";

const AUTO_DISMISS_MS = 5000;

export function RevealOverlay() {
  const { reveal, onRevealDismiss } = useInventory();

  useEffect(() => {
    if (!reveal) return;
    const t = window.setTimeout(onRevealDismiss, AUTO_DISMISS_MS);
    // Esc key dismisses the reveal — keyboard users get the same
    // "tap-anywhere" affordance as mouse/touch users.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onRevealDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [reveal, onRevealDismiss]);

  return (
    <AnimatePresence>
      {reveal && (
        <motion.div
          key={reveal.nonce}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onRevealDismiss}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 32,
            background: "transparent",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <motion.div
            initial={{ y: 24, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.96, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 22,
              delay: 0.05,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: 460,
              padding: "20px 56px 20px 80px",
              background: "rgba(40,18,38,0.95)",
              border: `1px solid ${reveal.item.accent}`,
              borderRadius: 22,
              color: "#fff7e6",
              fontFamily:
                "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
              fontSize: 16,
              lineHeight: 1.55,
              boxShadow: `0 24px 48px -12px rgba(20,6,12,0.7), 0 0 32px ${reveal.item.accent}55`,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            {/* Big themed icon on the left */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 50,
                height: 50,
                borderRadius: 14,
                background: "rgba(20,6,12,0.6)",
                border: `1px solid ${reveal.item.accent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                lineHeight: 1,
                filter: `drop-shadow(0 0 14px ${reveal.item.accent})`,
              }}
            >
              <span>{reveal.item.icon}</span>
            </div>

            {/* Speaker label */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: reveal.item.accent,
                marginBottom: 4,
              }}
            >
              {reveal.item.speaker === "adam" ? "ADAM SAYS" : "LAYLA SAYS"}
            </div>

            <div
              style={{
                fontWeight: 700,
                color: "#ffe9c8",
              }}
            >
              {reveal.item.didYouKnow}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onRevealDismiss}
              aria-label="Dismiss"
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "none",
                background: "rgba(20,6,12,0.5)",
                color: "rgba(255,233,200,0.7)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                fontFamily: "sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {/* Tap-anywhere hint */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: -22,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 11,
                color: "rgba(255,233,200,0.55)",
                fontWeight: 700,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              tap anywhere to continue
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

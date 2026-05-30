"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

/**
 * AccessGrantedOverlay - the brief premium transition shown between
 * a successful submit and the redirect.
 *
 * Pairs with AuthSphere's `accessGranted` stage:
 *   - sphere rings align + core flares
 *   - this overlay fades the form down + brings up "Access granted"
 *     / "Cyber HQ unlocked" with a sweep of light
 *
 * The overlay is purely visual. The parent owns the timer that
 * eventually calls `router.push(...)`. The component never traps
 * the user - close it by removing the prop, or just navigate.
 * Keep the visible duration to 600-900ms.
 */

export interface AccessGrantedOverlayProps {
  /** Whether to show the overlay. Toggle to true on submit success. */
  show: boolean;
  /** Bold one-line callout. Defaults differ per page (eg "Access granted"). */
  title?: string;
  /** Optional subtitle ("Routing to Cyber HQ…"). */
  subtitle?: string;
}

export default function AccessGrantedOverlay({
  show,
  title = "Access granted",
  subtitle = "Routing to Cyber HQ…",
}: AccessGrantedOverlayProps) {
  const reduced = !!useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="overlay"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            background:
              `radial-gradient(ellipse at 50% 50%, ${CYBER_PALETTE.cyan}22 0%, rgba(8,10,22,0.55) 60%, rgba(8,10,22,0.78) 100%)`,
          }}
        >
          {/* Sweep of light - vertical bar that scans across once. */}
          {!reduced && (
            <motion.div
              aria-hidden
              initial={{ x: "-30vw", opacity: 0 }}
              animate={{ x: "30vw", opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "30vw",
                background: `linear-gradient(90deg, transparent 0%, ${CYBER_PALETTE.cyan}66 50%, transparent 100%)`,
                filter: "blur(20px)",
                mixBlendMode: "screen",
              }}
            />
          )}

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "32px 44px",
              borderRadius: 22,
              background: "rgba(8, 10, 22, 0.78)",
              border: `1px solid ${CYBER_PALETTE.cyan}66`,
              boxShadow: `0 0 60px ${CYBER_PALETTE.cyan}55, 0 24px 60px -10px rgba(0,0,0,0.75)`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* Check rosette */}
            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${CYBER_PALETTE.lime}, ${CYBER_PALETTE.cyan})`,
                color: CYBER_PALETTE.abyss,
                boxShadow: `0 0 30px ${CYBER_PALETTE.lime}aa, inset 0 0 0 2px rgba(255,255,255,0.35)`,
              }}
              aria-hidden
            >
              ✓
            </motion.div>

            <div
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 0.5,
                color: CYBER_PALETTE.textBright,
                textShadow: `0 0 18px ${CYBER_PALETTE.cyan}77`,
                textAlign: "center",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontSize: 11,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: CYBER_PALETTE.cyan,
                textShadow: `0 0 8px ${CYBER_PALETTE.cyan}aa`,
                opacity: 0.85,
                textAlign: "center",
              }}
            >
              {subtitle}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

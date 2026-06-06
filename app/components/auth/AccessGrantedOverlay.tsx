"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ACCESS, ACCESS_FONT, rgba } from "./accessTokens";
import { IconCheck } from "./icons";

/**
 * AccessGrantedOverlay — the final beat of the success payoff.
 *
 * Pairs with the engine's `accessGranted` stage (rings align, core
 * flares) and the status stack (all VERIFIED). This overlay is the last
 * layer: a brief cyan scan + a settled "Access granted" plate, then the
 * parent's timer calls router.push. Purely visual; never traps the user.
 * Keep the visible window to ~700ms. Honors reduced-motion.
 */

export interface AccessGrantedOverlayProps {
  show: boolean;
  title?: string;
  subtitle?: string;
}

export default function AccessGrantedOverlay({
  show,
  title = "Access granted",
  subtitle = "Routing to your hub",
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
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            background: `radial-gradient(ellipse at 50% 50%, ${rgba(ACCESS.cyan, 0.12)} 0%, ${rgba(ACCESS.abyss, 0.62)} 55%, ${rgba(ACCESS.void, 0.82)} 100%)`,
          }}
        >
          {/* Cyan scan sweep */}
          {!reduced && (
            <motion.div
              aria-hidden
              initial={{ x: "-30vw", opacity: 0 }}
              animate={{ x: "30vw", opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "28vw",
                background: `linear-gradient(90deg, transparent 0%, ${rgba(ACCESS.cyan, 0.4)} 50%, transparent 100%)`,
                filter: "blur(22px)",
                mixBlendMode: "screen",
              }}
            />
          )}

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "30px 46px",
              borderRadius: 18,
              background: rgba(ACCESS.abyss, 0.82),
              border: `1px solid ${rgba(ACCESS.cyan, 0.4)}`,
              boxShadow: `0 0 50px ${rgba(ACCESS.cyan, 0.3)}, 0 24px 60px -12px rgba(0,0,0,0.78)`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${ACCESS.violet}, ${ACCESS.cyan})`,
                color: "#06080f",
                boxShadow: `0 0 28px ${rgba(ACCESS.cyan, 0.6)}, inset 0 0 0 1px rgba(255,255,255,0.3)`,
              }}
              aria-hidden
            >
              <IconCheck size={26} />
            </motion.div>

            <div
              style={{
                fontFamily: ACCESS_FONT.display,
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: 0.3,
                color: ACCESS.textBright,
                textAlign: "center",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontFamily: ACCESS_FONT.mono,
                fontSize: 10.5,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: ACCESS.cyan,
                opacity: 0.9,
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

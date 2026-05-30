"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { CYBER_GRAD, CYBER_PALETTE, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";

/**
 * AuthButton - primary CTA on the auth pages.
 *
 * State drives copy + visuals. The button width is preserved across
 * state changes so the layout never jumps - the parent passes one
 * label per state and AuthButton swaps which is rendered.
 *
 * States:
 *   idle      - hero gradient, hover lifts, press compresses
 *   loading   - dimmed gradient + scanline + spinner; disabled
 *   success   - lime pulse, lock icon, locked-out
 *   disabled  - flat opacity, no hover lift, locked-out
 */

export type AuthButtonState = "idle" | "loading" | "success" | "disabled";

export interface AuthButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "ref"> {
  state?: AuthButtonState;
  /** Label rendered in the idle state. */
  idleLabel: ReactNode;
  /** Label rendered while submitting. */
  loadingLabel?: ReactNode;
  /** Label rendered briefly after success, pre-redirect. */
  successLabel?: ReactNode;
  /** Hint displayed under the button when disabled (eg "Fill all fields"). */
  disabledHint?: string;
}

export default function AuthButton({
  state = "idle",
  idleLabel,
  loadingLabel = "Working…",
  successLabel = "Done ✓",
  disabledHint,
  type = "submit",
  ...rest
}: AuthButtonProps) {
  const reduced = !!useReducedMotion();
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isDisabled = state === "disabled";
  const lockedOut = isLoading || isSuccess || isDisabled;

  const label = isSuccess ? successLabel : isLoading ? loadingLabel : idleLabel;

  const successGradient = `linear-gradient(135deg, ${CYBER_PALETTE.lime} 0%, ${CYBER_PALETTE.cyan} 100%)`;

  return (
    <div>
      <motion.button
        {...rest}
        type={type}
        disabled={lockedOut || rest.disabled}
        aria-busy={isLoading || undefined}
        aria-live="polite"
        whileHover={
          !lockedOut && !reduced
            ? { y: -2, scale: 1.015, transition: { duration: 0.18 } }
            : undefined
        }
        whileTap={!lockedOut ? { scale: 0.97 } : undefined}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="w-full relative overflow-hidden rounded-full"
        style={{
          height: 52,
          minHeight: 52,
          background: isSuccess ? successGradient : CYBER_GRAD.hero,
          color: CYBER_PALETTE.abyss,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 15.5,
          letterSpacing: 1,
          textTransform: "uppercase",
          border: "none",
          cursor: lockedOut ? "default" : "pointer",
          boxShadow: isSuccess
            ? `0 0 28px ${CYBER_PALETTE.lime}88, 0 8px 22px -6px ${CYBER_PALETTE.lime}66, 0 0 0 1px ${CYBER_PALETTE.lime}99 inset`
            : isDisabled
              ? "0 8px 22px -6px rgba(0,0,0,0.45), 0 0 0 1px rgba(125,240,255,0.18) inset"
              : CYBER_SHADOW.buttonGlow,
          opacity: isDisabled ? 0.55 : isLoading ? 0.88 : 1,
          transition: "background 320ms ease, box-shadow 320ms ease, opacity 220ms ease",
        }}
      >
        <span
          style={{
            position: "relative",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isLoading && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px solid ${CYBER_PALETTE.abyss}44`,
                borderTopColor: CYBER_PALETTE.abyss,
                animation: reduced ? undefined : "abSpin 0.7s linear infinite",
              }}
            />
          )}
          {isSuccess && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                fontSize: 14,
              }}
            >
              ✓
            </span>
          )}
          {label}
        </span>

        {/* Loading scanline - left-to-right sweep over the surface. */}
        {isLoading && !reduced && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
              animation: "abScanline 1.1s ease-in-out infinite",
            }}
          />
        )}

        {/* Idle shine - slower, more elegant. Disabled when reduced. */}
        {!lockedOut && !reduced && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
              animation: "abShine 3.6s ease-in-out infinite",
            }}
          />
        )}

        {/* Success pulse - a single expanding ring on transition in. */}
        {isSuccess && !reduced && (
          <motion.span
            aria-hidden
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              boxShadow: `0 0 0 3px ${CYBER_PALETTE.lime}`,
              pointerEvents: "none",
            }}
          />
        )}
      </motion.button>

      {isDisabled && disabledHint && (
        <div
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(232, 237, 255, 0.6)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 600,
            textShadow: "0 1px 6px rgba(8,10,22,0.9)",
          }}
        >
          {disabledHint}
        </div>
      )}

      <style>{`
        @keyframes abScanline {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes abShine {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes abSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

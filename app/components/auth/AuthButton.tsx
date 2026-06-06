"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "./accessTokens";
import { IconArrow, IconCheck, IconKey } from "./icons";

/**
 * AuthButton — the execute-access control.
 *
 * Reads as a deliberate system command, not a generic gradient CTA: a
 * sculpted dark control with a single violet→cyan activity edge. The
 * state decides how much it's "armed":
 *
 *   disabled — dim, locked, requirements unmet (shows what's missing)
 *   idle     — ARMED: form valid, ready to execute (brighter edge + glow)
 *   loading  — executing: spinner + scanline, locked
 *   success  — access granted: cyan flare, settled
 *
 * Width is preserved across states so the layout never jumps.
 */

export type AuthButtonState = "idle" | "loading" | "success" | "disabled";

export interface AuthButtonProps extends Omit<HTMLMotionProps<"button">, "children" | "ref"> {
  state?: AuthButtonState;
  idleLabel: ReactNode;
  loadingLabel?: ReactNode;
  successLabel?: ReactNode;
  disabledHint?: string;
  /** Leading glyph for idle/armed/disabled states (default: key). */
  leadingIcon?: ReactNode;
}

export default function AuthButton({
  state = "idle",
  idleLabel,
  loadingLabel = "Working…",
  successLabel = "Done",
  disabledHint,
  leadingIcon,
  type = "submit",
  ...rest
}: AuthButtonProps) {
  const reduced = !!useReducedMotion();
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isDisabled = state === "disabled";
  const isArmed = state === "idle";
  const lockedOut = isLoading || isSuccess || isDisabled;

  const label = isSuccess ? successLabel : isLoading ? loadingLabel : idleLabel;

  const background = isSuccess
    ? `linear-gradient(120deg, ${ACCESS.violet} 0%, ${ACCESS.cyan} 100%)`
    : isArmed || isLoading
      ? ACCESS_GRAD.executeArmed
      : ACCESS_GRAD.execute;

  return (
    <div>
      <motion.button
        {...rest}
        type={type}
        disabled={lockedOut || rest.disabled}
        aria-busy={isLoading || undefined}
        aria-live="polite"
        whileHover={!lockedOut && !reduced ? { y: -1, transition: { duration: 0.18 } } : undefined}
        whileTap={!lockedOut ? { scale: 0.985 } : undefined}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="w-full relative overflow-hidden"
        style={{
          height: 54,
          minHeight: 54,
          borderRadius: 12,
          background,
          color: "#06080f",
          fontFamily: ACCESS_FONT.display,
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 2,
          textTransform: "uppercase",
          border: "none",
          cursor: lockedOut ? "default" : "pointer",
          boxShadow: isSuccess
            ? `0 0 30px ${rgba(ACCESS.cyan, 0.45)}, 0 10px 26px -10px ${rgba(ACCESS.cyan, 0.5)}, 0 0 0 1px ${rgba(ACCESS.cyan, 0.6)} inset`
            : isArmed
              ? `0 0 22px ${rgba(ACCESS.cyan, 0.28)}, 0 10px 24px -10px ${rgba(ACCESS.violet, 0.45)}, 0 0 0 1px rgba(255,255,255,0.14) inset`
              : isDisabled
                ? `0 8px 22px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(150,168,224,0.1) inset`
                : `0 8px 22px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset`,
          opacity: isDisabled ? 0.5 : isLoading ? 0.92 : 1,
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
            gap: 10,
          }}
        >
          {/* Leading status glyph */}
          {isLoading ? (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 15,
                height: 15,
                borderRadius: "50%",
                border: "2px solid rgba(6,8,15,0.35)",
                borderTopColor: "#06080f",
                animation: reduced ? undefined : "abSpin 0.7s linear infinite",
              }}
            />
          ) : isSuccess ? (
            <IconCheck size={17} />
          ) : (
            leadingIcon ?? <IconKey size={16} />
          )}

          {label}

          {/* Trailing execute arrow — only when armed */}
          {isArmed && <IconArrow size={16} />}
        </span>

        {/* Loading scanline — single sweep, communicates execution. */}
        {isLoading && !reduced && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)",
              animation: "abScanline 1.1s ease-in-out infinite",
            }}
          />
        )}

        {/* Success pulse — one expanding ring. */}
        {isSuccess && !reduced && (
          <motion.span
            aria-hidden
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 12,
              boxShadow: `0 0 0 2px ${ACCESS.cyan}`,
              pointerEvents: "none",
            }}
          />
        )}
      </motion.button>

      {isDisabled && disabledHint && (
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 11.5,
            color: ACCESS.textMuted,
            fontFamily: ACCESS_FONT.mono,
            letterSpacing: 0.4,
          }}
        >
          {disabledHint}
        </div>
      )}

      <style>{`
        @keyframes abScanline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes abSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

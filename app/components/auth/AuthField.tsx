"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

/**
 * AuthField - a single accessible input with six visual states:
 *   idle | focus | valid | invalid | loading | success
 *
 * Keeps the underlying element as a plain <input> so browser
 * autocomplete + password managers behave normally. Visual polish
 * lives in the wrapper.
 *
 * Calm errors (warm amber) - no harsh red-pink unless the parent
 * forces it via the `tone` prop. The error message is wired to the
 * input via aria-describedby and aria-invalid.
 */

export type FieldState = "idle" | "valid" | "invalid" | "loading" | "success";

export interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  id?: string;
  label: string;
  /** Standard input type (text | email | password etc.). Default "text". */
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  value: string;
  onChange: (next: string) => void;
  /** Computed field state. Default "idle". */
  state?: FieldState;
  /** Error message shown when state === "invalid". */
  error?: string | null;
  /** Optional leading icon (rendered inside the input on the left). */
  icon?: ReactNode;
  /** Optional right-side adornment (eg show/hide-password button). */
  rightSlot?: ReactNode;
  /** Optional helper text shown below the input when no error present. */
  hint?: ReactNode;
  /** Override the autoComplete attribute. */
  autoComplete?: string;
}

const ACCENT = CYBER_PALETTE.cyan;
const VALID = CYBER_PALETTE.lime;
const WARN = CYBER_PALETTE.amber;
const ERR = CYBER_PALETTE.ember;
const MUTED = "rgba(125, 240, 255, 0.32)";

function borderFor(state: FieldState, focused: boolean): string {
  if (state === "invalid") return ERR;
  if (state === "valid" || state === "success") return VALID;
  if (focused) return ACCENT;
  return MUTED;
}

function glowFor(state: FieldState, focused: boolean): string {
  if (state === "invalid") return `0 0 0 1px ${ERR}55 inset, 0 0 18px ${ERR}33`;
  if (state === "valid" || state === "success") return `0 0 0 1px ${VALID}66 inset, 0 0 18px ${VALID}33`;
  if (focused) return `0 0 0 1px ${ACCENT} inset, 0 0 22px ${ACCENT}55`;
  return "none";
}

export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  state = "idle",
  error,
  icon,
  rightSlot,
  hint,
  autoComplete,
  required,
  placeholder,
  disabled,
  ...rest
}: AuthFieldProps) {
  const auto = useId();
  const inputId = id ?? `af-${auto.replace(/:/g, "")}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [focused, setFocused] = useState(false);
  const reduced = !!useReducedMotion();

  const showTick = (state === "valid" || state === "success") && !focused;
  const isLoading = state === "loading";
  const isInvalid = state === "invalid";

  const describedBy = [
    error ? errorId : null,
    !error && hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block font-black mb-2"
        style={{
          color: ACCENT,
          fontSize: 12,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          textShadow: `0 0 10px ${ACCENT}88, 0 1px 6px rgba(8,10,22,0.9)`,
        }}
      >
        {label}
        {required && (
          <span aria-hidden style={{ marginLeft: 6, color: WARN }}>
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              color: focused ? ACCENT : "rgba(125, 240, 255, 0.6)",
              transition: "color 220ms ease",
              pointerEvents: "none",
              lineHeight: 0,
            }}
          >
            {icon}
          </span>
        )}

        <input
          {...rest}
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoading}
          autoComplete={autoComplete}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className="w-full rounded-xl focus:outline-none"
          style={{
            height: 52,
            paddingLeft: icon ? 44 : 16,
            paddingRight: rightSlot || showTick ? 48 : 16,
            fontSize: 16, // 16px prevents iOS Safari zoom-on-focus
            fontWeight: 600,
            color: CYBER_PALETTE.textBright,
            background: "rgba(8, 10, 22, 0.82)",
            border: `1.5px solid ${borderFor(state, focused)}`,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: glowFor(state, focused),
            transition: reduced
              ? "border-color 120ms ease"
              : "border-color 220ms ease, box-shadow 260ms ease, background-color 220ms ease",
            opacity: disabled ? 0.55 : 1,
          }}
        />

        {/* Right-side adornments stack: tick first (when valid), then
            consumer-supplied rightSlot (eg show-password toggle). */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            pointerEvents: "auto",
          }}
        >
          <AnimatePresence>
            {showTick && (
              <motion.span
                key="tick"
                initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: `${VALID}22`,
                  color: VALID,
                  fontSize: 12,
                  fontWeight: 900,
                  border: `1px solid ${VALID}88`,
                  boxShadow: `0 0 10px ${VALID}66`,
                }}
                aria-hidden
              >
                ✓
              </motion.span>
            )}
            {isLoading && (
              <motion.span
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `2px solid ${ACCENT}44`,
                  borderTopColor: ACCENT,
                  animation: reduced ? undefined : "afSpin 0.7s linear infinite",
                }}
                aria-hidden
              />
            )}
          </AnimatePresence>
          {rightSlot}
        </div>
      </div>

      {/* Hint / error rail - reserves a single line of height so the
          form doesn't jump as messages appear and disappear. */}
      <div style={{ minHeight: 18, marginTop: 6 }}>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="err"
              id={errorId}
              role="alert"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: WARN,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                textShadow: "0 1px 6px rgba(8,10,22,0.9)",
              }}
            >
              {error}
            </motion.div>
          ) : hint ? (
            <motion.div
              key="hint"
              id={hintId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: 12,
                color: "rgba(232, 237, 255, 0.55)",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              {hint}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes afSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

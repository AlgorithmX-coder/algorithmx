"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ACCESS, ACCESS_FONT, rgba } from "./accessTokens";
import { IconCheck } from "./icons";

/**
 * AuthField — a sculpted, precise input for the Access Layer.
 *
 * Six states (idle | valid | invalid | loading | success) drive only
 * meaningful colour: a quiet hairline at rest, a cyan focus ring, a
 * cyan verified tick, a calm amber on error. No idle glow.
 *
 * Stays a real <input> so password managers + autocomplete work. Error
 * text is wired via aria-describedby / aria-invalid, and the message rail
 * reserves a line of height so the form never jumps.
 */

export type FieldState = "idle" | "valid" | "invalid" | "loading" | "success";

export interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  id?: string;
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  value: string;
  onChange: (next: string) => void;
  state?: FieldState;
  error?: string | null;
  /** Leading icon (SVG) rendered inside the field on the left. */
  icon?: ReactNode;
  /** Right adornment (e.g. show/hide-password control). */
  rightSlot?: ReactNode;
  hint?: ReactNode;
  autoComplete?: string;
}

const CYAN = ACCESS.cyan;
const VIOLET = ACCESS.violet;
const WARN = ACCESS.warn;

function borderFor(state: FieldState, focused: boolean): string {
  if (state === "invalid") return rgba(WARN, 0.7);
  if (state === "valid" || state === "success") return rgba(CYAN, 0.55);
  if (focused) return rgba(CYAN, 0.7);
  return ACCESS.line;
}

function glowFor(state: FieldState, focused: boolean): string {
  if (state === "invalid") return `0 0 0 1px ${rgba(WARN, 0.35)} inset`;
  if (focused) return `0 0 0 1px ${rgba(CYAN, 0.5)} inset, 0 0 18px ${rgba(CYAN, 0.16)}`;
  if (state === "valid" || state === "success") return `0 0 0 1px ${rgba(CYAN, 0.28)} inset`;
  return "0 1px 0 rgba(255,255,255,0.02) inset";
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

  const describedBy =
    [error ? errorId : null, !error && hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const iconColor = isInvalid
    ? WARN
    : focused
      ? CYAN
      : state === "valid" || state === "success"
        ? CYAN
        : ACCESS.textMuted;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block mb-2"
        style={{
          color: focused ? ACCESS.textSoft : ACCESS.textMuted,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: ACCESS_FONT.mono,
          transition: "color 200ms ease",
        }}
      >
        {label}
        {required && (
          <span aria-hidden style={{ marginLeft: 6, color: rgba(VIOLET, 0.8) }}>
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
              color: iconColor,
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
          className="w-full focus:outline-none"
          style={{
            height: 52,
            borderRadius: 12,
            paddingLeft: icon ? 46 : 16,
            paddingRight: rightSlot || showTick ? 48 : 16,
            fontSize: 16, // 16px prevents iOS Safari zoom-on-focus
            fontWeight: 500,
            color: ACCESS.textBright,
            background: ACCESS.field,
            border: `1px solid ${borderFor(state, focused)}`,
            fontFamily: ACCESS_FONT.body,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: glowFor(state, focused),
            transition: reduced
              ? "border-color 120ms ease"
              : "border-color 220ms ease, box-shadow 240ms ease, background-color 220ms ease",
            opacity: disabled ? 0.55 : 1,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
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
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: rgba(CYAN, 0.12),
                  color: CYAN,
                  border: `1px solid ${rgba(CYAN, 0.5)}`,
                }}
                aria-hidden
              >
                <IconCheck size={14} />
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
                  border: `2px solid ${rgba(CYAN, 0.25)}`,
                  borderTopColor: CYAN,
                  animation: reduced ? undefined : "afSpin 0.7s linear infinite",
                }}
                aria-hidden
              />
            )}
          </AnimatePresence>
          {rightSlot}
        </div>
      </div>

      {/* Message rail — fixed height so the form never jumps. */}
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
                fontWeight: 600,
                color: ACCESS.warnSoft,
                fontFamily: ACCESS_FONT.body,
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
                color: ACCESS.textMuted,
                fontFamily: ACCESS_FONT.body,
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

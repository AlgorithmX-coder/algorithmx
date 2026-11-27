"use client";

/**
 * The front door's form pieces: one labelled input (with its own SHOW/HIDE
 * when given one and its inline error line), the password rule chips and
 * the submit button.
 *
 * The inputs carry no `name` (#1146): a form submitted before hydration
 * falls back to a native request, and a named password field would land in
 * it. The forms stay method="post" for the same reason.
 */

import type { CSSProperties, ReactNode } from "react";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function FrontField({
  id, label, type, value, onChange, onFocus, onBlur, auto, inputMode, placeholder, i, invalid, fieldError, toggle, last, after, required = true,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void; onFocus?: () => void; onBlur: () => void;
  auto: string; inputMode?: "email"; placeholder: string; i: number; invalid: boolean; fieldError?: string | null;
  toggle?: { shown: boolean; onToggle: () => void; ariaShow: string; ariaHide: string }; last?: boolean; after?: ReactNode; required?: boolean;
}) {
  const errId = `${id}-error`;
  return (
    <div className={`fra-field${last ? " last" : ""}`} style={{ "--i": i } as Vars} data-invalid={invalid ? "" : undefined}>
      <label className="fra-label" htmlFor={id}>{label}</label>
      <div className="fra-box">
        <input
          className={`fra-input${toggle ? " has-toggle" : ""}`}
          id={id}
          type={type}
          autoComplete={auto}
          inputMode={inputMode}
          placeholder={placeholder}
          required={required}
          aria-describedby={fieldError ? `fra-msg ${errId}` : "fra-msg"}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {toggle && (
          <button
            type="button"
            className="fra-toggle"
            onClick={toggle.onToggle}
            aria-pressed={toggle.shown}
            aria-label={toggle.shown ? toggle.ariaHide : toggle.ariaShow}
            aria-controls={id}
          >
            {toggle.shown ? "HIDE" : "SHOW"}
          </button>
        )}
        <i className="fra-hair" aria-hidden="true" />
      </div>
      <p className="fra-fielderr" id={errId} role="alert" hidden={!fieldError}>{fieldError}</p>
      {after}
    </div>
  );
}

const TICK_SM = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);

/** The live RuleChip trio under a new-password field. */
export function RuleChips({ rules }: { rules: [boolean, string][] }) {
  return (
    <div className="fra-rules" role="group" aria-label="Password requirements">
      {rules.map(([pass, label]) => (
        <span key={label} className="fra-rule" data-pass={pass ? "true" : "false"}>
          <i aria-hidden="true" />{TICK_SM}<span>{label}</span>
        </span>
      ))}
    </div>
  );
}

export type FrontButtonState = "idle" | "loading" | "success" | "disabled";

/**
 * The submit pill. Held back ("disabled") it carries aria-disabled and the
 * quiet grey look, and the hint below says what is missing; a click still
 * runs the page's own checks, so their messages are reachable. It is truly
 * disabled while the request is out and once it has succeeded.
 */
export function FrontButton({
  state, idleLabel, loadingLabel, successLabel, hint, hintId = "fra-hint",
}: {
  state: FrontButtonState; idleLabel: string; loadingLabel: string; successLabel: string; hint?: string; hintId?: string;
}) {
  const busy = state === "loading";
  const done = state === "success";
  const held = state === "disabled";
  return (
    <>
      <button
        className="fra-btn"
        type="submit"
        disabled={busy || done}
        aria-busy={busy || undefined}
        aria-disabled={held || undefined}
        aria-describedby={held && hint ? hintId : undefined}
        data-state={done ? "done" : undefined}
      >
        <span className="fra-btn-label">
          {busy ? (
            <>{loadingLabel}<span className="fra-dots" aria-hidden="true"><i /><i /><i /></span></>
          ) : done ? successLabel : idleLabel}
        </span>
      </button>
      <p className="fra-hint" id={hintId} hidden={!(held && hint)}>{hint}</p>
    </>
  );
}

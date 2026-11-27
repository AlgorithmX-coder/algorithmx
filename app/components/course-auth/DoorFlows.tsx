"use client";

/**
 * The forgot-password and reset-password pages in the daylight door (AI
 * Cleared, AI Fluent, Cyber Awareness; landing lab round 8, 2026-11-26).
 *
 * The behaviour is NightForgot and NightReset's (NightFlows.tsx), carried
 * over line for line: the same email check, the same API calls with the
 * same bodies (the course slug picks this course's reset page for the
 * emailed link through the fixed allowlist in courseResetPath.ts), the same
 * order of the reset checks, the same states and words. Only the skin
 * differs. NightFlows is left untouched so the other courses' pages do not
 * move; if the behaviour ever changes, change it in both.
 *
 * The inputs carry no `name`: a form submitted before hydration falls back
 * to a native request, and a named password field would land in the URL.
 * The submit button is aria-disabled (not disabled) while the form is not
 * ready, so a click still runs the checks; it is truly disabled while the
 * request is out.
 */

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TOO_MANY } from "@/app/lib/rateLimitWords";
import { passwordProblem, passwordRules } from "@/app/lib/passwordPolicy";
import { COURSE_AUTH_CONTENT, FLOW, SHARED } from "./content";
import type { DoorCourse } from "./doorContent";
import DoorShell, { DOOR_ICON } from "./DoorShell";

/* the live forgot page's check */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DOTS = <span className="r8-dots" aria-hidden="true"><i /><i /><i /></span>;

/** One labelled input, with its own SHOW/HIDE when given one. */
function FlowField({
  id, label, type, value, onChange, onBlur, auto, inputMode, placeholder, invalid, fieldError, toggle, after,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void; onBlur: () => void;
  auto: string; inputMode?: "email"; placeholder: string; invalid: boolean; fieldError?: string | null;
  toggle?: { shown: boolean; onToggle: () => void; ariaShow: string; ariaHide: string }; after?: ReactNode;
}) {
  return (
    <div className="r8-field" data-invalid={invalid ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      <div className="in">
        <input
          className={toggle ? "has-toggle" : undefined}
          id={id}
          type={type}
          autoComplete={auto}
          inputMode={inputMode}
          placeholder={placeholder}
          aria-describedby={`r8-msg ${id}-err`}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle.onToggle}
            aria-pressed={toggle.shown}
            aria-label={toggle.shown ? toggle.ariaHide : toggle.ariaShow}
            aria-controls={id}
          >
            {toggle.shown ? SHARED.toggle.hide : SHARED.toggle.show}
          </button>
        )}
      </div>
      <p className="r8-fielderr" id={`${id}-err`} hidden={!fieldError}>{fieldError}</p>
      {after}
    </div>
  );
}

/* ════════ FORGOT PASSWORD ════════ */
export function DoorForgot({ course }: { course: DoorCourse }) {
  const t = COURSE_AUTH_CONTENT[course];
  const F = FLOW.forgot;

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = touched && email.length > 0 && !emailValid;
  const sent = phase === "sent";
  const busy = phase === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);
    if (!emailValid) {
      setError(F.errInvalid);
      return;
    }
    setPhase("loading");
    try {
      // Always succeeds from the UI's point of view: the API never reveals
      // whether the email matched an account (anti-enumeration).
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, course: t.slug }),
      });
      /* The one answer that is not "sent": too many requests. */
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === "string" ? data.error : TOO_MANY);
        setPhase("idle");
        return;
      }
    } catch {
      /* swallow: same posture; the email itself is the retry path */
    }
    setPhase("sent");
  };

  return (
    <DoorShell
      course={course}
      mode="forgot"
      title={F.title}
      sub={F.sub}
      error={error}
      foot={<p className="r8-alt">{F.switchLead} <Link href={`${t.base}/login`}>{F.switchLink}</Link></p>}
    >
      {sent ? (
        <div className="r8-card" role="status" aria-live="polite">
          <b>{DOOR_ICON.tick}<span>{F.sentTitle}</span></b>
          <p>{F.sentBefore}<em>{email}</em>{F.sentAfter}</p>
        </div>
      ) : (
        <form method="post" onSubmit={handleSubmit} noValidate>
          <div className="r8-fields">
            <FlowField
              id="ca-email"
              label={SHARED.labels.email}
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched(true)}
              auto="email"
              inputMode="email"
              placeholder={SHARED.placeholders.email}
              invalid={emailInvalid || (!!error && !emailValid)}
              fieldError={emailInvalid ? F.fieldErr : null}
            />
          </div>
          <button className="r8-btn wide gap" type="submit" disabled={busy} aria-disabled={!emailValid || undefined} aria-busy={busy}>
            {busy ? <>{F.busy}{DOTS}</> : <>{F.submit}{DOOR_ICON.arrow}</>}
          </button>
          <p className="r8-hint" hidden={emailValid}>{F.hint}</p>
        </form>
      )}
    </DoorShell>
  );
}

/* ════════ RESET PASSWORD ════════ */
export function DoorReset({ course }: { course: DoorCourse }) {
  const t = COURSE_AUTH_CONTENT[course];
  const F = FLOW.reset;
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<{ password?: boolean; confirm?: boolean }>({});
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  /* The same rule the server enforces (app/lib/passwordPolicy.ts). */
  const { length: ruleLength, upper: ruleUpper, special: ruleSpecial } = passwordRules(password);
  const passwordOk = passwordProblem(password) === null;
  const confirmOk = confirm.length > 0 && password === confirm;
  const allReady = passwordOk && confirmOk;
  const done = phase === "done";
  const busy = phase === "loading";
  const noToken = !token;
  const missingHint = !passwordOk ? F.hintPw : !confirmOk ? F.hintConfirm : null;
  const confirmMismatch = !!touched.confirm && confirm.length > 0 && !confirmOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ password: true, confirm: true });
    if (!passwordOk) {
      setError(F.errWeak);
      return;
    }
    if (!confirmOk) {
      setError(F.errMismatch);
      return;
    }
    setPhase("loading");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? F.errServer);
        setPhase("idle");
        return;
      }
      setPhase("done");
      window.setTimeout(() => router.push(`${t.base}/login?reset=1`), 2200);
    } catch {
      setError(F.errNetwork);
      setPhase("idle");
    }
  };

  const foot = <p className="r8-alt">{F.backLead} <Link href={`${t.base}/login`}>{F.backLink}</Link></p>;

  if (noToken) {
    return (
      <DoorShell course={course} mode="reset" title={F.expiredTitle} sub={F.expiredBody} foot={foot}>
        <Link className="r8-btn wide" href={`${t.base}${SHARED.forgot.path}`}>{DOOR_ICON.key}<span>{F.expiredBtn}</span></Link>
      </DoorShell>
    );
  }
  if (done) {
    return (
      <DoorShell course={course} mode="reset" title={F.doneTitle} sub={null} foot={foot}>
        <div className="r8-card" role="status" aria-live="polite">
          <b>{DOOR_ICON.tick}<span>{F.doneHead}</span></b>
          <p>{F.doneBody}</p>
        </div>
      </DoorShell>
    );
  }

  const rules = (
    <ul className="r8-rules" aria-label={F.rulesAria}>
      {[ruleLength, ruleUpper, ruleSpecial].map((pass, i) => (
        <li key={F.rules[i]} data-pass={pass ? "true" : "false"}>{F.rules[i]}</li>
      ))}
    </ul>
  );

  return (
    <DoorShell course={course} mode="reset" title={F.title} sub={F.sub} error={error} foot={foot}>
      <form method="post" onSubmit={handleSubmit} noValidate>
        <div className="r8-fields">
          <FlowField
            id="ca-password"
            label={F.labelPw}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            onBlur={() => setTouched((v) => ({ ...v, password: true }))}
            auto="new-password"
            placeholder={SHARED.placeholders.passwordSignup}
            invalid={!!touched.password && password.length > 0 && !passwordOk}
            toggle={{ shown: showPassword, onToggle: () => setShowPassword((v) => !v), ariaShow: SHARED.toggle.ariaShow, ariaHide: SHARED.toggle.ariaHide }}
            after={rules}
          />
          <FlowField
            id="ca-confirm"
            label={SHARED.labels.confirm}
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={setConfirm}
            onBlur={() => setTouched((v) => ({ ...v, confirm: true }))}
            auto="new-password"
            placeholder={SHARED.placeholders.confirm}
            invalid={confirmMismatch}
            fieldError={confirmMismatch ? F.fieldMismatch : null}
            toggle={{ shown: showConfirm, onToggle: () => setShowConfirm((v) => !v), ariaShow: F.ariaShowC, ariaHide: F.ariaHideC }}
          />
        </div>
        <button className="r8-btn wide gap" type="submit" disabled={busy} aria-disabled={!allReady || undefined} aria-busy={busy}>
          {busy ? <>{F.busy}{DOTS}</> : <>{F.submit}{DOOR_ICON.arrow}</>}
        </button>
        <p className="r8-hint" hidden={!missingHint}>{missingHint}</p>
      </form>
    </DoorShell>
  );
}

"use client";

/**
 * The forgot-password and reset-password pages in each course's Night
 * Console (landing lab round 6, 2026-11-23). The behaviour is the live
 * generic pages' (app/forgot-password, app/reset-password), carried over
 * line for line: the same email check, the same API calls, the same order
 * of the reset checks, the same states. What differs is the skin, the
 * course's own links (log in, request a new link) and one extra field on
 * the forgot request: the course slug, which the API maps through a fixed
 * allowlist to this course's reset page for the emailed link. The token
 * itself is untouched.
 *
 * The inputs carry no `name`, as the live AuthField inputs do not: a form
 * submitted before hydration falls back to a native GET, and a named
 * password field would land in the URL.
 *
 * The submit button is not truly `disabled` while the form is not ready (the
 * live pages disable it); it carries aria-disabled and the dimmed look and a
 * click still runs the live checks, so their error strings are reachable by
 * keyboard and screen reader. It is truly disabled while the request is out.
 */

import Link from "next/link";
import { TOO_MANY } from "@/app/lib/rateLimitWords";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COURSE_AUTH_CONTENT, FLOW, SHARED, type CourseAuthKey } from "./content";
import NightShell, { TICK, type NightLight } from "./NightShell";
import { passwordProblem, passwordRules } from "@/app/lib/passwordPolicy";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* the live forgot page's check */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TICK_SM = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
const KEY = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 5l3 3M13 8l3 3" /></svg>
);
const DOTS = <span className="na1-dots" aria-hidden="true"><i /><i /><i /></span>;

/** One labelled input in the console, with its own SHOW/HIDE when given one. */
function FlowField({
  id, label, type, value, onChange, onBlur, auto, inputMode, placeholder, i, invalid, fieldError, toggle, last, after,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void; onBlur: () => void;
  auto: string; inputMode?: "email"; placeholder: string; i: number; invalid: boolean; fieldError?: string | null;
  toggle?: { shown: boolean; onToggle: () => void; ariaShow: string; ariaHide: string }; last?: boolean; after?: ReactNode;
}) {
  return (
    <div className={`na1-field${last ? " last" : ""}`} style={{ "--i": i } as Vars} data-invalid={invalid ? "" : undefined}>
      <label className="na1-label" htmlFor={id}>{label}</label>
      <div className="na1-box">
        <input
          className={`na1-input${toggle ? " has-toggle" : ""}`}
          id={id}
          type={type}
          autoComplete={auto}
          inputMode={inputMode}
          placeholder={placeholder}
          aria-describedby={`na1-msg ${id}-err`}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {toggle && (
          <button
            type="button"
            className="na1-toggle"
            onClick={toggle.onToggle}
            aria-pressed={toggle.shown}
            aria-label={toggle.shown ? toggle.ariaHide : toggle.ariaShow}
            aria-controls={id}
          >
            {toggle.shown ? SHARED.toggle.hide : SHARED.toggle.show}
          </button>
        )}
        <i className="na1-hair" aria-hidden="true" />
      </div>
      <p className="na1-fielderr" id={`${id}-err`} hidden={!fieldError}>{fieldError}</p>
      {after}
    </div>
  );
}

/* ════════ FORGOT PASSWORD ════════ */
export function NightForgot({ course }: { course: CourseAuthKey }) {
  const t = COURSE_AUTH_CONTENT[course];
  const F = FLOW.forgot;
  const lightRef = useRef<NightLight | null>(null);

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
    lightRef.current?.flash();
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
    <NightShell
      course={course}
      mode="forgot"
      title={F.title}
      sub={F.sub}
      error={error}
      lightRef={lightRef}
      foot={<p className="na1-switch">{F.switchLead} <Link href={`${t.base}/login`}>{F.switchLink}</Link></p>}
    >
      {sent ? (
        <div className="na1-card" role="status" aria-live="polite">
          <b>{TICK}<span>{F.sentTitle}</span></b>
          <p>{F.sentBefore}<em>{email}</em>{F.sentAfter}</p>
        </div>
      ) : (
        <form className="na1-form" method="post" onSubmit={handleSubmit} noValidate>
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
            i={0}
            invalid={emailInvalid || (!!error && !emailValid)}
            fieldError={emailInvalid ? F.fieldErr : null}
            last
          />
          <button className="na1-btn" type="submit" disabled={busy} aria-disabled={!emailValid || undefined} aria-busy={busy}>
            <span className="na1-btn-label">{busy ? <>{F.busy}{DOTS}</> : F.submit}</span>
          </button>
          <p className="na1-hint" hidden={emailValid}>{F.hint}</p>
        </form>
      )}
    </NightShell>
  );
}

/* ════════ RESET PASSWORD ════════ */
export function NightReset({ course }: { course: CourseAuthKey }) {
  const t = COURSE_AUTH_CONTENT[course];
  const F = FLOW.reset;
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const lightRef = useRef<NightLight | null>(null);

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
    lightRef.current?.flash();
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

  const foot = <p className="na1-switch">{F.backLead} <Link href={`${t.base}/login`}>{F.backLink}</Link></p>;

  if (noToken) {
    return (
      <NightShell course={course} mode="reset" title={F.expiredTitle} sub={F.expiredBody} lightRef={lightRef} foot={foot}>
        <Link className="na1-btn na1-linkbtn" href={`${t.base}${SHARED.forgot.path}`}>{KEY}<span>{F.expiredBtn}</span></Link>
      </NightShell>
    );
  }
  if (done) {
    return (
      <NightShell course={course} mode="reset" title={F.doneTitle} sub={null} lightRef={lightRef} foot={foot}>
        <div className="na1-card" role="status" aria-live="polite">
          <b>{TICK}<span>{F.doneHead}</span></b>
          <p>{F.doneBody}</p>
        </div>
      </NightShell>
    );
  }

  const rules = (
    <div className="na1-rules" role="group" aria-label={F.rulesAria}>
      {[ruleLength, ruleUpper, ruleSpecial].map((pass, i) => (
        <span key={F.rules[i]} className="na1-rule" data-pass={pass ? "true" : "false"}>
          <i aria-hidden="true" />{TICK_SM}<span>{F.rules[i]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <NightShell
      course={course}
      mode="reset"
      title={F.title}
      sub={course === "cyberheroes" ? F.subFamily : F.sub}
      error={error}
      lightRef={lightRef}
      foot={foot}
    >
      <form className="na1-form" method="post" onSubmit={handleSubmit} noValidate>
        <FlowField
          id="ca-password"
          label={F.labelPw}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((v) => ({ ...v, password: true }))}
          auto="new-password"
          placeholder={SHARED.placeholders.passwordSignup}
          i={0}
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
          i={1}
          invalid={confirmMismatch}
          fieldError={confirmMismatch ? F.fieldMismatch : null}
          toggle={{ shown: showConfirm, onToggle: () => setShowConfirm((v) => !v), ariaShow: F.ariaShowC, ariaHide: F.ariaHideC }}
          last
        />
        <button className="na1-btn" type="submit" disabled={busy} aria-disabled={!allReady || undefined} aria-busy={busy}>
          <span className="na1-btn-label">{busy ? <>{F.busy}{DOTS}</> : F.submit}</span>
        </button>
        <p className="na1-hint" hidden={!missingHint}>{missingHint}</p>
      </form>
    </NightShell>
  );
}

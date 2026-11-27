"use client";

/**
 * The daylight door's sign-in and sign-up form (landing lab round 8,
 * r8-door.html, owner 2026-11-26) for AI Cleared, AI Fluent and Cyber
 * Awareness. The same words, fields, checks, error states and auth plumbing
 * as the Night Console it replaces (useCourseAuth, unchanged): only the
 * skin is new. The shell around it is DoorShell.
 *
 * As on the Night Console (and the live AuthField inputs), the inputs carry
 * no `name` and the form is method="post": a form submitted before
 * hydration must never put a password in the URL.
 */

import Link from "next/link";
import { FLOW, SHARED } from "./content";
import { SECURED_FORM, type DoorKey } from "./doorContent";
import { passwordRules } from "@/app/lib/passwordPolicy";
import { useCourseAuth, type AuthMode, type FieldKey } from "./useCourseAuth";
import DoorShell, { DOOR_ICON } from "./DoorShell";

export default function DoorConsole({ course, mode }: { course: DoorKey; mode: AuthMode }) {
  const auth = useCourseAuth(course, mode);
  const { t, isLogin, justRegistered, field, showPw, toggleShowPw, error, busy, invalid, submit } = auth;
  const C = t.copy;
  /* The firm door asks for the work email and offers no sign-up: a seat is
     claimed through the invite link, which has its own way in. */
  const firm = course === "secured";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const sibling = isLogin ? `${t.base}/signup` : `${t.base}/login`;
  const sw = isLogin ? SHARED.switchLine.login : SHARED.switchLine.signup;
  const showNotice = isLogin && justRegistered && !error;
  const pwType = showPw ? "text" : "password";

  /* a plain render helper, not a component: the inputs must keep their identity across keystrokes */
  const renderField = ({ id, k, type, auto, toggle }: { id: string; k: FieldKey; type: string; auto: string; toggle?: boolean }) => {
    const ph = k === "password" ? (isLogin ? SHARED.placeholders.passwordLogin : SHARED.placeholders.passwordSignup)
      : firm && k === "email" ? SECURED_FORM.emailPlaceholder
      : SHARED.placeholders[k];
    const label = firm && k === "email" ? SECURED_FORM.emailLabel : SHARED.labels[k];
    return (
      <div key={id} className="r8-field" data-invalid={invalid.includes(k) ? "" : undefined}>
        <label htmlFor={id}>{label}</label>
        <div className="in">
          <input
            className={toggle ? "has-toggle" : undefined}
            id={id}
            type={type}
            autoComplete={auto}
            inputMode={type === "email" ? "email" : undefined}
            placeholder={ph}
            aria-describedby="r8-msg"
            aria-invalid={invalid.includes(k) || undefined}
            {...field(k)}
          />
          {toggle && (
            <button
              type="button"
              onClick={toggleShowPw}
              aria-pressed={showPw}
              aria-label={showPw ? SHARED.toggle.ariaHide : SHARED.toggle.ariaShow}
              aria-controls={id}
            >
              {showPw ? SHARED.toggle.hide : SHARED.toggle.show}
            </button>
          )}
        </div>
      </div>
    );
  };

  /* The signup form shows the server's password rule as it is met. */
  const pwValue = field("password").value;
  const rules = passwordRules(pwValue);

  return (
    <DoorShell
      course={course}
      mode={mode}
      title={isLogin ? C.loginTitle : C.signupTitle}
      sub={isLogin ? C.loginSub : C.signupSub}
      notice={showNotice ? C.registeredNotice : ""}
      error={error}
      foot={firm ? (
        <>
          <p className="r8-alt">{SECURED_FORM.invited}</p>
          <p className="r8-alt" style={{ marginTop: 6 }}>{SECURED_FORM.buyLead} <Link href={SECURED_FORM.buyHref}>{SECURED_FORM.buyLink}</Link></p>
        </>
      ) : <p className="r8-alt">{sw.lead} <Link href={sibling}>{sw.link}</Link></p>}
    >
      <form method="post" onSubmit={onSubmit} noValidate>
        {isLogin ? (
          <>
            <div className="r8-fields">
              {renderField({ id: "ca-email", k: "email", type: "email", auto: "email" })}
              {renderField({ id: "ca-password", k: "password", type: pwType, auto: "current-password", toggle: true })}
            </div>
            <Link className="r8-forgot" href={`${t.base}${SHARED.forgot.path}`}>{SHARED.forgot.text}</Link>
          </>
        ) : (
          <>
            <div className="r8-fields two">
              {renderField({ id: "ca-name", k: "name", type: "text", auto: "name" })}
              {renderField({ id: "ca-email", k: "email", type: "email", auto: "email" })}
              {renderField({ id: "ca-password", k: "password", type: pwType, auto: "new-password", toggle: true })}
              {renderField({ id: "ca-confirm", k: "confirm", type: pwType, auto: "new-password" })}
            </div>
            <ul className="r8-rules" aria-label={FLOW.reset.rulesAria}>
              {[rules.length, rules.upper, rules.special].map((pass, i) => (
                <li key={FLOW.reset.rules[i]} data-pass={pass ? "true" : "false"}>{FLOW.reset.rules[i]}</li>
              ))}
            </ul>
          </>
        )}
        <button className={`r8-btn wide${isLogin ? "" : " gap"}`} type="submit" disabled={busy} aria-busy={busy}>
          {busy
            ? <>{SHARED.busy}<span className="r8-dots" aria-hidden="true"><i /><i /><i /></span></>
            : <>{isLogin ? C.submitLogin : C.submitSignup}{DOOR_ICON.arrow}</>}
        </button>
      </form>
    </DoorShell>
  );
}

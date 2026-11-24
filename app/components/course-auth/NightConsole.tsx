"use client";

/**
 * Night Console: the sign-in and sign-up pages of every course (the four
 * cyber courses since the auth design lab round 5, a03, 2026-11-22; Desk
 * Ready, AI Cleared, AI Fluent and Cyber Awareness since round 6,
 * 2026-11-23). Same words, the same fields and the same auth plumbing
 * (useCourseAuth) as the pages it replaced; only the skin is new. The shell
 * (key light, console, idle, chrome) is NightShell.
 */

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { SHARED, type CourseAuthKey } from "./content";
import { useCourseAuth, type AuthMode, type FieldKey } from "./useCourseAuth";
import NightShell, { type NightLight } from "./NightShell";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function NightConsole({ course, mode }: { course: CourseAuthKey; mode: AuthMode }) {
  const auth = useCourseAuth(course, mode);
  const { t, isLogin, justRegistered, field, showPw, toggleShowPw, error, busy, invalid, submit } = auth;
  const C = t.copy;
  const lightRef = useRef<NightLight | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(() => lightRef.current?.flash());
  };

  const sibling = isLogin ? `${t.base}/signup` : `${t.base}/login`;
  const sw = isLogin ? SHARED.switchLine.login : SHARED.switchLine.signup;
  const title = isLogin ? C.loginTitle : C.signupTitle;
  const sub = isLogin ? C.loginSub : C.signupSub;
  const submitLabel = isLogin ? C.submitLogin : C.submitSignup;
  const showNotice = isLogin && justRegistered && !error;

  /* a plain render helper, not a component: the inputs must keep their identity across keystrokes */
  const renderField = ({ id, k, type, auto, i, toggle, last }: { id: string; k: FieldKey; type: string; auto: string; i: number; toggle?: boolean; last?: boolean }) => {
    const ph = k === "password" ? (isLogin ? SHARED.placeholders.passwordLogin : SHARED.placeholders.passwordSignup) : SHARED.placeholders[k];
    return (
      <div key={id} className={`na1-field${last ? " last" : ""}`} style={{ "--i": i } as Vars} data-invalid={invalid.includes(k) ? "" : undefined}>
        <label className="na1-label" htmlFor={id}>{SHARED.labels[k]}</label>
        <div className="na1-box">
          <input
            className={`na1-input${toggle ? " has-toggle" : ""}`}
            id={id}
            type={type}
            autoComplete={auto}
            inputMode={type === "email" ? "email" : undefined}
            placeholder={ph}
            aria-describedby="na1-msg"
            {...field(k)}
          />
          {toggle && (
            <button
              type="button"
              className="na1-toggle"
              onClick={toggleShowPw}
              aria-pressed={showPw}
              aria-label={showPw ? SHARED.toggle.ariaHide : SHARED.toggle.ariaShow}
              aria-controls={id}
            >
              {showPw ? SHARED.toggle.hide : SHARED.toggle.show}
            </button>
          )}
          <i className="na1-hair" aria-hidden="true" />
        </div>
      </div>
    );
  };

  const pwType = showPw ? "text" : "password";

  return (
    <NightShell
      course={course}
      mode={mode}
      title={title}
      sub={sub}
      typedSub={course === "pro"}
      notice={showNotice ? C.registeredNotice : ""}
      error={error}
      lightRef={lightRef}
      foot={<p className="na1-switch">{sw.lead} <Link href={sibling}>{sw.link}</Link></p>}
    >
      <form className="na1-form" method="post" onSubmit={onSubmit} noValidate>
        {!isLogin && renderField({ id: "ca-name", k: "name", type: "text", auto: "name", i: 0 })}
        {renderField({ id: "ca-email", k: "email", type: "email", auto: "email", i: isLogin ? 0 : 1 })}
        {renderField({ id: "ca-password", k: "password", type: pwType, auto: isLogin ? "current-password" : "new-password", i: isLogin ? 1 : 2, toggle: true })}
        {isLogin ? (
          <div className="na1-row"><Link className="na1-forgot" href={`${t.base}${SHARED.forgot.path}`}>{SHARED.forgot.text}</Link></div>
        ) : (
          renderField({ id: "ca-confirm", k: "confirm", type: pwType, auto: "new-password", i: 3, last: true })
        )}
        <button className="na1-btn" type="submit" disabled={busy} aria-busy={busy}>
          <span className="na1-btn-label">
            {busy ? <>{SHARED.busy}<span className="na1-dots" aria-hidden="true"><i /><i /><i /></span></> : submitLabel}
          </span>
        </button>
      </form>
    </NightShell>
  );
}

"use client";

/**
 * Night Console: the sign-in and sign-up pages of the four cyber courses
 * (Cyber Heroes, Cyber Explorers, Cyber Ops, Cyber Pro). Owner's pick from
 * the auth design lab, round 5 (a03), 2026-11-22, ported here with the same
 * words, the same fields and the same auth plumbing as the pages it replaces
 * (useCourseAuth). Only the skin is new: one key light at the top left and
 * the form as the course's console, whose sheen and lit rim answer the light
 * and lean toward the focused field; each course keeps its own idle.
 *
 * Fonts load here so every route gets them (Ops has no layout of its own
 * and used to render in the system font). Space Grotesk and Geist Mono come
 * from the root layout.
 */

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Chakra_Petch, Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import CubeMark from "@/app/components/CubeMark";
import { SHARED, type CourseAuthKey } from "./content";
import { useCourseAuth, type AuthMode, type FieldKey } from "./useCourseAuth";
import { explorersIdle, heroesIdle, keyLight, opsIdle, proIdle, reduced, type Idle } from "./nightFx";
import "./night-console.css";

const fredoka = Fredoka({ weight: ["600", "700"], subsets: ["latin"], variable: "--na1-fredoka", display: "swap" });
const inter = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--na1-inter", display: "swap" });
const jet = JetBrains_Mono({ weight: ["400", "500", "700", "800"], subsets: ["latin"], variable: "--na1-jet", display: "swap" });
const chakra = Chakra_Petch({ weight: ["700"], subsets: ["latin"], variable: "--na1-chakra", display: "swap" });

export type NightCourse = Exclude<CourseAuthKey, "desk">;

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ── lockups: the canonical course marks (CourseLockup.tsx glyphs) with the
   stacked "by [cube] AlgorithmX" byline the landings carry ── */
const MARK: Record<NightCourse, React.ReactNode> = {
  cyberheroes: (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
      <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
    </svg>
  ),
  cyberexplorers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="6.4" />
      <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
      <circle cx="12" cy="12" r="1.6" fill="#22d3ee" stroke="none" />
    </svg>
  ),
  ops: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b7bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.4 7.4 V3.4 H7.4 M16.6 3.4 H20.6 V7.4 M20.6 16.6 V20.6 H16.6 M7.4 20.6 H3.4 V16.6" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.4" />
      <circle cx="12" cy="12" r="2.9" strokeWidth="1" opacity="0.5" />
      <path d="M12 4.8 V7 M12 17 V19.2 M4.8 12 H7 M17 12 H19.2" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.2" fill="#8b7bff" stroke="none" />
    </svg>
  ),
  pro: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden="true">
      <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
      <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 15.5 H16.2" strokeLinecap="round" />
    </svg>
  ),
};
/* wordmark [plain part, accented part] */
const WORD: Record<NightCourse, [string, string]> = {
  cyberheroes: ["CYBER ", "HEROES"],
  cyberexplorers: ["CYBER EXPLORERS", ""],
  ops: ["CYBER OPS", ""],
  pro: ["CYBER ", "PRO"],
};

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
const TICK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.6 2.5L16 9.5" /></svg>
);

/* Explorers: three rings, ticks, a dashed ring turning once per 160 s (CSS). */
const RETICLE = (
  <svg className="na1-ret-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <g className="na1-ret" fill="none" stroke="rgba(34,211,238,.16)" strokeWidth="1">
      <circle cx="500" cy="500" r="190" />
      <circle cx="500" cy="500" r="300" stroke="rgba(34,211,238,.12)" />
      <circle cx="500" cy="500" r="420" stroke="rgba(34,211,238,.08)" />
      <g stroke="rgba(200,246,255,.22)">
        <path d="M500 60v40M500 900v40M60 500h40M900 500h40" />
        <path d="M500 120v18M500 862v18M120 500h18M862 500h18" stroke="rgba(200,246,255,.14)" />
        <circle cx="500" cy="500" r="360" stroke="rgba(34,211,238,.18)" strokeDasharray="2 22" className="na1-ret-dash" />
      </g>
    </g>
  </svg>
);

export default function NightConsole({ course, mode }: { course: NightCourse; mode: AuthMode }) {
  const auth = useCourseAuth(course, mode);
  const { t, isLogin, justRegistered, field, showPw, toggleShowPw, error, busy, invalid, submit } = auth;
  const C = t.copy;

  const rootRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<ReturnType<typeof keyLight> | null>(null);
  const idleHandleRef = useRef<Idle | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current, con = consoleRef.current, key = keyRef.current, host = idleRef.current;
    if (!root || !con || !key || !host) return;
    const still = reduced();
    const env = { paused: () => pausedRef.current, still };
    lightRef.current = keyLight(root, con, key, still);
    const idle: Idle =
      course === "cyberheroes" ? heroesIdle(host, env)
      : course === "ops" ? opsIdle(host, env)
      : course === "pro" ? proIdle(typedRef.current, env)
      : explorersIdle();
    idleHandleRef.current = idle;
    return () => {
      idle.destroy();
      lightRef.current?.destroy();
      lightRef.current = null;
      idleHandleRef.current = null;
    };
  }, [course]);

  const togglePaused = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) idleHandleRef.current?.kick();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(() => lightRef.current?.flash());
  };

  const sibling = isLogin ? `${t.base}/signup` : `${t.base}/login`;
  const sw = isLogin ? SHARED.switchLine.login : SHARED.switchLine.signup;
  const title = isLogin ? C.loginTitle : C.signupTitle;
  const sub = isLogin ? C.loginSub : C.signupSub;
  const submitLabel = isLogin ? C.submitLogin : C.submitSignup;
  const [wordPlain, wordAcc] = WORD[course];
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
            name={k}
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
    <div
      ref={rootRef}
      className={`na1 ${fredoka.variable} ${inter.variable} ${jet.variable} ${chakra.variable}`}
      data-course={course}
      data-mode={mode}
      data-paused={paused ? "" : undefined}
    >
      <div className="na1-idle" ref={idleRef} aria-hidden="true">{course === "cyberexplorers" ? RETICLE : null}</div>
      <div className="na1-key" ref={keyRef} aria-hidden="true"><span className="cone" /><i className="breath" /><i className="b" /></div>
      <div className="na1-vignette" aria-hidden="true" />

      <header className="na1-chrome">
        <Link className="na1-lockup" href={t.base} aria-label={`${t.courseName} by AlgorithmX`}>
          {MARK[course]}
          <span className="lk-col">
            <span className="lk-name">{wordPlain}{wordAcc ? <b>{wordAcc}</b> : null}</span>
            <span className="lk-by"><span className="dim">by</span><CubeMark size={12} color="#5f8dff" code /><span className="dim">AlgorithmX</span></span>
          </span>
        </Link>
        <Link className="na1-back" href={t.base}>{ARROW}<span>{SHARED.back} {t.courseName}</span></Link>
      </header>

      <main className="na1-stage">
        <section className="na1-console" ref={consoleRef} aria-labelledby="na1-title">
          <i className="na1-corner tl" aria-hidden="true" /><i className="na1-corner tr" aria-hidden="true" /><i className="na1-corner bl" aria-hidden="true" /><i className="na1-corner br" aria-hidden="true" />
          <div className="na1-head">
            <h1 className="na1-title" id="na1-title">{title}{course === "pro" ? <span className="na1-caret" aria-hidden="true" /> : null}</h1>
            <p className="na1-sub">
              {course === "pro" ? (
                <>
                  <span className="na1-sub-full">{sub}</span>
                  <span className="na1-typed" aria-hidden="true" data-text={sub} ref={typedRef} />
                </>
              ) : sub}
            </p>
          </div>

          <p className="na1-msg ok" id="na1-ok" role="status" aria-live="polite" hidden={!showNotice}>
            {TICK}<span>{showNotice ? C.registeredNotice : ""}</span>
          </p>
          <p className="na1-msg err" id="na1-msg" role="alert" aria-live="polite" hidden={!error}>
            {WARN}<span>{error}</span>
          </p>

          <form className="na1-form" onSubmit={onSubmit} noValidate>
            {!isLogin && renderField({ id: "ca-name", k: "name", type: "text", auto: "name", i: 0 })}
            {renderField({ id: "ca-email", k: "email", type: "email", auto: "email", i: isLogin ? 0 : 1 })}
            {renderField({ id: "ca-password", k: "password", type: pwType, auto: isLogin ? "current-password" : "new-password", i: isLogin ? 1 : 2, toggle: true })}
            {isLogin ? (
              <div className="na1-row"><Link className="na1-forgot" href={SHARED.forgot.href}>{SHARED.forgot.text}</Link></div>
            ) : (
              renderField({ id: "ca-confirm", k: "confirm", type: pwType, auto: "new-password", i: 3, last: true })
            )}
            <button className="na1-btn" type="submit" disabled={busy} aria-busy={busy}>
              <span className="na1-btn-label">
                {busy ? <>{SHARED.busy}<span className="na1-dots" aria-hidden="true"><i /><i /><i /></span></> : submitLabel}
              </span>
            </button>
          </form>

          <p className="na1-switch">{sw.lead} <Link href={sibling}>{sw.link}</Link></p>
        </section>
      </main>

      <button className="na1-motion" type="button" onClick={togglePaused} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>
        <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
        <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
      </button>
    </div>
  );
}

"use client";

/**
 * The Night Console shell: everything around the form that every course
 * auth page shares (the idle backdrop, the key light, the vignette, the
 * lockup and back link, the console with its title, sub and the two
 * message lines, the Pause/Play control). The login/signup body
 * (NightConsole) and the forgot/reset bodies (NightForgot, NightReset)
 * render inside it. Owner's pick from the auth design lab, round 5 (a03),
 * 2026-11-22, extended to every course and both password flows in round 6
 * (2026-11-23).
 *
 * Fonts load here so every route gets them (Ops has no layout of its own
 * and used to render in the system font). Space Grotesk and Geist Mono come
 * from the root layout.
 */

import Link from "next/link";
import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { Chakra_Petch, Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import CubeMark from "@/app/components/CubeMark";
import { COURSE_AUTH_CONTENT, SHARED, type CourseAuthKey } from "./content";
import { awarenessIdle, clearedIdle, deskIdle, explorersIdle, fluentIdle, heroesIdle, keyLight, opsIdle, proIdle, reduced, type Idle } from "./nightFx";
import "./night-console.css";

const fredoka = Fredoka({ weight: ["600", "700"], subsets: ["latin"], variable: "--na1-fredoka", display: "swap" });
const inter = Inter({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], variable: "--na1-inter", display: "swap" });
const jet = JetBrains_Mono({ weight: ["400", "500", "700", "800"], subsets: ["latin"], variable: "--na1-jet", display: "swap" });
const chakra = Chakra_Petch({ weight: ["700"], subsets: ["latin"], variable: "--na1-chakra", display: "swap" });

export type NightMode = "login" | "signup" | "forgot" | "reset";
export type NightLight = { flash: () => void };

/* ── lockups: the canonical course marks (CourseLockup.tsx glyphs; the four
   adult courses use the homepage card icons) with the stacked
   "by [cube] AlgorithmX" byline the landings carry ── */
const ico = (d: string, size: number, color: string, sw = 1.8) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const MARK: Record<CourseAuthKey, ReactNode> = {
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
  desk: ico("M3 4h18v12H3z M9 20h6M12 16v4", 23, "#7fb2ff", 1.7),
  cleared: ico("M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4", 23, "#2bbdd0"),
  fluent: ico("M13 2L3 14h7l-1 8 10-12h-7l1-8z", 22, "#8b7bff"),
  awareness: ico("M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-3.5-3.5", 22, "#f06ab8"),
};
/* wordmark [plain part, accented part] */
const WORD: Record<CourseAuthKey, [string, string]> = {
  cyberheroes: ["CYBER ", "HEROES"],
  cyberexplorers: ["CYBER EXPLORERS", ""],
  ops: ["CYBER OPS", ""],
  pro: ["CYBER ", "PRO"],
  desk: ["DESK ", "READY"],
  cleared: ["AI ", "CLEARED"],
  fluent: ["AI ", "FLUENT"],
  awareness: ["CYBER ", "AWARENESS"],
};

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
export const TICK = (
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

export default function NightShell({
  course,
  mode,
  title,
  sub,
  typedSub = false,
  notice = "",
  error = "",
  lightRef,
  children,
  foot,
}: {
  course: CourseAuthKey;
  mode: NightMode;
  title: string;
  /** null drops the sub line (the reset page's done state has none). */
  sub: string | null;
  /** Pro's login and signup type their sub out; the flows do not. */
  typedSub?: boolean;
  /** The success notice (role=status); empty hides it. */
  notice?: string;
  /** The error line (role=alert); empty hides it. */
  error?: string;
  /** Filled with the key light so the body can flash it on submit. */
  lightRef: MutableRefObject<NightLight | null>;
  children: ReactNode;
  foot: ReactNode;
}) {
  const t = COURSE_AUTH_CONTENT[course];
  const rootRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const idleHandleRef = useRef<Idle | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current, con = consoleRef.current, key = keyRef.current, host = idleRef.current;
    if (!root || !con || !key || !host) return;
    const still = reduced();
    const env = { paused: () => pausedRef.current, still };
    const light = keyLight(root, con, key, still);
    lightRef.current = light;
    const idle: Idle =
      course === "cyberheroes" ? heroesIdle(host, env)
      : course === "ops" ? opsIdle(host, env)
      : course === "pro" ? proIdle(typedRef.current, env)
      : course === "desk" ? deskIdle(host, con, env)
      : course === "cleared" ? clearedIdle(host, con, env)
      : course === "fluent" ? fluentIdle(host, con, env)
      : course === "awareness" ? awarenessIdle(host, con, env)
      : explorersIdle();
    idleHandleRef.current = idle;
    return () => {
      idle.destroy();
      light.destroy();
      lightRef.current = null;
      idleHandleRef.current = null;
    };
  }, [course, lightRef]);

  const togglePaused = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) idleHandleRef.current?.kick();
  };

  const [wordPlain, wordAcc] = WORD[course];
  const landing = t.landing ?? t.base;

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
        <Link className="na1-lockup" href={landing} aria-label={`${t.courseName} by AlgorithmX`}>
          {MARK[course]}
          <span className="lk-col">
            <span className="lk-name">{wordPlain}{wordAcc ? <b>{wordAcc}</b> : null}</span>
            <span className="lk-by"><span className="dim">by</span><CubeMark size={12} color="#5f8dff" code /><span className="dim">AlgorithmX</span></span>
          </span>
        </Link>
        <Link className="na1-back" href={landing}>{ARROW}<span>{SHARED.back} {t.courseName}</span></Link>
      </header>

      <main className="na1-stage">
        <section className="na1-console" ref={consoleRef} aria-labelledby="na1-title">
          <i className="na1-corner tl" aria-hidden="true" /><i className="na1-corner tr" aria-hidden="true" /><i className="na1-corner bl" aria-hidden="true" /><i className="na1-corner br" aria-hidden="true" />
          <div className="na1-head">
            <h1 className="na1-title" id="na1-title">{title}{course === "pro" ? <span className="na1-caret" aria-hidden="true" /> : null}</h1>
            {sub !== null && (
              <p className="na1-sub">
                {typedSub ? (
                  <>
                    <span className="na1-sub-full">{sub}</span>
                    <span className="na1-typed" aria-hidden="true" data-text={sub} ref={typedRef} />
                  </>
                ) : sub}
              </p>
            )}
          </div>

          <p className="na1-msg ok" id="na1-ok" role="status" aria-live="polite" hidden={!notice}>
            {TICK}<span>{notice}</span>
          </p>
          <p className="na1-msg err" id="na1-msg" role="alert" aria-live="polite" hidden={!error}>
            {WARN}<span>{error}</span>
          </p>

          {children}

          {foot}
        </section>
      </main>

      <button className="na1-motion" type="button" onClick={togglePaused} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>
        <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
        <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
      </button>
    </div>
  );
}

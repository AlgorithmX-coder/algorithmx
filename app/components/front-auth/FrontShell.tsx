"use client";

/**
 * The front door shell: everything around the form on the generic
 * /login, /signup, /forgot-password and /reset-password pages (the grid, the
 * cyan and violet pools, the six streams, the lockup and back link, the
 * white console with its title, sub and two message lines, the trust line
 * and the Pause/Play control). Owner ruling 25 Nov: the front door is
 * bright; the design is landing lab round 7, "Daylight Console"
 * (r7-front-*.html).
 *
 * The course sign-in pages keep their own Night Console (course-auth);
 * nothing here is shared with them.
 */

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import BrandCube from "@/app/components/BrandCube";
import { keyLight, reduced, streams, type Streams } from "./frontFx";
import "./front-auth.css";

const disp = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], variable: "--fra-disp", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--fra-sans", display: "swap" });
const jet = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--fra-jet", display: "swap" });

export type FrontMode = "login" | "signup" | "forgot" | "reset";
/** Filled by the shell so the page can flash the light and fire the streams on a successful submit. */
export type FrontFx = { success: () => void; flash: () => void };

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
export const TICK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.6 2.5L16 9.5" /></svg>
);

const ic = (d: ReactNode, s = 13) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
/** The trust-line icons (the lab's set). */
export const TRUST_ICON = {
  lock: ic(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>),
  key: ic(<><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 5l3 3M13 8l3 3" /></>, 12),
  hub: ic(<><circle cx="12" cy="12" r="3" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /></>),
  person: ic(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  shield: ic(<path d="M12 3l8 3v6c0 4.5-3.4 7.6-8 9-4.6-1.4-8-4.5-8-9V6l8-3z" />),
};

export type TrustItem = { text: string; icon?: ReactNode };

export default function FrontShell({
  mode,
  title,
  sub,
  notice = "",
  error = "",
  trust,
  fxRef,
  children,
  foot,
}: {
  mode: FrontMode;
  title: string;
  /** null drops the sub line. */
  sub: string | null;
  /** The success notice (role=status); empty hides it. */
  notice?: string;
  /** The error line (role=alert); empty hides it. */
  error?: string;
  /** The line under the console: an optional plain phrase, then the icon badges. */
  trust: TrustItem[];
  fxRef: MutableRefObject<FrontFx | null>;
  children: ReactNode;
  foot: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLElement>(null);
  const trustRef = useRef<HTMLParagraphElement>(null);
  const streamsRef = useRef<Streams | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current, con = consoleRef.current, key = keyRef.current, host = idleRef.current, chrome = chromeRef.current;
    if (!root || !con || !key || !host || !chrome) return;
    const still = reduced();
    const light = keyLight(root, con, key, still);
    const s = streams(host, { consoleEl: con, chromeEl: chrome, avoid: () => (trustRef.current ? [trustRef.current] : []) }, { paused: () => pausedRef.current, still });
    streamsRef.current = s;
    fxRef.current = { flash: () => light.flash(), success: () => { light.flash(); s.fire(); } };
    return () => {
      s.destroy();
      light.destroy();
      streamsRef.current = null;
      fxRef.current = null;
    };
  }, [fxRef]);

  const togglePaused = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) streamsRef.current?.kick();
  };

  return (
    <div
      ref={rootRef}
      className={`fra ${disp.variable} ${sans.variable} ${jet.variable}`}
      data-mode={mode}
      data-paused={paused ? "" : undefined}
    >
      <div className="fra-idle" ref={idleRef} aria-hidden="true" />
      <div className="fra-key" ref={keyRef} aria-hidden="true"><i className="breath" /><i className="b" /></div>
      <div className="fra-grid" aria-hidden="true" />

      <header className="fra-chrome" ref={chromeRef}>
        <Link className="fra-lockup" href="/" aria-label="AlgorithmX home">
          <BrandCube size={22} />
          <span className="fra-word"><span className="main">ALGORITHM</span><span className="x">X</span></span>
        </Link>
        <Link className="fra-back" href="/">{ARROW}<span>Back to home</span></Link>
      </header>

      <main className="fra-stage">
        <div className="fra-wrap">
          <section className="fra-console" ref={consoleRef} aria-labelledby="fra-title">
            <div className="fra-head">
              <h1 className="fra-title" id="fra-title">{title}</h1>
              {sub !== null && <p className="fra-sub">{sub}</p>}
            </div>

            <p className="fra-msg ok" id="fra-ok" role="status" aria-live="polite" hidden={!notice}>
              {TICK}<span>{notice}</span>
            </p>
            <p className="fra-msg err" id="fra-msg" role="alert" aria-live="polite" hidden={!error}>
              {WARN}<span>{error}</span>
            </p>

            {children}

            {foot}
          </section>
          <p className="fra-trust" ref={trustRef}>
            {trust.map((t, i) => (
              <Fragment key={t.text}>
                {/* a thin bar after the plain phrase, before the badges */}
                {i > 0 && !trust[i - 1].icon && <span className="sep" aria-hidden="true">|</span>}
                <span>{t.icon}{t.text}</span>
              </Fragment>
            ))}
          </p>
        </div>
      </main>

      <button className="fra-motion" type="button" onClick={togglePaused} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>
        <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
        <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
      </button>
    </div>
  );
}

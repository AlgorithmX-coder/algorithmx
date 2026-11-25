"use client";

/**
 * The Cyber Heroes portal shell ("Lit Map", landing lab round 6, v1, owner
 * 2026-11-23): /onboarding, /welcome, /dashboard and /cyberhq. The night
 * sky with one amber key light and faint hills, the Cyber Heroes lockup in
 * a capsule nav (with the child's chip and the portal pills on the signed-in
 * pages), the footer with the Pause control, and one polite live region.
 *
 * This file only draws. The pages keep their own data, forms, server
 * actions and redirects; they pass the nav's right-hand side in as `navRight`.
 */

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Fredoka, JetBrains_Mono, Nunito } from "next/font/google";
import { nightSky, rise } from "./heroesFx";
import "./heroes-portal.css";

const fredoka = Fredoka({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--hlm-fredoka", display: "swap" });
const nunito = Nunito({ weight: ["500", "600", "700", "800", "900"], subsets: ["latin"], variable: "--hlm-nunito", display: "swap" });
const jet = JetBrains_Mono({ weight: ["500", "700"], subsets: ["latin"], variable: "--hlm-jet", display: "swap" });

/* ── icons (explicit display: the global svg rule would stack them) ── */
const P = {
  arr: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  tick: "M5 12.5l4.5 4.5L19 7.5",
};
export function Icon({ name, size, sw = 2.6 }: { name: keyof typeof P; size?: number; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={name === "tick" ? 3.4 : sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}>
      <path d={P[name]} />
    </svg>
  );
}
export const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}><path d="M7 4.5h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4.5v1.5a3 3 0 0 0 3 3M17 6h2.5v1.5a3 3 0 0 1-3 3M12 13.5V17m-3.5 3h7" /></svg>
);
export const OutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}><path d="M14 4.5H7.5A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5H14" /><path d="M17 8.5 20.5 12 17 15.5M20 12h-9" /></svg>
);
export const StarIcon = ({ off }: { off?: boolean }) => (
  <svg className={off ? "off" : undefined} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "inline-block" }}><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z" /></svg>
);
export const CertIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}><rect x="3.5" y="4" width="17" height="12" rx="2" /><path d="M7.5 8.5h9M7.5 11.5h5" /><circle cx="16" cy="16.5" r="2.6" /><path d="M14.6 18.6 14 21.5l2-1 2 1-.6-2.9" /></svg>
);
export const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "inline-block" }}><path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" /></svg>
);
export const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ display: "inline-block" }}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.8 3.1-6.3 7-6.3s7 2.5 7 6.3" /></svg>
);
export const Chevrons = ({ n }: { n: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}>
    {Array.from({ length: n }, (_, i) => <path key={i} d={`M6 ${16 - i * 5}l6-4 6 4`} />)}
  </svg>
);

/* The Cyber Heroes lockup (CourseLockup "heroes" glyph, night tone) with the
   stacked "by AlgorithmX" byline the course pages carry. */
function Lockup() {
  return (
    <>
      <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0, transform: "rotate(-7deg)", filter: "drop-shadow(0 0 8px rgba(255,179,71,.35))" }}>
        <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
        <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--hlm-disp)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: ".02em", color: "#eaf6ff", whiteSpace: "nowrap" }}>CYBER <span style={{ color: "#ffb347" }}>HEROES</span></span>
        <span style={{ fontFamily: "var(--hlm-mono)", fontWeight: 500, fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: "#eaf6ff", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <span style={{ opacity: 0.6 }}>by</span>
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", margin: "0 3px", filter: "drop-shadow(0 0 4px rgba(95,141,255,.7))" }}><g fill="none" stroke="#5f8dff" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 2.5 21 7.25v9.5L12 21.5 3 16.75v-9.5z" /><path d="M3 7.25 12 12l9-4.75M12 12v9.5" /></g></svg>
          <span style={{ opacity: 0.6 }}>AlgorithmX</span>
        </span>
      </span>
    </>
  );
}

/* The child's chip in the nav: initial in their colour, name and age. */
export function KidChip({ name, age, hex, ink }: { name: string; age: number | null; hex: string; ink: string }) {
  return (
    <span className="hlm-kid">
      <span className="hlm-ava" style={{ "--kid": hex, color: ink } as React.CSSProperties} aria-hidden="true">{(name[0] || "?").toUpperCase()}</span>
      <span className="nm">{name}{age !== null ? <small> · age {age}</small> : null}</span>
    </span>
  );
}

export default function HeroesShell({
  brandHref,
  brandLabel = "Cyber Heroes by AlgorithmX",
  navRight,
  ready = true,
  status,
  children,
}: {
  /** The lockup links home (the mission map) on the signed-in pages; a plain mark before that. */
  brandHref?: string;
  brandLabel?: string;
  navRight?: ReactNode;
  /** The entrance waits for this (the welcome page waits for the child's name). */
  ready?: boolean;
  /** Text for the page's polite live region. */
  status?: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const sky = useRef<ReturnType<typeof nightSky> | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    /* Reduced motion starts paused: everything settled, nothing drifting. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pausedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the media query only exists on the client; the server renders "playing"
      setPaused(true);
    }
    const s = nightSky(cv, () => pausedRef.current);
    sky.current = s;
    return () => { s.destroy(); sky.current = null; };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;
    return rise(root);
  }, [ready]);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    sky.current?.kick();
  };

  return (
    <div ref={rootRef} className={`hlm ${fredoka.variable} ${nunito.variable} ${jet.variable}`} data-paused={paused ? "" : undefined}>
      {/* Without script the entrance never runs: show everything at once. */}
      <noscript><style>{".hlm [data-rise],.hlm [data-pop]{opacity:1;transform:none}"}</style></noscript>
      <a className="hlm-skip" href="#main">Skip to the page</a>
      <div className="hlm-sky" aria-hidden="true"><canvas ref={cvRef} /></div>
      <div className="hlm-key" aria-hidden="true" />
      <div className="hlm-hills" aria-hidden="true">
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none"><path d="M0 160 C220 100 420 130 620 160 S1040 210 1240 140 1440 130 1440 130 V260 H0Z" fill="#0e1434" /><path d="M0 214 C260 170 520 206 760 220 S1180 186 1440 206 V260 H0Z" fill="#0a0f29" /></svg>
      </div>
      <div className="hlm-shell">
        <header className="hlm-top" data-rise>
          <div className="hlm-wrap">
            <nav className="hlm-nav" aria-label="Cyber Heroes">
              {brandHref ? (
                <Link className="hlm-brand" href={brandHref} aria-label={brandLabel}><Lockup /></Link>
              ) : (
                <span className="hlm-brand" role="img" aria-label={brandLabel}><Lockup /></span>
              )}
              {navRight ? <div className="hlm-navr">{navRight}</div> : null}
            </nav>
          </div>
        </header>
        <main id="main" tabIndex={-1}>{children}</main>
        <p className="hlm-sr" role="status">{status ?? ""}</p>
        <footer className="hlm-foot">
          <div className="hlm-wrap">
            <button className="hlm-motion" type="button" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={toggle}>
              <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
              <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
            </button>
            <span>Cyber Heroes by AlgorithmX</span>
            <span>Ages 6 to 9 · 20 weekly missions</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

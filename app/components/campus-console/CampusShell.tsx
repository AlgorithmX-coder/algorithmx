"use client";

/**
 * Campus Console: the shell of the school and firm transactional pages
 * (landing lab round 6, family schools, v1, 2026-11-23). A lockup top left,
 * a mono back link top right, a centred glass console with the house cyan
 * "way in" seam and 1 px corner marks, a Pause control bottom left. The
 * schools family sits on the campus night with the UK globe rising bottom
 * right; the firm family on the corporate graphite with the office pulse.
 *
 * The pages pass their own words and actions as children; this only draws
 * the room. Reveal and pause live on data attributes on the root.
 */

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { campusGlobe, officePulse, type Backdrop } from "./campusFx";
import "./campus-console.css";

const inter = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--r6-inter", display: "swap" });
const jet = JetBrains_Mono({ weight: ["500", "700", "800"], subsets: ["latin"], variable: "--r6-jet", display: "swap" });

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="r6-back-link" href={href}>{ARROW}<span>{children}</span></Link>;
}

export default function CampusShell({
  family,
  page,
  lockup,
  lockupHref,
  lockupLabel,
  right,
  width,
  foot,
  stageClass = "",
  children,
}: {
  family: "schools" | "firm";
  page: string;
  lockup: ReactNode;
  lockupHref: string;
  lockupLabel: string;
  right: ReactNode;
  width?: number;
  foot?: ReactNode;
  stageClass?: string;
  children: ReactNode;
}) {
  const backRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLElement>(null);
  const pausedRef = useRef(false);
  const fxRef = useRef<Backdrop | null>(null);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const host = backRef.current, con = consoleRef.current;
    if (!host || !con) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) { pausedRef.current = true; setPaused(true); }
    const env = { paused: () => pausedRef.current, still };
    const fx = family === "schools" ? campusGlobe(host, con, env) : officePulse(host, env);
    fxRef.current = fx;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setShown(true)); });
    const t = window.setTimeout(() => setShown(true), 700);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.clearTimeout(t); fx.destroy(); fxRef.current = null; };
  }, [family]);

  const toggle = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) fxRef.current?.kick();
  };

  return (
    <div
      className={`r6c ${inter.variable} ${jet.variable}`}
      data-family={family}
      data-page={page}
      data-in={shown ? "" : undefined}
      data-paused={paused ? "" : undefined}
    >
      <div className="r6-back" ref={backRef} aria-hidden="true" />
      <div className="r6-pools" aria-hidden="true"><i className="a" /><i className="b" /></div>
      <div className="r6-scrim" aria-hidden="true" />
      <header className="r6-chrome">
        <Link className="r6-lockup" href={lockupHref} aria-label={lockupLabel}>{lockup}</Link>
        <div className="r6-right">{right}</div>
      </header>
      <main className={`r6-stage${foot ? " has-foot" : ""}${stageClass ? ` ${stageClass}` : ""}`}>
        <section className="r6-console" ref={consoleRef} aria-labelledby="r6-title" style={width ? ({ "--r6-w": `${width}px` } as CSSProperties) : undefined}>
          <i className="r6-corner tl" aria-hidden="true" /><i className="r6-corner tr" aria-hidden="true" /><i className="r6-corner bl" aria-hidden="true" /><i className="r6-corner br" aria-hidden="true" />
          {children}
        </section>
      </main>
      {foot ? <footer className="r6-pagefoot">{foot}</footer> : null}
      <button className="r6-motion" type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>
        <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
        <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
      </button>
    </div>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useRef } from "react";
import HeroSim from "../HeroSim";
import { AXC } from "./content";
import { holoAccent, tilt } from "./fx";

/* The Hologram Office hero.
 *
 * Left: eyebrow, the headline whose accent ("We have your firm covered.") is
 * drawn from coloured points that settle into the gradient type (the DOM text
 * stays underneath for assistive tech and search), the lede with its four
 * bold spans, the two CTAs and the trust lines.
 *
 * Right: the office stage. The desk-row photograph as a large rounded picture
 * in a platinum frame, and floating above it in CSS 3D a frosted glass pane
 * carrying the REAL Copilot practice window (HeroSim, the course's own
 * simulator scaled to the pane). The pane tilts to the pointer with the
 * photograph following at a third of the angle; a scan band crosses the pane
 * every 6 s and corner brackets mark it as a hologram. */

const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

/* Wrap the lede's named phrases in <b>, verbatim text otherwise. */
function Lede({ text, bold }: { text: string; bold: ReadonlyArray<string> }) {
  const re = new RegExp(`(${bold.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  const parts = text.split(re);
  return <p className="lede">{parts.map((p, i) => (bold.includes(p) ? <b key={i}>{p}</b> : <Fragment key={i}>{p}</Fragment>))}</p>;
}

export default function OfficeHero({ checkoutLive }: { checkoutLive: boolean }) {
  const H = AXC.hero;
  const heroRef = useRef<HTMLElement>(null);
  const hwrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stops: Array<() => void> = [];
    if (rigRef.current) stops.push(tilt(rigRef.current, 5));
    const cv = cvRef.current, hwrap = hwrapRef.current, h1 = h1Ref.current, acc = accRef.current, hero = heroRef.current;
    if (cv && hwrap && h1 && acc && hero) stops.push(holoAccent({ canvas: cv, hwrap, h1, acc, hero }));
    return () => stops.forEach((s) => s());
  }, []);

  const primary = checkoutLive ? H.ctaPrimary.whenCheckoutLive : H.ctaPrimary;

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="wrap hgrid">
        <div className="copy">
          <div className="eyebrow">{H.eyebrow}</div>
          <div className="hwrap" ref={hwrapRef}>
            <h1 className="h1" ref={h1Ref}>
              <span className="ld">{H.headlineParts.plain}</span>
              <span className="acc" ref={accRef}>{H.headlineParts.gradient}</span>
            </h1>
            <canvas className="hcanvas" ref={cvRef} aria-hidden="true" />
          </div>
          <noscript><style>{`.kv1 .h1 .acc{opacity:1}`}</style></noscript>
          <Lede text={H.lede} bold={H.ledeBold} />
          <div className="ctas">
            <a className="btn primary" href={primary.href}>{primary.label}<Arrow /></a>
            <a className="btn ghost" href={H.ctaGhost.href}>{H.ctaGhost.label}</a>
          </div>
          <ul className="trust">{H.trust.map((t) => <li key={t}><i />{t}</li>)}</ul>
        </div>

        <div className="stage">
          <div className="rig" ref={rigRef}>
            <div className="photo" aria-hidden="true"><img src={H.video.poster} alt="" width={1600} height={900} /></div>
            <div className="pane">
              <span className="scan" aria-hidden="true" />
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <HeroSim baseHeight={470} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

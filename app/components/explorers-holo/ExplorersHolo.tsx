"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CourseLockup from "@/app/components/CourseLockup";
import CubeMark from "@/app/components/CubeMark";
import { AXE } from "./content";
import { countOnView, countUp, powerWires, reduced, reveal, spy } from "./fx";
import HoloHeadline from "./HoloHeadline";
import HoloFrame from "./HoloFrame";
import "./explorers.css";

/* Hologram, the /cyberexplorers page (owner's pick from the landing lab
 * round 4, 2026-11-22, concept e01: "push them live"). The house Hologram
 * language carried to the spy course for parents: platinum ground with the
 * faint grid and cyan/violet pools, a glass capsule nav with the real
 * Explorers lockup, the headline accent drawn from coloured points, the real
 * recruitment trailer inside a holographic glass frame, the reticle mark
 * powering the six included cards along wires, glass stat tiles, hairline
 * FAQ rows, the pricing slab.
 *
 * Same copy, same sections, same order as the page it replaces; every href
 * as live. Everything lives under .ev1 so the stylesheet cannot leak. Reveal
 * state is a data-in attribute set imperatively (a class on className would
 * be wiped by the next re-render). The dark page's aurora + particle canvas
 * (LiveBackground) is replaced by the concept's grid and pools. */

const ICONS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6L9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  shield: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
} as const;

function Icon({ name, size = 16, sw = 2 }: { name: keyof typeof ICONS; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}
const Arrow = () => <Icon name="arrow" size={16} sw={2.2} />;
const Check = () => <Icon name="check" size={14} sw={2.6} />;
const Pill = ({ children }: { children: string }) => <span className="pill">{children}</span>;

/* The Explorers reticle alone (the lockup's mark at any size), the source
 * that powers the included cards. Same geometry as CourseLockup "explorers". */
function Reticle({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="6.4" />
      <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PAUSE = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>;
const PLAY = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

/* ── nav: glass capsule, the real lockup with the stacked byline, chips with a
   scroll-spy, LOG IN, the cyan pill; under 1100px the chips and LOG IN move
   into a menu behind a real button (the live page simply hid them) ── */
function Nav() {
  const N = AXE.nav;
  const [on, setOn] = useState("");
  const [open, setOpen] = useState(false);
  const capRef = useRef<HTMLDivElement>(null);
  useEffect(() => spy(N.links.map((l) => l.id), setOn), [N.links]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => { if (capRef.current && !capRef.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey); window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open]);
  return (
    <header className="nav">
      <div className="capsule" ref={capRef} data-open={open ? "" : undefined}>
        <Link className="lockup" href={N.logo.href} aria-label={N.logo.ariaLabel}>
          <CourseLockup id="explorers" size={0.8} tone="sand" />
          <span className="lk-by" aria-hidden="true"><span className="dim">{N.logo.bylineBy}</span><CubeMark size={12} color="#5f8dff" code /><span className="dim">{N.logo.bylineBrand}</span></span>
        </Link>
        <nav className="chips" aria-label={N.menu.ariaLabel}>
          {N.links.map((l) => <a key={l.id} href={l.href} className={on === l.id ? "on" : undefined} aria-current={on === l.id ? "location" : undefined}>{l.label}</a>)}
        </nav>
        <Link className="login" href={N.login.href}>{N.login.label}</Link>
        <Link className="ctaPill" href={N.enrol.href}>{N.enrol.label}<Arrow /></Link>
        <button type="button" className="burger" aria-label={open ? N.menu.close : N.menu.open} aria-expanded={open} aria-controls="ev1-menu" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "close" : "menu"} size={16} sw={2} />
        </button>
        <nav className="sheet" id="ev1-menu" aria-label={N.menu.ariaLabel} hidden={!open}>
          {N.links.map((l) => <a key={l.id} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
          <Link className="login" href={N.login.href} onClick={() => setOpen(false)}>{N.login.label}</Link>
        </nav>
      </div>
    </header>
  );
}

/* ── FAQ: eight hairline rows; several may be open, as live ── */
function Faq() {
  const Q = AXE.faq;
  const [open, setOpen] = useState<ReadonlyArray<number>>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <section className="s wrap" id="questions">
      <div className="shead" data-reveal><Pill>{Q.eyebrow}</Pill><h2 className="h2">{Q.title}</h2></div>
      <div className="faq">
        {Q.items.map((it, i) => {
          const isOpen = open.includes(i);
          return (
            <div className={`faq-item${isOpen ? " open" : ""}`} key={it.q} data-reveal style={{ "--d": `${i * 0.05}s` } as React.CSSProperties}>
              <button type="button" aria-expanded={isOpen} aria-controls={`ev1-faq-${i}`} onClick={() => toggle(i)}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Icon name="plus" size={14} sw={2} /></span>
              </button>
              <div className="faq-a" id={`ev1-faq-${i}`}><div><p>{it.a}</p></div></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* The proof paragraph with "Cyber Heroes" in ink, as live. */
function ProofBody() {
  const P = AXE.proof, i = P.body.indexOf(P.bodyBold);
  if (i < 0) return <p>{P.body}</p>;
  return <p>{P.body.slice(0, i)}<b>{P.bodyBold}</b>{P.body.slice(i + P.bodyBold.length)}</p>;
}

export default function ExplorersHolo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(true);
  const [year, setYear] = useState(2026);

  /* the motion default follows the OS after mount, so server and first
     client render agree; the year is the live page's new Date() */
  useEffect(() => {
    const id = window.setTimeout(() => { setMotion(!reduced()); setYear(new Date().getFullYear()); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* reveal on scroll, count-ups, the power wires: all scoped to this root */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const stops = [reveal(root), countOnView(root, (el, text) => countUp(el, text, 1100))];
    if (powerRef.current) stops.push(powerWires(powerRef.current));
    return () => stops.forEach((s) => s());
  }, []);

  const H = AXE.hero, PR = AXE.problem, T = AXE.transformation, I = AXE.included, P = AXE.proof, PA = AXE.parents, C = AXE.cta, FO = AXE.footer, MB = AXE.motionButton;

  return (
    <div className="ev1" ref={rootRef} data-paused={motion ? undefined : ""}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /><div className="pool g" /></div>
      <Nav />
      <main>
        <section className="hero" id="top">
          <div className="wrap hgrid">
            <div className="copy">
              <div className="eyebrow">{H.eyebrow}</div>
              <HoloHeadline motion={motion} />
              <p className="sub">{H.sub}</p>
              <p className="covers"><span className="l">{H.coversLabel}</span><span className="v">{H.covers}</span></p>
              <div className="ncsc"><span>{H.ncscPill.text}</span><i aria-hidden="true" /><span className="plate"><img src={H.ncscPill.logo.src} alt={H.ncscPill.logo.alt} /></span></div>
              <div className="ctas">
                <Link className="btn primary" href={H.ctaPrimary.href}>{H.ctaPrimary.label}<Arrow /></Link>
                <a className="btn ghost" href={H.ctaSecondary.href}>{H.ctaSecondary.label}</a>
              </div>
              <p className="fine">{H.finePrint}</p>
              <ul className="trust">{H.ticks.map((t) => <li key={t}><Check />{t}</li>)}</ul>
            </div>
            <HoloFrame />
          </div>
          <button className="motion" type="button" onClick={() => setMotion((m) => !m)} aria-label={motion ? MB.playing : MB.paused} aria-pressed={!motion}>{motion ? PAUSE : PLAY}</button>
        </section>

        <section className="s wrap" id="stats" aria-label="Key numbers">
          <div className="stats">
            {AXE.stats.map((s, i) => (
              <div className="stat glass" key={s.label} data-reveal style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}>
                <div className="num" data-count={s.to}>0</div>
                <div className="lab">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="s wrap" id="problem">
          <div className="shead" data-reveal><Pill>{PR.eyebrow}</Pill><h2 className="h2">{PR.title}</h2><p className="lede">{PR.sub}</p></div>
          <div className="cards3">
            {PR.cards.map((c, i) => (
              <article className="pcard glass" key={c.big} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
                <div className="big">{c.big}</div><p className="small">{c.small}</p>
              </article>
            ))}
          </div>
          <p className="closer" data-reveal>{PR.closer}</p>
        </section>

        <section className="s wrap" id="change">
          <div className="shead" data-reveal><Pill>{T.eyebrow}</Pill><h2 className="h2">{T.title}</h2></div>
          <div className="ba">
            <article className="glass before" data-reveal><div className="ey">{T.before.eyebrow}</div><blockquote>{T.before.quote}</blockquote></article>
            <article className="glass after" data-reveal style={{ "--d": ".12s" } as React.CSSProperties}><div className="ey">{T.after.eyebrow}</div><blockquote>{T.after.quote}</blockquote></article>
          </div>
          <p className="closer soft" data-reveal>{T.closer}</p>
        </section>

        <section className="s wrap" id={I.id}>
          <div className="shead" data-reveal><Pill>{I.eyebrow}</Pill><h2 className="h2">{I.title}</h2><p className="lede">{I.sub}</p></div>
          <div className="power" ref={powerRef}>
            <span className="src" aria-hidden="true"><Reticle size={40} /></span>
            <svg className="wires" aria-hidden="true" />
            <div className="gcards">
              {I.cards.map((c, i) => (
                <article className="gcard glass" key={c.t} data-reveal style={{ "--d": `${(i % 3) * 0.08}s` } as React.CSSProperties} tabIndex={0}>
                  <span className="pdot" aria-hidden="true" />
                  <div className="num">{c.n}</div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="s wrap" id="proof">
          <div className="proof glass" data-reveal>
            <Pill>{P.eyebrow}</Pill><h2 className="h2">{P.title}</h2>
            <ProofBody />
            <Link className="btn ghost" href={P.link.href}>{P.link.label}</Link>
          </div>
        </section>

        <section className="s wrap" id={PA.id}>
          <div className="shead" data-reveal><Pill>{PA.eyebrow}</Pill><h2 className="h2">{PA.title}</h2><p className="lede">{PA.sub}</p></div>
          <div className="pts">
            {PA.points.map((p, i) => (
              <article className="pt glass" key={p.t} data-reveal style={{ "--d": `${(i % 2) * 0.08}s` } as React.CSSProperties}>
                <span className="ic"><Icon name="shield" size={18} sw={1.9} /></span>
                <div><h3>{p.t}</h3><p>{p.d}</p></div>
              </article>
            ))}
          </div>
        </section>

        <Faq />

        <section className="s wrap" id="pricing">
          <div className="slab glass" data-reveal>
            <Pill>{C.eyebrow}</Pill><h2 className="h2">{C.title}</h2>
            <div className="num price" data-count={C.price}>£0</div>
            <ul>{C.bullets.map((b) => <li key={b}><Check /><span>{b}</span></li>)}</ul>
            <div className="ctas">
              <Link className="btn primary" href={C.primary.href}>{C.primary.label}<Arrow /></Link>
              <Link className="btn ghost" href={C.secondary.href}>{C.secondary.label}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><svg width="420" height="420" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
        <div className="wrap row">
          <span className="cpy">{FO.copyrightPrefix}{year}{FO.copyrightSuffix}</span>
          <nav className="links" aria-label={FO.ariaLabel}>
            {FO.links.map((l) => (l.href.startsWith("/") ? <Link key={l.label} href={l.href}>{l.label}</Link> : <a key={l.label} href={l.href}>{l.label}</a>))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import CourseLockup, { OpsMark } from "@/app/components/CourseLockup";
import CubeMark from "@/app/components/CubeMark";
import { AXO, type SafetyIcon } from "./content";
import { powerWires, reduced, reveal } from "./fx";
import OpsHeadline from "./OpsHeadline";
import Reel from "./Reel";
import "./ops.css";

/* Hologram, the /ops page (owner's pick from the landing lab round 4,
 * 2026-11-22, concept o01: "push them live"). The house Hologram language
 * with violet as the page's accent: platinum ground with a faint grid and
 * violet pools, a glass capsule nav with the real Ops lockup, the headline
 * accent drawn from coloured points, the reel playing inside a holographic
 * glass frame, the five-step engagement loop on a circuit a pulse rides,
 * the Ops mark powering the six module groups along wires, the finding
 * card as a glass document. Same copy, same sections, same order, same
 * routes as the page it replaces; everything lives under .ov1 so the
 * stylesheet cannot leak. Reveal state is a data-in attribute set
 * imperatively (a class on className would be wiped by a re-render). */

const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Plus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const PAUSE = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>;
const PLAY = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

/* the four safety icons, as drawn on the page it replaces */
const SAFETY_ICONS: Record<SafetyIcon, React.ReactNode> = {
  shield: <path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6l-8-4Z" />,
  shieldCheck: <><path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>,
  chart: <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />,
};

const Pill = ({ children }: { children: React.ReactNode }) => <span className="pill">{children}</span>;

/* The Ops lockup: the real CourseLockup (sand tone, the bracketed scope
   mark in #5744c9 and Chakra Petch "CYBER OPS") with the stacked
   "by [blue cube] AlgorithmX" byline the live nav shows under the name. */
function Lockup({ href }: { href: string }) {
  return (
    <a className="lockup" href={href} aria-label={AXO.nav.brand.ariaLabel}>
      <CourseLockup id="ops" tone="sand" size={0.85} />
      <span className="lk-by" aria-hidden="true"><span className="dim">by</span><CubeMark size={12} color="#5f8dff" strokeWidth={1.6} code /><span className="dim">AlgorithmX</span></span>
    </a>
  );
}

/* ── nav: glass capsule, five chips with a scroll-spy, Sign in, the violet pill ── */
function Nav() {
  const [on, setOn] = useState("");
  useEffect(() => {
    const secs = AXO.nav.links.map((c) => document.getElementById(c.id)).filter((s): s is HTMLElement => !!s);
    if (!secs.length) return;
    /* the chip for the section crossing the reading line; none lit in the hero or the footer */
    const vis = new Set<string>();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) vis.add(en.target.id); else vis.delete(en.target.id); });
      setOn(AXO.nav.links.find((c) => vis.has(c.id))?.id ?? "");
    }, { rootMargin: "-40% 0px -50% 0px" });
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  const N = AXO.nav;
  return (
    <header className="nav">
      <div className="capsule">
        <Lockup href={N.brand.href} />
        <nav className="chips" aria-label={N.chipsAriaLabel}>
          {N.links.map((c) => <a key={c.id} href={c.href} className={on === c.id ? "on" : ""} aria-current={on === c.id ? "location" : undefined}>{c.label}</a>)}
        </nav>
        <a className="login" href={N.signIn.href}>{N.signIn.label}</a>
        <a className="ctaPill" href={N.cta.href}>{N.cta.label}<Arrow /></a>
      </div>
    </header>
  );
}

/* ── FAQ: four hairline rows, the first open as live; several may be open ── */
function Faq() {
  const F = AXO.faq;
  const [open, setOpen] = useState<number[]>(() => F.items.flatMap((it, i) => (it.openByDefault ? [i] : [])));
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <section className="s wrap" id="faq">
      <div className="shead" data-reveal><Pill>{F.eyebrow}</Pill><h2 className="h2">{F.h2}</h2></div>
      <div className="faq">
        {F.items.map((it, i) => {
          const isOpen = open.includes(i);
          return (
            <div className={`faq-item ${isOpen ? "open" : ""}`} key={it.q} data-reveal style={{ "--d": `${i * 0.05}s` } as React.CSSProperties}>
              <button type="button" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Plus /></span>
              </button>
              <div className="faq-a"><div><p>{it.a}</p></div></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function OpsHolo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(true);

  /* reduced motion starts the page paused; read after mount so server and
     first client render agree */
  useEffect(() => {
    const id = window.setTimeout(() => { if (reduced()) setMotion(false); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* reveal on scroll, scoped to this root */
  useEffect(() => { const root = rootRef.current; return root ? reveal(root) : undefined; }, []);

  /* the Ops mark powering the six module groups along wires */
  useEffect(() => { const wrap = powerRef.current; return wrap ? powerWires(wrap) : undefined; }, []);

  const H = AXO.hero, R = AXO.range, C = AXO.curriculum, O = AXO.outcome, FC = O.findingCard, S = AXO.safety, J = AXO.cta, FO = AXO.footer;

  return (
    <div className="ov1" ref={rootRef} data-paused={motion ? undefined : ""}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /><div className="pool g" /></div>
      <Nav />
      <main>
        {/* HERO */}
        <section className="hero" id="top">
          <div className="wrap hgrid">
            <div className="copy">
              <div className="hchips">
                {H.chips.map((c) => <span key={c.text} className={`hchip ${c.kind}`}>{c.kind !== "mono" && <i />}{c.text}</span>)}
              </div>
              <OpsHeadline motion={motion} />
              <p className="sub">{H.lead}</p>
              <div className="ctas">
                {H.buttons.map((b) => <a key={b.label} className={`btn ${b.style}`} href={b.href}>{b.label}{b.style === "primary" && <Arrow />}</a>)}
              </div>
              <p className="hnote">{H.note}</p>
              {/* Aligned with the NCSC (alignment, not endorsement). The crest is
                  white, so it sits on an ink plate. */}
              <div className="ncsc">
                <span>{H.ncscPill.text}</span><i aria-hidden="true" />
                <span className="plate"><img src={H.ncscPill.logo.src} alt={H.ncscPill.logo.alt} loading="lazy" /></span>
              </div>
            </div>
            <Reel />
          </div>
          <button className="motion" type="button" onClick={() => setMotion((m) => !m)} aria-label={motion ? H.motionButton.playing : H.motionButton.paused} aria-pressed={!motion}>{motion ? PAUSE : PLAY}</button>
        </section>

        {/* THE RANGE */}
        <section className="s wrap" id="range">
          <div className="two">
            <div data-reveal><Pill>{R.eyebrow}</Pill><h2 className="h2">{R.h2}</h2><p className="lede">{R.lead}</p><p className="lede soft">{R.lead2}</p></div>
            <div className="loop" data-reveal style={{ "--d": ".1s" } as React.CSSProperties}>
              <span className="rail" aria-hidden="true" /><span className="loopPulse" aria-hidden="true" />
              {R.steps.map((s) => (
                <article className="step glass" key={s.n}><span className="node" aria-hidden="true" /><span className="n">{s.n}</span><div><h3>{s.title}</h3><p>{s.body}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section className="s wrap" id="curriculum">
          <div className="shead" data-reveal><Pill>{C.eyebrow}</Pill><h2 className="h2">{C.h2}</h2><p className="lede">{C.lead}</p></div>
          <div className="power" ref={powerRef}>
            <span className="src" aria-hidden="true"><OpsMark size={40} /></span>
            <svg className="wires" aria-hidden="true" />
            <div className="groups">
              {C.groups.map((g, i) => (
                <article className="group glass" key={g.title} data-reveal tabIndex={0} style={{ "--d": `${i * 0.06}s`, "--g": g.colour } as React.CSSProperties}>
                  <span className="pdot" aria-hidden="true" />
                  <div className="rng">{g.range}</div>
                  <h3>{g.title}</h3>
                  <ul>{g.modules.map((m) => <li key={m.n}><b>{m.n}</b><span>{m.title}</span></li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* OUTCOME */}
        <section className="s wrap" id="outcome">
          <div className="two">
            <div data-reveal>
              <Pill>{O.eyebrow}</Pill><h2 className="h2">{O.h2}</h2><p className="lede">{O.lead}</p>
              <div className="ranks" data-reveal style={{ "--d": ".15s" } as React.CSSProperties}>
                {O.ranks.map((r) => (
                  <div className={`rank ${r.active ? "on" : ""}`} key={r.name}>
                    <b>{r.name}</b>
                    <span className="bar" aria-hidden="true"><i style={{ "--w": r.width } as React.CSSProperties} /></span>
                    <em className={r.pct ? "" : "none"}>{r.pct ?? ""}</em>
                  </div>
                ))}
              </div>
            </div>
            <article className="finding glass" data-reveal style={{ "--d": ".1s" } as React.CSSProperties}>
              <div className="fh"><span className="sev">{FC.severity}</span><span className="cvss">{FC.cvss}</span><span className="fid">{FC.id}</span></div>
              <h3>{FC.title}</h3>
              <dl>{FC.fields.map((f) => <div key={f.label}><dt>{f.label}</dt><dd className={f.kind === "text" ? "" : f.kind}>{f.value}</dd></div>)}</dl>
            </article>
          </div>
        </section>

        {/* SAFETY */}
        <section className="s wrap" id="safety">
          <div className="shead" data-reveal><Pill>{S.eyebrow}</Pill><h2 className="h2">{S.h2}</h2><p className="lede">{S.lead}</p></div>
          <div className="scards">
            {S.cards.map((c, i) => (
              <article className="scard glass" key={c.title} data-reveal style={{ "--d": `${(i % 2) * 0.08}s` } as React.CSSProperties}>
                <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{SAFETY_ICONS[c.icon]}</svg></span>
                <div><h3>{c.title}</h3><p>{c.body}</p></div>
              </article>
            ))}
          </div>
        </section>

        <Faq />

        {/* ENLIST */}
        <section className="s wrap" id="join">
          <div className="slab glass" data-reveal>
            <Pill>{J.eyebrow}</Pill><h2 className="h2">{J.h2}</h2><p className="lede">{J.lead}</p>
            <div className="ctas">
              {J.buttons.map((b) => <a key={b.label} className={`btn ${b.style}`} href={b.href}>{b.label}{b.style === "primary" && <Arrow />}</a>)}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><svg width="420" height="420" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
        <div className="wrap">
          <div className="row">
            <Lockup href={FO.brand.href} />
            <nav className="links" aria-label={FO.linksAriaLabel}>{FO.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}</nav>
          </div>
          <p className="fine">{FO.fine}</p>
        </div>
      </footer>
    </div>
  );
}

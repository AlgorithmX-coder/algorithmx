"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandCube from "@/app/components/BrandCube";
import CourseLockup, { COURSE_HREF } from "@/app/components/CourseLockup";
import SchoolBrand, { SchoolAtom } from "@/app/schools/SchoolBrand";
import { PHASES, type Phase } from "@/app/schools/phases";
import { reveal, reduced } from "@/app/components/home-holo/fx";
import { AXS, splitHeadline } from "./content";
import { CITY } from "./geo";
import { ICONS, type IconName } from "./icons";
import HoloHeadline from "./HoloHeadline";
import HoloGlobe from "./HoloGlobe";
import ProductFrame from "./ProductFrame";
import HoloEnquiryForm from "./HoloEnquiryForm";
import "./schools.css";

/* Hologram Campus, the /schools page (owner's pick from the twenty-concept
 * landing lab round 2, 2026-11-21: "push it live"). The live homepage's
 * language carried to schools: platinum ground with a faint grid, a glass
 * capsule nav with the real Learning Atom lockup, the headline accent drawn
 * from coloured points, a hologram globe with Britain gold and lesson arcs,
 * the Atom powering the two phase cards along wires, a glass browser frame
 * for the six product screens. Same copy, same sections, same order as the
 * page it replaces; everything lives under .sv1 so the stylesheet cannot
 * leak. Reveal state is a data-in attribute set imperatively (a class on
 * className would be wiped by the next re-render). */

const PHASE_KEY = "ax-schools-phase";
const MOTION_KEY = "ax-schools-motion";
const isPhase = (v: unknown): v is Phase => v === "primary" || v === "secondary";

function Icon({ name, size = 16, sw = 2 }: { name: IconName; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

const Pill = ({ children }: { children: React.ReactNode }) => <span className="pill">{children}</span>;

function Grad({ h, span }: { h: string; span: string }) {
  const [a, b, c] = splitHeadline(h, span);
  return <>{a}<span className="acc">{b}</span>{c}</>;
}

const Corners = () => <><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" /></>;

/* ── nav: glass capsule, chips with a scroll-spy, School login, the cyan pill ── */
function Nav() {
  const [on, setOn] = useState("");
  useEffect(() => {
    const secs = AXS.nav.items.map((c) => document.getElementById(c.id)).filter((s): s is HTMLElement => !!s);
    if (!secs.length) return;
    /* the chip for the section crossing the reading line; none lit in the hero or the footer */
    const vis = new Set<string>();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) vis.add(en.target.id); else vis.delete(en.target.id); });
      setOn(AXS.nav.items.find((c) => vis.has(c.id))?.id ?? "");
    }, { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <header className="nav">
      <div className="capsule">
        <Link className="lockup" href={AXS.hero.backLink.href} aria-label="AlgorithmX home"><SchoolBrand /></Link>
        <nav className="chips" aria-label={AXS.nav.centre.ariaLabel}>
          {AXS.nav.items.map((c) => <a key={c.id} href={`#${c.id}`} className={on === c.id ? "on" : ""} aria-current={on === c.id ? "location" : undefined}>{c.label}</a>)}
        </nav>
        <a className="login" href={AXS.nav.aside.href}>{AXS.nav.aside.label}</a>
        <a className="ctaPill" href={AXS.nav.cta.href}>{AXS.nav.cta.label}<Icon name="arrow" size={16} sw={2.2} /></a>
      </div>
    </header>
  );
}

/* ── FAQ: six hairline rows; open state is React state only ── */
function Faq() {
  const [open, setOpen] = useState(-1);
  const F = AXS.faq;
  return (
    <section className="s wrap" id="questions">
      <div className="shead" data-reveal><Pill>{F.eyebrow}</Pill><h2 className="h2"><Grad h={F.headline} span={F.headlineGradientSpan} /></h2></div>
      <div className="faq">
        {F.items.map((it, i) => (
          <div className={`faq-item ${i === open ? "open" : ""}`} key={it.q} data-reveal style={{ "--d": `${i * 0.05}s` } as React.CSSProperties}>
            <button type="button" aria-expanded={i === open} onClick={() => setOpen(i === open ? -1 : i)}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Icon name="plus" size={14} sw={2.2} /></span>
            </button>
            <div className="faq-a"><div><p>{it.a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PAUSE = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>;
const PLAY = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

export default function SchoolsHolo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("primary");
  const [motion, setMotion] = useState(true);
  const info = PHASES[phase];

  /* ?phase= (shareable) or the remembered choice, and the remembered motion
     state, read after mount so server and first client render agree */
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const q = new URLSearchParams(window.location.search).get("phase");
        const stored = window.localStorage.getItem(PHASE_KEY);
        if (isPhase(q)) setPhase(q); else if (isPhase(stored)) setPhase(stored);
      } catch {}
      try {
        const m = window.localStorage.getItem(MOTION_KEY);
        setMotion(m ? m === "playing" : !reduced());
      } catch { setMotion(!reduced()); }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const toggleMotion = () => {
    const next = !motion;
    setMotion(next);
    try { window.localStorage.setItem(MOTION_KEY, next ? "playing" : "paused"); } catch {}
  };

  const choosePhase = (p: Phase) => {
    setPhase(p);
    try {
      window.localStorage.setItem(PHASE_KEY, p);
      const u = new URL(window.location.href);
      u.searchParams.set("phase", p);
      window.history.replaceState(null, "", u.toString());
    } catch {}
    document.getElementById("product")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  /* reveal on scroll, scoped to this root */
  useEffect(() => { const root = rootRef.current; return root ? reveal(root) : undefined; }, []);

  /* the power wires from the Atom to the two phase cards; redrawn on resize
     and when the selection moves (the hot wire follows it) */
  useEffect(() => {
    const wrap = powerRef.current; if (!wrap) return;
    const svg = wrap.querySelector<SVGSVGElement>(".wires"), cards = Array.from(wrap.querySelectorAll<HTMLElement>(".pcard"));
    if (!svg) return;
    const draw = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight; if (!w) return;
      svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h)); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const sx = w / 2, sy = 56;
      const pos = (el: HTMLElement) => { let x = 0, y = 0; for (let n: HTMLElement | null = el; n && n !== wrap; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; } return [x, y]; };
      svg.innerHTML = cards.map((c, i) => {
        const [cx0, cy0] = pos(c); const ex = cx0 + c.offsetWidth / 2, ey = cy0;
        const d = `M${sx} ${sy} L${sx} ${sy + 14} C${sx} ${sy + (ey - sy) * 0.7}, ${ex} ${ey - (ey - sy) * 0.5}, ${ex} ${ey}`;
        const hot = c.getAttribute("aria-checked") === "true" ? "hot" : "";
        return `<path class="wire ${hot}" d="${d}" pathLength="100"/><path class="pulse ${hot}" d="${d}" pathLength="100" style="--i:${i}"/>`;
      }).join("");
    };
    const ro = new ResizeObserver(draw); ro.observe(wrap); draw();
    return () => ro.disconnect();
  }, [phase]);

  const onPhaseKey = (e: React.KeyboardEvent, p: Phase) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); choosePhase(p); }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const other: Phase = p === "primary" ? "secondary" : "primary";
      powerRef.current?.querySelector<HTMLElement>(`[data-phase="${other}"]`)?.focus();
      choosePhase(other);
    }
  };

  const H = AXS.hero, PR = AXS.proof, RC = AXS.reach, PH = AXS.phase, P = AXS.product, HW = AXS.howItWorks, CL = AXS.classroom, RV = AXS.receive, PO = AXS.pilotOffer, EN = AXS.enquiry, FO = AXS.footer, MB = AXS.backdrop.motionButton;
  const cityChips = Object.keys(CITY).map((n) => <span className="fchip" key={n}><img src={`/schools/flags/${CITY[n][0]}.png`} alt="" />{n}</span>);
  const srcChip = (k: string) => <span className="fchip src" key={k}><img src="/schools/flags/gb.png" alt="" />{AXS.backdrop.label.head}</span>;
  const rowA = [srcChip("a"), ...cityChips.slice(0, 11)], rowB = [...cityChips.slice(11), srcChip("b")];
  const dup = (row: React.ReactElement<{ className?: string; children?: React.ReactNode }>[], k: string) => row.map((el, i) => <span key={`${k}${i}`} className={el.props.className} aria-hidden="true">{el.props.children}</span>);
  const pillarIcon: Record<string, IconName> = { headphones: "headphones", shield: "shield", book: "book" };

  return (
    <div className="sv1" ref={rootRef}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /><div className="pool g" /></div>
      <Nav />
      <main>
        <section className="hero" id="top">
          <div className="wrap hgrid">
            <div className="copy">
              <Link className="back" href={H.backLink.href}><span aria-hidden="true">←</span>{H.backLink.label}</Link>
              <div className="eyebrow">{H.eyebrow}</div>
              <HoloHeadline motion={motion} />
              <p className="sub">{H.sub}</p>
              <div className="ctas">{H.ctas.map((c) => <a key={c.label} className={`btn ${c.style}`} href={c.href}>{c.label}{c.style === "primary" && <Icon name="arrow" size={16} sw={2.2} />}</a>)}</div>
              <ul className="trust">{H.trust.map((t) => <li key={t}><i />{t}</li>)}</ul>
            </div>
            <HoloGlobe motion={motion} />
          </div>
          <button className="motion" type="button" onClick={toggleMotion} aria-pressed={!motion}>{motion ? PAUSE : PLAY}<span>{motion ? MB.playing : MB.paused}</span></button>
        </section>

        <section className="s wrap" id="accreditations" aria-label="Accreditations">
          <div className="band glass" data-reveal>
            <Pill>{PR.eyebrow}</Pill>
            <div className="marks">{PR.marks.map((m, i) => (
              <div className="mark" key={m.name} data-reveal style={{ "--d": `${0.1 + i * 0.08}s` } as React.CSSProperties}>
                <span className={`plate ${m.plate}`}><img src={m.src} alt={m.alt} style={{ width: Math.round(m.width * 0.78) }} /></span>
                <h3>{m.name}</h3><p>{m.copy}</p>
              </div>
            ))}</div>
          </div>
        </section>

        <section className="s wrap" id="reach">
          <div className="reachGrid">
            <div data-reveal><Pill>{RC.eyebrow}</Pill><h2 className="h2"><Grad h={RC.headline} span={RC.headlineGradientSpan} /></h2><p className="lede">{RC.sub}</p></div>
            <div className="flags" data-reveal style={{ "--d": ".15s" } as React.CSSProperties} aria-hidden="true">
              <div className="track">{rowA}{dup(rowA, "a")}</div>
              <div className="track b">{rowB}{dup(rowB, "b")}</div>
            </div>
          </div>
        </section>

        <section className="s wrap" id="phase">
          <div className="shead" data-reveal><Pill>{PH.eyebrow}</Pill><h2 className="h2"><Grad h={PH.headline} span={PH.headlineGradientSpan} /></h2><p className="lede">{PH.sub}</p></div>
          <div className="power" ref={powerRef}>
            <span className="src"><SchoolAtom size={56} idPrefix="svPower" /></span>
            <svg className="wires" aria-hidden="true" />
            <div className="pcards" role="radiogroup" aria-label={PH.radiogroupAriaLabel}>
              {(Object.keys(PHASES) as Phase[]).map((p, i) => {
                const c = PHASES[p], on = p === phase;
                return (
                  <div className="pcard glass" role="radio" tabIndex={0} aria-checked={on} data-phase={p} aria-label={`${c.label}, ${c.years}`} key={p}
                    style={{ "--a": c.accent, "--a2": c.accent2, "--d": `${i * 0.12}s` } as React.CSSProperties} data-reveal
                    onClick={() => choosePhase(p)} onKeyDown={(e) => onPhaseKey(e, p)}>
                    <span className="pdot" />
                    <div className="pbody">
                      <h3>{c.label}</h3>
                      <div className="yrs">{c.years} · {c.ages}</div>
                      <p className="ph">{c.headline}</p>
                      <ul className="courses">{c.courses.map((k) => (
                        <li key={k.name}>
                          <div className="ck"><CourseLockup id={k.lockup} size={0.78} tone="sand" /><span className={`st ${k.status === "Live" ? "live" : "dev"}`}>{k.status}</span></div>
                          <div className="cy">{k.years}</div><p>{k.note}</p>
                        </li>
                      ))}</ul>
                      <span className="sel" aria-hidden="true">{on ? PH.selectLabel.selected : PH.selectLabel.unselected}</span>
                    </div>
                    <div className="pwin"><img src={c.art.src} alt={c.art.alt} style={{ objectPosition: PH.artPosition[p] }} /><span className="url">{c.frameUrl}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="s wrap" id="product">
          <div className="shead" data-reveal><Pill>{P.eyebrow}{info.label}</Pill><h2 className="h2"><Grad h={P.headline} span={P.headlineGradientSpan} /></h2><p className="lede">{P.sub}</p></div>
          <ProductFrame phase={phase} />
        </section>

        <section className="s wrap" id="how">
          <div className="shead" data-reveal><Pill>{HW.eyebrow}</Pill><h2 className="h2"><Grad h={HW.headline} span={HW.headlineGradientSpan} /></h2></div>
          <div className="steps">{HW.steps.map((s, i) => (
            <article className="step glass" key={s.n} data-reveal style={{ "--c": s.colour, "--i": i, "--d": `${i * 0.1}s` } as React.CSSProperties}><span className="node">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></article>
          ))}</div>
        </section>

        <section className="s wrap" id="classroom">
          <div className="shead" data-reveal><Pill>{CL.eyebrow}</Pill><h2 className="h2"><Grad h={CL.headline} span={CL.headlineGradientSpan} /></h2><p className="lede">{CL.sub}</p></div>
          <div className="pillars">{CL.pillars.map((p, i) => (
            <article className="pillar glass" key={p.title} data-reveal style={{ "--c": p.accent, "--d": `${i * 0.1}s` } as React.CSSProperties}>
              <Corners />
              <div className="ic"><Icon name={pillarIcon[p.icon]} size={22} sw={1.8} /></div>
              <h3>{p.title}</h3>
              <ul>{p.points.map((pt) => <li key={pt}><Icon name="check" size={14} sw={2.4} /><span>{pt}</span></li>)}</ul>
            </article>
          ))}</div>
          <div className="marksBand glass" data-reveal>
            <span className="lab">{CL.marks.label}</span>
            {CL.marks.courses.map((c) => <a className="cmark" key={c.id} href={COURSE_HREF[c.id]} style={{ "--c": c.accent } as React.CSSProperties}><CourseLockup id={c.id} size={0.78} tone="sand" /><span className="ages">{c.ages}</span></a>)}
          </div>
        </section>

        <section className="s wrap" id="receive">
          <div className="recGrid">
            <div data-reveal>
              <Pill>{RV.eyebrow}</Pill><h2 className="h2"><Grad h={RV.headline} span={RV.headlineGradientSpan} /></h2><p className="lede">{RV.sub}</p>
              <ul className="reclist">{RV.items.map((it, i) => <li key={it}><span className="n">{String(i + 1).padStart(2, "0")}</span><span>{it}</span></li>)}</ul>
            </div>
            <article className="walk glass" data-reveal style={{ "--d": ".15s" } as React.CSSProperties}>
              <span className="chip">{PO.chip}</span><h3>{PO.title}</h3><p>{PO.text}</p>
              <ul>{PO.points.map((p) => <li key={p}><Icon name="check" size={14} sw={2.4} /><span>{p}</span></li>)}</ul>
              <a className="btn primary" href={PO.cta.href}>{PO.cta.label}<Icon name="arrow" size={16} sw={2.2} /></a>
            </article>
          </div>
        </section>

        <Faq />

        <section className="s wrap" id="enquiry">
          <div className="enqGrid">
            <div className="enq" data-reveal>
              <Pill>{EN.eyebrow}</Pill><h2 className="h2"><Grad h={EN.headline} span={EN.headlineGradientSpan} /></h2><p className="lede">{EN.sub}</p>
              <p className="line">{EN.emailLine.prefix}<a href={EN.emailLine.href}>{EN.emailLine.link}</a></p>
              <p className="line">{EN.cardLine.prefix}<Link href={EN.cardLine.href}>{EN.cardLine.link}</Link>{EN.cardLine.suffix}</p>
            </div>
            <div data-reveal style={{ "--d": ".12s" } as React.CSSProperties}><HoloEnquiryForm defaultPhase={phase} /></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><svg width="560" height="560" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
        <div className="wrap">
          <div className="fgridf">
            <div><Link className="fbrand" href="/" aria-label="AlgorithmX"><BrandCube size={22} /><span>ALGORITHM<b>X</b></span></Link><p className="tag">{FO.lede}</p></div>
            {FO.columns.map((c) => <div key={c.label}><h4>{c.label}</h4><ul>{c.links.map((l) => <li key={l.name}><a href={l.href}>{l.name}</a></li>)}</ul>{c.note ? <div className="note">{c.note}</div> : null}</div>)}
          </div>
          <div className="legal"><a href={FO.bottom.email.href}>{FO.bottom.email.label}</a><span>{FO.bottom.copyright}</span></div>
        </div>
      </footer>
    </div>
  );
}

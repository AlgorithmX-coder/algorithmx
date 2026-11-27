"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import CourseLockup from "@/app/components/CourseLockup";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import CubeMark from "@/app/components/CubeMark";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";
import { weekArtPosition, weekArtSrc } from "@/app/lesson/weekContent/weekArt";
import { AXH, type Week } from "./content";
import { ICONS, counters, reduced, reveal } from "./fx";
import "./heroes.css";

/* Saturday Morning: the /cyberheroes landing page (owner's pick from the
 * ten-design landing lab, round 3, 2026-11-22: "push it live"). Same copy and
 * section order as the page it replaces; everything visual is new and lives
 * under .hv4sat. What stays real: the hero film and its twice-through sound
 * rules, every route and CTA, the week cards' art/focus/accent sources, the
 * metadata in layout.tsx and the launch gate. */

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const vars = (v: Record<string, string | number>) => v as Vars;

const MOTION_KEY = "cyberheroes-motion";
const FEATURED: ReadonlyArray<number> = AXH.weekSection.featured;
const TEASED = AXH.weeks.map((w) => w.w).filter((n) => !FEATURED.includes(n));
const accent = (w: number) => WEEK_THEMES[w]?.accent ?? "#36d6ff";
const num = (w: number) => String(w).padStart(2, "0");

function Icon({ name, size = 20, sw = 1.8 }: { name: keyof typeof ICONS; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

/* The Heroes shield, as drawn by CourseLockup / the live nav, in sand tones. */
const Shield = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#e0981f" /><path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#fffdf8" /></svg>
);

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
};

/* ── NAV ──────────────────────────────────────────────────────────────── */
function Nav() {
  const N = AXH.nav;
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);

  // Active-section highlight: one IntersectionObserver, keeps the last id.
  useEffect(() => {
    const els = N.links.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      let best: { id: string; d: number } | null = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const r = e.target.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
        if (!best || d < best.d) best = { id: e.target.id, d };
      }
      if (best) setActiveId(best.id);
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [N.links]);

  // Mobile sheet: lock scroll + Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  // Close first, scroll on the next frame so the unmount cannot cancel it.
  const jump = (id: string) => { setOpen(false); requestAnimationFrame(() => goTo(id)); };

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <Link className="brand" href={N.logo.href} aria-label={N.logo.ariaLabel}>
            <span className="stack">
              <CourseLockup id="heroes" tone="sand" size={1.05} />
              <span className="by" aria-hidden="true"><ByAlgorithmX wordClassName="dim" /></span>
            </span>
          </Link>
          <nav className="links" aria-label={N.ariaLabel}>
            {N.links.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={activeId === l.id ? "on" : undefined} aria-current={activeId === l.id ? "true" : undefined} onClick={(e) => { e.preventDefault(); jump(l.id); }}>{l.label}</a>
            ))}
          </nav>
          <a className="login" href={N.login.href}>{N.login.label}</a>
          <a className="btn primary sm" href={N.enrol.href}>{N.enrol.label}</a>
          <button type="button" className="burger" aria-label={open ? N.burger.ariaLabelOpen : N.burger.ariaLabelClosed} aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "burger"} size={22} sw={2.4} />
          </button>
        </div>
      </header>
      {open && (
        <div className="sheet" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div id="nav-sheet" role="dialog" aria-modal="true" aria-label={N.mobileSheet.ariaLabel} className="pane">
            {N.links.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={activeId === l.id ? "on" : undefined} aria-current={activeId === l.id ? "true" : undefined} onClick={(e) => { e.preventDefault(); jump(l.id); }}>{l.label}</a>
            ))}
            <a href={N.login.href} onClick={() => setOpen(false)}>{N.mobileSheet.login}</a>
            <a className="btn primary" href={N.enrol.href} onClick={() => setOpen(false)}>{N.mobileSheet.enrol}</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ── HERO ─────────────────────────────────────────────────────────────── */
function Hero() {
  const H = AXH.hero;

  /* Hero film: it AUTOPLAYS MUTED through twice (browsers only allow
   * autoplay when muted), then stops on its first frame and shows a Play
   * button. Tapping the film OR the button is a user gesture, so we can then
   * replay it WITH sound. Owner rule: no mute button, plays twice. Logic
   * carried over from the previous page unchanged. */
  const [heroEnded, setHeroEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playsRef = useRef(0);
  const manualRef = useRef(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    // Unmuted autoplay is blocked everywhere, so we start muted and unmute on
    // the visitor's FIRST pointer/key gesture anywhere on the page (the
    // earliest moment audio is allowed). Fires once, then removes itself.
    const unmuteOnFirstGesture = () => {
      const vid = videoRef.current;
      if (vid && !manualRef.current) { vid.muted = false; if (vid.paused) vid.play().catch(() => {}); }
      window.removeEventListener("pointerdown", unmuteOnFirstGesture);
      window.removeEventListener("keydown", unmuteOnFirstGesture);
    };
    window.addEventListener("pointerdown", unmuteOnFirstGesture);
    window.addEventListener("keydown", unmuteOnFirstGesture);
    return () => {
      window.removeEventListener("pointerdown", unmuteOnFirstGesture);
      window.removeEventListener("keydown", unmuteOnFirstGesture);
    };
  }, []);

  // First (muted) pass ends: run a second. After the second, or after any
  // manual sound-on re-watch: stop on frame 0 and reveal the Play button.
  const handleEnded = () => {
    const v = videoRef.current;
    if (!manualRef.current && playsRef.current === 0) {
      playsRef.current = 1;
      if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    } else {
      if (v) { v.pause(); v.currentTime = 0; }
      setHeroEnded(true);
    }
  };
  const playWithSound = () => {
    const v = videoRef.current;
    if (!v) return;
    manualRef.current = true;
    v.muted = false;
    v.currentTime = 0;
    setHeroEnded(false);
    v.play().catch(() => {});
  };

  /* Idle motion (sun arc, clouds, the frame's bob): a Pause control bottom
   * right, remembered in localStorage; starts still under reduced motion. */
  const [started, setStarted] = useState(false);
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(MOTION_KEY); } catch {}
    const still = reduced() || saved === "paused";
    // paused/reduced: the control flips to Play at once; otherwise the idle
    // loop joins once the load choreography has landed
    const t = window.setTimeout(() => { if (still) setMotion(false); else setStarted(true); }, still ? 0 : 1200);
    return () => clearTimeout(t);
  }, []);
  const toggleMotion = () => {
    const next = !motion;
    setStarted(true);
    setMotion(next);
    try { localStorage.setItem(MOTION_KEY, next ? "playing" : "paused"); } catch {}
  };
  const run = `${started ? " play" : ""}${started && !motion ? " hold" : ""}`;

  const lead = H.h1Lead.split(" ");
  return (
    <section className="hero" aria-labelledby="hs-h1">
      <div className="sunwrap" aria-hidden="true">
        <div className={`sun${run}`} />
        <div className={`cloud c1${run}`} /><div className={`cloud c2${run}`} /><div className={`cloud c3${run}`} />
        <div className="hill" />
      </div>
      <div className="wrap">
        <div className="copy">
          <span className="chip"><Icon name="shield" size={15} sw={2.2} />{H.badge}</span>
          <h1 className="h1" id="hs-h1">
            {lead.map((w, i) => <span key={i}><span className="w" style={vars({ "--i": i })}>{w}</span>{" "}</span>)}
            <span className="acc"><span className="w" style={vars({ "--i": lead.length })}>{H.h1Accent}</span></span>
          </h1>
          <p className="sub">{H.sub}</p>
          <div className="price">
            {H.price.map((p, i) => <span key={p} className="sticker peel" style={vars({ "--r": `${[-3, 2, -1.5][i]}deg`, "--d": `${950 + i * 160}ms` })}><i />{p}</span>)}
          </div>
          <ul className="ticks">{H.trustLine.map((t) => <li key={t}><Icon name="check" size={14} sw={3} />{t}</li>)}</ul>
          <div className="plate"><span>{H.ncsc.text}</span><i /><img src={H.ncsc.logo} alt={H.ncsc.logoAlt} loading="lazy" /></div>
          <p className="honest"><b>{H.honestLine.check}</b>{H.honestLine.text}</p>
          <div className="ctas">
            <a className="btn primary" href={H.ctas[0].href}>{H.ctas[0].label}<Icon name="arrow" size={18} sw={2.4} /></a>
            <a className="btn ghost" href={H.ctas[1].href} onClick={(e) => { e.preventDefault(); goTo("how"); }}>{H.ctas[1].label}</a>
          </div>
        </div>
        <figure className={`art${run}`}>
          <div className="frame">
            <div className="screen">
              <video ref={videoRef} src={H.video.src} autoPlay muted playsInline preload="auto" poster={H.video.poster} onEnded={handleEnded} onClick={playWithSound} />
              {heroEnded && (
                <button type="button" className="playbtn" onClick={playWithSound} aria-label={H.video.playLabel}><span aria-hidden="true">&#9654;</span></button>
              )}
            </div>
          </div>
          <span className="sticker shield peel" style={vars({ "--d": "1500ms" })} aria-hidden="true"><Shield /></span>
        </figure>
      </div>
      <button type="button" className={`pause${motion ? " play" : ""}`} onClick={toggleMotion}><i /><span>{motion ? H.motion.pause : H.motion.play}</span></button>
    </section>
  );
}

/* ── A LOOK INSIDE: the week cards ───────────────────────────────────── */
function TvCard({ wk, i }: { wk: Week; i: number }) {
  const W = AXH.weekSection;
  return (
    <article className="tv" data-reveal style={vars({ "--d": `${(i % 4) * 90}ms`, "--c": accent(wk.w) })}>
      <Image src={weekArtSrc(wk.w)} alt={W.artAlt(wk.title)} fill sizes="(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 300px" style={{ objectFit: "cover", objectPosition: weekArtPosition(wk.w) }} />
      <span className="num sticker peel" aria-hidden="true">{num(wk.w)}</span>
      <div className="cap">
        <div className="ey"><i />{W.eyebrow(wk.w)}</div>
        <h3>{wk.title}</h3>
        <p>{wk.sub}</p>
      </div>
    </article>
  );
}

function Mini({ wk }: { wk: Week }) {
  return (
    <div className="mini" aria-hidden="true">
      <Image src={weekArtSrc(wk.w)} alt="" fill sizes="(max-width: 640px) 30vw, 200px" style={{ objectFit: "cover", objectPosition: weekArtPosition(wk.w) }} />
      <span className="lock"><Icon name="lock" size={13} sw={2.6} /></span>
      <div className="m"><b>{num(wk.w)}</b><span>{AXH.weekSection.eyebrow(wk.w)}</span><em>{wk.title}</em></div>
    </div>
  );
}

function Guide() {
  const W = AXH.weekSection, U = W.unlock;
  const byWeek = new Map<number, Week>(AXH.weeks.map((w) => [w.w, w]));
  const featured = FEATURED.map((n) => byWeek.get(n)).filter((w): w is Week => !!w);
  const teased = TEASED.map((n) => byWeek.get(n)).filter((w): w is Week => !!w);
  const locked = AXH.weeks.length - featured.length;
  return (
    <section className="guide" id="curriculum">
      <div className="wrap">
        <div data-reveal><h2 className="h2">{W.h2Lead} <span className="acc">{W.h2Accent}</span></h2><p className="lede">{W.sub}</p></div>
        <div className="tv-grid">{featured.map((wk, i) => <TvCard key={wk.w} wk={wk} i={i} />)}</div>
        <div className="coming" data-reveal>
          {teased.map((wk) => <Mini key={wk.w} wk={wk} />)}
          <div className="panel" id="unlock">
            <span className="lk" aria-hidden="true"><Icon name="lock" size={24} sw={2.2} /></span>
            <h3>{U.headline(locked)}</h3>
            <p>{U.body}</p>
            <ul>{U.bullets.map((b) => <li key={b}><Icon name="check" size={13} sw={3} />{b}</li>)}</ul>
            <a className="btn primary" href={U.cta.href}>{U.cta.label} <span aria-hidden="true">{U.cta.arrow}</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
function Faq() {
  const F = AXH.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq">
      <div className="wrap">
        <div className="center" data-reveal><span className="eyebrow"><i />{F.eyebrow}</span><h2 className="h2">{F.h2}</h2></div>
        <div className="faq-list" data-reveal>
          {F.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className={`faq-item${isOpen ? " open" : ""}`}>
                <h3>
                  <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{it.q}</span><span className="tg" aria-hidden="true">{isOpen ? F.toggleOpen : F.toggleClosed}</span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} className="faq-a" role="region" aria-labelledby={`faq-q-${i}`} style={{ maxHeight: isOpen ? 700 : 0 }}><p>{it.a}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── PAGE ─────────────────────────────────────────────────────────────── */
export default function HeroesSaturday() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stops = [reveal(root), counters(root)];
    return () => stops.forEach((s) => s());
  }, []);

  const H = AXH.hero, C = AXH.characters, Y = AXH.why, HW = AXH.howItWorks, D = AXH.devices, T = AXH.cta, Fo = AXH.footer;

  return (
    <div className="hv4sat" ref={rootRef}>
      <Nav />
      <main>
        <Hero />

        <section className="stats" aria-label="Course at a glance">
          <div className="wrap">
            <div className="stat-grid">
              {H.counters.map((c, i) => (
                <div key={c.label} className="stat" data-reveal style={vars({ "--d": `${i * 90}ms`, "--c": c.tint })}><b data-count={c.value}>{c.value}</b><span>{c.label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="cast" id="heroes">
          <div className="wrap">
            <div className="center" data-reveal><h2 className="h2">{C.h2Lead} <span className="acc">{C.h2Accent}</span></h2></div>
            <div className="cast-grid">
              {C.cast.map((m, i) => (
                <article key={m.name} className={`member${m.villain ? " villain" : ""}`} data-reveal style={vars({ "--d": `${i * 120}ms`, "--r": `${m.tilt}deg`, "--c": m.tint[0], "--c2": m.tint[1] })}>
                  <div className="pic"><div className="por"><Image src={m.img} alt={m.alt} fill sizes="(max-width: 900px) 80vw, 380px" style={{ objectFit: "contain", objectPosition: "center bottom" }} /></div></div>
                  <h3>{m.name}</h3>
                  <p>{m.blurb}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Guide />

        <section className="why">
          <div className="wrap"><div className="box" data-reveal><h2>{Y.h2}</h2><p>{Y.p1}</p><p>{Y.p2}</p></div></div>
        </section>

        <section className="how" id="how">
          <div className="wrap">
            <div className="center" data-reveal><span className="eyebrow"><i />{HW.eyebrow}</span><h2 className="h2">{HW.h2Lead} <span className="acc">{HW.h2Accent}</span> {HW.h2Tail}</h2></div>
            <div className="steps">
              {HW.steps.map((s, i) => (
                <article key={s.num} className="step" data-reveal style={vars({ "--d": `${i * 110}ms`, "--c": s.color })}>
                  <div className={`n${s.dark ? " dark" : ""}`}>{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" aria-label="Numbers">
          <div className="wrap">
            {AXH.stats.map((s, i) => (
              <div key={s.label} className="bt" data-reveal style={vars({ "--d": `${i * 80}ms` })}><b data-count={s.value}>{s.value}</b><span>{s.label}</span></div>
            ))}
          </div>
        </section>

        <section className="dev">
          <div className="wrap">
            <div className="center" data-reveal><span className="eyebrow"><i />{D.eyebrow}</span><h2 className="h2">{D.h2Lead} <span className="acc">{D.h2Accent}</span></h2><p className="lede">{D.sub}</p></div>
            <div className="desk" data-reveal>
              <div className="devices">
                <div className="laptop">
                  <div className="scr">
                    <Image src={D.laptop.image} alt={D.laptop.alt} width={640} height={400} sizes="(max-width: 768px) 90vw, 640px" />
                    <span className="capt">{D.laptop.caption}</span>
                  </div>
                  <div className="base" />
                </div>
                <div className="tablet">
                  <Image src={D.tablet.image} alt={D.tablet.alt} width={280} height={392} sizes="(max-width: 768px) 60vw, 280px" />
                  <span className="capt">{D.tablet.caption}</span>
                </div>
              </div>
              <p className="footline">{D.footline}</p>
            </div>
          </div>
        </section>

        <Faq />

        <section className="cta">
          <div className="wrap">
            <div className="slab" data-reveal>
              <h2>{T.h2Lead} <span className="acc">{T.h2Accent}</span>{T.h2Tail}</h2>
              <p>{T.sub}</p>
              <a className="btn primary" href={T.button.href}>{T.button.label}<Icon name="arrow" size={20} sw={2.4} /></a>
              <div className="fine">{T.fine}</div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span className="mk" aria-hidden="true"><CubeMark size={18} color="#fff" strokeWidth={1.8} /></span>
          <div><div className="cp">{Fo.copyright}</div><div className="tg">{Fo.tagline}</div></div>
          <nav aria-label="Footer">{Fo.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}</nav>
          <p className="lg">{Fo.legal}</p>
        </div>
      </footer>
    </div>
  );
}

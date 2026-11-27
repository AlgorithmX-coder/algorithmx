"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import CourseLockup from "@/app/components/CourseLockup";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import { CX, ENROL, LOGIN, PRICE_FIGURE } from "./content";
import { demoStatus, findTell, isDone, remainingTells, TELLS, TELL_COUNT } from "./demo";
import "./field-unit.css";

/* /cyberexplorers, "Field Unit" (landing lab round 9, owner 27 Nov: "push it
 * live"). A port of landing-lab/r9-explorers.html: same sections in the live
 * order (nav, hero with the trailer in the HUD screen and three Wanted cards,
 * stats band, 01 why now, 02 the tap-the-three-tells demo, 03 the threat
 * board + mission reel + kit, the Cyber Heroes trust card, 04 the parent
 * commitments, FAQ, the price console with the clearance ladder, footer).
 *
 * Styles are one scoped sheet (field-unit.css, prefix cx9). State is data-*
 * attributes; scroll reveal sets data-shown imperatively so a re-render can
 * never wipe it. The trailer autoplays muted and loops (owner rule: hero
 * videos keep playing); the fixed pause button stops the video and every
 * animation, and reduced motion skips autoplay, reveals and count-ups. */


const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const iv = (i: number) => ({ "--i": i }) as CSSProperties;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14 M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── nav: the hex reticle lockup, three links (hidden under 960px), Enroll ── */
function Nav() {
  const N = CX.nav;
  return (
    <div className="wrap">
      <nav className="cx9-nav" aria-label="Cyber Explorers">
        {/* the course's own lockup and byline, exactly as on the previous
            page (owner: the logo never changes) */}
        <Link className="cx9-lock" href={N.home.href} aria-label={N.home.ariaLabel}>
          <CourseLockup id="explorers" size={0.8} tone="sand" />
          <span className="lk-by" aria-hidden="true"><ByAlgorithmX by={N.bylineBy} brand={N.bylineBrand} wordClassName="dim" /></span>
        </Link>
        {N.links.map((l) =>
          l.href.startsWith("#")
            ? <a key={l.label} className="l" href={l.href}>{l.label}</a>
            : <Link key={l.label} className="l" href={l.href}>{l.label}</Link>,
        )}
        <Link className="btn" href={ENROL}>{N.enrol}</Link>
      </nav>
    </div>
  );
}

/* ── the hero screen: the real trailer, muted and looping. Muted is set on
   the element before play() (React's muted prop alone does not reach the
   DOM attribute, and an unmuted autoplay is refused). If even a muted play
   is refused, or the visitor prefers reduced motion, a play button shows. ── */
function Trailer({ still }: { still: boolean }) {
  const V = CX.hero.video, S = CX.hero.screen;
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const started = useRef(false);

  const start = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => { started.current = true; setNeedsTap(false); }).catch(() => setNeedsTap(true));
  }, []);

  useEffect(() => {
    if (reducedMotion()) {
      const id = window.setTimeout(() => setNeedsTap(true), 0);
      return () => window.clearTimeout(id);
    }
    start();
  }, [start]);

  /* the page's pause button stops the trailer; resuming restarts it only
     if it was already running (reduced motion still waits for a tap) */
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (still) v.pause();
    else if (started.current) v.play().catch(() => setNeedsTap(true));
  }, [still]);

  return (
    <div className="cx9-screen hud">
      <div className="bar mono"><b>{S.live}</b><span>{S.net}</span></div>
      <div className="vid">
        <video ref={ref} src={V.src} poster={V.poster} muted loop playsInline preload="auto" aria-label={V.ariaLabel} />
        {needsTap && (
          <button type="button" className="play" aria-label={S.play} onClick={start}>
            <span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span>
          </button>
        )}
      </div>
    </div>
  );
}

function Hero({ still }: { still: boolean }) {
  const H = CX.hero;
  return (
    <header className="cx9-hero" id="top">
      <div className="wrap g">
        <div>
          <span className="mono tagline" data-reveal>{H.tagline}</span>
          <h1 data-reveal style={iv(1)}>{H.h1} <em>{H.h1Em}</em></h1>
          <p className="lead" data-reveal style={iv(2)}>{H.lead}</p>
          <ul className="cx9-topics" data-reveal style={iv(3)}>{H.topics.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="cx9-cta" data-reveal style={iv(4)}>
            <Link className="btn" href={ENROL}>{H.primary} <Arrow /></Link>
            <a className="btn ghost" href={H.secondary.href}>{H.secondary.label}</a>
          </div>
          <ul className="cx9-ticks" data-reveal style={iv(5)}>{H.ticks.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="cx9-art" data-reveal style={iv(2)}>
          <Trailer still={still} />
          <ul className="cx9-wanted">
            {H.wanted.map((w) => (
              <li key={w.slug} style={{ display: "contents" }}>
                <figure style={{ "--r": w.r } as CSSProperties}>
                  <span className="ph">
                    <Image src={`/explorers/actors/${w.slug}.png`} alt={`${w.name}, a threat actor in the course`} fill sizes="150px" />
                  </span>
                  <figcaption>{w.name} <span>{H.wantedTag}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

/* ── 02: the phishing message with three tells to tap ── */
function Demo() {
  const D = CX.demo;
  const [found, setFound] = useState<ReadonlyArray<string>>([]);
  const timers = useRef<number[]>([]);
  const done = isDone(found);
  const tap = (id: string) => setFound((f) => findTell(f, id));
  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => clearTimers, []);

  const onShow = () => {
    clearTimers();
    if (done) { setFound([]); return; }
    const left = remainingTells(found);
    if (reducedMotion()) { setFound((f) => left.reduce(findTell, f)); return; }
    left.forEach((id, i) => { timers.current.push(window.setTimeout(() => tap(id), 350 * (i + 1))); });
  };

  const tell = (t: (typeof TELLS)[keyof typeof TELLS]) => {
    const on = found.includes(t.id);
    return (
      <button type="button" className="tell" data-label={t.label} data-found={on ? "" : undefined} aria-pressed={on}
        aria-label={on ? `${t.text}, ${t.label}` : t.text} onClick={() => tap(t.id)}>
        {t.text}
      </button>
    );
  };

  return (
    <section className="flush" aria-labelledby="cx9-demo-h">
      <div className="wrap">
        <span className="mono tagline" data-reveal>{D.tagline}</span>
        <h2 id="cx9-demo-h" data-reveal style={iv(1)}>{D.h2} <em>{D.h2Em}</em></h2>
        <div className="cx9-demo">
          <div className="cx9-phone hud" id="demo" data-reveal data-done={done ? "" : undefined}>
            <div className="top mono"><b>{D.evidence}</b><span>{D.instruction}</span></div>
            <div className="cx9-msg">
              <div className="from"><strong>{D.sender}</strong>{tell(TELLS.sender)}</div>
              Your account will be {tell(TELLS.pressure)} unless you verify it now at {tell(TELLS.link)}
              <span className="fakebtn" aria-hidden="true">{D.fakeButton}</span>
            </div>
            <div className="foot mono">
              <span className="cx9-pips" aria-hidden="true">
                {Array.from({ length: TELL_COUNT }, (_, i) => <i key={i} data-on={i < found.length ? "" : undefined} />)}
              </span>
              <b role="status">{demoStatus(found)}</b>
            </div>
          </div>
          <div className="cx9-say">
            <figure className="cx9-quote before" data-reveal data-live={done ? undefined : ""}>
              <span className="mono">{D.before.label}</span><p>{D.before.quote}</p>
            </figure>
            <figure className="cx9-quote after" data-reveal style={iv(1)} data-live={done ? "" : undefined}>
              <span className="mono">{D.after.label}</span><p>{D.after.quote}</p>
            </figure>
            <div className="cx9-try" data-reveal style={iv(2)}>
              <button type="button" className="btn ghost" onClick={onShow}>{done ? D.reset : D.show}</button>
              <span>{D.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 03: six threat actors (real buttons that declassify), the mission reel,
   the four kit tiles ── */
function Course() {
  const C = CX.course;
  const [open, setOpen] = useState<ReadonlyArray<string>>([]);
  const toggle = (s: string) => setOpen((o) => (o.includes(s) ? o.filter((x) => x !== s) : [...o, s]));
  /* two copies make the loop seamless; the second is decoration only */
  const reel = (copy: number) => C.reel.map((s) => (
    <li key={`${copy}-${s.n}`} aria-hidden={copy ? true : undefined}>
      <figure>
        <span className="ph"><Image src={`/explorers/scenes/m${s.n}-cold-open.jpg`} alt="" fill sizes="300px" /></span>
        <figcaption>{s.label}</figcaption>
      </figure>
    </li>
  ));
  return (
    <section id={C.id} className="flush">
      <div className="wrap">
        <span className="mono tagline" data-reveal>{C.tagline}</span>
        <h2 data-reveal style={iv(1)}>{C.h2} <em>{C.h2Em}</em></h2>
        <p className="sub" data-reveal style={iv(2)}>{C.sub}</p>
        <ul className="cx9-board">
          {C.actors.map((a, i) => {
            const on = open.includes(a.slug);
            return (
              <li key={a.slug}>
                <button type="button" className="cx9-actor" data-reveal style={iv(i)} data-open={on ? "" : undefined}
                  aria-pressed={on} aria-label={`${a.name}: ${a.line}`} onClick={() => toggle(a.slug)}>
                  <Image src={`/explorers/actors/${a.slug}.png`} alt="" fill sizes="(max-width: 960px) 50vw, 200px" />
                  <span className="file">{C.filePrefix} 0{i + 1}</span>
                  <span className="nm"><b>{a.name}</b><span>{a.line}</span></span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="cx9-reel" data-reveal role="region" aria-label={C.reelLabel}>
          <ul className="tr">
            {reel(0)}
            {reel(1)}
          </ul>
        </div>
        <div className="cx9-kit">
          {C.kit.map((k, i) => (
            <div key={k.t} data-reveal style={iv(i)}>
              <b>{k.n}</b>
              <h3>{k.t}</h3>
              {k.p && <p>{k.p}</p>}
              {k.verbs.length > 0 && <ul className="cx9-verbs">{k.verbs.map((v) => <li key={v}>{v}</li>)}</ul>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const F = CX.faq;
  return (
    <section className="flush" aria-labelledby="cx9-faq-h">
      <div className="wrap">
        <div className="cx9-faqhead">
          <span className="mono tagline" data-reveal>{F.tagline}</span>
          <h2 id="cx9-faq-h" data-reveal style={iv(1)}>{F.h2}</h2>
        </div>
        <div className="cx9-faq">
          {F.items.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary><span className="n">0{i + 1}</span>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The page. fontClass carries the three next/font variables from the server wrapper (ExplorersFieldUnit). */
export default function FieldUnit({ fontClass }: { fontClass: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [year, setYear] = useState(2026);
  const W = CX.why, T = CX.trust, P = CX.parents, PR = CX.price, FO = CX.footer, M = CX.motion;

  /* the live footer's year, set after mount so server and client agree */
  useEffect(() => {
    const id = window.setTimeout(() => setYear(new Date().getFullYear()), 0);
    return () => window.clearTimeout(id);
  }, []);

  /* reveal on scroll (data-shown) and the stats count-up */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counts = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.setAttribute("data-shown", "");
      io.unobserve(e.target);
    }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    const raf: number[] = [];
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target as HTMLElement, to = Number(el.dataset.count), t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = String(Math.round(to * k));
        if (k < 1) raf.push(requestAnimationFrame(step));
      };
      raf.push(requestAnimationFrame(step));
    }), { threshold: 0.6 });
    counts.forEach((el) => co.observe(el));
    return () => { io.disconnect(); co.disconnect(); raf.forEach((r) => cancelAnimationFrame(r)); };
  }, []);

  return (
    <div ref={rootRef} className={`cx9 ${fontClass}`} data-still={still ? "" : undefined}>
      <Nav />
      <Hero still={still} />

      <div className="cx9-band" role="region" aria-label="Key numbers">
        <div className="wrap">
          {CX.stats.map((s) => (
            <div className="cx9-stat" key={s.label}><b data-count={s.n}>{s.n}</b><span className="mono">{s.label}</span></div>
          ))}
        </div>
      </div>

      <main>
        <section>
          <div className="wrap">
            <span className="mono tagline" data-reveal>{W.tagline}</span>
            <h2 data-reveal style={iv(1)}>{W.h2} <em>{W.h2Em}</em></h2>
            <p className="sub" data-reveal style={iv(2)}>{W.sub}</p>
            <div className="cx9-intel">
              {W.cards.map((c, i) => (
                <div className="cx9-card" key={c.label} data-reveal style={iv(i)}>
                  <span className="mono">{c.label}</span>
                  <b>{c.a}<i>{c.mid}</i>{c.b}</b>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Demo />
        <Course />

        <section className="flush">
          <div className="wrap">
            <div className="cx9-trust" data-reveal>
              <Image src={T.img.src} alt={T.img.alt} width={T.img.width} height={T.img.height} sizes="150px" />
              <div><span className="mono">{T.label}</span><h3>{T.h3}</h3><p>{T.p}</p></div>
              <Link className="btn ghost" href={T.link.href}>{T.link.label}</Link>
            </div>
          </div>
        </section>

        <section id={P.id} className="flush">
          <div className="wrap">
            <span className="mono tagline" data-reveal>{P.tagline}</span>
            <h2 data-reveal style={iv(1)}>{P.h2} <em>{P.h2Em}</em></h2>
            <ul className="cx9-pledge">
              {P.pledges.map((p, i) => (
                <li className="cx9-pl" key={p.t} data-reveal style={iv(i % 3)}>
                  <span className="ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p.icon} /></svg>
                  </span>
                  <h3>{p.t}</h3>
                  <p>{p.p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Faq />

        <section className="flush" aria-labelledby="cx9-price-h">
          <div className="wrap">
            <div className="cx9-price hud" data-reveal>
              <div>
                <div className="amt"><sup>£</sup>{PRICE_FIGURE}</div>
                <span className="mono once">{PR.once}</span>
              </div>
              <div>
                <h2 id="cx9-price-h">{PR.h2}</h2>
                <ul>{PR.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                <div className="row">
                  <Link className="btn" href={ENROL}>{PR.primary}</Link>
                  <Link className="l" href={LOGIN}>{PR.login}</Link>
                </div>
              </div>
              <ol className="cx9-ladder" aria-label={PR.ladderLabel}>
                {PR.ladder.map((r, i) => <li key={r} style={{ "--n": i } as CSSProperties}>{r}</li>)}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="cx9-foot">
        <div className="wrap row">
          <span className="cpy">{FO.copyrightPrefix}{year}{FO.copyrightSuffix}</span>
          <nav aria-label={FO.ariaLabel}>
            {FO.links.map((l) => (l.href.startsWith("/") ? <Link key={l.label} href={l.href}>{l.label}</Link> : <a key={l.label} href={l.href}>{l.label}</a>))}
          </nav>
        </div>
        <p className="wrap legal">{FO.legal}</p>
      </footer>

      <button type="button" className="cx9-pause" aria-label={still ? M.play : M.pause} aria-pressed={still} onClick={() => setStill((s) => !s)}>
        {still
          ? <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
          : <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" /><rect x="7" y="1.5" width="3" height="9" /></svg>}
      </button>
    </div>
  );
}

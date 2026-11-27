"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Chakra_Petch, IBM_Plex_Mono, Inter } from "next/font/google";
import CourseLockup from "@/app/components/CourseLockup";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import { reduced, reveal } from "@/app/components/home-holo/fx";
import { AXO, moduleArc, stepLabel, type SafetyIcon } from "./content";
import "./ops-console.css";

/* Glass Console, the /ops page (landing lab round 9, version B, the owner's
 * pick, 2026-11-27). Light glass panels on a faint grid, Chakra Petch
 * headlines with a violet to cyan accent, the trailer in a console window,
 * a moving strip of the 20 module names, the range as five step buttons
 * driving a typed terminal, the curriculum as a stage bar over 20 numbered
 * tiles with a readout, the rank bars and the filed finding, four safety
 * cards, the FAQ and the closing dark panel. Everything is scoped under
 * .op9; reveal and pause state are data attributes (data-in, data-still).
 *
 * The nav lockup is the live one, unchanged (owner ruling: the logo never
 * changes): CourseLockup ops/sand with the stacked "by [cube] AlgorithmX". */

/* --font-chakra is the variable CourseLockup reads for "CYBER OPS". */
const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-chakra", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--op9-mono", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--op9-sans", display: "swap" });

const Arrow = () => <svg className="op9-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const PAUSE = <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" /><rect x="7" y="1.5" width="3" height="9" /></svg>;
const PLAY = <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

const SAFETY_ICONS: Record<SafetyIcon, string> = {
  range: "M4 4h16v16H4z M4 9h16 M9 9v11",
  scope: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z M9 12l2 2 4-4",
  con: "M12 3l10 18H2z M12 10v5 M12 18v.01",
  tracked: "M4 20V10 M10 20V4 M16 20v-7 M3 20h18",
};

const d = (i: number) => ({ "--i": i }) as CSSProperties;

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="op9-cmd" data-reveal>{children}</span>;
}

/* The live Ops lockup, as on main: the real CourseLockup (sand tone) with the
 * stacked "by [blue cube] AlgorithmX" byline under the name. */
function Lockup() {
  const N = AXO.nav;
  return (
    <a className="op9-lockup" href={N.brand.href} aria-label={N.brand.ariaLabel}>
      <CourseLockup id="ops" tone="sand" size={0.85} />
      <span className="lk-by" aria-hidden="true"><ByAlgorithmX wordClassName="dim" /></span>
    </a>
  );
}

/* The trailer. Autoplays muted and loops (owner rule). React does not write
 * the muted attribute into the server HTML, so on mount the element is muted
 * by hand and play() is called, which is what makes the autoplay reliable.
 * The page's pause control stops and restarts it. */
function Reel({ still }: { still: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const V = AXO.hero.media.video;
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (still) v.pause();
    else v.play().catch(() => {});
  }, [still]);
  return <video ref={ref} src={V.src} poster={V.poster} muted loop playsInline autoPlay preload="auto" aria-label={V.ariaLabel} />;
}

/* The range console: five step buttons and a terminal that types each step's
 * lines. It autoplays through the steps until a step is clicked. Reduced
 * motion shows step 03 finished, with no typing; the pause control finishes
 * the step on screen and holds it. */
function RangeConsole({ still }: { still: boolean }) {
  const R = AXO.range;
  const [view, setView] = useState({ step: 0, nonce: 0 });
  const [calm, setCalm] = useState(false);
  const auto = useRef(true);
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!reduced()) return;
      auto.current = false;
      setCalm(true);
      setView((v) => ({ step: 2, nonce: v.nonce + 1 }));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = pre.current;
    if (!el) return;
    const lines = R.steps[view.step].lines;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    el.textContent = "";
    if (still || calm) {
      lines.forEach(([cls, text], i) => {
        const s = document.createElement("span");
        s.className = cls;
        s.textContent = text;
        el.appendChild(s);
        if (i < lines.length - 1) el.appendChild(document.createTextNode("\n"));
      });
      el.removeAttribute("aria-busy");
      return;
    }
    el.setAttribute("aria-busy", "true");
    let li = 0, ci = 0;
    let cur: HTMLSpanElement | null = null;
    const tick = () => {
      if (li >= lines.length) {
        el.removeAttribute("aria-busy");
        if (auto.current) later(() => setView((v) => ({ step: (v.step + 1) % R.steps.length, nonce: v.nonce + 1 })), 2600);
        return;
      }
      const [cls, text] = lines[li];
      if (!cur) { cur = document.createElement("span"); cur.className = cls; el.appendChild(cur); }
      if (cls === "p") {
        cur.textContent = text.slice(0, ++ci);
        if (ci < text.length) { later(tick, 26); return; }
      } else cur.textContent = text;
      el.appendChild(document.createTextNode("\n"));
      li++; ci = 0; cur = null;
      later(tick, cls === "p" ? 420 : 260);
    };
    tick();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [view, still, calm, R.steps]);

  const pick = (i: number) => { auto.current = false; setView((v) => ({ step: i, nonce: v.nonce + 1 })); };

  return (
    <div className="op9-range">
      <ol className="op9-steps" aria-label={R.stepsAriaLabel} data-reveal>
        {R.steps.map((s, i) => (
          <li key={s.n}>
            <button className="op9-step" type="button" aria-pressed={view.step === i} onClick={() => pick(i)}>
              <span className="n">{s.n}</span><b>{s.title}</b><span>{s.body}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="op9-win op9-term" data-reveal style={d(1)}>
        <div className="bar"><i /><i /><i /><span>{R.terminal.title}</span><em>{stepLabel(view.step)}</em></div>
        <pre ref={pre} aria-live="polite" />
        <div className="sand"><span>{R.terminal.sandbox} <b>{R.terminal.sealed}</b></span><span>{R.terminal.noRoute}</span></div>
      </div>
    </div>
  );
}

/* The curriculum: the stage bar, 20 numbered tiles and the readout. Hover,
 * focus or click picks a module. */
function Curriculum() {
  const C = AXO.curriculum;
  const [mod, setMod] = useState<number>(C.defaultModule);
  const m = moduleArc(mod);
  return (
    <>
      <div className="op9-arc" data-reveal style={d(2)}>
        {C.arcs.map((a) => <span key={a.kind} data-arc={a.kind}>{a.label}</span>)}
      </div>
      <div className="op9-track" role="group" aria-label={C.tilesAriaLabel} data-reveal style={d(3)}>
        {C.modules.map((x, i) => {
          const t = moduleArc(i);
          return (
            <button
              key={x.title}
              className="op9-mod"
              type="button"
              data-arc={t.kind}
              aria-pressed={mod === i}
              aria-label={`Module ${i + 1}: ${x.title}`}
              onMouseEnter={() => setMod(i)}
              onFocus={() => setMod(i)}
              onClick={() => setMod(i)}
            >
              {t.n}
            </button>
          );
        })}
      </div>
      <div className="op9-read op9-box" aria-live="polite" data-reveal style={d(4)}>
        <span className="k">{C.readoutKey} {m.n}</span><b>{m.title}</b><em data-arc={m.kind}>{m.tag}</em>
      </div>
    </>
  );
}

export default function OpsConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => { const root = rootRef.current; return root ? reveal(root) : undefined; }, []);

  const N = AXO.nav, H = AXO.hero, R = AXO.range, C = AXO.curriculum, O = AXO.outcome, FC = O.findingCard, S = AXO.safety, F = AXO.faq, J = AXO.cta, FO = AXO.footer;
  const names = C.modules.map((m) => m.title.toUpperCase());

  return (
    <div className={`op9 ${display.variable} ${mono.variable} ${sans.variable}`} ref={rootRef} data-still={still ? "" : undefined}>
      <header className="op9-wrap">
        <nav className="op9-nav" aria-label={N.ariaLabel}>
          <Lockup />
          {N.links.map((l) => <a key={l.href} className="l" href={l.href}>{l.label}</a>)}
          <a className="l" href={N.signIn.href}>{N.signIn.label}</a>
          <a className="op9-btn" href={N.cta.href}>{N.cta.label}</a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="op9-hero" id="top">
          <div className="op9-wrap g">
            <div>
              <ul className="op9-chips" data-reveal>
                {H.chips.map((c) => <li key={c.text} data-open={c.open ? "" : undefined}>{c.text}</li>)}
              </ul>
              <h1 data-reveal style={d(1)}>{H.h1Line1}<br /><mark>{H.h1Accent}</mark><span className="op9-cur" aria-hidden="true" /></h1>
              <p className="lead" data-reveal style={d(2)}>{H.lead} <b>{H.leadBold}</b></p>
              <div className="op9-cta" data-reveal style={d(3)}>
                {H.buttons.map((b) => <a key={b.label} className="op9-btn" data-ghost={b.style === "ghost" ? "" : undefined} href={b.href}>{b.label}{b.style === "primary" && <Arrow />}</a>)}
              </div>
              <p className="op9-note" data-reveal style={d(4)}>{H.note}</p>
            </div>
            <div className="op9-win" data-reveal style={d(2)}>
              <div className="bar"><i /><i /><i /><span>{H.media.titleBar.title}</span><em>{H.media.titleBar.badge}</em></div>
              <Reel still={still} />
            </div>
          </div>
        </section>

        {/* THE STRIP: the 20 module names, twice for a seamless loop */}
        <div className="op9-tick" aria-hidden="true">
          <div className="tr">{[...names, ...names].map((n, i) => <span key={i}>{n}</span>)}</div>
        </div>

        {/* THE RANGE */}
        <section className="op9-sec" id="range">
          <div className="op9-wrap">
            <Eyebrow>{R.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{R.h2} <mark>{R.h2Accent}</mark></h2>
            <p className="op9-sub" data-reveal style={d(2)}>{R.lead}</p>
            <RangeConsole still={still} />
          </div>
        </section>

        {/* CURRICULUM */}
        <section className="op9-sec op9-flush" id="curriculum">
          <div className="op9-wrap">
            <Eyebrow>{C.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{C.h2} <mark>{C.h2Accent}</mark></h2>
            <Curriculum />
          </div>
        </section>

        {/* OUTCOME */}
        <section className="op9-sec op9-flush" id="outcome">
          <div className="op9-wrap">
            <Eyebrow>{O.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{O.h2} <mark>{O.h2Accent}</mark></h2>
            <div className="op9-out">
              <div data-reveal>
                <p className="op9-sub flat">{O.lead}</p>
                <div className="op9-ranks" data-reveal>
                  {O.ranks.map((r) => (
                    <div className="op9-rank" data-on={r.active ? "" : undefined} key={r.name}>
                      <span>{r.name}</span>
                      <span className="barw" aria-hidden="true"><i style={{ "--w": r.width } as CSSProperties} /></span>
                      <span>{r.pct ?? ""}</span>
                    </div>
                  ))}
                </div>
              </div>
              <article className="op9-box op9-find" data-reveal style={d(1)}>
                <span className="op9-stamp">{FC.stamp}</span>
                <div className="hd"><span className="sev">{FC.severity}</span><span>{FC.cvss}</span><em>{FC.id}</em></div>
                <div className="bd">
                  <h3>{FC.title}</h3>
                  <dl>{FC.fields.map((f) => <div key={f.label}><dt>{f.label}</dt><dd data-kind={f.kind}>{f.value}</dd></div>)}</dl>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section className="op9-sec op9-flush" id="safety">
          <div className="op9-wrap">
            <Eyebrow>{S.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{S.h2} <mark>{S.h2Accent}</mark></h2>
            <p className="op9-sub" data-reveal style={d(2)}>{S.lead}</p>
            <div className="op9-safe">
              {S.cards.map((c, i) => (
                <div key={c.title} data-reveal style={d(i)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d={SAFETY_ICONS[c.icon]} /></svg>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="op9-sec op9-flush" id="faq">
          <div className="op9-wrap">
            <div className="op9-center"><Eyebrow>{F.eyebrow}</Eyebrow><h2 data-reveal style={d(1)}>{F.h2}</h2></div>
            <div className="op9-faq">
              {F.items.map((it) => (
                <details key={it.q} open={it.openByDefault || undefined}>
                  <summary>{it.q}</summary>
                  <p>{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ENLIST */}
        <section className="op9-sec op9-flush" id="join">
          <div className="op9-wrap">
            <div className="op9-end" data-reveal>
              <span className="op9-cmd">{J.eyebrow}</span>
              <h2>{J.h2}<span className="op9-cur" aria-hidden="true" /></h2>
              <p>{J.lead}</p>
              <div className="row">
                {J.buttons.map((b) => <a key={b.label} className="op9-btn" data-ghost={b.style === "ghost" ? "" : undefined} href={b.href}>{b.label}{b.style === "primary" && <Arrow />}</a>)}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="op9-foot">
        <div className="op9-wrap">
          <nav className="links" aria-label={FO.linksAriaLabel}>{FO.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}</nav>
          <p>{FO.fine}</p>
        </div>
      </footer>

      <button className="op9-pause" type="button" onClick={() => setStill((s) => !s)} aria-label={still ? H.motionButton.paused : H.motionButton.playing} aria-pressed={still}>{still ? PLAY : PAUSE}</button>
    </div>
  );
}

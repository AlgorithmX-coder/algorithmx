"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import CubeMark from "@/app/components/CubeMark";
import { AXP, splitHeadline } from "./content";
import { powerWires, reveal, reduced } from "./fx";
import HoloAccent from "./HoloAccent";
import PasswordLab from "./PasswordLab";
import ProRain from "./ProRain";
import HoloWaitlist from "./HoloWaitlist";
import "./pro.css";

/* Hologram, the /pro page (owner's pick from the landing lab round 4,
 * 2026-11-22, concept p01: "push them live"). The house Hologram language
 * for career changers with signal orange as the accent: platinum ground and
 * grid, orange pools, the live page's code rain kept alive as a faint orange
 * canvas behind everything, a glass capsule nav with the Pro lockup, the
 * headline accent drawn from ember-to-magenta points, and the REAL password
 * lab inside the holographic glass frame. Below: the same sections, copy and
 * order as the page it replaces.
 *
 * What stayed real: the lab's maths and strings (crack.ts), price / name /
 * status from the Product row, the PURCHASE_OPEN gate and every CTA href,
 * the waitlist's POST to /api/waitlist with its strings, every link.
 * Everything lives under .pv1 so the stylesheet cannot leak. Reveal state is
 * a data-in attribute set imperatively (a class on className would be wiped
 * by the next re-render). */

const ENROL_ANCHOR = "#enrol";

/* Whether the paid checkout is live. The consumer Stripe flow for Cyber Pro
 * is not wired yet (app/purchase/[slug]/actions.ts still grants the
 * entitlement for free as a stub), so while this is false the course shows
 * as live but every buy action routes to the enrol-band waitlist instead of
 * /purchase. Flip to true in the same change that lands real Stripe checkout. */
const PURCHASE_OPEN = false;

const ARROW = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const ARROW_SM = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const PLUS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const PAUSE = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>;
const PLAY = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

/* The Pro mark, the notched terminal chip from CourseLockup (id "pro"). */
function ProMark({ size = 22, colour = "#a63a08" }: { size?: number; colour?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
      <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 15.5 H16.2" strokeLinecap="round" />
    </svg>
  );
}

const Pill = ({ children }: { children: string }) => <span className="pill">{children}</span>;

function Grad({ h, span }: { h: string; span: string }) {
  const [a, b, c] = splitHeadline(h, span);
  return <>{a}<span className="acc">{b}</span>{c}</>;
}

/* ── nav: glass capsule, the lockup, chips with a scroll-spy on Pricing, Sign in, the orange pill ── */
function Nav({ ctaLabel, ctaHref }: { ctaLabel: string; ctaHref: string }) {
  const N = AXP.nav;
  const [on, setOn] = useState("");
  useEffect(() => {
    const el = document.getElementById(AXP.pricing.anchorId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((ens) => ens.forEach((en) => setOn(en.isIntersecting ? AXP.pricing.anchorId : "")), { rootMargin: "-40% 0px -50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <header className="nav">
      <div className="capsule">
        <Link className="lockup" href={N.logo.href} aria-label={N.logo.ariaLabel}>
          <ProMark size={22} />
          <span className="lk-col">
            <span className="lk-name">{N.logo.wordmark}</span>
            <span className="lk-by"><span className="dim">{N.logo.by}</span><CubeMark size={12} color="#5f8dff" code /><span className="dim">{N.logo.brand}</span></span>
          </span>
        </Link>
        <nav className="chips" aria-label={N.chipsAriaLabel}>
          {N.links.map((l) => l.href.startsWith("/")
            ? <Link key={l.label} href={l.href}>{l.label}</Link>
            : <a key={l.label} href={l.href} className={l.id && on === l.id ? "on" : undefined} aria-current={l.id && on === l.id ? "location" : undefined}>{l.label}</a>)}
        </nav>
        <Link className="login" href={N.signIn.href}>{N.signIn.label}</Link>
        <a className="ctaPill" href={ctaHref}>{ctaLabel}{ARROW}</a>
      </div>
    </header>
  );
}

/* ── FAQ: five hairline rows; open state is React state only ── */
function Faq() {
  const [open, setOpen] = useState(-1);
  const F = AXP.faq;
  return (
    <section className="s wrap" id="questions">
      <div className="shead" data-reveal><h2 className="h2">{F.h2}</h2></div>
      <div className="faq">
        {F.items.map((it, i) => (
          <div className={`faq-item ${i === open ? "open" : ""}`} key={it.q} data-reveal style={{ "--d": `${i * 0.05}s` } as React.CSSProperties}>
            <button type="button" aria-expanded={i === open} onClick={() => setOpen(i === open ? -1 : i)}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm">{PLUS}</span>
            </button>
            <div className="faq-a"><div><p>{it.a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProHolo({ product }: { product: Product }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(true);

  /* the remembered motion state and the OS preference, read after mount so
     server and first client render agree */
  useEffect(() => {
    const id = window.setTimeout(() => { setMotion(!reduced()); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* reveal on scroll, scoped to this root */
  useEffect(() => { const root = rootRef.current; return root ? reveal(root) : undefined; }, []);

  /* the Pro mark powering the four acts along wires */
  useEffect(() => { const wrap = powerRef.current; return wrap ? powerWires(wrap, ".act", 72) : undefined; }, []);

  const isActive = product.status === "ACTIVE";
  const priceLine = `£${Math.round(product.priceGBP / 100)}`;
  const buyHref = `/purchase/${product.slug}`;
  const canBuy = isActive && PURCHASE_OPEN;
  const ctaHref = canBuy ? buyHref : ENROL_ANCHOR;
  const ctaLabel = canBuy ? `${AXP.hero.cta.forPrice} ${priceLine}` : isActive ? AXP.hero.cta.active : AXP.hero.cta.inactive;
  const navLabel = isActive ? AXP.nav.cta.active : AXP.nav.cta.inactive;

  const mdCta = (label: string) => <div className="center"><a className="btn primary md" href={ctaHref}>{label}{ARROW}</a></div>;

  const H = AXP.hero, MO = AXP.modules, WN = AXP.whyNow, HW = AXP.howItWorks, FY = AXP.forYou, J = AXP.journey, OU = AXP.outcomes, B = AXP.breaches, HO = AXP.honest, PR = AXP.pricing, FC = AXP.cta, FO = AXP.footer;

  return (
    <div className="pv1" ref={rootRef} data-paused={motion ? undefined : ""}>
      <div className="atmo" aria-hidden="true"><ProRain motion={motion} /><div className="grid" /><div className="pool c" /><div className="pool v" /><div className="pool g" /></div>
      <Nav ctaLabel={navLabel} ctaHref={ctaHref} />
      <main>
        <section className="hero" id="top">
          <div className="wrap hgrid">
            <div className="copy">
              <div className="eyebrow"><i aria-hidden="true" />{H.eyebrow}</div>
              <HoloAccent plain={H.h1Plain} accent={H.h1Gradient} motion={motion} />
              <p className="sub">{H.sub}</p>
              <div className="ctas">
                <a className="btn primary" href={ctaHref}>{ctaLabel}{ARROW}</a>
                <span className="pstack"><b>{priceLine} {H.priceStack.once}</b><span>{H.priceStack.line2}</span></span>
              </div>
              <div className="srow">
                <Link href={H.secondaryRow.link.href}>{H.secondaryRow.link.label}{ARROW_SM}</Link>
                <span className="badge">{H.secondaryRow.badge}</span>
              </div>
            </div>
            <PasswordLab />
          </div>
          <button className="motion" type="button" onClick={() => setMotion((m) => !m)} aria-pressed={!motion} aria-label={motion ? AXP.motionButton.playing : AXP.motionButton.paused}>{motion ? PAUSE : PLAY}</button>
        </section>

        <section className="s wrap" id="real">
          <div className="shead c" data-reveal><Pill>{MO.eyebrow}</Pill><h2 className="h2">{MO.h2Plain} <span className="acc">{MO.h2Gradient}</span></h2><p className="lede">{MO.sub}</p></div>
          <div className="hooks">
            {MO.items.map((m, i) => (
              <article className="hook glass" key={m.mod} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
                <div className="term">
                  <div className="th"><span className="dots" aria-hidden="true"><i /><i /><i /></span>{m.mod}</div>
                  {m.lines.map((l) => <div key={l.text} style={{ color: l.colour, fontWeight: l.weight }}>{l.text}</div>)}
                </div>
                <h3>{m.title}</h3><p>{m.desc}</p>
              </article>
            ))}
          </div>
          {mdCta(MO.cta)}
        </section>

        <section className="s wrap" id="whynow">
          <div className="why glass" data-reveal>
            <div><Pill>{WN.eyebrow}</Pill><h2 className="h2">{WN.h2}</h2><p>{WN.p1}</p><p className="soft">{WN.p2}</p></div>
            <ul>{WN.points.map((p) => <li key={p.title}><span className="ar" aria-hidden="true">→</span><div><b>{p.title}</b><span>{p.desc}</span></div></li>)}</ul>
          </div>
        </section>

        <section className="s wrap" id="how">
          <div className="shead c" data-reveal><Pill>{HW.eyebrow}</Pill><h2 className="h2">{HW.h2}</h2><p className="lede">{HW.sub}</p></div>
          <div className="tiles4">
            {HW.steps.map((s, i) => <article className="tile glass" key={s.n} data-reveal style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}><div className="num">{s.n}</div><h3>{s.title}</h3><p>{s.desc}</p></article>)}
          </div>
        </section>

        <section className="s wrap" id="foryou">
          <div className="shead c" data-reveal><h2 className="h2">{FY.h2}</h2></div>
          <div className="tiles4">
            {FY.items.map((s, i) => <article className="tile top glass" key={s.title} data-reveal style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}><h3>{s.title}</h3><p>{s.desc}</p></article>)}
          </div>
        </section>

        <section className="s wrap" id="journey">
          <div className="shead c" data-reveal><h2 className="h2"><Grad h={J.h2} span={J.h2Gradient} /></h2><p className="lede">{J.sub}</p></div>
          <div className="power" ref={powerRef}>
            <span className="src"><ProMark size={38} colour="currentColor" /></span>
            <svg className="wires" aria-hidden="true" />
            <div className="acts">
              {J.acts.map((a, i) => (
                <article className="act glass" key={a.badge} data-reveal style={{ "--d": `${i * 0.08}s` } as React.CSSProperties} tabIndex={0}>
                  <span className="pdot" aria-hidden="true" /><span className="badge">{a.badge}</span><span className="span">· {a.span}</span><h3>{a.title}</h3><p>{a.desc}</p>
                </article>
              ))}
            </div>
          </div>
          {mdCta(J.cta)}
        </section>

        <section className="s wrap" id="proof">
          <div className="out glass" data-reveal>
            <div className="shead c" style={{ marginBottom: 0 }}><h2 className="h2"><Grad h={OU.h2} span={OU.h2Gradient} /></h2><p className="lede">{OU.sub}</p></div>
            <div className="tiles5">
              {OU.items.map((t, i) => <div className="t" key={t.title}><div className="n">{String(i + 1).padStart(2, "0")}</div><h3>{t.title}</h3><p>{t.desc}</p></div>)}
            </div>
          </div>
        </section>

        <section className="s wrap" id="stories">
          <div className="shead c" data-reveal><Pill>{B.eyebrow}</Pill><h2 className="h2"><Grad h={B.h2} span={B.h2Gradient} /></h2><p className="lede">{B.sub}</p></div>
          <div className="breaches">
            {B.items.map((b, i) => (
              <article className="breach glass" key={b.org} data-reveal style={{ "--d": `${(i % 3) * 0.08}s` } as React.CSSProperties}>
                <div className="org"><b>{b.org}</b><span>{b.year}</span></div><p>{b.lesson}</p><div className="tag">{b.tag}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="s wrap" id="honest">
          <div className="shead c" data-reveal><Pill>{HO.eyebrow}</Pill><h2 className="h2">{HO.h2}</h2></div>
          <div className="tiles3">
            {HO.items.map((s, i) => <article className="tile green glass" key={s.title} data-reveal style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}><h3>{s.title}</h3><p>{s.desc}</p></article>)}
          </div>
        </section>

        <Faq />

        <section className="s wrap" id={PR.anchorId}>
          <div className="slab glass" data-reveal>
            <h2 className="h2">{PR.h2}</h2><p className="lede">{PR.sub}</p>
            <div className="facts">
              <div className="fact hot"><div className="k">{PR.facts.price}</div><div className="v">{priceLine} {PR.facts.once}</div></div>
              {PR.facts.rest.map((f) => <div className="fact" key={f.k}><div className="k">{f.k}</div><div className="v">{f.v}</div></div>)}
            </div>
            {canBuy ? (
              <div className="buy"><a className="btn primary" href={buyHref}>{AXP.hero.cta.forPrice} {priceLine}{ARROW}</a></div>
            ) : (
              <>
                <div className="act-h">{isActive ? PR.action.headlineActive : PR.action.headlineInactive}</div>
                <div className="act-s">{PR.action.sub}</div>
                <HoloWaitlist courseSlug={product.slug} />
              </>
            )}
          </div>
        </section>

        <section className="s wrap" id="final">
          <div className="final" data-reveal>
            <h2 className="h2"><Grad h={FC.h2} span={FC.h2Gradient} /></h2><p className="lede">{FC.sub}</p>
            <a className="btn primary" href={ctaHref}>{ctaLabel}{ARROW}</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><svg width="420" height="420" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
        <div className="wrap frow">
          <span className="fcopy">{FO.copyright}</span>
          <nav className="links" aria-label={FO.linksAriaLabel}>
            {FO.links.map((l) => <a key={l.href} href={l.href} className={l.current ? "cur" : undefined} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
          </nav>
        </div>
        <p className="wrap legal">{FO.legal}</p>
      </footer>
    </div>
  );
}

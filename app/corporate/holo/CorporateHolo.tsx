"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CubeMark from "@/app/components/CubeMark";
import CorporateBrand from "../CorporateBrand";
import EnquiryForm from "../EnquiryForm";
import PolicyBuilder from "../PolicyBuilder";
import OfficeHero from "./OfficeHero";
import { AXC } from "./content";
import { countUp, powerWires, reveal, spy } from "./fx";
import "./corporate.css";

/* The Hologram Office /corporate page (owner's pick from the twenty-design
 * landing lab round two, 2026-11-21, concept k01). The homepage's Hologram
 * Deck language for firms: platinum ground, glass capsule nav with the real
 * Cleared Shield lockup, the headline accent drawn from points, the real
 * Copilot practice window as a glass pane over the desk-row photograph, the
 * shield powering three picture-window course cards along wires.
 *
 * Same copy and section order as the page it replaces; what stayed real:
 * HeroSim (the course's own Copilot simulator), PolicyBuilder (six questions,
 * the generated policy, PDF / email / copy), EnquiryForm (posting to
 * /api/corporate/enquiry), the checkoutLive variants of every CTA, and every
 * link. Everything lives under .kv1 so the stylesheet cannot leak. */

const ICONS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6L9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  shield: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  "list-with-magnifier": "M4 6h9M4 11h6M4 16h5 M16 10a4 4 0 100 8 4 4 0 000-8z M19 17l3 3",
  "shield-check": "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  "refresh-arrow": "M20 11a8 8 0 00-14.5-4.5L3 9 M3 4v5h5 M4 13a8 8 0 0014.5 4.5L21 15 M21 20v-5h-5",
  "card-with-redaction": "M3 5h18v14H3z M7 10h6",
} as const;

function Icon({ name, size = 16, sw = 2 }: { name: keyof typeof ICONS; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} />{name === "card-with-redaction" ? <rect x="7" y="13" width="10" height="2.5" fill="currentColor" stroke="none" /> : null}</svg>;
}
const Arrow = () => <Icon name="arrow" size={16} sw={2.2} />;
const Check = () => <Icon name="check" size={14} sw={2.4} />;

/* The Cleared Shield mark alone (the lockup's shield at any size), the source
 * that powers the course cards. */
function ShieldMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" style={{ display: "block", filter: "drop-shadow(0 0 6px rgba(90,140,255,0.5))" }}>
      <defs><linearGradient id="kvShieldEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6ff0ff" /><stop offset="48%" stopColor="#5a8cff" /><stop offset="100%" stopColor="#a35cff" /></linearGradient></defs>
      <path d="M36 6 L60 14 V32 C60 48 50 59 36 65 C22 59 12 48 12 32 V14 Z" fill="rgba(96,146,255,0.14)" stroke="url(#kvShieldEdge)" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M36 6 L60 14" stroke="#bfe8ff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <path d="M27 33 L34 41 L48 24" fill="none" stroke="#5f8dff" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Pill = ({ children }: { children: string }) => <span className="pill">{children}</span>;
const Grad = ({ parts }: { parts: { plain: string; gradient: string } }) => <>{parts.plain}<span className="acc">{parts.gradient}</span></>;

/* Internal routes go through next/link; anchors, mailto and external links are plain. */
function A({ href, className, children, external }: { href: string; className?: string; children: React.ReactNode; external?: boolean }) {
  if (external) return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
  if (href.startsWith("/")) return <Link href={href} className={className}>{children}</Link>;
  return <a href={href} className={className}>{children}</a>;
}

function Nav() {
  const N = AXC.nav;
  const [active, setActive] = useState("");
  useEffect(() => spy(N.sectionChips.map((c) => c.id), setActive), [N.sectionChips]);
  return (
    <header className="nav">
      <div className="capsule">
        <Link className="lockup" href={N.brand.homeHref} aria-label={`${N.brand.wordmark} ${N.brand.byline}`}><CorporateBrand /></Link>
        <span className="ntrust" aria-hidden="true">{AXC.proof.marks.map((m) => <span key={m.alt} className={`plate ${m.plate}`}><img src={m.src} alt="" /></span>)}</span>
        <nav className="chips" aria-label={N.subnavAriaLabel}>
          {N.sectionChips.map((c) => <a key={c.id} href={c.href} className={active === c.id ? "on" : undefined} aria-current={active === c.id ? "location" : undefined}>{c.label}</a>)}
        </nav>
        <a className="ctaPill" href={N.cta.href}>{N.cta.label}<Arrow /></a>
      </div>
    </header>
  );
}

/* FAQ: hairline rows. Open state is React state; the rows carry no reveal of
 * their own (the list does), so a re-render cannot hide one. */
function Faq() {
  const F = AXC.faq;
  const [open, setOpen] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>(".faq-a").forEach((a, i) => { a.style.maxHeight = i === open ? a.scrollHeight + "px" : "0px"; });
  }, [open]);
  return (
    <section className="s wrap" id={F.id}>
      <div className="shead" data-reveal><Pill>{F.eyebrow}</Pill><h2 className="h2"><Grad parts={F.headlineParts} /></h2></div>
      <div className="faq" ref={listRef} data-reveal>
        {F.items.map((it, i) => (
          <div className={`faq-item ${i === open ? "open" : ""}`} key={it.q}>
            <button type="button" aria-expanded={i === open} onClick={() => setOpen(i === open ? -1 : i)}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Icon name="plus" size={14} sw={2.2} /></span>
            </button>
            <div className="faq-a"><p>{it.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

const WINPOS = ["12% 45%", "50% 40%", "88% 45%"];

export default function CorporateHolo({ checkoutLive = false }: { checkoutLive?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const P = AXC.proof, CO = AXC.courses, AT = AXC.attacks, HW = AXC.how, IN = AXC.included, PR = AXC.pricing, PO = AXC.policy, EN = AXC.enquiry, FO = AXC.footer;

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const stops: Array<() => void> = [reveal(root)];
    const counted = new WeakSet<Element>();
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting && !counted.has(en.target)) { counted.add(en.target); const el = en.target as HTMLElement; countUp(el, el.dataset.count || "", 700); io.unobserve(el); } }), { threshold: 0.5 });
    root.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
    stops.push(() => io.disconnect());
    if (powerRef.current) stops.push(powerWires(powerRef.current, CO.list.map((c) => c.accent)));
    return () => stops.forEach((s) => s());
  }, [CO.list]);

  const courseCta = checkoutLive ? CO.footCta.whenCheckoutLive : CO.footCta;

  return (
    <div className="kv1" ref={rootRef}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /><div className="pool b" /></div>
      <Nav />
      <main>
        <OfficeHero checkoutLive={checkoutLive} />

        {/* proof band */}
        <section className="s wrap" id="accreditations" aria-label={P.ariaLabel}>
          <div className="band glass" data-reveal>
            <Pill>{P.eyebrow}</Pill>
            <div className="marks">
              {P.marks.map((m, i) => (
                <div className="mark" key={m.alt} data-reveal style={{ "--d": `${0.1 + i * 0.08}s` } as React.CSSProperties}>
                  <span className={`plate ${m.plate}`}><img src={m.src} alt={m.alt} style={{ width: m.plate === "dark" ? 120 : 100 }} loading="lazy" decoding="async" /></span>
                  <h3>{m.name}</h3><p>{m.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* courses: three picture-window cards powered by the Cleared Shield */}
        <section className="s wrap" id={CO.id}>
          <div className="shead" data-reveal><Pill>{CO.eyebrow}</Pill><h2 className="h2"><Grad parts={CO.headlineParts} /></h2><p className="lede2">{CO.lede}</p></div>
          <div className="power" ref={powerRef}>
            <span className="src" aria-hidden="true"><ShieldMark size={44} /></span>
            <svg className="wires" aria-hidden="true" />
            <div className="ccards">
              {CO.list.map((c, i) => (
                <article className="ccard glass" key={c.id} data-reveal style={{ "--a": c.accent, "--d": `${i * 0.12}s` } as React.CSSProperties}>
                  <span className="pdot" />
                  <div className="cwin"><img src={HW.photo.webp} alt="" style={{ objectPosition: WINPOS[i] }} loading="lazy" decoding="async" /><span className="tag">{c.tag}</span></div>
                  <div className="cb">
                    <h3>{c.name}</h3>
                    <div className="meta"><span>{CO.metaLabels.who}</span><div>{c.who}</div><span>{CO.metaLabels.time}</span><div>{c.time}</div></div>
                    <p className="intro">{c.intro}</p>
                    <ol>{c.modules.map((m) => <li key={m}><span>{m}</span></li>)}</ol>
                    {"release" in c && c.release ? <p className="rel">{c.release}</p> : null}
                    <p className="out">{c.outcome}</p>
                    <div className="foot"><span className="inc">{CO.footPrice}</span><A href={courseCta.href}>{courseCta.label}<Arrow /></A></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* attacks */}
        <section className="s wrap" id={AT.id}>
          <div className="shead" data-reveal><Pill>{AT.eyebrow}</Pill><h2 className="h2"><Grad parts={AT.headlineParts} /></h2><p className="lede2">{AT.lede}</p></div>
          <div className="dossiers">
            {AT.incidents.map((d, i) => (
              <article className="dossier glass" key={d.when} data-reveal style={{ "--a": d.accent, "--d": `${i * 0.1}s` } as React.CSSProperties}>
                <span className="tag">{d.tag}</span><h3>{d.when}</h3><p>{d.body}</p>
                <div className="les">{d.lesson}</div>
                <div className="src"><span className="lab">{AT.sourceLabel}</span>{d.sources.map((s) => <A key={s.href} href={s.href} external>{s.label}</A>)}</div>
              </article>
            ))}
          </div>
          <div className="keep glass" data-reveal><i /><p><b>{AT.keepUp.bold}</b>{AT.keepUp.text.slice(AT.keepUp.bold.length)}</p></div>
        </section>

        {/* how it runs */}
        <section className="s wrap" id={HW.id}>
          <div className="shead" data-reveal><Pill>{HW.eyebrow}</Pill><h2 className="h2"><Grad parts={HW.headlineParts} /></h2></div>
          <figure className="aisle" data-reveal role="img" aria-label={HW.photo.ariaLabel}>
            <picture><source srcSet={HW.photo.webp} type="image/webp" /><img src={HW.photo.jpg} alt="" width={HW.photo.width} height={HW.photo.height} loading="lazy" decoding="async" /></picture>
            <div className="over"><p>{HW.lede}</p></div>
          </figure>
          <div className="steps">
            {HW.steps.map((s, i) => (
              <article className="step glass" key={s.n} data-reveal style={{ "--c": s.colour, "--i": i, "--d": `${i * 0.1}s` } as React.CSSProperties}>
                <span className="node">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* included */}
        <section className="s wrap" id={IN.id}>
          <div className="shead" data-reveal><Pill>{IN.eyebrow}</Pill><h2 className="h2"><Grad parts={IN.headlineParts} /></h2><p className="lede2">{IN.lede}</p></div>
          <div className="pillars">
            {IN.pillars.map((p, i) => (
              <article className="pillar glass" key={p.title} data-reveal style={{ "--c": p.accent, "--d": `${i * 0.1}s` } as React.CSSProperties}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div className="ic"><Icon name={p.icon} size={22} sw={1.8} /></div>
                <h3>{p.title}</h3>
                <ul>{p.points.map((pt) => <li key={pt}><Check /><span>{pt}</span></li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        {/* pricing */}
        <section className="s wrap" id={PR.id}>
          <div className="shead" data-reveal><Pill>{PR.eyebrow}</Pill><h2 className="h2"><Grad parts={PR.headlineParts} /></h2><p className="lede2">{PR.lede}</p></div>
          <div className="packs">
            {PR.packs.map((k, i) => (
              <article className="pack glass" key={k.name} data-reveal style={{ "--a": k.accent, "--d": `${i * 0.12}s` } as React.CSSProperties}>
                <span className="glow" />
                <div className="nm">{k.name}</div><div className="seats">{k.seats}</div>
                <div className="price" data-count={k.price}>{k.price}</div>
                <div className="unit">{PR.unit}</div>
                <ul>{PR.included.map((n) => <li key={n}><Check />{n}</li>)}</ul>
                <p className="note">{k.note}</p>
                {checkoutLive ? <A className="btn primary" href={k.buyHref}>{PR.packCta.whenCheckoutLive.label}<Arrow /></A> : <A className="btn primary" href={PR.packCta.href}>{PR.packCta.label}<Arrow /></A>}
              </article>
            ))}
          </div>
          <div className="plines" data-reveal>{PR.lines.map((l) => <p key={l.text}>{l.text}<A href={l.link.href}>{l.link.label}<Arrow /></A></p>)}</div>
        </section>

        {/* policy: the intro with the two duties, then the real six-question builder on glass */}
        <section className="s wrap" id={PO.id}>
          <div className="shead polHead" data-reveal>
            <Pill>{PO.eyebrow}</Pill><h2 className="h2"><Grad parts={PO.headlineParts} /></h2><p className="lede2">{PO.lede}</p>
            <div className="reg"><p>{PO.regLine.text}</p><div className="links">{PO.regLine.links.map((l) => <A key={l.href} href={l.href}>{l.label}<Arrow /></A>)}</div></div>
          </div>
          <div className="polBuild" data-reveal style={{ "--d": ".1s" } as React.CSSProperties}><PolicyBuilder /></div>
        </section>

        <Faq />

        {/* enquiry */}
        <section className="s wrap" id={EN.id}>
          <div className="enqGrid">
            <div className="enq" data-reveal>
              <Pill>{EN.eyebrow}</Pill><h2 className="h2"><Grad parts={EN.headlineParts} /></h2><p className="lede2">{EN.lede}</p>
              <p className="line">{EN.emailLine.text}<a href={EN.emailLine.link.href}>{EN.emailLine.link.label}</a></p>
              <p className="line">{EN.dpoLine.before}<Link href={EN.dpoLine.link.href}>{EN.dpoLine.link.label}</Link>{EN.dpoLine.after}</p>
            </div>
            <div className="form glass" data-reveal style={{ "--d": ".12s" } as React.CSSProperties}><EnquiryForm /></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><CubeMark size={560} color="#0a7085" strokeWidth={0.6} /></div>
        <div className="wrap">
          <div className="fgridf">
            <div><Link className="brand" href="/"><CubeMark size={22} color="#5f8dff" strokeWidth={1.8} code />{FO.brand}</Link><p className="tag">{FO.tagline}</p></div>
            {FO.columns.map((c) => <div key={c.label}><h4>{c.label}</h4><ul>{c.links.map((l) => <li key={l.name}><A href={l.href}>{l.name}</A></li>)}</ul></div>)}
          </div>
          <div className="legal"><a href={`mailto:${FO.email}`}>{FO.email}</a><span>{FO.legal}</span></div>
        </div>
      </footer>
    </div>
  );
}

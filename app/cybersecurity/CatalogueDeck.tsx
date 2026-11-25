"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CourseLockup, { type LockupId } from "@/app/components/CourseLockup";
import { AX } from "@/app/components/home-holo/content";
import { HoloFooter, HoloNav } from "@/app/components/home-holo/HoloChrome";
import { ICONS } from "@/app/components/home-holo/fx";
import CodeDeck from "./CodeDeck";
import "./catalogue.css";

/* /cybersecurity in the Hologram house (landing lab round 6, cat v1 "Code
 * Deck", owner 2026-11-23). Light homepage style; the hero carries the 3D
 * live-typing code panes. Below it: the age rail over the four track cards
 * (real catalogue rows from page.tsx), the Workplace Skills row (the
 * homepage's own `workplace` block, so it always matches the homepage),
 * accreditations, four FAQs and the closing line, all homepage copy.
 * Everything is scoped under .cs6; reveal and pause state are data-* attributes. */

export type CatalogueTrack = {
  slug: string;
  name: string;
  ageRange: string;
  status: "ACTIVE" | "COMING_SOON";
  href: string;
  blurb: string;
  kicker?: string;
  specs?: string[];
};

/* Per-track look: the lockup, the browse-card art, the accent (the lockups'
 * own paper-safe colours) and the homepage track that carries the verb. */
const LOOK: Record<string, { lockup: LockupId; art: string; pos: string; accent: string; home: string }> = {
  "cyber-heroes": { lockup: "heroes", art: "/characters/cyberheroes-card.jpg", pos: "70% 38%", accent: "#8a5400", home: "Heroes" },
  cyberexplorers: { lockup: "explorers", art: "/explorers/scenes/explorers-card-v4.jpg", pos: "68% 40%", accent: "#0a7085", home: "Explorers" },
  cyberstart: { lockup: "ops", art: "/operators/cyberops-card-v2.jpg", pos: "55% 40%", accent: "#5744c9", home: "Ops" },
  "cyberstart-pro": { lockup: "pro", art: "/characters/cyberpro-card.jpg", pos: "62% 42%", accent: "#a63a08", home: "Pro" },
};

/* The Workplace row: art and accents per card; copy comes from AX.streams.workplace. */
const WORK_LOOK: Record<string, { art: string; pos: string; accent: string; icon: keyof typeof ICONS }> = {
  Ready: { art: "/desk-ready/card.webp", pos: "50% 34%", accent: "#1d4ed8", icon: "monitor" },
  Fluent: { art: "/corporate/cards/ai-fluent.webp", pos: "50% 30%", accent: "#5744c9", icon: "bolt" },
  Cleared: { art: "/corporate/cards/ai-cleared.webp", pos: "50% 30%", accent: "#0a7085", icon: "shield" },
  Awareness: { art: "/corporate/cards/cyber-awareness.webp", pos: "50% 30%", accent: "#c0157f", icon: "search" },
};

const FAQ_PICK = [0, 1, 2, 3];

function Icon({ name, size = 16, sw = 2.2 }: { name: keyof typeof ICONS; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

export default function CatalogueDeck({ tracks }: { tracks: CatalogueTrack[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(0);

  /* reveal: data-in attributes, never classes. Threshold 0 plus a first-frame
   * pass, so a tall block (the stacked rail on a phone) shows as soon as its
   * top is on the first screen. */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const show = (el: Element) => el.setAttribute("data-in", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { els.forEach(show); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }), { threshold: 0, rootMargin: "0px 0px -4% 0px" });
    els.forEach((el) => io.observe(el));
    const raf = requestAnimationFrame(() => els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight * 0.96) show(el); }));
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const homeTracks = AX.streams.cyber.tracks;
  const W = AX.streams.workplace;
  const workCards = [W.live, ...W.firm];
  const A = AX.accreditations, F = AX.faq, S = AX.stats.closing;

  return (
    <div className="cs6" ref={rootRef} data-paused={paused ? "" : undefined}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /></div>
      <HoloNav streamsHref="#tracks" streamsCurrent />
      <main>
        <section className="hero" aria-labelledby="cs6-h1">
          <div className="bgwrap" aria-hidden="true"><CodeDeck paused={paused} /></div>
          <div className="wrap">
            <div className="copy">
              <Link className="back" href="/"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>Back to home</Link>
              <div className="eyebrow"><i />{"// Cybersecurity · 4 tracks · Ages 6 to 18+"}</div>
              <h1 className="h" id="cs6-h1">Cybersecurity for <span className="acc">every age.</span></h1>
              <p className="sub">From spotting scams at age 6 to portfolio-grade pen-testing at 18+. Four tracks, one subject, one continuous arc. Start your child&rsquo;s journey, or your own.</p>
              <div className="ctas">
                <a className="btn" href="#tracks">Choose by age<Icon name="chevron" size={14} /></a>
                <Link className="btn ghost" href="/login">Already enrolled? Log in<Icon name="arrow" /></Link>
              </div>
              {/* Aligned with the NCSC (alignment, not endorsement). The crest is white artwork, so its plate stays dark. */}
              <span className="ncsc">Aligned with UK&rsquo;s National Cyber Security Centre<i /><img src="/logos/ncsc.svg" alt="National Cyber Security Centre" /></span>
              <div>
                <button className="motion" type="button" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={() => setPaused((p) => !p)}>
                  <span className="ring">
                    <svg className="pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                    <svg className="play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
                  </span>
                  <span className="lbl" aria-hidden="true">{paused ? "Play motion" : "Pause motion"}</span>
                </button>
              </div>
            </div>
            <div aria-hidden="true" />
          </div>
        </section>

        <section className="s wrap tight" id="tracks" aria-label="Cybersecurity tracks by age">
          <div className="rhead" data-reveal><h2 className="t">One subject, every stage.</h2><span className="kicker"><i />{"// CHOOSE BY AGE · 4 TRACKS · 6 TO 18+"}</span></div>
          <div className="rail" data-reveal>
            {tracks.map((t, i) => {
              const look = LOOK[t.slug];
              const home = homeTracks.find((h) => h.label === look?.home);
              const accent = look?.accent ?? "#0a7085";
              const ages = `Ages ${t.ageRange}`.toUpperCase();
              const live = t.status === "ACTIVE";
              return (
                <div className="stop" key={t.slug} style={{ "--a": accent, "--i": i } as CSSVars}>
                  <div className="node" aria-hidden="true"><i /><b>{ages}</b></div>
                  <article className="tcard" style={{ "--a": accent, "--i": i, "--pos": look?.pos ?? "50% 40%" } as CSSVars}>
                    <div className="art">
                      {look && <img src={look.art} alt="" loading={i < 2 ? "eager" : "lazy"} />}
                      <span className={`live ${live ? "" : "soon"}`}>{live ? "Live now" : "Coming soon"}</span>
                      <h3 className="plate">{look ? <CourseLockup id={look.lockup} tone="sand" size={0.92} /> : <span className="lk"><span className="w">{t.name}</span></span>}</h3>
                    </div>
                    <div className="body">
                      <div className="chips"><span className="agePill">{ages}</span>{home && <span className="verb"><i />{home.verb}</span>}</div>
                      {t.kicker && <div className="kick">{t.kicker}</div>}
                      <p className="blurb">{t.blurb}</p>
                      {t.specs && <div className="specs">{t.specs.map((s) => <span key={s}>{s}</span>)}</div>}
                      <Link className="cta2" href={t.href} aria-label={`View course: ${t.name}`}>View course<Icon name="arrow" /></Link>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>

        <section className="s wrap" id="work" aria-label="Workplace Skills">
          <div className="shead" data-reveal>
            <div><span className="kicker"><i />{"// WORKPLACE SKILLS · ADULTS · 4 TRACKS LIVE"}</span><h2 className="t">{W.name}</h2><p className="lead">{W.blurb}</p></div>
            <span className="badge2">{W.badge}</span>
          </div>
          <div className="panes" data-reveal>
            {workCards.map((c, i) => {
              const look = WORK_LOOK[c.label];
              return (
                <article className="tcard" key={c.label} style={{ "--a": look.accent, "--i": i, "--pos": look.pos } as CSSVars}>
                  <div className="art">
                    <img src={look.art} alt="" loading="lazy" />
                    <span className="live">{c.status}</span>
                    <h3 className="plate"><span className="lk"><span className="ic"><Icon name={look.icon} size={16} sw={2} /></span><span className="w">{c.family} <span>{c.label}</span></span></span></h3>
                  </div>
                  <div className="body">
                    <div className="chips"><span className="agePill">{c.ages}</span><span className="verb"><i />{c.verb}</span></div>
                    <ul>{c.items.map((it) => <li key={it[0] + it[1]}><span>{it[0]}</span>{it[1]}</li>)}</ul>
                    <div className="more">{W.more}</div>
                    <Link className="cta2" href={c.href} aria-label={`${W.cta}: ${c.family} ${c.label}`}>{W.cta}<Icon name="arrow" /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="s wrap" id="accreditations" aria-label="Accreditations">
          <div data-reveal><span className="kicker"><i />{A.kicker}</span></div>
          <div className="acc-grid">
            {A.items.map((it, i) => (
              <article className="glass acc-card" key={it.title} data-reveal style={{ "--d": `${i * 0.08}s` } as CSSVars}>
                <span className={`plate ${"dark" in it && it.dark ? "dark" : ""}`}><img src={it.logo} alt="" /></span>
                <div><h3>{it.title}</h3><p>{it.desc}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="s wrap" id="faq" aria-label="Questions">
          <div className="faq2">
            <div data-reveal><span className="kicker"><i />{F.kicker}</span><h2 className="t">{F.title}</h2><p className="lead">{F.sub}</p></div>
            <div className="glass faq2-panel" data-reveal style={{ "--d": ".1s" } as CSSVars}>
              {FAQ_PICK.map((k, i) => {
                const it = F.items[k], on = i === open;
                return (
                  <div className="faq-item" key={it.q} data-open={on ? "" : undefined}>
                    <button type="button" aria-expanded={on} aria-controls={`cs6-faq-${i}`} id={`cs6-faqb-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                      <span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Icon name="plus" size={14} /></span>
                    </button>
                    <div className="faq-a" id={`cs6-faq-${i}`} role="region" aria-labelledby={`cs6-faqb-${i}`}><div><p>{it.a}</p></div></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass close" data-reveal>
            <p>{S.lead}<b>{S.brand}</b>{S.tail}</p>
            <div className="ctas">
              <a className="btn" href="#tracks">Choose by age<Icon name="chevron" size={14} /></a>
              <Link className="btn ghost" href="/schools">For Schools<Icon name="arrow" /></Link>
            </div>
          </div>
        </section>
      </main>
      <HoloFooter />
    </div>
  );
}

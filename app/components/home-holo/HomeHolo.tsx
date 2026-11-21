"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandCube from "@/app/components/BrandCube";
import CourseLockup, { type LockupId } from "@/app/components/CourseLockup";
import HoloHero from "./HoloHero";
import { AX } from "./content";
import { ICONS, countUp, reveal, scramble, sparkPath } from "./fx";
import "./home.css";

/* The Hologram Deck homepage (owner's pick from the ten-design landing lab,
 * 2026-11-21, with their notes applied). Same copy and section order as the
 * page it replaces; only the design is new. Everything lives under .hv4 so
 * the stylesheet cannot leak into other pages. */

function Icon({ name, size = 20, sw = 1.8 }: { name: keyof typeof ICONS; size?: number; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

function Spark({ pts, color }: { pts: ReadonlyArray<number>; color: string }) {
  const { d, cx, cy } = sparkPath(pts, 140, 40);
  return <svg viewBox="0 0 140 40" width="140" height="40" fill="none" aria-hidden="true"><path d={d} stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="spark-path" /><circle cx={cx} cy={cy} r="3" fill={color} /></svg>;
}

type Track = { family: string; label: string; accent: string; verb: string; ages: string; items: ReadonlyArray<readonly [string, string]>; n?: string; status?: string };

/* The course artwork and branded lockups, the same ones the /cybersecurity
 * cards use (owner: "these cards need their logos in there, and the
 * background art like the course cards; we should still see the modules"). */
const TRACK_ART: Record<string, { art: string; lockup?: LockupId; pos?: string }> = {
  Heroes: { art: "/characters/cyberheroes-card.jpg", lockup: "heroes", pos: "70% 38%" },
  Explorers: { art: "/explorers/scenes/explorers-card-v4.jpg", lockup: "explorers", pos: "68% 40%" },
  Ops: { art: "/operators/cyberops-card-v2.jpg", lockup: "ops", pos: "55% 40%" },
  Pro: { art: "/characters/cyberpro-card.jpg", lockup: "pro", pos: "62% 42%" },
  /* purpose-made for this card: OpenArt (Nano Banana 2), 2026-11-21, saved in Personal Project */
  Ready: { art: "/desk-ready/card.webp", pos: "50% 34%" },
};

function TrackCard({ t, i, icon, more }: { t: Track; i: number; icon: keyof typeof ICONS; more: string }) {
  const a = TRACK_ART[t.label];
  /* Structure (owner: "the images need to be structured better"): a fixed
   * picture window at the top with the lockup on a plate at its foot, then a
   * clean body with the chips and the modules. Nothing overlaps the picture. */
  return (
    <article className={`pane-card ${a ? "art" : ""}`} style={{ "--a": t.accent, "--i": i } as React.CSSProperties}>
      <span className="pdot" />
      {a && (
        <div className="artWin">
          <div className="artBg" aria-hidden="true" style={{ backgroundImage: `url(${a.art})`, backgroundPosition: a.pos || "center" }} />
          <div className="artFade" aria-hidden="true" />
          {t.status ? <span className="live">{t.status}</span> : <span className="n">{t.n}</span>}
          <div className="lockupPlate">
            {a.lockup ? <CourseLockup id={a.lockup} tone="night" size={0.86} /> : <><span className="ic"><Icon name={icon} size={18} sw={1.9} /></span><span className="nm">{t.family} <span>{t.label}</span></span></>}
          </div>
        </div>
      )}
      <div className="inner">
        {!a && <div className="top"><span className="ic"><Icon name={icon} size={18} sw={1.9} /></span><span className="nm">{t.family} <span>{t.label}</span></span>{t.status ? <span className="live">{t.status}</span> : <span className="n">{t.n}</span>}</div>}
        <div className="chips"><span className="agePill">{t.ages}</span><span className="verb"><i />{t.verb}</span></div>
        <div className="syll">
          <ul>{t.items.map((it) => <li key={it[0] + it[1]}><span>{it[0]}</span>{it[1]}</li>)}</ul>
          <div className="more">{more}</div>
        </div>
      </div>
    </article>
  );
}

function LockedCard({ accent, n, i, label, foot }: { accent: string; n: string; i: number; label: string; foot: string }) {
  return (
    <article className="pane-card locked" style={{ "--a": accent, "--i": i } as React.CSSProperties}>
      <span className="pdot" />
      <div className="inner">
        <div className="top"><span className="ic"><Icon name="lock" size={18} sw={1.9} /></span><span className="nm" data-scramble="10" /><span className="n">{n}</span></div>
        <div className="chips"><span className="verb"><i />{label}</span></div>
        <div className="redact tall"><i style={{ width: "78%" }} /><i style={{ width: "54%" }} /><i style={{ width: "66%" }} /><i style={{ width: "42%" }} /><i style={{ width: "72%" }} /><i style={{ width: "48%" }} /></div>
        <div className="cipher"><div data-scramble="18" /><div data-scramble="18" /><div data-scramble="18" /></div>
        <div className="more">{foot}</div>
      </div>
    </article>
  );
}

const Brackets = () => <><span className="brk tl" /><span className="brk tr" /><span className="brk bl" /><span className="brk br" /></>;

function Nav() {
  const segRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const lit = (a: HTMLAnchorElement) => { const g = glowRef.current, s = segRef.current; if (!g || !s) return; g.style.left = a.offsetLeft + "px"; g.style.width = a.offsetWidth + "px"; s.classList.add("lit"); };
  return (
    <header className="nav">
      <div className="capsule">
        <Link className="ax-brand" href="/" aria-label="AlgorithmX home"><BrandCube size={24} /><span className="lv2-wordmark"><span className="lv2-wordmark-main">ALGORITHM</span><span className="lv2-wordmark-x">X</span></span></Link>
        <div className="trust">{AX.nav.trust.map((t) => <span className="mark" key={t.word} title={t.name}><span className={`plate ${"dark" in t && t.dark ? "dark" : ""}`}><img src={t.logo} alt={t.name} /></span><span className="word">{t.word}</span></span>)}</div>
        <nav className="seg" ref={segRef} aria-label="Site" onPointerLeave={() => segRef.current?.classList.remove("lit")}>
          <span className="glow" ref={glowRef} />
          {AX.nav.tabs.map((t) => <a key={t.label} href={t.href} onPointerEnter={(e) => lit(e.currentTarget)} onFocus={(e) => lit(e.currentTarget)}>{t.label}</a>)}
        </nav>
      </div>
    </header>
  );
}

/* FAQ: a two-column spread, heading on the left, questions in a glass panel on
 * the right. Open state is React state only; the items carry no data-reveal
 * (a re-render used to wipe the imperative .in class and the item vanished). */
function Faq() {
  const [open, setOpen] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>(".faq-a").forEach((a, i) => { a.style.maxHeight = i === open ? a.scrollHeight + "px" : "0px"; });
  }, [open]);
  const F = AX.faq;
  return (
    <section className="s wrap" id="faq">
      <div className="faq2">
        <div className="faq2-head" data-reveal><span className="kicker"><i />{F.kicker}</span><h2 className="t">{F.title}</h2><p className="lead">{F.sub}</p></div>
        <div className="glass faq2-panel" data-reveal style={{ "--d": ".1s" } as React.CSSProperties}>
          <div className="faq" ref={listRef}>
            {F.items.map((it, i) => (
              <div className={`faq-item ${i === open ? "open" : ""}`} key={it.q}>
                <button aria-expanded={i === open} onClick={() => setOpen(i === open ? -1 : i)}><span className="n">{String(i + 1).padStart(2, "0")}</span><span className="q">{it.q}</span><span className="pm"><Icon name="plus" size={14} sw={2.2} /></span></button>
                <div className="faq-a"><p>{it.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeHolo() {
  const rootRef = useRef<HTMLDivElement>(null);

  /* reveal, scramble, count-up and the power wires: all imperative, all scoped to this root */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const stops: Array<() => void> = [];
    stops.push(reveal(root));
    root.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => stops.push(scramble(el, Number(el.dataset.scramble), 110)));
    const counted = new WeakSet<Element>();
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting && !counted.has(en.target)) { counted.add(en.target); countUp(en.target as HTMLElement, (en.target as HTMLElement).dataset.count || "", 1400); io.unobserve(en.target); } }), { threshold: 0.5 });
    root.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
    stops.push(() => io.disconnect());
    root.querySelectorAll<HTMLElement>(".panesWrap").forEach((wrap) => {
      const svg = wrap.querySelector<SVGSVGElement>(".wires"), cards = Array.from(wrap.querySelectorAll<HTMLElement>(".pane-card"));
      if (!svg) return;
      const draw = () => {
        const w = wrap.clientWidth, h = wrap.clientHeight; if (!w) return;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h)); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const sx = w / 2, sy = 52;
        const pos = (el: HTMLElement) => { let x = 0, y = 0; for (let n: HTMLElement | null = el; n && n !== wrap; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; } return [x, y]; };
        svg.innerHTML = cards.map((c, i) => { const [cx, cy] = pos(c); const ex = cx + c.offsetWidth / 2, ey = cy; const d = `M${sx} ${sy} L${sx} ${sy + 12} C${sx} ${sy + (ey - sy) * 0.72}, ${ex} ${ey - (ey - sy) * 0.55}, ${ex} ${ey}`; return `<path class="wire" d="${d}" pathLength="100"/><path class="pulse ${c.classList.contains("locked") ? "dim" : ""}" d="${d}" pathLength="100" style="--i:${i}"/>`; }).join("");
      };
      const ro = new ResizeObserver(draw); ro.observe(wrap); draw();
      stops.push(() => ro.disconnect());
    });
    return () => stops.forEach((s) => s());
  }, []);

  const A = AX.accreditations, S = AX.stats, ST = AX.streams, C = ST.cyber, W = ST.workplace, R = ST.roadmap, T = AX.toolkit, Fo = AX.footer;
  const icons: Array<keyof typeof ICONS> = ["bolt", "search", "target", "terminal"];
  /* colour logos (owner: "put colours on it"); Apple and Unity ship as white marks, so they go to ink */
  const INK = new Set(["Apple", "Unity"]);
  const logos = T.logos.map((l) => <span className="logo" key={l.name}><img src={l.src} alt={l.name} className={INK.has(l.name) ? "ink" : ""} /><span>{l.name.toUpperCase()}</span></span>);

  return (
    <div className="hv4" ref={rootRef}>
      <div className="atmo" aria-hidden="true"><div className="pool c" /><div className="pool v" /><div className="floor" /></div>
      <Nav />
      <main>
        <HoloHero />

        <section className="s wrap" id="accreditations">
          <div data-reveal><span className="kicker"><i />{A.kicker}</span></div>
          <div className="acc-grid">{A.items.map((it, i) => <article className="glass acc-card" key={it.title} data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}><span className={`plate ${"dark" in it && it.dark ? "dark" : ""}`}><img src={it.logo} alt="" /></span><h3>{it.title}</h3><p>{it.desc}</p></article>)}</div>
        </section>

        <section className="s wrap" id="the-state-of-play">
          <div data-reveal style={{ textAlign: "center" }}><span className="kicker"><i />{S.kicker}</span></div>
          <div className="stats-grid">{S.items.map((s, i) => <article className="glass stat" key={s.value} data-reveal style={{ "--d": `${i * 0.12}s`, "--c": s.accent } as React.CSSProperties}><div className="dots"><i /><i /><i /><i /></div><div className="v" data-count={s.value}>{s.value}</div><div className="l">{s.label}</div><div className="mid"><Spark pts={s.spark} color={s.accent} /><div className="chip"><b>{s.chip[0]}</b>{s.chip[1]}</div></div><div className="src">{s.source}</div></article>)}</div>
          <p className="closing" data-reveal>{S.closing.lead}<b>{S.closing.brand}</b>{S.closing.tail}</p>
        </section>

        <section className="s wrap" id="subjects">
          <div data-reveal><span className="kicker"><i />{ST.kicker}</span><h2 className="t">{ST.title}</h2><p className="lead">{ST.intro}</p></div>
          <article className="dossier" data-reveal id="cyberPanel"><Brackets />
            <div className="hud"><span>{C.tag}</span><span>{C.meta}</span></div>
            <div className="head"><div className="hex"><Icon name="shield" size={34} sw={1.6} /></div><div><h3>{C.name}</h3><div className="ages">{C.ages}</div><p className="blurb">{C.blurb}</p></div><span className="badge2"><span className="plate"><img src={C.badgeLogo} alt="" /></span>{C.badge}</span></div>
            <div className="panesWrap"><span className="srcCube"><BrandCube size={28} /></span><svg className="wires" aria-hidden="true" /><div className="panes">{C.tracks.map((t, i) => <TrackCard key={t.label} t={t} i={i} icon={icons[i]} more={C.more} />)}</div></div>
            <div className="ctaRow"><a className="btn2" href={C.href}>{C.cta} <Icon name="arrow" size={18} sw={2.2} /></a></div>
          </article>
          <article className="dossier blue" data-reveal id="workPanel"><Brackets />
            <div className="hud"><span>{W.tag}</span><span>{W.meta}</span></div>
            <div className="head"><div className="hex"><Icon name="monitor" size={34} sw={1.6} /></div><div><h3>{W.name}</h3><div className="ages">{W.ages}</div><p className="blurb">{W.blurb}</p></div><span className="badge2">{W.badge}</span></div>
            <div className="panesWrap"><span className="srcCube"><BrandCube size={28} /></span><svg className="wires" aria-hidden="true" /><div className="panes"><TrackCard t={W.live} i={0} icon="monitor" more={W.more} />{W.locked.map((l, i) => <LockedCard key={l.n} accent={l.accent} n={l.n} i={i + 1} label={W.lockedLabel} foot={W.lockedFoot} />)}</div></div>
            <div className="ctaRow"><a className="btn2" href={W.href}>{W.cta} <Icon name="arrow" size={18} sw={2.2} /></a></div>
          </article>
          <div className="road">
            <div data-reveal><span className="kicker"><i />{R.kicker}</span><h2 className="t"><span className="acc">{R.titleAccent}</span>{R.titleTail}</h2><p className="lead">{R.sub}</p></div>
            <div className="vaults">{R.cards.map((c, i) => (
              <article className="vault" key={c.accent} data-reveal style={{ "--a": c.accent, "--d": `${i * 0.09}s` } as React.CSSProperties}>
                <span className="vbrk tl" /><span className="vbrk tr" /><span className="vbrk bl" /><span className="vbrk br" />
                <div className="vscan" aria-hidden="true" />
                <div className="vtop"><span className="vlock"><Icon name="lock" size={18} sw={1.9} /></span><span className="vnum">{String(i + 3).padStart(2, "0")}</span></div>
                <div className="vtitle" data-scramble="12" />
                <div className="redact"><i style={{ width: "82%" }} /><i style={{ width: "58%" }} /><i style={{ width: "70%" }} /></div>
                <div className="vcipher" data-scramble="24" />
                <div className="vfoot"><span className="lab">{R.label}</span><span className="ln">{R.line}</span></div>
                <div className="cl">{R.classified}</div>
              </article>
            ))}</div>
          </div>
        </section>

        <section className="s wrap" id="testimonials">
          <div data-reveal style={{ textAlign: "center" }}><span className="kicker"><i />{T.kicker}</span><h2 className="t">{T.title}</h2></div>
          <div className="tool-sub" data-reveal>{T.sub}</div>
          <div className="marq" data-reveal><div className="track">{logos}{logos.map((l, i) => <span className="logo" key={`dup-${i}`} aria-hidden="true">{l.props.children}</span>)}</div></div>
        </section>

        <Faq />
      </main>

      <footer>
        <div className="bigcube" aria-hidden="true"><svg width="520" height="520" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
        <div className="wrap">
          <div className="grid">
            <div><Link className="ax-brand" href="/" aria-label="AlgorithmX"><BrandCube size={24} /><span className="lv2-wordmark"><span className="lv2-wordmark-main">ALGORITHM</span><span className="lv2-wordmark-x">X</span></span></Link><p className="tag">{Fo.tagline}</p></div>
            {Fo.cols.map((c) => <div key={c.title}><h4>{c.title}</h4><ul>{c.links.map((l) => <li key={l[0]}><a href={l[1]}>{l[0]}</a></li>)}</ul>{"note" in c && c.note ? <div className="note">{c.note}</div> : null}</div>)}
          </div>
          <div className="legal"><a href={`mailto:${Fo.email}`}>{Fo.email}</a><span>{Fo.legal}</span></div>
        </div>
      </footer>
    </div>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import BrandCube from "@/app/components/BrandCube";
import { AX } from "./content";

/* The Hologram house chrome: the glass capsule nav and the mid-tone footer.
 * Shared by the homepage (.hv4) and the /cybersecurity catalogue (.cs6); each
 * page styles the same class names inside its own scoped stylesheet.
 *
 * `streamsHref` re-points the STREAMS tab for a page that carries the streams
 * itself (the catalogue sends it to its own age rail and marks it current). */
export function HoloNav({ streamsHref, streamsCurrent = false }: { streamsHref?: string; streamsCurrent?: boolean }) {
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
          {AX.nav.tabs.map((t) => {
            const streams = t.label === "STREAMS";
            return <a key={t.label} href={streams && streamsHref ? streamsHref : t.href} aria-current={streams && streamsCurrent ? "page" : undefined} onPointerEnter={(e) => lit(e.currentTarget)} onFocus={(e) => lit(e.currentTarget)}>{t.label}</a>;
          })}
        </nav>
      </div>
    </header>
  );
}

/* `extra` adds one more link column after the house columns (the reading
 * room's TRUST column); `current` marks the link for the page you are on.
 * Without it the footer is exactly the homepage's. */
export function HoloFooter({ extra }: { extra?: { title: string; links: [string, string][]; current?: string } } = {}) {
  const Fo = AX.footer;
  return (
    <footer>
      <div className="bigcube" aria-hidden="true"><svg width="520" height="520" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth=".6" strokeLinejoin="round"><polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" /><path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" /></svg></div>
      <div className="wrap">
        <div className="grid" style={extra ? ({ "--cols": Fo.cols.length + 1 } as CSSProperties) : undefined}>
          <div><Link className="ax-brand" href="/" aria-label="AlgorithmX"><BrandCube size={24} /><span className="lv2-wordmark"><span className="lv2-wordmark-main">ALGORITHM</span><span className="lv2-wordmark-x">X</span></span></Link><p className="tag">{Fo.tagline}</p></div>
          {Fo.cols.map((c) => <div key={c.title}><h4>{c.title}</h4><ul>{c.links.map((l) => <li key={l[0]}><a href={l[1]}>{l[0]}</a></li>)}</ul>{"note" in c && c.note ? <div className="note">{c.note}</div> : null}</div>)}
          {extra && <div><h4>{extra.title}</h4><ul>{extra.links.map(([t, h]) => <li key={h}><a href={h} aria-current={h === extra.current ? "page" : undefined}>{t}</a></li>)}</ul></div>}
        </div>
        <div className="legal"><a href={`mailto:${Fo.email}`}>{Fo.email}</a><span>{Fo.legal}</span></div>
      </div>
    </footer>
  );
}

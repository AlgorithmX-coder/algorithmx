"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { HoloFooter, HoloNav } from "@/app/components/home-holo/HoloChrome";
import CorporateBrand from "@/app/corporate/CorporateBrand";
import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";
import "./reading-room.css";

/**
 * The reading room: the one document template behind /privacy, /terms and
 * the three /corporate regulation pages.
 *
 * The owner-approved round 7 design (landing lab, r7-misc-*.html, "Reading
 * room"): the light Hologram house capsule, a compact hero with a meta row
 * (the date, the section count with a reading time, Print, Copy link), then
 * a sticky numbered contents rail with scroll-spy and reading progress, the
 * document on a white sheet with a link anchor per heading, and a side card.
 * On phones the contents become a sticky drop-down. There is a print sheet:
 * the document only, black on white, with link addresses written out.
 *
 * Only the layout lives here. Every word of a document (title, date line,
 * eyebrow, lede, section headings and bodies, the "fits" points and the
 * as-of line) is passed in by its page and rendered as given; each of those
 * blocks carries data-legal, so a text diff can pull exactly the document
 * out of the rendered page.
 */

const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--r7m-sans", display: "swap" });
const disp = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--r7m-disp", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--r7m-mono", display: "swap" });

/**
 * One section of a document: its heading and its words, exactly as the page
 * writes them. A marker the reading room reads its sections from; it draws
 * nothing on its own.
 */
export function DocSection(props: { title: string; children: ReactNode }): null {
  void props;
  return null;
}

const ICON = (d: string, size = 15, w = 2) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const BACK = ICON("M19 12H5M11 6l-6 6 6 6", 14, 2.2);
const ARR = ICON("M5 12h14M13 6l6 6-6 6", 16, 2.2);
const ARR_SM = ICON("M5 12h14M13 6l6 6-6 6", 14, 2.4);
const CHEV = ICON("M6 9l6 6 6-6", 16, 2.2);
const UP = ICON("M12 19V5M6 11l6-6 6 6", 14, 2.2);
const PRINT = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);
const LINK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5" />
  </svg>
);
const PAUSE = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const PLAY = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5l11 7-11 7z" />
  </svg>
);

const CORP_TABS: [string, string][] = [
  ["CYBER SECURED", "/corporate"],
  ["SECURITY", "/corporate/security"],
  ["EU AI ACT", "/corporate/eu-ai-act"],
  ["UK GDPR", "/corporate/uk-gdpr"],
];
const RELATED: [string, string][] = [
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
  ["Security and data handling", "/corporate/security"],
];
const TRUST_COL = {
  title: "TRUST",
  links: [
    ["Security and data handling", "/corporate/security"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ] as [string, string][],
};

/** The words in a piece of JSX, for the reading time. Function components
 *  (a mailto link, say) count as nothing, which only shaves a word or two. */
function wordsIn(node: ReactNode): number {
  let n = 0;
  Children.forEach(node, (c) => {
    if (typeof c === "string" || typeof c === "number") n += String(c).split(/\s+/).filter(Boolean).length;
    else if (isValidElement<{ children?: ReactNode }>(c)) n += wordsIn(c.props.children);
  });
  return n;
}

const slug = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Six course colours as soft pastel streams, each carrying one travelling
 * light, confined to the right of the hero copy. 30 fps, DPR capped at 1.5,
 * stopped offscreen and on Pause, drawn once under reduced motion. */
function useStreams(host: React.RefObject<HTMLDivElement | null>, paused: React.RefObject<boolean>) {
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const cv = document.createElement("canvas");
    el.appendChild(cv);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLS = ["240,180,80", "95,208,216", "157,140,255", "255,154,102", "127,178,255", "255,143,224"];
    const from = 0.58, band = [0.2, 0.8];
    let W = 0, H = 0, raf = 0, last = 0, t = 0, vis = true;
    let ctx: CanvasRenderingContext2D | null = null;
    const yAt = (i: number, x: number) => {
      const base = H * (band[0] + (band[1] - band[0]) * (i / 5));
      const A = 14 + i * 3;
      return base + Math.sin(x * 0.0052 + t * 0.35 + i * 1.3) * A + Math.sin(x * 0.011 - t * 0.22 + i * 2.1) * A * 0.45;
    };
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      if (W < 900) return;
      const x0 = W * from;
      for (let i = 0; i < 6; i++) {
        const c = COLS[i];
        const g = ctx.createLinearGradient(x0, 0, W, 0);
        g.addColorStop(0, `rgba(${c},0)`);
        g.addColorStop(0.22, `rgba(${c},.6)`);
        g.addColorStop(1, `rgba(${c},.32)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = x0; x <= W + 8; x += 10) {
          const y = yAt(i, x);
          if (x === x0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const p = (t * (0.045 + i * 0.007) + i * 0.17) % 1;
        const px = x0 + (W - x0) * (0.15 + 0.85 * p), py = yAt(i, px);
        const rg = ctx.createRadialGradient(px, py, 0, px, py, 10);
        rg.addColorStop(0, `rgba(${c},.95)`);
        rg.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const size = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      if (!W || !H) return;
      ctx = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 })?.ctx ?? null;
      draw();
    };
    const loop = (now: number) => {
      raf = 0;
      if (!vis || paused.current) return;
      if (now - last > 33) {
        t += (now - last > 200 ? 33 : now - last) / 1000;
        last = now;
        draw();
      } else if (!last) last = now;
      raf = requestAnimationFrame(loop);
    };
    const go = () => {
      if (!raf && !reduced && !paused.current) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const io = new IntersectionObserver(([en]) => {
      vis = en.isIntersecting;
      if (vis) go();
    });
    io.observe(el);
    const onPause = () => go();
    el.addEventListener("r7m:play", onPause);
    go();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("r7m:play", onPause);
      cv.remove();
    };
  }, [host, paused]);
}

export default function ReadingRoom({
  variant,
  route,
  title,
  children,
  updated,
  eyebrow,
  lede,
  asOf,
  maps,
  mapsHeading,
  asofLine,
}: {
  variant: "plain" | "corp";
  /** This page's own address, so the nav, side card and footer can mark it. */
  route: string;
  title: ReactNode;
  /** The document, as <DocSection title="...">...</DocSection> elements in order. */
  children: ReactNode;
  /** Plain pages: the "Last updated" line, shown as given. */
  updated?: string;
  /** Corporate pages: the eyebrow, lede, the date on the as-of line, the "fits" points and the as-of line. */
  eyebrow?: string;
  lede?: string;
  asOf?: string;
  maps?: string[];
  mapsHeading?: string;
  asofLine?: ReactNode;
}) {
  const corp = variant === "corp";
  const rootRef = useRef<HTMLDivElement>(null);
  const streamsRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState("");
  const [mobOpen, setMobOpen] = useState(false);

  const sections = Children.toArray(children)
    .filter((c): c is ReactElement<{ title: string; children: ReactNode }> => isValidElement(c))
    .map((c) => ({ heading: c.props.title, body: c.props.children }));
  const secs = sections.map((s, i) => ({ ...s, id: slug(s.heading), n: String(i + 1).padStart(2, "0") }));
  const words = wordsIn(lede) + sections.reduce((a, s) => a + wordsIn(s.body), 0) + (maps ?? []).reduce((a, m) => a + wordsIn(m), 0);
  const mins = Math.max(1, Math.round(words / 220));

  useStreams(streamsRef, pausedRef);

  /* scroll-spy and reading progress */
  useEffect(() => {
    const root = rootRef.current, doc = docRef.current;
    if (!root || !doc) return;
    const bars = [...root.querySelectorAll<HTMLElement>(".dc-prog i")];
    const els = secs.map((s) => document.getElementById(s.id));
    let frame = 0;
    const spy = () => {
      frame = 0;
      const r = doc.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / Math.max(1, r.height - innerHeight * 0.4)));
      bars.forEach((b) => b.style.setProperty("--p", p.toFixed(3)));
      let idx = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < 150) idx = i;
      });
      setCurrent(idx);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    spy();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the sections are fixed for the life of the page
  }, []);

  /* reveal on scroll; reduced motion shows everything at once */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    const show = (el: Element) => el.setAttribute("data-in", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (ents) => ents.forEach((en) => {
        if (en.isIntersecting) {
          show(en.target);
          io.unobserve(en.target);
        }
      }),
      { threshold: 0, rootMargin: "0px 0px -4% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const r = requestAnimationFrame(() => els.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.96) show(el);
    }));
    return () => {
      io.disconnect();
      cancelAnimationFrame(r);
    };
  }, []);

  const togglePause = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) streamsRef.current?.dispatchEvent(new Event("r7m:play"));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied("Link copied");
    } catch {
      setCopied("Copy the address from the browser bar");
    }
  };

  const jump = (id: string) => {
    setMobOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.removeAttribute("data-flash");
    void el.offsetWidth;
    el.setAttribute("data-flash", "");
  };

  const toc = (
    <ol className="dc-toc">
      {secs.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} aria-current={i === current ? "location" : undefined} onClick={() => jump(s.id)}>
            <span className="n">{s.n}</span>
            <span>{s.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div ref={rootRef} className={`r7m ${sans.variable} ${disp.variable} ${mono.variable}`} data-paused={paused ? "" : undefined}>
      <div className="atmo" aria-hidden="true">
        <div className="pool c" />
        <div className="pool v" />
      </div>

      {corp ? <CorpNav route={route} /> : <HoloNav />}

      <main id="main">
        <section className="dc-hero" id="top" aria-labelledby="r7m-h1">
          <div className="streams" ref={streamsRef} aria-hidden="true" />
          <div className="wrap">
            <div className="copy">
              {corp ? (
                <>
                  <Link className="back" href="/corporate">{BACK}Cyber Secured</Link>
                  <div className="eyebrow"><i /><span data-legal="">{eyebrow}</span></div>
                </>
              ) : (
                <Link className="back" href="/">{BACK}Back to home</Link>
              )}
              <h1 className="h" id="r7m-h1" data-legal="">{title}</h1>
              {corp && lede && <p className="dc-lede" data-legal="">{lede}</p>}
              <div className="dc-meta">
                {corp ? (
                  <span className="dc-chip">As of <b>{asOf}</b></span>
                ) : (
                  <span className="dc-chip" data-legal="">{updated}</span>
                )}
                <span className="dc-chip dc-count"><b>{secs.length}</b> sections · <b>{mins}</b> min read</span>
                <button className="dc-chip" type="button" onClick={() => window.print()}>{PRINT}<span className="lbl">Print</span></button>
                <button className="dc-chip" type="button" onClick={copyLink}>{LINK}<span className="lbl">Copy link</span></button>
                <span className="sr-only" role="status">{copied}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="wrap dc-body">
          <div className="dc-mob">
            <details open={mobOpen} onToggle={(e) => setMobOpen((e.currentTarget as HTMLDetailsElement).open)}>
              <summary>
                <span>Contents</span>
                <span className="cur">{secs[current]?.heading}</span>
                {CHEV}
              </summary>
              <nav aria-label="Contents">{toc}</nav>
            </details>
            <div className="dc-prog" aria-hidden="true"><i /></div>
          </div>

          <aside className="dc-rail" aria-label="On this page">
            <h2>On this page</h2>
            <div className="dc-prog" aria-hidden="true"><i /></div>
            <nav aria-label="Sections">{toc}</nav>
            <div className="dc-railfoot">
              <button type="button" onClick={() => window.print()}>{PRINT}Print this page</button>
              <a href="#top">{UP}Back to top</a>
            </div>
          </aside>

          <article className="dc-doc" ref={docRef} aria-labelledby="r7m-h1">
            {secs.map((s) => (
              <section className="dc-sec" id={s.id} key={s.id} aria-labelledby={`${s.id}-h`} data-reveal="">
                <span className="no" aria-hidden="true">{s.n}</span>
                <h2 id={`${s.id}-h`}>
                  <span data-legal="">{s.heading}</span>
                  <a className="dc-anchor" href={`#${s.id}`} aria-label={`Link to ${s.heading}`} onClick={() => jump(s.id)}>{LINK}</a>
                </h2>
                <div className="dc-text" data-legal="">{s.body}</div>
              </section>
            ))}
          </article>

          {corp ? (
            <>
              <aside className="dc-side" aria-label={(mapsHeading ?? "").replace(/^\/\/\s*/, "")}>
                <div className="glass dc-card" data-reveal="">
                  <span className="kicker"><i /><span data-legal="">{mapsHeading}</span></span>
                  <ul className="dc-maps">
                    {(maps ?? []).map((m) => <li key={m} data-legal="">{m}</li>)}
                  </ul>
                  <div className="dc-doors">
                    <Link className="btn" href="/corporate#enquiry">Get in touch {ARR}</Link>
                    <Link className="btn" data-kind="ghost" href="/corporate#policy">Write our AI policy, free</Link>
                  </div>
                </div>
              </aside>
              <p className="dc-asof" data-legal="">{asofLine}</p>
            </>
          ) : (
            <aside className="dc-side" aria-label="Related pages">
              <div className="glass dc-card" data-reveal="">
                <span className="kicker"><i />Related pages</span>
                <nav className="dc-rel" aria-label="Related pages">
                  {RELATED.map(([t, h]) => (
                    <Link key={h} href={h} aria-current={h === route ? "page" : undefined}>{t}{ARR}</Link>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        <button className="motion" type="button" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={togglePause}>
          {paused ? PLAY : PAUSE}
        </button>
      </main>

      <HoloFooter extra={{ ...TRUST_COL, current: route }} />
    </div>
  );
}

/* The corporate capsule: the Cyber Secured lockup, the switcher between the
 * corporate pages, and the live "Get in touch". */
function CorpNav({ route }: { route: string }) {
  const segRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const lit = (a: HTMLAnchorElement) => {
    const g = glowRef.current, s = segRef.current;
    if (!g || !s) return;
    g.style.left = a.offsetLeft + "px";
    g.style.width = a.offsetWidth + "px";
    s.setAttribute("data-lit", "");
  };
  return (
    <header className="nav">
      <div className="capsule">
        <Link className="ax-lockup" href="/corporate" aria-label="Cyber Secured by AlgorithmX"><CorporateBrand /></Link>
        <nav className="seg doc-seg" ref={segRef} aria-label="Site" onPointerLeave={() => segRef.current?.removeAttribute("data-lit")}>
          <span className="glow" ref={glowRef} />
          {CORP_TABS.map(([t, h]) => (
            <Link key={h} href={h} aria-current={h === route ? "page" : undefined} onPointerEnter={(e) => lit(e.currentTarget)} onFocus={(e) => lit(e.currentTarget)}>{t}</Link>
          ))}
        </nav>
        <Link className="cta" href="/corporate#enquiry">Get in touch {ARR_SM}</Link>
      </div>
    </header>
  );
}


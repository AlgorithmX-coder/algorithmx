"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

import Nav from "@/app/components/landing-v2/Nav";
import CubeMark from "@/app/components/CubeMark";
import Footer from "@/app/components/landing-v2/Footer";
import ProofBand from "@/app/components/ProofBand";
import { FadeUp } from "@/app/components/landing-v2/utilities";
import { sectionMark, sectionMarkBare } from "@/app/components/sectionMark";
import DeskHeroSim from "./DeskHeroSim";
import PartPreview, { PREVIEW_CSS, type PreviewKind } from "./PartPreview";
import { FINAL, PARTS } from "./syllabus";

/**
 * The Desk Ready landing, built on the AlgorithmX landing system (owner
 * 2026-11-09: "needs to look like algorithmx standard"): the shared Nav with
 * a course brand, a dark photographic hero band with a live taste of the
 * course on glass, the accreditations band, sand sections that reveal on
 * scroll, and the shared Footer. The /corporate page is the pattern.
 *
 * The buyer is one adult paying for themselves who wants the fundamentals
 * every desk job runs on, whether new to office work or already at a desk
 * (owner 2026-11-09: "just for anyone looking to get their skills up"). The
 * copy is plain, the price is said up front, and the hero proof is a real
 * lesson from the course.
 *
 * Copy rules (owner): state the benefit, never the denial; no em-dashes; no
 * invented figures (the one statistic is sourced on the page).
 */

const SIGNUP = "/desk-ready/signup";

const h2: CSSProperties = {
  margin: "14px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
  lineHeight: 1.06,
  letterSpacing: "-0.025em",
  fontWeight: 400,
  color: "var(--lv2-ink)",
};

const lede: CSSProperties = {
  margin: "16px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
  lineHeight: 1.6,
  color: "rgba(17,22,38,0.82)",
  maxWidth: 660,
};

const SECTIONS: ReadonlyArray<readonly [id: string, label: string]> = [
  ["who", "Who it is for"],
  ["learn", "What you learn"],
  ["how", "How it works"],
  ["price", "Price"],
  ["questions", "Questions"],
];

/* The four "who it is for" graphics. Each is a small animated SVG in the
 * card's accent (currentColor), drawn for the idea on the card: bars that
 * climb, a path whose stops light up in turn, skill tiles whose gaps fill,
 * a progress ring that closes. Motion only under no-preference. */
function ArtStepUp() {
  const bars = [26, 40, 54, 70, 88];
  return (
    <svg viewBox="0 0 220 110" aria-hidden className="dr-art">
      <defs>
        <linearGradient id="drArtBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect key={i} className="dr-art-bar" style={{ animationDelay: `${i * 0.18}s` }} x={22 + i * 38} y={100 - h} width="24" height={h} rx="5" fill="url(#drArtBar)" />
      ))}
      {/* the line draws in; the arrowhead appears as the line reaches it */}
      <path className="dr-art-trend" d="M20 78 L64 64 L102 50 L140 36 L187 13" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
      <path className="dr-art-head" d="M175 11.5 L187 13 L184.5 25" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArtNewRole() {
  const stops = [
    [24, 78],
    [78, 34],
    [138, 70],
    [194, 26],
  ];
  return (
    <svg viewBox="0 0 220 110" aria-hidden className="dr-art">
      <path d="M24 78 C48 78 54 34 78 34 S112 70 138 70 S170 26 194 26" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 6" />
      <path className="dr-art-path" d="M24 78 C48 78 54 34 78 34 S112 70 138 70 S170 26 194 26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" pathLength="260" />
      {stops.map(([x, y], i) => (
        <g key={i} className="dr-art-stop" style={{ animationDelay: `${i * 0.55}s` }}>
          <circle cx={x} cy={y} r="11" fill="currentColor" fillOpacity="0.18" />
          <circle cx={x} cy={y} r="5.5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

function ArtGaps() {
  const gaps = new Set([2, 5, 9]);
  return (
    <svg viewBox="0 0 220 110" aria-hidden className="dr-art">
      {Array.from({ length: 12 }, (_, i) => {
        const x = 26 + (i % 4) * 44;
        const y = 8 + Math.floor(i / 4) * 34;
        return gaps.has(i) ? (
          <g key={i}>
            <rect x={x} y={y} width="36" height="26" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeDasharray="4 4" />
            <rect className="dr-art-fill" style={{ animationDelay: `${[...gaps].indexOf(i) * 0.6}s` }} x={x} y={y} width="36" height="26" rx="6" fill="currentColor" />
          </g>
        ) : (
          <rect key={i} x={x} y={y} width="36" height="26" rx="6" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeOpacity="0.35" />
        );
      })}
    </svg>
  );
}

function ArtReturn() {
  return (
    <svg viewBox="0 0 220 110" aria-hidden className="dr-art">
      <circle cx="110" cy="55" r="40" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" />
      <circle className="dr-art-ring" cx="110" cy="55" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" pathLength="100" transform="rotate(-90 110 55)" />
      <path d="M110 55 L110 32 M110 55 L126 63" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="55" r="4" fill="#ffffff" />
      <circle className="dr-art-orbit" cx="110" cy="15" r="4" fill="currentColor" />
    </svg>
  );
}

const WHO = [
  {
    accent: "#7fb2ff",
    n: "01",
    title: "Stepping up",
    text: "Taking on more admin, reports or a team to run? Get quicker at the email, spreadsheets and shared files that come with it.",
    Art: ArtStepUp,
  },
  {
    accent: "#5fd0d8",
    n: "02",
    title: "Starting something new",
    text: "Moving into office, admin or customer service work? Walk in on day one already sure of the tools everyone else uses.",
    Art: ArtNewRole,
  },
  {
    accent: "#9d8cff",
    n: "03",
    title: "Self-taught so far",
    text: "Picked it all up as you went? Fill the gaps, learn the shortcuts and do it the way offices expect it done.",
    Art: ArtGaps,
  },
  {
    accent: "#ff8fe0",
    n: "04",
    title: "Getting back in",
    text: "Returning after time away? Catch up on how offices work now, from shared files to using AI safely, at your own pace.",
    Art: ArtReturn,
  },
];

/* Bright accents: the part cards are dark panels. */
const PART_ACCENT = ["#f0b450", "#7fb2ff", "#4cc38a", "#5fd0d8", "#9d8cff", "#ff8fe0"];

/* The bento: each part's width (of 12 columns) and how many module tiles sit
 * side by side, so a one-module part is narrow and a four-module part wide,
 * and the cards in a row end at the same height. In syllabus order. */
const PART_LAYOUT: ReadonlyArray<{ span: number; cols: number }> = [
  { span: 4, cols: 1 }, // Getting comfortable: 1 module
  { span: 8, cols: 3 }, // Email: 3
  { span: 7, cols: 2 }, // Spreadsheets: 4
  { span: 5, cols: 1 }, // Documents and files: 2
  { span: 8, cols: 3 }, // The everyday office: 3
  { span: 4, cols: 1 }, // Getting the job: 1
];

/* The app each part teaches, drawn small in its card's top right. */
const PART_PREVIEW: ReadonlyArray<PreviewKind> = ["desktop", "outlook", "excel", "sharepoint", "copilot", "word"];

const STEPS = [
  { n: "01", colour: "#2b59c3", title: "Learn one thing", text: "A short lesson in plain English, one idea per screen, with real examples of what good looks like and what to avoid." },
  { n: "02", colour: "#0a7085", title: "Do it in a pretend office", text: "Straight away you try it in a pretend Outlook, a pretend Excel or a pretend desktop. Nothing breaks and nothing is ever sent." },
  { n: "03", colour: "#0e7a45", title: "See what to fix", text: "Press Send or Check and every point is marked on the spot, with a plain hint for anything that needs another go." },
  { n: "04", colour: "#8a5400", title: "Keep the proof", text: "Finish with a real Monday morning at the desk: emails, a spreadsheet, a meeting and one scam to spot." },
];

const FAQS = [
  { q: "Is it for beginners, or for people already at a desk?", a: "Both. It starts from the fundamentals and builds up, so anyone new to office work gets a solid start, and anyone already at a desk fills the gaps and picks up faster ways of working. Already know a module? Skip it." },
  { q: "Do I need Microsoft Office?", a: "All you need is a web browser. Everything you practise on is built into the course, so there is nothing to install or buy. It looks and works like Microsoft 365, because that is what most UK offices use." },
  { q: "How long does it take?", a: "About fifteen hours in all, in lessons of around ten minutes. Do one on your lunch break or a few in an evening, and pick up where you stopped." },
  { q: "Can I do it on my phone?", a: "It works on a phone, and a laptop or desktop is better, because that is what you will use at work. Most libraries have computers you can use for free." },
  { q: "Will it help my career?", a: "It covers the skills desk jobs ask for, and the final module helps you show them: a CV that says what you can do, and practice for the typing and Excel tests agencies set." },
  { q: "What does it cost?", a: "One payment, VAT included, for every module and every update, for as long as you want it." },
];

/* The /desk-ready header mark: the course glyph (a monitor with a tick) and
 * the mono wordmark with "by AlgorithmX", the same lockup the other courses
 * wear. It sits on night over the hero and sand below, so the words use the
 * nav's tone-aware ink and the glyph a blue that reads on both. */
function DeskBrand() {
  return (
    <>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(95,141,255,0.55))" }}>
        <rect x="3" y="4" width="18" height="12" rx="2" fill="rgba(95,141,255,0.14)" stroke="#5f8dff" strokeWidth="1.8" />
        <path d="M9 20 H15 M12 16 V20" stroke="#5f8dff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 10 L10.2 12.6 L15.8 7.4" stroke="#8fd3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--lv2-word-mark, #eaf1ff)" }}>
          DESK <span style={{ color: "#5f8dff" }}>READY</span>
        </span>
        <span style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 500, fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--lv2-word-mark, #eaf1ff)", display: "inline-flex", alignItems: "center" }}>
          <span style={{ opacity: 0.6 }}>by</span>
          <CubeMark size={12} color="#5f8dff" code style={{ display: "inline-block", margin: "0 3px", filter: "drop-shadow(0 0 4px rgba(95,141,255,0.7))" }} />
          <span style={{ opacity: 0.6 }}>AlgorithmX</span>
        </span>
      </span>
    </>
  );
}

/* Three small drawings of the practice: the inbox, the sheet, the desktop. */
function PracticeInbox() {
  return (
    <div className="dr-mini" aria-hidden>
      <div className="dr-mini-bar" style={{ background: "#0f6cbd" }}>New message</div>
      <div className="dr-mini-body">
        <div className="dr-mini-line"><span>Subject</span>Order 5520: delivery date?</div>
        <div className="dr-mini-text">Hi Mark,<br />Could you confirm the delivery date by Thursday?<br />Many thanks, Dave</div>
        <div className="dr-mini-ticks">✓ Says which order · ✓ Asks politely · ✓ Signs off</div>
      </div>
    </div>
  );
}

function PracticeSheet() {
  const rows = [["Brightline Supplies", "4417", "10"], ["Fenwick Packaging", "4420", "4"], ["Ashby Foods", "4425", "7"]];
  return (
    <div className="dr-mini" aria-hidden>
      <div className="dr-mini-bar" style={{ background: "#107c41" }}>Deliveries.xlsx</div>
      <div className="dr-mini-grid">
        <span className="h" />
        <span className="h">A</span>
        <span className="h">B</span>
        <span className="h">C</span>
        <span className="h">1</span>
        <span className="b">Supplier</span>
        <span className="b">Order no</span>
        <span className="b">Pallets</span>
        {rows.map((r, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span className="h">{i + 2}</span>
            {r.map((v, j) => (
              <span key={j} className={i === 1 && j === 2 ? "sel" : ""}>{v}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function WinButtons() {
  return (
    <svg width="34" height="8" viewBox="0 0 34 8" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden style={{ display: "inline-block" }}>
      <path d="M1 4 H7" />
      <rect x="13" y="1" width="6" height="6" />
      <path d="M26 1 L32 7 M32 1 L26 7" />
    </svg>
  );
}

function PracticeDesktop() {
  return (
    <div className="dr-mini dr-mini-desk" aria-hidden>
      <div className="dr-mini-win" style={{ left: "8%", top: "12%" }}>
        <div className="dr-mini-bar" style={{ background: "#107c41" }}>Excel <WinButtons /></div>
      </div>
      <div className="dr-mini-win" style={{ left: "26%", top: "30%" }}>
        <div className="dr-mini-bar" style={{ background: "#0f6cbd" }}>Outlook <WinButtons /></div>
      </div>
      <div className="dr-mini-task"><span>Outlook</span><span className="on">Excel</span><span>Files</span></div>
    </div>
  );
}

export default function DeskReadyLanding({ priceGBP }: { priceGBP: number }) {
  const price = `£${Math.round(priceGBP / 100)}`;
  const [activeSection, setActiveSection] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);

  /* The nav wears night over the photograph and sand once past it. */
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting), { rootMargin: "-68px 0px 0px 0px", threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = SECTIONS.find(([id]) => visible.has(id));
        setActiveSection(first ? first[0] : "");
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const chip = ([id, label]: (typeof SECTIONS)[number]) => (
    <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} className={`dr-chip${activeSection === id ? " on" : ""}`}>
      {label}
    </a>
  );

  return (
    <div className={overHero ? "dr-page dr-page-dark" : "dr-page"} style={{ display: "contents" }}>
      <Nav
        brand={<DeskBrand />}
        tone={overHero ? "night" : "sand"}
        showTelemetry={false}
        showSiteLinks={false}
        homeHref="/desk-ready"
        ctaTone="teal"
        aside={{ label: "Sign in", href: "/desk-ready/login" }}
        cta={{ label: `Purchase ${price}`, href: SIGNUP }}
        centre={<nav className="dr-navsections" aria-label="On this page">{SECTIONS.map(chip)}</nav>}
      />
      <main style={{ position: "relative", color: "var(--lv2-ink)", minHeight: "100vh", overflowX: "clip" }}>
        {/* HERO ───────────────────────────────────────────── */}
        {/* A dark photographic band: the warehouse office, the floor through
            the glass behind him. The wall on the left carries the headline;
            the live taste of Module 2 sits on dark glass to the right. */}
        <section ref={heroRef} className="dr-hero-band">
          <div className="dr-hero-media" aria-hidden>
            <picture>
              <source type="image/webp" srcSet="/desk-ready/hero-1200.webp 1200w, /desk-ready/hero.webp 2200w" sizes="100vw" />
              <img src="/desk-ready/hero.jpg" alt="" className="dr-hero-img" fetchPriority="high" />
            </picture>
            <span className="dr-hero-scrim" />
            <span className="dr-hero-fade" />
          </div>
          <div className="dr-section dr-hero-section">
            <div className="dr-hero-grid">
              <div className="dr-hero">
                <FadeUp>
                  <p style={sectionMarkBare} className="dr-hero-eyebrow">{"// Desk skills · Email, Excel, files and AI"}</p>
                </FadeUp>
                <FadeUp delay={0.06}>
                  <h1 className="dr-h1">
                    The computer skills every desk job <span className="dr-grad-night">expects.</span>
                  </h1>
                </FadeUp>
                <FadeUp delay={0.12}>
                  <p className="dr-hero-lede" style={{ ...lede, fontSize: "clamp(1.05rem, 1.35vw, 1.2rem)", maxWidth: 540 }}>
                    <strong>Desk Ready</strong> teaches the fundamentals every desk job runs on: email, spreadsheets, files and AI, in ten minute lessons you practise straight away in a pretend office. For anyone who wants to work faster and more confidently at a desk.
                  </p>
                </FadeUp>
                <FadeUp delay={0.18}>
                  <div className="dr-cta-row">
                    <Link href={SIGNUP} className="dr-pill">
                      Purchase for {price}
                      <span aria-hidden style={{ marginLeft: 10, fontSize: 17, lineHeight: 1 }}>&rarr;</span>
                    </Link>
                    <a href="#learn" className="dr-pill-ghost">See what you learn</a>
                  </div>
                </FadeUp>
                <FadeUp delay={0.24}>
                  <ul className="dr-trust">
                    <li>{price} once, yours for life</li>
                    <li>Ten minute lessons</li>
                    <li>A pretend office to practise in</li>
                  </ul>
                </FadeUp>
              </div>
              <FadeUp delay={0.15} y={30}>
                <DeskHeroSim />
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ACCREDITATIONS ─────────────────────────────────── */}
        <ProofBand tone="sand" forFirms />

        {/* WHO IT IS FOR ──────────────────────────────────── */}
        {/* A night band between the sand sections, so the page has a second
            dark beat after the hero: a faint grid, two glows, and four glass
            cards, each with its own animated graphic. */}
        <div className="dr-night">
          <span className="dr-night-grid" aria-hidden />
          <section id="who" className="dr-section">
            <FadeUp>
              <p style={sectionMark}>{"// Who it is for"}</p>
              <h2 style={{ ...h2, color: "#ffffff" }}>
                Whether you are new to the desk <span className="dr-grad-night">or already at one.</span>
              </h2>
              <p style={{ ...lede, color: "rgba(238,242,245,0.8)" }}>
                More than half of working-age adults in the UK cannot yet do all twenty of the digital tasks employers and government call essential for work (
                <a className="dr-src dr-src-night" href="https://futuredotnow.uk/final-report-the-economic-impact-of-closing-the-work-essential-digital-skills-gap" target="_blank" rel="noopener noreferrer">
                  FutureDotNow, 2025
                </a>
                ). Wherever you are starting from, Desk Ready makes the fundamentals second nature.
              </p>
            </FadeUp>
            <div className="dr-who-grid">
              {WHO.map((w, i) => (
                <FadeUp key={w.title} delay={0.07 * i}>
                  <article className="dr-who" style={{ "--dr-accent": w.accent } as CSSProperties}>
                    <div className="dr-who-art">
                      <w.Art />
                    </div>
                    <span className="dr-who-n">{w.n}</span>
                    <h3>{w.title}</h3>
                    <p>{w.text}</p>
                  </article>
                </FadeUp>
              ))}
            </div>
          </section>
        </div>

        {/* WHAT YOU LEARN ─────────────────────────────────── */}
        <section id="learn" className="dr-section">
          <span className="dr-glow dr-glow-violet" aria-hidden />
          <FadeUp>
            <p style={sectionMark}>{"// What you learn"}</p>
            <h2 style={h2}>
              Fourteen modules, <span className="dr-grad">everything a desk job asks of you.</span>
            </h2>
            <p style={lede}>Six parts in the order you need them. Start at the beginning, or skip what you already know.</p>
          </FadeUp>
          <div className="dr-parts">
            {PARTS.map((p, i) => (
              <div key={p.id} className="dr-part-cell" style={{ "--span": PART_LAYOUT[i].span } as CSSProperties}>
                <FadeUp delay={0.05 * i}>
                  <article className={PART_LAYOUT[i].span < 7 ? "dr-part narrow" : "dr-part"} style={{ "--dr-accent": PART_ACCENT[i], "--cols": PART_LAYOUT[i].cols } as CSSProperties}>
                    <span className="dr-part-ghost" aria-hidden>
                      {String(i).padStart(2, "0")}
                    </span>
                    <header className="dr-part-head">
                      <span className="dr-part-titles">
                        <span className="dr-part-tag">
                          {p.label}
                          <span className="dr-part-count">
                            {" "}
                            · {p.modules.length} {p.modules.length === 1 ? "module" : "modules"}
                          </span>
                        </span>
                        <h3>{p.title}</h3>
                      </span>
                      <PartPreview kind={PART_PREVIEW[i]} />
                    </header>
                    <p className="dr-part-blurb">{p.blurb}</p>
                    <ol className="dr-mods">
                      {p.modules.map((m) => (
                        <li key={m.id} className="dr-mod">
                          <span className="dr-mod-n">{String(m.number).padStart(2, "0")}</span>
                          <b>{m.title}</b>
                          <span className="dr-mod-p">{m.promise}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                </FadeUp>
              </div>
            ))}
          </div>
          <FadeUp delay={0.1}>
            <article className="dr-final">
              <span className="dr-final-glyph" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12v4a6 6 0 0 1-12 0z" />
                  <path d="M6 5H3v1a4 4 0 0 0 4 4M18 5h3v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4v4h-4z" />
                </svg>
              </span>
              <span>
                <span className="dr-part-tag">The final task</span>
                <h3>{FINAL.title}</h3>
                <p>{FINAL.promise}</p>
              </span>
            </article>
          </FadeUp>
        </section>

        {/* HANDS ON ───────────────────────────────────────── */}
        <section className="dr-section">
          <FadeUp>
            <p style={sectionMark}>{"// Hands on"}</p>
            <h2 style={h2}>
              You learn it by <span className="dr-grad">doing it.</span>
            </h2>
            <p style={lede}>Every lesson ends with the real thing, in a pretend version of the tools offices use. Press Send or Check and see straight away what is right and what to fix.</p>
          </FadeUp>
          <div className="dr-grid-3" style={{ marginTop: 34 }}>
            {[
              { title: "A pretend inbox", text: "Write subject lines, greetings, chasers and apologies, and get every point marked when you press Send.", Art: PracticeInbox },
              { title: "A pretend spreadsheet", text: "Type real business data into rows and columns, tidy it, sort it, filter it and check it against the paperwork.", Art: PracticeSheet },
              { title: "A pretend desktop", text: "Open, switch and close windows, copy and paste, save a file and find it again, until it feels normal.", Art: PracticeDesktop },
            ].map(({ title, text, Art }, i) => (
              <FadeUp key={title} delay={0.06 * i}>
                <article className="dr-card dr-hands">
                  <div className="dr-hands-stage">
                    <Art />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS ───────────────────────────────────── */}
        <section id="how" className="dr-section">
          <span className="dr-glow dr-glow-green" aria-hidden />
          <div className="dr-how-head">
            <FadeUp>
              <p style={sectionMark}>{"// How it works"}</p>
              <h2 style={h2}>
                Ten minutes at a time, <span className="dr-grad">at your kitchen table.</span>
              </h2>
              <p style={lede}>Learn in the evening, on a lunch break, whenever suits you. Stop any time and carry on where you left off.</p>
            </FadeUp>
            <FadeUp delay={0.08} y={20}>
              <figure className="dr-photo-panel">
                <picture>
                  <source type="image/webp" srcSet="/desk-ready/home.webp" />
                  <img src="/desk-ready/home.jpg" alt="A woman learning on a laptop at her kitchen table in the evening, with a notebook and a mug of tea beside her" loading="lazy" />
                </picture>
              </figure>
            </FadeUp>
          </div>
          <div className="dr-grid-4" style={{ marginTop: 34 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <article className="dr-card dr-step" style={{ "--dr-accent": s.colour } as CSSProperties}>
                  <span className="dr-step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* PRICE ──────────────────────────────────────────── */}
        <section id="price" className="dr-section">
          <span className="dr-glow dr-glow-blue" aria-hidden />
          <div className="dr-price-wrap">
            <FadeUp>
              <p style={sectionMark}>{"// Price"}</p>
              <h2 style={h2}>
                One price. <span className="dr-grad">Yours for life.</span>
              </h2>
              <p style={lede}>Pay once and every module is yours, including every update and every new lesson we add.</p>
            </FadeUp>
            <FadeUp delay={0.08}>
              <article className="dr-price">
                <span className="dr-part-tag" style={{ color: "#2b59c3" }}>Desk Ready</span>
                <p className="dr-price-figure">
                  {price}
                  <span>once</span>
                </p>
                <p className="dr-price-unit">VAT included · lifetime access</p>
                <ul>
                  <li>All fourteen modules and the final task</li>
                  <li>A pretend inbox, spreadsheet and desktop to practise in</li>
                  <li>Instant marking on every task</li>
                  <li>Any computer with a web browser</li>
                </ul>
                <Link href={SIGNUP} className="dr-pill" style={{ alignSelf: "stretch" }}>
                  Purchase for {price}
                  <span aria-hidden style={{ marginLeft: 10, fontSize: 17, lineHeight: 1 }}>&rarr;</span>
                </Link>
                <p className="dr-price-fine">
                  Already have an account? <Link href="/desk-ready/login">Sign in</Link>
                </p>
              </article>
            </FadeUp>
          </div>
        </section>

        {/* QUESTIONS ──────────────────────────────────────── */}
        <section id="questions" className="dr-section" style={{ paddingBottom: "calc(var(--lv2-rail) * 2.2)" }}>
          <FadeUp>
            <p style={sectionMark}>{"// Questions"}</p>
            <h2 style={h2}>Good to know.</h2>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="dr-faq-grid">
              {FAQS.map((f) => (
                <details key={f.q} className="dr-faq">
                  <summary>{f.q}</summary>
                  <p>{f.q === "What does it cost?" ? `${price}, once. ${f.a}` : f.a}</p>
                </details>
              ))}
            </div>
          </FadeUp>
        </section>
      </main>
      <Footer tone="sand" />

      <style>{`
        .dr-page, .dr-page :is(section, div, nav, header, footer, main, span, p, li, a, ol, button, article, details, summary) {
          --lv2-cyan: #0a7085;
          --lv2-cyan-soft: #0a7085;
          --lv2-lime: #0e7a45;
          --lv2-cosmic: #5744c9;
          --lv2-text-muted: #5d6472;
          --lv2-ink: #14161d;
        }
        html, .dr-page { background: #f3ede4; }
        .dr-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

        /* the photographic hero band */
        .dr-hero-band {
          position: relative; isolation: isolate; overflow: hidden; color: #eef2f5;
          min-height: clamp(580px, 86svh, 800px);
          display: flex; flex-direction: column; justify-content: center;
          background: #f3ede4;
        }
        .dr-hero-band::before { content: ""; position: absolute; inset: 0; background: #0b1117; z-index: -1; }
        .dr-hero-media { position: absolute; inset: 0; z-index: 0; }
        .dr-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 72% center; display: block; }
        .dr-hero-scrim {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(90deg, rgba(8,13,18,0.92) 0%, rgba(8,13,18,0.84) 32%, rgba(8,13,18,0.55) 50%, rgba(8,13,18,0.2) 66%, rgba(8,13,18,0.38) 100%),
            linear-gradient(180deg, rgba(8,13,18,0.5) 0%, rgba(8,13,18,0) 28%, rgba(8,13,18,0.55) 100%);
        }
        .dr-hero-fade { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(170px, 24vh, 280px); pointer-events: none; background: linear-gradient(180deg, rgba(243,237,228,0) 0%, rgba(243,237,228,0.55) 55%, #f3ede4 100%); }
        .dr-hero-band .dr-section { position: relative; z-index: 1; width: 100%; }
        /* doubled class: .dr-section (declared below) would otherwise win */
        .dr-section.dr-hero-section { padding-top: calc(68px + clamp(26px, 2.4vw, 48px)); padding-bottom: calc(var(--lv2-rail) * 1.2 + 40px); }
        .dr-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); gap: 48px; align-items: start; }
        .dr-hero-eyebrow { color: #7fb2ff !important; }
        .dr-h1 { margin: 18px 0 0; font-family: var(--lv2-font-display); font-size: clamp(2.5rem, 5vw, 4.3rem); line-height: 1.0; letter-spacing: -0.03em; font-weight: 500; color: #ffffff; text-shadow: 0 2px 30px rgba(0,0,0,0.35); }
        .dr-grad-night { background: linear-gradient(92deg, #7fb2ff 0%, #5fd0d8 50%, #9d8cff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .dr-hero-band .dr-hero-lede { color: rgba(238,242,245,0.86) !important; }
        .dr-hero strong { color: #ffffff; font-weight: 600; }
        .dr-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .dr-pill {
          display: inline-flex; align-items: center; justify-content: center; height: 56px; padding: 0 30px; border-radius: 999px;
          background: linear-gradient(135deg, #3a6ee0 0%, #2b59c3 55%, #23489f 100%); color: #ffffff;
          font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; text-decoration: none; white-space: nowrap;
          box-shadow: 0 16px 38px -12px rgba(43,89,195,0.95), 0 0 0 1px rgba(43,89,195,0.35), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform .15s ease, box-shadow .2s ease;
        }
        .dr-pill:hover { transform: translateY(-1px); box-shadow: 0 20px 42px -12px rgba(43,89,195,1), 0 0 0 1px rgba(43,89,195,0.45), inset 0 1px 0 rgba(255,255,255,0.45); }
        .dr-pill-ghost {
          display: inline-flex; align-items: center; justify-content: center; height: 56px; padding: 0 26px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); color: #ffffff;
          font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; text-decoration: none; white-space: nowrap;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .dr-pill-ghost:hover { border-color: rgba(255,255,255,0.55); }
        .dr-trust { list-style: none; padding: 0; margin: 24px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .dr-trust li { position: relative; padding-left: 18px; font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(238,242,245,0.75); }
        .dr-trust li::before { content: ""; position: absolute; left: 0; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #4cc38a; box-shadow: 0 0 10px #4cc38a; }

        /* the live taste, dark glass over the photograph */
        .dr-sim { position: relative; border-radius: 16px; overflow: hidden; background: rgba(14,20,26,0.76); border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 40px 90px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); color: #eef2f5; }
        .dr-sim-bar { display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 14px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .dr-sim-dots { display: inline-flex; gap: 6px; }
        .dr-sim-dots i { width: 9px; height: 9px; border-radius: 50%; display: block; }
        .dr-sim-dots i:nth-child(1) { background: #ff5f57; } .dr-sim-dots i:nth-child(2) { background: #febc2e; } .dr-sim-dots i:nth-child(3) { background: #28c840; }
        .dr-sim-app { flex: 1; min-width: 0; font-family: var(--lv2-font-display); font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dr-sim-app span { font-weight: 400; color: rgba(238,242,245,0.6); }
        .dr-sim-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #7fb2ff; border: 1px solid rgba(127,178,255,0.5); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .dr-sim-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
        .dr-sim-task { margin: 0; padding: 11px 13px; border-radius: 10px; background: rgba(127,178,255,0.1); border: 1px solid rgba(127,178,255,0.32); font-family: var(--lv2-font-display); font-size: 14px; line-height: 1.5; color: rgba(238,242,245,0.92); }
        .dr-sim-task span { display: block; margin-bottom: 3px; font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #7fb2ff; }
        .dr-sim-mail { border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); overflow: hidden; }
        .dr-sim-row { display: flex; align-items: center; gap: 10px; min-height: 46px; padding: 0 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .dr-sim-row:last-child { border-bottom: 0; }
        .dr-sim-lab { width: 58px; flex-shrink: 0; font-family: var(--lv2-font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(238,242,245,0.55); }
        .dr-sim-to { font-family: var(--lv2-font-display); font-size: 13.5px; color: #eef2f5; background: rgba(127,178,255,0.16); border-radius: 999px; padding: 3px 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .dr-sim-input { flex: 1; min-width: 0; height: 44px; border: none; outline: none; background: transparent; color: #ffffff; font-family: var(--lv2-font-display); font-size: 15.5px; }
        .dr-sim-input::placeholder { color: rgba(238,242,245,0.45); }
        .dr-sim-row:focus-within { box-shadow: inset 0 0 0 2px rgba(127,178,255,0.6); }
        /* the row carries the focus ring; the input inside it does not add a second */
        .dr-sim .dr-sim-input:focus-visible { outline: none; }
        .dr-sim-checks { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
        .dr-sim-checks li { display: flex; align-items: center; gap: 8px; font-family: var(--lv2-font-display); font-size: 13.5px; color: rgba(238,242,245,0.6); transition: color .2s ease; }
        .dr-sim-checks li.on { color: #ffffff; }
        .dr-sim-tick { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; border: 1.5px solid rgba(238,242,245,0.35); color: transparent; transition: all .2s ease; }
        .dr-sim-tick svg { display: block; }
        .dr-sim-checks li.on .dr-sim-tick { background: #4cc38a; border-color: #4cc38a; color: #06180f; box-shadow: 0 0 12px rgba(76,195,138,0.7); }
        .dr-sim-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; min-height: 36px; }
        .dr-sim-note { margin: 0; font-family: var(--lv2-font-mono); font-size: 10.5px; letter-spacing: 0.06em; color: rgba(238,242,245,0.55); }
        .dr-sim-done { margin: 0; padding: 9px 12px; border-radius: 10px; background: rgba(76,195,138,0.14); border: 1px solid rgba(76,195,138,0.45); font-family: var(--lv2-font-display); font-size: 14px; line-height: 1.45; color: #ffffff; }
        .dr-sim-alt { height: 34px; padding: 0 14px; border-radius: 999px; cursor: pointer; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-family: var(--lv2-font-display); font-size: 13px; font-weight: 600; }
        .dr-sim-alt:hover { border-color: #7fb2ff; }
        @media (max-width: 480px) { .dr-sim-checks { grid-template-columns: 1fr; } }

        /* nav section chips (wide screens) */
        .dr-navsections { display: none; }
        @media (min-width: 1180px) { .dr-navsections { display: flex; align-items: center; gap: 6px; min-width: 0; } }
        .dr-chip {
          flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 36px; padding: 0 15px; border-radius: 12px; text-decoration: none;
          border: 1px solid rgba(43,89,195,0.3); background: linear-gradient(180deg, #ffffff, #f1e9db);
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #23489f;
          box-shadow: 0 3px 7px -4px rgba(43,89,195,0.5), inset 0 1px 0 rgba(255,255,255,0.95);
          transition: transform .15s ease, border-color .2s ease, background .2s ease, color .2s ease;
        }
        .dr-chip:hover { transform: translateY(-1px); border-color: rgba(43,89,195,0.55); }
        .dr-chip.on { color: #ffffff; background: linear-gradient(180deg, #3a6ee0, #2b59c3); border-color: #2b59c3; }
        .dr-page-dark .dr-chip { border-color: rgba(127,178,255,0.38); background: linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.045)); color: #dce6f5; box-shadow: 0 3px 8px -4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12); }
        .dr-page-dark .dr-chip:hover { border-color: rgba(160,200,255,0.65); color: #ffffff; }

        /* sections */
        .dr-section { position: relative; max-width: 1180px; margin: 0 auto; padding: calc(var(--lv2-rail) * 1.3) var(--lv2-rail); scroll-margin-top: 88px; }
        .dr-section > *:not(.dr-glow) { position: relative; z-index: 1; }
        .dr-section :is(a, button, summary, input):focus-visible { outline: 2px solid #2b59c3; outline-offset: 3px; }
        .dr-glow { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(60px); opacity: 0.55; }
        .dr-glow-blue { width: 560px; height: 560px; right: -160px; top: -60px; background: radial-gradient(circle, rgba(43,89,195,0.3), transparent 65%); }
        .dr-glow-violet { width: 560px; height: 560px; left: -200px; top: 60px; background: radial-gradient(circle, rgba(124,92,255,0.3), transparent 65%); }
        .dr-glow-green { width: 480px; height: 480px; right: -160px; top: 120px; background: radial-gradient(circle, rgba(76,195,138,0.25), transparent 65%); }
        .dr-grad { background: linear-gradient(92deg, #0a7085 0%, #2b59c3 50%, #5744c9 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .dr-src { color: #2b59c3; text-decoration: underline; text-underline-offset: 3px; }

        .dr-card {
          position: relative; height: 100%; box-sizing: border-box; padding: 26px 24px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78));
          border: 1px solid rgba(20,22,29,0.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px -30px rgba(43,89,195,0.35);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .dr-card h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; color: #14161d; }
        .dr-card p { margin: 10px 0 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.8); }
        .dr-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .dr-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .dr-grid-3 > *, .dr-grid-4 > * { height: 100%; }

        /* the course: six parts, as dark panels in a bento grid */
        .dr-parts { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; margin-top: 34px; align-items: stretch; }
        .dr-part-cell { grid-column: span var(--span); }
        .dr-part-cell > * { height: 100%; }
        .dr-part {
          position: relative; overflow: hidden; isolation: isolate; height: 100%; box-sizing: border-box;
          display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto 1fr; grid-template-areas: "titles pv" "blurb pv" "mods mods"; column-gap: 16px; row-gap: 10px; padding: 22px 22px 20px; border-radius: 20px;
          background:
            radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--dr-accent) 22%, transparent), transparent 60%),
            linear-gradient(170deg, #111a33, #090e1c);
          border: 1px solid color-mix(in srgb, var(--dr-accent) 32%, rgba(255,255,255,0.06));
          box-shadow: 0 24px 50px -28px rgba(9,14,28,0.85), inset 0 1px 0 rgba(255,255,255,0.07);
          color: #eef3ff;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        /* faint grid, and a lit edge along the top */
        .dr-part::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: linear-gradient(rgba(127,178,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(127,178,255,0.05) 1px, transparent 1px); background-size: 26px 26px; -webkit-mask-image: linear-gradient(180deg, #000, transparent 75%); mask-image: linear-gradient(180deg, #000, transparent 75%); }
        .dr-part::after { content: ""; position: absolute; left: 20px; right: 20px; top: 0; height: 2px; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--dr-accent), transparent); box-shadow: 0 0 14px var(--dr-accent); }
        .dr-part:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--dr-accent) 60%, transparent); box-shadow: 0 34px 64px -30px color-mix(in srgb, var(--dr-accent) 55%, rgba(9,14,28,0.9)), inset 0 1px 0 rgba(255,255,255,0.09); }
        .dr-part-ghost { position: absolute; right: 14px; bottom: -22px; z-index: -1; font-family: var(--lv2-font-display); font-size: 120px; font-weight: 700; line-height: 1; letter-spacing: -0.05em; color: var(--dr-accent); opacity: 0.08; pointer-events: none; }
        /* titles, the app window and the blurb share a grid: on a wide card the
           blurb sits beside the window, on a narrow one it runs under both */
        .dr-part-head { display: contents; }
        .dr-part-titles { grid-area: titles; min-width: 0; padding-top: 6px; }
        .dr-part .dr-pv { grid-area: pv; align-self: start; }
        .dr-part-blurb { grid-area: blurb; }
        .dr-part.narrow { grid-template-areas: "titles pv" "blurb blurb" "mods mods"; }
        /* a narrow card beside its window has no room for the module count */
        .dr-part.narrow .dr-part-count { display: none; }
        .dr-part-tag { display: block; font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dr-accent); }
        .dr-part h3 { margin: 4px 0 0; font-family: var(--lv2-font-display); font-size: clamp(1.3rem, 1.9vw, 1.55rem); line-height: 1.1; letter-spacing: -0.02em; font-weight: 500; color: #ffffff; }
        .dr-part-blurb { margin: 0; font-family: var(--lv2-font-display); font-size: 14px; line-height: 1.55; color: rgba(222,230,250,0.72); max-width: 560px; }
${PREVIEW_CSS}
        /* every module a glass tile */
        .dr-mods { list-style: none; margin: 4px 0 0; padding: 0; display: grid; grid-area: mods; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 10px; align-content: start; }
        .dr-mod {
          position: relative; display: flex; flex-direction: column; gap: 3px; padding: 12px 13px 13px; border-radius: 13px;
          background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08);
          transition: border-color .2s ease, background .2s ease;
        }
        .dr-mod:hover { border-color: color-mix(in srgb, var(--dr-accent) 55%, transparent); background: color-mix(in srgb, var(--dr-accent) 9%, rgba(255,255,255,0.04)); }
        .dr-mod-n { font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; color: var(--dr-accent); }
        .dr-mod b { font-family: var(--lv2-font-display); font-size: 14.5px; font-weight: 600; line-height: 1.3; color: #ffffff; }
        .dr-mod-p { font-family: var(--lv2-font-display); font-size: 13px; line-height: 1.45; color: rgba(222,230,250,0.66); }
        /* the final task: one wide panel in the course's three colours */
        .dr-final {
          position: relative; overflow: hidden; margin-top: 18px; padding: 24px 26px; border-radius: 20px;
          display: flex; align-items: center; gap: 20px;
          background: radial-gradient(80% 140% at 0% 0%, rgba(127,178,255,0.22), transparent 60%), radial-gradient(70% 140% at 100% 100%, rgba(255,143,224,0.18), transparent 60%), linear-gradient(170deg, #111a33, #090e1c);
          border: 1px solid rgba(157,140,255,0.4);
          box-shadow: 0 24px 50px -28px rgba(9,14,28,0.85), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .dr-final .dr-part-tag { color: #ff8fe0; }
        .dr-final-glyph { flex-shrink: 0; width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: #ffd27a; background: rgba(255,210,122,0.12); border: 1px solid rgba(255,210,122,0.45); box-shadow: 0 0 26px -6px rgba(255,210,122,0.8); }
        .dr-final-glyph svg { width: 28px; height: 28px; display: block; }
        .dr-final h3 { margin: 4px 0 0; font-family: var(--lv2-font-display); font-size: clamp(1.35rem, 2vw, 1.6rem); font-weight: 500; letter-spacing: -0.02em; color: #ffffff; }
        .dr-final p { margin: 6px 0 0; max-width: 760px; font-family: var(--lv2-font-display); font-size: 15px; line-height: 1.6; color: rgba(222,230,250,0.78); }
        @media (max-width: 980px) {
          .dr-part-cell { grid-column: span 12; }
          .dr-part.narrow { grid-template-areas: "titles pv" "blurb pv" "mods mods"; }
          .dr-part.narrow .dr-part-count { display: inline; }
          .dr-mods { grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
        }
        @media (max-width: 560px) { .dr-final { flex-direction: column; align-items: flex-start; } }

        /* hands on: the three drawings */
        .dr-hands { display: flex; flex-direction: column; transition: transform .25s ease, box-shadow .25s ease; }
        .dr-hands:hover { transform: translateY(-4px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 34px 70px -34px rgba(43,89,195,0.6); }
        /* each drawing floats on a small dark "screen" with a grid and a glow */
        .dr-hands-stage {
          position: relative; margin: -8px -8px 20px; padding: 18px; border-radius: 14px; overflow: hidden;
          background: radial-gradient(120% 90% at 50% 0%, rgba(43,89,195,0.35), transparent 60%), #0b1117;
          border: 1px solid rgba(127,178,255,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .dr-hands-stage::before { content: ""; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(127,178,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(127,178,255,0.08) 1px, transparent 1px); background-size: 22px 22px; }
        .dr-hands-stage .dr-mini { margin-bottom: 0; box-shadow: 0 20px 40px -18px rgba(0,0,0,0.8), 0 0 0 1px rgba(127,178,255,0.25), 0 0 34px -10px rgba(127,178,255,0.55); transition: transform .3s ease; }
        .dr-hands:hover .dr-hands-stage .dr-mini { transform: translateY(-3px) scale(1.015); }
        .dr-mini { position: relative; height: 168px; margin-bottom: 18px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(20,22,29,0.16); box-shadow: 0 16px 34px -22px rgba(20,22,29,0.5); font-family: var(--lv2-font-display); }
        .dr-mini-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; color: #ffffff; font-size: 11.5px; font-weight: 700; }
        .dr-mini-body { display: flex; flex-direction: column; height: calc(100% - 28px); box-sizing: border-box; padding: 8px 10px; font-size: 12px; color: #2a2e36; }
        .dr-mini-line { padding-bottom: 5px; border-bottom: 1px solid rgba(20,22,29,0.08); font-weight: 600; }
        .dr-mini-line span { color: #8a8f98; font-weight: 400; margin-right: 6px; }
        .dr-mini-text { margin-top: 6px; line-height: 1.45; }
        .dr-mini-ticks { margin-top: auto; padding-top: 6px; border-top: 1px solid rgba(20,22,29,0.08); font-size: 10.5px; color: #1b7a43; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dr-mini-grid { display: grid; grid-template-columns: 22px 1.5fr 1fr 0.8fr; font-size: 11.5px; color: #2a2e36; }
        .dr-mini-grid span { padding: 6px; border-right: 1px solid #e3ded4; border-bottom: 1px solid #e3ded4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dr-mini-grid .h { background: #efeae1; color: #767c87; font-size: 10px; text-align: center; padding: 4px 2px; }
        .dr-mini-grid .b { font-weight: 700; }
        .dr-mini-grid .sel { outline: 2px solid #107c41; outline-offset: -2px; }
        .dr-mini-desk { background: linear-gradient(160deg, #3b6fd1, #22468f); }
        .dr-mini-win { position: absolute; width: 62%; height: 52%; border-radius: 6px; overflow: hidden; background: #ffffff; box-shadow: 0 10px 22px rgba(0,0,0,0.3); }
        .dr-mini-task { position: absolute; left: 0; right: 0; bottom: 0; height: 30px; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(246,243,238,0.92); font-size: 10.5px; font-weight: 700; color: #14161d; }
        .dr-mini-task span { padding: 3px 7px; border-radius: 5px; }
        .dr-mini-task .on { background: rgba(43,89,195,0.14); border-bottom: 2px solid #107c41; }

        /* who it is for: the night band and its glass cards */
        .dr-night { position: relative; isolation: isolate; overflow: hidden; background: radial-gradient(70% 60% at 85% 10%, rgba(87,68,201,0.32), transparent 60%), radial-gradient(60% 60% at 10% 90%, rgba(10,112,133,0.32), transparent 60%), #0b1117; color: #eef2f5; }
        .dr-night-grid { position: absolute; inset: 0; z-index: 0; pointer-events: none; background-image: linear-gradient(rgba(127,178,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,178,255,0.06) 1px, transparent 1px); background-size: 48px 48px; -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%); mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%); }
        .dr-night .dr-section { z-index: 1; padding-top: calc(var(--lv2-rail) * 1.6); padding-bottom: calc(var(--lv2-rail) * 1.6); }
        .dr-src-night { color: #9fc4ff; }
        .dr-who-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-top: 38px; }
        .dr-who-grid > * { height: 100%; }
        .dr-who {
          position: relative; height: 100%; box-sizing: border-box; display: flex; flex-direction: column;
          padding: 18px 18px 22px; border-radius: 20px; color: var(--dr-accent);
          background: linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025));
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 30px 60px -36px rgba(0,0,0,0.9);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        /* a lit edge along the top in the card's colour */
        .dr-who::before { content: ""; position: absolute; left: 18px; right: 18px; top: -1px; height: 2px; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--dr-accent), transparent); box-shadow: 0 0 14px var(--dr-accent); }
        .dr-who:hover { transform: translateY(-5px); border-color: color-mix(in srgb, var(--dr-accent) 55%, transparent); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 36px 70px -34px color-mix(in srgb, var(--dr-accent) 70%, transparent); }
        .dr-who-art { position: relative; height: 112px; margin-bottom: 18px; border-radius: 14px; background: radial-gradient(100% 100% at 50% 100%, color-mix(in srgb, var(--dr-accent) 22%, transparent), transparent 70%), rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .dr-art { width: 100%; height: 100%; display: block; padding: 8px 6px; box-sizing: border-box; filter: drop-shadow(0 0 8px color-mix(in srgb, var(--dr-accent) 55%, transparent)); }
        .dr-who-n { font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 800; letter-spacing: 0.18em; color: var(--dr-accent); }
        .dr-who h3 { margin: 6px 0 0; font-family: var(--lv2-font-display); font-size: 1.25rem; font-weight: 500; letter-spacing: -0.01em; color: #ffffff; }
        .dr-who p { margin: 10px 0 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(238,242,245,0.76); }
        @media (prefers-reduced-motion: no-preference) {
          .dr-art-bar { transform-box: fill-box; transform-origin: bottom; animation: dr-bar 3.2s ease-in-out infinite; }
          .dr-art-trend { stroke-dasharray: 100 120; animation: dr-draw 3.2s ease-in-out infinite; }
          .dr-art-head { animation: dr-head 3.2s ease-in-out infinite; }
          .dr-art-path { stroke-dasharray: 260 300; animation: dr-draw-long 3.4s ease-in-out infinite; }
          .dr-art-stop { animation: dr-blink 3.4s ease-in-out infinite; }
          .dr-art-fill { animation: dr-fill 3.6s ease-in-out infinite; }
          .dr-art-ring { stroke-dasharray: 100; animation: dr-ring 4s ease-in-out infinite; }
          .dr-art-orbit { transform-box: view-box; transform-origin: 110px 55px; animation: dr-orbit 4s linear infinite; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dr-art-fill { opacity: 0.85; }
          .dr-art-ring { stroke-dasharray: 100; stroke-dashoffset: 25; }
        }
        @keyframes dr-bar { 0%, 100% { transform: scaleY(0.72); } 50% { transform: scaleY(1); } }
        /* draw in, hold, then fade: never erase from the start, which left the
           arrowhead floating on its own */
        @keyframes dr-draw { 0% { stroke-dashoffset: 104; opacity: 1; } 50%, 85% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
        @keyframes dr-head { 0%, 46% { opacity: 0; } 54%, 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes dr-draw-long { 0% { stroke-dashoffset: 266; opacity: 1; } 60%, 88% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
        @keyframes dr-blink { 0%, 100% { opacity: 0.35; } 20%, 60% { opacity: 1; } }
        @keyframes dr-fill { 0%, 15% { opacity: 0; } 35%, 80% { opacity: 0.9; } 100% { opacity: 0; } }
        @keyframes dr-ring { 0% { stroke-dashoffset: 100; } 70%, 85% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 100; } }
        @keyframes dr-orbit { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) { .dr-who-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .dr-who-grid { grid-template-columns: 1fr; } }

        /* how it works */
        .dr-how-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 34px; align-items: center; }
        .dr-photo-panel { position: relative; margin: 0; border-radius: 18px; overflow: hidden; aspect-ratio: 3 / 2; border: 1px solid rgba(20,22,29,0.24); box-shadow: 0 30px 70px -40px rgba(43,89,195,0.6), 0 20px 50px -30px rgba(0,0,0,0.5); background: #e8dfd0; }
        .dr-photo-panel img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .dr-step { border-top: 2px solid var(--dr-accent); }
        .dr-step-n { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; margin-bottom: 14px; border-radius: 50%; background: var(--dr-accent); color: #fffdfa; box-shadow: 0 0 22px -4px var(--dr-accent); font-family: var(--lv2-font-mono); font-size: 12px; font-weight: 800; }

        /* price */
        .dr-price-wrap { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 40px; align-items: center; }
        .dr-price {
          display: flex; flex-direction: column; gap: 6px; padding: 30px 28px 26px; border-radius: 22px;
          background: linear-gradient(180deg, rgba(255,253,248,0.95), rgba(244,239,231,0.9));
          border: 1px solid rgba(20,22,29,0.22); border-top: 3px solid #2b59c3;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 40px 80px -40px rgba(43,89,195,0.7);
        }
        .dr-price-figure { margin: 6px 0 0; font-family: var(--lv2-font-display); font-size: clamp(3.2rem, 6vw, 4.4rem); line-height: 1; letter-spacing: -0.04em; font-weight: 500; color: #14161d; }
        .dr-price-figure span { margin-left: 10px; font-size: 1.1rem; letter-spacing: 0; font-weight: 600; color: rgba(17,22,38,0.6); }
        .dr-price-unit { margin: 0; font-family: var(--lv2-font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,22,38,0.62); }
        .dr-price ul { list-style: none; margin: 16px 0 20px; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .dr-price li { position: relative; padding: 9px 0 0 22px; border-top: 1px solid rgba(86,68,45,0.14); font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.5; color: rgba(17,22,38,0.88); }
        .dr-price li:first-child { border-top: 0; padding-top: 0; }
        .dr-price li::before { content: ""; position: absolute; left: 2px; top: 16px; width: 6px; height: 6px; border-radius: 999px; background: #2b59c3; }
        .dr-price li:first-child::before { top: 7px; }
        .dr-price-fine { margin: 14px 0 0; text-align: center; font-family: var(--lv2-font-display); font-size: 14px; color: rgba(17,22,38,0.7); }
        .dr-price-fine a { color: #2b59c3; font-weight: 600; }

        /* questions */
        .dr-faq-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin-top: 30px; }
        .dr-faq { border-radius: 14px; border: 1px solid rgba(20,22,29,0.2); background: linear-gradient(180deg, rgba(244,239,231,0.7), rgba(255,253,248,0.7)); padding: 0 18px; }
        .dr-faq[open] { border-color: rgba(20,22,29,0.45); }
        .dr-faq summary { cursor: pointer; list-style: none; padding: 16px 28px 16px 0; position: relative; font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; color: #14161d; }
        .dr-faq summary::-webkit-details-marker { display: none; }
        .dr-faq summary::after { content: "+"; position: absolute; right: 2px; top: 12px; font-size: 22px; color: #2b59c3; transition: transform .2s ease; }
        .dr-faq[open] summary::after { transform: rotate(45deg); }
        .dr-faq p { margin: 0; padding: 0 0 16px; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.82); }

        @media (max-width: 980px) {
          .dr-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 30px; }
          .dr-sim { max-width: 620px; }
          .dr-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dr-grid-3 { grid-template-columns: 1fr; }
          .dr-how-head, .dr-price-wrap { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) { .dr-faq-grid { grid-template-columns: 1fr; } }
        /* below 375px the header cannot fit the brand, Sign in and the Purchase
           pill; Sign in stays reachable from the price card */
        @media (max-width: 374px) { .dr-page .lv2-nav-aside { display: none; } }
        @media (max-width: 560px) { .dr-grid-4 { grid-template-columns: 1fr; } .dr-hero-img { object-position: 78% center; } }
      `}</style>
    </div>
  );
}

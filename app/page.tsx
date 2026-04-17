"use client";

import { CSSProperties, useEffect, useRef } from "react";
import Link from "next/link";

/* ───────────────────────── DESIGN TOKENS ───────────────────────── */

const BG = "#0a0e1a";
const BG_CARD = "#111827";
const BLUE = "#60a5fa";
const GREEN = "#34d399";
const ORANGE = "#f97316";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const MUTED = "#94a3b8";
const TEXT = "#e2e8f0";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* ───────────────────────── DATA ───────────────────────── */

const SUBJECTS = [
  {
    title: "Cybersecurity",
    icon: "shield",
    accent: BLUE,
    description: "Online safety, threat detection, ethical hacking, and digital defence — from foundational awareness through to penetration testing.",
    ages: "Ages 6–Adult",
    tracks: "4 tracks",
    status: "2 tracks live",
    href: "/cyberheroes",
    live: true,
  },
  {
    title: "Game Development",
    icon: "gamepad",
    accent: GREEN,
    description: "Game design, mechanics, coding, and publishing — from Scratch and block-based tools through to Unity and Unreal Engine.",
    ages: "Ages 8–Adult",
    tracks: "3 tracks",
    status: "Coming 2026",
    href: "#",
    live: false,
  },
  {
    title: "AI & Machine Learning",
    icon: "brain",
    accent: "#a78bfa",
    description: "Prompt engineering, model training, neural networks, and responsible AI — from playground tools through to Python and TensorFlow.",
    ages: "Ages 10–Adult",
    tracks: "3 tracks",
    status: "Coming 2026",
    href: "#",
    live: false,
  },
  {
    title: "App Development",
    icon: "code",
    accent: ORANGE,
    description: "Mobile and web applications — from no-code builders through to React, Swift, and full-stack development with deployment.",
    ages: "Ages 10–Adult",
    tracks: "3 tracks",
    status: "Coming 2027",
    href: "#",
    live: false,
  },
  {
    title: "Tech Entrepreneurship",
    icon: "rocket",
    accent: YELLOW,
    description: "Product thinking, lean startup methodology, pitch decks, financial modelling, and go-to-market strategy.",
    ages: "Ages 14–Adult",
    tracks: "2 tracks",
    status: "Coming 2027",
    href: "#",
    live: false,
  },
  {
    title: "Robotic Engineering",
    icon: "cpu",
    accent: "#f472b6",
    description: "Hardware fundamentals, sensor integration, microcontrollers, and autonomous systems — from Lego Mindstorms to Arduino and ROS.",
    ages: "Ages 8–Adult",
    tracks: "3 tracks",
    status: "Coming 2027",
    href: "#",
    live: false,
  },
];

const STATS = [
  { value: "6", label: "Technology Subjects", accent: BLUE },
  { value: "18", label: "Individual Tracks", accent: GREEN },
  { value: "6–Adult", label: "Age Range", accent: ORANGE },
  { value: "£99", label: "Per Course, Lifetime", accent: YELLOW },
];

const PRINCIPLES = [
  {
    icon: "layers",
    accent: BLUE,
    title: "Expert-Led Curriculum",
    text: "Every course is designed by industry professionals and aligned with CyberFirst and ASDAN frameworks.",
  },
  {
    icon: "zap",
    accent: GREEN,
    title: "Interactive, Not Passive",
    text: "Hands-on simulations, real-world scenarios, and interactive exercises — not lecture videos.",
  },
  {
    icon: "users",
    accent: ORANGE,
    title: "Age-Appropriate Tracks",
    text: "Content designed for how each age group actually learns — from guided play to professional training.",
  },
  {
    icon: "infinity",
    accent: YELLOW,
    title: "Lifetime Access",
    text: "Pay once. Learn forever. Continuous updates as technology and threats evolve.",
  },
];

const STEPS = [
  { title: "Choose a Subject", text: "Browse six streams of technology education", accent: BLUE },
  { title: "Pick Your Track", text: "Select the age-appropriate course within that subject", accent: GREEN },
  { title: "Enrol Instantly", text: "One-time payment of £99 — no subscriptions, no hidden fees", accent: ORANGE },
  { title: "Learn & Certify", text: "Complete missions at your pace and earn accredited certificates", accent: YELLOW },
];

const TESTIMONIALS = [
  {
    text: "My daughter absolutely loves it. She talks about Adam and Layla like they're her best friends, and she's already teaching ME about password safety.",
    name: "Sarah T.",
    role: "Parent of a 7-year-old",
  },
  {
    text: "Finally, a course that actually engages kids. The interactive missions are brilliant — my son doesn't even realise he's learning.",
    name: "James P.",
    role: "Parent of an 8-year-old",
  },
  {
    text: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety, and the kids genuinely enjoy it.",
    name: "Mrs. K. Williams",
    role: "Year 4 Teacher",
  },
];

const TRUST = ["CyberFirst Aligned", "ASDAN Accredited", "6 Subjects", "Ages 6 to Adult", "UK Designed"];

const PARTICLES = [
  { left: "8%", top: "12%", c: BLUE, s: 3, d: 22 },
  { left: "82%", top: "18%", c: GREEN, s: 4, d: 26 },
  { left: "28%", top: "48%", c: ORANGE, s: 3, d: 19 },
  { left: "90%", top: "52%", c: YELLOW, s: 3, d: 24 },
  { left: "5%", top: "68%", c: GREEN, s: 4, d: 28 },
  { left: "55%", top: "10%", c: BLUE, s: 3, d: 21 },
  { left: "72%", top: "78%", c: ORANGE, s: 3, d: 25 },
  { left: "18%", top: "85%", c: "#a78bfa", s: 3, d: 18 },
  { left: "45%", top: "35%", c: BLUE, s: 2, d: 23 },
  { left: "65%", top: "42%", c: GREEN, s: 2, d: 27 },
];

/* ───────────────────────── SVG ICONS ───────────────────────── */

const ICON_PATHS: Record<string, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gamepad: "M6 12h4M8 10v4M15 11h.01M18 13h.01",
  brain: "M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  cpu: "M6 4h12v16H6zM9 9h6M9 13h6M2 9h2M2 13h2M20 9h2M20 13h2",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  infinity: "M12 12c-2-2.67-4-4-6-4a4 4 0 100 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 000-8c-2 0-4 1.33-6 4z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  quote: "M3 21c3 0 7-1 7-8V5H5v8c0 3-2 3-2 3zM17 21c3 0 7-1 7-8V5h-5v8c0 3-2 3-2 3z",
};

function Ico({ name, size = 24, color = "#fff", sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const d = ICON_PATHS[name] || ICON_PATHS.shield;
  const extra: Record<string, string> = {};
  if (name === "gamepad") extra.rect = "2,6,20,12,2";
  if (name === "cpu") extra.rect = "6,4,12,16,1";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {extra.rect && (() => { const [x, y, w, h, rx] = extra.rect.split(",").map(Number); return <rect x={x} y={y} width={w} height={h} rx={rx} />; })()}
      <path d={d} />
    </svg>
  );
}

/* ───────────────────────── CSS ───────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;margin:0;padding:0}
h1,h2,h3,h4,.dsp{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.025em}
.mono{font-family:'JetBrains Mono',monospace}
html{scroll-behavior:smooth}
@keyframes axDrift{0%,100%{transform:translate(0,0)}33%{transform:translate(25px,-40px)}66%{transform:translate(-20px,30px)}}
@keyframes axBreathe{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:.4;transform:scale(1.12)}}
@keyframes axGrid{0%{background-position:0 0}100%{background-position:60px 60px}}
@keyframes axPulse{0%,100%{box-shadow:0 0 0 0 rgba(96,165,250,0)}50%{box-shadow:0 0 0 8px rgba(96,165,250,.12)}}
@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ax-lift{transition:transform .35s ${EASE},box-shadow .35s ${EASE},border-color .35s ${EASE}}
.ax-lift:hover{transform:translateY(-6px)}
a,button{cursor:pointer}
@media(max-width:768px){
  .ax-grid-2{grid-template-columns:1fr !important}
  .ax-grid-3{grid-template-columns:1fr !important}
  .ax-grid-4{grid-template-columns:1fr 1fr !important}
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-nav-links{display:none !important}
}
@media(max-width:480px){
  .ax-grid-4{grid-template-columns:1fr !important}
}
`;

/* ───────────────────────── HELPERS ───────────────────────── */

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase",
      color, background: `${color}12`, border: `1px solid ${color}25`,
    }}>
      {children}
    </span>
  );
}

function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: CSSProperties }) {
  return (
    <section id={id} style={{ position: "relative", zIndex: 1, padding: "96px 24px", maxWidth: 1120, margin: "0 auto", ...style }}>
      {children}
    </section>
  );
}

function Heading({ sub, children }: { sub?: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="dsp" data-reveal="0.05" style={{
        fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#fff",
        lineHeight: 1.15, marginBottom: sub ? 16 : 48,
      }}>
        {children}
      </h2>
      {sub && <p data-reveal="0.1" style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: "0 auto 48px" }}>{sub}</p>}
    </>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function AlgorithmXHome() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const els = rootRef.current.querySelectorAll<HTMLElement>("[data-reveal]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: "-30px" });
    els.forEach((el, i) => {
      const d = parseFloat(el.dataset.reveal || "0") || i * 0.06;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity .7s ${EASE} ${d}s, transform .7s ${EASE} ${d}s`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef} style={{ background: BG, minHeight: "100vh", color: TEXT, overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* ── BG layers ── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(96,165,250,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px", animation: "axGrid 25s linear infinite",
        maskImage: "radial-gradient(ellipse 70% 50% at 50% 25%, black 10%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 25%, black 10%, transparent 70%)",
      }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: p.left, top: p.top, width: p.s, height: p.s,
            borderRadius: "50%", background: p.c, opacity: .25,
            animation: `axDrift ${p.d}s ease-in-out ${-i * 2.5}s infinite`,
          }} />
        ))}
      </div>

      {/* ═══ 1. NAV ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        background: "rgba(10,14,26,.82)", borderBottom: "1px solid rgba(255,255,255,.05)",
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ico name="shield" size={18} sw={2.5} />
            </div>
            <span className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              Algorithm<span style={{ color: BLUE }}>X</span>
            </span>
          </Link>
          <div className="ax-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#subjects" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Subjects</a>
            <a href="#how" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How It Works</a>
            <Link href="/login" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Log In</Link>
            <Link href="/cyberheroes" style={{
              background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, color: "#fff",
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 100,
              textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}30`,
              transition: `transform .2s ${EASE}`,
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ 2. HERO ═══ */}
      <section style={{
        position: "relative", zIndex: 1, textAlign: "center",
        maxWidth: 880, margin: "0 auto", padding: "152px 24px 88px",
      }}>
        <div aria-hidden style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          width: 480, height: 480, borderRadius: "50%", pointerEvents: "none", zIndex: -1,
          background: `radial-gradient(circle, ${BLUE}20, transparent 70%)`,
          animation: "axBreathe 7s ease-in-out infinite",
        }} />

        <h1 className="dsp" data-reveal="0" style={{
          fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.06,
          color: "#fff", marginBottom: 24,
        }}>
          The Future of{" "}
          <span style={{
            background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Tech Education
          </span>
        </h1>

        <p data-reveal="0.08" style={{
          fontSize: "clamp(16px, 1.8vw, 19px)", color: MUTED, lineHeight: 1.75,
          maxWidth: 640, margin: "0 auto 40px",
        }}>
          Six streams of technology education designed for ages 6 to adult. Built by experts.
          Interactive, not passive. Accreditation aligned.
        </p>

        <div className="ax-hero-ctas" data-reveal="0.16" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <a href="#subjects" style={{
            background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, color: "#fff",
            fontSize: 15, fontWeight: 700, padding: "15px 34px", borderRadius: 100,
            textDecoration: "none", boxShadow: `0 8px 28px ${ORANGE}35`,
            transition: `transform .25s ${EASE}`,
          }}>
            Explore Subjects
          </a>
          <a href="#how" style={{
            color: "#fff", fontSize: 15, fontWeight: 600,
            padding: "15px 34px", borderRadius: 100, textDecoration: "none",
            border: "1.5px solid rgba(255,255,255,.12)",
            transition: `border-color .3s ${EASE}, background .3s ${EASE}`,
          }}>
            How It Works
          </a>
        </div>

        <div data-reveal="0.24" style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {TRUST.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 12, fontWeight: 600, letterSpacing: ".03em" }}>
              <Ico name="check" size={14} color={GREEN} sw={2.5} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ TRUST MARQUEE ═══ */}
      <div data-reveal="0" style={{
        position: "relative", zIndex: 1, padding: "28px 0",
        background: "rgba(255,255,255,.02)", borderTop: "1px solid rgba(255,255,255,.04)", borderBottom: "1px solid rgba(255,255,255,.04)",
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
      }}>
        <p style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(148,163,184,.45)", marginBottom: 16 }}>
          Curriculum Aligned with Industry-Leading Standards
        </p>
        <div style={{ display: "flex", animation: "axMarquee 30s linear infinite", width: "max-content" }}>
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: "flex", alignItems: "center", gap: 60, paddingRight: 60 }}>
              {["ASDAN", "CompTIA", "CyberFirst", "Unity", "AWS", "Raspberry Pi", "BCS", "Prince\u2019s Trust", "NCSC", "BAFTA Games"].map((name) => (
                <span key={`${dup}-${name}`} style={{ fontSize: 14, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 3. STATS BAR ═══ */}
      <Section style={{ padding: "48px 24px" }}>
        <div className="ax-grid-4" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
        }}>
          {STATS.map((s, i) => (
            <div key={i} data-reveal={`${0.05 + i * .08}`} style={{
              textAlign: "center", padding: "28px 16px", borderRadius: 16,
              background: BG_CARD, border: "1px solid rgba(255,255,255,.05)",
            }}>
              <p className="dsp" style={{ fontSize: 36, fontWeight: 700, color: s.accent, marginBottom: 4 }}>{s.value}</p>
              <p style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 4. SUBJECTS ═══ */}
      <Section id="subjects">
        <div style={{ textAlign: "center" }}>
          <div data-reveal="0"><Badge color={BLUE}><Ico name="layers" size={14} color={BLUE} /> Subjects</Badge></div>
          <Heading sub="Six streams of technology education — each with multiple age-appropriate tracks that grow with the learner.">
            Everything They Need to Thrive in Tech
          </Heading>
        </div>

        <div className="ax-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {SUBJECTS.map((s, i) => (
            <div
              key={i}
              data-reveal={`${0.12 + i * .08}`}
              className="ax-lift"
              style={{
                background: BG_CARD, borderRadius: 18, padding: "28px 28px 24px",
                border: "1px solid rgba(255,255,255,.05)", position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.borderColor = `${s.accent}35`;
                (e.currentTarget).style.boxShadow = `0 16px 48px ${s.accent}10`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.borderColor = "rgba(255,255,255,.05)";
                (e.currentTarget).style.boxShadow = "none";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${s.accent}12`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ico name={s.icon} size={22} color={s.accent} />
                </div>
                <Badge color={s.live ? GREEN : YELLOW}>{s.status}</Badge>
              </div>
              <h3 className="dsp" style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{s.description}</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <span className="mono" style={{ fontSize: 11, color: MUTED, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,.04)" }}>{s.ages}</span>
                <span className="mono" style={{ fontSize: 11, color: MUTED, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,.04)" }}>{s.tracks}</span>
              </div>
              {s.live ? (
                <Link href={s.href} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, color: "#fff",
                  fontSize: 14, fontWeight: 700, padding: "12px 0", borderRadius: 100,
                  textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}25`,
                  transition: `transform .2s ${EASE}`,
                }}>
                  Explore Courses <Ico name="arrow" size={16} sw={2.5} />
                </Link>
              ) : (
                <span style={{
                  display: "block", textAlign: "center",
                  color: "rgba(148,163,184,.6)", fontSize: 14, fontWeight: 600,
                  padding: "12px 0", borderRadius: 100,
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)",
                }}>
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 5. WHY ALGORITHMX ═══ */}
      <Section>
        <div style={{ textAlign: "center" }}>
          <div data-reveal="0"><Badge color={ORANGE}><Ico name="zap" size={14} color={ORANGE} /> Why AlgorithmX</Badge></div>
          <Heading sub="We don't just teach technology. We build the instincts, judgement, and confidence to use it safely and skilfully.">
            Built Different
          </Heading>
        </div>

        <div className="ax-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {PRINCIPLES.map((p, i) => (
            <div
              key={i}
              data-reveal={`${0.1 + i * .08}`}
              className="ax-lift"
              style={{
                background: BG_CARD, borderRadius: 18, padding: "28px 22px",
                border: "1px solid rgba(255,255,255,.05)", textAlign: "center",
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.boxShadow = `0 12px 40px ${p.accent}10`; }}
              onMouseLeave={(e) => { (e.currentTarget).style.boxShadow = "none"; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${p.accent}12`, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Ico name={p.icon} size={22} color={p.accent} />
              </div>
              <h3 className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.title}</h3>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 6. HOW IT WORKS ═══ */}
      <Section id="how">
        <div style={{ textAlign: "center" }}>
          <div data-reveal="0"><Badge color={GREEN}><Ico name="arrow" size={14} color={GREEN} /> Process</Badge></div>
          <Heading>Start Learning in Minutes</Heading>
        </div>

        <div className="ax-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {STEPS.map((s, i) => (
            <div key={i} data-reveal={`${0.1 + i * .1}`} style={{
              textAlign: "center", padding: "28px 20px", borderRadius: 18,
              background: BG_CARD, border: "1px solid rgba(255,255,255,.05)",
            }}>
              <div className="dsp" style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `${s.accent}15`, color: s.accent,
                fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", border: `2px solid ${s.accent}30`,
              }}>
                {i + 1}
              </div>
              <h3 className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <Section>
        <div style={{ textAlign: "center" }}>
          <div data-reveal="0"><Badge color={YELLOW}><Ico name="quote" size={14} color={YELLOW} /> Testimonials</Badge></div>
          <Heading>What Parents &amp; Teachers Say</Heading>
        </div>

        <div className="ax-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} data-reveal={`${0.1 + i * .1}`} style={{
              background: BG_CARD, borderRadius: 18, padding: "32px 26px",
              border: "1px solid rgba(255,255,255,.05)", position: "relative",
            }}>
              <div aria-hidden style={{
                position: "absolute", top: 14, left: 22, opacity: .08,
              }}>
                <Ico name="quote" size={40} color={BLUE} sw={1.5} />
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8, marginBottom: 20, position: "relative" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.name}</p>
                <p style={{ color: MUTED, fontSize: 12 }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 8. FINAL CTA ═══ */}
      <Section style={{ maxWidth: 680 }}>
        <div data-reveal="0" style={{
          background: BG_CARD, borderRadius: 24, padding: "52px 36px", textAlign: "center",
          border: "2px solid transparent",
          backgroundImage: `linear-gradient(${BG_CARD}, ${BG_CARD}), linear-gradient(135deg, ${BLUE}40, ${GREEN}40, ${ORANGE}40)`,
          backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box",
        }}>
          <h2 className="dsp" style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            Ready to Start?
          </h2>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>
            Choose a subject, pick your track, and begin your technology education journey today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link href="/cyberheroes" style={{
              background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, color: "#fff",
              fontSize: 14, fontWeight: 700, padding: "14px 30px", borderRadius: 100,
              textDecoration: "none", boxShadow: `0 6px 20px ${ORANGE}30`,
            }}>
              Cyber Heroes Academy — Ages 6-10
            </Link>
            <a href="#subjects" style={{
              color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "14px 30px", borderRadius: 100, textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,.12)",
            }}>
              View All Subjects
            </a>
          </div>
          <p style={{ color: "rgba(148,163,184,.6)", fontSize: 12 }}>
            One-time payment · Lifetime access · 30-day money-back guarantee
          </p>
        </div>
      </Section>

      {/* ═══ 9. FOOTER ═══ */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,.05)", padding: "44px 24px", marginTop: 24,
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ico name="shield" size={13} sw={2.5} />
              </div>
              <span className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                Algorithm<span style={{ color: BLUE }}>X</span>
              </span>
            </div>
            <p style={{ color: MUTED, fontSize: 12 }}>Cybersecurity &amp; Technology Education for the Next Generation</p>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Contact", "Support"].map((l) => (
              <a key={l} href="#" style={{ color: MUTED, fontSize: 12, fontWeight: 500, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ color: "rgba(148,163,184,.35)", fontSize: 11, width: "100%", textAlign: "center", marginTop: 12 }}>
            &copy; 2026 AlgorithmX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

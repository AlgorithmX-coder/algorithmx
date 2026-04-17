"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import SmoothScroll from "@/app/components/SmoothScroll";

/* ─────────────── TOKENS ─────────────── */
const BG = "#0a0e1a";
const CARD = "#111827";
const BLUE = "#60a5fa";
const GREEN = "#34d399";
const ORANGE = "#f97316";
const YELLOW = "#f59e0b";
const PURPLE = "#a78bfa";
const PINK = "#f472b6";
const RED = "#ef4444";
const MUTED = "#94a3b8";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* ─────────────── SUBJECT DATA ─────────────── */
const SUBJECTS = [
  { title: "Cybersecurity", icon: "shield", accent: GREEN, ages: "Ages 6–Adult", tracks: "4 tracks", status: "AVAILABLE NOW", statusColor: GREEN, desc: "Online safety, threat detection, ethical hacking, and digital defence — from foundational awareness through to penetration testing.", href: "/cyberheroes", live: true, extra: "UK's most comprehensive cyber education pathway", trackList: [
    { name: "Cyber Heroes", age: "6-10", price: "£99", live: true },
    { name: "Cyber Explorers", age: "11-14", price: "£99", live: false },
    { name: "CyberStart", age: "15-17", price: "£99", live: false },
    { name: "CyberStart Pro", age: "18+", price: "£109", live: false },
  ]},
  { title: "Game Development", icon: "gamepad", accent: BLUE, ages: "Ages 8–Adult", tracks: "3 tracks", status: "Coming 2026", statusColor: YELLOW, desc: "Game design, mechanics, coding, and publishing — from Scratch and block-based tools through to Unity and Unreal Engine.", href: "#", live: false },
  { title: "AI & Machine Learning", icon: "brain", accent: PURPLE, ages: "Ages 10–Adult", tracks: "3 tracks", status: "Coming 2026", statusColor: YELLOW, desc: "Prompt engineering, model training, neural networks, and responsible AI — from playground tools through to Python and TensorFlow.", href: "#", live: false },
  { title: "App Development", icon: "code", accent: ORANGE, ages: "Ages 10–Adult", tracks: "3 tracks", status: "Coming 2027", statusColor: YELLOW, desc: "Mobile and web applications — from no-code builders through to React, Swift, and full-stack development with deployment.", href: "#", live: false },
  { title: "Tech Entrepreneurship", icon: "rocket", accent: YELLOW, ages: "Ages 14–Adult", tracks: "2 tracks", status: "Coming 2027", statusColor: YELLOW, desc: "Product thinking, lean startup methodology, pitch decks, financial modelling, and go-to-market strategy.", href: "#", live: false },
  { title: "Robotic Engineering", icon: "cpu", accent: PINK, ages: "Ages 8–Adult", tracks: "3 tracks", status: "Coming 2027", statusColor: YELLOW, desc: "Hardware fundamentals, sensor integration, microcontrollers, and autonomous systems — from Lego Mindstorms to Arduino and ROS.", href: "#", live: false, extra: "UK Only · Kit Included" },
];

const STATS = [
  { value: 6, suffix: "", label: "Technology Subjects", accent: BLUE, list: ["Cybersecurity", "Game Development", "AI & Machine Learning", "App Development", "Tech Entrepreneurship", "Robotic Engineering"] },
  { value: 18, suffix: "", label: "Individual Tracks", accent: GREEN },
  { value: 0, suffix: "", label: "Ages 6 to Adult", accent: ORANGE, display: "6–Adult" },
  { value: 99, suffix: "", label: "Per Course · Lifetime", accent: YELLOW, display: "£99" },
];

const STEPS = [
  { title: "Choose a Subject", text: "Browse six streams of technology education", accent: BLUE },
  { title: "Pick Your Track", text: "Select the age-appropriate course within that subject", accent: GREEN },
  { title: "Enrol — £99", text: "One-time payment — no subscriptions, no hidden fees", accent: ORANGE },
  { title: "Learn & Certify", text: "Complete missions at your pace and earn accredited certificates", accent: YELLOW },
];

const WHY = [
  { icon: "layers", accent: BLUE, title: "Expert-Led Curriculum", text: "Every course is designed by industry professionals and aligned with CyberFirst and ASDAN frameworks." },
  { icon: "zap", accent: GREEN, title: "Interactive, Not Passive", text: "Hands-on simulations, real-world scenarios, and interactive exercises — not lecture videos." },
  { icon: "users", accent: ORANGE, title: "Age-Appropriate Tracks", text: "Content designed for how each age group actually learns — from guided play to professional training." },
  { icon: "infinity", accent: YELLOW, title: "Lifetime Access", text: "Pay once. Learn forever. Continuous updates as technology and threats evolve." },
];

const TESTIMONIALS = [
  { text: "My daughter absolutely loves it. She talks about Adam and Layla like they\u2019re her best friends, and she\u2019s already teaching ME about password safety.", name: "Sarah T.", role: "London" },
  { text: "Finally, a course that actually engages kids. The interactive missions are brilliant \u2014 my son doesn\u2019t even realise he\u2019s learning.", name: "James P.", role: "Manchester" },
  { text: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety, and the kids genuinely enjoy it.", name: "Mrs. K. Williams", role: "Year 4 Teacher" },
];

const TRUST_NAMES = ["ASDAN", "CompTIA", "CyberFirst", "Unity", "AWS", "Raspberry Pi", "BCS", "Prince\u2019s Trust", "NCSC", "BAFTA Games"];
const TRUST_STRIP = ["CyberFirst Aligned", "ASDAN Accredited", "6 Subjects", "Ages 6 to Adult", "UK Designed"];
const ORBIT_SUBJECTS = [
  { icon: "shield", color: GREEN, r: 90, speed: 28, start: 0 },
  { icon: "gamepad", color: BLUE, r: 110, speed: 34, start: 60 },
  { icon: "brain", color: PURPLE, r: 95, speed: 22, start: 120 },
  { icon: "code", color: ORANGE, r: 105, speed: 30, start: 180 },
  { icon: "rocket", color: YELLOW, r: 85, speed: 26, start: 240 },
  { icon: "cpu", color: PINK, r: 100, speed: 32, start: 300 },
];

/* ─────────────── SVG ICON ─────────────── */
const PATHS: Record<string, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gamepad: "M6 12h4M8 10v4M15 11h.01M18 13h.01",
  brain: "M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  cpu: "M9 9h6M9 13h6",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  infinity: "M12 12c-2-2.67-4-4-6-4a4 4 0 100 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 000-8c-2 0-4 1.33-6 4z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  quote: "M3 21c3 0 7-1 7-8V5H5v8c0 3-2 3-2 3zM17 21c3 0 7-1 7-8V5h-5v8c0 3-2 3-2 3z",
};
const RECTS: Record<string, [number, number, number, number, number]> = {
  gamepad: [2, 6, 20, 12, 2],
  cpu: [6, 4, 12, 16, 1],
};

function Ico({ name, size = 24, color = "#fff", sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const r = RECTS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {r && <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />}
      <path d={PATHS[name] || PATHS.shield} />
    </svg>
  );
}

/* ─────────────── COUNTER ─────────────── */
function Counter({ to, suffix = "", display }: { to: number; suffix?: string; display?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || display) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1800, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, display]);
  return <span ref={ref}>{display || `${val}${suffix}`}</span>;
}

/* ─────────────── SPOTLIGHT CARD ─────────────── */
function SpotlightCard({ children, accent, style, className }: { children: React.ReactNode; accent: string; style?: CSSProperties; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: CARD, borderRadius: 20,
        border: `1px solid ${hovering ? `${accent}40` : "rgba(255,255,255,.05)"}`,
        transition: `transform .4s ${EASE}, box-shadow .4s ${EASE}, border-color .4s ${EASE}`,
        transform: hovering ? "translateY(-8px)" : "none",
        boxShadow: hovering ? `0 20px 60px ${accent}15` : "none",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: hovering ? `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${accent}15, transparent 60%)` : "none",
        transition: "background .15s ease",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ─────────────── TYPEWRITER ─────────────── */
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => { i++; setShown(i); if (i >= text.length) clearInterval(iv); }, 28);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, text, delay]);
  return (
    <p ref={ref} className="mono" style={{ fontSize: "clamp(14px, 1.4vw, 17px)", color: MUTED, lineHeight: 1.7, maxWidth: 600, margin: "0 auto 40px", minHeight: 52 }}>
      {text.slice(0, shown)}
      <span style={{ borderRight: "2px solid", borderColor: shown < text.length ? ORANGE : "transparent", animation: shown < text.length ? "none" : "axBlink .8s step-end infinite", paddingLeft: 1 }} />
    </p>
  );
}

/* ─────────────── TIMELINE STEP ─────────────── */
function TimelineStep({ step, i }: { step: typeof STEPS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: 56, position: "relative" }}
    >
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div
          animate={inView ? { boxShadow: [`0 0 0 0 ${step.accent}00`, `0 0 0 10px ${step.accent}00`] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `${step.accent}18`, border: `2px solid ${step.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: step.accent,
          }}
        >
          {i + 1}
        </motion.div>
        {i < 3 && <div style={{ width: 2, flex: 1, minHeight: 40, background: `linear-gradient(${step.accent}40, transparent)`, marginTop: 8 }} />}
      </div>
      <div style={{ paddingTop: 8 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{step.title}</h3>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6 }}>{step.text}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────── TESTIMONIAL CARD ─────────────── */
function TestimonialCard({ t, i }: { t: typeof TESTIMONIALS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const rotations = [-2, 1, -1.5];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotate: rotations[i] }}
      animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: CARD, borderRadius: 20, padding: "32px 28px",
        border: "1px solid rgba(255,255,255,.05)", position: "relative",
        marginLeft: i > 0 ? -12 : 0, zIndex: 3 - i,
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: 12, left: 20, opacity: .06 }}>
        <Ico name="quote" size={48} color={BLUE} sw={1.5} />
      </div>
      <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.8, marginBottom: 20, position: "relative" }}>
        &ldquo;{t.text}&rdquo;
      </p>
      <div>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.name}</p>
        <p style={{ color: MUTED, fontSize: 12 }}>{t.role}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────── CSS ─────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;margin:0;padding:0}
h1,h2,h3,h4,.dsp{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.025em}
.mono{font-family:'JetBrains Mono',monospace}
html{scroll-behavior:smooth}
a,button{cursor:pointer}

@keyframes axDrift{0%,100%{transform:translate(0,0)}33%{transform:translate(25px,-40px)}66%{transform:translate(-20px,30px)}}
@keyframes axBreathe{0%,100%{opacity:.18;transform:scale(1)}50%{opacity:.35;transform:scale(1.12)}}
@keyframes axGrid{0%{background-position:0 0}100%{background-position:60px 60px}}
@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes axBlink{0%,100%{border-color:transparent}50%{border-color:${ORANGE}}}
@keyframes axOrbit{from{transform:rotate(var(--start)) translateX(var(--r)) rotate(calc(-1 * var(--start)))}to{transform:rotate(calc(var(--start) + 360deg)) translateX(var(--r)) rotate(calc(-1 * (var(--start) + 360deg)))}}

@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes axRotateGrad{to{--angle:360deg}}

@media(max-width:768px){
  .ax-g2{grid-template-columns:1fr!important}
  .ax-g3{grid-template-columns:1fr!important}
  .ax-g4{grid-template-columns:1fr 1fr!important}
  .ax-bento{grid-template-columns:1fr!important}
  .ax-bento>*{grid-column:span 1!important}
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-why{grid-template-columns:1fr!important}
  .ax-why>*{grid-column:span 1!important}
  .ax-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-orbit{display:none!important}
  .ax-track-row{flex-direction:column!important}
}
@media(max-width:480px){.ax-g4{grid-template-columns:1fr!important}}
`;

/* ─────────────── PARTICLES ─────────────── */
const PARTICLES = [
  { left: "8%", top: "12%", c: BLUE, s: 3, d: 22 },
  { left: "82%", top: "18%", c: GREEN, s: 4, d: 26 },
  { left: "28%", top: "48%", c: ORANGE, s: 3, d: 19 },
  { left: "90%", top: "52%", c: YELLOW, s: 3, d: 24 },
  { left: "5%", top: "68%", c: GREEN, s: 4, d: 28 },
  { left: "55%", top: "10%", c: BLUE, s: 3, d: 21 },
  { left: "72%", top: "78%", c: ORANGE, s: 3, d: 25 },
  { left: "18%", top: "85%", c: PURPLE, s: 3, d: 18 },
];

/* ─────────────── BADGE HELPER ─────────────── */
function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
      letterSpacing: ".06em", textTransform: "uppercase",
      color, background: `${color}12`, border: `1px solid ${color}25`,
    }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function AlgorithmXHome() {
  const heroWords = "The Future of Tech Education".split(" ");
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <SmoothScroll>
      <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden" }}>
        <style>{CSS}</style>

        {/* BG layers */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(96,165,250,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px", animation: "axGrid 25s linear infinite",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 25%,black 10%,transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 25%,black 10%,transparent 70%)",
        }} />
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: "absolute", left: p.left, top: p.top, width: p.s, height: p.s,
              borderRadius: "50%", background: p.c, opacity: .22,
              animation: `axDrift ${p.d}s ease-in-out ${-i * 2.5}s infinite`,
            }} />
          ))}
        </div>

        {/* ═══ 1. NAV ═══ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          background: "rgba(10,14,26,.6)", borderBottom: "1px solid rgba(255,255,255,.04)",
        }}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},${GREEN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="shield" size={18} sw={2.5} />
              </div>
              <span className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Algorithm<span style={{ color: BLUE }}>X</span></span>
            </Link>
            <div className="ax-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <a href="#subjects" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Subjects</a>
              <a href="#how" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How It Works</a>
              <Link href="/login" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Log In</Link>
              <Link href="/cyberheroes" style={{
                background: `linear-gradient(135deg,${ORANGE},#fb923c)`, color: "#fff",
                fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 100,
                textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}30`,
              }}>Get Started</Link>
            </div>
          </div>
        </nav>

        {/* ═══ 2. HERO ═══ */}
        <section ref={heroRef} style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 900, margin: "0 auto", padding: "160px 24px 80px" }}>
          {/* Breathing glow */}
          <div aria-hidden style={{
            position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
            width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", zIndex: -1,
            background: `radial-gradient(circle,${BLUE}20,transparent 70%)`,
            animation: "axBreathe 7s ease-in-out infinite",
          }} />

          {/* Orbital icons */}
          <div className="ax-orbit" aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 240, height: 240, zIndex: -1 }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${BLUE}20,${GREEN}20)`, border: `1px solid ${BLUE}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name="shield" size={24} color={`${BLUE}60`} />
            </div>
            {ORBIT_SUBJECTS.map((o, i) => (
              <div key={i} style={{
                position: "absolute", top: "50%", left: "50%",
                width: 0, height: 0,
                ["--r" as string]: `${o.r}px`,
                ["--start" as string]: `${o.start}deg`,
                animation: `axOrbit ${o.speed}s linear infinite`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `${o.color}12`, border: `1px solid ${o.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "translate(-50%,-50%)",
                  boxShadow: `0 0 20px ${o.color}15`,
                }}>
                  <Ico name={o.icon} size={16} color={`${o.color}80`} />
                </div>
              </div>
            ))}
          </div>

          {/* Word-by-word headline */}
          <h1 className="dsp" style={{ fontSize: "clamp(40px,6.5vw,68px)", fontWeight: 700, lineHeight: 1.06, color: "#fff", marginBottom: 28 }}>
            {heroWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "inline-block", marginRight: "0.3em",
                  ...(word === "Tech" || word === "Education" ? {
                    background: `linear-gradient(135deg,${BLUE},${GREEN})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  } : {}),
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Typewriter subtitle */}
          <Typewriter text="Six streams of technology education designed for ages 6 to adult. Built by experts. Interactive, not passive. Accreditation aligned." delay={1200} />

          {/* CTAs */}
          <motion.div
            className="ax-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.8, type: "spring", stiffness: 120, damping: 20 }}
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
          >
            <a href="#subjects" style={{
              background: `linear-gradient(135deg,${ORANGE},#fb923c)`, color: "#fff",
              fontSize: 15, fontWeight: 700, padding: "15px 34px", borderRadius: 100,
              textDecoration: "none", boxShadow: `0 8px 28px ${ORANGE}35`,
            }}>Explore Subjects</a>
            <a href="#how" style={{
              color: "#fff", fontSize: 15, fontWeight: 600,
              padding: "15px 34px", borderRadius: 100, textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,.12)",
            }}>How It Works</a>
          </motion.div>

          {/* Trust strip stagger */}
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {TRUST_STRIP.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 2.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 12, fontWeight: 600, letterSpacing: ".03em" }}
              >
                <Ico name="check" size={14} color={GREEN} sw={2.5} />{t}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ═══ 3. TRUST MARQUEE ═══ */}
        <div style={{
          position: "relative", zIndex: 1, padding: "26px 0",
          background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.04)", borderBottom: "1px solid rgba(255,255,255,.04)",
          overflow: "hidden",
          maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
        }}>
          <p style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(148,163,184,.4)", marginBottom: 14 }}>
            Curriculum Aligned with Industry-Leading Standards
          </p>
          <div style={{ display: "flex", animation: "axMarquee 32s linear infinite", width: "max-content" }}>
            {[0, 1].map((dup) => (
              <div key={dup} style={{ display: "flex", alignItems: "center", gap: 60, paddingRight: 60 }}>
                {TRUST_NAMES.map((n) => (
                  <span key={`${dup}-${n}`} style={{ fontSize: 14, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{n}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 4. STATS BENTO ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div className="ax-bento" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Large card — 6 Subjects */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                gridColumn: "span 2", padding: "36px 32px", borderRadius: 20,
                background: "rgba(17,24,39,.7)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <p className="dsp" style={{ fontSize: 56, fontWeight: 700, color: BLUE, marginBottom: 4 }}>
                <Counter to={6} />
              </p>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Technology Subjects</p>
              <div className="ax-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {SUBJECTS.map((s) => (
                  <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: `${s.accent}08`, border: `1px solid ${s.accent}15` }}>
                    <Ico name={s.icon} size={16} color={s.accent} />
                    <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>{s.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 18 Tracks */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "32px 28px", borderRadius: 20,
                background: "rgba(17,24,39,.7)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <p className="dsp" style={{ fontSize: 48, fontWeight: 700, color: GREEN }}><Counter to={18} /></p>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Individual Tracks</p>
              <p style={{ color: MUTED, fontSize: 13 }}>Age-appropriate courses within each subject</p>
            </motion.div>

            {/* Ages 6–Adult */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "32px 28px", borderRadius: 20,
                background: "rgba(17,24,39,.7)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <p className="dsp" style={{ fontSize: 48, fontWeight: 700, color: ORANGE }}>6–Adult</p>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Complete Age Range</p>
              <p style={{ color: MUTED, fontSize: 13 }}>From first steps online to professional certification</p>
            </motion.div>

            {/* Pricing bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                gridColumn: "span 2", padding: "24px 32px", borderRadius: 20,
                background: "rgba(17,24,39,.7)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.06)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap",
              }}
            >
              <span className="dsp" style={{ fontSize: 32, fontWeight: 700, color: YELLOW }}>£99</span>
              <span style={{ color: MUTED, fontSize: 15 }}>per course · Lifetime access · Continuously updated</span>
            </motion.div>
          </div>
        </section>

        {/* ═══ 5. SUBJECTS ═══ */}
        <section id="subjects" style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Badge color={BLUE}><Ico name="layers" size={14} color={BLUE} /> Subjects</Badge>
            </motion.div>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 12, marginTop: 16 }}>
              Everything They Need to Thrive in Tech
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
              Six streams of technology education — each with multiple age-appropriate tracks.
            </motion.p>
          </div>

          {/* Hero card: Cybersecurity */}
          {(() => {
            const s = SUBJECTS[0];
            return (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }}>
                <SpotlightCard accent={s.accent} style={{ padding: "36px 32px", marginBottom: 20 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, zIndex: 2 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${s.accent}15`, border: `1px solid ${s.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${s.accent}15` }}>
                        <Ico name={s.icon} size={26} color={s.accent} />
                      </div>
                      <div>
                        <h3 className="dsp" style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>{s.title}</h3>
                        <span className="mono" style={{ fontSize: 12, color: MUTED }}>{s.ages} · {s.tracks}</span>
                      </div>
                    </div>
                    <Badge color={GREEN}>{s.status}</Badge>
                  </div>
                  <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.7, marginBottom: 8, maxWidth: 700 }}>{s.desc}</p>
                  {s.extra && <p className="mono" style={{ fontSize: 12, color: `${s.accent}90`, marginBottom: 20 }}>{s.extra}</p>}
                  {/* Track row */}
                  <div className="ax-track-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    {s.trackList!.map((tr) => (
                      <div key={tr.name} style={{
                        flex: 1, minWidth: 160, padding: "12px 16px", borderRadius: 14,
                        background: "rgba(255,255,255,.03)", border: `1px solid ${tr.live ? `${GREEN}30` : "rgba(255,255,255,.06)"}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{tr.name}</span>
                          {tr.live ? <span style={{ fontSize: 9, fontWeight: 800, color: GREEN, background: `${GREEN}15`, padding: "2px 8px", borderRadius: 100, letterSpacing: ".05em" }}>LIVE</span>
                            : <span style={{ fontSize: 9, fontWeight: 700, color: MUTED }}>SOON</span>}
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: MUTED }}>{tr.age} · {tr.price}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={s.href} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: `linear-gradient(135deg,${ORANGE},#fb923c)`, color: "#fff",
                    fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 100,
                    textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}25`,
                  }}>
                    Explore Courses <Ico name="arrow" size={16} sw={2.5} />
                  </Link>
                </SpotlightCard>
              </motion.div>
            );
          })()}

          {/* Other 5 subjects */}
          <div className="ax-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {SUBJECTS.slice(1).map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <SpotlightCard accent={s.accent} style={{ padding: "28px 26px", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, zIndex: 2 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ico name={s.icon} size={22} color={s.accent} />
                    </div>
                    <Badge color={s.statusColor}>{s.status}</Badge>
                  </div>
                  <h3 className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{s.desc}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <span className="mono" style={{ fontSize: 11, color: MUTED, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,.04)" }}>{s.ages}</span>
                    <span className="mono" style={{ fontSize: 11, color: MUTED, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,.04)" }}>{s.tracks}</span>
                    {s.extra && <span className="mono" style={{ fontSize: 11, color: PINK, padding: "3px 10px", borderRadius: 6, background: `${PINK}08` }}>{s.extra}</span>}
                  </div>
                  <span style={{
                    display: "block", textAlign: "center",
                    color: "rgba(148,163,184,.5)", fontSize: 13, fontWeight: 600,
                    padding: "11px 0", borderRadius: 100,
                    background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)",
                  }}>Coming Soon</span>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ 6. HOW IT WORKS ═══ */}
        <section id="how" style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Badge color={GREEN}><Ico name="arrow" size={14} color={GREEN} /> Process</Badge>
            </motion.div>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginTop: 16 }}>
              Start Learning in Minutes
            </motion.h2>
          </div>
          {STEPS.map((s, i) => <TimelineStep key={i} step={s} i={i} />)}
        </section>

        {/* ═══ 7. WHY ALGORITHMX ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Badge color={ORANGE}><Ico name="zap" size={14} color={ORANGE} /> Why AlgorithmX</Badge>
            </motion.div>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginTop: 16 }}>
              Built Different
            </motion.h2>
          </div>

          <div className="ax-why" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
            {WHY.map((w, i) => {
              const spans = [
                { gridColumn: "1 / 2", gridRow: "1 / 2" },
                { gridColumn: "2 / 3", gridRow: "1 / 2" },
                { gridColumn: "1 / 2", gridRow: "2 / 3" },
                { gridColumn: "2 / 3", gridRow: "2 / 3" },
              ];
              const cols = i % 2 === 0 ? "3fr 2fr" : "2fr 3fr";
              return (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    ...spans[i],
                    background: CARD, borderRadius: 20, padding: "32px 28px",
                    border: "1px solid rgba(255,255,255,.05)", position: "relative", overflow: "hidden",
                    transition: `background .3s ${EASE}, border-color .3s ${EASE}`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.borderColor = `${w.accent}30`; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "rgba(255,255,255,.05)"; }}
                >
                  <div aria-hidden style={{ position: "absolute", top: -8, right: -8, opacity: .07 }}>
                    <Ico name={w.icon} size={80} color={w.accent} sw={1} />
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${w.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Ico name={w.icon} size={22} color={w.accent} />
                  </div>
                  <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{w.title}</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{w.text}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ═══ 8. TESTIMONIALS ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Badge color={YELLOW}><Ico name="quote" size={14} color={YELLOW} /> Testimonials</Badge>
            </motion.div>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginTop: 16 }}>
              What Parents &amp; Teachers Say
            </motion.h2>
          </div>
          <div className="ax-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} i={i} />)}
          </div>
        </section>

        {/* ═══ 9. FINAL CTA ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 680, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              borderRadius: 26, padding: 2,
              background: `conic-gradient(from var(--angle,0deg),${BLUE},${GREEN},${ORANGE},${YELLOW},${BLUE})`,
              animation: "axRotateGrad 4s linear infinite",
            }}
          >
            <div style={{
              background: CARD, borderRadius: 24, padding: "52px 36px", textAlign: "center",
            }}>
              <h2 className="dsp" style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#fff", marginBottom: 14 }}>
                Ready to Start?
              </h2>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>
                Choose a subject, pick your track, and begin your technology education journey today.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                <Link href="/cyberheroes" style={{
                  background: `linear-gradient(135deg,${ORANGE},#fb923c)`, color: "#fff",
                  fontSize: 14, fontWeight: 700, padding: "14px 30px", borderRadius: 100,
                  textDecoration: "none", boxShadow: `0 6px 20px ${ORANGE}30`,
                }}>Cyber Heroes Academy — Ages 6-10</Link>
                <a href="#subjects" style={{
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  padding: "14px 30px", borderRadius: 100, textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,.12)",
                }}>View All Subjects</a>
              </div>
              <p style={{ color: "rgba(148,163,184,.5)", fontSize: 12 }}>One-time payment · Lifetime access · 30-day money-back guarantee</p>
            </div>
          </motion.div>
        </section>

        {/* ═══ 10. FOOTER ═══ */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,.05)", padding: "56px 24px 40px", marginTop: 24,
        }}>
          <div className="ax-footer-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${BLUE},${GREEN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico name="shield" size={15} sw={2.5} />
                </div>
                <span className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Algorithm<span style={{ color: BLUE }}>X</span></span>
              </div>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>Technology Education for the Next Generation</p>
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Subjects</p>
              {[
                { name: "Cybersecurity", href: "/cyberheroes" },
                { name: "Game Dev", href: "#" },
                { name: "AI / ML", href: "#" },
                { name: "App Dev", href: "#" },
                { name: "Entrepreneurship", href: "#" },
                { name: "Robotics", href: "#" },
              ].map((l) => (
                <Link key={l.name} href={l.href} style={{ display: "block", color: MUTED, fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l.name}</Link>
              ))}
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Company</p>
              {["About Us", "For Parents", "Pricing", "Contact"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: MUTED, fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Legal</p>
              {["Privacy", "Terms", "Cookies", "Safeguarding"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: MUTED, fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l}</a>
              ))}
            </div>
          </div>
          <p style={{ color: "rgba(148,163,184,.3)", fontSize: 11, textAlign: "center", marginTop: 40 }}>
            &copy; 2026 AlgorithmX Ltd. Registered in England and Wales.
          </p>
        </footer>
      </div>
    </SmoothScroll>
  );
}

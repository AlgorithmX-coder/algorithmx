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

/* ─────────────── DATA ─────────────── */
const SUBJECTS = [
  {
    title: "Cybersecurity", icon: "shield", accent: GREEN, ages: "Ages 6–Adult", tracks: "4 tracks", status: "AVAILABLE NOW", statusColor: GREEN,
    desc: "Online safety, threat detection, ethical hacking, and digital defence — from foundational awareness through to penetration testing.",
    href: "/cyberheroes", live: true,
    trackList: [
      { name: "Cyber Heroes", age: "6-10", price: "£99", live: true },
      { name: "Cyber Explorers", age: "11-14", price: "£99", live: false },
      { name: "CyberStart", age: "15-17", price: "£99", live: false },
      { name: "CyberStart Pro", age: "18+", price: "£109", live: false },
    ],
  },
  { title: "Game Development", icon: "gamepad", accent: BLUE, ages: "Ages 8–Adult", tracks: "3 tracks", status: "Coming 2026", desc: "Game design, mechanics, coding, and publishing — from Scratch and block-based tools through to Unity and Unreal Engine.", href: "#", live: false },
  { title: "AI & Machine Learning", icon: "brain", accent: PURPLE, ages: "Ages 10–Adult", tracks: "3 tracks", status: "Coming 2026", desc: "Prompt engineering, model training, neural networks, and responsible AI — from playground tools through to Python and TensorFlow.", href: "#", live: false },
  { title: "App Development", icon: "code", accent: ORANGE, ages: "Ages 10–Adult", tracks: "3 tracks", status: "Coming 2027", desc: "Mobile and web applications — from no-code builders through to React, Swift, and full-stack development with deployment.", href: "#", live: false },
  { title: "Tech Entrepreneurship", icon: "rocket", accent: YELLOW, ages: "Ages 14–Adult", tracks: "2 tracks", status: "Coming 2027", desc: "Product thinking, lean startup methodology, pitch decks, financial modelling, and go-to-market strategy.", href: "#", live: false },
  { title: "Robotic Engineering", icon: "cpu", accent: PINK, ages: "Ages 8–Adult", tracks: "3 tracks", status: "Coming 2027", desc: "Hardware fundamentals, sensor integration, microcontrollers, and autonomous systems — from Lego Mindstorms to Arduino and ROS.", href: "#", live: false, extra: "UK Only · Kit Included" },
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

/* ─────────────── SVG ICONS ─────────────── */
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

/* ─────────────── COUNTER (CountUp effect) ─────────────── */
function Counter({ to, duration = 2000 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ─────────────── TEXT GENERATE EFFECT ─────────────── */
function TextGenerate({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <p ref={ref} style={{ fontSize: "clamp(15px, 1.5vw, 18px)", color: MUTED, lineHeight: 1.8, maxWidth: 620, margin: "0 auto 44px" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: delay + i * 0.06, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ─────────────── SPOTLIGHT CARD (mouse-tracking radial gradient) ─────────────── */
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
        transition: "transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s cubic-bezier(0.16,1,0.3,1), border-color .4s cubic-bezier(0.16,1,0.3,1)",
        transform: hovering ? "translateY(-6px)" : "none",
        boxShadow: hovering ? `0 20px 60px ${accent}15` : "none",
        willChange: "transform",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: hovering ? `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${accent}1e, transparent 60%)` : "none",
        transition: "background .15s ease",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
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

@keyframes axBreathe{0%,100%{opacity:.15;transform:translate(-50%,-50%) scale(1)}50%{opacity:.25;transform:translate(-50%,-50%) scale(1.1)}}
@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes axTestimonialScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes axUnderline{from{width:0}to{width:100%}}

@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes axRotateGrad{to{--angle:360deg}}

/* How It Works line draw */
@keyframes axLineDraw{from{width:0}to{width:100%}}

/* Testimonial pause on hover */
.ax-testimonial-track:hover{animation-play-state:paused!important}

@media(max-width:768px){
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-problem-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-problem-stat{justify-self:center}
  .ax-subjects-row3{grid-template-columns:1fr!important}
  .ax-subjects-row2{grid-template-columns:1fr!important}
  .ax-subjects-row2>*{flex:1!important}
  .ax-cyber-inner{flex-direction:column!important}
  .ax-cyber-tracks{min-width:0!important}
  .ax-steps-horizontal{flex-direction:column!important;align-items:flex-start!important}
  .ax-steps-line-h{display:none!important}
  .ax-steps-line-v{display:block!important}
  .ax-zigzag{flex-direction:column!important}
  .ax-zigzag-reverse{flex-direction:column!important}
  .ax-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-trust-items{flex-wrap:wrap;justify-content:center}
  .ax-nav-links a:not(:last-child){display:none}
}
`;

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function AlgorithmXHome() {
  const heroWords = "The Future of Tech Education".split(" ");
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  /* Problem section scroll reveal */
  const problemRef = useRef<HTMLDivElement>(null);
  const problemInView = useInView(problemRef, { once: true, margin: "-80px" });

  /* Underline animation */
  const underlineRef = useRef<HTMLDivElement>(null);
  const underlineInView = useInView(underlineRef, { once: true, margin: "-20px" });

  /* Steps section */
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  return (
    <SmoothScroll>
      <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden" }}>
        <style>{CSS}</style>

        {/* Subtle grid overlay — hero area only */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(96,165,250,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 40% at 50% 20%,black 10%,transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 40% at 50% 20%,black 10%,transparent 70%)",
        }} />

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
        <section ref={heroRef} style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 900, margin: "0 auto", padding: "160px 24px 48px", minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Single breathing radial glow */}
          <div aria-hidden style={{
            position: "absolute", top: "50%", left: "50%",
            width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: -1,
            background: `radial-gradient(circle,${BLUE}18,transparent 70%)`,
            animation: "axBreathe 8s ease-in-out infinite",
          }} />

          {/* BlurText headline — word-by-word blur reveal */}
          <h1 className="dsp" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 700, lineHeight: 1.06, color: "#fff", marginBottom: 28 }}>
            {heroWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                animate={heroInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "inline-block", marginRight: "0.3em", willChange: "transform, filter",
                  ...(word === "Tech" || word === "Education" ? {
                    background: `linear-gradient(135deg,${BLUE},${GREEN})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : {}),
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* TextGenerateEffect subtitle */}
          <TextGenerate
            text="Six streams of technology education for ages 6 to adult. Built by experts. Accreditation aligned."
            delay={0.9}
          />

          {/* Spring CTAs */}
          <motion.div
            className="ax-hero-ctas"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 2.0, type: "spring", stiffness: 120, damping: 20 }}
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

          {/* Trust strip — stagger from left */}
          <div className="ax-trust-items" style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {TRUST_STRIP.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 2.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 12, fontWeight: 600, letterSpacing: ".03em" }}
              >
                <Ico name="check" size={14} color={GREEN} sw={2.5} />{t}
              </motion.span>
            ))}
          </div>
        </section>

        {/* 48px breathing room */}
        <div style={{ height: 48 }} />

        {/* ═══ 3. TRUST MARQUEE ═══ */}
        <div style={{
          position: "relative", zIndex: 1, padding: "26px 0",
          background: "rgba(255,255,255,.02)", borderTop: "1px solid rgba(255,255,255,.04)", borderBottom: "1px solid rgba(255,255,255,.04)",
          overflow: "hidden",
          maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
        }}>
          <p style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(148,163,184,.4)", marginBottom: 14 }}>
            Curriculum Aligned with Industry Standards
          </p>
          <div style={{ display: "flex", animation: "axMarquee 40s linear infinite", width: "max-content" }}>
            {[0, 1].map((dup) => (
              <div key={dup} style={{ display: "flex", alignItems: "center", gap: 60, paddingRight: 60 }}>
                {TRUST_NAMES.map((n) => (
                  <span key={`${dup}-${n}`} style={{ fontSize: 14, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{n}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 4. THE PROBLEM ═══ */}
        <section ref={problemRef} style={{ position: "relative", zIndex: 1, padding: "140px 24px 80px", maxWidth: 1060, margin: "0 auto" }}>
          <div className="ax-problem-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Left — emotional text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={problemInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="dsp" style={{ fontSize: "clamp(32px,4vw,44px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 24 }}>
                The Internet Wasn&rsquo;t Built for Kids
              </h2>
              <p style={{ color: MUTED, fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.8 }}>
                72% of children encounter online threats before age 10. Schools barely scratch the surface. Parental controls can only do so much. Children need the knowledge and instincts to protect themselves — and they need to learn it in a way that actually sticks.
              </p>
            </motion.div>

            {/* Right — massive stat */}
            <motion.div
              className="ax-problem-stat"
              initial={{ opacity: 0, x: 50 }}
              animate={problemInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ textAlign: "center" }}
            >
              <p className="dsp" style={{ fontSize: "clamp(96px,12vw,140px)", fontWeight: 700, color: RED, lineHeight: 1 }}>
                <Counter to={72} duration={2000} />
                <span style={{ fontSize: "0.5em" }}>%</span>
              </p>
              <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>of children face online threats before age 10</p>
            </motion.div>
          </div>

          {/* Centred tagline with animated underline */}
          <div ref={underlineRef} style={{ textAlign: "center", marginTop: 64 }}>
            <p className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff", display: "inline-block", position: "relative" }}>
              That&rsquo;s why we built AlgorithmX.
              <span style={{
                position: "absolute", bottom: -6, left: 0, height: 2,
                background: `linear-gradient(90deg,${BLUE},${GREEN})`,
                borderRadius: 2,
                width: underlineInView ? "100%" : "0%",
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </p>
          </div>
        </section>

        {/* ═══ 5. SUBJECTS ═══ */}
        <section id="subjects" style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(32px,4.5vw,48px)", fontWeight: 700, color: "#fff", lineHeight: 1.12, marginBottom: 14 }}>
              Everything They Need to Thrive in Tech
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              Six streams of technology education — each with multiple age-appropriate tracks.
            </motion.p>
          </div>

          {/* Row 1: Cybersecurity FULL-WIDTH hero card */}
          {(() => {
            const s = SUBJECTS[0];
            return (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }}
                style={{ marginBottom: 20 }}
              >
                <SpotlightCard accent={s.accent} style={{
                  padding: "36px 32px", minHeight: 280,
                  boxShadow: `0 0 80px rgba(52,211,153,0.06)`,
                }}>
                  {/* Green top accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, zIndex: 2 }} />

                  {/* AVAILABLE NOW badge */}
                  <div style={{ position: "absolute", top: 20, right: 24, zIndex: 2 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "5px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                      letterSpacing: ".06em", textTransform: "uppercase",
                      color: GREEN, background: `${GREEN}12`, border: `1px solid ${GREEN}25`,
                    }}>AVAILABLE NOW</span>
                  </div>

                  <div className="ax-cyber-inner" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                    {/* Left: icon + title + desc */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 16,
                          background: `${s.accent}15`, border: `1px solid ${s.accent}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 0 30px ${s.accent}15`,
                        }}>
                          <Ico name={s.icon} size={26} color={s.accent} />
                        </div>
                        <div>
                          <h3 className="dsp" style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>{s.title}</h3>
                          <span className="mono" style={{ fontSize: 12, color: MUTED }}>{s.ages} · {s.tracks}</span>
                        </div>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>{s.desc}</p>
                      <Link href={s.href} style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: `linear-gradient(135deg,${ORANGE},#fb923c)`, color: "#fff",
                        fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 100,
                        textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}25`,
                      }}>
                        Explore Courses <Ico name="arrow" size={16} sw={2.5} />
                      </Link>
                    </div>

                    {/* Right: 4 track pills */}
                    <div className="ax-cyber-tracks" style={{ minWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
                      {s.trackList!.map((tr) => (
                        <div key={tr.name} style={{
                          padding: "12px 16px", borderRadius: 14,
                          background: "rgba(255,255,255,.03)", border: `1px solid ${tr.live ? `${GREEN}30` : "rgba(255,255,255,.06)"}`,
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div>
                            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{tr.name}</span>
                            <span className="mono" style={{ fontSize: 11, color: MUTED, marginLeft: 10 }}>{tr.age}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="mono" style={{ fontSize: 12, color: MUTED }}>{tr.price}</span>
                            {tr.live
                              ? <span style={{ fontSize: 9, fontWeight: 800, color: GREEN, background: `${GREEN}15`, padding: "2px 8px", borderRadius: 100, letterSpacing: ".05em" }}>LIVE</span>
                              : <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, opacity: 0.6 }}>COMING</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })()}

          {/* Row 2: 3 cards — Game Dev (1.2), AI/ML (1), App Dev (1) */}
          <div className="ax-subjects-row2" style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            {SUBJECTS.slice(1, 4).map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ flex: i === 0 ? 1.2 : 1 }}
              >
                <SpotlightCard accent={s.accent} style={{ padding: "28px 24px", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, zIndex: 2 }} />
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${s.accent}12`, border: `1px solid ${s.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                  }}>
                    <Ico name={s.icon} size={24} color={s.accent} />
                  </div>
                  <h3 className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                  <p className="mono" style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>{s.ages} · {s.tracks}</p>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, color: YELLOW,
                    background: `${YELLOW}10`, padding: "4px 12px", borderRadius: 100,
                    letterSpacing: ".04em", opacity: 0.7,
                  }}>{s.status}</span>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          {/* Row 3: 2 cards — Entrepreneurship + Robotics */}
          <div className="ax-subjects-row3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {SUBJECTS.slice(4).map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <SpotlightCard accent={s.accent} style={{ padding: "28px 24px", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, zIndex: 2 }} />
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${s.accent}12`, border: `1px solid ${s.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                  }}>
                    <Ico name={s.icon} size={24} color={s.accent} />
                  </div>
                  <h3 className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                  <p className="mono" style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>{s.ages} · {s.tracks}</p>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      display: "inline-block", fontSize: 11, fontWeight: 700, color: YELLOW,
                      background: `${YELLOW}10`, padding: "4px 12px", borderRadius: 100,
                      letterSpacing: ".04em", opacity: 0.7,
                    }}>{s.status}</span>
                    {s.extra && (
                      <span style={{
                        display: "inline-block", fontSize: 11, fontWeight: 700, color: PINK,
                        background: `${PINK}10`, padding: "4px 12px", borderRadius: 100,
                      }}>{s.extra}</span>
                    )}
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ 6. HOW IT WORKS — horizontal step flow ═══ */}
        <section id="how" style={{ position: "relative", zIndex: 1, padding: "160px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
              Start Learning in Minutes
            </motion.h2>
          </div>

          <div ref={stepsRef} className="ax-steps-horizontal" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            {/* Connecting horizontal line */}
            <div className="ax-steps-line-h" style={{
              position: "absolute", top: 28, left: 28, right: 28, height: 3, zIndex: 0,
              background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: `linear-gradient(90deg,${BLUE},${GREEN},${ORANGE},${YELLOW})`,
                width: stepsInView ? "100%" : "0%",
                transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>

            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={stepsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15, type: "spring", stiffness: 200, damping: 15 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, position: "relative", zIndex: 1 }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `${step.accent}18`, border: `2px solid ${step.accent}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, willChange: "transform",
                }}>
                  <span className="dsp" style={{ fontSize: 22, fontWeight: 700, color: step.accent }}>{i + 1}</span>
                </div>
                <h3 className="dsp" style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{step.title}</h3>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, maxWidth: 180 }}>{step.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Vertical line for mobile — hidden on desktop */}
          <div className="ax-steps-line-v" style={{ display: "none" }} />
        </section>

        {/* ═══ 7. WHY ALGORITHMX — zigzag layout ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
              Built Different
            </motion.h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
            {WHY.map((w, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={w.title}
                  className={isEven ? "ax-zigzag" : "ax-zigzag ax-zigzag-reverse"}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "flex", gap: 40, alignItems: "center",
                    flexDirection: isEven ? "row" : "row-reverse",
                    position: "relative",
                  }}
                >
                  {/* Decorative background icon */}
                  <div aria-hidden style={{
                    position: "absolute",
                    [isEven ? "right" : "left"]: -20,
                    top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none",
                  }}>
                    <Ico name={w.icon} size={200} color={w.accent} sw={1} />
                  </div>

                  {/* Icon circle */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: `${w.accent}12`, border: `1px solid ${w.accent}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ico name={w.icon} size={28} color={w.accent} />
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="dsp" style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{w.title}</h3>
                    <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>{w.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ═══ 8. TESTIMONIALS — infinite marquee ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 0", background: "rgba(255,255,255,.01)" }}>
          <div style={{ textAlign: "center", marginBottom: 48, padding: "0 24px" }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
              What Parents &amp; Teachers Say
            </motion.h2>
          </div>

          <div style={{
            overflow: "hidden",
            maskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)",
            WebkitMaskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)",
          }}>
            <div className="ax-testimonial-track" style={{
              display: "flex", gap: 24, width: "max-content",
              animation: "axTestimonialScroll 40s linear infinite",
            }}>
              {/* Duplicate set for seamless loop */}
              {[0, 1].map((dup) =>
                TESTIMONIALS.map((t, i) => (
                  <div key={`${dup}-${i}`} style={{
                    width: 340, flexShrink: 0, background: CARD, borderRadius: 20,
                    padding: "32px 28px", border: "1px solid rgba(255,255,255,.05)",
                    position: "relative",
                  }}>
                    {/* Decorative quote mark */}
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
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ═══ 9. FINAL CTA — rotating gradient border ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 680, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              borderRadius: 28, padding: 2,
              background: `conic-gradient(from var(--angle,0deg),${BLUE},${GREEN},${ORANGE},${YELLOW},${BLUE})`,
              animation: "axRotateGrad 4s linear infinite",
            }}
          >
            <div style={{
              background: CARD, borderRadius: 26, padding: "56px 36px", textAlign: "center",
            }}>
              <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: "#fff", marginBottom: 14 }}>
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

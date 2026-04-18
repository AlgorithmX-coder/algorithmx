"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import SmoothScroll from "@/app/components/SmoothScroll";

/* ─────────────── TOKENS ─────────────── */
const BG = "#080c14";
const CARD = "#0f1525";
const PURPLE = "#8b5cf6";
const CYAN = "#22d3ee";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const MUTED = "#94a3b8";
const BLUE = "#60a5fa";
const GREEN = "#34d399";
const ORANGE = "#f97316";

/* ─────────────── WEEK DATA ─────────────── */
const WEEKS = [
  { week: 1, title: "Digital Identity & Footprint", desc: "Your online presence is permanent — learn to control it" },
  { week: 2, title: "Password Security & Authentication", desc: "Beyond \"password123\" — hashing, 2FA, and password managers" },
  { week: 3, title: "Phishing & Social Engineering", desc: "How hackers manipulate people, not just machines" },
  { week: 4, title: "Network Fundamentals", desc: "IP addresses, Wi-Fi security, VPNs — how data travels" },
  { week: 5, title: "Encryption & Secure Communication", desc: "Caesar ciphers to modern encryption — keeping secrets safe" },
  { week: 6, title: "Malware & Threat Landscape", desc: "Viruses, ransomware, trojans — how they work and how to stop them" },
  { week: 7, title: "Social Media Security", desc: "Privacy settings, data harvesting, deepfakes, and digital manipulation" },
  { week: 8, title: "Safe Browsing & OSINT", desc: "How to verify information and spot misinformation online" },
  { week: 9, title: "Ethical Hacking Introduction", desc: "White hat vs black hat, bug bounties, responsible disclosure" },
  { week: 10, title: "Incident Response", desc: "What to do when things go wrong — the cyber emergency plan" },
  { week: 11, title: "CTF Challenge Week", desc: "Capture The Flag — apply everything you've learned in a live challenge" },
  { week: 12, title: "Certification & Graduation", desc: "Final assessment, portfolio review, CyberFirst-aligned certificate" },
];

const FEATURES = [
  { title: "Real-World Simulations", desc: "Practice in safe mock environments. Spot phishing emails, crack weak passwords, trace network traffic.", icon: "terminal" },
  { title: "CTF Challenges", desc: "Capture The Flag competitions test your skills against real scenarios used in industry training.", icon: "flag" },
  { title: "Portfolio Projects", desc: "Build a cybersecurity portfolio you can show to schools, colleges, and future employers.", icon: "folder" },
];

const PATHWAY = [
  { name: "Cyber Heroes", ages: "Ages 6-10", color: GREEN, status: "LIVE", href: "/cyberheroes" },
  { name: "Cyber Explorers", ages: "Ages 11-14", color: PURPLE, status: "YOU ARE HERE", href: "#", active: true },
  { name: "CyberStart", ages: "Ages 15-17", color: ORANGE, status: "Coming Soon", href: "#" },
  { name: "CyberStart Pro", ages: "Ages 18+", color: AMBER, status: "Coming 2027", href: "#" },
];

const SKILLS = [
  { title: "Ethical Hacking Fundamentals", desc: "Reconnaissance, scanning, exploitation — the methodology behind every penetration test.", span: 2, accent: PURPLE, terminal: "$ nmap -sV target.local\n$ nikto -h 192.168.1.1\n$ hashcat -m 0 hash.txt" },
  { title: "Network Security", desc: "Understanding how data moves, where it's vulnerable, and how to lock it down.", span: 1, accent: CYAN },
  { title: "Cryptography Basics", desc: "Encryption, hashing, ciphers — the maths that keeps secrets safe.", span: 1, accent: EMERALD },
  { title: "Threat Detection & Response", desc: "Spotting anomalies, analyzing logs, and building an incident response playbook.", span: 2, accent: PURPLE, terminal: "$ tail -f /var/log/auth.log\n[ALERT] brute-force detected\n$ sudo fail2ban-client status" },
  { title: "OSINT & Research", desc: "Open-source intelligence gathering and verification techniques.", span: 1, accent: CYAN },
  { title: "Digital Forensics Intro", desc: "Evidence preservation, disk imaging, and basic forensic analysis.", span: 1, accent: EMERALD },
];

const PARENT_FACTS = [
  "12 weeks, 1 hour per week",
  "£99 one-time, lifetime access",
  "CyberFirst & ASDAN aligned",
  "30-day money-back guarantee",
  "No prior knowledge required",
  "Parent progress dashboard",
];

/* ─────────────── HEX RAIN DATA ─────────────── */
const HEX_RAIN = [
  { text: "0x4F", left: 5, top: 8, size: 11, opacity: 0.04, duration: 42, delay: -8, rot: -3, color: PURPLE },
  { text: "0xA3", left: 15, top: 55, size: 12, opacity: 0.03, duration: 38, delay: -22, rot: 5, color: CYAN },
  { text: "0xFF", left: 28, top: 30, size: 10, opacity: 0.04, duration: 50, delay: -15, rot: -7, color: PURPLE },
  { text: "10110", left: 42, top: 72, size: 11, opacity: 0.03, duration: 35, delay: -40, rot: 2, color: EMERALD },
  { text: "0xDE", left: 55, top: 18, size: 13, opacity: 0.04, duration: 44, delay: -5, rot: -4, color: CYAN },
  { text: "01001", left: 68, top: 85, size: 10, opacity: 0.03, duration: 48, delay: -30, rot: 8, color: PURPLE },
  { text: "0xBE", left: 78, top: 42, size: 12, opacity: 0.04, duration: 40, delay: -18, rot: -6, color: CYAN },
  { text: "11010", left: 88, top: 65, size: 11, opacity: 0.03, duration: 52, delay: -35, rot: 3, color: EMERALD },
  { text: "0x7C", left: 35, top: 90, size: 10, opacity: 0.04, duration: 46, delay: -12, rot: -5, color: PURPLE },
  { text: "0xAD", left: 92, top: 15, size: 12, opacity: 0.03, duration: 36, delay: -25, rot: 6, color: CYAN },
  { text: "00111", left: 8, top: 45, size: 11, opacity: 0.04, duration: 55, delay: -42, rot: -2, color: EMERALD },
  { text: "0xF0", left: 62, top: 35, size: 10, opacity: 0.03, duration: 43, delay: -20, rot: 4, color: PURPLE },
  { text: "10001", left: 48, top: 78, size: 12, opacity: 0.04, duration: 39, delay: -33, rot: -8, color: CYAN },
  { text: "0x5A", left: 22, top: 62, size: 11, opacity: 0.03, duration: 47, delay: -10, rot: 7, color: EMERALD },
  { text: "0xC8", left: 75, top: 25, size: 10, opacity: 0.04, duration: 41, delay: -28, rot: -1, color: PURPLE },
];

/* ─────────────── SVG ICONS ─────────────── */
const ICON_PATHS: Record<string, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  folder: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
};
const ICON_RECTS: Record<string, [number, number, number, number, number]> = {
  terminal: [3, 3, 18, 18, 2],
};

function Ico({ name, size = 24, color = "#fff", sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const r = ICON_RECTS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {r && <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />}
      <path d={ICON_PATHS[name] || ICON_PATHS.shield} />
    </svg>
  );
}

/* ─────────────── SPOTLIGHT CARD ─────────────── */
function SpotlightCard({ children, accent, style, className }: { children: React.ReactNode; accent: string; style?: React.CSSProperties; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  return (
    <div ref={cardRef} className={className} onMouseMove={handleMove} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      style={{
        position: "relative", overflow: "hidden", background: CARD, borderRadius: 16,
        border: `1px solid ${hovering ? `${accent}40` : "rgba(255,255,255,.06)"}`,
        transition: "transform .3s ease, box-shadow .3s ease, border-color .3s ease",
        transform: hovering ? "translateY(-4px)" : "none",
        boxShadow: hovering ? `0 12px 40px ${accent}12` : "none",
        willChange: "transform", ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: hovering ? `radial-gradient(250px circle at ${pos.x}px ${pos.y}px, ${accent}12, transparent 60%)` : "none", transition: "background .15s ease" }} />
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

/* Scanline overlay */
.ce-scanlines::after{
  content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);
}

/* Glitch text */
@keyframes ceGlitch{
  0%,97%,100%{clip-path:none;transform:none}
  97.5%{clip-path:inset(20% 0 40% 0);transform:translate(-2px,1px)}
  98%{clip-path:inset(50% 0 10% 0);transform:translate(2px,-1px)}
  98.5%{clip-path:inset(10% 0 60% 0);transform:translate(-1px,2px)}
  99%{clip-path:none;transform:none}
}
.ce-glitch{position:relative;animation:ceGlitch 5s linear infinite}
.ce-glitch::before,.ce-glitch::after{
  content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;
  pointer-events:none;opacity:0;
}
.ce-glitch::before{color:#ff0040;animation:ceGlitchBefore 5s linear infinite}
.ce-glitch::after{color:#0ff;animation:ceGlitchAfter 5s linear infinite}
@keyframes ceGlitchBefore{
  0%,97%,100%{opacity:0;transform:none}
  97.5%,99%{opacity:0.7;transform:translate(-2px,0)}
}
@keyframes ceGlitchAfter{
  0%,97%,100%{opacity:0;transform:none}
  97.5%,99%{opacity:0.7;transform:translate(2px,0)}
}

/* Hex rain float */
@keyframes ceHexFloat{from{transform:translateY(0) rotate(var(--rot))}to{transform:translateY(-120vh) rotate(var(--rot))}}

/* Pulse glow */
@keyframes cePulse{0%,100%{box-shadow:0 0 15px ${PURPLE}20,0 0 30px ${PURPLE}10}50%{box-shadow:0 0 25px ${PURPLE}40,0 0 50px ${PURPLE}20}}

/* Pathway line draw */
@keyframes ceLineDraw{from{width:0}to{width:100%}}

@media(max-width:768px){
  .ce-weeks-grid{grid-template-columns:1fr!important}
  .ce-features-row{flex-direction:column!important}
  .ce-pathway-h{flex-direction:column!important;align-items:flex-start!important}
  .ce-pathway-line{display:none!important}
  .ce-skills-grid{grid-template-columns:1fr!important}
  .ce-skills-grid>*{grid-column:span 1!important}
  .ce-parent-grid{grid-template-columns:1fr!important}
  .ce-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ce-hero-ctas{flex-direction:column;align-items:center}
  .ce-nav-links a:not(:last-child){display:none}
}
@media(min-width:769px) and (max-width:1024px){
  .ce-weeks-grid{grid-template-columns:1fr 1fr!important}
}
`;

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function CyberExplorersPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const pathwayRef = useRef<HTMLDivElement>(null);
  const pathwayInView = useInView(pathwayRef, { once: true, margin: "-80px" });

  return (
    <SmoothScroll>
      <div className="ce-scanlines" style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden" }}>
        <style>{CSS}</style>

        {/* Purple accent line at top */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 101, background: `linear-gradient(90deg,${PURPLE},${CYAN})` }} />

        {/* Hex rain background */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          {HEX_RAIN.map((h, i) => (
            <span key={i} className="mono" style={{
              position: "absolute", left: `${h.left}%`, top: `${h.top}%`,
              fontSize: h.size, opacity: h.opacity, color: h.color, whiteSpace: "nowrap",
              ["--rot" as string]: `${h.rot}deg`,
              animation: `ceHexFloat ${h.duration}s linear ${h.delay}s infinite`,
            }}>
              {h.text}
            </span>
          ))}
        </div>

        {/* ═══ 1. NAV ═══ */}
        <nav style={{
          position: "fixed", top: 2, left: 0, right: 0, zIndex: 100,
          backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          background: "rgba(8,12,20,.75)", borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},${GREEN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="shield" size={18} sw={2.5} />
              </div>
              <span className="dsp" style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Algorithm<span style={{ color: BLUE }}>X</span></span>
            </Link>
            <div className="ce-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <a href="/#subjects" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Subjects</a>
              <a href="/#how" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How It Works</a>
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
        <section ref={heroRef} style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "140px 24px 80px", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Radial glow */}
          <div aria-hidden style={{
            position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
            width: 700, height: 700, borderRadius: "50%", pointerEvents: "none", zIndex: -1,
            background: `radial-gradient(circle,${PURPLE}14,transparent 70%)`,
          }} />

          {/* Terminal breadcrumb */}
          <motion.p className="mono" initial={{ opacity: 0, x: -20 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
            style={{ fontSize: 12, color: PURPLE, marginBottom: 24 }}>
            {"> algorithmx / cybersecurity / explorers_"}
          </motion.p>

          {/* Glitch heading */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="dsp ce-glitch" data-text="CYBER EXPLORERS" style={{ fontSize: "clamp(48px,8vw,80px)", fontWeight: 700, lineHeight: 1.05, color: "#fff", marginBottom: 16, letterSpacing: "-0.03em" }}>
              CYBER EXPLORERS
            </h1>
          </motion.div>

          {/* Age badge */}
          <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginBottom: 20 }}>
            <span style={{
              display: "inline-block", padding: "6px 18px", borderRadius: 100,
              background: `${PURPLE}18`, border: `1px solid ${PURPLE}40`,
              color: PURPLE, fontSize: 13, fontWeight: 700, letterSpacing: ".04em",
            }}>Ages 11-14</span>
          </motion.div>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 10 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }}
            style={{ fontSize: 18, color: MUTED, lineHeight: 1.7, maxWidth: 560, marginBottom: 32 }}>
            Go beyond the basics. Learn how the internet really works — and how to protect yourself in it.
          </motion.p>

          {/* COMING SOON badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={heroInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: 0.6 }}
            style={{ marginBottom: 20 }}>
            <span className="mono" style={{
              display: "inline-block", padding: "10px 28px", borderRadius: 12,
              border: `1.5px solid ${PURPLE}60`, color: PURPLE, fontSize: 14, fontWeight: 700,
              letterSpacing: ".1em", textTransform: "uppercase",
              animation: "cePulse 3s ease-in-out infinite",
            }}>COMING SOON</span>
          </motion.div>

          {/* Course details */}
          <motion.p className="mono" initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.7 }}
            style={{ fontSize: 13, color: MUTED, marginBottom: 32, letterSpacing: ".02em" }}>
            12 Weeks &middot; 1 Hour/Week &middot; &pound;99 &middot; Lifetime Access
          </motion.p>

          {/* CTA */}
          <motion.div className="ce-hero-ctas" initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `linear-gradient(135deg,${PURPLE}60,${CYAN}60)`, color: "rgba(255,255,255,.5)",
              fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
              cursor: "not-allowed", opacity: 0.7,
            }}>Join the Waitlist</span>
            <span className="mono" style={{ fontSize: 12, color: MUTED }}>Coming 2026</span>
          </motion.div>
        </section>

        {/* ═══ 3. WHAT YOU'LL LEARN ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <motion.p className="mono" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontSize: 12, color: PURPLE, marginBottom: 12, letterSpacing: ".08em" }}>
            [MODULE_OVERVIEW]
          </motion.p>
          <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 48 }}>
            12 Weeks of Real Cybersecurity Skills
          </motion.h2>

          <div className="ce-weeks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {WEEKS.map((w, i) => (
              <motion.div
                key={w.week}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                style={{
                  background: CARD, borderRadius: 14, padding: "22px 20px",
                  borderLeft: `3px solid ${PURPLE}60`,
                  border: `1px solid rgba(255,255,255,.06)`,
                  borderLeftWidth: 3, borderLeftColor: `${PURPLE}60`,
                  position: "relative", overflow: "hidden",
                  transition: "transform .3s ease, box-shadow .3s ease, border-color .3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 30px ${PURPLE}15`;
                  e.currentTarget.style.borderLeftColor = PURPLE;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderLeftColor = `${PURPLE}60`;
                }}
              >
                {/* Large week number background */}
                <span className="mono" aria-hidden style={{
                  position: "absolute", top: 8, right: 12, fontSize: 40, fontWeight: 700,
                  color: PURPLE, opacity: 0.08, lineHeight: 1, pointerEvents: "none",
                }}>{String(w.week).padStart(2, "0")}</span>

                <p className="mono" style={{ fontSize: 10, color: PURPLE, marginBottom: 6, letterSpacing: ".06em" }}>
                  WEEK {String(w.week).padStart(2, "0")}
                </p>
                <h3 className="dsp" style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{w.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ 4. WHAT MAKES THIS DIFFERENT ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", background: "rgba(255,255,255,.02)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 48, textAlign: "center" }}>
              Not Your School&rsquo;s IT Lesson
            </motion.h2>

            <div className="ce-features-row" style={{ display: "flex", gap: 24 }}>
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
                    background: `linear-gradient(135deg,${PURPLE}20,${CYAN}20)`,
                    border: `1px solid ${PURPLE}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Ico name={f.icon} size={24} color={PURPLE} />
                  </div>
                  <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 5. THE PATHWAY ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 56, textAlign: "center" }}>
            Your Cybersecurity Pathway
          </motion.h2>

          <div ref={pathwayRef} className="ce-pathway-h" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            {/* Connecting line */}
            <div className="ce-pathway-line" style={{
              position: "absolute", top: 20, left: 20, right: 20, height: 3, zIndex: 0,
              background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: `linear-gradient(90deg,${GREEN},${PURPLE},${ORANGE},${AMBER})`,
                width: pathwayInView ? "100%" : "0%",
                transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>

            {PATHWAY.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={pathwayInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15, type: "spring", stiffness: 180, damping: 15 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, position: "relative", zIndex: 1 }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: p.active ? p.color : `${p.color}20`,
                  border: `2px solid ${p.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12,
                  boxShadow: p.active ? `0 0 20px ${p.color}40, 0 0 40px ${p.color}20` : "none",
                }}>
                  {p.active && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <h3 className="dsp" style={{ fontSize: 15, fontWeight: 700, color: p.active ? "#fff" : MUTED, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>{p.ages}</p>
                <span className="mono" style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                  color: p.active ? PURPLE : p.color,
                  padding: "3px 10px", borderRadius: 100,
                  background: p.active ? `${PURPLE}20` : "transparent",
                  border: p.active ? `1px solid ${PURPLE}40` : "none",
                }}>{p.status}</span>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ textAlign: "center", color: MUTED, fontSize: 14, marginTop: 48, lineHeight: 1.7 }}>
            Complete the full pathway to earn your CyberFirst-aligned Master Certificate
          </motion.p>
        </section>

        {/* ═══ 6. SKILLS YOU'LL GAIN ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 48, textAlign: "center" }}>
            Skills You&rsquo;ll Gain
          </motion.h2>

          <div className="ce-skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {SKILLS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                style={{ gridColumn: `span ${s.span}` }}
              >
                <SpotlightCard accent={s.accent} style={{ padding: "24px 22px", height: "100%" }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${s.accent},transparent)`, borderRadius: 2, marginBottom: 16 }} />
                  <h3 className="dsp" style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: s.terminal ? 16 : 0 }}>{s.desc}</p>
                  {s.terminal && (
                    <div style={{
                      background: "rgba(0,0,0,.4)", borderRadius: 10, padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,.06)",
                    }}>
                      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: EMERALD }} />
                      </div>
                      <pre className="mono" style={{ fontSize: 11, color: EMERALD, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                        {s.terminal}
                      </pre>
                    </div>
                  )}
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ 7. FOR PARENTS ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", background: "rgba(255,255,255,.02)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <motion.h2 className="dsp" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 40 }}>
              What Parents Need to Know
            </motion.h2>

            <div className="ce-parent-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "start" }}>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.8 }}>
                  Cyber Explorers bridges the gap between basic online safety and real cybersecurity skills. Designed for 11-14 year olds who are ready for more than &ldquo;don&rsquo;t talk to strangers.&rdquo; Every lesson is supervised, age-appropriate, and aligned with CyberFirst and ASDAN frameworks.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PARENT_FACTS.map((fact) => (
                    <div key={fact} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Ico name="check" size={16} color={EMERALD} sw={2.5} />
                      <span style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 500 }}>{fact}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 8. FINAL CTA ═══ */}
        <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, color: "#fff", marginBottom: 14 }}>
              Ready to Level Up?
            </h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
              Cyber Explorers launches in 2026. Join the waitlist to get early access and a launch discount.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <a href="#" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg,${PURPLE},${CYAN})`, color: "#fff",
                fontSize: 15, fontWeight: 700, padding: "15px 36px", borderRadius: 100,
                textDecoration: "none", boxShadow: `0 8px 28px ${PURPLE}35`,
              }}>Join Waitlist</a>
              <Link href="/cyberheroes" style={{ color: MUTED, fontSize: 14, textDecoration: "none" }}>
                Or explore <span style={{ color: EMERALD, fontWeight: 600 }}>Cyber Heroes Academy</span> for Ages 6-10 &rarr;
              </Link>
              <p className="mono" style={{ color: "rgba(148,163,184,.5)", fontSize: 12, marginTop: 8 }}>
                &pound;99 &middot; Lifetime Access &middot; 30-Day Guarantee
              </p>
            </div>
          </motion.div>
        </section>

        {/* ═══ 9. FOOTER ═══ */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,.06)", padding: "56px 24px 40px", marginTop: 24,
        }}>
          <div className="ce-footer-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
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

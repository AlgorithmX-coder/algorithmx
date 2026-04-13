"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

/* ─── ANIMATED TECH BACKGROUND ─── */
function TechBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -40; } }
        @keyframes dataStream { from { left: -300px; } to { left: 100vw; } }
        @keyframes binaryFall { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes cyberFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(8deg); } }
        @keyframes codeRainCH { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes gridPulse { 0%,100% { opacity: 0.06; } 50% { opacity: 0.12; } }
        @keyframes scanLine { from { transform: translateY(-100vh); } to { transform: translateY(100vh); } }
        @keyframes sparkle { 0%,100% { opacity: 0; } 50% { opacity: 0.6; } }
        @keyframes hexPulse { 0%,100% { fill: rgba(139,92,246,0); } 50% { fill: rgba(139,92,246,0.08); } }
      `}</style>

      {/* Layer 5: Animated grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        animation: "gridPulse 8s ease-in-out infinite",
      }} />

      {/* Layer 1: Circuit board lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 0 4px rgba(139,92,246,0.3))" }}>
        {[
          { x1: "0", y1: "20%", x2: "100%", y2: "20%", c: "#8b5cf6" },
          { x1: "0", y1: "40%", x2: "100%", y2: "40%", c: "#3b82f6" },
          { x1: "0", y1: "60%", x2: "100%", y2: "60%", c: "#8b5cf6" },
          { x1: "0", y1: "80%", x2: "100%", y2: "80%", c: "#3b82f6" },
          { x1: "15%", y1: "0", x2: "15%", y2: "100%", c: "#8b5cf6" },
          { x1: "35%", y1: "0", x2: "35%", y2: "100%", c: "#3b82f6" },
          { x1: "65%", y1: "0", x2: "65%", y2: "100%", c: "#8b5cf6" },
          { x1: "85%", y1: "0", x2: "85%", y2: "100%", c: "#3b82f6" },
        ].map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.c} strokeOpacity={0.2} strokeWidth={1} strokeDasharray="8 12"
            style={{ animation: "dashFlow 10s linear infinite" }} />
        ))}
        {["20%","40%","60%","80%"].flatMap((y) =>
          ["15%","35%","65%","85%"].map((x) => ({ cx: x, cy: y }))
        ).map((d, i) => (
          <circle key={`dot-${i}`} cx={d.cx} cy={d.cy} r={3} fill="rgba(139,92,246,0.25)" />
        ))}
      </svg>

      {/* Layer 8: Hex grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: 40 }, (_, i) => {
          const col = i % 8; const row = Math.floor(i / 8);
          const x = col * 75 + (row % 2 === 0 ? 0 : 37); const y = row * 65;
          return (
            <polygon key={`hex-${i}`}
              points={`${x+30},${y} ${x+60},${y+17} ${x+60},${y+48} ${x+30},${y+65} ${x},${y+48} ${x},${y+17}`}
              stroke="rgba(139,92,246,0.06)" strokeWidth={1} fill="none">
              {i % 7 === 0 && <animate attributeName="fill" values="rgba(139,92,246,0);rgba(139,92,246,0.08);rgba(139,92,246,0)" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />}
            </polygon>
          );
        })}
      </svg>

      {/* Layer 2: Floating cyber icons */}
      {[
        { icon: "🔒", left: "4%", top: "8%", size: 40, dur: 10 },
        { icon: "🛡️", left: "88%", top: "18%", size: 48, dur: 9 },
        { icon: "🔑", left: "18%", top: "42%", size: 36, dur: 13 },
        { icon: "💻", left: "72%", top: "52%", size: 44, dur: 11 },
        { icon: "🎮", left: "38%", top: "72%", size: 38, dur: 12 },
        { icon: "📱", left: "58%", top: "10%", size: 34, dur: 14 },
        { icon: "⚡", left: "92%", top: "65%", size: 42, dur: 8 },
        { icon: "🌐", left: "8%", top: "78%", size: 50, dur: 11 },
        { icon: "🔐", left: "48%", top: "32%", size: 32, dur: 15 },
        { icon: "👾", left: "28%", top: "88%", size: 40, dur: 10 },
        { icon: "🕵️", left: "82%", top: "38%", size: 36, dur: 12 },
        { icon: "🎯", left: "15%", top: "22%", size: 30, dur: 16 },
        { icon: "🚀", left: "65%", top: "82%", size: 44, dur: 9 },
        { icon: "💡", left: "42%", top: "55%", size: 38, dur: 13 },
        { icon: "🔍", left: "78%", top: "92%", size: 34, dur: 11 },
      ].map((ic, i) => (
        <div key={`cyber-${i}`} style={{
          position: "absolute", left: ic.left, top: ic.top, fontSize: ic.size, opacity: 0.15,
          animation: `cyberFloat ${ic.dur}s ease-in-out infinite`,
          animationDelay: `${i * -1.2}s`,
        }}>{ic.icon}</div>
      ))}

      {/* Layer 3: Glowing orbs */}
      {[
        { left: "5%", top: "10%", size: 400, color: "rgba(139,92,246,0.12)", delay: 0 },
        { left: "65%", top: "5%", size: 350, color: "rgba(59,130,246,0.12)", delay: 3 },
        { left: "45%", top: "45%", size: 500, color: "rgba(139,92,246,0.08)", delay: 6 },
        { left: "80%", top: "55%", size: 380, color: "rgba(59,130,246,0.1)", delay: 2 },
        { left: "15%", top: "70%", size: 450, color: "rgba(139,92,246,0.1)", delay: 5 },
        { left: "55%", top: "80%", size: 300, color: "rgba(59,130,246,0.08)", delay: 1 },
      ].map((orb, i) => (
        <motion.div key={`orb-${i}`}
          animate={{ opacity: [0.06, 0.15, 0.06], x: [-25, 25, -25] }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          style={{
            position: "absolute", left: orb.left, top: orb.top,
            width: orb.size, height: orb.size, borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
      ))}

      {/* Layer 4: Code rain */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={`rain-${i}`} style={{
          position: "absolute", left: `${(i / 12) * 100}%`, top: 0, width: 18,
          fontFamily: "monospace", fontSize: 14, color: "rgba(139,92,246,0.12)", lineHeight: "20px",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          animation: `codeRainCH ${12 + i * 1.5}s linear infinite`,
          animationDelay: `${i * -2}s`,
        }}>
          {"4F2A8B1E7C3D9A5F0B6E2C8A4D1F7B3E9C5A0D6F8B2E4C1A7D3F5B9E0C6A8D2F4B1E7C3A9D5F0B6E8C2A4D7F1B3E5C0A9D6F2B8E4C"}
        </div>
      ))}

      {/* Layer 6: Sparkle particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={`spark-${i}`} style={{
          position: "absolute",
          left: `${3 + ((i * 37 + 13) % 94)}%`,
          top: `${2 + ((i * 53 + 7) % 94)}%`,
          width: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
          borderRadius: "50%",
          background: i % 2 === 0 ? "rgba(139,92,246,0.5)" : "rgba(59,130,246,0.5)",
          animation: `sparkle ${2 + (i % 3)}s ease-in-out infinite`,
          animationDelay: `${i * 0.35}s`,
        }} />
      ))}

      {/* Layer 7: Scanning line */}
      <div style={{
        position: "absolute", left: 0, width: "100%", height: 2,
        background: "linear-gradient(to right, transparent, rgba(139,92,246,0.25), transparent)",
        boxShadow: "0 0 10px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.15)",
        animation: "scanLine 8s linear infinite",
      }} />

      {/* Layer 9: Data stream lines */}
      {[
        { top: "15%", dur: 3.5, delay: 0, w: 200 },
        { top: "35%", dur: 4, delay: 2.5, w: 250 },
        { top: "55%", dur: 3, delay: 5, w: 180 },
        { top: "72%", dur: 4.5, delay: 1, w: 300 },
        { top: "88%", dur: 3.5, delay: 4, w: 220 },
      ].map((ds, i) => (
        <div key={`ds-${i}`} style={{
          position: "absolute", top: ds.top, height: 1, width: ds.w,
          background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)",
          animation: `dataStream ${ds.dur}s linear infinite`,
          animationDelay: `${ds.delay}s`,
        }} />
      ))}

      {/* Layer 10: Binary rain */}
      {[10, 30, 70, 90].map((left, i) => (
        <div key={`bin-${i}`} style={{
          position: "absolute", left: `${left}%`, top: 0, width: 14,
          fontFamily: "monospace", fontSize: 16, fontWeight: 700,
          color: "rgba(59,130,246,0.1)", lineHeight: "22px",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          animation: `binaryFall ${15 + i * 3}s linear infinite`,
          animationDelay: `${i * -4}s`,
        }}>
          {"10110100011101001011010001110100101101000111010010110100011101001011"}
        </div>
      ))}
    </div>
  );
}

/* ─── COUNTER ANIMATION ─── */
function AnimCounter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        let frame: number;
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-5 rounded-2xl flex-1 min-w-[140px]"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-3xl sm:text-4xl font-black text-white">{val}{suffix}</span>
      <span className="text-xs sm:text-sm font-bold text-gray-400">{label}</span>
    </div>
  );
}

/* ─── COURSE CARD DATA ─── */
const COURSES = [
  { emoji: "🛡️", title: "Cyber Heroes Academy", ages: "6–10", weeks: 20, time: "45 min/week", accent: "#06b6d4", desc: "Fun animated adventures teaching password safety, online awareness, and digital citizenship.", featured: true },
  { emoji: "🔍", title: "Cyber Explorers", ages: "11–14", weeks: 14, time: "1 hr/week", accent: "#8b5cf6", desc: "Deeper dives into encryption, social engineering, safe browsing, and data privacy.", featured: false },
  { emoji: "💻", title: "CyberStart", ages: "15–17", weeks: 16, time: "1.5 hrs/week", accent: "#22c55e", desc: "Hands-on challenges covering networking, ethical hacking basics, and secure coding.", featured: false },
  { emoji: "🚀", title: "CyberStart Pro", ages: "18+", weeks: 20, time: "2 hrs/week", accent: "#f59e0b", desc: "Industry-aligned curriculum preparing for certifications and real-world security roles.", featured: false },
];

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { emoji: "🎮", title: "Interactive Adventures", desc: "Not just videos. Real games, puzzles, drag-and-drop challenges, and boss battles that keep kids engaged for the full lesson." },
  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built around CyberFirst and ASDAN frameworks so every lesson counts towards recognised achievements." },
];

/* ─── STORY CARDS DATA ─── */
const STORY = [
  { src: "/characters/adam-layla-happy.png", alt: "Adam and Layla sitting happily", caption: "Meet Adam & Layla", sub: "Two enthusiastic gamers who love exploring the digital world. But danger lurks online..." },
  { src: "/characters/adam-layla-raccoon.png", alt: "The Hacker Raccoon appears", caption: "The Hacker Raccoon Strikes", sub: "A sneaky villain who preys on their vulnerabilities: weak passwords, risky clicks, and shared secrets." },
  { src: "/characters/adam-layla-hacked.png", alt: "Adam and Layla with hacked tablet", caption: "Can They Become Cyber Heroes?", sub: "20 weeks of missions to outsmart the Raccoon and earn their Cyber Hero certificate!" },
];

/* ─── WEEKS DATA ─── */
const WEEKS = [
  { w: 1, title: "Passwords: The Secret Code", sub: "Discover why passwords matter and learn how to create super strong ones" },
  { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft, and Fortnite" },
  { w: 13, title: "Screen Time: Balance Your Power", sub: "Find the right balance between time online, breaks, sleep, and healthy habits" },
  { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert" },
  { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge! Earn your Cyber Hero certificate" },
];

/* ─── SVG ICONS ─── */
const IconController = ({ size = 32, color = "#8b5cf6" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
  </svg>
);
const IconAward = ({ size = 32, color = "#f59e0b" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);
const IconFamily = ({ size = 32, color = "#ec4899" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-scroll]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const delay = htmlEl.getAttribute("data-scroll-delay") || "0";
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(30px)";
      htmlEl.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#1a1033", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      <TechBackground />

      <div className="min-h-screen relative" style={{ zIndex: 1 }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(26,16,51,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: GRAD, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                <span className="text-xs font-black text-white">AX</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">X</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">
                Log In
              </a>
              <motion.a href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-white"
                style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                Get Started
              </motion.a>
            </div>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <motion.div className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black text-purple-300 mb-6"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                🛡️ Cybersecurity for Kids
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Learn Cybersecurity{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                  Through Adventure
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Join Adam and Layla on an interactive journey to become a Cyber Hero. Fun animated lessons, games, and challenges for ages 6–10.
              </p>
              <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                <motion.a href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-4 rounded-2xl font-black text-white text-base"
                  style={{ background: GRAD, boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
                  Get Started Now 🚀
                </motion.a>
                {/* Watch Preview button removed */}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}>
              <div className="relative">
                {/* Glow behind image */}
                <motion.div className="absolute inset-0 rounded-3xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(59,130,246,0.4))",
                    filter: "blur(40px)", transform: "scale(1.1)",
                  }} />
                <motion.div className="relative rounded-3xl overflow-hidden border-2 shadow-2xl"
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    borderColor: "rgba(139,92,246,0.3)",
                    boxShadow: "0 0 60px rgba(139,92,246,0.2)",
                  }}>
                  <Image src="/characters/heroic.png" alt="Adam and Layla in heroic pose"
                    width={500} height={500} className="block w-full max-w-[500px]" priority />
                </motion.div>
                {/* Sparkles */}
                {[
                  { top: "-8px", right: "-8px", size: 14 },
                  { bottom: "12px", left: "-10px", size: 10 },
                  { top: "40%", right: "-14px", size: 8 },
                ].map((s, i) => (
                  <motion.div key={i} className="absolute text-yellow-300"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                    style={{ ...s, fontSize: s.size }}>✦</motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── VIDEO PREVIEW ────────────────────────────────────────────────── */}
        <section id="preview" className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              See the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Adventure</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Watch Adam and Layla&apos;s first cybersecurity mission
            </p>
          </div>
          <div data-scroll>
            <div style={{ maxWidth: 800, margin: "0 auto", borderRadius: 20, overflow: "hidden", boxShadow: "0 0 40px rgba(139,92,246,0.3)", border: "2px solid rgba(139,92,246,0.3)" }}>
              <video
                controls
                playsInline
                preload="metadata"
                style={{ width: "100%", display: "block" }}
                src="/videos/cyberheroes-intro.mp4"
              />
            </div>
            {/* removed */}
          </div>
        </section>

        {/* ── MEET YOUR HEROES ──────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Meet Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Cyber Heroes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
            {/* Adam */}
            <div data-scroll data-scroll-delay="0">
              <motion.div className="rounded-3xl overflow-hidden"
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 40px rgba(245,158,11,0.2)" }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  backdropFilter: "blur(8px)",
                }}>
                <div style={{ height: 420, overflow: "hidden", background: "linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)" }}>
                  <Image src="/characters/adam.png" alt="Adam, curious and brave Cyber Hero" width={400} height={500} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
                </div>
                <div className="px-6 py-5 text-center">
                  <h3 className="font-black text-white text-2xl mb-2">Adam</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Curious, brave, and always ready to learn. Adam enjoys gaming and wants to keep his digital world safe.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Layla */}
            <div data-scroll data-scroll-delay="0.15">
              <motion.div className="rounded-3xl overflow-hidden"
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 40px rgba(168,85,247,0.2)" }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  backdropFilter: "blur(8px)",
                }}>
                <div style={{ height: 420, overflow: "hidden", background: "linear-gradient(180deg, rgba(168,85,247,0.08) 0%, transparent 100%)" }}>
                  <Image src="/characters/layla.png" alt="Layla, smart and fearless Cyber Hero" width={400} height={500} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
                </div>
                <div className="px-6 py-5 text-center">
                  <h3 className="font-black text-white text-2xl mb-2">Layla</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Smart, creative, and fearless. Layla knows that staying safe online is a superpower everyone needs.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center" data-scroll data-scroll-delay="0.2">
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Join Adam and Layla on their adventure to become cybersecurity experts. Help them stay safe from the Hacker Raccoon and learn how to protect yourself too!
            </p>
            <motion.a href="/signup"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-7 py-4 rounded-2xl font-black text-white text-base"
              style={{ background: GRAD, boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
              Start the Adventure →
            </motion.a>
          </div>
        </section>

        {/* ── STORY ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              The Adventure{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Begins</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Follow Adam and Layla as they learn to protect their digital world from the sneaky Hacker Raccoon. Each week is a new adventure!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STORY.map((s, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.15)}>
                <motion.div className="overflow-hidden group"
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 40px rgba(139,92,246,0.2)" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 20,
                    position: "relative",
                    height: 380,
                    overflow: "hidden",
                  }}>
                  <Image src={s.src} alt={s.alt} width={400} height={400} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {/* Step number badge */}
                  <div style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", background: GRAD, boxShadow: "0 4px 12px rgba(139,92,246,0.4)", zIndex: 2 }}>
                    {i + 1}
                  </div>
                  {/* Text overlay */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "40px 16px 16px", borderRadius: "0 0 16px 16px" }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.caption}</p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{s.sub}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RACCOON ──────────────────────────────────────────────────────── */}
        <div className="flex justify-center py-12" data-scroll data-scroll-delay="0.2">
          <div className="relative max-w-xs">
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "rgba(139,92,246,0.3)", filter: "blur(50px)", transform: "scale(0.9)" }} />
            <motion.div
              animate={{ boxShadow: ["0 0 30px rgba(239,68,68,0.3)", "0 0 60px rgba(239,68,68,0.6)", "0 0 30px rgba(239,68,68,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: 20, display: "inline-block", border: "2px solid rgba(239,68,68,0.3)" }}>
              <Image src="/characters/raccoon.png" alt="The Hacker Raccoon villain"
                width={280} height={280} className="relative block" style={{ borderRadius: 18 }} />
            </motion.div>
            <div className="text-center mt-4">
              <p className="text-purple-300 text-sm font-black">The Hacker Raccoon</p>
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 18, marginTop: 4 }}>The villain your kids will learn to outsmart!</p>
              <p style={{ color: "#9ca3af", fontSize: 14, fontStyle: "italic", marginTop: 4 }}>Can Adam &amp; Layla defeat him? Your child decides!</p>
            </div>
          </div>
        </div>

        {/* ── OTHER AGES ──────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-16">
          <div className="text-center" data-scroll>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-3">
              Looking for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">other ages</span>?
            </h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">
              Cyber Heroes Academy is designed for ages 6-10. For older children and adults, check out our other cybersecurity courses.
            </p>
            <a href="/" className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-gray-400 transition-all hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              Explore All Courses →
            </a>
          </div>
        </section>

        {/* ── CURRICULUM TEASER ───────────────────────────────────────────── */}
        <section className="max-w-[800px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              A{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Sneak Peek</span>
              {" "}at Your Journey
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              20 weeks of cybersecurity missions. Here are some highlights.
            </p>
          </div>
          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Centre line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(139,92,246,0.15)", transform: "translateX(-50%)" }} />
            {[
              { w: 1, title: "Passwords: The Secret Code", sub: "Discover why passwords matter and learn how to create super strong ones", gap: null },
              { w: null, label: "5 more secret missions...", gap: true },
              { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft, and Fortnite", gap: null },
              { w: null, label: "6 more secret missions...", gap: true },
              { w: 13, title: "Screen Time: Balance Your Power", sub: "Find the right balance between time online, breaks, sleep, and healthy habits", gap: null },
              { w: null, label: "5 more secret missions...", gap: true },
              { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert", gap: null },
              { w: null, label: "The grand finale awaits...", gap: true },
              { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge! Earn your Cyber Hero certificate", gap: null },
            ].map((item, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.08)}>
                {item.gap ? (
                  /* Locked placeholder */
                  <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                    <div style={{
                      background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: 12, padding: "10px 24px", opacity: 0.5, display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ fontSize: 16 }}>🔒</span>
                      <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                    </div>
                  </div>
                ) : (
                  /* Visible module card */
                  <div style={{
                    display: "flex",
                    justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                    padding: "8px 0",
                  }}>
                    <div style={{
                      width: "45%",
                      background: item.w === 20 ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.04)",
                      border: item.w === 20 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16, padding: 20,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.w === 20 ? "linear-gradient(135deg, #f59e0b, #f97316)" : GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                          {item.w}
                        </div>
                        {item.w === 20 && <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.15)", borderRadius: 8, padding: "2px 8px" }}>🎓 Final Mission</span>}
                        {item.w === 1 && <span style={{ fontSize: 10, fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.15)", borderRadius: 8, padding: "2px 8px" }}>START HERE</span>}
                      </div>
                      <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{item.title}</h4>
                      <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.5 }}>{item.sub}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* CTA */}
          <div data-scroll style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 600, margin: "32px auto 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Want to unlock all 20 missions?</h3>
            <p style={{ color: "#9ca3af", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
              Subscribe now to reveal every week, every game, every badge. The full Cyber Heroes journey awaits.
            </p>
            <motion.a href="/signup"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block", background: GRAD, color: "#fff", fontSize: 18, fontWeight: 700, padding: "14px 36px", borderRadius: 14, textDecoration: "none", boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
              Subscribe Now
            </motion.a>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AlgorithmX</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.12)}>
                <motion.div className="rounded-3xl p-6 h-full"
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 40px rgba(139,92,246,0.15)" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                  }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {i === 0 ? <IconController /> : <IconAward />}
                  </div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Raccoon moved to after story section */}
        </section>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-20">
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimCounter to={20} label="Weeks of Adventure" />
            <AnimCounter to={100} suffix="+" label="Interactive Activities" />
            <AnimCounter to={6} suffix="-10" label="Age Range" />
            <AnimCounter to={100} suffix="%" label="Interactive" />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div data-scroll>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(16px)",
              }}>
              {/* Blurred background image */}
              <div className="absolute inset-0 z-0">
                <Image src="/characters/adam-layla-happy.png" alt="" fill
                  className="object-cover opacity-10" style={{ filter: "blur(30px)" }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  Ready to Become a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                    Cyber Hero
                  </span>?
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                  Start your child&apos;s cybersecurity journey today. Interactive, fun, and built by educators.
                </p>
                <motion.a href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-10 py-5 rounded-2xl font-black text-white text-lg"
                  style={{ background: GRAD, boxShadow: "0 8px 40px rgba(139,92,246,0.4)" }}>
                  Get Started Now 🚀
                </motion.a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
                <span className="text-[9px] font-black text-white">AX</span>
              </div>
              <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

/* ─── FLOATING ORBS (warm fairy-light style) ─── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: "9s", delay: "0s" },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: "11s", delay: "1s" },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: "13s", delay: "2s" },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: "8s", delay: "0.5s" },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: "10s", delay: "3s" },
        { size: 9, top: "82%", right: "8%", color: "#3b82f6", dur: "12s", delay: "1.5s" },
        { size: 4, top: "45%", left: "50%", color: "#f59e0b", dur: "14s", delay: "4s" },
        { size: 6, top: "15%", left: "40%", color: "#a78bfa", dur: "10s", delay: "2.5s" },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color, opacity: 0.35,
            boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
            animation: `floatOrb ${o.dur} ease-in-out infinite ${o.delay}`,
          }} />
      ))}
    </div>
  );
}

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── COUNTER ANIMATION ─── */
function AnimCounter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, to]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-5 rounded-2xl flex-1 min-w-[140px]"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-3xl sm:text-4xl font-black text-white">{val}{suffix}</span>
      <span className="text-xs sm:text-sm font-bold text-gray-400">{label}</span>
    </div>
  );
}

/* ─── REVEAL SECTION WRAPPER ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ${SPRING} ${delay}s`,
      }}>
      {children}
    </div>
  );
}

/* ─── COURSE CARD DATA ─── */
const COURSES = [
  { emoji: "🛡️", title: "Cyber Heroes Academy", ages: "6–10", weeks: 12, time: "45 min/week", accent: "#06b6d4", desc: "Fun animated adventures teaching password safety, online awareness, and digital citizenship.", featured: true },
  { emoji: "🔍", title: "Cyber Explorers", ages: "11–14", weeks: 14, time: "1 hr/week", accent: "#8b5cf6", desc: "Deeper dives into encryption, social engineering, safe browsing, and data privacy.", featured: false },
  { emoji: "💻", title: "CyberStart", ages: "15–17", weeks: 16, time: "1.5 hrs/week", accent: "#22c55e", desc: "Hands-on challenges covering networking, ethical hacking basics, and secure coding.", featured: false },
  { emoji: "🚀", title: "CyberStart Pro", ages: "18+", weeks: 20, time: "2 hrs/week", accent: "#f59e0b", desc: "Industry-aligned curriculum preparing for certifications and real-world security roles.", featured: false },
];

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { emoji: "🎮", title: "Interactive Adventures", desc: "Not just videos — real games, puzzles, drag-and-drop challenges, and boss battles that keep kids engaged for the full lesson." },
  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built around CyberFirst and ASDAN frameworks so every lesson counts towards recognised achievements." },
  { emoji: "👨‍👩‍👧‍👦", title: "Family Bundle", desc: "One purchase covers all youth tracks. Siblings of different ages can all learn together at their own level." },
];

/* ─── STORY CARDS DATA ─── */
const STORY = [
  { src: "/characters/adam-layla-happy.png", alt: "Adam and Layla sitting happily", caption: "Meet Adam & Layla" },
  { src: "/characters/adam-layla-raccoon.png", alt: "The Hacker Raccoon appears", caption: "The Hacker Raccoon appears..." },
  { src: "/characters/adam-layla-hacked.png", alt: "Adam and Layla with hacked tablet", caption: "Can they save the day?" },
];

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        @keyframes floatOrb    {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.3)}}
        @keyframes heroFloat   {0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes glowPulse   {0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slideUp     {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn       {0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        @keyframes sparkle     {0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
      `}</style>

      <FloatingOrbs />

      <div className="min-h-screen relative" style={{ background: "#1a1033", zIndex: 1 }}>

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
              <a href="/signup"
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:scale-105"
                style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                Get Started
              </a>
            </div>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left" style={{ animation: `slideUp 0.8s ${SPRING} both` }}>
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
                <a href="/signup"
                  className="px-7 py-4 rounded-2xl font-black text-white text-base transition-all duration-300 hover:scale-105"
                  style={{ background: GRAD, boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
                  Start Free Trial 🚀
                </a>
                <button
                  className="px-7 py-4 rounded-2xl font-black text-purple-300 text-base transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    background: "transparent",
                    border: "2px solid rgba(139,92,246,0.4)",
                    boxShadow: "0 0 0 0 rgba(139,92,246,0)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(139,92,246,0.3)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 0 0 rgba(139,92,246,0)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; }}>
                  Watch Preview ▶
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end"
              style={{ animation: `popIn 0.9s ${SPRING} 0.2s both` }}>
              <div className="relative">
                {/* Glow ring behind image */}
                <div className="absolute inset-0 rounded-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(59,130,246,0.4))",
                    filter: "blur(40px)", transform: "scale(1.1)",
                    animation: "glowPulse 4s ease-in-out infinite",
                  }} />
                <div className="relative rounded-3xl overflow-hidden border-2 shadow-2xl"
                  style={{
                    borderColor: "rgba(139,92,246,0.3)",
                    animation: "heroFloat 5s ease-in-out infinite",
                    boxShadow: "0 0 60px rgba(139,92,246,0.2)",
                  }}>
                  <Image src="/characters/adam-layla-happy.png" alt="Adam and Layla — your Cyber Hero guides"
                    width={520} height={520} className="block w-full max-w-[480px]" priority />
                </div>
                {/* Sparkle decorations */}
                {[
                  { top: "-8px", right: "-8px", size: 14 },
                  { bottom: "12px", left: "-10px", size: 10 },
                  { top: "40%", right: "-14px", size: 8 },
                ].map((s, i) => (
                  <div key={i} className="absolute text-yellow-300" style={{ ...s, fontSize: s.size, animation: `sparkle 2.5s ease-in-out infinite ${i * 0.8}s` }}>✦</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              The Adventure{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Begins</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Follow Adam and Layla as they learn to protect their digital world from the sneaky Hacker Raccoon. Each week is a new adventure!
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STORY.map((s, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03] group"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    backdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(139,92,246,0.2)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)"; }}>
                  <div className="relative overflow-hidden">
                    <Image src={s.src} alt={s.alt} width={400} height={400} className="w-full block" />
                    {/* Step number badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: GRAD, boxShadow: "0 4px 12px rgba(139,92,246,0.4)" }}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-black text-white text-base">{s.caption}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── COURSES ──────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Four Learning Tracks.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Every Age.</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              From first-time digital explorers to aspiring security professionals.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COURSES.map((c, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-3xl p-6 h-full transition-all duration-500 hover:scale-[1.03] relative group"
                  style={{
                    background: c.featured ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${c.featured ? `${c.accent}40` : "rgba(255,255,255,0.06)"}`,
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${c.accent}25`; e.currentTarget.style.borderColor = `${c.accent}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = c.featured ? `${c.accent}40` : "rgba(255,255,255,0.06)"; }}>
                  {c.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white"
                      style={{ background: c.accent, boxShadow: `0 4px 12px ${c.accent}40` }}>
                      LAUNCHING NOW
                    </div>
                  )}
                  <div className="text-4xl mb-3">{c.emoji}</div>
                  <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black mb-3"
                    style={{ background: `${c.accent}20`, color: c.accent, border: `1px solid ${c.accent}30` }}>
                    Ages {c.ages}
                  </div>
                  <h3 className="font-black text-white text-lg mb-2 leading-snug">{c.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{c.desc}</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-auto">
                    <span>📅 {c.weeks} weeks</span>
                    <span>⏱️ {c.time}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AlgorithmX</span>?
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-3xl p-6 h-full transition-all duration-500 hover:scale-[1.03]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(139,92,246,0.15)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                  <div className="text-4xl mb-4">{f.emoji}</div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Raccoon accent image */}
          <Reveal className="mt-12 flex justify-center" delay={0.2}>
            <div className="relative max-w-xs">
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: "rgba(139,92,246,0.3)", filter: "blur(50px)", transform: "scale(0.9)" }} />
              <Image src="/characters/raccoon.png" alt="The Hacker Raccoon villain"
                width={320} height={320} className="relative rounded-3xl block" />
              <div className="text-center mt-3">
                <p className="text-purple-300 text-sm font-black">The Hacker Raccoon</p>
                <p className="text-gray-500 text-xs font-bold">The villain your kids will learn to outsmart!</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-20">
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimCounter to={4} label="Learning Tracks" />
            <AnimCounter to={62} suffix="+" label="Weeks of Content" />
            <AnimCounter to={6} suffix="+" label="Starting Age" />
            <AnimCounter to={100} suffix="%" label="Interactive" />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal>
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
                <a href="/signup"
                  className="inline-block px-10 py-5 rounded-2xl font-black text-white text-lg transition-all duration-300 hover:scale-105"
                  style={{ background: GRAD, boxShadow: "0 8px 40px rgba(139,92,246,0.4)" }}>
                  Get Started Free 🚀
                </a>
              </div>
            </div>
          </Reveal>
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
    </>
  );
}

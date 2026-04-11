"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

/* ─── FLOATING ORBS ─── */
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

/* ─── SCROLL REVEAL ─── */
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

/* ─── COUNTER ─── */
function AnimCounter({ to, suffix = "", label }: { to: number | string; suffix?: string; label: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [val, setVal] = useState(0);
  const isNum = typeof to === "number";
  useEffect(() => {
    if (!visible || !isNum) return;
    let frame: number;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * (to as number)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, to, isNum]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-5 rounded-2xl flex-1 min-w-[140px]"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-3xl sm:text-4xl font-black text-white">{isNum ? val : to}{suffix}</span>
      <span className="text-xs sm:text-sm font-bold text-gray-400">{label}</span>
    </div>
  );
}

/* ─── DATA ─── */
const COURSES = [
  {
    emoji: "🛡️", title: "Cyber Heroes Academy", ages: "6–10", weeks: 12, time: "45 min/week",
    accent: "#06b6d4", featured: true, href: "/cyberheroes",
    desc: "Fun animated adventures with Adam & Layla! Learn about passwords, online safety, and digital citizenship through interactive games.",
    hasImage: true,
  },
  {
    emoji: "🔍", title: "Cyber Explorers", ages: "11–14", weeks: 14, time: "1 hr/week",
    accent: "#8b5cf6", featured: false, href: null,
    desc: "Motion-graphics lessons exploring networks, encryption, social engineering, and ethical hacking fundamentals.",
    hasImage: false,
  },
  {
    emoji: "💻", title: "CyberStart", ages: "15–17", weeks: 16, time: "1.5 hrs/week",
    accent: "#22c55e", featured: false, href: null,
    desc: "Real-world CTF challenges, incident response scenarios, and simulated phishing environments.",
    hasImage: false,
  },
  {
    emoji: "🚀", title: "CyberStart Pro", ages: "18+", weeks: 20, time: "2 hrs/week",
    accent: "#f59e0b", featured: false, href: null,
    desc: "Professional workplace cybersecurity. Compliance frameworks, threat analysis, and career pathways.",
    hasImage: false,
  },
];

const FEATURES = [
  { emoji: "🎮", title: "Not Just Videos", desc: "Hands-on games, simulations, and challenges that make cybersecurity stick. Your child learns by doing." },
  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built to CyberFirst and ASDAN frameworks. Real credentials recognised by universities and employers." },
  { emoji: "👨‍👩‍👧‍👦", title: "Family Bundle", desc: "One purchase covers all three youth tracks. Complete cybersecurity education from ages 6 to 17." },
];

const STEPS = [
  { num: "1", emoji: "🎯", title: "Choose a Track", desc: "Pick the right course for your child's age and level." },
  { num: "2", emoji: "🎮", title: "Learn Through Adventure", desc: "Animated stories, interactive games, and real-world challenges make learning unforgettable." },
  { num: "3", emoji: "🎓", title: "Earn Your Certificate", desc: "Complete all modules and earn an accredited certificate of achievement." },
];

const TRUST = ["CyberFirst Aligned", "ASDAN Framework", "NCSC Standards", "100% Interactive"];

/* ─── PAGE ─── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCourses = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  };

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

        {/* ── NAV ── */}
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
            <div className="flex items-center gap-5">
              <button onClick={scrollToCourses}
                className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block cursor-pointer bg-transparent border-none">
                Courses
              </button>
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

        {/* ── HERO ── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left" style={{ animation: `slideUp 0.8s ${SPRING} both` }}>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black text-purple-300 mb-6"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                🛡️ Ages 6 to Adult
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Cybersecurity Education{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                  for Every Age
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Interactive courses that teach your children how to stay safe online. From ages 6 to adult — powered by animated adventures, real-world simulations, and accredited learning paths.
              </p>
              <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                <button onClick={scrollToCourses}
                  className="px-7 py-4 rounded-2xl font-black text-white text-base transition-all duration-300 hover:scale-105 cursor-pointer border-none"
                  style={{ background: GRAD, boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
                  Explore Courses
                </button>
                <a href="/signup"
                  className="px-7 py-4 rounded-2xl font-black text-purple-300 text-base transition-all duration-300 hover:scale-105"
                  style={{
                    background: "transparent",
                    border: "2px solid rgba(139,92,246,0.4)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(139,92,246,0.3)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; }}>
                  Start Free Trial
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end"
              style={{ animation: `popIn 0.9s ${SPRING} 0.2s both` }}>
              <div className="relative">
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
                  <Image src="/characters/adam-layla-happy.png" alt="Adam and Layla — Cyber Heroes"
                    width={500} height={500} className="block w-full max-w-[480px]" priority />
                </div>
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

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-12 sm:mt-16"
            style={{ animation: `slideUp 0.8s ${SPRING} 0.4s both` }}>
            {TRUST.map((t, i) => (
              <span key={i} className="text-xs sm:text-sm font-bold text-gray-500 tracking-wide">
                {i > 0 && <span className="text-gray-700 mr-3 hidden sm:inline">·</span>}
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── COURSES ── */}
        <section id="courses" className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Learning Path</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Four tracks covering every age — from first-time digital explorers to cybersecurity professionals.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COURSES.map((c, i) => {
              const isComingSoon = !c.featured;
              const Wrapper = c.href ? "a" : "div";
              const wrapperProps = c.href ? { href: c.href } : {};

              return (
                <Reveal key={i} delay={i * 0.1}>
                  <Wrapper {...wrapperProps}
                    className="block rounded-3xl p-6 sm:p-7 h-full transition-all duration-500 relative group"
                    style={{
                      background: c.featured ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                      borderTop: `3px solid ${c.accent}`,
                      border: `1px solid ${c.featured ? `${c.accent}40` : "rgba(255,255,255,0.06)"}`,
                      borderTopWidth: 3,
                      borderTopColor: c.accent,
                      backdropFilter: "blur(12px)",
                      cursor: c.href ? "pointer" : "not-allowed",
                      textDecoration: "none",
                      opacity: isComingSoon ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                      if (c.href) {
                        e.currentTarget.style.boxShadow = `0 0 40px ${c.accent}25`;
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}>

                    {/* Badge */}
                    <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black text-white"
                      style={{
                        background: c.featured ? c.accent : "rgba(255,255,255,0.1)",
                        color: c.featured ? "white" : "#9ca3af",
                        boxShadow: c.featured ? `0 4px 12px ${c.accent}40` : "none",
                      }}>
                      {c.featured ? "NOW AVAILABLE" : "COMING SOON"}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-4xl shrink-0">{c.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black mb-2"
                          style={{ background: `${c.accent}20`, color: c.accent, border: `1px solid ${c.accent}30` }}>
                          Ages {c.ages}
                        </div>
                        <h3 className="font-black text-white text-lg sm:text-xl mb-1 leading-snug">{c.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-3">{c.desc}</p>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                          <span>📅 {c.weeks} weeks</span>
                          <span>⏱️ {c.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail for featured card */}
                    {c.hasImage && (
                      <div className="mt-4 rounded-2xl overflow-hidden border"
                        style={{ borderColor: `${c.accent}30` }}>
                        <Image src="/characters/adam-layla-happy.png" alt="Cyber Heroes Academy preview"
                          width={600} height={300} className="w-full block" style={{ objectFit: "cover", maxHeight: 180 }} />
                      </div>
                    )}

                    {c.href && (
                      <div className="mt-4">
                        <span className="inline-block px-5 py-2.5 rounded-2xl text-sm font-black text-white"
                          style={{ background: GRAD, boxShadow: `0 4px 16px ${c.accent}30` }}>
                          Explore Course →
                        </span>
                      </div>
                    )}
                  </Wrapper>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── WHY ALGORITHMX ── */}
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
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Three Simple{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Steps</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-3xl p-6 h-full text-center transition-all duration-500 hover:scale-[1.03]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(139,92,246,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-black text-white"
                    style={{ background: GRAD, boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
                    {s.num}
                  </div>
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <h3 className="font-black text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-20">
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimCounter to={4} label="Learning Tracks" />
            <AnimCounter to={62} suffix="+" label="Weeks of Content" />
            <AnimCounter to="6+" suffix="" label="Starting Age" />
            <AnimCounter to={100} suffix="%" label="Interactive" />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(16px)",
              }}>
              {/* Raccoon watermark */}
              <div className="absolute right-4 bottom-4 z-0 opacity-[0.06]">
                <Image src="/characters/raccoon.png" alt="" width={200} height={200} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  Ready to Start Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                    Cybersecurity Journey
                  </span>?
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                  Choose a track and begin learning today. First lesson is free!
                </p>
                <a href="/signup"
                  className="inline-block px-10 py-5 rounded-2xl font-black text-white text-lg transition-all duration-300 hover:scale-105"
                  style={{ background: GRAD, boxShadow: "0 8px 40px rgba(139,92,246,0.4)" }}>
                  Get Started 🚀
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
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
              <button onClick={scrollToCourses} className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer">Courses</button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

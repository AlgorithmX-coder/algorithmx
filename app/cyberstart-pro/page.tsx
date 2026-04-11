"use client";

import { useEffect, useRef, useState } from "react";

const PRIMARY = "#f59e0b";
const ACCENT = "#f97316";
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: PRIMARY, dur: "9s", delay: "0s" },
        { size: 6, top: "18%", right: "10%", color: ACCENT, dur: "11s", delay: "1s" },
        { size: 10, top: "35%", left: "3%", color: "#d97706", dur: "13s", delay: "2s" },
        { size: 5, top: "52%", right: "5%", color: PRIMARY, dur: "8s", delay: "0.5s" },
        { size: 7, top: "70%", left: "12%", color: ACCENT, dur: "10s", delay: "3s" },
        { size: 9, top: "82%", right: "8%", color: "#d97706", dur: "12s", delay: "1.5s" },
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

const FEATURES = [
  { emoji: "📋", title: "Compliance & Governance", desc: "GDPR, ISO 27001, Cyber Essentials frameworks. Understand the regulatory landscape that drives modern security." },
  { emoji: "🔎", title: "Threat Intelligence", desc: "Analyse real-world attack patterns and defend against them. Build threat models and incident response plans." },
  { emoji: "🎯", title: "Career Pathways", desc: "Map your route into cybersecurity with industry-recognised skills. From SOC analyst to penetration tester." },
];

export default function CyberStartProPage() {
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
        @keyframes floatOrb  {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.3)}}
        @keyframes slideUp   {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn     {0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        @keyframes glowPulse {0%,100%{opacity:0.5}50%{opacity:1}}
      `}</style>

      <FloatingOrbs />

      <div className="min-h-screen relative" style={{ background: "#1a1033", zIndex: 1 }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(26,16,51,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: GRAD, boxShadow: `0 0 20px ${PRIMARY}60` }}>
                <span className="text-xs font-black text-white">AX</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Algorithm<span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>X</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Log In</a>
              <a href="/signup" className="px-5 py-2.5 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:scale-105"
                style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                Get Started
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="text-center" style={{ animation: `slideUp 0.8s ${SPRING} both` }}>
            <div className="inline-block px-5 py-2 rounded-full text-xs font-black mb-6"
              style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40`, color: PRIMARY }}>
              COMING SOON
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                CyberStart Pro
              </span>
            </h1>

            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
              style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
              Ages 18+ · 20 Weeks · 2 hours per week
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Professional workplace cybersecurity. Compliance frameworks, threat analysis, and career pathways. Designed for adults entering or advancing in the cybersecurity industry.
            </p>

            <div className="relative mx-auto w-48 h-48 mb-10" style={{ animation: `popIn 0.9s ${SPRING} 0.2s both` }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `${PRIMARY}30`, filter: "blur(40px)", animation: "glowPulse 4s ease-in-out infinite" }} />
              <div className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ background: `${PRIMARY}15`, border: `2px solid ${PRIMARY}40` }}>
                <span className="text-7xl">🏢</span>
              </div>
            </div>

            <a href="/signup" className="inline-block px-8 py-4 rounded-2xl font-black text-white text-base transition-all duration-300 hover:scale-105"
              style={{ background: GRAD, boxShadow: `0 8px 32px ${PRIMARY}50` }}>
              Join the Waitlist 🚀
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What You&apos;ll{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Master</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-3xl p-6 h-full transition-all duration-500 hover:scale-[1.03]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${PRIMARY}20`,
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${PRIMARY}20`; e.currentTarget.style.borderColor = `${PRIMARY}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${PRIMARY}20`; }}>
                  <div className="text-4xl mb-4">{f.emoji}</div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <Reveal>
            <div className="rounded-3xl p-8 sm:p-14 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to Go{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Pro</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                Launch your cybersecurity career. Be the first to access CyberStart Pro when it goes live.
              </p>
              <a href="/signup" className="inline-block px-10 py-5 rounded-2xl font-black text-white text-lg transition-all duration-300 hover:scale-105"
                style={{ background: GRAD, boxShadow: `0 8px 40px ${PRIMARY}50` }}>
                Join the Waitlist 🚀
              </a>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX</span>
            <div className="flex items-center gap-6 flex-wrap">
              <a href="/cyberheroes" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Heroes</a>
              <a href="/cyber-explorers" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Explorers</a>
              <a href="/cyberstart" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">CyberStart</a>
              <a href="/cyberstart-pro" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>CyberStart Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

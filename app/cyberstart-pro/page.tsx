"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CosmicLibraryScene } from "@/app/components/PixarScenes";

// Warm amber/gold for the Pro tier — already on-palette with the Pixar dusk system.
const PRIMARY = "#ff9b4a";       // gold mid
const ACCENT = "#ffd58a";        // gold light
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
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
      `}</style>

      <CosmicLibraryScene />

      <div className="min-h-screen relative" style={{ background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, #1a0612 70%, #0a0410 100%)`, zIndex: 1 }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(26,6,18,0.85)" : "transparent",
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
              <motion.a href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-white"
                style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                Get Started
              </motion.a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <motion.div className="text-center"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}>
            <motion.div className="inline-block px-5 py-2 rounded-full text-xs font-black mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40`, color: PRIMARY }}>
              COMING SOON
            </motion.div>

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

            <motion.div className="relative mx-auto w-48 h-48 mb-10"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}>
              <motion.div className="absolute inset-0 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: `${PRIMARY}30`, filter: "blur(40px)" }} />
              <div className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ background: `${PRIMARY}15`, border: `2px solid ${PRIMARY}40` }}>
                <span className="text-7xl">🏢</span>
              </div>
            </motion.div>

            <motion.a href="/signup"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 rounded-2xl font-black text-white text-base"
              style={{ background: GRAD, boxShadow: `0 8px 32px ${PRIMARY}50` }}>
              Join the Waitlist 🚀
            </motion.a>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What You&apos;ll{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Master</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <motion.div className="rounded-3xl p-6 h-full"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${PRIMARY}20`,
                    backdropFilter: "blur(12px)",
                  }}>
                  <div className="text-4xl mb-4">{f.emoji}</div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <ScrollReveal>
            <div className="rounded-3xl p-8 sm:p-14 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to Go{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Pro</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                Launch your cybersecurity career. Be the first to access CyberStart Pro when it goes live.
              </p>
              <motion.a href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-10 py-5 rounded-2xl font-black text-white text-lg"
                style={{ background: GRAD, boxShadow: `0 8px 40px ${PRIMARY}50` }}>
                Join the Waitlist 🚀
              </motion.a>
            </div>
          </ScrollReveal>
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

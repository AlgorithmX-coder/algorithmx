"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DataLabScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";
import WaitlistForm from "@/app/components/WaitlistForm";

// Warm Pixar palette - moss + cream accents over dusk backdrop.
const PRIMARY = "#7eff97";       // moss
const ACCENT = "#a0ffb0";        // light moss
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { emoji: "🏴", title: "Capture The Flag", desc: "Solve real hacking challenges in a safe, sandboxed environment. Progress through levels of increasing difficulty." },
  { emoji: "🚨", title: "Incident Response", desc: "Learn what happens when a company gets breached. Walk through real-world scenarios and build your response playbook." },
  { emoji: "🔓", title: "Penetration Testing", desc: "Think like a hacker to defend like a pro. Discover vulnerabilities before the bad guys do." },
];

export default function CyberStartPage() {
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

      <DataLabScene />

      <div className="min-h-screen relative" style={{ background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)`, zIndex: 1 }}>
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
            transition={{ duration: 0.4, ease: "easeOut" }}>
            <motion.div className="inline-block px-5 py-2 rounded-full text-xs font-black mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40`, color: ACCENT }}>
              COMING SOON
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                CyberStart
              </span>
            </h1>

            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
              style={{ background: `${PRIMARY}15`, color: ACCENT }}>
              Ages 15-17 · 16 Weeks · 1.5 hours per week
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Real-world CTF challenges, incident response scenarios, and simulated phishing environments. Prepare for a future in cybersecurity with hands-on technical skills.
            </p>

            <motion.div className="relative mx-auto w-48 h-48 mb-10"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}>
              <motion.div className="absolute inset-0 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: `${PRIMARY}30`, filter: "blur(40px)" }} />
              <div className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ background: `${PRIMARY}15`, border: `2px solid ${PRIMARY}40` }}>
                <CyberIconOrEmoji emoji="💻" size={80} accent="lime" />
              </div>
            </motion.div>

            <div className="flex justify-center">
              <WaitlistForm
                courseSlug="cyberstart"
                accent={PRIMARY}
                accentSoft={ACCENT}
                buttonGradient={GRAD}
                buttonShadow={`0 8px 32px ${PRIMARY}50`}
                source="hero"
              />
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What You&apos;ll{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Learn</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <motion.div className="rounded-3xl p-6 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${PRIMARY}20`,
                    backdropFilter: "blur(12px)",
                  }}>
                  <div className="mb-4" style={{ lineHeight: 1 }}>
                    <CyberIconOrEmoji emoji={f.emoji} size={36} accent="lime" />
                  </div>
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
                Ready to{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Start</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                CyberStart launches soon. Get early access and be among the first to level up your skills.
              </p>
              <div className="flex justify-center">
                <WaitlistForm
                  courseSlug="cyberstart"
                  accent={PRIMARY}
                  accentSoft={ACCENT}
                  buttonGradient={GRAD}
                  buttonShadow={`0 8px 40px ${PRIMARY}50`}
                  source="footer-cta"
                />
              </div>
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
              <a href="/cyberstart" className="text-xs font-bold transition-colors" style={{ color: ACCENT }}>CyberStart</a>
              <a href="/cyberstart-pro" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">CyberStart Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

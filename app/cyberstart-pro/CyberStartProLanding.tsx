"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@prisma/client";
import { DataLabScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";
import WaitlistForm from "@/app/components/WaitlistForm";

// Cosmic violet → cyan for the Pro tier — on-palette with the
// cyber brand and gives the upper-age product a distinct accent.
const PRIMARY = "#7c5cff";       // cosmic
const ACCENT = "#00e5ff";        // cyan
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

// PLACEHOLDER COPY — final curriculum lands later. Hero/meta
// metadata (name, age range, etc.) comes from the Product prop so
// any DB edits propagate without a code change.
const FEATURES = [
  { emoji: "📋", title: "Compliance & Governance", desc: "GDPR, ISO 27001, Cyber Essentials frameworks. Understand the regulatory landscape that drives modern security." },
  { emoji: "🔎", title: "Threat Intelligence", desc: "Analyse real-world attack patterns and defend against them. Build threat models and incident response plans." },
  { emoji: "🎯", title: "Career Pathways", desc: "Map your route into cybersecurity with industry-recognised skills. From SOC analyst to penetration tester." },
];

/* Finalized branding (owner call, 2026-07): this track sells as
 * "Cyber Pro" for ages 18+. The DB Product row still carries the legacy
 * seeded values ("CyberStart Pro" / "16-18+") and feeds other surfaces,
 * so the landing overrides display copy only — update the row and these
 * can go back to reading the product. */
const DISPLAY_NAME = "Cyber Pro";
const DISPLAY_AGE_RANGE = "18+";

function metaLineFromProduct(p: Product): string {
  const parts = [`Ages ${DISPLAY_AGE_RANGE}`];
  if (p.weeksCount > 0) parts.push(`${p.weeksCount} Weeks`);
  parts.push(p.duration);
  return parts.join(" · ");
}

export default function CyberStartProLanding({ product }: { product: Product }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const metaLine = metaLineFromProduct(product);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .cypro-cursor { animation: cyproBlink 1.3s steps(1) infinite; }
        @keyframes cyproBlink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .cypro-cursor { animation: none; } }
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
            <Link href="/" className="flex items-center gap-2.5" aria-label="Cyber Pro by AlgorithmX — home">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden
                style={{ filter: "drop-shadow(0 0 9px rgba(255,122,61,0.35))", flexShrink: 0 }}>
                <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
                <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
                <path className="cypro-cursor" d="M13 15.5 H16.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.07em", color: "#fff", whiteSpace: "nowrap" }}>
                CYBER PRO
              </span>
              <span className="hidden sm:inline" style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                by AlgorithmX
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Log In</a>
              <motion.a href="/signup?course=cyberstart-pro"
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
            {product.status === "COMING_SOON" && (
              <motion.div className="inline-block px-5 py-2 rounded-full text-xs font-black mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40`, color: PRIMARY }}>
                COMING SOON
              </motion.div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                {DISPLAY_NAME}
              </span>
            </h1>

            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
              style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
              {metaLine}
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Professional workplace cybersecurity. Compliance frameworks, threat analysis, and career pathways. Designed for older teens and adults entering or advancing in the cybersecurity industry.
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
                <CyberIconOrEmoji emoji={product.emoji} size={80} accent="cosmic" />
              </div>
            </motion.div>

            <div className="flex justify-center">
              <WaitlistForm
                courseSlug={product.slug as "cyberstart-pro"}
                accent={PRIMARY}
                accentSoft={ACCENT}
                buttonGradient={GRAD}
                buttonShadow={`0 8px 32px ${PRIMARY}50`}
                source="hero"
              />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-widest text-gray-500">
              Full curriculum coming soon
            </p>
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
                  <div className="mb-4" style={{ lineHeight: 1 }}>
                    <CyberIconOrEmoji emoji={f.emoji} size={36} accent="cosmic" />
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
                Ready to Go{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Pro</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                Launch your cybersecurity career. Be the first to access {DISPLAY_NAME} when it goes live.
              </p>
              <div className="flex justify-center">
                <WaitlistForm
                  courseSlug={product.slug as "cyberstart-pro"}
                  accent={PRIMARY}
                  accentSoft={ACCENT}
                  buttonGradient={GRAD}
                  buttonShadow={`0 8px 40px ${PRIMARY}50`}
                  source="footer-cta"
                />
              </div>
              <div className="mt-6">
                <a href="/hub" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  ← Back to your hub
                </a>
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
              <a href="/cyberexplorers" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Explorers</a>
              <a href="/cyberstart" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">CyberStart</a>
              <a href="/cyberstart-pro" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>CyberStart Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

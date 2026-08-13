"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@prisma/client";
import { DataLabScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";
import WaitlistForm from "@/app/components/WaitlistForm";

// Cosmic violet → cyan for the Pro tier — on-palette with the
// cyber brand and gives the adult product a distinct accent.
const PRIMARY = "#7c5cff";       // cosmic
const ACCENT = "#00e5ff";        // cyan
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const GREEN = "#3ecf8e";         // proof ticks

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
  );
}

/* Copy source: docs/pro/cyber-pro-design.md (claims policy in §9 — no
 * NCSC marks, no job guarantees, no "certification included", no
 * debunked market stats). Alignment claims are the safe trio: CyBOK
 * mapping, Security+ objectives, portfolio-first. */

const ALIGNMENT_CHIPS = [
  "Mapped to CyBOK",
  "Aligned to Security+ objectives",
  "Portfolio-first",
];

const STRAIGHT_ANSWERS = [
  {
    title: "We train the job that actually hires",
    desc: "Security analyst roles are the front door of the industry. Pen testing is a later specialism, not a first job, and any course that promises otherwise is selling you something.",
  },
  {
    title: "Evidence beats certificates",
    desc: "Hiring managers test skills and read portfolios. You finish this course with both the workflow and the proof, plus an honest roadmap for the certifications worth your money.",
  },
  {
    title: "The real timeline, out loud",
    desc: "Nobody goes from zero to hired in a weekend. We tell you what the UK market pays, how long the transition really takes, and exactly what to do with each week of it.",
  },
];

const MASTER_CARDS = [
  { emoji: "🚨", title: "Alert Triage & SIEM", desc: "Work a real analyst's queue. Classify, investigate, and escalate alerts, master one SIEM deeply, and meet the Microsoft stack UK security teams run on." },
  { emoji: "🔍", title: "Reading the Logs", desc: "Windows events, Linux auth trails, and the correlation habits that live log-reading interviews actually test." },
  { emoji: "🎣", title: "Phishing & Identity Attacks", desc: "Take a suspicious email apart end to end: headers, links, attachments, and the account takeover that follows it." },
  { emoji: "🛡️", title: "Incident Response", desc: "Run the full response cycle on simulated intrusions and map every move to MITRE ATT&CK, the way working analysts do." },
  { emoji: "🤖", title: "The AI-Assisted Analyst", desc: "Use AI to enrich, summarise, and draft the way modern security teams do, and learn the verification discipline that keeps you employable." },
  { emoji: "🎯", title: "The Job-Hunt Sprint", desc: "CV translation for career changers, the interview scenarios that come up every time, and a certification roadmap that saves you from expensive mistakes." },
];

const PORTFOLIO_ARTIFACTS = [
  { title: "Three investigation write-ups", desc: "Phishing, identity attack, and malware triage, written like real tickets." },
  { title: "A detection-rules repo", desc: "Rules you wrote and tuned, published with a README that shows how you think." },
  { title: "A vulnerability assessment report", desc: "Findings prioritised and explained for a business audience." },
  { title: "An automation script", desc: "A small, documented tool that does real enrichment work." },
  { title: "A capstone incident report", desc: "One multi-stage intrusion, investigated end to end. Your interview centrepiece." },
];

function metaLineFromProduct(p: Product): string {
  const parts = [`Ages ${p.ageRange}`];
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
  const priceLine = `£${Math.round(product.priceGBP / 100)}`;

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
                {product.name}
              </span>
            </h1>

            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
              style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
              {metaLine}
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              The career-transition course for adults breaking into cybersecurity. Train the analyst&apos;s real workflow, build the evidence employers ask for, and get straight answers about the UK job market.
            </p>

            {/* Alignment row: the safe trio from the claims policy.
                Replaces the former NCSC badge (no assured-training
                assessment behind it; see design doc §9). */}
            <div className="flex justify-center flex-wrap gap-3 mb-10">
              {ALIGNMENT_CHIPS.map((chip, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${PRIMARY}40`,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "#b9a4ff",
                }}>
                  <span aria-hidden style={{ color: GREEN }}>✓</span>
                  {chip}
                </span>
              ))}
            </div>

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
              Full syllabus coming soon
            </p>
          </motion.div>
        </section>

        {/* Straight answers */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT, fontFamily: "ui-monospace, monospace" }}>
              No hype. No job-myth stats.
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Straight{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Answers</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STRAIGHT_ANSWERS.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="rounded-3xl p-6 h-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderTop: `2px solid ${GREEN}55`,
                    backdropFilter: "blur(12px)",
                  }}>
                  <h3 className="font-black text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* What you'll master */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What You&apos;ll{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Master</span>
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              The defensive analyst&apos;s craft, taught the way the job actually runs: investigations first, theory in context.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MASTER_CARDS.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
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

        {/* Finish with a portfolio */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal>
            <div className="rounded-3xl p-8 sm:p-12"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Finish With a{" "}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Portfolio</span>
                </h2>
                <p className="text-gray-400 text-base max-w-2xl mx-auto">
                  Certificates say you studied. A portfolio shows you can do the work. Every stage of the course produces something you can put in front of a hiring manager.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {PORTFOLIO_ARTIFACTS.map((a, i) => (
                  <div key={i} className="rounded-2xl p-5"
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-black mb-2" style={{ color: GREEN, fontFamily: "ui-monospace, monospace" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-black text-white text-sm mb-1.5 leading-snug">{a.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Course facts (price lives here and only here: course landing
            pages are the one surface allowed to carry course info). */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
              {[
                { k: "Price", v: `${priceLine} once` },
                { k: "Access", v: "Lifetime" },
                { k: "Length", v: "20 weeks" },
                { k: "Pace", v: `${product.duration} guided` },
                { k: "Billing", v: "No subscription" },
              ].map((f, i) => (
                <div key={i}>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 mb-1" style={{ fontFamily: "ui-monospace, monospace" }}>{f.k}</div>
                  <div className="text-white font-black text-lg">{f.v}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
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
                Be first in when {product.name} goes live. One payment, a real finish line, and evidence employers ask for.
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
              <a href="/ops" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Ops</a>
              <a href="/cyberstart-pro" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>Cyber Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

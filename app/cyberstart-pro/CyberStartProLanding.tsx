"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@prisma/client";
import { DataLabScene } from "@/app/components/CyberFutureScenes";
import WaitlistForm from "@/app/components/WaitlistForm";

// Cosmic violet → cyan for the Pro tier — on-palette with the cyber
// brand and gives the adult product a distinct accent.
const PRIMARY = "#7c5cff";   // cosmic violet
const ACCENT = "#00e5ff";    // cyan
const GREEN = "#3ecf8e";     // proof / safe
const RED = "#ff5d6c";       // attack
const AMBER = "#ffb454";     // alert
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const MONO = "ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, monospace";

/* Copy source: docs/pro/cyber-pro-design.md (v3) + docs/pro/syllabus.md.
 * This is the from-zero-to-hired course for curious, non-technical
 * adults: taught properly, real systems and real breaches, a real
 * portfolio, honest about the job. Claims policy: aligned to Security+
 * objectives + CyBOK; no NCSC marks, no job guarantees, no debunked
 * stats, no "certification included". No em-dashes in copy. */

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
  );
}

const METHOD = [
  { n: "01", t: "Learn", d: "The idea in plain English, one everyday example, then the real word for it. If a term is new, we teach it before we use it." },
  { n: "02", t: "See", d: "A true story of a real company this happened to, and what it cost them when the basics were missing." },
  { n: "03", t: "Try", d: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break." },
  { n: "04", t: "Explain", d: "Put it in your own words. Being able to explain it is how you know it stuck, and how you talk your way into the job." },
];

const BREACHES = [
  { org: "RockYou", year: "2009", lesson: "32 million passwords, stored in plain text for anyone to read.", tag: "Passwords" },
  { org: "TalkTalk", year: "2015", lesson: "One SQL injection through a forgotten page. A record £400k fine.", tag: "Web attacks" },
  { org: "Colonial Pipeline", year: "2021", lesson: "One account, no second step, and fuel panic across a nation.", tag: "Access control" },
  { org: "Equifax", year: "2017", lesson: "A security update they had for months, ignored. 147 million people.", tag: "Patching" },
  { org: "WannaCry / NHS", year: "2017", lesson: "Unpatched computers, 19,000 hospital appointments cancelled.", tag: "Updates" },
  { org: "British Library", year: "2023", lesson: "Ransomware, and a brutally honest report they published themselves.", tag: "Resilience" },
];

const ACTS = [
  { n: "Act 1", weeks: "Weeks 1 to 5", t: "Foundations you can touch", d: "How the internet, passwords and computers really work. Taught from scratch, hands-on from day one." },
  { n: "Act 2", weeks: "Weeks 6 to 11", t: "How attacks happen", d: "Phishing, malware, web attacks and breaches, each rebuilt so you understand it by doing it." },
  { n: "Act 3", weeks: "Weeks 12 to 16", t: "Defence for real", d: "Become the analyst: read the alerts, run a real SIEM, investigate an intrusion, write the report." },
  { n: "Act 4", weeks: "Weeks 17 to 20", t: "Get hired", d: "Try the roles, build your CV, rehearse the interviews, and finish with a portfolio and a plan." },
];

const PORTFOLIO = [
  { t: "Investigation write-ups", d: "Real incidents you worked, documented like a professional would." },
  { t: "A honeypot capture", d: "Your own server, attacked by real bots, analysed and written up." },
  { t: "A breach you rebuilt", d: "A famous vulnerability, found, exploited and patched by you." },
  { t: "A risk assessment", d: "A small business measured against the basics, in plain business language." },
  { t: "A capstone report", d: "One full intrusion, start to finish, and a briefing anyone could follow." },
];

/* ---------- the "real, not simulated" mockups ---------- */

function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(4,6,14,0.72)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 15px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.75, marginTop: 16 }}>
      {children}
    </div>
  );
}

function PasswordDemo() {
  return (
    <DemoFrame>
      <div style={{ color: "rgba(255,255,255,0.55)" }}>password123</div>
      <div style={{ color: RED }}>cracked instantly</div>
      <div style={{ height: 8 }} />
      <div style={{ color: "rgba(255,255,255,0.55)" }}>purple-tractor-jazz</div>
      <div style={{ color: GREEN }}>safe for centuries</div>
    </DemoFrame>
  );
}

function InjectionDemo() {
  return (
    <DemoFrame>
      <div style={{ color: "rgba(255,255,255,0.65)" }}>
        password = &apos;<span style={{ color: RED, fontWeight: 700 }}>&apos; OR &apos;1&apos;=&apos;1</span>
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>your input, typed into a login box</div>
      <div style={{ height: 8 }} />
      <div style={{ color: RED, fontWeight: 700 }}>&rsaquo; the whole customer table dumped</div>
    </DemoFrame>
  );
}

function HoneypotDemo() {
  return (
    <DemoFrame>
      <div style={{ color: AMBER }}>02:14 FAIL root/admin</div>
      <div style={{ color: AMBER }}>02:15 FAIL root/vizxv</div>
      <div style={{ color: RED, fontWeight: 700 }}>02:15 SUCCESS root/xc3511</div>
      <div style={{ color: GREEN, fontSize: 11 }}>&rsaquo; you found the one that got in</div>
    </DemoFrame>
  );
}

const DEMOS = [
  { week: "Week 1", t: "Crack a password", d: "Type any password and watch a real cracking estimate. See why a long phrase beats a clever one.", demo: <PasswordDemo /> },
  { week: "Week 8", t: "Break into a database", d: "Perform a real SQL injection on a practice site, watch it leak, then apply the one-line fix.", demo: <InjectionDemo /> },
  { week: "Week 13", t: "Catch an attacker", d: "Investigate a real capture of bots attacking a server, and find the single break-in in the noise.", demo: <HoneypotDemo /> },
];

export default function CyberStartProLanding({ product }: { product: Product }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            background: scrolled ? "rgba(10,8,22,0.85)" : "transparent",
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
              <span className="hidden sm:inline" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                by AlgorithmX
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Log In</a>
              <motion.a href="/signup?course=cyberstart-pro"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-white"
                style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                Get Started
              </motion.a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-14 sm:pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] mb-7"
              style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}40`, color: "#c3b3ff", fontFamily: MONO }}>
              For total beginners &middot; 18+
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.08] mb-6">
              You don&apos;t need to be technical to start.
              <br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>You will be by the end.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Cyber Pro is a cybersecurity course that starts from zero. We teach you properly, you practise on real systems in your own browser, and you finish with a portfolio of real work and an honest route to your first job.
            </p>

            <div className="flex justify-center flex-wrap gap-2.5 mb-9">
              {["No experience needed", "Hands-on from week 1", "Aligned to CompTIA Security+"].map((chip, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "7px 14px", borderRadius: 9,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "rgba(255,255,255,0.72)",
                }}>
                  <span aria-hidden style={{ color: GREEN }}>&#10003;</span>{chip}
                </span>
              ))}
            </div>

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
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-500" style={{ fontFamily: MONO }}>
              Ages {product.ageRange} &middot; 20 weeks &middot; {priceLine} once
            </p>
          </motion.div>
        </section>

        {/* Real, not simulated — the differentiator */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-3">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: ACCENT, fontFamily: MONO }}>Real, not simulated</p>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-4" delay={0.05}>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              You won&apos;t just read about it.{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>You&apos;ll do it.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-12" delay={0.1}>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              From your first week you work with real tools on real data, inside your browser. Everything is safe: you cannot break anything, and nothing you do ever leaves the page.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMOS.map((d, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-3xl p-6 h-full flex flex-col"
                  style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${PRIMARY}22`, backdropFilter: "blur(12px)" }}>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: "#b9a4ff", fontFamily: MONO }}>{d.week}</div>
                  <h3 className="font-black text-white text-lg mb-2">{d.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{d.d}</p>
                  {d.demo}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* How you learn */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Taught like you&apos;re{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>smart but new</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-12" delay={0.05}>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">Every single topic follows the same four steps, so you are never lost and never bored.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {METHOD.map((m, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-3xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl font-black mb-3" style={{ color: PRIMARY, fontFamily: MONO }}>{m.n}</div>
                  <h3 className="font-black text-white text-lg mb-2">{m.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{m.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Every lesson is a true story */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Every lesson is a{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>true story</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-12" delay={0.05}>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">You learn each defence by seeing the real company that skipped it, and what it cost them. Real names, real fines, real consequences.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BREACHES.map((b, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="rounded-2xl p-5 h-full" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `2px solid ${RED}66` }}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-black text-white text-base">{b.org}</span>
                    <span className="text-xs text-gray-500" style={{ fontFamily: MONO }}>{b.year}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{b.lesson}</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: "#b9a4ff", fontFamily: MONO }}>{b.tag}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* The journey */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              From zero to{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>job-ready</span>, in four acts
            </h2>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-12" delay={0.05}>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">Twenty weeks, at your own pace. Each act builds on the last.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTS.map((a, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-3xl p-6 h-full flex gap-5" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}20` }}>
                  <div className="flex-shrink-0">
                    <div className="text-sm font-black" style={{ color: PRIMARY, fontFamily: MONO }}>{a.n}</div>
                    <div className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: MONO }}>{a.weeks}</div>
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg mb-1.5">{a.t}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{a.d}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Finish with a portfolio */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal>
            <div className="rounded-3xl p-8 sm:p-12" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  You leave with proof,{" "}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>not just a certificate</span>
                </h2>
                <p className="text-gray-400 text-base max-w-2xl mx-auto">
                  Employers hire people who can show the work. Every part of the course produces something real you can put in front of them.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {PORTFOLIO.map((a, i) => (
                  <div key={i} className="rounded-2xl p-5" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-black mb-2" style={{ color: GREEN, fontFamily: MONO }}>{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="font-black text-white text-sm mb-1.5 leading-snug">{a.t}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{a.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Straight answers */}
        <section className="max-w-[1000px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-3">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: ACCENT, fontFamily: MONO }}>No hype</p>
          </ScrollReveal>
          <ScrollReveal className="text-center mb-10" delay={0.05}>
            <h2 className="text-3xl sm:text-4xl font-black text-white">The honest version</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { t: "It takes real effort", d: "Nobody goes from zero to hired in a weekend. This is a proper 20-week course, and we tell you exactly what each week asks of you." },
              { t: "The first job is realistic", d: "Your way in is usually a support or analyst role, around £25,000 to £32,000 in the UK. We show you that path, not a fantasy one." },
              { t: "We prepare you, honestly", d: "The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth your money. We never promise a job. We make you ready to earn one." },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-3xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderTop: `2px solid ${GREEN}55` }}>
                  <h3 className="font-black text-white text-lg mb-2">{s.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Facts + why £99 */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
          <ScrollReveal>
            <div className="rounded-3xl px-6 py-8 sm:px-10" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-center text-gray-400 text-sm max-w-2xl mx-auto mb-8">
                Free courses leave you to figure it out alone. Bootcamps charge thousands. Cyber Pro sits in between: taught properly, hands-on, for one small payment.
              </p>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
                {[
                  { k: "Price", v: `${priceLine} once` },
                  { k: "Access", v: "Lifetime" },
                  { k: "Length", v: "20 weeks" },
                  { k: "Pace", v: `${product.duration} guided` },
                  { k: "Billing", v: "No subscription" },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 mb-1" style={{ fontFamily: MONO }}>{f.k}</div>
                    <div className="text-white font-black text-lg">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <ScrollReveal>
            <div className="rounded-3xl p-8 sm:p-14 text-center" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Curious enough to{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>start</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                Be first in when {product.name} opens. No experience needed, and you can always change your mind.
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
                  &larr; Back to your hub
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
              <a href="/pro" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>Cyber Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

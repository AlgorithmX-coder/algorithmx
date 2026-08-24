"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@prisma/client";
import CodeRainBg from "@/app/pro/CodeRainBg";

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
  { org: "LastPass", year: "2022", lesson: "Attackers stole customers' encrypted password vaults, and weak master passwords fell.", tag: "Passwords" },
  { org: "23andMe", year: "2023", lesson: "Reused passwords unlocked the DNA profiles of 6.9 million people.", tag: "Reuse & MFA" },
  { org: "MOVEit", year: "2023", lesson: "One SQL-injection flaw breached thousands of organisations at once.", tag: "Web attacks" },
  { org: "Change Healthcare", year: "2024", lesson: "One login with no MFA, and US healthcare billing froze for weeks.", tag: "Access control" },
  { org: "MGM Resorts", year: "2023", lesson: "A single phone call to the help desk shut the casinos for days.", tag: "Social engineering" },
  { org: "Log4Shell", year: "2021", lesson: "One flaw in a free tool put millions of systems at risk overnight.", tag: "Vulnerabilities" },
];

const ACTS = [
  { n: "Act 1", weeks: "Modules 1 to 5", t: "Foundations you can touch", d: "How security, the internet, passwords and cryptography really work. Taught from scratch, hands-on from day one." },
  { n: "Act 2", weeks: "Modules 6 to 11", t: "How attacks happen", d: "Phishing, malware, web and network attacks and the breaches they caused, each rebuilt so you understand it by doing it." },
  { n: "Act 3", weeks: "Modules 12 to 16", t: "Defence for real", d: "Become the analyst: hardening, the SOC, a real SIEM, detection and threat intel, and incident response." },
  { n: "Act 4", weeks: "Modules 17 to 21", t: "Get hired", d: "Governance, scripting, resilience, the roles and cert roadmap, and a capstone. Finish with a portfolio and a plan." },
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
  { week: "Module 3", t: "Crack a password", d: "Type any password and watch a real cracking estimate. See why a long phrase beats a clever one.", demo: <PasswordDemo /> },
  { week: "Module 9", t: "Break into a database", d: "Perform a real SQL injection on a practice site, watch it leak, then apply the one-line fix.", demo: <InjectionDemo /> },
  { week: "Module 14", t: "Catch an attacker", d: "Investigate a real capture of bots attacking a server, and find the single break-in in the noise.", demo: <HoneypotDemo /> },
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
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .cypro-cursor { animation: cyproBlink 1.3s steps(1) infinite; }
        @keyframes cyproBlink { 50% { opacity: 0; } }

        /* ── futuristic HUD system ── */
        .hud-grid { position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(${ACCENT}0e 1px, transparent 1px),
            linear-gradient(90deg, ${PRIMARY}0d 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(130% 82% at 50% -6%, #000 20%, transparent 72%);
          mask-image: radial-gradient(130% 82% at 50% -6%, #000 20%, transparent 72%); }

        .hud-eyebrow { font-family: ${MONO}; font-size: 11px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; color: ${ACCENT}; display: inline-flex; align-items: center; gap: 9px; }
        .hud-eyebrow::before { content: ""; width: 22px; height: 1px; background: ${ACCENT}; box-shadow: 0 0 9px ${ACCENT}; }

        .hud-card { position: relative; background: linear-gradient(158deg, rgba(16,20,44,0.62), rgba(8,10,22,0.5)); border: 1px solid ${ACCENT}26; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); box-shadow: inset 0 0 40px ${ACCENT}0c; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px)); transition: border-color 240ms ease, background 240ms ease; }
        .hud-card:hover { border-color: ${ACCENT}66; background: linear-gradient(158deg, rgba(20,26,54,0.72), rgba(10,13,28,0.58)); }
        .hud-card::before { content: ""; position: absolute; top: 0; left: 0; width: 15px; height: 15px; border-top: 2px solid ${ACCENT}; border-left: 2px solid ${ACCENT}; }
        .hud-card::after { content: ""; position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; border-bottom: 2px solid ${ACCENT}; border-right: 2px solid ${ACCENT}; }
        .hud-card--violet { border-color: ${PRIMARY}33; }
        .hud-card--violet::before, .hud-card--violet::after { border-color: ${PRIMARY}; }
        .hud-card--red { border-color: ${RED}33; }
        .hud-card--red::before, .hud-card--red::after { border-color: ${RED}; }
        .hud-card--red:hover { border-color: ${RED}88; }

        @media (prefers-reduced-motion: reduce) { .cypro-cursor { animation: none; } }
      `}</style>

      <CodeRainBg />
      <div className="hud-grid" aria-hidden />

      <div className="min-h-screen relative" style={{ background: "transparent", zIndex: 1 }}>
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
              <a href="/login?course=cyberstart-pro" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Log In</a>
              <motion.a href="/signup?course=cyberstart-pro"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 text-sm font-black text-white"
                style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50`, clipPath: "polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))" }}>
                Get Started
              </motion.a>
            </div>
          </div>
        </nav>

        {/* Hero — full-bleed, cinematic, code-rain behind */}
        <section className="relative max-w-[980px] mx-auto px-6 md:px-10 min-h-[90vh] flex flex-col justify-center text-center pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] mb-8"
              style={{ background: `${PRIMARY}1f`, border: `1px solid ${PRIMARY}55`, color: "#c9b8ff", fontFamily: MONO, boxShadow: `0 0 24px ${PRIMARY}22`, clipPath: "polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))" }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
              Cyber security &middot; for total beginners &middot; 18+
            </div>

            <h1 className="font-black text-white leading-[1.04] mb-7" style={{ fontSize: "clamp(2.6rem, 6.4vw, 4.6rem)", letterSpacing: "-0.02em" }}>
              You don&apos;t need to be technical to start.
              <br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", filter: `drop-shadow(0 0 30px ${PRIMARY}44)` }}>You will be by the end.</span>
            </h1>

            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto mb-9" style={{ fontSize: "clamp(1rem, 1.4vw, 1.2rem)" }}>
              A cyber security course that starts from zero. We teach you properly, you practise on real systems in your own browser, and you finish with a portfolio of real work and an honest route to your first job.
            </p>

            <div className="flex justify-center flex-wrap gap-2.5 mb-9">
              {["No experience needed", "Hands-on from module 1", "Aligned to CompTIA Security+"].map((chip, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "7px 14px",
                  clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))",
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}22`,
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(6px)",
                }}>
                  <span aria-hidden style={{ color: GREEN }}>&#10003;</span>{chip}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a href="/pro/course" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-black text-white"
                style={{ background: GRAD, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))", boxShadow: `0 8px 40px ${PRIMARY}55` }}>
                Start the course <span aria-hidden>&rarr;</span>
              </motion.a>
              <a href="/signup?course=cyberstart-pro"
                className="inline-flex items-center gap-2 px-7 py-4 text-base font-bold transition-colors hover:text-white"
                style={{ color: ACCENT, border: `1px solid ${ACCENT}55`, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
                Create account
              </a>
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-widest text-gray-500" style={{ fontFamily: MONO }}>
              Ages {product.ageRange} &middot; 21 modules &middot; {priceLine} once &middot; lifetime access
            </p>
          </motion.div>
        </section>

        {/* Real, not simulated — the differentiator */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <ScrollReveal className="text-center mb-3">
            <span className="hud-eyebrow">// Real, not simulated</span>
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
                <div className="hud-card p-6 h-full flex flex-col">
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
                <div className="hud-card hud-card--violet p-6 h-full">
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
                <div className="hud-card hud-card--red p-5 h-full">
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
            <p className="text-gray-400 text-base max-w-2xl mx-auto">Twenty-one modules, at your own pace. Each act builds on the last.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTS.map((a, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="hud-card hud-card--violet p-6 h-full flex gap-5">
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
            <div className="hud-card p-8 sm:p-12">
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
                  <div key={i} className="p-5" style={{ background: "rgba(0,0,0,0.32)", border: `1px solid ${ACCENT}1f`, borderTop: `2px solid ${GREEN}77` }}>
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
            <span className="hud-eyebrow">// No hype</span>
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
                <div className="hud-card p-6 h-full" style={{ background: `linear-gradient(158deg, rgba(20,40,32,0.5), rgba(8,16,14,0.42))` }}>
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
            <div className="hud-card px-6 py-8 sm:px-10">
              <p className="text-center text-gray-400 text-sm max-w-2xl mx-auto mb-8">
                Free courses leave you to figure it out alone. Bootcamps charge thousands. Cyber Pro sits in between: taught properly, hands-on, for one small payment.
              </p>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
                {[
                  { k: "Price", v: `${priceLine} once` },
                  { k: "Access", v: "Lifetime" },
                  { k: "Length", v: "21 modules" },
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
            <div className="hud-card p-8 sm:p-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Curious enough to{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>start</span>?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                No experience needed. Start Module 1 today, work at your own pace, and keep it for life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a href="/pro/course" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-black text-white"
                  style={{ background: GRAD, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))", boxShadow: `0 8px 40px ${PRIMARY}55` }}>
                  Start the course <span aria-hidden>&rarr;</span>
                </motion.a>
                <a href="/signup?course=cyberstart-pro"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-bold transition-colors hover:text-white"
                  style={{ color: ACCENT, border: `1px solid ${ACCENT}55`, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
                  Create account
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

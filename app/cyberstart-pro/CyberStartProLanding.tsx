"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@prisma/client";
import CodeRainBg from "@/app/pro/CodeRainBg";
import WaitlistForm from "@/app/components/WaitlistForm";

/* Cyber Pro landing (marketing / sales page for /pro).
 *
 * Copy source: docs/pro/cyber-pro-design.md (v3) + docs/pro/syllabus.md.
 * The from-zero-to-hired course for curious, non-technical adults:
 * taught properly, real systems and real breaches, a real portfolio, and
 * honest about the job. Claims policy: aligned to the CompTIA Security+
 * objectives + CyBOK; no NCSC marks, no job guarantees, no debunked
 * stats, no "certification included". British spelling. No em-dashes.
 *
 * House rules honoured: fonts come from the self-hosted next/font vars
 * set in app/pro/layout.tsx (--font-pro-display/sans/mono) rather than a
 * runtime Google @import; every section is VISIBLE BY DEFAULT and only
 * gains a one-shot CSS load animation, so the page never depends on
 * scroll-triggered JS to show its content.
 *
 * The primary call to action is STATUS-AWARE, read from the catalogue:
 * while the Product is COMING_SOON the hero offers the waitlist; the
 * moment it is flipped to ACTIVE the same hero offers a real buy button
 * into the existing /purchase seam. Price, age and pace are all read
 * from the Product row, so nothing here hard-codes money. */

const PRIMARY = "#7c5cff"; // cosmic violet
const ACCENT = "#00e5ff"; // cyan
const GREEN = "#3ecf8e"; // proof / safe
const RED = "#ff5d6c"; // attack
const AMBER = "#ffb454"; // alert
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const DISPLAY = "var(--font-pro-display), 'Chakra Petch', sans-serif";
const SANS = "var(--font-pro-sans), 'Nunito', sans-serif";
const MONO = "var(--font-pro-mono), ui-monospace, 'Cascadia Code', Consolas, monospace";

const METHOD = [
  { n: "01", t: "Learn", d: "The idea in plain English, one everyday example, then the real word for it. If a term is new, we teach it before we use it." },
  { n: "02", t: "See", d: "A true story of a real company this happened to, and what it cost them when the basics were missing." },
  { n: "03", t: "Try", d: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break." },
  { n: "04", t: "Explain", d: "Put it in your own words. Being able to explain it is how you know it stuck, and how you talk your way into the job." },
];

const OUTCOMES = [
  "Read a login and network log and spot the one break-in",
  "Run a real SQL injection, then write the one-line fix",
  "Investigate a live honeypot capture like an analyst",
  "Measure a small business against the security basics",
  "Write up an incident the way a professional would",
  "Explain any of it, plainly, in a job interview",
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
  { n: "Act 1", span: "Modules 1 to 5", t: "Foundations you can touch", d: "How security, the internet, passwords and cryptography really work. Taught from scratch, hands-on from day one." },
  { n: "Act 2", span: "Modules 6 to 11", t: "How attacks happen", d: "Phishing, malware, web and network attacks and the breaches they caused, each rebuilt so you understand it by doing it." },
  { n: "Act 3", span: "Modules 12 to 16", t: "Defence for real", d: "Become the analyst: hardening, the SOC, a real SIEM, detection and threat intel, and incident response." },
  { n: "Act 4", span: "Modules 17 to 21", t: "Get hired", d: "Governance, scripting, resilience, the roles and cert roadmap, and a capstone. Finish with a portfolio and a plan." },
];

const PORTFOLIO = [
  { t: "Investigation write-ups", d: "Real incidents you worked, documented like a professional would." },
  { t: "A honeypot capture", d: "Your own server, attacked by real bots, analysed and written up." },
  { t: "A breach you rebuilt", d: "A famous vulnerability, found, exploited and patched by you." },
  { t: "A risk assessment", d: "A small business measured against the basics, in plain business language." },
  { t: "A capstone report", d: "One full intrusion, start to finish, and a briefing anyone could follow." },
];

const FAQ = [
  { q: "I have zero technical background. Is that really okay?", a: "That is exactly who this is built for. Module 1 assumes nothing, every new term is taught before it is used, and you are hands-on from the very first topic." },
  { q: "How much time does it take?", a: "It is self-paced with lifetime access, so you decide. The course is 21 modules across four acts, and each module tells you up front what it asks of you." },
  { q: "Do I get a certificate?", a: "You finish with something stronger: a portfolio of real work. The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth paying for, which you sit with the exam body." },
  { q: "Will this get me a job?", a: "No honest course can promise that. What we can do is make you genuinely ready for a first support or analyst role, and give you the proof of work to show for it." },
  { q: "Is it a subscription?", a: "No. It is one payment for lifetime access. No recurring billing, ever." },
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
  { mod: "Module 3", t: "Crack a password", d: "Type any password and watch a real cracking estimate. See why a long phrase beats a clever one.", demo: <PasswordDemo /> },
  { mod: "Module 9", t: "Break into a database", d: "Perform a real SQL injection on a practice site, watch it leak, then apply the one-line fix.", demo: <InjectionDemo /> },
  { mod: "Module 14", t: "Catch an attacker", d: "Investigate a real capture of bots attacking a server, and find the single break-in in the noise.", demo: <HoneypotDemo /> },
];

/* A section heading. The gradient accent is used sparingly, on the hero
 * and a couple of pivotal headings only, so it keeps its force. */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`relative max-w-[1200px] mx-auto px-6 md:px-10 ${className}`}>{children}</section>;
}

export default function CyberStartProLanding({ product }: { product: Product }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = product.status === "ACTIVE";
  const priceLine = `£${Math.round(product.priceGBP / 100)}`;
  const buyHref = `/purchase/${product.slug}`;

  // One primary call to action, chosen by the catalogue status. The
  // waitlist variant uses the shared WaitlistForm; the live variant is a
  // single prominent button into the existing /purchase seam.
  const PrimaryCta = ({ source }: { source: string }) =>
    isActive ? (
      <div className="flex flex-col items-center gap-3">
        <a href={buyHref} className="cypro-buy" style={{ background: GRAD, boxShadow: `0 10px 36px ${PRIMARY}55` }}>
          Start the course for {priceLine}
          <span aria-hidden>&rarr;</span>
        </a>
        <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>One payment, lifetime access. No subscription.</span>
      </div>
    ) : (
      <WaitlistForm
        courseSlug={product.slug as "cyberstart-pro"}
        accent={PRIMARY}
        accentSoft={ACCENT}
        buttonGradient={GRAD}
        buttonShadow={`0 8px 32px ${PRIMARY}50`}
        source={source}
      />
    );

  return (
    <div className="cypro" style={{ fontFamily: SANS }}>
      <style>{`
        .cypro { color-scheme: dark; }
        .cypro ::selection { background: ${PRIMARY}66; color: #fff; }
        .cypro :focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 3px; border-radius: 6px; }
        .cypro .disp { font-family: ${DISPLAY}; }
        .cypro .mono { font-family: ${MONO}; }

        /* Visible by default; a one-shot load animation, never scroll-gated. */
        @keyframes cyproRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .cypro .rise { animation: cyproRise 0.6s cubic-bezier(0.2,0.7,0.2,1) both; }
        .cypro-cursor { animation: cyproBlink 1.3s steps(1) infinite; }
        @keyframes cyproBlink { 50% { opacity: 0; } }

        .cypro .card { transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
        .cypro .card-hover:hover { transform: translateY(-3px); border-color: ${PRIMARY}66; background: rgba(255,255,255,0.055); }

        .cypro-buy { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; border-radius: 16px; font-family: ${DISPLAY}; font-weight: 700; font-size: 17px; color: #fff; text-decoration: none; transition: transform 160ms ease, box-shadow 160ms ease; }
        .cypro-buy:hover { transform: translateY(-2px); }
        .cypro-getstarted { transition: transform 140ms ease, box-shadow 140ms ease; }
        .cypro-getstarted:hover { transform: scale(1.04); }

        @media (prefers-reduced-motion: reduce) {
          .cypro .rise, .cypro-cursor { animation: none; }
          .cypro .card, .cypro-buy, .cypro-getstarted { transition: none; }
          .cypro .card-hover:hover, .cypro-buy:hover, .cypro-getstarted:hover { transform: none; }
        }
      `}</style>

      <CodeRainBg />

      <div className="min-h-screen relative" style={{ background: "transparent", zIndex: 1 }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(10,8,22,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Cyber Pro by AlgorithmX, home">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden
                style={{ filter: "drop-shadow(0 0 9px rgba(255,122,61,0.35))", flexShrink: 0 }}>
                <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
                <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
                <path className="cypro-cursor" d="M13 15.5 H16.2" strokeLinecap="round" />
              </svg>
              <span className="disp" style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.07em", color: "#fff", whiteSpace: "nowrap" }}>CYBER PRO</span>
              <span className="hidden sm:inline mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>by AlgorithmX</span>
            </Link>
            <div className="flex items-center gap-4">
              <a href="/pro/course" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Browse modules</a>
              <a href={isActive ? buyHref : "/signup?course=cyberstart-pro"}
                className="cypro-getstarted px-5 py-2.5 rounded-2xl text-sm font-black text-white"
                style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                {isActive ? "Get the course" : "Get started"}
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <Section className="min-h-[90vh] max-w-[980px] flex flex-col justify-center text-center pt-28 pb-20">
          <div className="rise">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 mono"
              style={{ background: `${PRIMARY}1f`, border: `1px solid ${PRIMARY}55`, color: "#c9b8ff", boxShadow: `0 0 24px ${PRIMARY}22` }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
              Cyber security &middot; for total beginners &middot; {product.ageRange}
            </div>

            <h1 className="disp font-black text-white leading-[1.04] mb-7" style={{ fontSize: "clamp(2.6rem, 6.4vw, 4.6rem)", letterSpacing: "-0.02em" }}>
              You don&apos;t need to be technical to start.
              <br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", filter: `drop-shadow(0 0 30px ${PRIMARY}44)` }}>You will be by the end.</span>
            </h1>

            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto mb-9" style={{ fontSize: "clamp(1rem, 1.4vw, 1.2rem)" }}>
              A cyber security course that starts from zero. We teach you properly, you practise on real systems in your own browser, and you finish with a portfolio of real work and an honest route to your first job.
            </p>

            <div className="flex justify-center flex-wrap gap-2.5 mb-9">
              {["No experience needed", "Hands-on from module 1", "Aligned to CompTIA Security+"].map((chip) => (
                <span key={chip} className="mono" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 9,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "rgba(255,255,255,0.78)", backdropFilter: "blur(6px)",
                }}>
                  <span aria-hidden style={{ color: GREEN }}>&#10003;</span>{chip}
                </span>
              ))}
            </div>

            <div className="flex justify-center">
              <PrimaryCta source="hero" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <a href="/pro/course" className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: ACCENT }}>
                Explore the 21 modules <span aria-hidden>&rarr;</span>
              </a>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mono">
                Ages {product.ageRange} &middot; 21 modules &middot; {priceLine} once
              </p>
            </div>
          </div>
        </Section>

        {/* Real, not simulated */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: ACCENT }}>Real, not simulated</p></div>
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">
              You won&apos;t just read about it.{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>You&apos;ll do it.</span>
            </h2>
          </div>
          <div className="rise text-center mb-12">
            <p className="text-gray-400 text-base max-w-2xl mx-auto">From your first week you work with real tools on real data, inside your browser. Everything is safe: you cannot break anything, and nothing you do ever leaves the page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMOS.map((d) => (
              <div key={d.t} className="rise card card-hover rounded-3xl p-6 h-full flex flex-col"
                style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${PRIMARY}22`, backdropFilter: "blur(12px)" }}>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-2 mono" style={{ color: "#b9a4ff" }}>{d.mod}</div>
                <h3 className="disp font-black text-white text-lg mb-2">{d.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{d.d}</p>
                {d.demo}
              </div>
            ))}
          </div>
        </Section>

        {/* How you learn */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">Taught like you&apos;re smart but new</h2>
          </div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Every single topic follows the same four steps, so you are never lost and never bored.</p></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {METHOD.map((m) => (
              <div key={m.n} className="rise card rounded-3xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl font-black mb-3 mono" style={{ color: PRIMARY }}>{m.n}</div>
                <h3 className="disp font-black text-white text-lg mb-2">{m.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What you can do by the end */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: GREEN }}>By the end</p></div>
          <div className="rise text-center mb-12">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">Things you&apos;ll actually be able to do</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl mx-auto">
            {OUTCOMES.map((o) => (
              <div key={o} className="rise flex items-start gap-3">
                <span aria-hidden style={{ color: GREEN, flexShrink: 0, marginTop: 2, fontWeight: 900 }}>&#10003;</span>
                <span className="text-gray-200 text-[15px] leading-snug">{o}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Every lesson is a true story */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">
              Every lesson is a{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>true story</span>
            </h2>
          </div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">You learn each defence by seeing the real company that skipped it, and what it cost them. Real names, real fines, real consequences.</p></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BREACHES.map((b) => (
              <div key={b.org} className="rise card card-hover rounded-2xl p-5 h-full" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `2px solid ${RED}66` }}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-black text-white text-base">{b.org}</span>
                  <span className="text-xs text-gray-500 mono">{b.year}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{b.lesson}</p>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] mono" style={{ color: "#b9a4ff" }}>{b.tag}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* The journey */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">
              From zero to{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>job-ready</span>, in four acts
            </h2>
          </div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Twenty-one modules, at your own pace. Each act builds on the last.</p></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTS.map((a) => (
              <div key={a.n} className="rise card card-hover rounded-3xl p-6 h-full flex gap-5" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}20` }}>
                <div className="flex-shrink-0">
                  <div className="text-sm font-black mono" style={{ color: PRIMARY }}>{a.n}</div>
                  <div className="text-[10px] text-gray-500 mt-1 mono">{a.span}</div>
                </div>
                <div>
                  <h3 className="disp font-black text-white text-lg mb-1.5">{a.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rise text-center mt-8">
            <a href="/pro/course" className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: ACCENT }}>
              See every module <span aria-hidden>&rarr;</span>
            </a>
          </div>
        </Section>

        {/* Finish with a portfolio */}
        <Section className="py-16 sm:py-20">
          <div className="rise card rounded-3xl p-8 sm:p-12" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
            <div className="text-center mb-10">
              <h2 className="disp text-3xl sm:text-4xl font-black text-white mb-4">
                You leave with proof,{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>not just a certificate</span>
              </h2>
              <p className="text-gray-400 text-base max-w-2xl mx-auto">Employers hire people who can show the work. Every part of the course produces something real you can put in front of them.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {PORTFOLIO.map((a, i) => (
                <div key={a.t} className="rounded-2xl p-5" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-xs font-black mb-2 mono" style={{ color: GREEN }}>{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="disp font-black text-white text-sm mb-1.5 leading-snug">{a.t}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Straight answers */}
        <section className="relative max-w-[1000px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: ACCENT }}>No hype</p></div>
          <div className="rise text-center mb-10"><h2 className="disp text-3xl sm:text-4xl font-black text-white">The honest version</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { t: "It takes real effort", d: "Nobody goes from zero to hired in a weekend. This is a proper course of 21 modules, and we tell you exactly what each one asks of you." },
              { t: "The first job is realistic", d: "Your way in is usually a support or analyst role, around £25,000 to £32,000 in the UK. We show you that path, not a fantasy one." },
              { t: "We prepare you, honestly", d: "The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth your money. We never promise a job. We make you ready to earn one." },
            ].map((s) => (
              <div key={s.t} className="rise card rounded-3xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderTop: `2px solid ${GREEN}55` }}>
                <h3 className="disp font-black text-white text-lg mb-2">{s.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="relative max-w-[820px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <div className="rise text-center mb-10"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Questions, answered straight</h2></div>
          <div className="flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rise card group rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5">
                  <span className="disp font-black text-white text-base">{f.q}</span>
                  <span aria-hidden className="transition-transform group-open:rotate-45 flex-shrink-0 text-2xl font-light leading-none" style={{ color: ACCENT }}>+</span>
                </summary>
                <p className="text-gray-400 text-sm leading-relaxed px-5 pb-5">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Facts + why the price */}
        <Section className="py-10">
          <div className="rise card rounded-3xl px-6 py-8 sm:px-10" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-center text-gray-400 text-sm max-w-2xl mx-auto mb-8">Free courses leave you to figure it out alone. Bootcamps charge thousands. Cyber Pro sits in between: taught properly, hands-on, for one small payment.</p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
              {[
                { k: "Price", v: `${priceLine} once` },
                { k: "Access", v: "Lifetime" },
                { k: "Length", v: "21 modules" },
                { k: "Pace", v: `${product.duration} guided` },
                { k: "Billing", v: "No subscription" },
              ].map((f) => (
                <div key={f.k}>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 mb-1 mono">{f.k}</div>
                  <div className="disp text-white font-black text-lg">{f.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section className="py-16 sm:py-24">
          <div className="rise card rounded-3xl p-8 sm:p-14 text-center" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
            <h2 className="disp text-3xl sm:text-4xl font-black text-white mb-4">
              Curious enough to{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>start</span>?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
              {isActive
                ? `Everything you need to go from zero to job-ready, for ${priceLine} once. No experience needed.`
                : `Be first in when ${product.name} opens. No experience needed, and you can always change your mind.`}
            </p>
            <div className="flex justify-center">
              <PrimaryCta source="footer-cta" />
            </div>
          </div>
        </Section>

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
    </div>
  );
}

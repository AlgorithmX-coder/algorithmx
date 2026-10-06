"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@prisma/client";
import CodeRainBg from "@/app/pro/CodeRainBg";
import WaitlistForm from "@/app/components/WaitlistForm";

/* Cyber Pro landing (marketing / sales page for /pro).
 *
 * Audience: a curious adult, non-technical or lightly technical, who
 * could be persuaded to HAVE A GO. The page is written to sell the
 * feeling, not list features. Its spine is the one fact that converts:
 * Act 1 (modules 1 to 5) is completely free and playable right now, no
 * sign-up and no card. So the primary call to action everywhere is
 * "start free", dropping the reader straight into module 1, rather than
 * a waitlist. The paid upgrade (Acts 2 to 4) lives in the pricing band
 * and is status-aware: a real buy button once the Product is ACTIVE, a
 * "tell me when it opens" waitlist while it is COMING_SOON.
 *
 * Claims policy: aligned to the CompTIA Security+ objectives + CyBOK; no
 * NCSC marks, no job guarantees, no debunked stats, no "certification
 * included". British spelling. No em-dashes. Age is 18+ (a fixed product
 * fact), stated in copy rather than read from the catalogue; only PRICE
 * stays catalogue-driven, since that is the owner's live lever.
 *
 * House rules: fonts from the self-hosted next/font vars in
 * app/pro/layout.tsx (--font-pro-*), no runtime Google @import; every
 * section is VISIBLE BY DEFAULT with only a one-shot CSS load animation,
 * so content never depends on scroll-triggered JS. */

const PRIMARY = "#7c5cff"; // cosmic violet
const ACCENT = "#00e5ff"; // cyan
const GREEN = "#3ecf8e"; // proof / safe / free
const RED = "#ff5d6c"; // attack
const AMBER = "#ffb454"; // alert
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const DISPLAY = "var(--font-pro-display), 'Chakra Petch', sans-serif";
const SANS = "var(--font-pro-sans), 'Nunito', sans-serif";
const MONO = "var(--font-pro-mono), ui-monospace, 'Cascadia Code', Consolas, monospace";

const START_FREE_HREF = "/pro/module01"; // Act 1 is ungated: straight into a lesson.

const HOOKS = [
  { mod: "Module 3", t: "Crack a password", d: "Type any password and watch a real cracker estimate how fast it falls. See why one long phrase beats a lifetime of clever tricks.", demo: "password" },
  { mod: "Module 9", t: "Break into a database", d: "Run a real SQL injection on a practice site, watch the whole customer table spill out, then fix it with one line.", demo: "injection" },
  { mod: "Module 14", t: "Catch an attacker", d: "Read a real capture of bots hammering a server and find the single break-in hidden in the noise, like an analyst does.", demo: "honeypot" },
];

const METHOD = [
  { n: "01", t: "Learn", d: "The idea in plain English, one everyday example, then the real word for it. If a term is new, we teach it before we use it." },
  { n: "02", t: "See", d: "A true story of a real company this happened to, and what it cost them when the basics were missing." },
  { n: "03", t: "Try", d: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break." },
  { n: "04", t: "Explain", d: "Put it in your own words. Being able to explain it is how you know it stuck, and how you talk your way into the job." },
];

const FORYOU = [
  { t: "Never touched security", d: "You start at the very beginning. Module 1 assumes nothing at all." },
  { t: "Eyeing a career change", d: "A real, in-demand field with a clear first rung. We show you the honest route in." },
  { t: "A bit techy already", d: "You will still learn the proper names, the frameworks and the hands-on craft employers test for." },
  { t: "Want proof you can do it", d: "You finish with a portfolio of real work, not just a line on a CV." },
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
  { n: "Act 1", span: "Modules 1 to 5", t: "Foundations you can touch", d: "How security, the internet, passwords and cryptography really work. Taught from scratch, hands-on from day one.", free: true },
  { n: "Act 2", span: "Modules 6 to 11", t: "How attacks happen", d: "Phishing, malware, web and network attacks and the breaches they caused, each rebuilt so you understand it by doing it.", free: false },
  { n: "Act 3", span: "Modules 12 to 16", t: "Defence for real", d: "Become the analyst: hardening, the SOC, a real SIEM, detection and threat intel, and incident response.", free: false },
  { n: "Act 4", span: "Modules 17 to 21", t: "Get hired", d: "Governance, scripting, resilience, the roles and cert roadmap, and a capstone. Finish with a portfolio and a plan.", free: false },
];

const PORTFOLIO = [
  { t: "Investigation write-ups", d: "Real incidents you worked, documented like a professional would." },
  { t: "A honeypot capture", d: "Your own server, attacked by real bots, analysed and written up." },
  { t: "A breach you rebuilt", d: "A famous vulnerability, found, exploited and patched by you." },
  { t: "A risk assessment", d: "A small business measured against the basics, in plain business language." },
  { t: "A capstone report", d: "One full intrusion, start to finish, and a briefing anyone could follow." },
];

const FAQ = [
  { q: "I have zero technical background. Is that really okay?", a: "That is exactly who this is built for. Module 1 assumes nothing, every new term is taught before it is used, and you are hands-on from the very first topic. If you can use a web browser, you can do this." },
  { q: "Is it really free to start?", a: "Yes. The first five modules, the whole of Act 1, are free with no card and no sign-up. Start now, and only pay if you want to carry on into the rest of the course." },
  { q: "How much time does it take?", a: "It is self-paced with lifetime access, so you decide. The course is 21 modules across four acts, and each module tells you up front what it asks of you." },
  { q: "Do I get a certificate?", a: "You finish with something stronger: a portfolio of real work. The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth paying for, which you sit with the exam body." },
  { q: "Will this get me a job?", a: "No honest course can promise that. What we can do is make you genuinely ready for a first support or analyst role, and give you the proof of work to show for it." },
];

/* ---------- the "real, not simulated" mockups ---------- */

function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(4,6,14,0.72)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 15px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.75, marginTop: 16 }}>
      {children}
    </div>
  );
}

function Demo({ kind }: { kind: string }) {
  if (kind === "password")
    return (
      <DemoFrame>
        <div style={{ color: "rgba(255,255,255,0.55)" }}>password123</div>
        <div style={{ color: RED }}>cracked instantly</div>
        <div style={{ height: 8 }} />
        <div style={{ color: "rgba(255,255,255,0.55)" }}>purple-tractor-jazz</div>
        <div style={{ color: GREEN }}>safe for centuries</div>
      </DemoFrame>
    );
  if (kind === "injection")
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
  return (
    <DemoFrame>
      <div style={{ color: AMBER }}>02:14 FAIL root/admin</div>
      <div style={{ color: AMBER }}>02:15 FAIL root/vizxv</div>
      <div style={{ color: RED, fontWeight: 700 }}>02:15 SUCCESS root/xc3511</div>
      <div style={{ color: GREEN, fontSize: 11 }}>&rsaquo; you found the one that got in</div>
    </DemoFrame>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`relative max-w-[1200px] mx-auto px-6 md:px-10 ${className}`}>{children}</section>;
}

/* The one button that carries the whole page: have a go, free, now. */
function StartFree({ size = "lg", label = "Start module 1, free" }: { size?: "lg" | "md"; label?: string }) {
  const big = size === "lg";
  return (
    <a href={START_FREE_HREF} className="cypro-start"
      style={{ padding: big ? "16px 34px" : "13px 26px", fontSize: big ? 18 : 15, background: GRAD, boxShadow: `0 10px 38px ${PRIMARY}55` }}>
      {label}
      <span aria-hidden>&rarr;</span>
    </a>
  );
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

  return (
    <div className="cypro" style={{ fontFamily: SANS }}>
      <style>{`
        .cypro { color-scheme: dark; }
        .cypro ::selection { background: ${PRIMARY}66; color: #fff; }
        .cypro :focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 3px; border-radius: 6px; }
        .cypro .disp { font-family: ${DISPLAY}; }
        .cypro .mono { font-family: ${MONO}; }

        @keyframes cyproRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .cypro .rise { animation: cyproRise 0.6s cubic-bezier(0.2,0.7,0.2,1) both; }
        .cypro-cursor { animation: cyproBlink 1.3s steps(1) infinite; }
        @keyframes cyproBlink { 50% { opacity: 0; } }

        .cypro .card { transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
        .cypro .card-hover:hover { transform: translateY(-3px); border-color: ${PRIMARY}66; background: rgba(255,255,255,0.055); }

        .cypro-start { display: inline-flex; align-items: center; gap: 10px; border-radius: 16px; font-family: ${DISPLAY}; font-weight: 700; color: #fff; text-decoration: none; transition: transform 160ms ease, box-shadow 160ms ease; white-space: nowrap; }
        .cypro-start:hover { transform: translateY(-2px); box-shadow: 0 14px 46px ${PRIMARY}66; }
        .cypro-ghost { transition: transform 140ms ease, box-shadow 140ms ease; }
        .cypro-ghost:hover { transform: scale(1.04); }

        @media (prefers-reduced-motion: reduce) {
          .cypro .rise, .cypro-cursor { animation: none; }
          .cypro .card, .cypro-start, .cypro-ghost { transition: none; }
          .cypro .card-hover:hover, .cypro-start:hover, .cypro-ghost:hover { transform: none; }
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
              <a href={START_FREE_HREF} className="cypro-ghost px-5 py-2.5 rounded-2xl text-sm font-black text-white" style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                Start free
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <Section className="min-h-[92vh] max-w-[1000px] flex flex-col justify-center text-center pt-28 pb-16">
          <div className="rise">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 mono"
              style={{ background: `${GREEN}1a`, border: `1px solid ${GREEN}66`, color: "#9bf0cb", boxShadow: `0 0 24px ${GREEN}22` }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
              The first 5 modules are free &middot; no card needed
            </div>

            <h1 className="disp font-black text-white leading-[1.04] mb-7" style={{ fontSize: "clamp(2.6rem, 6.4vw, 4.6rem)", letterSpacing: "-0.02em" }}>
              You don&apos;t need to be technical to start.
              <br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", filter: `drop-shadow(0 0 30px ${PRIMARY}44)` }}>You will be by the end.</span>
            </h1>

            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto mb-9" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}>
              Cyber security is one of the best-paid, most in-demand careers going, and far more learnable than it looks. This course takes you from complete beginner to job-ready: taught properly, hands-on in your browser, with a portfolio of real work at the end.
            </p>

            <div className="flex flex-col items-center gap-4">
              <StartFree />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                No sign-up, no card. You are learning in ten seconds.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5 flex-wrap">
              <a href="/pro/course" className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: ACCENT }}>
                See all 21 modules <span aria-hidden>&rarr;</span>
              </a>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mono">18+ &middot; 21 modules &middot; start free</span>
            </div>
          </div>
        </Section>

        {/* The hook: do real things in your first hour */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: ACCENT }}>Real, not simulated</p></div>
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">
              In your first hour, you&apos;ll do{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>this, for real</span>
            </h2>
          </div>
          <div className="rise text-center mb-12">
            <p className="text-gray-400 text-base max-w-2xl mx-auto">No slideshows, no quizzes about hacking. You actually crack a password, break into a database and catch an attacker, all safely in your browser. Nothing you can break, nothing that ever leaves the page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOOKS.map((d) => (
              <div key={d.t} className="rise card card-hover rounded-3xl p-6 h-full flex flex-col"
                style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${PRIMARY}22`, backdropFilter: "blur(12px)" }}>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-2 mono" style={{ color: "#b9a4ff" }}>{d.mod}</div>
                <h3 className="disp font-black text-white text-lg mb-2">{d.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{d.d}</p>
                <Demo kind={d.demo} />
              </div>
            ))}
          </div>
          <div className="rise text-center mt-10"><StartFree size="md" label="Try it now, free" /></div>
        </Section>

        {/* Reassurance: how you learn */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4">
            <h2 className="disp text-3xl sm:text-4xl font-black text-white">Taught like you&apos;re smart but new</h2>
          </div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Every single topic follows the same four steps, so you are never lost and never bored. If you can use a web browser, you can do all of it.</p></div>

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

        {/* Is this for you? */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-10"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Made for you, wherever you&apos;re starting</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FORYOU.map((f) => (
              <div key={f.t} className="rise card card-hover rounded-3xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}22`, borderTop: `2px solid ${ACCENT}66` }}>
                <h3 className="disp font-black text-white text-base mb-2">{f.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* By the end */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: GREEN }}>By the end</p></div>
          <div className="rise text-center mb-12"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Things you&apos;ll actually be able to do</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl mx-auto">
            {OUTCOMES.map((o) => (
              <div key={o} className="rise flex items-start gap-3">
                <span aria-hidden style={{ color: GREEN, flexShrink: 0, marginTop: 2, fontWeight: 900 }}>&#10003;</span>
                <span className="text-gray-200 text-[15px] leading-snug">{o}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* True story */}
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
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Twenty-one modules, at your own pace. Act 1 is free, so you can start today and see for yourself before you spend a penny.</p></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTS.map((a) => (
              <div key={a.n} className="rise card card-hover rounded-3xl p-6 h-full flex gap-5" style={{ background: "rgba(255,255,255,0.04)", border: a.free ? `1px solid ${GREEN}44` : `1px solid ${PRIMARY}20` }}>
                <div className="flex-shrink-0">
                  <div className="text-sm font-black mono" style={{ color: a.free ? GREEN : PRIMARY }}>{a.n}</div>
                  <div className="text-[10px] text-gray-500 mt-1 mono">{a.span}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="disp font-black text-white text-lg">{a.t}</h3>
                    {a.free && <span className="mono" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GREEN, background: `${GREEN}1a`, border: `1px solid ${GREEN}55`, borderRadius: 5, padding: "2px 7px" }}>Free</span>}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rise text-center mt-8"><StartFree size="md" label="Start Act 1, free" /></div>
        </Section>

        {/* Portfolio */}
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

        {/* Honest version */}
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

        {/* Pricing: start free, go all the way for one payment */}
        <Section className="py-10">
          <div className="rise card rounded-3xl px-6 py-10 sm:px-12" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
            <div className="text-center mb-8">
              <h2 className="disp text-2xl sm:text-3xl font-black text-white mb-3">Start free. Go all the way for one payment.</h2>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">The first five modules are free, forever. When you are hooked, one payment unlocks the other sixteen for life. Free courses leave you alone; bootcamps charge thousands. Cyber Pro sits in between.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center mb-9">
              {[
                { k: "Act 1", v: "Free" },
                { k: "Full course", v: `${priceLine} once` },
                { k: "Access", v: "Lifetime" },
                { k: "Length", v: "21 modules" },
                { k: "Billing", v: "No subscription" },
              ].map((f) => (
                <div key={f.k}>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 mb-1 mono">{f.k}</div>
                  <div className="disp text-white font-black text-lg">{f.v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              <StartFree label="Start the free modules" />
              <div className="text-sm">
                {isActive ? (
                  <a href={buyHref} className="font-bold transition-colors" style={{ color: ACCENT }}>or unlock everything now for {priceLine} &rarr;</a>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Want the full course the moment it opens?</span>
                    <WaitlistForm courseSlug={product.slug as "cyberstart-pro"} accent={PRIMARY} accentSoft={ACCENT} buttonGradient={GRAD} buttonShadow={`0 8px 32px ${PRIMARY}50`} source="pricing" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section className="py-16 sm:py-24">
          <div className="rise card rounded-3xl p-8 sm:p-14 text-center" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25`, backdropFilter: "blur(16px)" }}>
            <h2 className="disp text-3xl sm:text-4xl font-black text-white mb-4">
              Curious enough to{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>have a go</span>?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
              The first module is free and takes minutes to start. No experience needed, no card, nothing to lose.
            </p>
            <div className="flex justify-center"><StartFree /></div>
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

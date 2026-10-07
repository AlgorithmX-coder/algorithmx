"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import CodeRainBg from "@/app/pro/CodeRainBg";
import WaitlistForm from "@/app/components/WaitlistForm";

/* Cyber Pro landing (marketing / sales page for /pro).
 *
 * Built for conversion on a PAID model: there is no free tier. Access is
 * one payment for the whole 21-module course, lifetime, no subscription.
 * The page still lets a visitor taste the product in the hero (a real,
 * honest password cracker, a genuine slice of Module 3) to build desire,
 * then drives to a single purchase.
 *
 * Primary CTA is status-aware: a buy button into /purchase once the
 * Product is ACTIVE; while it is COMING_SOON (checkout not live yet) the
 * CTA points at the enrol band, which offers a "be first in" waitlist.
 * PRICE is catalogue-driven (the owner's live lever). Age is 18+, a fixed
 * fact, in copy.
 *
 * Design intent: break the flat-card look. A two-column interactive hero,
 * framed "real app" panels with depth and glow, a vertical path for the
 * journey. Claims policy: aligned to the CompTIA Security+ objectives +
 * CyBOK; no NCSC marks, no job guarantees, no invented statistics, no
 * "certification included". British spelling. No em-dashes. Fonts from the
 * self-hosted next/font vars (--font-pro-*); sections visible by default. */

const PRIMARY = "#7c5cff";
const ACCENT = "#00e5ff";
const GREEN = "#3ecf8e";
const RED = "#ff5d6c";
const AMBER = "#ffb454";
const GRAD = `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`;
const DISPLAY = "var(--font-pro-display), 'Chakra Petch', sans-serif";
const SANS = "var(--font-pro-sans), 'Nunito', sans-serif";
const MONO = "var(--font-pro-mono), ui-monospace, 'Cascadia Code', Consolas, monospace";

const ENROL_ANCHOR = "#enrol";

/* ---------------- the live hero demo: a real password cracker ---------------- */

const WORDLIST = new Set([
  "password", "password1", "password123", "123456", "12345678", "123456789",
  "qwerty", "letmein", "welcome", "admin", "iloveyou", "111111", "abc123",
  "monkey", "dragon", "football", "sunshine", "princess", "qwerty123", "000000",
]);

function crackEstimate(pw: string): { verdict: string; detail: string; colour: string; pct: number } {
  if (!pw) return { verdict: "Type a password above", detail: "and watch how long it would take to crack.", colour: "rgba(255,255,255,0.4)", pct: 0 };
  if (WORDLIST.has(pw.toLowerCase())) return { verdict: "Cracked instantly", detail: "It is on every attacker's wordlist. The length does not matter.", colour: RED, pct: 4 };

  const pool =
    (/[a-z]/.test(pw) ? 26 : 0) +
    (/[A-Z]/.test(pw) ? 26 : 0) +
    (/[0-9]/.test(pw) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 33 : 0);
  const rate = 1e10; // 10 billion guesses/sec, a realistic offline fast-hash rig
  const log10Guesses = pw.length * Math.log10(Math.max(pool, 1));
  const log10Seconds = log10Guesses - Math.log10(rate);
  const pct = Math.max(4, Math.min(100, Math.round((log10Guesses / 20) * 100)));

  const YEAR = 7.4;
  let verdict: string;
  let colour: string;
  if (log10Seconds < 0) { verdict = "Cracked instantly"; colour = RED; }
  else if (log10Seconds < 1.78) { verdict = "Cracked in seconds"; colour = RED; }
  else if (log10Seconds < 3.56) { verdict = "Cracked in minutes"; colour = AMBER; }
  else if (log10Seconds < 4.94) { verdict = "Cracked in hours"; colour = AMBER; }
  else if (log10Seconds < 6.5) { verdict = "Cracked in days"; colour = "#d7d24a"; }
  else if (log10Seconds < YEAR) { verdict = "Holds for months"; colour = GREEN; }
  else if (log10Seconds < 9.5) { verdict = "Safe for years"; colour = GREEN; }
  else if (log10Seconds < 12.5) { verdict = "Safe for centuries"; colour = GREEN; }
  else { verdict = "Safe past the end of time"; colour = GREEN; }

  const detail =
    colour === RED ? "Short or simple. An attacker's laptop chews through this."
    : colour === AMBER || colour === "#d7d24a" ? "Getting there. A little longer and it flips to safe."
    : "This is the whole trick: length beats cleverness. You will learn why.";
  return { verdict, detail, colour, pct };
}

function PasswordLab() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(true);
  const r = useMemo(() => crackEstimate(pw), [pw]);
  return (
    <div className="rise" style={{ background: "rgba(6,8,16,0.82)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${PRIMARY}22`, overflow: "hidden", backdropFilter: "blur(10px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 15px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span className="mono" style={{ marginLeft: 8, fontSize: 10.5, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Module 3 &middot; Password Lab</span>
      </div>
      <div style={{ padding: "22px 20px 24px" }}>
        <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", marginBottom: 9, textTransform: "uppercase" }}>Try a password</label>
        <div style={{ position: "relative", marginBottom: 18 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value.slice(0, 40))}
            placeholder="type here..."
            autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
            aria-label="Try a password to see how long it takes to crack"
            className="mono"
            style={{ width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 11, padding: "14px 54px 14px 15px", color: "#fff", fontSize: 16, outline: "none" }}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
            className="mono" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "6px 9px", fontSize: 10, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>
            {show ? "hide" : "show"}
          </button>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${r.pct}%`, background: r.colour, borderRadius: 99, transition: "width 220ms ease, background 220ms ease" }} />
        </div>
        <div className="disp" style={{ fontSize: 20, fontWeight: 700, color: r.colour, marginBottom: 4, transition: "color 220ms ease" }}>{r.verdict}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.62)", minHeight: 38 }}>{r.detail}</p>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ color: ACCENT }}>&rsaquo;</span>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>A taste of Module 3. All 21 are hands-on like this.</span>
      </div>
    </div>
  );
}

/* ---------------- content ---------------- */

const HOOKS = [
  { mod: "Module 9", t: "Break into a database", d: "Run a real SQL injection on a practice site, watch the whole customer table spill out, then fix it with one line.", lines: [["password = '", "rgba(255,255,255,0.65)"], ["' OR '1'='1", RED], [">> the whole customer table dumped", RED]] },
  { mod: "Module 14", t: "Catch an attacker", d: "Read a real capture of bots hammering a server and find the single break-in hidden in the noise, like an analyst.", lines: [["02:14 FAIL root/admin", AMBER], ["02:15 SUCCESS root/xc3511", RED], [">> you found the one that got in", GREEN]] },
  { mod: "Module 16", t: "Work a real incident", d: "Contain a live intrusion, trace how far it spread, and write the report a manager would actually act on.", lines: [["alert: lateral movement", AMBER], ["contained host-07", GREEN], [">> incident report filed", GREEN]] },
];

const METHOD = [
  { n: "01", t: "Learn", d: "The idea in plain English, one everyday example, then the real word for it. New terms are taught before they are used." },
  { n: "02", t: "See", d: "A true story of a real company this happened to, and what it cost them when the basics were missing." },
  { n: "03", t: "Try", d: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break." },
  { n: "04", t: "Explain", d: "Put it in your own words. Explaining it is how you know it stuck, and how you talk your way into the job." },
];

const FORYOU = [
  { t: "Never touched security", d: "You start at the very beginning. Module 1 assumes nothing at all." },
  { t: "Eyeing a career change", d: "A real, in-demand field with a clear first rung. We show you the honest route in." },
  { t: "A bit techy already", d: "You will still learn the proper names, the frameworks and the hands-on craft employers test for." },
  { t: "Want proof you can do it", d: "You finish with a portfolio of real work, not just a line on a CV." },
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
  { q: "I have zero technical background. Is that really okay?", a: "That is exactly who this is built for. Module 1 assumes nothing, every new term is taught before it is used, and you are hands-on from the very first topic. If you can use a web browser, you can do this." },
  { q: "What exactly do I get for my money?", a: "All 21 modules across four acts, every hands-on lab, the portfolio pieces you build along the way, and lifetime access. One payment, no subscription." },
  { q: "How much time does it take?", a: "It is self-paced with lifetime access, so you decide. The course is 21 modules across four acts, and each module tells you up front what it asks of you." },
  { q: "Do I get a certificate?", a: "You finish with something stronger: a portfolio of real work. The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth paying for, which you sit with the exam body." },
  { q: "Will this get me a job?", a: "No honest course can promise that. What we can do is make you genuinely ready for a first support or analyst role, and give you the proof of work to show for it." },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`relative max-w-[1180px] mx-auto px-6 md:px-10 ${className}`}>{children}</section>;
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

  // One paid call to action. Buy straight into checkout when the course is
  // live; otherwise point at the enrol band, which carries the waitlist.
  function Cta({ size = "lg", label }: { size?: "lg" | "md"; label?: string }) {
    const big = size === "lg";
    const href = isActive ? buyHref : ENROL_ANCHOR;
    const text = label ?? (isActive ? `Get the course for ${priceLine}` : "Enrol now");
    return (
      <a href={href} className="cypro-start" style={{ padding: big ? "16px 34px" : "13px 26px", fontSize: big ? 18 : 15, background: GRAD, boxShadow: `0 10px 38px ${PRIMARY}55` }}>
        {text}
        <span aria-hidden>&rarr;</span>
      </a>
    );
  }

  return (
    <div className="cypro" style={{ fontFamily: SANS }}>
      <style>{`
        .cypro { color-scheme: dark; }
        .cypro ::selection { background: ${PRIMARY}66; color: #fff; }
        .cypro :focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 3px; border-radius: 6px; }
        .cypro .disp { font-family: ${DISPLAY}; }
        .cypro .mono { font-family: ${MONO}; }
        .cypro .glow { position:absolute; border-radius:50%; filter: blur(90px); opacity:0.5; pointer-events:none; z-index:0; }

        @keyframes cyproRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .cypro .rise { animation: cyproRise 0.6s cubic-bezier(0.2,0.7,0.2,1) both; }
        .cypro-cursor { animation: cyproBlink 1.3s steps(1) infinite; }
        @keyframes cyproBlink { 50% { opacity: 0; } }

        .cypro .card { transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
        .cypro .card-hover:hover { transform: translateY(-3px); border-color: ${PRIMARY}66; background: rgba(255,255,255,0.055); }

        .cypro-start { display:inline-flex; align-items:center; gap:10px; border-radius:16px; font-family:${DISPLAY}; font-weight:700; color:#fff; text-decoration:none; transition: transform 160ms ease, box-shadow 160ms ease; white-space:nowrap; }
        .cypro-start:hover { transform: translateY(-2px); box-shadow: 0 14px 46px ${PRIMARY}66; }
        .cypro-ghost { transition: transform 140ms ease; }
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
          style={{ background: scrolled ? "rgba(10,8,22,0.85)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent" }}>
          <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Cyber Pro by AlgorithmX, home">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden style={{ filter: "drop-shadow(0 0 9px rgba(255,122,61,0.35))", flexShrink: 0 }}>
                <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
                <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
                <path className="cypro-cursor" d="M13 15.5 H16.2" strokeLinecap="round" />
              </svg>
              <span className="disp" style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.07em", color: "#fff", whiteSpace: "nowrap" }}>CYBER PRO</span>
              <span className="hidden sm:inline mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>by AlgorithmX</span>
            </Link>
            <div className="flex items-center gap-4">
              <a href="/pro/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Sign in</a>
              <a href="/pro/course" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">See the course</a>
              <a href={isActive ? buyHref : ENROL_ANCHOR} className="cypro-ghost px-5 py-2.5 rounded-2xl text-sm font-black text-white" style={{ background: GRAD, boxShadow: `0 4px 20px ${PRIMARY}50` }}>
                {isActive ? "Get the course" : "Enrol"}
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <Section className="pt-32 pb-16 md:pt-36 md:pb-20 overflow-hidden">
          <div className="glow" style={{ width: 520, height: 520, background: PRIMARY, top: -120, left: -80 }} />
          <div className="glow" style={{ width: 460, height: 460, background: ACCENT, top: 40, right: -100, opacity: 0.35 }} />
          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center" style={{ zIndex: 1 }}>
            <div className="rise text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] mb-7 mono"
                style={{ background: `${PRIMARY}1f`, border: `1px solid ${PRIMARY}55`, color: "#c9b8ff" }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
                From total beginner to job-ready
              </div>
              <h1 className="disp font-black text-white leading-[1.05] mb-6" style={{ fontSize: "clamp(2.5rem, 5.4vw, 4.2rem)", letterSpacing: "-0.02em" }}>
                You don&apos;t need to be technical to start.{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", filter: `drop-shadow(0 0 30px ${PRIMARY}44)` }}>You will be by the end.</span>
              </h1>
              <p className="text-gray-300 leading-relaxed mb-8 mx-auto lg:mx-0" style={{ fontSize: "clamp(1.02rem, 1.3vw, 1.18rem)", maxWidth: "34ch" }}>
                Cyber security is one of the best-paid, most in-demand careers going, and far more learnable than it looks. Learn it from zero by doing, right in your browser.
              </p>
              <div className="flex flex-col items-center lg:items-start gap-4">
                <Cta />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>One payment. Lifetime access. No subscription.</p>
              </div>
              <div className="mt-7 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                <a href="/pro/course" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: ACCENT }}>See all 21 modules <span aria-hidden>&rarr;</span></a>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mono">18+ &middot; 21 modules</span>
              </div>
            </div>
            <PasswordLab />
          </div>
        </Section>

        {/* Do real things */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: ACCENT }}>Real, not simulated</p></div>
          <div className="rise text-center mb-4"><h2 className="disp text-3xl sm:text-4xl font-black text-white">You just cracked a password. <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>Next, you&apos;ll do this.</span></h2></div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">No slideshows, no multiple-choice quizzes about hacking. You do the real thing, safely, in your browser. Nothing you can break, nothing that ever leaves the page.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOOKS.map((d) => (
              <div key={d.t} className="rise card card-hover rounded-2xl overflow-hidden h-full flex flex-col" style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${PRIMARY}22` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} /><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} /><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
                  <span className="mono" style={{ marginLeft: 6, fontSize: 9.5, letterSpacing: "0.1em", color: "#b9a4ff", textTransform: "uppercase" }}>{d.mod}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="disp font-black text-white text-lg mb-2">{d.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{d.d}</p>
                  <div className="mono" style={{ background: "rgba(4,6,14,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "11px 13px", fontSize: 12, lineHeight: 1.7 }}>
                    {d.lines.map((l, i) => (<div key={i} style={{ color: l[1] as string, fontWeight: (l[1] === RED || l[1] === GREEN) ? 700 : 400 }}>{l[0]}</div>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rise text-center mt-10"><Cta size="md" label="Get the course" /></div>
        </Section>

        {/* Why cyber */}
        <Section className="py-16 sm:py-20">
          <div className="rise card rounded-3xl p-8 sm:p-12 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}25` }}>
            <div className="glow" style={{ width: 360, height: 360, background: ACCENT, top: -120, right: -80, opacity: 0.25 }} />
            <div className="relative grid md:grid-cols-[1fr_1fr] gap-10 items-center" style={{ zIndex: 1 }}>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] mono mb-3" style={{ color: ACCENT }}>Why now</p>
                <h2 className="disp text-3xl sm:text-4xl font-black text-white mb-4">A real career, not a hobby</h2>
                <p className="text-gray-300 text-base leading-relaxed mb-4">Organisations everywhere are short of people who can defend them, and they hire on proof of skill far more than on a degree. That is the opening this course is built to get you through.</p>
                <p className="text-gray-400 text-sm leading-relaxed">You start from nothing and finish ready for a first real role, with the hands-on work to show for it.</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { t: "In demand", d: "Defenders are wanted in every industry, in every town." },
                  { t: "Hired on skill", d: "Show what you can do and the door opens, degree or not." },
                  { t: "Yours for life", d: "Learn it once in your browser, use it for a whole career." },
                ].map((x) => (
                  <div key={x.t} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span aria-hidden style={{ color: GREEN, fontWeight: 900, marginTop: 1 }}>&#10003;</span>
                    <div><div className="disp font-black text-white text-base">{x.t}</div><div className="text-gray-400 text-sm">{x.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* How you learn */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Taught like you&apos;re smart but new</h2></div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Every topic follows the same four steps, so you are never lost and never bored. If you can use a web browser, you can do all of it.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {METHOD.map((m) => (
              <div key={m.n} className="rise card rounded-2xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl font-black mb-3 mono" style={{ color: PRIMARY }}>{m.n}</div>
                <h3 className="disp font-black text-white text-lg mb-2">{m.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* For you */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-10"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Made for you, wherever you&apos;re starting</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FORYOU.map((f) => (
              <div key={f.t} className="rise card card-hover rounded-2xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}22`, borderTop: `2px solid ${ACCENT}66` }}>
                <h3 className="disp font-black text-white text-base mb-2">{f.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Journey */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4"><h2 className="disp text-3xl sm:text-4xl font-black text-white">From zero to <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>job-ready</span>, in four acts</h2></div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">Twenty-one modules at your own pace, each act building on the last, taking you from your first login to a job-ready analyst.</p></div>
          <div className="relative max-w-3xl mx-auto">
            <div aria-hidden className="hidden sm:block" style={{ position: "absolute", left: 27, top: 10, bottom: 10, width: 2, background: `linear-gradient(${PRIMARY}, ${ACCENT})`, opacity: 0.4 }} />
            <div className="flex flex-col gap-5">
              {ACTS.map((a) => (
                <div key={a.n} className="rise flex gap-5 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center rounded-2xl mono" style={{ width: 56, height: 56, background: "rgba(255,255,255,0.05)", border: `1px solid ${PRIMARY}55`, color: "#c9b8ff", fontWeight: 800, fontSize: 13, zIndex: 1 }}>{a.n.replace("Act ", "A")}</div>
                  <div className="card rounded-2xl p-5 flex-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="disp font-black text-white text-lg">{a.t}</h3>
                      <span className="mono text-gray-500" style={{ fontSize: 11 }}>&middot; {a.span}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{a.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rise text-center mt-10"><Cta size="md" label="Get the course" /></div>
        </Section>

        {/* Portfolio */}
        <Section className="py-16 sm:py-20">
          <div className="rise card rounded-3xl p-8 sm:p-12" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25` }}>
            <div className="text-center mb-10">
              <h2 className="disp text-3xl sm:text-4xl font-black text-white mb-4">You leave with proof, <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>not just a certificate</span></h2>
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

        {/* True stories */}
        <Section className="py-16 sm:py-20">
          <div className="rise text-center mb-4"><h2 className="disp text-3xl sm:text-4xl font-black text-white">Every lesson is a <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>true story</span></h2></div>
          <div className="rise text-center mb-12"><p className="text-gray-400 text-base max-w-2xl mx-auto">You learn each defence by seeing the real company that skipped it, and what it cost them. Real names, real fines, real consequences.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BREACHES.map((b) => (
              <div key={b.org} className="rise card card-hover rounded-2xl p-5 h-full" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `2px solid ${RED}66` }}>
                <div className="flex items-baseline gap-2 mb-2"><span className="font-black text-white text-base">{b.org}</span><span className="text-xs text-gray-500 mono">{b.year}</span></div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{b.lesson}</p>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] mono" style={{ color: "#b9a4ff" }}>{b.tag}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Honest */}
        <section className="relative max-w-[1000px] mx-auto px-6 md:px-10 py-16 sm:py-20">
          <div className="rise text-center mb-3"><p className="text-xs font-black uppercase tracking-[0.3em] mono" style={{ color: ACCENT }}>No hype</p></div>
          <div className="rise text-center mb-10"><h2 className="disp text-3xl sm:text-4xl font-black text-white">The honest version</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { t: "It takes real effort", d: "Nobody goes from zero to hired in a weekend. This is a proper course of 21 modules, and we tell you exactly what each one asks of you." },
              { t: "The first job is realistic", d: "Your way in is usually a support or analyst role, around £25,000 to £32,000 in the UK. We show you that path, not a fantasy one." },
              { t: "We prepare you, honestly", d: "The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth your money. We never promise a job. We make you ready to earn one." },
            ].map((s) => (
              <div key={s.t} className="rise card rounded-2xl p-6 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderTop: `2px solid ${GREEN}55` }}>
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

        {/* Enrol / pricing */}
        <Section className="py-10">
          <div id="enrol" className="rise card rounded-3xl px-6 py-10 sm:px-12 relative overflow-hidden" style={{ scrollMarginTop: 90, background: "rgba(255,255,255,0.04)", border: `1px solid ${PRIMARY}25` }}>
            <div className="glow" style={{ width: 380, height: 380, background: PRIMARY, bottom: -160, left: "40%", opacity: 0.3 }} />
            <div className="relative" style={{ zIndex: 1 }}>
              <div className="text-center mb-8">
                <h2 className="disp text-2xl sm:text-3xl font-black text-white mb-3">Everything, for one payment</h2>
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">All 21 modules, every lab, your portfolio and lifetime access, for a single price. No subscription, ever. Free courses leave you alone and bootcamps charge thousands; Cyber Pro is one fair payment in between.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center mb-9">
                {[{ k: "Price", v: `${priceLine} once` }, { k: "Access", v: "Lifetime" }, { k: "Length", v: "21 modules" }, { k: "Level", v: "Zero to hired" }, { k: "Billing", v: "No subscription" }].map((f) => (
                  <div key={f.k}><div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 mb-1 mono">{f.k}</div><div className="disp text-white font-black text-lg">{f.v}</div></div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-4">
                {isActive ? (
                  <Cta label={`Get the course for ${priceLine}`} />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <span className="disp font-black text-white text-base">Opening very soon.</span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Leave your email and be first in line.</span>
                    <WaitlistForm courseSlug={product.slug as "cyberstart-pro"} accent={PRIMARY} accentSoft={ACCENT} buttonGradient={GRAD} buttonShadow={`0 8px 32px ${PRIMARY}50`} source="enrol" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section className="py-16 sm:py-24">
          <div className="rise text-center">
            <h2 className="disp text-4xl sm:text-5xl font-black text-white mb-5" style={{ letterSpacing: "-0.02em" }}>Ready to start your <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>cyber career</span>?</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">Twenty-one modules, one payment, lifetime access. Everything you need to go from zero to job-ready.</p>
            <div className="flex justify-center"><Cta /></div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX</span>
            <div className="flex items-center gap-6 flex-wrap">
              <a href="/cyberheroes" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Heroes</a>
              <a href="/cyberexplorers" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Explorers</a>
              <a href="/ops" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Cyber Ops</a>
              <a href="/pro" className="text-xs font-bold" style={{ color: PRIMARY }}>Cyber Pro</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

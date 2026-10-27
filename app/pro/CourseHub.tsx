"use client";

import { useEffect, useState } from "react";
import { T } from "./learn/tokens";
import CodeRainBg from "./CodeRainBg";
import ReadinessMeter from "./ReadinessMeter";

/* The Cyber Pro course hub: every module, grouped into the four acts, with
 * a clear route into the ones that are built. Static and link-based so it
 * stays fast and robust.
 *
 * Structure pass (owner 2026-10-16: "make the module structure clearer,
 * headings standing out more"): each act now opens with a bold, accent-
 * banded header (a large numbered tile, an "ACT n · N modules" kicker, a
 * real h2 name) and a quick-nav jumps between the four acts. Module titles
 * are h3s with accent number badges, so the hierarchy reads at a glance. */

type Status = "live" | "preview" | "soon";
type Mod = { n: number; title: string; blurb: string; tag: string; href?: string; status: Status };
type Act = { cls: string; tag: string; name: string; focus: string; modules: Mod[] };

const ACTS: Act[] = [
  {
    cls: "a1", tag: "Act 1", name: "Foundations you can touch", focus: "The language every certificate starts with.",
    modules: [
      { n: 1, title: "What security actually means", blurb: "The core ideas every certificate opens with: the CIA triad, risk, and thinking like a defender.", tag: "Security+ 1.0", href: "/pro/module01", status: "live" },
      { n: 2, title: "How the internet actually works", blurb: "The plumbing attackers use, from IP and DNS to HTTPS, explained without jargon.", tag: "Security+ 3.0", href: "/pro/module02", status: "live" },
      { n: 3, title: "Passwords & account security", blurb: "How passwords are really stored and cracked, and how to lock down your own accounts.", tag: "Security+ 4.0", href: "/pro/module03", status: "live" },
      { n: 4, title: "Cryptography without the maths", blurb: "Why the padlock means something: encryption, hashing and certificates in plain terms.", tag: "Security+ 1.4", href: "/pro/module04", status: "live" },
      { n: 5, title: "Law, ethics & your first audit", blurb: "The Computer Misuse Act, data protection, and your first real portfolio piece.", tag: "Security+ 5.0", href: "/pro/module05", status: "live" },
    ],
  },
  {
    cls: "a2", tag: "Act 2", name: "How attacks happen", focus: "Threats, vulnerabilities and the breaches they caused.",
    modules: [
      { n: 6, title: "Who the attackers are", blurb: "The real threat actors and the lifecycle of an attack, from recon to impact.", tag: "Security+ 2.1", href: "/pro/module06", status: "live" },
      { n: 7, title: "Social engineering & phishing", blurb: "Why people are the easiest way in, and how to spot and report it.", tag: "Security+ 2.2", href: "/pro/module07", status: "live" },
      { n: 8, title: "Malware: how it really works", blurb: "Viruses, ransomware, and how infection actually happens.", tag: "Security+ 2.4", href: "/pro/module08", status: "live" },
      { n: 9, title: "Web attacks & the OWASP Top 10", blurb: "How web apps get broken, and you run a real SQL injection yourself.", tag: "OWASP Top 10", href: "/pro/module09", status: "live" },
      { n: 10, title: "Networks & Wi-Fi under attack", blurb: "Eavesdropping, spoofing, denial of service, and moving through a network.", tag: "Security+ 2.4", href: "/pro/module10", status: "live" },
      { n: 11, title: "Vulnerabilities & patching", blurb: "What a vulnerability really is, and the race to patch it before attackers strike.", tag: "Security+ 2.5", href: "/pro/module11", status: "live" },
    ],
  },
  {
    cls: "a3", tag: "Act 3", name: "Defence for real", focus: "Security operations and the SOC job.",
    modules: [
      { n: 12, title: "Hardening & secure configuration", blurb: "Closing the doors, using the Cyber Essentials five controls as your checklist.", tag: "Cyber Essentials", href: "/pro/module12", status: "live" },
      { n: 13, title: "The SOC & the analyst's day", blurb: "The most common first job in cyber security, seen from the inside.", tag: "Security+ 4.0", href: "/pro/module13", status: "live" },
      { n: 14, title: "Logs & the SIEM", blurb: "Reading what attackers leave behind, on real honeypot data.", tag: "Security+ 4.0", href: "/pro/module14", status: "live" },
      { n: 15, title: "Detection & threat intelligence", blurb: "Spotting the attack, and knowing your enemy with MITRE ATT&CK.", tag: "MITRE ATT&CK", href: "/pro/module15", status: "live" },
      { n: 16, title: "Incident response & forensics", blurb: "When it goes wrong: contain, investigate, recover.", tag: "NIST 800-61", href: "/pro/module16", status: "live" },
    ],
  },
  {
    cls: "a4", tag: "Act 4", name: "Get hired", focus: "Governance, scripting and the career on-ramp.",
    modules: [
      { n: 17, title: "Governance, risk & compliance", blurb: "The huge hiring lane most beginners never hear about.", tag: "Security+ 5.0", href: "/pro/module17", status: "live" },
      { n: 18, title: "Scripting for defenders", blurb: "A little real code goes a long way: parse logs, check input, automate.", tag: "Code Lab", href: "/pro/code", status: "live" },
      { n: 19, title: "Resilience: backups & continuity", blurb: "Surviving the bad day, from ransomware to disaster recovery.", tag: "Security+ 3.0", href: "/pro/module19", status: "live" },
      { n: 20, title: "The roles & the cert roadmap", blurb: "Which job, which certificate, and the honest state of the market.", tag: "Career map", href: "/pro/module20", status: "live" },
      { n: 21, title: "The job machinery + capstone", blurb: "Everything you built, turned into a CV, a portfolio and an offer.", tag: "Capstone", href: "/pro/module21", status: "live" },
    ],
  },
];

function Pill({ status }: { status: Status }) {
  const map = {
    live: { label: "Live", color: T.green, bg: T.greenSoft },
    preview: { label: "Preview", color: T.cyan, bg: T.cyanSoft },
    soon: { label: "Soon", color: T.faint, bg: T.panelSoft },
  }[status];
  return <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: map.color, background: map.bg, border: `1px solid ${map.color}44`, borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{map.label}</span>;
}

/* Shown in place of the status pill once every topic in a module is done. */
function DoneBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.green, background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
      Done
    </span>
  );
}

/* Topic ids per module number, matching the lesson checkpoint keys
 * (pro:lesson:<id>). Every module is m{n}t1..5 except Module 3 (its content
 * lives in week01, so w1t*) and Module 18 (the Code Lab, which has no topics).
 * A module counts as done when all five of its topics are done. */
function moduleTopicIds(n: number): string[] {
  if (n === 18) return [];
  const prefix = n === 3 ? "w1" : `m${n}`;
  return [1, 2, 3, 4, 5].map((k) => `${prefix}t${k}`);
}

export default function CourseHub() {
  const built = ACTS.flatMap((a) => a.modules).filter((m) => m.href).length;

  // Which modules the learner has finished (every topic done). Read from the
  // same lesson checkpoints the ReadinessMeter uses: localStorage first, then
  // merge the server's cross-device record. Best-effort and client-only.
  const [doneMods, setDoneMods] = useState<Set<number>>(new Set());
  useEffect(() => {
    const doneTopics = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("pro:lesson:")) continue;
        try {
          const cp = JSON.parse(localStorage.getItem(k) || "null");
          if (cp && cp.phase === "done" && cp.id) doneTopics.add(cp.id);
        } catch { /* ignore a corrupt checkpoint */ }
      }
    } catch { /* localStorage unavailable */ }
    const recompute = () => {
      const mods = new Set<number>();
      for (const a of ACTS) for (const m of a.modules) {
        const ids = moduleTopicIds(m.n);
        if (ids.length > 0 && ids.every((id) => doneTopics.has(id))) mods.add(m.n);
      }
      setDoneMods(mods);
    };
    recompute();
    (async () => {
      try {
        const res = await fetch("/api/pro/progress", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { done?: string[] };
        if (Array.isArray(data.done) && data.done.length) {
          for (const id of data.done) doneTopics.add(id);
          recompute();
        }
      } catch { /* no server sync; local stands */ }
    })();
  }, []);

  return (
    <div className="pro-hub">
      <style>{`
        .pro-hub { min-height: 100vh; color: ${T.body}; font-family: ${T.sans}; background: ${T.bg}; }
        .pro-hub :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .hub-wrap { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 22px 24px 110px; }
        .hub-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0 18px; border-bottom: 1px solid ${T.edge}; }

        /* hero */
        .hub-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: ${T.mono}; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.primary}; margin: 44px 0 16px; }
        .hub-eyebrow::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${T.primary}; box-shadow: 0 0 10px ${T.primary}; }
        .hub-h1 { font-family: ${T.display}; font-size: clamp(33px, 5vw, 48px); font-weight: 800; line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 16px; color: ${T.ink}; text-wrap: balance; }
        .hub-lede { font-size: 18px; line-height: 1.6; color: ${T.muted}; max-width: 62ch; margin: 0 0 24px; }
        .hub-lede b { color: ${T.body}; }
        .hub-chips { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
        .hub-chip { font-family: ${T.mono}; font-size: 11.5px; font-weight: 600; color: ${T.muted}; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 8px; padding: 6px 11px; }
        .hub-chip b { color: ${T.ink}; font-weight: 700; }
        .hub-cta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
        .hub-cta { display: inline-flex; align-items: center; gap: 9px; font-family: ${T.display}; font-size: 15.5px; font-weight: 700; color: #fff; text-decoration: none; background: linear-gradient(135deg, ${T.primary}, ${T.cyan}); border-radius: 12px; padding: 14px 26px; box-shadow: 0 8px 26px rgba(139,109,255,0.32); transition: transform 150ms ease, box-shadow 150ms ease; }
        .hub-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(139,109,255,0.44); }
        .hub-cta svg { transition: transform 150ms ease; }
        .hub-cta:hover svg { transform: translateX(3px); }
        .hub-testme { display: inline-flex; align-items: center; gap: 8px; font-family: ${T.display}; font-size: 14.5px; font-weight: 700; color: ${T.ink}; text-decoration: none; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px; padding: 13px 20px; transition: border-color 150ms ease, transform 150ms ease; }
        .hub-testme:hover { border-color: ${T.primary}; transform: translateY(-1px); }
        .hub-testme svg { color: ${T.primary}; }
        .hub-cta-note { font-size: 13.5px; color: ${T.faint}; }

        /* act quick-nav: a compact map of the four acts, each in its accent */
        .act-nav { display: grid; grid-template-columns: 1fr; gap: 9px; margin: 34px 0 6px; }
        @media (min-width: 620px) { .act-nav { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px) { .act-nav { grid-template-columns: repeat(4, 1fr); } }
        .nav-item { display: flex; align-items: center; gap: 11px; text-decoration: none; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px; padding: 11px 13px; transition: transform 150ms ease, border-color 150ms ease, background 150ms ease; }
        .nav-item:hover { transform: translateY(-2px); background: ${T.bgRaise}; }
        .nav-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-family: ${T.mono}; font-size: 12.5px; font-weight: 800; }
        .nav-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .nav-kicker { font-family: ${T.mono}; font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.faint}; }
        .nav-name { font-family: ${T.display}; font-size: 13.5px; font-weight: 700; color: ${T.ink}; line-height: 1.18; letter-spacing: -0.01em; }
        .a1 .nav-num, .a1.nav-item .nav-num { color: ${T.primary}; background: ${T.primarySoft}; border: 1px solid ${T.primary}55; }
        .a2 .nav-num, .a2.nav-item .nav-num { color: ${T.red}; background: ${T.redSoft}; border: 1px solid ${T.red}55; }
        .a3 .nav-num, .a3.nav-item .nav-num { color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}55; }
        .a4 .nav-num, .a4.nav-item .nav-num { color: ${T.green}; background: ${T.greenSoft}; border: 1px solid ${T.green}55; }
        .a1.nav-item:hover { border-color: ${T.primary}; }
        .a2.nav-item:hover { border-color: ${T.red}; }
        .a3.nav-item:hover { border-color: ${T.cyan}; }
        .a4.nav-item:hover { border-color: ${T.green}; }

        /* act section + header: a bold, accent-banded block so each act stands out */
        .act { margin-top: 52px; scroll-margin-top: 16px; }
        .act-head { display: flex; align-items: center; gap: 16px; padding: 15px 18px; border-radius: 16px; margin-bottom: 20px; position: relative; overflow: hidden; }
        .a1 .act-head { background: linear-gradient(100deg, ${T.primarySoft} 0%, transparent 72%); border: 1px solid ${T.primary}33; }
        .a2 .act-head { background: linear-gradient(100deg, ${T.redSoft} 0%, transparent 72%); border: 1px solid ${T.red}33; }
        .a3 .act-head { background: linear-gradient(100deg, ${T.cyanSoft} 0%, transparent 72%); border: 1px solid ${T.cyan}33; }
        .a4 .act-head { background: linear-gradient(100deg, ${T.greenSoft} 0%, transparent 72%); border: 1px solid ${T.green}33; }
        .act-num { flex-shrink: 0; width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; font-family: ${T.display}; font-size: 26px; font-weight: 800; line-height: 1; }
        .a1 .act-num { color: ${T.primary}; background: ${T.primarySoft}; border: 1px solid ${T.primary}55; box-shadow: inset 0 1px 0 ${T.primary}33; }
        .a2 .act-num { color: ${T.red}; background: ${T.redSoft}; border: 1px solid ${T.red}55; box-shadow: inset 0 1px 0 ${T.red}33; }
        .a3 .act-num { color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}55; box-shadow: inset 0 1px 0 ${T.cyan}33; }
        .a4 .act-num { color: ${T.green}; background: ${T.greenSoft}; border: 1px solid ${T.green}55; box-shadow: inset 0 1px 0 ${T.green}33; }
        .act-meta { flex: 1; min-width: 0; }
        .act-kicker { font-family: ${T.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
        .a1 .act-kicker { color: ${T.primary}; } .a2 .act-kicker { color: ${T.red}; } .a3 .act-kicker { color: ${T.cyan}; } .a4 .act-kicker { color: ${T.green}; }
        .act-name { font-family: ${T.display}; font-size: clamp(21px, 3vw, 27px); font-weight: 800; color: ${T.ink}; letter-spacing: -0.015em; line-height: 1.14; margin: 3px 0 0; }
        .act-focus { font-size: 14px; color: ${T.muted}; margin: 5px 0 0; }

        /* module cards */
        .mods { display: grid; grid-template-columns: 1fr; gap: 13px; }
        @media (min-width: 720px) { .mods { grid-template-columns: 1fr 1fr; } }
        .mod { position: relative; display: flex; flex-direction: column; text-decoration: none; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 15px; padding: 17px 19px 15px 22px; overflow: hidden; min-height: 136px; }
        .mod::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; opacity: 0.95; }
        .a1 .mod::before { background: linear-gradient(${T.primary}, transparent); }
        .a2 .mod::before { background: linear-gradient(${T.red}, transparent); }
        .a3 .mod::before { background: linear-gradient(${T.cyan}, transparent); }
        .a4 .mod::before { background: linear-gradient(${T.green}, transparent); }

        a.mod { cursor: pointer; transition: border-color 160ms ease, transform 160ms ease, background 160ms ease, box-shadow 160ms ease, opacity 220ms ease, filter 220ms ease; }
        a.mod.live { border-color: ${T.green}44; }
        a.mod:hover { transform: translateY(-3px); background: ${T.bgRaise}; box-shadow: 0 14px 30px rgba(0,0,0,0.34); }
        a.mod.live:hover { border-color: ${T.green}; }
        a.mod.preview:hover { border-color: ${T.cyan}; }
        .mod.soon { opacity: 0.5; }
        .mod.soon::before { opacity: 0.4; }

        /* Completed modules: ticked and dimmed/blurred so attention goes to
           what is left; hover clears it so going back to review stays easy. */
        .mod.done { opacity: 0.5; filter: blur(0.8px) saturate(0.6); }
        .mod.done::before { background: linear-gradient(${T.green}, transparent); }
        a.mod.done { border-color: ${T.green}33; }
        a.mod.done:hover { opacity: 1; filter: none; border-color: ${T.green}; }
        a.mod.done .mod-go { color: ${T.green}; }
        @media (prefers-reduced-motion: reduce) { .mod.done { filter: saturate(0.6); } }

        .mod-top { display: flex; align-items: center; gap: 12px; margin-bottom: 11px; }
        .mod-n { flex-shrink: 0; width: 34px; height: 34px; border-radius: 9px; font-family: ${T.mono}; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
        .a1 .mod-n { color: ${T.primary}; background: ${T.primarySoft}; border: 1px solid ${T.primary}44; }
        .a2 .mod-n { color: ${T.red}; background: ${T.redSoft}; border: 1px solid ${T.red}44; }
        .a3 .mod-n { color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}44; }
        .a4 .mod-n { color: ${T.green}; background: ${T.greenSoft}; border: 1px solid ${T.green}44; }
        .mod-title { flex: 1; min-width: 0; font-family: ${T.display}; font-size: 18px; font-weight: 800; color: ${T.ink}; line-height: 1.2; letter-spacing: -0.01em; margin: 0; }
        .mod-blurb { flex: 1; font-size: 13.5px; line-height: 1.5; color: ${T.muted}; margin: 0 0 12px; }
        .mod-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .mod-tag { font-family: ${T.mono}; font-size: 10.5px; letter-spacing: 0.03em; color: ${T.faint}; }
        .mod-go { display: inline-flex; align-items: center; gap: 5px; font-family: ${T.display}; font-size: 13px; font-weight: 700; }
        a.mod.live .mod-go { color: ${T.green}; } a.mod.preview .mod-go { color: ${T.cyan}; }

        @media (prefers-reduced-motion: reduce) { a.mod, .hub-cta, .hub-cta svg, .nav-item { transition: none; } a.mod:hover, .hub-cta:hover, .nav-item:hover { transform: none; } }
      `}</style>

      <CodeRainBg />

      <div className="hub-wrap">
        <header className="hub-head">
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>0 to hired &middot; 18+</span>
        </header>

        <main>
          <div className="hub-eyebrow">The course</div>
          <h1 className="hub-h1">Cyber security, from zero to hired</h1>
          <p className="hub-lede">Real certificate content, taught for a curious adult with no technical background. Every module is <b>plain-English theory, a real breach, and a hands-on lab</b> in your browser. Work through them in order, or dip into any that is open.</p>

          <div className="hub-chips">
            <span className="hub-chip"><b>21</b> modules</span>
            <span className="hub-chip"><b>4</b> acts</span>
            <span className="hub-chip"><b>{built}</b> open now</span>
            {doneMods.size > 0 && (
              <span className="hub-chip" style={{ color: T.green, borderColor: `${T.green}55` }}><b style={{ color: T.green }}>{doneMods.size}</b> done</span>
            )}
            <span className="hub-chip">aligned to <b>Security+</b> &middot; ISC² CC</span>
          </div>

          <div className="hub-cta-row">
            <a className="hub-cta" href="/pro/module01">
              Start with Module 1
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <a className="hub-testme" href="/pro/testme">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5 9.8 8.3z" /></svg>
              Test me
            </a>
            <span className="hub-cta-note">or pick any open module below.</span>
          </div>

          <ReadinessMeter />

          {/* Quick-nav: the four acts at a glance, each jumping to its section. */}
          <nav className="act-nav" aria-label="The four acts">
            {ACTS.map((a, ai) => (
              <a key={a.tag} className={`nav-item ${a.cls}`} href={`#act-${ai + 1}`}>
                <span className="nav-num" aria-hidden>{ai + 1}</span>
                <span className="nav-text">
                  <span className="nav-kicker">Act {ai + 1}</span>
                  <span className="nav-name">{a.name}</span>
                </span>
              </a>
            ))}
          </nav>

          {ACTS.map((a, ai) => (
            <section key={a.tag} id={`act-${ai + 1}`} className={`act ${a.cls}`} aria-labelledby={`act-${ai + 1}-name`}>
              <div className="act-head">
                <span className="act-num" aria-hidden>{String(ai + 1).padStart(2, "0")}</span>
                <div className="act-meta">
                  <div className="act-kicker">Act {ai + 1} &middot; {a.modules.length} modules</div>
                  <h2 id={`act-${ai + 1}-name`} className="act-name">{a.name}</h2>
                  <p className="act-focus">{a.focus}</p>
                </div>
              </div>
              <div className="mods">
                {a.modules.map((m) => {
                  const isDone = doneMods.has(m.n);
                  const inner = (
                    <>
                      <div className="mod-top">
                        <span className="mod-n" aria-hidden>{m.n}</span>
                        <h3 className="mod-title">{m.title}</h3>
                        {isDone ? <DoneBadge /> : <Pill status={m.status} />}
                      </div>
                      <p className="mod-blurb">{m.blurb}</p>
                      <div className="mod-foot">
                        <span className="mod-tag">{m.tag}</span>
                        {m.href && <span className="mod-go">{isDone ? "Review" : m.status === "preview" ? "Preview lesson" : "Start module"} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>}
                      </div>
                    </>
                  );
                  const cls = `mod ${m.status}${isDone ? " done" : ""}`;
                  return m.href
                    ? <a key={m.n} className={cls} href={m.href} aria-label={isDone ? `${m.title} (completed, open to review)` : undefined}>{inner}</a>
                    : <div key={m.n} className={cls}>{inner}</div>;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

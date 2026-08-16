import { T } from "./learn/tokens";

/* The Cyber Pro course hub: every module, grouped into the four acts, with
 * a clear route into the ones that are built. Static and link-based so it
 * stays fast and robust. */

type Status = "live" | "preview" | "soon";
type Mod = { n: number; title: string; blurb: string; tag: string; href?: string; status: Status };
type Act = { cls: string; tag: string; name: string; focus: string; modules: Mod[] };

const ACTS: Act[] = [
  {
    cls: "a1", tag: "Act 1", name: "Foundations you can touch", focus: "The language every certificate starts with.",
    modules: [
      { n: 1, title: "What security actually means", blurb: "The core ideas every certificate opens with: the CIA triad, risk, and thinking like a defender.", tag: "Security+ 1.0", href: "/pro/module01", status: "live" },
      { n: 2, title: "How the internet actually works", blurb: "The plumbing attackers use, from IP and DNS to HTTPS, explained without jargon.", tag: "Security+ 3.0", status: "soon" },
      { n: 3, title: "Passwords & account security", blurb: "How passwords are really stored and cracked, and how to lock down your own accounts.", tag: "Security+ 4.0", href: "/pro/module03", status: "live" },
      { n: 4, title: "Cryptography without the maths", blurb: "Why the padlock means something: encryption, hashing and certificates in plain terms.", tag: "Security+ 1.4", href: "/pro/week02", status: "preview" },
      { n: 5, title: "Law, ethics & your first audit", blurb: "The Computer Misuse Act, data protection, and your first real portfolio piece.", tag: "Security+ 5.0", status: "soon" },
    ],
  },
  {
    cls: "a2", tag: "Act 2", name: "How attacks happen", focus: "Threats, vulnerabilities and the breaches they caused.",
    modules: [
      { n: 6, title: "Who the attackers are", blurb: "The real threat actors and the lifecycle of an attack, from recon to impact.", tag: "Security+ 2.1", status: "soon" },
      { n: 7, title: "Social engineering & phishing", blurb: "Why people are the easiest way in, and how to spot and report it.", tag: "Security+ 2.2", status: "soon" },
      { n: 8, title: "Malware: how it really works", blurb: "Viruses, ransomware, and how infection actually happens.", tag: "Security+ 2.4", status: "soon" },
      { n: 9, title: "Web attacks & the OWASP Top 10", blurb: "How web apps get broken, and you run a real SQL injection yourself.", tag: "OWASP Top 10", href: "/pro/week08", status: "preview" },
      { n: 10, title: "Networks & Wi-Fi under attack", blurb: "Eavesdropping, spoofing, denial of service, and moving through a network.", tag: "Security+ 2.4", status: "soon" },
      { n: 11, title: "Vulnerabilities & patching", blurb: "What a vulnerability really is, and the race to patch it before attackers strike.", tag: "Security+ 2.5", status: "soon" },
    ],
  },
  {
    cls: "a3", tag: "Act 3", name: "Defence for real", focus: "Security operations and the SOC job.",
    modules: [
      { n: 12, title: "Hardening & secure configuration", blurb: "Closing the doors, using the Cyber Essentials five controls as your checklist.", tag: "Cyber Essentials", status: "soon" },
      { n: 13, title: "The SOC & the analyst's day", blurb: "The most common first job in cyber security, seen from the inside.", tag: "Security+ 4.0", status: "soon" },
      { n: 14, title: "Logs & the SIEM", blurb: "Reading what attackers leave behind, on real honeypot data.", tag: "Security+ 4.0", href: "/pro/week13", status: "preview" },
      { n: 15, title: "Detection & threat intelligence", blurb: "Spotting the attack, and knowing your enemy with MITRE ATT&CK.", tag: "MITRE ATT&CK", status: "soon" },
      { n: 16, title: "Incident response & forensics", blurb: "When it goes wrong: contain, investigate, recover.", tag: "NIST 800-61", status: "soon" },
    ],
  },
  {
    cls: "a4", tag: "Act 4", name: "Get hired", focus: "Governance, scripting and the career on-ramp.",
    modules: [
      { n: 17, title: "Governance, risk & compliance", blurb: "The huge hiring lane most beginners never hear about.", tag: "Security+ 5.0", status: "soon" },
      { n: 18, title: "Scripting for defenders", blurb: "A little real code goes a long way: parse logs, check input, automate.", tag: "Code Lab", href: "/pro/code", status: "live" },
      { n: 19, title: "Resilience: backups & continuity", blurb: "Surviving the bad day, from ransomware to disaster recovery.", tag: "Security+ 3.0", status: "soon" },
      { n: 20, title: "The roles & the cert roadmap", blurb: "Which job, which certificate, and the honest state of the market.", tag: "Career map", status: "soon" },
      { n: 21, title: "The job machinery + capstone", blurb: "Everything you built, turned into a CV, a portfolio and an offer.", tag: "Capstone", status: "soon" },
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

export default function CourseHub() {
  const built = ACTS.flatMap((a) => a.modules).filter((m) => m.href).length;

  return (
    <div className="pro-hub">
      <style>{`
        .pro-hub { min-height: 100vh; color: ${T.body}; font-family: ${T.sans};
          background:
            radial-gradient(1200px 620px at 50% -10%, rgba(139,109,255,0.16), transparent 60%),
            radial-gradient(900px 520px at 92% 3%, rgba(53,214,240,0.09), transparent 55%),
            ${T.bg}; }
        .pro-hub :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .hub-wrap { max-width: 1080px; margin: 0 auto; padding: 22px 24px 110px; }
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
        .hub-cta-note { font-size: 13.5px; color: ${T.faint}; }

        /* act header */
        .act { margin-top: 46px; }
        .act-head { display: flex; align-items: flex-start; gap: 14px; padding-bottom: 16px; margin-bottom: 18px; border-bottom: 1px solid ${T.edge}; }
        .act-tag { flex-shrink: 0; font-family: ${T.mono}; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 7px 12px; border-radius: 8px; }
        .act-name { font-family: ${T.display}; font-size: 24px; font-weight: 800; color: ${T.ink}; letter-spacing: -0.015em; line-height: 1.15; }
        .act-focus { font-size: 14px; color: ${T.muted}; margin-top: 4px; }
        .a1 .act-tag { color: ${T.primary}; background: ${T.primarySoft}; border: 1px solid ${T.primary}66; }
        .a2 .act-tag { color: ${T.red}; background: ${T.redSoft}; border: 1px solid ${T.red}66; }
        .a3 .act-tag { color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}66; }
        .a4 .act-tag { color: ${T.green}; background: ${T.greenSoft}; border: 1px solid ${T.green}66; }

        /* module cards */
        .mods { display: grid; grid-template-columns: 1fr; gap: 13px; }
        @media (min-width: 720px) { .mods { grid-template-columns: 1fr 1fr; } }
        .mod { position: relative; display: flex; flex-direction: column; text-decoration: none; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 15px; padding: 17px 19px 15px; overflow: hidden; min-height: 132px; }
        .mod::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; opacity: 0.9; }
        .a1 .mod::before { background: linear-gradient(${T.primary}, transparent); }
        .a2 .mod::before { background: linear-gradient(${T.red}, transparent); }
        .a3 .mod::before { background: linear-gradient(${T.cyan}, transparent); }
        .a4 .mod::before { background: linear-gradient(${T.green}, transparent); }

        a.mod { cursor: pointer; transition: border-color 160ms ease, transform 160ms ease, background 160ms ease, box-shadow 160ms ease; }
        a.mod.live { border-color: ${T.green}55; }
        a.mod:hover { transform: translateY(-3px); background: ${T.bgRaise}; box-shadow: 0 14px 30px rgba(0,0,0,0.34); }
        a.mod.live:hover { border-color: ${T.green}; }
        a.mod.preview:hover { border-color: ${T.cyan}; }
        .mod.soon { opacity: 0.5; }
        .mod.soon::before { opacity: 0.4; }

        .mod-top { display: flex; align-items: center; gap: 11px; margin-bottom: 11px; }
        .mod-n { flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; background: ${T.bgRaise}; border: 1px solid ${T.edge}; font-family: ${T.mono}; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .a1 .mod-n { color: ${T.primary}; } .a2 .mod-n { color: ${T.red}; } .a3 .mod-n { color: ${T.cyan}; } .a4 .mod-n { color: ${T.green}; }
        .mod-title { flex: 1; min-width: 0; font-family: ${T.display}; font-size: 17px; font-weight: 700; color: ${T.ink}; line-height: 1.2; letter-spacing: -0.01em; }
        .mod-blurb { flex: 1; font-size: 13.5px; line-height: 1.5; color: ${T.muted}; margin: 0 0 12px; }
        .mod-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .mod-tag { font-family: ${T.mono}; font-size: 10.5px; letter-spacing: 0.03em; color: ${T.faint}; }
        .mod-go { display: inline-flex; align-items: center; gap: 5px; font-family: ${T.display}; font-size: 13px; font-weight: 700; }
        a.mod.live .mod-go { color: ${T.green}; } a.mod.preview .mod-go { color: ${T.cyan}; }

        @media (prefers-reduced-motion: reduce) { a.mod, .hub-cta, .hub-cta svg { transition: none; } a.mod:hover, .hub-cta:hover { transform: none; } }
      `}</style>

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
            <span className="hub-chip">aligned to <b>Security+</b> &middot; ISC² CC</span>
          </div>

          <div className="hub-cta-row">
            <a className="hub-cta" href="/pro/module01">
              Start with Module 1
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <span className="hub-cta-note">or pick any open module below.</span>
          </div>

          {ACTS.map((a) => (
            <section key={a.tag} className={`act ${a.cls}`}>
              <div className="act-head">
                <span className="act-tag">{a.tag}</span>
                <div>
                  <div className="act-name">{a.name}</div>
                  <div className="act-focus">{a.focus}</div>
                </div>
              </div>
              <div className="mods">
                {a.modules.map((m) => {
                  const inner = (
                    <>
                      <div className="mod-top">
                        <span className="mod-n">{m.n}</span>
                        <span className="mod-title">{m.title}</span>
                        <Pill status={m.status} />
                      </div>
                      <p className="mod-blurb">{m.blurb}</p>
                      <div className="mod-foot">
                        <span className="mod-tag">{m.tag}</span>
                        {m.href && <span className="mod-go">{m.status === "preview" ? "Preview lesson" : "Start module"} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>}
                      </div>
                    </>
                  );
                  return m.href
                    ? <a key={m.n} className={`mod ${m.status}`} href={m.href}>{inner}</a>
                    : <div key={m.n} className={`mod ${m.status}`}>{inner}</div>;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

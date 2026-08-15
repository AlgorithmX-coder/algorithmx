import { T } from "./learn/tokens";

/* The Cyber Pro landing: every module, grouped into the four acts, with a
 * clear route into the ones that are built. Static and link-based so it
 * stays fast and robust. */

type Status = "live" | "preview" | "soon";
type Mod = { n: number; title: string; tag: string; href?: string; status: Status };
type Act = { cls: string; tag: string; name: string; focus: string; modules: Mod[] };

const ACTS: Act[] = [
  {
    cls: "a1", tag: "Act 1", name: "Foundations you can touch", focus: "The language every certificate starts with",
    modules: [
      { n: 1, title: "What security actually means", tag: "Security+ 1.0", href: "/pro/module01", status: "live" },
      { n: 2, title: "How the internet actually works", tag: "Security+ 3.0", status: "soon" },
      { n: 3, title: "Passwords & account security", tag: "Security+ 4.0", href: "/pro/module03", status: "live" },
      { n: 4, title: "Cryptography without the maths", tag: "Security+ 1.4", href: "/pro/week02", status: "preview" },
      { n: 5, title: "Law, ethics & your first audit", tag: "Security+ 5.0", status: "soon" },
    ],
  },
  {
    cls: "a2", tag: "Act 2", name: "How attacks happen", focus: "Threats, vulnerabilities and the breaches they caused",
    modules: [
      { n: 6, title: "Who the attackers are", tag: "Security+ 2.1", status: "soon" },
      { n: 7, title: "Social engineering & phishing", tag: "Security+ 2.2", status: "soon" },
      { n: 8, title: "Malware: how it really works", tag: "Security+ 2.4", status: "soon" },
      { n: 9, title: "Web attacks & the OWASP Top 10", tag: "OWASP Top 10", href: "/pro/week08", status: "preview" },
      { n: 10, title: "Networks & Wi-Fi under attack", tag: "Security+ 2.4", status: "soon" },
      { n: 11, title: "Vulnerabilities & patching", tag: "Security+ 2.5", status: "soon" },
    ],
  },
  {
    cls: "a3", tag: "Act 3", name: "Defence for real", focus: "Security operations and the SOC job",
    modules: [
      { n: 12, title: "Hardening & secure configuration", tag: "Cyber Essentials", status: "soon" },
      { n: 13, title: "The SOC & the analyst's day", tag: "Security+ 4.0", status: "soon" },
      { n: 14, title: "Logs & the SIEM", tag: "Security+ 4.0", href: "/pro/week13", status: "preview" },
      { n: 15, title: "Detection & threat intelligence", tag: "MITRE ATT&CK", status: "soon" },
      { n: 16, title: "Incident response & forensics", tag: "NIST 800-61", status: "soon" },
    ],
  },
  {
    cls: "a4", tag: "Act 4", name: "Get hired", focus: "Governance, scripting and the career on-ramp",
    modules: [
      { n: 17, title: "Governance, risk & compliance", tag: "Security+ 5.0", status: "soon" },
      { n: 18, title: "Scripting for defenders", tag: "Code Lab", href: "/pro/code", status: "live" },
      { n: 19, title: "Resilience: backups & continuity", tag: "Security+ 3.0", status: "soon" },
      { n: 20, title: "The roles & the cert roadmap", tag: "Career map", status: "soon" },
      { n: 21, title: "The job machinery + capstone", tag: "Capstone", status: "soon" },
    ],
  },
];

function Pill({ status }: { status: Status }) {
  const map = {
    live: { label: "Live", color: T.green, bg: T.greenSoft },
    preview: { label: "Preview", color: T.cyan, bg: T.cyanSoft },
    soon: { label: "Coming soon", color: T.faint, bg: T.panelSoft },
  }[status];
  return <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: map.color, background: map.bg, border: `1px solid ${map.color}44`, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{map.label}</span>;
}

export default function CourseHub() {
  const built = ACTS.flatMap((a) => a.modules).filter((m) => m.href).length;

  return (
    <div className="pro-hub">
      <style>{`
        .pro-hub { min-height: 100vh; color: ${T.body}; font-family: ${T.sans};
          background:
            radial-gradient(1200px 620px at 50% -10%, rgba(139,109,255,0.15), transparent 60%),
            radial-gradient(900px 520px at 92% 3%, rgba(53,214,240,0.09), transparent 55%),
            ${T.bg}; }
        .pro-hub :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .hub-wrap { max-width: 1060px; margin: 0 auto; padding: 22px 24px 100px; }
        .hub-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0 18px; border-bottom: 1px solid ${T.edge}; }
        .hub-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: ${T.mono}; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.primary}; margin: 40px 0 16px; }
        .hub-eyebrow::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${T.primary}; box-shadow: 0 0 10px ${T.primary}; }
        .hub-h1 { font-family: ${T.display}; font-size: clamp(32px, 5vw, 46px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; color: ${T.ink}; text-wrap: balance; }
        .hub-lede { font-size: 18px; line-height: 1.6; color: ${T.muted}; max-width: 64ch; margin: 0 0 20px; }
        .hub-lede b { color: ${T.body}; }
        .hub-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; color: ${T.muted}; margin-bottom: 8px; }
        .hub-meta b { color: ${T.ink}; }
        .hub-sep { width: 3px; height: 3px; border-radius: 50%; background: ${T.faint}; }

        .act { margin-top: 40px; }
        .act-head { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 1px solid ${T.edge}; }
        .act-tag { font-family: ${T.mono}; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 11px; border-radius: 7px; }
        .act-name { font-size: 22px; font-weight: 800; color: ${T.ink}; letter-spacing: -0.01em; }
        .act-focus { font-size: 13px; color: ${T.muted}; font-family: ${T.mono}; }
        .a1 .act-tag { color: ${T.primary}; background: ${T.primarySoft}; border: 1px solid ${T.primary}66; }
        .a2 .act-tag { color: ${T.red}; background: ${T.redSoft}; border: 1px solid ${T.red}66; }
        .a3 .act-tag { color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}66; }
        .a4 .act-tag { color: ${T.green}; background: ${T.greenSoft}; border: 1px solid ${T.green}66; }

        .mods { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 720px) { .mods { grid-template-columns: 1fr 1fr; } }
        .mod { position: relative; display: block; text-decoration: none; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 14px; padding: 16px 18px; overflow: hidden; transition: border-color 150ms ease, transform 150ms ease, background 150ms ease; }
        .mod::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
        .a1 .mod::before { background: linear-gradient(${T.primary}, transparent); }
        .a2 .mod::before { background: linear-gradient(${T.red}, transparent); }
        .a3 .mod::before { background: linear-gradient(${T.cyan}, transparent); }
        .a4 .mod::before { background: linear-gradient(${T.green}, transparent); }
        a.mod:hover { border-color: ${T.cyan}88; transform: translateY(-2px); background: ${T.bgRaise}; }
        .mod.locked { opacity: 0.62; }
        .mod-top { display: flex; align-items: flex-start; gap: 12px; }
        .mod-n { flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; background: ${T.bgRaise}; border: 1px solid ${T.edge}; color: ${T.faint}; font-family: ${T.mono}; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .mod-title { font-family: ${T.display}; font-size: 16.5px; font-weight: 700; color: ${T.ink}; line-height: 1.25; letter-spacing: -0.01em; }
        .mod-tag { font-family: ${T.mono}; font-size: 10.5px; color: ${T.muted}; margin-top: 6px; }
        .mod-go { display: inline-flex; align-items: center; gap: 5px; margin-top: 11px; font-family: ${T.display}; font-size: 12.5px; font-weight: 700; color: ${T.cyan}; }
        @media (prefers-reduced-motion: reduce) { .mod { transition: none; } a.mod:hover { transform: none; } }
      `}</style>

      <div className="hub-wrap">
        <header className="hub-head">
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>0 to hired &middot; 18+</span>
        </header>

        <main>
          <div className="hub-eyebrow">The course</div>
          <h1 className="hub-h1">Cyber security, from zero to hired</h1>
          <p className="hub-lede">Real certificate content, taught for a curious adult with no technical background. <b>21 modules across four acts</b>, each one plain-English theory, a real breach, and a hands-on lab in your browser. Work through them in order, or dip into any that is open.</p>
          <div className="hub-meta">
            <span><b>21 modules</b> &middot; 4 acts</span>
            <span className="hub-sep" />
            <span><b>{built}</b> open now</span>
            <span className="hub-sep" />
            <span>aligned to <b>Security+</b>, ISC² CC &amp; Cyber Essentials</span>
          </div>

          {ACTS.map((a) => (
            <section key={a.tag} className={`act ${a.cls}`}>
              <div className="act-head">
                <span className="act-tag">{a.tag}</span>
                <span className="act-name">{a.name}</span>
                <span className="act-focus">{a.focus}</span>
              </div>
              <div className="mods">
                {a.modules.map((m) => {
                  const inner = (
                    <>
                      <div className="mod-top">
                        <span className="mod-n">{m.n}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                            <span className="mod-title">{m.title}</span>
                            <Pill status={m.status} />
                          </div>
                          <div className="mod-tag">{m.tag}</div>
                          {m.href && <span className="mod-go">{m.status === "preview" ? "Preview lesson" : "Start"} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>}
                        </div>
                      </div>
                    </>
                  );
                  return m.href
                    ? <a key={m.n} className="mod" href={m.href}>{inner}</a>
                    : <div key={m.n} className="mod locked">{inner}</div>;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

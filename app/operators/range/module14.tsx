"use client";

/* Module 14 — Responsible Disclosure & Reporting. Portfolio polish: the learner
 * scores a real finding's severity and chooses the ethical disclosure path. Two
 * decisions, both must be right. Authored data, no engine. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";

function DisclosureAct({ onCapture }: { onCapture: () => void }) {
  const [sev, setSev] = useState<string | null>(null);
  const [path, setPath] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const sevOk = sev === "Critical";
  const pathOk = path === 0;

  function check(nextSev = sev, nextPath = path) {
    if (nextSev && nextPath !== null) {
      if (nextSev === "Critical" && nextPath === 0) { setMsg("✓ Critical severity, coordinated disclosure — a clean, professional, ethical report."); onCapture(); }
      else setMsg("Not yet — re-check the severity and the disclosure choice. A remote, unauthenticated full-database compromise is the top band, and you report privately first.");
    }
  }

  const sevBtn = (label: string) => (
    <button key={label} onClick={() => { setSev(label); check(label, path); }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${sev === label ? (label === "Critical" ? C.green : C.red) : C.line}`, background: sev === label ? (label === "Critical" ? "rgba(74,222,128,.08)" : "rgba(255,91,98,.06)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>{label}</button>
  );

  const PATHS = [
    "Report it privately to the vendor and give them reasonable time to fix before any public detail.",
    "Post the full exploit publicly straight away so everyone knows.",
    "Quietly sell the vulnerability to the highest bidder.",
    "Use it to pull more data as proof of how serious it is.",
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, lineHeight: 1.6 }}>// the finding to report:</div>
        <p style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, margin: "6px 0 0" }}>A public-facing app has a SQL injection in its login that needs <b style={{ color: C.ink }}>no credentials</b>, is exploitable <b style={{ color: C.ink }}>remotely</b>, and gives <b style={{ color: C.ink }}>full read/write access to the entire customer database</b>.</p>
      </div>

      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.indigo, fontWeight: 700, marginBottom: 10 }}>1 · SCORE THE SEVERITY</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Low", "Medium", "High", "Critical"].map(sevBtn)}</div>
      </div>

      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.indigo, fontWeight: 700, marginBottom: 10 }}>2 · CHOOSE HOW TO DISCLOSE</div>
        <div style={{ display: "grid", gap: 8 }}>
          {PATHS.map((pth, i) => (
            <button key={i} onClick={() => { setPath(i); check(sev, i); }} className="co-opt"
              style={{ textAlign: "left", padding: "10px 13px", borderRadius: 9, border: `1px solid ${path === i ? (i === 0 ? C.green : C.red) : C.line}`, background: path === i ? (i === 0 ? "rgba(74,222,128,.08)" : "rgba(255,91,98,.06)") : C.panel, color: C.ink, fontFamily: "var(--font-plex-sans),system-ui", fontSize: 13.5, cursor: "pointer" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: path === i ? (i === 0 ? C.green : C.red) : C.mute, marginRight: 9 }}>{String.fromCharCode(65 + i)}</span>{pth}
            </button>
          ))}
        </div>
      </div>

      {msg && <div style={{ fontFamily: "var(--font-plex-sans),system-ui", fontSize: 13, color: sevOk && pathOk ? "#bff3d3" : C.soft, lineHeight: 1.55 }}>{msg}</div>}
    </div>
  );
}

export const MODULE14: ModuleDef = {
  code: "M-14",
  moduleNo: 14,
  title: "Disclosure & Reporting",
  client: "Redoubt · tradecraft",
  brief:
    "A finding is only as good as the report that carries it. Before the capstone, Redoubt wants you fluent in the craft every professional lives by: scoring how serious a vulnerability really is, and disclosing it the right way — the way that gets it fixed and keeps you on the right side of the law.",
  lesson: {
    blocks: [
      { h: "A finding needs a report", body: "Discovering a vulnerability is half the job; communicating it is the other half. A good finding report says plainly what the issue is, where it lives, how serious it is, what the impact would be, and how to fix it — in language the people who must act on it can use. Every capture you’ve filed in your portfolio follows exactly this shape." },
      { h: "Scoring severity", body: "Severity tells a busy team what to fix first. The industry standard, CVSS, scores roughly on how easy something is to exploit and how bad the impact is. A bug that needs no login, works remotely, and hands over the whole database sits at the top — Critical. One that needs special access and leaks something minor sits low. Consistent scoring is what lets an organisation triage honestly." },
      { h: "Responsible disclosure", body: "When you find a real flaw in someone’s system, you report it privately to them first and give them reasonable time to fix it before any public detail — that’s coordinated, responsible disclosure. You never dump a working exploit on the world, never sell it, and never help yourself to more data ‘to prove it’. The goal is to get it fixed and protect people, full stop." },
    ],
    example: {
      caption: "Remote, unauthenticated, full database — that’s the top band. And it goes to the vendor privately first.",
      lines: [
        { t: "vuln:     unauth SQLi -> full customer DB, remote" },
        { t: "severity: CRITICAL (no login, remote, total impact)", leak: true },
        { t: "disclose: privately to vendor -> time to fix -> coordinate", leak: true },
      ],
    },
    check: {
      q: "What is responsible (coordinated) disclosure?",
      options: [
        { text: "Publishing a working exploit immediately so users can protect themselves.", feedback: "That hands attackers a weapon before any fix exists — the opposite of protecting users." },
        { text: "Reporting privately to the vendor first and giving reasonable time to fix before public detail.", correct: true, feedback: "Right — private report, time to fix, then coordinate. Fixed and no one harmed." },
        { text: "Keeping it secret and using it whenever you like.", feedback: "That’s exploitation, not disclosure — and it’s illegal." },
      ],
    },
  },
  scope: {
    target: "a reported finding (SQLi) — scoring and disclosure",
    inScope: "assessing severity and choosing the disclosure path",
    offLimits: "re-exploiting the target, pulling more data, public dumps",
    timebox: "this session",
  },
  handler: "Two calls. How bad is it, really — on the standard scale? And how do you get it fixed without harming anyone or breaking the law? Get both right and your report’s field-ready.",
  hint: "Remote + no login + whole database = the top severity band (Critical). And you always report privately to the vendor first — coordinated disclosure.",
  Act: DisclosureAct,
  flag: "flag{d1sclosed_r3sponsibly}",
  defend: {
    blocks: [
      { h: "From the other side of the report", body: "Organisations that handle disclosure well publish a security contact and a clear policy, acknowledge reports quickly, and fix on a sensible timeline — often running a bug-bounty or vulnerability-disclosure programme to invite findings rather than fear them. Treating researchers as allies gets bugs fixed; threatening them just drives the findings underground or public." },
      { h: "Why this is the whole career", body: "Everything you’ve done — recon, exploitation, defence, forensics — ends in a report someone acts on. The ability to score a risk honestly and communicate it clearly is what turns a clever hack into a fixed vulnerability, and what makes a security professional trusted. Your portfolio is a stack of exactly these reports; this is the skill that makes them count." },
    ],
    check: {
      q: "What should an organisation do to handle incoming vulnerability reports well?",
      options: [
        { text: "Threaten legal action against anyone who reports a bug.", feedback: "That drives findings public or underground and leaves you less safe, not more." },
        { text: "Publish a security contact/policy, acknowledge quickly, and fix on a sensible timeline.", correct: true, feedback: "Right — make it easy and safe to report, and act on what comes in." },
        { text: "Ignore reports unless they include a working exploit.", feedback: "That discourages good-faith reporting and leaves real issues unfixed." },
      ],
    },
  },
  finding: {
    title: "Coordinated disclosure report prepared (Critical SQLi)",
    where: "reported finding · public app login · unauthenticated SQL injection",
    severity: "Critical",
    cvss: "9.8",
    impact: "A remote, unauthenticated SQL injection grants full read/write access to the entire customer database — correctly scored Critical and routed through private, coordinated disclosure so it can be fixed before any public detail.",
    fix: "Parameterise the vulnerable query; the vendor patches within an agreed window, then details are coordinated publicly. Maintain a published disclosure policy and security contact.",
  },
  rep: 55,
  repRank: "Lead Operator",
  repTo: "680 / 1000 to Principal",
  next: "NEXT MODULE · Full Engagement, Part 1 →",
};

export default function Module14() {
  return <Engagement mod={MODULE14} />;
}

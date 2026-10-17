"use client";

/* CourseIntro - the orientation that runs BEFORE the first engagement, so a
 * learner sees the whole plan up front: a welcome, their learning scope
 * (the 16-module attacker->defender arc), how every engagement runs, and the
 * mission outcome (what they'll be able to do by the end). The calm aurora
 * backdrop sets a welcoming tone. Uses the Engagement design tokens. */

import { C, DISP, MONO, SANS, Btn } from "./Engagement";
import ModuleBackdrop from "./ModuleBackdrop";

type Tone = "indigo" | "green" | "amber";
const PHASES: { n: string; name: string; weeks: string; topics: string; tone: Tone; here?: boolean }[] = [
  { n: "01", name: "Foundations", weeks: "Modules 1-3", topics: "Rules of Engagement · Recon & OSINT · The Web Surface", tone: "indigo", here: true },
  { n: "02", name: "Web Exploitation", weeks: "Modules 4-7", topics: "Broken Auth · Injection · XSS · Access Control", tone: "indigo" },
  { n: "03", name: "Data & Systems", weeks: "Modules 8-11", topics: "Cryptography · Passwords & Hashes · Network Recon · Forensics", tone: "indigo" },
  { n: "04", name: "The Role Flip", weeks: "Modules 12-14", topics: "Incident Response · Phishing Defence · Disclosure & Reporting", tone: "green" },
  { n: "05", name: "Capstone", weeks: "Modules 15-16", topics: "Full Engagement · Report & Debrief", tone: "amber" },
];
const TONE: Record<Tone, string> = { indigo: C.indigo, green: C.green, amber: C.amber };

const LOOP: { k: string; d: string }[] = [
  { k: "Brief", d: "meet the client + target" },
  { k: "Lesson", d: "learn it, then a check you must pass" },
  { k: "Scope", d: "sign what you're allowed to touch" },
  { k: "Capture", d: "do it for real on the range" },
  { k: "Defend", d: "the fix, and why it works" },
  { k: "Report", d: "file the finding, rank up" },
];

const OUTCOMES: string[] = [
  "Break into real web targets the way a professional does - safely, inside a walled range - and prove exactly how.",
  "Flip to defence: read the evidence after a breach, respond under pressure, and spot the con before anyone clicks.",
  "Score and write up a finding like a pro, leaving with a portfolio and a rank that show what you can actually do.",
];

export default function CourseIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "48px 20px 96px" }}>
      <ModuleBackdrop theme="aurora" />
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 760, position: "relative", zIndex: 1 }}>

        {/* header - a welcome for someone on their first day */}
        <div style={eyebrow}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 9px ${C.green}` }} />Redoubt · Operator orientation · Day one</div>
        <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "clamp(30px,6vw,46px)", lineHeight: 1.03, letterSpacing: "-.01em", margin: "16px 0 14px" }}>Welcome in. You&rsquo;ve been recruited.</h1>
        <p style={{ color: C.soft, fontSize: 16.5, lineHeight: 1.62, maxWidth: "60ch", margin: 0 }}>
          You&rsquo;re the newest junior operator at <b style={{ color: C.ink }}>Redoubt</b>, a security firm. Over <b style={{ color: C.ink }}>16 modules</b>{" "}you&rsquo;ll take on real client jobs: break in, then defend, one skill at a time. No experience needed - module one starts from the ground up and the early jobs guide your every move. Take a minute to see the whole plan, then we&rsquo;ll get you started.
        </p>

        {/* 1 · learning scope */}
        <SectionLabel>Your learning scope <span style={{ color: C.mute }}>· what you&rsquo;ll learn, in order</span></SectionLabel>
        <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.55, margin: "0 0 14px", maxWidth: "60ch" }}>
          Five phases, sixteen modules, taking you from attacker to defender. You start at the top.
        </p>
        <div style={{ display: "grid", gap: 9 }}>
          {PHASES.map((p) => {
            const t = TONE[p.tone];
            return (
              <div key={p.n} style={{ position: "relative", display: "flex", gap: 15, alignItems: "flex-start", padding: "15px 17px 15px 20px", borderRadius: 13, background: p.here ? "rgba(139,123,255,0.1)" : "rgba(29,33,44,0.86)", border: `1px solid ${p.here ? C.indigo : C.line}`, boxShadow: p.here ? `0 0 0 1px ${C.indigo}44, 0 18px 40px -26px ${C.indigo}` : "none", overflow: "hidden" }}>
                <span aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: t, opacity: p.here ? 1 : 0.6 }} />
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, color: t, minWidth: 26, lineHeight: 1.2 }}>{p.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16.5 }}>{p.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, letterSpacing: ".04em" }}>{p.weeks}</span>
                    {p.here && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: C.indigo, border: `1px solid ${C.indigo}66`, borderRadius: 5, padding: "2px 7px", textTransform: "uppercase" }}>You start here</span>}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft, marginTop: 5, lineHeight: 1.5 }}>{p.topics}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2 · how an engagement runs - set apart in its own tinted block */}
        <SectionLabel>How an engagement runs <span style={{ color: C.mute }}>· the same six beats, every time</span></SectionLabel>
        <div style={{ padding: "18px 18px 16px", borderRadius: 16, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
          <div className="ci-loop" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {LOOP.map((s, i) => (
              <div key={s.k} style={{ position: "relative", padding: "13px 14px", borderRadius: 11, background: "rgba(13,15,22,0.72)", border: `1px solid ${C.lineSoft}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: "#0a0a12", background: C.indigo2, borderRadius: 5, padding: "1px 6px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14.5, color: C.indigo2 }}>{s.k}</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.45 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 12, color: C.mute, margin: "13px 2px 0", lineHeight: 1.55 }}>
            Learn it, prove it, then defend it. Once you know the rhythm, every engagement feels familiar.
          </p>
        </div>

        {/* 3 · mission outcome */}
        <SectionLabel>Mission outcome <span style={{ color: C.mute }}>· where you&rsquo;ll be at the end</span></SectionLabel>
        <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.55, margin: "0 0 14px", maxWidth: "60ch" }}>
          Finish the posting and you&rsquo;ll be able to:
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {OUTCOMES.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 16px", borderRadius: 12, background: "rgba(29,33,44,0.86)", border: `1px solid ${C.line}` }}>
              <span aria-hidden style={{ color: C.green, fontFamily: MONO, fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>✓</span>
              <span style={{ fontSize: 14, color: C.soft, lineHeight: 1.55 }}>{o}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }} className="ci-two">
          <div style={{ padding: "15px 17px", borderRadius: 13, background: "rgba(29,33,44,0.86)", border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>A real portfolio</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 5, lineHeight: 1.5 }}>Every engagement files a professional-grade finding. Show a teacher, a UCAS form, or a first employer.</div>
          </div>
          <div style={{ padding: "15px 17px", borderRadius: 13, background: "rgba(29,33,44,0.86)", border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>A reputation rank</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 5, lineHeight: 1.5 }}>Recruit &rarr; Junior Operator &rarr; and up. It climbs with the quality of your work, not just finishing.</div>
          </div>
        </div>

        {/* begin */}
        <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Btn tone="i" onClick={onBegin} style={{ padding: "14px 26px", fontSize: 14 }}>Begin your first engagement →</Btn>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.mute }}>Module 1 · Rules of Engagement</span>
        </div>
      </div>
    </div>
  );
}

const eyebrow: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "36px 0 14px" }}>
      <span style={{ width: 18, height: 2, background: C.indigo, borderRadius: 2 }} />
      <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.ink, fontWeight: 700 }}>{children}</span>
    </div>
  );
}

const css = `
  .ci-two{}
  @media (max-width: 680px){ .ci-loop{ grid-template-columns: 1fr 1fr !important } }
  @media (max-width: 560px){ .ci-two{ grid-template-columns: 1fr !important } }
  @media (max-width: 440px){ .ci-loop{ grid-template-columns: 1fr !important } }
`;

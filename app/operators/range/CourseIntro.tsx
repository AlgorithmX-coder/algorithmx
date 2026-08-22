"use client";

/* CourseIntro — the orientation that runs BEFORE the first engagement, so a
 * learner sees the whole plan up front: the 16-week attacker->defender arc,
 * the rhythm every week follows, and what they walk away with. The terminal
 * fun sits inside a plan you can see. Uses the Engagement design tokens. */

import { C, DISP, MONO, SANS, Btn } from "./Engagement";

type Tone = "indigo" | "green" | "amber";
const PHASES: { n: string; name: string; weeks: string; topics: string; tone: Tone; here?: boolean }[] = [
  { n: "01", name: "Foundations", weeks: "Weeks 1-3", topics: "Rules of Engagement · Recon & OSINT · The Web Surface", tone: "indigo", here: true },
  { n: "02", name: "Web Exploitation", weeks: "Weeks 4-7", topics: "Broken Auth · Injection · XSS · Access Control", tone: "indigo" },
  { n: "03", name: "Data & Systems", weeks: "Weeks 8-11", topics: "Cryptography · Passwords & Hashes · Network Recon · Forensics", tone: "indigo" },
  { n: "04", name: "The Role Flip", weeks: "Weeks 12-14", topics: "Incident Response · Phishing Defence · Disclosure & Reporting", tone: "green" },
  { n: "05", name: "Capstone", weeks: "Weeks 15-16", topics: "Full Engagement · Report & Debrief", tone: "amber" },
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

export default function CourseIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: C.carbon, color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "48px 20px 96px" }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 760 }}>

        {/* header */}
        <div style={eyebrow}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 9px ${C.green}` }} />Redoubt · Operator orientation</div>
        <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: "clamp(30px,6vw,46px)", lineHeight: 1.03, letterSpacing: "-.01em", margin: "16px 0 14px" }}>You&rsquo;ve been recruited.</h1>
        <p style={{ color: C.soft, fontSize: 16, lineHeight: 1.62, maxWidth: "60ch", margin: 0 }}>
          Cyber Ops is a <b style={{ color: C.ink }}>16-week posting</b> at Redoubt, a security firm that hires you as a junior operator. Each week is a real client engagement: you break in, then you defend. You leave with a <b style={{ color: C.ink }}>portfolio of real findings</b>{" "}and a reputation rank, not a certificate. Here&rsquo;s the whole plan before you start.
        </p>

        {/* the path */}
        <SectionLabel>The path · 16 weeks, attacker <span style={{ color: C.mute }}>&rarr;</span> defender</SectionLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {PHASES.map((p) => {
            const t = TONE[p.tone];
            return (
              <div key={p.n} style={{ position: "relative", display: "flex", gap: 15, alignItems: "flex-start", padding: "15px 17px", borderRadius: 13, background: p.here ? "rgba(139,123,255,0.07)" : C.panel, border: `1px solid ${p.here ? C.indigo : C.line}` }}>
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
        <p style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, margin: "12px 2px 0", lineHeight: 1.55 }}>
          You spend the first weeks learning to break in, then flip and learn to catch it. That&rsquo;s the honest arc of the job.
        </p>

        {/* how a week runs */}
        <SectionLabel>How every engagement runs</SectionLabel>
        <div style={{ display: "grid", gap: 7 }}>
          {LOOP.map((s, i) => (
            <div key={s.k} style={{ display: "flex", gap: 13, alignItems: "center", padding: "11px 15px", borderRadius: 11, background: C.panel, border: `1px solid ${C.line}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.mute, minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14.5, color: C.indigo2, minWidth: 78 }}>{s.k}</span>
              <span style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.4 }}>{s.d}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, margin: "12px 2px 0", lineHeight: 1.55 }}>
          Same six beats every week, so once you know the rhythm every engagement feels familiar.
        </p>

        {/* what you leave with */}
        <SectionLabel>What you leave with</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="ci-two">
          <div style={{ padding: "15px 17px", borderRadius: 13, background: C.panel, border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>A real portfolio</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 5, lineHeight: 1.5 }}>Every engagement files a professional-grade finding. Show a teacher, a UCAS form, or a first employer.</div>
          </div>
          <div style={{ padding: "15px 17px", borderRadius: 13, background: C.panel, border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>A reputation rank</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 5, lineHeight: 1.5 }}>Recruit &rarr; Junior Operator &rarr; and up. It climbs with the quality of your work, not just finishing.</div>
          </div>
        </div>

        {/* begin */}
        <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Btn tone="i" onClick={onBegin} style={{ padding: "14px 26px", fontSize: 14 }}>Begin your first engagement →</Btn>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.mute }}>Week 1 · Rules of Engagement</span>
        </div>
      </div>
    </div>
  );
}

const eyebrow: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "34px 0 14px" }}>
      <span style={{ width: 18, height: 2, background: C.indigo, borderRadius: 2 }} />
      <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.soft, fontWeight: 600 }}>{children}</span>
    </div>
  );
}

const css = `
  .ci-two{}
  @media (max-width: 560px){ .ci-two{ grid-template-columns: 1fr !important } }
`;

"use client";

/* Engagement — the reusable weekly shell (the "locked template").
 *
 * Every Cyber Ops week is one instance of this: the fixed engagement anatomy
 * (brief -> authorize -> learn-just-enough -> recon+act -> capture -> finding +
 * debrief + reward), driven by a WeekDef. The only week-specific piece is the
 * Act surface — the target interaction — which each week supplies as a small
 * component that calls onCapture() when the flag drops.
 *
 * This is where the retention design lives: everyone reaches the core capture,
 * the win is juicy and on-brand, and it ends on a finding + a shareable card. */

import { useState } from "react";

export type WeekDef = {
  code: string; // engagement code, e.g. "E-01"
  title: string;
  client: string;
  /** Cold-open hook — why you care, in a sentence or two. */
  brief: string;
  scope: { target: string; inScope: string; offLimits: string; timebox: string };
  /** Teach-just-enough: the one idea needed to attempt. */
  teach: { title: string; body: string };
  /** The dry handler nudge, shown at the act phase. */
  handler: string;
  /** Deeper hint, revealed on request. */
  hint: string;
  /** The week-specific target interaction. Calls onCapture() on success. */
  Act: React.ComponentType<{ onCapture: () => void }>;
  flag: string;
  finding: { title: string; where: string; severity: string; cvss: string; impact: string; fix: string };
  /** Why it mattered — the real-world tie, spoken by the handler. */
  debrief: string;
  rep: number;
  repRank: string;
  repTo: string; // "40 / 100 to Operator"
  next: string;
};

export const C = {
  carbon: "#0a0b0f", panel: "#0f1119", raise: "#161a27",
  line: "rgba(139,123,255,0.18)", lineSoft: "rgba(166,178,214,0.10)",
  ink: "#e8edff", soft: "#a6b2d6", mute: "#6a7396",
  indigo: "#8b7bff", indigo2: "#b3a8ff", green: "#4ade80", red: "#ff5b62", amber: "#e8a33d", cyan: "#5fe6ff",
};
export const DISP = "'Chakra Petch','Segoe UI',system-ui,sans-serif";
export const MONO = "'IBM Plex Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,monospace";
export const SANS = "'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif";

type Phase = "brief" | "authorize" | "learn" | "act" | "captured";
const BEATS: { id: Phase; label: string }[] = [
  { id: "brief", label: "Brief" }, { id: "authorize", label: "Authorize" },
  { id: "learn", label: "Learn" }, { id: "act", label: "Capture" }, { id: "captured", label: "Report" },
];

export default function Engagement({ week }: { week: WeekDef }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [callsign, setCallsign] = useState("NIGHTJAR");
  const [hint, setHint] = useState(false);
  const idx = BEATS.findIndex((b) => b.id === phase);

  return (
    <div style={{ minHeight: "100vh", background: C.carbon, color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "44px 20px 100px" }}>
      <style>{styles}</style>
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* masthead + beat progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 }}>
            Redoubt · Engagement {week.code} · {week.title}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>operator <span style={{ color: C.indigo2 }}>{callsign || "—"}</span></div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {BEATS.map((b, i) => (
            <div key={b.id} title={b.label} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= idx ? C.indigo : "rgba(255,255,255,.08)", boxShadow: i === idx ? `0 0 8px ${C.indigo}` : "none", transition: "background .3s" }} />
          ))}
        </div>

        {phase === "brief" && (
          <Panel>
            <Eyebrow>◆ New engagement</Eyebrow>
            <h2 style={h2}>{week.client}</h2>
            <p style={{ color: C.soft, fontSize: 15, lineHeight: 1.6, margin: "10px 0 20px" }}>{week.brief}</p>
            <Btn tone="i" onClick={() => setPhase("authorize")}>Accept engagement →</Btn>
          </Panel>
        )}

        {phase === "authorize" && (
          <Panel style={{ borderColor: "rgba(74,222,128,0.3)" }}>
            <Eyebrow tone={C.green}>◆ Authorization required</Eyebrow>
            <h2 style={h2}>Scope of engagement</h2>
            <p style={{ color: C.soft, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 16px" }}>
              You may only touch what the scope authorizes. Acting outside it fails the engagement — that&apos;s the job, and the law.
            </p>
            <div style={scopeTbl}>
              <SRow k="Target" v={week.scope.target} />
              <SRow k="In scope" v={week.scope.inScope} tone={C.green} />
              <SRow k="Off limits" v={week.scope.offLimits} tone={C.red} />
              <SRow k="Timebox" v={week.scope.timebox} />
            </div>
            <div style={{ marginTop: 18 }}>
              <label style={lbl}>Sign as</label>
              <div style={{ display: "flex", gap: 10, marginTop: 7, flexWrap: "wrap" }}>
                <input value={callsign} onChange={(e) => setCallsign(e.target.value.toUpperCase().slice(0, 14))} placeholder="YOUR CALLSIGN"
                  style={{ ...input, flex: "1 1 200px", letterSpacing: ".08em" }} />
                <Btn tone="g" disabled={!callsign.trim()} onClick={() => setPhase("learn")}>SIGN &amp; AUTHORIZE →</Btn>
              </div>
            </div>
          </Panel>
        )}

        {phase === "learn" && (
          <Panel>
            <Eyebrow>◆ Brief · the one thing to know</Eyebrow>
            <h2 style={h2}>{week.teach.title}</h2>
            <p style={{ color: C.soft, fontSize: 15, lineHeight: 1.65, margin: "12px 0 20px" }}>{week.teach.body}</p>
            <Btn tone="i" onClick={() => setPhase("act")}>Begin recon →</Btn>
          </Panel>
        )}

        {phase === "act" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 16px", background: "rgba(139,123,255,0.06)", border: `1px solid ${C.line}`, borderRadius: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em", paddingTop: 2 }}>HANDLER</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{week.handler}</span>
            </div>
            <week.Act onCapture={() => setPhase("captured")} />
            <div>
              <button onClick={() => setHint(!hint)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, padding: "4px 0" }}>
                {hint ? "hide hint" : "hint"}
              </button>
              {hint && (
                <div style={{ marginTop: 6, padding: "12px 14px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13.5, color: C.soft, lineHeight: 1.55 }}>{week.hint}</div>
              )}
            </div>
          </div>
        )}

        {phase === "captured" && <Captured week={week} callsign={callsign} />}
      </div>
    </div>
  );
}

/* ---------- captured / reward ---------- */
function Captured({ week, callsign }: { week: WeekDef; callsign: string }) {
  const [share, setShare] = useState(false);
  const f = week.finding;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="co-anim co-pop" style={{ textAlign: "center", padding: "34px 20px 30px", background: "radial-gradient(120% 140% at 50% 0%, rgba(74,222,128,0.12), transparent 60%)", border: "1px solid rgba(74,222,128,0.35)", borderRadius: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".34em", textTransform: "uppercase", color: C.green, fontWeight: 700 }}>Flag captured</div>
        <div className="co-anim co-glow" style={{ fontFamily: DISP, fontSize: "clamp(24px,5.5vw,38px)", fontWeight: 700, margin: "12px 0 6px", letterSpacing: "-.01em" }}>Case cracked</div>
        <div style={{ fontFamily: MONO, fontSize: 15, color: C.green, background: "rgba(74,222,128,0.08)", display: "inline-block", padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(74,222,128,0.3)", marginTop: 6 }}>{week.flag}</div>
      </div>

      {/* debrief — the why */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "15px 18px", background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}`, borderRadius: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em", paddingTop: 2 }}>DEBRIEF</span>
        <span style={{ fontSize: 14, lineHeight: 1.6, color: C.soft }}>{week.debrief}</span>
      </div>

      {/* rep */}
      <Panel style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: C.amber }}>+{week.rep} REP</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>
            <span style={{ color: C.indigo2 }}>{week.repRank}</span><span>{week.repTo}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div className="co-anim co-bar" style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, boxShadow: `0 0 12px ${C.amber}` }} />
          </div>
        </div>
      </Panel>

      {/* finding */}
      <Panel>
        <Eyebrow>◆ Finding drafted · added to your portfolio</Eyebrow>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17 }}>{f.title}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.red, border: `1px solid ${C.red}55`, padding: "2px 8px", borderRadius: 6 }}>{f.severity} · CVSS {f.cvss}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, marginTop: 6 }}>{f.where}</div>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 10, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Impact.</b> {f.impact}</p>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 6, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Fix.</b> {f.fix}</p>
      </Panel>

      {/* capture card */}
      <div style={{ position: "relative", padding: 22, borderRadius: 16, overflow: "hidden", background: "linear-gradient(150deg, #14122e, #0d1030 55%, #0a0b16)", border: `1px solid ${C.line}`, boxShadow: `0 0 46px -18px ${C.indigo}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.indigo2, fontWeight: 600 }}>Capture card</div>
          <div style={{ fontFamily: DISP, fontSize: 12, fontWeight: 700, color: C.indigo2, letterSpacing: ".08em" }}>CYBER OPS</div>
        </div>
        <div style={{ fontFamily: DISP, fontSize: 30, fontWeight: 700, margin: "14px 0 2px", letterSpacing: ".04em" }}>{callsign}</div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft }}>cleared <span style={{ color: C.green }}>{week.title}</span> · engagement {week.code}</div>
        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
          <Stat n="✓" l="engagement 01" /><Stat n={`+${week.rep}`} l="reputation" /><Stat n={f.cvss} l={`CVSS · ${f.severity.toLowerCase()}`} />
        </div>
        <Btn tone="i" onClick={() => setShare(true)} style={{ marginTop: 20, fontSize: 12.5 }}>{share ? "✓ copied — go flex" : "SHARE CAPTURE →"}</Btn>
      </div>

      <Btn tone="ghost">{week.next}</Btn>
    </div>
  );
}

/* ---------- primitives ---------- */
const h2: React.CSSProperties = { fontFamily: DISP, fontSize: 22, margin: 0, fontWeight: 700 };
const scopeTbl: React.CSSProperties = { display: "grid", gap: 1, background: C.lineSoft, border: `1px solid ${C.lineSoft}`, borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontSize: 12.5 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.mute };
const input: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 9, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 14 };

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>{children}</div>;
}
function Eyebrow({ children, tone = C.indigo }: { children: React.ReactNode; tone?: string }) {
  return <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: tone, fontWeight: 600, marginBottom: 12 }}>{children}</div>;
}
function SRow({ k, v, tone = C.soft }: { k: string; v: string; tone?: string }) {
  return <div style={{ background: C.panel, padding: "10px 13px", display: "flex", gap: 12 }}><span style={{ color: C.mute, minWidth: 78 }}>{k}</span><span style={{ color: tone }}>{v}</span></div>;
}
function Stat({ n, l }: { n: string; l: string }) {
  return <div><div style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700 }}>{n}</div><div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, letterSpacing: ".08em", textTransform: "uppercase" }}>{l}</div></div>;
}
export function Btn({ children, onClick, tone = "i", disabled, style }: { children: React.ReactNode; onClick?: () => void; tone?: "i" | "g" | "ghost"; disabled?: boolean; style?: React.CSSProperties }) {
  const base: React.CSSProperties = { padding: "11px 22px", borderRadius: 9, border: "none", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", cursor: disabled ? "default" : "pointer" };
  const tones: Record<string, React.CSSProperties> = {
    i: { background: C.indigo, color: "#0f0c26" },
    g: { background: C.green, color: "#07130c" },
    ghost: { background: "transparent", color: C.indigo2, border: `1px solid ${C.line}`, fontWeight: 600 },
  };
  return <button className="co-btn" onClick={onClick} disabled={disabled} style={{ ...base, ...tones[tone], opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>;
}

const styles = `
  .co-btn{transition:transform .15s ease, filter .15s ease}
  .co-btn:not(:disabled):hover{transform:translateY(-1px);filter:brightness(1.08)}
  input:focus{outline:2px solid ${C.indigo};outline-offset:1px}
  .co-pop{animation:coPop .5s cubic-bezier(.2,1.2,.3,1)}
  .co-glow{animation:coGlow 1.4s ease-in-out infinite alternate}
  .co-bar{width:0;animation:coBar 1s cubic-bezier(.34,1.4,.5,1) .15s forwards}
  @keyframes coPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes coGlow{to{text-shadow:0 0 26px rgba(139,123,255,.5)}}
  @keyframes coBar{to{width:26%}}
  @media (prefers-reduced-motion: reduce){.co-pop,.co-glow{animation:none}.co-bar{width:26%;animation:none}}
`;

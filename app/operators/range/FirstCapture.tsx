"use client";

/* The playable "First Capture" — the magic moment that has to sell the tier.
 *
 * authorize (safety beat) -> guided console -> a REAL SQL-injection against the
 * wasm target -> the money moment: flag captured, juicy, with a shareable
 * capture-card and a reputation tick. Everyone gets the win (a one-click classic
 * payload for the stuck), because the first capture feeling good is the whole
 * retention thesis.
 *
 * This is a dev-stage vertical slice: real engine, on-brand feel, light on the
 * formal lesson chassis it will later graduate into. */

import { useEffect, useState } from "react";
import {
  bootNorthwind,
  type NorthwindSession,
  type LoginResult,
} from "@/app/operators/range/engine";

type Phase = "boot" | "scope" | "console" | "captured";

const C = {
  carbon: "#0a0b0f",
  panel: "#0f1119",
  raise: "#161a27",
  line: "rgba(139,123,255,0.18)",
  lineSoft: "rgba(166,178,214,0.10)",
  ink: "#e8edff",
  soft: "#a6b2d6",
  mute: "#6a7396",
  indigo: "#8b7bff",
  indigo2: "#b3a8ff",
  green: "#4ade80",
  red: "#ff5b62",
  amber: "#e8a33d",
  cyan: "#5fe6ff",
};
const DISP = "'Chakra Petch','Segoe UI',system-ui,sans-serif";
const MONO = "'IBM Plex Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,monospace";
const SANS = "'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif";

export default function FirstCapture() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [session, setSession] = useState<NorthwindSession | null>(null);
  const [bootErr, setBootErr] = useState("");
  const [callsign, setCallsign] = useState("NIGHTJAR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [bypassing, setBypassing] = useState(false);

  useEffect(() => {
    let live = true;
    bootNorthwind()
      .then((s) => {
        if (!live) return;
        setSession(s);
        setPhase((p) => (p === "boot" ? "scope" : p));
      })
      .catch((e) => live && setBootErr((e as Error).message));
    return () => {
      live = false;
    };
  }, []);

  const t = session?.target;

  function attempt() {
    if (!session || bypassing) return;
    const r = session.attemptLogin(email, password);
    setResult(r);
    if (r.asAdmin) {
      setBypassing(true);
      setTimeout(() => setPhase("captured"), 780);
    }
  }

  function insertClassic() {
    if (!t) return;
    setEmail(t.classicPayload);
    setPassword("");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.carbon, color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "48px 20px 100px" }}>
      <style>{styles}</style>
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* masthead */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 }}>
            Redoubt · Range · Engagement E-05
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>
            operator <span style={{ color: C.indigo2 }}>{callsign || "—"}</span>
          </div>
        </div>

        {phase === "boot" && (
          <Panel>
            <div style={{ fontFamily: MONO, fontSize: 13, color: bootErr ? C.red : C.soft }}>
              {bootErr ? `range failed to boot: ${bootErr}` : "booting range · wasm targets coming online…"}
            </div>
          </Panel>
        )}

        {phase === "scope" && t && (
          <ScopeGate
            t={t}
            callsign={callsign}
            setCallsign={setCallsign}
            onSign={() => setPhase("console")}
          />
        )}

        {phase === "console" && t && (
          <Console
            t={t}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            result={result}
            bypassing={bypassing}
            showHint={showHint}
            setShowHint={setShowHint}
            onAttempt={attempt}
            onClassic={insertClassic}
          />
        )}

        {phase === "captured" && t && <Captured t={t} callsign={callsign} />}
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}
function Eyebrow({ children, tone = C.indigo }: { children: React.ReactNode; tone?: string }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: tone, fontWeight: 600, marginBottom: 12 }}>
      {children}
    </div>
  );
}

/* ---------- phase 1 · scope ---------- */
function ScopeGate({ t, callsign, setCallsign, onSign }: { t: NonNullable<NorthwindSession["target"]>; callsign: string; setCallsign: (v: string) => void; onSign: () => void }) {
  return (
    <Panel style={{ borderColor: "rgba(74,222,128,0.3)" }}>
      <Eyebrow tone={C.green}>◆ Authorization required</Eyebrow>
      <h2 style={{ fontFamily: DISP, fontSize: 22, margin: "0 0 4px", fontWeight: 700 }}>{t.client} — scope of engagement</h2>
      <p style={{ color: C.soft, fontSize: 14.5, margin: "0 0 18px", lineHeight: 1.55 }}>
        Redoubt has a signed contract with {t.client}. You may only touch what the scope authorizes. Acting outside it fails the engagement — that&apos;s the job, and the law.
      </p>
      <div style={{ display: "grid", gap: 1, background: C.lineSoft, border: `1px solid ${C.lineSoft}`, borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontSize: 12.5 }}>
        <Row k="Target" v={t.host} />
        <Row k="In scope" v="the staff login — test for authentication flaws" tone={C.green} />
        <Row k="Off limits" v="every other host, data exfiltration, real users" tone={C.red} />
        <Row k="Timebox" v="this session" />
      </div>
      <div style={{ marginTop: 18 }}>
        <label style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.mute }}>Sign as</label>
        <div style={{ display: "flex", gap: 10, marginTop: 7, flexWrap: "wrap" }}>
          <input value={callsign} onChange={(e) => setCallsign(e.target.value.toUpperCase().slice(0, 14))}
            style={{ flex: "1 1 200px", padding: "11px 13px", borderRadius: 9, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 14, letterSpacing: ".08em" }} placeholder="YOUR CALLSIGN" />
          <button onClick={onSign} disabled={!callsign.trim()} className="co-btn"
            style={{ padding: "11px 22px", borderRadius: 9, background: C.green, color: "#07130c", border: "none", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", cursor: "pointer", whiteSpace: "nowrap" }}>
            SIGN &amp; AUTHORIZE →
          </button>
        </div>
      </div>
    </Panel>
  );
}
function Row({ k, v, tone = C.soft }: { k: string; v: string; tone?: string }) {
  return (
    <div style={{ background: C.panel, padding: "10px 13px", display: "flex", gap: 12 }}>
      <span style={{ color: C.mute, minWidth: 78 }}>{k}</span>
      <span style={{ color: tone }}>{v}</span>
    </div>
  );
}

/* ---------- phase 2 · console ---------- */
function Console(props: {
  t: NonNullable<NorthwindSession["target"]>;
  email: string; password: string;
  setEmail: (v: string) => void; setPassword: (v: string) => void;
  result: LoginResult | null; bypassing: boolean;
  showHint: boolean; setShowHint: (v: boolean) => void;
  onAttempt: () => void; onClassic: () => void;
}) {
  const { t, email, password, setEmail, setPassword, result, bypassing, showHint, setShowHint, onAttempt, onClassic } = props;
  const denied = result && !result.asAdmin;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* handler */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 16px", background: "rgba(139,123,255,0.06)", border: `1px solid ${C.line}`, borderRadius: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em", paddingTop: 2 }}>HANDLER</span>
        <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{t.handlerHint}</span>
      </div>

      <Panel style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <Dot c={C.red} /><Dot c={C.amber} /><Dot c={C.green} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6, letterSpacing: ".04em" }}>{t.endpoint} · {t.host}</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 14 }}>// recon · {t.recon}</div>

          <Field label="email" value={email} onChange={setEmail} onEnter={onAttempt} placeholder="name@northwind.range" />
          <Field label="password" value={password} onChange={setPassword} onEnter={onAttempt} placeholder="••••••••" />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0 16px" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, alignSelf: "center", letterSpacing: ".1em" }}>PAYLOADS</span>
            {["admin@northwind.range", "' OR '1'='1", t.classicPayload].map((p) => (
              <button key={p} onClick={() => setEmail(p)} className="co-chip"
                style={{ fontFamily: MONO, fontSize: 11.5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: "transparent", color: C.soft, cursor: "pointer" }}>
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={onAttempt} disabled={bypassing} className="co-btn"
              style={{ padding: "11px 22px", borderRadius: 9, background: bypassing ? C.green : C.indigo, color: bypassing ? "#07130c" : "#0f0c26", border: "none", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", cursor: "pointer" }}>
              {bypassing ? "✓ ACCESS GRANTED · admin" : "AUTHENTICATE →"}
            </button>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {showHint ? "hide hint" : "hint"}
            </button>
            <button onClick={onClassic} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>
              stuck? use a classic
            </button>
          </div>

          {showHint && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13.5, color: C.soft, lineHeight: 1.55 }}>
              {t.conceptHint}
            </div>
          )}

          {result && (
            <div className="co-anim co-fade" style={{ marginTop: 16, borderTop: `1px solid ${C.lineSoft}`, paddingTop: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.mute, marginBottom: 7 }}>query executed · real sqlite</div>
              <pre style={{ fontFamily: MONO, fontSize: 12, color: C.indigo2, whiteSpace: "pre-wrap", margin: "0 0 8px", lineHeight: 1.5 }}>{result.sql}</pre>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: result.asAdmin ? C.green : denied ? C.red : C.amber }}>
                {result.asAdmin ? "✓ 200 · authenticated as admin" : "✗ 401 · access denied"}
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
function Dot({ c }: { c: string }) { return <span style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />; }
function Field({ label, value, onChange, onEnter, placeholder }: { label: string; value: string; onChange: (v: string) => void; onEnter: () => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 5, letterSpacing: ".08em" }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter()} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 }} />
    </div>
  );
}

/* ---------- phase 3 · the capture ---------- */
function Captured({ t, callsign }: { t: NonNullable<NorthwindSession["target"]>; callsign: string }) {
  const [share, setShare] = useState(false);
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="co-anim co-pop" style={{ textAlign: "center", padding: "34px 20px 30px", background: "radial-gradient(120% 140% at 50% 0%, rgba(74,222,128,0.12), transparent 60%)", border: `1px solid rgba(74,222,128,0.35)`, borderRadius: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".34em", textTransform: "uppercase", color: C.green, fontWeight: 700 }}>Flag captured</div>
        <div className="co-anim co-glow" style={{ fontFamily: DISP, fontSize: "clamp(26px,6vw,42px)", fontWeight: 700, color: C.ink, margin: "12px 0 6px", letterSpacing: "-.01em" }}>
          Auth bypass — case cracked
        </div>
        <div style={{ fontFamily: MONO, fontSize: 15, color: C.green, background: "rgba(74,222,128,0.08)", display: "inline-block", padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(74,222,128,0.3)", marginTop: 6 }}>
          {t.flag}
        </div>
      </div>

      {/* rep tick */}
      <Panel style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: C.amber }}>+{t.rep} REP</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>
            <span style={{ color: C.indigo2 }}>Junior Operator</span><span>40 / 100 to Operator</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div className="co-anim co-bar" style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, boxShadow: `0 0 12px ${C.amber}` }} />
          </div>
        </div>
      </Panel>

      {/* finding drafted */}
      <Panel>
        <Eyebrow>◆ Finding drafted · added to your portfolio</Eyebrow>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, color: C.ink }}>{t.finding.title}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.red, border: `1px solid ${C.red}55`, padding: "2px 8px", borderRadius: 6 }}>{t.finding.severity} · CVSS {t.finding.cvss}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, marginTop: 6 }}>{t.finding.where}</div>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 10, lineHeight: 1.55 }}><b style={{ color: C.ink, fontWeight: 600 }}>Impact.</b> {t.finding.impact}</p>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 6, lineHeight: 1.55 }}><b style={{ color: C.ink, fontWeight: 600 }}>Fix.</b> {t.finding.fix}</p>
      </Panel>

      {/* the shareable capture card (the flex / growth asset) */}
      <div style={{ position: "relative", padding: 22, borderRadius: 16, overflow: "hidden", background: "linear-gradient(150deg, #14122e, #0d1030 55%, #0a0b16)", border: `1px solid ${C.line}`, boxShadow: `0 0 46px -18px ${C.indigo}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.indigo2, fontWeight: 600 }}>Capture card</div>
          <div style={{ fontFamily: DISP, fontSize: 12, fontWeight: 700, color: C.indigo2, letterSpacing: ".08em" }}>CYBER OPS</div>
        </div>
        <div style={{ fontFamily: DISP, fontSize: 30, fontWeight: 700, color: C.ink, margin: "14px 0 2px", letterSpacing: ".04em" }}>{callsign}</div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft }}>cracked <span style={{ color: C.green }}>{t.host}</span> · SQL injection · auth bypass</div>
        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
          <Stat n="1st" l="capture" />
          <Stat n={`+${t.rep}`} l="reputation" />
          <Stat n="9.8" l="CVSS · critical" />
        </div>
        <button onClick={() => setShare(true)} className="co-btn" style={{ marginTop: 20, padding: "10px 18px", borderRadius: 9, background: C.indigo, color: "#0f0c26", border: "none", fontFamily: MONO, fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", cursor: "pointer" }}>
          {share ? "✓ copied — go flex" : "SHARE CAPTURE →"}
        </button>
      </div>

      <button className="co-btn" style={{ padding: "13px", borderRadius: 10, background: "transparent", color: C.indigo2, border: `1px solid ${C.line}`, fontFamily: MONO, fontWeight: 600, fontSize: 13, letterSpacing: ".06em", cursor: "pointer" }}>
        NEXT ENGAGEMENT · Broken Authentication →
      </button>
    </div>
  );
}
function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700, color: C.ink }}>{n}</div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, letterSpacing: ".08em", textTransform: "uppercase" }}>{l}</div>
    </div>
  );
}

const styles = `
  .co-btn{transition:transform .15s ease, filter .15s ease}
  .co-btn:hover{transform:translateY(-1px);filter:brightness(1.08)}
  .co-chip:hover{border-color:${C.indigo};color:${C.ink}}
  .co-fade{animation:coFade .25s ease}
  .co-pop{animation:coPop .5s cubic-bezier(.2,1.2,.3,1)}
  .co-glow{animation:coGlow 1.4s ease-in-out infinite alternate}
  .co-bar{width:0;animation:coBar 1s cubic-bezier(.34,1.4,.5,1) .15s forwards}
  @keyframes coFade{from{opacity:0;transform:translateY(4px)}to{opacity:1}}
  @keyframes coPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes coGlow{from{text-shadow:0 0 0 rgba(139,123,255,0)}to{text-shadow:0 0 26px rgba(139,123,255,.5)}}
  @keyframes coBar{to{width:40%}}
  @media (prefers-reduced-motion: reduce){.co-anim{animation:none!important}.co-bar{width:40%}}
`;

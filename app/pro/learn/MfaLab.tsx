"use client";

import { useEffect, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* A tiny login simulation: you are the attacker, and you already have
 * Sarah's stolen password. Toggle MFA on and off and watch whether the
 * password alone is enough to get in. Nothing here is a real system. */
export default function MfaLab({ onDidTry }: LabProps) {
  const [mfaOn, setMfaOn] = useState(true);
  const [result, setResult] = useState<null | "in" | "blocked">(null);
  const [code, setCode] = useState("");
  const [tried, setTried] = useState(false);

  useEffect(() => { if (tried) onDidTry(); }, [tried, onDidTry]);

  const attempt = () => {
    setTried(true);
    setResult(mfaOn ? "blocked" : "in");
    setCode("");
  };

  const label = { fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.faint };

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>
        You are the attacker. You bought Sarah&apos;s password <code style={{ fontFamily: T.mono, color: T.ink, background: T.panelSoft, padding: "1px 6px", borderRadius: 5 }}>Summer2015</code> from a breach dump. Try to log into her account, with and without a second factor.
      </div>

      {/* fake login card */}
      <div style={{ background: T.bg, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px", maxWidth: 420 }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 14 }}>Sign in to Sarah&apos;s account</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={label}>Username</div>
            <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 8, padding: "9px 12px", fontFamily: T.mono, fontSize: 14, color: T.body, marginTop: 4 }}>sarah.k</div>
          </div>
          <div>
            <div style={label}>Stolen password</div>
            <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 8, padding: "9px 12px", fontFamily: T.mono, fontSize: 14, color: T.body, marginTop: 4 }}>Summer2015 <span style={{ color: T.green, fontSize: 12 }}>&nbsp;correct</span></div>
          </div>
        </div>

        {/* MFA toggle */}
        <button onClick={() => { setMfaOn((v) => !v); setResult(null); }}
          style={{ marginTop: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: mfaOn ? T.greenSoft : T.redSoft, border: `1px solid ${mfaOn ? T.green : T.red}66`, borderRadius: 9, padding: "11px 14px", cursor: "pointer" }}>
          <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>Sarah&apos;s second factor (MFA)</span>
          <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: mfaOn ? T.green : T.red }}>{mfaOn ? "ON" : "OFF"}</span>
        </button>

        <button onClick={attempt}
          style={{ marginTop: 12, width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 14, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "12px 16px", cursor: "pointer" }}>
          Try to log in as Sarah
        </button>
      </div>

      {/* result */}
      {result === "in" && (
        <div style={{ marginTop: 14, background: T.redSoft, border: `1px solid ${T.red}66`, borderRadius: 10, padding: "13px 16px", maxWidth: 420 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: T.red, marginBottom: 5 }}>YOU&apos;RE IN</div>
          <div style={{ fontSize: 14, color: T.body, lineHeight: 1.55 }}>With MFA off, the stolen password was the only lock, and you had it. You now have full access to Sarah&apos;s account. This is how most account takeovers happen.</div>
        </div>
      )}
      {result === "blocked" && (
        <div style={{ marginTop: 14, background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 10, padding: "13px 16px", maxWidth: 420 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: T.green, marginBottom: 5 }}>ACCESS DENIED</div>
          <div style={{ fontSize: 14, color: T.body, lineHeight: 1.55 }}>The password was accepted, but a 6-digit code was just sent to <b style={{ color: T.ink }}>Sarah&apos;s phone</b>, not yours. Without it you cannot get in.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Guess the code" inputMode="numeric"
              style={{ flex: 1, background: T.bg, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 8, fontFamily: T.mono, fontSize: 14, padding: "9px 12px" }} />
            <button onClick={() => setCode("")} style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>Clear</button>
          </div>
          {code.length === 6 && <div style={{ fontSize: 13, color: T.red, marginTop: 8 }}>Wrong. There are a million possibilities and the code changes every 30 seconds. Guessing it is hopeless, which is exactly the point.</div>}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: T.faint, marginTop: 14, lineHeight: 1.5, maxWidth: 460 }}>
        Try it both ways. The password is always &ldquo;correct&rdquo;, yet the outcome flips entirely on whether a second factor is switched on.
      </div>
    </div>
  );
}

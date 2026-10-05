"use client";

/* Module 4 — Broken Authentication. The Act is a login with no rate-limiting
 * and a weak, guessable password: the learner sprays a short candidate list and
 * watches the attempt counter climb without ever locking, then one weak password
 * lands. Teaches how logins break (weak creds, no lockout, no MFA) and the
 * layered fix. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const USERNAME = "dispatch@calderafreight.range";
const REAL_PASSWORD = "Caldera2024!";
const CANDIDATES = ["password1", "dispatch", "Caldera123", "Caldera2024!", "letmein", "Winter2024"];

function AuthSprayAct({ onCapture }: { onCapture: () => void }) {
  const [pw, setPw] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  const [status, setStatus] = useState<null | "fail" | "ok">(null);

  function attempt(candidate: string) {
    setAttempts((n) => n + 1);
    setTried((t) => (t.includes(candidate) ? t : [...t, candidate]));
    if (candidate === REAL_PASSWORD) {
      setStatus("ok");
      onCapture();
    } else {
      setStatus("fail");
    }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>portal.calderafreight.range · driver dispatch</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// known account from recon — now get the password</div>
          <div style={{ marginBottom: 12 }}>
            <label style={lab}>username</label>
            <input style={{ ...inp, opacity: 0.8 }} value={USERNAME} readOnly />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lab}>password</label>
            <input style={inp} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn tone="i" onClick={() => attempt(pw)}>LOG IN →</Btn>
            <span style={{ fontFamily: MONO, fontSize: 12, color: attempts > 0 ? C.amber : C.mute }}>
              attempts: {attempts} · {attempts >= 3 ? "still no lockout ⚠" : "no lockout"}
            </span>
          </div>
          {status === "fail" && <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13, color: C.red }}>✗ 401 · wrong password — but it let you try again instantly</div>}
          {status === "ok" && <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13, color: C.green }}>✓ 200 · signed in as dispatch — weak password, no second factor</div>}
        </div>
      </div>

      {/* candidate list — a tiny spray wordlist */}
      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>⌦ COMMON-PASSWORD LIST</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CANDIDATES.map((c) => (
            <button key={c} onClick={() => { setPw(c); attempt(c); }} className="co-opt" disabled={status === "ok"}
              style={{ padding: "7px 11px", borderRadius: 8, border: `1px solid ${tried.includes(c) ? (c === REAL_PASSWORD ? C.green : C.red) : C.line}`, background: C.panel, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: status === "ok" ? "default" : "pointer" }}>
              {tried.includes(c) && (c === REAL_PASSWORD ? "✓ " : "✗ ")}{c}
            </button>
          ))}
        </div>
        <button onClick={() => { setPw(REAL_PASSWORD); attempt(REAL_PASSWORD); }} disabled={status === "ok"} style={{ marginTop: 10, background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal</button>
      </div>
    </div>
  );
}

const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 5px", letterSpacing: ".08em" };
function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const MODULE4: ModuleDef = {
  code: "M-04",
  moduleNo: 4,
  title: "Broken Authentication",
  client: "Caldera Freight",
  brief:
    "Recon gave you a real account on Caldera’s driver portal: dispatch@calderafreight.range. Now test the front door itself. The dispatch team is famously casual about passwords — find out whether that casualness is enough to let a stranger walk straight in.",
  lesson: {
    blocks: [
      { h: "Authentication is the front door", body: "Authentication is how a system proves you are who you say you are — usually a password. It’s the single most-attacked part of any application, because everything valuable sits behind it. Get the door wrong and the strength of everything else barely matters." },
      { h: "How logins break", body: "The classic failures: passwords that are weak or guessable; passwords reused from other sites that attackers already have from past breaches (that’s ‘credential stuffing’); no limit on how many guesses you can make, so an attacker can try thousands (‘brute force’ and ‘password spraying’); and no second factor, so one stolen password is the whole key." },
      { h: "Spraying a short list", body: "Attackers rarely guess blindly. They try a handful of likely passwords — the company name plus a year, ‘password1’, the season — against many accounts. It’s cheap, quiet, and when there’s no lockout it just keeps going until one lands. You’re about to do exactly that against one account." },
    ],
    example: {
      caption: "No lockout means the server answers every guess the same way — fast, forever. A tiny list is all it takes.",
      lines: [
        { t: "POST /login  dispatch:password1   -> 401" },
        { t: "POST /login  dispatch:Caldera123   -> 401" },
        { t: "POST /login  dispatch:Caldera2024! -> 200 OK", leak: true },
        { t: "   (3 tries, no delay, no lock)", leak: true },
      ],
    },
    check: {
      q: "Why is a missing account lockout dangerous even for a semi-decent password?",
      options: [
        { text: "It lets the attacker try unlimited guesses until one works.", correct: true, feedback: "Right. With no limit, brute force and spraying are only a matter of time." },
        { text: "It makes the login page load slowly.", feedback: "Lockout is about limiting attempts, not performance." },
        { text: "It logs the user out too often.", feedback: "That’s the opposite problem — the risk is unlimited guessing, not over-logging-out." },
      ],
    },
  },
  scope: {
    target: "portal.calderafreight.range · the dispatch login",
    inScope: "the single account recon identified (dispatch@)",
    offLimits: "every other account, real inboxes, locking people out",
    timebox: "this session",
  },
  handler: "One account, dispatch@. Try the obvious passwords — company name, a year, the usual. Watch the attempt counter while you do it; that it never stops you is half the finding.",
  hint: "Work down the common-password list. ‘Caldera2024!’ — company name plus the year plus a symbol — is exactly the kind of weak password people pick.",
  Act: AuthSprayAct,
  flag: "flag{w3ak_cr3ds_n0_l0ckout}",
  defend: {
    blocks: [
      { h: "Layer the defences", body: "No single fix is enough, so you stack them. Enforce strong passwords — length matters more than symbols — and block known-breached passwords outright. Rate-limit and lock (or slow) repeated failures so guessing can’t run free. And require multi-factor authentication: a second factor means a stolen or guessed password alone isn’t enough to get in." },
      { h: "MFA is the big one", body: "Of all of these, multi-factor authentication stops the most real-world attacks. Credential stuffing and spraying both rely on a password being the only thing in the way. Add a second factor the attacker doesn’t have, and the vast majority of these break-ins simply fail — even when the password was correct." },
    ],
    check: {
      q: "Which single measure most reduces the impact of stolen or guessed passwords?",
      options: [
        { text: "Forcing a password change every 30 days.", feedback: "Frequent rotation mostly leads to weaker, patterned passwords; it doesn’t stop a correct guess today." },
        { text: "Requiring multi-factor authentication.", correct: true, feedback: "Right. A second factor means the password alone isn’t enough, defeating stuffing and spraying." },
        { text: "Hiding the login page at a secret URL.", feedback: "Obscurity isn’t security — the URL leaks, and the weak password still works once found." },
      ],
    },
  },
  finding: {
    title: "Weak password accepted; no lockout or MFA",
    where: "portal.calderafreight.range · POST /login",
    severity: "High",
    cvss: "8.1",
    impact: "A guessable password (company + year) signs in on the third attempt. The login imposes no rate-limit or lockout and offers no second factor, so any account can be brute-forced or sprayed.",
    fix: "Enforce a strong password policy and block breached passwords; add rate-limiting and lockout/backoff on failures; require multi-factor authentication.",
  },
  rep: 45,
  repRank: "Junior Operator",
  repTo: "135 / 300 to Operator",
  next: "NEXT MODULE · Injection →",
};

export default function Module4() {
  return <Engagement mod={MODULE4} />;
}

"use client";

/* Week 1 — Rules of Engagement (the onboarding engagement, and the locked
 * template's first instance).
 *
 * The day-one capture is deliberately gentle and foundational: read what the
 * server actually sends. Meridian Clinic's new staff login ships with a
 * leftover setup account leaked in an HTML comment — the learner opens the
 * source, finds it, and signs in. It teaches the first habit of every real
 * engagement (look before you touch), is guaranteed-winnable (a reveal for the
 * stuck), needs no heavy engine, and sets up Week 3 (The Web Surface). */

import { useState } from "react";
import Engagement, { type WeekDef, C, MONO, Btn } from "./Engagement";

const LEAK_EMAIL = "j.reed@meridian.range";
const LEAK_PASS = "M3ridian#Setup";

function MeridianLoginAct({ onCapture }: { onCapture: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [denied, setDenied] = useState(false);

  function login() {
    if (email.trim() === LEAK_EMAIL && pass === LEAK_PASS) onCapture();
    else setDenied(true);
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
  const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 5px", letterSpacing: ".08em" };

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
        <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>portal.meridian.range · staff login</span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 14 }}>// recon · look before you touch — the source is where you start</div>

        <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => { setEmail(e.target.value); setDenied(false); }} placeholder="name@meridian.range" /></div>
        <div style={{ marginBottom: 16 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => { setPass(e.target.value); setDenied(false); }} placeholder="••••••••" /></div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn tone="i" onClick={login}>LOG IN →</Btn>
          <Btn tone="ghost" onClick={() => setRevealed(true)}>{revealed ? "◇ source open" : "VIEW PAGE SOURCE"}</Btn>
          <button onClick={() => { setEmail(LEAK_EMAIL); setPass(LEAK_PASS); setRevealed(true); setDenied(false); }}
            style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal</button>
        </div>

        {denied && <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13, color: C.red, fontWeight: 600 }}>✗ 401 · access denied — those aren&apos;t valid credentials</div>}

        {revealed && (
          <pre style={{ marginTop: 16, padding: "14px 16px", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 10, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, color: "#8fa0c8", whiteSpace: "pre-wrap", overflowX: "auto" }}>
{`<form action="/login" method="post">
  <input name="email" type="email">
  <input name="pass"  type="password">
  <button>Sign in</button>
</form>
`}<span style={{ color: C.amber, background: "rgba(232,163,61,.10)", display: "block", padding: "2px 4px", borderRadius: 4 }}>{`<!-- TODO before launch: remove temp setup account
     ${LEAK_EMAIL} / ${LEAK_PASS} -->`}</span>{`
<script src="/portal.js"></script>`}
          </pre>
        )}
      </div>
    </div>
  );
}
function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const WEEK1: WeekDef = {
  code: "E-01",
  title: "Rules of Engagement",
  client: "Meridian Clinic",
  brief:
    "Welcome to Redoubt. You’re a junior operator now — real engagements, real guardrails. First client: Meridian Clinic. Their new staff portal goes live next week and they want it checked. Everything you touch lives in the range: fake data, no real systems, nothing leaves this browser.",
  scope: {
    target: "portal.meridian.range",
    inScope: "the staff login — look for anything left exposed",
    offLimits: "patient records, every other host, real people",
    timebox: "this session",
  },
  teach: {
    title: "Read what the server sends",
    body:
      "Before you touch anything, you look. Every page ships with more than what’s on screen — comments, notes, leftover test data the developers forgot to strip. Reading the raw source is the first move of every real engagement, and it’s astonishing how often it just hands you the keys.",
  },
  handler: "Meridian’s login looks clean. It isn’t. Read the source before you type a thing.",
  hint: "Open the page source and read the comments. Developers leave notes to themselves — and sometimes those notes are live credentials.",
  Act: MeridianLoginAct,
  flag: "flag{s0urce_l3ak_f0und}",
  finding: {
    title: "Credentials leaked in page source",
    where: "portal.meridian.range · login page · HTML comment",
    severity: "High",
    cvss: "8.2",
    impact: "A working setup account was left in a source comment; anyone who reads the page can sign in.",
    fix: "Strip comments and test data from production builds; rotate the exposed account immediately.",
  },
  debrief:
    "That’s how real breaches often start — not a clever exploit, just something left in the open. You looked before you touched, which is the whole job. Next week you’ll go under the hood of the web itself.",
  rep: 25,
  repRank: "Recruit",
  repTo: "25 / 100 to Junior Operator",
  next: "NEXT ENGAGEMENT · The Web Surface →",
};

export default function Week1() {
  return <Engagement week={WEEK1} />;
}

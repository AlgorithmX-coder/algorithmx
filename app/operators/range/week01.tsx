"use client";

/* Week 1 — Rules of Engagement. The onboarding engagement and the first instance
 * of the locked template, now taught as a proper lesson: concept -> how the web
 * source works -> a worked example -> a comprehension check -> the capture (apply
 * it on Meridian's login) -> the defense (how to prevent it) -> report. */

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
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 14 }}>// recon · you learned the move — now find Meridian&apos;s</div>
        <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => { setEmail(e.target.value); setDenied(false); }} placeholder="name@meridian.range" /></div>
        <div style={{ marginBottom: 16 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => { setPass(e.target.value); setDenied(false); }} placeholder="••••••••" /></div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn tone="i" onClick={login}>LOG IN →</Btn>
          <Btn tone="ghost" onClick={() => setRevealed(true)}>{revealed ? "◇ source open" : "VIEW PAGE SOURCE"}</Btn>
          <button onClick={() => { setEmail(LEAK_EMAIL); setPass(LEAK_PASS); setRevealed(true); setDenied(false); }} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal</button>
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
<script src="/portal.js"></` + `script>`}
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
    "Welcome to Redoubt. You’re a junior operator now — real engagements, real guardrails. First client: Meridian Clinic. Their new staff portal goes live next week and they’ve asked us to check it. Everything you touch lives in the range: fake data, no real systems, nothing leaves this browser.",
  lesson: {
    blocks: [
      { h: "What you actually do here", body: "A penetration test is authorized, ethical hacking. Your job is to find the weaknesses in a client’s systems before criminals do, then report them so they get fixed. Rule zero: you may only ever test a system you have written permission to test. In the UK that’s the Computer Misuse Act 1990 — and it’s exactly why every engagement starts by signing a scope." },
      { h: "A web page has two layers", body: "There’s the page you see, and there’s the source — the HTML the server sends your browser to build that page. Anyone can read it; every browser has a “View source”. And the browser downloads the whole thing, including parts meant to be invisible: comments, hidden fields, developer notes. Nothing in the source is truly hidden from someone who reads it." },
      { h: "Reconnaissance: look before you touch", body: "Before touching anything, professionals gather information — reconnaissance. Passive recon means reading what’s already exposed, like the page source, without interacting with the target at all. It’s the first phase of every real engagement, and it’s astonishingly effective, because people leave things in the open constantly." },
    ],
    example: {
      lines: [
        { t: '<form action="/login" method="post">' },
        { t: '  <input name="email" type="email">' },
        { t: '  <input name="pass"  type="password">' },
        { t: "</form>" },
        { t: "<!-- TODO: remove before launch —", leak: true },
        { t: "     test acct  rt@acme.range / Spr1ng!24 -->", leak: true },
        { t: '<script src="/app.js"></script>' },
      ],
      caption: "A developer left a working test account in a comment. It’s invisible on the page — but it’s right there in the source the server handed the browser.",
    },
    check: {
      q: "Why can an attacker read a comment that’s invisible on the rendered page?",
      options: [
        { text: "They broke into the web server.", feedback: "No break-in needed — this is passive recon. The server sends that comment to every visitor." },
        { text: "The browser downloads the full source, comments and all.", correct: true, feedback: "Exactly. “View source” shows everything the server sent — a comment hides nothing from someone who reads it." },
        { text: "A developer posted it publicly by mistake.", feedback: "It’s sitting in the page’s own HTML, delivered by the server to every browser that loads the page." },
      ],
    },
  },
  scope: {
    target: "portal.meridian.range",
    inScope: "the staff login — look for anything left exposed",
    offLimits: "patient records, every other host, real people",
    timebox: "this session",
  },
  handler: "You know the move now. Meridian’s login looks clean — read its source and find what they left behind.",
  hint: "Open the page source and read the comments. Developers leave notes to themselves — and sometimes those notes are live credentials.",
  Act: MeridianLoginAct,
  flag: "flag{s0urce_l3ak_f0und}",
  defend: {
    blocks: [
      { h: "The fix", body: "Secrets never belong in source code or comments. Keep them in environment variables or a secrets manager, and strip comments and test data out of production builds. And if a secret is ever exposed — even for a minute — rotate it immediately. Assume it’s already compromised." },
      { h: "This happens constantly", body: "Leaked secrets in source are one of the most common exposures in the real world. Companies routinely commit API keys and passwords to public code repositories, or ship them in front-end JavaScript that anyone can read. Whole classes of breaches start exactly the way yours just did." },
    ],
    check: {
      q: "You found Meridian’s leaked account. What should they do first?",
      options: [
        { text: "Delete the comment from the page source.", feedback: "Necessary, but not first — the credential is already out, so removing the comment doesn’t un-leak it." },
        { text: "Disable or rotate the account, then clean the source.", correct: true, feedback: "Right. Assume it’s burned: kill the credential first, then remove it from the source." },
        { text: "Nothing — it’s only a test account.", feedback: "A working credential is a working credential. Leftover test accounts are a classic way in." },
      ],
    },
  },
  finding: {
    title: "Credentials leaked in page source",
    where: "portal.meridian.range · login page · HTML comment",
    severity: "High",
    cvss: "8.2",
    impact: "A working setup account was left in a source comment; anyone who reads the page can sign in.",
    fix: "Strip comments and test data from production builds; rotate the exposed account immediately.",
  },
  rep: 25,
  repRank: "Recruit",
  repTo: "25 / 100 to Junior Operator",
  next: "NEXT ENGAGEMENT · The Web Surface →",
};

export default function Week1() {
  return <Engagement week={WEEK1} />;
}

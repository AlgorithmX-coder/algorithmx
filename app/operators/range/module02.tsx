"use client";

/* Module 2 — Reconnaissance & OSINT. No new engine: the Act is an intelligence
 * board of public sources the learner reads and pieces together to derive a
 * target's login email — pure passive recon, exactly the real technique. Teaches
 * footprinting before you ever touch a system, then how a company shrinks its
 * public footprint. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const ANSWER = "marcus.bell@calderafreight.range";

const p: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.55, margin: "0 0 8px", color: C.soft };

type Source = { tag: string; via: string; title: string; body: React.ReactNode; clue: string };

const SOURCES: Source[] = [
  {
    tag: "WEBSITE",
    via: "calderafreight.range/about",
    title: "“Meet the team”",
    body: (
      <>
        <p style={p}>Our people make Caldera Freight move. Reach the leadership team directly:</p>
        <p style={{ ...p, fontFamily: MONO, color: C.indigo2 }}>Dana Okafor, CEO — dana.okafor@calderafreight.range</p>
        <p style={{ ...p, fontFamily: MONO, color: C.indigo2 }}>Priya Shah, CFO — priya.shah@calderafreight.range</p>
      </>
    ),
    clue: "Email scheme = first.last@calderafreight.range",
  },
  {
    tag: "JOB AD",
    via: "jobsboard.range · 3 weeks ago",
    title: "Systems Administrator — Caldera Freight",
    body: (
      <>
        <p style={p}>You&rsquo;ll own our internal staff portal and keep the fleet systems running.</p>
        <p style={{ ...p, color: C.soft }}>Day to day you&rsquo;ll administer <b style={{ color: C.ink }}>portal.calderafreight.range</b>, manage accounts, and support 200+ drivers.</p>
      </>
    ),
    clue: "Staff login lives at portal.calderafreight.range",
  },
  {
    tag: "SOCIAL",
    via: "profile feed · public post",
    title: "Marcus Bell",
    body: (
      <>
        <p style={p}>🎉 Thrilled to share I&rsquo;ve started as <b style={{ color: C.ink }}>Systems Administrator at Caldera Freight</b>! Big shoes to fill. First job: finally sort out that portal. #newrole #sysadmin</p>
      </>
    ),
    clue: "Marcus Bell is the new systems admin",
  },
  {
    tag: "PHOTO",
    via: "team post · image caption",
    title: "“Welcome drinks!”",
    body: (
      <>
        <p style={p}>A whiteboard in the background reads: <span style={{ fontFamily: MONO, color: C.amber }}>“Portal pw reset — ask Marcus”</span></p>
        <p style={{ ...p, color: C.mute }}>Nothing here is secret on its own. Together, it&rsquo;s a map.</p>
      </>
    ),
    clue: "Marcus is the go-to for the portal",
  },
];

function OsintBoardAct({ onCapture }: { onCapture: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(false);

  function view(i: number) {
    setOpen(open === i ? null : i);
    setSeen((s) => new Set(s).add(i));
  }
  function submit() {
    if (guess.trim().toLowerCase() === ANSWER) onCapture();
    else setWrong(true);
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>
        // intel board · {seen.size}/{SOURCES.length} sources read — open each, then derive the target
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
        {SOURCES.map((s, i) => (
          <button key={i} onClick={() => view(i)} className="co-opt" style={{ textAlign: "left", padding: "11px 13px", borderRadius: 10, border: `1px solid ${open === i ? C.indigo : C.line}`, background: open === i ? "rgba(139,123,255,0.08)" : C.carbon, cursor: "pointer" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: seen.has(i) ? C.green : C.indigo, fontWeight: 700 }}>{seen.has(i) ? "✓ " : ""}{s.tag}</div>
            <div style={{ fontSize: 13, color: C.ink, marginTop: 4, fontWeight: 600 }}>{s.title}</div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em" }}>{SOURCES[open].tag}</span>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>{SOURCES[open].via}</span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-chakra),system-ui", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{SOURCES[open].title}</div>
            {SOURCES[open].body}
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 11.5, color: C.green, borderLeft: `2px solid ${C.green}`, paddingLeft: 10 }}>↳ {SOURCES[open].clue}</div>
          </div>
        </div>
      )}

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px" }}>
        <label style={{ display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 7, letterSpacing: ".06em" }}>
          Piece it together: what is the new systems admin&rsquo;s most likely login email?
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={guess} onChange={(e) => { setGuess(e.target.value); setWrong(false); }} placeholder="name@calderafreight.range" style={{ flex: "1 1 240px", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 }} />
          <Btn tone="g" onClick={submit}>SUBMIT TARGET →</Btn>
        </div>
        {wrong && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not quite — combine the email scheme with the admin&rsquo;s name.</div>}
        <button onClick={() => { setGuess(ANSWER); setWrong(false); setSeen(new Set([0, 1, 2, 3])); }} style={{ marginTop: 10, background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal</button>
      </div>
    </div>
  );
}

export const MODULE2: ModuleDef = {
  code: "M-02",
  moduleNo: 2,
  title: "Reconnaissance & OSINT",
  client: "Caldera Freight",
  brief:
    "New engagement. Caldera Freight, a logistics firm, wants to know how exposed they are before they go live with a new staff portal. Your job this time is pure reconnaissance — don’t touch their systems at all. Find out what the open internet already gives away about them.",
  lesson: {
    blocks: [
      { h: "Recon comes first, always", body: "Before any real test, an operator maps the target. Reconnaissance is gathering information about a system or organisation. The more you know going in, the less you have to touch — and the less you touch, the quieter and safer you are. Every professional engagement starts here." },
      { h: "Passive vs active", body: "Passive recon means reading information that is already public — a website, a job advert, a social post, a photo — without ever interacting with the target’s systems. Active recon means poking the target directly (scanning ports, probing a login). Passive is invisible and, because you only read what’s public, it stays firmly in bounds." },
      { h: "OSINT: open-source intelligence", body: "OSINT is intelligence built from publicly available sources. No single post is a secret. But a job ad names your internal portal, an About page reveals your email format, and a new-starter’s proud announcement names your admin — and suddenly a stranger can guess a real login without touching a thing. The leak is the pattern, not any one piece." },
    ],
    example: {
      caption: "Three harmless public posts. Together they hand an attacker a valid username at a named login portal — before a single packet is sent at the company.",
      lines: [
        { t: "about page:   emails look like first.last@acme.range" },
        { t: "job advert:   “administer our portal at portal.acme.range”", leak: true },
        { t: "new starter:  “excited to be Acme’s new sysadmin!” — J. Vale", leak: true },
        { t: "" },
        { t: "derived:      j.vale@acme.range  @  portal.acme.range", leak: true },
      ],
    },
    check: {
      q: "Why is passive recon considered low-risk and in-scope?",
      options: [
        { text: "Because it’s too slow for anyone to notice.", feedback: "Speed isn’t the point — it’s that you never touch the target at all." },
        { text: "Because you only read already-public information and never touch the target’s systems.", correct: true, feedback: "Exactly. Reading public sources interacts with nobody’s systems, so it’s invisible and stays in bounds." },
        { text: "Because the company gave you their passwords.", feedback: "No passwords involved — OSINT is built entirely from what’s already public." },
      ],
    },
  },
  scope: {
    target: "Caldera Freight — public footprint only",
    inScope: "anything publicly published about the company",
    offLimits: "their portal and any system — do not log in or probe",
    timebox: "this session",
  },
  handler: "Hands off their systems this time. Everything you need is already out in the open — read it, connect it, and tell me who an attacker would target first.",
  hint: "Read all four sources. One gives the email format, one names the admin. Put those two together.",
  Act: OsintBoardAct,
  flag: "flag{0s1nt_p1eced_t0g3ther}",
  defend: {
    blocks: [
      { h: "Shrink the public footprint", body: "You can’t un-publish the internet, but you can give it less. Use role-based addresses (careers@, it@) instead of exposing a guessable personal-email format. Keep internal URLs like admin portals out of public job ads. And brief staff that a cheerful ‘new sysadmin!’ post is genuinely useful to an attacker." },
      { h: "Assume you’re being mapped", body: "Every organisation worth attacking is footprinted this way first. Defenders do the same recon on themselves — searching for what leaks — so they can close it before someone hostile finds it. What you did for Caldera is exactly what a blue team does on day one." },
    ],
    check: {
      q: "What most directly stops an attacker guessing a valid login from public info?",
      options: [
        { text: "Make the website load faster.", feedback: "Performance has nothing to do with what the site reveals." },
        { text: "Avoid publishing the email format and internal portal URLs; prefer role-based addresses.", correct: true, feedback: "Right — remove the pattern and the named URL, and the guess no longer works." },
        { text: "Ask employees to use longer passwords.", feedback: "Good hygiene, but it doesn’t stop an attacker learning a valid username and where to use it." },
      ],
    },
  },
  finding: {
    title: "Sensitive information exposed via public sources (OSINT)",
    where: "Caldera Freight · public website, job ad, staff social posts",
    severity: "Medium",
    cvss: "5.3",
    impact: "The company’s email scheme, internal portal URL, and the admin’s identity are all public, letting an attacker derive a valid target login without touching any system.",
    fix: "Use role-based email addresses, keep internal URLs out of public ads, and train staff on oversharing. Footprint yourself regularly to catch leaks early.",
  },
  rep: 30,
  repRank: "Recruit",
  repTo: "55 / 100 to Junior Operator",
  next: "NEXT MODULE · The Web Surface →",
};

export default function Module2() {
  return <Engagement mod={MODULE2} />;
}

"use client";

/* Module 1 - Rules of Engagement (DEPTH STANDARD, built to the M5 framework).
 *
 * The course opener: it still wraps CourseIntro and still files a real finding
 * (so it fits the learn -> capture -> report shell), but it's now a proper Rules
 * of Engagement module. The learner authorises and scopes the job, does one real
 * in-scope recon capture, then makes the judgment calls that separate a
 * professional from a criminal - stay in scope, handle findings responsibly.
 * All modelled in-browser, zero egress. Shape mirrors M5: hover glossary,
 * interactive lesson lab, de-biased check, a FOUR-stage capture with hints,
 * FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, AnswerReveal } from "./Engagement";
import CourseIntro from "./CourseIntro";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "penetration test", definition: "Authorised, ethical hacking: finding the weaknesses in a client's systems before criminals do, then reporting them to be fixed.", example: "A shop hires a tester to attack its own website before Black Friday, so any holes are found and fixed before real criminals get there." },
  { term: "authorization", definition: "Explicit, written permission to test a specific system. Without it, the same actions are a crime - this is rule zero.", example: "A signed letter saying 'you may test shop.example.com, 9am-5pm this week'. Without that letter, the exact same test is illegal." },
  { term: "scope", definition: "The exact list of what you may test, when and how. Anything not in scope is off limits, full stop.", example: "Scope lets you test the login page but not the live payment system - so you leave payments alone, even if they look weak." },
  { term: "rules of engagement", definition: "The agreed ground rules for a test: the scope, the timing, what's forbidden, and who to contact. You sign it before you start.", example: "The document that says: test only the staff portal, only at night, never phone staff, and call this number if something breaks." },
  { term: "Computer Misuse Act", definition: "The UK law (1990) that makes accessing a computer without permission a crime. It's why authorisation comes first, every time.", example: "People have been prosecuted under it for logging into others' accounts 'just to look' - it's the line between a pentester and a criminal." },
  { term: "responsible disclosure", definition: "Reporting a weakness privately to the owner so they can fix it, instead of exploiting it or making it public.", example: "A researcher finds a bug in a hospital app, emails them privately, and waits for a fix before telling anyone - not posting it online." },
  { term: "methodology", definition: "The ordered phases of an engagement: recon, scanning, exploitation, post-exploitation, then reporting.", example: "Like a surgeon's checklist: recon, scan, exploit, report - in that order every time, so nothing important gets skipped." },
  { term: "reconnaissance", definition: "Gathering information about a target before touching it - the first phase of any engagement.", example: "Before touching a company, a tester reads its public website, job ads and LinkedIn to map its staff and tech - no hacking yet." },
  { term: "exploitation", definition: "Actually using a weakness to prove it's real - only ever within scope and with authorisation.", example: "Spotting a weak password is recon; actually logging in with it to prove it works is exploitation." },
  { term: "in scope", definition: "A system or action the client has authorised you to test.", example: "The client's test site shop-test.example.com is listed in scope - you're cleared to attack it." },
  { term: "out of scope", definition: "Anything the client has NOT authorised - you must not touch it, however tempting.", example: "The CEO's personal email is out of scope - hands off, even though it would be an easy and tempting target." },
  { term: "least impact", definition: "Prove the weakness with the smallest, safest action; never damage data or disrupt the business.", example: "To prove you can read the database, you grab one harmless test record - you don't download all the real customer data." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 7px", letterSpacing: ".06em" };
function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

function Hints({ hints, revealLabel, onReveal }: { hints: string[]; revealLabel?: string; onReveal?: () => void }) {
  const [shown, setShown] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 6, padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hints[i]}</div>
      ))}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {shown < hints.length && <button onClick={() => setShown(shown + 1)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{shown === 0 ? "hint" : "another hint"}</button>}
        {shown >= hints.length && revealLabel && onReveal && <button onClick={onReveal} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{revealLabel}</button>}
      </div>
    </div>
  );
}

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

/* ── scope sort: classify each item as in-scope or out-of-scope ── */
type SortItem = { label: string; inScope: boolean; note: string };
function SortSurface({ items, hint, onSolved }: { items: SortItem[]; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, "in" | "out">>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const allAssigned = items.every((it) => pick[it.label]);
  function check() {
    setChecked(true);
    const ok = items.every((it) => (pick[it.label] === "in") === it.inScope);
    if (ok) { setSolved(true); onSolved(); }
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// the signed scope authorises SOME of these. Mark each one.</div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((it) => {
          const p = pick[it.label];
          const right = checked && (p === "in") === it.inScope;
          const wrong = checked && p && (p === "in") !== it.inScope;
          return (
            <div key={it.label} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <span style={{ flex: "1 1 180px", fontSize: 13.5, color: C.ink }}>{it.label}</span>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "in" })); setChecked(false); }} className="co-opt" style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${p === "in" ? C.green : C.line}`, background: p === "in" ? "rgba(85,217,140,.1)" : "transparent", color: p === "in" ? C.green : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>in scope</button>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "out" })); setChecked(false); }} className="co-opt" style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${p === "out" ? C.red : C.line}`, background: p === "out" ? "rgba(242,109,114,.08)" : "transparent", color: p === "out" ? C.red : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>out</button>
              {((checked && wrong) || solved) && <span style={{ flexBasis: "100%", fontFamily: MONO, fontSize: 11.5, color: solved ? C.green : C.amber }}>↳ {it.note}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!allAssigned || solved}>CHECK SCOPE →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (marked red). Re-read the scope and fix them.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Every item classified correctly - that's your authorised boundary.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── decision: a judgment call with one right answer ── */
type Decision = { prompt: string; options: { text: string; correct?: boolean; feedback: string }[] };
function DecisionCard({ decision, onSolved }: { decision: Decision; onSolved: () => void }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <AnswerReveal
        prompt={decision.prompt}
        options={decision.options.map((o) => ({ text: o.text, correct: o.correct, reason: o.feedback }))}
        onAnswered={() => onSolved()}
      />
    </div>
  );
}

/* ── inspect: read a page source and lift what the dev left behind ── */
type InspectCfg = { host: string; lines: { t: string; leak?: boolean }[]; question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string };
function InspectSurface({ cfg, onSolved }: { cfg: InspectCfg; onSolved: () => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  function check() { if (cfg.accept(v)) { setSolved(true); setMsg({ ok: true, text: "✓ Found it - sitting in the source the server hands every visitor." }); onSolved(); } else setMsg({ ok: false, text: "Not quite - read the source comments again." }); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
        <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>{cfg.host}</span>
      </div>
      <div style={{ padding: 18 }}>
        {!open ? <Btn tone="ghost" onClick={() => setOpen(true)}>VIEW PAGE SOURCE</Btn> : (
          <pre style={{ margin: 0, padding: "12px 14px", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 10, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {cfg.lines.map((l, i) => <span key={i} style={{ display: "block", color: l.leak ? C.amber : "#8fa0c8", background: l.leak ? "rgba(232,163,61,.10)" : "transparent", borderRadius: 3, padding: l.leak ? "1px 4px" : 0 }}>{l.t || " "}</span>)}
          </pre>
        )}
        {open && (
          <div style={{ marginTop: 14 }}>
            <label style={lab}>{cfg.question}</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input style={{ ...inp, flex: "1 1 220px", color: C.amber }} value={v} onChange={(e) => { setV(e.target.value); setMsg(null); }} placeholder={cfg.placeholder} />
              <Btn tone="g" onClick={check} disabled={solved}>SUBMIT →</Btn>
            </div>
            {msg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: msg.ok ? C.green : C.red }}>{msg.text}</div>}
            <Hints hints={[cfg.hint]} revealLabel="stuck? reveal" onReveal={() => setV(cfg.reveal)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── a stage is a sort, a decision, or an inspect ── */
type Stage =
  | { kind: "sort"; title: string; goal: string; items: SortItem[]; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision }
  | { kind: "inspect"; title: string; goal: string; cfg: InspectCfg };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "sort" && <SortSurface items={stage.items} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
      {stage.kind === "inspect" && <InspectSurface cfg={stage.cfg} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Meridian Clinic) ───────────────────────── */

const LEAK_EMAIL = "j.reed@meridian.range";
const SOURCE_LINES = [
  { t: '<form action="/login" method="post">' },
  { t: '  <input name="email" type="email">' },
  { t: '  <input name="pass"  type="password">' },
  { t: "</form>" },
  { t: "<!-- TODO before launch: remove temp setup account", leak: true },
  { t: `     ${LEAK_EMAIL} / M3ridian#Setup -->`, leak: true },
  { t: '<script src="/portal.js"></scr' + "ipt>" },
];

const ACT_STAGES: Stage[] = [
  {
    kind: "sort", title: "Scope", goal: "Stage 1 - Know your boundary. Meridian signed a scope authorising the staff portal only. Mark each target or action in-scope or out.",
    items: [
      { label: "portal.meridian.range (staff login)", inScope: true, note: "This is the authorised target." },
      { label: "patient-records.meridian.range", inScope: false, note: "Real patient data, never authorised - out of scope." },
      { label: "Reading the login page source", inScope: true, note: "Passive recon on the in-scope host is allowed." },
      { label: "Logging into a real staff member's account", inScope: false, note: "Acting on real accounts/data is out - prove the flaw, don't abuse it." },
      { label: "Scanning a different company you noticed", inScope: false, note: "Only the client's authorised systems - anything else is a crime." },
    ],
    hint: "In scope = the staff portal and reading what it exposes. Out = real patient data, real accounts, and anything belonging to anyone else.",
  },
  {
    kind: "inspect", title: "Recon", goal: "Stage 2 - Passive recon, in scope. Read the staff login's source (the HTML the server sends every visitor) and find what the dev left behind.",
    cfg: { host: "portal.meridian.range · staff login", lines: SOURCE_LINES, question: "the leaked account's email address", placeholder: "name@meridian.range", accept: (v) => v.trim().toLowerCase() === LEAK_EMAIL, hint: "Open the source and read the comments. A TODO left a temp account: j.reed@meridian.range.", reveal: LEAK_EMAIL },
  },
  {
    kind: "decision", title: "Stay in scope", goal: "Stage 3 - The tempting detour. While reading the source you spot a link to patient-records.meridian.range - not in your scope. What's the professional move?",
    decision: { prompt: "You've found an out-of-scope system that looks reachable. What do you do?", options: [
      { text: "Leave it alone, note that it's reachable, and report it.", correct: true, feedback: "Right. Out of scope means hands off - don't touch it. You document the exposure and let the client decide; touching it would be a crime, authorisation or not." },
      { text: "Have a quick look - just reading patient data isn't really hacking.", feedback: "No. Accessing data you're not authorised for is exactly what the Computer Misuse Act forbids, and reading real patient records is a serious breach." },
      { text: "Log in with the leaked account to see how far it reaches.", feedback: "That's exceeding scope and acting on real systems. Prove the leak exists; don't go exploring with it." },
      { text: "Delete the link so that attackers can't ever find it.", feedback: "Never alter the client's systems. You report what you find; you don't change things." },
    ] },
  },
  {
    kind: "decision", title: "Handle it right", goal: "Stage 4 - Responsible handling. You have a working leaked credential for the in-scope portal. How do you close out the finding?",
    decision: { prompt: "You hold a valid leaked credential. What's the correct, professional next step?", options: [
      { text: "Document it as a finding and recommend the account be disabled and rotated.", correct: true, feedback: "Right. Prove it exists, report it with least impact, and advise rotation immediately - without using it on real data. That's responsible disclosure." },
      { text: "Use it to pull as much data as possible, as proof for the report.", feedback: "No - least impact. A screenshot that the credential is valid is proof enough; hoarding real data is harmful and out of bounds." },
      { text: "Post it in the team chat so everyone can verify it works.", feedback: "Never spread a live credential. Keep findings confidential to the client and the engagement." },
      { text: "Keep it in case it turns out useful on a future engagement.", feedback: "Absolutely not - that's theft of a credential. It belongs only to this authorised test, and the client must rotate it." },
    ] },
  },
];

function RoeAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const stage = ACT_STAGES[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STAGES.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StageView key={si} stage={stage} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: authorised, or a crime? ───────────────────────── */

function AuthorisedLab({ onDone }: { onDone: () => void }) {
  const CASES = [
    { t: "Testing a client's website after they signed a scope authorising it", ok: true },
    { t: "Scanning a company's servers because their login 'looked weak'", ok: false },
    { t: "Reading your own company's public homepage source", ok: true },
    { t: "Trying passwords on a stranger's email 'just to see'", ok: false },
  ];
  const [idx] = useState(() => Math.floor(Math.random() * CASES.length));
  const c = CASES[idx];
  const [answer, setAnswer] = useState<null | boolean>(null);
  const correct = answer !== null && answer === c.ok;
  useEffect(() => { if (correct) onDone(); }, [correct, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · authorised, or a crime?</div>
      <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, marginBottom: 12 }}>{c.t}</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setAnswer(true)} className="co-opt" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${answer === true ? (c.ok ? C.green : C.red) : C.line}`, background: "transparent", color: C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>Authorised</button>
        <button onClick={() => setAnswer(false)} className="co-opt" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${answer === false ? (!c.ok ? C.green : C.red) : C.line}`, background: "transparent", color: C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>A crime</button>
      </div>
      {answer !== null && (
        <div style={{ marginTop: 11, fontSize: 13, color: correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>
          {correct ? "✓ Right. The only thing that makes the same action legal is explicit permission to test that specific system." : "Not quite - the test is simple: is there written permission to test THIS system? If not, it's unauthorised access."}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── defend lab: the professional standard ───────────────────────── */

function ProStandardLab({ onDone }: { onDone: () => void }) {
  const opts = [
    { code: "Start testing as soon as the client emails 'sounds good'", ok: false, why: "A casual email isn't authorisation. You need a signed scope naming the systems, the window and the limits - otherwise it's unauthorised access." },
    { code: "Test whatever looks interesting, and sort out the scope later", ok: false, why: "Scope comes first, always. Touching anything unauthorised is a crime regardless of good intentions." },
    { code: "Get a signed scope and rules of engagement before you test", ok: true, why: "This is the standard: written authorisation, agreed rules, and staying strictly inside the boundary - test only what the scope names. Everything else follows from it." },
    { code: "Get a verbal go-ahead from your main contact and start", ok: false, why: "A verbal okay isn't authorisation you can rely on. You still need a signed scope naming the systems, window and limits before touching anything." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE STANDARD · how should an engagement start?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Brightpost Media",
    brief: "Brightpost authorised a test of their blog only. Classify what's in and out of scope. No walkthrough.",
    stages: [{ kind: "sort", title: "Scope", goal: "Mark each item in or out of scope (blog only).", items: [
      { label: "blog.brightpost.range", inScope: true, note: "The authorised target." },
      { label: "The CEO's personal Gmail", inScope: false, note: "Personal accounts are never in scope." },
      { label: "mail.brightpost.range (not listed)", inScope: false, note: "Not named in the scope = out." },
      { label: "Reading the blog's robots.txt", inScope: true, note: "Passive recon on the in-scope host is fine." },
    ], hint: "Only the blog was named. Everything not named - and anything personal - is out." }],
    success: "Classified the scope correctly - you only ever touch what's named. Finding logged.",
  },
  {
    client: "Tideway Council",
    brief: "Mid-test you hit a judgment call. Make the professional decision.",
    stages: [{ kind: "decision", title: "Judgment", goal: "A curveball during the Tideway test.", decision: { prompt: "A council system you're testing starts behaving oddly and might be about to crash. What do you do?", options: [
      { text: "Stop immediately and contact the client's named point of contact.", correct: true, feedback: "Right. Least impact and clear comms: you never risk disrupting a live service without telling the client." },
      { text: "Push harder, since a crash would really prove the vulnerability.", feedback: "No. Causing an outage is real harm and usually outside the rules of engagement." },
      { text: "Quietly carry on and mention it in the report later.", feedback: "Risking a live service without telling anyone breaks the rules of engagement; contact the client now." },
      { text: "Restart the system yourself to clear whatever is wrong.", feedback: "Never alter or operate the client's live systems. Stop and let their named contact decide." },
    ] } }],
    success: "Paused and escalated instead of risking a live service - exactly right. Finding logged.",
  },
  {
    client: "Flux Fitness",
    brief: "Flux left something in their source. Read it responsibly. Trickier.",
    stages: [{ kind: "inspect", title: "Recon", goal: "Find the leaked API key in the page source - and remember what to do with it.", cfg: { host: "app.flux.range · members", lines: [{ t: "<script>" }, { t: "  const API = 'https://api.flux.range';" }, { t: "  // TODO remove: const KEY = 'flx_live_7a2b9c';", leak: true }, { t: "</script>" }], question: "the leaked API key", placeholder: "the key", accept: (v) => v.trim() === "flx_live_7a2b9c", hint: "The commented-out line holds it: flx_live_7a2b9c (report it, recommend rotation - don't use it).", reveal: "flx_live_7a2b9c" } }],
    success: "Found a live key in front-end source - the kind of leak that should be rotated at once. Finding logged.",
  },
  {
    client: "Oakline Store",
    brief: "The full field job to finish on. Scope it, recon it, then make the right call. Chain it yourself.",
    stages: [
      { kind: "sort", title: "Scope", goal: "Step 1: classify Oakline's scope (the shop only).", items: [
        { label: "shop.oakline.range", inScope: true, note: "Authorised." },
        { label: "A supplier's portal linked from the shop", inScope: false, note: "A third party is never in your scope." },
      ], hint: "Only Oakline's shop is authorised; the supplier is someone else's system." },
      { kind: "decision", title: "Call", goal: "Step 2: you find a real customer's order while testing. The move?", decision: { prompt: "A bug exposes a real customer's order details. What do you do?", options: [
        { text: "Capture just enough to prove the bug, then stop and report it.", correct: true, feedback: "Right. Prove it with least impact, don't harvest it, and report responsibly." },
        { text: "Download all the customer orders to keep as evidence.", feedback: "No - least impact. Don't hoard real personal data; a single proof is enough." },
        { text: "Email the affected customer to warn them directly.", feedback: "Not your call - contacting data subjects is the client's responsibility. Report it to them with least impact." },
        { text: "Carry on testing and note the exposure for the report.", feedback: "Stop touching real customer data the moment you've proved the bug. Least impact comes first." },
      ] } },
    ],
    success: "Scoped it, then handled real data responsibly - that's the whole of Rules of Engagement. Finding logged.",
  },
];

function DrillRunner({ stages, success, onSolved }: { stages: Stage[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (si + 1 < stages.length) { setSi((n) => n + 1); setCleared(false); } else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {stages.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {stages.length}</div>}
      {!done && <StageView key={si} stage={stages[si]} onSolved={() => setCleared(true)} />}
      {!done && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {si + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{si + 1 < stages.length ? "Next step →" : "Done →"}</Btn>
        </div>
      )}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {success}</div>}
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const d = DRILLS[i];
  function onSolved() { setSolved((s) => { const n = [...s]; n[i] = true; return n; }); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DRILLS.map((dr, k) => (
          <div key={dr.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? C.indigo : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? C.indigo2 : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{d.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{d.brief}</p>
      </div>
      <DrillRunner key={d.client} stages={d.stages} success={d.success} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_STAGES: Stage[] = [
  { kind: "sort", title: "Scope", goal: "Sableline authorised their customer portal only. Classify the scope.", items: [
    { label: "portal.sableline.range", inScope: true, note: "Authorised." },
    { label: "Sableline's office Wi-Fi", inScope: false, note: "Not named - out." },
    { label: "A partner company's API", inScope: false, note: "A third party - never in scope." },
    { label: "Reading the portal's responses", inScope: true, note: "Passive recon in scope." },
  ], hint: "Only the named portal and reading what it exposes." },
  { kind: "inspect", title: "Recon", goal: "Read the portal source and find what the dev left in a comment.", cfg: { host: "portal.sableline.range", lines: [{ t: "<body>" }, { t: "  <!-- staging login: s.vale@sableline.range / Stag3!Set -->", leak: true }, { t: "</body>" }], question: "the leaked staging email", placeholder: "name@sableline.range", accept: (v) => v.trim().toLowerCase() === "s.vale@sableline.range", hint: "The comment holds it: s.vale@sableline.range.", reveal: "s.vale@sableline.range" } },
  { kind: "decision", title: "Call", goal: "Finish it: you have the leaked credential and spot an out-of-scope admin panel. The move?", decision: { prompt: "Leaked credential in hand, an out-of-scope admin panel in view. What do you do?", options: [
    { text: "Report the leaked credential and the reachable panel, and touch neither.", correct: true, feedback: "Right. In scope, least impact, responsible disclosure: recommend rotation and go no further than proof - the whole module in one decision." },
    { text: "Use the credential on the admin panel to show maximum impact.", feedback: "No - the panel is out of scope and that's unauthorised access. Report it; don't enter it." },
    { text: "Keep the credential for later and quietly move on.", feedback: "Never retain a live credential. Report it and have it rotated." },
    { text: "Try the credential once on the panel, just to confirm it works.", feedback: "That single login is already unauthorised access to an out-of-scope system. Report that it's reachable; don't enter it." },
  ] } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full kickoff · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={() => setCleared(true)} />}
      {!won && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{phase + 1 < CAP_STAGES.length ? "Next step →" : "Finish the challenge →"}</Btn>
        </div>
      )}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}scoped_legal_and_cle4n{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Scoped it, recon'd it, and made every call the right way - that's what separates an operator from a criminal.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE1: ModuleDef = {
  code: "M-01",
  moduleNo: 1,
  title: "Rules of Engagement",
  client: "Meridian Clinic",
  brief:
    "Welcome to Redoubt. You're a junior operator now - real engagements, real guardrails. This first job is as much about how you work as what you find. First client: Meridian Clinic, whose new staff portal goes live next week. The full job: know your scope cold, do one piece of real in-scope recon, then make the judgment calls that separate a professional from a criminal. Then four field jobs for new clients, and a final challenge you run start to finish. Everything lives in the range: fake data, no real systems, nothing leaves this browser.",
  industry: {
    tag: "The same action is a professional service with permission, and a crime without it.",
    motif: { pre: "try a login  ->  ", hit: "with a signed scope", post: "", note: "a paid job. without it, a crime under the Computer Misuse Act" },
    primer: {
      term: "Authorised hacking",
      what: "A penetration test is authorised, ethical hacking: you find the weaknesses in a system before criminals do, then report them so they get fixed. The one thing that makes it legal is permission. The exact same action, trying a password or scanning a server, is a professional service with written authorisation and a crime without it. In the UK that line is the Computer Misuse Act 1990.",
      example: "AUTHORISED: portal.client.range  (login + session only)",
      returns: "That signed scope is what separates you from a criminal. It says exactly what you may touch, and everything you may not. Stay inside it and you're a professional; step outside, even once, even with good intentions, and you've broken the law. Working inside the rules is this whole module.",
    },
    learn: [
      "Tell what's in scope from what's off limits, and why it matters.",
      "Do one piece of real, in-scope reconnaissance.",
      "Make the professional call when a tempting target is out of scope.",
      "Handle a finding responsibly: report it, never abuse it.",
    ],
    engines: [
      { name: "Kali Linux", color: "#5fe6ff", blurb: "The industry-standard toolkit: a Linux system preloaded with hundreds of testing tools. The operator's workbench.", here: true, icon: "tool" },
      { name: "Metasploit", color: "#4ade80", blurb: "The best-known framework for safely proving a weakness is real.", icon: "tool" },
      { name: "Burp Suite", color: "#ff6633", blurb: "The standard tool for testing websites: it sits between browser and server to read and edit traffic.", icon: "tool" },
      { name: "Nmap", color: "#8b7bff", blurb: "The classic scanner that maps what machines and services are on a network.", icon: "scan" },
      { name: "Wireshark", color: "#ffb347", blurb: "A network microscope that captures and reads the actual packets on a network.", icon: "scan" },
    ],
    headline: {
      masthead: "THE STATUTE SENTINEL",
      dateline: "LONDON · 2005 · UK COURT RECORD (COMPUTER MISUSE ACT)",
      title: "He checked a charity site looked real, and was convicted for it",
      body: "After donating to a 2004 tsunami appeal, a security professional got no thank-you page and worried the site was a scam stealing card details. He ran one quick test to check it was genuine. The test tripped an alarm, the police were called, and he was convicted under the Computer Misuse Act 1990, fined, and lost his job. The judge ruled that unauthorised access is an offence 'however praiseworthy the motives'.",
      stat: "£1,000",
      statLabel: "FINE + COSTS, FOR ONE CURIOUS TEST",
      why: "Good intentions did not matter; he had no permission, so it was a crime. That is the whole point of this module: permission, in writing, is the line, and it never moves.",
    },
    realWorld:
      "Every skill in this course is useful only inside the law. Authorised, ethical hacking, testing systems with written permission and reporting what you find, is a real, well-paid, respected profession. The same actions without permission are criminal. The difference isn't the tools or the skill; it's a signed agreement and the discipline to stay inside it. Learn the rules first, and everything after is a career instead of a charge.",
    now: {
      stat: "$81M",
      statLabel: "paid to ethical hackers via HackerOne in a year",
      body: "Finding flaws WITH permission is now a serious career: through one platform, HackerOne, organisations paid ethical hackers around $81 million in bug bounties in a single year, and top researchers earn six figures. In the UK, the Computer Misuse Act 1990 is the law that makes authorisation, not skill, the dividing line.",
    },
    recent: {
      year: "2025",
      title: "Legal hacking goes mainstream",
      body: "The penetration-testing market was worth roughly $1.7 billion in 2024 and is forecast to more than double by 2029, and bug-bounty payouts keep climbing. Governments now run official vulnerability-disclosure services so people can report flaws the legal way. Doing this with permission has become a mainstream, in-demand career.",
    },
    ahead:
      "AI is changing the job. In 2025 an autonomous AI pentester briefly topped HackerOne's US leaderboard, out-filing every human, and more programs now put AI in scope. When machines can find raw bugs at scale, the uniquely human parts matter more, not less: staying inside authorised scope, judging what's safe to test, and disclosing responsibly. The rules of engagement, not the button-pushing, become the job.",
    role:
      "This is the foundation for every security career: penetration tester, red teamer, security consultant and bug-bounty hunter. Master the rules here and the rest of the course is training for a real, legal profession.",
    roles: ["Penetration tester", "Red teamer", "Security consultant", "Bug-bounty hunter"],
  },
  lesson: {
    blocks: [
      { h: "What you actually do here", body: "A penetration test is authorised, ethical hacking. Your job is to find the weaknesses in a client's systems before criminals do, then report them so they get fixed. Everything that makes it legal and useful comes down to a few rules - the rules of engagement - and this module is where you learn them before you touch anything." },
      { h: "Rule zero: authorisation, or it's a crime", body: "You may only ever test a system you have explicit, written permission to test. The exact same action - trying a password, scanning a server - is a professional service with authorisation and a crime without it. In the UK that line is the Computer Misuse Act 1990. This is why every engagement starts by signing a scope, never with a keyboard." },
      { h: "Scope: the boundary you never cross", body: "The scope lists precisely what you may test, when, and how - and by implication everything you may not. The client's staff portal might be in; their patient database, their staff's personal accounts, and any third party are out. Out of scope means hands off, however reachable or tempting it looks. Staying inside the boundary is the single most important habit you have." },
      { h: "The methodology", body: "A professional test follows ordered phases: reconnaissance (gather information), scanning (map the systems), exploitation (prove a weakness is real), post-exploitation (understand the impact), and reporting (write it up so it can be fixed). You work the phases in order, and you only ever act within scope at each one." },
      { h: "Conduct and disclosure", body: "Two principles govern how you act. Least impact: prove a weakness with the smallest, safest action - never damage data or disrupt the business. And responsible disclosure: report what you find privately to the client so they can fix it, never exploit it for yourself or make it public. A leaked credential gets documented and rotated, not used and kept." },
    ],
    Interactive: AuthorisedLab,
    summary: [
      "A pentest is authorised, ethical hacking: find weaknesses before criminals do, then report them.",
      "Rule zero: only test what you have written permission to test - without it, the same action is a crime.",
      "Scope is the boundary; out of scope means hands off, however reachable it looks.",
      "The methodology runs in order: recon, scanning, exploitation, post-exploitation, reporting.",
      "Least impact and responsible disclosure: prove it safely, report it privately, never abuse or keep what you find.",
    ],
    check: {
      q: "A professional test runs its stages in a set order. Which sequence is the right one?",
      options: [
        { text: "Recon, then scanning, then exploitation, then post-exploitation, then reporting.", correct: true, feedback: "Right - you map and understand the target before you touch it, and you always finish by writing up what you found." },
        { text: "Exploitation first to prove the impact, then recon and scanning to explain it afterwards.", feedback: "You can't reliably exploit what you haven't mapped - recon and scanning come before exploitation, not after it." },
        { text: "Reporting first so the client knows the plan, then scanning, then exploitation at the end.", feedback: "The report comes last - it's the write-up of what you actually found, not the opening move." },
        { text: "Scanning, then reporting, then exploitation once that report has been approved.", feedback: "Reporting is the final stage; exploitation and post-exploitation happen during the test, before you write it up." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "portal.meridian.range (staff login) - and the scope itself",
    inScope: "the staff login and reading what it exposes; the consolidation clients named in each drill",
    offLimits: "patient records, real accounts, every other host and third party, acting on real data",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Mark the scope correctly, do one piece of in-scope recon on the login source, then make the two judgment calls - stay in scope, and handle the finding responsibly. There's a right answer to each; take your time. You prove weaknesses, you never abuse them.",
  hint: "Work the stages in order. Only the staff portal and reading it are in scope - everything personal or third-party is out. Open the source to find the leak, then on the decisions choose least impact and responsible disclosure every time.",
  plan: [
    { label: "Know your scope", goal: "Mark each target or action in-scope or out: the boundary you never cross." },
    { label: "In-scope recon", goal: "Do one real piece of passive recon, reading only what you're authorised to." },
    { label: "Stay in scope", goal: "A tempting target appears that's out of scope. Make the professional call." },
    { label: "Handle it right", goal: "You have a working finding. Report it responsibly instead of using it." },
  ],
  Act: RoeAct,
  flag: "flag{s0urce_l3ak_f0und}",
  defend: {
    blocks: [
      { h: "The client's fix for the leak", body: "Secrets never belong in source code or comments. Keep them in environment variables or a secrets manager, and strip comments and test data out of production builds. And if a secret is ever exposed - even for a minute - rotate it immediately and assume it is already compromised. That is what you recommend in your report." },
      { h: "How a safe engagement is run", body: "Both sides keep a test safe. The client defines a clear scope and rules of engagement, provides a point of contact, and sets up a private channel to receive findings. The operator signs that scope, works only inside it, keeps impact minimal, and discloses responsibly. Skip the paperwork and even a well-meaning test becomes unauthorised access." },
      { h: "This happens constantly", body: "Leaked secrets in source are one of the most common exposures in the real world - companies routinely commit API keys and passwords to public code or ship them in front-end JavaScript anyone can read. The professional response is always the same: find it, report it, rotate it, and never, ever use it beyond proving it exists." },
    ],
    Interactive: ProStandardLab,
    check: {
      q: "You found Meridian's leaked account. What should they do first?",
      options: [
        { text: "Disable or rotate the account immediately, then remove it from the source.", correct: true, feedback: "Right. Assume it's burned: kill the credential first, then remove it from the source." },
        { text: "Delete the leaked comment from the website's page source.", feedback: "Necessary, but not first - the credential is already out, so removing the comment doesn't un-leak it." },
        { text: "Nothing much, since it's only a disposable test account.", feedback: "A working credential is a working credential; leftover test accounts are a classic way in." },
        { text: "Change the website's design so the login looks different.", feedback: "Appearance is irrelevant - the exposed credential must be rotated and removed." },
      ],
    },
  },
  finding: {
    title: "Credentials leaked in page source",
    where: "portal.meridian.range · login page · HTML comment",
    severity: "High",
    cvss: "8.2",
    impact: "A working setup account was left in a source comment; anyone who reads the page can sign in. Found through in-scope passive recon and handled without accessing any real data.",
    fix: "Strip comments and test data from production builds; store secrets in a secrets manager; rotate the exposed account immediately and treat it as compromised.",
  },
  cheatsheet: {
    title: "Rules of engagement quick reference",
    blurb: "What makes testing legal, the judgment calls, and how this becomes a career, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "The whole module is this one column break. The SAME action is a job or a crime, and only one thing decides which: permission.",
      cols: ["the action", "with written permission", "without it"],
      rows: [
        ["trying a login / password", "an authorised test", "a criminal offence (CMA s1)"],
        ["scanning a server", "in-scope recon", "unauthorised access"],
        ["using a leaked credential", "report + recommend rotation", "a crime, even if found by accident"],
      ],
    },
    groups: [
      {
        heading: "What makes it legal",
        entries: [
          { code: "authorisation", what: "Explicit, written permission to test a specific system. The one thing that makes it legal.", example: "a signed scope naming portal.client.range" },
          { code: "scope", what: "Exactly what you may test, when and how, and by implication everything you may not.", example: "in: the staff login. out: patient records." },
          { code: "Computer Misuse Act 1990", what: "The UK law: making a computer do anything to get access you know is unauthorised is a crime, even attempting it.", example: "no permission = an offence, whatever your motive" },
          { code: "least impact", what: "Prove a weakness with the smallest, safest action; never damage data or disrupt the business.", example: "show you can read a record, don't delete it" },
        ],
      },
      {
        heading: "The judgment calls",
        entries: [
          { code: "the tempting detour", what: "Out of scope means hands off, however reachable or interesting it looks.", example: "a linked database that isn't in scope -> leave it" },
          { code: "responsible disclosure", what: "Report what you find privately to the client so they can fix it; never exploit or publish it.", example: "a leaked key -> document it, recommend rotation" },
          { code: "the methodology", what: "Work in order: recon, scanning, exploitation, post-exploitation, reporting, staying in scope at each step.", example: "map before you touch; report at the end" },
          { code: "when in doubt, stop", what: "If you're not sure something is authorised, don't do it: ask first.", example: "unclear scope -> check before acting" },
        ],
      },
      {
        heading: "Doing it as a career",
        entries: [
          { code: "bug bounty", what: "Authorised programs pay you to find and report flaws through platforms like HackerOne.", example: "report via the program, get paid per valid bug" },
          { code: "vulnerability disclosure", what: "Many orgs and governments publish how to report a flaw safely and legally.", example: "a security.txt or VDP telling you where to report" },
          { code: "certifications", what: "Recognised qualifications show you can test professionally and legally.", example: "CompTIA PenTest+, CEH, OSCP" },
          { code: "permission in writing", what: "Always get it before you touch anything, every engagement, no exceptions.", example: "signed scope first, keyboard second" },
        ],
      },
    ],
  },
  takeaway: "A signed scope is the only thing that separates a tester from a criminal. No scope, no touching the keyboard.",
  outcome: [
    "Tell authorised, legal testing apart from a crime - and explain why a signed scope comes before anyone touches a keyboard.",
    "Read a scope and stay inside it, leaving anything out of scope untouched however reachable or tempting it looks.",
    "Work an engagement in the right order - recon, exploit, report - and prove a weakness with the least possible impact.",
  ],
  rep: 25,
  repRank: "Recruit",
  repTo: "25 / 100 to Junior Operator",
  next: "NEXT MODULE · Reconnaissance & OSINT →",
};

export default function Module1() {
  const [started, setStarted] = useState(false);
  if (!started) return <CourseIntro onBegin={() => setStarted(true)} />;
  return <Engagement mod={MODULE1} />;
}

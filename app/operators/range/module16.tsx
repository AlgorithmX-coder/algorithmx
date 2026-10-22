"use client";

/* Module 16 - Full Engagement, Part 2 + Debrief (DEPTH STANDARD, season close).
 *
 * The finale: turn the Part-1 break-in into a professional result and close the
 * engagement - reconstruct the chain, score it, build the report, deliver and
 * debrief. Modelled in-browser. Shape mirrors M5: hover glossary, interactive
 * lesson lab, de-biased check, a FOUR-stage capture with a hint ladder, FOUR
 * drills, and a chained capstone. The portfolio's closing piece. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "engagement report", definition: "The written deliverable of a test: findings, severities, impact and fixes a client can act on. The actual product.", example: "After two weeks of hacking, what you actually hand the client is a 20-page PDF listing each flaw and its fix, not a pile of raw screenshots." },
  { term: "deliverable", definition: "What the client pays for and receives - here, a clear report, not the break-in itself.", example: "The client does not pay to watch you break in; they pay for the tidy document that tells their developers exactly what to repair." },
  { term: "debrief", definition: "The closing meeting where you walk the client through the findings and agree what happens next.", example: "You sit down with the company's team, talk through the three worst bugs on screen, and agree who fixes what and by when." },
  { term: "severity", definition: "How serious a finding is, banded Low to Critical, scored on exploitability and impact.", example: "'Anyone can read every order' is Critical and tops the report; 'the site reveals its version number' is Low and sits near the bottom." },
  { term: "remediation", definition: "The concrete fix a developer can act on today - specific, not 'be more secure'.", example: "You write 'add a server-side check that the logged-in user owns the order before showing it', not the useless advice 'improve security'." },
  { term: "attack path", definition: "The chain of findings that combine into an impact. Reviewing systems by attack path catches dangerous combinations.", example: "Your report draws the route as a map: leaked path, then exposed backup, then reused password, then admin, so the client sees how the small bugs linked up." },
  { term: "post-exploitation", definition: "What you do once you're in - proving impact with least harm, never destroying or hoarding real data.", example: "Once inside the admin panel you take one screenshot to prove access, then stop; you do not start deleting accounts or copying the customer list." },
  { term: "least harm", definition: "Prove the impact with the smallest, safest action; a screenshot of access beats exfiltrating real records.", example: "To show you reached the database you copy a single dummy test row, rather than downloading all 50,000 real customers." },
  { term: "coordinated disclosure", definition: "Delivering findings privately, giving time to fix before any public detail.", example: "You give the company 90 days to patch before you mention the flaw in a public write-up, so criminals do not learn it first." },
  { term: "portfolio", definition: "Your growing record of real, ethical findings - concrete proof of skill for a teacher, university or employer.", example: "At a university or job interview you show three write-ups of bugs you reported responsibly, which proves far more than just saying 'I like hacking'." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

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

const SEV_COLOR: Record<string, string> = { Low: C.soft, Medium: C.amber, High: "#ff9d5c", Critical: C.red };

/* ── order: sequence steps ── */
type OrderItem = { label: string; pos: number };
function OrderSurface({ items, intro, hint, onSolved }: { items: OrderItem[]; intro: string; hint: string; onSolved: () => void }) {
  const [shuffled] = useState(() => { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  const [seq, setSeq] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [solved, setSolved] = useState(false);
  const avail = shuffled.filter((it) => !seq.includes(it.label));
  function add(l: string) { setSeq((s) => [...s, l]); setChecked(null); }
  function removeAt(i: number) { setSeq((s) => s.filter((_, k) => k !== i)); setChecked(null); }
  function check() { const ok = seq.length === items.length && seq.every((l, i) => items.find((x) => x.label === l)!.pos === i); setChecked(ok); if (ok) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// {intro}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>STEPS</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {avail.length ? avail.map((it) => <button key={it.label} onClick={() => add(it.label)} className="co-opt" style={{ padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.carbon, color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{it.label}</button>) : <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>(all placed)</span>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>YOUR SEQUENCE</div>
      <div style={{ display: "grid", gap: 5, minHeight: 40 }}>
        {seq.map((l, i) => { const wrong = checked === false && items.find((x) => x.label === l)!.pos !== i; return (
          <button key={i} onClick={() => removeAt(i)} className="co-opt" style={{ textAlign: "left", padding: "8px 11px", borderRadius: 8, border: `1px solid ${checked === true ? C.green : wrong ? C.red : C.lineSoft}`, background: C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}><span style={{ color: C.indigo2, marginRight: 8 }}>{i + 1}.</span>{l}</button>
        ); })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={seq.length !== items.length || solved}>CHECK →</Btn></div>
      {checked === false && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not quite - the red ones are out of order.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Correct.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── severity: score a finding to a band ── */
type SevRow = { finding: string; band: string; note: string };
function SeveritySurface({ rows, hint, onSolved }: { rows: SevRow[]; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const bands = ["Low", "Medium", "High", "Critical"];
  const all = rows.every((r) => pick[r.finding]);
  function check() { setChecked(true); if (rows.every((r) => pick[r.finding] === r.band)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// score the finding honestly: exploitability and impact together</div>
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((r) => {
          const right = checked && pick[r.finding] === r.band; const wrong = checked && pick[r.finding] && pick[r.finding] !== r.band;
          return (
            <div key={r.finding} style={{ padding: "11px 13px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.45, marginBottom: 9 }}>{r.finding}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {bands.map((b) => <button key={b} onClick={() => { setPick((x) => ({ ...x, [r.finding]: b })); setChecked(false); }} className="co-opt" style={{ padding: "4px 11px", borderRadius: 7, border: `1px solid ${pick[r.finding] === b ? SEV_COLOR[b] : C.line}`, background: "transparent", color: pick[r.finding] === b ? SEV_COLOR[b] : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>{b}</button>)}
              </div>
              {checked && wrong && <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 11.5, color: C.amber }}>↳ {r.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CONFIRM SEVERITY →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not the right band - weigh it honestly.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Scored honestly.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── decision ── */
type Decision = { prompt: string; options: { text: string; correct?: boolean; feedback: string }[] };
function DecisionCard({ decision, onSolved }: { decision: Decision; onSolved: () => void }) {
  const [opts] = useState(() => { const a = [...decision.options]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, marginBottom: 12, fontFamily: DISP, fontWeight: 600 }}>{decision.prompt}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.correct) { setSolved(true); onSolved(); } }} disabled={solved} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "11px 13px", borderRadius: 9, border: `1px solid ${isP ? (o.correct ? C.green : C.red) : C.line}`, background: isP ? (o.correct ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: "var(--font-plex-sans),system-ui,sans-serif", fontSize: 14, cursor: solved ? "default" : "pointer" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: isP ? (o.correct ? C.green : C.red) : C.mute, marginRight: 9 }}>{isP ? (o.correct ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.text}
              </button>
              {isP && <div style={{ padding: "8px 13px 2px", fontSize: 13, color: o.correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.feedback}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── a stage ── */
type Stage =
  | { kind: "order"; title: string; goal: string; items: OrderItem[]; intro: string; hint: string }
  | { kind: "severity"; title: string; goal: string; rows: SevRow[]; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "order" && <OrderSurface items={stage.items} intro={stage.intro} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "severity" && <SeveritySurface rows={stage.rows} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Vantage write-up) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  { kind: "order", title: "The chain", goal: "Stage 1 - Reconstruct what you did. Before you write it up, lay out the Part-1 attack chain in order, so the report tells the true story.",
    intro: "order the steps of the Part-1 compromise you ran",
    items: [
      { label: "Recon: robots.txt named the backup", pos: 0 },
      { label: "Loot: the exposed backup leaked an admin credential", pos: 1 },
      { label: "Break in: reused the credential to log in as admin", pos: 2 },
      { label: "Impact: exported the full customer database", pos: 3 },
    ],
    hint: "Recon -> loot -> break in -> impact. The same order you ran it in Part 1." },
  { kind: "severity", title: "Score", goal: "Stage 2 - Score it honestly. A client acts on the severity. Score the chained finding as it really is.",
    rows: [{ finding: "Chained recon-to-admin compromise: remote, no authentication needed, full read/write of the entire customer database", band: "Critical", note: "Remote, unauthenticated, total impact = Critical. Softening it to seem reasonable would be a disservice." }],
    hint: "Remote + no login + whole database = the top band, Critical." },
  { kind: "order", title: "Report", goal: "Stage 3 - Build the report. Structure the write-up so Vantage can act on it fast.",
    intro: "order the sections of the finding report",
    items: [
      { label: "Title", pos: 0 },
      { label: "Location (the chain path)", pos: 1 },
      { label: "Severity", pos: 2 },
      { label: "Impact", pos: 3 },
      { label: "Steps to reproduce", pos: 4 },
      { label: "Remediation", pos: 5 },
    ],
    hint: "Title, location, severity, impact, reproduce, remediation." },
  { kind: "decision", title: "Deliver", goal: "Stage 4 - Deliver and debrief. The report is written. How do you close the engagement properly?",
    decision: { prompt: "The report is ready. How do you close out the Vantage engagement?", options: [
      { text: "Deliver it privately to Vantage and walk them through it in a debrief.", correct: true, feedback: "Right - coordinated delivery, a debrief, a concrete remediation and attack-path recommendation, and a portfolio entry, with no further exploitation or touching real data. That's a professional close." },
      { text: "Publish the full chain and exploit online to show what you found.", feedback: "That exposes Vantage's customers before any fix - deliver privately and coordinate." },
      { text: "Use the admin access again to pull more data as extra proof.", feedback: "Least harm - your reproduction steps are proof enough; don't touch real customer data." },
      { text: "Just email them the raw flag and move straight on.", feedback: "A flag isn't a report. The client needs the finding, severity, impact and fix, delivered and debriefed." },
    ] } },
];

function FinaleAct({ onCapture }: { onCapture: () => void }) {
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
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: score the capstone ───────────────────────── */

function ScoreLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === "Critical";
  useEffect(() => { if (correct) onDone(); }, [correct, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · score your capstone finding</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Your Part-1 chain gave remote, unauthenticated, full admin access to the whole customer database. What severity goes in the report?</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Low", "Medium", "High", "Critical"].map((b) => <button key={b} onClick={() => setPicked(b)} className="co-opt" style={{ padding: "6px 13px", borderRadius: 8, border: `1px solid ${picked === b ? SEV_COLOR[b] : C.line}`, background: "transparent", color: picked === b ? SEV_COLOR[b] : C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>{b}</button>)}
      </div>
      {picked && <div style={{ marginTop: 11, fontSize: 13, color: correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{correct ? "✓ Critical - remote, no login, total impact. Score it straight; the client needs the truth." : "Remote, no login, whole database - that's the very top band every time."}</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: the portfolio ───────────────────────── */

function PortfolioLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [opts] = useState(() => shuffle([
    { code: "It proves to people that you watched some security videos", ok: false, why: "It's far more than that - it's a record of real work you actually did, end to end." },
    { code: "It guarantees you a job in cyber security", ok: false, why: "No guarantees - but it's genuine, demonstrable proof of ability, which is what opens doors." },
    { code: "It's hands-on evidence of real skill across attack and defence", ok: true, why: "Right - sixteen real findings, honestly reported, mapped to attack and defence. Concrete, ethical, hands-on proof is exactly what stands out to a university or employer." },
    { code: "It lets you list a long set of tools on your CV", ok: false, why: "Tool names on a CV mean little on their own. What stands out is evidence you applied them to real, honestly-reported findings." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ THE CLOSE · what makes your portfolio valuable?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.ok) onDone(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.ok ? C.green : C.red) : C.line}`, background: isP ? (o.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: "var(--font-plex-sans),system-ui,sans-serif", fontSize: 13.5, cursor: "pointer", lineHeight: 1.4 }}>
                <span style={{ fontFamily: MONO, color: isP ? (o.ok ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (o.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.code}
              </button>
              {isP && <div style={{ padding: "7px 12px 2px", fontSize: 12.5, color: o.ok ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.why}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Reconstruct Brightpost's chain for the report. No walkthrough.", stages: [{ kind: "order", title: "Chain", goal: "Order the attack chain.", intro: "order the compromise", items: [ { label: "Recon finds exposed .env", pos: 0 }, { label: "Loot API key from .env", pos: 1 }, { label: "Use key to reach admin API", pos: 2 } ], hint: "Recon -> loot -> use." }], success: "Chain reconstructed truthfully. Finding logged." },
  { client: "Tideway Council", brief: "Score Tideway's capstone finding.", stages: [{ kind: "severity", title: "Score", goal: "Score the finding.", rows: [{ finding: "Remote unauthenticated takeover of the admin console and all records", band: "Critical", note: "Remote + no login + total = Critical." }], hint: "The top band." }], success: "Scored honestly. Finding logged." },
  { client: "Flux Fitness", brief: "Deliver Flux's report the right way. Trickier.", stages: [{ kind: "decision", title: "Deliver", goal: "Why isn't publishing it (to build your name) the right way to deliver?", decision: { prompt: "Flux's report is ready. Posting it publicly would get you noticed. Why is that the wrong way to deliver it?", options: [ { text: "It exposes Flux's users before a fix exists, so deliver it privately with a debrief and a fix, not for your own publicity.", correct: true, feedback: "Right - the client's users come first; a professional close is private, with a debrief and no showing off." }, { text: "It isn't wrong - publishing a real finding is the best way to prove your skill to future employers.", feedback: "Publishing before a fix exposes real users. Prove your skill through a private portfolio entry, not a public dump." }, { text: "It's wrong only because Flux might sue you, so publishing is fine the moment they've patched it.", feedback: "The core reason is protecting users, not legal risk - and public detail is coordinated with the client, not unilateral." }, { text: "It's wrong, so instead just leave the report in Flux's support inbox without a debrief.", feedback: "A dropped file often goes unread. Deliver it privately and walk them through it." } ] } }], success: "Delivered and debriefed professionally. Finding logged." },
  { client: "Oakline Store", brief: "The full close. Score, then deliver. Chain it yourself.", stages: [
    { kind: "severity", title: "Score", goal: "Step 1: score it.", rows: [{ finding: "Chained exposed backup to full admin and data export, remote, no auth", band: "Critical", note: "Critical." }], hint: "Top band." },
    { kind: "decision", title: "Deliver", goal: "Step 2: why must you not keep the admin access, even just in case?", decision: { prompt: "You still hold the admin access you chained to. Keeping it 'in case it's useful later' feels harmless. Why must you not?", options: [ { text: "The engagement is over, so any access you keep is now unauthorised - report it, hand it back, rotate the credentials and retain nothing.", correct: true, feedback: "Right - the moment the job ends, held access becomes a crime again. Keep nothing; the report is the only thing you take away." }, { text: "It's fine to keep it, as long as you promise yourself you'll only use it to help the client later.", feedback: "Once the engagement ends there's no authorisation, so any further access is unlawful regardless of intent." }, { text: "You must not, mainly because the client might notice the extra login and stop recommending you.", feedback: "The real reason is that retained access is unauthorised access - a legal line, not a reputation worry." }, { text: "You must not, so instead just publish the full write-up online so nothing stays hidden.", feedback: "Publishing exposes Oakline's customers before a fix. Deliver privately; don't retain access and don't go public." } ] } },
  ], success: "Scored and delivered - a complete, professional close. Finding logged." },
];

function DrillRunner({ stages, success, onSolved }: { stages: Stage[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  function stepSolved() { if (si + 1 < stages.length) setTimeout(() => setSi((n) => n + 1), 650); else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {stages.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {stages.length}</div>}
      {!done && <StageView key={si} stage={stages[si]} onSolved={stepSolved} />}
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
  { kind: "order", title: "Chain", goal: "Sableline, the final write-up. Reconstruct the full chain you ran.", intro: "order the Sableline compromise", items: [ { label: "Recon: robots.txt named the dump", pos: 0 }, { label: "Loot: dump leaked the admin credential", pos: 1 }, { label: "Break in: reused it on the console", pos: 2 }, { label: "Impact: full customer export", pos: 3 } ], hint: "Recon -> loot -> break in -> impact." },
  { kind: "severity", title: "Score", goal: "Score the chained finding.", rows: [{ finding: "Remote, unauthenticated chain to full admin and complete data export", band: "Critical", note: "Critical." }], hint: "Top band." },
  { kind: "decision", title: "Deliver", goal: "Finish the season: close the Sableline engagement professionally.", decision: { prompt: "How do you close out Sableline, and the season?", options: [
    { text: "Deliver the report privately, debrief it, and file it to your portfolio.", correct: true, feedback: "Right. A clean, professional close: coordinated delivery, a concrete fix, an attack-path-review recommendation, the portfolio entry that proves the work, and no further access." },
    { text: "Dump everything publicly online as a grand finale.", feedback: "That harms Sableline's customers - the finale is a professional delivery, not a public dump." },
    { text: "Hold onto the admin access in case it's useful later.", feedback: "Never retain access after an engagement - report, rotate, and close out." },
    { text: "Email the client the flag and call the season done.", feedback: "A flag isn't a close-out. Deliver the report, debrief, recommend an attack-path review, and keep no access." },
  ] } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · season finale · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>SEASON COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}f1rst_s3ason_cl0sed{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Sixteen engagements, attack and defence, every finding scored and reported. That portfolio is yours - real, ethical, hands-on proof of what you can do.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE16: ModuleDef = {
  code: "M-16",
  moduleNo: 16,
  title: "Full Engagement, Part 2",
  client: "Vantage Mutual",
  brief:
    "The finale. You broke in during Part 1; now finish the job the way a professional does, and close the season. The full job: reconstruct the chain you ran, score it honestly, build the report Vantage can act on, and deliver and debrief it. Then four field jobs, and a final challenge you run start to finish. This is the last engagement - the piece that turns a hack into a result, and a season of work into a portfolio.",
  industry: {
    tag: "Breaking in is the easy part. The report, scored and delivered right, is the job.",
    readLine: "a 2 minute read before you write it up",
    enginesTitle: "What delivers an engagement",
    whyPunch: "A hack is only worth its report.",
    motif: { pre: "hack done -> ", hit: "a clear, scored report", post: " -> a fix", note: "that's what the client actually pays for" },
    primer: {
      term: "Closing an engagement",
      what: "Finding the holes is only half a professional's job. The other half is turning the whole attack into something a client can act on: reconstructing the chain honestly, scoring how serious it really is (CVSS), writing a clear report, and delivering it privately with a debrief and a fix, never keeping access or going public. That is what separates a professional from a criminal who found the same bug.",
      example: "chain -> CVSS Critical -> report (what, where, reproduce, impact, fix) -> deliver + debrief",
      returns: "A brilliant hack nobody can act on is worth nothing; a clear report that gets a critical flaw fixed is worth everything, sometimes literally millions. Delivering the engagement well is the skill that makes this a career, and it is how you close the whole course.",
    },
    learn: [
      "Reconstruct the attack chain into an honest narrative.",
      "Score the chained finding's severity, fairly.",
      "Structure a report a busy team can act on.",
      "Deliver and debrief it the professional way.",
    ],
    engines: [
      { name: "The report", color: "#4ade80", blurb: "The written findings: the actual product a client pays for. The hack is worthless until it's a clear, honest report.", here: true, icon: "doc" },
      { name: "CVSS score", color: "#5fe6ff", blurb: "The 0 to 10 severity standard, so the client knows exactly what to fix first.", icon: "doc" },
      { name: "The debrief", color: "#8b7bff", blurb: "The live readout where you walk the client through the findings and agree next steps.", icon: "mail" },
      { name: "The retest", color: "#ffb347", blurb: "After they fix it, you test again to confirm the hole is actually closed.", icon: "shield" },
      { name: "Certifications", color: "#e535ab", blurb: "OSCP, CompTIA PenTest+ and CEH turn proven skill into a hireable credential.", icon: "key" },
    ],
    headline: {
      masthead: "THE WHITE HAT TIMES",
      dateline: "2019 · HACKERONE RECORD + PRESS",
      title: "A self-taught teenager became hacking's first bounty millionaire",
      body: "Santiago Lopez started hunting bugs at 16, self-taught, from Argentina; his first report earned $50. By 19 he had filed more than 1,600 clear, honest vulnerability reports to companies like Twitter and Verizon, and became the first person to earn over $1 million in bug bounties, all legal, all reported, never exploited. Not one lucky hit; a million dollars built from careful write-ups.",
      stat: "$1M+",
      statLabel: "EARNED BY 19, FROM HONEST REPORTS",
      why: "He didn't break the law; he found flaws and reported them well. That is the whole profession this course has trained you for, and the report is what turns the skill into a living.",
    },
    realWorld:
      "A finding is only worth what the report makes of it. Closing an engagement is reconstructing the attack into an honest story, scoring it fairly, writing it so a busy team can fix it fast, and delivering it privately with a debrief, then confirming the fix worked. It is the least glamorous and most valuable part of the job: the deliverable the client actually pays for, and the thing that marks you as a professional rather than someone who just got lucky.",
    now: {
      stat: "$81M",
      statLabel: "paid to ethical hackers via HackerOne in a year (+13%)",
      body: "This is a real, growing profession: through one platform, HackerOne, organisations paid ethical hackers around $81 million in a single year, up 13%, and the global cyber workforce is short millions of people. The skill this course taught is in demand, and the report is how you prove you have it.",
    },
    recent: {
      year: "2024",
      title: "Millions of unfilled security jobs",
      body: "The world is short of people who can do this: a 2024 industry study put the global cybersecurity workforce gap at around 4.8 million unfilled roles. The demand for people who can find flaws and, crucially, report them clearly keeps growing, which is exactly the job this capstone trains.",
    },
    ahead:
      "AI is already inside the job: most researchers now use AI tools, and AI drafts reports and finds raw bugs at speed. But the value shifts up, not away: judgment, scoping, chaining separate findings into one real attack, communicating risk, and ethics are the human parts AI can't replace, and they are exactly what this final module is about. The career is changing shape, not disappearing.",
    role:
      "You've now done the whole job. The roles this opens: penetration tester, red teamer, security consultant and bug-bounty hunter. You start the way the pros did, with capture-the-flag games, then reporting real bugs through official programs (with a parent and inside the rules), then the certifications that make it a career.",
    roles: ["Penetration tester", "Red teamer", "Security consultant", "Bug-bounty hunter"],
  },
  lesson: {
    blocks: [
      { h: "The report is the deliverable", body: "A client never pays for the thrill of a break-in; they pay for a report that makes them safer. Everything you found in Part 1 is worthless to Vantage until it's written up: what the issue is, how serious, what it would cost them, and precisely how to fix it. The report is the product - the hacking was just how you sourced it." },
      { h: "Tell the true story of the chain", body: "A good report doesn't just list a bug; it shows the path. Laying the chain out in order - recon, loot, break in, impact - lets the client see exactly how small issues combined into a crisis, which is what convinces them to fix all of it rather than just the last step. The sequence is the argument." },
      { h: "Honest severity, clear fix", body: "Score it as it is - this chain gives full admin access to customer data remotely, so it is Critical, and softening it to seem reasonable would be a disservice. Then give a fix a developer can act on today: not 'be more secure', but 'remove the backup from web-reachable paths, add access control, rotate the credentials'. Specific, actionable, done." },
      { h: "Deliver, debrief, and least harm", body: "A professional engagement ends with coordinated delivery and a debrief: hand over the findings privately, walk the client through them, and agree what happens next. Throughout, you keep to least harm - your reproduction steps are proof enough, so you never exploit further or touch real customer data to 'show how bad it is'. You leave the client safer, not more exposed." },
      { h: "Close the season", body: "Then you file it to your portfolio - the growing record of real work you can show a teacher, a university, or an employer. Sixteen engagements in, that portfolio is the proof of what you can actually do: footprint, break in, defend, investigate, respond, and report, across attack and defence, every finding honestly scored and clearly written." },
    ],
    Interactive: ScoreLab,
    summary: [
      "The report, not the break-in, is the deliverable - it's what makes the client safer.",
      "Tell the chain in order so the client fixes all of it, not just the last step.",
      "Score honestly (this chain is Critical) and give a concrete, actionable fix.",
      "Deliver privately, debrief, and keep to least harm - never exploit further.",
      "File it to your portfolio: real, ethical, hands-on proof across attack and defence.",
    ],
    check: {
      q: "Why is the report, not the break-in, the real deliverable?",
      options: [
        { text: "Because the client can only become safer by acting on a clear, scored, fixable report.", correct: true, feedback: "Right - the value is a fixed vulnerability, and that comes from the report." },
        { text: "Because breaking in doesn't really count unless it's recorded on video.", feedback: "It's not about proof-of-drama - it's that the client can only act on a clear write-up." },
        { text: "Because writing up reports is simply easier than doing the hacking.", feedback: "A good report is its own hard skill - and it's the one that delivers the value." },
        { text: "Because, in the end, the flag is the only thing that matters.", feedback: "A flag isn't a deliverable; the finding, severity, impact and fix are." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Vantage Mutual · engagement report + debrief",
    inScope: "reconstructing, scoring, writing and delivering the Part-1 finding; the consolidation clients in each drill",
    offLimits: "further exploitation, acting on real customer data, out-of-scope systems",
    timebox: "the engagement window",
  },
  handler: "Last one, operator. Reconstruct the chain so the story's true, score it straight - this is a Critical, don't flinch - build a report they can ship, and deliver it properly with a debrief. Least harm throughout; the engagement's over, so no more access. Then it's done, and it's yours. Good work this season.",
  hint: "Work the stages in order. The chain is recon -> loot -> break in -> impact. Severity is Critical (remote, no login, full data). A report runs title, location, severity, impact, reproduce, remediation. Deliver privately, debrief, and file it - no further exploitation.",
  plan: [
    { label: "Reconstruct the chain", goal: "Lay out the Part 1 attack chain in order, so the report tells the true story." },
    { label: "Score it honestly", goal: "A client acts on the severity. Score the chained finding as it really is." },
    { label: "Build the report", goal: "Structure the write-up so Vantage can act on it fast." },
    { label: "Deliver and debrief", goal: "The report is written. Close the engagement the professional way." },
  ],
  Act: FinaleAct,
  flag: "flag{f1rst_s3ason_cl0sed}",
  defend: {
    blocks: [
      { h: "What you can now do", body: "Look back at the arc: you learned the rules of engagement, to footprint a target, read and bend web traffic, break authentication, run real injections, land scripts, walk through broken access control, work with crypto and hashes, map a network, read a forensic trail, respond to a live breach, spot social engineering, disclose responsibly, and chain it all into a full engagement you then reported. You can both attack and defend - and you know why each fix works." },
      { h: "Think in attack paths, for good", body: "The most valuable habit you're leaving with is the chain mindset: never judging a finding in isolation, always asking what it could connect to. It's what made your Part-1 compromise possible, and it's exactly how a mature defender reviews their own systems - finding the dangerous combinations before an attacker does. Carry it into everything." },
      { h: "Where this goes next", body: "This portfolio is a genuine starting point. It maps to GCSE and A-level cyber content, prepares you for programmes like CyberFirst, and shows a real employer concrete, ethical, hands-on skill. The field moves fast, but you've learned the thing that doesn't go out of date: how to think like both the attacker and the defender, and how to tell the difference." },
    ],
    Interactive: PortfolioLab,
    check: {
      q: "What makes your portfolio valuable to a university or employer?",
      options: [
        { text: "It's concrete, ethical, hands-on evidence of real skills across attack and defence.", correct: true, feedback: "Right - real findings, honestly reported, are exactly what stands out." },
        { text: "It mainly proves to people that you watched some videos.", feedback: "It's more than that - it's a record of work you actually did." },
        { text: "It automatically guarantees you a job in the industry.", feedback: "No guarantees - but it's genuine, demonstrable proof of ability, which opens doors." },
        { text: "It's only really valuable if you managed to find a zero-day.", feedback: "It's the breadth and the honest, clear reporting that count, not a single rare bug." },
      ],
    },
  },
  finding: {
    title: "Season 1 capstone report delivered (Vantage Mutual)",
    where: "Vantage Mutual · full engagement · chained compromise, reported",
    severity: "Critical",
    cvss: "9.1",
    impact: "The capstone engagement is documented end to end: a chained recon-to-admin compromise, reconstructed in order, scored Critical, written into an actionable report, and delivered with a debrief and an attack-path recommendation - the closing piece of a sixteen-finding portfolio spanning attack and defence.",
    fix: "Remove web-reachable backups and enforce access control + encryption; rotate exposed credentials; and adopt attack-path review so low-severity issues aren't allowed to chain into critical ones.",
  },
  cheatsheet: {
    title: "Closing an engagement quick reference",
    blurb: "How to turn a hack into a result and a career: reconstruct, score, report, deliver, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "The hacking is done. Everything that makes it count happens here. Three things you hand over, and why each matters.",
      cols: ["what you hand over", "what it does", "why it matters"],
      rows: [
        ["the chain, in order", "the true story of the attack", "the client sees exactly how it happened"],
        ["a CVSS score", "a fair 0-10 severity", "tells them what to fix first"],
        ["a private debrief + fix", "a walk-through and a recommendation", "it gets fixed, and you stay professional"],
      ],
    },
    groups: [
      {
        heading: "Turning a hack into a result",
        entries: [
          { code: "reconstruct the chain", what: "Lay out every step in order, honestly, so the report tells the true story.", example: "recon -> loot -> reuse -> export" },
          { code: "score it (CVSS)", what: "Give the finding a fair 0 to 10 severity so the client knows how urgent it is.", example: "remote + no login + full data = Critical" },
          { code: "write it to act on", what: "Title, location, severity, impact, steps to reproduce, and the fix.", example: "a stranger can reproduce and patch it" },
          { code: "the deliverable", what: "The report is the product the client pays for; the hack is worthless without it.", example: "a clear write-up, not a screenshot dump" },
        ],
      },
      {
        heading: "Delivering like a professional",
        entries: [
          { code: "deliver privately", what: "Hand the report to the client directly; never post it publicly to show off.", example: "a private readout, not a tweet" },
          { code: "debrief", what: "Walk the client through what you found, answer questions, agree next steps.", example: "a live readout meeting" },
          { code: "retest", what: "After they fix it, test again to confirm the hole is actually closed.", example: "verify the fix, don't assume" },
          { code: "never retain access", what: "The engagement is over: report, rotate credentials, and keep nothing.", example: "no 'keeping the admin login for later'" },
        ],
      },
      {
        heading: "Making it a career",
        entries: [
          { code: "start with CTFs", what: "Capture-the-flag games are the safe, legal playground to build and prove skill.", example: "picoCTF, TryHackMe, Hack The Box" },
          { code: "bug bounty (by the rules)", what: "Report real bugs through official programs, in scope, with a parent if under 18.", example: "HackerOne / Bugcrowd, inside the rules" },
          { code: "certifications", what: "Recognised quals turn skill into a hireable credential.", example: "CompTIA PenTest+, then OSCP" },
          { code: "a portfolio", what: "A record of your findings and write-ups proves what you can do.", example: "CTF solves + public bug-bounty reports" },
        ],
      },
    ],
  },
  takeaway: "An engagement is only finished when it is reported. Reconstruct the chain in order, score it honestly, and hand over a fix the client can act on.",
  outcome: [
    "Reconstruct a full attack chain in order - recon, loot, break in, impact - so the report tells the true story.",
    "Score a chained compromise honestly and write a report a client can act on - title, location, severity, impact, reproduce, remediation.",
    "Deliver and debrief an engagement professionally - privately, with a concrete fix and attack-path recommendation, keeping to least harm.",
    "Close a season into a portfolio - sixteen ethical findings across attack and defence that prove real, hands-on skill.",
  ],
  rep: 90,
  repRank: "Principal",
  repTo: "Top rank reached",
  next: "SEASON COMPLETE · View your portfolio →",
};

export default function Module16() {
  return <Engagement mod={MODULE16} />;
}

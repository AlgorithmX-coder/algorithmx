"use client";

/* Module 14 - Disclosure & Reporting (DEPTH STANDARD, built to the M5 framework).
 *
 * The reporting craft that carries every finding. Modelled in-browser: score
 * severities to the right band, build a report in the correct structure, choose
 * the responsible disclosure path, and make the hard coordinated-disclosure call.
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check, a
 * FOUR-stage capture with a hint ladder, FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";
import ExplainQuiz from "./ExplainQuiz";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "finding", definition: "A single reported weakness: what it is, where it is, how serious, its impact, and how to fix it.", example: "One line in your report reads 'the login page lets you reset anyone's password without a code' - that single entry is one finding." },
  { term: "severity", definition: "How serious a vulnerability is - what to fix first. Usually banded Low, Medium, High, Critical.", example: "A broken 'forgot password' that hands over any account is Critical and gets fixed tonight; a missing cookie flag is Low and can wait for next sprint." },
  { term: "CVSS", definition: "The Common Vulnerability Scoring System - the industry standard that scores a flaw on exploitability and impact (0-10).", example: "The Log4Shell bug scored 10.0, the maximum, which is why companies worldwide dropped everything to patch it over one weekend." },
  { term: "impact", definition: "What an attacker actually gains - read a record, take over an account, dump the whole database. It drives severity.", example: "A spelling mistake on a page is annoying; being able to download every customer's name, address and card number is the impact that makes the news." },
  { term: "remediation", definition: "The fix: the concrete change that closes the vulnerability (parameterise the query, add MFA, patch the version).", example: "Instead of 'make the site safer' you write 'update the library from version 2.14 to 2.17', so a developer knows exactly what to change." },
  { term: "reproduction steps", definition: "The exact steps to trigger the bug, so the team can see it for themselves and confirm the fix.", example: "'1. open /account, 2. change the id in the URL from 51 to 52, 3. you now see another user's profile' - anyone can follow that and watch it happen." },
  { term: "responsible disclosure", definition: "Reporting a flaw privately to the owner and giving reasonable time to fix before any public detail. Also called coordinated disclosure.", example: "You email the company the bug and wait 90 days for a patch before you post about it, rather than tweeting the exploit the moment you find it." },
  { term: "coordinated disclosure", definition: "Working with the vendor (or a CERT) on timing, so the fix and the public detail land together.", example: "A researcher and Apple agree to announce a flaw on the same day the iOS update ships, so users can patch before criminals learn the trick." },
  { term: "bug bounty", definition: "A programme that pays researchers for reporting vulnerabilities - inviting findings rather than fearing them.", example: "Google and other firms have paid teenagers thousands of pounds through platforms like HackerOne for reporting real bugs responsibly." },
  { term: "vulnerability disclosure policy", definition: "A published policy and security contact that tells researchers how to report safely. Often shortened to VDP.", example: "Many sites keep a /security.txt file or a security@ email that says 'found something? tell us here', so you are not left guessing who to contact." },
  { term: "CERT", definition: "A Computer Emergency Response Team - a neutral body that can coordinate disclosure when a vendor won't respond.", example: "If a company ignores your emails about a serious flaw, the UK's NCSC can step in as a neutral go-between to make sure it gets fixed." },
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

/* ── severity: score each finding to the right band ── */
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
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// score each finding: how easy to exploit, and how bad the impact?</div>
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
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CHECK SCORES →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Weigh exploitability and impact together.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Scored correctly - that's how a team knows what to fix first.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── order: build the report structure ── */
type OrderItem = { label: string; pos: number };
function OrderSurface({ items, hint, onSolved }: { items: OrderItem[]; hint: string; onSolved: () => void }) {
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
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// tap the sections in the order a good finding report presents them</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>SECTIONS</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {avail.length ? avail.map((it) => <button key={it.label} onClick={() => add(it.label)} className="co-opt" style={{ padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.carbon, color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{it.label}</button>) : <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>(all placed)</span>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>YOUR REPORT</div>
      <div style={{ display: "grid", gap: 5, minHeight: 40 }}>
        {seq.map((l, i) => { const wrong = checked === false && items.find((x) => x.label === l)!.pos !== i; return (
          <button key={i} onClick={() => removeAt(i)} className="co-opt" style={{ textAlign: "left", padding: "8px 11px", borderRadius: 8, border: `1px solid ${checked === true ? C.green : wrong ? C.red : C.lineSoft}`, background: C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}><span style={{ color: C.indigo2, marginRight: 8 }}>{i + 1}.</span>{l}</button>
        ); })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={seq.length !== items.length || solved}>CHECK REPORT →</Btn></div>
      {checked === false && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not quite - the red ones are out of order.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ A clear, actionable report structure.</div>}
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
type Explain = { q: string; options: { text: string; correct?: boolean; feedback: string }[] };
type Stage =
  | { kind: "severity"; title: string; goal: string; rows: SevRow[]; hint: string; explain?: Explain }
  | { kind: "order"; title: string; goal: string; items: OrderItem[]; hint: string; explain?: Explain }
  | { kind: "decision"; title: string; goal: string; decision: Decision; explain?: Explain };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "severity" && <SeveritySurface rows={stage.rows} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "order" && <OrderSurface items={stage.items} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Redoubt tradecraft) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  { kind: "severity", title: "Score", goal: "Stage 1 - Score the severities. A report is triaged by severity. Score each finding to the right band - weigh how easy it is to exploit against how bad the impact is.",
    rows: [
      { finding: "Unauthenticated SQL injection giving full read/write of the whole customer database, remotely", band: "Critical", note: "No login, remote, total impact = the top band, Critical." },
      { finding: "Server banner reveals the exact software version (information disclosure)", band: "Low", note: "Useful to an attacker but no direct impact on its own = Low." },
      { finding: "Stored XSS that steals a logged-in user's session", band: "High", note: "Serious account takeover, but needs a victim to view the page = High, just below Critical." },
      { finding: "Missing rate-limiting on a non-sensitive search box", band: "Medium", note: "Enables abuse/DoS but no direct data impact = Medium." },
    ],
    hint: "Remote + no login + whole database = Critical. A version banner alone = Low. Session-stealing XSS = High. A missing control with limited impact = Medium.",
    explain: {
      q: "You scored the SQL injection Critical. Why does a remote, no-login flaw that exposes the whole database land at the top band?",
      options: [
        { text: "It can be hit remotely with no login and exposes the whole database, so both ease and impact are maximal.", correct: true, feedback: "Right - severity weighs how easy a flaw is to exploit (remote, unauthenticated) against its impact (the whole database). Both maxed = Critical." },
        { text: "Critical is just the default band every finding starts at until someone downgrades it later.", feedback: "No - findings are scored on their actual exploitability and impact, not a default. A minor bug scores Low." },
        { text: "It's Critical only because customer data is involved, and any data-related bug is automatically top band.", feedback: "Not automatic - a tiny, hard-to-reach data leak can be Low. It's the combination of easy access and huge impact here." },
        { text: "The score is set by how long the bug has existed, and this one had been open the longest.", feedback: "Age doesn't set severity; exploitability and impact do. A brand-new remote, unauthenticated, full-database flaw is still Critical." },
      ],
    } },
  { kind: "order", title: "Report", goal: "Stage 2 - Build the report. Put a finding report's sections in the order that lets a busy team act on it fast.",
    items: [
      { label: "Title (what the issue is)", pos: 0 },
      { label: "Location (where it is)", pos: 1 },
      { label: "Severity (how serious)", pos: 2 },
      { label: "Impact (what an attacker gains)", pos: 3 },
      { label: "Steps to reproduce", pos: 4 },
      { label: "Remediation (how to fix it)", pos: 5 },
    ],
    hint: "Lead with what and where, then how serious and why (severity + impact), then how to see it (reproduce), and finish with the fix (remediation)." },
  { kind: "decision", title: "Disclose", goal: "Stage 3 - Disclose it right. You found a real, critical flaw in a live company's system. How do you handle it?",
    decision: { prompt: "You've found a critical, unauthenticated flaw in a company's live system. What do you do?", options: [
      { text: "Report it privately to the company first and give them time to fix.", correct: true, feedback: "Right - responsible, coordinated disclosure. Give them reasonable time before any public detail, get it fixed, and hand no exploit to attackers." },
      { text: "Publish the working exploit immediately so users can protect themselves.", feedback: "That hands attackers a weapon before any fix exists - the opposite of protecting users." },
      { text: "Quietly sell the vulnerability to the highest bidder you can find.", feedback: "That's exploitation, not disclosure, and it's illegal. Never." },
      { text: "Use it to pull more data as proof of how serious it is.", feedback: "Accessing more data is unauthorised and harmful - a clear description and the reproduction steps are proof enough." },
    ] } },
  { kind: "decision", title: "The hard call", goal: "Stage 4 - When it's not simple. You reported it privately 90 days ago. The vendor has gone silent and users are still exposed. Now what?",
    decision: { prompt: "90 days after a private report, the vendor is unresponsive and users remain at risk. The right move?", options: [
      { text: "Escalate through a CERT or coordinated-disclosure body to pressure a fix.", correct: true, feedback: "Right. When a vendor won't engage, a neutral coordinator (a CERT) is the responsible escalation - agree a public timeline, protect users, and still dump no working exploit." },
      { text: "Immediately dump the full working exploit in public out of frustration.", feedback: "Understandable, but it arms attackers against still-unpatched users. Escalate through a coordinator, don't weaponise it." },
      { text: "Give up and say nothing more - it's the vendor's problem now.", feedback: "Users are still exposed; walking away isn't responsible either. Escalate to get it fixed." },
      { text: "Start exploiting it yourself, since they never bothered to fix it.", feedback: "Never - lack of a vendor response doesn't make unauthorised access legal or ethical." },
    ] } },
];

function DisclosureAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const [explainOk, setExplainOk] = useState(false);
  const stage = ACT_STAGES[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { setExplainOk(false); if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
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
        <div className="co-anim co-pop" style={{ display: "grid", gap: 12, padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
            {(!stage.explain || explainOk) && <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>}
          </div>
          {stage.explain && <ExplainQuiz key={si} q={stage.explain.q} options={stage.explain.options} onCorrect={() => setExplainOk(true)} />}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: score one finding ───────────────────────── */

function ScoreLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === "Critical";
  useEffect(() => { if (correct) onDone(); }, [correct, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · score this one</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>A remote attacker with no login can take over any account and read the whole database. What severity?</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Low", "Medium", "High", "Critical"].map((b) => <button key={b} onClick={() => setPicked(b)} className="co-opt" style={{ padding: "6px 13px", borderRadius: 8, border: `1px solid ${picked === b ? SEV_COLOR[b] : C.line}`, background: "transparent", color: picked === b ? SEV_COLOR[b] : C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>{b}</button>)}
      </div>
      {picked && <div style={{ marginTop: 11, fontSize: 13, color: correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{correct ? "✓ Critical - no login needed, remote, and total impact. That's the top band every time." : "Think: no login, remote, total impact. That combination is the very top band."}</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: handle reports well ───────────────────────── */

function HandleReportsLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Threaten legal action against anyone who reports a bug", ok: false, why: "That drives findings public or underground and leaves you less safe, not more." },
    { code: "Ignore reports unless they include a working exploit", ok: false, why: "That discourages good-faith reporting and leaves real issues unfixed." },
    { code: "Publish a security contact and VDP, and fix on a sensible timeline", ok: true, why: "Make it easy and safe to report, acknowledge fast, treat researchers as allies, consider a bug bounty, and act on what comes in. That's how bugs get fixed." },
    { code: "Quietly fix the bug and never acknowledge the person who reported it", ok: false, why: "Silent fixes with no acknowledgement discourage researchers from coming back, and an ignored reporter may go public. Acknowledge reports fast." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE STANDARD · how should an organisation handle incoming reports?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Score Brightpost's findings to the right bands. No walkthrough.", stages: [{ kind: "severity", title: "Score", goal: "Score each finding.", rows: [ { finding: "Remote unauthenticated RCE on the web server", band: "Critical", note: "Remote code execution with no login = Critical." }, { finding: "Verbose error messages leak stack traces", band: "Low", note: "Information leak, no direct impact = Low." } ], hint: "RCE with no login is Critical; a stack-trace leak alone is Low." }], success: "Scored the findings correctly. Finding logged." },
  { client: "Tideway Council", brief: "Order a finding report for Tideway.", stages: [{ kind: "order", title: "Report", goal: "Order the report sections.", items: [ { label: "Title", pos: 0 }, { label: "Severity", pos: 1 }, { label: "Impact", pos: 2 }, { label: "Remediation", pos: 3 } ], hint: "Title -> severity -> impact -> remediation." }], success: "Structured a clear report. Finding logged." },
  { client: "Flux Fitness", brief: "A disclosure judgment call. Trickier.", stages: [{ kind: "decision", title: "Disclose", goal: "Why isn't telling only Flux enough here?", decision: { prompt: "The flaw also affects Flux's payment provider. Why isn't it enough to report it only to Flux and let them pass it on?", options: [ { text: "The provider might never be told, or hear too late, so coordinate privately with every affected party yourself.", correct: true, feedback: "Right - when a flaw spans more than one party, coordinate disclosure with all of them, privately, before any public detail." }, { text: "It is enough - Flux is responsible for their provider, so telling Flux discharges your duty entirely.", feedback: "You can't rely on the message being passed on in time. Coordinate with each affected party directly." }, { text: "It isn't, so you should tweet it publicly so that both parties are embarrassed into fixing it quickly.", feedback: "Public shaming arms attackers and skips the fix window. Coordinate privately with both instead." }, { text: "It isn't, so wait for Flux's next release and mention the flaw to the provider in passing.", feedback: "Users stay exposed in the meantime. Report it to every affected party now and agree a fix timeline." } ] } }], success: "Disclosed responsibly across both parties. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Score, then disclose. Chain it yourself.", stages: [
    { kind: "severity", title: "Score", goal: "Step 1: score the finding.", rows: [ { finding: "IDOR exposing any customer's order and address by changing an id", band: "High", note: "Mass PII exposure, but read-only and needs a valid account = High." } ], hint: "Broad PII read via IDOR is High." },
    { kind: "decision", title: "Disclose", goal: "Step 2: what makes the report actually usable?", decision: { prompt: "You email Oakline just the flag and leave them to work it out. Why isn't that a useful report?", options: [ { text: "A bare flag isn't actionable - a useful report gives the location, repro steps, the impact and a fix, sent privately.", correct: true, feedback: "Right - responsible disclosure is a clear, reproducible report, not just proof that you got in." }, { text: "It's fine - handing over the working flag proves the flaw exists, and the vendor's team can take it from there.", feedback: "Proof isn't a report. Without repro steps and a fix the team can't act on it efficiently." }, { text: "It isn't useful, so you should instead post the reproduction steps publicly straight away so that users know.", feedback: "That exposes customers before a fix. Report privately first, with the detail they need." }, { text: "It isn't useful, so attach a threat to dump the full details publicly if they take too long to respond.", feedback: "Lead with an actionable report and an agreed timeline, not a threat to publish." } ] } },
  ], success: "Scored and disclosed correctly - the whole reporting craft. Finding logged." },
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
  { kind: "severity", title: "Score", goal: "Sableline handed you three findings to triage. Score each to the right band.", rows: [
    { finding: "Unauthenticated remote admin takeover of the whole platform", band: "Critical", note: "No login, remote, total control = Critical." },
    { finding: "Stored XSS stealing admin sessions", band: "High", note: "Account takeover needing a victim view = High." },
    { finding: "Login page reveals whether an email is registered", band: "Low", note: "User enumeration, minor on its own = Low." },
  ], hint: "Remote admin takeover = Critical; session-stealing XSS = High; enumeration = Low." },
  { kind: "order", title: "Report", goal: "Write the report for the critical one.", items: [ { label: "Title", pos: 0 }, { label: "Location", pos: 1 }, { label: "Severity", pos: 2 }, { label: "Impact", pos: 3 }, { label: "Steps to reproduce", pos: 4 }, { label: "Remediation", pos: 5 } ], hint: "Title -> location -> severity -> impact -> reproduce -> remediation." },
  { kind: "decision", title: "Disclose", goal: "Finish it: disclose the critical finding the right way.", decision: { prompt: "How do you disclose Sableline's critical, unauthenticated takeover?", options: [
    { text: "Report privately with reproduction steps, and agree a fix window.", correct: true, feedback: "Right - responsible, coordinated disclosure: a clear report, a fix window, public detail coordinated after, and no one harmed." },
    { text: "Publish the working exploit to try to force a fast fix.", feedback: "That arms attackers before the fix - report privately and coordinate." },
    { text: "Exploit it once more to confirm, pulling live data.", feedback: "Unauthorised and harmful - your report and steps are proof enough." },
    { text: "Report it anonymously so you can't be blamed if it goes wrong.", feedback: "Anonymous drops are hard for a vendor to verify or follow up. Report openly and coordinate - responsible disclosure protects you too." },
  ] } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full write-up · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}sc0red_wr1tten_discl0sed{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Scored it, wrote it, disclosed it - the craft that turns every finding into a fix, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE14: ModuleDef = {
  code: "M-14",
  moduleNo: 14,
  title: "Disclosure & Reporting",
  client: "Redoubt · tradecraft",
  brief:
    "A deep engagement in the craft that carries every finding - because a finding is only as good as the report that delivers it. Before the capstone, Redoubt wants you fluent in it: scoring how serious a vulnerability really is, structuring a report a busy team can act on, and disclosing the right way - the way that gets it fixed and keeps you on the right side of the law. The full job, then four field jobs, then a final challenge you run start to finish.",
  industry: {
    tag: "Finding the bug is half the job. A clear report, scored and disclosed right, is what gets it fixed.",
    readLine: "a 2 minute read before you write it up",
    enginesTitle: "The tools of the write-up",
    whyPunch: "A bug unreported is a bug unfixed.",
    motif: { pre: "report -> ", hit: "CVSS 10.0, Critical", note: "scored, evidenced, disclosed privately: now it gets fixed" },
    primer: {
      term: "Disclosure",
      what: "Finding a vulnerability is only useful if it gets fixed, and that depends on the write-up. Disclosure and reporting is the craft of explaining a flaw clearly (what, where, how to reproduce, the impact), scoring how serious it is with CVSS (a 0 to 10 scale), and telling the right people the right way, privately first, so they can patch before attackers pounce.",
      example: "CVE-2021-44228  |  CVSS 10.0 (Critical)  |  reported privately, then patched",
      returns: "A good report turns a finding into a fix; a bad one, or going public too early, gets it ignored or exploited. Clear writing, a fair severity score, and coordinated disclosure are the whole skill, which is exactly what you will practise here.",
    },
    learn: [
      "Score a finding's severity honestly with CVSS.",
      "Structure a clear report a busy team can act on fast.",
      "Disclose a real, critical flaw the responsible way.",
      "Make the hard call when a vendor goes silent.",
    ],
    engines: [
      { name: "CVSS", color: "#4ade80", blurb: "The 0 to 10 severity score everyone uses to rank how bad a bug is (9+ = critical).", here: true, icon: "doc" },
      { name: "CVE / NVD", color: "#5fe6ff", blurb: "A unique public ID for each vulnerability, plus a national database of details and scores.", icon: "server" },
      { name: "HackerOne / Bugcrowd", color: "#8b7bff", blurb: "Platforms where organisations invite and reward responsible bug reports.", icon: "shield" },
      { name: "security.txt", color: "#ffb347", blurb: "A standard file telling researchers exactly where and how to report a flaw to a site.", icon: "doc" },
      { name: "Report / VDP template", color: "#e535ab", blurb: "The structure that makes a finding actionable: what, where, reproduce, impact, fix.", icon: "doc" },
    ],
    headline: {
      masthead: "THE PATCH LEDGER",
      dateline: "2021 · VENDOR ADVISORY + CISA RECORD",
      title: "A free logging tool held a 10/10 flaw, and quiet reporting saved the day",
      body: "In late 2021 a researcher found a critical bug in Log4j, a tiny free logging component buried inside a huge share of the world's Java software, including Minecraft servers. He reported it privately to the maintainers, who built a fix before the flaw went public. Rated the maximum CVSS 10.0, it affected an estimated hundreds of millions of devices. Because it was disclosed responsibly, the world could patch instead of being caught cold.",
      stat: "10.0",
      statLabel: "CVSS: THE MAXIMUM SEVERITY",
      why: "A flaw that could have been a catastrophe became a frantic but manageable patch, because one person reported it the right way. How you disclose decides whether a finding protects people or burns them.",
    },
    realWorld:
      "A vulnerability only matters once it's fixed, and that hinges on the report. Reporting and disclosure is scoring a finding fairly (CVSS), writing it so a stranger can reproduce and prioritise it, and telling the right people privately first so they can patch before attackers exploit it. Do it well and you protect millions; do it badly, or publicly too soon, and you hand attackers a weapon.",
    now: {
      stat: "40,000+",
      statLabel: "new CVEs published in 2024, and rising",
      body: "The volume is enormous: more than 40,000 new vulnerabilities (CVEs) were published in 2024, up around 38% on the year, over a hundred a day. Each one needs scoring and triage, which is why CVSS (the 0 to 10 severity scale) and clear reporting are core skills, not paperwork.",
    },
    recent: {
      year: "2025",
      title: "The system that names every bug nearly went dark",
      body: "In April 2025 the US funding that keeps the CVE program running, the shared ID system the whole industry uses to name and track vulnerabilities, was hours from lapsing before it was extended at the last minute, and a non-profit was set up as a backup. A reminder that the plumbing of disclosure is critical infrastructure in its own right.",
    },
    ahead:
      "AI now finds and writes up bugs faster than humans can triage them, and the flood is straining disclosure programs: in early 2026 the curl project shut its bug bounty after an avalanche of AI-generated 'slop' reports, almost none of them real. Platforms are adding AI triage to cope. The flip side is that AI also finds genuine, exploitable bugs at machine speed, so clear, well-evidenced reporting and fast coordinated disclosure matter more than ever.",
    role:
      "This is the skill that turns every other module into impact: penetration testers, vulnerability analysts and bug-bounty hunters all live or die by the report. A finding nobody can act on is worth nothing.",
    roles: ["Penetration tester", "Vulnerability analyst", "Bug-bounty hunter", "Security consultant"],
  },
  lesson: {
    blocks: [
      { h: "A finding needs a report", body: "Discovering a vulnerability is half the job; communicating it is the other half. A good finding report says plainly what the issue is, where it lives, how serious it is, what the impact would be, how to reproduce it, and how to fix it - in language the people who must act on it can use. Every capture you've filed in your portfolio follows exactly this shape." },
      { h: "Scoring severity", body: "Severity tells a busy team what to fix first. The industry standard, CVSS, scores roughly on how easy something is to exploit and how bad the impact is. A bug that needs no login, works remotely, and hands over the whole database sits at the top - Critical. One that needs special access and leaks something minor sits low. Consistent scoring is what lets an organisation triage honestly." },
      { h: "Writing it so it gets fixed", body: "A report is read by busy people, so it leads with what matters: the title and location, then the severity and impact so they know how urgent it is and why, then clear steps to reproduce so they can see it themselves, and finally a concrete remediation. Vague or alarmist reports get ignored; a clear, actionable one gets the bug fixed." },
      { h: "Responsible disclosure", body: "When you find a real flaw in someone's system, you report it privately to them first and give reasonable time to fix it before any public detail - that's coordinated, responsible disclosure. You never dump a working exploit on the world, never sell it, and never help yourself to more data to prove it. The goal is to get it fixed and protect people, full stop." },
      { h: "When it isn't simple", body: "Sometimes a vendor goes silent while users stay exposed. The responsible path still isn't to weaponise the flaw: you escalate through a neutral coordinator - a CERT - who can press for a fix and agree a public timeline. And from the other side, good organisations invite this: a published disclosure policy, a security contact, fast acknowledgement, and sometimes a bug bounty turn researchers into allies instead of threats." },
    ],
    Interactive: ScoreLab,
    summary: [
      "A finding report states what, where, how serious, the impact, how to reproduce, and how to fix.",
      "Severity (CVSS) weighs exploitability against impact; remote + no login + total impact = Critical.",
      "Write for a busy reader: lead with severity and impact, give reproduction steps, end with the fix.",
      "Responsible disclosure: report privately first, give time to fix, never dump an exploit or take more data.",
      "If a vendor won't engage, escalate through a CERT - never weaponise it; good orgs run a VDP/bug bounty.",
    ],
    check: {
      q: "What is responsible (coordinated) disclosure?",
      options: [
        { text: "Reporting privately to the vendor first and giving reasonable time to fix before public detail.", correct: true, feedback: "Right - private report, time to fix, then coordinate. Fixed, and no one harmed." },
        { text: "Publishing a working exploit immediately so that users can protect themselves.", feedback: "That hands attackers a weapon before any fix exists - the opposite of protecting users." },
        { text: "Keeping the flaw secret and quietly using it whenever you like.", feedback: "That's exploitation, not disclosure - and it's illegal." },
        { text: "Only reporting it if the company first offers to pay you for it.", feedback: "Responsible disclosure doesn't depend on payment; you report to get it fixed regardless of a bounty." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "reported findings - scoring, reporting and disclosure",
    inScope: "assessing severity, structuring reports, choosing the disclosure path; the consolidation clients in each drill",
    offLimits: "re-exploiting any target, pulling more data, public exploit dumps",
    timebox: "this session",
  },
  handler: "Four calls in sequence, then four field jobs and a full write-up. Score each finding honestly on the standard scale, structure the report so a busy team can act, choose the disclosure path that protects people and stays legal, and handle the hard case when a vendor goes quiet. Get these right and your reports are field-ready.",
  hint: "Work the stages in order. Remote + no login + whole database = Critical; a banner leak = Low. A report runs title, location, severity, impact, reproduce, remediation. Always disclose privately first; if a vendor won't engage, escalate through a CERT - never dump an exploit.",
  plan: [
    { label: "Score the severity", goal: "Score each finding to the right band: weigh how easy it is to exploit against how bad the impact is." },
    { label: "Build the report", goal: "Put a finding report's sections in the order that lets a busy team act on it fast." },
    { label: "Disclose it right", goal: "You found a real, critical flaw in a live company's system. Handle the disclosure responsibly." },
    { label: "The hard call", goal: "You reported privately 90 days ago, the vendor has gone silent, and users are still exposed. Decide." },
  ],
  Act: DisclosureAct,
  flag: "flag{d1sclosed_r3sponsibly}",
  defend: {
    blocks: [
      { h: "From the other side of the report", body: "Organisations that handle disclosure well publish a security contact and a clear vulnerability-disclosure policy, acknowledge reports quickly, and fix on a sensible timeline - often running a bug-bounty or disclosure programme to invite findings rather than fear them. Treating researchers as allies gets bugs fixed; threatening them just drives the findings underground or public." },
      { h: "A report is an action, not an archive", body: "The point of a finding report is that someone does something with it. That's why severity and clear remediation matter so much: they turn your discovery into a prioritised, actionable task the engineering team can close. A beautiful write-up nobody can act on fixes nothing; a plain one with an exact fix and reproduction steps fixes the bug." },
      { h: "Why this is the whole career", body: "Everything you've done across this course - recon, exploitation, defence, forensics, incident response - ends in a report someone acts on. The ability to score a risk honestly and communicate it clearly is what turns a clever hack into a fixed vulnerability, and what makes a security professional trusted. Your portfolio is a stack of exactly these reports; this is the skill that makes them count." },
    ],
    Interactive: HandleReportsLab,
    check: {
      q: "What should an organisation do to handle incoming vulnerability reports well?",
      options: [
        { text: "Publish a security contact and policy, acknowledge reports, and fix on a sensible timeline.", correct: true, feedback: "Right - make it easy and safe to report, treat researchers as allies, and act on what comes in." },
        { text: "Threaten legal action against anyone who dares to report a bug.", feedback: "That drives findings public or underground and leaves you less safe, not more." },
        { text: "Ignore any reports unless they come with a full working exploit.", feedback: "That discourages good-faith reporting and leaves real issues unfixed." },
        { text: "Only bother fixing bugs that have already been exploited in the wild.", feedback: "Waiting for exploitation means waiting for harm - fix reported issues before they're used." },
      ],
    },
  },
  finding: {
    title: "Reporting craft: severity scored, report structured, disclosure coordinated",
    where: "Redoubt tradecraft · finding triage, write-up and disclosure",
    severity: "High",
    cvss: "N/A",
    impact: "A set of findings was triaged to correct severities, written up in a clear, actionable report structure, and routed through responsible coordinated disclosure - including the hard case of an unresponsive vendor - so each flaw gets fixed without arming attackers or breaking the law.",
    fix: "For organisations: publish a vulnerability-disclosure policy and security contact, acknowledge and fix on a sensible timeline, and consider a bug-bounty programme. For researchers: score honestly, report privately first, and escalate through a CERT rather than weaponising a flaw.",
  },
  cheatsheet: {
    title: "Disclosure & reporting quick reference",
    blurb: "How to score a finding, write it so a busy team can act, and disclose it the right way, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "A report is only useful if someone can act on it. These three parts do the heavy lifting.",
      cols: ["part of the report", "what goes in it", "why it matters"],
      rows: [
        ["severity (CVSS)", "a 0-10 score + the vector", "tells them what to fix first"],
        ["steps to reproduce", "exact steps a stranger can follow", "proves it's real, lets them test the fix"],
        ["impact", "what an attacker could actually do", "turns 'a bug' into a business decision"],
      ],
    },
    groups: [
      {
        heading: "Scoring it",
        entries: [
          { code: "CVSS", what: "The industry 0 to 10 severity score (9+ = critical), from how easy and how damaging a bug is.", example: "CVSS 10.0 = drop everything and patch" },
          { code: "CVE", what: "A unique public ID for a specific vulnerability, so everyone names it the same way.", example: "CVE-2021-44228 (Log4Shell)" },
          { code: "the NVD", what: "The national database that adds details and scores to each CVE.", example: "look up a CVE's score and affected versions" },
          { code: "prioritise by risk", what: "Severity times how reachable it is: fix the critical, reachable ones first.", example: "a 10.0 on the public internet beats a 7 on an internal box" },
        ],
      },
      {
        heading: "Writing it",
        entries: [
          { code: "what + where", what: "The flaw, its exact location, and the affected versions.", example: "IDOR on GET /record?id=, all versions" },
          { code: "steps to reproduce", what: "Precise steps a stranger can follow to see it themselves.", example: "1. log in  2. change id to 1000  3. see another's record" },
          { code: "impact", what: "What an attacker could actually do with it, in plain terms.", example: "read any customer's records without permission" },
          { code: "the fix", what: "A clear, actionable recommendation.", example: "check ownership server-side on every record" },
        ],
      },
      {
        heading: "Disclosing it",
        entries: [
          { code: "coordinated disclosure", what: "Tell the maintainer privately, give them time to fix, then go public together.", example: "Log4Shell: reported, patched, then announced" },
          { code: "security.txt / VDP", what: "A standard way for a site to publish where and how to report a flaw.", example: "/.well-known/security.txt with a contact" },
          { code: "bug bounty", what: "Programs that invite and reward responsible reports (HackerOne, Bugcrowd).", example: "report via the program, get paid per valid bug" },
          { code: "never cover it up", what: "Hiding a breach or flaw is worse, and can be a crime (the Uber cover-up conviction).", example: "disclose honestly; don't pay to bury it" },
        ],
      },
    ],
  },
  takeaway: "A finding only matters if it gets fixed. Score it honestly, write it so a busy team can act, and disclose privately first.",
  outcome: [
    "Score a finding to the right severity band by weighing exploitability against impact - remote, unauthenticated, total impact is Critical.",
    "Structure a finding report a busy team can act on - title, location, severity, impact, reproduction steps, remediation.",
    "Disclose responsibly - report privately first and give reasonable time to fix, never dumping an exploit or taking more data.",
    "Escalate through a CERT when a vendor goes silent, pressing for a fix and a public timeline without arming attackers.",
  ],
  rep: 55,
  repRank: "Lead Operator",
  repTo: "680 / 1000 to Principal",
  next: "NEXT MODULE · Full Engagement, Part 1 →",
};

export default function Module14() {
  return <Engagement mod={MODULE14} />;
}

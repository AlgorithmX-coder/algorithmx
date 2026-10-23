"use client";

/* Module 11 - Digital Forensics (DEPTH STANDARD, built to the M5 framework).
 *
 * The role flip begins: the learner reads the trail an attacker left. All data is
 * modelled in-browser (zero egress). Hands-on throughout: find the moment of
 * compromise in an auth log, spot the attacker's implant in a process list,
 * reconstruct the attack timeline by ordering events, then scope the incident.
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check, a
 * FOUR-stage capture with a hint ladder, FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "digital forensics", definition: "Reading the trails a system records - logs, files, processes - to reconstruct what happened after an incident.", example: "After a break-in, investigators piece together CCTV, door logs and fingerprints; digital forensics does the same with a computer's logs and files." },
  { term: "log", definition: "A record a system keeps of what happened: who connected, when, from where, what they did, and whether it worked.", example: "Like the sign-in book at a reception desk, a login log shows 'user_asad signed in at 02:14 from an address abroad' - one line that can expose a break-in." },
  { term: "timeline", definition: "Events put in order so the shape of an attack becomes clear - recon, break-in, actions, impact.", example: "Laid out in order, a scan at 01:50, a successful login at 02:14, then a 2GB upload at 02:40 suddenly reads like the story of the whole break-in." },
  { term: "indicator of compromise", definition: "A specific clue that something is wrong: an unknown IP, activity at an odd hour, a spike of errors, access to sensitive data.", example: "A login at 3am from a country where the company has no staff is a classic indicator of compromise." },
  { term: "artifact", definition: "Any trace left on a system - a log entry, a file, a running process, a scheduled task - that forensics examines.", example: "A mysterious file called 'update.exe' sitting in a temp folder is an artifact that could turn out to be the attacker's tool." },
  { term: "process", definition: "A running program. An attacker's implant often hides as a process with an odd name or running from an unusual location.", example: "In the task list, 'svch0st.exe' with a zero instead of an o, running from a downloads folder, stands out as a fake imitating a real Windows process." },
  { term: "implant", definition: "Malware an attacker leaves behind to keep access - often disguised, often launched from a temp folder or a sneaky scheduled task.", example: "Like a burglar quietly unlocking a back window to climb in again later, an implant is hidden software that lets the attacker return after the first break-in." },
  { term: "exfiltration", definition: "Stealing data out of a system - the bulk export or upload that marks the real damage of a breach.", example: "A log showing 5GB uploaded at 3am to an unknown server is exfiltration - the moment the customer database actually walked out the door." },
  { term: "brute force", definition: "Trying password after password until one works - in a log it looks like a burst of failed logins then a sudden success.", example: "600 failed logins in two minutes followed by one success is the classic footprint of password guessing in a log." },
  { term: "append-only", definition: "A log store that can be added to but not edited or deleted - so an attacker can't quietly erase their tracks.", example: "Like a pen-and-ink ledger where entries cannot be rubbed out, an append-only log stops an attacker deleting the lines that caught them." },
  { term: "chain of custody", definition: "Keeping evidence intact and accounted for, so your findings hold up - don't alter what you're investigating.", example: "Just as police bag and label evidence so it holds up in court, you work on a copy of the hard drive and leave the original untouched." },
  { term: "attribution", definition: "Working out who (or which account/host) was responsible from the evidence - carefully, because trails can mislead.", example: "The logs point to Priya's account, but attribution means checking whether it was really her or an attacker who stole her password." },
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

/* ── pick: scan a list of rows and click the suspicious one ── */
type Row = { cells: string[]; bad: boolean; near?: boolean; note: string };
function PickSurface({ header, rows, hint, onSolved }: { header: string; rows: Row[]; hint: string; onSolved: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; note: string } | null>(null);
  const [solved, setSolved] = useState(false);
  // Explore-then-select: reading a line never wins; you select the one you
  // accuse, then confirm. The verdict (why it is or isn't the answer) only
  // shows AFTER you commit, so no line gives the answer away on tap.
  function confirm() {
    if (picked === null || solved) return;
    const r = rows[picked];
    setVerdict({ ok: r.bad, note: r.note });
    if (r.bad && !solved) { setSolved(true); onSolved(); }
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 4 }}>⌦ {header}</div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 10 }}>// read every line, select the suspicious one, then confirm your accusation</div>
      <div style={{ display: "grid", gap: 3 }}>
        {rows.map((r, i) => (
          <button key={i} onClick={() => { if (!solved) { setPicked(i); setVerdict(null); } }} disabled={solved} className="co-opt" style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "7px 10px", borderRadius: 7, border: `1px solid ${solved && r.bad ? C.green : picked === i ? C.indigo : "transparent"}`, background: picked === i ? "rgba(139,123,255,0.08)" : C.carbon, cursor: solved ? "default" : "pointer" }}>
            {r.cells.map((c, j) => <span key={j} style={{ fontFamily: MONO, fontSize: 11.5, color: j === 0 ? C.mute : j === r.cells.length - 1 ? (c.includes("40") || c === "200" ? C.green : C.soft) : C.soft, minWidth: j === 0 ? 64 : "auto", flex: j === 1 ? 1 : "none" }}>{c}</span>)}
          </button>
        ))}
      </div>
      {!solved && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          <Btn tone="g" onClick={confirm} disabled={picked === null}>This is the one →</Btn>
          {verdict && !verdict.ok && <span style={{ fontFamily: MONO, fontSize: 12, color: C.amber }}>Not that one. Read it again, then pick another.</span>}
        </div>
      )}
      {verdict && <div style={{ fontFamily: MONO, fontSize: 12.5, color: verdict.ok ? C.green : C.soft, marginTop: 10, lineHeight: 1.6, padding: "8px 11px", borderRadius: 8, background: "rgba(0,0,0,0.25)", border: `1px solid ${C.lineSoft}` }}>{verdict.ok ? "✓ " : ""}{verdict.note}</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── order: reconstruct the timeline by sequencing events ── */
type OrderItem = { label: string; pos: number };
function OrderSurface({ items, hint, onSolved }: { items: OrderItem[]; hint: string; onSolved: () => void }) {
  const [shuffled] = useState(() => { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  const [seq, setSeq] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [solved, setSolved] = useState(false);
  const avail = shuffled.filter((it) => !seq.includes(it.label));
  function add(label: string) { setSeq((s) => [...s, label]); setChecked(null); }
  function removeAt(idx: number) { setSeq((s) => s.filter((_, i) => i !== idx)); setChecked(null); }
  function check() {
    const correct = seq.length === items.length && seq.every((label, i) => { const it = items.find((x) => x.label === label)!; return it.pos === i; });
    setChecked(correct); if (correct) { setSolved(true); onSolved(); }
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// tap events in the order they happened; tap a placed one to remove it</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>EVENTS</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {avail.length ? avail.map((it) => <button key={it.label} onClick={() => add(it.label)} className="co-opt" style={{ padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.carbon, color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{it.label}</button>) : <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>(all placed)</span>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>YOUR TIMELINE</div>
      <div style={{ display: "grid", gap: 5, minHeight: 40 }}>
        {seq.map((label, i) => {
          const wrong = checked === false && items.find((x) => x.label === label)!.pos !== i;
          return (
            <button key={i} onClick={() => removeAt(i)} className="co-opt" style={{ textAlign: "left", padding: "8px 11px", borderRadius: 8, border: `1px solid ${checked === true ? C.green : wrong ? C.red : C.lineSoft}`, background: C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>
              <span style={{ color: C.indigo2, marginRight: 8 }}>{i + 1}.</span>{label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={seq.length !== items.length || solved}>CHECK ORDER →</Btn></div>
      {checked === false && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not quite - the red ones are out of order. Think attacker lifecycle: find, break in, act, impact.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Timeline reconstructed - that's the shape of the whole intrusion.</div>}
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
  | { kind: "pick"; title: string; goal: string; header: string; rows: Row[]; hint: string }
  | { kind: "order"; title: string; goal: string; items: OrderItem[]; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "pick" && <PickSurface header={stage.header} rows={stage.rows} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "order" && <OrderSurface items={stage.items} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Harbour incident) ───────────────────────── */

const LOG_ROWS: Row[] = [
  { cells: ["09:14:02", "198.51.100.7  GET /dashboard", "200"], bad: false, note: "Normal daytime traffic from a staff IP." },
  { cells: ["02:03:11", "203.0.113.9  POST /login", "401"], bad: false, note: "A failed attempt (401) - the attack starting, not the success." },
  { cells: ["02:03:13", "203.0.113.9  POST /login", "401"], bad: false, note: "Another failed attempt. Which line is where it actually succeeded?" },
  { cells: ["02:03:14", "203.0.113.9  POST /login", "200"], bad: true, note: "After four failures in two seconds, this 200 is the brute-force succeeding - the moment of compromise." },
  { cells: ["02:04:05", "203.0.113.9  GET /api/export?all=1", "200"], bad: false, note: "That's the impact - bulk export after getting in. Compromise was the successful login just before." },
];

const PROC_ROWS: Row[] = [
  { cells: ["1042", "/usr/sbin/nginx", "web server"], bad: false, note: "The web server - expected." },
  { cells: ["1108", "/usr/sbin/sshd", "ssh daemon"], bad: false, note: "SSH - expected." },
  { cells: ["3391", "/tmp/.sys7 -q", "???"], bad: true, note: "A process running from /tmp with a hidden, random name - that's the attacker's implant." },
  { cells: ["1200", "/usr/sbin/cron", "scheduler"], bad: false, note: "The system scheduler - expected." },
];

const ACT_STAGES: Stage[] = [
  { kind: "pick", title: "The log", goal: "Stage 1 - Read the trail. Harbour pulled the overnight auth log. Find the single line that marks the moment of compromise - not an attempt, not the aftermath.",
    header: "AUTH ACCESS LOG · click the moment of compromise", rows: LOG_ROWS,
    hint: "Find the night-time IP (203.0.113.9) with a run of 401s, then the one 200 right after - that success is the compromise." },
  { kind: "pick", title: "The implant", goal: "Stage 2 - Find what they left behind. The attacker planted something to keep access. Scan the running processes and spot the implant.",
    header: "PROCESS LIST · click the attacker's implant", rows: PROC_ROWS,
    hint: "Legit services live in /usr/sbin with clear names. A process running from /tmp with a hidden, random name is the implant." },
  { kind: "order", title: "Timeline", goal: "Stage 3 - Reconstruct it. Put the attack's events in the order they happened - the attacker lifecycle from first contact to impact.",
    items: [
      { label: "Recon scan from an unknown IP (01:50)", pos: 0 },
      { label: "Burst of failed logins / brute force (02:03)", pos: 1 },
      { label: "Successful login - compromise (02:03:14)", pos: 2 },
      { label: "Accessed the admin panel (02:03:40)", pos: 3 },
      { label: "Bulk data export / exfiltration (02:04:05)", pos: 4 },
    ],
    hint: "Attacker lifecycle: find (recon) -> break in (brute then success) -> act (admin) -> impact (exfiltrate). Order by the timestamps." },
  { kind: "decision", title: "Scope", goal: "Stage 4 - Scope the incident. From everything you found, what's the correct conclusion for the report?",
    decision: { prompt: "What does the evidence actually show?", options: [
      { text: "An external IP brute-forced an account, logged in, reached the admin panel, exported data, and left an implant.", correct: true, feedback: "Right. The log, the process list and the timeline together prove account takeover, a data breach, and persistence." },
      { text: "A staff member exported the data by accident during their normal daytime work on the portal.", feedback: "No. The activity is from an unknown night-time IP after a brute force, not the daytime staff address." },
      { text: "Self-spreading malware ran on the server on its own, with no login or human attacker involved.", feedback: "The log shows a brute-forced login (401s then a 200) as the way in, not self-spreading malware." },
      { text: "A single failed login attempt that the system correctly blocked, so nothing was actually breached.", feedback: "The 200 after the 401 storm means a login succeeded, and a bulk export followed. It was not blocked." },
    ] } },
];

function ForensicsAct({ onCapture }: { onCapture: () => void }) {
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

/* ───────────────────────── lesson lab: spot the anomaly ───────────────────────── */

function AnomalyLab({ onDone }: { onDone: () => void }) {
  const LINES = [
    { t: "08:30 10.0.0.5 GET /home 200", odd: false },
    { t: "09:15 10.0.0.5 GET /reports 200", odd: false },
    { t: "03:12 45.9.2.1 POST /login 200 (after 6x 401)", odd: true },
    { t: "11:40 10.0.0.5 GET /home 200", odd: false },
  ];
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && LINES[picked].odd;
  useEffect(() => { if (correct) onDone(); }, [correct, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · spot the indicator of compromise</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>One of these log lines doesn&apos;t belong. Click the anomaly.</div>
      <div style={{ display: "grid", gap: 4 }}>
        {LINES.map((l, i) => (
          <button key={i} onClick={() => setPicked(i)} className="co-opt" style={{ textAlign: "left", padding: "8px 11px", borderRadius: 7, border: `1px solid ${picked === i ? (l.odd ? C.green : C.red) : C.lineSoft}`, background: C.carbon, color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{l.t}</button>
        ))}
      </div>
      {picked !== null && <div style={{ marginTop: 10, fontSize: 13, color: correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{correct ? "✓ Right - a 3am login from an unknown IP after six failures is a brute force landing. Odd time, odd IP, error spike: three indicators at once." : "Look again - which line is a different IP, at an odd hour, right after a run of failures?"}</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: catch it soonest ───────────────────────── */

function CatchSoonestLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Auto-alert on a burst of failed logins from one IP at an odd hour", ok: true, why: "Right. That indicator fires before the login succeeds, so you can respond before any data leaves the building." },
    { code: "Review the server logs by hand in the monthly security meeting", ok: false, why: "Far too slow. The data was exported minutes after the break-in, long before a monthly review would spot it." },
    { code: "Keep only the last day of logs to save on storage costs", ok: false, why: "Short retention saves money but destroys the trail. You cannot investigate what you have already deleted." },
    { code: "Trust the firewall to block anything dangerous before it reaches the app", ok: false, why: "A firewall cannot tell a valid-looking login from a brute force that guessed right. You need detection on the behaviour." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · what catches this attack soonest?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
        mono
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Find the compromise in Brightpost's log. No walkthrough.", stages: [{ kind: "pick", title: "Log", goal: "Click the moment of compromise.", header: "ACCESS LOG", rows: [ { cells: ["10:00", "10.0.0.2 GET /home", "200"], bad: false, note: "Normal." }, { cells: ["04:11", "88.2.1.9 POST /login", "401"], bad: false, note: "An attempt." }, { cells: ["04:12", "88.2.1.9 POST /login", "200"], bad: true, note: "The success after the failure - compromise." } ], hint: "The 200 right after the 401 from the odd IP." }], success: "Pinpointed the moment of compromise. Finding logged." },
  { client: "Tideway Council", brief: "Spot the implant in Tideway's process list.", stages: [{ kind: "pick", title: "Implant", goal: "Click the attacker's process.", header: "PROCESSES", rows: [ { cells: ["900", "/usr/sbin/sshd", "ssh"], bad: false, note: "Expected." }, { cells: ["4120", "/dev/shm/.k -s", "???"], bad: true, note: "Running from /dev/shm with a hidden name - that's the implant." } ], hint: "A hidden name running from a temp/memory path is the implant." }], success: "Found the persistence implant. Finding logged." },
  { client: "Flux Fitness", brief: "Reconstruct Flux's intrusion timeline. Trickier.", stages: [{ kind: "order", title: "Timeline", goal: "Order the events of the attack.", items: [ { label: "Phishing email opened", pos: 0 }, { label: "Credential stolen", pos: 1 }, { label: "Attacker logs in", pos: 2 }, { label: "Data exfiltrated", pos: 3 } ], hint: "Phish -> steal -> log in -> exfiltrate." }], success: "Rebuilt the full timeline from the artifacts. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Find the breach, then scope it. Chain it yourself.", stages: [
    { kind: "pick", title: "Log", goal: "Step 1: find the compromise.", header: "ACCESS LOG", rows: [ { cells: ["12:00", "10.0.0.3 GET /x", "200"], bad: false, note: "Normal." }, { cells: ["02:40", "77.3.3.3 POST /login", "200 (after 5x 401)"], bad: true, note: "The brute-force success." } ], hint: "The success after the failures." },
    { kind: "decision", title: "Scope", goal: "Step 2: the correct conclusion?", decision: { prompt: "What does Oakline's evidence show?", options: [ { text: "An external brute-force takeover from an unknown night-time IP, after a run of failures.", correct: true, feedback: "Right. Unknown IP, odd hour, and a 200 straight after the 401s. That matches the log exactly." }, { text: "Routine staff activity during normal working hours on the portal.", feedback: "No. This is a night-time unknown IP after failed attempts, not daytime staff." }, { text: "A one-off failed login that the system correctly blocked, with no breach at all.", feedback: "The 200 after the 401s means it succeeded. A blocked attempt would have stayed at 401." }, { text: "A scheduled backup job that logged itself in automatically overnight.", feedback: "A backup runs from a known internal host on a schedule, not a strange external IP guessing passwords." } ] } },
  ], success: "Found the breach and scoped it correctly - the whole forensic chain. Finding logged." },
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
  { kind: "pick", title: "Log", goal: "Sableline pulled their logs after an alert. Find the moment of compromise.", header: "AUTH LOG", rows: [ { cells: ["13:00", "10.0.0.9 GET /app", "200"], bad: false, note: "Normal daytime." }, { cells: ["03:22", "91.5.5.5 POST /login", "401"], bad: false, note: "An attempt." }, { cells: ["03:22", "91.5.5.5 POST /login", "200"], bad: true, note: "The brute-force success - compromise." } ], hint: "The 200 after the 401s from the night-time IP." },
  { kind: "pick", title: "Implant", goal: "Find the persistence implant they left.", header: "PROCESSES", rows: [ { cells: ["880", "/usr/sbin/nginx", "web"], bad: false, note: "Expected." }, { cells: ["5120", "/tmp/.update -d", "???"], bad: true, note: "Hidden name from /tmp - the implant." } ], hint: "Hidden name, temp folder." },
  { kind: "order", title: "Timeline", goal: "Finish it: reconstruct the full timeline of the Sableline intrusion.", items: [ { label: "Recon from unknown IP", pos: 0 }, { label: "Brute-force login", pos: 1 }, { label: "Compromise (success)", pos: 2 }, { label: "Implant installed", pos: 3 }, { label: "Data exfiltrated", pos: 4 } ], hint: "Find -> break in -> compromise -> persist -> impact." },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full investigation · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}full_1ntrus10n_rec0nstructed{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Log, implant, timeline - a whole intrusion reconstructed from the artifacts, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE11: ModuleDef = {
  code: "M-11",
  moduleNo: 11,
  title: "Digital Forensics",
  client: "Harbour Systems",
  brief:
    "A deep engagement that flips your seat - you're the defender now, reading the trail someone else left. Something happened on Harbour's portal overnight and they've pulled the evidence. The full job, all in your browser: find the exact moment of compromise in the auth log, spot the attacker's implant in the process list, reconstruct the whole intrusion as a timeline, and scope what actually happened. Then four field jobs for new clients, and a final challenge you run start to finish. Nothing leaves your machine.",
  industry: {
    tag: "After the attack, the machine still remembers. Forensics is reading what it kept.",
    readLine: "a 2 minute read before you dig in",
    enginesTitle: "The forensic toolkit",
    whyPunch: "Deleted is not gone.",
    motif: { pre: "recovered deleted file -> ", hit: "last saved by: Dennis", note: "the metadata named the killer" },
    primer: {
      term: "Digital forensics",
      what: "Digital forensics is the investigation after an incident: recovering and reading the traces a computer keeps, deleted files, logs, running processes, file metadata, to reconstruct exactly what happened and who did it. The key idea is that computers remember far more than people think, and 'deleted' usually just means 'hidden'.",
      example: "deleted file -> Author: dennis   (metadata survives)",
      returns: "A deleted file can often be recovered, and its hidden metadata can name who made it. Forensics turns leftover traces into a timeline and an attribution, which is exactly what you will do here: find the compromise, the implant, and rebuild the attack.",
    },
    learn: [
      "Read an auth log and pinpoint the exact moment of compromise.",
      "Scan the running processes and spot the persistence implant.",
      "Reconstruct the whole attack as a timeline, first contact to impact.",
      "Scope the incident: what actually happened, for the report.",
    ],
    engines: [
      { name: "Autopsy", color: "#4ade80", blurb: "The free, open-source disk-forensics suite: recovers deleted files, history and more from a drive image.", here: true, icon: "scan" },
      { name: "Volatility", color: "#5fe6ff", blurb: "Memory forensics: pulls running processes, passwords and malware out of a snapshot of RAM.", icon: "scan" },
      { name: "Wireshark", color: "#8b7bff", blurb: "The standard network analyser: shows exactly what data moved across a network, packet by packet.", icon: "scan" },
      { name: "FTK", color: "#ffb347", blurb: "A commercial all-in-one that indexes and searches huge evidence sets fast; used by police and enterprise.", icon: "doc" },
      { name: "EnCase", color: "#e5392f", blurb: "The classic courtroom-grade platform, and the tool that cracked the BTK case.", icon: "scan" },
    ],
    headline: {
      masthead: "THE COLD CASE GAZETTE",
      dateline: "WICHITA · 2005 · POLICE INVESTIGATION RECORD",
      title: "A deleted file on a floppy disk named a serial killer",
      body: "For decades the BTK killer taunted police and was never caught. In 2005 he mailed a floppy disk to a TV station, sure it was safe. Investigators recovered a deleted file still on the disk, a church newsletter, and its hidden metadata showed it was last saved by a user named 'Dennis'. A quick search tied that to the church council president, Dennis Rader. He was arrested and confessed.",
      stat: "1 file",
      statLabel: "DELETED, BUT NEVER GONE",
      why: "He thought deleting the file erased it; the computer remembered his name anyway. Deleted is not gone, and that single idea is the heart of digital forensics.",
    },
    realWorld:
      "When an attack is over, the evidence isn't. Every system keeps logs of who logged in, traces of programs that ran, and files that were 'deleted' but still sit on the disk, each with hidden metadata. Forensics is the discipline of recovering and reading those traces to rebuild exactly what happened and point to who did it, for an investigation, a court, or just to stop it happening again.",
    now: {
      stat: "241 days",
      statLabel: "average time to find and contain a breach (IBM 2025)",
      body: "Attacks go unnoticed for a long time: IBM's 2025 report puts the average at 241 days to identify and contain a breach. That long gap is exactly the window forensics works in, reconstructing months of activity from the traces left behind, using a standard process: collect, examine, analyse, report.",
    },
    recent: {
      year: "2024",
      title: "Forensics unmasks a ransomware boss",
      body: "In 2024, an international police operation seized the servers of LockBit, then the world's most prolific ransomware gang. Forensic analysis of the captured infrastructure let investigators map the network and publicly name its leader, a feat of attribution built entirely on reading seized data. (He denies it.)",
    },
    ahead:
      "AI is taking on the slow part of forensics: sifting mountains of logs, device images and network traffic to flag the suspicious events a human would take weeks to find, and helping spot manipulated media. The flip side is anti-forensics: the same AI can fabricate convincing fake evidence and deepfakes, like the 2024 video-call scam that cost a firm around $25 million, so examiners increasingly have to prove a file is genuine, not just unaltered.",
    role:
      "This is day-one knowledge for digital forensics analysts, incident responders and DFIR consultants. When something goes wrong, these are the people who work out what, how, and who.",
    roles: ["Digital forensics analyst", "Incident responder (DFIR)", "DFIR consultant", "SOC analyst"],
  },
  lesson: {
    blocks: [
      { h: "Everything leaves a trail", body: "Systems log what happens to them: who connected, when, from where, what they asked for, and whether it worked. Digital forensics is the craft of reading those trails after the fact to reconstruct events. The same observation skills you used to attack now work in reverse - you're looking for the story the data tells." },
      { h: "Build a timeline", body: "The core technique is timeline reconstruction: put events in order and look for the shape of an attack. A burst of failed logins from one unfamiliar address at 2am, followed suddenly by a success, is a brute force that landed. What comes next - an admin page, a bulk data export - tells you what they did once inside. Order turns scattered lines into a story." },
      { h: "Indicators of compromise", body: "Specific clues that something is wrong are called indicators of compromise: an unknown IP, activity at an odd hour, a spike of errors, access to sensitive endpoints. Spotting them quickly is the whole game in defence - the attacker's footprints are right there in the log, if someone is reading it." },
      { h: "Artifacts beyond the logs", body: "Logs are only part of it. Attackers leave other artifacts: files dropped on disk, new scheduled tasks, and running processes - often an implant disguised with an odd name or launched from a temp folder to keep access after the break-in. A good investigator looks at the whole system, not just one log, to find how they got in and what they left behind." },
      { h: "Preserve the evidence", body: "Forensics only works if the evidence survives and can be trusted. Don't alter what you're investigating; keep a clear chain of custody. Logs should be shipped off the host to a central, append-only store, because an attacker's first instinct is to erase their tracks - and you can't reconstruct an intrusion from a log they were able to delete." },
    ],
    Interactive: AnomalyLab,
    summary: [
      "Systems log who did what, when and from where; forensics reads those trails to reconstruct events.",
      "Timeline reconstruction orders events into the shape of an attack: recon, break-in, actions, impact.",
      "Indicators of compromise (odd IP, odd hour, error spikes, sensitive access) are the clues to spot fast.",
      "Attackers also leave artifacts - files, scheduled tasks, disguised processes (implants) for persistence.",
      "Preserve evidence: don't alter it, keep chain of custody, and store logs append-only off the host.",
    ],
    check: {
      q: "In the log, which single entry marks the moment of compromise?",
      options: [
        { text: "The 200 OK login from the night-time IP, straight after its run of 401 failures.", correct: true, feedback: "Right. The 200 after the 401 storm is the brute force finally landing. That success is the compromise." },
        { text: "The first 401 failure from that night-time IP, where the password guessing begins.", feedback: "That is the attack starting, not succeeding. A failed attempt is not the moment they got in." },
        { text: "The GET /api/export request that pulled the data out shortly after the login.", feedback: "That is the impact, what they did after getting in. The compromise was the successful login just before." },
        { text: "The daytime 200 request from the staff IP doing normal portal work.", feedback: "That is legitimate traffic from a staff address during the day, not part of the attack at all." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems portal · overnight logs and host artifacts",
    inScope: "reading and interpreting the provided evidence; the consolidation clients in each drill",
    offLimits: "altering logs or artifacts, contacting the source IP, acting outside analysis",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge - you're the defender today. Walk the log and find the one line where they got in, scan the processes for the implant, order the events into a timeline, then scope what happened. Read carefully; don't alter the evidence.",
  hint: "Work the stages in order. In the log, the 200 right after the 401 storm from the odd IP is the compromise. In the processes, a hidden name running from /tmp is the implant. Order the timeline by attacker lifecycle: recon, break in, act, impact.",
  plan: [
    { label: "Read the trail", goal: "Read the overnight auth log and find the single line that marks the moment of compromise." },
    { label: "Find the implant", goal: "Scan the running processes and spot what the attacker left behind to keep access." },
    { label: "Rebuild the timeline", goal: "Put the attack's events in the order they happened, from first contact to impact." },
    { label: "Scope it", goal: "From everything you found, reach the correct conclusion for the report." },
  ],
  Act: ForensicsAct,
  flag: "flag{br3ach_t1meline_built}",
  defend: {
    blocks: [
      { h: "Detect it as it happens", body: "The whole attack was visible in the log - the fix is to be watching. Alert on bursts of failed logins, on logins from new countries or at odd hours, and on access to sensitive endpoints like bulk export. The earlier an indicator of compromise is caught, the smaller the damage; a 2am failed-login storm should have paged someone before the successful login ever landed." },
      { h: "Make the trail trustworthy", body: "Forensics only works if the logs survive and can't be quietly edited. Ship logs off the host to a central, append-only store, keep them long enough to investigate, and make sure they capture the useful fields: time, source IP, user, action, result. An attacker's first move after getting in is often to clear the logs - don't keep the only copy where they can reach it." },
      { h: "Close the door that was used", body: "Reconstruction isn't the end - it tells you what to fix. This intrusion came in through a brute-forceable login, so the defensive fixes are the ones from earlier modules: lockout and rate-limiting, MFA, and strong passwords. Then remove the implant, rotate the compromised credentials, and block the source. Forensics feeds straight back into prevention." },
    ],
    Interactive: CatchSoonestLab,
    check: {
      q: "The attacker had admin access on the host. Why does shipping logs to a separate, append-only store matter so much for the investigation?",
      options: [
        { text: "An intruder who controls the host can edit or wipe its logs; a separate append-only copy is one they can't quietly alter, so the trail survives.", correct: true, feedback: "Right - never keep the only copy where the attacker can reach it. Off-host, append-only logs are what make the timeline trustworthy." },
        { text: "Logs on a separate server load faster, so the analyst can search the overnight entries more quickly.", feedback: "Speed isn't the point - it's that the attacker can't reach and rewrite a copy stored off the host." },
        { text: "A separate store automatically blocks the brute-force attack before the login ever succeeds.", feedback: "Storage doesn't block attacks - lockout and alerting do. Off-host logging protects the evidence, not the login." },
        { text: "Keeping logs elsewhere means you can safely wipe the host's own logs each day to save space.", feedback: "Deleting evidence is exactly the mistake - short retention destroys the trail whether it's on the host or not." },
      ],
    },
  },
  finding: {
    title: "Account takeover via brute-force, with data export and persistence implant",
    where: "Harbour Systems portal · auth logs + host process list · source 203.0.113.9",
    severity: "High",
    cvss: "8.1",
    impact: "An external IP brute-forced a portal account (failures then success at 02:03:14), reached the admin panel, bulk-exported data, and left a disguised implant running from /tmp for persistence - a full account takeover, data breach and foothold, all visible in the evidence but undetected at the time.",
    fix: "Add lockout/rate-limiting and MFA to close the brute-force path; alert on failed-login bursts and odd-hour access; ship logs to an append-only store; remove the implant, rotate credentials, and block the source IP.",
  },
  cheatsheet: {
    title: "Digital forensics quick reference",
    blurb: "Where the evidence hides, how to rebuild what happened, and how to keep it sound, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "Forensics is reading leftovers. Here are three classic artifacts and what each one quietly tells the investigator.",
      cols: ["the artifact", "what it tells you", "where it hides"],
      rows: [
        ["a 200 right after 401s", "the brute-force that finally worked", "the auth / access log"],
        ["a process from /tmp/.hidden", "the attacker's persistence implant", "the running process list"],
        ["Author: dennis", "who made a file", "file metadata (survives deletion)"],
      ],
    },
    groups: [
      {
        heading: "Where the evidence lives",
        entries: [
          { code: "logs", what: "Records of who did what and when: logins, requests, errors. The first place to look.", example: "a 200 login right after failed 401s = the break-in" },
          { code: "running processes", what: "What's executing on the machine right now; attackers hide implants here.", example: "a hidden name running from /tmp or /dev/shm" },
          { code: "metadata", what: "Hidden info inside files: author, timestamps, software, sometimes paths. Survives deletion.", example: "a document's Author field names who made it" },
          { code: "deleted is not gone", what: "Deleting a file usually just unlinks it; the data often stays and can be recovered.", example: "a recovered file that broke the BTK case" },
        ],
      },
      {
        heading: "Rebuilding what happened",
        entries: [
          { code: "timeline", what: "Order the events from the artifacts: recon, break-in, persistence, exfiltration.", example: "phish -> steal -> log in -> implant -> exfiltrate" },
          { code: "indicators of compromise", what: "The tell-tale signs of an attacker: odd IPs, hashes, filenames, times (IoCs).", example: "a night-time login from an unknown IP" },
          { code: "attribution", what: "Tying the evidence to a who: an account, a tool, a group, sometimes a person.", example: "seized servers mapped to a ransomware crew" },
          { code: "the process", what: "Work in order: collect, examine, analyse, report, preserving evidence at each step.", example: "image the disk before you touch it" },
        ],
      },
      {
        heading: "Keeping it sound",
        entries: [
          { code: "preserve first", what: "Make a copy (image) and work on that, so you never change the original evidence.", example: "hash the image to prove it's unchanged" },
          { code: "chain of custody", what: "Record who handled the evidence and when, so it stands up in court.", example: "a signed log of every access" },
          { code: "prove authenticity", what: "Show the evidence is genuine and unaltered, increasingly, that it isn't an AI fake.", example: "verify hashes; check for deepfake signs" },
          { code: "report clearly", what: "Write what happened, how you know, and what to do, for non-experts.", example: "timeline + evidence + recommendation" },
        ],
      },
    ],
  },
  takeaway: "The logs hold the whole story: a burst of failures then one success, odd hour, odd place, is a break-in. Learn to read them.",
  outcome: [
    "Read an auth log and pinpoint the moment of compromise - the one success that follows a burst of failed logins from an odd IP at an odd hour.",
    "Spot an attacker's persistence implant in a process list by its tells, a hidden random name running from a temp folder like /tmp.",
    "Reconstruct an intrusion as an ordered timeline from recon to break-in to exfiltration, then scope what actually happened for the report.",
  ],
  rep: 60,
  repRank: "Operator",
  repTo: "510 / 600 to Lead Operator",
  next: "NEXT MODULE · Incident Response →",
};

export default function Module11() {
  return <Engagement mod={MODULE11} />;
}

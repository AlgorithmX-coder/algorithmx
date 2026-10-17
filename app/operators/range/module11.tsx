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
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary } from "./Engagement";

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
  const [msg, setMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  function pick(i: number) {
    const r = rows[i]; setPicked(i);
    if (r.bad) { setMsg(`✓ ${r.note}`); if (!solved) { setSolved(true); onSolved(); } }
    else setMsg(r.note);
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>⌦ {header}</div>
      <div style={{ display: "grid", gap: 3 }}>
        {rows.map((r, i) => (
          <button key={i} onClick={() => pick(i)} className="co-opt" style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "7px 10px", borderRadius: 7, border: `1px solid ${picked === i ? (r.bad ? C.green : C.amber) : "transparent"}`, background: picked === i ? "rgba(139,123,255,0.06)" : C.carbon, cursor: "pointer" }}>
            {r.cells.map((c, j) => <span key={j} style={{ fontFamily: MONO, fontSize: 11.5, color: j === 0 ? C.mute : j === r.cells.length - 1 ? (c.includes("40") || c === "200" ? C.green : C.soft) : C.soft, minWidth: j === 0 ? 64 : "auto", flex: j === 1 ? 1 : "none" }}>{c}</span>)}
          </button>
        ))}
      </div>
      {msg && <div style={{ fontFamily: MONO, fontSize: 12.5, color: solved ? C.green : C.soft, marginTop: 10, lineHeight: 1.6 }}>{msg}</div>}
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
      { text: "An external IP brute-forced one account, logged in, reached the admin panel, exported data, and left an implant for persistence.", correct: true, feedback: "Right - that's what the log, the process list and the timeline together prove. Account takeover, data breach, and persistence." },
      { text: "A staff member accidentally exported the data during the day.", feedback: "No - the activity is from an unknown night-time IP after a brute force, not the daytime staff IP." },
      { text: "It was malware that spread on its own, with no login involved.", feedback: "The log clearly shows a brute-forced login (401s then 200) as the entry - not autonomous malware." },
      { text: "Nothing happened; the 200s are all normal successful requests.", feedback: "A 200 after a 401 storm from a strange IP at 2am, followed by a bulk export, is a breach - not normal traffic." },
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
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: "Read the logs manually once a year", ok: false, why: "Far too slow - the data was exported minutes after the break-in; a yearly review catches nothing in time." },
    { code: "Delete old logs to save disk space", ok: false, why: "That destroys the very evidence forensics depends on - the opposite of what you want." },
    { code: "Alert automatically on a burst of failed logins from one IP at an odd hour", ok: true, why: "That indicator fires BEFORE the successful login, giving you time to respond. Real-time detection on IoCs is the win." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · what catches this attack soonest?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.ok) onDone(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.ok ? C.green : C.red) : C.line}`, background: isP ? (o.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer", lineHeight: 1.4 }}>
                <span style={{ color: isP ? (o.ok ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (o.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.code}
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
  { client: "Brightpost Media", brief: "Find the compromise in Brightpost's log. No walkthrough.", stages: [{ kind: "pick", title: "Log", goal: "Click the moment of compromise.", header: "ACCESS LOG", rows: [ { cells: ["10:00", "10.0.0.2 GET /home", "200"], bad: false, note: "Normal." }, { cells: ["04:11", "88.2.1.9 POST /login", "401"], bad: false, note: "An attempt." }, { cells: ["04:12", "88.2.1.9 POST /login", "200"], bad: true, note: "The success after the failure - compromise." } ], hint: "The 200 right after the 401 from the odd IP." }], success: "Pinpointed the moment of compromise. Finding logged." },
  { client: "Tideway Council", brief: "Spot the implant in Tideway's process list.", stages: [{ kind: "pick", title: "Implant", goal: "Click the attacker's process.", header: "PROCESSES", rows: [ { cells: ["900", "/usr/sbin/sshd", "ssh"], bad: false, note: "Expected." }, { cells: ["4120", "/dev/shm/.k -s", "???"], bad: true, note: "Running from /dev/shm with a hidden name - that's the implant." } ], hint: "A hidden name running from a temp/memory path is the implant." }], success: "Found the persistence implant. Finding logged." },
  { client: "Flux Fitness", brief: "Reconstruct Flux's intrusion timeline. Trickier.", stages: [{ kind: "order", title: "Timeline", goal: "Order the events of the attack.", items: [ { label: "Phishing email opened", pos: 0 }, { label: "Credential stolen", pos: 1 }, { label: "Attacker logs in", pos: 2 }, { label: "Data exfiltrated", pos: 3 } ], hint: "Phish -> steal -> log in -> exfiltrate." }], success: "Rebuilt the full timeline from the artifacts. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Find the breach, then scope it. Chain it yourself.", stages: [
    { kind: "pick", title: "Log", goal: "Step 1: find the compromise.", header: "ACCESS LOG", rows: [ { cells: ["12:00", "10.0.0.3 GET /x", "200"], bad: false, note: "Normal." }, { cells: ["02:40", "77.3.3.3 POST /login", "200 (after 5x 401)"], bad: true, note: "The brute-force success." } ], hint: "The success after the failures." },
    { kind: "decision", title: "Scope", goal: "Step 2: the correct conclusion?", decision: { prompt: "What does Oakline's evidence show?", options: [ { text: "An external brute-force takeover from an unknown night-time IP.", correct: true, feedback: "Right - matches the log." }, { text: "Normal staff activity.", feedback: "No - unknown IP, odd hour, after failures." } ] } },
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
        { text: "The successful login (200) from the attacker's IP right after the run of failures.", correct: true, feedback: "Right - that 200 after the 401 storm is where the brute force actually got in." },
        { text: "The first failed login (401).", feedback: "That's the attack starting - an attempt, not a success." },
        { text: "The data export request.", feedback: "That's the impact - what they did after getting in. Compromise was the successful login just before." },
        { text: "The normal daytime request from the staff IP.", feedback: "That's legitimate traffic - not part of the attack at all." },
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
      q: "What would have caught this attack soonest?",
      options: [
        { text: "Alerting automatically on a burst of failed logins from one IP at an unusual hour.", correct: true, feedback: "Right - that indicator fires before the successful login, giving you time to respond." },
        { text: "Reading the logs manually once a year.", feedback: "Far too slow - the data would be exported long before anyone looked." },
        { text: "Deleting old logs to save space.", feedback: "That destroys the very evidence forensics depends on." },
        { text: "Turning logging off to improve performance.", feedback: "Then there's no trail at all - you'd never know the breach happened." },
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

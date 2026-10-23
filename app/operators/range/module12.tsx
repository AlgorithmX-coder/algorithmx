"use client";

/* Module 12 - Incident Response (DEPTH STANDARD, built to the M5 framework).
 *
 * Full defender seat. Judgment under pressure, modelled in-browser: triage the
 * real incident out of the noise, make the containment call, order the IR
 * lifecycle, and close out safely. Shape mirrors M5: hover glossary, interactive
 * lesson lab, de-biased check, a FOUR-stage capture with a hint ladder, FOUR
 * drills, and a chained capstone. */

import { useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "incident response", definition: "The disciplined process for handling a security breach: detect, contain, eradicate, recover, and learn - in order.", example: "Like a fire drill, the team follows set steps the moment a breach hits instead of panicking and making it worse." },
  { term: "incident", definition: "A confirmed security event that needs a response - a real breach, not just a noisy alert.", example: "An antivirus pop-up is just an alert; ransomware actually encrypting the finance team's files is an incident." },
  { term: "triage", definition: "Sorting incoming alerts to separate a genuine incident from benign noise and false positives, fast.", example: "Like an A&E nurse deciding who needs help now and who can wait, an analyst scans 200 alerts to find the one that is a real attack." },
  { term: "false positive", definition: "An alert that looks suspicious but turns out to be harmless - most alerts are these, which is why triage matters.", example: "An alarm screaming 'malware!' about a file the IT team installed themselves yesterday is a false positive, like a smoke alarm set off by toast." },
  { term: "containment", definition: "The first response to a live attack: stop the damage spreading (block, isolate, kill the session) without destroying evidence.", example: "Unplugging the one infected laptop from the network stops ransomware reaching the other 50 machines, the digital version of shutting a watertight door." },
  { term: "eradicate", definition: "Remove the attacker's foothold for good - reset credentials, revoke sessions, and close the vulnerability they used.", example: "After pulling the infected laptop offline, you reset the stolen password and patch the hole they came through, so they cannot simply walk back in." },
  { term: "recover", definition: "Restore systems safely from known-clean backups and watch closely for the attacker's return.", example: "You rebuild the server from last week's clean backup rather than the infected one, then watch the logs closely in case the attacker tries again." },
  { term: "lessons learned", definition: "The review after an incident that feeds the findings back in, so the same hole can't be used twice.", example: "The review finds that nobody had switched on two-factor login, so the team turns it on for everyone and the same trick cannot work again." },
  { term: "IR plan", definition: "A written incident-response plan with roles and steps, prepared before anything happens, so response is executed not invented.", example: "Like a school with a fire-evacuation plan on the wall, the team keeps a step-by-step breach playbook ready before anything goes wrong." },
  { term: "tabletop exercise", definition: "A rehearsed, pretend breach the team walks through, so the real response becomes muscle memory.", example: "The team sits round a table and talks through 'ransomware just hit payroll, what does each of us do?' so the real thing feels rehearsed." },
  { term: "chain of custody", definition: "Keeping evidence intact and accounted for during a response, so findings hold up and nothing is lost.", example: "You take a labelled copy of the infected laptop's drive and record who held it, just as police bag evidence so it stands up later." },
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

/* ── triage: classify each alert as real incident or benign ── */
type Alert = { label: string; real: boolean; note: string };
function TriageSurface({ alerts, hint, onSolved }: { alerts: Alert[]; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, "real" | "noise">>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const all = alerts.every((a) => pick[a.label]);
  function check() { setChecked(true); if (alerts.every((a) => (pick[a.label] === "real") === a.real)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// the alert queue is noisy. Mark each as a real incident or benign noise.</div>
      <div style={{ display: "grid", gap: 10 }}>
        {alerts.map((a) => {
          const p = pick[a.label]; const right = checked && (p === "real") === a.real; const wrong = checked && p && (p === "real") !== a.real;
          return (
            <div key={a.label} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <span style={{ flex: "1 1 200px", fontSize: 13.5, color: C.ink }}>{a.label}</span>
              <button onClick={() => { setPick((x) => ({ ...x, [a.label]: "real" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "real" ? C.red : C.line}`, background: "transparent", color: p === "real" ? C.red : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>real incident</button>
              <button onClick={() => { setPick((x) => ({ ...x, [a.label]: "noise" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "noise" ? C.green : C.line}`, background: "transparent", color: p === "noise" ? C.green : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>benign noise</button>
              {((checked && wrong) || solved) && <div style={{ flexBasis: "100%", fontFamily: MONO, fontSize: 11.5, color: solved ? C.green : C.amber }}>↳ {a.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CONFIRM TRIAGE →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Look for the one with real impact.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Triaged - now you're working the real incident, not chasing noise.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── decision ── */
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

/* ── order: sequence the IR lifecycle ── */
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
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// tap the steps in the order you'd run them; tap a placed one to remove it</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>STEPS</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {avail.length ? avail.map((it) => <button key={it.label} onClick={() => add(it.label)} className="co-opt" style={{ padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.carbon, color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{it.label}</button>) : <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>(all placed)</span>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, marginBottom: 7 }}>YOUR PLAN</div>
      <div style={{ display: "grid", gap: 5, minHeight: 40 }}>
        {seq.map((l, i) => { const wrong = checked === false && items.find((x) => x.label === l)!.pos !== i; return (
          <button key={i} onClick={() => removeAt(i)} className="co-opt" style={{ textAlign: "left", padding: "8px 11px", borderRadius: 8, border: `1px solid ${checked === true ? C.green : wrong ? C.red : C.lineSoft}`, background: C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}><span style={{ color: C.indigo2, marginRight: 8 }}>{i + 1}.</span>{l}</button>
        ); })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={seq.length !== items.length || solved}>CHECK ORDER →</Btn></div>
      {checked === false && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Not quite - the red ones are out of order.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Correct lifecycle - that order is what keeps a response calm and effective.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── a stage ── */
type Stage =
  | { kind: "triage"; title: string; goal: string; alerts: Alert[]; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision }
  | { kind: "order"; title: string; goal: string; items: OrderItem[]; hint: string };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "triage" && <TriageSurface alerts={stage.alerts} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
      {stage.kind === "order" && <OrderSurface items={stage.items} hint={stage.hint} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Harbour live incident) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  { kind: "triage", title: "Triage", goal: "Stage 1 - Triage the queue. Alerts are flooding in. Separate the one real incident from the benign noise before you act.",
    alerts: [
      { label: "A staff laptop's antivirus quarantined a test file", real: false, note: "Routine - AV did its job on a harmless sample. Noise." },
      { label: "Active session from an unknown IP bulk-exporting the customer database right now", real: true, note: "This is the real incident - live exfiltration. Everything else is secondary." },
      { label: "A user mistyped their password twice this morning", real: false, note: "Two fat-fingered attempts is normal. Noise." },
      { label: "Scheduled backup job completed successfully", real: false, note: "A successful routine job - not an incident at all." },
    ],
    hint: "Most alerts are noise. The real incident is the one causing active harm right now: live data exfiltration from an unknown IP." },
  { kind: "decision", title: "Contain", goal: "Stage 2 - The first move. The attacker's session is live and exporting data. What's your FIRST action?",
    decision: { prompt: "An attacker session is active and exfiltrating right now. First action?", options: [
      { text: "Block the attacker's IP and kill the active session, preserving the evidence.", correct: true, feedback: "Right - contain first. Stop the bleeding and the active harm without destroying what you'll need to investigate." },
      { text: "Pull the whole server offline and wipe it clean immediately.", feedback: "Too far, too fast - you'd destroy evidence and cause an outage. Contain the attacker, don't nuke the host." },
      { text: "Start a thorough week-long root-cause investigation first.", feedback: "Later. While you investigate, they're still exfiltrating. Contain now, investigate after." },
      { text: "Email all staff right away to warn them about it.", feedback: "Not first - it wastes the minutes that matter while the attacker is live. Contain the session." },
    ] } },
  { kind: "order", title: "Lifecycle", goal: "Stage 3 - Work the lifecycle. The session is contained. Put the remaining response steps in the right order.",
    items: [
      { label: "Contain (block + kill session)", pos: 0 },
      { label: "Eradicate (reset creds, revoke sessions, close the hole)", pos: 1 },
      { label: "Recover (restore from clean backups, monitor)", pos: 2 },
      { label: "Lessons learned (review, feed fixes back)", pos: 3 },
    ],
    hint: "Contain -> eradicate -> recover -> lessons. Stop it, remove it, restore safely, then learn so it can't recur." },
  { kind: "decision", title: "Close out", goal: "Stage 4 - Close it properly. The threat is removed. How do you finish the incident?",
    decision: { prompt: "Threat eradicated. How do you close out the incident?", options: [
      { text: "Restore from clean backups, monitor for a return, and run a review.", correct: true, feedback: "Right - recover safely, watch for a comeback, run a lessons-learned review, and keep all the logs intact." },
      { text: "Delete the logs so there's no record the breach happened.", feedback: "Never - that destroys evidence, breaks legal duties, and throws away the lessons. Keep the logs." },
      { text: "Say nothing to anyone and quietly hope that it's all over.", feedback: "Hiding it risks a worse outcome and often breaches disclosure obligations. Close out properly and review." },
      { text: "Restore from a backup taken during the breach to save time.", feedback: "That backup may contain the attacker's implant - you'd reinfect yourself. Restore from a known-clean point." },
    ] } },
];

function IncidentAct({ onCapture }: { onCapture: () => void }) {
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

/* ───────────────────────── lesson lab: pick the real incident ───────────────────────── */

function TriageLab({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · which is the real incident?</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 12 }}>Four alerts land at once. Click the one that actually needs an incident response.</div>
      <AnswerReveal
        onAnswered={() => onDone()}
        options={[
          { text: "Daily backup finished OK", reason: "That is routine good news, not harm. A finished backup needs no response at all." },
          { text: "Ransomware encrypting the file server right now", correct: true, reason: "Active harm happening this second. That is the real incident - it needs a response now, before more files are lost." },
          { text: "One user locked out after a few password typos", reason: "Annoying for that user, but it is a routine lockout, not an attack in progress. Service-desk work, not an incident." },
          { text: "A phishing email was reported and already quarantined", reason: "Good catch, but it is already contained. Reported and quarantined means the threat was handled, not live." },
        ]}
      />
    </div>
  );
}

/* ───────────────────────── defend lab: what matters most ───────────────────────── */

function PrepLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Buy the most expensive firewall on the market", ok: false, why: "Tools help, but a breach in progress is won or lost on process and practice, not on one shiny box." },
    { code: "Plan to figure out the response once a breach actually happens", ok: false, why: "The worst time to invent a plan is during a live incident. You execute a plan then; you don't write one." },
    { code: "A tested IR plan, clean backups, central logging, and rehearsed roles", ok: true, why: "Preparation is what separates a minutes-long response from a months-long one - the plan, backups, logging and tabletop rehearsals, all done before anything happens." },
    { code: "Buy cyber-insurance to cover the cost of any future breach", ok: false, why: "Insurance pays some of the bill afterwards; it does nothing to contain or recover from the incident on the day. You still need the plan." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE STANDARD · what most determines how well a breach is handled?</div>
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
  { client: "Brightpost Media", brief: "Triage Brightpost's alert queue. No walkthrough.", stages: [{ kind: "triage", title: "Triage", goal: "Mark the real incident vs noise.", alerts: [ { label: "CMS auto-update installed overnight", real: false, note: "Routine maintenance." }, { label: "Admin account logging in from two countries at once", real: true, note: "Impossible travel = a real account-takeover incident." }, { label: "Spam filter blocked 400 emails", real: false, note: "Doing its job - noise." } ], hint: "Impossible-travel logins are a classic real incident." }], success: "Triaged correctly - you're on the real incident. Finding logged." },
  { client: "Tideway Council", brief: "A live attack is contained. Order the rest of the response.", stages: [{ kind: "order", title: "Lifecycle", goal: "Order the remaining IR steps.", items: [ { label: "Eradicate the foothold", pos: 0 }, { label: "Recover from clean backups", pos: 1 }, { label: "Lessons learned review", pos: 2 } ], hint: "Eradicate -> recover -> learn." }], success: "Ran the lifecycle in the right order. Finding logged." },
  { client: "Flux Fitness", brief: "A judgment call mid-incident. Make it. Trickier.", stages: [{ kind: "decision", title: "Call", goal: "Why isn't wiping every machine the right first move?", decision: { prompt: "Malware is spreading across Flux's network. A colleague wants to wipe every machine at once. Why is that the wrong first move?", options: [ { text: "It destroys the evidence you need and causes a huge outage - isolate the affected segment first, then clean.", correct: true, feedback: "Right - contain the spread first and preserve evidence; wiping is eradication, and it comes later." }, { text: "It isn't wrong - wiping everything at once is the fastest way to be completely sure the malware is gone.", feedback: "It nukes the evidence and takes everything offline. Contain first by isolating the affected segment." }, { text: "It's wrong only because it's expensive; if budget allowed, wiping everything immediately would be ideal.", feedback: "Cost isn't the issue - you'd lose the forensic trail and cause a needless outage. Contain, don't nuke." }, { text: "It's wrong, so you should instead wait and watch to see how far the malware actually spreads first.", feedback: "Waiting lets it spread further. Isolate the segment now, then investigate from the evidence." } ] } }], success: "Contained the spread without over-reacting. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Triage, then close out correctly. Chain it yourself.", stages: [
    { kind: "triage", title: "Triage", goal: "Step 1: find the real incident.", alerts: [ { label: "Card data being exfiltrated to an unknown host now", real: true, note: "Active exfiltration - the incident." }, { label: "A printer went offline", real: false, note: "Not security - noise." } ], hint: "Active data theft is the incident." },
    { kind: "decision", title: "Close out", goal: "Step 2: why not just restore from last night's backup?", decision: { prompt: "Threat removed. Restoring from last night's backup would get Oakline running fastest. Why isn't that safe?", options: [ { text: "Last night's backup may already hold the attacker's foothold, so you'd reinfect - restore from a known-clean point from before the breach.", correct: true, feedback: "Right - recover only from a backup taken before the compromise, then monitor, review and keep the logs." }, { text: "It's safe - the most recent backup is always the right one because it loses the least data.", feedback: "The newest backup can contain the breach itself. Pick the newest one that predates the compromise." }, { text: "It isn't safe, so the fastest clean option is to delete the logs and start the systems fresh.", feedback: "Never delete the logs - that destroys evidence and breaches disclosure duties. Restore from a clean backup." }, { text: "It isn't safe, so close the ticket now since the threat has already been removed anyway.", feedback: "Skipping recovery and the review means it can recur. Restore clean, monitor, and capture lessons learned." } ] } },
  ], success: "Triaged and closed out the incident correctly - the whole response. Finding logged." },
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
  { kind: "triage", title: "Triage", goal: "Sableline's SOC is lit up. Find the real incident.", alerts: [ { label: "Domain admin account created at 3am by an unknown source", real: true, note: "A rogue admin account at 3am is a serious live incident." }, { label: "Weekly vulnerability scan completed", real: false, note: "Routine - noise." }, { label: "A user changed their own password", real: false, note: "Normal self-service - noise." } ], hint: "A new domain-admin account at 3am is the incident." },
  { kind: "decision", title: "Contain", goal: "Make the containment call.", decision: { prompt: "A rogue domain-admin account is active. First move?", options: [ { text: "Disable the rogue account and revoke its sessions, preserving logs.", correct: true, feedback: "Right - contain the account first, keep the evidence." }, { text: "Rebuild the domain controller from scratch right now.", feedback: "Drastic and destroys evidence - contain the account first." }, { text: "Watch the account for a while to see what it does.", feedback: "Every minute it's active it can do more damage. Contain first, investigate from the logs after." }, { text: "Reset every user's password across the whole domain.", feedback: "A huge disruption that still leaves the rogue account's sessions live. Disable that account first." } ] } },
  { kind: "order", title: "Lifecycle", goal: "Finish it: order the full response.", items: [ { label: "Contain the rogue account", pos: 0 }, { label: "Eradicate (find how it was made, close the hole)", pos: 1 }, { label: "Recover and verify from clean state", pos: 2 }, { label: "Lessons learned", pos: 3 } ], hint: "Contain -> eradicate -> recover -> learn." },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full response · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
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
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}incident_run_by_the_b00k{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Triaged, contained, and ran the full lifecycle under pressure - a real incident handled calmly, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE12: ModuleDef = {
  code: "M-12",
  moduleNo: 12,
  title: "Incident Response",
  client: "Harbour Systems",
  brief:
    "A deep engagement in the defender's seat under pressure. The breach you reconstructed last time is happening again - live. Harbour has called you in to run the response. The full job: triage the real incident out of the noise, make the containment call, work the lifecycle in the right order, and close out safely. Then four field jobs for new clients, and a final challenge you run start to finish. Everything you learned breaking in now tells you exactly how to shut an attacker down.",
  industry: {
    tag: "When the alarm goes off, speed and order decide how bad it gets.",
    readLine: "a 2 minute read before the alarm",
    enginesTitle: "The blue-team toolkit",
    whyPunch: "Contain first. Clean second.",
    motif: { pre: "attacker session live -> ", hit: "isolate the host", note: "contain first, never wipe: that destroys the evidence" },
    primer: {
      term: "Incident response",
      what: "Incident response is the plan you run when an attack is actually happening. It follows a set order: prepare, detect, contain, eradicate, recover, and learn the lessons. The instinct is to wipe everything immediately, but good responders contain first (isolate the attacker, preserve the evidence), then clean, then restore from known-good backups.",
      example: "alert storm -> find the ONE real incident -> isolate -> eradicate -> recover",
      returns: "Most alerts are noise; the skill is finding the real one fast and acting in the right order. Panic and wipe, and you destroy the evidence and maybe the business. Work the lifecycle, and you shut the attacker down cleanly, which is exactly what you will do here.",
    },
    learn: [
      "Triage the one real incident out of a flood of alerts.",
      "Make the containment call with a live attacker on the wire.",
      "Work the response lifecycle in the right order.",
      "Close the incident out safely, with the lessons captured.",
    ],
    engines: [
      { name: "Splunk (SIEM)", color: "#4ade80", blurb: "Collects logs from across an org and alerts on them: the SOC's radar screen.", here: true, icon: "server" },
      { name: "Microsoft Sentinel", color: "#5fe6ff", blurb: "A cloud SIEM with built-in automation for spotting and responding to attacks.", icon: "server" },
      { name: "CrowdStrike Falcon (EDR)", color: "#e5392f", blurb: "Watches every device for malicious behaviour and lets you isolate an infected one remotely.", icon: "shield" },
      { name: "Microsoft Defender (EDR)", color: "#8b7bff", blurb: "The endpoint-defence equivalent built into Windows environments.", icon: "shield" },
      { name: "SOAR + playbooks", color: "#ffb347", blurb: "Automates the repetitive response steps and runs a written recipe for each incident type.", icon: "tool" },
    ],
    headline: {
      masthead: "THE RECOVERY WIRE",
      dateline: "2017 · CONTEMPORARY REPORTING",
      title: "A worm wiped a shipping giant, and one server in Ghana saved it",
      body: "In 2017 the NotPetya worm tore through Maersk, the world's largest shipping company, wiping machines worldwide in minutes and freezing ports. Every one of its roughly 150 domain controllers was wiped, except one in a Ghana office that happened to be offline during a blackout. That single lucky backup seeded the rebuild. Staff rebuilt 4,000 servers and 45,000 PCs in about ten days; the hit was put at $250 to $300 million.",
      stat: "10 days",
      statLabel: "TO REBUILD 4,000 SERVERS",
      why: "Attacks are a matter of when, not if. How fast and how calmly you respond, and whether you have a clean backup, decides whether it's a bad week or the end of the business.",
    },
    realWorld:
      "Every organisation gets attacked; what separates a bad day from a catastrophe is the response. Incident response is detecting the real attack in a flood of alerts, containing it before it spreads, removing the attacker, and recovering from clean backups, all under pressure and against the clock. Done well it turns a breach into an incident report; done badly it turns one into a headline.",
    now: {
      stat: "$1.9M",
      statLabel: "saved per breach by teams that automate response (IBM 2025)",
      body: "Speed decides the cost. IBM's 2025 report found teams using AI and automation heavily cut their breach lifecycle by 80 days and saved $1.9 million per breach versus those that didn't. Responders work a standard lifecycle, prepare, detect, contain, eradicate, recover, learn, and the faster they move through it, the less it costs.",
    },
    recent: {
      year: "2024",
      title: "A bad update, a worldwide manual recovery",
      body: "In July 2024 a faulty security-software update from CrowdStrike crashed about 8.5 million Windows machines worldwide, grounding flights and downing hospitals and banks. The recovery was largely by hand: each machine had to be booted and fixed individually. A reminder that response and recovery, not just prevention, keep the world running.",
    },
    ahead:
      "AI is moving into the Security Operations Centre as auto-triage: AI agents sift the flood of alerts, build timelines and draft case summaries so human responders spend their time on the few threats that matter, which IBM links to big cuts in breach cost and time. The catch is that attackers use AI too, to move faster, so defenders increasingly have to automate just to keep pace.",
    role:
      "This is day-one knowledge for SOC analysts, incident responders and threat hunters. When an organisation is under attack, these are the people who stop the bleeding.",
    roles: ["SOC analyst", "Incident responder", "Threat hunter", "Security engineer"],
  },
  lesson: {
    blocks: [
      { h: "Incident response has a shape", body: "When a breach is underway you don't improvise - you follow a lifecycle: prepare, detect, contain, eradicate, recover, and lessons learned. The order matters enormously. The instinct to fix everything at once, or wipe it and start over, usually makes things worse. Calm, staged action is the whole discipline." },
      { h: "Detect and triage", body: "Real responses start buried in noise. A security team gets a flood of alerts, most of them harmless - a backup that ran, an antivirus doing its job, a user who mistyped a password. Triage is separating the one genuine incident from the false positives, fast, so you spend your minutes on the thing that's actually causing harm." },
      { h: "Contain before you cure", body: "The first priority once you've found a live attack is containment: stop the damage spreading without destroying what you'll need later. Block the attacker, isolate the affected account or host, kill their session. You are not yet trying to understand everything or rebuild anything - you're stopping the bleeding while preserving the evidence." },
      { h: "Eradicate, then recover", body: "Only once contained do you eradicate: remove every foothold - reset credentials, revoke all sessions - and close the vulnerability they used, or they'll just come back. Then recover from known-clean backups (never one taken during the breach, which may carry their implant), watch closely for a return, and run a lessons-learned review. Never destroy the logs; they're evidence and the source of the lessons." },
      { h: "Preparation is the real work", body: "The reason some teams handle a breach in minutes and others in months is almost entirely preparation. A written plan, known roles, tested backups, central logging, and the ability to revoke sessions and block addresses quickly are all built before anything happens. Teams rehearse with tabletop exercises so the stages are muscle memory. In the moment you execute a plan; you don't invent one." },
    ],
    Interactive: TriageLab,
    summary: [
      "IR follows a lifecycle: prepare, detect, contain, eradicate, recover, lessons learned - in order.",
      "Triage first: separate the one real incident from the flood of benign noise.",
      "Contain before you cure: stop the harm spreading without destroying evidence.",
      "Eradicate the foothold and close the hole, then recover from known-clean backups.",
      "Preparation (plan, backups, logging, tabletops) is what makes a response fast and calm.",
    ],
    check: {
      q: "Why contain a live attack before investigating the root cause?",
      options: [
        { text: "Containment stops the ongoing damage, so you can then investigate safely.", correct: true, feedback: "Right - stop the harm first (preserving evidence), then dig into why." },
        { text: "You should find the full root cause first, then contain once you understand it.", feedback: "Understanding matters, but not first - while you diagnose, the attacker keeps causing harm. Contain to stop the bleeding, then investigate why." },
        { text: "You should warn all affected customers before taking any technical action.", feedback: "Notifying people matters and may be legally required, but it doesn't stop a live attack - contain the harm first, then handle disclosure." },
        { text: "You should always wipe every affected machine before doing anything else.", feedback: "Wiping destroys evidence and causes outages - contain precisely, don't nuke." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems portal · live incident",
    inScope: "triage and response actions on the affected account/host; the consolidation clients in each drill",
    offLimits: "destroying logs/evidence, unneeded outages, retaliating against the source",
    timebox: "the incident window",
  },
  handler: "You're defending now, under pressure. Don't lunge for the big dramatic fix. Triage to the real incident, contain, then work the lifecycle in order - eradicate, recover, learn. Keep the evidence. Calm and staged beats fast and destructive every time.",
  hint: "Work the stages in order. Most alerts are noise - the real incident is the one causing active harm. Contain first (block + kill session), never wipe. Then order the lifecycle: contain, eradicate, recover, lessons. Keep the logs.",
  plan: [
    { label: "Triage", goal: "Separate the one real incident from the flood of benign alerts before you act." },
    { label: "Contain", goal: "The attacker's session is live and exporting data. Make the right first move." },
    { label: "Work the lifecycle", goal: "Session contained. Put the remaining response steps in the right order." },
    { label: "Close out", goal: "The threat is removed. Finish the incident properly, with the lessons captured." },
  ],
  Act: IncidentAct,
  flag: "flag{c0nt41n_th3n_3rad1cate}",
  defend: {
    blocks: [
      { h: "Preparation beats everything", body: "A breach is won or lost before it starts. A written incident-response plan with clear roles, backups you've actually tested restoring, central logging you can search, and the technical ability to revoke sessions and block addresses in seconds - that groundwork is what turns a potential catastrophe into a controlled, hours-long event. Buy the fancy firewall if you like, but the plan and the practice matter more." },
      { h: "Practise before it's real", body: "Teams run tabletop exercises - walking through a pretend breach exactly as you just did - so that when a real one hits, the lifecycle is muscle memory and nobody freezes. The calm, ordered response you just gave is a skill, and like any skill it comes from rehearsal. The worst time to first think about containment is during a live incident." },
      { h: "Close the loop", body: "The last phase feeds the first. Every incident's lessons-learned review should produce concrete changes - the vulnerability patched, detection improved so the next one is caught sooner, the plan updated where it slowed you down. An incident you don't learn from is one you'll repeat; done right, each response makes the next one faster." },
    ],
    Interactive: PrepLab,
    check: {
      q: "You've contained and removed the attacker. Which backup should you restore from?",
      options: [
        { text: "One from before the breach began - a newer backup may already contain the attacker's foothold and reinfect you.", correct: true, feedback: "Right - restore from a known-clean point before the intrusion. A backup made after they got in can carry their implant straight back." },
        { text: "Always pick the newest backup available, because that way you lose the least amount of data.", feedback: "The newest backup may have been taken after the attacker was already inside, so restoring it brings their foothold back. Clean beats recent." },
        { text: "Any backup is fine now that the threat has been removed from the live system.", feedback: "Not any - a backup taken after they got in can carry the foothold back. The restore point has to be known-clean, from before the breach." },
        { text: "There's no need for a backup - just rebuild the whole system from scratch instead.", feedback: "Rebuilding can clean the machine, but it needlessly discards all your data when a known-clean pre-breach backup would restore it safely." },
      ],
    },
  },
  finding: {
    title: "Live breach triaged, contained, eradicated, and recovered",
    where: "Harbour Systems portal · incident response engagement",
    severity: "High",
    cvss: "8.1",
    impact: "An active account-takeover breach was handled end to end: the real incident was triaged out of the noise, the attacker contained, their foothold eradicated and the entry vulnerability closed, systems recovered from clean backups, and a lessons-learned review run - with evidence preserved throughout.",
    fix: "Maintain a tested IR plan, central append-only logging, rapid session-revocation and IP-blocking, clean tested backups, and regular tabletop exercises so response is executed, not improvised.",
  },
  cheatsheet: {
    title: "Incident response quick reference",
    blurb: "The response lifecycle, how to get it right under pressure, and the tools that run it, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "Most of the job is telling a real incident from noise, fast. Here is the call on three typical alerts.",
      cols: ["the alert", "real incident?", "what to do"],
      rows: [
        ["failed logins, then a success, new country", "yes: account takeover", "contain: isolate + kill the session"],
        ["antivirus blocked a known test file", "no: noise", "note it, move on"],
        ["a backup job ran at 2am", "no: routine", "ignore"],
      ],
    },
    groups: [
      {
        heading: "The response lifecycle",
        entries: [
          { code: "prepare", what: "Before anything: have a plan, tested backups, logging and contacts ready.", example: "known-good backups + an on-call rota" },
          { code: "detect + triage", what: "Find the real incident in the noise, and judge how serious it is.", example: "the login success after a brute-force storm" },
          { code: "contain", what: "Stop it spreading FIRST: isolate the host, kill the session, block the account. Don't wipe yet.", example: "pull the machine off the network" },
          { code: "eradicate + recover", what: "Remove the attacker and their implants, then restore from known-clean backups.", example: "rebuild from a backup taken before the breach" },
        ],
      },
      {
        heading: "Getting it right under pressure",
        entries: [
          { code: "contain before you clean", what: "Wiping first destroys the evidence you need and may miss persistence.", example: "isolate, preserve, THEN eradicate" },
          { code: "preserve evidence", what: "Keep the logs and a copy of the affected systems for forensics and lessons.", example: "snapshot before you rebuild" },
          { code: "clean backups only", what: "Restore from a backup made BEFORE the compromise, or you reinfect yourself.", example: "the Ghana server that saved Maersk" },
          { code: "lessons learned", what: "After recovery, work out how it happened and fix the root cause.", example: "close the hole that let them in" },
        ],
      },
      {
        heading: "The tools",
        entries: [
          { code: "SIEM", what: "Collects logs from everywhere and alerts on suspicious activity: the SOC's radar.", example: "Splunk, Microsoft Sentinel" },
          { code: "EDR", what: "Watches every device for malicious behaviour and lets you isolate one remotely.", example: "CrowdStrike Falcon, Microsoft Defender" },
          { code: "SOAR + playbooks", what: "Automates the repetitive response steps and runs a written recipe for each incident type.", example: "auto-isolate a host on a high-confidence alert" },
          { code: "the SOC", what: "The security operations centre: the team watching the screens around the clock.", example: "analysts triaging alerts 24/7" },
        ],
      },
    ],
  },
  takeaway: "In a live breach, contain before you clean. Block and isolate the attacker first, preserve the evidence, recover only from known-clean backups.",
  outcome: [
    "Triage a flooded alert queue down to the one real incident and set the benign noise aside.",
    "Contain a live attacker first - block the source and kill the session - without destroying the evidence you will need.",
    "Run the incident lifecycle in order - contain, eradicate, recover, lessons learned - recovering only from known-clean backups.",
    "Prepare so a breach is handled in minutes, not months - a tested IR plan, central logging, clean backups and rehearsed tabletops.",
  ],
  rep: 65,
  repRank: "Lead Operator",
  repTo: "575 / 600 to Lead Operator",
  next: "NEXT MODULE · Social Engineering Defence →",
};

export default function Module12() {
  return <Engagement mod={MODULE12} />;
}

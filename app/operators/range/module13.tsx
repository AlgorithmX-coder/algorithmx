"use client";

/* Module 13 - Social Engineering Defence (DEPTH STANDARD, built to the M5
 * framework). ANALYSIS ONLY by design (the tier's ethical carve-out): the learner
 * spots cons and defends, and never authors or sends one. All messages modelled
 * in-browser. Shape mirrors M5: hover glossary, interactive lesson lab, de-biased
 * check, a FOUR-stage capture with a hint ladder, FOUR drills, and a capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "social engineering", definition: "Manipulating people into doing something unsafe - handing over a password, clicking a link, paying a fake invoice. It targets the person, not the system.", example: "A caller pretending to be from your bank talks you into reading out your one-time code - no hacking needed, just a convincing story." },
  { term: "phishing", definition: "Fake messages sent at scale to trick people into clicking a link or giving up credentials.", example: "A text claiming 'your parcel is held, pay 1.99 to release it' blasted to thousands of phones, hoping a few panic and enter their card details." },
  { term: "spear phishing", definition: "A phishing message tailored to one specific person or company, using real details to seem credible.", example: "An email to one pupil that names their actual school and form tutor is far more convincing than a generic 'Dear customer' blast." },
  { term: "pretexting", definition: "Inventing a believable story and role (a supplier, IT support, the CEO) to make a request seem legitimate.", example: "Someone phones reception claiming to be 'IT support fixing your email' and asks for your password - the helpful story is the con." },
  { term: "vishing", definition: "Social engineering by phone - a convincing caller pressuring you into acting before you can verify.", example: "A caller says they are from your bank's fraud team and need your code 'right now to stop a payment' - the rush is the giveaway." },
  { term: "CEO fraud", definition: "A pretext where the attacker poses as a senior leader to rush an employee into a payment or data transfer. Also called business email compromise.", example: "A new finance assistant gets an email that looks like it is from the CEO: 'I am in a meeting, urgently pay this supplier 40,000 and keep it quiet.'" },
  { term: "urgency", definition: "Manufactured time pressure ('in the next 2 hours') designed to stop you stopping to think.", example: "'Your account will be deleted in 24 hours unless you log in here' - the countdown exists to rush you past checking the link." },
  { term: "lookalike domain", definition: "A sender address that's almost-but-not-quite right (harbour-systems-security.com instead of harbour.range).", example: "An email from 'support@paypa1.com', with a number 1 standing in for the letter l, hoping you won't look closely at the spelling." },
  { term: "out-of-band verification", definition: "Confirming a request through a different, trusted channel - a phone call to a known number - rather than replying to the message.", example: "Got an email asking to change a supplier's bank details? Ring the supplier on the number you already had, not the one printed in the email." },
  { term: "DMARC", definition: "An email-authentication standard (with SPF and DKIM) that lets a domain block messages that spoof its address.", example: "With DMARC set up, an attacker's email pretending to come from your school's address gets binned before it ever reaches an inbox." },
  { term: "red flag", definition: "A tell that a message may be a con: urgency, authority, a lookalike sender, a mismatched link, an irreversible request.", example: "An 'urgent' email from 'the boss', sent from a lookalike address and demanding gift-card codes, stacks up four red flags at once." },
  { term: "report phishing", definition: "A one-click button that sends a suspicious message to the security team - turning every employee into a sensor.", example: "One employee hits the Report Phishing button on a dodgy email, and the security team pulls the same message from 200 other inboxes before anyone clicks." },
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

/* ── classify: two-bucket sort with per-item feedback ── */
type ClassItem = { label: string; a: boolean; note: string };
function ClassifySurface({ intro, items, optA, optB, hint, onSolved }: { intro: string; items: ClassItem[]; optA: { label: string; color: string }; optB: { label: string; color: string }; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, "a" | "b">>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const all = items.every((it) => pick[it.label]);
  function check() { setChecked(true); if (items.every((it) => (pick[it.label] === "a") === it.a)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// {intro}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => {
          const p = pick[it.label]; const right = checked && (p === "a") === it.a; const wrong = checked && p && (p === "a") !== it.a;
          return (
            <div key={it.label} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <span style={{ flex: "1 1 220px", fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>{it.label}</span>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "a" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "a" ? optA.color : C.line}`, background: "transparent", color: p === "a" ? optA.color : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>{optA.label}</button>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "b" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "b" ? optB.color : C.line}`, background: "transparent", color: p === "b" ? optB.color : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>{optB.label}</button>
              {checked && wrong && <div style={{ flexBasis: "100%", fontFamily: MONO, fontSize: 11.5, color: C.amber }}>↳ {it.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CHECK →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Read the tells again.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ All classified correctly.</div>}
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
  | { kind: "classify"; title: string; goal: string; intro: string; items: ClassItem[]; optA: { label: string; color: string }; optB: { label: string; color: string }; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "classify"
        ? <ClassifySurface intro={stage.intro} items={stage.items} optA={stage.optA} optB={stage.optB} hint={stage.hint} onSolved={onSolved} />
        : <DecisionCard decision={stage.decision} onSolved={onSolved} />}
    </div>
  );
}

const PHISH = { label: "phish", color: C.red };
const LEGIT = { label: "legit", color: C.green };
const FLAG = { label: "red flag", color: C.red };
const FINE = { label: "normal", color: C.green };

/* ───────────────────────── the main capture (Harbour inbox) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  { kind: "classify", title: "Triage", goal: "Stage 1 - Triage the inbox. Harbour forwarded messages staff received. Classify each as a phish or legitimate. You only analyse - never reply or send.",
    intro: "classify each message phish or legit", optA: PHISH, optB: LEGIT,
    items: [
      { label: "'IT Helpdesk' <it-support@harbour-systems-security.com>: URGENT, verify your password in 2 hours at a .ru link", a: true, note: "Lookalike domain, manufactured urgency, and a link to an unrelated site wanting your password. Credential phish." },
      { label: "Dana Okafor <dana.okafor@calderafreight.range>: 'Q3 route plan as discussed, no rush, reply if unclear'", a: false, note: "Known sender on the right domain, expected content, no credential request, no pressure. Legitimate." },
      { label: "'R. Fenwick (CEO)' <rfenwick.exec@gmail.com>: 'Buy GBP 500 of gift cards and send the codes, keep it between us'", a: true, note: "CEO fraud: personal Gmail, authority + urgency + secrecy, irreversible payment. Verify out-of-band." },
      { label: "Payroll <payroll@harbour.range>: 'Your payslip for this month is in the portal (log in as usual)'", a: false, note: "Correct domain, no link to a fake login, directs you to log in the normal way. Legitimate." },
    ],
    hint: "Two are cons: the 'IT helpdesk' lookalike-domain password link, and the 'CEO' gift-card request from a personal Gmail. The route-plan and payslip are genuine." },
  { kind: "classify", title: "Red flags", goal: "Stage 2 - Name the tells. Here's one suspicious email broken into parts. Mark each element a red flag or normal.",
    intro: "for this one email, which elements are red flags?", optA: FLAG, optB: FINE,
    items: [
      { label: "Sender: security@micros0ft-support.com", a: true, note: "A lookalike domain with a zero for an o - a red flag." },
      { label: "Subject: 'Action required within 1 hour or account suspended'", a: true, note: "Manufactured urgency - a red flag." },
      { label: "Greeting: 'Dear valued customer'", a: true, note: "Generic, impersonal greeting - mass phishing, not a real contact. A tell." },
      { label: "Link text says microsoft.com but points to bit.ly/x9f", a: true, note: "Mismatched link text and destination - a classic red flag." },
      { label: "The message is in plain English with no attachments", a: false, note: "Plain text with no attachment isn't itself suspicious - judge by the other tells." },
    ],
    hint: "Lookalike sender, urgency, generic greeting, and a mismatched link are all red flags. Plain text on its own is not." },
  { kind: "decision", title: "Verify", goal: "Stage 3 - The right move. You get the CEO gift-card request. What do you actually do?",
    decision: { prompt: "A message from the 'CEO' demands an urgent gift-card payment, in secret. Your move?", options: [
      { text: "Verify out-of-band: call the CEO on their known number before doing anything - and don't act on the secrecy demand.", correct: true, feedback: "Right. Out-of-band verification on a trusted channel defeats the con no matter how convincing it is." },
      { text: "Reply to the email to ask if it's really them.", feedback: "The attacker controls that thread - they'll just say yes. Verify through a separate, known channel." },
      { text: "Buy the gift cards quickly to avoid upsetting the CEO.", feedback: "That's exactly what the con relies on. Authority and urgency are the manipulation, not a reason to comply." },
      { text: "Forward it to colleagues to ask what they think.", feedback: "Wastes time and may spread it. Go straight to out-of-band verification, and report it." },
    ] } },
  { kind: "decision", title: "The tricky one", goal: "Stage 4 - The hard call. Not every unusual message is a con, and not every polished one is safe. Judge this one.",
    decision: { prompt: "An email from a real supplier's correct address says their bank details have changed; pay the next invoice to a new account. It's well written and expected. Do you pay?", options: [
      { text: "No - verify the new bank details out-of-band on a known supplier number first; changed payment details are a classic BEC even from a real address.", correct: true, feedback: "Right. A real address can be compromised, and a bank-detail change is the single highest-risk request. Always verify it out-of-band." },
      { text: "Yes - it's from their real address and the invoice was expected, so it's fine.", feedback: "A real address can be hijacked (business email compromise). The bank-detail change is exactly what you must verify independently." },
      { text: "Yes, but only if the email looks professional and has no typos.", feedback: "Polish is not proof - good attackers write well. Verify the detail change, not the formatting." },
      { text: "No - block the supplier and never deal with them again.", feedback: "Over-reaction. You don't cut off a real supplier; you verify the change through a known channel and proceed if it's genuine." },
    ] } },
];

function SocEngAct({ onCapture }: { onCapture: () => void }) {
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

/* ───────────────────────── lesson lab: phish or legit ───────────────────────── */

function SpotLab({ onDone }: { onDone: () => void }) {
  const [answer, setAnswer] = useState<null | boolean>(null);
  const correct = answer === true; // this one IS a phish
  useEffect(() => { if (correct) onDone(); }, [correct, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · phish or legit?</div>
      <div style={{ background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "11px 13px", marginBottom: 10 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>from: billing@paypa1-secure.com</div>
        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: C.ink, margin: "4px 0" }}>Your account is limited - confirm now</div>
        <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5 }}>Unusual activity detected. Confirm your card details within 24 hours at the link below or your account will be closed.</div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setAnswer(true)} className="co-opt" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${answer === true ? C.green : C.line}`, background: "transparent", color: C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>Phish</button>
        <button onClick={() => setAnswer(false)} className="co-opt" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${answer === false ? C.red : C.line}`, background: "transparent", color: C.soft, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>Legit</button>
      </div>
      {answer !== null && <div style={{ marginTop: 11, fontSize: 13, color: correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{correct ? "✓ Right - a lookalike domain (paypa1 with a one), urgency, and a card-detail request. Three tells stacked: a phish." : "Look again - the sender is 'paypa1' with a digit, it's urgent, and it wants your card details. That's a phish."}</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: best defence ───────────────────────── */

function BestDefenceLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: "Reply to the email asking 'is this really you?'", ok: false, why: "The attacker controls that thread - they'll just confirm. Verification has to happen on a separate, known channel." },
    { code: "Tell staff to be more careful and hope for the best", ok: false, why: "Vague fear doesn't work. You need concrete controls and a safe process, not just 'be careful'." },
    { code: "Require out-of-band verification for any money/credential request, plus DMARC, a report-phishing button, and blame-free training", ok: true, why: "Layered: process control for the con that lands, email authentication to block spoofing, reporting to catch the rest, and training to build the instinct. The real defence." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · how do you defend people against this?</div>
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
  { client: "Brightpost Media", brief: "Triage Brightpost's forwarded messages. No walkthrough.", stages: [{ kind: "classify", title: "Triage", goal: "Classify each message.", intro: "phish or legit?", optA: PHISH, optB: LEGIT, items: [ { label: "'Google' <no-reply@g00gle-security.com>: sign in to secure your account", a: true, note: "g00gle lookalike domain + credential bait = phish." }, { label: "A colleague you know: 'lunch at 1?'", a: false, note: "Known person, harmless request. Legit." } ], hint: "The lookalike-domain security mail is the phish." }], success: "Spotted the phish among the noise. Finding logged." },
  { client: "Tideway Council", brief: "Name the red flags in one email.", stages: [{ kind: "classify", title: "Red flags", goal: "Mark each element a red flag or normal.", intro: "which parts are tells?", optA: FLAG, optB: FINE, items: [ { label: "Sender uses a free webmail for an official notice", a: true, note: "Official bodies don't use free webmail - a tell." }, { label: "'Respond in 30 minutes or face a fine'", a: true, note: "Urgency + threat - a tell." }, { label: "Addressed to you by your correct name", a: false, note: "A correct name alone isn't a red flag (and spear-phishing can get it right)." } ], hint: "Free webmail for an official notice and a 30-minute threat are the tells." }], success: "Named the tells correctly. Finding logged." },
  { client: "Flux Fitness", brief: "A phone call this time. Make the call (so to speak). Trickier.", stages: [{ kind: "decision", title: "Vishing", goal: "Handle the suspicious phone call.", decision: { prompt: "Someone phones claiming to be IT and asks you to read out your login code to 'fix your account'. Your move?", options: [ { text: "Refuse, hang up, and call IT back on the official number to verify.", correct: true, feedback: "Right - never read out a code; verify out-of-band on a known number." }, { text: "Read it out - they said they're from IT.", feedback: "That's the con. Real IT never needs your code, and a claim of identity isn't proof." } ] } }], success: "Defeated a vishing call with out-of-band verification. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Triage, then make the verify call. Chain it yourself.", stages: [
    { kind: "classify", title: "Triage", goal: "Step 1: classify the messages.", intro: "phish or legit?", optA: PHISH, optB: LEGIT, items: [ { label: "'Finance' <fin@0akline.com>: update your payroll bank details here", a: true, note: "0akline lookalike + bank-detail change via link = phish." }, { label: "A newsletter you subscribed to", a: false, note: "Expected, benign. Legit." } ], hint: "The lookalike-domain payroll link is the phish." },
    { kind: "decision", title: "Verify", goal: "Step 2: what do you do about a bank-detail change request?", decision: { prompt: "A message asks to change payroll bank details. Your move?", options: [ { text: "Verify out-of-band with the person on a known number before changing anything.", correct: true, feedback: "Right - bank-detail changes are the highest-risk request; always verify independently." }, { text: "Make the change - it looked official.", feedback: "Looking official is not verification. Confirm out-of-band first." } ] } },
  ], success: "Triaged and verified correctly - the whole defensive chain. Finding logged." },
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
  { kind: "classify", title: "Triage", goal: "Sableline forwarded a batch of messages after a scare. Triage them.", intro: "phish or legit?", optA: PHISH, optB: LEGIT, items: [
    { label: "'HR' <hr@sableline-hr.net>: review the attached updated contract and sign in to confirm", a: true, note: "Lookalike domain + login bait = phish." },
    { label: "Your manager (correct address): 'nice work on the report'", a: false, note: "Known sender, benign. Legit." },
    { label: "'Bank' <alerts@secure-sableline-bank.com>: verify your card to avoid suspension", a: true, note: "Lookalike bank domain + urgency + card request = phish." },
  ], hint: "The two lookalike-domain login/card baits are phish; the manager's note is legit." },
  { kind: "classify", title: "Red flags", goal: "Name the tells in the worst of them.", intro: "which parts are red flags?", optA: FLAG, optB: FINE, items: [
    { label: "Sender domain sableline-hr.net (not sableline.range)", a: true, note: "Lookalike domain - a tell." },
    { label: "'Sign in to confirm' link", a: true, note: "Credential-harvest link - a tell." },
    { label: "References a real upcoming policy update", a: false, note: "A real detail can be used by spear-phishers; on its own it isn't a red flag - but it doesn't make the rest safe." },
  ], hint: "The lookalike domain and the sign-in link are the tells." },
  { kind: "decision", title: "Verify", goal: "Finish it: HR 'needs' you to confirm your login on that link. Your move?", decision: { prompt: "The HR-lookalike email wants you to sign in on its link to confirm a contract. Do you?", options: [
    { text: "No - don't use the link; verify with HR out-of-band and report the email.", correct: true, feedback: "Right - never authenticate via a link in an unsolicited message; verify through a known channel and report it." },
    { text: "Yes - sign in, since it's about your own contract.", feedback: "That's the trap - the link harvests your credentials. Verify out-of-band and go to the real portal yourself." },
    { text: "Reply asking HR to confirm it's genuine.", feedback: "The attacker may control that thread. Verify on a separate, known channel." },
  ] } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full triage · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}the_human_f1rewall_h3ld{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Triaged, named the tells, and verified instead of clicking - the human firewall held, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE13: ModuleDef = {
  code: "M-13",
  moduleNo: 13,
  title: "Social Engineering Defence",
  client: "Harbour Systems",
  brief:
    "A deep engagement defending the weakest link - people. The strongest systems still run on humans, and attackers know it. Harbour forwarded a batch of messages their staff received. Your job is purely to analyse and defend: triage the real from the cons, name exactly what gives each away, and make the right call on the dangerous ones. Then four field jobs for new clients, and a final challenge you run start to finish. You never write a con - you only learn to see them.",
  lesson: {
    blocks: [
      { h: "Hacking the human", body: "Social engineering is manipulating people into doing something unsafe - handing over a password, clicking a link, paying an invoice. It sidesteps every technical control because it targets the person, not the system. The best firewall in the world doesn't help if someone is talked into opening the door themselves." },
      { h: "Phishing and pretexting", body: "The two you'll meet most are phishing - fake messages sent at scale to harvest credentials or deliver malware - and pretexting, where the attacker invents a believable story and role (IT support, a supplier, the CEO) to make a request seem legitimate. Spear phishing is phishing tailored to you specifically, using real details to seem credible. On the phone it's called vishing." },
      { h: "The tells", body: "Cons share a fingerprint. Urgency and fear ('your account will be locked in 2 hours'). An authority you can't easily question ('the CEO needs this now'). A sender address that's almost-but-not-quite right, or a personal webmail standing in for a work one. A link whose text and real destination don't match. And a request that's irreversible - a password, a payment, gift-card codes. One tell is a reason to slow down; several together is a con." },
      { h: "The one habit that beats them", body: "Against the whole category, one habit wins: verify any sensitive request out-of-band. Don't reply to the message (the attacker controls that thread); confirm through a separate, trusted channel - a phone call to a known number. A bank-detail change, a payment, a credential request - verified independently, every con falls apart, no matter how convincing or how real the sender looks." },
      { h: "Why we only analyse", body: "In this course you learn to recognise and defend against social engineering - never to perform it. Technical attacks here happen against fake systems that can't be harmed; a person can be, so human-targeted manipulation stays strictly analysis-only. Spotting the con is the skill that matters, and it is entirely a defensive one." },
    ],
    Interactive: SpotLab,
    summary: [
      "Social engineering targets people, bypassing technical controls entirely.",
      "Phishing (at scale), spear phishing (targeted), pretexting and vishing are the common forms.",
      "The tells: urgency, authority, lookalike/personal sender, mismatched link, irreversible request.",
      "The winning habit: verify any sensitive request out-of-band on a known channel - never reply to the message.",
      "This module is analysis and defence only; you learn to see cons, never to run them.",
    ],
    check: {
      q: "Which combination most strongly signals a phishing email?",
      options: [
        { text: "Urgency, a lookalike or personal sender address, and a link requesting your password.", correct: true, feedback: "Right - that stack of tells is the classic credential phish." },
        { text: "A plain subject line and a familiar sender on the correct domain.", feedback: "That describes ordinary legitimate mail, not a phish." },
        { text: "An email that contains no links at all.", feedback: "Links aren't required for mail to be legitimate or malicious - judge by the tells, not link-presence alone." },
        { text: "A long message with several paragraphs.", feedback: "Length says nothing about intent; the tells (sender, urgency, request) are what matter." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems · forwarded staff messages (copies)",
    inScope: "analysing, classifying and judging the provided messages; the consolidation clients in each drill",
    offLimits: "crafting or sending any social-engineering message, contacting senders - analysis only",
    timebox: "this session",
  },
  handler: "You're defending people today, and you only analyse - never reply or send. Read each message and ask: who's it really from, what does it want, and how hard is it pushing? Name the tell on each, and on the dangerous ones, choose to verify out-of-band rather than act.",
  hint: "Work the stages in order. Lookalike/personal senders, urgency, mismatched links and irreversible requests are the tells. For any money or credential request, the right answer is always to verify out-of-band on a known number - never reply to the message.",
  Act: SocEngAct,
  flag: "flag{ph1sh_n0t_cl1cked}",
  defend: {
    blocks: [
      { h: "Make the human safer", body: "You can't patch people, but you can build guardrails. Email authentication (SPF, DKIM, DMARC) blocks a lot of spoofed senders. A banner on all external mail reminds staff to be careful. A one-click 'report phishing' button turns every employee into a sensor. And a firm rule that any money or credential request is verified out-of-band - a phone call on a known number - defeats CEO-fraud regardless of how convincing the message is." },
      { h: "Train the instinct, not the fear", body: "The goal isn't to make people paranoid; it's to make slowing-down automatic when the tells appear. Regular, blame-free awareness training and simulated-phishing exercises build that instinct. People who feel safe reporting a mistake report it fast - and fast reporting is what turns a near-miss into a non-event instead of a breach." },
      { h: "Assume one will land", body: "Enough messages, and eventually one gets a click - so defend in depth beyond the inbox. MFA means a phished password alone isn't enough. Least privilege limits what a compromised account can reach. And rehearsed reporting and response (the last two modules) contain the fallout fast. The human layer and the technical layers back each other up." },
    ],
    Interactive: BestDefenceLab,
    check: {
      q: "What best defends against a convincing CEO-fraud payment request?",
      options: [
        { text: "Verifying any money or credential request out-of-band on a known number before acting.", correct: true, feedback: "Right - out-of-band verification defeats the con no matter how convincing the message." },
        { text: "A stronger spam filter.", feedback: "Helps with bulk phishing, but a targeted, well-written request can slip through. You need a process control." },
        { text: "Replying to the email to ask if it's really them.", feedback: "The attacker controls that thread - they'll just say yes. Verify through a separate, known channel." },
        { text: "Telling staff to simply be more careful.", feedback: "Vague caution doesn't scale; a concrete out-of-band rule does." },
      ],
    },
  },
  finding: {
    title: "Phishing and pretexting reaching staff inboxes",
    where: "Harbour Systems · staff email · credential phish + CEO-fraud + supplier BEC",
    severity: "Medium",
    cvss: "5.3",
    impact: "Convincing phishing, CEO-fraud and supplier bank-change messages are reaching staff inboxes. A single click or compliant employee could hand over credentials or make an irreversible payment, bypassing technical controls entirely.",
    fix: "Enforce SPF/DKIM/DMARC, banner external mail, add a report-phishing button, mandate out-of-band verification for money/credential and bank-detail requests, require MFA, and run blame-free awareness training.",
  },
  rep: 50,
  repRank: "Lead Operator",
  repTo: "625 / 1000 to Principal",
  next: "NEXT MODULE · Disclosure & Reporting →",
};

export default function Module13() {
  return <Engagement mod={MODULE13} />;
}

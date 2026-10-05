"use client";

import { useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* A reusable classification game for the concept modules: read each real
 * item and drop it into the right category. It teaches the distinctions
 * that certificates test (CIA pillars, threat vs vuln vs risk, control
 * types) by making the learner decide, then explaining each answer. */
type Cat = { id: string; label: string; color: string };
type Item = { text: string; cat: string; why: string };

function SortGame({ categories, items, onDidTry, prompt }: LabProps & { categories: Cat[]; items: Item[]; prompt: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(() => items.filter((it, i) => answers[i] === it.cat).length, [answers, items]);
  const allDone = answeredCount === items.length;

  useEffect(() => { if (answeredCount >= 1) onDidTry(); }, [answeredCount, onDidTry]);

  const catOf = (id: string) => categories.find((c) => c.id === id)!;

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>{prompt}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it, i) => {
          const chosen = answers[i];
          const answered = chosen !== undefined;
          const correct = answered && chosen === it.cat;
          return (
            <div key={i} style={{ background: T.panel, border: `1px solid ${answered ? (correct ? `${T.green}66` : `${T.red}66`) : T.edge}`, borderRadius: 11, padding: "13px 15px" }}>
              <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.5, marginBottom: 11 }}>{it.text}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map((c) => {
                  const isChosen = chosen === c.id;
                  const isAnswer = c.id === it.cat;
                  let bg: string = T.panelSoft, bd: string = T.edge, fg: string = T.muted;
                  if (answered && isAnswer) { bg = T.greenSoft; bd = T.green; fg = T.ink; }
                  else if (answered && isChosen && !isAnswer) { bg = T.redSoft; bd = T.red; fg = T.ink; }
                  return (
                    <button key={c.id} disabled={answered}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: c.id }))}
                      style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: answered ? fg : c.color, background: bg, border: `1px solid ${answered ? bd : `${c.color}55`}`, borderRadius: 8, padding: "7px 12px", cursor: answered ? "default" : "pointer" }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div style={{ fontSize: 13, color: correct ? T.green : T.muted, marginTop: 10, lineHeight: 1.5 }}>
                  {correct ? "Correct. " : `Actually ${catOf(it.cat).label}. `}{it.why}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div style={{ marginTop: 14, background: correctCount === items.length ? T.greenSoft : T.cyanSoft, border: `1px solid ${correctCount === items.length ? `${T.green}66` : `${T.cyan}55`}`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body }}>
          You sorted {correctCount} of {items.length} correctly. The point is not the score, it is that you can now tell these apart, which is exactly what the exams (and the job) test.
        </div>
      )}
    </div>
  );
}

/* ---- Module 1 labs (thin configs over the shared engine) ---- */

const CIA: Cat[] = [
  { id: "c", label: "Confidentiality", color: T.cyan },
  { id: "i", label: "Integrity", color: T.amber },
  { id: "a", label: "Availability", color: T.green },
];
export function CiaLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={CIA} prompt="Each line is a real kind of incident. Which part of the CIA triad does it break?" items={[
    { text: "A leaked database dumps millions of customers' names and passwords online.", cat: "c", why: "Secret data was seen by people who should not see it." },
    { text: "Ransomware encrypts a hospital's files so staff cannot open any records.", cat: "a", why: "The data is still there, but nobody can get to it when they need it." },
    { text: "An attacker quietly changes the bank balance in an account.", cat: "i", why: "The data is still readable, but it is no longer trustworthy or correct." },
    { text: "A DDoS flood knocks a shop's website offline during a sale.", cat: "a", why: "The service is unreachable, so its availability is what failed." },
    { text: "Someone alters the delivery address on an order after it is placed.", cat: "i", why: "The record was tampered with, so its integrity is broken." },
    { text: "A misconfigured server lets anyone read private medical documents.", cat: "c", why: "Confidential information was exposed to the wrong people." },
  ]} />;
}

const RVR: Cat[] = [
  { id: "t", label: "Threat", color: T.red },
  { id: "v", label: "Vulnerability", color: T.amber },
  { id: "r", label: "Risk", color: T.cyan },
];
export function RiskLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={RVR} prompt="Threat, vulnerability, or risk? A threat is who or what could harm you; a vulnerability is the weakness they could use; risk is the chance and impact of the two meeting." items={[
    { text: "A ransomware gang that targets hospitals.", cat: "t", why: "It is the actor that could cause harm: a threat." },
    { text: "A server running software that has not been patched for a known flaw.", cat: "v", why: "It is the weakness an attacker could exploit: a vulnerability." },
    { text: "The chance that the gang exploits that unpatched server and shuts the hospital down.", cat: "r", why: "Risk is threat meeting vulnerability, weighed by how likely and how bad." },
    { text: "An employee who reuses the same password everywhere.", cat: "v", why: "It is a weakness in your defences, not an attacker: a vulnerability." },
    { text: "A disgruntled insider with access to customer data.", cat: "t", why: "A person who could cause harm is a threat." },
    { text: "The likelihood and cost of a data leak if that reused password is breached.", cat: "r", why: "Combining the threat, the weakness, and the impact gives you risk." },
  ]} />;
}

const CTRL: Cat[] = [
  { id: "p", label: "Preventive", color: T.primary },
  { id: "d", label: "Detective", color: T.cyan },
  { id: "c", label: "Corrective", color: T.green },
];
export function ControlLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={CTRL} prompt="Sort each control. Preventive stops it happening; detective spots it happening; corrective fixes it afterwards." items={[
    { text: "A firewall that blocks unwanted traffic before it reaches a server.", cat: "p", why: "It stops the bad thing before it happens: preventive." },
    { text: "A CCTV camera and alarm that flag someone at the back door.", cat: "d", why: "It notices something happening: detective." },
    { text: "Restoring files from a clean backup after a ransomware attack.", cat: "c", why: "It puts things right after the event: corrective." },
    { text: "Requiring MFA so a stolen password alone cannot log in.", cat: "p", why: "It prevents the takeover in the first place: preventive." },
    { text: "A SIEM alert that fires when 500 logins fail in a minute.", cat: "d", why: "It detects the attack in progress: detective." },
    { text: "A tested incident-response plan that isolates and rebuilds an infected machine.", cat: "c", why: "It corrects and recovers after the incident: corrective." },
  ]} />;
}

const LAYER: Cat[] = [
  { id: "peo", label: "People", color: T.amber },
  { id: "net", label: "Network", color: T.cyan },
  { id: "dat", label: "Data", color: T.green },
];
export function LayersLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={LAYER} prompt="Defence in depth means layers, so no single failure lets an attacker win. Which layer does each control sit in?" items={[
    { text: "Security-awareness training so staff spot phishing emails.", cat: "peo", why: "It strengthens the human layer: people." },
    { text: "Splitting the network so an infected laptop cannot reach the servers.", cat: "net", why: "Segmentation is a network-layer control." },
    { text: "Encrypting the customer database so a stolen copy is unreadable.", cat: "dat", why: "It protects the information itself: the data layer." },
    { text: "A simulated phishing test that teaches people what to click and report.", cat: "peo", why: "It targets human behaviour: the people layer." },
    { text: "A firewall between the office Wi-Fi and the payment systems.", cat: "net", why: "It controls traffic between network zones: network layer." },
    { text: "Least-privilege access so a leaked account can only reach a little.", cat: "dat", why: "It limits what the account can touch: protecting the data." },
  ]} />;
}

const MIND: Cat[] = [
  { id: "atk", label: "Attacker thinking", color: T.red },
  { id: "def", label: "Defender thinking", color: T.cyan },
];
export function MindsetLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={MIND} prompt="Security needs both mindsets. Which one is each thought?" items={[
    { text: "'What is the easiest, cheapest way into this company?'", cat: "atk", why: "Attackers look for the path of least resistance." },
    { text: "'Assume they will get in somewhere; how do I limit the damage?'", cat: "def", why: "Assume-breach is the modern defender's starting point." },
    { text: "'Which employee is most likely to click a link if I rush them?'", cat: "atk", why: "Attackers target the human, and use urgency." },
    { text: "'If this one account is stolen, what can it actually reach?'", cat: "def", why: "Shrinking the blast radius is defensive thinking." },
    { text: "'What did they forget to patch, and what still runs old software?'", cat: "atk", why: "Attackers hunt for the neglected weak spot." },
    { text: "'Where would an alert tell me first that something is wrong?'", cat: "def", why: "Defenders build in detection and early warning." },
  ]} />;
}

/* ---- ScenarioGame: a short branching decision, one choice at a time ---- */
type ScenarioStep = { role: string; prompt: string; options: { text: string; correct: boolean; why: string }[] };

function ScenarioGame({ steps, intro, onDidTry, doneKicker = "Played out", doneNote = "You switched between the attacker's and the defender's head at each step. That is the exact habit this whole course builds." }: LabProps & { steps: ScenarioStep[]; intro: string; doneKicker?: string; doneNote?: string }) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const pick = (oi: number) => { if (chosen === null) { setChosen(oi); onDidTry(); } };
  const advance = () => { if (i + 1 >= steps.length) { setFinished(true); } else { setI(i + 1); setChosen(null); } };

  if (finished) {
    return (
      <div style={{ fontFamily: T.sans, background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.green, marginBottom: 6 }}>{doneKicker}</div>
        <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.55 }}>{doneNote}</div>
      </div>
    );
  }

  const step = steps[i];
  const answered = chosen !== null;
  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>{intro}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {steps.map((_, k) => <span key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k < i ? T.green : k === i ? T.cyan : T.edge }} />)}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.cyan, marginBottom: 8 }}>{step.role}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, lineHeight: 1.4, marginBottom: 14 }}>{step.prompt}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {step.options.map((o, oi) => {
          const isChosen = chosen === oi;
          let bg: string = T.panel, bd: string = T.edge;
          if (answered && o.correct) { bg = T.greenSoft; bd = T.green; }
          else if (answered && isChosen && !o.correct) { bg = T.redSoft; bd = T.red; }
          return (
            <button key={oi} onClick={() => pick(oi)} disabled={answered}
              style={{ textAlign: "left", fontFamily: T.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: T.ink, background: bg, border: `1px solid ${bd}`, borderRadius: 10, padding: "12px 15px", cursor: answered ? "default" : "pointer" }}>
              {o.text}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 12, fontSize: 13.5, color: T.body, lineHeight: 1.55, background: T.panelSoft, borderLeft: `3px solid ${step.options[chosen].correct ? T.green : T.amber}`, borderRadius: "0 8px 8px 0", padding: "11px 15px" }}>
          {step.options[chosen].why}
        </div>
      )}
      {answered && (
        <button onClick={advance} style={{ marginTop: 14, fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "10px 20px", cursor: "pointer" }}>
          {i + 1 >= steps.length ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}

export function MindsetScenarioLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry} intro="Play it out. First you think like the attacker, then like the defender. There is a best answer each time, with the reasoning." steps={[
    { role: "You're the attacker", prompt: "You want inside a mid-sized company. Where do you start?", options: [
      { text: "Send a convincing, urgent email to a busy employee and hope they click.", correct: true, why: "Attackers go for the easiest door, and a rushed person is it. This is how most real breaches begin." },
      { text: "Brute-force your way through the company firewall.", correct: false, why: "Modern firewalls are hard and noisy to attack. Real attackers skip the strong wall and target the weak person." },
      { text: "Guess the CEO's password from the company website.", correct: false, why: "Slow and rarely works. The reliable way in is almost always a person, not a lucky guess." },
    ] },
    { role: "Now you're the defender", prompt: "You know phishing is the likely way in. What protects you best?", options: [
      { text: "MFA on every account, plus training so staff spot and report phishing.", correct: true, why: "MFA means a stolen password alone fails, and training lowers the click rate. Good defence assumes some emails get through." },
      { text: "Just make the minimum password longer.", correct: false, why: "Helps a little, but does nothing once a password is phished. MFA is what stops the stolen-password login." },
      { text: "Tell staff to simply never make a mistake.", correct: false, why: "People will click sometimes. Real defence plans for that instead of wishing it away." },
    ] },
    { role: "The worst happens", prompt: "One employee's laptop gets infected anyway. What limits the damage most?", options: [
      { text: "Least privilege and segmentation, so that laptop can reach very little.", correct: true, why: "Assume-breach in action: when one machine falls, tight access and segmentation stop it spreading. This is the defender's real edge." },
      { text: "Hope the antivirus catches it eventually.", correct: false, why: "Hope is not a plan. You design so one infection is contained, not catastrophic." },
      { text: "Unplug the whole company from the internet.", correct: false, why: "That stops the business too. The goal is to shrink the blast radius, not shut everything down." },
    ] },
  ]} />;
}

/* ---- OrderGame: put the items in the right order (up/down, no drag) ---- */
type OrderItem = { label: string; note: string };

function OrderGame({ items, prompt, onDidTry, doneNote = "Perfect. That is defence in depth: layer after layer." }: LabProps & { items: OrderItem[]; prompt: string; doneNote?: string }) {
  // `items` is the correct order; start from a fixed scramble (reversed) so
  // SSR and the client agree (no random on first render).
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => items.length - 1 - i));
  const [checked, setChecked] = useState(false);

  const move = (pos: number, dir: -1 | 1) => {
    const to = pos + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[pos], next[to]] = [next[to], next[pos]];
    setOrder(next);
    setChecked(false);
    onDidTry();
  };
  const correctCount = order.filter((idx, pos) => idx === pos).length;

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>{prompt}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {order.map((idx, pos) => {
          const it = items[idx];
          const right = checked && idx === pos;
          const wrong = checked && idx !== pos;
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, background: right ? T.greenSoft : wrong ? T.redSoft : T.panel, border: `1px solid ${right ? T.green : wrong ? `${T.red}66` : T.edge}`, borderRadius: 11, padding: "11px 13px" }}>
              <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.faint, width: 18, flexShrink: 0 }}>{pos + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{it.label}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>{it.note}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                <button aria-label="Move up" onClick={() => move(pos, -1)} disabled={pos === 0} style={{ width: 28, height: 22, borderRadius: 6, background: T.panelSoft, border: `1px solid ${T.edge}`, color: pos === 0 ? T.faint : T.body, cursor: pos === 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 15l-6-6-6 6" /></svg>
                </button>
                <button aria-label="Move down" onClick={() => move(pos, 1)} disabled={pos === order.length - 1} style={{ width: 28, height: 22, borderRadius: 6, background: T.panelSoft, border: `1px solid ${T.edge}`, color: pos === order.length - 1 ? T.faint : T.body, cursor: pos === order.length - 1 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button onClick={() => setChecked(true)} style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "10px 20px", cursor: "pointer" }}>Check the order</button>
        {checked && <span style={{ fontSize: 13.5, color: correctCount === items.length ? T.green : T.muted }}>{correctCount === items.length ? doneNote : `${correctCount} of ${items.length} in the right place. Use the arrows and check again.`}</span>}
      </div>
    </div>
  );
}

export function DefenceOrderLab({ onDidTry }: LabProps) {
  return <OrderGame onDidTry={onDidTry} prompt="An attacker on the internet wants your customer database. Defence in depth means layers. Put these defences in the order the attacker would have to beat them, from the outside in." items={[
    { label: "Firewall at the edge", note: "Blocks unwanted traffic before it reaches anything inside." },
    { label: "Network segmentation", note: "Even once inside, the attacker cannot freely reach the servers." },
    { label: "A hardened server", note: "No spare software or open doors left to exploit." },
    { label: "Least-privilege access", note: "A stolen account can touch very little." },
    { label: "Encrypted data", note: "Even a stolen copy of the database is unreadable." },
  ]} />;
}

/* ---- ComposeGame: assemble a risk from a threat and a weakness ---- */
type ComposeCase = { outcome: string; threat: string; weakness: string; why: string };

function ComposeGame({ threats, weaknesses, cases, prompt, onDidTry }: LabProps & { threats: string[]; weaknesses: string[]; cases: ComposeCase[]; prompt: string }) {
  const [picks, setPicks] = useState<Record<number, { t?: string; w?: string }>>({});
  const started = Object.keys(picks).length;
  useEffect(() => { if (started >= 1) onDidTry(); }, [started, onDidTry]);

  const chip = (label: string, sel: string | undefined, correct: string, both: boolean, accent: string, onClick: () => void, locked: boolean) => {
    let bg: string = T.panelSoft, bd: string = T.edge, fg: string = T.body;
    if (both && label === correct) { bg = T.greenSoft; bd = T.green; fg = T.ink; }
    else if (both && sel === label) { bg = T.redSoft; bd = T.red; fg = T.ink; }
    else if (!both && sel === label) { bg = `${accent}22`; bd = accent; fg = T.ink; }
    return <button key={label} onClick={onClick} disabled={locked} style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: fg, background: bg, border: `1px solid ${bd}`, borderRadius: 8, padding: "8px 12px", cursor: locked ? "default" : "pointer", textAlign: "left" }}>{label}</button>;
  };

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>{prompt}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cases.map((c, i) => {
          const p = picks[i] ?? {};
          const both = !!(p.t && p.w);
          const correct = both && p.t === c.threat && p.w === c.weakness;
          const setV = (key: "t" | "w", v: string) => { if (!correct) setPicks((prev) => ({ ...prev, [i]: { ...prev[i], [key]: v } })); };
          return (
            <div key={i} style={{ background: T.panel, border: `1px solid ${both ? (correct ? `${T.green}66` : `${T.red}66`) : T.edge}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.5, marginBottom: 13 }}><span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.cyan }}>THE RISK &nbsp;</span>{c.outcome}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: T.red, marginBottom: 7 }}>Pick the threat</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 13 }}>{threats.map((t) => chip(t, p.t, c.threat, both, T.red, () => setV("t", t), correct))}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: T.amber, marginBottom: 7 }}>Pick the weakness it uses</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{weaknesses.map((w) => chip(w, p.w, c.weakness, both, T.amber, () => setV("w", w), correct))}</div>
              {both && (
                <div style={{ marginTop: 12, fontSize: 13.5, color: correct ? T.green : T.muted, lineHeight: 1.5 }}>
                  {correct ? "Assembled. " : "Not quite, try again. "}{c.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RiskBuilderLab({ onDidTry }: LabProps) {
  return <ComposeGame onDidTry={onDidTry}
    prompt="Every risk is a threat meeting a weakness. For each one below, pick the threat, then the weakness that lets it happen."
    threats={["A ransomware gang", "A credential-stuffing crew", "A careless insider"]}
    weaknesses={["Servers missing a security update", "Staff who reuse passwords", "No offline backups"]}
    cases={[
      { outcome: "Attackers log straight into staff accounts using passwords leaked from other websites.", threat: "A credential-stuffing crew", weakness: "Staff who reuse passwords", why: "The crew tries leaked email-and-password pairs everywhere, and reuse means one old leak unlocks your accounts too." },
      { outcome: "A known flaw is exploited weeks after a fix was already available.", threat: "A ransomware gang", weakness: "Servers missing a security update", why: "The gang scans the internet for unpatched systems; a fix you have but never applied is an open door." },
      { outcome: "One careless click deletes critical files, and there is no clean copy to restore.", threat: "A careless insider", weakness: "No offline backups", why: "Mistakes happen; with no offline backup there is simply nothing to recover to." },
    ]} />;
}

/* ---- MatchGame: tap an item, then tap the category it belongs to ---- */
function MatchGame({ categories, items, prompt, onDidTry }: LabProps & { categories: Cat[]; items: Item[]; prompt: string }) {
  const [assign, setAssign] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const started = Object.keys(assign).length;
  useEffect(() => { if (started >= 1) onDidTry(); }, [started, onDidTry]);

  const allAssigned = items.every((_, i) => assign[i]);
  const correctCount = items.filter((it, i) => assign[i] === it.cat).length;
  const catOf = (id: string) => categories.find((c) => c.id === id);

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>{prompt}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {items.map((it, i) => {
          const cat = assign[i];
          const c = cat ? catOf(cat) : undefined;
          const right = checked && cat === it.cat;
          const wrong = checked && cat !== undefined && cat !== it.cat;
          const border = sel === i ? T.cyan : right ? T.green : wrong ? T.red : T.edge;
          return (
            <div key={i}>
              <button onClick={() => !checked && setSel(sel === i ? null : i)} disabled={checked}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: sel === i ? T.cyanSoft : right ? T.greenSoft : wrong ? T.redSoft : T.panel, border: `1px solid ${border}`, borderRadius: 10, padding: "11px 14px", cursor: checked ? "default" : "pointer" }}>
                <span style={{ fontSize: 14.5, color: T.ink }}>{it.text}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: c ? c.color : (sel === i ? T.cyan : T.faint), whiteSpace: "nowrap", flexShrink: 0 }}>{c ? c.label : (sel === i ? "pick a job ↓" : "tap")}</span>
              </button>
              {checked && wrong && <div style={{ fontSize: 12.5, color: T.muted, margin: "4px 0 2px 4px" }}>Actually {catOf(it.cat)?.label}. {it.why}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {categories.map((c) => (
          <button key={c.id} onClick={() => { if (sel !== null && !checked) { setAssign((a) => ({ ...a, [sel]: c.id })); setSel(null); } }} disabled={sel === null || checked}
            style={{ flex: "1 1 120px", fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: sel === null ? T.faint : c.color, background: sel === null ? T.panelSoft : `${c.color}18`, border: `1px solid ${sel === null ? T.edge : `${c.color}66`}`, borderRadius: 9, padding: "10px 12px", cursor: sel === null || checked ? "default" : "pointer" }}>{c.label}</button>
        ))}
      </div>
      {allAssigned && !checked && (
        <button onClick={() => setChecked(true)} style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "10px 20px", cursor: "pointer" }}>Check the matches</button>
      )}
      {checked && (
        <div style={{ fontSize: 14, color: correctCount === items.length ? T.green : T.muted }}>You matched {correctCount} of {items.length}. {correctCount === items.length ? "Every control has a job, and a good defence uses all three." : "Re-read the ones marked, then remember: prevent, detect, correct."}</div>
      )}
    </div>
  );
}

/* ---- Module 2 labs: how the internet actually works ---- */

export function JourneyOrderLab({ onDidTry }: LabProps) {
  return <OrderGame onDidTry={onDidTry}
    prompt="You tap send on a message. Put the journey in the order it really happens, from your hand to the far server."
    doneNote="Perfect. Every email, page and video makes exactly this trip, usually in well under a second."
    items={[
      { label: "Your device chops the message into packets", note: "Each packet carries a piece of the data plus the address it is going to." },
      { label: "Your router passes them to your internet provider", note: "The first hop out of your home or office network." },
      { label: "Routers across the internet pass them hop by hop", note: "Each router reads the destination address and forwards the packet onwards. Networks share their routes with each other so every router knows a way." },
      { label: "The destination network delivers them to the server", note: "The packets arrive, possibly by different paths and out of order." },
      { label: "The server reassembles the packets and replies", note: "The reply makes the same kind of journey straight back to you." },
    ]} />;
}

export function DnsScenarioLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="Play the lookup out, one step at a time. You are the browser, then the resolver, then the browser again."
    doneKicker="Resolved"
    doneNote="That whole chain, cache, resolver, root, the site's own name server, runs in milliseconds, every time anyone opens any website. And because everything depends on it, attacking it is attacking everything."
    steps={[
      { role: "You're the browser", prompt: "Someone types a website's name and hits enter. Names mean nothing to the network, it routes by IP address. What do you do first?", options: [
        { text: "Check whether you already know this name's address from a recent visit.", correct: true, why: "Caching first: if you looked this name up recently, you reuse the answer and skip the whole journey. The web would crawl without it." },
        { text: "Send the message to the name and hope the routers work it out.", correct: false, why: "Routers only understand IP addresses. Until the name becomes a number, nothing can be sent anywhere." },
        { text: "Ask the website for its own address.", correct: false, why: "You cannot ask a server you cannot yet reach. That is the chicken-and-egg problem DNS exists to solve." },
      ] },
      { role: "You're the resolver", prompt: "The browser had nothing cached, so it asked you, the DNS resolver. You have never seen this name either. Who do you ask?", options: [
        { text: "Start at the root servers, which point you to the right registry, which points you to the site's own name server.", correct: true, why: "DNS is a hierarchy: the root knows who runs .com or .io, that registry knows who answers for the site, and the site's own name server holds the actual address." },
        { text: "Broadcast the question to every server on the internet.", correct: false, why: "Billions of machines cannot all be asked. The hierarchy exists precisely so three targeted questions replace billions." },
        { text: "Guess an address that looks about right.", correct: false, why: "A guessed address would send someone's banking login to a stranger's machine. Answers must come from the servers authorised to give them." },
      ] },
      { role: "You're the browser again", prompt: "The answer comes back: the name maps to 76.76.21.21. What happens now?", options: [
        { text: "Connect to that IP address and start the real conversation.", correct: true, why: "DNS's job is done: name in, number out. Now the packets can actually be addressed and the page can load. Notice what this means: whoever controls your DNS answers controls where you go." },
        { text: "Show the user the number and ask them to confirm it.", correct: false, why: "Users never see this layer, which is exactly why a poisoned answer is so dangerous: everything looks normal while you are sent to the wrong machine." },
        { text: "Look the name up a second time to be sure.", correct: false, why: "The answer is cached and used. Fast, but it also means a bad answer, once cached, keeps misdirecting people until it expires." },
      ] },
    ]} />;
}

const HTTPS_EXPOSURE: Cat[] = [
  { id: "http", label: "Anyone on the network can read it (HTTP)", color: T.red },
  { id: "tls", label: "Encrypted by HTTPS", color: T.green },
  { id: "meta", label: "Visible even with HTTPS", color: T.amber },
];
export function HttpsExposureLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={HTTPS_EXPOSURE}
    prompt="You are on café Wi-Fi. For each item, decide what a stranger running a sniffer on that network can see."
    items={[
      { text: "The password you type into a login form served over plain HTTP.", cat: "http", why: "Plain HTTP is a postcard: every word, passwords included, crosses the network readable by anyone on it." },
      { text: "Your card number on a checkout page served over HTTPS.", cat: "tls", why: "HTTPS encrypts the conversation end to end, so the sniffer sees scrambled bytes, not your card." },
      { text: "Which website you are connecting to.", cat: "meta", why: "HTTPS hides what you say, not who you are talking to. The destination of your connection is still visible to the network." },
      { text: "The session cookie a site sends you over plain HTTP.", cat: "http", why: "On HTTP the cookie crosses the network in the clear. Cookies prove who you are, which is why they must only ever travel encrypted." },
      { text: "The exact pages you read and the forms you fill on an HTTPS site.", cat: "tls", why: "The content, paths and form data are all inside the encrypted channel." },
      { text: "The fact that you are online and roughly how much data you are sending.", cat: "meta", why: "Traffic patterns are always observable. Encryption protects content, not the existence of the conversation." },
    ]} />;
}

const PORT_JOBS: Cat[] = [
  { id: "web", label: "Serving websites", color: T.cyan },
  { id: "mail", label: "Moving email", color: T.amber },
  { id: "remote", label: "Remote control", color: T.red },
  { id: "names", label: "Finding addresses", color: T.green },
];
export function PortMatchLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={PORT_JOBS}
    prompt="A port is a numbered door, and each service listens behind a well-known one. Tap a door, then tap the job behind it. These exact pairings come up in interviews and on Security+."
    items={[
      { text: "Port 443 - HTTPS", cat: "web", why: "Encrypted web traffic: the padlock pages." },
      { text: "Port 80 - HTTP", cat: "web", why: "Unencrypted web traffic, the older open door." },
      { text: "Port 25 - SMTP", cat: "mail", why: "SMTP is how mail servers pass email between them." },
      { text: "Port 22 - SSH", cat: "remote", why: "Encrypted remote command line, how admins drive servers." },
      { text: "Port 3389 - RDP", cat: "remote", why: "Remote desktop. Left open to the internet, it is one of the most attacked doors there is." },
      { text: "Port 53 - DNS", cat: "names", why: "The lookup service itself: names in, addresses out." },
    ]} />;
}

const FLOW_STAGE: Cat[] = [
  { id: "lookup", label: "The lookup", color: T.amber },
  { id: "journey", label: "The journey", color: T.cyan },
  { id: "dest", label: "The destination", color: T.red },
];
export function AttackStageLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={FLOW_STAGE}
    prompt="Every attack targets a stage of the flow you now know: the lookup (turning the name into an address), the journey (the packets in transit), or the destination (the server itself). Place each one."
    items={[
      { text: "Poisoning a resolver's cache so a bank's name returns the attacker's address.", cat: "lookup", why: "The name-to-address step is corrupted, so every later step faithfully delivers you to the wrong place." },
      { text: "Hijacking internet routes so traffic for a service flows through the attacker's network.", cat: "journey", why: "The routers' shared map of routes is abused, moving the packets' path itself. This is what a BGP hijack does." },
      { text: "A fake 'free Wi-Fi' hotspot that quietly reads everything passing through it.", cat: "journey", why: "An evil twin puts the attacker on the packets' path: a classic man-in-the-middle position." },
      { text: "Flooding a website with so much junk traffic that real visitors cannot get through.", cat: "dest", why: "A DDoS attacks the destination's availability. The lookup and journey work fine, the server just drowns." },
      { text: "Sending a crafted login that tricks the server's database into dumping its tables.", cat: "dest", why: "SQL injection attacks the server's own code at the destination. Module 9 lets you run one for real." },
      { text: "Registering a look-alike name so a typo delivers people to a copy of the real site.", cat: "lookup", why: "Typosquatting attacks the naming step before DNS even resolves: the wrong name resolves perfectly." },
    ]} />;
}

export function ControlMatchLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={CTRL}
    prompt="Tap a control, then tap the job it does. Prevent stops it, detect spots it, correct puts it right."
    items={[
      { text: "A firewall that blocks bad traffic before it arrives", cat: "p", why: "It stops the bad thing before it happens: preventive." },
      { text: "A CCTV camera and alarm that flag a break-in", cat: "d", why: "It notices something happening: detective." },
      { text: "Restoring files from a clean backup after ransomware", cat: "c", why: "It puts things right after the event: corrective." },
      { text: "Requiring MFA so a stolen password alone cannot log in", cat: "p", why: "It prevents the takeover in the first place: preventive." },
      { text: "A SIEM alert when 500 logins fail in a minute", cat: "d", why: "It detects the attack in progress: detective." },
      { text: "An incident-response plan that isolates and rebuilds a machine", cat: "c", why: "It corrects and recovers after the incident: corrective." },
    ]} />;
}

/* ---- Module 5 labs: law, ethics & your first audit ---- */

const LEGAL_LINE: Cat[] = [
  { id: "ok", label: "Lawful", color: T.green },
  { id: "cma", label: "Computer Misuse Act offence", color: T.red },
];
export function LegalLineLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={LEGAL_LINE}
    prompt="The line is authorisation, not skill or intent to help. For each action, decide: lawful, or a Computer Misuse Act 1990 offence? Assume no permission unless it is stated."
    items={[
      { text: "Running a password-cracking tool against your own test account on your own laptop.", cat: "ok", why: "Your systems, your permission. This is exactly how you are meant to practise." },
      { text: "Trying a few guessed passwords on a stranger's email account to prove it is weak.", cat: "cma", why: "Unauthorised access, even just attempting it, is a section 1 offence. Good intentions do not grant permission." },
      { text: "Typing a web address by hand to poke at folders on a site you do not run, 'just to look'.", cat: "cma", why: "This is the Daniel Cuthbert line: deliberately probing someone else's system without authorisation is unauthorised access, however curious you are." },
      { text: "Testing a company's website for flaws because you were hired and have a signed scope.", cat: "ok", why: "Authorised testing within an agreed scope is lawful and is the job itself." },
      { text: "Logging into a friend's social media 'as a joke' using a password they once told you.", cat: "cma", why: "Knowing the password is not the same as being authorised to use the account. It is still unauthorised access." },
      { text: "Launching traffic to knock a game server offline because you are losing.", cat: "cma", why: "Impairing a computer's operation (a denial-of-service attack) is a section 3 offence, and a serious one." },
      { text: "Reading a security researcher's published write-up and trying the technique on your own VM.", cat: "ok", why: "Learning on systems you own is encouraged. The technique is not illegal; using it without authorisation is." },
    ]} />;
}

const GDPR_DATA: Cat[] = [
  { id: "pd", label: "Personal data", color: T.cyan },
  { id: "special", label: "Special category (extra-sensitive)", color: T.amber },
  { id: "no", label: "Not personal data", color: T.faint },
];
export function GdprDataLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={GDPR_DATA}
    prompt="UK GDPR protects personal data, and guards some kinds especially tightly. Sort each item: ordinary personal data, special-category (extra-sensitive) data, or not personal data at all."
    items={[
      { text: "A customer's name and home address.", cat: "pd", why: "It identifies a living person, so it is personal data under UK GDPR." },
      { text: "A person's medical records and diagnoses.", cat: "special", why: "Health data is special-category: it needs stronger justification and protection." },
      { text: "Aggregate sales figures with no individual attached ('3,000 orders in June').", cat: "no", why: "If no living individual can be identified, it is not personal data." },
      { text: "An email address like j.smith@company.com.", cat: "pd", why: "It can identify an individual, so it counts as personal data." },
      { text: "Someone's religious beliefs or trade-union membership.", cat: "special", why: "These are explicitly special-category data, protected more tightly because misuse can cause real harm." },
      { text: "An IP address logged against a user's session.", cat: "pd", why: "On its own or combined with other data it can identify a person, so regulators treat it as personal data." },
      { text: "A fully anonymised dataset that cannot be traced back to anyone.", cat: "no", why: "True anonymisation takes it outside personal data, the key word being genuinely irreversible." },
    ]} />;
}

export function ScopeConsentLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="You have been hired to test a company's security. A signed contract and a written scope exist. Play the engagement: the right call is the one that respects authorisation and scope."
    doneKicker="Within scope"
    doneNote="Every decision came back to one question: am I authorised to do this, right here, right now? A contract is permission for what is written in it, and nothing more. That discipline is what separates a professional from an offender."
    steps={[
      { role: "Day one", prompt: "The scope lists two web applications and their test servers. While testing, you notice the company's separate email server looks wide open and tempting. What do you do?", options: [
        { text: "Leave it alone and note it to raise with the client; it is outside the written scope.", correct: true, why: "Out of scope means out of bounds, however easy the target looks. You flag it and let the client decide whether to extend the scope in writing." },
        { text: "Test it quickly; you are already hired, so it is all fair game.", correct: false, why: "A contract authorises exactly what the scope says. Touching the email server is unauthorised access, a potential offence, even mid-engagement." },
        { text: "Test it but do not mention it, to avoid awkwardness.", correct: false, why: "That is both unauthorised and dishonest. The whole value of a tester is trust and a clean paper trail." },
      ] },
      { role: "A find", prompt: "On an in-scope app you confirm a flaw that would let you read other customers' data. How far do you go to 'prove' it?", options: [
        { text: "Prove it just enough to show it is real, without hoarding or exposing actual customer data.", correct: true, why: "Minimum necessary: demonstrate the flaw, capture only enough evidence to prove it, and never exfiltrate real personal data. Scope governs depth as well as targets." },
        { text: "Download the entire customer database as proof.", correct: false, why: "That turns a clean finding into a data breach you caused. You prove impact, you do not realise it." },
        { text: "Post a redacted screenshot publicly to warn users.", correct: false, why: "Findings go to the client privately, under the engagement's rules. Public disclosure here would breach confidentiality and could break the law." },
      ] },
      { role: "The clock", prompt: "The authorised testing window was 9am to 5pm. At 6pm you have one more idea you are itching to try. What now?", options: [
        { text: "Stop. The authorisation was time-bound; you resume only within the agreed window.", correct: true, why: "Authorisation can be limited by time, not just by target. Outside the window you have no permission, so you wait or get the window extended in writing." },
        { text: "Carry on; an hour over will not matter.", correct: false, why: "Permission that has expired is no permission. 'Just an hour more' is exactly how testers end up on the wrong side of the line." },
        { text: "Hand your access to a colleague who is still working.", correct: false, why: "Authorisation is specific to who, what, and when it names. It is not yours to pass on." },
      ] },
    ]} />;
}

export function DisclosureOrderLab({ onDidTry }: LabProps) {
  return <OrderGame onDidTry={onDidTry}
    prompt="You have found a serious flaw in a service you use (and were authorised to probe, or found by accident without crossing the line). Responsible disclosure has an order. Put the steps in the right sequence."
    doneNote="That is coordinated, responsible disclosure: report privately, give them a fair chance to fix, then go public to protect everyone else. It is the path that helps users and keeps you on the right side of the law."
    items={[
      { label: "Stop and document, do not dig further", note: "Record what you found with the minimum proof. Do not access more data than it takes to confirm the flaw." },
      { label: "Report it privately to the organisation", note: "Use their security contact or a security.txt / vulnerability-disclosure channel. Give them the details and how to reproduce it." },
      { label: "Give them reasonable time to fix it", note: "Agree a timeline. Standard practice is a fixed window (often around 90 days) before any public mention." },
      { label: "Confirm the fix is in place", note: "Check they have actually remediated, and agree what, if anything, can be said publicly." },
      { label: "Publish responsibly, if at all", note: "Only after the fix, with details that help others learn without handing attackers a weapon, and never customer data." },
    ]} />;
}

/* ---- Module 6 labs: who the attackers are & how they operate ---- */

const ACTORS: Cat[] = [
  { id: "crime", label: "Organised crime", color: T.red },
  { id: "nation", label: "Nation-state", color: T.amber },
  { id: "hacktivist", label: "Hacktivist", color: T.cyan },
  { id: "insider", label: "Insider", color: T.green },
];
export function ActorMotiveLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={ACTORS}
    prompt="Attackers are not all the same, and the kind you face changes how you defend. Read each motive and behaviour, and match it to the type of threat actor behind it."
    items={[
      { text: "Encrypts a hospital's files and demands a cryptocurrency ransom to unlock them.", cat: "crime", why: "Financially motivated, run like a business. Organised crime is behind most ransomware." },
      { text: "Quietly steals a defence contractor's research over many months, to benefit another country.", cat: "nation", why: "Patient, well-resourced espionage for strategic advantage is the hallmark of a nation-state." },
      { text: "Defaces a company's website to protest its environmental record.", cat: "hacktivist", why: "The motive is a political or social message, not money: that is hacktivism." },
      { text: "A departing employee copies the customer list to take to a competitor.", cat: "insider", why: "A trusted person misusing their legitimate access is an insider threat, one of the hardest to catch." },
      { text: "Steals millions of card numbers to sell in bulk on criminal marketplaces.", cat: "crime", why: "Turning data into money at scale is the core of the cybercrime economy." },
      { text: "Targets a power grid's control systems to hold a capability in reserve for a conflict.", cat: "nation", why: "Pre-positioning in critical infrastructure is a strategic, state-level goal, not a criminal one." },
      { text: "Leaks internal documents to embarrass an organisation over a cause.", cat: "hacktivist", why: "Disclosure to make a point is hacktivist behaviour, not profit-seeking." },
      { text: "An administrator sells their login to an outside group for a cut of the proceeds.", cat: "insider", why: "A malicious insider, here working with outsiders, abuses trusted access from within." },
    ]} />;
}

const CRIME_MYTH: Cat[] = [
  { id: "myth", label: "Myth", color: T.red },
  { id: "real", label: "Reality", color: T.green },
];
export function CrimeEconomyLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={CRIME_MYTH}
    prompt="The lone hacker in a hoodie is mostly a myth. Modern cybercrime is an industry. Sort each statement: myth, or reality?"
    items={[
      { text: "Most serious attacks are one genius working alone in a basement.", cat: "myth", why: "The reality is organised groups with roles, suppliers and customers, more like a company than a loner." },
      { text: "Criminal groups have specialists: developers, negotiators, even support staff.", cat: "real", why: "Leaked internal chats from ransomware crews showed salaries, HR and performance reviews, exactly like a business." },
      { text: "You can rent ransomware as a service, the way you rent any software.", cat: "real", why: "Ransomware-as-a-service lets low-skill affiliates use professional tools for a cut of the profits." },
      { text: "Attackers only go after big, famous companies.", cat: "myth", why: "Automated attacks hit everyone; small organisations are targeted precisely because their defences are weaker." },
      { text: "Stolen data, access and tools are bought and sold in established marketplaces.", cat: "real", why: "There is a whole economy: access brokers sell footholds, others buy them to deploy ransomware." },
      { text: "A successful attack usually needs rare, expensive 'zero-day' exploits.", cat: "myth", why: "Most breaches use known, unpatched flaws and stolen passwords, not exotic unknown exploits." },
    ]} />;
}

export function KillChainOrderLab({ onDidTry }: LabProps) {
  return <OrderGame onDidTry={onDidTry}
    prompt="Most intrusions follow a recognisable lifecycle, often called the kill chain. Understanding the order is what lets defenders break it early. Put the stages in sequence, from the attacker's first move to their goal."
    doneNote="That is the attack lifecycle. The defender's insight: you do not have to stop every stage, you just have to break the chain at any one of them before the final goal."
    items={[
      { label: "Reconnaissance", note: "Research the target: people, systems, exposed information. The quiet homework before any attack." },
      { label: "Delivery", note: "Get the attack to the target, typically a phishing email, a malicious link, or an exposed service." },
      { label: "Exploitation", note: "The weakness is triggered: a user clicks, or a vulnerability is used, and the attacker gains a foothold." },
      { label: "Installation", note: "The attacker establishes persistence, a way back in that survives reboots and closed sessions." },
      { label: "Command and control", note: "The compromised machine phones home, so the attacker can direct it remotely." },
      { label: "Actions on objectives", note: "The goal itself: steal data, deploy ransomware, or move deeper into the network." },
    ]} />;
}

const OSINT_EXPOSURE: Cat[] = [
  { id: "open", label: "Findable for free (OSINT)", color: T.amber },
  { id: "hidden", label: "Needs an actual breach", color: T.cyan },
];
export function OsintLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={OSINT_EXPOSURE}
    prompt="Before attacking, criminals do their homework using open-source intelligence (OSINT): information anyone can gather legally and freely. Sort each item: findable for free, or does it need an actual break-in?"
    items={[
      { text: "The names and job titles of a company's staff, from a professional network site.", cat: "open", why: "Public profiles hand attackers an org chart and perfect targets for tailored phishing." },
      { text: "Which email addresses have appeared in past data breaches.", cat: "open", why: "Breach-lookup services make this searchable, so attackers know whose credentials to try reusing." },
      { text: "The contents of the company's private internal file server.", cat: "hidden", why: "That is behind access controls; reaching it would require an actual compromise." },
      { text: "What software and services a company exposes to the internet.", cat: "open", why: "Search engines for internet-connected devices index this, pointing attackers straight at the attack surface." },
      { text: "A developer's cloud password accidentally committed to a public code repository.", cat: "open", why: "Secrets leaked in public repos are a classic free find, and a direct route in. Never a break-in needed." },
      { text: "The live keystrokes of an employee at their desk.", cat: "hidden", why: "Capturing those needs malware already on the machine, which is a breach, not open research." },
      { text: "Photos and details employees post publicly on social media.", cat: "open", why: "Personal posts help attackers craft convincing, personalised lures, all from public information." },
    ]} />;
}

const STAGE_DEFENCE: Cat[] = [
  { id: "recon", label: "Disrupts reconnaissance", color: T.amber },
  { id: "deliver", label: "Disrupts delivery / exploit", color: T.red },
  { id: "actions", label: "Limits actions on objectives", color: T.cyan },
];
export function DefenceStageLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={STAGE_DEFENCE}
    prompt="Defenders use the same kill-chain map, to decide where to break it. Tap each defence, then tap the stage it most disrupts. There is more than one right place to defend, which is the whole point."
    items={[
      { text: "Reducing what the company exposes publicly, and training staff on their footprint", cat: "recon", why: "Less public information means attackers' homework is harder: it disrupts reconnaissance." },
      { text: "Email filtering and phishing-aware staff who do not click", cat: "deliver", why: "Stopping the lure from landing or being clicked breaks delivery and exploitation." },
      { text: "Patching known vulnerabilities before they can be used", cat: "deliver", why: "No working exploit means the delivered attack fails at the exploitation stage." },
      { text: "Network segmentation and least privilege", cat: "actions", why: "Even after a foothold, tight access limits how far the attacker can get: it caps actions on objectives." },
      { text: "Offline backups that survive an attacker reaching the data", cat: "actions", why: "If they do reach the goal, recoverable backups blunt the impact of their final actions." },
      { text: "Removing employee details and old accounts from public exposure", cat: "recon", why: "Shrinking the discoverable footprint again disrupts the reconnaissance stage." },
    ]} />;
}

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

/* ---- Module 7 labs: social engineering & phishing (recognise & defend) ---- */

const HUMAN_TARGET: Cat[] = [
  { id: "tech", label: "A technical control stops it", color: T.cyan },
  { id: "human", label: "It targets the person directly", color: T.amber },
];
export function HumanTargetLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={HUMAN_TARGET}
    prompt="Attackers target people because people cannot be patched. For each scenario, decide: would a technical control stop it, or does it bypass the technology by going straight for the person?"
    items={[
      { text: "Malware tries to exploit an unpatched server over the network.", cat: "tech", why: "Patching and firewalls address this directly: it is a technical attack on technology." },
      { text: "An email convinces an employee to type their password into a fake login page.", cat: "human", why: "No firewall stops a person choosing to enter their own password. The target is the human decision." },
      { text: "A caller pretends to be IT support and talks a user into granting remote access.", cat: "human", why: "The technology is not broken; a person is persuaded to open the door. That is social engineering." },
      { text: "An attacker brute-forces a login with no rate limiting.", cat: "tech", why: "Rate limiting, lockouts and MFA are technical controls that defeat this." },
      { text: "A text message panics someone into clicking a link about a missed delivery.", cat: "human", why: "The attack works on emotion and habit, not a technical flaw. It targets the person." },
      { text: "A worm spreads automatically between machines using a known exploit.", cat: "tech", why: "Patching the exploited flaw stops it. No human choice is involved." },
      { text: "Someone holds a door open for a stranger carrying boxes into a secure office.", cat: "human", why: "Tailgating exploits politeness, not technology. It is social engineering in the physical world." },
    ]} />;
}

const PHISH_FAMILY: Cat[] = [
  { id: "spear", label: "Spear phishing", color: T.cyan },
  { id: "whaling", label: "Whaling / BEC", color: T.red },
  { id: "vishing", label: "Vishing (voice)", color: T.amber },
  { id: "smishing", label: "Smishing (SMS)", color: T.green },
];
export function PhishFamilyLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={PHISH_FAMILY}
    prompt="Phishing is a family of attacks across different channels and targets. Tap each example, then tap which kind it is. Naming them precisely is how you describe an incident to colleagues."
    items={[
      { text: "A tailored email to one engineer, naming their real manager and project", cat: "spear", why: "Targeted at a specific person using research: spear phishing." },
      { text: "An 'urgent' email to finance, appearing to be from the CEO, requesting a wire transfer", cat: "whaling", why: "Impersonating a senior figure to drive a high-value action is whaling / business email compromise." },
      { text: "A phone call from 'the bank's fraud team' asking you to confirm a code", cat: "vishing", why: "Phishing by voice call is vishing. The urgency and authority are the levers." },
      { text: "A text message about a 'missed parcel' with a link to pay a fee", cat: "smishing", why: "Phishing by SMS is smishing, and delivery-scam texts are among the most common." },
      { text: "A fake invoice emailed to an executive, impersonating a known supplier", cat: "whaling", why: "High-value fraud aimed at those who can authorise payments: business email compromise." },
      { text: "A recorded call warning your account is 'suspended', press 1 to speak to an agent", cat: "vishing", why: "Automated voice phishing still relies on fear and urgency over the phone: vishing." },
    ]} />;
}

const PERSUASION: Cat[] = [
  { id: "authority", label: "Authority", color: T.red },
  { id: "urgency", label: "Urgency / scarcity", color: T.amber },
  { id: "fear", label: "Fear", color: T.cyan },
  { id: "liking", label: "Liking / trust", color: T.green },
];
export function PersuasionLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={PERSUASION}
    prompt="Social engineering works by pulling emotional levers so you act before you think. For each line from a scam message, identify the main lever it pulls. Spotting the lever is how you catch yourself in the moment."
    items={[
      { text: "'This is the CEO. I need this done now, do not question it.'", cat: "authority", why: "Impersonating power pressures you to comply without checking: the authority lever." },
      { text: "'Your account will be closed in 2 hours unless you act immediately.'", cat: "urgency", why: "A ticking clock stops you pausing to think. Urgency is the classic lever." },
      { text: "'We've detected criminal activity on your account and police may be involved.'", cat: "fear", why: "Frightening you into panic makes you obey. Fear overrides careful judgement." },
      { text: "'Hi, it's Dave from the team downstairs, can you do me a quick favour?'", cat: "liking", why: "Posing as a friendly, familiar colleague lowers your guard. Liking and trust are levers too." },
      { text: "'Only 3 spots left, confirm your details to secure yours now.'", cat: "urgency", why: "Scarcity is urgency's twin: fear of missing out rushes you into acting." },
      { text: "'Per the director's instruction, process this today without the usual checks.'", cat: "authority", why: "Invoking a senior figure to bypass normal process is the authority lever at work." },
    ]} />;
}

const EMAIL_FLAG: Cat[] = [
  { id: "flag", label: "Warning sign", color: T.red },
  { id: "fine", label: "Not by itself a red flag", color: T.green },
];
export function SpotPhishLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={EMAIL_FLAG}
    prompt="Reading a suspicious email is a checklist, not a feeling. For each feature, decide: is it a genuine warning sign, or not by itself a reason to worry? The goal is to recognise the real tells."
    items={[
      { text: "The display name says 'IT Helpdesk' but the actual address is a random public mailbox.", cat: "flag", why: "A mismatch between the friendly name and the real address is one of the strongest tells." },
      { text: "A link's text says your bank, but hovering shows a completely different domain.", cat: "flag", why: "Always check where a link really goes. Mismatched link destinations are a classic sign." },
      { text: "The message creates urgency and asks you to act outside the normal process.", cat: "flag", why: "Pressure to skip the usual checks is a hallmark of phishing and business email compromise." },
      { text: "The email is addressed to you by your correct name.", cat: "fine", why: "Not reassuring on its own: attackers get names from public profiles. Realism is not proof of safety." },
      { text: "A lookalike domain that swaps a letter, like 'rnicrosoft' for 'microsoft'.", cat: "flag", why: "Lookalike and misspelled domains are deliberate. Read the address character by character." },
      { text: "The email has a company logo and professional formatting.", cat: "fine", why: "Logos and polish are trivial to copy, so they prove nothing by themselves." },
      { text: "An unexpected attachment urging you to 'enable content' or 'enable macros'.", cat: "flag", why: "Prompts to enable macros or content on an unexpected file are a well-known malware delivery trick." },
    ]} />;
}

export function PhishResponseLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="A suspicious email lands in your inbox at work. Play it out: the right moves are the calm, process-following ones that protect you and everyone else."
    doneKicker="Handled well"
    doneNote="You did not click, you did not reply, you verified through a trusted channel, and you reported it so the whole organisation is protected. That calm, report-it-forward habit is worth more than any single clever catch."
    steps={[
      { role: "First glance", prompt: "The email claims to be from your CEO, marked urgent, asking you to buy gift cards and send the codes quietly. What is your first move?", options: [
        { text: "Pause. The urgency and the unusual request are red flags, so do not act on it yet.", correct: true, why: "Stopping to think is the whole defence. Urgency plus an unusual, secretive request is a textbook business-email-compromise pattern." },
        { text: "Buy the gift cards quickly; it is the CEO and it is urgent.", correct: false, why: "That is exactly what the attack is engineered to make you do. Authority and urgency are the levers, not proof it is real." },
        { text: "Reply to ask if it is genuine.", correct: false, why: "Replying talks to the attacker, who will simply reassure you. Never verify a suspicious message through the message itself." },
      ] },
      { role: "Checking", prompt: "You want to confirm whether it is really from the CEO. How?", options: [
        { text: "Verify out-of-band: contact them through a known number or channel you already trust.", correct: true, why: "Out-of-band verification, using contact details you already have, defeats impersonation because you reach the real person, not the attacker." },
        { text: "Check that the sender's display name says the CEO's name.", correct: false, why: "Display names are trivial to fake. The friendly name proves nothing about who really sent it." },
        { text: "Click the link in the email to 'confirm your identity'.", correct: false, why: "Never click to verify. Links in a suspicious message are part of the attack, not a safety check." },
      ] },
      { role: "Closing it out", prompt: "You are now fairly sure it is a scam. What is the most useful final step?", options: [
        { text: "Report it through your organisation's channel (e.g. a 'report phishing' button or the security team).", correct: true, why: "Reporting protects everyone: the security team can warn others, block the sender, and hunt for who else got it. Your report is a defensive act for the whole organisation." },
        { text: "Just delete it and move on.", correct: false, why: "Deleting protects only you. If you were targeted, colleagues probably were too, and only a report lets the team act." },
        { text: "Forward it to colleagues to warn them yourself.", correct: false, why: "Well-meant, but it spreads the malicious content and muddies the investigation. Use the official reporting route instead." },
      ] },
    ]} />;
}

/* ---- Module 8 labs: malware, how it really works (recognise & defend) ---- */

const MALWARE_TYPE: Cat[] = [
  { id: "virus", label: "Virus / worm", color: T.red },
  { id: "trojan", label: "Trojan", color: T.amber },
  { id: "ransom", label: "Ransomware", color: T.cyan },
  { id: "spy", label: "Spyware / stealer", color: T.green },
];
export function MalwareTypeLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={MALWARE_TYPE}
    prompt="Malware is a family, and the type tells you what it does. Tap each description, then tap the kind of malware it is. Naming the type correctly is how you describe and respond to an infection."
    items={[
      { text: "Spreads by itself across a network, with no user action, copying from machine to machine", cat: "virus", why: "Self-spreading, no user needed, is the defining trait of a worm (a virus needs a host file; both self-replicate)." },
      { text: "Pretends to be useful software so a user installs it willingly", cat: "trojan", why: "A trojan hides malice inside something that looks legitimate, tricking the user into running it." },
      { text: "Encrypts your files and demands payment for the key", cat: "ransom", why: "Holding data hostage for a ransom is, by definition, ransomware." },
      { text: "Quietly records keystrokes and steals passwords, trying not to be noticed", cat: "spy", why: "Secretly collecting information is spyware, and a password-grabber is an info-stealer." },
      { text: "Attaches itself to a legitimate file and runs when that file is opened", cat: "virus", why: "Needing a host file to attach to and spread is the classic trait of a virus." },
      { text: "Looks like a free game but installs a hidden backdoor when run", cat: "trojan", why: "Disguising a backdoor inside something desirable is textbook trojan behaviour." },
    ]} />;
}

export function RansomwareResponseLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="Your organisation's files have just been encrypted by ransomware and a ransom note has appeared. Play the response: the right moves protect what is left and recover safely."
    doneKicker="Contained"
    doneNote="You isolated fast, protected the backups, brought in the right people, and did not reflexively pay. That calm, backups-first response is why offline backups and a tested recovery plan are the real answer to ransomware."
    steps={[
      { role: "First minutes", prompt: "Screens across the office show a ransom note. What is the most urgent first action?", options: [
        { text: "Isolate the affected machines from the network to stop the spread.", correct: true, why: "Ransomware often keeps spreading. Disconnecting affected machines (and segments) first limits how much it can reach." },
        { text: "Immediately pay the ransom to get the files back fastest.", correct: false, why: "Paying first is the worst reflex: it funds crime, there is no guarantee of recovery, and it does nothing to stop the spread happening right now." },
        { text: "Reboot everything and hope it clears.", correct: false, why: "Rebooting can trigger further encryption or destroy forensic evidence, and does nothing to contain the spread." },
      ] },
      { role: "Protecting recovery", prompt: "You have backups. What matters most about them right now?", options: [
        { text: "Make sure the backups are offline or otherwise out of the attacker's reach, and intact.", correct: true, why: "Attackers deliberately seek and encrypt backups. Offline, immutable backups the ransomware could not touch are what make recovery possible without paying." },
        { text: "Restore immediately onto the still-infected network.", correct: false, why: "Restoring onto a network that is still compromised just gets your clean data re-encrypted. Contain and clean first." },
        { text: "Assume the backups are fine and do not check them.", correct: false, why: "Untested backups fail exactly when you need them. You confirm they are intact and reachable before relying on them." },
      ] },
      { role: "Getting it right", prompt: "Beyond the technical response, what must happen?", options: [
        { text: "Bring in incident response, and report it (to leadership, and often to regulators and law enforcement).", correct: true, why: "A serious ransomware incident is a reportable event, with legal duties (like data-protection breach notification) and value in law-enforcement involvement. It is not something to quietly handle alone." },
        { text: "Keep it secret to avoid embarrassment.", correct: false, why: "Hiding a breach can break the law (notification duties) and makes everything worse. Serious incidents must be escalated and reported." },
        { text: "Blame whoever clicked and move on.", correct: false, why: "Blame helps nothing and poisons reporting culture. The focus is contain, recover, learn, report." },
      ] },
    ]} />;
}

const INFECTION_VECTOR: Cat[] = [
  { id: "phish", label: "Phishing attachment / link", color: T.red },
  { id: "download", label: "Malicious download", color: T.amber },
  { id: "media", label: "Removable media", color: T.cyan },
  { id: "supply", label: "Software supply chain", color: T.green },
];
export function InfectionVectorLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={INFECTION_VECTOR}
    prompt="Malware has to get in somehow. Tap each way in, then tap which infection vector it is. Knowing the common routes is how defenders close them."
    items={[
      { text: "An employee opens an email attachment and enables macros, running hidden code", cat: "phish", why: "A booby-trapped attachment delivered by email is a phishing vector, the most common of all." },
      { text: "A user downloads 'free' software from an untrustworthy site, bundled with malware", cat: "download", why: "Malicious or bundled downloads from dodgy sources are a classic infection route." },
      { text: "Someone plugs in a USB stick found in the car park", cat: "media", why: "Removable media can auto-run or carry malicious files. 'Found' USB sticks are a known trick." },
      { text: "A trusted software update is tampered with, infecting everyone who installs it", cat: "supply", why: "Compromising a supplier's update reaches all its customers at once: a supply-chain attack." },
      { text: "A pirated app from an unofficial store carries a hidden trojan", cat: "download", why: "Unofficial app sources are a frequent source of malicious downloads." },
      { text: "A malicious attachment disguised as an invoice arrives from a 'supplier'", cat: "phish", why: "Delivered by email with a social-engineering lure: a phishing vector." },
    ]} />;
}

const PAYLOAD: Cat[] = [
  { id: "steal", label: "Steal data / credentials", color: T.cyan },
  { id: "extort", label: "Extort (ransom)", color: T.red },
  { id: "control", label: "Take remote control / enlist", color: T.amber },
  { id: "destroy", label: "Destroy / disrupt", color: T.green },
];
export function PayloadLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={PAYLOAD}
    prompt="Once inside, malware has a job to do, its payload. Sort each behaviour by the attacker's goal. Reading the goal from the behaviour is a core analyst skill."
    items={[
      { text: "Logs every keystroke and sends captured passwords to a remote server.", cat: "steal", why: "Harvesting credentials and data to send out is theft: an info-stealer or spyware payload." },
      { text: "Encrypts all documents and displays a demand for payment.", cat: "extort", why: "Locking data for money is extortion: the ransomware payload." },
      { text: "Opens a hidden backdoor so the attacker can control the machine at will.", cat: "control", why: "A remote-access backdoor hands control to the attacker: a RAT-style payload." },
      { text: "Enlists the machine into a botnet to send spam and attack others.", cat: "control", why: "Conscripting the device into a botnet puts it under the attacker's remote command." },
      { text: "Overwrites the system so the computer can no longer boot, with no ransom offered.", cat: "destroy", why: "Pure destruction with no payment demand is a wiper: disruption, not profit." },
      { text: "Silently copies confidential files out of the company over weeks.", cat: "steal", why: "Quiet, long-term exfiltration of data is a theft payload, typical of espionage." },
    ]} />;
}

const SAFE_HANDLING: Cat[] = [
  { id: "safe", label: "Safe", color: T.green },
  { id: "unsafe", label: "Dangerous", color: T.red },
];
export function MalwareHandlingLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={SAFE_HANDLING}
    prompt="Malware is studied safely, in isolation, never casually. For each action with a suspicious file, decide: a safe practice, or a dangerous one? This is how professionals avoid becoming the next victim."
    items={[
      { text: "Opening a suspicious file in an isolated, disposable sandbox with no access to real systems.", cat: "safe", why: "A sandbox or isolated VM lets analysts watch behaviour without risking real machines or data." },
      { text: "Double-clicking a suspicious attachment on your everyday work laptop 'just to see'.", cat: "unsafe", why: "Running unknown code on a real, connected machine is exactly how infections start. Never do this." },
      { text: "Submitting a file's fingerprint (hash) to a reputation service to check if it is known-bad.", cat: "safe", why: "Checking a hash reveals whether it is known malware without running it: safe and routine." },
      { text: "Plugging a found USB stick into a networked computer to find out what is on it.", cat: "unsafe", why: "Unknown removable media is a classic infection vector. Never plug it into a real system." },
      { text: "Analysing malware on a machine that is network-isolated and reset after each test.", cat: "safe", why: "Isolation and a clean reset between tests is the standard way to study malware behaviour safely." },
      { text: "Forwarding a live malware sample around the office to 'warn' people.", cat: "unsafe", why: "That spreads the threat. Report through the proper channel; never circulate live samples." },
    ]} />;
}

/* ---- Module 10 labs: networks & Wi-Fi under attack (recognise & defend) ---- */

const EAVESDROP: Cat[] = [
  { id: "safe", label: "Protects against eavesdropping", color: T.green },
  { id: "exposed", label: "Does not protect it", color: T.red },
];
export function EavesdropLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={EAVESDROP}
    prompt="On an untrusted network, someone may be listening. For each measure, decide: does it actually protect your traffic from eavesdropping, or not?"
    items={[
      { text: "Visiting sites over HTTPS (the padlock), so the conversation is encrypted.", cat: "safe", why: "HTTPS encrypts content end to end, so a snooper on the network sees only scrambled bytes." },
      { text: "Using a trustworthy VPN that encrypts all your traffic to a safe exit point.", cat: "safe", why: "A good VPN wraps everything in encryption across the untrusted network: strong protection against local eavesdropping." },
      { text: "Entering your password on a plain HTTP page.", cat: "exposed", why: "Plain HTTP crosses the network readable by anyone on it, passwords included. No protection at all." },
      { text: "Connecting to Wi-Fi that uses modern encryption (WPA2/WPA3) with a real password.", cat: "safe", why: "Encrypted Wi-Fi scrambles the local radio link, stopping casual sniffing of your traffic nearby." },
      { text: "Trusting an open, passwordless Wi-Fi network just because it is busy.", cat: "exposed", why: "Open Wi-Fi gives no link encryption, and popularity proves nothing. Your plain traffic is exposed locally." },
      { text: "Choosing a website because it 'looks professional'.", cat: "exposed", why: "Appearance has nothing to do with whether your connection is encrypted. Only HTTPS/VPN protect the traffic." },
    ]} />;
}

const WIFI_HABIT: Cat[] = [
  { id: "safe", label: "Safe habit", color: T.green },
  { id: "risky", label: "Risky habit", color: T.red },
];
export function WifiHabitLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={WIFI_HABIT}
    prompt="Attackers set up fake 'evil twin' hotspots that look just like real ones. For each Wi-Fi habit, decide: safe, or risky?"
    items={[
      { text: "Confirming the exact network name with staff before joining a café or hotel Wi-Fi.", cat: "safe", why: "Verifying the real name helps you avoid a lookalike evil-twin network set up to impersonate it." },
      { text: "Letting your phone auto-connect to any open network it has seen before.", cat: "risky", why: "Auto-connect can silently join an attacker's hotspot that reuses a familiar name. Turn it off on untrusted networks." },
      { text: "Using a VPN whenever you are on Wi-Fi you do not control.", cat: "safe", why: "A VPN encrypts your traffic even if the network itself is hostile: a strong habit on public Wi-Fi." },
      { text: "Doing your online banking on unknown open Wi-Fi without a VPN.", cat: "risky", why: "Sensitive actions on an untrusted, unencrypted network are exactly what attackers hope to intercept." },
      { text: "Joining a hotspot just because it is named 'Free Airport WiFi'.", cat: "risky", why: "Anyone can name a hotspot anything. A convincing name is how evil twins lure victims." },
      { text: "Preferring your mobile data (or a personal hotspot) over sketchy public Wi-Fi for anything sensitive.", cat: "safe", why: "Your own connection avoids the whole untrusted-network risk for sensitive tasks." },
    ]} />;
}

const SPOOF_TYPE: Cat[] = [
  { id: "arp", label: "Local network (ARP)", color: T.red },
  { id: "caller", label: "Phone number (caller ID)", color: T.amber },
  { id: "email", label: "Email sender", color: T.cyan },
  { id: "dns", label: "Website name (DNS)", color: T.green },
];
export function SpoofTypeLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={SPOOF_TYPE}
    prompt="Spoofing means faking an identity to impersonate something trusted. Tap each example, then tap what is being faked. Naming it precisely helps you choose the right defence."
    items={[
      { text: "An attacker on the same Wi-Fi tricks your device into sending its traffic through them", cat: "arp", why: "Faking local network addresses (ARP spoofing) puts the attacker in the middle on the local network." },
      { text: "A scam call shows your bank's real phone number on your screen", cat: "caller", why: "Caller-ID spoofing fakes the number a call appears to come from, a key tool in phone fraud." },
      { text: "An email's 'from' looks like your CEO but was not sent by them", cat: "email", why: "Email sender spoofing fakes who a message appears to be from (recall the phishing module)." },
      { text: "A poisoned lookup sends a bank's name to the attacker's address", cat: "dns", why: "DNS spoofing fakes the name-to-address answer, sending victims to the wrong server (recall Module 2)." },
      { text: "A text message appears to come from 'Royal Mail' but is from a fraudster", cat: "caller", why: "Sender-ID spoofing on SMS fakes the displayed sender, the same idea as caller-ID spoofing." },
      { text: "On a café network, your traffic is quietly rerouted through another laptop", cat: "arp", why: "Redirecting local traffic by faking network addresses is ARP spoofing, a man-in-the-middle setup." },
    ]} />;
}

const DDOS_DEFENCE: Cat[] = [
  { id: "helps", label: "Helps against DDoS", color: T.green },
  { id: "no", label: "Does not address DDoS", color: T.red },
];
export function DdosDefenceLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={DDOS_DEFENCE}
    prompt="A denial-of-service attack floods a target so real users cannot get through. It attacks availability, not secrecy. For each measure, decide: does it help against DDoS, or address a different problem?"
    items={[
      { text: "A DDoS-protection or 'scrubbing' service that absorbs and filters flood traffic.", cat: "helps", why: "Specialised services soak up and clean enormous floods before they reach the target: a core DDoS defence." },
      { text: "A content delivery network spreading the load across many global servers.", cat: "helps", why: "Distributing traffic across huge global capacity makes a target far harder to overwhelm." },
      { text: "Rate limiting and filtering out obviously bad traffic.", cat: "helps", why: "Capping request rates and dropping junk reduces how much flood reaches your systems." },
      { text: "Encrypting the database so stolen copies are unreadable.", cat: "no", why: "Encryption protects secrecy, not availability. It does nothing to stop a flood of traffic." },
      { text: "Training staff to spot phishing emails.", cat: "no", why: "Vital for other attacks, but irrelevant to a traffic flood that targets availability." },
      { text: "Having capacity and an incident plan to absorb or reroute surges.", cat: "helps", why: "Over-provisioning and a rehearsed plan are part of surviving a denial-of-service attack." },
    ]} />;
}

export function LateralMovementLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="An attacker has compromised one ordinary laptop in an organisation. Play the defence: the goal is to limit how far that single foothold can reach."
    doneKicker="Contained"
    doneNote="Assume breach, then limit the blast radius. Segmentation, least privilege and monitoring mean one compromised laptop stays one compromised laptop, instead of becoming the whole network. That is the defender's answer to lateral movement."
    steps={[
      { role: "The foothold", prompt: "The attacker wants to move from this laptop to the valuable servers. What most limits how far they can go?", options: [
        { text: "Network segmentation, so the laptop simply cannot reach the sensitive systems directly.", correct: true, why: "Segmentation divides the network so a foothold in one zone cannot freely reach another. It is the single biggest brake on lateral movement." },
        { text: "A flat network where everything can talk to everything, for convenience.", correct: false, why: "A flat network is the attacker's dream: one foothold reaches everything. This is what let several famous breaches spread." },
        { text: "Relying only on the antivirus that already missed the infection.", correct: false, why: "The malware is already past the antivirus. You need to limit reach, not hope the thing that failed catches up." },
      ] },
      { role: "The credentials", prompt: "The attacker tries to use the laptop's access to log into other systems. What blunts this?", options: [
        { text: "Least privilege: the account can only reach the few things it genuinely needs.", correct: true, why: "If a compromised account can touch very little, a stolen foothold is worth very little. Least privilege caps the damage." },
        { text: "Giving every user administrator rights so things 'just work'.", correct: false, why: "Over-privileged accounts hand the attacker the keys to everything. It is the opposite of what you want." },
        { text: "Using the same password for every system to keep things simple.", correct: false, why: "Reused credentials let one stolen password unlock everything: exactly how attackers move sideways." },
      ] },
      { role: "Seeing it", prompt: "How do you catch the attacker moving around before they reach the goal?", options: [
        { text: "Monitoring and alerting on unusual internal activity, assuming a breach will happen.", correct: true, why: "Assume-breach means watching inside, not just at the perimeter. Detecting odd lateral activity early is how you stop a foothold becoming a disaster." },
        { text: "Only watching the perimeter and trusting everything already inside.", correct: false, why: "'Hard shell, soft centre' fails once an attacker is in. Modern defence watches internal movement too." },
        { text: "Assuming that if they got in, it is already too late.", correct: false, why: "Defeatist and wrong. Detection and containment inside the network routinely stop breaches before the goal is reached." },
      ] },
    ]} />;
}

/* ---- Module 11 labs: vulnerabilities & patching ---- */

const VULN_TERM: Cat[] = [
  { id: "vuln", label: "Vulnerability", color: T.amber },
  { id: "exploit", label: "Exploit", color: T.red },
  { id: "cve", label: "CVE", color: T.cyan },
  { id: "cvss", label: "CVSS", color: T.green },
];
export function VulnTermLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={VULN_TERM}
    prompt="Vulnerability management has its own vocabulary, and using it precisely is how you communicate risk. Tap each description, then tap the term it defines."
    items={[
      { text: "A weakness in software or a system that could be abused", cat: "vuln", why: "A vulnerability is the weakness itself, the flaw an attacker might use." },
      { text: "A piece of code or technique that actually takes advantage of a weakness", cat: "exploit", why: "An exploit is the thing that uses a vulnerability; the weakness is only dangerous once an exploit exists." },
      { text: "A unique public ID for a specific known vulnerability (like CVE-2014-0160)", cat: "cve", why: "A CVE identifier lets everyone refer to the exact same flaw unambiguously." },
      { text: "A standard 0-10 score rating how severe a vulnerability is", cat: "cvss", why: "CVSS gives a severity score so you can compare vulnerabilities at a glance." },
      { text: "The flaw that existed in a system before anyone built a way to abuse it", cat: "vuln", why: "Still a vulnerability: the weakness exists whether or not an exploit has been written yet." },
      { text: "A 9.8 'critical' rating attached to a flaw", cat: "cvss", why: "A high number on the 0-10 scale is a CVSS severity score." },
    ]} />;
}

export function PatchRaceLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="A vendor has just released an emergency patch for a critical, actively-exploited flaw in software you run on an internet-facing server. Play the race: speed and judgement both matter."
    doneKicker="Patched in time"
    doneNote="You treated a critical, exploited, internet-facing flaw as the emergency it was: assessed exposure, prioritised, patched fast, and mitigated where you could not. That is the patch race, and winning it is one of the highest-value things a defender does."
    steps={[
      { role: "The news breaks", prompt: "The advisory says the flaw is critical and already being exploited in the wild. What is your first move?", options: [
        { text: "Find out whether, and where, you run the affected software, especially anything internet-facing.", correct: true, why: "You cannot fix what you cannot find. Knowing your exposure, starting with internet-facing systems, is step one." },
        { text: "Wait a few weeks to see if the patch causes any problems for others.", correct: false, why: "'Actively exploited' and 'internet-facing' means the clock is running now. Waiting weeks is exactly the gap attackers need." },
        { text: "Ignore it; if it mattered, someone would tell you.", correct: false, why: "Nobody is coming to patch it for you. Known, exploited flaws left open are how the biggest breaches start." },
      ] },
      { role: "Can't patch instantly", prompt: "Testing the patch properly will take a little time, but the server is exposed now. What do you do in the meantime?", options: [
        { text: "Apply an interim mitigation (e.g. restrict access or use the vendor's workaround) to reduce exposure while you test.", correct: true, why: "When you cannot patch instantly, you shrink the exposure: limit who can reach it, apply a workaround, add monitoring. You reduce risk now, then patch." },
        { text: "Leave it fully exposed until the patch is tested, changing nothing.", correct: false, why: "Doing nothing on a critical, exploited, internet-facing flaw leaves the door wide open during the most dangerous window." },
        { text: "Take the whole business offline indefinitely to be safe.", correct: false, why: "Disproportionate: the goal is to reduce exposure (access limits, workarounds) while you test, not to halt everything." },
      ] },
      { role: "Afterwards", prompt: "The patch is applied. What turns this scramble into something better next time?", options: [
        { text: "Build an inventory and a patching process, so next time you know your exposure and act fast by default.", correct: true, why: "The lasting fix is process: know what you run (inventory), watch for advisories, and patch critical flaws fast as routine, not panic." },
        { text: "Assume this was a one-off and change nothing.", correct: false, why: "Critical flaws are regular, not rare. Without a process, every one is a fresh scramble, and eventually one is missed." },
        { text: "Disable all future updates to avoid the hassle.", correct: false, why: "That guarantees you fall behind and accumulate open doors. Updating is the defence, not the problem." },
      ] },
    ]} />;
}

const REPORT_FIELD: Cat[] = [
  { id: "which", label: "Which flaw / does it apply to me", color: T.cyan },
  { id: "severity", label: "How severe", color: T.amber },
  { id: "urgency", label: "How urgent (exploited?)", color: T.red },
  { id: "action", label: "What to do", color: T.green },
];
export function VulnReportLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={REPORT_FIELD}
    prompt="A vulnerability advisory is dense, but each part answers a specific question. Tap each element, then tap what it tells you. Reading reports well is a daily analyst skill."
    items={[
      { text: "The CVE identifier and the list of affected products and versions", cat: "which", why: "These pin down exactly which flaw it is, and whether your systems are affected." },
      { text: "The CVSS base score, e.g. 9.8 'critical'", cat: "severity", why: "The severity score tells you how bad the flaw is in principle." },
      { text: "A note that the flaw is 'being actively exploited in the wild'", cat: "urgency", why: "Known real-world exploitation sharply raises urgency, often above a slightly higher-scored flaw that is not being used." },
      { text: "The patch version, or a temporary workaround / mitigation", cat: "action", why: "This is what you actually do: apply the patch, or the interim mitigation if you cannot patch yet." },
      { text: "'Affects versions 2.0 to 2.4; fixed in 2.4.1'", cat: "which", why: "Version details tell you whether you are exposed and what to upgrade to." },
      { text: "'Proof-of-concept exploit code is publicly available'", cat: "urgency", why: "Public exploit code means attacks will follow fast: a strong urgency signal." },
    ]} />;
}

export function PriorityOrderLab({ onDidTry }: LabProps) {
  return <OrderGame onDidTry={onDidTry}
    prompt="You cannot patch everything at once, so you prioritise. Rank these four vulnerabilities from fix-first to fix-last, weighing severity, exposure, and whether they are actually being exploited."
    doneNote="That is risk-based prioritisation: a flaw that is severe, internet-facing, and actively exploited beats a severe one that is isolated and not exploited. Exposure and real-world exploitation, not the raw score alone, decide what you fix first."
    items={[
      { label: "Critical flaw, internet-facing server, actively exploited right now", note: "Severe, exposed, and being used in real attacks: the textbook fix-this-first emergency." },
      { label: "Critical flaw, internet-facing, no known exploitation yet", note: "Severe and exposed, so still urgent, but slightly less than one already being exploited." },
      { label: "High flaw, internal-only system behind segmentation", note: "Serious, but exposure is limited by not being reachable from outside. Important, not an emergency." },
      { label: "Medium flaw, isolated test machine, not exploited", note: "Low exposure and lower severity: real, but it waits behind the others." },
    ]} />;
}

const EOL_APPROACH: Cat[] = [
  { id: "sound", label: "Sound approach", color: T.green },
  { id: "risky", label: "Risky approach", color: T.red },
];
export function EndOfLifeLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={EOL_APPROACH}
    prompt="End-of-life software no longer gets security patches, so new flaws in it are never fixed. For each way of handling a legacy system, decide: sound, or risky?"
    items={[
      { text: "Planning and budgeting to migrate off the end-of-life system before support ends.", cat: "sound", why: "Getting ahead of the deadline is the real answer: migrate before the patches stop." },
      { text: "Leaving an unsupported, unpatchable system directly exposed to the internet.", cat: "risky", why: "A system that can never be patched, open to the world, is a permanent open door. The worst case." },
      { text: "Isolating a legacy system that genuinely cannot be replaced yet, with tight segmentation and monitoring.", cat: "sound", why: "If you truly cannot migrate yet, you contain it: isolate, restrict access, and watch it closely." },
      { text: "Assuming an old system is fine because 'it has always worked'.", cat: "risky", why: "Working is not the same as safe. Unpatched flaws accumulate silently; past reliability says nothing about security." },
      { text: "Keeping an inventory so you know which systems are approaching end of life.", cat: "sound", why: "You cannot manage what you do not track. Knowing what is ageing out is the first step." },
      { text: "Ignoring end-of-life dates because upgrading is inconvenient and costly.", cat: "risky", why: "The cost and inconvenience are real, but ignoring EOL just defers them into a far more expensive breach." },
    ]} />;
}

/* ---- Module 9 labs: web attacks & the OWASP Top 10 (recognise & defend) ---- */

const TRUST_INPUT: Cat[] = [
  { id: "untrusted", label: "Untrusted (never trust it)", color: T.red },
  { id: "trusted", label: "Controlled by you", color: T.green },
];
export function TrustInputLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={TRUST_INPUT}
    prompt="The golden rule of web security: never trust input that came from the user. For each source of data, decide: is it untrusted user input, or something you control?"
    items={[
      { text: "What someone types into a login or search box.", cat: "untrusted", why: "Anything a user types can be anything, including an attack. Always treat it as hostile until checked." },
      { text: "Values in a URL, like ?id=42, that a user can edit.", cat: "untrusted", why: "Users can change URL parameters freely, so these are untrusted input too." },
      { text: "A setting hard-coded in your own server's configuration.", cat: "trusted", why: "You control this; it does not come from the user, so it is not an injection risk." },
      { text: "Data uploaded in a file by a visitor.", cat: "untrusted", why: "An uploaded file's name and contents are user-supplied and must be treated as untrusted." },
      { text: "A hidden form field the browser sends back.", cat: "untrusted", why: "'Hidden' only means not shown; a user can still change it. Never trust it." },
      { text: "A fixed list of options your own code defines.", cat: "trusted", why: "If your code sets it and the user cannot alter it, you control it." },
    ]} />;
}

const XSS_SAFETY: Cat[] = [
  { id: "vuln", label: "Vulnerable to XSS", color: T.red },
  { id: "safe", label: "Handled safely", color: T.green },
];
export function XssSafetyLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={XSS_SAFETY}
    prompt="Cross-site scripting (XSS) happens when a site shows user content as if it were code. For each practice, decide: vulnerable to XSS, or handled safely?"
    items={[
      { text: "Showing a user's comment on a page exactly as typed, with no escaping.", cat: "vuln", why: "If the comment contains script, it runs in other visitors' browsers. This is classic XSS." },
      { text: "Escaping user content so tags are shown as text, not run as code.", cat: "safe", why: "Escaping (encoding) output means a script is displayed harmlessly, never executed." },
      { text: "Putting a user's name straight into the page's HTML without encoding.", cat: "vuln", why: "Unencoded user input in HTML is the core XSS mistake, whatever the field." },
      { text: "Treating all user content as data to display, never as code to run.", cat: "safe", why: "The right mindset: user content is data, not instructions. Encode it on output." },
      { text: "Trusting that users 'won't type anything weird'.", cat: "vuln", why: "Hope is not a control. Attackers type exactly the weird things you did not defend against." },
      { text: "Using a framework or library that auto-escapes output by default.", cat: "safe", why: "Modern frameworks escape output for you, which is why they prevent most XSS when used properly." },
    ]} />;
}

const ACCESS_CTRL: Cat[] = [
  { id: "sound", label: "Proper access control", color: T.green },
  { id: "broken", label: "Broken access control", color: T.red },
];
export function AccessControlLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={ACCESS_CTRL}
    prompt="Broken access control, letting people reach things they should not, is the #1 web risk. For each design, decide: proper access control, or broken?"
    items={[
      { text: "The server checks, on every request, that you are allowed to see that specific record.", cat: "sound", why: "Server-side checks on every request are exactly how access control should work." },
      { text: "Letting anyone view order #124 by changing the URL from order #123.", cat: "broken", why: "If changing a number in the URL reaches someone else's data, access control is broken (an IDOR flaw)." },
      { text: "Hiding the 'admin' button but leaving the admin page reachable by typing its address.", cat: "broken", why: "Hiding a button is not access control. If the page works when reached directly, anyone can." },
      { text: "Enforcing permissions on the server, not just in the browser's interface.", cat: "sound", why: "The browser can be bypassed; the server is the only place access control truly holds." },
      { text: "Trusting a hidden field that says role=user, which a user can change to role=admin.", cat: "broken", why: "Never trust client-supplied values for permissions. The user can edit them to escalate." },
      { text: "Denying access by default, and granting only what each role genuinely needs.", cat: "sound", why: "Default-deny plus least privilege is the sound foundation of access control." },
    ]} />;
}

const WEB_FIX: Cat[] = [
  { id: "inject", label: "Injection (e.g. SQLi)", color: T.red },
  { id: "xss", label: "Cross-site scripting", color: T.amber },
  { id: "access", label: "Broken access control", color: T.cyan },
  { id: "auth", label: "Weak authentication", color: T.green },
];
export function WebFixLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={WEB_FIX}
    prompt="The OWASP Top 10 is the industry's shared list of the worst web risks. Tap each fix, then tap the risk it addresses. Knowing the fix mindset for each is what matters."
    items={[
      { text: "Use parameterised queries so input can never change the command", cat: "inject", why: "Separating data from the command is the definitive fix for SQL injection and injection generally." },
      { text: "Escape (encode) all user content on output so it is shown, not run", cat: "xss", why: "Encoding output means user content is displayed as harmless text: the core XSS fix." },
      { text: "Check permissions on the server for every request, default-deny", cat: "access", why: "Server-side, default-deny permission checks are the fix for broken access control." },
      { text: "Require strong passwords and multi-factor authentication", cat: "auth", why: "MFA and strong credentials defend against weak-authentication attacks like credential stuffing." },
      { text: "Never glue user input straight into a database query", cat: "inject", why: "Gluing input into a command is exactly what causes injection; parameterise instead." },
      { text: "Do not rely on hiding buttons; enforce access on the server", cat: "access", why: "Hiding UI is not control. Broken access control is fixed by real server-side enforcement." },
    ]} />;
}

/* ---- Module 12 labs: hardening & secure configuration ---- */

const CE_CONTROL: Cat[] = [
  { id: "firewall", label: "Firewalls", color: T.cyan },
  { id: "config", label: "Secure configuration", color: T.amber },
  { id: "access", label: "Access control", color: T.red },
  { id: "update", label: "Update management", color: T.green },
];
export function CyberEssentialsLab({ onDidTry }: LabProps) {
  return <MatchGame onDidTry={onDidTry} categories={CE_CONTROL}
    prompt="The Cyber Essentials five controls block the vast majority of common attacks. Tap each measure, then tap which control it belongs to. (Malware protection is the fifth.)"
    items={[
      { text: "Block unwanted inbound traffic at the network boundary", cat: "firewall", why: "Controlling traffic in and out at the boundary is the firewalls control." },
      { text: "Remove default passwords and disable unnecessary features", cat: "config", why: "Stripping defaults and extras is secure configuration: shrinking the attack surface." },
      { text: "Give each user only the access their role needs; limit admin accounts", cat: "access", why: "Least privilege and controlling who can do what is the access-control control." },
      { text: "Apply security updates promptly, especially for critical flaws", cat: "update", why: "Keeping software patched is the security-update (patch) management control." },
      { text: "Change the default admin login on a new router", cat: "config", why: "Defaults are public knowledge; changing them is basic secure configuration." },
      { text: "Remove an ex-employee's accounts the day they leave", cat: "access", why: "Promptly revoking access is part of access control." },
    ]} />;
}

const ATTACK_SURFACE: Cat[] = [
  { id: "reduces", label: "Reduces attack surface", color: T.green },
  { id: "increases", label: "Increases attack surface", color: T.red },
];
export function AttackSurfaceLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={ATTACK_SURFACE}
    prompt="A secure baseline is about having as little exposed as possible. For each choice, decide: does it reduce the attack surface, or increase it?"
    items={[
      { text: "Uninstalling software and services you do not actually use.", cat: "reduces", why: "Every unused component is a potential door. Removing it shrinks the attack surface." },
      { text: "Leaving every default feature and port enabled 'just in case'.", cat: "increases", why: "Unused but enabled features are extra doors attackers can try. Disable what you do not need." },
      { text: "Closing ports that no service needs to expose.", cat: "reduces", why: "Fewer open ports means fewer ways in: a core hardening step." },
      { text: "Keeping an old test account active long after the test ended.", cat: "increases", why: "Forgotten accounts are classic footholds. Remove them promptly." },
      { text: "Disabling macros by default across the organisation.", cat: "reduces", why: "Macros are a common malware vector; disabling them by default removes it." },
      { text: "Exposing a database directly to the internet for convenience.", cat: "increases", why: "Direct exposure of sensitive systems hugely increases risk. Keep them off the internet." },
    ]} />;
}

const LEAST_PRIV: Cat[] = [
  { id: "yes", label: "Follows least privilege", color: T.green },
  { id: "no", label: "Violates least privilege", color: T.red },
];
export function LeastPrivilegeLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={LEAST_PRIV}
    prompt="Least privilege means each account gets only the access it genuinely needs. For each practice, decide: follows least privilege, or violates it?"
    items={[
      { text: "Giving a new starter access only to the systems their role requires.", cat: "yes", why: "Granting exactly what the role needs, no more, is least privilege." },
      { text: "Making everyone a local administrator so support calls are easier.", cat: "no", why: "Blanket admin rights hand an attacker (or malware) the keys to everything. The opposite of least privilege." },
      { text: "Using a normal account for daily work and a separate admin account only when needed.", cat: "yes", why: "Separating everyday use from admin privilege limits what a compromise can do." },
      { text: "Leaving a departed contractor's wide-ranging access active.", cat: "no", why: "Standing, unneeded access is exactly what least privilege removes." },
      { text: "Reviewing access regularly and removing permissions no longer needed.", cat: "yes", why: "Access creep is real; regular review keeps privilege minimal." },
      { text: "Sharing one powerful admin login among the whole team.", cat: "no", why: "Shared, over-powered accounts break both least privilege and accountability." },
    ]} />;
}

export function PatchOpsLab({ onDidTry }: LabProps) {
  return <ScenarioGame onDidTry={onDidTry}
    intro="You are setting up patch management for a small organisation. Play the decisions: good operational patching is a routine, not a scramble."
    doneKicker="Process in place"
    doneNote="You built a real patch-management process: know what you run, patch critical and exposed systems fast, test sensibly, and automate the routine. That discipline closes the doors most breaches walk through."
    steps={[
      { role: "Know what you have", prompt: "Where does a reliable patching process start?", options: [
        { text: "An inventory: you cannot patch what you do not know you run.", correct: true, why: "Asset inventory is the foundation. Unknown systems are unpatched systems waiting to be breached." },
        { text: "Buying the most expensive security product.", correct: false, why: "Tools help, but without knowing what you run, you cannot patch it. Inventory comes first." },
        { text: "Hoping vendors patch everything automatically for you.", correct: false, why: "Most systems need you to apply updates. Assuming otherwise leaves doors open." },
      ] },
      { role: "What first", prompt: "A batch of updates is available. What do you prioritise?", options: [
        { text: "Critical flaws on internet-facing systems, fast; schedule the rest sensibly.", correct: true, why: "Severity and exposure set priority (Module 11). Exposed, critical, exploited flaws cannot wait." },
        { text: "Apply every update to every system at the exact same second.", correct: false, why: "Reckless mass-patching risks outages. Prioritise by risk, and test where sensible." },
        { text: "Wait months on everything to be totally safe from bugs.", correct: false, why: "Delay on critical, exposed flaws is exactly the gap attackers exploit." },
      ] },
      { role: "Make it routine", prompt: "How do you stop every patch cycle being a panic?", options: [
        { text: "Automate routine updates (e.g. auto-updates for endpoints) and schedule regular patch cycles.", correct: true, why: "Automation and a regular cadence turn patching into background routine, so humans focus on the hard cases." },
        { text: "Rely on someone remembering to check manually now and then.", correct: false, why: "Ad-hoc memory fails. A defined, automated process is what keeps you consistently patched." },
        { text: "Turn off updates to avoid the hassle.", correct: false, why: "That guarantees you fall behind and accumulate open doors. Updating is the defence." },
      ] },
    ]} />;
}

const HARDENING: Cat[] = [
  { id: "in", label: "Belongs on a hardening checklist", color: T.green },
  { id: "out", label: "Not a hardening step", color: T.faint },
];
export function HardeningChecklistLab({ onDidTry }: LabProps) {
  return <SortGame onDidTry={onDidTry} categories={HARDENING}
    prompt="A hardening checklist is the practical heart of secure configuration. For each item, decide: does it belong on a hardening checklist, or is it something else?"
    items={[
      { text: "Change or remove all default passwords and accounts.", cat: "in", why: "Defaults are public knowledge; removing them is a top hardening step." },
      { text: "Disable or uninstall services and features you do not use.", cat: "in", why: "Removing unneeded components shrinks the attack surface: core hardening." },
      { text: "Enable automatic security updates where appropriate.", cat: "in", why: "Keeping software current is central to a hardened baseline." },
      { text: "Choose a nicer colour scheme for the desktop.", cat: "out", why: "Cosmetic, not security. A hardening checklist is about reducing risk." },
      { text: "Apply least privilege and remove unnecessary admin rights.", cat: "in", why: "Minimising privilege is a key hardening control." },
      { text: "Turn on logging and monitoring so activity is recorded.", cat: "in", why: "Hardening includes being able to see what happens: enable logging." },
    ]} />;
}

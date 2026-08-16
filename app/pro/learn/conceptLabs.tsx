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

function ScenarioGame({ steps, intro, onDidTry }: LabProps & { steps: ScenarioStep[]; intro: string }) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const pick = (oi: number) => { if (chosen === null) { setChosen(oi); onDidTry(); } };
  const advance = () => { if (i + 1 >= steps.length) { setFinished(true); } else { setI(i + 1); setChosen(null); } };

  if (finished) {
    return (
      <div style={{ fontFamily: T.sans, background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.green, marginBottom: 6 }}>Played out</div>
        <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.55 }}>You switched between the attacker&apos;s and the defender&apos;s head at each step. That is the exact habit this whole course builds.</div>
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

function OrderGame({ items, prompt, onDidTry }: LabProps & { items: OrderItem[]; prompt: string }) {
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
        {checked && <span style={{ fontSize: 13.5, color: correctCount === items.length ? T.green : T.muted }}>{correctCount === items.length ? "Perfect. That is defence in depth: layer after layer." : `${correctCount} of ${items.length} in the right place. Use the arrows and check again.`}</span>}
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

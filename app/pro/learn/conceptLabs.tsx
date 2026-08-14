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

"use client";

/* Module 12 — Incident Response. Full defender seat. The Act is a live breach the
 * learner handles by choosing the right action at each stage of the IR lifecycle:
 * contain first, then eradicate, then recover — in order. Picking out-of-order or
 * destructive actions is corrected. Authored decisions, no engine. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";

type Opt = { text: string; ok: boolean; why: string };
type Stage = { title: string; prompt: string; options: Opt[] };

const STAGES: Stage[] = [
  {
    title: "Stage 1 · Contain",
    prompt: "It's live: an attacker session is active on the portal and exporting data right now. What's your FIRST action?",
    options: [
      { text: "Block the attacker's IP and kill the active session.", ok: true, why: "Right — contain first. Stop the bleeding before anything else, without destroying evidence." },
      { text: "Pull the whole server offline and wipe it immediately.", ok: false, why: "Too far, too fast — you'd destroy the evidence you need and cause an outage. Contain the attacker, don't nuke the host." },
      { text: "Start a week-long root-cause investigation.", ok: false, why: "Later. While you investigate, they're still exfiltrating. Contain now; investigate after." },
      { text: "Email all staff to warn them.", ok: false, why: "Not first — it tips off nobody useful and wastes the minutes that matter. Contain the active attacker." },
    ],
  },
  {
    title: "Stage 2 · Eradicate",
    prompt: "The attacker is locked out. Now remove their foothold for good. What do you do?",
    options: [
      { text: "Reset the compromised credentials, revoke all sessions, and close the hole they used.", ok: true, why: "Right — eradicate: kill every way back in and fix the vulnerability, or they'll simply return." },
      { text: "Just change the one password and move on.", ok: false, why: "Not enough — other sessions may be live and the original hole is still open. Revoke all sessions and fix the root cause." },
      { text: "Assume they're gone now that the IP is blocked.", ok: false, why: "A blocked IP is trivially changed. If you don't remove the foothold and fix the hole, they're back within the hour." },
    ],
  },
  {
    title: "Stage 3 · Recover & learn",
    prompt: "Threat removed. How do you close out the incident properly?",
    options: [
      { text: "Restore from clean backups, monitor closely, and run a lessons-learned review.", ok: true, why: "Right — recover safely, watch for a return, and feed the lessons back in so it can't recur." },
      { text: "Delete the logs so the breach never happened.", ok: false, why: "Never — that destroys evidence, breaks any legal duty, and throws away the lessons. Keep the logs." },
      { text: "Say nothing to anyone and hope it's over.", ok: false, why: "Hiding it risks a worse outcome and often breaches disclosure obligations. Close out properly and review." },
    ],
  },
];

function IncidentAct({ onCapture }: { onCapture: () => void }) {
  const [stage, setStage] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const s = STAGES[stage];
  function pick(i: number) {
    const o = s.options[i];
    setPicked(i);
    setMsg(o.why);
    if (o.ok) {
      setTimeout(() => {
        if (stage + 1 < STAGES.length) { setStage(stage + 1); setPicked(null); setMsg(null); }
        else onCapture();
      }, 650);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {STAGES.map((st, i) => (
          <div key={i} title={st.title} style={{ flex: 1, height: 3, borderRadius: 2, background: i < stage ? C.green : i === stage ? C.indigo : "rgba(255,255,255,.08)" }} />
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: C.indigo, fontWeight: 700 }}>{s.title.toUpperCase()}</div>
        <p style={{ color: C.soft, fontSize: 14.5, lineHeight: 1.55, margin: "8px 0 14px" }}>{s.prompt}</p>
        <div style={{ display: "grid", gap: 8 }}>
          {s.options.map((o, i) => {
            const isPicked = picked === i;
            const border = isPicked ? (o.ok ? C.green : C.red) : C.line;
            return (
              <button key={i} onClick={() => pick(i)} disabled={picked !== null && s.options[picked]?.ok} className="co-opt"
                style={{ textAlign: "left", padding: "11px 13px", borderRadius: 9, border: `1px solid ${border}`, background: isPicked ? (o.ok ? "rgba(74,222,128,.08)" : "rgba(255,91,98,.06)") : C.carbon, color: C.ink, fontFamily: "var(--font-plex-sans),system-ui", fontSize: 14, cursor: "pointer" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: isPicked ? (o.ok ? C.green : C.red) : C.mute, marginRight: 9 }}>{isPicked ? (o.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>
                {o.text}
              </button>
            );
          })}
        </div>
        {msg && <div style={{ marginTop: 12, fontSize: 13, color: picked !== null && s.options[picked]?.ok ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{msg}</div>}
      </div>
    </div>
  );
}

export const MODULE12: ModuleDef = {
  code: "M-12",
  moduleNo: 12,
  title: "Incident Response",
  client: "Harbour Systems",
  brief:
    "The breach you reconstructed last time? It’s happening again — right now, live. Harbour’s called you in not to attack, but to run the response. Everything you learned breaking in now tells you exactly how to shut an attacker down. Stay calm and work the stages in order.",
  lesson: {
    blocks: [
      { h: "Incident response has a shape", body: "When a breach is underway, you don’t improvise — you follow a lifecycle: Prepare, Detect, Contain, Eradicate, Recover, and Lessons Learned. The order matters enormously. The instinct to ‘fix everything at once’ or ‘wipe it and start over’ usually makes things worse. Calm, staged action is the whole discipline." },
      { h: "Contain before you cure", body: "The first priority once you’ve detected a live attack is containment: stop the damage spreading without destroying what you’ll need later. Block the attacker, isolate the affected account or host, kill their session. You are not yet trying to understand everything or rebuild anything — you’re stopping the bleeding while preserving the evidence." },
      { h: "Eradicate, then recover", body: "Only once contained do you eradicate: remove every foothold (reset credentials, revoke all sessions) and close the vulnerability they used, or they’ll just come back. Then recover from known-clean backups, watch closely for a return, and finally run a lessons-learned review so the same hole can’t be used twice. Never destroy the logs — they’re evidence and the source of those lessons." },
    ],
    example: {
      caption: "The right order. Each step has a job: stop it, remove it, restore safely, learn from it.",
      lines: [
        { t: "1. CONTAIN    block IP, kill session   (stop the bleeding)" },
        { t: "2. ERADICATE  reset creds, fix the hole (remove the foothold)" },
        { t: "3. RECOVER    clean backups, monitor     (restore safely)" },
        { t: "4. LEARN      review, feed back          (so it can't recur)" },
      ],
    },
    check: {
      q: "Why contain before investigating the root cause?",
      options: [
        { text: "Root cause doesn’t matter in a breach.", feedback: "It matters a lot — but later. If you investigate first, the attacker keeps causing harm meanwhile." },
        { text: "Containment stops ongoing damage; you can investigate safely once the bleeding has stopped.", correct: true, feedback: "Right — stop the harm first, preserving evidence, then dig into why." },
        { text: "Investigating first is illegal.", feedback: "It’s not illegal — it’s just the wrong order while an attacker is still active." },
      ],
    },
  },
  scope: {
    target: "Harbour Systems portal · live incident",
    inScope: "response actions on the affected account/host",
    offLimits: "destroying logs/evidence, unneeded outages, retaliating against the source",
    timebox: "the incident window",
  },
  handler: "You’re defending now. Don’t lunge for the big dramatic fix. Contain, then eradicate, then recover — in that order. Work the stages.",
  hint: "Stage order is everything: first contain (block + kill session), then eradicate (reset creds + fix the hole), then recover (clean backups + review). Never delete the logs.",
  Act: IncidentAct,
  flag: "flag{c0nt41n_th3n_3rad1cate}",
  defend: {
    blocks: [
      { h: "Preparation is the real work", body: "The reason some teams handle a breach in minutes and others in months is almost entirely preparation. A written incident-response plan, known roles, tested backups, central logging, and the ability to revoke sessions and block addresses quickly — all of that is built before anything happens. In the moment you execute a plan; you don’t invent one." },
      { h: "Practise before it’s real", body: "Teams run tabletop exercises — walking through a pretend breach exactly as you just did — so that when a real one hits, the stages are muscle memory. The calm, ordered response you just gave is a skill, and like any skill it comes from rehearsal. The worst time to first think about containment is during a live incident." },
    ],
    check: {
      q: "What most determines how well an organisation handles a breach?",
      options: [
        { text: "How powerful their newest firewall is.", feedback: "Tools help, but a breach in progress is won or lost on process and practice." },
        { text: "Preparation — a tested plan, backups, logging, and rehearsed roles.", correct: true, feedback: "Right. The response is executed, not invented, in the moment." },
        { text: "How quickly they can delete the evidence.", feedback: "Never delete evidence — that’s both counterproductive and often unlawful." },
      ],
    },
  },
  finding: {
    title: "Live breach contained, eradicated, and recovered",
    where: "Harbour Systems portal · incident response engagement",
    severity: "High",
    cvss: "8.1",
    impact: "An active account-takeover breach was handled end to end: the attacker was contained, their foothold eradicated and the entry vulnerability closed, systems recovered from clean backups, and a lessons-learned review initiated — with evidence preserved throughout.",
    fix: "Maintain a tested IR plan, central append-only logging, rapid session-revocation and IP-blocking, and regular tabletop exercises so response is executed, not improvised.",
  },
  rep: 65,
  repRank: "Lead Operator",
  repTo: "575 / 600 to Lead Operator",
  next: "NEXT MODULE · Social Engineering Defence →",
};

export default function Module12() {
  return <Engagement mod={MODULE12} />;
}

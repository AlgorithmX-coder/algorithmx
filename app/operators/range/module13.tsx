"use client";

/* Module 13 — Social Engineering Defence. ANALYSIS ONLY by design (the tier's one
 * ethical carve-out): the learner spots cons, never authors them. The Act is an
 * inbox they triage — classify each message phish/legit and read the tells.
 * Authored data, no engine. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";

type Mail = { from: string; subject: string; body: string; phish: boolean; tell: string };
const INBOX: Mail[] = [
  {
    from: "IT Helpdesk <it-support@harbour-systems-security.com>",
    subject: "URGENT: your account will be LOCKED in 2 hours",
    body: "We detected a problem. Verify your password now at http://harbour-login.verify-account.ru/reset or lose access.",
    phish: true,
    tell: "Lookalike sender domain (not harbour.range), manufactured urgency, and a link to an unrelated .ru site asking for your password. Classic credential phish.",
  },
  {
    from: "Dana Okafor <dana.okafor@calderafreight.range>",
    subject: "Q3 route plan (as discussed)",
    body: "Hi — here's the route plan from our meeting. If anything's unclear, reply and we'll go through it. No rush.",
    phish: false,
    tell: "Known sender on the correct domain, expected content you actually discussed, no credential request, no pressure. Legitimate.",
  },
  {
    from: "R. Fenwick (CEO) <rfenwick.exec@gmail.com>",
    subject: "Quick favour - need this done now",
    body: "I'm in meetings. Buy £500 of gift cards for a client and send me the codes. Keep it between us for now. Will reimburse.",
    phish: true,
    tell: "Pretexting / CEO-fraud: the 'CEO' writes from a personal Gmail, applies authority + urgency + secrecy, and asks for an irreversible payment. Verify out-of-band before acting.",
  },
];

function PhishTriageAct({ onCapture }: { onCapture: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const [verdict, setVerdict] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);

  function judge(i: number, saysPhish: boolean) {
    const correct = INBOX[i].phish === saysPhish;
    setVerdict((v) => ({ ...v, [i]: correct }));
    setMsg(`${correct ? "✓ correct" : "✗ not quite"} — ${INBOX[i].tell}`);
    const next = { ...verdict, [i]: correct };
    if (INBOX.every((_, idx) => next[idx])) onCapture();
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft }}>inbox · triage each message — you only analyse, never send</span>
        </div>
        <div style={{ display: "grid", gap: 2, padding: 10 }}>
          {INBOX.map((m, i) => (
            <div key={i}>
              <button onClick={() => { setOpen(open === i ? null : i); setMsg(null); }} className="co-opt"
                style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", borderRadius: 9, border: `1px solid ${open === i ? C.indigo : "transparent"}`, background: open === i ? "rgba(139,123,255,0.06)" : C.carbon, cursor: "pointer" }}>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: verdict[i] === undefined ? C.mute : (verdict[i] ? C.green : C.red), minWidth: 14 }}>{verdict[i] === undefined ? "•" : (verdict[i] ? "✓" : "✗")}</span>
                <span style={{ fontSize: 13, color: C.ink, fontWeight: 600, flex: 1, minWidth: 160 }}>{m.subject}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.mute, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{m.from}</span>
              </button>
              {open === i && (
                <div style={{ padding: "10px 14px 14px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 6 }}>from: {m.from}</div>
                  <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.55, margin: "0 0 12px" }}>{m.body}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => judge(i, true)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.red}66`, background: "rgba(255,91,98,.06)", color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>flag as phishing</button>
                    <button onClick={() => judge(i, false)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.green}66`, background: "rgba(74,222,128,.06)", color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>mark legitimate</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {msg && <div style={{ fontFamily: "var(--font-plex-sans),system-ui", fontSize: 13, color: msg.startsWith("✓") ? "#bff3d3" : C.soft, lineHeight: 1.55 }}>{msg}</div>}
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>triage all three correctly to file your finding</div>
    </div>
  );
}

export const MODULE13: ModuleDef = {
  code: "M-13",
  moduleNo: 13,
  title: "Social Engineering Defence",
  client: "Harbour Systems",
  brief:
    "The strongest systems still run on people, and attackers know it. Harbour forwarded a batch of messages their staff received. Your job is purely to analyse: tell the real ones from the cons, and name exactly what gives each con away. You never write one — you only learn to see them.",
  lesson: {
    blocks: [
      { h: "Hacking the human", body: "Social engineering is manipulating people into doing something unsafe — handing over a password, clicking a link, paying an invoice. It sidesteps every technical control because it targets the person, not the system. Phishing (fake messages at scale) and pretexting (inventing a believable story and role) are the two you’ll meet most." },
      { h: "The tells", body: "Cons share a fingerprint. Urgency and fear (‘your account will be locked in 2 hours’). An authority you can’t easily question (‘the CEO needs this now’). A sender address that’s almost-but-not-quite right, or a personal webmail standing in for a work one. A link whose text and real destination don’t match. And a request that’s irreversible — a password, a payment, gift-card codes. One tell is a reason to slow down; several together is a con." },
      { h: "Why we only analyse", body: "In this course you learn to recognise and defend against social engineering — never to perform it. Technical attacks here happen against fake systems that can’t be harmed; a person can be, so human-targeted manipulation stays strictly analysis-only. Spotting the con is the skill that matters, and it’s entirely a defensive one." },
    ],
    example: {
      caption: "Three tells stacked: a lookalike domain, pure urgency, and a link to an unrelated site asking for your password. Any one is suspicious; together it’s a phish.",
      lines: [
        { t: "from: it-support@harbour-systems-security.com   <- not harbour.range", leak: true },
        { t: 'subj: "URGENT: account LOCKED in 2 hours"        <- urgency', leak: true },
        { t: "link: http://...verify-account.ru/reset          <- wrong site, wants password", leak: true },
      ],
    },
    check: {
      q: "Which combination most strongly signals a phishing email?",
      options: [
        { text: "A plain subject line and a familiar sender.", feedback: "That describes ordinary legitimate mail, not a phish." },
        { text: "Urgency, a lookalike/personal sender address, and a link requesting your password.", correct: true, feedback: "Right — that stack of tells is the classic credential phish." },
        { text: "An email that contains no links at all.", feedback: "Links aren’t required for mail to be legitimate or malicious — judge by the tells, not link-presence alone." },
      ],
    },
  },
  scope: {
    target: "Harbour Systems · forwarded staff messages (copies)",
    inScope: "analysing and classifying the provided messages",
    offLimits: "crafting or sending any social-engineering message, contacting senders",
    timebox: "this session",
  },
  handler: "Read each one and ask: who’s it really from, what does it want, and how hard is it pushing? You’re only judging them — don’t reply to anything. Name the tell on each.",
  hint: "Two are cons: the ‘IT helpdesk’ one (lookalike domain + urgency + password link) and the ‘CEO’ gift-card request (personal Gmail + authority + irreversible payment). The route-plan email is genuine.",
  Act: PhishTriageAct,
  flag: "flag{ph1sh_n0t_cl1cked}",
  defend: {
    blocks: [
      { h: "Make the human safer", body: "You can’t patch people, but you can build guardrails. Email authentication (SPF, DKIM, DMARC) blocks a lot of spoofed senders. A banner on all external mail reminds staff to be careful. A one-click ‘report phishing’ button turns every employee into a sensor. And a rule that any money or credential request is verified out-of-band — a phone call on a known number — defeats CEO-fraud regardless of how convincing the message is." },
      { h: "Train the instinct, not the fear", body: "The goal isn’t to make people paranoid; it’s to make slowing-down automatic when the tells appear. Regular, blame-free awareness training and simulated-phish exercises build that instinct. People who feel safe reporting a mistake report it fast — and fast reporting is what turns a near-miss into a non-event instead of a breach." },
    ],
    check: {
      q: "What best defends against a convincing CEO-fraud payment request?",
      options: [
        { text: "A stronger spam filter.", feedback: "Helps with bulk phishing, but a targeted, well-written request can slip through. You need a process control." },
        { text: "Verifying any money/credential request out-of-band on a known number before acting.", correct: true, feedback: "Right — out-of-band verification defeats the con no matter how convincing the message." },
        { text: "Replying to the email to ask if it’s really them.", feedback: "The attacker controls that thread — they’ll just say yes. Verify through a separate, known channel." },
      ],
    },
  },
  finding: {
    title: "Phishing and pretexting reaching staff inboxes",
    where: "Harbour Systems · staff email · credential phish + CEO-fraud pretext",
    severity: "Medium",
    cvss: "5.3",
    impact: "Convincing phishing and CEO-fraud messages are reaching staff inboxes. A single click or compliant employee could hand over credentials or make an irreversible payment, bypassing technical controls entirely.",
    fix: "Enforce SPF/DKIM/DMARC, banner external mail, add a report-phishing button, require out-of-band verification for money/credential requests, and run blame-free awareness training.",
  },
  rep: 50,
  repRank: "Lead Operator",
  repTo: "625 / 1000 to Principal",
  next: "NEXT MODULE · Disclosure & Reporting →",
};

export default function Module13() {
  return <Engagement mod={MODULE13} />;
}

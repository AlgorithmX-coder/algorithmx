"use client";

/* Module 11 — Digital Forensics. The hinge: the learner starts reading the other
 * side. The Act is an access log they scan to reconstruct an attack timeline and
 * pinpoint the moment of compromise (the successful login after a 401 storm).
 * Authored data, no engine. Sets up the blue-team role flip (12-14). */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";

type Line = { t: string; ip: string; req: string; status: number; kind: "normal" | "attempt" | "breach" | "impact" };
const LOG: Line[] = [
  { t: "09:14:02", ip: "198.51.100.7", req: "GET /dashboard", status: 200, kind: "normal" },
  { t: "09:15:40", ip: "198.51.100.7", req: "GET /api/routes", status: 200, kind: "normal" },
  { t: "02:03:11", ip: "203.0.113.9", req: "POST /login", status: 401, kind: "attempt" },
  { t: "02:03:12", ip: "203.0.113.9", req: "POST /login", status: 401, kind: "attempt" },
  { t: "02:03:12", ip: "203.0.113.9", req: "POST /login", status: 401, kind: "attempt" },
  { t: "02:03:13", ip: "203.0.113.9", req: "POST /login", status: 401, kind: "attempt" },
  { t: "02:03:14", ip: "203.0.113.9", req: "POST /login", status: 200, kind: "breach" },
  { t: "02:03:40", ip: "203.0.113.9", req: "GET /admin", status: 200, kind: "impact" },
  { t: "02:04:05", ip: "203.0.113.9", req: "GET /api/export?all=1", status: 200, kind: "impact" },
  { t: "08:55:19", ip: "198.51.100.7", req: "GET /dashboard", status: 200, kind: "normal" },
];

function LogAnalysisAct({ onCapture }: { onCapture: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function pick(i: number) {
    const l = LOG[i];
    setPicked(i);
    if (l.kind === "breach") { setMsg("✓ That's it — after four failures in two seconds, this 200 is the brute-force succeeding. This is the moment of compromise."); onCapture(); }
    else if (l.kind === "attempt") setMsg("That's one of the failed attempts (401) — the attack in progress. Which request is where it actually succeeded?");
    else if (l.kind === "impact") setMsg("That's what they did *after* getting in (admin access / data export) — the impact. But when did they get in?");
    else setMsg("That's normal daytime traffic from a staff IP. Look for the burst of failures in the small hours.");
  }

  const statusColor = (s: number) => (s === 200 ? C.green : C.red);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>⌦ AUTH ACCESS LOG · click the moment of compromise</div>
        <div style={{ display: "grid", gap: 3 }}>
          {LOG.map((l, i) => (
            <button key={i} onClick={() => pick(i)} className="co-opt"
              style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "7px 10px", borderRadius: 7, border: `1px solid ${picked === i ? C.indigo : "transparent"}`, background: picked === i ? "rgba(139,123,255,0.06)" : C.carbon, cursor: "pointer" }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, minWidth: 64 }}>{l.t}</span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: l.ip === "203.0.113.9" ? C.amber : C.soft, minWidth: 104 }}>{l.ip}</span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, flex: 1, minWidth: 150 }}>{l.req}</span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: statusColor(l.status), fontWeight: 700 }}>{l.status}</span>
            </button>
          ))}
        </div>
      </div>
      {msg && <div style={{ fontFamily: MONO, fontSize: 12.5, color: msg.startsWith("✓") ? C.green : C.soft, lineHeight: 1.6 }}>{msg}</div>}
    </div>
  );
}

export const MODULE11: ModuleDef = {
  code: "M-11",
  moduleNo: 11,
  title: "Digital Forensics",
  client: "Harbour Systems",
  brief:
    "Something happened on Harbour’s portal overnight and they’ve pulled the access logs. This engagement flips your seat: you’re not breaking in now — you’re reading the trail someone else left. Reconstruct what happened and pinpoint the exact moment they got in.",
  lesson: {
    blocks: [
      { h: "Everything leaves a trail", body: "Systems log what happens to them: who connected, when, from where, what they asked for, and whether it worked. Digital forensics is the craft of reading those trails after the fact to reconstruct events. The same observation skills you used to attack now work in reverse — you’re looking for the story the data tells." },
      { h: "Build a timeline", body: "The core technique is timeline reconstruction: put events in order and look for the shape of an attack. A burst of failed logins (status 401) from one unfamiliar address, at 2am, followed suddenly by a success (200) — that’s a brute-force that landed. What comes next (an admin page, a bulk data export) tells you what they did once inside." },
      { h: "Indicators of compromise", body: "Specific clues that something’s wrong are called indicators of compromise: an unknown IP, activity at an odd hour, a spike of errors, access to sensitive endpoints. Spotting them quickly is the whole game in defence — the attacker’s footprints are right there in the log, if someone is reading it." },
    ],
    example: {
      caption: "Four failures in two seconds from one night-time IP, then a 200 — that single success is the moment of compromise. What follows is the damage.",
      lines: [
        { t: "02:03:11  203.0.113.9  POST /login   401" },
        { t: "02:03:13  203.0.113.9  POST /login   401" },
        { t: "02:03:14  203.0.113.9  POST /login   200   <- in", leak: true },
        { t: "02:04:05  203.0.113.9  GET /api/export?all=1  200  <- exfil", leak: true },
      ],
    },
    check: {
      q: "In the log, which single entry marks the moment of compromise?",
      options: [
        { text: "The first failed login (401).", feedback: "That’s the attack starting — an attempt, not a success." },
        { text: "The successful login (200) from the attacker’s IP right after the run of failures.", correct: true, feedback: "Right — that 200 after the 401 storm is where the brute-force actually got in." },
        { text: "The data export request.", feedback: "That’s the impact — what they did after getting in. Compromise happened at the successful login just before." },
      ],
    },
  },
  scope: {
    target: "Harbour Systems portal · overnight access logs",
    inScope: "reading and interpreting the provided log",
    offLimits: "altering logs, contacting the source IP, acting outside analysis",
    timebox: "this session",
  },
  handler: "Different job today — you’re the defender. Walk the log, find the brute-force in the small hours, and put your finger on the one line where they got in. Not the attempts, not the aftermath. The moment.",
  hint: "Find the night-time IP (203.0.113.9) with a run of 401s, then the single 200 right after — that success is the moment of compromise.",
  Act: LogAnalysisAct,
  flag: "flag{br3ach_t1meline_built}",
  defend: {
    blocks: [
      { h: "Detect it as it happens", body: "The whole attack was visible in the log — the fix is to be watching. Alert on bursts of failed logins, on logins from new countries or at odd hours, and on access to sensitive endpoints like bulk export. The earlier an indicator of compromise is caught, the smaller the damage; a 2am 401 storm should have paged someone before the 200 ever landed." },
      { h: "Make the trail trustworthy", body: "Forensics only works if the logs survive and can’t be quietly edited. Ship logs off the host to a central, append-only store, keep them long enough to investigate, and make sure they capture the useful fields (time, source IP, user, action, result). An attacker’s first instinct is to erase their tracks — don’t keep the only copy where they can reach it." },
    ],
    check: {
      q: "What would have caught this attack soonest?",
      options: [
        { text: "Alerting on a burst of failed logins from one IP at an unusual hour.", correct: true, feedback: "Right — that indicator fires before the successful login, giving you time to respond." },
        { text: "Reading the logs once a year.", feedback: "Far too slow — the data would be exported long before anyone looked." },
        { text: "Deleting old logs to save space.", feedback: "That destroys the very evidence forensics depends on." },
      ],
    },
  },
  finding: {
    title: "Account takeover via credential brute-force, then data export",
    where: "Harbour Systems portal · auth logs · source 203.0.113.9",
    severity: "High",
    cvss: "8.1",
    impact: "An external IP brute-forced a portal account (four failures, then success at 02:03:14), reached /admin, and bulk-exported data — a full account takeover and data breach, all visible in the logs but undetected at the time.",
    fix: "Add lockout/rate-limiting and MFA (close the brute-force path); alert on failed-login bursts and odd-hour access; ship logs to an append-only store; block the IP and force password resets.",
  },
  rep: 60,
  repRank: "Operator",
  repTo: "510 / 600 to Lead Operator",
  next: "NEXT MODULE · Incident Response →",
};

export default function Module11() {
  return <Engagement mod={MODULE11} />;
}

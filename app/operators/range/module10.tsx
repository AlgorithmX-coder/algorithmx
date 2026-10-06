"use client";

/* Module 10 — Network Recon. The Act is a port scan against a fake perimeter
 * host: the learner runs the scan, reads the open ports/services, and flags the
 * dangerous exposure (Remote Desktop open to the internet; an ancient FTP is a
 * secondary risk). Teaches port scanning + service enumeration + attack surface.
 * Authored data, no engine. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

type Port = { port: number; proto: string; service: string; note: string; risk: "ok" | "watch" | "bad" };
const PORTS: Port[] = [
  { port: 22, proto: "tcp", service: "ssh · OpenSSH 9.6", note: "current, key-auth", risk: "ok" },
  { port: 80, proto: "tcp", service: "http · nginx", note: "redirects to 443", risk: "ok" },
  { port: 443, proto: "tcp", service: "https · nginx", note: "valid cert", risk: "ok" },
  { port: 21, proto: "tcp", service: "ftp · vsftpd 2.3.4", note: "ancient, known-vulnerable version", risk: "watch" },
  { port: 3389, proto: "tcp", service: "rdp · MS Terminal Services", note: "Remote Desktop — reachable from the whole internet", risk: "bad" },
];

function PortScanAct({ onCapture }: { onCapture: () => void }) {
  const [scanned, setScanned] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function pick(p: Port) {
    setPicked(p.port);
    if (p.risk === "bad") { setMsg(`✓ ${p.port}/${p.proto} — ${p.service}. Remote Desktop open to the internet is a critical exposure: it's brute-forced and exploited constantly.`); onCapture(); }
    else if (p.risk === "watch") setMsg(`${p.port}/${p.proto} — a real concern (outdated, vulnerable service), but there's something worse open. Keep looking.`);
    else setMsg(`${p.port}/${p.proto} — expected and reasonably safe. Not the headline exposure.`);
  }

  const riskColor = (r: Port["risk"]) => (r === "bad" ? C.red : r === "watch" ? C.amber : C.green);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: "#8fa0c8" }}>$ scan fleet-gw.harbour.range</div>
        {!scanned ? (
          <div style={{ marginTop: 12 }}><Btn tone="i" onClick={() => setScanned(true)}>RUN PORT SCAN →</Btn></div>
        ) : (
          <>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, margin: "10px 0 8px" }}>// scan complete · {PORTS.length} open ports · click the most dangerous exposure</div>
            <div style={{ display: "grid", gap: 6 }}>
              {PORTS.map((p) => (
                <button key={p.port} onClick={() => pick(p)} className="co-opt"
                  style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, border: `1px solid ${picked === p.port ? riskColor(p.risk) : C.lineSoft}`, background: C.carbon, cursor: "pointer" }}>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink, minWidth: 70 }}>{p.port}/{p.proto}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft, flex: 1, minWidth: 150 }}>{p.service}</span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: riskColor(p.risk) }} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {msg && <div style={{ fontFamily: MONO, fontSize: 12.5, color: msg.startsWith("✓") ? C.green : C.soft, lineHeight: 1.6 }}>{msg}</div>}
    </div>
  );
}

export const MODULE10: ModuleDef = {
  code: "M-10",
  moduleNo: 10,
  title: "Network Recon",
  client: "Harbour Systems",
  brief:
    "Harbour wants to know what their network looks like from the outside — what a stranger on the internet can even see. You’ve got authorization to scan one perimeter host, fleet-gw. Map what’s open, and tell them which open door should worry them most.",
  lesson: {
    blocks: [
      { h: "Services listen on ports", body: "A server offers services — web, email, remote login — and each listens on a numbered port. Web is usually 80 and 443, SSH is 22, Remote Desktop is 3389. A port scan asks a host, one port at a time, ‘is anything listening here?’ The list of open ports is a map of everything the machine offers to whoever can reach it." },
      { h: "Enumeration: what and which version", body: "Knowing a port is open is step one; the real value is service enumeration — identifying what’s running and which version. ‘Port 21 open’ is mild. ‘Port 21 running vsftpd 2.3.4’ is a gift, because an attacker can look up known vulnerabilities for that exact version. Old, unpatched services are where a lot of break-ins begin." },
      { h: "Attack surface", body: "Every open port is a potential way in — together they’re your attack surface. The goal of recon (and of defence) is to shrink it: close ports nothing needs, keep what’s left patched, and never expose sensitive management services like Remote Desktop to the whole internet, where they’re found and attacked within minutes." },
    ],
    example: {
      caption: "Two findings stand out: an ancient FTP with known exploits, and Remote Desktop open to the entire internet — the latter is relentlessly brute-forced and is the bigger emergency.",
      lines: [
        { t: "21/tcp   ftp   vsftpd 2.3.4     <- old, known-vulnerable", leak: true },
        { t: "22/tcp   ssh   OpenSSH 9.6      ok" },
        { t: "443/tcp  https nginx            ok" },
        { t: "3389/tcp rdp   Terminal Svcs    <- exposed to the internet", leak: true },
      ],
    },
    check: {
      q: "Why is identifying the service *version* so valuable in recon?",
      options: [
        { text: "Newer version numbers are always safe to ignore.", feedback: "Version matters precisely because some (often old) versions have known, published vulnerabilities." },
        { text: "A specific version can be matched to known, published vulnerabilities for that exact software.", correct: true, feedback: "Right — ‘vsftpd 2.3.4’ tells an attacker exactly which exploit to reach for." },
        { text: "The version number is the server’s password.", feedback: "No — it just identifies the software; its value is matching it to known weaknesses." },
      ],
    },
  },
  scope: {
    target: "fleet-gw.harbour.range — one perimeter host",
    inScope: "a port scan of this single authorized host",
    offLimits: "exploiting anything found, other hosts, internal network",
    timebox: "this session",
  },
  handler: "Run the scan, then read the results like an attacker would. Plenty is fine. One thing shouldn’t be facing the open internet at all — find it and call it.",
  hint: "Expected ports (22/80/443) are fine. The headline exposure is Remote Desktop (3389) open to the whole internet — click that.",
  Act: PortScanAct,
  flag: "flag{rdp_exp0sed_t0_w0rld}",
  defend: {
    blocks: [
      { h: "Shrink and shield the surface", body: "Close every port that doesn’t need to be open. For the ones that must stay, restrict who can reach them — management services like RDP and SSH should sit behind a VPN or an allow-list, never open to the whole internet. And patch relentlessly: that vsftpd 2.3.4 is only dangerous because it’s years out of date." },
      { h: "Know your own perimeter", body: "Defenders scan themselves on a schedule, exactly as you just did, so they discover an accidentally-exposed service before an attacker does. The internet is scanned end to end constantly; an exposed RDP port is typically found and under attack within minutes of going live. You can’t defend an attack surface you haven’t measured." },
    ],
    check: {
      q: "What’s the right fix for the exposed Remote Desktop?",
      options: [
        { text: "Change RDP to a different port number.", feedback: "Obscurity only — scanners find it on any port. The service is still exposed and attacked." },
        { text: "Restrict it behind a VPN / allow-list (don’t expose it to the internet) and keep it patched.", correct: true, feedback: "Right — remove it from the open internet and limit who can reach it." },
        { text: "Leave it open but pick a stronger admin password.", feedback: "Better than nothing, but an exposed RDP is still relentlessly attacked; take it off the open internet." },
      ],
    },
  },
  finding: {
    title: "Remote Desktop (RDP) exposed to the internet",
    where: "fleet-gw.harbour.range · 3389/tcp · MS Terminal Services",
    severity: "High",
    cvss: "8.6",
    impact: "Remote Desktop is reachable from the entire internet, where it is continuously brute-forced and exploited — a direct, high-value path to full control of the host. An outdated vsftpd 2.3.4 on 21/tcp compounds the exposure.",
    fix: "Remove RDP from the open internet (VPN or allow-list only); close unused ports; patch or retire the outdated FTP service; scan the perimeter regularly.",
  },
  rep: 55,
  repRank: "Operator",
  repTo: "450 / 600 to Lead Operator",
  next: "NEXT MODULE · Digital Forensics →",
};

export default function Module10() {
  return <Engagement mod={MODULE10} />;
}

"use client";

/* Module 10 - Network Recon (DEPTH STANDARD, built to the M5 framework).
 *
 * Network recon has no real sockets in a browser, so the target is a simulated
 * perimeter modelled in-browser (zero egress). Every activity is hands-on: run a
 * port scan and flag the exposure, enumerate service versions and classify which
 * are known-vulnerable, sweep a subnet to find an internal host that shouldn't be
 * reachable, and make the prioritisation call. Shape mirrors M5: hover glossary,
 * interactive lesson lab, de-biased check, a FOUR-stage capture with a hint
 * ladder, FOUR drills, and a chained capstone. */

import { useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "port", definition: "A numbered door on a server. Each service listens on one - web on 80/443, SSH on 22, Remote Desktop on 3389.", example: "Think of a block of flats where each flat number is a port: knock on 443 and the website answers, knock on 22 and the remote-login service answers." },
  { term: "service", definition: "A program a server offers over the network - a web server, mail, remote login. Each listens on a port.", example: "The Minecraft server your mates join is a service listening on port 25565, and the game knocks on that exact port to connect." },
  { term: "port scan", definition: "Asking a host, port by port, 'is anything listening here?' The open ports map everything the machine offers.", example: "Like walking a corridor trying every door handle to see which rooms are unlocked, a scan of a shop's server might reveal 80, 443 and an accidentally open 3389." },
  { term: "service enumeration", definition: "Going beyond 'a port is open' to identify exactly what software and which version is running on it.", example: "Not just 'port 80 is open' but 'it is Apache 2.4.49 behind it' - the extra detail that tells you which attacks might work." },
  { term: "banner", definition: "The identifying text a service announces when you connect - often naming the software and version, a gift for recon.", example: "Connecting to a mail server and seeing it reply 'Exim 4.92 ready' hands an attacker the exact software and version for free." },
  { term: "version", definition: "Which release of a piece of software is running. It matters because specific versions have specific known vulnerabilities.", example: "Running an old phone on iOS 14 while everyone else is on iOS 18 - the outdated version still has holes that newer releases patched long ago." },
  { term: "known vulnerability", definition: "A published weakness in a specific software version (a CVE). Match a version to its CVEs and you know exactly what to try.", example: "Looking up 'Apache 2.4.49' and finding CVE-2021-41773, a public flaw, gives an attacker a ready-made recipe for that exact version." },
  { term: "attack surface", definition: "Everything an attacker could reach - every open port, service and host the organisation exposes. Recon maps it; defence shrinks it.", example: "A shop that puts its website, email and a forgotten test server all on the public internet has three times the attack surface of one that exposes only its website." },
  { term: "subnet", definition: "A block of network addresses, like 10.0.5.0/24 - a range of hosts you can sweep to find which are alive.", example: "The 10.0.5.0/24 block holds 254 possible addresses, like a street of 254 houses you can go door to door checking which are occupied." },
  { term: "host discovery", definition: "Sweeping a subnet to find which addresses have a live machine - mapping the network before probing individual hosts.", example: "Pinging every address on the office network and getting 12 replies tells you there are 12 live machines to investigate, not 254." },
  { term: "RDP", definition: "Remote Desktop Protocol (port 3389) - remote control of a Windows machine. Exposing it to the internet is relentlessly attacked.", example: "A small firm left RDP open so staff could work from home, and within hours bots worldwide were hammering port 3389 trying common passwords." },
  { term: "VPN", definition: "A private tunnel into a network. Management services should sit behind one, not on the open internet.", example: "Instead of exposing the office server to everyone, staff first connect through a VPN, like showing ID at a locked gate before the building doors are even visible." },
  { term: "firewall", definition: "A control that decides which ports and hosts are reachable from where - the main tool for shrinking the attack surface.", example: "Setting the firewall to allow only ports 80 and 443 from the internet, and to block 3389, slams the door the RDP attackers were knocking on." },
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

/* ── scan + pick: run a scan, read the rows, flag the target ── */
type ScanRow = { col1: string; col2: string; risk: "ok" | "watch" | "bad" };
function ScanPickSurface({ cmd, prompt, rows, hint, onSolved }: { cmd: string; prompt: string; rows: ScanRow[]; hint: string; onSolved: () => void }) {
  const [scanned, setScanned] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  // The scan reveals the services and versions, but NOT a risk colour, so you
  // have to read them and decide. Selecting a row never wins; you flag the one
  // you judge the worst, then confirm. The verdict shows only after you commit.
  function confirm() {
    if (!picked || solved) return;
    const r = rows.find((x) => x.col1 === picked)!;
    if (r.risk === "bad") { setVerdict({ ok: true, text: `${r.col1} - ${r.col2}. That's the critical exposure.` }); setSolved(true); onSolved(); }
    else if (r.risk === "watch") setVerdict({ ok: false, text: `${r.col1} is a real concern, but there's something worse open here. Keep looking.` });
    else setVerdict({ ok: false, text: `${r.col1} is expected and reasonably safe. Not the headline exposure.` });
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 12, color: "#8fa0c8" }}>$ {cmd}</div>
      {!scanned ? (
        <div style={{ marginTop: 12 }}><Btn tone="i" onClick={() => setScanned(true)}>RUN SCAN →</Btn></div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, margin: "10px 0 8px" }}>// scan complete · {rows.length} results · {prompt}</div>
          <div style={{ display: "grid", gap: 6 }}>
            {rows.map((r) => {
              const isSel = picked === r.col1; const good = solved && r.risk === "bad";
              return (
                <button key={r.col1} onClick={() => { if (!solved) { setPicked(r.col1); setVerdict(null); } }} disabled={solved} className="co-opt" style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, border: `1px solid ${good ? C.green : isSel ? C.indigo : C.lineSoft}`, background: isSel ? "rgba(139,123,255,0.08)" : C.carbon, cursor: solved ? "default" : "pointer" }}>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: good ? C.green : C.ink, minWidth: 110 }}>{good ? "✓ " : ""}{r.col1}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft, flex: 1, minWidth: 150 }}>{r.col2}</span>
                </button>
              );
            })}
          </div>
          {!solved && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
              <Btn tone="g" onClick={confirm} disabled={!picked}>Flag this as the exposure →</Btn>
              {verdict && !verdict.ok && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>{verdict.text}</span>}
            </div>
          )}
          {verdict && verdict.ok && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, marginTop: 10, lineHeight: 1.6 }}>✓ {verdict.text}</div>}
          <Hints hints={[hint]} />
        </>
      )}
    </div>
  );
}

/* ── classify: mark each service version vulnerable or current ── */
type VerItem = { label: string; vuln: boolean; note: string };
function ClassifySurface({ items, hint, onSolved }: { items: VerItem[]; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, "vuln" | "ok">>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const all = items.every((it) => pick[it.label]);
  function check() { setChecked(true); if (items.every((it) => (pick[it.label] === "vuln") === it.vuln)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// which versions have known, published vulnerabilities, and which are current?</div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => {
          const p = pick[it.label]; const right = checked && (p === "vuln") === it.vuln; const wrong = checked && p && (p === "vuln") !== it.vuln;
          return (
            <div key={it.label} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <span style={{ flex: "1 1 200px", fontFamily: MONO, fontSize: 12.5, color: C.ink }}>{it.label}</span>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "vuln" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "vuln" ? C.red : C.line}`, background: "transparent", color: p === "vuln" ? C.red : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>known-vulnerable</button>
              <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "ok" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "ok" ? C.green : C.line}`, background: "transparent", color: p === "ok" ? C.green : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>current</button>
              {((checked && wrong) || solved) && <div style={{ flexBasis: "100%", fontFamily: MONO, fontSize: 11.5, color: solved ? C.green : C.amber }}>↳ {it.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CHECK →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Old version numbers are the tell.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Versions triaged - now you know exactly which services to look up exploits for.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── decision: a judgment call ── */
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

/* ── a stage ── */
type Stage =
  | { kind: "scan"; title: string; goal: string; cmd: string; prompt: string; rows: ScanRow[]; hint: string }
  | { kind: "classify"; title: string; goal: string; items: VerItem[]; hint: string }
  | { kind: "decision"; title: string; goal: string; decision: Decision };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "scan" && <ScanPickSurface cmd={stage.cmd} prompt={stage.prompt} rows={stage.rows} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "classify" && <ClassifySurface items={stage.items} hint={stage.hint} onSolved={onSolved} />}
      {stage.kind === "decision" && <DecisionCard decision={stage.decision} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Harbour perimeter) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  {
    kind: "scan", title: "Port scan", goal: "Stage 1 - Map the perimeter. Run a port scan of the gateway and flag the one open door that should never face the internet.",
    cmd: "scan fleet-gw.harbour.range", prompt: "click the most dangerous exposure",
    rows: [
      { col1: "22/tcp", col2: "ssh · OpenSSH 9.6 (current)", risk: "ok" },
      { col1: "80/tcp", col2: "http · nginx (redirects to 443)", risk: "ok" },
      { col1: "443/tcp", col2: "https · nginx (valid cert)", risk: "ok" },
      { col1: "21/tcp", col2: "ftp · vsftpd 2.3.4 (ancient)", risk: "watch" },
      { col1: "3389/tcp", col2: "rdp · Terminal Services (open to the whole internet)", risk: "bad" },
    ],
    hint: "22/80/443 are expected. The headline exposure is Remote Desktop (3389) open to the whole internet - click it.",
  },
  {
    kind: "classify", title: "Versions", goal: "Stage 2 - Enumerate versions. A port being open is step one; the version tells you what to exploit. Mark each enumerated service known-vulnerable or current.",
    items: [
      { label: "vsftpd 2.3.4 (ftp)", vuln: true, note: "vsftpd 2.3.4 has a notorious backdoor - a classic known-vulnerable version." },
      { label: "OpenSSH 9.6 (ssh)", vuln: false, note: "A current OpenSSH release - not the weak point here." },
      { label: "Apache 2.4.49 (http)", vuln: true, note: "Apache 2.4.49 has a well-known path-traversal/RCE flaw (CVE-2021-41773)." },
      { label: "nginx 1.24 (https)", vuln: false, note: "A current nginx - fine." },
    ],
    hint: "The old, specific version numbers (vsftpd 2.3.4, Apache 2.4.49) are the known-vulnerable ones; the current releases are fine.",
  },
  {
    kind: "scan", title: "Subnet sweep", goal: "Stage 3 - Map the network. Sweep the internal subnet to discover live hosts, and flag the one that should never be reachable from here.",
    cmd: "sweep 10.0.5.0/24", prompt: "click the host that shouldn't be exposed",
    rows: [
      { col1: "10.0.5.1", col2: "gateway (expected)", risk: "ok" },
      { col1: "10.0.5.10", col2: "web-front (80/443)", risk: "ok" },
      { col1: "10.0.5.40", col2: "db-prod (3306 MySQL, reachable)", risk: "bad" },
      { col1: "10.0.5.90", col2: "print-01 (printer)", risk: "watch" },
    ],
    hint: "A production database (3306) reachable from the general network is the dangerous find - click db-prod.",
  },
  {
    kind: "decision", title: "Prioritise", goal: "Stage 4 - Make the call. You've mapped the exposure. What do you put at the top of the report?",
    decision: { prompt: "Across everything you found, what's the right top recommendation?", options: [
      { text: "Take RDP and the prod database off the open network, then patch the outdated services.", correct: true, feedback: "Right. Remove the directly-reachable high-value exposures first (RDP, the prod DB), then close the known-vulnerable versions. That's priority order." },
      { text: "Move RDP to a non-standard port so scanners can't find it.", feedback: "Obscurity only - scanners find services on any port. The exposure remains and is still attacked." },
      { text: "Leave everything open but set strong passwords everywhere.", feedback: "An exposed RDP and a reachable prod DB are attacked regardless of password strength; take them off the open network." },
      { text: "Just upgrade the FTP server and call it done.", feedback: "The FTP is a real issue, but the internet-facing RDP and the reachable prod DB are bigger - don't stop there." },
    ] },
  },
];

function NetReconAct({ onCapture }: { onCapture: () => void }) {
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

/* ───────────────────────── lesson lab: watch a scan reveal ports ───────────────────────── */

function ScanLab({ onDone }: { onDone: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const PORTS = ["22/tcp  ssh", "80/tcp  http", "443/tcp https", "3389/tcp rdp  <- exposed"];
  function run() {
    let n = 0;
    const iv = setInterval(() => { n++; setRevealed(n); if (n >= PORTS.length) { clearInterval(iv); onDone(); } }, 350);
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · a scan maps what a host offers</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Run a scan and watch the open ports appear one by one - that list is the host&apos;s whole attack surface.</div>
      <div style={{ fontFamily: MONO, fontSize: 12.5, color: "#8fa0c8" }}>$ scan demo.harbour.range</div>
      <div style={{ display: "grid", gap: 3, margin: "8px 0", minHeight: 80 }}>
        {PORTS.slice(0, revealed).map((p, i) => <div key={i} className="co-anim co-pop" style={{ fontFamily: MONO, fontSize: 12.5, color: p.includes("exposed") ? C.amber : C.soft }}>{p}</div>)}
      </div>
      {revealed === 0 ? <Btn tone="i" onClick={run}>RUN SCAN →</Btn> : revealed >= PORTS.length && <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>Four open doors - and one of them (RDP) should never face the internet. Reading that list is network recon.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the fix ───────────────────────── */

function PickFixLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Move RDP to port 33890 so scanners miss it", ok: false, why: "Obscurity. Scanners sweep all ports, so the service is still exposed and attacked." },
    { code: "Leave it open, but rely on a very strong password", ok: false, why: "Exposed RDP is brute-forced and exploited continuously regardless. Take it off the open internet." },
    { code: "Rename the admin account so attackers can't target the login", ok: false, why: "Still obscurity. The login is reachable either way, and attackers enumerate usernames anyway." },
    { code: "Put RDP behind a VPN or allow-list, and patch the rest", ok: true, why: "Shrink and shield the attack surface: reachable only to who needs it, and everything current. The real fix." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · how do you fix the exposed RDP?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
        mono
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Scan Brightpost's gateway and flag the exposure. No walkthrough.", stages: [{ kind: "scan", title: "Scan", goal: "Flag the dangerous open port.", cmd: "scan gw.brightpost.range", prompt: "click the worst exposure", rows: [ { col1: "443/tcp", col2: "https nginx (ok)", risk: "ok" }, { col1: "22/tcp", col2: "ssh OpenSSH 9.6 (ok)", risk: "ok" }, { col1: "5900/tcp", col2: "vnc · no password, open to internet", risk: "bad" } ], hint: "VNC with no password on the internet is the critical one." }], success: "Found an open, passwordless VNC on the internet - direct remote control. Finding logged." },
  { client: "Tideway Council", brief: "Enumerate Tideway's service versions and triage them.", stages: [{ kind: "classify", title: "Versions", goal: "Mark each version vulnerable or current.", items: [ { label: "ProFTPD 1.3.3c", vuln: true, note: "1.3.3c shipped with a backdoor - known-vulnerable." }, { label: "OpenSSH 9.6", vuln: false, note: "Current." } ], hint: "The old, oddly-specific version is the vulnerable one." }], success: "Triaged versions so you only chase the exploitable service. Finding logged." },
  { client: "Flux Fitness", brief: "Sweep Flux's subnet and find the host that shouldn't be reachable. Trickier.", stages: [{ kind: "scan", title: "Sweep", goal: "Find the exposed internal host.", cmd: "sweep 10.0.9.0/24", prompt: "click the host that shouldn't be reachable", rows: [ { col1: "10.0.9.10", col2: "web (ok)", risk: "ok" }, { col1: "10.0.9.50", col2: "backup-nas (open SMB share, reachable)", risk: "bad" } ], hint: "An open backup share reachable across the network is the find." }], success: "Found a reachable backup share - a goldmine if an attacker gets a foothold. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Scan, enumerate, then make the call. Chain it yourself.", stages: [
    { kind: "scan", title: "Scan", goal: "Step 1: flag the exposure.", cmd: "scan gw.oakline.range", prompt: "worst exposure", rows: [ { col1: "443/tcp", col2: "https (ok)", risk: "ok" }, { col1: "3389/tcp", col2: "rdp open to internet", risk: "bad" } ], hint: "Internet-facing RDP." },
    { kind: "decision", title: "Call", goal: "Step 2: the top recommendation?", decision: { prompt: "What goes top of Oakline's report?", options: [ { text: "Take RDP off the open internet with a VPN or allow-list, then patch the services.", correct: true, feedback: "Right. Remove the direct exposure first, then patch." }, { text: "Change the RDP port number so the port scanners miss it.", feedback: "Obscurity isn't a fix. Scanners find the service on any port." }, { text: "Leave it open but enforce a long, complex administrator password.", feedback: "Exposed RDP is attacked regardless of how strong the password is." }, { text: "Turn RDP off completely so that nobody can ever use it.", feedback: "Over-correction that breaks legitimate remote admin. Restrict access, don't kill the service." } ] } },
  ], success: "Scanned, prioritised, and recommended correctly - the whole recon-to-report chain. Finding logged." },
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
  { kind: "scan", title: "Scan", goal: "Scan Sableline's gateway and flag the exposure.", cmd: "scan gw.sableline.range", prompt: "worst exposure", rows: [ { col1: "443/tcp", col2: "https (ok)", risk: "ok" }, { col1: "22/tcp", col2: "ssh OpenSSH 9.6 (ok)", risk: "ok" }, { col1: "3389/tcp", col2: "rdp open to the internet", risk: "bad" } ], hint: "Internet-facing RDP is the critical one." },
  { kind: "classify", title: "Versions", goal: "Enumerate and triage the service versions.", items: [ { label: "Exim 4.87", vuln: true, note: "Exim 4.87 has known remote-code-execution flaws." }, { label: "nginx 1.24", vuln: false, note: "Current." } ], hint: "The old mail server version is vulnerable." },
  { kind: "scan", title: "Sweep", goal: "Finish it: sweep the subnet and find the exposed internal host.", cmd: "sweep 10.0.2.0/24", prompt: "the host that shouldn't be reachable", rows: [ { col1: "10.0.2.10", col2: "app (ok)", risk: "ok" }, { col1: "10.0.2.30", col2: "db-prod (5432 Postgres, reachable)", risk: "bad" } ], hint: "A reachable production database is the find." },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full recon · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
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
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}perimeter_fully_mapped{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Scanned, enumerated, and swept the subnet - the whole external and internal surface mapped, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE10: ModuleDef = {
  code: "M-10",
  moduleNo: 10,
  title: "Network Recon",
  client: "Harbour Systems",
  brief:
    "A deep engagement mapping what a stranger on the internet can see. Harbour wants their perimeter measured before attackers measure it for them. The full job, all modelled in your browser: scan a gateway and flag the exposure, enumerate service versions and triage which are known-vulnerable, sweep the internal subnet to find a host that should never be reachable, and make the prioritisation call. Then four field jobs for new clients, and a final challenge you run start to finish. Authorized, in-scope, and nothing leaves your machine.",
  industry: {
    tag: "A machine left reachable on the open internet, with the door unlocked, is found by whoever scans for it.",
    motif: { pre: "nmap gw.target -> ", hit: "3389/tcp open rdp", note: "remote desktop, facing the whole internet" },
    primer: {
      term: "Port scanning",
      what: "Every networked machine has thousands of numbered 'ports', and a service (web, email, remote desktop, a database) can be listening on each. A port scan simply asks every port 'are you open?', then asks the open ones 'what are you, and what version?'. It is how both attackers and defenders find what a machine actually exposes.",
      example: "nmap target.range  ->  22 ssh, 443 https, 3389 rdp (open!)",
      returns: "An open port is a door; the version tells you whether the lock is any good. Scanning turns an unknown network into a map of every exposed service, which is exactly what you will do here, then decide which ones are dangerous.",
    },
    learn: [
      "Scan a gateway and flag the one open door that should never face the internet.",
      "Enumerate service versions and triage known-vulnerable against current.",
      "Sweep a subnet for a host that should never be reachable from where you are.",
      "Prioritise the exposure for the report: what gets fixed first.",
    ],
    engines: [
      { name: "Nmap", color: "#4ade80", blurb: "The classic network mapper: finds live hosts, open ports, and the service and version behind each.", here: true, icon: "scan" },
      { name: "Masscan", color: "#ffb347", blurb: "An ultra-fast scanner built for huge ranges, trading detail for internet-scale speed.", icon: "scan" },
      { name: "Shodan", color: "#e5392f", blurb: "A search engine for internet-connected devices: you search for exposed services, not web pages.", icon: "server" },
      { name: "Censys", color: "#5fe6ff", blurb: "An internet-wide scanning platform used to map and monitor exposed services and attack surface.", icon: "server" },
      { name: "Wireshark", color: "#8b7bff", blurb: "A packet microscope: captures and reads the actual traffic flowing across a network.", icon: "scan" },
    ],
    headline: {
      masthead: "THE PERIMETER POST",
      dateline: "2017 · SECURITY RESEARCH + INCIDENT TRACKING",
      title: "Tens of thousands of databases wiped, found by simply scanning for them",
      body: "In early 2017, attackers scanned the internet for MongoDB databases left open on their default port with no password, then deleted the data and left a ransom note demanding Bitcoin. Within about a week the count of hijacked databases climbed from a couple of hundred to tens of thousands, and most victims held no usable backups. The only 'skill' required was scanning for an exposed service with the door left unlocked.",
      stat: "~28,000",
      statLabel: "DATABASES WIPED, DOORS LEFT OPEN",
      why: "No exploit and no password-cracking, just scanning for something reachable that should never have been. Anything you put on the open internet will be found, usually within minutes, which is why mapping your own exposure first matters.",
    },
    realWorld:
      "Network reconnaissance is mapping what a target actually exposes: which hosts are alive, which ports are open, and what service and version sits behind each. Attackers do it to find the weakest reachable door; defenders do it to find and shut that door first. Scanning the whole internet now takes minutes, so anything left reachable is found fast. Knowing how to map exposure, and read what's dangerous, is a core operator skill.",
    now: {
      stat: "1.8M",
      statLabel: "remote-desktop servers exposed on the internet (Shodan)",
      body: "Network recon is the discovery phase on the industry's attack map, MITRE ATT&CK. And there is plenty to find: security scans using Shodan count more than 1.8 million remote-desktop (RDP) servers sitting exposed on the internet, each a potential front door, exactly the kind of exposure this module teaches you to spot.",
    },
    recent: {
      year: "2025",
      title: "A top AI firm's database, open to anyone",
      body: "In early 2025, researchers probing DeepSeek's internet-facing systems looked beyond the usual web ports and found an unauthenticated database wide open, exposing over a million log lines including chat history and secret keys. A leading AI company undone by one exposed service a simple scan could find. It was reported responsibly and closed quickly.",
    },
    ahead:
      "Scanning is now effectively instant: open-source tools can sweep the entire public internet for an open port in minutes, and attackers typically start scanning for a newly announced vulnerability within about 15 minutes. The next step is AI triaging the results and auto-exploiting; in one 2024 study, AI agents exploited 87% of a set of real one-day vulnerabilities from just the public description. Defenders answer with continuous attack-surface management, scanning their own estate the way an attacker would.",
    role:
      "This is day-one knowledge for penetration testers, network security engineers and red teamers. You cannot defend an exposure you haven't mapped, and attackers map it in minutes.",
    roles: ["Penetration tester", "Network security engineer", "Red teamer", "SOC analyst"],
  },
  lesson: {
    blocks: [
      { h: "Services listen on ports", body: "A server offers services - web, email, remote login - and each listens on a numbered port. Web is usually 80 and 443, SSH is 22, Remote Desktop is 3389. A port scan asks a host, one port at a time, whether anything is listening. The list of open ports is a map of everything the machine offers to whoever can reach it." },
      { h: "Enumeration: what, and which version", body: "Knowing a port is open is step one; the real value is service enumeration - identifying what's running and which version, often from the banner the service announces. 'Port 21 open' is mild. 'Port 21 running vsftpd 2.3.4' is a gift, because an attacker can look up the known vulnerabilities for that exact version." },
      { h: "Version to known vulnerability", body: "Old, unpatched services are where a lot of break-ins begin. A specific version maps to specific published vulnerabilities (CVEs): vsftpd 2.3.4 has a backdoor, Apache 2.4.49 has a path-traversal flaw. Recognising a vulnerable version tells an attacker exactly which exploit to reach for - and tells a defender exactly what to patch first." },
      { h: "Mapping the network", body: "Beyond a single host, recon maps the whole network. Sweeping a subnet (a range like 10.0.5.0/24) discovers which addresses have live machines - host discovery. That often turns up things that should never be reachable: a production database, a backup share, a staging box, all quietly listening where an attacker who gets a foothold can reach them." },
      { h: "Attack surface", body: "Every open port and reachable host is a potential way in - together they are the attack surface. The goal of recon, and of defence, is to shrink it: close ports nothing needs, keep what's left patched, put management services like RDP behind a VPN, and never expose them to the whole internet, where they're found and attacked within minutes." },
    ],
    Interactive: ScanLab,
    summary: [
      "A port scan maps every service a host offers; the open ports are its attack surface.",
      "Enumeration identifies the exact software and version behind each open port.",
      "A specific version maps to specific known vulnerabilities - old versions are the way in.",
      "Sweeping a subnet discovers live hosts, including ones that should never be reachable.",
      "Shrink the surface: close unused ports, patch, and keep management services off the open internet.",
    ],
    check: {
      q: "Why is identifying the service version so valuable in recon?",
      options: [
        { text: "A specific version can be matched to known, published vulnerabilities for that exact software.", correct: true, feedback: "Right. 'vsftpd 2.3.4' tells an attacker exactly which published exploit to reach for." },
        { text: "An older version number usually means the software is more tested and stable.", feedback: "It's the opposite risk: old versions are the ones with known, unpatched vulnerabilities." },
        { text: "The version banner also leaks the server's internal hostname and IP address.", feedback: "A banner identifies the software, not the host's name or address. Its value is matching it to known weaknesses." },
        { text: "Knowing the version lets you log straight in without any credentials at all.", feedback: "Not directly. It tells you which published exploit might work, a different and earlier step." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems perimeter + internal subnet (authorized, simulated)",
    inScope: "scanning the authorized hosts and sweeping the named subnet; the consolidation clients in each drill",
    offLimits: "exploiting anything found, hosts outside the authorized range",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Scan the gateway and flag the exposure, enumerate the versions and triage them, sweep the subnet for a host that shouldn't be reachable, then make the prioritisation call. Read the results like an attacker, then recommend like a defender. You map and report; you don't exploit.",
  hint: "Work the stages in order. 22/80/443 are expected; internet-facing RDP (3389) is the exposure. Old specific version numbers (vsftpd 2.3.4, Apache 2.4.49) are the vulnerable ones. On the sweep, a reachable production database is the find.",
  plan: [
    { label: "Port scan", goal: "Scan the gateway and flag the one open door that should never face the internet." },
    { label: "Enumerate versions", goal: "Read each service's version and mark it known-vulnerable or current." },
    { label: "Subnet sweep", goal: "Sweep the internal subnet for live hosts and flag the one that shouldn't be reachable." },
    { label: "Prioritise", goal: "You've mapped the exposure. Decide what goes at the top of the report." },
  ],
  Act: NetReconAct,
  flag: "flag{rdp_exp0sed_t0_w0rld}",
  defend: {
    blocks: [
      { h: "Shrink and shield the surface", body: "Close every port that doesn't need to be open. For the ones that must stay, restrict who can reach them - management services like RDP and SSH should sit behind a VPN or an allow-list, never open to the whole internet. Segment the internal network so a production database or backup share isn't reachable from everywhere. The smaller and more controlled the surface, the less there is to attack." },
      { h: "Patch what you expose", body: "An open port is only as safe as the software behind it. That vsftpd 2.3.4 and Apache 2.4.49 are dangerous only because they're years out of date with public exploits. Keep exposed services patched, and retire old software you don't need - version enumeration is exactly how attackers pick their target, so don't hand them an easy one." },
      { h: "Know your own perimeter", body: "Defenders scan themselves on a schedule, exactly as you just did, so they discover an accidentally-exposed service before an attacker does. The internet is scanned end to end constantly; an exposed RDP port is typically found and under attack within minutes of going live. You can't defend an attack surface you haven't measured." },
    ],
    Interactive: PickFixLab,
    check: {
      q: "What's the right fix for the exposed Remote Desktop?",
      options: [
        { text: "Put it behind a VPN or allow-list, off the open internet, and keep it patched.", correct: true, feedback: "Right. Remove it from the open internet, limit who can reach it, and stay patched." },
        { text: "Move RDP to a different, high-numbered port so the scanners miss it.", feedback: "Obscurity only. Scanners find it on any port, so the service is still exposed and attacked." },
        { text: "Leave it open to the internet but enforce a much stronger admin password.", feedback: "Better than nothing, but exposed RDP is relentlessly attacked. Take it off the open internet." },
        { text: "Block the specific IP addresses that are currently scanning the port.", feedback: "The whole internet scans continuously; blocking a few addresses doesn't reduce the exposure." },
      ],
    },
  },
  finding: {
    title: "Excessive network exposure: internet-facing RDP, reachable prod DB, outdated services",
    where: "Harbour Systems · fleet-gw.harbour.range + 10.0.5.0/24",
    severity: "High",
    cvss: "8.6",
    impact: "Remote Desktop is reachable from the entire internet (continuously brute-forced and exploited), a production database is reachable across the internal network, and outdated services (vsftpd 2.3.4, Apache 2.4.49) carry known exploits - together a direct path to full compromise.",
    fix: "Remove RDP from the open internet (VPN/allow-list); segment the network so the prod database isn't broadly reachable; close unused ports; patch or retire outdated services; scan the perimeter regularly.",
  },
  cheatsheet: {
    title: "Network recon quick reference",
    blurb: "What a scan tells you, the exposures worth flagging, and how to shrink them, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "A scan turns a mystery machine into a list like this. The whole skill is reading which lines are fine and which are a fire.",
      cols: ["what you find", "what it means", "dangerous?"],
      rows: [
        ["443/tcp https (current)", "a web server, up to date", "no, expected"],
        ["3389/tcp rdp, open to internet", "remote desktop, anyone can reach", "critical: get it off the internet"],
        ["ProFTPD 1.3.3c", "an old, oddly specific version", "yes: that version shipped with a backdoor"],
      ],
    },
    groups: [
      {
        heading: "What a scan tells you",
        entries: [
          { code: "port", what: "A numbered channel a service listens on. Open means something is reachable there.", example: "22=SSH, 443=HTTPS, 3389=RDP, 27017=MongoDB" },
          { code: "open / filtered / closed", what: "Open = a service answers; filtered = a firewall blocks; closed = nothing listening.", example: "open 3389 -> remote desktop is reachable" },
          { code: "service + version", what: "An open port is step one; the version tells you whether it's exploitable.", example: "OpenSSH 9.6 (current) vs ProFTPD 1.3.3c (backdoored)" },
          { code: "subnet sweep", what: "Pinging a whole range to find which hosts are alive before scanning them.", example: "sweep 10.0.9.0/24 -> the live hosts" },
        ],
      },
      {
        heading: "The exposures you'll flag",
        entries: [
          { code: "internet-facing RDP/VNC", what: "Remote-desktop services open to the whole internet are a top ransomware doorway.", example: "3389 or 5900 reachable from anywhere" },
          { code: "open database", what: "A database reachable with no password is an instant full-data leak.", example: "MongoDB 27017, no auth, open" },
          { code: "old versions", what: "A known-vulnerable version of a service is a ready-made exploit target.", example: "ProFTPD 1.3.3c, Exim 4.87" },
          { code: "reachable internals", what: "Internal hosts (backups, admin) that should never be reachable from where you are.", example: "an open backup share across the subnet" },
        ],
      },
      {
        heading: "Shrinking the exposure (the fix)",
        entries: [
          { code: "close / firewall ports", what: "Expose only what must be public; firewall or allow-list the rest.", example: "RDP behind a VPN, not on the open internet" },
          { code: "patch + update", what: "Keep services current so an open port isn't also an exploitable one.", example: "upgrade the backdoored FTP version" },
          { code: "segment the network", what: "Separate internal systems so a single foothold can't reach everything.", example: "backups unreachable from the web tier" },
          { code: "scan yourself first", what: "Run attack-surface management: scan your own estate the way an attacker would.", example: "continuous external scans of your own IPs" },
        ],
      },
    ],
  },
  takeaway: "Every open port is a door someone can try. Keep management services off the open internet and retire anything outdated.",
  outcome: [
    "Run a port scan of a host and flag the dangerous open door, such as Remote Desktop (3389) left facing the whole internet.",
    "Enumerate service versions and match an old one like vsftpd 2.3.4 or Apache 2.4.49 to its known published vulnerabilities.",
    "Sweep a subnet to discover live hosts and spot one that should never be reachable, such as a production database.",
    "Prioritise the findings for the report - take exposed management services off the open internet first, then patch the outdated ones.",
  ],
  rep: 55,
  repRank: "Operator",
  repTo: "450 / 600 to Lead Operator",
  next: "NEXT MODULE · Digital Forensics →",
};

export default function Module10() {
  return <Engagement mod={MODULE10} />;
}

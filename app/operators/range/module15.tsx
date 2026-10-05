"use client";

/* Module 15 — Full Engagement, Part 1 (capstone). Everything combined into a
 * chain: recon surfaces an exposed backup via robots.txt, and that backup hands
 * over an admin credential — a small leak plus a misconfig equalling full
 * compromise. Two linked stages, authored data, no engine. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

function ChainAct({ onCapture }: { onCapture: () => void }) {
  const [robots, setRobots] = useState(false);
  const [foundPath, setFoundPath] = useState(false);
  const [backup, setBackup] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* stage 1 — recon */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>STAGE 1 · RECON</div>
        {!robots ? (
          <Btn tone="i" onClick={() => setRobots(true)}>GET /robots.txt →</Btn>
        ) : (
          <>
            <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: "#8fa0c8", whiteSpace: "pre-wrap", lineHeight: 1.7, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "11px 13px" }}>
{`User-agent: *
Disallow: /admin
Disallow: `}<button onClick={() => setFoundPath(true)} style={{ background: foundPath ? "rgba(232,163,61,.12)" : "none", border: "none", color: C.amber, fontFamily: MONO, fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}>/db-backup-2024.sql</button>
            </pre>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginTop: 8 }}>
              {foundPath ? "↳ ‘Disallow’ doesn’t hide a file — it names it. That backup shouldn’t be reachable at all." : "// anything interesting a crawler is told to avoid? click it."}
            </div>
          </>
        )}
      </div>

      {/* stage 2 — exploit */}
      {foundPath && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>STAGE 2 · EXPLOIT</div>
          {!backup ? (
            <Btn tone="i" onClick={() => setBackup(true)}>GET /db-backup-2024.sql →</Btn>
          ) : (
            <>
              <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: "#8fa0c8", whiteSpace: "pre-wrap", lineHeight: 1.7, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "11px 13px" }}>
{`-- Vantage Mutual · nightly dump
INSERT INTO admins (email, pass) VALUES
`}<span style={{ color: C.amber, background: "rgba(232,163,61,.10)" }}>{`  ('root@vantage.range','Vantage!Backup#9');`}</span>
              </pre>
              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Btn tone="g" onClick={() => { setDone(true); onCapture(); }}>LOG IN AS root →</Btn>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>recon → exposed backup → admin creds</span>
              </div>
            </>
          )}
        </div>
      )}

      {done && (
        <div style={{ fontFamily: MONO, fontSize: 13, color: C.green, lineHeight: 1.6 }}>
          ✓ signed in as root. Two small issues — a named backup and no access control on it — chained into full admin.
        </div>
      )}
    </div>
  );
}

export const MODULE15: ModuleDef = {
  code: "M-15",
  moduleNo: 15,
  title: "Full Engagement, Part 1",
  client: "Vantage Mutual",
  brief:
    "The capstone. A real client, Vantage Mutual, and no training wheels: you get recon and exploitation across the whole engagement, and you’ll use everything from the last fourteen modules. Part 1 is the break-in — start with what the open internet tells you, and don’t stop at the first clue.",
  lesson: {
    blocks: [
      { h: "Real attacks are chains", body: "A breach is rarely one spectacular flaw. It’s usually a chain of small, dull problems — a file that shouldn’t be reachable, a credential left where it doesn’t belong — each harmless-looking alone, devastating together. The skill of a full engagement is seeing how findings combine, not just collecting them individually." },
      { h: "Recon tells you where to look", body: "You start the way you always do: passively. A file like robots.txt is meant to steer web crawlers, but it does so by listing the paths a site wants left alone — which quietly tells an attacker exactly where the interesting things are. ‘Disallow: /db-backup-2024.sql’ doesn’t hide that backup; it advertises it." },
      { h: "Then you chain it", body: "Recon surfaced a path; now you test it. A database backup left reachable with no access control is a catastrophe, because a dump contains everything — including admin credentials in plain sight. Recon (the named path) plus a misconfiguration (the exposed, unprotected backup) chains straight to full administrative access. That’s a real engagement in miniature." },
    ],
    example: {
      caption: "Neither step is dramatic on its own. Chained, they’re game over: the crawler hint leads to a backup that hands over an admin login.",
      lines: [
        { t: "robots.txt -> Disallow: /db-backup-2024.sql   (named)", leak: true },
        { t: "GET /db-backup-2024.sql -> 200 (no access control)", leak: true },
        { t: "dump contains -> root@vantage.range : Vantage!Backup#9", leak: true },
      ],
    },
    check: {
      q: "Why is ‘Disallow’ in robots.txt useful to an attacker?",
      options: [
        { text: "It blocks attackers from reaching the path.", feedback: "It only asks crawlers to skip it — it enforces nothing, and attackers read it directly." },
        { text: "It publicly lists paths the site wants left alone — pointing straight at sensitive files.", correct: true, feedback: "Right — it advertises exactly what’s interesting, without protecting any of it." },
        { text: "It encrypts the listed files.", feedback: "It does nothing to the files themselves; it’s just a note to crawlers." },
      ],
    },
  },
  scope: {
    target: "Vantage Mutual — full web engagement (recon + exploit)",
    inScope: "public recon and the exposed backup it reveals",
    offLimits: "destroying data, acting on real customers, systems out of scope",
    timebox: "the engagement window",
  },
  handler: "This is the real thing now. Start with recon — read what they tell crawlers to avoid. Follow the thread it gives you. One clue leads to the next; chain them to admin.",
  hint: "Fetch robots.txt first, click the backup path it names, then fetch that backup — the dump has an admin credential in it.",
  Act: ChainAct,
  flag: "flag{ch41n3d_t0_adm1n}",
  defend: {
    blocks: [
      { h: "Break the chain anywhere", body: "The power of a chain is also its weakness: fix any link and it falls apart. Don’t reference sensitive paths in robots.txt. Never leave database backups in a web-reachable location, and protect them with access control and encryption. Any one of those, done right, stops this entire attack — which is why defence in depth works even when individual mistakes slip through." },
      { h: "Think in attack paths", body: "Mature defenders don’t just patch bugs in isolation; they ask ‘what could this connect to?’ A low-severity information leak plus a medium misconfiguration can equal a critical breach. Reviewing your own systems the way an attacker chains findings — the way you just did — is how you catch the dangerous combinations before someone else does." },
    ],
    check: {
      q: "What’s the most reliable way to stop a chained attack like this?",
      options: [
        { text: "Only ever fix Critical-rated bugs and ignore the small stuff.", feedback: "The ‘small stuff’ is exactly what chains into Criticals — ignoring it is how this breach happened." },
        { text: "Fix any link in the chain — e.g. don’t expose the backup — since breaking one step stops the whole attack.", correct: true, feedback: "Right — defence in depth: remove any link and the chain collapses." },
        { text: "Add more paths to robots.txt.", feedback: "That advertises even more — the opposite of a fix." },
      ],
    },
  },
  finding: {
    title: "Full compromise via exposed database backup (chained from recon)",
    where: "Vantage Mutual · /robots.txt → /db-backup-2024.sql (no access control)",
    severity: "Critical",
    cvss: "9.1",
    impact: "robots.txt names a database backup that is served with no access control; the dump contains plaintext admin credentials, chaining a minor info-leak and a misconfiguration into full administrative access.",
    fix: "Remove backups from web-reachable locations; enforce access control and encryption on them; stop referencing sensitive paths in robots.txt; rotate the exposed credentials.",
  },
  rep: 80,
  repRank: "Lead Operator",
  repTo: "760 / 1000 to Principal",
  next: "NEXT MODULE · Full Engagement, Part 2 →",
};

export default function Module15() {
  return <Engagement mod={MODULE15} />;
}

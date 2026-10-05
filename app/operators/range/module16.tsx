"use client";

/* Module 16 — Full Engagement, Part 2 + Debrief (season close). The learner turns
 * the Part-1 break-in into a professional report: score it, confirm the fix,
 * deliver it, and receive a field-ready rating. Authored report-builder, no
 * engine. This is the culmination — the portfolio's closing piece. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

function ReportBuildAct({ onCapture }: { onCapture: () => void }) {
  const [sev, setSev] = useState<string | null>(null);
  const [fix, setFix] = useState(false);
  const [sent, setSent] = useState(false);

  const ready = sev === "Critical" && fix;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>ENGAGEMENT REPORT · Vantage Mutual</div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft, lineHeight: 1.7 }}>
          <div><span style={{ color: C.mute }}>finding&nbsp;&nbsp;</span> Exposed DB backup → admin takeover (chained from recon)</div>
          <div><span style={{ color: C.mute }}>where&nbsp;&nbsp;&nbsp;</span> /robots.txt → /db-backup-2024.sql (no access control)</div>
          <div><span style={{ color: C.mute }}>impact&nbsp;&nbsp;</span> full administrative access to customer data</div>
        </div>
      </div>

      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.indigo, fontWeight: 700, marginBottom: 10 }}>1 · CONFIRM SEVERITY</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Low", "Medium", "High", "Critical"].map((s) => (
            <button key={s} onClick={() => { setSent(false); setSev(s); }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${sev === s ? (s === "Critical" ? C.green : C.red) : C.line}`, background: sev === s ? (s === "Critical" ? "rgba(74,222,128,.08)" : "rgba(255,91,98,.06)") : C.panel, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.indigo, fontWeight: 700, marginBottom: 10 }}>2 · RECOMMENDED FIX</div>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
          <input type="checkbox" checked={fix} onChange={(e) => { setSent(false); setFix(e.target.checked); }} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5 }}>Remove backups from web-reachable paths; enforce access control + encryption; stop listing sensitive paths in robots.txt; rotate exposed credentials.</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn tone="g" disabled={!ready} onClick={() => { setSent(true); onCapture(); }}>DELIVER REPORT →</Btn>
        {!ready && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>score it and confirm the fix to deliver</span>}
      </div>

      {sent && (
        <div className="co-anim co-pop" style={{ background: "radial-gradient(120% 140% at 50% 0%, rgba(74,222,128,0.12), transparent 60%)", border: `1px solid ${C.green}55`, borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>REPORT DELIVERED</div>
          <div style={{ fontFamily: "var(--font-chakra),system-ui", fontSize: 22, fontWeight: 700, margin: "8px 0 4px" }}>Field-ready rating: Operator</div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft }}>Season 1 complete — sixteen engagements, a full portfolio of findings.</div>
        </div>
      )}
    </div>
  );
}

export const MODULE16: ModuleDef = {
  code: "M-16",
  moduleNo: 16,
  title: "Full Engagement, Part 2",
  client: "Vantage Mutual",
  brief:
    "You broke in. Now finish the job the way a professional does: turn it into a report Vantage can act on. Score the finding honestly, state the fix clearly, and deliver it. This is the last engagement of the season — and the piece that turns a hack into a result.",
  lesson: {
    blocks: [
      { h: "The report is the deliverable", body: "A client never pays for the thrill of a break-in; they pay for a report that makes them safer. Everything you found in Part 1 is worthless to Vantage until it’s written up: what the issue is, how serious, what it would cost them, and precisely how to fix it. The report is the product — the hacking was just how you sourced it." },
      { h: "Honest severity, clear fix", body: "Score it as it is — this chain gives full admin access to customer data remotely, so it’s Critical, and saying anything softer to seem reasonable would be a disservice. Then give a fix a developer can act on today: not ‘be more secure’, but ‘remove the backup from web-reachable paths, add access control, rotate the credentials’. Specific, actionable, done." },
      { h: "Close it out", body: "A professional engagement ends with delivery and a debrief: hand over the findings, walk the client through them, and agree what happens next. Then you add it to your portfolio — the growing record of real work you can show a teacher, a university, or an employer. Sixteen engagements in, that portfolio is the proof of what you can actually do." },
    ],
    example: {
      caption: "The finished article: honest score, concrete fix, delivered. That’s what a client acts on.",
      lines: [
        { t: "severity: CRITICAL — remote, full admin, customer data", leak: true },
        { t: "fix:      backup off the web + access control + rotate creds", leak: true },
        { t: "status:   delivered -> debriefed -> filed to portfolio", leak: true },
      ],
    },
    check: {
      q: "Why is the report, not the break-in, the real deliverable?",
      options: [
        { text: "Because breaking in doesn’t count unless it’s on video.", feedback: "It’s not about proof-of-drama — it’s that the client can only act on a clear write-up." },
        { text: "Because the client can only become safer by acting on a clear, scored, fixable report.", correct: true, feedback: "Right — the value is a fixed vulnerability, and that comes from the report." },
        { text: "Because reports are easier than hacking.", feedback: "A good report is its own hard skill — and it’s the one that delivers the value." },
      ],
    },
  },
  scope: {
    target: "Vantage Mutual · engagement report + debrief",
    inScope: "scoring, writing and delivering the finding from Part 1",
    offLimits: "further exploitation, acting on customer data, out-of-scope systems",
    timebox: "the engagement window",
  },
  handler: "Last one. Score it straight — this is a Critical, don’t flinch from that — give them a fix they can actually ship, and deliver it. Then it’s done, and it’s yours. Good work this season, operator.",
  hint: "Severity is Critical (remote, full admin, customer data). Tick the recommended fix, then deliver the report.",
  Act: ReportBuildAct,
  flag: "flag{f1rst_s3ason_cl0sed}",
  defend: {
    blocks: [
      { h: "What you can now do", body: "Look back at the arc: you learned to footprint a target, read and bend web traffic, break authentication, run real injections, land scripts, walk through broken access control, work with crypto and hashes, map a network, read a forensic trail, respond to a live breach, spot social-engineering, disclose responsibly, and chain it all into a full engagement. You can both attack and defend — and you know why each fix works." },
      { h: "Where this goes next", body: "This portfolio is a genuine starting point. It maps to GCSE and A-level cyber content, prepares you for programmes like CyberFirst, and shows a real employer concrete, ethical, hands-on skill. The field moves fast, but you’ve learned the thing that doesn’t go out of date: how to think like both the attacker and the defender, and how to tell the difference." },
    ],
    check: {
      q: "What makes your portfolio valuable to a university or employer?",
      options: [
        { text: "It proves you watched some videos.", feedback: "It’s more than that — it’s a record of work you actually did." },
        { text: "It’s concrete, ethical, hands-on evidence of real skills across attack and defence.", correct: true, feedback: "Right — real findings, honestly reported, are exactly what stands out." },
        { text: "It guarantees you a job automatically.", feedback: "No guarantees — but it’s genuine, demonstrable proof of ability, which is what opens doors." },
      ],
    },
  },
  finding: {
    title: "Season 1 capstone report delivered (Vantage Mutual)",
    where: "Vantage Mutual · full engagement · chained compromise",
    severity: "Critical",
    cvss: "9.1",
    impact: "The capstone engagement is documented end to end: a chained recon-to-admin compromise, scored Critical, with a concrete remediation plan delivered and debriefed — the closing piece of a sixteen-finding portfolio.",
    fix: "Remove web-reachable backups and enforce access control + encryption; rotate exposed credentials; adopt attack-path review so low-severity issues aren’t allowed to chain into critical ones.",
  },
  rep: 90,
  repRank: "Principal",
  repTo: "Top rank reached",
  next: "SEASON COMPLETE · View your portfolio →",
};

export default function Module16() {
  return <Engagement mod={MODULE16} />;
}

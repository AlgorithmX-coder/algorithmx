import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { listFirms, platformTotals } from "@/app/lib/aiClearedOps";
import { firstNameOf } from "@/app/lib/aiCleared";
import { K } from "../engine/tokens";
import Frame from "../Frame";
import OpsPanel from "./OpsPanel";

/* /ai-cleared/ops: the AlgorithmX view of every firm, both courses. Staff
 * only. */
export const dynamic = "force-dynamic";

const PLAN: Record<string, string> = { TEAM: "Team", FIRM: "Firm", ENTERPRISE: "Enterprise" };

export default async function OpsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-cleared%2Fops");
  if (!(await isStaffUser(session.user.id))) {
    return (
      <Frame meta={<span className="cf-meta">{session.user.email}</span>} courseLink>
        <span className="cf-eyebrow">Ops</span>
        <h1 className="cf-h1">This page is for <span className="cf-grad">AlgorithmX staff</span>.</h1>
        <p className="cf-lead">If you run AI Cleared for your own firm, your admin page is at /ai-cleared/admin.</p>
        <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Back to the course</Link>
      </Frame>
    );
  }

  const rows = await listFirms();
  const t = platformTotals(rows);
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

  return (
    <Frame firmName="AlgorithmX" meta={<span className="cf-meta">{firstNameOf(session.user.name, session.user.email)} · Staff</span>} courseLink>
      <span className="cf-eyebrow">Ops · every firm</span>
      <h1 className="cf-h1" style={{ marginBottom: 6 }}>
        {t.firms} firm{t.firms === 1 ? "" : "s"}, <span className="cf-grad">{t.seatsClaimed + t.fluentClaimed} people</span> in the courses.
      </h1>
      <p className="cf-note">
        AI Cleared: {t.seatsLicensed} seats licensed · {t.seatsInvited} invited · {t.seatsClaimed} claimed · {t.cleared} cleared · {t.firmsCleared} firm{t.firmsCleared === 1 ? "" : "s"} at the 80% bar.
        {" "}AI Fluent: {t.fluentLicensed} seats licensed · {t.fluentClaimed} claimed · {t.fluentDone} done. {t.certificates} certificates live across both.
      </p>

      <div className="cf-card op-table-wrap">
        <table className="op-table">
          <thead>
            <tr><th>Firm</th><th>Plan</th><th>Cleared seats</th><th>Claimed</th><th>Cleared</th><th>Standing</th><th>Fluent seats</th><th>Claimed</th><th>Fluent</th><th>Certs</th><th>Paid via</th><th>Last activity</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/ai-cleared/ops/${r.slug}`}><b>{r.name}</b></Link><small>{r.sector ?? "—"}{r.contactName ? ` · ${r.contactName}` : ""}</small></td>
                <td>{PLAN[r.plan]}</td>
                <td>{r.invited} / {r.seatsPurchased}</td>
                <td>{r.claimed}</td>
                <td>{r.cleared}</td>
                <td><span className={`op-standing ${r.firmCleared ? "yes" : r.claimed ? "part" : "none"}`}>{r.claimed ? `${Math.round(r.pct * 100)}%` : "—"}</span></td>
                <td>{r.fluentSeats || r.fluentInvited ? `${r.fluentInvited} / ${r.fluentSeats}` : "—"}</td>
                <td>{r.fluentSeats || r.fluentInvited ? r.fluentClaimed : "—"}</td>
                <td>{r.fluentSeats || r.fluentInvited ? r.fluentDone : "—"}</td>
                <td>{r.certificates}</td>
                <td>{r.paidVia === "stripe" ? "Stripe" : "Manual"}</td>
                <td>{day(r.lastActivity)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={12} style={{ color: K.muted }}>No firms yet. Create one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <OpsPanel />

      <style>{`
        .op-table-wrap { margin-top: 18px; padding: 6px 0; overflow-x: auto; }
        .op-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 1040px; }
        .op-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 12px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .op-table td { padding: 11px 12px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .op-table td a { text-decoration: none; }
        .op-table td b { display: block; color: ${K.ink}; font-weight: 600; }
        .op-table td small { display: block; color: ${K.faint}; font-size: 12px; }
        .op-standing { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; }
        .op-standing.yes { color: ${K.ok}; background: ${K.okSoft}; }
        .op-standing.part { color: ${K.accentInk}; background: ${K.accentSoft}; }
        .op-standing.none { color: ${K.muted}; background: ${K.sunk}; }
      `}</style>
    </Frame>
  );
}

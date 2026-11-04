import Link from "next/link";
import { listFirms, platformTotals } from "@/app/lib/aiClearedOps";
import { trialStatus } from "@/app/lib/orgTrial";
import AdminFirmsPanel from "./AdminFirmsPanel";

/* /admin/firms: every AI Cleared / AI Fluent firm, staff-wide. A thin
 * port of /ai-cleared/ops's table (same listFirms()/platformTotals()),
 * without that console's course-tab chrome or model-call allowance line
 * - those are specific to running the course, not to managing customers.
 * Styling in ../admin.css. */
export const dynamic = "force-dynamic";

const PLAN: Record<string, string> = { TEAM: "Team", FIRM: "Firm", ENTERPRISE: "Enterprise" };

function statusChip(paidVia: "stripe" | "manual", trialExpiresAt: string | null) {
  const status = trialStatus(trialExpiresAt ? new Date(trialExpiresAt) : null);
  if (status === "active") {
    const days = Math.max(0, Math.ceil((new Date(trialExpiresAt!).getTime() - Date.now()) / 86400000));
    return <span className="ad-chip trial">Trial &middot; {days}d left</span>;
  }
  if (status === "expired") return <span className="ad-chip expired">Trial ended</span>;
  return <span className="ad-chip paid">{paidVia === "stripe" ? "Paid (Stripe)" : "Paid (manual)"}</span>;
}

export default async function AdminFirmsPage() {
  const rows = await listFirms();
  const t = platformTotals(rows);
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

  return (
    <div>
      <h1 className="ad-h1">{t.firms} firm{t.firms === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} Cleared seats licensed &middot; {t.seatsClaimed} claimed &middot; {t.cleared} cleared &middot; {t.fluentLicensed} Fluent seats licensed &middot; {t.fluentClaimed} claimed &middot; {t.certificates} certificates live.
      </p>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Firm</th><th>Plan</th><th>Cleared seats</th><th>Claimed</th><th>Cleared</th><th>Fluent seats</th><th>Certs</th><th>Status</th><th>Last activity</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/ai-cleared/ops/${r.slug}`}><b>{r.name}</b></Link><small>{r.sector ?? "—"}{r.contactName ? ` · ${r.contactName}` : ""}</small></td>
                <td>{PLAN[r.plan]}</td>
                <td>{r.invited} / {r.seatsPurchased}</td>
                <td>{r.claimed}</td>
                <td>{r.cleared}</td>
                <td>{r.fluentSeats || r.fluentInvited ? `${r.fluentInvited} / ${r.fluentSeats}` : "—"}</td>
                <td>{r.certificates}</td>
                <td>{statusChip(r.paidVia, r.trialExpiresAt)}</td>
                <td>{day(r.lastActivity)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="ad-empty">No firms yet. Create one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <AdminFirmsPanel />
    </div>
  );
}

import Link from "next/link";
import { listSchools, platformSchoolTotals } from "@/app/lib/schoolOps";
import { trialStatus } from "@/app/lib/orgTrial";
import AdminSchoolsPanel from "./AdminSchoolsPanel";

/* /admin/schools: every school, staff-wide. Same shape as /admin/firms,
 * rolled up from Class/ChildProfile/Progress instead of Seat/Enrolment.
 * Cyber Heroes only, for now - the only course actually wired for
 * school licensing. Styling in ../admin.css. */
export const dynamic = "force-dynamic";

function statusChip(paidVia: "stripe" | "manual", trialExpiresAt: string | null) {
  const status = trialStatus(trialExpiresAt ? new Date(trialExpiresAt) : null);
  if (status === "active") {
    const days = Math.max(0, Math.ceil((new Date(trialExpiresAt!).getTime() - Date.now()) / 86400000));
    return <span className="ad-chip trial">Trial &middot; {days}d left</span>;
  }
  if (status === "expired") return <span className="ad-chip expired">Trial ended</span>;
  return <span className="ad-chip paid">{paidVia === "stripe" ? "Paid (Stripe)" : "Paid (manual)"}</span>;
}

export default async function AdminSchoolsPage() {
  const rows = await listSchools();
  const t = platformSchoolTotals(rows);
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

  return (
    <div>
      <h1 className="ad-h1">{t.schools} school{t.schools === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} pupil places licensed &middot; {t.pupilsUsed} pupils added &middot; {t.classes} classes &middot; Cyber Heroes only, for now.
      </p>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>School</th><th>Pupils</th><th>Classes</th><th>Status</th><th>Signed up</th><th>Last activity</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/schools/${r.slug}`}><b>{r.name}</b></Link><small>{r.sector ?? "—"}{r.contactName ? ` · ${r.contactName}` : ""}</small></td>
                <td>{r.pupilsUsed} / {r.seatsPurchased}</td>
                <td>{r.classes}</td>
                <td>{statusChip(r.paidVia, r.trialExpiresAt)}</td>
                <td>{day(r.createdAt)}</td>
                <td>{day(r.lastActivity)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="ad-empty">No schools yet. Create one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <AdminSchoolsPanel />
    </div>
  );
}

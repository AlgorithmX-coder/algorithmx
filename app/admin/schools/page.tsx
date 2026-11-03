import Link from "next/link";
import { listSchools, platformSchoolTotals } from "@/app/lib/schoolOps";
import { trialStatus } from "@/app/lib/orgTrial";
import { K } from "../adminTokens";
import AdminSchoolsPanel from "./AdminSchoolsPanel";

/* /admin/schools: every school, staff-wide. Same shape as /admin/firms,
 * rolled up from Class/ChildProfile/Progress instead of Seat/Enrolment.
 * Cyber Heroes only, for now - the only course actually wired for
 * school licensing. */
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
            {rows.length === 0 && <tr><td colSpan={6} style={{ color: K.muted }}>No schools yet. Create one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <AdminSchoolsPanel />

      <style>{`
        .ad-h1 { font-family: ${K.display}; font-size: 24px; margin: 0 0 6px; color: ${K.ink}; }
        .ad-note { font-size: 13.5px; color: ${K.muted}; margin: 0 0 14px; }
        .ad-card { background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 14px; }
        .ad-table-wrap { padding: 6px 0; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 760px; }
        .ad-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 12px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .ad-table td { padding: 11px 12px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .ad-table td a { text-decoration: none; }
        .ad-table td b { display: block; color: ${K.ink}; font-weight: 600; }
        .ad-table td small { display: block; color: ${K.faint}; font-size: 12px; }
        .ad-chip { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; white-space: nowrap; }
        .ad-chip.paid { color: ${K.ok}; background: ${K.okSoft}; }
        .ad-chip.trial { color: ${K.accentInk}; background: ${K.accentSoft}; }
        .ad-chip.expired { color: ${K.warn}; background: ${K.warnSoft}; }
      `}</style>
    </div>
  );
}

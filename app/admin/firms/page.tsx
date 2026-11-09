import { listFirms, platformTotals } from "@/app/lib/aiClearedOps";
import { FirmIcon } from "../icons";
import FirmsTable from "./FirmsTable";
import AdminFirmsPanel from "./AdminFirmsPanel";

/* /admin/firms: every AI Cleared / AI Fluent firm, staff-wide. A thin
 * port of /ai-cleared/ops's table (same listFirms()/platformTotals()),
 * without that console's course-tab chrome or model-call allowance line
 * - those are specific to running the course, not to managing customers.
 * Search/filter/sort lives in FirmsTable.tsx; styling in ../admin.css. */
export const dynamic = "force-dynamic";

export default async function AdminFirmsPage() {
  const rows = await listFirms();
  const t = platformTotals(rows);

  return (
    <div>
      <span className="ad-eyebrow firms"><FirmIcon /> Firms</span>
      <h1 className="ad-h1">{t.firms} firm{t.firms === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} Cyber Secured seats licensed &middot; {t.seatsInvited} people invited &middot; {t.seatsClaimed} claimed &middot; {t.cleared} finished AI Cleared &middot; {t.fluentDone} finished AI Fluent &middot; {t.certificates} certificates live.
      </p>

      <FirmsTable rows={rows} />

      <AdminFirmsPanel />
    </div>
  );
}

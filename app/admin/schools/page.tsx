import { listSchools, platformSchoolTotals } from "@/app/lib/schoolOps";
import { SchoolIcon } from "../icons";
import SchoolsTable from "./SchoolsTable";
import AdminSchoolsPanel from "./AdminSchoolsPanel";

/* /admin/schools: every school, staff-wide. Same shape as /admin/firms,
 * rolled up from Class/ChildProfile/Progress instead of Seat/Enrolment.
 * Cyber Heroes only, for now - the only course actually wired for
 * school licensing. Search/filter/sort lives in SchoolsTable.tsx;
 * styling in ../admin.css. */
export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const rows = await listSchools();
  const t = platformSchoolTotals(rows);

  return (
    <div>
      <span className="ad-eyebrow schools"><SchoolIcon /> Schools</span>
      <h1 className="ad-h1">{t.schools} school{t.schools === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} pupil places licensed &middot; {t.pupilsUsed} pupils added &middot; {t.classes} classes &middot; Cyber Heroes only, for now.
      </p>

      <SchoolsTable rows={rows} />

      <AdminSchoolsPanel />
    </div>
  );
}

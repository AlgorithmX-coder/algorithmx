import { listLearnerOrgs, platformLearnerOrgTotals } from "@/app/lib/schoolOps";
import { SchoolIcon } from "../icons";
import SchoolsTable from "./SchoolsTable";
import AdminSchoolsPanel from "./AdminSchoolsPanel";
import { SCHOOL_WORDS } from "../orgWords";

/* /admin/schools: every school, staff-wide. Rolled up from
 * Class/ChildProfile/Progress rather than Seat/Enrolment.
 *
 * Organisations that are not schools (youth clubs, councils, charities,
 * training providers) are the same thing underneath and live under their own
 * tab at /admin/organisations, which renders this same table and panel with
 * a different vocabulary. Search/filter/sort lives in SchoolsTable.tsx;
 * styling in ../admin.css. */
export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const rows = await listLearnerOrgs("SCHOOL");
  const t = platformLearnerOrgTotals(rows);

  return (
    <div>
      <span className="ad-eyebrow schools"><SchoolIcon /> Schools</span>
      <h1 className="ad-h1">{t.schools} school{t.schools === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} pupil places licensed &middot; {t.pupilsUsed} pupils added &middot; {t.classes} classes &middot; Cyber Heroes only, for now.
      </p>

      <SchoolsTable rows={rows} basePath="/admin/schools" noun="school" />

      <AdminSchoolsPanel w={SCHOOL_WORDS} />
    </div>
  );
}

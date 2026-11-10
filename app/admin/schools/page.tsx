import { listLearnerOrgs, platformLearnerOrgTotals } from "@/app/lib/schoolOps";
import { listSchoolEnquiries } from "@/app/lib/schoolEnquiries";
import { SchoolIcon } from "../icons";
import SchoolsTable from "./SchoolsTable";
import AdminSchoolsPanel from "./AdminSchoolsPanel";
import EnquiriesPanel from "./EnquiriesPanel";
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
  /* The schools asking to be sold to, which until now existed only as an
     email. Unanswered ones only: this is a list of work. */
  const enquiries = await listSchoolEnquiries({ handled: false });
  const day = (d: Date) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <span className="ad-eyebrow schools"><SchoolIcon /> Schools</span>
      <h1 className="ad-h1">{t.schools} school{t.schools === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} pupil places licensed &middot; {t.pupilsUsed} pupils added &middot; {t.classes} classes &middot; Cyber Heroes only, for now.
      </p>

      {/* Above the list of schools we already have, because an unanswered
          enquiry is the only thing on this page with somebody waiting at the
          other end of it. */}
      {enquiries.length > 0 && (
        <EnquiriesPanel
          enquiries={enquiries.map((e) => ({
            id: e.id,
            name: e.name,
            email: e.email,
            school: e.school,
            role: e.role,
            phase: e.phase,
            size: e.size,
            message: e.message,
            emailed: e.emailed,
            came: day(e.createdAt),
          }))}
        />
      )}

      <SchoolsTable rows={rows} basePath="/admin/schools" noun="school" />

      <AdminSchoolsPanel w={SCHOOL_WORDS} />
    </div>
  );
}

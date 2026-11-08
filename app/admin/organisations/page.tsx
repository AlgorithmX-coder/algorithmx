import { listLearnerOrgs, platformLearnerOrgTotals } from "@/app/lib/schoolOps";
import { OrganisationIcon } from "../icons";
import SchoolsTable from "../schools/SchoolsTable";
import AdminSchoolsPanel from "../schools/AdminSchoolsPanel";
import { ORGANISATION_WORDS } from "../orgWords";

/* /admin/organisations: every body that teaches the cyber courses and is not
 * a school. Youth clubs, councils, charities, scout groups, home-ed co-ops,
 * training providers.
 *
 * Deliberately the same table and the same panel as /admin/schools, with a
 * different vocabulary. They are a separate tab because they are sold to
 * differently, not because they work differently: underneath they are the
 * same Organisation with the same classes, pupils and places ledger, told
 * apart by SchoolProfile.kind. Copying the screens instead would have given
 * us two of every later fix. */
export const dynamic = "force-dynamic";

export default async function AdminOrganisationsPage() {
  const rows = await listLearnerOrgs("ORGANISATION");
  const t = platformLearnerOrgTotals(rows);

  return (
    <div>
      <span className="ad-eyebrow organisations"><OrganisationIcon /> Organisations</span>
      <h1 className="ad-h1">{t.schools} organisation{t.schools === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.seatsLicensed} places licensed &middot; {t.pupilsUsed} young people added &middot; {t.classes} groups &middot; Cyber Heroes only, for now.
      </p>

      <SchoolsTable rows={rows} basePath="/admin/organisations" noun="organisation" />

      <AdminSchoolsPanel w={ORGANISATION_WORDS} />
    </div>
  );
}

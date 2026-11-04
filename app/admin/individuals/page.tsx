import { listIndividuals, platformIndividualTotals } from "@/app/lib/individualOps";
import { IndividualsIcon } from "../icons";
import IndividualsTable from "./IndividualsTable";

/* /admin/individuals: everyone who signed up for a course directly,
 * staff-wide. Read-only - individuals sign themselves up, staff don't
 * create them, so there's no "add" form here like the other two tabs.
 * Search/filter/sort lives in IndividualsTable.tsx; styling in
 * ../admin.css. */
export const dynamic = "force-dynamic";

export default async function AdminIndividualsPage() {
  const rows = await listIndividuals();
  const t = platformIndividualTotals(rows);

  return (
    <div>
      <span className="ad-eyebrow individuals"><IndividualsIcon /> Individuals</span>
      <h1 className="ad-h1">{t.individuals} individual{t.individuals === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.withChildren} with a child profile &middot; {t.entitlements} course entitlement{t.entitlements === 1 ? "" : "s"} across them all.
      </p>
      <p className="ad-note">
        Worth knowing: today every consumer course is free on signup or a zero-payment click-through (real card payment for Cyber Pro is still pending) - &ldquo;Bought&rdquo; below records how they got access, not that money changed hands yet.
      </p>

      <IndividualsTable rows={rows} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { listClasses } from "@/app/lib/schoolClasses";
import { trialStatus } from "@/app/lib/orgTrial";
import { courseName, listCreditablePlaces, placesUsed } from "@/app/lib/schoolPlaces";
import { SchoolIcon, OrganisationIcon } from "./icons";
import RevokeButton from "./schools/[slug]/RevokeButton";
import DeleteOrgButton from "./DeleteOrgButton";
import PlacesControl from "./PlacesControl";
import CreditPlaces from "./CreditPlaces";

/**
 * One school, or one organisation: its classes, pupil counts and status.
 *
 * Both tabs render this. They are the same record with the same machinery,
 * so duplicating the screen would have meant two of every later fix; only
 * the words and the colour differ. Scoped by `kind` as well as slug, so an
 * organisation's slug typed under /admin/schools is a 404 rather than a
 * school page with the wrong words on it.
 *
 * Staff see counts and classes. There is deliberately no way from here to a
 * named child's progress: that belongs to their own teacher.
 */
export default async function LearnerOrgDetail({
  slug,
  kind,
}: {
  slug: string;
  kind: "SCHOOL" | "ORGANISATION";
}) {
  const org = await prisma.organisation.findFirst({
    where: { slug, school: { kind } },
    include: { school: true },
  });
  if (!org) notFound();

  const isSchool = kind === "SCHOOL";
  const w = isSchool
    ? { back: "/admin/schools", backLabel: "All schools", eyebrow: "schools", Noun: "School", learners: "pupil", group: "Class", groups: "classes", lead: "teacher" }
    : { back: "/admin/organisations", backLabel: "All organisations", eyebrow: "organisations", Noun: "Organisation", learners: "", group: "Group", groups: "groups", lead: "leader" };

  const classes = await listClasses(org.id);
  /* The ledger, not a count of pupils sitting in live classes. Those are
     different numbers the moment a class is archived or a pupil leaves,
     and the licence is counted against this one. */
  const spent = await placesUsed(org.id);
  /* Places spent on pupils who have since been removed. Nothing frees one
     automatically, on purpose: a place follows the child, which is what
     stops a hundred children being taught on fifty places. Staff put one
     back when it was a mistake, and until now that meant editing the
     database by hand. */
  const creditable = await listCreditablePlaces(org.id);
  const pupilsUsed = classes.reduce((a, c) => a + c._count.pupils, 0);
  const status = trialStatus(org.trialExpiresAt);
  const day = (d: Date | null) => (d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div>
      <p className="ad-back"><Link href={w.back}>{w.backLabel}</Link></p>
      <span className={`ad-eyebrow ${w.eyebrow}`}>{isSchool ? <SchoolIcon /> : <OrganisationIcon />} {w.Noun}</span>
      <h1 className="ad-h1">{org.name}</h1>
      <p className="ad-note">
        {org.sector ?? "sector not set"}
        {org.country ? ` · ${org.country}` : ""} &middot; contact {org.contactName ?? "not set"}{org.contactRole ? `, ${org.contactRole}` : ""} &middot; {org.stripeCustomerId ? "paid through Stripe" : "manual deal"} &middot; {spent} of {org.seatsPurchased} {w.learners ? `${w.learners} ` : ""}places spent, {pupilsUsed} sitting in live {w.groups} &middot; created {day(org.createdAt)}
        {status === "active" && <> &middot; <span className="ad-chip trial">Trial, expires {day(org.trialExpiresAt)}</span></>}
        {status === "expired" && <> &middot; <span className="ad-chip expired">Trial ended {day(org.trialExpiresAt)}</span></>}
        {org.revokedAt && <> &middot; <span className="ad-chip expired">Access closed</span></>}
      </p>
      {org.school?.safeguardingContact && (
        <p className="ad-note">
          Safeguarding contact: {org.school.safeguardingContact}
          {org.school.childLineNumber ? ` · ${org.school.childLineNumber}` : ""}
        </p>
      )}

      <div className="ad-actions">
        <RevokeButton orgId={org.id} revoked={!!org.revokedAt} />
        {/* Only once access is closed. The gate is the closed state itself,
            not a dialog: see DeleteOrgButton. */}
        <DeleteOrgButton
          orgId={org.id}
          name={org.name}
          noun={w.Noun.toLowerCase()}
          backTo={w.back}
          closed={!!org.revokedAt}
          pupils={pupilsUsed}
          classes={classes.length}
        />
      </div>

      <PlacesControl orgId={org.id} places={org.seatsPurchased} spent={spent} learners={w.learners} />

      {/* Dates formatted here rather than in the browser, so staff and the
          server never disagree about which day a place was spent. */}
      <CreditPlaces
        orgId={org.id}
        learners={w.learners}
        places={creditable.map((p) => ({ id: p.id, spentOn: day(p.redeemedAt) }))}
      />

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>{w.group}</th><th>Course</th><th>Year</th><th>Pupils</th><th>Code</th><th>{w.lead === "teacher" ? "Teacher" : "Leader"}</th></tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td>
                <td>{courseName(c.product.slug, c.product.name)}</td>
                <td>{c.yearGroup ?? "—"}</td>
                <td>{c._count.pupils}</td>
                <td><code>{c.code}</code></td>
                <td>{c.teacher.name ?? c.teacher.email}</td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr><td colSpan={6} className="ad-empty">No {w.groups} yet - the first {w.lead} hasn&rsquo;t claimed their invite.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

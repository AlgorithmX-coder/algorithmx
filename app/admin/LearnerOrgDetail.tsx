import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { listClasses } from "@/app/lib/schoolClasses";
import { trialStatus } from "@/app/lib/orgTrial";
import { courseName, listCreditablePlaces, placesUsed } from "@/app/lib/schoolPlaces";
import { getOrgStats } from "@/app/lib/orgStats";
import { paidState, paidLabel } from "@/app/lib/paidState";
import { SchoolIcon, OrganisationIcon } from "./icons";
import RevokeButton from "./schools/[slug]/RevokeButton";
import DeleteOrgButton from "./DeleteOrgButton";
import PlacesControl from "./PlacesControl";
import CreditPlaces from "./CreditPlaces";
import StaffLinkCard from "./StaffLinkCard";
import { ensureStaffLink } from "@/app/lib/staffLink";

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

  /* Counts only. Nothing here reaches a named child or their progress:
     see the note on getOrgStats. */
  const stats = await getOrgStats(org.id);

  /* The school's one staff join link, so staff can hand it over when a
     lead asks how colleagues get in. Made here if the lead has not opened
     their overview yet, exactly as it would be there. */
  const staffLink = await ensureStaffLink(org.id);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "algorithmx.io";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const paid = paidState(org);
  const term = org.revokedAt
    ? "Access closed"
    : status === "active"
      ? `Trial, to ${day(org.trialExpiresAt)}`
      : status === "expired"
        ? `Trial ended ${day(org.trialExpiresAt)}`
        : "Licence";

  const tiles: { label: string; value: string; sub?: string }[] = [
    { label: "Places licensed", value: String(stats.placesLicensed), sub: `${stats.placesSpent} spent · ${stats.placesLeft} left` },
    {
      label: `${w.learners ? "Pupils" : "Learners"} added`,
      value: String(stats.pupilsInLiveClasses),
      sub: `${stats.pupilsStarted} have started a lesson`,
    },
    {
      label: w.groups.charAt(0).toUpperCase() + w.groups.slice(1),
      value: String(stats.classesLive),
      sub: stats.classesArchived > 0 ? `${stats.classesArchived} archived` : "none archived",
    },
    {
      label: "Courses in use",
      value: String(stats.courses.length),
      sub: stats.courses.length ? stats.courses.join(", ") : "none yet",
    },
    { label: "Term", value: term, sub: paidLabel(paid) },
    {
      label: "Last activity",
      value: stats.lastActivity ? day(stats.lastActivity) : "None",
      sub: stats.lastActivity ? "a pupil was in a lesson" : "nobody has started yet",
    },
  ];
  if (stats.placesHeldByLeavers > 0) {
    tiles.splice(1, 0, {
      label: "Held by leavers",
      value: String(stats.placesHeldByLeavers),
      sub: "places spent on pupils since removed",
    });
  }

  return (
    <div>
      <p className="ad-back"><Link href={w.back}>{w.backLabel}</Link></p>
      <span className={`ad-eyebrow ${w.eyebrow}`}>{isSchool ? <SchoolIcon /> : <OrganisationIcon />} {w.Noun}</span>
      <h1 className="ad-h1">{org.name}</h1>
      {/* Who they are. Every number that used to be crammed in here - places
          spent, pupils, the trial, paid or not - is a tile below, where it
          can be read at a glance instead of picked out of a sentence. */}
      <p className="ad-note">
        {org.sector ?? "sector not set"}
        {org.country ? ` · ${org.country}` : ""} &middot; contact {org.contactName ?? "not set"}{org.contactRole ? `, ${org.contactRole}` : ""} &middot; created {day(org.createdAt)}
        {org.revokedAt && <> &middot; <span className="ad-chip expired">Access closed</span></>}
      </p>
      {org.school?.safeguardingContact && (
        <p className="ad-note">
          Safeguarding contact: {org.school.safeguardingContact}
          {org.school.childLineNumber ? ` · ${org.school.childLineNumber}` : ""}
        </p>
      )}

      {/* The account at a glance, so staff stop having to read the run-on
          sentence above or count rows in the table below. Counts only. */}
      <div className="ad-stats">
        {tiles.map((t) => (
          <div key={t.label} className="ad-stat">
            <span className="ad-stat-label">{t.label}</span>
            {/* A count gets the big numeral; a phrase like "Trial, to 24 Nov
                2026" does not, or it wraps to three lines and drags its tile
                taller than every other one in the row. */}
            <b className={`ad-stat-value${/^\d+$/.test(t.value) ? "" : " is-text"}`}>{t.value}</b>
            {t.sub && <small className="ad-stat-sub">{t.sub}</small>}
          </div>
        ))}
      </div>

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

      {staffLink && (
        <StaffLinkCard
          link={`${proto}://${host}/schools/join/${staffLink.token}`}
          lockedTo={staffLink.lockedTo}
          staffs={isSchool ? "teachers" : "leaders"}
        />
      )}

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

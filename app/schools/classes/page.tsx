import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getSchoolContext, listArchivedClasses, listClasses } from "@/app/lib/schoolClasses";
import { getHeadContext } from "@/app/lib/schoolHead";
import { courseName, listSchoolCourses } from "@/app/lib/schoolPlaces";
import { trialStatus } from "@/app/lib/orgTrial";
import PortalShell from "@/app/components/school-portal/PortalShell";
import Locked from "../teach/Locked";
import TrialEnded from "../TrialEnded";
import AccessClosed from "../AccessClosed";
import NewClass from "./NewClass";
import SignOut from "../SignOut";
import { wordsFor } from "../words";

/**
 * A teacher's classes.
 *
 * The first screen of the school platform. The list comes first, because
 * going into a class is what a teacher does here nearly every time; making
 * one is a once-a-year job and sits underneath. A class with nobody in it
 * says so on its card, because adding pupils is the next job.
 *
 * Drawn in the light house (PortalShell, school-portal.css).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  /* Not "for schools": metadata runs before we know whether this is a
     school or a youth organisation, and two queries for a browser tab is
     not a trade worth making. Saying neither is true for both. */
  title: "Classes | AlgorithmX",
  /* a list of children's names is never indexed */
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClassesPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login?callbackUrl=%2Fschools%2Fclasses");
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;
  if (school.revokedAt) return <AccessClosed orgName={school.orgName} schools={school.schools} currentOrgId={school.orgId} />;
  if (trialStatus(school.trialExpiresAt) === "expired") {
    return <TrialEnded orgName={school.orgName} trialExpiresAt={school.trialExpiresAt!} schools={school.schools} currentOrgId={school.orgId} />;
  }

  const [classes, archived, courses, head] = await Promise.all([
    listClasses(school.orgId),
    /* Last year's. Listed quietly underneath rather than hidden, so a class
       archived by mistake can be found again, and so last year's work can
       still be read: that is the whole reason a class is archived rather
       than deleted. */
    listArchivedClasses(school.orgId),
    listSchoolCourses(school.kind),
    /* Only to decide whether to offer the overview link below. A teacher
       bouncing off a link they were shown is worse than no link. */
    getHeadContext(session.user.id),
  ]);
  const w = wordsFor(school.kind);
  const left = school.seatsPurchased - school.seatsUsed;
  /* A trial is not a small licence, and must never be described as one. */
  const onTrial = trialStatus(school.trialExpiresAt) === "active";
  const trialEnds = school.trialExpiresAt
    ? new Date(school.trialExpiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : null;
  const full = left <= 0;
  const usedPct = school.seatsPurchased > 0
    ? Math.min(100, Math.round((school.seatsUsed / school.seatsPurchased) * 100))
    : 100;
  /* Nothing at all yet: the make-a-class panel is the page. */
  const first = classes.length === 0 && archived.length === 0;
  const count = (n: number) => `${n} ${n === 1 ? w.person : w.people}`;

  return (
    <PortalShell
      nav={
        <>
          {head && <Link href="/schools/overview" className="sp-nav-a">{w.Noun} overview</Link>}
          <Link href="/schools/teach" className="sp-nav-a">{w.Staff} packs</Link>
          <SignOut className="sp-nav-a" />
        </>
      }
    >
      <header className="sp-head">
        <div className="copy">
          {/* The stored name exactly as the school gave it: never
              title-cased, never upper-cased. */}
          <span className="sp-eyebrow">
            <i />
            <span>{school.orgName}</span> &middot; <b>{w.Groups}</b>
            {onTrial && <b>&nbsp;&middot; Trial &middot; ends {trialEnds}</b>}
          </span>
          <h1>Your {w.groups}</h1>
        </div>
        <div className="sp-licence">
          <div className="big">
            {school.seatsUsed} of {school.seatsPurchased}
          </div>
          <div className="lab">{onTrial ? "trial places" : "places used"}</div>
          <div className="sp-bar" data-full={full ? "" : undefined} aria-hidden="true">
            <i style={{ width: `${usedPct}%` } as CSSProperties} />
          </div>
          <small data-full={full ? "" : undefined}>
            {full ? (onTrial ? "no places left" : "your licence is full") : `${left} left`}
          </small>
        </div>
      </header>

      {classes.length > 0 && (
        <section className="sp-grid" aria-label={`Your ${w.groups}`}>
          {classes.map((c) => {
            const n = c._count.pupils;
            return (
              <article key={c.id} className="sp-card" data-empty={n === 0 ? "" : undefined}>
                <Link href={`/schools/classes/${c.id}`} className="cname">
                  {c.name}
                </Link>
                <div className="sp-chips">
                  <span className="sp-chip">{courseName(c.product.slug, c.product.name)}</span>
                  {c.yearGroup ? <span className="sp-chip">{w.yearLabel} {c.yearGroup}</span> : null}
                </div>
                <div className="low">
                  <span className="meta"><b>{count(n)}</b></span>
                  <span className="sp-chip" data-kind="code">{c.code}</span>
                </div>
                {n === 0 && (
                  <div>
                    <Link href={`/schools/classes/${c.id}#add`} className="sp-pill">
                      Add {w.people}
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {archived.length > 0 && (
        <>
          <h2 className="sp-section-h">Last year</h2>
          <section className="sp-grid" aria-label="Last year">
            {archived.map((c) => (
              <article key={c.id} className="sp-card" data-ended="">
                <Link href={`/schools/classes/${c.id}`} className="cname">
                  {c.name}
                </Link>
                <div className="sp-chips">
                  <span className="sp-chip">{courseName(c.product.slug, c.product.name)}</span>
                  {c.yearGroup ? <span className="sp-chip">{w.yearLabel} {c.yearGroup}</span> : null}
                  <span className="sp-chip">{count(c._count.pupils)}</span>
                </div>
                <span className="meta">
                  Year ended{" "}
                  {c.archivedAt
                    ? new Date(c.archivedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </article>
            ))}
          </section>
          <p className="sp-small">
            Nobody in these can sign in. Open one to read the work, to move a {w.person} into a
            live {w.group}, or to put the {w.group} back.
          </p>
        </>
      )}

      <section className="sp-panel">
        <NewClass
          placesLeft={left}
          courses={courses}
          onTrial={onTrial}
          trialEnds={trialEnds}
          w={w}
          first={first}
          foot={
            <>
              Each {w.person} gets their own login card with the {w.group} code on it. They pick
              their name from the list and tap a picture password, so nobody has to remember an
              email address or type one.
            </>
          }
        />
      </section>

      <p className="sp-small">
        An account holds a {w.person}&rsquo;s name, a colour and a {w.group}. No date of birth, no
        email address, no photo, and nothing they have to remember except which picture comes
        first.
      </p>
    </PortalShell>
  );
}

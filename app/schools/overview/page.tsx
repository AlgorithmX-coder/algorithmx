import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getHeadContext, listClassRollUps, listStaff, listPendingInvites } from "@/app/lib/schoolHead";
import { getSchoolContext } from "@/app/lib/schoolClasses";
import { placesSummary } from "@/app/lib/schoolPlaces";
import { trialStatus } from "@/app/lib/orgTrial";
import { wordsFor } from "../words";
import Locked from "../teach/Locked";
import TrialEnded from "../TrialEnded";
import AccessClosed from "../AccessClosed";
import InviteStaff from "./InviteStaff";
import SignOut from "../SignOut";
import { SCHOOLS_EMAIL } from "@/app/lib/schoolOps";
import "./head.css";

/**
 * The head's portal.
 *
 * Whoever signed the licence had nowhere to go. They were sent to
 * `/schools/classes`, which is a teacher's screen: it answers "who in my
 * class is stuck" and answers none of the four questions the person paying
 * actually has.
 *
 *   1. How many places did I buy, and how many are left?
 *   2. Where did the ones I spent go?
 *   3. Who on my staff has access, and what are they running?
 *   4. Is this being used at all?
 *
 * In that order, because that is the order they are asked in, and because
 * question four is the one that decides whether they renew. It has to be
 * answerable in a glance in week three, not discovered in July.
 *
 * It is READ ONLY but for one write: adding a member of staff. A head
 * cannot see more about a child than that child's own teacher can, cannot
 * change anybody's progress, and cannot buy places from here. Buying more
 * is a conversation with us, so it is an email address, not a button that
 * would have to pretend to be a checkout.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview | AlgorithmX for schools",
  /* names of children, and of staff, are never indexed */
  robots: { index: false, follow: false, nocache: true },
};

/** One hue per course, carried through the bar and the class rows, so a
 *  head learns the colour once and then reads the bar without the key. */
const COURSE_HUE: Record<string, string> = {
  "cyber-heroes": "var(--c-heroes)",
  cyberexplorers: "var(--c-explorers)",
  cyberstart: "var(--c-ops)",
  "cyberstart-pro": "var(--c-pro)",
};

function day(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

/** "today", "yesterday", "3 days ago", then a date. A head reading a staleness
 *  column wants the gap, not an almanac. */
function ago(d: Date | null) {
  if (!d) return null;
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return day(d);
}

export default async function SchoolOverviewPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login?callbackUrl=%2Fschools%2Foverview");

  const head = await getHeadContext(session.user.id);
  if (!head) {
    /* A teacher rather than a head: send them to their own work. This is
       also what makes this route safe to use as the sign-in landing for
       everybody, so nobody has to know which URL is theirs. */
    const teacher = await getSchoolContext(session.user.id);
    if (teacher) redirect("/schools/classes");
    return <Locked email={session.user.email} />;
  }
  if (head.revokedAt) return <AccessClosed orgName={head.orgName} />;
  if (trialStatus(head.trialExpiresAt) === "expired") {
    return <TrialEnded orgName={head.orgName} trialExpiresAt={head.trialExpiresAt!} />;
  }

  const [places, classes, staff, invites] = await Promise.all([
    placesSummary(head.orgId, head.kind),
    listClassRollUps(head.orgId),
    listStaff(head.orgId),
    listPendingInvites(head.orgId),
  ]);

  const w = wordsFor(head.kind);
  const onTrial = trialStatus(head.trialExpiresAt) === "active";
  const pupilsNow = places.byCourse.reduce((n, c) => n + c.pupils, 0);
  /* A course belongs on the breakdown if places were spent on it OR a class
     is running it. Those differ now: a year group that has moved up still
     holds the places it spent on the course it came from, and that money
     should not vanish off the chart the day the last class on it is
     archived. */
  const running = places.byCourse.filter((c) => c.places > 0 || c.classes > 0);
  const anyActivity = classes.some((k) => k.lastSeen !== null);
  const lastSeen = classes.reduce<Date | null>(
    (best, k) => (k.lastSeen && (!best || k.lastSeen > best) ? k.lastSeen : best),
    null,
  );
  const weeksDone = classes.reduce((n, k) => n + k.weeksDone, 0);

  /* The bar is drawn against whichever is larger. On a licence that is what
     was bought, so the empty part of the bar is the headroom. If a trial
     granted nothing, the bar still has to add up to something, so it is
     drawn against what was spent. */
  const scale = Math.max(places.bought, places.redeemed, 1);
  const pct = (n: number) => `${(n / scale) * 100}%`;

  return (
    <div className="sxh">
      <header className="sxh-top">
        <div className="sxh-topin">
          <div className="sxh-id">
            <p className="sxh-eyebrow">
              AlgorithmX &middot; {head.kind === "ORGANISATION" ? "For organisations" : "For schools"}
            </p>
            <h1 className="sxh-org">{head.orgName}</h1>
          </div>
          <nav className="sxh-nav" aria-label="Elsewhere">
            <span className={`sxh-standing${onTrial ? " trial" : ""}`}>
              {onTrial
                ? `Trial, ends ${day(head.trialExpiresAt!)}`
                : `Licence, ${places.bought} place${places.bought === 1 ? "" : "s"}`}
            </span>
            <Link href="/schools/classes" className="sxh-navlink">
              {w.Groups}
            </Link>
            <Link href="/schools/teach" className="sxh-navlink">
              {w.Staff} packs
            </Link>
            <SignOut className="sxh-navlink" />
          </nav>
        </div>
      </header>

      <main className="sxh-main">
        {/* ── 1. THE PLACES ──────────────────────────────────────── */}
        <section className="sxh-sec" aria-labelledby="sxh-places-h">
          <h2 id="sxh-places-h" className="sxh-h2">Your places</h2>
          <p className="sxh-lede">
            A place is one {w.person} on one course. It is spent the moment a {w.staff} adds them,
            and it stays spent. It follows the {w.person}, so moving them between {w.groups} on the
            same course costs nothing more. Starting them on a different course next year uses
            another place.
          </p>

          <div className="sxh-figures">
            <div className="sxh-fig">
              <span className="sxh-fignum">{places.bought}</span>
              <span className="sxh-figlab">{onTrial ? "Places on trial" : "Places bought"}</span>
            </div>
            <div className="sxh-fig">
              <span className="sxh-fignum">{places.redeemed}</span>
              <span className="sxh-figlab">Spent</span>
            </div>
            <div className={`sxh-fig${places.available === 0 ? " warn" : ""}`}>
              <span className="sxh-fignum">{places.available}</span>
              <span className="sxh-figlab">Available</span>
            </div>
          </div>

          <div className="sxh-bar" role="img" aria-label={`${places.redeemed} of ${places.bought} places spent`}>
            {running.map((c) => (
              <span
                key={c.slug}
                className="sxh-barseg"
                style={{ width: pct(c.places), background: COURSE_HUE[c.slug] ?? "var(--c-heroes)" }}
              />
            ))}
            {places.inArchivedClasses > 0 && (
              <span className="sxh-barseg archived" style={{ width: pct(places.inArchivedClasses) }} />
            )}
            {places.leftTheSchool > 0 && (
              <span className="sxh-barseg left" style={{ width: pct(places.leftTheSchool) }} />
            )}
          </div>

          {places.redeemed === 0 ? (
            <p className="sxh-note">
              Nothing spent yet. A place goes when a {w.staff} adds a child to a {w.group}.
            </p>
          ) : (
            <ul className="sxh-key">
              {running.map((c) => (
                <li key={c.slug}>
                  <i style={{ background: COURSE_HUE[c.slug] ?? "var(--c-heroes)" }} />
                  <b>{c.places}</b> on {c.name}
                  <span className="sxh-keysub">
                    {c.classes} {c.classes === 1 ? w.group : w.groups}
                    {c.pupils !== c.places ? `, ${c.pupils} there now` : ""}
                  </span>
                </li>
              ))}
              {places.inArchivedClasses > 0 && (
                <li>
                  <i className="archived" />
                  <b>{places.inArchivedClasses}</b> in archived {w.groups}
                  <span className="sxh-keysub">last year, still theirs</span>
                </li>
              )}
              {places.leftTheSchool > 0 && (
                <li>
                  <i className="left" />
                  <b>{places.leftTheSchool}</b> spent on {w.people} who have left
                  <span className="sxh-keysub">
                    a mistake we can put right, email us
                  </span>
                </li>
              )}
              {/* Only ever non-zero for a school that was already running
                  before a place recorded which course it was for. Shown
                  rather than folded into another figure, because a number
                  that cannot be explained is worse than no number. */}
              {places.courseNotRecorded > 0 && (
                <li>
                  <i className="archived" />
                  <b>{places.courseNotRecorded}</b> spent before we recorded the course
                  <span className="sxh-keysub">still theirs, nothing to do</span>
                </li>
              )}
            </ul>
          )}

          {places.available === 0 && places.bought > 0 && (
            <div className="sxh-ask">
              <p>
                <b>Every place is spent.</b> Your {w.staffs} can still see everything they run, and
                cannot add another child until there are more.
              </p>
              <a className="sxh-btn sxh-btn-go" href={`mailto:${SCHOOLS_EMAIL}?subject=${encodeURIComponent(`More places for ${head.orgName}`)}`}>
                Ask about more places
              </a>
            </div>
          )}
        </section>

        {/* ── 2. IS IT BEING USED ────────────────────────────────── */}
        <section className="sxh-sec" aria-labelledby="sxh-use-h">
          <div className="sxh-sechead">
            <h2 id="sxh-use-h" className="sxh-h2">
              {w.Group === "Class" ? "Classes" : "Groups"}
            </h2>
            {anyActivity && (
              <p className="sxh-sechint">
                {weeksDone} week{weeksDone === 1 ? "" : "s"} finished across {pupilsNow}{" "}
                {w.people} &middot; last played {ago(lastSeen)}
              </p>
            )}
          </div>

          {classes.length === 0 ? (
            <div className="sxh-empty">
              <h3>No {w.groups} yet</h3>
              <p>
                Nothing has started, which at this stage is normal. One of your {w.staffs} makes a{" "}
                {w.group}, picks its course, and types in first names. Each child gets a login card
                with the {w.group} code on it.
              </p>
              <p className="sxh-emptyrow">
                <Link href="/schools/classes" className="sxh-btn sxh-btn-go">
                  Make the first {w.group}
                </Link>
                <span className="sxh-note">
                  You can do it yourself, or add a {w.staff} below and let them.
                </span>
              </p>
            </div>
          ) : (
            <div className="sxh-tablewrap">
              <table className="sxh-table">
                <thead>
                  <tr>
                    <th scope="col">{w.Group}</th>
                    <th scope="col">Course</th>
                    <th scope="col">{w.Staff}</th>
                    <th scope="col" className="num">{w.people === "pupils" ? "Pupils" : "People"}</th>
                    <th scope="col">Getting on</th>
                    <th scope="col">Last played</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((k) => {
                    const share = k.weeksPossible > 0 ? k.weeksDone / k.weeksPossible : 0;
                    const notStarted = k.pupils - k.started;
                    return (
                      <tr key={k.id}>
                        <th scope="row">
                          <Link href={`/schools/classes/${k.id}`}>{k.name}</Link>
                          {k.yearGroup !== null && (
                            <span className="sxh-sub">
                              {w.yearLabel} {k.yearGroup}
                            </span>
                          )}
                        </th>
                        <td>
                          <span className="sxh-course" style={{ "--hue": COURSE_HUE[k.courseSlug] ?? "var(--c-heroes)" } as React.CSSProperties}>
                            {k.courseName}
                          </span>
                        </td>
                        <td>{k.teacherName}</td>
                        <td className="num">{k.pupils}</td>
                        <td>
                          {k.pupils === 0 ? (
                            <span className="sxh-pill flat">Nobody added yet</span>
                          ) : k.started === 0 ? (
                            <span className="sxh-pill warn">Not started</span>
                          ) : (
                            <div className="sxh-prog">
                              <span className="sxh-progbar">
                                <span style={{ width: `${Math.min(100, share * 100)}%`, background: COURSE_HUE[k.courseSlug] ?? "var(--c-heroes)" }} />
                              </span>
                              <span className="sxh-progtext">
                                {k.weeksDone} of {k.weeksPossible} weeks
                                {notStarted > 0 && (
                                  <i className="sxh-progwarn">
                                    {notStarted} not started
                                  </i>
                                )}
                                {k.finished > 0 && (
                                  <i className="sxh-proggood">
                                    {k.finished} finished the course
                                  </i>
                                )}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>{ago(k.lastSeen) ?? <span className="sxh-dim">never</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 3. WHO HAS ACCESS ──────────────────────────────────── */}
        <section className="sxh-sec" aria-labelledby="sxh-staff-h">
          <div className="sxh-sechead">
            <h2 id="sxh-staff-h" className="sxh-h2">Who has access</h2>
            <p className="sxh-sechint">
              {staff.length} {staff.length === 1 ? "person" : "people"}
              {invites.length > 0 && ` · ${invites.length} invite${invites.length === 1 ? "" : "s"} open`}
            </p>
          </div>

          <div className="sxh-tablewrap">
            <table className="sxh-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col" className="num">{w.Group === "Class" ? "Classes" : "Groups"}</th>
                  <th scope="col" className="num">{w.people === "pupils" ? "Pupils" : "People"}</th>
                  <th scope="col">Since</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((p) => (
                  <tr key={p.userId}>
                    <th scope="row">
                      {p.name}
                      {p.isHead && <span className="sxh-pill head">Holds the licence</span>}
                    </th>
                    <td className="sxh-mono">{p.email ?? <span className="sxh-dim">none</span>}</td>
                    <td className="num">{p.classes}</td>
                    <td className="num">{p.pupils}</td>
                    <td>{day(p.joinedAt)}</td>
                  </tr>
                ))}
                {invites.map((i) => (
                  <tr key={i.id} className="sxh-pending">
                    <th scope="row">
                      <span className="sxh-dim">Not set up yet</span>
                      <span className="sxh-pill flat">Invited</span>
                    </th>
                    <td className="sxh-mono">{i.email}</td>
                    <td className="num">&mdash;</td>
                    <td className="num">&mdash;</td>
                    <td>{day(i.invitedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="sxh-h3">Add a {w.staff}</h3>
          <InviteStaff staffWord={w.staff} />
        </section>

        <footer className="sxh-foot">
          <p>
            Anything at all, write to{" "}
            <a href={`mailto:${SCHOOLS_EMAIL}`}>{SCHOOLS_EMAIL}</a>. A real person reads it.
          </p>
        </footer>
      </main>
    </div>
  );
}

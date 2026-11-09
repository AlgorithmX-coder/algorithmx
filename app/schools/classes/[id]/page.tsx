import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getSchoolContext, listClasses } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import Locked from "../../teach/Locked";
import AddPupils from "./AddPupils";
import ClassStrip from "./ClassStrip";
import ClassLink from "./ClassLink";
import SignOut from "../../SignOut";
import { wordsFor } from "../../words";
import { MILESTONES, getCertificateUrl } from "@/app/lib/certificates";
import { archiveClassAction, movePupilAction, removePupilAction, resetPicturesAction, unarchiveClassAction } from "../class.actions";

/**
 * One class: who is in it, how they are getting on, and the jobs a teacher
 * does mid-lesson.
 *
 * Ordered by who needs the teacher rather than alphabetically. A register is
 * in name order; this is a list of who to go and stand next to.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Class | AlgorithmX",
  robots: { index: false, follow: false, nocache: true },
};

/* The highest milestone a pupil has reached, or null. Same arithmetic as
   getAchievedMilestones: completed weeks counted against the milestone,
   not the furthest week touched. */
const CERT_WEEKS = [...MILESTONES].map((m) => m.week).sort((a, b) => b - a);

const WHEN = (d: Date | null) =>
  !d ? "" : new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/schools/login?callbackUrl=${encodeURIComponent(`/schools/classes/${id}`)}`);
  }
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;

  /* Scoped to this teacher's own school inside the query. A class id from
     another school comes back as not found, which is safer and also true. */
  const klass = await getClassProgress(school.orgId, id);
  if (!klass) notFound();

  /* Somewhere to move a child TO. Every live class in the school counts,
     including another teacher's, because that is what September is: a
     whole year group moving up at once. */
  const others = (await listClasses(school.orgId)).filter((c) => c.id !== id);

  const w = wordsFor(school.kind);
  /* The host as the browser asked for it, so the link on the board is the
     one the school actually uses rather than a domain in a config file. */
  const host = (await headers()).get("x-forwarded-host") ?? (await headers()).get("host") ?? "algorithmx.io";
  const left = school.seatsPurchased - school.seatsUsed;
  /* An archived class is last year's. Both pupil sign-in gates filter it
     out, so the code on the cards no longer works and nobody in it can get
     in. Everything below that depends on the class being live is hidden
     rather than left to fail quietly. */
  const archived = klass.archivedAt !== null;
  const endedOn = klass.archivedAt
    ? new Date(klass.archivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const waiting = klass.pupils.filter((p) => !p.signedIn).length;
  /* Cyber Heroes only: the milestones are its weeks, and a certificate
     saying "of 20 weeks" on an Explorers class would be a lie. */
  const certificateWeekFor = (done: number): number | null =>
    klass.courseSlug === "cyber-heroes" ? CERT_WEEKS.find((wk) => done >= wk) ?? null : null;

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">
              {school.orgName} &middot; <i>{klass.className}</i>
            </div>
            <div className="sub">
              {klass.courseName}
              {klass.yearGroup ? ` · ${w.yearLabel.toLowerCase()} ${klass.yearGroup}` : ""}
              {` · ${klass.pupils.length} ${klass.pupils.length === 1 ? w.person : w.people}`}
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href="/schools/classes" className="axbtn">All {w.groups}</Link>
            <Link href="/schools/teach" className="axbtn">{w.Staff} packs</Link>
            <SignOut />
          </div>
        </header>

        {archived ? (
          /* The board link and the code are hidden rather than greyed out,
             because neither works any more: both pupil gates filter an
             archived class, so the link opens on nothing and the code is
             refused. A dead link on a classroom board is worse than no
             link. */
          <div className="ended">
            <p style={{ margin: "0 0 9px" }}>
              <b>This {w.group}&rsquo;s year ended on {endedOn}.</b> Nobody in it can sign in any
              more and the {w.group} code has stopped working, which is what ending a year means.
              Nothing has been deleted: the names, the pictures they chose and every week they
              finished are all still here, and the places stay spent. You can still move a{" "}
              {w.person} into a live {w.group} below.
            </p>
            <form action={unarchiveClassAction}>
              <input type="hidden" name="classId" value={id} />
              <button type="submit" className="axbtn">Put this {w.group} back</button>
            </form>
          </div>
        ) : (
          <>
            <div className="board">
              <div className="boardsay">
                <h3>Put this on the board</h3>
                <p>
                  It opens straight on the list of names, so nobody has to type the {w.group} code.
                  Write it up, bookmark it once on the {w.group} machines, or send it home.
                </p>
              </div>
              <ClassLink host={host} code={klass.code} />
            </div>

            <p className="whatis">
              <b>The {w.group} code is <code className="axcode">{klass.code}</code>.</b> Children
              who arrive any other way type this, pick their name, and tap their picture password.
              The first time they sign in they choose that password, so there is nothing for you to
              set up beforehand.
            </p>
          </>
        )}

        {klass.pupils.length > 0 && (
          <div className="run">
            <div className={"leg" + (klass.notStarted ? " now" : "")}>
              <h5>Not started</h5>
              <div className="bignum">{klass.notStarted}</div>
            </div>
            <div className="leg play">
              <b>{klass.inProgress} part way through</b>
              <span>
                Sorted below by who needs you, not by name.<br />
                {waiting > 0
                  ? `${waiting} have not signed in yet.`
                  : "Everybody has signed in."}
              </span>
            </div>
            <div className="leg">
              <h5>All {klass.weeksCount} weeks</h5>
              <div className="bignum">{klass.finished}</div>
            </div>
          </div>
        )}

        {!archived && <AddPupils classId={id} placesLeft={left} w={w} />}

        {klass.pupils.length === 0 ? (
          <div className="sheet">
            <p className="lede" style={{ margin: 0 }}>
              Nobody in this {w.group} yet. Paste your register above, one first name per line.
            </p>
          </div>
        ) : (
          <div className="sheet">
            <div className="phase">
              The {w.group} &middot; {klass.pupils.length}{" "}
              {klass.pupils.length === 1 ? w.person : w.people}
            </div>
            {klass.pupils.map((p) => (
              <div key={p.id} className="row prow">
                <div className="rb">
                  {p.name}
                  <small className={p.signedIn ? "s-say" : "s-ask"}>
                    {!p.signedIn
                      ? "not signed in yet"
                      : p.currentWeek === null
                        ? "signed in, not started"
                        : `${p.weeksComplete} of ${klass.weeksCount} weeks · ${p.totalStars} stars`}
                  </small>
                </div>
                <div className="rs">
                  <ClassStrip pupil={p} weeksCount={klass.weeksCount} />
                  <small className="dim">
                    {p.currentWeek !== null ? `Week ${p.currentWeek}` : ""}
                    {p.lastSeen ? ` · last played ${WHEN(p.lastSeen)}` : ""}
                  </small>
                </div>
                <div className="rs pupilacts">
                  {/* The certificate this one has actually earned, if any.
                      /schools promises a school "certificates for every
                      pupil" and until now there was no way for a teacher to
                      get one at all: the only route to it was inside the
                      lesson player, at the moment a child finished a
                      milestone week, on the child's own screen. Cyber
                      Heroes only, because the milestones are its weeks.

                      It stays on an archived class on purpose: printing
                      last year's certificates in September is exactly when
                      a teacher wants them, and reading one changes
                      nothing. */}
                  {certificateWeekFor(p.weeksComplete) !== null && (
                    <a
                      className="axbtn"
                      href={getCertificateUrl(certificateWeekFor(p.weeksComplete)!, p.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Certificate
                    </a>
                  )}
                  {/* Mid-lesson jobs, so they go once the year has ended:
                      resetting pictures for a child who cannot sign in is
                      nothing, and Remove on last year's class is a way to
                      destroy the progress this class was kept for. Move
                      stays, because a teacher who archived before moving
                      the year group up still has to be able to. */}
                  {!archived && p.signedIn && (
                    <form action={resetPicturesAction}>
                      <input type="hidden" name="childProfileId" value={p.id} />
                      <input type="hidden" name="classId" value={id} />
                      <button type="submit" className="axbtn">Forgotten pictures</button>
                    </form>
                  )}
                  {others.length > 0 && (
                    <form action={movePupilAction} className="movebox">
                      <input type="hidden" name="childProfileId" value={p.id} />
                      <input type="hidden" name="classId" value={id} />
                      <select
                        name="toClassId"
                        defaultValue=""
                        aria-label={`Move ${p.name} to another ${w.group}`}
                      >
                        <option value="" disabled>
                          Move to&hellip;
                        </option>
                        {others.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.product.slug === klass.courseSlug ? "" : ` · ${c.product.name}`}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="axbtn">Move</button>
                    </form>
                  )}
                  {!archived && (
                    <form action={removePupilAction}>
                      <input type="hidden" name="childProfileId" value={p.id} />
                      <input type="hidden" name="classId" value={id} />
                      <button type="submit" className="revoke">Remove</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
            <p className="legend">
              <span className="pip done" /> finished
              <span className="pip in_progress" /> started
              <span className="pip not_started" /> not started
            </p>
          </div>
        )}

        {!archived && (
          <div className="endyear">
            <h4>End this {w.group}&rsquo;s year</h4>
            <p>
              Do this in July, once the {w.people} have moved up. It stops everybody in this{" "}
              {w.group} signing in and retires the {w.group} code, so move anyone carrying on into
              their new {w.group} first. Nothing is deleted and no place comes back: the work stays
              here to look at, and you can put the {w.group} back if you do it by mistake.
            </p>
            <form action={archiveClassAction}>
              <input type="hidden" name="classId" value={id} />
              <button type="submit" className="revoke">End the year for this {w.group}</button>
            </form>
          </div>
        )}

        <footer className="note">
          You can see how a {w.person} is getting on. You cannot change it: progress is written by
          them playing the week. Removing a {w.person} deletes their account and their progress
          with it, and <b>the place stays used</b>, so do it when somebody leaves the {w.noun}, not
          when they change {w.group} or when a name is spelled wrong.
        </footer>
      </div>
    </div>
  );
}

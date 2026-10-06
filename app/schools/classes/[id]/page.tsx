import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getSchoolContext } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import Locked from "../../teach/Locked";
import AddPupils from "./AddPupils";
import ClassStrip from "./ClassStrip";
import { removePupilAction, resetPicturesAction } from "../class.actions";

/**
 * One class: who is in it, how they are getting on, and the jobs a teacher
 * does mid-lesson.
 *
 * Ordered by who needs the teacher rather than alphabetically. A register is
 * in name order; this is a list of who to go and stand next to.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Class | Cyber Heroes for schools",
  robots: { index: false, follow: false, nocache: true },
};

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

  const left = school.seatsPurchased - school.seatsUsed;
  const waiting = klass.pupils.filter((p) => !p.signedIn).length;

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">
              Cyber <span>Heroes</span> &middot; <i>{klass.className}</i>
            </div>
            <div className="sub">
              {school.orgName}
              {klass.yearGroup ? ` · year ${klass.yearGroup}` : ""}
              {` · ${klass.pupils.length} pupil${klass.pupils.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href="/schools/classes" className="axbtn">All classes</Link>
            <Link href="/schools/teach" className="axbtn">Teacher packs</Link>
          </div>
        </header>

        <p className="whatis">
          <b>The class code is <code className="axcode">{klass.code}</code>.</b> It goes on every
          login card in this class. A child types it, picks their name, and taps their picture
          password. The first time they sign in they choose that password, so there is nothing for
          you to set up beforehand.
        </p>

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

        <AddPupils classId={id} placesLeft={left} />

        {klass.pupils.length === 0 ? (
          <div className="sheet">
            <p className="lede" style={{ margin: 0 }}>
              Nobody in this class yet. Paste your register above, one first name per line.
            </p>
          </div>
        ) : (
          <div className="sheet">
            <div className="phase">
              The class &middot; {klass.pupils.length} pupil{klass.pupils.length === 1 ? "" : "s"}
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
                  {p.signedIn && (
                    <form action={resetPicturesAction}>
                      <input type="hidden" name="childProfileId" value={p.id} />
                      <input type="hidden" name="classId" value={id} />
                      <button type="submit" className="axbtn">Forgotten pictures</button>
                    </form>
                  )}
                  <form action={removePupilAction}>
                    <input type="hidden" name="childProfileId" value={p.id} />
                    <input type="hidden" name="classId" value={id} />
                    <button type="submit" className="revoke">Remove</button>
                  </form>
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

        <footer className="note">
          You can see how a child is getting on. You cannot change it: progress is written by the
          child playing the week. Removing a pupil deletes their account and their progress with
          it, so do it when a child leaves the school, not when they change class.
        </footer>
      </div>
    </div>
  );
}

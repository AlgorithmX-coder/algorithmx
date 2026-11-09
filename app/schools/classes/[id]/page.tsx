import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getSchoolContext } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import Locked from "../../teach/Locked";
import AddPupils from "./AddPupils";
import ClassStrip from "./ClassStrip";
import ClassLink from "./ClassLink";
import SignOut from "../../SignOut";
import { wordsFor } from "../../words";
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
  title: "Class | AlgorithmX",
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

  const w = wordsFor(school.kind);
  /* The host as the browser asked for it, so the link on the board is the
     one the school actually uses rather than a domain in a config file. */
  const host = (await headers()).get("x-forwarded-host") ?? (await headers()).get("host") ?? "algorithmx.io";
  const left = school.seatsPurchased - school.seatsUsed;
  const waiting = klass.pupils.filter((p) => !p.signedIn).length;

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
          <b>The {w.group} code is <code className="axcode">{klass.code}</code>.</b> Children who
          arrive any other way type this, pick their name, and tap their picture
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

        <AddPupils classId={id} placesLeft={left} w={w} />

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
          You can see how a {w.person} is getting on. You cannot change it: progress is written by
          them playing the week. Removing a {w.person} deletes their account and their progress
          with it, and <b>the place stays used</b>, so do it when somebody leaves the {w.noun}, not
          when they change {w.group} or when a name is spelled wrong.
        </footer>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getSchoolContext, listClasses, planWholeClassMove } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import MoveWholeClass from "./MoveWholeClass";
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

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    move?: string;
    left?: string;
    bulk?: string;
    moved?: string;
    spent?: string;
  }>;
}) {
  const { id } = await params;
  /* How the last move went, handed back by movePupilAction. A plain form
     post has nowhere else to put an outcome, and a refused move that said
     nothing would read as the product being broken. The bulk move uses the
     same trick: `bulk` lands back on the class that did not move, `moved`
     and `spent` land on the one the children arrived in. */
  const {
    move,
    left: placesLeftAfterRefusal,
    bulk,
    moved: movedHere,
    spent: placesSpentMoving,
  } = await searchParams;

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

  /* The same September move, priced for the whole class at once. Worked out
     before anything is pressed, because a teacher finding out the cost of
     the twenty-ninth child after twenty-eight moves is how the one-at-a-time
     version failed. */
  const plan = await planWholeClassMove({ orgId: school.orgId, fromClassId: id });

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
            {/* The sheet to hand upwards. Offered even on an empty class,
                because the page it leads to says so itself, and offered on
                an archived one on purpose: the week after a year ends is
                exactly when somebody asks what the children did. */}
            <Link href={`/schools/classes/${id}/report`} className="axbtn">Report</Link>
            <Link href="/schools/classes" className="axbtn">All {w.groups}</Link>
            <Link href="/schools/teach" className="axbtn">{w.Staff} packs</Link>
            <SignOut />
          </div>
        </header>

        {move === "full" && (
          <p className="ended" role="alert">
            <b>That move needs another place and you have {placesLeftAfterRefusal ?? 0} left.</b>{" "}
            Moving a {w.person}{" "}
            to a {w.group} on a different course spends a place, because a place is one {w.person}{" "}
            on one course. Moving between {w.groups} on the same course is still free. To buy more,
            write to <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a>.
          </p>
        )}
        {move === "spent" && (
          <p className="ended" role="status">
            <b>Moved, and that used another place.</b> The new {w.group} runs a different course,
            and a place is one {w.person} on one course. They keep the course they were on as well.
          </p>
        )}

        {/* The whole-class move, landing on the class the children arrived
            in. Nothing else on this screen proves thirty moves happened, and
            a teacher who has just spent thirty places should be told so in
            the same breath. */}
        {movedHere && (
          <p className="ended" role="status">
            <b>
              {movedHere} {Number(movedHere) === 1 ? w.person : w.people} moved into this {w.group}.
            </b>{" "}
            {Number(placesSpentMoving) > 0
              ? `That used ${placesSpentMoving} more place${placesSpentMoving === "1" ? "" : "s"}, because this ${w.group} runs a different course and a place is one ${w.person} on one course. They keep the course they were on as well.`
              : `No extra places: this ${w.group} runs the same course they were already on.`}{" "}
            Their old {w.group} is empty now, so end its year when you are ready.
          </p>
        )}
        {bulk === "full" && (
          <p className="ended" role="alert">
            <b>
              Moving this whole {w.group} needs more places than you have left (
              {placesLeftAfterRefusal ?? 0}).
            </b>{" "}
            Nobody was moved: it is all or nothing, so you cannot end up with half the {w.group} on
            a course you have not paid for. To buy more places, write to{" "}
            <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a>.
          </p>
        )}
        {bulk === "failed" && (
          <p className="ended" role="alert">
            <b>That {w.group} could not be moved.</b> The {w.group} you picked may have had its year
            ended since this page loaded. Try again.
          </p>
        )}
        {move === "failed" && (
          <p className="ended" role="alert">
            <b>That {w.person} could not be moved.</b> The {w.group} you picked may have had its
            year ended since this page loaded. Try again.
          </p>
        )}

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
            <div className="classboard">
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
              set up beforehand.{" "}
              {/* The way out of reading a seven character code aloud to
                  thirty children. Offered here rather than buried in the
                  header, next to the code it replaces. */}
              {klass.pupils.length > 0 && (
                <>
                  Or{" "}
                  <Link href={`/schools/classes/${id}/cards`}>
                    print a login card for each {w.person}
                  </Link>{" "}
                  and hand them out.
                </>
              )}
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
            {/* Cyber Pro cannot say who has finished. Working that out needs
                the list of topics in each module, which lives in the Pro
                lesson manifests, and those import client components so a
                server page cannot read them. A box reading 0 for ever is
                worse than no box. */}
            {klass.tracksWeeks && (
              <div className="leg">
                <h5>All {klass.weeksCount} weeks</h5>
                <div className="bignum">{klass.finished}</div>
              </div>
            )}
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
                      : p.pro
                        ? p.pro.topics === 0
                          ? "signed in, not started"
                          : `${p.pro.topics} topic${p.pro.topics === 1 ? "" : "s"} done · ${p.pro.modules} module${p.pro.modules === 1 ? "" : "s"}`
                        : p.currentWeek === null
                          ? "signed in, not started"
                          : `${p.weeksComplete} of ${klass.weeksCount} weeks · ${p.totalStars} stars`}
                  </small>
                </div>
                <div className="rs">
                  {/* Pips are weeks, and Cyber Pro has none: it records a row
                      per topic completed instead. Drawing the strip for a Pro
                      group gave twenty empty pips that never filled, which
                      read as a broken product rather than as a different
                      shape of course. */}
                  {klass.tracksWeeks && <ClassStrip pupil={p} weeksCount={klass.weeksCount} />}
                  <small className="dim">
                    {klass.tracksWeeks && p.currentWeek !== null ? `Week ${p.currentWeek}` : ""}
                    {p.lastSeen ? `${klass.tracksWeeks && p.currentWeek !== null ? " · " : ""}last worked ${WHEN(p.lastSeen)}` : ""}
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
                        {/* A different course costs a place, so the option
                            says so before it is chosen rather than after.
                            Naming the course alone was not enough: it reads
                            as information, not as a price. */}
                        {others.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.product.slug === klass.courseSlug
                              ? ""
                              : ` · ${c.product.name}, uses a place`}
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
            {klass.tracksWeeks ? (
              <p className="legend">
                <span className="pip done" /> finished
                <span className="pip in_progress" /> started
                <span className="pip not_started" /> not started
              </p>
            ) : (
              <p className="legend">
                {klass.courseName} records each topic finished rather than a week at a time, so
                this {w.group} shows topics and modules instead of a row of weeks.
              </p>
            )}
          </div>
        )}

        {/* SEPTEMBER. One decision about a whole year group, priced before
            it is made. Offered on an archived {w.group} too, because the
            ordinary case is a {w.group} whose year was ended in July and
            whose children are moving up now. */}
        {plan && <MoveWholeClass classId={id} plan={plan} w={w} />}

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
          <br />
          A place is one {w.person} on one course. Moving them to another {w.group} on{" "}
          <b>this</b> course is free. Moving them to a {w.group} on a <b>different</b> course uses
          another place, and they keep the course they were on as well.
        </footer>
      </div>
    </div>
  );
}

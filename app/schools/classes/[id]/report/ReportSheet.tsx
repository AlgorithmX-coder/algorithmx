import { MILESTONES } from "@/app/lib/certificates";
import type { ClassProgress, PupilProgress } from "@/app/lib/classProgress";
import type { SchoolWords } from "../../../words";

/**
 * The report itself: everything that lands on the paper.
 *
 * Separated from the page for the same reason as the login-card sheet. The
 * page's job is the gate and the query, which cannot be looked at; this is
 * the part that has to be LOOKED at, on screen and on paper, and keeping it
 * props-in means it can be rendered with made-up names and checked without
 * a database behind it.
 *
 * IT CLAIMS NOTHING IT CANNOT SHOW. Every figure is counted from weeks the
 * children actually finished. No grade, no predicted level, no benchmark
 * against other schools: we hold none of those, and a report that implies
 * them is worse than no report at all.
 */
const DAY = (d: Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const SHORT = (d: Date | null) =>
  !d ? "Never" : new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/* Highest milestone first, so the first one a child clears is the one
   named. Cyber Heroes only: the other courses have no milestones, and a
   column of blanks reads as a failure rather than as "not applicable". */
const CERTS = [...MILESTONES].sort((a, b) => b.week - a.week);

function certificateFor(weeksComplete: number): string | null {
  return CERTS.find((m) => weeksComplete >= m.week)?.title ?? null;
}

export default function ReportSheet({
  klass,
  orgName,
  w,
  printedOn,
}: {
  klass: ClassProgress;
  orgName: string;
  w: SchoolWords;
  /** Passed in rather than read here, so a preview can pin it. */
  printedOn: Date;
}) {
  const isPro = !klass.tracksWeeks;
  const ended = klass.archivedAt !== null;
  const heroes = klass.courseSlug === "cyber-heroes";

  /* Register order. The class page sorts by who needs the teacher, which is
     right for a lesson and wrong for a document: a head reads down a list
     of names. */
  const pupils = [...klass.pupils].sort((a, b) => a.name.localeCompare(b.name));

  const lastWorked = pupils.reduce<Date | null>(
    (latest, p) => (p.lastSeen && (!latest || p.lastSeen > latest) ? p.lastSeen : latest),
    null,
  );

  const started = (p: PupilProgress) => (isPro ? (p.pro?.topics ?? 0) > 0 : p.currentWeek !== null);
  const finished = (p: PupilProgress) => !isPro && p.weeksComplete >= klass.weeksCount;
  const weeksDone = pupils.reduce((n, p) => n + p.weeksComplete, 0);
  const topicsDone = pupils.reduce((n, p) => n + (p.pro?.topics ?? 0), 0);
  const averageWeeks = pupils.length ? (weeksDone / pupils.length).toFixed(1) : "0";

  return (
    <div className="sheet">
      <header className="head">
        <p className="eyebrow">
          {orgName} &middot; {ended ? "End of course report" : "Progress report"}
        </p>
        <h1>
          {klass.className}
          {klass.yearGroup ? `, ${w.yearLabel.toLowerCase()} ${klass.yearGroup}` : ""}
          {": "}
          {klass.courseName}
        </h1>
        <p className="meta">
          <b>{pupils.length}</b> {pupils.length === 1 ? w.person : w.people}
          {" · Ran from "}
          <b>{DAY(klass.startedOn)}</b>
          {klass.archivedAt ? (
            <>
              {" to "}
              <b>{DAY(klass.archivedAt)}</b>
            </>
          ) : (
            ", still running"
          )}
          {lastWorked ? (
            <>
              {" · Last worked on "}
              <b>{DAY(lastWorked)}</b>
            </>
          ) : null}
          <br />
          {"Printed "}
          {DAY(printedOn)}
          {!isPro && (
            <>
              {" · Average "}
              <b>
                {averageWeeks} of {klass.weeksCount}
              </b>
              {" weeks finished"}
            </>
          )}
        </p>
      </header>

      {/* Numbers, not bars. A bar on paper costs ink and guesses at a scale
          nobody asked for. */}
      <div className="nums">
        <div className="num">
          <b>{pupils.length}</b>
          <span>{pupils.length === 1 ? w.person : w.people} on the course</span>
        </div>
        {isPro ? (
          <div className="num">
            <b>{topicsDone}</b>
            <span>topics finished between them</span>
          </div>
        ) : (
          <div className="num">
            <b>{klass.finished}</b>
            <span>finished all {klass.weeksCount} weeks</span>
          </div>
        )}
        <div className="num">
          <b>{pupils.filter((p) => started(p) && !finished(p)).length}</b>
          <span>part way through</span>
        </div>
        <div className="num">
          <b>{pupils.filter((p) => !started(p)).length}</b>
          <span>have not started</span>
        </div>
      </div>

      <h2>Every {w.person}, in register order</h2>
      {/* The table scrolls inside this box on a phone rather than pushing
          the page sideways. On paper the box does nothing. */}
      <div className="tablewrap">
        {isPro ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="n">Topics finished</th>
                <th className="n">Modules started</th>
                <th className="n">Last worked on</th>
              </tr>
            </thead>
            <tbody>
              {pupils.map((p) => (
                <tr key={p.id}>
                  <td className="name">{p.name}</td>
                  <td className="n">{p.pro?.topics ?? 0}</td>
                  <td className="n">{p.pro?.modules ?? 0}</td>
                  <td className="n dim">{SHORT(p.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="n">Weeks finished</th>
                <th className="n">Furthest week</th>
                <th className="n">Last worked on</th>
                {heroes && <th>Certificate earned</th>}
              </tr>
            </thead>
            <tbody>
              {pupils.map((p) => (
                <tr key={p.id}>
                  <td className="name">{p.name}</td>
                  <td className="n">
                    {p.weeksComplete} of {klass.weeksCount}
                  </td>
                  <td className="n dim">{p.currentWeek ?? "Not started"}</td>
                  <td className="n dim">{SHORT(p.lastSeen)}</td>
                  {heroes && <td className="dim">{certificateFor(p.weeksComplete) ?? ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* What the numbers mean, said plainly, because this sheet is read by
          somebody who has never seen the product. */}
      <div className="notes">
        {isPro ? (
          <p>
            Cyber Pro is taught in topics rather than weeks, so this report counts topics finished
            and modules started. It does not say who has finished the course: that needs the full
            topic list for each module, which this report cannot read, and a number nobody can
            check is worse than no number.
          </p>
        ) : (
          <p>
            A week counts as finished when the {w.person} completes its last activity. The furthest
            week is the highest one they have opened, finished or not.
          </p>
        )}
        {heroes && (
          <p>
            Certificates are earned at weeks 5, 10, 15 and 20. The one shown is the highest
            reached. Print any of them from the {w.group} page.
          </p>
        )}
        <p>
          Every figure here is counted from work the {w.people} did in the course. This report
          carries no grade, no predicted level and no comparison with other {w.noun}s, because
          AlgorithmX does not hold those.
        </p>
        <p>
          {orgName} &middot; {klass.className} &middot; {klass.courseName} &middot; AlgorithmX
        </p>
      </div>
    </div>
  );
}

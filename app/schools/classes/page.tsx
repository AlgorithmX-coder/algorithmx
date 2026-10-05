import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getSchoolContext, listClasses } from "@/app/lib/schoolClasses";
import Locked from "../teach/Locked";
import NewClass from "./NewClass";

/**
 * A teacher's classes.
 *
 * The first screen of the school platform: make a class, see how many places
 * the licence has left, and go into one to add children.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classes | Cyber Heroes for schools",
  /* a list of children's first names is never indexed */
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClassesPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login?callbackUrl=%2Fschools%2Fclasses");
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;

  const classes = await listClasses(school.orgId);
  const left = school.seatsPurchased - school.seatsUsed;

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Cyber <span>Heroes</span> &middot; <i>Classes</i></div>
            <div className="sub">
              {school.orgName} &middot; {school.seatsUsed} of {school.seatsPurchased} places used
              {left <= 0
                ? " · your licence is full"
                : left <= 5 ? ` · ${left} left` : ""}
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href="/schools/teach" className="axbtn">Teacher packs</Link>
          </div>
        </header>

        <p className="whatis">
          <b>Make a class, then add your pupils by first name.</b> Each child gets their own login
          card with the class code on it. They pick their name from the list and tap a picture
          password, so nobody has to remember an email address or type one.
        </p>

        <NewClass placesLeft={left} />

        {classes.length === 0 ? (
          <div className="sheet">
            <p className="lede" style={{ margin: 0 }}>
              No classes yet. Make the first one above, and you can add the children straight after.
            </p>
          </div>
        ) : (
          <div className="sheet">
            <div className="phase">Your classes</div>
            {classes.map((c) => (
              <div key={c.id} className="row">
                <span className="rn">{c.yearGroup ?? ""}</span>
                <div className="rb">
                  <Link href={`/schools/classes/${c.id}`}>{c.name}</Link>
                  <small className="s-say">
                    {c._count.pupils} pupil{c._count.pupils === 1 ? "" : "s"}
                  </small>
                </div>
                <div className="rs">
                  <p>
                    Class code <code className="axcode">{c.code}</code>
                    {c.teacher.name ? ` · made by ${c.teacher.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="note">
          A pupil account holds a first name, a colour and a class. No surname, no date of birth,
          no email address, and nothing a child has to remember except which picture comes first.
        </footer>
      </div>
    </div>
  );
}

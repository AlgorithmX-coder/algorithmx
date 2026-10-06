import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getSchoolContext, listPupils } from "@/app/lib/schoolClasses";
import Locked from "../../teach/Locked";
import AddPupils from "./AddPupils";
import { removePupilAction, resetPicturesAction } from "../class.actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Class | Cyber Heroes for schools",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/schools/login?callbackUrl=${encodeURIComponent(`/schools/classes/${id}`)}`);
  }
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;

  /* Scoped to the school in the same query: a class id from another school
     comes back as not found rather than as a permission error, which is both
     safer and the truth from this teacher's point of view. */
  const klass = await prisma.class.findFirst({
    where: { id, orgId: school.orgId, archivedAt: null },
    select: { id: true, name: true, yearGroup: true, code: true },
  });
  if (!klass) notFound();

  const pupils = await listPupils(school.orgId, klass.id);
  const left = school.seatsPurchased - school.seatsUsed;
  const waiting = pupils.filter((p) => !p.user.hashedPassword).length;

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">
              Cyber <span>Heroes</span> &middot; <i>{klass.name}</i>
            </div>
            <div className="sub">
              {school.orgName}
              {klass.yearGroup ? ` · year ${klass.yearGroup}` : ""}
              {` · ${pupils.length} pupil${pupils.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href="/schools/classes" className="axbtn">All classes</Link>
            <Link href="/schools/teach" className="axbtn">Teacher packs</Link>
          </div>
        </header>

        <p className="whatis">
          <b>The class code is <code className="axcode">{klass.code}</code>.</b> It goes on every
          login card in this class. A child types it, picks their name from the list, and taps
          their picture password. The first time they sign in they choose that password, so there
          is nothing for you to set up and nothing for them to remember beforehand.
        </p>

        <AddPupils classId={klass.id} placesLeft={left} />

        {pupils.length === 0 ? (
          <div className="sheet">
            <p className="lede" style={{ margin: 0 }}>
              Nobody in this class yet. Paste your register above, one first name per line.
            </p>
          </div>
        ) : (
          <div className="sheet">
            <div className="phase">
              {pupils.length} pupil{pupils.length === 1 ? "" : "s"}
              {waiting > 0 ? ` · ${waiting} have not signed in yet` : ""}
            </div>
            {pupils.map((p) => (
              <div key={p.id} className="row">
                <span className="rn" />
                <div className="rb">
                  {p.name}
                  <small className={p.user.hashedPassword ? "s-say" : "s-ask"}>
                    {p.user.hashedPassword ? "signed in" : "not signed in yet"}
                  </small>
                </div>
                <div className="rs">
                  <div className="pupilacts">
                    {/* A child who has forgotten their pictures needs to be
                        back in the lesson in seconds, so this is one click
                        and no confirmation. */}
                    {p.user.hashedPassword && (
                      <form action={resetPicturesAction}>
                        <input type="hidden" name="childProfileId" value={p.id} />
                        <input type="hidden" name="classId" value={klass.id} />
                        <button type="submit" className="axbtn">Forgotten pictures</button>
                      </form>
                    )}
                    <form action={removePupilAction}>
                      <input type="hidden" name="childProfileId" value={p.id} />
                      <input type="hidden" name="classId" value={klass.id} />
                      <button type="submit" className="revoke">Remove</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="note">
          Removing a pupil deletes their account and their progress with it. Do it when a child
          leaves the school, not when they change class.
        </footer>
      </div>
    </div>
  );
}

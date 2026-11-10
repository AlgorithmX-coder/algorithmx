import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getTeacherContext } from "@/app/lib/schoolAccess";
import { listClasses } from "@/app/lib/schoolClasses";
import { courseName } from "@/app/lib/schoolPlaces";
import { WEEK_CONTENT, getAvailableWeeks } from "@/app/lesson/weekContent";
import { listShareLinks } from "@/app/lib/packShare";
import { writtenWeeks } from "./packs";
import { plain } from "./packs/text";
import Locked from "./Locked";
import SharePanel from "./SharePanel";
import SignOut from "../SignOut";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teacher packs | Cyber Heroes",
  robots: { index: false, follow: false },
};

export default async function TeachIndexPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login?callbackUrl=%2Fschools%2Fteach");
  const ctx = await getTeacherContext(session.user.id);
  if (!ctx) return <Locked email={session.user.email} />;

  const ready = new Map(writtenWeeks().map((p) => [p.n, p]));
  const links = await listShareLinks(ctx.orgId);

  /* Which OTHER courses this school actually runs. Packs exist for Cyber
     Heroes alone, and a teacher who runs an Explorers class should be
     told that here rather than left to work it out from a page headed
     with somebody else's course. Read from their own classes so the
     line names their courses rather than disclaiming in general. */
  const otherCourses = Array.from(
    new Set(
      (await listClasses(ctx.orgId))
        .filter((c) => c.product.slug !== "cyber-heroes")
        .map((c) => courseName(c.product.slug, c.product.name)),
    ),
  ).sort();

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Cyber <span>Heroes</span> &middot; <i>Teacher packs</i></div>
            <div className="sub">
              {ctx.orgName} &middot; ages 6&ndash;9 &middot; one pack per week, for the adult at the
              front of the room
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href="/schools/classes" className="axbtn">Classes</Link>
            <SignOut />
          </div>
        </header>

        <p className="whatis">
          <b>Each pack is one lesson.</b> Ten minutes with you, forty five on the computers where
          the game teaches and tests them, then ten minutes talking it through. The pack gives you
          the board to put on the screen, the script to read from, and a sheet you can print.
        </p>

        {otherCourses.length > 0 && (
          <p className="whatis packswarn">
            <b>These packs are for Cyber Heroes.</b> You also run{" "}
            {otherCourses.length === 1
              ? otherCourses[0]
              : `${otherCourses.slice(0, -1).join(", ")} and ${otherCourses[otherCourses.length - 1]}`}
            , and there are no packs for{" "}
            {otherCourses.length === 1 ? "that course" : "those courses"} yet. The weeks themselves
            are live and the children can play them; it is the adult-facing pack that is still
            being written.
          </p>
        )}

        <SharePanel
          weeks={writtenWeeks().map((p) => ({ n: p.n, title: plain(p.title) }))}
          links={links}
        />

        <div className="sheet">
          <div className="phase">Ready to teach</div>
          {writtenWeeks().map((p) => (
            <div key={p.n} className="row">
              <span className="rn">{p.n}</span>
              <div className="rb">
                <Link href={`/schools/teach/${p.n}`}>{plain(p.title)}</Link>
                <small className="s-say">{plain(p.sub)}</small>
              </div>
              <div className="rs">
                <p>
                  {p.slides.length} slides. {p.brief ? "Carries a briefing to read before you teach it. " : ""}
                  Games: {plain(p.games)}.
                </p>
              </div>
            </div>
          ))}

          {/* The remaining weeks, named from the course itself rather than from
              a second list here that could drift out of step with it. */}
          <div className="phase">Being written</div>
          {getAvailableWeeks().filter((n) => !ready.has(n)).map((n) => (
            <div key={n} className="row">
              <span className="rn">{n}</span>
              <div className="rb">{WEEK_CONTENT[n].title}</div>
              <div className="rs">
                <p>The week itself is live and the children can play it. The teacher pack for it is not written yet.</p>
              </div>
            </div>
          ))}
        </div>

        <footer className="note">
          Every pack mirrors the week the children actually play, so the words on your board are
          the words on their screens.
        </footer>
      </div>
    </div>
  );
}

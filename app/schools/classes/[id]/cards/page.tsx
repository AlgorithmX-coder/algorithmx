import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getSchoolContext } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import Locked from "../../../teach/Locked";
import { wordsFor } from "../../../words";
import CardSheet from "./CardSheet";
import PrintButton from "./PrintButton";
import "./cards.css";

/**
 * Login cards: a sheet to print, cut up and hand out.
 *
 * THE PROBLEM THIS SOLVES. A teacher reads a seven character code off a
 * screen to thirty children, spelling it twice, while the ones who typed it
 * wrong put their hands up. The class link removed the typing for anyone on
 * a class machine, and this removes it for everybody else: the address is on
 * the card, in the child's hand, with their own name at the top of it.
 *
 * NOTHING SECRET IS PRINTED. A card carries a first name, the class address
 * and what to tap. It does not carry the picture password, cannot be made to
 * carry it, and does not hint at it: the pictures are stored hashed and the
 * child chooses them on first sign-in. A sheet of these left on a desk gives
 * away a first name and a code that was on the board all lesson.
 *
 * It is a page rather than a PDF on purpose. Every school machine can print
 * a web page, the browser's own dialog is the one teachers already know, and
 * nothing has to be generated, stored or cleaned up afterwards. The print
 * rules live in cards.css.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login cards | AlgorithmX",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ who?: string }>;
}) {
  const { id } = await params;
  /* Mid-year, a teacher wants the three children who joined in January, not
     another thirty cards for the ones who are already in. */
  const { who } = await searchParams;
  const onlyNew = who === "new";

  // GATE
  /* The same gate as the class page itself, re-checked here rather than
     assumed. This is a list of children's first names: the page that drew
     the link to it is not a gate on it. */
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/schools/login?callbackUrl=${encodeURIComponent(`/schools/classes/${id}/cards`)}`);
  }
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;

  /* Scoped to this teacher's own school inside the query, so a class id from
     another school comes back as not found. */
  const klass = await getClassProgress(school.orgId, id);
  if (!klass) notFound();

  const w = wordsFor(school.kind);
  const host =
    (await headers()).get("x-forwarded-host") ?? (await headers()).get("host") ?? "algorithmx.io";
  const archived = klass.archivedAt !== null;

  const everyone = klass.pupils;
  /* Alphabetical here, unlike the class page. That page is a list of who to
     go and stand next to; this is a stack of cards to hand out down a
     register, and a register is in name order. */
  const shown = [...(onlyNew ? everyone.filter((p) => !p.signedIn) : everyone)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const waiting = everyone.filter((p) => !p.signedIn).length;
  const link = `${host}/c/${klass.code}`;

  return (
    <div className="axcards">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">
              {school.orgName} &middot; <i>{klass.className}</i>
            </div>
            <div className="sub">
              Login cards &middot; {klass.courseName}
              {klass.yearGroup ? ` · ${w.yearLabel.toLowerCase()} ${klass.yearGroup}` : ""}
            </div>
          </div>
          <div className="modes" role="group" aria-label="Elsewhere">
            <Link href={`/schools/classes/${id}`} className="axbtn">
              Back to the {w.group}
            </Link>
            {!archived && shown.length > 0 && <PrintButton />}
          </div>
        </header>

        {archived ? (
          /* An archived class's code is refused at both pupil gates, so a
             card printed from one would send a child to a page that turns
             them away. Better to print nothing than to hand out thirty
             dead cards. */
          <p className="none">
            <b>This {w.group}&rsquo;s year has ended, so there are no cards to print.</b>
            The {w.group} code has stopped working and nobody in it can sign in, which is what
            ending a year means. Put the {w.group} back from its own page and the cards work
            again.
          </p>
        ) : everyone.length === 0 ? (
          <p className="none">
            <b>Nobody is in this {w.group} yet.</b>
            Paste your register into the {w.group} page and the cards appear here.
          </p>
        ) : (
          <>
            <div className="how">
              <h3>Print, cut along the dashed lines, hand them out</h3>
              <p>
                Ten cards to a sheet. Each one has the {w.person}&rsquo;s name on it and the
                address that opens straight on the list of names, so nothing has to be typed and
                nobody has to remember the code.
              </p>
              <p>
                <b>There is no password on a card.</b> The first time a {w.person} signs in they
                choose three pictures themselves, and only they know them. If one forgets, clear
                their pictures from the {w.group} page and they choose again.
              </p>
              <p>
                The {w.group} code is <code>{klass.code}</code>, for anyone who arrives the long
                way round.
              </p>
            </div>

            <div className="modes noprint" role="group" aria-label="Which cards">
              <Link
                href={`/schools/classes/${id}/cards`}
                className={"axbtn" + (onlyNew ? "" : " on")}
              >
                All {everyone.length}
              </Link>
              <Link
                href={`/schools/classes/${id}/cards?who=new`}
                className={"axbtn" + (onlyNew ? " on" : "")}
              >
                Not signed in yet ({waiting})
              </Link>
            </div>

            {shown.length === 0 ? (
              <p className="none">
                <b>Everybody in this {w.group} has signed in already.</b>
                There are no new cards to print. Switch to all {everyone.length} if somebody has
                lost theirs.
              </p>
            ) : (
              <CardSheet
                pupils={shown.map((p) => ({ id: p.id, name: p.name }))}
                link={link}
                className={klass.className}
                courseName={klass.courseName}
                code={klass.code}
                groupWord={w.Group}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
